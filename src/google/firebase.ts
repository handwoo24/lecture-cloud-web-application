import { createClientOnlyFn } from '@tanstack/react-start'
import { getApps, initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import type { MessagePayload, NextFn, Observer } from 'firebase/messaging'

const getApp = createClientOnlyFn(() => {
  return (
    getApps().at(0) ||
    (import.meta.env.DEV
      ? initializeApp({
          apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
          authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
          projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
          storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
          appId: import.meta.env.VITE_FIREBASE_APP_ID,
          measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
        })
      : initializeApp())
  )
})

export const getMessagingToken = createClientOnlyFn(() => {
  const messaging = getMessaging(getApp())
  return getToken(messaging, {
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
  })
})

export const onMessaging = createClientOnlyFn(
  (nextOrObserver: NextFn<MessagePayload> | Observer<MessagePayload>) =>
    onMessage(getMessaging(getApp()), nextOrObserver),
)
