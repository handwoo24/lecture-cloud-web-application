import { createServerOnlyFn } from '@tanstack/react-start'
import selectProductsQuery from './sql/select_products.sql?raw'
import selectProductQuery from './sql/select_product.sql?raw'
import updateProductStockQuery from './sql/update_product_stock.sql?raw'
import updateProductQuery from './sql/update_product.sql?raw'
import insertStorageItemQuery from './sql/insert_storage_item.sql?raw'
import { getPool } from './config'
import type { Product } from '@/model/product'
import type { StorageItem } from '@/model/storageItem'
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

export const updateProductStocks = createServerOnlyFn(
  async (products: Array<Pick<Product, 'id' | 'stock'>>) => {
    const client = await getPool().connect()
    try {
      await client.query('BEGIN')

      const promises = products.map(({ id, stock }) => {
        return client.query(updateProductStockQuery, [id, stock])
      })

      await Promise.all(promises)

      await client.query('COMMIT')
    } catch (error) {
      await client.query('ROLLBACK')
      throw new Error('Failed to update product stocks: ' + error)
    } finally {
      client.release()
    }
  },
)

export const updateProduct = createServerOnlyFn(
  async (product: Product, item?: StorageItem) => {
    const pool = getPool()
    if (!item) {
      try {
        await pool.query(updateProductQuery, [
          product.id,
          product.name,
          product.price,
          product.stock,
          product.picture,
        ])
      } catch (error) {
        throw new Error('Failed to update product: ' + error)
      }

      return
    }

    const client = await pool.connect()

    try {
      await client.query('BEGIN')

      await client.query(updateProductQuery, [
        product.id,
        product.name,
        product.price,
        product.stock,
        product.picture,
      ])

      await client.query(insertStorageItemQuery, [
        item.path,
        item.download_url,
        item.uid,
        item.name,
        item.type,
        item.size,
      ])

      await client.query('COMMIT')
    } catch (error) {
      await client.query('ROLLBACK')
      throw new Error('Failed to update product: ' + error)
    } finally {
      client.release()
    }
  },
)
