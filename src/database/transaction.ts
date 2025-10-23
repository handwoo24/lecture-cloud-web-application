import type { Pool, PoolClient } from 'pg'

export const withTransaction = async <T>(
  pool: Pool,
  callback: (client: PoolClient) => Promise<T>,
): Promise<T> => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    // Re-throw the error to be handled by the caller
    throw error
  } finally {
    client.release()
  }
}
