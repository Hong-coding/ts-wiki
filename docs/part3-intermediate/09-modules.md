---
title: '모듈: import/export와 타입 전용 import'
---

# 모듈: import/export와 타입 전용 import

<LessonMeta level="중급" :minutes="45" prev="클래스의 접근 제어자, 상속과 override, 추상 클래스와 implements" />

## 이번에 배울 것

- 파일 하나가 하나의 **모듈**이고, 모듈마다 자기만의 스코프를 가진다는 것을 설명할 수 있다.
- named export·default export를 만들고 `import`로 가져올 수 있다.
- 재수출(barrel 파일)을 만들고, 그 주의점을 설명할 수 있다.
- `import type`/`export type`으로 타입만 가져오고, `verbatimModuleSyntax`가 무엇을 요구하는지 설명할 수 있다.
- 순환 참조가 왜 실행 중 오류를 만드는지 알고 피할 수 있다.

## 먼저 알아 둘 것

- [스코프와 클로저](../part1-basics/10-scope-closure): 변수가 보이는 범위
- [첫 프로그램: tsc로 컴파일하고 실행하기](../part0-start/05-first-program)
- [클래스](./08-classes)와 [유틸리티 타입](./07-utility-types): 이번 레슨 예제에서 나눠 담을 코드

## 비유로 이해하기

규모가 큰 매장을 떠올려 보세요. 주방, 창고, 계산대가 **각자의 방**에 있습니다.

- 주방 안에서 쓰는 도구(칼, 도마)는 주방 사람들만 씁니다. 다른 방에서는 보이지도 않습니다.
- 주방이 다른 방에 내주는 것(완성된 음료)은 **배식 창구**를 통해서만 나갑니다.
- 계산대는 "주방 창구에서 아메리카노를 받아 온다"고 **명시적으로 요청**해야 쓸 수 있습니다.

TypeScript·JavaScript의 **모듈**(module)이 이와 같습니다.

- 방 = **파일** 하나
- 방 안의 도구 = 그 파일에서 선언한 변수·함수·타입 (기본적으로 밖에서 안 보임)
- 배식 창구 = **`export`** (밖으로 내보낼 것만 고름)
- 요청 = **`import`** (다른 파일에서 가져옴)

지금까지는 예제를 한 파일에 모두 담았습니다. 실제 프로젝트는 수십~수천 개의 파일로 나뉘고, 각 파일은 필요한 것만 주고받습니다. 이번 레슨은 그 연결 방법을 배웁니다.

## 개념 설명

이 레슨의 여러 파일 예제는 `src/` 폴더 아래 파일들로 이루어진 하나의 작은 프로젝트입니다. 코드 블록 첫 줄의 `// 파일: ...` 주석이 파일 이름입니다. 직접 실행해 보려면 아래 "직접 실행해 보기 설정"을 따라 하세요.

::: details 직접 실행해 보기 설정
빈 폴더에 다음 두 파일을 만들고, 이 레슨의 예제 파일들을 `src/` 아래에 저장합니다.

```json
{ "type": "module" }
```

위 내용을 `package.json`으로, 아래 내용을 `tsconfig.json`으로 저장합니다.

```json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "strict": true,
    "verbatimModuleSyntax": true,
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"]
}
```

그다음 터미널에서 컴파일하고 실행합니다.

```bash
npx tsc
node dist/index.js
```

이 설정은 Node.js가 직접 실행하는 ESM 프로젝트 기준입니다. `module`, `moduleResolution` 같은 옵션의 의미는 [모듈 시스템](../part6-tooling/03-module-systems) 레슨에서 자세히 배웁니다.
:::

### 파일 단위 모듈 스코프

`import`나 `export`가 **하나라도 있는 파일**은 모듈입니다. 모듈 안에서 선언한 것은 그 파일 안에서만 보입니다.

반대로 `import`도 `export`도 없는 파일은 **스크립트**(script)로 취급되어, 선언이 **전역**(프로젝트 전체에서 공유되는 공간)에 놓입니다. 그래서 서로 다른 파일에 같은 이름을 선언하면 충돌합니다.

```ts
// 파일: src/a.ts  (import/export가 없음 → 스크립트)
const storeCode = 'S001'
```

```ts
// 파일: src/b.ts  (import/export가 없음 → 스크립트)
const storeCode = 'S002'
// ❌ Cannot redeclare block-scoped variable 'storeCode'. (TS2451)
```

두 파일이 같은 전역 공간을 쓰기 때문에 `storeCode`가 두 번 선언된 것으로 봅니다. 둘 중 하나에 `export`를 하나라도 붙이면(예: `export {}`) 각각 모듈이 되어 충돌이 사라집니다.

::: info 이 동작은 설정에 따라 다릅니다
위 오류는 `tsc --strict src/a.ts src/b.ts`처럼 기본 설정으로 컴파일할 때 나타납니다. 이 레슨의 실행 설정(`package.json`의 `"type": "module"` + `module: nodenext`)이나 tsconfig의 `moduleDetection: "force"`에서는 `import`/`export`가 없어도 **모든 `.ts` 파일을 모듈로** 취급하므로 이 오류가 나지 않습니다.
:::

::: tip 앞 레슨 예제의 export {}
이 위키의 예제를 여러 파일에 붙여 넣다가 TS2451 오류를 보았다면 이것이 원인입니다. 파일 맨 끝에 `export {}`를 추가하면 "이 파일은 모듈"이라고 알려 줄 수 있습니다. 요즘 프로젝트 파일은 거의 모두 모듈이므로, 실무에서 이 문제를 만날 일은 드뭅니다.
:::

### named export와 import

가장 기본적인 방식은 선언 앞에 `export`를 붙이는 **named export**(이름 붙은 내보내기)입니다.

```ts
// 파일: src/product.ts
// 상품 타입과 상품 관련 함수
export interface Product {
  id: number
  name: string
  price: number
}

export const VAT_RATE = 0.1

export function calcTotal(price: number, qty: number): number {
  return price * qty
}

// export가 없으므로 이 파일 안에서만 쓸 수 있습니다.
function roundWon(value: number): number {
  return Math.round(value)
}

export function withVat(price: number): number {
  return roundWon(price * (1 + VAT_RATE))
}
```

다른 파일에서는 중괄호 안에 **같은 이름**을 적어 가져옵니다.

```ts
// 파일: src/index.ts
import { calcTotal, withVat, VAT_RATE } from './product.js'

console.log(calcTotal(4500, 3))
console.log(withVat(5000), VAT_RATE)
// 출력: 13500
// 출력: 5500 0.1
```

해설:

- `from` 뒤의 `'./product.js'`는 **가져올 파일의 경로**입니다. `./`는 "지금 파일과 같은 폴더"라는 뜻입니다.
- 원본 파일은 `product.ts`인데 `.js`라고 쓰는 이유: Node.js는 **컴파일된 `.js` 파일**을 실행하므로, 실행 시점에 존재할 파일 이름을 적습니다. TypeScript는 `.js`라고 써도 알아서 `product.ts`를 찾아 타입을 검사합니다.
- Vite 같은 번들러(bundler, 여러 파일을 묶어 주는 도구)를 쓰는 프로젝트에서는 확장자 없이 `'./product'`라고 쓰는 경우가 많습니다. 어떤 방식인지는 프로젝트 설정에 따라 다르며, [모듈 시스템](../part6-tooling/03-module-systems) 레슨에서 정리합니다.
- `roundWon`은 `export`하지 않았으므로 `index.ts`에서 가져올 수 없습니다. 바깥에 보여 줄 필요 없는 도우미 함수는 이렇게 숨깁니다.

#### 이름 바꿔 가져오기, 한꺼번에 가져오기

```ts
// 파일: src/index.ts
// as로 이름을 바꿔 가져옵니다. (이름이 겹치거나 더 분명한 이름을 쓰고 싶을 때)
import { calcTotal as total } from './product.js'

// * as로 모듈 전체를 하나의 객체처럼 가져옵니다.
import * as productModule from './product.js'

console.log(total(4500, 3), productModule.calcTotal(1000, 2))
// 출력: 13500 2000
```

내보내는 쪽에서도 `export { calcTotal as calculateTotal }`처럼 이름을 바꿔 내보낼 수 있습니다.

### default export

파일마다 **하나만** 둘 수 있는 특별한 내보내기가 **default export**(기본 내보내기)입니다. 가져올 때 **중괄호 없이** 원하는 이름을 붙입니다.

```ts
// 파일: src/format.ts
// 이 파일의 대표 기능 하나를 default로 내보냅니다.
export default function formatWon(value: number): string {
  return `${value.toLocaleString('ko-KR')}원`
}
```

```ts
// 파일: src/index.ts
import formatWon from './format.js' // 중괄호 없음
import { calcTotal } from './product.js'

console.log(formatWon(calcTotal(5000, 2)))
// 출력: 10,000원
```

#### named와 default 중 무엇을 쓸까?

| 구분 | named export | default export |
|---|---|---|
| 파일당 개수 | 여러 개 | 하나 |
| 가져올 때 이름 | 내보낸 이름 그대로(필요하면 `as`) | 가져오는 쪽이 아무 이름이나 붙임 |
| 이름 바꾸기(리팩터링) | 에디터가 모든 사용처를 함께 바꿔 줌 | 파일마다 다른 이름으로 가져와 추적이 어려움 |
| 자동 import | 잘 됨 | 이름이 정해져 있지 않아 덜 정확함 |

가져오는 쪽이 이름을 마음대로 정할 수 있다는 점은 편해 보이지만, 같은 함수가 파일마다 `formatWon`, `format`, `toWon`처럼 다른 이름으로 불리게 됩니다. 그래서 **named export를 기본으로 쓰는 팀이 많습니다.** 다만 React 컴포넌트 파일이나 Vue 단일 파일 컴포넌트, 일부 프레임워크 설정 파일처럼 default export를 요구·관례로 하는 곳에서는 그 규칙을 따릅니다.

### import type과 export type

모듈 사이에서 **타입만** 주고받을 때는 `import type`을 쓸 수 있습니다.

```ts
// 파일: src/order.ts
import type { Product } from './product.js'

export type OrderLine = {
  product: Product
  qty: number
}
```

```ts
// 파일: src/index.ts
import { calcTotal } from './product.js'
import type { Product } from './product.js'
import type { OrderLine } from './order.js'

const latte: Product = { id: 1, name: '카페라테', price: 5000 }
const line: OrderLine = { product: latte, qty: 2 }

console.log(calcTotal(line.product.price, line.qty))
// 출력: 10000
```

#### 왜 타입 전용 import가 필요할까?

타입은 컴파일하면 사라집니다. 그렇다면 **타입만 가져오는 `import` 문도 컴파일 결과에서 사라져야** 합니다. 위 `order.ts`를 컴파일한 `order.js`는 실제로 이렇게 됩니다.

```js
export {};
```

`import type` 줄은 흔적도 없이 지워졌습니다. `import type`이라고 적어 두면 다음과 같은 장점이 있습니다.

- 읽는 사람도, 컴파일러도 "이 줄은 실행 중에 아무 일도 하지 않는다"는 것을 바로 압니다.
- 타입만 쓰는 import 때문에 쓸데없이 파일이 로드되거나, 그로 인해 순환 참조(아래에서 설명)가 생기는 일을 막습니다.
- Babel, esbuild처럼 **파일을 하나씩 따로 변환하는 도구**는 다른 파일을 보지 않으므로 `Product`가 타입인지 값인지 알 수 없습니다. `import type`이라고 적혀 있어야 안전하게 지울 수 있습니다.

값과 타입을 한 줄에서 함께 가져올 때는 이름 앞에 `type`을 붙이는 **인라인 형태**를 씁니다(TypeScript 4.5+).

```ts
// 파일: src/main.ts
import { calcTotal, type Product } from './product.js'

const scone: Product = { id: 2, name: '스콘', price: 3200 }
console.log(calcTotal(scone.price, 2))
// 출력: 6400
```

내보낼 때도 마찬가지로 `export type { Product }`나 `export { type Product }`처럼 타입 전용임을 표시할 수 있습니다.

#### verbatimModuleSyntax

tsconfig의 **`verbatimModuleSyntax`**(TypeScript 5.0+) 옵션을 켜면 규칙이 단순해집니다.

- `type`이 붙은 import/export는 **반드시 지웁니다.**
- `type`이 붙지 않은 import/export는 **적힌 그대로(verbatim) 남깁니다.**

그래서 이 옵션을 켜면 **타입을 가져오면서 `type`을 빠뜨리는 것이 오류**가 됩니다.

```ts
// 파일: src/index.ts  (verbatimModuleSyntax: true)
import { Product } from './product.js'
// ❌ 'Product' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled. (TS1484)
```

`Product`는 실행 중에 존재하지 않는데 `import { Product }`가 그대로 남으면 실행 중에 "그런 export가 없다"는 오류가 나기 때문입니다. `import type { Product }`나 `import { type Product }`로 고치면 됩니다.

최근 Vite 템플릿 등 새 프로젝트 설정에서는 이 옵션이 켜져 있는 경우가 많습니다. 옵션을 켜지 않았더라도 **타입은 `import type`으로 가져오는 습관**을 들이면 어느 설정에서나 안전합니다.

### 재수출과 배럴 파일

다른 모듈에서 가져온 것을 그대로 다시 내보내는 것을 **재수출**(re-export)이라고 합니다. 폴더 하나의 공개 창구 역할을 하는 `index.ts`를 흔히 **배럴 파일**(barrel file, 여러 개를 담는 통)이라고 부릅니다.

```ts
// 파일: src/models/product.ts
export interface Product {
  id: number
  name: string
}

export function productLabel(p: Product): string {
  return `#${p.id} ${p.name}`
}
```

```ts
// 파일: src/models/member.ts
export interface Member {
  memberNo: string
  name: string
}

export function memberLabel(m: Member): string {
  return `${m.name}(${m.memberNo})`
}
```

```ts
// 파일: src/models/index.ts
// models 폴더의 공개 창구(배럴 파일)
export { productLabel } from './product.js' // 골라서 재수출
export type { Product } from './product.js' // 타입만 재수출
export * from './member.js' // 전부 재수출
```

```ts
// 파일: src/main.ts
// 폴더 안의 파일 구조를 몰라도 한 곳에서 가져올 수 있습니다.
import { productLabel, memberLabel } from './models/index.js'
import type { Product, Member } from './models/index.js'

const p: Product = { id: 1, name: '아메리카노' }
const m: Member = { memberNo: 'M0007', name: '김하늘' }
console.log(productLabel(p), memberLabel(m))
// 출력: #1 아메리카노 김하늘(M0007)
```

가져오는 쪽 코드가 짧아지고, 폴더 안의 파일 구성을 바꿔도 바깥 코드는 그대로 둘 수 있습니다.

::: warning 배럴 파일의 주의점
- **필요 없는 파일까지 로드됩니다.** 배럴에서 함수 하나만 가져와도 배럴이 재수출하는 모든 파일이 실행됩니다. 파일이 많으면 테스트·개발 서버 시작이 느려지고, 번들 크기 최적화(tree shaking)가 잘 안 될 수 있습니다.
- **순환 참조가 생기기 쉽습니다.** 같은 폴더 안의 파일이 자기 폴더의 배럴(`./index.js`)을 import하면 금방 순환이 생깁니다. **폴더 안에서는 배럴이 아니라 실제 파일을 직접 import**하세요.
- **`export *`는 이름 충돌을 숨깁니다.** 두 파일이 같은 이름을 내보내면 그 이름은 배럴에서 조용히 빠질 수 있습니다. 공개할 것을 명시적으로 나열하는 편이 안전합니다.
- 큰 배럴 하나보다 **기능별로 작은 배럴**을 두거나, 배럴 없이 파일을 직접 import하는 팀도 많습니다. 팀 규칙을 따르세요.
:::

### 순환 참조 주의

**순환 참조**(circular import)는 A 파일이 B를 import하고, B 파일도 A를 import하는 상황입니다. 컴파일 오류는 나지 않지만 **실행 순서** 때문에 문제가 생길 수 있습니다.

```ts
// 파일: src/config.ts
import { ORDER_PREFIX } from './order.js'

export const STORE_NAME = '강남점'
export const FIRST_ORDER_NO = `${ORDER_PREFIX}0001`
```

```ts
// 파일: src/order.ts
import { STORE_NAME } from './config.js'

export const ORDER_PREFIX = 'A-'

export function formatOrder(orderNo: string): string {
  return `[${STORE_NAME}] 주문 ${orderNo}`
}
```

```ts
// 파일: src/main.ts
import { formatOrder } from './order.js'

console.log(formatOrder('A-0002'))
```

`tsc`는 아무 오류 없이 컴파일하지만, 실행하면 이렇게 됩니다.

```text
ReferenceError: Cannot access 'ORDER_PREFIX' before initialization
```

무슨 일이 일어났는지 순서대로 따라가 봅시다.

1. `main.ts`가 `order.ts`를 import합니다. `order.ts`를 실행하기 전에, 먼저 `order.ts`가 import하는 `config.ts`부터 실행합니다.
2. `config.ts`도 `order.ts`를 import하지만, `order.ts`는 이미 "실행 준비 중"이므로 다시 실행하지 않고 넘어갑니다.
3. `config.ts`의 본문이 실행되며 `` `${ORDER_PREFIX}0001` ``을 계산하려 합니다. 그런데 `order.ts`의 `const ORDER_PREFIX = 'A-'` 줄은 **아직 실행되지 않았습니다.**
4. 초기화 전의 `const`에 접근했으므로 `ReferenceError`가 납니다.

#### 고치는 방법

두 파일이 **함께 필요로 하는 것을 제3의 파일로 옮겨**, import 방향을 한쪽으로만 흐르게 만듭니다.

```ts
// 파일: src/constants.ts
// 다른 파일을 import하지 않는 상수만 모아 둡니다.
export const STORE_NAME = '강남점'
export const ORDER_PREFIX = 'A-'
```

```ts
// 파일: src/config.ts
import { ORDER_PREFIX } from './constants.js'

export const FIRST_ORDER_NO = `${ORDER_PREFIX}0001`
```

```ts
// 파일: src/order.ts
import { STORE_NAME } from './constants.js'

export function formatOrder(orderNo: string): string {
  return `[${STORE_NAME}] 주문 ${orderNo}`
}
```

```ts
// 파일: src/main.ts
import { formatOrder } from './order.js'
import { FIRST_ORDER_NO } from './config.js'

console.log(formatOrder(FIRST_ORDER_NO))
// 출력: [강남점] 주문 A-0001
```

이제 `config.ts`와 `order.ts`는 서로를 import하지 않고 둘 다 `constants.ts`만 바라봅니다.

::: tip 순환 참조를 줄이는 습관
- **타입만 필요하면 `import type`** 을 씁니다. 타입 import는 실행 중에 지워지므로 순환을 만들지 않습니다.
- 공통 상수·타입은 **다른 파일을 import하지 않는 "바닥" 파일**(`constants.ts`, `types.ts`)에 둡니다.
- 의존 방향을 "화면 → 서비스 → 모델"처럼 한 방향으로 정해 둡니다.
- `madge` 같은 도구로 순환 참조를 찾아낼 수도 있습니다(외부 패키지이므로 도입 전 팀 확인을 권합니다).
:::

## 자주 하는 실수

### 실수 1: export하지 않은 것을 import하기

```ts
// 파일: src/index.ts
import { roundWon } from './product.js'
// ❌ Module '"./product.js"' declares 'roundWon' locally, but it is not exported. (TS2459)
```

**왜 틀렸나:** `roundWon`은 `product.ts` 안에 있지만 `export`가 없어서 바깥에 공개되지 않았습니다. 오류 메시지가 "선언은 있지만 내보내지 않았다"고 정확히 알려 줍니다.

```ts
// 파일: src/product.ts
// ✅ 바깥에서도 써야 한다면 export를 붙입니다.
export function roundWon(value: number): number {
  return Math.round(value)
}
```

정말 공개해도 되는 함수인지 먼저 생각해 보세요. 내부 도우미라면 공개하지 않고, 공개된 함수(`withVat`)를 쓰도록 하는 편이 낫습니다.

### 실수 2: default export를 중괄호로 가져오기

```ts
// 파일: src/index.ts
import { formatWon } from './format.js'
// ❌ Module '"./format.js"' has no exported member 'formatWon'. Did you mean to use 'import formatWon from "./format.js"' instead? (TS2614)
```

**왜 틀렸나:** `format.ts`는 `formatWon`을 **default**로 내보냈습니다. 중괄호는 named export를 가져오는 문법이므로, `formatWon`이라는 named export를 찾다가 실패합니다.

```ts
// 파일: src/index.ts
// ✅ default export는 중괄호 없이 가져옵니다.
import formatWon from './format.js'

console.log(formatWon(4500))
// 출력: 4,500원
```

이런 혼동을 줄이려고 named export를 기본으로 쓰는 팀이 많습니다.

### 실수 3: 확장자 없이 상대 경로 쓰기 (Node ESM 설정)

```ts
// 파일: src/index.ts  (moduleResolution: nodenext)
import { calcTotal } from './product'
// ❌ Relative import paths need explicit file extensions in ECMAScript imports when '--moduleResolution' is 'node16' or 'nodenext'. Did you mean './product.js'? (TS2835)
```

**왜 틀렸나:** Node.js의 ESM은 확장자를 자동으로 붙여 주지 않습니다. TypeScript도 이 규칙에 맞춰 검사합니다.

```ts
// 파일: src/index.ts
// ✅ 실행될 파일의 확장자(.js)를 적습니다.
import { calcTotal } from './product.js'
```

Vite 같은 번들러를 쓰는 프로젝트(`moduleResolution: bundler`)에서는 확장자 없이 써도 됩니다. 프로젝트의 tsconfig를 먼저 확인하세요.

### 실수 4: import type으로 가져온 것을 값으로 쓰기

```ts
// 파일: src/index.ts
import type { VAT_RATE } from './product.js'

console.log(1000 * (1 + VAT_RATE))
// ❌ 'VAT_RATE' cannot be used as a value because it was imported using 'import type'. (TS1361)
```

**왜 틀렸나:** `import type`으로 가져온 것은 컴파일 후 사라지므로 실행 중에 쓸 수 없습니다. `VAT_RATE`는 값(상수)이므로 일반 `import`로 가져와야 합니다.

```ts
// 파일: src/index.ts
// ✅ 값은 일반 import로 가져옵니다.
import { VAT_RATE } from './product.js'

console.log(1000 * (1 + VAT_RATE))
// 출력: 1100
```

## 직접 해 보기

### 문제 1 ⭐ 기초

`src/member.ts`에 회원 타입 `Member`(`memberNo`, `name`, `point`)와 포인트를 더하는 함수 `addPoint`를 named export로 만들고, `src/index.ts`에서 가져와 써 보세요. 타입은 `import type`으로 가져오세요.

::: details 정답 보기
```ts
// 파일: src/member.ts
export interface Member {
  memberNo: string
  name: string
  point: number
}

export function addPoint(member: Member, amount: number): Member {
  return { ...member, point: member.point + amount }
}
```

```ts
// 파일: src/index.ts
import { addPoint } from './member.js'
import type { Member } from './member.js'

const m: Member = { memberNo: 'M0007', name: '김하늘', point: 1000 }
console.log(addPoint(m, 500).point)
// 출력: 1500
```
:::

### 문제 2 ⭐ 기초

다음 import 문 중 `verbatimModuleSyntax: true`에서 오류가 나는 것을 고르고 고쳐 보세요. (`Member`는 인터페이스, `addPoint`는 함수)

```text
import { Member, addPoint } from './member.js'    // (가)
import { type Member, addPoint } from './member.js' // (나)
import type { Member } from './member.js'          // (다)
```

::: details 정답 보기
(가)가 오류입니다. `Member`는 타입인데 `type` 표시 없이 가져왔으므로 TS1484 오류가 납니다. (나)처럼 이름 앞에 `type`을 붙이거나, 타입과 값을 (다) + 일반 import 두 줄로 나눕니다.

```ts
// 파일: src/index.ts
import { type Member, addPoint } from './member.js'
```
:::

### 문제 3 ⭐⭐ 응용

`src/models/` 폴더에 `product.ts`, `member.ts`가 있습니다. `src/models/index.ts` 배럴 파일을 만들어, 함수는 일반 재수출하고 타입은 `export type`으로 재수출하세요. 그리고 같은 폴더 안의 `member.ts`가 `product.ts`의 타입을 써야 할 때 **어디서** import해야 하는지 말해 보세요.

::: details 정답 보기
```ts
// 파일: src/models/index.ts
export { productLabel } from './product.js'
export type { Product } from './product.js'
export { memberLabel } from './member.js'
export type { Member } from './member.js'
```

같은 폴더 안의 `member.ts`는 배럴(`./index.js`)이 아니라 **`./product.js`를 직접** import해야 합니다. 배럴을 import하면 배럴 → `member.ts` → 배럴로 이어지는 순환 참조가 생길 수 있습니다. 타입만 필요하므로 `import type { Product } from './product.js'`로 쓰면 더 안전합니다.
:::

### 문제 4 ⭐⭐ 응용

다음 두 파일은 실행하면 `ReferenceError`가 납니다(`main.ts`가 `cart.ts`를 먼저 import). 원인을 설명하고 순환 참조를 없애도록 고치세요.

```text
// 파일: src/cart.ts
import { FREE_SHIPPING_MIN } from './shipping.js'
export const MAX_CART_ITEMS = 50
export function isFreeShipping(total: number): boolean {
  return total >= FREE_SHIPPING_MIN
}

// 파일: src/shipping.ts
import { MAX_CART_ITEMS } from './cart.js'
export const FREE_SHIPPING_MIN = 30000
export const SHIPPING_NOTE = `최대 ${MAX_CART_ITEMS}개까지 주문 가능`
```

::: details 정답 보기
`cart.ts`를 실행하기 전에 `shipping.ts`가 먼저 실행되고, 그 본문에서 아직 초기화되지 않은 `MAX_CART_ITEMS`를 읽으려 해서 오류가 납니다. 두 상수를 다른 파일을 import하지 않는 파일로 옮깁니다.

```ts
// 파일: src/constants.ts
export const MAX_CART_ITEMS = 50
export const FREE_SHIPPING_MIN = 30000
```

```ts
// 파일: src/cart.ts
import { FREE_SHIPPING_MIN } from './constants.js'

export function isFreeShipping(total: number): boolean {
  return total >= FREE_SHIPPING_MIN
}
```

```ts
// 파일: src/shipping.ts
import { MAX_CART_ITEMS } from './constants.js'

export const SHIPPING_NOTE = `최대 ${MAX_CART_ITEMS}개까지 주문 가능`
```
:::

### 문제 5 ⭐⭐⭐ 도전

지난 레슨의 결제 처리기(`PaymentProcessor` 추상 클래스, `CardProcessor`, `PointProcessor`)를 여러 파일로 나누어 보세요. 조건은 다음과 같습니다.

- `src/payment/processor.ts`: 추상 클래스
- `src/payment/card.ts`, `src/payment/point.ts`: 구현 클래스
- `src/payment/index.ts`: 바깥에 공개할 것만 재수출하는 배럴
- `src/index.ts`: 배럴에서 가져와 두 처리기로 5,000원씩 결제

::: details 정답 보기
```ts
// 파일: src/payment/processor.ts
export abstract class PaymentProcessor {
  constructor(protected readonly storeCode: string) {}

  protected abstract approve(amount: number): string

  process(amount: number): void {
    console.log(`[${this.storeCode}] ${amount}원 승인 ${this.approve(amount)}`)
  }
}
```

```ts
// 파일: src/payment/card.ts
// 같은 폴더 안에서는 배럴이 아니라 실제 파일을 import합니다.
import { PaymentProcessor } from './processor.js'

export class CardProcessor extends PaymentProcessor {
  protected override approve(amount: number): string {
    return `CARD-${amount}`
  }
}
```

```ts
// 파일: src/payment/point.ts
import { PaymentProcessor } from './processor.js'

export class PointProcessor extends PaymentProcessor {
  protected override approve(amount: number): string {
    return `PT-${amount}`
  }
}
```

```ts
// 파일: src/payment/index.ts
export { PaymentProcessor } from './processor.js'
export { CardProcessor } from './card.js'
export { PointProcessor } from './point.js'
```

```ts
// 파일: src/index.ts
import { CardProcessor, PointProcessor, type PaymentProcessor } from './payment/index.js'

const processors: PaymentProcessor[] = [new CardProcessor('S001'), new PointProcessor('S001')]
processors.forEach((p) => p.process(5000))
// 출력: [S001] 5000원 승인 CARD-5000
// 출력: [S001] 5000원 승인 PT-5000
```
`src/index.ts`에서는 `PaymentProcessor`를 타입으로만 쓰므로 `type`을 붙였습니다. 클래스는 값이면서 타입이기도 해서, 타입으로만 쓸 때는 `type`을 붙여 가져올 수 있습니다.
:::

## 확인 퀴즈

1. TypeScript는 어떤 파일을 "모듈"로 취급하나요? 모듈이 아닌 파일의 선언은 어디에 놓이나요?
2. named export와 default export는 가져오는 문법이 어떻게 다른가요?
3. `import type`으로 가져온 것은 컴파일 결과에서 어떻게 되나요?
4. `verbatimModuleSyntax`를 켜면 어떤 import가 오류가 되나요?
5. 배럴 파일을 쓸 때 같은 폴더 안의 파일끼리는 어떻게 import해야 하나요?
6. 순환 참조가 있으면 왜 `Cannot access ... before initialization` 오류가 날 수 있나요?

::: details 정답 보기
1. `import`나 `export`가 하나라도 있는 파일이 모듈입니다. 둘 다 없는 파일은 스크립트로 취급되어 선언이 전역에 놓입니다.
2. named export는 `import { 이름 } from '...'`처럼 중괄호와 내보낸 이름으로, default export는 `import 아무이름 from '...'`처럼 중괄호 없이 가져옵니다.
3. 완전히 지워집니다. 실행 중에는 아무 일도 하지 않습니다.
4. 타입을 `type` 표시 없이 가져오는 import입니다(TS1484).
5. 배럴(`./index.js`)이 아니라 실제 파일(`./product.js`)을 직접 import합니다. 순환 참조를 막기 위해서입니다.
6. 서로 import하는 파일 중 한쪽이 먼저 실행되는데, 그때 다른 쪽 파일의 `const`가 아직 실행(초기화)되지 않았을 수 있기 때문입니다.
:::

## 정리

- 파일 하나가 모듈 하나이고, 모듈 안의 선언은 `export`하지 않으면 바깥에서 보이지 않습니다. `import`/`export`가 없는 파일은 전역 스크립트가 됩니다.
- named export는 여러 개, default export는 파일당 하나입니다. 이름이 일관되게 유지되는 named export를 기본으로 쓰는 팀이 많습니다.
- 타입만 가져올 때는 `import type`(또는 `import { type X }`)을 씁니다. 컴파일 후 완전히 사라집니다.
- `verbatimModuleSyntax`(TS 5.0+)를 켜면 타입 import에 `type` 표시가 필수가 됩니다.
- 배럴 파일은 편하지만 불필요한 로드·순환 참조·이름 충돌에 주의합니다. 폴더 안에서는 실제 파일을 직접 import합니다.
- 순환 참조는 컴파일은 통과해도 실행 중 오류를 만들 수 있습니다. 공통 부분을 "바닥" 파일로 옮겨 의존 방향을 한쪽으로 만듭니다.
- 확장자 표기(`.js` 여부)와 모듈 해석 방식은 프로젝트 설정에 따라 다릅니다. 자세한 내용은 [모듈 시스템](../part6-tooling/03-module-systems)에서 배웁니다.

## 다음 단계

Part 3을 모두 마쳤습니다. 제네릭·유틸리티 타입·클래스·모듈로 재사용 가능한 타입을 설계하는 힘이 생겼습니다. 다음은 [Part 4. 비동기 프로그래밍과 데이터 다루기](../part4-async/)의 첫 레슨 [동기 vs 비동기, 콜백과 이벤트 루프](../part4-async/01-event-loop-callback)입니다. 서버에서 데이터를 받아 오는 코드에 타입을 붙이는 방법을 배웁니다.
