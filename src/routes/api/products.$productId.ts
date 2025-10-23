import { createFileRoute, redirect } from '@tanstack/react-router'
import { zodUpdatableProductFieldsSchema } from '@/model/product'
import { useAuthSession } from '@/session'
import { updateProduct } from '@/database/products'
import { saveFile } from '@/google/firebase-admin'

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

        await updateProduct(params.productId, product, item)

        return new Response('success', { status: 200 })
      },
    },
  },
})
