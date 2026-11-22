import type { IdeSettings } from './ide/ide.types'
import type { RepositoryMapping } from './mappings/mappings.types'
import type { RepositoryScanFolder } from './repository-scanning/repository-scanning.types'

export interface ExtensionSettings {
  mappings: RepositoryMapping[]
  repositoryScanFolders: RepositoryScanFolder[]
  ide: IdeSettings
}
