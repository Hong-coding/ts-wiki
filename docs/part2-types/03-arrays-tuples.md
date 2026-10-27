---
title: 배열 타입과 튜플
---

# 배열 타입과 튜플

<LessonMeta level="초급" :minutes="40" prev="특수 타입 any · unknown · never · void의 차이" />

## 이번에 배울 것

- 배열 타입을 `T[]`와 `Array<T>` 두 가지 문법으로 쓰고, 둘이 같은 타입임을 설명할 수 있다.
- 유니온 배열을 쓸 때 괄호가 왜 필요한지 설명하고 `(string | number)[]`를 바르게 쓸 수 있다.
- `readonly` 배열로 "읽기만 하는 배열"을 만들고, 함수 매개변수에 활용할 수 있다.
- **튜플**(자리마다 타입이 정해진 배열)과 이름 붙은 튜플·선택 요소·나머지 요소를 쓸 수 있다.
- `as const`로 배열 안의 값을 리터럴 타입으로 고정할 수 있다.

## 먼저 알아 둘 것

- [배열과 배열 메서드 (map · filter · reduce)](../part1-basics/07-arrays)
- [타입 표기와 타입 추론](./01-annotation-inference) — 특히 "배열 요소는 `const`여도 넓혀진다"
- [특수 타입](./02-special-types) — `unknown`은 전체집합, `never`는 공집합

## 비유로 이해하기

매장 창고에 두 종류의 수납 도구가 있다고 해 봅시다.

- **진열 선반**: "음료만" 라벨이 붙어 있고, 칸 수는 정해져 있지 않습니다. 음료라면 몇 개든 올릴 수 있습니다. 이것이 **배열**입니다. 모든 칸의 종류가 같고, 길이는 자유입니다.
- **도시락 칸막이 용기**: 첫째 칸은 밥, 둘째 칸은 반찬, 셋째 칸은 국으로 **칸마다 들어갈 것이 정해져 있고 칸 수도 정해져** 있습니다. 밥 칸에 국을 부으면 안 됩니다. 이것이 **튜플**입니다.

여기에 "유리 진열장"이 하나 더 있습니다. 손님은 볼 수만 있고 물건을 넣거나 뺄 수 없습니다. 이것이 **readonly 배열**입니다.

## 개념 설명

### 1단계: 배열 타입 쓰는 두 가지 방법

배열 타입은 **요소 타입 뒤에 `[]`** 를 붙여서 씁니다.

```ts
const productNames: string[] = ['아메리카노', '카페라테', '바닐라라테']
const prices: number[] = [4500, 5000, 5500]
const soldOut: boolean[] = [false, true, false]

console.log(productNames.length, prices[0], soldOut[1])
// 출력: 3 4500 true
```

같은 타입을 `Array<요소타입>` 형태로도 쓸 수 있습니다. 꺾쇠(`<`, `>`) 안에 요소 타입을 넣는 이 문법은 **제네릭**(generic, 타입을 매개변수처럼 받아서 만드는 타입)이라고 부르며 [Part 3 제네릭 기초](../part3-intermediate/04-generics-basics)에서 자세히 배웁니다.

```ts
const productNames: Array<string> = ['아메리카노', '카페라테']

// 두 문법은 완전히 같은 타입입니다. 서로 바꿔 넣어도 됩니다.
const copied: string[] = productNames
console.log(copied)
// 출력: [ '아메리카노', '카페라테' ]
```

| 문법 | 예 | 특징 |
|---|---|---|
| `T[]` | `string[]` | 짧고 읽기 쉬움. **실무에서 더 많이 씀** |
| `Array<T>` | `Array<string>` | 요소 타입이 길거나 유니온일 때 읽기 편할 수 있음 |

이 위키는 짧은 `T[]`를 기본으로 씁니다. 어느 쪽이든 **팀에서 한쪽으로 통일**하는 것이 가장 중요합니다(ESLint 규칙 `@typescript-eslint/array-type`으로 강제할 수 있습니다).

집합으로 보면 `string[]`은 **"문자열만 들어 있는 배열들을 모두 모은 집합"** 입니다. `[]`(빈 배열), `['라테']`, `['라테', '모카']`가 모두 이 집합에 속합니다. 숫자가 하나라도 섞인 배열은 이 집합 밖에 있습니다.

```ts
const menu: string[] = ['아메리카노', 4500]
// ❌ Type 'number' is not assignable to type 'string'. (TS2322)
```

### 2단계: 배열 타입의 추론

[01 레슨](./01-annotation-inference)에서 본 것처럼 값이 있으면 배열 타입도 추론됩니다.

```ts
const sizes = ['S', 'M', 'L'] // 타입: string[]
const stock = [10, 0, 25] // 타입: number[]
const mixed = ['라테', 5000] // 타입: (string | number)[]
```

`mixed`는 문자열과 숫자가 섞여 있으므로 **"문자열 또는 숫자가 들어 있는 배열"** 로 추론됩니다. `|`는 "또는"이라는 뜻의 **유니온**(union) 기호이며 [06 레슨](./06-union-literal)에서 자세히 배웁니다. 지금은 "`A | B`는 A 집합과 B 집합을 합친 **합집합**"이라고만 기억하세요.

빈 배열로 시작할 때는 타입을 꼭 표기합니다.

```ts
const cart: string[] = []
cart.push('아메리카노')
console.log(cart)
// 출력: [ '아메리카노' ]
```

### 3단계: 유니온 배열은 괄호를 꼭 친다

`mixed`의 타입에 괄호가 있는 것을 눈여겨보세요. `(string | number)[]`입니다. 괄호를 빼면 **완전히 다른 타입**이 됩니다.

```text
(string | number)[]   →  "문자열 또는 숫자"를 담는 배열
                          예: ['라테', 5000, '모카']

string | number[]     →  "문자열 하나" 또는 "숫자 배열"
                          예: '라테'  또는  [4500, 5000]
```

`[]`는 `|`보다 먼저 붙습니다. 수학에서 `1 + 2 × 3`의 곱셈을 먼저 하는 것처럼, `string | number[]`는 `string | (number[])`로 읽힙니다.

```ts
const orderLine: string | number[] = ['아메리카노', 2]
// ❌ Type '(string | number)[]' is not assignable to type 'string | number[]'. (TS2322)
```

메시지를 집합의 말로 읽어 보면 "`(string | number)[]` 값은 `string` 집합에도, `number[]` 집합에도 들어 있지 않다"는 뜻입니다. 오른쪽 타입이 `string | number[]`로 표시된 것을 보고 "괄호가 빠졌구나" 하고 알아채면 됩니다. 괄호를 치면 해결됩니다.

```ts
const orderLine: (string | number)[] = ['아메리카노', 2]
console.log(orderLine)
// 출력: [ '아메리카노', 2 ]

// Array<> 문법은 괄호 걱정이 없습니다.
const orderLine2: Array<string | number> = ['카페라테', 1]
console.log(orderLine2)
// 출력: [ '카페라테', 1 ]
```

::: tip 꺾쇠 문법이 편한 순간
요소 타입이 유니온일 때는 `Array<string | number>`가 괄호 실수 없이 읽기 쉽습니다. 이럴 때만 꺾쇠 문법을 쓰는 팀도 있습니다.
:::

### 4단계: 배열 요소를 꺼낼 때의 타입

`string[]`에서 요소 하나를 꺼내면 타입은 `string`입니다.

```ts
const productNames = ['아메리카노', '카페라테']
const first = productNames[0] // 타입: string
const tenth = productNames[10] // 타입: string (실제 값은 undefined!)

console.log(first, tenth)
// 출력: 아메리카노 undefined
```

`tenth`는 실제로는 `undefined`인데 타입은 `string`입니다. TypeScript는 기본 설정에서 **"배열 길이 안의 칸을 꺼낸다"고 믿어 줍니다.** 길이는 실행해 봐야 알 수 있기 때문입니다. 이 구멍을 막는 옵션 `noUncheckedIndexedAccess`는 [04 객체 타입](./04-object-types)에서 함께 봅니다.

::: warning 배열 칸 꺼내기는 믿어 주는 것일 뿐
`arr[i]`의 타입이 `string`이라고 해서 값이 반드시 있다는 보장은 없습니다. 빈 배열이나 범위 밖 인덱스를 다룰 수 있다면 `if (value !== undefined)`로 확인하세요.
:::

### 5단계: readonly 배열 — 읽기만 하는 배열

함수에 배열을 넘겼는데 함수가 몰래 배열을 바꿔 버리면 곤란합니다. **`readonly`** 를 붙이면 "이 배열은 읽기만 한다"는 약속이 됩니다.

```ts
const categories: readonly string[] = ['커피', '티', '디저트']

console.log(categories[0], categories.length)

categories.push('굿즈')
// ❌ Property 'push' does not exist on type 'readonly string[]'. (TS2339)

categories[0] = '음료'
// ❌ Index signature in type 'readonly string[]' only permits reading. (TS2542)
```

- `readonly string[]` 타입에는 `push`, `pop`, `splice`, `sort`처럼 **배열을 바꾸는 메서드가 아예 없습니다.**
- `map`, `filter`, `slice`처럼 **새 배열을 만들어 돌려주는 메서드는 그대로** 쓸 수 있습니다.
- 꺾쇠 문법으로는 `ReadonlyArray<string>`이라고 씁니다. 같은 타입입니다.

```ts
const categories: ReadonlyArray<string> = ['커피', '티', '디저트']
const labels = categories.map((c) => `[${c}]`) // 타입: string[]
console.log(labels)
// 출력: [ '[커피]', '[티]', '[디저트]' ]
```

::: info const와 readonly는 다릅니다
`const categories = [...]`는 "변수 `categories`에 다른 배열을 다시 넣지 못한다"는 뜻입니다. 배열 **안의 내용**은 `push`로 바꿀 수 있습니다. `readonly`는 배열 **안의 내용**을 바꾸지 못하게 막습니다. 둘은 막는 대상이 다릅니다.
:::

### 6단계: readonly는 함수 매개변수에서 빛난다

`readonly`가 가장 쓸모 있는 곳은 **함수 매개변수**입니다. "나는 받은 배열을 바꾸지 않습니다"라는 약속을 타입으로 보여 줄 수 있습니다.

```ts
function getTotal(prices: readonly number[]): number {
  let total = 0
  for (const price of prices) {
    total += price
  }
  return total
}

const cartPrices = [4500, 5000, 3000] // 타입: number[]
console.log(getTotal(cartPrices))
// 출력: 12500
```

일반 배열(`number[]`)을 `readonly number[]` 매개변수에 넘기는 것은 됩니다. "바꿀 수 있는 배열을 읽기만 하겠다"는 것은 안전하기 때문입니다. **반대 방향은 안 됩니다.**

```ts
function addFreeGift(items: string[]) {
  items.push('사은품')
}

const fixedMenu: readonly string[] = ['아메리카노', '라테']
addFreeGift(fixedMenu)
// ❌ Argument of type 'readonly string[]' is not assignable to parameter of type 'string[]'. (TS2345)
```

읽기 전용으로 약속한 배열을, 내용을 바꿀 수도 있는 함수에 넘기면 약속이 깨지므로 막습니다.

::: tip 실무 습관
함수가 받은 배열을 바꾸지 않는다면 매개변수에 `readonly`를 붙이세요. 호출하는 사람은 "내 배열이 안전하구나" 하고 안심하고, 함수를 고치는 사람이 실수로 `sort()`(원본을 바꾸는 메서드)를 부르면 바로 오류가 납니다.
:::

### 7단계: 튜플 — 자리마다 타입이 정해진 배열

**튜플**(tuple)은 **길이가 정해져 있고, 자리(인덱스)마다 타입이 정해진 배열**입니다. 대괄호 안에 자리 순서대로 타입을 나열합니다.

```ts
// [상품명, 가격]
const menuItem: [string, number] = ['아메리카노', 4500]

const productName = menuItem[0] // 타입: string
const price = menuItem[1] // 타입: number

console.log(`${productName}: ${price.toLocaleString('ko-KR')}원`)
// 출력: 아메리카노: 4,500원
```

`string[]`과 비교해 보면 차이가 분명합니다.

| | 배열 `string[]` | 튜플 `[string, number]` |
|---|---|---|
| 길이 | 자유 | **정해짐**(2) |
| 자리별 타입 | 모두 같음 | **자리마다 다름** |
| 범위 밖 인덱스 | 허용(값은 `undefined`일 수 있음) | **컴파일 오류** |

튜플은 길이와 순서를 엄격하게 검사합니다.

```ts
const a: [string, number] = [4500, '아메리카노']
// ❌ Type 'number' is not assignable to type 'string'. (TS2322)
// ❌ Type 'string' is not assignable to type 'number'. (TS2322)

const b: [string, number] = ['아메리카노']
// ❌ Type '[string]' is not assignable to type '[string, number]'. (TS2322)

const c: [string, number] = ['아메리카노', 4500]
console.log(c[2])
// ❌ Tuple type '[string, number]' of length '2' has no element at index '2'. (TS2493)
```

튜플은 **구조 분해**(destructuring, 배열이나 객체에서 값을 꺼내 변수 여러 개에 한 번에 담는 문법)와 함께 쓰면 편합니다.

```ts
function getBestSeller(): [string, number] {
  return ['카페라테', 128]
}

const [bestName, soldCount] = getBestSeller()
console.log(`${bestName} ${soldCount}잔`)
// 출력: 카페라테 128잔
```

함수가 값 두세 개를 한꺼번에 돌려줄 때 튜플을 씁니다. 나중에 배울 React의 `useState`도 `[값, 바꾸는 함수]` 튜플을 돌려줍니다.

### 8단계: 이름 붙은 튜플

`[string, number]`만 보고는 각 자리가 무슨 뜻인지 알기 어렵습니다. 자리마다 **이름표**를 붙일 수 있습니다(TypeScript 4.0부터).

```ts
type MenuItem = [name: string, price: number]

const item: MenuItem = ['바닐라라테', 5500]
console.log(item)
// 출력: [ '바닐라라테', 5500 ]
```

- 앞에 쓴 `type MenuItem = ...`은 **타입에 이름을 붙이는 문법**(타입 별칭)입니다. [07 레슨](./07-type-alias-interface)에서 자세히 배우며, 지금은 "긴 타입을 짧은 이름으로 부르기"라고 생각하세요.
- 이름표는 **문서 역할만** 합니다. 값을 꺼낼 때는 여전히 `item[0]`, `item[1]`로 꺼냅니다.
- 대신 VS Code에서 마우스를 올리거나 함수 반환 타입으로 쓸 때 `name`, `price`가 보여 훨씬 읽기 쉽습니다.

### 9단계: 선택 요소와 나머지 요소

**선택 요소**: 타입 뒤에 `?`를 붙이면 "있어도 되고 없어도 되는 자리"가 됩니다. 선택 요소는 뒤쪽에만 올 수 있습니다.

```ts
// [상품명, 가격, 옵션(선택)]
type OrderLine = [name: string, price: number, option?: string]

const line1: OrderLine = ['아메리카노', 4500]
const line2: OrderLine = ['카페라테', 5000, '샷 추가']

const option = line2[2] // 타입: string | undefined
console.log(line1.length, line2.length, option)
// 출력: 2 3 샷 추가
```

선택 요소를 꺼내면 `string | undefined`입니다. 없을 수도 있기 때문입니다.

**나머지 요소**: `...타입[]`을 쓰면 "이 자리부터는 같은 타입이 몇 개든"이라는 뜻입니다.

```ts
// [매장명, ...시간대별 매출]
type DailySales = [storeName: string, ...hourly: number[]]

const gangnam: DailySales = ['강남점', 120000, 98000, 150000]
const busan: DailySales = ['부산점'] // 매출 기록이 아직 없어도 됨

const [store, ...hourly] = gangnam
console.log(store, hourly.length, busan.length)
// 출력: 강남점 3 1
```

### 10단계: 튜플의 push 함정

튜플은 길이를 엄격하게 검사한다고 했는데, 이상한 구멍이 하나 있습니다. **`push`는 막지 않습니다.**

```ts
const pair: [string, number] = ['아메리카노', 4500]
pair.push(9999) // 오류 없음!

console.log(pair)
// 출력: [ '아메리카노', 4500, 9999 ]
console.log(pair.length) // 타입으로는 2
// 출력: 3
```

튜플도 결국 배열이라서 배열의 `push` 메서드를 물려받았기 때문입니다. 타입은 "길이 2"라고 믿고 있는데 실제 길이는 3이 되어 버립니다.

해결책은 **`readonly` 튜플**입니다. 튜플은 값을 묶어 전달하는 용도로 쓰는 경우가 대부분이라, 바꿀 일이 없다면 `readonly`를 붙이는 편이 안전합니다.

```ts
const pair: readonly [string, number] = ['아메리카노', 4500]
pair.push(9999)
// ❌ Property 'push' does not exist on type 'readonly [string, number]'. (TS2339)
```

### 11단계: as const — 배열을 통째로 고정하기

[01 레슨](./01-annotation-inference)에서 "`const`여도 배열 요소는 넓혀진다"고 했습니다. 배열 뒤에 **`as const`** 를 붙이면 넓히기가 일어나지 않습니다.

```ts
const sizes1 = ['S', 'M', 'L'] // 타입: string[]
const sizes2 = ['S', 'M', 'L'] as const // 타입: readonly ["S", "M", "L"]
```

`as const`는 세 가지를 한꺼번에 해 줍니다.

1. 요소를 **리터럴 타입**으로 고정합니다(`string` → `"S"`).
2. 배열을 **튜플**로 만듭니다(길이 3, 자리마다 타입이 정해짐).
3. **`readonly`** 를 붙입니다(`push` 등 금지).

집합으로 보면 `string[]`은 "문자열 배열 전부"라는 거대한 집합이지만, `readonly ["S", "M", "L"]`은 **값이 딱 하나인 집합**입니다. 가장 좁고 정확한 타입입니다.

```ts
const sizes = ['S', 'M', 'L'] as const

const first = sizes[0] // 타입: "S"
sizes.push('XL')
// ❌ Property 'push' does not exist on type 'readonly ["S", "M", "L"]'. (TS2339)
```

`as const`는 "정해진 선택지 목록"을 만들 때 아주 많이 씁니다. 요소 타입만 뽑아내는 방법(`(typeof sizes)[number]`)은 [09 열거형과 그 대안](./09-enum)에서, 원리는 [Part 3 keyof · typeof · 인덱스 접근 타입](../part3-intermediate/06-keyof-typeof-indexed)에서 배웁니다.

::: info as const는 단언이지만 안전합니다
`as`는 원래 "타입 단언"이라는 위험할 수 있는 문법입니다([10 레슨](./10-assertion)). 하지만 `as const`는 특별해서 **타입을 더 좁고 정확하게 만들 뿐 거짓말을 할 수 없습니다.** 안심하고 써도 됩니다.
:::

### 12단계: 배열 메서드와 타입

배열 메서드의 결과 타입도 추론됩니다. 콜백 매개변수는 [문맥적 타이핑](./01-annotation-inference)으로 정해집니다.

```ts
const prices = [4500, 5000, 5500]

const labels = prices.map((p) => `${p}원`) // 타입: string[]
const cheap = prices.filter((p) => p < 5000) // 타입: number[]
const total = prices.reduce((sum, p) => sum + p, 0) // 타입: number
const found = prices.find((p) => p > 9000) // 타입: number | undefined

console.log(labels, cheap, total, found)
// 출력: [ '4500원', '5000원', '5500원' ] [ 4500 ] 15000 undefined
```

`find`는 조건에 맞는 요소가 없으면 `undefined`를 돌려주므로 결과 타입에 `| undefined`가 붙습니다. 이 값을 쓰려면 먼저 확인해야 합니다([08 타입 좁히기](./08-narrowing)).

## 자주 하는 실수

### 실수 1: 유니온 배열에 괄호를 빼먹기

```ts
const receipt: string | number[] = ['A-1001', 9000]
// ❌ Type '(string | number)[]' is not assignable to type 'string | number[]'. (TS2322)
```

왜 틀렸나: `[]`가 `number`에만 붙어서 "문자열 하나 또는 숫자 배열"이라는 뜻이 되었습니다.

고친 코드:

```ts
const receipt: (string | number)[] = ['A-1001', 9000]
console.log(receipt)
// 출력: [ 'A-1001', 9000 ]
```

자리마다 의미가 정해져 있다면 튜플 `[orderNo: string, amount: number]`가 더 정확합니다.

### 실수 2: 빈 배열로 시작하면서 타입을 안 쓰기

```ts
function collectOrderNos(count: number) {
  const orderNos = []
  for (let i = 1; i <= count; i++) {
    orderNos.push(`A-${1000 + i}`)
  }
  return orderNos
}
```

왜 틀렸나: 이 코드는 오류 없이 통과하지만, `orderNos`는 처음에 `any[]`로 출발해 `push`할 때마다 타입이 정해지는 **진화하는 배열**(evolving array)입니다. 코드가 길어지면 무엇을 담는 배열인지 읽는 사람이 알기 어렵고, 경우에 따라 `any`가 새어 나와 검사가 약해집니다.

고친 코드: 빈 배열은 무엇을 담을지 표기합니다.

```ts
function collectOrderNos(count: number): string[] {
  const orderNos: string[] = []
  for (let i = 1; i <= count; i++) {
    orderNos.push(`A-${1000 + i}`)
  }
  return orderNos
}

console.log(collectOrderNos(2))
// 출력: [ 'A-1001', 'A-1002' ]
```

### 실수 3: 튜플이 필요한데 추론에 맡기기

```ts
function getStock() {
  return ['아메리카노', 30]
}

const [productName, count] = getStock()
const doubled = count * 2
// ❌ The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type. (TS2362)
```

왜 틀렸나: 배열 리터럴은 튜플이 아니라 **배열**로 추론됩니다. 반환 타입이 `(string | number)[]`가 되어, `count`가 문자열인지 숫자인지 알 수 없습니다.

고친 코드: 반환 타입에 튜플을 표기합니다.

```ts
function getStock(): [name: string, count: number] {
  return ['아메리카노', 30]
}

const [productName, count] = getStock()
console.log(productName, count * 2)
// 출력: 아메리카노 60
```

### 실수 4: readonly 배열을 원본째 뒤집기

```ts
function getLatestFirst(orderNos: readonly string[]): string[] {
  return orderNos.reverse()
  // ❌ Property 'reverse' does not exist on type 'readonly string[]'. (TS2339)
}
```

왜 틀렸나: `reverse`(순서 뒤집기)와 `sort`(정렬)는 **원본 배열을 직접 바꾸는** 메서드라 읽기 전용 배열에는 없습니다. 이 오류 덕분에 호출한 쪽의 배열을 몰래 바꾸는 버그를 막았습니다.

고친 코드: 복사한 뒤 뒤집습니다.

```ts
function getLatestFirst(orderNos: readonly string[]): string[] {
  return [...orderNos].reverse()
}

const original = ['A-1001', 'A-1002', 'A-1003']
console.log(getLatestFirst(original), original)
// 출력: [ 'A-1003', 'A-1002', 'A-1001' ] [ 'A-1001', 'A-1002', 'A-1003' ]
```

::: tip ES2023의 toReversed · toSorted
ES2023부터는 원본을 바꾸지 않고 새 배열을 돌려주는 `toReversed()`, `toSorted()`가 있습니다. `readonly` 배열에서도 쓸 수 있지만, `tsconfig.json`의 `lib`에 `es2023` 이상이 있어야 하고 실행 환경(Node.js 20 이상, 최신 브라우저)도 지원해야 합니다.
:::

## 직접 해 보기

### 문제 1 ⭐ 배열 타입 표기하기

다음 변수에 알맞은 배열 타입을 표기하세요.

```ts
// 문제: 알맞은 타입을 표기하세요
const memberNames = ['김민지', '박서준']
const points = [1200, 3400, 0]
const cartItems = []
const receiptLines = ['아메리카노', 4500, '카페라테', 5000]
```

::: details 정답 보기
```ts
const memberNames: string[] = ['김민지', '박서준']
const points: number[] = [1200, 3400, 0]
const cartItems: string[] = [] // 무엇을 담을지는 상황에 맞게 정합니다
const receiptLines: (string | number)[] = ['아메리카노', 4500, '카페라테', 5000]

console.log(memberNames.length, points.length, cartItems.length, receiptLines.length)
// 출력: 2 3 0 4
```

`receiptLines`는 괄호를 꼭 칩니다. `Array<string | number>`도 정답입니다. 앞의 두 변수는 실무에서는 추론에 맡겨도 됩니다.
:::

### 문제 2 ⭐ 튜플로 바꾸기

회원 정보를 `[회원번호, 이름, 포인트]` 순서로 담는 이름 붙은 튜플 타입 `MemberRow`를 만들고, 값을 하나 만들어 구조 분해로 꺼내 출력하세요.

::: details 정답 보기
```ts
type MemberRow = [memberNo: string, name: string, point: number]

const row: MemberRow = ['M001', '김민지', 1200]
const [memberNo, memberName, point] = row

console.log(`${memberNo} ${memberName} ${point}P`)
// 출력: M001 김민지 1200P
```
:::

### 문제 3 ⭐⭐ readonly로 버그 막기

다음 함수는 할인된 가격 목록을 만듭니다. 그런데 호출한 뒤 원래 가격 목록이 망가졌습니다. 매개변수에 `readonly`를 붙여 컴파일러가 문제 줄을 알려 주게 한 뒤 고치세요.

```ts
// 문제: readonly를 붙이고 오류를 고치세요
function applyDiscount(prices: number[], rate: number): number[] {
  for (let i = 0; i < prices.length; i++) {
    prices[i] = prices[i] * (1 - rate)
  }
  return prices
}

const menuPrices = [5000, 6000]
const sale = applyDiscount(menuPrices, 0.1)
console.log(menuPrices) // 원본이 바뀌어 버림
```

::: details 정답 보기
`readonly number[]`로 바꾸면 `prices[i] = ...` 줄에서 오류가 납니다.

```text
Index signature in type 'readonly number[]' only permits reading. (TS2542)
```

원본을 바꾸지 말고 `map`으로 새 배열을 만듭니다.

```ts
function applyDiscount(prices: readonly number[], rate: number): number[] {
  return prices.map((p) => p * (1 - rate))
}

const menuPrices = [5000, 6000]
const sale = applyDiscount(menuPrices, 0.1)
console.log(menuPrices, sale)
// 출력: [ 5000, 6000 ] [ 4500, 5400 ]
```
:::

### 문제 4 ⭐⭐ 선택 요소와 나머지 요소

다음 조건을 만족하는 튜플 타입을 각각 만드세요.

1. `Coupon`: `[쿠폰코드, 할인금액, 만료일(선택)]` — 만료일은 `'2026-12-31'` 같은 문자열
2. `StoreVisit`: `[매장명, ...방문 회원번호들]`

::: details 정답 보기
```ts
type Coupon = [code: string, amount: number, expiresAt?: string]
type StoreVisit = [storeName: string, ...memberNos: string[]]

const c1: Coupon = ['WELCOME', 3000]
const c2: Coupon = ['XMAS', 5000, '2026-12-31']
const v: StoreVisit = ['강남점', 'M001', 'M002', 'M003']

console.log(c1.length, c2[2], v.length)
// 출력: 2 2026-12-31 4
```
:::

### 문제 5 ⭐⭐⭐ as const와 튜플 push 함정

아래 코드의 각 줄이 오류인지 아닌지 맞혀 보고, 이유를 설명하세요.

```ts
// 문제: 각 줄의 오류 여부를 맞히세요
const a: [string, number] = ['라테', 5000]
a.push(1)

const b = ['라테', 5000] as const
b.push(1)

const c = ['라테', 5000]
c.push(true)
```

::: details 정답 보기
```ts
const a: [string, number] = ['라테', 5000]
a.push(1) // ✅ 오류 없음 — 튜플의 push 함정. 실제 길이는 3이 됨

const b = ['라테', 5000] as const
b.push(1)
// ❌ Property 'push' does not exist on type 'readonly ["라테", 5000]'. (TS2339)

const c = ['라테', 5000]
c.push(true)
// ❌ Argument of type 'boolean' is not assignable to parameter of type 'string | number'. (TS2345)
```

- `a`는 일반 튜플이라 `push`가 막히지 않습니다. 바꿀 일이 없다면 `readonly`를 붙이세요.
- `b`는 `as const` 덕분에 `readonly` 튜플이 되어 `push` 자체가 없습니다.
- `c`는 `(string | number)[]`로 추론되었으므로 `true`는 그 집합 밖의 값입니다.
:::

## 확인 퀴즈

1. `string[]`과 `Array<string>`은 서로 다른 타입인가요?
2. `string | number[]`와 `(string | number)[]`의 차이를 한 문장으로 설명하세요.
3. 일반 배열을 `readonly` 배열 매개변수에 넘길 수 있나요? 반대는요?
4. `['S', 'M'] as const`의 타입은 무엇인가요?
5. 튜플 `[string, number]`에 `push`를 하면 컴파일 오류가 나나요?

::: details 정답 보기
1. 아닙니다. 쓰는 모양만 다를 뿐 완전히 같은 타입입니다.
2. 앞은 "문자열 하나 또는 숫자 배열", 뒤는 "문자열이나 숫자를 담는 배열"입니다.
3. 일반 → readonly는 됩니다(읽기만 하는 것은 안전). readonly → 일반은 안 됩니다(내용이 바뀔 수 있으므로).
4. `readonly ["S", "M"]`입니다. 리터럴 타입 + 튜플 + readonly가 한꺼번에 적용됩니다.
5. 나지 않습니다. 튜플의 push 함정입니다. `readonly` 튜플로 막습니다.
:::

## 정리

- 배열 타입은 `T[]` 또는 `Array<T>`로 씁니다. 둘은 같은 타입이며, 실무에서는 `T[]`를 더 많이 씁니다.
- 유니온 배열은 `(string | number)[]`처럼 **괄호를 꼭** 칩니다.
- `readonly T[]`는 배열 내용을 바꾸는 메서드를 막습니다. 배열을 바꾸지 않는 함수의 매개변수에 붙이는 습관을 들이세요.
- **튜플**은 길이와 자리별 타입이 정해진 배열입니다. 이름 붙은 튜플, 선택 요소(`?`), 나머지 요소(`...T[]`)를 쓸 수 있습니다.
- 튜플은 `push`를 막지 못하므로, 바꿀 일이 없으면 `readonly` 튜플로 씁니다.
- `as const`는 배열을 **리터럴 + 튜플 + readonly**로 고정합니다.

## 다음 단계

[객체 타입: 선택 속성 · readonly · 인덱스 시그니처](./04-object-types) — 상품·회원·주문처럼 속성이 여러 개인 객체에 타입을 붙이는 법, 있어도 되고 없어도 되는 속성, 키를 미리 알 수 없는 객체를 다루는 법을 배웁니다.
