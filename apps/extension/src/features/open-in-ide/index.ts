import type { OpenInIdeRequest } from '@open-with-local-ide/protocol'
import type { OpenInIdeResponse } from './open-in-ide.native'
import { ExtensionNativeErrorCode } from '@/native-messaging'
import { isSameRepository } from '@/providers/repository'
import type { ParsedRemoteLocation } from '@/providers/types'
import type { RepositoryMapping } from '@/settings/settings.schema'
import type { ExtensionSettings } from '@/settings/settings.schema'
import { getSettings } from '@/settings/settings.storage'
import type { ExtensionMessage } from '@/shared/extension/extension-messages'
import { isRecord } from '@/shared/record/record.guard'
import { getMissingRepoMappingError, getUiError, type UiError } from '@/shared/ui-errors/ui-errors'

export { openInIde, type OpenInIdeResponse } from './open-in-ide.native'

export const findRepositoryMapping = (
  location: ParsedRemoteLocation,
  settings: ExtensionSettings,
): RepositoryMapping | undefined => settings.mappings.find((mapping) => isSameRepository(mapping, location))

const toTarget = (location: ParsedRemoteLocation): OpenInIdeRequest['target'] => {
  switch (location.kind) {
    case 'file':
      return { kind: 'file', filePath: location.filePath, line: location.line }
    case 'directory':
      return { kind: 'directory', directoryPath: location.directoryPath }
    case 'repository':
      return { kind: 'repository' }
  }
}

// The background already validated the host response with the protocol schemas, so a shape check
// is enough here and keeps zod out of the content script and popup bundles.
const sendToBackground = async (request: OpenInIdeRequest): Promise<OpenInIdeResponse> => {
  const message: ExtensionMessage = { type: 'openInIde', request }
  const response: unknown = await browser.runtime.sendMessage(message)

  const isValid =
    isRecord(response) && (response.ok === true || (response.ok === false && typeof response.errorCode === 'string'))

  return isValid
    ? (response as OpenInIdeResponse)
    : { ok: false, errorCode: ExtensionNativeErrorCode.InvalidNativeHostResponse }
}

/** Opens a remote location in the local IDE. Returns `null` on success or an error to show. */
export const openLocationInIde = async (location: ParsedRemoteLocation): Promise<UiError | null> => {
  const settings = await getSettings()
  const mapping = findRepositoryMapping(location, settings)
  if (!mapping) return getMissingRepoMappingError(location.repoKey)

  try {
    const response = await sendToBackground({
      action: 'openInIde',
      provider: location.provider,
      ide: settings.ide.selectedIde,
      repoKey: location.repoKey,
      repoPath: mapping.repoPath,
      target: toTarget(location),
    })

    return response.ok ? null : getUiError(response.errorCode)
  } catch {
    // Typically the extension was reloaded and this page still runs the old content script.
    return { message: 'Extension is not reachable. Reload the page and try again.' }
  }
}
