import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_navbar/checkout/$productId')({
  component: CheckoutComponent,
})

function CheckoutComponent() {
  return <main>checkout</main>
}
