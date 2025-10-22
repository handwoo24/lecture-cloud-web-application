import { createFileRoute } from '@tanstack/react-router'
import { zodMessageSchema } from '@/model/pubsub'
import { createDeadLetter } from '@/database/deadLetters'

export const Route = createFileRoute('/api/pubsub/dead-letter')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const message = zodMessageSchema.safeParse(await request.json())
        if (!message.success) {
          return new Response('invalid message', { status: 400 })
        }

        await createDeadLetter(message.data)

        return new Response('success', { status: 200 })
      },
    },
  },
})
