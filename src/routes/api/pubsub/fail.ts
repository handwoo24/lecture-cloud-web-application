import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/pubsub/fail')({
  server: {
    handlers: {
      POST: () => {
        return new Response('Not implemented', { status: 501 })
      },
    },
  },
})
