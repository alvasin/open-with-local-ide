import { isSameRepository } from '@/settings/mappings/mappings'
import type { RepositoryMapping } from '@/settings/mappings/mappings.types'
import { getSettings, saveSettings } from '@/settings/settings.storage'

export const saveManualMapping = async (input: {
  owner: string
  repo: string
  repoPath: string
}): Promise<void> => {
  const current = await getSettings()
  const normalizedInput = {
    provider: 'github' as const,
    owner: input.owner.trim().toLowerCase(),
    repo: input.repo.trim().toLowerCase(),
  }
  const existing = current.mappings.find((mapping) => isSameRepository(mapping, normalizedInput))
  const mapping: RepositoryMapping = {
    id: existing?.id ?? crypto.randomUUID(),
    ...normalizedInput,
    repoPath: input.repoPath.trim(),
    source: 'manual',
  }

  await saveSettings({
    ...current,
    mappings: [
      ...current.mappings.filter((candidate) => !isSameRepository(candidate, mapping)),
      mapping,
    ],
  })
}

export const deleteRepositoryMapping = async (mappingId: string): Promise<void> => {
  const current = await getSettings()
  await saveSettings({
    ...current,
    mappings: current.mappings.filter((mapping) => mapping.id !== mappingId),
  })
}
