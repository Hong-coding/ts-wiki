---
title: 템플릿 리터럴 타입
---

# 템플릿 리터럴 타입

<LessonMeta level="고급" :minutes="50" prev="매핑된 타입으로 속성을 하나씩 훑고, as로 키 이름을 바꿨습니다" />

## 이번에 배울 것

- 템플릿 리터럴 타입(TypeScript 4.1+)으로 문자열 리터럴 타입을 이어 붙이고, 문자열 **패턴**을 타입으로 표현할 수 있다.
- 유니온을 끼워 넣었을 때 모든 조합이 만들어지는 원리(조합 폭발)와 그 한계를 설명할 수 있다.
- `Uppercase`·`Lowercase`·`Capitalize`·`Uncapitalize`로 문자열 타입의 대소문자를 바꿀 수 있다.
- `on` + `Capitalize` 패턴으로 이벤트 핸들러 이름을 타입으로 만들 수 있다.
- `infer`와 재귀로 `'/stores/:storeId/orders/:orderId'` 같은 경로에서 매개변수 이름을 뽑아낼 수 있다.

## 먼저 알아 둘 것

- [문자열 다루기와 템플릿 리터럴](../part1-basics/09-strings) — 백틱과 `${}`
- [유니온 타입과 리터럴 타입](../part2-types/06-union-literal)
- [infer로 타입 꺼내기](./02-infer) — 11단계 "문자열에서 infer"
- [매핑된 타입과 키 재매핑(as)](./03-mapped-types) — 9단계 키 재매핑

## 비유로 이해하기

카페 키오스크의 메뉴 코드를 만드는 **라벨 프린터**가 있습니다. 라벨 틀은 이렇게 생겼습니다.

```text
[ 크기 ]-[ 온도 ]
```

크기 칸에는 `S`, `L` 중 하나, 온도 칸에는 `HOT`, `ICE` 중 하나가 들어갑니다. 프린터에 "가능한 라벨을 전부 뽑아 줘"라고 하면 이렇게 나옵니다.

```text
S-HOT   S-ICE   L-HOT   L-ICE
```

칸마다 들어갈 수 있는 글자 목록을 주면, 프린터가 **모든 조합**을 찍어 냅니다. 이것이 **템플릿 리터럴 타입**(template literal type)입니다. 값 레벨에서 `` `${size}-${temp}` ``로 문자열 하나를 만들던 문법을, 타입 레벨에서는 "가능한 문자열들의 집합"을 만드는 데 씁니다.

반대로, 라벨 한 장을 들고 "이게 우리 틀에 맞는 라벨인가?", "크기 칸에 뭐가 찍혔지?" 하고 **검사하거나 읽어 낼** 수도 있습니다. 이번 레슨에서는 찍어 내기와 읽어 내기를 모두 해 봅니다.

## 개념 설명

### 1단계: 값 레벨 템플릿 리터럴 복습

```ts
const size = 'L'
const temp = 'ICE'
const menuCode = `${size}-${temp}`

console.log(menuCode) // 출력: L-ICE
```

백틱(`` ` ``) 안에 `${}`로 값을 끼워 넣어 문자열 하나를 만듭니다. [문자열 다루기](../part1-basics/09-strings)에서 배운 그대로입니다.

### 2단계: 타입 레벨 템플릿 리터럴

TypeScript 4.1부터 같은 문법을 **타입 자리**에 쓸 수 있습니다. `${}` 안에는 값이 아니라 **타입**이 들어갑니다.

```ts
type Size = 'L'
type Temp = 'ICE'
type MenuCode = `${Size}-${Temp}` // 결과: "L-ICE"

const code: MenuCode = 'L-ICE' // ✅
```

| 값 레벨 | 타입 레벨 |
|---|---|
| `` const menuCode = `${size}-${temp}` `` | `` type MenuCode = `${Size}-${Temp}` `` |
| `${}` 안에 값(변수) | `${}` 안에 타입 |
| 결과는 문자열 값 하나 | 결과는 문자열 리터럴 타입 |
| 실행할 때 계산 | 컴파일러가 검사할 때 계산 |

### 3단계: 문자열 패턴 타입

`${}` 안에 `'L'` 같은 리터럴이 아니라 `string`이나 `number` 같은 넓은 타입을 넣으면, "이런 **모양**의 문자열"이라는 패턴 타입이 됩니다.

```ts
// 'ORD-'로 시작하는 아무 문자열
type OrderNo = `ORD-${string}`
// 숫자 뒤에 'px'가 붙은 문자열
type Pixel = `${number}px`

const no: OrderNo = 'ORD-20261026-001' // ✅
const width: Pixel = '320px' // ✅

const wrongNo: OrderNo = '20261026-001'
// ❌ Type '"20261026-001"' is not assignable to type '`ORD-${string}`'. (TS2322)
const wrongWidth: Pixel = 'wide'
// ❌ Type '"wide"' is not assignable to type '`${number}px`'. (TS2322)
```

일반 `string` 타입보다 훨씬 좁게, 그러나 리터럴 하나보다는 넓게 "규칙"을 표현할 수 있습니다. 주문 번호, CSS 크기, 색상 코드처럼 형식이 정해진 문자열에 유용합니다.

::: info ${number}가 받아들이는 문자열
`` `${number}` ``는 "JavaScript가 숫자로 읽을 수 있는 문자열"을 받습니다. `'4500'`, `'-1.5'` 뿐 아니라 `'1e3'`(1000), `'0x1F'`(16진수 31)도 통과합니다. 반대로 `''`(빈 문자열)이나 `'1_000'`은 통과하지 못합니다. "숫자 글자만"이라는 뜻이 아니라는 점을 기억해 두세요.
:::

### 4단계: 유니온을 넣으면 모든 조합이 생긴다

비유의 라벨 프린터를 그대로 타입으로 옮겨 봅시다. `${}` 안에 유니온을 넣으면 **모든 조합**의 유니온이 나옵니다.

```ts
type Size = 'S' | 'L'
type Temp = 'HOT' | 'ICE'

type MenuCode = `${Size}-${Temp}` // 결과: "S-HOT" | "S-ICE" | "L-HOT" | "L-ICE"
```

값 레벨로 쓰면 이중 반복문입니다.

```ts
const sizes = ['S', 'L']
const temps = ['HOT', 'ICE']

const codes: string[] = []
for (const size of sizes) {
  for (const temp of temps) {
    codes.push(`${size}-${temp}`)
  }
}
console.log(codes.join(' | ')) // 출력: S-HOT | S-ICE | L-HOT | L-ICE
```

칸이 늘어날수록 조합 수는 **곱셈**으로 늘어납니다. 2 × 2 = 4개였지만, 크기 3개 × 온도 2개 × 샷 추가 여부 2개라면 12개가 됩니다.

```ts
type Size = 'S' | 'M' | 'L'
type Temp = 'HOT' | 'ICE'
type Shot = '' | '+SHOT'

type FullCode = `${Size}-${Temp}${Shot}`
// FullCode에 마우스를 올리면 3 × 2 × 2 = 12개 조합이 보입니다.

const order: FullCode = 'M-ICE+SHOT' // ✅
```

빈 문자열 `''`을 유니온에 넣어 "있어도 되고 없어도 되는 부분"을 표현한 점도 눈여겨보세요.

### 5단계: 조합 폭발과 한계

곱셈으로 늘어나는 성질 때문에 조합이 금방 엄청나게 커질 수 있습니다. 이를 **조합 폭발**이라고 부릅니다. 컴파일러는 유니온 멤버가 10만 개쯤에 이르면 계산을 포기하고 에러를 냅니다.

```ts
type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'

type Code4 = `${Digit}${Digit}${Digit}${Digit}` // 10 × 10 × 10 × 10 = 1만 개, 동작은 하지만 무겁습니다
type Code5 = `${Digit}${Digit}${Digit}${Digit}${Digit}`
// ❌ Expression produces a union type that is too complex to represent. (TS2590)
```

이런 경우에는 모든 조합을 나열하지 말고 `` `${number}` ``나 `` `${string}` `` 같은 **패턴 타입**을 쓰거나, 실행 중 검사(정규식 등)로 넘기는 것이 맞습니다.

::: warning 조합은 생각보다 빨리 커집니다
멤버가 수천 개인 유니온은 에러가 나지 않더라도 에디터를 느리게 만듭니다. 조합 타입을 만들 때는 "몇 개가 나올까?"를 먼저 곱셈으로 따져 보세요.
:::

### 6단계: 대소문자 바꾸기 — 내장 문자열 조작 타입

TypeScript 4.1부터 문자열 리터럴 타입을 바꾸는 네 가지 내장 타입이 있습니다. 값 레벨의 문자열 메서드와 짝을 이룹니다.

| 타입 레벨 | 하는 일 | 값 레벨에 가까운 것 |
|---|---|---|
| `Uppercase<S>` | 전부 대문자 | `s.toUpperCase()` |
| `Lowercase<S>` | 전부 소문자 | `s.toLowerCase()` |
| `Capitalize<S>` | 첫 글자만 대문자 | `s[0].toUpperCase() + s.slice(1)` |
| `Uncapitalize<S>` | 첫 글자만 소문자 | `s[0].toLowerCase() + s.slice(1)` |

```ts
type U = Uppercase<'order_created'> // 결과: "ORDER_CREATED"
type L = Lowercase<'CARD'> // 결과: "card"
type C = Capitalize<'refund'> // 결과: "Refund"
type N = Uncapitalize<'StoreName'> // 결과: "storeName"

// 유니온에도 멤버마다 적용됩니다.
type Actions = Uppercase<'add' | 'remove'> // 결과: "ADD" | "REMOVE"

// 한글처럼 대소문자가 없는 글자는 그대로입니다.
type K = Capitalize<'라떼'> // 결과: "라떼"
```

이 네 타입은 컴파일러 안에 직접 만들어져 있어서(intrinsic), 조건부 타입 등으로 속을 들여다볼 수는 없습니다. 쓰는 법만 알면 됩니다.

### 7단계: 이벤트 이름 만들기 — on + Capitalize 패턴

React의 `onClick`, `onChange`처럼 "이벤트 이름 앞에 `on`을 붙이고 첫 글자를 대문자로" 만드는 이름 규칙은 아주 흔합니다. 템플릿 리터럴 타입으로 그대로 표현할 수 있습니다.

```ts
type PosEvent = 'orderCreated' | 'paymentCompleted' | 'receiptPrinted'

type HandlerName = `on${Capitalize<PosEvent>}`
// 결과: "onOrderCreated" | "onPaymentCompleted" | "onReceiptPrinted"
```

[매핑된 타입의 키 재매핑](./03-mapped-types)과 합치면 "이벤트별 데이터 타입"으로부터 "핸들러 props 타입"을 통째로 만들 수 있습니다.

```ts
// 이벤트 이름 → 그 이벤트가 전달하는 데이터
type PosEventMap = {
  orderCreated: { orderId: number; total: number }
  paymentCompleted: { orderId: number; method: 'card' | 'cash' }
  receiptPrinted: { orderId: number }
}

type EventHandlers<E> = {
  [K in keyof E as `on${Capitalize<string & K>}`]?: (payload: E[K]) => void
}

type PosHandlers = EventHandlers<PosEventMap>
// 결과: { onOrderCreated?: (payload: { orderId: number; total: number }) => void; onPaymentCompleted?: (payload: { orderId: number; method: 'card' | 'cash' }) => void; onReceiptPrinted?: (payload: { orderId: number }) => void }

const handlers: PosHandlers = {
  onPaymentCompleted: (payload) => console.log(`${payload.orderId}번 주문 ${payload.method} 결제 완료`),
}
handlers.onPaymentCompleted?.({ orderId: 1001, method: 'card' }) // 출력: 1001번 주문 card 결제 완료
```

`payload`에 타입을 적지 않았는데도 `{ orderId: number; method: 'card' | 'cash' }`로 알려져 있습니다. 이벤트 종류가 늘면 `PosEventMap`에 한 줄만 추가하면 됩니다.

### 8단계: 함수 매개변수에서 패턴 쓰기 — 값 변경 감시

이번에는 템플릿 리터럴 타입을 **함수의 매개변수**에 써 봅시다. 객체의 속성 이름 뒤에 `Changed`를 붙인 이벤트만 구독할 수 있는 감시 함수입니다.

```ts
function watch<T extends Record<string, unknown>>(target: T) {
  const listeners = new Map<string, ((value: unknown) => void)[]>()

  return {
    // eventName은 반드시 '속성이름Changed' 모양이어야 하고,
    // 콜백은 그 속성의 타입으로 값을 받습니다.
    on<K extends string & keyof T>(eventName: `${K}Changed`, callback: (newValue: T[K]) => void) {
      const list = listeners.get(eventName) ?? []
      list.push(callback as (value: unknown) => void)
      listeners.set(eventName, list)
    },
    set<K extends string & keyof T>(key: K, value: T[K]) {
      target[key] = value
      for (const callback of listeners.get(`${key}Changed`) ?? []) callback(value)
    },
  }
}

const settings = watch({ storeName: '강남점', openHour: 9 })

settings.on('openHourChanged', (hour) => console.log(`영업 시작: ${hour + 1}시`))
settings.set('openHour', 10) // 출력: 영업 시작: 11시
```

`hour`가 `number`로 추론되어 `hour + 1`을 계산할 수 있었습니다. 어떻게 알았을까요?

```text
'openHourChanged'를 `${K}Changed` 모양에 맞춰 봄
→ K = 'openHour'
→ callback의 newValue 타입 = T['openHour'] = number
```

`${K}Changed` 패턴이 문자열에서 `K`를 **역으로 추론**한 것입니다. 2번 레슨의 `infer`와 같은 원리가 함수 호출에서도 일어납니다. 잘못된 이벤트 이름은 바로 에러가 납니다.

```ts
declare function watch<T extends Record<string, unknown>>(
  target: T
): { on<K extends string & keyof T>(eventName: `${K}Changed`, callback: (newValue: T[K]) => void): void }

const settings = watch({ storeName: '강남점', openHour: 9 })

settings.on('closeHourChanged', () => {})
// ❌ Argument of type '"closeHourChanged"' is not assignable to parameter of type '"openHourChanged" | "storeNameChanged"'. (TS2345)
```

### 9단계: 문자열에서 읽어 내기 — infer 복습

2번 레슨에서 본 것처럼 템플릿 리터럴은 **모양 맞추기**에도 쓰입니다. "찍어 내기"의 반대인 "읽어 내기"입니다.

```ts
// 'order:created' → 'order'
type Domain<S> = S extends `${infer D}:${string}` ? D : never
// 접두사를 떼어 냅니다. 접두사가 없으면 그대로 둡니다.
type RemovePrefix<S, P extends string> = S extends `${P}${infer Rest}` ? Rest : S

type D1 = Domain<'order:created' | 'member:joined'> // 결과: "order" | "member"
type R1 = RemovePrefix<'api_getOrders', 'api_'> // 결과: "getOrders"
type R2 = RemovePrefix<'getOrders', 'api_'> // 결과: "getOrders"
```

`Domain`에 유니온을 넣었더니 멤버마다 따로 계산되었습니다. 1번 레슨에서 배운 **분배 법칙**이 여기서도 일어납니다.

### 10단계: 라우트 경로 매개변수 추출

이제 이 레슨의 목표였던 예제입니다. 웹 서버나 라우터는 `/stores/:storeId/orders/:orderId`처럼 `:`이 붙은 부분을 **경로 매개변수**(path parameter, 주소 안에서 바뀌는 자리)로 씁니다. 이 문자열에서 `'storeId' | 'orderId'`를 타입으로 뽑아 봅시다.

먼저 값 레벨로 생각해 봅니다.

```ts
// 값 레벨: ':' 뒤의 이름을 '/'가 나올 때까지 읽는 일을 반복합니다.
function pathParams(path: string): string[] {
  const colon = path.indexOf(':')
  if (colon === -1) return []
  const rest = path.slice(colon + 1)
  const slash = rest.indexOf('/')
  if (slash === -1) return [rest] // 마지막 매개변수
  return [rest.slice(0, slash), ...pathParams(rest.slice(slash))] // 나머지는 다시 같은 함수로
}

console.log(pathParams('/stores/:storeId/orders/:orderId')) // 출력: [ 'storeId', 'orderId' ]
```

같은 생각을 타입으로 옮깁니다. 함수가 자기 자신을 부르듯, 타입도 자기 자신을 부릅니다(**재귀**, 다음 레슨에서 자세히 배웁니다).

```ts
type PathParams<P extends string> =
  // ① ':이름/나머지' 모양이면: 이름을 꺼내고, 나머지에서 다시 찾습니다.
  P extends `${string}:${infer Param}/${infer Rest}`
    ? Param | PathParams<`/${Rest}`>
    : // ② ':이름'으로 끝나는 모양이면: 마지막 매개변수입니다.
      P extends `${string}:${infer Param}`
      ? Param
      : // ③ ':'이 없으면: 매개변수가 없습니다.
        never

type P1 = PathParams<'/stores/:storeId/orders/:orderId'> // 결과: "storeId" | "orderId"
type P2 = PathParams<'/stores/:storeId'> // 결과: "storeId"
type P3 = PathParams<'/health'> // 결과: never
```

한 단계씩 전개해 봅시다.

```text
PathParams<'/stores/:storeId/orders/:orderId'>

① `${string}:${infer Param}/${infer Rest}` 에 맞추기
   ${string} = '/stores/'   (첫 ':' 앞까지)
   Param     = 'storeId'    (그다음 첫 '/' 앞까지)
   Rest      = 'orders/:orderId'
   → 'storeId' | PathParams<'/orders/:orderId'>

PathParams<'/orders/:orderId'>
① 맞추기 실패 (':' 뒤에 '/'가 없음)
② `${string}:${infer Param}` 에 맞추기 → Param = 'orderId'
   → 'orderId'

최종: 'storeId' | 'orderId'
```

값 레벨 함수의 `indexOf(':')`·`indexOf('/')`가 타입 레벨에서는 템플릿 리터럴 패턴으로, `if` 분기는 조건부 타입으로, 재귀 호출은 `PathParams<...>`로 바뀌었을 뿐입니다.

이 타입으로 **경로를 만드는 함수**를 안전하게 만들 수 있습니다. 경로에 있는 매개변수를 빠짐없이 넘겨야만 컴파일됩니다.

```ts
type PathParams<P extends string> = P extends `${string}:${infer Param}/${infer Rest}`
  ? Param | PathParams<`/${Rest}`>
  : P extends `${string}:${infer Param}`
    ? Param
    : never

function buildPath<P extends string>(path: P, params: Record<PathParams<P>, string>): string {
  const values: Record<string, string> = params
  return path.replace(/:(\w+)/g, (_, name: string) => values[name])
}

console.log(buildPath('/stores/:storeId/orders/:orderId', { storeId: 'S01', orderId: '1001' }))
// 출력: /stores/S01/orders/1001

buildPath('/stores/:storeId/orders/:orderId', { storeId: 'S01' })
// ❌ Argument of type '{ storeId: string; }' is not assignable to parameter of type 'Record<"storeId" | "orderId", string>'. (TS2345)
```

라우터 라이브러리(예: Express, React Router)의 타입이 바로 이런 원리로 경로 매개변수 이름을 알아냅니다. 7부 [Node.js + Express](../part7-practice/01-node-express)에서 `req.params.storeId`에 자동 완성이 뜨는 것도 이 덕분입니다.

## 자주 하는 실수

### 실수 1: 아무 타입이나 ${}에 넣음

```ts
type Prefixed<T> = `pre-${T}`
// ❌ Type 'T' is not assignable to type 'string | number | bigint | boolean | null | undefined'. (TS2322)
```

**왜 틀렸나**: 템플릿 리터럴 타입 안에는 문자열로 바꿀 수 있는 타입(`string`·`number`·`bigint`·`boolean`·`null`·`undefined`)만 들어갈 수 있습니다. 제약이 없는 `T`는 객체일 수도 있어 거절됩니다.

**고친 코드**: 제약을 걸거나, 키처럼 섞여 들어오는 경우는 `string & T`로 걸러 냅니다.

```ts
type Prefixed<T extends string | number> = `pre-${T}`

type R = Prefixed<'sale' | 10> // 결과: "pre-sale" | "pre-10"
```

### 실수 2: let 변수의 typeof로 리터럴을 기대함

```ts
let domain = 'order'
type EventName = `${typeof domain}Created` // 결과: `${string}Created`
```

**왜 틀렸나**: `let`으로 선언한 변수는 나중에 바뀔 수 있어서 타입이 `string`으로 넓어집니다([타입 표기와 타입 추론](../part2-types/01-annotation-inference)의 "넓히기"). 그래서 `'orderCreated'`가 아니라 "Created로 끝나는 아무 문자열" 패턴이 되었습니다.

**고친 코드**: `const`로 선언해 리터럴 타입을 유지합니다.

```ts
const domain = 'order'
type EventName = `${typeof domain}Created` // 결과: "orderCreated"
```

### 실수 3: 조합 폭발을 모르고 유니온을 곱함

```ts
type Hex = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f'

type Color = `#${Hex}${Hex}${Hex}${Hex}${Hex}${Hex}`
// ❌ Expression produces a union type that is too complex to represent. (TS2590)
```

**왜 틀렸나**: 16을 여섯 번 곱하면 1,600만 개가 넘습니다. 컴파일러가 표현할 수 있는 한계를 훌쩍 넘습니다.

**고친 코드**: 정확한 조합 대신 느슨한 패턴 타입을 쓰고, 세부 형식은 실행 중에 검사합니다.

```ts
type Color = `#${string}`

function isColor(value: string): value is Color {
  return /^#[0-9a-f]{6}$/.test(value)
}

console.log(isColor('#ff8800')) // 출력: true
console.log(isColor('#ff88')) // 출력: false
```

`value is Color`는 6번 레슨 [사용자 정의 타입 가드](./06-type-guards-satisfies)에서 배우는 문법입니다. "타입으로 다 표현하기 어려운 규칙은 실행 중 검사와 짝을 짓는다"는 점을 기억해 두세요.

### 실수 4: 첫 infer가 가장 긴 부분을 잡을 거라 기대함

```ts
// 'a/b/c'에서 마지막 부분 'c'를 꺼내려는 의도
type LastSegment<S> = S extends `${infer _Head}/${infer Last}` ? Last : S

type R = LastSegment<'stores/S01/orders'> // 결과: "S01/orders"
```

**왜 틀렸나**: 앞쪽 `infer`는 **처음 만나는** `/`에서 멈추고, 마지막 `infer`가 나머지를 모두 가져갑니다. 그래서 마지막 조각이 아니라 첫 `/` 뒤 전부가 나왔습니다.

**고친 코드**: 나머지에 `/`가 또 있으면 다시 자르도록 재귀로 만듭니다.

```ts
type LastSegment<S> = S extends `${string}/${infer Rest}` ? LastSegment<Rest> : S

type R = LastSegment<'stores/S01/orders'> // 결과: "orders"
```

## 직접 해 보기

### 문제 1 ⭐ 퍼센트 문자열

`'10%'`, `'12.5%'`처럼 숫자 뒤에 `%`가 붙은 문자열만 받는 `Percent` 타입을 만드세요.

::: details 정답 보기

```ts
type Percent = `${number}%`

const discount: Percent = '12.5%' // ✅
console.log(discount) // 출력: 12.5%
```
:::

### 문제 2 ⭐ 액션 상수 이름

`'add' | 'remove' | 'clear'`에서 `'CART_ADD' | 'CART_REMOVE' | 'CART_CLEAR'`를 만드는 타입을 쓰세요.

::: details 정답 보기

```ts
type CartAction = 'add' | 'remove' | 'clear'
type ActionType = `CART_${Uppercase<CartAction>}` // 결과: "CART_ADD" | "CART_REMOVE" | "CART_CLEAR"
```

유니온이 `Uppercase`에서 한 번, 템플릿 리터럴에서 또 한 번 멤버마다 처리되었습니다.
:::

### 문제 3 ⭐⭐ 매장 × 요일 키

매장 `'gangnam' | 'hongdae'`와 요일 `'mon' | 'tue' | 'wed'`의 모든 조합 `'gangnam_mon'` 등을 키로 하고, 값은 매출(`number`)인 객체 타입 `SalesTable`을 만드세요. 조합이 몇 개인지도 세어 보세요.

::: details 정답 보기

```ts
type Store = 'gangnam' | 'hongdae'
type Day = 'mon' | 'tue' | 'wed'

type SalesTable = Record<`${Store}_${Day}`, number>

const sales: SalesTable = {
  gangnam_mon: 1200000,
  gangnam_tue: 980000,
  gangnam_wed: 1100000,
  hongdae_mon: 870000,
  hongdae_tue: 920000,
  hongdae_wed: 1010000,
}
console.log(Object.keys(sales).length) // 출력: 6
```

2 × 3 = 6개입니다. 하나라도 빠뜨리면 에러가 납니다.
:::

### 문제 4 ⭐⭐ getter 이름에서 속성 이름 되찾기

`'getStoreName'` 같은 getter 이름에서 `'storeName'`을 되찾는 `PropOf<S>`를 만드세요. `get`으로 시작하지 않으면 `never`입니다.

::: details 정답 보기

```ts
type PropOf<S> = S extends `get${infer Name}` ? Uncapitalize<Name> : never

type R1 = PropOf<'getStoreName'> // 결과: "storeName"
type R2 = PropOf<'setStoreName'> // 결과: never
```

`Capitalize`로 만든 이름을 `Uncapitalize`로 되돌렸습니다.
:::

### 문제 5 ⭐⭐ 경로 매개변수 객체

10단계의 `PathParams`를 이용해, 경로 문자열을 넣으면 `{ storeId: string; orderId: string }`처럼 매개변수 객체 타입이 나오는 `ParamsObject<P>`를 만드세요. 매개변수가 없으면 빈 객체 `{}`가 되어도 괜찮습니다.

::: details 정답 보기

```ts
type PathParams<P extends string> = P extends `${string}:${infer Param}/${infer Rest}`
  ? Param | PathParams<`/${Rest}`>
  : P extends `${string}:${infer Param}`
    ? Param
    : never

type ParamsObject<P extends string> = { [K in PathParams<P>]: string }

type R1 = ParamsObject<'/stores/:storeId/orders/:orderId'> // 결과: { storeId: string; orderId: string }
type R2 = ParamsObject<'/health'> // 결과: {}
```

`PathParams`가 `never`이면 매핑할 키가 없으므로 빈 객체가 됩니다.
:::

### 문제 6 ⭐⭐⭐ 쿼리 문자열 키

`'page=1&size=20&sort=price'` 같은 쿼리 문자열 타입에서 키 이름 `'page' | 'size' | 'sort'`를 뽑는 `QueryKeys<S>`를 만드세요.

::: details 정답 보기

```ts
type QueryKeys<S extends string> = S extends `${infer Pair}&${infer Rest}`
  ? KeyOf<Pair> | QueryKeys<Rest>
  : KeyOf<S>

// 'page=1' → 'page'
type KeyOf<Pair extends string> = Pair extends `${infer Key}=${string}` ? Key : never

type R = QueryKeys<'page=1&size=20&sort=price'> // 결과: "page" | "size" | "sort"
```

`&`로 한 쌍씩 잘라 내고(재귀), 각 쌍은 `=` 앞을 꺼냈습니다. 문제를 "한 쌍 처리"와 "나머지 반복"으로 나누면 경로 매개변수 추출과 같은 모양이 됩니다.
:::

## 확인 퀴즈

1. `` `${'S' | 'M'}-${'HOT' | 'ICE'}` ``는 몇 개의 멤버를 가진 유니온이 되나요?
2. `` `${number}px` `` 타입에 `'1e3px'`를 넣을 수 있나요?
3. `Capitalize<'refund'>`와 `Uncapitalize<'Refund'>`의 결과는 각각 무엇인가요?
4. `` type T<X> = `id-${X}` ``가 에러 나는 이유는 무엇인가요?
5. `` S extends `${infer A}/${infer B}` ``에서 `S = 'a/b/c'`이면 `A`와 `B`는 무엇인가요?

::: details 정답 보기

1. 2 × 2 = 4개입니다(`'S-HOT' | 'S-ICE' | 'M-HOT' | 'M-ICE'`).
2. 넣을 수 있습니다. `'1e3'`은 JavaScript가 숫자 1000으로 읽을 수 있는 문자열이기 때문입니다.
3. `'Refund'`와 `'refund'`입니다.
4. `X`에 제약이 없어 객체 같은 타입이 들어올 수 있기 때문입니다. `X extends string` 같은 제약이 필요합니다.
5. `A = 'a'`, `B = 'b/c'`입니다. 앞쪽 `infer`는 처음 만나는 `/`에서 멈춥니다.
:::

## 정리

- 템플릿 리터럴 타입(4.1+)은 값 레벨의 템플릿 리터럴을 타입 자리에 쓴 것입니다. 문자열 리터럴 타입을 이어 붙이거나, `` `ORD-${string}` `` 같은 문자열 패턴을 표현합니다.
- `${}`에 유니온을 넣으면 모든 조합(곱셈)이 만들어집니다. 너무 커지면 TS2590 에러가 나므로 패턴 타입이나 실행 중 검사로 바꿉니다.
- `Uppercase`·`Lowercase`·`Capitalize`·`Uncapitalize`로 대소문자를 바꿉니다.
- `` `on${Capitalize<K>}` `` 패턴과 키 재매핑으로 이벤트 핸들러 타입을 자동으로 만들 수 있습니다.
- 함수 매개변수의 템플릿 리터럴 패턴은 인수 문자열에서 타입을 역으로 추론합니다.
- `infer`와 재귀를 합치면 경로 매개변수처럼 문자열 안에 반복되는 구조를 읽어 낼 수 있습니다.

## 다음 단계

[재귀 타입](./05-recursive-types)에서는 이번 레슨의 `PathParams`처럼 **자기 자신을 부르는 타입**을 본격적으로 다룹니다. JSON 값, 카테고리 트리, 깊은 곳까지 모두 읽기 전용으로 만드는 `DeepReadonly`를 만들고, 재귀가 너무 깊어질 때 생기는 문제도 살펴봅니다.
