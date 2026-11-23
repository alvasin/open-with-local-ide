import { showOpenInIdeErrorToast } from '../site-integrations/github/injected-controls/toast'
import { openLocationInIde } from '@/features/open-in-ide'
import type { ParsedRemoteLocation } from '@/providers/types'

export const openLocation = async (location: ParsedRemoteLocation | null): Promise<void> => {
  if (!location) return

  const error = await openLocationInIde(location)
  if (error) showOpenInIdeErrorToast(error, location.repoKey)
}
