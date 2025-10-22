import { createFileRoute } from '@tanstack/react-router'
import { setupPubsubEmulator } from '@/google/pubsub'

export const Route = createFileRoute('/api/pubsub/setup')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const { topic } = await setupPubsubEmulator(
          'dead-letter',
          'dead-letter-sub',
          { pushEndpoint: url.origin + '/api/pubsub/dead-letter' },
        )
        await setupPubsubEmulator('pubsub-test', 'pubsub-test-push', {
          pushEndpoint: url.origin + '/api/pubsub/push',
        })
        await setupPubsubEmulator('pubsub-test', 'pubsub-test-fail', {
          pushEndpoint: url.origin + '/api/pubsub/fail',
          deadLetterPolicy: { deadLetterTopic: topic.name },
        })
        return new Response('success', { status: 200 })
      },
    },
  },
})
