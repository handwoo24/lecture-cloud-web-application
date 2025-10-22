import { createServerFn } from '@tanstack/react-start'
import { redirect } from '@tanstack/react-router'
import { z } from 'zod'
import {
  createMessagingToken,
  getMessagingTokens,
} from '@/database/messagingTokens'
import { useAuthSession } from '@/session'
import { sendMessageForMulticast } from '@/google/firebase-admin'

export const createMessagingTokenFn = createServerFn({
  method: 'POST',
})
  .inputValidator(z.string())
  .handler(async (ctx) => {
    const session = await useAuthSession()
    if (!session.data.uid) {
      throw redirect({ to: '/login' })
    }
    return createMessagingToken(session.data.uid, ctx.data)
  })

export const pushSelfMessageFn = createServerFn({
  method: 'GET',
}).handler(async () => {
  const session = await useAuthSession()
  if (!session.data.uid) {
    throw redirect({ to: '/login' })
  }

  const messagingTokens = await getMessagingTokens(session.data.uid)
  const tokens = messagingTokens.map((token) => token.fcm_token)

  await sendMessageForMulticast({
    tokens,
    notification: { title: '나에게 보내는 편지', body: '안녕 반가워!' },
  })
})
