---
title: 사용자 정의 타입 가드 · assertion 함수 · satisfies
---

# 사용자 정의 타입 가드 · assertion 함수 · satisfies

<LessonMeta level="고급" :minutes="50" prev="재귀 타입으로 트리·JSON·DeepReadonly를 만들었습니다" />

## 이번에 배울 것

- `value is T` 반환 타입으로 **사용자 정의 타입 가드**를 만들어, 직접 작성한 검사 함수로 타입을 좁힐 수 있다.
- `asserts value is T`와 `asserts value`로 "통과하지 못하면 예외를 던지는" assertion 함수를 만들 수 있다.
- `satisfies`(TypeScript 4.9+)와 타입 표기(`: T`), 타입 단언(`as T`)의 차이를 표로 설명할 수 있다.
- 배열 `filter`에서 타입이 좁혀지는 경우와 그렇지 않은 경우를 구분할 수 있다(TypeScript 5.5의 추론된 타입 술어).
- 타입 가드가 "거짓말"을 할 때 생기는 위험을 알고 피할 수 있다.

## 먼저 알아 둘 것

- [타입 좁히기(Narrowing)](../part2-types/08-narrowing) — `typeof`·`in`·`instanceof`로 좁히기
- [타입 단언(as)과 non-null 단언(!)](../part2-types/10-assertion)
- [판별 유니온과 완전성 검사](../part3-intermediate/03-discriminated-union)
- [런타임 검증: 타입은 실행 중에 사라진다 (zod)](../part4-async/05-runtime-validation)

## 비유로 이해하기

매장 입구에 **검표원**이 있습니다.

- **보통 검표원**(`typeof`, `in` 같은 내장 좁히기)은 정해진 몇 가지만 확인할 줄 압니다. "이건 종이 표군요", "이건 숫자가 적혀 있군요."
- **사용자 정의 타입 가드**는 우리가 직접 교육한 검표원입니다. "VIP 회원증은 금색이고, 회원 번호가 V로 시작하고, 만료일이 지나지 않았어야 해요." 이 검표원이 "VIP 맞습니다"라고 말하면, 컴파일러는 그 말을 **믿고** 그 손님을 VIP로 대합니다.
- **assertion 함수**는 더 엄격한 검표원입니다. 확인해 보고 맞지 않으면 대답 대신 **입장을 막아 버립니다**(예외를 던집니다). 그래서 그 검표원을 통과해 들어온 사람은 모두 조건에 맞는다고 확신할 수 있습니다.
- **satisfies**는 검표가 아니라 **규격 검사**입니다. "이 상자가 택배 규격에 맞는지만 확인해 주세요. 그렇다고 상자 라벨을 '택배 상자'로 바꿔 붙이지는 말고요." 규격은 검사하되 원래의 자세한 정보는 그대로 둡니다.

핵심은 **믿음**입니다. 컴파일러는 우리가 만든 검표원의 판단을 믿습니다. 그래서 검표원을 잘못 교육하면(검사 로직이 틀리면) 컴파일러도 함께 속습니다.

## 개념 설명

### 1단계: 내장 좁히기의 한계

[타입 좁히기](../part2-types/08-narrowing)에서 `typeof`나 `in`으로 `if` 안의 타입을 좁혔습니다.

```ts
function printPrice(price: number | string) {
  if (typeof price === 'number') {
    console.log(price.toLocaleString('ko-KR')) // 여기서 price는 number
  } else {
    console.log(price) // 여기서 price는 string
  }
}
printPrice(4500) // 출력: 4,500
```

그런데 검사 로직을 **함수로 빼면** 좁히기가 사라집니다(TypeScript 5.5 이전, 또는 로직이 복잡할 때).

```ts
type Product = { code: string; name: string; price: number }

// 여러 조건을 확인하는 함수. 반환 타입은 그냥 boolean입니다.
function checkProduct(value: unknown): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'price' in value &&
    typeof value.price === 'number'
  )
}

const data: unknown = JSON.parse('{"code":"P001","name":"아메리카노","price":4500}')
if (checkProduct(data)) {
  console.log(data.price)
  // ❌ 'data' is of type 'unknown'. (TS18046)
}
```

`checkProduct`가 `true`를 돌려줘도 컴파일러는 "그래서 `data`가 무슨 타입이라는 거지?"를 모릅니다. 반환 타입이 그냥 `boolean`이기 때문입니다.

### 2단계: 사용자 정의 타입 가드 — value is T

반환 타입 자리에 `매개변수 is 타입`을 쓰면, "이 함수가 `true`를 돌려주면 그 매개변수는 그 타입이다"라고 컴파일러에게 알려 줄 수 있습니다. 이런 반환 타입을 **타입 술어**(type predicate)라고 부르고, 그런 함수를 **사용자 정의 타입 가드**(user-defined type guard)라고 합니다.

```ts
type Product = { code: string; name: string; price: number }

function isProduct(value: unknown): value is Product {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    typeof value.code === 'string' &&
    'name' in value &&
    typeof value.name === 'string' &&
    'price' in value &&
    typeof value.price === 'number'
  )
}

const data: unknown = JSON.parse('{"code":"P001","name":"아메리카노","price":4500}')

if (isProduct(data)) {
  console.log(`${data.name} ${data.price}원`) // 출력: 아메리카노 4500원
}
```

- `value is Product`: "`true`를 돌려주면 `value`는 `Product`다."
- 함수 몸체는 평범하게 `boolean`을 돌려줍니다. 타입 술어는 **함수를 부른 쪽**에서 좁히기로 쓰입니다.
- `false`를 돌려주면 `else` 쪽에서는 반대로 좁혀집니다(유니온에서 `Product`를 뺀 나머지).

```ts
type CardPayment = { method: 'card'; cardNo: string; installment: number }
type CashPayment = { method: 'cash'; received: number }
type Payment = CardPayment | CashPayment

function isCard(payment: Payment): payment is CardPayment {
  return payment.method === 'card'
}

function describe(payment: Payment) {
  if (isCard(payment)) {
    return `카드 ${payment.installment}개월` // payment: CardPayment
  }
  return `현금 ${payment.received}원 받음` // payment: CashPayment
}

console.log(describe({ method: 'cash', received: 10000 })) // 출력: 현금 10000원 받음
```

값 레벨과 타입 레벨이 한 함수에서 만나는 모습입니다.

| 값 레벨 (실행 중) | 타입 레벨 (컴파일 중) |
|---|---|
| `isCard(payment)`가 `true`를 돌려줌 | `if` 안에서 `payment`는 `CardPayment` |
| `isCard(payment)`가 `false`를 돌려줌 | `else` 쪽에서 `payment`는 `CashPayment` |
| 검사 로직(`payment.method === 'card'`) | 타입 술어(`payment is CardPayment`) |

### 3단계: 타입 가드는 "믿음"입니다

컴파일러는 타입 가드의 **몸체가 정말 맞게 검사하는지 확인하지 않습니다**. 반환 타입에 적힌 약속을 그대로 믿습니다.

```ts
type Member = { memberId: string; point: number }

// 거짓말하는 타입 가드: 아무것도 확인하지 않습니다.
function isMember(value: unknown): value is Member {
  return true
}

const data: unknown = { memberId: 'M01' } // point가 없습니다!
if (isMember(data)) {
  console.log(data.point + 100) // 출력: NaN
}
```

컴파일 에러는 하나도 없지만 실행 결과는 `NaN`(숫자가 아님)입니다. `undefined + 100`이 계산되었기 때문입니다. 타입 가드는 [타입 단언(as)](../part2-types/10-assertion)과 같은 정도로 위험할 수 있다는 점을 기억하세요. 검사 로직은 꼼꼼하게, 그리고 테스트로 확인해야 합니다.

::: tip 검사 로직을 손으로 쓰기 번거롭다면
필드가 많은 객체의 타입 가드를 손으로 쓰면 빠뜨리기 쉽습니다. 4부에서 배운 [zod](../part4-async/05-runtime-validation) 같은 검증 라이브러리는 스키마 하나로 검사 로직과 타입을 함께 만들어 주므로 "거짓말하는 가드"가 생길 틈이 줄어듭니다.
:::

### 4단계: assertion 함수 — asserts value is T

타입 가드는 `if`와 함께 써야 했습니다. 그런데 "조건에 맞지 않으면 더 진행할 이유가 없다"는 경우가 많습니다. 그럴 때는 **맞지 않으면 예외를 던지는** 함수를 만들고, 반환 타입에 `asserts 매개변수 is 타입`을 씁니다. 이런 함수를 **assertion 함수**(단언 함수)라고 합니다(TypeScript 3.7+).

```ts
type Member = { memberId: string; point: number }

function assertMember(value: unknown): asserts value is Member {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('memberId' in value) ||
    typeof value.memberId !== 'string' ||
    !('point' in value) ||
    typeof value.point !== 'number'
  ) {
    throw new Error('회원 데이터 형식이 올바르지 않습니다')
  }
}

const data: unknown = JSON.parse('{"memberId":"M01","point":1200}')

assertMember(data)
// 여기부터 data는 Member입니다. if가 필요 없습니다.
console.log(data.point + 100) // 출력: 1300
```

| | 타입 가드 `value is T` | assertion 함수 `asserts value is T` |
|---|---|---|
| 반환값 | `boolean` | 없음(`void`), 실패하면 예외 |
| 쓰는 모양 | `if (isMember(x)) { ... }` | `assertMember(x)` 다음 줄부터 |
| 좁혀지는 범위 | `if` 블록 안 | 호출한 줄 **아래 전부** |
| 어울리는 상황 | 맞을 때와 아닐 때 모두 처리 | 아니면 진행할 수 없을 때 |

실패 경우도 확인해 봅시다.

```ts
type Member = { memberId: string; point: number }

function assertMember(value: unknown): asserts value is Member {
  if (typeof value !== 'object' || value === null || !('memberId' in value) || !('point' in value)) {
    throw new Error('회원 데이터 형식이 올바르지 않습니다')
  }
}

try {
  assertMember({ memberId: 'M01' })
} catch (error) {
  console.log((error as Error).message) // 출력: 회원 데이터 형식이 올바르지 않습니다
}
```

### 5단계: asserts value — 조건 자체를 단언

`is T` 없이 `asserts 매개변수`만 쓰면 "이 함수가 정상적으로 끝나면 그 매개변수는 **참 같은 값**(truthy)이다"라는 뜻이 됩니다. Node.js의 `assert` 함수가 이런 모양입니다.

```ts
function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

type Order = { orderId: number; couponCode?: string }

function applyCoupon(order: Order) {
  assert(order.couponCode, '쿠폰 코드가 없습니다')
  // 여기부터 order.couponCode는 string (undefined가 빠짐)
  return order.couponCode.toUpperCase()
}

console.log(applyCoupon({ orderId: 1001, couponCode: 'welcome10' })) // 출력: WELCOME10
```

`assert(order.couponCode, ...)`를 통과했다는 것은 `couponCode`가 `undefined`가 아니었다는 뜻이므로, 다음 줄에서 `.toUpperCase()`를 바로 쓸 수 있습니다. `assert(typeof x === 'string', ...)`처럼 **조건식**을 넘겨도 그 조건대로 좁혀집니다.

```ts
function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function parseQty(input: unknown) {
  assert(typeof input === 'number', '수량은 숫자여야 합니다')
  return input * 2 // input: number
}
console.log(parseQty(3)) // 출력: 6
```

### 6단계: satisfies — 규격만 검사하고 타입은 그대로 (TypeScript 4.9+)

이번에는 반대 방향의 문제입니다. 객체를 만들 때 "이 규격에 맞는지 검사는 받고 싶은데, **자세한 타입 정보는 잃고 싶지 않은** 경우"가 있습니다. POS 화면의 경로 표를 예로 들어 보겠습니다.

```ts
// 방법 1: 타입 표기(: T)
const routes1: Record<string, string> = {
  home: '/',
  orders: '/orders',
  settings: '/settings',
}

routes1.ordrs // 오타인데 에러가 나지 않습니다! (아무 문자열 키나 허용되므로)
console.log(routes1.ordrs) // 출력: undefined
```

타입 표기를 하면 변수의 타입이 **딱 `Record<string, string>`이 되어**, 어떤 키가 있었는지 정보가 사라집니다. 그래서 오타를 잡지 못합니다. 표기를 빼면 오타는 잡지만, 이번에는 값이 문자열인지 검사를 받지 못합니다.

`satisfies`는 두 가지를 모두 해 줍니다.

```ts
const routes = {
  home: '/',
  orders: '/orders',
  settings: '/settings',
} satisfies Record<string, string>

routes.ordrs
// ❌ Property 'ordrs' does not exist on type '{ home: string; orders: string; settings: string; }'. Did you mean 'orders'? (TS2551)
```

- 객체가 `Record<string, string>` 규격에 맞는지 **검사합니다**. 값에 숫자를 넣으면 에러가 납니다.
- 그러나 변수의 타입은 **원래 추론된 모양**(`{ home: string; orders: string; settings: string }`)을 그대로 유지합니다. 그래서 오타를 잡습니다.

```ts
const badRoutes = {
  home: '/',
  orders: 404,
  // ❌ Type 'number' is not assignable to type 'string'. (TS2322)
} satisfies Record<string, string>
```

### 7단계: satisfies · 타입 표기 · as 비교

세 가지를 한 표로 정리합니다.

| | `const x: T = 값` | `const x = 값 satisfies T` | `const x = 값 as T` |
|---|---|---|---|
| 규격 검사 | 함 | 함 | 거의 안 함(아주 동떨어진 경우만 에러) |
| 변수의 타입 | `T` | 값에서 추론된 타입 | `T` |
| 세부 정보(키·리터럴) | 잃음 | 유지 | 잃음 |
| 빠진 속성 | 에러 | 에러 | **에러 없음** |
| 도입 버전 | 처음부터 | 4.9+ | 처음부터 |
| 주로 쓰는 곳 | 변수·매개변수의 계약을 정할 때 | 설정·상수 객체를 검사할 때 | 컴파일러보다 내가 더 잘 알 때(드물게) |

`as`가 위험한 이유를 직접 확인해 봅시다.

```ts
type Member = { memberId: string; nickname: string }

const m1 = {} as Member // 에러 없음! 속성이 하나도 없는데도 통과합니다
console.log(m1.nickname) // 출력: undefined

const m2 = { memberId: 1 } as Member
// ❌ Conversion of type '{ memberId: number; }' to type 'Member' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first. (TS2352)
```

`as`는 "두 타입이 어느 정도 겹치기만 하면" 통과시킵니다. 빈 객체 `{}`는 `Member`와 겹친다고 보아 그냥 넘어갑니다. 반면 `satisfies`나 타입 표기는 빠진 속성을 바로 잡아 줍니다.

```ts
type Member = { memberId: string; nickname: string }

const m3 = { memberId: 'M01' } satisfies Member
// ❌ Type '{ memberId: string; }' does not satisfy the expected type 'Member'. (TS1360)
//    Property 'nickname' is missing in type '{ memberId: string; }' but required in type 'Member'.
```

::: tip satisfies와 as const를 함께
`as const`와 함께 쓰면 "값을 리터럴 그대로 고정 + 규격 검사"를 한 번에 할 수 있습니다.

```ts
const payMethods = ['card', 'cash', 'point'] as const satisfies readonly string[]
type PayMethod = (typeof payMethods)[number] // 결과: "card" | "cash" | "point"
```
:::

### 8단계: 배열 filter와 타입 가드

배열의 `filter` 메서드는 타입 가드를 콜백으로 받으면 결과 배열의 타입을 좁혀 줍니다.

```ts
type Product = { code: string; price: number }

const cart: (Product | null)[] = [{ code: 'P001', price: 4500 }, null, { code: 'P002', price: 5000 }]

// 콜백이 타입 가드이므로, 결과는 Product[]입니다.
const products = cart.filter((item): item is Product => item !== null)
console.log(products.length) // 출력: 2
```

그리고 **TypeScript 5.5부터는** 콜백에 `item is Product`를 적지 않아도, 컴파일러가 함수 몸체를 보고 타입 술어를 **스스로 추론**합니다(inferred type predicates). 이 위키의 기준 버전(5.6)에서 확인해 봅시다.

```ts
type Product = { code: string; price: number }

const cart: (Product | null)[] = [{ code: 'P001', price: 4500 }, null]

const products = cart.filter((item) => item !== null) // 결과: Product[]
const prices = [4500, undefined, 5000].filter((price) => price !== undefined) // 결과: number[]
```

5.4 이전에는 둘 다 `(Product | null)[]`, `(number | undefined)[]`로 남아 직접 타입 가드를 적어야 했습니다. 일반 함수 선언에도 추론이 적용됩니다.

```ts
// 반환 타입을 적지 않았지만 5.5부터 (value: unknown) => value is string 으로 추론됩니다.
function isText(value: unknown) {
  return typeof value === 'string'
}

const mixed: unknown[] = ['라떼', 4500, '모카']
const texts = mixed.filter(isText) // 결과: string[]
console.log(texts) // 출력: [ '라떼', '모카' ]
```

### 9단계: 추론되지 않는 경우

추론된 타입 술어는 "`true`이면 그 타입, **`false`이면 그 타입이 아님**"이 둘 다 성립할 때만 만들어집니다. 그렇지 않으면 추론하지 않고 `boolean`으로 남깁니다.

```ts
const qtys = [3, undefined, 0, 5]

const a = qtys.filter((q) => q !== undefined) // 결과: number[]
const b = qtys.filter((q) => !!q) // 결과: (number | undefined)[]
const c = qtys.filter(Boolean) // 결과: (number | undefined)[]

console.log(a) // 출력: [ 3, 0, 5 ]
console.log(b) // 출력: [ 3, 5 ]
```

`b`가 좁혀지지 않은 이유는 `0` 때문입니다. `!!q`가 `false`라고 해서 `q`가 `undefined`라고 할 수 없습니다(숫자 `0`도 `false`). "거짓이면 그 타입이 아님"이 성립하지 않으므로 컴파일러가 술어를 만들지 않았습니다. 실제로 결과에서 `0`이 빠진 것도 볼 수 있습니다. 의도한 것이 "`undefined`만 빼기"였다면 `!!q`는 버그였던 셈입니다.

`filter(Boolean)`은 `Boolean` 함수의 타입이 술어가 아니라서 좁혀지지 않습니다.

## 자주 하는 실수

### 실수 1: 타입 가드의 검사를 대충 함

```ts
type Coupon = { code: string; rate: number }

function isCoupon(value: unknown): value is Coupon {
  return typeof value === 'object' && value !== null && 'code' in value // rate는 확인 안 함
}

const raw: unknown = { code: 'WELCOME' }
if (isCoupon(raw)) {
  console.log(raw.rate.toFixed(1))
}
```

**왜 틀렸나**: 컴파일은 되지만 실행하면 `raw.rate`가 `undefined`라서 `TypeError`로 프로그램이 멈춥니다. 컴파일러는 타입 가드의 약속을 믿을 뿐 검사 내용을 확인하지 않습니다.

**고친 코드**: 타입의 **모든 필수 속성과 그 타입**을 확인합니다.

```ts
type Coupon = { code: string; rate: number }

function isCoupon(value: unknown): value is Coupon {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    typeof value.code === 'string' &&
    'rate' in value &&
    typeof value.rate === 'number'
  )
}

const raw: unknown = { code: 'WELCOME' }
console.log(isCoupon(raw)) // 출력: false
```

### 실수 2: 화살표 함수로 만든 assertion 함수를 타입 표기 없이 씀

```ts
const assertDefined = (value: unknown): asserts value => {
  if (value === undefined || value === null) throw new Error('값이 없습니다')
}

declare const storeName: string | undefined
assertDefined(storeName)
// ❌ Assertions require every name in the call target to be declared with an explicit type annotation. (TS2775)
```

**왜 틀렸나**: assertion 함수는 호출하는 이름(여기서는 변수 `assertDefined`)에 **명시적인 타입**이 있어야 동작합니다. 화살표 함수를 `const`에 담기만 하면 변수의 타입이 "추론된" 것이라 규칙에 어긋납니다.

**고친 코드**: `function` 선언으로 만들거나, 변수에 타입을 표기합니다.

```ts
function assertDefined(value: unknown): asserts value {
  if (value === undefined || value === null) throw new Error('값이 없습니다')
}

declare const storeName: string | undefined
assertDefined(storeName)
const upper = storeName.toUpperCase() // storeName: string
```

### 실수 3: satisfies 대신 타입 표기를 써서 키 정보를 잃음

```ts
type MenuItem = { name: string; price: number }

const menu: Record<string, MenuItem> = {
  americano: { name: '아메리카노', price: 4500 },
  latte: { name: '카페라떼', price: 5000 },
}

type MenuKey = keyof typeof menu // 결과: string
```

**왜 틀렸나**: 타입 표기 때문에 `menu`의 타입이 `Record<string, MenuItem>`으로 고정되어, `'americano' | 'latte'`라는 키 정보가 사라졌습니다.

**고친 코드**: `satisfies`로 규격 검사만 받고 추론된 타입은 유지합니다.

```ts
type MenuItem = { name: string; price: number }

const menu = {
  americano: { name: '아메리카노', price: 4500 },
  latte: { name: '카페라떼', price: 5000 },
} satisfies Record<string, MenuItem>

type MenuKey = keyof typeof menu // 결과: "americano" | "latte"
```

### 실수 4: as로 빈 객체를 만들고 채우기를 잊음

```ts
type Receipt = { orderId: number; total: number; printedAt: string }

const receipt = {} as Receipt
receipt.orderId = 1001
receipt.total = 9500
// printedAt을 깜빡했지만 에러가 없습니다
console.log(receipt.printedAt.length)
```

**왜 틀렸나**: `{} as Receipt`는 "이건 Receipt라고 믿어 줘"라는 단언이라, 빠진 속성을 검사하지 않습니다. 실행하면 `undefined.length`에서 멈춥니다.

**고친 코드**: 값을 한 번에 만들면서 타입 표기(또는 `satisfies`)로 검사를 받습니다.

```ts
type Receipt = { orderId: number; total: number; printedAt: string }

const receipt: Receipt = { orderId: 1001, total: 9500, printedAt: '2026-10-26 14:30' }
console.log(receipt.printedAt.length) // 출력: 16
```

## 직접 해 보기

### 문제 1 ⭐ 문자열 배열 가드

`unknown` 값이 "문자열만 담은 배열"인지 검사하는 `isStringArray(value: unknown): value is string[]`를 만드세요.

::: details 정답 보기

```ts
function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

const tags: unknown = ['신메뉴', '추천']
if (isStringArray(tags)) {
  console.log(tags.join(', ')) // 출력: 신메뉴, 추천
}
```
:::

### 문제 2 ⭐ 판별 유니온 가드

주문 이벤트 `{ type: 'created'; orderId: number } | { type: 'cancelled'; orderId: number; reason: string }`에서 취소 이벤트인지 확인하는 `isCancelled` 타입 가드를 만드세요.

::: details 정답 보기

```ts
type OrderEvent = { type: 'created'; orderId: number } | { type: 'cancelled'; orderId: number; reason: string }

function isCancelled(event: OrderEvent): event is Extract<OrderEvent, { type: 'cancelled' }> {
  return event.type === 'cancelled'
}

const event: OrderEvent = { type: 'cancelled', orderId: 1001, reason: '품절' }
if (isCancelled(event)) {
  console.log(event.reason) // 출력: 품절
}
```

술어 타입을 1번 레슨의 `Extract`로 만들어, 유니온에서 해당 갈래를 직접 다시 쓰지 않았습니다. 사실 판별 유니온은 `if (event.type === 'cancelled')`만으로도 좁혀지므로, 이런 가드는 여러 곳에서 같은 검사를 반복할 때 만듭니다.
:::

### 문제 3 ⭐⭐ assertion 함수로 양수 확인

`unknown`을 받아 0보다 큰 숫자가 아니면 예외를 던지는 `assertPositive`를 만들고, 통과한 뒤에는 `number`로 쓰일 수 있게 하세요.

::: details 정답 보기

```ts
function assertPositive(value: unknown): asserts value is number {
  if (typeof value !== 'number' || !(value > 0)) {
    throw new Error(`양수가 아닙니다: ${String(value)}`)
  }
}

const qty: unknown = 3
assertPositive(qty)
console.log(qty * 4500) // 출력: 13500
```

`!(value > 0)`으로 쓰면 `NaN`도 걸러집니다(`NaN > 0`은 `false`).
:::

### 문제 4 ⭐⭐ satisfies로 색상 테마

POS 화면 테마 색상 객체를 만들고, 모든 값이 `` `#${string}` `` 모양인지 `satisfies`로 검사하세요. 그리고 `keyof typeof theme`이 키 유니온으로 남는지 확인하세요.

::: details 정답 보기

```ts
const theme = {
  primary: '#1e6fff',
  danger: '#e5484d',
  background: '#ffffff',
} satisfies Record<string, `#${string}`>

type ThemeColor = keyof typeof theme // 결과: "primary" | "danger" | "background"
console.log(theme.danger) // 출력: #e5484d
```

값 하나를 `'red'`로 바꾸면 규격 검사에서 에러가 납니다.
:::

### 문제 5 ⭐⭐ filter로 유효한 주문만

다음 배열에서 `null`과 `undefined`를 모두 걸러 `number[]`를 얻으세요. TypeScript 5.5 이상의 추론에 기대는 방법과, 직접 타입 가드를 쓰는 방법 두 가지로 써 보세요.

```ts
const orderIds = [1001, null, 1002, undefined, 1003]
```

::: details 정답 보기

```ts
const orderIds = [1001, null, 1002, undefined, 1003]

// 방법 1: 5.5+ 추론
const ids1 = orderIds.filter((id) => id != null) // 결과: number[]
// 방법 2: 직접 타입 가드 (모든 버전)
const ids2 = orderIds.filter((id): id is number => typeof id === 'number') // 결과: number[]

console.log(ids1) // 출력: [ 1001, 1002, 1003 ]
```

`id != null`(느슨한 비교)은 `null`과 `undefined`를 함께 걸러 냅니다. 5.4 이하를 쓰는 프로젝트라면 방법 2로 써야 합니다.
:::

### 문제 6 ⭐⭐⭐ 제네릭 키 검사 가드

객체에 특정 키가 있고 그 값이 문자열인지 확인하는 제네릭 타입 가드 `hasStringProp`을 만드세요. 호출 후에는 `obj[key]`를 `string`으로 쓸 수 있어야 합니다.

::: details 정답 보기

```ts
function hasStringProp<K extends string>(obj: unknown, key: K): obj is Record<K, string> {
  return typeof obj === 'object' && obj !== null && key in obj && typeof (obj as Record<string, unknown>)[key] === 'string'
}

const payload: unknown = JSON.parse('{"storeName":"강남점","open":9}')

if (hasStringProp(payload, 'storeName')) {
  console.log(payload.storeName.length) // 출력: 3
}
```

키 이름을 타입 매개변수 `K`로 받아, 술어 타입 `Record<K, string>`에 그대로 썼습니다. `'storeName'`을 넘기면 `payload`가 `Record<'storeName', string>`으로 좁혀집니다.
:::

## 확인 퀴즈

1. `value is T`와 그냥 `boolean` 반환 타입의 차이는 무엇인가요?
2. 컴파일러는 타입 가드의 몸체가 올바르게 검사하는지 확인하나요?
3. `asserts value is T`와 `asserts value`는 각각 무엇을 뜻하나요?
4. 타입 표기, `satisfies`, `as` 중 빠진 속성을 잡지 못하는 것은?
5. `[3, undefined, 0].filter((q) => !!q)`의 결과 타입이 `number[]`로 좁혀지지 않는 이유는?

::: details 정답 보기

1. `value is T`는 "`true`를 돌려주면 `value`가 `T`"라는 정보를 컴파일러에 주어, 부른 쪽에서 타입이 좁혀집니다. `boolean`은 그런 정보가 없습니다.
2. 확인하지 않습니다. 반환 타입의 약속을 믿을 뿐이라, 검사가 틀리면 실행 중 에러로 이어집니다.
3. `asserts value is T`는 "함수가 정상 종료하면 `value`는 `T`", `asserts value`는 "함수가 정상 종료하면 `value`는 참 같은 값"이라는 뜻입니다. 둘 다 조건이 안 맞으면 예외를 던지는 함수에 씁니다.
4. `as`입니다.
5. `!!q`가 `false`일 때 `q`가 `undefined`라고 단정할 수 없기 때문입니다(`0`도 `false`). 술어가 "거짓이면 그 타입이 아님"까지 성립해야 추론됩니다.
:::

## 정리

- 사용자 정의 타입 가드 `value is T`는 직접 만든 검사 함수로 타입을 좁힙니다. `if`의 참·거짓 양쪽이 모두 좁혀집니다.
- assertion 함수 `asserts value is T`·`asserts value`는 실패 시 예외를 던지고, 호출한 줄 아래 전부에서 타입을 좁힙니다. 호출 이름에 명시적 타입이 필요합니다(TS2775).
- 컴파일러는 가드의 약속을 **믿기만** 하므로, 검사 로직은 꼼꼼하게 쓰고 테스트하세요.
- `satisfies`(4.9+)는 규격을 검사하되 추론된 세부 타입을 유지합니다. 타입 표기는 세부 정보를 잃고, `as`는 검사를 거의 하지 않습니다.
- `filter`는 타입 가드 콜백을 받으면 결과를 좁힙니다. 5.5부터는 `x !== null` 같은 콜백에서 술어가 추론되지만, `!!x`나 `Boolean`은 좁혀지지 않습니다.

## 다음 단계

[변성(공변·반공변)과 함수 타입 호환성](./07-variance)에서는 "왜 `(code: string) => void`가 `(...args: unknown[]) => void` 자리에 들어가지 못했는지"(2번 레슨)의 답을 찾습니다. 배열과 함수 타입이 서로 언제 바꿔 쓸 수 있는지를 "상자에 넣고 빼기" 비유로 정리합니다.
