import { createIdeIcon } from '../ide-icon'
import { getIdeLabel } from '@/features/open-in-ide'
import { getSettings } from '@/settings/settings.storage'

type OpenGitHubRepositoryHandler = (button: HTMLButtonElement) => Promise<void>

const OPEN_CODE_DROPDOWN_ITEM_ATTRIBUTE = 'data-open-with-local-ide-code-dropdown-item'

const ACTION_LIST_SELECTOR = 'ul[data-component="ActionList"]'
const CODE_DROPDOWN_ACTION_LIST_SELECTOR =
  'div[class*="CodeDropdownButton-module__ActionList"] ul.prc-ActionList-ActionList-rPFF2.border-top[data-component="ActionList"]'

const isCodeDropdownActionList = (actionList: HTMLUListElement): boolean => {
  const dropdown = actionList.closest('div[class*="CodeDropdownButton"]')
  const actionListText = actionList.textContent ?? ''
  const hasExpectedActions =
    actionListText.includes('Open with GitHub Desktop') && actionListText.includes('Download ZIP')
  const hasCloneInput = Boolean(
    dropdown?.querySelector('input[readonly][value*="github.com"][value$=".git"]'),
  )

  return hasExpectedActions || hasCloneInput
}

const findCodeDropdownActionList = (): HTMLUListElement | null => {
  const actionLists = document.querySelectorAll<HTMLUListElement>(ACTION_LIST_SELECTOR)

  for (const actionList of actionLists) {
    if (isCodeDropdownActionList(actionList)) return actionList
  }

  return document.querySelector<HTMLUListElement>(CODE_DROPDOWN_ACTION_LIST_SELECTOR)
}

const findExistingCodeDropdownItem = (actionList: HTMLUListElement): HTMLLIElement | null =>
  actionList.querySelector<HTMLLIElement>(`[${OPEN_CODE_DROPDOWN_ITEM_ATTRIBUTE}]`)

const readSelectedIdeLabel = async (): Promise<string> => {
  const settings = await getSettings()
  return getIdeLabel(settings.ide.selectedIde)
}

const createCodeDropdownItem = async (
  openGitHubRepository: OpenGitHubRepositoryHandler,
): Promise<HTMLLIElement> => {
  const selectedIdeLabel = await readSelectedIdeLabel()
  const buttonLabel = `Open with ${selectedIdeLabel}`

  const item = Object.assign(document.createElement('li'), {
    className: 'open-with-local-ide-action-item',
  })
  const button = Object.assign(document.createElement('button'), {
    className: 'open-with-local-ide-action-button',
    tabIndex: 0,
    type: 'button',
  })
  const leadingVisual = Object.assign(document.createElement('span'), {
    className: 'open-with-local-ide-action-icon',
  })
  const label = Object.assign(document.createElement('span'), {
    className: 'open-with-local-ide-action-label',
    textContent: buttonLabel,
  })

  item.setAttribute('data-component', 'ActionList.Item')
  item.setAttribute('data-has-description', 'false')
  item.setAttribute(OPEN_CODE_DROPDOWN_ITEM_ATTRIBUTE, 'true')

  button.dataset.size = 'medium'
  button.setAttribute('aria-label', buttonLabel)

  leadingVisual.setAttribute('data-component', 'ActionList.LeadingVisual')
  leadingVisual.append(createIdeIcon())

  label.setAttribute('data-component', 'ActionList.Item.Label')

  button.addEventListener('click', async () => {
    if (button.disabled) return

    button.disabled = true

    try {
      await openGitHubRepository(button)
    } finally {
      button.disabled = false
    }
  })

  button.append(leadingVisual, label)
  item.append(button)

  return item
}

export const removeInjectedGitHubCodeDropdownItems = () => {
  const injectedItems = document.querySelectorAll<HTMLElement>(
    `[${OPEN_CODE_DROPDOWN_ITEM_ATTRIBUTE}]`,
  )

  for (const injectedItem of injectedItems) {
    injectedItem.remove()
  }
}

export const syncInjectedGitHubCodeDropdownItem = async (
  openGitHubRepository: OpenGitHubRepositoryHandler,
) => {
  const actionList = findCodeDropdownActionList()
  if (!actionList) return

  const existingItem = findExistingCodeDropdownItem(actionList)
  if (existingItem) return

  removeInjectedGitHubCodeDropdownItems()

  const item = await createCodeDropdownItem(openGitHubRepository)
  actionList.prepend(item)
}
