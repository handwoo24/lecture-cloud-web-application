# 클라우드 SQL 시작하기

### PostgreSQL 생성하기
본격적으로 애플리케이션을 개발하기 전에, 먼저 데이터베이스를 설정합니다.   
여기서는 Cloud SQL 서비스를 이용하여 PostgreSQL 데이터베이스를 구성하고 애플리케이션과 연결합니다.   
먼저 [GCP Console](https://console.cloud.google.com/)으로 이동합니다.   
Cloud SQL을 검색하고 해당 메뉴로 이동합니다.
> 인스턴스 만들기 / PostgreSQL 선택
   
위 순서대로 메뉴를 이동합니다.   
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


이제 몇 분 후 인스턴스 구성이 완료됩니다.  
완료되면 연결 탭을 눌러 연결 정보를 확인합니다.  
이 정보를 이용하여 어플리케이션에서 데이터베이스를 사용할 수 있습니다.   

---
### 클라우드 SQL 연결하기
VSC 터미널을 열고 pg 라이브러리를 설치합니다.
```bash
npm install pg
npm install -D @types/pg
```
pg 라이브러리를 활용하여 Cloud SQL에 구성된 postgreSQL에 연결합니다.   
아래 경로에 파일을 생성하고 코드를 작성합니다.   
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
이제 코드에 사용한 환경변수들을 .env 파일에 정의합니다.
```   
POSTGRES_HOST=${YOUR_HOST} --> 여기서는 공개 IP의 주소를 입력합니다.
POSTGRES_USER="postgres"
POSTGRES_PASSWORD=${YOUR_PASSWORD} --> 인스턴스 생성당시 생성된 비밀번호를 입력합니다.
POSTGRES_DATABASE="postgres" 
```
이제 데이터베이스가 잘 연결되었는지 테스트 하기 위한 간단한 쿼리를 작성합니다.   
여기서는 SQL의 버전을 확인합니다.
```sql
-- src/database/sql/select_version.sql

SELECT version();
```
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
데이터베이스의 Pool에는 server 환경에서만 접근 가능하도록 **createServerOnlyFn**을 이용하여 정의합니다.   
이러면 client 환경에서 해당 함수를 호출할 수 없도록 방어합니다.
```ts
// src/server/database.ts

import { createServerFn } from '@tanstack/react-start'
import { getVersion } from '@/database/version'

export const getVersionFn = createServerFn({ method: 'GET' }).handler(
  getVersion,
)
```
앞서 **createServerOnlyFn**으로 정의한 server 함수를 client 환경에서 네트워크 요청할 수 있도록 **createServerFn**으로 정의합니다.   
server와 client의 네트워크 통신을 추상화하여 함수처럼 구현했기 때문에 손쉽게 사용할 수 있습니다.
```tsx
// src/routes/index.tsx

import { createFileRoute } from '@tanstack/react-router'
import { getVersionFn } from '@/server/database'

export const Route = createFileRoute('/')({
  component: App,
  loader() {
    return getVersionFn()
  },
})

function App() {
  const version = Route.useLoaderData()

  return <div>Database Version: {version}</div>
}
```
위와 같이 index.tsx 파일을 작성했다면 애플리케이션을 실행하여 데이터베이스의 버전정보가 렌더링 되는 것을 확인할 수 있습니다.
```bash
npm run dev
```

---
### App Hosting 배포 환경에서 Cloud SQL 연결하기
아래와 같이 apphosting 구성 파일을 수정합니다.
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
이제 firebase cli를 이용하여 환경 변수들을 보안 비밀로 추가합니다.   
여기서는 GCP의 Secret Manager를 이용하여 민감한 값들을 안전하게 사용할 수 있도록 설정합니다.   
VSC의 터미널에서 아래 명령어를 하나하나 실행합니다.   
다른 값들은 .env와 동일하게 작성하면 되지만,   
POSTGRES_HOST는 비공개 IP주소의 값을 입력해주세요.   
(Cloud SQL 콘솔에서 확인가능합니다.)

```bash
firebase apphosting:secrets:set ${변수이름}

# ex) firebase apphosting:secrets:set googleClientId

# 이후에는 .env의 값을 붙여넣기를 통해 입력하고 Enter를 누르세요.
# grant access에 대한 질문에 yes를 입력합니다.
# apphosting.yaml에 추가할 거냐고 묻는 질문에 올바르게(변수이름을) 입력해 주세요.
```
올바르게 값들을 입력한 후, app-hosting 구성파일은 아래와 같이 변경됩니다.
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
변경사항을 커밋하고 origin 리모트에 main 브랜치를 push합니다.   
새롭게 배포된 애플리케이션에서 데이터베이스 버전을 확인할 수 있습니다.