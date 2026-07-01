import type { ParsedRemoteLocation } from './types'

const GITHUB_HOST = 'github.com'
const GITHUB_BLOB_SEGMENT = 'blob'
const GITHUB_TREE_SEGMENT = 'tree'
const GITHUB_LINE_HASH_PATTERN = /^#L(?<startLine>\d+)(-L\d+)?$/i

const readGitHubLine = (hash: string): number | undefined => {
  if (!hash) return undefined

  const match = hash.match(GITHUB_LINE_HASH_PATTERN)
  if (!match?.groups?.startLine) return undefined

  const line = Number.parseInt(match.groups.startLine, 10)
  if (!Number.isFinite(line) || line <= 0) return undefined

  return line
}

export const parseGitHubUrl = (url: string): ParsedRemoteLocation | null => {
  let parsedUrl: URL

  try {
    parsedUrl = new URL(url)
  } catch {
    return null
  }

  if (parsedUrl.protocol !== 'https:') return null
  if (parsedUrl.hostname !== GITHUB_HOST) return null

  const pathSegments = parsedUrl.pathname.split('/').filter(Boolean)

  if (pathSegments.length < 2) return null

  const [owner, repo, pageSegment, branch, ...filePathSegments] = pathSegments

  if (!owner || !repo) return null

  const repoPage = {
    provider: 'github',
    host: parsedUrl.hostname,
    owner,
    repo,
    repoKey: `${parsedUrl.hostname}/${owner}/${repo}`,
  } satisfies Omit<ParsedRemoteLocation, 'branch' | 'filePath' | 'line'>

  if (!pageSegment) return repoPage

  if (pageSegment === GITHUB_TREE_SEGMENT) {
    if (!branch) return null

    return {
      ...repoPage,
      branch,
      ...(filePathSegments.length > 0 ? { directoryPath: filePathSegments.join('/') } : {}),
    }
  }

  if (pageSegment !== GITHUB_BLOB_SEGMENT || !branch) return null
  if (filePathSegments.length === 0) return null

  const filePath = filePathSegments.join('/')
  const line = readGitHubLine(parsedUrl.hash)

  return {
    ...repoPage,
    branch,
    filePath,
    line,
  }
}

// TODO: GitHub branches can contain slashes.
// TODO: Later improve parsing using GitHub page data or API.
