import { defaultRepositoryScanFolders } from './repository-scanning.defaults'
import type { RepositoryScanFolder } from './repository-scanning.types'
import { isRecord } from '@/shared/record/record.guard'

const isIsoDate = (value: string): boolean => !Number.isNaN(Date.parse(value))

const parseScanFolder = (value: unknown): RepositoryScanFolder | null => {
  if (!isRecord(value)) return null
  if (
    typeof value.id !== 'string' ||
    typeof value.path !== 'string' ||
    typeof value.createdAt !== 'string'
  ) {
    return null
  }

  const id = value.id.trim()
  const folderPath = value.path.trim()
  if (!id || !folderPath || !isIsoDate(value.createdAt)) return null

  const folder: RepositoryScanFolder = {
    id,
    path: folderPath,
    createdAt: value.createdAt,
  }

  if (typeof value.lastScannedAt === 'string' && isIsoDate(value.lastScannedAt)) {
    folder.lastScannedAt = value.lastScannedAt
  }

  return folder
}

export const parseRepositoryScanFolders = (value: unknown): RepositoryScanFolder[] => {
  if (!Array.isArray(value)) return defaultRepositoryScanFolders()

  const folders = value.map(parseScanFolder).filter((folder) => folder !== null)
  const uniqueFolders = new Map<string, RepositoryScanFolder>()
  for (const folder of folders) {
    if (!uniqueFolders.has(folder.id)) uniqueFolders.set(folder.id, folder)
  }

  return [...uniqueFolders.values()]
}
