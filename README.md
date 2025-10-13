# DIY 개발 레시피 - 클라우드 웹 어플리케이션

## 목차
 0. 환경설정


### [환경설정](https://github.com/handwoo24/lecture-cloud-web-application/tree/step-0)

이 강의자료는 windows를 기본으로 설명하고 있습니다.
OS에 따라 추가적인 조치가 필요할 수 있습니다.
실습을 따라하기 전에, 아래 프로그램들을 설치해 주시기 바랍니다.
[Nodejs](https://nodejs.org/ko), [VScode](https://code.visualstudio.com/), [Git](https://git-scm.com/)
> Nodejs의 경우 22-LTS 버전을 설치하시길 바랍니다.
각 프로그램의 설치방법은 아래 동영상 링크를 참고하시길 바랍니다.
 - [Nodejs 설치 동영상]()
 - [VScode 설치 동영상]()
 - [Git 설치 동영상]()

#### 챕터에 등장하는 개념들
각 개념들에 대해 찾아보거나 Gemini에게 질문하여 먼저 학습하세요.
해당 내용들에 대해 인지하고 실습을 따라하시면 보다 쉽게 따라하실 수 있습니다.
 - 프레임워크(Framework)
 - 라이브러리(Library)
 - 터미널(Terminal)
 - 명령 줄 인터페이스(Command Line Interface)
 - Git
 - 형상관리(Version Control)
 - 레포지토리(Repository)
 - 브랜치(Branch)
 - 커밋(Commit)
 - 클라우드(Cloud)
 - 구글 클라우드 플랫폼(Google Cloud Platform)
 - 앱 호스팅(App Hosting)
 - React
 - npm(node package manager)

#### 프로젝트 시작하기
여기서는 [Tanstack-start](https://tanstack.com/start/latest) 프레임워크를 사용하여 [React](https://react.dev/) 기반의 웹 어플리케이션을 시작합니다.
윈도우 터미널을 열고 아래 명령어를 입력합니다.
(윈도우 검색에서 cmd를 입력하시면 터미널을 열 수 있습니다.)
```bash
npm create @tanstack/start@latest
# project name은 my-app으로 권장합니다.

# 혹은 아래 명령어를 이용하여 레포지토리를 복사할 수 있습니다.
# git clone https://github.com/handwoo24/lecture-cloud-web-application/tree/step-0
```

이제 해당 프로젝트로 이동해서 VsCode를 실행합니다.
터미널을 닫지 않고 아래 명령어를 순서대로 실행해주세요.
```bash
# 생성된 프로젝트로 이동합니다.
cd my-app

# 해당 경로에서 VSCode를 실행합니다.
code .
```

자 이제 터미널을 닫고 실행된 VSCode 터미널로 이동합니다.
터미널 우측 상단에 보면 powershell이라고 적힌 부분이 있습니다.
해당 부분을 command prompt로 수정합니다.
그리고 아래 명령어를 실행합니다.
```bash
# package.json에 정의된 라이브러리를 설치합니다.
npm install

# 앱을 실행합니다.
npm run dev
```

이제 터미널에 출력된 URL을 클릭하면 실행된 앱을 확인할 수 있습니다.
> http://localhost:3000/
지금 실행된 앱은 로컬 환경(지금 작업중인 컴퓨터)에서만 접근할 수 있는 경로입니다.
실제 인터넷에 배포된 것이 아닙니다.
다른 사람, 네트워크에서 접근하려면 호스팅(Hosting)이라는 과정이 필요합니다.


#### [클라우드 호스팅 구성하기](https://github.com/handwoo24/lecture-cloud-web-application/tree/step-1)

클라우드 호스팅을 구성하기 전에, 이전 단계에서 생성한 프레임워크 프로젝트의 설정을 추가해야합니다.
[tanstack-start](https://tanstack.com/start/latest/docs/framework/react/hosting) 개발문서를 참고합니다.
해당 개발문서의 [Nitro](https://tanstack.com/start/latest/docs/framework/react/hosting#nitro)를 이용한 호스팅 설정을 참고하세요.
preset은 firebase-app-hosting을 사용합니다.

아래 라이브러리를 설치합니다.
```bash
npm install -D @tanstack/nitro-v2-vite-plugin
```

아래와 같이 코드를 수정합니다.
```ts
// vite.config.ts

import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { nitroV2Plugin } from '@tanstack/nitro-v2-vite-plugin'

const config = defineConfig({
  plugins: [
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    // firebase-app-hosting을 위한 preset을 설정합니다.
    nitroV2Plugin({ preset: 'firebase-app-hosting' }),
    viteReact(),
  ],
})

export default config

```
그리고 VSCode의 좌측 탭에서 Git UI를 선택해서 변경사항을 커밋합니다.
터미널에서 아래 명령어를 실행합니다.
```bash
# live라는 브랜치를 생성하고 체크아웃합니다.
git checkout -b live

# github 서버에 해당 브랜치를 push합니다.
git push -u origin live
```
이제 클라우드 호스팅을 구성할 수 있습니다.   

이 강의에서는 [구글 클라우드 플랫폼](https://cloud.google.com/)을 이용하여 앱을 배포합니다.
구글 계정을 생성하고 [Firebase Console](https://console.firebase.google.com/)에 접속합니다.
Firebase는 GCP에서 제공하는 클라우드 서비스입니다.
**새 Firebase 프로젝트 만들기**를 클릭합니다.
my-firebase라는 ID로 트로젝트를 생성합니다.
이제 잠시 터미널로 돌아와서 firebase cli를 설치합니다.
아래 명렁어를 실행하면 됩니다.
```bash
npm install -g firebase-tools
```
이제 firebase cli를 이용하여 firebase-app-hosting을 초기화합니다.
```bash
# firebase 초기화 명령어를 실행합니다.
# 입력 후 cli를 통해 키보드를 조작하여 app-hosting만 선택하고 진행합니다.
# hosting과 app-hosting을 혼동하지 않도록 주의합니다.
# 실행 중에 요금제에 따른 오류가 발생할 수 있습니다.
# 터미널에 출력되는 로그를 참고하여 프로젝트 요금제를 Blaze로 업그레이드 합니다.
# 자세한 내용은 Firebase Console과 문서를 참고하세요.
# 위아래 키보드를 이용하여 항목을 이동하고, Space로 선태, Enter로 제출합니다.
firebase init
```
이후에 CLI 이용은 아래 항목을 참고하세요.

```
-y

[*] App Hosting: Enable web app deployments with App Hosting

Use an existing project

my-firebase-* (suffix는 다를 수 있습니다.)

Create a new backend

asia-east1

my-web-app(기본값, Enter를 입력하시면 됩니다.)

/(기본값, Enter를 입력하시면 됩니다.)
```
초기화가 완료되면 apphosting.yaml 파일이 생성됩니다.
이제 [Firebase Console](https://console.firebase.google.com/)으로 돌아갑니다.
> 빌드 > App Hosting > my-web-app(보기) > 설정 > 배포
위 순서대로 조작하여 배포 설정화면으로 이동합니다.
Github 계정을 연결하고 레포지토리를 선택합니다.
라이브 브랜치는 조금 전에 push한 live를 선택하고 저장 및 배포를 클릭합니다.
몇 분 지나면 배포된 앱을 확인하실 수 있습니다.

#### 클라우드 SQL 구성하기

본격적으로 앱을 개발하기 전에, 데이터베이스를 구성해야합니다.
여기서는 Cloud SQL 서비스를 이용하여 PostgreSQL 데이터베이스를 구성하고 어플리케이션과 연결해봅니다.
먼저 [GCP Console](https://console.cloud.google.com/)으로 이동합니다.
Cloud SQL을 검색하고 해당 메뉴로 이동합니다.
> 인스턴스 만들기 > PostgreSQL 선택
위 순서대로 조작하여 인스턴스 생성을 시작합니다.
아래 항목을 참고하여 올바르게 인스턴스를 생성합니다.
 - Cloud SQL 버전 선택: EnterPrise
 - 버전 사전 설정: 샌드박스
 - 인스턴스 정보
   - 데이터베이스 버전: PostgreSQL 17
   - 인스턴스 ID: lecture-cloud-web-application-postgres
   - 비밀번호: 생성을 클릭합니다.(따로 기억해둡니다.)
 - 리전 및 영역 가용성 선택
   - 리전: asia-east1
   - 영역 가용성: 단일 영역
 - 머신 구성
   - vCPU 1개, 3.75GB
 - 저장 용량
   - 저장용량 자동 증가 사용 설정을 해제합니다.
 - 연결
   - 비공개 IP 설정을 추가합니다.
     - 네트워크는 default를 그대로 유지합니다.
     - 아래 비공개 서비스 액세스 연결을 사용하도록 안내에 따라 설정합니다.(몇 분 정도 소요됩니다.)
   - 승인된 네트워크 추가를 클릭하고 **내 IP 사용**을 눌러 추가합니다.
 - 데이터 보호
   - 자동 일일 백업 설정을 해제합니다.
   - point-in-time recovery 사용 설정을 해제합니다.
   - 인스턴스 삭제 보호의 모든 옵션을 해제합니다.

이제 몇 분 정도 기다리면 인스턴스 구성이 완료됩니다.
완료되면 연결 탭을 눌러 연결 정보를 확인합니다.
이 정보를 이용하여 어플리케이션에서 데이터베이스를 사용할 수 있습니다.
다시 VSCode로 돌아와서 작업합니다.
아래 라이브러리를 설치합니다.

```bash
npm install pg
npm install -D @types/pg
```

아래와 같이 파일을 생성하고 코드를 작성합니다.

```ts
// src/database/config.ts

import { createServerOnlyFn } from '@tanstack/react-start'
import { Pool } from 'pg'

let pool: Pool | null = null

export const getPool = createServerOnlyFn(() => {
  if (!pool) {
    return (pool = new Pool({
      host: process.env.POSTGRES_HOST,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      port: 5432,
    }))
  }

  return pool
})

```
> **process.env.변수이름** 은 코드에 노출되지 않는 런타임 환경변수를 사용하는 방법입니다.
환경변수를 설정하기 위해서 프로젝트 루트에 .env파일을 생성하고 아래와 같이 작성합니다.

```
POSTGRES_HOST=${YOUR_HOST} --> 여기서는 공개 IP의 주소를 입력합니다.
POSTGRES_USER="postgres"
POSTGRES_PASSWORD=${YOUR_PASSWORD} --> 인스턴스 생성당시 생성된 비밀번호를 입력합니다.
POSTGRES_DATABASE="postgres" 

```

이제 데이터베이스가 잘 연결되는지 테스트 하기 위한 간단한 쿼리를 작성하고 메인 화면에서 정보를 확인할 수 있도록 구현합니다.
SQL파일을 작성하고 해당 텍스트를 import 할 수 있도록 vite 설정을 추가합니다.
```ts
// vite.env.d.ts

declare module '*.sql?raw' {
  const content: string
  export default content
}
```
그리고 Databse 버전을 확인할 수 있는 쿼리를 작성합니다.

```sql
--> src/database/sql/select_version.sql

SELECT version();
```

그리고 아래와 같이 database에 접근하는 함수를 생성합니다.
```ts
// src/database/version.ts

import { createServerOnlyFn } from '@tanstack/react-start'
import z from 'zod'
import { getPool } from './config'
import sql from './sql/select_version.sql?raw'

export const getVersion = createServerOnlyFn(async () => {
  try {
    const pool = getPool()
    const res = await pool.query(sql)
    return z.string().parse(res.rows[0].version)
  } catch (error) {
    throw new Error('Failed to fetch version from database: ' + error)
  }
})

```

이제 메인 페이지의 파일을 아래와 같이 수정합니다.
```ts
// src/routes/index.ts

import { createFileRoute } from '@tanstack/react-router'
import { getVersion } from '@/database/version'

export const Route = createFileRoute('/')({
  component: App,
  loader() {
    return getVersion()
  },
})

function App() {
  const version = Route.useLoaderData()

  return <div>Database Version: {version}</div>
}

```

그리고 이제 어플리케이션을 실행해보면 데이터베이스의 버전정보가 렌더링 되는 것을 확인할 수 있습니다.

어플리케이션을 실행해서 데이터베이스와 연결되는 것을 확인했지만,
호스팅 배포 환경에서도 이렇게 데이터베이스가 연결되고 있을까요?
배포 환경에서도 데이터데이스가 동작하기 위해서는 몇가지 설정이 필요합니다.

apphosting 구성 파일을 아래와 같이 수정합니다.
```yaml
# apphosting.yaml
runConfig:
  minInstances: 0
  vpcAccess:
    egress: PRIVATE_RANGES_ONLY # Default value
    networkInterfaces:
      # Specify at least one of network and/or subnetwork
      - network: default
```
그리고 이제 firebase cli를 이용하여 환경 변수들을 보안 비밀로 추가합니다.
여기서는 GCP의 Secret Manager를 이용하여 민감한 값들을 안전하게 사용할 수 있도록 설정합니다.
VSCode의 터미널에서 아래 명령어를 하나하나 싫행해 줍니다.
다른 값들은 .env와 동일하게 작성하면 되지만, POSTGRES_HOST는 비공개 IP주소의 값을 입력해주세요.(Cloud SQL 콘솔에서 확인가능합니다.)

```bash
firebase apphosting:secrets:set ${변수이름}


# ex) firebase apphosting:secrets:set googleClientId

# 이후에는 .env의 값을 붙여넣기를 통해 입력하고 Enter를 누르세요.
# grant access에 대한 질문에 yes를 입력합니다.
# apphosting.yaml에 추가할 거냐고 묻는 질문에 올바르게(변수이름을) 입력해 주세요.
```

올바르게 값들을 입력했다면 apphosting.yaml파일 아래에 다음과 같은 내용이 추가되어 있습니다.
```yaml
# apphosting.yaml
...

env:
  # Configure environment variables.
  # See https://firebase.google.com/docs/app-hosting/configure#user-defined-environment
  - variable: POSTGRES_HOST
    secret: postgresHost
  - variable: POSTGRES_USER
    secret: postgresUser
  - variable: POSTGRES_PASSWORD
    secret: postgresPassword
  - variable: POSTGRES_DATABASE
    secret: postgresDatabase
```

이제 변경사항을 커밋하고 live 브랜치에 push 해봅니다.
새롭게 배포된 어플리케이션을 확인하면 올바르게 데이터베이스 버전을 확인할 수 있습니다.

#### 구글 로그인 구현하기

이 단계에서는 구글 로그인 API를 설정하고 실제로 어플리케이션에서 해당 기능을 사용할 수 있도록 구현해 보겠습니다.
로그인 기능을 구현하기 전에 우리는 두 개의 테이블 스키마를 작성해봅니다.
여기서는 users와 accounts 테이블에 대한 스키마를 작성해봅니다.
zod의 인터페이스를 이용해서 작성해보면 아래와 같습니다.
```ts
// src/model/user.ts


import { z } from 'zod'

export const zodAccountSchema = z.object({
  id: z.string(),
  uid: z.string(),
  provider: z.string().max(255),
  provider_account_id: z.string().max(255),
})

export type Account = z.infer<typeof zodAccountSchema>

export const zodUserSchema = z.object({
  id: z.string(),
  name: z.string().max(255),
  email: z.string().max(255),
  email_verified: z.boolean().nullish(),
  picture: z.string().nullish(),
  disabled: z.boolean(),
})

export type User = z.infer<typeof zodUserSchema>

```

이렇게 정의한 Type에 맞게 테이블 생성 쿼리를 작성해봅니다.
**Cloud SQL Studio**로 이동해서 사용자 인증을 완료하고 **새 SQL 편집기 탭**을 눌러 편집기로 이동합니다.
아래와 같이 SQL문을 작성하고 실행합니다.

```sql
CREATE TABLE IF NOT EXISTS users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT,
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  picture TEXT,
  disabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

CREATE TABLE IF NOT EXISTS accounts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  uid BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  UNIQUE (provider, provider_account_id)
  );
```

그리고 추후 데이터베이스 관리를 위해 저장을 누르고 다음과 같은 이름으로 저장합니다.
> migration0001-create_users

자 이제 다음 단계로 넘어갑니다.
GCP Console에서 검색을 이용하여 Google Auth Platform으로 이동합니다.
사용 설정한 후 다음 항목을 참고하여 시작합니다.
 - 앱 이름: lecture-cloud-web-application
 - 사용자 지원 이메일: 본인 구글 게정
 - 대상: 외부
 - 연락 이메일: 본인 구글 계정
 - 동의

이제 OAuth Client를 생성합니다.
아래 내용을 참고하여 각 항목을 작성해 주세요.
 - 애플리케이션 유형: 웹 애플리케이션
 - 이름: Development OAuth Client
 - 승인된 Javascript 원본: http://localhost:3000
 - 승인된 리디렉션 URI: http://localhost:3000/api/auth/callback/google
만들기를 완료하면 팝업으로 나오는 클라이언트 ID를 복사합니다.
그리고 만들어진 클라이언트를 클릭하면 보안 비밀번호를 복사할 수 있습니다.
.env 파일을 프로젝트 루트 레벨에 생성하고 각 값을 아래와 같이 붙여 넣습니다.

```
GOOGLE_CLIENT_ID="${CLIENT_ID}"
GOOGLE_CLIENT_SECRET="${CLIENT_SECRET}"
GOOGLE_REDIRECT_URI="${REDIRECT_URI}"
```

자 이제 다시 VSCode로 돌아와서 메인 화면에 로그인 버튼을 추가해 봅니다.
```tsx
// src/routes/index.tsx
...


function App() {
  const version = Route.useLoaderData()

  return (
    <div>
      <p>Database Version: {version}</p>
      <button>구글로 로그인</button>
    </div>
  )
}

```

그리고 구글에서 제공하는 공식 인증 라이브러리를 설치합니다.
```bash
npm install google-auth-library
```

이제 서버 환경에서 Google OAuth Client를 다루는 함수를 작성합니다.
아래와 같이 파일을 생성하고 코드를 작성해주세요.
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

그리고 이것을 사용하기 위하 server-function을 작성합니다.

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

다시 메인화면으로 돌아와서 버튼을 클릭했을 때의 이벤트 핸들러를 추가해주면 됩니다.
```tsx
// src/routes/index.tsx

import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useCallback } from 'react'
import { getVersion } from '@/database/version'
import { loginFn } from '@/server/auth'

export const Route = createFileRoute('/')({
  component: App,
  loader() {
    return getVersion()
  },
})

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

이제 어플리케이션을 실행하고 버튼을 누르면 구글 로그인 화면으로 리다이렉트 되는 것을 확인할 수 있습니다.
그러나 더 진행하지는 마세요! 아직 완성된 것이 아닙니다.
로그인을 완료하게되면 Google OAuth Provider는 우리가 로그인 함수를 작성할 때 전달한 redirectUri로 인증 정보를 전달합니다.
우리는 해당 uri에 맞는 api를 구현하고 거기서 인증정보를 활용하여 유저와 세션정보를 처리해야 합니다.
아래 경로에 파일을 생성하고 코드를 작성합니다.

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

이제 다시 구글 로그인을 시도해보면 정상적으로 로그인이 완료되고 다시 메인 페이지로 리다이렉트 되는 것을 확인할 수 있습니다.
이제 메인 페이지에서 session이 존재할 때, 로그인 버튼 대신에 로그아웃 버튼을 렌더링 하도록 수정합니다.


```tsx
// src/routes/index.tsx

import { createFileRoute } from '@tanstack/react-router'
import { createServerFn, useServerFn } from '@tanstack/react-start'
import { useCallback } from 'react'
import { loginFn } from '@/server/auth'
import { useAuthSession } from '@/session'

export const Route = createFileRoute('/')({
  component: App,
  async loader() {
    const version = await getVersion()
    const session = await useAuthSession()
    return { version, uid: session.data.uid }
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

이제 다시 로그인을 해보면, 로그아웃 버튼이 표시됩니다.
이어서 로그아웃 버튼이 동작하도록 함수를 구현해봅니다.
```ts
// src/server/auth.ts

import { createServerFn } from '@tanstack/react-start'
import { redirect } from '@tanstack/react-router'
import { useAuthSession } from './session'
import { generateAuthUrl, getOAuthClient } from '@/google/auth'

export const loginFn = createServerFn({ method: 'GET' }).handler(() => {
  const oauthClient = getOAuthClient()
  const href = generateAuthUrl(oauthClient)
  throw redirect({ href })
})

export const logoutFn = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await useAuthSession()
  session.clear()
  // 추후에는 로그인 페이지로 이동시키도록 합니다.
  throw redirect({ to: '/' })
})

```

이제 로그아웃 버튼에 대한 이벤트 핸들러를 작성하면 로그아웃 기능이 구현됩니다.
코드를 아래와 같이 수정하고 어플리케이션을 실행합니다.
로그인 이후에는 로그아웃 버튼이 렌더링 되고,
로그아웃 이후에는 다시 로그인 버튼이 렌더링 되는 것을 확인할 수 있습니다.

```tsx
// src/routes/index.tsx

import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useCallback } from 'react'
import { loginFn, logoutFn } from '@/server/auth'
import { useAuthSession } from '@/session'
import { getVersion } from '@/database/version'

export const Route = createFileRoute('/')({
  component: App,
  async loader() {
    const version = await getVersion()
    const session = await useAuthSession()
    return { version, uid: session.data.uid }
  },
})

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


#### 독립적인 유저 인증정보 설계하기
지금까지 구글 로그인을 구현하고 session을 구성하는 것까지 완료했지만,
아직 할일이 하나 더 남았습니다.
우리는 구글로 부터 제공받은 인증정보를 바탕으로 우리의 데이터베이스에 사용자의 정보와 계정 정보를 저장하고 관리해야 합니다.
callback api의 구현을 아래 알고리즘을 따르도록 수정합니다.
 - 구글로 부터 받은 인증정보를 바탕으로 account 정보를 조회합니다.
 - account가 존재하면 해당 정보로 부터 user 정보를 조회합니다.
 - 존재하지 않으면 user와 account를 생성하고 해당 정보를 반환합니다.
먼저 account 정보를 조회하는 쿼리문과 함수를 구현합니다.

```sql
--> src/database/sql/select_user_by_provider.sql

SELECT users.*
FROM accounts
INNER JOIN
    users ON accounts.uid = users.id
WHERE accounts.provider = $1
    AND accounts.provider_account_id = $2
    LIMIT 1;
```

```ts
// src/database/user.ts

import { createServerOnlyFn } from '@tanstack/react-start'
import { getPool } from './config'
import selectUserQuery from './sql/select_user_by_provider.sql?raw'
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

```

이제 **getUserByGoogle** 함수에 google IdToken의 sub 값을 전달하면 유저의 정보 혹은 null이 반환됩니다. 
이에 따라 해당 정보를 반환할지, 혹은 유저를 생성할지 구현합니다.
먼저 유저를 생성하는 쿼리문과 함수를 작성합니다.

```sql
--> src/database/sql/insert_user.sql

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

```ts
// src/database/user.ts

...

import type { TokenPayload } from 'google-auth-library'

...

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

이제 api의 내용을 수정해서 해당 함수들이 적절히 동작할 수 있도록 수정합니다.

```ts
// src/routes/api/auth/callback.google.ts

import { createFileRoute, redirect } from '@tanstack/react-router'
import { getOAuthClient, verifyTokens } from '@/google/auth'
import { useAuthSession } from '@/session'
import { createUserByGoogle, getUserByGoogle } from '@/database/user'

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

이제 우리의 데이터베이스에는 유저와 계정 정보가 저장되고 이 데이터를 이용하여 session을 구성할 수 있습니다.