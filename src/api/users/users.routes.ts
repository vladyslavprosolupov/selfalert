import { OpenAPIHono } from '@hono/zod-openapi'
import type { Bindings, Variables } from '../../core/configs/workers'
import { auth } from '../../core/middlewares/auth.middleware'
import { ProfileOpenAPI, SigninOpenAPI, SignupOpenAPI } from './openapi'
import { UsersService } from './users.service'

const routes = new OpenAPIHono<{
  Bindings: Bindings
  Variables: Variables & { usersService: UsersService }
}>()

routes.use(async (ctx, next) => {
  const usersService = new UsersService(ctx.var.db, ctx.env.JWT_SECRET)
  ctx.set('usersService', usersService)
  await next()
})

//#region Sign up
routes.openapi(SignupOpenAPI, async ctx => {
  const { email, password, firstName, lastName } = ctx.req.valid('json')

  const userExists = await ctx.var.usersService.emailExists(email)

  if (userExists) {
    return ctx.json({ message: 'Email already in use' }, 400)
  }

  const id = await ctx.var.usersService.signUp({
    email,
    password,
    firstName,
    lastName,
  })
  return ctx.json({ id }, 200)
})
//#endregion
//#region Sign in
routes.openapi(SigninOpenAPI, async ctx => {
  const { email, password } = ctx.req.valid('json')

  try {
    const { token } = await ctx.var.usersService.signIn({
      email,
      password,
    })

    return ctx.json({ token }, 200)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'

    return ctx.json({ message }, 400)
  }
})
//#endregion
//#region Profile
routes.use(ProfileOpenAPI.getRoutingPath(), auth)
routes.openapi(ProfileOpenAPI, async ctx => {
  const userId = ctx.var.jwtPayload?.id

  if (!userId) {
    return ctx.json({ message: 'Unauthorized' }, 401)
  }

  const user = await ctx.var.usersService.profile(userId)

  return ctx.json(
    {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName ?? undefined,
        lastName: user.lastName ?? undefined,
        createdAt: user.createdAt.toISOString(),
      },
    },
    200,
  )
})
//#endregion

export { routes as UsersRoutes }
