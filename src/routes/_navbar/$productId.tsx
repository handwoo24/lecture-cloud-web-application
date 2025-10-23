import {
  Link,
  createFileRoute,
  notFound,
  redirect,
} from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { FolderOpen } from 'lucide-react'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { useCallback } from 'react'
import type { FormEvent } from 'react'
import { getProduct } from '@/database/products'
import { useAuthSession } from '@/session'
import { m } from '@/paraglide/messages'
import { zodProductSchema } from '@/model/product'

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

const fieldsSchema = zodProductSchema.extend({
  file: z.instanceof(File).nullish(),
})

function RouteComponent() {
  const { product } = Route.useLoaderData()

  const form = useForm({
    defaultValues: fieldsSchema.parse({ ...product, file: null }),
    validators: {
      onChange: fieldsSchema,
    },
    onSubmit: console.log,
  })

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.stopPropagation()
      e.preventDefault()
      form.handleSubmit()
    },
    [form.handleSubmit],
  )

  return (
    <main>
      <div className="w-xs mx-auto">
        <form onSubmit={handleSubmit}>
          <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4">
            <legend className="fieldset-legend">{m.products_info()}</legend>

            <form.Field
              name="name"
              children={(field) => (
                <>
                  <label className="label">{m.products_name_label()}</label>
                  <input
                    type="text"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="input"
                  />
                </>
              )}
            />

            <form.Field
              name="price"
              children={(field) => (
                <>
                  <label className="label">{m.products_price_label()}</label>
                  <label className="input">
                    <span className="label">{m.currency_symbol()}</span>
                    <input
                      type="number"
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </label>
                </>
              )}
            />

            <form.Field
              name="stock"
              children={(field) => (
                <>
                  <label className="label">{m.products_stock_label()}</label>
                  <input
                    type="number"
                    className="input"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                      field.handleChange(parseInt(e.target.value))
                    }
                  />
                </>
              )}
            />

            <label className="label">{m.products_picture_label()}</label>
            <label className="relative">
              <form.Field
                name="picture"
                children={(field) => (
                  <img
                    src={field.state.value}
                    className="aspect-video object-cover rounded"
                  />
                )}
              ></form.Field>
              <div className="img-mask">
                <FolderOpen className="size-8" />
              </div>
              <form.Field
                name="file"
                listeners={{
                  onChange: ({ value }) => {
                    if (value instanceof File)
                      form.setFieldValue('picture', URL.createObjectURL(value))
                  },
                }}
                children={(field) => (
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    id={field.name}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                      field.handleChange(e.target.files?.item(0))
                    }
                  />
                )}
              />
            </label>

            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!canSubmit || isSubmitting}
                >
                  {isSubmitting && <span className="loading" />}
                  {m.save()}
                </button>
              )}
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
