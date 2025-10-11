import { createServerOnlyFn } from '@tanstack/react-start'
import z from 'zod'
import { getPool } from './config'
import sql from './sql/select_version.sql?raw'

export const getVersion = createServerOnlyFn(async () => {
  try {
    const pool = getPool()
    const res = await pool.query(sql)
    return z.string().parse(res.rows[0].version)
  } catch (error) {
    throw new Error('Failed to fetch version from database: ' + error)
  }
})
