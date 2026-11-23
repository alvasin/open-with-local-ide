import { scanRepositoriesSuccessResponseSchema, type ScanSkippedEntry } from '@open-with-local-ide/protocol'
import { isAbsolutePath, normalizePathForComparison } from './path-comparison'
import { mergeDiscoveredRepositories, type RepositoryScanConflict } from './repository-scanning.merge'
import { requestNativeHost, type NativeHostFailure } from '@/native-messaging'
import type { RepositoryScanFolder } from '@/settings/settings.schema'
import { getSettings, updateSettings } from '@/settings/settings.storage'

export type { RepositoryScanConflict } from './repository-scanning.merge'

export type AddScanFolderError = 'required' | 'not_absolute' | 'duplicate'

type AddScanFolderResult = { ok: true; folder: RepositoryScanFolder } | { ok: false; reason: AddScanFolderError }

type ScanFolderResult =
  | {
      ok: true
      conflicts: RepositoryScanConflict[]
      skipped: ScanSkippedEntry[]
      importedCount: number
    }
  | NativeHostFailure

// Returned when the folder is deleted while its scan is still running.
const SCAN_FOLDER_NOT_FOUND = 'SCAN_FOLDER_NOT_FOUND'

export const addRepositoryScanFolder = async (path: string): Promise<AddScanFolderResult> => {
  const folderPath = path.trim()
  if (!folderPath) return { ok: false, reason: 'required' }
  if (!isAbsolutePath(folderPath)) return { ok: false, reason: 'not_absolute' }

  return updateSettings((settings): AddScanFolderResult => {
    const normalizedPath = normalizePathForComparison(folderPath)
    const isDuplicate = settings.repositoryScanFolders.some(
      (folder) => normalizePathForComparison(folder.path) === normalizedPath,
    )
    if (isDuplicate) return { ok: false, reason: 'duplicate' }

    const folder: RepositoryScanFolder = {
      id: crypto.randomUUID(),
      path: folderPath,
      createdAt: new Date().toISOString(),
    }
    settings.repositoryScanFolders.push(folder)

    return { ok: true, folder }
  })
}

export const scanRepositoryFolder = async (scanFolderId: string): Promise<ScanFolderResult> => {
  const { repositoryScanFolders } = await getSettings()
  const scanFolder = repositoryScanFolders.find((folder) => folder.id === scanFolderId)
  if (!scanFolder) return { ok: false, errorCode: SCAN_FOLDER_NOT_FOUND }

  const response = await requestNativeHost(
    { action: 'scanRepositories', rootPath: scanFolder.path },
    scanRepositoriesSuccessResponseSchema,
  )
  if (!response.ok) return response

  // The scan can take a while, so merge into the settings as they are now, not as they were.
  return updateSettings((settings): ScanFolderResult => {
    const folder = settings.repositoryScanFolders.find(({ id }) => id === scanFolderId)
    if (!folder) return { ok: false, errorCode: SCAN_FOLDER_NOT_FOUND }

    const { added, conflicts } = mergeDiscoveredRepositories(settings.mappings, response.repositories, scanFolderId)
    settings.mappings.push(...added)
    folder.lastScannedAt = new Date().toISOString()

    return { ok: true, conflicts, skipped: response.skipped, importedCount: added.length }
  })
}

/** Resolves a conflict in favor of the discovered path. */
export const replaceMappingWithDiscovered = (conflict: RepositoryScanConflict): Promise<void> =>
  updateSettings((settings) => {
    const mapping = settings.mappings.find(({ id }) => id === conflict.existing.id)
    if (!mapping) return

    mapping.repoPath = conflict.discovered.repoPath
    mapping.source = 'scan'
    mapping.scanFolderId = conflict.scanFolderId
  })

/** Deletes the folder but keeps its mappings as manual ones. */
export const deleteRepositoryScanFolder = (scanFolderId: string): Promise<void> =>
  updateSettings((settings) => {
    settings.repositoryScanFolders = settings.repositoryScanFolders.filter(({ id }) => id !== scanFolderId)

    for (const mapping of settings.mappings) {
      if (mapping.scanFolderId !== scanFolderId) continue

      mapping.source = 'manual'
      mapping.scanFolderId = undefined
    }
  })

export const deleteScanFolderMappings = (scanFolderId: string): Promise<void> =>
  updateSettings((settings) => {
    settings.mappings = settings.mappings.filter(
      (mapping) => mapping.source !== 'scan' || mapping.scanFolderId !== scanFolderId,
    )
  })
