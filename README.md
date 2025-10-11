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