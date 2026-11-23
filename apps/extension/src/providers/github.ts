import { getRepositoryKey } from './repository'
import type { ParsedRemoteLocation, RemoteRepository } from './types'

const GITHUB_HOST = 'github.com'
const GITHUB_BLOB_SEGMENT = 'blob'
const GITHUB_TREE_SEGMENT = 'tree'
const GITHUB_LINE_HASH_PATTERN = /^#L(?<startLine>\d+)(-L\d+)?$/i

// Top-level GitHub routes that look like `/owner/repo` but are not repositories.
const GITHUB_RESERVED_OWNERS = new Set([
  'apps',
  'codespaces',
  'collections',
  'enterprises',
  'explore',
  'features',
  'issues',
  'marketplace',
  'notifications',
  'orgs',
  'organizations',
  'pulls',
  'search',
  'settings',
  'sponsors',
  'topics',
  'users',
])

const readGitHubLine = (hash: string): number | undefined => {
  if (!hash) return undefined

  const match = hash.match(GITHUB_LINE_HASH_PATTERN)
  if (!match?.groups?.startLine) return undefined

  const line = Number.parseInt(match.groups.startLine, 10)
  if (!Number.isFinite(line) || line <= 0) return undefined

  return line
}

const decodePathSegments = (pathname: string): string[] | null => {
  try {
    return pathname.split('/').filter(Boolean).map(decodeURIComponent)
  } catch {
    return null
  }
}

/**
 * Splits `<ref>/<path>` segments after `tree` or `blob`. A URL alone cannot tell where a ref such
 * as `release/1.90` ends, so a ref name known from the page is used when the URL starts with it;
 * otherwise the ref is assumed to be a single segment.
 */
const countRefSegments = (refAndPathSegments: string[], refName?: string): number => {
  const refSegments = refName?.split('/').filter(Boolean) ?? []
  const urlStartsWithRef =
    refSegments.length > 0 && refSegments.every((segment, index) => refAndPathSegments[index] === segment)

  return urlStartsWithRef ? refSegments.length : 1
}

export const parseGitHubUrl = (url: string, refName?: string): ParsedRemoteLocation | null => {
  let parsedUrl: URL

  try {
    parsedUrl = new URL(url)
  } catch {
    return null
  }

  if (parsedUrl.protocol !== 'https:') return null
  if (parsedUrl.hostname !== GITHUB_HOST) return null

  const pathSegments = decodePathSegments(parsedUrl.pathname)
  if (!pathSegments || pathSegments.length < 2) return null

  const [owner, repo, pageSegment, ...refAndPathSegments] = pathSegments
  if (!owner || !repo || GITHUB_RESERVED_OWNERS.has(owner.toLowerCase())) return null

  const repository = {
    provider: 'github',
    host: parsedUrl.hostname,
    owner,
    repo,
    repoKey: getRepositoryKey({ provider: 'github', owner, repo }),
  } satisfies RemoteRepository

  if (!pageSegment) return { ...repository, kind: 'repository' }
  if (pageSegment !== GITHUB_TREE_SEGMENT && pageSegment !== GITHUB_BLOB_SEGMENT) return null
  if (refAndPathSegments.length === 0) return null

  const targetPath = refAndPathSegments.slice(countRefSegments(refAndPathSegments, refName)).join('/')

  if (pageSegment === GITHUB_TREE_SEGMENT) {
    return targetPath
      ? { ...repository, kind: 'directory', directoryPath: targetPath }
      : { ...repository, kind: 'repository' }
  }

  if (!targetPath) return null

  return {
    ...repository,
    kind: 'file',
    filePath: targetPath,
    line: readGitHubLine(parsedUrl.hash),
  }
}
