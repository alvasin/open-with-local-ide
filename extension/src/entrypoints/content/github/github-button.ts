import { openCurrentGitHubFile } from '../open-file/open-current-github-file'
import { getIdeLabel } from '@/features/open-file/openFile'
import { getSettings } from '@/settings/settings.storage'

const OPEN_BUTTON_ATTRIBUTE = 'data-open-with-local-ide-button'

const GITHUB_FILE_ACTION_SELECTORS = [
  'a[data-testid="raw-button"]',
  'a[href*="/raw/"]',
  'a[href*="/blame/"]',
  'a[href*="/commits/"]',
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

const readSelectedIdeLabel = async (): Promise<string> => {
  const settings = await getSettings()
  return getIdeLabel(settings.ide.selectedIde)
}

const createOpenButton = async (): Promise<HTMLButtonElement> => {
  const selectedIdeLabel = await readSelectedIdeLabel()
  const button = document.createElement('button')

  button.type = 'button'
  button.textContent = `Open with ${selectedIdeLabel}`
  button.setAttribute(OPEN_BUTTON_ATTRIBUTE, 'true')
  button.style.padding = '6px 12px'
  button.style.border = '1px solid var(--borderColor-default, #d0d7de)'
  button.style.borderRadius = '6px'
  button.style.background = 'var(--button-default-bgColor-rest, #f6f8fa)'
  button.style.color = 'var(--fgColor-default, #1f2328)'
  button.style.cursor = 'pointer'

  button.addEventListener('click', () => {
    void openCurrentGitHubFile(button)
  })

  return button
}

export const removeInjectedGitHubButtons = () => {
  const injectedButtons = document.querySelectorAll<HTMLElement>(`[${OPEN_BUTTON_ATTRIBUTE}]`)

  for (const injectedButton of injectedButtons) {
    injectedButton.remove()
  }
}

export const syncInjectedGitHubButton = async () => {
  const targetContainer = findFileActionsContainer()
  if (!targetContainer) return

  const existingButton = targetContainer.querySelector<HTMLButtonElement>(
    `[${OPEN_BUTTON_ATTRIBUTE}]`,
  )
  if (existingButton) return

  removeInjectedGitHubButtons()

  const button = await createOpenButton()
  targetContainer.append(button)
}
