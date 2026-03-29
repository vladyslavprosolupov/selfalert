import { swaggerUI } from '@hono/swagger-ui'
import { OpenAPIHono } from '@hono/zod-openapi'
import type { AccessTokenService, UsersService } from '@selfalert/core'
import type { ApiAppEnv, ApiAppVariables } from './app.types'
import { createUsersRoutes } from './api/users/users.routes'

type CreateApiAppOptions = {
  accessTokenService: AccessTokenService
  usersService: UsersService
}

export const configureApiApp = <TBindings extends object>(
  app: OpenAPIHono<{ Bindings: TBindings; Variables: ApiAppVariables }>,
) => {
  app.openAPIRegistry.registerComponent('securitySchemes', 'Bearer', {
    type: 'http',
    scheme: 'bearer',
  })

  app.doc('/openapi', {
    info: { title: 'SelfAlert API', version: '1.0.0' },
    openapi: '3.1.0',
  })

  app.get('/', ctx =>
    ctx.json({
      name: 'selfalert',
      status: 'ok',
      docs: '/swagger',
      openapi: '/openapi',
    }),
  )

  app.get('/health', ctx => ctx.json({ status: 'ok' }))
  app.get('/swagger', swaggerUI({ url: '/openapi' }))

  app.route('/api/users', createUsersRoutes<TBindings>())

  return app
}

export const createApiApp = ({
  accessTokenService,
  usersService,
}: CreateApiAppOptions) => {
  const app = new OpenAPIHono<ApiAppEnv>()

  app.use(async (ctx, next) => {
    ctx.set('accessTokenService', accessTokenService)
    ctx.set('usersService', usersService)
    await next()
  })

  return configureApiApp(app)
}
