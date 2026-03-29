import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { App } from './app'
import type { DashboardClient, DashboardClientFactory } from './lib/dashboard-client'
import type { AuthStore } from './lib/token-store'

const createMockClient = (): DashboardClient => ({
  auth: {
    signIn: vi.fn().mockResolvedValue({ token: 'test-token' }),
    signUp: vi.fn().mockResolvedValue({ id: 'user-id' }),
  },
  health: {
    get: vi.fn().mockResolvedValue({ status: 'ok' }),
  },
  users: {
    profile: vi.fn().mockResolvedValue({
      user: {
        id: 'user-id',
        email: 'hello@example.com',
        firstName: 'Hello',
        lastName: 'World',
        createdAt: new Date().toISOString(),
      },
    }),
  },
})

const createMemoryStore = (): AuthStore => {
  let token: string | null = null

  return {
    clearToken() {
      token = null
    },
    getToken() {
      return token
    },
    setToken(nextToken: string) {
      token = nextToken
    },
  }
}

describe('dashboard app', () => {
  it('shows the unauthenticated entry by default', () => {
    render(
      <App
        authStore={createMemoryStore()}
        createClient={(() => createMockClient()) satisfies DashboardClientFactory}
      />,
    )

    expect(
      screen.getByRole('heading', { name: /sign in to selfalert/i }),
    ).toBeInTheDocument()
  })

  it('signs in and renders the authenticated shell', async () => {
    const authStore = createMemoryStore()
    const client = createMockClient()

    render(
      <App
        authStore={authStore}
        createClient={(() => client) satisfies DashboardClientFactory}
      />,
    )

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'hello@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'correcthorse' },
    })
    fireEvent.click(
      screen.getByRole('button', { name: /open dashboard/i }),
    )

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: /dashboard connected/i }),
      ).toBeInTheDocument(),
    )

    expect(authStore.getToken()).toBe('test-token')
    expect(client.users.profile).toHaveBeenCalledTimes(1)
  })
})
