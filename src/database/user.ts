import { createServerOnlyFn } from '@tanstack/react-start'
import { getPool } from './config'
import selectUserQuery from './sql/select_user_by_provider.sql?raw'
import insertUserQuery from './sql/insert_user.sql?raw'
import type { TokenPayload } from 'google-auth-library'
import { zodUserSchema } from '@/model/user'

export const getUserByGoogle = createServerOnlyFn(async (sub: string) => {
  try {
    const pool = getPool()
    const res = await pool.query(selectUserQuery, ['google', sub])

    if (!res.rows.length) {
      return null
    }

    return zodUserSchema.parse(res.rows[0])
  } catch (error) {
    throw new Error('Failed to get user by Google: ' + error)
  }
})

export const createUserByGoogle = createServerOnlyFn(
  async (idToken: TokenPayload) => {
    try {
      const res = await getPool().query(insertUserQuery, [
        idToken.name,
        idToken.email,
        idToken.email_verified,
        idToken.picture,
        'google',
        idToken.sub,
      ])

      return zodUserSchema.parse(res.rows[0])
    } catch (error) {
      throw new Error('Failed to create user by Google: ' + error)
    }
  },
)
