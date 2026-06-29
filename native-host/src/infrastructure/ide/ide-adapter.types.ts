export type IdeAdapterBuildArgsPayload = {
  resolvedPath: string
  repoPath: string
  line?: number
}

export type IdeAdapter = {
  label: string
  defaultCommand: string
  buildFileArgs: (payload: IdeAdapterBuildArgsPayload) => string[]
  buildWorkspaceArgs: (payload: IdeAdapterBuildArgsPayload) => string[]
}
