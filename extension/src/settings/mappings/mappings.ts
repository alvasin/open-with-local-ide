import type { RepositoryMapping } from './mappings.types'

export const getRepositoryKey = (
  mapping: Pick<RepositoryMapping, 'provider' | 'owner' | 'repo'>,
): string => `${mapping.provider}.com/${mapping.owner.toLowerCase()}/${mapping.repo.toLowerCase()}`

export const isSameRepository = (
  left: Pick<RepositoryMapping, 'provider' | 'owner' | 'repo'>,
  right: Pick<RepositoryMapping, 'provider' | 'owner' | 'repo'>,
): boolean => getRepositoryKey(left) === getRepositoryKey(right)
