import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { readPackageJSON, type PackageJson } from 'pkg-types'
import { packageIsInstalled } from '../utils/meta'
import type { CapacitorConfig } from '@capacitor/cli'
import defu from 'defu'
import { withLeadingSlash, withoutTrailingSlash } from 'ufo'
import { existsSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { consola } from 'consola'
import { execSync } from 'node:child_process'
import {
  addCodeTemplates,
  createCapacitorTsConfig,
  hasAnyCapacitorConfigFile,
  loadCapacitorConfigFile,
  upsertCapacitorJsonConfig,
} from '../utils/capacitor'
import { patchElectronPackageJson } from '../utils/electron'

type CapConfig = CapacitorConfig & {
  electron?: {
    customUrlScheme?: string
    backgroundColor?: string
    trayIconAndMenuEnabled?: boolean
    safeDomains?: string[]
    [key: string]: unknown
  }
}
interface NuxtCapacitorOptions {
  autoSync?: boolean
  output?: 'json' | 'ts'
  config?: CapConfig
}

declare module '@nuxt/schema' {
  interface NuxtOptions {
    capacitor: NuxtCapacitorOptions
  }
}

const name = 'nuxt-capacitor'

export default defineNuxtModule<NuxtCapacitorOptions>({
  meta: {
    name,
    configKey: 'capacitor',
  },
  defaults: {
    autoSync: true,
    output: 'json',
    config: {
      appId: 'com.example.app',
      appName: 'Nuxt Capacitor',
    },
  },
  async setup(_options, nuxt) {
    const logger = consola.create({ defaults: { tag: name } })

    if (nuxt.options.dev) {
      const devHost = nuxt.options.devServer.host
      if (!devHost) {
        logger.warn('devServer.host is not set. This may cause issues with Capacitor. set with --host=0.0.0.0')
      }
      else if (devHost !== '0.0.0.0') {
        logger.warn('devServer.host is not set to 0.0.0.0. This may cause issues with Capacitor. Set with --host=0.0.0.0')
      }
    }

    const thisModuleDir = join(createResolver(import.meta.url).resolve('.'), '..')
    const rootDir = nuxt.options.rootDir
    const distPath = '.output/public'

    const meta = await readPackageJSON(rootDir).catch(() => ({} as PackageJson))
    const projectPkg = new Set([
      ...Object.keys(meta.dependencies ?? {}),
      ...Object.keys(meta.devDependencies ?? {}),
    ])

    if (!projectPkg.has('@capacitor/cli') && !(await packageIsInstalled('@capacitor/cli'))) {
      throw new Error('@capacitor/cli is not installed.')
    }

    nuxt.options.capacitor = defu(nuxt.options.capacitor, _options)

    // Load and merge any existing capacitor.config.ts / .js / .mjs file so
    // that user-defined TS/JS config files are respected.
    const existingFileConfig = await loadCapacitorConfigFile(nuxt)
    if (existingFileConfig) {
      logger.info('Loaded capacitor config from file.')
      nuxt.options.capacitor.config = defu(nuxt.options.capacitor.config, existingFileConfig)
    }

    // Inject dev server
    if (nuxt.options.dev) {
      logger.info('Using devServer.url for capacitor server config.')
      nuxt.options.capacitor.config = defu(nuxt.options.capacitor.config, {
        server: {
          url: nuxt.options.devServer.url,
          cleartext: true,
        },
      })
    }
    else {
      delete nuxt.options.capacitor.config?.server
    }

    // Fallback webDir
    nuxt.options.capacitor.config = defu(nuxt.options.capacitor.config, {
      webDir: withoutTrailingSlash(nuxt.options.rootDir) + withLeadingSlash(distPath),
    })

    const capacitorConfigFile = hasAnyCapacitorConfigFile(nuxt)
    if (thisModuleDir !== rootDir) {
      // Ensure we patch the install for electron
      const electronPath = join(rootDir, 'electron')
      const electronPackageJsonPath = join(electronPath, 'package.json')
      const hasElectronInstall = existsSync(electronPackageJsonPath)
      const electronPackageJson = await readPackageJSON(electronPackageJsonPath)

      if (hasElectronInstall && !electronPackageJson.scripts?.postinstall) {
        const updatedPackageJson = await patchElectronPackageJson(electronPackageJson)
        await writeFileSync(electronPackageJsonPath, JSON.stringify(updatedPackageJson, null, 2))
      }
      // With a postinstall, user got to add themselves...
      else if (!electronPackageJson.scripts?.postinstall?.includes('node node_modules/electron/install.js')) {
        console.warn(
          `electron package.json(at ${electronPackageJsonPath}) has "postinstall" script, but does not include the install... Add it manually to your package.json to ensure electron is installed correctly: '"postinstall": "node node_modules/electron/install.js"'`,
        )
      }

      // Handle capacitor configs
      if (nuxt.options.capacitor.output === 'json') {
        await upsertCapacitorJsonConfig(nuxt)
      }
      else if (nuxt.options.capacitor.output === 'ts') {
        if (!existsSync(join(rootDir, 'capacitor.config.ts'))) {
          await createCapacitorTsConfig(nuxt)
        }
        // else: capacitor.config.ts already exists and was loaded via loadCapacitorConfigFile
      }
      else {
        logger.warn(`Unhandled capacitor config file "${capacitorConfigFile}"`)
      }
    }

    addCodeTemplates(nuxt)

    // Auto sync
    if (nuxt.options.capacitor.autoSync) {
      //
      const requiredFile = `${distPath}/index.html`
      const capSync = (scope = 'listen') => async () => {
        if (!existsSync(join(rootDir, requiredFile))) {
          logger.warn(`No '${requiredFile}' found when attempting to cap sync on '${scope}'. This is critical for capacitor to work. Try with pnpm build --prerender`)
          return
        }
        try {
          let syncMessage = `npx cap sync`
          execSync('npx cap sync', { stdio: 'inherit', cwd: rootDir })
          if (existsSync(join(rootDir, 'electron/package.json'))) {
            execSync('npx cap sync electron', { stdio: 'inherit', cwd: rootDir })
            syncMessage = ` && npx cap sync electron`
          }
          logger.success(`${syncMessage} completed on ${scope}.`)
        }
        catch (err) {
          logger.error(err)
        }
      }

      //
      if (nuxt.options.dev) {
        // nuxt.hook('listen', capSync('listen'))
        nuxt.hook('build:done', async () => {
          logger.info('🔨 Running generate for initial Capacitor assets...')
          try {
            if (!existsSync(join(rootDir, distPath, 'index.html'))) {
              execSync('npx nuxt generate', { cwd: rootDir, stdio: 'ignore' })
              logger.success(`Generated static pages into ${distPath}`)
            }
            await capSync('build:done')()
          }
          catch (err) {
            logger.error(err)
            return
          }
        })
      }
      else {
        nuxt.hook('nitro:build:public-assets', capSync('nitro:build:public-assets'))
      }
    }
  },
})
