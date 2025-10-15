import { createFileRoute, notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { useCallback, useEffect, useState } from 'react'
import { getProduct } from '@/database/products'
import { useWidgets } from '@/components/TossPayments'
import { m } from '@/paraglide/messages'

const loaderFn = createServerFn({ method: 'GET' })
  .inputValidator(z.string())
  .handler(async (ctx) => {
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
