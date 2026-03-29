import fs from 'node:fs/promises'
import path from 'node:path'
import type { OpenAPIHono } from '@hono/zod-openapi'
import type { ApiAppEnv } from '../../app.types'
import {
  isApiRequestPath,
  isDashboardRequestPath,
} from '../shared/request-routing'

type CreateNodeFetchHandlerOptions = {
  apiApp: OpenAPIHono<ApiAppEnv>
  dashboardDistDir: string
}

const contentTypes: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
}

const resolveAssetPath = (dashboardDistDir: string, pathname: string) => {
  const normalizedPath =
    pathname === '/' || !path.extname(pathname) ? '/index.html' : pathname

  return path.join(dashboardDistDir, normalizedPath)
}

export const createNodeFetchHandler = ({
  apiApp,
  dashboardDistDir,
}: CreateNodeFetchHandlerOptions) => {
  return async (request: Request) => {
    const url = new URL(request.url)

    if (isApiRequestPath(url.pathname)) {
      return apiApp.fetch(request)
    }

    if (isDashboardRequestPath(url.pathname)) {
      const assetPath = resolveAssetPath(dashboardDistDir, url.pathname)

      try {
        const body = await fs.readFile(assetPath)
        const extension = path.extname(assetPath)

        return new Response(body, {
          status: 200,
          headers: {
            'Content-Type':
              contentTypes[extension] ?? 'application/octet-stream',
          },
        })
      } catch {
        return new Response('Not found', { status: 404 })
      }
    }

    return new Response('Not found', { status: 404 })
  }
}
