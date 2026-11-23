import { createElement, onAsyncClick } from '../dom'
import { createIdeIcon, readSelectedIdeLabel } from '../ide'

const OPEN_CODE_DROPDOWN_ITEM_ATTRIBUTE = 'data-open-with-local-ide-code-dropdown-item'

const ACTION_LIST_SELECTOR = 'ul[data-component="ActionList"]'
const CODE_DROPDOWN_ACTION_LIST_SELECTOR =
  'div[class*="CodeDropdownButton-module__ActionList"] ul.prc-ActionList-ActionList-rPFF2.border-top[data-component="ActionList"]'

const isCodeDropdownActionList = (actionList: HTMLUListElement): boolean => {
  const dropdown = actionList.closest('div[class*="CodeDropdownButton"]')
  const actionListText = actionList.textContent ?? ''
  const hasExpectedActions =
    actionListText.includes('Open with GitHub Desktop') && actionListText.includes('Download ZIP')
  const hasCloneInput = Boolean(dropdown?.querySelector('input[readonly][value*="github.com"][value$=".git"]'))

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

const createCodeDropdownItem = async (openRepository: () => Promise<void>): Promise<HTMLLIElement> => {
  const label = `Open with ${await readSelectedIdeLabel()}`
  const button = createElement(
    'button',
    {
      class: 'open-with-local-ide-action-button',
      type: 'button',
      tabindex: '0',
      'aria-label': label,
      'data-size': 'medium',
    },
    createElement(
      'span',
      { class: 'open-with-local-ide-action-icon', 'data-component': 'ActionList.LeadingVisual' },
      createIdeIcon(),
    ),
    createElement(
      'span',
      { class: 'open-with-local-ide-action-label', 'data-component': 'ActionList.Item.Label' },
      label,
    ),
  )

  onAsyncClick(button, openRepository)

  return createElement(
    'li',
    {
      class: 'open-with-local-ide-action-item',
      'data-component': 'ActionList.Item',
      'data-has-description': 'false',
      [OPEN_CODE_DROPDOWN_ITEM_ATTRIBUTE]: 'true',
    },
    button,
  )
}

export const removeInjectedGitHubCodeDropdownItems = () => {
  for (const item of document.querySelectorAll(`[${OPEN_CODE_DROPDOWN_ITEM_ATTRIBUTE}]`)) item.remove()
}

/** Adds the "open repository" item to the top of GitHub's Code dropdown. */
export const syncInjectedGitHubCodeDropdownItem = async (openRepository: () => Promise<void>) => {
  const actionList = findCodeDropdownActionList()
  if (!actionList || findExistingCodeDropdownItem(actionList)) return

  const item = await createCodeDropdownItem(openRepository)
  // Another sync may have added the item while the settings were loading.
  if (findExistingCodeDropdownItem(actionList)) return

  removeInjectedGitHubCodeDropdownItems()
  actionList.prepend(item)
}
