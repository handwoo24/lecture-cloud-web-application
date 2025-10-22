import { z } from 'zod'

export const zodMessageSchema = z.object({
  message: z.object({
    data: z.string(),
    message_id: z.string(),
    publish_time: z.coerce.date(),
  }),
  subscription: z.string(),
})

export type Message = z.infer<typeof zodMessageSchema>
