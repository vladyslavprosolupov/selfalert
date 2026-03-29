import type { Context, Next } from 'hono'
import type { ApiAppEnv } from '../app.types'

export const auth = async <TBindings extends object>(
  ctx: Context<ApiAppEnv<TBindings>>,
  next: Next,
) => {
  const authorization = ctx.req.header('Authorization')
  const token = authorization?.replace('Bearer ', '')

  if (!token) {
    return ctx.json({ message: 'Unauthorized' }, 401)
  }

  try {
    const payload = await ctx.var.accessTokenService.verifyToken(token)
    ctx.set('authPayload', payload)
    await next()
  } catch {
    return ctx.json({ message: 'Unauthorized' }, 401)
  }
}
