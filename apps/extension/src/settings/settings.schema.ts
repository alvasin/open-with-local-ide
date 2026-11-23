import { z } from 'zod/mini'
import { getRepositoryKey } from '@/providers/repository'
import { isRecord } from '@/shared/record/record.guard'

// `zod/mini` instead of `zod`: settings are read by the content script on every GitHub page, and
// the mini build keeps that bundle small.

const requiredString = () => z.string().check(z.trim(), z.minLength(1))
const isoDate = () => z.string().check(z.refine((value) => !Number.isNaN(Date.parse(value))))

const repositoryMappingSchema = z.object({
  id: requiredString(),
  provider: z.literal('github'),
  owner: z.string().check(z.trim(), z.toLowerCase(), z.minLength(1)),
  repo: z.string().check(z.trim(), z.toLowerCase(), z.minLength(1)),
  repoPath: requiredString(),
  source: z.enum(['manual', 'scan']),
  /** Set only for `scan` mappings: the scan folder that discovered the repository. */
  scanFolderId: z.catch(z.optional(requiredString()), undefined),
})

const repositoryScanFolderSchema = z.object({
  id: requiredString(),
  path: requiredString(),
  createdAt: isoDate(),
  lastScannedAt: z.catch(z.optional(isoDate()), undefined),
})

const ideSettingsSchema = z.catch(
  z.object({
    selectedIde: z.catch(z.literal('vscode'), 'vscode'),
    ideCommands: z.catch(z.object({ vscode: z.string() }), { vscode: 'code' }),
  }),
  { selectedIde: 'vscode', ideCommands: { vscode: 'code' } },
)

export type RepositoryMapping = z.infer<typeof repositoryMappingSchema>
export type RepositoryScanFolder = z.infer<typeof repositoryScanFolderSchema>
export type IdeSettings = z.infer<typeof ideSettingsSchema>

export type ExtensionSettings = {
  mappings: RepositoryMapping[]
  repositoryScanFolders: RepositoryScanFolder[]
  ide: IdeSettings
}

/** Keeps the valid items of a stored list and drops the broken ones instead of failing the list. */
const parseItems = <T>(value: unknown, schema: z.ZodMiniType<T>): T[] =>
  Array.isArray(value)
    ? value.flatMap((item) => {
        const result = schema.safeParse(item)
        return result.success ? [result.data] : []
      })
    : []

/**
 * Parses untrusted stored settings. Broken entries are dropped, duplicates keep the first entry,
 * and scan mappings whose scan folder no longer exists become manual mappings.
 */
export const parseSettings = (value: unknown): ExtensionSettings => {
  const stored = isRecord(value) ? value : {}

  const folderIds = new Set<string>()
  const repositoryScanFolders = parseItems(stored.repositoryScanFolders, repositoryScanFolderSchema).filter(
    (folder) => !folderIds.has(folder.id) && folderIds.add(folder.id),
  )

  const mappingIds = new Set<string>()
  const repositoryKeys = new Set<string>()
  const mappings = parseItems(stored.mappings, repositoryMappingSchema)
    .filter((mapping) => mapping.source === 'manual' || mapping.scanFolderId)
    .filter((mapping) => {
      const key = getRepositoryKey(mapping)
      if (mappingIds.has(mapping.id) || repositoryKeys.has(key)) return false

      mappingIds.add(mapping.id)
      repositoryKeys.add(key)
      return true
    })
    .map((mapping): RepositoryMapping => {
      const hasScanFolder = mapping.source === 'scan' && folderIds.has(mapping.scanFolderId ?? '')
      return hasScanFolder ? mapping : { ...mapping, source: 'manual', scanFolderId: undefined }
    })

  return {
    mappings,
    repositoryScanFolders,
    ide: ideSettingsSchema.parse(stored.ide),
  }
}
