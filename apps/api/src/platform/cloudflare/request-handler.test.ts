import { describe, expect, it, vi } from 'vitest'
import { createWorkerFetchHandler } from './request-handler'

describe('cloudflare request handler', () => {
  it('routes API requests to the API app', async () => {
    const apiFetch = vi.fn().mockResolvedValue(new Response('ok'))
    const assetsFetch = vi.fn()

    const handler = createWorkerFetchHandler({
      apiFetch,
      assetsFetch,
    })

    const response = await handler(new Request('http://localhost/health'))

    expect(response.status).toBe(200)
    expect(apiFetch).toHaveBeenCalledTimes(1)
    expect(assetsFetch).not.toHaveBeenCalled()
  })

  it('routes dashboard requests to Cloudflare assets with SPA fallback', async () => {
    const apiFetch = vi.fn()
    const assetsFetch = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(new Response('<html>app</html>', { status: 200 }))

    const handler = createWorkerFetchHandler({
      apiFetch,
      assetsFetch,
    })

    const response = await handler(new Request('http://localhost/app/settings'))

    expect(response.status).toBe(200)
    expect(apiFetch).not.toHaveBeenCalled()
    expect(assetsFetch).toHaveBeenCalledTimes(2)
  })
})
