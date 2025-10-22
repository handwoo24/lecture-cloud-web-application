import { createServerOnlyFn } from '@tanstack/react-start'
import insertDeadLetterQuery from './sql/insert_dead_letter.sql?raw'
import { getPool } from './config'
import type { Message } from '@/model/pubsub'

export const createDeadLetter = createServerOnlyFn(async (message: Message) => {
  try {
    const pool = getPool()
    await pool.query(insertDeadLetterQuery, [
      message.subscription,
      message.message.data,
      message.message.message_id,
      message.message.publish_time,
    ])
  } catch (error) {
    throw new Error('Failed to create dead letter: ' + error)
  }
})
