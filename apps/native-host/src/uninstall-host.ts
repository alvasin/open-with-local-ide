#!/usr/bin/env node

import { createPlatformHostRegistration } from './host-registration/platforms/index.js'
import { uninstallNativeHost } from './host-registration/uninstall.js'
import { HOST_NAME } from './host-registration/registration.constants.js'

const printManualInstructions = (manualInstructions: string[]) => {
  console.log('')
  console.log('Manual uninstall instructions:')

  for (const instruction of manualInstructions) {
    console.log(instruction)
  }
}

const main = () => {
  try {
    const result = uninstallNativeHost()

    if (result.manifestRemoved) {
      console.log(`Native host manifest removed: ${result.manifestPath}`)
    } else if (!result.manifestExisted) {
      console.log(`Native host manifest not found: ${result.manifestPath}`)
    }

    if (result.windowsRegistryUnregistered) console.log(`Windows registry key removed for ${HOST_NAME}`)

    for (const warning of result.warnings) {
      console.warn(warning)
    }

    if (result.warnings.length > 0) {
      printManualInstructions(result.manualInstructions)
      process.exitCode = 1
    }
  } catch (error) {
    const platform = createPlatformHostRegistration()

    console.error(error instanceof Error ? error.message : 'Native host uninstallation failed')
    printManualInstructions(platform.getManualUninstallInstructions(platform.getManifestInstallPath()))
    process.exitCode = 1
  }
}

main()
