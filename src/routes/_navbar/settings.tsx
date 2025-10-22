import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_navbar/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main>
      <button className="btn">Push 권한 요청</button>
      <button className="btn">Push 메시지 보내기</button>
    </main>
  )
}
