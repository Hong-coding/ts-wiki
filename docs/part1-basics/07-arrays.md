---
title: '배열과 배열 메서드 (map · filter · reduce)'
---

# 배열과 배열 메서드 (map · filter · reduce)

<LessonMeta level="입문" :minutes="60" prev="함수를 선언하고 매개변수·반환값·화살표 함수·콜백으로 코드를 묶었습니다." />

## 이번에 배울 것

- **배열**을 만들고 **인덱스**(0부터 시작)와 `length`로 값을 꺼낼 수 있다.
- `push`·`pop`·`shift`·`unshift`·`splice`·`slice`로 값을 넣고 빼고 잘라낼 수 있으며, 어느 것이 **원본을 바꾸는지** 구분할 수 있다.
- `includes`·`indexOf`·`find`·`findIndex`·`some`·`every`로 원하는 값을 찾을 수 있다.
- `map`·`filter`·`reduce`가 한 단계씩 어떻게 동작하는지 표로 추적할 수 있다.
- `sort`의 숫자 정렬 함정을 피하고, 원본을 지키는 **불변성** 원칙에 따라 메서드를 이어 쓸 수 있다.

## 먼저 알아 둘 것

- [반복문](./05-loops) — `for`, `for...of`
- [함수 기초](./06-functions) — 화살표 함수, 콜백

## 비유로 이해하기

마트의 **번호표 붙은 진열 선반**을 떠올려 봅시다.

```text
선반 번호:   0        1        2        3
         ┌────────┬────────┬────────┬────────┐
         │ 생수   │ 컵라면 │ 우유   │ 김밥   │
         └────────┴────────┴────────┴────────┘
```

- 선반 전체가 **배열**(array)입니다. 이름표(변수) 하나로 여러 물건을 한꺼번에 관리합니다.
- 칸마다 붙은 번호가 **인덱스**(index)입니다. 이상하게도 **0번부터** 시작합니다.
- 칸에 놓인 물건 하나하나를 **요소**(element)라고 부릅니다.
- 칸이 몇 개인지가 **길이**(`length`)입니다.

변수 하나에 값 하나만 담는다면 상품이 100개일 때 변수 100개가 필요합니다. 배열은 "같은 종류의 값 여러 개를 **순서대로** 한 줄로 세워 담는 상자"입니다.

## 개념 설명

### 배열 만들기

대괄호 `[ ]` 안에 값을 쉼표로 나열합니다.

```ts
const products = ['생수', '컵라면', '우유', '김밥']
const prices = [900, 1300, 1700, 3500]

console.log(products)
console.log(prices)
```

실행 결과:

```text
[ '생수', '컵라면', '우유', '김밥' ]
[ 900, 1300, 1700, 3500 ]
```

VS Code에서 `products` 위에 마우스를 올리면 `const products: string[]`이 보입니다. `string[]`은 "문자열 배열", `number[]`는 "숫자 배열"이라는 뜻입니다. TypeScript는 배열에도 **한 종류의 값만** 넣도록 지켜 줍니다.

```ts
const prices = [900, 1300, 1700]
prices.push('2000')
// ❌ Argument of type 'string' is not assignable to parameter of type 'number'. (TS2345)
```

빈 배열로 시작할 때는 무엇을 담을지 타입을 적어 줍니다.

```ts
const cartItems: string[] = []
cartItems.push('바나나우유')
console.log(cartItems) // 출력: [ '바나나우유' ]
```

배열 타입의 자세한 문법(`Array<string>` 표기, 튜플 등)은 [배열 타입과 튜플](../part2-types/03-arrays-tuples)에서 다룹니다.

::: info const인데 push가 되나요?
`const`는 "변수에 **다른 배열을 다시 넣는 것**"만 막습니다. 상자는 그대로 두고 상자 **안의 내용물**을 바꾸는 `push`는 막지 않습니다. 이 차이는 [객체](./08-objects) 레슨의 "참조" 부분에서 그림과 함께 다시 설명합니다.
:::

### 인덱스와 length

```ts
const products = ['생수', '컵라면', '우유', '김밥']

console.log(products[0])                   // 출력: 생수
console.log(products[2])                   // 출력: 우유
console.log(products.length)               // 출력: 4
console.log(products[products.length - 1]) // 출력: 김밥
console.log(products[10])                  // 출력: undefined
```

- 인덱스는 **0부터** 셉니다. 그래서 첫 요소는 `[0]`, 마지막 요소는 `[length - 1]`입니다.
- 없는 칸(`[10]`)을 읽으면 오류가 아니라 `undefined`가 나옵니다.

::: warning TypeScript도 없는 칸은 모릅니다
`products[10]`의 타입을 보면 `string`이라고 나옵니다. 실제로는 `undefined`인데도요. 기본 설정의 TypeScript는 "인덱스가 범위 안에 있다"고 믿어 버립니다. 이를 더 엄격하게 검사하는 `noUncheckedIndexedAccess` 옵션은 [strict 옵션](../part6-tooling/02-strict-options)에서 다룹니다. 그전까지는 인덱스로 꺼낸 값을 쓸 때 범위를 직접 확인하는 습관을 들이세요.
:::

`.at(-1)`을 쓰면 뒤에서부터 셀 수 있습니다. `-1`이 마지막, `-2`가 끝에서 두 번째입니다(ES2022부터).

```ts
const products = ['생수', '컵라면', '우유', '김밥']
console.log(products.at(-1)) // 출력: 김밥
```

인덱스로 값을 바꿀 수도 있습니다.

```ts
const products = ['생수', '컵라면', '우유']
products[1] = '짜장라면'
console.log(products) // 출력: [ '생수', '짜장라면', '우유' ]
```

### 반복문으로 배열 돌기

배열의 모든 요소를 차례로 처리할 때는 [반복문](./05-loops)에서 배운 `for...of`가 가장 읽기 쉽습니다.

```ts
const prices = [900, 1300, 1700]
let total = 0
for (const price of prices) {
  total = total + price
}
console.log(total) // 출력: 3900
```

인덱스도 같이 필요하면 일반 `for`문을 씁니다.

```ts
const products = ['생수', '컵라면', '우유']
for (let i = 0; i < products.length; i++) {
  console.log(i + 1 + '. ' + products[i])
}
```

```text
1. 생수
2. 컵라면
3. 우유
```

### 넣고 빼기: push · pop · shift · unshift

| 메서드 | 하는 일 | 돌려주는 값 | 원본 변경 |
|---|---|---|---|
| `push(값)` | **맨 뒤**에 추가 | 새 길이 | O |
| `pop()` | **맨 뒤**에서 하나 꺼냄 | 꺼낸 값 | O |
| `unshift(값)` | **맨 앞**에 추가 | 새 길이 | O |
| `shift()` | **맨 앞**에서 하나 꺼냄 | 꺼낸 값 | O |

**메서드**(method)는 값에 붙어 있는 함수입니다. `배열.push(...)`처럼 점(`.`) 뒤에 이름을 쓰고 호출합니다.

```ts
const waitingList = ['A-101', 'A-102']

waitingList.push('A-103')          // 새 손님이 뒤에 줄 섬
console.log(waitingList)           // 출력: [ 'A-101', 'A-102', 'A-103' ]

const called = waitingList.shift() // 맨 앞 손님 호출
console.log(called)                // 출력: A-101
console.log(waitingList)           // 출력: [ 'A-102', 'A-103' ]

waitingList.unshift('VIP-001')     // VIP는 맨 앞으로
const last = waitingList.pop()     // 맨 뒤 손님이 떠남
console.log(last)                  // 출력: A-103
console.log(waitingList)           // 출력: [ 'VIP-001', 'A-102' ]
```

`shift()`와 `pop()`은 빈 배열에서 부르면 `undefined`를 돌려줍니다. 그래서 `called`의 타입은 `string | undefined`("문자열이거나 undefined")입니다. 이 `|` 표기는 [유니온 타입](../part2-types/06-union-literal)에서 배웁니다.

### 잘라내기: splice와 slice

이름이 비슷하지만 성격이 정반대이므로 꼭 구분해야 합니다.

| | `slice(시작, 끝)` | `splice(시작, 개수, ...넣을값)` |
|---|---|---|
| 하는 일 | 일부를 **복사**해서 새 배열로 | 일부를 **잘라내고** 그 자리에 넣기 |
| 원본 변경 | X (원본 그대로) | **O (원본이 바뀜)** |
| 돌려주는 값 | 복사한 새 배열 | 잘라낸 요소들의 배열 |

```ts
const menu = ['아메리카노', '라떼', '모카', '녹차', '자몽에이드']

// slice: 1번부터 3번 "직전"까지 복사 (끝 인덱스는 포함하지 않음)
const part = menu.slice(1, 3)
console.log(part) // 출력: [ '라떼', '모카' ]
console.log(menu) // 출력: [ '아메리카노', '라떼', '모카', '녹차', '자몽에이드' ]

// splice: 2번부터 1개를 지우고 그 자리에 '바닐라라떼'를 넣음
const removed = menu.splice(2, 1, '바닐라라떼')
console.log(removed) // 출력: [ '모카' ]
console.log(menu)    // 출력: [ '아메리카노', '라떼', '바닐라라떼', '녹차', '자몽에이드' ]
```

::: tip 기억하는 요령
`slice`는 케이크를 **사진으로 찍어 일부만 오려 내는** 것(진짜 케이크는 그대로), `splice`는 케이크를 **직접 도려내고 다른 걸 끼워 넣는** 수술입니다. `slice()`를 인자 없이 부르면 배열 전체를 복사합니다.
:::

### 찾기: includes · indexOf · find · findIndex · some · every

| 메서드 | 질문 | 돌려주는 값 |
|---|---|---|
| `includes(값)` | 이 값이 들어 있나? | `true` / `false` |
| `indexOf(값)` | 이 값이 몇 번 칸에 있나? | 인덱스, 없으면 `-1` |
| `find(조건함수)` | 조건에 맞는 **첫 요소**는? | 요소, 없으면 `undefined` |
| `findIndex(조건함수)` | 조건에 맞는 첫 요소의 **위치**는? | 인덱스, 없으면 `-1` |
| `some(조건함수)` | 조건에 맞는 게 **하나라도** 있나? | `true` / `false` |
| `every(조건함수)` | **모두** 조건에 맞나? | `true` / `false` |

`includes`와 `indexOf`는 값을 직접 넘기고, 나머지 넷은 **콜백**(조건을 검사하는 함수)을 넘깁니다. 배열이 각 요소를 콜백에 하나씩 넣어 보고 `true`가 나오는지 확인합니다.

```ts
const soldOut = ['딸기라떼', '말차라떼']
console.log(soldOut.includes('딸기라떼'))  // 출력: true
console.log(soldOut.indexOf('말차라떼'))   // 출력: 1
console.log(soldOut.indexOf('아메리카노')) // 출력: -1

const prices = [4500, 5000, 5500, 6500]
console.log(prices.find((price) => price > 5000))      // 출력: 5500
console.log(prices.findIndex((price) => price > 5000)) // 출력: 2
console.log(prices.find((price) => price > 10000))     // 출력: undefined
console.log(prices.some((price) => price >= 6000))     // 출력: true
console.log(prices.every((price) => price >= 5000))    // 출력: false
```

#### find의 결과는 없을 수도 있습니다

`find`는 못 찾으면 `undefined`를 돌려주므로, TypeScript는 결과를 바로 쓰지 못하게 막습니다.

```ts
const prices = [4500, 5000, 5500]
const expensive = prices.find((price) => price > 5000)
console.log(expensive * 2)
// ❌ 'expensive' is possibly 'undefined'. (TS18048)
```

`if`로 먼저 확인하면 그 안에서는 숫자로 쓸 수 있습니다.

```ts
const prices = [4500, 5000, 5500]
const expensive = prices.find((price) => price > 5000)
if (expensive !== undefined) {
  console.log(expensive * 2) // 출력: 11000
}
```

`if` 검사로 TypeScript가 타입을 좁혀 주는 원리는 [타입 좁히기](../part2-types/08-narrowing)에서 배웁니다.

### map: 모든 요소를 바꿔서 새 배열 만들기

여기서부터가 이번 레슨의 핵심입니다. `map`, `filter`, `reduce`는 모두 **콜백을 받아 원본은 그대로 두고 결과를 새로 만드는** 메서드입니다.

`map`은 각 요소를 콜백에 넣고, 콜백이 **돌려준 값들로 새 배열**을 만듭니다. 길이는 원본과 같습니다.

```ts
const prices = [4500, 5000, 5500]
const vatPrices = prices.map((price) => Math.round(price * 1.1))

console.log(vatPrices) // 출력: [ 4950, 5500, 6050 ]
console.log(prices)    // 출력: [ 4500, 5000, 5500 ]
```

| 단계 | `price` | 콜백 결과 | 지금까지 만든 배열 |
|---|---|---|---|
| 1 | `4500` | `4950` | `[4950]` |
| 2 | `5000` | `5500` | `[4950, 5500]` |
| 3 | `5500` | `6050` | `[4950, 5500, 6050]` |

마지막 줄에서 보듯 원본 `prices`는 그대로입니다. 콜백의 두 번째 매개변수로 **인덱스**도 받을 수 있습니다.

```ts
const products = ['생수', '컵라면', '우유']
const lines = products.map((name, index) => index + 1 + '. ' + name)
console.log(lines) // 출력: [ '1. 생수', '2. 컵라면', '3. 우유' ]
```

### filter: 조건에 맞는 것만 남기기

`filter`는 콜백이 `true`를 돌려준 요소만 모아 새 배열을 만듭니다. 길이는 같거나 줄어듭니다.

```ts
const stocks = [12, 0, 5, 0, 30]
const available = stocks.filter((stock) => stock > 0)
console.log(available) // 출력: [ 12, 5, 30 ]
```

| 단계 | `stock` | `stock > 0` | 남는가? | 지금까지 결과 |
|---|---|---|---|---|
| 1 | `12` | `true` | 남김 | `[12]` |
| 2 | `0` | `false` | 버림 | `[12]` |
| 3 | `5` | `true` | 남김 | `[12, 5]` |
| 4 | `0` | `false` | 버림 | `[12, 5]` |
| 5 | `30` | `true` | 남김 | `[12, 5, 30]` |

### reduce: 하나로 모으기

`reduce`는 배열 전체를 **값 하나로 줄이는**(reduce) 메서드입니다. 합계, 최댓값, 개수 세기 등에 씁니다. 처음에는 가장 어렵게 느껴지니 천천히 보겠습니다.

```ts
const prices = [4500, 5000, 5500]
const total = prices.reduce((sum, price) => sum + price, 0)
console.log(total) // 출력: 15000
```

- `reduce(콜백, 시작값)` 모양입니다. 여기서 시작값은 `0`입니다.
- 콜백은 매개변수 두 개를 받습니다.
  - `sum`: 지금까지 모은 값. **누산기**(accumulator)라고 부릅니다. 처음에는 시작값 `0`입니다.
  - `price`: 이번 차례의 요소.
- 콜백이 돌려준 값이 **다음 차례의 `sum`** 이 됩니다. 마지막 콜백이 돌려준 값이 최종 결과입니다.

| 단계 | `sum` (들어온 값) | `price` | 콜백 결과 `sum + price` |
|---|---|---|---|
| 1 | `0` (시작값) | `4500` | `4500` |
| 2 | `4500` | `5000` | `9500` |
| 3 | `9500` | `5500` | `15000` ← 최종 결과 |

반복문으로 쓴 합계와 비교해 보면 같은 일을 한다는 것을 알 수 있습니다.

```ts
const prices = [4500, 5000, 5500]
let sum = 0             // 시작값
for (const price of prices) {
  sum = sum + price     // 콜백이 하는 일
}
console.log(sum)        // 출력: 15000
```

`reduce`로 최댓값도 구할 수 있습니다.

```ts
const prices = [4500, 6500, 5500]
const maxPrice = prices.reduce((max, price) => (price > max ? price : max), 0)
console.log(maxPrice) // 출력: 6500
```

`조건 ? A : B`는 조건이 참이면 A, 거짓이면 B가 되는 삼항 연산자입니다([조건문](./04-conditionals)). 최댓값만 필요하면 `Math.max(...prices)`처럼 더 짧게 쓸 수도 있습니다.

::: tip 시작값은 항상 넣으세요
시작값을 생략하면 첫 요소가 시작값이 되는데, 빈 배열에서는 실행 오류가 납니다. 아래 "자주 하는 실수"의 4번에서 확인합니다.
:::

### forEach: 하나씩 실행만 하기

`forEach`는 각 요소로 콜백을 실행하기만 하고 **아무것도 돌려주지 않습니다**(`undefined`). 화면 출력처럼 "결과 배열이 필요 없는 일"에 씁니다.

```ts
const products = ['생수', '컵라면']
products.forEach((name, index) => {
  console.log(index, name)
})
```

```text
0 생수
1 컵라면
```

`forEach`는 중간에 `break`로 멈출 수 없습니다. 멈춰야 하면 `for...of`를 쓰세요. 새 배열을 만들 때는 `forEach` + `push`보다 `map`·`filter`가 짧고 의도가 분명합니다.

### sort: 정렬과 그 함정

`sort`는 배열을 정렬합니다. 그런데 두 가지 함정이 있습니다.

#### 함정 1. 숫자를 문자열처럼 정렬합니다

```ts
const prices = [1000, 250, 30, 4500]
prices.sort()
console.log(prices) // 출력: [ 1000, 250, 30, 4500 ]
```

정렬되지 않은 것처럼 보입니다. `sort()`는 기본적으로 **요소를 문자열로 바꿔 사전 순서로** 비교하기 때문입니다. `'1000'`은 `'1'`로 시작하므로 `'250'`보다 앞에 오고, `'30'`은 `'4500'`보다 앞에 옵니다.

숫자를 정렬하려면 **비교 함수**를 넘깁니다.

```ts
const prices = [1000, 250, 30, 4500]
prices.sort((a, b) => a - b) // 오름차순
console.log(prices) // 출력: [ 30, 250, 1000, 4500 ]

prices.sort((a, b) => b - a) // 내림차순
console.log(prices) // 출력: [ 4500, 1000, 250, 30 ]
```

비교 함수는 두 값 `a`, `b`를 받아서 **음수를 돌려주면 `a`를 앞에, 양수면 `b`를 앞에** 둡니다. `a - b`는 `a`가 작을수록 음수이므로 작은 값이 앞으로 오는 오름차순이 됩니다.

#### 함정 2. 원본을 바꿉니다

```ts
const original = [3, 1, 2]
const sorted = original.sort((a, b) => a - b)
console.log(sorted)   // 출력: [ 1, 2, 3 ]
console.log(original) // 출력: [ 1, 2, 3 ]
```

`original`도 바뀌었습니다. `sort`는 새 배열을 만들지 않고 **원본 자체를 정렬한 뒤 그 원본을 돌려줍니다**. 그래서 `sorted`와 `original`은 같은 배열입니다. 원본을 지키려면 먼저 복사한 뒤 정렬합니다.

```ts
const original = [3, 1, 2]
const sorted = [...original].sort((a, b) => a - b)
console.log(sorted)   // 출력: [ 1, 2, 3 ]
console.log(original) // 출력: [ 3, 1, 2 ]
```

`[...original]`은 배열을 펼쳐서 새 배열에 담는 **스프레드 문법**(spread)으로, 복사본을 만듭니다. [객체](./08-objects)에서 자세히 배웁니다. `original.slice()`로 복사해도 같습니다.

#### toSorted: 원본을 바꾸지 않는 정렬 (ES2023)

**ES2023**(2023년 JavaScript 표준)부터는 복사본을 정렬해 돌려주는 `toSorted`가 생겼습니다. 같은 이유로 `toReversed`(뒤집기), `toSpliced`, `with(인덱스, 값)`도 함께 추가되었습니다.

```ts
// tsconfig의 lib이 ES2023 이상일 때
const original = [3, 1, 2]
const sorted = original.toSorted((a, b) => a - b)
console.log(sorted)   // 출력: [ 1, 2, 3 ]
console.log(original) // 출력: [ 3, 1, 2 ]
```

다만 TypeScript가 이 메서드를 알려면 `tsconfig.json`의 `lib`(또는 `target`)이 `ES2023` 이상이어야 합니다. 설정이 ES2022 이하이면 다음 에러가 납니다.

```text
Property 'toSorted' does not exist on type 'number[]'. Do you need to change your target library?
Try changing the 'lib' compiler option to 'es2023' or later. (TS2550)
```

TypeScript는 5.2부터 이 메서드들의 타입을 제공하고, 실행 환경은 Node.js 20 이상과 최신 브라우저가 지원합니다. 오래된 환경을 지원해야 하는 프로젝트라면 `[...배열].sort()`를 쓰세요. `lib` 설정은 [tsconfig.json 완전 정복](../part6-tooling/01-tsconfig)에서 다룹니다.

### 불변성: 원본을 바꾸지 않는다

지금까지 메서드를 두 무리로 나눌 수 있습니다.

| 원본을 바꾸는 메서드 | 원본은 그대로, 새 값을 돌려주는 메서드 |
|---|---|
| `push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse` | `slice`, `map`, `filter`, `reduce`, `find`, `includes`, `toSorted`, `toReversed`, `concat` |

원본을 바꾸지 않고 새 값을 만드는 방식을 **불변성**(immutability)을 지킨다고 합니다. 왜 중요할까요?

```ts
function getTopTwo(prices: number[]) {
  return prices.sort((a, b) => b - a).slice(0, 2)
}

const menuPrices = [4500, 6500, 5000]
console.log(getTopTwo(menuPrices)) // 출력: [ 6500, 5000 ]
console.log(menuPrices)            // 출력: [ 6500, 5000, 4500 ]
```

"비싼 두 개만 보여 주는" 함수를 불렀을 뿐인데, 메뉴판 배열 `menuPrices`의 순서까지 바뀌었습니다. 함수를 부른 사람은 이런 일이 일어날 거라고 예상하지 못합니다. [함수 기초](./06-functions)에서 배운 **부수 효과**입니다. React 같은 화면 프레임워크는 "배열이 새로 만들어졌는지"로 화면을 다시 그릴지 판단하기 때문에, 원본을 직접 바꾸면 화면이 갱신되지 않는 버그도 생깁니다.

```ts
function getTopTwo(prices: number[]) {
  return [...prices].sort((a, b) => b - a).slice(0, 2)
}

const menuPrices = [4500, 6500, 5000]
console.log(getTopTwo(menuPrices)) // 출력: [ 6500, 5000 ]
console.log(menuPrices)            // 출력: [ 4500, 6500, 5000 ]
```

배열에 값을 추가할 때도 `push` 대신 새 배열을 만들 수 있습니다.

```ts
const cart = ['생수', '우유']
const newCart = [...cart, '김밥'] // 기존 요소를 펼치고 뒤에 추가
console.log(newCart) // 출력: [ '생수', '우유', '김밥' ]
console.log(cart)    // 출력: [ '생수', '우유' ]
```

::: info readonly 배열
TypeScript에서 `readonly string[]` 타입을 쓰면 `push`·`sort` 같은 변경 메서드 호출 자체를 막을 수 있습니다. [배열 타입과 튜플](../part2-types/03-arrays-tuples)에서 다룹니다.
:::

### 메서드 체이닝: 이어서 쓰기

`map`·`filter`는 새 배열을 돌려주므로, 그 결과에 바로 또 메서드를 붙일 수 있습니다. 이것을 **메서드 체이닝**(method chaining, 사슬처럼 잇기)이라고 합니다.

실무에서는 배열 안에 단순한 숫자보다 **객체**(여러 정보를 묶은 값)가 들어 있는 경우가 대부분입니다. 객체는 다음 레슨에서 자세히 배우지만, `{ 이름: 값 }` 모양이고 `item.price`처럼 점으로 꺼낸다는 것만 알면 아래 예제를 읽을 수 있습니다.

```ts
const orderItems = [
  { name: '아메리카노', price: 4500, quantity: 2 },
  { name: '치즈케이크', price: 6500, quantity: 0 },
  { name: '카페라떼', price: 5000, quantity: 1 },
  { name: '마카롱', price: 2500, quantity: 4 },
]

const total = orderItems
  .filter((item) => item.quantity > 0)        // 1) 수량 0인 항목 제외
  .map((item) => item.price * item.quantity)  // 2) 항목별 금액으로 변환
  .reduce((sum, amount) => sum + amount, 0)   // 3) 합계

console.log(total) // 출력: 24000
```

| 단계 | 결과 |
|---|---|
| 원본 | 4개 항목 |
| `filter` 후 | 아메리카노, 카페라떼, 마카롱 (3개) |
| `map` 후 | `[9000, 5000, 10000]` |
| `reduce` 후 | `24000` |

메서드마다 한 줄씩 쓰고 주석을 달면, 데이터가 어떻게 흘러가는지 위에서 아래로 읽힙니다. 각 단계가 원본을 바꾸지 않으므로 `orderItems`는 그대로 남아 있습니다.

## 자주 하는 실수

### 실수 1. 마지막 요소를 `[length]`로 꺼내기

```ts
const products = ['생수', '컵라면', '우유']
console.log(products[products.length]) // 출력: undefined
```

**왜 틀렸나**: 인덱스는 0부터 시작하므로 마지막 인덱스는 `length - 1`입니다. `products[3]`은 없는 칸입니다. TypeScript도 이 실수는 잡지 못합니다.

**고친 코드**:

```ts
const products = ['생수', '컵라면', '우유']
console.log(products[products.length - 1]) // 출력: 우유
console.log(products.at(-1))               // 출력: 우유
```

### 실수 2. 숫자 배열을 비교 함수 없이 정렬하기

```ts
const quantities = [10, 9, 100, 25]
quantities.sort()
console.log(quantities) // 출력: [ 10, 100, 25, 9 ]
```

**왜 틀렸나**: 기본 `sort()`는 문자열 사전 순서로 비교합니다.

**고친 코드**:

```ts
const quantities = [10, 9, 100, 25]
quantities.sort((a, b) => a - b)
console.log(quantities) // 출력: [ 9, 10, 25, 100 ]
```

### 실수 3. map 콜백에서 중괄호를 쓰고 return 빠뜨리기

```ts
const prices = [1000, 2000]
const doubled = prices.map((price) => {
  price * 2
})
console.log(doubled) // 출력: [ undefined, undefined ]
```

**왜 틀렸나**: [함수 기초](./06-functions)에서 본 실수와 같습니다. 중괄호를 쓰면 `return`을 써야 합니다. VS Code에서 `doubled` 위에 마우스를 올리면 `void[]`로 보여 이상하다는 걸 알 수 있습니다.

**고친 코드**:

```ts
const prices = [1000, 2000]
const doubled = prices.map((price) => price * 2)
console.log(doubled) // 출력: [ 2000, 4000 ]
```

### 실수 4. reduce에 시작값을 빠뜨리기

```ts
const emptyCart: number[] = []
const total = emptyCart.reduce((sum, price) => sum + price)
// 실행하면: TypeError: Reduce of empty array with no initial value
```

**왜 틀렸나**: 시작값이 없으면 첫 요소를 시작값으로 쓰는데, 빈 배열에는 첫 요소가 없어 실행 중에 프로그램이 멈춥니다. TypeScript는 이 오류를 미리 잡지 못합니다. 장바구니가 비어 있는 경우는 실무에서 아주 흔합니다.

**고친 코드**:

```ts
const emptyCart: number[] = []
const total = emptyCart.reduce((sum, price) => sum + price, 0)
console.log(total) // 출력: 0
```

### 실수 5. find 결과를 확인 없이 쓰기

```ts
const memberIds = ['M001', 'M002']
const found = memberIds.find((id) => id === 'M003')
console.log(found.length)
// ❌ 'found' is possibly 'undefined'. (TS18048)
```

**왜 틀렸나**: 못 찾으면 `undefined`인데, `undefined.length`는 실행 오류입니다. TypeScript가 미리 막아 줬습니다.

**고친 코드**:

```ts
const memberIds = ['M001', 'M002']
const found = memberIds.find((id) => id === 'M003')
if (found === undefined) {
  console.log('회원을 찾을 수 없습니다.')
} else {
  console.log(found.length)
}
// 출력: 회원을 찾을 수 없습니다.
```

## 직접 해 보기

### 문제 1. 첫 메뉴와 마지막 메뉴 ⭐

`const menu = ['아메리카노', '라떼', '모카', '녹차']`에서 첫 메뉴, 마지막 메뉴(인덱스로), 메뉴 개수를 출력하세요.

::: details 정답 보기
```ts
const menu = ['아메리카노', '라떼', '모카', '녹차']
console.log(menu[0])               // 출력: 아메리카노
console.log(menu[menu.length - 1]) // 출력: 녹차
console.log(menu.length)           // 출력: 4
```
:::

### 문제 2. 품절 상품 제외하고 이름만 뽑기 ⭐

아래 재고 목록에서 재고가 `0`보다 큰 상품의 **이름만** 담은 배열을 만드세요.

```ts
const inventory = [
  { name: '생수', stock: 24 },
  { name: '컵라면', stock: 0 },
  { name: '우유', stock: 6 },
]
```

::: details 정답 보기
```ts
const inventory = [
  { name: '생수', stock: 24 },
  { name: '컵라면', stock: 0 },
  { name: '우유', stock: 6 },
]

const availableNames = inventory
  .filter((item) => item.stock > 0)
  .map((item) => item.name)

console.log(availableNames) // 출력: [ '생수', '우유' ]
```

`filter`로 먼저 거르고 `map`으로 이름을 뽑습니다. 순서를 바꾸면 이름만 남은 뒤라 재고를 볼 수 없습니다.
:::

### 문제 3. 장바구니 합계와 할인 ⭐⭐

장바구니 가격 배열 `[12000, 8500, 4000, 15500]`의 합계를 `reduce`로 구하고, 합계가 `30000`원 이상이면 10% 할인한 금액을, 아니면 합계 그대로를 출력하세요. `reduce`의 단계별 추적 표도 직접 그려 보세요.

::: details 정답 보기
```ts
const cartPrices = [12000, 8500, 4000, 15500]
const subtotal = cartPrices.reduce((sum, price) => sum + price, 0)
const payment = subtotal >= 30000 ? subtotal * 0.9 : subtotal

console.log(subtotal) // 출력: 40000
console.log(payment)  // 출력: 36000
```

| 단계 | `sum` | `price` | 결과 |
|---|---|---|---|
| 1 | `0` | `12000` | `12000` |
| 2 | `12000` | `8500` | `20500` |
| 3 | `20500` | `4000` | `24500` |
| 4 | `24500` | `15500` | `40000` |
:::

### 문제 4. 원본을 지키며 가격순 정렬 ⭐⭐

`const prices = [5500, 900, 12000, 3200]`을 **오름차순**으로 정렬한 새 배열을 만드세요. 정렬 후에도 `prices`는 원래 순서여야 합니다. `toSorted` 없이 풀어 보세요.

::: details 정답 보기
```ts
const prices = [5500, 900, 12000, 3200]
const ascending = [...prices].sort((a, b) => a - b)

console.log(ascending) // 출력: [ 900, 3200, 5500, 12000 ]
console.log(prices)    // 출력: [ 5500, 900, 12000, 3200 ]
```

ES2023 환경이면 `prices.toSorted((a, b) => a - b)`로도 같은 결과를 얻습니다.
:::

### 문제 5. 주문 검사 ⭐⭐

주문 수량 배열 `[2, 1, 0, 3]`에 대해 다음을 출력하세요.

1. 수량이 0인 항목이 하나라도 있는지
2. 모든 수량이 10 이하인지
3. 처음으로 수량이 0인 항목의 인덱스

::: details 정답 보기
```ts
const quantities = [2, 1, 0, 3]
console.log(quantities.some((q) => q === 0))      // 출력: true
console.log(quantities.every((q) => q <= 10))     // 출력: true
console.log(quantities.findIndex((q) => q === 0)) // 출력: 2
```
:::

### 문제 6. 영수증 줄 만들기 ⭐⭐⭐

아래 주문 목록으로 영수증 줄 배열과 총액을 만드세요. 수량이 0인 항목은 제외하고, 각 줄은 `'아메리카노 x2 = 9000'` 모양입니다. 마지막에 `forEach`로 줄을 출력하고 `'합계 = (총액)'`을 출력하세요.

```ts
const orderItems = [
  { name: '아메리카노', price: 4500, quantity: 2 },
  { name: '스콘', price: 3500, quantity: 0 },
  { name: '자몽에이드', price: 6000, quantity: 1 },
]
```

::: details 정답 보기
```ts
const orderItems = [
  { name: '아메리카노', price: 4500, quantity: 2 },
  { name: '스콘', price: 3500, quantity: 0 },
  { name: '자몽에이드', price: 6000, quantity: 1 },
]

const validItems = orderItems.filter((item) => item.quantity > 0)

const lines = validItems.map(
  (item) => item.name + ' x' + item.quantity + ' = ' + item.price * item.quantity,
)
const total = validItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

lines.forEach((line) => console.log(line))
console.log('합계 = ' + total)
```

출력:

```text
아메리카노 x2 = 9000
자몽에이드 x1 = 6000
합계 = 15000
```

`reduce`의 누산기 `sum`은 숫자이고 요소 `item`은 객체입니다. 이처럼 누산기와 요소의 타입이 달라도 됩니다. 이때 시작값 `0`이 누산기의 타입을 정해 주므로 시작값이 더욱 중요합니다. 문자열을 더 깔끔하게 만드는 템플릿 리터럴은 [문자열](./09-strings)에서 배웁니다.
:::

## 확인 퀴즈

**Q1.** `const a = ['x', 'y', 'z']`에서 `a[a.length - 1]`과 `a[3]`의 값은 각각 무엇인가요?

::: details 정답 보기
`'z'`와 `undefined`입니다. 인덱스는 0부터 시작하므로 마지막 인덱스는 2입니다.
:::

**Q2.** `slice`와 `splice` 중 원본 배열을 바꾸는 것은 무엇인가요?

::: details 정답 보기
`splice`입니다. `slice`는 일부를 복사한 새 배열을 돌려주고 원본은 그대로 둡니다.
:::

**Q3.** `map`, `filter`, `reduce`가 돌려주는 값은 각각 무엇인가요?

::: details 정답 보기
`map`은 원본과 길이가 같은 새 배열, `filter`는 조건에 맞는 요소만 담은 새 배열(길이가 같거나 짧음), `reduce`는 누산기에 모은 값 하나입니다.
:::

**Q4.** `[5, 40, 300].sort()`의 결과가 `[300, 40, 5]`로 나오는 이유와 해결법은 무엇인가요?

::: details 정답 보기
기본 `sort()`는 요소를 문자열로 바꿔 사전 순서로 비교하므로 `'300'`, `'40'`, `'5'` 순서가 됩니다(첫 글자 `'3'` < `'4'` < `'5'`). 숫자 정렬은 `sort((a, b) => a - b)`처럼 비교 함수를 넘깁니다.
:::

**Q5.** `find`의 결과를 바로 계산에 쓰면 TypeScript가 막는 이유는 무엇인가요?

::: details 정답 보기
조건에 맞는 요소가 없으면 `undefined`를 돌려주므로 결과 타입에 `undefined`가 포함되기 때문입니다. `if`로 `undefined`가 아님을 확인한 뒤 써야 합니다.
:::

## 정리

- 배열은 값 여러 개를 순서대로 담는 상자입니다. 인덱스는 **0부터**, 마지막은 `length - 1`(또는 `at(-1)`)입니다.
- `push`·`pop`·`shift`·`unshift`·`splice`·`sort`는 **원본을 바꾸고**, `slice`·`map`·`filter`·`reduce`·`toSorted`는 **새 값을 돌려줍니다**.
- 찾기는 `includes`·`indexOf`(값으로), `find`·`findIndex`·`some`·`every`(조건 콜백으로). `find`는 못 찾으면 `undefined`입니다.
- `map`은 바꾸기, `filter`는 거르기, `reduce`는 모으기. `reduce`에는 시작값을 꼭 넣습니다.
- 숫자 정렬은 `sort((a, b) => a - b)`. 원본을 지키려면 `[...배열].sort()` 또는 ES2023의 `toSorted`를 씁니다.
- 원본을 바꾸지 않는 **불변성**을 지키면 예상치 못한 부수 효과를 막을 수 있고, 메서드 체이닝으로 데이터 흐름을 읽기 좋게 만들 수 있습니다.

## 다음 단계

[객체: 속성 · 메서드 · 구조 분해 · 스프레드](./08-objects) — 이번 레슨 끝에서 맛본 `{ name, price }` 같은 객체를 제대로 배웁니다. 배열과 객체를 함께 다루면 실무 데이터 대부분을 표현할 수 있습니다.
