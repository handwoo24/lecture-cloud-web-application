# 클라우드 호스팅 배포하기

### Nitro 플러그인 설치하기  

학습하기 전에 [tanstack-start](https://tanstack.com/start/latest/docs/framework/react/hosting) 개발문서를 참고합니다.  
특히 [Nitro](https://tanstack.com/start/latest/docs/framework/react/hosting#nitro)를 이용한 호스팅 설정을 참고하세요.

VSC에서 터미널을 명령 프롬프트로 실행합니다.   
(터미널에서 기본 프로필을 powershell이 아닌 명령프롬프트로 수정해두면 용이합니다.)
```bash
npm install -D @tanstack/nitro-v2-vite-plugin
```
아래와 같이 vite 설정을 수정합니다.
```ts
// vite.config.ts
...
import { nitroV2Plugin } from '@tanstack/nitro-v2-vite-plugin'

const config = defineConfig({
  plugins: [
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
이렇게 플러그인에서 제공하는 preset을 적용하면 손쉽게 app-hosting을 빌드하고 배포할 수 있습니다. 

---
### Firebase-app-hosting 배포하기

이제 [Firebase Console](https://console.firebase.google.com/)에 접속합니다.  
구글 계정을 이용하여 로그인 합니다.  
**새 Firebase 프로젝트 만들기**를 클릭하여 프로젝트를 생성합니다.   
여기서는 ```my-firebase```라는 ID로 프로젝트를 생성합니다.  
(실제로는 ```my-firebase-{suffix}```의 형태로 생성됩니다.)   
이번에는 다시 VSC의 터미널로 돌아와서 firebase cli를 설치합니다.    
```bash
# firebase cli를 설치합니다.
npm install -g firebase-tools

# firebase 프로젝트를 초기화합니다.
firebase init

# 아래와 같이 제출합니다.
# Are you ready to proceed? y
# [*] App Hosting: Enable web app deployments with App Hosting
# Use an existing project? my-firebase-*
# Please select an option? Create a new backend
# Select a primary region to host your backend: asia-east1
# Provide a name for your backend? my-backend
```
초기화가 완료되면 아래와 같은 파일이 생성됩니다.
```yaml
# apphosting.yaml


# Settings for Backend (on Cloud Run).
# See https://firebase.google.com/docs/app-hosting/configure#cloud-run
runConfig:
  minInstances: 0
  # maxInstances: 100
  # concurrency: 80
  # cpu: 1
  # memoryMiB: 512

# Environment variables and secrets.
# env:
  # Configure environment variables.
  # See https://firebase.google.com/docs/app-hosting/configure#user-defined-environment
  # - variable: MESSAGE
  #   value: Hello world!
  #   availability:
  #     - BUILD
  #     - RUNTIME

  # Grant access to secrets in Cloud Secret Manager.
  # See https://firebase.google.com/docs/app-hosting/configure#secret-parameters
  # - variable: MY_SECRET
  #   secret: mySecretRef
```
여기까지 작업을 완료하면 변경사항을 스테이징하고 커밋합니다.   
현재 작업중인 브랜치(main)을 확인하고 GitHub 레포지토리에 push 합니다.   
```bash
# GitHub에 로그인 한 후, my-web이라는 이름으로 레포지토리를 생성합니다.
# 해당 레포지토리의 https 주소를 복사해서 아래 {URL} 대신에 붙여넣고 실행합니다.
git remote add origin {URL}

# origin 리모트(GitHub 레포지토리)로 main 브랜치를 push합니다.
git push -u origin main
```

이제 **Firebase Console**로 이동해서 GitHub 레포지토리에 있는 소스코드로 배포를 진행합니다.
> 빌드 / App Hosting / my-backend(보기) / 설정 / 배포   

순서대로 메뉴를 이동하여 Github 계정을 연결하고 레포지토리를 선택합니다.   
main 브랜치를 선택하고 **저장 및 배포**를 클릭합니다.  
몇 분 지나면 배포된 애플리케이션과 URL을 확인할 수 있습니다.