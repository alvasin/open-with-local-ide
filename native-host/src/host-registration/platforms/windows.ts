import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { HOST_NAME, MANIFEST_FILE_NAME } from '../registration.constants.js'
import { projectRoot } from '../registration.paths.js'
import type { PlatformHostRegistration } from '../registration.types.js'

const getRegistryKey = (): string =>
  `HKCU\\Software\\Google\\Chrome\\NativeMessagingHosts\\${HOST_NAME}`

const getWindowsHostWrapperPath = (): string => path.resolve(projectRoot, 'host.cmd')

export const createWindowsHostRegistration = (): PlatformHostRegistration => ({
  getHostPath: getWindowsHostWrapperPath,
  getManifestInstallPath: () => path.join(projectRoot, MANIFEST_FILE_NAME),
  prepareHost: () => {
    // TODO: Replace host.cmd with a packaged executable before distributing native-host.
    fs.writeFileSync(getWindowsHostWrapperPath(), '@echo off\r\nnode "%~dp0dist\\host.js"\r\n')
  },
  registerHost: (manifestPath: string) => {
    const result = spawnSync(
      'reg.exe',
      ['add', getRegistryKey(), '/ve', '/t', 'REG_SZ', '/d', manifestPath, '/f'],
      {
        shell: false,
        stdio: 'inherit',
      },
    )

    return result.status === 0
  },
  unregisterHost: () => {
    const result = spawnSync('reg.exe', ['delete', getRegistryKey(), '/f'], {
      shell: false,
      stdio: 'inherit',
    })

    return result.status === 0
  },
  getManualInstallInstructions: (manifestPath: string) => [
    `reg add ${getRegistryKey()} /ve /t REG_SZ /d "${manifestPath}" /f`,
  ],
  getManualUninstallInstructions: (manifestPath: string) => [
    `reg delete ${getRegistryKey()} /f`,
    `Remove manifest file: ${manifestPath}`,
  ],
})
