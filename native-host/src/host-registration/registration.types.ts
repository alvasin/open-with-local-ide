export type NativeHostManifest = {
  name: string
  description: string
  path: string
  type: 'stdio'
  allowed_origins: string[]
}

export type NativeHostInstallResult = {
  manifestPath: string
  hostPath: string
  windowsRegistryRegistered?: boolean
  warnings: string[]
  manualInstructions: string[]
}

export type NativeHostUninstallResult = {
  manifestPath: string
  manifestRemoved: boolean
  manifestExisted: boolean
  windowsRegistryUnregistered?: boolean
  warnings: string[]
  manualInstructions: string[]
}

export type PlatformHostRegistration = {
  getHostPath: () => string
  getManifestInstallPath: () => string
  prepareHost: () => void
  registerHost: (manifestPath: string) => boolean | undefined
  unregisterHost: () => boolean | undefined
  getManualInstallInstructions: (manifestPath: string) => string[]
  getManualUninstallInstructions: (manifestPath: string) => string[]
}
