import { createElement, onAsyncClick } from '../dom'
import { createIdeIcon, readSelectedIdeLabel } from '../ide'

const OPEN_BUTTON_ATTRIBUTE = 'data-open-with-local-ide-button'
const OPEN_BUTTON_CLASS = 'prc-Button-ButtonBase-9n-Xk prc-Button-IconButton-fyge7 open-with-local-ide-button'
const GITHUB_BLOB_HEADER_ACTIONS_SELECTOR = 'div[class*="BlobViewHeader-module__Box_3"]'

const findExistingButton = () => document.querySelector(`[${OPEN_BUTTON_ATTRIBUTE}]`)

const createOpenButton = async (openFile: () => Promise<void>): Promise<HTMLButtonElement> => {
  const label = `Open with ${await readSelectedIdeLabel()}`
  const button = createElement(
    'button',
    {
      class: OPEN_BUTTON_CLASS,
      type: 'button',
      tabindex: '0',
      title: label,
      'aria-label': label,
      // Primer button attributes, so the button looks like GitHub's own icon buttons.
      'data-component': 'IconButton',
      'data-loading': 'false',
      'data-no-visuals': 'true',
      'data-size': 'small',
      'data-variant': 'default',
      [OPEN_BUTTON_ATTRIBUTE]: 'true',
    },
    createIdeIcon(),
  )

  onAsyncClick(button, openFile)
  return button
}

export const removeInjectedGitHubButtons = () => {
  for (const button of document.querySelectorAll(`[${OPEN_BUTTON_ATTRIBUTE}]`)) button.remove()
}

/** Adds the "open file" button before the first action in the file header. */
export const syncInjectedGitHubButton = async (openFile: () => Promise<void>) => {
  const container = document.querySelector<HTMLElement>(GITHUB_BLOB_HEADER_ACTIONS_SELECTOR)
  if (!container || findExistingButton()) return

  const button = await createOpenButton(openFile)
  // Another sync may have added the button while the settings were loading.
  if (findExistingButton()) return

  const firstAction = container.querySelector(':scope > button, :scope > a')
  if (firstAction) firstAction.before(button)
  else container.append(button)
}
