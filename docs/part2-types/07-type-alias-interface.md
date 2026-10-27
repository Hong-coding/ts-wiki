---
title: 타입 별칭(type)과 인터페이스(interface)
---

# 타입 별칭(type)과 인터페이스(interface)

<LessonMeta level="초급" :minutes="50" prev="유니온 타입과 리터럴 타입, 공통 멤버 규칙" />

## 이번에 배울 것

- **타입 별칭**(`type`)으로 어떤 타입에든 이름을 붙일 수 있다.
- **인터페이스**(`interface`)로 객체의 모양을 정의하고 `extends`로 확장할 수 있다.
- `type`과 `interface`의 차이(확장 방식, 선언 병합, 유니온 가능 여부, 성능)를 표로 설명할 수 있다.
- 실무에서 둘 중 무엇을 고를지 기준을 세울 수 있다.

## 먼저 알아 둘 것

- [객체 타입](./04-object-types) — 지금까지 `type Product = { ... }`을 써 왔습니다.
- [함수 타입](./05-function-types)
- [유니온 타입과 리터럴 타입](./06-union-literal)

## 비유로 이해하기

매장 직원 명찰을 떠올려 보세요.

- **타입 별칭**은 **별명표**입니다. "아메리카노·라테·모카 중 하나"처럼 긴 설명에 `커피메뉴`라는 짧은 별명을 붙여 줍니다. 별명은 무엇에든 붙일 수 있습니다. 메뉴 목록에도, 숫자 범위에도, 객체 모양에도요. 단, **한 번 정한 별명은 다시 정할 수 없습니다.**
- **인터페이스**는 **직무 기술서**입니다. "매장 직원은 이름·사번·근무 매장을 가진다"처럼 **객체의 모양**만 적습니다. 직무 기술서는 **나중에 항목을 덧붙일 수** 있고("야간 직원은 여기에 야간 수당 항목이 추가된다"), 다른 기술서를 **물려받아 확장**하기 좋게 만들어져 있습니다.

둘이 하는 일은 많이 겹치지만, 잘하는 일이 조금씩 다릅니다.

## 개념 설명

### 1단계: 타입 별칭 — 어떤 타입에든 이름 붙이기

**타입 별칭**(type alias)은 `type 이름 = 타입` 형태로 **기존 타입에 새 이름을 붙이는** 문법입니다. 새 타입을 "만드는" 것이 아니라 "이름표를 붙이는" 것입니다.

```ts
// 객체 모양
type Product = {
  code: string
  name: string
  price: number
}

// 리터럴 유니온
type OrderStatus = 'READY' | 'PAID' | 'CANCELED'

// 원시 타입에 의미 있는 이름
type ProductCode = string

// 튜플
type MenuRow = [name: string, price: number]

// 함수 타입
type PriceFormatter = (price: number) => string

const p: Product = { code: 'P001', name: '아메리카노', price: 4500 }
const s: OrderStatus = 'PAID'
const fmt: PriceFormatter = (price) => `${price.toLocaleString('ko-KR')}원`

console.log(p.name, s, fmt(p.price))
// 출력: 아메리카노 PAID 4,500원
```

`type`은 **오른쪽에 올 수 있는 타입이면 무엇이든** 이름을 붙일 수 있습니다. 이것이 `type`의 가장 큰 장점입니다.

::: info 별칭은 "같은 타입의 다른 이름"
`type ProductCode = string`이라고 해도 `ProductCode`는 그냥 `string`입니다. 아무 문자열이나 넣을 수 있고, `MemberNo`라는 다른 `string` 별칭과도 자유롭게 섞입니다. 별칭은 **읽는 사람을 위한 이름**일 뿐 검사를 강화하지 않습니다. 둘을 구분되게 만드는 기법(브랜드 타입)은 [좋은 타입 설계 원칙](../part7-practice/07-type-design)에서 다룹니다.
:::

### 2단계: 인터페이스 — 객체 모양 정의하기

**인터페이스**(interface)는 **객체의 모양**을 정의하는 전용 문법입니다. 등호(`=`)가 없다는 점이 `type`과 다릅니다.

```ts
interface Member {
  readonly memberNo: string
  name: string
  point: number
  phone?: string
  addPoint(amount: number): void
}

const member: Member = {
  memberNo: 'M001',
  name: '김민지',
  point: 1200,
  addPoint(amount) {
    this.point += amount
  },
}

member.addPoint(300)
console.log(member.point)
// 출력: 1500
```

[04 레슨](./04-object-types)에서 배운 선택 속성(`?`), `readonly`, [05 레슨](./05-function-types)의 메서드 문법, 인덱스 시그니처를 모두 그대로 쓸 수 있습니다.

같은 모양을 `type`으로 써도 결과는 같습니다.

```ts
interface ProductI {
  code: string
  price: number
}

type ProductT = {
  code: string
  price: number
}

const a: ProductI = { code: 'P001', price: 4500 }
const b: ProductT = a // ✅ 모양이 같으므로 서로 바꿔 넣을 수 있음
console.log(b)
// 출력: { code: 'P001', price: 4500 }
```

TypeScript는 **이름이 아니라 모양**을 비교하기 때문입니다([04 레슨](./04-object-types)의 "필요한 속성을 다 가지면 인정" 규칙, 자세히는 [구조적 타이핑](../part3-intermediate/02-structural-typing)).

### 3단계: interface는 extends로 확장한다

기존 인터페이스에 속성을 더한 새 인터페이스를 만들 때 **`extends`**(확장하다)를 씁니다.

```ts
interface Product {
  code: string
  name: string
  price: number
}

// Product의 속성 + 추가 속성
interface DrinkProduct extends Product {
  size: 'S' | 'M' | 'L'
  isHot: boolean
}

const latte: DrinkProduct = {
  code: 'P002',
  name: '카페라테',
  price: 5000,
  size: 'M',
  isHot: true,
}

console.log(`${latte.name}(${latte.size}) ${latte.price}원`)
// 출력: 카페라테(M) 5000원
```

여러 인터페이스를 한꺼번에 확장할 수도 있습니다.

```ts
interface HasCode {
  code: string
}
interface HasTimestamps {
  createdAt: string
  updatedAt: string
}

interface Store extends HasCode, HasTimestamps {
  name: string
}

const store: Store = {
  code: 'S01',
  name: '강남점',
  createdAt: '2026-01-02',
  updatedAt: '2026-10-26',
}
console.log(store.code, store.name)
// 출력: S01 강남점
```

`extends`는 **충돌을 바로 알려 준다**는 장점이 있습니다. 물려받은 속성의 타입을 호환되지 않게 바꾸면 오류가 납니다.

```ts
interface Product {
  code: string
  price: number
}

interface BadProduct extends Product {
  // ❌ Interface 'BadProduct' incorrectly extends interface 'Product'. (TS2430)
  price: string
}
```

집합으로 보면 `DrinkProduct extends Product`는 "`Product` 집합 **안의** 더 작은 부분집합"을 만드는 일입니다. 조건(속성)이 늘어날수록 그 조건을 만족하는 값은 줄어드니까요. `price`를 `string`으로 바꾸면 더 이상 `Product`의 부분집합이 아니므로 막는 것입니다.

### 4단계: type은 &(인터섹션)으로 합친다

`type`에는 `extends`가 없습니다. 대신 **`&`**(인터섹션, intersection)로 여러 타입을 합칩니다. `A & B`는 "A의 조건과 B의 조건을 **모두** 만족하는 값"입니다.

```ts
type Product = {
  code: string
  name: string
  price: number
}

type DrinkProduct = Product & {
  size: 'S' | 'M' | 'L'
  isHot: boolean
}

const americano: DrinkProduct = {
  code: 'P001',
  name: '아메리카노',
  price: 4500,
  size: 'L',
  isHot: false,
}
console.log(americano.name, americano.isHot)
// 출력: 아메리카노 false
```

`&`는 이름과 달리 결과 객체의 속성을 **합치는** 효과가 있어 처음에는 헷갈립니다. 원리와 함정은 [Part 3 인터섹션](../part3-intermediate/01-intersection)에서 자세히 다룹니다. 지금은 "`type`에서 확장할 때는 `&`"라고만 기억하세요.

참고로 `interface`가 `type`을 확장하거나, `type`이 `interface`를 `&`로 합치는 것도 됩니다. 둘을 섞어 써도 괜찮습니다.

```ts
type HasCode = { code: string }

interface Store extends HasCode {
  name: string
}

const s: Store = { code: 'S01', name: '강남점' }
console.log(s)
// 출력: { code: 'S01', name: '강남점' }
```

### 5단계: 선언 병합 — interface만의 특징

같은 이름의 `interface`를 **두 번 선언하면 하나로 합쳐집니다.** 이것을 **선언 병합**(declaration merging)이라고 합니다.

```ts
interface Order {
  orderNo: string
  amount: number
}

// 같은 이름으로 다시 선언 → 속성이 합쳐짐
interface Order {
  memo?: string
}

const order: Order = { orderNo: 'A-1001', amount: 9000, memo: '얼음 적게' }
console.log(order.memo)
// 출력: 얼음 적게
```

`type`은 같은 이름을 두 번 쓸 수 없습니다.

```ts
type Order = {
  orderNo: string
}

type Order = {
  // ❌ Duplicate identifier 'Order'. (TS2300)
  memo?: string
}
// ❌ Duplicate identifier 'Order'. (TS2300)
```

선언 병합은 왜 있을까요? **남이 만든 타입에 내 속성을 덧붙여야 할 때** 쓰기 위해서입니다. 예를 들어 브라우저의 `window` 객체에 우리 서비스가 넣어 둔 전역 값이 있다면, 기존 `Window` 인터페이스에 속성을 덧붙여 알려 줄 수 있습니다. 라이브러리 타입을 확장하는 이런 기법은 [Part 5 선언 파일 · 선언 병합 · 모듈 보강](../part5-advanced/08-declaration-files)에서 배웁니다.

::: warning 선언 병합은 양날의 검
같은 파일이나 같은 전역 범위에서 **우연히 같은 이름**의 인터페이스를 만들면, 오류 없이 조용히 합쳐집니다. 예를 들어 전역 범위에 `interface Comment { ... }`를 만들면 브라우저 DOM의 `Comment` 타입과 합쳐져 엉뚱한 속성이 생길 수 있습니다. 파일을 모듈(`import`/`export`가 있는 파일)로 만들면 이런 충돌은 대부분 사라집니다([모듈](../part3-intermediate/09-modules)).
:::

### 6단계: 유니온은 type만 할 수 있다

`interface`는 **객체 모양만** 표현할 수 있습니다. 유니온, 리터럴, 튜플, 원시 타입의 별칭은 `type`으로만 만들 수 있습니다.

```ts
// type으로만 가능
type OrderStatus = 'READY' | 'PAID' | 'CANCELED'
type Payment = { method: 'CARD'; cardNo: string } | { method: 'CASH'; received: number }
type MenuRow = [name: string, price: number]

const pay: Payment = { method: 'CASH', received: 10000 }
console.log(pay.method)
// 출력: CASH
```

`interface`로 `OrderStatus`를 만들 방법은 없습니다. 이 점 때문에 **유니온이 많은 코드에서는 자연스럽게 `type`을 많이 쓰게** 됩니다.

### 7단계: 차이 한눈에 보기

| 비교 항목 | `type` (타입 별칭) | `interface` |
|---|---|---|
| 표현할 수 있는 것 | **모든 타입** (객체, 유니온, 리터럴, 튜플, 함수, 원시 별칭) | **객체 모양만** (함수·배열 모양 객체 포함) |
| 확장 방법 | `&` (인터섹션) | `extends` |
| 확장 시 충돌 검사 | 충돌하면 조용히 `never` 속성이 생길 수 있음 | **선언 지점에서 바로 오류** (TS2430) |
| 같은 이름 다시 선언 | 오류 (TS2300) | **선언 병합**(합쳐짐) |
| 유니온 만들기 | 가능 | 불가능 |
| 마우스 올렸을 때 표시 | 조합한 타입은 이름 대신 펼쳐진 모양으로 보일 때가 있음 | 이름 그대로 보임 |
| 타입 검사 성능 | 큰 `&` 조합은 매번 다시 계산될 수 있음 | `extends` 관계를 캐시해 대규모에서 유리 |

**성능 메모**: TypeScript 팀의 성능 가이드(TypeScript 위키 "Performance")는 객체 타입을 합칠 때 `&`보다 `interface ... extends`를 권합니다. 인터페이스의 확장 관계는 한 번 계산해 두고 재사용하지만, 인터섹션은 쓸 때마다 다시 펼쳐 계산할 때가 있기 때문입니다. 다만 이 차이는 **타입이 수천 개인 대규모 코드베이스**에서나 체감되므로, 처음 배울 때는 신경 쓰지 않아도 됩니다. 자세한 내용은 [대규모 코드베이스: 타입 체크 성능](../part9-master/03-large-codebase)에서 다룹니다.

### 8단계: 실무 선택 기준

"무엇을 써야 하나요?"는 TypeScript 커뮤니티에서 오래된 논쟁입니다. 정답은 하나가 아니지만, 다음 기준이면 실무에서 문제가 없습니다.

1. **유니온·리터럴·튜플·함수 타입·원시 별칭** → `type` (이것밖에 없음)
2. **객체 모양** → 팀 규칙을 따릅니다. 규칙이 없다면:
   - **상속 구조가 있거나, 라이브러리로 공개해 다른 사람이 확장할 수 있어야 하는 객체** → `interface`
   - **그 외 일반 객체** → 어느 쪽이든 괜찮습니다. 한 파일 안에서는 한쪽으로 통일합니다.
3. **클래스가 구현할 계약**(`implements`) → `interface`가 관례입니다([Part 3 클래스](../part3-intermediate/08-classes)).
4. **선언 병합이 필요할 때**(라이브러리 타입 보강) → `interface`만 가능합니다.

::: tip 이 위키의 규칙
이 위키는 **객체 모양은 주로 `type`**, 확장 구조가 분명하거나 선언 병합이 필요한 곳은 **`interface`** 를 씁니다. 유니온과 함께 쓰는 일이 많아 `type` 하나로 통일하는 편이 초보자에게 덜 헷갈리기 때문입니다. React 컴포넌트의 props를 `interface`로 쓰는 팀도 많습니다. **어느 쪽이든 일관성이 가장 중요**합니다.
:::

### 9단계: 타입 이름 짓기 관례

- 타입 이름은 **대문자로 시작하는 PascalCase**로 씁니다: `Product`, `OrderStatus`, `CartItem`.
- 예전 C# 관례처럼 인터페이스 앞에 `I`를 붙이는 `IProduct` 방식은 TypeScript에서는 **권장하지 않습니다.** 공식 문서와 대부분의 스타일 가이드가 쓰지 않습니다.
- 타입과 값은 **이름 공간이 달라서** 같은 이름을 쓸 수 있습니다. `type Product`와 `const Product = ...`가 함께 있어도 충돌하지 않습니다. 이 성질은 [09 레슨](./09-enum)의 `as const` 객체 패턴에서 활용합니다.

## 자주 하는 실수

### 실수 1: interface로 유니온을 만들려고 하기

```ts
interface OrderStatus = 'READY' | 'PAID'
// ❌ '{' expected. (TS1005)
```

왜 틀렸나: `interface`는 `=`를 쓰지 않으며, 객체 모양만 표현할 수 있습니다. 문법 자체가 틀린 코드라 에디터에는 이 오류에 이어 엉뚱한 오류(TS2362 등)가 몇 개 더 보일 수 있습니다. 이럴 때는 **맨 처음 오류**부터 봅니다.

고친 코드:

```ts
type OrderStatus = 'READY' | 'PAID'

const s: OrderStatus = 'READY'
console.log(s)
// 출력: READY
```

### 실수 2: type을 두 번 선언해 속성을 추가하려고 하기

```ts
type CartItem = { productCode: string }
type CartItem = { quantity: number }
// ❌ Duplicate identifier 'CartItem'. (TS2300)
// ❌ Duplicate identifier 'CartItem'. (TS2300)
```

왜 틀렸나: 선언 병합은 `interface`에만 있습니다. 그리고 같은 파일 안에서 타입을 둘로 나눠 쓸 이유도 별로 없습니다.

고친 코드: 한 번에 쓰거나, 의도적으로 나눌 때는 `&`로 합친 새 이름을 만듭니다.

```ts
type CartItemBase = { productCode: string }
type CartItem = CartItemBase & { quantity: number }

const item: CartItem = { productCode: 'P001', quantity: 2 }
console.log(item)
// 출력: { productCode: 'P001', quantity: 2 }
```

### 실수 3: &로 합치면서 같은 속성의 타입을 다르게 주기

```ts
type Product = { code: string; price: number }
type WeirdProduct = Product & { price: string }

const w: WeirdProduct = { code: 'P001', price: 4500 }
// ❌ Type 'number' is not assignable to type 'never'. (TS2322)
```

왜 틀렸나: `price`는 `number`이면서 동시에 `string`이어야 합니다. 그런 값은 없으므로 `price`의 타입이 공집합 `never`가 되었습니다([02 레슨](./02-special-types)의 "불가능한 조합은 `never`"). **오류가 타입 선언이 아니라 값을 만드는 곳에서** 나서 원인을 찾기 어렵습니다.

고친 코드: 확장 관계라면 `interface extends`를 쓰면 선언 지점에서 바로 알려 줍니다. 정말 타입을 바꾸고 싶다면 속성을 빼고 다시 정의하는 방법(`Omit`)을 [Part 3 유틸리티 타입](../part3-intermediate/07-utility-types)에서 배웁니다.

```ts
interface Product {
  code: string
  price: number
}

interface DiscountProduct extends Product {
  discountPrice: number
}

const d: DiscountProduct = { code: 'P001', price: 5000, discountPrice: 4500 }
console.log(d.discountPrice)
// 출력: 4500
```

### 실수 4: 별칭이 서로 다른 타입을 구분해 준다고 믿기

```ts
type ProductCode = string
type MemberNo = string

function findProduct(code: ProductCode) {
  console.log('상품 조회:', code)
}

const memberNo: MemberNo = 'M001'
findProduct(memberNo) // 오류 없음! 회원번호로 상품을 조회함
// 출력: 상품 조회: M001
```

왜 틀렸나: 두 별칭 모두 그냥 `string`의 다른 이름이라 서로 섞여도 막지 않습니다.

고친 코드: 별칭은 읽기 좋게 하는 용도로 쓰고, 정말 구분해야 하면 매개변수 이름을 분명히 하거나 객체로 감쌉니다. 타입 수준에서 구분하는 **브랜드 타입**은 [좋은 타입 설계 원칙](../part7-practice/07-type-design)에서 배웁니다.

```ts
type ProductCode = string

function findProduct(params: { productCode: ProductCode }) {
  console.log('상품 조회:', params.productCode)
}

findProduct({ productCode: 'P001' })
// 출력: 상품 조회: P001
```

## 직접 해 보기

### 문제 1 ⭐ type으로 이름 붙이기

다음 타입들에 이름을 붙이세요.

1. 결제 수단 `'CARD' | 'CASH' | 'PAY'` → `PayMethod`
2. `[매장코드, 매장명]` 이름 붙은 튜플 → `StoreRow`
3. 금액을 받아 할인 금액을 돌려주는 함수 → `DiscountFn`

::: details 정답 보기
```ts
type PayMethod = 'CARD' | 'CASH' | 'PAY'
type StoreRow = [storeCode: string, storeName: string]
type DiscountFn = (amount: number) => number

const m: PayMethod = 'PAY'
const row: StoreRow = ['S01', '강남점']
const tenPercent: DiscountFn = (amount) => amount * 0.1

console.log(m, row[1], tenPercent(9000))
// 출력: PAY 강남점 900
```

세 가지 모두 `interface`로는 만들 수 없습니다.
:::

### 문제 2 ⭐ interface로 바꾸고 확장하기

`type Employee = { employeeNo: string; name: string }`를 `interface`로 바꾸고, 이를 확장해 `storeCode`(문자열)와 `isManager`(불리언)를 가진 `StoreEmployee`를 만드세요.

::: details 정답 보기
```ts
interface Employee {
  employeeNo: string
  name: string
}

interface StoreEmployee extends Employee {
  storeCode: string
  isManager: boolean
}

const e: StoreEmployee = { employeeNo: 'E001', name: '이수진', storeCode: 'S01', isManager: true }
console.log(e.name, e.isManager)
// 출력: 이수진 true
```
:::

### 문제 3 ⭐⭐ 같은 확장을 type으로

문제 2의 `StoreEmployee`를 `type`과 `&`로 다시 만드세요.

::: details 정답 보기
```ts
type Employee = {
  employeeNo: string
  name: string
}

type StoreEmployee = Employee & {
  storeCode: string
  isManager: boolean
}

const e: StoreEmployee = { employeeNo: 'E002', name: '최유나', storeCode: 'S02', isManager: false }
console.log(e.storeCode)
// 출력: S02
```
:::

### 문제 4 ⭐⭐ 선언 병합 예측하기

다음 코드에서 `config` 변수를 만들 때 반드시 넣어야 하는 속성을 모두 적으세요.

```ts
// 문제: 필수 속성을 모두 적으세요
interface PosConfig {
  storeCode: string
}

interface PosConfig {
  printerName: string
  autoPrint?: boolean
}

const config: PosConfig = {
  // ?
}
```

::: details 정답 보기
`storeCode`와 `printerName`입니다. 두 선언이 합쳐지고, `autoPrint`는 선택 속성입니다.

```ts
interface PosConfig {
  storeCode: string
}

interface PosConfig {
  printerName: string
  autoPrint?: boolean
}

const config: PosConfig = { storeCode: 'S01', printerName: '영수증프린터1' }
console.log(config)
// 출력: { storeCode: 'S01', printerName: '영수증프린터1' }
```
:::

### 문제 5 ⭐⭐⭐ 무엇을 쓸지 고르기

다음 각 상황에서 `type`과 `interface` 중 무엇을 쓰는 것이 알맞은지(또는 둘 다 괜찮은지) 고르고 이유를 적으세요.

1. 주문 상태 `'READY' | 'PAID' | 'CANCELED'`
2. 외부 라이브러리의 `Window` 타입에 `posVersion` 속성을 덧붙이기
3. 화면 컴포넌트가 받는 설정 객체 `{ title: string; pageSize: number }`
4. 카드 결제 또는 현금 결제 객체
5. 여러 결제 수단 클래스가 공통으로 지켜야 할 `pay(amount)` 메서드 계약

::: details 정답 보기
1. `type` — 리터럴 유니온은 `type`만 가능합니다.
2. `interface` — 선언 병합이 필요합니다.
3. 둘 다 괜찮음 — 일반 객체 모양입니다. 팀 규칙에 따릅니다.
4. `type` — 객체 두 개의 유니온입니다(각 객체 모양은 `interface`로 정의하고 유니온만 `type`으로 묶어도 됩니다).
5. `interface` — 클래스가 `implements`할 계약은 `interface`가 관례입니다.
:::

## 확인 퀴즈

1. `type`으로는 만들 수 있지만 `interface`로는 만들 수 없는 것을 두 가지 이상 말해 보세요.
2. 같은 이름의 `interface`를 두 번 선언하면 어떻게 되나요? `type`은요?
3. `interface A extends B`에서 B의 속성 타입을 호환되지 않게 바꾸면 어떻게 되나요?
4. `type ProductCode = string`으로 만든 별칭은 `string`과 구분되나요?
5. 대규모 프로젝트에서 객체 타입을 합칠 때 성능상 권장되는 방식은 무엇인가요?

::: details 정답 보기
1. 유니온(`'A' | 'B'`), 리터럴 타입 별칭, 튜플, 함수 타입, 원시 타입 별칭 등입니다.
2. `interface`는 선언 병합으로 하나로 합쳐지고, `type`은 `Duplicate identifier` 오류(TS2300)가 납니다.
3. 선언 지점에서 `Interface 'A' incorrectly extends interface 'B'` 오류(TS2430)가 납니다.
4. 구분되지 않습니다. 같은 타입의 다른 이름일 뿐입니다.
5. `&`보다 `interface ... extends`가 권장됩니다. 확장 관계를 캐시해 재사용하기 때문입니다.
:::

## 정리

- `type 이름 = 타입`은 **어떤 타입에든** 이름을 붙입니다. 새 타입을 만드는 것이 아니라 이름표를 붙이는 것입니다.
- `interface`는 **객체 모양 전용**이며 `extends`로 확장합니다. 충돌은 선언 지점에서 바로 알려 줍니다.
- `type`은 `&`로 합치고, 유니온·리터럴·튜플·함수 타입을 표현할 수 있습니다.
- 같은 이름의 `interface`는 **선언 병합**으로 합쳐집니다. 라이브러리 타입 보강에 쓰입니다.
- 유니온이 필요하면 `type`, 확장·병합·클래스 계약이면 `interface`, 일반 객체는 **팀 규칙대로 일관되게** 씁니다.

## 다음 단계

[타입 좁히기(Narrowing)](./08-narrowing) — 유니온 타입의 값을 `typeof`, `in`, `instanceof`, `===` 같은 조건문으로 확인해 더 작은 타입으로 좁히는 방법을 체계적으로 배웁니다.
