import { createFileRoute } from '@tanstack/react-router'
import { setupPubsubEmulator } from '@/google/pubsub'

export const Route = createFileRoute('/api/pubsub/setup')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        await setupPubsubEmulator('pubsub-test', 'pubsub-test-push', {
          pushEndpoint: url.origin + '/api/pubsub/push',
        })
        return new Response('success', { status: 200 })
      },
    },
  },
})
