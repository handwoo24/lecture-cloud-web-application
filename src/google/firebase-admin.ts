import { createServerOnlyFn } from '@tanstack/react-start'
import admin from 'firebase-admin'
import { getMessaging } from 'firebase-admin/messaging'
import { getDownloadURL, getStorage } from 'firebase-admin/storage'
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
          storageBucket: process.env.FIREBASE_ADMIN_STORAGE_BUCKET,
        })
      : admin.initializeApp())
  )
})

export const sendMessageForMulticast = createServerOnlyFn(
  (message: MulticastMessage) => {
    return getMessaging(getApp()).sendEachForMulticast(message)
  },
)

export const saveFile = createServerOnlyFn(
  async (file: File, name: string, cacheControl: string) => {
    const ref = getStorage(getApp()).bucket().file(name)
    const buffer = Buffer.from(await file.arrayBuffer())
    await ref.save(buffer, { contentType: file.type })
    await ref.setMetadata({ cacheControl })
    return getDownloadURL(ref)
  },
)
