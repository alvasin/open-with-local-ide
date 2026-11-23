export type GitProviderId =
  // TODO: add gitlab and bitbucket in future phases.
  'github'

export type RemoteRepository = {
  provider: GitProviderId
  host: string
  owner: string
  repo: string
  repoKey: string
}

/** What the current remote page points at: the repository root, a folder, or a file. */
export type ParsedRemoteLocation =
  | (RemoteRepository & { kind: 'repository' })
  | (RemoteRepository & { kind: 'directory'; directoryPath: string })
  | (RemoteRepository & { kind: 'file'; filePath: string; line?: number })
