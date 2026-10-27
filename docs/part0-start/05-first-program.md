---
title: '첫 프로그램: tsc로 컴파일하고 실행하기'
---

# 첫 프로그램: tsc로 컴파일하고 실행하기

<LessonMeta level="입문" :minutes="45" prev="TS Playground에서 코드를 실행하고, TS가 JS로 바뀌는 모습과 Errors·Logs 탭을 살펴봤습니다." />

## 이번에 배울 것

- 터미널에서 프로젝트 폴더를 만들고 `npm init -y`, `npm install -D typescript`, `npx tsc --init`으로 TypeScript 프로젝트를 준비할 수 있다.
- `npx tsc`로 `.ts` 파일을 `.js`로 컴파일하고 `node`로 실행할 수 있다.
- 프로젝트에 생기는 파일(`package.json`, `package-lock.json`, `node_modules`, `tsconfig.json`, `hello.js`)이 각각 무엇인지 설명할 수 있다.
- 일부러 타입 에러를 내 보고, 에러가 있어도 `.js`가 만들어지는 이유와 `noEmitOnError` 옵션을 설명할 수 있다.
- `tsx`로 컴파일 과정 없이 `.ts`를 바로 실행하고, 타입 검사는 따로 해야 한다는 점을 말할 수 있다.

## 먼저 알아 둘 것

- [개발 환경 설치](./03-setup): Node.js·VS Code가 설치되어 있고, 터미널에서 `cd`, `mkdir`, `ls`를 쓸 수 있어야 합니다. 이 레슨은 3번 레슨에서 만든 `ts-study` 폴더를 씁니다.
- [TS Playground](./04-playground): Playground가 대신 해 주던 "검사 → 컴파일 → 실행"을 이번에는 직접 합니다.
- 인터넷 연결: `npm install`이 인터넷에서 TypeScript를 내려받습니다. 회사 네트워크에서 `npm install`이 막히면 사내 IT 담당자에게 문의하세요.

::: warning 버전 표기에 대해
이 레슨의 출력과 파일 내용은 **작성 시점(2026-10) 기준**으로 Windows 11, Node.js 24, npm 11에서 실제로 실행해 확인했습니다. 이때 `npm install -D typescript`로 설치되는 최신 버전은 **TypeScript 7.0.2**, `tsx`는 **4.23.15**였습니다. 버전 숫자나 파일 내용이 조금 달라도, 명령이 에러 없이 끝나면 정상입니다.
:::

## 비유로 이해하기

### 번역을 맡기는 출판사

한국어로 쓴 요리책을 영어권에 내려면 번역이 필요합니다. 출판사는 이렇게 일합니다.

1. **원고**(한국어)를 씁니다.
2. 번역가에게 넘기면, 번역가는 먼저 원고를 **검토**해서 "여기 재료 단위가 틀렸어요" 하고 빨간 펜으로 표시합니다.
3. 검토가 끝나면 **번역본**(영어)을 만들어 줍니다.
4. 독자는 번역본을 보고 **요리**합니다.

| 출판사 | TypeScript 프로젝트 |
|---|---|
| 원고(한국어) | `hello.ts` (TypeScript 소스 코드) |
| 번역가 | `tsc` (TypeScript 컴파일러) |
| 빨간 펜 검토 | 타입 검사, 에러 메시지 |
| 번역본(영어) | `hello.js` (JavaScript) |
| 요리하는 독자 | `node` (JavaScript 실행기) |
| 번역 작업 지침서 | `tsconfig.json` (컴파일 설정) |

재미있는 점은, 이 번역가는 **빨간 펜 표시를 하고도 일단 번역본을 만들어 준다**는 것입니다. "틀린 곳이 있으면 번역본을 아예 만들지 마세요"라고 지침서에 적어야 멈춥니다. 이 부분을 이번 레슨에서 직접 확인합니다.

## 개념 설명

### 전체 흐름 미리 보기

이번 레슨에서 입력할 명령은 다음이 전부입니다. 지금은 훑어보기만 하고, 아래에서 한 줄씩 실행하며 설명합니다.

```bash
cd ~\ts-study           # 1. 공부용 폴더로 이동
mkdir hello-ts          # 2. 프로젝트 폴더 만들기
cd hello-ts             # 3. 프로젝트 폴더로 들어가기
npm init -y             # 4. package.json 만들기
npm install -D typescript   # 5. TypeScript 설치
npx tsc --init          # 6. tsconfig.json 만들기
code .                  # 7. VS Code로 열기 → hello.ts 작성
npx tsc                 # 8. 컴파일 (hello.ts → hello.js)
node hello.js           # 9. 실행
```

`#` 뒤의 글은 설명용 **주석**이므로 입력하지 않습니다. 명령은 한 줄씩 입력하고 `Enter`를 누릅니다.

### 1단계: 프로젝트 폴더 만들기

**프로젝트**(project)는 프로그램 하나를 이루는 파일들을 모아 둔 폴더입니다. 프로그램마다 폴더를 따로 만드는 것이 원칙입니다.

PowerShell을 열고 3번 레슨에서 만든 `ts-study` 폴더로 이동한 뒤, 그 안에 `hello-ts` 폴더를 만들고 들어갑니다.

```bash
cd ~\ts-study
mkdir hello-ts
cd hello-ts
```

`ts-study` 폴더가 없다면 `cd ~`로 홈 폴더에 간 뒤 `mkdir ts-study`부터 합니다. 마지막에 프롬프트가 이렇게 보이면 성공입니다.

```text
PS C:\Users\minji\ts-study\hello-ts>
```

::: tip macOS라면
`cd ~/ts-study`처럼 `\` 대신 `/`를 씁니다. 나머지 명령은 모두 같습니다.
:::

### 2단계: npm init -y — 프로젝트 명함 만들기

```bash
npm init -y
```

**npm**(Node Package Manager)은 Node.js와 함께 설치된 **패키지 관리자**입니다. **패키지**(package)는 남이 만들어 공개한 코드 묶음이고, TypeScript 컴파일러도 패키지로 배포됩니다. `npm init`은 "이 폴더를 npm 프로젝트로 시작하겠다"는 명령이고, `-y`는 "질문하지 말고 전부 기본값(yes)으로 해 달라"는 **옵션**(option, 명령의 동작을 바꾸는 추가 지시)입니다.

실행 결과:

```text
Wrote to C:\Users\minji\ts-study\hello-ts\package.json:

{
  "name": "hello-ts",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "commonjs"
}
```

`package.json`이라는 파일이 생겼다는 뜻입니다. 이 파일은 **프로젝트의 명함**입니다.

| 항목 | 뜻 |
|---|---|
| `name` | 프로젝트 이름. 기본값으로 폴더 이름이 들어갑니다. |
| `version` | 프로젝트 버전 |
| `scripts` | 자주 쓰는 명령에 짧은 별명을 붙여 두는 곳 (Part 6에서 활용) |
| `license` | 이 코드를 남이 써도 되는 조건(라이선스). 연습용이라 신경 쓰지 않아도 됩니다. |
| `type` | 이 프로젝트의 JavaScript 모듈 방식. `commonjs`는 Node.js의 전통 방식입니다. (Part 6에서 다룸) |

JSON(JavaScript Object Notation)은 `{ "이름": 값 }` 형태로 정보를 적는 텍스트 형식입니다. 지금은 "설정 파일을 적는 형식" 정도로 알아 두면 됩니다.

### 3단계: npm install -D typescript — TypeScript 설치

```bash
npm install -D typescript
```

`npm install`은 패키지를 내려받아 설치하는 명령입니다. 인터넷 속도에 따라 몇 초에서 수십 초가 걸립니다.

실행 결과:

```text
added 2 packages, and audited 3 packages in 28s

found 0 vulnerabilities
```

- `added 2 packages`: 패키지 2개를 설치했습니다. TypeScript 본체(`typescript`)와, TypeScript 7부터 따라오는 **운영체제별 실행 파일 패키지**(Windows라면 `@typescript/typescript-win32-x64`)입니다.
- `found 0 vulnerabilities`: 알려진 보안 취약점(vulnerability)이 없다는 뜻입니다.

`-D`는 `--save-dev`의 줄임말로, "**개발할 때만 쓰는 도구**로 기록해 달라"는 옵션입니다. TypeScript 컴파일러는 코드를 JavaScript로 바꿀 때만 필요하고, 완성된 프로그램이 실행될 때는 필요 없기 때문입니다. `package.json`을 다시 열어 보면 맨 아래에 이런 내용이 추가되어 있습니다.

```json
  "devDependencies": {
    "typescript": "^7.0.2"
  }
```

`devDependencies`는 "개발용 의존성(dependency, 이 프로젝트가 기대고 있는 다른 패키지)" 목록입니다. `^7.0.2`는 "7.0.2 이상, 8.0.0 미만의 버전"이라는 뜻입니다.

설치가 잘 됐는지 확인해 봅시다.

```bash
npx tsc -v
```

```text
Version 7.0.2
```

::: info TypeScript 7과 이 위키의 기준 버전
TypeScript 7은 컴파일러를 Go라는 다른 언어로 다시 만들어 **속도를 크게 높인 버전**입니다(작성 시점 기준 최신은 7.0.2). TypeScript 문법과 에러 메시지는 5.x와 거의 같으므로 이 위키의 예제를 그대로 따라 할 수 있습니다. 이 위키의 예제는 TypeScript 5.x 기준으로 쓰고 5.6으로 검증했습니다. 결과를 이 위키와 똑같이 맞추고 싶다면 `npm install -D typescript@5`처럼 `@`뒤에 버전을 붙여 5.x를 설치할 수도 있습니다. 회사 프로젝트는 팀이 정한 버전이 이미 `package.json`에 적혀 있으니 그것을 따릅니다.
:::

### npx — "이 프로젝트에 설치된 도구를 실행해 줘"

방금 `npx tsc -v`라고 입력했습니다. **npx**는 npm과 함께 설치되는 도구로, "**현재 프로젝트의 `node_modules`에 설치된 프로그램을 찾아 실행**"해 줍니다. `tsc`(TypeScript Compiler)는 우리가 이 프로젝트에 설치했으므로 `npx tsc`로 부릅니다.

왜 그냥 `tsc`라고 입력하지 않을까요? TypeScript를 이 폴더에만 설치했기 때문에, 컴퓨터 전체에서 `tsc`라는 명령을 찾으면 없다고 나옵니다. 프로젝트마다 TypeScript 버전이 다를 수 있으므로, **프로젝트 안에 설치하고 `npx`로 부르는 것**이 요즘의 표준 방식입니다.

### 4단계: npx tsc --init — 컴파일 설정 파일 만들기

```bash
npx tsc --init
```

실행 결과:

```text
Created a new tsconfig.json

You can learn more at https://aka.ms/tsconfig
```

`tsconfig.json`은 앞의 비유에서 **번역 작업 지침서**입니다. "어떤 파일을, 어떤 규칙으로 검사하고, 어떤 JavaScript로 바꿀지"를 적습니다. Playground의 **TS Config** 메뉴에서 체크박스로 바꾸던 것을 이제 파일에 적는다고 생각하면 됩니다.

만들어진 파일은 이렇습니다(작성 시점 TypeScript 7.0.2 기준).

```json
{
  // Visit https://aka.ms/tsconfig to read more about this file
  "compilerOptions": {
    // File Layout
    // "rootDir": "./src",
    // "outDir": "./dist",

    // Environment Settings
    // See also https://aka.ms/tsconfig/module
    "module": "nodenext",
    "target": "esnext",
    "types": [],
    // For nodejs:
    // "lib": ["esnext"],
    // "types": ["node"],
    // and npm install -D @types/node

    // Other Outputs
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,

    // Stricter Typechecking Options
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,

    // Style Options
    // "noImplicitReturns": true,
    // "noImplicitOverride": true,
    // "noUnusedLocals": true,
    // "noUnusedParameters": true,
    // "noFallthroughCasesInSwitch": true,
    // "noPropertyAccessFromIndexSignature": true,

    // Recommended Options
    "strict": true,
    "jsx": "react-jsx",
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "noUncheckedSideEffectImports": true,
    "moduleDetection": "force",
    "skipLibCheck": true,
  }
}
```

항목이 많아 보이지만 **지금 알아 둘 것은 세 가지**뿐입니다.

| 옵션 | 뜻 |
|---|---|
| `"strict": true` | 깐깐한 검사를 모두 켭니다. Playground에서 체크해 두었던 그 `strict`입니다. 이 위키의 기준입니다. |
| `"target": "esnext"` | 가장 최신 JavaScript 문법으로 출력합니다. Playground의 `Target`과 같습니다. |
| `"sourceMap"`, `"declaration"`, `"declarationMap"` | `.js` 말고도 부가 파일을 함께 만들라는 지시입니다. 아래 5단계에서 확인합니다. |

나머지는 Part 6의 [tsconfig.json 완전 정복](../part6-tooling/01-tsconfig)에서 하나씩 다룹니다.

::: info 줄 앞의 `//`는 무엇인가요?
원래 JSON 형식에는 주석을 쓸 수 없지만, `tsconfig.json`은 예외적으로 `//` 주석을 허용합니다. `//`로 시작하는 줄은 **꺼져 있는 옵션**이거나 설명입니다. `//`를 지우면 그 옵션이 켜집니다.
:::

::: tip 버전에 따라 내용이 다릅니다
TypeScript 5.8 이전 버전에서 `npx tsc --init`을 실행하면 옵션 설명이 영어 주석으로 100줄 넘게 달린 긴 파일이 만들어집니다. 내용이 달라 보여도 `"strict": true`가 켜져 있는지만 확인하면 됩니다.
:::

### VS Code로 폴더 열기

이제 코드를 쓸 차례입니다. 터미널에 다음을 입력합니다.

```bash
code .
```

`.`은 "현재 폴더"라는 뜻이므로, `hello-ts` 폴더가 VS Code로 열립니다. 왼쪽 **탐색기**(Explorer, 맨 위 종이 두 장 모양 아이콘)에 `HELLO-TS`라는 제목과 함께 다음 항목이 보입니다.

```text
HELLO-TS
├─ node_modules        (폴더)
├─ package-lock.json
├─ package.json
└─ tsconfig.json
```

"이 폴더에 있는 파일의 작성자를 신뢰합니까?"라는 창이 뜨면, 내가 만든 폴더이므로 **예, 작성자를 신뢰합니다**를 누릅니다.

::: tip VS Code 메뉴로 열기
`code .`이 안 되면 VS Code에서 **파일 → 폴더 열기**(`File → Open Folder`)를 누르고 `C:\Users\(사용자 이름)\ts-study\hello-ts` 폴더를 고릅니다. 파일 하나가 아니라 **폴더**를 여는 것이 중요합니다. 그래야 VS Code가 `tsconfig.json`을 찾아 같은 규칙으로 검사해 줍니다.
:::

### VS Code 안에서 터미널 열기

PowerShell 창과 VS Code를 오가는 것은 번거롭습니다. VS Code에는 터미널이 들어 있습니다.

- 메뉴에서 **터미널 → 새 터미널**(`Terminal → New Terminal`)을 누르거나
- 단축키 `` Ctrl + ` ``를 누릅니다. `` ` ``(백틱)은 키보드 왼쪽 위 `Esc` 아래, 숫자 `1` 왼쪽에 있는 키입니다.

화면 아래쪽에 터미널 패널이 열리고, 프롬프트가 `PS C:\Users\minji\ts-study\hello-ts>`로 이미 프로젝트 폴더에 와 있습니다. 앞으로는 이 터미널을 씁니다.

### 생긴 파일 하나씩 살펴보기

#### package.json

2단계에서 본 **프로젝트 명함**입니다. 프로젝트 이름과, 이 프로젝트가 쓰는 패키지 목록(`devDependencies`)이 적혀 있습니다. 사람이 직접 고치기도 하는 파일입니다.

#### package-lock.json

`npm install`이 자동으로 만든 파일입니다. `package.json`에는 `"^7.0.2"`처럼 **범위**가 적혀 있지만, `package-lock.json`에는 "실제로 설치한 **정확한 버전**과 내려받은 주소"가 모두 기록됩니다.

왜 필요할까요? 동료가 몇 달 뒤 같은 프로젝트에서 `npm install`을 하면 그사이 새 버전이 나와 있을 수 있습니다. `package-lock.json`이 있으면 **모두가 똑같은 버전**을 설치하게 되어 "내 PC에서는 되는데요?" 문제를 줄여 줍니다. **사람이 직접 고치지 않는 파일**이며, 프로젝트를 공유할 때 함께 공유합니다.

#### node_modules 폴더

`npm install`로 내려받은 패키지의 **실제 파일**이 들어 있는 폴더입니다. 열어 보면 `typescript`와 `@typescript` 폴더가 있습니다.

- 용량이 큽니다. 패키지를 몇 개만 설치해도 수십 MB가 되기 쉽습니다.
- **직접 고치지 않습니다.**
- **지워도 됩니다.** `package.json`과 `package-lock.json`만 있으면 `npm install` 한 번으로 똑같이 다시 만들어집니다.
- 그래서 Git에 올리거나 압축해서 남에게 보낼 때는 **`node_modules`를 빼는 것**이 원칙입니다. (Git에서 빼는 방법은 `.gitignore` 파일에 `node_modules`를 적는 것이며, 실무 프로젝트에는 대부분 이미 적혀 있습니다.)

#### tsconfig.json

4단계에서 본 **컴파일 설정 파일**입니다. `npx tsc`를 이 폴더에서 실행하면 tsc가 이 파일을 먼저 읽고 그대로 따릅니다.

### 5단계: hello.ts 작성하기

VS Code 탐색기에서 `HELLO-TS` 제목 옆의 **새 파일** 아이콘(종이에 `+`)을 누르고 이름을 `hello.ts`로 입력합니다. 파일 이름 끝의 `.ts`가 "TypeScript 파일"이라는 표시입니다.

다음 코드를 입력하고 저장합니다(`Ctrl + S`). 3번 레슨에서 자동 저장을 켰다면 따로 저장하지 않아도 됩니다.

```ts
const storeName: string = '한빛 카페'
const visitCount: number = 3

console.log('안녕하세요, TypeScript!')
console.log(storeName + '에 ' + visitCount + '번째 방문했습니다.')
```

- `const storeName: string = '한빛 카페'`: `storeName`이라는 이름의 상자를 만들고 글자를 넣습니다. `: string`은 "이 상자에는 문자열만 넣는다"는 **타입 표기**입니다.
- `console.log(...)`: 괄호 안의 값을 터미널에 출력합니다.
- `+`로 글자와 숫자를 이어 붙입니다. 변수와 타입은 [값과 변수](../part1-basics/01-values-and-variables)에서 자세히 배웁니다.

### 6단계: npx tsc — 컴파일하기

VS Code 터미널에서 실행합니다.

```bash
npx tsc
```

**아무것도 출력되지 않고** 다음 프롬프트가 나오면 성공입니다. 터미널 프로그램은 "문제가 없으면 조용히 끝나는" 경우가 많습니다. 에러가 있을 때만 말을 합니다.

탐색기를 보면 파일이 네 개 늘어나 있습니다.

```text
HELLO-TS
├─ node_modules
├─ hello.d.ts          ← 새로 생김
├─ hello.d.ts.map      ← 새로 생김
├─ hello.js            ← 새로 생김 (가장 중요)
├─ hello.js.map        ← 새로 생김
├─ hello.ts
├─ package-lock.json
├─ package.json
└─ tsconfig.json
```

`npx tsc`처럼 **파일 이름 없이** 실행하면, tsc는 `tsconfig.json`을 읽고 이 폴더(와 그 아래 폴더)의 `.ts` 파일을 **전부** 컴파일합니다.

| 파일 | 무엇인가 | 왜 생겼나 |
|---|---|---|
| `hello.js` | **컴파일된 JavaScript.** 실제로 실행할 파일 | tsc의 기본 일 |
| `hello.js.map` | **소스 맵**(source map). `hello.js`의 몇째 줄이 `hello.ts`의 몇째 줄인지 적은 대응표. 디버깅할 때 원래 TS 코드 위치를 보여 주는 데 씁니다. | `"sourceMap": true` |
| `hello.d.ts` | **선언 파일**. 코드에서 타입 정보만 뽑은 요약본. Playground의 `.D.TS` 탭과 같습니다. | `"declaration": true` |
| `hello.d.ts.map` | 선언 파일용 대응표 | `"declarationMap": true` |

지금 우리에게 필요한 것은 `hello.js` 하나입니다. 나머지 셋은 라이브러리를 만들거나 디버깅할 때 쓰는 부가 파일이며, Part 5·6에서 다시 만납니다.

`hello.js`를 열어 보면 이렇게 되어 있습니다.

```js
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const storeName = '한빛 카페';
const visitCount = 3;
console.log('안녕하세요, TypeScript!');
console.log(storeName + '에 ' + visitCount + '번째 방문했습니다.');
//# sourceMappingURL=hello.js.map
```

- Playground에서 본 것처럼 `: string`, `: number`가 **사라졌습니다.**
- 둘째 줄 `Object.defineProperty(exports, ...)`는 "이 파일은 독립된 **모듈**(module, 다른 파일과 이름이 섞이지 않는 독립된 코드 단위)"이라는 표시입니다. `tsconfig.json`의 `"moduleDetection": "force"` 설정 때문에 붙었습니다. 지금은 신경 쓰지 않아도 되며 [모듈](../part3-intermediate/09-modules) 레슨에서 배웁니다.
- 마지막 줄은 "대응표는 `hello.js.map`에 있다"는 안내입니다.

::: warning hello.js는 고치지 마세요
`hello.js`는 tsc가 만든 **결과물**입니다. 여기를 고쳐도 다음에 `npx tsc`를 실행하면 `hello.ts`를 기준으로 다시 덮어씁니다. 코드는 항상 **`.ts` 파일을 고칩니다.**
:::

### 7단계: node hello.js — 실행하기

```bash
node hello.js
```

실행 결과:

```text
안녕하세요, TypeScript!
한빛 카페에 3번째 방문했습니다.
```

축하합니다. 내 PC에서 직접 만든 첫 TypeScript 프로그램입니다.

여기까지의 흐름을 정리하면 이렇습니다.

```text
hello.ts ──(npx tsc: 타입 검사 + 변환)──▶ hello.js ──(node: 실행)──▶ 화면 출력
```

**Node.js는 `hello.js`를 실행합니다.** `hello.ts`를 고쳤다면 반드시 `npx tsc`를 **다시 실행**해야 `hello.js`에 반영됩니다. 이것을 잊는 실수가 아주 흔합니다(아래 "자주 하는 실수" 참고).

### 일부러 타입 에러 내 보기

이제 TypeScript가 실수를 어떻게 잡아 주는지 봅시다. `hello.ts`의 둘째 줄을 숫자 대신 글자로 바꿉니다.

```ts
const storeName: string = '한빛 카페'
const visitCount: number = '세 번'

console.log('안녕하세요, TypeScript!')
console.log(storeName + '에 ' + visitCount + '번째 방문했습니다.')
```

#### 먼저 VS Code가 알려 줍니다

저장하기도 전에 `visitCount` 아래에 **빨간 물결 밑줄**이 생깁니다. 마우스를 올리면 이런 말풍선이 뜹니다.

```text
Type 'string' is not assignable to type 'number'. ts(2322)
```

VS Code에는 TypeScript 검사 기능이 들어 있어서, 입력하는 즉시 검사합니다. 3번 레슨에서 Error Lens 확장을 설치했다면 같은 메시지가 줄 끝에 빨간 글씨로 바로 보입니다. 화면 아래 **문제**(Problems) 패널(`Ctrl + Shift + M`)에도 목록으로 나옵니다.

#### tsc는 이렇게 알려 줍니다

터미널에서 다시 컴파일합니다.

```bash
npx tsc
```

```text
hello.ts:2:7 - error TS2322: Type 'string' is not assignable to type 'number'.

2 const visitCount: number = '세 번'
        ~~~~~~~~~~


Found 1 error in hello.ts:2
```

이번에는 tsc가 말을 합니다. 실제 터미널에서는 파일 이름이 파란색, `error`가 빨간색으로 보입니다.

| 부분 | 뜻 |
|---|---|
| `hello.ts:2:7` | `hello.ts` 파일의 **2번째 줄, 7번째 칸**에서 문제가 났습니다. |
| `error TS2322` | 에러 종류를 나타내는 **에러 코드**입니다. 검색할 때 유용합니다. |
| `Type 'string' is not assignable to type 'number'.` | "문자열 타입은 숫자 타입에 넣을 수 없다"는 설명입니다. |
| `2 const visitCount ...` 와 `~~~~~~~~~~` | 문제가 된 줄을 보여 주고, 물결표로 정확한 위치를 가리킵니다. |
| `Found 1 error` | 에러가 모두 1개입니다. |

에러 메시지를 읽는 방법은 다음 레슨 [에러 메시지 읽는 법](./06-how-to-read-errors)에서 자세히 배웁니다.

### 에러가 났는데 hello.js가 만들어졌다?

이제 이상한 점을 확인해 봅시다. 탐색기에서 `hello.js`를 열어 보세요. 방금 에러가 났는데도 `hello.js`가 **새로 만들어져 있습니다.**

```js
const visitCount = '세 번';
```

그리고 실행하면 **실행도 됩니다.**

```bash
node hello.js
```

```text
안녕하세요, TypeScript!
한빛 카페에 세 번번째 방문했습니다.
```

"세 번번째"라는 엉뚱한 문장이 나왔습니다. 왜 tsc는 에러를 알려 놓고도 JavaScript를 만들어 줄까요?

1. **TypeScript의 타입 검사는 "조언"입니다.** tsc의 일은 두 가지, **타입 검사**와 **JavaScript 생성**(emit, 출력)인데, 기본 설정에서는 이 둘이 독립적으로 움직입니다. 타입이 틀려도 JavaScript 문법으로는 멀쩡하게 바꿀 수 있기 때문입니다.
2. **기존 JavaScript 프로젝트를 TypeScript로 옮길 때** 이 동작이 유용합니다. 에러가 수백 개 있어도 일단 프로그램은 돌아가게 두고, 에러를 하나씩 고쳐 나갈 수 있습니다.
3. Playground에서 빨간 밑줄이 있어도 Run이 되던 것과 같은 이유입니다.

하지만 처음 배우는 단계에서는 이 동작이 오히려 헷갈립니다. "에러가 있으면 아예 JavaScript를 만들지 마라"고 지시하는 옵션이 **`noEmitOnError`**(에러가 있으면 출력하지 않음)입니다.

#### noEmitOnError 켜 보기

`tsconfig.json`을 열고, `"skipLibCheck": true,` 줄 바로 아래에 한 줄을 추가합니다.

```json
    "skipLibCheck": true,
    "noEmitOnError": true,
  }
}
```

먼저 이전 결과물을 지웁니다. VS Code 탐색기에서 `hello.js`, `hello.js.map`, `hello.d.ts`, `hello.d.ts.map`을 선택하고 `Delete` 키로 지웁니다(또는 마우스 오른쪽 클릭 → **삭제**). 그런 다음 다시 컴파일합니다.

```bash
npx tsc
```

```text
hello.ts:2:7 - error TS2322: Type 'string' is not assignable to type 'number'.

2 const visitCount: number = '세 번'
        ~~~~~~~~~~


Found 1 error in hello.ts:2
```

에러 메시지는 같지만, 이번에는 탐색기에 **`hello.js`가 생기지 않습니다.** 이제 `hello.ts`의 `'세 번'`을 `3`으로 되돌리고 다시 `npx tsc`를 실행하면, 그때 `hello.js`가 만들어집니다.

::: tip 부가 파일을 줄이고 싶다면 (선택)
`hello.js.map`, `hello.d.ts`, `hello.d.ts.map`이 거슬린다면 `tsconfig.json`에서 해당 세 줄 앞에 `//`를 붙여 끄면 됩니다.

```json
    // Other Outputs
    // "sourceMap": true,
    // "declaration": true,
    // "declarationMap": true,
```

그러면 `npx tsc`가 `hello.js` 하나만 만듭니다. 이 레슨의 연습 문제는 어느 쪽이든 상관없습니다.
:::

### tsx — 컴파일 없이 바로 실행하기

`npx tsc` → `node hello.js` 두 단계는 매번 하기 번거롭습니다. **tsx**(TypeScript Execute)는 `.ts` 파일을 **한 번에 실행**해 주는 도구입니다.

```bash
npm install -D tsx
```

```text
added 3 packages, and audited 6 packages in 7s

found 0 vulnerabilities
```

`package.json`의 `devDependencies`에 `"tsx": "^4.23.15"`가 추가됩니다(작성 시점 기준 버전). 이제 실행해 봅시다.

```bash
npx tsx hello.ts
```

```text
안녕하세요, TypeScript!
한빛 카페에 3번째 방문했습니다.
```

`hello.js` 파일을 만들지 않고 바로 실행되었습니다. 앞으로 Part 1의 예제는 대부분 이 방법으로 실행합니다.

::: danger tsx는 타입 검사를 하지 않습니다
tsx는 실행 속도를 위해 **타입 표기를 지우기만 하고** 바로 실행합니다. 그래서 `visitCount`에 `'세 번'`을 넣은 코드도 아무 경고 없이 실행해 `세 번번째 방문했습니다.`를 출력합니다.

타입 검사는 따로 해야 합니다. 파일을 만들지 않고 **검사만** 하는 명령은 다음과 같습니다.

```bash
npx tsc --noEmit
```

`--noEmit`은 "JavaScript를 출력하지 말고 검사만 하라"는 옵션입니다. 정리하면,

- VS Code의 빨간 밑줄을 항상 확인하고,
- 실행은 `npx tsx 파일이름.ts`로,
- 검사가 필요하면 `npx tsc --noEmit`으로 합니다.
:::

::: info Node.js로 .ts를 바로 실행하기
[1번 레슨](./01-what-is-programming)에서 말한 것처럼, 최근 Node.js(22.18 이상, 23.6 이상 등)는 `node hello.ts`처럼 `.ts` 파일을 바로 실행할 수도 있습니다. 이것도 tsx처럼 **타입을 지우고 실행할 뿐 검사는 하지 않습니다.** 또 `enum`처럼 "지우기만으로는 JavaScript가 되지 않는" 일부 문법은 처리하지 못하므로, 이 위키에서는 tsx를 씁니다.
:::

### 한눈에 비교

| 방법 | 타입 검사 | `.js` 파일 생성 | 언제 쓰나 |
|---|---|---|---|
| `npx tsc` | 함 | 함 | 배포할 JavaScript를 만들 때 |
| `npx tsc --noEmit` | 함 | 안 함 | 타입 검사만 할 때 |
| `npx tsx 파일.ts` | **안 함** | 안 함 | 공부·개발 중 빠르게 실행할 때 |
| `node 파일.js` | (해당 없음) | 안 함 | 만들어진 JavaScript를 실행할 때 |

## 자주 하는 실수

### 실수 1. TypeScript를 설치하지 않은 폴더에서 npx tsc 실행하기

```text
PS C:\Users\minji> npx tsc
Need to install the following packages:
tsc@2.0.4
Ok to proceed? (y)
```

**왜 틀렸나**: 현재 폴더(여기서는 홈 폴더)에 TypeScript가 설치되어 있지 않으면, npx는 인터넷에서 `tsc`라는 **이름의 패키지**를 찾아 설치하려고 합니다. 그런데 npm의 `tsc` 패키지는 TypeScript 공식 패키지가 아니라 **오래전에 쓰이지 않게 된 옛 패키지**입니다. `y`를 누르면 빨간 바탕에 `This is not the tsc command you are looking for`(찾으시는 tsc 명령이 아닙니다)라는 안내만 나옵니다.

**고친 방법**: `y`를 누르지 말고 `Ctrl + C`로 취소합니다. 프롬프트를 보고 **프로젝트 폴더 안**인지 확인한 뒤(`cd ~\ts-study\hello-ts`), 그 폴더에 `npm install -D typescript`가 되어 있는지 확인합니다.

### 실수 2. .ts를 고치고 컴파일하지 않은 채 node로 실행하기

```ts
// hello.ts에서 방문 횟수를 3 → 5로 고침
const visitCount: number = 5
```

```bash
node hello.js
```

```text
안녕하세요, TypeScript!
한빛 카페에 3번째 방문했습니다.
```

**왜 틀렸나**: `node`가 실행하는 것은 `hello.js`입니다. `hello.ts`를 고쳐도 `npx tsc`를 다시 실행하기 전까지 `hello.js`는 예전 내용 그대로입니다.

**고친 방법**: 고친 뒤에는 컴파일부터 다시 합니다.

```bash
npx tsc
node hello.js
```

또는 컴파일 단계가 없는 `npx tsx hello.ts`를 씁니다.

### 실수 3. npx tsc 뒤에 파일 이름을 붙이기

```bash
npx tsc hello.ts
```

```text
error TS5112: tsconfig.json is present but will not be loaded if files are specified on commandline. Use '--ignoreConfig' to skip this error.
```

**왜 틀렸나**: `tsc 파일이름`처럼 파일을 직접 지정하면 tsc는 `tsconfig.json`을 **읽지 않습니다.** `strict` 같은 설정이 모두 빠진 채로 검사하게 되므로, 작성 시점의 TypeScript(6.0 이상)는 아예 에러로 막아 줍니다. 옛 버전(5.x)은 이 에러 없이 설정을 무시하고 컴파일하므로 더 위험합니다.

**고친 방법**: 프로젝트 폴더에서는 파일 이름 없이 `npx tsc`만 입력합니다. 그러면 `tsconfig.json`을 읽고 폴더 안의 `.ts` 파일을 모두 컴파일합니다.

### 실수 4. tsx로 실행되니까 에러가 없다고 믿기

```ts
const price: number = '4500'
console.log(price + 500)
```

```bash
npx tsx price.ts
```

```text
4500500
```

**왜 틀렸나**: tsx는 타입 검사를 하지 않으므로 에러 없이 실행됩니다. 결과 `4500500`은 4500 + 500 = 5000이 아니라 글자 `'4500'` 뒤에 `500`을 이어 붙인 값입니다.

**고친 방법**: VS Code의 빨간 밑줄 또는 `npx tsc --noEmit`으로 확인하고 타입 에러를 고칩니다.

```bash
npx tsc --noEmit
```

```text
price.ts:1:7 - error TS2322: Type 'string' is not assignable to type 'number'.

1 const price: number = '4500'
        ~~~~~


Found 1 error in price.ts:1
```

```ts
const price: number = 4500
console.log(price + 500)
// 출력: 5000
```

### 실수 5. PowerShell에서 npm·npx가 "스크립트를 실행할 수 없습니다"로 막히기

```text
npx : 이 시스템에서 스크립트를 실행할 수 없으므로 C:\Program Files\nodejs\npx.ps1 파일을 로드할 수 없습니다.
```

**왜 틀렸나**: Windows PowerShell의 **실행 정책**(보안 설정) 때문입니다. 3번 레슨의 "자주 하는 실수"에서 다룬 문제입니다.

**고친 방법**: `npx` 대신 `npx.cmd`, `npm` 대신 `npm.cmd`라고 입력하거나, 3번 레슨의 안내를 따릅니다. 회사 PC라면 설정을 바꾸기 전에 IT 담당자에게 확인합니다.

## 직접 해 보기

### 문제 1. 새 프로젝트 처음부터 만들기 ⭐

`ts-study` 안에 `my-shop`이라는 새 프로젝트 폴더를 만들고, TypeScript를 설치하고 `tsconfig.json`을 만드세요. 마지막에 `ls`(또는 `dir`)로 파일 목록을 확인합니다.

::: details 정답 보기
```bash
cd ~\ts-study
mkdir my-shop
cd my-shop
npm init -y
npm install -D typescript
npx tsc --init
ls
```

`ls` 결과에 `node_modules`, `package-lock.json`, `package.json`, `tsconfig.json` 네 가지가 보이면 성공입니다. 프로젝트를 만들 때마다 이 순서를 반복합니다.
:::

### 문제 2. 영수증 한 줄 출력하기 ⭐

문제 1의 `my-shop` 폴더에 `receipt.ts`를 만들고, 상품 이름(`productName`)·가격(`price`)·수량(`quantity`) 변수를 만들어 `카페라떼 2개: 10000원`처럼 출력하세요. `npx tsc`로 컴파일하고 `node`로 실행합니다.

::: details 정답 보기
```ts
const productName: string = '카페라떼'
const price: number = 5000
const quantity: number = 2

console.log(productName + ' ' + quantity + '개: ' + price * quantity + '원')
```

```bash
npx tsc
node receipt.js
```

```text
카페라떼 2개: 10000원
```

`npx tsc`는 `receipt.ts`를 컴파일해 `receipt.js`를 만들고, `node`는 그 `.js`를 실행합니다.
:::

### 문제 3. 에러 메시지에서 위치 찾기 ⭐⭐

아래 코드를 `check.ts`로 저장하고 `npx tsc --noEmit`을 실행하세요. 에러가 몇 개이고, 각각 몇째 줄 몇째 칸인지 적어 보세요.

```ts
const memberName: string = '김민지'
const point: number = '1000'
const isVip: boolean = 'true'
console.log(memberName, point, isVip)
```

::: details 정답 보기
```text
check.ts:2:7 - error TS2322: Type 'string' is not assignable to type 'number'.

2 const point: number = '1000'
        ~~~~~

check.ts:3:7 - error TS2322: Type 'string' is not assignable to type 'boolean'.

3 const isVip: boolean = 'true'
        ~~~~~


Found 2 errors in the same file, starting at: check.ts:2
```

에러는 2개이고, 위치는 `2:7`(2번째 줄 7번째 칸)과 `3:7`입니다. 7번째 칸은 `const `(공백 포함 6글자) 다음, 변수 이름이 시작하는 곳입니다. `'1000'`과 `'true'`는 따옴표 때문에 **문자열**입니다. 따옴표를 지워 `1000`, `true`로 고치면 에러가 사라집니다.
:::

### 문제 4. noEmitOnError 효과 확인하기 ⭐⭐

`tsconfig.json`에 `"noEmitOnError": true`가 **없는** 상태와 **있는** 상태에서, 타입 에러가 있는 파일을 `npx tsc`로 컴파일하면 각각 `.js` 파일이 생기는지 확인하고, 결과를 한 문장으로 정리하세요.

::: details 정답 보기
- 옵션 없음: 에러 메시지가 나오지만 `.js` 파일이 **생깁니다.**
- 옵션 있음: 에러 메시지가 나오고 `.js` 파일이 **생기지 않습니다.**

한 문장 정리: "tsc는 기본적으로 타입 검사와 JavaScript 출력을 따로 하므로 에러가 있어도 출력하지만, `noEmitOnError`를 켜면 에러가 있을 때 출력을 멈춘다."

주의: 옵션을 켜기 전에 만들어진 옛 `.js` 파일은 그대로 남아 있으므로, 확인하기 전에 지우고 실행해야 정확합니다.
:::

### 문제 5. tsx와 tsc --noEmit 같이 쓰기 ⭐⭐

`hello.ts`의 `visitCount`에 `'세 번'`을 넣은 상태에서 ① `npx tsx hello.ts`와 ② `npx tsc --noEmit`을 각각 실행하고, 두 명령의 차이를 설명하세요.

::: details 정답 보기
① `npx tsx hello.ts`: 에러 없이 실행되어 `한빛 카페에 세 번번째 방문했습니다.`가 출력됩니다.

② `npx tsc --noEmit`: `error TS2322: Type 'string' is not assignable to type 'number'.`를 출력하고, 파일은 만들지 않습니다.

tsx는 **실행만**, `tsc --noEmit`은 **검사만** 합니다. 둘을 함께 써야 "빠른 실행"과 "타입 안전"을 모두 얻습니다.
:::

### 문제 6. 명령에 별명 붙이기 ⭐⭐⭐

`package.json`의 `scripts`에 다음 두 줄을 넣으면 `npm run check`, `npm run start`로 명령을 짧게 부를 수 있습니다. 직접 넣고 실행해 보세요. 쉼표 위치에 주의합니다.

```json
  "scripts": {
    "check": "tsc --noEmit",
    "start": "tsx hello.ts"
  },
```

::: details 정답 보기
`package.json`의 원래 `"scripts"` 부분(`"test": ...` 한 줄)을 위 내용으로 바꿉니다. 실행 결과:

```bash
npm run check
npm run start
```

```text

> hello-ts@1.0.0 check
> tsc --noEmit


> hello-ts@1.0.0 start
> tsx hello.ts

안녕하세요, TypeScript!
한빛 카페에 3번째 방문했습니다.
```

`scripts` 안에서는 `npx`를 붙이지 않아도 됩니다. npm이 프로젝트의 `node_modules`에서 도구를 알아서 찾아 주기 때문입니다. JSON은 마지막 항목 뒤에 쉼표를 쓰면 에러가 나니 주의하세요(`tsconfig.json`과 달리 `package.json`은 엄격한 JSON입니다). `scripts` 활용은 Part 6에서 더 다룹니다.
:::

## 확인 퀴즈

**Q1.** `npm install -D typescript`에서 `-D`는 무슨 뜻이고, 왜 붙이나요?

::: details 정답 보기
"개발할 때만 쓰는 도구(`devDependencies`)로 기록하라"는 뜻입니다. TypeScript 컴파일러는 코드를 JavaScript로 바꿀 때만 필요하고, 완성된 프로그램을 실행할 때는 필요 없기 때문입니다.
:::

**Q2.** `node_modules` 폴더를 지우면 어떻게 되고, 어떻게 되살리나요?

::: details 정답 보기
설치한 패키지 파일이 사라져 `npx tsc` 등이 동작하지 않게 됩니다. `package.json`과 `package-lock.json`이 남아 있으면 `npm install`로 똑같이 다시 설치할 수 있습니다. 그래서 `node_modules`는 공유하지 않습니다.
:::

**Q3.** 타입 에러가 있는데도 `npx tsc`가 `.js` 파일을 만드는 이유는 무엇이고, 막으려면 어떤 옵션을 켜나요?

::: details 정답 보기
tsc의 타입 검사와 JavaScript 출력은 기본적으로 독립되어 있어서, 타입이 틀려도 JavaScript로 바꿀 수 있으면 출력합니다. 막으려면 `tsconfig.json`에 `"noEmitOnError": true`를 켭니다.
:::

**Q4.** `npx tsx hello.ts`로 실행했을 때 에러가 안 났다면, 타입 에러가 없다고 확신할 수 있나요?

::: details 정답 보기
아닙니다. tsx는 타입 검사를 하지 않습니다. VS Code의 빨간 밑줄이나 `npx tsc --noEmit`으로 따로 확인해야 합니다.
:::

**Q5.** `hello.ts`를 고친 뒤 `node hello.js`를 실행했는데 예전 결과가 나옵니다. 무엇을 빠뜨렸나요?

::: details 정답 보기
`npx tsc`로 다시 컴파일하지 않았습니다. `node`는 `.js` 파일을 실행하므로, `.ts`를 고칠 때마다 다시 컴파일해야 합니다.
:::

## 정리

- 새 프로젝트는 `npm init -y` → `npm install -D typescript` → `npx tsc --init` 순서로 만듭니다.
- `package.json`은 프로젝트 명함, `package-lock.json`은 정확한 설치 버전 기록, `node_modules`는 설치된 패키지 실물(공유하지 않음), `tsconfig.json`은 컴파일 설정입니다.
- `npx tsc`는 `tsconfig.json`을 읽고 `.ts`를 검사·컴파일해 `.js`를 만들고, `node`가 `.js`를 실행합니다.
- 에러 메시지의 `파일:줄:칸`과 `TS2322` 같은 에러 코드가 문제 위치와 종류를 알려 줍니다.
- tsc는 기본적으로 에러가 있어도 `.js`를 만듭니다. 막으려면 `noEmitOnError`를 켭니다.
- `npx tsx 파일.ts`는 빠르게 실행만 하고 **타입 검사는 하지 않으므로**, 검사는 `npx tsc --noEmit`과 VS Code 빨간 밑줄로 합니다.

## 다음 단계

[에러 메시지 읽는 법과 도움 받는 법](./06-how-to-read-errors) — 이번에 처음 본 빨간 에러 메시지를 한 조각씩 해부하고, 모르는 에러를 검색·AI·공식 문서로 해결하는 방법을 배웁니다.
