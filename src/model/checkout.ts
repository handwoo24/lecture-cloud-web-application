import { z } from 'zod'

export const zodCheckoutCallbackSchema = z.object({
  paymentType: z.string().min(1, 'paymentType is required'),
  orderId: z.string().min(1, 'orderId is required'),
  paymentKey: z.string().min(1, 'paymentKey is required'),
  amount: z.coerce.number().positive('Amount must be a positive number'),
})
