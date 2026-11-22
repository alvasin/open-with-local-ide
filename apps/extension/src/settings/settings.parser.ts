import { parseIdeSettings } from './ide/ide.parser'
import { parseRepoMappings } from './mappings/mappings.parser'
import { parseRepositoryScanFolders } from './repository-scanning/repository-scanning.parser'
import { defaultSettings } from './settings.defaults'
import type { ExtensionSettings } from './settings.types'
import { isRecord } from '@/shared/record/record.guard'

export const parseSettings = (value: unknown): ExtensionSettings => {
  if (!isRecord(value)) return defaultSettings()

  const repositoryScanFolders = parseRepositoryScanFolders(value.repositoryScanFolders)
  const scanFolderIds = new Set(repositoryScanFolders.map((folder) => folder.id))
  const mappings = parseRepoMappings(value.mappings).map((mapping) =>
    mapping.source === 'scan' && (!mapping.scanFolderId || !scanFolderIds.has(mapping.scanFolderId))
      ? { ...mapping, source: 'manual' as const, scanFolderId: undefined }
      : mapping,
  )

  return {
    mappings,
    repositoryScanFolders,
    ide: parseIdeSettings(value.ide),
  }
}
