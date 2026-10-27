---
title: 단계별 자가 진단 테스트
---

# 단계별 자가 진단 테스트

<LessonMeta level="마스터" :minutes="90" prev="큰 프로젝트의 타입 검사 성능과 프로젝트 참조를 배웠습니다" />

## 이번에 배울 것

- Part 0부터 Part 8까지 파트별 문제를 풀어 **내 실력의 빈 곳**을 찾을 수 있다.
- 객관식 · 코드 읽기 · 코드 쓰기 세 가지 유형으로 "아는 것"과 "쓸 수 있는 것"을 구분할 수 있다.
- 점수에 따라 다시 볼 레슨을 골라 복습 계획을 세울 수 있다.

## 먼저 알아 둘 것

- Part 0~8을 한 번 끝까지 공부했다면 충분합니다. 아직이라도 **끝낸 파트까지만** 풀어도 됩니다.
- 코드 문제는 TypeScript 5.6, `strict: true` 기준이며, 모두 `tsc`로 실제 결과를 확인했습니다.

## 비유로 이해하기

건강 검진을 받으면 "전체적으로 건강합니다" 한마디보다 **항목별 수치**가 더 쓸모 있습니다. 혈압은 정상인데 콜레스테롤이 높다면, 운동이 아니라 식단을 바꿔야 한다는 것을 알 수 있기 때문입니다.

이 테스트도 같습니다. 총점보다 **파트별 점수**를 보세요. 낮은 파트가 바로 다시 공부할 곳입니다.

## 개념 설명

### 푸는 방법

1. **파트마다 시간을 정하고 풉니다.** 한 파트에 10분 안팎이면 적당합니다.
2. **답을 먼저 종이나 메모장에 적고** 나서 접기 블록을 엽니다. 머릿속으로만 답하면 실제보다 점수가 높게 나옵니다.
3. 코드 쓰기 문제는 **직접 에디터에 입력해** `tsc`로 검사해 봅니다. 모범 답안과 달라도 요구 사항을 만족하고 에러가 없으면 정답입니다.
4. 문제마다 1점입니다. 파트별 점수를 아래 [점수 기준](#scoring)에 기록합니다.

### 문제 유형

| 유형 | 표시 | 확인하는 것 |
|---|---|---|
| 객관식 | 📝 | 개념을 정확히 알고 있는가 |
| 코드 읽기 | 🔍 | 코드를 보고 결과·타입·에러를 예측할 수 있는가 |
| 코드 쓰기 | ✍️ | 요구 사항을 타입 안전한 코드로 옮길 수 있는가 |

---

### Part 0. 시작하기

**0-1** 📝 TypeScript 코드가 실행되기까지의 순서로 옳은 것은?

① `.ts` 파일을 브라우저가 바로 실행한다
② `.ts` → (tsc) → `.js` → Node.js·브라우저가 실행
③ `.js` → (tsc) → `.ts` → Node.js가 실행
④ `.ts` → Node.js가 타입을 검사하며 실행

::: details 정답 보기
**②** TypeScript는 JavaScript로 컴파일(변환)된 뒤 실행됩니다. 타입 검사는 컴파일할 때 일어나고, 실행 중에는 타입 정보가 없습니다. → [첫 프로그램](../part0-start/05-first-program)
:::

**0-2** 📝 다음 중 TypeScript를 쓰는 이유로 가장 거리가 먼 것은?

① 오타·잘못된 속성 접근을 실행 전에 발견한다
② 에디터 자동 완성이 정확해진다
③ 실행 속도가 JavaScript보다 빨라진다
④ 함수가 무엇을 받고 돌려주는지 코드에 문서처럼 남는다

::: details 정답 보기
**③** 타입은 컴파일할 때 지워지므로 실행 속도에는 영향이 없습니다. → [왜 TypeScript인가](../part0-start/02-why-typescript)
:::

**0-3** 🔍 다음 에러 메시지에서 ① 파일 ② 줄 번호 ③ 에러 코드를 찾아 보세요.

```text
src/cart.ts(8,13): error TS2339: Property 'qty' does not exist on type 'CartItem'.
```

::: details 정답 보기
① `src/cart.ts` ② 8번째 줄(13번째 칸) ③ `TS2339` → [에러 메시지 읽는 법](../part0-start/06-how-to-read-errors)
:::

**0-4** 📝 `npx tsc hello.ts`를 실행한 직후 폴더에 새로 생기는 파일은?

::: details 정답 보기
`hello.js`. 컴파일 결과 JavaScript 파일이 생기며, `node hello.js`로 실행합니다. → [첫 프로그램](../part0-start/05-first-program)
:::

**0-5** 📝 설치 없이 웹 브라우저에서 TypeScript 코드를 바로 실행하고 변환 결과(JS)를 볼 수 있는 공식 도구의 이름은?

::: details 정답 보기
**TS Playground**(typescriptlang.org/play). → [TS Playground](../part0-start/04-playground)
:::

**0-6** 📝 컴파일 에러가 있어도 `tsc`는 기본 설정에서 `.js` 파일을 만들까요?

::: details 정답 보기
**만듭니다.** 기본값 `noEmitOnError: false`이므로 에러가 있어도 JS를 출력합니다. 에러가 있을 때 출력을 막으려면 `noEmitOnError: true`를 켭니다. 그래서 "JS가 생겼으니 문제없다"고 판단하면 안 됩니다. → [첫 프로그램](../part0-start/05-first-program), [tsconfig.json 완전 정복](../part6-tooling/01-tsconfig)
:::

---

### Part 1. 프로그래밍 기초

**1-1** 🔍 출력 결과는?

```ts
const prices = [4500, 5000, 3000]
const total = prices.filter((p) => p >= 4000).reduce((sum, p) => sum + p, 0)
console.log(total)
```

::: details 정답 보기
`9500`. `filter`로 4000 이상(4500, 5000)만 남기고 `reduce`로 더합니다. → [배열과 배열 메서드](../part1-basics/07-arrays)
:::

**1-2** 🔍 출력 결과는?

```ts
let count = 0
function makeCounter() {
  let count = 10
  return () => ++count
}
const next = makeCounter()
next()
console.log(next(), count)
```

::: details 정답 보기
`12 0`. 반환된 화살표 함수는 `makeCounter` 안의 `count`(10)를 **기억합니다**(클로저). 두 번 호출해 12가 되고, 바깥 `count`는 그대로 0입니다. → [스코프와 클로저](../part1-basics/10-scope-closure)
:::

**1-3** 📝 `const`로 선언한 객체에 대해 옳은 것은?

① 속성 값도 바꿀 수 없다
② 변수에 다른 객체를 다시 대입할 수 없지만, 속성 값은 바꿀 수 있다
③ 아무것도 바꿀 수 없다
④ `let`과 완전히 같다

::: details 정답 보기
**②** `const`는 **변수 재대입**만 막습니다. 속성까지 막으려면 `readonly`나 `Object.freeze`가 필요합니다. → [값과 변수](../part1-basics/01-values-and-variables)
:::

**1-4** 🔍 출력 결과는?

```ts
const member = { name: '김민지', grade: 'VIP', point: 1200 }
const { name, ...rest } = member
console.log(name, rest)
```

::: details 정답 보기
`김민지 { grade: 'VIP', point: 1200 }`. 나머지 패턴(`...rest`)은 꺼내지 않은 속성을 새 객체로 모읍니다. → [객체](../part1-basics/08-objects)
:::

**1-5** 🔍 출력 결과는?

```ts
function divide(a: number, b: number): number {
  if (b === 0) throw new Error('0으로 나눌 수 없습니다')
  return a / b
}
try {
  console.log(divide(10, 0))
} catch (e) {
  console.log(e instanceof Error ? e.message : e)
} finally {
  console.log('끝')
}
```

::: details 정답 보기

```text
0으로 나눌 수 없습니다
끝
```

`finally`는 에러 여부와 관계없이 항상 실행됩니다. → [오류 처리](../part1-basics/11-errors)
:::

**1-6** ✍️ 상품 배열을 받아 **재고(`stock`)가 0보다 큰 상품의 이름만** 배열로 돌려주는 함수 `availableNames`를 작성하세요.

```ts
const products = [
  { name: '아메리카노', stock: 30 },
  { name: '카페라테', stock: 0 },
  { name: '녹차', stock: 5 },
]
```

::: details 정답 보기

```ts
interface Product {
  name: string
  stock: number
}
function availableNames(products: Product[]): string[] {
  return products.filter((p) => p.stock > 0).map((p) => p.name)
}
const products = [
  { name: '아메리카노', stock: 30 },
  { name: '카페라테', stock: 0 },
  { name: '녹차', stock: 5 },
]
console.log(availableNames(products))
// 출력: [ '아메리카노', '녹차' ]
```

→ [배열과 배열 메서드](../part1-basics/07-arrays), [함수 기초](../part1-basics/06-functions)
:::

**1-7** 🔍 출력 결과는?

```ts
const qty = 0
console.log(qty || 1, qty ?? 1)
```

::: details 정답 보기
`1 0`. `||`는 `0`·`''` 같은 **falsy 값**이면 오른쪽을, `??`는 **`null`·`undefined`일 때만** 오른쪽을 씁니다. 수량 0은 정상 값이므로 `??`가 맞습니다. → [연산자와 표현식](../part1-basics/03-operators)
:::

---

### Part 2. 타입 시스템 기초

**2-1** 🔍 각 변수의 추론 타입은?

```ts
let a = '서울'
const b = '서울'
const c = { city: '서울' }
```

::: details 정답 보기
`a: string`, `b: "서울"`, `c: { city: string }`. `const` 원시값은 리터럴 타입, `let`과 객체 속성은 넓혀집니다. → [타입 표기와 타입 추론](../part2-types/01-annotation-inference)
:::

**2-2** 📝 `unknown`과 `any`의 차이로 옳은 것은?

① 둘 다 아무 검사 없이 속성에 접근할 수 있다
② `unknown`은 좁히기 전에는 속성 접근·호출을 할 수 없다
③ `any`는 아무 값도 넣을 수 없다
④ `unknown`은 `null`을 넣을 수 없다

::: details 정답 보기
**②** `unknown`은 "모르니까 확인하고 써라", `any`는 "검사하지 마라"입니다. → [특수 타입](../part2-types/02-special-types)
:::

**2-3** 🔍 다음 코드에서 에러가 나는 줄은?

```ts
type Grade = 'VIP' | 'GOLD' | 'BASIC'
let g: Grade = 'VIP'       // A
g = 'GOLD'                 // B
const input: string = 'VIP'
g = input                  // C
```

::: details 정답 보기
**C**. `string`은 `Grade`보다 넓은 집합이라 넣을 수 없습니다(`Type 'string' is not assignable to type 'Grade'.`, TS2322). → [유니온 타입과 리터럴 타입](../part2-types/06-union-literal)
:::

**2-4** 📝 튜플 `[string, number]`에 대한 설명으로 옳은 것은?

① 문자열과 숫자를 순서 상관없이 몇 개든 담는다
② 첫 칸은 `string`, 둘째 칸은 `number`인 길이 2의 배열이다
③ 객체의 한 종류다
④ `(string | number)[]`와 완전히 같다

::: details 정답 보기
**②** → [배열 타입과 튜플](../part2-types/03-arrays-tuples)
:::

**2-5** ✍️ `string | number`인 `id`를 받아, 숫자면 `P` + 4자리(앞을 0으로 채움), 문자열이면 그대로 돌려주는 `toProductId`를 작성하세요. 예: `7` → `'P0007'`.

::: details 정답 보기

```ts
function toProductId(id: string | number): string {
  if (typeof id === 'number') {
    return 'P' + String(id).padStart(4, '0')
  }
  return id
}
console.log(toProductId(7), toProductId('P0123'))
// 출력: P0007 P0123
```

`typeof`로 좁히면 각 분기 안에서 `id`의 타입이 하나로 정해집니다. → [타입 좁히기](../part2-types/08-narrowing)
:::

**2-6** 🔍 다음 함수에 대해 옳은 것은?

```ts
function getLength(text?: string): number {
  return text!.length
}
```

① 항상 안전하다
② `getLength()`처럼 인수 없이 부르면 실행 중 `TypeError`가 난다
③ 컴파일 에러가 난다
④ `text`가 없으면 0을 돌려준다

::: details 정답 보기
**②** `!`는 컴파일러만 조용히 시킬 뿐 확인하지 않습니다. `text?.length ?? 0`이 안전합니다. → [타입 단언과 non-null 단언](../part2-types/10-assertion)
:::

**2-7** 📝 `interface`와 `type`의 차이로 옳은 것은?

① `type`으로는 객체 타입을 만들 수 없다
② `interface`는 같은 이름으로 다시 선언하면 합쳐진다(선언 병합)
③ `interface`로 유니온 타입을 직접 만들 수 있다
④ 둘은 기능이 완전히 같다

::: details 정답 보기
**②** 유니온·튜플 같은 타입은 `type`으로만 만들 수 있고, 선언 병합은 `interface`만 됩니다. → [타입 별칭과 인터페이스](../part2-types/07-type-alias-interface)
:::

---

### Part 3. 타입 시스템 중급

**3-1** 🔍 다음 코드는 컴파일될까요?

```ts
interface Point {
  x: number
  y: number
}
const p3 = { x: 1, y: 2, z: 3 }
const p: Point = p3
```

::: details 정답 보기
**됩니다.** 구조적 타이핑에서는 필요한 속성(`x`, `y`)만 있으면 됩니다. 단, `const p: Point = { x: 1, y: 2, z: 3 }`처럼 **객체 리터럴을 바로** 넣으면 초과 속성 검사로 에러(TS2353)가 납니다. → [구조적 타이핑](../part3-intermediate/02-structural-typing)
:::

**3-2** ✍️ 배열의 마지막 요소를 돌려주는 제네릭 함수 `last`를 작성하세요. 빈 배열이면 `undefined`입니다.

::: details 정답 보기

```ts
function last<T>(items: T[]): T | undefined {
  return items[items.length - 1]
}
const n = last([1, 2, 3]) // number | undefined
const s = last(['P001', 'P002']) // string | undefined
console.log(n, s)
// 출력: 3 P002
```

→ [제네릭 기초](../part3-intermediate/04-generics-basics)
:::

**3-3** 🔍 `ProductKey`의 타입은?

```ts
const product = { id: 'P001', name: '아메리카노', price: 4500 }
type ProductKey = keyof typeof product
```

::: details 정답 보기
`"id" | "name" | "price"`. `typeof`로 값에서 타입을 얻고, `keyof`로 키 유니온을 얻습니다. → [keyof · typeof · 인덱스 접근 타입](../part3-intermediate/06-keyof-typeof-indexed)
:::

**3-4** 📝 `Omit<Member, 'password'>`가 하는 일은?

::: details 정답 보기
`Member`에서 `password` 속성만 **뺀** 새 객체 타입을 만듭니다. 응답용 타입 등에 씁니다. → [내장 유틸리티 타입 총정리](../part3-intermediate/07-utility-types)
:::

**3-5** ✍️ 아래 `Shape`를 받아 넓이를 돌려주는 `area` 함수를 작성하고, 새 도형이 추가되면 컴파일 에러가 나도록 완전성 검사를 넣으세요.

```ts
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'rect'; width: number; height: number }
```

::: details 정답 보기

```ts
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'rect'; width: number; height: number }

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2
    case 'rect':
      return shape.width * shape.height
    default: {
      const unreachable: never = shape
      return unreachable
    }
  }
}
console.log(area({ kind: 'rect', width: 3, height: 4 }))
// 출력: 12
```

→ [판별 유니온과 완전성 검사](../part3-intermediate/03-discriminated-union)
:::

**3-6** 🔍 에러가 나는 줄과 이유는?

```ts
function getId<T extends { id: string }>(item: T): string {
  return item.id
}
getId({ id: 'P001', name: '아메리카노' }) // A
getId({ code: 'C001' })                   // B
```

::: details 정답 보기
**B**. `T`는 `{ id: string }`을 만족해야 하는데 `id`가 없습니다. 객체 리터럴을 바로 넘겼으므로 `Object literal may only specify known properties, and 'code' does not exist in type '{ id: string; }'.`(TS2353)가 납니다. A는 `id`가 있으므로 다른 속성이 더 있어도 괜찮습니다. → [제네릭 제약](../part3-intermediate/05-generic-constraints)
:::

**3-7** 📝 `import type { Product } from './types'`의 특징은?

::: details 정답 보기
타입으로만 쓰는 import라 컴파일 결과 JS에서 **완전히 지워집니다**. 불필요한 모듈 로딩과 순환 참조 문제를 줄입니다. → [모듈](../part3-intermediate/09-modules)
:::

---

### Part 4. 비동기와 데이터

**4-1** 🔍 출력 순서는?

```ts
console.log('A')
setTimeout(() => console.log('B'), 0)
Promise.resolve().then(() => console.log('C'))
console.log('D')
```

::: details 정답 보기
`A D C B`. 동기 코드(A, D) → 마이크로태스크(Promise, C) → 매크로태스크(setTimeout, B) 순서입니다. → [이벤트 루프](../part4-async/01-event-loop-callback)
:::

**4-2** 📝 `async` 함수가 `return 100`을 하면 호출 결과의 타입은?

::: details 정답 보기
`Promise<number>`. `async` 함수는 항상 Promise를 돌려줍니다. → [async/await](../part4-async/03-async-await)
:::

**4-3** 🔍 두 함수의 총 소요 시간은 대략 얼마일까요? (`wait(ms)`는 ms 후에 끝나는 Promise)

```ts
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

async function sequential() {
  await wait(1000)
  await wait(1000)
}
async function parallel() {
  await Promise.all([wait(1000), wait(1000)])
}
```

::: details 정답 보기
`sequential`은 약 2초, `parallel`은 약 1초입니다. 서로 의존하지 않는 요청은 `Promise.all`로 동시에 기다립니다. → [Promise 완전 이해](../part4-async/02-promise)
:::

**4-4** 📝 `const data = (await res.json()) as Order[]`의 문제점은?

::: details 정답 보기
`as`는 실제 응답을 검사하지 않습니다. 서버가 다른 모양을 보내도 타입은 `Order[]`라고 믿게 되어, 문제가 엉뚱한 곳에서 터집니다. zod 같은 런타임 검증이 필요합니다. → [런타임 검증](../part4-async/05-runtime-validation)
:::

**4-5** 🔍 출력 결과는?

```ts
const order = { id: 'O001', paidAt: new Date('2026-10-26T00:00:00Z') }
const copy = JSON.parse(JSON.stringify(order))
console.log(typeof order.paidAt, typeof copy.paidAt)
```

::: details 정답 보기
`object string`. JSON에는 Date가 없어 문자열로 바뀝니다. 되돌리려면 `new Date(copy.paidAt)`로 변환합니다. → [JSON · Date · Map · Set](../part4-async/06-json-date-map-set)
:::

**4-6** ✍️ 주문 ID 배열을 받아 각 주문 금액을 가져오는 `fetchAmount(id)`(가짜 함수)를 **동시에** 호출하고, 합계를 돌려주는 `totalAmount`를 작성하세요. 하나라도 실패하면 `0`을 돌려줍니다.

::: details 정답 보기

```ts
async function fetchAmount(id: string): Promise<number> {
  if (id === 'BAD') throw new Error('조회 실패')
  return id === 'O001' ? 9000 : 4500
}

async function totalAmount(ids: string[]): Promise<number> {
  try {
    const amounts = await Promise.all(ids.map(fetchAmount))
    return amounts.reduce((sum, a) => sum + a, 0)
  } catch {
    return 0
  }
}

async function main(): Promise<void> {
  console.log(await totalAmount(['O001', 'O002']))
  console.log(await totalAmount(['O001', 'BAD']))
}
main()
// 출력: 13500
// 출력: 0
```

→ [async/await와 비동기 오류 처리](../part4-async/03-async-await)
:::

---

### Part 5. 고급 타입

**5-1** 🔍 `R`의 타입은?

```ts
type IsString<T> = T extends string ? 'yes' : 'no'
type R = IsString<string | number>
```

::: details 정답 보기
`"yes" | "no"`. 타입 매개변수에 유니온이 들어오면 멤버마다 따로 계산해 합칩니다(분배 조건부 타입). → [조건부 타입과 분배 법칙](../part5-advanced/01-conditional-types)
:::

**5-2** ✍️ 함수 타입의 **첫 번째 매개변수 타입**을 꺼내는 `FirstArg<F>`를 `infer`로 만드세요.

::: details 정답 보기

```ts
type FirstArg<F> = F extends (first: infer A, ...rest: any[]) => any ? A : never

type T1 = FirstArg<(id: string, qty: number) => void> // string
const sample: T1 = 'P001'
console.log(sample)
// 출력: P001
```

→ [infer로 타입 꺼내기](../part5-advanced/02-infer)
:::

**5-3** 🔍 `Getters`의 결과 타입은?

```ts
interface Product {
  name: string
  price: number
}
type Getters = {
  [K in keyof Product as `get${Capitalize<K>}`]: () => Product[K]
}
```

::: details 정답 보기
`{ getName: () => string; getPrice: () => number }`. 매핑된 타입의 키 재매핑(`as`)과 템플릿 리터럴 타입을 함께 썼습니다. → [매핑된 타입](../part5-advanced/03-mapped-types), [템플릿 리터럴 타입](../part5-advanced/04-template-literal-types)
:::

**5-4** ✍️ `unknown` 값이 `{ id: string; price: number }` 모양인지 확인하는 **사용자 정의 타입 가드** `isProduct`를 작성하세요.

::: details 정답 보기

```ts
interface Product {
  id: string
  price: number
}
function isProduct(value: unknown): value is Product {
  return (
    typeof value === 'object' && value !== null &&
    'id' in value && typeof value.id === 'string' &&
    'price' in value && typeof value.price === 'number'
  )
}
const data: unknown = JSON.parse('{"id":"P001","price":4500}')
if (isProduct(data)) {
  console.log(data.price)
}
// 출력: 4500
```

→ [사용자 정의 타입 가드 · satisfies](../part5-advanced/06-type-guards-satisfies)
:::

**5-5** 📝 `satisfies`와 타입 표기(`: Type`)의 차이는?

::: details 정답 보기
둘 다 값이 타입에 맞는지 검사하지만, `satisfies`(TS 4.9부터)는 **값의 구체적인 추론 타입을 유지**합니다. 예: `const c = { mode: 'dark' } satisfies Config`이면 `c.mode`는 `"dark"` 리터럴로 남습니다. → [satisfies](../part5-advanced/06-type-guards-satisfies)
:::

**5-6** 📝 함수 매개변수 타입이 반공변(contravariant)이라는 것의 의미를 한 문장으로 설명하세요.

::: details 정답 보기
"더 넓은 타입을 받는 함수는 더 좁은 타입을 받는 함수 자리에 들어갈 수 있다." 예: `(x: string | number) => void`는 `(x: string) => void` 자리에 넣을 수 있지만 반대는 안 됩니다(`strictFunctionTypes`). → [변성](../part5-advanced/07-variance)
:::

**5-7** 📝 타입 정의가 없는 JS 라이브러리 `legacy-pos`를 쓰려고 할 때 먼저 확인할 것과 없을 때의 방법은?

::: details 정답 보기
먼저 `@types/legacy-pos`가 DefinitelyTyped에 있는지 확인해 설치합니다. 없으면 `declare module 'legacy-pos' { ... }` 선언 파일(`.d.ts`)을 만들어 쓰는 부분만 타입을 적습니다. → [선언 파일](../part5-advanced/08-declaration-files)
:::

---

### Part 6. 프로젝트 설정과 도구

**6-1** 📝 `strict: true`가 켜는 옵션이 **아닌** 것은?

① `strictNullChecks` ② `noImplicitAny` ③ `noUncheckedIndexedAccess` ④ `strictFunctionTypes`

::: details 정답 보기
**③** `noUncheckedIndexedAccess`는 strict에 포함되지 않아 따로 켜야 합니다. → [strict 옵션](../part6-tooling/02-strict-options)
:::

**6-2** 📝 Vite 같은 번들러를 쓰는 프론트엔드 프로젝트에 알맞은 `moduleResolution` 값은?

::: details 정답 보기
`"bundler"`(TS 5.0부터). Node.js에서 직접 실행하는 ESM 프로젝트라면 `"nodenext"`가 알맞습니다. → [모듈 시스템](../part6-tooling/03-module-systems)
:::

**6-3** 📝 Vite 프로젝트에서 `vite build`만 실행하면 타입 에러가 있어도 빌드가 성공하는 이유와 대책은?

::: details 정답 보기
Vite(esbuild)는 타입을 **지우기만** 하고 검사하지 않기 때문입니다. 빌드 스크립트에 `tsc --noEmit`(또는 `vue-tsc --noEmit`)을 함께 실행해 타입 검사를 합니다. → [빌드 도구](../part6-tooling/06-build-tools)
:::

**6-4** 📝 ESLint와 Prettier의 역할 차이는?

::: details 정답 보기
ESLint는 **코드 품질 규칙**(잠재적 버그, `any` 사용 등)을 검사하고, Prettier는 **코드 모양**(들여쓰기, 따옴표, 줄바꿈)을 자동으로 맞춥니다. → [ESLint와 Prettier](../part6-tooling/04-eslint-prettier)
:::

**6-5** ✍️ 다음 함수를 테스트하는 Vitest 테스트를 작성하세요. (정상 할인, 0원 이하 방지 두 가지)

```ts
export function applyDiscount(price: number, discount: number): number {
  return Math.max(price - discount, 0)
}
```

::: details 정답 보기

```ts
import { describe, it, expect } from 'vitest'
import { applyDiscount } from './discount'

describe('applyDiscount', () => {
  it('할인 금액만큼 뺀다', () => {
    expect(applyDiscount(10000, 1000)).toBe(9000)
  })
  it('결과가 0보다 작아지지 않는다', () => {
    expect(applyDiscount(1000, 5000)).toBe(0)
  })
})
```

→ [Vitest로 테스트 작성하기](../part6-tooling/05-testing-vitest)
:::

**6-6** 📝 JS 프로젝트를 TS로 옮길 때 권장하는 순서로 알맞은 것은?

① 모든 파일을 한 번에 `.ts`로 바꾸고 strict를 켠다
② `allowJs`로 JS와 TS를 섞어 두고, 의존성이 적은 파일부터 하나씩 `.ts`로 바꾼 뒤 strict를 단계적으로 켠다
③ strict를 끈 채로 영원히 둔다
④ 모든 파일에 `// @ts-nocheck`를 붙인다

::: details 정답 보기
**②** → [마이그레이션](../part6-tooling/07-migration)
:::

---

### Part 7. 실전 프레임워크와 타입 설계

**7-1** ✍️ React에서 `label`(필수 문자열)과 `onClick`(선택, 인수 없는 함수)을 받는 `Button` 컴포넌트의 props 타입을 작성하세요.

::: details 정답 보기

```tsx
interface ButtonProps {
  label: string
  onClick?: () => void
}
function Button({ label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>
}
```

→ [React + TS 기초](../part7-practice/02-react-basics)
:::

**7-2** 🔍 다음 `useState`의 `members` 타입은? 그리고 무엇이 문제일까요?

```ts
// const [members, setMembers] = useState([])
```

::: details 정답 보기
`never[]`로 추론되어 나중에 회원 객체를 넣을 수 없습니다. `useState<Member[]>([])`처럼 타입 인수를 명시합니다. → [React + TS: 훅](../part7-practice/03-react-hooks)
:::

**7-3** 📝 Vue 3 `<script setup lang="ts">`에서 props에 타입을 붙이는 매크로 이름은?

::: details 정답 보기
`defineProps`. 예: `const props = defineProps<{ title: string }>()` → [Vue 3 + TS](../part7-practice/04-vue)
:::

**7-4** ✍️ 공통 API 응답 `{ success: true, data: T } | { success: false, message: string }`을 제네릭 타입 `ApiResponse<T>`로 정의하고, 성공이면 데이터를, 실패면 에러를 던지는 `unwrap` 함수를 작성하세요.

::: details 정답 보기

```ts
type ApiResponse<T> = { success: true; data: T } | { success: false; message: string }

function unwrap<T>(res: ApiResponse<T>): T {
  if (res.success) return res.data
  throw new Error(res.message)
}
console.log(unwrap({ success: true, data: [1, 2, 3] }).length)
// 출력: 3
```

→ [API 클라이언트 타입 설계](../part7-practice/06-api-client)
:::

**7-5** 📝 zustand 스토어를 TypeScript로 만들 때 `create<CartState>()(...)`처럼 괄호를 두 번 쓰는 이유는?

::: details 정답 보기
미들웨어 타입 추론을 위해 타입 인수를 먼저 고정하는 **커링(currying)** 형태를 zustand가 권장하기 때문입니다. → [zustand](../part7-practice/05-zustand)
:::

**7-6** 📝 "불가능한 상태를 표현할 수 없게 만들라(Make impossible states unrepresentable)"는 원칙을 적용한 예를 하나 드세요.

::: details 정답 보기
`isLoading`·`isError`·`data?`를 따로 두는 대신 `{ status: 'loading' } | { status: 'success'; data: T } | { status: 'error'; error: string }` 판별 유니온으로 표현하는 것. → [좋은 타입 설계](../part7-practice/07-type-design)
:::

**7-7** 📝 Express 핸들러에서 `req.body`를 바로 `as CreateOrderDto`로 쓰면 안 되는 이유는?

::: details 정답 보기
클라이언트는 아무 데이터나 보낼 수 있고 `as`는 검사하지 않으므로, 잘못된 값이 DB까지 들어가거나 보안 문제가 생깁니다. 스키마 검증(zod 등)을 거친 뒤 사용합니다. → [Node.js + Express](../part7-practice/01-node-express)
:::

---

### Part 8. 실습 프로젝트

**8-1** 📝 콘솔 가계부에서 수입/지출 기록을 하나의 타입으로 표현할 때 가장 알맞은 설계는?

① `{ type: string; amount: number; category?: string; source?: string }`
② `{ kind: 'income'; amount: number; source: string } | { kind: 'expense'; amount: number; category: string }`
③ `any`
④ `{ isIncome: boolean; isExpense: boolean; amount: number }`

::: details 정답 보기
**②** 판별 유니온으로 종류별 필수 속성을 정확히 표현합니다. → [프로젝트 1: 콘솔 가계부](../part8-projects/01-cli-budget)
:::

**8-2** 🔍 DOM에서 `document.querySelector('#todo-input')`의 반환 타입과, `.value`에 접근하려면 해야 할 일은?

::: details 정답 보기
`Element | null`입니다. `null` 확인과 함께 `instanceof HTMLInputElement`로 좁히거나 `querySelector<HTMLInputElement>('#todo-input')`처럼 제네릭을 쓰고 `null`을 확인합니다. → [프로젝트 2: Todo 웹앱](../part8-projects/02-todo-web)
:::

**8-3** ✍️ zod로 주문 생성 요청 스키마를 만들고 타입을 뽑아 보세요. 조건: `memberId`는 문자열, `items`는 1개 이상, 각 항목의 `qty`는 1 이상의 정수. (zod 3.x 기준)

::: details 정답 보기

```ts
import { z } from 'zod'

const CreateOrderSchema = z.object({
  memberId: z.string(),
  items: z
    .array(z.object({ productId: z.string(), qty: z.number().int().min(1) }))
    .min(1),
})
type CreateOrderDto = z.infer<typeof CreateOrderSchema>
```

스키마 하나로 **런타임 검증**과 **타입**을 함께 얻는 것이 핵심입니다. → [프로젝트 3: 주문 REST API](../part8-projects/03-rest-api)
:::

**8-4** 📝 React 주문 앱에서 서버 상태(주문 목록)와 클라이언트 상태(장바구니)를 구분하는 이유는?

::: details 정답 보기
서버 상태는 다른 사람이 바꿀 수 있어 **캐시·재조회·로딩/에러** 관리가 필요하고, 클라이언트 상태는 내 화면에서만 바뀌므로 단순한 스토어(zustand 등)로 충분하기 때문입니다. 섞으면 동기화 버그가 생깁니다. → [프로젝트 4: React 주문 앱](../part8-projects/04-react-order-app)
:::

**8-5** ✍️ 장바구니 항목 배열에서 총액을 계산하는 함수를 작성하세요. 같은 상품이 여러 번 들어 있어도 됩니다.

```ts
interface CartItem {
  productId: string
  price: number
  qty: number
}
```

::: details 정답 보기

```ts
interface CartItem {
  productId: string
  price: number
  qty: number
}
function cartTotal(items: readonly CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0)
}
console.log(cartTotal([
  { productId: 'P001', price: 4500, qty: 2 },
  { productId: 'P002', price: 5000, qty: 1 },
]))
// 출력: 14000
```

`readonly CartItem[]`로 받으면 함수가 배열을 바꾸지 않는다는 약속이 타입에 드러납니다.
:::

**8-6** 📝 실습 프로젝트를 "완성"했다고 판단하는 기준으로 가장 알맞은 것은?

① 화면이 한 번 동작했다
② `tsc --noEmit`, 린트, 테스트가 모두 통과하고 README의 실행 방법대로 처음부터 실행된다
③ 코드에 `any`가 있어도 동작하면 된다
④ 에러 메시지가 콘솔에 보이지 않는다

::: details 정답 보기
**②** 다른 사람이 같은 순서로 실행해 같은 결과를 얻을 수 있어야 완성입니다.
:::

---

## 점수 기준 {#scoring}

각 문제 1점입니다. 파트별 점수를 적어 보세요.

| 파트 | 문항 수 | 내 점수 | 복습 기준 | 이 점수 이하이면 다시 볼 레슨 |
|---|---|---|---|---|
| Part 0 | 6 | | 3점 이하 | [첫 프로그램](../part0-start/05-first-program), [에러 메시지 읽는 법](../part0-start/06-how-to-read-errors) |
| Part 1 | 7 | | 4점 이하 | [함수 기초](../part1-basics/06-functions), [배열](../part1-basics/07-arrays), [스코프와 클로저](../part1-basics/10-scope-closure) |
| Part 2 | 7 | | 4점 이하 | [타입 표기와 추론](../part2-types/01-annotation-inference), [유니온과 리터럴](../part2-types/06-union-literal), [타입 좁히기](../part2-types/08-narrowing) |
| Part 3 | 7 | | 4점 이하 | [구조적 타이핑](../part3-intermediate/02-structural-typing), [판별 유니온](../part3-intermediate/03-discriminated-union), [제네릭 기초](../part3-intermediate/04-generics-basics) |
| Part 4 | 6 | | 3점 이하 | [Promise](../part4-async/02-promise), [async/await](../part4-async/03-async-await), [런타임 검증](../part4-async/05-runtime-validation) |
| Part 5 | 7 | | 4점 이하 | [조건부 타입](../part5-advanced/01-conditional-types), [infer](../part5-advanced/02-infer), [매핑된 타입](../part5-advanced/03-mapped-types) |
| Part 6 | 6 | | 3점 이하 | [tsconfig](../part6-tooling/01-tsconfig), [strict 옵션](../part6-tooling/02-strict-options), [모듈 시스템](../part6-tooling/03-module-systems) |
| Part 7 | 7 | | 4점 이하 | [React 기초](../part7-practice/02-react-basics), [API 클라이언트](../part7-practice/06-api-client), [타입 설계](../part7-practice/07-type-design) |
| Part 8 | 6 | | 3점 이하 | 점수가 낮은 문항의 프로젝트를 처음부터 다시 만들어 봅니다 |

**총점(57점 만점) 해석**

| 총점 | 상태 | 권장 |
|---|---|---|
| 50점 이상 | 마스터 과정에 들어갈 준비가 됨 | [면접·실무 질문 50선](./05-interview)으로 말로 설명하는 연습 |
| 40~49점 | 대부분 이해, 일부 빈 곳 | 복습 기준에 걸린 파트만 다시 보고, 그 파트를 다시 풀기 |
| 25~39점 | 기초는 있으나 중급 이상이 불안 | Part 2·3을 다시 보고, Part 8 프로젝트 하나를 처음부터 다시 만들기 |
| 24점 이하 | 기초부터 다지는 것이 빠름 | Part 1·2를 다시 공부한 뒤 2주 후 재시험 |

::: tip 틀린 문제는 "왜"를 적어 두세요
틀린 문제마다 "무엇을 몰랐는지"를 한 줄로 적어 두면, 2주 뒤 다시 풀 때 같은 실수를 반복하는지 확인할 수 있습니다. 같은 실수가 반복되는 주제가 진짜 약점입니다.
:::

## 자주 하는 실수

### 실수 1: 코드 쓰기 문제를 머릿속으로만 풀기

"이렇게 쓰면 되겠지"와 실제로 에러 없이 쓰는 것은 다릅니다. 예를 들어 3-2(`last`)를 머릿속으로 풀면 반환 타입을 `T`로 적고 넘어가기 쉽습니다.

```ts
function last<T>(items: T[]): T {
  return items[items.length - 1] // 빈 배열이면 실제로는 undefined
}
```

**왜 틀렸나**: 컴파일은 되지만(기본 설정에서는 인덱스 접근을 `T`로 봄) 빈 배열에서 `undefined`가 나오는데 타입은 `T`라고 거짓말합니다. `noUncheckedIndexedAccess`를 켜 보면 에러로 드러납니다.

**고친 코드**: 반환 타입을 `T | undefined`로 정직하게 씁니다(3-2 정답 참고).

### 실수 2: 정답 보기를 먼저 열기

정답을 보고 "아, 알았어"라고 느끼는 것은 **알아보는 능력**(recognition)이지 **떠올리는 능력**(recall)이 아닙니다. 실무와 면접에서 필요한 것은 떠올리는 능력입니다. 반드시 답을 적은 뒤 엽니다.

### 실수 3: 총점만 보고 판단하기

총점 45점이어도 Part 4가 1점이라면 비동기 코드에서 사고가 날 수 있습니다. **파트별 복습 기준**을 먼저 봅니다.

## 직접 해 보기

### 문제 1 ⭐ 오답 노트 만들기

이번 테스트에서 틀린 문제를 표로 정리해 보세요. 열은 "문항 번호 / 내가 쓴 답 / 정답 / 몰랐던 것 / 다시 볼 레슨"입니다.

::: details 정답 보기
예시입니다.

| 문항 | 내 답 | 정답 | 몰랐던 것 | 다시 볼 레슨 |
|---|---|---|---|---|
| 4-1 | A D B C | A D C B | Promise 콜백이 setTimeout보다 먼저 실행됨 | 이벤트 루프 |
| 6-1 | ① | ③ | strict에 포함되지 않는 옵션이 있음 | strict 옵션 |
:::

### 문제 2 ⭐⭐ 2주 복습 계획 세우기

복습 기준에 걸린 파트를 골라, 하루 1시간씩 2주(10일) 계획을 세워 보세요.

::: details 정답 보기
예시(Part 3과 Part 5가 약한 경우):

- 1~2일: 구조적 타이핑 · 판별 유니온 다시 읽고 연습 문제
- 3~4일: 제네릭 기초 · 제약 다시 읽고 연습 문제
- 5일: Part 3 자가 진단 다시 풀기
- 6~7일: 조건부 타입 · infer
- 8일: 매핑된 타입 · 템플릿 리터럴 타입
- 9일: type-challenges 쉬움 단계 5문제
- 10일: Part 3·5 자가 진단 다시 풀기, 오답 노트 비교
:::

### 문제 3 ⭐⭐⭐ 나만의 문제 만들기

가장 약한 파트에서 **내가 틀릴 뻔한 함정**을 이용해 문제를 하나 만들고, `tsc`로 정답을 확인해 보세요. 문제를 만들려면 개념을 정확히 알아야 하므로 가장 효과적인 복습입니다.

::: details 정답 보기
예시:

```ts
// 문제: 출력은?
const qty: number | undefined = 0
console.log(qty ? '있음' : '없음', qty !== undefined ? '있음' : '없음')
// 출력: 없음 있음
```

`0`은 falsy라서 첫 번째 조건은 "없음"이 됩니다. 수량·금액처럼 0이 정상 값인 경우 truthy 검사 대신 `!== undefined`로 비교해야 합니다.
:::

## 확인 퀴즈

1. 이 테스트에서 문제 유형 세 가지는 무엇인가요?
2. 총점보다 파트별 점수를 먼저 봐야 하는 이유는 무엇인가요?
3. 정답 보기를 먼저 열면 안 되는 이유를 "알아보기"와 "떠올리기"로 설명해 보세요.

::: details 정답 보기
1. 객관식, 코드 읽기, 코드 쓰기.
2. 총점이 높아도 특정 파트가 비어 있으면 그 영역에서 실무 사고가 날 수 있기 때문입니다.
3. 정답을 보고 이해하는 것은 알아보기(recognition)이고, 실무·면접에서는 스스로 떠올리기(recall)가 필요합니다. 먼저 답을 적어야 떠올리기 능력을 확인할 수 있습니다.
:::

## 정리

- 파트별로 객관식 · 코드 읽기 · 코드 쓰기 문제를 풀어 **아는 것과 쓸 수 있는 것**을 구분합니다.
- 답은 반드시 **먼저 적고** 나서 확인합니다. 코드 쓰기 문제는 `tsc`로 직접 검사합니다.
- **파트별 복습 기준**에 걸린 레슨부터 다시 보고, 2주 뒤 다시 풉니다.
- 틀린 이유를 오답 노트로 남기면 반복되는 약점이 보입니다.

## 다음 단계

[면접·실무 질문 50선](./05-interview) — 아는 것을 **말로 설명**하는 연습입니다. 면접과 코드 리뷰에서 자주 나오는 질문 50개를 주제별로 정리했습니다.
