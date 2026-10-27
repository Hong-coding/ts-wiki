---
title: Vitest로 테스트 작성하기
---

# Vitest로 테스트 작성하기

<LessonMeta level="실전" :minutes="60" prev="typescript-eslint flat config와 Prettier로 린트·서식 자동화" />

## 이번에 배울 것

- 테스트가 타입 검사·린트와 다른 무엇을 확인하는지 설명할 수 있다.
- Vitest를 설치하고 `describe`·`it`·`expect`로 첫 테스트를 작성·실행할 수 있다.
- 비동기 함수(`async`)의 성공·실패를 테스트할 수 있다.
- `vi.fn`, `vi.mock`, `vi.spyOn`으로 외부 의존(서버 호출, 시간, 콘솔)을 가짜로 바꿀 수 있다.
- `expectTypeOf`로 **타입 자체**를 테스트하고, 커버리지와 watch 모드를 쓸 수 있다.

## 먼저 알아 둘 것

- [async/await와 비동기 오류 처리](../part4-async/03-async-await)
- [제네릭 기초](../part3-intermediate/04-generics-basics) — `vi.fn` 타입 매개변수
- [모듈 시스템](./03-module-systems) — 이 레슨의 프로젝트는 ESM + `nodenext`입니다.

이 레슨의 모든 테스트는 작성 시점(2026-10)에 아래 버전으로 실제로 실행했고, 출력은 실제 결과를 옮긴 것입니다(경로·시간은 줄였습니다).

| 패키지 | 버전 | 공식 문서 |
|---|---|---|
| `vitest` | 5.0.5 | [vitest.dev](https://vitest.dev/guide/) |
| `@vitest/coverage-v8` | 5.0.5 | [Coverage 가이드](https://vitest.dev/guide/coverage) |
| `typescript` | 5.9.3 | |
| Node.js | 24.13.1 | Vitest 5.0.5는 Node `^22.12.0 \|\| ^24.0.0 \|\| >=26.0.0`을 요구합니다 |

## 비유로 이해하기

매장 POS 기계를 새로 들여놓았다고 생각해 봅시다. 매장을 열기 전에 점장은 **시험 결제**를 해 봅니다.

- "아메리카노 2잔 + 치즈케이크 1개를 찍으면 15,500원이 나와야 한다" → 이것이 **테스트 하나**(`it`)입니다.
- "쿠폰 기능" 시험들을 한 묶음으로 → `describe`
- "나와야 한다"를 확인하는 행동 → `expect(...).toBe(...)`
- 진짜 카드사에 연결하면 실제로 돈이 빠져나가니, 시험할 때는 **연습용 카드 단말기**를 꽂습니다 → **목**(mock, 진짜 대신 쓰는 가짜 부품)

타입 검사는 "가격 칸에 숫자가 들어갔는가"를 봅니다. 하지만 "숫자가 **맞는 숫자**인가"는 확인하지 못합니다. 할인 계산식에서 `*`를 `+`로 잘못 써도 타입은 똑같이 `number`이기 때문입니다. 그것을 잡는 것이 테스트입니다.

## 개념 설명

### 1단계: 설치와 프로젝트 준비

**Vitest**는 Vite 팀이 만든 테스트 도구입니다. TypeScript 파일을 **따로 빌드하지 않고** 바로 실행해 줘서 설정이 거의 필요 없습니다.

```powershell
mkdir cart-test
cd cart-test
npm init -y
npm pkg set type=module
npm install -D typescript@5 vitest @vitest/coverage-v8 @types/node@22
```

`package.json`에 스크립트를 넣습니다.

```powershell
npm pkg set scripts.test="vitest" scripts.test:run="vitest run" scripts.coverage="vitest run --coverage" scripts.typecheck="tsc --noEmit"
```

```json
{
  "type": "module",
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "coverage": "vitest run --coverage",
    "typecheck": "tsc --noEmit"
  }
}
```

- `vitest` — **watch 모드**(파일을 저장할 때마다 다시 실행). 개발 중에 켜 둡니다.
- `vitest run` — 한 번만 실행하고 끝. CI(자동 검사 서버)용입니다.

`tsconfig.json`은 [01 레슨](./01-tsconfig)의 Node 앱 설정에서 결과 파일 관련 옵션을 빼고 `noEmit`을 넣은 형태입니다.

```json
{
  "compilerOptions": {
    "target": "es2023",
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "types": ["node"],
    "noEmit": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

::: tip Vitest는 타입 검사를 하지 않습니다
Vitest는 내부에서 esbuild 계열 변환기로 **타입을 지우기만** 하고 실행합니다. 그래서 테스트 파일에 타입 에러가 있어도 테스트는 통과할 수 있습니다. `npm run typecheck`(`tsc --noEmit`)를 반드시 함께 돌리세요. 이 점은 [06 빌드 도구](./06-build-tools)에서 다시 정리합니다.
:::

### 2단계: 첫 테스트 — describe · it · expect

테스트할 코드부터 만듭니다.

```ts
// src/cart.ts
export interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
}

// 장바구니 합계
export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

// 쿠폰 할인: 정률(rate) 할인, 최대 할인 금액(maxDiscount) 제한
export function applyCoupon(total: number, rate: number, maxDiscount: number): number {
  if (rate < 0 || rate > 1) {
    throw new RangeError('할인율은 0~1 사이여야 합니다')
  }
  const discount = Math.min(Math.floor(total * rate), maxDiscount)
  return total - discount
}
```

테스트 파일은 **같은 이름 + `.test.ts`** 로 만드는 것이 관례입니다. Vitest는 기본으로 `*.test.ts`, `*.spec.ts` 파일을 찾아 실행합니다.

```ts
// src/cart.test.ts
import { describe, it, expect } from 'vitest'
import { cartTotal, applyCoupon, type CartItem } from './cart.js'

const items: CartItem[] = [
  { productId: 'P001', name: '아메리카노', price: 4500, quantity: 2 },
  { productId: 'P002', name: '치즈케이크', price: 6500, quantity: 1 },
]

describe('cartTotal', () => {
  it('가격 × 수량을 모두 더한다', () => {
    expect(cartTotal(items)).toBe(15500)
  })

  it('빈 장바구니는 0원', () => {
    expect(cartTotal([])).toBe(0)
  })
})

describe('applyCoupon', () => {
  it('10% 할인', () => {
    expect(applyCoupon(15500, 0.1, 5000)).toBe(13950)
  })

  it('최대 할인 금액을 넘지 않는다', () => {
    expect(applyCoupon(100000, 0.1, 5000)).toBe(95000)
  })

  it('할인율이 범위를 벗어나면 RangeError', () => {
    expect(() => applyCoupon(10000, 1.5, 5000)).toThrow(RangeError)
    expect(() => applyCoupon(10000, -0.1, 5000)).toThrow('할인율은 0~1 사이여야 합니다')
  })
})
```

- `describe(이름, 함수)` — 관련된 테스트를 묶는 상자입니다. 보통 테스트 대상 함수 이름을 씁니다.
- `it(설명, 함수)` — 테스트 하나입니다. 설명은 "무엇을 하면 어떻게 되어야 한다"를 문장으로 씁니다. `test`라고 써도 똑같습니다.
- `expect(실제값).toBe(기대값)` — 둘이 같은지 확인합니다. 다르면 테스트가 실패합니다.
- 에러가 나는지 확인할 때는 `expect(() => 함수호출)`처럼 **함수로 감싸야** 합니다. 감싸지 않으면 `expect`에 도착하기도 전에 에러가 터집니다.

```powershell
npm run test:run
```

```text
 RUN  v5.0.5 .../cart-test

 Test Files  1 passed (1)
      Tests  5 passed (5)
   Duration  257ms
```

**실패하면 어떻게 보일까요?** 일부러 기대값을 `15000`으로 틀리게 바꿔 봅시다.

```text
 ❯ src/cart.test.ts (5 tests | 1 failed) 16ms
   ❯ cartTotal (2)
     × 가격 × 수량을 모두 더한다 12ms

 FAIL  src/cart.test.ts > cartTotal > 가격 × 수량을 모두 더한다
AssertionError: expected 15500 to be 15000 // Object.is equality

- Expected
+ Received

- 15000
+ 15500

 ❯ src/cart.test.ts:11:30
      9| describe('cartTotal', () => {
     10|   it('가격 × 수량을 모두 더한다', () => {
     11|     expect(cartTotal(items)).toBe(15000)
       |                              ^
```

`- Expected`(기대한 값)와 `+ Received`(실제 받은 값)를 나란히 보여 주고, 실패한 줄을 가리킵니다. 테스트 설명을 한국어 문장으로 써 두면 어떤 기능이 깨졌는지 바로 읽힙니다.

### 3단계: 자주 쓰는 matcher

`toBe` 같은 확인 함수를 **matcher**(매처, 맞춰 보는 도구)라고 부릅니다.

| matcher | 확인하는 것 | 예 |
|---|---|---|
| `toBe(x)` | 정확히 같은 값(`Object.is`) — 숫자·문자열·불리언 | `expect(total).toBe(15500)` |
| `toEqual(x)` | 객체·배열의 **내용**이 같은지 | `expect(order).toEqual({ id: 'O1', total: 9500 })` |
| `toStrictEqual(x)` | `toEqual` + `undefined` 속성·클래스까지 엄격히 | |
| `toContain(x)` | 배열·문자열에 포함 | `expect(codes).toContain('P001')` |
| `toHaveLength(n)` | 길이 | `expect(items).toHaveLength(2)` |
| `toBeUndefined()` / `toBeNull()` | 값이 없음 | |
| `toBeCloseTo(x)` | 소수 계산 오차 허용 | `expect(0.1 + 0.2).toBeCloseTo(0.3)` |
| `toThrow(x)` | 에러 발생(종류 또는 메시지) | |
| `not.` | 반대 | `expect(total).not.toBe(0)` |

객체를 `toBe`로 비교하면 내용이 같아도 **다른 객체**라서 실패합니다. 객체·배열은 `toEqual`을 씁니다.

### 4단계: 비동기 테스트

`async` 함수는 Promise를 돌려주므로, 테스트 함수도 `async`로 만들고 `await`합니다. 실패(거부)를 확인할 때는 `rejects`를 씁니다.

```ts
// 성공 확인
it('기존 포인트에 결제 금액의 1%를 더한다', async () => {
  const result = await earnPoint('M001', 15500)
  expect(result).toBe(1355)
})

// 실패 확인 — await expect(...).rejects
it('회원 조회가 실패하면 에러를 그대로 던진다', async () => {
  await expect(earnPoint('M999', 10000)).rejects.toThrow('회원 조회 실패: 404')
})
```

::: warning await를 빠뜨리면 테스트가 거짓으로 통과합니다
`expect(...).rejects.toThrow(...)` 앞에 `await`가 없으면, 확인이 끝나기 전에 테스트 함수가 먼저 끝나 버립니다. [04 레슨](./04-eslint-prettier)의 `no-floating-promises` 규칙이 이런 실수를 잡아 줍니다.
:::

그런데 `earnPoint`는 내부에서 **서버에 회원 정보를 요청**합니다. 테스트할 때마다 진짜 서버를 부르면 느리고, 서버가 꺼져 있으면 실패하고, 데이터가 바뀌면 결과가 달라집니다. 그래서 목을 씁니다.

### 5단계: 목(mock) 세 가지 — vi.fn · vi.mock · vi.spyOn

테스트할 코드입니다.

```ts
// src/member-api.ts
export interface Member {
  id: string
  name: string
  point: number
}

// 실제로는 서버에 요청하는 함수 (테스트에서는 목으로 바꿈)
export async function fetchMember(id: string): Promise<Member> {
  const res = await fetch(`https://api.example.com/members/${id}`)
  if (!res.ok) throw new Error(`회원 조회 실패: ${res.status}`)
  return (await res.json()) as Member
}
```

```ts
// src/point.ts
import { fetchMember } from './member-api.js'

// 결제 금액의 1%를 적립하고, 적립 후 포인트를 돌려줌
export async function earnPoint(memberId: string, paidAmount: number): Promise<number> {
  const member = await fetchMember(memberId)
  return member.point + Math.floor(paidAmount * 0.01)
}

// 영수증 출력 — 출력 함수(printer)를 매개변수로 받음
export function printReceipt(total: number, printer: (line: string) => void): void {
  printer('=== 영수증 ===')
  printer(`합계: ${total.toLocaleString('ko-KR')}원`)
}

// 오늘 날짜로 주문번호 만들기
export function orderNo(): string {
  const d = new Date()
  const ymd = d.toISOString().slice(0, 10).replaceAll('-', '')
  return `ORD-${ymd}`
}

export function pick<T>(list: T[], index: number): T | undefined {
  return list[index]
}
```

| 도구 | 하는 일 | 쓰는 때 |
|---|---|---|
| `vi.fn()` | 호출 기록을 남기는 **가짜 함수**를 새로 만듦 | 콜백·매개변수로 받는 함수 |
| `vi.mock(경로, 공장함수)` | **모듈 전체**를 가짜로 바꿈 | import 해서 쓰는 API 모듈 |
| `vi.spyOn(객체, '메서드')` | 진짜 메서드에 **감시 장치**를 붙임(필요하면 동작도 바꿈) | `console.log`, `Date`, 객체 메서드 |

#### vi.fn — 가짜 함수

`printReceipt`는 출력 함수를 매개변수로 받으므로, 가짜 함수를 넘겨 "몇 번, 무엇으로 불렸는지" 확인합니다.

```ts
import { describe, it, expect, vi } from 'vitest'
import { printReceipt } from './point.js'

describe('printReceipt (vi.fn)', () => {
  it('두 줄을 출력한다', () => {
    const printer = vi.fn<(line: string) => void>()

    printReceipt(15500, printer)

    expect(printer).toHaveBeenCalledTimes(2)
    expect(printer).toHaveBeenNthCalledWith(1, '=== 영수증 ===')
    expect(printer).toHaveBeenLastCalledWith('합계: 15,500원')
  })
})
```

- `vi.fn<(line: string) => void>()`처럼 **함수 타입을 제네릭으로 넘기면** 가짜 함수에도 타입이 붙습니다. `printer`를 `printReceipt`에 넘길 때 타입 검사가 됩니다.
- 이렇게 **바꿔 끼울 수 있는 부분을 매개변수로 받는 설계**(의존성 주입)는 테스트를 아주 쉽게 만듭니다.

#### vi.mock — 모듈 통째로 바꾸기

`earnPoint`는 `fetchMember`를 직접 import 합니다. 매개변수로 바꿔 끼울 수 없으니 **모듈 자체**를 가짜로 바꿉니다.

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { earnPoint } from './point.js'
import { fetchMember } from './member-api.js'

// member-api 모듈 전체를 목으로 바꿈 (파일 맨 위로 끌어올려져 실행됨)
vi.mock('./member-api.js', () => ({
  fetchMember: vi.fn(),
}))

describe('earnPoint (비동기 + vi.mock)', () => {
  beforeEach(() => {
    vi.mocked(fetchMember).mockReset() // 테스트마다 기록·동작 초기화
  })

  it('기존 포인트에 결제 금액의 1%를 더한다', async () => {
    vi.mocked(fetchMember).mockResolvedValue({ id: 'M001', name: '김민지', point: 1200 })

    const result = await earnPoint('M001', 15500)

    expect(result).toBe(1355)
    expect(fetchMember).toHaveBeenCalledWith('M001')
    expect(fetchMember).toHaveBeenCalledTimes(1)
  })

  it('회원 조회가 실패하면 에러를 그대로 던진다', async () => {
    vi.mocked(fetchMember).mockRejectedValue(new Error('회원 조회 실패: 404'))

    await expect(earnPoint('M999', 10000)).rejects.toThrow('회원 조회 실패: 404')
  })
})
```

- `vi.mock`은 코드에서 어디에 쓰든 **파일 맨 위로 끌어올려져**(hoisting) import보다 먼저 실행됩니다. 그래서 `point.js`가 `member-api.js`를 import 할 때 이미 가짜가 들어가 있습니다.
- 경로는 테스트 파일 기준이며, 소스의 import 문과 같은 문자열(`./member-api.js`)로 씁니다.
- import 한 `fetchMember`의 타입은 원래 함수 타입이라 `.mockResolvedValue`가 없습니다. `vi.mocked(fetchMember)`로 감싸면 **목 타입으로 바뀌어** 목 메서드를 타입 안전하게 쓸 수 있습니다. 넘기는 값도 `Member` 타입인지 검사됩니다.
- `mockResolvedValue(값)`은 "부르면 `값`으로 성공하는 Promise를 돌려줘", `mockRejectedValue(에러)`는 "실패하는 Promise를 돌려줘"입니다.
- `beforeEach`는 각 `it` 전에 실행됩니다. 앞 테스트의 호출 기록이 다음 테스트에 섞이지 않게 초기화합니다.

#### vi.spyOn과 가짜 시계

`orderNo()`는 **오늘 날짜**에 따라 결과가 바뀌어서, 그냥 테스트하면 내일 실패합니다. Vitest의 가짜 시계로 시간을 고정합니다. `console.log`처럼 이미 있는 메서드는 `vi.spyOn`으로 감시합니다.

```ts
import { describe, it, expect, vi, afterEach } from 'vitest'
import { orderNo } from './point.js'

describe('orderNo (vi.spyOn + 가짜 시계)', () => {
  afterEach(() => {
    vi.useRealTimers() // 진짜 시계로 되돌림
    vi.restoreAllMocks() // spyOn으로 바꾼 메서드를 원래대로
  })

  it('오늘 날짜로 주문번호를 만든다', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-26T09:00:00Z'))
    expect(orderNo()).toBe('ORD-20261026')
  })

  it('console.log 호출을 엿본다', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    console.log('주문 생성', orderNo())
    expect(spy).toHaveBeenCalledOnce()
    expect(spy.mock.calls[0]?.[0]).toBe('주문 생성')
  })
})
```

- `mockImplementation(() => {})`는 "진짜 `console.log`는 실행하지 말고 아무것도 하지 마"라는 뜻입니다. 테스트 출력이 깨끗해집니다.
- `spy.mock.calls`는 호출 기록 배열입니다. `[0]`은 첫 번째 호출, `[0]?.[0]`은 그 호출의 첫 번째 인수입니다. `noUncheckedIndexedAccess`가 켜져 있어 `?.`를 씁니다.
- **원래대로 되돌리는 정리 코드**(`afterEach`)를 꼭 넣습니다. 안 그러면 다른 테스트까지 가짜 시계·가짜 `console.log`로 실행됩니다.

::: tip 목은 적을수록 좋습니다
목이 많을수록 테스트는 "진짜 코드"가 아니라 "가짜 부품"을 시험하게 됩니다. 계산·변환 같은 **순수 함수**(같은 입력에 항상 같은 출력, 바깥에 영향 없음)는 목 없이 바로 테스트하고, 서버·시간·파일처럼 바깥과 닿는 부분만 목으로 바꿉니다.
:::

### 6단계: 타입 테스트 — expectTypeOf

라이브러리나 공통 유틸을 만들 때는 **값**뿐 아니라 **타입**이 의도대로 나오는지도 확인하고 싶습니다. `pick`의 반환 타입이 `T | undefined`인지 확인해 봅시다.

```ts
import { it, expectTypeOf } from 'vitest'
import { pick } from './point.js'

it('반환 타입에 undefined가 포함된다', () => {
  expectTypeOf(pick(['P001'], 0)).toEqualTypeOf<string | undefined>()
  expectTypeOf(pick).parameter(1).toBeNumber()
})
```

- `toEqualTypeOf<타입>()` — 타입이 정확히 같은지
- `parameter(n)` — n번째 매개변수 타입(0부터)
- `toBeNumber()`, `toBeString()`, `toMatchTypeOf<타입>()`(포함 관계) 등이 있습니다.

**중요: `expectTypeOf`는 실행 중에는 아무것도 하지 않습니다.** 타입은 실행 중에 사라지기 때문입니다. 위 테스트의 `string | undefined`를 `string`으로 틀리게 바꿔도 `vitest run`은 통과합니다. 타입 테스트 실패는 **타입 검사기**가 알려 줍니다.

```powershell
npx tsc --noEmit
```

```text
src/point.test.ts(66,51): error TS2344: Type 'string' does not satisfy the constraint '"Expected: string, Actual: undefined"'.
```

또는 타입 테스트를 `*.test-d.ts` 파일에 따로 두고 `--typecheck` 옵션으로 Vitest가 타입 검사까지 하게 할 수 있습니다(작성 시점 "실험적 기능"으로 표시됨).

```ts
// src/point.test-d.ts
import { expectTypeOf, test } from 'vitest'
import { pick } from './point.js'

test('pick의 반환 타입', () => {
  expectTypeOf(pick([4500, 5000], 0)).toEqualTypeOf<number>()
})
```

```powershell
npx vitest run --typecheck
```

```text
 ❯  TS  src/point.test-d.ts (1 test | 1 failed)
   × pick의 반환 타입

 FAIL  src/point.test-d.ts:4 > pick의 반환 타입
TypeCheckError: Type 'number' does not satisfy the constraint '"Expected number, Actual undefined"'.
```

`pick`은 `number | undefined`를 돌려주므로 기대 타입을 `number | undefined`로 고치면 통과합니다. `--typecheck`는 기본으로 `*.test-d.ts` 파일만 타입 검사합니다. 일반 `*.test.ts` 안의 `expectTypeOf`는 `tsc --noEmit`으로 확인하세요.

### 7단계: 설정 파일과 커버리지

**커버리지**(coverage)는 "테스트가 소스 코드의 몇 %를 실제로 실행해 봤는가"입니다. 테스트가 한 번도 지나가지 않은 코드는 버그가 있어도 모릅니다.

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'], // 테스트가 import 하지 않은 파일도 포함
      exclude: ['src/**/*.test.ts', 'src/**/*.test-d.ts'],
      reporter: ['text', 'html'],
    },
  },
})
```

```powershell
npm run coverage
```

```text
 % Coverage report from v8
---------------|---------|----------|---------|---------|-------------------
File           | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
---------------|---------|----------|---------|---------|-------------------
All files      |   77.77 |    66.66 |    87.5 |   81.25 |
 member-api.ts |       0 |        0 |       0 |       0 | 9-11
---------------|---------|----------|---------|---------|-------------------
```

- 작성 시점의 Vitest 5.0.5는 100% 덮인 파일(`cart.ts`, `point.ts`)을 표에서 생략하고, 덜 덮인 파일만 보여 줬습니다.
- `member-api.ts`는 테스트에서 목으로 바꿨기 때문에 진짜 코드가 한 줄도 실행되지 않았습니다(0%). 목의 대가입니다. 이 파일은 따로 통합 테스트를 하거나 `fetch`를 목으로 바꿔 테스트합니다.
- `coverage.include`를 지정하지 않으면 **테스트가 import 한 파일만** 집계되어, 테스트가 없는 파일이 아예 목록에서 빠집니다. 실제로 설정 없이 돌렸을 때는 "2 files fully covered"만 나오고 `member-api.ts`가 보이지 않았습니다.
- `html` 보고서는 `coverage/index.html`에 생깁니다. 브라우저로 열면 실행되지 않은 줄이 빨갛게 표시됩니다.
- `coverage` 폴더는 `.gitignore`에 넣습니다.

::: warning 커버리지 100%가 목표는 아닙니다
커버리지는 "실행해 봤다"는 뜻이지 "맞는지 확인했다"는 뜻이 아닙니다. `expect` 없이 함수만 불러도 커버리지는 오릅니다. 중요한 업무 규칙(금액 계산, 할인, 재고)이 빠짐없이 검증되는지가 더 중요합니다.
:::

### 8단계: watch 모드

```powershell
npm test
```

`vitest`(run 없이)는 테스트를 실행한 뒤 **끝나지 않고 기다립니다.** 소스나 테스트 파일을 저장하면, 그 파일과 관련된 테스트만 골라 다시 실행합니다. 코드를 고치면서 옆 터미널에서 바로 결과를 보는 방식입니다.

터미널에서 쓰는 키(Vitest 화면 아래에 안내가 나옵니다):

| 키 | 동작 |
|---|---|
| `a` | 모든 테스트 다시 실행 |
| `f` | 실패한 테스트만 다시 실행 |
| `p` | 파일 이름으로 걸러서 실행 |
| `t` | 테스트 이름으로 걸러서 실행 |
| `h` | 도움말 |
| `q` | 종료 |

CI 환경(환경 변수 `CI`가 있을 때)이나 터미널이 아닌 곳에서는 자동으로 `run` 모드로 동작합니다.

## 자주 하는 실수

### 실수 1: 에러 테스트에서 함수로 감싸지 않기

```ts
expect(applyCoupon(10000, 1.5, 5000)).toThrow(RangeError)
```

왜 틀렸나: `applyCoupon(...)`이 `expect`에 들어가기 **전에** 실행되어 에러가 터집니다. 테스트는 "확인 실패"가 아니라 "예상 못 한 에러"로 깨집니다.

고친 코드:

```ts
expect(() => applyCoupon(10000, 1.5, 5000)).toThrow(RangeError)
```

### 실수 2: 객체를 toBe로 비교하기

```ts
expect(cartItem('P001')).toBe({ productId: 'P001', quantity: 1 })
```

왜 틀렸나: `toBe`는 **같은 객체인지**(참조)를 봅니다. 내용이 같아도 새로 만든 객체는 다른 객체라서 실패합니다.

고친 코드:

```ts
expect(cartItem('P001')).toEqual({ productId: 'P001', quantity: 1 })
```

### 실수 3: 목·가짜 시계를 되돌리지 않기

```ts
it('주문번호', () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-10-26T09:00:00Z'))
  expect(orderNo()).toBe('ORD-20261026')
})
// 이후 다른 테스트의 setTimeout이 영원히 실행되지 않음
```

왜 틀렸나: 가짜 시계가 켜진 채 남아 다음 테스트까지 영향을 줍니다. 테스트 순서에 따라 성공·실패가 바뀌는, 찾기 어려운 문제가 됩니다.

고친 코드:

```ts
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})
```

### 실수 4: Vitest 통과 = 타입도 맞다고 믿기

```ts
it('합계', () => {
  const total: string = cartTotal(items) // 타입 에러지만
  expect(total).toBe(15500) // 테스트는 통과
})
```

왜 틀렸나: Vitest는 타입을 지우고 실행만 합니다. 테스트 파일의 타입 에러는 보고하지 않습니다.

고친 코드: `tsconfig.json`의 `include`에 테스트 파일이 포함되게 하고(`src` 아래에 두면 포함됨) CI에서 `npm run typecheck`를 함께 돌립니다.

```ts
const total: number = cartTotal(items)
```

## 직접 해 보기

### 문제 1 ⭐ 첫 테스트

다음 함수의 테스트를 3개 작성하세요. ① 1만 원 이상이면 배송비 0원 ② 1만 원 미만이면 3,000원 ③ 정확히 1만 원이면 0원.

```ts
// src/shipping.ts
export function shippingFee(total: number): number {
  return total >= 10000 ? 0 : 3000
}
```

::: details 정답 보기
```ts
// src/shipping.test.ts
import { describe, it, expect } from 'vitest'
import { shippingFee } from './shipping.js'

describe('shippingFee', () => {
  it('1만 원 이상이면 무료', () => {
    expect(shippingFee(15500)).toBe(0)
  })

  it('1만 원 미만이면 3,000원', () => {
    expect(shippingFee(9900)).toBe(3000)
  })

  it('정확히 1만 원이면 무료 (경계값)', () => {
    expect(shippingFee(10000)).toBe(0)
  })
})
```

③처럼 조건이 바뀌는 **경계값**(9,999 / 10,000)을 테스트하면 `>=`를 `>`로 잘못 쓴 실수를 잡을 수 있습니다.
:::

### 문제 2 ⭐ 객체 비교

`addToCart(cart, item)`이 새 배열을 돌려준다고 할 때, 결과 배열에 상품이 1개 들어 있고 그 내용이 `{ productId: 'P001', quantity: 1 }`인지 확인하는 `expect` 두 줄을 쓰세요.

::: details 정답 보기
```ts
const result = addToCart([], { productId: 'P001', quantity: 1 })
expect(result).toHaveLength(1)
expect(result[0]).toEqual({ productId: 'P001', quantity: 1 })
```
:::

### 문제 3 ⭐⭐ 비동기 + vi.fn

다음 함수를 테스트하세요. `save`는 매개변수로 받으므로 `vi.fn`으로 만듭니다. ① 저장 성공 시 `'저장 완료'`를 돌려주고 `save`가 주문 객체로 1번 불렸는지 ② `save`가 실패하면 `'저장 실패: 네트워크 오류'`를 돌려주는지 확인합니다.

```ts
// src/order-service.ts
export interface Order {
  id: string
  total: number
}

export async function submitOrder(
  order: Order,
  save: (o: Order) => Promise<void>,
): Promise<string> {
  try {
    await save(order)
    return '저장 완료'
  } catch (err) {
    return `저장 실패: ${err instanceof Error ? err.message : String(err)}`
  }
}
```

::: details 정답 보기
```ts
import { describe, it, expect, vi } from 'vitest'
import { submitOrder, type Order } from './order-service.js'

const order: Order = { id: 'ord-001', total: 9500 }

describe('submitOrder', () => {
  it('저장에 성공하면 저장 완료', async () => {
    const save = vi.fn<(o: Order) => Promise<void>>().mockResolvedValue(undefined)

    await expect(submitOrder(order, save)).resolves.toBe('저장 완료')
    expect(save).toHaveBeenCalledOnce()
    expect(save).toHaveBeenCalledWith(order)
  })

  it('저장에 실패하면 실패 메시지', async () => {
    const save = vi.fn<(o: Order) => Promise<void>>().mockRejectedValue(new Error('네트워크 오류'))

    await expect(submitOrder(order, save)).resolves.toBe('저장 실패: 네트워크 오류')
  })
})
```

`submitOrder`는 에러를 잡아 문자열로 돌려주므로 두 경우 모두 `resolves`(성공)로 확인합니다.
:::

### 문제 4 ⭐⭐ vi.mock

`src/stock.ts`가 `./stock-api.js`의 `getStock(productId)`(Promise로 재고 수량 반환)를 import 해서 쓰는 `canOrder(productId, qty)`를 가지고 있습니다. 재고가 5개일 때 3개 주문은 `true`, 7개 주문은 `false`인지 확인하는 테스트를 `vi.mock`으로 작성하세요.

::: details 정답 보기
```ts
// src/stock.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { canOrder } from './stock.js'
import { getStock } from './stock-api.js'

vi.mock('./stock-api.js', () => ({
  getStock: vi.fn(),
}))

describe('canOrder', () => {
  beforeEach(() => {
    vi.mocked(getStock).mockReset()
    vi.mocked(getStock).mockResolvedValue(5)
  })

  it('재고 이하로 주문하면 true', async () => {
    await expect(canOrder('P001', 3)).resolves.toBe(true)
  })

  it('재고보다 많이 주문하면 false', async () => {
    await expect(canOrder('P001', 7)).resolves.toBe(false)
    expect(getStock).toHaveBeenCalledWith('P001')
  })
})
```

참고로 `canOrder`는 이렇게 생겼다고 가정했습니다.

```ts
// src/stock.ts
import { getStock } from './stock-api.js'

export async function canOrder(productId: string, qty: number): Promise<boolean> {
  return (await getStock(productId)) >= qty
}
```
:::

### 문제 5 ⭐⭐⭐ 타입 테스트

다음 유틸 타입과 함수의 타입을 `expectTypeOf`로 검증하는 `*.test-d.ts`를 작성하세요. ① `OrderStatus`에 `'PAID'`가 들어갈 수 있다 ② `statusLabel`의 반환 타입은 `string` ③ `statusLabel`의 첫 매개변수 타입은 `OrderStatus`.

```ts
// src/status.ts
export type OrderStatus = 'READY' | 'PAID' | 'CANCELED'

export function statusLabel(status: OrderStatus): string {
  return { READY: '대기', PAID: '결제 완료', CANCELED: '취소' }[status]
}
```

::: details 정답 보기
```ts
// src/status.test-d.ts
import { expectTypeOf, test } from 'vitest'
import { statusLabel, type OrderStatus } from './status.js'

test('OrderStatus와 statusLabel의 타입', () => {
  expectTypeOf<'PAID'>().toMatchTypeOf<OrderStatus>()
  expectTypeOf(statusLabel).returns.toEqualTypeOf<string>()
  expectTypeOf(statusLabel).parameter(0).toEqualTypeOf<OrderStatus>()
})
```

```powershell
npx vitest run --typecheck
```

`toMatchTypeOf`는 "왼쪽이 오른쪽에 들어갈 수 있다(할당 가능)"를, `toEqualTypeOf`는 "정확히 같다"를 확인합니다.
:::

## 확인 퀴즈

1. `vitest`와 `vitest run`의 차이는?
2. `toBe`와 `toEqual`은 각각 언제 쓸까요?
3. `vi.mock`이 import 문보다 아래에 써 있어도 동작하는 이유는?
4. `expectTypeOf`로 쓴 타입 테스트가 틀렸는데 `vitest run`이 통과했습니다. 왜일까요?
5. 커버리지 설정에 `include`를 지정하지 않으면 어떤 파일이 보고서에서 빠질까요?

::: details 정답 보기
1. `vitest`는 watch 모드(저장할 때마다 재실행), `vitest run`은 한 번 실행하고 끝납니다.
2. `toBe`는 숫자·문자열 같은 원시 값이나 "같은 객체인지", `toEqual`은 객체·배열의 내용 비교에 씁니다.
3. Vitest가 `vi.mock` 호출을 파일 맨 위로 끌어올려(hoisting) import보다 먼저 실행하기 때문입니다.
4. 타입은 실행 중에 사라지므로 `expectTypeOf`는 실행 시 아무것도 하지 않습니다. `tsc --noEmit`이나 `vitest --typecheck`(`*.test-d.ts`)로 확인해야 합니다.
5. 테스트가 한 번도 import 하지 않은 파일(테스트가 없는 파일, 목으로 바꾼 파일)이 빠집니다.
:::

## 정리

- 테스트는 "타입은 맞지만 값이 틀린" 버그를 잡습니다. Vitest는 TS를 바로 실행하지만 **타입 검사는 하지 않으므로** `tsc --noEmit`을 함께 돌립니다.
- `describe`로 묶고, `it`으로 하나씩, `expect(...).matcher()`로 확인합니다. 에러는 `expect(() => ...)`, 비동기는 `await expect(...).rejects`.
- `vi.fn`은 가짜 함수, `vi.mock`은 모듈 통째 교체, `vi.spyOn`은 기존 메서드 감시. `vi.mocked`로 목에 타입을 붙입니다.
- 가짜 시계·spy는 `afterEach`에서 꼭 되돌립니다.
- `expectTypeOf`는 타입 검사기로 확인합니다(`tsc` 또는 `vitest --typecheck` + `*.test-d.ts`).
- 커버리지는 `coverage.include`를 지정해 빠진 파일 없이 보고, 숫자보다 중요한 규칙의 검증을 우선합니다.

## 다음 단계

[빌드 도구: tsc · Vite · tsup · tsx](./06-build-tools) — 작성한 TypeScript를 실행·배포 가능한 JavaScript로 만드는 도구들을 비교하고, 각 도구가 타입 검사를 하는지 확인합니다.
