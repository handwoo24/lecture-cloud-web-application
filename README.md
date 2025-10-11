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
