import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/checkout/callback')({
  server: {
    handlers: {
      GET: () => {
        return new Response('success', { status: 200 })
      },
    },
  },
})
