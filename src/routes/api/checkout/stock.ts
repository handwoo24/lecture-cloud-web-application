import { createFileRoute } from '@tanstack/react-router'
import { zodSuccessParams } from '@/model/payments'
import { zodMessageSchema } from '@/model/pubsub'
import { getOrderItems } from '@/database/orders'
import { updateProductStocks } from '@/database/products'

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

        const items = await getOrderItems(params.data.orderId)
        const stocks = items.map(({ product_id, quantity }) => ({
          id: product_id,
          stock: -quantity,
        }))

        await updateProductStocks(stocks)

        return new Response('success', { status: 200 })
      },
    },
  },
})
