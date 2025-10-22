import { createServerOnlyFn } from '@tanstack/react-start'
import admin from 'firebase-admin'
import { getMessaging } from 'firebase-admin/messaging'
import type { MulticastMessage } from 'firebase-admin/messaging'

const getApp = createServerOnlyFn(() => {
  return (
    admin.apps.at(0) ||
    (process.env.NODE_ENV === 'development'
      ? admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
            privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          }),
        })
      : admin.initializeApp())
  )
})

export const sendMessageForMulticast = createServerOnlyFn(
  (message: MulticastMessage) => {
    return getMessaging(getApp()).sendEachForMulticast(message)
  },
)
