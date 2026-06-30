#!/usr/bin/env node

import { registerProcessErrorHandlers } from './infrastructure/process/process-error-handlers.js'
import { runNativeMessagingServer } from './native-messaging/index.js'

registerProcessErrorHandlers()

void runNativeMessagingServer()
