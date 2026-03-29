import type {
  ProfileResponse,
  SignInInput,
  SignInResponse,
  SignUpInput,
  SignUpResponse,
} from '@selfalert/core'

type AccessTokenProvider =
  | (() => string | null | undefined | Promise<string | null | undefined>)
  | undefined

type CreateSelfAlertClientOptions = {
  baseUrl: string
  getAccessToken?: AccessTokenProvider
}

type RequestOptions = RequestInit & {
  headers?: HeadersInit
}

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')

const buildHeaders = async (
  headers: HeadersInit | undefined,
  getAccessToken: AccessTokenProvider,
) => {
  const result = new Headers(headers)

  if (!result.has('Content-Type')) {
    result.set('Content-Type', 'application/json')
  }

  const token = getAccessToken ? await getAccessToken() : null

  if (token) {
    result.set('Authorization', `Bearer ${token}`)
  }

  return result
}

const parseJson = async <T>(response: Response): Promise<T> => {
  const payload = (await response.json()) as T

  if (!response.ok) {
    throw new Error(
      typeof payload === 'object' &&
        payload !== null &&
        'message' in payload &&
        typeof payload.message === 'string'
        ? payload.message
        : `Request failed with status ${response.status}`,
    )
  }

  return payload
}

export const createSelfAlertClient = ({
  baseUrl,
  getAccessToken,
}: CreateSelfAlertClientOptions) => {
  const normalizedBaseUrl = trimTrailingSlash(baseUrl)

  const request = async <T>(path: string, options?: RequestOptions) => {
    const response = await fetch(`${normalizedBaseUrl}${path}`, {
      ...options,
      headers: await buildHeaders(options?.headers, getAccessToken),
    })

    return parseJson<T>(response)
  }

  return {
    auth: {
      signIn(input: SignInInput) {
        return request<SignInResponse>('/api/users/sign-in', {
          method: 'POST',
          body: JSON.stringify(input),
        })
      },
      signUp(input: SignUpInput) {
        return request<SignUpResponse>('/api/users/sign-up', {
          method: 'POST',
          body: JSON.stringify(input),
        })
      },
    },
    health: {
      get() {
        return request<{ status: string }>('/health', {
          method: 'GET',
          headers: undefined,
        })
      },
    },
    users: {
      profile() {
        return request<ProfileResponse>('/api/users', {
          method: 'GET',
          headers: undefined,
        })
      },
    },
  }
}
