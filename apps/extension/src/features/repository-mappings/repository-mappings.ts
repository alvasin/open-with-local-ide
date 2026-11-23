import { isSameRepository } from '@/providers/repository'
import { updateSettings } from '@/settings/settings.storage'

/** Adds a manual mapping, or turns the existing mapping of the same repository into it. */
export const saveManualMapping = (input: { owner: string; repo: string; repoPath: string }): Promise<void> =>
  updateSettings((settings) => {
    const repository = {
      provider: 'github' as const,
      owner: input.owner.trim().toLowerCase(),
      repo: input.repo.trim().toLowerCase(),
    }
    const repoPath = input.repoPath.trim()
    const existing = settings.mappings.find((mapping) => isSameRepository(mapping, repository))

    if (!existing) {
      settings.mappings.push({ id: crypto.randomUUID(), ...repository, repoPath, source: 'manual' })
      return
    }

    existing.repoPath = repoPath
    existing.source = 'manual'
    existing.scanFolderId = undefined
  })

export const deleteRepositoryMapping = (mappingId: string): Promise<void> =>
  updateSettings((settings) => {
    settings.mappings = settings.mappings.filter(({ id }) => id !== mappingId)
  })
