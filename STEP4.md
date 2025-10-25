# UI 개발하기

### CSS 플러그인 설치하기
지금까지 작업한 애플리케이션 UI에 간단하게 스타일링을 적용합니다.   
이번 학습에는 [daisyui](https://daisyui.com/)라는 pre-designed된 css 플러그인을 활용합니다.   
아래 라이브러리를 설치합니다.
```bash
npm install -D daisyui@latest
```

설치된 플러그인을 적용하기 위해 ```styles.css``` 파일을 수정합니다.
```css
/* src/styles.css */

@import 'tailwindcss';
@plugin "daisyui";
...
```
---

### 레이아웃 구성하기
이제 애플리케이션에 일반적인 레이아웃을 작성합니다.   
페이지 전반에 걸쳐 상단에 표시될 Navbar를 추가합니다.   
daisyui의 [navbar 예제](https://daisyui.com/components/navbar/)를 복사하여 활용합니다.  
아래와 같이 컴포넌트 파일을 만들어 붙여 넣습니다.
```tsx
// src/components/Navbar.tsx

export const Navbar = () => {
  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl">daisyUI</a>
      </div>
      <div className="flex-none">
        <button className="btn btn-square btn-ghost">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="inline-block h-5 w-5 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  )
}
```
```@tanstack/start```는 레이아웃 구조를 적용하기 위해 파일시스템 구조를 이용합니다.   
'_'를 폴더 이름에 접두사로 활용하면 실제로는 라우팅 구조를 가지지 않고 레이아웃을 적용할 수 있습니다.   
실제 구현을 따라하면서 이해해 봅니다.   
```tsx
// src/routes/_navbar.tsx
// src/routes/_navbar 라는 폴더도 생성합니다.

import { Outlet, createFileRoute } from '@tanstack/react-router'
import { Navbar } from '@/components/Navbar'

export const Route = createFileRoute('/_navbar')({
  component: LayoutComponent,
})

function LayoutComponent() {
  return (
    <>
      <Navbar />
      {/* 하위 라우팅은 Outlet 위치에 렌더링 됩니다. */}
      <Outlet />
    </>
  )
}
```
위와 같은 파일을 추가합니다.    
```_navbar.tsx```는 실제로는 라우팅 구조를 가지지 않고 ```_navbar/*``` 하위에 위치한 라우팅들이 렌더링 될때 먼저 렌더링 되는 구조를 가지게 됩니다.   
이제 ```index.tsx```파일을 ```_navbar``` 아래로 이동시킵니다.
> src/routes/_navbar/index.tsx
_navbar.tsx

애플리케이션을 실행하고 http://localhost:3000 으로 이동합니다.    
화면 상단에 Navbar가 표시됩니다.

---

### UI 작성하기

여기서는 간단하게 상품 목록을 구현해봅니다.   
그리드 형태의 상품 목록이 화면에 표시되도록 하고,
필터와 간단한 검색 구현을 추가합니다.   
기능은 추후 구현하도록 하고 컴포넌트만 배치합니다.   
daisyui의 sample 중에서 [label](https://daisyui.com/components/label/), [card](https://daisyui.com/components/card/), [filter](https://daisyui.com/components/filter/)를 사용하여 해당 화면을 작성합니다.   
아래 코드를 참고해 주세요.
```tsx
// src/routes/_navbar/index.tsx

import { createFileRoute } from '@tanstack/react-router'
import { Search } from 'lucide-react'

export const Route = createFileRoute('/_navbar/')({
  component: App,
  loader() {},
})

function App() {
  return (
    <main>
      <div>
        <label className="input">
          <input type="search" placeholder="domain name" />
          <span className="label">
            <Search />
          </span>
        </label>
        <form className="filter">
          <input className="btn btn-square" type="reset" value="×" />
          <input
            className="btn"
            type="radio"
            name="frameworks"
            aria-label="Svelte"
          />
          <input
            className="btn"
            type="radio"
            name="frameworks"
            aria-label="Vue"
          />
          <input
            className="btn"
            type="radio"
            name="frameworks"
            aria-label="React"
          />
        </form>
      </div>
      <div className="grid">
        <div className="card bg-base-100 w-96 shadow-sm">
          <figure>
            <img
              src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
              alt="Shoes"
            />
          </figure>
          <div className="card-body">
            <h2 className="card-title">Card Title</h2>
            <p>
              A card component has a figure, a body part, and inside body there
              are title and actions parts
            </p>
            <div className="card-actions justify-end">
              <button className="btn btn-primary">Buy Now</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
```
애플리케이션을 실행해보면 각 컴포넌트들이 수직으로 배치되어 있습니다.   
이제 이 컴포넌트들을 적절한 위치에 배치할 수 있게 tailwind css를 이용하여 수정합니다.
```tsx
// src/routes/_navbar/index.tsx

function App() {
  return (
    <main className="p-4">
      <div className="flex gap-2 md:flex-row-reverse md:justify-between flex-col">
        <label className="input w-full md:max-w-sm">
          <input type="search" placeholder="상품명으로 검색하세요." />
          <span className="label">
            <Search />
          </span>
        </label>
        <form className="filter">
          <input className="btn btn-square" type="reset" value="×" />
          <input
            className="btn"
            type="radio"
            name="frameworks"
            aria-label="운동화"
          />
          <input
            className="btn"
            type="radio"
            name="frameworks"
            aria-label="티셔츠"
          />
        </form>
      </div>
      <div className="divider" />
      <div className="grid">
        <div className="card bg-base-100 w-96 shadow-sm hover:bg-base-content/5 transition-colors cursor-pointer">
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
            <div className="card-actions justify-end">
              <button className="btn btn-primary">구매하기</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
```

애플리케이션을 실행하고 브라우저에서 개발자 콘솔을 이용하여 device를 모바일로 설정합니다.   
너무 간단한 UI이지만, 화면에 맞게 반응형으로 적용되는 것을 확인할 수 있습니다.   
이번에는 앞서 사용한 긴 tailwind css를 적당한 utility로 관리하기 용이하도록 정의합니다.   
아래 처럼 css파일을 수정합니다.
```css
/* src/styles.css */

...

main {
  /* 이 어플리케이션에서는 main 컨테이너의 padding을 항상 4로 설정합니다. */
  @apply p-4 md:p-6 lg:p-8;
}

@utility product-control-bar {
  /* 상품 검색 및 필터링 컴포넌트 */
  @apply flex gap-2 md:flex-row-reverse md:justify-between flex-col;
}

@utility product-card {
  /* 상품 카드 컴포넌트 */
  @apply card bg-base-100 w-full max-w-[576px] shadow-sm hover:bg-base-content/5 transition-colors cursor-pointer;
}

.product-card .card-actions {
  @apply justify-end;
}

.product-card > figure > img {
  @apply object-cover aspect-video;
}

.grid:has(> .product-card) {
  @apply grid-cols-[repeat(auto-fit,minmax(192px,1fr))] gap-4;
}
```

그리고 정의한 class를 컴포넌트에 적용합니다.
```tsx
// src/routes/_navbar/index.tsx

function App() {
  return (
    <main>
      <div className="product-control-bar">
        <label className="input w-full md:max-w-sm">
          <input type="search" placeholder="상품명으로 검색하세요." />
          <span className="label">
            <Search />
          </span>
        </label>
        <form className="filter">
          <input className="btn btn-square" type="reset" value="×" />
          <input
            className="btn"
            type="radio"
            name="category"
            aria-label="운동화"
          />
          <input
            className="btn"
            type="radio"
            name="category"
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
```
---

### UI 기능 구현하기
이번에는 간단하게 form을 이용한 제출로 필터와 검색 기능을 구현합니다.   
 - 상품명을 입력후 제출하면 URL 파라미터로 전달
 - 필터를 클릭하면 URL파라미터로 전달

이 URL 파라미터로 전달되는 값은 추후 데이터베이스에서 상품을 조회할 때 사용합니다.   
아래와 같이 필터와 검색에 대한 이벤트 핸들러를 정의합니다.   
```tsx

// src/routes/_navbar/index.tsx

import { createFileRoute } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { z } from 'zod'
import type { FormEvent } from 'react'

enum ZodCategory {
  Shoes = 'shoes',
  Tshirts = 'tshirts',
}

const zodCategorySchema = z.nativeEnum(ZodCategory)

export const Route = createFileRoute('/_navbar/')({
  component: App,
  loader() {},
  // URL 쿼리 파라미터를 검증합니다.
  validateSearch: z.object({
    name: z.string().optional(),
    category: zodCategorySchema.optional(),
  }),
})

function App() {
  const { name, category } = Route.useSearch()
  const navigate = Route.useNavigate()

  const handleSubmitFilter = (e: FormEvent<HTMLFormElement>) => {
    // form의 값 변경을 감지하여 url 쿼리 파라미터를 변경합니다.
    const formData = new FormData(e.currentTarget)
    const value = zodCategorySchema.parse(formData.get('category'))
    navigate({ to: '/', search: { category: value, name } })
  }

  const handleSubmitSearch = (e: FormEvent<HTMLFormElement>) => {
    // form의 기본 제출을 막습니다.
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const value = z.string().parse(formData.get('name'))
    navigate({
      to: '/',
      search: { category, name: value === '' ? undefined : value },
    })
  }

  const handleResetFilter = () => {
    navigate({ to: '/', search: { category: undefined, name } })
  }

  return (
    <main>
      <div className="product-control-bar">
        <form className="w-full md:max-w-sm" onSubmit={handleSubmitSearch}>
          <label className="input w-full">
            <input
              name="name"
              type="search"
              defaultValue={name}
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
```
중복되는 코드를 아래와 같이 조금 수정할 수 있습니다.
```tsx
// src/routes/_navbar/index.tsx


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

  ...
}
```
애플리케이션을 실행하고 필터와 검색의 동작을 테스트합니다.  
입력과 클릭이 정상적으로 동작하고 쿼리 파라미터도 업데이트 되는 것을 확인합니다.  

---

### 상품 조회하기

전달받은 쿼리 파라미터로 상품을 조회하기 전에,  
아직 데이터베이스에는 상품이 존재하지 않습니다.   
상품에 대한 스키마를 정의하고 테이블을 생성합니다.  
아래와 같이 상품에 대한 스키마를 정의합니다.  

```ts
// src/model/product.ts

import { z } from 'zod'

export enum Category {
  Shoes = 'shoes',
  Tshirts = 'tshirts',
}

export const zodCategorySchema = z.nativeEnum(Category)

export const zodProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  category: zodCategorySchema,
  price: z.coerce.string().min(0),
  picture: z.string().url(),
  stock: z.coerce.number().min(0),
  description: z.string(),
})

export type Product = z.infer<typeof zodProductSchema>
```

이제 Cloud SQL Studio를 열고 아래와 같이 테이블을 생성합니다.
```sql
-- Cloud SQL Studio에서 실행합니다.
-- 앞서 생성한 create_tables 쿼리 하단에 삽입합니다.

...

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  -- postgreSQL에는 엄격하게 type을 생성할 수 있지만, 여기서는 하지 않습니다.
  category VARCHAR(255) NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  picture VARCHAR(1024) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  description VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

이번에는 예시로 사용하기 위한 데이터를 생성하기 위해 아래 쿼리를 실행합니다.

```sql
-- Cloud SQL Studio에서 실행합니다.
-- insert_product_examples로 저장합니다.

INSERT INTO products (name, category, price, picture, stock, description) VALUES
(
  'XX 런닝화',
  'shoes',
  68000,
  'https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp',
  10,
  '가볍고 편안한 착용감의 런닝화. 다양한 색상과 사이즈로 제공됩니다.'
),
(
  'YY 티셔츠',
  'tshirts',
  38000,
  'https://imgproxy.fourthwall.com/aCf7aQYy2xOgGK0mpblRpHNMruzpqTQcM0E8_G92aEQ/w:720/sm:1/enc/a2eII6EaUM22lElT/co-pyN-4BPzVAVSo/IpsZUju54feSsaeO/u01Yy3krbETm4joT/w0VjChcYKb87fiVp/8pmdoT1MX1rjluOC/przASlorbUyweHTa/YmzNlOQTJ-1OH4NB/A1i5Ke3ZotafJpdb/D4N_dMAbg1ncFCYW/hVoiIH_tntQAtoPR/55uM_hr4eTqEm-fM/d4UI0yQEA90kyD7g/IcS9Gt8gRptSIxmj/JQetld_aCwY',
  7,
  '부드러운 면 소재로 제작된 기본 티셔츠. 다양한 색상과 사이즈로 제공됩니다.'
),
(
  'ZZ 티셔츠',
  'tshirts',
  59000,
  'https://imgproxy.fourthwall.com/xohTiCJxyOKvA1xllWiGoHvJxPUf7g1TCZPtD_BbA3w/w:720/sm:1/enc/xe3vmjHVIGPrq5U6/4jZ8s8mnU_ExtmQB/NYJ_dPq_U4d2MDFX/X__whxwsanZEwrZu/FvsVojfSjbZdAS8z/JY22l8NYNu3mgJ9r/YCRqEK9Eius8jULy/LJfjQaSYmnIA9hgL/RYaaow5EW6QuSAhM/0xQlFxihTuJxy7wg/FW2_rl2ztjJGqkzr/fz60FUp69reth5SA/5gEwb-DJ7J2Gl_36/Z7EF7JcpYvp8Q50U/3WC5843hN4k',
  22,
  '편안한 핏과 스타일리시한 디자인의 티셔츠. 다양한 색상과 사이즈로 제공됩니다.'
);
```
이렇게 성공적으로 데이터베이스에 products 테이블을 생성하고 데이터를 삽입했습니다.   
이를 활용하여 조회 기능을 구현합니다.

```sql
-- src/database/sql/select_products.sql

SELECT
  *
FROM
  products
WHERE
  ($1::text IS NULL OR category = $1)
  AND ($2::text IS NULL OR name ILIKE '%' || $2 || '%');
```
```ts
// src/database/products.ts

export const getProducts = createServerOnlyFn(
  async ({ name, category }: Partial<Pick<Product, 'name' | 'category'>>) => {
    try {
      const pool = getPool()
      const res = await pool.query(selectProductsQuery, [category, name])
      return zodProductSchema.array().parse(res.rows)
    } catch (error) {
      throw new Error('Failed to get products: ' + error)
    }
  },
)
```

이제 상품 목록을 라우터에서 조회할 수 있도록 아래와 같이 수정합니다.

```tsx
// src/routes/_navbar/index.tsx

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

...

function App() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const { products } = Route.useLoaderData()

  ...

  return (
    <main>
      
      ...

      <div className="grid">
        {products.map((product) => (
          <div className="product-card" key={product.id}>
            <figure>
              <img src={product.picture} alt="Shoes" />
            </figure>
            <div className="card-body">
              <h2 className="card-title">{product.name}</h2>
              <p>{product.description}</p>
              <div className="card-actions">
                <button className="btn btn-primary">{product.price}원</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
```

애플리케이션을 실행하고 http://localhost:3000 으로 이동합니다.  
상품 목록이 잘 조회되고, 필터와 검색이 동작하는 것을 확인할 수 있습니다.