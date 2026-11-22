import { GIT_PROVIDERS } from '@/providers'
import type { ParsedRemoteLocation } from '@/providers/types'

export const parseCurrentGitHubLocation = (): ParsedRemoteLocation | null =>
  GIT_PROVIDERS.github(window.location.href)

export const isCurrentGitHubRepositoryRootPage = (): boolean => {
  const currentLocation = parseCurrentGitHubLocation()
  if (!currentLocation || currentLocation.filePath) return false

  const pathSegments = window.location.pathname.split('/').filter(Boolean)

  if (pathSegments.length === 2) return true

  const [, , pageSegment, branch, ...nestedPathSegments] = pathSegments

  return pageSegment === 'tree' && Boolean(branch) && nestedPathSegments.length === 0
}
