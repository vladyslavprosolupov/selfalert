import { createRoute } from '@hono/zod-openapi'
import {
  SigninBody,
  SigninResponseBadRequest,
  SigninResponseSuccess,
} from '../dto'

export const SigninOpenAPI = createRoute({
  method: 'post',
  tags: ['Users'],
  operationId: 'signIn',
  summary: 'Authenticate a user',
  path: '/sign-in',
  request: {
    body: { content: { 'application/json': { schema: SigninBody } } },
  },
  responses: {
    200: {
      description: 'User authenticated successfully',
      content: { 'application/json': { schema: SigninResponseSuccess } },
    },
    400: {
      description: 'Invalid credentials',
      content: { 'application/json': { schema: SigninResponseBadRequest } },
    },
  },
})
