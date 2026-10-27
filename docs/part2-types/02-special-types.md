---
title: "특수 타입: any · unknown · never · void"
---

# 특수 타입: any · unknown · never · void

<LessonMeta level="초급" :minutes="45" prev="타입 표기와 추론, const와 let의 추론 차이" />

## 이번에 배울 것

- `any`가 왜 위험한지, 특히 **전염성**(다른 변수까지 any로 번지는 성질)을 설명할 수 있다.
- `unknown`을 받아서 **확인한 뒤 안전하게** 쓸 수 있다.
- `void`와 `undefined`의 차이를 알고 함수 반환 타입에 알맞게 쓸 수 있다.
- `never`가 어떤 곳에서 나타나는지 알고, 오류 메시지에 `never`가 보일 때 당황하지 않는다.
- 네 타입을 "값들의 집합" 관점(전체집합·공집합)으로 설명할 수 있다.

## 먼저 알아 둘 것

- [타입 표기와 타입 추론](./01-annotation-inference)
- [오류 처리: throw · try/catch/finally](../part1-basics/11-errors)
- [조건문](../part1-basics/04-conditionals)의 `typeof` 연산자

## 비유로 이해하기

매장으로 택배 상자가 들어온다고 해 봅시다.

- **any 상자**: 검수 직원이 퇴근해 버린 상자입니다. 무엇이 들었든 확인 없이 진열대에 올립니다. 편하지만, 상자에 유리 조각이 들어 있어도 아무도 모릅니다. 게다가 이 상자에서 꺼낸 물건도 전부 "검수 안 됨" 딱지를 달고 매장 곳곳으로 퍼집니다.
- **unknown 상자**: "내용물 모름" 스티커가 붙은 봉인 상자입니다. 아무 물건이나 받을 수 있지만, **열어서 확인하기 전에는 진열할 수 없습니다.** 확인하고 나서야 "아, 이건 컵이네" 하고 컵 진열대에 둡니다.
- **void**: "받은 것 없음"이라고 적힌 영수증입니다. 일은 했지만 돌려줄 물건이 없을 때입니다.
- **never**: "절대 도착하지 않는 택배"입니다. 배송 도중에 항상 사고가 나서(오류) 끝까지 오지 않습니다. 이런 상자에는 아무것도 들어 있지 않습니다.

## 개념 설명

### 1단계: 집합으로 보는 네 가지 특수 타입

[지난 레슨](./01-annotation-inference)에서 타입은 값들의 집합이라고 했습니다. 이 관점으로 네 타입을 먼저 그려 봅니다.

```text
unknown = 전체집합 { 모든 값 }            ← 무엇이든 들어갈 수 있음
  ├─ string  = { '', '라테', ... }
  ├─ number  = { 0, 4500, ... }
  ├─ boolean = { true, false }
  ├─ undefined = { undefined }
  └─ ...
never   = 공집합 { }                       ← 값이 하나도 없음

any     = 집합 규칙 밖                       ← 타입 검사를 꺼 버림
void    = "반환값을 쓰지 말라"는 표시 (함수 반환 타입에 씀)
```

- `unknown`은 **모든 값을 담은 전체집합**입니다. 어떤 값이든 `unknown` 변수에 넣을 수 있습니다.
- `never`는 **값이 하나도 없는 공집합**입니다. 어떤 값도 `never` 변수에 넣을 수 없습니다.
- `any`는 집합이라기보다 **"이 값은 검사하지 마"라는 탈출구**입니다. 그래서 위험합니다.
- `void`는 주로 함수의 반환 타입에 쓰는 특별한 표시입니다.

하나씩 자세히 봅니다.

### 2단계: any — 타입 검사를 끄는 스위치

`any`는 "아무 타입이나 된다"는 뜻입니다. `any` 변수에는 무엇이든 넣을 수 있고, **무엇이든 꺼내 쓸 수 있습니다.** 컴파일러가 아무것도 검사하지 않기 때문입니다.

```ts
let product: any = { name: '아메리카노', price: 4500 }

product = 123 // 오류 없음
product = '라테' // 오류 없음

// 존재하지 않는 속성, 메서드도 오류 없이 통과
product.prcie.toFixed(0) // 오타(prcie)인데도 오류 없음
product() // 함수가 아닌데 호출해도 오류 없음
```

컴파일은 잘 되지만, 실행하면 바로 터집니다.

```text
TypeError: Cannot read properties of undefined (reading 'toFixed')
```

TypeScript를 쓰는 이유는 실행 전에 이런 실수를 잡기 위해서인데, `any`를 쓰면 그 혜택을 스스로 버리는 셈입니다.

### 3단계: any의 전염성

`any`가 정말 위험한 이유는 **한 곳에서 시작된 any가 다른 변수로 번진다**는 점입니다. 이것을 **전염성**이라고 부릅니다.

```ts
// JSON.parse는 반환 타입이 any입니다
const response = JSON.parse('{"orderNo":"A-1001","amount":9000}')

const amount = response.amount // 타입: any
const orderNo = response.orderNo // 타입: any
const upper = orderNo.toUpperCase() // 타입: any

function getOrder() {
  return JSON.parse('{"orderNo":"A-1001"}')
}
const order = getOrder() // 타입: any
```

해설:

- `JSON.parse`(JSON 문자열을 객체로 바꾸는 내장 함수)는 반환 타입이 `any`입니다. 어떤 문자열이 들어올지 TypeScript도 모르기 때문입니다.
- `response`가 `any`이니 `response.amount`도 `any`, 거기서 꺼낸 것도 `any`입니다.
- 이 값을 돌려주는 함수 `getOrder`의 반환 타입도 `any`가 됩니다. 그 함수를 쓰는 다른 파일까지 `any`가 퍼집니다.

결국 프로젝트 곳곳에 **검사받지 않는 값**이 퍼지고, 오타 하나가 실행 중 오류로 이어집니다.

::: danger any는 "최후의 수단"
- 새 코드에 `any`를 직접 쓰지 않는 것을 원칙으로 합니다.
- 어쩔 수 없이 `any`가 들어오는 곳(예: `JSON.parse`, 오래된 라이브러리)에서는 **바로 `unknown`이나 정확한 타입으로 바꿔서** 전염을 끊습니다.
- 팀 프로젝트에서는 ESLint 규칙(`@typescript-eslint/no-explicit-any`)으로 `any` 사용을 경고하기도 합니다. [ESLint와 Prettier](../part6-tooling/04-eslint-prettier)에서 다룹니다.
:::

### 4단계: 몰래 생기는 any (암묵적 any)

직접 쓰지 않아도 `any`가 생길 수 있습니다. 함수 매개변수에 타입을 빼먹을 때입니다. 이것을 **암묵적 any**(implicit any)라고 합니다.

```ts
function printProduct(product) {
  // ❌ Parameter 'product' implicitly has an 'any' type. (TS7006)
  console.log(product.name)
}
```

`strict` 모드(`noImplicitAny`)에서는 이렇게 오류로 알려 주므로 몰래 생기는 `any`를 막을 수 있습니다. 이것이 처음부터 `strict: true`로 공부하는 이유 중 하나입니다.

### 5단계: unknown — 안전한 "아무거나"

`unknown`도 `any`처럼 **어떤 값이든 받을 수 있습니다.** 차이는 **꺼내 쓸 때**입니다. `unknown` 값은 무엇인지 확인하기 전에는 아무것도 할 수 없습니다.

```ts
let input: unknown

input = 4500 // ✅ 아무 값이나 넣을 수 있음
input = '아메리카노' // ✅
input = { name: '라테' } // ✅

input.toUpperCase()
// ❌ 'input' is of type 'unknown'. (TS18046)

const price: number = input
// ❌ Type 'unknown' is not assignable to type 'number'. (TS2322)
```

집합으로 보면 이렇습니다.

- `unknown`은 전체집합이므로 **어떤 값이든 들어갈 수 있습니다.**
- 하지만 전체집합의 값을 `number` 집합에 넣을 수는 없습니다. 그 값이 숫자인지 문자열인지 모르기 때문입니다.

### 6단계: unknown을 확인해서 쓰기 (좁히기 맛보기)

`unknown`을 쓰려면 **조건문으로 무엇인지 확인**해야 합니다. 확인하는 순간 TypeScript는 그 블록 안에서 타입을 더 작은 집합으로 바꿔 줍니다. 이것을 **타입 좁히기**(narrowing)라고 하며 [08 레슨](./08-narrowing)에서 깊게 배웁니다.

```ts
function formatValue(value: unknown): string {
  if (typeof value === 'number') {
    // 이 블록 안에서 value는 number
    return value.toLocaleString('ko-KR') + '원'
  }
  if (typeof value === 'string') {
    // 이 블록 안에서 value는 string
    return value.trim()
  }
  return '알 수 없는 값'
}

console.log(formatValue(1234500))
// 출력: 1,234,500원
console.log(formatValue('  라테  '))
// 출력: 라테
console.log(formatValue(true))
// 출력: 알 수 없는 값
```

해설:

- `typeof value === 'number'`는 실행 중에 실제로 값을 검사합니다(JavaScript 문법입니다).
- TypeScript는 이 조건을 이해하고, `if` 블록 안에서는 `value`를 `number`로 취급합니다.
- 확인하지 않은 경로(마지막 `return`)에서는 여전히 `unknown`이므로 함부로 쓸 수 없습니다.

`any`와 비교하면 차이가 분명합니다.

| | `any` | `unknown` |
|---|---|---|
| 아무 값이나 넣기 | 가능 | 가능 |
| 확인 없이 속성·메서드 쓰기 | 가능 (위험) | **불가** (오류) |
| 다른 타입 변수에 넣기 | 가능 (위험) | **불가** (오류) |
| 전염성 | 있음 | 없음 |
| 언제 쓰나 | 거의 쓰지 않음 | 무엇이 올지 모르는 값을 받을 때 |

### 7단계: 실무에서 unknown을 만나는 곳 — catch와 JSON

**① catch 블록의 오류 변수**

`strict` 모드에서 `catch (err)`의 `err`는 `unknown`입니다(TypeScript 4.4부터 `useUnknownInCatchVariables` 옵션, `strict`에 포함). JavaScript에서는 `throw 'abc'`처럼 무엇이든 던질 수 있으므로, 받은 쪽에서는 무엇이 왔는지 알 수 없기 때문입니다.

```ts
function parseAmount(text: string): number {
  const n = Number(text)
  if (Number.isNaN(n)) {
    throw new Error(`금액 형식이 아닙니다: ${text}`)
  }
  return n
}

try {
  parseAmount('만 원')
} catch (err) {
  // err의 타입은 unknown
  if (err instanceof Error) {
    // 여기서는 Error 객체로 좁혀짐
    console.log(err.message)
  } else {
    console.log('알 수 없는 오류', err)
  }
}
// 출력: 금액 형식이 아닙니다: 만 원
```

`instanceof`는 "이 값이 이 클래스로 만든 객체인가"를 확인하는 연산자입니다. 확인 없이 `err.message`를 쓰면 오류가 납니다.

```ts
try {
  JSON.parse('{잘못된 JSON')
} catch (err) {
  console.log(err.message)
  // ❌ 'err' is of type 'unknown'. (TS18046)
}
```

**② JSON.parse 결과를 unknown으로 받기**

`JSON.parse`는 `any`를 돌려주지만, 받는 변수에 `unknown`을 표기하면 **전염을 그 자리에서 끊을 수 있습니다.**

```ts
const raw: unknown = JSON.parse('{"orderNo":"A-1001","amount":9000}')

// raw.amount  ← 확인 전에는 쓸 수 없음 (TS18046)
if (typeof raw === 'object' && raw !== null && 'amount' in raw) {
  console.log(raw.amount)
}
// 출력: 9000
```

조건이 길어 보이지만 하나씩 확인한 것입니다. "객체인가? null은 아닌가? `amount` 속성이 있나?" 이런 확인을 매번 손으로 쓰기는 번거로우므로, 실무에서는 [zod 같은 런타임 검증 도구](../part4-async/05-runtime-validation)를 씁니다.

### 8단계: void — "돌려주는 값이 없음"

`void`는 함수가 **의미 있는 값을 돌려주지 않을 때** 쓰는 반환 타입입니다. `return`이 없거나 `return;`만 있는 함수는 반환 타입이 `void`로 추론됩니다.

```ts
function printReceipt(orderNo: string, amount: number): void {
  console.log(`[영수증] ${orderNo} / ${amount.toLocaleString('ko-KR')}원`)
}

const result = printReceipt('A-1001', 9000) // 타입: void
// 출력: [영수증] A-1001 / 9,000원
```

`void` 함수의 결과는 쓰지 말라는 뜻이므로, 그 값을 조건문에 쓰면 오류가 납니다.

```ts
function printReceipt(orderNo: string): void {
  console.log(`[영수증] ${orderNo}`)
}

if (printReceipt('A-1001')) {
  // ❌ An expression of type 'void' cannot be tested for truthiness. (TS1345)
  console.log('출력 성공')
}
```

`void`로 표기한 함수에서 값을 돌려주면 오류입니다.

```ts
function saveOrder(orderNo: string): void {
  console.log(`${orderNo} 저장`)
  return true
  // ❌ Type 'boolean' is not assignable to type 'void'. (TS2322)
}
```

### 9단계: void와 undefined는 어떻게 다른가

실행하면 `void` 함수는 실제로 `undefined`를 돌려줍니다. 그러면 둘은 같을까요? 쓰임새가 다릅니다.

| | `void` | `undefined` |
|---|---|---|
| 뜻 | "반환값에 관심 두지 마" | "반환값은 정확히 `undefined`라는 값" |
| 주로 쓰는 곳 | 함수 반환 타입, 콜백 타입 | 변수·속성의 값, 반환 타입 |
| 값으로 쓰기 | 쓰지 않음(조건문에 쓰면 TS1345) | 일반 값처럼 비교·사용 가능 |

```ts
// 반환 타입 undefined: "undefined라는 값을 돌려준다"
function findCouponCode(memberId: string): string | undefined {
  if (memberId === 'M001') {
    return 'WELCOME10'
  }
  return undefined
}

const code = findCouponCode('M002') // 타입: string | undefined
if (code === undefined) {
  console.log('쿠폰 없음')
}
// 출력: 쿠폰 없음
```

여기서 `undefined`는 "쿠폰이 없다"는 **의미 있는 값**입니다. 받는 쪽이 이 값을 확인해서 쓰므로 `void`가 아니라 `undefined`가 알맞습니다.

::: info 반환 타입이 undefined인 함수 (TypeScript 5.1부터)
TypeScript 5.0까지는 반환 타입을 `undefined`로 표기하면 반드시 `return` 문을 써야 했습니다. TypeScript 5.1부터는 `return`이 없어도 됩니다. 이 위키의 기준 버전(5.6)에서는 둘 다 허용됩니다.
:::

**콜백의 void는 "무시한다"는 뜻**

함수 타입에서 반환 타입이 `void`이면 "돌려주는 값을 무시하겠다"는 뜻이라서, 값을 돌려주는 함수도 넘길 수 있습니다.

```ts
const productNames = ['아메리카노', '라테']
const copied: string[] = []

// forEach 콜백의 반환 타입은 void입니다.
// push는 숫자(새 길이)를 돌려주지만, 무시되므로 문제없습니다.
productNames.forEach((name) => copied.push(name))

console.log(copied)
// 출력: [ '아메리카노', '라테' ]
```

함수 타입은 [05 함수 타입](./05-function-types)에서 자세히 배웁니다.

### 10단계: never — 값이 하나도 없는 타입

`never`는 **공집합**입니다. 어떤 값도 `never` 타입에 속하지 않습니다. 직접 쓸 일은 드물지만 다음 세 곳에서 자주 만납니다.

**① 절대 정상적으로 끝나지 않는 함수의 반환 타입**

항상 오류를 던지는 함수는 값을 돌려주는 순간이 오지 않습니다. 그래서 반환 타입이 `never`입니다.

```ts
function fail(message: string): never {
  throw new Error(message)
}

function getStock(productId: string): number {
  if (productId === 'P001') {
    return 30
  }
  // fail은 never를 돌려주므로 이 뒤로는 실행이 이어지지 않음
  return fail(`없는 상품: ${productId}`)
}

console.log(getStock('P001'))
// 출력: 30
```

`return fail(...)`이 `number` 반환 함수에서 오류가 아닌 이유는 **공집합(never)은 모든 집합의 부분집합**이기 때문입니다. 값이 하나도 없으니 "number 집합에 들어가지 못하는 값"도 하나도 없습니다. 그래서 `never`는 어떤 타입에도 넣을 수 있습니다.

끝없이 반복하는 함수도 `never`입니다.

```ts
function runForever(): never {
  while (true) {
    // 매장 키오스크 화면을 계속 갱신하는 등, 끝나지 않는 작업
  }
}
```

**② 가능한 경우를 모두 확인하고 남은 자리**

조건문으로 가능성을 하나씩 지우다 보면 남는 것이 없는 자리가 생깁니다. 그곳의 타입이 `never`입니다.

```ts
function describe(value: string | number) {
  if (typeof value === 'string') {
    return '문자열'
  }
  if (typeof value === 'number') {
    return '숫자'
  }
  const rest = value // 타입: never
  return rest
}
```

`string`과 `number`를 모두 확인했으므로 마지막 줄에 올 수 있는 값은 없습니다. 이 성질을 이용해 "처리하지 않은 경우가 없는지" 검사하는 기법을 [Part 3 판별 유니온과 완전성 검사](../part3-intermediate/03-discriminated-union)에서 배웁니다.

**③ 불가능한 조합**

"문자열이면서 동시에 숫자인 값"은 없습니다. 이런 조합의 타입은 `never`가 됩니다.

```ts
type Impossible = string & number
// Impossible 위에 마우스를 올리면: type Impossible = never

let x: Impossible = 'a'
// ❌ Type 'string' is not assignable to type 'never'. (TS2322)
```

`&`(인터섹션)는 [Part 3](../part3-intermediate/01-intersection)에서 배웁니다. 지금은 "불가능한 타입은 `never`가 된다"만 기억하면 됩니다.

::: tip 오류 메시지에 never가 보이면
`Type 'X' is not assignable to type 'never'` 같은 메시지를 보면 "어딘가에서 타입이 **공집합으로 좁혀졌다**"는 신호입니다. 보통 조건문이 모든 경우를 이미 걸러 냈거나, 빈 배열·불가능한 조합의 타입이 원인입니다.
:::

### 11단계: 네 타입 한눈에 비교

| 타입 | 집합으로 보면 | 넣을 수 있는 값 | 꺼내 쓰기 | 주로 쓰는 곳 |
|---|---|---|---|---|
| `any` | 규칙 밖 | 전부 | 검사 없이 전부 | 쓰지 않는 것이 원칙 |
| `unknown` | 전체집합 | 전부 | 확인한 뒤에만 | 외부에서 들어온 값, `catch` |
| `void` | (반환 표시) | 반환하지 않음 | 쓰지 않음 | 반환값 없는 함수 |
| `never` | 공집합 | 없음 | — | 항상 throw하는 함수, 좁히기 끝 |

## 자주 하는 실수

### 실수 1: 오류를 없애려고 any를 쓰기

```ts
function getTotal(items: any) {
  return items.reduce((sum: any, item: any) => sum + item.pirce, 0)
}
```

왜 틀렸나: 오류는 사라졌지만 `item.pirce`(오타)를 아무도 잡지 못합니다. 결과는 `NaN`이 됩니다. 그리고 반환 타입까지 `any`로 번집니다.

고친 코드: 정확한 타입을 씁니다.

```ts
function getTotal(items: { name: string; price: number }[]): number {
  return items.reduce((sum, item) => sum + item.price, 0)
}

console.log(getTotal([{ name: '아메리카노', price: 4500 }, { name: '라테', price: 5000 }]))
// 출력: 9500
```

### 실수 2: catch의 err를 바로 Error처럼 쓰기

```ts
try {
  throw new Error('결제 실패')
} catch (err) {
  console.log(err.message)
  // ❌ 'err' is of type 'unknown'. (TS18046)
}
```

왜 틀렸나: `err`는 `unknown`입니다. 무엇이 던져졌는지 확인하지 않았습니다.

고친 코드:

```ts
try {
  throw new Error('결제 실패')
} catch (err) {
  const message = err instanceof Error ? err.message : String(err)
  console.log(message)
}
// 출력: 결제 실패
```

### 실수 3: void 함수의 결과를 값으로 쓰기

```ts
function logOrder(orderNo: string): void {
  console.log(orderNo)
}

const saved = logOrder('A-1001')
if (saved) {
  // ❌ An expression of type 'void' cannot be tested for truthiness. (TS1345)
  console.log('저장됨')
}
```

왜 틀렸나: `void`는 "결과를 쓰지 말라"는 뜻입니다. 성공 여부가 필요하다면 함수가 그 값을 돌려주도록 설계해야 합니다.

고친 코드:

```ts
function saveOrder(orderNo: string): boolean {
  console.log(`${orderNo} 저장`)
  return true
}

if (saveOrder('A-1001')) {
  console.log('저장됨')
}
// 출력: A-1001 저장
// 출력: 저장됨
```

### 실수 4: unknown을 확인 없이 다른 타입 변수에 넣기

```ts
const raw: unknown = JSON.parse('"4500"')
const price: number = raw
// ❌ Type 'unknown' is not assignable to type 'number'. (TS2322)
```

왜 틀렸나: `raw`는 전체집합의 값이므로 숫자라는 보장이 없습니다. 실제로 위 JSON은 문자열 `"4500"`입니다.

고친 코드:

```ts
const raw: unknown = JSON.parse('"4500"')
const price = typeof raw === 'number' ? raw : Number(raw)
console.log(price + 500)
// 출력: 5000
```

## 직접 해 보기

### 문제 1 ⭐ 어떤 타입일까

각 함수의 반환 타입을 추론해 보고, 마우스를 올려 확인하세요.

```ts
function a() {
  console.log('주문 접수')
}
function b(): never {
  throw new Error('재고 없음')
}
function c(flag: boolean) {
  if (flag) {
    return '쿠폰'
  }
  return undefined
}
```

::: details 정답 보기
- `a`: `void` — `return`이 없습니다.
- `b`: `never` — 항상 오류를 던집니다. (표기를 지우면 `void`로 추론됩니다. 함수 선언문은 `never`를 스스로 추론하지 않으므로 필요하면 직접 표기합니다.)
- `c`: `"쿠폰" | undefined` — `'쿠폰'` 또는 `undefined`를 돌려줍니다.
:::

### 문제 2 ⭐ any를 unknown으로 바꾸기

다음 함수의 `any`를 `unknown`으로 바꾸고, 생기는 오류를 `typeof` 확인으로 해결하세요. 문자열이면 앞뒤 공백을 지운 값을, 아니면 빈 문자열을 돌려줍니다.

```ts
function cleanName(value: any): string {
  return value.trim()
}
```

::: details 정답 보기
`unknown`으로 바꾸면 `value.trim()`에서 `'value' is of type 'unknown'. (TS18046)` 오류가 납니다.

```ts
function cleanName(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim()
  }
  return ''
}

console.log(`[${cleanName('  김민지 ')}]`)
// 출력: [김민지]
console.log(`[${cleanName(1234)}]`)
// 출력: []
```
:::

### 문제 3 ⭐⭐ 오류 메시지 안전하게 꺼내기

`catch`에서 받은 값이 무엇이든 사람이 읽을 수 있는 문자열을 돌려주는 함수 `toErrorMessage(err: unknown): string`을 만드세요.

- `Error` 객체면 `message`
- 문자열이면 그 문자열
- 그 밖에는 `'알 수 없는 오류'`

::: details 정답 보기
```ts
function toErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    return err.message
  }
  if (typeof err === 'string') {
    return err
  }
  return '알 수 없는 오류'
}

console.log(toErrorMessage(new Error('카드 승인 거절')))
// 출력: 카드 승인 거절
console.log(toErrorMessage('네트워크 끊김'))
// 출력: 네트워크 끊김
console.log(toErrorMessage(404))
// 출력: 알 수 없는 오류
```

이 함수는 실무에서도 거의 그대로 씁니다. `catch` 블록마다 `toErrorMessage(err)`로 메시지를 꺼내면 됩니다.
:::

### 문제 4 ⭐⭐ void와 undefined 고르기

다음 두 함수의 반환 타입으로 `void`와 `string | undefined` 중 알맞은 것을 고르고 이유를 쓰세요.

1. 주문 번호를 받아 콘솔에 영수증을 찍는 `printReceipt`
2. 회원 ID를 받아 등록된 전화번호를 찾아 돌려주고, 없으면 `undefined`를 돌려주는 `findPhone`

::: details 정답 보기
1. `void` — 출력만 하고 받는 쪽이 쓸 값이 없습니다.
2. `string | undefined` — "없음"을 뜻하는 `undefined`도 받는 쪽이 확인해서 쓰는 **의미 있는 값**입니다.

```ts
function printReceipt(orderNo: string): void {
  console.log(`[영수증] ${orderNo}`)
}

const phones: Record<string, string> = { M001: '010-1234-5678' }
function findPhone(memberId: string): string | undefined {
  return phones[memberId]
}

printReceipt('A-1001')
console.log(findPhone('M001'))
console.log(findPhone('M999'))
// 출력: [영수증] A-1001
// 출력: 010-1234-5678
// 출력: undefined
```

`Record<string, string>`은 "문자열 키에 문자열 값"인 객체 타입입니다. [객체 타입](./04-object-types)과 [유틸리티 타입](../part3-intermediate/07-utility-types)에서 배웁니다.
:::

### 문제 5 ⭐⭐⭐ never로 "도달할 수 없음" 표시하기

주문 상태를 받아 한글 이름을 돌려주는 함수입니다. 마지막 줄의 `status` 타입이 무엇인지 확인하고, 그 자리에서 `fail` 함수를 불러 "있을 수 없는 상태"를 표시하세요.

```ts
function fail(message: string): never {
  throw new Error(message)
}

function getStatusLabel(status: 'READY' | 'PAID') {
  if (status === 'READY') {
    return '결제 대기'
  }
  if (status === 'PAID') {
    return '결제 완료'
  }
  // 여기
}
```

::: details 정답 보기
`READY`와 `PAID`를 모두 확인했으므로 마지막 줄의 `status` 타입은 `never`입니다.

```ts
function fail(message: string): never {
  throw new Error(message)
}

function getStatusLabel(status: 'READY' | 'PAID'): string {
  if (status === 'READY') {
    return '결제 대기'
  }
  if (status === 'PAID') {
    return '결제 완료'
  }
  const unexpected = status // 타입: never
  return fail(`있을 수 없는 상태: ${unexpected}`)
}

console.log(getStatusLabel('PAID'))
// 출력: 결제 완료
```

나중에 상태에 `'CANCELED'`를 추가하고 `if`를 깜빡하면 `unexpected`의 타입이 `"CANCELED"`가 됩니다. 이 차이를 이용해 컴파일러가 빠진 경우를 알려 주게 만드는 방법을 [Part 3-3](../part3-intermediate/03-discriminated-union)에서 배웁니다.
:::

## 확인 퀴즈

1. `any`와 `unknown`은 둘 다 아무 값이나 받습니다. 결정적인 차이는 무엇인가요?
2. "any의 전염성"이란 무엇인가요? 예를 하나 드세요.
3. strict 모드에서 `catch (err)`의 `err` 타입은 무엇인가요?
4. 집합으로 볼 때 `never`는 무엇이고, 왜 어떤 타입에도 넣을 수 있나요?
5. 항상 `throw`만 하는 함수의 알맞은 반환 타입은 무엇인가요?

::: details 정답 보기
1. `unknown`은 **확인하기 전에는 쓸 수 없고**, `any`는 확인 없이 아무렇게나 쓸 수 있습니다(검사가 꺼짐).
2. `any` 값에서 꺼낸 속성, 그 값을 돌려주는 함수의 결과 등이 모두 `any`가 되어 퍼지는 성질입니다. 예: `JSON.parse(...)`의 결과에서 꺼낸 `response.amount`도 `any`.
3. `unknown`입니다(`useUnknownInCatchVariables`, TypeScript 4.4부터 strict에 포함).
4. 공집합입니다. 값이 하나도 없으므로 "다른 집합에 들어가지 못하는 값"도 없어서, 모든 집합의 부분집합이 됩니다.
5. `never`입니다.
:::

## 정리

- `any`는 타입 검사를 끄는 탈출구이며, 한 번 생기면 다른 값으로 **전염**됩니다. 새 코드에서는 쓰지 않습니다.
- `unknown`은 **전체집합**입니다. 아무 값이나 받지만, `typeof`·`instanceof` 등으로 **확인한 뒤에만** 쓸 수 있습니다.
- `catch`의 오류 변수와 `JSON.parse` 결과처럼 "무엇이 올지 모르는 값"은 `unknown`으로 받습니다.
- `void`는 "반환값을 쓰지 말라", `undefined`는 "반환값이 `undefined`라는 의미 있는 값"입니다.
- `never`는 **공집합**입니다. 항상 throw하는 함수, 모든 경우를 걸러 낸 자리, 불가능한 조합에서 나타납니다.

## 다음 단계

[배열 타입과 튜플](./03-arrays-tuples) — 여러 값을 담는 배열에 타입을 붙이는 두 가지 문법, 읽기 전용 배열, 자리마다 타입이 정해진 튜플, 그리고 `as const`를 배웁니다.
