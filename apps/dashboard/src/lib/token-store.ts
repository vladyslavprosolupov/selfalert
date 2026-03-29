const TOKEN_STORAGE_KEY = 'selfalert.access-token'

export interface AuthStore {
  clearToken(): void
  getToken(): string | null
  setToken(token: string): void
}

export const createBrowserTokenStore = (
  storageKey = TOKEN_STORAGE_KEY,
): AuthStore => ({
  clearToken() {
    window.localStorage.removeItem(storageKey)
  },
  getToken() {
    return window.localStorage.getItem(storageKey)
  },
  setToken(token: string) {
    window.localStorage.setItem(storageKey, token)
  },
})
