import type { PlatformHostRegistration } from '../registration.types.js'
import { createLinuxHostRegistration } from './linux.js'
import { createMacosHostRegistration } from './macos.js'
import { createWindowsHostRegistration } from './windows.js'

export const createPlatformHostRegistration = (): PlatformHostRegistration => {
  switch (process.platform) {
    case 'linux':
      return createLinuxHostRegistration()
    case 'darwin':
      return createMacosHostRegistration()
    case 'win32':
      return createWindowsHostRegistration()

    default:
      throw new Error(`Unsupported platform: ${process.platform}`)
  }
}
