import triangleDownIcon from '@iconify-icons/octicon/triangle-down-16'
import { buildIcon, iconToHTML } from 'iconify-icon'
import { createIdeIcon } from '../ide-icon'
import { getIdeLabel } from '@/features/open-in-ide'
import { getSettings } from '@/settings/settings.storage'

const OPEN_DIRECTORY_DROPDOWN_ATTRIBUTE = 'data-open-with-local-ide-directory-dropdown'
const OPEN_DIRECTORY_BUTTON_CLASS =
  'prc-Button-ButtonBase-9n-Xk open-with-local-ide-directory-button'
const dropdownCleanups = new WeakMap<HTMLElement, () => void>()

type DirectoryDropdownActions = {
  openDirectory: (button: HTMLButtonElement) => Promise<void>
  openRepository: (button: HTMLButtonElement) => Promise<void>
}

const findDirectoryActionsContainer = (): HTMLElement | null => {
  const headings = document.querySelectorAll<HTMLHeadingElement>(
    'h2[data-testid="screen-reader-heading"]',
  )

  for (const heading of headings) {
    if (heading.textContent?.trim() !== 'Directory actions') continue

    return heading.closest<HTMLElement>('div.d-flex')
  }

  return null
}

const findDirectoryTextInputBlock = (container: HTMLElement): Element | null =>
  Array.from(container.children).find((child) =>
    child.querySelector('[data-component="TextInput"]'),
  ) ?? null

const findExistingDirectoryDropdown = (container: HTMLElement): HTMLElement | null =>
  container.querySelector<HTMLElement>(`[${OPEN_DIRECTORY_DROPDOWN_ATTRIBUTE}]`)

const readSelectedIdeLabel = async (): Promise<string> => {
  const settings = await getSettings()
  return getIdeLabel(settings.ide.selectedIde)
}

const createTriangleDownIcon = (): SVGSVGElement => {
  const icon = buildIcon(triangleDownIcon, {
    height: 16,
    width: 16,
  })
  const template = document.createElement('template')

  template.innerHTML = iconToHTML(icon.body, {
    ...icon.attributes,
    'aria-hidden': 'true',
    class: 'octicon octicon-triangle-down',
    focusable: 'false',
  })

  return template.content.firstElementChild as SVGSVGElement
}

const createMenuItem = (
  label: string,
  action: (button: HTMLButtonElement) => Promise<void>,
  closeMenu: () => void,
): HTMLButtonElement => {
  const button = Object.assign(document.createElement('button'), {
    className: 'open-with-local-ide-directory-menu-item',
    textContent: label,
    type: 'button',
  })

  button.addEventListener('click', async () => {
    if (button.disabled) return

    button.disabled = true

    try {
      await action(button)
      closeMenu()
    } finally {
      button.disabled = false
    }
  })

  return button
}

const createDirectoryDropdown = async ({
  openDirectory,
  openRepository,
}: DirectoryDropdownActions): Promise<HTMLElement> => {
  const selectedIdeLabel = await readSelectedIdeLabel()
  const buttonLabel = `Open folder in ${selectedIdeLabel}`
  const abortController = new AbortController()
  const wrapper = Object.assign(document.createElement('div'), {
    className: 'open-with-local-ide-directory-dropdown',
  })
  const button = Object.assign(document.createElement('button'), {
    className: OPEN_DIRECTORY_BUTTON_CLASS,
    tabIndex: 0,
    type: 'button',
  })
  const buttonVisual = Object.assign(document.createElement('span'), {
    className: 'open-with-local-ide-directory-button-visual',
  })
  const menu = Object.assign(document.createElement('div'), {
    className: 'open-with-local-ide-directory-menu',
    hidden: true,
  })

  const closeMenu = () => {
    menu.hidden = true
    button.setAttribute('aria-expanded', 'false')
  }

  const toggleMenu = () => {
    menu.hidden = !menu.hidden
    button.setAttribute('aria-expanded', String(!menu.hidden))
  }

  wrapper.setAttribute(OPEN_DIRECTORY_DROPDOWN_ATTRIBUTE, 'true')

  button.setAttribute('aria-label', buttonLabel)
  button.setAttribute('aria-haspopup', 'true')
  button.setAttribute('aria-expanded', 'false')
  button.setAttribute('title', buttonLabel)
  button.setAttribute('data-component', 'Button')
  button.setAttribute('data-loading', 'false')
  button.setAttribute('data-no-visuals', 'true')
  button.setAttribute('data-size', 'medium')
  button.setAttribute('data-variant', 'default')

  menu.setAttribute('role', 'menu')
  menu.append(
    createMenuItem('Open this folder as workspace', openDirectory, closeMenu),
    createMenuItem('Open repository root', openRepository, closeMenu),
  )

  button.addEventListener('click', (event) => {
    event.stopPropagation()
    toggleMenu()
  })
  menu.addEventListener('click', (event) => {
    event.stopPropagation()
  })
  document.addEventListener('click', closeMenu, { signal: abortController.signal })

  buttonVisual.append(createIdeIcon(), createTriangleDownIcon())
  button.append(buttonVisual)
  wrapper.append(button, menu)
  dropdownCleanups.set(wrapper, () => abortController.abort())

  return wrapper
}

export const removeInjectedGitHubDirectoryDropdowns = () => {
  const injectedDropdowns = document.querySelectorAll<HTMLElement>(
    `[${OPEN_DIRECTORY_DROPDOWN_ATTRIBUTE}]`,
  )

  for (const injectedDropdown of injectedDropdowns) {
    dropdownCleanups.get(injectedDropdown)?.()
    dropdownCleanups.delete(injectedDropdown)
    injectedDropdown.remove()
  }
}

export const syncInjectedGitHubDirectoryDropdown = async (actions: DirectoryDropdownActions) => {
  const targetContainer = findDirectoryActionsContainer()
  if (!targetContainer) return

  const textInputBlock = findDirectoryTextInputBlock(targetContainer)
  if (!textInputBlock) return

  const existingDropdown = findExistingDirectoryDropdown(targetContainer)
  if (existingDropdown) return

  removeInjectedGitHubDirectoryDropdowns()

  const dropdown = await createDirectoryDropdown(actions)
  textInputBlock.after(dropdown)
}
