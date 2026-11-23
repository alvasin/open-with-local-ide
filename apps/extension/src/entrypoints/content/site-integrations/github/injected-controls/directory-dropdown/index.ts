import triangleDownIcon from '@iconify-icons/octicon/triangle-down-16'
import { createElement, onAsyncClick } from '../dom'
import { createIcon, createIdeIcon, readSelectedIdeLabel } from '../ide'

const OPEN_DIRECTORY_DROPDOWN_ATTRIBUTE = 'data-open-with-local-ide-directory-dropdown'
const OPEN_DIRECTORY_BUTTON_CLASS = 'prc-Button-ButtonBase-9n-Xk open-with-local-ide-directory-button'

// Removes the document-level "close on outside click" listener of a dropdown.
const dropdownCleanups = new WeakMap<HTMLElement, () => void>()

type DirectoryDropdownActions = {
  openDirectory: () => Promise<void>
  openRepository: () => Promise<void>
}

const findDirectoryActionsContainer = (): HTMLElement | null => {
  const headings = document.querySelectorAll('h2[data-testid="screen-reader-heading"]')

  for (const heading of headings) {
    if (heading.textContent?.trim() === 'Directory actions') {
      return heading.closest<HTMLElement>('div.d-flex')
    }
  }

  return null
}

const findDirectoryTextInputBlock = (container: HTMLElement): Element | undefined =>
  Array.from(container.children).find((child) => child.querySelector('[data-component="TextInput"]'))

const findExistingDirectoryDropdown = (container: HTMLElement) =>
  container.querySelector(`[${OPEN_DIRECTORY_DROPDOWN_ATTRIBUTE}]`)

const createDirectoryDropdown = async ({
  openDirectory,
  openRepository,
}: DirectoryDropdownActions): Promise<HTMLElement> => {
  const label = `Open folder in ${await readSelectedIdeLabel()}`
  const abortController = new AbortController()

  const button = createElement(
    'button',
    {
      class: OPEN_DIRECTORY_BUTTON_CLASS,
      type: 'button',
      tabindex: '0',
      title: label,
      'aria-label': label,
      'aria-haspopup': 'true',
      'aria-expanded': 'false',
      // Primer button attributes, so the button looks like GitHub's own buttons.
      'data-component': 'Button',
      'data-loading': 'false',
      'data-no-visuals': 'true',
      'data-size': 'medium',
      'data-variant': 'default',
    },
    createElement(
      'span',
      { class: 'open-with-local-ide-directory-button-visual' },
      createIdeIcon(),
      createIcon(triangleDownIcon, 'octicon octicon-triangle-down'),
    ),
  )
  const menu = createElement('div', { class: 'open-with-local-ide-directory-menu', role: 'menu' })
  menu.hidden = true

  const setMenuOpen = (isOpen: boolean) => {
    menu.hidden = !isOpen
    button.setAttribute('aria-expanded', String(isOpen))
  }

  const createMenuItem = (text: string, action: () => Promise<void>) => {
    const item = createElement('button', { class: 'open-with-local-ide-directory-menu-item', type: 'button' }, text)
    onAsyncClick(item, async () => {
      await action()
      setMenuOpen(false)
    })
    return item
  }

  menu.append(
    createMenuItem('Open this folder as workspace', openDirectory),
    createMenuItem('Open repository root', openRepository),
  )

  button.addEventListener('click', (event) => {
    event.stopPropagation()
    setMenuOpen(menu.hidden)
  })
  menu.addEventListener('click', (event) => event.stopPropagation())
  document.addEventListener('click', () => setMenuOpen(false), { signal: abortController.signal })

  const wrapper = createElement(
    'div',
    {
      class: 'open-with-local-ide-directory-dropdown',
      [OPEN_DIRECTORY_DROPDOWN_ATTRIBUTE]: 'true',
    },
    button,
    menu,
  )
  dropdownCleanups.set(wrapper, () => abortController.abort())

  return wrapper
}

export const removeInjectedGitHubDirectoryDropdowns = () => {
  for (const dropdown of document.querySelectorAll<HTMLElement>(`[${OPEN_DIRECTORY_DROPDOWN_ATTRIBUTE}]`)) {
    dropdownCleanups.get(dropdown)?.()
    dropdownCleanups.delete(dropdown)
    dropdown.remove()
  }
}

/** Adds the "open folder" dropdown after the file search input of a directory page. */
export const syncInjectedGitHubDirectoryDropdown = async (actions: DirectoryDropdownActions) => {
  const container = findDirectoryActionsContainer()
  const textInputBlock = container && findDirectoryTextInputBlock(container)
  if (!container || !textInputBlock || findExistingDirectoryDropdown(container)) return

  const dropdown = await createDirectoryDropdown(actions)
  // Another sync may have added the dropdown while the settings were loading.
  if (findExistingDirectoryDropdown(container)) {
    dropdownCleanups.get(dropdown)?.()
    return
  }

  removeInjectedGitHubDirectoryDropdowns()
  textInputBlock.after(dropdown)
}
