---
title: 인터섹션(&)과 타입 합성
---

# 인터섹션(&)과 타입 합성

<LessonMeta level="중급" :minutes="40" prev="유니온 타입, 타입 별칭과 인터페이스, extends로 인터페이스 확장하기" />

## 이번에 배울 것

- `&`(인터섹션)로 여러 타입을 합쳐 새 타입을 만들 수 있다.
- 인터섹션 타입의 값이 갖춰야 할 조건을 설명할 수 있다.
- 같은 이름의 속성 타입이 충돌할 때 `never`가 생기는 이유를 설명하고, 미리 피할 수 있다.
- 유니온(`|`)과 인터섹션(`&`)의 차이를 "값의 집합"으로 설명할 수 있다.
- `interface extends`와 `&` 중 상황에 맞는 것을 고를 수 있다.

## 먼저 알아 둘 것

- [유니온 타입과 리터럴 타입](../part2-types/06-union-literal): `|`로 "A 또는 B"를 표현하는 방법
- [타입 별칭(type)과 인터페이스(interface)](../part2-types/07-type-alias-interface): `type`, `interface`, `extends`
- [특수 타입: any · unknown · never · void](../part2-types/02-special-types): "있을 수 없는 값"을 뜻하는 `never`

## 비유로 이해하기

매장 직원을 뽑는 채용 공고를 떠올려 보세요.

- 공고 A: "**바리스타 자격증**이 있는 사람"
- 공고 B: "**운전면허**가 있는 사람"

두 공고를 **동시에** 만족하는 사람, 즉 "바리스타 자격증도 있고 운전면허도 있는 사람"만 뽑겠다는 공고 C가 바로 인터섹션입니다. TypeScript로 쓰면 `Barista & Driver`입니다.

여기서 재미있는 점이 있습니다. 조건이 늘어날수록 **지원자는 줄어들지만, 뽑힌 사람이 할 수 있는 일은 늘어납니다.** 공고 C로 뽑힌 사람에게는 커피도 맡길 수 있고 배달도 맡길 수 있습니다.

그런데 공고 D가 "나이가 20세**이면서** 30세인 사람"이라면 어떨까요? 그런 사람은 세상에 없습니다. 조건이 서로 모순되면 만족하는 값이 하나도 없는 타입, 즉 `never`가 됩니다. 이 레슨에서 이 두 가지 장면을 모두 코드로 확인합니다.

## 개념 설명

### 인터섹션 기본 문법

인터섹션(intersection, 교집합)은 `&` 기호로 여러 타입을 이어 붙여 만듭니다. 결과 타입의 값은 **연결된 모든 타입의 조건을 동시에 만족**해야 합니다.

```ts
// 모든 데이터가 가지는 식별자
type HasId = {
  id: number
}

// 생성·수정 시각
type HasTimestamps = {
  createdAt: Date
  updatedAt: Date
}

// 상품 고유 정보
type ProductInfo = {
  name: string
  price: number
}

// 세 타입을 모두 만족해야 하는 상품 타입
type Product = HasId & HasTimestamps & ProductInfo

const americano: Product = {
  id: 1,
  name: '아메리카노',
  price: 4500,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-03-15'),
}

console.log(americano.name, americano.price)
// 출력: 아메리카노 4500
```

해설:

- `Product`는 `HasId`, `HasTimestamps`, `ProductInfo`의 속성을 **모두** 가져야 합니다.
- `americano`에서 속성 하나라도 빠지면 오류가 납니다.
- 거꾸로 `Product` 타입의 값에서는 세 타입의 속성을 모두 꺼내 쓸 수 있습니다.

속성 하나를 빠뜨려 보겠습니다.

```ts
type HasId = { id: number }
type ProductInfo = { name: string; price: number }
type Product = HasId & ProductInfo

const latte: Product = {
  id: 2,
  name: '카페라테',
}
// ❌ Type '{ id: number; name: string; }' is not assignable to type 'Product'. (TS2322)
```

오류 메시지 아래에는 보통 "`price` 속성이 `ProductInfo`에는 필요한데 없다"는 설명이 이어집니다. 인터섹션의 한 조각이라도 만족하지 못하면 전체가 실패한다는 뜻입니다.

### 공통 조각을 재사용하기

인터섹션이 빛나는 곳은 **여러 타입에 공통으로 들어가는 조각**이 있을 때입니다. 상품·주문·회원 모두 `id`와 생성·수정 시각을 가진다면, 그 조각을 한 번만 정의하고 붙여 쓰면 됩니다.

```ts
type HasId = { id: number }
type HasTimestamps = { createdAt: Date; updatedAt: Date }

// 공통 조각을 한 번에 묶어 둔 "엔티티(entity, 저장되는 데이터 한 건)" 타입
type Entity = HasId & HasTimestamps

type Product = Entity & {
  name: string
  price: number
}

type Order = Entity & {
  productIds: number[]
  totalAmount: number
}

type Member = Entity & {
  email: string
  grade: 'BASIC' | 'VIP'
}

// 공통 조각만 필요한 함수는 Entity를 받으면, 상품·주문·회원 어느 것이든 받을 수 있습니다.
function describeEntity(entity: Entity): string {
  return `#${entity.id} (수정: ${entity.updatedAt.toISOString().slice(0, 10)})`
}

const member: Member = {
  id: 7,
  email: 'kim@example.com',
  grade: 'VIP',
  createdAt: new Date('2026-02-01T00:00:00Z'),
  updatedAt: new Date('2026-05-10T00:00:00Z'),
}

console.log(describeEntity(member))
// 출력: #7 (수정: 2026-05-10)
```

`describeEntity`가 `Member`를 받을 수 있는 이유는 `Member`가 `Entity`의 조건을 모두 만족하기 때문입니다. 이 "조건을 만족하면 넣을 수 있다"는 규칙은 다음 레슨 [구조적 타이핑](./02-structural-typing)에서 자세히 다룹니다.

### 타입 별칭 없이 그 자리에서 합치기

인터섹션은 함수 매개변수 같은 곳에서 그 자리에서 바로 만들 수도 있습니다.

```ts
type Store = { storeCode: string; storeName: string }

// 매장 정보 + 영업 여부를 함께 받는 함수
function printStore(store: Store & { isOpen: boolean }): void {
  const status = store.isOpen ? '영업 중' : '영업 종료'
  console.log(`[${store.storeCode}] ${store.storeName} - ${status}`)
}

printStore({ storeCode: 'S001', storeName: '강남점', isOpen: true })
// 출력: [S001] 강남점 - 영업 중
```

다만 이런 이름 없는 인터섹션이 여러 곳에 반복되면 타입 별칭으로 이름을 붙여 주는 편이 읽기 좋습니다.

### 값의 집합으로 보기: 유니온과 인터섹션

타입을 "그 타입에 들어갈 수 있는 값들의 모임(집합)"으로 생각하면 유니온과 인터섹션이 한눈에 정리됩니다.

| 표기 | 읽는 법 | 값의 조건 | 집합으로 보면 |
|---|---|---|---|
| `A \| B` | A 또는 B | A이거나 B이면 됨 | 합집합: 값이 **많아짐** |
| `A & B` | A 그리고 B | A이면서 동시에 B여야 함 | 교집합: 값이 **적어짐** |

리터럴 유니온끼리 인터섹션하면 이 관계가 그대로 보입니다.

```ts
// 매장 A가 파는 음료
type StoreAMenu = '아메리카노' | '카페라테' | '바닐라라테'
// 매장 B가 파는 음료
type StoreBMenu = '카페라테' | '바닐라라테' | '녹차라테'

// 두 매장 모두에서 파는 음료 = 교집합
type CommonMenu = StoreAMenu & StoreBMenu
// 마우스를 올려 보면: type CommonMenu = "카페라테" | "바닐라라테"

const menu: CommonMenu = '카페라테' // ✅
const menu2: CommonMenu = '아메리카노'
// ❌ Type '"아메리카노"' is not assignable to type '"카페라테" | "바닐라라테"'. (TS2322)
```

그런데 객체 타입에서는 이 관계가 거꾸로 느껴질 수 있습니다. `HasId & ProductInfo`는 속성이 **더 많은** 타입인데 왜 "교집합"일까요?

- `HasId`에 들어갈 수 있는 값: `id`가 있는 **모든** 객체 (상품, 주문, 회원, 매장 …)
- `ProductInfo`에 들어갈 수 있는 값: `name`과 `price`가 있는 **모든** 객체
- 두 조건을 동시에 만족하는 값: `id`, `name`, `price`가 모두 있는 객체 → 앞의 두 집합보다 **좁은** 집합

속성(조건)이 늘어날수록 그 조건을 만족하는 값은 줄어듭니다. 채용 공고의 조건이 늘어날수록 지원자가 줄어드는 것과 같습니다. 그래서 "속성이 합쳐진다"와 "값의 교집합이다"는 같은 말입니다.

::: tip 기억하는 요령
- 객체 타입에서 `&`를 쓰면 **속성은 합쳐지고**, 들어갈 수 있는 **값은 줄어듭니다**.
- 객체 타입에서 `|`를 쓰면 **확실히 쓸 수 있는 속성은 줄어들고**, 들어갈 수 있는 **값은 늘어납니다**.
:::

유니온에서 확실히 쓸 수 있는 속성이 줄어드는 모습도 확인해 봅시다.

```ts
type Card = { method: 'CARD'; cardNo: string; amount: number }
type Cash = { method: 'CASH'; received: number; amount: number }

function printAmount(payment: Card | Cash): void {
  // 두 타입 모두에 있는 속성은 바로 쓸 수 있습니다.
  console.log(payment.amount)

  // 한쪽에만 있는 속성은 바로 쓸 수 없습니다.
  console.log(payment.cardNo)
  // ❌ Property 'cardNo' does not exist on type 'Card | Cash'. (TS2339)
}
```

`Card | Cash`에서 바로 쓸 수 있는 속성은 공통 속성(`method`, `amount`)뿐입니다. 한쪽에만 있는 속성을 쓰려면 [타입 좁히기](../part2-types/08-narrowing)가 필요하고, 이 방법은 [판별 유니온](./03-discriminated-union) 레슨에서 본격적으로 다룹니다.

### 같은 이름의 속성이 겹칠 때

두 타입에 같은 이름의 속성이 있으면, 결과 타입에서 그 속성의 타입은 **두 속성 타입의 인터섹션**이 됩니다.

#### 경우 1: 타입이 같으면 그대로

```ts
type A = { id: number; name: string }
type B = { id: number; price: number }

type AB = A & B
// id는 number & number = number

const item: AB = { id: 1, name: '머핀', price: 3000 } // ✅
console.log(item.id)
// 출력: 1
```

#### 경우 2: 한쪽이 더 좁으면 좁은 쪽으로

```ts
type OrderBase = { status: string; amount: number }
type PaidOrder = { status: 'PAID'; paidAt: Date }

type PaidOrderDetail = OrderBase & PaidOrder
// status는 string & 'PAID' = 'PAID'

const order: PaidOrderDetail = {
  status: 'PAID',
  amount: 12000,
  paidAt: new Date(),
}

const wrong: PaidOrderDetail = {
  status: 'CANCELED',
  // ❌ Type '"CANCELED"' is not assignable to type '"PAID"'. (TS2322)
  amount: 12000,
  paidAt: new Date(),
}
```

`string`이면서 동시에 `'PAID'`인 값은 `'PAID'` 하나뿐이므로 결과는 `'PAID'`입니다. 이 성질을 이용하면 "넓은 타입의 속성을 좁게 고정"할 수 있습니다.

선택 속성과 필수 속성이 겹치면 필수 쪽이 이깁니다. "있어도 되고 없어도 됨"과 "반드시 있음"을 동시에 만족하려면 반드시 있어야 하기 때문입니다.

```ts
type Draft = { memo?: string }
type Confirmed = { memo: string }

type ConfirmedDraft = Draft & Confirmed

const doc: ConfirmedDraft = {}
// ❌ Type '{}' is not assignable to type 'ConfirmedDraft'. (TS2322)
```

오류 메시지 아래 줄에는 "`memo` 속성이 `Confirmed`에는 필요한데 `{}`에는 없다(Property 'memo' is missing in type '{}' but required in type 'Confirmed')"는 설명이 이어집니다.

#### 경우 3: 타입이 충돌하면 never

이제 가장 중요한 경우입니다. 같은 이름의 속성이 **함께 만족할 수 없는 타입**이면 어떻게 될까요?

```ts
// 레거시 시스템: 상품 코드가 문자열
type LegacyProduct = { code: string; name: string }
// 새 시스템: 상품 코드가 숫자
type NewProduct = { code: number; price: number }

type MergedProduct = LegacyProduct & NewProduct
// code는 string & number → 둘 다인 값은 없으므로 never

type CodeType = MergedProduct['code']
// 마우스를 올려 보면: type CodeType = never

const p: MergedProduct = {
  code: 'P-001',
  // ❌ Type 'string' is not assignable to type 'never'. (TS2322)
  name: '크루아상',
  price: 3500,
}
```

`string`이면서 동시에 `number`인 값은 존재하지 않습니다. 그래서 `code`의 타입은 `never`(있을 수 없는 값)가 됩니다. `never` 타입 속성에는 어떤 값도 넣을 수 없으므로 `MergedProduct` 타입의 객체는 사실상 만들 수 없습니다.

::: warning 충돌은 선언할 때가 아니라 쓸 때 드러납니다
`type MergedProduct = LegacyProduct & NewProduct`라고 **선언하는 줄에서는 아무 오류도 나지 않습니다.** 오류는 나중에 그 타입으로 값을 만들 때 나타나고, 메시지도 "`never`에 넣을 수 없다"처럼 원인과 멀어 보입니다. 낯선 곳에서 `never` 관련 오류가 나면 "어딘가에서 인터섹션 충돌이 있지 않나?"를 의심해 보세요.
:::

#### 경우 4: 리터럴 속성이 충돌하면 타입 전체가 never

충돌한 속성이 `'CARD'`, `'CASH'`처럼 **리터럴 타입**이면 TypeScript는 한 걸음 더 나아가 **타입 전체를 `never`로** 줄여 버립니다(TypeScript 3.9부터). 이런 속성은 보통 "이 객체가 어떤 종류인지"를 구별하는 데 쓰이는데, 종류가 동시에 두 개일 수는 없기 때문입니다.

```ts
type CardPayment = { method: 'CARD'; cardNo: string }
type CashPayment = { method: 'CASH'; received: number }

type Weird = CardPayment & CashPayment
// 마우스를 올려 보면: type Weird = never

function pay(p: Weird): void {
  console.log(p.cardNo)
  // ❌ Property 'cardNo' does not exist on type 'never'. (TS2339)
}
```

마우스를 `Weird`에 올리면 `never`로 보이고, `pay` 안에서 `p`의 어떤 속성에도 접근할 수 없습니다. 오류 메시지 아래에는 보통 "인터섹션 'Weird'가 `method` 속성의 충돌 때문에 `never`로 줄어들었다(was reduced to 'never')"는 설명이 함께 나옵니다. 이 설명을 보면 원인을 바로 찾을 수 있습니다.

#### 원시 타입끼리의 인터섹션

객체가 아닌 원시 타입끼리 인터섹션해도 마찬가지입니다.

```ts
type Impossible = string & number
// 마우스를 올려 보면: type Impossible = never

const value: Impossible = 'hello'
// ❌ Type 'string' is not assignable to type 'never'. (TS2322)
```

`string & number`처럼 원시 타입끼리 인터섹션할 일은 거의 없습니다. 다만 Part 3-2에서 배울 **브랜드 타입**은 `string & { __brand: 'ProductId' }`처럼 원시 타입과 객체 타입을 합치는 특별한 기법을 씁니다. 이건 충돌이 아니라 의도된 합성입니다.

### 충돌을 피하는 방법: 겹치는 속성을 먼저 빼기

`LegacyProduct`와 `NewProduct`를 합치되 `code`는 새 시스템의 `number`를 쓰고 싶다면, 합치기 **전에** 한쪽에서 `code`를 빼면 됩니다. 속성을 빼는 `Omit`은 3-7 레슨에서 자세히 배우지만, 여기서는 "지정한 속성을 뺀 타입을 만든다"고만 알아 두세요.

```ts
type LegacyProduct = { code: string; name: string }
type NewProduct = { code: number; price: number }

// LegacyProduct에서 code를 빼고 합칩니다.
type MergedProduct = Omit<LegacyProduct, 'code'> & NewProduct

const p: MergedProduct = {
  code: 1001,
  name: '크루아상',
  price: 3500,
}
console.log(p.code + 1)
// 출력: 1002
```

`&`는 **덮어쓰기가 아닙니다.** "뒤에 쓴 타입이 앞의 속성을 덮어쓴다"고 생각하기 쉬운데, 실제로는 두 조건을 모두 만족하라는 뜻입니다. 속성 타입을 바꾸고 싶으면 위처럼 `Omit`으로 빼고 다시 붙여야 합니다.

### 인터섹션과 객체 스프레드

JavaScript의 객체 스프레드(`...`)나 `Object.assign`으로 두 객체를 합치면, TypeScript는 그 결과를 인터섹션 또는 그와 비슷한 타입으로 계산합니다.

```ts
const baseInfo = { id: 10, name: '치즈케이크' }
const priceInfo = { price: 6500, stock: 12 }

// Object.assign의 결과 타입은 두 타입의 인터섹션입니다.
const assigned = Object.assign({}, baseInfo, priceInfo)
// 마우스를 올려 보면: const assigned: { id: number; name: string; } & { price: number; stock: number; }

// 스프레드 결과는 속성을 펼친 하나의 객체 타입이 됩니다.
const spread = { ...baseInfo, ...priceInfo }
// 마우스를 올려 보면: const spread: { price: number; stock: number; id: number; name: string; }

console.log(assigned.price, spread.stock)
// 출력: 6500 12
```

두 방법 모두 결과적으로 같은 속성을 가진 객체를 만들고, 타입도 그 사실을 정확히 반영합니다. 스프레드는 뒤의 값이 앞의 값을 실제로 덮어쓰므로, TypeScript도 스프레드 결과에서는 뒤쪽 속성의 타입을 씁니다.

### interface extends와 비교하기

Part 2에서 배운 `interface ... extends`도 "기존 타입에 속성을 더한 새 타입"을 만듭니다. 같은 `Product`를 두 방식으로 써 보겠습니다.

```ts
// 방법 1: interface extends
interface EntityI {
  id: number
  createdAt: Date
}
interface ProductI extends EntityI {
  name: string
  price: number
}

// 방법 2: 타입 별칭 + 인터섹션
type EntityT = { id: number; createdAt: Date }
type ProductT = EntityT & {
  name: string
  price: number
}

// 두 타입은 같은 모양의 값을 받습니다.
const a: ProductI = { id: 1, createdAt: new Date(), name: '스콘', price: 3200 }
const b: ProductT = a
console.log(b.name)
// 출력: 스콘
```

대부분의 경우 두 방법의 결과는 같습니다. 차이는 아래 네 가지 상황에서 드러납니다.

#### 차이 1: 충돌을 언제 알려 주는가

`interface extends`는 속성이 충돌하면 **선언하는 그 자리에서** 오류를 냅니다.

```ts
interface LegacyProduct {
  code: string
}

interface NewProduct extends LegacyProduct {
  // ❌ Interface 'NewProduct' incorrectly extends interface 'LegacyProduct'. (TS2430)
  code: number
}
```

반면 인터섹션은 앞에서 본 것처럼 선언할 때는 조용하다가 값을 만들 때 `never` 오류를 냅니다. **실수를 일찍 알려 준다**는 점에서는 `interface extends`가 유리합니다.

참고로 `interface extends`에서 속성을 **더 좁은 타입으로 바꾸는 것**은 허용됩니다. `string`을 `'PAID'`로 좁히는 것은 "부모의 조건을 여전히 만족"하기 때문입니다.

```ts
interface OrderBase {
  status: string
  amount: number
}

// status를 string에서 'PAID'로 좁히는 것은 가능합니다.
interface PaidOrder extends OrderBase {
  status: 'PAID'
  paidAt: Date
}

const order: PaidOrder = { status: 'PAID', amount: 8000, paidAt: new Date() }
console.log(order.status)
// 출력: PAID
```

#### 차이 2: 유니온과 함께 쓸 수 있는가

인터섹션은 유니온 타입을 포함해 **어떤 타입과도** 합칠 수 있습니다. `interface extends`는 속성이 미리 정해진 객체 타입만 확장할 수 있습니다.

```ts
type Payment =
  | { method: 'CARD'; cardNo: string }
  | { method: 'CASH'; received: number }

// ✅ 인터섹션: 유니온의 각 경우에 금액 정보를 붙입니다.
type PaymentWithAmount = Payment & { amount: number }

const p1: PaymentWithAmount = { method: 'CARD', cardNo: '1234-****', amount: 15000 }

// ❌ interface는 유니온 타입을 확장할 수 없습니다.
interface PaymentWithAmountI extends Payment {
  // ❌ An interface can only extend an object type or intersection of object types with statically known members. (TS2312)
  amount: number
}
```

`Payment & { amount: number }`는 "카드 결제이면서 금액이 있음" 또는 "현금 결제이면서 금액이 있음"으로 펼쳐집니다. `A`, `B`, `C`가 타입일 때 `(A | B) & C`는 `(A & C) | (B & C)`와 같습니다. 수학의 분배 법칙과 비슷합니다.

#### 차이 3: 선언 병합

`interface`는 같은 이름으로 두 번 선언하면 합쳐집니다(선언 병합, declaration merging). `type`은 같은 이름으로 두 번 선언할 수 없습니다. 이 차이는 [타입 별칭과 인터페이스](../part2-types/07-type-alias-interface) 레슨에서 다뤘고, 라이브러리 타입을 확장하는 방법은 [선언 파일](../part5-advanced/08-declaration-files) 레슨에서 자세히 배웁니다.

#### 차이 4: 오류 메시지와 컴파일 속도

`interface`는 이름이 붙은 하나의 타입으로 기억되기 때문에, 오류 메시지에 `ProductI`처럼 짧게 나오고 TypeScript가 타입 관계를 계산한 결과를 재사용하기도 쉽습니다. 인터섹션이 여러 겹 겹치면 마우스를 올렸을 때 `EntityT & { name: string; price: number; }`처럼 조각이 그대로 보여 읽기가 조금 불편할 수 있습니다. TypeScript 팀도 객체 타입을 확장할 때는 가능하면 `interface extends`를 쓰라고 권합니다. 규모가 큰 프로젝트에서의 타입 검사 성능은 [대규모 코드베이스](../part9-master/03-large-codebase) 레슨에서 다룹니다.

#### 선택 기준 정리

| 상황 | 추천 |
|---|---|
| 객체 타입에 속성을 더해 새 객체 타입을 만든다 | `interface extends` (충돌을 바로 알려 줌) |
| 유니온 타입에 공통 속성을 붙인다 | `&` |
| 작은 조각 타입(`HasId`, `HasTimestamps`)을 여러 개 조합한다 | `&` 또는 `interface extends A, B` |
| 함수 매개변수 등에서 그 자리에서 잠깐 합친다 | `&` |
| 팀 코드에 이미 정해진 스타일이 있다 | 팀 스타일을 따릅니다 |

`interface`도 여러 개를 한꺼번에 확장할 수 있다는 점을 기억해 두세요.

```ts
interface HasId {
  id: number
}
interface HasTimestamps {
  createdAt: Date
  updatedAt: Date
}

// 쉼표로 여러 인터페이스를 동시에 확장합니다.
interface Store extends HasId, HasTimestamps {
  storeName: string
}

const store: Store = {
  id: 3,
  storeName: '판교점',
  createdAt: new Date(),
  updatedAt: new Date(),
}
console.log(store.storeName)
// 출력: 판교점
```

## 자주 하는 실수

### 실수 1: "A 또는 B"를 `&`로 쓰기

```ts
type CardPayment = { method: 'CARD'; cardNo: string }
type CashPayment = { method: 'CASH'; received: number }

// "카드 또는 현금"을 의도했지만 &를 썼습니다.
type Payment = CardPayment & CashPayment

const payment: Payment = { method: 'CARD', cardNo: '1234' }
// ❌ Type 'string' is not assignable to type 'never'. (TS2322)  ← method
// ❌ Type 'string' is not assignable to type 'never'. (TS2322)  ← cardNo
```

**왜 틀렸나:** `&`는 "둘 다"입니다. `method`가 `'CARD'`이면서 동시에 `'CASH'`일 수는 없으므로 `Payment` 전체가 `never`가 됩니다. 그래서 객체의 속성마다 "`never`에 넣을 수 없다"는 오류가 하나씩 납니다. "이것 또는 저것"은 유니온(`|`)으로 표현합니다.

```ts
type CardPayment = { method: 'CARD'; cardNo: string }
type CashPayment = { method: 'CASH'; received: number }

// ✅ 카드 또는 현금
type Payment = CardPayment | CashPayment

const payment: Payment = { method: 'CARD', cardNo: '1234' }
console.log(payment.method)
// 출력: CARD
```

### 실수 2: `&`로 속성 타입을 "덮어쓰려고" 하기

```ts
interface Product {
  id: number
  price: number
}

// 화면 표시용으로 price를 '4,500원' 같은 문자열로 바꾸고 싶었습니다.
type ProductView = Product & { price: string }

const view: ProductView = { id: 1, price: '4,500원' }
// ❌ Type 'string' is not assignable to type 'never'. (TS2322)
```

**왜 틀렸나:** `&`는 덮어쓰기가 아니라 "두 조건을 모두 만족"입니다. `price`는 `number & string`, 즉 `never`가 됩니다. 선언 줄에서는 오류가 나지 않아 원인을 찾기 어렵습니다.

```ts
interface Product {
  id: number
  price: number
}

// ✅ price를 먼저 빼고 새 타입으로 붙입니다.
type ProductView = Omit<Product, 'price'> & { price: string }

const view: ProductView = { id: 1, price: '4,500원' }
console.log(view.price)
// 출력: 4,500원
```

### 실수 3: 인터섹션이면 아무 속성이나 더 넣어도 된다고 생각하기

```ts
type HasId = { id: number }
type ProductInfo = { name: string }

const p: HasId & ProductInfo = {
  id: 1,
  name: '베이글',
  color: '갈색',
  // ❌ Object literal may only specify known properties, and 'color' does not exist in type 'HasId & ProductInfo'. (TS2353)
}
```

**왜 틀렸나:** 인터섹션은 속성을 합친 타입일 뿐, "아무 속성이나 허용"하는 타입이 아닙니다. 객체 리터럴(중괄호로 그 자리에서 만든 객체)에는 타입에 없는 속성을 넣을 수 없습니다. 이 검사를 **초과 속성 검사**라고 하며, 다음 레슨에서 자세히 다룹니다.

```ts
type HasId = { id: number }
type ProductInfo = { name: string }

// ✅ 필요한 속성이라면 타입에 추가합니다.
const p: HasId & ProductInfo & { color: string } = {
  id: 1,
  name: '베이글',
  color: '갈색',
}
console.log(p.color)
// 출력: 갈색
```

### 실수 4: 함수 매개변수에서 `|`와 `&`를 반대로 생각하기

```ts
type Card = { method: 'CARD'; cardNo: string; amount: number }
type Point = { method: 'POINT'; pointBalance: number; amount: number }

// "카드든 포인트든 금액만 출력하면 된다"는 함수에 &를 썼습니다.
function printAmount(payment: Card & Point): void {
  console.log(payment.amount)
  // ❌ Property 'amount' does not exist on type 'never'. (TS2339)
}

printAmount({ method: 'CARD', cardNo: '1234', amount: 5000 })
// ❌ Type 'string' is not assignable to type 'never'. (TS2322)  ← method
// ❌ Type 'string' is not assignable to type 'never'. (TS2322)  ← cardNo
// ❌ Type 'number' is not assignable to type 'never'. (TS2322)  ← amount
```

**왜 틀렸나:** 매개변수가 `Card & Point`이면 "카드이면서 포인트인 값"만 받겠다는 뜻이고, `method`가 충돌하므로 `Card & Point` 전체가 `never`로 줄어듭니다. 그래서 함수 안에서는 `payment.amount`조차 쓸 수 없고, 호출하는 쪽에서는 넘긴 객체의 속성마다 오류가 납니다. 아무 값도 받을 수 없는 함수가 된 것입니다. "여러 종류 중 아무거나 받겠다"는 유니온입니다.

```ts
type Card = { method: 'CARD'; cardNo: string; amount: number }
type Point = { method: 'POINT'; pointBalance: number; amount: number }

// ✅ 카드 또는 포인트
function printAmount(payment: Card | Point): void {
  console.log(payment.amount)
}

printAmount({ method: 'CARD', cardNo: '1234', amount: 5000 })
// 출력: 5000
```

## 직접 해 보기

### 문제 1 ⭐ 기초

아래 두 타입을 합쳐 `Member` 타입을 만들고, 회원 한 명을 나타내는 변수 `member`를 선언하세요.

```ts
type HasId = { id: number }
type MemberInfo = { name: string; phone: string }
```

::: details 정답 보기
```ts
type HasId = { id: number }
type MemberInfo = { name: string; phone: string }

type Member = HasId & MemberInfo

const member: Member = {
  id: 1,
  name: '홍길동',
  phone: '010-1234-5678',
}
console.log(member.name)
// 출력: 홍길동
```
`Member`는 `id`, `name`, `phone`을 모두 가져야 합니다.
:::

### 문제 2 ⭐ 기초

다음 타입 `T1`, `T2`, `T3`은 각각 어떤 타입이 될까요? 직접 마우스를 올려 확인하기 전에 먼저 예상해 보세요.

```ts
type T1 = 'S' | 'M' | 'L'
type T2 = 'M' | 'L' | 'XL'

type Q1 = T1 & T2
type Q2 = { size: T1 } & { size: T2 }
type Q3 = { qty: number } & { qty: string }
```

::: details 정답 보기
- `Q1`은 `"M" | "L"`입니다. 두 유니온의 교집합입니다.
- `Q2`는 `size`의 타입이 `T1 & T2`, 즉 `"M" | "L"`인 객체 타입입니다. `Q2['size']`에 마우스를 올리면 확인할 수 있습니다.
- `Q3`는 `qty`가 `number & string`, 즉 `never`인 객체 타입입니다. 이 타입의 값은 만들 수 없습니다.

```ts
type T1 = 'S' | 'M' | 'L'
type T2 = 'M' | 'L' | 'XL'
type Q2 = { size: T1 } & { size: T2 }

const ok: Q2 = { size: 'M' } // ✅
const ng: Q2 = { size: 'S' }
// ❌ Type '"S"' is not assignable to type '"M" | "L"'. (TS2322)
```
:::

### 문제 3 ⭐⭐ 응용

결제 수단 유니온 `Payment`의 모든 경우에 `paidAt: Date`와 `storeCode: string`을 붙인 `PaymentRecord` 타입을 만드세요. 그리고 현금 결제 기록 하나를 변수로 만들어 보세요.

```ts
type Payment =
  | { method: 'CARD'; cardNo: string; amount: number }
  | { method: 'CASH'; received: number; amount: number }
```

::: details 정답 보기
```ts
type Payment =
  | { method: 'CARD'; cardNo: string; amount: number }
  | { method: 'CASH'; received: number; amount: number }

type PaymentRecord = Payment & {
  paidAt: Date
  storeCode: string
}

const record: PaymentRecord = {
  method: 'CASH',
  received: 10000,
  amount: 8700,
  paidAt: new Date(),
  storeCode: 'S001',
}
console.log(record.method, record.storeCode)
// 출력: CASH S001
```
유니온에 공통 속성을 붙일 때는 `interface extends`를 쓸 수 없으므로 `&`를 씁니다.
:::

### 문제 4 ⭐⭐ 응용

아래 코드는 `ProductView`로 값을 만드는 줄에서 오류가 납니다. 원인을 설명하고, `stock`을 `'품절'` 또는 `'재고 있음'` 문자열로 표시하는 타입으로 고치세요.

```ts
interface Product {
  id: number
  name: string
  stock: number
}

type ProductView = Product & { stock: '품절' | '재고 있음' }

const view: ProductView = { id: 1, name: '마카롱', stock: '품절' }
// ❌ Type 'number' is not assignable to type 'never'. (TS2322)  ← id
// ❌ Type 'string' is not assignable to type 'never'. (TS2322)  ← name
// ❌ Type 'string' is not assignable to type 'never'. (TS2322)  ← stock
```

::: details 정답 보기
원인: `&`는 덮어쓰기가 아니므로 `stock`의 타입이 `number & ('품절' | '재고 있음')`, 즉 `never`가 됩니다. 게다가 충돌한 쪽이 `'품절' | '재고 있음'` 같은 리터럴 타입이라, 경우 4에서 본 것처럼 `ProductView` 전체가 `never`로 줄어듭니다. 그래서 `stock`뿐 아니라 `id`, `name`에서도 오류가 납니다.

```ts
interface Product {
  id: number
  name: string
  stock: number
}

type ProductView = Omit<Product, 'stock'> & { stock: '품절' | '재고 있음' }

const view: ProductView = { id: 1, name: '마카롱', stock: '품절' }
console.log(view.stock)
// 출력: 품절
```
:::

### 문제 5 ⭐⭐⭐ 도전

다음 두 선언 중 하나는 선언하는 줄에서 바로 오류가 나고, 다른 하나는 조용히 넘어갑니다. 어느 쪽이 왜 그런지 설명하고, 실무에서 어떤 방식이 실수를 더 빨리 잡아 주는지 말해 보세요.

```ts
interface Base {
  grade: 'BASIC' | 'VIP'
}

// (가)
type MemberA = Base & { grade: 'GOLD' }

// (나)
interface MemberB extends Base {
  grade: 'GOLD'
}
```

::: details 정답 보기
- (가)는 선언 줄에서 오류가 나지 않습니다. 대신 `grade`가 `('BASIC' | 'VIP') & 'GOLD'`, 즉 `never`가 되고, 리터럴 속성 충돌이므로 `MemberA` 전체가 `never`로 줄어듭니다. `MemberA` 타입의 값을 만들려고 할 때 비로소 오류가 납니다.
- (나)는 선언 줄에서 `Interface 'MemberB' incorrectly extends interface 'Base'.` (TS2430) 오류가 납니다. `'GOLD'`는 `'BASIC' | 'VIP'`에 들어갈 수 없기 때문입니다.

```ts
interface Base {
  grade: 'BASIC' | 'VIP'
}

type MemberA = Base & { grade: 'GOLD' }

interface MemberB extends Base {
  // ❌ Interface 'MemberB' incorrectly extends interface 'Base'. (TS2430)
  grade: 'GOLD'
}
```

실수를 더 빨리 잡아 주는 쪽은 (나) `interface extends`입니다. 객체 타입을 확장할 때 `interface extends`가 권장되는 이유 중 하나입니다.
:::

## 확인 퀴즈

1. `A & B` 타입의 값은 어떤 조건을 만족해야 하나요?
2. `{ id: number } & { id: string }`에서 `id`의 타입은 무엇인가요?
3. 객체 타입에 `&`를 쓰면 속성은 늘어나는데, 왜 "교집합"이라고 부르나요?
4. 유니온 타입에 공통 속성을 붙이고 싶을 때 `interface extends`와 `&` 중 무엇을 써야 하나요?
5. 인터섹션으로 속성 타입을 "덮어쓸" 수 있나요?

::: details 정답 보기
1. `A`의 조건과 `B`의 조건을 **동시에** 모두 만족해야 합니다.
2. `number & string`이므로 `never`입니다.
3. 속성(조건)이 늘어날수록 그 조건을 모두 만족하는 값은 줄어들기 때문입니다. "`A`에 들어갈 수 있는 값"과 "`B`에 들어갈 수 있는 값"의 교집합이 `A & B`에 들어갈 수 있는 값입니다.
4. `&`를 씁니다. `interface`는 유니온 타입을 확장할 수 없습니다(TS2312).
5. 없습니다. 같은 이름의 속성은 두 타입의 인터섹션이 되므로, 타입이 다르면 `never`가 됩니다. 바꾸려면 `Omit`으로 뺀 뒤 다시 붙입니다.
:::

## 정리

- `A & B`는 "A의 조건과 B의 조건을 모두 만족하는 타입"입니다. 객체 타입이면 속성이 합쳐집니다.
- 공통 조각(`HasId`, `HasTimestamps`)을 만들어 두고 `&`로 붙이면 같은 속성을 여러 번 적지 않아도 됩니다.
- 같은 이름의 속성은 두 타입의 인터섹션이 됩니다. 좁은 쪽이 남고, 충돌하면 `never`가 됩니다.
- 리터럴 속성(`method: 'CARD'` 같은)이 충돌하면 타입 전체가 `never`로 줄어듭니다.
- `&`는 덮어쓰기가 아닙니다. 속성 타입을 바꾸려면 `Omit`으로 빼고 다시 붙입니다.
- 객체 타입 확장에는 충돌을 바로 알려 주는 `interface extends`, 유니온과의 조합이나 즉석 합성에는 `&`가 어울립니다.

## 다음 단계

[구조적 타이핑과 할당 가능성](./02-structural-typing): `describeEntity(member)`가 왜 통과했는지, TypeScript가 "이 값을 저 타입에 넣어도 되는가"를 판단하는 규칙을 배웁니다.
