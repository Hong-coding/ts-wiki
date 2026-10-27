---
title: keyof · typeof · 인덱스 접근 타입
---

# keyof · typeof · 인덱스 접근 타입

<LessonMeta level="중급" :minutes="50" prev="extends 제약, keyof 제약, 기본 타입 매개변수, const 타입 매개변수" />

## 이번에 배울 것

- `keyof`로 객체 타입의 키 이름들을 유니온 타입으로 뽑을 수 있다.
- 타입 위치의 `typeof`로 **값에서 타입을** 만들 수 있다.
- 인덱스 접근 타입 `T[K]`로 속성 하나의 타입을 꺼낼 수 있다.
- `typeof arr[number]`로 배열 원소의 타입을 꺼낼 수 있다.
- `as const`와 조합해 상수 하나에서 유니온 타입을 뽑아, 값과 타입을 한 곳에서 관리할 수 있다.

## 먼저 알아 둘 것

- [제네릭 제약(extends)과 기본 타입 매개변수](./05-generic-constraints): `K extends keyof T`, `T[K]`를 미리 맛봤습니다.
- [유니온 타입과 리터럴 타입](../part2-types/06-union-literal): `as const`
- [타입 좁히기(Narrowing)](../part2-types/08-narrowing): 값 위치의 `typeof` 연산자
- [열거형(enum)과 그 대안](../part2-types/09-enum)

## 비유로 이해하기

매장 상품 정보를 담은 **엑셀 표**를 떠올려 보세요.

| id | name | price |
|---|---|---|
| 1 | 아메리카노 | 4500 |

- **`keyof`** 는 표의 **머리글 줄**을 읽는 것입니다. "이 표에는 `id`, `name`, `price` 열이 있다."
- **인덱스 접근 타입 `T[K]`** 는 **특정 열의 데이터 형식**을 보는 것입니다. "`price` 열은 숫자 형식이다."
- **`typeof`** 는 이미 값이 채워진 표를 보고 **양식을 거꾸로 만들어 내는 것**입니다. 표를 먼저 만들었는데, 같은 모양의 빈 양식이 필요할 때 씁니다.

지금까지는 "타입을 먼저 정의하고 값을 만들었다"면, 이번 레슨부터는 **이미 있는 타입이나 값에서 새 타입을 뽑아내는** 도구를 배웁니다. 이 도구들이 다음 레슨의 유틸리티 타입과 Part 5 고급 타입의 재료가 됩니다.

## 개념 설명

### keyof: 키 이름들의 유니온

`keyof 타입`은 그 객체 타입의 **키 이름들을 문자열 리터럴 유니온**으로 돌려줍니다.

```ts
interface Product {
  id: number
  name: string
  price: number
}

type ProductKey = keyof Product
// 마우스를 올려 보면: type ProductKey = keyof Product

const k1: ProductKey = 'name' // ✅
const k2: ProductKey = 'price' // ✅
const k3: ProductKey = 'stock'
// ❌ Type '"stock"' is not assignable to type 'keyof Product'. (TS2322)
```

해설:

- `keyof Product`는 `'id' | 'name' | 'price'`와 같습니다.
- 마우스를 올리면 펼쳐진 유니온 대신 `keyof Product`라고만 보일 때가 많습니다. 같은 뜻입니다.
- `Product`에 `stock` 속성을 추가하면 `ProductKey`도 **자동으로** `'stock'`을 포함합니다. 키 목록을 손으로 따로 관리할 필요가 없습니다.

#### keyof를 어디에 쓸까?

정렬 기준, 검색 조건, 표의 열 정의처럼 **"이 객체의 속성 이름 중 하나"** 를 받는 곳에 씁니다.

```ts
interface Product {
  id: number
  name: string
  price: number
}

// 상품 목록 표의 열 정의: key는 반드시 Product의 속성 이름이어야 합니다.
interface Column {
  key: keyof Product
  label: string
}

const columns: Column[] = [
  { key: 'name', label: '상품명' },
  { key: 'price', label: '가격' },
]

const row: Product = { id: 1, name: '아메리카노', price: 4500 }
console.log(columns.map((c) => `${c.label}: ${row[c.key]}`).join(' / '))
// 출력: 상품명: 아메리카노 / 가격: 4500
```

`{ key: 'prise', label: '가격' }`처럼 오타를 내면 컴파일 단계에서 잡힙니다. React·Vue의 표(그리드) 컴포넌트에서 열을 정의할 때 이 패턴을 자주 봅니다.

#### 인덱스 시그니처와 keyof

인덱스 시그니처가 있는 타입에 `keyof`를 쓰면 키 타입 자체가 나옵니다.

```ts
// 상품 코드 → 재고 수량
interface StockMap {
  [productCode: string]: number
}

type StockKey = keyof StockMap
// 마우스를 올려 보면: type StockKey = string | number
```

`string`만 기대했는데 `number`가 함께 나옵니다. JavaScript에서는 `obj[1]`이 `obj['1']`과 같은 속성을 가리키기 때문에, 문자열 키를 허용하면 숫자 키도 허용되기 때문입니다. 깊이 신경 쓸 일은 드물지만, "`keyof`가 왜 `number`도 주지?" 하고 놀랐을 때 이 이유를 떠올리세요.

### typeof: 값에서 타입 만들기

Part 2에서 배운 `typeof`는 **값 위치**에서 쓰는 JavaScript 연산자였습니다. 실행 중에 `'string'`, `'number'` 같은 문자열을 돌려줍니다.

TypeScript에는 **타입 위치**에서 쓰는 `typeof`가 하나 더 있습니다. 변수 이름을 받아 **그 변수의 타입**을 돌려줍니다. 이름은 같지만 쓰는 자리가 다른 별개의 기능입니다.

```ts
const defaultProduct = {
  id: 0,
  name: '',
  price: 0,
  tags: ['신상품'],
}

// 타입 위치의 typeof: 변수의 타입을 가져옵니다.
type Product = typeof defaultProduct
// 마우스를 올려 보면: type Product = { id: number; name: string; price: number; tags: string[]; }

const latte: Product = { id: 2, name: '카페라테', price: 5000, tags: [] }

// 값 위치의 typeof: 실행 중에 문자열을 돌려줍니다.
console.log(typeof latte.price)
// 출력: number
```

| 위치 | 예 | 결과 | 언제 |
|---|---|---|---|
| 값 위치 (JS 연산자) | `typeof latte.price` | 문자열 `'number'` | 실행 중 |
| 타입 위치 (TS 연산자) | `type T = typeof latte` | 타입 | 컴파일 중 |

"타입 위치"는 `:` 뒤, `type X =` 오른쪽, 꺾쇠 안처럼 **타입이 와야 하는 자리**를 말합니다.

#### 언제 typeof를 쓸까?

타입을 따로 정의하는 것이 정석이지만, 다음처럼 **값이 먼저 있고 타입은 그 값을 따라가야 하는** 경우에 `typeof`가 편합니다.

```ts
// 설정 객체: 값이 기준입니다.
const posConfig = {
  storeCode: 'S001',
  receiptCopies: 1,
  printLogo: true,
}

// 설정을 덮어쓰는 함수: 설정 객체와 같은 모양만 받습니다.
function applyConfig(config: typeof posConfig): void {
  console.log(`${config.storeCode} 매장, 영수증 ${config.receiptCopies}장`)
}

applyConfig({ storeCode: 'S002', receiptCopies: 2, printLogo: false })
// 출력: S002 매장, 영수증 2장
```

함수의 타입도 가져올 수 있습니다.

```ts
function calcTotal(price: number, qty: number): number {
  return price * qty
}

type CalcFn = typeof calcTotal
// 마우스를 올려 보면: type CalcFn = (price: number, qty: number) => number

// 같은 모양의 다른 함수(할인 적용)를 만들 때 타입을 재사용합니다.
const calcDiscounted: CalcFn = (price, qty) => Math.round(price * qty * 0.9)
console.log(calcDiscounted(4500, 2))
// 출력: 8100
```

::: warning typeof에는 변수(값) 이름만 쓸 수 있습니다
`typeof`는 값의 타입을 가져오는 것이므로, 타입 이름이나 함수 호출 식을 넣을 수 없습니다. `typeof Product`(인터페이스 이름)나 `typeof calcTotal(1, 2)`(호출)는 오류입니다. 함수 반환값의 타입이 필요하면 다음 레슨의 `ReturnType`을 씁니다.
:::

### 인덱스 접근 타입: T[K]

객체에서 값 하나를 꺼낼 때 `product['price']`라고 쓰듯, 타입에서도 **대괄호로 속성 하나의 타입**을 꺼낼 수 있습니다. 이것을 **인덱스 접근 타입**(indexed access type)이라고 합니다.

```ts
interface Product {
  id: number
  name: string
  price: number
  category: {
    code: string
    label: string
  }
}

type Price = Product['price']
// 마우스를 올려 보면: type Price = number

type Category = Product['category']
// 마우스를 올려 보면: type Category = { code: string; label: string; }

// 여러 단계로 들어갈 수도 있습니다.
type CategoryCode = Product['category']['code']
// 마우스를 올려 보면: type CategoryCode = string

// 유니온으로 여러 속성을 한꺼번에 꺼내면 각 타입의 유니온이 됩니다.
type IdOrName = Product['id' | 'name']
// 마우스를 올려 보면: type IdOrName = string | number
```

해설:

- `Product['price']`의 `'price'`는 **문자열 값이 아니라 문자열 리터럴 타입**입니다. 타입 위치이기 때문입니다.
- 속성 타입을 다시 적지 않고 원본에서 꺼내 쓰므로, 원본이 바뀌면 함께 바뀝니다. 예를 들어 `price`가 `number`에서 `bigint`로 바뀌면 `Price`도 자동으로 바뀝니다.
- 없는 속성을 꺼내면 오류가 납니다.

```ts
interface Product {
  id: number
  price: number
}

type Stock = Product['stock']
// ❌ Property 'stock' does not exist on type 'Product'. (TS2339)
```

::: info 점(.)은 쓸 수 없습니다
타입에서는 `Product.price`가 아니라 반드시 `Product['price']`처럼 대괄호를 씁니다. `Product.price`라고 쓰면 TypeScript는 `Product`라는 **네임스페이스** 안의 타입을 찾으려 해서 오류가 납니다.
:::

#### keyof와 함께: T[keyof T]

`keyof`와 인덱스 접근을 합치면 **"모든 속성 값 타입의 유니온"** 을 얻습니다.

```ts
interface Product {
  id: number
  name: string
  price: number
  isSoldOut: boolean
}

type ProductValue = Product[keyof Product]
// 마우스를 올려 보면: type ProductValue = string | number | boolean
```

`Product['id' | 'name' | 'price' | 'isSoldOut']`과 같으므로 각 속성 타입의 유니온이 됩니다. 이 모양은 아래의 "상수 객체에서 유니온 뽑기"에서 핵심적으로 쓰입니다.

#### 제네릭과 함께: 앞 레슨의 getProp 다시 보기

앞 레슨의 `getProp` 반환 타입 `T[K]`가 바로 인덱스 접근 타입입니다.

```ts
function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

const member = { memberNo: 'M0007', name: '김하늘', point: 1200 }
const point = getProp(member, 'point')
// 마우스를 올려 보면: const point: number

console.log(point + 300)
// 출력: 1500
```

`K`가 `'point'`로 추론되므로 `T[K]`는 `member`의 `point` 속성 타입, 즉 `number`가 됩니다.

### 배열 원소 타입: T[number]

배열에서 값을 꺼낼 때 `arr[0]`, `arr[1]`처럼 **숫자 인덱스**를 씁니다. 타입에서도 `[number]`로 "아무 숫자 인덱스로 꺼낸 원소의 타입"을 얻을 수 있습니다.

```ts
type Prices = number[]
type Price = Prices[number]
// 마우스를 올려 보면: type Price = number

// 객체 배열에서 원소(객체) 타입 꺼내기
const orders = [
  { orderNo: 'A-1001', amount: 12000 },
  { orderNo: 'A-1002', amount: 8700 },
]

type Order = (typeof orders)[number]
// 마우스를 올려 보면: type Order = { orderNo: string; amount: number; }

const next: Order = { orderNo: 'A-1003', amount: 5000 }
console.log(next.orderNo)
// 출력: A-1003
```

해설:

- `typeof orders`는 `{ orderNo: string; amount: number }[]`입니다.
- 거기에 `[number]`를 붙이면 원소 타입 `{ orderNo: string; amount: number }`가 나옵니다.
- `(typeof orders)[number]`의 괄호는 생략해 `typeof orders[number]`로 써도 같습니다. `typeof`가 먼저 적용되기 때문입니다. 다만 괄호를 쓰면 읽기 쉬워서 이 위키에서는 괄호를 씁니다.

튜플이라면 특정 위치의 타입도 꺼낼 수 있습니다.

```ts
// [상품명, 가격, 수량]
type OrderLine = [string, number, number]

type First = OrderLine[0]
// 마우스를 올려 보면: type First = string
type AnyElement = OrderLine[number]
// 마우스를 올려 보면: type AnyElement = string | number
```

### as const와 조합: 상수에서 유니온 뽑기

이 레슨에서 가장 실무에 많이 쓰는 패턴입니다. 결제 수단 목록이 **값으로도** 필요하고(화면의 선택 상자), **타입으로도** 필요한(함수 매개변수) 상황을 생각해 봅시다.

#### 문제: 값과 타입을 따로 관리

```ts
// 타입
type PayMethod = 'CARD' | 'CASH' | 'POINT'

// 값 (선택 상자에 보여 줄 목록)
const PAY_METHODS = ['CARD', 'CASH', 'POINT', 'GIFT']

// 'GIFT'를 값에만 추가하고 타입에는 깜빡했습니다.
// 둘이 어긋나도 아무도 알려 주지 않습니다.
console.log(PAY_METHODS.length)
// 출력: 4
```

같은 정보를 두 번 적으면 언젠가 어긋납니다. Part 3 소개에서 말한 "한 번만 정의하고 나머지는 파생"을 적용해 봅시다.

#### 해결 1: 배열 + as const + [number]

```ts
// 값을 한 번만 정의합니다. as const로 리터럴과 readonly 튜플을 유지합니다.
const PAY_METHODS = ['CARD', 'CASH', 'POINT', 'GIFT'] as const
// 마우스를 올려 보면: const PAY_METHODS: readonly ["CARD", "CASH", "POINT", "GIFT"]

// 타입은 값에서 파생합니다.
type PayMethod = (typeof PAY_METHODS)[number]
// 마우스를 올려 보면: type PayMethod = "CARD" | "CASH" | "POINT" | "GIFT"

function pay(method: PayMethod, amount: number): void {
  console.log(`${method} ${amount}원`)
}

// 값 목록은 화면에서 그대로 씁니다.
PAY_METHODS.forEach((m) => pay(m, 1000))
// 출력: CARD 1000원
// 출력: CASH 1000원
// 출력: POINT 1000원
// 출력: GIFT 1000원

pay('KAKAO', 1000)
// ❌ Argument of type '"KAKAO"' is not assignable to parameter of type '"CARD" | "CASH" | "POINT" | "GIFT"'. (TS2345)
```

해설:

- `as const`가 없으면 `PAY_METHODS`는 `string[]`이 되고, `(typeof PAY_METHODS)[number]`는 그냥 `string`이 됩니다. 리터럴 정보를 지키는 것이 `as const`의 역할입니다.
- 이제 결제 수단을 추가할 때는 배열에 한 줄만 추가하면 됩니다. 타입은 자동으로 따라옵니다.
- [판별 유니온](./03-discriminated-union) 레슨의 `assertNever`를 쓰는 `switch`가 있다면, 배열에 `'KAKAO'`를 추가하는 순간 처리를 빠뜨린 곳이 컴파일 오류로 드러납니다.

#### 해결 2: 객체 + as const + keyof / T[keyof T]

화면에 보여 줄 한글 이름까지 함께 관리하고 싶다면 객체를 씁니다.

```ts
// 코드 → 화면 표시 이름
const PAY_METHOD_LABEL = {
  CARD: '신용카드',
  CASH: '현금',
  POINT: '포인트',
} as const

// 키에서 유니온 뽑기
type PayMethod = keyof typeof PAY_METHOD_LABEL
// 마우스를 올려 보면: type PayMethod = "CARD" | "CASH" | "POINT"

// 값에서 유니온 뽑기
type PayLabel = (typeof PAY_METHOD_LABEL)[PayMethod]
// 마우스를 올려 보면: type PayLabel = "신용카드" | "현금" | "포인트"

function labelOf(method: PayMethod): PayLabel {
  return PAY_METHOD_LABEL[method]
}

console.log(labelOf('CASH'))
// 출력: 현금
```

해설:

- `keyof typeof PAY_METHOD_LABEL`은 **오른쪽부터** 읽으세요. ① `typeof PAY_METHOD_LABEL`로 값의 타입을 얻고, ② `keyof`로 그 타입의 키를 뽑습니다.
- 값 쪽 유니온은 `(typeof PAY_METHOD_LABEL)[keyof typeof PAY_METHOD_LABEL]`로도 쓸 수 있습니다. 길어서 위처럼 `PayMethod`를 재사용했습니다.

이 패턴은 `enum`의 대안으로 많이 쓰입니다. 실행 결과는 평범한 객체이고, 타입은 리터럴 유니온이라 다루기 쉽습니다. [열거형(enum)과 그 대안](../part2-types/09-enum)에서 본 내용과 이어집니다.

::: tip 상수에서 유니온 뽑기 요약
| 값의 모양 | 유니온 뽑는 식 |
|---|---|
| `const A = ['x', 'y'] as const` | `(typeof A)[number]` |
| `const O = { X: 'x', Y: 'y' } as const` 의 키 | `keyof typeof O` |
| `const O = { X: 'x', Y: 'y' } as const` 의 값 | `(typeof O)[keyof typeof O]` |
:::

#### 객체 배열에서 특정 속성만 유니온으로

조금 더 나아가면, 객체 배열의 특정 속성을 뽑을 수도 있습니다. 메뉴 정의 하나로 메뉴 코드 타입까지 만드는 예입니다.

```ts
const MENUS = [
  { code: 'ORDER', label: '주문 관리', path: '/orders' },
  { code: 'PRODUCT', label: '상품 관리', path: '/products' },
  { code: 'MEMBER', label: '회원 관리', path: '/members' },
] as const

type MenuCode = (typeof MENUS)[number]['code']
// 마우스를 올려 보면: type MenuCode = "ORDER" | "PRODUCT" | "MEMBER"

function openMenu(code: MenuCode): void {
  const menu = MENUS.find((m) => m.code === code)
  console.log(`${menu?.label} 화면 열기: ${menu?.path}`)
}

openMenu('PRODUCT')
// 출력: 상품 관리 화면 열기: /products
```

`(typeof MENUS)[number]`로 원소 타입을 꺼내고, 이어서 `['code']`로 그 원소의 `code` 속성 타입을 꺼냈습니다. 인덱스 접근은 이렇게 **이어 붙일 수** 있습니다.

## 자주 하는 실수

### 실수 1: 타입 위치에 값 이름을 그대로 쓰기

```ts
const defaultOption = { pageSize: 20, sortBy: 'name' }

function search(option: defaultOption): void {
  // ❌ 'defaultOption' refers to a value, but is being used as a type here. Did you mean 'typeof defaultOption'? (TS2749)
  console.log(option)
}
```

**왜 틀렸나:** `defaultOption`은 **값**(변수)입니다. 타입 자리에는 타입만 올 수 있습니다. 값의 타입이 필요하면 `typeof`를 붙입니다. 오류 메시지도 "혹시 `typeof defaultOption`을 쓰려던 것 아닌가요?"라고 알려 줍니다.

```ts
const defaultOption = { pageSize: 20, sortBy: 'name' }

// ✅ typeof로 값의 타입을 가져옵니다.
function search(option: typeof defaultOption): void {
  console.log(option.pageSize)
}

search({ pageSize: 50, sortBy: 'price' })
// 출력: 50
```

### 실수 2: as const 없이 유니온을 뽑으려 하기

```ts
const GRADES = ['BASIC', 'SILVER', 'GOLD']

type Grade = (typeof GRADES)[number]
// 마우스를 올려 보면: type Grade = string

const g: Grade = 'DIAMOND' // 오류가 나지 않습니다!
console.log(g)
// 출력: DIAMOND
```

**왜 틀렸나:** `as const`가 없으면 배열은 `string[]`으로 넓혀져서, 원소 타입도 `string`이 됩니다. 리터럴 정보가 이미 사라졌으므로 유니온을 뽑을 수 없습니다.

```ts
// ✅ as const로 리터럴을 지킵니다.
const GRADES = ['BASIC', 'SILVER', 'GOLD'] as const

type Grade = (typeof GRADES)[number]

const g: Grade = 'DIAMOND'
// ❌ Type '"DIAMOND"' is not assignable to type '"BASIC" | "SILVER" | "GOLD"'. (TS2322)
```

### 실수 3: 타입에서 점(.)으로 속성 꺼내기

```ts
interface Product {
  id: number
  price: number
}

type Price = Product.price
// ❌ Cannot access 'Product.price' because 'Product' is a type, but not a namespace. Did you mean to retrieve the type of the property 'price' in 'Product' with 'Product["price"]'? (TS2713)
```

**왜 틀렸나:** 타입에서 속성 타입을 꺼낼 때는 대괄호를 씁니다. 점은 네임스페이스 안의 타입을 가리킬 때 쓰는 문법입니다. 오류 메시지가 고칠 방법까지 알려 줍니다.

```ts
interface Product {
  id: number
  price: number
}

// ✅ 대괄호와 문자열 리터럴 타입을 씁니다.
type Price = Product['price']
const p: Price = 4500
console.log(p)
// 출력: 4500
```

### 실수 4: keyof를 값처럼 쓰려 하기

```ts
interface Product {
  id: number
  name: string
}

// 상품의 키 목록을 실행 중에 얻고 싶었습니다.
const keys = keyof Product
// ❌ Cannot find name 'keyof'. (TS2304)
// ❌ ',' expected. (TS1005)
// ❌ Variable 'Product' implicitly has an 'any' type. (TS7005)
```

**왜 틀렸나:** `keyof`는 **타입 연산자**라서 컴파일이 끝나면 사라집니다. 값 자리에 쓰면 TypeScript는 `keyof`와 `Product`를 각각 변수 이름으로 착각해 오류를 여러 개 냅니다. 실행 중에 키 목록이 필요하다면 **값**을 먼저 만들고, 타입은 거기서 파생해야 합니다.

```ts
// ✅ 값(키 목록)을 먼저 정의하고 타입을 뽑습니다.
const PRODUCT_KEYS = ['id', 'name'] as const
type ProductKey = (typeof PRODUCT_KEYS)[number]

const key: ProductKey = 'name'
console.log(PRODUCT_KEYS.join(', '), key)
// 출력: id, name name
```

`Object.keys(obj)`로 실행 중에 키를 얻을 수도 있지만, 반환 타입이 `string[]`이라는 점에 주의하세요. 구조적 타이핑 때문에 객체에 타입에 없는 속성이 더 있을 수 있어서, TypeScript는 "`keyof T`의 배열"이라고 장담하지 않습니다.

## 직접 해 보기

### 문제 1 ⭐ 기초

아래 `Member` 타입에서 다음 타입을 뽑아 보세요.

1. 키 이름들의 유니온 `MemberKey`
2. `grade` 속성의 타입 `MemberGrade`
3. `address`의 `zipCode` 타입 `ZipCode`

```ts
interface Member {
  memberNo: string
  name: string
  grade: 'BASIC' | 'VIP'
  address: { zipCode: string; detail: string }
}
```

::: details 정답 보기
```ts
interface Member {
  memberNo: string
  name: string
  grade: 'BASIC' | 'VIP'
  address: { zipCode: string; detail: string }
}

type MemberKey = keyof Member // 'memberNo' | 'name' | 'grade' | 'address'
type MemberGrade = Member['grade'] // 'BASIC' | 'VIP'
type ZipCode = Member['address']['zipCode'] // string

const key: MemberKey = 'grade'
const grade: MemberGrade = 'VIP'
const zip: ZipCode = '06236'
console.log(key, grade, zip)
// 출력: grade VIP 06236
```
:::

### 문제 2 ⭐ 기초

아래 상수에서 매장 상태 유니온 타입 `StoreStatus`를 뽑고, 그 타입만 받는 함수 `setStatus`를 만드세요.

```ts
const STORE_STATUSES = ['OPEN', 'CLOSED', 'BREAK'] as const
```

::: details 정답 보기
```ts
const STORE_STATUSES = ['OPEN', 'CLOSED', 'BREAK'] as const

type StoreStatus = (typeof STORE_STATUSES)[number]

function setStatus(status: StoreStatus): void {
  console.log(`매장 상태: ${status}`)
}

setStatus('BREAK') // ✅

setStatus('HOLIDAY')
// ❌ Argument of type '"HOLIDAY"' is not assignable to parameter of type '"OPEN" | "CLOSED" | "BREAK"'. (TS2345)
```
:::

### 문제 3 ⭐⭐ 응용

주문 상태 코드와 화면 표시 이름을 담은 상수 객체 `ORDER_STATUS_LABEL`을 `as const`로 만들고, 다음 두 타입을 뽑으세요.

- `OrderStatus`: 키 유니온 (`'PENDING' | 'PAID' | 'SHIPPED'`)
- `OrderStatusLabel`: 값 유니온 (`'결제 대기' | '결제 완료' | '배송 중'`)

그리고 상태를 받아 표시 이름을 돌려주는 함수를 만드세요.

::: details 정답 보기
```ts
const ORDER_STATUS_LABEL = {
  PENDING: '결제 대기',
  PAID: '결제 완료',
  SHIPPED: '배송 중',
} as const

type OrderStatus = keyof typeof ORDER_STATUS_LABEL
type OrderStatusLabel = (typeof ORDER_STATUS_LABEL)[OrderStatus]

function statusLabel(status: OrderStatus): OrderStatusLabel {
  return ORDER_STATUS_LABEL[status]
}

console.log(statusLabel('SHIPPED'))
// 출력: 배송 중
```
:::

### 문제 4 ⭐⭐ 응용

다음 API 응답 예시 값만 있고 타입은 없습니다. 이 값에서 `typeof`와 인덱스 접근 타입으로 **주문 한 건의 타입** `OrderItem`을 뽑아, 새 주문 한 건을 만들어 보세요.

```ts
const sampleResponse = {
  code: '0000',
  data: {
    orders: [{ orderNo: 'A-1001', amount: 12000, paid: true }],
  },
}
```

::: details 정답 보기
```ts
const sampleResponse = {
  code: '0000',
  data: {
    orders: [{ orderNo: 'A-1001', amount: 12000, paid: true }],
  },
}

type OrderItem = (typeof sampleResponse)['data']['orders'][number]
// 마우스를 올려 보면: type OrderItem = { orderNo: string; amount: number; paid: boolean; }

const newOrder: OrderItem = { orderNo: 'A-1002', amount: 8700, paid: false }
console.log(newOrder.orderNo)
// 출력: A-1002
```
실무에서는 예시 값보다 타입을 먼저 정의하는 것이 정석입니다. 다만 테스트용 고정 데이터나 설정 파일처럼 값이 기준인 경우에 이 방법이 유용합니다.
:::

### 문제 5 ⭐⭐⭐ 도전

권한 정의 상수에서 "권한 코드" 유니온을 뽑고, 사용자가 가진 권한 목록에 특정 권한이 있는지 확인하는 함수 `hasPermission`을 만드세요. 없는 권한 코드를 넘기면 컴파일 오류가 나야 합니다.

```ts
const PERMISSIONS = [
  { code: 'ORDER_READ', label: '주문 조회' },
  { code: 'ORDER_CANCEL', label: '주문 취소' },
  { code: 'PRODUCT_EDIT', label: '상품 수정' },
] as const
```

::: details 정답 보기
```ts
const PERMISSIONS = [
  { code: 'ORDER_READ', label: '주문 조회' },
  { code: 'ORDER_CANCEL', label: '주문 취소' },
  { code: 'PRODUCT_EDIT', label: '상품 수정' },
] as const

type PermissionCode = (typeof PERMISSIONS)[number]['code']

function hasPermission(owned: PermissionCode[], required: PermissionCode): boolean {
  return owned.includes(required)
}

const myPermissions: PermissionCode[] = ['ORDER_READ', 'PRODUCT_EDIT']
console.log(hasPermission(myPermissions, 'ORDER_CANCEL'))
// 출력: false

hasPermission(myPermissions, 'ORDER_DELETE')
// ❌ Argument of type '"ORDER_DELETE"' is not assignable to parameter of type '"ORDER_READ" | "ORDER_CANCEL" | "PRODUCT_EDIT"'. (TS2345)
```
:::

## 확인 퀴즈

1. `keyof { id: number; name: string }`은 어떤 타입인가요?
2. 값 위치의 `typeof`와 타입 위치의 `typeof`는 어떻게 다른가요?
3. `Product['price']`에서 `'price'`는 값인가요, 타입인가요?
4. `(typeof arr)[number]`는 무엇을 뜻하나요?
5. 상수 배열에서 유니온 타입을 뽑을 때 `as const`가 꼭 필요한 이유는 무엇인가요?

::: details 정답 보기
1. `'id' | 'name'`입니다.
2. 값 위치의 `typeof`는 JavaScript 연산자로 실행 중에 `'number'` 같은 문자열을 돌려줍니다. 타입 위치의 `typeof`는 TypeScript 연산자로 컴파일 중에 변수의 타입을 돌려줍니다.
3. 타입입니다. 문자열 리터럴 타입 `'price'`입니다.
4. 배열 `arr`의 원소 타입입니다. 숫자 인덱스로 꺼낸 값의 타입이라는 뜻입니다.
5. `as const`가 없으면 배열이 `string[]`으로 넓혀져 리터럴 정보가 사라지고, 원소 타입이 그냥 `string`이 되기 때문입니다.
:::

## 정리

- `keyof T`는 `T`의 키 이름들의 유니온입니다. 원본 타입이 바뀌면 자동으로 따라 바뀝니다.
- 타입 위치의 `typeof 변수`는 값에서 타입을 만듭니다. 값 위치의 JS `typeof`와는 별개입니다.
- 인덱스 접근 타입 `T['key']`로 속성 하나의 타입을, `T[keyof T]`로 모든 속성 값 타입의 유니온을 꺼냅니다.
- `(typeof arr)[number]`는 배열 원소 타입입니다. 인덱스 접근은 `[number]['code']`처럼 이어 붙일 수 있습니다.
- `as const` + `typeof` + `[number]` 또는 `keyof`로 **상수 하나에서 값과 타입을 함께** 관리합니다.
- 이 연산자들은 모두 컴파일 중에만 존재합니다. 실행 중에 필요한 정보는 값으로 먼저 정의합니다.

## 다음 단계

[내장 유틸리티 타입 총정리](./07-utility-types): `keyof`와 인덱스 접근 타입을 재료로 만들어진 `Partial`, `Pick`, `Omit`, `Record`, `ReturnType` 등을 배워, 기존 타입에서 새 타입을 한 줄로 만들어 봅니다.
