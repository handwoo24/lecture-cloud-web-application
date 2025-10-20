import { createFileRoute, notFound, redirect } from '@tanstack/react-router'
import { createServerFn, useServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { useCallback, useEffect, useState } from 'react'
import { getProduct } from '@/database/products'
import { useWidgets } from '@/components/TossPayments'
import { m } from '@/paraglide/messages'
import { createOrderFn } from '@/server/orders'
import { useAuthSession } from '@/session'

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

export const Route = createFileRoute('/_navbar/checkout/$productId')({
  component: CheckoutComponent,
  loader(ctx) {
    return loaderFn({ ...ctx, data: ctx.params.productId })
  },
})

function CheckoutComponent() {
  const { product } = Route.useLoaderData()

  const widgets = useWidgets()

  const createOrder = useServerFn(createOrderFn)

  const [isRendered, setIsRendered] = useState(false)

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
