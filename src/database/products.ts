import { createServerOnlyFn } from '@tanstack/react-start'
import selectProductsQuery from './sql/select_products.sql?raw'
import selectProductQuery from './sql/select_product.sql?raw'
import { getPool } from './config'
import type { Product } from '@/model/product'
import { zodProductSchema } from '@/model/product'

export const getProducts = createServerOnlyFn(
  async ({ name, category }: Partial<Pick<Product, 'name' | 'category'>>) => {
    try {
      const pool = getPool()
      const res = await pool.query(selectProductsQuery, [category, name])
      return zodProductSchema.array().parse(res.rows)
    } catch (error) {
      throw new Error('Failed to get products: ' + error)
    }
  },
)

export const getProduct = createServerOnlyFn(async (id: string) => {
  try {
    const pool = getPool()
    const res = await pool.query(selectProductQuery, [id])

    if (!res.rows.length) return null

    return zodProductSchema.parse(res.rows[0])
  } catch (error) {
    throw new Error('Failed to get product: ' + error)
  }
})
