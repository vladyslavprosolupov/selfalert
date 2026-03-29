import { z } from '@hono/zod-openapi'

export const UserModel = z.object({
  id: z.uuid(),
  email: z.email(),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  createdAt: z.string(),
})
