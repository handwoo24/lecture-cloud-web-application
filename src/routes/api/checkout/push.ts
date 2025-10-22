import { createFileRoute } from '@tanstack/react-router'
import { zodSuccessParams } from '@/model/payments'
import { zodMessageSchema } from '@/model/pubsub'
import {
  deleteMessagingTokens,
  getMessagingTokenByOrder,
} from '@/database/messagingTokens'
import { sendMessageForMulticast } from '@/google/firebase-admin'

enum TokenErrorCodes {
  Invalid = 'messaging/invalid-registration-token',
  NotRegistered = 'messaging/registration-token-not-registered',
}

export const Route = createFileRoute('/api/checkout/push')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const message = zodMessageSchema.safeParse(await request.json())

        if (!message.success) {
          return new Response('Invalid message', { status: 400 })
        }

        const buffer = Buffer.from(message.data.message.data, 'base64')
        const jsonString = buffer.toString('utf8')
        const params = zodSuccessParams.safeParse(JSON.parse(jsonString))

        if (!params.success) {
          return new Response('Invalid params', { status: 400 })
        }

        const messagingTokens = await getMessagingTokenByOrder(
          params.data.orderId,
        )
        const tokens = messagingTokens.map(({ fcm_token }) => fcm_token)

        if (!tokens.length) {
          return new Response('No tokens', { status: 201 })
        }

        const result = await sendMessageForMulticast({
          notification: {
            title: '결제 완료! 🎉',
            body: `결제 금액 ${params.data.amount}원이 정상적으로 처리되었습니다.`,
          },
          tokens,
        })

        const targets = result.responses.reduce(
          (acc: Array<string>, cur, idx) => {
            const code = cur.error?.code
            if (
              code !== TokenErrorCodes.Invalid &&
              code !== TokenErrorCodes.NotRegistered
            ) {
              return acc
            }

            acc.push(tokens[idx])
            return acc
          },
          [],
        )

        await deleteMessagingTokens(targets)

        return new Response('success', { status: 200 })
      },
    },
  },
})
