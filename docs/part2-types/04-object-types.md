---
title: "객체 타입: 선택 속성 · readonly · 인덱스 시그니처"
---

# 객체 타입: 선택 속성 · readonly · 인덱스 시그니처

<LessonMeta level="초급" :minutes="50" prev="배열 타입, readonly 배열, 튜플과 as const" />

## 이번에 배울 것

- 객체 리터럴 타입 `{ 이름: 타입; ... }`으로 상품·회원·주문 객체의 모양을 표현할 수 있다.
- 선택 속성(`?`)과 `readonly` 속성을 쓰고, `readonly`가 **얕게** 적용된다는 점을 설명할 수 있다.
- **초과 속성 검사**가 언제 일어나고 언제 일어나지 않는지 설명할 수 있다.
- 키를 미리 알 수 없는 객체를 **인덱스 시그니처**로 표현하고, `noUncheckedIndexedAccess`가 왜 필요한지 설명할 수 있다.
- 중첩 객체 타입을 쓰고, 객체 타입을 함수 매개변수에 활용할 수 있다.

## 먼저 알아 둘 것

- [객체: 속성 · 메서드 · 구조 분해 · 스프레드](../part1-basics/08-objects)
- [타입 표기와 타입 추론](./01-annotation-inference)
- [배열 타입과 튜플](./03-arrays-tuples) — `readonly`와 "배열 칸 꺼내기는 믿어 주는 것"

## 비유로 이해하기

택배 송장 양식을 떠올려 보세요. 양식에는 칸이 정해져 있습니다.

- **받는 사람**, **주소**, **전화번호**: 반드시 채워야 하는 칸 → **필수 속성**
- **배송 메모**: 비워 둬도 되는 칸 → **선택 속성**(`?`)
- **송장 번호**: 인쇄되어 나오며 손으로 고칠 수 없는 칸 → **`readonly` 속성**

양식에 없는 칸("좋아하는 색깔")을 볼펜으로 덧붙여 쓰면 접수 직원이 "이런 칸은 없는데요?" 하고 되묻습니다. 이것이 **초과 속성 검사**입니다.

한편 매장별 재고표처럼 **칸 이름이 미리 정해지지 않은** 장부도 있습니다. "어떤 상품 코드든 칸 이름이 될 수 있고, 값은 항상 수량"이라는 규칙만 있지요. 이것이 **인덱스 시그니처**입니다.

## 개념 설명

### 1단계: 객체 리터럴 타입

객체의 타입은 **중괄호 안에 `속성이름: 타입`** 을 나열해서 씁니다. 속성 사이는 세미콜론(`;`)이나 쉼표(`,`)로 구분합니다. 이 위키는 세미콜론을 씁니다.

```ts
const product: { code: string; name: string; price: number } = {
  code: 'P001',
  name: '아메리카노',
  price: 4500,
}

console.log(`${product.name} ${product.price}원`)
// 출력: 아메리카노 4500원
```

집합으로 보면 `{ code: string; name: string; price: number }`는 **"`code`·`name`은 문자열, `price`는 숫자인 속성을 가진 객체들을 모두 모은 집합"** 입니다.

타입에 적힌 속성이 빠지거나 타입이 다르면 오류입니다.

```ts
const p1: { code: string; name: string; price: number } = {
  code: 'P001',
  name: '아메리카노',
}
// ❌ Property 'price' is missing in type '{ code: string; name: string; }' but required in type '{ code: string; name: string; price: number; }'. (TS2741)

const p2: { code: string; name: string; price: number } = {
  code: 'P002',
  name: '카페라테',
  price: '5000',
  // ❌ Type 'string' is not assignable to type 'number'. (TS2322)
}
```

`is missing ... but required`는 "필수인 속성이 빠졌다"는 뜻입니다.

같은 타입을 여러 번 쓰면 길고 고치기도 어려우므로 **타입 별칭**(type alias, 타입에 이름을 붙이는 문법)으로 이름을 붙여 둡니다. 자세한 내용은 [07 레슨](./07-type-alias-interface)에서 배우고, 이 레슨부터는 `type 이름 = ...` 형태를 계속 쓰겠습니다.

```ts
type Product = {
  code: string
  name: string
  price: number
}

const americano: Product = { code: 'P001', name: '아메리카노', price: 4500 }
const latte: Product = { code: 'P002', name: '카페라테', price: 5000 }

console.log(americano.price + latte.price)
// 출력: 9500
```

여러 줄로 쓸 때는 줄바꿈이 구분 기호 역할을 하므로 세미콜론을 생략해도 됩니다.

### 2단계: 객체 타입의 추론

값과 함께 만들면 객체 타입도 추론됩니다. [01 레슨](./01-annotation-inference)에서 본 것처럼 속성 값은 넓혀집니다.

```ts
const member = {
  memberNo: 'M001',
  name: '김민지',
  point: 1200,
}
// member 위에 마우스를 올리면:
// const member: { memberNo: string; name: string; point: number; }

member.point = 1500 // ✅
member.grade = 'VIP'
// ❌ Property 'grade' does not exist on type '{ memberNo: string; name: string; point: number; }'. (TS2339)
```

JavaScript에서는 객체에 새 속성을 아무 때나 붙일 수 있었지만, TypeScript에서는 **처음 정해진 모양에 없는 속성을 붙일 수 없습니다.** 오타(`member.piont = 0`)를 잡아 주는 고마운 규칙입니다.

### 3단계: 선택 속성 `?`

있어도 되고 없어도 되는 속성은 이름 뒤에 **`?`** 를 붙입니다.

```ts
type Member = {
  memberNo: string
  name: string
  phone?: string // 선택 속성
}

const m1: Member = { memberNo: 'M001', name: '김민지', phone: '010-0000-0000' }
const m2: Member = { memberNo: 'M002', name: '박서준' } // phone 없어도 OK

const phone = m2.phone // 타입: string | undefined
console.log(phone)
// 출력: undefined
```

선택 속성을 꺼내면 타입이 `string | undefined`가 됩니다. 집합으로 보면 "문자열 집합"에 `undefined` 값 하나를 **합친(합집합)** 것입니다. 그래서 바로 문자열처럼 쓰면 오류가 납니다.

```ts
type Member = {
  memberNo: string
  name: string
  phone?: string
}

function getMaskedPhone(member: Member): string {
  return member.phone.slice(-4)
  // ❌ 'member.phone' is possibly 'undefined'. (TS18048)
}
```

`possibly 'undefined'`는 "undefined일 수도 있다"는 뜻입니다. 먼저 확인하면 해결됩니다.

```ts
type Member = {
  memberNo: string
  name: string
  phone?: string
}

function getMaskedPhone(member: Member): string {
  if (member.phone === undefined) {
    return '번호 없음'
  }
  return '***-' + member.phone.slice(-4) // 여기서 phone은 string
}

console.log(getMaskedPhone({ memberNo: 'M001', name: '김민지', phone: '010-1234-5678' }))
// 출력: ***-5678
console.log(getMaskedPhone({ memberNo: 'M002', name: '박서준' }))
// 출력: 번호 없음
```

`if`로 확인한 뒤에는 `phone`이 `string`으로 좁혀집니다. 이 원리는 [08 타입 좁히기](./08-narrowing)에서 자세히 배웁니다. 더 짧게 쓰고 싶다면 **옵셔널 체이닝**(`?.`, 값이 없으면 멈추고 `undefined`를 돌려주는 문법)과 **널 병합 연산자**(`??`, 왼쪽이 `null`/`undefined`면 오른쪽 값을 쓰는 연산자)를 씁니다.

```ts
type Member = { memberNo: string; name: string; phone?: string }

const m: Member = { memberNo: 'M002', name: '박서준' }
const tail = m.phone?.slice(-4) ?? '없음'
console.log(tail)
// 출력: 없음
```

### 4단계: readonly 속성

한 번 정하면 바꾸면 안 되는 속성(주문 번호, 회원 번호 등)에는 **`readonly`** 를 붙입니다.

```ts
type Order = {
  readonly orderNo: string
  amount: number
}

const order: Order = { orderNo: 'A-1001', amount: 9000 }
order.amount = 12000 // ✅
order.orderNo = 'A-9999'
// ❌ Cannot assign to 'orderNo' because it is a read-only property. (TS2540)
```

`readonly`도 타입 검사에만 쓰이고 실행할 때는 사라집니다. 실행 중에 정말로 바꾸지 못하게 하려면 JavaScript의 `Object.freeze()`를 써야 합니다.

### 5단계: readonly는 얕다

`readonly`는 **바로 그 속성 한 칸**만 막습니다. 그 속성에 들어 있는 객체나 배열의 **안쪽**까지는 막지 않습니다. 이것을 "얕다(shallow)"고 표현합니다.

```ts
type Order = {
  readonly orderNo: string
  readonly items: string[]
}

const order: Order = { orderNo: 'A-1001', items: ['아메리카노'] }

order.items = []
// ❌ Cannot assign to 'items' because it is a read-only property. (TS2540)

order.items.push('카페라테') // ✅ 오류 없음! 배열 안쪽은 막지 않음
```

`items` 칸에 **다른 배열을 넣는 것**은 막았지만, 그 배열에 `push`하는 것은 막지 못했습니다. 안쪽까지 막으려면 안쪽 타입에도 `readonly`를 붙입니다.

```ts
type Order = {
  readonly orderNo: string
  readonly items: readonly string[]
}

const order: Order = { orderNo: 'A-1001', items: ['아메리카노'] }
order.items.push('카페라테')
// ❌ Property 'push' does not exist on type 'readonly string[]'. (TS2339)
```

::: tip 깊은 readonly
객체 안의 모든 단계에 `readonly`를 붙이는 "깊은 readonly" 타입은 직접 만들 수 있습니다. 원리는 [Part 5 매핑된 타입](../part5-advanced/03-mapped-types)과 [재귀 타입](../part5-advanced/05-recursive-types)에서 배웁니다. 모든 속성에 한 번에 `readonly`를 붙이는 내장 도구 `Readonly<T>`는 [Part 3 유틸리티 타입](../part3-intermediate/07-utility-types)에서 봅니다.
:::

### 6단계: 초과 속성 검사

객체 리터럴(코드에 `{ ... }`로 직접 쓴 객체)을 타입이 정해진 자리에 **바로** 넣을 때, 타입에 없는 속성이 있으면 오류가 납니다. 이것을 **초과 속성 검사**(excess property check)라고 합니다.

```ts
type Product = {
  code: string
  name: string
  price: number
}

const p: Product = {
  code: 'P001',
  name: '아메리카노',
  price: 4500,
  colour: 'brown',
  // ❌ Object literal may only specify known properties, and 'colour' does not exist in type 'Product'. (TS2353)
}
```

"객체 리터럴에는 알려진 속성만 쓸 수 있다"는 뜻입니다. 이 검사가 있는 이유는 **오타를 잡기 위해서**입니다. 선택 속성 `discountRate?`가 있는 타입에 `discountrate`(소문자 r)라고 잘못 쓰면, 검사가 없을 때는 할인이 조용히 무시되는 버그가 됩니다.

```ts
type CartItem = {
  productCode: string
  quantity: number
  discountRate?: number
}

const item: CartItem = { productCode: 'P001', quantity: 2, discountrate: 0.1 }
// ❌ Object literal may only specify known properties, but 'discountrate' does not exist in type 'CartItem'. Did you mean to write 'discountRate'? (TS2561)
```

`Did you mean to write 'discountRate'?`처럼 비슷한 이름까지 알려 줍니다.

### 7단계: 초과 속성 검사가 일어나지 않는 경우

그런데 이상한 점이 있습니다. **변수에 먼저 담았다가** 넣으면 초과 속성이 있어도 오류가 나지 않습니다.

```ts
type Product = {
  code: string
  name: string
  price: number
}

const raw = { code: 'P001', name: '아메리카노', price: 4500, colour: 'brown' }
const p: Product = raw // ✅ 오류 없음

console.log(p.name)
// 출력: 아메리카노
```

이유는 TypeScript의 기본 규칙이 **"필요한 속성을 다 갖고 있으면 그 타입으로 인정한다"** 이기 때문입니다. 집합으로 보면 `{ code, name, price, colour }`를 가진 객체도 "code·name·price를 가진 객체들의 집합"에 **속합니다**. 속성이 더 많아도 조건은 만족하니까요.

```text
Product 집합 = { code·name·price를 가진 모든 객체 }
  ├─ { code, name, price }                 ← 속함
  ├─ { code, name, price, colour }         ← 속함 (속성이 더 있어도 OK)
  └─ { code, name }                        ← 속하지 않음 (price가 없음)
```

초과 속성 검사는 이 기본 규칙 위에 얹은 **추가 안전장치**입니다. "**새로 만든** 객체 리터럴인데 쓸데없는 속성이 있다면 오타일 가능성이 높다"고 보고 따로 경고하는 것입니다. 이미 다른 곳에서 만들어진 객체(`raw`)는 다른 용도로 그 속성을 쓰고 있을 수 있으니 검사하지 않습니다.

이 "모양이 맞으면 인정한다"는 규칙을 **구조적 타이핑**(structural typing)이라고 하며, [Part 3 구조적 타이핑과 할당 가능성](../part3-intermediate/02-structural-typing)에서 깊게 다룹니다.

### 8단계: 인덱스 시그니처 — 키를 미리 모를 때

매장별 재고처럼 **속성 이름(키)을 미리 알 수 없는** 객체가 있습니다.

```ts
const stockByCode = {
  P001: 30,
  P002: 0,
  P003: 12,
  // 상품이 추가될 때마다 키가 늘어남
}
```

이럴 때 **인덱스 시그니처**(index signature)를 씁니다. `[키이름: 키타입]: 값타입` 형태입니다.

```ts
type StockTable = {
  [productCode: string]: number
}

const stock: StockTable = {
  P001: 30,
  P002: 0,
}

stock['P003'] = 12 // ✅ 새 키를 추가할 수 있음
stock.P004 = 5 // ✅ 점 표기도 가능

console.log(stock)
// 출력: { P001: 30, P002: 0, P003: 12, P004: 5 }

stock['P005'] = '없음'
// ❌ Type 'string' is not assignable to type 'number'. (TS2322)
```

- `productCode`는 이름일 뿐 아무 이름이나 써도 됩니다(읽는 사람을 위해 의미 있는 이름을 씁니다).
- 키 타입으로는 `string`, `number`, `symbol` 등을 쓸 수 있습니다. 실무에서는 대부분 `string`입니다.
- 같은 뜻을 `Record<string, number>`로도 쓸 수 있습니다. [Part 3 유틸리티 타입](../part3-intermediate/07-utility-types)에서 배웁니다.

정해진 속성과 함께 쓸 수도 있습니다. 단, 정해진 속성의 타입도 인덱스 시그니처의 값 타입에 맞아야 합니다.

```ts
type DailySales = {
  storeName: string
  [hour: string]: string | number // storeName(string)도 포함되도록
}

const sales: DailySales = {
  storeName: '강남점',
  '09': 120000,
  '10': 98000,
}
console.log(sales.storeName, sales['09'])
// 출력: 강남점 120000
```

### 9단계: 인덱스 시그니처의 구멍과 noUncheckedIndexedAccess

인덱스 시그니처에서 값을 꺼내면 타입은 `number`입니다. **없는 키를 꺼내도** 그렇습니다.

```ts
type StockTable = { [productCode: string]: number }

const stock: StockTable = { P001: 30 }
const count = stock['P999'] // 타입: number (실제 값은 undefined!)

console.log(count + 1)
// 출력: NaN
```

[03 레슨](./03-arrays-tuples)의 배열 칸 꺼내기와 같은 구멍입니다. TypeScript는 "있는 키를 꺼낸다"고 **믿어 줍니다**. 결과는 `undefined + 1 = NaN`(숫자가 아님)이라는 조용한 버그입니다.

`tsconfig.json`에서 **`noUncheckedIndexedAccess`** 옵션(TypeScript 4.1부터)을 켜면, 인덱스 시그니처나 배열 칸에서 꺼낸 값에 `| undefined`가 붙습니다.

```ts
// tsconfig.json: "noUncheckedIndexedAccess": true 일 때
type StockTable = { [productCode: string]: number }

const stock: StockTable = { P001: 30 }
const count = stock['P999'] // 타입: number | undefined

console.log(count + 1)
// ❌ 'count' is possibly 'undefined'. (TS18048)
```

이제 확인 없이 쓰면 오류가 납니다. 확인한 뒤에 쓰면 됩니다.

```ts
// tsconfig.json: "noUncheckedIndexedAccess": true 일 때
type StockTable = { [productCode: string]: number }

const stock: StockTable = { P001: 30 }

function getStock(code: string): number {
  const count = stock[code]
  return count ?? 0 // 없으면 0
}

console.log(getStock('P001'), getStock('P999'))
// 출력: 30 0
```

::: warning noUncheckedIndexedAccess는 strict에 포함되지 않습니다
이 옵션은 `strict: true`로 켜지지 않으므로 **따로** 켜야 합니다. 확인 코드가 늘어나는 대신 `undefined` 버그를 크게 줄여 주므로 새 프로젝트에서는 켜는 것을 권장합니다. 옵션 설명은 [tsconfig.json 완전 정복](../part6-tooling/01-tsconfig)에서 다룹니다.
:::

### 10단계: 중첩 객체

객체 안에 객체나 배열이 들어 있으면 타입도 그대로 중첩해서 씁니다.

```ts
type Order = {
  orderNo: string
  customer: {
    name: string
    phone?: string
  }
  items: {
    productCode: string
    quantity: number
    unitPrice: number
  }[]
}

const order: Order = {
  orderNo: 'A-1001',
  customer: { name: '김민지' },
  items: [
    { productCode: 'P001', quantity: 2, unitPrice: 4500 },
    { productCode: 'P002', quantity: 1, unitPrice: 5000 },
  ],
}

const total = order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
console.log(order.customer.name, total)
// 출력: 김민지 14000
```

중첩이 깊어지면 읽기 어려우므로, 안쪽 타입에도 이름을 붙여 나누는 것이 좋습니다.

```ts
type Customer = {
  name: string
  phone?: string
}

type OrderItem = {
  productCode: string
  quantity: number
  unitPrice: number
}

type Order = {
  orderNo: string
  customer: Customer
  items: OrderItem[]
}

const item: OrderItem = { productCode: 'P003', quantity: 3, unitPrice: 3000 }
const order: Order = { orderNo: 'A-1002', customer: { name: '박서준' }, items: [item] }
console.log(order.items.length)
// 출력: 1
```

이렇게 나누면 `OrderItem`만 따로 받는 함수를 만들기도 쉬워집니다.

### 11단계: 객체 타입을 함수 매개변수에

함수가 받을 객체의 모양을 매개변수 타입으로 정해 두면, 함수 안에서 속성을 안전하게 쓸 수 있습니다.

```ts
type OrderItem = {
  productCode: string
  quantity: number
  unitPrice: number
}

function getLineAmount(item: OrderItem): number {
  return item.quantity * item.unitPrice
}

console.log(getLineAmount({ productCode: 'P001', quantity: 2, unitPrice: 4500 }))
// 출력: 9000
```

매개변수에 **구조 분해**를 함께 쓸 수도 있습니다. 타입은 구조 분해 패턴 **뒤에** 씁니다.

```ts
type OrderItem = {
  productCode: string
  quantity: number
  unitPrice: number
}

function getLineAmount({ quantity, unitPrice }: OrderItem): number {
  return quantity * unitPrice
}

console.log(getLineAmount({ productCode: 'P002', quantity: 3, unitPrice: 5000 }))
// 출력: 15000
```

함수가 받은 객체를 바꾸지 않는다면 `readonly`를 붙여 "바꾸지 않습니다"를 약속할 수 있습니다.

```ts
type Member = {
  readonly memberNo: string
  readonly name: string
  readonly point: number
}

function getGrade(member: Member): string {
  return member.point >= 10000 ? 'VIP' : '일반'
}

console.log(getGrade({ memberNo: 'M001', name: '김민지', point: 12000 }))
// 출력: VIP
```

## 자주 하는 실수

### 실수 1: 구조 분해에 타입을 잘못된 자리에 쓰기

```ts
function printMember({ name: string, point: number }) {
  // ❌ Binding element 'string' implicitly has an 'any' type. (TS7031)
  // ❌ Binding element 'number' implicitly has an 'any' type. (TS7031)
  console.log(name)
}
```

왜 틀렸나: 구조 분해 안의 `name: string`은 JavaScript 문법으로 **"`name` 속성을 꺼내 `string`이라는 변수에 담아라"** 라는 뜻입니다(이름 바꾸기). 타입 표기가 아닙니다. 그래서 `string`, `number`라는 이름의 변수가 `any`로 생겨 버렸습니다.

고친 코드: 타입은 패턴 전체 **뒤에** 씁니다.

```ts
function printMember({ name, point }: { name: string; point: number }) {
  console.log(`${name} ${point}P`)
}

printMember({ name: '김민지', point: 1200 })
// 출력: 김민지 1200P
```

### 실수 2: 선택 속성을 확인 없이 쓰기

```ts
type Product = { name: string; discountRate?: number }

function getSalePrice(price: number, product: Product): number {
  return price * (1 - product.discountRate)
  // ❌ 'product.discountRate' is possibly 'undefined'. (TS18048)
}
```

왜 틀렸나: `discountRate`는 없을 수도 있으므로 `number | undefined`입니다.

고친 코드: 기본값을 정해 둡니다.

```ts
type Product = { name: string; discountRate?: number }

function getSalePrice(price: number, product: Product): number {
  const rate = product.discountRate ?? 0
  return price * (1 - rate)
}

console.log(getSalePrice(5000, { name: '라테', discountRate: 0.1 }), getSalePrice(5000, { name: '모카' }))
// 출력: 4500 5000
```

### 실수 3: readonly가 안쪽까지 막아 줄 거라고 믿기

```ts
type Cart = {
  readonly items: { name: string; quantity: number }[]
}

const cart: Cart = { items: [{ name: '라테', quantity: 1 }] }
cart.items[0].quantity = 99 // 오류 없음
cart.items.push({ name: '모카', quantity: 1 }) // 오류 없음
```

왜 틀렸나: `readonly`는 얕게 적용됩니다. `items` 칸에 새 배열을 넣는 것만 막습니다.

고친 코드: 막고 싶은 단계마다 `readonly`를 붙입니다.

```ts
type CartItem = { readonly name: string; readonly quantity: number }
type Cart = { readonly items: readonly CartItem[] }

const cart: Cart = { items: [{ name: '라테', quantity: 1 }] }
cart.items[0].quantity = 99
// ❌ Cannot assign to 'quantity' because it is a read-only property. (TS2540)
cart.items.push({ name: '모카', quantity: 1 })
// ❌ Property 'push' does not exist on type 'readonly CartItem[]'. (TS2339)
```

### 실수 4: 초과 속성 오류를 피하려고 변수에 옮겨 담기

```ts
type CartItem = { productCode: string; quantity: number; discountRate?: number }

const draft = { productCode: 'P001', quantity: 2, discountrate: 0.1 }
const item: CartItem = draft // 오류는 사라졌지만 할인이 조용히 무시됨

console.log(item.discountRate)
// 출력: undefined
```

왜 틀렸나: 초과 속성 오류는 대부분 **오타 경고**입니다. 변수에 옮겨 담으면 오류는 사라지지만 버그는 그대로 남습니다.

고친 코드: 오류 메시지가 가리키는 오타를 고칩니다.

```ts
type CartItem = { productCode: string; quantity: number; discountRate?: number }

const item: CartItem = { productCode: 'P001', quantity: 2, discountRate: 0.1 }
console.log(item.discountRate)
// 출력: 0.1
```

## 직접 해 보기

### 문제 1 ⭐ 회원 타입 만들기

다음 조건을 만족하는 `Member` 타입을 만들고, 값 두 개를 만들어 보세요.

- `memberNo`: 문자열, 바꿀 수 없음
- `name`: 문자열
- `point`: 숫자
- `email`: 문자열, 없어도 됨

::: details 정답 보기
```ts
type Member = {
  readonly memberNo: string
  name: string
  point: number
  email?: string
}

const m1: Member = { memberNo: 'M001', name: '김민지', point: 1200, email: 'minji@example.com' }
const m2: Member = { memberNo: 'M002', name: '박서준', point: 0 }

console.log(m1.email, m2.email)
// 출력: minji@example.com undefined
```
:::

### 문제 2 ⭐ 오류 원인 찾기

다음 코드에서 오류가 나는 곳을 모두 찾고 이유를 설명하세요.

```ts
// 문제: 오류가 나는 곳을 찾으세요
type Store = {
  readonly storeCode: string
  storeName: string
  openHour: number
}

const store: Store = { storeCode: 'S01', storeName: '강남점', openHour: 9, closeHour: 22 }
store.storeCode = 'S02'
```

::: details 정답 보기
두 곳에서 오류가 납니다.

```ts
type Store = {
  readonly storeCode: string
  storeName: string
  openHour: number
}

const store: Store = { storeCode: 'S01', storeName: '강남점', openHour: 9, closeHour: 22 }
// ❌ Object literal may only specify known properties, and 'closeHour' does not exist in type 'Store'. (TS2353)
store.storeCode = 'S02'
// ❌ Cannot assign to 'storeCode' because it is a read-only property. (TS2540)
```

- `closeHour`는 `Store` 타입에 없는 속성이라 초과 속성 검사에 걸립니다. 필요한 속성이라면 타입에 `closeHour: number`를 추가합니다.
- `storeCode`는 `readonly`라 바꿀 수 없습니다.
:::

### 문제 3 ⭐⭐ 인덱스 시그니처로 장바구니 수량표

상품 코드를 키로, 수량을 값으로 갖는 `QuantityTable` 타입을 만들고, 수량표를 받아 **전체 수량 합계**를 돌려주는 함수 `getTotalQuantity`를 작성하세요. (힌트: `Object.values(객체)`는 값만 모은 배열을 돌려줍니다.)

::: details 정답 보기
```ts
type QuantityTable = {
  [productCode: string]: number
}

function getTotalQuantity(table: QuantityTable): number {
  return Object.values(table).reduce((sum, q) => sum + q, 0)
}

const cartQuantities: QuantityTable = { P001: 2, P002: 1, P003: 4 }
console.log(getTotalQuantity(cartQuantities))
// 출력: 7
```
:::

### 문제 4 ⭐⭐ 중첩 타입 나누기

아래처럼 한 덩어리로 쓴 타입을 `Address`, `Customer`, `Delivery` 세 타입으로 나누어 다시 쓰세요.

```ts
// 문제: 타입을 세 개로 나누세요
type Delivery = {
  deliveryNo: string
  customer: {
    name: string
    address: {
      zipCode: string
      line1: string
      line2?: string
    }
  }
}
```

::: details 정답 보기
```ts
type Address = {
  zipCode: string
  line1: string
  line2?: string
}

type Customer = {
  name: string
  address: Address
}

type Delivery = {
  deliveryNo: string
  customer: Customer
}

const d: Delivery = {
  deliveryNo: 'D-001',
  customer: { name: '김민지', address: { zipCode: '06236', line1: '서울시 강남구 테헤란로 1' } },
}
console.log(d.customer.address.zipCode)
// 출력: 06236
```
:::

### 문제 5 ⭐⭐⭐ 초과 속성 검사 예측하기

다음 네 줄 중 오류가 나는 줄을 고르고, 이유를 "객체 리터럴인가, 변수인가"로 설명하세요.

```ts
// 문제: 오류가 나는 줄을 고르세요
type Coupon = { code: string; amount: number }

const c1: Coupon = { code: 'A', amount: 1000, memo: '신규' } // (1)
const tmp = { code: 'B', amount: 2000, memo: '재방문' }
const c2: Coupon = tmp // (2)

function useCoupon(c: Coupon) {
  return c.amount
}
useCoupon({ code: 'C', amount: 3000, memo: '이벤트' }) // (3)
useCoupon(tmp) // (4)
```

::: details 정답 보기
(1)과 (3)에서 오류가 납니다.

```ts
type Coupon = { code: string; amount: number }

const c1: Coupon = { code: 'A', amount: 1000, memo: '신규' }
// ❌ Object literal may only specify known properties, and 'memo' does not exist in type 'Coupon'. (TS2353)
const tmp = { code: 'B', amount: 2000, memo: '재방문' }
const c2: Coupon = tmp

function useCoupon(c: Coupon) {
  return c.amount
}
useCoupon({ code: 'C', amount: 3000, memo: '이벤트' })
// ❌ Object literal may only specify known properties, and 'memo' does not exist in type 'Coupon'. (TS2353)
useCoupon(tmp)
```

- (1), (3)은 **객체 리터럴을 바로** 넣었으므로 초과 속성 검사를 받습니다. 함수 인수도 마찬가지입니다.
- (2), (4)는 이미 만들어진 **변수**를 넣었으므로 검사하지 않습니다. 필요한 `code`, `amount`를 다 갖고 있으니 `Coupon` 집합에 속합니다.
:::

## 확인 퀴즈

1. 선택 속성 `phone?: string`을 꺼내면 타입은 무엇인가요?
2. `readonly items: string[]` 속성이 있을 때 `obj.items.push('x')`는 오류인가요?
3. 초과 속성 검사는 어떤 경우에만 일어나나요?
4. `{ [code: string]: number }` 타입에서 없는 키를 꺼내면 기본 설정에서 타입은 무엇인가요?
5. `noUncheckedIndexedAccess`는 `strict: true`에 포함되나요?

::: details 정답 보기
1. `string | undefined`입니다.
2. 오류가 아닙니다. `readonly`는 얕아서 `items` 칸 자체만 막습니다. 안쪽까지 막으려면 `readonly string[]`로 씁니다.
3. 객체 리터럴을 타입이 정해진 자리(변수, 매개변수, 반환값 등)에 **바로** 넣을 때입니다.
4. `number`입니다(실제 값은 `undefined`일 수 있음). `noUncheckedIndexedAccess`를 켜면 `number | undefined`가 됩니다.
5. 포함되지 않습니다. 따로 켜야 합니다.
:::

## 정리

- 객체 타입은 `{ 이름: 타입; ... }`으로 쓰고, 여러 번 쓰면 `type`으로 이름을 붙입니다.
- `?`는 선택 속성입니다. 꺼내면 `| undefined`가 붙으므로 확인하거나 `??`로 기본값을 줍니다.
- `readonly`는 그 속성 한 칸만 막는 **얕은** 보호입니다. 안쪽까지 막으려면 단계마다 붙입니다.
- **초과 속성 검사**는 객체 리터럴을 바로 넣을 때만 일어나는 오타 방지 장치입니다. 기본 규칙은 "필요한 속성을 다 가지면 인정"입니다.
- **인덱스 시그니처** `[key: string]: 값타입`은 키를 미리 모를 때 씁니다. 없는 키 구멍은 `noUncheckedIndexedAccess`로 막습니다.
- 중첩 객체는 안쪽 타입에도 이름을 붙여 나누면 읽기 쉽고 재사용하기 좋습니다.

## 다음 단계

[함수 타입: 선택·기본·나머지 매개변수와 오버로드](./05-function-types) — 함수 자체에 타입을 붙이는 법, 콜백 함수의 타입, 같은 함수가 입력에 따라 다른 타입을 돌려줄 때 쓰는 오버로드를 배웁니다.
