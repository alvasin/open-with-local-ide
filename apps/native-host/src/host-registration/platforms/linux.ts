import os from 'node:os'
import path from 'node:path'
import { MANIFEST_FILE_NAME } from '../registration.constants.js'
import { getCompiledHostPath } from '../registration.paths.js'
import type { PlatformHostRegistration } from '../registration.types.js'

export const createLinuxHostRegistration = (): PlatformHostRegistration => ({
  getHostPath: getCompiledHostPath,

  getManifestInstallPath: () =>
    path.join(os.homedir(), '.config', 'google-chrome', 'NativeMessagingHosts', MANIFEST_FILE_NAME),

  prepareHost: () => {},

  registerHost: () => undefined,

  getManualInstallInstructions: (manifestPath: string) => [`Manifest path: ${manifestPath}`],

  unregisterHost: () => undefined,

  getManualUninstallInstructions: (manifestPath: string) => [
    `Remove manifest file: ${manifestPath}`,
  ],
})
