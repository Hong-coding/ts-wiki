---
title: '빌드 도구: tsc · Vite · tsup · tsx'
---

# 빌드 도구: tsc · Vite · tsup · tsx

<LessonMeta level="실전" :minutes="45" prev="Vitest로 단위 테스트·목·타입 테스트·커버리지 작성" />

## 이번에 배울 것

- "타입 검사"와 "JS로 변환"이 서로 다른 일이라는 것을 설명할 수 있다.
- `tsc`만으로 빌드하는 방법과, `tsx`·Node 타입 스트리핑으로 `.ts`를 바로 실행하는 방법을 쓸 수 있다.
- 프론트엔드는 Vite, 라이브러리는 tsup으로 빌드할 수 있다.
- 어떤 도구가 타입 검사를 **하지 않는지** 알고, `tsc --noEmit`을 함께 돌리도록 스크립트를 짤 수 있다.

## 먼저 알아 둘 것

- [tsconfig.json 완전 정복](./01-tsconfig) — `outDir`, `noEmit`, `declaration`
- [모듈 시스템](./03-module-systems) — ESM, `.js` 확장자, `allowImportingTsExtensions`

이 레슨은 작성 시점(2026-10)에 Windows 11, Node.js 24.13.1에서 아래 버전으로 실제 프로젝트를 만들어 확인했습니다.

| 도구 | 버전 | 공식 문서 |
|---|---|---|
| `typescript` | 5.9.3 (`npm install -D typescript@5`) | [typescriptlang.org](https://www.typescriptlang.org/docs/handbook/compiler-options.html) |
| `tsx` | 4.23.15 | [tsx.is](https://tsx.is/) |
| `vite` | 8.3.5 | [vite.dev](https://vite.dev/guide/) |
| `tsup` | 9.0.0 | [tsup.egoist.dev](https://tsup.egoist.dev/) |
| Node.js 타입 스트리핑 | Node 24.13.1 내장 | [Node.js — TypeScript](https://nodejs.org/api/typescript.html) |

::: info TypeScript 7을 설치했다면
`npm install -D typescript`로 버전을 지정하지 않으면 작성 시점 최신인 7.0.2(Go로 다시 만든 컴파일러)가 설치됩니다. `tsc` 명령과 이 레슨의 사용법은 같고 훨씬 빠르지만, 6.0에서 지원 중단된 옵션(`baseUrl`, `moduleResolution: node` 등)이 **완전히 제거**되어 옛 설정이 에러가 납니다([01 레슨](./01-tsconfig#ts6-changes)). 이 위키는 5.x 기준이므로 `typescript@5`로 고정해 설치합니다.
:::

## 비유로 이해하기

수입 상품을 매장에 들여오는 과정을 생각해 봅시다.

- **검수**: 송장과 실제 물건이 맞는지 하나하나 대조합니다. 시간이 걸립니다. → **타입 검사**
- **포장 갈이**: 외국어 포장을 벗기고 한국어 라벨을 붙여 진열 가능한 상태로 만듭니다. 빠릅니다. → **변환**(TS → JS, 타입 지우기)

`tsc`는 검수와 포장 갈이를 **둘 다** 하는 꼼꼼한 직원입니다. 반면 esbuild·Vite·tsx 같은 도구는 **포장 갈이만** 아주 빠르게 하는 전문 업체입니다. 송장과 내용물이 달라도 그냥 포장을 갈아 진열대에 올립니다.

그래서 실무에서는 "빠른 업체로 포장 갈이 + `tsc`로 검수만 따로(`--noEmit`)"를 조합합니다. 이 레슨의 핵심이 이 한 줄입니다.

## 개념 설명

### 1단계: 타입 검사와 변환은 다른 일

TypeScript 코드를 실행하려면 **타입을 지워** JavaScript로 만들어야 합니다. 타입을 지우는 일 자체는 아주 단순합니다. `: number`, `interface ...` 같은 부분만 걷어 내면 되니까요. 반면 타입이 **맞는지 검사**하려면 프로젝트 전체 파일을 읽고 서로 어떻게 연결되는지 따져야 해서 오래 걸립니다.

| 도구 | 변환(JS 만들기) | 타입 검사 | 주 용도 |
|---|---|---|---|
| `tsc` | ✅ | ✅ | Node 앱·라이브러리 빌드, 타입 검사 전용(`--noEmit`) |
| `tsx` | ✅ (실행하면서) | ❌ | 개발 중 `.ts` 바로 실행, 스크립트 |
| Node 타입 스트리핑 | ✅ (실행하면서) | ❌ | 설치 없이 `.ts` 바로 실행 |
| Vite | ✅ (번들링) | ❌ | 프론트엔드 앱 |
| tsup | ✅ (번들링 + `.d.ts`) | ❌ (아래 실험 참고) | npm 라이브러리 |
| Vitest | ✅ (테스트 실행) | ❌ (`--typecheck` 제외) | 테스트 |

**❌인 도구들은 모두 타입 에러가 있어도 성공합니다.** 아래에서 하나씩 직접 확인합니다.

### 2단계: tsc만 쓰는 경우

가장 단순한 구성입니다. [01 레슨](./01-tsconfig)의 `cart-app`이 바로 이 방식이었습니다.

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

```powershell
npm run build
npm start
```

- 장점: 도구가 하나뿐이라 설정이 단순하고, 빌드가 곧 타입 검사입니다. 타입 에러가 있으면 빌드가 실패합니다(기본값 `noEmitOnError: false`라 JS는 만들어지지만 종료 코드가 실패라서 CI가 멈춤).
- 단점: 파일을 하나로 묶지(번들링) 않고, 프로젝트가 크면 느립니다. 개발 중에 매번 빌드 후 실행하는 것이 번거롭습니다.
- 개발 중에는 `npx tsc --watch`로 저장할 때마다 다시 빌드할 수 있습니다.

**어울리는 곳**: 작은 Node 서버, CLI, 사내 스크립트.

### 3단계: tsx로 바로 실행하기

**tsx**는 `.ts` 파일을 빌드 없이 바로 실행해 주는 도구입니다(이름이 React의 `.tsx` 확장자와 같아 헷갈리지만 별개입니다). 내부에서 esbuild로 타입을 지우고 곧바로 Node에 넘깁니다.

```powershell
npm install -D tsx
```

```ts
// src/price.ts
export function won(amount: number): string {
  return amount.toLocaleString('ko-KR') + '원'
}
```

```ts
// src/index.ts
import { won } from './price.ts'

interface CartItem {
  name: string
  price: number
  quantity: number
}

const cart: CartItem[] = [
  { name: '아메리카노', price: 4500, quantity: 2 },
  { name: '치즈케이크', price: 6500, quantity: 1 },
]
const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)
console.log('합계:', won(total))
```

```powershell
npx tsx src/index.ts
```

```text
합계: 15,500원
```

`tsx watch src/index.ts`로 실행하면 파일을 저장할 때마다 자동으로 다시 실행됩니다. 개발 서버에 편리합니다.

**tsx는 타입 검사를 하지 않습니다.** 일부러 틀린 코드로 확인해 봅시다.

```ts
// src/bad.ts
const total: number = '15500'
console.log('합계:', total)
```

```powershell
npx tsx src/bad.ts
```

```text
합계: 15500
```

`number`에 문자열을 넣었는데도 아무 경고 없이 실행됐습니다.

### 4단계: Node.js의 타입 스트리핑 — 설치 없이 실행

Node.js 자체에도 **타입 스트리핑**(type stripping, 타입 부분만 걷어 내고 실행하는 기능)이 들어왔습니다. 별도 패키지 없이 `node 파일.ts`로 실행됩니다.

| Node 버전 | 변화 (Node.js 공식 문서 기준) |
|---|---|
| 22.6.0 | `--experimental-strip-types` 플래그로 처음 도입 |
| 23.6.0, 22.18.0 | 플래그 없이 **기본으로 켜짐** |
| 24.3.0, 22.18.0 | 실험 기능 경고(ExperimentalWarning)가 더 이상 나오지 않음 |
| 25.2.0, 24.12.0 | 안정(Stable) 기능으로 승격 |

```powershell
node --version   # v24.13.1
node src/index.ts
```

```text
합계: 15,500원
```

Node 22.6~22.17에서는 `node --experimental-strip-types src/index.ts`처럼 플래그를 붙여야 합니다. 이 기능을 끄려면 `--no-strip-types`를 씁니다.

타입 스트리핑에는 몇 가지 규칙이 있습니다.

1. **타입 검사를 하지 않습니다.** 위의 `src/bad.ts`를 `node src/bad.ts`로 실행하면 역시 `합계: 15500`이 출력됩니다.
2. **import에 `.ts` 확장자를 정확히 적어야 합니다.** `'./price'`처럼 생략하면 `Error [ERR_MODULE_NOT_FOUND]: Cannot find module '...\src\price'`가 납니다.
3. **"지우기만 해서는 JS가 되지 않는" 문법은 쓸 수 없습니다.** 대표적으로 `enum`, `namespace`, 생성자 매개변수 속성(`constructor(private name: string)`)이 그렇습니다.

```ts
// src/enum.ts
enum OrderStatus {
  Ready = 'READY',
  Paid = 'PAID',
}
console.log(OrderStatus.Paid)
```

```text
SyntaxError [ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX]: TypeScript enum is not supported in strip-only mode
```

`enum`은 타입만이 아니라 실행 중 객체를 **만들어 내는** 문법이라서, 지우기만으로는 처리할 수 없습니다. 대안은 [열거형(enum)과 그 대안](../part2-types/09-enum)에서 배운 유니온 리터럴 타입이나 `as const` 객체입니다.

이 규칙을 편집기에서 미리 알 수 있도록 `tsconfig.json`을 맞춥니다.

```json
{
  "compilerOptions": {
    "target": "es2023",
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "types": ["node"],
    "noEmit": true,
    "allowImportingTsExtensions": true,
    "erasableSyntaxOnly": true,
    "verbatimModuleSyntax": true,
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

- `allowImportingTsExtensions`(5.0+) — `'./price.ts'`처럼 `.ts`로 import 허용. `noEmit`과 함께 써야 합니다.
- `erasableSyntaxOnly`(**5.8+**) — 지울 수 없는 문법(`enum` 등)을 에러로 표시합니다.
- `verbatimModuleSyntax` — 타입만 가져오는 import는 `import type`으로 쓰게 해서, 타입을 지운 뒤 빈 import가 남는 문제를 막습니다.

```powershell
npx tsc
```

```text
src/bad.ts(1,7): error TS2322: Type 'string' is not assignable to type 'number'.
src/enum.ts(1,6): error TS1294: This syntax is not allowed when 'erasableSyntaxOnly' is enabled.
```

`node`로 실행하기 전에 `tsc`가 두 문제를 모두 잡아 줍니다.

::: tip tsx와 Node 타입 스트리핑, 무엇을 쓸까?
- 설치 없이 간단한 스크립트 → Node 타입 스트리핑(Node 22.18+ 또는 23.6+)
- `enum`·`paths` 별칭·확장자 생략이 섞인 기존 코드, 또는 옛 Node → `tsx` (확장자 생략과 `tsconfig`의 `paths`도 처리해 줌)

어느 쪽이든 **운영 서버**에서는 미리 `tsc`로 검사·빌드해 둔 JS를 실행하는 것이 일반적입니다.
:::

### 5단계: Vite — 프론트엔드 앱

**Vite**는 프론트엔드 개발 서버이자 빌드 도구입니다. 개발 중에는 파일을 요청받을 때마다 즉석에서 변환하고, 배포할 때는 모든 파일을 **번들링**(bundling, 여러 파일을 브라우저가 받기 좋게 몇 개로 묶고 압축하는 것)합니다.

```powershell
npm create vite@latest store-admin -- --template vanilla-ts
cd store-admin
npm install
npm run dev     # 개발 서버
npm run build   # 배포용 빌드 → dist/
```

작성 시점의 `create-vite`(9.3.1) 템플릿이 만드는 스크립트는 이렇습니다.

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

`build`가 `tsc && vite build`인 데 주목하세요. **Vite만으로는 타입 에러를 잡지 못하기 때문**입니다. 직접 확인해 봅시다. `src/main.ts`에 일부러 틀린 줄을 넣습니다.

```ts
const qty: number = '2'
console.log(qty)
```

```powershell
npx vite build
```

```text
dist/assets/index-Crae597c.js  0.81 kB │ gzip: 0.46 kB
✓ built in 114ms
```

빌드가 **성공**했습니다. 같은 프로젝트에서 `npx tsc --noEmit`을 하면:

```text
src/main.ts(4,7): error TS2322: Type 'string' is not assignable to type 'number'.
```

그래서 템플릿은 `tsc`(이 프로젝트의 `tsconfig`에 `noEmit: true`가 있어 검사만 함)를 먼저 돌리고, 통과해야 `vite build`로 넘어가게 해 두었습니다. 이 줄을 지우지 마세요.

::: info 템플릿의 TypeScript 버전
작성 시점 `create-vite` 템플릿의 `package.json`에는 `"typescript": "~6.0.3"`이 적혀 있습니다. 이 위키의 5.x 기준과 맞추려면 `npm install -D typescript@5`로 바꿔 설치하세요. 템플릿의 `tsconfig`에는 `strict`가 적혀 있지 않은데, 6.0부터는 기본으로 켜지기 때문입니다. 5.x로 바꾸면 `"strict": true`를 직접 추가해야 합니다.
:::

### 6단계: tsup — npm 라이브러리

사내 공통 포맷 함수를 npm 패키지로 만들어 여러 프로젝트에서 쓴다고 해 봅시다. 쓰는 쪽은 ESM일 수도, CommonJS일 수도 있고, 타입 정보(`.d.ts`)도 필요합니다. `tsc`로 이걸 다 맞추려면 설정 파일이 여러 개 필요한데, **tsup**은 한 번에 해 줍니다.

```powershell
npm install -D tsup
```

```ts
// src/index.ts
// 매장 공통 포맷 함수 모음
export function won(amount: number): string {
  return amount.toLocaleString('ko-KR') + '원'
}

export function phoneMask(phone: string): string {
  return phone.replace(/^(\d{3})-?(\d{3,4})-?(\d{4})$/, '$1-****-$3')
}
```

```ts
// tsup.config.ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'], // ESM과 CommonJS 둘 다
  dts: true, // .d.ts 생성
  sourcemap: true,
  clean: true, // 빌드 전에 dist 비우기
  target: 'es2022',
})
```

```powershell
npx tsup
```

```text
ESM dist\index.js     258.00 B
ESM ⚡️ Build success in 30ms
CJS dist\index.cjs     1.25 KB
CJS ⚡️ Build success in 30ms
DTS ⚡️ Build success in 870ms
DTS dist\index.d.ts  125.00 B
DTS dist\index.d.cts 125.00 B
```

결과 파일 4종(`index.js`, `index.cjs`, `index.d.ts`, `index.d.cts`)을 `package.json`의 `exports`로 연결합니다. **`exports`는 "이 패키지를 import 하면 어떤 파일을 줄지"를 정하는 지도**입니다.

```json
{
  "name": "@mystore/format",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      },
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      }
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "typecheck": "tsc --noEmit"
  }
}
```

- `import`로 가져오면 `index.js`(ESM), `require`로 가져오면 `index.cjs`(CommonJS)를 줍니다.
- `types`는 각 조건 안에서 **맨 앞**에 둡니다. TypeScript가 위에서부터 읽기 때문입니다.
- `main`·`module`·`types`는 `exports`를 모르는 옛 도구를 위한 예비 칸입니다.
- `files`는 npm에 올릴 때 포함할 폴더입니다.

양쪽 방식으로 실제로 불러 봤습니다.

```powershell
node -e "const f = require('@mystore/format'); console.log(f.won(15500), f.phoneMask('010-1234-5678'))"
node --input-type=module -e "import { won } from '@mystore/format'; console.log(won(9500))"
```

```text
15,500원 010-****-5678
9,500원
```

(패키지 폴더 안에서 자기 이름으로 import 하는 것을 **자기 참조**(self-reference)라고 하며, `exports`가 있으면 동작합니다. 배포 전 확인용으로 편리합니다.)

**tsup도 타입 검사를 믿으면 안 됩니다.** `src/index.ts`에 `export const bad: number = 'x'`를 넣고 `npx tsup`을 실행했더니, ESM·CJS·DTS가 **모두 성공**하고 종료 코드도 0이었습니다. `index.d.ts`에는 `declare const bad: number;`가 그대로 들어갔습니다. 반면 `npx tsc --noEmit`은 TS2322를 냈습니다. 따라서 배포 전에 반드시 `typecheck`를 돌립니다.

```json
{
  "scripts": {
    "build": "tsc --noEmit && tsup",
    "typecheck": "tsc --noEmit"
  }
}
```

::: warning tsup의 유지보수 상태
작성 시점 tsup(9.0.0)의 README에는 "더 이상 활발히 유지보수하지 않으니 **tsdown** 사용을 고려하라"는 안내가 있습니다. tsdown(작성 시점 0.23.2)은 Vite 팀의 Rolldown 기반 후속 도구로, tsup과 비슷한 설정을 씁니다. 새 라이브러리라면 [tsdown의 tsup 이전 가이드](https://tsdown.dev/guide/migrate-from-tsup)도 확인해 보세요. 어떤 도구를 쓰든 "타입 검사는 `tsc --noEmit`으로 따로"라는 원칙은 같습니다.
:::

### 7단계: 상황별 조합 정리

| 프로젝트 | 개발 중 실행 | 배포용 빌드 | 타입 검사 |
|---|---|---|---|
| 작은 Node 서버·CLI | `tsx watch src/index.ts` 또는 `node --watch src/index.ts` | `tsc` | `tsc`(빌드에 포함) |
| 사내 스크립트 | `node 파일.ts` (Node 22.18+) | 없음 | `tsc --noEmit` |
| 프론트엔드 앱 | `vite` | `vite build` | `tsc --noEmit`(또는 `vue-tsc`) 먼저 |
| npm 라이브러리 | `tsup --watch` | `tsup` | `tsc --noEmit` 먼저 |
| 테스트 | `vitest` | — | `tsc --noEmit` |

어떤 조합이든 CI에서는 이 세 줄이 기본입니다.

```powershell
npm run typecheck   # tsc --noEmit
npm run lint        # eslint .
npm test -- --run   # vitest run
```

## 자주 하는 실수

### 실수 1: vite build가 성공했으니 타입도 맞다고 믿기

```json
{ "scripts": { "build": "vite build" } }
```

왜 틀렸나: Vite는 타입을 지우기만 합니다. 실제로 `const qty: number = '2'`가 있어도 빌드가 성공했습니다.

고친 코드:

```json
{ "scripts": { "build": "tsc --noEmit && vite build" } }
```

### 실수 2: Node 타입 스트리핑에서 확장자 생략

```ts
import { won } from './price'
```

```text
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '...\src\price' imported from ...\src\index.ts
```

왜 틀렸나: Node는 파일을 추측하지 않습니다. 실행하는 파일이 `.ts`이므로 `.ts`까지 적어야 합니다.

고친 코드:

```ts
import { won } from './price.ts'
```

`tsconfig.json`에는 `allowImportingTsExtensions: true`와 `noEmit: true`를 둡니다. (`tsc`로 JS도 만들어야 한다면 `rewriteRelativeImportExtensions`(5.7+)가 `.ts`를 `.js`로 바꿔 주는 옵션입니다.)

### 실수 3: 타입 스트리핑 환경에서 enum 쓰기

```ts
enum PayMethod {
  Card = 'CARD',
  Cash = 'CASH',
}
```

```text
SyntaxError [ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX]: TypeScript enum is not supported in strip-only mode
```

왜 틀렸나: `enum`은 지우는 것만으로 JS가 되지 않는 문법입니다.

고친 코드:

```ts
const PayMethod = {
  Card: 'CARD',
  Cash: 'CASH',
} as const
type PayMethod = (typeof PayMethod)[keyof typeof PayMethod] // 'CARD' | 'CASH'

const method: PayMethod = PayMethod.Card
console.log(method)
// 출력: CARD
```

`erasableSyntaxOnly: true`를 켜 두면 편집기에서 미리 TS1294로 알려 줍니다.

### 실수 4: 라이브러리 exports에서 types를 뒤에 두기

```json
"exports": {
  ".": {
    "import": { "default": "./dist/index.js", "types": "./dist/index.d.ts" }
  }
}
```

왜 틀렸나: 조건은 **위에서부터** 맞는 것을 고릅니다. `default`가 먼저 맞아 버려서 TypeScript가 `types`를 보지 못하고, 쓰는 쪽에서 타입을 찾지 못할 수 있습니다.

고친 코드:

```json
"exports": {
  ".": {
    "import": { "types": "./dist/index.d.ts", "default": "./dist/index.js" }
  }
}
```

## 직접 해 보기

### 문제 1 ⭐ 타입 검사 하는 도구 고르기

다음 명령 가운데 타입 에러가 있으면 **실패하는** 것을 모두 고르세요.

```text
(가) npx tsc --noEmit
(나) npx tsx src/index.ts
(다) node src/index.ts
(라) npx vite build
(마) npx tsup
(바) npx tsc
```

::: details 정답 보기
(가), (바)입니다. 나머지는 타입을 지우기만 하므로 타입 에러가 있어도 성공합니다(실제로 확인한 결과입니다).
:::

### 문제 2 ⭐ 스크립트 고치기

Vite + React 프로젝트의 `package.json`입니다. 타입 에러가 있으면 배포 빌드가 멈추도록 고치세요.

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  }
}
```

::: details 정답 보기
```json
{
  "scripts": {
    "dev": "vite",
    "typecheck": "tsc --noEmit",
    "build": "npm run typecheck && vite build"
  }
}
```

`tsconfig.json`에 `noEmit: true`가 있다면 `"build": "tsc && vite build"`처럼 써도 됩니다(create-vite 템플릿 방식).
:::

### 문제 3 ⭐⭐ Node로 바로 실행하는 스크립트

`scripts/daily-sales.ts`를 Node 24에서 `node scripts/daily-sales.ts`로 바로 실행하려 합니다. 이 파일은 `./lib/sum.ts`를 import 합니다. ① import 문 ② `tsconfig.json`에 꼭 필요한 옵션 3개를 쓰세요.

::: details 정답 보기
```ts
// scripts/daily-sales.ts
import { sum } from './lib/sum.ts'

console.log('오늘 매출:', sum([15500, 9500, 4500]))
// 출력: 오늘 매출: 29500
```

```json
{
  "compilerOptions": {
    "module": "nodenext",
    "noEmit": true,
    "allowImportingTsExtensions": true,
    "erasableSyntaxOnly": true,
    "strict": true
  },
  "include": ["scripts"]
}
```

`allowImportingTsExtensions`는 `noEmit`과 함께여야 하고, `erasableSyntaxOnly`(5.8+)가 `enum` 같은 지원 안 되는 문법을 미리 잡아 줍니다.
:::

### 문제 4 ⭐⭐ 도구 고르기

다음 상황에 알맞은 빌드 도구를 고르고 이유를 한 줄로 쓰세요.

1. 매장 키오스크 화면(React)
2. 주문 데이터를 CSV로 뽑는 일회성 관리자 스크립트
3. 여러 팀이 쓰는 날짜·금액 포맷 패키지(ESM·CJS 둘 다 필요)
4. Express 주문 API 서버(운영 배포)

::: details 정답 보기
1. Vite — 번들링·개발 서버가 필요한 프론트엔드 앱.
2. Node 타입 스트리핑(또는 tsx) — 빌드 없이 바로 실행하면 충분.
3. tsup(또는 tsdown) — 한 번에 ESM·CJS·`.d.ts`를 만들어 줌.
4. `tsc` — 빌드가 곧 타입 검사이고, 번들링이 꼭 필요하지 않음. 개발 중에는 `tsx watch`.

모든 경우에 `tsc --noEmit`(또는 빌드 자체가 `tsc`)로 타입 검사를 합니다.
:::

### 문제 5 ⭐⭐⭐ 라이브러리 package.json 진단

동료가 만든 라이브러리를 CommonJS 프로젝트에서 `require('@mystore/date')` 하면 에러가 나고, ESM 프로젝트에서는 타입이 `any`로 잡힌다고 합니다. 문제를 모두 찾아 고치세요. tsup은 `format: ['esm']`, `dts: false`로 설정되어 있습니다.

```json
{
  "name": "@mystore/date",
  "type": "module",
  "exports": {
    ".": "./dist/index.js"
  }
}
```

::: details 정답 보기
1. CommonJS용 파일이 없습니다 → tsup `format: ['esm', 'cjs']`.
2. `.d.ts`가 없어 타입이 `any`입니다 → tsup `dts: true`.
3. `exports`에 `require`·`types` 조건이 없습니다.

```ts
// tsup.config.ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
})
```

```json
{
  "name": "@mystore/date",
  "type": "module",
  "main": "./dist/index.cjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": { "types": "./dist/index.d.ts", "default": "./dist/index.js" },
      "require": { "types": "./dist/index.d.cts", "default": "./dist/index.cjs" }
    }
  },
  "files": ["dist"],
  "scripts": { "build": "tsc --noEmit && tsup" }
}
```

(Node 22.12+는 CommonJS에서 ESM을 `require` 할 수 있지만, 옛 Node나 도구를 쓰는 팀이 있다면 CJS 결과물을 함께 내는 것이 안전합니다.)
:::

## 확인 퀴즈

1. esbuild 계열 도구(tsx, Vite, tsup)가 빠른 이유는 무엇이고, 그 대가는 무엇일까요?
2. Node.js에서 `node 파일.ts`가 플래그 없이 동작하기 시작한 버전은?
3. Node 타입 스트리핑에서 `enum`을 쓰면 어떻게 될까요? 미리 알 수 있는 tsconfig 옵션은?
4. create-vite 템플릿의 `build` 스크립트가 `tsc && vite build`인 이유는?
5. 라이브러리 `package.json`의 `exports`에서 `types`를 맨 앞에 두는 이유는?

::: details 정답 보기
1. 프로젝트 전체를 분석하는 타입 검사 없이 파일별로 타입만 지우기 때문입니다. 대가는 타입 에러를 잡지 못한다는 것이라 `tsc --noEmit`을 함께 돌려야 합니다.
2. Node 23.6.0과 22.18.0입니다(22.6.0부터는 `--experimental-strip-types` 플래그로 가능).
3. `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX` 에러로 실행이 실패합니다. `erasableSyntaxOnly`(TS 5.8+)를 켜면 TS1294로 미리 알려 줍니다.
4. Vite는 타입 검사를 하지 않으므로, `tsc`(noEmit 설정)로 먼저 검사하고 통과해야 빌드하도록 하기 위해서입니다.
5. 조건을 위에서부터 고르므로, `default`보다 앞에 있어야 TypeScript가 타입 파일을 찾습니다.
:::

## 정리

- 타입 검사와 JS 변환은 다른 일입니다. `tsc`만 둘 다 하고, tsx·Node 타입 스트리핑·Vite·tsup·Vitest는 **타입을 지우기만** 합니다.
- 작은 Node 앱은 `tsc`로 빌드, 개발 중에는 `tsx watch`.
- Node 22.18+/23.6+는 `node 파일.ts`로 바로 실행됩니다. `.ts` 확장자를 적고, `enum` 같은 지울 수 없는 문법은 피합니다(`erasableSyntaxOnly`).
- 프론트엔드는 Vite, 라이브러리는 tsup(후속 도구 tsdown)으로 ESM·CJS·`.d.ts`를 만들고 `exports`로 연결합니다.
- 어떤 조합이든 `tsc --noEmit`을 빌드·CI에 함께 넣습니다.

## 다음 단계

[JavaScript 프로젝트를 TypeScript로 마이그레이션](./07-migration) — 이미 돌아가고 있는 JS 프로젝트를 멈추지 않고, 파일 하나씩 TypeScript로 옮기는 방법을 실습합니다.
