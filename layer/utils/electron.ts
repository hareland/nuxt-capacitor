import type { PackageJson } from 'pkg-types'
import defu from 'defu'

export const patchElectronPackageJson = async (json: PackageJson) => {
  return defu(json, {
    scripts: {
      postinstall: 'node node_modules/electron/install.js',
    },
  })
}

// TODO: Patch the {electronPath}/src files so we have hot reload etc...
