import { createServerOnlyFn } from '@tanstack/react-start'
import insertMessagingTokenQuery from './sql/insert_messaging_token.sql?raw'
import selectMessagingTokensQuery from './sql/select_messaging_tokens.sql?raw'
import { getPool } from './config'
import { zodMessagingTokenSchema } from '@/model/messagingToken'

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

export const getMessagingTokens = createServerOnlyFn(async (uid: string) => {
  try {
    const pool = getPool()
    const res = await pool.query(selectMessagingTokensQuery, [uid])

    return zodMessagingTokenSchema.array().parse(res.rows)
  } catch (error) {
    throw new Error('Failed to get messaging token: ' + error)
  }
})
