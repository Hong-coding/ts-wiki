---
title: 내장 유틸리티 타입 총정리
---

# 내장 유틸리티 타입 총정리

<LessonMeta level="중급" :minutes="60" prev="keyof · typeof · 인덱스 접근 타입으로 기존 타입·값에서 새 타입 뽑기" />

## 이번에 배울 것

- 객체 타입을 변형하는 `Partial`, `Required`, `Readonly`, `Pick`, `Omit`, `Record`를 상황에 맞게 쓸 수 있다.
- 유니온을 거르는 `Exclude`, `Extract`, `NonNullable`을 쓸 수 있다.
- 함수·클래스·Promise에서 타입을 꺼내는 `ReturnType`, `Parameters`, `Awaited`, `InstanceType`을 쓸 수 있다.
- 추론을 막는 `NoInfer`(TypeScript 5.4+)가 필요한 상황을 설명할 수 있다.
- 수정 API는 `Partial`, 목록 화면은 `Pick`처럼 하나의 원본 타입에서 화면·API별 타입을 파생할 수 있다.

## 먼저 알아 둘 것

- [제네릭 기초](./04-generics-basics)와 [제네릭 제약](./05-generic-constraints)
- [keyof · typeof · 인덱스 접근 타입](./06-keyof-typeof-indexed)
- [유니온 타입과 리터럴 타입](../part2-types/06-union-literal)

## 비유로 이해하기

복사기에 **원본 서류** 한 장이 있다고 해 봅시다. 복사기에는 여러 버튼이 있습니다.

- "모든 칸을 선택 입력으로" 버튼 → 수정 요청서 양식이 됩니다. (`Partial`)
- "일부 칸만 남기기" 버튼 → 목록 화면용 요약표가 됩니다. (`Pick`)
- "일부 칸 지우기" 버튼 → 비밀번호 칸을 지운 공개용 사본이 됩니다. (`Omit`)
- "수정 금지 도장" 버튼 → 읽기 전용 사본이 됩니다. (`Readonly`)

원본을 고치면 다시 복사하기만 하면 됩니다. 사본마다 손으로 다시 쓸 필요가 없습니다.

**유틸리티 타입**(utility type)은 TypeScript에 처음부터 들어 있는 이런 "복사기 버튼"입니다. 모두 제네릭 타입이라서 `Partial<Product>`처럼 원본 타입을 타입 인자로 넘기면 변형된 새 타입을 돌려줍니다. 설치나 `import` 없이 바로 쓸 수 있습니다.

## 개념 설명

이 레슨에서 쓸 원본 타입입니다. 아래 예제들에서 계속 씁니다.

```ts
interface Product {
  id: number
  name: string
  price: number
  stock: number
  description?: string
}
```

각 유틸리티 타입은 **쓰는 상황 → 예제 → 직접 구현 맛보기** 순서로 설명합니다. "직접 구현"은 이해를 돕기 위한 맛보기이며, 그 문법(매핑된 타입, 조건부 타입)은 Part 5에서 제대로 배웁니다. 지금은 "아, 이런 재료로 만들어졌구나" 정도로 보면 됩니다.

### Partial: 모든 속성을 선택으로

**쓰는 상황:** 수정 API처럼 "바꾸고 싶은 속성만 보내면 되는" 경우입니다.

```ts
interface Product {
  id: number
  name: string
  price: number
  stock: number
  description?: string
}

// 상품 수정: 바꿀 속성만 받습니다.
function updateProduct(id: number, changes: Partial<Product>): void {
  console.log(`상품 ${id} 수정:`, changes)
}

updateProduct(1, { price: 4800 })
updateProduct(2, { name: '바닐라라테', stock: 20 })
// 출력: 상품 1 수정: { price: 4800 }
// 출력: 상품 2 수정: { name: '바닐라라테', stock: 20 }

updateProduct(3, { price: '무료' })
// ❌ Type 'string' is not assignable to type 'number'. (TS2322)
```

`Partial<Product>`는 `{ id?: number; name?: string; price?: number; stock?: number; description?: string }`과 같습니다. 속성은 생략할 수 있지만, 넣는다면 타입은 맞아야 합니다.

**직접 구현 맛보기:**

```ts
// T의 모든 키 K를 돌면서 ?를 붙입니다.
type MyPartial<T> = {
  [K in keyof T]?: T[K]
}

type Draft = MyPartial<{ name: string; price: number }>
// 마우스를 올려 보면: type Draft = { name?: string | undefined; price?: number | undefined; }
```

`[K in keyof T]`는 "`T`의 키 하나하나에 대해"라는 뜻의 **매핑된 타입**(mapped type) 문법입니다. 앞 레슨의 `keyof`와 `T[K]`가 그대로 재료로 쓰였습니다. 자세한 내용은 [매핑된 타입과 키 재매핑](../part5-advanced/03-mapped-types)에서 배웁니다.

### Required: 모든 속성을 필수로

**쓰는 상황:** 선택 속성이 있는 설정 객체에 기본값을 모두 채운 뒤의 타입처럼, "이제는 모든 값이 확실히 있다"를 표현할 때입니다.

```ts
interface ReceiptOption {
  copies?: number
  printLogo?: boolean
}

const DEFAULT_OPTION: Required<ReceiptOption> = { copies: 1, printLogo: true }

// 사용자가 준 옵션에 기본값을 채워, 모든 속성이 있는 옵션을 만듭니다.
function resolveOption(option: ReceiptOption): Required<ReceiptOption> {
  return { ...DEFAULT_OPTION, ...option }
}

const resolved = resolveOption({ copies: 2 })
console.log(resolved.copies + 1, resolved.printLogo) // copies는 이제 number (undefined 아님)
// 출력: 3 true
```

**직접 구현 맛보기:** `-?`는 "물음표를 떼라"는 뜻입니다.

```ts
type MyRequired<T> = {
  [K in keyof T]-?: T[K]
}
```

### Readonly: 모든 속성을 읽기 전용으로

**쓰는 상황:** 함수에 넘긴 객체를 함수가 바꾸지 못하게 하거나, 상태 관리에서 직접 수정을 막을 때입니다.

```ts
interface CartItem {
  productId: number
  qty: number
}

function printCart(item: Readonly<CartItem>): void {
  console.log(`${item.productId}번 상품 ${item.qty}개`)
  item.qty = 0
  // ❌ Cannot assign to 'qty' because it is a read-only property. (TS2540)
}
```

`Readonly`는 **겉 한 겹만** 읽기 전용으로 만듭니다. 속성 안의 객체나 배열까지 막지는 않습니다(얕은 readonly). 배열은 `readonly CartItem[]`이나 `ReadonlyArray<CartItem>`으로 막습니다.

**직접 구현 맛보기:**

```ts
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K]
}
```

### Pick: 일부 속성만 고르기

**쓰는 상황:** 목록 화면처럼 원본의 **일부 속성만** 필요한 경우입니다.

```ts
interface Product {
  id: number
  name: string
  price: number
  stock: number
  description?: string
}

// 목록 화면에는 id, name, price만 보여 줍니다.
type ProductListItem = Pick<Product, 'id' | 'name' | 'price'>
// 마우스를 올려 보면: type ProductListItem = { id: number; name: string; price: number; }

const list: ProductListItem[] = [
  { id: 1, name: '아메리카노', price: 4500 },
  { id: 2, name: '스콘', price: 3200 },
]
console.log(list.map((p) => `${p.name} ${p.price}원`).join(', '))
// 출력: 아메리카노 4500원, 스콘 3200원

type Wrong = Pick<Product, 'id' | 'color'>
// ❌ Type '"id" | "color"' does not satisfy the constraint 'keyof Product'. (TS2344)
```

두 번째 타입 인자는 `keyof Product`로 제약되어 있어서, 없는 키를 고르면 오류가 납니다. 원본에서 `price`의 타입이 바뀌면 `ProductListItem`도 자동으로 따라 바뀝니다.

**직접 구현 맛보기:** 지난 레슨의 `K extends keyof T` 제약이 그대로 쓰입니다.

```ts
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P]
}
```

### Omit: 일부 속성만 빼기

**쓰는 상황:** 비밀번호를 뺀 공개용 회원 정보, 서버가 만들어 주는 `id`를 뺀 등록 요청처럼 **몇 개만 빼고 나머지는 다** 필요할 때입니다.

```ts
interface Member {
  memberNo: string
  name: string
  email: string
  password: string
}

// 화면에 내려 줄 회원 정보: password 제외
type PublicMember = Omit<Member, 'password'>

function toPublic(member: Member): PublicMember {
  const { password, ...rest } = member
  return rest
}

const pub = toPublic({ memberNo: 'M0007', name: '김하늘', email: 'kim@example.com', password: 'secret' })
console.log(pub)
// 출력: { memberNo: 'M0007', name: '김하늘', email: 'kim@example.com' }
```

::: warning Omit은 없는 키를 넣어도 오류가 나지 않습니다
`Pick`과 달리 `Omit`의 두 번째 타입 인자는 `keyof T`로 제약되어 있지 않습니다(`K extends keyof any`). 그래서 `Omit<Member, 'pasword'>`처럼 오타를 내도 오류 없이 **아무것도 빼지 않은** 타입이 됩니다. 비밀번호를 빼려다 오타로 그대로 노출하는 일이 없도록, 결과 타입을 마우스로 꼭 확인하세요.
:::

**직접 구현 맛보기:** "`T`의 키 중 `K`를 뺀 키들"을 `Pick`합니다. `Exclude`는 바로 아래에서 배웁니다.

```ts
type MyOmit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>
```

### Pick·Omit·Partial 조합: 실무 예

원본 타입 하나에서 등록·수정·목록용 타입을 모두 파생해 봅시다. Part 3 소개 페이지에서 예고한 모습입니다.

```ts
interface Product {
  id: number
  name: string
  price: number
  stock: number
  description?: string
}

// 등록 요청: id는 서버가 만듭니다.
type ProductCreate = Omit<Product, 'id'>

// 수정 요청: id는 바꿀 수 없고, 나머지는 바꿀 것만 보냅니다.
type ProductUpdate = Partial<Omit<Product, 'id'>>

// 목록 화면: 필요한 속성만
type ProductListItem = Pick<Product, 'id' | 'name' | 'price'>

const createReq: ProductCreate = { name: '크루아상', price: 3500, stock: 10 }
const updateReq: ProductUpdate = { stock: 8 }
const listItem: ProductListItem = { id: 3, name: '크루아상', price: 3500 }

console.log(createReq.name, updateReq.stock, listItem.id)
// 출력: 크루아상 8 3

const badUpdate: ProductUpdate = { id: 99 }
// ❌ Object literal may only specify known properties, and 'id' does not exist in type 'Partial<Omit<Product, "id">>'. (TS2353)
```

`Partial<Omit<Product, 'id'>>`처럼 유틸리티 타입은 **겹쳐 쓸 수** 있습니다. 안쪽부터 읽으세요. "`id`를 빼고 → 나머지를 모두 선택으로".

### Record: 키와 값 타입을 정해 객체 만들기

**쓰는 상황:** "이 키들 각각에 이런 값"이 있는 객체, 즉 **사전(딕셔너리)** 모양의 객체를 만들 때입니다.

```ts
type PayMethod = 'CARD' | 'CASH' | 'POINT'

// 결제 수단별 수수료율: 키가 정확히 세 개여야 합니다.
const FEE_RATE: Record<PayMethod, number> = {
  CARD: 0.02,
  CASH: 0,
  POINT: 0,
}

// 상품 코드 → 재고 수량: 키가 무엇이든 문자열이면 됩니다.
const stockByCode: Record<string, number> = {}
stockByCode['P001'] = 30
stockByCode['P002'] = 12

console.log(FEE_RATE.CARD, stockByCode['P002'])
// 출력: 0.02 12

const BAD_RATE: Record<PayMethod, number> = { CARD: 0.02, CASH: 0 }
// ❌ Property 'POINT' is missing in type '{ CARD: number; CASH: number; }' but required in type 'Record<PayMethod, number>'. (TS2741)
```

해설:

- 키 타입이 리터럴 유니온(`PayMethod`)이면 **모든 키가 반드시** 있어야 합니다. 결제 수단을 추가하면 수수료율을 빠뜨린 곳이 컴파일 오류로 드러납니다. [판별 유니온](./03-discriminated-union)의 완전성 검사와 비슷한 효과입니다.
- 키 타입이 `string`이면 인덱스 시그니처 `{ [key: string]: number }`와 같습니다.

**직접 구현 맛보기:**

```ts
type MyRecord<K extends keyof any, V> = {
  [P in K]: V
}
```

`keyof any`는 객체 키로 쓸 수 있는 타입, 즉 `string | number | symbol`입니다.

### Exclude와 Extract: 유니온 거르기

지금까지는 **객체 타입**을 변형했습니다. `Exclude`와 `Extract`는 **유니온 타입**에서 멤버를 거릅니다.

- `Exclude<T, U>`: `T`에서 `U`에 할당 가능한 멤버를 **뺍니다**.
- `Extract<T, U>`: `T`에서 `U`에 할당 가능한 멤버만 **남깁니다**.

```ts
type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'CANCELED'

// 취소할 수 있는 상태: SHIPPED와 CANCELED를 뺍니다.
type CancelableStatus = Exclude<OrderStatus, 'SHIPPED' | 'CANCELED'>
// 마우스를 올려 보면: type CancelableStatus = "PENDING" | "PAID"

// 결제가 끝난 상태만 남깁니다.
type AfterPaid = Extract<OrderStatus, 'PAID' | 'SHIPPED' | 'REFUNDED'>
// 마우스를 올려 보면: type AfterPaid = "PAID" | "SHIPPED"
```

`Extract`에 `'REFUNDED'`처럼 원래 없는 멤버를 넣으면 그냥 무시됩니다. 두 유니온의 공통 부분만 남기 때문입니다.

판별 유니온에서 특정 멤버만 꺼낼 때도 아주 유용합니다.

```ts
type Payment =
  | { method: 'CARD'; amount: number; cardNo: string }
  | { method: 'CASH'; amount: number; received: number }
  | { method: 'POINT'; amount: number; memberNo: string }

// method가 'CARD'인 멤버만 꺼냅니다.
type CardPayment = Extract<Payment, { method: 'CARD' }>
// 마우스를 올려 보면: type CardPayment = { method: "CARD"; amount: number; cardNo: string; }

// 카드를 뺀 나머지
type NonCardPayment = Exclude<Payment, { method: 'CARD' }>

function refundCard(p: CardPayment): void {
  console.log(`카드 ${p.cardNo} 승인 취소`)
}

refundCard({ method: 'CARD', amount: 5000, cardNo: '****-5678' })
// 출력: 카드 ****-5678 승인 취소
```

**직접 구현 맛보기:** **조건부 타입**(conditional type)으로 만들어집니다. 유니온의 멤버 하나하나에 대해 조건을 검사합니다.

```ts
type MyExclude<T, U> = T extends U ? never : T
type MyExtract<T, U> = T extends U ? T : never
```

`T extends U ? A : B`는 "타입 버전의 삼항 연산자"입니다. [조건부 타입과 분배 법칙](../part5-advanced/01-conditional-types)에서 자세히 배웁니다.

### NonNullable: null과 undefined 빼기

**쓰는 상황:** `null`이나 `undefined`가 섞인 타입에서 "이제는 값이 확실히 있다"를 표현할 때입니다.

```ts
interface Member {
  memberNo: string
  nickname: string | null
}

type Nickname = NonNullable<Member['nickname']>
// 마우스를 올려 보면: type Nickname = string

// 닉네임이 있는 회원만 남기는 필터
const nicknames = ['하늘', null, '바다', null]
const valid = nicknames.filter((n): n is NonNullable<typeof n> => n !== null)
console.log(valid)
// 출력: [ '하늘', '바다' ]
```

`n is ...` 부분은 "이 함수가 `true`를 반환하면 `n`은 이 타입이다"라는 **타입 술어**(type predicate)입니다. [사용자 정의 타입 가드](../part5-advanced/06-type-guards-satisfies)에서 배웁니다. (TypeScript 5.5부터는 `n !== null` 같은 간단한 필터에서 이 타입 술어를 스스로 추론하기도 합니다.)

**직접 구현 맛보기:** `T & {}`는 "`null`과 `undefined`를 제외한 모든 값"이라는 뜻입니다(TypeScript 4.8부터 이렇게 정의).

```ts
type MyNonNullable<T> = T & {}
```

### ReturnType과 Parameters: 함수에서 타입 꺼내기

**쓰는 상황:** 함수는 있는데 그 함수가 반환하는 값이나 받는 매개변수의 타입이 따로 정의되어 있지 않을 때입니다. 특히 **외부 라이브러리 함수**에서 자주 씁니다.

```ts
function createOrder(productIds: number[], memberNo: string) {
  return {
    orderNo: `A-${Date.now()}`,
    productIds,
    memberNo,
    createdAt: new Date(),
  }
}

// 반환 타입을 꺼냅니다. typeof로 함수의 타입을 먼저 얻어야 합니다.
type Order = ReturnType<typeof createOrder>
// 마우스를 올려 보면: type Order = { orderNo: string; productIds: number[]; memberNo: string; createdAt: Date; }

// 매개변수 타입을 튜플로 꺼냅니다.
type CreateOrderArgs = Parameters<typeof createOrder>
// 마우스를 올려 보면: type CreateOrderArgs = [productIds: number[], memberNo: string]

// 두 번째 매개변수 타입만
type MemberNo = Parameters<typeof createOrder>[1]

const args: CreateOrderArgs = [[1, 2], 'M0007']
const order: Order = createOrder(...args)
const memberNo: MemberNo = order.memberNo
console.log(order.productIds.length, memberNo)
// 출력: 2 M0007
```

해설:

- `ReturnType<createOrder>`가 아니라 `ReturnType<typeof createOrder>`입니다. `createOrder`는 **값**(함수)이므로, 앞 레슨에서 배운 `typeof`로 타입으로 바꿔서 넘깁니다.
- `Parameters`의 결과는 튜플이므로 `[1]`처럼 인덱스로 특정 매개변수 타입을 꺼낼 수 있습니다.

**직접 구현 맛보기:** 조건부 타입과 `infer`(타입을 꺼내 이름 붙이기)로 만들어집니다.

```ts
type MyReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any
type MyParameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never
```

`infer`는 [infer로 타입 꺼내기](../part5-advanced/02-infer)에서 배웁니다.

### Awaited: Promise 안의 타입 꺼내기

**쓰는 상황:** `async` 함수의 결과에서 Promise를 벗긴 실제 값의 타입이 필요할 때입니다. TypeScript 4.5부터 있습니다. Promise는 [Part 4](../part4-async/02-promise)에서 배우므로, 여기서는 "나중에 값을 주는 상자"라고만 생각하세요.

```ts
async function fetchProducts() {
  return [
    { id: 1, name: '아메리카노', price: 4500 },
    { id: 2, name: '스콘', price: 3200 },
  ]
}

type FetchResult = ReturnType<typeof fetchProducts>
// 마우스를 올려 보면: type FetchResult = Promise<{ id: number; name: string; price: number; }[]>

// Promise를 벗겨 실제 값의 타입을 얻습니다.
type ProductList = Awaited<ReturnType<typeof fetchProducts>>
// 마우스를 올려 보면: type ProductList = { id: number; name: string; price: number; }[]

// 원소 타입까지 내려가기
type FetchedProduct = ProductList[number]

const p: FetchedProduct = { id: 3, name: '머핀', price: 3000 }
console.log(p.name)
// 출력: 머핀
```

`Awaited`는 Promise가 여러 겹이어도(`Promise<Promise<string>>`) 끝까지 벗겨서 `string`을 돌려줍니다.

### InstanceType: 클래스로 만든 객체의 타입

**쓰는 상황:** 클래스 자체(생성자)를 값으로 다루다가, 그 클래스로 만든 객체의 타입이 필요할 때입니다. 클래스는 [다음 레슨](./08-classes)에서 배웁니다.

```ts
class Printer {
  constructor(public model: string) {}
  print(text: string): void {
    console.log(`[${this.model}] ${text}`)
  }
}

// typeof Printer는 "클래스(생성자) 자체"의 타입입니다.
// InstanceType으로 "new Printer(...)로 만든 객체"의 타입을 꺼냅니다.
type PrinterInstance = InstanceType<typeof Printer>

function createDevice<C extends new (model: string) => unknown>(Ctor: C, model: string): InstanceType<C> {
  return new Ctor(model) as InstanceType<C>
}

const printer: PrinterInstance = createDevice(Printer, 'SRP-350')
printer.print('영수증 출력')
// 출력: [SRP-350] 영수증 출력
```

일반 코드에서는 클래스 이름 `Printer`를 그대로 타입으로 쓰면 되므로(`const p: Printer`) `InstanceType`이 필요한 경우는 드뭅니다. 위처럼 **클래스를 인수로 받는 공통 함수**를 만들 때 주로 씁니다.

### NoInfer: 이 자리에서는 추론하지 마 (TypeScript 5.4+)

**쓰는 상황:** 제네릭 함수의 여러 매개변수 중 **일부는 `T`를 추론하는 데 쓰지 말고 검사만** 하게 하고 싶을 때입니다.

먼저 문제 상황을 봅시다. 결제 수단 목록과 기본 결제 수단을 받는 함수입니다.

```ts
function createPaySelector<T extends string>(methods: T[], defaultMethod: T): T {
  return methods.includes(defaultMethod) ? defaultMethod : methods[0]
}

// 'KAKAO'는 목록에 없는데 오류가 나지 않습니다.
const selected = createPaySelector(['CARD', 'CASH'], 'KAKAO')
// 마우스를 올려 보면: const selected: "CARD" | "CASH" | "KAKAO"
console.log(selected)
// 출력: CARD
```

TypeScript는 `methods`와 `defaultMethod` **둘 다에서** `T`의 후보를 모읍니다. 그래서 `T`가 `'CARD' | 'CASH' | 'KAKAO'`로 넓어지고, 오타나 실수가 통과해 버립니다.

`NoInfer<T>`로 감싼 자리는 `T`를 추론하는 재료로 쓰이지 않습니다. 추론이 끝난 `T`로 **검사만** 받습니다.

```ts
// defaultMethod는 T 추론에 참여하지 않습니다. (TypeScript 5.4+)
function createPaySelector<T extends string>(methods: T[], defaultMethod: NoInfer<T>): T {
  return methods.includes(defaultMethod) ? defaultMethod : methods[0]
}

const ok = createPaySelector(['CARD', 'CASH'], 'CASH')
console.log(ok)
// 출력: CASH

createPaySelector(['CARD', 'CASH'], 'KAKAO')
// ❌ Argument of type '"KAKAO"' is not assignable to parameter of type '"CARD" | "CASH"'. (TS2345)
```

이제 `T`는 `methods`에서만 추론되어 `'CARD' | 'CASH'`가 되고, `'KAKAO'`는 그 타입으로 검사받아 오류가 납니다.

::: info NoInfer는 버전을 확인하세요
`NoInfer`는 TypeScript 5.4에서 추가되었습니다. 이 위키의 예제는 5.6.3으로 검증했습니다. 5.3 이하에서는 `Cannot find name 'NoInfer'` 오류가 납니다. `NoInfer`는 다른 유틸리티 타입과 달리 매핑된 타입이나 조건부 타입으로 흉내 낼 수 없는, 컴파일러에 내장된 특별한 타입입니다.
:::

### 한눈에 보기

| 유틸리티 타입 | 하는 일 | 대표 상황 |
|---|---|---|
| `Partial<T>` | 모든 속성을 선택으로 | 수정 API 요청 |
| `Required<T>` | 모든 속성을 필수로 | 기본값을 채운 설정 |
| `Readonly<T>` | 모든 속성을 읽기 전용으로 | 함수 인수 보호, 상태 |
| `Pick<T, K>` | 일부 속성만 고르기 | 목록 화면 |
| `Omit<T, K>` | 일부 속성 빼기 | 비밀번호 제외, 등록 요청 |
| `Record<K, V>` | 키 → 값 사전 | 코드별 설정표 |
| `Exclude<T, U>` | 유니온에서 빼기 | 특정 상태 제외 |
| `Extract<T, U>` | 유니온에서 남기기 | 판별 유니온 멤버 꺼내기 |
| `NonNullable<T>` | `null`·`undefined` 빼기 | 값이 확실한 타입 |
| `ReturnType<F>` | 함수 반환 타입 | 라이브러리 함수 결과 |
| `Parameters<F>` | 함수 매개변수 튜플 | 래퍼 함수 |
| `Awaited<T>` | Promise 벗기기 | `async` 함수 결과 |
| `InstanceType<C>` | 클래스 인스턴스 타입 | 클래스를 받는 함수 |
| `NoInfer<T>` | 추론 막기 (5.4+) | 기본값 매개변수 검사 |

## 자주 하는 실수

### 실수 1: Partial을 너무 넓게 쓰기

```ts
interface Product {
  id: number
  name: string
  price: number
}

// 수정 요청에 Partial<Product>를 썼더니 id도 선택 속성이 되었습니다.
function updateProduct(changes: Partial<Product>): void {
  console.log(`상품 ${changes.id} 수정`)
}

updateProduct({ price: 4800 }) // id 없이도 통과합니다.
// 출력: 상품 undefined 수정
```

**왜 틀렸나:** `Partial<Product>`는 `id`까지 선택으로 만듭니다. 어느 상품을 수정할지 모르는 요청이 컴파일을 통과합니다. 필수로 남겨야 하는 속성은 따로 분리합니다.

```ts
interface Product {
  id: number
  name: string
  price: number
}

// ✅ id는 필수, 나머지는 선택
type ProductUpdate = Pick<Product, 'id'> & Partial<Omit<Product, 'id'>>

function updateProduct(changes: ProductUpdate): void {
  console.log(`상품 ${changes.id} 수정`)
}

updateProduct({ id: 1, price: 4800 })
// 출력: 상품 1 수정

updateProduct({ price: 4800 })
// ❌ Argument of type '{ price: number; }' is not assignable to parameter of type 'ProductUpdate'. (TS2345)
```

### 실수 2: Omit의 키 오타를 못 알아채기

```ts
interface Member {
  memberNo: string
  name: string
  password: string
}

// 'password'를 'pasword'로 잘못 썼습니다. 오류가 나지 않습니다.
type PublicMember = Omit<Member, 'pasword'>

const pub: PublicMember = { memberNo: 'M1', name: '김하늘', password: 'secret' }
console.log(Object.keys(pub))
// 출력: [ 'memberNo', 'name', 'password' ]
```

**왜 틀렸나:** `Omit`은 두 번째 타입 인자를 `keyof T`로 제약하지 않아서, 없는 키를 넣으면 아무것도 빼지 않고 조용히 넘어갑니다. 비밀번호가 그대로 노출될 수 있습니다.

```ts
interface Member {
  memberNo: string
  name: string
  password: string
}

// ✅ 키를 keyof로 제약한 엄격한 Omit을 만들어 씁니다.
type StrictOmit<T, K extends keyof T> = Omit<T, K>

type PublicMember = StrictOmit<Member, 'pasword'>
// ❌ Type '"pasword"' does not satisfy the constraint 'keyof Member'. (TS2344)
```

팀 프로젝트라면 `StrictOmit` 같은 타입을 공통 파일에 두고 쓰는 것도 좋은 방법입니다.

### 실수 3: ReturnType에 함수 이름을 그대로 넘기기

```ts
function getStore() {
  return { code: 'S001', name: '강남점' }
}

type Store = ReturnType<getStore>
// ❌ 'getStore' refers to a value, but is being used as a type here. Did you mean 'typeof getStore'? (TS2749)
```

**왜 틀렸나:** `getStore`는 값(함수)입니다. 유틸리티 타입은 타입 인자로 **타입**을 받으므로 `typeof`로 함수의 타입을 넘겨야 합니다.

```ts
function getStore() {
  return { code: 'S001', name: '강남점' }
}

// ✅ typeof로 함수의 타입을 넘깁니다.
type Store = ReturnType<typeof getStore>

const s: Store = { code: 'S002', name: '판교점' }
console.log(s.name)
// 출력: 판교점
```

### 실수 4: Readonly면 안쪽까지 다 막힌다고 생각하기

```ts
interface Cart {
  memberNo: string
  items: { productId: number; qty: number }[]
}

function checkout(cart: Readonly<Cart>): void {
  // 겉 속성은 막히지만, 배열 안쪽은 바꿀 수 있습니다.
  cart.items.push({ productId: 99, qty: 1 })
  cart.items[0].qty = 100
  console.log(cart.items.length, cart.items[0].qty)
}

checkout({ memberNo: 'M1', items: [{ productId: 1, qty: 2 }] })
// 출력: 2 100
```

**왜 틀렸나:** `Readonly`는 얕게 동작합니다. `cart.items = []`처럼 속성 자체를 바꾸는 것은 막지만, `items` 배열 안을 바꾸는 것은 막지 않습니다.

```ts
interface Cart {
  memberNo: string
  // ✅ 배열과 원소도 읽기 전용으로 선언합니다.
  items: readonly Readonly<{ productId: number; qty: number }>[]
}

function checkout(cart: Readonly<Cart>): void {
  cart.items.push({ productId: 99, qty: 1 })
  // ❌ Property 'push' does not exist on type 'readonly Readonly<{ productId: number; qty: number; }>[]'. (TS2339)
  cart.items[0].qty = 100
  // ❌ Cannot assign to 'qty' because it is a read-only property. (TS2540)
}
```

모든 깊이까지 읽기 전용으로 만드는 `DeepReadonly`는 [재귀 타입](../part5-advanced/05-recursive-types)에서 직접 만들어 봅니다.

## 직접 해 보기

### 문제 1 ⭐ 기초

아래 `Member` 타입에서 다음 타입을 유틸리티 타입으로 만드세요.

1. 회원 가입 요청 `MemberSignup`: `memberNo`와 `joinedAt`은 서버가 만들므로 제외
2. 회원 목록 화면 `MemberListItem`: `memberNo`, `name`, `grade`만
3. 회원 정보 수정 `MemberUpdate`: `name`, `phone`만 선택적으로 수정 가능

```ts
interface Member {
  memberNo: string
  name: string
  phone: string
  grade: 'BASIC' | 'VIP'
  joinedAt: Date
}
```

::: details 정답 보기
```ts
interface Member {
  memberNo: string
  name: string
  phone: string
  grade: 'BASIC' | 'VIP'
  joinedAt: Date
}

type MemberSignup = Omit<Member, 'memberNo' | 'joinedAt'>
type MemberListItem = Pick<Member, 'memberNo' | 'name' | 'grade'>
type MemberUpdate = Partial<Pick<Member, 'name' | 'phone'>>

const signup: MemberSignup = { name: '김하늘', phone: '010-1111-2222', grade: 'BASIC' }
const item: MemberListItem = { memberNo: 'M0007', name: '김하늘', grade: 'VIP' }
const update: MemberUpdate = { phone: '010-3333-4444' }
console.log(signup.name, item.grade, update.phone)
// 출력: 김하늘 VIP 010-3333-4444
```
:::

### 문제 2 ⭐ 기초

매장 코드(`'S001' | 'S002' | 'S003'`)별 매장 이름을 담는 객체를 `Record`로 선언하세요. 매장 하나를 빠뜨리면 어떤 오류가 나는지 확인하세요.

::: details 정답 보기
```ts
type StoreCode = 'S001' | 'S002' | 'S003'

const STORE_NAME: Record<StoreCode, string> = {
  S001: '강남점',
  S002: '판교점',
  S003: '분당점',
}
console.log(STORE_NAME.S002)
// 출력: 판교점

const PARTIAL_NAME: Record<StoreCode, string> = { S001: '강남점', S002: '판교점' }
// ❌ Property 'S003' is missing in type '{ S001: string; S002: string; }' but required in type 'Record<StoreCode, string>'. (TS2741)
```
:::

### 문제 3 ⭐⭐ 응용

아래 판별 유니온에서 `Extract`로 "취소된 주문" 타입을 꺼내, 취소 사유를 출력하는 함수를 만드세요. 그리고 `Exclude`로 "취소되지 않은 주문" 타입을 만들어 보세요.

```ts
type Order =
  | { status: 'PAID'; orderNo: string; paidAt: Date }
  | { status: 'SHIPPED'; orderNo: string; trackingNo: string }
  | { status: 'CANCELED'; orderNo: string; reason: string }
```

::: details 정답 보기
```ts
type Order =
  | { status: 'PAID'; orderNo: string; paidAt: Date }
  | { status: 'SHIPPED'; orderNo: string; trackingNo: string }
  | { status: 'CANCELED'; orderNo: string; reason: string }

type CanceledOrder = Extract<Order, { status: 'CANCELED' }>
type ActiveOrder = Exclude<Order, { status: 'CANCELED' }>

function printCancelReason(order: CanceledOrder): void {
  console.log(`${order.orderNo} 취소 사유: ${order.reason}`)
}

printCancelReason({ status: 'CANCELED', orderNo: 'A-1', reason: '재고 부족' })
// 출력: A-1 취소 사유: 재고 부족

const active: ActiveOrder = { status: 'SHIPPED', orderNo: 'A-2', trackingNo: '6000-1' }
console.log(active.status)
// 출력: SHIPPED
```
:::

### 문제 4 ⭐⭐ 응용

외부 라이브러리에 아래 함수가 있다고 해 봅시다(타입은 따로 내보내지 않음). 이 함수의 **두 번째 매개변수 타입**과 **Promise를 벗긴 반환 타입**을 유틸리티 타입으로 꺼내세요.

```ts
async function requestPayment(amount: number, option: { method: 'CARD' | 'CASH'; installment?: number }) {
  return { approvalNo: 'AP-0001', amount, approvedAt: new Date() }
}
```

::: details 정답 보기
```ts
async function requestPayment(amount: number, option: { method: 'CARD' | 'CASH'; installment?: number }) {
  return { approvalNo: 'AP-0001', amount, approvedAt: new Date() }
}

type PaymentOption = Parameters<typeof requestPayment>[1]
type PaymentResult = Awaited<ReturnType<typeof requestPayment>>

const option: PaymentOption = { method: 'CARD', installment: 3 }
const result: PaymentResult = { approvalNo: 'AP-0002', amount: 15000, approvedAt: new Date() }
console.log(option.method, result.approvalNo)
// 출력: CARD AP-0002
```
:::

### 문제 5 ⭐⭐⭐ 도전

다음 함수는 화면 탭 목록과 처음 열 탭을 받습니다. 지금은 목록에 없는 탭 이름을 넘겨도 오류가 나지 않습니다. `NoInfer`(TypeScript 5.4+)로 고쳐서 `'refund'`를 넘기면 컴파일 오류가 나게 하세요.

```text
function openTabs<T extends string>(tabs: T[], initial: T): T {
  return initial
}

openTabs(['order', 'product', 'member'], 'refund')
```

::: details 정답 보기
```ts
function openTabs<T extends string>(tabs: T[], initial: NoInfer<T>): T {
  console.log(`${tabs.length}개 탭 중 ${initial} 열기`)
  return initial
}

openTabs(['order', 'product', 'member'], 'product')
// 출력: 3개 탭 중 product 열기

openTabs(['order', 'product', 'member'], 'refund')
// ❌ Argument of type '"refund"' is not assignable to parameter of type '"order" | "product" | "member"'. (TS2345)
```
`initial`이 `T` 추론에 참여하지 않으므로 `T`는 `tabs`에서만 `'order' | 'product' | 'member'`로 추론되고, `'refund'`는 검사에서 걸립니다.
:::

## 확인 퀴즈

1. 수정 API 요청 타입으로 `Partial<Product>`를 그대로 쓰면 생길 수 있는 문제는 무엇인가요?
2. `Pick`과 `Omit` 중, 없는 키를 넣었을 때 오류가 나는 것은 무엇인가요?
3. `Record<'CARD' | 'CASH', number>` 타입 객체에서 `CASH` 키를 빼먹으면 어떻게 되나요?
4. `ReturnType<getStore>`가 오류인 이유와 고치는 방법은 무엇인가요?
5. `Exclude`와 `Extract`의 차이는 무엇인가요?
6. `NoInfer<T>`는 몇 버전부터 쓸 수 있고, 무엇을 막나요?

::: details 정답 보기
1. `id` 같은 필수 식별자까지 선택 속성이 되어, 어느 대상을 수정할지 모르는 요청이 컴파일을 통과합니다.
2. `Pick`입니다. `Omit`은 키를 `keyof T`로 제약하지 않아 오타가 조용히 무시됩니다.
3. 컴파일 오류(TS2741)가 납니다. 키가 리터럴 유니온이면 모든 키가 있어야 합니다.
4. `getStore`는 값이므로 타입 인자로 넘길 수 없습니다. `ReturnType<typeof getStore>`로 씁니다.
5. `Exclude<T, U>`는 `T`에서 `U`에 할당 가능한 멤버를 빼고, `Extract<T, U>`는 그런 멤버만 남깁니다.
6. TypeScript 5.4부터입니다. 감싼 자리가 타입 매개변수 추론의 재료로 쓰이는 것을 막고, 다른 곳에서 추론된 타입으로 검사만 받게 합니다.
:::

## 정리

- 유틸리티 타입은 **원본 타입 하나에서 화면·API별 타입을 파생**하는 내장 도구입니다. 원본이 바뀌면 파생 타입도 따라 바뀝니다.
- 객체 변형: `Partial`(수정 요청), `Required`, `Readonly`(얕음), `Pick`(목록 화면), `Omit`(민감 정보 제외), `Record`(코드별 사전).
- 유니온 거르기: `Exclude`, `Extract`(판별 유니온 멤버 꺼내기), `NonNullable`.
- 함수·클래스에서 꺼내기: `ReturnType`, `Parameters`, `Awaited`, `InstanceType` — 값에 쓸 때는 `typeof`를 붙입니다.
- `NoInfer`(TS 5.4+)는 특정 매개변수가 타입 추론에 끼어드는 것을 막습니다.
- `Omit`은 키 오타를 잡지 못하고, `Readonly`는 얕게만 막는다는 점을 기억합니다.
- 대부분의 유틸리티 타입은 매핑된 타입·조건부 타입으로 직접 만들 수 있습니다. 원리는 Part 5에서 배웁니다.

## 다음 단계

[클래스: 접근 제어자 · 추상 클래스 · implements](./08-classes): `InstanceType`에서 잠깐 본 클래스를 제대로 배웁니다. 접근 제어자, 상속, 추상 클래스, 인터페이스 구현과 "언제 클래스를 쓸지"의 기준을 익힙니다.
