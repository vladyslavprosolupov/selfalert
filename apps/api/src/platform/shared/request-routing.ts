const apiExactPaths = new Set(['/', '/health', '/openapi', '/swagger'])

export const isApiRequestPath = (pathname: string) =>
  apiExactPaths.has(pathname) || pathname.startsWith('/api/')

export const isDashboardRequestPath = (pathname: string) =>
  pathname === '/app' || pathname === '/app/' || pathname.startsWith('/app/')
