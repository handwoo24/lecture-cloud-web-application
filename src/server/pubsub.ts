import { createServerFn } from '@tanstack/react-start'
import { redirect } from '@tanstack/react-router'
import { publishMessage } from '@/google/pubsub'
import { useAuthSession } from '@/session'

export const publishTestFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await useAuthSession()
    if (!session.data.uid) {
      throw redirect({ to: '/login' })
    }
    return publishMessage(
      'pubsub-test',
      JSON.stringify({
        title: '나에게 보내는 편지',
        body: '안녕 반가워!',
        uid: session.data.uid,
      }),
    )
  },
)
