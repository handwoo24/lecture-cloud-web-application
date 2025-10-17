import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_navbar/checkout/success')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_navbar/checkout/success"!</div>
}
