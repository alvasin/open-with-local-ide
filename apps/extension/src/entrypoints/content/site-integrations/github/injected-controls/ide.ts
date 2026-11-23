import visualStudioCodeIcon from '@iconify-icons/simple-icons/visualstudiocode'
import { buildIcon, iconToHTML } from 'iconify-icon'
import { getSettings } from '@/settings/settings.storage'
import { getIdeLabel } from '@/shared/ide/ide'

export const createIcon = (iconData: typeof visualStudioCodeIcon, className: string): SVGElement => {
  const icon = buildIcon(iconData, { height: 16, width: 16 })
  const template = document.createElement('template')

  template.innerHTML = iconToHTML(icon.body, {
    ...icon.attributes,
    'aria-hidden': 'true',
    class: className,
    focusable: 'false',
  })

  return template.content.firstElementChild as SVGElement
}

export const createIdeIcon = (): SVGElement => createIcon(visualStudioCodeIcon, 'open-with-local-ide-icon')

export const readSelectedIdeLabel = async (): Promise<string> => getIdeLabel((await getSettings()).ide.selectedIde)
