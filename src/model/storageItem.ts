import { z } from 'zod'

export const zodStorageItemSchema = z.object({
  id: z.string().uuid(),
  path: z.string(),
  name: z.string(),
  type: z.string(),
  size: z.number().int(),
  uid: z.string().uuid(),
  download_url: z.string().url(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date().nullish(),
})

export type StorageItem = z.infer<typeof zodStorageItemSchema>
