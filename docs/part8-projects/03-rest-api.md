---
title: "프로젝트 3: 주문 REST API 서버 (Express + zod + Vitest)"
---

# 프로젝트 3: 주문 REST API 서버 (Express + zod + Vitest)

<LessonMeta level="실전" :minutes="300" prev="프로젝트 2에서 상태 → 렌더 단방향 구조로 Todo 웹앱을 완성" />

세 번째 프로젝트는 카페 매장의 **주문 API 서버**입니다. 화면 없이 HTTP 요청을 받아 JSON으로 답하는 프로그램으로, 프로젝트 4의 React 앱이 이 서버를 그대로 사용합니다.

이번 프로젝트의 주제는 **"경계에서 검증하고, 안쪽은 타입을 믿는다"** 입니다. 바깥에서 들어오는 요청 본문은 무엇이 들어 있을지 모르므로 zod로 검사하고, 검사를 통과한 뒤로는 타입이 보장하는 대로 코드를 씁니다. 그리고 그 약속이 실제로 지켜지는지 Vitest 테스트로 확인합니다.

**API**(Application Programming Interface)는 프로그램끼리 대화하는 약속입니다. **REST API**는 그 약속을 "주소(URL) + HTTP 메서드(GET, POST 등)"로 표현하는 방식입니다. 예를 들어 `GET /api/products`는 "상품 목록을 주세요", `POST /api/orders`는 "주문을 새로 만들어 주세요"라는 뜻입니다.

## 완성하면 이렇게 됩니다

서버를 켭니다.

```text
$ npm run dev
주문 API 서버가 시작되었습니다: http://localhost:3000
```

다른 터미널에서 `curl`(명령줄에서 HTTP 요청을 보내는 도구)로 요청해 봅니다. 응답 JSON은 읽기 쉽게 줄바꿈했습니다.

```text
$ curl http://localhost:3000/api/products
[{"id":"P001","name":"아메리카노","category":"coffee","price":4500,"soldOut":false},
 {"id":"P002","name":"카페라테","category":"coffee","price":5000,"soldOut":false}, ... 7개]

$ curl -X POST http://localhost:3000/api/orders -H "Content-Type: application/json" \
    -d '{"items":[{"productId":"P001","quantity":2},{"productId":"P006","quantity":1}]}'
HTTP 201
{"id":"O-0001","status":"received",
 "lines":[{"productId":"P001","productName":"아메리카노","unitPrice":4500,"quantity":2,"lineAmount":9000},
          {"productId":"P006","productName":"치즈케이크","unitPrice":6500,"quantity":1,"lineAmount":6500}],
 "totalAmount":15500,"createdAt":"2026-10-26T04:46:47.454Z"}

$ curl -X POST http://localhost:3000/api/orders -H "Content-Type: application/json" \
    -d '{"items":[{"productId":"P001","quantity":"2"}]}'
HTTP 400
{"error":{"code":"VALIDATION_ERROR","message":"요청 값이 올바르지 않습니다.",
 "details":[{"path":"items.0.quantity","message":"Invalid input: expected number, received string"}]}}

$ curl -X POST http://localhost:3000/api/orders -H "Content-Type: application/json" \
    -d '{"items":[{"productId":"P007","quantity":1}]}'
HTTP 409
{"error":{"code":"SOLD_OUT","message":"품절된 상품입니다: 크루아상"}}

$ curl -X POST http://localhost:3000/api/orders/O-0001/complete
$ curl -X POST http://localhost:3000/api/orders/O-0001/cancel -H "Content-Type: application/json" -d '{"reason":"단순 변심"}'
HTTP 409
{"error":{"code":"INVALID_STATE","message":"제공 완료 상태의 주문은 취소할 수 없습니다."}}
```

테스트도 모두 통과합니다.

```text
$ npm test

 RUN  v5.0.5 .../03-rest-api

 Test Files  2 passed (2)
      Tests  16 passed (16)
```

## 요구사항

**API 목록**

```text
GET  /api/products               상품 목록
POST /api/orders                 주문 생성      본문: { items: [{ productId, quantity }] }
GET  /api/orders                 주문 목록 (최근 주문이 위)
GET  /api/orders/:id             주문 한 건
POST /api/orders/:id/cancel      주문 취소      본문: { reason }
POST /api/orders/:id/complete    제공 완료
```

**규칙**

1. **주문 생성**: 항목은 1~20개, 수량은 1~99의 정수입니다. 없는 상품은 400, 품절 상품은 409로 거부합니다. 주문 금액은 서버가 상품 가격으로 계산합니다(클라이언트가 보낸 금액은 믿지 않습니다).
2. **주문 상태**: 접수(`received`) → 제공 완료(`completed`) 또는 취소(`cancelled`). 접수 상태에서만 완료·취소할 수 있고, 그 외에는 409입니다.
3. **취소 사유**: 앞뒤 공백을 지운 뒤 1~100자여야 합니다.
4. **공통 에러 응답**: 모든 에러는 `{ "error": { "code", "message", "details"? } }` 모양입니다. 예상하지 못한 에러는 500으로 답하고 내부 내용은 숨깁니다.
5. **저장소**: 메모리에 저장합니다. 단, 저장소를 **인터페이스**로 감싸서 나중에 DB로 바꿔도 업무 코드는 고치지 않게 합니다.
6. **테스트**: 정상 흐름, 검증 실패, 품절, 없는 주문, 잘못된 상태 전이를 Vitest + supertest로 확인합니다.

## 필요한 지식

- Express 기초와 라우트 핸들러 타입: [Node.js + Express REST API를 TS로](../part7-practice/01-node-express)
- zod 스키마와 `z.infer`: [런타임 검증](../part4-async/05-runtime-validation)
- 판별 유니온: [판별 유니온과 완전성 검사](../part3-intermediate/03-discriminated-union)
- 인터섹션(`&`)으로 공통 속성 합치기: [인터섹션과 타입 합성](../part3-intermediate/01-intersection)
- 클래스와 `implements`: [클래스](../part3-intermediate/08-classes)
- `Record`, `ReturnType`: [내장 유틸리티 타입 총정리](../part3-intermediate/07-utility-types)
- `async/await`와 에러: [async/await와 비동기 오류 처리](../part4-async/03-async-await)
- Vitest: [Vitest로 테스트 작성하기](../part6-tooling/05-testing-vitest)
- 공통 에러 응답 설계: [API 클라이언트 타입 설계](../part7-practice/06-api-client)

## 설계하기

::: tip 먼저 스스로 해 보세요
"주문"을 타입으로 적어 보세요. 특히 **취소 사유는 어디에 둘지** 생각해 보세요. 모든 주문에 `cancelReason?: string`을 두는 방법과, 취소된 주문에만 두는 방법 중 어느 쪽이 실수를 더 잘 막을까요?
:::

### 주문 타입: 상태별로 다른 모양

```ts
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
```

모든 속성을 한 객체에 선택 속성으로 몰아넣는 방법도 있습니다.

```ts
// 나쁜 예: 상태와 속성이 따로 놉니다.
interface LooseOrder {
  status: 'received' | 'completed' | 'cancelled'
  completedAt?: string
  cancelledAt?: string
  cancelReason?: string
}
```

이렇게 하면 `{ status: 'received', cancelReason: '?' }`처럼 **있을 수 없는 상태**도 타입이 허락합니다. 판별 유니온으로 나누면 "취소된 주문에는 반드시 사유가 있고, 접수된 주문에는 사유가 없다"는 규칙이 타입에 새겨집니다. 이것을 흔히 "불가능한 상태를 표현할 수 없게 만든다"고 말합니다.

### 층 나누기

```text
요청 ─▶ app.ts (HTTP 층)
          │  ① parseBody(zod 스키마)로 본문 검증  ── 실패 → AppError(VALIDATION_ERROR)
          ▼
        order-service.ts (업무 층)
          │  ② 상품 조회, 품절 확인, 금액 계산      ── 실패 → AppError(SOLD_OUT ...)
          │  ③ order.ts의 상태 전이 함수 호출        ── 실패 → AppError(INVALID_STATE)
          ▼
        repository.ts (저장 층: 인터페이스 + 메모리 구현)

어디서 던진 AppError든 ─▶ errorHandler ─▶ { error: { code, message, details? } }
```

```text
src/
  types.ts          도메인 타입 (Product, OrderLine, Order)
  errors.ts         AppError, ErrorCode, ErrorBody (공통 에러 형식)
  order.ts          상태 전이 규칙 (순수 함수)
  schemas.ts        zod 스키마 + parseBody
  repository.ts     저장소 인터페이스 + 메모리 구현
  order-service.ts  업무 처리
  app.ts            Express 라우트 + 에러 미들웨어
  seed.ts           초기 상품 데이터
  server.ts         조립하고 서버 시작
test/
  order.test.ts     상태 전이 단위 테스트
  app.test.ts       HTTP 통합 테스트 (supertest)
```

`app.ts`가 서버를 **띄우지 않고** `app` 객체만 만들어 돌려주는 점이 중요합니다. 서버 시작(`listen`)은 `server.ts`가 합니다. 덕분에 테스트에서는 포트를 쓰지 않고 `app`에 바로 요청을 보낼 수 있습니다.

## 단계별 구현

### Step 1. 프로젝트 만들기

**목표**: Express·zod·Vitest를 설치합니다.

```bash
mkdir order-api
cd order-api
npm init -y
npm install express zod
npm install -D typescript@~5.9.3 tsx @types/node @types/express vitest supertest @types/supertest
mkdir src test
```

작성 시점(2026-10) 기준 설치된 버전은 express 5.3.0, zod 4.6.7, typescript 5.9.3, tsx 4.23.15, @types/node 24.19.2, @types/express 5.0.6, vitest 5.0.5, supertest 7.3.1, @types/supertest 7.2.1입니다.

::: warning 버전을 확인하세요
- `npm install -D typescript`만 쓰면 그때의 최신 메이저 버전이 설치됩니다. 이 위키는 TypeScript 5.x 기준이므로 `typescript@~5.9.3`처럼 버전을 고정했습니다.
- Express는 5부터 `async` 핸들러에서 던진 에러를 에러 미들웨어로 자동 전달합니다. Express 4라면 `try/catch`로 잡아 `next(error)`를 직접 불러야 합니다.
- zod 4의 기본 에러 메시지(`Invalid input: expected number, received string`)는 zod 3과 문구가 다릅니다.
:::

```json
{
  "name": "order-api",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "start": "tsx src/server.ts",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "express": "^5.3.0",
    "zod": "^4.6.7"
  },
  "devDependencies": {
    "@types/express": "^5.0.6",
    "@types/node": "^24.19.2",
    "@types/supertest": "^7.2.1",
    "supertest": "^7.3.1",
    "tsx": "^4.23.15",
    "typescript": "~5.9.3",
    "vitest": "^5.0.5"
  }
}
```

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022"],
    "types": ["node"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noEmit": true,
    "skipLibCheck": true,
    "verbatimModuleSyntax": true
  },
  "include": ["src", "test"]
}
```

```text
node_modules
dist
```

`tsconfig.json`은 프로젝트 1과 거의 같고, `include`에 `test` 폴더를 더했습니다. Vitest는 설정 파일 없이도 `test/*.test.ts`를 찾아 실행합니다.

**체크포인트**
- [ ] `npx tsc -v`가 `Version 5.9.3`을, `npx vitest --version`이 설치된 Vitest 버전을 출력한다.

### Step 2. 도메인 타입과 공통 에러

**목표**: 데이터 모양과 에러 모양을 먼저 정합니다.

```ts
// 주문 API의 도메인 타입을 한곳에 모읍니다.

export type ProductCategory = 'coffee' | 'tea' | 'dessert'

/** 매장에서 파는 상품 */
export interface Product {
  id: string
  name: string
  category: ProductCategory
  /** 판매가(원) */
  price: number
  soldOut: boolean
}

/** 주문 한 줄. 주문 시점의 상품명·가격을 복사해 둡니다(나중에 가격이 바뀌어도 주문 금액은 그대로). */
export interface OrderLine {
  productId: string
  productName: string
  unitPrice: number
  quantity: number
  lineAmount: number
}

/** 모든 주문 상태에 공통인 속성 */
interface OrderBase {
  id: string
  lines: OrderLine[]
  totalAmount: number
  createdAt: string
}

/**
 * 주문 (판별 유니온: status로 구분)
 * 상태마다 필요한 속성이 다릅니다. 예를 들어 cancelReason은 취소된 주문에만 있습니다.
 */
export type Order =
  | (OrderBase & { status: 'received' })
  | (OrderBase & { status: 'completed'; completedAt: string })
  | (OrderBase & { status: 'cancelled'; cancelledAt: string; cancelReason: string })

export type OrderStatus = Order['status']
```

`OrderLine`에 `productName`과 `unitPrice`를 **복사**해 두는 이유: 내일 아메리카노 가격이 오르더라도 오늘 주문의 금액은 바뀌면 안 되기 때문입니다. 주문은 "그 시점의 기록"입니다.

`OrderStatus = Order['status']`는 인덱스 접근 타입으로 `'received' | 'completed' | 'cancelled'`를 뽑아낸 것입니다. 상태를 추가하면 자동으로 따라 바뀝니다.

```ts
// 공통 에러 형식입니다. 어떤 에러든 클라이언트는 같은 모양의 JSON을 받습니다.

export type ErrorCode = 'VALIDATION_ERROR' | 'NOT_FOUND' | 'INVALID_STATE' | 'SOLD_OUT' | 'INTERNAL_ERROR'

/** 에러 코드별 HTTP 상태 코드. Record라서 코드를 추가하고 여기를 빠뜨리면 컴파일 에러가 납니다. */
const HTTP_STATUS: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 400,
  NOT_FOUND: 404,
  INVALID_STATE: 409,
  SOLD_OUT: 409,
  INTERNAL_ERROR: 500,
}

/** 요청 검증에서 걸린 항목 하나 */
export interface ValidationIssue {
  /** 문제가 있는 위치. 예: 'items.0.quantity' */
  path: string
  message: string
}

/** 에러 응답 본문 */
export interface ErrorBody {
  error: {
    code: ErrorCode
    message: string
    details?: ValidationIssue[]
  }
}

/** 업무 규칙 위반을 나타내는 에러. 에러 처리 미들웨어가 ErrorBody로 바꿔 응답합니다. */
export class AppError extends Error {
  readonly code: ErrorCode
  readonly details: ValidationIssue[] | undefined

  constructor(code: ErrorCode, message: string, details?: ValidationIssue[]) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.details = details
  }

  get status(): number {
    return HTTP_STATUS[this.code]
  }

  toBody(): ErrorBody {
    const body: ErrorBody = { error: { code: this.code, message: this.message } }
    if (this.details !== undefined) {
      body.error.details = this.details
    }
    return body
  }
}
```

- `HTTP_STATUS: Record<ErrorCode, number>`: 에러 코드를 새로 추가하고 상태 코드를 빠뜨리면 `Property 'NEW_CODE' is missing ...` 에러가 납니다. 빠짐없이 채우게 강제하는 장치입니다.
- `AppError`는 `Error`를 상속(extends)해서 `throw`할 수 있고, `instanceof AppError`로 구분할 수 있습니다.
- 생성자 매개변수에 `readonly`를 붙이는 축약 문법(매개변수 속성) 대신 속성을 따로 선언했습니다. 매개변수 속성은 "타입만 지우고 실행하는" 도구(Node.js의 타입 제거 실행 등)가 지원하지 않는 문법이라, 프로젝트 2의 `tsconfig.json`처럼 `erasableSyntaxOnly`(TypeScript 5.8부터)를 켜면 에러가 됩니다.

**체크포인트**
- [ ] `npx tsc --noEmit`이 통과한다.

### Step 3. 상태 전이 규칙

**목표**: "어떤 상태에서 어떤 상태로 갈 수 있는가"를 순수 함수로 만듭니다.

```ts
// 주문 상태 전이 규칙입니다. 저장소·HTTP를 모르는 순수 함수만 둡니다.
//   received(접수) ──▶ completed(제공 완료)
//        └──────────▶ cancelled(취소)
import { AppError } from './errors'
import type { Order, OrderLine, OrderStatus } from './types'

export const STATUS_LABEL: Record<OrderStatus, string> = {
  received: '접수',
  completed: '제공 완료',
  cancelled: '취소',
}

/** 주문 줄 목록으로 새 주문(접수 상태)을 만듭니다. */
export function newOrder(id: string, lines: OrderLine[], now: string): Order {
  const totalAmount = lines.reduce((sum, line) => sum + line.lineAmount, 0)
  return { id, status: 'received', lines, totalAmount, createdAt: now }
}

/** 접수 상태의 주문만 제공 완료로 바꿀 수 있습니다. */
export function completeOrder(order: Order, now: string): Order {
  if (order.status !== 'received') {
    throw new AppError('INVALID_STATE', `${STATUS_LABEL[order.status]} 상태의 주문은 완료할 수 없습니다.`)
  }
  // 여기서 order는 received 상태로 좁혀져 있습니다.
  return { ...order, status: 'completed', completedAt: now }
}

/** 접수 상태의 주문만 취소할 수 있습니다. */
export function cancelOrder(order: Order, reason: string, now: string): Order {
  if (order.status !== 'received') {
    throw new AppError('INVALID_STATE', `${STATUS_LABEL[order.status]} 상태의 주문은 취소할 수 없습니다.`)
  }
  return { ...order, status: 'cancelled', cancelledAt: now, cancelReason: reason }
}
```

`completeOrder`에서 `if (order.status !== 'received') throw ...` 다음 줄에서는 `order`가 `received` 상태로 **좁혀집니다**. 그래서 `{ ...order, status: 'completed', completedAt: now }`가 정확히 "완료된 주문" 모양이 됩니다.

좁히지 않고 스프레드하면 어떻게 될까요? 취소된 주문을 펼치면 `cancelReason`까지 딸려 와서 "취소 사유가 있는 완료 주문"이 만들어집니다. TypeScript는 스프레드로 생긴 남는 속성은 에러로 잡지 않으므로, **상태를 먼저 확인하고 바꾸는 것**이 중요합니다. 반대로 `completedAt`을 빠뜨리면 컴파일러가 바로 알려 줍니다.

```ts
export function complete(order: Order): Order {
  return { ...order, status: 'completed' }
}
// ❌ Type '{ status: "completed"; id: string; ... }' is not assignable to type 'Order'. (TS2322)
//    Property 'completedAt' is missing in type '...' but required in type '{ status: "completed"; completedAt: string; }'.
```

**실행 확인**: 단위 테스트를 만들어 돌립니다.

```ts
// 상태 전이 규칙(순수 함수) 단위 테스트입니다. HTTP 없이 함수만 부릅니다.
import { describe, expect, it } from 'vitest'
import { AppError } from '../src/errors'
import { cancelOrder, completeOrder, newOrder } from '../src/order'

const line = { productId: 'P002', productName: '카페라테', unitPrice: 5000, quantity: 3, lineAmount: 15000 }

describe('order 상태 전이', () => {
  it('새 주문은 접수 상태이고 합계를 계산한다', () => {
    const order = newOrder('O-0001', [line, { ...line, quantity: 1, lineAmount: 5000 }], 'T1')
    expect(order.status).toBe('received')
    expect(order.totalAmount).toBe(20000)
  })

  it('접수 → 완료', () => {
    const done = completeOrder(newOrder('O-0001', [line], 'T1'), 'T2')
    expect(done).toMatchObject({ status: 'completed', completedAt: 'T2' })
  })

  it('취소된 주문은 완료할 수 없다', () => {
    const cancelled = cancelOrder(newOrder('O-0001', [line], 'T1'), '재고 없음', 'T2')
    expect(() => completeOrder(cancelled, 'T3')).toThrow(AppError)
    expect(() => completeOrder(cancelled, 'T3')).toThrow('취소 상태의 주문은 완료할 수 없습니다.')
  })
})
```

```bash
npx vitest run test/order.test.ts
```

```text
 Test Files  1 passed (1)
      Tests  3 passed (3)
```

**체크포인트**
- [ ] 세 테스트가 통과한다.
- [ ] `STATUS_LABEL`에서 한 상태를 지우면 컴파일 에러가 난다.

### Step 4. 요청 검증 스키마

**목표**: 요청 본문을 zod로 검사하고, 실패하면 공통 형식의 에러를 던집니다.

```ts
// 요청 본문 검증 스키마입니다. 타입은 스키마에서 뽑아 써서 둘이 어긋나지 않게 합니다.
import { z } from 'zod'
import { AppError } from './errors'

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1, '상품 id가 필요합니다.'),
        quantity: z.number().int('수량은 정수여야 합니다.').min(1, '수량은 1 이상이어야 합니다.').max(99, '수량은 99 이하여야 합니다.'),
      }),
    )
    .min(1, '주문 항목이 1개 이상 있어야 합니다.')
    .max(20, '주문 항목은 20개까지입니다.'),
})

export const cancelOrderSchema = z.object({
  reason: z.string().trim().min(1, '취소 사유를 입력해 주세요.').max(100, '취소 사유는 100자 이하입니다.'),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>

/** 스키마로 검사하고, 실패하면 VALIDATION_ERROR를 던집니다. 성공하면 타입이 붙은 값을 돌려줍니다. */
export function parseBody<T>(schema: z.ZodType<T>, body: unknown): T {
  const result = schema.safeParse(body)
  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }))
    throw new AppError('VALIDATION_ERROR', '요청 값이 올바르지 않습니다.', details)
  }
  return result.data
}
```

- `z.infer<typeof createOrderSchema>`로 타입을 뽑아 씁니다. 스키마와 타입을 따로 적으면 한쪽만 고치는 실수가 생깁니다.
- `parseBody<T>(schema: z.ZodType<T>, body: unknown): T`: 스키마를 넘기면 반환 타입이 그 스키마의 결과 타입으로 정해지는 **제네릭 함수**입니다. `parseBody(createOrderSchema, req.body)`의 결과는 `{ items: { productId: string; quantity: number }[] }`입니다.
- `safeParse`는 에러를 던지지 않고 `{ success: true, data }` 또는 `{ success: false, error }`를 돌려줍니다. 이것도 판별 유니온입니다.
- `issue.path`는 `['items', 0, 'quantity']` 같은 배열이라 `join('.')`으로 `'items.0.quantity'`를 만듭니다. 클라이언트는 이 값으로 "어느 칸이 틀렸는지" 표시할 수 있습니다.
- `z.string().trim()`은 검사 전에 앞뒤 공백을 지웁니다. `'   '`은 빈 문자열이 되어 `min(1)`에 걸립니다.

**체크포인트**
- [ ] `CreateOrderInput`에 마우스를 올리면 `items` 배열 타입이 보인다.

### Step 5. 저장소 인터페이스와 메모리 구현

**목표**: 데이터를 어디에 저장하는지 숨깁니다.

```ts
// 저장소(repository): 데이터를 어디에 두는지 숨기는 층입니다.
// 서비스는 인터페이스만 알기 때문에, 나중에 DB 구현으로 바꿔도 서비스 코드는 그대로입니다.
import type { Order, Product } from './types'

export interface ProductRepository {
  findAll(): Promise<Product[]>
  findById(id: string): Promise<Product | undefined>
}

export interface OrderRepository {
  findAll(): Promise<Order[]>
  findById(id: string): Promise<Order | undefined>
  /** 같은 id가 있으면 덮어씁니다. */
  save(order: Order): Promise<void>
}

/** 메모리(Map)에 상품을 두는 구현. 서버를 끄면 사라집니다. */
export class InMemoryProductRepository implements ProductRepository {
  private readonly products = new Map<string, Product>()

  constructor(products: Product[]) {
    for (const product of products) {
      this.products.set(product.id, product)
    }
  }

  async findAll(): Promise<Product[]> {
    return [...this.products.values()]
  }

  async findById(id: string): Promise<Product | undefined> {
    return this.products.get(id)
  }
}

export class InMemoryOrderRepository implements OrderRepository {
  private readonly orders = new Map<string, Order>()

  async findAll(): Promise<Order[]> {
    // 최근 주문이 위로 오도록 만든 시각의 역순으로 돌려줍니다.
    return [...this.orders.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id))
  }

  async findById(id: string): Promise<Order | undefined> {
    return this.orders.get(id)
  }

  async save(order: Order): Promise<void> {
    this.orders.set(order.id, order)
  }
}
```

- 메서드가 모두 `Promise`를 돌려주는 이유: 메모리 구현은 즉시 끝나지만, 나중에 DB 구현으로 바꾸면 반드시 비동기가 됩니다. 인터페이스를 처음부터 비동기로 정해 두면 서비스 코드를 고치지 않아도 됩니다.
- `implements ProductRepository`: 클래스가 인터페이스의 메서드를 빠짐없이, 맞는 타입으로 구현했는지 컴파일러가 검사합니다.
- `findById`가 `Product | undefined`를 돌려주므로 호출하는 쪽은 "없는 경우"를 처리해야 합니다.

**체크포인트**
- [ ] `InMemoryOrderRepository`에서 `save`를 지우면 `Class 'InMemoryOrderRepository' incorrectly implements interface 'OrderRepository'.` 에러(TS2420)가 난다.

### Step 6. 서비스

**목표**: 주문 생성·조회·취소·완료 업무를 만듭니다.

```ts
// 주문 업무 처리(서비스)입니다. HTTP(요청·응답)는 모르고, 저장소와 상태 전이 규칙만 씁니다.
import { AppError } from './errors'
import { cancelOrder, completeOrder, newOrder } from './order'
import type { OrderRepository, ProductRepository } from './repository'
import type { CancelOrderInput, CreateOrderInput } from './schemas'
import type { Order, OrderLine, Product } from './types'

/** 서비스가 바깥에서 받아 쓰는 것들. 테스트에서는 시계와 id를 고정값으로 바꿔 끼웁니다. */
export interface ServiceDeps {
  products: ProductRepository
  orders: OrderRepository
  newOrderId: () => string
  now: () => string
}

/** 'O-0001', 'O-0002'처럼 차례로 id를 만드는 함수를 돌려줍니다. */
export function sequentialId(prefix: string): () => string {
  let next = 1
  return () => `${prefix}-${String(next++).padStart(4, '0')}`
}

export function createOrderService(deps: ServiceDeps) {
  async function findOrder(id: string): Promise<Order> {
    const order = await deps.orders.findById(id)
    if (order === undefined) {
      throw new AppError('NOT_FOUND', `주문을 찾을 수 없습니다: ${id}`)
    }
    return order
  }

  return {
    listProducts(): Promise<Product[]> {
      return deps.products.findAll()
    },

    async createOrder(input: CreateOrderInput): Promise<Order> {
      const lines: OrderLine[] = []
      for (const [index, item] of input.items.entries()) {
        const product = await deps.products.findById(item.productId)
        if (product === undefined) {
          throw new AppError('VALIDATION_ERROR', '요청 값이 올바르지 않습니다.', [
            { path: `items.${index}.productId`, message: `없는 상품입니다: ${item.productId}` },
          ])
        }
        if (product.soldOut) {
          throw new AppError('SOLD_OUT', `품절된 상품입니다: ${product.name}`)
        }
        lines.push({
          productId: product.id,
          productName: product.name,
          unitPrice: product.price,
          quantity: item.quantity,
          lineAmount: product.price * item.quantity,
        })
      }
      const order = newOrder(deps.newOrderId(), lines, deps.now())
      await deps.orders.save(order)
      return order
    },

    listOrders(): Promise<Order[]> {
      return deps.orders.findAll()
    },

    getOrder(id: string): Promise<Order> {
      return findOrder(id)
    },

    async cancelOrder(id: string, input: CancelOrderInput): Promise<Order> {
      const cancelled = cancelOrder(await findOrder(id), input.reason, deps.now())
      await deps.orders.save(cancelled)
      return cancelled
    },

    async completeOrder(id: string): Promise<Order> {
      const completed = completeOrder(await findOrder(id), deps.now())
      await deps.orders.save(completed)
      return completed
    },
  }
}

/** 반환 타입을 직접 쓰지 않고 함수에서 뽑아냅니다. */
export type OrderService = ReturnType<typeof createOrderService>
```

- `ServiceDeps`로 **의존성 주입**(dependency injection, 필요한 것을 안에서 만들지 않고 바깥에서 받아 쓰는 방식)을 했습니다. 테스트에서는 `now`를 고정 시각으로 바꿔 끼워 결과를 예측할 수 있게 합니다.
- `sequentialId`는 클로저로 `next` 값을 기억합니다([스코프와 클로저](../part1-basics/10-scope-closure)).
- `createOrderService`의 반환 타입을 직접 쓰지 않고 `ReturnType<typeof createOrderService>`로 뽑아 `OrderService`라고 이름 붙였습니다. 메서드를 추가하면 타입도 저절로 따라옵니다.
- `input.items.entries()`는 `[번호, 값]` 쌍을 돌려줍니다. 에러 상세의 `items.0.productId` 경로를 만들 때 번호가 필요합니다.

**체크포인트**
- [ ] `npx tsc --noEmit`이 통과한다.

### Step 7. Express 앱과 에러 미들웨어

**목표**: HTTP 요청을 서비스로 연결하고, 모든 에러를 한곳에서 공통 형식으로 바꿉니다.

```ts
// HTTP 층: 경로(route)를 정의하고, 요청 → 검증 → 서비스 호출 → 응답을 연결합니다.
import express, { type ErrorRequestHandler, type Express } from 'express'
import { AppError } from './errors'
import type { OrderService } from './order-service'
import { cancelOrderSchema, createOrderSchema, parseBody } from './schemas'

export function createApp(service: OrderService): Express {
  const app = express()
  // 요청 본문의 JSON을 req.body로 읽어 줍니다.
  app.use(express.json())

  // 상품 목록
  app.get('/api/products', async (_req, res) => {
    res.json(await service.listProducts())
  })

  // 주문 생성
  app.post('/api/orders', async (req, res) => {
    // req.body는 any입니다. 검사를 통과한 input부터 타입을 믿을 수 있습니다.
    const input = parseBody(createOrderSchema, req.body)
    const order = await service.createOrder(input)
    res.status(201).json(order)
  })

  // 주문 목록
  app.get('/api/orders', async (_req, res) => {
    res.json(await service.listOrders())
  })

  // 주문 한 건 조회
  app.get('/api/orders/:id', async (req, res) => {
    res.json(await service.getOrder(req.params.id))
  })

  // 주문 취소
  app.post('/api/orders/:id/cancel', async (req, res) => {
    const input = parseBody(cancelOrderSchema, req.body)
    res.json(await service.cancelOrder(req.params.id, input))
  })

  // 제공 완료
  app.post('/api/orders/:id/complete', async (req, res) => {
    res.json(await service.completeOrder(req.params.id))
  })

  // 위의 어떤 경로에도 맞지 않는 요청
  app.use((req, res) => {
    const error = new AppError('NOT_FOUND', `없는 경로입니다: ${req.method} ${req.path}`)
    res.status(error.status).json(error.toBody())
  })

  app.use(errorHandler)
  return app
}

/**
 * 공통 에러 처리. Express 5는 async 핸들러에서 던진 에러도 여기로 보내 줍니다.
 * 매개변수가 4개여야 Express가 에러 처리 미들웨어로 인식합니다.
 */
const errorHandler: ErrorRequestHandler = (err: unknown, _req, res, _next) => {
  let error: AppError
  if (err instanceof AppError) {
    error = err
  } else if (err instanceof SyntaxError && 'status' in err && err.status === 400) {
    // express.json()이 JSON 문법 오류를 만났을 때
    error = new AppError('VALIDATION_ERROR', '요청 본문이 올바른 JSON이 아닙니다.')
  } else {
    // 예상하지 못한 에러: 자세한 내용은 서버 로그에만 남기고, 클라이언트에는 숨깁니다.
    console.error(err)
    error = new AppError('INTERNAL_ERROR', '서버 오류가 발생했습니다.')
  }
  res.status(error.status).json(error.toBody())
}
```

- **라우트 핸들러는 얇게**: 본문 검증 → 서비스 호출 → 응답, 세 줄을 넘지 않습니다. 업무 규칙은 서비스와 `order.ts`에 있습니다.
- `req.body`의 타입은 `any`입니다. `parseBody`를 거친 `input`부터 믿을 수 있는 타입이 됩니다. `req.body.items`를 직접 쓰지 마세요.
- `req.params.id`는 경로의 `:id` 부분으로, 타입은 `string`입니다.
- **에러 미들웨어는 매개변수 4개**가 필요합니다. `_next`를 쓰지 않더라도 지우면 Express가 일반 미들웨어로 착각합니다. 쓰지 않는 매개변수는 이름 앞에 `_`를 붙여 표시했습니다.
- `ErrorRequestHandler` 타입을 붙이면 `req`, `res`, `next`의 타입이 자동으로 정해집니다. `err`는 무엇이든 될 수 있으므로 `unknown`으로 받아 좁힙니다.
- 예상하지 못한 에러의 메시지를 그대로 응답하면 DB 주소나 내부 구조 같은 정보가 새어 나갈 수 있습니다. 그래서 로그에만 남기고 클라이언트에는 "서버 오류"라고만 답합니다.

```ts
// 서버를 켤 때 넣어 두는 상품 데이터입니다.
import type { Product } from './types'

export const SEED_PRODUCTS: Product[] = [
  { id: 'P001', name: '아메리카노', category: 'coffee', price: 4500, soldOut: false },
  { id: 'P002', name: '카페라테', category: 'coffee', price: 5000, soldOut: false },
  { id: 'P003', name: '바닐라라테', category: 'coffee', price: 5500, soldOut: false },
  { id: 'P004', name: '얼그레이', category: 'tea', price: 4800, soldOut: false },
  { id: 'P005', name: '캐모마일', category: 'tea', price: 4800, soldOut: false },
  { id: 'P006', name: '치즈케이크', category: 'dessert', price: 6500, soldOut: false },
  { id: 'P007', name: '크루아상', category: 'dessert', price: 3800, soldOut: true },
]
```

```ts
// 서버 시작점: 실제 의존성(메모리 저장소, 실제 시계)을 조립해 서버를 띄웁니다.
import { createApp } from './app'
import { createOrderService, sequentialId } from './order-service'
import { InMemoryOrderRepository, InMemoryProductRepository } from './repository'
import { SEED_PRODUCTS } from './seed'

const port = Number(process.env.PORT ?? 3000)

const service = createOrderService({
  products: new InMemoryProductRepository(SEED_PRODUCTS),
  orders: new InMemoryOrderRepository(),
  newOrderId: sequentialId('O'),
  now: () => new Date().toISOString(),
})

createApp(service).listen(port, () => {
  console.log(`주문 API 서버가 시작되었습니다: http://localhost:${port}`)
})
```

`server.ts`는 실제 부품(메모리 저장소, 진짜 시계, 순번 id)을 조립하는 곳입니다. 테스트는 이 파일을 쓰지 않고 자기만의 부품으로 조립합니다.

**실행 확인**: `npm run dev`로 서버를 켜고 [완성하면 이렇게 됩니다](#완성하면-이렇게-됩니다)의 `curl` 명령을 실행해 봅니다. `tsx watch`는 파일을 저장할 때마다 서버를 다시 시작합니다(메모리 저장소라 주문도 사라집니다). 끝낼 때는 `Ctrl+C`를 누릅니다.

**체크포인트**
- [ ] 주문 생성 응답이 201이고 `totalAmount`가 맞다.
- [ ] 잘못된 요청에도 서버가 죽지 않고 공통 에러 형식으로 답한다.

### Step 8. HTTP 통합 테스트

**목표**: 요구사항 하나하나를 테스트로 확인합니다.

```ts
// HTTP 요청을 실제로 보내 API 전체를 확인하는 테스트입니다.
// supertest는 서버를 포트에 띄우지 않고도 app에 요청을 보낼 수 있게 해 줍니다.
import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app'
import type { ErrorBody } from '../src/errors'
import { createOrderService, sequentialId } from '../src/order-service'
import { InMemoryOrderRepository, InMemoryProductRepository } from '../src/repository'
import { SEED_PRODUCTS } from '../src/seed'
import type { Express } from 'express'
import type { Order } from '../src/types'

const NOW = '2026-10-26T09:00:00.000Z'

let app: Express

// 테스트마다 새 저장소로 app을 만들어, 앞 테스트의 주문이 섞이지 않게 합니다.
beforeEach(() => {
  const service = createOrderService({
    products: new InMemoryProductRepository(SEED_PRODUCTS),
    orders: new InMemoryOrderRepository(),
    newOrderId: sequentialId('O'),
    now: () => NOW,
  })
  app = createApp(service)
})

/** 아메리카노 2잔 + 치즈케이크 1개 주문을 만들고 응답 본문을 돌려줍니다. */
async function placeOrder(): Promise<Order> {
  const res = await request(app)
    .post('/api/orders')
    .send({ items: [{ productId: 'P001', quantity: 2 }, { productId: 'P006', quantity: 1 }] })
  expect(res.status).toBe(201)
  return res.body as Order
}

describe('GET /api/products', () => {
  it('상품 목록을 돌려준다', async () => {
    const res = await request(app).get('/api/products')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(7)
    expect(res.body[0]).toEqual({ id: 'P001', name: '아메리카노', category: 'coffee', price: 4500, soldOut: false })
  })
})

describe('POST /api/orders', () => {
  it('주문을 만들고 금액을 계산한다', async () => {
    const order = await placeOrder()
    expect(order).toEqual({
      id: 'O-0001',
      status: 'received',
      lines: [
        { productId: 'P001', productName: '아메리카노', unitPrice: 4500, quantity: 2, lineAmount: 9000 },
        { productId: 'P006', productName: '치즈케이크', unitPrice: 6500, quantity: 1, lineAmount: 6500 },
      ],
      totalAmount: 15500,
      createdAt: NOW,
    })
  })

  it('수량이 0이면 400과 검증 상세를 돌려준다', async () => {
    const res = await request(app).post('/api/orders').send({ items: [{ productId: 'P001', quantity: 0 }] })
    expect(res.status).toBe(400)
    const body = res.body as ErrorBody
    expect(body.error.code).toBe('VALIDATION_ERROR')
    expect(body.error.details).toEqual([{ path: 'items.0.quantity', message: '수량은 1 이상이어야 합니다.' }])
  })

  it('주문 항목이 비어 있으면 400', async () => {
    const res = await request(app).post('/api/orders').send({ items: [] })
    expect(res.status).toBe(400)
    expect((res.body as ErrorBody).error.details).toEqual([{ path: 'items', message: '주문 항목이 1개 이상 있어야 합니다.' }])
  })

  it('없는 상품이면 400', async () => {
    const res = await request(app).post('/api/orders').send({ items: [{ productId: 'P999', quantity: 1 }] })
    expect(res.status).toBe(400)
    expect((res.body as ErrorBody).error.details).toEqual([{ path: 'items.0.productId', message: '없는 상품입니다: P999' }])
  })

  it('품절 상품이면 409 SOLD_OUT', async () => {
    const res = await request(app).post('/api/orders').send({ items: [{ productId: 'P007', quantity: 1 }] })
    expect(res.status).toBe(409)
    expect((res.body as ErrorBody).error).toEqual({ code: 'SOLD_OUT', message: '품절된 상품입니다: 크루아상' })
  })

  it('JSON 문법이 틀리면 400', async () => {
    const res = await request(app).post('/api/orders').set('Content-Type', 'application/json').send('{"items": [')
    expect(res.status).toBe(400)
    expect((res.body as ErrorBody).error.code).toBe('VALIDATION_ERROR')
  })
})

describe('주문 조회', () => {
  it('목록과 한 건 조회', async () => {
    const order = await placeOrder()
    const list = await request(app).get('/api/orders')
    expect(list.body).toEqual([order])

    const one = await request(app).get(`/api/orders/${order.id}`)
    expect(one.status).toBe(200)
    expect(one.body).toEqual(order)
  })

  it('없는 주문이면 404', async () => {
    const res = await request(app).get('/api/orders/O-9999')
    expect(res.status).toBe(404)
    expect((res.body as ErrorBody).error).toEqual({ code: 'NOT_FOUND', message: '주문을 찾을 수 없습니다: O-9999' })
  })
})

describe('주문 상태 전이', () => {
  it('접수된 주문을 취소한다', async () => {
    const order = await placeOrder()
    const res = await request(app).post(`/api/orders/${order.id}/cancel`).send({ reason: '  고객 요청  ' })
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ status: 'cancelled', cancelReason: '고객 요청', cancelledAt: NOW })
  })

  it('취소 사유가 없으면 400', async () => {
    const order = await placeOrder()
    const res = await request(app).post(`/api/orders/${order.id}/cancel`).send({})
    expect(res.status).toBe(400)
  })

  it('제공 완료된 주문은 취소할 수 없다 (409)', async () => {
    const order = await placeOrder()
    await request(app).post(`/api/orders/${order.id}/complete`).expect(200)
    const res = await request(app).post(`/api/orders/${order.id}/cancel`).send({ reason: '단순 변심' })
    expect(res.status).toBe(409)
    expect((res.body as ErrorBody).error).toEqual({
      code: 'INVALID_STATE',
      message: '제공 완료 상태의 주문은 취소할 수 없습니다.',
    })
  })
})

it('없는 경로는 404', async () => {
  const res = await request(app).get('/api/unknown')
  expect(res.status).toBe(404)
  expect((res.body as ErrorBody).error.code).toBe('NOT_FOUND')
})
```

- `beforeEach`에서 테스트마다 새 저장소로 `app`을 만듭니다. 테스트끼리 데이터를 공유하면 실행 순서에 따라 결과가 달라집니다.
- `request(app).post(...).send({...})`는 JSON 본문을 보내고 응답을 기다립니다. 포트를 열지 않으므로 서버를 따로 켤 필요가 없습니다.
- `res.body`는 `any`입니다. 테스트에서 `as Order`, `as ErrorBody`로 단언한 것은 "이 모양이어야 한다"는 기대를 적은 것이고, 실제 확인은 바로 아래 `expect`가 합니다.
- `toEqual`은 객체 전체가 같은지, `toMatchObject`는 적은 속성만 같은지 봅니다.

```bash
npm test
```

```text
 Test Files  2 passed (2)
      Tests  16 passed (16)
```

**체크포인트**
- [ ] 16개 테스트가 모두 통과한다.
- [ ] `order.ts`에서 취소 조건을 일부러 지우면 "제공 완료된 주문은 취소할 수 없다" 테스트가 실패한다.

## 자주 막히는 곳

**1. 취소된 주문의 `cancelReason`을 읽을 수 없습니다.**

```ts
function reasonOf(order: Order): string {
  return order.cancelReason
}
// ❌ Property 'cancelReason' does not exist on type 'Order'. (TS2339)
//    Property 'cancelReason' does not exist on type 'OrderBase & { status: "received"; }'.
```

판별 유니온에서는 모든 모양에 공통인 속성만 바로 읽을 수 있습니다. `if (order.status === 'cancelled')`로 좁힌 뒤 읽습니다.

**2. `req.body`를 그대로 서비스에 넘겼는데 에러가 안 납니다.**

`req.body`가 `any`라서 컴파일러가 아무 검사도 하지 않습니다. 수량에 문자열 `"2"`가 들어오면 `4500 * "2"`가 `9000`이 되어 우연히 맞기도 하고, `"abc"`면 `NaN`이 저장됩니다. **반드시** `parseBody`를 거칩니다.

**3. 에러가 났는데 응답이 HTML이거나 요청이 끝나지 않습니다.**

- 에러 미들웨어의 매개변수를 3개로 쓰면 Express가 에러 처리기로 인식하지 않아 기본 HTML 에러 페이지가 나옵니다.
- 에러 미들웨어는 **모든 라우트 뒤에** 등록해야 합니다.
- Express 4를 쓰고 있다면 `async` 핸들러의 에러가 전달되지 않아 요청이 멈춥니다. `package.json`에서 express 버전을 확인하세요.

**4. Windows에서 `curl`로 한글을 보내면 깨집니다.**

Git Bash나 명령 프롬프트가 한글을 UTF-8이 아닌 인코딩으로 보내는 경우입니다. 본문을 UTF-8 파일로 저장해 `curl ... --data-binary @cancel.json`처럼 보내거나, VS Code의 REST Client 확장, Postman 같은 도구를 씁니다. PowerShell에서는 `curl`이 `Invoke-WebRequest`의 별칭일 수 있으니 `curl.exe`로 부릅니다.

**5. 테스트가 혼자 돌릴 때는 통과하는데 같이 돌리면 실패합니다.**

저장소를 파일 맨 위에서 한 번만 만들어 테스트끼리 공유했기 때문입니다. `beforeEach`에서 새로 만드세요. 시각(`new Date()`)을 쓰는 코드는 `now`를 주입받아 테스트에서 고정합니다.

**6. `EADDRINUSE: address already in use :::3000`**

이미 3000번 포트를 쓰는 프로그램(앞서 켜 둔 서버 등)이 있습니다. 그 터미널에서 `Ctrl+C`로 끄거나, `PORT=3001 npm run dev`처럼 다른 포트를 씁니다(PowerShell은 `$env:PORT=3001; npm run dev`).

## 도전 과제

1. ⭐ `GET /api/orders?status=received`처럼 상태로 주문을 거르는 기능을 추가하세요. 쿼리 값도 zod(`z.enum(['received', 'completed', 'cancelled'])`)로 검사합니다.
2. ⭐ 같은 상품이 두 줄로 들어오면(`P001` 2개 + `P001` 1개) 한 줄로 합치거나 400으로 거부하세요. zod의 `.refine`이나 `.superRefine`을 써 보세요.
3. ⭐⭐ 상태 `preparing`(제조 중)을 추가해 `received → preparing → completed` 흐름을 만드세요. `STATUS_LABEL`의 `Record`가 어디를 고쳐야 하는지 알려 줄 것입니다. 제조 중인 주문의 취소는 허용할지도 정해 보세요.
4. ⭐⭐ 주문 목록에 페이지 나누기(`?page=1&size=20`)를 넣고 응답을 `{ items, page, size, total }` 모양으로 바꾸세요. 응답 타입을 제네릭 `Page<T>`로 정의해 봅니다.
5. ⭐⭐⭐ `OrderRepository`를 JSON 파일에 저장하는 `FileOrderRepository`로 구현해 끼워 보세요. 서비스와 테스트 코드를 하나도 고치지 않아도 되는지 확인합니다.

## 완성 코드

전체 코드는 위키 저장소의 `examples/projects/03-rest-api/` 폴더에 있습니다.

```bash
cd examples/projects/03-rest-api
npm install
npm run typecheck   # 타입 검사 (0 에러)
npm test            # 테스트 16개
npm run dev         # http://localhost:3000 (끝낼 때 Ctrl+C)
```

아래는 핵심 파일입니다. `repository.ts`, `seed.ts`, `server.ts`와 테스트 파일은 단계별 구현에 전체가 있습니다.

::: details src/types.ts
```ts
// 주문 API의 도메인 타입을 한곳에 모읍니다.

export type ProductCategory = 'coffee' | 'tea' | 'dessert'

/** 매장에서 파는 상품 */
export interface Product {
  id: string
  name: string
  category: ProductCategory
  /** 판매가(원) */
  price: number
  soldOut: boolean
}

/** 주문 한 줄. 주문 시점의 상품명·가격을 복사해 둡니다(나중에 가격이 바뀌어도 주문 금액은 그대로). */
export interface OrderLine {
  productId: string
  productName: string
  unitPrice: number
  quantity: number
  lineAmount: number
}

/** 모든 주문 상태에 공통인 속성 */
interface OrderBase {
  id: string
  lines: OrderLine[]
  totalAmount: number
  createdAt: string
}

/**
 * 주문 (판별 유니온: status로 구분)
 * 상태마다 필요한 속성이 다릅니다. 예를 들어 cancelReason은 취소된 주문에만 있습니다.
 */
export type Order =
  | (OrderBase & { status: 'received' })
  | (OrderBase & { status: 'completed'; completedAt: string })
  | (OrderBase & { status: 'cancelled'; cancelledAt: string; cancelReason: string })

export type OrderStatus = Order['status']
```
:::

::: details src/errors.ts
```ts
// 공통 에러 형식입니다. 어떤 에러든 클라이언트는 같은 모양의 JSON을 받습니다.

export type ErrorCode = 'VALIDATION_ERROR' | 'NOT_FOUND' | 'INVALID_STATE' | 'SOLD_OUT' | 'INTERNAL_ERROR'

/** 에러 코드별 HTTP 상태 코드. Record라서 코드를 추가하고 여기를 빠뜨리면 컴파일 에러가 납니다. */
const HTTP_STATUS: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 400,
  NOT_FOUND: 404,
  INVALID_STATE: 409,
  SOLD_OUT: 409,
  INTERNAL_ERROR: 500,
}

/** 요청 검증에서 걸린 항목 하나 */
export interface ValidationIssue {
  /** 문제가 있는 위치. 예: 'items.0.quantity' */
  path: string
  message: string
}

/** 에러 응답 본문 */
export interface ErrorBody {
  error: {
    code: ErrorCode
    message: string
    details?: ValidationIssue[]
  }
}

/** 업무 규칙 위반을 나타내는 에러. 에러 처리 미들웨어가 ErrorBody로 바꿔 응답합니다. */
export class AppError extends Error {
  readonly code: ErrorCode
  readonly details: ValidationIssue[] | undefined

  constructor(code: ErrorCode, message: string, details?: ValidationIssue[]) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.details = details
  }

  get status(): number {
    return HTTP_STATUS[this.code]
  }

  toBody(): ErrorBody {
    const body: ErrorBody = { error: { code: this.code, message: this.message } }
    if (this.details !== undefined) {
      body.error.details = this.details
    }
    return body
  }
}
```
:::

::: details src/order.ts
```ts
// 주문 상태 전이 규칙입니다. 저장소·HTTP를 모르는 순수 함수만 둡니다.
//   received(접수) ──▶ completed(제공 완료)
//        └──────────▶ cancelled(취소)
import { AppError } from './errors'
import type { Order, OrderLine, OrderStatus } from './types'

export const STATUS_LABEL: Record<OrderStatus, string> = {
  received: '접수',
  completed: '제공 완료',
  cancelled: '취소',
}

/** 주문 줄 목록으로 새 주문(접수 상태)을 만듭니다. */
export function newOrder(id: string, lines: OrderLine[], now: string): Order {
  const totalAmount = lines.reduce((sum, line) => sum + line.lineAmount, 0)
  return { id, status: 'received', lines, totalAmount, createdAt: now }
}

/** 접수 상태의 주문만 제공 완료로 바꿀 수 있습니다. */
export function completeOrder(order: Order, now: string): Order {
  if (order.status !== 'received') {
    throw new AppError('INVALID_STATE', `${STATUS_LABEL[order.status]} 상태의 주문은 완료할 수 없습니다.`)
  }
  // 여기서 order는 received 상태로 좁혀져 있습니다.
  return { ...order, status: 'completed', completedAt: now }
}

/** 접수 상태의 주문만 취소할 수 있습니다. */
export function cancelOrder(order: Order, reason: string, now: string): Order {
  if (order.status !== 'received') {
    throw new AppError('INVALID_STATE', `${STATUS_LABEL[order.status]} 상태의 주문은 취소할 수 없습니다.`)
  }
  return { ...order, status: 'cancelled', cancelledAt: now, cancelReason: reason }
}
```
:::

::: details src/schemas.ts
```ts
// 요청 본문 검증 스키마입니다. 타입은 스키마에서 뽑아 써서 둘이 어긋나지 않게 합니다.
import { z } from 'zod'
import { AppError } from './errors'

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1, '상품 id가 필요합니다.'),
        quantity: z.number().int('수량은 정수여야 합니다.').min(1, '수량은 1 이상이어야 합니다.').max(99, '수량은 99 이하여야 합니다.'),
      }),
    )
    .min(1, '주문 항목이 1개 이상 있어야 합니다.')
    .max(20, '주문 항목은 20개까지입니다.'),
})

export const cancelOrderSchema = z.object({
  reason: z.string().trim().min(1, '취소 사유를 입력해 주세요.').max(100, '취소 사유는 100자 이하입니다.'),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>

/** 스키마로 검사하고, 실패하면 VALIDATION_ERROR를 던집니다. 성공하면 타입이 붙은 값을 돌려줍니다. */
export function parseBody<T>(schema: z.ZodType<T>, body: unknown): T {
  const result = schema.safeParse(body)
  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }))
    throw new AppError('VALIDATION_ERROR', '요청 값이 올바르지 않습니다.', details)
  }
  return result.data
}
```
:::

::: details src/order-service.ts
```ts
// 주문 업무 처리(서비스)입니다. HTTP(요청·응답)는 모르고, 저장소와 상태 전이 규칙만 씁니다.
import { AppError } from './errors'
import { cancelOrder, completeOrder, newOrder } from './order'
import type { OrderRepository, ProductRepository } from './repository'
import type { CancelOrderInput, CreateOrderInput } from './schemas'
import type { Order, OrderLine, Product } from './types'

/** 서비스가 바깥에서 받아 쓰는 것들. 테스트에서는 시계와 id를 고정값으로 바꿔 끼웁니다. */
export interface ServiceDeps {
  products: ProductRepository
  orders: OrderRepository
  newOrderId: () => string
  now: () => string
}

/** 'O-0001', 'O-0002'처럼 차례로 id를 만드는 함수를 돌려줍니다. */
export function sequentialId(prefix: string): () => string {
  let next = 1
  return () => `${prefix}-${String(next++).padStart(4, '0')}`
}

export function createOrderService(deps: ServiceDeps) {
  async function findOrder(id: string): Promise<Order> {
    const order = await deps.orders.findById(id)
    if (order === undefined) {
      throw new AppError('NOT_FOUND', `주문을 찾을 수 없습니다: ${id}`)
    }
    return order
  }

  return {
    listProducts(): Promise<Product[]> {
      return deps.products.findAll()
    },

    async createOrder(input: CreateOrderInput): Promise<Order> {
      const lines: OrderLine[] = []
      for (const [index, item] of input.items.entries()) {
        const product = await deps.products.findById(item.productId)
        if (product === undefined) {
          throw new AppError('VALIDATION_ERROR', '요청 값이 올바르지 않습니다.', [
            { path: `items.${index}.productId`, message: `없는 상품입니다: ${item.productId}` },
          ])
        }
        if (product.soldOut) {
          throw new AppError('SOLD_OUT', `품절된 상품입니다: ${product.name}`)
        }
        lines.push({
          productId: product.id,
          productName: product.name,
          unitPrice: product.price,
          quantity: item.quantity,
          lineAmount: product.price * item.quantity,
        })
      }
      const order = newOrder(deps.newOrderId(), lines, deps.now())
      await deps.orders.save(order)
      return order
    },

    listOrders(): Promise<Order[]> {
      return deps.orders.findAll()
    },

    getOrder(id: string): Promise<Order> {
      return findOrder(id)
    },

    async cancelOrder(id: string, input: CancelOrderInput): Promise<Order> {
      const cancelled = cancelOrder(await findOrder(id), input.reason, deps.now())
      await deps.orders.save(cancelled)
      return cancelled
    },

    async completeOrder(id: string): Promise<Order> {
      const completed = completeOrder(await findOrder(id), deps.now())
      await deps.orders.save(completed)
      return completed
    },
  }
}

/** 반환 타입을 직접 쓰지 않고 함수에서 뽑아냅니다. */
export type OrderService = ReturnType<typeof createOrderService>
```
:::

::: details src/app.ts
```ts
// HTTP 층: 경로(route)를 정의하고, 요청 → 검증 → 서비스 호출 → 응답을 연결합니다.
import express, { type ErrorRequestHandler, type Express } from 'express'
import { AppError } from './errors'
import type { OrderService } from './order-service'
import { cancelOrderSchema, createOrderSchema, parseBody } from './schemas'

export function createApp(service: OrderService): Express {
  const app = express()
  // 요청 본문의 JSON을 req.body로 읽어 줍니다.
  app.use(express.json())

  // 상품 목록
  app.get('/api/products', async (_req, res) => {
    res.json(await service.listProducts())
  })

  // 주문 생성
  app.post('/api/orders', async (req, res) => {
    // req.body는 any입니다. 검사를 통과한 input부터 타입을 믿을 수 있습니다.
    const input = parseBody(createOrderSchema, req.body)
    const order = await service.createOrder(input)
    res.status(201).json(order)
  })

  // 주문 목록
  app.get('/api/orders', async (_req, res) => {
    res.json(await service.listOrders())
  })

  // 주문 한 건 조회
  app.get('/api/orders/:id', async (req, res) => {
    res.json(await service.getOrder(req.params.id))
  })

  // 주문 취소
  app.post('/api/orders/:id/cancel', async (req, res) => {
    const input = parseBody(cancelOrderSchema, req.body)
    res.json(await service.cancelOrder(req.params.id, input))
  })

  // 제공 완료
  app.post('/api/orders/:id/complete', async (req, res) => {
    res.json(await service.completeOrder(req.params.id))
  })

  // 위의 어떤 경로에도 맞지 않는 요청
  app.use((req, res) => {
    const error = new AppError('NOT_FOUND', `없는 경로입니다: ${req.method} ${req.path}`)
    res.status(error.status).json(error.toBody())
  })

  app.use(errorHandler)
  return app
}

/**
 * 공통 에러 처리. Express 5는 async 핸들러에서 던진 에러도 여기로 보내 줍니다.
 * 매개변수가 4개여야 Express가 에러 처리 미들웨어로 인식합니다.
 */
const errorHandler: ErrorRequestHandler = (err: unknown, _req, res, _next) => {
  let error: AppError
  if (err instanceof AppError) {
    error = err
  } else if (err instanceof SyntaxError && 'status' in err && err.status === 400) {
    // express.json()이 JSON 문법 오류를 만났을 때
    error = new AppError('VALIDATION_ERROR', '요청 본문이 올바른 JSON이 아닙니다.')
  } else {
    // 예상하지 못한 에러: 자세한 내용은 서버 로그에만 남기고, 클라이언트에는 숨깁니다.
    console.error(err)
    error = new AppError('INTERNAL_ERROR', '서버 오류가 발생했습니다.')
  }
  res.status(error.status).json(error.toBody())
}
```
:::

## 회고 질문

1. 주문 타입을 판별 유니온으로 나눈 덕분에 막을 수 있었던 실수를 두 가지 적어 보세요.
2. 검증을 HTTP 층(`app.ts`)에서 하고 서비스는 검증된 값만 받게 한 이유는 무엇인가요? 서비스에서도 다시 검증해야 하는 경우가 있을까요? (힌트: 없는 상품, 품절)
3. 저장소를 인터페이스로 만든 것이 테스트에 어떤 도움이 되었나요?
4. `now`와 `newOrderId`를 주입받지 않고 서비스 안에서 `new Date()`를 직접 불렀다면 테스트를 어떻게 써야 했을까요?
5. 에러 응답 형식을 하나로 통일한 것이 프로젝트 4(React 앱)에서 어떤 도움이 될지 예상해 보세요.
