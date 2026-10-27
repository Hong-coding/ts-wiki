---
title: 구조적 타이핑과 할당 가능성
---

# 구조적 타이핑과 할당 가능성

<LessonMeta level="중급" :minutes="50" prev="&로 여러 타입을 합치고, 속성 충돌이 never를 만드는 이유" />

## 이번에 배울 것

- TypeScript가 "이 값을 저 타입에 넣어도 되는가"를 **모양(구조)** 으로 판단한다는 것을 설명할 수 있다.
- 구조적 타이핑과 명목적 타이핑(Java·C#)의 차이를 예로 들어 설명할 수 있다.
- "속성이 더 많은 쪽은 적은 쪽에 넣을 수 있다"는 할당 가능성 규칙으로 오류를 예측할 수 있다.
- 초과 속성 검사가 **신선한 객체 리터럴**에서만 일어나는 이유를 설명할 수 있다.
- 브랜드 타입으로 "모양은 같지만 섞이면 안 되는 값"을 구별할 수 있다.

## 먼저 알아 둘 것

- [객체 타입: 선택 속성 · readonly · 인덱스 시그니처](../part2-types/04-object-types)
- [타입 별칭(type)과 인터페이스(interface)](../part2-types/07-type-alias-interface)
- [인터섹션(&)과 타입 합성](./01-intersection): 앞 레슨 마지막의 `describeEntity(member)` 예제

## 비유로 이해하기

> "오리처럼 걷고, 오리처럼 꽥꽥거리면, 그것은 오리다."

프로그래밍에서 **덕 타이핑**(duck typing)이라고 부르는 생각입니다. 어떤 동물이 진짜 "오리 족보"에 올라 있는지는 따지지 않습니다. 오리가 해야 할 일(걷기, 꽥꽥거리기)을 할 수 있으면 오리로 대접합니다.

매장 출입 카드를 예로 들어 보겠습니다.

- **방식 A (이름표 확인)**: 경비원이 카드에 "본사 발급"이라는 도장이 찍혀 있는지 봅니다. 같은 정보가 적혀 있어도 도장이 없으면 들여보내지 않습니다.
- **방식 B (내용 확인)**: 경비원이 카드에 사번과 이름이 적혀 있는지만 봅니다. 누가 발급했든, 카드 뒤에 다른 정보가 더 적혀 있든 상관없이 사번과 이름만 있으면 통과입니다.

Java와 C#은 방식 A, **TypeScript는 방식 B**입니다. TypeScript는 값이 "어떤 이름의 타입으로 만들어졌는지"가 아니라 "필요한 속성을 갖췄는지"만 봅니다. 이것을 **구조적 타이핑**(structural typing)이라고 합니다.

## 개념 설명

### 구조적 타이핑: 모양이 맞으면 통과

먼저 서로 아무 관계가 없는 두 타입을 만들어 보겠습니다.

```ts
interface Product {
  name: string
  price: number
}

interface MenuItem {
  name: string
  price: number
}

const americano: MenuItem = { name: '아메리카노', price: 4500 }

// Product를 받는 함수
function printProduct(product: Product): void {
  console.log(`${product.name}: ${product.price}원`)
}

// MenuItem을 Product 자리에 넣어도 됩니다.
printProduct(americano)
// 출력: 아메리카노: 4500원
```

해설:

- `Product`와 `MenuItem`은 이름이 다르고, `extends`로 연결하지도 않았습니다.
- 그래도 `MenuItem` 값을 `Product` 자리에 넣을 수 있습니다. 두 타입의 **모양**(`name: string`, `price: number`)이 같기 때문입니다.
- TypeScript에서 타입 이름은 "모양에 붙인 별명"일 뿐입니다. 판단은 모양으로 합니다.

### 명목적 타이핑과 비교하기 (Java · C#)

Java나 C# 같은 언어는 **명목적 타이핑**(nominal typing, 이름 기반 타이핑)을 씁니다. "명목(名目)"은 이름이라는 뜻입니다. 같은 모양이어도 **선언할 때 상속·구현 관계를 밝히지 않았으면** 서로 다른 타입입니다.

아래는 Java 코드입니다. 지금 실행해 볼 필요는 없고, 흐름만 보세요.

```text
// Java
class Product  { String name; int price; }
class MenuItem { String name; int price; }

void printProduct(Product p) { ... }

MenuItem americano = new MenuItem();
printProduct(americano);   // 컴파일 오류: MenuItem은 Product가 아님
```

Java에서는 `MenuItem`이 `Product`를 상속(`extends`)하거나 같은 인터페이스를 구현(`implements`)해야만 넘길 수 있습니다. C#도 같습니다.

| 구분 | 명목적 타이핑 (Java, C#) | 구조적 타이핑 (TypeScript, Go의 인터페이스) |
|---|---|---|
| 판단 기준 | 타입의 **이름**과 선언된 상속 관계 | 타입의 **모양**(속성과 그 타입) |
| 같은 모양, 다른 이름 | 서로 다른 타입 | 같은 타입처럼 취급 |
| 장점 | 실수로 섞일 일이 적음 | 관계를 미리 선언하지 않아도 됨, JS 객체와 잘 맞음 |
| 단점 | 어댑터·변환 코드가 많아짐 | 모양이 같은 다른 개념이 섞일 수 있음 |

TypeScript가 구조적 타이핑을 고른 이유는 **JavaScript 때문**입니다. JavaScript에서는 `{ name: '아메리카노', price: 4500 }`처럼 중괄호로 객체를 바로 만들어 쓰는 일이 아주 많습니다. 이런 객체에는 "어떤 클래스로 만들었다"는 이름표가 없습니다. 이름표가 없는 값을 다루려면 모양으로 판단할 수밖에 없습니다.

### 할당 가능성: 어느 쪽에서 어느 쪽으로?

"A 타입의 값을 B 타입 자리에 넣을 수 있다"를 **"A는 B에 할당 가능하다"**(A is assignable to B)라고 말합니다. 오류 메시지에 자주 나오는 `is not assignable to`가 바로 이 말입니다.

객체 타입의 기본 규칙은 하나입니다.

::: tip 할당 가능성의 기본 규칙
B가 요구하는 속성을 A가 **모두** 가지고 있고, 각 속성의 타입도 맞으면 A는 B에 할당 가능합니다.
A에 속성이 **더 있는 것은 괜찮습니다.** 모자라면 안 됩니다.
:::

즉 **속성이 더 많은 쪽 → 적은 쪽**으로는 넣을 수 있고, 반대는 안 됩니다.

```ts
interface Product {
  name: string
  price: number
}

interface StockedProduct {
  name: string
  price: number
  stock: number
}

const croissant: StockedProduct = { name: '크루아상', price: 3500, stock: 12 }

// ✅ 많은 쪽 → 적은 쪽: Product가 요구하는 name, price가 모두 있음
const p: Product = croissant

const simple: Product = { name: '스콘', price: 3200 }

// ❌ 적은 쪽 → 많은 쪽: stock이 없음
const s: StockedProduct = simple
// ❌ Property 'stock' is missing in type 'Product' but required in type 'StockedProduct'. (TS2741)
```

왜 이런 규칙일까요? `Product` 타입 변수를 쓰는 코드는 `name`과 `price`만 꺼내 씁니다. 실제 값에 `stock`이 더 붙어 있어도 아무 문제가 없습니다. 반대로 `StockedProduct` 변수를 쓰는 코드는 `stock`을 꺼내 쓸 수 있어야 하는데, 값에 `stock`이 없으면 실행 중에 `undefined`가 나와 버그가 됩니다.

앞 레슨의 "집합" 관점으로 보면 더 분명합니다.

- `Product`의 집합: `name`과 `price`가 있는 **모든** 객체 (재고가 있든 없든)
- `StockedProduct`의 집합: 거기에 `stock`까지 있는 객체 → `Product` 집합 **안에** 들어 있는 더 작은 집합

작은 집합의 원소는 언제나 큰 집합의 원소이기도 합니다. 그래서 `StockedProduct` 값은 `Product`에 들어갑니다. 이때 `StockedProduct`를 `Product`의 **서브타입**(subtype, 하위 타입), `Product`를 `StockedProduct`의 **슈퍼타입**(supertype, 상위 타입)이라고 부릅니다.

### 속성 타입도 할당 가능해야 한다

속성 이름만 같다고 끝이 아닙니다. 각 속성의 타입도 할당 가능해야 합니다. 이 검사는 속성 안쪽으로 **한 단계씩 내려가며** 반복됩니다.

```ts
interface Order {
  orderNo: string
  status: string
}

interface PaidOrder {
  orderNo: string
  status: 'PAID'
}

const paid: PaidOrder = { orderNo: 'A-1001', status: 'PAID' }
const order: Order = paid // ✅ 'PAID'는 string에 할당 가능

const anyOrder: Order = { orderNo: 'A-1002', status: 'CANCELED' }
const paid2: PaidOrder = anyOrder
// ❌ Type 'Order' is not assignable to type 'PaidOrder'. (TS2322)
```

`'PAID'`는 `string`의 일부이므로 첫 번째 할당은 됩니다. 두 번째는 `string`(아무 문자열이나)을 `'PAID'`(딱 그 문자열)에 넣으려 하니 실패합니다. 오류 메시지 아래에는 "`status` 속성의 타입이 호환되지 않는다(Types of property 'status' are incompatible)"는 설명이 이어집니다.

### 선택 속성과 할당 가능성

선택 속성(`?`)은 "있어도 되고 없어도 됨"입니다.

```ts
interface MemberForm {
  name: string
  phone?: string
}

interface Member {
  name: string
  phone: string
}

const member: Member = { name: '김하늘', phone: '010-1111-2222' }
const form: MemberForm = member // ✅ 필수 → 선택: 항상 있으니 문제없음

const draft: MemberForm = { name: '이바다' }
const saved: Member = draft
// ❌ Type 'MemberForm' is not assignable to type 'Member'. (TS2322)
```

필수 속성을 가진 값은 선택 속성 자리에 넣을 수 있지만, 반대는 "없을 수도 있는 값"을 "반드시 있어야 하는 자리"에 넣는 것이라 막힙니다.

### 함수 매개변수에서도 같은 규칙

함수에 인수를 넘기는 것도 "인수 값을 매개변수 타입에 할당"하는 일입니다. 앞 레슨의 `describeEntity(member)`가 통과한 이유가 이것입니다.

```ts
interface HasId {
  id: number
}

function printId(item: HasId): void {
  console.log(`ID: ${item.id}`)
}

const product = { id: 101, name: '카페라테', price: 5000 }
const member = { id: 7, email: 'kim@example.com' }

printId(product) // ✅ id가 있음
printId(member) // ✅ id가 있음
// 출력: ID: 101
// 출력: ID: 7
```

`printId`는 "`id`가 있는 것이면 무엇이든" 받습니다. 상품이든 회원이든, 어떤 속성이 더 붙어 있든 상관없습니다. 구조적 타이핑 덕분에 공통 함수를 쉽게 만들 수 있습니다.

함수 타입끼리의 할당 가능성(매개변수가 적은 함수를 많은 함수 자리에 넣을 수 있는 이유 등)은 규칙이 조금 더 복잡해서 [변성과 함수 타입 호환성](../part5-advanced/07-variance) 레슨에서 따로 다룹니다.

### 클래스도 구조로 판단한다

클래스(3-8 레슨에서 자세히 배웁니다)로 만든 값도 구조로 판단합니다. Java와 크게 다른 점입니다.

```ts
class Store {
  constructor(public code: string, public name: string) {}
}

class Warehouse {
  constructor(public code: string, public name: string) {}
}

function openStore(store: Store): void {
  console.log(`${store.name}(${store.code}) 개점`)
}

// Warehouse로 만든 값도 모양이 같으므로 통과합니다.
openStore(new Warehouse('W01', '이천 물류센터'))
// 출력: 이천 물류센터(W01) 개점
```

"창고를 매장처럼 개점"하는 것은 업무상 이상하지만 TypeScript는 막지 않습니다. 모양이 같으니까요. 이런 경우를 막는 방법은 이 레슨 뒤쪽의 **브랜드 타입**에서 다룹니다.

### 초과 속성 검사: 왜 이번엔 막힐까?

여기까지 읽으면 "속성이 더 많은 건 괜찮다"고 정리했을 겁니다. 그런데 아래 코드는 오류가 납니다.

```ts
interface Product {
  name: string
  price: number
}

const p: Product = {
  name: '아메리카노',
  price: 4500,
  stock: 30,
  // ❌ Object literal may only specify known properties, and 'stock' does not exist in type 'Product'. (TS2353)
}
```

`stock`이 "더 있는" 것뿐인데 왜 막힐까요? 이것이 **초과 속성 검사**(excess property checking)입니다. 핵심은 다음 한 줄입니다.

::: info 초과 속성 검사가 일어나는 조건
**신선한(fresh) 객체 리터럴**, 즉 중괄호 `{ ... }`로 **그 자리에서 바로 만든 객체**를 타입이 정해진 곳에 바로 넣을 때만 검사합니다.
:::

같은 객체를 변수에 먼저 담았다가 넣으면 검사하지 않습니다.

```ts
interface Product {
  name: string
  price: number
}

// 먼저 변수에 담습니다. 이 객체의 타입은 { name: string; price: number; stock: number }
const raw = { name: '아메리카노', price: 4500, stock: 30 }

// ✅ 변수를 거쳐 넣으면 초과 속성 검사를 하지 않습니다.
const p: Product = raw
console.log(p.name)
// 출력: 아메리카노
```

#### 왜 신선한 리터럴에서만 검사할까?

두 상황을 비교해 보면 이유가 보입니다.

1. **변수를 넘길 때**: `raw`는 다른 곳에서도 쓰일 수 있는 값입니다. `stock`은 재고 화면에서 필요해서 넣어 둔 정당한 정보일 수 있습니다. 이 값을 `Product` 자리에 넘기는 것은 앞에서 본 "많은 쪽 → 적은 쪽" 할당이고, 막을 이유가 없습니다.
2. **리터럴을 바로 넣을 때**: `const p: Product = { ..., stock: 30 }`에서 `stock`은 어디서도 쓰일 수 없습니다. 이 객체는 지금 만들어져 `Product`로만 취급되므로 `p.stock`이라고 쓰면 오류가 납니다. **아무도 읽을 수 없는 속성을 일부러 적었을 리는 거의 없으니 오타일 가능성이 높습니다.**

실제로 초과 속성 검사가 잡아 주는 것은 대부분 오타입니다.

```ts
interface SearchOption {
  keyword?: string
  pageSize?: number
}

function searchProducts(option: SearchOption): void {
  console.log(option.pageSize ?? 20)
}

searchProducts({ keyword: '라테', pagesize: 50 })
// ❌ Object literal may only specify known properties, but 'pagesize' does not exist in type 'SearchOption'. Did you mean to write 'pageSize'? (TS2561)
```

`pageSize`를 `pagesize`로 잘못 적었습니다. 이 검사가 없었다면 `pagesize: 50`은 조용히 무시되고, 화면에는 기본값 20개만 나와서 원인을 찾느라 고생했을 겁니다. TypeScript는 비슷한 이름이 있으면 "혹시 `pageSize`를 쓰려던 것 아닌가요?"라고 알려 줍니다(TS2561).

#### 신선함은 언제 사라질까?

객체 리터럴의 "신선함"은 **변수에 담기는 순간** 사라집니다. 정리하면 이렇습니다.

| 코드 | 초과 속성 검사 |
|---|---|
| `const p: Product = { ..., stock: 30 }` | 함 (리터럴을 바로 대입) |
| `printProduct({ ..., stock: 30 })` | 함 (리터럴을 바로 인수로) |
| `return { ..., stock: 30 }` (반환 타입이 `Product`인 함수) | 함 (리터럴을 바로 반환) |
| `const raw = { ... }; const p: Product = raw` | 안 함 (변수를 거침) |
| `printProduct(raw)` | 안 함 |

#### 일부러 속성을 더 넣고 싶다면

초과 속성 검사를 "피하는" 것보다 **타입을 올바르게 고치는** 편이 좋습니다.

```ts
interface Product {
  name: string
  price: number
}

// 방법 1: 정말 필요한 속성이면 타입에 추가합니다.
interface ProductWithStock extends Product {
  stock: number
}
const a: ProductWithStock = { name: '아메리카노', price: 4500, stock: 30 }

// 방법 2: 어떤 속성이 더 올지 모르는 데이터라면 인덱스 시그니처로 허용합니다.
interface FlexibleProduct {
  name: string
  price: number
  [key: string]: unknown
}
const b: FlexibleProduct = { name: '카페라테', price: 5000, origin: '콜롬비아' }

console.log(a.stock, b.origin)
// 출력: 30 콜롬비아
```

`as Product`로 단언하거나 변수를 한 번 거치게 하는 식으로 검사를 피하는 것도 가능은 하지만, 오타를 잡아 주는 안전장치를 끄는 셈이므로 권하지 않습니다.

### 약한 타입 검사: 모든 속성이 선택일 때

모든 속성이 선택(`?`)인 타입을 **약한 타입**(weak type)이라고 부릅니다. 약한 타입에는 거의 아무 객체나 들어갈 수 있을 것 같지만, TypeScript는 **겹치는 속성이 하나도 없으면** 막습니다. 이 검사는 변수를 거쳐도 일어납니다.

```ts
interface SearchOption {
  keyword?: string
  pageSize?: number
}

const memberQuery = { email: 'kim@example.com', grade: 'VIP' }

const option: SearchOption = memberQuery
// ❌ Type '{ email: string; grade: string; }' has no properties in common with type 'SearchOption'. (TS2559)
```

"공통 속성이 하나도 없다면 엉뚱한 값을 넘긴 것"으로 판단하는 안전장치입니다. 겹치는 속성이 하나라도 있으면 통과합니다.

### 브랜드 타입: 모양이 같아도 섞이면 안 될 때

구조적 타이핑의 약점은 **모양이 같은 서로 다른 개념**이 섞인다는 점입니다. 상품 ID와 회원 ID가 둘 다 `number`라면 어떨까요?

```ts
type ProductId = number
type MemberId = number

function findProduct(id: ProductId): void {
  console.log(`상품 ${id} 조회`)
}

const memberId: MemberId = 7

// 회원 ID를 상품 조회에 넘겼지만 오류가 나지 않습니다.
findProduct(memberId)
// 출력: 상품 7 조회
```

`type ProductId = number`는 `number`에 다른 이름을 붙였을 뿐, 새 타입을 만든 것이 아닙니다. 그래서 `MemberId`와 `ProductId`는 완전히 같은 타입입니다.

이 둘을 구별하고 싶을 때 쓰는 기법이 **브랜드 타입**(branded type)입니다. 소에 낙인(brand)을 찍어 주인을 구별하듯, 타입에 **보이지 않는 표식 속성**을 붙입니다. 앞 레슨에서 배운 인터섹션을 씁니다.

```ts
// number이면서, 타입 검사용 표식 속성 __brand를 가진 타입
type ProductId = number & { readonly __brand: 'ProductId' }
type MemberId = number & { readonly __brand: 'MemberId' }

// 브랜드 타입 값을 만드는 함수 (검증을 이곳에 모읍니다)
function toProductId(value: number): ProductId {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`잘못된 상품 ID: ${value}`)
  }
  return value as ProductId
}

function toMemberId(value: number): MemberId {
  return value as MemberId
}

function findProduct(id: ProductId): void {
  console.log(`상품 ${id} 조회`)
}

const productId = toProductId(101)
const memberId = toMemberId(7)

findProduct(productId) // ✅

findProduct(memberId)
// ❌ Argument of type 'MemberId' is not assignable to parameter of type 'ProductId'. (TS2345)

findProduct(101)
// ❌ Argument of type 'number' is not assignable to parameter of type 'ProductId'. (TS2345)
```

해설:

- `ProductId`와 `MemberId`는 `__brand` 속성의 리터럴 타입(`'ProductId'`, `'MemberId'`)이 달라 모양이 다릅니다. 그래서 서로 섞이지 않습니다.
- 그냥 숫자 `101`도 `__brand` 속성이 없으므로 `ProductId` 자리에 넣을 수 없습니다. 반드시 `toProductId`를 거쳐야 합니다.
- **실행 중에는 `__brand` 속성이 실제로 존재하지 않습니다.** `value as ProductId`는 타입만 바꾸는 단언이고, 값은 그냥 숫자 101입니다. 브랜드는 오직 컴파일러를 위한 표식입니다.
- 브랜드 타입 값은 여전히 `number`이므로 `productId + 1` 같은 숫자 연산은 그대로 됩니다(결과는 그냥 `number`).

::: tip 브랜드 타입은 언제 쓰나요?
모든 ID에 브랜드를 붙이면 코드가 번거로워집니다. "섞이면 큰 사고가 나는 값"에만 쓰세요. 예: 서로 다른 테이블의 ID, 원(KRW)과 달러(USD) 금액, 검증을 마친 이메일 주소와 검증 전 문자열. `as` 단언은 브랜드를 만드는 함수 한 곳에만 두고, 나머지 코드는 그 함수를 거치게 합니다. 런타임 검증과 결합하는 방법은 [런타임 검증](../part4-async/05-runtime-validation) 레슨에서 다시 봅니다.
:::

## 자주 하는 실수

### 실수 1: 이름이 다르면 다른 타입이라고 생각하기

```ts
interface KrwPrice {
  amount: number
}
interface UsdPrice {
  amount: number
}

function payInKrw(price: KrwPrice): void {
  console.log(`${price.amount}원 결제`)
}

const usd: UsdPrice = { amount: 30 }
payInKrw(usd) // 오류 없이 통과! 30달러가 30원으로 결제됩니다.
// 출력: 30원 결제
```

**왜 틀렸나:** 이름이 다른 두 인터페이스를 만들면 서로 막아 줄 것이라 기대했지만, TypeScript는 모양으로 판단합니다. `amount: number` 하나로 모양이 같으니 같은 타입처럼 섞입니다.

```ts
// ✅ 통화를 구별하는 리터럴 속성을 둡니다.
interface KrwPrice {
  currency: 'KRW'
  amount: number
}
interface UsdPrice {
  currency: 'USD'
  amount: number
}

function payInKrw(price: KrwPrice): void {
  console.log(`${price.amount}원 결제`)
}

const usd: UsdPrice = { currency: 'USD', amount: 30 }
payInKrw(usd)
// ❌ Argument of type 'UsdPrice' is not assignable to parameter of type 'KrwPrice'. (TS2345)
```

`currency` 같은 구별용 속성은 실행 중에도 남아 있어서 값으로 확인할 수도 있습니다. 이 방식은 다음 레슨 [판별 유니온](./03-discriminated-union)의 출발점입니다.

### 실수 2: 변수를 거치면 오타가 안 잡힌다는 걸 모르기

```ts
interface SearchOption {
  keyword?: string
  pageSize?: number
}

function searchProducts(option: SearchOption): void {
  console.log(`페이지 크기: ${option.pageSize ?? 20}`)
}

// 옵션을 변수로 먼저 만들었습니다.
const option = { keyword: '라테', pageSize: 50, sortBy: 'price' }
searchProducts(option) // 오류 없음. 그런데 sortBy는 함수가 전혀 모르는 속성입니다.
// 출력: 페이지 크기: 50
```

**왜 틀렸나:** 변수를 거치면 초과 속성 검사가 꺼집니다. 여기서는 `pageSize`와 `keyword`가 겹치므로 약한 타입 검사도 통과합니다. 작성자는 가격순 정렬을 기대했지만 `sortBy`는 조용히 무시됩니다.

```ts
interface SearchOption {
  keyword?: string
  pageSize?: number
}

// ✅ 변수를 만들 때부터 타입을 붙이면 그 자리에서 검사됩니다.
const option: SearchOption = { keyword: '라테', pageSize: 50, sortBy: 'price' }
// ❌ Object literal may only specify known properties, and 'sortBy' does not exist in type 'SearchOption'. (TS2353)
```

이제 오류가 보이므로 `SearchOption`에 `sortBy`를 추가할지, 이 속성을 지울지 결정할 수 있습니다. 옵션 객체처럼 "특정 타입으로 쓰려고 만드는 객체"는 만들 때부터 타입을 붙이는 습관을 들이세요.

### 실수 3: 적은 쪽을 많은 쪽에 넣으려 하기

```ts
interface CartItem {
  productId: number
  qty: number
}

interface OrderLine {
  productId: number
  qty: number
  unitPrice: number
}

const item: CartItem = { productId: 1, qty: 2 }
const line: OrderLine = item
// ❌ Property 'unitPrice' is missing in type 'CartItem' but required in type 'OrderLine'. (TS2741)
```

**왜 틀렸나:** `OrderLine`은 `unitPrice`를 요구하는데 장바구니 항목에는 없습니다. 속성이 모자란 쪽은 많은 쪽에 넣을 수 없습니다. 빠진 값을 채워 새 객체를 만들어야 합니다.

```ts
interface CartItem {
  productId: number
  qty: number
}

interface OrderLine {
  productId: number
  qty: number
  unitPrice: number
}

const item: CartItem = { productId: 1, qty: 2 }

// ✅ 스프레드로 기존 속성을 복사하고 빠진 속성을 채웁니다.
const line: OrderLine = { ...item, unitPrice: 4500 }
console.log(line.qty * line.unitPrice)
// 출력: 9000
```

### 실수 4: 브랜드 속성을 실제로 읽으려 하기

```ts
type ProductId = number & { readonly __brand: 'ProductId' }

const id = 101 as ProductId
console.log(id.__brand)
// 출력: undefined
```

**왜 틀렸나:** 타입상으로는 `__brand`가 있어서 컴파일 오류가 나지 않지만, 실제 값은 숫자 101이므로 속성이 없습니다. 브랜드는 컴파일러만 보는 표식입니다. 실행 중에 종류를 구별해야 한다면 브랜드가 아니라 `currency: 'KRW'` 같은 **진짜 속성**을 두어야 합니다.

```ts
type ProductId = number & { readonly __brand: 'ProductId' }

const id = 101 as ProductId
// ✅ 브랜드 타입 값은 원래 타입(number)으로만 사용합니다.
console.log(id + 1)
// 출력: 102
```

## 직접 해 보기

### 문제 1 ⭐ 기초

아래 할당 (가)~(라) 중 오류가 나는 것을 모두 고르고 이유를 말해 보세요.

```text
interface Store {
  code: string
  name: string
}

const a = { code: 'S001', name: '강남점', region: '서울' }
const b = { code: 'S002' }

const s1: Store = a                                              // (가)
const s2: Store = b                                              // (나)
const s3: Store = { code: 'S003', name: '판교점' }               // (다)
const s4: Store = { code: 'S004', name: '분당점', region: '경기' } // (라)
```

::: details 정답 보기
- (가) ✅ 변수 `a`는 속성이 더 많지만, 변수를 거쳤으므로 초과 속성 검사가 없습니다.
- (나) ❌ `name`이 없습니다. (TS2741)
- (다) ✅ 모양이 정확히 맞습니다.
- (라) ❌ 신선한 객체 리터럴에 `region`이 더 있어서 초과 속성 검사에 걸립니다. (TS2353)

```ts
interface Store {
  code: string
  name: string
}

const b = { code: 'S002' }
const s2: Store = b
// ❌ Property 'name' is missing in type '{ code: string; }' but required in type 'Store'. (TS2741)

const s4: Store = { code: 'S004', name: '분당점', region: '경기' }
// ❌ Object literal may only specify known properties, and 'region' does not exist in type 'Store'. (TS2353)
```
:::

### 문제 2 ⭐ 기초

`HasPrice` 타입을 받아 "가격: 4,500원" 형식으로 출력하는 함수 `printPrice`를 만들고, 상품 객체와 메뉴 객체(속성이 서로 다름)를 모두 넘겨 보세요.

::: details 정답 보기
```ts
interface HasPrice {
  price: number
}

function printPrice(item: HasPrice): void {
  console.log(`가격: ${item.price.toLocaleString('ko-KR')}원`)
}

const product = { id: 1, name: '아메리카노', price: 4500 }
const menu = { menuCode: 'M10', title: '브런치 세트', price: 12900, kcal: 820 }

printPrice(product)
printPrice(menu)
// 출력: 가격: 4,500원
// 출력: 가격: 12,900원
```
`printPrice`는 `price`만 있으면 무엇이든 받습니다. 변수를 넘겼으므로 다른 속성이 더 있어도 문제없습니다.
:::

### 문제 3 ⭐⭐ 응용

다음 코드에서 `sendCoupon`에 회원 ID 대신 주문 ID를 넘기는 실수를 컴파일러가 잡도록 브랜드 타입으로 고쳐 보세요.

```ts
function sendCoupon(memberId: number, couponCode: string): void {
  console.log(`회원 ${memberId}에게 ${couponCode} 발송`)
}

const orderId = 5001
sendCoupon(orderId, 'WELCOME10') // 실수인데 통과합니다.
// 출력: 회원 5001에게 WELCOME10 발송
```

::: details 정답 보기
```ts
type MemberId = number & { readonly __brand: 'MemberId' }
type OrderId = number & { readonly __brand: 'OrderId' }

function toMemberId(value: number): MemberId {
  return value as MemberId
}
function toOrderId(value: number): OrderId {
  return value as OrderId
}

function sendCoupon(memberId: MemberId, couponCode: string): void {
  console.log(`회원 ${memberId}에게 ${couponCode} 발송`)
}

const orderId = toOrderId(5001)
const memberId = toMemberId(7)

sendCoupon(memberId, 'WELCOME10') // ✅

sendCoupon(orderId, 'WELCOME10')
// ❌ Argument of type 'OrderId' is not assignable to parameter of type 'MemberId'. (TS2345)
```
:::

### 문제 4 ⭐⭐ 응용

아래 함수 호출은 오류가 납니다. 오류 메시지가 무엇일지 예상하고, 왜 TypeScript가 이 호출을 막는 것이 도움이 되는지 설명해 보세요.

```text
interface ReceiptOption {
  printLogo?: boolean
  copies?: number
}

function printReceipt(option: ReceiptOption): void {
  console.log(option.copies ?? 1)
}

printReceipt({ printlogo: false, copies: 2 })
```

::: details 정답 보기
```ts
interface ReceiptOption {
  printLogo?: boolean
  copies?: number
}

function printReceipt(option: ReceiptOption): void {
  console.log(option.copies ?? 1)
}

printReceipt({ printlogo: false, copies: 2 })
// ❌ Object literal may only specify known properties, but 'printlogo' does not exist in type 'ReceiptOption'. Did you mean to write 'printLogo'? (TS2561)
```
`printLogo`의 대소문자를 틀렸습니다. 검사가 없었다면 `printlogo: false`는 무시되고 로고가 계속 인쇄되었을 것입니다. 신선한 객체 리터럴에 적힌 "아무도 읽을 수 없는 속성"은 거의 항상 오타라서, TypeScript가 이 경우에 초과 속성을 검사합니다.
:::

### 문제 5 ⭐⭐⭐ 도전

다음 코드에서 (가)와 (나)는 각각 오류가 날까요, 안 날까요? 이유를 "약한 타입"과 "초과 속성 검사"라는 말을 써서 설명하세요.

```text
interface DisplayOption {
  showPrice?: boolean
  showStock?: boolean
}

const memberSetting = { theme: 'dark', fontSize: 14 }
const productSetting = { showPrice: true, theme: 'dark' }

const o1: DisplayOption = memberSetting  // (가)
const o2: DisplayOption = productSetting // (나)
```

::: details 정답 보기
- `DisplayOption`은 모든 속성이 선택인 **약한 타입**입니다.
- (가)는 오류입니다. 변수를 거쳤으므로 초과 속성 검사는 하지 않지만, 약한 타입 검사는 변수를 거쳐도 일어납니다. `memberSetting`에는 `DisplayOption`과 겹치는 속성이 하나도 없으므로 TS2559 오류가 납니다.
- (나)는 통과합니다. `showPrice`가 겹치므로 약한 타입 검사를 통과하고, 변수를 거쳤으므로 `theme`에 대한 초과 속성 검사도 없습니다.

```ts
interface DisplayOption {
  showPrice?: boolean
  showStock?: boolean
}

const memberSetting = { theme: 'dark', fontSize: 14 }
const productSetting = { showPrice: true, theme: 'dark' }

const o1: DisplayOption = memberSetting
// ❌ Type '{ theme: string; fontSize: number; }' has no properties in common with type 'DisplayOption'. (TS2559)
const o2: DisplayOption = productSetting // ✅
```
:::

## 확인 퀴즈

1. 구조적 타이핑에서 "A를 B 자리에 넣어도 되는가"는 무엇으로 판단하나요?
2. `{ name, price, stock }` 모양의 값을 `{ name, price }` 타입에 넣을 수 있나요? 반대는요?
3. 초과 속성 검사는 어떤 경우에 일어나나요?
4. 초과 속성 검사가 그 경우에만 일어나도 괜찮은 이유는 무엇인가요?
5. 브랜드 타입의 `__brand` 속성은 실행 중에 존재하나요?

::: details 정답 보기
1. 타입의 이름이 아니라 **모양**입니다. B가 요구하는 속성을 A가 모두 가지고 있고, 각 속성 타입이 할당 가능하면 됩니다.
2. 넣을 수 있습니다(많은 쪽 → 적은 쪽). 반대는 `stock`이 모자라서 안 됩니다.
3. 중괄호로 그 자리에서 만든 **신선한 객체 리터럴**을 타입이 정해진 변수·매개변수·반환값에 바로 넣을 때입니다.
4. 리터럴에 더 적힌 속성은 아무도 읽을 수 없으므로 오타일 가능성이 높지만, 변수에 담긴 값의 추가 속성은 다른 곳에서 쓰는 정당한 정보일 수 있기 때문입니다.
5. 존재하지 않습니다. `as`로 타입만 바꾼 것이고, 브랜드는 컴파일러만 보는 표식입니다.
:::

## 정리

- TypeScript는 **구조적 타이핑**을 씁니다. 타입 이름이 아니라 모양(속성과 그 타입)이 맞으면 할당할 수 있습니다.
- Java·C#의 **명목적 타이핑**은 이름과 선언된 상속 관계로 판단합니다. TypeScript가 구조를 택한 이유는 이름표 없는 JS 객체 리터럴 때문입니다.
- 할당 규칙: 요구하는 속성을 모두 가지면 됩니다. **속성이 더 많은 쪽 → 적은 쪽**은 되고, 반대는 안 됩니다.
- **초과 속성 검사**는 신선한 객체 리터럴에서만 일어납니다. 아무도 읽을 수 없는 속성은 오타일 가능성이 높기 때문입니다.
- 모든 속성이 선택인 약한 타입에는 겹치는 속성이 하나도 없는 값을 넣을 수 없습니다.
- 모양이 같은 다른 개념(ID, 통화)을 구별하려면 **브랜드 타입**이나 구별용 리터럴 속성을 씁니다.

## 다음 단계

[판별 유니온과 완전성 검사(exhaustiveness)](./03-discriminated-union): `currency: 'KRW'` 같은 구별용 속성을 이용해 카드·현금·포인트 결제를 안전하게 나누어 처리하고, 처리를 빠뜨린 경우를 컴파일러가 잡게 만듭니다.
