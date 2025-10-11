import { createFileRoute } from '@tanstack/react-router'
import { getVersionFn } from '@/server/database'

export const Route = createFileRoute('/')({
  component: App,
  loader() {
    return getVersionFn()
  },
})

function App() {
  const version = Route.useLoaderData()

  return (
    <div>
      <p>Database Version: {version}</p>
      <button>구글로 로그인</button>
    </div>
  )
}
