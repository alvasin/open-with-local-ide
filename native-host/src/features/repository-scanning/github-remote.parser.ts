const HTTPS_GITHUB_REMOTE = /^https:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/i
const SCP_GITHUB_REMOTE = /^git@github\.com:([^/]+)\/([^/]+?)(?:\.git)?$/i
const SSH_GITHUB_REMOTE = /^ssh:\/\/git@github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/i

export type ParsedGitHubRemote = {
  owner: string
  repo: string
}

export const parseGitHubRemote = (remoteUrl: string): ParsedGitHubRemote | null => {
  const value = remoteUrl.trim()
  const match =
    value.match(HTTPS_GITHUB_REMOTE) ??
    value.match(SCP_GITHUB_REMOTE) ??
    value.match(SSH_GITHUB_REMOTE)

  const owner = match?.[1]
  const repo = match?.[2]
  if (!owner || !repo) return null

  return {
    owner: owner.toLowerCase(),
    repo: repo.toLowerCase(),
  }
}
