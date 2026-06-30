import type { z } from 'zod'
import type { openInIdeRequestSchema } from './open-in-ide.validation.js'

export type NativeOpenInIdeRequest = z.infer<typeof openInIdeRequestSchema>

type ValidOpenInIdeRequestBase = Omit<NativeOpenInIdeRequest, 'repoPath' | 'target'> & {
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
        kind: 'file'
        filePath: string
        line?: number
        resolvedPath: string
      }
    })
