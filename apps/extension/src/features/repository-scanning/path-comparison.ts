export const isAbsolutePath = (value: string): boolean =>
  /^(?:[a-zA-Z]:[\\/]|\\\\)/.test(value) || value.startsWith('/')

export const normalizePathForComparison = (value: string): string =>
  value
    .replace(/[\\/]+$/, '')
    .replaceAll('\\', '/')
    .toLowerCase()

export const areSamePath = (left: string, right: string): boolean =>
  normalizePathForComparison(left) === normalizePathForComparison(right)
