import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient, type Client } from '@libsql/client'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import { drizzle } from 'drizzle-orm/libsql'
import { migrate } from 'drizzle-orm/libsql/migrator'

const migrationsFolder = fileURLToPath(
  new URL('../../../migrations', import.meta.url),
)

const resolveDatabaseUrl = (databaseUrl: string) => {
  if (databaseUrl === ':memory:') {
    return 'file::memory:'
  }

  if (databaseUrl.startsWith('file:')) {
    return databaseUrl
  }

  return `file:${path.resolve(process.cwd(), databaseUrl)}`
}

export type NodeDatabase = {
  client: Client
  db: LibSQLDatabase<Record<string, never>>
}

export const createNodeDatabase = (databaseUrl: string): NodeDatabase => {
  const client = createClient({
    url: resolveDatabaseUrl(databaseUrl),
  })

  return {
    client,
    db: drizzle(client),
  }
}

export const runNodeMigrations = (database: NodeDatabase['db']) => {
  migrate(database, { migrationsFolder })
}
