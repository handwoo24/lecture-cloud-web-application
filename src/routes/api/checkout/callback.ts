import { createFileRoute, redirect } from '@tanstack/react-router'
import { publishMessage } from '@/google/pubsub'
import { zodCheckoutCallbackSchema } from '@/model/checkout'

export const Route = createFileRoute('/api/checkout/callback')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const params = Object.fromEntries(url.searchParams.entries())
        const result = zodCheckoutCallbackSchema.safeParse(params)

        if (!result.success) {
          throw redirect({ to: '/checkout/error' })
        }

        await publishMessage('checkout-success', JSON.stringify(result.data))

        throw redirect({ to: '/checkout/success' })
      },
    },
  },
})
