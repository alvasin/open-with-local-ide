import { logError } from '../logging/logger.js'

export const registerProcessErrorHandlers = () => {
  process.on('uncaughtException', (error) => {
    logError(error, { event: 'process.uncaughtException' })

    process.exit(1)
  })

  process.on('unhandledRejection', (reason) => {
    logError(reason, { event: 'process.unhandledRejection' })

    process.exit(1)
  })
}
