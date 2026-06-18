import fs from 'node:fs'
import type { NativeHostUninstallResult } from './registration.types.js'
import { createPlatformHostRegistration } from './platforms/index.js'

const removeManifest = (
  manifestPath: string,
): Pick<NativeHostUninstallResult, 'manifestExisted' | 'manifestRemoved' | 'warnings'> => {
  if (!fs.existsSync(manifestPath)) {
    return {
      manifestExisted: false,
      manifestRemoved: false,
      warnings: [],
    }
  }

  try {
    fs.unlinkSync(manifestPath)

    return {
      manifestExisted: true,
      manifestRemoved: true,
      warnings: [],
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'

    return {
      manifestExisted: true,
      manifestRemoved: false,
      warnings: [`Native host manifest removal failed: ${message}`],
    }
  }
}

export const getManifestUninstallPath = (): string =>
  createPlatformHostRegistration().getManifestInstallPath()

export const getManualUninstallInstructions = (manifestPath: string): string[] =>
  createPlatformHostRegistration().getManualUninstallInstructions(manifestPath)

export const uninstallNativeHost = (): NativeHostUninstallResult => {
  const platformRegistration = createPlatformHostRegistration()
  const manifestPath = platformRegistration.getManifestInstallPath()
  const manifestRemoval = removeManifest(manifestPath)

  const result: NativeHostUninstallResult = {
    manifestPath,
    manifestExisted: manifestRemoval.manifestExisted,
    manifestRemoved: manifestRemoval.manifestRemoved,
    warnings: manifestRemoval.warnings,
    manualInstructions: platformRegistration.getManualUninstallInstructions(manifestPath),
  }

  const isUnregistered = platformRegistration.unregisterHost()
  if (isUnregistered === undefined) return result

  result.windowsRegistryUnregistered = isUnregistered

  if (!isUnregistered) {
    result.warnings.push('Windows registry unregistration failed.')
  }

  return result
}
