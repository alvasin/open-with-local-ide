import { defaultIdeSettings } from './ide/ide.defaults'
import { defaultRepoMappings } from './mappings/mappings.defaults'
import { defaultRepositoryScanFolders } from './repository-scanning/repository-scanning.defaults'
import type { ExtensionSettings } from './settings.types'

export const defaultSettings = (): ExtensionSettings => ({
  mappings: defaultRepoMappings(),
  repositoryScanFolders: defaultRepositoryScanFolders(),
  ide: defaultIdeSettings(),
})
