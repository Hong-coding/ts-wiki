---
title: strict 옵션 하나씩 이해하기
---

# strict 옵션 하나씩 이해하기

<LessonMeta level="실전" :minutes="50" prev="tsconfig.json의 구조와 옵션 카테고리, 상황별 추천 설정" />

## 이번에 배울 것

- `strict: true`가 한 번에 켜는 옵션 9개의 이름과 역할을 말할 수 있다.
- 각 옵션이 꺼져 있을 때 **컴파일은 통과하지만 실행 중에 터지는 코드**를 알아볼 수 있다.
- 켰을 때 나오는 에러(TS7006, TS18048, TS2564 등)를 읽고 올바르게 고칠 수 있다.
- `strict` 밖의 추가 권장 옵션 4개(`noUncheckedIndexedAccess` 등)를 언제 켜는지 판단할 수 있다.
- 기존 프로젝트에서 엄격 옵션을 하나씩 켜 나가는 순서를 세울 수 있다.

## 먼저 알아 둘 것

- [tsconfig.json 완전 정복](./01-tsconfig) — `compilerOptions`, `--showConfig`
- [특수 타입: any · unknown · never · void](../part2-types/02-special-types)
- [타입 좁히기(Narrowing)](../part2-types/08-narrowing)
- [클래스: 접근 제어자 · 추상 클래스 · implements](../part3-intermediate/08-classes)

이 레슨의 모든 예제는 TypeScript 5.6.3으로 **옵션을 끈 상태와 켠 상태 양쪽을 실제로 컴파일**하고, 끈 상태의 결과 JS를 `node`(24.13.1)로 실행해 확인했습니다. 직접 따라 할 때는 아래처럼 실행하면 됩니다.

```powershell
# 끈 상태 (TypeScript 5.x 기본값)
npx tsc --noEmit --target es2022 example.ts

# 켠 상태
npx tsc --noEmit --strict --target es2022 example.ts
```

::: info TypeScript 6.0부터는 strict가 기본으로 켜집니다
작성 시점(2026-10)에 확인한 결과, 6.0.3·7.0.2는 옵션을 아무것도 주지 않아도 `strict`가 켜진 상태로 검사합니다. 6.0 이상으로 "꺼진 상태"를 재현하려면 `--strict false`를 붙이세요. 그래도 `tsconfig.json`에는 `"strict": true`를 **항상 명시**하는 것을 권장합니다([01 레슨](./01-tsconfig#ts6-changes) 참고).
:::

## 비유로 이해하기

매장 출입구에 보안 검색대가 있다고 해 봅시다. 검색대에는 금속 탐지, 가방 검사, 신분증 확인 같은 **검사 항목 스위치**가 여러 개 붙어 있습니다.

- `strict: true`는 "**기본 검사 전부 켜기**" 큰 스위치입니다.
- 큰 스위치를 켜도 개별 스위치를 하나씩 끌 수 있습니다(`"strict": true, "strictPropertyInitialization": false`).
- 스위치를 끄면 손님이 빨리 들어오지만(에러가 덜 나지만), 위험한 물건(버그)도 그대로 통과합니다. 그 버그는 **매장 안에서**, 즉 실행 중에 사고를 냅니다.

이 레슨은 스위치를 하나씩 꺼 보고 "무엇이 통과해 버리는지", 다시 켜서 "무엇이 걸리는지"를 확인합니다.

## 개념 설명

### strict가 켜는 옵션 한눈에 보기

| 옵션 | 한 줄 요약 | 대표 에러 | 도입 |
|---|---|---|---|
| `noImplicitAny` | 타입을 알 수 없으면 `any`로 넘어가지 말고 에러 | TS7006 | 1.0 |
| `strictNullChecks` | `null`·`undefined`를 다른 타입과 따로 취급 | TS18048, TS2322 | 2.0 |
| `strictFunctionTypes` | 함수 매개변수 타입을 엄격히 비교 | TS2322 | 2.6 |
| `strictBindCallApply` | `call`·`bind`·`apply`의 인수도 검사 | TS2345 | 3.2 |
| `strictPropertyInitialization` | 클래스 속성이 생성자에서 반드시 값을 받게 함 | TS2564 | 2.7 |
| `noImplicitThis` | 타입을 알 수 없는 `this` 금지 | TS2683 | 2.0 |
| `useUnknownInCatchVariables` | `catch (err)`의 `err`을 `unknown`으로 | TS18046 | 4.4 |
| `alwaysStrict` | 모든 파일을 JS 엄격 모드로 검사하고 `"use strict"` 출력 | TS1212 등 | 2.1 |
| `strictBuiltinIteratorReturn` | 내장 반복자의 끝 값(`return`)을 `undefined`로 정확히 표시 | TS2322 | **5.6** |

`strict`에 포함되는 옵션은 TypeScript 버전이 올라가며 **늘어납니다.** 그래서 TypeScript를 올리면 `strict: true` 프로젝트에서 새 에러가 생길 수 있습니다. 대부분 진짜 버그를 알려 주는 것이니 반가운 일입니다.

`npx tsc --showConfig`를 실행하면 내 프로젝트에서 실제로 켜진 옵션 목록이 펼쳐져 보입니다.

### 1. noImplicitAny — 모르면 any로 넘기지 않기

**암시적 any**(implicit any)란 내가 `any`라고 쓰지 않았는데 TypeScript가 타입을 알 수 없어서 몰래 `any`로 처리하는 것입니다. `any`는 "검사하지 않음"이라는 뜻이므로, 그 변수와 관련된 실수를 전혀 잡지 못합니다.

```ts
// ⚠️ 꺼져 있으면 통과
function applyDiscount(price, rate) {
  return price - price * rate
}
console.log(applyDiscount('5000', 0.1))
// 출력: 4500
```

문자열 `'5000'`을 넘겼는데 우연히 `-`·`*` 연산이 문자열을 숫자로 바꿔 줘서 맞는 답이 나왔습니다. 만약 함수가 `price + 500`이었다면 `'5000500'`이 나왔을 것입니다. **우연히 맞는 코드**가 가장 위험합니다.

```ts
// ✅ 켜져 있으면
function applyDiscount(price, rate) {
  // ❌ Parameter 'price' implicitly has an 'any' type. (TS7006)
  // ❌ Parameter 'rate' implicitly has an 'any' type. (TS7006)
  return price - price * rate
}
```

고친 코드:

```ts
function applyDiscount(price: number, rate: number): number {
  return price - price * rate
}
console.log(applyDiscount(5000, 0.1))
// 출력: 4500
```

::: tip 직접 any라고 쓰는 것은 막지 않습니다
`noImplicitAny`는 **몰래 생기는** any만 막습니다. `price: any`라고 직접 쓰면 통과합니다. 직접 쓰는 `any`까지 줄이려면 ESLint의 `@typescript-eslint/no-explicit-any` 규칙을 씁니다([04 레슨](./04-eslint-prettier)).
:::

### 2. strictNullChecks — "값이 없을 수도 있음"을 잊지 않기

이 옵션이 꺼져 있으면 `null`과 `undefined`가 **모든 타입에 몰래 들어갈 수 있습니다.** `string` 변수에 `null`을 넣어도, `find`가 아무것도 못 찾아 `undefined`를 돌려줘도 TypeScript는 모른 척합니다.

```ts
// ⚠️ 꺼져 있으면 통과
interface Member {
  id: string
  name: string
}
const members: Member[] = [{ id: 'M001', name: '김민지' }]
const found = members.find((m) => m.id === 'M999')
console.log(found.name)
```

```text
TypeError: Cannot read properties of undefined (reading 'name')
```

`find`는 못 찾으면 `undefined`를 돌려줍니다. 꺼진 상태에서는 `found`의 타입이 그냥 `Member`라서 경고가 없습니다.

```ts
// ✅ 켜져 있으면 found의 타입은 Member | undefined
console.log(found.name)
// ❌ 'found' is possibly 'undefined'. (TS18048)
```

고친 코드: 좁히기로 "없는 경우"를 먼저 처리합니다.

```ts
const found = members.find((m) => m.id === 'M999')
if (found) {
  console.log(found.name)
} else {
  console.log('회원 없음')
}
// 출력: 회원 없음

// 또는 옵셔널 체이닝(?.)과 기본값(??)
console.log(found?.name ?? '회원 없음')
// 출력: 회원 없음
```

`strict` 옵션 가운데 **가장 많은 버그를 잡는 옵션**입니다. 이 옵션 하나 때문에라도 `strict`는 반드시 켭니다.

### 3. strictFunctionTypes — 함수 바꿔치기 막기

함수를 다른 함수 타입 변수에 넣을 때, **매개변수가 더 좁은 함수**를 넣으면 안 됩니다. "커피만 처리할 줄 아는 함수"를 "아무 상품이나 처리하는 함수" 자리에 넣으면, 나중에 머핀이 들어왔을 때 터집니다.

```ts
// ⚠️ 꺼져 있으면 통과
interface Product {
  name: string
}
interface Coffee extends Product {
  shot: number
}
function printCoffee(c: Coffee) {
  console.log(c.name, c.shot.toFixed(0))
}
let printProduct: (p: Product) => void = printCoffee
printProduct({ name: '머핀' })
```

```text
TypeError: Cannot read properties of undefined (reading 'toFixed')
```

```ts
// ✅ 켜져 있으면
let printProduct: (p: Product) => void = printCoffee
// ❌ Type '(c: Coffee) => void' is not assignable to type '(p: Product) => void'.
//      Types of parameters 'c' and 'p' are incompatible.
//        Property 'shot' is missing in type 'Product' but required in type 'Coffee'. (TS2322)
```

고친 코드: 넣을 함수가 받아야 할 타입(`Product`)을 그대로 받게 만듭니다.

```ts
function printAny(p: Product) {
  console.log(p.name)
}
let printProduct: (p: Product) => void = printAny
printProduct({ name: '머핀' })
// 출력: 머핀
```

이런 규칙을 **반공변성**(contravariance)이라고 부릅니다. 원리는 [변성(공변·반공변)](../part5-advanced/07-variance) 레슨에서 자세히 다룹니다.

::: info 메서드 문법은 예외입니다
`interface A { handle(p: Product): void }`처럼 **메서드 문법**으로 쓴 타입은 이 옵션이 켜져 있어도 느슨하게 비교됩니다(배열 같은 내장 타입과의 호환성 때문). 엄격한 검사를 원하면 `handle: (p: Product) => void`처럼 **속성 + 화살표 함수 문법**으로 씁니다.
:::

### 4. strictBindCallApply — call·bind·apply도 검사하기

`call`·`apply`·`bind`는 함수를 "다른 방식으로 부르는" 내장 메서드입니다. 꺼져 있으면 이 경로로 넘긴 인수는 검사하지 않습니다.

```ts
// ⚠️ 꺼져 있으면 통과
function addPoint(current: number, point: number) {
  return current + point
}
const total = addPoint.call(undefined, 1000, '100')
console.log(total)
// 출력: 1000100
```

숫자 덧셈을 기대했는데 문자열 이어 붙이기가 되어 `1000100`이 나왔습니다. 포인트가 1,100점이 아니라 100만 점이 된 셈입니다.

```ts
// ✅ 켜져 있으면
const total = addPoint.call(undefined, 1000, '100')
// ❌ Argument of type 'string' is not assignable to parameter of type 'number'. (TS2345)
```

고친 코드: 인수 타입을 맞추거나, 굳이 `call`이 필요 없으면 바로 호출합니다.

```ts
const total = addPoint(1000, 100)
console.log(total)
// 출력: 1100
```

### 5. strictPropertyInitialization — 빈 속성 남기지 않기

클래스에 속성을 선언만 하고 생성자(constructor, `new`로 객체를 만들 때 실행되는 함수)에서 값을 넣지 않으면, 그 속성은 `undefined`인 채로 남습니다.

```ts
// ⚠️ 꺼져 있으면 통과
class Order {
  orderNo: string
  total: number
  constructor(total: number) {
    this.total = total
  }
}
const o = new Order(9500)
console.log(o.orderNo.toUpperCase())
```

```text
TypeError: Cannot read properties of undefined (reading 'toUpperCase')
```

```ts
// ✅ 켜져 있으면
class Order {
  orderNo: string
  // ❌ Property 'orderNo' has no initializer and is not definitely assigned in the constructor. (TS2564)
  total: number
  constructor(total: number) {
    this.total = total
  }
}
```

고치는 방법은 세 가지입니다. 위에서부터 먼저 고려합니다.

```ts
class Order {
  orderNo: string // ① 생성자에서 값을 넣는다
  total: number
  status = 'READY' // ② 선언과 동시에 초깃값을 준다
  memo?: string // ③ 정말 없을 수도 있다면 선택 속성(?)으로
  constructor(orderNo: string, total: number) {
    this.orderNo = orderNo
    this.total = total
  }
}
const o = new Order('ord-20261026-001', 9500)
console.log(o.orderNo.toUpperCase(), o.status)
// 출력: ORD-20261026-001 READY
```

`orderNo!: string`처럼 **확정 할당 단언**(`!`, "값은 내가 책임지고 넣는다"는 약속)으로 에러를 끌 수도 있지만, 프레임워크가 대신 값을 넣어 주는 경우(예: ORM, 의존성 주입)에만 씁니다. 이 옵션은 `strictNullChecks`가 켜져 있어야 동작합니다.

### 6. noImplicitThis — 타입 모르는 this 금지

`this`는 "이 함수를 부른 객체"를 가리킵니다. 일반 `function`의 `this`는 **부르는 방법에 따라 바뀌므로**, 함수만 따로 떼어 부르면 엉뚱한 것을 가리킵니다.

```ts
// ⚠️ 꺼져 있으면 통과
function getStoreName() {
  return this.name
}
const store = { name: '강남점', getStoreName }
console.log(store.getStoreName())
// 출력: 강남점

const fn = store.getStoreName
console.log(fn())
// 출력: undefined
```

메서드를 변수에 꺼내 부르는 순간 `this`가 매장 객체가 아니게 되어 `undefined`가 나왔습니다(JS 엄격 모드에서는 아예 `TypeError`가 납니다).

```ts
// ✅ 켜져 있으면
function getStoreName() {
  return this.name
  // ❌ 'this' implicitly has type 'any' because it does not have a type annotation. (TS2683)
}
```

고친 코드: 첫 번째 매개변수 자리에 `this`의 타입을 적습니다. 실제 매개변수가 아니라 **타입 검사용 표시**이며 결과 JS에서는 사라집니다.

```ts
interface Store {
  name: string
}
function getStoreName(this: Store) {
  return this.name
}
const store = { name: '강남점', getStoreName }
console.log(store.getStoreName())
// 출력: 강남점

const fn = store.getStoreName
fn()
// ❌ The 'this' context of type 'void' is not assignable to method's 'this' of type 'Store'. (TS2684)
```

이제 떼어 부르는 실수까지 컴파일 단계에서 잡힙니다.

### 7. useUnknownInCatchVariables — catch의 err은 unknown

`throw`는 `Error` 객체만 던지는 것이 아닙니다. 문자열·숫자·아무 값이나 던질 수 있습니다. 그런데 꺼져 있으면 `catch (err)`의 `err`이 `any`라서 `err.message`를 마음대로 씁니다.

```ts
// ⚠️ 꺼져 있으면 통과 (err: any)
function parsePrice(text: string) {
  try {
    return JSON.parse(text)
  } catch (err) {
    console.log(err.message.toUpperCase())
  }
}
parsePrice('{bad')
```

이번에는 `JSON.parse`가 진짜 `Error`를 던져서 우연히 동작합니다. 하지만 어떤 라이브러리가 `throw '네트워크 오류'`처럼 문자열을 던지면 `err.message`가 `undefined`라서 `catch` 블록 **안에서** 또 에러가 터집니다.

```ts
// ✅ 켜져 있으면 (err: unknown)
console.log(err.message.toUpperCase())
// ❌ 'err' is of type 'unknown'. (TS18046)
```

고친 코드: `instanceof`로 좁힌 뒤 씁니다.

```ts
function parsePrice(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch (err) {
    if (err instanceof Error) {
      console.log('파싱 실패:', err.message)
    } else {
      console.log('알 수 없는 오류:', err)
    }
    return null
  }
}
parsePrice('{bad')
// 출력: 파싱 실패: Expected property name or '}' in JSON at position 1 (line 1 column 2)
```

(에러 문구는 Node 버전에 따라 조금 다를 수 있습니다. 위는 Node 24.13.1 결과입니다.) `unknown`은 [특수 타입](../part2-types/02-special-types), `try/catch`는 [오류 처리](../part1-basics/11-errors)에서 배웠습니다.

### 8. alwaysStrict — JavaScript 엄격 모드

JavaScript에도 **엄격 모드**(strict mode)가 있습니다. 파일 맨 위에 `"use strict"`를 쓰면 옛날 JS의 위험한 문법 몇 가지가 금지됩니다. `alwaysStrict`는 모든 파일을 엄격 모드 규칙으로 검사하고, 결과 JS 맨 위에 `"use strict"`를 넣어 줍니다.

```ts
// ⚠️ 꺼져 있으면 통과 (import/export가 없는 스크립트 파일)
var package = '포장 주문'
console.log(package)
// 출력: 포장 주문
```

`package`는 엄격 모드에서 **예약어**(reserved word, 언어가 나중을 위해 찜해 둔 단어)라 변수 이름으로 쓸 수 없습니다. 이 파일을 나중에 ES 모듈로 바꾸거나 다른 엄격 모드 코드에 합치면 그때 문법 에러가 납니다.

```ts
// ✅ 켜져 있으면
var package = '포장 주문'
// ❌ Identifier expected. 'package' is a reserved word in strict mode. (TS1212)
```

고친 코드: 다른 이름을 씁니다.

```ts
const packageOrder = '포장 주문'
console.log(packageOrder)
// 출력: 포장 주문
```

`import`/`export`가 있는 **ES 모듈 파일은 원래 항상 엄격 모드**입니다. 그래서 요즘 프로젝트에서는 이 옵션 때문에 에러를 볼 일이 드뭅니다.

### 9. strictBuiltinIteratorReturn — 반복자의 끝 값 (TypeScript 5.6+)

**반복자**(iterator)는 `next()`를 부를 때마다 값을 하나씩 꺼내 주는 객체입니다. `for...of`가 내부에서 쓰는 장치입니다. 값이 다 떨어지면 `{ done: true, value: undefined }`를 돌려줍니다. 5.6 이전에는 이 "끝났을 때의 `value`" 타입이 `any`여서 검사가 빠졌습니다.

```ts
// ⚠️ 꺼져 있으면 통과
const it = ['P001'][Symbol.iterator]()
it.next()
const result = it.next() // 이미 다 꺼냈으므로 { done: true, value: undefined }
const code: string = result.value
console.log(code.toUpperCase())
```

```text
TypeError: Cannot read properties of undefined (reading 'toUpperCase')
```

```ts
// ✅ 켜져 있으면 result.value의 타입은 string | undefined
const code: string = result.value
// ❌ Type 'string | undefined' is not assignable to type 'string'.
//      Type 'undefined' is not assignable to type 'string'. (TS2322)
```

고친 코드: `done`을 먼저 확인합니다.

```ts
const it = ['P001'][Symbol.iterator]()
const result = it.next()
if (!result.done) {
  const code: string = result.value
  console.log(code.toUpperCase())
}
// 출력: P001
```

`next()`를 직접 부르는 코드는 드물고, 보통은 `for...of`를 쓰면 이런 걱정이 없습니다. TypeScript 5.6부터 `strict`에 포함되었기 때문에 **5.5 이하에서 5.6 이상으로 올릴 때** 새 에러로 나타날 수 있습니다. (`--strict --strictBuiltinIteratorReturn false`로 이 옵션만 끄면 위 에러가 사라지는 것도 확인했습니다.)

### strict 밖의 추가 권장 옵션

아래 옵션은 `strict: true`에 **포함되지 않으므로** 따로 켭니다. 이 절의 예제는 모두 `--strict`만 켰을 때는 통과하고, 해당 옵션을 더 켜면 에러가 나는 것을 확인했습니다.

#### noUncheckedIndexedAccess (4.1+) — 인덱스 접근 결과에 undefined 더하기

```ts
const prices: Record<string, number> = { P001: 4500, P002: 5000 }
const codes = ['P001', 'P002']

const third = codes[2] // strict만: string / 이 옵션: string | undefined
console.log(third.toLowerCase())
// ❌ (켰을 때) 'third' is possibly 'undefined'. (TS18048)

const p = prices['P999'] // strict만: number / 이 옵션: number | undefined
console.log(p.toFixed(0))
// ❌ (켰을 때) 'p' is possibly 'undefined'. (TS18048)
```

`strict`만 켜면 `codes[2]`의 타입이 `string`이라 통과하지만, 실행하면 `TypeError: Cannot read properties of undefined (reading 'toLowerCase')`가 납니다. 배열 길이와 객체 키는 컴파일러가 알 수 없으므로 이 옵션이 "없을 수도 있다"고 표시해 줍니다. `for...of`나 `map`으로 도는 경우에는 `undefined`가 붙지 않아서 생각보다 귀찮지 않습니다.

#### exactOptionalPropertyTypes (4.4+) — "없음"과 "undefined 들어 있음"을 구분

```ts
interface MemberForm {
  name: string
  phone?: string
}
const form: MemberForm = { name: '김민지', phone: undefined }
// ❌ (켰을 때) Type '{ name: string; phone: undefined; }' is not assignable to type 'MemberForm' with 'exactOptionalPropertyTypes: true'. Consider adding 'undefined' to the types of the target's properties. (TS2375)
console.log('phone' in form)
// 출력: true
```

`phone?`은 "속성이 **없을 수** 있다"는 뜻인데, 꺼져 있으면 "속성이 있고 값이 `undefined`"도 허용합니다. 둘은 `'phone' in form`, `Object.keys`의 결과가 다릅니다. 서버에 "전화번호 지우기"와 "전화번호 안 건드리기"를 구분해 보내야 하는 API라면 이 차이가 버그가 됩니다. 정말 `undefined`를 넣고 싶다면 `phone?: string | undefined`로 명시합니다. 외부 라이브러리 타입과 충돌하는 일이 있어 **새 프로젝트에서 켜는 것**을 권합니다.

#### noImplicitOverride (4.3+) — 덮어쓸 때 override 필수

```ts
class PaymentBase {
  pay(amount: number) {
    return `결제 ${amount}원`
  }
}
class CardPayment extends PaymentBase {
  pay(amount: number) {
    // ❌ (켰을 때) This member must have an 'override' modifier because it overrides a member in the base class 'PaymentBase'. (TS4114)
    return `카드 결제 ${amount}원`
  }
}
console.log(new CardPayment().pay(9500))
// 출력: 카드 결제 9500원
```

고친 코드: `override pay(amount: number)`라고 씁니다. 이 옵션의 진짜 가치는 **부모 메서드 이름이 바뀔 때** 드러납니다. 부모의 `pay`를 `requestPay`로 바꾸면, `override`가 붙은 자식 메서드는 "덮어쓸 대상이 없다"는 에러가 나서 바로 알 수 있습니다. 옵션이 없으면 자식의 `pay`는 아무도 부르지 않는 메서드로 조용히 남습니다.

#### noFallthroughCasesInSwitch (1.8+) — break 빠뜨림 막기

```ts
function statusLabel(status: string) {
  let label = ''
  switch (status) {
    case 'PAID':
      // ❌ (켰을 때) Fallthrough case in switch. (TS7029)
      label = '결제 완료'
    case 'CANCELED':
      label = '취소'
      break
    default:
      label = '대기'
  }
  return label
}
console.log(statusLabel('PAID'))
// 출력: 취소
```

`'PAID'`에 `break`가 없어서 아래 `'CANCELED'`까지 흘러 내려가(fall through) "결제 완료"가 "취소"로 덮였습니다. 결제한 주문이 취소로 보이는 심각한 버그입니다. `break` 또는 `return`을 넣으면 해결됩니다.

### 기존 프로젝트에 strict를 켜는 순서

새 프로젝트는 처음부터 전부 켜면 됩니다. 이미 코드가 많은 프로젝트에서 `strict: true`를 켜면 에러가 수백 개 나올 수 있습니다. 이럴 때는 **큰 스위치를 켜고, 에러가 많은 개별 스위치를 잠시 끈 뒤 하나씩 다시 켭니다.**

```json
{
  "compilerOptions": {
    "strict": true,
    // 아래는 고치는 대로 하나씩 지워 나갑니다
    "strictNullChecks": false,
    "strictPropertyInitialization": false
  }
}
```

권장 순서는 대략 이렇습니다.

1. `noImplicitAny` — 매개변수 타입만 채우면 되므로 기계적으로 고치기 쉽습니다.
2. `strictBindCallApply`, `noImplicitThis`, `alwaysStrict`, `useUnknownInCatchVariables` — 보통 에러가 적습니다.
3. `strictFunctionTypes` — 콜백 타입 설계를 손봐야 할 때가 있습니다.
4. `strictNullChecks` — 에러가 가장 많지만 가장 많은 버그를 잡습니다. 폴더 단위로 나누어 진행합니다.
5. `strictPropertyInitialization` — `strictNullChecks` 다음에 켭니다.

자세한 전환 전략은 [07 마이그레이션](./07-migration)에서 다룹니다.

공식 문서: [TSConfig Reference — strict](https://www.typescriptlang.org/tsconfig/#strict)

## 자주 하는 실수

### 실수 1: 에러를 없애려고 any나 !를 남발하기

```ts
const found = members.find((m) => m.id === memberId)!
console.log(found.name)
```

왜 틀렸나: `!`(non-null 단언)는 "절대 `undefined`가 아니다"라고 컴파일러를 **속이는** 문법입니다. 에러는 사라지지만, 회원이 없으면 실행 중에 똑같이 터집니다. `strictNullChecks`를 켠 의미가 없어집니다.

고친 코드:

```ts
const found = members.find((m) => m.id === memberId)
if (!found) {
  throw new Error(`회원을 찾을 수 없습니다: ${memberId}`)
}
console.log(found.name) // 여기서는 Member로 좁혀짐
```

### 실수 2: strict를 켜고 개별 옵션을 꺼 둔 채 잊어버리기

```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": false
  }
}
```

왜 틀렸나: 이 설정은 "`strict`인 것처럼 보이지만 가장 중요한 검사가 빠진" 상태입니다. 새로 들어온 팀원은 `strict: true`만 보고 안심합니다.

고친 코드: 임시로 끈 옵션에는 이유와 이슈 번호를 주석으로 남기고, 다 고치면 줄을 지웁니다.

```json
{
  "compilerOptions": {
    "strict": true,
    // 임시: 주문 모듈 null 처리 정리 후 제거 (이슈 #123)
    "strictNullChecks": false
  }
}
```

### 실수 3: catch의 err을 any로 적어 버리기

```ts
try {
  JSON.parse(text)
} catch (err: any) {
  console.log(err.message)
}
```

왜 틀렸나: `err: any`라고 직접 써서 `useUnknownInCatchVariables`를 우회했습니다. 문자열이 던져지면 `err.message`는 `undefined`가 됩니다.

고친 코드:

```ts
try {
  JSON.parse(text)
} catch (err) {
  const message = err instanceof Error ? err.message : String(err)
  console.log(message)
}
```

### 실수 4: 생성자 대신 메서드에서 초기화하고 !로 덮기

```ts
class Cart {
  items!: string[]
  init() {
    this.items = []
  }
}
const cart = new Cart()
cart.items.push('P001') // init()을 안 불렀으므로 TypeError
```

왜 틀렸나: `!`로 TS2564를 껐지만, `init()`을 부르기 전에 `items`를 쓰면 `undefined`입니다.

고친 코드:

```ts
class Cart {
  items: string[] = []
}
const cart = new Cart()
cart.items.push('P001')
console.log(cart.items)
// 출력: [ 'P001' ]
```

## 직접 해 보기

### 문제 1 ⭐ 어떤 옵션의 에러일까

다음 에러는 각각 어떤 옵션이 켜져서 나온 것일까요?

```text
(가) Parameter 'qty' implicitly has an 'any' type. (TS7006)
(나) 'order' is possibly 'undefined'. (TS18048)
(다) Property 'createdAt' has no initializer and is not definitely assigned in the constructor. (TS2564)
(라) 'e' is of type 'unknown'. (TS18046)
```

::: details 정답 보기
- (가) `noImplicitAny`
- (나) `strictNullChecks` (배열·객체 인덱스 접근 결과를 담은 변수였다면 `noUncheckedIndexedAccess`일 수도 있습니다)
- (다) `strictPropertyInitialization`
- (라) `useUnknownInCatchVariables`
:::

### 문제 2 ⭐ null 처리 고치기

`strict`를 켰더니 에러가 났습니다. `!`를 쓰지 말고 고치세요. 쿠폰이 없으면 할인 0원입니다.

```ts
interface Coupon {
  code: string
  amount: number
}
const coupons: Coupon[] = [{ code: 'WELCOME', amount: 3000 }]

function discountOf(code: string): number {
  const coupon = coupons.find((c) => c.code === code)
  return coupon.amount
  // ❌ 'coupon' is possibly 'undefined'. (TS18048)
}
```

::: details 정답 보기
```ts
interface Coupon {
  code: string
  amount: number
}
const coupons: Coupon[] = [{ code: 'WELCOME', amount: 3000 }]

function discountOf(code: string): number {
  const coupon = coupons.find((c) => c.code === code)
  return coupon?.amount ?? 0
}

console.log(discountOf('WELCOME'), discountOf('NONE'))
// 출력: 3000 0
```
:::

### 문제 3 ⭐⭐ 클래스 속성 초기화

다음 클래스를 `strictPropertyInitialization` 에러 없이 고치세요. `pointRate`는 기본 0.01, `grade`는 생성자로 받고, `lastVisit`은 처음엔 없을 수 있습니다.

```ts
class Member {
  name: string
  grade: string
  pointRate: number
  lastVisit: Date
  constructor(name: string, grade: string) {
    this.name = name
  }
}
```

::: details 정답 보기
```ts
class Member {
  name: string
  grade: string
  pointRate = 0.01
  lastVisit?: Date
  constructor(name: string, grade: string) {
    this.name = name
    this.grade = grade
  }
}

const m = new Member('김민지', 'VIP')
console.log(m.grade, m.pointRate, m.lastVisit)
// 출력: VIP 0.01 undefined
```
:::

### 문제 4 ⭐⭐ 추가 옵션 효과 예측

`strict`만 켠 상태와, `noUncheckedIndexedAccess`까지 켠 상태에서 아래 코드는 각각 컴파일될까요? 실행하면 어떻게 될까요?

```ts
const stock: Record<string, number> = { P001: 30 }
const left = stock['P002'] - 1
console.log(left)
```

::: details 정답 보기
- `strict`만: `stock['P002']`의 타입이 `number`라 컴파일 통과. 실행하면 `undefined - 1`이라서 `NaN`이 출력됩니다. 에러도 안 나고 조용히 틀린 값이 나오는 가장 나쁜 경우입니다.
- `noUncheckedIndexedAccess` 추가: 타입이 `number | undefined`라서 `Object is possibly 'undefined'.`(TS2532) 에러가 납니다. 변수에 담지 않고 바로 쓰면 문구가 "Object is..."로 나옵니다. `(stock['P002'] ?? 0) - 1`처럼 고칩니다.
:::

### 문제 5 ⭐⭐⭐ switch 버그 찾기

`noFallthroughCasesInSwitch`가 꺼진 프로젝트입니다. 아래 함수에서 `'VIP'` 회원의 적립률은 얼마로 계산될까요? 옵션을 켜면 어디서 에러가 날까요? 고친 코드도 쓰세요.

```ts
function pointRate(grade: string): number {
  let rate = 0
  switch (grade) {
    case 'VIP':
      rate = 0.05
    case 'GOLD':
      rate = 0.03
      break
    default:
      rate = 0.01
  }
  return rate
}
```

::: details 정답 보기
`'VIP'`도 `'GOLD'`로 흘러 내려가 `0.03`이 됩니다. 옵션을 켜면 `case 'VIP':` 줄에서 `Fallthrough case in switch.`(TS7029)가 납니다.

```ts
function pointRate(grade: string): number {
  switch (grade) {
    case 'VIP':
      return 0.05
    case 'GOLD':
      return 0.03
    default:
      return 0.01
  }
}

console.log(pointRate('VIP'), pointRate('GOLD'), pointRate('SILVER'))
// 출력: 0.05 0.03 0.01
```

각 `case`에서 바로 `return`하면 `break`를 빠뜨릴 걱정이 없습니다.
:::

## 확인 퀴즈

1. `strict: true`를 켠 상태에서 `strictNullChecks`만 끌 수 있을까요?
2. `noImplicitAny`가 켜져 있어도 `price: any`라고 직접 쓰면 에러가 날까요?
3. `strictBuiltinIteratorReturn`은 몇 버전부터 `strict`에 들어갔을까요? 그 사실이 버전 업그레이드 때 왜 중요할까요?
4. `noUncheckedIndexedAccess`는 `strict`에 포함될까요?
5. `catch (err)`에서 `err`이 `unknown`인 이유를 한 문장으로 말해 보세요.

::: details 정답 보기
1. 네. `"strict": true, "strictNullChecks": false`처럼 개별 옵션이 우선합니다.
2. 아니요. 몰래 생기는 any만 막습니다. 직접 쓴 any는 ESLint 규칙으로 막습니다.
3. TypeScript 5.6부터입니다. `strict`의 범위가 넓어지므로 5.5 이하에서 올리면 코드 변경 없이도 새 에러가 생길 수 있습니다.
4. 아니요. 따로 켜야 합니다(`exactOptionalPropertyTypes`, `noImplicitOverride`, `noFallthroughCasesInSwitch`도 마찬가지).
5. JavaScript는 `Error`가 아닌 아무 값이나 `throw` 할 수 있어서, 확인하기 전에는 무엇이 들어 있는지 알 수 없기 때문입니다.
:::

## 정리

- `strict: true`는 9개 옵션(`noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, `noImplicitThis`, `useUnknownInCatchVariables`, `alwaysStrict`, `strictBuiltinIteratorReturn`)을 한 번에 켭니다.
- 꺼져 있으면 **컴파일은 통과하고 실행 중에 터지는** 코드가 생깁니다. 특히 `strictNullChecks`가 가장 많은 버그를 잡습니다.
- 에러를 `any`나 `!`로 덮지 말고, 좁히기·초깃값·`instanceof`로 진짜로 고칩니다.
- `strict`에 포함되는 옵션은 버전마다 늘어납니다(5.6에 `strictBuiltinIteratorReturn` 추가).
- `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noFallthroughCasesInSwitch`는 따로 켜는 추가 권장 옵션입니다.
- 기존 프로젝트는 `strict`를 켜고 개별 옵션을 잠시 끈 뒤, 하나씩 다시 켭니다.

## 다음 단계

[모듈 시스템: ESM · CommonJS · moduleResolution](./03-module-systems) — `require`와 `import`가 왜 둘 다 있는지, `.js` 확장자를 왜 붙여야 하는지, `module`·`moduleResolution`을 어떻게 고르는지 에러를 직접 재현하며 배웁니다.
