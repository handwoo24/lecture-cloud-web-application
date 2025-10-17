import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/checkout/success')({
  server: {
    handlers: {
      GET: async () => {
        return new Response('success', { status: 200 })
      },
    },
  },
})
