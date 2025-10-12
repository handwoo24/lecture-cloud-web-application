import { createServerFn } from '@tanstack/react-start'
import { redirect } from '@tanstack/react-router'
import { useAuthSession } from '../session'
import { generateAuthUrl, getOAuthClient } from '@/google/auth'

export const loginFn = createServerFn({ method: 'GET' }).handler(() => {
  const oauthClient = getOAuthClient()
  const href = generateAuthUrl(oauthClient)
  throw redirect({ href })
})

export const logoutFn = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await useAuthSession()
  session.clear()
  // 추후에는 로그인 페이지로 이동시키도록 합니다.
  throw redirect({ to: '/' })
})
