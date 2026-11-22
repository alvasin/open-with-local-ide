import os from 'node:os'
import path from 'node:path'
import { MANIFEST_FILE_NAME } from '../registration.constants.js'
import { getCompiledHostPath } from '../registration.paths.js'
import type { PlatformHostRegistration } from '../registration.types.js'

export const createMacosHostRegistration = (): PlatformHostRegistration => ({
  getHostPath: getCompiledHostPath,
  getManifestInstallPath: () =>
    path.join(
      os.homedir(),
      'Library',
      'Application Support',
      'Google',
      'Chrome',
      'NativeMessagingHosts',
      MANIFEST_FILE_NAME,
    ),
  prepareHost: () => {},
  registerHost: () => undefined,
  unregisterHost: () => undefined,
  getManualInstallInstructions: (manifestPath: string) => [`Manifest path: ${manifestPath}`],
  getManualUninstallInstructions: (manifestPath: string) => [
    `Remove manifest file: ${manifestPath}`,
  ],
})
