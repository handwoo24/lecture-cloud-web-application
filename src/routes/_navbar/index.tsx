import { Link, createFileRoute } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { z } from 'zod'
import { useCallback, useState } from 'react'
import { createServerFn } from '@tanstack/react-start'
import type { FormEvent } from 'react'
import type { Product } from '@/model/product'
import { Category, zodCategorySchema } from '@/model/product'
import { getProducts } from '@/database/products'
import { m } from '@/paraglide/messages.js'
import { getLocale } from '@/paraglide/runtime'

const validateSearch = z.object({
  name: z.string().optional(),
  category: zodCategorySchema.optional(),
})

const loaderFn = createServerFn({ method: 'GET' })
  .inputValidator(validateSearch)
  .handler(async (ctx) => {
    const products = await getProducts(ctx.data)
    return { products }
  })

export const Route = createFileRoute('/_navbar/')({
  component: App,
  loader(ctx) {
    const search = validateSearch.parse(ctx.location.search)
    return loaderFn({ ...ctx, data: search })
  },
  validateSearch,
})

const parseFormValue = (form: HTMLFormElement, name: string) => {
  const formData = new FormData(form)
  return formData.get(name)
}

function App() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const { products } = Route.useLoaderData()

  const [numberFormat] = useState(
    () =>
      new Intl.NumberFormat(getLocale(), {
        style: 'currency',
        currency: 'KRW',
      }),
  )

  const updateSearchParams = useCallback(
    (searchParams: typeof search) =>
      navigate({ to: '/', search: searchParams }),
    [navigate],
  )

  const handleSubmitFilter = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      const formValue = parseFormValue(e.currentTarget, 'category')
      const category = zodCategorySchema.parse(formValue)
      updateSearchParams({ ...search, category })
    },
    [navigate, search],
  )

  const handleSubmitSearch = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const formValue = parseFormValue(e.currentTarget, 'name')
      const name = z.string().parse(formValue)
      updateSearchParams({ ...search, name: name === '' ? undefined : name })
    },
    [navigate, search],
  )

  const handleResetFilter = useCallback(() => {
    updateSearchParams({ ...search, category: undefined })
  }, [navigate, search])

  return (
    <main>
      <div className="product-control-bar">
        <form className="w-full md:max-w-sm" onSubmit={handleSubmitSearch}>
          <label className="input w-full">
            <input
              name="name"
              type="search"
              defaultValue={search.name}
              placeholder={m.products_search_placeholder()}
            />
            <span className="label">
              <Search />
            </span>
          </label>
        </form>
        <form
          className="filter"
          onChange={handleSubmitFilter}
          onReset={handleResetFilter}
        >
          <input className="btn btn-square" type="reset" value="×" />
          <input
            className="btn"
            type="radio"
            name="category"
            value="shoes"
            defaultChecked={search.category === Category.Shoes}
            aria-label={m.products_category_shoes()}
          />
          <input
            className="btn"
            type="radio"
            name="category"
            value="tshirts"
            defaultChecked={search.category === Category.Tshirts}
            aria-label={m.products_category_tshirts()}
          />
        </form>
      </div>
      <div className="divider" />
      <div className="grid">
        {products.map((product: Product) => (
          <Link
            className="product-card"
            key={product.id}
            to="/checkout/$productId"
            params={{ productId: product.id }}
          >
            <figure>
              <img src={product.picture} alt="Shoes" />
            </figure>
            <div className="card-body">
              <h2 className="card-title">{product.name}</h2>
              <p>{product.description}</p>
              <div className="card-actions">
                <button className="btn btn-primary">
                  {numberFormat.format(Number(product.price))}
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
