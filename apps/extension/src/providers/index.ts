import { parseGitHubUrl } from './github'

export const GIT_PROVIDERS = {
  github: parseGitHubUrl,

  // TODO: add GitLab support
  // gitlab: parseGitLabUrl,

  // TODO: add Bitbucket support
  // bitbucket: parseBitbucketUrl,
}
