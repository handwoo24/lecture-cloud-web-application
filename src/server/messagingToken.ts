import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { createMessagingToken } from '@/database/messagingTokens'
import { useAuthSession } from '@/session'

export const createMessagingTokenFn = createServerFn({
  method: 'POST',
})
  .inputValidator(z.string())
  .handler(async (ctx) => {
    const session = await useAuthSession()
    if (!session.data.uid) {
      throw new Error('Unauthorized')
    }
    return createMessagingToken(session.data.uid, ctx.data)
  })
