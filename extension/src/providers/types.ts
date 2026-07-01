export type GitProviderId =
  // TODO: add gitlab and bitbucket in future phases.
  'github'

export interface ParsedRemoteLocation {
  provider: GitProviderId
  host: string
  owner: string
  repo: string
  repoKey: string
  branch?: string
  directoryPath?: string
  filePath?: string
  line?: number
}
