import {
  Link,
  createFileRoute,
  notFound,
  redirect,
} from '@tanstack/react-router'
import { FolderOpen } from 'lucide-react'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getProduct } from '@/database/products'
import { useAuthSession } from '@/session'
import { m } from '@/paraglide/messages'

const loaderFn = createServerFn({ method: 'GET' })
  .inputValidator(z.string())
  .handler(async (ctx) => {
    const session = await useAuthSession()
    if (!session.data.uid) {
      throw redirect({ to: '/login' })
    }

    const product = await getProduct(ctx.data)

    if (!product) {
      throw notFound()
    }
    return { product }
  })

export const Route = createFileRoute('/_navbar/$productId')({
  component: RouteComponent,
  loader(ctx) {
    return loaderFn({ ...ctx, data: ctx.params.productId })
  },
})

function RouteComponent() {
  const { product } = Route.useLoaderData()

  return (
    <main>
      <div className="w-xs mx-auto">
        <form>
          <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4">
            <legend className="fieldset-legend">{m.products_info()}</legend>

            <label className="label">{m.products_name_label()}</label>
            <input type="text" className="input" defaultValue={product.name} />

            <label className="label">{m.products_price_label()}</label>
            <label className="input">
              <span className="label">{m.currency_symbol()}</span>
              <input type="number" defaultValue={product.price} />
            </label>

            <label className="label">{m.products_stock_label()}</label>
            <input
              type="number"
              className="input"
              defaultValue={product.stock}
            />

            <label className="label">{m.products_picture_label()}</label>
            <label className="relative">
              <img
                src={product.picture}
                className="aspect-video object-cover"
              />
              <div className="img-mask">
                <FolderOpen className="size-8" />
              </div>
              <input type="file" className="hidden" />
            </label>

            <input
              type="submit"
              className="btn btn-primary"
              defaultValue={m.save()}
            />
          </fieldset>
        </form>
        <div className="divider" />
        <Link
          className="btn btn-lg btn-block"
          to="/checkout/$productId"
          params={{ productId: product.id }}
        >
          {m.checkout()}
        </Link>
      </div>
    </main>
  )
}
