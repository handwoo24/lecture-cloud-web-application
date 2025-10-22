import { createFileRoute } from '@tanstack/react-router'
import { useCallback } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { getMessagingToken } from '@/google/firebase'
import { createMessagingTokenFn } from '@/server/messagingToken'
import { publishTestFn } from '@/server/pubsub'

export const Route = createFileRoute('/_navbar/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  const createToken = useServerFn(createMessagingTokenFn)

  const publishTest = useServerFn(publishTestFn)

  const handleClickRequestPermission = useCallback(async () => {
    try {
      const token = await getMessagingToken()
      await createToken({ data: token })
    } catch (error) {
      console.error(error)
    }
  }, [createToken])

  const handleClickPushMessage = useCallback(async () => {
    await publishTest()
  }, [publishTest])

  return (
    <main>
      <button className="btn" onClick={handleClickRequestPermission}>
        Push 권한 요청
      </button>
      <button className="btn" onClick={handleClickPushMessage}>
        Push 메시지 요청하기
      </button>
    </main>
  )
}
