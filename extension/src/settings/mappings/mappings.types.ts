import type { GitProviderId } from '@/providers/types'

export type RepositoryMapping = {
  id: string
  provider: GitProviderId
  owner: string
  repo: string
  repoPath: string
  source: 'manual' | 'scan'
  scanFolderId?: string
}

export type RepoMappings = RepositoryMapping[]
