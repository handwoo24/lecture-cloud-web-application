import { createServerOnlyFn } from '@tanstack/react-start'
import { useSession } from '@tanstack/react-start/server'

type Session = {
  token?: string
  expires?: number
  uid?: string
}

export const useAuthSession = createServerOnlyFn(() => {
  const AUTH_SECRET = process.env.AUTH_SECRET

  if (typeof AUTH_SECRET !== 'string') {
    throw new Error('Missing AUTH_SECRET')
  }

  return useSession<Session>({
    password: AUTH_SECRET,
    maxAge: 60 * 60 * 24 * 7,
  })
})
