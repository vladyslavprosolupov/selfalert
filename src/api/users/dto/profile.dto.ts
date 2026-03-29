import { z } from '@hono/zod-openapi'
import { UserModel } from './user.dto'

export const ProfileResponseSuccess = z.object({
  user: UserModel,
})

export const ProfileResponseUnauthorized = z.object({
  message: z.string().openapi({ examples: ['Unauthorized'] }),
})
