---
title: 타입 좁히기(Narrowing)
---

# 타입 좁히기(Narrowing)

<LessonMeta level="초급" :minutes="60" prev="타입 별칭(type)과 인터페이스(interface)의 차이와 선택 기준" />

## 이번에 배울 것

- **타입 좁히기**를 "큰 집합을 조건문으로 잘라 작은 집합으로 만드는 일"로 설명할 수 있다.
- `typeof`, 참·거짓 검사(truthiness), `===`, `in`, `instanceof`, `Array.isArray`로 타입을 좁힐 수 있다.
- TypeScript의 **제어 흐름 분석**을 이해하고, **일찍 반환하기**(early return)로 코드를 평평하게 만들 수 있다.
- 좁히기가 **풀리는 경우**(콜백 안 등)를 알아보고 고칠 수 있다.

## 먼저 알아 둘 것

- [조건문: if · switch · 삼항 연산자](../part1-basics/04-conditionals)
- [특수 타입](./02-special-types) — `unknown`을 확인해서 쓰기
- [유니온 타입과 리터럴 타입](./06-union-literal) — 공통 멤버만 바로 쓸 수 있다
- [타입 별칭과 인터페이스](./07-type-alias-interface)

## 비유로 이해하기

택배 분류 센터를 떠올려 보세요. 컨베이어 벨트에 **온갖 상자**가 섞여 들어옵니다(유니온 타입). 상자를 그냥 열어서 처리할 수는 없습니다. 냉동식품인지, 유리 제품인지, 서류인지에 따라 다루는 법이 다르니까요.

그래서 벨트 중간중간에 **검사대**가 있습니다.

- 첫 번째 검사대: "차가운가?" → 냉동 라인으로 보냄
- 두 번째 검사대: "'깨지기 쉬움' 스티커가 있나?" → 유리 라인으로 보냄
- 남은 상자는 일반 라인으로

각 라인에 도착한 직원은 **자기 라인에 온 상자가 무엇인지 확실히** 압니다. 냉동 라인 직원은 의심 없이 냉동실에 넣습니다. 이것이 **타입 좁히기**입니다. 조건문(검사대)을 통과할 때마다 "이 값이 무엇일 수 있는가"의 범위가 줄어들고, TypeScript는 그 범위를 줄곧 따라가며 기억합니다.

## 개념 설명

### 1단계: 좁히기란 무엇인가

[06 레슨](./06-union-literal)에서 유니온 타입의 값은 **공통 멤버만** 바로 쓸 수 있다고 했습니다. 공통이 아닌 멤버를 쓰려면 **확인**해야 합니다.

```ts
function formatOrderKey(key: string | number): string {
  // 여기서 key는 string | number
  if (typeof key === 'string') {
    // 여기서 key는 string
    return key.toUpperCase()
  }
  // 여기서 key는 number
  return `#${key.toFixed(0)}`
}

console.log(formatOrderKey('a-1001'), formatOrderKey(1001))
// 출력: A-1001 #1001
```

**타입 좁히기**(narrowing)는 조건문으로 값을 확인해 **더 작은 타입(부분집합)으로 줄이는 것**입니다.

```text
string | number          ← 처음 (합집합)
   │
   ├─ typeof key === 'string' 이 참  →  string  (문자열 집합만 남음)
   └─ 거짓                           →  number  (나머지)
```

중요한 점은 `else`를 쓰지 않았는데도 `if` 블록 아래에서 `key`가 `number`로 좁혀졌다는 것입니다. `if` 안에서 `return`했으므로 **문자열은 아래로 내려올 수 없다**는 것을 TypeScript가 알아낸 것입니다. 이렇게 코드의 흐름(조건, `return`, `throw` 등)을 따라가며 타입을 계산하는 것을 **제어 흐름 분석**(control flow analysis)이라고 합니다.

::: tip 마우스로 확인하기
좁히기를 배울 때는 **같은 변수 위에 줄마다 마우스를 올려 보세요.** `if` 위, `if` 안, `if` 아래에서 같은 `key`의 타입이 바뀌어 보입니다.
:::

### 2단계: typeof로 좁히기

`typeof 값`은 JavaScript 연산자로, 실행 중에 값의 종류를 문자열로 알려 줍니다.

| `typeof` 결과 | 좁혀지는 타입 |
|---|---|
| `'string'` | `string` |
| `'number'` | `number` |
| `'boolean'` | `boolean` |
| `'undefined'` | `undefined` |
| `'function'` | 함수 타입 |
| `'object'` | 객체, 배열, **그리고 `null`** |
| `'bigint'`, `'symbol'` | `bigint`, `symbol` |

```ts
function toAmount(input: string | number | boolean): number {
  if (typeof input === 'number') {
    return input
  }
  if (typeof input === 'string') {
    return Number(input.replaceAll(',', ''))
  }
  // 여기서 input은 boolean
  return input ? 1 : 0
}

console.log(toAmount(4500), toAmount('12,000'), toAmount(true))
// 출력: 4500 12000 1
```

::: warning typeof null === 'object'
JavaScript의 오래된 실수 때문에 `typeof null`은 `'object'`입니다. 그래서 `typeof x === 'object'`로 확인해도 `null`이 남습니다. TypeScript도 이것을 정확히 반영합니다.

```ts
function getKeys(data: object | null): string[] {
  if (typeof data === 'object') {
    return Object.keys(data)
    // ❌ No overload matches this call. (TS2769)
  }
  return []
}
```

`Object.keys`에 `null`을 넘길 수 없다는 오류입니다. `typeof` 검사 뒤에도 `data`가 `object | null`이기 때문입니다. `data !== null` 검사를 추가해야 합니다.
:::

### 3단계: 참·거짓 검사로 좁히기 (truthiness)

`if (값)`처럼 값을 그대로 조건에 쓰면, JavaScript는 값을 참·거짓으로 바꿔 판단합니다. 다음 값들은 **거짓 같은 값**(falsy)입니다.

```text
false, 0, -0, 0n, NaN, '' (빈 문자열), null, undefined
```

나머지는 모두 **참 같은 값**(truthy)입니다. TypeScript는 `if (값)` 안에서 `null`과 `undefined`를 제거해 줍니다.

```ts
function getMemo(memo: string | undefined): string {
  if (memo) {
    // 여기서 memo는 string
    return `메모: ${memo}`
  }
  return '메모 없음'
}

console.log(getMemo('얼음 적게'), getMemo(undefined))
// 출력: 메모: 얼음 적게 메모 없음
```

간편하지만 **함정**이 있습니다. `0`과 `''`(빈 문자열)도 거짓으로 취급됩니다.

```ts
function printStock(stock: number | undefined) {
  if (stock) {
    console.log(`재고 ${stock}개`)
  } else {
    console.log('재고 정보 없음')
  }
}

printStock(5)
// 출력: 재고 5개
printStock(0) // 재고가 0개인 것도 "정보 없음"으로 처리됨!
// 출력: 재고 정보 없음
```

재고 `0`은 의미 있는 값인데 "정보 없음"으로 처리되는 버그입니다. **숫자나 문자열이 들어 있는 유니온은 `!== undefined`나 `!= null`로 명확하게 확인**하세요.

```ts
function printStock(stock: number | undefined) {
  if (stock !== undefined) {
    console.log(`재고 ${stock}개`)
  } else {
    console.log('재고 정보 없음')
  }
}

printStock(0)
// 출력: 재고 0개
```

### 4단계: 같음 비교(===, !==)로 좁히기

특정 값과 같은지 비교하면 그 값의 타입으로 좁혀집니다. 리터럴 유니온에서 특히 유용합니다.

```ts
type OrderStatus = 'READY' | 'PAID' | 'CANCELED'

function canRefund(status: OrderStatus): boolean {
  if (status === 'CANCELED') {
    // 여기서 status는 "CANCELED"
    return false
  }
  // 여기서 status는 "READY" | "PAID"
  return status === 'PAID'
}

console.log(canRefund('PAID'), canRefund('CANCELED'))
// 출력: true false
```

`null`과 `undefined`를 한 번에 거를 때는 **느슨한 비교 `!= null`** 을 쓰기도 합니다. `== null`은 `null`과 `undefined` **둘 다**에 참이 되는 JavaScript 규칙 때문입니다.

```ts
function getPhoneTail(phone: string | null | undefined): string {
  if (phone != null) {
    // 여기서 phone은 string
    return phone.slice(-4)
  }
  return '----'
}

console.log(getPhoneTail('010-1234-5678'), getPhoneTail(null), getPhoneTail(undefined))
// 출력: 5678 ---- ----
```

::: info == 는 쓰지 말라고 배웠는데요?
[연산자 레슨](../part1-basics/03-operators)에서 `==` 대신 `===`를 쓰라고 배웠습니다. 맞습니다. 다만 **`x != null` 한 가지 경우만큼은** "null과 undefined를 함께 거른다"는 뜻이 분명해서 많은 팀이 예외로 허용합니다. 팀 규칙에 따르세요.
:::

`switch` 문도 같은 원리로 좁혀집니다.

```ts
type PayMethod = 'CARD' | 'CASH' | 'PAY'

function getFee(method: PayMethod, amount: number): number {
  switch (method) {
    case 'CARD':
      return Math.round(amount * 0.015)
    case 'PAY':
      return Math.round(amount * 0.01)
    case 'CASH':
      return 0
  }
}

console.log(getFee('CARD', 10000), getFee('CASH', 10000))
// 출력: 150 0
```

`switch`가 세 경우를 모두 처리했으므로 함수 끝에 `return`이 없어도 오류가 나지 않습니다. TypeScript가 "모든 경우를 다 처리했다"는 것을 알기 때문입니다.

### 5단계: in으로 좁히기

`'속성이름' in 객체`는 객체에 그 속성이 있는지 확인하는 JavaScript 연산자입니다. **객체 유니온에서 한쪽에만 있는 속성**으로 구분할 때 씁니다.

```ts
type DineIn = { tableNo: number; guestCount: number }
type TakeOut = { pickupTime: string }

function describeOrder(order: DineIn | TakeOut): string {
  if ('tableNo' in order) {
    // 여기서 order는 DineIn
    return `${order.tableNo}번 테이블 ${order.guestCount}명`
  }
  // 여기서 order는 TakeOut
  return `${order.pickupTime} 픽업`
}

console.log(describeOrder({ tableNo: 3, guestCount: 2 }))
// 출력: 3번 테이블 2명
console.log(describeOrder({ pickupTime: '14:30' }))
// 출력: 14:30 픽업
```

::: tip 판별 유니온이 더 좋은 경우가 많습니다
`in`은 편리하지만, 타입을 설계할 수 있는 상황이라면 각 객체에 `kind: 'DINE_IN'`, `kind: 'TAKE_OUT'` 같은 **공통 판별 속성**을 두고 `===`로 구분하는 편이 더 명확합니다. 이것이 **판별 유니온**이며, 처리하지 않은 경우를 컴파일러가 찾아 주는 **완전성 검사**까지 할 수 있습니다. [Part 3 판별 유니온과 완전성 검사](../part3-intermediate/03-discriminated-union)에서 자세히 배웁니다.
:::

### 6단계: instanceof로 좁히기

`값 instanceof 클래스`는 값이 그 클래스(또는 생성자 함수)로 만들어졌는지 확인합니다. `Date`, `Error`처럼 **클래스로 만든 객체**를 구분할 때 씁니다.

```ts
function formatDate(input: Date | string): string {
  if (input instanceof Date) {
    // 여기서 input은 Date
    return input.toISOString().slice(0, 10)
  }
  // 여기서 input은 string
  return input.slice(0, 10)
}

console.log(formatDate(new Date('2026-10-26T09:00:00Z')), formatDate('2026-12-25 10:00'))
// 출력: 2026-10-26 2026-12-25
```

실무에서 가장 많이 보는 곳은 `catch` 블록입니다. [02 레슨](./02-special-types)에서 본 것처럼 `catch (err)`의 `err`는 `unknown`입니다.

```ts
function parseOrderJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch (err) {
    if (err instanceof Error) {
      // 여기서 err는 Error
      console.log('파싱 실패:', err.message)
    }
    return null
  }
}

parseOrderJson('{ 잘못된 JSON')
// 출력: 파싱 실패: Expected property name or '}' in JSON at position 2 (line 1 column 3)
```

오류 메시지 문구는 Node.js 버전에 따라 조금 다를 수 있습니다(위 출력은 작성 시점 Node.js 24 기준).

::: warning instanceof는 타입 별칭·인터페이스에는 못 씁니다
`instanceof`는 **실행 중에 존재하는 클래스**를 확인합니다. `type`이나 `interface`는 컴파일하면 사라지므로 `order instanceof Order`처럼 쓸 수 없습니다. 객체 타입은 `in`이나 판별 속성으로 구분합니다.
:::

### 7단계: Array.isArray로 좁히기

배열은 `typeof`로 확인하면 `'object'`가 나와서 구분할 수 없습니다. **`Array.isArray`** 를 씁니다.

```ts
function toCodeList(input: string | string[]): string[] {
  if (Array.isArray(input)) {
    // 여기서 input은 string[]
    return input
  }
  // 여기서 input은 string
  return input.split(',')
}

console.log(toCodeList(['P001', 'P002']), toCodeList('P003,P004'))
// 출력: [ 'P001', 'P002' ] [ 'P003', 'P004' ]
```

[05 레슨](./05-function-types)의 오버로드 예제에서도 `Array.isArray`로 좁혔습니다.

### 8단계: 일찍 반환하기(early return)로 좁히기

좁히기는 `if` 블록 **안**에서만 일어나는 것이 아닙니다. `return`이나 `throw`로 함수를 빠져나가면, 그 **아래 코드 전체**가 좁혀진 타입을 씁니다. 이것을 활용하면 중첩이 깊은 코드를 평평하게 만들 수 있습니다.

```ts
type Member = { name: string; phone?: string; point?: number }

// 중첩이 깊은 버전
function sendPointSmsNested(member: Member | undefined): string {
  if (member !== undefined) {
    if (member.phone !== undefined) {
      if (member.point !== undefined) {
        return `${member.phone}: ${member.name}님 ${member.point}P`
      }
    }
  }
  return '발송 불가'
}

// 일찍 반환하는 버전
function sendPointSms(member: Member | undefined): string {
  if (member === undefined) return '발송 불가'
  if (member.phone === undefined) return '발송 불가'
  if (member.point === undefined) return '발송 불가'
  // 여기서 member는 Member, phone과 point는 string, number
  return `${member.phone}: ${member.name}님 ${member.point}P`
}

const m = { name: '김민지', phone: '010-1234-5678', point: 1200 }
console.log(sendPointSmsNested(m) === sendPointSms(m), sendPointSms(undefined))
// 출력: true 발송 불가
```

"안 되는 경우를 먼저 걸러 내고, 남은 코드는 정상 경우만 다룬다"는 이 스타일을 **가드 절**(guard clause)이라고도 합니다. 실무에서 아주 많이 씁니다.

`throw`도 똑같이 동작합니다.

```ts
function getRequiredEnv(value: string | undefined, name: string): string {
  if (value === undefined) {
    throw new Error(`환경 변수 ${name}가 없습니다`)
  }
  return value // 여기서 value는 string
}

console.log(getRequiredEnv('S01', 'STORE_CODE'))
// 출력: S01
```

### 9단계: 대입으로 좁히기

`let` 변수에 값을 넣으면 그 순간 타입이 넣은 값 쪽으로 좁혀집니다.

```ts
let discount: number | string = '10%'
// 여기서 discount는 string
console.log(discount.endsWith('%'))
// 출력: true

discount = 1000
// 여기서 discount는 number
console.log(discount.toFixed(0))
// 출력: 1000
```

선언한 타입(`number | string`)은 그대로이고, **지금 이 줄에서 들어 있는 값의 타입**만 좁혀서 기억하는 것입니다.

### 10단계: 좁히기가 풀리는 경우 — 콜백 안

좁히기는 "지금 이 흐름에서 확실한 것"만 기억합니다. 그래서 **나중에 실행될 수 있는 콜백 함수 안**에서는 좁히기가 풀리는 경우가 있습니다.

```ts
type Order = { orderNo: string; memo?: string }

function printMemos(order: Order, itemNames: string[]) {
  if (order.memo !== undefined) {
    itemNames.forEach((name) => {
      console.log(`${name}: ${order.memo.trim()}`)
      // ❌ 'order.memo' is possibly 'undefined'. (TS18048)
    })
  }
}
```

`if`로 확인했는데도 오류가 납니다. 왜일까요? 콜백은 **언제 실행될지** TypeScript가 알 수 없습니다. 그 사이에 누군가 `order.memo = undefined`로 바꿀 수도 있습니다. 객체의 속성은 바뀔 수 있으므로, TypeScript는 콜백 안에서 속성에 대한 좁히기를 믿지 않습니다.

해결책은 **확인한 값을 `const` 변수에 담는 것**입니다. `const`는 다시 바뀔 수 없으므로 콜백 안에서도 좁히기가 유지됩니다.

```ts
type Order = { orderNo: string; memo?: string }

function printMemos(order: Order, itemNames: string[]) {
  const memo = order.memo
  if (memo !== undefined) {
    itemNames.forEach((name) => {
      console.log(`${name}: ${memo.trim()}`) // ✅ memo는 string
    })
  }
}

printMemos({ orderNo: 'A-1001', memo: ' 얼음 적게 ' }, ['아메리카노', '카페라테'])
// 출력: 아메리카노: 얼음 적게
// 출력: 카페라테: 얼음 적게
```

`let` 변수도 **콜백을 만든 뒤에 다시 대입하는 코드가 있으면** 좁히기가 풀립니다.

```ts
function printFirst(names: string[]) {
  let first: string | undefined = names[0]
  if (first !== undefined) {
    names.forEach(() => console.log(first.length))
    // ❌ 'first' is possibly 'undefined'. (TS18048)
  }
  first = undefined // 아래에서 다시 대입함
}
```

::: info TypeScript 5.4부터 좋아졌습니다
TypeScript 5.3까지는 `let` 변수나 함수 매개변수를 확인한 뒤 콜백 안에서 쓰면 **항상** 좁히기가 풀렸습니다. TypeScript 5.4부터는 "**마지막 대입 이후에** 만든 콜백"이라면 좁히기를 유지합니다. 위 예제처럼 콜백 뒤에 대입이 있으면 여전히 풀립니다. 객체 속성(`order.memo`)은 5.4 이후에도 풀리므로 `const`에 담는 습관이 가장 확실합니다.
:::

### 11단계: filter와 좁히기

배열에서 `undefined`를 걸러 낼 때도 좁히기가 쓰입니다.

```ts
const stocks = [10, undefined, 0, 25] // 타입: (number | undefined)[]

const known = stocks.filter((s) => s !== undefined) // 타입: number[]
console.log(known)
// 출력: [ 10, 0, 25 ]
```

`known`이 `number[]`로 좁혀진 것은 **TypeScript 5.5부터**입니다. 5.5부터는 `(s) => s !== undefined` 같은 단순한 화살표 함수를 보고 "이 함수는 `s`가 `number`인지 검사하는 함수"라고 **스스로 추론**합니다. 5.4 이하에서는 `(number | undefined)[]`로 남아서, 직접 **타입 가드 함수**(`s is number`)를 써야 했습니다. 타입 가드를 직접 만드는 법은 [Part 5 사용자 정의 타입 가드](../part5-advanced/06-type-guards-satisfies)에서 배웁니다.

::: warning filter(Boolean)은 좁혀지지 않습니다
흔히 쓰는 `stocks.filter(Boolean)`은 5.6에서도 `(number | undefined)[]`로 남습니다. 게다가 재고 `0`까지 걸러 버립니다(3단계의 truthiness 함정). `undefined`만 거르려면 `s !== undefined`를 명확히 쓰세요.
:::

## 자주 하는 실수

### 실수 1: typeof로 null을 거른 줄 알기

```ts
type Coupon = { code: string; amount: number }

function getCouponAmount(coupon: Coupon | null): number {
  if (typeof coupon === 'object') {
    return coupon.amount
    // ❌ 'coupon' is possibly 'null'. (TS18047)
  }
  return 0
}
```

왜 틀렸나: `typeof null === 'object'`이므로 `null`이 걸러지지 않았습니다.

고친 코드:

```ts
type Coupon = { code: string; amount: number }

function getCouponAmount(coupon: Coupon | null): number {
  if (coupon === null) return 0
  return coupon.amount
}

console.log(getCouponAmount({ code: 'W1000', amount: 1000 }), getCouponAmount(null))
// 출력: 1000 0
```

### 실수 2: 0이나 빈 문자열을 truthiness로 거르기

```ts
function formatPoint(point: number | undefined): string {
  if (!point) return '포인트 정보 없음'
  return `${point}P`
}

console.log(formatPoint(0)) // 0P여야 하는데...
// 출력: 포인트 정보 없음
```

왜 틀렸나: `0`은 거짓 같은 값이라 `!point`가 참이 됩니다. 컴파일 오류가 나지 않으므로 더 위험합니다.

고친 코드:

```ts
function formatPoint(point: number | undefined): string {
  if (point === undefined) return '포인트 정보 없음'
  return `${point}P`
}

console.log(formatPoint(0))
// 출력: 0P
```

### 실수 3: 콜백 안에서 속성 좁히기를 기대하기

```ts
type Cart = { couponCode?: string; items: string[] }

function logCart(cart: Cart) {
  if (cart.couponCode) {
    cart.items.map((item) => `${item}(${cart.couponCode.toUpperCase()})`)
    // ❌ 'cart.couponCode' is possibly 'undefined'. (TS18048)
  }
}
```

왜 틀렸나: 객체 속성의 좁히기는 콜백 안까지 이어지지 않습니다.

고친 코드: `const`에 담아서 좁힙니다.

```ts
type Cart = { couponCode?: string; items: string[] }

function logCart(cart: Cart): string[] {
  const code = cart.couponCode
  if (!code) return cart.items
  return cart.items.map((item) => `${item}(${code.toUpperCase()})`)
}

console.log(logCart({ couponCode: 'xmas', items: ['라테'] }))
// 출력: [ '라테(XMAS)' ]
```

### 실수 4: 인터페이스에 instanceof 쓰기

```ts
interface Product {
  code: string
}

function isProduct(value: unknown) {
  return value instanceof Product
  // ❌ 'Product' only refers to a type, but is being used as a value here. (TS2693)
}
```

왜 틀렸나: `interface`는 컴파일하면 사라지는 타입일 뿐, 실행 중에 존재하는 값(클래스)이 아닙니다.

고친 코드: 속성을 직접 확인합니다.

```ts
interface Product {
  code: string
}

function isProduct(value: unknown): boolean {
  return typeof value === 'object' && value !== null && 'code' in value && typeof value.code === 'string'
}

console.log(isProduct({ code: 'P001' }), isProduct('P001'))
// 출력: true false
```

이런 확인을 매번 쓰기는 번거롭기 때문에 실무에서는 [zod 같은 런타임 검증 도구](../part4-async/05-runtime-validation)를 씁니다.

## 직접 해 보기

### 문제 1 ⭐ typeof로 좁히기

`input`이 숫자면 그대로, 문자열이면 숫자로 바꿔, `undefined`면 `0`을 돌려주는 `toQuantity` 함수를 작성하세요.

```ts
// 문제: 함수 몸통을 완성하세요
function toQuantity(input: number | string | undefined): number {
  return 0
}
```

::: details 정답 보기
```ts
function toQuantity(input: number | string | undefined): number {
  if (typeof input === 'number') return input
  if (typeof input === 'string') return Number(input)
  return 0
}

console.log(toQuantity(3), toQuantity('5'), toQuantity(undefined))
// 출력: 3 5 0
```
:::

### 문제 2 ⭐ in으로 좁히기

다음 두 타입을 받아 표시용 문자열을 만드는 `describeMember` 함수를 작성하세요. 개인 회원은 `"김민지(개인)"`, 법인 회원은 `"아스커피(법인, 123-45-67890)"` 형태입니다.

```ts
type PersonalMember = { name: string; birthDate: string }
type CorporateMember = { name: string; businessNo: string }
```

::: details 정답 보기
```ts
type PersonalMember = { name: string; birthDate: string }
type CorporateMember = { name: string; businessNo: string }

function describeMember(member: PersonalMember | CorporateMember): string {
  if ('businessNo' in member) {
    return `${member.name}(법인, ${member.businessNo})`
  }
  return `${member.name}(개인)`
}

console.log(describeMember({ name: '김민지', birthDate: '1995-03-01' }))
// 출력: 김민지(개인)
console.log(describeMember({ name: '아스커피', businessNo: '123-45-67890' }))
// 출력: 아스커피(법인, 123-45-67890)
```
:::

### 문제 3 ⭐⭐ 일찍 반환하기로 고치기

다음 함수를 **일찍 반환하기** 스타일로 바꾸세요. 동작은 같아야 합니다.

```ts
// 문제: 중첩을 없애세요
type Order = { orderNo: string; amount?: number; status: 'READY' | 'PAID' | 'CANCELED' }

function getReceiptText(order: Order | undefined): string {
  if (order) {
    if (order.status === 'PAID') {
      if (order.amount !== undefined) {
        return `${order.orderNo} ${order.amount}원 결제 완료`
      } else {
        return '금액 정보 없음'
      }
    } else {
      return '결제되지 않은 주문'
    }
  } else {
    return '주문 없음'
  }
}
```

::: details 정답 보기
```ts
type Order = { orderNo: string; amount?: number; status: 'READY' | 'PAID' | 'CANCELED' }

function getReceiptText(order: Order | undefined): string {
  if (!order) return '주문 없음'
  if (order.status !== 'PAID') return '결제되지 않은 주문'
  if (order.amount === undefined) return '금액 정보 없음'
  return `${order.orderNo} ${order.amount}원 결제 완료`
}

console.log(getReceiptText({ orderNo: 'A-1001', amount: 9000, status: 'PAID' }))
// 출력: A-1001 9000원 결제 완료
console.log(getReceiptText({ orderNo: 'A-1002', status: 'READY' }))
// 출력: 결제되지 않은 주문
```

`order`는 객체 또는 `undefined`이므로 `!order`(truthiness)로 걸러도 안전합니다. 객체는 항상 참 같은 값이기 때문입니다.
:::

### 문제 4 ⭐⭐ 오류 메시지 꺼내기

`catch`에서 받은 `err`(타입 `unknown`)를 받아, `Error`면 `message`를, 문자열이면 그 문자열을, 그 외에는 `'알 수 없는 오류'`를 돌려주는 `getErrorMessage` 함수를 작성하세요.

::: details 정답 보기
```ts
function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  return '알 수 없는 오류'
}

console.log(getErrorMessage(new Error('재고 부족')), getErrorMessage('네트워크 끊김'), getErrorMessage(404))
// 출력: 재고 부족 네트워크 끊김 알 수 없는 오류
```
:::

### 문제 5 ⭐⭐⭐ 좁히기가 풀리는 이유 설명하기

다음 코드에서 오류가 나는 이유를 설명하고, 오류가 나지 않게 고치세요.

```ts
// 문제: 오류 이유를 설명하고 고치세요
type Store = { name: string; managerName?: string }

function greetStaff(store: Store, staffNames: string[]): string[] {
  if (store.managerName === undefined) return []
  return staffNames.map((staff) => `${staff}님, 점장 ${store.managerName.slice(0, 1)}○○입니다`)
}
```

::: details 정답 보기
`store.managerName`은 객체의 **속성**이라 콜백(`map`에 넘긴 함수) 안에서는 좁히기가 풀립니다. 콜백이 실행되는 사이에 속성이 바뀔 수 있다고 보기 때문입니다.

```text
'store.managerName' is possibly 'undefined'. (TS18048)
```

`const`에 담아서 좁힙니다.

```ts
type Store = { name: string; managerName?: string }

function greetStaff(store: Store, staffNames: string[]): string[] {
  const manager = store.managerName
  if (manager === undefined) return []
  return staffNames.map((staff) => `${staff}님, 점장 ${manager.slice(0, 1)}○○입니다`)
}

console.log(greetStaff({ name: '강남점', managerName: '이수진' }, ['박서준']))
// 출력: [ '박서준님, 점장 이○○입니다' ]
```
:::

## 확인 퀴즈

1. 타입 좁히기를 집합의 말로 설명하세요.
2. `typeof x === 'object'`로 확인한 뒤에도 남아 있을 수 있는 값은 무엇인가요?
3. `if (stock)`으로 `number | undefined`를 거를 때의 함정은 무엇인가요?
4. `interface`로 정의한 타입에 `instanceof`를 쓸 수 없는 이유는 무엇인가요?
5. 객체 속성을 `if`로 확인했는데 콜백 안에서 다시 `possibly 'undefined'` 오류가 나면 어떻게 고치나요?

::: details 정답 보기
1. 유니온 같은 큰 집합을 조건문으로 잘라, 조건을 통과한 쪽에서는 더 작은 부분집합으로 다루는 것입니다.
2. `null`입니다. `typeof null`이 `'object'`이기 때문입니다.
3. `0`도 거짓 같은 값이라 "값 없음"으로 처리됩니다. `!== undefined`로 확인해야 합니다.
4. `interface`는 컴파일하면 사라지는 타입이라 실행 중에 확인할 대상(클래스)이 없기 때문입니다.
5. 속성 값을 `const` 변수에 담은 뒤 그 변수를 확인하고, 콜백에서도 그 변수를 씁니다.
:::

## 정리

- **타입 좁히기**는 조건문으로 값을 확인해 큰 집합을 작은 부분집합으로 줄이는 것입니다. TypeScript는 **제어 흐름 분석**으로 줄마다 타입을 따라갑니다.
- `typeof`(원시 타입), `===`·`switch`(리터럴), `in`(속성 유무), `instanceof`(클래스), `Array.isArray`(배열)로 좁힙니다.
- **truthiness**는 편하지만 `0`, `''`도 거르므로 숫자·문자열에는 `!== undefined`나 `!= null`을 씁니다. `typeof null === 'object'`도 주의합니다.
- `return`·`throw`로 **일찍 반환하면** 아래 코드 전체가 좁혀진 타입을 씁니다.
- 콜백 안에서는 **객체 속성**이나 나중에 다시 대입되는 `let`의 좁히기가 풀립니다. `const`에 담아 해결합니다.
- 판별 속성으로 구분하는 **판별 유니온**은 [Part 3](../part3-intermediate/03-discriminated-union)에서 이어서 배웁니다.

## 다음 단계

[열거형(enum)과 그 대안](./09-enum) — 정해진 값 목록을 표현하는 TypeScript의 `enum`을 배우고, 왜 실무에서 리터럴 유니온이나 `as const` 객체를 더 권하는지 비교합니다.
