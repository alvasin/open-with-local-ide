import { promisify } from '@/utils/promisify'

const NATIVE_HOST_NAME = 'com.local.repo_ide_opener'

export const sendNativeMessage = async (request: object): Promise<unknown> =>
  promisify((callback) => {
    chrome.runtime.sendNativeMessage(NATIVE_HOST_NAME, request, callback)
  })
