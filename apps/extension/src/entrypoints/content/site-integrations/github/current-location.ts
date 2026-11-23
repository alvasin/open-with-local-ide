import { GIT_PROVIDERS } from '@/providers'
import type { ParsedRemoteLocation } from '@/providers/types'

const EMBEDDED_DATA_SELECTOR = 'script[type="application/json"][data-target="react-app.embeddedData"]'

// The embedded data is large and the location is read on every DOM change, so parse each script
// element once.
const refNameCache = new WeakMap<Element, string | undefined>()

const parseRefName = (json: string): string | undefined => {
  try {
    // Untrusted page data: only a string at this exact path is accepted.
    const name: unknown = JSON.parse(json)?.payload?.codeViewLayoutRoute?.refInfo?.name
    return typeof name === 'string' ? name : undefined
  } catch {
    return undefined
  }
}

/**
 * Reads the current branch or tag name from GitHub's embedded page data. It reflects the initial
 * page load and can be stale after client-side navigation, so the URL parser only uses it when the
 * URL actually starts with it.
 */
const readGitHubRefName = (): string | undefined => {
  const script = document.querySelector(EMBEDDED_DATA_SELECTOR)
  if (!script) return undefined

  if (!refNameCache.has(script)) refNameCache.set(script, parseRefName(script.textContent ?? ''))

  return refNameCache.get(script)
}

export const parseCurrentGitHubLocation = (): ParsedRemoteLocation | null =>
  GIT_PROVIDERS.github(window.location.href, readGitHubRefName())
