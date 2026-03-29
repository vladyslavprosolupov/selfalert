import { createRoute } from '@hono/zod-openapi'
import { ProfileResponseSuccess, ProfileResponseUnauthorized } from '../dto'

export const ProfileOpenAPI = createRoute({
  method: 'get',
  tags: ['Users'],
  operationId: 'profile',
  summary: 'Get the authenticated user profile',
  path: '/',
  security: [{ Bearer: [] }],
  responses: {
    200: {
      description: 'Success',
      content: { 'application/json': { schema: ProfileResponseSuccess } },
    },
    401: {
      description: 'Unauthorized',
      content: { 'application/json': { schema: ProfileResponseUnauthorized } },
    },
  },
})
