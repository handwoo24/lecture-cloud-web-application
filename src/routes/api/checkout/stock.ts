import { createFileRoute } from '@tanstack/react-router'
import { zodSuccessParams } from '@/model/payments'
import { zodMessageSchema } from '@/model/pubsub'

export const Route = createFileRoute('/api/checkout/stock')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const result = zodMessageSchema.safeParse(await request.json())

        if (!result.success) {
          return new Response('Invalid message', { status: 400 })
        }

        const buffer = Buffer.from(result.data.message.data, 'base64')
        const jsonString = buffer.toString('utf8')
        const params = zodSuccessParams.safeParse(JSON.parse(jsonString))

        if (!params.success) {
          return new Response('Invalid params', { status: 400 })
        }

        // 여기에 제품 재고를 업데이트 하는 로직을 추가합니다.

        return new Response('success', { status: 200 })
      },
    },
  },
})
