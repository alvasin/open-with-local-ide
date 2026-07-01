import {
  createOpenRepositoryRequest,
  getMissingRepoMappingMessage,
  getNativeHostUiMessage,
  type OpenInIdeResponse,
} from '@/features/open-in-ide'
import type { ParsedRemoteLocation } from '@/providers/types'
import { getSettings } from '@/settings/settings.storage'
import { ExtensionMessageType } from '@/shared/extension/extension.enum'
import { isRecord } from '@/shared/record/record.guard'

const logWarnName = '[open-with-local-ide]'

const isOpenInIdeResponse = (value: unknown): value is OpenInIdeResponse =>
  isRecord(value) && typeof value.ok === 'boolean'

export const createOpenCurrentRepositoryAction =
  (readCurrentLocation: () => ParsedRemoteLocation | null) => async (button: HTMLButtonElement) => {
    const currentRepository = readCurrentLocation()
    if (!currentRepository) return

    const settings = await getSettings()
    const result = createOpenRepositoryRequest(currentRepository, settings)

    if (!result.ok) {
      console.warn(logWarnName, getMissingRepoMappingMessage(result.repoKey))
      return
    }

    button.disabled = true

    try {
      const response = await browser.runtime.sendMessage({
        type: ExtensionMessageType.OpenInIde,
        request: result.request,
      })

      if (!isOpenInIdeResponse(response)) return
      if (response.ok) return

      console.warn(logWarnName, getNativeHostUiMessage(response))
    } finally {
      button.disabled = false
    }
  }
