export type GitProviderId =
  // TODO: add gitlab and bitbucket in future phases.
  'github'

export interface ParsedRemoteFile {
  provider: GitProviderId
  host: string
  owner: string
  repo: string
  repoKey: string
  branch?: string
  filePath?: string
  line?: number
}
