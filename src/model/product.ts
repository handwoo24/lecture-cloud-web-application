import { z } from 'zod'

export enum Category {
  Shoes = 'shoes',
  Tshirts = 'tshirts',
}

export const zodCategorySchema = z.nativeEnum(Category)

export const zodProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  category: zodCategorySchema,
  price: z.string().min(0),
  picture: z.string().url(),
  stock: z.number().min(0),
  description: z.string(),
})

export type Product = z.infer<typeof zodProductSchema>
