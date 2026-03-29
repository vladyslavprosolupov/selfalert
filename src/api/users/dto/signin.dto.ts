import { z } from '@hono/zod-openapi'

export const SigninBody = z.object({
  email: z.email(),
  password: z.string().min(8),
})

export const SigninResponseSuccess = z.object({
  token: z.string(),
})

export const SigninResponseBadRequest = z.object({
  message: z.string().openapi({ examples: ['Invalid credentials'] }),
})
