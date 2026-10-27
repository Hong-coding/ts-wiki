---
title: 유니온 타입과 리터럴 타입
---

# 유니온 타입과 리터럴 타입

<LessonMeta level="초급" :minutes="50" prev="함수 타입, 선택·기본·나머지 매개변수, 오버로드" />

## 이번에 배울 것

- **유니온 타입** `A | B`를 "합집합"으로 설명하고 쓸 수 있다.
- **리터럴 타입**과 **문자열 리터럴 유니온**으로 주문 상태처럼 "정해진 값 중 하나"를 표현할 수 있다.
- 유니온 타입의 값에서 **공통 멤버만** 바로 쓸 수 있는 이유를 설명할 수 있다.
- 리터럴 넓히기를 복습하고, 넓히기 때문에 생기는 오류를 고칠 수 있다.

## 먼저 알아 둘 것

- [타입 표기와 타입 추론](./01-annotation-inference) — 리터럴 타입과 넓히기
- [특수 타입](./02-special-types) — `never`는 공집합, `unknown`은 전체집합
- [객체 타입](./04-object-types), [함수 타입](./05-function-types)

## 비유로 이해하기

카페 주문서에 "결제 수단" 칸이 있다고 해 봅시다. 손님은 **카드 또는 현금 또는 모바일 페이** 중 하나를 고릅니다. 결제 수단 칸에 들어갈 수 있는 것은 이 세 가지를 **모두 합친 모임**입니다. 이것이 **유니온**입니다.

이 칸을 받은 직원은 무엇을 할 수 있을까요? "결제 금액 확인"은 세 수단 모두 할 수 있으니 바로 해도 됩니다. 하지만 "카드 서명 받기"는 카드일 때만 할 수 있습니다. 현금 손님에게 서명을 받으려 하면 이상하지요. 그래서 직원은 **"이 손님은 어떤 수단인가?"를 먼저 확인**한 뒤에 수단별 일을 합니다. 유니온 타입의 값을 다루는 규칙도 이와 똑같습니다.

## 개념 설명

### 1단계: 유니온 타입은 합집합

**유니온 타입**(union type)은 `|`(세로 막대)로 여러 타입을 이어서 "이 중 하나"를 뜻합니다.

```ts
let orderKey: string | number

orderKey = 'A-1001' // ✅ 문자열
orderKey = 1001 // ✅ 숫자
orderKey = true
// ❌ Type 'boolean' is not assignable to type 'string | number'. (TS2322)
```

집합으로 보면 `string | number`는 **문자열 집합과 숫자 집합을 합친 합집합**입니다.

```text
string           = { '', 'A-1001', '라테', ... }
number           = { 0, 1001, 4500, ... }
string | number  = { '', 'A-1001', '라테', ..., 0, 1001, 4500, ... }   ← 둘을 합침
```

`true`는 어느 쪽에도 없으니 들어갈 수 없습니다. 지금까지 여러 번 본 `string | undefined`도 "문자열 집합 + `undefined` 값 하나"를 합친 유니온입니다.

함수 매개변수에도 씁니다.

```ts
function formatOrderKey(key: string | number): string {
  return `주문#${key}`
}

console.log(formatOrderKey('A-1001'), formatOrderKey(1001))
// 출력: 주문#A-1001 주문#1001
```

### 2단계: 리터럴 타입 — 값 하나짜리 집합

[01 레슨](./01-annotation-inference)에서 `const status = 'READY'`의 타입이 `"READY"`라는 것을 봤습니다. 이렇게 **값 하나를 그대로 타입으로 쓴 것**이 **리터럴 타입**(literal type)입니다.

```ts
let fixed: 'READY' = 'READY'
fixed = 'READY' // ✅
fixed = 'PAID'
// ❌ Type '"PAID"' is not assignable to type '"READY"'. (TS2322)
```

문자열뿐 아니라 숫자, `true`/`false`도 리터럴 타입이 될 수 있습니다.

```ts
const one: 1 = 1
const yes: true = true
const shotCount: 2 = 2
```

값이 하나뿐인 타입은 혼자서는 별로 쓸모가 없습니다. 리터럴 타입은 **유니온과 합쳐질 때** 진가를 발휘합니다.

### 3단계: 문자열 리터럴 유니온으로 상태 표현하기

주문 상태를 생각해 봅시다. 주문은 **준비(READY), 결제 완료(PAID), 취소(CANCELED)** 중 하나입니다. 이것을 `string`으로 쓰면 어떤 문제가 있을까요?

```ts
function cancelOrder(status: string): string {
  if (status === 'PAID') {
    return 'CANCELD' // 오타! 하지만 오류 없음
  }
  return status
}

console.log(cancelOrder('PAID'))
// 출력: CANCELD
```

`string`은 **모든 문자열의 집합**이라 오타 `'CANCELD'`도 정상 값으로 받아들입니다. 이 오타는 화면에 "알 수 없는 상태"로 나타나거나, 취소 처리가 안 되는 버그로 이어집니다.

**문자열 리터럴 유니온**으로 바꾸면 "이 세 값만 된다"고 정할 수 있습니다.

```ts
type OrderStatus = 'READY' | 'PAID' | 'CANCELED'

function cancelOrder(status: OrderStatus): OrderStatus {
  if (status === 'PAID') {
    return 'CANCELD'
    // ❌ Type '"CANCELD"' is not assignable to type 'OrderStatus'. Did you mean '"CANCELED"'? (TS2820)
  }
  return status
}
```

집합으로 보면 `OrderStatus`는 **값이 딱 세 개 들어 있는 집합**입니다.

```text
OrderStatus = { 'READY', 'PAID', 'CANCELED' }
```

오타는 이 집합 밖의 값이므로 즉시 오류가 나고, `Did you mean '"CANCELED"'?`처럼 비슷한 값까지 제안해 줍니다(오류 코드도 TS2322 대신 제안이 붙은 TS2820으로 나옵니다). 게다가 VS Code에서 `return '`까지 치면 **세 값이 자동 완성 목록**으로 뜹니다. 직접 해 보세요.

```ts
type OrderStatus = 'READY' | 'PAID' | 'CANCELED'

type Order = {
  orderNo: string
  status: OrderStatus
}

function getStatusLabel(status: OrderStatus): string {
  if (status === 'READY') return '결제 대기'
  if (status === 'PAID') return '결제 완료'
  return '취소됨'
}

const order: Order = { orderNo: 'A-1001', status: 'PAID' }
console.log(`${order.orderNo}: ${getStatusLabel(order.status)}`)
// 출력: A-1001: 결제 완료
```

::: tip 실무에서 가장 많이 쓰는 패턴
문자열 리터럴 유니온은 TypeScript 실무에서 **가장 자주 보는 패턴 중 하나**입니다. 주문 상태, 결제 수단(`'CARD' | 'CASH'`), 회원 등급, 화면 모드(`'list' | 'detail'`), 정렬 방향(`'asc' | 'desc'`) 등 "정해진 값 중 하나"인 곳이면 어디든 씁니다. 같은 일을 하는 `enum`과의 비교는 [09 레슨](./09-enum)에서 합니다.
:::

### 4단계: 숫자·불리언 리터럴 유니온

숫자 리터럴도 유니온으로 묶을 수 있습니다.

```ts
type ShotCount = 1 | 2 | 3
type CupSize = 'S' | 'M' | 'L'

function makeCoffeeLabel(size: CupSize, shots: ShotCount): string {
  return `${size} 사이즈 / ${shots}샷`
}

console.log(makeCoffeeLabel('L', 2))
// 출력: L 사이즈 / 2샷

makeCoffeeLabel('XL', 4)
// ❌ Argument of type '"XL"' is not assignable to parameter of type 'CupSize'. (TS2345)
```

참고로 `boolean` 타입은 사실 `true | false` 유니온입니다. 마우스를 올려 보면 가끔 `boolean` 대신 `true | false`가 보이는 이유입니다.

### 5단계: 유니온에서는 공통 멤버만 바로 쓸 수 있다

유니온 타입의 값을 받으면 **모든 경우에 공통으로 있는 것**만 바로 쓸 수 있습니다.

```ts
function printKey(key: string | number) {
  console.log(key.toString()) // ✅ string과 number 모두 toString이 있음
  console.log(key.toUpperCase())
  // ❌ Property 'toUpperCase' does not exist on type 'string | number'. (TS2339)
}
```

왜 그럴까요? `key`에 숫자가 들어올 수도 있기 때문입니다. 숫자에는 `toUpperCase`가 없으므로, 숫자가 들어온 순간 실행 중에 터집니다. TypeScript는 **"이 집합의 어떤 값이 와도 안전한 것"** 만 허락합니다.

객체 유니온도 마찬가지입니다.

```ts
type CardPayment = { method: 'CARD'; amount: number; cardNo: string }
type CashPayment = { method: 'CASH'; amount: number; received: number }

function describe(payment: CardPayment | CashPayment): string {
  const base = `${payment.method} ${payment.amount}원` // ✅ 둘 다 있음
  return base + payment.cardNo
  // ❌ Property 'cardNo' does not exist on type 'CardPayment | CashPayment'. (TS2339)
}
```

`method`와 `amount`는 두 타입 모두 갖고 있으니 쓸 수 있지만, `cardNo`는 카드 결제에만 있습니다.

::: info 합집합인데 왜 쓸 수 있는 것은 더 적을까?
처음 배울 때 가장 헷갈리는 부분입니다. **값의 집합**으로는 유니온이 더 큽니다(카드 결제 + 현금 결제). 그런데 값이 많아질수록 "**모든 값이 공통으로** 가진 속성"은 줄어듭니다. 카드 결제 하나만 다룰 때는 `cardNo`를 믿고 쓸 수 있지만, 현금 결제까지 섞이면 더 이상 믿을 수 없게 됩니다.

> 받을 수 있는 값이 많아질수록, 확실히 할 수 있는 일은 적어진다.
:::

### 6단계: 확인해서 좁힌 뒤 쓰기

그렇다면 `cardNo`는 어떻게 쓸까요? 비유의 직원처럼 **먼저 확인**하면 됩니다.

```ts
type CardPayment = { method: 'CARD'; amount: number; cardNo: string }
type CashPayment = { method: 'CASH'; amount: number; received: number }

function describe(payment: CardPayment | CashPayment): string {
  if (payment.method === 'CARD') {
    // 여기서 payment는 CardPayment
    return `카드 ${payment.amount}원 (끝자리 ${payment.cardNo.slice(-4)})`
  }
  // 여기서 payment는 CashPayment
  return `현금 ${payment.amount}원 (거스름돈 ${payment.received - payment.amount}원)`
}

console.log(describe({ method: 'CARD', amount: 9000, cardNo: '1234-5678-9012-3456' }))
// 출력: 카드 9000원 (끝자리 3456)
console.log(describe({ method: 'CASH', amount: 9000, received: 10000 }))
// 출력: 현금 9000원 (거스름돈 1000원)
```

`if (payment.method === 'CARD')` 안에서 TypeScript는 `payment`를 `CardPayment`로 **좁혀 줍니다**. 큰 집합(카드 + 현금)을 조건문으로 잘라 작은 집합(카드)만 남긴 것입니다. 이것이 **타입 좁히기**(narrowing)이며 [08 레슨](./08-narrowing)에서 깊게 배웁니다.

특히 위처럼 **공통 속성(`method`)의 리터럴 값으로 구분하는 유니온**을 **판별 유니온**(discriminated union)이라고 부르며, [Part 3 판별 유니온](../part3-intermediate/03-discriminated-union)에서 본격적으로 다룹니다.

```ts
function formatOrderKey(key: string | number): string {
  if (typeof key === 'string') {
    return key.toUpperCase() // 여기서 key는 string
  }
  return key.toFixed(0) // 여기서 key는 number
}

console.log(formatOrderKey('a-1001'), formatOrderKey(1001.7))
// 출력: A-1001 1002
```

### 7단계: 리터럴 넓히기 복습

리터럴 유니온을 쓰기 시작하면 [01 레슨](./01-annotation-inference)에서 배운 **넓히기** 때문에 오류를 자주 만납니다.

```ts
type OrderStatus = 'READY' | 'PAID' | 'CANCELED'

function updateStatus(status: OrderStatus) {
  console.log('상태:', status)
}

let next = 'PAID' // 타입: string (넓혀짐!)
updateStatus(next)
// ❌ Argument of type 'string' is not assignable to parameter of type 'OrderStatus'. (TS2345)
```

`let`은 나중에 다른 값을 넣을 수 있으므로 `"PAID"`가 `string`으로 넓혀집니다. `string` 집합은 `OrderStatus` 집합보다 훨씬 크므로 넣을 수 없습니다.

해결 방법은 세 가지입니다.

```ts
type OrderStatus = 'READY' | 'PAID' | 'CANCELED'

function updateStatus(status: OrderStatus) {
  console.log('상태:', status)
}

// 방법 1: 바꿀 일이 없으면 const
const next1 = 'PAID' // 타입: "PAID"
updateStatus(next1)

// 방법 2: 바꿀 일이 있으면 타입 표기
let next2: OrderStatus = 'READY'
next2 = 'PAID'
updateStatus(next2)

// 방법 3: 값을 바로 넘기기
updateStatus('CANCELED')
// 출력: 상태: PAID
// 출력: 상태: PAID
// 출력: 상태: CANCELED
```

객체 속성도 넓혀진다는 점을 기억하세요.

```ts
type OrderStatus = 'READY' | 'PAID' | 'CANCELED'
type Order = { orderNo: string; status: OrderStatus }

const draft = { orderNo: 'A-1001', status: 'READY' } // status: string
const order: Order = draft
// ❌ Type '{ orderNo: string; status: string; }' is not assignable to type 'Order'. (TS2322)
```

`draft`를 만들 때 타입을 정해 주면 해결됩니다.

```ts
type OrderStatus = 'READY' | 'PAID' | 'CANCELED'
type Order = { orderNo: string; status: OrderStatus }

const draft: Order = { orderNo: 'A-1001', status: 'READY' }
const order: Order = draft
console.log(order.status)
// 출력: READY
```

### 8단계: 유니온과 특수 타입 — never와 unknown

[02 레슨](./02-special-types)의 특수 타입도 유니온의 눈으로 보면 깔끔하게 정리됩니다.

- **`never`는 공집합**이므로 유니온에 합쳐도 아무것도 늘지 않습니다. `string | never`는 그냥 `string`입니다.
- **`unknown`은 전체집합**이므로 무엇과 합쳐도 전체집합입니다. `string | unknown`은 `unknown`입니다.

```ts
type A = string | never // 마우스를 올리면: type A = string
type B = string | unknown // 마우스를 올리면: type B = unknown
type C = 'READY' | string // 마우스를 올리면: type C = string
```

`C`도 눈여겨보세요. `'READY'`는 이미 `string` 집합 안에 들어 있으므로 합쳐도 `string`입니다. 리터럴 유니온에 `| string`을 섞으면 **자동 완성과 오타 검사가 모두 사라지니** 주의하세요.

### 9단계: 유니온 타입과 함수 반환값

함수가 여러 종류의 값을 돌려줄 수 있으면 반환 타입도 유니온이 됩니다. 실무에서 가장 흔한 것은 "찾으면 값, 못 찾으면 `undefined`"입니다.

```ts
type Product = { code: string; name: string; price: number }

const products: Product[] = [
  { code: 'P001', name: '아메리카노', price: 4500 },
  { code: 'P002', name: '카페라테', price: 5000 },
]

function findProduct(code: string): Product | undefined {
  return products.find((p) => p.code === code)
}

const found = findProduct('P002')
if (found !== undefined) {
  console.log(found.name)
}
// 출력: 카페라테
```

`Product | undefined`를 받으면 쓰기 전에 `undefined`인지 확인해야 합니다. 귀찮아 보이지만, 이 확인 덕분에 "없는 상품의 이름을 읽다가 터지는" 버그를 원천 차단합니다.

## 자주 하는 실수

### 실수 1: 유니온 값에서 한쪽에만 있는 메서드 쓰기

```ts
function printPrice(price: string | number) {
  console.log(price.toLocaleString('ko-KR') + '원') // ✅ 둘 다 있음
  console.log(price.toFixed(0))
  // ❌ Property 'toFixed' does not exist on type 'string | number'. (TS2339)
}
```

왜 틀렸나: `toFixed`는 숫자에만 있습니다. 문자열이 들어오면 실행 중에 터집니다.

고친 코드: 먼저 어떤 타입인지 확인합니다.

```ts
function printPrice(price: string | number) {
  const amount = typeof price === 'string' ? Number(price) : price
  console.log(amount.toFixed(0) + '원')
}

printPrice('4500')
// 출력: 4500원
printPrice(5000.4)
// 출력: 5000원
```

### 실수 2: 상태를 string으로 두기

```ts
type Order = { orderNo: string; status: string }

const order: Order = { orderNo: 'A-1001', status: 'PIAD' } // 오타인데 오류 없음
```

왜 틀렸나: `string`은 모든 문자열을 받으므로 오타를 잡을 수 없습니다.

고친 코드:

```ts
type OrderStatus = 'READY' | 'PAID' | 'CANCELED'
type Order = { orderNo: string; status: OrderStatus }

const order: Order = { orderNo: 'A-1001', status: 'PIAD' }
// ❌ Type '"PIAD"' is not assignable to type 'OrderStatus'. (TS2322)
```

이제 오타가 바로 오류로 드러납니다.

### 실수 3: let으로 받은 값을 리터럴 유니온에 넘기기

```ts
type PayMethod = 'CARD' | 'CASH'

function pay(method: PayMethod) {
  console.log(`${method} 결제`)
}

let method = 'CARD'
pay(method)
// ❌ Argument of type 'string' is not assignable to parameter of type 'PayMethod'. (TS2345)
```

왜 틀렸나: `let`은 `string`으로 넓혀집니다.

고친 코드:

```ts
type PayMethod = 'CARD' | 'CASH'

function pay(method: PayMethod) {
  console.log(`${method} 결제`)
}

let method: PayMethod = 'CARD'
pay(method)
// 출력: CARD 결제
```

### 실수 4: 리터럴 유니온에 string을 섞기

```ts
type OrderStatus = 'READY' | 'PAID' | 'CANCELED' | string

const s: OrderStatus = 'PIAD' // 오류 없음
```

왜 틀렸나: `'READY'` 등은 모두 `string` 집합에 들어 있으므로 전체 타입이 `string`이 되어 버립니다. "나중에 새 상태가 추가될지 몰라서" 이렇게 쓰는 경우가 많은데, 그러면 리터럴 유니온을 쓰는 의미가 사라집니다.

고친 코드: 새 상태가 생기면 **타입에 추가**합니다. 추가하는 순간 처리하지 않은 곳을 컴파일러가 찾아 줄 수 있습니다([Part 3 완전성 검사](../part3-intermediate/03-discriminated-union)).

```ts
type OrderStatus = 'READY' | 'PAID' | 'CANCELED' | 'REFUNDED'

const s: OrderStatus = 'REFUNDED'
console.log(s)
// 출력: REFUNDED
```

## 직접 해 보기

### 문제 1 ⭐ 회원 등급 타입

회원 등급은 `'BRONZE'`, `'SILVER'`, `'GOLD'`, `'VIP'` 중 하나입니다. `MemberGrade` 타입을 만들고, 등급별 적립률(브론즈 1%, 실버 2%, 골드 3%, VIP 5%)을 돌려주는 `getPointRate` 함수를 작성하세요.

::: details 정답 보기
```ts
type MemberGrade = 'BRONZE' | 'SILVER' | 'GOLD' | 'VIP'

function getPointRate(grade: MemberGrade): number {
  if (grade === 'VIP') return 0.05
  if (grade === 'GOLD') return 0.03
  if (grade === 'SILVER') return 0.02
  return 0.01
}

console.log(getPointRate('GOLD') * 10000)
// 출력: 300
```

`switch` 문으로 써도 좋습니다. 등급이 늘어났을 때 빠뜨린 경우를 찾아 주는 방법은 [Part 3](../part3-intermediate/03-discriminated-union)에서 배웁니다.
:::

### 문제 2 ⭐ 어느 값이 들어갈까

`type Size = 'S' | 'M' | 'L'`일 때, 다음 중 `Size` 변수에 넣을 수 있는 값을 모두 고르세요.

`'S'`, `'s'`, `'XL'`, `'M'`, `` `L` ``, `'L '`

::: details 정답 보기
`'S'`, `'M'`, `` `L` `` 세 개입니다.

- `'s'`는 소문자라 다른 값입니다.
- `'L '`는 뒤에 공백이 있어 다른 값입니다.
- `` `L` ``(백틱으로 쓴 문자열)은 `'L'`과 같은 값입니다. 템플릿 리터럴 안에 `${...}`가 없으면 일반 문자열 리터럴로 취급됩니다.
:::

### 문제 3 ⭐⭐ 공통 멤버 찾기

다음 함수에서 오류가 나는 줄을 고치세요. `Coupon`은 금액 할인, `RateCoupon`은 비율 할인입니다.

```ts
// 문제: 오류를 고치세요
type AmountCoupon = { kind: 'AMOUNT'; code: string; amount: number }
type RateCoupon = { kind: 'RATE'; code: string; rate: number }

function applyCoupon(price: number, coupon: AmountCoupon | RateCoupon): number {
  console.log(`쿠폰 ${coupon.code} 적용`)
  return price - coupon.amount
}
```

::: details 정답 보기
`coupon.amount`는 `AmountCoupon`에만 있어 오류가 납니다. `kind`로 확인한 뒤 씁니다.

```ts
type AmountCoupon = { kind: 'AMOUNT'; code: string; amount: number }
type RateCoupon = { kind: 'RATE'; code: string; rate: number }

function applyCoupon(price: number, coupon: AmountCoupon | RateCoupon): number {
  console.log(`쿠폰 ${coupon.code} 적용`) // code는 공통이라 그대로 OK
  if (coupon.kind === 'AMOUNT') {
    return price - coupon.amount
  }
  return price * (1 - coupon.rate)
}

console.log(applyCoupon(10000, { kind: 'AMOUNT', code: 'W1000', amount: 1000 }))
// 출력: 쿠폰 W1000 적용
// 출력: 9000
console.log(applyCoupon(10000, { kind: 'RATE', code: 'P10', rate: 0.1 }))
// 출력: 쿠폰 P10 적용
// 출력: 9000
```
:::

### 문제 4 ⭐⭐ 넓히기 오류 고치기

다음 코드의 오류를 **타입 표기 없이** 고치세요.

```ts
// 문제: 타입 표기 없이 오류를 고치세요
type SortOrder = 'asc' | 'desc'

function sortPrices(prices: number[], order: SortOrder): number[] {
  return [...prices].sort((a, b) => (order === 'asc' ? a - b : b - a))
}

let order = 'desc'
sortPrices([5000, 4500], order)
```

::: details 정답 보기
`let`을 `const`로 바꾸면 `order`의 타입이 `"desc"`가 되어 `SortOrder`에 들어갑니다.

```ts
type SortOrder = 'asc' | 'desc'

function sortPrices(prices: number[], order: SortOrder): number[] {
  return [...prices].sort((a, b) => (order === 'asc' ? a - b : b - a))
}

const order = 'desc'
console.log(sortPrices([4500, 5500, 5000], order))
// 출력: [ 5500, 5000, 4500 ]
```

값을 나중에 바꿔야 한다면 `let order: SortOrder = 'desc'`처럼 표기하는 것이 맞습니다.
:::

### 문제 5 ⭐⭐⭐ 유니온 결과 타입 예측하기

다음 타입 별칭이 각각 무엇으로 정리되는지 예측하고, VS Code에서 마우스를 올려 확인하세요.

```ts
type T1 = 'A' | 'B' | 'A'
type T2 = 'A' | string
type T3 = number | never
type T4 = boolean | true
type T5 = 1 | number | unknown
```

::: details 정답 보기
```ts
type T1 = 'A' | 'B' | 'A' // "A" | "B"   (같은 값은 한 번만)
type T2 = 'A' | string // string        ('A'는 string에 포함)
type T3 = number | never // number      (never는 공집합)
type T4 = boolean | true // boolean     (true는 boolean에 포함)
type T5 = 1 | number | unknown // unknown (전체집합)
```

모두 집합의 합집합 규칙 그대로입니다. 이미 들어 있는 원소를 다시 합쳐도 집합은 커지지 않습니다.
:::

## 확인 퀴즈

1. `string | number`를 집합으로 설명하세요.
2. `'READY' | 'PAID'` 타입이 `string`보다 좋은 점 두 가지는 무엇인가요?
3. `string | number` 값에서 `toUpperCase()`를 바로 부를 수 없는 이유는 무엇인가요?
4. `let s = 'PAID'`를 `'READY' | 'PAID'` 매개변수에 넘기면 왜 오류가 나나요?
5. `'READY' | string`은 어떤 타입으로 정리되나요?

::: details 정답 보기
1. 문자열 집합과 숫자 집합을 합친 합집합입니다.
2. 오타를 컴파일 오류로 잡아 주고, 에디터에서 가능한 값이 자동 완성됩니다.
3. 숫자가 들어올 수도 있고 숫자에는 `toUpperCase`가 없기 때문입니다. 유니온에서는 모든 경우에 공통인 멤버만 바로 쓸 수 있습니다.
4. `let`이라 `s`가 `string`으로 넓혀졌고, `string` 집합은 `'READY' | 'PAID'`보다 크기 때문입니다.
5. `string`입니다. `'READY'`는 이미 `string`에 포함되어 있습니다.
:::

## 정리

- **유니온** `A | B`는 합집합입니다. A나 B에 속하는 값은 모두 들어갈 수 있습니다.
- **리터럴 타입**은 값 하나짜리 집합이며, 유니온과 합쳐 "정해진 값 중 하나"를 표현합니다.
- 주문 상태처럼 정해진 값은 `string` 대신 **문자열 리터럴 유니온**으로 씁니다. 오타 검사와 자동 완성을 얻습니다.
- 유니온 값에서는 **모든 경우에 공통인 멤버만** 바로 쓸 수 있습니다. 나머지는 확인(좁히기)한 뒤에 씁니다.
- `let`과 객체 속성은 리터럴이 넓혀지므로, `const`를 쓰거나 타입을 표기합니다.
- `never`를 합치면 그대로, `unknown`을 합치면 `unknown`, 리터럴에 그 상위 타입을 합치면 상위 타입이 됩니다.

## 다음 단계

[타입 별칭(type)과 인터페이스(interface)](./07-type-alias-interface) — 지금까지 써 온 `type 이름 = ...`을 정식으로 배우고, 비슷한 일을 하는 `interface`와 무엇이 다른지, 실무에서 어느 것을 고르는지 정리합니다.
