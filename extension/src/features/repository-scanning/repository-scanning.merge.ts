import type { DiscoveredRepository } from '@native-protocol'
import { areSamePath } from './path-comparison'
import type { RepositoryScanConflict } from './repository-scanning.types'
import { isSameRepository } from '@/settings/mappings/mappings'
import type { RepositoryMapping } from '@/settings/mappings/mappings.types'

const createScannedMapping = (
  discovered: DiscoveredRepository,
  scanFolderId: string,
): RepositoryMapping => ({
  id: crypto.randomUUID(),
  provider: discovered.provider,
  owner: discovered.owner,
  repo: discovered.repo,
  repoPath: discovered.repoPath,
  source: 'scan',
  scanFolderId,
})

export const mergeDiscoveredRepositories = (
  mappings: RepositoryMapping[],
  discoveredRepositories: DiscoveredRepository[],
  scanFolderId: string,
) => {
  const nextMappings = [...mappings]
  const conflicts: RepositoryScanConflict[] = []
  let importedCount = 0

  for (const discovered of discoveredRepositories) {
    const existing = nextMappings.find((mapping) => isSameRepository(mapping, discovered))

    if (!existing) {
      nextMappings.push(createScannedMapping(discovered, scanFolderId))
      importedCount += 1
      continue
    }

    if (!areSamePath(existing.repoPath, discovered.repoPath)) {
      conflicts.push({ existing, discovered, scanFolderId })
    }
  }

  return {
    mappings: nextMappings,
    conflicts,
    importedCount,
  }
}
