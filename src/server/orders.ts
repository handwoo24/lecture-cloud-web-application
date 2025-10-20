import { z } from 'zod'
import { redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { createOrder } from '@/database/orders'
import { zodProductSchema } from '@/model/product'
import { useAuthSession } from '@/session'

export const createOrderSchema = z.object({
  amount: z.string(),
  items: z.object({ quantity: z.number(), product: zodProductSchema }).array(),
})

export const createOrderFn = createServerFn({ method: 'POST' })
  .inputValidator(createOrderSchema)
  .handler(async (ctx) => {
    const session = await useAuthSession()
    if (!session.data.uid) {
      throw redirect({ to: '/login' })
    }
    return createOrder(session.data.uid, ctx.data.amount, ctx.data.items)
  })
