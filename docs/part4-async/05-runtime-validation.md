---
title: "런타임 검증: 타입은 실행 중에 사라진다 (zod)"
---

# 런타임 검증: 타입은 실행 중에 사라진다 (zod)

<LessonMeta level="중급" :minutes="50" prev="fetch로 API를 호출하고 공통 함수 request에 상태 확인·에러·타임아웃을 모으는 법" />

## 이번에 배울 것

- 타입 소거(type erasure)가 무엇인지, 그래서 왜 외부 데이터에 붙인 타입을 믿으면 안 되는지 설명할 수 있다.
- `unknown` 값을 검사하는 타입 가드 함수를 직접 작성할 수 있다.
- zod로 스키마를 정의하고 `parse`·`safeParse`로 검증하며, `z.infer`로 스키마에서 타입을 뽑아낼 수 있다.
- 검증 실패 시 사용자에게 보여 줄 오류 메시지를 만들 수 있다.
- 폼 입력과 API 응답을 검증하는 코드를 실무 형태로 작성할 수 있다.

## 먼저 알아 둘 것

- `unknown`과 `any`의 차이: [특수 타입](../part2-types/02-special-types)
- `typeof`·`Array.isArray`로 좁히기: [타입 좁히기](../part2-types/08-narrowing)
- 공통 요청 함수 `request<T>()`: [fetch로 API 호출하기](./04-fetch-api)
- 판별 유니온: [판별 유니온과 완전성 검사](../part3-intermediate/03-discriminated-union)
- npm으로 패키지 설치하기: [개발 환경 설치](../part0-start/03-setup)

::: info 이 레슨의 zod 버전
이 레슨은 **작성 시점 기준 zod 4.6.7**로 실행해 확인했습니다. zod는 2025년에 4.x(v4)가 나오면서 일부 문법이 바뀌었습니다. 인터넷에서 찾은 예제가 v3 문법일 수 있으니, 바뀐 점을 정리한 [v3와 v4의 차이](#v3와-v4의-차이)를 함께 보세요. zod 4는 TypeScript 5.5 이상과 `strict` 모드를 권장합니다.
:::

## 비유로 이해하기

매장에 본사 물류센터에서 상자가 들어옵니다. 상자에는 **"아메리카노 원두 1kg"** 이라는 라벨이 붙어 있습니다.

- **라벨만 믿는 매장**: 상자를 열지 않고 창고에 넣습니다. 어느 날 손님 앞에서 원두 대신 종이컵이 나옵니다.
- **검수하는 매장**: 상자를 열어 내용물이 라벨과 같은지 확인하고, 다르면 그 자리에서 반품합니다. 검수를 통과한 상자에는 "검수 완료" 도장을 찍어, 그다음부터는 누구도 다시 열어 볼 필요가 없게 합니다.

TypeScript의 타입은 **라벨**입니다. 컴파일러는 라벨끼리 맞는지만 확인합니다. 그런데 컴파일이 끝나면 라벨은 **모두 떼어집니다.** 실행 중에 서버에서 들어오는 상자(JSON)에는 라벨조차 없습니다.

**런타임 검증(runtime validation)** 은 검수입니다. 실행 중(런타임)에 실제 값을 열어 보고, 통과하면 "이제 이 값은 `Product`가 맞다"는 도장을 찍습니다. 이 도장이 TypeScript의 **타입 좁히기**입니다.

| 매장 | 코드 |
|---|---|
| 상자의 라벨 | TypeScript 타입 (`interface Product`) |
| 출고 전에 라벨이 떼어짐 | 타입 소거 — 컴파일된 JS에는 타입이 없음 |
| 라벨 없이 들어온 상자 | 외부 데이터(`unknown`): API 응답, 폼 입력, 파일, `localStorage` |
| 검수 기준표 | 스키마(schema) |
| 검수 통과 도장 | 타입 가드 / `parse` 성공 후의 타입 |
| 반품 사유서 | 검증 오류 메시지 |

## 개념 설명

### 1단계: 타입 소거 — 컴파일하면 타입이 사라진다

아래 TypeScript 코드를 컴파일해 보겠습니다.

```ts
interface Product {
  name: string
  price: number
}

function printPrice(product: Product): void {
  console.log(`${product.name}: ${product.price}원`)
}

printPrice({ name: '아메리카노', price: 4500 })
```

`tsc`가 만든 JavaScript는 이렇습니다.

```js
"use strict";
function printPrice(product) {
    console.log(`${product.name}: ${product.price}원`);
}
printPrice({ name: '아메리카노', price: 4500 });
```

`interface Product`는 통째로 사라졌고, `product: Product`도 그냥 `product`가 되었습니다. 이것을 **타입 소거(type erasure)** 라고 합니다. TypeScript의 타입은 **컴파일할 때 검사하는 데만 쓰이고**, 실행되는 코드에는 한 글자도 남지 않습니다.

그래서 다음 같은 일은 **불가능합니다.**

```ts
// ❌ 이런 문법은 없습니다. 실행 중에 Product라는 타입은 존재하지 않으니까요.
if (data instanceof Product) { ... }
if (typeof data === 'Product') { ... }
```

`instanceof`는 실행 중에도 존재하는 **클래스**에만, `typeof`는 `'string'`·`'number'` 같은 JavaScript 기본 종류에만 쓸 수 있습니다.

::: tip 컴파일 시점 vs 실행 시점
- **컴파일 시점(compile time)**: `tsc`가 코드를 검사할 때. 개발자가 쓴 코드끼리 맞는지 봅니다.
- **실행 시점(runtime, 런타임)**: 프로그램이 실제로 돌아갈 때. 서버 응답, 사용자 입력처럼 **코드 바깥에서 들어오는 값**은 이때 처음 나타납니다.

TypeScript는 컴파일 시점만 지킵니다. 실행 시점에 들어오는 값은 우리가 직접 지켜야 합니다.
:::

### 2단계: 경계에서 unknown으로 받는다

외부 데이터가 프로그램으로 들어오는 곳을 **경계(boundary)** 라고 부릅니다.

- `fetch` 응답 (`res.json()`)
- 폼 입력 값 (`input.value`, `FormData`)
- `JSON.parse`로 읽은 문자열 (`localStorage`, 파일, 메시지 큐)
- URL의 쿼리 문자열, 환경 변수

경계에서 들어온 값은 **`unknown`으로 받는 것**이 원칙입니다. `any`와 달리 `unknown`은 검사(좁히기) 전에는 아무것도 할 수 없게 막아 줍니다.

```ts
const data: unknown = JSON.parse(text)
data.price
// ❌ 'data' is of type 'unknown'. (TS18046)
```

이 오류가 바로 우리가 원하는 것입니다. "검수하기 전에는 상자를 쓰지 마세요"라는 경고입니다. 이제 검수 방법 두 가지를 봅니다. 손으로 짜는 방법, 그리고 zod를 쓰는 방법입니다.

### 3단계: 직접 검증 함수(타입 가드) 작성하기

Part 2에서 `typeof`·`in`으로 유니온을 좁혔습니다. 같은 방법으로 `unknown`을 하나씩 좁혀 가는 함수를 만듭니다.

```ts
interface Product {
  code: string
  name: string
  price: number
  tags: string[]
}

// 일반 객체인지 확인합니다(null과 배열은 제외).
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

// Product 모양인지 확인합니다.
function isProduct(value: unknown): value is Product {
  if (!isObject(value)) return false
  return (
    typeof value.code === 'string' &&
    typeof value.name === 'string' &&
    typeof value.price === 'number' &&
    Number.isFinite(value.price) && // NaN, Infinity 제외
    Array.isArray(value.tags) &&
    value.tags.every((tag) => typeof tag === 'string')
  )
}

const inputs: unknown[] = [
  JSON.parse('{"code":"P001","name":"아메리카노","price":4500,"tags":["커피"]}'),
  JSON.parse('{"code":"P002","name":"카페라테","price":"5000","tags":[]}'),
  JSON.parse('null'),
]

for (const input of inputs) {
  if (isProduct(input)) {
    console.log('통과:', input.name, input.price.toLocaleString()) // input: Product
  } else {
    console.log('거부:', JSON.stringify(input))
  }
}
```

```text
통과: 아메리카노 4,500
거부: {"code":"P002","name":"카페라테","price":"5000","tags":[]}
거부: null
```

해설:

- 반환 타입 `value is Product`를 **타입 서술어(type predicate)** 라고 합니다. 이 함수가 `true`를 돌려주면 TypeScript가 그 `if` 블록 안에서 `value`를 `Product`로 좁혀 줍니다. 이런 함수를 **사용자 정의 타입 가드(user-defined type guard)** 라고 합니다. ([Part 5](../part5-advanced/06-type-guards-satisfies)에서 더 깊이 다룹니다.)
- `isObject`를 먼저 통과시키면 `value`가 `Record<string, unknown>`이 되어 `value.code`처럼 속성에 접근할 수 있습니다. 꺼낸 값은 여전히 `unknown`이므로 하나씩 `typeof`로 확인합니다.
- 두 번째 입력은 `price`가 문자열 `"5000"`이라서 거부되었습니다. 파트 소개에서 본 `4500500` 사고를 막은 것입니다.

#### 직접 짜는 방식의 한계

동작은 확실하지만, 실무에서 쓰기에는 문제가 있습니다.

1. **두 번 적어야 합니다.** `interface Product`와 `isProduct` 안의 검사가 같은 정보를 반복합니다. 속성을 추가할 때 한쪽만 고치면 TypeScript도 알려 주지 않습니다. 타입 서술어는 "이 함수를 믿겠다"는 약속이라, 검사 내용이 틀려도 컴파일러가 확인하지 않습니다.
2. **실패 이유를 모릅니다.** `false`만 돌려주므로 "어느 필드가 왜 틀렸는지" 사용자에게 보여 줄 수 없습니다.
3. **길어집니다.** 중첩 객체, 배열, 선택 속성, "1 이상 99 이하", 이메일 형식까지 넣으면 금방 수십 줄이 됩니다.

이 세 가지를 해결하는 것이 **스키마 검증 라이브러리**이고, 그중 가장 널리 쓰이는 것이 **zod**입니다.

### 4단계: zod 설치와 첫 스키마

프로젝트 폴더에서 설치합니다.

```bash
npm install zod
```

**스키마(schema)** 는 "데이터가 어떤 모양이어야 하는지"를 적은 검수 기준표입니다. zod에서는 스키마를 **실행 중에도 존재하는 값(객체)** 으로 만듭니다. 그래서 타입과 달리 컴파일 후에도 남아서 검사를 할 수 있습니다.

```ts
import { z } from 'zod'

const ProductSchema = z.object({
  code: z.string(),
  name: z.string().min(1),               // 빈 문자열 금지
  price: z.number().int().nonnegative(), // 0 이상의 정수
  tags: z.array(z.string()),             // 문자열 배열
})

// 스키마에서 타입을 뽑아냅니다 — interface를 따로 적지 않습니다.
type Product = z.infer<typeof ProductSchema>
// { code: string; name: string; price: number; tags: string[] }
```

- `z.string()`, `z.number()`, `z.boolean()`, `z.array(...)`, `z.object({...})`처럼 **작은 스키마를 조립**해 큰 스키마를 만듭니다.
- `.min(1)`, `.int()`, `.nonnegative()`처럼 메서드를 이어 붙여 조건을 더합니다. 이런 조건은 TypeScript 타입으로는 표현할 수 없는 것들입니다(`number`는 `number`일 뿐 "0 이상 정수"라는 타입은 없습니다).
- **`z.infer<typeof ProductSchema>`** 가 핵심입니다. 스키마(값)에서 TypeScript 타입을 계산합니다. `typeof`는 [Part 3](../part3-intermediate/06-keyof-typeof-indexed)에서 배운 "값에서 타입 꺼내기"입니다.

이제 **진짜 정보는 스키마 한 곳**에만 있습니다. 스키마에 속성을 추가하면 타입도 자동으로 따라 바뀝니다. 3단계 한계 1번이 해결되었습니다.

::: tip 이름 짓기 관례
스키마는 `ProductSchema`처럼 `Schema`를 붙이고, 타입은 `Product`로 짓는 경우가 많습니다. 스키마와 타입에 같은 이름(`Product`)을 쓰는 팀도 있습니다. TypeScript는 값과 타입의 이름 공간이 달라서 둘 다 허용됩니다. 팀 규칙을 따르세요.
:::

### 5단계: parse — 통과하면 값, 실패하면 throw

```ts
const ok = ProductSchema.parse({ code: 'P001', name: '아메리카노', price: 4500, tags: ['커피'] })
console.log('통과:', ok.name, ok.price) // ok: Product

try {
  ProductSchema.parse({ code: 'P002', name: '', price: '5000', tags: ['커피', 1] })
} catch (error) {
  if (error instanceof z.ZodError) {
    for (const issue of error.issues) {
      console.log(issue.path.join('.'), '|', issue.code, '|', issue.message)
    }
  }
}
```

```text
통과: 아메리카노 4500
name | too_small | Too small: expected string to have >=1 characters
price | invalid_type | Invalid input: expected number, received string
tags.1 | invalid_type | Invalid input: expected string, received number
```

- `parse(값)`은 `unknown`을 받아서, 통과하면 **타입이 붙은 값**(`Product`)을 돌려주고, 실패하면 **`ZodError`를 던집니다.**
- `ZodError`의 `issues`(문제 목록)에 **모든** 실패가 담깁니다. 첫 실패에서 멈추지 않고 끝까지 검사합니다.
- 각 문제(issue)에는 위치(`path`), 종류(`code`), 설명(`message`)이 있습니다. `tags.1`은 "`tags` 배열의 1번 요소"라는 뜻입니다. 3단계 한계 2번이 해결되었습니다.

::: info parse가 돌려주는 값은 "새 값"입니다
`parse`는 입력을 검사한 뒤 **스키마에 적힌 속성만 담은 새 객체**를 돌려줍니다. 스키마에 없는 속성(예: 서버가 덧붙인 `extra`)은 기본적으로 **조용히 빠집니다.** 모르는 속성이 오면 오류로 처리하고 싶다면 `z.object` 대신 `z.strictObject`를 씁니다(오류 메시지: `Unrecognized key: "extra"`).
:::

### 6단계: safeParse — throw 없이 결과 객체로 받기

폼 검증처럼 실패가 "흔한 일"인 곳에서는 `try/catch`보다 `safeParse`가 편합니다. 던지지 않고 **결과 객체**를 돌려줍니다.

```ts
const result = ProductSchema.safeParse({ code: 'P002', name: '', price: '5000', tags: [] })

if (result.success) {
  console.log(result.data.name) // result.data: Product
} else {
  console.log(z.prettifyError(result.error))                  // 사람이 읽기 좋은 문자열
  console.log(JSON.stringify(z.flattenError(result.error)))  // 필드별로 정리
}
```

```text
✖ Too small: expected string to have >=1 characters
  → at name
✖ Invalid input: expected number, received string
  → at price
{"formErrors":[],"fieldErrors":{"name":["Too small: expected string to have >=1 characters"],"price":["Invalid input: expected number, received string"]}}
```

`safeParse`의 결과는 `success` 속성으로 구분하는 **판별 유니온**입니다.

```ts
// 대략 이런 모양입니다.
type SafeParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: z.ZodError }
```

`if (result.success)`로 좁히면 `data`를, `else`에서는 `error`를 안전하게 씁니다.

| 상황 | 쓸 메서드 |
|---|---|
| 실패가 "있어서는 안 되는 일"(API 응답, 설정 파일) | `parse` — 실패하면 던져서 위쪽 `catch`가 처리 |
| 실패가 "흔한 일"(사용자 폼 입력) | `safeParse` — 결과를 보고 화면에 오류 표시 |

오류를 화면에 맞게 바꾸는 도우미 함수(v4):

| 함수 | 결과 | 쓰는 곳 |
|---|---|---|
| `z.prettifyError(error)` | 여러 줄 문자열 | 로그, 개발자용 메시지 |
| `z.flattenError(error)` | `{ formErrors, fieldErrors }` | 평평한 폼 — 입력칸마다 오류 표시 |
| `z.treeifyError(error)` | 중첩된 객체 | 중첩 객체·배열 폼 |

### 7단계: 오류 메시지를 한국어로

기본 메시지는 영어이고 개발자용 문구입니다. 사용자에게 보여 줄 메시지는 조건마다 직접 적습니다. v4에서는 `{ error: '메시지' }`로 적습니다.

회원 가입 폼을 예로 들겠습니다. 폼 입력은 **모두 문자열**로 들어온다는 점에 주의합니다.

```ts
const MemberFormSchema = z.object({
  name: z.string().trim().min(2, { error: '이름은 2글자 이상 입력하세요' }),
  phone: z.string().regex(/^010-\d{4}-\d{4}$/, { error: '휴대폰 번호 형식은 010-0000-0000입니다' }),
  email: z.email({ error: '이메일 형식이 아닙니다' }).optional(),
  age: z.coerce
    .number({ error: '나이는 숫자로 입력하세요' })
    .int()
    .min(14, { error: '14세 이상만 가입할 수 있습니다' }),
  grade: z.enum(['일반', 'VIP']).default('일반'),
  agreeMarketing: z.boolean(),
})

type MemberForm = z.infer<typeof MemberFormSchema>

const raw = { name: ' 김 ', phone: '01012345678', email: 'kim@', age: '열다섯', agreeMarketing: false }
const result = MemberFormSchema.safeParse(raw)
if (!result.success) {
  const { fieldErrors } = z.flattenError(result.error)
  console.log(fieldErrors)
}

const good = MemberFormSchema.parse({
  name: ' 김하나 ', phone: '010-1234-5678', age: '30', agreeMarketing: true,
})
console.log(good)
```

```text
{
  name: [ '이름은 2글자 이상 입력하세요' ],
  phone: [ '휴대폰 번호 형식은 010-0000-0000입니다' ],
  email: [ '이메일 형식이 아닙니다' ],
  age: [ '나이는 숫자로 입력하세요' ]
}
{
  name: '김하나',
  phone: '010-1234-5678',
  age: 30,
  grade: '일반',
  agreeMarketing: true
}
```

새로 나온 것들을 정리합니다.

| 문법 | 뜻 |
|---|---|
| `.trim()` | 검사 전에 앞뒤 공백을 잘라 냄. 결과 값도 잘린 값(`'김하나'`) |
| `.regex(정규식)` | 정규 표현식(문자열 패턴)과 맞는지 검사 |
| `z.email()` | 이메일 형식 문자열 (v4에서 최상위 함수로 바뀜) |
| `.optional()` | 없어도 됨 → 타입에 `?`가 붙음(`email?: string`) |
| `z.coerce.number()` | 먼저 `Number(값)`으로 바꾼 뒤 숫자인지 검사. 문자열 `'30'` → `30` |
| `z.enum([...])` | 정해진 값 중 하나 → 타입 `'일반' \| 'VIP'` |
| `.default(값)` | 없으면 기본값을 채움 |

`name`, `age`처럼 **검증하면서 값을 바꾸는**(공백 제거, 숫자 변환) 스키마는 입력 타입과 출력 타입이 다릅니다. `z.infer`(= `z.output`)는 검증 **후**의 타입(`age: number`), `z.input<typeof 스키마>`는 검증 **전**의 타입입니다.

::: info 한국어 기본 메시지
zod 4에는 언어팩이 있어서 `z.config(z.locales.ko())`를 한 번 부르면 기본 메시지가 한국어로 바뀝니다(예: `잘못된 입력: 예상 타입은 number, 받은 타입은 string입니다`). 다만 문구가 개발자용이라, 사용자 화면에는 위처럼 메시지를 직접 적는 편이 좋습니다.
:::

### 8단계: API 응답 검증 — request에 스키마를 넘기기

지난 레슨의 `request<T>()`에는 `return data as T`라는 "약속"이 남아 있었습니다. 이제 이것을 **검사**로 바꿉니다. 타입 인자 `T` 대신 **스키마를 인자로** 받으면, 스키마가 검사도 하고 반환 타입도 정해 줍니다.

```ts
import { z } from 'zod'

const BASE_URL = 'https://jsonplaceholder.typicode.com'

class HttpError extends Error {
  readonly status: number
  constructor(status: number, url: string) {
    super(`HTTP ${status} 오류: ${url}`)
    this.name = 'HttpError'
    this.status = status
  }
}

// S는 "어떤 zod 스키마"이고, 반환 타입은 그 스키마에서 뽑은 타입입니다.
async function request<S extends z.ZodType>(path: string, schema: S): Promise<z.infer<S>> {
  const url = `${BASE_URL}${path}`
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
  if (!res.ok) throw new HttpError(res.status, url)
  const data: unknown = await res.json() // any가 퍼지지 않게 unknown으로 받습니다.
  return schema.parse(data)               // as 대신 진짜 검사!
}

const TodoSchema = z.object({
  userId: z.number(),
  id: z.number(),
  title: z.string(),
  completed: z.boolean(),
})
type Todo = z.infer<typeof TodoSchema>

const ProductSchema = z.object({ name: z.string(), price: z.number() })

async function main(): Promise<void> {
  const todo = await request('/todos/1', TodoSchema) // todo: Todo — 타입 인자를 적지 않아도 추론됨
  console.log(todo.title, todo.completed)

  const todos = await request('/todos?userId=1', z.array(TodoSchema)) // 배열도 스키마로
  console.log(todos.length)

  try {
    // 회원 주소에서 상품을 받으려는 실수 — 지난 레슨에서는 실행 중 TypeError가 났습니다.
    const product = await request('/users/1', ProductSchema)
    console.log(product.price)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log('응답 형식 오류:')
      console.log(z.prettifyError(error))
    }
  }
}
main()
```

```text
delectus aut autem false
20
응답 형식 오류:
✖ Invalid input: expected number, received undefined
  → at price
```

지난 레슨에서는 엉뚱한 데이터가 화면 그리는 코드까지 흘러가 `Cannot read properties of undefined`로 터졌습니다. 이제는 **경계에서 바로** "`price`가 숫자여야 하는데 없다"는 정확한 이유와 함께 멈춥니다. 장애가 났을 때 원인을 찾는 시간이 크게 줄어듭니다.

::: tip 무엇을 검증해야 하나
모든 곳에서 검증하면 코드가 무거워집니다. 원칙은 **"경계에서 한 번"** 입니다.
- 검증한다: API 응답, 폼 입력, `JSON.parse` 결과, 환경 변수, 다른 팀·외부 회사의 데이터
- 검증하지 않는다: 이미 검증을 통과한 값을 프로그램 안에서 주고받을 때 — 이때는 TypeScript 타입만으로 충분합니다.
:::

### 9단계: 판별 유니온 스키마

결제 수단마다 필요한 속성이 다른 데이터도 스키마로 표현할 수 있습니다.

```ts
const PaymentSchema = z.discriminatedUnion('method', [
  z.object({ method: z.literal('card'), amount: z.number().positive(), cardNo: z.string() }),
  z.object({ method: z.literal('cash'), amount: z.number().positive(), received: z.number() }),
  z.object({ method: z.literal('point'), amount: z.number().positive(), memberId: z.string() }),
])

type Payment = z.infer<typeof PaymentSchema>
// | { method: 'card'; amount: number; cardNo: string }
// | { method: 'cash'; amount: number; received: number }
// | { method: 'point'; amount: number; memberId: string }
```

`z.literal('card')`는 정확히 `'card'`라는 값만 허용합니다. `z.infer`로 뽑은 타입은 [Part 3](../part3-intermediate/03-discriminated-union)에서 배운 판별 유니온 그대로라서 `switch (payment.method)`로 좁혀 쓸 수 있습니다(문제 5).

### v3와 v4의 차이

인터넷의 예제나 기존 프로젝트는 zod 3 문법일 수 있습니다. 자주 만나는 차이만 정리합니다.

| 항목 | v3 | v4 |
|---|---|---|
| 사용자 메시지 지정 | `{ message: '...' }` | `{ error: '...' }` (`message`도 아직 동작하지만 권장하지 않음) |
| 이메일·URL 등 문자열 형식 | `z.string().email()` | `z.email()` (메서드 방식도 동작하지만 권장하지 않음) |
| 오류 목록 | `error.errors` 또는 `error.issues` | `error.issues`만 |
| 필드별 오류 정리 | `error.flatten()`, `error.format()` | `z.flattenError(error)`, `z.treeifyError(error)` |
| 읽기 좋은 문자열 | 없음 | `z.prettifyError(error)` |
| 모르는 속성 거부 | `z.object({...}).strict()` | `z.strictObject({...})` |
| 기본 메시지 문구 | `Expected number, received string` | `Invalid input: expected number, received string` |

`z.object`, `parse`, `safeParse`, `z.infer` 같은 핵심 사용법은 같습니다. 기본 메시지 문구가 바뀌었으므로, 메시지 문자열을 비교하는 테스트가 있다면 업그레이드할 때 확인이 필요합니다.

### 다른 검증 라이브러리

zod 외에도 같은 역할을 하는 라이브러리가 여럿 있습니다. 이름만 알아 두고, 프로젝트에서 이미 쓰는 것이 있으면 그것을 따르세요.

- **valibot** — 함수를 조합하는 방식이라 번들(배포 파일) 크기가 작습니다.
- **ArkType** — TypeScript 타입 문법과 비슷한 문자열로 스키마를 적습니다.
- **yup** — 오래전부터 폼 라이브러리와 함께 많이 쓰였습니다.
- **TypeBox** — JSON Schema 표준 형식을 만들어 냅니다.

## 자주 하는 실수

### 실수 1: z.infer에 typeof를 빠뜨린다

```ts
const ProductSchema = z.object({ name: z.string(), price: z.number() })
type Product = z.infer<ProductSchema>
// ❌ 'ProductSchema' refers to a value, but is being used as a type here. Did you mean 'typeof ProductSchema'? (TS2749)
```

**왜 틀렸나:** `ProductSchema`는 **값**(실행 중에 존재하는 객체)입니다. 타입 자리에 값을 쓰려면 `typeof`로 그 값의 타입을 꺼내야 합니다.

```ts
// 고친 코드
type Product = z.infer<typeof ProductSchema>
```

### 실수 2: interface와 스키마를 따로 적는다

```ts
interface Member {
  id: string
  name: string
  point: number // 나중에 추가함
}
const MemberSchema = z.object({ id: z.string(), name: z.string() }) // 여기는 안 고침

function toMember(raw: unknown): Member {
  return MemberSchema.parse(raw)
  // ❌ Property 'point' is missing in type '{ id: string; name: string; }' but required in type 'Member'. (TS2741)
}
```

**왜 틀렸나:** 같은 정보를 두 곳에 적으면 언젠가 어긋납니다. 이 경우는 운 좋게 컴파일러가 잡았지만, 선택 속성이나 더 넓은 타입이 섞이면 조용히 지나갑니다.

```ts
// 고친 코드: 스키마 하나만 적고 타입은 뽑아냅니다.
const MemberSchema = z.object({ id: z.string(), name: z.string(), point: z.number() })
type Member = z.infer<typeof MemberSchema>
```

### 실수 3: 빈 입력칸을 z.coerce.number()로 받는다

```ts
console.log(z.coerce.number().safeParse('').data) // 출력: 0
```

**왜 틀렸나:** `z.coerce.number()`는 내부에서 `Number(값)`을 부릅니다. JavaScript에서 `Number('')`와 `Number('  ')`는 `0`입니다. 가격 입력칸을 비워 두었는데 **0원 상품이 등록**될 수 있습니다.

```ts
// 고친 코드: 문자열로 먼저 "비어 있지 않음"을 확인하고, 그다음 숫자로 바꿉니다.
const PriceInput = z
  .string()
  .trim()
  .min(1, { error: '가격을 입력하세요' })
  .transform((text) => Number(text))
  .pipe(z.number({ error: '가격은 숫자로 입력하세요' }).int().positive({ error: '가격은 0보다 커야 합니다' }))

for (const v of ['', 'abc', '0', '4500']) {
  const r = PriceInput.safeParse(v)
  console.log(JSON.stringify(v), r.success ? r.data : r.error.issues[0]?.message)
}
```

```text
"" 가격을 입력하세요
"abc" 가격은 숫자로 입력하세요
"0" 가격은 0보다 커야 합니다
"4500" 4500
```

`.transform(함수)`는 검증을 통과한 값을 바꾸고, `.pipe(스키마)`는 바뀐 값을 다음 스키마로 다시 검사합니다. `Number('abc')`는 `NaN`이고, zod 4의 `z.number()`는 `NaN`을 거부합니다.

### 실수 4: parse를 try 없이 쓰고 오류를 사용자에게 그대로 보여 준다

```ts
function onSubmit(form: unknown): void {
  const member = MemberFormSchema.parse(form) // 실패하면 throw → 화면 처리 코드까지 멈춤
  save(member)
}
```

**왜 틀렸나:** 폼 입력 실패는 흔한 일입니다. `parse`로 던지면 매번 `try/catch`가 필요하고, 잡지 않으면 화면이 멈춥니다.

```ts
// 고친 코드: 폼에는 safeParse
function onSubmit(form: unknown): void {
  const result = MemberFormSchema.safeParse(form)
  if (!result.success) {
    showFieldErrors(z.flattenError(result.error).fieldErrors) // 입력칸마다 오류 표시
    return
  }
  save(result.data)
}
```

### 실수 5: 검증하고 나서 원래 값을 쓴다

```ts
const raw: unknown = await res.json()
ProductSchema.parse(raw)          // 검사만 하고 결과는 버림
const product = raw as Product    // 결국 다시 단언!
```

**왜 틀렸나:** `parse`가 돌려주는 값은 **검사를 통과하고 정리된(공백 제거, 숫자 변환, 기본값, 모르는 속성 제거) 새 값**이고, 타입도 붙어 있습니다. 원래 값을 쓰면 이 모든 것을 잃고 `as`로 돌아갑니다.

```ts
// 고친 코드
const product = ProductSchema.parse(raw) // product: Product
```

## 직접 해 보기

### 문제 1 ⭐ 회원 타입 가드 직접 만들기

`interface Member { id: string; name: string; point: number }`에 대한 타입 가드 `isMember(value: unknown): value is Member`를 zod 없이 만드세요. `point`는 0 이상의 숫자여야 합니다.

::: details 정답 보기
```ts
interface Member {
  id: string
  name: string
  point: number
}

function isMember(value: unknown): value is Member {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown> // 속성에 접근하려고 한 번만 단언
  return (
    typeof v.id === 'string' &&
    typeof v.name === 'string' &&
    typeof v.point === 'number' &&
    v.point >= 0
  )
}

console.log(isMember({ id: 'M001', name: '김하나', point: 1200 })) // 출력: true
console.log(isMember({ id: 'M002', name: '이두리', point: -1 }))   // 출력: false
console.log(isMember('M003'))                                        // 출력: false
```
3단계처럼 `isObject` 도우미를 만들어 단언 없이 좁혀도 됩니다.
:::

### 문제 2 ⭐ 주문 항목 스키마

다음 조건의 `OrderItemSchema`를 만들고 `OrderItem` 타입을 뽑으세요.

- `productCode`: `P`와 숫자 세 자리(`P001`)
- `quantity`: 1 이상 99 이하 정수
- `option`: 문자열, 없어도 됨

::: details 정답 보기
```ts
const OrderItemSchema = z.object({
  productCode: z.string().regex(/^P\d{3}$/),
  quantity: z.number().int().min(1).max(99),
  option: z.string().optional(),
})
type OrderItem = z.infer<typeof OrderItemSchema>
// { productCode: string; quantity: number; option?: string | undefined }

console.log(OrderItemSchema.safeParse({ productCode: 'P1', quantity: 0 }).success)
// 출력: false
```
:::

### 문제 3 ⭐⭐ 상품 등록 폼 검증

상품명(앞뒤 공백 제거 후 1글자 이상)과 가격(문자열로 들어오는 양의 정수)을 검증하는 `ProductFormSchema`를 만들고, 아래 세 입력의 결과를 필드별 한국어 메시지로 출력하세요.

```ts
const inputs = [
  { name: '  ', price: '-500' },
  { name: '카페모카', price: '5500' },
  { name: '라떼', price: 'abc' },
]
```

::: details 정답 보기
```ts
const ProductFormSchema = z.object({
  name: z.string().trim().min(1, { error: '상품명을 입력하세요' }),
  price: z.coerce
    .number({ error: '가격은 숫자로 입력하세요' })
    .int({ error: '가격은 정수로 입력하세요' })
    .positive({ error: '가격은 0보다 커야 합니다' }),
})

for (const input of inputs) {
  const result = ProductFormSchema.safeParse(input)
  if (result.success) console.log('저장:', result.data)
  else console.log('오류:', z.flattenError(result.error).fieldErrors)
}
```
```text
오류: { name: [ '상품명을 입력하세요' ], price: [ '가격은 0보다 커야 합니다' ] }
저장: { name: '카페모카', price: 5500 }
오류: { price: [ '가격은 숫자로 입력하세요' ] }
```
빈 가격 입력까지 막으려면 "자주 하는 실수 3"의 `PriceInput` 방식을 쓰세요(`.positive()`가 있어서 이 문제에서는 빈 값이 0 → "0보다 커야 합니다"로 걸립니다).
:::

### 문제 4 ⭐⭐ 회원 목록 응답 검증

8단계의 스키마 버전 `request`를 써서 `/users`를 조회하세요. 각 회원은 `id`(숫자), `name`(문자열), `email`(이메일 형식)을 가져야 합니다. 첫 회원의 이름과 이메일을 출력하세요.

::: details 정답 보기
```ts
const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.email(),
})

const users = await request('/users', z.array(UserSchema))
console.log(users.length, users[0]?.name, users[0]?.email)
// 출력: 10 Leanne Graham Sincere@april.biz
```
서버는 `address`, `phone` 같은 속성도 보내지만 스키마에 없으므로 결과에서 빠집니다. 화면에 필요한 것만 검증하고 남기는 것도 스키마의 장점입니다.
:::

### 문제 5 ⭐⭐⭐ 결제 데이터 검증과 처리

9단계의 `PaymentSchema`를 쓰되, 카드 번호는 `1234-****-****-5678`처럼 가운데가 가려진 형식만 허용하세요. 그리고 아래 세 데이터를 검증해 통과하면 설명 문구를, 실패하면 `거부: 메시지`를 출력하세요.

```ts
const rawPayments: unknown[] = [
  { method: 'cash', amount: 4500, received: 10000 },
  { method: 'card', amount: 5000, cardNo: '1234-****-****-5678' },
  { method: 'coupon', amount: 1000 },
]
```

::: details 정답 보기
```ts
const PaymentSchema = z.discriminatedUnion('method', [
  z.object({
    method: z.literal('card'),
    amount: z.number().positive(),
    cardNo: z.string().regex(/^\d{4}-\*{4}-\*{4}-\d{4}$/), // 가려진 번호만 허용
  }),
  z.object({ method: z.literal('cash'), amount: z.number().positive(), received: z.number() }),
  z.object({ method: z.literal('point'), amount: z.number().positive(), memberId: z.string() }),
])
type Payment = z.infer<typeof PaymentSchema>

function describe(p: Payment): string {
  switch (p.method) {
    case 'card':
      return `카드 ${p.cardNo} ${p.amount}원`
    case 'cash':
      return `현금 ${p.amount}원(거스름돈 ${p.received - p.amount}원)`
    case 'point':
      return `포인트 ${p.amount}점(${p.memberId})`
  }
}

for (const raw of rawPayments) {
  const r = PaymentSchema.safeParse(raw)
  console.log(r.success ? describe(r.data) : `거부: ${r.error.issues[0]?.message}`)
}
```
```text
현금 4500원(거스름돈 5500원)
카드 1234-****-****-5678 5000원
거부: Invalid discriminator value. Expected 'card' | 'cash' | 'point'
```
카드 번호 전체가 로그나 화면에 남지 않도록 **가려진 형식만 받는** 규칙을 스키마에 넣었습니다. 검증은 보안 규칙을 지키는 데도 씁니다.
:::

### 문제 6 ⭐⭐⭐ 잘못된 항목만 빼고 쓰기

서버가 보낸 상품 배열 중 일부만 형식이 틀렸습니다. 배열 전체를 버리는 대신, **올바른 항목만 남기고** 틀린 항목은 번호와 틀린 필드를 로그로 남기는 `keepValid(items: unknown[]): Product[]`를 만드세요.

```ts
const ProductSchema = z.object({ code: z.string(), name: z.string(), price: z.number() })
type Product = z.infer<typeof ProductSchema>

keepValid([
  { code: 'P001', name: '아메리카노', price: 4500 },
  { code: 'P002', name: '카페라테' },
  { code: 'P003', name: '카페모카', price: '5500' },
  { code: 'P004', name: '바닐라라테', price: 5500 },
])
```

::: details 정답 보기
```ts
function keepValid(items: unknown[]): Product[] {
  const valid: Product[] = []
  items.forEach((item, i) => {
    const r = ProductSchema.safeParse(item)
    if (r.success) {
      valid.push(r.data)
    } else {
      console.log(`${i}번 항목 제외: ${r.error.issues.map((x) => x.path.join('.')).join(', ')}`)
    }
  })
  return valid
}

const list = keepValid([/* 위 데이터 */])
console.log(list.map((p) => p.name))
```
```text
1번 항목 제외: price
2번 항목 제외: price
[ '아메리카노', '바닐라라테' ]
```
`z.array(ProductSchema).parse(...)`는 하나만 틀려도 전체가 실패합니다. 메뉴판처럼 "일부라도 보여 주는 게 나은" 화면에서는 항목별로 검증합니다. 반대로 결제 내역처럼 하나라도 틀리면 안 되는 데이터는 전체를 실패로 처리하는 편이 안전합니다.
:::

## 확인 퀴즈

1. 타입 소거란 무엇입니까? `if (data instanceof Product)`(Product는 interface)가 안 되는 이유는요?
2. 외부에서 들어온 데이터를 `any`가 아니라 `unknown`으로 받는 이유는 무엇입니까?
3. 타입 서술어 `value is Product`를 반환 타입으로 쓰면 무엇이 달라집니까?
4. zod의 `parse`와 `safeParse`는 실패했을 때 각각 어떻게 동작합니까?
5. `z.infer<typeof ProductSchema>`를 쓰면 무엇이 좋습니까?

::: details 정답 보기
1. 컴파일하면 TypeScript의 타입 정보가 모두 지워지는 것입니다. 실행 중에는 `Product`라는 interface가 존재하지 않으므로 `instanceof`로 검사할 수 없습니다.
2. `unknown`은 검사(좁히기) 전에는 속성 접근이나 연산을 막아 주므로, 검증을 빼먹으면 컴파일 오류로 알 수 있습니다. `any`는 검사를 꺼 버리고 다른 값으로 전염됩니다.
3. 그 함수가 `true`를 돌려준 `if` 블록 안에서 TypeScript가 값을 `Product`로 좁혀 줍니다.
4. `parse`는 `ZodError`를 던지고, `safeParse`는 `{ success: false, error }` 결과 객체를 돌려줍니다.
5. 스키마 하나에서 검증과 타입을 함께 얻으므로, 타입과 검사 코드를 두 번 적다가 어긋나는 일이 없습니다.
:::

## 정리

- TypeScript의 타입은 컴파일 후 사라집니다(타입 소거). 실행 중에 들어오는 외부 데이터에 붙인 타입은 검사가 아니라 약속입니다.
- 외부 데이터는 경계에서 `unknown`으로 받고, 검증을 통과한 뒤에만 구체적인 타입으로 씁니다.
- 직접 만든 타입 가드(`value is T`)로도 검증할 수 있지만, 타입과 검사를 두 번 적어야 하고 실패 이유를 알기 어렵습니다.
- zod는 스키마(실행 중에도 존재하는 값)로 검증하고, `z.infer`로 타입을 뽑아 정보를 한 곳에 모읍니다.
- 실패가 비정상인 곳(API 응답)은 `parse`, 실패가 흔한 곳(폼)은 `safeParse`를 쓰고, 사용자 메시지는 `{ error: '...' }`로 직접 적습니다.
- `z.coerce.number()`는 빈 문자열을 0으로 바꾸므로 폼 입력에서는 주의합니다.

## 다음 단계

[JSON · Date · Map · Set 타입 안전하게 쓰기](./06-json-date-map-set) — `JSON.parse`가 `any`를 돌려주는 문제, `JSON.stringify`가 `Date`·`Map`을 망가뜨리는 함정, UTC와 한국 시간 차이, `Map<K, V>`와 `Set<T>`를 다룹니다.
