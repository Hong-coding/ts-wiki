---
title: API 클라이언트 타입 설계 (axios · 공통 응답 · 에러)
---

# API 클라이언트 타입 설계 (axios · 공통 응답 · 에러)

<LessonMeta level="실전" :minutes="60" prev="zustand 스토어를 커리 패턴·셀렉터·persist로 타입 안전하게 만들기" />

## 이번에 배울 것

- axios 인스턴스를 만들고, 요청 인터셉터로 토큰을 **저장소에서 읽어** 붙일 수 있다.
- 서버의 공통 응답 형식을 판별 유니온 `ApiResponse` 타입으로 표현하고 좁힐 수 있다.
- `isAxiosError`로 `unknown` 오류를 좁혀, 화면이 다루기 쉬운 하나의 에러 타입으로 바꿀 수 있다.
- API 함수를 도메인별 모듈로 나누고, 백엔드 DTO와 프런트 타입을 맞추는 방법(OpenAPI 코드 생성)을 설명할 수 있다.
- zod로 응답을 검증해 "타입은 믿음"이라는 한계를 메울 수 있다.

## 먼저 알아 둘 것

- [fetch로 API 호출하고 응답에 타입 붙이기](../part4-async/04-fetch-api)
- [런타임 검증: 타입은 실행 중에 사라진다 (zod)](../part4-async/05-runtime-validation)
- [판별 유니온과 완전성 검사](../part3-intermediate/03-discriminated-union)
- [제네릭 제약(extends)과 기본 타입 매개변수](../part3-intermediate/05-generic-constraints)
- [사용자 정의 타입 가드 · assertion 함수 · satisfies](../part5-advanced/06-type-guards-satisfies)
- [Node.js + Express REST API를 TS로](./01-node-express) — 서버 쪽에서 본 같은 API입니다.

::: info 이 레슨의 버전 (작성 시점 2026-10 기준)
axios 1.20.0, zod 4.6.7, TypeScript 5.6.3(strict)으로 예제를 검사했습니다. 출력이 있는 예제는 실제 서버 대신 **가짜 응답을 돌려주는 axios 어댑터**를 연결해 Node.js에서 실행한 결과입니다. zod 3과 4는 일부 API 이름이 다릅니다(예: zod 4의 `z.iso.datetime()`, `z.prettifyError()`).
:::

## 비유로 이해하기

본사(서버)와 매장(화면) 사이에 **택배 창구**가 하나 있다고 해 봅시다.

- 매장 직원은 본사에 직접 전화하지 않고 창구에 "상품 목록 보내 주세요"라고 요청서만 냅니다.
- 창구는 요청서에 **출입증**(토큰)을 자동으로 붙여 보냅니다. 출입증은 직원 주머니가 아니라 **보관함**에서 꺼냅니다.
- 본사에서 오는 상자는 늘 같은 규격입니다. 상자 겉면에 "정상" 또는 "반송" 도장이 찍혀 있고, 정상이면 안에 물건, 반송이면 사유서가 들어 있습니다.
- 택배가 분실되든, 반송되든, 상자가 찌그러져 오든 창구는 매장에 **같은 양식의 사고 보고서** 한 장만 줍니다.
- 꼼꼼한 창구는 상자를 열어 **송장과 내용물이 맞는지 검수**까지 합니다.

이 창구가 **API 클라이언트**입니다. 이번 레슨은 창구의 규격(타입)을 설계하는 방법입니다.

## 개념 설명

### 1단계: axios와 인스턴스

**axios**는 HTTP 요청을 보내는 라이브러리입니다. `fetch`와 비교해 실무에서 자주 쓰는 이유는 다음과 같습니다.

- 응답 본문을 JSON으로 자동 변환합니다(`res.json()` 불필요).
- 상태 코드가 2xx가 아니면 **자동으로 오류를 던집니다**(`fetch`는 404에도 성공으로 끝남).
- **인스턴스**와 **인터셉터**로 공통 설정·처리를 한 곳에 모을 수 있습니다.

```bash
npm install axios
```

axios는 TypeScript 타입을 패키지 안에 포함하고 있습니다. 공통 설정을 담은 **인스턴스**를 하나 만들어 앱 전체가 공유합니다.

```ts
// src/api/http.ts
import axios from 'axios'

export const http = axios.create({
  baseURL: '/api', // 모든 요청 주소 앞에 붙음
  timeout: 5000, // 5초 안에 응답이 없으면 실패
})
```

::: tip 서버 주소는 환경 변수로
Vite 프로젝트라면 `baseURL: import.meta.env.VITE_API_BASE_URL`처럼 환경 변수로 받습니다. 타입은 `src/vite-env.d.ts`에 `interface ImportMetaEnv { readonly VITE_API_BASE_URL: string }`처럼 선언합니다. 단, `VITE_`로 시작하는 값은 **브라우저로 배포되는 코드에 그대로 들어갑니다.** API 키 같은 시크릿은 절대 넣지 마세요([Express 레슨의 시크릿 규칙](./01-node-express)).
:::

`http.get<T>(주소)`처럼 제네릭으로 응답 본문의 타입을 적을 수 있습니다. 결과는 `AxiosResponse<T>`이고 본문은 `res.data`에 있습니다. 다만 이것은 `res.json()`과 마찬가지로 **검사 없는 약속**입니다. 이 점은 7단계에서 다시 다룹니다.

### 2단계: 공통 응답 래퍼 — ApiResponse

많은 백엔드는 모든 응답을 **같은 모양의 상자**에 담아 보냅니다. 이 레슨의 서버는 다음 두 모양 중 하나를 돌려준다고 약속했다고 합시다.

```json
{ "success": true, "data": [{ "id": 1, "name": "아메리카노", "price": 4500 }] }
```

```json
{ "success": false, "error": { "code": "PRODUCT_NOT_FOUND", "message": "상품을 찾을 수 없습니다." } }
```

`success`가 **판별자**인 [판별 유니온](../part3-intermediate/03-discriminated-union)으로 표현합니다. `data`의 타입은 API마다 다르므로 제네릭으로 둡니다.

```ts
// src/api/types.ts
export interface ApiSuccess<T> {
  success: true
  data: T
}

export interface ApiFailure {
  success: false
  error: { code: string; message: string }
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure
```

`success`로 좁히면 각 경우에 맞는 속성만 쓸 수 있습니다.

```ts
interface Member {
  id: number
  name: string
  grade: 'VIP' | 'GOLD' | '일반'
}

function showMember(res: ApiResponse<Member>): string {
  if (res.success) {
    return `${res.data.name} (${res.data.grade})` // ApiSuccess<Member>
  }
  return `오류: ${res.error.message}` // ApiFailure
}

console.log(showMember({ success: true, data: { id: 1, name: '김민지', grade: 'VIP' } }))
// 출력: 김민지 (VIP)
console.log(showMember({ success: false, error: { code: 'MEMBER_NOT_FOUND', message: '회원이 없습니다.' } }))
// 출력: 오류: 회원이 없습니다.
```

`{ success: boolean; data?: T; error?: ... }`처럼 선택 속성으로 만들면 "성공인데 data가 없음", "실패인데 error가 없음" 같은 **불가능한 조합**까지 허용되어, 쓰는 곳마다 `?.`과 `!`가 늘어납니다. 이 원칙은 [다음 레슨](./07-type-design)에서 자세히 다룹니다.

### 3단계: 에러를 하나의 타입으로 — ApiError와 isAxiosError

API 호출이 실패하는 경우는 여러 가지입니다.

| 경우 | axios에서 보이는 모습 |
|---|---|
| 서버가 실패 응답(4xx·5xx)을 보냄 | `AxiosError`, `err.response`에 상태 코드·본문이 있음 |
| 서버가 200으로 `success: false`를 보냄 | 오류가 아님. 본문을 보고 판단해야 함 |
| 응답 시간 초과 | `AxiosError`, `err.code === 'ECONNABORTED'`, `err.response` 없음 |
| 네트워크 끊김·서버 꺼짐 | `AxiosError`, `err.response` 없음 |
| 코드 버그(오타 등) | 일반 `Error` |

화면 코드가 이 다섯 가지를 매번 구별하면 힘듭니다. 그래서 **하나의 에러 타입으로 바꿔서** 던집니다.

```ts
// src/api/errors.ts
import { isAxiosError } from 'axios'
import type { ApiFailure } from './types'

export class ApiError extends Error {
  constructor(
    public readonly status: number | null, // 응답이 없으면 null
    public readonly code: string,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// 사용자 정의 타입 가드: unknown이 ApiFailure 모양인지 검사
function isApiFailure(value: unknown): value is ApiFailure {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return v.success === false && typeof v.error === 'object' && v.error !== null
}

export function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err
  if (isAxiosError(err)) {
    if (err.response) {
      const body: unknown = err.response.data
      if (isApiFailure(body)) {
        return new ApiError(err.response.status, body.error.code, body.error.message)
      }
      return new ApiError(err.response.status, 'HTTP_ERROR', `요청이 실패했습니다. (HTTP ${err.response.status})`)
    }
    if (err.code === 'ECONNABORTED') {
      return new ApiError(null, 'TIMEOUT', '응답 시간이 초과되었습니다.')
    }
    return new ApiError(null, 'NETWORK_ERROR', '서버에 연결할 수 없습니다.')
  }
  return new ApiError(null, 'UNKNOWN', err instanceof Error ? err.message : '알 수 없는 오류')
}
```

해설:

- `catch (err)`의 `err`는 **`unknown`** 입니다. 무엇이든 던질 수 있기 때문입니다. 그래서 바로 `err.response`를 쓰면 오류가 납니다.

```ts
try {
  await http.get('/products')
} catch (err) {
  console.log(err.response.status)
  // ❌ 'err' is of type 'unknown'. (TS18046)
}
```

- **`isAxiosError(err)`** 는 axios가 제공하는 [타입 가드](../part5-advanced/06-type-guards-satisfies)입니다. `true`이면 `err`가 `AxiosError`로 좁혀집니다.
- 좁힌 뒤에도 `err.response`는 `AxiosResponse | undefined`입니다. 네트워크 오류에는 응답이 없기 때문입니다. 그래서 `if (err.response)`로 한 번 더 좁힙니다(안 하면 `'err.response' is possibly 'undefined'. (TS18048)`).
- `isAxiosError<ApiFailure>(err)`처럼 본문 타입을 제네릭으로 줄 수도 있지만, 이것은 **확인 없는 약속**입니다. 서버가 프록시 오류 페이지(HTML)를 돌려주면 본문은 문자열입니다. 그래서 위 코드는 본문을 `unknown`으로 받고 `isApiFailure`로 직접 검사했습니다.

### 4단계: 인터셉터와 토큰 — 저장소에서 읽기

**인터셉터**(interceptor, 가로채는 함수)는 모든 요청이 나가기 전, 모든 응답이 들어온 뒤에 끼어드는 함수입니다. 로그인 토큰을 붙이는 일이 대표적입니다.

```ts
// src/api/tokenStorage.ts
// 토큰을 어디에 둘지는 보안 방침에 따라 정합니다. 여기서는 메모리에 둡니다.
let memoryToken: string | null = null

export const tokenStorage = {
  get: (): string | null => memoryToken,
  set: (token: string | null) => {
    memoryToken = token
  },
}
```

```ts
// src/api/http.ts
import axios, { isAxiosError } from 'axios'
import { tokenStorage } from './tokenStorage'

export const http = axios.create({ baseURL: '/api', timeout: 5000 })

// 요청 인터셉터: 토큰이 있으면 Authorization 헤더에 붙임
http.interceptors.request.use((config) => {
  const token = tokenStorage.get()
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

// 응답 인터셉터: 401(인증 만료)이면 토큰을 지움
http.interceptors.response.use(
  (res) => res,
  (err: unknown) => {
    if (isAxiosError(err) && err.response?.status === 401) {
      tokenStorage.set(null)
    }
    return Promise.reject(err) // 오류는 그대로 다시 던져 호출한 쪽이 처리
  },
)
```

해설:

- 요청 인터셉터의 `config`는 `InternalAxiosRequestConfig` 타입으로 추론되고, `config.headers.set(...)`으로 헤더를 넣습니다.
- 토큰은 **코드에 쓰지 않고**(`'Bearer eyJ...'` 하드코딩 금지) 로그인 응답으로 받아 저장소에 넣은 값을 **요청할 때마다 읽습니다.** 그래야 로그아웃·토큰 갱신이 바로 반영됩니다.
- 저장 위치(메모리, `localStorage`, HttpOnly 쿠키)는 보안 성격이 다릅니다. 메모리는 새로고침하면 사라지고, `localStorage`는 XSS에 노출되며, HttpOnly 쿠키는 스크립트가 읽을 수 없는 대신 서버 설정이 필요합니다. 팀·고객사의 보안 방침을 따르세요. 저장소를 `tokenStorage` 하나로 감싸 두면 방침이 바뀌어도 이 파일만 고치면 됩니다.

실제로 실행해 보면 토큰을 저장한 뒤부터 헤더가 붙습니다(가짜 서버가 받은 `Authorization` 헤더를 그대로 돌려주게 해서 확인했습니다).

```text
(없음)              ← tokenStorage.set 하기 전
Bearer test-token   ← tokenStorage.set('test-token') 한 뒤
```

### 5단계: 공통 요청 함수와 API 모듈

이제 "요청 → `ApiResponse` 풀기 → 실패면 `ApiError` 던지기"를 함수 하나로 묶습니다.

```ts
// src/api/request.ts
import type { AxiosResponse } from 'axios'
import { ApiError, toApiError } from './errors'
import type { ApiResponse } from './types'

export async function request<T>(promise: Promise<AxiosResponse<ApiResponse<T>>>): Promise<T> {
  try {
    const res = await promise
    const body = res.data
    if (!body.success) {
      // 200으로 왔지만 success: false인 경우
      throw new ApiError(res.status, body.error.code, body.error.message)
    }
    return body.data // 여기서 body는 ApiSuccess<T>
  } catch (err) {
    throw toApiError(err)
  }
}
```

API 함수는 **도메인별 모듈**(상품, 회원, 주문…)로 나눕니다. 화면 코드는 주소·헤더·응답 형식을 몰라도 됩니다.

```ts
// src/api/productApi.ts
import { http } from './http'
import { request } from './request'
import type { ApiResponse } from './types'

export interface Product {
  id: number
  name: string
  price: number
}

export const productApi = {
  list: () => request(http.get<ApiResponse<Product[]>>('/products')),
  get: (id: number) => request(http.get<ApiResponse<Product>>(`/products/${id}`)),
}
```

`productApi.list()`의 반환 타입은 `Promise<Product[]>`로 추론됩니다. 화면에서는 이렇게 씁니다.

```ts
const list = await productApi.list()
console.log(list.map((p) => p.name))
// 출력: [ '아메리카노', '카페라테' ]

try {
  await productApi.get(99)
} catch (err) {
  if (err instanceof ApiError) console.log(err.status, err.code, err.message)
}
// 출력: 404 PRODUCT_NOT_FOUND 상품을 찾을 수 없습니다.

try {
  await productApi.get(5) // 가짜 서버가 네트워크 오류를 내도록 만든 경우
} catch (err) {
  if (err instanceof ApiError) console.log(err.status, err.code, err.message)
}
// 출력: null NETWORK_ERROR 서버에 연결할 수 없습니다.
```

404든 네트워크 오류든 화면은 `ApiError` 하나만 다루면 됩니다. `err.code`로 분기하고, `err.message`를 사용자에게 보여 주면 됩니다.

### 6단계: 백엔드 DTO와 프런트 타입 맞추기

**DTO**(Data Transfer Object)는 서버와 주고받는 데이터의 모양을 정한 클래스·타입입니다. 백엔드(Java·C# 등)에 `ProductResponseDto`가 있다면, 프런트의 `Product` 타입은 그것과 **정확히 같아야** 합니다. 손으로 맞추면 다음 일이 생깁니다.

- 백엔드가 `price`를 `salePrice`로 바꿨는데 프런트는 모름 → 화면에 `undefined원`
- 백엔드는 `null`을 보낼 수 있는데 프런트 타입에는 `null`이 없음 → 실행 중 오류

해결 방법은 **한쪽을 원본으로 정하고 다른 쪽을 자동 생성**하는 것입니다. 가장 널리 쓰이는 방식이 **OpenAPI**(REST API 명세를 기계가 읽을 수 있는 JSON/YAML로 적는 표준, 예전 이름 Swagger)입니다.

1. 백엔드가 OpenAPI 문서를 만듭니다. Spring Boot는 springdoc-openapi, ASP.NET Core는 Swashbuckle 같은 도구로 DTO에서 자동 생성할 수 있습니다.
2. 프런트에서 그 문서로 타입을 생성합니다.

```bash
# 예: openapi-typescript (작성 시점 7.13) — OpenAPI 문서에서 TS 타입 파일 생성
npx openapi-typescript ./openapi.yaml -o src/api/schema.d.ts
```

```ts
// 생성된 타입을 꺼내 쓰는 모습(생성 파일의 구조는 도구에 따라 다름)
import type { components } from './schema'

type Product = components['schemas']['ProductResponseDto']
```

- 타입만 만드는 도구(openapi-typescript), 타입 + API 함수까지 만드는 도구(orval 등) 등 선택지가 여럿입니다. 팀 상황에 맞게 고르고, 외부 도구를 도입할 때는 라이선스와 유지보수 상태를 확인하세요.
- 생성은 **빌드 전 단계(CI)** 에 넣어 백엔드가 바뀌면 프런트 컴파일이 깨지게 만드는 것이 효과적입니다. 생성된 파일은 손으로 고치지 않습니다.
- 생성된 타입도 결국 **컴파일 타임의 약속**입니다. 배포 시점이 어긋나 실제 서버가 다른 모양을 보낼 가능성은 남습니다. 그래서 다음 단계의 런타임 검증과 함께 씁니다.

### 7단계: zod로 응답 검증하기

5단계의 `http.get<ApiResponse<Product>>`는 **서버가 약속대로 보낸다고 믿는** 코드입니다. 서버가 실수로 가격을 문자열 `"4500"`으로 보내면 어떻게 될까요?

```ts
const unsafe = await productApi.get(1) // 가짜 서버가 price: "4500"을 보내도록 만든 경우
console.log(typeof unsafe.price, unsafe.price)
// 출력: string 4500
```

타입은 `number`라고 했는데 실제 값은 `string`입니다. 이 값으로 `price * quantity`를 계산하면 우연히 맞고, `price + 500`을 계산하면 `"4500500"`이 됩니다. 오류가 **엉뚱한 곳에서 늦게** 드러납니다.

[zod](../part4-async/05-runtime-validation)로 **스키마**(데이터 모양 규칙)를 만들어 실제로 검사합니다. 스키마에서 타입도 뽑아 쓰므로 둘이 어긋나지 않습니다.

```bash
npm install zod
```

```ts
// src/api/requestParsed.ts
import type { AxiosResponse } from 'axios'
import { z } from 'zod'
import { ApiError, toApiError } from './errors'

const ProductSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  price: z.number().nonnegative(),
})
export type Product = z.infer<typeof ProductSchema> // 스키마에서 타입을 뽑음

// 공통 래퍼 모양(data는 아직 모름)
const EnvelopeSchema = z.discriminatedUnion('success', [
  z.object({ success: z.literal(true), data: z.unknown() }),
  z.object({ success: z.literal(false), error: z.object({ code: z.string(), message: z.string() }) }),
])

export async function requestParsed<T extends z.ZodType>(
  promise: Promise<AxiosResponse<unknown>>,
  dataSchema: T,
): Promise<z.output<T>> {
  let res: AxiosResponse<unknown>
  try {
    res = await promise
  } catch (err) {
    throw toApiError(err)
  }
  // 1) 공통 래퍼 모양 검사
  const envelope = EnvelopeSchema.safeParse(res.data)
  if (!envelope.success) {
    throw new ApiError(res.status, 'INVALID_RESPONSE', '서버 응답 형식이 올바르지 않습니다.')
  }
  if (!envelope.data.success) {
    throw new ApiError(res.status, envelope.data.error.code, envelope.data.error.message)
  }
  // 2) data 부분 검사
  const data = dataSchema.safeParse(envelope.data.data)
  if (!data.success) {
    console.error(z.prettifyError(data.error)) // 개발자용 로그
    throw new ApiError(res.status, 'INVALID_RESPONSE', '서버 응답 형식이 올바르지 않습니다.')
  }
  return data.data
}

export const safeProductApi = {
  list: () => requestParsed(http.get('/products'), z.array(ProductSchema)), // Promise<Product[]>
  get: (id: number) => requestParsed(http.get(`/products/${id}`), ProductSchema), // Promise<Product>
}
```

해설:

- `http.get(...)`에 제네릭을 주지 않아 본문은 `any`이지만, `requestParsed`가 `AxiosResponse<unknown>`으로 받아서 **검사 전에는 쓸 수 없게** 했습니다.
- `T extends z.ZodType`은 "zod 스키마라면 무엇이든"이라는 [제네릭 제약](../part3-intermediate/05-generic-constraints)이고, `z.output<T>`는 그 스키마가 검사를 통과시킨 값의 타입입니다. 그래서 `safeProductApi.get`의 반환 타입이 `Promise<Product>`로 정확히 추론됩니다.
- 공통 래퍼와 `data`를 **두 번에 나눠** 검사한 이유가 있습니다. 래퍼 스키마 안에 제네릭 스키마를 넣으면, 함수 안에서 TypeScript가 `success`로 좁히는 것을 따라가지 못해 오류가 납니다(직접 확인). 나누면 각 단계가 구체적인 타입이라 좁히기가 잘 됩니다.

같은 잘못된 응답을 검증하면 경계에서 바로 멈춥니다.

```text
✖ Invalid input: expected number, received string
  → at price
INVALID_RESPONSE 서버 응답 형식이 올바르지 않습니다.
```

첫 두 줄은 `z.prettifyError`가 남긴 개발자용 로그이고, 마지막 줄은 화면이 받은 `ApiError`의 `code`와 `message`입니다. "어느 칸이 왜 틀렸는지"가 로그에 남아 원인을 바로 찾을 수 있습니다.

::: tip 모든 API를 검증해야 하나요?
검증은 실행 비용과 스키마 관리 비용이 듭니다. 흔한 기준은 다음과 같습니다.
- **반드시**: 결제·주문 금액처럼 틀리면 사고가 나는 데이터, 외부 업체 API, 모양이 자주 바뀌는 API
- **선택**: OpenAPI 생성 타입으로 관리되고 같은 팀이 배포를 맞추는 내부 API

어느 쪽이든 원칙은 같습니다. **바깥에서 들어온 값은 검증하기 전까지 `unknown`이다.**
:::

## 자주 하는 실수

### 실수 1: catch의 err를 바로 쓰기

```ts
try {
  await productApi.list()
} catch (err) {
  alert(err.response.data.error.message)
  // ❌ 'err' is of type 'unknown'. (TS18046)
}
```

왜 틀렸나: `err`는 `unknown`입니다. 네트워크 오류라면 `response` 자체가 없고, 코드 버그라면 axios 오류도 아닙니다. `err: any`로 바꿔 오류를 지우면 실행 중 `Cannot read properties of undefined`가 납니다.

고친 코드: 오류를 하나의 타입으로 바꾸는 함수를 거칩니다.

```ts
try {
  await productApi.list()
} catch (err) {
  const apiError = toApiError(err) // ApiError
  alert(apiError.message)
}
```

### 실수 2: 토큰을 코드에 하드코딩하기

```ts
export const http = axios.create({
  baseURL: '/api',
  headers: { Authorization: 'Bearer eyJhbGciOi...' }, // ❌ 개발 중 복사해 둔 토큰
})
```

왜 틀렸나: 토큰이 Git과 배포 파일에 그대로 남아 누구나 볼 수 있습니다. 토큰이 만료되거나 다른 사용자로 로그인해도 바뀌지 않습니다.

고친 코드: 저장소에서 **요청할 때마다** 읽는 인터셉터를 씁니다(4단계).

```ts
http.interceptors.request.use((config) => {
  const token = tokenStorage.get()
  if (token) config.headers.set('Authorization', `Bearer ${token}`)
  return config
})
```

### 실수 3: 응답 래퍼를 선택 속성으로 만들기

```ts
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: { code: string; message: string }
}

function getName(res: ApiResponse<Product>) {
  return res.data.name
  // ❌ 'res.data' is possibly 'undefined'. (TS18048)
}
```

왜 틀렸나: `success`를 확인해도 `data`가 좁혀지지 않습니다. 둘 사이의 관계를 타입이 모르기 때문입니다. 결국 `res.data!.name`처럼 단언을 남발하게 됩니다.

고친 코드: `success`를 판별자로 하는 판별 유니온으로 만듭니다(2단계).

```ts
type ApiResponse<T> = { success: true; data: T } | { success: false; error: { code: string; message: string } }

function getName(res: ApiResponse<Product>) {
  return res.success ? res.data.name : null // ✅ 좁혀짐
}
```

### 실수 4: 제네릭을 붙이면 검증된다고 믿기

```ts
const res = await http.get<Product>('/products/1')
const total = res.data.price * 2 // 서버가 문자열을 보내도 컴파일러는 모름
```

왜 틀렸나: `http.get<Product>`는 "응답이 `Product`일 것이다"라는 **단언**과 같습니다. 실행 중에는 아무것도 검사하지 않습니다.

고친 코드: 중요한 데이터는 스키마로 검증합니다(7단계).

```ts
const product = await safeProductApi.get(1) // 검증 실패 시 ApiError(INVALID_RESPONSE)
const total = product.price * 2
```

### 실수 5: 화면마다 axios를 직접 부르기

```tsx
// ProductPage.tsx
const res = await axios.get('http://192.168.0.10:8080/api/products', {
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
})
```

왜 틀렸나: 주소(IP 하드코딩), 토큰 처리, 응답 풀기, 오류 처리가 화면마다 흩어져 하나를 바꾸려면 모든 화면을 고쳐야 합니다. 타입도 화면마다 따로 붙여 어긋나기 쉽습니다.

고친 코드: 인스턴스·인터셉터·공통 요청 함수·도메인 모듈을 거칩니다.

```tsx
const products = await productApi.list() // Promise<Product[]>
```

## 직접 해 보기

### 문제 1 ⭐ ApiResponse 좁히기

`ApiResponse<Order>`를 받아 성공이면 `주문 A-1001: 9,000원`, 실패면 `주문 조회 실패(코드)`를 돌려주는 `describeOrder`를 만드세요. `Order`는 `{ orderNo: string; totalAmount: number }`입니다.

::: details 정답 보기
```ts
interface Order {
  orderNo: string
  totalAmount: number
}

function describeOrder(res: ApiResponse<Order>): string {
  if (res.success) {
    return `주문 ${res.data.orderNo}: ${res.data.totalAmount.toLocaleString('ko-KR')}원`
  }
  return `주문 조회 실패(${res.error.code})`
}

console.log(describeOrder({ success: true, data: { orderNo: 'A-1001', totalAmount: 9000 } }))
// 출력: 주문 A-1001: 9,000원
console.log(describeOrder({ success: false, error: { code: 'ORDER_NOT_FOUND', message: '주문이 없습니다.' } }))
// 출력: 주문 조회 실패(ORDER_NOT_FOUND)
```
:::

### 문제 2 ⭐ 회원 API 모듈

`request`와 `http`를 사용해 `memberApi`를 만드세요.

- `get(id)`: `GET /members/:id` → `Member`
- `updateGrade(id, grade)`: `PATCH /members/:id`에 `{ grade }`를 보냄 → `Member`. `grade`의 타입은 `Member`의 `grade` 속성 타입을 재사용합니다.

::: details 정답 보기
```ts
interface Member {
  id: number
  name: string
  grade: 'VIP' | 'GOLD' | '일반'
}

export const memberApi = {
  get: (id: number) => request(http.get<ApiResponse<Member>>(`/members/${id}`)),
  updateGrade: (id: number, grade: Member['grade']) =>
    request(http.patch<ApiResponse<Member>>(`/members/${id}`, { grade })),
}
```

`Member['grade']`([인덱스 접근 타입](../part3-intermediate/06-keyof-typeof-indexed))를 쓰면 등급 종류가 바뀌어도 한 곳만 고치면 됩니다. `memberApi.updateGrade(1, 'SILVER')`는 컴파일 오류가 납니다.
:::

### 문제 3 ⭐⭐ 시간 초과 메시지 확인하기

`toApiError`가 다음 각 경우에 돌려주는 `status`와 `code`를 적어 보세요.

1. 서버가 `500`과 HTML 오류 페이지를 보냄
2. 서버가 `404`와 `{ success: false, error: { code: 'PRODUCT_NOT_FOUND', ... } }`를 보냄
3. 5초 안에 응답이 없음
4. `undefined.name`처럼 코드 버그로 `TypeError`가 남

::: details 정답 보기
1. `500`, `'HTTP_ERROR'` — 응답은 있지만 본문이 `ApiFailure` 모양이 아님
2. `404`, `'PRODUCT_NOT_FOUND'` — 본문의 코드를 그대로 씀
3. `null`, `'TIMEOUT'` — 응답이 없고 `err.code === 'ECONNABORTED'`
4. `null`, `'UNKNOWN'` — axios 오류가 아님. 메시지는 원래 `Error`의 메시지

이렇게 정리해 두면 화면은 `code`만 보고 "다시 시도" 버튼을 보여 줄지(TIMEOUT, NETWORK_ERROR), 안내 문구만 보여 줄지 정할 수 있습니다.
:::

### 문제 4 ⭐⭐ 주문 스키마 검증

다음 주문 응답을 검증하는 `OrderSchema`와 `orderApi.get(orderNo)`를 zod와 `requestParsed`로 만드세요. 타입 `Order`는 스키마에서 뽑습니다.

- `orderNo`: 문자열
- `status`: `'READY' | 'PAID' | 'CANCELED'`
- `totalAmount`: 0 이상의 정수
- `orderedAt`: ISO 날짜·시간 문자열(예: `2026-10-28T09:30:00Z`)

::: details 정답 보기
```ts
const OrderSchema = z.object({
  orderNo: z.string(),
  status: z.enum(['READY', 'PAID', 'CANCELED']),
  totalAmount: z.number().int().nonnegative(),
  orderedAt: z.iso.datetime(), // zod 4 문법. zod 3에서는 z.string().datetime()
})
export type Order = z.infer<typeof OrderSchema>

export const orderApi = {
  get: (orderNo: string) => requestParsed(http.get(`/orders/${orderNo}`), OrderSchema), // Promise<Order>
}

console.log(OrderSchema.safeParse({ orderNo: 'A-1001', status: 'PAID', totalAmount: 9000, orderedAt: '2026-10-28T09:30:00Z' }).success)
// 출력: true
console.log(OrderSchema.safeParse({ orderNo: 'A-1001', status: 'DONE', totalAmount: 9000, orderedAt: '2026-10-28T09:30:00Z' }).success)
// 출력: false
```

`z.enum`에서 뽑힌 `status` 타입은 `'READY' | 'PAID' | 'CANCELED'` 유니온이라, 화면에서 `switch`로 완전성 검사도 할 수 있습니다.
:::

### 문제 5 ⭐⭐⭐ 페이지 응답 스키마

목록 API가 `{ items: T[], page, size, totalCount }` 모양의 페이지 응답을 준다고 합시다. 항목 스키마를 받아 페이지 스키마를 만드는 제네릭 함수 `pageSchema`를 만들고, `pagedProductApi.list(page)`의 반환 타입이 항목 타입까지 정확히 추론되게 하세요.

::: details 정답 보기
```ts
function pageSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    page: z.number().int().min(1),
    size: z.number().int().positive(),
    totalCount: z.number().int().nonnegative(),
  })
}

export const pagedProductApi = {
  list: (page: number) =>
    requestParsed(http.get('/products', { params: { page, size: 20 } }), pageSchema(ProductSchema)),
}

// 사용
const result = await pagedProductApi.list(1)
const firstName: string | undefined = result.items[0]?.name // items: Product[]
const total: number = result.totalCount
```

`pageSchema(ProductSchema)`를 **부르는 곳**에서는 `T`가 구체적인 `ProductSchema`로 정해지므로, `requestParsed`의 반환 타입이 `{ items: Product[]; page: number; ... }`로 정확히 추론됩니다. `params` 옵션은 쿼리 문자열 `?page=1&size=20`을 만들어 줍니다.
:::

## 확인 퀴즈

1. axios 인스턴스를 하나 만들어 공유하면 무엇이 좋은가요?
2. 공통 응답을 `success`를 판별자로 하는 판별 유니온으로 만드는 이유는 무엇인가요?
3. `isAxiosError(err)`로 좁힌 뒤에도 `err.response`를 다시 확인해야 하는 이유는 무엇인가요?
4. 토큰을 인터셉터에서 "요청할 때마다 저장소에서 읽는" 이유는 무엇인가요?
5. `http.get<Product>(...)`와 zod 검증은 무엇이 다른가요?

::: details 정답 보기
1. 주소·시간 제한·헤더·인터셉터 같은 공통 설정과 처리를 한 곳에서 관리할 수 있습니다.
2. `success`로 좁히면 성공일 때는 `data`, 실패일 때는 `error`만 존재한다는 것을 타입이 알게 되어, 불가능한 조합과 단언이 사라집니다.
3. 네트워크 오류·시간 초과처럼 응답 자체가 없는 axios 오류가 있어서 `err.response`가 `undefined`일 수 있기 때문입니다.
4. 토큰을 코드에 고정하지 않기 위해서이고, 로그인·로그아웃·갱신으로 바뀐 토큰이 다음 요청부터 바로 반영되게 하기 위해서입니다.
5. `http.get<Product>`는 실행 중 아무것도 검사하지 않는 약속이고, zod는 실제 값을 검사해 모양이 다르면 경계에서 오류를 냅니다.
:::

## 정리

- axios **인스턴스**에 공통 설정을 모으고, **요청 인터셉터**로 토큰을 저장소에서 읽어 붙입니다. 토큰·키는 코드에 쓰지 않습니다.
- 공통 응답은 `ApiResponse<T> = ApiSuccess<T> | ApiFailure` 판별 유니온으로 표현합니다.
- `catch`의 `unknown` 오류는 `isAxiosError`와 타입 가드로 좁혀 **`ApiError` 하나로** 바꿔 던집니다.
- 화면은 도메인별 API 모듈(`productApi.list()`)만 부르고, 주소·헤더·응답 형식을 몰라도 되게 합니다.
- 백엔드 DTO와 프런트 타입은 OpenAPI 코드 생성으로 맞추고, 중요한 응답은 zod로 검증합니다. **바깥에서 온 값은 검증 전까지 `unknown`** 입니다.

## 다음 단계

[좋은 타입 설계 원칙과 패턴](./07-type-design) — 지금까지 Part 7에서 반복해 나온 "불가능한 상태 없애기", "경계에서 검증하기"를 타입 설계 원칙으로 정리합니다.
