---
title: "함수 타입: 선택·기본·나머지 매개변수와 오버로드"
---

# 함수 타입: 선택·기본·나머지 매개변수와 오버로드

<LessonMeta level="초급" :minutes="60" prev="객체 타입, 선택 속성, readonly, 인덱스 시그니처" />

## 이번에 배울 것

- 함수의 매개변수와 반환값에 타입을 붙이고, 선택·기본·나머지 매개변수를 쓸 수 있다.
- **함수 타입 표현식** `(a: number) => number`로 "함수 자체의 타입"을 쓸 수 있다.
- 콜백 함수의 타입을 정의하고, **void 반환 콜백 규칙**이 왜 있는지 설명할 수 있다.
- **오버로드**로 입력에 따라 다른 반환 타입을 표현할 수 있다.
- `this` 매개변수가 무엇을 막아 주는지 맛보기로 이해할 수 있다.

## 먼저 알아 둘 것

- [함수 기초: 선언 · 화살표 함수 · 매개변수 · 반환값](../part1-basics/06-functions)
- [타입 표기와 타입 추론](./01-annotation-inference) — 매개변수는 표기, 콜백 매개변수는 추론
- [특수 타입](./02-special-types) — `void`와 `undefined`의 차이
- [객체 타입](./04-object-types) — 선택 속성 `?`

## 비유로 이해하기

매장의 **커피 머신**을 생각해 보세요. 머신 옆에는 사용 설명서가 붙어 있습니다.

> 넣는 것: 원두(필수), 우유(선택), 샷 추가 횟수(기본값 0)
> 나오는 것: 커피 한 잔

이 설명서가 **함수 타입**입니다. 머신 내부가 어떻게 생겼는지는 몰라도, 설명서만 보면 "무엇을 넣으면 무엇이 나오는지" 알 수 있습니다.

매장에서는 이런 머신을 **교체**하기도 합니다. 새 머신이 기존 설명서와 똑같이 "원두를 넣으면 커피가 나온다"면 그대로 바꿔 끼울 수 있습니다. 함수를 다른 함수에 넘기는 **콜백**도 같습니다. "이런 설명서에 맞는 함수를 주세요"라고 요구하는 것입니다.

## 개념 설명

### 1단계: 매개변수와 반환 타입 복습

[01 레슨](./01-annotation-inference)에서 본 것처럼 매개변수 뒤에 `: 타입`, 괄호 뒤에 `: 반환타입`을 씁니다.

```ts
function getLineAmount(unitPrice: number, quantity: number): number {
  return unitPrice * quantity
}

const formatWon = (amount: number): string => `${amount.toLocaleString('ko-KR')}원`

console.log(formatWon(getLineAmount(4500, 3)))
// 출력: 13,500원
```

TypeScript는 **인수의 개수**도 검사합니다. JavaScript는 개수가 달라도 조용히 넘어가지만, TypeScript는 오류로 알려 줍니다.

```ts
function getLineAmount(unitPrice: number, quantity: number): number {
  return unitPrice * quantity
}

getLineAmount(4500)
// ❌ Expected 2 arguments, but got 1. (TS2554)

getLineAmount(4500, 2, 1000)
// ❌ Expected 2 arguments, but got 3. (TS2554)
```

### 2단계: 선택 매개변수 `?`

넘겨도 되고 안 넘겨도 되는 매개변수는 이름 뒤에 `?`를 붙입니다. [04 레슨](./04-object-types)의 선택 속성과 같은 기호입니다.

```ts
function formatMemberName(name: string, grade?: string): string {
  // grade의 타입: string | undefined
  if (grade === undefined) {
    return name
  }
  return `[${grade}] ${name}`
}

console.log(formatMemberName('김민지'))
// 출력: 김민지
console.log(formatMemberName('박서준', 'VIP'))
// 출력: [VIP] 박서준
```

선택 매개변수는 **필수 매개변수 뒤에만** 올 수 있습니다. 앞에 오면 "두 번째 값만 넘기고 싶다"를 표현할 방법이 없기 때문입니다.

```ts
function formatMemberName(grade?: string, name: string): string {
  // ❌ A required parameter cannot follow an optional parameter. (TS1016)
  return `${grade} ${name}`
}
```

### 3단계: 기본 매개변수

값을 안 넘겼을 때 쓸 **기본값**을 `= 값`으로 정할 수 있습니다. 기본값이 있으면 타입은 기본값에서 추론되므로 따로 표기하지 않아도 됩니다.

```ts
function getSalePrice(price: number, discountRate = 0): number {
  // discountRate의 타입: number (기본값 0에서 추론)
  return price * (1 - discountRate)
}

console.log(getSalePrice(5000))
// 출력: 5000
console.log(getSalePrice(5000, 0.1))
// 출력: 4500
```

선택 매개변수와 비교하면 다음과 같습니다.

| | 선택 `rate?: number` | 기본값 `rate = 0` |
|---|---|---|
| 안 넘기면 | `undefined` | `0` |
| 함수 안에서의 타입 | `number \| undefined` | `number` |
| 확인 코드 | 필요 | 필요 없음 |

"안 넘기면 이 값"이 분명하면 **기본 매개변수가 더 편합니다.** 함수 안에서 `undefined` 확인이 필요 없기 때문입니다.

### 4단계: 나머지 매개변수

인수 개수가 정해지지 않을 때는 **나머지 매개변수**(rest parameter, `...이름`)를 씁니다. 받은 값들은 배열로 모이므로 타입도 **배열 타입**으로 씁니다.

```ts
function sumPrices(...prices: number[]): number {
  return prices.reduce((sum, p) => sum + p, 0)
}

console.log(sumPrices())
// 출력: 0
console.log(sumPrices(4500, 5000, 3000))
// 출력: 12500
```

앞에 일반 매개변수를 두고 나머지를 맨 뒤에 둘 수도 있습니다.

```ts
function printReceipt(storeName: string, ...items: string[]): void {
  console.log(`[${storeName}] ${items.join(', ')}`)
}

printReceipt('강남점', '아메리카노', '카페라테')
// 출력: [강남점] 아메리카노, 카페라테
```

배열을 펼쳐서(`...`) 넘길 수도 있습니다.

```ts
function sumPrices(...prices: number[]): number {
  return prices.reduce((sum, p) => sum + p, 0)
}

const cart = [4500, 5000]
console.log(sumPrices(...cart))
// 출력: 9500
```

### 5단계: 함수 타입 표현식 — 함수 자체의 타입

JavaScript에서 함수는 값입니다. 변수에 담고, 다른 함수에 넘길 수 있습니다. 그렇다면 **함수를 담는 변수의 타입**은 어떻게 쓸까요? **함수 타입 표현식**(function type expression)을 씁니다.

```text
(매개변수: 타입, ...) => 반환타입
```

```ts
// "숫자 하나를 받아 숫자를 돌려주는 함수" 타입
let calcFee: (amount: number) => number

calcFee = (amount) => (amount >= 30000 ? 0 : 3000)
console.log(calcFee(25000))
// 출력: 3000

calcFee = (amount) => `${amount}원`
// ❌ Type 'string' is not assignable to type 'number'. (TS2322)
```

- 화살표 함수처럼 생겼지만 `=>` 뒤에는 **반환 타입**을 씁니다. 실제 함수 코드가 아닙니다.
- `calcFee`에 넣는 화살표 함수의 `amount`에는 타입을 쓰지 않았습니다. 변수 타입을 보고 **문맥으로 추론**되기 때문입니다.
- 매개변수 이름(`amount`)은 설명용일 뿐, 실제 함수의 매개변수 이름과 달라도 됩니다.

함수 타입도 길어지므로 `type`으로 이름을 붙여 쓰는 경우가 많습니다.

```ts
type DiscountPolicy = (price: number) => number

const noDiscount: DiscountPolicy = (price) => price
const tenPercent: DiscountPolicy = (price) => price * 0.9
const minus1000: DiscountPolicy = (price) => Math.max(price - 1000, 0)

const policies = [noDiscount, tenPercent, minus1000] // 타입: DiscountPolicy[]
console.log(policies.map((policy) => policy(5000)))
// 출력: [ 5000, 4500, 4000 ]
```

집합으로 보면 `DiscountPolicy`는 **"숫자를 받아 숫자를 돌려주는 함수들을 모두 모은 집합"** 입니다. `noDiscount`, `tenPercent`, `minus1000`은 모두 그 집합의 원소입니다.

::: info 매개변수가 더 적은 함수도 넣을 수 있습니다
`(price: number) => number` 자리에 `() => 0`처럼 **매개변수가 더 적은** 함수를 넣어도 됩니다. 넘겨받은 값을 안 쓰는 것은 안전하기 때문입니다. `[1, 2].map(() => 0)`이 되는 것과 같은 원리입니다. 반대로 매개변수가 **더 많은** 함수는 넣을 수 없습니다. 이런 함수 타입 호환 규칙은 [Part 5 변성](../part5-advanced/07-variance)에서 자세히 다룹니다.
:::

### 6단계: 콜백 함수의 타입

함수 타입 표현식이 가장 많이 쓰이는 곳은 **콜백**(callback, 다른 함수에 넘겨서 나중에 불리게 하는 함수)입니다.

```ts
type OrderItem = { name: string; price: number }

function forEachItem(items: OrderItem[], callback: (item: OrderItem, index: number) => void): void {
  for (let i = 0; i < items.length; i++) {
    callback(items[i], i)
  }
}

const items: OrderItem[] = [
  { name: '아메리카노', price: 4500 },
  { name: '카페라테', price: 5000 },
]

forEachItem(items, (item, index) => {
  console.log(`${index + 1}. ${item.name}`)
})
// 출력: 1. 아메리카노
// 출력: 2. 카페라테
```

- `callback` 매개변수의 타입이 "`OrderItem`과 숫자를 받고 아무것도 돌려주지 않는 함수"입니다.
- 호출하는 쪽에서 넘긴 화살표 함수의 `item`, `index`는 **문맥으로 추론**되어 타입을 쓸 필요가 없습니다.

### 7단계: void 반환 콜백 규칙

[02 레슨](./02-special-types)에서 "콜백의 `void`는 '반환값을 무시한다'는 뜻"이라고 했습니다. 다시 정리하면 이렇습니다.

> 함수 **타입**의 반환이 `void`이면, **값을 돌려주는 함수도** 그 자리에 넣을 수 있다. 돌려준 값은 무시된다.

```ts
type Logger = (message: string) => void

const logs: string[] = []

// push는 숫자(새 길이)를 돌려주지만 Logger 자리에 넣을 수 있음
const saveLog: Logger = (message) => logs.push(message)

saveLog('주문 접수')
saveLog('결제 완료')
console.log(logs)
// 출력: [ '주문 접수', '결제 완료' ]
```

왜 이런 규칙이 있을까요? 이 규칙이 없다면 다음처럼 흔한 코드가 모두 오류가 됩니다.

```ts
const orderNos = ['A-1001', 'A-1002']
const copied: string[] = []

// forEach 콜백의 반환 타입은 void
// 화살표 함수가 push의 결과(숫자)를 돌려주지만 문제없음
orderNos.forEach((no) => copied.push(no))
console.log(copied)
// 출력: [ 'A-1001', 'A-1002' ]
```

**주의**: 이 너그러운 규칙은 **함수 타입을 통해 넣을 때만** 적용됩니다. 함수 선언에 직접 `: void`라고 쓰면 값을 돌려주는 순간 오류입니다.

```ts
function saveOrder(orderNo: string): void {
  return orderNo.length
  // ❌ Type 'number' is not assignable to type 'void'. (TS2322)
}
```

| 상황 | 값을 돌려주면? |
|---|---|
| 함수 **타입**의 반환이 `void` (콜백 자리) | 허용, 돌려준 값은 무시됨 |
| 함수 **선언**에 직접 `: void` | 오류 (TS2322) |

### 8단계: 함수 타입을 객체 속성에 쓰기

객체의 속성이 함수일 때도 같은 표현식을 씁니다. 메서드 문법으로도 쓸 수 있습니다.

```ts
type PaymentMethod = {
  name: string
  pay: (amount: number) => boolean // 속성 문법
  refund(amount: number): boolean // 메서드 문법
}

const card: PaymentMethod = {
  name: '신용카드',
  pay: (amount) => {
    console.log(`${amount}원 카드 결제`)
    return true
  },
  refund(amount) {
    console.log(`${amount}원 카드 환불`)
    return true
  },
}

card.pay(9000)
// 출력: 9000원 카드 결제
card.refund(9000)
// 출력: 9000원 카드 환불
```

두 문법은 대부분 같게 동작하지만, 함수 타입 호환성 검사가 미묘하게 다릅니다. 팀 규칙으로 하나를 고르면 되고, 이 위키는 검사가 더 엄격한 **속성 문법**을 기본으로 씁니다. 차이는 [Part 5 변성](../part5-advanced/07-variance)에서 다룹니다.

### 9단계: 오버로드 — 입력에 따라 다른 반환 타입

같은 함수가 **입력 타입에 따라 다른 타입을 돌려줄** 때가 있습니다. 예를 들어 "상품 코드 하나를 넣으면 상품 하나, 코드 배열을 넣으면 상품 배열"을 돌려주는 함수입니다.

유니온으로만 쓰면 결과 타입이 뭉뚱그려집니다.

```ts
type Product = { code: string; name: string }

function findProduct(code: string | string[]): Product | Product[] {
  if (Array.isArray(code)) {
    return code.map((c) => ({ code: c, name: `상품 ${c}` }))
  }
  return { code, name: `상품 ${code}` }
}

const one = findProduct('P001') // 타입: Product | Product[]
console.log(one.name)
// ❌ Property 'name' does not exist on type 'Product | Product[]'. (TS2339)
```

문자열 하나를 넣었으니 결과는 분명히 `Product` 하나인데, TypeScript는 그 관계를 모릅니다. **오버로드**(overload, 같은 이름의 함수에 여러 호출 모양을 정의하는 것)로 관계를 알려 줍니다.

```ts
type Product = { code: string; name: string }

// 1) 오버로드 시그니처: 바깥에서 보이는 호출 모양들 (몸통 없음)
function findProduct(code: string): Product
function findProduct(codes: string[]): Product[]
// 2) 구현 시그니처: 실제 코드 (바깥에서는 보이지 않음)
function findProduct(code: string | string[]): Product | Product[] {
  if (Array.isArray(code)) {
    return code.map((c) => ({ code: c, name: `상품 ${c}` }))
  }
  return { code, name: `상품 ${code}` }
}

const one = findProduct('P001') // 타입: Product
const many = findProduct(['P001', 'P002']) // 타입: Product[]

console.log(one.name, many.length)
// 출력: 상품 P001 2
```

- **오버로드 시그니처**(overload signature): 몸통 없이 `function 이름(매개변수): 반환타입` 만 쓴 줄들입니다. 호출하는 쪽은 이것만 봅니다.
- **구현 시그니처**(implementation signature): 실제 코드가 있는 마지막 함수입니다. 모든 오버로드를 받아들일 수 있게 넓게 씁니다.
- 호출할 때는 위에서부터 차례로 맞는 시그니처를 찾습니다.

오버로드에 없는 모양으로 부르면 오류가 납니다. 구현 시그니처가 `string | string[]`을 받더라도 바깥에서는 보이지 않기 때문입니다.

```ts
type Product = { code: string; name: string }

function findProduct(code: string): Product
function findProduct(codes: string[]): Product[]
function findProduct(code: string | string[]): Product | Product[] {
  if (Array.isArray(code)) {
    return code.map((c) => ({ code: c, name: `상품 ${c}` }))
  }
  return { code, name: `상품 ${code}` }
}

function search(input: string | string[]) {
  return findProduct(input)
  // ❌ No overload matches this call. (TS2769)
}
```

::: warning 오버로드는 꼭 필요할 때만
오버로드는 구현 시그니처 안에서 **타입 검사가 느슨해지기 쉽습니다.** 구현 함수가 `string`을 받았을 때 실수로 배열을 돌려줘도 컴파일러가 잡지 못합니다. 그래서 실무에서는 다음 순서로 고민합니다.

1. 함수를 둘로 나눌 수 있으면 나눕니다(`findProduct`, `findProducts`). **가장 단순하고 안전합니다.**
2. 입력과 출력의 관계를 표현해야 하면 [제네릭](../part3-intermediate/04-generics-basics)이나 [조건부 타입](../part5-advanced/01-conditional-types)을 검토합니다.
3. 그래도 안 되면 오버로드를 씁니다.
:::

### 10단계: this 매개변수 맛보기

JavaScript의 `this`는 **함수를 어떻게 부르느냐에 따라** 가리키는 대상이 바뀝니다. 메서드를 변수에 꺼내 부르면 `this`가 사라지는 실수가 흔합니다. TypeScript는 함수 첫 자리에 **`this` 매개변수**를 써서 "`this`는 이런 모양이어야 한다"고 정할 수 있습니다.

```ts
type Cart = {
  items: string[]
  addItem: (this: Cart, name: string) => void
}

const cart: Cart = {
  items: [],
  addItem(name) {
    this.items.push(name) // this의 타입: Cart
  },
}

cart.addItem('아메리카노') // ✅ cart.를 통해 부르면 this는 cart
console.log(cart.items)
// 출력: [ '아메리카노' ]

const add = cart.addItem
add('카페라테')
// ❌ The 'this' context of type 'void' is not assignable to method's 'this' of type 'Cart'. (TS2684)
```

- `this: Cart`는 진짜 매개변수가 아닙니다. 호출할 때 넘기지 않으며, 컴파일하면 사라집니다.
- `add('카페라테')`처럼 객체 없이 부르면 `this`가 없으므로 컴파일러가 막아 줍니다. JavaScript였다면 실행 중에 `Cannot read properties of undefined` 오류가 났을 코드입니다.

`this`는 클래스와 함께 쓸 때 더 중요해집니다. [Part 3 클래스](../part3-intermediate/08-classes)에서 다시 봅니다.

## 자주 하는 실수

### 실수 1: 선택 매개변수를 확인 없이 쓰기

```ts
function getPointText(point?: number): string {
  return point.toLocaleString('ko-KR') + 'P'
  // ❌ 'point' is possibly 'undefined'. (TS18048)
}
```

왜 틀렸나: `point?`는 `number | undefined`입니다. 안 넘기면 `undefined.toLocaleString()`이 되어 실행 중에 터집니다.

고친 코드: "안 넘기면 0"이 분명하므로 기본 매개변수로 바꿉니다.

```ts
function getPointText(point = 0): string {
  return point.toLocaleString('ko-KR') + 'P'
}

console.log(getPointText(), getPointText(12000))
// 출력: 0P 12,000P
```

### 실수 2: 함수 타입에서 매개변수 이름을 빼먹기

```ts
type PriceFormatter = (number) => string
// ❌ Parameter has a name but no type. Did you mean 'arg0: number'? (TS7051)
```

왜 틀렸나: 함수 타입 표현식에서는 **매개변수 이름이 필수**입니다. `(number) => string`은 "이름이 `number`이고 타입이 없는(any) 매개변수"로 읽힙니다.

고친 코드:

```ts
type PriceFormatter = (price: number) => string

const formatWon: PriceFormatter = (price) => `${price}원`
console.log(formatWon(4500))
// 출력: 4500원
```

### 실수 3: 콜백 매개변수에 다른 타입을 쓰기

```ts
type OrderHandler = (orderNo: string) => void

const handler: OrderHandler = (orderNo: number) => {
  // ❌ Type '(orderNo: number) => void' is not assignable to type 'OrderHandler'. (TS2322)
  console.log(orderNo)
}
```

왜 틀렸나: `OrderHandler`는 문자열을 넘겨주겠다고 약속했는데, 넣은 함수는 숫자를 기대합니다. 호출되는 순간 숫자 메서드를 쓰면 터질 수 있습니다.

고친 코드: 콜백 매개변수 타입은 **비워 두고 문맥 추론에 맡기면** 이런 실수가 없습니다.

```ts
type OrderHandler = (orderNo: string) => void

const handler: OrderHandler = (orderNo) => {
  console.log(`주문 ${orderNo} 처리`)
}
handler('A-1001')
// 출력: 주문 A-1001 처리
```

### 실수 4: 오버로드 시그니처와 구현이 맞지 않기

```ts
function toWon(amount: number): string
function toWon(amounts: number[]): string[]
function toWon(amount: number): string {
  // ❌ This overload signature is not compatible with its implementation signature. (TS2394)
  return `${amount}원`
}
```

왜 틀렸나: 구현 시그니처는 **모든 오버로드를 받아들일 수 있어야** 합니다. 배열을 받는 오버로드가 있는데 구현은 숫자만 받습니다. 오류는 맞지 않는 오버로드 줄(두 번째 줄)에 표시됩니다.

고친 코드:

```ts
function toWon(amount: number): string
function toWon(amounts: number[]): string[]
function toWon(amount: number | number[]): string | string[] {
  if (Array.isArray(amount)) {
    return amount.map((a) => `${a}원`)
  }
  return `${amount}원`
}

console.log(toWon(4500), toWon([4500, 5000]))
// 출력: 4500원 [ '4500원', '5000원' ]
```

## 직접 해 보기

### 문제 1 ⭐ 선택·기본 매개변수

`makeOrderLabel` 함수를 작성하세요.

- `orderNo`(문자열, 필수)
- `tableNo`(숫자, 선택) — 있으면 `"A-1001 (3번 테이블)"`, 없으면 `"A-1001 (포장)"`
- `prefix`(문자열, 기본값 `'주문'`) — 결과 앞에 붙임

::: details 정답 보기
```ts
function makeOrderLabel(orderNo: string, tableNo?: number, prefix = '주문'): string {
  const where = tableNo === undefined ? '포장' : `${tableNo}번 테이블`
  return `${prefix} ${orderNo} (${where})`
}

console.log(makeOrderLabel('A-1001'))
// 출력: 주문 A-1001 (포장)
console.log(makeOrderLabel('A-1002', 3))
// 출력: 주문 A-1002 (3번 테이블)
console.log(makeOrderLabel('A-1003', 5, '추가'))
// 출력: 추가 A-1003 (5번 테이블)
```

선택 매개변수 `tableNo?`가 있으므로 그 뒤의 `prefix`도 생략할 수 있어야 합니다. 기본값이 있는 매개변수는 생략 가능하므로 문제없습니다.
:::

### 문제 2 ⭐ 나머지 매개변수

포인트를 여러 개 받아 합계를 돌려주되, 첫 번째 인수로 회원 이름을 받는 함수 `addPoints`를 작성하세요. 결과는 `"김민지: 3500P"` 형태의 문자열입니다.

::: details 정답 보기
```ts
function addPoints(memberName: string, ...points: number[]): string {
  const total = points.reduce((sum, p) => sum + p, 0)
  return `${memberName}: ${total}P`
}

console.log(addPoints('김민지', 1000, 2000, 500))
// 출력: 김민지: 3500P
```
:::

### 문제 3 ⭐⭐ 함수 타입으로 정책 바꿔 끼우기

배송비 정책 타입 `ShippingPolicy`를 "주문 금액(숫자)을 받아 배송비(숫자)를 돌려주는 함수"로 정의하고, 다음 두 정책을 만든 뒤 `calcPayAmount(amount, policy)` 함수로 결제 금액을 계산하세요.

- `standard`: 30,000원 이상 무료, 아니면 3,000원
- `alwaysFree`: 항상 0원

::: details 정답 보기
```ts
type ShippingPolicy = (amount: number) => number

const standard: ShippingPolicy = (amount) => (amount >= 30000 ? 0 : 3000)
const alwaysFree: ShippingPolicy = () => 0

function calcPayAmount(amount: number, policy: ShippingPolicy): number {
  return amount + policy(amount)
}

console.log(calcPayAmount(20000, standard), calcPayAmount(20000, alwaysFree))
// 출력: 23000 20000
```

`alwaysFree`는 매개변수를 하나도 받지 않지만 `ShippingPolicy` 자리에 넣을 수 있습니다. 넘겨받은 값을 안 쓰는 것은 안전하기 때문입니다.
:::

### 문제 4 ⭐⭐ void 반환 규칙 판단하기

다음 세 코드 중 오류가 나는 것을 고르고 이유를 설명하세요.

```ts
// 문제: 오류가 나는 것을 고르세요
type Notify = (message: string) => void

// (1)
const n1: Notify = (message) => message.length

// (2)
function n2(message: string): void {
  return message.length
}

// (3)
const sent: string[] = []
const n3: Notify = (message) => sent.push(message)
```

::: details 정답 보기
(2)만 오류입니다.

```ts
type Notify = (message: string) => void

const n1: Notify = (message) => message.length

function n2(message: string): void {
  return message.length
  // ❌ Type 'number' is not assignable to type 'void'. (TS2322)
}

const sent: string[] = []
const n3: Notify = (message) => sent.push(message)
```

(1), (3)은 반환 타입이 `void`인 **함수 타입** 자리에 넣었으므로 돌려준 값이 무시됩니다. (2)는 함수 **선언**에 직접 `: void`를 썼으므로 값을 돌려주면 오류입니다.
:::

### 문제 5 ⭐⭐⭐ 오버로드 작성하기

`parseAmount` 함수에 오버로드를 붙이세요.

- 문자열 `'4,500'`을 넣으면 숫자 `4500`을 돌려줍니다.
- 문자열 배열을 넣으면 숫자 배열을 돌려줍니다.

```ts
// 문제: 오버로드 시그니처를 추가하세요
function parseAmount(input: string | string[]): number | number[] {
  if (Array.isArray(input)) {
    return input.map((s) => Number(s.replaceAll(',', '')))
  }
  return Number(input.replaceAll(',', ''))
}

const a = parseAmount('4,500') // 지금은 number | number[]
```

::: details 정답 보기
```ts
function parseAmount(input: string): number
function parseAmount(input: string[]): number[]
function parseAmount(input: string | string[]): number | number[] {
  if (Array.isArray(input)) {
    return input.map((s) => Number(s.replaceAll(',', '')))
  }
  return Number(input.replaceAll(',', ''))
}

const a = parseAmount('4,500') // 타입: number
const b = parseAmount(['1,000', '12,000']) // 타입: number[]
console.log(a + 500, b)
// 출력: 5000 [ 1000, 12000 ]
```

`replaceAll`은 ES2021 기능입니다. `tsconfig.json`의 `lib`(또는 `target`)이 `es2021` 이상이어야 타입 오류가 나지 않습니다. 함수를 `parseAmount`와 `parseAmounts` 둘로 나누는 것도 좋은 답입니다.
:::

## 확인 퀴즈

1. 선택 매개변수 `rate?: number`와 기본 매개변수 `rate = 0`은 함수 안에서 타입이 어떻게 다른가요?
2. 나머지 매개변수 `...items`의 타입은 왜 배열 타입으로 쓰나요?
3. 함수 타입 표현식 `(amount: number) => number`에서 `=>` 뒤에 오는 것은 무엇인가요?
4. `type Fn = () => void` 자리에 숫자를 돌려주는 함수를 넣을 수 있나요?
5. 오버로드에서 호출하는 쪽에 보이는 것은 오버로드 시그니처인가요, 구현 시그니처인가요?

::: details 정답 보기
1. 선택 매개변수는 `number | undefined`, 기본 매개변수는 `number`입니다.
2. 넘긴 인수들이 실행할 때 배열로 모이기 때문입니다.
3. 반환 타입입니다. 실제 함수 몸통이 아닙니다.
4. 넣을 수 있습니다. 함수 타입의 반환이 `void`이면 돌려준 값은 무시됩니다.
5. 오버로드 시그니처만 보입니다. 구현 시그니처는 바깥에서 보이지 않습니다.
:::

## 정리

- 매개변수와 반환값에 타입을 붙이며, TypeScript는 **인수 개수**까지 검사합니다.
- 선택 매개변수 `x?`는 `| undefined`가 붙고 필수 매개변수 뒤에만 옵니다. 기본값이 분명하면 **기본 매개변수**가 더 편합니다.
- 나머지 매개변수 `...xs: T[]`는 배열 타입으로 씁니다.
- **함수 타입 표현식** `(a: A) => R`로 함수 자체의 타입을 쓰고, 콜백 매개변수는 문맥 추론에 맡깁니다.
- 반환이 `void`인 **함수 타입** 자리에는 값을 돌려주는 함수도 넣을 수 있습니다(값은 무시). 함수 선언의 `: void`는 엄격합니다.
- **오버로드**는 입력에 따라 반환 타입이 다를 때 씁니다. 함수를 나눌 수 있으면 나누는 것이 먼저입니다.
- `this` 매개변수로 `this`의 모양을 정하면 메서드를 떼어 내 부르는 실수를 막을 수 있습니다.

## 다음 단계

[유니온 타입과 리터럴 타입](./06-union-literal) — 지금까지 여러 번 본 `string | undefined`, `'READY' | 'PAID'`의 정체인 유니온과 리터럴 타입을 제대로 배웁니다. 주문 상태처럼 "정해진 값 중 하나"를 타입으로 표현하는 법입니다.
