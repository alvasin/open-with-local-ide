import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { getCompiledHostPath, projectRoot } from './registration.paths.js'
import type { NativeHostInstallResult } from './registration.types.js'
import { createManifest, writeManifest } from './manifest.js'
import { createPlatformHostRegistration } from './platforms/index.js'

const isExtensionId = (value: string): boolean => /^[a-p]{32}$/.test(value)

const buildHostIfNeeded = (): string[] => {
  const compiledHostPath = getCompiledHostPath()
  if (fs.existsSync(compiledHostPath)) return []

  const buildResult = spawnSync('npm', ['run', 'build'], {
    cwd: projectRoot,
    shell: process.platform === 'win32',
    stdio: 'inherit',
  })

  if (buildResult.status !== 0 || !fs.existsSync(compiledHostPath)) {
    return [`Host build failed or did not create ${compiledHostPath}`]
  }

  return []
}

export const getManifestInstallPath = (): string =>
  createPlatformHostRegistration().getManifestInstallPath()

export const getManualInstallInstructions = (manifestPath: string): string[] =>
  createPlatformHostRegistration().getManualInstallInstructions(manifestPath)

export const installNativeHost = (extensionId: string): NativeHostInstallResult => {
  if (!isExtensionId(extensionId)) {
    throw new Error('EXTENSION_ID must be a 32-character Chrome extension id.')
  }

  const platformRegistration = createPlatformHostRegistration()
  const warnings = buildHostIfNeeded()

  platformRegistration.prepareHost()

  const hostPath = platformRegistration.getHostPath()
  const manifest = createManifest(extensionId, hostPath)
  const manifestPath = platformRegistration.getManifestInstallPath()

  writeManifest(manifestPath, manifest)

  const result: NativeHostInstallResult = {
    manifestPath,
    hostPath,
    warnings,
    manualInstructions: platformRegistration.getManualInstallInstructions(manifestPath),
  }

  const isRegistered = platformRegistration.registerHost(manifestPath)
  if (isRegistered === undefined) return result

  result.windowsRegistryRegistered = isRegistered

  if (!isRegistered) {
    result.warnings.push('Windows registry registration failed.')
  }

  return result
}
