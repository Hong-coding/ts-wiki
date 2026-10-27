---
title: JavaScript 프로젝트를 TypeScript로 마이그레이션
---

# JavaScript 프로젝트를 TypeScript로 마이그레이션

<LessonMeta level="실전" :minutes="60" prev="tsc·tsx·Node 타입 스트리핑·Vite·tsup 비교와 타입 검사 병행" />

## 이번에 배울 것

- 운영 중인 JS 프로젝트를 **멈추지 않고** 조금씩 TypeScript로 옮기는 전략을 세울 수 있다.
- `allowJs`, `checkJs`, `// @ts-check`, JSDoc 타입으로 `.js` 파일을 그대로 둔 채 타입 검사를 시작할 수 있다.
- 의존 관계를 보고 **잎 모듈부터** 옮기는 순서를 정할 수 있다.
- `@types` 패키지를 설치하고, `@ts-expect-error`와 `@ts-ignore`의 차이를 알고 쓸 수 있다.
- 작은 JS 프로젝트를 실제로 끝까지 TypeScript로 옮길 수 있다.

## 먼저 알아 둘 것

- [tsconfig.json 완전 정복](./01-tsconfig), [strict 옵션 하나씩 이해하기](./02-strict-options)
- [모듈 시스템](./03-module-systems) — ESM과 `.js` 확장자 규칙
- [선언 파일(.d.ts) · 선언 병합 · 모듈 보강](../part5-advanced/08-declaration-files)

이 레슨의 실습은 작성 시점(2026-10)에 Node.js 24.13.1, `typescript` 5.9.3(`npm install -D typescript@5`), `@types/node` 22.20.5, `lodash` 4.18.1, `@types/lodash` 4.17.27로 단계마다 실제로 `tsc`를 돌려 확인했습니다. 에러 메시지는 실제 출력을 옮긴 것입니다(긴 경로는 줄였습니다).

## 비유로 이해하기

24시간 영업하는 매장의 **바닥 타일을 새로 까는** 공사를 생각해 봅시다.

- 매장을 하루 닫고 한 번에 다 바꾸면 빠르지만, 그날 매출이 0이고 공사가 길어지면 큰일 납니다. → **한 번에 전부 `.ts`로 바꾸기**
- 그래서 구역을 나눠 **한 칸씩** 바꿉니다. 손님은 계속 장을 봅니다. → **파일 하나씩 옮기기**
- 공사 순서도 중요합니다. 다른 곳으로 가는 통로가 없는 **구석 칸**부터 바꾸면 다른 구역에 영향이 적습니다. → **잎 모듈부터**
- 아직 안 바꾼 구역에도 "미끄럼 주의" 표지판은 먼저 세울 수 있습니다. → **JS 그대로 두고 `// @ts-check`**

TypeScript 마이그레이션은 이 공사와 같습니다. 핵심은 **어느 순간에도 프로그램이 계속 돌아가야 한다**는 것입니다.

## 개념 설명

### 1단계: 실습용 JS 프로젝트

매장 장바구니와 회원 기능이 있는 작은 프로젝트입니다. 지금 운영 중이라고 가정합니다.

```text
store-js/
├─ package.json        ("type": "module")
└─ src/
   ├─ format.js        금액 포맷 (아무것도 import 하지 않음)
   ├─ cart.js          장바구니 합계 (format.js를 import)
   ├─ members.js       회원 묶기·찾기 (lodash를 import)
   └─ index.js         실행 진입점 (cart.js, members.js를 import)
```

```js
// src/format.js
// 금액을 "15,500원" 형태로
export function won(amount) {
  return amount.toLocaleString('ko-KR') + '원'
}
```

```js
// src/cart.js
import { won } from './format.js'

export function cartTotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0)
}

export function cartSummary(items) {
  const total = cartTotal(items)
  return `${items.length}개 상품, 합계 ${won(total)}`
}
```

```js
// src/members.js
import groupBy from 'lodash/groupBy.js'

export function groupByGrade(members) {
  return groupBy(members, 'grade')
}

export function findMember(members, id) {
  return members.find((m) => m.id === id)
}
```

```js
// src/index.js
import { cartSummary } from './cart.js'
import { groupByGrade, findMember } from './members.js'

const items = [
  { name: '아메리카노', price: 4500, qty: 2 },
  { name: '치즈케이크', price: 6500, qty: '1' },
]
console.log(cartSummary(items))

const members = [
  { id: 'M001', name: '김민지', grade: 'VIP' },
  { id: 'M002', name: '박서준', grade: 'GOLD' },
]
console.log(Object.keys(groupByGrade(members)))
console.log(findMember(members, 'M999').name)
```

```powershell
npm install lodash
node src/index.js
```

```text
2개 상품, 합계 15,500원
[ 'VIP', 'GOLD' ]
TypeError: Cannot read properties of undefined (reading 'name')
```

버그가 두 개 숨어 있습니다. ① 치즈케이크의 `qty`가 문자열 `'1'`인데 `6500 * '1'`이 우연히 `6500`이 되어 드러나지 않았습니다. ② 없는 회원을 찾으면 터집니다. 마이그레이션하면서 TypeScript가 이 둘을 어떻게 찾아내는지 보겠습니다.

### 2단계: TypeScript 설치와 allowJs

먼저 TypeScript를 설치하고, **JS 파일을 그대로 받아들이는** 설정을 만듭니다.

```powershell
npm install -D typescript@5 @types/node@22
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es2023",
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "types": ["node"],
    "rootDir": "src",
    "outDir": "dist",
    "allowJs": true,
    "checkJs": false,
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

- `allowJs`(1.8+) — `.js` 파일도 프로젝트에 포함하고, `outDir`로 복사·변환합니다. `.js`와 `.ts`가 서로 import 할 수 있게 됩니다.
- `checkJs`(2.3+) — `.js` 파일에도 타입 검사를 할지. **처음에는 `false`** 로 둡니다.
- `strict: true` — 처음부터 켭니다. `.ts`로 옮긴 파일만 엄격하게 검사받으므로 부담이 적습니다.

```powershell
npx tsc
node dist/index.js
```

```text
2개 상품, 합계 15,500원
[ 'VIP', 'GOLD' ]
```

에러 없이 빌드되고 결과도 같습니다(마지막 줄의 TypeError도 그대로). **아무것도 바꾸지 않았지만 이제 TypeScript 빌드 파이프라인 위에 올라탔습니다.** 이 상태로 커밋하고 배포해도 안전합니다. 이것이 마이그레이션의 첫 번째 칸입니다.

### 3단계: 얼마나 할 일이 있는지 보기 — checkJs 한 번 켜 보기

모든 JS 파일을 검사하면 에러가 몇 개나 나올지 한 번 확인해 봅니다. 설정은 바꾸지 않고 명령에만 붙입니다.

```powershell
npx tsc --noEmit --checkJs
```

```text
src/cart.js(3,27): error TS7006: Parameter 'items' implicitly has an 'any' type.
src/cart.js(4,24): error TS7006: Parameter 'sum' implicitly has an 'any' type.
src/cart.js(4,29): error TS7006: Parameter 'item' implicitly has an 'any' type.
src/cart.js(7,29): error TS7006: Parameter 'items' implicitly has an 'any' type.
src/format.js(2,21): error TS7006: Parameter 'amount' implicitly has an 'any' type.
src/members.js(1,21): error TS7016: Could not find a declaration file for module 'lodash/groupBy.js'. '.../node_modules/lodash/groupBy.js' implicitly has an 'any' type.
  Try `npm i --save-dev @types/lodash` if it exists or add a new declaration (.d.ts) file containing `declare module 'lodash/groupBy.js';`
src/members.js(3,30): error TS7006: Parameter 'members' implicitly has an 'any' type.
...
```

작은 프로젝트인데도 10개입니다. 실제 프로젝트라면 수천 개가 나올 수 있습니다. 한 번에 다 고치려 하지 말고, **파일 단위로** 나눠서 진행합니다.

### 4단계: 옮기는 순서 — 잎 모듈부터

**의존 관계**(dependency, 어떤 파일이 어떤 파일을 import 하는지)를 그려 봅니다.

```text
index.js ──▶ cart.js ──▶ format.js
    │
    └─────▶ members.js ──▶ lodash (외부 패키지)
```

- **잎 모듈**(leaf module) — 아무것도 import 하지 않거나 외부 패키지만 import 하는 파일. 나무의 잎처럼 맨 끝에 있습니다. 여기서는 `format.js`, `members.js`.
- **뿌리**(root) — 다른 파일을 많이 import 하는 진입점. 여기서는 `index.js`.

**잎에서 뿌리 방향으로** 옮깁니다. 이유는 이렇습니다.

1. 잎 모듈에 타입이 붙으면, 그것을 import 하는 파일이 **자동으로** 그 타입의 혜택을 받습니다. `format.ts`에 `won(amount: number)`가 생기면 `cart.js`가 잘못 부르는 것을 잡을 수 있습니다.
2. 반대로 뿌리부터 옮기면, import 하는 것들이 모두 타입 없는 JS라 `any`투성이가 됩니다. 고쳐도 효과가 적습니다.
3. 잎은 다른 파일에 기대지 않으니 옮기다 문제가 생겨도 영향이 작습니다.

추가로 우선순위를 높이면 좋은 파일:

- **자주 바뀌고 버그가 자주 나는 파일** — 효과가 가장 큽니다.
- **여러 곳에서 쓰는 공통 유틸·도메인 모델**(`Member`, `Order` 타입) — 한 번 정의하면 전체가 혜택을 받습니다.
- 반대로 **곧 지울 예정인 코드**는 옮기지 않습니다.

### 5단계: 첫 칸 — JS 그대로 두고 // @ts-check + JSDoc

`.ts`로 이름을 바꾸기 전에, **JS 파일 그대로** 타입 검사를 켜는 방법이 있습니다. 파일 맨 위에 `// @ts-check` 한 줄을 넣으면 `checkJs`가 꺼져 있어도 그 파일만 검사합니다. 타입은 **JSDoc 주석**(`/** ... */` 안에 `@param` 등으로 적는 문서 주석)으로 붙입니다.

```js
// src/format.js
// @ts-check

/**
 * 금액을 "15,500원" 형태로
 * @param {number} amount 금액(원)
 * @returns {string}
 */
export function won(amount) {
  return amount.toLocaleString('ko-KR') + '원'
}
```

`cart.js`에는 장바구니 상품의 모양을 `@typedef`로 정의합니다.

```js
// src/cart.js
// @ts-check
import { won } from './format.js'

/**
 * @typedef {object} CartItem
 * @property {string} name 상품명
 * @property {number} price 단가
 * @property {number} qty 수량
 */

/**
 * @param {CartItem[]} items
 * @returns {number}
 */
export function cartTotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0)
}

/** @param {CartItem[]} items */
export function cartSummary(items) {
  const total = cartTotal(items)
  return `${items.length}개 상품, 합계 ${won(total)}`
}
```

```powershell
npx tsc --noEmit   # 에러 없음
```

이제 `index.js`에도 `// @ts-check`를 넣어 봅시다.

```text
src/index.js(9,25): error TS2345: Argument of type '({ name: string; price: number; qty: number; } | { name: string; price: number; qty: string; })[]' is not assignable to parameter of type 'CartItem[]'.
  ...
      Types of property 'qty' are incompatible.
        Type 'string' is not assignable to type 'number'.
```

**숨어 있던 첫 번째 버그를 찾았습니다.** `qty: '1'`을 `qty: 1`로 고칩니다. 파일 이름은 여전히 `.js`이고, 실행 방식도 전혀 바뀌지 않았습니다.

자주 쓰는 JSDoc 타입 문법입니다.

| JSDoc | TypeScript로 쓰면 |
|---|---|
| `@param {number} price` | `price: number` |
| `@param {string} [memo]` | `memo?: string` (선택 매개변수) |
| `@returns {Promise<Order>}` | `: Promise<Order>` |
| `@type {Member[]}` (변수 위) | `const x: Member[]` |
| `@typedef {object} CartItem` + `@property` | `interface CartItem { ... }` |
| `@type {import('./members.js').Member}` | `import type { Member } from './members.js'` |
| `@type {'READY' \| 'PAID'}` | `'READY' \| 'PAID'` |

::: tip JSDoc만으로 끝내는 프로젝트도 있습니다
빌드 단계를 추가하기 어려운 환경(브라우저에서 바로 도는 오래된 스크립트 등)에서는 `.js` + `// @ts-check` + JSDoc만으로도 대부분의 타입 혜택을 받을 수 있습니다. 실제로 그렇게 운영하는 오픈소스 프로젝트도 있습니다. 다만 문법이 길어지므로, 빌드가 가능하다면 `.ts`로 옮기는 것이 읽기 쉽습니다.
:::

### 6단계: 파일 하나씩 .ts로 — 잎부터

이제 잎 모듈 `format.js`를 `format.ts`로 바꿉니다. JSDoc 타입을 TypeScript 문법으로 옮기고 `// @ts-check`는 지웁니다(`.ts`는 원래 검사됨).

```powershell
# Git 저장소라면 git mv로 이름을 바꿔야 변경 이력이 이어집니다
git mv src/format.js src/format.ts
```

```ts
// src/format.ts
// 금액을 "15,500원" 형태로
export function won(amount: number): string {
  return amount.toLocaleString('ko-KR') + '원'
}
```

**`cart.js`의 `import { won } from './format.js'`는 고치지 않아도 됩니다.** [03 레슨](./03-module-systems)에서 본 대로 TypeScript는 `./format.js`를 보고 `format.ts`를 찾아 주고, 빌드 결과도 `dist/format.js`라서 실행 시점에도 맞습니다. 파일을 하나씩 옮겨도 import 문을 건드릴 필요가 없다는 것이 `nodenext` + `.js` 확장자 방식의 큰 장점입니다.

::: warning 이름 바꾸기와 내용 고치기는 커밋을 나눕니다
`git mv`만 한 커밋과, 타입을 붙인 커밋을 나누면 리뷰어가 "이름만 바뀐 것"과 "실제로 바뀐 코드"를 쉽게 구분할 수 있습니다.
:::

### 7단계: 외부 패키지의 타입 — @types

다음 잎 `members.js`를 `members.ts`로 옮기며 회원 타입을 정의합니다.

```ts
// src/members.ts
import groupBy from 'lodash/groupBy.js'

export interface Member {
  id: string
  name: string
  grade: 'VIP' | 'GOLD' | 'SILVER'
}

export function groupByGrade(members: Member[]) {
  return groupBy(members, 'grade')
}

export function findMember(members: Member[], id: string): Member | undefined {
  return members.find((m) => m.id === id)
}
```

```text
src/members.ts(1,21): error TS7016: Could not find a declaration file for module 'lodash/groupBy.js'. '.../node_modules/lodash/groupBy.js' implicitly has an 'any' type.
  Try `npm i --save-dev @types/lodash` if it exists or add a new declaration (.d.ts) file containing `declare module 'lodash/groupBy.js';`
```

lodash는 JS로만 만들어져 타입 정보(`.d.ts`)가 없습니다. 이런 패키지의 타입은 **DefinitelyTyped**라는 커뮤니티 저장소에서 `@types/패키지이름`으로 따로 배포됩니다. 에러 메시지가 알려 준 대로 설치합니다.

```powershell
npm install -D @types/lodash
```

작성 시점 버전은 `@types/lodash` 4.17.27입니다. 설치하면 TS7016이 사라집니다.

패키지에 타입이 있는지 확인하는 방법:

1. 패키지 자체에 타입이 들어 있음 — npm 사이트에서 패키지 이름 옆에 **TS** 아이콘. 요즘 패키지(zod, axios, dayjs 등)는 대부분 여기에 해당하며 `@types`가 필요 없습니다.
2. `@types`로 따로 있음 — npm 사이트에서 **DT** 아이콘. `npm install -D @types/이름`.
3. 둘 다 없음 — 직접 선언 파일을 씁니다.

```ts
// src/types/legacy-pos-sdk.d.ts
// 사내 레거시 SDK — 타입이 없어 쓰는 부분만 직접 선언
declare module 'legacy-pos-sdk' {
  export function printReceipt(lines: string[]): Promise<void>
}
```

선언 파일 작성법은 [선언 파일](../part5-advanced/08-declaration-files) 레슨에서 자세히 다룹니다. 급하면 `declare module 'legacy-pos-sdk'` 한 줄만 써서 "일단 `any`로 받기"도 가능하지만, 그만큼 검사가 빠진다는 점을 기억하세요.

::: warning @types 버전 맞추기
`@types/node`는 실행하는 Node 버전에, `@types/lodash` 같은 것은 설치한 라이브러리의 **주(major)·부(minor) 버전**에 맞춥니다. 버전이 어긋나면 실제로는 있는 함수가 없다고 나오거나, 그 반대가 됩니다. `@types` 패키지는 타입만 담고 있으므로 `-D`(개발 의존성)로 설치합니다.
:::

### 8단계: 뿌리까지 — 그리고 두 번째 버그

`members.ts`가 `Member` 타입을 내보내자, 아직 JS인 `index.js`(`// @ts-check` 상태)에서 새 에러가 나왔습니다.

```text
src/index.js(15,38): error TS2345: Argument of type '{ id: string; name: string; grade: string; }[]' is not assignable to parameter of type 'Member[]'.
  ...
      Type 'string' is not assignable to type '"VIP" | "GOLD" | "SILVER"'.
src/index.js(16,13): error TS2532: Object is possibly 'undefined'.
```

첫 번째 에러는 배열을 만들 때 `grade`가 그냥 `string`으로 추론되었기 때문입니다. JS에서는 JSDoc으로 타입을 알려 줍니다.

```js
/** @type {import('./members.js').Member[]} */
const members = [
  { id: 'M001', name: '김민지', grade: 'VIP' },
  { id: 'M002', name: '박서준', grade: 'GOLD' },
]
```

두 번째 `Object is possibly 'undefined'`(TS2532)가 **숨어 있던 두 번째 버그**입니다. `findMember`의 반환 타입을 `Member | undefined`로 정직하게 적은 덕분에, 쓰는 쪽에서 "없을 수도 있다"를 처리하라고 알려 줍니다.

마지막으로 뿌리 `index.js`도 `index.ts`로 옮깁니다.

```ts
// src/index.ts
import { cartSummary } from './cart.js'
import { groupByGrade, findMember, type Member } from './members.js'

const items = [
  { name: '아메리카노', price: 4500, qty: 2 },
  { name: '치즈케이크', price: 6500, qty: 1 },
]
console.log(cartSummary(items))

const members: Member[] = [
  { id: 'M001', name: '김민지', grade: 'VIP' },
  { id: 'M002', name: '박서준', grade: 'GOLD' },
]
console.log(Object.keys(groupByGrade(members)))
console.log(findMember(members, 'M999')?.name ?? '회원 없음')
```

```powershell
npx tsc
node dist/index.js
```

```text
2개 상품, 합계 15,500원
[ 'VIP', 'GOLD' ]
회원 없음
```

`cart.js`는 아직 JS(JSDoc + `// @ts-check`)이지만 **문제없이 함께 동작합니다.** 같은 방식으로 `cart.ts`까지 옮기고 모든 `.js`가 사라지면 `allowJs`를 지웁니다. 이것으로 마이그레이션이 끝납니다.

전체 흐름을 정리하면:

```text
① TS 설치 + allowJs (아무것도 안 바꾸고 빌드 통과) → 커밋·배포
② tsc --checkJs 로 할 일 규모 파악
③ 잎 파일부터: // @ts-check + JSDoc → 버그 수정 → 커밋
④ 잎 파일부터: .js → .ts (git mv 커밋 / 타입 커밋 분리)
⑤ @types 설치, 없으면 .d.ts 작성
⑥ 뿌리까지 반복
⑦ .js가 없어지면 allowJs 제거, 필요하면 추가 엄격 옵션 켜기
```

### 9단계: any 줄여 나가기

옮기는 도중에는 급한 대로 `any`를 쓰게 됩니다. 문제는 `any`가 **그대로 굳어 버리는 것**입니다. 다음 순서로 줄여 나갑니다.

1. **새 `any`를 막습니다.** ESLint의 `@typescript-eslint/no-explicit-any`를 `warn`으로 켜고([04 레슨](./04-eslint-prettier)), 새 코드에서는 에러로 다룹니다.
2. **`any` 대신 `unknown`을 씁니다.** 모르는 값은 `unknown`으로 받고 좁혀서 쓰면 검사가 살아 있습니다.
3. **개수를 셉니다.** 주기적으로 세어 줄어드는지 확인합니다.

```powershell
# PowerShell: src 아래 ': any' 개수 세기
(Get-ChildItem src -Recurse -Include *.ts, *.js | Select-String -Pattern ': any\b').Count
```

```bash
# macOS·Linux
grep -rE ': any\b' src | wc -l
```

(위 명령은 `: any` 표기만 셉니다. `as any`, 암시적 any까지 보려면 ESLint의 `no-explicit-any`·`no-unsafe-*` 경고 수를 세는 편이 정확합니다.)

4. **경계부터 타입을 붙입니다.** API 응답, `JSON.parse`, `localStorage` 같은 **바깥에서 들어오는 데이터**의 타입을 먼저 정하면(zod 등으로 검증), 안쪽 코드의 `any`가 저절로 사라집니다.

### 10단계: @ts-expect-error vs @ts-ignore

어쩔 수 없이 특정 줄의 타입 에러를 잠시 꺼야 할 때가 있습니다. 주석 두 가지가 있습니다.

| 주석 | 다음 줄에 에러가 있으면 | 다음 줄에 에러가 **없으면** |
|---|---|---|
| `// @ts-ignore` | 에러를 숨김 | 아무 일 없음 |
| `// @ts-expect-error` (3.9+) | 에러를 숨김 | **에러: "쓸모없는 주석"(TS2578)** |

실제로 확인해 봅시다. `won`은 숫자를 받는 함수입니다.

```ts
import { won } from './format.js'

// @ts-ignore
won('15500') // 에러 숨김

// @ts-expect-error 레거시 POS가 문자열 금액을 보냄 (이슈 #321)
won('15500') // 에러 숨김

// @ts-ignore
won(15500) // 에러 없음 — 주석이 조용히 남음

// @ts-expect-error 이미 고쳐졌는데 주석이 남음
won(15500)
// ❌ Unused '@ts-expect-error' directive. (TS2578)
```

**`@ts-expect-error`를 쓰세요.** 나중에 원인이 고쳐지면 "이 주석은 이제 필요 없다"고 알려 주어 주석이 남아 썩지 않습니다. `@ts-ignore`는 원인이 사라진 뒤에도 남아서, 그 줄에 **새로 생긴 진짜 에러**까지 숨겨 버립니다. 그리고 어느 쪽이든 **이유와 이슈 번호를 같은 줄에** 적습니다.

파일 전체 검사를 잠시 끄는 `// @ts-nocheck`도 있습니다. `checkJs: true`로 전환한 뒤, 아직 손대지 못한 JS 파일 맨 위에 붙여 두는 용도로만 씁니다.

## 자주 하는 실수

### 실수 1: 모든 파일을 한 번에 .ts로 바꾸기

```powershell
# src 아래 .js를 전부 .ts로 이름 변경
Get-ChildItem src -Recurse -Filter *.js | Rename-Item -NewName { $_.Name -replace '\.js$', '.ts' }
```

왜 틀렸나: 에러가 수백·수천 개 쏟아지고, 다 고칠 때까지 빌드가 깨진 상태로 남습니다. 결국 `any`와 `@ts-ignore`로 덮게 되어 타입의 의미가 사라집니다.

고친 방법: `allowJs`로 JS와 TS를 섞어 두고, 잎 파일부터 하나씩 옮깁니다. 파일 하나를 옮길 때마다 빌드가 통과하는 상태로 커밋합니다.

### 실수 2: 뿌리(진입점)부터 옮기기

```text
index.ts (먼저 옮김) ──▶ cart.js, members.js (아직 타입 없음)
```

왜 틀렸나: `index.ts`가 import 하는 것들이 타입이 없어 `any`로 들어옵니다. 고생해서 옮겨도 잡아 주는 것이 거의 없습니다.

고친 방법: 의존 관계 그래프를 그리고 **잎(format, members) → 중간(cart) → 뿌리(index)** 순서로 옮깁니다.

### 실수 3: @ts-ignore로 덮어 두기

```ts
// @ts-ignore
const member = findMember(members, id).name
```

왜 틀렸나: 회원이 없을 때 터지는 진짜 버그를 숨겼습니다. 나중에 `findMember`의 타입이 바뀌어 다른 에러가 생겨도 이 주석이 계속 숨깁니다.

고친 코드:

```ts
const member = findMember(members, id)?.name ?? '회원 없음'
```

정말 지금 고칠 수 없다면 `// @ts-expect-error 이유 (이슈 번호)`로 씁니다.

### 실수 4: import 경로를 .ts로 바꾸기

```ts
// cart.js를 cart.ts로 옮기면서 import도 바꿈
import { won } from './format.ts'
// ❌ An import path can only end with a '.ts' extension when 'allowImportingTsExtensions' is enabled. (TS5097)
```

왜 틀렸나: `tsc`로 빌드해 `node dist/...`로 실행하는 프로젝트에서는 결과 파일이 `.js`입니다. import 문은 `.js` 그대로 두는 것이 맞습니다.

고친 코드:

```ts
import { won } from './format.js'
```

### 실수 5: @types를 dependencies에 넣거나 버전을 안 맞추기

```powershell
npm install @types/lodash   # -D 빠짐
```

왜 틀렸나: `@types`는 타입 검사 때만 필요하므로 운영 설치에 포함될 이유가 없습니다. 또 라이브러리 버전과 크게 다른 `@types`를 쓰면 실제 API와 타입이 어긋납니다.

고친 코드:

```powershell
npm install -D @types/lodash
```

## 직접 해 보기

### 문제 1 ⭐ 순서 정하기

다음 의존 관계를 보고 TypeScript로 옮길 순서를 정하세요.

```text
app.js ──▶ order-service.js ──▶ price.js
   │              └──────────▶ api-client.js ──▶ axios (타입 포함)
   └─────▶ logger.js
```

::: details 정답 보기
잎부터: `price.js`, `api-client.js`, `logger.js`(셋은 순서 무관) → `order-service.js` → `app.js`.

`api-client.js`는 외부 패키지(axios)만 import 하므로 잎입니다. axios는 패키지 자체에 타입이 들어 있어 `@types`가 필요 없습니다. 이 중에서도 API 응답 타입을 정의하는 `api-client`를 먼저 옮기면 효과가 큽니다.
:::

### 문제 2 ⭐ JSDoc으로 타입 붙이기

`.js` 파일을 그대로 두고 `// @ts-check`와 JSDoc으로 타입을 붙이세요. `rate`는 선택 매개변수이고 기본값은 0.01입니다.

```js
export function earnPoint(paidAmount, rate = 0.01) {
  return Math.floor(paidAmount * rate)
}
```

::: details 정답 보기
```js
// @ts-check

/**
 * 결제 금액에 따른 적립 포인트
 * @param {number} paidAmount 결제 금액(원)
 * @param {number} [rate] 적립률 (기본 0.01)
 * @returns {number}
 */
export function earnPoint(paidAmount, rate = 0.01) {
  return Math.floor(paidAmount * rate)
}

console.log(earnPoint(15500))
// 출력: 155
```

기본값이 있는 매개변수는 JSDoc에서 `[rate]`처럼 대괄호로 선택 매개변수임을 표시합니다.
:::

### 문제 3 ⭐⭐ JSDoc을 TypeScript로

다음 `order.js`를 `order.ts`로 옮기세요. `@typedef`는 `interface`로 바꿉니다.

```js
// @ts-check

/**
 * @typedef {object} Order
 * @property {string} id
 * @property {'READY' | 'PAID' | 'CANCELED'} status
 * @property {number} total
 * @property {string} [memo]
 */

/**
 * @param {Order[]} orders
 * @returns {Order[]}
 */
export function paidOrders(orders) {
  return orders.filter((o) => o.status === 'PAID')
}
```

::: details 정답 보기
```ts
// order.ts
export interface Order {
  id: string
  status: 'READY' | 'PAID' | 'CANCELED'
  total: number
  memo?: string
}

export function paidOrders(orders: Order[]): Order[] {
  return orders.filter((o) => o.status === 'PAID')
}
```

이 파일을 import 하던 다른 파일의 `import { paidOrders } from './order.js'`는 그대로 둡니다. JS 파일에서 `Order` 타입이 필요하면 `/** @type {import('./order.js').Order} */`로 가져다 씁니다.
:::

### 문제 4 ⭐⭐ 주석 고르기

다음 두 상황에서 `@ts-expect-error`와 `@ts-ignore` 중 무엇을 쓰고, 어떻게 적을까요?

1. 외부 라이브러리의 타입 정의가 잘못되어 정상 코드에 에러가 남(라이브러리에 이슈 등록함, 다음 버전에서 고쳐질 예정)
2. 테스트에서 일부러 잘못된 인수를 넘겨 에러 처리를 확인함

::: details 정답 보기
둘 다 `@ts-expect-error`입니다.

```ts
// 1) 고쳐지면 TS2578이 알려 주므로 주석 제거 시점을 놓치지 않음
// @ts-expect-error 라이브러리 타입 오류, 다음 버전에서 수정 예정 (upstream 이슈 #1234)
chart.setOption({ animation: 'fast' })

// 2) "여기서 타입 에러가 나야 한다"는 의도 자체를 표현
// @ts-expect-error 문자열 금액이 들어오면 RangeError를 던지는지 확인
expect(() => applyCoupon('10000', 0.1, 5000)).toThrow()
```

`@ts-ignore`는 원인이 사라져도 알려 주지 않으므로 거의 쓸 일이 없습니다.
:::

### 문제 5 ⭐⭐⭐ 직접 마이그레이션

다음 JS 프로젝트를 이 레슨의 순서대로 TypeScript로 옮기세요. ① `tsconfig.json`(allowJs) ② 옮기는 순서 ③ 최종 `.ts` 코드 ④ 옮기면서 발견되는 버그를 쓰세요.

```js
// src/stock.js
export function decrease(stock, productId, qty) {
  const current = stock[productId]
  return { ...stock, [productId]: current - qty }
}
```

```js
// src/main.js
import { decrease } from './stock.js'

const stock = { P001: 30, P002: 5 }
console.log(decrease(stock, 'P003', 1))
```

::: details 정답 보기
① 설정

```json
{
  "compilerOptions": {
    "target": "es2023",
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "types": ["node"],
    "rootDir": "src",
    "outDir": "dist",
    "allowJs": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

② 순서: 잎인 `stock.js` → 뿌리인 `main.js`.

③ 최종 코드

```ts
// src/stock.ts
export type Stock = Record<string, number>

export function decrease(stock: Stock, productId: string, qty: number): Stock {
  const current = stock[productId]
  if (current === undefined) {
    throw new Error(`재고에 없는 상품입니다: ${productId}`)
  }
  if (current < qty) {
    throw new Error(`재고 부족: ${productId} (남은 수량 ${current})`)
  }
  return { ...stock, [productId]: current - qty }
}
```

```ts
// src/main.ts
import { decrease, type Stock } from './stock.js'

const stock: Stock = { P001: 30, P002: 5 }
console.log(decrease(stock, 'P001', 1))
// 출력: { P001: 29, P002: 5 }
```

④ 발견되는 버그: 원래 코드는 없는 상품(`P003`)을 넣으면 `undefined - 1`이 되어 `{ P001: 30, P002: 5, P003: NaN }`을 돌려줬습니다. `noUncheckedIndexedAccess`를 켜면 `current`가 `number | undefined`가 되어 `current - qty`에서 `'current' is possibly 'undefined'.`(TS18048) 에러로 드러납니다. 재고가 음수가 되는 경우도 함께 막았습니다.
:::

## 확인 퀴즈

1. `allowJs`와 `checkJs`는 각각 무엇을 할까요?
2. `checkJs`를 켜지 않고 JS 파일 하나만 검사하려면?
3. 마이그레이션을 잎 모듈부터 하는 이유를 두 가지 말해 보세요.
4. `@ts-expect-error`가 `@ts-ignore`보다 나은 이유는?
5. TS7016(`Could not find a declaration file for module`)이 나오면 무엇부터 확인할까요?

::: details 정답 보기
1. `allowJs`는 `.js` 파일을 프로젝트에 포함해 함께 빌드하고 TS와 서로 import 하게 합니다. `checkJs`는 그 `.js` 파일들까지 타입 검사합니다.
2. 그 파일 맨 위에 `// @ts-check`를 넣습니다.
3. 잎에 붙인 타입이 그것을 import 하는 모든 파일에 혜택을 주고, 다른 파일에 기대지 않아 옮길 때 영향이 작기 때문입니다.
4. 다음 줄에 에러가 없어지면 TS2578로 알려 주어, 필요 없어진 주석이 남아 다른 진짜 에러까지 숨기는 일을 막기 때문입니다.
5. `@types/패키지이름`이 있는지 확인해 `-D`로 설치합니다. 없으면 `.d.ts`에 `declare module`로 직접 선언합니다.
:::

## 정리

- 마이그레이션의 원칙은 "어느 순간에도 프로그램이 돌아간다"입니다. 한 번에 바꾸지 않고 파일 하나씩 옮깁니다.
- `allowJs`로 JS와 TS를 섞고, `// @ts-check` + JSDoc으로 `.js` 그대로 검사를 시작할 수 있습니다.
- **잎 모듈부터** 뿌리 방향으로 옮깁니다. `nodenext`에서는 import 경로(`.js`)를 고치지 않아도 됩니다.
- 타입 없는 패키지는 `@types/이름`을 `-D`로 설치하고, 없으면 `.d.ts`로 선언합니다.
- `any`는 새로 생기지 않게 막고, `unknown`과 경계 검증으로 줄여 나갑니다.
- 타입 에러를 잠시 꺼야 하면 `@ts-ignore` 대신 `@ts-expect-error`와 이유·이슈 번호를 씁니다.
- 실습에서는 옮기는 과정에서 숨은 버그 두 개(문자열 수량, 없는 회원 접근)가 저절로 드러났습니다.

## 다음 단계

Part 6을 마쳤습니다. 이제 tsconfig·린트·테스트·빌드를 갖춘 프로젝트를 처음부터 만들 수 있습니다. 다음 파트에서는 이 도구들 위에서 실제 프레임워크 코드를 작성합니다. [Node.js + Express REST API를 TS로](../part7-practice/01-node-express)에서 시작합니다.
