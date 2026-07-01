export type OpenInIdeTarget =
  | {
      kind: 'repository'
    }
  | {
      kind: 'directory'
      directoryPath: string
    }
  | {
      kind: 'file'
      filePath: string
      line?: number
    }

export interface OpenInIdeRequest {
  action: 'openInIde'
  provider: 'github'
  ide: 'vscode'
  repoKey: string
  repoPath: string
  target: OpenInIdeTarget
}
