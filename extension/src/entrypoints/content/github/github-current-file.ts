import { GIT_PROVIDERS } from '@/providers'
import type { ParsedRemoteFile } from '@/providers/types'

export const parseCurrentGitHubFile = (): ParsedRemoteFile | null =>
  GIT_PROVIDERS.github(window.location.href)
