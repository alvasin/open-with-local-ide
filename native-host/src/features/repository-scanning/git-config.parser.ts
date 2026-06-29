export type GitRemote = {
  name: string
  url: string
}

const REMOTE_SECTION_PATTERN = /^\s*\[\s*remote\s+"([^"]+)"\s*]\s*$/
const URL_PATTERN = /^\s*url\s*=\s*(.+?)\s*$/

export const parseGitRemotes = (config: string): GitRemote[] => {
  const remotes: GitRemote[] = []
  let currentRemoteName: string | undefined

  for (const line of config.split(/\r?\n/)) {
    const sectionMatch = line.match(REMOTE_SECTION_PATTERN)
    if (sectionMatch) {
      currentRemoteName = sectionMatch[1]
      continue
    }

    if (/^\s*\[/.test(line)) {
      currentRemoteName = undefined
      continue
    }

    const urlMatch = line.match(URL_PATTERN)
    if (currentRemoteName && urlMatch?.[1]) {
      remotes.push({ name: currentRemoteName, url: urlMatch[1] })
    }
  }

  return remotes
}
