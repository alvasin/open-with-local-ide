export type IdeAdapterBuildArgsPayload = {
  resolvedPath: string
  repoPath: string
  line?: number
}

export type IdeAdapter = {
  label: string
  defaultCommand: string
  buildFileInRepositoryArgs: (payload: IdeAdapterBuildArgsPayload) => string[]
  buildRepositoryArgs: (payload: Pick<IdeAdapterBuildArgsPayload, 'repoPath'>) => string[]
}
