import { createServerOnlyFn } from '@tanstack/react-start'
import { getPool } from './config'
import insertOrderQuery from './sql/insert_order.sql?raw'
import insertOrderItemQuery from './sql/insert_order_item.sql?raw'
import updateOrderQuery from './sql/update_order.sql?raw'
import selectOrderItemsQuery from './sql/select_order_items.sql?raw'
import type { Product } from '@/model/product'
import { zodOrderItemSchema, zodOrderSchema } from '@/model/order'

export const createOrder = createServerOnlyFn(
  async (
    uid: string,
    amount: string,
    items: Array<{ quantity: number; product: Product }>,
  ) => {
    const client = await getPool().connect()
    try {
      await client.query('BEGIN')

      const res = await client.query(insertOrderQuery, [uid, amount])

      const order = zodOrderSchema.parse(res.rows[0])

      const promises = items.map(({ product, quantity }) =>
        client.query(insertOrderItemQuery, [
          order.id,
          product.id,
          product.price,
          quantity,
        ]),
      )

      await Promise.all(promises)

      await client.query('COMMIT')

      return order
    } catch (error) {
      await client.query('ROLLBACK')
      throw new Error('Failed to create order: ' + error)
    } finally {
      client.release()
    }
  },
)

export const confirmOrder = createServerOnlyFn(
  async (id: string, paymentKey: string, paymentType: string) => {
    try {
      const pool = getPool()
      await pool.query(updateOrderQuery, [id, paymentKey, paymentType])
    } catch (error) {
      throw new Error('Failed to confirm order: ' + error)
    }
  },
)

export const getOrderItems = createServerOnlyFn(async (id: string) => {
  try {
    const pool = getPool()
    const res = await pool.query(selectOrderItemsQuery, [id])
    if (!res.rows.length) {
      throw new Error('No order items found')
    }

    return zodOrderItemSchema.array().parse(res.rows)
  } catch (error) {
    throw new Error('Failed to get order items: ' + error)
  }
})
