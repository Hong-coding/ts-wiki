---
title: 안티패턴과 코드 리뷰 체크리스트
---

# 안티패턴과 코드 리뷰 체크리스트

<LessonMeta level="마스터" :minutes="50" prev="에러 코드로 원인을 찾아 고치는 법(에러 사전)" />

## 이번에 배울 것

- 컴파일 에러는 나지 않지만 위험한 TypeScript 코드(안티패턴) 17가지를 알아볼 수 있다.
- 각 안티패턴을 **왜 위험한지** 근거를 들어 설명하고, 더 안전한 코드로 바꿀 수 있다.
- 타입 안전성 · 가독성 · 보안 관점의 체크리스트로 남의 코드를 리뷰할 수 있다.
- 리뷰 코멘트를 "취향"이 아니라 "위험과 대안"으로 쓸 수 있다.

## 먼저 알아 둘 것

- [특수 타입: any · unknown · never · void](../part2-types/02-special-types)
- [타입 단언(as)과 non-null 단언(!)](../part2-types/10-assertion)
- [판별 유니온과 완전성 검사](../part3-intermediate/03-discriminated-union)
- [런타임 검증: 타입은 실행 중에 사라진다 (zod)](../part4-async/05-runtime-validation)
- [좋은 타입 설계 원칙과 패턴](../part7-practice/07-type-design)

## 비유로 이해하기

건물 안전 점검을 떠올려 봅시다. 비상구 앞에 상자를 쌓아 둔 건물도 **평소에는 아무 문제 없이** 돌아갑니다. 문제는 불이 났을 때 드러납니다. 점검원은 "지금 잘 돌아가는가"가 아니라 **"사고가 나면 어떻게 되는가"** 를 봅니다.

안티패턴(anti-pattern, 흔히 쓰이지만 결과가 나쁜 해결 방식)도 같습니다. `as any`로 덮은 코드는 오늘 잘 동작합니다. 그러다 서버 응답 형식이 바뀌거나 새 상태가 추가되는 날, 컴파일러는 아무 경고도 하지 못하고 운영 환경에서 사고가 납니다.

코드 리뷰어는 건물 점검원입니다. 이 레슨은 점검표를 만드는 레슨입니다.

## 개념 설명

### 안티패턴을 판단하는 세 가지 질문

어떤 코드가 안티패턴인지 헷갈릴 때는 다음 세 가지를 물어봅니다.

1. **거짓말하는 타입인가?** — 타입이 말하는 것과 실행 중 실제 값이 다를 수 있는가?
2. **변경에 약한가?** — 상태·필드가 하나 추가되면 컴파일러가 고칠 곳을 알려 주는가?
3. **읽는 사람이 추측해야 하는가?** — 어떤 조합이 가능한지 타입만 보고 알 수 있는가?

아래 안티패턴은 모두 이 셋 중 하나 이상에 걸립니다.

---

### 1. `any` 남발

```ts
function getTotal(order: any): number {
  return order.items.reduce((sum: any, item: any) => sum + item.price * item.qty, 0)
}
// 오타(itmes)를 내도, 필드 이름이 바뀌어도 컴파일러는 아무 말도 하지 않습니다.
```

**왜 위험한가**: `any`는 타입 검사를 **꺼 버리는** 스위치입니다. 게다가 `any`는 전염됩니다. `any`에서 꺼낸 값도 `any`라서 검사받지 않는 범위가 코드 전체로 퍼집니다.

**좋은 예**: 모양을 알면 타입을 정의하고, 정말 모르면 `unknown`으로 받아 좁힙니다.

```ts
interface OrderItem {
  price: number
  qty: number
}
interface Order {
  items: OrderItem[]
}
function getTotal(order: Order): number {
  return order.items.reduce((sum, item) => sum + item.price * item.qty, 0)
}
console.log(getTotal({ items: [{ price: 4500, qty: 2 }, { price: 5000, qty: 1 }] }))
// 출력: 14000
```

::: tip 리뷰 기준
`any`가 보이면 "`unknown`이나 구체 타입으로 바꿀 수 있나요?"라고 묻습니다. 정말 필요한 경우(타입 정의가 없는 레거시 연동 등)에는 **이유를 주석으로** 남기게 합니다. typescript-eslint의 `no-explicit-any` 규칙으로 자동 검출할 수 있습니다([ESLint와 Prettier](../part6-tooling/04-eslint-prettier)).
:::

### 2. `as` 남발 (특히 외부 데이터)

```ts
interface Member {
  id: string
  point: number
}
const body = '{"id":"M001","point":"1200"}' // 서버가 point를 문자열로 보냄
const member = JSON.parse(body) as Member
console.log(member.point + 100)
// 출력: 1200100
```

**왜 위험한가**: `as`는 값을 검사하지도 바꾸지도 않습니다. "믿어 달라"는 약속일 뿐입니다. 서버가 `point`를 문자열로 보내자 덧셈이 **문자열 이어 붙이기**가 되어 `1200100`이 나왔습니다. 컴파일러는 아무 경고도 하지 않았습니다.

**좋은 예**: 외부 데이터는 `unknown`으로 받아 **검증 함수**(또는 zod)로 확인한 뒤 타입을 붙입니다.

```ts
interface Member {
  id: string
  point: number
}
function parseMember(value: unknown): Member {
  if (
    typeof value === 'object' && value !== null &&
    'id' in value && typeof value.id === 'string' &&
    'point' in value && typeof value.point === 'number'
  ) {
    return { id: value.id, point: value.point }
  }
  throw new Error('회원 데이터 형식이 올바르지 않습니다')
}
try {
  const member = parseMember(JSON.parse('{"id":"M001","point":"1200"}'))
  console.log(member.point + 100)
} catch (e) {
  console.log(e instanceof Error ? e.message : e)
}
// 출력: 회원 데이터 형식이 올바르지 않습니다
```

`as`가 정당한 경우는 **내가 컴파일러보다 확실히 더 많이 아는** 좁은 상황(예: `as const`, DOM 요소 종류를 확신할 때)뿐입니다. 객체 리터럴에 타입을 확인받고 싶다면 `as` 대신 `satisfies`(TypeScript 4.9부터)를 씁니다.

### 3. `!`(non-null 단언) 남발

```ts
const carts = new Map<string, string[]>()
function addItem(memberId: string, productId: string): void {
  carts.get(memberId)!.push(productId) // 장바구니가 없으면 실행 중 TypeError
}
```

**왜 위험한가**: `!`는 "`null`·`undefined`가 아니다"라고 컴파일러를 설득할 뿐, 실제로 확인하지 않습니다. 처음 담는 회원이라면 `undefined.push`가 되어 프로그램이 멈춥니다.

**좋은 예**: 없을 때의 처리를 코드로 씁니다.

```ts
const carts = new Map<string, string[]>()
function addItem(memberId: string, productId: string): void {
  const cart = carts.get(memberId) ?? []
  cart.push(productId)
  carts.set(memberId, cart)
}
addItem('M001', 'P001')
addItem('M001', 'P002')
console.log(carts.get('M001'))
// 출력: [ 'P001', 'P002' ]
```

### 4. 불필요한 제네릭

```ts
function printName<T extends { name: string }>(item: T): void {
  console.log(item.name)
}
function toText<T>(value: T): string {
  return String(value)
}
```

**왜 위험한가**: 제네릭은 **입력과 출력(또는 여러 매개변수) 사이의 관계**를 표현하는 도구입니다. 타입 매개변수 `T`가 **한 번만** 쓰이면 관계가 없으므로 제네릭이 필요 없습니다. 읽는 사람만 헷갈립니다.

**좋은 예**:

```ts
function printName(item: { name: string }): void {
  console.log(item.name)
}
function toText(value: unknown): string {
  return String(value)
}

// 제네릭이 필요한 경우: 입력 타입이 출력 타입을 결정함
function first<T>(items: T[]): T | undefined {
  return items[0]
}
printName({ name: '아메리카노' })
console.log(toText(4500), first(['P001', 'P002']))
// 출력: 아메리카노
// 출력: 4500 P001
```

### 5. enum 남용

```ts
enum OrderStatus {
  Ready,
  Paid,
  Canceled,
}
function cancel(status: OrderStatus): void {
  console.log('취소 처리', status)
}
cancel(OrderStatus.Paid)
const fromDb: number = 99 // DB에서 읽은 숫자
cancel(fromDb) // number 타입 값은 숫자 enum 자리에 그대로 들어감
// 출력: 취소 처리 1
// 출력: 취소 처리 99
```

**왜 위험한가**: 숫자 enum은 로그·DB에 `1`, `2` 같은 숫자로 남아 뜻을 알기 어렵고, 순서를 바꾸면 값이 조용히 바뀝니다. 또한 enum은 타입만이 아니라 **실행 코드(객체)를 만들어 내는** 몇 안 되는 TS 문법이라, `isolatedModules`·타입 제거 방식의 실행 도구(Node.js의 타입 제거 기능 등)와 잘 맞지 않습니다.

**좋은 예**: 리터럴 유니온이나 `as const` 객체를 씁니다.

```ts
const ORDER_STATUS = {
  READY: 'READY',
  PAID: 'PAID',
  CANCELED: 'CANCELED',
} as const
type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS] // 'READY' | 'PAID' | 'CANCELED'

function cancel(status: OrderStatus): void {
  console.log('취소 처리', status)
}
cancel(ORDER_STATUS.PAID)
cancel('PAID') // 문자열 그대로도 가능
// 출력: 취소 처리 PAID
// 출력: 취소 처리 PAID
```

::: info enum이 무조건 나쁜 것은 아닙니다
팀 컨벤션으로 문자열 enum을 쓰고 있다면 그대로 일관되게 쓰는 편이 낫습니다. 문제는 "습관적으로 숫자 enum부터 만드는 것"입니다. 자세한 비교는 [열거형(enum)과 그 대안](../part2-types/09-enum)을 보세요.
:::

### 6. 거대한 옵션 객체

```ts
interface ReceiptOptions {
  printer?: string
  copies?: number
  showLogo?: boolean
  logoUrl?: string
  email?: string
  sendEmail?: boolean
  smsPhone?: string
  sendSms?: boolean
  language?: string
  // ... 20개 더
}
function issueReceipt(orderId: string, options: ReceiptOptions): void {
  console.log(orderId, options)
}
issueReceipt('O001', { sendEmail: true }) // email이 없는데 sendEmail: true?
```

**왜 위험한가**: 모든 것이 선택이라 **말이 안 되는 조합**(이메일 주소 없이 이메일 발송)이 타입을 통과합니다. 함수 안은 `if (options.sendEmail && options.email)` 같은 방어 코드로 가득 차고, 어떤 옵션이 함께 다니는지 문서 없이는 알 수 없습니다.

**좋은 예**: 함께 다니는 옵션을 묶고, 묶음 안에서는 필수로 만듭니다.

```ts
interface PrintOption {
  printer: string
  copies: number
}
type Delivery =
  | { channel: 'EMAIL'; email: string }
  | { channel: 'SMS'; phone: string }

interface ReceiptOptions {
  print?: PrintOption
  delivery?: Delivery
}
function issueReceipt(orderId: string, options: ReceiptOptions): void {
  if (options.delivery?.channel === 'EMAIL') {
    console.log(orderId, '이메일 발송:', options.delivery.email)
  }
}
issueReceipt('O001', { delivery: { channel: 'EMAIL', email: 'kim@example.com' } })
// 출력: O001 이메일 발송: kim@example.com
```

### 7. boolean 플래그 폭발

```ts
interface OrderState {
  isLoading: boolean
  isError: boolean
  isSuccess: boolean
  data?: string[]
  errorMessage?: string
}
// isLoading과 isError가 동시에 true? isSuccess인데 data가 없음?
const weird: OrderState = { isLoading: true, isError: true, isSuccess: true }
```

**왜 위험한가**: boolean 3개는 2 × 2 × 2 = **8가지 조합**을 만들지만, 실제로 말이 되는 상태는 4가지(대기·로딩·성공·실패)뿐입니다. 나머지 4가지 "불가능한 상태"를 화면 코드가 모두 걱정해야 합니다.

**좋은 예**: 판별 유니온으로 **가능한 상태만** 표현합니다.

```ts
type OrderState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: string[] }
  | { status: 'error'; errorMessage: string }

function render(state: OrderState): string {
  switch (state.status) {
    case 'idle':
      return '조회 전'
    case 'loading':
      return '불러오는 중...'
    case 'success':
      return `주문 ${state.data.length}건`
    case 'error':
      return `오류: ${state.errorMessage}`
  }
}
console.log(render({ status: 'success', data: ['O001', 'O002'] }))
// 출력: 주문 2건
```

### 8. 타입과 런타임의 불일치

```ts
interface Product {
  id: string
  price: number
  createdAt: Date // JSON에는 Date가 없습니다!
}
const product: Product = JSON.parse('{"id":"P001","price":4500,"createdAt":"2026-10-26T09:00:00Z"}')
console.log(typeof product.createdAt)
// 출력: string
```

**왜 위험한가**: 타입은 `Date`라고 말하지만 실제 값은 문자열입니다. `product.createdAt.getFullYear()`를 부르면 실행 중에 `TypeError`가 납니다. `JSON.parse`는 `any`를 돌려주므로 이 거짓말을 막지 못합니다. 안티패턴 1·2와 같은 뿌리입니다.

**좋은 예**: **전송 형태(DTO)** 와 **앱 내부 형태**를 나누고, 경계에서 변환합니다.

```ts
interface ProductDto {
  id: string
  price: number
  createdAt: string // JSON 그대로
}
interface Product {
  id: string
  price: number
  createdAt: Date
}
function toProduct(dto: ProductDto): Product {
  return { ...dto, createdAt: new Date(dto.createdAt) }
}
const dto: ProductDto = JSON.parse('{"id":"P001","price":4500,"createdAt":"2026-10-26T09:00:00Z"}')
console.log(toProduct(dto).createdAt.getUTCFullYear())
// 출력: 2026
```

실무에서는 `dto`도 zod 같은 검증 도구로 확인합니다([런타임 검증](../part4-async/05-runtime-validation), [JSON · Date · Map · Set](../part4-async/06-json-date-map-set)).

### 9. `Function` · `Object` · `{}` 타입

```ts
function retry(task: Function, times: number): void {
  for (let i = 0; i < times; i++) task('아무거나', 1, true) // 인수 검사가 전혀 안 됨
}
function save(data: Object): void {
  console.log(data)
}
save(4500) // 숫자도 Object에 들어감
```

**왜 위험한가**: `Function`은 "아무 함수"라서 인수·반환값을 검사하지 않습니다. `Object`와 `{}`는 이름과 달리 "`null`·`undefined`를 뺀 **거의 모든 값**"이라 숫자·문자열도 통과합니다.

**좋은 예**: 함수는 **서명(signature)** 을, 객체는 구체 타입이나 `Record`·`object`를 씁니다.

```ts
function retry(task: () => void, times: number): void {
  for (let i = 0; i < times; i++) task()
}
function save(data: Record<string, unknown>): void {
  console.log(Object.keys(data).length)
}
retry(() => console.log('전송 시도'), 2)
save({ id: 'P001', price: 4500 })
// 출력: 전송 시도
// 출력: 전송 시도
// 출력: 2
```

### 10. 선택 속성 남발

```ts
interface Payment {
  method: 'CARD' | 'CASH'
  cardNumber?: string
  installment?: number
  receivedAmount?: number
  change?: number
}
// 카드 결제인데 cardNumber가 없어도, 현금인데 installment가 있어도 통과
const p: Payment = { method: 'CARD', receivedAmount: 10000 }
```

**왜 위험한가**: "어떤 경우에 어떤 속성이 있는지"가 타입에 드러나지 않아서, 쓰는 곳마다 `?.`와 `if`가 필요해지고 빠뜨리기 쉽습니다. 선택 속성은 "진짜로 있을 수도 없을 수도 있는" 값에만 씁니다.

**좋은 예**: 경우별로 타입을 나눕니다(판별 유니온).

```ts
type Payment =
  | { method: 'CARD'; cardNumber: string; installment: number }
  | { method: 'CASH'; receivedAmount: number; change: number }

function describe(p: Payment): string {
  return p.method === 'CARD'
    ? `카드 ${p.installment}개월`
    : `현금 받은 돈 ${p.receivedAmount}원, 거스름돈 ${p.change}원`
}
console.log(describe({ method: 'CASH', receivedAmount: 10000, change: 1000 }))
// 출력: 현금 받은 돈 10000원, 거스름돈 1000원
```

### 11. `@ts-ignore`로 에러 숨기기

```ts
const price: number = 4500
// @ts-ignore
const label: string = price
```

**왜 위험한가**: `@ts-ignore`는 다음 줄의 **모든** 에러를 영원히 숨깁니다. 나중에 원래 문제가 고쳐져도 주석은 남고, 그 줄에 새로 생긴 다른 에러까지 숨깁니다.

**좋은 예**: 먼저 원인을 고칩니다. 정말 피할 수 없다면(라이브러리 타입 버그 등) `@ts-expect-error`와 **이유**를 씁니다. `@ts-expect-error`는 에러가 없어지면 "이제 이 주석은 필요 없다"고 알려 줍니다.

```ts
const price: number = 4500
const label: string = `${price}원`
console.log(label)
// 출력: 4500원
```

### 12. 같은 타입을 여러 번 복사해 정의

```ts
interface Product {
  id: string
  name: string
  price: number
  stock: number
}
interface ProductListItem {
  id: string
  name: string
  price: number // Product의 price가 string으로 바뀌면? 여기는 그대로 남음
}
```

**왜 위험한가**: 원본이 바뀌어도 복사본은 따라가지 않습니다. 같은 필드인데 타입이 조금씩 다른 "비슷한 타입"이 늘어납니다.

**좋은 예**: 원본에서 **파생**합니다.

```ts
interface Product {
  id: string
  name: string
  price: number
  stock: number
}
type ProductListItem = Pick<Product, 'id' | 'name' | 'price'>
type ProductUpdate = Partial<Omit<Product, 'id'>>

const item: ProductListItem = { id: 'P001', name: '아메리카노', price: 4500 }
const update: ProductUpdate = { stock: 10 }
console.log(item.name, update.stock)
// 출력: 아메리카노 10
```

### 13. 문자열로 모든 것을 표현하기 (stringly typed)

```ts
function setStatus(orderId: string, status: string): void {
  console.log(orderId, status)
}
setStatus('O001', 'cancled') // 오타인데 통과
```

**왜 위험한가**: 정해진 몇 개의 값만 가능한데 `string`으로 열어 두면 오타·대소문자 실수를 컴파일러가 잡지 못합니다.

**좋은 예**: 리터럴 유니온으로 닫습니다.

```ts
type OrderStatus = 'READY' | 'PAID' | 'CANCELED'
function setStatus(orderId: string, status: OrderStatus): void {
  console.log(orderId, status)
}
setStatus('O001', 'CANCELED')
// 출력: O001 CANCELED
```

### 14. 원시 타입 집착 (ID를 모두 `string`으로)

```ts
function addPoint(memberId: string, orderId: string, point: number): void {
  console.log(memberId, orderId, point)
}
const memberId = 'M001'
const orderId = 'O001'
addPoint(orderId, memberId, 100) // 순서가 바뀌었는데 통과
```

**왜 위험한가**: 회원 ID와 주문 ID는 의미가 다른데 둘 다 `string`이라 바꿔 넣어도 모릅니다. 실제로 포인트가 엉뚱한 곳에 쌓이는 버그가 됩니다.

**좋은 예**: 중요한 식별자에는 **브랜드 타입**(branded type, 이름표를 붙인 원시 타입)을 씁니다. 또는 매개변수를 객체로 받아 이름으로 넘깁니다.

```ts
type MemberId = string & { readonly __brand: 'MemberId' }
type OrderId = string & { readonly __brand: 'OrderId' }
const toMemberId = (v: string) => v as MemberId // 검증 후 만드는 곳은 한 군데로 모읍니다
const toOrderId = (v: string) => v as OrderId

function addPoint(memberId: MemberId, orderId: OrderId, point: number): void {
  console.log(memberId, orderId, point)
}
addPoint(toMemberId('M001'), toOrderId('O001'), 100)
// 출력: M001 O001 100
```

### 15. 아무 키나 허용하는 인덱스 시그니처

```ts
interface Settings {
  [key: string]: any
}
const settings: Settings = { taxRate: 0.1 }
console.log(settings.taxRat * 1000) // 오타인데 통과, 결과는 NaN
```

**왜 위험한가**: 어떤 키든, 어떤 값이든 허용하므로 사실상 `any`와 같습니다.

**좋은 예**: 알려진 키는 이름으로 정의하고, 정말 동적인 부분만 `Record`로 둡니다.

```ts
interface Settings {
  taxRate: number
  storeName: string
  extra: Record<string, string | undefined> // 동적인 부분만 분리
}
const settings: Settings = { taxRate: 0.1, storeName: '강남점', extra: {} }
console.log(settings.taxRate * 1000)
// 출력: 100
```

### 16. 기다리지 않는 Promise (floating promise)

```ts
async function saveOrder(orderId: string): Promise<void> {
  throw new Error(`${orderId} 저장 실패`)
}
function onClickSave(): void {
  saveOrder('O001') // await도 catch도 없음: 실패를 아무도 모름
  console.log('저장 완료!')
}
```

**왜 위험한가**: Promise를 기다리지 않으면 실패해도 화면은 "저장 완료"를 보여 주고, 에러는 처리되지 않은 거부(unhandled rejection)로 사라지거나 Node.js에서는 프로세스를 종료시킵니다. TypeScript 컴파일러는 이것을 에러로 보지 않습니다.

**좋은 예**: `await`하고 `try/catch`로 처리합니다. typescript-eslint의 `no-floating-promises` 규칙(타입 정보를 쓰는 규칙)으로 자동 검출할 수 있습니다.

```ts
async function saveOrder(orderId: string): Promise<void> {
  throw new Error(`${orderId} 저장 실패`)
}
async function onClickSave(): Promise<void> {
  try {
    await saveOrder('O001')
    console.log('저장 완료!')
  } catch (e) {
    console.log(e instanceof Error ? e.message : '알 수 없는 오류')
  }
}
onClickSave()
// 출력: O001 저장 실패
```

### 17. 지나치게 영리한 타입

```ts
type DeepKeys<T> = T extends object
  ? { [K in keyof T & string]: K | `${K}.${DeepKeys<T[K]>}` }[keyof T & string]
  : never
// 화면 하나에서 한 번 쓰려고 만든 재귀 타입. 팀원 누구도 고치지 못합니다.
```

**왜 위험한가**: 타입 레벨 프로그래밍은 강력하지만, **읽고 고칠 수 있는 사람이 적고** 타입 검사 속도도 느려집니다([대규모 코드베이스](./03-large-codebase)). 라이브러리라면 가치가 있지만, 업무 코드에서 한두 번 쓰려고 만든 복잡한 타입은 비용이 이익보다 큽니다.

**좋은 예**: 먼저 단순한 타입(리터럴 유니온 직접 나열 등)으로 충분한지 검토합니다. 복잡한 타입이 꼭 필요하면 **테스트**(타입 테스트)와 **사용 예 주석**을 함께 둡니다.

```ts
type ProductSortKey = 'name' | 'price' | 'createdAt' // 직접 나열: 누구나 읽고 고칠 수 있음
function sortBy(key: ProductSortKey): string {
  return `ORDER BY ${key}`
}
console.log(sortBy('price'))
// 출력: ORDER BY price
```

---

### 코드 리뷰 체크리스트

리뷰할 때 아래 표를 위에서부터 훑습니다. 모든 항목을 매번 볼 필요는 없고, **변경된 코드와 관계있는 항목**만 봅니다.

#### A. 타입 안전성

| 확인 항목 | 위험 신호 | 관련 |
|---|---|---|
| `any`가 새로 생겼는가 | `: any`, `as any`, `<any>` | 안티패턴 1 |
| 외부 데이터에 검증이 있는가 | `JSON.parse(...) as T`, `res.json() as T` | 안티패턴 2·8 |
| `!`의 근거가 있는가 | `.get(x)!`, `querySelector(...)!` | 안티패턴 3 |
| 불가능한 상태가 표현되는가 | boolean 여러 개, 선택 속성 다수 | 안티패턴 7·10 |
| 새 유니온 멤버를 추가하면 컴파일러가 알려 주는가 | `switch`에 `never` 검사 없음 | [판별 유니온](../part3-intermediate/03-discriminated-union) |
| 에러 숨김 주석이 있는가 | `@ts-ignore`, 이유 없는 `@ts-expect-error` | 안티패턴 11 |
| Promise를 기다리는가 | `async` 함수를 `await` 없이 호출 | 안티패턴 16 |
| tsconfig의 strict 옵션을 끄지 않았는가 | `"strict": false`, `"noImplicitAny": false` | [strict 옵션](../part6-tooling/02-strict-options) |

#### B. 가독성 · 유지보수

| 확인 항목 | 위험 신호 | 관련 |
|---|---|---|
| 타입이 원본에서 파생되는가 | 같은 필드를 여러 인터페이스에 복사 | 안티패턴 12 |
| 이름이 의미를 담는가 | `data`, `info`, `temp`, `T1` | [좋은 타입 설계](../part7-practice/07-type-design) |
| 제네릭이 꼭 필요한가 | 한 번만 쓰이는 `T` | 안티패턴 4 |
| 타입이 지나치게 복잡하지 않은가 | 3단 이상 중첩된 조건부 타입 | 안티패턴 17 |
| 공개 함수에 반환 타입이 있는가 | 분기가 많은 함수의 추론된 반환 타입 | [타입 표기와 추론](../part2-types/01-annotation-inference) |
| 포맷 변경과 기능 변경이 섞여 있지 않은가 | 수백 줄 diff 중 실제 변경은 몇 줄 | — |

#### C. 보안

타입이 통과해도 보안 문제는 남습니다. TypeScript의 타입은 **실행 중에 사라지므로**, 사용자 입력을 막아 주지 않습니다.

| 확인 항목 | 위험 신호 | 대안 |
|---|---|---|
| 입력 검증 | 요청 body·query를 `as`로 바로 사용 | 스키마(zod 등)로 형식·범위·길이 검증 |
| SQL 인젝션 | 템플릿 문자열로 SQL 조립 | 바인딩 변수(파라미터)로 전달 |
| XSS | `innerHTML`, `dangerouslySetInnerHTML`, `v-html`에 사용자 입력 | `textContent`, 프레임워크 기본 출력(자동 이스케이프) |
| 인증·인가 | 화면에서만 권한 확인, 서버는 ID만 믿음 | 서버에서 **요청한 사람이 그 자원의 주인인지** 확인 |
| 민감 정보 로깅 | 카드번호·비밀번호·토큰·주민번호를 `console.log`·로그에 출력 | 마스킹 후 기록, 필요 없는 필드는 아예 빼기 |
| 시크릿 하드코딩 | 코드에 API 키·DB 비밀번호 | 환경 변수·비밀 관리 도구 |

아래는 보안 항목을 코드로 본 예입니다.

**SQL 인젝션**: 사용자 입력을 SQL 문자열에 이어 붙이면, 입력값에 SQL 문법을 넣어 쿼리를 바꿀 수 있습니다.

```ts
// DB 라이브러리의 query 함수 모양만 흉내 낸 선언 (실제로는 pg, mysql2 등)
declare function query(sql: string, params?: unknown[]): Promise<unknown[]>

// ❌ 나쁜 예: keyword에 "' OR '1'='1" 이 들어오면 모든 행이 조회됨
async function searchBad(keyword: string) {
  return query(`SELECT * FROM product WHERE name = '${keyword}'`)
}

// ✅ 좋은 예: 값은 SQL과 분리해 파라미터로 전달 (PostgreSQL은 $1, MySQL은 ?)
async function searchGood(keyword: string) {
  return query('SELECT * FROM product WHERE name = $1', [keyword])
}
```

**XSS**(Cross-Site Scripting, 남의 화면에 악성 스크립트를 심는 공격): 사용자가 쓴 상품 후기를 HTML로 그대로 넣으면 후기 안의 스크립트가 다른 사람 브라우저에서 실행됩니다.

```ts
function renderReviewBad(el: HTMLElement, review: string): void {
  el.innerHTML = review // ❌ '<img src=x onerror="...">'가 실행됨
}
function renderReviewGood(el: HTMLElement, review: string): void {
  el.textContent = review // ✅ 글자로만 표시됨
}
```

**민감 정보 로깅**: 장애 분석용 로그에 결제 정보를 그대로 남기면, 로그를 볼 수 있는 모든 사람이 카드번호를 보게 됩니다.

```ts
interface PaymentRequest {
  orderId: string
  cardNumber: string
  amount: number
}
function maskCard(cardNumber: string): string {
  return cardNumber.replace(/\d(?=\d{4})/g, '*') // 마지막 4자리만 남김
}
function logPayment(req: PaymentRequest): void {
  // console.log(req) 대신, 필요한 필드만 마스킹해서 기록
  console.log({ orderId: req.orderId, card: maskCard(req.cardNumber), amount: req.amount })
}
logPayment({ orderId: 'O001', cardNumber: '1234567812345678', amount: 9000 })
// 출력: { orderId: 'O001', card: '************5678', amount: 9000 }
```

### 리뷰 코멘트 쓰는 법

같은 지적도 쓰는 방식에 따라 받아들여지는 정도가 다릅니다. **위험 + 대안 + 근거** 순서로 씁니다.

```text
❌ "as 쓰지 마세요."

✅ "[필수] 서버 응답을 as Member로 단언하고 있어서, point가 문자열로 오면 덧셈이
    문자열 이어 붙이기가 됩니다(실제로 1200100). parseMember 같은 검증 함수나
    zod 스키마로 확인해 주세요. 참고: 안티패턴 2"
```

- `[필수]`(머지 전에 고쳐야 함), `[권장]`(고치면 좋음), `[질문]`(의도를 묻는 것)처럼 **중요도 표시**를 붙이면 작성자가 우선순위를 정하기 쉽습니다.
- 취향 문제(따옴표 종류, 줄바꿈)는 사람이 아니라 Prettier·ESLint가 지적하게 합니다.

## 자주 하는 실수

### 실수 1: `any`를 `unknown`으로 바꾸고 `as`로 꺼내기

```ts
function handle(data: unknown): number {
  return (data as { price: number }).price // unknown의 의미가 사라짐
}
```

**왜 틀렸나**: `unknown`의 가치는 "확인하기 전에는 못 쓴다"는 데 있습니다. 바로 `as`로 꺼내면 `any`와 다를 바 없습니다.

**고친 코드**

```ts
function handle(data: unknown): number {
  if (typeof data === 'object' && data !== null && 'price' in data && typeof data.price === 'number') {
    return data.price
  }
  throw new Error('price가 없습니다')
}
console.log(handle({ price: 4500 }))
// 출력: 4500
```

### 실수 2: 판별 유니온을 만들고 판별 속성을 선택으로 두기

```ts
type Payment =
  | { method?: 'CARD'; cardNumber: string }
  | { method?: 'CASH'; receivedAmount: number }
```

**왜 틀렸나**: 판별 속성(`method`)이 없을 수 있으면 TypeScript가 어느 쪽인지 좁히지 못합니다. 판별 속성은 **반드시 필수**입니다.

**고친 코드**

```ts
type Payment =
  | { method: 'CARD'; cardNumber: string }
  | { method: 'CASH'; receivedAmount: number }

function amountText(p: Payment): string {
  return p.method === 'CASH' ? `${p.receivedAmount}원` : '카드'
}
console.log(amountText({ method: 'CASH', receivedAmount: 10000 }))
// 출력: 10000원
```

### 실수 3: 리뷰에서 타입만 보고 보안을 놓치기

```ts
interface SearchQuery {
  keyword: string
}
function buildSql(q: SearchQuery): string {
  return `SELECT * FROM member WHERE name LIKE '%${q.keyword}%'`
}
```

**왜 틀렸나**: 타입은 완벽합니다(`keyword: string`). 하지만 `string` 타입은 **내용**을 검사하지 않으므로 SQL 인젝션에 그대로 열려 있습니다. "타입이 맞다"와 "안전하다"는 다른 질문입니다.

**고친 코드**

```ts
interface SearchQuery {
  keyword: string
}
function buildSql(q: SearchQuery): { sql: string; params: string[] } {
  return { sql: 'SELECT * FROM member WHERE name LIKE $1', params: [`%${q.keyword}%`] }
}
console.log(buildSql({ keyword: '김' }).params)
// 출력: [ '%김%' ]
```

## 직접 해 보기

### 문제 1 ⭐ 안티패턴 찾기

다음 코드에서 안티패턴을 두 가지 이상 찾아 이름을 붙여 보세요.

```ts
function applyCoupon(order: any, coupon: Function): void {
  const result = coupon(order.total)
  order.total = result
}
```

::: details 정답 보기
- **`any` 남발**(1): `order`의 모양을 알 수 없어 `order.totla` 같은 오타도 통과합니다.
- **`Function` 타입**(9): `coupon`에 어떤 인수를 넘기고 무엇을 돌려받는지 알 수 없습니다.

```ts
interface Order {
  total: number
}
type Coupon = (total: number) => number

function applyCoupon(order: Order, coupon: Coupon): void {
  order.total = coupon(order.total)
}
const order = { total: 10000 }
applyCoupon(order, (t) => t - 1000)
console.log(order.total)
// 출력: 9000
```
:::

### 문제 2 ⭐⭐ boolean 플래그를 판별 유니온으로

다음 상태 타입을 판별 유니온으로 바꾸고, 상태별 안내 문구를 돌려주는 함수를 작성해 보세요.

```ts
interface PaymentState {
  isPaying: boolean
  isPaid: boolean
  isFailed: boolean
  approvalNo?: string
  failReason?: string
}
```

::: details 정답 보기

```ts
type PaymentState =
  | { status: 'ready' }
  | { status: 'paying' }
  | { status: 'paid'; approvalNo: string }
  | { status: 'failed'; failReason: string }

function message(state: PaymentState): string {
  switch (state.status) {
    case 'ready':
      return '결제 대기'
    case 'paying':
      return '결제 중...'
    case 'paid':
      return `승인번호 ${state.approvalNo}`
    case 'failed':
      return `결제 실패: ${state.failReason}`
  }
}
console.log(message({ status: 'paid', approvalNo: 'A12345' }))
// 출력: 승인번호 A12345
```

`approvalNo`는 `paid`일 때만, `failReason`은 `failed`일 때만 존재하므로 선택 속성(`?`)이 모두 사라졌습니다.
:::

### 문제 3 ⭐⭐ 타입 파생

`Member`에서 파생해 ① 목록용 `MemberSummary`(`id`, `name`만), ② 수정 요청용 `MemberUpdate`(`id`를 뺀 나머지가 모두 선택)를 만들어 보세요.

```ts
interface Member {
  id: string
  name: string
  phone: string
  point: number
}
```

::: details 정답 보기

```ts
interface Member {
  id: string
  name: string
  phone: string
  point: number
}
type MemberSummary = Pick<Member, 'id' | 'name'>
type MemberUpdate = Partial<Omit<Member, 'id'>>

const summary: MemberSummary = { id: 'M001', name: '김민지' }
const update: MemberUpdate = { point: 1500 }
console.log(summary.name, update.point)
// 출력: 김민지 1500
```
:::

### 문제 4 ⭐⭐⭐ 보안 리뷰

다음 Express 핸들러 일부를 리뷰해, 보안 문제를 세 가지 찾고 각각 어떻게 고칠지 적어 보세요.

```ts
// 요청 객체 모양만 흉내 낸 선언
interface Req {
  body: unknown
  headers: Record<string, string | undefined>
}
declare function query(sql: string, params?: unknown[]): Promise<unknown[]>

async function updateMemberPhone(req: Req): Promise<void> {
  const body = req.body as { memberId: string; phone: string }
  console.log('요청', req.headers, body)
  await query(`UPDATE member SET phone = '${body.phone}' WHERE id = '${body.memberId}'`)
}
```

::: details 정답 보기
1. **입력 검증 없음**: `req.body as { ... }`는 아무것도 확인하지 않습니다. 스키마로 `memberId` 형식과 `phone` 형식(숫자·하이픈, 길이)을 검증합니다.
2. **SQL 인젝션**: 템플릿 문자열로 SQL을 조립합니다. `query('UPDATE member SET phone = $1 WHERE id = $2', [phone, memberId])`처럼 파라미터로 넘깁니다.
3. **민감 정보 로깅**: `req.headers`에는 보통 `authorization`(인증 토큰)·쿠키가 들어 있고, `body.phone`은 개인정보입니다. 필요한 값만 마스킹해서 기록합니다.
4. (추가) **인가 확인 없음**: 요청한 사람이 `memberId`의 본인(또는 관리자)인지 서버에서 확인하지 않으면, 남의 전화번호를 바꿀 수 있습니다.

```ts
interface Req {
  body: unknown
  headers: Record<string, string | undefined>
}
declare function query(sql: string, params?: unknown[]): Promise<unknown[]>
declare function getLoginMemberId(req: Req): string // 인증 미들웨어가 넣어 준 로그인 정보

function parseBody(body: unknown): { memberId: string; phone: string } {
  if (
    typeof body === 'object' && body !== null &&
    'memberId' in body && typeof body.memberId === 'string' && /^M\d{3,10}$/.test(body.memberId) &&
    'phone' in body && typeof body.phone === 'string' && /^01\d-?\d{3,4}-?\d{4}$/.test(body.phone)
  ) {
    return { memberId: body.memberId, phone: body.phone }
  }
  throw new Error('요청 형식 오류')
}

async function updateMemberPhone(req: Req): Promise<void> {
  const { memberId, phone } = parseBody(req.body)
  if (getLoginMemberId(req) !== memberId) throw new Error('권한 없음')
  console.log('전화번호 변경', { memberId, phone: phone.slice(0, 3) + '-****-****' })
  await query('UPDATE member SET phone = $1 WHERE id = $2', [phone, memberId])
}
```
:::

### 문제 5 ⭐⭐ 리뷰 코멘트 다시 쓰기

동료가 남긴 코멘트 "이거 별로예요. 고쳐 주세요."를 **위험 + 대안 + 근거** 형식으로 다시 써 보세요. 대상 코드는 `carts.get(memberId)!.push(productId)`입니다.

::: details 정답 보기

```text
[필수] carts.get(memberId)에 !를 붙였는데, 장바구니를 처음 쓰는 회원이면
값이 undefined라 push에서 TypeError가 납니다.
const cart = carts.get(memberId) ?? [] 로 받고 set으로 다시 넣는 방식을 제안드립니다.
(참고: 안티패턴 3 - non-null 단언 남발)
```
:::

## 확인 퀴즈

1. 안티패턴을 판단하는 세 가지 질문은 무엇인가요?
2. 제네릭이 "불필요하다"고 판단하는 간단한 기준은 무엇인가요?
3. `Object` 타입에 숫자 `4500`을 넣을 수 있나요?
4. `@ts-ignore`보다 `@ts-expect-error`가 나은 이유는 무엇인가요?
5. 타입이 `keyword: string`으로 정확해도 SQL 인젝션이 생길 수 있는 이유는 무엇인가요?

::: details 정답 보기
1. 거짓말하는 타입인가, 변경에 약한가, 읽는 사람이 추측해야 하는가.
2. 타입 매개변수가 서명에서 **한 번만** 쓰이면(입력과 출력 사이에 관계가 없으면) 필요 없습니다.
3. 넣을 수 있습니다. `Object`와 `{}`는 `null`·`undefined`를 뺀 거의 모든 값을 받습니다.
4. 숨기던 에러가 사라지면 "이 주석은 이제 필요 없다"는 에러를 내 주므로, 쓸모없어진 주석이 남지 않습니다.
5. 타입은 값의 **종류**만 검사하고 **내용**은 검사하지 않으며, 실행 중에는 사라집니다. 문자열 안의 SQL 문법은 파라미터 바인딩으로 막아야 합니다.
:::

## 정리

- 안티패턴은 **지금은 동작하지만 바뀌는 순간 사고가 나는** 코드입니다. 거짓 타입·변경 취약성·추측 필요성을 봅니다.
- `any`·`as`·`!`·`@ts-ignore`는 컴파일러의 입을 막는 도구입니다. 외부 데이터는 검증하고, 없을 수 있는 값은 코드로 처리합니다.
- boolean 플래그와 선택 속성이 늘어나면 **판별 유니온**으로 "가능한 상태만" 표현합니다.
- 타입은 복사하지 말고 `Pick`·`Omit`·`Partial`로 **파생**합니다.
- 리뷰는 타입 안전성 · 가독성 · **보안**(입력 검증, 인젝션, XSS, 인가, 민감 정보 로깅)을 함께 봅니다.
- 리뷰 코멘트는 중요도 표시와 함께 **위험 + 대안 + 근거**로 씁니다.

## 다음 단계

[대규모 코드베이스: 타입 체크 성능 · 프로젝트 참조](./03-large-codebase) — 파일이 수천 개로 늘어난 프로젝트에서 타입 검사를 빠르게 유지하는 설정과 진단 방법을 배웁니다.
