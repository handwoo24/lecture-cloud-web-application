import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/checkout/push')({
  server: {
    handlers: {
      POST: () => {
        return new Response('Not implemented', { status: 501 })
      },
    },
  },
})
