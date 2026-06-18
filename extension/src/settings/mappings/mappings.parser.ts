import { defaultRepoMappings } from './mappings.defaults'
import type { RepoMappings } from './mappings.types'
import { isRecord } from '@/shared/record/record.guard'

export const parseRepoMappings = (value: unknown): RepoMappings => {
  if (!isRecord(value)) return defaultRepoMappings()

  const repoMappings: RepoMappings = {}

  for (const [repoKey, localPath] of Object.entries(value)) {
    if (typeof localPath !== 'string') continue
    repoMappings[repoKey] = localPath
  }

  return repoMappings
}
