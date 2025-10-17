import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { ANONYMOUS, loadTossPayments } from '@tosspayments/tosspayments-sdk'
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

// TODO: 추후 환경변수로 업데이트 합니다.
const clientKey = 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm'

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
      await widgets?.setAmount({
        currency: options.currency,
        value: options.value,
      })

      const renderPaymentMethods = await widgets?.renderPaymentMethods({
        selector: options.paymentMethodsSelector,
        variantKey: options.paymentMethodsKey || 'DEFAULT',
      })

      const renderAgreement = await widgets?.renderAgreement({
        selector: options.agreementSelector,
        variantKey: options.agreementKey || 'AGREEMENT',
      })

      await Promise.all([renderPaymentMethods, renderAgreement])
    }

    return {
      renderWidgets,
    }
  }, [widgets])
}

export const TossPaymentsProvider = ({ children }: PropsWithChildren) => {
  const [payments, setPayments] = useState<TossPaymentsSDK | null>(null)

  useEffect(() => {
    loadTossPayments(clientKey).then(setPayments)
  }, [])

  return <TossPaymentsContext value={payments}>{children}</TossPaymentsContext>
}
