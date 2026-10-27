---
title: 판별 유니온과 완전성 검사(exhaustiveness)
---

# 판별 유니온과 완전성 검사(exhaustiveness)

<LessonMeta level="중급" :minutes="60" prev="TypeScript는 모양으로 할당 가능성을 판단하고, 초과 속성 검사는 신선한 리터럴에서만 일어난다" />

## 이번에 배울 것

- 판별 속성(`method: 'CARD'` 같은 리터럴 속성)으로 **판별 유니온**을 설계할 수 있다.
- `switch`와 `if`로 판별 유니온을 좁혀, 경우마다 다른 속성을 안전하게 쓸 수 있다.
- `never`와 `assertNever`로 **완전성 검사**를 걸어, 처리를 빠뜨린 경우를 컴파일 오류로 잡을 수 있다.
- 주문 상태처럼 "단계마다 가진 정보가 다른 데이터"를 판별 유니온으로 모델링할 수 있다.
- 좋은 판별 속성을 고르는 기준을 설명할 수 있다.

## 먼저 알아 둘 것

- [유니온 타입과 리터럴 타입](../part2-types/06-union-literal)
- [타입 좁히기(Narrowing)](../part2-types/08-narrowing): `typeof`, `in`, `===`로 타입 좁히기
- [특수 타입: any · unknown · never · void](../part2-types/02-special-types): `never`
- [조건문: if · switch · 삼항 연산자](../part1-basics/04-conditionals): `switch` 문법

## 비유로 이해하기

POS 계산대에서 결제를 받는 장면을 떠올려 보세요. 손님이 내미는 것은 카드일 수도, 현금일 수도, 포인트일 수도 있습니다. 계산원은 **먼저 결제 수단이 무엇인지 확인**합니다.

- 카드라면 → 카드 번호와 할부 개월을 봅니다.
- 현금이라면 → 받은 돈을 세고 거스름돈을 계산합니다.
- 포인트라면 → 회원 번호로 잔액을 조회합니다.

결제 수단을 확인하기 전에 "거스름돈 얼마예요?"라고 물으면 이상합니다. 카드 결제에는 거스름돈이 없으니까요.

판별 유니온은 이 계산대의 규칙을 타입으로 옮긴 것입니다. 모든 결제 정보에 **"나는 어떤 결제 수단이다"라는 꼬리표**(`method`)를 달아 두고, 꼬리표를 확인한 다음에만 그 수단에만 있는 정보를 꺼내게 합니다.

여기에 한 가지 장치를 더합니다. 본사에서 "모바일 상품권"이라는 새 결제 수단을 추가했는데, 어떤 계산대 매뉴얼에는 그 내용이 빠졌다고 해 봅시다. **완전성 검사**는 매뉴얼에서 빠진 경우가 있으면 컴파일러가 "이 경우는 어떻게 처리하나요?"라고 알려 주게 만드는 장치입니다.

## 개념 설명

### 판별 유니온 만들기

**판별 유니온**(discriminated union)은 다음 조건을 갖춘 유니온 타입입니다.

1. 유니온의 각 멤버(경우)가 객체 타입이다.
2. 모든 멤버에 **이름이 같은 속성**이 있다.
3. 그 속성의 타입이 멤버마다 **서로 다른 리터럴 타입**이다.

이 공통 속성을 **판별 속성**(discriminant, 판별자)이라고 부릅니다. 꼬리표(tag)라고도 해서 판별 유니온을 "태그된 유니온"(tagged union)이라고도 부릅니다.

```ts
// 카드 결제: 카드 번호와 할부 개월이 있습니다.
interface CardPayment {
  method: 'CARD'
  amount: number
  cardNo: string
  installment: number // 0이면 일시불
}

// 현금 결제: 받은 금액이 있습니다.
interface CashPayment {
  method: 'CASH'
  amount: number
  received: number
}

// 포인트 결제: 회원 번호가 있습니다.
interface PointPayment {
  method: 'POINT'
  amount: number
  memberNo: string
}

// 판별 속성 method로 구별되는 판별 유니온
type Payment = CardPayment | CashPayment | PointPayment

const p1: Payment = { method: 'CARD', amount: 15000, cardNo: '1234-****-****-5678', installment: 0 }
const p2: Payment = { method: 'CASH', amount: 8700, received: 10000 }
const p3: Payment = { method: 'POINT', amount: 3000, memberNo: 'M0007' }

console.log(p1.method, p2.method, p3.method)
// 출력: CARD CASH POINT
```

해설:

- 세 인터페이스 모두 `method` 속성이 있고, 타입이 `'CARD'`, `'CASH'`, `'POINT'`로 서로 다른 리터럴입니다. 그래서 `method`가 판별 속성입니다.
- `amount`처럼 모든 멤버에 공통인 속성은 좁히지 않아도 바로 쓸 수 있습니다.
- 값을 만들 때도 판별 속성이 도움이 됩니다. `method: 'CASH'`라고 쓰는 순간 TypeScript는 나머지 속성을 `CashPayment` 기준으로 검사합니다.

```ts
interface CardPayment {
  method: 'CARD'
  amount: number
  cardNo: string
}
interface CashPayment {
  method: 'CASH'
  amount: number
  received: number
}
type Payment = CardPayment | CashPayment

// 현금 결제인데 카드 번호를 적었습니다.
const wrong: Payment = { method: 'CASH', amount: 8700, cardNo: '1234' }
// ❌ Object literal may only specify known properties, and 'cardNo' does not exist in type 'CashPayment'. (TS2353)
```

오류 메시지가 `Payment`가 아니라 `CashPayment`를 가리킵니다. 판별 속성을 보고 어떤 멤버인지 정확히 골라냈다는 뜻입니다.

### switch로 좁히기

판별 속성을 `switch`로 검사하면 각 `case` 안에서 타입이 그 멤버로 **좁혀집니다**.

```ts
interface CardPayment {
  method: 'CARD'
  amount: number
  cardNo: string
  installment: number
}
interface CashPayment {
  method: 'CASH'
  amount: number
  received: number
}
interface PointPayment {
  method: 'POINT'
  amount: number
  memberNo: string
}
type Payment = CardPayment | CashPayment | PointPayment

function describePayment(payment: Payment): string {
  switch (payment.method) {
    case 'CARD':
      // 여기서 payment는 CardPayment
      return `카드 ${payment.cardNo} (${payment.installment === 0 ? '일시불' : payment.installment + '개월'})`
    case 'CASH':
      // 여기서 payment는 CashPayment
      return `현금 (거스름돈 ${payment.received - payment.amount}원)`
    case 'POINT':
      // 여기서 payment는 PointPayment
      return `포인트 (회원 ${payment.memberNo})`
  }
}

console.log(describePayment({ method: 'CARD', amount: 15000, cardNo: '****-5678', installment: 3 }))
console.log(describePayment({ method: 'CASH', amount: 8700, received: 10000 }))
console.log(describePayment({ method: 'POINT', amount: 3000, memberNo: 'M0007' }))
// 출력: 카드 ****-5678 (3개월)
// 출력: 현금 (거스름돈 1300원)
// 출력: 포인트 (회원 M0007)
```

해설:

- `case 'CARD':` 안에서는 `payment.method`가 `'CARD'`입니다. 유니온 중 `method`가 `'CARD'`인 멤버는 `CardPayment`뿐이므로, TypeScript는 `payment`를 `CardPayment`로 좁힙니다.
- 그래서 `case 'CARD'` 안에서는 `cardNo`를, `case 'CASH'` 안에서는 `received`를 바로 쓸 수 있습니다.
- `switch` 바깥이나 다른 `case`에서 `payment.received`를 쓰면 오류가 납니다.
- 세 경우를 모두 `return`했으므로 함수 끝에 도달할 일이 없습니다. TypeScript도 이를 알고 "반환값이 없을 수 있다"는 오류를 내지 않습니다.

`case` 하나를 지우면 어떻게 될까요?

```ts
type Payment =
  | { method: 'CARD'; amount: number; cardNo: string }
  | { method: 'CASH'; amount: number; received: number }
  | { method: 'POINT'; amount: number; memberNo: string }

function describePayment(payment: Payment): string {
  // ❌ Function lacks ending return statement and return type does not include 'undefined'. (TS2366)
  switch (payment.method) {
    case 'CARD':
      return `카드 ${payment.cardNo}`
    case 'CASH':
      return `현금 ${payment.received}원 받음`
  }
}
```

`'POINT'`일 때 아무것도 반환하지 않으므로 오류가 납니다. 반환 타입이 `string`인 함수에서는 이렇게 빠뜨린 경우가 어느 정도 잡힙니다. 하지만 반환값이 없는(`void`) 함수라면 이 오류도 나지 않습니다. 그래서 다음에 배울 **완전성 검사**가 필요합니다.

### if로 좁히기

`if`와 `===`로 판별 속성을 비교해도 똑같이 좁혀집니다. 한두 경우만 따로 처리할 때 편합니다.

```ts
type Payment =
  | { method: 'CARD'; amount: number; cardNo: string }
  | { method: 'CASH'; amount: number; received: number }
  | { method: 'POINT'; amount: number; memberNo: string }

function calcChange(payment: Payment): number {
  if (payment.method !== 'CASH') {
    // 현금이 아니면 거스름돈이 없습니다.
    return 0
  }
  // 여기부터 payment는 현금 결제로 좁혀져 있습니다.
  return payment.received - payment.amount
}

console.log(calcChange({ method: 'CASH', amount: 8700, received: 10000 }))
console.log(calcChange({ method: 'CARD', amount: 8700, cardNo: '****-5678' }))
// 출력: 1300
// 출력: 0
```

`if (payment.method !== 'CASH') return 0` 다음 줄부터는 `'CASH'`인 경우만 남으므로 `payment.received`를 쓸 수 있습니다. 이렇게 "아닌 경우를 먼저 내보내는" 패턴을 **조기 반환**(early return)이라고 합니다.

::: warning 구조 분해하면 좁히기가 이어지지 않을 때가 있습니다
`const { method } = payment`로 판별 속성을 꺼내 `switch (method)`를 하면, TypeScript 4.6부터는 `const`로 꺼낸 경우에 한해 `payment`도 함께 좁혀 줍니다. 하지만 `let`으로 꺼내면 좁혀지지 않습니다. 헷갈리면 `switch (payment.method)`처럼 객체에서 바로 검사하는 것이 가장 확실합니다.
:::

### 완전성 검사: never로 빠뜨린 경우 잡기

이제 이 레슨의 핵심입니다. 결제 수단에 **모바일 상품권**(`'GIFT'`)이 추가되었다고 해 봅시다. `Payment` 타입에는 추가했지만 영수증 출력 함수는 고치지 않았습니다.

```ts
type Payment =
  | { method: 'CARD'; amount: number; cardNo: string }
  | { method: 'CASH'; amount: number; received: number }
  | { method: 'POINT'; amount: number; memberNo: string }
  | { method: 'GIFT'; amount: number; giftCode: string } // 새로 추가

// 반환값이 없는 함수라서 GIFT를 빠뜨려도 아무 오류가 나지 않습니다.
function printReceiptLine(payment: Payment): void {
  switch (payment.method) {
    case 'CARD':
      console.log(`카드 결제 ${payment.amount}원`)
      break
    case 'CASH':
      console.log(`현금 결제 ${payment.amount}원`)
      break
    case 'POINT':
      console.log(`포인트 결제 ${payment.amount}원`)
      break
  }
}

printReceiptLine({ method: 'GIFT', amount: 5000, giftCode: 'G-777' })
// (아무것도 출력되지 않음)
```

상품권으로 결제한 줄이 영수증에서 조용히 사라졌습니다. 컴파일러는 아무 말도 하지 않습니다. 이런 실수를 잡으려면 `switch`의 `default`에 **"여기는 절대 오면 안 된다"** 는 표시를 해 둡니다.

#### 원리: 모든 경우를 처리하면 남는 타입은 never

`switch`의 각 `case`를 지날 때마다 남은 가능성이 하나씩 줄어듭니다.

```text
switch 시작        : 'CARD' | 'CASH' | 'POINT' | 'GIFT'
case 'CARD' 처리 후 : 'CASH' | 'POINT' | 'GIFT'
case 'CASH' 처리 후 : 'POINT' | 'GIFT'
case 'POINT' 처리 후: 'GIFT'          ← default에 남은 것
```

모든 경우를 처리했다면 `default`에 도달할 수 있는 값은 하나도 없습니다. 값이 하나도 없는 타입이 바로 `never`입니다. 반대로 처리를 빠뜨렸다면 `default`의 `payment`는 `never`가 아니라 빠뜨린 멤버의 타입입니다.

그래서 `default`에서 `payment`를 **`never` 타입 변수에 넣어 보면**, 빠뜨린 경우가 있을 때만 컴파일 오류가 납니다.

```ts
type Payment =
  | { method: 'CARD'; amount: number; cardNo: string }
  | { method: 'CASH'; amount: number; received: number }
  | { method: 'POINT'; amount: number; memberNo: string }
  | { method: 'GIFT'; amount: number; giftCode: string }

function printReceiptLine(payment: Payment): void {
  switch (payment.method) {
    case 'CARD':
      console.log(`카드 결제 ${payment.amount}원`)
      break
    case 'CASH':
      console.log(`현금 결제 ${payment.amount}원`)
      break
    case 'POINT':
      console.log(`포인트 결제 ${payment.amount}원`)
      break
    default: {
      // 모든 경우를 처리했다면 payment는 never입니다.
      const unreachable: never = payment
      // ❌ Type '{ method: "GIFT"; amount: number; giftCode: string; }' is not assignable to type 'never'. (TS2322)
      throw new Error(`처리하지 않은 결제 수단: ${JSON.stringify(unreachable)}`)
    }
  }
}
```

오류 메시지에 빠뜨린 경우(`method: "GIFT"`)가 그대로 보입니다. 이렇게 "모든 경우를 다 처리했는가"를 컴파일러가 확인하게 하는 것을 **완전성 검사**(exhaustiveness checking)라고 합니다.

`case 'GIFT':`를 추가하면 `default`의 `payment`가 `never`가 되어 오류가 사라집니다.

#### assertNever 함수로 재사용하기

매번 `const unreachable: never = ...`를 쓰는 대신, 한 번 만들어 두고 여러 곳에서 쓰는 함수를 많이 씁니다.

```ts
// 여기에 도달하면 버그라는 뜻입니다. 매개변수가 never라서 빠뜨린 경우가 있으면 호출부에서 컴파일 오류가 납니다.
function assertNever(value: never): never {
  throw new Error(`처리하지 않은 경우: ${JSON.stringify(value)}`)
}

type Payment =
  | { method: 'CARD'; amount: number; cardNo: string }
  | { method: 'CASH'; amount: number; received: number }
  | { method: 'POINT'; amount: number; memberNo: string }
  | { method: 'GIFT'; amount: number; giftCode: string }

function paymentLabel(payment: Payment): string {
  switch (payment.method) {
    case 'CARD':
      return '카드'
    case 'CASH':
      return '현금'
    case 'POINT':
      return '포인트'
    case 'GIFT':
      return '모바일 상품권'
    default:
      return assertNever(payment)
  }
}

console.log(paymentLabel({ method: 'GIFT', amount: 5000, giftCode: 'G-777' }))
// 출력: 모바일 상품권
```

해설:

- `assertNever`의 매개변수 타입은 `never`입니다. 그래서 `never`가 아닌 값을 넘기면 TS2345 오류가 납니다.
- 반환 타입도 `never`입니다. "이 함수는 정상적으로 끝나지 않는다(항상 예외를 던진다)"는 뜻입니다. 덕분에 `return assertNever(payment)`가 `string`을 반환해야 하는 자리에서도 문제가 없습니다. `never`는 모든 타입에 할당 가능하기 때문입니다.
- 실행 중에 `throw`하는 이유: 타입 검사를 통과했더라도 서버가 아직 모르는 `'KAKAOPAY'` 같은 값을 보내올 수 있습니다. 그때 조용히 넘어가지 않고 즉시 오류를 내서 문제를 드러냅니다.

`case 'GIFT'`를 빠뜨리면 이렇게 됩니다.

```ts
function assertNever(value: never): never {
  throw new Error(`처리하지 않은 경우: ${JSON.stringify(value)}`)
}

type Payment =
  | { method: 'CARD'; amount: number; cardNo: string }
  | { method: 'CASH'; amount: number; received: number }
  | { method: 'GIFT'; amount: number; giftCode: string }

function paymentLabel(payment: Payment): string {
  switch (payment.method) {
    case 'CARD':
      return '카드'
    case 'CASH':
      return '현금'
    default:
      return assertNever(payment)
      // ❌ Argument of type '{ method: "GIFT"; amount: number; giftCode: string; }' is not assignable to parameter of type 'never'. (TS2345)
  }
}
```

::: tip 완전성 검사가 빛나는 순간
결제 수단·주문 상태·권한 등급처럼 **경우가 나중에 늘어날 수 있는** 유니온을 처리하는 `switch`에는 `assertNever`를 습관처럼 붙이세요. 새 경우를 유니온에 추가하는 순간, 처리를 빠뜨린 모든 `switch`가 컴파일 오류로 목록에 나타납니다. 프로젝트 전체에서 "어디를 고쳐야 하지?"를 찾아다닐 필요가 없어집니다.
:::

#### 판별 속성 값만 뽑아 쓰는 유니온에도 똑같이

판별 유니온이 아닌 **리터럴 유니온**에도 같은 방법을 씁니다.

```ts
function assertNever(value: never): never {
  throw new Error(`처리하지 않은 경우: ${JSON.stringify(value)}`)
}

type MemberGrade = 'BASIC' | 'SILVER' | 'GOLD' | 'VIP'

// 등급별 적립률(%)
function pointRate(grade: MemberGrade): number {
  switch (grade) {
    case 'BASIC':
      return 1
    case 'SILVER':
      return 2
    case 'GOLD':
      return 3
    case 'VIP':
      return 5
    default:
      return assertNever(grade)
  }
}

console.log(pointRate('GOLD'))
// 출력: 3
```

### 주문 상태를 판별 유니온으로 모델링하기

판별 유니온은 **상태마다 가진 정보가 다른 데이터**를 표현할 때 가장 큰 힘을 냅니다. 주문을 예로 들어 보겠습니다.

먼저 흔히 보는 "나쁜" 설계입니다.

```ts
// 모든 상태의 정보를 한 타입에 몰아넣고 선택 속성으로 만든 설계
interface Order {
  orderNo: string
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'CANCELED'
  paidAt?: Date
  trackingNo?: string
  cancelReason?: string
}

// 상태는 PENDING인데 송장 번호가 있는, 말이 안 되는 값도 만들 수 있습니다.
const weird: Order = { orderNo: 'A-1', status: 'PENDING', trackingNo: '6000-1234' }

function printTracking(order: Order): void {
  if (order.status === 'SHIPPED') {
    // 배송 상태여도 trackingNo는 여전히 string | undefined입니다.
    console.log(order.trackingNo.toUpperCase())
    // ❌ 'order.trackingNo' is possibly 'undefined'. (TS18048)
  }
}
```

문제가 두 가지입니다.

1. **불가능한 상태를 만들 수 있습니다.** 결제 전 주문에 송장 번호가 들어가도 타입은 막지 않습니다.
2. **필요한 정보가 있다고 확신할 수 없습니다.** 배송 상태라면 송장 번호가 반드시 있어야 하는데, 타입상으로는 여전히 없을 수도 있습니다. 결국 `!`(non-null 단언)를 남발하게 됩니다.

판별 유니온으로 다시 설계해 보겠습니다.

```ts
interface PendingOrder {
  status: 'PENDING'
  orderNo: string
}

interface PaidOrder {
  status: 'PAID'
  orderNo: string
  paidAt: Date
}

interface ShippedOrder {
  status: 'SHIPPED'
  orderNo: string
  paidAt: Date
  trackingNo: string
}

interface CanceledOrder {
  status: 'CANCELED'
  orderNo: string
  cancelReason: string
}

type Order = PendingOrder | PaidOrder | ShippedOrder | CanceledOrder

function printTracking(order: Order): void {
  if (order.status === 'SHIPPED') {
    // ShippedOrder로 좁혀졌고, trackingNo는 반드시 있는 string입니다.
    console.log(`송장 번호: ${order.trackingNo}`)
  }
}

printTracking({ status: 'SHIPPED', orderNo: 'A-1', paidAt: new Date(), trackingNo: '6000-1234' })
// 출력: 송장 번호: 6000-1234

// 불가능한 상태는 만들 수 없습니다.
const weird: Order = { status: 'PENDING', orderNo: 'A-2', trackingNo: '6000-9999' }
// ❌ Object literal may only specify known properties, and 'trackingNo' does not exist in type 'PendingOrder'. (TS2353)
```

이 원칙을 흔히 **"불가능한 상태를 표현할 수 없게 만들어라"**(make impossible states unrepresentable)라고 부릅니다.

#### 상태 전이를 함수로 표현하기

상태가 바뀌는 규칙(**상태 전이**)도 함수의 매개변수·반환 타입으로 표현할 수 있습니다. "결제 대기 → 결제 완료 → 배송 중" 순서로만 진행되고, 취소는 결제 대기·결제 완료 상태에서만 가능하다고 해 봅시다.

```ts
interface PendingOrder {
  status: 'PENDING'
  orderNo: string
}
interface PaidOrder {
  status: 'PAID'
  orderNo: string
  paidAt: Date
}
interface ShippedOrder {
  status: 'SHIPPED'
  orderNo: string
  paidAt: Date
  trackingNo: string
}
interface CanceledOrder {
  status: 'CANCELED'
  orderNo: string
  cancelReason: string
}
type Order = PendingOrder | PaidOrder | ShippedOrder | CanceledOrder

// 결제: 결제 대기 주문만 받을 수 있습니다.
function pay(order: PendingOrder, paidAt: Date): PaidOrder {
  return { status: 'PAID', orderNo: order.orderNo, paidAt }
}

// 출고: 결제 완료 주문만 받을 수 있습니다.
function ship(order: PaidOrder, trackingNo: string): ShippedOrder {
  return { ...order, status: 'SHIPPED', trackingNo }
}

// 취소: 결제 대기 또는 결제 완료 주문만 받을 수 있습니다.
function cancel(order: PendingOrder | PaidOrder, reason: string): CanceledOrder {
  return { status: 'CANCELED', orderNo: order.orderNo, cancelReason: reason }
}

const created: PendingOrder = { status: 'PENDING', orderNo: 'A-1001' }
const paid = pay(created, new Date('2026-10-01T10:00:00Z'))
const shipped = ship(paid, '6000-1234')
console.log(shipped.status, shipped.trackingNo)
// 출력: SHIPPED 6000-1234

// 배송 중인 주문은 취소할 수 없습니다.
cancel(shipped, '단순 변심')
// ❌ Argument of type 'ShippedOrder' is not assignable to parameter of type 'PendingOrder | PaidOrder'. (TS2345)
```

해설:

- `ship`은 `PaidOrder`만 받으므로, 결제하지 않은 주문을 출고하는 코드는 컴파일되지 않습니다.
- `cancel`은 `PendingOrder | PaidOrder`만 받으므로, 이미 배송 중인 주문을 취소하는 코드도 막힙니다.
- 업무 규칙(상태 전이표)이 함수 시그니처에 그대로 드러나서, 코드를 읽는 사람도 규칙을 바로 알 수 있습니다.

`Order` 전체를 받아 상태별로 다른 화면 문구를 만드는 함수는 앞에서 배운 `switch` + `assertNever`로 씁니다.

```ts
function assertNever(value: never): never {
  throw new Error(`처리하지 않은 경우: ${JSON.stringify(value)}`)
}

type Order =
  | { status: 'PENDING'; orderNo: string }
  | { status: 'PAID'; orderNo: string; paidAt: Date }
  | { status: 'SHIPPED'; orderNo: string; paidAt: Date; trackingNo: string }
  | { status: 'CANCELED'; orderNo: string; cancelReason: string }

function statusMessage(order: Order): string {
  switch (order.status) {
    case 'PENDING':
      return '결제를 기다리고 있습니다.'
    case 'PAID':
      return `결제 완료 (${order.paidAt.toISOString().slice(0, 10)})`
    case 'SHIPPED':
      return `배송 중 (송장 ${order.trackingNo})`
    case 'CANCELED':
      return `취소됨: ${order.cancelReason}`
    default:
      return assertNever(order)
  }
}

console.log(statusMessage({ status: 'CANCELED', orderNo: 'A-2', cancelReason: '재고 부족' }))
// 출력: 취소됨: 재고 부족
```

### 판별 속성 설계 팁

#### 팁 1: 판별 속성은 리터럴 타입으로

판별 속성은 `'CARD'` 같은 문자열 리터럴이 가장 흔하고, 숫자·`boolean` 리터럴도 됩니다. 하지만 **`string`처럼 넓은 타입이면 판별 속성 역할을 하지 못합니다.**

```ts
type Result =
  | { ok: true; data: string[] }
  | { ok: false; errorMessage: string }

function show(result: Result): void {
  if (result.ok) {
    console.log(`상품 ${result.data.length}개`)
  } else {
    console.log(`오류: ${result.errorMessage}`)
  }
}

show({ ok: true, data: ['아메리카노', '카페라테'] })
show({ ok: false, errorMessage: '네트워크 오류' })
// 출력: 상품 2개
// 출력: 오류: 네트워크 오류
```

`ok: true | false` 같은 `boolean` 리터럴 판별 속성은 API 응답의 성공·실패를 나눌 때 자주 씁니다.

#### 팁 2: 이름을 통일하기

팀 안에서 판별 속성 이름을 하나로 정해 두면 읽기 쉽습니다. `type`, `kind`, `status`, `method` 등이 흔합니다. 결제는 `method`, 주문은 `status`, 이벤트는 `type`처럼 도메인마다 의미 있는 이름을 고르되, 같은 유니온 안에서는 반드시 같은 이름을 씁니다.

#### 팁 3: 서버 데이터와 맞추기

판별 속성 값은 보통 서버·DB의 코드값과 일치시킵니다. 서버가 `"payType": "01"`처럼 코드로 보낸다면 `payType: '01' | '02'`로 받는 것보다, 받는 즉시 `'CARD' | 'CASH'`로 바꿔 두는 편이 코드를 읽기 쉽습니다. 외부 데이터를 검증하며 바꾸는 방법은 [런타임 검증](../part4-async/05-runtime-validation)에서 배웁니다.

#### 팁 4: enum보다 문자열 리터럴

판별 속성에 `enum`을 쓸 수도 있지만, 문자열 리터럴 유니온이 더 가볍고 디버깅할 때 값이 그대로 보입니다. 자세한 비교는 [열거형(enum)과 그 대안](../part2-types/09-enum)을 참고하세요.

## 자주 하는 실수

### 실수 1: 판별 속성을 string으로 선언하기

```ts
interface CardPayment {
  method: string
  cardNo: string
}
interface CashPayment {
  method: string
  received: number
}
type Payment = CardPayment | CashPayment

function show(payment: Payment): void {
  if (payment.method === 'CARD') {
    console.log(payment.cardNo)
    // ❌ Property 'cardNo' does not exist on type 'Payment'. (TS2339)
  }
}
```

**왜 틀렸나:** 두 멤버의 `method`가 모두 `string`이라서 `'CARD'`와 비교해도 어느 멤버인지 구별할 수 없습니다. 판별 속성은 멤버마다 서로 다른 **리터럴 타입**이어야 합니다.

```ts
interface CardPayment {
  method: 'CARD'
  cardNo: string
}
interface CashPayment {
  method: 'CASH'
  received: number
}
type Payment = CardPayment | CashPayment

function show(payment: Payment): void {
  if (payment.method === 'CARD') {
    console.log(payment.cardNo) // ✅ CardPayment로 좁혀짐
  }
}

show({ method: 'CARD', cardNo: '****-5678' })
// 출력: ****-5678
```

### 실수 2: default에서 조용히 넘어가기

```ts
type Payment =
  | { method: 'CARD'; amount: number }
  | { method: 'CASH'; amount: number }
  | { method: 'GIFT'; amount: number }

function feeRate(payment: Payment): number {
  switch (payment.method) {
    case 'CARD':
      return 0.02
    case 'CASH':
      return 0
    default:
      return 0 // GIFT를 처리했는지, 빠뜨렸는지 구별할 수 없습니다.
  }
}

console.log(feeRate({ method: 'GIFT', amount: 5000 }))
// 출력: 0
```

**왜 틀렸나:** `default`에서 적당한 값을 반환하면 새 경우가 추가되어도 컴파일러가 아무 말도 하지 않습니다. 상품권 수수료가 실제로는 5%라면, 아무도 모르는 사이에 계산이 틀립니다.

```ts
function assertNever(value: never): never {
  throw new Error(`처리하지 않은 경우: ${JSON.stringify(value)}`)
}

type Payment =
  | { method: 'CARD'; amount: number }
  | { method: 'CASH'; amount: number }
  | { method: 'GIFT'; amount: number }

// ✅ 모든 경우를 명시하고, default에는 assertNever를 둡니다.
function feeRate(payment: Payment): number {
  switch (payment.method) {
    case 'CARD':
      return 0.02
    case 'CASH':
      return 0
    case 'GIFT':
      return 0.05
    default:
      return assertNever(payment)
  }
}

console.log(feeRate({ method: 'GIFT', amount: 5000 }))
// 출력: 0.05
```

### 실수 3: 좁히기 전에 한쪽에만 있는 속성 쓰기

```ts
type Payment =
  | { method: 'CARD'; amount: number; cardNo: string }
  | { method: 'CASH'; amount: number; received: number }

function change(payment: Payment): number {
  return payment.received - payment.amount
  // ❌ Property 'received' does not exist on type 'Payment'. (TS2339)
}
```

**왜 틀렸나:** `received`는 현금 결제에만 있습니다. 판별 속성을 확인하기 전에는 `Payment`에서 공통 속성(`method`, `amount`)만 쓸 수 있습니다.

```ts
type Payment =
  | { method: 'CARD'; amount: number; cardNo: string }
  | { method: 'CASH'; amount: number; received: number }

function change(payment: Payment): number {
  // ✅ 판별 속성으로 먼저 좁힙니다.
  if (payment.method === 'CASH') {
    return payment.received - payment.amount
  }
  return 0
}

console.log(change({ method: 'CASH', amount: 8700, received: 10000 }))
// 출력: 1300
```

### 실수 4: 상태마다 다른 정보를 선택 속성으로 몰아넣기

```ts
interface Delivery {
  status: 'READY' | 'DONE'
  doneAt?: Date
}

function doneDate(d: Delivery): string {
  if (d.status === 'DONE') {
    return d.doneAt.toISOString()
    // ❌ 'd.doneAt' is possibly 'undefined'. (TS18048)
  }
  return '-'
}
```

**왜 틀렸나:** `status`를 확인해도 `doneAt`은 여전히 선택 속성입니다. 하나의 타입 안에서는 "상태가 `'DONE'`이면 `doneAt`이 있다"는 관계를 표현할 수 없습니다.

```ts
// ✅ 상태마다 멤버를 나눈 판별 유니온으로 바꿉니다.
type Delivery =
  | { status: 'READY' }
  | { status: 'DONE'; doneAt: Date }

function doneDate(d: Delivery): string {
  if (d.status === 'DONE') {
    return d.doneAt.toISOString().slice(0, 10)
  }
  return '-'
}

console.log(doneDate({ status: 'DONE', doneAt: new Date('2026-10-05T09:00:00Z') }))
// 출력: 2026-10-05
```

## 직접 해 보기

### 문제 1 ⭐ 기초

매장 할인 정책을 판별 유니온 `Discount`로 표현하세요. 정액 할인(`kind: 'AMOUNT'`, `amount`)과 정률 할인(`kind: 'RATE'`, `rate`, 0~100) 두 가지가 있습니다. 그리고 원래 가격과 할인 정책을 받아 할인된 가격을 반환하는 `applyDiscount` 함수를 `switch`로 작성하세요.

::: details 정답 보기
```ts
type Discount =
  | { kind: 'AMOUNT'; amount: number }
  | { kind: 'RATE'; rate: number }

function applyDiscount(price: number, discount: Discount): number {
  switch (discount.kind) {
    case 'AMOUNT':
      return Math.max(0, price - discount.amount)
    case 'RATE':
      return Math.round(price * (1 - discount.rate / 100))
  }
}

console.log(applyDiscount(10000, { kind: 'AMOUNT', amount: 1500 }))
console.log(applyDiscount(10000, { kind: 'RATE', rate: 10 }))
// 출력: 8500
// 출력: 9000
```
:::

### 문제 2 ⭐ 기초

문제 1의 `applyDiscount`에 `assertNever`로 완전성 검사를 추가하세요. 그다음 `Discount`에 "1+1 행사"(`kind: 'BOGO'`)를 추가하면 어디서 어떤 오류가 나는지 확인하세요.

::: details 정답 보기
```ts
function assertNever(value: never): never {
  throw new Error(`처리하지 않은 경우: ${JSON.stringify(value)}`)
}

type Discount =
  | { kind: 'AMOUNT'; amount: number }
  | { kind: 'RATE'; rate: number }
  | { kind: 'BOGO' }

function applyDiscount(price: number, discount: Discount): number {
  switch (discount.kind) {
    case 'AMOUNT':
      return Math.max(0, price - discount.amount)
    case 'RATE':
      return Math.round(price * (1 - discount.rate / 100))
    default:
      return assertNever(discount)
      // ❌ Argument of type '{ kind: "BOGO"; }' is not assignable to parameter of type 'never'. (TS2345)
  }
}
```
`default`의 `assertNever(discount)` 호출에서 오류가 나고, 메시지에 빠뜨린 `kind: "BOGO"`가 보입니다. `case 'BOGO':`를 추가하면 오류가 사라집니다.
:::

### 문제 3 ⭐⭐ 응용

API 응답을 표현하는 판별 유니온 `ApiResult`를 만드세요.

- 로딩 중: `state: 'loading'`
- 성공: `state: 'success'`, `products: string[]`
- 실패: `state: 'error'`, `message: string`

그리고 상태에 맞는 화면 문구를 반환하는 `render` 함수를 만드세요. (성공이면 "상품 N개", 실패면 "오류: 메시지", 로딩이면 "불러오는 중...")

::: details 정답 보기
```ts
function assertNever(value: never): never {
  throw new Error(`처리하지 않은 경우: ${JSON.stringify(value)}`)
}

type ApiResult =
  | { state: 'loading' }
  | { state: 'success'; products: string[] }
  | { state: 'error'; message: string }

function render(result: ApiResult): string {
  switch (result.state) {
    case 'loading':
      return '불러오는 중...'
    case 'success':
      return `상품 ${result.products.length}개`
    case 'error':
      return `오류: ${result.message}`
    default:
      return assertNever(result)
  }
}

console.log(render({ state: 'loading' }))
console.log(render({ state: 'success', products: ['스콘', '머핀'] }))
console.log(render({ state: 'error', message: '서버 응답 없음' }))
// 출력: 불러오는 중...
// 출력: 상품 2개
// 출력: 오류: 서버 응답 없음
```
React·Vue 화면에서 데이터를 불러올 때 이 패턴을 아주 자주 씁니다.
:::

### 문제 4 ⭐⭐ 응용

아래 타입은 "불가능한 상태"를 만들 수 있습니다. 어떤 불가능한 상태가 가능한지 예를 하나 들고, 판별 유니온으로 고쳐 보세요.

```ts
interface Coupon {
  code: string
  used: boolean
  usedAt?: Date
  usedOrderNo?: string
}
```

::: details 정답 보기
`used: false`인데 `usedAt`과 `usedOrderNo`가 있는 값, 또는 `used: true`인데 `usedAt`이 없는 값을 만들 수 있습니다.

```ts
type Coupon =
  | { code: string; used: false }
  | { code: string; used: true; usedAt: Date; usedOrderNo: string }

function couponInfo(c: Coupon): string {
  if (c.used) {
    return `${c.code}: ${c.usedOrderNo} 주문에 사용`
  }
  return `${c.code}: 사용 가능`
}

console.log(couponInfo({ code: 'WELCOME', used: false }))
console.log(couponInfo({ code: 'BDAY', used: true, usedAt: new Date(), usedOrderNo: 'A-1001' }))
// 출력: WELCOME: 사용 가능
// 출력: BDAY: A-1001 주문에 사용
```
`boolean` 리터럴(`true`, `false`)도 판별 속성이 될 수 있습니다.
:::

### 문제 5 ⭐⭐⭐ 도전

주문 상태에 `'REFUNDED'`(환불됨: `refundedAt: Date`, `refundAmount: number`)를 추가하세요. 환불은 **배송 중(`SHIPPED`) 주문에서만** 가능하도록 `refund` 함수를 만들고, 결제 대기 주문을 환불하려 하면 컴파일 오류가 나는지 확인하세요.

::: details 정답 보기
```ts
interface PendingOrder {
  status: 'PENDING'
  orderNo: string
}
interface ShippedOrder {
  status: 'SHIPPED'
  orderNo: string
  paidAt: Date
  trackingNo: string
}
interface RefundedOrder {
  status: 'REFUNDED'
  orderNo: string
  refundedAt: Date
  refundAmount: number
}

function refund(order: ShippedOrder, amount: number): RefundedOrder {
  return { status: 'REFUNDED', orderNo: order.orderNo, refundedAt: new Date(), refundAmount: amount }
}

const shipped: ShippedOrder = { status: 'SHIPPED', orderNo: 'A-1', paidAt: new Date(), trackingNo: '6000-1' }
const pending: PendingOrder = { status: 'PENDING', orderNo: 'A-2' }

console.log(refund(shipped, 12000).refundAmount)
// 출력: 12000

refund(pending, 12000)
// ❌ Argument of type 'PendingOrder' is not assignable to parameter of type 'ShippedOrder'. (TS2345)
```
`Order` 유니온에 `RefundedOrder`를 추가하면, `assertNever`를 쓴 `statusMessage` 같은 함수들이 모두 컴파일 오류를 내며 "환불 상태 문구도 정해 주세요"라고 알려 줍니다.
:::

## 확인 퀴즈

1. 판별 유니온이 되려면 판별 속성은 어떤 조건을 갖춰야 하나요?
2. `switch (payment.method)`의 `case 'CASH':` 안에서 `payment`의 타입은 무엇인가요?
3. 모든 `case`를 처리했을 때 `default`에서 `payment`의 타입은 무엇인가요?
4. `assertNever`의 매개변수 타입을 `never`로 하는 이유는 무엇인가요?
5. "상태마다 가진 정보가 다른 데이터"를 선택 속성(`?`)으로 표현하면 어떤 문제가 생기나요?

::: details 정답 보기
1. 모든 멤버에 같은 이름으로 있어야 하고, 멤버마다 서로 다른 리터럴 타입이어야 합니다.
2. `method`가 `'CASH'`인 멤버, 즉 `CashPayment`입니다.
3. `never`입니다. 남은 경우가 하나도 없기 때문입니다.
4. 처리를 빠뜨린 경우가 있으면 `never`가 아닌 값이 넘어와 컴파일 오류가 나게 하려고입니다. 반환 타입도 `never`이므로 어떤 반환 타입 자리에서도 쓸 수 있습니다.
5. 불가능한 상태(결제 전인데 송장 번호가 있음)를 만들 수 있고, 상태를 확인해도 필요한 속성이 `undefined`일 수 있다고 나와 매번 확인하거나 `!`를 써야 합니다.
:::

## 정리

- 판별 유니온은 모든 멤버에 **같은 이름, 서로 다른 리터럴 타입**의 판별 속성을 둔 유니온입니다.
- `switch`나 `if`로 판별 속성을 검사하면 그 안에서 타입이 해당 멤버로 좁혀집니다.
- 모든 경우를 처리하면 남는 타입은 `never`입니다. `default`에서 `assertNever(value)`를 호출하면 빠뜨린 경우가 컴파일 오류로 드러납니다.
- 상태마다 정보가 다른 데이터는 선택 속성 대신 판별 유니온으로 나누어 **불가능한 상태를 표현할 수 없게** 만듭니다.
- 상태 전이 규칙은 함수의 매개변수·반환 타입(`pay(PendingOrder): PaidOrder`)으로 표현할 수 있습니다.
- 판별 속성은 리터럴 타입으로, 같은 유니온 안에서는 같은 이름으로 씁니다.

## 다음 단계

[제네릭 기초](./04-generics-basics): `{ ok: true; data: string[] }`의 `string[]` 자리를 상품·주문·회원 등 무엇이든 받을 수 있게 만드는 방법, "타입의 매개변수"를 배웁니다.
