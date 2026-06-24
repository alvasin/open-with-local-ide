import type { IdeSettings } from './ide/ide.types'
import type { RepoMappings } from './mappings/mappings.types'
import type { RepositoryScanFolder } from './repository-scanning/repository-scanning.types'

export interface ExtensionSettings {
  mappings: RepoMappings
  repositoryScanFolders: RepositoryScanFolder[]
  ide: IdeSettings
}
