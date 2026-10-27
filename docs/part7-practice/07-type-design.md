---
title: 좋은 타입 설계 원칙과 패턴
---

# 좋은 타입 설계 원칙과 패턴

<LessonMeta level="실전" :minutes="60" prev="axios 인스턴스·공통 응답·ApiError·zod 검증으로 API 클라이언트 설계하기" />

## 이번에 배울 것

- "불가능한 상태를 표현할 수 없게" 만드는 원칙으로 boolean·선택 속성 묶음을 판별 유니온으로 바꿀 수 있다.
- 로딩 상태를 `idle`/`loading`/`success`/`error` 판별 유니온으로 설계하고 완전성 검사를 적용할 수 있다.
- 브랜드 타입으로 같은 `number`인 상품 ID와 회원 ID가 섞이는 실수를 막을 수 있다.
- `any` 대신 `unknown`을 쓰고, 너무 넓은 타입과 너무 좁은 타입을 알아보고 고칠 수 있다.
- 함수 시그니처를 읽기 쉽게 설계하고, 타입과 런타임 검증의 경계를 정할 수 있다.

## 먼저 알아 둘 것

- [판별 유니온과 완전성 검사](../part3-intermediate/03-discriminated-union)
- [특수 타입: any · unknown · never · void](../part2-types/02-special-types)
- [구조적 타이핑과 할당 가능성](../part3-intermediate/02-structural-typing)
- [런타임 검증: 타입은 실행 중에 사라진다 (zod)](../part4-async/05-runtime-validation)
- 이 파트의 앞 레슨들. 특히 [API 클라이언트](./06-api-client)

::: info 이 레슨의 예제
모든 예제는 TypeScript 5.6.3(strict)으로 검사했고, 출력이 있는 예제는 컴파일해 Node.js에서 실행한 결과입니다. 프레임워크와 상관없는 순수 TypeScript라서 React·Vue·Node.js 어디서든 그대로 쓸 수 있습니다.
:::

## 비유로 이해하기

매장 **주문서 양식**을 만든다고 해 봅시다.

나쁜 양식은 칸만 잔뜩 있습니다. "현금 받은 금액", "카드사", "승인 번호", "사용 포인트"가 한 장에 모두 있어서, 직원이 현금 결제인데 카드사를 적거나, 카드 결제인데 승인 번호를 비워도 양식은 막지 못합니다. 검수하는 사람이 매번 "이 조합이 말이 되나?"를 따져야 합니다.

좋은 양식은 맨 위에서 **결제 수단을 먼저 고르게** 합니다. "현금"을 고르면 받은 금액 칸만, "카드"를 고르면 카드사·승인 번호 칸만 나타납니다. **틀린 조합은 아예 적을 수 없습니다.**

좋은 타입 설계는 좋은 양식 만들기와 같습니다. 실수를 "나중에 검사해서 잡는" 대신, **실수를 표현할 수 없게** 만듭니다. 그러면 검사 코드가 줄고, 컴파일러가 검수자 역할을 대신합니다.

## 개념 설명

### 1단계: 불가능한 상태를 표현할 수 없게

상품 목록을 불러오는 화면의 상태를 흔히 이렇게 만듭니다.

```ts
interface ProductListState {
  isLoading: boolean
  error: string | null
  data: Product[] | null
}
```

속성 세 개의 조합은 `2 × 2 × 2 = 8`가지입니다. 그런데 실제로 의미 있는 상태는 "아직 시작 안 함", "불러오는 중", "성공", "실패" 네 가지뿐입니다. 나머지는 **불가능한 상태**인데도 타입은 허용합니다.

```ts
// 타입 오류 없음: "불러오는 중인데 실패했고 데이터도 있음"?
const weird: ProductListState = { isLoading: true, error: '실패', data: [] }
```

이런 타입을 쓰면 화면 코드가 **방어 코드**로 가득 찹니다. `isLoading`과 `error`가 동시에 참이면 무엇을 보여 줄지, `data`가 `null`인데 `isLoading`도 `false`면 무엇인지 매번 고민해야 합니다. 그리고 그 고민이 화면마다 다르게 구현됩니다.

해결 방법은 **가능한 상태만 나열하는 것**입니다. 이것이 이 레슨의 첫 번째이자 가장 중요한 원칙입니다.

> 불가능한 상태를 표현할 수 없게 하라(Make illegal states unrepresentable).

### 2단계: 로딩 상태 판별 유니온

가능한 네 상태를 [판별 유니온](../part3-intermediate/03-discriminated-union)으로 적습니다. 각 상태에 **그 상태일 때만 의미 있는 데이터**를 붙입니다.

```ts
type RemoteData<T, E = string> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: E }
```

- `data`는 `success`일 때만, `error`는 `error`일 때만 존재합니다.
- `E = string`은 [기본 타입 매개변수](../part3-intermediate/05-generic-constraints)입니다. 대개 문자열 메시지면 충분하고, 필요하면 `RemoteData<Product[], ApiError>`처럼 바꿉니다.

이제 불가능한 상태는 만들 수 없습니다.

```ts
const bad: RemoteData<Product[]> = { status: 'loading', data: [] }
// ❌ Object literal may only specify known properties, and 'data' does not exist in type '{ status: "loading"; }'. (TS2353)

declare const state: RemoteData<Product[]>
state.data
// ❌ Property 'data' does not exist on type 'RemoteData<Product[]>'.
//      Property 'data' does not exist on type '{ status: "idle"; }'. (TS2339)
```

쓰는 쪽은 `status`로 좁히고, `never`로 [완전성 검사](../part3-intermediate/03-discriminated-union)를 합니다.

```ts
function describe(state: RemoteData<Product[]>): string {
  switch (state.status) {
    case 'idle':
      return '검색어를 입력하세요'
    case 'loading':
      return '불러오는 중…'
    case 'success':
      return `${state.data.length}개 상품` // 여기서만 data 사용 가능
    case 'error':
      return `오류: ${state.error}`
    default: {
      const unreachable: never = state
      return unreachable
    }
  }
}

console.log(describe({ status: 'idle' }))
// 출력: 검색어를 입력하세요
console.log(describe({ status: 'success', data: [americano] }))
// 출력: 1개 상품
console.log(describe({ status: 'error', error: '네트워크 오류' }))
// 출력: 오류: 네트워크 오류
```

React라면 `useState<RemoteData<Product[]>>({ status: 'idle' })` 하나로, Vue라면 `ref<RemoteData<Product[]>>({ status: 'idle' })` 하나로 state 세 개를 대신합니다. 상태를 바꿀 때도 `setState({ status: 'success', data })`처럼 **한 번에 한 상태로** 바뀌므로 "로딩을 끄는 것을 잊음" 같은 버그가 사라집니다.

::: tip 실무 라이브러리도 같은 모양
TanStack Query 같은 데이터 조회 라이브러리의 결과 타입도 내부적으로 `status`를 판별자로 쓰는 유니온입니다. 이 패턴을 이해하면 라이브러리 타입도 읽기 쉬워집니다.
:::

### 3단계: 브랜드 타입으로 ID 혼동 막기

상품 ID도 `number`, 회원 ID도 `number`, 매장 ID도 `number`입니다. [구조적 타이핑](../part3-intermediate/02-structural-typing) 때문에 TypeScript는 이 셋을 구별하지 못합니다.

```ts
function addToWishlist(memberId: number, productId: number): string {
  return `회원 ${memberId}의 찜 목록에 상품 ${productId} 추가`
}

addToWishlist(productId, memberId) // 순서를 바꿔도 오류 없음 → 엉뚱한 데이터가 저장됨
```

**브랜드 타입**(branded type)은 원래 타입에 **눈에 보이지 않는 꼬리표**를 붙여 서로 다른 타입으로 만드는 기법입니다.

```ts
type Brand<T, B extends string> = T & { readonly __brand: B }

type ProductId = Brand<number, 'ProductId'>
type MemberId = Brand<number, 'MemberId'>
```

`number & { readonly __brand: 'ProductId' }`는 "숫자이면서 `__brand`가 `'ProductId'`인 값"입니다. 실제로 그런 속성을 가진 숫자는 없으므로, 이 타입의 값은 **검사 함수를 거쳐서만** 만들어지게 합니다.

```ts
function toProductId(value: number): ProductId {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`잘못된 상품 ID: ${value}`)
  }
  return value as ProductId // 검사를 통과한 곳에서만 단언
}

function toMemberId(value: number): MemberId {
  if (!Number.isInteger(value) || value <= 0) throw new Error(`잘못된 회원 ID: ${value}`)
  return value as MemberId
}

function addToWishlist(memberId: MemberId, productId: ProductId): string {
  return `회원 ${memberId}의 찜 목록에 상품 ${productId} 추가`
}

const memberId = toMemberId(7)
const productId = toProductId(101)
console.log(addToWishlist(memberId, productId))
// 출력: 회원 7의 찜 목록에 상품 101 추가
```

이제 순서를 바꾸거나 맨 숫자를 넣으면 오류가 납니다.

```ts
addToWishlist(productId, memberId)
// ❌ Argument of type 'ProductId' is not assignable to parameter of type 'MemberId'.
//      ...
//        Type '"ProductId"' is not assignable to type '"MemberId"'. (TS2345)

addToWishlist(7, 101)
// ❌ Argument of type 'number' is not assignable to parameter of type 'MemberId'. (TS2345)
```

해설:

- `__brand`는 **타입에만 있고 실제 값에는 없습니다.** 실행 중에는 그냥 숫자 `101`이라 성능 비용이 없습니다. `console.log(productId + 1)`은 `102`를 출력합니다.
- 브랜드 타입은 여전히 `number`의 일종이라 산술·비교에 그대로 쓸 수 있습니다.
- `as` 단언은 **검사 함수 안 한 곳에만** 둡니다. 다른 곳에서 `as ProductId`를 쓰기 시작하면 브랜드의 의미가 사라집니다.
- 모든 값에 브랜드를 붙이면 피곤합니다. **섞이면 사고가 나는 값**(여러 종류의 ID, 원화/달러 금액, 검증된 이메일 등)에만 씁니다.
- zod에도 같은 기능이 있습니다(`z.number().int().positive().brand('ProductId')`). 검증과 브랜드 부여를 한 번에 할 수 있습니다.

### 4단계: any 대신 unknown

`any`는 "타입 검사를 끈다"는 뜻이고, `unknown`은 "무엇인지 모르니 **확인하고 써라**"는 뜻입니다([특수 타입](../part2-types/02-special-types)).

```ts
function formatA(input: any) {
  return input.toFixed(2) // 오류 없음. 문자열이 오면 실행 중에 터짐
}

function formatB(input: unknown) {
  return input.toFixed(2)
  // ❌ 'input' is of type 'unknown'. (TS18046)
}
```

`any`는 **번집니다.** `any` 값에서 꺼낸 속성도, 그것으로 계산한 값도 `any`가 되어, 한 곳의 `any`가 수십 줄의 타입 검사를 몰래 끕니다. 반면 `unknown`은 좁히기 전에는 아무것도 못 하게 막습니다.

```ts
function parsePrice(input: unknown): number {
  if (typeof input === 'number') return input
  if (typeof input === 'string' && input.trim() !== '' && !Number.isNaN(Number(input))) {
    return Number(input)
  }
  throw new Error(`가격으로 바꿀 수 없습니다: ${String(input)}`)
}

console.log(parsePrice(4500), parsePrice('5000'))
// 출력: 4500 5000
```

외부 입력(JSON, API 응답, `localStorage`, `catch`의 오류, 메시지 이벤트)을 받는 함수의 매개변수는 **`unknown`이 기본값**이라고 생각하세요.

### 5단계: 너무 넓은 타입, 너무 좁은 타입

타입은 "값들의 집합"입니다([타입 표기와 추론](../part2-types/01-annotation-inference)). 좋은 타입은 **실제로 가능한 값의 집합과 딱 맞습니다.**

**너무 넓은 타입** — 허용하지 말아야 할 값까지 받아들입니다.

| 너무 넓음 | 문제 | 알맞게 |
|---|---|---|
| `status: string` | `'PIAD'` 같은 오타도 통과 | `status: 'READY' \| 'PAID' \| 'CANCELED'` |
| `options: object` | 속성을 하나도 못 씀 | `options: { withUnit?: boolean }` |
| `data: any` | 검사 꺼짐 | `data: unknown` 후 검증 |
| `productId: number` | 회원 ID와 섞임 | `productId: ProductId` (3단계) |
| `{ isLoading; error; data }` | 불가능한 조합 허용 | `RemoteData<T>` (2단계) |

**너무 좁은 타입** — 정당한 값까지 거부하거나, 함수가 필요 이상을 요구합니다. 장바구니 항목과 주문 항목의 합계를 구하는 함수를 봅시다.

```ts
// 😕 너무 좁음: CartItem만 받음
function sumAmount(lines: CartItem[]): number {
  return lines.reduce((sum, l) => sum + l.price * l.quantity, 0)
}
// 주문 항목(OrderLine)은 price·quantity가 있어도 CartItem의 다른 속성이 없어서 넣을 수 없음
```

함수가 실제로 쓰는 것은 `price`와 `quantity`뿐입니다. **함수는 필요한 만큼만 요구**하게 바꿉니다.

```ts
type Priced = { price: number; quantity: number }

// 🙂 필요한 속성만 요구. readonly로 "배열을 고치지 않는다"는 약속도 표시
function sumAmount(lines: readonly Priced[]): number {
  return lines.reduce((sum, l) => sum + l.price * l.quantity, 0)
}

const cart = [{ productId: 1, name: '아메리카노', price: 4500, quantity: 2 }]
const orderLines = [{ orderNo: 'A-1', price: 5000, quantity: 1, discount: 0 }]
console.log(sumAmount(cart), sumAmount(orderLines))
// 출력: 9000 5000
```

너무 좁은 타입의 다른 예로, 휴대폰 번호를 `` `010-${string}-${string}` ``처럼 템플릿 리터럴 타입으로 묶으면 `011` 번호나 하이픈 없는 입력을 정당하게 다룰 수 없게 됩니다. 형식 검사는 타입보다 **런타임 검증**(정규식, zod)이 알맞은 경우가 많습니다. 기준은 "이 제한이 **항상** 참인가?"입니다.

정리하면 **"받을 때는 넓게(필요한 만큼만 요구), 돌려줄 때는 구체적으로"** 가 좋은 기본값입니다.

### 6단계: 함수 시그니처 설계

**시그니처**(signature)는 함수의 이름·매개변수·반환 타입, 즉 함수의 "겉모습"입니다. 사용하는 사람은 대부분 시그니처만 보고 함수를 씁니다.

**① boolean 매개변수가 여러 개면 옵션 객체로**

```ts
// 😕 부르는 쪽에서 true, false가 무슨 뜻인지 알 수 없음
formatPrice(12000, true, false)
```

```ts
// 🙂 이름 붙은 옵션 객체 + 기본값
type FormatPriceOptions = { withUnit?: boolean; currency?: 'KRW' | 'USD' }

function formatPrice(price: number, { withUnit = true, currency = 'KRW' }: FormatPriceOptions = {}): string {
  const text = price.toLocaleString(currency === 'KRW' ? 'ko-KR' : 'en-US')
  if (!withUnit) return text
  return currency === 'KRW' ? `${text}원` : `$${text}`
}

console.log(formatPrice(12000), formatPrice(12000, { withUnit: false }), formatPrice(12.5, { currency: 'USD' }))
// 출력: 12,000원 12,000 $12.5
```

**② 예상 가능한 실패는 반환 타입에 드러내기**

쿠폰 적용처럼 **실패가 정상적인 업무 흐름**인 경우, `throw`나 `null`보다 결과 타입이 낫습니다. `throw`는 시그니처에 보이지 않아 잊고 처리하지 않기 쉽고, `null`은 **왜** 실패했는지 알려 주지 못합니다.

```ts
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E }
type CouponError = 'EXPIRED' | 'MIN_AMOUNT' | 'NOT_FOUND'

function applyCoupon(code: string, amount: number): Result<number, CouponError> {
  if (code === 'WELCOME') {
    if (amount < 10000) return { ok: false, error: 'MIN_AMOUNT' }
    return { ok: true, value: amount - 2000 }
  }
  if (code === 'SUMMER') return { ok: false, error: 'EXPIRED' }
  return { ok: false, error: 'NOT_FOUND' }
}

// Record<CouponError, string>: 실패 종류를 추가하면 메시지를 빠뜨렸을 때 오류
const messages: Record<CouponError, string> = {
  EXPIRED: '기간이 지난 쿠폰입니다.',
  MIN_AMOUNT: '10,000원 이상 주문 시 쓸 수 있습니다.',
  NOT_FOUND: '없는 쿠폰입니다.',
}

for (const [code, amount] of [['WELCOME', 15000], ['WELCOME', 8000], ['SUMMER', 15000]] as const) {
  const r = applyCoupon(code, amount)
  console.log(r.ok ? `결제 금액 ${r.value}` : messages[r.error])
}
// 출력: 결제 금액 13000
// 출력: 10,000원 이상 주문 시 쓸 수 있습니다.
// 출력: 기간이 지난 쿠폰입니다.
```

반대로 네트워크 장애·버그처럼 **예상하지 못한 실패**는 지금처럼 예외(`throw`)로 두는 것이 자연스럽습니다. [API 클라이언트](./06-api-client)의 `ApiError`가 그 예입니다.

**③ 그 밖의 기준**

- 매개변수가 3개를 넘거나 같은 타입이 나란히 있으면(`(memberId: number, productId: number, storeId: number)`) 객체 매개변수나 브랜드 타입을 고려합니다.
- 공개(export) 함수는 반환 타입을 적어 약속을 분명히 합니다([표기와 추론](../part2-types/01-annotation-inference)).
- 입력 배열·객체를 고치지 않는다면 `readonly`로 표시합니다.
- 오버로드보다 유니온 매개변수가 단순하면 유니온을 씁니다([함수 타입](../part2-types/05-function-types)).

### 7단계: 타입과 런타임 검증의 경계

Part 7 내내 반복한 원칙을 한 그림으로 정리합니다.

```text
   바깥 세상 (믿을 수 없음)                    안쪽 코드 (타입을 믿음)
 ┌──────────────────────────┐   경계    ┌──────────────────────────────┐
 │ HTTP 요청 본문·쿼리        │ ───────▶ │                              │
 │ API 응답                  │  검증    │  Product, Order, ProductId    │
 │ 환경 변수                 │  (zod,   │  RemoteData<T>, Result<T, E>  │
 │ localStorage, URL         │  타입    │                              │
 │ catch의 오류              │  가드)   │  → 다시 검사하지 않음          │
 └──────────────────────────┘           └──────────────────────────────┘
        타입: unknown                         타입: 구체적인 타입
```

- **경계 바깥**의 값은 `unknown`으로 받습니다.
- **경계에서 한 번** 검증하고, 통과한 값에만 구체적인 타입(필요하면 브랜드)을 붙입니다. 검증하는 함수의 반환 타입이 "검증됨"의 증거가 됩니다. 이것을 "검사하지 말고 파싱하라(parse, don't validate)"라고 부르기도 합니다. `true/false`만 돌려주는 검사 함수 대신, **타입이 바뀐 값을 돌려주는** 파싱 함수를 쓰라는 뜻입니다.
- **경계 안쪽**에서는 타입을 믿고 다시 검사하지 않습니다. 안쪽 곳곳에 `if (typeof x.price !== 'number')`가 보인다면 경계가 제대로 세워지지 않았다는 신호입니다.

Part 7의 각 레슨에서 경계는 다음 위치였습니다.

| 레슨 | 경계 | 도구 |
|---|---|---|
| [01 Express](./01-node-express) | 요청 본문·쿼리, 환경 변수 | `validateCreate`, `config.ts` |
| [02 React](./02-react-basics) | 입력창의 문자열 | 제출 시 숫자 변환·검사 |
| [05 zustand](./05-zustand) | `persist`로 복원된 값 | `version`·`migrate`, 검증 |
| [06 API 클라이언트](./06-api-client) | API 응답, `catch`의 오류 | zod, `isAxiosError`, `toApiError` |

### 8단계: 리팩터링 전후 예시 — 결제 정보

POS의 결제 정보를 예로, 지금까지의 원칙을 한 번에 적용해 봅시다.

**리팩터링 전**

```ts
interface Payment {
  method: string // 'cash' | 'card' | 'point'?
  receivedAmount?: number // 현금일 때만
  cardCompany?: string // 카드일 때만
  approvalNo?: string // 카드일 때만
  memberId?: number // 포인트일 때만
  usedPoint?: number // 포인트일 때만
}

function receiptLine(p: Payment): string {
  if (p.method === 'cash') return `현금 ${p.receivedAmount!.toLocaleString('ko-KR')}원`
  if (p.method === 'card') return `${p.cardCompany}카드 승인 ${p.approvalNo}`
  if (p.method === 'point') return `포인트 ${p.usedPoint}P (회원 ${p.memberId})`
  return '알 수 없는 결제'
}
```

문제점:

- `method: string` — 너무 넓습니다. `'crad'` 오타가 통과합니다.
- 선택 속성 6개 — 불가능한 조합(현금인데 승인 번호 있음, 카드인데 승인 번호 없음)을 허용합니다.
- `p.receivedAmount!` — 단언으로 문제를 덮었습니다.
- `memberId?: number` — 상품 ID 등과 섞일 수 있습니다.
- `return '알 수 없는 결제'` — 새 결제 수단을 추가해도 컴파일러가 알려 주지 않습니다.

**리팩터링 후**

```ts
type Payment =
  | { method: 'cash'; receivedAmount: number }
  | { method: 'card'; cardCompany: string; approvalNo: string }
  | { method: 'point'; memberId: MemberId; usedPoint: number }

function receiptLine(p: Payment): string {
  switch (p.method) {
    case 'cash':
      return `현금 ${p.receivedAmount.toLocaleString('ko-KR')}원`
    case 'card':
      return `${p.cardCompany}카드 승인 ${p.approvalNo}`
    case 'point':
      return `포인트 ${p.usedPoint}P (회원 ${p.memberId})`
  }
}

console.log(receiptLine({ method: 'card', cardCompany: '신한', approvalNo: '30012345' }))
// 출력: 신한카드 승인 30012345
console.log(receiptLine({ method: 'point', memberId: toMemberId(7), usedPoint: 1500 }))
// 출력: 포인트 1500P (회원 7)
```

- 각 결제 수단에 **필요한 칸만, 모두 필수로** 있습니다. `!`가 사라졌습니다.
- `switch`가 모든 경우를 처리하므로 마지막 `return`이 필요 없습니다. 반환 타입을 `string`으로 적었기 때문에, 나중에 `{ method: 'giftcard'; serial: string }`을 추가하면 다음 오류로 고칠 곳을 알려 줍니다.

```text
Function lacks ending return statement and return type does not include 'undefined'. (TS2366)
```

- 서버에서 결제 정보를 받는다면 이 유니온을 zod의 `z.discriminatedUnion('method', [...])`으로 만들어 경계에서 검증합니다.

## 자주 하는 실수

### 실수 1: 상태를 boolean 여러 개로 표현하기

```ts
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
const [orders, setOrders] = useState<Order[] | null>(null)

// 다시 불러올 때 setError(null)을 잊으면 "로딩 중 + 이전 오류 표시"가 동시에 나타남
```

왜 틀렸나: 서로 관련된 값을 따로 두면 불가능한 조합이 생기고, 바꿀 때마다 세 개를 맞춰야 합니다.

고친 코드: 하나의 판별 유니온으로 묶습니다.

```ts
const [state, setState] = useState<RemoteData<Order[]>>({ status: 'idle' })
setState({ status: 'loading' }) // 이전 오류·데이터가 자동으로 사라짐
```

### 실수 2: 브랜드 타입을 아무 데서나 단언으로 만들기

```ts
const productId = Number(req.params.id) as ProductId // 검사 없이 꼬리표만 붙임
```

왜 틀렸나: `'abc'`가 들어오면 `NaN`이 `ProductId`가 됩니다. 브랜드의 목적은 "검증을 통과했다"는 증거인데, 단언으로 만들면 증거가 거짓이 됩니다.

고친 코드: 검사 함수 한 곳에서만 만듭니다.

```ts
const productId = toProductId(Number(req.params.id)) // 잘못된 값이면 여기서 오류
```

### 실수 3: "일단 any로" 두고 잊기

```ts
function handleMessage(event: any) {
  const total = event.data.items.reduce((s: any, i: any) => s + i.price, 0)
  updateTotal(total) // total도 any → 이후 코드 전부 검사 꺼짐
}
```

왜 틀렸나: `any`는 퍼지면서 주변 코드의 타입 검사를 끕니다. "나중에 고치자"는 대개 고쳐지지 않습니다.

고친 코드: `unknown`으로 받고 경계에서 검증합니다.

```ts
const MessageSchema = z.object({ items: z.array(z.object({ price: z.number() })) })

function handleMessage(event: MessageEvent<unknown>) {
  const parsed = MessageSchema.safeParse(event.data)
  if (!parsed.success) return
  const total = parsed.data.items.reduce((s, i) => s + i.price, 0) // number
  updateTotal(total)
}
```

### 실수 4: 함수가 필요 이상을 요구하기

```ts
function printShippingLabel(member: Member) {
  // 실제로 쓰는 것은 name, address뿐
  return `${member.name} / ${member.address}`
}
```

왜 틀렸나: 비회원 주문처럼 `Member`가 아닌 곳에서 이름·주소만 가진 값으로는 부를 수 없습니다. 테스트할 때도 `Member` 전체를 만들어야 합니다.

고친 코드: 필요한 속성만 요구합니다.

```ts
function printShippingLabel(to: Pick<Member, 'name' | 'address'>) {
  return `${to.name} / ${to.address}`
}
```

### 실수 5: 선택 속성으로 관계를 표현하기

```ts
interface ApiResult<T> {
  success: boolean
  data?: T
}

function getName(r: ApiResult<{ name: string }>) {
  return r.data.name
  // ❌ 'r.data' is possibly 'undefined'. (TS18048)
}
```

왜 틀렸나: "`success`가 `true`면 `data`가 있다"는 관계를 타입이 모릅니다. `success`를 확인해도 `data`가 좁혀지지 않습니다.

고친 코드: 관계를 판별 유니온으로 드러냅니다.

```ts
type ApiResult<T> = { success: true; data: T } | { success: false; message: string }

function getName(r: ApiResult<{ name: string }>) {
  return r.success ? r.data.name : null
}
```

## 직접 해 보기

### 문제 1 ⭐ 너무 넓은 타입 찾기

다음 타입에서 너무 넓은 부분을 모두 찾아 고치세요.

```ts
interface Coupon {
  code: string
  type: string // 'RATE'(비율 할인) 또는 'AMOUNT'(금액 할인)
  value: number
  data: any
}
```

::: details 정답 보기
```ts
interface Coupon {
  code: string
  type: 'RATE' | 'AMOUNT'
  value: number
  data: unknown // 정말 정체를 모르는 값이라면 unknown. 모양을 안다면 구체적인 타입으로
}
```

더 나아가 `type`에 따라 `value`의 뜻이 달라지므로(비율 vs 금액) 판별 유니온이 더 정확합니다.

```ts
type Coupon =
  | { code: string; type: 'RATE'; rate: number } // 0.1 = 10%
  | { code: string; type: 'AMOUNT'; amount: number } // 2000 = 2,000원
```
:::

### 문제 2 ⭐ RemoteData로 바꾸기

다음 회원 정보 상태를 `RemoteData`로 바꾸고, 상태별 메시지를 돌려주는 `memberMessage` 함수를 완전성 검사와 함께 작성하세요.

```ts
let isLoading = false
let errorMessage: string | null = null
let member: Member | null = null
```

::: details 정답 보기
```ts
let memberState: RemoteData<Member> = { status: 'idle' }

function memberMessage(state: RemoteData<Member>): string {
  switch (state.status) {
    case 'idle':
      return '로그인이 필요합니다'
    case 'loading':
      return '회원 정보를 불러오는 중…'
    case 'success':
      return `${state.data.name}님 환영합니다`
    case 'error':
      return `회원 정보를 불러오지 못했습니다: ${state.error}`
    default: {
      const unreachable: never = state
      return unreachable
    }
  }
}

memberState = { status: 'loading' }
console.log(memberMessage(memberState))
// 출력: 회원 정보를 불러오는 중…
```
:::

### 문제 3 ⭐⭐ 매장 ID와 주문 번호 브랜드

`StoreId`(양의 정수)와 `OrderNo`(`A-` 다음 숫자 4자리 이상, 예: `A-1001`) 브랜드 타입과, 검사 후 만들어 주는 `toStoreId`, `toOrderNo`를 작성하세요. 그리고 `findOrder(storeId: StoreId, orderNo: OrderNo)`에 인자를 거꾸로 넣으면 오류가 나는지 확인하세요.

::: details 정답 보기
```ts
type StoreId = Brand<number, 'StoreId'>
type OrderNo = Brand<string, 'OrderNo'>

function toStoreId(value: number): StoreId {
  if (!Number.isInteger(value) || value <= 0) throw new Error(`잘못된 매장 ID: ${value}`)
  return value as StoreId
}

function toOrderNo(value: string): OrderNo {
  if (!/^A-\d{4,}$/.test(value)) throw new Error(`잘못된 주문 번호: ${value}`)
  return value as OrderNo
}

function findOrder(storeId: StoreId, orderNo: OrderNo): string {
  return `매장 ${storeId}의 주문 ${orderNo}`
}

const storeId = toStoreId(12)
const orderNo = toOrderNo('A-1001')
console.log(findOrder(storeId, orderNo))
// 출력: 매장 12의 주문 A-1001

findOrder(orderNo, storeId)
// ❌ Argument of type 'OrderNo' is not assignable to parameter of type 'StoreId'. (TS2345)
```

`OrderNo`는 원래 타입이 `string`이고 `StoreId`는 `number`라서 브랜드 없이도 섞이지 않지만, `OrderNo`를 쓰면 "형식 검사를 통과한 문자열"이라는 정보까지 타입에 담깁니다. 아무 문자열이나 `findOrder`에 넣을 수 없게 됩니다.
:::

### 문제 4 ⭐⭐ 결과 타입으로 바꾸기

다음 함수는 재고가 부족하면 `null`을 돌려줍니다. 호출한 쪽은 **왜** 실패했는지 알 수 없습니다. `Result` 타입으로 바꿔 실패 이유(`'OUT_OF_STOCK' | 'INVALID_QUANTITY'`)를 돌려주고, 이유별 메시지를 `Record`로 만드세요.

```ts
function reserveStock(stock: number, quantity: number): number | null {
  if (quantity <= 0 || stock < quantity) return null
  return stock - quantity
}
```

::: details 정답 보기
```ts
type ReserveError = 'OUT_OF_STOCK' | 'INVALID_QUANTITY'

function reserveStock(stock: number, quantity: number): Result<number, ReserveError> {
  if (!Number.isInteger(quantity) || quantity <= 0) return { ok: false, error: 'INVALID_QUANTITY' }
  if (stock < quantity) return { ok: false, error: 'OUT_OF_STOCK' }
  return { ok: true, value: stock - quantity }
}

const reserveMessages: Record<ReserveError, string> = {
  OUT_OF_STOCK: '재고가 부족합니다.',
  INVALID_QUANTITY: '수량은 1 이상의 정수여야 합니다.',
}

const results = [reserveStock(10, 3), reserveStock(2, 5), reserveStock(10, 0)]
for (const r of results) {
  console.log(r.ok ? `남은 재고 ${r.value}` : reserveMessages[r.error])
}
// 출력: 남은 재고 7
// 출력: 재고가 부족합니다.
// 출력: 수량은 1 이상의 정수여야 합니다.
```

`ReserveError`에 새 이유를 추가하면 `reserveMessages`에 메시지를 빠뜨렸을 때 컴파일 오류가 납니다.
:::

### 문제 5 ⭐⭐⭐ 주문 상태 리팩터링

다음 주문 타입을 이 레슨의 원칙으로 리팩터링하세요.

```ts
interface Order {
  orderNo: string
  status: string // 'READY' | 'PAID' | 'SHIPPED' | 'CANCELED'
  paidAt?: Date // PAID 이후에만
  trackingNo?: string // SHIPPED일 때만
  cancelReason?: string // CANCELED일 때만
}
```

조건:

- `status`별로 필요한 정보만 **필수로** 갖게 합니다. `SHIPPED`는 결제도 끝난 상태이므로 `paidAt`도 있어야 합니다.
- 주문 번호는 문제 3의 `OrderNo`를 씁니다.
- 상태별 안내 문구를 돌려주는 `orderStatusText`를 완전성 검사와 함께 작성합니다.

::: details 정답 보기
```ts
type OrderBase = { orderNo: OrderNo }

type Order =
  | (OrderBase & { status: 'READY' })
  | (OrderBase & { status: 'PAID'; paidAt: Date })
  | (OrderBase & { status: 'SHIPPED'; paidAt: Date; trackingNo: string })
  | (OrderBase & { status: 'CANCELED'; cancelReason: string })

function orderStatusText(order: Order): string {
  switch (order.status) {
    case 'READY':
      return `${order.orderNo} 결제 대기`
    case 'PAID':
      return `${order.orderNo} 결제 완료 (${order.paidAt.toISOString().slice(0, 10)})`
    case 'SHIPPED':
      return `${order.orderNo} 배송 중, 송장 ${order.trackingNo}`
    case 'CANCELED':
      return `${order.orderNo} 취소됨: ${order.cancelReason}`
    default: {
      const unreachable: never = order
      return unreachable
    }
  }
}

console.log(orderStatusText({ orderNo: toOrderNo('A-1001'), status: 'SHIPPED', paidAt: new Date('2026-10-28T00:00:00Z'), trackingNo: '6012-3456' }))
// 출력: A-1001 배송 중, 송장 6012-3456
console.log(orderStatusText({ orderNo: toOrderNo('A-1002'), status: 'CANCELED', cancelReason: '고객 요청' }))
// 출력: A-1002 취소됨: 고객 요청
```

공통 속성은 `OrderBase`로 빼고 `&`로 합쳤습니다. `{ status: 'SHIPPED', ... }`에서 `trackingNo`를 빠뜨리면 컴파일 오류가 납니다. 서버 응답이라면 같은 모양을 `z.discriminatedUnion('status', [...])`으로 만들어 경계에서 검증합니다.
:::

## 확인 퀴즈

1. `{ isLoading: boolean; error: string | null; data: T | null }`가 왜 나쁜 설계인가요?
2. 브랜드 타입의 `__brand` 속성은 실행 중에 실제로 존재하나요?
3. `any`와 `unknown`의 가장 큰 차이는 무엇인가요?
4. "받을 때는 넓게, 돌려줄 때는 구체적으로"에서 "넓게"는 `any`를 쓰라는 뜻인가요?
5. 예상 가능한 업무 실패(쿠폰 만료 등)를 `throw` 대신 `Result` 타입으로 돌려주면 무엇이 좋은가요?

::: details 정답 보기
1. 의미 있는 상태는 4가지인데 8가지 조합을 허용해서, 불가능한 상태를 막지 못하고 쓰는 곳마다 방어 코드가 필요해지기 때문입니다.
2. 아닙니다. 타입에만 있는 꼬리표이고, 실행 중에는 원래 값(숫자·문자열) 그대로입니다.
3. `any`는 검사를 끄고 주변으로 번지며, `unknown`은 좁히기 전까지 아무 작업도 허용하지 않습니다.
4. 아닙니다. 함수가 실제로 쓰는 속성만 요구한다는 뜻입니다(예: `CartItem[]` 대신 `{ price; quantity }[]`).
5. 실패 가능성과 이유가 시그니처에 드러나서, 호출한 쪽이 처리를 잊으면 타입으로 알 수 있고 이유별로 정확히 분기할 수 있습니다.
:::

## 정리

- **불가능한 상태를 표현할 수 없게** 설계합니다. 관련된 boolean·선택 속성 묶음은 판별 유니온으로 바꿉니다.
- 로딩 상태는 `RemoteData<T>`(`idle`/`loading`/`success`/`error`)로 표현하고 `never`로 완전성 검사를 합니다.
- 섞이면 사고가 나는 같은 타입의 값(여러 ID 등)은 **브랜드 타입**으로 구별하고, 검사 함수 한 곳에서만 만듭니다.
- 모르는 값은 `any`가 아니라 `unknown`입니다. 타입은 실제로 가능한 값의 집합과 맞게, 너무 넓지도 좁지도 않게 정합니다.
- 함수는 필요한 만큼만 요구하고, boolean 여러 개는 옵션 객체로, 예상 가능한 실패는 `Result` 타입으로 드러냅니다.
- 바깥 값은 **경계에서 한 번** 검증해 타입을 붙이고, 안쪽에서는 타입을 믿습니다.

## 다음 단계

[프로젝트 1: 콘솔 가계부 (Node CLI)](../part8-projects/01-cli-budget) — Part 8에서는 지금까지 배운 것을 묶어 혼자 힘으로 동작하는 프로그램을 완성합니다.
