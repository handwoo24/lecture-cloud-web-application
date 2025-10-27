import { createServerOnlyFn } from '@tanstack/react-start'
import { useSession } from '@tanstack/react-start/server'

type Session = { uid?: string }

export const useAuthSession = createServerOnlyFn(() => {
  const AUTH_SECRET = process.env.AUTH_SECRET
  const AUTH_NAME = process.env.AUTH_NAME

  if (typeof AUTH_SECRET !== 'string' || typeof AUTH_NAME !== 'string') {
    throw new Error('Missing AUTH_SECRET')
  }

  return useSession<Session>({
    name: AUTH_NAME,
    password: AUTH_SECRET,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
    },
  })
})
