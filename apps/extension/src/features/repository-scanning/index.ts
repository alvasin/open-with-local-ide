import { isAbsolutePath, normalizePathForComparison } from './path-comparison'
import { RepositoryScanningErrorCode } from './repository-scanning.errors'
import { mergeDiscoveredRepositories } from './repository-scanning.merge'
import { scanRepositoriesInHost } from './repository-scanning.native'
import type {
  AddScanFolderResult,
  RepositoryScanConflict,
  ScanFolderResult,
} from './repository-scanning.types'
import type { RepositoryMapping } from '@/settings/mappings/mappings.types'
import type { RepositoryScanFolder } from '@/settings/repository-scanning/repository-scanning.types'
import { getSettings, saveSettings } from '@/settings/settings.storage'

export { RepositoryScanningErrorCode } from './repository-scanning.errors'
export type {
  AddScanFolderResult,
  RepositoryScanConflict,
  ScanFolderResult,
} from './repository-scanning.types'

export const addRepositoryScanFolder = async (path: string): Promise<AddScanFolderResult> => {
  const folderPath = path.trim()
  if (!folderPath) return { ok: false, reason: 'required' }
  if (!isAbsolutePath(folderPath)) return { ok: false, reason: 'not_absolute' }

  const current = await getSettings()
  const normalizedPath = normalizePathForComparison(folderPath)
  if (
    current.repositoryScanFolders.some(
      (folder) => normalizePathForComparison(folder.path) === normalizedPath,
    )
  ) {
    return { ok: false, reason: 'duplicate' }
  }

  const folder: RepositoryScanFolder = {
    id: crypto.randomUUID(),
    path: folderPath,
    createdAt: new Date().toISOString(),
  }

  await saveSettings({
    ...current,
    repositoryScanFolders: [...current.repositoryScanFolders, folder],
  })

  return { ok: true, folder }
}

export const scanRepositoryFolder = async (scanFolderId: string): Promise<ScanFolderResult> => {
  const current = await getSettings()
  const scanFolder = current.repositoryScanFolders.find((folder) => folder.id === scanFolderId)
  if (!scanFolder) return { ok: false, errorCode: RepositoryScanningErrorCode.ScanFolderNotFound }

  const response = await scanRepositoriesInHost({
    action: 'scanRepositories',
    rootPath: scanFolder.path,
  })
  if (!response.ok) return { ok: false, errorCode: response.errorCode }

  const latest = await getSettings()
  if (!latest.repositoryScanFolders.some((folder) => folder.id === scanFolderId)) {
    return { ok: false, errorCode: RepositoryScanningErrorCode.ScanFolderNotFound }
  }

  const mergeResult = mergeDiscoveredRepositories(
    latest.mappings,
    response.repositories,
    scanFolderId,
  )

  const scannedAt = new Date().toISOString()
  await saveSettings({
    ...latest,
    mappings: mergeResult.mappings,
    repositoryScanFolders: latest.repositoryScanFolders.map((folder) =>
      folder.id === scanFolderId ? { ...folder, lastScannedAt: scannedAt } : folder,
    ),
  })

  return {
    ok: true,
    conflicts: mergeResult.conflicts,
    skipped: response.skipped,
    importedCount: mergeResult.importedCount,
  }
}

export const replaceMappingWithDiscovered = async (
  conflict: RepositoryScanConflict,
): Promise<void> => {
  const current = await getSettings()
  const replacement: RepositoryMapping = {
    id: conflict.existing.id,
    provider: conflict.discovered.provider,
    owner: conflict.discovered.owner,
    repo: conflict.discovered.repo,
    repoPath: conflict.discovered.repoPath,
    source: 'scan',
    scanFolderId: conflict.scanFolderId,
  }

  await saveSettings({
    ...current,
    mappings: current.mappings.map((mapping) =>
      mapping.id === conflict.existing.id ? replacement : mapping,
    ),
  })
}

export const deleteRepositoryScanFolder = async (scanFolderId: string): Promise<void> => {
  const current = await getSettings()
  await saveSettings({
    ...current,
    repositoryScanFolders: current.repositoryScanFolders.filter(
      (folder) => folder.id !== scanFolderId,
    ),
    mappings: current.mappings.map((mapping) =>
      mapping.source === 'scan' && mapping.scanFolderId === scanFolderId
        ? { ...mapping, source: 'manual' as const, scanFolderId: undefined }
        : mapping,
    ),
  })
}

export const deleteScanFolderMappings = async (scanFolderId: string): Promise<void> => {
  const current = await getSettings()
  await saveSettings({
    ...current,
    mappings: current.mappings.filter(
      (mapping) => !(mapping.source === 'scan' && mapping.scanFolderId === scanFolderId),
    ),
  })
}
