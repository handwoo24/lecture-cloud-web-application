import { createFileRoute } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { z } from 'zod'
import { useCallback } from 'react'
import type { FormEvent } from 'react'

enum Category {
  Shoes = 'shoes',
  Tshirts = 'tshirts',
}

const zodCategorySchema = z.nativeEnum(Category)

export const Route = createFileRoute('/_navbar/')({
  component: App,
  loader() {},
  // URL 쿼리 파라미터를 검증합니다.
  validateSearch: z.object({
    name: z.string().optional(),
    category: zodCategorySchema.optional(),
  }),
})

const parseFormValue = (form: HTMLFormElement, name: string) => {
  const formData = new FormData(form)
  return formData.get(name)
}

function App() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

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
              placeholder="상품명으로 검색하세요."
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
            aria-label="신발"
          />
          <input
            className="btn"
            type="radio"
            name="category"
            value="tshirts"
            defaultChecked={search.category === Category.Tshirts}
            aria-label="티셔츠"
          />
        </form>
      </div>
      <div className="divider" />
      <div className="grid">
        <div className="product-card">
          <figure>
            <img
              src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
              alt="Shoes"
            />
          </figure>
          <div className="card-body">
            <h2 className="card-title">나XX 운동화</h2>
            <p>
              이번 시즌 최고의 운동화. 편안한 착용감과 세련된 디자인을
              자랑합니다.
            </p>
            <div className="card-actions">
              <button className="btn btn-primary">구매하기</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
