import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/checkout/stock')({
  server: {
    handlers: {
      POST: () => {
        return new Response('Not implemented', { status: 501 })
      },
    },
  },
})
