---
title: "프로젝트 4: React 주문 앱 (React + zustand + API 연동)"
---

# 프로젝트 4: React 주문 앱 (React + zustand + API 연동)

<LessonMeta level="실전" :minutes="360" prev="프로젝트 3에서 zod 검증과 테스트를 갖춘 주문 REST API 서버를 완성" />

마지막 프로젝트는 프로젝트 3의 API 서버에 붙는 **카페 주문 화면**입니다. 메뉴를 불러와 장바구니에 담고, 수량을 바꾸고, 주문하고, 주문 내역에서 취소까지 합니다. 지금까지의 프로젝트가 모두 모입니다.

- 프로젝트 1·2의 **판별 유니온** → 로딩/성공/에러 상태와 주문 상태 표시
- 프로젝트 2의 **상태 → 렌더 단방향** → React 컴포넌트와 zustand 스토어
- 프로젝트 3의 **공통 에러 응답** → 화면에 보여 줄 에러 메시지

## 완성하면 이렇게 됩니다

터미널 두 개를 엽니다. 하나는 API 서버, 하나는 화면 개발 서버입니다.

```bash
# 터미널 1: 프로젝트 3 API 서버 (http://localhost:3000)
cd examples/projects/03-rest-api
npm run dev

# 터미널 2: 이 프로젝트 (http://localhost:5173)
cd examples/projects/04-react-order-app
npm run dev
```

브라우저에서 `http://localhost:5173`을 열고 아메리카노 2잔, 치즈케이크 1개를 담아 주문한 뒤, 주문 내역에서 취소한 화면입니다.

```text
카페 주문
┌ 메뉴 ─────────────────────────────────┐ ┌ 장바구니 (0개) ───────────────┐
│ 커피   아메리카노      4,500원  [담기] │ │ 메뉴에서 담기를 눌러 주세요.   │
│ 커피   카페라테        5,000원  [담기] │ │                 합계 0원      │
│ 커피   바닐라라테      5,500원  [담기] │ │ [        주문하기        ]    │
│ 차     얼그레이        4,800원  [담기] │ │ 주문 O-0001 접수 완료         │
│ 차     캐모마일        4,800원  [담기] │ │ (15,500원)                    │
│ 디저트 치즈케이크      6,500원  [담기] │ └───────────────────────────────┘
│ 디저트 크루아상        3,800원  [품절] │   ← 품절 상품은 버튼이 비활성
└───────────────────────────────────────┘
┌ 주문 내역 [새로 고침] ─────────────────────────────────────────────────┐
│ O-0001 (취소) 10. 27. 13:56                                            │
│ 아메리카노 2개, 치즈케이크 1개 · 15,500원                              │
│ 취소 사유: 고객 요청                                                   │
└────────────────────────────────────────────────────────────────────────┘
```

주문하기 직전, 장바구니에는 이렇게 보였습니다.

```text
장바구니 (3개)
아메리카노   [−] 2 [+]   9,000원  [삭제]
치즈케이크   [−] 1 [+]   6,500원  [삭제]
                         합계 15,500원
[        주문하기        ]
```

API 서버를 꺼 둔 채로 열면 메뉴와 주문 내역 자리에 `서버에 연결할 수 없습니다. API 서버가 켜져 있는지 확인해 주세요.`와 "다시 시도" 버튼이 나옵니다.

## 요구사항

1. **메뉴 목록**: `GET /api/products`로 불러옵니다. 불러오는 중·실패·성공을 구분해 보여 주고, 실패하면 "다시 시도"할 수 있습니다. 품절 상품은 담을 수 없습니다.
2. **장바구니**: 담기(이미 있으면 수량 +1), 수량 증감(0이 되면 빠짐, 최대 99), 삭제, 상품별 금액과 합계, 담긴 개수. 장바구니는 여러 컴포넌트가 함께 쓰므로 zustand 스토어에 둡니다.
3. **주문**: `POST /api/orders`로 주문합니다. 주문 중에는 버튼을 막아 두 번 주문되지 않게 하고, 성공하면 장바구니를 비우고 주문 번호와 금액을 보여 줍니다. 실패하면 서버가 준 에러 메시지(예: `품절된 상품입니다: 크루아상`)를 보여 줍니다.
4. **주문 내역**: `GET /api/orders`로 최근 주문부터 보여 주고, 주문하면 자동으로 새로 고칩니다. 접수 상태의 주문만 "주문 취소" 버튼이 있고, 취소된 주문은 사유를 보여 줍니다.
5. **금액·시각 포맷**: `15,500원`, `10. 27. 13:56`처럼 한국 형식으로 보여 줍니다.
6. **API 연동**: 개발 중에는 Vite 프록시로 `/api` 요청을 API 서버로 넘깁니다(CORS 설정 불필요).
7. **타입**: 비동기 상태는 판별 유니온 `AsyncState<T>`로 표현하고, `any` 없이 `strict`로 컴파일되어야 합니다.

## 필요한 지식

- React 컴포넌트·props·state·이벤트: [React + TS 기초](../part7-practice/02-react-basics)
- `useEffect`와 커스텀 훅: [React + TS 훅](../part7-practice/03-react-hooks)
- zustand: [상태 관리 zustand를 타입 안전하게](../part7-practice/05-zustand)
- fetch와 응답 타입: [fetch로 API 호출하고 응답에 타입 붙이기](../part4-async/04-fetch-api)
- 공통 응답·에러 설계: [API 클라이언트 타입 설계](../part7-practice/06-api-client)
- 판별 유니온: [판별 유니온과 완전성 검사](../part3-intermediate/03-discriminated-union)
- 제네릭: [제네릭 기초](../part3-intermediate/04-generics-basics)
- `Intl`과 `Date`: [JSON · Date · Map · Set](../part4-async/06-json-date-map-set)
- API 서버: [프로젝트 3](./03-rest-api)

## 설계하기

::: tip 먼저 스스로 해 보세요
"메뉴를 불러오는 중", "불러오기 실패", "불러온 메뉴"를 각각 `isLoading: boolean`, `error: string | null`, `data: Product[] | null` 세 변수로 관리한다고 생각해 보세요. `isLoading`이 `true`인데 `error`도 있는 상태는 무슨 뜻일까요? 이런 "말이 안 되는 조합"을 없애는 타입을 설계해 보세요.
:::

### 비동기 상태: AsyncState

```ts
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string }
```

세 변수를 따로 두면 2 × 2 × 2 = 8가지 조합이 생기지만, 의미 있는 상태는 네 가지뿐입니다. 판별 유니온으로 만들면 **정확히 네 가지 상태만** 존재하고, `data`는 `success`일 때만, `message`는 `error`일 때만 꺼낼 수 있습니다. 제네릭 `T` 덕분에 상품 목록(`AsyncState<Product[]>`)과 주문 목록(`AsyncState<Order[]>`)에 같은 타입을 씁니다.

주문 버튼을 누른 뒤의 상태도 같은 생각으로 따로 만듭니다.

```ts
type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'done'; order: Order }
  | { status: 'error'; message: string }
```

### 서버 타입 옮겨 오기

`Product`, `Order`, `ErrorBody`는 프로젝트 3의 응답과 **같은 모양**으로 `types.ts`에 옮겨 적습니다. 서버와 화면이 같은 타입을 쓰지 않으면, 서버가 바뀌었을 때 화면은 컴파일러의 도움 없이 실행 중에야 깨집니다. 실무에서는 서버·화면이 타입 패키지를 공유하거나 OpenAPI 문서에서 타입을 생성해 이 문제를 줄입니다(도전 과제 5).

### 상태를 어디에 둘까

```text
장바구니 items      → zustand 스토어 (메뉴의 [담기]와 장바구니가 함께 씀)
메뉴 목록·주문 내역 → 각 컴포넌트의 useAsync (그 컴포넌트만 씀)
주문 버튼 상태      → Cart 컴포넌트의 useState
합계·개수           → 저장하지 않고 items에서 계산
```

여러 컴포넌트가 함께 쓰는 상태만 스토어에 올리고, 나머지는 쓰는 컴포넌트 가까이에 둡니다. 모든 것을 스토어에 넣으면 어디서 무엇이 바뀌는지 추적하기 어려워집니다.

### 파일 나누기

```text
index.html
vite.config.ts            /api 프록시 설정
src/
  types.ts                서버 응답 타입 + AsyncState
  api.ts                  request<T>, ApiError, API 함수들
  format.ts               금액·시각 포맷, 한글 라벨
  cart-store.ts           장바구니 zustand 스토어
  use-async.ts            비동기 불러오기 커스텀 훅
  components/
    MenuList.tsx          메뉴 목록
    Cart.tsx              장바구니 + 주문
    OrderHistory.tsx      주문 내역 + 취소
  App.tsx                 화면 배치
  App.css
  main.tsx                시작점
```

```text
[MenuList] ─담기─▶ useCartStore.add ─▶ items 변경 ─▶ [Cart] 다시 그림
[Cart] ─주문하기─▶ api.createOrder ─▶ 성공: clear() + onOrdered() ─▶ App의 historyKey +1
                                                                    └▶ [OrderHistory] 새로 불러옴
```

## 단계별 구현

### Step 1. 프로젝트 만들기와 프록시

**목표**: React + TypeScript 개발 환경을 만들고, `/api` 요청이 프로젝트 3 서버로 가게 합니다.

```bash
npm create vite@latest react-order-app -- --template react-ts
cd react-order-app
npm install
npm install zustand
```

작성 시점(2026-10) 기준 설치된 버전은 react·react-dom 19.3.1, zustand 5.0.16, vite 8.3.5, @vitejs/plugin-react 6.1.2, typescript 5.9.3, @types/react·@types/react-dom 19.3.0입니다. 템플릿이 만든 `src` 안의 예시 파일과 `eslint.config.js`는 지워도 됩니다. 완성 코드는 설정을 줄이려고 ESLint 없이 `tsconfig.json` 하나로 합쳤습니다.

```json
{
  "name": "react-order-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.3.1",
    "react-dom": "^19.3.1",
    "zustand": "^5.0.16"
  },
  "devDependencies": {
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "@vitejs/plugin-react": "^6.1.2",
    "typescript": "~5.9.3",
    "vite": "^8.3.5"
  }
}
```

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["vite/client"],
    "jsx": "react-jsx",
    "skipLibCheck": true,

    /* 번들러(Vite) 모드 */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* 엄격 검사 */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src", "vite.config.ts"]
}
```

프로젝트 2와 다른 점은 `"jsx": "react-jsx"` 한 줄입니다. `.tsx` 파일의 JSX를 React 19 방식으로 바꾸라는 뜻이며, 덕분에 파일마다 `import React`를 쓰지 않아도 됩니다.

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // 개발 서버(5173)로 온 /api 요청을 프로젝트 3의 API 서버(3000)로 넘겨 줍니다.
    // 브라우저 입장에서는 같은 주소로 요청하므로 CORS 설정이 필요 없습니다.
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
```

**왜 프록시인가?** 화면은 `localhost:5173`, API는 `localhost:3000`에 있습니다. 포트가 다르면 브라우저는 "다른 출처(origin)"로 보고, 서버가 허락하지 않는 한 응답을 읽지 못하게 막습니다. 이 보안 규칙이 **CORS**(Cross-Origin Resource Sharing)입니다. 해결 방법은 두 가지입니다.

1. API 서버에 CORS 허용 설정을 추가한다(`cors` 패키지 등).
2. 개발 서버가 요청을 대신 전달하게 한다(프록시).

프록시를 쓰면 브라우저는 `localhost:5173/api/products`로 요청하므로 같은 출처가 되고, Vite가 뒤에서 `localhost:3000/api/products`로 넘겨 줍니다. 서버 코드를 고치지 않아도 되고, 실제 배포에서도 화면과 API를 같은 주소 아래 두는 경우가 많아 그 환경과 비슷합니다.

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>카페 주문</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

```text
node_modules
dist
*.local
```

**체크포인트**
- [ ] 프로젝트 3 서버를 켠 상태에서 `npm run dev` 후 `http://localhost:5173/api/products`를 브라우저 주소창에 열면 상품 JSON이 보인다.

### Step 2. 타입과 포맷 함수

**목표**: 서버 응답 타입, `AsyncState`, 화면 표시용 함수를 만듭니다.

```ts
// 서버(프로젝트 3) 응답과 같은 모양의 타입입니다.
// 실무에서는 서버와 패키지로 공유하거나 OpenAPI 등에서 생성하지만, 여기서는 직접 옮겨 적습니다.

export type ProductCategory = 'coffee' | 'tea' | 'dessert'

export interface Product {
  id: string
  name: string
  category: ProductCategory
  price: number
  soldOut: boolean
}

export interface OrderLine {
  productId: string
  productName: string
  unitPrice: number
  quantity: number
  lineAmount: number
}

interface OrderBase {
  id: string
  lines: OrderLine[]
  totalAmount: number
  createdAt: string
}

export type Order =
  | (OrderBase & { status: 'received' })
  | (OrderBase & { status: 'completed'; completedAt: string })
  | (OrderBase & { status: 'cancelled'; cancelledAt: string; cancelReason: string })

export type OrderStatus = Order['status']

/** 주문 생성 요청 본문 */
export interface CreateOrderRequest {
  items: { productId: string; quantity: number }[]
}

/** 서버의 공통 에러 응답 */
export interface ErrorBody {
  error: {
    code: string
    message: string
    details?: { path: string; message: string }[]
  }
}

/** 비동기 작업의 상태 (판별 유니온: status로 구분) */
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string }
```

```ts
// 화면 표시용 포맷 함수입니다.
import type { OrderStatus, ProductCategory } from './types'

// Intl.NumberFormat은 만들 때 비용이 있어서 한 번만 만들어 재사용합니다.
const wonFormatter = new Intl.NumberFormat('ko-KR')

/** 15500 → '15,500원' */
export function formatWon(amount: number): string {
  return `${wonFormatter.format(amount)}원`
}

const dateTimeFormatter = new Intl.DateTimeFormat('ko-KR', {
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

/** ISO 문자열 → '10. 26. 13:46' (내 컴퓨터 시간대 기준) */
export function formatDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso))
}

export const CATEGORY_LABEL: Record<ProductCategory, string> = {
  coffee: '커피',
  tea: '차',
  dessert: '디저트',
}

export const STATUS_LABEL: Record<OrderStatus, string> = {
  received: '접수',
  completed: '제공 완료',
  cancelled: '취소',
}
```

- `Intl.NumberFormat('ko-KR')`은 `15500`을 `15,500`으로 바꿉니다. 만드는 데 비용이 있으므로 함수 밖에서 한 번만 만들어 재사용합니다.
- `formatDateTime`은 서버가 준 UTC 시각(`...Z`)을 **내 컴퓨터 시간대**로 바꿔 보여 줍니다. 그래서 같은 주문이라도 시간대 설정이 다른 컴퓨터에서는 다르게 보일 수 있습니다.
- `CATEGORY_LABEL`, `STATUS_LABEL`은 `Record`라서 프로젝트 3처럼 상태가 늘어나면 여기도 고치라고 컴파일러가 알려 줍니다.

**체크포인트**
- [ ] `npx tsc --noEmit`이 통과한다.

### Step 3. API 함수

**목표**: `fetch`를 감싸 성공이면 타입이 붙은 값을, 실패면 화면에 보여 줄 수 있는 `ApiError`를 돌려줍니다.

```ts
// API 호출 모음입니다. fetch의 번거로운 부분(JSON 변환, 에러 응답 처리)을 request 하나에 모읍니다.
import type { CreateOrderRequest, ErrorBody, Order, Product } from './types'

/** API 호출 실패. 화면은 message만 보여 주면 됩니다. */
export class ApiError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

const NETWORK_MESSAGE = '서버에 연결할 수 없습니다. API 서버가 켜져 있는지 확인해 주세요.'

function isErrorBody(value: unknown): value is ErrorBody {
  if (typeof value !== 'object' || value === null || !('error' in value)) return false
  const error = value.error
  return typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string'
}

/**
 * 공통 요청 함수. 성공하면 T로 본 응답 본문을, 실패하면 ApiError를 던집니다.
 * T는 "서버가 이 모양으로 준다"는 약속일 뿐 실행 중에 검사하지는 않습니다.
 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    // 이 앱의 요청 본문은 모두 JSON이므로 Content-Type을 기본으로 붙입니다.
    response = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...init })
  } catch {
    // 네트워크가 끊긴 경우 fetch 자체가 실패합니다.
    throw new ApiError(0, 'NETWORK_ERROR', NETWORK_MESSAGE)
  }

  // 본문이 JSON이 아닐 수도 있으므로(프록시 오류 페이지 등) 실패해도 멈추지 않게 합니다.
  const body: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    if (isErrorBody(body)) {
      throw new ApiError(response.status, body.error.code, body.error.message)
    }
    // API 서버가 꺼져 있으면 Vite 프록시가 502 같은 게이트웨이 오류로 답합니다.
    if (response.status >= 502 && response.status <= 504) {
      throw new ApiError(response.status, 'NETWORK_ERROR', NETWORK_MESSAGE)
    }
    throw new ApiError(response.status, 'UNKNOWN', `요청에 실패했습니다. (HTTP ${response.status})`)
  }
  // 프록시 설정이 빠지면 Vite가 /api 요청에도 index.html(200)을 돌려줍니다. JSON이 아니면 여기서 막습니다.
  if (body === null) {
    throw new ApiError(response.status, 'INVALID_RESPONSE', '서버 응답이 JSON이 아닙니다. API 주소와 프록시 설정을 확인해 주세요.')
  }
  return body as T
}

export function fetchProducts(): Promise<Product[]> {
  return request<Product[]>('/api/products')
}

export function createOrder(body: CreateOrderRequest): Promise<Order> {
  return request<Order>('/api/orders', { method: 'POST', body: JSON.stringify(body) })
}

export function fetchOrders(): Promise<Order[]> {
  return request<Order[]>('/api/orders')
}

export function cancelOrder(id: string, reason: string): Promise<Order> {
  return request<Order>(`/api/orders/${encodeURIComponent(id)}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  })
}

/** catch로 받은 unknown 에러를 화면에 보여 줄 문장으로 바꿉니다. */
export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return '알 수 없는 오류가 발생했습니다.'
}
```

- `fetch`는 **HTTP 400·500 응답에도 실패하지 않습니다.** 네트워크 자체가 끊겼을 때만 `catch`로 갑니다. 그래서 `response.ok`(상태 코드 200~299)를 직접 확인해야 합니다.
- 실패 응답 본문이 프로젝트 3의 공통 에러 형식이면 그 `message`를 씁니다. `isErrorBody` 타입 가드에서 `'error' in value`로 좁히면 `value.error`를 읽을 수 있습니다(`in` 좁히기).
- API 서버가 꺼져 있으면 `fetch`는 성공하고, Vite 프록시가 **502**(Bad Gateway)로 답합니다. 이 경우도 "서버에 연결할 수 없습니다"로 바꿉니다. 직접 꺼 보고 확인한 동작입니다.
- 성공 응답인데 본문이 JSON이 아니면(`body === null`) 역시 에러로 바꿉니다. 프록시 설정이 빠졌을 때 생기는 일입니다(자주 막히는 곳 3).
- `return body as T`는 **단언**입니다. 서버가 약속을 어기면 잡지 못합니다. 더 안전하게 하려면 프로젝트 3처럼 zod로 응답도 검사합니다(도전 과제 4).
- `encodeURIComponent(id)`: 주문 id에 `/`나 `?` 같은 문자가 섞여도 주소가 깨지지 않게 합니다.

**체크포인트**
- [ ] `request<T>`의 `T`가 호출하는 함수마다(`Product[]`, `Order`) 다르게 정해지는 것을 마우스를 올려 확인했다.

### Step 4. 장바구니 스토어

**목표**: zustand로 장바구니를 만듭니다.

```ts
// 장바구니 상태(zustand 스토어)입니다. 여러 컴포넌트가 같은 장바구니를 봅니다.
import { create } from 'zustand'
import type { Product } from './types'

export interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
}

export const MAX_QUANTITY = 99

interface CartState {
  items: CartItem[]
  /** 상품을 1개 담습니다. 이미 있으면 수량을 1 늘립니다. */
  add: (product: Product) => void
  /** 수량을 바꿉니다. 0 이하가 되면 장바구니에서 뺍니다. */
  changeQuantity: (productId: string, quantity: number) => void
  remove: (productId: string) => void
  clear: () => void
}

export const useCartStore = create<CartState>()((set) => ({
  items: [],

  add: (product) =>
    set((state) => {
      const found = state.items.find((item) => item.productId === product.id)
      if (found === undefined) {
        const item: CartItem = { productId: product.id, name: product.name, price: product.price, quantity: 1 }
        return { items: [...state.items, item] }
      }
      return {
        items: state.items.map((item) =>
          item.productId === product.id ? { ...item, quantity: Math.min(item.quantity + 1, MAX_QUANTITY) } : item,
        ),
      }
    }),

  changeQuantity: (productId, quantity) =>
    set((state) => ({
      items:
        quantity <= 0
          ? state.items.filter((item) => item.productId !== productId)
          : state.items.map((item) =>
              item.productId === productId ? { ...item, quantity: Math.min(quantity, MAX_QUANTITY) } : item,
            ),
    })),

  remove: (productId) => set((state) => ({ items: state.items.filter((item) => item.productId !== productId) })),

  clear: () => set({ items: [] }),
}))

/** 장바구니 합계 금액. 상태에 저장하지 않고 items에서 계산합니다. */
export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

/** 장바구니에 담긴 상품 개수(수량 합) */
export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}
```

- `create<CartState>()(...)`: 괄호가 두 번입니다. 첫 번째 `()`에서 상태 타입을 정하고, 두 번째에 실제 내용을 넘깁니다. zustand가 타입 추론을 정확하게 하려고 권장하는 형태입니다.
- `set((state) => ({ items: ... }))`: 이전 상태를 받아 **바꿀 부분만** 새 객체로 돌려줍니다. 프로젝트 1·2처럼 배열을 직접 고치지(`push`) 않고 새 배열을 만듭니다. 새 배열이어야 zustand와 React가 "바뀌었다"고 알아챕니다.
- `cartTotal`, `cartCount`는 스토어 밖의 순수 함수입니다. 합계를 상태로 저장하지 않으니 `items`와 어긋날 일이 없습니다.

**체크포인트**
- [ ] `add`의 매개변수 `product`에 마우스를 올리면 `Product` 타입으로 추론되어 있다(`CartState`에서 정했기 때문).

### Step 5. 비동기 불러오기 훅

**목표**: "불러오기 → 상태 변경"을 컴포넌트마다 반복하지 않도록 `useAsync` 커스텀 훅으로 묶습니다.

```ts
// 비동기 데이터를 불러와 AsyncState로 관리하는 커스텀 훅입니다.
import { useCallback, useEffect, useState } from 'react'
import { errorMessage } from './api'
import type { AsyncState } from './types'

/**
 * load 함수를 처음 한 번 실행하고, 결과를 AsyncState로 돌려줍니다.
 * reload를 부르면 다시 불러옵니다.
 * load는 컴포넌트 밖에 선언한 함수(fetchProducts 등)를 넘겨야 무한 반복되지 않습니다.
 */
export function useAsync<T>(load: () => Promise<T>): { state: AsyncState<T>; reload: () => void } {
  const [state, setState] = useState<AsyncState<T>>({ status: 'idle' })
  // reload를 부를 때마다 숫자를 올려 useEffect를 다시 실행시킵니다.
  const [version, setVersion] = useState(0)

  useEffect(() => {
    // 응답이 오기 전에 컴포넌트가 사라지거나 다시 요청하면, 늦게 온 응답은 버립니다.
    let ignore = false
    setState({ status: 'loading' })
    load()
      .then((data) => {
        if (!ignore) setState({ status: 'success', data })
      })
      .catch((error: unknown) => {
        if (!ignore) setState({ status: 'error', message: errorMessage(error) })
      })
    return () => {
      ignore = true
    }
  }, [load, version])

  const reload = useCallback(() => setVersion((v) => v + 1), [])
  return { state, reload }
}
```

- `useState<AsyncState<T>>({ status: 'idle' })`: 제네릭 인자를 꼭 적습니다. 빼면 초깃값에서 `{ status: string }`으로 추론되어 판별 유니온의 이점이 사라집니다.
- `useEffect`의 정리 함수(`return () => { ignore = true }`)는 컴포넌트가 사라지거나 다시 요청할 때 실행됩니다. 늦게 도착한 옛 응답이 새 결과를 덮어쓰는 문제(경쟁 상태, race condition)를 막습니다. 개발 모드의 `StrictMode`는 effect를 일부러 두 번 실행하는데, 이때도 첫 응답은 버려집니다.
- 의존성 배열에 `load`가 있으므로, 컴포넌트 안에서 매번 새로 만드는 화살표 함수를 넘기면 무한 반복됩니다. `fetchProducts`처럼 모듈 수준 함수를 넘깁니다.

**체크포인트**
- [ ] 개발자 도구 Network 탭에서 `products` 요청이 끝없이 반복되지 않는다.

### Step 6. 컴포넌트

**목표**: 메뉴·장바구니·주문 내역 화면을 만들고 연결합니다.

```tsx
// 메뉴(상품) 목록. 서버에서 불러와 로딩/에러/성공 상태별로 다르게 그립니다.
import { fetchProducts } from '../api'
import { useCartStore } from '../cart-store'
import { CATEGORY_LABEL, formatWon } from '../format'
import type { Product } from '../types'
import { useAsync } from '../use-async'

export function MenuList() {
  const { state, reload } = useAsync(fetchProducts)

  switch (state.status) {
    case 'idle':
    case 'loading':
      return <p className="info">메뉴를 불러오는 중입니다...</p>
    case 'error':
      return (
        <div className="error-box">
          <p>{state.message}</p>
          <button type="button" onClick={reload}>
            다시 시도
          </button>
        </div>
      )
    case 'success':
      return (
        <ul className="menu-list">
          {state.data.map((product) => (
            <MenuItem key={product.id} product={product} />
          ))}
        </ul>
      )
  }
}

function MenuItem({ product }: { product: Product }) {
  // 스토어 전체가 아니라 필요한 함수만 골라 구독합니다(불필요한 다시 그리기 방지).
  const add = useCartStore((state) => state.add)

  return (
    <li className="menu-item">
      <span className="category">{CATEGORY_LABEL[product.category]}</span>
      <strong>{product.name}</strong>
      <span>{formatWon(product.price)}</span>
      <button type="button" disabled={product.soldOut} onClick={() => add(product)}>
        {product.soldOut ? '품절' : '담기'}
      </button>
    </li>
  )
}
```

- `switch (state.status)`의 각 `case` 안에서 `state`가 좁혀져 `state.message`, `state.data`를 쓸 수 있습니다. 네 경우 모두 `return`하므로 `default`가 필요 없습니다.
- `useCartStore((state) => state.add)`: **셀렉터**(selector, 스토어에서 필요한 부분만 고르는 함수)로 `add`만 구독합니다. 이 컴포넌트는 장바구니 내용이 바뀌어도 다시 그려지지 않습니다.
- props 타입은 `{ product }: { product: Product }`처럼 바로 적었습니다. 길어지면 `interface MenuItemProps`로 뺍니다.

```tsx
// 장바구니와 주문하기 버튼입니다.
import { useState } from 'react'
import { createOrder, errorMessage } from '../api'
import { cartCount, cartTotal, MAX_QUANTITY, useCartStore } from '../cart-store'
import { formatWon } from '../format'
import type { Order } from '../types'

/** 주문 버튼을 누른 뒤의 상태 */
type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'done'; order: Order }
  | { status: 'error'; message: string }

export function Cart({ onOrdered }: { onOrdered: (order: Order) => void }) {
  const items = useCartStore((state) => state.items)
  const changeQuantity = useCartStore((state) => state.changeQuantity)
  const remove = useCartStore((state) => state.remove)
  const clear = useCartStore((state) => state.clear)
  const [submit, setSubmit] = useState<SubmitState>({ status: 'idle' })

  async function handleOrder() {
    setSubmit({ status: 'submitting' })
    try {
      const order = await createOrder({
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      })
      clear()
      setSubmit({ status: 'done', order })
      onOrdered(order)
    } catch (error) {
      setSubmit({ status: 'error', message: errorMessage(error) })
    }
  }

  return (
    <section className="cart">
      <h2>장바구니 ({cartCount(items)}개)</h2>

      {items.length === 0 ? (
        <p className="info">메뉴에서 담기를 눌러 주세요.</p>
      ) : (
        <ul className="cart-list">
          {items.map((item) => (
            <li key={item.productId}>
              <span className="name">{item.name}</span>
              <button type="button" aria-label={`${item.name} 하나 빼기`} onClick={() => changeQuantity(item.productId, item.quantity - 1)}>
                −
              </button>
              <span className="quantity">{item.quantity}</span>
              <button
                type="button"
                aria-label={`${item.name} 하나 더`}
                disabled={item.quantity >= MAX_QUANTITY}
                onClick={() => changeQuantity(item.productId, item.quantity + 1)}
              >
                +
              </button>
              <span className="amount">{formatWon(item.price * item.quantity)}</span>
              <button type="button" onClick={() => remove(item.productId)}>
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="total">합계 {formatWon(cartTotal(items))}</p>
      <button
        type="button"
        className="primary"
        disabled={items.length === 0 || submit.status === 'submitting'}
        onClick={handleOrder}
      >
        {submit.status === 'submitting' ? '주문 중...' : '주문하기'}
      </button>

      {submit.status === 'done' && (
        <p className="success">
          주문 {submit.order.id} 접수 완료 ({formatWon(submit.order.totalAmount)})
        </p>
      )}
      {submit.status === 'error' && <p className="error">{submit.message}</p>}
    </section>
  )
}
```

- `handleOrder`는 `async` 함수라 `onClick={handleOrder}`에 그대로 넘깁니다. 에러는 함수 안 `try/catch`에서 모두 처리하므로 처리되지 않은 Promise 거부가 생기지 않습니다.
- `disabled={... || submit.status === 'submitting'}`로 주문 중 두 번 누르기를 막습니다.
- `submit.status === 'done' && (...)` 안에서는 `submit.order`를 쓸 수 있습니다. JSX의 `&&`도 좁히기가 됩니다.
- 수량 버튼의 기호 `−`는 마이너스 기호 문자이고, 화면 낭독기(스크린 리더)를 위해 `aria-label`로 뜻을 적었습니다.

```tsx
// 주문 내역. 접수 상태의 주문은 취소할 수 있습니다.
import { useState } from 'react'
import { cancelOrder, errorMessage, fetchOrders } from '../api'
import { formatDateTime, formatWon, STATUS_LABEL } from '../format'
import type { Order } from '../types'
import { useAsync } from '../use-async'

export function OrderHistory() {
  const { state, reload } = useAsync(fetchOrders)
  const [cancelError, setCancelError] = useState('')

  async function handleCancel(order: Order) {
    // prompt는 취소 버튼을 누르면 null을 돌려줍니다.
    const reason = window.prompt(`${order.id} 주문을 취소합니다. 사유를 입력해 주세요.`, '고객 요청')
    if (reason === null) return
    try {
      await cancelOrder(order.id, reason)
      setCancelError('')
      reload()
    } catch (error) {
      setCancelError(errorMessage(error))
    }
  }

  let content
  switch (state.status) {
    case 'idle':
    case 'loading':
      content = <p className="info">주문 내역을 불러오는 중입니다...</p>
      break
    case 'error':
      content = <p className="error">{state.message}</p>
      break
    case 'success':
      content =
        state.data.length === 0 ? (
          <p className="info">아직 주문이 없습니다.</p>
        ) : (
          <ul className="order-list">
            {state.data.map((order) => (
              <OrderRow key={order.id} order={order} onCancel={handleCancel} />
            ))}
          </ul>
        )
      break
  }

  return (
    <section className="orders">
      <h2>
        주문 내역{' '}
        <button type="button" onClick={reload}>
          새로 고침
        </button>
      </h2>
      {cancelError !== '' && <p className="error">{cancelError}</p>}
      {content}
    </section>
  )
}

function OrderRow({ order, onCancel }: { order: Order; onCancel: (order: Order) => void }) {
  const summary = order.lines.map((line) => `${line.productName} ${line.quantity}개`).join(', ')
  return (
    <li className={`order status-${order.status}`}>
      <div>
        <strong>{order.id}</strong> <span className="badge">{STATUS_LABEL[order.status]}</span>{' '}
        <span className="time">{formatDateTime(order.createdAt)}</span>
      </div>
      <div>
        {summary} · {formatWon(order.totalAmount)}
      </div>
      {/* 판별 유니온 덕분에 cancelReason은 취소된 주문에서만 꺼낼 수 있습니다. */}
      {order.status === 'cancelled' && <div className="reason">취소 사유: {order.cancelReason}</div>}
      {order.status === 'received' && (
        <button type="button" onClick={() => onCancel(order)}>
          주문 취소
        </button>
      )}
    </li>
  )
}
```

- `window.prompt`의 반환 타입은 `string | null`입니다. 사용자가 "취소"를 누르면 `null`이므로 먼저 처리합니다. 빈 사유를 입력하면 서버가 400과 `요청 값이 올바르지 않습니다.`로 답하고, 그 메시지가 화면에 나옵니다.
- `order.status === 'cancelled' && ... order.cancelReason`: 판별 유니온 덕분에 취소된 주문에서만 사유를 꺼낼 수 있습니다. 프로젝트 3과 같은 타입을 썼기 때문입니다.
- `let content` 뒤의 `switch`에 `break`를 쓴 이유: `tsconfig`의 `noFallthroughCasesInSwitch`가 `break` 없이 다음 `case`로 넘어가는 실수를 막습니다(`case 'idle':`처럼 내용이 빈 `case`는 허용됩니다).

```tsx
// 화면 전체 배치: 메뉴 | 장바구니, 그 아래 주문 내역
import { useState } from 'react'
import { Cart } from './components/Cart'
import { MenuList } from './components/MenuList'
import { OrderHistory } from './components/OrderHistory'

export function App() {
  // 주문할 때마다 숫자를 올려 OrderHistory를 새로 만들게(key 변경) 해서 목록을 다시 불러옵니다.
  const [historyKey, setHistoryKey] = useState(0)

  return (
    <main className="app">
      <h1>카페 주문</h1>
      <div className="columns">
        <section>
          <h2>메뉴</h2>
          <MenuList />
        </section>
        <Cart onOrdered={() => setHistoryKey((key) => key + 1)} />
      </div>
      <OrderHistory key={historyKey} />
    </main>
  )
}
```

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './App.css'

const rootElement = document.getElementById('root')
if (rootElement === null) {
  throw new Error('index.html에 id="root" 요소가 없습니다.')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- `App`은 주문이 끝날 때마다 `historyKey`를 올립니다. React는 `key`가 바뀐 컴포넌트를 **새로 만들기** 때문에 `OrderHistory`가 처음부터 다시 불러옵니다. 스토어나 이벤트 없이 "새로 고침"을 구현하는 간단한 방법입니다.
- `document.getElementById('root')`는 `HTMLElement | null`입니다. 프로젝트 2처럼 `null`을 먼저 검사합니다(`!` 대신).

`App.css`는 완성 코드 폴더(`examples/projects/04-react-order-app/src/App.css`)에 있습니다. 모양은 자유롭게 바꿔도 됩니다.

**실행 확인**: API 서버와 개발 서버를 모두 켜고 [완성하면 이렇게 됩니다](#완성하면-이렇게-됩니다)를 따라 해 봅니다. 그다음 API 서버를 끄고 새로 고침해 에러 화면도 확인합니다. 마지막으로 빌드합니다.

```bash
npx tsc --noEmit
npm run build
```

```text
dist/index.html                   0.39 kB │ gzip:  0.28 kB
dist/assets/index-YHqDPcAg.css    1.28 kB │ gzip:  0.61 kB
dist/assets/index-4qKR8abI.js   227.62 kB │ gzip: 71.71 kB
✓ built in 599ms
```

해시와 크기·시간은 환경마다 조금씩 다릅니다. 확인이 끝나면 두 터미널에서 `Ctrl+C`로 서버를 끕니다.

**체크포인트**
- [ ] 담기·수량 변경·삭제·합계가 맞다.
- [ ] 주문 후 장바구니가 비고 주문 내역에 새 주문이 맨 위에 나온다.
- [ ] 주문 취소 후 상태가 "취소"로 바뀌고 사유가 보인다.
- [ ] API 서버를 끄면 에러 메시지와 "다시 시도" 버튼이 나온다.
- [ ] `npm run build`가 성공한다.

## 자주 막히는 곳

**1. `state.data`를 읽을 수 없습니다.**

```tsx
function MenuCount({ state }: { state: AsyncState<Product[]> }) {
  return <p>{state.data.length}</p>
}
// ❌ Property 'data' does not exist on type 'AsyncState<Product[]>'. (TS2339)
//    Property 'data' does not exist on type '{ status: "idle"; }'.
```

`status`가 `'success'`인지 먼저 확인합니다. 이 에러는 "불러오는 중에 데이터를 쓰려 했다"는 버그를 미리 잡아 준 것입니다.

**2. `useState({ status: 'idle' })`로 만들었더니 오타가 안 잡힙니다.**

제네릭 인자 없이 쓰면 상태 타입이 `{ status: string }`으로 추론되어 `setState({ status: 'sucess' })` 같은 오타도 통과합니다. `useState<AsyncState<Product[]>>(...)`처럼 타입을 적어 줍니다.

**3. 화면에 `서버 응답이 JSON이 아닙니다. API 주소와 프록시 설정을 확인해 주세요.`가 나옵니다.**

`vite.config.ts`의 프록시 설정이 없거나, 설정을 바꾼 뒤 개발 서버를 다시 켜지 않았을 때입니다. 프록시가 없으면 Vite는 `/api/products` 요청에도 `index.html`을 **200 응답**으로 돌려줍니다. `response.ok`가 `true`라서 상태 코드 검사만으로는 걸러지지 않고, `as T` 단언만 믿었다면 `null`이 `Product[]`인 척 넘어가 `Cannot read properties of null (reading 'map')` 같은 엉뚱한 곳의 에러가 납니다. 완성 코드의 `request`는 본문이 JSON이 아니면 여기서 막습니다. Vite 설정 파일을 고치면 개발 서버를 껐다 켭니다.

**4. 브라우저 콘솔에 `blocked by CORS policy`가 나옵니다.**

`fetch('http://localhost:3000/api/products')`처럼 API 서버 주소를 직접 적었기 때문입니다. 프록시를 쓰려면 `'/api/products'`처럼 **경로만** 적습니다.

**5. 요청이 끝없이 반복됩니다.**

`useAsync(() => fetchProducts())`처럼 렌더링마다 새 함수를 넘기면 `useEffect` 의존성이 매번 바뀝니다. `useAsync(fetchProducts)`처럼 같은 함수를 넘기거나, 컴포넌트 안에서 만들어야 한다면 `useCallback`으로 감쌉니다.

**6. 장바구니에 담았는데 화면이 안 바뀝니다.**

`set`에서 `state.items.push(item); return { items: state.items }`처럼 원래 배열을 고쳐 돌려주면, 배열의 주소가 같아서 zustand가 "안 바뀌었다"고 판단합니다. 항상 새 배열(`[...state.items, item]`)을 만듭니다.

## 도전 과제

1. ⭐ 메뉴를 카테고리(커피·차·디저트) 탭으로 나눠 보여 주세요. 선택된 탭 상태의 타입은 `ProductCategory | 'all'`입니다.
2. ⭐ 장바구니를 `localStorage`에 저장해 새로 고침해도 남게 하세요. zustand의 `persist` 미들웨어를 쓰면 몇 줄이면 됩니다.
3. ⭐⭐ 주문 실패 시 서버가 준 `details`(예: `items.0.quantity`)를 이용해 해당 장바구니 줄을 빨갛게 표시하세요.
4. ⭐⭐ `request<T>`가 단언(`as T`) 대신 zod 스키마를 받아 응답을 실제로 검사하게 바꾸세요. 서버가 `price`를 문자열로 보내도록 일부러 고쳐서 화면이 어떻게 반응하는지 확인합니다.
5. ⭐⭐⭐ 프로젝트 3과 4가 `types.ts`를 중복해서 갖고 있습니다. npm workspaces로 `shared` 패키지를 만들어 두 프로젝트가 같은 타입(가능하면 같은 zod 스키마)을 import하게 바꿔 보세요.

## 완성 코드

전체 코드는 위키 저장소의 `examples/projects/04-react-order-app/` 폴더에 있습니다. API 서버(`examples/projects/03-rest-api`)를 먼저 켜야 합니다.

```bash
cd examples/projects/04-react-order-app
npm install
npm run dev       # http://localhost:5173 (끝낼 때 Ctrl+C)
npm run build     # 타입 검사 + 배포용 빌드
```

::: details src/types.ts
```ts
// 서버(프로젝트 3) 응답과 같은 모양의 타입입니다.
// 실무에서는 서버와 패키지로 공유하거나 OpenAPI 등에서 생성하지만, 여기서는 직접 옮겨 적습니다.

export type ProductCategory = 'coffee' | 'tea' | 'dessert'

export interface Product {
  id: string
  name: string
  category: ProductCategory
  price: number
  soldOut: boolean
}

export interface OrderLine {
  productId: string
  productName: string
  unitPrice: number
  quantity: number
  lineAmount: number
}

interface OrderBase {
  id: string
  lines: OrderLine[]
  totalAmount: number
  createdAt: string
}

export type Order =
  | (OrderBase & { status: 'received' })
  | (OrderBase & { status: 'completed'; completedAt: string })
  | (OrderBase & { status: 'cancelled'; cancelledAt: string; cancelReason: string })

export type OrderStatus = Order['status']

/** 주문 생성 요청 본문 */
export interface CreateOrderRequest {
  items: { productId: string; quantity: number }[]
}

/** 서버의 공통 에러 응답 */
export interface ErrorBody {
  error: {
    code: string
    message: string
    details?: { path: string; message: string }[]
  }
}

/** 비동기 작업의 상태 (판별 유니온: status로 구분) */
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string }
```
:::

::: details src/api.ts
```ts
// API 호출 모음입니다. fetch의 번거로운 부분(JSON 변환, 에러 응답 처리)을 request 하나에 모읍니다.
import type { CreateOrderRequest, ErrorBody, Order, Product } from './types'

/** API 호출 실패. 화면은 message만 보여 주면 됩니다. */
export class ApiError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

const NETWORK_MESSAGE = '서버에 연결할 수 없습니다. API 서버가 켜져 있는지 확인해 주세요.'

function isErrorBody(value: unknown): value is ErrorBody {
  if (typeof value !== 'object' || value === null || !('error' in value)) return false
  const error = value.error
  return typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string'
}

/**
 * 공통 요청 함수. 성공하면 T로 본 응답 본문을, 실패하면 ApiError를 던집니다.
 * T는 "서버가 이 모양으로 준다"는 약속일 뿐 실행 중에 검사하지는 않습니다.
 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    // 이 앱의 요청 본문은 모두 JSON이므로 Content-Type을 기본으로 붙입니다.
    response = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...init })
  } catch {
    // 네트워크가 끊긴 경우 fetch 자체가 실패합니다.
    throw new ApiError(0, 'NETWORK_ERROR', NETWORK_MESSAGE)
  }

  // 본문이 JSON이 아닐 수도 있으므로(프록시 오류 페이지 등) 실패해도 멈추지 않게 합니다.
  const body: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    if (isErrorBody(body)) {
      throw new ApiError(response.status, body.error.code, body.error.message)
    }
    // API 서버가 꺼져 있으면 Vite 프록시가 502 같은 게이트웨이 오류로 답합니다.
    if (response.status >= 502 && response.status <= 504) {
      throw new ApiError(response.status, 'NETWORK_ERROR', NETWORK_MESSAGE)
    }
    throw new ApiError(response.status, 'UNKNOWN', `요청에 실패했습니다. (HTTP ${response.status})`)
  }
  // 프록시 설정이 빠지면 Vite가 /api 요청에도 index.html(200)을 돌려줍니다. JSON이 아니면 여기서 막습니다.
  if (body === null) {
    throw new ApiError(response.status, 'INVALID_RESPONSE', '서버 응답이 JSON이 아닙니다. API 주소와 프록시 설정을 확인해 주세요.')
  }
  return body as T
}

export function fetchProducts(): Promise<Product[]> {
  return request<Product[]>('/api/products')
}

export function createOrder(body: CreateOrderRequest): Promise<Order> {
  return request<Order>('/api/orders', { method: 'POST', body: JSON.stringify(body) })
}

export function fetchOrders(): Promise<Order[]> {
  return request<Order[]>('/api/orders')
}

export function cancelOrder(id: string, reason: string): Promise<Order> {
  return request<Order>(`/api/orders/${encodeURIComponent(id)}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  })
}

/** catch로 받은 unknown 에러를 화면에 보여 줄 문장으로 바꿉니다. */
export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return '알 수 없는 오류가 발생했습니다.'
}
```
:::

::: details src/cart-store.ts
```ts
// 장바구니 상태(zustand 스토어)입니다. 여러 컴포넌트가 같은 장바구니를 봅니다.
import { create } from 'zustand'
import type { Product } from './types'

export interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
}

export const MAX_QUANTITY = 99

interface CartState {
  items: CartItem[]
  /** 상품을 1개 담습니다. 이미 있으면 수량을 1 늘립니다. */
  add: (product: Product) => void
  /** 수량을 바꿉니다. 0 이하가 되면 장바구니에서 뺍니다. */
  changeQuantity: (productId: string, quantity: number) => void
  remove: (productId: string) => void
  clear: () => void
}

export const useCartStore = create<CartState>()((set) => ({
  items: [],

  add: (product) =>
    set((state) => {
      const found = state.items.find((item) => item.productId === product.id)
      if (found === undefined) {
        const item: CartItem = { productId: product.id, name: product.name, price: product.price, quantity: 1 }
        return { items: [...state.items, item] }
      }
      return {
        items: state.items.map((item) =>
          item.productId === product.id ? { ...item, quantity: Math.min(item.quantity + 1, MAX_QUANTITY) } : item,
        ),
      }
    }),

  changeQuantity: (productId, quantity) =>
    set((state) => ({
      items:
        quantity <= 0
          ? state.items.filter((item) => item.productId !== productId)
          : state.items.map((item) =>
              item.productId === productId ? { ...item, quantity: Math.min(quantity, MAX_QUANTITY) } : item,
            ),
    })),

  remove: (productId) => set((state) => ({ items: state.items.filter((item) => item.productId !== productId) })),

  clear: () => set({ items: [] }),
}))

/** 장바구니 합계 금액. 상태에 저장하지 않고 items에서 계산합니다. */
export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

/** 장바구니에 담긴 상품 개수(수량 합) */
export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}
```
:::

::: details src/use-async.ts
```ts
// 비동기 데이터를 불러와 AsyncState로 관리하는 커스텀 훅입니다.
import { useCallback, useEffect, useState } from 'react'
import { errorMessage } from './api'
import type { AsyncState } from './types'

/**
 * load 함수를 처음 한 번 실행하고, 결과를 AsyncState로 돌려줍니다.
 * reload를 부르면 다시 불러옵니다.
 * load는 컴포넌트 밖에 선언한 함수(fetchProducts 등)를 넘겨야 무한 반복되지 않습니다.
 */
export function useAsync<T>(load: () => Promise<T>): { state: AsyncState<T>; reload: () => void } {
  const [state, setState] = useState<AsyncState<T>>({ status: 'idle' })
  // reload를 부를 때마다 숫자를 올려 useEffect를 다시 실행시킵니다.
  const [version, setVersion] = useState(0)

  useEffect(() => {
    // 응답이 오기 전에 컴포넌트가 사라지거나 다시 요청하면, 늦게 온 응답은 버립니다.
    let ignore = false
    setState({ status: 'loading' })
    load()
      .then((data) => {
        if (!ignore) setState({ status: 'success', data })
      })
      .catch((error: unknown) => {
        if (!ignore) setState({ status: 'error', message: errorMessage(error) })
      })
    return () => {
      ignore = true
    }
  }, [load, version])

  const reload = useCallback(() => setVersion((v) => v + 1), [])
  return { state, reload }
}
```
:::

::: details src/components/MenuList.tsx
```tsx
// 메뉴(상품) 목록. 서버에서 불러와 로딩/에러/성공 상태별로 다르게 그립니다.
import { fetchProducts } from '../api'
import { useCartStore } from '../cart-store'
import { CATEGORY_LABEL, formatWon } from '../format'
import type { Product } from '../types'
import { useAsync } from '../use-async'

export function MenuList() {
  const { state, reload } = useAsync(fetchProducts)

  switch (state.status) {
    case 'idle':
    case 'loading':
      return <p className="info">메뉴를 불러오는 중입니다...</p>
    case 'error':
      return (
        <div className="error-box">
          <p>{state.message}</p>
          <button type="button" onClick={reload}>
            다시 시도
          </button>
        </div>
      )
    case 'success':
      return (
        <ul className="menu-list">
          {state.data.map((product) => (
            <MenuItem key={product.id} product={product} />
          ))}
        </ul>
      )
  }
}

function MenuItem({ product }: { product: Product }) {
  // 스토어 전체가 아니라 필요한 함수만 골라 구독합니다(불필요한 다시 그리기 방지).
  const add = useCartStore((state) => state.add)

  return (
    <li className="menu-item">
      <span className="category">{CATEGORY_LABEL[product.category]}</span>
      <strong>{product.name}</strong>
      <span>{formatWon(product.price)}</span>
      <button type="button" disabled={product.soldOut} onClick={() => add(product)}>
        {product.soldOut ? '품절' : '담기'}
      </button>
    </li>
  )
}
```
:::

::: details src/components/Cart.tsx
```tsx
// 장바구니와 주문하기 버튼입니다.
import { useState } from 'react'
import { createOrder, errorMessage } from '../api'
import { cartCount, cartTotal, MAX_QUANTITY, useCartStore } from '../cart-store'
import { formatWon } from '../format'
import type { Order } from '../types'

/** 주문 버튼을 누른 뒤의 상태 */
type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'done'; order: Order }
  | { status: 'error'; message: string }

export function Cart({ onOrdered }: { onOrdered: (order: Order) => void }) {
  const items = useCartStore((state) => state.items)
  const changeQuantity = useCartStore((state) => state.changeQuantity)
  const remove = useCartStore((state) => state.remove)
  const clear = useCartStore((state) => state.clear)
  const [submit, setSubmit] = useState<SubmitState>({ status: 'idle' })

  async function handleOrder() {
    setSubmit({ status: 'submitting' })
    try {
      const order = await createOrder({
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      })
      clear()
      setSubmit({ status: 'done', order })
      onOrdered(order)
    } catch (error) {
      setSubmit({ status: 'error', message: errorMessage(error) })
    }
  }

  return (
    <section className="cart">
      <h2>장바구니 ({cartCount(items)}개)</h2>

      {items.length === 0 ? (
        <p className="info">메뉴에서 담기를 눌러 주세요.</p>
      ) : (
        <ul className="cart-list">
          {items.map((item) => (
            <li key={item.productId}>
              <span className="name">{item.name}</span>
              <button type="button" aria-label={`${item.name} 하나 빼기`} onClick={() => changeQuantity(item.productId, item.quantity - 1)}>
                −
              </button>
              <span className="quantity">{item.quantity}</span>
              <button
                type="button"
                aria-label={`${item.name} 하나 더`}
                disabled={item.quantity >= MAX_QUANTITY}
                onClick={() => changeQuantity(item.productId, item.quantity + 1)}
              >
                +
              </button>
              <span className="amount">{formatWon(item.price * item.quantity)}</span>
              <button type="button" onClick={() => remove(item.productId)}>
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="total">합계 {formatWon(cartTotal(items))}</p>
      <button
        type="button"
        className="primary"
        disabled={items.length === 0 || submit.status === 'submitting'}
        onClick={handleOrder}
      >
        {submit.status === 'submitting' ? '주문 중...' : '주문하기'}
      </button>

      {submit.status === 'done' && (
        <p className="success">
          주문 {submit.order.id} 접수 완료 ({formatWon(submit.order.totalAmount)})
        </p>
      )}
      {submit.status === 'error' && <p className="error">{submit.message}</p>}
    </section>
  )
}
```
:::

::: details src/components/OrderHistory.tsx
```tsx
// 주문 내역. 접수 상태의 주문은 취소할 수 있습니다.
import { useState } from 'react'
import { cancelOrder, errorMessage, fetchOrders } from '../api'
import { formatDateTime, formatWon, STATUS_LABEL } from '../format'
import type { Order } from '../types'
import { useAsync } from '../use-async'

export function OrderHistory() {
  const { state, reload } = useAsync(fetchOrders)
  const [cancelError, setCancelError] = useState('')

  async function handleCancel(order: Order) {
    // prompt는 취소 버튼을 누르면 null을 돌려줍니다.
    const reason = window.prompt(`${order.id} 주문을 취소합니다. 사유를 입력해 주세요.`, '고객 요청')
    if (reason === null) return
    try {
      await cancelOrder(order.id, reason)
      setCancelError('')
      reload()
    } catch (error) {
      setCancelError(errorMessage(error))
    }
  }

  let content
  switch (state.status) {
    case 'idle':
    case 'loading':
      content = <p className="info">주문 내역을 불러오는 중입니다...</p>
      break
    case 'error':
      content = <p className="error">{state.message}</p>
      break
    case 'success':
      content =
        state.data.length === 0 ? (
          <p className="info">아직 주문이 없습니다.</p>
        ) : (
          <ul className="order-list">
            {state.data.map((order) => (
              <OrderRow key={order.id} order={order} onCancel={handleCancel} />
            ))}
          </ul>
        )
      break
  }

  return (
    <section className="orders">
      <h2>
        주문 내역{' '}
        <button type="button" onClick={reload}>
          새로 고침
        </button>
      </h2>
      {cancelError !== '' && <p className="error">{cancelError}</p>}
      {content}
    </section>
  )
}

function OrderRow({ order, onCancel }: { order: Order; onCancel: (order: Order) => void }) {
  const summary = order.lines.map((line) => `${line.productName} ${line.quantity}개`).join(', ')
  return (
    <li className={`order status-${order.status}`}>
      <div>
        <strong>{order.id}</strong> <span className="badge">{STATUS_LABEL[order.status]}</span>{' '}
        <span className="time">{formatDateTime(order.createdAt)}</span>
      </div>
      <div>
        {summary} · {formatWon(order.totalAmount)}
      </div>
      {/* 판별 유니온 덕분에 cancelReason은 취소된 주문에서만 꺼낼 수 있습니다. */}
      {order.status === 'cancelled' && <div className="reason">취소 사유: {order.cancelReason}</div>}
      {order.status === 'received' && (
        <button type="button" onClick={() => onCancel(order)}>
          주문 취소
        </button>
      )}
    </li>
  )
}
```
:::

::: details src/App.tsx
```tsx
// 화면 전체 배치: 메뉴 | 장바구니, 그 아래 주문 내역
import { useState } from 'react'
import { Cart } from './components/Cart'
import { MenuList } from './components/MenuList'
import { OrderHistory } from './components/OrderHistory'

export function App() {
  // 주문할 때마다 숫자를 올려 OrderHistory를 새로 만들게(key 변경) 해서 목록을 다시 불러옵니다.
  const [historyKey, setHistoryKey] = useState(0)

  return (
    <main className="app">
      <h1>카페 주문</h1>
      <div className="columns">
        <section>
          <h2>메뉴</h2>
          <MenuList />
        </section>
        <Cart onOrdered={() => setHistoryKey((key) => key + 1)} />
      </div>
      <OrderHistory key={historyKey} />
    </main>
  )
}
```
:::

## 회고 질문

1. `isLoading`·`error`·`data` 세 변수 대신 `AsyncState<T>` 하나를 쓴 덕분에 사라진 버그는 무엇인가요?
2. 장바구니는 스토어에, 메뉴 목록은 컴포넌트 안에 둔 기준을 자기 말로 설명해 보세요.
3. 프로젝트 2에서 직접 만든 `render`와 React 컴포넌트는 무엇이 같고 무엇이 다른가요?
4. 화면의 `types.ts`가 서버와 어긋났다면 언제, 어떻게 알게 될까요? 이를 더 일찍 알아차리려면 어떻게 해야 할까요?
5. 네 프로젝트를 모두 마쳤습니다. 가장 도움이 된 타입 기법 하나를 고르고, 그 기법이 없었다면 어떤 실수를 했을지 적어 보세요.
