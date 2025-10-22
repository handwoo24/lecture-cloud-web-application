import { createServerOnlyFn } from '@tanstack/react-start'
import insertMessagingTokenQuery from './sql/insert_messaging_token.sql?raw'
import { getPool } from './config'

export const createMessagingToken = createServerOnlyFn(
  async (uid: string, fcmToken: string) => {
    try {
      const pool = getPool()
      await pool.query(insertMessagingTokenQuery, [uid, fcmToken])
    } catch (error) {
      throw new Error('Failed to create messaging token: ' + error)
    }
  },
)
