import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useCallback } from 'react'
import { getVersionFn } from '@/server/database'
import { loginFn } from '@/server/auth'

export const Route = createFileRoute('/')({
  component: App,
  async loader() {
    return getVersionFn()
  },
})

function App() {
  const version = Route.useLoaderData()

  const login = useServerFn(loginFn)

  const handleClickLogin = useCallback(() => login(), [login])

  return (
    <div>
      <p>Database Version: {version}</p>
      <button onClick={handleClickLogin}>구글로 로그인</button>
    </div>
  )
}
