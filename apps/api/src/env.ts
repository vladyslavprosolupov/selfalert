import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from 'dotenv'

const envLoadedSymbol = Symbol.for('selfalert.api.env.loaded')

type GlobalWithEnvFlag = typeof globalThis & {
  [envLoadedSymbol]?: boolean
}

export const loadNodeEnv = () => {
  const globalWithEnvFlag = globalThis as GlobalWithEnvFlag

  if (globalWithEnvFlag[envLoadedSymbol]) {
    return
  }

  const envPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../../.env',
  )

  config({ path: envPath })
  globalWithEnvFlag[envLoadedSymbol] = true
}

export const getRequiredEnv = (name: string) => {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}
