import { defaultIdeSettings } from './ide/ide.defaults'
import { defaultRepoMappings } from './mappings/mappings.defaults'
import type { ExtensionSettings } from './settings.types'

export const defaultSettings = (): ExtensionSettings => ({
  mappings: defaultRepoMappings(),
  ide: defaultIdeSettings(),
})
