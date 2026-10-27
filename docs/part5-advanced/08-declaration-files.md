---
title: 선언 파일(.d.ts) · 선언 병합 · 모듈 보강
---

# 선언 파일(.d.ts) · 선언 병합 · 모듈 보강

<LessonMeta level="고급" :minutes="60" prev="변성으로 함수·배열 타입을 언제 바꿔 쓸 수 있는지 정리했습니다" />

## 이번에 배울 것

- 선언 파일(`.d.ts`)이 "구현 없이 타입만 적은 설명서"라는 것을 설명하고, `declare`로 값의 존재를 알릴 수 있다.
- 타입 없는 JavaScript 모듈에 선언 파일을 직접 작성할 수 있다.
- 전역 변수·전역 함수·이미지 import 같은 것에 전역 선언을 붙일 수 있다.
- `@types` 패키지와 DefinitelyTyped가 무엇인지 알고, 라이브러리 타입을 찾는 순서를 말할 수 있다.
- 인터페이스 선언 병합과 모듈 보강(`declare module`, `declare global`)으로 `Window`나 라이브러리 타입에 속성을 더할 수 있다.

## 먼저 알아 둘 것

- [모듈: import/export와 타입 전용 import](../part3-intermediate/09-modules)
- [타입 별칭(type)과 인터페이스(interface)](../part2-types/07-type-alias-interface)
- [첫 프로그램: tsc로 컴파일하고 실행하기](../part0-start/05-first-program) — tsc가 JavaScript를 만든다는 것

## 비유로 이해하기

수입 가전제품을 샀는데 설명서가 외국어로만 되어 있거나 아예 없다고 해 봅시다. 기계는 잘 돌아가지만, 어떤 버튼이 무슨 일을 하는지 몰라 쓰기가 겁납니다.

이때 누군가 **한국어 설명서**를 따로 만들어 줍니다. 설명서에는 회로도나 부품(구현)은 없습니다. "이 버튼을 누르면 이것이 된다, 이 칸에는 숫자를 넣는다"라는 **사용법**만 적혀 있습니다. 기계는 그대로인데 설명서 덕분에 안심하고 쓸 수 있게 되었습니다.

- **기계** = 이미 있는 JavaScript 코드(사내 오래된 모듈, 외부 라이브러리, 브라우저가 주는 전역 객체)
- **설명서** = 선언 파일(`.d.ts`)
- **설명서를 읽는 사람** = TypeScript 컴파일러와 에디터

설명서는 나중에 **덧붙일** 수도 있습니다. 원래 설명서에 "우리 매장에서 추가로 단 버튼" 한 장을 끼워 넣는 것이 **선언 병합**과 **모듈 보강**입니다.

## 개념 설명

### 1단계: .ts 파일은 사실 두 가지를 담고 있다

TypeScript 파일에는 **실행될 코드**와 **타입 정보**가 섞여 있습니다. `tsc`로 컴파일하면 이 둘이 나뉩니다.

```ts
// 파일: price.ts
export function formatPrice(amount: number): string {
  return amount.toLocaleString('ko-KR') + '원'
}
```

`tsc --declaration`(줄여서 `-d`) 옵션으로 컴파일하면 파일이 두 개 생깁니다.

```js
// 파일: price.js  ← 실행할 코드 (타입이 모두 지워짐)
export function formatPrice(amount) {
  return amount.toLocaleString('ko-KR') + '원'
}
```

```ts
// 파일: price.d.ts  ← 타입 설명서 (구현이 모두 지워짐)
export declare function formatPrice(amount: number): string
```

- `.js`는 브라우저나 Node.js가 실행합니다.
- `.d.ts`는 **이 모듈을 가져다 쓰는 다른 TypeScript 코드**가 읽습니다. 함수 몸체 없이 "이름과 타입"만 있습니다.

npm에 올라간 TypeScript 라이브러리는 대부분 이렇게 `.js`와 `.d.ts`를 함께 배포합니다. 그래서 import하자마자 자동 완성이 뜨는 것입니다.

### 2단계: declare — "있다고 치자"

`declare`는 "이 값은 **어딘가에 이미 있다**. 여기서 만들지는 않지만 타입은 이렇다"라고 컴파일러에게 알리는 키워드입니다. 값을 만드는 코드는 생기지 않습니다.

```ts
// 이 페이지의 HTML에서 다른 스크립트가 만들어 둔 변수라고 가정합니다.
declare const STORE_NAME: string
declare function beep(times: number): void

const title = `${STORE_NAME} POS`
beep(2)
beep('두 번')
// ❌ Argument of type 'string' is not assignable to parameter of type 'number'. (TS2345)
```

| 보통 선언 | `declare` 선언 |
|---|---|
| `const a = 1` → 값을 **만듦** | `declare const a: number` → 값이 **있다고 알림** |
| JavaScript 결과에 남음 | JavaScript 결과에 아무것도 안 남음 |
| 초깃값·함수 몸체 필요 | 초깃값·함수 몸체를 쓸 수 없음 |

`declare`는 거짓말을 해도 컴파일러가 확인할 방법이 없습니다. 실제로 `STORE_NAME`이 없으면 실행 중에 `ReferenceError`가 납니다. 6번 레슨의 타입 가드처럼 "약속"이라는 점을 기억하세요.

::: tip 앞 레슨에서 쓴 declare
Part 5의 여러 레슨에서 `declare const cart: DeepReadonly<...>`처럼 값 없이 타입만 확인할 때 `declare`를 썼습니다. 같은 문법입니다.
:::

### 3단계: 타입 없는 JS 모듈에 선언 파일 작성하기

사내에 오래전부터 쓰던 JavaScript 유틸리티가 있다고 해 봅시다.

```js
// 파일: src/legacy/pos-utils.js
// 사내에서 오래 써 온 JavaScript 유틸리티 (타입 없음)
export function formatPrice(amount) {
  return amount.toLocaleString('ko-KR') + '원'
}

export function calcVat(amount, rate = 0.1) {
  return Math.floor(amount * rate)
}

export const STORE_CODE_PREFIX = 'ST'
```

`strict` 모드의 TypeScript 파일에서 이것을 import하면 에러가 납니다.

```ts
// 파일: src/coupon.ts
import { formatPrice } from './legacy/pos-utils.js'
// ❌ Could not find a declaration file for module './legacy/pos-utils.js'. '.../src/legacy/pos-utils.js' implicitly has an 'any' type. (TS7016)
```

"설명서가 없어서 이 모듈의 모든 것이 `any`가 될 텐데, strict 모드에서는 그걸 허락하지 않겠다"는 뜻입니다. 해결책은 **같은 폴더, 같은 이름**으로 `.d.ts` 파일을 만드는 것입니다.

```ts
// 파일: src/legacy/pos-utils.d.ts
// pos-utils.js의 "타입 설명서"입니다. 구현은 없고 모양만 적습니다.

/** 금액을 '4,500원' 형태의 문자열로 바꿉니다. */
export declare function formatPrice(amount: number): string

/** 부가세를 계산합니다. rate를 생략하면 10%입니다. */
export declare function calcVat(amount: number, rate?: number): number

export declare const STORE_CODE_PREFIX: string
```

```ts
// 파일: src/main.ts
import { formatPrice, calcVat } from './legacy/pos-utils.js'

console.log(formatPrice(4500)) // 출력: 4,500원
console.log(calcVat(10000)) // 출력: 1000

formatPrice('4500')
// ❌ Argument of type 'string' is not assignable to parameter of type 'number'. (TS2345)
```

컴파일러는 `./legacy/pos-utils.js`를 import할 때 옆에 있는 `pos-utils.d.ts`를 찾아 읽습니다. JavaScript 파일은 한 글자도 고치지 않았는데 자동 완성, 매개변수 검사, `/** */` 주석 설명까지 생겼습니다.

선언 파일을 쓰는 순서는 이렇습니다.

1. JS 코드를 읽고 함수마다 **어떤 값을 받고 무엇을 돌려주는지** 확인합니다.
2. 기본값이 있는 매개변수는 `?`(선택)로 적습니다(`rate = 0.1` → `rate?: number`).
3. 확실하지 않은 부분은 `unknown`으로 두고, 쓰면서 좁혀 갑니다. `any`로 덮어 버리면 설명서를 만든 의미가 줄어듭니다.

::: info allowJs와 JSDoc이라는 다른 길
`tsconfig.json`에서 `allowJs`와 `checkJs`를 켜고 JS 파일 안에 JSDoc 주석(`/** @param {number} amount */`)으로 타입을 적는 방법도 있습니다. JS 파일을 직접 고칠 수 있다면 이쪽이 편할 때도 있습니다. 6부 [마이그레이션](../part6-tooling/07-migration)에서 다룹니다.
:::

### 4단계: 전역 선언 — import 없이 어디서나

POS 웹 화면에는 `import`로 가져오지 않는 값이 종종 있습니다.

- 서버가 HTML에 `<script>window.POS_CONFIG = {...}</script>`로 넣어 주는 설정
- 카드 단말기 제조사가 페이지에 심어 주는 전역 함수
- 영수증 프린터 SDK가 만드는 전역 객체

이런 것은 **전역 선언 파일**로 설명합니다. 핵심 규칙은 하나입니다.

> **`import`나 `export`가 하나도 없는 `.d.ts` 파일은 전역 스크립트로 취급되어, 그 안의 선언이 프로젝트 전체에 보입니다.**

```ts
// 파일: src/types/globals.d.ts
// import/export가 없는 .d.ts 파일은 "전역 스크립트"로 취급됩니다.

/** index.html의 <script>에서 서버가 넣어 주는 매장 설정 */
declare const POS_CONFIG: {
  storeId: string
  apiBase: string
  useKiosk: boolean
}

/** 카드 단말기 제조사가 페이지에 심어 주는 전역 함수 */
declare function requestCardApproval(amount: number): Promise<{ approved: boolean; approvalNo: string }>

/** 영수증 프린터 SDK (전역 객체) */
declare namespace PosPrinter {
  function printText(text: string): void
  function cut(): void
  const model: string
}
```

```ts
// 파일: src/use-globals.ts
async function pay(amount: number) {
  console.log(`${POS_CONFIG.storeId} 매장 결제 요청`)
  const result = await requestCardApproval(amount)
  if (result.approved) {
    PosPrinter.printText(`승인번호 ${result.approvalNo}`)
    PosPrinter.cut()
  }
}

POS_CONFIG.storeID
// ❌ Property 'storeID' does not exist on type '{ storeId: string; apiBase: string; useKiosk: boolean; }'. Did you mean 'storeId'? (TS2551)
```

- `declare namespace PosPrinter { ... }`는 "`PosPrinter.printText(...)`처럼 점으로 접근하는 전역 객체"를 설명하는 오래된 문법입니다. 새로 만드는 코드에서는 모듈을 쓰지만, 전역 SDK를 설명할 때는 여전히 유용합니다.
- 선언 파일이 `tsconfig.json`의 `include` 범위(예: `src`) 안에 있어야 컴파일러가 읽습니다.

### 5단계: 와일드카드 모듈 선언 — 이미지 import

Vite 같은 번들러(bundler, 여러 파일을 묶어 주는 도구)는 `import logoUrl from './logo.svg'`처럼 이미지를 import하게 해 줍니다. 그런데 TypeScript는 `.svg` 파일의 타입을 모릅니다. 이럴 때 **와일드카드 모듈 선언**을 씁니다.

```ts
// 파일: src/types/globals.d.ts (위 파일에 이어서)
// '.svg'로 끝나는 모든 모듈은 URL 문자열을 기본 내보내기로 준다고 알려 줍니다.
declare module '*.svg' {
  const url: string
  export default url
}
```

```ts
// 파일: src/show-logo.ts
import logoUrl from './assets/logo.svg'

const img = document.createElement('img')
img.src = logoUrl // logoUrl: string
```

Vite 프로젝트에는 이런 선언이 `vite/client` 타입에 이미 들어 있어서, 보통 `/// <reference types="vite/client" />` 한 줄로 해결됩니다. 직접 쓸 일은 그 목록에 없는 파일 형식(예: 사내 전용 `.receipt` 템플릿 파일)을 다룰 때입니다.

### 6단계: @types와 DefinitelyTyped

npm 라이브러리의 타입은 어디서 올까요? 세 가지 경우가 있습니다.

| 경우 | 예 | 할 일 |
|---|---|---|
| 라이브러리가 **스스로 타입을 포함** | zod, axios, vue | 그냥 설치하면 끝 |
| 라이브러리는 JS뿐이고, **커뮤니티가 만든 타입**이 있음 | lodash, express | `@types/라이브러리이름`을 개발 의존성으로 설치 |
| 어디에도 타입이 없음 | 오래된 사내·소규모 라이브러리 | 3단계처럼 **직접 작성** |

두 번째 경우의 타입은 **DefinitelyTyped**(https://github.com/DefinitelyTyped/DefinitelyTyped)라는 거대한 공개 저장소에서 관리되고, npm에는 `@types/` 이름으로 배포됩니다.

```bash
# lodash 본체와 그 타입 설명서를 따로 설치합니다.
npm install lodash
npm install -D @types/lodash
```

- `-D`(`--save-dev`)는 "개발할 때만 필요한 패키지"라는 뜻입니다. 타입은 실행에 필요 없으니 개발 의존성으로 둡니다.
- `@types/...` 패키지는 `node_modules/@types` 폴더에 설치되고, 컴파일러가 자동으로 찾아 읽습니다. import만 하면 됩니다.
- 라이브러리 버전과 `@types` 버전의 앞자리(주 버전)를 맞추는 것이 좋습니다. 예를 들어 라이브러리가 4.x면 `@types`도 4.x를 씁니다.

::: tip 타입이 있는지 확인하는 법
npm 웹사이트(npmjs.com)의 패키지 페이지 제목 옆에 **TS** 아이콘이 있으면 타입을 포함한 것이고, **DT** 아이콘이 있으면 `@types` 패키지가 따로 있다는 뜻입니다. 외부 라이브러리를 들일 때는 타입뿐 아니라 유지 보수 상태와 라이선스도 함께 확인하세요(라이선스 판단은 담당 부서에 확인을 권합니다).
:::

### 7단계: 인터페이스 선언 병합

같은 이름의 `interface`를 같은 범위에 두 번 선언하면 에러가 아니라 **하나로 합쳐집니다**. 이것을 **선언 병합**(declaration merging)이라고 합니다.

```ts
interface Member {
  memberId: string
  nickname: string
}

// 같은 이름으로 다시 선언하면 속성이 더해집니다.
interface Member {
  point: number
}

const m: Member = { memberId: 'M01', nickname: '단골손님', point: 1200 } // ✅

const m2: Member = { memberId: 'M02', nickname: '새손님' }
// ❌ Property 'point' is missing in type '{ memberId: string; nickname: string; }' but required in type 'Member'. (TS2741)
```

`type` 별칭은 병합되지 않습니다. 같은 이름을 두 번 쓰면 에러입니다.

```ts
type Coupon = { code: string }
// ❌ Duplicate identifier 'Coupon'. (TS2300)
type Coupon = { rate: number }
// ❌ Duplicate identifier 'Coupon'. (TS2300)
```

[타입 별칭과 인터페이스](../part2-types/07-type-alias-interface)에서 "인터페이스는 나중에 확장할 수 있다"고 했던 것이 바로 이 성질입니다. 평소에는 실수로 같은 이름을 두 번 쓰는 위험이 있지만, **남이 정의한 타입에 속성을 더할 때**는 꼭 필요한 기능입니다. 다음 두 단계가 그 쓰임입니다.

### 8단계: 전역 보강 — Window에 속성 추가

POS 키오스크 앱(Electron 등)이 웹 화면에 `window.posBridge`라는 통로를 열어 준다고 해 봅시다. 그냥 쓰면 에러가 납니다. 브라우저의 `Window` 타입에는 그런 속성이 없으니까요.

`Window`는 TypeScript의 `lib.dom.d.ts`에 **interface**로 선언되어 있습니다. 그래서 같은 이름의 interface를 전역에 하나 더 선언하면 병합됩니다.

```ts
// 파일: src/types/window.d.ts
// 이 파일은 export가 있으므로 "모듈"입니다.
// 모듈 안에서 전역에 무언가를 더하려면 declare global로 감쌉니다.
export {}

declare global {
  interface Window {
    /** 키오스크 앱(Electron)이 웹 화면에 열어 준 통로 */
    posBridge?: {
      openDrawer: () => void
      getDeviceId: () => string
    }
  }
}
```

```ts
// 파일: src/use-window.ts
function openCashDrawer() {
  if (window.posBridge) {
    window.posBridge.openDrawer()
  } else {
    console.log('브라우저에서는 금전함을 열 수 없습니다')
  }
}

window.posBrige
// ❌ Property 'posBrige' does not exist on type 'Window & typeof globalThis'. Did you mean 'posBridge'? (TS2551)
```

- `declare global { ... }`은 "이 블록 안의 선언은 전역에 속한다"는 뜻입니다. **모듈 파일 안에서만** 쓸 수 있으므로 `export {}`를 넣어 모듈로 만들었습니다.
- 4단계처럼 import/export가 없는 전역 파일이라면 `declare global` 없이 `interface Window { ... }`만 써도 됩니다. 어느 쪽이든 결과는 같습니다.
- `posBridge`를 `?`로 선택 속성으로 만든 이유: 일반 브라우저에서 열면 이 통로가 없기 때문입니다. 사용하기 전에 있는지 확인하도록 컴파일러가 강제해 줍니다.

### 9단계: 모듈 보강 — 라이브러리 타입 확장

이번에는 npm 라이브러리의 타입에 속성을 더해 봅시다. 영수증 프린터 라이브러리 `receipt-printer`가 다음 타입을 제공한다고 가정합니다(설명용 가상의 라이브러리입니다).

```ts
// 파일: node_modules/receipt-printer/index.d.ts
export interface PrinterOptions {
  paperWidth: 58 | 80
  encoding: 'euc-kr' | 'utf-8'
}
export declare function createPrinter(options: PrinterOptions): { print(text: string): void }
```

우리 매장 프린터는 사내 펌웨어로 `logoSlot` 옵션을 추가로 지원합니다. 라이브러리 파일(`node_modules`)은 고칠 수 없으니, 우리 쪽에서 **모듈 보강**(module augmentation)을 합니다.

```ts
// 파일: src/types/receipt-printer-ext.d.ts
// 라이브러리의 PrinterOptions에 우리 회사 프린터 펌웨어 전용 옵션을 더합니다.
import 'receipt-printer'

declare module 'receipt-printer' {
  interface PrinterOptions {
    /** 영수증 맨 위에 찍을 로고 이미지 번호 (사내 펌웨어 전용) */
    logoSlot?: number
  }
}
```

```ts
// 파일: src/use-printer.ts
import { createPrinter } from 'receipt-printer'

const printer = createPrinter({ paperWidth: 80, encoding: 'euc-kr', logoSlot: 1 }) // ✅
printer.print('감사합니다')

createPrinter({ paperWidth: 80, encoding: 'euc-kr', logoSlott: 1 })
// ❌ Object literal may only specify known properties, but 'logoSlott' does not exist in type 'PrinterOptions'. Did you mean to write 'logoSlot'? (TS2561)
```

- `declare module '라이브러리이름' { ... }` 안에 같은 이름의 interface를 쓰면 라이브러리의 interface와 **병합**됩니다.
- 첫 줄의 `import 'receipt-printer'`가 중요합니다. 이 파일을 **모듈**로 만들어 주어서, `declare module`이 "새 모듈을 만드는 것"이 아니라 "기존 모듈을 보강하는 것"으로 해석됩니다. 이 줄이 없으면 전역 파일 안의 `declare module`이 되어 라이브러리 타입 전체를 **덮어써** 버릴 수 있습니다(자주 하는 실수 3).
- 보강할 수 있는 것은 interface처럼 병합이 되는 선언입니다. `type` 별칭으로 정의된 것은 보강할 수 없습니다. 그래서 라이브러리들은 확장 지점을 일부러 interface로 만들어 둡니다.

### 10단계: 실무에서 만나는 모듈 보강 — Vue

실제 라이브러리에서 모듈 보강을 쓰는 대표적인 예가 Vue입니다(작성 시점 기준 Vue 3.5). 앱 전역에 `$formatPrice` 같은 도우미를 등록하면, 템플릿과 컴포넌트에서 `this.$formatPrice`를 타입 안전하게 쓰도록 Vue의 `ComponentCustomProperties` 인터페이스를 보강합니다.

```ts
// 파일: src/vue-ext.ts
// $formatPrice를 전역 속성으로 등록했다고 Vue에 알려 줍니다.
export {}

declare module 'vue' {
  interface ComponentCustomProperties {
    $formatPrice: (amount: number) => string
  }
}
```

```ts
// 파일: src/main.ts
import { createApp, defineComponent } from 'vue'

const app = createApp({})
app.config.globalProperties.$formatPrice = (amount: number) => amount.toLocaleString('ko-KR') + '원'

defineComponent({
  props: { price: { type: Number, required: true } },
  computed: {
    label(): string {
      return this.$formatPrice(this.price) // ✅ 보강 덕분에 타입이 붙습니다
    },
  },
})
```

보강 파일을 지우면 `this.$formatPrice`에서 "`$formatPrice` 속성이 없다"는 TS2339 에러가 납니다. Pinia, Vue Router, Express(`Request`에 `user` 속성 추가) 같은 라이브러리 문서에서 `declare module`을 만나면, 모두 이 레슨의 9단계와 같은 원리입니다. Vue 쪽 자세한 사용법은 7부 [Vue 3 + TS](../part7-practice/04-vue)에서 다룹니다.

## 자주 하는 실수

### 실수 1: 선언 파일에 구현을 씀

```ts
// 파일: src/legacy/pos-utils.d.ts
export function formatPrice(amount: number): string {
  return amount + '원'
}
// ❌ An implementation cannot be declared in ambient contexts. (TS1183)
```

**왜 틀렸나**: `.d.ts` 파일 전체는 "선언만 있는 곳"(ambient context)입니다. 함수 몸체나 변수 초깃값 같은 구현을 쓸 수 없습니다. 구현은 `.js` 파일에 있습니다.

**고친 코드**: 시그니처만 남깁니다.

```ts
// 파일: src/legacy/pos-utils.d.ts
export declare function formatPrice(amount: number): string
```

### 실수 2: 전역 선언 파일에 import를 넣어 전역이 사라짐

```ts
// 파일: src/types/globals.d.ts
import type { Member } from '../member'

declare const CURRENT_MEMBER: Member
```

```ts
// 파일: src/header.ts
console.log(CURRENT_MEMBER.nickname)
// ❌ Cannot find name 'CURRENT_MEMBER'. (TS2304)
```

**왜 틀렸나**: 맨 위에 `import`가 생기는 순간 이 파일은 **모듈**이 되어, 안의 선언이 그 파일 안에서만 보입니다. 전역 선언이 조용히 사라진 것입니다.

**고친 코드**: 전역에 내보낼 선언을 `declare global`로 감쌉니다.

```ts
// 파일: src/types/globals.d.ts
import type { Member } from '../member'

declare global {
  const CURRENT_MEMBER: Member
}
```

### 실수 3: 모듈 보강 파일을 전역 파일로 만들어 라이브러리 타입을 덮어씀

```ts
// 파일: src/types/receipt-printer-ext.d.ts
// import/export가 없습니다!
declare module 'receipt-printer' {
  interface PrinterOptions {
    logoSlot?: number
  }
}
```

```ts
// 파일: src/use-printer.ts
import { createPrinter } from 'receipt-printer'
// ❌ Module '"receipt-printer"' has no exported member 'createPrinter'. (TS2305)
```

**왜 틀렸나**: import/export가 없는 전역 파일 안의 `declare module 'receipt-printer'`는 "보강"이 아니라 **그 모듈을 새로 선언**하는 것으로 해석됩니다. 우리가 적은 `PrinterOptions`만 있는 모듈이 되어 `createPrinter`가 사라졌습니다.

**고친 코드**: 파일 맨 위에 `import 'receipt-printer'`(또는 `export {}`)를 넣어 모듈로 만듭니다(9단계).

```ts
// 파일: src/types/receipt-printer-ext.d.ts
import 'receipt-printer'

declare module 'receipt-printer' {
  interface PrinterOptions {
    logoSlot?: number
  }
}
```

### 실수 4: type으로 정의된 것을 보강하려 함

```ts
type StoreInfo = { storeId: string }
// ❌ Duplicate identifier 'StoreInfo'. (TS2300)
type StoreInfo = { phone: string }
// ❌ Duplicate identifier 'StoreInfo'. (TS2300)
```

**왜 틀렸나**: 선언 병합은 interface(와 namespace 등 일부 선언)에서만 일어납니다. `type` 별칭은 한 번 정하면 끝입니다.

**고친 코드**: 확장 가능해야 하는 타입은 interface로 선언합니다.

```ts
interface StoreInfo {
  storeId: string
}
interface StoreInfo {
  phone: string
}

const info: StoreInfo = { storeId: 'S01', phone: '02-123-4567' }
console.log(info.phone) // 출력: 02-123-4567
```

## 직접 해 보기

### 문제 1 ⭐ declare로 전역 변수 알리기

HTML에서 `<script>var APP_VERSION = '2.3.1'</script>`로 넣어 주는 전역 변수 `APP_VERSION`을 TypeScript에서 쓸 수 있게 선언하세요.

::: details 정답 보기

```ts
declare const APP_VERSION: string

const footer = `POS v${APP_VERSION}`
```

프로젝트 전체에서 쓰려면 import/export가 없는 `.d.ts` 파일(예: `src/types/globals.d.ts`)에 넣습니다.
:::

### 문제 2 ⭐ JS 함수의 선언 작성

다음 JS 함수의 선언을 작성하세요.

```js
export function splitBill(total, people) {
  const each = Math.floor(total / people)
  return { each, remainder: total - each * people }
}
```

::: details 정답 보기

```ts
// 파일: split-bill.d.ts
export declare function splitBill(total: number, people: number): { each: number; remainder: number }
```

반환하는 객체 모양까지 적어 두면, 쓰는 쪽에서 `result.remainder` 자동 완성이 뜹니다.
:::

### 문제 3 ⭐⭐ 이미지·CSS 모듈 선언

`.png` 파일 import는 URL 문자열을, `.module.css` 파일 import는 "클래스 이름 → 문자열" 객체를 돌려준다고 선언하세요.

::: details 정답 보기

```ts
// 파일: src/types/assets.d.ts
declare module '*.png' {
  const url: string
  export default url
}

declare module '*.module.css' {
  const classes: { readonly [className: string]: string }
  export default classes
}
```
:::

### 문제 4 ⭐⭐ Window에 분석 도구 추가

외부 분석 스크립트가 `window.analytics.track(eventName, payload)` 함수를 만들어 준다고 합니다. 모듈 파일에서 `Window`를 보강하세요. `payload`는 선택이며 아무 키·값을 받는 객체입니다.

::: details 정답 보기

```ts
// 파일: src/types/analytics.d.ts
export {}

declare global {
  interface Window {
    analytics: {
      track: (eventName: string, payload?: Record<string, unknown>) => void
    }
  }
}
```

스크립트 로드에 실패할 수 있다면 `analytics?:`처럼 선택 속성으로 두고, 쓰기 전에 확인하게 만드는 편이 안전합니다.
:::

### 문제 5 ⭐⭐⭐ 이벤트 맵 보강

라이브러리 `pos-events`가 `export interface PosEventMap { orderCreated: { orderId: number } }`와 `export declare function emit<K extends keyof PosEventMap>(name: K, payload: PosEventMap[K]): void`를 제공합니다. 우리 매장 전용 이벤트 `drawerOpened: { by: string }`을 보강으로 추가해, `emit('drawerOpened', { by: '점장' })`이 타입 검사를 통과하게 하세요.

::: details 정답 보기

```ts
// 파일: src/types/pos-events-ext.d.ts
import 'pos-events'

declare module 'pos-events' {
  interface PosEventMap {
    drawerOpened: { by: string }
  }
}
```

```ts
// 파일: src/drawer.ts
import { emit } from 'pos-events'

emit('drawerOpened', { by: '점장' }) // ✅ keyof PosEventMap에 'drawerOpened'가 더해졌습니다
```

라이브러리가 이벤트 목록을 interface로 열어 두었기 때문에 가능한 확장입니다. `emit`의 `K extends keyof PosEventMap` 제약은 보강된 interface를 그대로 따라갑니다.
:::

## 확인 퀴즈

1. `.d.ts` 파일에는 무엇이 들어 있고, 무엇이 들어 있지 않나요?
2. `declare const X: string`과 `const X = 'a'`의 차이는 무엇인가요?
3. `.d.ts` 파일이 전역 선언 파일이 되는 조건은 무엇인가요?
4. 라이브러리에 타입이 없을 때 찾아볼 순서를 말해 보세요.
5. 모듈 보강 파일 맨 위에 `import '라이브러리'`나 `export {}`가 필요한 이유는?

::: details 정답 보기

1. 이름과 타입(시그니처)만 있고, 함수 몸체나 초깃값 같은 구현은 없습니다.
2. `declare`는 "이미 어딘가에 있다"고 알리기만 하고 JavaScript 결과에 아무것도 남기지 않습니다. `const X = 'a'`는 실제로 값을 만듭니다.
3. 파일에 `import`나 `export`가 하나도 없어야 합니다.
4. 라이브러리 자체에 타입이 포함되어 있는지 → `@types/라이브러리이름`(DefinitelyTyped)이 있는지 → 둘 다 없으면 직접 `.d.ts` 작성.
5. 파일을 모듈로 만들어야 `declare module`이 기존 모듈의 "보강"으로 해석되기 때문입니다. 전역 파일이면 모듈을 새로 선언해 원래 타입을 덮어쓸 수 있습니다.
:::

## 정리

- 선언 파일(`.d.ts`)은 구현 없이 타입만 적은 설명서입니다. `tsc -d`로 만들거나, 타입 없는 JS 옆에 같은 이름으로 직접 씁니다.
- `declare`는 "이미 있는 값"의 타입을 알립니다. 확인 없이 믿는 약속이므로 실제 값과 맞게 써야 합니다.
- import/export가 없는 `.d.ts`는 전역 선언 파일입니다. 전역 변수·함수·`namespace`·와일드카드 모듈(`'*.svg'`)을 선언합니다.
- 라이브러리 타입은 "자체 포함 → `@types`(DefinitelyTyped) → 직접 작성" 순으로 찾습니다.
- 같은 이름의 interface는 병합됩니다. 이를 이용해 `declare global`로 `Window`를, `declare module '이름'`으로 라이브러리 타입을 보강합니다. 보강 파일은 반드시 모듈이어야 합니다.

## 다음 단계

[타입 레벨 프로그래밍 훈련 (type-challenges 풀이)](./09-type-challenges)에서는 Part 5에서 배운 조건부 타입·infer·매핑된 타입·템플릿 리터럴·재귀를 모두 엮어, 유명한 타입 퍼즐을 직접 풀어 봅니다.
