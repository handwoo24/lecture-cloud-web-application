import { PubSub } from '@google-cloud/pubsub'
import { createServerOnlyFn } from '@tanstack/react-start'

let pubsubClient: PubSub | null = null

const getPubsub = createServerOnlyFn(() => {
  if (!pubsubClient) {
    return (pubsubClient = new PubSub({
      projectId: 'lecture-cloud-web-application',
    }))
  }
  return pubsubClient
})

export const publishMessage = createServerOnlyFn(
  async (topic: string, message: string) => {
    const data = Buffer.from(message)
    const messageId = await getPubsub().topic(topic).publishMessage({ data })
    return messageId
  },
)
