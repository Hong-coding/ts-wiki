---
title: 개발 환경 설치 (Node.js · VS Code · Git)
---

# 개발 환경 설치 (Node.js · VS Code · Git)

<LessonMeta level="입문" :minutes="60" prev="TypeScript는 실행 전에 타입을 검사해 버그를 미리 막아 준다" />

## 이번에 배울 것

- Node.js LTS 버전을 설치하고 `node -v`, `npm -v`로 설치를 확인할 수 있다.
- VS Code를 설치하고 추천 확장 네 가지(Korean Language Pack, ESLint, Prettier, Error Lens)를 설치할 수 있다.
- Git을 설치하고 `git config`로 이름·이메일을 처음 설정할 수 있다.
- 터미널(PowerShell)을 열고 `cd`, `ls`(`dir`), `mkdir`로 폴더를 이동하고 만들 수 있다.
- 설치가 잘 안 될 때 가장 흔한 원인 세 가지를 확인할 수 있다.

## 먼저 알아 둘 것

- [프로그래밍과 JavaScript, 그리고 TypeScript](./01-what-is-programming): Node.js가 무엇인지
- 인터넷에 연결된 PC와 **관리자 권한**(프로그램을 설치할 수 있는 권한)이 필요합니다. 회사 PC는 보안 정책 때문에 설치가 막혀 있을 수 있으니, 그럴 때는 사내 IT 담당자에게 문의하세요.
- 설치가 부담스럽다면 [TS Playground](./04-playground)를 먼저 해도 됩니다.

::: warning 버전 표기에 대해
이 레슨의 버전 번호와 화면 설명은 **작성 시점(2026-10) 기준**입니다. 프로그램은 자주 업데이트되므로 버튼 이름이나 위치, 버전 숫자가 조금 다를 수 있습니다. 그래서 각 설치 단계마다 **직접 확인하는 명령**을 함께 드립니다. 숫자가 이 문서와 달라도 확인 명령이 정상적으로 버전을 보여 주면 성공입니다.
:::

## 비유로 이해하기

### 요리를 시작하기 전에 주방부터 꾸민다

1번 레슨에서 컴퓨터를 요리사에, 프로그램을 레시피에 비유했습니다. 이제 실제로 요리를 하려면 주방이 필요합니다.

| 주방 도구 | 개발 도구 | 하는 일 |
|---|---|---|
| 가스레인지 | **Node.js** | JavaScript를 실제로 실행합니다. TypeScript 컴파일러도 이 위에서 돌아갑니다. |
| 조리대와 칼 | **VS Code** | 코드를 쓰고 고치는 작업 공간입니다. |
| 레시피 노트의 수정 기록 | **Git** | 코드를 언제 어떻게 바꿨는지 기록하고, 필요하면 예전으로 되돌립니다. |
| 주방의 인터폰 | **터미널** | 글자로 명령을 내려 도구들을 움직입니다. |

가스레인지 없이 요리할 수 없듯이, Node.js 없이는 5번 레슨부터의 예제를 실행할 수 없습니다. 하나씩 차근차근 설치해 봅시다.

## 개념 설명

### 0단계: 터미널부터 알아 두기

설치 중간중간 "설치가 됐는지 확인"하려면 **터미널**을 써야 합니다. 그래서 터미널을 먼저 소개합니다.

**터미널(terminal)**은 마우스 대신 **글자로 명령을 입력해** 컴퓨터를 조작하는 창입니다. "명령 프롬프트", "콘솔", "셸(shell)", "CLI(Command Line Interface, 명령줄 인터페이스)"라고도 부릅니다. 개발 도구 대부분이 터미널 명령으로 동작하기 때문에 꼭 익숙해져야 합니다.

#### Windows에서 PowerShell 열기

Windows에는 **PowerShell(파워셸)**이라는 터미널이 기본으로 들어 있습니다.

1. 키보드의 `Windows` 키(깃발 모양)를 누릅니다.
2. `powershell` 또는 `터미널`이라고 입력합니다.
3. 검색 결과에 **Windows PowerShell** 또는 **터미널**이 보이면 클릭합니다.

검은색(또는 짙은 파란색) 창이 열리고, 대략 이런 글자가 보입니다.

```text
Windows PowerShell
Copyright (C) Microsoft Corporation. All rights reserved.

PS C:\Users\minji>
```

- `PS`는 지금 PowerShell을 쓰고 있다는 표시입니다.
- `C:\Users\minji`는 **현재 위치한 폴더**입니다. `minji` 부분에는 여러분의 Windows 사용자 이름이 보입니다.
- `>` 뒤에서 커서가 깜빡입니다. 여기에 명령을 입력하고 `Enter`를 누릅니다.

이 `PS C:\Users\minji>` 부분을 **프롬프트(prompt)**라고 합니다. "명령을 입력하세요"라고 재촉하는(prompt) 표시라는 뜻입니다.

::: tip 이 위키의 명령 표기
이 위키에서 터미널 명령은 아래처럼 `bash` 코드 블록으로 보여 줍니다. 프롬프트(`PS C:\...>`)는 빼고 **명령만** 적으니, 블록 안의 글자만 그대로 입력하세요.

```bash
node -v
```
:::

#### macOS에서 터미널 열기

`Command + Space`를 눌러 Spotlight 검색을 열고 `터미널`(또는 `Terminal`)을 입력해 실행합니다. 프롬프트는 `minji@MacBook ~ %`처럼 보입니다. 이 레슨의 명령은 macOS에서도 대부분 그대로 쓸 수 있습니다.

### 1단계: Node.js 설치

#### LTS 버전이란?

Node.js 공식 사이트에는 버전이 여러 개 보입니다. 그중 **LTS**를 고릅니다.

- **LTS(Long Term Support, 장기 지원)**: 오랫동안 보안 패치와 버그 수정을 해 주기로 약속한 안정 버전입니다. 회사와 학습용 모두 이것을 씁니다.
- **Current(최신)**: 새 기능을 먼저 넣은 버전입니다. 새 기능을 시험할 때 씁니다.

Node.js는 **짝수 번호**(20, 22, 24 …) 버전이 LTS가 됩니다. 작성 시점(2026-10)에는 24.x가 LTS로 널리 쓰이고 있으며, 시기에 따라 더 높은 짝수 버전이 LTS로 표시될 수 있습니다. **사이트에 "LTS"라고 표시된 버전을 고르면 됩니다.**

#### Windows 설치 순서

1. 웹 브라우저로 Node.js 공식 사이트 [https://nodejs.org](https://nodejs.org) 에 접속합니다. 주소를 꼭 확인하세요. 비슷한 이름의 가짜 사이트에서 받으면 위험합니다.
2. 첫 화면이나 **Download** 메뉴에서 **LTS** 버전의 **Windows Installer (.msi)** 를 받습니다. 대부분의 PC는 `x64`를 고르면 됩니다. (ARM 프로세서 노트북이라면 `ARM64`)
3. 다운로드한 `node-v24.x.x-x64.msi` 같은 이름의 파일을 더블클릭합니다.
4. 설치 마법사가 열리면 아래처럼 진행합니다.
   - **Welcome** 화면: `Next`
   - **End-User License Agreement**(사용권 계약): 내용을 확인하고 `I accept the terms in the License Agreement`에 체크한 뒤 `Next`
   - **Destination Folder**(설치 폴더): 기본값(`C:\Program Files\nodejs\`) 그대로 `Next`
   - **Custom Setup**(구성 요소 선택): 기본값 그대로 `Next`. 여기에 `Add to PATH`가 포함되어 있는데, 이것이 꺼지면 터미널에서 `node` 명령을 찾지 못하니 건드리지 않습니다.
   - **Tools for Native Modules**(네이티브 모듈 도구): "필요한 도구를 자동으로 설치" 체크 상자가 보입니다. 이 위키의 내용에는 필요 없으므로 **체크하지 않고** `Next`를 누르면 됩니다.
   - **Ready to install**: `Install`. Windows가 "이 앱이 디바이스를 변경하도록 허용하시겠어요?"라고 물으면 `예`를 누릅니다.
   - **Completed**: `Finish`
5. **이미 열려 있던 터미널 창은 모두 닫고**, PowerShell을 새로 엽니다. (이유는 아래 "PATH" 설명을 보세요.)

#### 설치 확인

새로 연 PowerShell에 아래 명령을 하나씩 입력합니다.

```bash
node -v
```

```text
v24.11.0
```

```bash
npm -v
```

```text
11.6.1
```

- `node -v`는 "Node.js의 버전(version)을 보여 줘"라는 명령입니다. `v`로 시작하는 버전 번호가 나오면 성공입니다.
- `npm -v`는 npm의 버전을 보여 줍니다. **npm(Node Package Manager)**은 Node.js와 함께 자동으로 설치되는 도구로, 다른 사람이 만든 프로그램 조각(**패키지**, package)을 내려받아 주는 "앱 스토어" 같은 역할을 합니다. TypeScript 컴파일러도 npm으로 설치합니다(5번 레슨).
- 위의 숫자는 예시입니다. **여러분 화면의 숫자가 달라도 괜찮습니다.** 숫자가 나오기만 하면 됩니다.

::: details PATH가 뭔가요? 왜 터미널을 새로 열어야 하나요?
터미널에 `node`라고 입력하면, 컴퓨터는 "`node`라는 프로그램이 어디 있지?" 하고 찾아야 합니다. 이때 뒤져 보는 폴더 목록이 **PATH(경로) 환경 변수**입니다.

Node.js 설치 프로그램은 PATH 목록에 `C:\Program Files\nodejs\`를 추가합니다. 그런데 이미 열려 있던 터미널은 **열릴 때의 PATH 목록**을 기억하고 있어서, 새로 추가된 내용을 모릅니다. 그래서 터미널을 새로 열어야 합니다. 그래도 안 되면 PC를 다시 시작해 보세요.
:::

#### macOS 설치 (짧게)

[https://nodejs.org](https://nodejs.org) 에서 LTS의 **macOS Installer (.pkg)** 를 받아 더블클릭하고, 안내에 따라 `계속` → `동의` → `설치`를 누릅니다. 설치 후 터미널을 새로 열고 `node -v`, `npm -v`로 확인합니다.

::: info 여러 버전을 오가야 한다면
회사에서 프로젝트마다 다른 Node.js 버전을 써야 할 때는 nvm-windows, fnm, Volta 같은 **버전 관리 도구**를 씁니다. 처음 배울 때는 필요 없습니다. 공식 설치 프로그램 하나면 충분합니다.
:::

### 2단계: VS Code 설치

**VS Code(Visual Studio Code)**는 Microsoft가 만든 무료 **코드 편집기**입니다. 메모장처럼 글자를 쓰는 프로그램이지만, 코드에 색을 입혀 주고(문법 강조), 자동완성을 해 주고, 에러에 빨간 밑줄을 그어 줍니다. TypeScript 자체가 Microsoft에서 만들어졌기 때문에 VS Code는 TypeScript 지원이 특히 뛰어나고, **TypeScript 지원이 기본으로 들어 있습니다.**

::: warning Visual Studio와 헷갈리지 마세요
"Visual Studio"(보라색 아이콘)는 C#·C++ 개발용으로 쓰는 다른 프로그램입니다. 우리가 설치할 것은 **Visual Studio Code**(파란색 아이콘)입니다.
:::

#### Windows 설치 순서

1. [https://code.visualstudio.com](https://code.visualstudio.com) 에 접속해 **Download for Windows** 버튼을 누릅니다. `VSCodeUserSetup-x64-1.xxx.x.exe` 같은 파일이 받아집니다.
2. 파일을 더블클릭해 설치를 시작합니다.
   - **사용권 계약**: 내용을 확인하고 `동의합니다`를 선택한 뒤 `다음`
   - **설치 위치**: 기본값 그대로 `다음`
   - **시작 메뉴 폴더**: 기본값 그대로 `다음`
   - **추가 작업 선택**: 여기가 중요합니다. 아래 항목을 확인하세요.
     - `PATH에 추가(다시 시작한 후 사용 가능)` — **반드시 체크**(보통 기본으로 체크되어 있습니다). 터미널에서 `code` 명령을 쓸 수 있게 해 줍니다.
     - `"Code(으)로 열기" 작업을 Windows 탐색기 파일의 상황에 맞는 메뉴에 추가` — 체크를 추천합니다. 파일을 오른쪽 클릭해 바로 VS Code로 열 수 있습니다.
     - `"Code(으)로 열기" 작업을 Windows 탐색기 디렉터리의 상황에 맞는 메뉴에 추가` — 체크를 추천합니다. 폴더를 오른쪽 클릭해 VS Code로 열 수 있습니다.
   - `설치` → `종료`(완료 화면에서 "Visual Studio Code 실행"에 체크되어 있으면 바로 실행됩니다)
3. 설치 후 PowerShell을 새로 열고 확인합니다.

```bash
code --version
```

```text
1.105.1
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
x64
```

첫 줄의 버전 번호가 나오면 성공입니다(숫자와 두 번째 줄의 긴 글자는 사람마다 다릅니다).

#### macOS 설치 (짧게)

같은 사이트에서 macOS용 `.zip`을 받아 압축을 풀고, 나온 `Visual Studio Code` 앱을 **응용 프로그램(Applications)** 폴더로 끌어다 놓습니다. VS Code를 실행한 뒤 `Command + Shift + P`를 누르고 `shell command`를 입력해 **Shell Command: Install 'code' command in PATH**를 선택하면 터미널에서 `code` 명령을 쓸 수 있습니다.

#### VS Code 화면 둘러보기

VS Code를 처음 실행하면 **Welcome(시작)** 탭이 열립니다. 화면은 크게 다섯 부분으로 나뉩니다.

1. **맨 왼쪽 세로 아이콘 줄(작업 표시줄, Activity Bar)**: 위에서부터 파일 두 장 모양(탐색기), 돋보기(검색), 갈라지는 선 모양(소스 제어, Git), 벌레와 재생 버튼 모양(실행 및 디버그), 네모 네 개 중 하나가 떨어진 모양(확장) 아이콘이 있습니다.
2. **그 오른쪽 패널(사이드바)**: 왼쪽 아이콘을 누르면 해당 기능의 패널이 열립니다. 탐색기를 누르면 폴더 안의 파일 목록이 보입니다.
3. **가운데 큰 영역(편집기)**: 파일 내용을 보고 고치는 곳입니다. 여러 파일을 탭으로 열 수 있습니다.
4. **아래쪽 영역(패널)**: 터미널, 문제(에러 목록), 출력 등이 나타나는 곳입니다. 처음엔 닫혀 있습니다.
5. **맨 아래 가는 띠(상태 표시줄)**: 현재 파일의 줄·칸 위치, 인코딩(`UTF-8`), 언어(`TypeScript`) 등이 표시됩니다.

::: tip VS Code 안에서 터미널 열기
메뉴의 **보기(View) → 터미널(Terminal)**을 누르거나, 단축키 ``Ctrl + ` ``(숫자 1 왼쪽에 있는 백틱 키)를 누르면 아래쪽 패널에 터미널이 열립니다. Windows에서는 기본으로 PowerShell이 열립니다. 앞으로는 VS Code 안의 터미널을 주로 쓰게 됩니다.
:::

### 3단계: VS Code 추천 확장 설치

**확장(extension)**은 VS Code에 기능을 더해 주는 추가 프로그램입니다. 스마트폰에 앱을 설치하는 것과 비슷합니다.

#### 확장 설치하는 방법

1. 왼쪽 작업 표시줄에서 **확장** 아이콘(네모 네 개)을 누르거나 `Ctrl + Shift + X`를 누릅니다.
2. 사이드바 맨 위에 `마켓플레이스에서 확장 검색`이라는 입력 칸이 나타납니다.
3. 확장 이름을 입력하면 아래에 목록이 나옵니다. **만든 사람(게시자)** 이름을 꼭 확인하세요. 비슷한 이름의 다른 확장이 많습니다.
4. 원하는 확장의 파란색 `Install`(설치) 버튼을 누릅니다.

#### 추천 확장 네 가지

| 확장 이름 | 게시자 | 하는 일 |
|---|---|---|
| Korean Language Pack for Visual Studio Code | Microsoft | VS Code 메뉴를 한국어로 바꿔 줍니다. |
| ESLint | Microsoft | 코드의 나쁜 습관·실수를 찾아 줍니다(린터). |
| Prettier - Code formatter | Prettier | 들여쓰기·따옴표 등 코드 모양을 자동으로 정리해 줍니다(포매터). |
| Error Lens | Alexander | 에러 메시지를 해당 줄 끝에 바로 보여 줍니다. |

각 확장을 조금 더 자세히 설명합니다.

**Korean Language Pack**: 설치하면 오른쪽 아래에 "언어를 변경하고 다시 시작하시겠습니까?" 같은 알림이 뜹니다. `Change Language and Restart`(언어 변경 및 다시 시작)를 누르면 VS Code가 다시 켜지면서 메뉴가 한국어로 바뀝니다. 이 위키는 메뉴 이름을 한국어와 영어로 함께 적습니다.

::: info 메뉴는 한국어로, 에러 메시지는 영어로
한국어 팩을 설치하면 TypeScript 에러 메시지도 일부 한국어로 나올 수 있습니다. 하지만 에러 메시지를 검색할 때는 **영어 원문**이 훨씬 많은 자료를 찾아 줍니다. 6번 레슨에서 에러 메시지를 영어로 보는 설정 방법도 안내합니다.
:::

**ESLint**: **린터(linter)**는 "문법적으로는 맞지만 실수일 가능성이 높은 코드"를 찾아 주는 도구입니다. 예를 들어 만들어 놓고 한 번도 쓰지 않은 변수를 알려 줍니다. 확장을 설치해도 프로젝트에 ESLint 설정이 있어야 동작합니다. 설정 방법은 Part 6의 [ESLint와 Prettier](../part6-tooling/04-eslint-prettier)에서 배우니, 지금은 설치만 해 둡니다.

**Prettier**: **포매터(formatter)**는 코드의 내용은 그대로 두고 **모양**만 일정하게 정리해 주는 도구입니다. 들여쓰기가 들쭉날쭉한 코드를 한 번에 가지런하게 만들어 줍니다. 파일을 열고 `Shift + Alt + F`(문서 서식)를 누르면 정리됩니다. 처음 누르면 "어떤 포매터를 쓸까요?"라고 물을 수 있는데, 이때 Prettier를 고르면 됩니다.

**Error Lens**: 기본 VS Code는 에러가 있는 곳에 빨간 물결 밑줄만 긋고, 마우스를 올려야 메시지를 보여 줍니다. Error Lens를 설치하면 **에러가 난 줄의 오른쪽 끝에 메시지가 빨간 글씨로 바로 표시**되고 줄 전체가 옅은 빨간색으로 칠해집니다. 처음 배울 때 에러를 놓치지 않게 도와줍니다.

::: details 터미널로 한 번에 설치하기 (선택)
`code` 명령이 동작한다면 터미널에서 아래 명령으로도 설치할 수 있습니다. `--install-extension` 뒤의 글자는 확장의 고유 ID(게시자.이름)입니다.

```bash
code --install-extension MS-CEINTL.vscode-language-pack-ko
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension usernamehw.errorlens
```

설치된 목록은 `code --list-extensions`로 확인할 수 있습니다.
:::

#### 꼭 켜 두면 좋은 설정 하나: 자동 저장

VS Code는 기본적으로 파일을 직접 저장(`Ctrl + S`)해야 합니다. 저장하지 않은 파일은 탭 이름 옆에 흰 동그라미(●)가 표시됩니다. 저장을 잊고 실행하면 **예전 내용이 실행**되어 혼란스러우니, 처음 배울 때는 자동 저장을 켜 두는 것을 추천합니다.

- 메뉴 **파일(File) → 자동 저장(Auto Save)**을 클릭해 체크 표시가 생기면 켜진 것입니다.

### 4단계: Git 설치

**Git(깃)**은 **버전 관리 시스템**입니다. 파일을 언제, 누가, 어떻게 바꿨는지 기록해 두고, 필요하면 예전 상태로 되돌릴 수 있게 해 줍니다. "보고서_최종.docx", "보고서_최종_진짜최종.docx" 같은 파일을 만들 필요가 없게 해 주는 도구라고 생각하면 됩니다. 거의 모든 개발 회사가 씁니다. Git 사용법 자체는 이 위키의 범위를 벗어나므로, 여기서는 설치와 첫 설정만 합니다.

::: info Git과 GitHub는 다릅니다
- **Git**: 내 PC에서 돌아가는 버전 관리 **프로그램**입니다.
- **GitHub**: Git으로 관리하는 코드를 인터넷에 올려 두고 공유하는 **웹 서비스**입니다. GitLab, Bitbucket 같은 비슷한 서비스도 있습니다.
:::

#### Windows 설치 순서

1. [https://git-scm.com](https://git-scm.com) 에 접속해 **Downloads → Windows**를 누르고, `Git for Windows/x64 Setup.`(64비트 설치 프로그램)을 받습니다.
2. `Git-2.xx.x-64-bit.exe`를 실행합니다. 설치 화면이 아주 많은데(10개 이상), **대부분 기본값 그대로 `Next`를 누르면 됩니다.** 다음 몇 화면만 확인하세요.
   - **Choosing the default editor used by Git**(Git이 쓸 기본 편집기): 기본값은 Vim이라는, 초보자가 쓰기 매우 어려운 편집기입니다. 목록에서 **Use Visual Studio Code as Git's default editor**를 고르는 것을 추천합니다.
   - **Adjusting the name of the initial branch in new repositories**(새 저장소의 기본 브랜치 이름): **Override the default branch name for new repositories**를 고르고 칸에 `main`이 들어 있는지 확인합니다. 요즘 대부분의 서비스가 `main`을 기본으로 씁니다.
   - **Adjusting your PATH environment**: 기본값인 **Git from the command line and also from 3rd-party software**(권장, Recommended) 그대로 둡니다.
   - **Configuring the line ending conversions**(줄바꿈 변환): 기본값인 **Checkout Windows-style, commit Unix-style line endings** 그대로 둡니다. Windows와 macOS는 줄바꿈 문자를 서로 다르게 저장하는데, 이 설정이 그 차이를 자동으로 맞춰 줍니다.
3. 마지막에 `Install` → `Finish`를 누릅니다.
4. 터미널을 **새로 열고** 확인합니다.

```bash
git --version
```

```text
git version 2.51.0.windows.1
```

`git version`으로 시작하는 줄이 나오면 성공입니다.

#### macOS 설치 (짧게)

터미널에서 `git --version`을 입력하면, Git이 없는 경우 "명령어 라인 개발자 도구를 설치하시겠습니까?"라는 창이 뜹니다. `설치`를 누르면 Apple의 개발자 도구와 함께 Git이 설치됩니다. 설치가 끝나면 다시 `git --version`으로 확인합니다.

#### Git 첫 설정: 내 이름과 이메일 등록

Git은 기록을 남길 때마다 "누가 바꿨는지"를 함께 적습니다. 그래서 처음 한 번은 이름과 이메일을 알려 줘야 합니다. 아래 명령의 따옴표 안을 **여러분의 정보로 바꿔서** 입력하세요.

```bash
git config --global user.name "Hong Minji"
git config --global user.email "minji@example.com"
```

- `git config`는 "Git 설정을 바꾼다"는 명령입니다.
- `--global`은 "이 PC의 모든 프로젝트에 적용한다"는 뜻입니다.
- `user.name`은 기록에 남을 이름, `user.email`은 이메일입니다. 나중에 GitHub를 쓴다면 GitHub에 가입한 이메일과 같게 맞춰 두면 좋습니다.
- 명령을 입력하고 아무것도 출력되지 않으면 **성공**입니다. 터미널에서는 "조용하면 성공"인 경우가 많습니다.

추가로 아래 설정도 해 두면 편합니다.

```bash
git config --global init.defaultBranch main
```

새 저장소를 만들 때 기본 브랜치 이름을 `main`으로 한다는 설정입니다. 설치할 때 이미 골랐다면 해도 되고 안 해도 됩니다.

설정이 잘 들어갔는지 확인합니다.

```bash
git config --global --list
```

```text
user.name=Hong Minji
user.email=minji@example.com
init.defaultbranch=main
```

여러분이 입력한 값이 보이면 성공입니다. 다른 줄(`core.editor=...` 등)이 더 보여도 괜찮습니다.

::: warning 개인정보 주의
`user.email`은 나중에 코드를 인터넷(GitHub 등)에 올리면 **누구나 볼 수 있는 기록**에 남습니다. 공개되면 곤란한 이메일이라면 GitHub가 제공하는 비공개용 이메일(`...@users.noreply.github.com`)을 쓰는 방법도 있습니다. 회사 프로젝트라면 회사 규정을 따르세요.
:::

### 5단계: 터미널 기본 명령 익히기

이제 터미널에서 폴더를 다루는 기본 명령을 배워 봅시다. 이 세 가지만 알아도 5번 레슨을 충분히 따라 할 수 있습니다.

먼저 알아 둘 용어가 있습니다.

- **폴더**는 개발 문서에서 **디렉터리(directory)**라고도 부릅니다. 같은 말입니다.
- **현재 디렉터리(current directory)**는 터미널이 지금 "서 있는" 폴더입니다. 프롬프트의 `C:\Users\minji` 부분이 이것입니다. 명령은 기본적으로 현재 디렉터리를 기준으로 동작합니다.
- **경로(path)**는 파일이나 폴더의 주소입니다. Windows에서는 `C:\Users\minji\Documents`처럼 `\`(역슬래시, 한글 키보드에서는 `₩`로 보이기도 합니다)로 구분하고, macOS에서는 `/Users/minji/Documents`처럼 `/`로 구분합니다. PowerShell에서는 `/`도 대부분 받아 줍니다.

#### `pwd` — 지금 어디 있지?

```bash
pwd
```

```text
Path
----
C:\Users\minji
```

`pwd`(print working directory)는 현재 디렉터리를 보여 줍니다. macOS에서는 `/Users/minji`처럼 한 줄로 나옵니다.

#### `ls` 또는 `dir` — 이 폴더에 뭐가 있지?

```bash
ls
```

```text
    디렉터리: C:\Users\minji

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-r---        2026-10-01  오전 9:12                Desktop
d-r---        2026-10-01  오전 9:12                Documents
d-r---        2026-10-01  오전 9:12                Downloads
```

`ls`(list)는 현재 폴더 안의 파일과 폴더 목록을 보여 줍니다. PowerShell에서는 `dir`이라고 입력해도 똑같이 동작합니다(옛날 Windows 명령 프롬프트에서 쓰던 이름입니다).

- `Mode` 칸이 `d`로 시작하면 **폴더(directory)**, `-`로 시작하면 **파일**입니다.
- `Name` 칸이 이름입니다. `Desktop`은 바탕 화면, `Documents`는 문서, `Downloads`는 다운로드 폴더입니다(Windows 탐색기에서는 한국어로 보이지만 실제 폴더 이름은 영어입니다).
- 실제로는 더 많은 폴더가 보일 것입니다.

#### `cd` — 다른 폴더로 이동하기

```bash
cd Documents
```

`cd`(change directory)는 현재 디렉터리를 바꿉니다. 실행하면 아무것도 출력되지 않고, 프롬프트가 `PS C:\Users\minji\Documents>`로 바뀝니다. 프롬프트가 바뀌었다면 이동에 성공한 것입니다.

자주 쓰는 형태는 다음과 같습니다.

| 명령 | 뜻 |
|---|---|
| `cd Documents` | 현재 폴더 안의 `Documents` 폴더로 들어갑니다. |
| `cd ..` | 한 단계 **위** 폴더로 나갑니다. `..`은 "상위 폴더"라는 뜻입니다. |
| `cd ~` | 내 사용자 폴더(`C:\Users\minji`)로 바로 갑니다. `~`(물결표)는 "내 홈 폴더"라는 뜻입니다. |
| `cd C:\dev` | 경로 전체를 적어 어디서든 그곳으로 바로 갑니다. |

#### `mkdir` — 새 폴더 만들기

```bash
mkdir ts-study
```

`mkdir`(make directory)는 새 폴더를 만듭니다. PowerShell에서는 만들어진 폴더 정보가 한 번 출력되고, macOS에서는 아무것도 출력되지 않습니다. `ls`를 다시 입력해 보면 목록에 `ts-study`가 생긴 것을 확인할 수 있습니다.

#### 실습: 공부용 폴더 만들고 들어가기

지금까지 배운 명령을 이어서 써 봅시다. 내 사용자 폴더 안에 `ts-study` 폴더를 만들고 그 안으로 들어갑니다.

```bash
cd ~
mkdir ts-study
cd ts-study
pwd
```

```text
Path
----
C:\Users\minji\ts-study
```

이제 이 폴더를 VS Code로 열어 봅시다.

```bash
code .
```

`.`(점 하나)은 "현재 폴더"라는 뜻입니다. VS Code가 열리고 왼쪽 탐색기에 `TS-STUDY`라는 이름이 보이면 성공입니다. 처음 폴더를 열면 "이 폴더에 있는 파일의 작성자를 신뢰합니까?"라는 창이 뜰 수 있는데, 내가 직접 만든 폴더이므로 **예, 작성자를 신뢰합니다**를 누르면 됩니다. (남에게 받은 폴더라면 내용을 확인하기 전에는 신뢰하지 않는 것이 안전합니다.)

#### 알아 두면 편한 요령

- **`Tab` 키 자동완성**: `cd Doc`까지만 입력하고 `Tab`을 누르면 `cd .\Documents\`처럼 나머지를 채워 줍니다. 오타가 줄어듭니다.
- **위쪽 화살표(`↑`)**: 이전에 입력한 명령을 다시 불러옵니다. 같은 명령을 반복할 때 편합니다.
- **`cls` 또는 `clear`**: 화면을 깨끗이 지웁니다(명령 기록은 남습니다).
- **`Ctrl + C`**: 실행 중인 명령을 멈춥니다. 무언가 멈추지 않고 계속 돌 때 누릅니다.
- **이름에 공백이 있으면 따옴표로 감쌉니다**: `cd "My Projects"`. 그래서 개발용 폴더 이름에는 공백과 한글을 쓰지 않는 것이 좋습니다(`ts-study`처럼 영어 소문자와 `-`를 추천합니다).

### 6단계: 설치 최종 점검

모든 설치가 끝났다면, **새 터미널**을 열고 아래 네 줄을 차례로 입력해 보세요.

```bash
node -v
npm -v
git --version
code --version
```

네 명령 모두 버전 번호를 보여 주면 개발 환경 준비가 끝난 것입니다.

## 자주 하는 실수

### 실수 1: 설치 직후 이미 열려 있던 터미널에서 확인하기

```text
PS C:\Users\minji> node -v
node : 'node' 용어가 cmdlet, 함수, 스크립트 파일 또는 실행할 수 있는 프로그램 이름으로 인식되지 않습니다.
이름이 정확한지 확인하고 경로가 포함된 경우 경로가 올바른지 검증한 다음 다시 시도하십시오.
```

(영어 Windows에서는 `The term 'node' is not recognized as the name of a cmdlet, function, script file, or operable program.`으로 나옵니다.)

**왜 틀렸나:** 터미널은 열릴 때의 PATH 목록만 기억합니다. 설치 전에 열어 둔 터미널은 Node.js가 어디 있는지 모릅니다. VS Code 안의 터미널도 마찬가지라서, **VS Code 자체를 완전히 껐다 켜야** 합니다.

```text
고친 방법:
1. 열려 있는 터미널 창과 VS Code를 모두 닫습니다.
2. PowerShell을 새로 열고 node -v 를 다시 입력합니다.
3. 그래도 안 되면 PC를 다시 시작합니다.
4. 그래도 안 되면 Node.js 설치 프로그램을 다시 실행해 Custom Setup 화면에서 "Add to PATH"가 켜져 있는지 확인합니다.
```

### 실수 2: PowerShell에서 `npm`이 "스크립트를 실행할 수 없습니다"로 막히기

```text
PS C:\Users\minji> npm -v
npm : 이 시스템에서 스크립트를 실행할 수 없으므로 C:\Program Files\nodejs\npm.ps1 파일을 로드할 수 없습니다.
자세한 내용은 about_Execution_Policies(https://go.microsoft.com/fwlink/?LinkID=135170)를 참조하십시오.
```

**왜 틀렸나:** 설치가 잘못된 것이 아닙니다. Windows PowerShell은 보안을 위해 기본적으로 **스크립트 파일(.ps1) 실행을 막아 두는** 경우가 있습니다(이를 **실행 정책**, Execution Policy라고 합니다). `npm` 명령이 내부적으로 `npm.ps1`이라는 스크립트를 쓰기 때문에 막힌 것입니다.

```bash
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

**고친 방법:** 위 명령은 "현재 사용자에 한해, 내 PC에서 만든 스크립트와 서명된 스크립트는 실행을 허용한다"는 뜻입니다. 확인을 묻는 메시지가 나오면 `Y`를 입력하고 `Enter`를 누릅니다. 그 뒤 터미널을 새로 열고 `npm -v`를 다시 확인합니다.

::: warning 보안 설정을 바꾸는 일입니다
실행 정책은 PC의 보안 설정입니다. **회사 PC라면 바꾸기 전에 반드시 IT 담당자에게 확인하세요.** 설정을 바꾸고 싶지 않다면 `npm` 대신 `npm.cmd`, `npx` 대신 `npx.cmd`라고 입력하는 방법도 있습니다(스크립트가 아닌 다른 실행 파일을 쓰므로 실행 정책의 영향을 받지 않습니다). 또는 PowerShell 대신 **명령 프롬프트**(`cmd`)를 써도 됩니다.
:::

### 실수 3: 명령에 프롬프트까지 같이 입력하기

```text
PS C:\Users\minji> PS C:\Users\minji> node -v
```

**왜 틀렸나:** 다른 문서에서 복사할 때 프롬프트(`PS C:\Users\minji>`)나 macOS의 `$`, `%` 기호까지 함께 복사하면, 그것까지 명령으로 인식해 에러가 납니다.

```bash
node -v
```

**고친 방법:** 프롬프트 뒤의 **명령 부분만** 입력합니다. 이 위키의 `bash` 블록에는 프롬프트를 넣지 않았으니 그대로 복사하면 됩니다.

### 실수 4: 엉뚱한 폴더에서 명령 실행하기

```text
PS C:\Windows\System32> mkdir ts-study
mkdir : 'C:\Windows\System32\ts-study' 경로에 대한 액세스가 거부되었습니다.
```

**왜 틀렸나:** PowerShell을 관리자 권한으로 열면 처음 위치가 `C:\Windows\System32`(Windows 시스템 폴더)일 수 있습니다. 이곳에 파일을 만들면 안 됩니다. 터미널 명령은 항상 **현재 디렉터리** 기준으로 동작하므로, 명령을 입력하기 전에 프롬프트에서 위치를 확인하는 습관을 들이세요.

```bash
cd ~
mkdir ts-study
```

**고친 방법:** 먼저 `cd ~`로 내 사용자 폴더로 이동한 뒤 작업합니다. 개발 작업에는 관리자 권한 터미널이 필요 없습니다.

## 직접 해 보기

### 문제 1 ⭐ 버전 기록하기

아래 네 명령의 결과(버전 번호)를 메모장에 적어 두세요. 나중에 질문할 때 "환경 정보"로 쓰게 됩니다(6번 레슨).

```bash
node -v
npm -v
git --version
code --version
```

::: details 정답 보기
정답은 사람마다 다릅니다. 네 명령 모두 버전 번호가 나왔다면 성공입니다. 하나라도 "인식되지 않습니다" 에러가 나면, 그 프로그램의 설치 단계와 "자주 하는 실수 1"을 다시 확인하세요.
:::

### 문제 2 ⭐ 폴더 만들고 이동하기

터미널만 사용해서 다음을 해 보세요.

1. 내 사용자 폴더로 이동합니다.
2. `ts-study` 폴더 안에 `part0` 폴더를 만듭니다. (`ts-study`가 없다면 먼저 만듭니다.)
3. `part0` 폴더로 들어가 `pwd`로 위치를 확인합니다.

::: details 정답 보기
```bash
cd ~
mkdir ts-study
cd ts-study
mkdir part0
cd part0
pwd
```
`ts-study`가 이미 있다면 `mkdir ts-study`에서 "이미 있습니다"라는 에러가 나는데, 무시하고 다음 명령을 진행해도 됩니다. 마지막 `pwd` 결과가 `C:\Users\(사용자 이름)\ts-study\part0`이면 성공입니다.
:::

### 문제 3 ⭐⭐ 상위 폴더로 나가기

지금 `C:\Users\minji\ts-study\part0`에 있습니다. **명령 한 줄로** `C:\Users\minji`로 돌아가려면 어떻게 할까요? 두 가지 방법을 적어 보세요.

::: details 정답 보기
- `cd ..\..` — 상위 폴더로 두 번 올라갑니다. (`cd ../..`도 PowerShell에서 동작합니다.)
- `cd ~` — 내 홈 폴더로 바로 갑니다.
:::

### 문제 4 ⭐⭐ VS Code 터미널 쓰기

1. 문제 2에서 만든 `part0` 폴더를 `code .` 명령으로 VS Code에서 엽니다.
2. VS Code 안에서 ``Ctrl + ` ``로 터미널을 엽니다.
3. 그 터미널에서 `pwd`를 입력하면 어떤 경로가 나오나요?

::: details 정답 보기
`C:\Users\(사용자 이름)\ts-study\part0`이 나옵니다. VS Code의 터미널은 **VS Code로 연 폴더**를 현재 디렉터리로 해서 시작합니다. 그래서 앞으로는 프로젝트 폴더를 VS Code로 열고, 그 안의 터미널을 쓰는 것이 가장 편합니다.
:::

### 문제 5 ⭐⭐ Git 설정 확인하기

`git config --global user.name` 처럼 **값 없이** 입력하면 무엇이 나올까요? 직접 해 보고, 설정한 이메일도 같은 방법으로 확인해 보세요.

::: details 정답 보기
값을 주지 않으면 **현재 설정된 값을 보여 줍니다.**

```bash
git config --global user.name
git config --global user.email
```

```text
Hong Minji
minji@example.com
```
:::

### 문제 6 ⭐⭐⭐ 에러 메시지로 원인 추리하기

친구가 아래 에러를 보여 주면서 "Node.js를 분명히 설치했는데 안 돼"라고 합니다. 확인해 볼 것을 순서대로 세 가지 적어 보세요.

```text
'node' 용어가 cmdlet, 함수, 스크립트 파일 또는 실행할 수 있는 프로그램 이름으로 인식되지 않습니다.
```

::: details 정답 보기
예시 답안입니다.
1. 설치 **후에** 터미널(과 VS Code)을 새로 열었는지 확인합니다.
2. PC를 다시 시작해 봅니다.
3. `C:\Program Files\nodejs\` 폴더에 `node.exe`가 실제로 있는지 탐색기로 확인하고, 없으면 다시 설치합니다. 있으면 설치 프로그램의 Custom Setup에서 "Add to PATH"가 켜져 있었는지 확인하고 다시 설치합니다.
:::

## 확인 퀴즈

1. Node.js를 설치할 때 LTS와 Current 중 어느 것을 골라야 하나요? 이유는?
2. Node.js와 함께 설치되며, 패키지를 내려받는 도구의 이름은 무엇인가요?
3. `cd ..`은 무슨 뜻인가요?
4. `code .`에서 `.`은 무엇을 뜻하나요?
5. `git config --global user.email "..."`을 하는 이유는 무엇인가요?

::: details 정답 보기
1. **LTS**입니다. 오랫동안 보안 패치와 버그 수정을 받는 안정 버전이기 때문입니다.
2. **npm** (Node Package Manager)
3. 현재 폴더의 **한 단계 위(상위) 폴더**로 이동하라는 뜻입니다.
4. **현재 폴더**입니다. 즉, 지금 터미널이 있는 폴더를 VS Code로 열라는 뜻입니다.
5. Git이 변경 기록을 남길 때 "누가 바꿨는지"를 함께 저장하기 때문입니다.
:::

## 정리

- **Node.js**는 JavaScript 실행 환경이고, 함께 설치되는 **npm**으로 TypeScript 같은 패키지를 설치합니다. LTS 버전을 고르고 `node -v`로 확인합니다.
- **VS Code**는 코드 편집기이며 TypeScript 지원이 기본으로 들어 있습니다. 한국어 팩, ESLint, Prettier, Error Lens를 설치해 둡니다.
- **Git**은 버전 관리 도구입니다. 설치 후 `git config --global`로 이름과 이메일을 등록합니다.
- **터미널**에서는 `pwd`(위치 확인), `ls`/`dir`(목록), `cd`(이동), `mkdir`(폴더 만들기)를 씁니다.
- 설치 직후에는 **터미널을 새로 여는 것**을 잊지 마세요. 대부분의 "인식되지 않습니다" 문제가 이것으로 풀립니다.
- 버전 번호는 시간이 지나면 바뀝니다. 숫자보다 **확인 명령이 정상 동작하는지**를 보세요.

## 다음 단계

[TS Playground로 설치 없이 바로 해 보기](./04-playground) — 웹 브라우저에서 TypeScript를 바로 써 보고, TypeScript가 JavaScript로 바뀌는 모습을 실시간으로 관찰합니다.
