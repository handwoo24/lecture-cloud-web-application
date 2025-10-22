import { createFileRoute, redirect } from '@tanstack/react-router'
import { publishMessage } from '@/google/pubsub'
import { zodCheckoutCallbackSchema } from '@/model/checkout'

export const Route = createFileRoute('/api/checkout/callback')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const params = Object.fromEntries(url.searchParams.entries())
        const result = zodCheckoutCallbackSchema.safeParse(params)

        if (!result.success) {
          throw redirect({ to: '/checkout/error' })
        }

        // 데이터베이스에서 주문을 '결제됨' 상태로 업데이트 합니다.
        await confirmOrder(
          result.data.orderId,
          result.data.paymentKey,
          result.data.paymentType,
        )

        const widgetSecretKey = process.env.TOSSPAYMENTS_WIDGET_SECRET_KEY
        const encryptedSecretKey =
          'Basic ' + Buffer.from(widgetSecretKey + ':').toString('base64')

        const response = await fetch(
          'https://api.tosspayments.com/v1/payments/confirm',
          {
            method: 'POST',
            headers: {
              Authorization: encryptedSecretKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(result.data),
          },
        )

        if (!response.ok) {
          throw redirect({ to: '/checkout/error' })
        }

        await publishMessage('checkout-success', JSON.stringify(result.data))

        throw redirect({ to: '/checkout/success' })
      },
    },
  },
})
