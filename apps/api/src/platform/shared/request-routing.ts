const apiExactPaths = new Set([
  '/api',
  '/api/health',
  '/api/openapi',
  '/api/swagger',
])

export const isApiRequestPath = (pathname: string) =>
  apiExactPaths.has(pathname) || pathname.startsWith('/api/')

export const isDashboardRequestPath = (pathname: string) =>
  !isApiRequestPath(pathname)
