import { createServerFn } from '@tanstack/react-start'
import { redirect } from '@tanstack/react-router'
import { generateAuthUrl, getOAuthClient } from '@/google/auth'

export const loginFn = createServerFn({ method: 'GET' }).handler(() => {
  const oauthClient = getOAuthClient()
  const href = generateAuthUrl(oauthClient)
  throw redirect({ href })
})
