---
title: TypeScript 문법 치트시트
---

# TypeScript 문법 치트시트

TypeScript 문법을 카테고리별로 **짧은 코드 조각**으로 모았습니다. "이거 어떻게 쓰더라?" 싶을 때 모양만 빠르게 확인하는 용도입니다. 각 절 끝의 링크를 따라가면 자세한 설명과 연습 문제가 있습니다.

::: info 이 문서의 코드
- 모든 코드 조각은 TypeScript 5.6, `--strict` 설정에서 컴파일해 확인했습니다. 조각마다 독립적으로 복사해서 실행할 수 있습니다.
- `// ❌`가 붙은 줄은 일부러 오류를 보여 주는 줄이며, 주석의 메시지는 실제 컴파일러 출력입니다.
- TS 5.6보다 새 기능은 도입 버전을 따로 적었습니다.
:::

**바로가기:** [기본 타입](#basic) · [배열·튜플](#array) · [객체](#object) · [함수](#function) · [유니온·좁히기](#union) · [type/interface](#alias) · [제네릭](#generic) · [keyof/typeof](#keyof) · [유틸리티 타입](#utility) · [고급 타입](#advanced) · [타입 가드](#guard) · [클래스](#class) · [모듈](#module) · [비동기](#async) · [tsconfig](#tsconfig)

## 기본 타입 {#basic}

```ts
// 원시 타입
let productName: string = '아메리카노'
let price: number = 4500
let inStock: boolean = true
let memo: string | null = null // null을 허용하려면 유니온으로 적음
let big: bigint = 9007199254740993n
let id: symbol = Symbol('id')

// 타입 추론: 초기값이 있으면 타입을 적지 않아도 됨
let qty = 2 // number
const shop = '강남점' // '강남점' (const는 리터럴 타입으로 추론)

// 특수 타입
let anything: any = 1 // 검사를 끔. 가급적 쓰지 않음
let input: unknown = JSON.parse('{"a":1}') // 쓰기 전에 좁혀야 함
function log(msg: string): void { console.log(msg) } // 반환값 없음
function fail(msg: string): never { throw new Error(msg) } // 절대 정상 종료하지 않음
```

| 타입 | 뜻 | 관련 레슨 |
|---|---|---|
| `string` · `number` · `boolean` | 문자열 · 숫자 · 참/거짓 | [원시 타입](../part1-basics/02-primitive-types) |
| `null` · `undefined` | 값 없음 (strict에서는 유니온으로 허용해야 함) | [원시 타입](../part1-basics/02-primitive-types) |
| `any` | 검사 끔 | [특수 타입](../part2-types/02-special-types) |
| `unknown` | 무엇이든 받지만 좁혀야 사용 가능 | [특수 타입](../part2-types/02-special-types) |
| `void` | 반환값 없음 | [특수 타입](../part2-types/02-special-types) |
| `never` | 있을 수 없는 값 | [특수 타입](../part2-types/02-special-types) |

## 배열 · 튜플 {#array}

```ts
const names: string[] = ['아메리카노', '라테']
const prices: Array<number> = [4500, 5000] // 위와 같은 뜻의 제네릭 표기
const tags: readonly string[] = ['신상', '할인'] // 수정 불가 배열

// 튜플: 길이와 칸별 타입이 정해진 배열
const item: [string, number] = ['라테', 2]
const [itemName, itemQty] = item

// 이름 붙은 튜플 · 선택 요소 · 나머지 요소
type Line = [name: string, qty: number, memo?: string]
type Scores = [string, ...number[]]
const line: Line = ['모카', 1]
const scores: Scores = ['김철수', 90, 85]

// 배열 메서드의 타입은 자동으로 이어짐
const total = prices.reduce((sum, p) => sum + p, 0) // number
const upper = names.map((n) => n.length) // number[]
```

관련 레슨: [배열과 배열 메서드](../part1-basics/07-arrays) · [배열 타입과 튜플](../part2-types/03-arrays-tuples)

## 객체 {#object}

```ts
// 객체 타입 표기
const product: { name: string; price: number } = { name: '라테', price: 5000 }

type Member = {
  readonly id: number // 읽기 전용
  name: string
  phone?: string // 선택 속성 (string | undefined)
}

// 인덱스 시그니처: 키 이름이 미리 정해지지 않은 객체
type StockByCode = { [code: string]: number }
const stock: StockByCode = { A001: 10, A002: 0 }

// 구조 분해 · 스프레드 · 선택적 체이닝 · 널 병합
const m: Member = { id: 1, name: '김민지' }
const { id, phone = '없음' } = m // 없으면 기본값
const copied = { ...m, name: '이서준' }
const phoneLength = m.phone?.length ?? 0
```

관련 레슨: [객체](../part1-basics/08-objects) · [객체 타입](../part2-types/04-object-types)

## 함수 {#function}

```ts
// 선언 · 화살표 함수
function add(a: number, b: number): number {
  return a + b
}
const double = (n: number): number => n * 2

// 선택 · 기본 · 나머지 매개변수
function greet(name: string, title?: string) {
  return title ? `${title} ${name}` : name
}
function discount(price: number, rate = 0.1) {
  return price * (1 - rate)
}
function sum(...nums: number[]) {
  return nums.reduce((a, b) => a + b, 0)
}

// 함수 타입
type Formatter = (value: number) => string
const won: Formatter = (v) => `${v.toLocaleString()}원`

// 오버로드: 인수 모양별 시그니처를 여러 개 선언
function find(id: number): string
function find(name: string): number
function find(key: number | string): string | number {
  return typeof key === 'number' ? '상품' + key : key.length
}
```

관련 레슨: [함수 기초](../part1-basics/06-functions) · [함수 타입](../part2-types/05-function-types)

## 유니온 · 리터럴 · 좁히기 {#union}

```ts
// 유니온과 리터럴 타입
type Pay = '카드' | '현금' | '포인트'
type Id = number | string

// typeof 로 좁히기
function format(id: Id) {
  if (typeof id === 'number') return id.toFixed(0) // 여기서 id는 number
  return id.toUpperCase() // 여기서 id는 string
}

// in 으로 좁히기
type Card = { cardNo: string }
type Cash = { received: number }
function paid(p: Card | Cash) {
  if ('cardNo' in p) return p.cardNo
  return p.received
}

// 판별 유니온 + 완전성 검사
type Order =
  | { status: 'paid'; paidAt: Date }
  | { status: 'cancelled'; reason: string }
function describe(o: Order): string {
  switch (o.status) {
    case 'paid': return '결제 완료'
    case 'cancelled': return `취소: ${o.reason}`
    default: {
      const never: never = o // 경우를 빠뜨리면 여기서 오류
      return never
    }
  }
}

// instanceof · 동등 비교 · 참 같은 값 검사도 좁히기
function len(v: string | null) {
  return v ? v.length : 0
}
```

| 좁히기 방법 | 예 |
|---|---|
| `typeof` | `typeof x === 'string'` |
| `in` | `'cardNo' in p` |
| `instanceof` | `e instanceof Error` |
| 동등 비교 | `o.status === 'paid'` |
| 참 같은 값(truthy) | `if (v)` |
| 사용자 정의 타입 가드 | `function isCard(p): p is Card` |

관련 레슨: [유니온과 리터럴](../part2-types/06-union-literal) · [타입 좁히기](../part2-types/08-narrowing) · [판별 유니온](../part3-intermediate/03-discriminated-union)

## type · interface · 단언 · enum {#alias}

```ts
// 타입 별칭: 어떤 타입에도 이름을 붙일 수 있음
type Price = number
type Product = { name: string; price: Price }

// 인터페이스: 객체 모양 정의, extends로 확장
interface Item {
  name: string
}
interface FoodItem extends Item {
  expiresAt: Date
}

// 인터섹션: 두 타입을 합침
type Timestamped = { createdAt: Date }
type SavedProduct = Product & Timestamped

// 타입 단언 · non-null 단언 · as const
const raw: unknown = { name: '라테', price: 5000 }
const p = raw as Product // 검사 없이 덮어씀 (주의)
const el = document.getElementById('app')! // null이 아니라고 장담
const METHODS = ['카드', '현금'] as const // readonly ['카드', '현금']

// satisfies (TS 4.9+): 검사는 하되 추론된 좁은 타입은 유지
const prices = { 라테: 5000, 모카: 5500 } satisfies Record<string, number>

// enum과 그 대안
enum Status { Ready = 'READY', Done = 'DONE' }
const StatusObj = { Ready: 'READY', Done: 'DONE' } as const
type StatusValue = (typeof StatusObj)[keyof typeof StatusObj] // 'READY' | 'DONE'
```

| 비교 | `type` | `interface` |
|---|---|---|
| 객체 모양 | O | O |
| 유니온 · 튜플 · 원시 타입 이름 | O | X |
| 확장 | `&` (인터섹션) | `extends` |
| 같은 이름으로 다시 선언 | 오류 | 선언 병합됨 |

관련 레슨: [type과 interface](../part2-types/07-type-alias-interface) · [열거형](../part2-types/09-enum) · [타입 단언](../part2-types/10-assertion) · [인터섹션](../part3-intermediate/01-intersection) · [satisfies](../part5-advanced/06-type-guards-satisfies)

## 제네릭 {#generic}

```ts
// 제네릭 함수
function first<T>(list: T[]): T | undefined {
  return list[0]
}
const f = first(['라테', '모카']) // string | undefined

// 제네릭 타입
type ApiResponse<T> = { ok: boolean; data: T }
const res: ApiResponse<number[]> = { ok: true, data: [1, 2] }

// 제약(extends)
function getLength<T extends { length: number }>(v: T) {
  return v.length
}

// keyof 제약: 객체에 실제로 있는 키만 허용
function pick<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}
const n = pick({ name: '라테', price: 5000 }, 'price') // number

// 기본 타입 매개변수
type Page<T = string> = { items: T[]; total: number }
const page: Page = { items: ['a'], total: 1 }

// 제네릭 클래스
class Box<T> {
  constructor(public value: T) {}
}
const box = new Box(10) // Box<number>
```

관련 레슨: [제네릭 기초](../part3-intermediate/04-generics-basics) · [제네릭 제약](../part3-intermediate/05-generic-constraints)

## keyof · typeof · 인덱스 접근 타입 {#keyof}

```ts
type Product = { name: string; price: number; tags: string[] }

type ProductKey = keyof Product // 'name' | 'price' | 'tags'
type PriceType = Product['price'] // number
type TagType = Product['tags'][number] // string (배열 요소 타입)

const defaultProduct = { name: '', price: 0 }
type DefaultProduct = typeof defaultProduct // { name: string; price: number }

const PAY = ['카드', '현금', '포인트'] as const
type Pay = (typeof PAY)[number] // '카드' | '현금' | '포인트'

function createOrder(id: number) {
  return { id, items: [] as string[] }
}
type OrderResult = ReturnType<typeof createOrder> // { id: number; items: string[] }
```

관련 레슨: [keyof · typeof · 인덱스 접근 타입](../part3-intermediate/06-keyof-typeof-indexed)

## 유틸리티 타입 {#utility}

아래 표의 예시는 다음 타입을 기준으로 합니다.

```ts
type Product = { id: number; name: string; price: number; memo?: string }
type Pay = '카드' | '현금' | '포인트'

type A = Partial<Product>
type B = Required<Product>
type C = Readonly<Product>
type D = Pick<Product, 'id' | 'name'>
type E = Omit<Product, 'memo'>
type F = Record<Pay, number>
type G = Exclude<Pay, '포인트'>
type H = Extract<Pay, '카드' | '쿠폰'>
type I = NonNullable<string | null | undefined>
type J = ReturnType<() => Product>
type K = Parameters<(id: number, qty: number) => void>
type L = Awaited<Promise<Product[]>>
type M = InstanceType<typeof Date>
type N = Uppercase<'card'>
```

| 유틸리티 타입 | 하는 일 | 결과 예 |
|---|---|---|
| `Partial<T>` | 모든 속성을 선택(`?`)으로 | `{ id?: number; name?: string; ... }` |
| `Required<T>` | 모든 속성을 필수로 | `memo`도 필수 |
| `Readonly<T>` | 모든 속성을 읽기 전용으로 | `{ readonly id: number; ... }` |
| `Pick<T, K>` | 고른 속성만 남김 | `{ id: number; name: string }` |
| `Omit<T, K>` | 고른 속성을 뺌 | `memo`가 없는 `Product` |
| `Record<K, V>` | 키 K, 값 V인 객체 | `{ 카드: number; 현금: number; 포인트: number }` |
| `Exclude<U, X>` | 유니온에서 X를 뺌 | `'카드' \| '현금'` |
| `Extract<U, X>` | 유니온에서 X와 겹치는 것만 | `'카드'` |
| `NonNullable<T>` | `null`·`undefined` 제거 | `string` |
| `ReturnType<F>` | 함수 반환 타입 | `Product` |
| `Parameters<F>` | 함수 매개변수 튜플 | `[id: number, qty: number]` |
| `Awaited<T>` | Promise를 벗긴 타입 | `Product[]` |
| `InstanceType<C>` | 클래스 인스턴스 타입 | `Date` |
| `Uppercase<S>` 등 | 문자열 리터럴 대소문자 변환 (`Lowercase`, `Capitalize`, `Uncapitalize`) | `'CARD'` |
| `NoInfer<T>` | 이 위치에서는 타입 추론을 하지 않음 (TS 5.4+) | — |

관련 레슨: [내장 유틸리티 타입 총정리](../part3-intermediate/07-utility-types)

## 조건부 · 매핑 · 템플릿 리터럴 타입 {#advanced}

```ts
// 조건부 타입: 타입 수준의 if
type IsString<T> = T extends string ? '문자열' : '아님'
type R1 = IsString<'라테'> // '문자열'

// 분배: 유니온이 들어오면 멤버마다 따로 적용
type ToArray<T> = T extends unknown ? T[] : never
type R2 = ToArray<string | number> // string[] | number[]
type NoDistribute<T> = [T] extends [unknown] ? T[] : never
type R3 = NoDistribute<string | number> // (string | number)[]

// infer: 타입 일부를 꺼내기
type ElementOf<T> = T extends (infer E)[] ? E : never
type R4 = ElementOf<number[]> // number
type Unwrap<T> = T extends Promise<infer V> ? V : T

// 매핑된 타입
type Product = { name: string; price: number }
type Optional<T> = { [K in keyof T]?: T[K] }
type Mutable<T> = { -readonly [K in keyof T]: T[K] } // 수식어 빼기

// 키 재매핑(as) — TS 4.1+
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]
}
type ProductGetters = Getters<Product> // { getName: () => string; getPrice: () => number }

// 템플릿 리터럴 타입
type Size = 'S' | 'M' | 'L'
type Color = 'red' | 'blue'
type Sku = `${Color}-${Size}` // 'red-S' | 'red-M' | ... 6가지
type EventName = `on${Capitalize<'click' | 'focus'>}` // 'onClick' | 'onFocus'

// 재귀 타입
type Category = { name: string; children: Category[] }
type DeepReadonly<T> = { readonly [K in keyof T]: DeepReadonly<T[K]> }
```

관련 레슨: [조건부 타입](../part5-advanced/01-conditional-types) · [infer](../part5-advanced/02-infer) · [매핑된 타입](../part5-advanced/03-mapped-types) · [템플릿 리터럴 타입](../part5-advanced/04-template-literal-types) · [재귀 타입](../part5-advanced/05-recursive-types)

## 사용자 정의 타입 가드 · 단언 함수 {#guard}

```ts
type Card = { kind: 'card'; cardNo: string }
type Cash = { kind: 'cash'; received: number }

// 타입 가드: 반환 타입이 `x is T`
function isCard(p: Card | Cash): p is Card {
  return p.kind === 'card'
}

// 단언 함수: 통과하면 그 뒤로 타입이 좁혀짐
function assertIsNumber(v: unknown): asserts v is number {
  if (typeof v !== 'number') throw new Error('숫자가 아닙니다')
}

const v: unknown = 42
assertIsNumber(v)
const doubled = v * 2 // 여기서 v는 number
```

관련 레슨: [사용자 정의 타입 가드 · satisfies](../part5-advanced/06-type-guards-satisfies)

## 클래스 {#class}

```ts
interface Payable {
  pay(amount: number): string
}

abstract class Payment implements Payable {
  static count = 0 // 클래스 자체에 붙는 속성
  protected readonly createdAt = new Date() // 자식 클래스까지만 접근

  // 매개변수 속성: 선언 + 할당을 한 번에
  constructor(private readonly orderId: string) {
    Payment.count++
  }

  abstract pay(amount: number): string // 자식이 꼭 구현해야 함

  get id() { return this.orderId } // getter
}

class CardPayment extends Payment {
  #pin = '0000' // JS 표준 private 필드 (실행 중에도 숨겨짐)

  pay(amount: number) {
    return `${this.id} 카드 결제 ${amount}원`
  }
}

const payment = new CardPayment('ORD-001')
console.log(payment.pay(5000)) // 출력: ORD-001 카드 결제 5000원
```

| 접근 제어자 | 클래스 안 | 자식 클래스 | 바깥 |
|---|---|---|---|
| `public` (기본) | O | O | O |
| `protected` | O | O | X |
| `private` | O | X | X |
| `#필드` (JS 표준) | O | X | X (실행 중에도 막힘) |

관련 레슨: [클래스](../part3-intermediate/08-classes)

## 모듈 {#module}

```ts
// 파일: product.ts
export type Product = { name: string; price: number }
export const TAX_RATE = 0.1
export function withTax(p: Product): number {
  return Math.round(p.price * (1 + TAX_RATE))
}
export default function hello() {
  return '안녕하세요'
}
```

```ts
// 파일: order.ts
import hello, { withTax, TAX_RATE } from './product' // 기본 + 이름 붙은 가져오기
import type { Product } from './product' // 타입만 가져오기 (컴파일 후 사라짐)
import * as P from './product' // 모듈 전체를 한 이름으로

const latte: Product = { name: '라테', price: 5000 }
console.log(hello(), withTax(latte), TAX_RATE, P.TAX_RATE)

export { latte as defaultItem } // 이름 바꿔 내보내기
export type { Product } // 타입 다시 내보내기
```

관련 레슨: [모듈](../part3-intermediate/09-modules) · [모듈 시스템](../part6-tooling/03-module-systems) · [선언 파일](../part5-advanced/08-declaration-files)

## 비동기 {#async}

```ts
type Product = { id: number; name: string }

// Promise 타입: Promise<결과 타입>
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// async 함수는 항상 Promise를 반환
async function getProduct(id: number): Promise<Product> {
  await delay(10)
  return { id, name: '라테' }
}

// 오류 처리: catch의 오류는 unknown
async function load() {
  try {
    const p = await getProduct(1)
    return p.name
  } catch (e) {
    if (e instanceof Error) console.error(e.message)
    return null
  }
}

// 여러 개를 동시에
async function loadAll() {
  const [a, b] = await Promise.all([getProduct(1), getProduct(2)]) // [Product, Product]
  const results = await Promise.allSettled([getProduct(3)])
  return { a, b, results }
}

// fetch 응답에 타입 붙이기 (json()은 any를 돌려주므로 직접 표기)
async function fetchProducts(): Promise<Product[]> {
  const res = await fetch('/api/products')
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return (await res.json()) as Product[] // 실제 모양 검증은 zod 등으로
}
```

관련 레슨: [Promise](../part4-async/02-promise) · [async/await](../part4-async/03-async-await) · [fetch API](../part4-async/04-fetch-api) · [런타임 검증](../part4-async/05-runtime-validation)

## tsconfig 핵심 옵션 {#tsconfig}

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022", "DOM"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src"]
}
```

| 옵션 | 하는 일 | 추천 |
|---|---|---|
| `target` | 출력 JS의 문법 수준 | 실행 환경에 맞춤 (`ES2022` 등) |
| `module` | 출력 모듈 방식 | Node는 `NodeNext`, 번들러 사용 시 `ESNext` |
| `moduleResolution` | `import` 경로를 찾는 규칙 | Node는 `NodeNext`, Vite 등은 `Bundler` |
| `lib` | 쓸 수 있는 내장 API 타입 | 브라우저면 `DOM` 포함 |
| `strict` | 엄격 검사 묶음을 한 번에 켬 | 항상 `true` |
| `noUncheckedIndexedAccess` | 배열·인덱스 접근 결과에 `undefined` 포함 | 켜는 것을 권장 |
| `esModuleInterop` | CommonJS 모듈을 `import x from`으로 가져오기 | `true` |
| `skipLibCheck` | `.d.ts` 검사 생략 (빌드 속도) | `true` |
| `outDir` / `rootDir` | 출력 폴더 / 소스 기준 폴더 | `dist` / `src` |
| `declaration` | `.d.ts` 함께 출력 | 라이브러리면 `true` |
| `sourceMap` | 디버깅용 소스 맵 출력 | 개발 중 `true` |
| `noEmit` | 검사만 하고 JS를 만들지 않음 | Vite 등 다른 도구가 빌드할 때 |
| `isolatedModules` | 파일 단위 변환 도구와 호환되게 제한 | 번들러 사용 시 `true` |
| `verbatimModuleSyntax` | `import type`을 강제해 import를 그대로 출력 (TS 5.0+) | ESM 프로젝트에서 권장 |

관련 레슨: [tsconfig.json 완전 정복](../part6-tooling/01-tsconfig) · [strict 옵션](../part6-tooling/02-strict-options) · [모듈 시스템](../part6-tooling/03-module-systems)
