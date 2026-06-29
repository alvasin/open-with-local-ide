import type { DiscoveredRepository, NativeHostErrorCode, ScanSkippedEntry } from '@native-protocol'
import type { RepositoryScanningErrorCode } from './repository-scanning.errors'
import type { ExtensionNativeErrorCode } from '@/native-messaging'
import type { RepositoryMapping } from '@/settings/mappings/mappings.types'
import type { RepositoryScanFolder } from '@/settings/repository-scanning/repository-scanning.types'

export type RepositoryScanConflict = {
  existing: RepositoryMapping
  discovered: DiscoveredRepository
  scanFolderId: string
}

export type ScanFolderResult =
  | {
      ok: true
      conflicts: RepositoryScanConflict[]
      skipped: ScanSkippedEntry[]
      importedCount: number
    }
  | {
      ok: false
      errorCode: NativeHostErrorCode | ExtensionNativeErrorCode | RepositoryScanningErrorCode
    }

export type AddScanFolderResult =
  | { ok: true; folder: RepositoryScanFolder }
  | { ok: false; reason: 'required' | 'not_absolute' | 'duplicate' }
