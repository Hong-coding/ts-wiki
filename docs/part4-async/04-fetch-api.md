---
title: fetch로 API 호출하고 응답에 타입 붙이기
---

# fetch로 API 호출하고 응답에 타입 붙이기

<LessonMeta level="중급" :minutes="60" prev="async/await로 비동기 코드를 쓰고 try/catch로 오류를 처리하는 법" />

## 이번에 배울 것

- `fetch`로 GET·POST·PATCH·DELETE 요청을 보내고, 헤더와 JSON 본문을 설정할 수 있다.
- `res.ok`를 확인해야 하는 이유(404·500은 거부되지 않는다)를 설명할 수 있다.
- `res.json()`이 `Promise<any>`를 돌려주는 문제와 `as` 단언의 한계를 설명할 수 있다.
- 공통 요청 함수 `request<T>()`와 전용 에러 클래스를 만들어 API 호출 코드를 한곳에 모을 수 있다.
- `AbortController`와 `AbortSignal.timeout()`으로 요청을 취소하고 시간 제한을 걸 수 있다.

## 먼저 알아 둘 것

- `async`/`await`와 `try/catch`: [async/await와 비동기 오류 처리](./03-async-await)
- 제네릭 함수: [제네릭 기초](../part3-intermediate/04-generics-basics)
- 클래스와 상속(`extends`): [클래스](../part3-intermediate/08-classes)
- 타입 단언 `as`: [타입 단언](../part2-types/10-assertion)
- `any`와 `unknown`의 차이: [특수 타입](../part2-types/02-special-types)

::: info 실습 환경
- **Node.js 18 이상**이 필요합니다. `fetch`는 Node.js 18부터 별도 설치 없이 쓸 수 있습니다(21부터 정식 기능). 브라우저에서는 오래전부터 기본 제공됩니다.
- TypeScript에서 `fetch`의 타입은 `lib` 설정의 `dom`에 들어 있습니다. tsconfig의 `lib`에 `"dom"`이 있는지 확인하세요(Node.js 전용 프로젝트라면 `@types/node`도 `fetch` 타입을 제공합니다).
- 인터넷 연결이 필요합니다. 연습용 무료 가짜 API인 [JSONPlaceholder](https://jsonplaceholder.typicode.com)를 씁니다. 회원(`/users`), 할 일(`/todos`), 게시글(`/posts`) 데이터가 영어 예시 문장으로 들어 있습니다. 쓰기 요청(POST 등)을 보내면 성공 응답은 오지만 **실제로 저장되지는 않습니다.**
:::

## 비유로 이해하기

`fetch`는 **본사에 보내는 주문서**와 같습니다. 매장(프로그램)이 본사(서버)에 주문서를 보내면, 본사는 **답장 봉투**(응답, Response)를 돌려보냅니다.

| 우편 | HTTP 요청 |
|---|---|
| 받는 곳 주소 | URL — `https://jsonplaceholder.typicode.com/users/1` |
| 주문서 종류(조회·신청·수정·취소) | 메서드 — GET·POST·PATCH·DELETE |
| 봉투 겉면의 안내 문구 | 헤더(headers) — `Content-Type: application/json` 등 |
| 봉투 안의 내용물 | 본문(body) |
| 답장 봉투에 찍힌 처리 결과 도장 | 상태 코드 — 200(성공), 404(없음), 500(서버 오류) |

여기서 중요한 점이 하나 있습니다. **답장 봉투가 도착했다고 해서 주문이 성공한 것은 아닙니다.** 봉투에 "해당 상품 없음(404)" 도장이 찍혀 있을 수 있습니다. `fetch`는 봉투가 **도착하기만 하면** 성공(이행)으로 처리합니다. 도장은 우리가 직접 확인해야 합니다. 봉투 자체가 오지 않을 때(인터넷 끊김, 주소 오류)만 실패(거부)입니다.

그리고 봉투 안의 내용물에는 **라벨이 붙어 있지 않습니다.** 본사가 약속한 상품을 보냈는지, 엉뚱한 것을 보냈는지는 열어서 확인해야 압니다. 이것이 이번 레슨 후반과 다음 레슨의 주제입니다.

## 개념 설명

### 1단계: 첫 GET 요청

```ts
async function main(): Promise<void> {
  const res = await fetch('https://jsonplaceholder.typicode.com/users/1')
  console.log(res.status, res.ok, res.statusText)
  console.log(res.headers.get('content-type'))

  const data = await res.json()
  console.log(data.id, data.name, data.email)
}
main()
```

```text
200 true OK
application/json; charset=utf-8
1 Leanne Graham Sincere@april.biz
```

해설:

- `fetch(URL)`은 `Promise<Response>`를 돌려줍니다. 옵션 없이 부르면 **GET(조회)** 요청입니다.
- `await`가 **두 번** 있습니다. 첫 번째 `await fetch(...)`는 **응답의 머리 부분(상태 코드·헤더)** 이 도착할 때까지 기다립니다. 두 번째 `await res.json()`은 **본문 전체**를 받아 JSON으로 해석할 때까지 기다립니다. 본문이 큰 경우 머리와 본문이 도착하는 시점이 다르기 때문입니다.
- `Response` 객체에서 자주 쓰는 속성과 메서드는 아래와 같습니다.

| 이름 | 타입 | 뜻 |
|---|---|---|
| `res.status` | `number` | 상태 코드(200, 404 등) |
| `res.ok` | `boolean` | 상태 코드가 200~299이면 `true` |
| `res.statusText` | `string` | 상태 문구(`OK`, `Not Found` 등). HTTP/2 응답에서는 빈 문자열일 수 있음 |
| `res.headers.get(이름)` | `string \| null` | 응답 헤더 값 |
| `res.json()` | `Promise<any>` | 본문을 JSON으로 해석 |
| `res.text()` | `Promise<string>` | 본문을 문자열 그대로 |

::: warning 본문은 한 번만 읽을 수 있습니다
`res.json()`이나 `res.text()`를 한 번 부르면 본문이 소비됩니다. 다시 부르면 `TypeError: Body is unusable: Body has already been read`(Node.js 기준) 오류가 납니다. 두 번 써야 한다면 처음 읽은 값을 변수에 담아 두세요.
:::

### 2단계: 404는 거부되지 않는다 — res.ok를 꼭 확인하기

없는 회원(999번)을 조회해 보겠습니다.

```ts
async function main(): Promise<void> {
  const res = await fetch('https://jsonplaceholder.typicode.com/users/999')
  console.log('status:', res.status, 'ok:', res.ok)
  const body = await res.json()
  console.log('body:', body)

  try {
    await fetch('https://no-such-host.invalid/users') // 존재하지 않는 주소
  } catch (error) {
    console.log('네트워크 오류:', error instanceof Error ? `${error.name}: ${error.message}` : error)
  }
}
main()
```

```text
status: 404 ok: false
body: {}
네트워크 오류: TypeError: fetch failed
```

| 상황 | `fetch`의 Promise | 확인 방법 |
|---|---|---|
| 200~299 성공 | 이행 | `res.ok === true` |
| 404 없음, 401 인증 필요, 500 서버 오류 등 | **이행** | `res.ok === false`, `res.status`로 구분 |
| 인터넷 끊김, 주소 오류, 브라우저의 CORS 차단 | 거부 (`TypeError`) | `try/catch` |
| 취소·시간 초과 | 거부 (`AbortError`/`TimeoutError`) | 7단계 |

404인데도 `catch`로 가지 않고 `body: {}`가 그대로 찍혔습니다. `res.ok`를 확인하지 않으면 "빈 객체"를 회원 정보로 착각하고 화면에 `undefined`를 그리게 됩니다. 그래서 `fetch`를 쓸 때는 **항상** 이렇게 씁니다.

```ts
const res = await fetch('https://jsonplaceholder.typicode.com/users/999')
if (!res.ok) {
  throw new Error(`HTTP ${res.status}`) // 성공이 아니면 직접 실패로 바꿉니다.
}
const data = await res.json()
```

::: info Node.js와 브라우저의 오류 메시지
네트워크 오류 메시지는 환경마다 다릅니다. Node.js는 `fetch failed`, Chrome은 `Failed to fetch`, Firefox는 `NetworkError when attempting to fetch resource.`입니다. 그래서 메시지 문구가 아니라 **오류의 종류(`TypeError`)** 로 판단합니다.
:::

### 3단계: 요청 옵션 — method, headers, body

`fetch`의 두 번째 인자로 옵션 객체(`RequestInit` 타입)를 넘깁니다. 새 게시글을 등록(POST)해 보겠습니다.

```ts
interface NewPost {
  title: string
  body: string
  userId: number
}

async function main(): Promise<void> {
  const newPost: NewPost = { title: '강남점 공지', body: '오늘 22시 마감합니다', userId: 1 }

  const res = await fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',                                       // 등록
    headers: { 'Content-Type': 'application/json; charset=UTF-8' }, // "본문은 JSON입니다"
    body: JSON.stringify(newPost),                        // 객체 → JSON 문자열
  })
  console.log(res.status, res.ok)
  console.log(await res.json())
}
main()
```

```text
201 true
{ title: '강남점 공지', body: '오늘 22시 마감합니다', userId: 1, id: 101 }
```

- **`body`에는 객체를 그대로 넣을 수 없습니다.** `JSON.stringify`로 문자열로 바꿔 넣어야 합니다. 객체를 그대로 넣으면 `[object Object]`라는 글자가 전송됩니다.
- **`Content-Type` 헤더**는 "본문이 어떤 형식인지" 서버에 알려 줍니다. 빠뜨리면 서버가 JSON으로 해석하지 못하는 경우가 많습니다.
- 201은 "새로 만들었음(Created)"이라는 성공 코드입니다. 연습 서버는 새 글에 `id: 101`을 붙여 돌려주지만 실제로 저장하지는 않습니다.

다른 메서드도 같은 방식입니다.

```ts
// 일부 수정
const patched = await fetch('https://jsonplaceholder.typicode.com/posts/1', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: '제목만 수정' }),
})
console.log('PATCH', patched.status) // 출력: PATCH 200

// 삭제
const deleted = await fetch('https://jsonplaceholder.typicode.com/posts/1', { method: 'DELETE' })
console.log('DELETE', deleted.status) // 출력: DELETE 200
```

| 메서드 | 뜻 | 본문 |
|---|---|---|
| GET | 조회 | 없음 |
| POST | 새로 등록 | 있음 |
| PUT | 통째로 교체 | 있음 |
| PATCH | 일부만 수정 | 있음 |
| DELETE | 삭제 | 보통 없음 |

#### 검색 조건은 URLSearchParams로

GET 요청에 조건을 붙일 때는 URL 뒤에 `?이름=값&이름=값` 형태의 **쿼리 문자열(query string)** 을 씁니다. 손으로 이어 붙이면 한글·공백·`&` 같은 특수 문자가 깨지므로 `URLSearchParams`를 씁니다.

```ts
const params = new URLSearchParams({ userId: '1', completed: 'false' })
console.log(params.toString()) // 출력: userId=1&completed=false

const res = await fetch(`https://jsonplaceholder.typicode.com/todos?${params}`)
const todos = await res.json()
console.log(todos.length) // 출력: 9  (1번 회원의 끝나지 않은 할 일)
```

::: danger 민감한 값은 URL에 넣지 마세요
URL은 서버 로그, 브라우저 기록, 프록시 기록에 그대로 남습니다. 비밀번호·카드번호·주민등록번호·인증 토큰 같은 값은 쿼리 문자열이 아니라 **본문이나 헤더**로 보내야 합니다. 인증 토큰은 보통 `Authorization` 헤더에 넣고, 토큰 값 자체를 코드에 직접 적지 않습니다(환경 변수나 로그인 응답에서 받아 씁니다).
:::

### 4단계: res.json()은 `Promise<any>`다

1단계 예제에서 `data.name`에 마우스를 올려 보면 타입이 `any`입니다. `res.json()`의 타입 정의가 `Promise<any>`이기 때문입니다. 서버가 무엇을 보낼지 TypeScript는 알 수 없으니까요.

`any`는 타입 검사를 **꺼 버리는** 타입입니다. 그래서 이런 코드가 모두 통과합니다.

```ts
const res = await fetch('https://jsonplaceholder.typicode.com/users/1')
const data = await res.json()  // data: any

const n: number = data.name    // ✅ 통과 — 실제로는 문자열인데!
data.nmae.toUpperCase()        // ✅ 통과 — 오타인데! 실행하면 TypeError
```

`any`는 **전염됩니다.** `data`에서 꺼낸 값도 모두 `any`가 되고, 그 값을 넘겨받은 함수의 매개변수에도 타입 검사가 안 걸립니다. API 응답을 `any`로 두면 프로그램 전체에 구멍이 퍼집니다.

#### 타입을 붙여 보자: 그런데 as의 한계

가장 먼저 떠오르는 방법은 타입을 적는 것입니다.

```ts
interface User {
  id: number
  name: string
  email: string
}

const user: User = await res.json()        // 방법 A: 변수 타입 표기
const user2 = (await res.json()) as User   // 방법 B: as 단언
```

이제 `user.nmae`처럼 오타를 내면 컴파일 오류가 납니다. 편리해졌습니다. 하지만 **이것은 검사가 아니라 약속**입니다. `any`는 어떤 타입에도 넣을 수 있으므로, TypeScript는 "개발자가 `User`라고 했으니 믿겠다"며 넘어갈 뿐입니다.

엉뚱한 주소에서 받은 데이터를 상품이라고 단언해 보겠습니다.

```ts
interface Product {
  name: string
  price: number
}

async function main(): Promise<void> {
  const res = await fetch('https://jsonplaceholder.typicode.com/users/1') // 회원 정보 주소!
  const product = (await res.json()) as Product
  console.log(product.name)                           // 회원 이름이 상품명인 척 찍힘
  console.log(`${product.price.toLocaleString()}원`)  // 실제로는 price가 없음
}
main().catch((e: unknown) => console.log(e instanceof Error ? `${e.name}: ${e.message}` : e))
```

```text
Leanne Graham
TypeError: Cannot read properties of undefined (reading 'toLocaleString')
```

컴파일은 깨끗하게 통과했지만 실행하자 터졌습니다. 실무에서는 이런 일이 자주 생깁니다.

- 백엔드가 필드 이름을 `price`에서 `salePrice`로 바꿨는데 프론트에 알리지 않았습니다.
- 숫자로 오던 값이 어느 날 문자열(`"4500"`)로 오기 시작했습니다.
- 값이 없을 때 빈 배열 대신 `null`이 옵니다.

::: warning 정리: 응답에 붙이는 타입은 "희망 사항"입니다
`as User`나 `: User`는 **컴파일러에게 하는 약속**입니다. 실행 중에 실제 데이터를 확인하지는 않습니다. TypeScript의 타입은 컴파일 후 모두 사라지기 때문입니다. 실행 중에 진짜로 확인하는 방법(런타임 검증)은 [다음 레슨](./05-runtime-validation)에서 배웁니다. 이번 레슨에서는 우선 **이 단언을 한 곳에만 모아 두는 법**을 익힙니다.
:::

### 5단계: 에러 클래스 만들기

`res.ok`가 `false`일 때 그냥 `new Error('HTTP 404')`를 던지면, 받는 쪽에서 상태 코드를 꺼내려면 메시지 문자열을 잘라야 합니다. **에러 클래스**를 만들어 필요한 정보를 속성으로 담아 둡시다.

```ts
// 서버가 2xx가 아닌 상태 코드로 응답했을 때 던지는 오류
export class HttpError extends Error {
  readonly status: number
  readonly url: string
  readonly body: unknown

  constructor(status: number, url: string, body: unknown) {
    super(`HTTP ${status} 오류: ${url}`)
    this.name = 'HttpError'
    this.status = status
    this.url = url
    this.body = body
  }
}

// 응답 본문이 JSON이 아닐 때 던지는 오류
export class ParseError extends Error {
  readonly url: string

  constructor(url: string, cause: unknown) {
    super(`응답을 JSON으로 읽을 수 없습니다: ${url}`, { cause })
    this.name = 'ParseError'
    this.url = url
  }
}
```

- `extends Error`로 기본 `Error`를 물려받으므로 `message`, `stack`이 그대로 있습니다.
- `this.name`을 바꿔 두면 로그에 `HttpError: ...`처럼 종류가 찍혀 구분하기 쉽습니다.
- 받는 쪽에서는 `error instanceof HttpError`로 좁힌 뒤 `error.status`를 안전하게 씁니다.
- `body`는 서버가 보낸 오류 내용(예: `{ "message": "재고 부족" }`)입니다. 무엇이 올지 모르므로 `unknown`으로 둡니다.
- `super(메시지, { cause })`의 `cause`(원인)는 ES2022 기능으로, 원래 오류를 함께 담아 둡니다(`lib`에 `es2022` 필요).

### 6단계: 공통 요청 함수 `request<T>()`

화면마다 `fetch` → `res.ok` 확인 → `json()` → 오류 변환을 반복하면 어딘가에서 빠뜨리게 됩니다. 이 과정을 함수 하나에 모읍니다. 실무 프로젝트라면 `api.ts` 같은 파일 하나에 둡니다.

```ts
// api.ts
const BASE_URL = 'https://jsonplaceholder.typicode.com'

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  timeoutMs?: number
  signal?: AbortSignal
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, timeoutMs = 5000, signal } = options
  const url = `${BASE_URL}${path}`

  // 타임아웃 신호와 호출한 쪽의 취소 신호 중 먼저 오는 쪽으로 중단합니다(7단계).
  const timeoutSignal = AbortSignal.timeout(timeoutMs)
  const res = await fetch(url, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal,
  })

  // 본문이 비어 있을 수도 있으므로(204 No Content 등) 텍스트로 먼저 읽습니다.
  const text = await res.text()
  let data: unknown = undefined
  if (text !== '') {
    try {
      data = JSON.parse(text)
    } catch (error) {
      throw new ParseError(url, error)
    }
  }

  if (!res.ok) {
    throw new HttpError(res.status, url, data)
  }
  return data as T // ⚠️ 모양을 검사하지 않은 단언 — 다음 레슨에서 검증으로 바꿉니다.
}
```

이 함수의 설계를 짚어 보겠습니다.

- **`<T>`는 호출하는 쪽이 정합니다.** `request<User>('/users/1')`처럼 부르면 반환 타입이 `Promise<User>`가 됩니다.
- **`res.json()` 대신 `res.text()` + `JSON.parse`** 를 썼습니다. 본문이 비어 있는 응답(삭제 성공 시 204 등)에서 `res.json()`은 오류를 내기 때문입니다. 또 `JSON.parse`의 결과를 `unknown` 변수에 받아서 `any`가 퍼지지 않게 막았습니다.
- **`res.ok`가 아니면 `HttpError`를 던집니다.** 이제 404·500도 `catch`로 갑니다.
- **위험한 `as T`는 이 함수 안 단 한 곳에만** 있습니다. 나중에 검증을 넣을 때도 이곳만 고치면 됩니다. 이것이 공통 함수를 만드는 가장 큰 이유입니다.

사용하는 쪽은 이렇게 짧아집니다.

```ts
// main.ts
import { request, HttpError } from './api.js'

interface Todo { userId: number; id: number; title: string; completed: boolean }
interface User { id: number; name: string; email: string }

async function main(): Promise<void> {
  const todo = await request<Todo>('/todos/1')
  console.log(todo.id, todo.title, todo.completed)

  const users = await request<User[]>('/users')
  console.log('회원 수:', users.length, '/ 첫 회원:', users[0]?.name)

  const created = await request<Todo>('/todos', {
    method: 'POST',
    body: { userId: 1, title: '강남점 재고 확인', completed: false },
  })
  console.log('생성됨:', created.id, created.title)

  try {
    await request<User>('/users/999')
  } catch (error) {
    if (error instanceof HttpError) {
      console.log(error.name, error.status, error.message)
    }
  }
}
main()
```

```text
1 delectus aut autem false
회원 수: 10 / 첫 회원: Leanne Graham
생성됨: 201 강남점 재고 확인
HttpError 404 HTTP 404 오류: https://jsonplaceholder.typicode.com/users/999
```

`users[0]?.name`에서 `?.`를 쓴 이유: 배열이 비어 있으면 `users[0]`이 `undefined`이기 때문입니다. (`noUncheckedIndexedAccess` 옵션을 켜면 TypeScript가 이를 강제합니다. [strict 옵션 레슨](../part6-tooling/02-strict-options)에서 다룹니다.)

::: tip import 경로의 .js
`'./api.js'`처럼 확장자를 `.js`로 적은 것은 Node.js ES 모듈 방식(`module: "nodenext"`)의 규칙입니다. 컴파일된 뒤의 파일 이름을 적습니다. Vite 같은 번들러를 쓰는 프로젝트에서는 `'./api'`로 적습니다. [모듈 시스템 레슨](../part6-tooling/03-module-systems)에서 자세히 다룹니다.
:::

### 7단계: AbortController로 취소하고 시간 제한 걸기

`fetch`에는 기본 시간 제한이 없습니다. 서버가 응답하지 않으면 POS 화면의 로딩 표시가 하염없이 돌 수 있습니다. 또 사용자가 검색어를 빠르게 바꾸면 이전 검색 요청은 필요 없어집니다. 이럴 때 요청을 **중단(abort)** 합니다.

#### AbortController — 직접 취소하기

```ts
const controller = new AbortController() // 리모컨
setTimeout(() => controller.abort(), 0)   // 바로 취소 버튼을 누름

try {
  await fetch('https://jsonplaceholder.typicode.com/photos', { signal: controller.signal })
} catch (error) {
  if (error instanceof Error) console.log(error.name)
}
// 출력: AbortError
```

- `AbortController`는 **리모컨**, `controller.signal`은 리모컨과 연결된 **수신기**입니다. 수신기를 `fetch`에 꽂아 두고, 리모컨의 `abort()`를 누르면 요청이 중단됩니다.
- 중단된 `fetch`는 이름(`name`)이 `'AbortError'`인 오류로 거부됩니다.

#### AbortSignal.timeout — 시간 제한 걸기

```ts
try {
  await fetch('https://jsonplaceholder.typicode.com/photos', { signal: AbortSignal.timeout(1) }) // 1ms 제한
} catch (error) {
  if (error instanceof Error) console.log(error.name, error.message)
}
// 출력: TimeoutError The operation was aborted due to timeout
```

`AbortSignal.timeout(ms)`는 "ms 뒤에 저절로 취소되는 수신기"를 만듭니다. 시간 초과일 때는 오류 이름이 `'TimeoutError'`라서, 사용자가 취소한 경우(`'AbortError'`)와 구분할 수 있습니다. 지난 레슨들의 `Promise.race` 타임아웃과 달리 **요청 자체를 실제로 중단**한다는 점이 다릅니다.

#### 둘 다 쓰기: AbortSignal.any

6단계의 `request`에서는 "호출한 쪽의 취소"와 "시간 초과"를 둘 다 지원하려고 `AbortSignal.any([신호1, 신호2])`를 썼습니다. 둘 중 하나라도 취소되면 취소되는 신호를 만듭니다.

| 기능 | Node.js | 브라우저(대략) |
|---|---|---|
| `fetch` | 18부터(21부터 정식) | 모든 최신 브라우저 |
| `AbortController` | 15부터 | 모든 최신 브라우저 |
| `AbortSignal.timeout()` | 17.3부터 | 2022년 무렵 이후 버전 |
| `AbortSignal.any()` | 20.3부터 | 2023~2024년 이후 버전 |

`AbortSignal.any`를 쓸 수 없는 환경이라면 `AbortController` 하나를 만들고 `setTimeout(() => controller.abort(), ms)`로 직접 시간 제한을 거는 방식을 씁니다.

::: tip 실무 메모
대부분의 업무 시스템은 HTTP 호출을 `fetch` 대신 axios 같은 라이브러리로 감싸서 쓰기도 합니다. 라이브러리를 쓰더라도 "상태 코드 확인, 공통 에러 타입, 타임아웃, 단언을 한 곳에 모으기"라는 원칙은 같습니다. [API 클라이언트 타입 설계 레슨](../part7-practice/06-api-client)에서 다시 다룹니다.
:::

## 자주 하는 실수

### 실수 1: res.ok를 확인하지 않는다

```ts
async function getUser(id: number) {
  const res = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`)
  return res.json() // 404여도 그대로 돌려줌
}

const user = await getUser(999)
console.log(user.name) // 출력: undefined — 오류 없이 빈 값이 화면에 그려짐
```

**왜 틀렸나:** `fetch`는 404·500에서도 이행됩니다. 응답이 성공인지는 `res.ok`로 직접 확인해야 합니다.

```ts
// 고친 코드
async function getUser(id: number): Promise<unknown> {
  const res = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`)
  if (!res.ok) {
    throw new Error(`회원 조회 실패: HTTP ${res.status}`)
  }
  return res.json()
}
```

### 실수 2: body에 객체를 그대로 넣거나 Content-Type을 빠뜨린다

```ts
await fetch('https://jsonplaceholder.typicode.com/posts', {
  method: 'POST',
  body: { title: '공지' },
  // ❌ Object literal may only specify known properties, and 'title' does not exist in type
  //    'ArrayBuffer | ArrayBufferView | Blob | FormData | ReadableStream<any> | URLSearchParams'. (TS2353)
})
```

**왜 틀렸나:** `body`에는 문자열·`FormData`·`Blob` 같은 정해진 타입만 들어갑니다(이것들을 묶은 타입이 `BodyInit`입니다). 오류 메시지에 `string`이 빠져 있는 것은 TypeScript가 객체 리터럴과 비교할 만한 후보만 보여 주기 때문입니다. 객체는 `JSON.stringify`로 바꾸고, 서버가 알아보도록 `Content-Type` 헤더를 붙입니다.

```ts
// 고친 코드
await fetch('https://jsonplaceholder.typicode.com/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: '공지' }),
})
```

### 실수 3: 응답 타입을 as로 단언하고 안심한다

```ts
const product = (await res.json()) as Product
console.log(product.price.toLocaleString()) // 실행 중 TypeError 가능
```

**왜 틀렸나:** `as`는 실제 데이터를 검사하지 않습니다(4단계). 서버가 약속과 다른 데이터를 보내면 컴파일러는 막지 못합니다.

**대처:** 단언은 공통 함수 한 곳에만 두고(6단계), 중요한 데이터는 [다음 레슨](./05-runtime-validation)의 런타임 검증으로 확인합니다.

### 실수 4: 시간 제한 없이 요청한다

```ts
// 결제 서버가 응답하지 않으면 로딩이 영원히 돎
const res = await fetch('https://pay.example.com/approve', { method: 'POST' })
```

**왜 틀렸나:** `fetch`에는 기본 시간 제한이 없습니다(운영체제·브라우저 수준의 아주 긴 제한만 있습니다).

```ts
// 고친 코드: 10초 제한
const res = await fetch('https://pay.example.com/approve', {
  method: 'POST',
  signal: AbortSignal.timeout(10_000),
})
```

`10_000`처럼 숫자 사이에 밑줄을 넣으면 읽기 쉽습니다(숫자 구분자, ES2021).

### 실수 5: 취소된 요청을 오류로 보여 준다

```ts
try {
  await request<Todo[]>('/todos', { signal: controller.signal })
} catch (error) {
  alert('검색에 실패했습니다') // 사용자가 다른 검색어를 입력해 취소한 것인데도 실패 메시지!
}
```

**왜 틀렸나:** 취소는 의도한 동작입니다. 실패로 다루면 사용자가 볼 필요 없는 오류 창이 뜹니다.

```ts
// 고친 코드: AbortError는 조용히 무시합니다.
try {
  await request<Todo[]>('/todos', { signal: controller.signal })
} catch (error) {
  if (error instanceof Error && error.name === 'AbortError') return
  alert('검색에 실패했습니다')
}
```

## 직접 해 보기

아래 문제에서는 6단계의 `api.ts`(`request`, `HttpError`)와 `Todo`·`User` 인터페이스를 그대로 씁니다.

### 문제 1 ⭐ 할 일 하나 가져오기

`fetch`만 써서(공통 함수 없이) `https://jsonplaceholder.typicode.com/todos/1`을 조회하고, 성공이 아니면 `Error`를 던지고, 성공이면 `title`을 출력하세요.

::: details 정답 보기
```ts
async function main(): Promise<void> {
  const res = await fetch('https://jsonplaceholder.typicode.com/todos/1')
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }
  const todo: Todo = await res.json()
  console.log(todo.title)
}
main()
// 출력: delectus aut autem
```
:::

### 문제 2 ⭐ 거부될까, 이행될까

다음 상황에서 `await fetch(...)`는 거부됩니까, 이행됩니까?

1. 서버가 404를 돌려줌
2. 서버가 500을 돌려줌
3. 와이파이가 끊김
4. `AbortSignal.timeout(3000)`을 걸었는데 5초 동안 응답이 없음

::: details 정답 보기
1. 이행(`res.ok`가 `false`, `res.status`가 404)
2. 이행(`res.ok`가 `false`, `res.status`가 500)
3. 거부(`TypeError`)
4. 거부(`name`이 `'TimeoutError'`인 오류)

"봉투가 도착하면 이행, 봉투가 오지 않으면 거부"로 기억합니다.
:::

### 문제 3 ⭐⭐ POST 요청 함수 만들기

`request`를 써서 할 일을 등록하는 `createTodo(userId: number, title: string): Promise<Todo>`를 만들고, 등록된 할 일의 `id`와 `title`을 출력하세요. 새 할 일의 `completed`는 `false`입니다.

::: details 정답 보기
```ts
function createTodo(userId: number, title: string): Promise<Todo> {
  return request<Todo>('/todos', {
    method: 'POST',
    body: { userId, title, completed: false },
  })
}

const created = await createTodo(1, '강남점 재고 확인')
console.log(created.id, created.title)
// 출력: 201 강남점 재고 확인
```
연습 서버는 새 할 일에 `id: 201`을 붙여 돌려주지만 실제로 저장하지는 않습니다.
:::

### 문제 4 ⭐⭐ 두 API를 동시에 불러 요약하기

회원 정보(`/users/1`)와 그 회원의 할 일 목록(`/todos?userId=1`)을 **동시에** 불러와 `이름: 할 일 N개 중 M개 남음`을 출력하는 `summary(userId: number): Promise<void>`를 만드세요.

::: details 정답 보기
```ts
async function summary(userId: number): Promise<void> {
  const [user, todos] = await Promise.all([
    request<User>(`/users/${userId}`),
    request<Todo[]>(`/todos?userId=${userId}`),
  ])
  const left = todos.filter((t) => !t.completed).length
  console.log(`${user.name}: 할 일 ${todos.length}개 중 ${left}개 남음`)
}

await summary(1)
// 출력: Leanne Graham: 할 일 20개 중 9개 남음
```
두 요청은 서로의 결과를 쓰지 않으므로 [지난 레슨](./03-async-await)에서 배운 대로 병렬로 실행합니다.
:::

### 문제 5 ⭐⭐⭐ 이전 검색 요청 취소하기

검색창에 글자를 칠 때마다 `search(keyword)`가 불립니다. 새 검색이 시작되면 **이전 검색 요청을 취소**하고, 취소된 검색은 `"키워드" 검색 취소됨`을, 끝까지 간 검색은 `"키워드" 결과 N건`을 출력하세요. 검색 주소는 `/todos?q=키워드`입니다.

```ts
await Promise.all([search('아'), search('아메'), search('아메리카노')])
```

::: details 정답 보기
```ts
let current: AbortController | undefined // 진행 중인 검색의 리모컨

async function search(keyword: string): Promise<void> {
  current?.abort() // 이전 검색 취소
  const controller = new AbortController()
  current = controller

  try {
    const todos = await request<Todo[]>(`/todos?q=${encodeURIComponent(keyword)}`, {
      signal: controller.signal,
    })
    console.log(`"${keyword}" 결과 ${todos.length}건`)
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log(`"${keyword}" 검색 취소됨`)
      return
    }
    throw error
  }
}

await Promise.all([search('아'), search('아메'), search('아메리카노')])
```
```text
"아" 검색 취소됨
"아메" 검색 취소됨
"아메리카노" 결과 0건
```
연습 데이터가 영어라서 결과는 0건입니다. 한글 검색어를 URL에 넣을 때는 `encodeURIComponent`로 안전한 문자로 바꿉니다. 이 패턴은 오래된 응답이 늦게 도착해 최신 결과를 덮어쓰는 문제(경쟁 상태, race condition)도 막아 줍니다.
:::

### 문제 6 ⭐⭐⭐ 없으면 null 돌려주기

회원을 조회하되, **404이면 `null`을 돌려주고** 그 밖의 오류는 그대로 던지는 `findUser(id: number): Promise<User | null>`를 만드세요.

::: details 정답 보기
```ts
async function findUser(id: number): Promise<User | null> {
  try {
    return await request<User>(`/users/${id}`) // try 안이므로 return await
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      return null // "없음"은 정상적인 결과로 바꿉니다.
    }
    throw error // 500, 네트워크 오류 등은 그대로 위로 던집니다.
  }
}

console.log((await findUser(1))?.name) // 출력: Leanne Graham
console.log(await findUser(999))       // 출력: null
```
`HttpError`에 `status`를 담아 둔 덕분에 상태 코드별로 처리를 나눌 수 있습니다. 모든 오류를 `null`로 바꾸면 서버 장애도 "회원 없음"으로 보이므로, 바꿀 오류만 골라 바꾸는 것이 중요합니다.
:::

## 확인 퀴즈

1. `fetch` 결과에서 응답이 성공(200~299)인지 확인하는 속성은 무엇입니까?
2. `res.json()`의 반환 타입은 무엇이고, 무엇이 문제입니까?
3. `const user = (await res.json()) as User`라고 쓰면 실행 중에 데이터가 `User` 모양인지 검사됩니까?
4. POST로 JSON을 보낼 때 꼭 해야 하는 두 가지는 무엇입니까?
5. 사용자가 취소한 요청과 시간 초과로 중단된 요청은 오류의 어떤 속성으로 구분합니까?

::: details 정답 보기
1. `res.ok`입니다(`res.status`로 정확한 코드를 봅니다).
2. `Promise<any>`입니다. `any`는 타입 검사를 꺼 버리고 다른 값으로 전염되어, 오타나 잘못된 타입 사용을 잡지 못합니다.
3. 아닙니다. `as`는 컴파일러에게 하는 약속일 뿐이고, 실행 중에는 아무것도 확인하지 않습니다.
4. `body`에 `JSON.stringify(객체)`를 넣고, `Content-Type: application/json` 헤더를 붙입니다.
5. `name` 속성입니다. 직접 취소는 `'AbortError'`, 시간 초과는 `'TimeoutError'`입니다.
:::

## 정리

- `fetch(URL, 옵션)`은 `Promise<Response>`를 돌려줍니다. 본문은 `await res.json()`이나 `await res.text()`로 한 번 더 기다려 읽습니다.
- `fetch`는 404·500에서도 **이행**됩니다. 거부되는 것은 네트워크 오류와 취소뿐이므로 `res.ok`를 반드시 확인합니다.
- POST·PATCH 본문은 `JSON.stringify`로 바꾸고 `Content-Type` 헤더를 붙입니다. 민감한 값은 URL에 넣지 않습니다.
- `res.json()`은 `Promise<any>`이고, `as`나 타입 표기는 검사가 아닌 약속입니다.
- 공통 함수 `request<T>()`에 상태 확인·에러 변환·타임아웃·단언을 모으고, `HttpError` 같은 에러 클래스로 상태 코드를 전달합니다.
- `AbortController`로 직접 취소하고, `AbortSignal.timeout()`으로 시간 제한을 겁니다.

## 다음 단계

[런타임 검증: 타입은 실행 중에 사라진다 (zod)](./05-runtime-validation) — `request<T>()` 안에 남겨 둔 `as T`를 진짜 검사로 바꿉니다. 직접 검증 함수를 짜 보고, zod로 스키마 하나에서 검증과 타입을 함께 얻는 법을 배웁니다.
