---
title: infer로 타입 꺼내기
---

# infer로 타입 꺼내기

<LessonMeta level="고급" :minutes="50" prev="조건부 타입 T extends U ? X : Y와 분배 법칙" />

## 이번에 배울 것

- 조건부 타입 안에서 `infer`로 타입의 **일부분에 이름을 붙여 꺼낼** 수 있다.
- `ReturnType`·`Parameters`·`Awaited`와 배열 요소 타입을 직접 구현할 수 있다.
- `infer`를 한 패턴에 여러 개 쓰고, `infer X extends 제약`(TypeScript 4.7+)으로 꺼낸 타입을 제한할 수 있다.
- 템플릿 리터럴 패턴으로 문자열 리터럴 타입을 잘라 낼 수 있다.
- `Expect`·`Equal` 헬퍼로 내가 만든 타입의 결과를 컴파일러에게 검사받을 수 있다.

## 먼저 알아 둘 것

- [조건부 타입과 분배 법칙](./01-conditional-types) — `T extends U ? X : Y`, 분배, `never`
- [객체: 속성 · 메서드 · 구조 분해 · 스프레드](../part1-basics/08-objects) — 구조 분해 할당
- [배열 타입과 튜플](../part2-types/03-arrays-tuples) — `[number, string]` 같은 튜플 타입
- [Promise 완전 이해](../part4-async/02-promise) — `Promise<T>`의 뜻

## 비유로 이해하기

매장으로 택배 상자가 들어옵니다. 송장에는 이렇게 적혀 있습니다.

> "상자 모양: **[ 무언가 ]가 든 냉장 상자**"

검수 직원은 상자의 **겉모양**이 송장과 맞는지 확인합니다. 그리고 모양이 맞으면, 안에 든 "무언가"를 꺼내 **이름표를 붙여** 진열대로 보냅니다. 안에 우유가 들었든 치즈가 들었든 상관없습니다. 모양만 맞으면 내용물을 꺼낼 수 있습니다.

`infer`가 바로 이 "무언가" 자리입니다.

```text
T extends Promise<infer V> ? V : never
"T가 'V가 든 Promise 상자' 모양이면, 안의 V를 꺼내 돌려줘. 아니면 never."
```

- **모양**(`Promise<...>`)은 우리가 정합니다.
- **내용물**(`V`)은 컴파일러가 실제 타입을 보고 **알아냅니다**(infer = 추론하다).
- 모양이 맞지 않으면 꺼낼 것이 없으니 거짓 갈래로 갑니다.

값 레벨에서 이와 가장 닮은 것은 **구조 분해 할당**입니다. `const { price } = product`는 "product가 price 속성을 가진 모양이면 그 값을 price라는 이름으로 꺼내라"는 뜻이었습니다. `infer`는 그 일을 타입 세계에서 합니다.

## 개념 설명

### 1단계: 값 레벨의 구조 분해 복습

```ts
const order = { orderId: 1001, items: ['아메리카노', '라떼'], total: 9500 }

// 객체의 모양에 맞춰 원하는 부분에 이름을 붙여 꺼냅니다.
const { total } = order
// 배열도 자리(순서)에 맞춰 꺼냅니다.
const [firstItem, ...restItems] = order.items

console.log(total) // 출력: 9500
console.log(firstItem) // 출력: 아메리카노
console.log(restItems) // 출력: [ '라떼' ]
```

구조 분해의 핵심은 두 가지입니다.

1. 왼쪽에 **모양**(`{ total }`, `[first, ...rest]`)을 그립니다.
2. 모양 안의 **이름 자리**에 실제 값이 채워집니다.

`infer`도 똑같이 "모양을 그리고, 이름 자리를 비워 두면 컴파일러가 채워 주는" 방식입니다.

### 2단계: 첫 infer — 배열의 요소 타입 꺼내기

```ts
// T가 "무언가의 배열" 모양이면, 그 무언가(E)를 꺼냅니다.
type ElementType<T> = T extends (infer E)[] ? E : never

type A = ElementType<string[]> // 결과: string
type B = ElementType<{ id: number }[]> // 결과: { id: number }
type C = ElementType<number> // 결과: never
```

하나씩 풀어 봅니다.

```text
ElementType<string[]>
= string[] extends (infer E)[] ? E : never
  → string[]을 (E)[] 모양에 맞춰 보니 E 자리에 string이 들어가야 맞음
  → E = string, 조건은 참
= string

ElementType<number>
= number extends (infer E)[] ? E : never
  → number는 배열 모양이 아님 → 조건은 거짓
= never
```

값 레벨 코드와 나란히 놓으면 이렇습니다.

| 값 레벨 | 타입 레벨 |
|---|---|
| `const [first] = items` | `T extends [infer F, ...unknown[]]` |
| `const { total } = order` | `T extends { total: infer V }` |
| 모양이 다르면 `undefined`가 나옴 | 모양이 다르면 거짓 갈래로 감 |
| 꺼낸 값을 변수 `first`로 씀 | 꺼낸 타입을 `F`로 참 갈래에서 씀 |

::: info (infer E)[]의 괄호는 왜 필요할까요?
`infer E[]`라고 쓰면 "E[]라는 타입 전체를 추론"하는 것처럼 읽힐 수 있어 헷갈립니다. 괄호로 `(infer E)`를 감싸 "요소 자리만 추론"이라는 뜻을 분명히 합니다. `Array<infer E>`로 써도 같습니다.
:::

### 3단계: infer는 조건부 타입의 extends 절 안에서만

`infer`는 "모양 맞추기"를 할 때만 의미가 있습니다. 그래서 조건부 타입의 `extends` 오른쪽에만 쓸 수 있습니다.

```ts
type Bad<T> = infer U
// ❌ 'infer' declarations are only permitted in the 'extends' clause of a conditional type. (TS1338)
```

또 꺼낸 이름(`E`, `U` 등)은 **참 갈래에서만** 쓸 수 있습니다. 거짓 갈래는 "모양이 맞지 않았다"는 뜻이니 꺼낸 것이 없기 때문입니다.

### 4단계: ReturnType 직접 만들기

[내장 유틸리티 타입](../part3-intermediate/07-utility-types)에서 쓴 `ReturnType<T>`를 만들어 봅시다. 함수 타입의 모양은 `(매개변수들) => 반환 타입`이므로, 반환 타입 자리에 `infer`를 둡니다.

```ts
// 매개변수는 무엇이든 상관없고, 반환 타입 자리만 꺼냅니다.
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never

function createOrder(memberId: string, total: number) {
  return { orderId: 1001, memberId, total, status: 'pending' as const }
}

type Order = MyReturnType<typeof createOrder>
// 결과: { orderId: number; memberId: string; total: number; status: "pending" }
type N = MyReturnType<() => void> // 결과: void
```

- `typeof createOrder`는 **값**인 함수에서 그 함수의 **타입**을 뽑아 옵니다([keyof · typeof](../part3-intermediate/06-keyof-typeof-indexed)에서 배웠습니다).
- `(...args: any[])`는 "매개변수가 몇 개든, 무슨 타입이든"이라는 뜻입니다. 매개변수에는 관심이 없으므로 가장 넓게 열어 둡니다.
- 반환 타입 자리에 `infer R`을 두었으니, 함수의 반환 타입이 `R`로 꺼내집니다.

이 패턴 덕분에 함수가 돌려주는 객체의 타입을 손으로 다시 쓰지 않아도 됩니다. `createOrder`에 속성을 하나 추가하면 `Order` 타입도 저절로 바뀝니다.

::: tip 왜 unknown[]이 아니라 any[]일까요?
보통은 `any`보다 `unknown`이 안전하다고 배웠습니다. 그런데 여기서 `(...args: unknown[]) => infer R`로 쓰면 `(memberId: string) => ...` 같은 함수가 모양에 맞지 않아 `never`가 나옵니다. 함수 매개변수는 비교 방향이 거꾸로 되는 특이한 성질이 있기 때문인데, 7번 레슨 [변성](./07-variance)에서 자세히 다룹니다. 지금은 "매개변수 자리를 열어 둘 때는 `any[]`를 쓴다"고 기억해 두세요.
:::

### 5단계: Parameters 직접 만들기

이번에는 반대로 매개변수 자리를 꺼냅니다. 나머지 매개변수(`...args`) 자리에 `infer`를 두면 매개변수 전체가 **튜플**로 꺼내집니다.

```ts
type MyParameters<T> = T extends (...args: infer P) => any ? P : never

function cancelOrder(orderId: number, reason: string): boolean {
  return reason.length > 0 && orderId > 0
}

type CancelArgs = MyParameters<typeof cancelOrder> // 결과: [orderId: number, reason: string]
type First = CancelArgs[0] // 결과: number
```

결과의 `[orderId: number, reason: string]`은 **이름 붙은 튜플**(labeled tuple)입니다. 이름은 읽기 좋으라고 붙은 설명일 뿐, 타입으로는 `[number, string]`과 같습니다.

꺼낸 튜플은 다른 함수의 매개변수로 다시 쓸 수 있습니다. 예를 들어 "취소 요청을 기록한 뒤 원래 함수를 부르는" 함수를 만들 때 매개변수 목록을 복사하지 않아도 됩니다.

```ts
function cancelOrder(orderId: number, reason: string): boolean {
  return reason.length > 0 && orderId > 0
}

// cancelOrder와 똑같은 매개변수를 받습니다.
function cancelWithLog(...args: Parameters<typeof cancelOrder>) {
  console.log(`취소 요청: ${args[0]} (${args[1]})`)
  return cancelOrder(...args)
}

console.log(cancelWithLog(1001, '단순 변심')) // 출력: 취소 요청: 1001 (단순 변심)
// 출력: true
```

### 6단계: Promise 안의 타입 꺼내기

비동기 함수는 `Promise<T>`를 돌려줍니다. 화면에서 실제로 쓰는 것은 `T`이므로 상자를 열어야 합니다.

```ts
type UnwrapPromise<T> = T extends Promise<infer V> ? V : T

type A = UnwrapPromise<Promise<string>> // 결과: string
type B = UnwrapPromise<number> // 결과: number
```

이번에는 거짓 갈래에 `never` 대신 `T`를 돌려주었습니다. "Promise가 아니면 이미 열린 상자이니 그대로 쓴다"는 뜻입니다. 거짓 갈래에 무엇을 둘지는 만드는 사람이 용도에 맞게 정합니다.

그런데 Promise가 두 겹이면 어떻게 될까요?

```ts
type UnwrapPromise<T> = T extends Promise<infer V> ? V : T

type C = UnwrapPromise<Promise<Promise<number>>> // 결과: Promise<number>
```

한 겹만 벗겨집니다. 끝까지 벗기려면 꺼낸 `V`에 같은 타입을 **다시** 적용합니다. 자기 자신을 부르는 타입, 즉 **재귀 타입**입니다(5번 레슨 [재귀 타입](./05-recursive-types)에서 자세히 배웁니다).

```ts
// 꺼낸 V가 또 Promise일 수 있으니, MyAwaited를 한 번 더 적용합니다.
type MyAwaited<T> = T extends Promise<infer V> ? MyAwaited<V> : T

type D = MyAwaited<Promise<Promise<number>>> // 결과: number
```

```text
MyAwaited<Promise<Promise<number>>>
= MyAwaited<Promise<number>>      ← 한 겹 벗김, V = Promise<number>
= MyAwaited<number>               ← 또 한 겹 벗김, V = number
= number                          ← Promise 모양이 아니므로 그대로
```

값 레벨로 쓰면 "상자가 있는 동안 계속 연다"는 반복입니다.

```ts
// 값 레벨 비유: { inner: ... }로 겹겹이 싼 상자를 끝까지 엽니다.
type Box = { inner: Box } | string

function unwrap(box: Box): string {
  return typeof box === 'string' ? box : unwrap(box.inner)
}

console.log(unwrap({ inner: { inner: '쿠폰 코드' } })) // 출력: 쿠폰 코드
```

::: info 내장 Awaited는 조금 더 똑똑합니다
TypeScript 4.5부터 있는 내장 `Awaited<T>`는 `Promise`뿐 아니라 `then` 메서드를 가진 객체(thenable)까지 벗기고, `null`·`undefined`도 다룹니다. 원리는 위의 `MyAwaited`와 같습니다. 실무에서는 내장 `Awaited`를 쓰세요.
:::

### 7단계: 실무 조합 — async 함수의 결과 타입

`ReturnType`과 `Awaited`를 함께 쓰면 "비동기 함수가 최종적으로 주는 데이터"의 타입을 얻습니다. API 호출 함수에서 아주 자주 쓰는 조합입니다.

```ts
async function fetchMember(memberId: string) {
  return { memberId, nickname: '단골손님', point: 1200 }
}

type R1 = ReturnType<typeof fetchMember> // 결과: Promise<{ memberId: string; nickname: string; point: number }>
type Member = Awaited<ReturnType<typeof fetchMember>> // 결과: { memberId: string; nickname: string; point: number }
```

안쪽부터 읽습니다. `typeof fetchMember`(함수의 타입) → `ReturnType`(반환 타입 = Promise 상자) → `Awaited`(상자를 열어 내용물). 함수 호출을 `f(g(x))`처럼 안쪽부터 읽는 것과 같습니다.

### 8단계: 결과를 컴파일러에게 검사받기 — Expect와 Equal

지금까지는 `// 결과:` 주석을 보고 마우스를 올려 확인했습니다. 타입이 복잡해지면 눈으로 확인하다 실수하기 쉽습니다. 그래서 타입 레벨 프로그래밍을 하는 사람들은 **결과가 틀리면 컴파일 에러가 나게** 만드는 작은 헬퍼(helper, 도우미 코드)를 씁니다.

```ts
// 두 타입이 완전히 같으면 true, 아니면 false
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false
// true만 받는 타입. false를 넣으면 컴파일 에러가 납니다.
type Expect<T extends true> = T

type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never

// 테스트: 결과가 기대와 같으면 조용히 통과합니다.
type Test1 = Expect<Equal<MyReturnType<() => string>, string>>
type Test2 = Expect<Equal<MyReturnType<(id: number) => boolean>, boolean>>
```

결과가 기대와 다르면 이렇게 에러가 납니다.

```ts
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false
type Expect<T extends true> = T

type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never

type Wrong = Expect<Equal<MyReturnType<() => string>, number>>
// ❌ Type 'false' does not satisfy the constraint 'true'. (TS2344)
```

- `Expect<T extends true>`는 [제네릭 제약](../part3-intermediate/05-generic-constraints)으로 "`true`만 받는다"고 정해 둔 타입입니다. `Equal`이 `false`를 내놓으면 제약을 어겨 에러가 됩니다.
- `Equal`의 생김새는 낯설어도 괜찮습니다. "두 타입이 **정확히** 같은지"를 검사하는 널리 쓰이는 관용구입니다. 단순히 `X extends Y`로 비교하면 `any`나 `readonly` 차이를 놓치기 때문에 이런 모양을 씁니다. 9번 레슨 [type-challenges](./09-type-challenges)에서 다시 만납니다.

::: tip 이 위키의 결과 주석
이 레슨부터 Part 5의 `// 결과:` 주석은 모두 위의 `Expect`·`Equal`로 실제 검사한 값입니다. 여러분도 새 타입을 만들 때 테스트 몇 줄을 함께 적어 두면, 나중에 타입을 고쳤을 때 무엇이 깨졌는지 바로 알 수 있습니다.
:::

### 9단계: infer를 여러 개 쓰기

한 모양 안에 `infer`를 여러 개 두면 여러 부분을 한 번에 꺼냅니다. 값 레벨의 `const [first, ...rest] = items`처럼 튜플의 앞과 나머지를 나눠 봅시다.

```ts
// 튜플의 첫 요소와 나머지를 함께 꺼냅니다.
type SplitFirst<T> = T extends [infer F, ...infer Rest] ? { first: F; rest: Rest } : never

type R = SplitFirst<['아메리카노', '라떼', '모카']>
// 결과: { first: "아메리카노"; rest: ["라떼", "모카"] }

// 마지막 요소: 나머지를 앞에 두고 마지막 자리에 infer를 둡니다.
type Last<T> = T extends [...unknown[], infer L] ? L : never

type L1 = Last<[1, 2, 3]> // 결과: 3
type L2 = Last<[]> // 결과: never
```

`Map`의 키와 값처럼 제네릭 타입의 여러 자리를 한 번에 꺼낼 수도 있습니다.

```ts
type MapEntry<T> = T extends Map<infer K, infer V> ? [K, V] : never

type Stock = Map<string, number> // 상품 코드 → 재고 수량
type E = MapEntry<Stock> // 결과: [string, number]
```

::: info 같은 이름의 infer를 두 번 쓰면?
`T extends { a: infer U; b: infer U } ? U : never`처럼 같은 이름을 두 자리에 쓰면, 두 자리에서 찾은 타입을 **합친 유니온**이 됩니다. `{ a: string; b: number }`를 넣으면 `string | number`가 나옵니다. (함수 매개변수 자리에서 같은 이름을 쓰면 반대로 인터섹션이 됩니다. 7번 레슨 변성과 관련된 성질입니다.)
:::

```ts
type Same<T> = T extends { a: infer U; b: infer U } ? U : never

type S = Same<{ a: string; b: number }> // 결과: string | number
```

### 10단계: infer X extends 제약 (TypeScript 4.7+)

꺼낸 타입이 특정 조건을 만족할 때만 참 갈래로 가고 싶을 때가 있습니다. 예전에는 조건부 타입을 한 번 더 겹쳐야 했습니다.

```ts
// 4.7 이전 방식: 꺼낸 뒤 다시 검사
type FirstStringOld<T> = T extends [infer F, ...unknown[]] ? (F extends string ? F : never) : never

// 4.7부터: infer 자리에 바로 제약을 붙입니다.
type FirstString<T> = T extends [infer F extends string, ...unknown[]] ? F : never

type A = FirstString<['카드', 1000]> // 결과: "카드"
type B = FirstString<[1000, '카드']> // 결과: never
type C = FirstStringOld<['카드', 1000]> // 결과: "카드"
```

`infer F extends string`은 "첫 자리를 F로 꺼내되, F가 string일 때만 모양이 맞은 것으로 친다"는 뜻입니다. 한 줄로 줄어 읽기 쉬워졌고, 참 갈래에서 `F`가 이미 `string`으로 알려져 있어 `Uppercase<F>` 같은 문자열 전용 도구를 바로 쓸 수 있습니다.

이 기능이 특히 빛나는 곳은 **문자열을 숫자 타입으로 바꿀 때**입니다(TypeScript 4.8부터 숫자 리터럴로 추론됩니다).

```ts
// '4500' 같은 문자열 리터럴 타입을 숫자 리터럴 타입 4500으로 바꿉니다.
type ToNumber<S> = S extends `${infer N extends number}` ? N : never

type P1 = ToNumber<'4500'> // 결과: 4500
type P2 = ToNumber<'무료'> // 결과: never
```

`` `${infer N extends number}` ``는 바로 다음 단계에서 볼 **템플릿 리터럴 패턴**입니다. "문자열 전체를 N으로 꺼내되, 숫자로 읽을 수 있을 때만"이라는 뜻입니다.

### 11단계: 문자열에서 infer — 템플릿 리터럴 패턴

`infer`는 문자열 리터럴 타입 안에서도 쓸 수 있습니다. 백틱(`` ` ``)으로 문자열 모양을 그리고, 잘라 낼 부분에 `infer`를 둡니다. 값 레벨의 `split`과 닮았습니다.

```ts
// 값 레벨: 주문 번호를 '-' 기준으로 자릅니다.
const orderNo = 'ORD-20261026-001'
const [prefix, ...rest] = orderNo.split('-')
console.log(prefix) // 출력: ORD
console.log(rest.join('-')) // 출력: 20261026-001

// 타입 레벨: 같은 일을 타입으로 합니다.
type SplitDash<S> = S extends `${infer Head}-${infer Tail}` ? [Head, Tail] : never

type R = SplitDash<'ORD-20261026-001'> // 결과: ["ORD", "20261026-001"]
```

결과를 보면 `Head`는 **첫 번째** `-` 앞까지만 잡았고, 나머지는 모두 `Tail`로 갔습니다. 규칙은 이렇습니다.

```text
`${infer Head}-${infer Tail}`  을  'ORD-20261026-001' 에 맞추기

1) Head는 왼쪽부터 읽다가 처음 만나는 '-' 앞에서 멈춥니다 → 'ORD'
2) 그 '-'를 건너뜁니다
3) 마지막 infer인 Tail은 남은 전부를 가져갑니다 → '20261026-001'
```

`infer` 두 개가 구분 문자 없이 붙어 있으면, 앞의 것이 **한 글자**만 가져갑니다.

```ts
type FirstChar<S> = S extends `${infer F}${infer _Rest}` ? F : never

type F1 = FirstChar<'라떼'> // 결과: "라"
type F2 = FirstChar<''> // 결과: never
```

빈 문자열은 첫 글자가 없으니 모양이 맞지 않아 `never`가 됩니다. 템플릿 리터럴 타입은 4번 레슨 [템플릿 리터럴 타입](./04-template-literal-types)에서 본격적으로 다루며, 거기서 URL 경로의 매개변수 이름까지 꺼내 봅니다.

### 12단계: 객체에서 꺼내기

객체 모양에도 `infer`를 둘 수 있습니다. 서버 응답이 `{ data: ... }`로 감싸져 오는 경우, 안쪽 데이터 타입만 꺼내는 예입니다.

```ts
type ApiResponse<T> = { success: boolean; data: T }

type OrderListResponse = ApiResponse<{ orderId: number; total: number }[]>

// data 자리의 타입을 꺼냅니다.
type DataOf<R> = R extends { data: infer D } ? D : never

type Orders = DataOf<OrderListResponse> // 결과: { orderId: number; total: number }[]
type OneOrder = ElementOf<Orders> // 결과: { orderId: number; total: number }

type ElementOf<T> = T extends readonly (infer E)[] ? E : never
```

물론 이 경우는 [인덱스 접근 타입](../part3-intermediate/06-keyof-typeof-indexed) `OrderListResponse['data']`로도 꺼낼 수 있습니다. `infer`가 필요한 때는 **위치가 이름으로 정해지지 않을 때**입니다. 함수의 반환 타입, Promise의 내용물, 튜플의 마지막 요소, 문자열의 일부분처럼 "속성 이름으로 가리킬 수 없는 자리"를 꺼낼 때 `infer`를 씁니다.

(타입 별칭은 선언 순서와 상관없이 쓸 수 있어서, `ElementOf`를 아래쪽에 선언해도 동작합니다.)

## 자주 하는 실수

### 실수 1: 조건부 타입 밖에서 infer를 씀

```ts
type ItemOf<T extends (infer E)[]> = E
// ❌ 'infer' declarations are only permitted in the 'extends' clause of a conditional type. (TS1338)
// ❌ Cannot find name 'E'. (TS2304)
```

**왜 틀렸나**: 제네릭 제약의 `extends`는 조건부 타입이 아닙니다. 그래서 `infer E` 자체가 에러이고, `E`라는 이름도 만들어지지 않아 두 번째 에러가 함께 납니다. `infer`는 "모양이 맞는지 시험해 보는" 조건부 타입의 `extends ... ?` 안에서만 쓸 수 있습니다.

**고친 코드**:

```ts
type ItemOf<T> = T extends (infer E)[] ? E : never

type R = ItemOf<string[]> // 결과: string
```

### 실수 2: 함수 값을 그대로 타입 자리에 넣음

```ts
function createCoupon(rate: number) {
  return { code: 'WELCOME', rate }
}

type Coupon = ReturnType<createCoupon>
// ❌ 'createCoupon' refers to a value, but is being used as a type here. Did you mean 'typeof createCoupon'? (TS2749)
```

**왜 틀렸나**: `createCoupon`은 **값**(실행되는 함수)입니다. 타입 자리에는 타입만 올 수 있습니다. 에러 메시지가 친절하게 `typeof`를 쓰라고 알려 줍니다.

**고친 코드**:

```ts
function createCoupon(rate: number) {
  return { code: 'WELCOME', rate }
}

type Coupon = ReturnType<typeof createCoupon> // 결과: { code: string; rate: number }
```

### 실수 3: 매개변수 자리를 unknown[]로 막음

```ts
type MyReturnType<T> = T extends (...args: unknown[]) => infer R ? R : never

declare function getStock(productCode: string): number

type R = MyReturnType<typeof getStock> // 결과: never
```

**왜 틀렸나**: `(productCode: string) => number`는 "아무 인수나 받는 함수" 자리에 들어가지 못합니다. `unknown` 인수를 넘겨받으면 `string`만 다룰 줄 아는 함수가 곤란해지기 때문입니다(7번 레슨 변성). 그래서 모양이 맞지 않아 거짓 갈래의 `never`가 나왔습니다. 에러 없이 조용히 `never`가 나오므로 알아차리기 어렵습니다.

**고친 코드**: 매개변수 자리는 `any[]`로 엽니다. 내장 `ReturnType`도 이렇게 되어 있습니다.

```ts
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never

declare function getStock(productCode: string): number

type R = MyReturnType<typeof getStock> // 결과: number
```

### 실수 4: readonly 배열(as const)에서 요소를 못 꺼냄

```ts
type ElementType<T> = T extends (infer E)[] ? E : never

const payMethods = ['card', 'cash', 'point'] as const
type PayMethod = ElementType<typeof payMethods> // 결과: never
```

**왜 틀렸나**: `as const`를 붙인 배열은 `readonly ["card", "cash", "point"]` 타입입니다. 읽기 전용 배열은 일반 배열 `E[]` 모양에 들어가지 않습니다(일반 배열은 `push`가 되는데 읽기 전용은 안 되니까요).

**고친 코드**: 모양을 `readonly (infer E)[]`로 넓힙니다. 일반 배열은 읽기 전용 배열 자리에 들어가므로 두 경우를 모두 받습니다.

```ts
type ElementType<T> = T extends readonly (infer E)[] ? E : never

const payMethods = ['card', 'cash', 'point'] as const
type PayMethod = ElementType<typeof payMethods> // 결과: "card" | "cash" | "point"
type Plain = ElementType<number[]> // 결과: number
```

::: tip 더 짧은 방법
배열 요소 타입은 인덱스 접근 타입으로 `(typeof payMethods)[number]`라고 써도 됩니다. "아무 숫자 인덱스로 꺼낸 값의 타입"이라는 뜻입니다.
:::

## 직접 해 보기

### 문제 1 ⭐ PromiseValue

`Promise<T>`에서 `T`를 꺼내는 `PromiseValue<T>`를 만드세요. Promise가 아니면 `never`입니다. 한 겹만 벗기면 됩니다.

::: details 정답 보기

```ts
type PromiseValue<T> = T extends Promise<infer V> ? V : never

type R1 = PromiseValue<Promise<{ orderId: number }>> // 결과: { orderId: number }
type R2 = PromiseValue<string> // 결과: never
```
:::

### 문제 2 ⭐ 첫 번째 매개변수

함수의 **첫 번째 매개변수** 타입을 꺼내는 `FirstArg<F>`를 만드세요. 매개변수가 없으면 `never`입니다.

::: details 정답 보기

```ts
type FirstArg<F> = F extends (first: infer A, ...rest: any[]) => any ? A : never

declare function addToCart(productCode: string, quantity: number): void

type R1 = FirstArg<typeof addToCart> // 결과: string
type R2 = FirstArg<() => void> // 결과: unknown
```

`R2`가 `never`가 아니라 `unknown`인 점에 주목하세요. 매개변수가 없는 함수도 "첫 매개변수를 받는 함수" 자리에 들어갈 수 있고(인수를 무시하면 그만이니까요), 이때 꺼낼 단서가 없어 `unknown`이 됩니다. 정확히 `never`를 원하면 `Parameters`의 튜플을 이용합니다.

```ts
type FirstArg2<F> = F extends (...args: infer P) => any ? (P extends [infer A, ...unknown[]] ? A : never) : never

type R3 = FirstArg2<() => void> // 결과: never
type R4 = FirstArg2<(code: string) => void> // 결과: string
```
:::

### 문제 3 ⭐⭐ 마지막 요소와 앞부분

튜플에서 마지막 요소를 뺀 앞부분을 꺼내는 `Pop<T>`를 만드세요. 예: `Pop<[1, 2, 3]>`은 `[1, 2]`. 빈 튜플이면 `[]`를 돌려줍니다.

::: details 정답 보기

```ts
type Pop<T extends unknown[]> = T extends [...infer Front, unknown] ? Front : []

type R1 = Pop<['주문', '결제', '배송']> // 결과: ["주문", "결제"]
type R2 = Pop<[]> // 결과: []
```

마지막 자리에는 꺼낼 필요가 없으므로 `infer` 없이 `unknown`만 두었습니다. 값 레벨의 `items.slice(0, -1)`과 같은 일입니다.
:::

### 문제 4 ⭐⭐ Map의 값 타입

`Map<K, V>`에서 값 타입 `V`만 꺼내는 `MapValue<M>`를 만들고, `Map<string, { name: string; price: number }>`에 적용해 보세요.

::: details 정답 보기

```ts
type MapValue<M> = M extends Map<unknown, infer V> ? V : never

type Catalog = Map<string, { name: string; price: number }>
type Product = MapValue<Catalog> // 결과: { name: string; price: number }
```

키 자리는 꺼낼 필요가 없으므로 `unknown`을 두었습니다. 어떤 키 타입이든 `unknown` 자리에 들어갈 수 있습니다.
:::

### 문제 5 ⭐⭐ 이벤트 이름 쪼개기

`'order:created'`처럼 `:`로 이어진 이벤트 이름을 `{ domain: 'order'; action: 'created' }` 모양으로 바꾸는 `ParseEvent<S>`를 만드세요.

::: details 정답 보기

```ts
type ParseEvent<S> = S extends `${infer D}:${infer A}` ? { domain: D; action: A } : never

type E1 = ParseEvent<'order:created'> // 결과: { domain: "order"; action: "created" }
type E2 = ParseEvent<'login'> // 결과: never
```
:::

### 문제 6 ⭐⭐⭐ 가격 문자열을 숫자로

`'4500원'`처럼 숫자 뒤에 `원`이 붙은 문자열 리터럴 타입에서 숫자 리터럴 타입 `4500`을 꺼내는 `PriceOf<S>`를 만드세요. `원`이 없거나 숫자가 아니면 `never`입니다. (TypeScript 4.8 이상)

::: details 정답 보기

```ts
type PriceOf<S> = S extends `${infer N extends number}원` ? N : never

type P1 = PriceOf<'4500원'> // 결과: 4500
type P2 = PriceOf<'4500'> // 결과: never
type P3 = PriceOf<'무료원'> // 결과: never
```

`infer N extends number`가 "숫자로 읽을 수 있는 부분만" 꺼내 주고, 뒤에 붙은 `원`은 모양의 일부로 맞춰 봅니다. 꺼낸 결과가 문자열 `'4500'`이 아니라 숫자 `4500`이라는 점이 핵심입니다.
:::

## 확인 퀴즈

1. `infer`를 쓸 수 있는 위치는 어디인가요?
2. `MyReturnType`에서 매개변수 자리를 `unknown[]`가 아니라 `any[]`로 여는 이유는 무엇인가요?
3. `` `${infer A}-${infer B}` ``를 `'a-b-c'`에 맞추면 `A`와 `B`는 각각 무엇이 되나요?
4. `Awaited<ReturnType<typeof fetchMember>>`를 안쪽부터 읽어 보세요.
5. `infer F extends string`은 TypeScript 몇 버전부터 쓸 수 있고, 어떤 뜻인가요?

::: details 정답 보기

1. 조건부 타입의 `extends` 오른쪽(모양을 그리는 곳)에서만 쓸 수 있고, 꺼낸 이름은 참 갈래에서만 쓸 수 있습니다.
2. 매개변수 타입이 구체적인 함수(`(code: string) => ...`)는 `unknown`을 받는 함수 모양에 들어가지 않아 결과가 `never`가 되기 때문입니다.
3. `A`는 첫 `-` 앞의 `'a'`, `B`는 나머지 전부인 `'b-c'`입니다.
4. 함수 값의 타입(`typeof fetchMember`) → 그 반환 타입인 Promise(`ReturnType`) → Promise를 연 내용물(`Awaited`) 순서입니다.
5. TypeScript 4.7부터입니다. "그 자리를 F로 꺼내되, F가 string일 때만 모양이 맞은 것으로 본다"는 뜻입니다.
:::

## 정리

- `infer X`는 조건부 타입의 `extends` 오른쪽에 그린 **모양 안의 빈자리**입니다. 컴파일러가 실제 타입을 맞춰 보고 그 자리를 채워 줍니다. 값 레벨의 구조 분해와 같은 발상입니다.
- 함수 반환 타입(`ReturnType`), 매개변수 튜플(`Parameters`), Promise 내용물(`Awaited`), 배열 요소 타입은 모두 `infer` 한 줄로 만들 수 있습니다.
- 매개변수 자리를 열어 둘 때는 `any[]`, 읽기 전용 배열까지 받으려면 `readonly (infer E)[]`를 씁니다.
- 한 모양에 `infer`를 여러 개 두어 여러 부분을 한 번에 꺼낼 수 있습니다.
- `infer X extends 제약`(4.7+)으로 꺼낸 타입을 바로 제한하고, 템플릿 리터럴 안에서 숫자로 바꿀 수 있습니다(4.8+).
- 문자열 패턴에서 앞쪽 `infer`는 처음 만나는 구분 문자까지, 마지막 `infer`는 나머지 전부를 가져갑니다.
- `Expect`·`Equal` 헬퍼로 타입의 결과를 컴파일러에게 검사받는 습관을 들이세요.

## 다음 단계

[매핑된 타입과 키 재매핑(as)](./03-mapped-types)에서는 타입 레벨의 `for` 루프를 배웁니다. 객체 타입의 속성을 하나씩 돌며 모두 선택 속성으로 바꾸거나, 이름을 바꾸거나, 특정 속성만 걸러 내는 타입을 직접 만들어 봅니다.
