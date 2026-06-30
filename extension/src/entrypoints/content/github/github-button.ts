import { getIdeLabel } from '@/features/open-in-ide'
import { getSettings } from '@/settings/settings.storage'

type OpenGitHubFileHandler = (button: HTMLButtonElement) => Promise<void>

const OPEN_BUTTON_ATTRIBUTE = 'data-open-with-local-ide-button'
const OPEN_BUTTON_CLASS = 'open-with-local-ide-button'
const OPEN_BUTTON_LOADING_TEXT = 'Opening...'

const GITHUB_FILE_ACTION_SELECTORS = [
  'a[data-testid="raw-button"]',
  'a[href*="/raw/"]',
  'a[href*="/blame/"]',
]

const findFileActionsContainer = (): HTMLElement | null => {
  for (const selector of GITHUB_FILE_ACTION_SELECTORS) {
    const actionElement = document.querySelector<HTMLElement>(selector)
    if (!actionElement) continue

    const actionContainer = actionElement.parentElement
    if (actionContainer instanceof HTMLElement) return actionContainer
  }

  return null
}

const findExistingButton = (container: HTMLElement): HTMLButtonElement | null =>
  container.querySelector<HTMLButtonElement>(`[${OPEN_BUTTON_ATTRIBUTE}]`)

const readSelectedIdeLabel = async (): Promise<string> => {
  const settings = await getSettings()
  return getIdeLabel(settings.ide.selectedIde)
}

const setButtonLoading = (button: HTMLButtonElement, isLoading: boolean) => {
  const idleLabel = button.dataset.idleLabel ?? button.textContent ?? ''

  button.disabled = isLoading
  button.textContent = isLoading ? OPEN_BUTTON_LOADING_TEXT : idleLabel
  button.setAttribute('aria-busy', String(isLoading))
}

const createOpenButton = async (
  openGitHubFile: OpenGitHubFileHandler,
): Promise<HTMLButtonElement> => {
  const selectedIdeLabel = await readSelectedIdeLabel()
  const buttonLabel = `Open with ${selectedIdeLabel}`
  const button = document.createElement('button')

  button.type = 'button'
  button.textContent = buttonLabel
  button.dataset.idleLabel = buttonLabel
  button.className = OPEN_BUTTON_CLASS
  button.setAttribute('aria-label', buttonLabel)
  button.setAttribute(OPEN_BUTTON_ATTRIBUTE, 'true')

  button.addEventListener('click', async () => {
    if (button.disabled) return

    setButtonLoading(button, true)

    try {
      await openGitHubFile(button)
    } finally {
      setButtonLoading(button, false)
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
  openGitHubFile: OpenGitHubFileHandler,
) => {
  removeInjectedGitHubButtons()

  const button = await createOpenButton(openGitHubFile)
  targetContainer.append(button)
}

export const syncInjectedGitHubButton = async (openGitHubFile: OpenGitHubFileHandler) => {
  const targetContainer = findFileActionsContainer()
  if (!targetContainer) return

  const existingButton = findExistingButton(targetContainer)
  if (existingButton) return

  await mountOpenButton(targetContainer, openGitHubFile)
}
