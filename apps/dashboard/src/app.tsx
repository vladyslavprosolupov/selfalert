import { useEffect, useMemo, useState } from 'react'
import { Button } from '@selfalert/ui/components/button'
import '@selfalert/ui/globals.css'
import {
  createDashboardClient,
  type DashboardClient,
  type DashboardClientFactory,
} from './lib/dashboard-client'
import { createBrowserTokenStore, type AuthStore } from './lib/token-store'

type AuthMode = 'sign-in' | 'sign-up'

type AppProps = {
  authStore?: AuthStore
  createClient?: DashboardClientFactory
}

const defaultAuthStore = createBrowserTokenStore()
const defaultCreateClient: DashboardClientFactory = authStore =>
  createDashboardClient(authStore)

export function App({
  authStore = defaultAuthStore,
  createClient = defaultCreateClient,
}: AppProps) {
  const [authMode, setAuthMode] = useState<AuthMode>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profile, setProfile] = useState<
    Awaited<ReturnType<DashboardClient['users']['profile']>>['user'] | null
  >(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  const client = useMemo(
    () => createClient(authStore),
    [authStore, createClient],
  )

  useEffect(() => {
    const token = authStore.getToken()

    if (!token) {
      setIsLoadingProfile(false)
      return
    }

    let cancelled = false

    const loadProfile = async () => {
      try {
        const response = await client.users.profile()

        if (!cancelled) {
          setProfile(response.user)
          setError(null)
        }
      } catch (profileError) {
        authStore.clearToken()

        if (!cancelled) {
          setProfile(null)
          setError(
            profileError instanceof Error
              ? profileError.message
              : 'Unable to load profile',
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoadingProfile(false)
        }
      }
    }

    void loadProfile()

    return () => {
      cancelled = true
    }
  }, [authStore, client])

  const resetAuthForm = () => {
    setPassword('')
    setFirstName('')
    setLastName('')
  }

  const handleSignOut = () => {
    authStore.clearToken()
    setProfile(null)
    setIsLoadingProfile(false)
    setError(null)
    resetAuthForm()
  }

  const submitAuth = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      if (authMode === 'sign-up') {
        await client.auth.signUp({
          email,
          password,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
        })
      }

      const signInResponse = await client.auth.signIn({ email, password })

      authStore.setToken(signInResponse.token)
      const profileResponse = await client.users.profile()

      setProfile(profileResponse.user)
      resetAuthForm()
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Authentication failed',
      )
    } finally {
      setIsSubmitting(false)
      setIsLoadingProfile(false)
    }
  }

  if (isLoadingProfile) {
    return (
      <main className='flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(207,126,63,0.18),_transparent_45%),linear-gradient(180deg,_#fbf4ea_0%,_#f6efe4_100%)] px-6'>
        <div className='rounded-3xl border border-border/80 bg-card/90 px-8 py-6 text-sm text-muted-foreground shadow-xl shadow-primary/10 backdrop-blur'>
          Loading dashboard…
        </div>
      </main>
    )
  }

  if (profile) {
    return (
      <main className='min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(207,126,63,0.22),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(121,86,54,0.12),_transparent_30%),linear-gradient(180deg,_#fbf4ea_0%,_#f4ecdf_100%)] px-6 py-8'>
        <div className='mx-auto flex max-w-5xl flex-col gap-6'>
          <section className='rounded-[2rem] border border-border/80 bg-card/85 p-8 shadow-2xl shadow-primary/10 backdrop-blur'>
            <div className='flex flex-col gap-5 md:flex-row md:items-start md:justify-between'>
              <div className='max-w-2xl space-y-4'>
                <p className='text-sm font-medium uppercase tracking-[0.28em] text-muted-foreground'>
                  SelfAlert dashboard
                </p>
                <h1 className='font-heading text-4xl leading-tight text-foreground md:text-5xl'>
                  Dashboard connected
                </h1>
                <p className='max-w-xl text-base leading-7 text-muted-foreground'>
                  Your account is live and ready for the next phase: notification
                  channels, delivery history, and Telegram wiring.
                </p>
              </div>
              <Button variant='outline' onClick={handleSignOut}>
                Sign out
              </Button>
            </div>
          </section>

          <section className='grid gap-5 md:grid-cols-[1.2fr_0.8fr]'>
            <article className='rounded-[2rem] border border-border/80 bg-card/85 p-6 shadow-xl shadow-primary/10 backdrop-blur'>
              <p className='text-sm uppercase tracking-[0.24em] text-muted-foreground'>
                Profile
              </p>
              <div className='mt-6 space-y-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>Email</p>
                  <p className='text-lg font-medium text-foreground'>{profile.email}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Name</p>
                  <p className='text-lg font-medium text-foreground'>
                    {[profile.firstName, profile.lastName].filter(Boolean).join(' ') ||
                      'Not provided'}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Created at</p>
                  <p className='text-lg font-medium text-foreground'>
                    {new Date(profile.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </article>

            <article className='rounded-[2rem] border border-border/80 bg-card/85 p-6 shadow-xl shadow-primary/10 backdrop-blur'>
              <p className='text-sm uppercase tracking-[0.24em] text-muted-foreground'>
                Next up
              </p>
              <ul className='mt-6 space-y-3 text-sm leading-7 text-muted-foreground'>
                <li>Telegram connection flow</li>
                <li>One-command notification endpoint</li>
                <li>CLI on top of the shared SDK</li>
              </ul>
            </article>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className='min-h-screen bg-[radial-gradient(circle_at_top,_rgba(207,126,63,0.18),_transparent_42%),linear-gradient(180deg,_#fbf4ea_0%,_#f6efe4_100%)] px-6 py-8'>
      <div className='mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr]'>
        <section className='rounded-[2rem] border border-border/80 bg-card/80 p-8 shadow-2xl shadow-primary/10 backdrop-blur'>
          <p className='text-sm font-medium uppercase tracking-[0.28em] text-muted-foreground'>
            OSS core + cloud
          </p>
          <h1 className='mt-5 font-heading text-5xl leading-tight text-foreground'>
            The simplest way to get notified when something finishes.
          </h1>
          <p className='mt-5 max-w-xl text-base leading-7 text-muted-foreground'>
            This dashboard is the authenticated shell for the next SelfAlert
            workflows. Today it confirms auth, shared SDK wiring, and the unified
            Cloudflare/Docker deploy shape.
          </p>
          <div className='mt-10 grid gap-4 md:grid-cols-2'>
            <div className='rounded-[1.5rem] border border-border bg-background/60 p-5'>
              <p className='text-sm uppercase tracking-[0.2em] text-muted-foreground'>
                Cloud
              </p>
              <p className='mt-3 text-lg font-medium text-foreground'>
                One Worker serves the API and this app.
              </p>
            </div>
            <div className='rounded-[1.5rem] border border-border bg-background/60 p-5'>
              <p className='text-sm uppercase tracking-[0.2em] text-muted-foreground'>
                Self-host
              </p>
              <p className='mt-3 text-lg font-medium text-foreground'>
                One Docker stack, one SQLite-first runtime.
              </p>
            </div>
          </div>
        </section>

        <section className='rounded-[2rem] border border-border/80 bg-card/90 p-8 shadow-2xl shadow-primary/10 backdrop-blur'>
          <div className='flex gap-2 rounded-full bg-muted p-1'>
            <button
              className={`flex-1 rounded-full px-4 py-3 text-sm font-medium transition ${
                authMode === 'sign-in'
                  ? 'bg-background text-foreground shadow'
                  : 'text-muted-foreground'
              }`}
              onClick={() => setAuthMode('sign-in')}
              type='button'
            >
              Sign in
            </button>
            <button
              className={`flex-1 rounded-full px-4 py-3 text-sm font-medium transition ${
                authMode === 'sign-up'
                  ? 'bg-background text-foreground shadow'
                  : 'text-muted-foreground'
              }`}
              onClick={() => setAuthMode('sign-up')}
              type='button'
            >
              Create account
            </button>
          </div>

          <div className='mt-8 space-y-4'>
            <div>
              <h2 className='font-heading text-3xl text-foreground'>
                {authMode === 'sign-in'
                  ? 'Sign in to SelfAlert'
                  : 'Create your first account'}
              </h2>
              <p className='mt-2 text-sm leading-6 text-muted-foreground'>
                Auth is still backed by the original JWT flow, now shared across
                both runtime targets.
              </p>
            </div>

            <label className='block text-sm text-foreground'>
              <span className='mb-2 block text-sm font-medium'>Email</span>
              <input
                className='w-full rounded-2xl border border-border bg-input px-4 py-3 outline-none transition focus:border-ring'
                onChange={event => setEmail(event.target.value)}
                type='email'
                value={email}
              />
            </label>

            {authMode === 'sign-up' ? (
              <div className='grid gap-4 md:grid-cols-2'>
                <label className='block text-sm text-foreground'>
                  <span className='mb-2 block text-sm font-medium'>First name</span>
                  <input
                    className='w-full rounded-2xl border border-border bg-input px-4 py-3 outline-none transition focus:border-ring'
                    onChange={event => setFirstName(event.target.value)}
                    value={firstName}
                  />
                </label>
                <label className='block text-sm text-foreground'>
                  <span className='mb-2 block text-sm font-medium'>Last name</span>
                  <input
                    className='w-full rounded-2xl border border-border bg-input px-4 py-3 outline-none transition focus:border-ring'
                    onChange={event => setLastName(event.target.value)}
                    value={lastName}
                  />
                </label>
              </div>
            ) : null}

            <label className='block text-sm text-foreground'>
              <span className='mb-2 block text-sm font-medium'>Password</span>
              <input
                className='w-full rounded-2xl border border-border bg-input px-4 py-3 outline-none transition focus:border-ring'
                onChange={event => setPassword(event.target.value)}
                type='password'
                value={password}
              />
            </label>

            {error ? (
              <div className='rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive'>
                {error}
              </div>
            ) : null}

            <Button
              className='w-full'
              disabled={isSubmitting}
              onClick={() => void submitAuth()}
              type='button'
            >
              {isSubmitting
                ? 'Working…'
                : authMode === 'sign-in'
                  ? 'Open dashboard'
                  : 'Create account and continue'}
            </Button>
          </div>
        </section>
      </div>
    </main>
  )
}
