import type { GitProviderId, RemoteRepository } from './types'

const PROVIDER_HOSTS: Record<GitProviderId, string> = {
  github: 'github.com',
}

type RepositoryIdentity = Pick<RemoteRepository, 'provider' | 'owner' | 'repo'>

/** Canonical repository key such as `github.com/owner/repo`; owner and repo are case-insensitive. */
export const getRepositoryKey = ({ provider, owner, repo }: RepositoryIdentity): string =>
  `${PROVIDER_HOSTS[provider]}/${owner.toLowerCase()}/${repo.toLowerCase()}`

export const isSameRepository = (left: RepositoryIdentity, right: RepositoryIdentity): boolean =>
  getRepositoryKey(left) === getRepositoryKey(right)
