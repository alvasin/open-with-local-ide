import { z } from 'zod'

const repositoryTargetSchema = z
  .object({
    kind: z.literal('repository'),
  })
  .strict()

const directoryTargetSchema = z
  .object({
    kind: z.literal('directory'),
    directoryPath: z.string().trim().min(1),
  })
  .strict()

const fileTargetSchema = z
  .object({
    kind: z.literal('file'),
    filePath: z.string().trim().min(1),
    line: z.number().int().positive().optional(),
  })
  .strict()

export const openInIdeTargetSchema = z.discriminatedUnion('kind', [
  repositoryTargetSchema,
  directoryTargetSchema,
  fileTargetSchema,
])

export const openInIdeRequestSchema = z
  .object({
    action: z.literal('openInIde'),
    repoPath: z.string().trim().min(1),
    ide: z.literal('vscode').default('vscode'),
    repoKey: z.string().trim().min(1).optional(),
    provider: z.literal('github').optional(),
    target: openInIdeTargetSchema,
  })
  .strict()

export const openInIdeSuccessResponseSchema = z.object({
  ok: z.literal(true),
})

/** Request as sent by the extension. */
export type OpenInIdeRequest = z.input<typeof openInIdeRequestSchema>
/** Request after validation by the native host (defaults applied). */
export type ParsedOpenInIdeRequest = z.output<typeof openInIdeRequestSchema>
export type OpenInIdeTarget = z.infer<typeof openInIdeTargetSchema>
export type OpenInIdeSuccessResponse = z.infer<typeof openInIdeSuccessResponseSchema>
