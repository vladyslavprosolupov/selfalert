import { loadNodeEnv } from '../../env'
import { createNodeDatabase, runNodeMigrations } from './database'

loadNodeEnv()

const databaseUrl = process.env.DATABASE_URL ?? './data/selfalert.db'
const database = createNodeDatabase(databaseUrl)

runNodeMigrations(database.db)
database.client.close()
