import { z } from 'zod'

export const zodNotificationSchema = z.object({
  title: z.string(),
  body: z.string(),
  uid: z.string(),
})

export type Notification = z.infer<typeof zodNotificationSchema>
