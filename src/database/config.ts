import { createServerOnlyFn } from '@tanstack/react-start'
import { Pool } from 'pg'

let pool: Pool | null = null

export const getPool = createServerOnlyFn(() => {
  if (!pool) {
    return (pool = new Pool({
      host: process.env.POSTGRES_HOST,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      port: 5432,
    }))
  }

  return pool
})
