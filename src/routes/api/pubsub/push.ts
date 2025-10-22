import { createFileRoute } from '@tanstack/react-router'
import { zodNotificationSchema } from '@/model/notifications'
import { sendMessageForMulticast } from '@/google/firebase-admin'
import { getMessagingTokens } from '@/database/messagingTokens'
import { zodMessageSchema } from '@/model/pubsub'

export const Route = createFileRoute('/api/pubsub/push')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const message = zodMessageSchema.safeParse(await request.json())
        if (!message.success) {
          return new Response('invalid message', { status: 400 })
        }

        const buffer = Buffer.from(message.data.message.data, 'base64')
        const jsonString = buffer.toString('utf-8')

        const notification = zodNotificationSchema.safeParse(
          JSON.parse(jsonString),
        )
        if (!notification.success) {
          return new Response('invalid notification', { status: 400 })
        }

        const messagingTokens = await getMessagingTokens(notification.data.uid)
        const tokens = messagingTokens.map((token) => token.fcm_token)

        await sendMessageForMulticast({
          tokens,
          notification: {
            title: notification.data.title,
            body: notification.data.body,
          },
        })

        return new Response('success', { status: 200 })
      },
    },
  },
})
