# Pub/Sub 활용하기

### Firebase Emulator 설치하기

pub/sub을 Cloud 환경에 직접 구성하기 전에, 개발 단계에서 테스트 할 수 있도록 에뮬레이터를 설치합니다.   
Firebase CLI를 이용하여 에뮬레이터를 초기화하고 구성합니다.   
```bash
firebase init

# 아래와 같이 제출합니다.
# Are you ready to proceed? Y
# Which Firebase features do you want to set up for this directory? Emulators: Set up local emulators for Firebase products
# Pub/Sub Emulator
# Port? 8085 (Default)
# UI port? 4000 (Default)
# Would you like to download the emulators now? Y
```
설치가 완료되고 나면 아래와 같이 설정 파일들을 변경합니다.
```json
// firebase.json

{
  "apphosting": {
    // ...
  },
  "emulators": {
    "pubsub": {
      "port": 8085
    },
    "ui": {
      "enabled": true,
      "port": 4000
    },
    "singleProjectMode": true
  }
}
```
```ts
// vite.config.ts

const config = defineConfig({
  server: {
    // pub/sub emulator와의 내부 네트워크 연결을 위해서 host를 127.0.0.1로 설정합니다.
    host: '127.0.0.1',
    port: 3000,
  },
  plugins: [
    ...
  ],
})
```
이제 firebase emulators를 실행할 준비가 모두 끝났습니다.   
```bash
# 프로젝트 루트에서 아래 명령어를 실행하면 pub/sub emulator가 실행됩니다.
firebase emulators:start --only pubsub
```

---
### 주제, 구독 생성하기

pub/sub 에뮬레이터를 실행하고 나면, 실제 클라우드에 구성하듯이 주제와 구독을 생성해야 합니다.   
CLI를 이용해서 추가할 수 있지만, 매번 에뮬레이터를 실행할 때마다 생성해야 하므로 개발 환경에서만 동작하는 api 라우터를 구성합니다.   
pub/sub 라이브러리를 설치합니다. 
```bash
npm install @google-cloud/pubsub
```
에뮬레이터에 연결할 수 있게 환경변수를 정의합니다.   
```
PUBSUB_EMULATOR_HOST="127.0.0.1:8085"
```


```ts
// src/routes/api/pubsub/setup.ts

import { createFileRoute } from '@tanstack/react-router'
import { setupPubsubEmulator } from '@/google/pubsub'

export const Route = createFileRoute('/api/pubsub/setup')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        await setupPubsubEmulator('pubsub-test', 'pubsub-test-push', {
          pushEndpoint: url.origin + '/api/pubsub/push',
        })
        return new Response('success', { status: 200 })
      },
    },
  },
})
```

이런 api 라우터를 작성하면 http://127.0.0.1:3000/api/pubsub/setup 으로 이동하면 GET 요청을 보내게 되면서 pub/sub emulators에 주제와 구독을 생성할 수 있습니다.   
```setupPubsubEmulator```는 아래와 같이 작성합니다.
```ts
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
    // 개발환경에서만 동작하도록 방어합니다.
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
```

성공적으로 주제와 구독을 생성하였다면,  
이번에는 주제를 게시하고 구독 서비스에서 메시지를 처리하도록 합니다.   

---

### 주제 게시하기 & 구독하기

앞선 단계에서 구현했던 push 메시지 보내기 요청을 수정해봅니다.   
**push 메시지 보내기** 버튼의 동작을 아래 흐름으로 수정합니다.  
 - push 주제에 메시지 게시하기
 - 구독에서 push 메시지 보내기

단순히 한번의 네트워크 요청에서 push 메시지를 보내던 것을 pub/sub 주제를 통해 백그라운드에서 요청되도록 수정합니다.  
토픽에 메시지를 게시하는 함수를 작성합니다.  
```ts
// src/google/pubsub.ts

export const publishMessage = createServerOnlyFn(
  async (topic: string, message: string) => {
    // pub/sub은 buffer 타입의 데이터를 메시지로 보내고 받습니다.
    const data = Buffer.from(message)
    const messageId = await getPubsub().topic(topic).publishMessage({ data })
    return messageId
  },
)
```
```ts
// src/server/pubsub.ts

export const publishTestFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await useAuthSession()
    if (!session.data.uid) {
      throw redirect({ to: '/login' })
    }
    return publishMessage(
      'pubsub-test',
      JSON.stringify({
        title: '나에게 보내는 편지',
        body: '안녕 반가워!',
        uid: session.data.uid,
      }),
    )
  },
)
```

이제 push 메시지 보내기를 push 메시지 요청하기로 수정하고 이벤트 핸들러를 수정합니다.  

```tsx
// src/routes/_navbar/settings.tsx

function RouteComponent() {
  const createToken = useServerFn(createMessagingTokenFn)

  const publishTest = useServerFn(publishTestFn)

  const handleClickRequestPermission = useCallback(async () => {
    try {
      const token = await getMessagingToken()
      await createToken({ data: token })
    } catch (error) {
      console.error(error)
    }
  }, [createToken])

  const handleClickPushMessage = useCallback(async () => {
    await publishTest()
  }, [publishTest])

  return (
    <main>
      <button className="btn" onClick={handleClickRequestPermission}>
        Push 권한 요청
      </button>
      <button className="btn" onClick={handleClickPushMessage}>
        Push 메시지 요청하기
      </button>
    </main>
  )
}
```

이제 이 버튼을 누르면 **push 메시지를 요청하는 메시지**가 주제로 게시되고 생성했던 push 구독으로 메시지가 전달됩니다.   
아직 push api endpoint를 작성하지 않았으므로 버튼을 누르지 말고 아래 api를 추가합니다.  

```ts
// src/routes/api/pubsub/push.ts

export const Route = createFileRoute('/api/pubsub/push')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // pubsub에 의해 전송되는 message는 특별한 스키마로 구성되어 있습니다.
        const message = zodMessageSchema.safeParse(await request.json())
        if (!message.success) {
          return new Response('invalid message', { status: 400 })
        }

        const buffer = Buffer.from(message.data.message.data, 'base64')
        const jsonString = buffer.toString('utf-8')

        // notification은 우리가 주제로 게시했던 메시지 스키마 입니다.
        const notification = zodNotificationSchema.safeParse(
          JSON.parse(jsonString),
        )
        if (!notification.success) {
          return new Response('invalid notification', { status: 400 })
        }

        const messagingTokens = await getMessagingTokens(notification.data.uid)
        const tokens = messagingTokens.map((token) => token.fcm_token)

        await sendMessageForMulticast({
          tokens,
          notification: {
            title: notification.data.title,
            body: notification.data.body,
          },
        })

        return new Response('success', { status: 200 })
      },
    },
  },
})
```
```ts
// src/model/pubsub.ts

export const zodMessageSchema = z.object({
  message: z.object({
    data: z.string(),
    message_id: z.string(),
    publish_time: z.coerce.date(),
  }),
  subscription: z.string(),
})

export type Message = z.infer<typeof zodMessageSchema>
```
```ts
// src/model/notification.ts

export const zodNotificationSchema = z.object({
  title: z.string(),
  body: z.string(),
  uid: z.string(),
})

export type Notification = z.infer<typeof zodNotificationSchema>
```

이제 애플리케이션과 에뮬레이터를 실행하고, 주제와 구독을 생성한 이후에 메시지 요청을 클릭하면 다시 push 알림이 오는 것을 확인할 수 있습니다.   

---

### 데드레터 사용하기

pub/sub은 특별한 메시지 시스템 입니다.   
주제에 게시된 메시지는 최소 1회 전달을 보장하도록 구현되어 있습니다.   
만약 구독자가 메시지를 처리하는 과정에서 에러가 발생하면,   
pub/sub은 다시 구독자에게 메시지를 전달합니다.   
이 과정은 구독자가 성공적으로 메시지를 처리할 때 까지 무한히 반복됩니다.   
그러나 만약 코드에 오류가 있거나, 일시적이지 않은 에러에 의해서 이 처리가 새로운 버전이 출시되기 전까지 무한히 반복된다면 어떨까요?   
서버는 이 메시지를 처리하기 위해 계속적으로 불필요한 리소스를 활용하게 됩니다.   
이러한 에러를 방어하기 위해 **데드레터**라는 기능을 사용합니다.   


앞서 생성했던 주제에 무조건 실패하는 구독을 생성하고 테스트 합니다.  
```ts
// src/routes/api/pubsub/fail.ts

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/pubsub/fail')({
  server: {
    handlers: {
      POST: () => {
        return new Response('Not implemented', { status: 501 })
      },
    },
  },
})
```

이런 api endpoint를 생성하고 이를 push 구독으로 주제에 추가해봅니다.   
```ts
// src/routes/api/pubsub/setup.ts

export const Route = createFileRoute('/api/pubsub/setup')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        await setupPubsubEmulator('pubsub-test', 'pubsub-test-push', {
          pushEndpoint: url.origin + '/api/pubsub/push',
        })
        await setupPubsubEmulator('pubsub-test', 'pubsub-test-fail', {
          pushEndpoint: url.origin + '/api/pubsub/fail',
        })
        return new Response('success', { status: 200 })
      },
    },
  },
})
```

이렇게 pub/sub 설정 api를 수정하면 fail이라는 push 구독을 생성할 수 있습니다.   
아직 **데드레터**를 설정하기 전이므로 테스트하지 않습니다.   
**데드레터**는 실패한 메시지를 게시하는 또 다른 주제입니다.  
**데드레터**를 설정한 어떤 구독들이 정해진 횟수만큼 에러를 발생하면 **데드레터 주제**로 메시지가 전송되고 더이상 해당 구독으로 재전송 되지 않습니다.   

아래와 같이 코드를 수정합니다.   
```ts
// src/routes/api/pubsub/setup.ts

export const Route = createFileRoute('/api/pubsub/setup')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const { topic } = await setupPubsubEmulator(
          'dead-letter',
          'dead-letter-sub',
          { pushEndpoint: url.origin + '/api/pubsub/dead-letter' },
        )
        await setupPubsubEmulator('pubsub-test', 'pubsub-test-push', {
          pushEndpoint: url.origin + '/api/pubsub/push',
        })
        await setupPubsubEmulator('pubsub-test', 'pubsub-test-fail', {
          pushEndpoint: url.origin + '/api/pubsub/fail',
          // 기본적으로는 5번 실패하면 데드레터로 전송됩니다.   
          deadLetterPolicy: { deadLetterTopic: topic.name },
        })
        return new Response('success', { status: 200 })
      },
    },
  },
})
```

그러면 데드레터로 전송된 메시지들은 어떻게 처리해야 할까요?   
이렇게 반복적으로 실패하는 메시지들은 개발 단계에서 상상하지 못한 문제이기 때문에 데이터베이스나 로그 시스템을 이용하여 관리하고 수동으로 처리하는 것이 권장됩니다.   
이번 학습에서는 데이터베이스에 데드레터 메시지를 저장하도록 합니다.  

아래와 같이 dead_letters 테이블을 생성합니다. 
```sql
-- Cloud SQL Studio에서 실행합니다.

CREATE TABLE IF NOT EXISTS dead_letters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
    subscription VARCHAR(255),
    data TEXT,
    message_id VARCHAR(255),
    publish_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

실패한 메시지들을 테이블에 삽입하는 쿼리는 아래와 같습니다.   
```sql
-- src/database/sql/insert_dead_letter.sql

INSERT INTO dead_letters (subscription, data, message_id, publish_time)
VALUES ($1, $2, $3, $4)
RETURNING *;
```
```ts
// src/database/deadLetters.ts

export const createDeadLetter = createServerOnlyFn(async (message: Message) => {
  try {
    const pool = getPool()
    await pool.query(insertDeadLetterQuery, [
      message.subscription,
      message.message.data,
      message.message.message_id,
      message.message.publish_time,
    ])
  } catch (error) {
    throw new Error('Failed to create dead letter: ' + error)
  }
})
```

이제 ```dead-letter``` 주제에 메시지를 처리할 push api endpoint를 추가합니다.   
```ts
// src/routes/api/pubsub/dead-letter.ts

export const Route = createFileRoute('/api/pubsub/dead-letter')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const message = zodMessageSchema.safeParse(await request.json())
        if (!message.success) {
          return new Response('invalid message', { status: 400 })
        }

        await createDeadLetter(message.data)

        return new Response('success', { status: 200 })
      },
    },
  },
})
```

이제 애플리케이션과 에뮬레이터를 실행하고, 주제와 구독을 생성한 이후 메시지 보내기 버튼을 클릭합니다.   
성공적으로 push 알림을 확인함과 동시에, 에뮬레이터 콘솔을 확인해보면 5번의 fail endpoint로 메시지를 전송한 이후 재전송되지 않은 것을 확인합니다.   
데이터베이스 테이블을 조회해보면 dead-letters 행 하나가 삽입되어 있습니다.   