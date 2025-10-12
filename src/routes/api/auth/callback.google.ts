import { createFileRoute, redirect } from '@tanstack/react-router'
import { getOAuthClient, verifyTokens } from '@/google/auth'
import { useAuthSession } from '@/session'

export const Route = createFileRoute('/api/auth/callback/google')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        // url searchParam으로 인가 코드가 발급됩니다.
        const url = new URL(request.url)
        const code = url.searchParams.get('code')

        if (typeof code !== 'string') {
          return new Response('Invalid code', { status: 400 })
        }

        const oauthClient = getOAuthClient()

        // 발급된 인가 코드를 OAuth client를 이용해서 토큰으로 교환합니다.
        const { tokens } = await oauthClient.getToken(code)

        // 토큰으로부터 인증정보를 취득합니다.
        const payload = await verifyTokens(oauthClient, tokens)

        const idToken = payload.getPayload()
        if (!idToken?.sub) {
          throw new Response('Invalid ID Token', { status: 400 })
        }

        const session = await useAuthSession()

        // 세션에 인증정보를 저장합니다.
        session.update({
          token: crypto.randomUUID(),
          expires: new Date().getTime() + 60 * 60 * 1000,
          uid: idToken.sub,
        })

        throw redirect({ to: '/' })
      },
    },
  },
})
