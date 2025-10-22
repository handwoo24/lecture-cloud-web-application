import { z } from 'zod'

export const zodOrderSchema = z.object({
  id: z.string().uuid(),
  ordered_at: z.coerce.date(),
  uid: z.string().uuid(),
  confirmed: z.boolean(),
  payment_key: z.string().nullish(),
  payment_type: z.string().nullish(),
  amount: z.string(),
})

export type Order = z.infer<typeof zodOrderSchema>

export const zodOrderItemSchema = z.object({
  id: z.string().uuid(),
  order_id: z.string().uuid(),
  product_id: z.string().uuid(),
  price: z.string(),
  quantity: z.number().int().min(1),
})

export type OrderItem = z.infer<typeof zodOrderItemSchema>
