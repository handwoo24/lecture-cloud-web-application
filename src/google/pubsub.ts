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

export const setupPubsubEmulator = createServerOnlyFn(
  async (pushEndpoint: string) => {
    if (process.env.NODE_ENV !== 'development') {
      throw new Error('Not allowed in production')
    }
    const pubsub = getPubsub()
    const topic = pubsub.topic('checkout-success')
    const isExist = await topic.exists()
    if (!isExist[0]) {
      await topic.create()
    }
    const subscription = topic.subscription('checkout-success-sub')
    const isExistSub = await subscription.exists()
    if (!isExistSub[0]) {
      await subscription.create({ pushConfig: { pushEndpoint } })
    }
  },
)
