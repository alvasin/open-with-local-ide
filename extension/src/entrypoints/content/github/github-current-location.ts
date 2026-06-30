import { GIT_PROVIDERS } from '@/providers'
import type { ParsedRemoteLocation } from '@/providers/types'

export const parseCurrentGitHubLocation = (): ParsedRemoteLocation | null =>
  GIT_PROVIDERS.github(window.location.href)
