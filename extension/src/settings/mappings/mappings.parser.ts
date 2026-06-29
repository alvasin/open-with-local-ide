import { defaultRepoMappings } from './mappings.defaults'
import type { RepositoryMapping, RepoMappings } from './mappings.types'
import { isRecord } from '@/shared/record/record.guard'

const parseMapping = (value: unknown): RepositoryMapping | null => {
  if (!isRecord(value)) return null
  if (
    typeof value.id !== 'string' ||
    value.provider !== 'github' ||
    typeof value.owner !== 'string' ||
    typeof value.repo !== 'string' ||
    typeof value.repoPath !== 'string' ||
    (value.source !== 'manual' && value.source !== 'scan')
  ) {
    return null
  }

  const id = value.id.trim()
  const owner = value.owner.trim().toLowerCase()
  const repo = value.repo.trim().toLowerCase()
  const repoPath = value.repoPath.trim()
  if (!id || !owner || !repo || !repoPath) return null

  if (value.source === 'scan') {
    if (typeof value.scanFolderId !== 'string' || !value.scanFolderId.trim()) return null
    return {
      id,
      provider: 'github',
      owner,
      repo,
      repoPath,
      source: 'scan',
      scanFolderId: value.scanFolderId.trim(),
    }
  }

  return { id, provider: 'github', owner, repo, repoPath, source: 'manual' }
}

export const parseRepoMappings = (value: unknown): RepoMappings => {
  if (!Array.isArray(value)) return defaultRepoMappings()

  const mappings = value.map(parseMapping).filter((mapping) => mapping !== null)
  const uniqueMappings = new Map<string, RepositoryMapping>()
  const mappingIds = new Set<string>()

  for (const mapping of mappings) {
    const key = `${mapping.provider}/${mapping.owner}/${mapping.repo}`
    if (uniqueMappings.has(key) || mappingIds.has(mapping.id)) continue
    uniqueMappings.set(key, mapping)
    mappingIds.add(mapping.id)
  }

  return [...uniqueMappings.values()]
}
