type Child = Node | string

/** Creates an element with its attributes and children in one call. */
export const createElement = <Tag extends keyof HTMLElementTagNameMap>(
  tag: Tag,
  attributes: Record<string, string>,
  ...children: Child[]
): HTMLElementTagNameMap[Tag] => {
  const element = document.createElement(tag)
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value)
  element.append(...children)
  return element
}

/** Runs `action` on click and keeps the button disabled until it finishes, so clicks cannot stack. */
export const onAsyncClick = (button: HTMLButtonElement, action: () => Promise<void>) => {
  button.addEventListener('click', async () => {
    if (button.disabled) return

    button.disabled = true
    try {
      await action()
    } finally {
      button.disabled = false
    }
  })
}
