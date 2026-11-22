import { createIdeIcon } from '../ide-icon'
import { getIdeLabel } from '@/features/open-in-ide'
import { getSettings } from '@/settings/settings.storage'

const OPEN_BUTTON_ATTRIBUTE = 'data-open-with-local-ide-button'
const OPEN_BUTTON_CLASS =
  'prc-Button-ButtonBase-9n-Xk prc-Button-IconButton-fyge7 open-with-local-ide-button'

const GITHUB_BLOB_HEADER_ACTIONS_SELECTOR = 'div[class*="BlobViewHeader-module__Box_3"]'

const findFileActionsContainer = (): HTMLElement | null =>
  document.querySelector<HTMLElement>(GITHUB_BLOB_HEADER_ACTIONS_SELECTOR)

const findExistingButton = (): HTMLButtonElement | null =>
  document.querySelector<HTMLButtonElement>(`[${OPEN_BUTTON_ATTRIBUTE}]`)

const readSelectedIdeLabel = async (): Promise<string> => {
  const settings = await getSettings()
  return getIdeLabel(settings.ide.selectedIde)
}

const createOpenButton = async (
  openGitHubFile: (button: HTMLButtonElement) => Promise<void>,
): Promise<HTMLButtonElement> => {
  const selectedIdeLabel = await readSelectedIdeLabel()
  const buttonLabel = `Open with ${selectedIdeLabel}`
  const button = Object.assign(document.createElement('button'), {
    className: OPEN_BUTTON_CLASS,
    tabIndex: 0,
    title: buttonLabel,
    type: 'button',
  })

  button.setAttribute('aria-label', buttonLabel)
  button.setAttribute('data-component', 'IconButton')
  button.setAttribute('data-loading', 'false')
  button.setAttribute('data-no-visuals', 'true')
  button.setAttribute('data-size', 'small')
  button.setAttribute('data-variant', 'default')
  button.setAttribute(OPEN_BUTTON_ATTRIBUTE, 'true')
  button.append(createIdeIcon())

  button.addEventListener('click', async () => {
    if (button.disabled) return

    button.disabled = true

    try {
      await openGitHubFile(button)
    } finally {
      button.disabled = false
    }
  })

  return button
}

export const removeInjectedGitHubButtons = () => {
  const injectedButtons = document.querySelectorAll<HTMLElement>(`[${OPEN_BUTTON_ATTRIBUTE}]`)

  for (const injectedButton of injectedButtons) {
    injectedButton.remove()
  }
}

const mountOpenButton = async (
  targetContainer: HTMLElement,
  openGitHubFile: (button: HTMLButtonElement) => Promise<void>,
) => {
  removeInjectedGitHubButtons()

  const button = await createOpenButton(openGitHubFile)
  const firstVisibleAction = targetContainer.querySelector<HTMLElement>(
    ':scope > button, :scope > a, :scope > [data-open-with-local-ide-button]',
  )

  if (firstVisibleAction) {
    firstVisibleAction.before(button)
    return
  }

  targetContainer.append(button)
}

export const syncInjectedGitHubButton = async (
  openGitHubFile: (button: HTMLButtonElement) => Promise<void>,
) => {
  const targetContainer = findFileActionsContainer()
  if (!targetContainer) return

  const existingButton = findExistingButton()
  if (existingButton) return

  await mountOpenButton(targetContainer, openGitHubFile)
}
