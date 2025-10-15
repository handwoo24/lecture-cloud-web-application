import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getProduct } from '@/database/products'

const loaderFn = createServerFn({ method: 'GET' })
  .inputValidator(z.string())
  .handler(async (ctx) => {
    const product = await getProduct(ctx.data)
    return { product }
  })

export const Route = createFileRoute('/_navbar/checkout/$productId')({
  component: CheckoutComponent,
  loader(ctx) {
    return loaderFn({ ...ctx, data: ctx.params.productId })
  },
})

function CheckoutComponent() {
  const { product } = Route.useLoaderData()
  return <main>checkout</main>
}
