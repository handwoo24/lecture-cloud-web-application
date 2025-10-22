import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useCallback } from 'react'
import { loginFn } from '@/server/auth'
import { m } from '@/paraglide/messages'

export const Route = createFileRoute('/_navbar/login')({
  component: RouteComponent,
})

function RouteComponent() {
  const login = useServerFn(loginFn)

  const handleClickLogin = useCallback(() => login(), [login])

  return (
    <main>
      <button className="btn" onClick={handleClickLogin}>
        {m.login_with_google()}
      </button>
    </main>
  )
}
