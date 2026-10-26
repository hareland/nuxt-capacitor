import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { readPackageJSON, type PackageJson } from 'pkg-types'
import { packageIsInstalled } from '../utils/meta'
import type { CapacitorConfig } from '@capacitor/cli'
import defu from 'defu'
import { existsSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { consola } from 'consola'
import { execSync } from 'node:child_process'
import {
  findConflictingConfigFiles,
  resolveConfigFileName,
  writeCapacitorConfig,
  type CapacitorConfigOutput,
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
  output?: CapacitorConfigOutput
  config?: CapConfig
}

declare module '@nuxt/schema' {
  interface NuxtOptions {
    capacitor: NuxtCapacitorOptions
  }
  interface NuxtHooks {
    'nuxt-capacitor:config': (options: NuxtCapacitorOptions) => void | Promise<void>
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
      throw new Error(`[${name}] @capacitor/cli is not installed. Run: pnpm add -D @capacitor/cli && pnpm add @capacitor/core`)
    }

    nuxt.options.capacitor = defu(nuxt.options.capacitor, _options)

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
      if (nuxt.options.capacitor.config?.server) {
        delete nuxt.options.capacitor.config.server.url
      }
    }

    // Fallback webDir
    nuxt.options.capacitor.config = defu(nuxt.options.capacitor.config, {
      webDir: distPath,
    })

    if (thisModuleDir !== rootDir) {
      // Ensure we patch the install for electron
      const electronPackageJsonPath = join(rootDir, 'electron', 'package.json')
      if (existsSync(electronPackageJsonPath)) {
        const electronPackageJson = await readPackageJSON(electronPackageJsonPath)
        if (!electronPackageJson.scripts?.postinstall) {
          const updatedPackageJson = await patchElectronPackageJson(electronPackageJson)
          writeFileSync(electronPackageJsonPath, JSON.stringify(updatedPackageJson, null, 2))
        }
        // With a postinstall, user got to add themselves...
        else if (!electronPackageJson.scripts.postinstall.includes('node node_modules/electron/install.js')) {
          logger.warn(
            `electron package.json (at ${electronPackageJsonPath}) has a "postinstall" script without the electron install. Add it manually to ensure electron is installed correctly: '"postinstall": "node node_modules/electron/install.js"'`,
          )
        }
      }

      // Generate the capacitor config file
      const { output, config } = nuxt.options.capacitor
      const conflicts = findConflictingConfigFiles(rootDir, output!)
      if (conflicts.length) {
        logger.warn(`Found ${conflicts.join(', ')} next to the generated ${resolveConfigFileName(output!)}. Capacitor will pick only one of them, remove the extra file(s).`)
      }
      writeCapacitorConfig(rootDir, output!, config as CapacitorConfig)
    }

    await nuxt.callHook('nuxt-capacitor:config', nuxt.options.capacitor)

    // Auto sync
    if (nuxt.options.capacitor.autoSync) {
      const requiredFile = `${distPath}/index.html`
      const capSync = (scope = 'listen') => async () => {
        if (!existsSync(join(rootDir, requiredFile))) {
          logger.warn(`No '${requiredFile}' found when attempting to cap sync on '${scope}'. This is critical for capacitor to work. Try with pnpm build --prerender`)
          return
        }
        try {
          const commands = ['npx cap sync']
          if (existsSync(join(rootDir, 'electron/package.json'))) {
            commands.push('npx cap sync electron')
          }
          for (const command of commands) {
            execSync(command, { stdio: 'inherit', cwd: rootDir })
          }
          logger.success(`${commands.join(' && ')} completed on ${scope}.`)
        }
        catch (err) {
          logger.error(err)
        }
      }

      if (nuxt.options.dev) {
        nuxt.hook('build:done', async () => {
          logger.info('🔨 Running generate for initial Capacitor assets...')
          try {
            if (!existsSync(join(rootDir, distPath, 'index.html'))) {
              execSync('npx nuxt generate', { cwd: rootDir, stdio: 'ignore' })
              logger.success(`Generated static pages into ${distPath}`)
              // The generate child process wrote the production config (no dev server url), restore ours.
              writeCapacitorConfig(rootDir, nuxt.options.capacitor.output!, nuxt.options.capacitor.config as CapacitorConfig)
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
