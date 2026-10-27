---
title: 제네릭 제약(extends)과 기본 타입 매개변수
---

# 제네릭 제약(extends)과 기본 타입 매개변수

<LessonMeta level="중급" :minutes="50" prev="타입 매개변수 T로 입력과 출력의 타입을 연결하는 제네릭 기초" />

## 이번에 배울 것

- `T extends 타입`으로 타입 매개변수에 들어올 수 있는 타입을 제한할 수 있다.
- `K extends keyof T`로 "이 객체의 키만" 받는 함수를 만들 수 있다.
- 서로 관계가 있는 타입 매개변수 여러 개를 선언할 수 있다.
- 기본 타입 매개변수(`T = string`)를 정해 타입 인자를 생략할 수 있게 만들 수 있다.
- `const` 타입 매개변수(TypeScript 5.0+)로 리터럴 타입을 그대로 추론하게 할 수 있다.
- 불필요한 제네릭, 반환 타입에만 쓰는 제네릭 같은 흔한 실수를 피할 수 있다.

## 먼저 알아 둘 것

- [제네릭 기초](./04-generics-basics)
- [구조적 타이핑과 할당 가능성](./02-structural-typing): "속성이 더 많은 쪽 → 적은 쪽" 규칙
- [타입 단언(as)과 non-null 단언(!)](../part2-types/10-assertion)

## 비유로 이해하기

앞 레슨에서 제네릭은 **빈칸이 있는 양식**이었습니다. 그런데 빈칸에 아무거나 써도 되는 양식만 있는 건 아닙니다.

```text
[냉장 보관 상품: ____ ] 을(를) 냉장고 3번 칸에 보관합니다.
```

이 양식의 빈칸에는 "우유", "생크림"은 쓸 수 있지만 "종이컵"은 쓸 수 없습니다. 빈칸 앞에 **"냉장 보관 상품"이라는 조건**이 붙어 있기 때문입니다. 조건이 붙으면 두 가지가 동시에 좋아집니다.

- **쓰는 쪽**: 엉뚱한 것을 넣으면 바로 걸러집니다.
- **양식을 만든 쪽**: 빈칸에 뭐가 들어오든 "냉장 보관이 필요한 물건"이라고 믿고 문장을 쓸 수 있습니다.

제네릭 **제약**(constraint)이 바로 이 조건입니다. `T extends HasId`는 "`T` 자리에는 `id`를 가진 타입만 들어올 수 있다"는 뜻입니다.

## 개념 설명

### 제약이 필요한 이유

ID로 목록에서 항목을 찾는 함수를 제네릭으로 만들어 보겠습니다.

```ts
function findById<T>(items: T[], id: number): T | undefined {
  return items.find((item) => item.id === id)
  // ❌ Property 'id' does not exist on type 'T'. (TS2339)
}
```

`T`는 아무 타입이나 될 수 있으므로, `T`에 `id`가 있다고 장담할 수 없습니다. 숫자 배열(`number[]`)이 들어오면 `item.id`는 없습니다. 앞 레슨에서 본 것처럼 함수 안에서 `T`로는 "모든 타입에 공통인 일"만 할 수 있습니다.

### extends로 제약 걸기

타입 매개변수 뒤에 `extends 타입`을 붙이면 **"`T`는 이 타입에 할당 가능한 타입이어야 한다"** 는 조건이 됩니다.

```ts
interface HasId {
  id: number
}

// T는 id: number를 가진 타입이어야 합니다.
function findById<T extends HasId>(items: T[], id: number): T | undefined {
  return items.find((item) => item.id === id) // ✅ T에는 반드시 id가 있음
}

const products = [
  { id: 1, name: '아메리카노', price: 4500 },
  { id: 2, name: '카페라테', price: 5000 },
]
const members = [{ id: 7, name: '김하늘', grade: 'VIP' }]

const p = findById(products, 2)
// 마우스를 올려 보면: const p: { id: number; name: string; price: number; } | undefined
const m = findById(members, 7)

console.log(p?.price, m?.grade)
// 출력: 5000 VIP

findById([4500, 5000], 1)
// ❌ Type 'number' is not assignable to type 'HasId'. (TS2322)
// ❌ Type 'number' is not assignable to type 'HasId'. (TS2322)  ← 배열 원소마다 하나씩
```

해설:

- `T extends HasId`의 `extends`는 클래스 상속이 아니라 **"~에 할당 가능한"** 이라는 뜻입니다. 2-2 레슨의 구조적 타이핑 규칙이 그대로 적용되어, `id: number`만 있으면 다른 속성이 더 있어도 됩니다.
- 함수 **안에서**는 `T`에 `id`가 있다고 믿고 `item.id`를 쓸 수 있습니다.
- 함수 **밖에서**는 `id`가 없는 타입을 넣으면 오류가 납니다.
- 중요한 점: 반환 타입은 `HasId`가 아니라 **`T` 그대로**입니다. 그래서 `p?.price`처럼 원래 타입의 다른 속성도 쓸 수 있습니다.

#### 제약을 매개변수 타입으로 쓰면 안 될까?

"그냥 `items: HasId[]`로 받으면 되지 않나?" 하는 의문이 들 수 있습니다.

```ts
interface HasId {
  id: number
}

function findById(items: HasId[], id: number): HasId | undefined {
  return items.find((item) => item.id === id)
}

const products = [{ id: 1, name: '아메리카노', price: 4500 }]
const p = findById(products, 1)
console.log(p?.price)
// ❌ Property 'price' does not exist on type 'HasId'. (TS2339)
```

받는 것은 되지만, 돌려줄 때 타입이 `HasId`로 **좁아져 버려서** `price`를 쓸 수 없습니다. 제네릭 + 제약을 쓰면 "조건은 검사하되 원래 타입은 유지"할 수 있습니다. 이것이 제약의 존재 이유입니다.

::: tip 기억하는 요령
- 제네릭만: "아무 타입이나, 타입 정보는 유지" → 함수 안에서 할 수 있는 일이 거의 없음
- 구체 타입만: "조건 검사 O, 타입 정보는 잃음"
- 제네릭 + 제약: "조건 검사 O, 타입 정보도 유지" ✅
:::

### 여러 가지 제약

제약에는 어떤 타입이든 쓸 수 있습니다.

```ts
// 원시 타입 유니온으로 제약
function formatCode<T extends string | number>(code: T): string {
  return `[${code}]`
}

// 배열 길이가 필요하면 length를 가진 타입으로 제약
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b
}

console.log(formatCode('S001'), formatCode(101))
console.log(longest('라테', '아메리카노'))
console.log(longest([1, 2], [1, 2, 3]))
// 출력: [S001] [101]
// 출력: 아메리카노
// 출력: [ 1, 2, 3 ]
```

`longest`는 문자열도, 배열도 받습니다. 둘 다 `length: number` 속성을 가지고 있기 때문입니다. 역시 구조적 타이핑입니다.

### keyof 제약: 이 객체의 키만 받기

`keyof T`는 "`T`의 키 이름들의 유니온"입니다. 예를 들어 `keyof { id: number; name: string }`은 `'id' | 'name'`입니다. `keyof`는 [다음 레슨](./06-keyof-typeof-indexed)에서 자세히 배우고, 여기서는 제약으로 쓰는 법만 봅니다.

객체와 키 이름을 받아 그 속성 값을 꺼내는 함수를 만들어 보겠습니다.

```ts
// K는 T의 키 중 하나여야 합니다.
function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

const product = { id: 1, name: '아메리카노', price: 4500 }

const name = getProp(product, 'name') // const name: string
const price = getProp(product, 'price') // const price: number
console.log(name, price)
// 출력: 아메리카노 4500

getProp(product, 'stock')
// ❌ Argument of type '"stock"' is not assignable to parameter of type '"name" | "id" | "price"'. (TS2345)
```

해설:

- 타입 매개변수가 두 개입니다. `T`는 객체 타입, `K`는 그 객체의 키입니다.
- `K extends keyof T`: `K`는 `'id' | 'name' | 'price'` 중 하나여야 합니다. 없는 키 `'stock'`은 컴파일 오류가 납니다. 오타도 잡힙니다.
- 반환 타입 `T[K]`는 "`T`의 `K` 속성의 타입"입니다(**인덱스 접근 타입**, 다음 레슨에서 배웁니다). `'name'`을 넘기면 `string`, `'price'`를 넘기면 `number`가 됩니다.
- 이처럼 **뒤의 타입 매개변수가 앞의 타입 매개변수를 이용해 제약**될 수 있습니다.
- 오류 메시지 속 유니온의 순서(`"name" | "id" | "price"`)는 TypeScript 내부 사정에 따라 달라질 수 있습니다. 순서가 달라도 같은 타입입니다.

#### 실무 예: 목록 정렬 함수

```ts
interface Product {
  id: number
  name: string
  price: number
}

// 지정한 키를 기준으로 오름차순 정렬한 새 배열을 반환합니다.
function sortBy<T, K extends keyof T>(items: T[], key: K): T[] {
  return [...items].sort((a, b) => {
    if (a[key] < b[key]) return -1
    if (a[key] > b[key]) return 1
    return 0
  })
}

const products: Product[] = [
  { id: 1, name: '카페라테', price: 5000 },
  { id: 2, name: '스콘', price: 3200 },
  { id: 3, name: '아메리카노', price: 4500 },
]

console.log(sortBy(products, 'price').map((p) => p.name))
console.log(sortBy(products, 'name').map((p) => p.name))
// 출력: [ '스콘', '아메리카노', '카페라테' ]
// 출력: [ '스콘', '아메리카노', '카페라테' ]
```

정렬 기준 키를 문자열로 받지만, `Product`에 있는 키만 허용되므로 `sortBy(products, 'prise')` 같은 오타는 컴파일 단계에서 막힙니다.

### 여러 타입 매개변수와 그 관계

타입 매개변수가 여러 개일 때, 서로 **독립적**일 수도 있고 **관계**가 있을 수도 있습니다.

```ts
// 독립적인 두 타입: 각자 따로 추론됩니다.
function mapPair<A, B>(pair: [A, A], fn: (value: A) => B): [B, B] {
  return [fn(pair[0]), fn(pair[1])]
}

const prices = mapPair([4500, 5000], (p) => `${p}원`)
// 마우스를 올려 보면: const prices: [string, string]
console.log(prices)
// 출력: [ '4500원', '5000원' ]
```

`A`는 첫 번째 인수에서 `number`로, `B`는 콜백의 반환값에서 `string`으로 추론됩니다.

관계가 있는 예로, 기존 객체에 일부 속성을 덮어쓴 새 객체를 만드는 함수를 보겠습니다.

```ts
// U는 T의 일부 속성만 가진 객체여야 합니다.
function updateWith<T extends object, U extends Partial<T>>(original: T, changes: U): T {
  return { ...original, ...changes }
}

const product = { id: 1, name: '아메리카노', price: 4500 }
const updated = updateWith(product, { price: 4800 })
console.log(updated)
// 출력: { id: 1, name: '아메리카노', price: 4800 }

updateWith(product, { price: '사천팔백 원' })
// ❌ Type 'string' is not assignable to type 'number'. (TS2322)
```

`Partial<T>`는 "`T`의 모든 속성을 선택 속성으로 바꾼 타입"입니다. [유틸리티 타입](./07-utility-types) 레슨에서 배웁니다. 여기서는 "`U`는 `T`의 속성 중 일부만 가진 객체"라는 관계를 제약으로 표현했다는 점만 보세요.

::: info 사실 이 함수는 U가 없어도 됩니다
`changes: Partial<T>`로 바로 받아도 같은 검사를 합니다. `U`는 반환 타입 어디에도 쓰이지 않으므로, "두 곳 이상을 연결하는가?" 질문에 따르면 불필요한 타입 매개변수입니다. 관계 표현을 보여 주려고 일부러 넣은 예입니다. 이런 판단은 이 레슨의 "자주 하는 실수"에서 다시 다룹니다.
:::

### 기본 타입 매개변수

함수 매개변수에 기본값(`function f(x = 10)`)을 줄 수 있듯, 타입 매개변수에도 **기본 타입**을 줄 수 있습니다. 타입 인자를 생략하면 기본 타입이 쓰입니다.

```ts
// 데이터 타입을 정하지 않으면 unknown으로 둡니다.
interface ApiResponse<T = unknown> {
  code: string
  message: string
  data: T
}

// 타입 인자를 생략: data는 unknown
const pingRes: ApiResponse = { code: '0000', message: '정상', data: null }

// 타입 인자를 지정: data는 { name: string }[]
const listRes: ApiResponse<{ name: string }[]> = {
  code: '0000',
  message: '정상',
  data: [{ name: '아메리카노' }],
}

console.log(pingRes.code, listRes.data[0].name)
// 출력: 0000 아메리카노
```

앞 레슨에서 제네릭 타입은 반드시 타입 인자를 채워야 한다고 했습니다(TS2314). 기본 타입을 정해 두면 생략할 수 있습니다.

#### 제약과 기본값을 함께

제약과 기본값을 같이 쓸 때는 `T extends 제약 = 기본값` 순서로 씁니다. 기본값도 제약을 만족해야 합니다.

```ts
// 목록 화면 상태: 정렬 키는 항목의 키 중 하나, 기본은 'id'
interface ListState<T extends { id: number }, K extends keyof T = 'id'> {
  items: T[]
  sortKey: K
}

interface Product {
  id: number
  name: string
  price: number
}

const s1: ListState<Product> = { items: [], sortKey: 'id' } // K는 기본값 'id'
const s2: ListState<Product, 'price'> = { items: [], sortKey: 'price' }

console.log(s1.sortKey, s2.sortKey)
// 출력: id price

const s3: ListState<Product> = { items: [], sortKey: 'price' }
// ❌ Type '"price"' is not assignable to type '"id"'. (TS2322)
```

::: warning 기본 타입 매개변수 순서 규칙
기본값이 있는 타입 매개변수 **뒤에** 기본값이 없는 타입 매개변수를 둘 수 없습니다. 함수의 선택 매개변수가 필수 매개변수보다 뒤에 와야 하는 것과 같은 규칙입니다.

```ts
interface Bad<T = string, U> {
  // ❌ Required type parameters may not follow optional type parameters. (TS2706)
  a: T
  b: U
}
```
:::

#### 함수에서는 기본값보다 추론이 먼저

함수 타입 매개변수에도 기본값을 줄 수 있지만, 함수 호출에서는 **추론이 먼저**입니다. 기본값은 추론할 재료가 없을 때만 쓰입니다.

```ts
function createList<T = string>(...items: T[]): T[] {
  return items
}

const a = createList(1, 2, 3) // 추론: number[]
const b = createList() // 추론 재료 없음 → 기본값: string[]

b.push('아메리카노')
console.log(a, b)
// 출력: [ 1, 2, 3 ] [ '아메리카노' ]
```

### const 타입 매개변수 (TypeScript 5.0+)

TypeScript는 값을 추론할 때 보통 리터럴을 **넓힙니다.** `'CARD'`는 `string`으로, `[1, 2]`는 `number[]`로 추론하는 식입니다. 대부분은 이게 편하지만, 리터럴 그대로가 필요할 때가 있습니다.

```ts
// 결제 수단 목록을 받아 그대로 돌려주는 함수
function defineMethods<T extends readonly string[]>(methods: T): T {
  return methods
}

const methods = defineMethods(['CARD', 'CASH', 'POINT'])
// 마우스를 올려 보면: const methods: string[]
```

`'CARD'`, `'CASH'`, `'POINT'`라는 정보가 사라지고 `string[]`이 되었습니다. 호출하는 쪽에서 `as const`를 붙이면 리터럴이 유지되지만, 매번 붙이기는 번거롭고 빠뜨리기 쉽습니다.

TypeScript 5.0부터는 타입 매개변수 앞에 `const`를 붙여 **"이 타입 매개변수는 `as const`를 붙인 것처럼 추론하라"** 고 지정할 수 있습니다.

```ts
// T 앞에 const: 인수를 as const처럼 좁게 추론합니다. (TypeScript 5.0+)
function defineMethods<const T extends readonly string[]>(methods: T): T {
  return methods
}

const methods = defineMethods(['CARD', 'CASH', 'POINT'])
// 마우스를 올려 보면: const methods: readonly ["CARD", "CASH", "POINT"]

// 배열 원소 타입을 꺼내 유니온으로 만들 수 있습니다. (T[number]는 다음 레슨에서 배웁니다)
type PayMethod = (typeof methods)[number]
// 마우스를 올려 보면: type PayMethod = "CARD" | "CASH" | "POINT"

const m: PayMethod = 'CARD'
console.log(m, methods.length)
// 출력: CARD 3
```

해설:

- `const T`는 TypeScript 5.0에서 추가되었습니다. 이전 버전에서는 문법 오류입니다.
- 배열을 받을 때는 제약을 `readonly string[]`처럼 **`readonly` 배열**로 쓰는 것이 좋습니다. `as const`로 추론된 값은 읽기 전용 튜플이 되는데, 제약이 `string[]`(수정 가능 배열)이면 맞지 않아 리터럴 추론이 제대로 되지 않습니다.
- `const` 타입 매개변수는 인수 자리에 **리터럴을 직접 쓸 때만** 효과가 있습니다. 미리 변수에 담아 넘기면 그 변수의 타입(이미 넓혀진 `string[]`)이 그대로 쓰입니다.

객체에도 쓸 수 있습니다.

```ts
// 라우트(화면 경로) 정의를 리터럴 그대로 보존합니다. (TypeScript 5.0+)
function defineRoutes<const T extends Record<string, string>>(routes: T): T {
  return routes
}

const routes = defineRoutes({ home: '/', orders: '/orders', products: '/products' })
// 마우스를 올려 보면: const routes: { readonly home: "/"; readonly orders: "/orders"; readonly products: "/products"; }

const path: '/orders' = routes.orders // ✅ 값이 리터럴 타입으로 유지됨
console.log(path)
// 출력: /orders
```

`Record<string, string>`은 "키도 값도 문자열인 객체"입니다. 이것도 [유틸리티 타입](./07-utility-types)에서 배웁니다.

## 자주 하는 실수

### 실수 1: 불필요한 제네릭

```ts
interface HasId {
  id: number
}

// T가 매개변수 한 곳에만 쓰이고 반환과 연결되지 않습니다.
function printId<T extends HasId>(item: T): void {
  console.log(`ID: ${item.id}`)
}

printId({ id: 1 })
// 출력: ID: 1
```

**왜 틀렸나:** 동작은 하지만 제네릭이 아무 일도 하지 않습니다. `T`가 다른 곳과 연결되지 않으므로 `item: HasId`와 완전히 같습니다. 읽는 사람만 "이 `T`가 어디에 쓰이지?" 하고 헤매게 됩니다.

```ts
interface HasId {
  id: number
}

// ✅ 제약 타입을 매개변수 타입으로 바로 씁니다.
function printId(item: HasId): void {
  console.log(`ID: ${item.id}`)
}

printId({ id: 1 })
// 출력: ID: 1
```

::: tip 제약이 있는 제네릭을 구체 타입으로 바꿔도 되는지 확인하는 법
`T extends X`에서 `T`가 **딱 한 번**만 나오면 `X`로 바꿔도 됩니다. 두 번 이상 나와서 무언가를 연결할 때만 제네릭이 의미가 있습니다.
:::

### 실수 2: 반환 타입에만 쓰는 제네릭

```ts
// 서버 응답을 파싱하는 함수 (T가 반환 타입에만 있습니다)
function parseJson<T>(text: string): T {
  return JSON.parse(text)
}

// 호출하는 쪽이 원하는 타입을 아무거나 적을 수 있습니다.
const product = parseJson<{ name: string; price: number }>('{"name":"아메리카노"}')
console.log(product.price.toFixed(0))
// 실행하면: TypeError: Cannot read properties of undefined (reading 'toFixed')
```

**왜 틀렸나:** `T`가 반환 타입에만 있으면 함수는 아무것도 검사하지 않고 **호출하는 쪽이 적은 타입을 그대로 믿어 줍니다.** 사실상 `as`(타입 단언)를 함수 모양으로 숨긴 것입니다. 실제 데이터에 `price`가 없어도 컴파일러는 모르고, 실행 중에 오류가 납니다. 겉보기에는 안전한 제네릭처럼 보여서 단언보다 더 위험합니다.

```ts
// ✅ unknown을 반환해서 호출하는 쪽이 검사하도록 강제합니다.
function parseJson(text: string): unknown {
  return JSON.parse(text)
}

const data = parseJson('{"name":"아메리카노"}')

if (
  typeof data === 'object' && data !== null &&
  'price' in data && typeof data.price === 'number'
) {
  console.log(data.price.toFixed(0))
} else {
  console.log('가격 정보가 없습니다.')
}
// 출력: 가격 정보가 없습니다.
```

외부 데이터 검사를 매번 손으로 쓰기는 번거롭습니다. 검증 라이브러리로 깔끔하게 처리하는 방법은 [런타임 검증](../part4-async/05-runtime-validation) 레슨에서 배웁니다.

::: info 예외: 일부러 그렇게 만든 API
`fetch` 래퍼나 `document.querySelector<HTMLInputElement>('#name')`처럼 표준·라이브러리 API 중에도 반환 타입에만 쓰는 제네릭이 있습니다. 이런 곳은 "이 부분은 호출하는 쪽이 책임진다"는 약속이라는 걸 알고 써야 합니다.
:::

### 실수 3: 제약을 걸었으니 T가 곧 제약 타입이라고 생각하기

```ts
interface HasId {
  id: number
}

// 기본 항목을 반환하려고 했습니다.
function withDefault<T extends HasId>(item: T | undefined): T {
  return item ?? { id: 0 }
  // ❌ Type '{ id: number; }' is not assignable to type 'T'. (TS2322)
}
```

**왜 틀렸나:** `T extends HasId`는 "`T`는 `HasId`보다 **속성이 더 많을 수도 있다**"는 뜻입니다. `T`가 `{ id: number; name: string; price: number }`라면 `{ id: 0 }`은 `name`과 `price`가 없어 `T`가 아닙니다. 제약은 `T`의 **최소 조건**이지 `T` 자체가 아닙니다.

```ts
interface HasId {
  id: number
}

// ✅ 기본값도 호출하는 쪽에서 T 타입으로 받습니다.
function withDefault<T extends HasId>(item: T | undefined, fallback: T): T {
  return item ?? fallback
}

const product = withDefault(undefined, { id: 0, name: '미정', price: 0 })
console.log(product.name)
// 출력: 미정
```

### 실수 4: const 타입 매개변수에 변수를 넘기기

```ts
function defineMethods<const T extends readonly string[]>(methods: T): T {
  return methods
}

const list = ['CARD', 'CASH']
const methods = defineMethods(list)
// 마우스를 올려 보면: const methods: string[]

const m: 'CARD' | 'CASH' = methods[0]
// ❌ Type 'string' is not assignable to type '"CARD" | "CASH"'. (TS2322)
```

**왜 틀렸나:** `list`를 선언하는 순간 이미 `string[]`으로 넓혀졌습니다. `const` 타입 매개변수는 **인수 자리에 바로 쓴 리터럴**에만 효과가 있습니다.

```ts
function defineMethods<const T extends readonly string[]>(methods: T): T {
  return methods
}

// ✅ 리터럴을 인수에 바로 쓰거나, 변수에 as const를 붙입니다.
const methods = defineMethods(['CARD', 'CASH'])
const list = ['CARD', 'CASH'] as const

const m1: 'CARD' | 'CASH' = methods[0]
const m2: 'CARD' | 'CASH' = list[1]
console.log(m1, m2)
// 출력: CARD CASH
```

## 직접 해 보기

### 문제 1 ⭐ 기초

`name: string` 속성을 가진 항목 배열을 받아 이름만 쉼표로 이어 붙인 문자열을 반환하는 함수 `joinNames`를 만드세요. 이 함수에 제네릭이 필요할까요?

::: details 정답 보기
반환 타입이 `string`이고 `T`가 반환과 연결되지 않으므로 제네릭이 필요 없습니다.

```ts
function joinNames(items: { name: string }[]): string {
  return items.map((item) => item.name).join(', ')
}

const products = [
  { id: 1, name: '아메리카노', price: 4500 },
  { id: 2, name: '스콘', price: 3200 },
]
console.log(joinNames(products))
// 출력: 아메리카노, 스콘
```
변수 `products`를 넘겼으므로 `id`, `price`가 더 있어도 문제없습니다(구조적 타이핑).
:::

### 문제 2 ⭐ 기초

`price: number`를 가진 항목 배열을 받아, 가격이 `max` 이하인 항목만 걸러 **원래 타입 그대로** 반환하는 `filterByPrice` 함수를 만드세요. 반환된 항목에서 `name`을 쓸 수 있어야 합니다.

::: details 정답 보기
```ts
function filterByPrice<T extends { price: number }>(items: T[], max: number): T[] {
  return items.filter((item) => item.price <= max)
}

const menu = [
  { name: '아메리카노', price: 4500 },
  { name: '카페라테', price: 5000 },
  { name: '스콘', price: 3200 },
]

const cheap = filterByPrice(menu, 4500)
console.log(cheap.map((m) => m.name))
// 출력: [ '아메리카노', '스콘' ]
```
반환값과 입력이 `T`로 연결되므로 제네릭이 필요합니다. `items: { price: number }[]`로 받으면 반환된 항목에서 `name`을 쓸 수 없습니다.
:::

### 문제 3 ⭐⭐ 응용

객체 배열과 키 이름을 받아, 그 키의 값만 모은 배열을 반환하는 `pluck` 함수를 만드세요. 반환 타입이 정확해야 합니다. (`pluck(products, 'price')`는 `number[]`)

::: details 정답 보기
```ts
function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map((item) => item[key])
}

const products = [
  { id: 1, name: '아메리카노', price: 4500 },
  { id: 2, name: '스콘', price: 3200 },
]

const prices = pluck(products, 'price') // const prices: number[]
const names = pluck(products, 'name') // const names: string[]
console.log(prices, names)
// 출력: [ 4500, 3200 ] [ '아메리카노', '스콘' ]

pluck(products, 'stock')
// ❌ Argument of type '"stock"' is not assignable to parameter of type '"price" | "id" | "name"'. (TS2345)
```
:::

### 문제 4 ⭐⭐ 응용

페이지 응답 타입 `Paged`를 만드세요. 항목 타입 `T`는 기본값이 `unknown`이고, 페이지 번호 타입 `P`는 `number | string`으로 제약하되 기본값은 `number`입니다.

::: details 정답 보기
```ts
interface Paged<T = unknown, P extends number | string = number> {
  items: T[]
  page: P
}

const a: Paged = { items: [1, 'x'], page: 1 }
const b: Paged<{ name: string }, string> = { items: [{ name: '스콘' }], page: 'cursor-abc' }

console.log(a.page, b.page, b.items[0].name)
// 출력: 1 cursor-abc 스콘
```
:::

### 문제 5 ⭐⭐⭐ 도전

아래 함수의 문제점을 설명하고, 안전하게 고쳐 보세요.

```text
function getStorage<T>(key: string): T {
  return JSON.parse(localStorage.getItem(key) ?? 'null')
}

const cart = getStorage<{ items: string[] }>('cart')
cart.items.push('아메리카노')
```

::: details 정답 보기
`T`가 반환 타입에만 쓰여, 저장된 값이 실제로 어떤 모양인지 검사하지 않고 호출하는 쪽이 적은 타입을 믿어 줍니다. 저장된 값이 없으면 `null`이 반환되어 `cart.items`에서 실행 오류가 납니다. `unknown`을 반환하고, 쓰는 쪽에서 검사합니다.

```ts
function getStorage(key: string): unknown {
  return JSON.parse(localStorage.getItem(key) ?? 'null')
}

function isCart(value: unknown): value is { items: string[] } {
  return (
    typeof value === 'object' && value !== null &&
    'items' in value && Array.isArray(value.items)
  )
}

const saved = getStorage('cart')
const cart = isCart(saved) ? saved : { items: [] }
cart.items.push('아메리카노')
```
`value is { items: string[] }` 같은 사용자 정의 타입 가드는 [Part 5](../part5-advanced/06-type-guards-satisfies)에서 자세히 배웁니다.
:::

## 확인 퀴즈

1. `T extends HasId`에서 `extends`는 어떤 뜻인가요?
2. `items: HasId[]`로 받는 것과 `<T extends HasId>(items: T[])`로 받는 것은 반환값에서 어떤 차이가 있나요?
3. `K extends keyof T`는 어떤 조건인가요?
4. `interface Box<T = string, U>`가 오류인 이유는 무엇인가요?
5. `const` 타입 매개변수는 몇 버전부터 쓸 수 있고, 어떤 효과가 있나요?
6. 반환 타입에만 쓰는 제네릭이 위험한 이유는 무엇인가요?

::: details 정답 보기
1. "`T`는 `HasId`에 할당 가능한 타입이어야 한다"는 제약입니다. 클래스 상속과는 다릅니다.
2. `HasId[]`로 받으면 반환 타입도 `HasId`로 좁아져 다른 속성을 쓸 수 없습니다. 제네릭 + 제약은 원래 타입 `T`를 유지합니다.
3. `K`는 `T`의 키 이름(`keyof T`) 중 하나여야 한다는 조건입니다.
4. 기본값이 있는 타입 매개변수 뒤에 기본값이 없는 타입 매개변수를 둘 수 없기 때문입니다(TS2706).
5. TypeScript 5.0부터입니다. 인수로 직접 쓴 리터럴을 `as const`를 붙인 것처럼 좁게(리터럴·readonly 튜플로) 추론합니다.
6. 함수가 아무것도 검사하지 않고 호출하는 쪽이 적은 타입을 그대로 믿어 주므로, 사실상 숨겨진 타입 단언이기 때문입니다.
:::

## 정리

- `T extends X`는 "`T`는 `X`에 할당 가능해야 한다"는 **제약**입니다. 함수 안에서는 `X`의 속성을 쓸 수 있고, 반환값은 원래 타입 `T`를 유지합니다.
- `K extends keyof T`로 "이 객체의 키만" 받게 만들고, `T[K]`로 그 속성의 타입을 꺼낼 수 있습니다.
- 타입 매개변수는 여러 개 둘 수 있고, 뒤의 것이 앞의 것을 이용해 제약될 수 있습니다.
- `T = 기본값`으로 기본 타입 매개변수를 정하면 타입 인자를 생략할 수 있습니다. 순서는 `T extends 제약 = 기본값`입니다.
- `const` 타입 매개변수(TS 5.0+)는 리터럴 인수를 `as const`처럼 좁게 추론합니다.
- 한 번만 쓰이는 타입 매개변수, 반환 타입에만 쓰이는 타입 매개변수는 대부분 불필요하거나 위험합니다.

## 다음 단계

[keyof · typeof · 인덱스 접근 타입](./06-keyof-typeof-indexed): 이번 레슨에서 미리 맛본 `keyof T`, `T[K]`, `typeof methods[number]`를 제대로 배우고, 상수 객체에서 유니온 타입을 뽑아내는 방법을 익힙니다.
