# 다국어 설정하기

### Paraglide-js 설치하기
이전 학습 과정에서 UI를 배치하며 문자열을 그대로 화면에 노출했습니다.   
그러나 만약 외국에 애플리케이션을 서비스해야 한다면 어떻게 해야 할까요?   
실제 프로젝트에서는 이렇게 문자열을 그대로 노출하지 않고,   
대게 http://localhost:3000/en 이런 식으로 영문 사이트로 이동하면 영문이 표기되도록 합니다.  
이러한 방식으로 문자열을 렌더링 할 수 있도록 적용해 봅니다.   

다국어 설정을 하기 위해 관련 라이브러리 중 하나인 paraglidejs를 설치합니다.
```bash
npm install -D @inlang/paraglide-js
```

그리고 터미널에 아래 명령어를 실행하여 paraglide를 초기화합니다.
```bash
npx @inlang/paraglide-js@latest init

# allowJS 옵션에는 N으로 답하고 수동으로 tsconfig.json에 allowJS: true를 추가합니다.
# 나머지 질문에는 y를 답합니다.
```

그리고 vite 설정을 다음과 같이 업데이트 합니다.
```ts
const config = defineConfig({
  plugins: [
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/paraglide',
      outputStructure: 'message-modules',
      cookieName: 'PARAGLIDE_LOCALE',
      strategy: ['url', 'cookie', 'preferredLanguage', 'baseLocale'],
      urlPatterns: [
        {
          pattern: '/',
          localized: [
            ['en', '/en'],
            ['ko', '/ko'],
          ],
        },
      ],
    }),

    ...
  ],
});
```
그리고 생성된 아래 경로의 파일을 다음과 같이 수정합니다.   
기본적으로 영어와 독일어가 구성되어 있는데, 독일어 대신 한국어로 수정합니다.

```json
// project.inlang/settings.json

{
  "$schema": "https://inlang.com/schema/project-settings",
  "baseLocale": "ko",
  "locales": ["ko", "en"],
  "modules": [
    "https://cdn.jsdelivr.net/npm/@inlang/plugin-message-format@4/dist/index.js",
    "https://cdn.jsdelivr.net/npm/@inlang/plugin-m-function-matcher@2/dist/index.js"
  ],
  "plugin.inlang.messageFormat": {
    "pathPattern": "./messages/{locale}.json"
  }
}

// messages/de.json -> messages/ko.json

{
	"$schema": "https://inlang.com/schema/inlang-message-format",
	"example_message": "안녕하세요 {username}"
}
```

그리고 애플리케이션 코드 일부를 수정합니다.   
```tsx
// src/router.tsx

import { createRouter } from '@tanstack/react-router'

// Import the generated route tree
import { routeTree } from './routeTree.gen'
import { deLocalizeUrl, localizeUrl } from './paraglide/runtime'

// Create a new router instance
export const getRouter = () => {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    rewrite: {
      input: ({ url }) => deLocalizeUrl(url),
      output: ({ url }) => localizeUrl(url),
    },
  })
}
```
```ts
// src/server.ts

import handler from '@tanstack/react-start/server-entry'
import { paraglideMiddleware } from './paraglide/server.js'

export default {
  fetch(req: Request): Promise<Response> {
    return paraglideMiddleware(req, ({ request }) => handler.fetch(request))
  },
}
```
이렇게 미들웨어까지 추가해주면, 기본적인 설정이 끝났습니다.   
아래처럼 결과를 확인할 수 있게 간단한 출력하나를 추가하고
애플리케이션을 확인합니다.
```tsx
// src/routes/_navbar/index.tsx

function App() {

  ...

  return (
    <main>
      <p>{m.example_message({ username: 'john' })}</p>
    ...
    </main>
  )
}
```

어플리케이션을 실행해보면 ```"안녕하세요 john"```이 출력되는 것을 확인할 수 있습니다.

---

### 다국어 메시지 표현하기
이제 예시로 작성된 john은 지우고, 현재까지 저희가 사용한 텍스트를 모두 메시지로 작성하여 사용해 봅니다.
다음과 같이 메시지 파일들을 수정해봅니다.

```json
// messages/ko.json
{
  "$schema": "https://inlang.com/schema/inlang-message-format",
  "app_title": "DIY 클라우드 웹 애플리케이션",
  "products_category_shoes": "신발",
  "products_category_tshirts": "티셔츠",
  "products_search_placeholder": "상품명으로 검색하세요..."
}
```
```json
// messages/en.json
{
  "$schema": "https://inlang.com/schema/inlang-message-format",
  "app_title": "DIY Cloud Web Application",
  "products_category_shoes": "Shoes",
  "products_category_tshirts": "T-Shirts",
  "products_search_placeholder": "Search by product name..."
}
```

이제 Navbar와 메인 페이지를 수정합니다.
코드를 수정할 때에 정의한 메시지가 없다는 경고가 나오면 아래 명렁어를 실행하여 빌드해줍니다.

```bash
npm run build
```

그리고 아래처럼 추가된 메시지들을 적용시켜 줍니다.

```tsx
// src/routes/__root.tsx

import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import appCss from '../styles.css?url'
import type { PropsWithChildren } from 'react'
import { m } from '@/paraglide/messages'
import { getLocale } from '@/paraglide/runtime'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: m.app_title(),
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
})

function RootDocument({ children }: PropsWithChildren) {
  return (
    <html lang={getLocale()}>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
```

```tsx
// src/components/Navbar.tsx

export const Navbar = () => {
  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl">{m.app_title()}</a>
      </div>
      <div className="flex-none">
        <button className="btn btn-square btn-ghost">
          <User />
        </button>
      </div>
    </div>
  )
}
```

```tsx
// src/routes/_navbar/index.tsx

function App() {

  ...

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

그런데 잘 보면, 여기서 하나 누락한 것이 있습니다.   
바로 가격표시에 대한 부분의 메시지를 작성하지 않았습니다.  
왜그럴까요?    
가격이나 이런 단위 체계의 국제화는 브라우저 api에 내장되어 있습니다.   
이것을 이용해서 해당 부분을 수정합니다.

```tsx
// src/routes/_navbar/index.tsx

function App() {
  ...
    const [numberFormat] = useState(
    () =>
      new Intl.NumberFormat(getLocale(), {
        style: 'currency',
        currency: 'KRW',
      }),
  )

  ...
  
  
  return (
    ...
                <button className="btn btn-primary">
                  {numberFormat.format(Number(product.price))}
                </button>
    ...
  )
}
```


이렇게 수정하고 애플리케이션을 실행해보면 원단위로 잘 표현된 것을 확인할 수 있습니다.