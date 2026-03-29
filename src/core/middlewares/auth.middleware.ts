import type { Context, Next } from 'hono'
import { verify } from 'hono/jwt'
import type { Bindings, Variables } from '../configs/workers'

export const auth = async (
  ctx: Context<{ Bindings: Bindings; Variables: Variables }>,
  next: Next,
) => {
  const authorization = ctx.req.header('Authorization')
  const token = authorization?.replace('Bearer ', '')

  if (!token) {
    return ctx.json({ message: 'Unauthorized' }, 401)
  }

  try {
    const payload = await verify(token, ctx.env.JWT_SECRET, 'HS256')

    if (typeof payload.id !== 'string') {
      return ctx.json({ message: 'Unauthorized' }, 401)
    }

    ctx.set('jwtPayload', { id: payload.id })
    await next()
  } catch {
    return ctx.json({ message: 'Unauthorized' }, 401)
  }
}
