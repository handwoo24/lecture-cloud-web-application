import { z } from 'zod'

export const zodMessageSchema = z.object({
  message: z.object({ data: z.string() }),
})

export type Message = z.infer<typeof zodMessageSchema>
