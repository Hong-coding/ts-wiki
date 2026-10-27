---
title: '모듈 시스템: ESM · CommonJS · moduleResolution'
---

# 모듈 시스템: ESM · CommonJS · moduleResolution

<LessonMeta level="실전" :minutes="50" prev="strict가 켜는 옵션 9개와 추가 권장 엄격 옵션" />

## 이번에 배울 것

- CommonJS(`require`)와 ES 모듈(`import`)이 왜 둘 다 존재하는지 역사를 설명할 수 있다.
- `package.json`의 `type` 필드와 파일 확장자(`.mts`·`.cts`)로 **파일 하나하나가 어떤 모듈로 해석되는지** 판단할 수 있다.
- 프로젝트 종류에 맞게 `module`·`moduleResolution`(`nodenext`, `bundler`)을 고를 수 있다.
- TS2835(확장자 누락), TS1479(CommonJS에서 ESM 가져오기), `ERR_MODULE_NOT_FOUND`, `__dirname is not defined` 같은 흔한 에러를 재현하고 고칠 수 있다.

## 먼저 알아 둘 것

- [모듈: import/export와 타입 전용 import](../part3-intermediate/09-modules)
- [tsconfig.json 완전 정복](./01-tsconfig) — `module`, `moduleResolution`, `rootDir`/`outDir`

이 레슨의 예제는 Node.js 24.13.1, TypeScript 5.9.3, `@types/node` 22.20.5로 실제 프로젝트를 만들어 컴파일·실행했습니다. 일부 비교는 TypeScript 5.6.3에서도 돌려 보았습니다.

## 비유로 이해하기

한 회사에 **옛날 결재 양식**과 **새 결재 양식**이 함께 쓰인다고 해 봅시다.

- 옛날 양식(CommonJS)은 결재 도장을 받는 순간 바로 서류를 넘겨받습니다(`require`는 그 자리에서 파일을 읽어 옴).
- 새 양식(ES 모듈)은 "이 서류들이 필요합니다"라는 목록을 맨 앞에 미리 적어 두고, 목록을 보고 한꺼번에 준비합니다(`import`는 실행 전에 미리 분석).
- 부서마다 어떤 양식을 쓰는지 **문 앞에 붙은 표지판**(`package.json`의 `type`)으로 정합니다. 서류 자체에 "새 양식"(`.mts`)이나 "옛날 양식"(`.cts`)이라고 찍혀 있으면 표지판보다 그 도장이 우선합니다.
- 결재 담당자(`moduleResolution`)는 "서류 이름만 보고 실제 캐비닛 어디에 있는지 찾는 규칙"입니다. 회사 본관(Node)과 외주 대행사(번들러)의 규칙이 조금 다릅니다.

TypeScript의 `module` 관련 옵션은 결국 **"내 코드가 어느 건물에서, 어떤 양식으로 실행되는가"를 컴파일러에게 정확히 알려 주는 일**입니다.

## 개념 설명

### 1단계: 두 모듈 시스템이 생긴 역사

**모듈**(module)은 "코드를 파일 단위로 나누고, 필요한 것만 주고받는 방식"입니다. JavaScript는 처음에 모듈 문법이 없었습니다.

| 시기 | 사건 |
|---|---|
| 2009년 | Node.js가 등장하며 **CommonJS**(CJS)를 채택: `require()`와 `module.exports` |
| 2015년 | JavaScript 표준(ES2015)에 **ES 모듈**(ESM): `import`와 `export` |
| 2017~2018년 | 브라우저들이 `<script type="module">`로 ESM 지원 |
| 2019~2020년 | Node.js 12~14에서 ESM 정식 지원. 이때부터 **두 방식이 한 생태계에 공존** |
| 2024~2025년 | Node.js 22.12에서 CommonJS가 ESM을 `require()` 할 수 있게 됨(기본 허용) |

```js
// CommonJS — Node.js 전통 방식
const { won } = require('./price')
module.exports = { totalPrice }
```

```js
// ES 모듈 — 표준 방식
import { won } from './price.js'
export function totalPrice() {}
```

두 방식의 차이는 문법만이 아닙니다.

| 비교 | CommonJS | ES 모듈 |
|---|---|---|
| 가져오기 | `require()` — 실행 중 아무 데서나 호출하는 **함수** | `import` — 파일 맨 위의 **선언**, 실행 전에 분석 |
| 확장자 생략 | 가능(`require('./price')`) | Node에서는 **불가**(`'./price.js'`처럼 정확히) |
| `__dirname`, `__filename` | 있음 | 없음 → `import.meta.dirname`(Node 20.11+) |
| 최상위 `await` | 불가 | 가능 |
| 엄격 모드 | 직접 `"use strict"` | 항상 엄격 모드 |

새 프로젝트는 **ES 모듈**로 시작하는 것이 원칙입니다. CommonJS는 오래된 프로젝트와 패키지를 읽기 위해 알아 둡니다.

### 2단계: 이 파일은 CJS인가 ESM인가 — type 필드와 확장자

TypeScript의 `import` 문법은 겉보기에 항상 ESM입니다. 하지만 **실제로 어떤 모듈로 실행될지**는 Node.js의 규칙으로 정해지고, `module: nodenext`인 TypeScript도 그 규칙을 그대로 따릅니다.

| 파일 | 가장 가까운 `package.json`의 `type` | 실행 방식 |
|---|---|---|
| `.ts` → `.js` | `"module"` | **ESM** |
| `.ts` → `.js` | `"commonjs"` 또는 없음 | **CommonJS** |
| `.mts` → `.mjs` | 상관없음 | 항상 **ESM** |
| `.cts` → `.cjs` | 상관없음 | 항상 **CommonJS** |

```json
// package.json
{
  "name": "cart-app",
  "type": "module"
}
```

::: warning npm init -y의 기본값
작성 시점의 npm 11.8.0은 `npm init -y`로 만든 `package.json`에 `"type": "commonjs"`를 **명시적으로** 넣습니다. ESM 프로젝트를 만들려면 `npm pkg set type=module`로 바꿔야 합니다.
:::

`.mts`·`.cts`는 한 프로젝트에서 두 방식을 섞어야 할 때 씁니다. 실제로 만들어 봅시다(`type`이 `commonjs`인 프로젝트).

```ts
// src/config.cts — CommonJS로 고정
const storeName = '강남점'
export = { storeName }
```

```ts
// src/report.mts — ESM으로 고정
import config from './config.cjs'
import { won } from './price.js'
console.log(config.storeName, won(9500))
```

```powershell
npx tsc
node dist/report.mjs
```

```text
강남점 9,500원
```

결과 폴더에는 `config.cjs`, `report.mjs`가 생깁니다. **import 경로도 결과 파일 확장자(`.cjs`, `.js`)로 적는 것**에 주의하세요. `config.cjs`를 열어 보면 `module.exports = { storeName };`로 바뀌어 있습니다. `export =`는 CommonJS의 `module.exports =`를 나타내는 TypeScript 문법입니다.

### 3단계: module과 moduleResolution 고르기

두 옵션은 서로 다른 질문에 답합니다.

- `module`: "결과 JS에 `import`를 남길까, `require`로 바꿀까? 그리고 이 코드는 어떤 실행 환경용인가?"
- `moduleResolution`: "`import '...'`의 문자열을 보고 **어떤 파일**을 찾아갈까?"

요즘은 아래 두 조합 가운데 하나를 고르면 됩니다.

| 상황 | `module` | `moduleResolution` | 확장자 규칙 |
|---|---|---|---|
| `tsc`로 빌드해 **Node.js가 직접 실행**(서버, CLI, 라이브러리) | `nodenext` | `nodenext` | ESM 파일의 상대 경로는 `.js` 필수 |
| **번들러**(Vite, webpack, esbuild 등)가 묶어서 실행 | `esnext` 또는 `preserve` | `bundler` | 확장자 생략 가능 |

```text
내 코드를 마지막에 실행하는 것이 누구인가?
├─ node dist/index.js  → nodenext / nodenext
└─ Vite·webpack 등이 묶어 브라우저(또는 번들된 서버)에서 실행 → esnext / bundler
```

조금 더 알아 두면 좋은 값들입니다.

| 값 | 설명 | 도입 |
|---|---|---|
| `node16` | Node 16 시절 규칙에 고정. CommonJS에서 ESM `require` 불가 | 4.7 |
| `nodenext` | 최신 Node 규칙을 따라감(TS 버전이 오르면 함께 바뀜). 5.8부터 CommonJS에서 ESM `require` 허용 | 4.7 |
| `node18` / `node20` | 특정 Node 버전 규칙에 고정 | 5.8 / 5.9 |
| `bundler` | 번들러용. `package.json`의 `exports`는 읽되 확장자 생략 허용 | 5.0 |
| `preserve` (`module`) | `import`/`require`를 쓴 그대로 남김. 번들러용 | 5.4 |
| `node`(=`node10`), `classic` | 옛 규칙. **6.0에서 지원 중단, 7.0에서 제거**(작성 시점 실제 확인) | — |

::: tip nodenext로 검사하면 번들러에서도 안전합니다
`nodenext`는 가장 까다로운 규칙이라, 여기서 통과한 코드는 번들러에서도 대부분 동작합니다. 반대로 `bundler`에서 통과한 코드는 `node`로 바로 실행하면 실패할 수 있습니다(5단계에서 재현). 그래서 npm 라이브러리는 `nodenext`로 검사하는 것을 권장합니다.
:::

### 4단계: 흔한 에러 ① TS2835 — 상대 경로 확장자 누락

`type: module` 프로젝트에서 `module: nodenext`로 설정하고, 습관대로 확장자 없이 import 해 봅시다.

```ts
// src/price.ts
export function won(amount: number): string {
  return amount.toLocaleString('ko-KR') + '원'
}
```

```ts
// src/index.ts
import { won } from './price'
// ❌ Relative import paths need explicit file extensions in ECMAScript imports when '--moduleResolution' is 'node16' or 'nodenext'. Did you mean './price.js'? (TS2835)
console.log(won(4500))
```

**왜 `.ts`가 아니라 `.js`일까요?** TypeScript는 import 문자열을 **고치지 않고 그대로** 결과 JS에 옮깁니다. 실행 시점에 디스크에 있는 파일은 `dist/price.js`이므로, Node가 찾을 수 있도록 처음부터 `.js`로 적는 것입니다. TypeScript는 `./price.js`를 보면 "검사할 때는 `price.ts`를 보면 되겠구나" 하고 알아서 연결해 줍니다.

```ts
// src/index.ts — 고친 코드
import { won } from './price.js'
console.log(won(4500))
```

```text
4,500원
```

`.ts`로 적으면 어떨까요?

```ts
import { won } from './price.ts'
// ❌ An import path can only end with a '.ts' extension when 'allowImportingTsExtensions' is enabled. (TS5097)
```

`allowImportingTsExtensions`(5.0+)는 결과 파일을 만들지 않는 `noEmit` 설정(번들러 프로젝트)이나, 다음 레슨에서 볼 Node의 타입 스트리핑처럼 **`.ts`를 그대로 실행하는 환경**에서만 켭니다.

### 5단계: 흔한 에러 ② bundler로 검사하고 node로 실행

`moduleResolution: bundler`는 확장자 생략을 허용합니다. 이 설정으로 `tsc` 빌드해서 `node`로 실행하면 어떻게 될까요?

```json
{
  "compilerOptions": {
    "target": "es2023",
    "module": "esnext",
    "moduleResolution": "bundler",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true
  },
  "include": ["src"]
}
```

```ts
// src/index.ts
import { won } from './price'
console.log(won(4500))
```

```powershell
npx tsc            # 에러 없음
node dist/index.js
```

```text
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '...\dist\price' imported from ...\dist\index.js
```

검사는 통과했지만 실행이 실패합니다. 번들러는 확장자를 알아서 붙여 주지만 Node는 그러지 않기 때문입니다. **실행하는 주체에 맞는 `moduleResolution`을 고르는 것**이 핵심입니다. Node가 실행한다면 `nodenext`로 바꾸고 4단계처럼 `.js`를 붙입니다.

### 6단계: 흔한 에러 ③ ESM에서 __dirname 쓰기

CommonJS 시절 코드에서 자주 보던 `__dirname`(현재 파일이 있는 폴더 경로)을 ESM에서 쓰면 컴파일은 통과합니다. `@types/node`가 전역으로 선언해 두었기 때문입니다. 하지만 실행하면 터집니다.

```ts
// src/index.ts (type: module)
console.log(__dirname)
```

```text
ReferenceError: __dirname is not defined in ES module scope
```

고친 코드: ESM에서는 `import.meta`를 씁니다.

```ts
console.log(import.meta.dirname) // 현재 파일의 폴더 (Node 20.11+)
console.log(import.meta.filename) // 현재 파일의 전체 경로 (Node 20.11+)
```

```text
...\cart-app\dist
...\cart-app\dist\index.js
```

더 오래된 Node를 지원해야 한다면 `fileURLToPath(new URL('.', import.meta.url))`(`node:url`)를 씁니다.

### 7단계: 흔한 에러 ④ TS1479 — CommonJS에서 ESM 전용 패키지 가져오기

요즘 많은 npm 패키지가 **ESM 전용**입니다. `type: commonjs` 프로젝트의 `.ts` 파일에서 그런 패키지를 import 하면 무슨 일이 생기는지 봅시다. (`esm-only`는 실습용으로 만든 가짜 ESM 전용 패키지입니다.)

```ts
// src/greet.ts — type: commonjs 프로젝트
import { hello } from 'esm-only'
console.log(hello())
```

TypeScript 5.6.3 (`module: nodenext`), 또는 5.9.3에서 `module: node16`:

```text
error TS1479: The current file is a CommonJS module whose imports will produce 'require' calls; however, the referenced file is an ECMAScript module and cannot be imported with 'require'. Consider writing a dynamic 'import("esm-only")' call instead.
  To convert this file to an ECMAScript module, change its file extension to '.mts' or create a local package.json file with `{ "type": "module" }`.
```

TypeScript 5.9.3에서 `module: nodenext` 또는 `node20`: **에러 없음**, Node 24에서 실행하면 `안녕하세요`가 출력됩니다.

결과가 다른 이유는 Node.js가 22.12부터 CommonJS에서 ESM을 `require()` 하는 기능을 기본으로 허용했고, TypeScript가 5.8(`nodenext`)·5.9(`node20`)부터 이를 반영했기 때문입니다. 그래도 가장 깔끔한 해결은 에러 메시지가 알려 주는 대로 **프로젝트를 ESM으로 바꾸는 것**(`"type": "module"`)입니다. 옛 Node를 지원해야 하는 등 바꿀 수 없다면 `await import('esm-only')`처럼 동적 import를 씁니다.

### 8단계: verbatimModuleSyntax와 CommonJS

01 레슨의 추천 설정에 있던 `verbatimModuleSyntax`(5.0+)는 "import/export를 **쓴 그대로** 내보낸다"는 옵션입니다. 그래서 CommonJS로 실행될 파일에 ESM 문법을 쓰면 에러를 냅니다.

```text
src/index.ts(1,10): error TS1295: ECMAScript imports and exports cannot be written in a CommonJS file under 'verbatimModuleSyntax'. Adjust the 'type' field in the nearest 'package.json' to make this file an ECMAScript module, or adjust your 'verbatimModuleSyntax', 'module', and 'moduleResolution' settings in TypeScript.
src/price.ts(1,1): error TS1287: A top-level 'export' modifier cannot be used on value declarations in a CommonJS module when 'verbatimModuleSyntax' is enabled.
```

`npm init -y` 직후(`"type": "commonjs"`)에 추천 설정을 붙여 넣으면 바로 이 에러를 만납니다. 해결은 역시 `npm pkg set type=module`입니다. 이 옵션 덕분에 "내가 ESM이라고 생각한 파일이 실제로는 CommonJS로 실행되는" 착각을 일찍 잡을 수 있습니다.

### 9단계: 한눈에 보는 결정 순서

```text
1. package.json에 "type": "module"을 넣는다 (새 프로젝트라면 무조건)
2. 실행 주체를 정한다
   - node가 직접 실행 → "module": "nodenext", "moduleResolution": "nodenext"
   - 번들러가 실행     → "module": "esnext",   "moduleResolution": "bundler"
3. nodenext라면 상대 경로 import에 .js를 붙인다
4. "verbatimModuleSyntax": true 로 착각을 막는다
5. CommonJS 파일이 꼭 필요하면 그 파일만 .cts로 만든다
```

공식 문서: [Modules — Choosing Compiler Options](https://www.typescriptlang.org/docs/handbook/modules/guides/choosing-compiler-options.html), [Node.js — Modules: Packages](https://nodejs.org/api/packages.html)

## 자주 하는 실수

### 실수 1: type: module 없이 ESM이라고 믿기

```json
{ "name": "cart-app", "type": "commonjs" }
```

```ts
// src/index.ts
import { won } from './price.js'
```

왜 틀렸나: `import`라고 썼어도 `type`이 `commonjs`면 결과 JS는 `require()`로 바뀝니다(`verbatimModuleSyntax`가 꺼져 있을 때). 최상위 `await`를 쓰거나 ESM 전용 패키지를 쓰는 순간 문제가 됩니다. `verbatimModuleSyntax`가 켜져 있으면 TS1295 에러가 납니다.

고친 코드:

```powershell
npm pkg set type=module
```

### 실수 2: .js 대신 .ts를 붙이거나 아예 생략하기

```ts
import { won } from './price' // TS2835 (nodenext)
import { totalPrice } from './cart.ts' // TS5097
```

왜 틀렸나: Node는 결과 폴더의 `.js` 파일을 찾습니다. TypeScript는 import 문자열을 바꿔 주지 않습니다.

고친 코드:

```ts
import { won } from './price.js'
import { totalPrice } from './cart.js'
```

### 실수 3: 실행 주체와 다른 moduleResolution

```json
{ "compilerOptions": { "module": "esnext", "moduleResolution": "bundler", "outDir": "dist" } }
```

왜 틀렸나: 번들러 없이 `node dist/index.js`로 실행하는 서버인데 `bundler`를 골랐습니다. 확장자 없는 import가 통과해 실행 중 `ERR_MODULE_NOT_FOUND`가 납니다.

고친 코드:

```json
{ "compilerOptions": { "module": "nodenext", "moduleResolution": "nodenext", "outDir": "dist" } }
```

### 실수 4: ESM 파일에서 require나 __dirname 쓰기

```ts
const fs = require('node:fs')
console.log(__dirname)
```

왜 틀렸나: ESM 범위에는 `require`, `__dirname`이 없습니다. 실행하면 `ReferenceError: __dirname is not defined in ES module scope`가 납니다.

고친 코드:

```ts
import fs from 'node:fs'
console.log(import.meta.dirname)
```

## 직접 해 보기

### 문제 1 ⭐ 모듈 판별

`package.json`에 `"type": "module"`이 있는 프로젝트입니다. 다음 파일은 각각 ESM과 CommonJS 중 무엇으로 실행될까요? 결과 파일 확장자는?

```text
src/index.ts
src/legacy/config.cts
src/tools/report.mts
```

::: details 정답 보기
- `src/index.ts` → ESM, `index.js`
- `src/legacy/config.cts` → CommonJS, `config.cjs` (확장자가 `type`보다 우선)
- `src/tools/report.mts` → ESM, `report.mjs`
:::

### 문제 2 ⭐ 에러 고치기

`module: nodenext`, `type: module` 프로젝트에서 다음 에러가 났습니다. 어떻게 고칠까요?

```text
src/order.ts(2,26): error TS2835: Relative import paths need explicit file extensions in ECMAScript imports when '--moduleResolution' is 'node16' or 'nodenext'. Did you mean './member/grade.js'?
```

::: details 정답 보기
`src/order.ts` 2번째 줄의 import 경로를 `'./member/grade.js'`로 바꿉니다. 실제 소스 파일은 `grade.ts`여도 `.js`로 적습니다. 실행 시점에 존재하는 파일이 `grade.js`이기 때문입니다.
:::

### 문제 3 ⭐⭐ 설정 고르기

다음 세 프로젝트에 알맞은 `module`·`moduleResolution` 조합을 고르세요.

1. Express로 만든 주문 API 서버. `tsc`로 빌드하고 `node dist/server.js`로 실행
2. Vite + React 매장 관리 화면
3. 사내 npm 패키지(날짜·금액 포맷 함수 모음). 쓰는 쪽이 Node일 수도, Vite일 수도 있음

::: details 정답 보기
1. `nodenext` / `nodenext` — Node가 직접 실행합니다.
2. `esnext` / `bundler` — Vite가 묶습니다(`noEmit`과 함께).
3. `nodenext` / `nodenext` — 가장 까다로운 규칙으로 검사해야 Node와 번들러 양쪽에서 안전합니다.
:::

### 문제 4 ⭐⭐ __dirname 옮기기

CommonJS 시절의 다음 코드를 ESM(Node 22)용으로 바꾸세요. `data/products.json`은 현재 파일 기준 상위 폴더에 있습니다.

```ts
const fs = require('fs')
const path = require('path')
const file = path.join(__dirname, '..', 'data', 'products.json')
const products = JSON.parse(fs.readFileSync(file, 'utf8'))
```

::: details 정답 보기
```ts
import fs from 'node:fs'
import path from 'node:path'

const file = path.join(import.meta.dirname, '..', 'data', 'products.json')
const products: unknown = JSON.parse(fs.readFileSync(file, 'utf8'))
```

`JSON.parse`의 결과는 실제로 무엇이 들어 있을지 모르므로 `unknown`으로 받고, [런타임 검증](../part4-async/05-runtime-validation)으로 확인한 뒤 쓰는 것이 안전합니다.
:::

### 문제 5 ⭐⭐⭐ 원인 추적

동료가 "`tsc`는 에러가 없는데 `node dist/index.js`를 하면 `ERR_MODULE_NOT_FOUND`가 난다"고 합니다. `tsconfig.json`에는 `"moduleResolution": "bundler"`, `"paths": { "@/*": ["./src/*"] }`가 있고, 코드에는 `import { won } from '@/utils/format'`이 있습니다. 원인 두 가지와 해결책을 말해 보세요.

::: details 정답 보기
1. `bundler`는 확장자 생략을 허용하지만 Node는 허용하지 않습니다. → `module`·`moduleResolution`을 `nodenext`로 바꾸고 `.js`를 붙입니다.
2. `paths` 별칭은 결과 JS에서 바뀌지 않아 Node가 `@/utils`를 패키지 이름으로 찾습니다([01 레슨](./01-tsconfig) 7단계). → 상대 경로로 바꿉니다.

```ts
import { won } from './utils/format.js'
```
:::

## 확인 퀴즈

1. `.ts` 파일이 CommonJS로 실행될지 ESM으로 실행될지는 무엇으로 정해질까요?
2. `module: nodenext`에서 상대 경로 import에 `.ts`가 아니라 `.js`를 쓰는 이유는?
3. Vite 프로젝트에 알맞은 `moduleResolution` 값은?
4. ESM 파일에서 `__dirname` 대신 쓸 수 있는 것은?
5. `verbatimModuleSyntax`를 켜면 CommonJS 파일에 `export function`을 쓸 때 어떻게 될까요?

::: details 정답 보기
1. 가장 가까운 `package.json`의 `type` 필드, 그리고 확장자(`.mts`는 항상 ESM, `.cts`는 항상 CommonJS)입니다.
2. TypeScript는 import 문자열을 그대로 결과 JS에 옮기고, 실행 시점에 존재하는 파일은 `.js`이기 때문입니다.
3. `bundler`(`module`은 `esnext` 또는 `preserve`)입니다.
4. `import.meta.dirname`(Node 20.11+) 또는 `import.meta.url`을 `fileURLToPath`로 바꾼 값입니다.
5. TS1287 에러가 납니다. 파일을 ESM으로 바꾸거나(`type: module`), CommonJS 문법(`export =`)을 씁니다.
:::

## 정리

- CommonJS(`require`)는 Node의 옛 방식, ES 모듈(`import`)은 표준 방식입니다. 새 프로젝트는 ESM으로 시작합니다.
- 파일의 모듈 종류는 `package.json`의 `type`과 확장자(`.mts`/`.cts`)로 정해집니다. `npm init -y`는 `"type": "commonjs"`를 넣으니 바꿔 줍니다.
- Node가 직접 실행하면 `nodenext`/`nodenext`, 번들러가 묶으면 `esnext`/`bundler`를 고릅니다.
- `nodenext`의 ESM 파일은 상대 경로에 `.js`를 붙입니다(TS2835).
- `bundler`로 검사하고 `node`로 실행하면 `ERR_MODULE_NOT_FOUND`가 날 수 있습니다.
- ESM에서는 `__dirname` 대신 `import.meta.dirname`을 씁니다.

## 다음 단계

[ESLint(typescript-eslint)와 Prettier](./04-eslint-prettier) — 타입 검사로는 잡히지 않는 실수와 들쭉날쭉한 코드 모양을 린터와 포매터로 자동 정리하는 법을 배웁니다.
