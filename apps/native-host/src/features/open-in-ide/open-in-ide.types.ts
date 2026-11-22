import type { ParsedOpenInIdeRequest } from '@open-with-local-ide/protocol'

type ValidOpenInIdeRequestBase = Omit<ParsedOpenInIdeRequest, 'repoPath' | 'target'> & {
  repoPath: string
}

export type ValidOpenInIdeRequest =
  | (ValidOpenInIdeRequestBase & {
      target: {
        kind: 'repository'
      }
    })
  | (ValidOpenInIdeRequestBase & {
      target: {
        kind: 'directory'
        directoryPath: string
        resolvedPath: string
      }
    })
  | (ValidOpenInIdeRequestBase & {
      target: {
        kind: 'file'
        filePath: string
        line?: number
        resolvedPath: string
      }
    })
