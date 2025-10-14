# DIY 개발 레시피 - 클라우드 웹 어플리케이션

## 목차
 0. 환경설정
 1. 클라우드 호스팅 구성하기
 2. 클라우드 SQL 구성하기
 3. 구글 로그인 구현하기
 4. 데이터베이스 활용하기
 5. UI 구현하기



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


### [클라우드 호스팅 구성하기](https://github.com/handwoo24/lecture-cloud-web-application/tree/step-1)


#### 챕터에 등장하는 개념들
각 개념들에 대해 찾아보거나 Gemini에게 질문하여 먼저 학습하세요.
해당 내용들에 대해 인지하고 실습을 따라하시면 보다 쉽게 따라하실 수 있습니다.
 - 클라우드(Cloud)
 - 구글 클라우드 플랫폼(Google Cloud Platform)
 - 앱 호스팅(App Hosting)


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

### [클라우드 SQL 구성하기](https://github.com/handwoo24/lecture-cloud-web-application/tree/step-2)

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

### [구글 로그인 구현하기](https://github.com/handwoo24/lecture-cloud-web-application/tree/step-3)

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


### [데이터베이스 활용하기](https://github.com/handwoo24/lecture-cloud-web-application/tree/step-4)
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

### [UI 구현하기](https://github.com/handwoo24/lecture-cloud-web-application/tree/step-5)

#### 플러그인 설치
지금까지 작성된 어플리케이션에 간단한 UI를 추가해봅니다.
여기서는 pre-designed된 컴포넌트를 활용하기 위해 tailwindcss 플러그인 중의 [daisyui](https://daisyui.com/)를 사용합니다.
아래 라이브러리를 설치합니다.

```bash
npm install -D daisyui@latest
```

설치된 플러그인을 사용하기 위해 글로벌 css 파일을 수정해줍니다.

```css
/* src/styles.css */

@import 'tailwindcss';
@plugin "daisyui";

```

#### 레이아웃 구성하기
이제 어플리케이션 전반에 사용되는 navbar를 작성해봅니다.
daisyui의 [navbar 예제](https://daisyui.com/components/navbar/)를 하나 복사합니다.
아래 경로에 파일을 생성하고 다음과 같이 코드를 작성합니다.

```tsx
// src/components/Navbar.tsx

export const Navbar = () => {
  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl">daisyUI</a>
      </div>
      <div className="flex-none">
        <button className="btn btn-square btn-ghost">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="inline-block h-5 w-5 stroke-current"
          >
            {' '}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
            ></path>{' '}
          </svg>
        </button>
      </div>
    </div>
  )
}
```

이제 이 Navbar를 렌더링 하기 위해 파일 라우트를 구성해야 합니다.
지금 만드는 파일은 실제로는 URL주소를 할당하지 않는 레이아웃만을 구성합니다.
설명하기 전에, 아래 파일을 먼저 작성해주세요.

```tsx
// src/routes/_navbar.tsx

import { Outlet, createFileRoute } from '@tanstack/react-router'
import { Navbar } from '@/components/Navbar'

export const Route = createFileRoute('/_navbar')({
  component: LayoutComponent,
})

function LayoutComponent() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  )
}
```

그리고 src/routes/index.tsx 파일의 위치를 아래 경로로 수정해 줍니다.
> src/routes/_navbar/index.tsx
_navbar.tsx파일을 작성하고 **Outlet**을 해당 컴포넌트에서 렌더링 하게되면,
_navbar 폴더 하위로 생성되는 endpoint 페이지들은 **Outlet**의 위치에 렌더링 됩니다.
여기서는 index.tsx, 메인 페이지가 _navbar에 작성된 레이아웃 아래로 렌더링 되는 것입니다.
어플리케이션을 실행해 보면 확인하실 수 있습니다.
이제, 복사했던 daisyui의 예제를 우리 어플리케이션에 맞게 수정합니다.

#### UI 예제 구현하기

이 예제에서는 상품 목록 페이지를 구현해 보겠습니다.
그리드 형태의 상품 목록이 화면에 표시되도록 하고,
몇가지 필터와 간단한 검색 구현을 추가합니다.
일단 복잡한 기능을 구현하기 전에 간단하게 컴포넌트를 배치해 봅니다.
daisyui의 sample 중에서 [label](https://daisyui.com/components/label/), [card](https://daisyui.com/components/card/), [filter](https://daisyui.com/components/filter/)를 사용하여 해당 화면을 작성합니다.
아래 코드를 참고해 주세요.
```tsx
// src/routes/_navbar/index.tsx

import { createFileRoute } from '@tanstack/react-router'
import { Search } from 'lucide-react'

export const Route = createFileRoute('/_navbar/')({
  component: App,
  loader() {},
})

function App() {
  return (
    <main>
      <div>
        <label className="input">
          <input type="search" placeholder="domain name" />
          <span className="label">
            <Search />
          </span>
        </label>
        <form className="filter">
          <input className="btn btn-square" type="reset" value="×" />
          <input
            className="btn"
            type="radio"
            name="frameworks"
            aria-label="Svelte"
          />
          <input
            className="btn"
            type="radio"
            name="frameworks"
            aria-label="Vue"
          />
          <input
            className="btn"
            type="radio"
            name="frameworks"
            aria-label="React"
          />
        </form>
      </div>
      <div className="grid">
        <div className="card bg-base-100 w-96 shadow-sm">
          <figure>
            <img
              src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
              alt="Shoes"
            />
          </figure>
          <div className="card-body">
            <h2 className="card-title">Card Title</h2>
            <p>
              A card component has a figure, a body part, and inside body there
              are title and actions parts
            </p>
            <div className="card-actions justify-end">
              <button className="btn btn-primary">Buy Now</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
```

싫행시켜보면 각 컴포넌트들이 수직으로 배치된 것을 확인할 수 있습니다.
이제 이 컴포넌트들을 정리하고 적절한 위치에 배치합니다.
tailwind css를 이용하여 각 컴포넌트를 스타일링 합니다.
아래처럼 적당히 배치할 수 있습니다.

```tsx
// src/routes/_navbar/index.tsx

function App() {
  return (
    <main className="p-4">
      <div className="flex gap-2 md:flex-row-reverse md:justify-between flex-col">
        <label className="input w-full md:max-w-sm">
          <input type="search" placeholder="상품명으로 검색하세요." />
          <span className="label">
            <Search />
          </span>
        </label>
        <form className="filter">
          <input className="btn btn-square" type="reset" value="×" />
          <input
            className="btn"
            type="radio"
            name="frameworks"
            aria-label="운동화"
          />
          <input
            className="btn"
            type="radio"
            name="frameworks"
            aria-label="티셔츠"
          />
        </form>
      </div>
      <div className="divider" />
      <div className="grid">
        <div className="card bg-base-100 w-96 shadow-sm hover:bg-base-content/5 transition-colors cursor-pointer">
          <figure>
            <img
              src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
              alt="Shoes"
            />
          </figure>
          <div className="card-body">
            <h2 className="card-title">나XX 운동화</h2>
            <p>
              이번 시즌 최고의 운동화. 편안한 착용감과 세련된 디자인을
              자랑합니다.
            </p>
            <div className="card-actions justify-end">
              <button className="btn btn-primary">구매하기</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
...

```

개발자 콘손을 열어서 확인해 보세요.
device를 모바일 크기에 맞추어도 간단한 반응형 레이아웃이 적용되는 것을 확인할 수 있습니다.
사실 실무 수준에서는 css를 이렇게 하나하나 입력하지 않고,
사전에 디자이너와 협업하여 각 요소를 적당한 수준으로 정의하고
요소의 스타일을 미리 정의하여 사용합니다.
그 수준은 팀별로 매우 다르기 때문에, 여기서는 업무 방향에 대한 예시만 적용하고 넘어가겠습니다.
아래 처럼 글로벌 css 파일을 열고 수정합니다.

```css
/* src/styles.css */


...

main {
  /* 이 어플리케이션에서는 main 컨테이너의 padding을 항상 4로 설정합니다. */
  @apply p-4 md:p-6 lg:p-8;
}

@utility product-control-bar {
  /* 상품 검색 및 필터링 컴포넌트 */
  @apply flex gap-2 md:flex-row-reverse md:justify-between flex-col;
}

@utility product-card {
  /* 상품 카드 컴포넌트 */
  @apply card bg-base-100 w-full md:w-96 shadow-sm hover:bg-base-content/5 transition-colors cursor-pointer;
}

.product-card .card-actions {
  @apply justify-end;
}


```

그리고 정의한 컴포넌트 classname을 적용합니다.

```tsx
// src/routes/_navbar/index.tsx


function App() {
  return (
    <main>
      <div className="product-control-bar">
        <label className="input w-full md:max-w-sm">
          <input type="search" placeholder="상품명으로 검색하세요." />
          <span className="label">
            <Search />
          </span>
        </label>
        <form className="filter">
          <input className="btn btn-square" type="reset" value="×" />
          <input
            className="btn"
            type="radio"
            name="category"
            aria-label="운동화"
          />
          <input
            className="btn"
            type="radio"
            name="category"
            aria-label="티셔츠"
          />
        </form>
      </div>
      <div className="divider" />
      <div className="grid">
        <div className="product-card">
          <figure>
            <img
              src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
              alt="Shoes"
            />
          </figure>
          <div className="card-body">
            <h2 className="card-title">나XX 운동화</h2>
            <p>
              이번 시즌 최고의 운동화. 편안한 착용감과 세련된 디자인을
              자랑합니다.
            </p>
            <div className="card-actions">
              <button className="btn btn-primary">구매하기</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

```

아직 별다른 동작은 하지 못하지만, 간단한 UI를 배치해 보았습니다.
검색과 필터의 동작은 아주 간단하니 조금만 구현해봅니다.

...

#### UI 기능 구현하기

조금 전에 구현한 UI에 적용될 기능들을 정리해 봅니다.
 - 상품명을 검색하면 URL 파라미터로 조건을 전달하는 제출 기능
 - 필터를 클릭하면 URL 파라미터로 조건을 전달하는 제출 기능
 - 조건에 따라 상품을 조회하고 화면에 그리는 기능(데이터베이스)
 - 상품을 누르면 결제 팝업을 여는 기능(결제 API 연동)
이 중 간단한 2개의 기능만 먼저 구현해 봅니다.

아래처럼 코드를 수정해주세요.
```tsx
// src/routes/_navbar/index.tsx

import { createFileRoute } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { z } from 'zod'
import type { FormEvent } from 'react'

enum ZodCategory {
  Shoes = 'shoes',
  Tshirts = 'tshirts',
}

const zodCategorySchema = z.nativeEnum(ZodCategory)

export const Route = createFileRoute('/_navbar/')({
  component: App,
  loader() {},
  // URL 쿼리 파라미터를 검증합니다.
  validateSearch: z.object({
    name: z.string().optional(),
    category: zodCategorySchema.optional(),
  }),
})

function App() {
  const { name, category } = Route.useSearch()
  const navigate = Route.useNavigate()

  const handleSubmitFilter = (e: FormEvent<HTMLFormElement>) => {
    // form의 값 변경을 감지하여 url 쿼리 파라미터를 변경합니다.
    const formData = new FormData(e.currentTarget)
    const value = zodCategorySchema.parse(formData.get('category'))
    navigate({ to: '/', search: { category: value, name } })
  }

  const handleSubmitSearch = (e: FormEvent<HTMLFormElement>) => {
    // form의 기본 제출을 막습니다.
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const value = z.string().parse(formData.get('name'))
    navigate({
      to: '/',
      search: { category, name: value === '' ? undefined : value },
    })
  }

  const handleResetFilter = () => {
    navigate({ to: '/', search: { category: undefined, name } })
  }

  return (
    <main>
      <div className="product-control-bar">
        <form className="w-full md:max-w-sm" onSubmit={handleSubmitSearch}>
          <label className="input w-full">
            <input
              name="name"
              type="search"
              defaultValue={name}
              placeholder="상품명으로 검색하세요."
            />
            <span className="label">
              <Search />
            </span>
          </label>
        </form>
        <form
          className="filter"
          onChange={handleSubmitFilter}
          onReset={handleResetFilter}
        >
          <input className="btn btn-square" type="reset" value="×" />
          <input
            className="btn"
            type="radio"
            name="category"
            value="shoes"
            defaultChecked={search.category === Category.Shoes}
            aria-label="신발"
          />
          <input
            className="btn"
            type="radio"
            name="category"
            value="tshirts"
            defaultChecked={search.category === Category.Tshirts}
            aria-label="티셔츠"
          />
        </form>
      </div>
      <div className="divider" />
      <div className="grid">
        <div className="product-card">
          <figure>
            <img
              src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
              alt="Shoes"
            />
          </figure>
          <div className="card-body">
            <h2 className="card-title">나XX 운동화</h2>
            <p>
              이번 시즌 최고의 운동화. 편안한 착용감과 세련된 디자인을
              자랑합니다.
            </p>
            <div className="card-actions">
              <button className="btn btn-primary">구매하기</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

```

이렇게 form을 이용하여 이벤트 핸들러를 정의함으로써,
필터와 검색기능을 활용할 수 있게 각 값을 URL 쿼리 파라미터로 전달할 수 있습니다.
다음 작업을 진행하기 전에, 이번에 정의한 3개의 이벤트 핸들러를 조금 수정하겠습니다.
아래와 같이 코드 리팩토링을 진행합니다.

```tsx
// src/routes/_navbar/index.tsx


const parseFormValue = (form: HTMLFormElement, name: string) => {
  const formData = new FormData(form)
  return formData.get(name)
}

function App() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const updateSearchParams = useCallback(
    (searchParams: typeof search) =>
      navigate({ to: '/', search: searchParams }),
    [navigate],
  )

  const handleSubmitFilter = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      const formValue = parseFormValue(e.currentTarget, 'category')
      const category = zodCategorySchema.parse(formValue)
      updateSearchParams({ ...search, category })
    },
    [navigate, search],
  )

  const handleSubmitSearch = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      const formValue = parseFormValue(e.currentTarget, 'name')
      const name = z.string().parse(formValue)
      updateSearchParams({ ...search, name: name === '' ? undefined : name })
    },
    [navigate, search],
  )

  const handleResetFilter = useCallback(() => {
    updateSearchParams({ ...search, category: undefined })
  }, [navigate, search])

  ...
}
```

이렇게 각 이벤트 핸들러의 내부 구현을 추상화함으로써 중복된 코드를 두개의 함수로 나누어 구현했습니다.
각 이벤트 핸들러의 동작을 보다 직관적으로 표현하려고 시도한 의도입니다.
리팩토링에 정답은 없습니다.
실무에서는 팀원들 간의 논의(코드리뷰)를 통하여 개선방향을 정하고 그에 맞게 작성하려고 노력하는 태도가 중요합니다.

어플리케이션을 실행하고 필터와 검색의 동작을 테스트합니다.
올바르게 동작하고 URL 쿼리 파라미터도 업데이트 되는 것을 확인하실 수 있습니다.
왜 필터나 검색같은 조건 값을 URL 쿼리 파라미터로 전달하려고 할까요?
아직 상품에 대한 테이블을 생성하지 않았지만,
우리는 이제 상품에 대한 테이블을 만들고 샘플로 몇가지 상품을 만들어 볼 예정입니다.
이 상품 목록 페이지가 렌더링 되기 전에, 서버는 URL 파라미터로 전달된 조건 값을 확인하고 SQL 쿼리에 해당 값을 전달하여 클라이언트에 필터링된 데이터들을 전달하게 됩니다.
이러한 과정을 수행하기 위해 클라이언트의 동작이 서버도 알 수 있는 URL 쿼리 파라미터로 전달되는 것입니다.

#### 상품 테이블 추가하기

이번에는 SQL 데이터베이스에 새로운 테이블 스키마를 생성하고 몇가지 데이터를 추가해 봅니다.
먼저 스키마를 설계해 봅니다.
간단하게 zod로 작성해보면 아래와 같습니다.
```ts
// src/model/product.ts

import { z } from 'zod'

export enum Category {
  Shoes = 'shoes',
  Tshirts = 'tshirts',
}

export const zodCategorySchema = z.nativeEnum(Category)

export const zodProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: zodCategorySchema,
  price: z.number(),
  picture: z.string().url(),
  stock: z.number(),
  description: z.string(),
})

export type Product = z.infer<typeof zodProductSchema>

```

이제 이 스키마를 바탕으로 테이블을 생성 쿼리를 작성합니다.
**Cloud SQL Studio**를 열고 아래 쿼리문을 실행합니다.

```sql

-- Step 1: Create a custom ENUM type for product categories if it doesn't already exist.
-- ENUM 타입을 사용하면 'shoes' 또는 'tshirts' 외의 다른 값이 들어오는 것을 데이터베이스 수준에서 막을 수 있습니다.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_category') THEN
        CREATE TYPE product_category AS ENUM ('shoes', 'tshirts');
    END IF;
END$$;

-- Step 2: Create the products table if it doesn't already exist.
CREATE TABLE IF NOT EXISTS products (
  -- id: BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY로 수정
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  
  -- name: z.string() -> TEXT, not nullable
  name TEXT NOT NULL,
  
  -- category: zodCategorySchema -> product_category ENUM, not nullable
  category product_category NOT NULL,
  
  -- price: z.number() -> NUMERIC for precision, not nullable, must be non-negative
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  
  -- picture: z.string().url() -> TEXT, not nullable
  picture TEXT NOT NULL,
  
  -- stock: z.number() -> INTEGER, not nullable, defaults to 0, must be non-negative
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  
  -- description: z.string() -> TEXT, can be nullable
  description TEXT,

  -- Best practice: add a timestamp for when the record was created
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

추후 마이그레이션에 사용할 수 있으니, **migration0002-create_products** 라는 이름으로 쿼리문을 저장합니다.
이제 예시 데이터를 생성해보겠습니다.
새 쿼리를 열고 아래 SQL문을 실행합니다.

```sql

-- 이 스크립트는 'products' 테이블에 샘플 데이터를 추가합니다.
--
-- 주의: 이 스크립트는 실행 시 'products' 테이블의 모든 기존 데이터를 삭제합니다.
-- 개발 및 테스트 환경에서만 사용하는 것을 권장합니다.

-- 기존 데이터를 모두 삭제하여 깨끗한 상태에서 시작합니다.
-- RESTART IDENTITY 옵션은 자동 증가하는 id 카운터를 1로 초기화합니다.
TRUNCATE TABLE products RESTART IDENTITY CASCADE;

-- 샘플 제품 데이터를 삽입합니다.
INSERT INTO products (name, category, price, picture, stock, description) VALUES
(
  'XX 런닝화',
  'shoes',
  68000,
  'https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp',
  10,
  '가볍고 편안한 착용감의 런닝화. 다양한 색상과 사이즈로 제공됩니다.'
),
(
  'YY 티셔츠',
  'tshirts',
  38000,
  'https://imgproxy.fourthwall.com/aCf7aQYy2xOgGK0mpblRpHNMruzpqTQcM0E8_G92aEQ/w:720/sm:1/enc/a2eII6EaUM22lElT/co-pyN-4BPzVAVSo/IpsZUju54feSsaeO/u01Yy3krbETm4joT/w0VjChcYKb87fiVp/8pmdoT1MX1rjluOC/przASlorbUyweHTa/YmzNlOQTJ-1OH4NB/A1i5Ke3ZotafJpdb/D4N_dMAbg1ncFCYW/hVoiIH_tntQAtoPR/55uM_hr4eTqEm-fM/d4UI0yQEA90kyD7g/IcS9Gt8gRptSIxmj/JQetld_aCwY',
  7,
  '부드러운 면 소재로 제작된 기본 티셔츠. 다양한 색상과 사이즈로 제공됩니다.'
),
(
  'ZZ 티셔츠',
  'tshirts',
  59000,
  'https://imgproxy.fourthwall.com/xohTiCJxyOKvA1xllWiGoHvJxPUf7g1TCZPtD_BbA3w/w:720/sm:1/enc/xe3vmjHVIGPrq5U6/4jZ8s8mnU_ExtmQB/NYJ_dPq_U4d2MDFX/X__whxwsanZEwrZu/FvsVojfSjbZdAS8z/JY22l8NYNu3mgJ9r/YCRqEK9Eius8jULy/LJfjQaSYmnIA9hgL/RYaaow5EW6QuSAhM/0xQlFxihTuJxy7wg/FW2_rl2ztjJGqkzr/fz60FUp69reth5SA/5gEwb-DJ7J2Gl_36/Z7EF7JcpYvp8Q50U/3WC5843hN4k',
  22,
  '편안한 핏과 스타일리시한 디자인의 티셔츠. 다양한 색상과 사이즈로 제공됩니다.'
);

```

해당 쿼리도 **insert_sample_products** 라는 이름으로 저장합니다.
이제 다시 VSCode로 돌아와서 해당 데이터를 불러올 수 있도록 구현해 봅니다.
아래처럼 SQL문과 해당 쿼리를 실행하는 함수를 작성합니다.

```sql
--> src/database/sql/select_products.sql

-- 'products' 테이블에서 카테고리와 이름(선택 사항)으로 제품을 조회합니다.
-- 파라미터가 제공되지 않은 경우(NULL), 해당 조건은 무시됩니다.
SELECT
  *
FROM
  products
WHERE
  -- 1. 카테고리 필터링: $1 (카테고리)이 NULL이거나, category 값이 $1과 일치하는 경우
  ($1::text IS NULL OR category = $1::product_category)
  
  -- 2. 이름 필터링: $2 (이름)가 NULL이거나, name 값이 $2 패턴을 포함하는 경우 (대소문자 무시)
  AND ($2::text IS NULL OR name ILIKE '%' || $2 || '%');


```

```ts
// src/database/product.ts

import { createServerOnlyFn } from '@tanstack/react-start'
import selectProductsQuery from './sql/select_products.sql?raw'
import { getPool } from './config'
import type { Product } from '@/model/product'
import { zodProductSchema } from '@/model/product'

export const getProducts = createServerOnlyFn(
  async ({ name, category }: Partial<Pick<Product, 'name' | 'category'>>) => {
    try {
      const pool = getPool()
      const res = await pool.query(selectProductsQuery, [name, category])
      return zodProductSchema.array().parse(res.rows)
    } catch (error) {
      throw new Error('Failed to get products: ' + error)
    }
  },
)
```

그리고 이제 상품 목록 페이지에서 해당 함수를 실행하도록 다음과 같이 수정합니다.

```tsx
// src/routes/_navbar/index.tsx

import { createFileRoute } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { z } from 'zod'
import { useCallback } from 'react'
import { createServerFn } from '@tanstack/react-start'
import type { FormEvent } from 'react'
import { Category, zodCategorySchema } from '@/model/product'
import { getProducts } from '@/database/products'

const validateSearch = z.object({
  name: z.string().optional(),
  category: zodCategorySchema.optional(),
})

const loaderFn = createServerFn({ method: 'GET' })
  .inputValidator(validateSearch)
  .handler(async (ctx) => {
    const products = await getProducts(ctx.data)
    return { products }
  })

export const Route = createFileRoute('/_navbar/')({
  component: App,
  loader(ctx) {
    const search = validateSearch.parse(ctx.location.search)
    return loaderFn({ ...ctx, data: search })
  },
  validateSearch,
})

const parseFormValue = (form: HTMLFormElement, name: string) => {
  const formData = new FormData(form)
  return formData.get(name)
}

function App() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const { products } = Route.useLoaderData()

  ...

}
```

그리고 실행해보면 에러가 발생하면서 화면이 렌더링 되지 않습니다.
이유는 **zodProductsSchema**에 price를 number로 정의했는데,
이 js의 number타입이 psql의 numeric과 일치하지 않기 때문입니다.
js는 numeric을 string으로 읽습니다.
따라서 zodSchema에서 price를 z.string으로 수정해줍니다.
```ts
// src/model/product.ts


import { z } from 'zod'

export enum Category {
  Shoes = 'shoes',
  Tshirts = 'tshirts',
}

export const zodCategorySchema = z.nativeEnum(Category)

export const zodProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: zodCategorySchema,
  price: z.string(),
  picture: z.string().url(),
  stock: z.number(),
  description: z.string(),
})

export type Product = z.infer<typeof zodProductSchema>

```

다시 실행해보면 올바르게 페이지가 렌더링 됩니다.
이제 이 상품 목록을 그리드에 나오도록 코드를 수정합니다.

```tsx
// src/routes/_navbar/index.tsx

function App() {
  
  ...

  return (
    <main>
      
      ...

      <div className="grid">
        {products.map((product) => (
          <div className="product-card" key={product.id}>
            <figure>
              <img src={product.picture} alt="Shoes" />
            </figure>
            <div className="card-body">
              <h2 className="card-title">{product.name}</h2>
              <p>{product.description}</p>
              <div className="card-actions">
                <button className="btn btn-primary">구매하기</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}


```

그러면 그리드에 수직으로 상품들이 노출되는 것을 확인하실 수 있습니다.
필터와 검색도 사용해보면 올바르게 동작하고 있습니다.
이제 표시되지 않는 가격을 추가하고 그리드와 카드 아이템의 스타일을 조금 수정하겠습니다.

```css
/* src/styles.css */

...

.product-card > figure > img {
  @apply object-cover aspect-video;
}

.grid:has(> .product-card) {
  @apply grid-cols-[repeat(auto-fit,minmax(192px,1fr))] gap-1;
}

```

```tsx
// src/routes/_navbar/index.tsx

function App() {
  
  ...

  return (
    <main>
      
      ...

      <div className="grid">
        {products.map((product) => (
          <div className="product-card" key={product.id}>
            <figure>
              <img src={product.picture} alt="Shoes" />
            </figure>
            <div className="card-body">
              <h2 className="card-title">{product.name}</h2>
              <p>{product.description}</p>
              <div className="card-actions">
                <button className="btn btn-primary">{product.price}원</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}

```

여기까지 해서 상품 목록 페이지를 구현해 보았습니다.
상품클릭시 구매 이벤트를 구현하기 전에, 
실제로 실무에서 문자열을 화면에 표시하는 방법과 다국어 설정에 관한 부분을 실습해보겠습니다.

### [다국어 설정하기](https://github.com/handwoo24/lecture-cloud-web-application/tree/step-6)