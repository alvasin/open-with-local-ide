export type ScanRepositoriesRequest = {
  action: 'scanRepositories'
  rootPath: string
  maxDepth?: number
}

export type DiscoveredRepository = {
  provider: 'github'
  owner: string
  repo: string
  repoPath: string
  remoteName: string
}

export type ScanSkippedReason =
  | 'permission_denied'
  | 'missing_git_config'
  | 'invalid_git_config'
  | 'missing_remote'
  | 'unsupported_remote'
  | 'scan_depth_exceeded'
  | 'unknown_error'

export type ScanSkippedEntry = {
  path: string
  reason: ScanSkippedReason
}

export type ScanRepositoriesSuccessResponse = {
  ok: true
  repositories: DiscoveredRepository[]
  skipped: ScanSkippedEntry[]
}
