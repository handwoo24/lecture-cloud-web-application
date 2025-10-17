import { createFileRoute } from '@tanstack/react-router'
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
          return new Response('Invalid request', { status: 400 })
        }

        await publishMessage('checkout-success', JSON.stringify(result.data))

        return new Response('Success', { status: 200 })
      },
    },
  },
})
