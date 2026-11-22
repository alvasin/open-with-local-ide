import fs from 'node:fs'
import path from 'node:path'
import { HOST_DESCRIPTION, HOST_NAME } from './registration.constants.js'
import type { NativeHostManifest } from './registration.types.js'

export const createManifest = (extensionId: string, hostPath: string): NativeHostManifest => ({
  name: HOST_NAME,
  description: HOST_DESCRIPTION,
  path: hostPath,
  type: 'stdio',
  allowed_origins: [`chrome-extension://${extensionId}/`],
})

export const writeManifest = (filePath: string, manifest: NativeHostManifest) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, `${JSON.stringify(manifest, null, 2)}\n`)
}
