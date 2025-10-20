import { z } from 'zod'

export const zodSuccessParams = z.object({
  pamentType: z.string().nullish(),
  orderId: z.string(),
  paymentKey: z.string(),
  amount: z.coerce.number(),
})

export type SuccessParams = z.infer<typeof zodSuccessParams>
