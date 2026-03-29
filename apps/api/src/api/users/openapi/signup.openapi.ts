import { createRoute } from '@hono/zod-openapi'
import {
  SignupBody,
  SignupResponseBadRequest,
  SignupResponseSuccess,
} from '../dto'

export const SignupOpenAPI = createRoute({
  method: 'post',
  tags: ['Users'],
  operationId: 'signUp',
  summary: 'Register a new user',
  path: '/sign-up',
  request: {
    body: { content: { 'application/json': { schema: SignupBody } } },
  },
  responses: {
    200: {
      description: 'User registered successfully',
      content: { 'application/json': { schema: SignupResponseSuccess } },
    },
    400: {
      description: 'Validation error or email already in use',
      content: { 'application/json': { schema: SignupResponseBadRequest } },
    },
  },
})
