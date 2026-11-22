#!/usr/bin/env node

import {
  getManifestInstallPath,
  getManualInstallInstructions,
  installNativeHost,
} from './host-registration/install.js'
import { HOST_NAME } from './host-registration/registration.constants.js'

const printUsage = () => {
  console.error('Usage: node install-host.js <EXTENSION_ID>')
  console.error('EXTENSION_ID must be a 32-character Chrome extension id.')
}

const printManualInstructions = (manualInstructions: string[]) => {
  console.log('')
  console.log('Manual install instructions:')

  for (const instruction of manualInstructions) {
    console.log(instruction)
  }
}

const main = () => {
  const extensionId = process.argv[2]

  if (!extensionId) {
    printUsage()
    process.exitCode = 1
    return
  }

  try {
    const result = installNativeHost(extensionId)

    console.log(`Native host manifest generated: ${result.manifestPath}`)

    if (result.windowsRegistryRegistered)
      console.log(`Windows registry key registered for ${HOST_NAME}`)

    for (const warning of result.warnings) {
      console.warn(warning)
    }

    if (result.warnings.length > 0) printManualInstructions(result.manualInstructions)
  } catch (error) {
    const manifestPath = getManifestInstallPath()

    console.error(error instanceof Error ? error.message : 'Native host installation failed')
    printManualInstructions(getManualInstallInstructions(manifestPath))
    process.exitCode = 1
  }
}

main()
