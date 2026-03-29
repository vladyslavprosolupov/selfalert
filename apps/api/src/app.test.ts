import { UsersService } from '@selfalert/core'
import { beforeEach, describe, expect, it } from 'vitest'
import { createApiApp } from './app'
import { JwtAccessTokenService } from './auth/jwt-access-token.service'
import { InMemoryUsersRepository } from './test-utils/in-memory-users-repository'

describe('api app', () => {
  let app: ReturnType<typeof createApiApp>

  beforeEach(() => {
    const accessTokenService = new JwtAccessTokenService('test-secret')

    app = createApiApp({
      accessTokenService,
      usersService: new UsersService(
        new InMemoryUsersRepository(),
        accessTokenService,
      ),
    })
  })

  it('returns service metadata at the api root endpoint', async () => {
    const response = await app.request('http://localhost/api')

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      name: 'selfalert-api',
      status: 'ok',
      docs: '/api/swagger',
      openapi: '/api/openapi',
    })
  })

  it('supports the auth flow end to end', async () => {
    const signUpResponse = await app.request(
      'http://localhost/api/users/sign-up',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'hello@example.com',
          password: 'correcthorse',
          firstName: 'Hello',
        }),
      },
    )

    expect(signUpResponse.status).toBe(200)

    const signInResponse = await app.request(
      'http://localhost/api/users/sign-in',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'hello@example.com',
          password: 'correcthorse',
        }),
      },
    )

    expect(signInResponse.status).toBe(200)
    const { token } = (await signInResponse.json()) as { token: string }

    const profileResponse = await app.request('http://localhost/api/users', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    expect(profileResponse.status).toBe(200)
    await expect(profileResponse.json()).resolves.toMatchObject({
      user: {
        email: 'hello@example.com',
        firstName: 'Hello',
      },
    })
  })
})
