---
title: Node.js + Express REST API를 TS로
---

# Node.js + Express REST API를 TS로

<LessonMeta level="실전" :minutes="90" prev="JavaScript 프로젝트를 TypeScript로 단계적으로 옮기는 방법" />

## 이번에 배울 것

- Express + TypeScript 프로젝트를 처음부터 만들고 개발 서버·빌드·실행 스크립트를 구성할 수 있다.
- `Request`·`Response`의 제네릭으로 경로 매개변수(params)·요청 본문(body)·쿼리(query)·응답 본문에 타입을 붙일 수 있다.
- 라우터를 파일로 분리하고, async 핸들러의 오류를 에러 미들웨어 한 곳에서 처리할 수 있다.
- `process.env`가 왜 `string | undefined`인지 설명하고, 서버 시작 시 환경 변수를 검증할 수 있다.
- 상품 CRUD REST API를 타입 안전하게 완성할 수 있다.

## 먼저 알아 둘 것

- [async/await와 비동기 오류 처리](../part4-async/03-async-await)
- [런타임 검증: 타입은 실행 중에 사라진다 (zod)](../part4-async/05-runtime-validation)
- [모듈: import/export와 타입 전용 import](../part3-intermediate/09-modules)
- [tsconfig.json 완전 정복](../part6-tooling/01-tsconfig), [모듈 시스템](../part6-tooling/03-module-systems), [빌드 도구: tsc · Vite · tsup · tsx](../part6-tooling/06-build-tools)

::: info 이 레슨의 버전 (작성 시점 2026-10 기준)
Node.js 24.13, express 5.3.0, @types/express 5.0.6, @types/node 26.6, tsx 4.23, TypeScript 5.6.3으로 예제를 실제로 컴파일하고 실행해 확인했습니다. 설치 명령에는 버전을 붙이지 않았으므로 여러분 PC에는 더 새 버전이 설치될 수 있습니다. **Express 4와 5는 비동기 오류 처리 방식이 다르니** 버전을 꼭 확인하세요(`npm ls express`).
:::

## 비유로 이해하기

동네 카페의 **주문 창구**를 떠올려 봅시다.

- 손님(브라우저·앱)이 창구에 **주문서**를 냅니다. 주문서에는 "무엇을 할지(조회·추가·수정·삭제)"와 "어떤 상품인지"가 적혀 있습니다.
- 창구 직원(**라우터**)은 주문서 종류를 보고 알맞은 담당자(**핸들러**)에게 넘깁니다.
- 담당자는 일을 처리하고 **영수증**(응답)을 돌려줍니다.
- 처리 중에 문제가 생기면(재고 없음, 이상한 주문서) 담당자는 직접 수습하지 않고 **매니저**(**에러 미들웨어**)에게 넘깁니다. 매니저는 언제나 같은 양식의 안내문을 손님에게 줍니다.

TypeScript는 여기서 **주문서 양식과 영수증 양식을 정해 두는 역할**을 합니다. "상품 수정 주문서에는 상품 번호가 꼭 있어야 한다", "상품 조회 영수증에는 이름·가격·재고가 있다" 같은 약속을 코드로 적어 두면, 양식에 맞지 않게 일하는 코드를 컴파일러가 미리 잡아 줍니다.

단, 손님이 **실제로 써 온 주문서**가 양식대로인지는 TypeScript가 확인할 수 없습니다. 타입은 실행할 때 사라지기 때문입니다. 그래서 창구에서 주문서를 한 번 더 **검수**(런타임 검증)해야 합니다. 이 레슨의 핵심은 **"타입으로 약속하고, 경계에서 검증한다"** 입니다.

## 개념 설명

### 1단계: 서버와 REST API, 최소한의 개념

**서버**(server)는 다른 프로그램의 요청을 기다렸다가 응답을 돌려주는 프로그램입니다. 브라우저나 앱은 **HTTP**라는 약속된 방식으로 서버에 요청을 보냅니다. 요청 하나는 다음으로 이뤄집니다.

| 요소 | 예 | 뜻 |
|---|---|---|
| 메서드(method) | `GET`, `POST`, `PATCH`, `DELETE` | 무엇을 할지: 조회·생성·일부 수정·삭제 |
| 경로(path) | `/products/1` | 무엇에 대해: 1번 상품 |
| 쿼리(query) | `?keyword=라테` | 추가 조건: 이름에 "라테"가 들어간 것 |
| 본문(body) | `{"name":"바닐라라테","price":5500}` | 보낼 데이터(주로 JSON) |

서버의 응답에는 **상태 코드**(status code, 결과를 나타내는 세 자리 숫자)와 본문이 들어 있습니다. `200`은 성공, `201`은 생성 성공, `204`는 성공했지만 본문 없음, `400`은 요청이 잘못됨, `404`는 대상이 없음, `500`은 서버 내부 오류입니다.

**REST API**는 "경로는 대상(명사), 메서드는 동작(동사)"으로 나누어 API(프로그램끼리 주고받는 약속)를 설계하는 관례입니다. 이번 레슨에서 만들 상품 API는 다음과 같습니다.

```text
GET    /products          상품 목록 (쿼리 keyword로 검색)
GET    /products/:id      상품 한 개
POST   /products          상품 등록
PATCH  /products/:id      상품 일부 수정
DELETE /products/:id      상품 삭제
```

`:id`처럼 콜론으로 시작하는 부분은 **경로 매개변수**(route parameter)입니다. `/products/1`로 요청하면 `id`에 `'1'`이 들어옵니다.

**Express**는 Node.js에서 이런 서버를 만들게 도와주는 라이브러리입니다. 오랫동안 가장 널리 쓰인 Node.js 웹 프레임워크라서 실무 코드에서 만날 확률이 높습니다.

### 2단계: 프로젝트 만들기

빈 폴더에서 시작합니다.

```bash
mkdir product-api
cd product-api
npm init -y

# 실행에 필요한 패키지
npm install express

# 개발할 때만 필요한 패키지
npm install -D typescript @types/express @types/node tsx
```

- `express`: 서버 라이브러리 본체입니다.
- `@types/express`: Express의 **타입 선언 파일**(.d.ts)입니다. Express는 JavaScript로 작성되어 타입 정보를 직접 갖고 있지 않습니다. 그래서 커뮤니티 저장소 DefinitelyTyped가 타입만 따로 만들어 `@types/` 이름으로 배포합니다([선언 파일](../part5-advanced/08-declaration-files)에서 배운 내용).
- `@types/node`: `process`, `console` 같은 Node.js 내장 기능의 타입입니다.
- `tsx`: `.ts` 파일을 미리 컴파일하지 않고 바로 실행해 주는 도구입니다. 개발 중에 씁니다.

::: tip 타입 패키지 버전 맞추기
`@types/express`의 주 버전(맨 앞 숫자)은 `express`와 맞춥니다. express 5에는 `@types/express` 5, express 4에는 4입니다. 어긋나면 실제 동작과 타입이 달라 헷갈리는 오류가 납니다.
:::

`package.json`에 ESM(import/export 방식) 설정과 스크립트를 추가합니다.

```json
{
  "name": "product-api",
  "type": "module",
  "scripts": {
    "dev": "tsx watch --env-file=.env src/server.ts",
    "build": "tsc",
    "start": "node --env-file=.env dist/server.js"
  }
}
```

- `dev`: 파일을 저장할 때마다 서버를 다시 띄웁니다(`watch`). `--env-file=.env`는 `.env` 파일의 환경 변수를 읽어 옵니다(10단계에서 설명).
- `build`: `tsc`로 `src/`의 TS를 `dist/`의 JS로 바꿉니다.
- `start`: 운영 환경에서는 빌드된 JS를 Node.js로 직접 실행합니다. `--env-file`은 Node.js 20.6부터 쓸 수 있습니다.

`tsconfig.json`은 다음처럼 둡니다.

```json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "types": ["node"]
  },
  "include": ["src"]
}
```

`module: "nodenext"`이면 상대 경로 import에 **`.js` 확장자**를 붙여야 합니다(`import { app } from './app.js'`). 파일은 `.ts`인데 `.js`로 쓰는 이유는 [모듈 시스템](../part6-tooling/03-module-systems) 레슨에서 설명했습니다. 컴파일된 뒤 실제로 불러올 파일 이름을 적는 것입니다.

최종 폴더 구조는 다음과 같습니다.

```text
product-api/
├─ .env                 ← 환경 변수(커밋하지 않음)
├─ .env.example         ← 어떤 변수가 필요한지 알려 주는 견본(커밋함)
├─ .gitignore
├─ package.json
├─ tsconfig.json
└─ src/
   ├─ server.ts         ← 서버 시작
   ├─ app.ts            ← Express 앱 조립, 에러 미들웨어
   ├─ config.ts         ← 환경 변수 읽기·검증
   ├─ errors.ts         ← HttpError 클래스
   ├─ types.ts          ← Product 등 공용 타입
   └─ routes/
      └─ products.ts    ← 상품 라우터
```

### 3단계: 첫 핸들러와 타입 추론

가장 작은 서버부터 봅시다.

```ts
import express from 'express'

const app = express()

app.get('/hello/:name', (req, res) => {
  // req.params.name의 타입: string (경로 문자열에서 추론됨)
  res.json({ message: `안녕하세요, ${req.params.name}님` })
})

app.listen(3000, () => {
  console.log('http://localhost:3000')
})
```

`app.get(경로, 핸들러)`는 "이 경로로 GET 요청이 오면 이 함수를 실행하라"는 뜻입니다. **핸들러**(handler)는 요청을 처리하는 함수이고, 매개변수로 다음을 받습니다.

- `req`(request, 요청): 경로 매개변수·쿼리·본문 등 손님이 보낸 것
- `res`(response, 응답): 손님에게 돌려줄 것을 만드는 도구. `res.json(값)`은 값을 JSON으로 바꿔 보냅니다.

핸들러를 `app.get`에 **바로** 넘기면 `req`, `res`에 타입을 쓰지 않아도 됩니다. [문맥적 타이핑](../part2-types/01-annotation-inference)으로 추론되기 때문입니다. 게다가 @types/express 5는 경로 문자열 `'/hello/:name'`을 읽어서 `req.params`에 `name`이 있다는 것까지 알아냅니다([템플릿 리터럴 타입](../part5-advanced/04-template-literal-types)의 실전 활용입니다).

```ts
app.get('/products/:id', (req, res) => {
  const id: number = req.params.id
  // ❌ Type 'string' is not assignable to type 'number'. (TS2322)
})
```

경로 매개변수는 **언제나 문자열**입니다. URL은 글자이기 때문입니다. 숫자가 필요하면 직접 바꾸고 검사해야 합니다.

### 4단계: Request와 Response의 제네릭

핸들러를 **따로 떨어진 함수**로 만들면 문맥이 없어서 추론이 안 됩니다. 이때 `Request`, `Response` 타입을 직접 붙입니다. 두 타입은 [제네릭](../part3-intermediate/04-generics-basics)이라서 꺾쇠 안에 세부 타입을 넣을 수 있습니다.

| 타입 | 꺾쇠 안 순서 | 기본값 |
|---|---|---|
| `Request` | 1) 경로 매개변수 2) 응답 본문 3) 요청 본문 4) 쿼리 | `ParamsDictionary`, `any`, `any`, `ParsedQs` |
| `Response` | 1) 응답 본문 | `any` |

순서가 외우기 어려우니 "주소 → 답장 → 편지 → 추가 조건"처럼 기억해 두세요. 필요 없는 자리는 `{}`나 `unknown`으로 채웁니다.

```ts
import type { Request, Response } from 'express'

interface Product {
  id: number
  name: string
  price: number
  stock: number
}

type IdParams = { id: string }

// 경로 매개변수만 지정: Request의 첫 번째 자리
function getProduct(req: Request<IdParams>, res: Response<Product>) {
  const raw = req.params.id // 타입: string
  res.json({ id: Number(raw), name: '아메리카노', price: 4500, stock: 30 })
}
```

`Response<Product>`로 응답 본문 타입을 정해 두면, 양식에 맞지 않는 응답을 보내는 순간 오류가 납니다.

```ts
function getProduct(req: Request<IdParams>, res: Response<Product>) {
  const a = req.params.productId
  // ❌ Property 'productId' does not exist on type 'IdParams'. (TS2339)

  res.json({ id: 1, name: '아메리카노', price: 4500 })
  // ❌ Argument of type '{ id: number; name: string; price: number; }' is not assignable to parameter of type 'Product'.
  //      Property 'stock' is missing in type '{ id: number; name: string; price: number; }' but required in type 'Product'. (TS2345)
}
```

프런트엔드 개발자와 "상품 조회 응답에는 `stock`이 들어간다"고 약속했는데 빠뜨리는 실수를 서버 쪽에서 미리 막아 줍니다.

쿼리 타입은 네 번째 자리입니다. 쿼리 값도 URL의 일부라서 **문자열**이고, 손님이 안 보낼 수도 있으므로 선택 속성(`?`)으로 둡니다.

```ts
type ListQuery = { keyword?: string }

function listProducts(req: Request<{}, Product[], unknown, ListQuery>, res: Response<Product[]>) {
  const keyword = req.query.keyword // 타입: string | undefined
  // ...
}
```

### 5단계: 요청 본문은 any다 — 타입은 약속일 뿐

`Request`의 세 번째 자리(요청 본문)를 지정하지 않으면 `req.body`는 **`any`** 입니다. 오타를 내도 아무 말도 하지 않습니다.

```ts
app.post('/products', (req, res) => {
  const name = req.body.nmae // 오류 없음! any라서 무엇이든 통과
})
```

그렇다고 `Request<{}, Product, CreateProductBody>`처럼 본문 타입을 붙이면 안전해질까요? **아닙니다.** 그것은 "본문이 이런 모양일 것이다"라는 **약속** 일 뿐, 손님이 실제로 `{"price":"공짜"}`를 보내도 서버는 그대로 받아들입니다. 타입은 실행할 때 사라지기 때문입니다.

그래서 외부에서 들어오는 값(요청 본문·쿼리·환경 변수·외부 API 응답)은 **`unknown`으로 받고, 검사한 뒤에 타입을 붙입니다.** 이 위치를 **신뢰 경계**(trust boundary, 믿을 수 없는 바깥 값이 코드 안으로 들어오는 지점)라고 부릅니다.

```ts
import { HttpError } from './errors.js'

type CreateProductBody = Omit<Product, 'id'>

// unknown을 받아 검사를 통과한 경우에만 CreateProductBody를 돌려줍니다.
function validateCreate(body: unknown): CreateProductBody {
  if (typeof body !== 'object' || body === null) {
    throw new HttpError(400, '요청 본문이 비어 있습니다.')
  }
  const { name, price, stock } = body as Record<string, unknown>
  if (typeof name !== 'string' || name.trim() === '') {
    throw new HttpError(400, 'name은 비어 있지 않은 문자열이어야 합니다.')
  }
  if (typeof price !== 'number' || price < 0) {
    throw new HttpError(400, 'price는 0 이상의 숫자여야 합니다.')
  }
  if (typeof stock !== 'number' || !Number.isInteger(stock)) {
    throw new HttpError(400, 'stock은 정수여야 합니다.')
  }
  return { name, price, stock } // 여기서는 세 값의 타입이 모두 좁혀져 있음
}
```

`body as Record<string, unknown>`은 "아무 키나 있고 값은 모르는 객체"로 보겠다는 단언입니다. 값이 여전히 `unknown`이므로 하나씩 `typeof`로 [좁혀야](../part2-types/08-narrowing) 쓸 수 있어 안전합니다.

::: tip 실무에서는 zod로
검사 코드를 손으로 쓰면 길고 빠뜨리기 쉽습니다. 실무에서는 [zod](../part4-async/05-runtime-validation) 같은 스키마 라이브러리로 "검사 규칙"과 "타입"을 한 번에 만듭니다. 이 레슨은 원리를 보이려고 손으로 썼고, zod와 결합하는 방법은 [06 API 클라이언트](./06-api-client)와 [프로젝트 3](../part8-projects/03-rest-api)에서 다룹니다.
:::

### 6단계: 상태 코드를 들고 다니는 에러 클래스

검사에 실패했을 때 핸들러마다 `res.status(400).json(...)`을 쓰면 코드가 지저분해지고 응답 양식도 제각각이 됩니다. 대신 **"상태 코드를 들고 다니는 에러"** 를 던지고, 에러 미들웨어 한 곳에서 응답을 만듭니다.

```ts
// src/errors.ts
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'HttpError'
  }
}
```

`public readonly status: number`는 [클래스](../part3-intermediate/08-classes)에서 배운 **매개변수 속성**입니다. 생성자 매개변수에 접근 제어자를 붙이면 같은 이름의 속성이 자동으로 만들어집니다.

### 7단계: 라우터 분리

모든 경로를 `app.ts` 한 파일에 쓰면 금방 수백 줄이 됩니다. `Router()`로 **경로 묶음**을 따로 만들고, 앱에는 "`/products`로 시작하는 요청은 이 라우터로" 하고 연결만 합니다.

먼저 여러 파일이 함께 쓰는 타입을 모읍니다.

```ts
// src/types.ts
export interface Product {
  id: number
  name: string
  price: number
  stock: number
}

// 생성 요청 본문: id는 서버가 정하므로 뺍니다.
export type CreateProductBody = Omit<Product, 'id'>
// 수정 요청 본문: 일부 속성만 보낼 수 있습니다.
export type UpdateProductBody = Partial<CreateProductBody>

// 모든 에러 응답의 모양
export interface ErrorBody {
  message: string
}
```

`Omit`, `Partial`은 [유틸리티 타입](../part3-intermediate/07-utility-types)입니다. `Product` 하나에서 생성용·수정용 타입을 만들어 내므로, `Product`에 속성을 추가하면 나머지가 따라 바뀝니다.

```ts
// src/routes/products.ts
import { Router, type Request, type Response } from 'express'
import { HttpError } from '../errors.js'
import type { CreateProductBody, ErrorBody, Product, UpdateProductBody } from '../types.js'

// 메모리에 두는 임시 저장소(실무에서는 DB)
const products: Product[] = [
  { id: 1, name: '아메리카노', price: 4500, stock: 30 },
  { id: 2, name: '카페라테', price: 5000, stock: 12 },
]
let nextId = 3

type IdParams = { id: string }
type ListQuery = { keyword?: string }

function parseId(raw: string): number {
  const id = Number(raw)
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, `잘못된 상품 번호입니다: ${raw}`)
  }
  return id
}

function findProduct(id: number): Product {
  const product = products.find((p) => p.id === id)
  if (!product) {
    throw new HttpError(404, `상품을 찾을 수 없습니다: ${id}`)
  }
  return product
}

// validateCreate는 5단계의 함수를 이 파일에 그대로 둡니다.

export const productRouter = Router()

// 목록: GET /products?keyword=라테
productRouter.get('/', (req: Request<{}, Product[], unknown, ListQuery>, res: Response<Product[]>) => {
  const keyword = req.query.keyword
  const result = keyword ? products.filter((p) => p.name.includes(keyword)) : products
  res.json(result)
})

// 단건: GET /products/:id
productRouter.get('/:id', (req: Request<IdParams>, res: Response<Product>) => {
  const product = findProduct(parseId(req.params.id))
  res.json(product)
})

// 생성: POST /products
productRouter.post('/', async (req: Request<{}, Product, unknown>, res: Response<Product>) => {
  const body = validateCreate(req.body)
  const created: Product = { id: nextId++, ...body }
  products.push(created)
  res.status(201).json(created)
})

// 수정: PATCH /products/:id
productRouter.patch('/:id', (req: Request<IdParams, Product, UpdateProductBody>, res: Response<Product>) => {
  const product = findProduct(parseId(req.params.id))
  Object.assign(product, req.body) // ⚠️ 검증 없이 덮어씀 → 직접 해 보기 문제 4에서 고칩니다
  res.json(product)
})

// 삭제: DELETE /products/:id
productRouter.delete('/:id', (req: Request<IdParams>, res: Response<ErrorBody | void>) => {
  const id = parseId(req.params.id)
  const index = products.findIndex((p) => p.id === id)
  if (index === -1) {
    throw new HttpError(404, `상품을 찾을 수 없습니다: ${id}`)
  }
  products.splice(index, 1)
  res.status(204).end()
})
```

해설:

- `import { Router, type Request, type Response }` — `type`이 붙은 이름은 **타입으로만** 쓴다는 표시입니다. 컴파일된 JS에서는 지워집니다([타입 전용 import](../part3-intermediate/09-modules)).
- 라우터 안의 경로는 `/`, `/:id`처럼 **앞부분(`/products`)을 뺀** 나머지만 씁니다.
- 핸들러는 실패하면 `HttpError`를 **던지기만** 합니다. 응답은 에러 미들웨어가 만듭니다.
- 생성 응답에는 `201`, 삭제 응답에는 본문 없는 `204`를 씁니다.

### 8단계: async 핸들러의 오류는 어디로 가나

POST 핸들러에 `async`가 붙어 있습니다. 실무에서는 DB 조회처럼 기다려야 하는 일이 많아 대부분의 핸들러가 `async`입니다. 그런데 async 함수 안에서 `throw`하면 오류는 **거부된(rejected) Promise**가 됩니다([async/await](../part4-async/03-async-await)). 이 Promise를 누가 받아 줄까요?

- **Express 5**: 핸들러가 돌려준 Promise가 거부되면 **자동으로 에러 미들웨어로 넘깁니다.** 그래서 위 코드처럼 그냥 `throw`하면 됩니다.
- **Express 4**: Promise를 신경 쓰지 않습니다. async 핸들러에서 던진 오류는 아무도 받지 않아 **요청이 응답 없이 멈추거나**, 처리되지 않은 거부(unhandled rejection)로 서버 프로세스가 종료될 수 있습니다.

Express 4 프로젝트를 유지보수한다면 Promise의 오류를 `next`로 넘겨 주는 **래퍼 함수**를 씁니다.

```ts
import type { RequestHandler } from 'express'

// Express 4용: async 핸들러의 거부된 Promise를 next(err)로 넘겨 줍니다.
export function asyncHandler(fn: RequestHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// 사용: router.get('/', asyncHandler(async (req, res) => { ... }))
```

`next`는 "다음 처리 단계로 넘겨라"는 함수이고, `next(오류)`처럼 값을 넣어 부르면 "오류가 났으니 에러 미들웨어로 가라"는 뜻이 됩니다.

### 9단계: 에러 미들웨어

**미들웨어**(middleware)는 요청이 핸들러에 닿기 전후에 끼어들어 일을 하는 함수입니다. `express.json()`도 미들웨어로, 요청 본문의 JSON 글자를 객체로 바꿔 `req.body`에 넣어 줍니다. 그중 **매개변수가 4개**인 미들웨어를 Express는 **에러 미들웨어**로 취급합니다.

```ts
// src/app.ts
import express, { type NextFunction, type Request, type Response } from 'express'
import { HttpError } from './errors.js'
import { productRouter } from './routes/products.js'
import type { ErrorBody } from './types.js'

export const app = express()

app.use(express.json())
app.use('/products', productRouter)

// 에러 미들웨어: 매개변수가 반드시 4개여야 Express가 에러 처리용으로 인식합니다.
app.use((err: unknown, _req: Request, res: Response<ErrorBody>, _next: NextFunction) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message })
    return
  }
  console.error(err)
  res.status(500).json({ message: '서버 내부 오류가 발생했습니다.' })
})
```

해설:

- 무엇이든 던질 수 있으므로 `err`는 **`unknown`** 으로 받습니다. @types/express의 `ErrorRequestHandler` 타입은 `err`를 `any`로 정의하므로, 직접 `unknown`을 붙이는 편이 안전합니다.
- `instanceof HttpError`로 좁히면 `err.status`, `err.message`를 쓸 수 있습니다.
- 예상하지 못한 오류는 서버 로그에만 자세히 남기고, 손님에게는 **내부 정보를 숨긴 일반 메시지**를 보냅니다. 오류 객체를 그대로 응답하면 파일 경로·SQL 같은 내부 구조가 노출되어 보안 문제가 됩니다.
- 쓰지 않는 매개변수 `_req`, `_next`는 이름 앞에 밑줄을 붙여 "일부러 안 쓴다"는 뜻을 나타냅니다. 지우면 매개변수가 4개가 아니게 되어 에러 미들웨어로 인식되지 않습니다.
- 에러 미들웨어는 **라우터를 연결한 뒤 맨 마지막에** 둡니다. 미들웨어는 등록한 순서대로 실행되기 때문입니다.

### 10단계: 환경 변수와 process.env

포트 번호, DB 주소, 외부 서비스 키처럼 **실행 환경마다 다른 값**은 코드에 쓰지 않고 **환경 변수**(environment variable, 프로그램 바깥에서 넣어 주는 설정값)로 받습니다. Node.js에서는 `process.env.이름`으로 읽습니다.

@types/node는 `process.env`의 값 타입을 **`string | undefined`** 로 정의합니다. 이유는 두 가지입니다.

- 환경 변수는 언제나 **글자**입니다. `PORT=3000`이라고 해도 `'3000'`이라는 문자열입니다.
- 아무도 설정하지 않았을 수 있습니다. 그러면 `undefined`입니다.

```ts
const port: number = process.env.PORT
// ❌ Type 'string | undefined' is not assignable to type 'number'.
//      Type 'undefined' is not assignable to type 'number'. (TS2322)

const apiKey: string = process.env.API_KEY
// ❌ Type 'string | undefined' is not assignable to type 'string'.
//      Type 'undefined' is not assignable to type 'string'. (TS2322)
```

`process.env.API_KEY!`처럼 [non-null 단언](../part2-types/10-assertion)으로 오류를 지우면 안 됩니다. 컴파일러의 입만 막을 뿐, 실제로 값이 없으면 서버는 그대로 뜨고 **한참 뒤 처음 그 기능을 쓸 때** 엉뚱한 오류가 납니다.

올바른 방법은 **서버를 시작할 때 한 번 모두 검사하고, 문제가 있으면 바로 멈추는 것**입니다. 이것을 fail fast(빨리 실패하기)라고 합니다.

```ts
// src/config.ts
// 서버 시작 시 환경 변수를 한 번만 읽고 검증합니다.
function requireEnv(name: string): string {
  const value = process.env[name]
  if (value === undefined || value === '') {
    throw new Error(`환경 변수 ${name}이(가) 설정되지 않았습니다.`)
  }
  return value
}

function parsePort(raw: string | undefined): number {
  const port = Number(raw ?? '3000')
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`PORT 값이 올바르지 않습니다: ${raw}`)
  }
  return port
}

export const config = {
  port: parsePort(process.env.PORT),
  apiKey: requireEnv('API_KEY'),
} as const
```

이제 다른 파일은 `process.env`를 직접 읽지 않고 `config.port`(`number`), `config.apiKey`(`string`)만 씁니다. 검사를 통과한 값이므로 타입이 정확합니다.

```ts
// src/server.ts
import { app } from './app.js'
import { config } from './config.js'

app.listen(config.port, () => {
  console.log(`상품 API 서버 시작: http://localhost:${config.port}`)
})
```

`API_KEY` 없이 실행하면 서버가 뜨기 전에 바로 멈춥니다.

```text
Error: 환경 변수 API_KEY이(가) 설정되지 않았습니다.
    at requireEnv (.../dist/config.js:5:15)
```

### 11단계: 시크릿은 코드에 쓰지 않는다

API 키, DB 비밀번호, 토큰 같은 **시크릿**(secret, 노출되면 안 되는 비밀 값)은 절대 코드에 직접 쓰지 않습니다.

```ts
// ❌ 절대 하지 마세요: 실제 키를 코드에 직접 씀
const apiKey = 'sk-live-xxxxxxxx'
```

코드는 Git에 올라가고, Git 기록은 파일을 지워도 남습니다. 저장소를 볼 수 있는 모든 사람(유출되면 외부인까지)이 키를 손에 넣게 됩니다. 대신 다음처럼 관리합니다.

```bash
# .env — 내 PC에서만 쓰는 값. Git에 올리지 않습니다.
PORT=3000
API_KEY=여기에-내-개발용-키
```

```bash
# .env.example — 어떤 변수가 필요한지만 알려 주는 견본. Git에 올립니다.
PORT=3000
API_KEY=
```

```bash
# .gitignore
node_modules
dist
.env
```

운영 서버에서는 `.env` 파일 대신 서버 설정이나 클라우드의 시크릿 관리 기능으로 환경 변수를 넣는 것이 일반적입니다.

### 12단계: 실행해 보기

```bash
npm run dev
```

```text
상품 API 서버 시작: http://localhost:3000
```

다른 터미널에서 `curl`(명령줄에서 HTTP 요청을 보내는 도구)로 요청해 봅니다.

```bash
curl http://localhost:3000/products
curl "http://localhost:3000/products?keyword=%EB%9D%BC%ED%85%8C"   # keyword=라테 (URL 인코딩)
curl http://localhost:3000/products/99
curl http://localhost:3000/products/abc
curl -X POST http://localhost:3000/products -H "Content-Type: application/json" -d '{"name":"바닐라라테","price":5500,"stock":8}'
curl -X POST http://localhost:3000/products -H "Content-Type: application/json" -d '{"name":"","price":1}'
curl -X PATCH http://localhost:3000/products/3 -H "Content-Type: application/json" -d '{"price":5800}'
curl -X DELETE http://localhost:3000/products/3
```

실제로 실행한 결과(상태 코드와 응답 본문)는 다음과 같습니다.

```text
GET    /products              200 [{"id":1,"name":"아메리카노","price":4500,"stock":30},{"id":2,"name":"카페라테","price":5000,"stock":12}]
GET    /products?keyword=라테  200 [{"id":2,"name":"카페라테","price":5000,"stock":12}]
GET    /products/99           404 {"message":"상품을 찾을 수 없습니다: 99"}
GET    /products/abc          400 {"message":"잘못된 상품 번호입니다: abc"}
POST   /products              201 {"id":3,"name":"바닐라라테","price":5500,"stock":8}
POST   /products              400 {"message":"name은 비어 있지 않은 문자열이어야 합니다."}
PATCH  /products/3            200 {"id":3,"name":"바닐라라테","price":5800,"stock":8}
DELETE /products/3            204 (본문 없음)
```

POST 핸들러는 `async`인데도 검증 실패가 `400`으로 잘 응답되었습니다. Express 5가 거부된 Promise를 에러 미들웨어로 넘겨 주었기 때문입니다.

::: info Windows에서 curl 따옴표
PowerShell이나 cmd에서는 작은따옴표로 감싼 JSON이 그대로 전달되지 않을 수 있습니다. Git Bash에서 실행하거나, VS Code 확장 REST Client·Postman 같은 도구를 쓰면 편합니다.
:::

## 자주 하는 실수

### 실수 1: 에러 미들웨어의 매개변수를 줄이기

```ts
// 쓰지 않는 next를 지웠더니...
app.use((err: unknown, req: Request, res: Response) => {
  res.status(500).json({ message: '오류' })
})
```

왜 틀렸나: 컴파일 오류는 나지 않지만, 매개변수가 3개이면 Express는 이 함수를 **일반 미들웨어**로 취급합니다. 첫 매개변수 `err` 자리에 요청 객체가 들어오고, 오류가 나도 이 함수는 불리지 않습니다. Express는 함수의 매개변수 개수(`fn.length`)로 에러 미들웨어인지 판단하기 때문입니다.

고친 코드: 쓰지 않아도 4개를 모두 적고, 밑줄로 표시합니다.

```ts
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  res.status(500).json({ message: '오류' })
})
```

### 실수 2: non-null 단언으로 환경 변수 오류 지우기

```ts
const dbUrl = process.env.DATABASE_URL!
connect(dbUrl) // 값이 없으면 실행 중 엉뚱한 곳에서 실패
```

왜 틀렸나: `!`는 컴파일러에게 "내가 보장한다"고 말하는 것이지 실제로 검사하지 않습니다. 설정을 빠뜨린 서버도 정상처럼 뜹니다.

고친 코드: 시작할 때 검사하는 함수를 거칩니다.

```ts
const dbUrl = requireEnv('DATABASE_URL') // 없으면 서버 시작 단계에서 바로 멈춤
```

### 실수 3: 본문 타입만 붙이고 검증을 생략하기

```ts
productRouter.post('/', (req: Request<{}, Product, CreateProductBody>, res: Response<Product>) => {
  const created: Product = { id: nextId++, ...req.body } // 타입 검사는 통과
  products.push(created)
  res.status(201).json(created)
})
```

왜 틀렸나: `{"name": 123, "price": "공짜"}`를 보내도 그대로 저장됩니다. `CreateProductBody`는 "이럴 것이다"라는 약속일 뿐, 실행 중에 검사하지 않습니다. 저장된 잘못된 데이터는 나중에 전혀 다른 화면에서 문제를 일으킵니다.

고친 코드: 본문은 `unknown`으로 받고 검증 함수를 통과시킵니다.

```ts
productRouter.post('/', (req: Request<{}, Product, unknown>, res: Response<Product>) => {
  const body = validateCreate(req.body) // 실패하면 HttpError(400)
  const created: Product = { id: nextId++, ...body }
  products.push(created)
  res.status(201).json(created)
})
```

### 실수 4: 응답을 보낸 뒤 return을 빠뜨리기

```ts
productRouter.get('/:id', (req: Request<IdParams>, res: Response<Product | ErrorBody>) => {
  const product = products.find((p) => p.id === Number(req.params.id))
  if (!product) {
    res.status(404).json({ message: '없음' })
  }
  res.json(product!)
})
```

왜 틀렸나: 상품이 없으면 404를 보낸 뒤에도 함수가 계속 실행되어 `res.json`을 **한 번 더** 부릅니다. 실행 중 `Cannot set headers after they are sent to the client` 오류가 납니다. 타입 검사로는 잡히지 않는 실수이고, `product!` 단언이 진짜 문제를 가렸습니다.

고친 코드: 응답 후 `return`하거나, 더 좋게는 에러를 던져 에러 미들웨어에 맡깁니다.

```ts
productRouter.get('/:id', (req: Request<IdParams>, res: Response<Product>) => {
  const product = findProduct(parseId(req.params.id)) // 없으면 HttpError(404)를 던짐
  res.json(product)
})
```

### 실수 5: 시크릿을 견본 파일에 쓰기

```bash
# .env.example
API_KEY=sk-live-xxxxxxxx   # ❌ 실제 키를 견본 파일에 적음
```

왜 틀렸나: `.env.example`은 Git에 올라가는 파일입니다. 실제 키를 적으면 코드에 하드코딩한 것과 똑같이 유출됩니다.

고친 코드: 견본에는 **이름만** 적고 값은 비웁니다.

```bash
# .env.example
API_KEY=
```

## 직접 해 보기

### 문제 1 ⭐ 쿼리 타입 붙이기

`GET /products?maxPrice=5000`처럼 최대 가격으로 거르는 핸들러를 만드세요. `maxPrice`가 없으면 전체를, 숫자가 아니면 `HttpError(400)`을 던집니다. `Request`의 네 번째 자리에 쿼리 타입을 지정하세요.

::: details 정답 보기
```ts
type PriceQuery = { maxPrice?: string }

productRouter.get('/', (req: Request<{}, Product[], unknown, PriceQuery>, res: Response<Product[]>) => {
  const raw = req.query.maxPrice // 타입: string | undefined
  if (raw === undefined) {
    res.json(products)
    return
  }
  const maxPrice = Number(raw)
  if (Number.isNaN(maxPrice)) {
    throw new HttpError(400, `maxPrice는 숫자여야 합니다: ${raw}`)
  }
  res.json(products.filter((p) => p.price <= maxPrice))
})
```

쿼리 값은 URL 글자이므로 `number`가 아니라 `string`으로 선언하고, 직접 숫자로 바꿔 검사합니다.
:::

### 문제 2 ⭐ 오류 메시지 읽기

다음 코드는 어떤 오류가 날까요? 이유도 설명하세요.

```ts
const timeoutMs: number = process.env.TIMEOUT_MS
```

::: details 정답 보기
```text
Type 'string | undefined' is not assignable to type 'number'.
  Type 'undefined' is not assignable to type 'number'. (TS2322)
```

환경 변수는 글자(`string`)이고, 설정되지 않았으면 `undefined`입니다. 두 경우 모두 `number` 집합에 없습니다. `parsePort`처럼 문자열을 숫자로 바꾸고, 없거나 잘못된 값이면 시작할 때 오류를 내는 함수를 거치세요.
:::

### 문제 3 ⭐⭐ 재고 조회 엔드포인트

`GET /products/:id/stock`으로 `{ id, stock }`만 돌려주는 핸들러를 만드세요. 응답 본문 타입을 `Response`에 지정해서, 실수로 `price`를 더 넣으면 오류가 나게 하세요.

::: details 정답 보기
```ts
type StockBody = { id: number; stock: number }

productRouter.get('/:id/stock', (req: Request<IdParams>, res: Response<StockBody>) => {
  const product = findProduct(parseId(req.params.id))
  res.json({ id: product.id, stock: product.stock })
})
```

`res.json({ id: product.id, stock: product.stock, price: product.price })`처럼 쓰면 초과 속성 검사(excess property check)에 걸립니다.

```text
Object literal may only specify known properties, and 'price' does not exist in type 'StockBody'. (TS2353)
```
:::

### 문제 4 ⭐⭐ PATCH 검증하기

7단계의 PATCH 핸들러는 `req.body`를 검증 없이 `Object.assign`합니다. `{"price":"공짜","id":999}`를 보내면 가격이 문자열이 되고 id까지 바뀝니다. `validateUpdate(body: unknown): UpdateProductBody` 함수를 만들어 고치세요. 보낸 속성만 검사하고, 모르는 속성은 무시합니다.

::: details 정답 보기
```ts
function validateUpdate(body: unknown): UpdateProductBody {
  if (typeof body !== 'object' || body === null) {
    throw new HttpError(400, '요청 본문이 비어 있습니다.')
  }
  const { name, price, stock } = body as Record<string, unknown>
  const result: UpdateProductBody = {}
  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim() === '') {
      throw new HttpError(400, 'name은 비어 있지 않은 문자열이어야 합니다.')
    }
    result.name = name
  }
  if (price !== undefined) {
    if (typeof price !== 'number' || price < 0) {
      throw new HttpError(400, 'price는 0 이상의 숫자여야 합니다.')
    }
    result.price = price
  }
  if (stock !== undefined) {
    if (typeof stock !== 'number' || !Number.isInteger(stock)) {
      throw new HttpError(400, 'stock은 정수여야 합니다.')
    }
    result.stock = stock
  }
  return result // id 같은 다른 속성은 아예 담지 않음
}

productRouter.patch('/:id', (req: Request<IdParams, Product, unknown>, res: Response<Product>) => {
  const product = findProduct(parseId(req.params.id))
  Object.assign(product, validateUpdate(req.body))
  res.json(product)
})

console.log(validateUpdate({ price: 5800, color: 'red' }))
// 출력: { price: 5800 }
```

허용한 속성만 골라 담기 때문에 `id` 덮어쓰기도 막힙니다.
:::

### 문제 5 ⭐⭐⭐ 설정 확장하기

`config.ts`에 두 값을 추가하세요.

- `DATABASE_URL`: 필수 문자열
- `NODE_ENV`: `'development' | 'production' | 'test'` 중 하나. 없으면 `'development'`. 다른 값이면 시작 시 오류

`config.nodeEnv`의 타입이 `string`이 아니라 세 값의 유니온이 되어야 합니다.

::: details 정답 보기
```ts
type NodeEnv = 'development' | 'production' | 'test'

function parseNodeEnv(raw: string | undefined): NodeEnv {
  const value = raw ?? 'development'
  if (value === 'development' || value === 'production' || value === 'test') {
    return value // 비교로 좁혀져 NodeEnv 타입
  }
  throw new Error(`NODE_ENV 값이 올바르지 않습니다: ${value}`)
}

export const config = {
  port: parsePort(process.env.PORT),
  apiKey: requireEnv('API_KEY'),
  databaseUrl: requireEnv('DATABASE_URL'),
  nodeEnv: parseNodeEnv(process.env.NODE_ENV),
} as const
```

`===` 비교로 [좁히기](../part2-types/08-narrowing)를 하면 `value`의 타입이 리터럴 유니온으로 좁혀지므로 `as` 단언 없이 반환할 수 있습니다. 환경 변수가 많아지면 zod 스키마로 한 번에 검증하는 것이 편합니다.
:::

## 확인 퀴즈

1. `Request` 제네릭의 네 자리는 각각 무엇인가요?
2. `Request<{}, Product, CreateProductBody>`라고 쓰면 요청 본문이 실제로 검사되나요?
3. Express 4와 5에서 async 핸들러가 던진 오류는 각각 어떻게 되나요?
4. Express는 에러 미들웨어를 무엇으로 구분하나요?
5. `process.env.PORT`의 타입이 `string | undefined`인 두 가지 이유는 무엇인가요?

::: details 정답 보기
1. 경로 매개변수, 응답 본문, 요청 본문, 쿼리 순서입니다.
2. 아닙니다. 컴파일 시점의 약속일 뿐이고 실행 중에는 검사하지 않습니다. `unknown`으로 받아 직접(또는 zod로) 검증해야 합니다.
3. Express 5는 거부된 Promise를 자동으로 에러 미들웨어로 넘깁니다. Express 4는 넘기지 않으므로 `asyncHandler` 같은 래퍼로 `next(err)`를 불러 줘야 합니다.
4. 함수의 매개변수 개수가 4개인지로 구분합니다.
5. 환경 변수는 항상 문자열이고, 설정되지 않았으면 `undefined`이기 때문입니다.
:::

## 정리

- Express는 JS 라이브러리라서 타입은 `@types/express`로 따로 설치하고, 주 버전을 express와 맞춥니다.
- 핸들러를 따로 만들 때는 `Request`(경로·응답 본문·요청 본문·쿼리)와 `Response`(응답 본문)의 제네릭으로 타입을 붙입니다. 경로·쿼리 값은 언제나 문자열입니다.
- 요청 본문·쿼리·환경 변수는 **신뢰 경계**입니다. `unknown`으로 받고 검증한 뒤 타입을 붙입니다.
- 핸들러는 `HttpError`를 던지고, 매개변수 4개짜리 에러 미들웨어 한 곳에서 응답을 만듭니다. Express 5는 async 오류를 자동으로 넘겨 줍니다.
- 환경 변수는 `config.ts`에서 시작 시 한 번 검증하고(fail fast), 시크릿은 코드에 쓰지 않고 `.env`(커밋 제외)나 운영 환경 설정으로 넣습니다.

## 다음 단계

[React + TS: 컴포넌트 · props · state · 이벤트](./02-react-basics) — 이번에는 화면 쪽으로 넘어가, React 컴포넌트에 props·state·이벤트 타입을 붙이는 법을 배웁니다.
