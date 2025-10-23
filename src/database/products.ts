import { createServerOnlyFn } from '@tanstack/react-start'
import selectProductsQuery from './sql/select_products.sql?raw'
import selectProductQuery from './sql/select_product.sql?raw'
import updateProductStockQuery from './sql/update_product_stock.sql?raw'
import updateProductQuery from './sql/update_product.sql?raw'
import insertStorageItemQuery from './sql/insert_storage_item.sql?raw'
import { getPool } from './config'
import { withTransaction } from './transaction'
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
    try {
      await withTransaction(getPool(), async (client) => {
        const promises = products.map(({ id, stock }) => {
          return client.query(updateProductStockQuery, [id, stock])
        })

        await Promise.all(promises)
      })
    } catch (error) {
      throw new Error('Failed to update product stocks: ' + error)
    }
  },
)

export const updateProduct = createServerOnlyFn(
  async (
    id: string,
    product: Pick<Product, 'name' | 'price' | 'stock' | 'picture'>,
    item?: Pick<
      StorageItem,
      'path' | 'download_url' | 'uid' | 'name' | 'type' | 'size'
    >,
  ) => {
    const pool = getPool()

    try {
      if (!item) {
        await pool.query(updateProductQuery, [
          id,
          product.name,
          product.price,
          product.stock,
          product.picture,
        ])
      } else {
        await withTransaction(pool, async (client) => {
          await client.query(updateProductQuery, [
            id,
            product.name,
            product.price,
            product.stock,
            item.download_url,
          ])

          await client.query(insertStorageItemQuery, [
            item.path,
            item.download_url,
            item.uid,
            item.name,
            item.type,
            item.size,
          ])
        })
      }
    } catch (error) {
      throw new Error('Failed to update product: ' + error)
    }
  },
)
