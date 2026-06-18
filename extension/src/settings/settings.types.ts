import type { IdeSettings } from './ide/ide.types'
import type { RepoMappings } from './mappings/mappings.types'

export interface ExtensionSettings {
  mappings: RepoMappings
  ide: IdeSettings
}
