import { z } from 'zod'

export const zodMessagingTokenSchema = z.object({
  uid: z.string(),
  fcm_token: z.string(),
})

export type MessagingToken = z.infer<typeof zodMessagingTokenSchema>
