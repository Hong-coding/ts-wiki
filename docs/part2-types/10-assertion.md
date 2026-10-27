---
title: 타입 단언(as)과 non-null 단언(!)
---

# 타입 단언(as)과 non-null 단언(!)

<LessonMeta level="초급" :minutes="30" prev="enum과 그 대안(리터럴 유니온, as const 객체)" />

## 이번에 배울 것

- 타입 단언 `as`가 **검사가 아니라 "내가 책임진다"는 선언**임을 설명할 수 있다.
- 단언할 수 있는 범위와, 막혔을 때 나오는 **이중 단언**이 왜 위험한지 설명할 수 있다.
- non-null 단언 `!`의 뜻과 위험을 설명할 수 있다.
- `as const`가 다른 단언과 어떻게 다른지 설명할 수 있다.
- 단언을 써도 되는 경우를 구분하고, 대부분의 경우 **좁히기·타입 가드**로 바꿀 수 있다.

## 먼저 알아 둘 것

- [특수 타입](./02-special-types) — `unknown`과 `any`
- [배열 타입과 튜플](./03-arrays-tuples) — `as const`
- [타입 좁히기](./08-narrowing)

## 비유로 이해하기

택배 기사가 상자를 배달하면서 "내용물: 유리컵"이라는 송장을 붙여 둡니다. 창고 직원은 상자를 열어 보지 않고 **송장을 믿고** "깨지기 쉬움" 선반에 올립니다.

- 송장이 맞으면 아무 문제가 없습니다.
- 송장이 틀렸다면? 실제로는 냉동식품인데 상온 선반에 올라가 상해 버립니다. 그리고 **책임은 송장을 쓴 사람**에게 있습니다.

**타입 단언**은 이 송장입니다. 개발자가 "이 값은 이 타입이야"라고 적으면, TypeScript는 **열어 보지 않고(검사하지 않고) 믿습니다.** 맞으면 편리하지만, 틀리면 실행 중에 터지고 컴파일러는 아무 경고도 해 주지 않습니다.

## 개념 설명

### 1단계: as는 검사가 아니라 선언

**타입 단언**(type assertion)은 `값 as 타입` 형태로 "이 값을 이 타입으로 취급해라"라고 컴파일러에게 **지시**하는 문법입니다.

```ts
const raw: unknown = JSON.parse('{"orderNo":"A-1001","amount":9000}')

type Order = { orderNo: string; amount: number }
const order = raw as Order // "raw는 Order야. 내가 책임질게"

console.log(order.orderNo, order.amount)
// 출력: A-1001 9000
```

중요한 사실: **`as`는 실행 중에 아무것도 하지 않습니다.** 컴파일하면 `as Order`는 그냥 지워집니다.

```js
const raw = JSON.parse('{"orderNo":"A-1001","amount":9000}');
const order = raw;
```

그래서 단언이 틀려도 컴파일러는 모르고, 실행 중에도 즉시 알려 주지 않습니다.

```ts
type Order = { orderNo: string; amount: number }

const raw: unknown = JSON.parse('{"orderNo":"A-1001"}') // amount가 없음!
const order = raw as Order

console.log(order.amount.toLocaleString('ko-KR'))
// 실행하면: TypeError: Cannot read properties of undefined (reading 'toLocaleString')
```

TypeScript는 오류를 하나도 내지 않았지만 실행 중에 터졌습니다. 집합으로 말하면 `as`는 "이 값은 저 집합 안에 있다"고 **확인 없이 주장**하는 것입니다.

::: warning 단언과 형 변환은 다릅니다
다른 언어의 "형 변환(cast)"은 실제로 값을 바꾸기도 합니다. TypeScript의 `as`는 **값을 전혀 바꾸지 않습니다.** `'4500' as unknown as number`라고 써도 값은 여전히 문자열 `'4500'`입니다. 값을 바꾸려면 `Number('4500')`처럼 실제 변환 함수를 써야 합니다.
:::

### 2단계: 단언할 수 있는 범위

`as`가 아무 타입으로나 바꿔 주는 것은 아닙니다. **두 타입이 어느 정도 겹칠 때**만 허락합니다. 정확히는 한쪽이 다른 쪽에 들어갈 수 있는 관계(한쪽이 다른 쪽의 부분집합)여야 합니다.

```ts
type OrderStatus = 'READY' | 'PAID' | 'CANCELED'

const input: string = 'PAID'
const s1 = input as OrderStatus // ✅ 좁히는 방향: string ⊃ OrderStatus

const s2 = 'READY' as string // ✅ 넓히는 방향: 언제나 안전

const price = '4500' as number
// ❌ Conversion of type 'string' to type 'number' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first. (TS2352)

console.log(s1, s2)
```

- **넓히는 방향**(작은 집합 → 큰 집합, `'READY'` → `string`): 언제나 참인 주장이라 안전합니다. 사실 대부분은 단언 없이 대입만 해도 됩니다.
- **좁히는 방향**(큰 집합 → 작은 집합, `string` → `OrderStatus`): 허락은 하지만 **틀릴 수 있습니다.** `input`이 실제로 `'PIAD'`여도 그대로 통과합니다.
- **겹치지 않는 방향**(`string` → `number`): 거의 확실한 실수라 막습니다.

### 3단계: 이중 단언 — 가장 강한 거짓말

TS2352 메시지 끝을 보면 "의도한 것이라면 먼저 `unknown`으로 바꾸라"고 쓰여 있습니다. `unknown`은 **전체집합**이라 무엇이든 넓혀 넣을 수 있고, 거기서 다시 아무 타입으로나 좁힐 수 있기 때문입니다. 이것을 **이중 단언**(double assertion)이라고 합니다.

```ts
const price = '4500' as unknown as number // 컴파일 통과

console.log(typeof price, price + 500)
// 출력: string 4500500
```

타입은 `number`인데 실제 값은 문자열이라, `+ 500`이 덧셈이 아니라 문자열 이어 붙이기가 되었습니다. 컴파일러는 아무 경고도 하지 않습니다.

이중 단언은 **타입 검사를 완전히 무력화**합니다. `any`를 쓰는 것과 다를 바 없습니다. 테스트 코드에서 일부러 잘못된 값을 만들 때 정도를 빼면, 실무 코드에서 이중 단언을 보면 **설계가 잘못되었다는 신호**로 받아들이세요.

### 4단계: non-null 단언 `!`

값 뒤에 붙이는 **`!`** 는 "이 값은 `null`도 `undefined`도 아니다"라는 단언입니다. **non-null 단언**(non-null assertion)이라고 합니다.

```ts
const prices = new Map<string, number>([['P001', 4500]])

const p1 = prices.get('P001') // 타입: number | undefined
const p2 = prices.get('P001')! // 타입: number

console.log(p2 + 500)
// 출력: 5000
```

- `Map`은 키를 넣고 값을 꺼내는 자료구조입니다. `get`은 키가 없을 수도 있으니 `number | undefined`를 돌려줍니다([JSON · Date · Map · Set](../part4-async/06-json-date-map-set)에서 배웁니다).
- `!`를 붙이면 `undefined`가 빠진 `number`가 됩니다.

`!`도 `as`와 마찬가지로 **검사가 아닙니다.** 컴파일하면 사라집니다. 틀리면 실행 중에 터집니다.

```ts
const prices = new Map<string, number>([['P001', 4500]])

const p = prices.get('P999')! // 컴파일러: OK
console.log(p.toFixed(0))
// 실행하면: TypeError: Cannot read properties of undefined (reading 'toFixed')
```

`!`는 짧고 편해서 남용되기 쉽습니다. 오류를 없애려고 습관처럼 `!`를 붙이면, TypeScript가 막아 주던 `undefined` 버그를 모두 실행 중으로 미루는 셈입니다.

### 5단계: as const와의 차이

[03 레슨](./03-arrays-tuples)에서 배운 `as const`도 `as`로 시작합니다. 하지만 성격이 정반대입니다.

```ts
const sizes = ['S', 'M', 'L'] as const // 타입: readonly ["S", "M", "L"]
```

| | `as 타입` | `as const` |
|---|---|---|
| 하는 일 | 개발자가 정한 타입으로 취급하라고 지시 | 값에서 **가장 좁은 타입**을 그대로 추론하라고 요청 |
| 거짓말 가능성 | **있음**(틀린 타입을 주장할 수 있음) | **없음**(값 그대로의 타입만 나옴) |
| 실행 중 효과 | 없음 | 없음 |
| 위험도 | 상황에 따라 위험 | 안전 |

`as const`는 "내가 책임진다"가 아니라 "**있는 그대로 정확하게** 봐 달라"는 요청입니다. 값과 다른 타입을 만들어 낼 수 없으므로 안심하고 써도 됩니다.

### 6단계: 단언 대신 좁히기와 타입 가드

대부분의 단언은 **확인 코드**로 바꿀 수 있습니다. 확인 코드는 실행 중에 진짜로 검사하므로, 틀린 값이 들어오면 그 자리에서 안전하게 처리할 수 있습니다.

**`!` 대신 좁히기**

```ts
const prices = new Map<string, number>([['P001', 4500]])

function getPrice(code: string): number {
  const price = prices.get(code)
  if (price === undefined) {
    throw new Error(`가격 정보 없음: ${code}`)
  }
  return price // 여기서 price는 number
}

console.log(getPrice('P001'))
// 출력: 4500
```

없을 때 무엇을 할지(오류, 기본값 등)를 **코드로 정해 두는** 것이 핵심입니다. 기본값이면 `prices.get(code) ?? 0`처럼 더 짧게 쓸 수 있습니다.

**`as` 대신 타입 가드 함수**

반복해서 쓰는 확인은 함수로 뽑습니다. 반환 타입에 `값 is 타입`을 쓰면 **타입 가드 함수**가 되어, 이 함수로 확인한 곳에서 좁히기가 일어납니다.

```ts
type OrderStatus = 'READY' | 'PAID' | 'CANCELED'

function isOrderStatus(value: string): value is OrderStatus {
  return value === 'READY' || value === 'PAID' || value === 'CANCELED'
}

function parseStatus(input: string): OrderStatus {
  if (isOrderStatus(input)) {
    return input // 여기서 input은 OrderStatus
  }
  return 'READY' // 모르는 값이면 기본값
}

console.log(parseStatus('PAID'), parseStatus('PIAD'))
// 출력: PAID READY
```

`input as OrderStatus`로 썼다면 `'PIAD'`가 그대로 통과했을 것입니다. 타입 가드는 [Part 5 사용자 정의 타입 가드 · assertion 함수 · satisfies](../part5-advanced/06-type-guards-satisfies)에서 자세히 배웁니다. 그 레슨에서 배우는 `satisfies`도 "단언 없이 타입을 확인"하는 좋은 대안입니다.

**외부 데이터는 런타임 검증으로**

서버 응답, `JSON.parse` 결과, `localStorage` 값처럼 **프로그램 밖에서 들어온 데이터**에 `as`를 붙이는 것이 가장 흔한 실수입니다. 이런 데이터는 [런타임 검증 (zod)](../part4-async/05-runtime-validation)으로 실제로 확인합니다.

### 7단계: 단언을 써도 되는 경우

그렇다고 단언을 절대 쓰면 안 되는 것은 아닙니다. **개발자가 컴파일러보다 확실히 더 많이 아는** 경우가 있습니다.

1. **DOM 요소를 가져올 때**: HTML에 그 요소가 반드시 있고 종류도 확실할 때

```ts
// HTML에 <input id="barcode">가 반드시 있는 화면이라고 가정
function readBarcode(): string {
  const input = document.querySelector('#barcode') as HTMLInputElement | null
  return input?.value ?? ''
}
```

`querySelector`는 어떤 종류의 요소가 나올지 모르므로 `Element | null`을 돌려줍니다. "이 id는 input 요소"라는 것은 HTML을 아는 개발자만 압니다. 여기서도 `| null`은 남겨 두고 `?.`로 처리한 점을 눈여겨보세요. 요소가 없을 가능성까지 거짓말하지는 않았습니다.

2. **넓히는 방향의 단언**: `'READY' as string`처럼 항상 참인 주장. 다만 이 경우 대부분 타입 표기(`const s: string = 'READY'`)로 대신할 수 있습니다.

3. **테스트 코드**: 일부러 일부 속성만 가진 가짜 객체를 만들 때.

4. **TypeScript가 아직 추론하지 못하는 경우**: 라이브러리 타입이 부족하거나, 복잡한 제네릭 코드에서 추론이 한계에 부딪혔을 때. 이때는 **왜 단언이 안전한지 주석을 남깁니다.**

::: tip 단언 체크리스트
`as`나 `!`를 쓰기 전에 스스로 물어보세요.

1. 좁히기(`if`, `typeof`, `in`)로 바꿀 수 있는가?
2. 기본값(`??`)이나 오류(`throw`)로 처리할 수 있는가?
3. 외부 데이터라면 런타임 검증을 해야 하지 않는가?
4. 셋 다 아니라면, 이 단언이 **왜 안전한지 주석**으로 남겼는가?
:::

## 자주 하는 실수

### 실수 1: 오류를 없애려고 !를 붙이기

```ts
type Member = { name: string; phone?: string }

function getPhoneTail(member: Member): string {
  return member.phone!.slice(-4) // 오류는 사라졌지만...
}

console.log(getPhoneTail({ name: '박서준' }))
// 실행하면: TypeError: Cannot read properties of undefined (reading 'slice')
```

왜 틀렸나: `phone`이 없을 수 있다는 TypeScript의 경고(TS18048)를 `!`로 꺼 버렸습니다. 버그가 실행 중으로 밀려났을 뿐입니다.

고친 코드:

```ts
type Member = { name: string; phone?: string }

function getPhoneTail(member: Member): string {
  return member.phone?.slice(-4) ?? '----'
}

console.log(getPhoneTail({ name: '박서준' }))
// 출력: ----
```

### 실수 2: 빈 객체에 as를 붙여 만들기

```ts
type Order = { orderNo: string; amount: number }

const order = {} as Order
console.log(order.amount.toFixed(0))
// 실행하면: TypeError: Cannot read properties of undefined (reading 'toFixed')
```

왜 틀렸나: "나중에 채울 거니까" 하고 빈 객체를 `Order`라고 주장했습니다. 채우는 것을 잊어도 컴파일러는 모릅니다.

고친 코드: 필요한 값을 모두 넣어 만들거나, 아직 없는 속성은 타입에서 선택 속성으로 둡니다.

```ts
type Order = { orderNo: string; amount: number }

const order: Order = { orderNo: 'A-1001', amount: 0 }
console.log(order.amount.toFixed(0))
// 출력: 0
```

### 실수 3: 겹치지 않는 타입을 이중 단언으로 밀어붙이기

```ts
type Product = { code: string; price: number }

const input = '4500'
const product = { code: 'P001', price: input as unknown as number } as Product

console.log(product.price * 2) // 우연히 동작
// 출력: 9000
console.log(product.price + 500)
// 출력: 4500500
```

왜 틀렸나: 문자열을 숫자라고 우겼습니다. `*`는 JavaScript가 문자열을 숫자로 바꿔 계산해 우연히 맞았지만, `+`는 문자열 이어 붙이기가 되었습니다.

고친 코드: 단언이 아니라 **실제 변환**을 합니다.

```ts
type Product = { code: string; price: number }

const input = '4500'
const product: Product = { code: 'P001', price: Number(input) }

console.log(product.price + 500)
// 출력: 5000
```

### 실수 4: JSON.parse 결과에 바로 as 붙이기

```ts
type Cart = { items: string[] }

const saved = '{"item":["라테"]}' // 저장 형식이 바뀌어 items가 아니라 item
const cart = JSON.parse(saved) as Cart

console.log(cart.items.length)
// 실행하면: TypeError: Cannot read properties of undefined (reading 'length')
```

왜 틀렸나: 외부 데이터의 모양은 컴파일 시점에 알 수 없습니다. `as`는 확인하지 않습니다.

고친 코드: `unknown`으로 받고 확인한 뒤 씁니다.

```ts
type Cart = { items: string[] }

function parseCart(text: string): Cart {
  const data: unknown = JSON.parse(text)
  if (typeof data === 'object' && data !== null && 'items' in data && Array.isArray(data.items)) {
    return { items: data.items.filter((x): x is string => typeof x === 'string') }
  }
  return { items: [] }
}

console.log(parseCart('{"item":["라테"]}').items.length, parseCart('{"items":["라테"]}').items.length)
// 출력: 0 1
```

확인 코드가 길어지므로 실무에서는 [zod](../part4-async/05-runtime-validation)를 씁니다.

## 직접 해 보기

### 문제 1 ⭐ 단언이 허락되는지 맞히기

다음 단언 중 컴파일 오류가 나는 것을 고르세요.

```ts
// 문제: 오류가 나는 줄을 고르세요
type Size = 'S' | 'M' | 'L'

const a = 'M' as Size
const b = ('XL' as string) as Size
const c = 100 as Size
const d = 'S' as string
```

::: details 정답 보기
`c`만 오류입니다.

```ts
type Size = 'S' | 'M' | 'L'

const a = 'M' as Size
const b = ('XL' as string) as Size
const c = 100 as Size
// ❌ Conversion of type 'number' to type 'Size' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first. (TS2352)
const d = 'S' as string
console.log(a, b, d)
```

- `a`: `"M"`은 `Size` 안에 있습니다.
- `b`: `string` → `Size`는 좁히는 방향이라 **허락됩니다.** 하지만 실제 값 `'XL'`은 `Size`가 아닙니다. 단언이 거짓말을 막지 못하는 예입니다.
- `c`: 숫자와 `Size`는 겹치지 않아 막힙니다.
- `d`: 넓히는 방향이라 안전합니다.
:::

### 문제 2 ⭐ !를 좁히기로 바꾸기

다음 코드에서 `!`를 없애고, 쿠폰이 없으면 `0`을 돌려주도록 고치세요.

```ts
// 문제: !를 없애세요
const coupons = new Map<string, number>([['WELCOME', 3000]])

function getCouponAmount(code: string): number {
  return coupons.get(code)!
}
```

::: details 정답 보기
```ts
const coupons = new Map<string, number>([['WELCOME', 3000]])

function getCouponAmount(code: string): number {
  return coupons.get(code) ?? 0
}

console.log(getCouponAmount('WELCOME'), getCouponAmount('NONE'))
// 출력: 3000 0
```
:::

### 문제 3 ⭐⭐ 타입 가드 함수 만들기

결제 수단 `'CARD' | 'CASH' | 'PAY'`를 위한 타입 가드 함수 `isPayMethod`를 만들고, 문자열을 받아 결제 수단이면 그대로, 아니면 `'CASH'`를 돌려주는 `toPayMethod`를 작성하세요. `as`는 쓰지 않습니다.

::: details 정답 보기
```ts
type PayMethod = 'CARD' | 'CASH' | 'PAY'

function isPayMethod(value: string): value is PayMethod {
  return value === 'CARD' || value === 'CASH' || value === 'PAY'
}

function toPayMethod(value: string): PayMethod {
  return isPayMethod(value) ? value : 'CASH'
}

console.log(toPayMethod('PAY'), toPayMethod('BITCOIN'))
// 출력: PAY CASH
```
:::

### 문제 4 ⭐⭐⭐ 단언이 숨긴 버그 찾기

다음 코드는 컴파일 오류가 없지만 실행 결과가 이상합니다. 어디가 문제인지 설명하고, 단언 없이 고치세요.

```ts
// 문제: 단언이 숨긴 버그를 찾으세요
type CartItem = { name: string; quantity: number }

const form = { name: '라테', quantity: '2' } // 화면 입력값은 문자열
const item = form as unknown as CartItem

const total = item.quantity + 1
console.log(`${item.name} ${total}개`)
```

::: details 정답 보기
`quantity`는 실제로 문자열 `'2'`인데 이중 단언으로 `number`라고 우겼습니다. 그래서 `item.quantity + 1`이 `'21'`이 되어 `라테 21개`가 출력됩니다.

```ts
type CartItem = { name: string; quantity: number }

const form = { name: '라테', quantity: '2' }
const item: CartItem = { name: form.name, quantity: Number(form.quantity) }

const total = item.quantity + 1
console.log(`${item.name} ${total}개`)
// 출력: 라테 3개
```

이중 단언을 지우면 컴파일러가 `quantity` 타입이 다르다는 것을 바로 알려 줍니다. 단언을 지우는 것만으로 버그 위치가 드러나는 경우가 많습니다.
:::

## 확인 퀴즈

1. `as`는 실행 중에 값을 검사하거나 바꾸나요?
2. `'4500' as number`는 왜 오류가 나나요? 오류를 피하는 방법은 무엇이고, 왜 위험한가요?
3. `value!`는 무슨 뜻인가요?
4. `as const`가 일반 단언과 다른 점은 무엇인가요?
5. 서버 응답 JSON에 `as Order`를 붙이는 대신 무엇을 해야 하나요?

::: details 정답 보기
1. 아닙니다. 컴파일할 때 지워지며, 실행 중에는 아무 일도 하지 않습니다.
2. `string`과 `number`가 겹치지 않기 때문입니다(TS2352). `as unknown as number`(이중 단언)로 피할 수 있지만, 실제 값은 문자열 그대로라 타입 검사를 완전히 무력화합니다.
3. "이 값은 `null`도 `undefined`도 아니다"라는 non-null 단언입니다. 확인하지 않고 믿게 합니다.
4. `as const`는 값 그대로의 가장 좁은 타입을 추론하게 할 뿐, 값과 다른 타입을 주장할 수 없어 안전합니다.
5. `unknown`으로 받아 좁히기나 타입 가드로 확인하거나, zod 같은 런타임 검증 도구로 검증합니다.
:::

## 정리

- `as`는 **검사가 아니라 "내가 책임진다"는 선언**입니다. 실행 중에는 아무것도 하지 않으며, 틀리면 실행 중에 터집니다.
- 단언은 두 타입이 겹칠 때만 허락됩니다. 넓히는 방향은 안전하고, 좁히는 방향은 틀릴 수 있습니다.
- `as unknown as T` **이중 단언**은 타입 검사를 무력화합니다. 실무 코드에서는 설계 문제의 신호입니다.
- `!`는 `null`·`undefined`가 아니라는 단언입니다. 오류를 없애려고 붙이지 말고 `?.`, `??`, 좁히기로 처리합니다.
- `as const`는 정확한 타입을 요청할 뿐이라 안전합니다.
- 단언 대신 **좁히기 → 타입 가드 → 런타임 검증** 순서로 고려하고, 꼭 써야 하면 이유를 주석으로 남깁니다.

## 다음 단계

Part 2를 마쳤습니다. 이제 코드에 알맞은 타입을 붙이고, 컴파일러의 오류 메시지를 집합의 눈으로 읽을 수 있게 되었습니다.

[Part 3 인터섹션(&)과 타입 합성](../part3-intermediate/01-intersection) — 07 레슨에서 맛본 `&`를 본격적으로 배우며, 여러 타입을 조합해 더 정교한 타입을 만드는 중급 과정을 시작합니다.
