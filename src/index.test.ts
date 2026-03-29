import { describe, expect, it } from 'vitest'

import app from './index'

describe('app', () => {
  it('returns service metadata at the root endpoint', async () => {
    const response = await app.request('http://localhost/')

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      name: 'selfalert-api',
      status: 'ok',
      docs: '/swagger',
      openapi: '/openapi',
    })
  })

  it('returns health status', async () => {
    const response = await app.request('http://localhost/health')

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ status: 'ok' })
  })
})
