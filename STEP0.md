# 프로젝트 시작하기

### 프로그램 설치하기
학습을 시작하기 전에 아래 프로그램들을 설치합니다.
 - [Nodejs](https://nodejs.org/ko)
   - 22-LTS 버전을 설치하시길 바랍니다.
 - [VSC](https://code.visualstudio.com/)
 - [Git](https://git-scm.com/)

**명령 프롬프트**를 열고 아래 명령어를 실행합니다.
```bash
# 작업 폴더를 만들고 이동합니다.
mkdir .code && cd .code

# tanstack에서 제공하는 cli를 이용하여 프로젝트를 초기화 합니다.
npm create @tanstack/start@0.34.6

# 아래와 같이 제출합니다.
# Ok to proceed? y
# What would you like to name your project? my-web
# Would you like to use Tailwind CSS? yes
# Select toolchain? ESLint
# What add-ons would you like for your project? none
# Would you like any examples? none

# 프로젝트 폴더로 이동한 후 VSC를 실행합니다.
cd my-web && code .

# 애플리케이션을 실행합니다.
npm run dev
```

이제 브라우저(크롬 권장)를 열고 http://localhost:3000 로 이동합니다.   
애플리케이션이 올바르게 실행되는 것을 확인할 수 있습니다.   
이제 변경사항을 커밋하기 전에, 아래와 같이 파일을 수정합니다.
```
<!-- .gitignore -->
*.log
routeTree.gen.ts
```

간단하게 VSC에서 Source Control 탭을 활용하여 변경사항을 모두 스테이징하고 커밋을 저장합니다.  