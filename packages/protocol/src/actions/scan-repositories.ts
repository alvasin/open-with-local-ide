import { z } from 'zod'

export const MAX_SCAN_DEPTH = 15

export const scanRepositoriesRequestSchema = z
  .object({
    action: z.literal('scanRepositories'),
    rootPath: z.string().trim().min(1),
    maxDepth: z.number().int().min(0).max(MAX_SCAN_DEPTH).optional(),
  })
  .strict()

export const discoveredRepositorySchema = z.object({
  provider: z.literal('github'),
  owner: z.string(),
  repo: z.string(),
  repoPath: z.string(),
  remoteName: z.string(),
})

export const scanSkippedReasonSchema = z.enum([
  'permission_denied',
  'missing_git_config',
  'invalid_git_config',
  'missing_remote',
  'unsupported_remote',
  'scan_depth_exceeded',
  'unknown_error',
])

export const scanSkippedEntrySchema = z.object({
  path: z.string(),
  reason: scanSkippedReasonSchema,
})

export const scanRepositoriesSuccessResponseSchema = z.object({
  ok: z.literal(true),
  repositories: z.array(discoveredRepositorySchema),
  skipped: z.array(scanSkippedEntrySchema),
})

export type ScanRepositoriesRequest = z.input<typeof scanRepositoriesRequestSchema>
export type DiscoveredRepository = z.infer<typeof discoveredRepositorySchema>
export type ScanSkippedReason = z.infer<typeof scanSkippedReasonSchema>
export type ScanSkippedEntry = z.infer<typeof scanSkippedEntrySchema>
export type ScanRepositoriesSuccessResponse = z.infer<typeof scanRepositoriesSuccessResponseSchema>
