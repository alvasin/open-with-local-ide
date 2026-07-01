export type IdeAdapter = {
  label: string
  defaultCommand: string
  buildFileInRepositoryArgs: (payload: {
    resolvedPath: string
    repoPath: string
    line?: number
  }) => string[]
  buildRepositoryArgs: (payload: { repoPath: string }) => string[]
}
