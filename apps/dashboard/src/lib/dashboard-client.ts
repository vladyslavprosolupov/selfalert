import { createSelfAlertClient } from '@selfalert/sdk'
import type { AuthStore } from './token-store'

export type DashboardClient = ReturnType<typeof createSelfAlertClient>
export type DashboardClientFactory = (authStore: AuthStore) => DashboardClient

export const createDashboardClient = (authStore: AuthStore) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin

  return createSelfAlertClient({
    baseUrl,
    getAccessToken: () => authStore.getToken(),
  })
}
