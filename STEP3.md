# 유저 인증 시스템 구현하기

### 구글 로그인 API 사용하기
GCP Console에서 **Google Auth Platform**을 검색합니다.   
**API 사용 설정**을 클릭하고 시작합니다.
 - 앱 이름: lecture-cloud-web-application
 - 사용자 지원 이메일: 본인 구글 게정
 - 대상: 외부
 - 연락 이메일: 본인 구글 계정
 - 동의

OAuth Client를 생성합니다.
 - 애플리케이션 유형: 웹 애플리케이션
 - 이름: Development OAuth Client
 - 승인된 Javascript 원본: http://localhost:3000
 - 승인된 리디렉션 URI: http://localhost:3000/api/auth/callback/google   

만들기를 완료하면 팝업으로 나오는 Client ID를 복사합니다.   
그리고 만들어진 Client를 클릭하면 보안 비밀번호를 복사할 수 있습니다.   
.env 파일에 아래와 같이 환경변수를 정의합니다.   
```
GOOGLE_CLIENT_ID="${CLIENT_ID}"
GOOGLE_CLIENT_SECRET="${CLIENT_SECRET}"
GOOGLE_REDIRECT_URI="${REDIRECT_URI}"
```

이제 터미널을 열고 google-auth-library를 설치합니다.
```bash
npm install google-auth-library
```
---
### 구글 로그인 구현하기
server 환경에서 google auth client를 초기화하고 로그인 요청을 보내기 위한 코드를 작성합니다.
```ts
// src/google/auth.ts

import { createServerOnlyFn } from '@tanstack/react-start'
import { OAuth2Client } from 'google-auth-library'

let oauthClient: OAuth2Client | null = null

export const getOAuthClient = createServerOnlyFn(() => {
  if (!oauthClient) {
    return (oauthClient = new OAuth2Client({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_REDIRECT_URI,
    }))
  }

  return oauthClient
})

export const generateAuthUrl = createServerOnlyFn((client: OAuth2Client) => {
  return client.generateAuthUrl({
    access_type: 'online',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid',
    ],
  })
})
```
```ts
// src/server/auth.ts

import { createServerFn } from '@tanstack/react-start'
import { redirect } from '@tanstack/react-router'
import { generateAuthUrl, getOAuthClient } from '@/google/auth'

export const loginFn = createServerFn({ method: 'GET' }).handler(() => {
  const oauthClient = getOAuthClient()
  const href = generateAuthUrl(oauthClient)
  throw redirect({ href })
})
```
```tsx
// src/routes/index.tsx

...

function App() {
  const version = Route.useLoaderData()

  const login = useServerFn(loginFn)

  const handleClickLogin = useCallback(() => login(), [login])

  return (
    <div>
      <p>Database Version: {version}</p>
      <button onClick={handleClickLogin}>구글로 로그인</button>
    </div>
  )
}
```

이제 애플리케이션을 실행한 후, 로그인 버튼을 누르면 구글 로그인 페이지로 리다이렉트 됩니다.   
이제 이 로그인이 성공적으로 완료되고 나면 callback을 받을 api를 구성하고,   
google에서 제공하는 정보로 user와 session을 생성해야합니다.   
user에 대한 정보를 데이터베이스에 저장하기 전에,   
callback api를 다음과 같이 구성하고 session을 생성할 수 있습니다. 
```ts
// src/routes/api/auth/callback.google.ts

import { createFileRoute, redirect } from '@tanstack/react-router'
import { getOAuthClient, verifyTokens } from '@/google/auth'
import { useAuthSession } from '@/session'

export const Route = createFileRoute('/api/auth/callback/google')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        // url searchParam으로 인가 코드가 발급됩니다.
        const url = new URL(request.url)
        const code = url.searchParams.get('code')

        if (typeof code !== 'string') {
          return new Response('Invalid code', { status: 400 })
        }

        const oauthClient = getOAuthClient()

        // 발급된 인가 코드를 OAuth client를 이용해서 토큰으로 교환합니다.
        const { tokens } = await oauthClient.getToken(code)

        // 토큰으로부터 인증정보를 취득합니다.
        const payload = await verifyTokens(oauthClient, tokens)

        const idToken = payload.getPayload()
        if (!idToken?.sub) {
          throw new Response('Invalid ID Token', { status: 400 })
        }

        const session = await useAuthSession()

        // 세션에 인증정보를 저장합니다.
        await session.update({
          token: crypto.randomUUID(),
          expires: new Date().getTime() + 60 * 60 * 1000,
          uid: idToken.sub,
        })

        throw redirect({ to: '/' })
      },
    },
  },
})
```
```ts
// src/google/auth.ts
import type { Credentials } from 'google-auth-library'

...

export const verifyTokens = (client: OAuth2Client, tokens: Credentials) => {
  if (!tokens.id_token) {
    throw new Error('Invalid ID Token')
  }

  return client.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID,
  })
}
```
```ts
// src/session.ts

import { createServerOnlyFn } from '@tanstack/react-start'
import { useSession } from '@tanstack/react-start/server'

type Session = {
  token?: string
  expires?: number
  uid?: string
}

export const useAuthSession = createServerOnlyFn(() => {
  const AUTH_SECRET = process.env.AUTH_SECRET

  // .env 파일을 열고 AUTH_SECRET을 적절히 추가합니다. ex) AUTH_SECRET = doNotShareThisSecret
  if (typeof AUTH_SECRET !== 'string') {
    throw new Error('Missing AUTH_SECRET')
  }

  return useSession<Session>({ password: AUTH_SECRET })
})
```
이제 다시 구글 로그인을 시도해봅니다.   
정상적으로 완료되며 리다이렉트 됩니다.

---
### 로그아웃 구현하기
이제 session이 존재할 때, 로그아웃 버튼이 보이도록 수정합니다.
```tsx
// src/routes/index.tsx

...

const loaderFn = createServerFn({ method: 'GET' }).handler(async () => {
  const version = await getVersion()
  const session = await useAuthSession()

  return { version, uid: session.data.uid }
})

export const Route = createFileRoute('/')({
  component: App,
  loader() {
    return loaderFn()
  },
})

function App() {
  const { version, uid } = Route.useLoaderData()

  const login = useServerFn(loginFn)

  const handleClickLogin = useCallback(() => login(), [login])

  return (
    <div>
      <p>Database Version: {version}</p>
      {uid ? (
        <button>로그아웃</button>
      ) : (
        <button onClick={handleClickLogin}>구글로 로그인</button>
      )}
    </div>
  )
}
```
이제 session을 제거하고 로그아웃 할 수 있도록 구현합니다.
```ts
// src/server/auth.ts

...

export const logoutFn = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await useAuthSession()
  session.clear()
  // 추후에는 로그인 페이지로 이동시키도록 합니다.
  throw redirect({ to: '/' })
})
```
```tsx
// src/routes/index.tsx

...

function App() {
  const { version, uid } = Route.useLoaderData()

  const logout = useServerFn(logoutFn)

  const login = useServerFn(loginFn)

  const handleClickLogin = useCallback(() => login(), [login])

  const handleClickLogout = useCallback(() => logout(), [logout])

  return (
    <div>
      <p>Database Version: {version}</p>
      {uid ? (
        <button onClick={handleClickLogout}>로그아웃</button>
      ) : (
        <button onClick={handleClickLogin}>구글로 로그인</button>
      )}
    </div>
  )
}
```
---
### 데이터베이스 활용하기
구글로 부터 제공받은 user 정보를 바탕으로,   
SQL에 user와 account를 저장하고 인증에 사용합니다.  
먼저 user와 account의 스키마를 정의합니다.

```ts
// src/model/user.ts

import { z } from 'zod'

export const zodAccountSchema = z.object({
  id: z.string().uuid(),
  uid: z.string().uuid(),
  provider: z.string().max(255),
  provider_account_id: z.string().max(255),
})

export type Account = z.infer<typeof zodAccountSchema>

export const zodUserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().max(255),
  email: z.string().max(255),
  email_verified: z.boolean().nullish(),
  picture: z.string().nullish(),
  disabled: z.boolean(),
})

export type User = z.infer<typeof zodUserSchema>
```

작성한 스키마를 바탕으로 테이블 생성 쿼리를 작성합니다.

```sql
-- Cloud SQL Studio에서 실행합니다.

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255),
  email VARCHAR(500) UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  picture VARCHAR(1024),
  disabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(255) NOT NULL,
  provider_account_id VARCHAR(255) NOT NULL,
  UNIQUE (provider, provider_account_id)
  );
```
Cloud SQL Console에는 Cloud SQL Studio라는 SQL 데이터가 메뉴로 존재합니다.  
여기에 SQL 인스턴스를 생성할 때 만든 사용자 정보로 로그인 합니다.   
위에 작성한 테이블 생성 쿼리를 실행합니다.   
저장 버튼을 눌러 ```create_tables```라는 이름으로 저장해 둡니다.   
추후 생성할 테이블들에 대한 쿼리도 여기에 추가해 사용하겠습니다.   
이제 다시 VSC로 돌아가서 유저를 생성하고 조회하는 쿼리를 작성합니다.   
```sql
-- src/database/sql/select_user_by_provider.sql
-- google의 id로 부터 account, account의 user를 조회합니다.
SELECT users.*
FROM accounts
INNER JOIN
    users ON accounts.uid = users.id
WHERE accounts.provider = $1
    AND accounts.provider_account_id = $2
    LIMIT 1;
```
```sql
-- src/database/sql/insert_user.sql
-- google의 인증정보로 account, user를 생성합니다.
WITH new_user AS (
    INSERT INTO users (name, email, email_verified, picture)
    VALUES ($1, $2, $3, $4)
    RETURNING * 
),
new_account AS (
    INSERT INTO accounts (uid, provider, provider_account_id)
    SELECT id, $5, $6 FROM new_user
)
SELECT * FROM new_user;
```
이렇게 두가지 시나리오에 대한 쿼리를 작성합니다.   
1. 구글로 부터 받은 인증정보를 바탕으로 user와 account를 생성합니다.
2. 구글의 ID로 부터 account와 연결된 user를 조회합니다.

이 흐름을 callback api에 구현하여 인증정보를 데이터베이스에 저장하고 관리합니다.   
먼저 해당 쿼리를 호출하는 함수를 작성합니다.   
```ts
// src/database/user.ts
import { createServerOnlyFn } from '@tanstack/react-start'
import { getPool } from './config'
import selectUserQuery from './sql/select_user_by_provider.sql?raw'
import insertUserQuery from './sql/insert_user.sql?raw'
import type { TokenPayload } from 'google-auth-library'
import { zodUserSchema } from '@/model/user'

export const getUserByGoogle = createServerOnlyFn(async (sub: string) => {
  try {
    const pool = getPool()
    const res = await pool.query(selectUserQuery, ['google', sub])

    if (!res.rows.length) {
      return null
    }

    return zodUserSchema.parse(res.rows[0])
  } catch (error) {
    throw new Error('Failed to get user by Google: ' + error)
  }
})

export const createUserByGoogle = createServerOnlyFn(
  async (idToken: TokenPayload) => {
    try {
      const res = await getPool().query(insertUserQuery, [
        idToken.name,
        idToken.email,
        idToken.email_verified,
        idToken.picture,
        'google',
        idToken.sub,
      ])

      return zodUserSchema.parse(res.rows[0])
    } catch (error) {
      throw new Error('Failed to create user by Google: ' + error)
    }
  },
)
```
callback api는 아래와 같이 수정됩니다.
```ts
// src/routes/api/auth/callback.google.ts

export const Route = createFileRoute('/api/auth/callback/google')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        
        ...
        const idToken = payload.getPayload()
        if (!idToken?.sub) {
          throw new Response('Invalid ID Token', { status: 400 })
        }

        // 사용자를 조회하거나 생성합니다.
        const user =
          (await getUserByGoogle(idToken.sub)) ||
          (await createUserByGoogle(idToken))

        const session = await useAuthSession()
        
        // 세션에 인증정보를 저장합니다.
        await session.update({
          token: crypto.randomUUID(),
          expires: new Date().getTime() + 60 * 60 * 24 * 7 * 1000,
          uid: user.id,
        })

        throw redirect({ to: '/' })
      },
    },
  },
})
```

이제 애플리케이션을 실행한 후, 로그인을 성공하면 데이터베이스에 user와 account 정보가 삽입됩니다.   
추후 애플리케이션에서 이러한 정보를 조회하여 서비스에 활용할 수 있습니다.   