import {
  isApiRequestPath,
  isDashboardRequestPath,
} from '../shared/request-routing'

type CreateWorkerFetchHandlerOptions = {
  apiFetch: (request: Request) => Response | Promise<Response>
  assetsFetch: (request: Request) => Promise<Response>
}

const createDashboardAssetRequest = (request: Request) => {
  const url = new URL(request.url)

  if (url.pathname === '/' || !url.pathname.split('/').pop()?.includes('.')) {
    url.pathname = '/index.html'
  }

  return new Request(url.toString(), request)
}

export const createWorkerFetchHandler = ({
  apiFetch,
  assetsFetch,
}: CreateWorkerFetchHandlerOptions) => {
  return async (request: Request) => {
    const url = new URL(request.url)
    const isSpaRoute = !url.pathname.split('/').pop()?.includes('.')

    if (isApiRequestPath(url.pathname)) {
      return await apiFetch(request)
    }

    if (isDashboardRequestPath(url.pathname)) {
      const assetRequest = createDashboardAssetRequest(request)
      const assetResponse = await assetsFetch(assetRequest)

      if (assetResponse.status !== 404 || !isSpaRoute) {
        return assetResponse
      }

      return assetsFetch(
        new Request(new URL('/index.html', request.url), request),
      )
    }

    return new Response('Not found', { status: 404 })
  }
}
