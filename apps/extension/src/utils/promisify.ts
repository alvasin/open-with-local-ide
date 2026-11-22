export const promisify = <T>(fn: (callback: (result: T) => void) => void): Promise<T> =>
  new Promise((resolve, reject) => {
    fn((result) => {
      const errorMessage = chrome.runtime.lastError?.message

      if (errorMessage) {
        reject(new Error(errorMessage))
        return
      }

      resolve(result)
    })
  })
