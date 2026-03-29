import { OpenAPIHono } from '@hono/zod-openapi'
import { UsersService } from '@selfalert/core'
import { drizzle } from 'drizzle-orm/d1'
import { configureApiApp } from './app'
import type { ApiAppVariables } from './app.types'
import { JwtAccessTokenService } from './auth/jwt-access-token.service'
import { createWorkerFetchHandler } from './platform/cloudflare/request-handler'
import { D1UsersRepository } from './users/d1-users.repository'

type WorkerEnv = {
  ASSETS: Fetcher
  DB: D1Database
  JWT_SECRET: string
}

const apiApp = configureApiApp(
  new OpenAPIHono<{
    Bindings: WorkerEnv
    Variables: ApiAppVariables
  }>(),
)

apiApp.use(async (ctx, next) => {
  const accessTokenService = new JwtAccessTokenService(ctx.env.JWT_SECRET)

  ctx.set('accessTokenService', accessTokenService)
  ctx.set(
    'usersService',
    new UsersService(
      new D1UsersRepository(drizzle(ctx.env.DB)),
      accessTokenService,
    ),
  )

  await next()
})

export default {
  fetch(request: Request, env: WorkerEnv) {
    return createWorkerFetchHandler({
      apiFetch: requestToApi => apiApp.fetch(requestToApi, env),
      assetsFetch: requestToAsset => env.ASSETS.fetch(requestToAsset),
    })(request)
  },
}
