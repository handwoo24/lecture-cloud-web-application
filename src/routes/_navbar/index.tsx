import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useCallback } from 'react'
import { loginFn, logoutFn } from '@/server/auth'
import { useAuthSession } from '@/session'
import { getVersion } from '@/database/version'

export const Route = createFileRoute('/_navbar/')({
  component: App,
  async loader() {
    const version = await getVersion()
    const session = await useAuthSession()
    return { version, uid: session.data.uid }
  },
})

function App() {
  const { version, uid } = Route.useLoaderData()

  const logout = useServerFn(logoutFn)

  const login = useServerFn(loginFn)

  const handleClickLogin = useCallback(() => login(), [login])

  const handleClickLogout = useCallback(() => logout(), [logout])

  return (
    <main>
      <p>Database Version: {version}</p>
      {uid ? (
        <button onClick={handleClickLogout}>로그아웃</button>
      ) : (
        <button onClick={handleClickLogin}>구글로 로그인</button>
      )}
    </main>
  )
}
