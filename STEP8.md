# 결제 시스템 구현하기 - PubSub & FCM & 토스페이먼츠

이번 학습과정에서는 앞서 사용해 보았던, FCM과 pub/sub을 활용하여 결제 시스템을 구현합니다.   
국내 서비스에 대체로 사용되는 토스페이먼츠 API를 이용하여 이러한 흐름을 개발하고 테스트합니다.  

### 토스페이먼츠 결제 위젯 사용하기

토스페이먼츠 라이브러리를 설치합니다. 
토스페이먼츠 개발자 가이드를 참고하면 학습이 용이합니다.
```bash
npm install @tosspayments/tosspayments-sdk
```

SDK를 이용하기 전에, 상품 결제를 하기 위한 라우터를 구성하고 상품 정보를 불러옵니다.   

```tsx
// src/routes/_navbar/checkout.$productId.tsx

export const Route = createFileRoute('/_navbar/checkout/$productId')({
  component: CheckoutComponent,
})

function CheckoutComponent() {
  return <main>checkout</main>
}
```
```tsx
// src/routes/_navbar/index.tsx

function App() {
  ...
  return (
    <main>
      ...
      <div className="grid">
        {products.map((product: Product) => (
          {/* 상품을 클릭하면 결제 페이지로 이동되도록 합니다. */}
          <Link
            className="product-card"
            key={product.id}
            to="/checkout/$productId"
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

이제 해당 페이지에서 상품정보를 불러오고 결제 위젯에 사용할 수 있게 준비합니다.  
아래와 같이 조회 쿼리와 server function을 정의합니다.

```sql
-- src/database/sql/select_product.sql

SELECT
  *
FROM
  products
WHERE
  id = $1; 
```

```ts
// src/database/products.ts

export const getProduct = createServerOnlyFn(async (id: string) => {
  try {
    const pool = getPool()
    const res = await pool.query(selectProductQuery, [id])

    if (!res.rows.length) return null

    return zodProductSchema.parse(res.rows[0])
  } catch (error) {
    throw new Error('Failed to get product: ' + error)
  }
})
```
```tsx
// src/routes/_navbar/checkout.$productId.tsx

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
```

이번에는 해당 페이지에서 위젯을 사용할 수 있게 토스페이먼츠 Client를 초기화하고 위젯 API를 사용합니다.   
애플리케이션 라이프 사이클 동안 해당 Client 인스턴스는 하나만 생성될 수 있도록 useContext 훅을 사용하여 구현합니다.   
아래와 같이 컴포넌트를 작성합니다.   

```tsx
// src/components/TossPayments.tsx

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { ANONYMOUS, loadTossPayments } from '@tosspayments/tosspayments-sdk'
import { createClientOnlyFn } from '@tanstack/react-start'
import type { PropsWithChildren } from 'react'
import type {
  TossPaymentsSDK,
  TossPaymentsWidgets,
} from '@tosspayments/tosspayments-sdk'

export type RenderWidgetsOptions = {
  currency: string
  value: number
  paymentMethodsSelector: string
  agreementSelector: string
  paymentMethodsKey?: string
  agreementKey?: string
}

const TossPaymentsContext = createContext<TossPaymentsSDK | null>(null)

const clientKey = createClientOnlyFn(
  () => import.meta.env.VITE_TOSSPAYMENTS_CLIENT_KEY,
)

const useTossPayments = () => useContext(TossPaymentsContext)

export const useWidgets = () => {
  const payments = useTossPayments()

  const [widgets, setWidgets] = useState<TossPaymentsWidgets | null>(null)

  useEffect(() => {
    if (payments) {
      setWidgets(() => payments.widgets({ customerKey: ANONYMOUS }))
    }
  }, [payments])

  return useMemo(() => {
    const renderWidgets = async (options: RenderWidgetsOptions) => {
      // 렌더링 되지 않았음을 전달하기 위해 false를 반환합니다.   
      if (!widgets) {
        return false
      }

      await widgets.setAmount({
        currency: options.currency,
        value: options.value,
      })

      const renderPaymentMethods = await widgets.renderPaymentMethods({
        selector: options.paymentMethodsSelector,
        variantKey: options.paymentMethodsKey || 'DEFAULT',
      })

      const renderAgreement = await widgets.renderAgreement({
        selector: options.agreementSelector,
        variantKey: options.agreementKey || 'AGREEMENT',
      })

      await Promise.all([renderPaymentMethods, renderAgreement])
      // 렌더링 되었음을 전달하기 위해 true를 반환합니다.   
      return true
    }

    const requestPayment = (
      ...params: Parameters<TossPaymentsWidgets['requestPayment']>
    ) => widgets?.requestPayment(...params)

    return {
      renderWidgets,
      requestPayment,
    }
  }, [widgets])
}

export const TossPaymentsProvider = ({ children }: PropsWithChildren) => {
  const [payments, setPayments] = useState<TossPaymentsSDK | null>(null)

  useEffect(() => {
    loadTossPayments(clientKey()).then(setPayments)
  }, [])

  return <TossPaymentsContext value={payments}>{children}</TossPaymentsContext>
}
```
```tsx
// src/routes/__root.tsx

function RootDocument({ children }: PropsWithChildren) {
  return (
    <html lang={getLocale()}>
      <head>
        <HeadContent />
      </head>
      <body>
        {/* 이렇게 provider 하위 레벨에서는 모두 context를 사용할 수 있습니다. */}
        <TossPaymentsProvider>{children}</TossPaymentsProvider>
        <Scripts />
      </body>
    </html>
  )
}
```

이제 상품 결제 페이지로 돌아가서 해당 컨텍스트로 위젯을 렌더링 할 수 있습니다.

```tsx
// src/routes/_navbar/checkout.$productId.tsx

function CheckoutComponent() {
  const { product } = Route.useLoaderData()

  const widgets = useWidgets()

  const [isRendered, setIsRendered] = useState(false)

  const handleClickCheckout = useCallback(async () => {
    // TODO: 개발 문서의 내용을 붙여넣은 것입니다. 추후 수정합니다.
    await widgets.requestPayment({
      orderId: 'GPjBuelEm7ZUcrSz7REPr',
      orderName: '토스 티셔츠 외 2건',
      successUrl: window.location.origin + '/success.html',
      failUrl: window.location.origin + '/fail.html',
    })
  }, [widgets.requestPayment])

  useEffect(() => {
    widgets
      .renderWidgets({
        currency: 'KRW',
        value: parseInt(product.price),
        paymentMethodsSelector: '#payment-method',
        agreementSelector: '#agreement',
      })
      .then(setIsRendered)
  }, [product.price, widgets.renderWidgets])

  return (
    <main>
      <div id="payment-method" />
      <div id="agreement" />
      {isRendered && (
        <button
          className="btn btn-primary btn-block btn-lg"
          onClick={handleClickCheckout}
        >
          {m.checkout()}
        </button>
      )}
    </main>
  )
}
```

이제 애플리케이션을 실행하고 상품을 클릭하여 상품 결제 페이지로 이동합니다.   
결제 위젯이 성공적으로 렌더링 되는 것을 확인할 수 있습니다.  

---

### 결제 요청, 성공, 실패 처리하기

이번에는 **결제하기** 버튼을 클릭했을 때, 토스페이먼츠 API로 결제요청을 보내는 이벤트 핸들러를 구현하고, callback api들을 작성합니다.   
인증 흐름을 구현했을 때와 마찬가지로 결제요청을 보내고, 성공하거나 실패함에 따라 결제요청을 보낼 때 전달한 callback api를 호출하게 됩니다.

이러한 callback api를 구성하기 전에 결제 요청을 보내는 파라미터들을 확인하면 orderId(주문 ID)에 대한 값이 있습니다.   
토스페이먼츠 개발자 가이드에 쓰인 것처럼 해당 주문을 관리하기 위해서 데이터베이스에 주문과, 주문품목에 대한 정보를 저장하는 것부터 시작합니다.   

해당 데이터의 스키마를 다음과 같이 정의합니다.
```ts
// src/model/order.ts

export const zodOrderSchema = z.object({
  id: z.string().uuid(),
  ordered_at: z.coerce.date(),
  confirmed_at: z.coerce.date().nullish(),
  uid: z.string().uuid(),
  confirmed: z.boolean(),
  payment_key: z.string().nullish(),
  payment_type: z.string().nullish(),
  amount: z.string(),
})

export type Order = z.infer<typeof zodOrderSchema>

export const zodOrderItemSchema = z.object({
  id: z.string().uuid(),
  order_id: z.string().uuid(),
  product_id: z.string().uuid(),
  price: z.string(),
  quantity: z.number().int().min(1),
})

export type OrderItem = z.infer<typeof zodOrderItemSchema>
```

이 스키마를 바탕으로 관련 테이블을 생성합니다.
```sql
-- Cloud SQL Studio에서 실행합니다.

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    ordered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), 
    uid UUID NOT NULL REFERENCES users(id),
    confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    payment_key VARCHAR(255),
    payment_type VARCHAR(255),
    amount VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE, 
    product_id UUID NOT NULL REFERENCES products(id),
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    quantity INTEGER NOT NULL CHECK (quantity >= 1)
);
```

이제 결제 요청을 보내기 전에 테이블에 주문과 주문품목을 삽입하기 위한 쿼리와 함수를 작성합니다.

```sql
-- src/database/sql/insert_order.sql

INSERT INTO orders (uid, amount)
VALUES ($1, $2)
RETURNING *;
```
```sql
-- src/database/sql/insert_order_item.sql

INSERT INTO order_items (order_id, product_id, price, quantity)
VALUES ($1, $2, $3, $4)
RETURNING *;
```
```ts
// src/database/orders.ts

export const createOrder = createServerOnlyFn(
  async (
    uid: string,
    amount: string,
    items: Array<{ quantity: number; product: Product }>,
  ) => {
    const client = await getPool().connect()
    try {
      await client.query('BEGIN')

      const res = await client.query(insertOrderQuery, [uid, amount])

      const order = zodOrderSchema.parse(res.rows[0])

      const promises = items.map(({ product, quantity }) =>
        client.query(insertOrderItemQuery, [
          order.id,
          product.id,
          product.price,
          quantity,
        ]),
      )

      await Promise.all(promises)

      await client.query('COMMIT')

      return order
    } catch (error) {
      await client.query('ROLLBACK')
      throw new Error('Failed to create order: ' + error)
    } finally {
      client.release()
    }
  },
)
```
잠시 작성된 쿼리를 호출하는 함수를 살펴봅니다.   
지금까지 단일 쿼리로 작성된 함수들과 달리 transaction을 이용하고 있습니다.   
이러한 과정을 통해, 주문만 생성되거나 혹은 주문 품목만 생성되는 오류를 방지합니다.   

아래와 같이 server function을 작성하고 결제 요청 전에 호출하도록 수정합니다.
```ts
// src/server/orders.ts

export const createOrderSchema = z.object({
  amount: z.string(),
  items: z.object({ quantity: z.number(), product: zodProductSchema }).array(),
})

export const createOrderFn = createServerFn({ method: 'POST' })
  .inputValidator(createOrderSchema)
  .handler(async (ctx) => {
    const session = await useAuthSession()
    if (!session.data.uid) {
      throw redirect({ to: '/login' })
    }
    return createOrder(session.data.uid, ctx.data.amount, ctx.data.items)
  })
```
```tsx
// src/routes/_navbar/checkout.$productId.tsx

function CheckoutComponent() {
  ...

  const handleClickCheckout = useCallback(async () => {
    try {
      const order = await createOrder({
        data: {
          amount: product.price,
          items: [{ product, quantity: 1 }],
        },
      })

      await widgets.requestPayment({
        orderId: order.id,
        orderName: product.name,
        successUrl: window.location.origin + '/success.html',
        failUrl: window.location.origin + '/fail.html',
      })
    } catch (error) {
      // 결제 실패 피드백
    }
  }, [widgets.requestPayment, product.name, createOrder])

  return (
    <main>
      ...
    </main>
  )
}
```

이제 **결제 요청** 버튼을 클릭하면 주문 정보를 테이블에 삽입하고 이를 토대로 토스페이먼츠 API를 호출합니다.   
이후 callback api로 결과 정보를 전달하고 알맞게 처리하는 흐름을 작성합니다.   
다음과 같이 callback api의 endpoint를 구성하고 결제요청 파라미터로 전달합니다.   
(여기서는 결제 실패에 대해서 깊게 다루지 않고 라우터만 구성합니다.)

```ts
// src/routes/api/checkout/callback.ts

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/checkout/callback')({
  server: {
    handlers: {
      GET: () => {
        return new Response('success', { status: 200 })
      },
    },
  },
})
```
```tsx
// src/routes/_navbar/checkout/error.tsx

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_navbar/checkout/error')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_navbar/checkout/error"!</div>
}
```
```tsx
// src/routes/_navbar/checkout/$productId.tsx (파일 위치를 이동합니다.)

function CheckoutComponent() {
  ...

  const handleClickCheckout = useCallback(async () => {
    try {
      const order = await createOrder({
        data: {
          amount: product.price,
          items: [{ product, quantity: 1 }],
        },
      })

      await widgets.requestPayment({
        orderId: order.id,
        orderName: product.name,
        successUrl: window.location.origin + '/api/checkout/callback',
        failUrl: window.location.origin + '/checkout/error',
      })
    } catch (error) {
      // 결제 실패 피드백
    }
  }, [widgets.requestPayment, product.name, createOrder])

  return (
    <main>
      ...
    </main>
  )
}
```
이제 결제요청을 보내기 까지의 흐름은 완성되었습니다.   
이제 성공적으로 결제가 완료된 이후 callback api에서 처리할 작업들을 작성합니다.   
callback api의 흐름은 아래와 같습니다.
 - 주문 정보를 **승인됨** 상태로 업데이트
 - 토스페이먼츠에 승인 API를 호출
 - 결제 성공 주제에 메시지 게시
 - 결제 성공 페이지로 리다이렉트

이러한 흐름을 작성하기 전에, 먼저 토스페이먼츠 개발자 가이드를 참고하여 callback api로 전달되는 파라미터를 검증합니다.   
zod를 이용하여 해당 파라미터에 대한 스키마를 작성합니다.   
```ts
// src/model/checkout.ts

export const zodCheckoutCallbackSchema = z.object({
  paymentType: z.string().min(1, 'paymentType is required'),
  orderId: z.string().min(1, 'orderId is required'),
  paymentKey: z.string().min(1, 'paymentKey is required'),
  amount: z.coerce.number().positive('Amount must be a positive number'),
})
```
```ts
// src/routes/api/checkout/callback.ts

export const Route = createFileRoute('/api/checkout/callback')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const params = Object.fromEntries(url.searchParams.entries())
        const result = zodCheckoutCallbackSchema.safeParse(params)

        if (!result.success) {
          throw redirect({ to: '/checkout/error' })
        }

        ...

        // 성공적으로 파라미터를 확인하면 주문 정보를 업데이트 합니다.

      },
    },
  },
})
```
파라미터에서 얻은 orderId를 토대로 orders 테이블의 데이터를 업데이트하는 쿼리를 작성합니다.   
```sql
-- src/database/sql/update_order.sql

UPDATE orders
SET 
    confirmed = TRUE,
    payment_key = $2,
    payment_type = $3,
    confirmed_at = NOW() 
WHERE 
    id = $1;
```
```ts
// src/database/orders.ts

export const confirmOrder = createServerOnlyFn(
  async (id: string, paymentKey: string, paymentType: string) => {
    try {
      const pool = getPool()
      await pool.query(updateOrderQuery, [id, paymentKey, paymentType])
    } catch (error) {
      throw new Error('Failed to confirm order: ' + error)
    }
  },
)
```
이후 callback api에 해당 함수를 추가합니다.

```ts
// src/routes/api/checkout/callback.ts

export const Route = createFileRoute('/api/checkout/callback')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const params = Object.fromEntries(url.searchParams.entries())
        const result = zodCheckoutCallbackSchema.safeParse(params)

        if (!result.success) {
          throw redirect({ to: '/checkout/error' })
        }

        // 주문을 '승인됨'으로 업데이트 합니다.
        await confirmOrder(
          result.data.orderId,
          result.data.paymentKey,
          result.data.paymentType,
        )
        
        ...
      },
    },
  },
})
```
주문을 데이터베이스 레벨에서 승인하고 나면, 토스페이먼츠 API를 이용하여 승인처리를 완료해야 합니다.   
토스페이먼츠 개발자 가이드를 참고하여 아래와 같이 추가합니다.

```ts
// src/routes/api/checkout/callback.ts

export const Route = createFileRoute('/api/checkout/callback')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        ...

        await confirmOrder(
          result.data.orderId,
          result.data.paymentKey,
          result.data.paymentType,
        )

        // 'test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6'를 환경변수로 사용합니다.
        const widgetSecretKey = process.env.TOSSPAYMENTS_WIDGET_SECRET_KEY
        const encryptedSecretKey =
          'Basic ' + Buffer.from(widgetSecretKey + ':').toString('base64')

        const response = await fetch(
          'https://api.tosspayments.com/v1/payments/confirm',
          {
            method: 'POST',
            headers: {
              Authorization: encryptedSecretKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(result.data),
          },
        )

        if (!response.ok) {
          throw redirect({ to: '/checkout/error' })
        }
        
        ...
      },
    },
  },
})
```

여기까지 완료되었으면 이제 **결제 성공** 주제를 생성하고 메시지를 게시하면 callback api의 역할은 종료됩니다.   
아직 주제를 생성하기 전이지만 아래와 같이 callback api를 수정합니다.   
주제와 구독을 생성하고 나면 정상적으로 동작하게 됩니다.

```ts
// src/routes/api/checkout/callback.ts

export const Route = createFileRoute('/api/checkout/callback')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        ...        

        if (!response.ok) {
          throw redirect({ to: '/checkout/error' })
        }

        // 'checkout-success' 주제로 메시지를 게시합니다.
        await publishMessage('checkout-success', JSON.stringify(result.data))

        // 성공 페이지로 리다이렉트 시킵니다.
        throw redirect({ to: '/checkout/success' })
      },
    },
  },
})
```

---

### 결제 성공 메시지 

결제 성공 메시지를 게시하기 위한 주제를 생성합니다.   
해당 주제에서 메시지를 전달하기 위한 push 구독과 api endpoint도 생성합니다.  

```ts
// src/routes/api/pubsub/setup.ts

export const Route = createFileRoute('/api/pubsub/setup')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const { topic } = await setupPubsubEmulator(
          'dead-letter',
          'dead-letter-sub',
          { pushEndpoint: url.origin + '/api/pubsub/dead-letter' },
        )
        const deadLetterTopic = topic.name

        await setupPubsubEmulator('pubsub-test', 'pubsub-test-push', {
          pushEndpoint: url.origin + '/api/pubsub/push',
        })
        await setupPubsubEmulator('pubsub-test', 'pubsub-test-fail', {
          pushEndpoint: url.origin + '/api/pubsub/fail',
          deadLetterPolicy: { deadLetterTopic },
        })
        // 결제 성공 이후 재고를 업데이트 하는 구독입니다.
        await setupPubsubEmulator('checkout-success', 'checkout-stock', {
          pushEndpoint: url.origin + '/api/checkout/stock',
          deadLetterPolicy: { deadLetterTopic },
        })
        // 결제 성공 이후 push 메시지를 전송하는 구독입니다.
        await setupPubsubEmulator('checkout-success', 'checkout-push', {
          pushEndpoint: url.origin + '/api/checkout/push',
          deadLetterPolicy: { deadLetterTopic },
        })
        return new Response('success', { status: 200 })
      },
    },
  },
})
```

추가한 구독의 endpoint에 맞게 api 라우터를 구성합니다.

```ts
// src/routes/api/checkout/push.ts

export const Route = createFileRoute('/api/checkout/push')({
  server: {
    handlers: {
      POST: () => {
        return new Response('Not implemented', { status: 501 })
      },
    },
  },
})
```
```ts
// src/routes/api/checkout/stock.ts

export const Route = createFileRoute('/api/checkout/stock')({
  server: {
    handlers: {
      POST: () => {
        return new Response('Not implemented', { status: 501 })
      },
    },
  },
})
```

먼저 재고 서비스 부터 작성해봅니다.   
재고 서비스는 다음과 같은 흐름으로 구성됩니다.   
 - 결제 성공 메시지 수신
 - 주문 품목 조회
 - 주문 품목 재고 업데이트

결제 성공 메시지는 앞서 작성한 내용처럼 아래와 같은 스키마를 갖습니다.

```ts
// src/model/payment.ts

export const zodSuccessParams = z.object({
  pamentType: z.string().nullish(),
  orderId: z.string(),
  paymentKey: z.string(),
  amount: z.coerce.number(),
})

export type SuccessParams = z.infer<typeof zodSuccessParams>
```

orderId로 부터 주문 품목에 대한 정보를 조회하는 쿼리와 함수를 작성합니다.   

```sql
-- src/database/sql/select_order_items.sql

SELECT *
FROM order_items
WHERE order_id = $1;
```
```ts
// src/database/orders.ts

export const getOrderItems = createServerOnlyFn(async (id: string) => {
  try {
    const pool = getPool()
    const res = await pool.query(selectOrderItemsQuery, [id])
    if (!res.rows.length) {
      throw new Error('No order items found')
    }

    return zodOrderItemSchema.array().parse(res.rows)
  } catch (error) {
    throw new Error('Failed to get order items: ' + error)
  }
})
```

상품의 재고를 업데이트 하는 쿼리와 함수는 아래와 같이 작성합니다.

```sql
-- src/database/sql/update_product.sql

UPDATE products
SET
    stock = stock + $2
WHERE
    id = $1
    AND (stock + $2) >= 0
RETURNING id, stock;
```
```ts
// src/database/products.ts

export const updateProductStocks = createServerOnlyFn(
  async (products: Array<Pick<Product, 'id' | 'stock'>>) => {
    const client = await getPool().connect()
    try {
      await client.query('BEGIN')

      const promises = products.map(({ id, stock }) => {
        return client.query(updateProductQuery, [id, stock])
      })

      await Promise.all(promises)

      await client.query('COMMIT')
    } catch (error) {
      await client.query('ROLLBACK')
      throw new Error('Failed to update product stocks: ' + error)
    } finally {
      client.release()
    }
  },
)
```

주문을 생성할 때와 마찬가지로 transaction으로 구성된 함수입니다.   
이렇게 작성된 이유는 주문에 여러 품목이 포함되어 있을 수 있기 때문입니다.  
다건 주문의 경우, 한번에 여러 품목에 대한 재고를 업데이트 해야합니다.

이제 이를 바탕으로 재고 서비스를 완성합니다.
```ts
// src/routes/api/checkout/stock.ts

export const Route = createFileRoute('/api/checkout/stock')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const result = zodMessageSchema.safeParse(await request.json())

        if (!result.success) {
          return new Response('Invalid message', { status: 400 })
        }

        const buffer = Buffer.from(result.data.message.data, 'base64')
        const jsonString = buffer.toString('utf8')
        const params = zodSuccessParams.safeParse(JSON.parse(jsonString))

        if (!params.success) {
          return new Response('Invalid params', { status: 400 })
        }

        const items = await getOrderItems(params.data.orderId)
        const stocks = items.map(({ product_id, quantity }) => ({
          id: product_id,
          stock: -quantity,
        }))

        await updateProductStocks(stocks)

        return new Response('success', { status: 200 })
      },
    },
  },
})
```

이번에는 결제 성공에 대한 push 메시지 서비스를 구현합니다.  
이전 학습 과정의 예제와 유사하기 때문에 쉽게 구현할 수 있습니다.   
user ID가 아닌 order ID로 부터 fcm_token을 조회하는 차이만 있습니다.  


다음과 같이 쿼리와 함수를 작성합니다.
```sql
-- src/database/sql/select_messaging_tokens_by_order.sql

SELECT 
    messaging_tokens.*
FROM 
    orders
INNER JOIN 
    messaging_tokens ON messaging_tokens.uid = orders.uid
WHERE 
    orders.id = $1;
```
```ts
// src/database/messagingTokens.ts

export const getMessagingTokenByOrder = createServerOnlyFn(
  async (orderId: string) => {
    try {
      const pool = getPool()
      const res = await pool.query(selectMessagingTokensByOrderQuery, [orderId])

      return zodMessagingTokenSchema.array().parse(res.rows)
    } catch (error) {
      throw new Error('Failed to get messaging token by order: ' + error)
    }
  },
)
```

이를 토대로 push api 엔드포인트를 구성할 수 있습니다.  
```ts
// src/routes/api/checkout/push.ts

export const Route = createFileRoute('/api/checkout/push')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const message = zodMessageSchema.safeParse(await request.json())

        if (!message.success) {
          return new Response('Invalid message', { status: 400 })
        }

        const buffer = Buffer.from(message.data.message.data, 'base64')
        const jsonString = buffer.toString('utf8')
        const params = zodSuccessParams.safeParse(JSON.parse(jsonString))

        if (!params.success) {
          return new Response('Invalid params', { status: 400 })
        }

        const messagingTokens = await getMessagingTokenByOrder(
          params.data.orderId,
        )
        const tokens = messagingTokens.map(({ fcm_token }) => fcm_token)

        await new Promise((resolve) => setTimeout(resolve, 5000))

        if (tokens.length) {
          const result = await sendMessageForMulticast({
            notification: {
              title: '결제 완료! 🎉',
              body: `결제 금액 ${params.data.amount}원이 정상적으로 처리되었습니다.`,
            },
            tokens,
          })

          result.responses.map((res, index) => {
            if (!res.success) {
              // 만료된 토큰은 확인하고 데이터베이스에서 제거해야합니다.
              console.log('Token expired:', tokens[index])
            }
          })
        }

        return new Response('success', { status: 200 })
      },
    },
  },
})
```

만료된 토큰은 **메시지 전송 결과**에서 특별한 에러코드를 발생시킵니다.  
Firebase 가이드를 참조하면 아래와 같은 에러코드를 가질 수 있습니다.   
```ts
enum TokenErrorCodes {
  Invalid = 'messaging/invalid-registration-token',
  NotRegistered = 'messaging/registration-token-not-registered',
}
``` 

해당 에러코드가 발생한 토큰의 경우 데이터베이스에서 제거하는 쿼리와 함수를 작성하도록 합니다.   

```sql
-- src/database/sql/delete_messaging_token.sql

DELETE FROM messaging_tokens
WHERE fcm_token = $1;
```
```ts
// src/database/messagingTokens.ts

export const deleteMessagingTokens = createServerOnlyFn(
  async (tokens: Array<string>) => {
    const client = await getPool().connect()
    try {
      await client.query('BEGIN')

      const promises = tokens.map((token) =>
        client.query(deleteMessagingTokenQuery, [token]),
      )

      await Promise.all(promises)

      await client.query('COMMIT')
    } catch (error) {
      await client.query('ROLLBACK')
      throw new Error('Failed to delete messaging token: ' + error)
    } finally {
      client.release()
    }
  },
)
```
이 함수에서도 여러 개의 토큰을 제거할 수 있으므로 transaction으로 작성합니다.   

---

### 상품 정보 UI 수정하기

애플리케이션을 실행하고 결제를 완료하고 나면 재고가 업데이트 되는 것을 확인할 수 있도록 UI를 수정합니다.

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
                <div className="badge badge-info">
                  {/* 재고를 badge로 보여줍니다. */}
                  {/* 메시지도 적절히 추가합니다. */}
                  {m.products_stock(product)}
                </div>
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
```
```css
.product-card .card-actions {
  @apply justify-between items-center;
}
```

이제 애플리케이션을 실행하고 상품을 결제합니다.   
성공적으로 완료되고 나면 결제 성공 페이지로 리다이렉트 되고,  
push알림과 재고가 업데이트 되는 것을 확인할 수 있씁니다.