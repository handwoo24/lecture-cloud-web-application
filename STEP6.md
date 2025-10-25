# Push 메시지 활용하기

### Firebase 설치하기

이번에는 **Firebase cloud messaging**을 이용하여 push 메시지를 전송하고 수신하는 방법을 학습합니다.  

먼저 firebase 라이브러리를 설치합니다.
```bash
npm install firebase firebase-admin
```

**Firebase Console** 아래 메뉴대로 조작하여 필요한 Key를 생성합니다.  
생성한 Key를 바탕으로 .env 파일을 수정합니다.

> 프로젝트 설정 / 일반 / 내 앱 / 웹 앱 / SDK 설정 및 구성

> 프로젝트 설정 / 서비스 계정 / 새 비공개 키 생성

> 프로젝트 설정 / 클라우드 메시징 / 웹 푸시 인증서 / VAPID 키 생성

구성해야하는 환경변수들은 아래와 같습니다.
 - public 환경변수 목록
    - VITE_FIREBASE_VAPID_KEY
    - VITE_FIREBASE_API_KEY
    - VITE_FIREBASE_AUTH_DOMAIN
    - VITE_FIREBASE_PROJECT_ID
    - VITE_FIREBASE_STORAGE_BUCKET
    - VITE_FIREBASE_MESSAGING_SENDER_ID
    - VITE_FIREBASE_APP_ID
    - VITE_FIREBASE_MEASUREMENT_ID
 - private 환경변수 목록
    - FIREBASE_ADMIN_PROJECT_ID
    - FIREBASE_ADMIN_STORAGE_BUCKET
    - FIREBASE_ADMIN_CLIENT_EMAIL
    - FIREBASE_ADMIN_PRIVATE_KEY

---

### FCM 토큰 발급하기

firebase client로 토큰을 요청합니다.   
아래와 같이 firebase client를 초기화합니다.
```ts
// src/google/firebase.ts

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
```

이제 토큰을 발급할 수 있는 버튼과 라우터를 구성해봅니다.   
```tsx
// src/routes/_navbar/settings.tsx

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_navbar/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main>
      <button className="btn">Push 권한 요청</button>
      <button className="btn">Push 메시지 보내기</button>
    </main>
  )
}
```
```tsx
// src/components/Navbar.tsx

export const Navbar = () => {
  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="flex-1">
        <Link className="btn btn-ghost text-xl" to="/">
          {m.app_title()}
        </Link>
      </div>
      <div className="flex-none">
        <Link className="btn btn-square btn-ghost" to="/settings">
          <User />
        </Link>
      </div>
    </div>
  )
}
```

이제 **push 권한 요청** 버튼을 클릭하면 토큰을 발급하고 이를 데이터베이스에 유저 정보와 함께 저장합니다.  
```messaging_tokens``` 테이블을 설계합니다.   
스키마를 표현하면 아래와 같습니다.
```ts
// src/model/messagingToken.ts

import { z } from 'zod'

export const zodMessagingTokenSchema = z.object({
  uid: z.string(),
  fcm_token: z.string(),
})

export type MessagingToken = z.infer<typeof zodMessagingTokenSchema>
```

데이터베이스 테이블 스키마에는 타임스탬프도 추가해서 생성하도록 작성합니다.   
```sql
-- Cloud SQL Studio에서 실행합니다.

CREATE TABLE IF NOT EXISTS messaging_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
    uid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, 
    fcm_token VARCHAR(1024) NOT NULL UNIQUE, 
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);
```

```messaging_token```을 삽입하는 쿼리문은 다음과 같습니다.
```sql
INSERT INTO messaging_tokens (
    uid,
    fcm_token
)
VALUES ($1, $2)
ON CONFLICT (fcm_token)
DO UPDATE SET
    uid = EXCLUDED.uid,
    updated_at = now();
```
```ts
// src/database/messagingToken.ts

export const createMessagingToken = createServerOnlyFn(
  async (uid: string, fcmToken: string) => {
    try {
      const pool = getPool()
      await pool.query(insertMessagingTokenQuery, [uid, fcmToken])
    } catch (error) {
      throw new Error('Failed to create messaging token: ' + error)
    }
  },
)
```

토큰 값이 중복되면 SET 하도록 쿼리를 작성합니다.   
해당 쿼리를 실행할 server Function을 작성하고 **권한 요청 버튼**의 이벤트 핸들러를 작성합니다.   
```ts
// src/server/messagingToken.ts

export const createMessagingTokenFn = createServerFn({
  method: 'POST',
})
  .inputValidator(z.string())
  .handler(async (ctx) => {
    const session = await useAuthSession()
    if (!session.data.uid) {
      throw new Error('Unauthorized')
    }
    return createMessagingToken(session.data.uid, ctx.data)
  })
```
```tsx
// src/routes/_navbar/settings.tsx

function RouteComponent() {
  const createToken = useServerFn(createMessagingTokenFn)

  const handleClickRequestPermission = useCallback(async () => {
    try {
      const token = await getMessagingToken()
      await createToken({ data: token })
    } catch (error) {
      console.error(error)
    }
  }, [createToken])

  return (
    <main>
      <button className="btn" onClick={handleClickRequestPermission}>
        Push 권한 요청
      </button>
      <button className="btn">Push 메시지 보내기</button>
    </main>
  )
}
```

이제 push 권한 요청을 보내면 세션이 유효한 시점에 토큰을 발급받아 데이터베이스에 저장합니다.   
세션이 없다면 로그인 페이지로 이동시키기 위해 라우터를 추가합니다.   
```tsx
// src/routes/_navbar/login.tsx

function RouteComponent() {
  const login = useServerFn(loginFn)

  const handleClickLogin = useCallback(() => login(), [login])

  return (
    <main>
      <button className="btn" onClick={handleClickLogin}>
        {/* 적절히 메시지를 추가합니다. */}
        {m.login_with_google()}
      </button>
    </main>
  )
}
```
```ts
// src/server/messagingToken.ts

export const createMessagingTokenFn = createServerFn({
  method: 'POST',
})
  .inputValidator(z.string())
  .handler(async (ctx) => {
    const session = await useAuthSession()
    if (!session.data.uid) {
      // 로그인으로 리다이렉트 시킵니다.   
      throw redirect({ to: '/login' })
    }
    return createMessagingToken(session.data.uid, ctx.data)
  })
```
이제 애플리케이션을 실행하고 로그인 한 이후에, 토큰을 발급받습니다.   
브라우저에서 알림을 허용하면 토큰이 생성됩니다.   
(차단하면 토큰이 만료되지만, 만료된 토큰은 추후 처리합니다.)  

---

### Push 메시지 보내기

**Push 메시지 보내기** 버튼은 아래와 같은 흐름으로 동작합니다.
 - 유저 정보로 FCM 토큰 조회하기
 - 해당 토큰 정보로 메시지 전송하기

유저 정보로 FCM 토큰을 가져오는 쿼리를 작성합니다.
```sql
-- src/database/sql/select_messaging_tokens.sql

SELECT *
FROM messaging_tokens
WHERE uid = $1;
```
```ts
// src/database/messagingTokens.ts

export const getMessagingTokens = createServerOnlyFn(async (uid: string) => {
  try {
    const pool = getPool()
    const res = await pool.query(selectMessagingTokensQuery, [uid])

    return zodMessagingTokenSchema.array().parse(res.rows)
  } catch (error) {
    throw new Error('Failed to get messaging token: ' + error)
  }
})
```

메시지를 보내기 위해서는 firebase-admin 클라이언트의 api가 필요합니다.  
이전 단계에서 준비한 admin key를 이용하여 admin client를 초기화 합니다.   
```ts
// src/google/firebase-admin.ts

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
```

메시지를 전송하기 위한 server function은 다음과 같이 작성합니다.
그리고 **Push 메시지 보내기** 버튼의 이벤트 핸들러를 작성합니다.
```ts
// src/server/messagingToken.ts

export const pushSelfMessageFn = createServerFn({
  method: 'GET',
}).handler(async () => {
  const session = await useAuthSession()
  if (!session.data.uid) {
    throw redirect({ to: '/login' })
  }

  const messagingTokens = await getMessagingTokens(session.data.uid)
  const tokens = messagingTokens.map((token) => token.fcm_token)

  await sendMessageForMulticast({
    tokens,
    notification: { title: '나에게 보내는 편지', body: '안녕 반가워!' },
  })
})
```
```tsx
// src/routes/_navbar/settings.tsx

function RouteComponent() {
  const createToken = useServerFn(createMessagingTokenFn)

  const pushSelfMessage = useServerFn(pushSelfMessageFn)

  const handleClickRequestPermission = useCallback(async () => {
    try {
      const token = await getMessagingToken()
      await createToken({ data: token })
    } catch (error) {
      console.error(error)
    }
  }, [createToken])

  const handleClickPushMessage = useCallback(async () => {
    await pushSelfMessage()
  }, [pushSelfMessage])

  return (
    <main>
      <button className="btn" onClick={handleClickRequestPermission}>
        Push 권한 요청
      </button>
      <button className="btn" onClick={handleClickPushMessage}>
        Push 메시지 보내기
      </button>
    </main>
  )
}
```

그러나 실제로 Push 메시지 보내기를 눌러도 알림이 오지 않습니다.   
서버에서 토큰 정보로 메시지를 보내고 싶어도, 메시지를 백그라운드에서 처리할 수 있는 **서비스 워커**가 없기 때문입니다.   
아래와 같이 파일 라우팅을 이용하여 서비스 워커를 작성합니다.

```ts
// src/routes/firebase-messaging-sw[.]js.ts

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
```

이 서비스워커 에게 메시지가 전송되면 브라우저 API를 이용하여 알림이 생성됩니다.   
애플리케이션을 실행하고 메시지 보내기 버튼을 눌러 확인합니다.   