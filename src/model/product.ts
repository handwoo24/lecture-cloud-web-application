import { z } from 'zod'

export enum Category {
  Shoes = 'shoes',
  Tshirts = 'tshirts',
}

export const zodCategorySchema = z.nativeEnum(Category)

export const zodProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  category: zodCategorySchema,
  price: z.string(),
  picture: z.string().url(),
  stock: z.number(),
  description: z.string(),
})

export type Product = z.infer<typeof zodProductSchema>
