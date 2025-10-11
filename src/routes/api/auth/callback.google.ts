import { createFileRoute, redirect } from '@tanstack/react-router'
import { getOAuthClient, verifyTokens } from '@/google/auth'

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
        // verifyTokens 함수는 별도로 작성합니다.
        const payload = await verifyTokens(oauthClient, tokens)

        const idToken = payload.getPayload()
        if (!idToken?.name) {
          throw new Response('Invalid ID Token', { status: 400 })
        }

        throw redirect({ to: '/?name=' + encodeURIComponent(idToken.name) })
      },
    },
  },
})
