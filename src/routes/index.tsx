import { createFileRoute } from '@tanstack/react-router'
import { createServerFn, useServerFn } from '@tanstack/react-start'
import { useCallback } from 'react'
import { loginFn } from '@/server/auth'
import { useAuthSession } from '@/server/session'
import { getVersion } from '@/database/version'

const loaderFn = createServerFn({ method: 'GET' }).handler(async () => {
  const version = await getVersion()
  const session = await useAuthSession()

  return { version, uid: session.data.uid }
})

export const Route = createFileRoute('/')({
  component: App,
  loader() {
    return loaderFn()
  },
})

function App() {
  const { version, uid } = Route.useLoaderData()

  const login = useServerFn(loginFn)

  const handleClickLogin = useCallback(() => login(), [login])

  return (
    <div>
      <p>Database Version: {version}</p>
      {uid ? (
        <button>로그아웃</button>
      ) : (
        <button onClick={handleClickLogin}>구글로 로그인</button>
      )}
    </div>
  )
}
