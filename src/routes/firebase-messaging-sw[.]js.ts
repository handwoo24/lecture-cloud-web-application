import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/firebase-messaging-sw.js')({
  server: {
    handlers: {
      GET: () => {
        return new Response(
          "self.addEventListener('push', (event) => { const data = event.data.json().notification; const title = data.title; const options = { body: data.body }; event.waitUntil(self.registration.showNotification(title, options)); });",
          { status: 200, headers: { 'content-type': 'text/javascript' } },
        )
      },
    },
  },
})
