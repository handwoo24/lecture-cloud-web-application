import { PubSub } from '@google-cloud/pubsub'
import { createServerOnlyFn } from '@tanstack/react-start'
import type { CreateSubscriptionOptions } from '@google-cloud/pubsub'

let pubsubClient: PubSub | null = null

const getPubsub = createServerOnlyFn(() => {
  if (!pubsubClient) {
    return (pubsubClient = new PubSub({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    }))
  }
  return pubsubClient
})

export const setupPubsubEmulator = createServerOnlyFn(
  async (
    topicName: string,
    subscriptionName: string,
    options: CreateSubscriptionOptions & { pushEndpoint: string },
  ) => {
    if (process.env.NODE_ENV !== 'development') {
      throw new Error('Not allowed in production')
    }
    const pubsub = getPubsub()
    const topic = pubsub.topic(topicName)
    const isExist = await topic.exists()
    if (!isExist[0]) {
      await topic.create()
    }
    const subscription = topic.subscription(subscriptionName)
    const isExistSub = await subscription.exists()
    if (!isExistSub[0]) {
      await subscription.create(options)
    }

    return { topic, subscription }
  },
)

export const publishMessage = createServerOnlyFn(
  async (topic: string, message: string) => {
    const data = Buffer.from(message)
    const messageId = await getPubsub().topic(topic).publishMessage({ data })
    return messageId
  },
)
