import type { DiscoveredRepository } from '@open-with-local-ide/protocol'
import { areSamePath } from './path-comparison'
import { isSameRepository } from '@/providers/repository'
import type { RepositoryMapping } from '@/settings/settings.schema'

/** A discovered repository that is already mapped to a different local path. */
export type RepositoryScanConflict = {
  existing: RepositoryMapping
  discovered: DiscoveredRepository
  scanFolderId: string
}

/**
 * Splits scan results into new mappings and conflicts. Repositories already mapped to the same
 * path are skipped; existing mappings are never changed here.
 */
export const mergeDiscoveredRepositories = (
  mappings: RepositoryMapping[],
  discoveredRepositories: DiscoveredRepository[],
  scanFolderId: string,
) => {
  const added: RepositoryMapping[] = []
  const conflicts: RepositoryScanConflict[] = []

  for (const discovered of discoveredRepositories) {
    const isSame = (mapping: RepositoryMapping) => isSameRepository(mapping, discovered)
    const existing = mappings.find(isSame) ?? added.find(isSame)

    if (!existing) {
      added.push({
        id: crypto.randomUUID(),
        provider: discovered.provider,
        owner: discovered.owner,
        repo: discovered.repo,
        repoPath: discovered.repoPath,
        source: 'scan',
        scanFolderId,
      })
    } else if (!areSamePath(existing.repoPath, discovered.repoPath)) {
      conflicts.push({ existing, discovered, scanFolderId })
    }
  }

  return { added, conflicts }
}
