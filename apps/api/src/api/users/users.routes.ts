import { OpenAPIHono } from '@hono/zod-openapi'
import type { ApiAppEnv } from '../../app.types'
import { auth } from '../../auth/auth.middleware'
import { ProfileOpenAPI, SigninOpenAPI, SignupOpenAPI } from './openapi'

export const createUsersRoutes = <TBindings extends object = object>() => {
  const routes = new OpenAPIHono<ApiAppEnv<TBindings>>()

  routes.openapi(SignupOpenAPI, async ctx => {
    const { email, password, firstName, lastName } = ctx.req.valid('json')

    const userExists = await ctx.var.usersService.emailExists(email)

    if (userExists) {
      return ctx.json({ message: 'Email already in use' }, 400)
    }

    const result = await ctx.var.usersService.signUp({
      email,
      password,
      firstName,
      lastName,
    })

    return ctx.json(result, 200)
  })

  routes.openapi(SigninOpenAPI, async ctx => {
    const { email, password } = ctx.req.valid('json')

    try {
      const result = await ctx.var.usersService.signIn({
        email,
        password,
      })

      return ctx.json(result, 200)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'

      return ctx.json({ message }, 400)
    }
  })

  routes.use(ProfileOpenAPI.getRoutingPath(), auth)
  routes.openapi(ProfileOpenAPI, async ctx => {
    const userId = ctx.var.authPayload?.id

    if (!userId) {
      return ctx.json({ message: 'Unauthorized' }, 401)
    }

    const user = await ctx.var.usersService.profile(userId)

    return ctx.json({ user }, 200)
  })

  return routes
}
