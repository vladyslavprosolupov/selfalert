import { z } from '@hono/zod-openapi'

export const SignupBody = z.object({
  email: z.email(),
  password: z.string().min(8),
  firstName: z.string().trim().min(1).max(100).optional(),
  lastName: z.string().trim().min(1).max(100).optional(),
})

export const SignupResponseSuccess = z.object({
  id: z.uuid(),
})

export const SignupResponseBadRequest = z.object({
  message: z.string().openapi({ examples: ['Email already in use'] }),
})
