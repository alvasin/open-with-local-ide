import { NativeHostErrorCode } from '#native-protocol'
import type { NativeHostResponse } from './native-message.response.js'
import { NativeHostError } from '../shared/errors/native-host.error.js'

export const MAX_MESSAGE_BYTES = 1024 * 1024

const readBytes = async (byteLength: number): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    let totalLength = 0

    const cleanup = () => {
      process.stdin.off('readable', onReadable)
      process.stdin.off('end', onEnd)
      process.stdin.off('error', onError)
    }

    const onReadable = () => {
      let chunk: Buffer | string | null

      while ((chunk = process.stdin.read(byteLength - totalLength)) !== null) {
        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)

        chunks.push(buffer)
        totalLength += buffer.length

        if (totalLength >= byteLength) {
          cleanup()
          resolve(Buffer.concat(chunks, totalLength))
          return
        }
      }
    }

    const onEnd = () => {
      cleanup()
      reject(new Error('Native message payload is incomplete'))
    }

    const onError = (error: Error) => {
      cleanup()
      reject(error)
    }

    process.stdin.on('readable', onReadable)
    process.stdin.once('end', onEnd)
    process.stdin.once('error', onError)
    onReadable()
  })

export const readInput = async (): Promise<Buffer> => {
  const header = await readBytes(4)
  const messageLength = header.readUInt32LE(0)
  if (messageLength > MAX_MESSAGE_BYTES) {
    throw new NativeHostError({ code: NativeHostErrorCode.MessageTooLarge })
  }

  const payload = await readBytes(messageLength)

  return Buffer.concat([header, payload])
}

export const readAllInput = async (): Promise<Buffer> => {
  const chunks: Buffer[] = []

  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  return Buffer.concat(chunks)
}

export const readNativeMessage = (input: Buffer): unknown => {
  if (input.length < 4) throw new Error('Native message header is missing')

  const messageLength = input.readUInt32LE(0)
  if (messageLength > MAX_MESSAGE_BYTES) {
    throw new NativeHostError({ code: NativeHostErrorCode.MessageTooLarge })
  }

  const payloadStart = 4
  const payloadEnd = payloadStart + messageLength

  if (input.length < payloadEnd) throw new Error('Native message payload is incomplete')

  const payload = input.subarray(payloadStart, payloadEnd).toString('utf8')

  return JSON.parse(payload) as unknown
}

export const writeNativeMessage = async (message: NativeHostResponse): Promise<void> => {
  const payload = Buffer.from(JSON.stringify(message), 'utf8')
  const header = Buffer.alloc(4)

  header.writeUInt32LE(payload.length, 0)

  await new Promise<void>((resolve, reject) => {
    process.stdout.write(Buffer.concat([header, payload]), (error) => {
      if (error) {
        reject(error)
        return
      }

      resolve()
    })
  })
}
