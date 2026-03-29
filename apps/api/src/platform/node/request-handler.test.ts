import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { beforeEach, describe, expect, it } from 'vitest'
import { UsersService } from '@selfalert/core'
import { createApiApp } from '../../app'
import { JwtAccessTokenService } from '../../auth/jwt-access-token.service'
import { InMemoryUsersRepository } from '../../test-utils/in-memory-users-repository'
import { createNodeFetchHandler } from './request-handler'

describe('node request handler', () => {
  let tempDir: string
  let handler: (request: Request) => Promise<Response>

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'selfalert-dashboard-'))
    await fs.mkdir(path.join(tempDir, 'app', 'assets'), { recursive: true })
    await fs.writeFile(
      path.join(tempDir, 'app', 'index.html'),
      '<html><body>dashboard</body></html>',
    )

    const tokenService = new JwtAccessTokenService('node-secret')

    handler = createNodeFetchHandler({
      apiApp: createApiApp({
        accessTokenService: tokenService,
        usersService: new UsersService(
          new InMemoryUsersRepository(),
          tokenService,
        ),
      }),
      dashboardDistDir: tempDir,
    })
  })

  it('serves dashboard assets', async () => {
    const response = await handler(new Request('http://localhost/app'))

    expect(response.status).toBe(200)
    await expect(response.text()).resolves.toContain('dashboard')
  })

  it('serves the auth flow through the node adapter', async () => {
    await handler(
      new Request('http://localhost/api/users/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'node@example.com',
          password: 'correcthorse',
        }),
      }),
    )

    const signInResponse = await handler(
      new Request('http://localhost/api/users/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'node@example.com',
          password: 'correcthorse',
        }),
      }),
    )

    expect(signInResponse.status).toBe(200)
  })
})
