# 클라우드 저장소 활용하기

### Firebase Storage 설정하기

이번에는 Firebase Storage 시스템을 이용해서 이미지를 업로드하고 관리하는 흐름을 학습합니다.  
Storage를 사용할 수 있도록 Firebase Console로 이동합니다.   

> Firebase Console / 빌드 / Storage / 시작하기 / 프로덕션 모드로 시작하기

완료하고 나면 개발 단계에서 테스트 할 수 있도록 Emulators를 추가합니다.

```bash
firebase init

# Emulators를 선택합니다.
# Storage Emulator를 선택하고 설치합니다.
# port 값 등을 기본값으로 설정하고 완료합니다.  
```
설치가 완료되고 나면 아래와 같이 파일이 수정됩니다.

```json
// firebase.json

{
  // ...   
  "emulators": {
    "pubsub": {
      "port": 8085
    },
    "ui": {
      "enabled": true,
      "port": 4000
    },
    "singleProjectMode": true,
    "storage": {
      "port": 9199
    }
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

```bash
# 이제 에뮬레이터를 실행할 때에 pubsub과 storage를 포함합니다.
firebase emulators:start --only pubsub,storage
```
firebase-admin에서 storage 에뮬레이터에 연결하려면 환경변수를 정의합니다.
```
FIREBASE_STORAGE_EMULATOR_HOST="127.0.0.1:9199"
```

애플리케이션에서는 admin 라이브러리를 활용하여 파일 업로드를 구현합니다.   
파일이 전송된 가상의 api endpoint를 상상하고 파일을 업로드하고 다운로드 할 수 있는 url을 생성하는 시나리오를 구상해 봅니다.   

```ts
// src/google/firebase-admin.ts

export const saveFile = createServerOnlyFn(
  async (file: File, name: string, cacheControl: string) => {
    const ref = getStorage(getApp()).bucket().file(name)
    const buffer = Buffer.from(await file.arrayBuffer())
    // 파일을 Storage 저장합니다.
    await ref.save(buffer, { contentType: file.type })
    // metadata를 수정하여 cacheControl을 설정합니다.
    await ref.setMetadata({ cacheControl })
    // 해당 파일을 다운로드 할 수 있는 public url을 반환합니다.
    return getDownloadURL(ref)
  },
)
```

다음으로, 지금 작성한 함수를 이용하여 이미지를 업로드하고 관리하는 흐름에 대해서 학습합니다.

---

### 상풍 정보 수정 - UI 작성하기

상품의 정보를 업데이트 하는 UI를 작성하고 이를 이용하여 데이터베이스의 상품 정보를 업데이트 하는 흐름을 학습합니다.   
먼저 상품 정보를 보여주는 라우터를 구성합니다.   
앞서 작성했던 상품 구매 라우터의 구현을 참고하면 용이합니다.   

```tsx
// src/routes/_navbar/$productId.tsx

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
```

상품 결제 라우터는 현제 라우터에서 이동할 수 있도록 수정하고,   
해당 라우터는 상품 목록 페이지에서 이동하도록 수정합니다.   
```tsx
// src/routes/_navbar/index.tsx

function App() {
  ...
  return (
    <main>
      ...
      <div className="grid">
        {products.map((product: Product) => (
          <Link
            className="product-card"
            key={product.id}
            to="/$productId" // 해당 링크를 수정합니다.
            params={{ productId: product.id }}
          >
            ...
          </Link>
        ))}
      </div>
    </main>
  )
}
```

HTML의 form 요소를 이용하여 상품의 정보를 수정할 수 있는 UI를 구성했습니다.   
form은 그 자체로 훌륭한 요소이지만, 보다 엄격한 검증과 관리를 위하여 react-form 라이브러리를 이용합니다.   
```bash
npm install @tanstack/react-form
```

해당 라이브러리의 useForm 훅을 사용하면 보다 손쉬운 제어가 가능합니다.   
아래와 같이 수정할 수 있습니다.

```tsx
// src/routes/_navbar/$productId.tsx

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
```

어떤 점들이 달라졌을까요?   
form의 선언되는 값들의 보다 타입에 대해 엄격해집니다.   
타입에 엄격해지는 것은 코드 작성 단계에서 오류를 줄이고 관리가 용이해 집니다.  
또한, form을 복잡한 상태 제어 없이 사용할 수 있게 됩니다.   
예를 들어, 사용자가 잘못된 값을 입력해도 UI의 상태를 손쉽게 변경하고 제어할 수 있습니다.

---

### 상품 정보 수정 - 구현하기

이번에는 form을 제출하는 onSubmit 이벤트에 적용될 이벤트 핸들러를 작성하고,   
이 제출이 전송될 api endpoint를 구성하여 상품 정보를 업데이트 할 수 있도록 합니다.   
이 제출에 이미지 파일이 포함되면 Storage 서비스를 이용하여 파일을 업로드하고 상품의 이미지를 교체합니다.   
여기서 업로드 되는 이미지 파일은 상품과는 별개로 Storage에 업로드된 파일의 정보를 따로 데이터베이스에 저장하고 관리해야 합니다.   
따라서 여기서는 상품의 정보를 업데이트 하는 쿼리와, storage_item을 삽입하는 쿼리 두개를 작성합니다. 

```ts
// src/model/storageItem.ts

export const zodStorageItemSchema = z.object({
  id: z.string().uuid(),
  path: z.string(),
  name: z.string(),
  type: z.string(),
  size: z.number().int(),
  uid: z.string().uuid(),
  download_url: z.string().url(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date().nullish(),
})

export type StorageItem = z.infer<typeof zodStorageItemSchema>
```
```sql
-- src/database/sql/insert_storage_item.sql

INSERT INTO storage_items (path, download_url, uid, name, type, size)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;
```
```sql
-- src/database/sql/update_product.sql
-- 기존 update_product.sql은 update_product_stock.sql로 수정합니다.

UPDATE products
SET
    name = $2,
    price = $3,
    stock = $4,
    picture = $5
WHERE
    id = $1
RETURNING *;
```

이제 이 쿼리를 이용하여 데이터베이스에 접근하는 함수를 작성하기 전에, form이 제출되는 api endpoint를 설계해봅니다.   
아래와 같이 form이 제출되면 최소한의 타입 검증을 완료한 이후에 ```/api/products/$productId```의 주소로 요청을 전송하도록 설계합니다. 
```tsx
// src/routes/_navbar/$productId.tsx

function RouteComponent() {
  const { product } = Route.useLoaderData()

  const form = useForm({
    defaultValues: zodUpdatableProductFieldsSchema.parse({
      ...product,
      file: null,
    }),
    validators: {
      onChange: zodUpdatableProductFieldsSchema,
    },
    onSubmit: async ({ value }) => {
      const entries = Object.entries(value)
      const formData = entries.reduce((data, [key, val]) => {
        if (!val) return data
        data.append(key, typeof val === 'number' ? val.toString() : val)
        return data
      }, new FormData())
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        body: formData,
      })
      if (!response.ok) {
        throw new Error(await response.text())
      }
      alert('상품 정보가 변경되었습니다.')
    },
  })

  ...
}
```
그러면 요청을 받는 api endpoint를 아래와 같이 작성할 수 있습니다.
```ts
// src/routes/api/products.$productId.ts

export const Route = createFileRoute('/api/products/$productId')({
  server: {
    handlers: {
      PATCH: async ({ request, params }) => {
        const formData = await request.formData()
        const res = zodUpdatableProductFieldsSchema.safeParse(
          Object.fromEntries(formData.entries()),
        )

        if (!res.success) {
          return new Response(res.error.message, { status: 400 })
        }

        const session = await useAuthSession()
        if (!session.data.uid) {
          throw redirect({ to: '/login' })
        }

        const { file, ...product } = res.data
        let item: Parameters<typeof updateProduct>[2] = undefined
        if (file) {
          // 요청에 파일이 포함되어 있다면 업로드하고 상품정보를 업데이트 합니다.
          const path = 'products/' + crypto.randomUUID()
          const download_url = await saveFile(
            file,
            path,
            'public, max-age=2592000',
          )
          item = {
            path,
            download_url,
            uid: session.data.uid,
            name: file.name,
            type: file.type,
            size: file.size,
          }
        }
        
        // TODO: 상품 이미지 주소 오류
        await updateProduct(params.productId, product, item)

        return new Response('success', { status: 200 })
      },
    },
  },
})
```
```ts
// src/model/product.ts

...

export const zodUpdatableProductFieldsSchema = zodProductSchema.extend({
  file: z.instanceof(File).nullish(),
})
```

작성했던 쿼리를 이용하여 상품의 정보를 업데이트 하는 ```updateProduct``` 함수를 작성합니다.   
이전과 마찬가지로 storage_item과 product의 정보를 필요한 경우에 transaction으로 보장해야 합니다.   
기존에 사용하던 transaction 코드를 아래와 같이 추상화합니다. 
```ts
// src/database/transaction.ts

export const withTransaction = async <T>(
  pool: Pool,
  callback: (client: PoolClient) => Promise<T>,
): Promise<T> => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    // Re-throw the error to be handled by the caller
    throw error
  } finally {
    client.release()
  }
}
```
```ts
// src/database/products.ts

export const updateProduct = createServerOnlyFn(
  async (
    id: string,
    product: Pick<Product, 'name' | 'price' | 'stock' | 'picture'>,
    item?: Pick<
      StorageItem,
      'path' | 'download_url' | 'uid' | 'name' | 'type' | 'size'
    >,
  ) => {
    const pool = getPool()

    try {
      if (!item) {
        await pool.query(updateProductQuery, [
          id,
          product.name,
          product.price,
          product.stock,
          product.picture,
        ])
      } else {
        await withTransaction(pool, async (client) => {
          await client.query(updateProductQuery, [
            id,
            product.name,
            product.price,
            product.stock,
            item.download_url,
          ])

          await client.query(insertStorageItemQuery, [
            item.path,
            item.download_url,
            item.uid,
            item.name,
            item.type,
            item.size,
          ])
        })
      }
    } catch (error) {
      throw new Error('Failed to update product: ' + error)
    }
  },
)
```

이제 어플리케이션을 실행하고 상품 정보를 업데이트 해봅니다.   
특히 상품 이미지를 교체하고 변경되는 것을 확인합니다.