import visualStudioCodeIcon from '@iconify-icons/simple-icons/visualstudiocode'
import { buildIcon, iconToHTML } from 'iconify-icon'

export const createIdeIcon = (): SVGElement => {
  const icon = buildIcon(visualStudioCodeIcon, {
    height: 16,
    width: 16,
  })
  const template = document.createElement('template')

  template.innerHTML = iconToHTML(icon.body, {
    ...icon.attributes,
    'aria-hidden': 'true',
    class: 'open-with-local-ide-icon',
    focusable: 'false',
  })

  return template.content.firstElementChild as SVGElement
}
