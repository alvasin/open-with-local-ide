import { createElement } from '../dom'
import type { ExtensionMessage } from '@/shared/extension/extension-messages'
import type { UiError } from '@/shared/ui-errors/ui-errors'

const TOAST_ATTRIBUTE = 'data-open-with-local-ide-toast'
const TOAST_HIDE_DELAY_MS = 8000

let hideTimeoutId: number | undefined

const removeToast = () => {
  window.clearTimeout(hideTimeoutId)
  document.querySelector(`[${TOAST_ATTRIBUTE}]`)?.remove()
}

const createToastButton = (text: string, onClick: () => void) => {
  const button = createElement('button', { class: 'open-with-local-ide-toast-button', type: 'button' }, text)
  button.addEventListener('click', onClick)
  return button
}

const openSettings = (repoKey?: string) => {
  removeToast()
  const message: ExtensionMessage = { type: 'openOptions', repoKey }
  void browser.runtime.sendMessage(message)
}

/** Shows an open-in-IDE error on the GitHub page, replacing a previous one. */
export const showOpenInIdeErrorToast = (error: UiError, repoKey?: string) => {
  removeToast()

  const toast = createElement(
    'div',
    { class: 'open-with-local-ide-toast', role: 'alert', [TOAST_ATTRIBUTE]: 'true' },
    createElement('span', { class: 'open-with-local-ide-toast-message' }, error.message),
  )

  if (error.action === 'openOptions') {
    toast.append(createToastButton('Open settings', () => openSettings(repoKey)))
  }

  toast.append(createToastButton('Dismiss', removeToast))
  document.body.append(toast)
  hideTimeoutId = window.setTimeout(removeToast, TOAST_HIDE_DELAY_MS)
}
