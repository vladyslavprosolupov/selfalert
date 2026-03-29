import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { serve } from '@hono/node-server'
import { UsersService } from '@selfalert/core'
import { createApiApp } from './app'
import { JwtAccessTokenService } from './auth/jwt-access-token.service'
import { getRequiredEnv, loadNodeEnv } from './env'
import { createNodeDatabase } from './platform/node/database'
import { createNodeFetchHandler } from './platform/node/request-handler'
import { NodeUsersRepository } from './users/node-users.repository'

loadNodeEnv()

const port = Number.parseInt(process.env.PORT ?? '3000', 10)
const databaseUrl = process.env.DATABASE_URL ?? './data/selfalert.db'
const dashboardDistDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../dashboard/dist',
)

const nodeDatabase = createNodeDatabase(databaseUrl)
const accessTokenService = new JwtAccessTokenService(
  getRequiredEnv('JWT_SECRET'),
)

const apiApp = createApiApp({
  accessTokenService,
  usersService: new UsersService(
    new NodeUsersRepository(nodeDatabase.db),
    accessTokenService,
  ),
})

serve(
  {
    fetch: createNodeFetchHandler({
      apiApp,
      dashboardDistDir,
    }),
    port,
  },
  info => {
    console.log(`SelfAlert API listening on http://localhost:${info.port}`)
  },
)
