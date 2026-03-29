import { swaggerUI } from '@hono/swagger-ui'
import { OpenAPIHono } from '@hono/zod-openapi'
import { UsersRoutes } from './api/users/users.routes'
import type { Bindings, Variables } from './core/configs/workers'
import { createDrizzleDB } from './core/database/drizzle'

const app = new OpenAPIHono<{ Bindings: Bindings; Variables: Variables }>()

app.openAPIRegistry.registerComponent('securitySchemes', 'Bearer', {
  type: 'http',
  scheme: 'bearer',
})
app.doc('/openapi', {
  info: { title: 'SelfAlert API', version: '1.0.0' },
  openapi: '3.1.0',
})

app.get('/', c =>
  c.json({
    name: 'selfalert-api',
    status: 'ok',
    docs: '/swagger',
    openapi: '/openapi',
  }),
)
app.get('/health', c => c.json({ status: 'ok' }))
app.get('/swagger', swaggerUI({ url: '/openapi' }))

app.use(async (ctx, next) => {
  ctx.set('db', createDrizzleDB(ctx.env.DB))
  await next()
})

app.route('/api/users', UsersRoutes)

export default app
