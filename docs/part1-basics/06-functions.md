---
title: '함수 기초: 선언 · 화살표 함수 · 매개변수 · 반환값'
---

# 함수 기초: 선언 · 화살표 함수 · 매개변수 · 반환값

<LessonMeta level="입문" :minutes="60" prev="for·while·for...of로 같은 작업을 여러 번 반복하는 법을 배웠습니다." />

## 이번에 배울 것

- 함수가 왜 필요한지 "중복 제거"와 "이름 붙이기" 관점에서 설명할 수 있다.
- 함수를 **선언**하고 **호출**할 수 있으며, **매개변수**와 **인자**를 구분할 수 있다.
- `return`으로 값을 돌려주고, `return`이 없을 때 `undefined`가 나오는 이유를 말할 수 있다.
- 함수 선언문·함수 표현식·화살표 함수 세 가지 모양을 읽고 쓸 수 있다.
- 기본값 매개변수, 나머지 매개변수, 순수 함수, 콜백의 뜻을 설명할 수 있다.

## 먼저 알아 둘 것

- [값과 변수: let · const](./01-values-and-variables) — 변수 선언과 타입 추론 맛보기
- [원시 타입](./02-primitive-types) — `number`, `string`, `boolean`, `undefined`
- [조건문](./04-conditionals)과 [반복문](./05-loops) — `if`, `for...of`

## 비유로 이해하기

카페 주방 벽에 **레시피 카드**가 붙어 있다고 생각해 봅시다.

```text
[카페라떼 레시피]
재료: 샷 개수, 우유 양
1. 에스프레소를 (샷 개수)만큼 내린다
2. 우유 (우유 양)ml를 데운다
3. 둘을 합쳐서 손님에게 낸다
```

- 레시피 카드를 **벽에 붙이는 일**은 함수를 **선언**(declaration)하는 것입니다. 붙이기만 해서는 커피가 나오지 않습니다.
- 주문이 들어와서 "라떼 하나, 샷 2개, 우유 200ml!" 하고 **레시피대로 만드는 일**이 함수를 **호출**(call)하는 것입니다.
- 카드에 적힌 "샷 개수", "우유 양" 같은 빈칸이 **매개변수**(parameter)입니다.
- 주문할 때 실제로 채워 넣는 "2", "200" 같은 값이 **인자**(argument)입니다.
- 마지막에 손님에게 건네는 커피가 **반환값**(return value)입니다.

레시피 카드가 있으면 직원 누구나 같은 맛을 낼 수 있고, 레시피를 고치면 모든 라떼가 한꺼번에 바뀝니다. 함수도 똑같습니다. **한 번 정의하고, 필요할 때마다 이름으로 불러서 씁니다.**

## 개념 설명

### 왜 함수가 필요한가

장바구니 세 개의 합계를 부가세 포함으로 계산한다고 해 봅시다.

```ts
const cartA = 12000
const cartB = 8500
const cartC = 31000

console.log(Math.round(cartA * 1.1))
console.log(Math.round(cartB * 1.1))
console.log(Math.round(cartC * 1.1))
// 출력: 13200
// 출력: 9350
// 출력: 34100
```

`Math.round(값)`은 소수점 첫째 자리에서 반올림하는 JavaScript 내장 기능입니다. 동작은 맞지만 문제가 있습니다.

1. **같은 계산이 세 번 반복됩니다.** 부가세율이 바뀌면 세 군데를 모두 고쳐야 하고, 하나라도 빠뜨리면 버그입니다.
2. **`* 1.1`이 무슨 뜻인지 코드만 봐서는 모릅니다.** 읽는 사람이 "아, 부가세구나" 하고 추측해야 합니다.

함수로 바꿔 보겠습니다.

```ts
function addVat(amount: number) {
  return Math.round(amount * 1.1)
}

console.log(addVat(12000)) // 출력: 13200
console.log(addVat(8500))  // 출력: 9350
console.log(addVat(31000)) // 출력: 34100
```

이제 계산 방법은 **한 곳**에만 있고, `addVat`(부가세 더하기)라는 **이름**이 계산의 의미를 알려 줍니다. 함수의 쓸모는 이 두 가지로 요약됩니다.

| 쓸모 | 설명 |
|---|---|
| 중복 제거 | 같은 코드를 한 번만 쓰고 여러 번 부른다. 고칠 곳이 하나뿐이다. |
| 이름 붙이기 | 코드 덩어리에 의미 있는 이름을 붙여, 읽는 사람이 "무엇을 하는지"를 바로 안다. |

### 함수 선언과 호출

함수를 만드는 가장 기본 모양을 **함수 선언문**(function declaration)이라고 합니다.

```ts
function greet() {
  console.log('어서 오세요, 한빛 카페입니다.')
}

greet() // 호출 1
greet() // 호출 2
```

실행 결과:

```text
어서 오세요, 한빛 카페입니다.
어서 오세요, 한빛 카페입니다.
```

조각을 나눠 보면 다음과 같습니다.

| 조각 | 뜻 |
|---|---|
| `function` | "함수를 하나 만들겠다"는 키워드 |
| `greet` | 함수 이름. 변수처럼 camelCase로, **동사로 시작**하면 읽기 좋습니다 (`calculateTotal`, `printReceipt`) |
| `()` | 매개변수 목록이 들어갈 자리. 받을 값이 없으면 비워 둡니다 |
| `{ ... }` | **함수 본문**(body). 호출될 때 실행할 코드 |
| `greet()` | 호출. 이름 뒤에 **괄호를 붙여야** 실행됩니다 |

::: warning 선언만으로는 아무 일도 일어나지 않습니다
`function greet() { ... }`까지만 쓰고 `greet()`를 부르지 않으면 화면에 아무것도 찍히지 않습니다. 레시피 카드를 벽에 붙였을 뿐 커피를 만들지 않은 것과 같습니다.
:::

### 매개변수와 인자

함수가 바깥에서 값을 받으려면 괄호 안에 **매개변수**를 적습니다.

```ts
function printOrder(menu: string, quantity: number) {
  console.log(menu, quantity, '잔 주문 받았습니다.')
}

printOrder('아메리카노', 2)
printOrder('카페라떼', 1)
```

실행 결과:

```text
아메리카노 2 잔 주문 받았습니다.
카페라떼 1 잔 주문 받았습니다.
```

- `menu`, `quantity`는 **매개변수**(parameter)입니다. 함수 안에서만 쓰는 변수이며, 호출될 때마다 새 값이 채워집니다.
- `'아메리카노'`, `2`는 **인자**(argument)입니다. 호출할 때 실제로 넘기는 값입니다.
- 인자는 **순서대로** 매개변수에 들어갑니다. 첫 번째 인자는 첫 번째 매개변수로, 두 번째 인자는 두 번째 매개변수로 갑니다.

::: tip 기억하는 요령
**매**개변수는 함수를 **만들 때** 적는 빈칸, **인**자는 함수를 **부를 때** 넣는 실제 값입니다. 실무 대화에서는 둘을 섞어 부르는 경우도 많지만, 에러 메시지에서는 구분해서 쓰므로 알아 두면 좋습니다.
:::

#### 매개변수에는 타입을 적습니다

`menu: string`처럼 매개변수 뒤의 `: 타입`은 "이 자리에는 이런 종류의 값만 받겠다"는 표시입니다. 변수는 처음 넣은 값으로 타입을 추론할 수 있었지만, 매개변수는 **함수를 만드는 시점에 어떤 값이 들어올지 알 수 없으므로** 직접 적어 줘야 합니다. 적지 않으면 strict 모드에서 오류가 납니다.

```ts
function addVat(amount) {
  return amount * 1.1
}
// ❌ Parameter 'amount' implicitly has an 'any' type. (TS7006)
```

타입을 적어 두면, 잘못된 값을 넘기는 실수를 **실행하기 전에** 잡아 줍니다.

```ts
function addVat(amount: number) {
  return Math.round(amount * 1.1)
}

addVat('12000')
// ❌ Argument of type 'string' is not assignable to parameter of type 'number'. (TS2345)
addVat()
// ❌ Expected 1 arguments, but got 0. (TS2554)
```

JavaScript였다면 `'12000' * 1.1`이 몰래 계산되거나 `undefined * 1.1`이 `NaN`이 되어 엉뚱한 금액이 영수증에 찍혔을 것입니다. 함수 타입을 더 깊이 다루는 방법은 [함수 타입](../part2-types/05-function-types)에서 배웁니다.

### return: 값을 돌려주기

`console.log`로 화면에 찍는 것과 **값을 돌려주는 것**은 다릅니다. 함수가 계산한 결과를 바깥에서 쓰려면 `return`으로 돌려줘야 합니다.

```ts
function calculateSubtotal(unitPrice: number, quantity: number) {
  return unitPrice * quantity
}

const latteTotal = calculateSubtotal(5000, 2)
const cookieTotal = calculateSubtotal(2500, 3)
console.log(latteTotal + cookieTotal) // 출력: 17500
```

`calculateSubtotal(5000, 2)`라는 호출 자체가 **값 `10000`으로 바뀐다**고 생각하면 됩니다. 그래서 변수에 담을 수도 있고, 계산식 안에 바로 넣을 수도 있습니다.

```ts
function calculateSubtotal(unitPrice: number, quantity: number) {
  return unitPrice * quantity
}

console.log(calculateSubtotal(5000, 2) + calculateSubtotal(2500, 3)) // 출력: 17500
```

#### return을 만나면 함수는 즉시 끝납니다

`return` 아래에 있는 코드는 실행되지 않습니다. 이 성질을 이용해 "조건이 맞지 않으면 일찍 빠져나가기"를 자주 씁니다. 이것을 **조기 반환**(early return)이라고 합니다.

```ts
function getShippingFee(orderAmount: number) {
  if (orderAmount >= 30000) {
    return 0 // 3만 원 이상이면 무료 배송, 여기서 함수 종료
  }
  return 3000
}

console.log(getShippingFee(45000)) // 출력: 0
console.log(getShippingFee(12000)) // 출력: 3000
```

#### return이 없으면 undefined

`return`이 없는 함수를 호출하면 결과는 `undefined`(값이 없음)입니다.

```ts
function printTotal(total: number) {
  console.log('합계:', total)
}

const result = printTotal(9000)
console.log(result)
```

실행 결과:

```text
합계: 9000
undefined
```

`printTotal`은 화면에 찍기만 하고 아무것도 돌려주지 않았으므로 `result`에는 `undefined`가 들어갑니다. VS Code에서 `printTotal` 위에 마우스를 올리면 `function printTotal(total: number): void`라고 보입니다. **`void`** 는 "이 함수는 돌려주는 값이 없다"는 뜻의 타입입니다. `void`는 [특수 타입](../part2-types/02-special-types)에서 자세히 다룹니다.

::: info console.log와 return의 차이
- `console.log`: 사람이 보라고 **화면에 찍는** 것. 프로그램은 그 값을 다시 쓸 수 없습니다.
- `return`: 프로그램이 쓰라고 **값을 돌려주는** 것. 변수에 담고, 다른 계산에 이어 쓸 수 있습니다.

계산하는 함수는 `return`하고, 화면 출력은 마지막에 따로 하는 것이 좋은 습관입니다.
:::

#### 반환 타입 적기

반환값의 타입도 TypeScript가 추론해 주지만, 괄호 뒤에 `: 타입`으로 직접 적을 수도 있습니다.

```ts
function getShippingFee(orderAmount: number): number {
  if (orderAmount >= 30000) {
    return 0
  }
  return 3000
}
```

직접 적어 두면 "이 함수는 반드시 숫자를 돌려준다"는 약속이 되어, 깜빡하고 `return`을 빠뜨린 경우를 잡아 줍니다. 이 예는 [자주 하는 실수](#실수-3-일부-경로에서-return을-빠뜨리기)에서 봅니다.

### 함수 호출 흐름 추적하기

함수가 함수를 부르면 실행 순서가 헷갈리기 쉽습니다. 아래 코드를 한 줄씩 따라가 봅시다.

```ts
function calculateSubtotal(unitPrice: number, quantity: number) {
  return unitPrice * quantity
}

function calculateTotal(unitPrice: number, quantity: number, shippingFee: number) {
  const subtotal = calculateSubtotal(unitPrice, quantity)
  return subtotal + shippingFee
}

const total = calculateTotal(4500, 3, 3000)
console.log(total) // 출력: 16500
```

| 순서 | 실행 위치 | 일어나는 일 |
|---|---|---|
| 1 | 맨 아래 `calculateTotal(4500, 3, 3000)` | `calculateTotal`로 들어감. `unitPrice=4500`, `quantity=3`, `shippingFee=3000` |
| 2 | `calculateTotal` 첫 줄 | `calculateSubtotal(4500, 3)`을 호출하며 **잠시 멈춤** |
| 3 | `calculateSubtotal` 안 | `4500 * 3`을 계산해 `13500`을 돌려주고 끝남 |
| 4 | `calculateTotal`로 복귀 | 멈췄던 자리에서 `subtotal = 13500` |
| 5 | `calculateTotal` 둘째 줄 | `13500 + 3000 = 16500`을 돌려주고 끝남 |
| 6 | 맨 아래로 복귀 | `total = 16500`, 화면에 출력 |

핵심은 **호출하면 그 함수 안으로 들어갔다가, `return`을 만나면 부른 자리로 정확히 돌아온다**는 것입니다. 컴퓨터는 "어디서 불렀는지"를 쌓아 두고 기억하는데, 이 기록을 **콜 스택**(call stack)이라고 합니다. 에러가 났을 때 보이는 긴 목록이 바로 이 콜 스택이며, [오류 처리](./11-errors)에서 다시 만납니다.

### 함수 표현식: 함수를 변수에 담기

JavaScript에서 함수는 숫자나 문자열처럼 **값**입니다. 그래서 변수에 담을 수 있습니다. 이 모양을 **함수 표현식**(function expression)이라고 합니다.

```ts
const applyDiscount = function (price: number, rate: number) {
  return price - price * rate
}

console.log(applyDiscount(20000, 0.1)) // 출력: 18000
```

함수 선언문과의 가장 큰 차이는 **호출할 수 있는 시점**입니다.

```ts
console.log(double(5)) // 출력: 10  ← 선언문은 선언보다 위에서 불러도 됨

function double(n: number) {
  return n * 2
}
```

함수 선언문은 파일이 실행되기 전에 미리 준비되기 때문에 위에서 불러도 동작합니다. 이 현상을 **호이스팅**(hoisting, 끌어올림)이라고 하며 [스코프와 클로저](./10-scope-closure)에서 자세히 다룹니다. 반면 `const`에 담은 함수 표현식은 그 줄이 실행된 뒤에만 쓸 수 있습니다.

```ts
console.log(triple(5))
// ❌ Block-scoped variable 'triple' used before its declaration. (TS2448)
// ❌ Variable 'triple' is used before being assigned. (TS2454)

const triple = function (n: number) {
  return n * 3
}
```

TypeScript가 두 가지 에러로 미리 막아 줍니다. 무시하고 실행하면 `ReferenceError: Cannot access 'triple' before initialization`이라는 실행 오류로 프로그램이 멈춥니다.

### 화살표 함수

함수 표현식을 더 짧게 쓰는 문법이 **화살표 함수**(arrow function)입니다. `function` 키워드 대신 `=>`(화살표)를 씁니다. ES2015부터 생긴 문법이며, 요즘 코드에서 가장 많이 보는 모양입니다.

```ts
// 함수 표현식
const addVat1 = function (amount: number) {
  return Math.round(amount * 1.1)
}

// 화살표 함수 (중괄호 있음)
const addVat2 = (amount: number) => {
  return Math.round(amount * 1.1)
}

// 화살표 함수 (중괄호 없음)
const addVat3 = (amount: number) => Math.round(amount * 1.1)

console.log(addVat1(10000), addVat2(10000), addVat3(10000))
// 출력: 11000 11000 11000
```

세 함수는 모두 같은 일을 합니다.

#### 중괄호가 있을 때와 없을 때

| 모양 | 규칙 |
|---|---|
| `(a) => { ... }` | 본문이 여러 줄일 때. 값을 돌려주려면 **`return`을 반드시 써야** 합니다 |
| `(a) => 식` | 본문이 식 하나일 때. 그 식의 결과가 **자동으로 반환**됩니다 (`return`을 쓰지 않음) |

중괄호를 쓰고 `return`을 빠뜨리면 `undefined`가 반환됩니다. 초보자가 가장 많이 하는 실수 중 하나입니다.

```ts
const getPoint = (amount: number) => {
  amount * 0.01 // return이 없음!
}
console.log(getPoint(50000)) // 출력: undefined
```

#### 매개변수가 하나일 때

매개변수가 하나이고 타입을 적지 않아도 되는 경우에는 괄호를 생략할 수 있습니다(`n => n * 2`). 하지만 TypeScript에서는 대부분 타입을 적으므로 **괄호를 항상 쓰는 편**이 일관성 있습니다. 매개변수가 없으면 빈 괄호를 씁니다.

```ts
const sayThanks = () => console.log('감사합니다. 또 오세요!')
sayThanks() // 출력: 감사합니다. 또 오세요!
```

#### 객체를 바로 돌려줄 때는 괄호로 감쌉니다

중괄호 `{ }`는 "함수 본문"과 "객체"(여러 값을 묶은 것, [객체](./08-objects)에서 배움) 두 가지로 쓰입니다. 중괄호 없는 화살표 함수로 객체를 돌려주려면 **소괄호로 감싸야** 본문이 아니라 객체로 읽힙니다.

```ts
const makeItem = (name: string, price: number) => ({ name, price })
console.log(makeItem('바닐라라떼', 5500))
// 출력: { name: '바닐라라떼', price: 5500 }
```

::: tip 언제 무엇을 쓰나
- 파일의 주요 기능을 이루는 함수: **함수 선언문**(`function calculateTotal() {}`)이 눈에 잘 띄어 좋습니다.
- 다른 함수에 넘기는 짧은 함수(뒤에 나올 콜백): **화살표 함수**가 간결합니다.

팀마다 규칙이 다를 수 있으니 프로젝트의 기존 코드를 따르세요. 화살표 함수는 `this`라는 값을 다루는 방식도 다른데, 이는 [객체](./08-objects)에서 다룹니다.
:::

### 기본값 매개변수

인자를 넘기지 않았을 때 쓸 값을 미리 정할 수 있습니다. 이것을 **기본값 매개변수**(default parameter)라고 합니다.

```ts
function calculatePrice(price: number, discountRate = 0) {
  return price - price * discountRate
}

console.log(calculatePrice(10000))      // 출력: 10000  ← discountRate는 0
console.log(calculatePrice(10000, 0.2)) // 출력: 8000
```

- `discountRate = 0`처럼 `=`로 기본값을 적습니다.
- 기본값이 숫자이므로 TypeScript가 `discountRate`의 타입을 `number`로 추론합니다. 타입을 따로 적지 않아도 됩니다.
- 인자를 넘기지 않거나 `undefined`를 넘기면 기본값이 쓰입니다.

기본값이 있는 매개변수는 **뒤쪽에** 두는 것이 좋습니다. 앞에 두면 그 자리를 건너뛸 방법이 없어서 결국 매번 값을 넘겨야 합니다.

::: info 선택 매개변수 `?`
`function greet(name?: string)`처럼 매개변수 이름 뒤에 `?`를 붙이면 "넘겨도 되고 안 넘겨도 되는" **선택 매개변수**가 됩니다. 넘기지 않으면 `undefined`가 들어옵니다. 자세한 내용은 [함수 타입](../part2-types/05-function-types)에서 다룹니다.
:::

### 나머지 매개변수 맛보기

인자 개수가 정해져 있지 않을 때가 있습니다. 예를 들어 "넘긴 상품 가격을 몇 개든 전부 더하기"입니다. 이때 **나머지 매개변수**(rest parameter)를 씁니다.

```ts
function sumPrices(...prices: number[]) {
  let total = 0
  for (const price of prices) {
    total = total + price
  }
  return total
}

console.log(sumPrices(1500))             // 출력: 1500
console.log(sumPrices(1500, 2000, 3200)) // 출력: 6700
console.log(sumPrices())                 // 출력: 0
```

- 매개변수 앞의 `...`(점 세 개)는 "남은 인자를 전부 모아 하나로 받겠다"는 뜻입니다.
- `number[]`는 "숫자 여러 개를 담은 목록", 즉 **숫자 배열**이라는 타입입니다. 배열은 바로 다음 레슨 [배열](./07-arrays)에서 배웁니다.
- 나머지 매개변수는 **맨 마지막에 하나만** 올 수 있습니다.

### 순수 함수

같은 입력을 넣으면 **항상 같은 결과**를 돌려주고, 함수 바깥의 어떤 것도 바꾸지 않는 함수를 **순수 함수**(pure function)라고 합니다.

```ts
// 순수 함수: 입력만 보고 결과를 돌려줌
function calculatePoint(amount: number) {
  return Math.floor(amount * 0.01)
}

// 순수하지 않은 함수: 바깥 변수를 바꿈
let totalPoint = 0
function addPoint(amount: number) {
  totalPoint = totalPoint + Math.floor(amount * 0.01)
}

console.log(calculatePoint(25000)) // 출력: 250
addPoint(25000)
addPoint(25000)
console.log(totalPoint)            // 출력: 500
```

`Math.floor(값)`은 소수점 아래를 버리는 내장 기능입니다.

`addPoint`처럼 함수 바깥의 상태를 바꾸는 것을 **부수 효과**(side effect)라고 합니다. 화면 출력(`console.log`), 파일 저장, 서버 요청도 모두 부수 효과입니다. 부수 효과가 나쁜 것은 아닙니다. 프로그램은 결국 무언가를 바꾸려고 실행하니까요. 다만 다음 원칙이 실무에서 아주 유용합니다.

> **계산은 순수 함수로, 부수 효과는 한곳에 모아서.**

순수 함수는 입력과 출력만 확인하면 되므로 테스트하기 쉽고, 어디서 불러도 결과가 같아서 안심하고 재사용할 수 있습니다.

### 콜백: 함수를 인자로 넘기기

함수가 값이라는 것은 **다른 함수의 인자로 넘길 수도 있다**는 뜻입니다. 이렇게 인자로 넘겨져서 나중에 불리는 함수를 **콜백**(callback, 나중에 다시 불러 달라는 함수)이라고 합니다.

```ts
function processOrder(orderNo: string, onComplete: (message: string) => void) {
  // ... 주문 처리 ...
  onComplete(orderNo + ' 주문이 완료되었습니다.')
}

processOrder('A-1001', (message) => {
  console.log('[알림]', message)
})
// 출력: [알림] A-1001 주문이 완료되었습니다.
```

- `onComplete`의 타입 `(message: string) => void`는 "문자열 하나를 받고 아무것도 돌려주지 않는 함수"라는 뜻입니다. 함수 타입 문법은 [함수 타입](../part2-types/05-function-types)에서 자세히 배우니, 지금은 "함수를 받는 자리구나" 정도로 읽으면 됩니다.
- 넘긴 화살표 함수의 `message`에는 타입을 적지 않았습니다. `processOrder`가 이미 "문자열을 넘겨줄 것"이라고 정해 두었으므로 TypeScript가 알아서 `string`으로 추론합니다. 이것을 **문맥적 타이핑**(contextual typing)이라고 합니다.

콜백이 왜 중요할까요? "무엇을 할지"를 호출하는 쪽에서 정할 수 있기 때문입니다. 같은 `processOrder`를 쓰면서 어떤 곳에서는 알림을 띄우고, 어떤 곳에서는 영수증을 출력할 수 있습니다.

```ts
function repeat(times: number, action: (round: number) => void) {
  for (let i = 1; i <= times; i++) {
    action(i)
  }
}

repeat(3, (round) => console.log(round + '번 손님 호출'))
```

실행 결과:

```text
1번 손님 호출
2번 손님 호출
3번 손님 호출
```

콜백은 다음 레슨 [배열](./07-arrays)의 `map`, `filter` 같은 메서드에서 매일 쓰게 되고, 나중에 [비동기 프로그래밍](../part4-async/01-event-loop-callback)의 출발점이 됩니다.

### 정리: 함수의 세 가지 모양

```ts
// 1) 함수 선언문
function addVat(amount: number) {
  return Math.round(amount * 1.1)
}

// 2) 함수 표현식
const addVatExpr = function (amount: number) {
  return Math.round(amount * 1.1)
}

// 3) 화살표 함수
const addVatArrow = (amount: number) => Math.round(amount * 1.1)

console.log(addVat(5000), addVatExpr(5000), addVatArrow(5000))
// 출력: 5500 5500 5500
```

| | 함수 선언문 | 함수 표현식 | 화살표 함수 |
|---|---|---|---|
| 선언 전에 호출 | 가능 (호이스팅) | 불가 | 불가 |
| 짧게 쓰기 | 보통 | 보통 | 가장 짧음 |
| 주로 쓰는 곳 | 주요 기능 함수 | 오래된 코드 | 콜백, 짧은 계산 |

## 자주 하는 실수

### 실수 1. 괄호 없이 함수 이름만 쓰기

```ts
function getStoreName() {
  return '한빛 카페 강남점'
}

const storeName = getStoreName
console.log(storeName) // 출력: [Function: getStoreName]
```

**왜 틀렸나**: `getStoreName`은 함수 **그 자체**이고, `getStoreName()`이 함수를 **호출한 결과**입니다. 괄호를 빠뜨리면 함수가 실행되지 않고 함수 자체가 변수에 담깁니다.

**고친 코드**:

```ts
function getStoreName() {
  return '한빛 카페 강남점'
}

const storeName = getStoreName()
console.log(storeName) // 출력: 한빛 카페 강남점
```

### 실수 2. 중괄호 화살표 함수에서 return 빠뜨리기

```ts
const calculateTax = (amount: number) => {
  Math.round(amount * 0.1)
}
const tax: number = calculateTax(10000)
// ❌ Type 'void' is not assignable to type 'number'. (TS2322)
```

**왜 틀렸나**: 중괄호 `{ }`를 쓰면 `return`을 직접 써야 합니다. `return`이 없으니 함수는 아무것도 돌려주지 않고(`void`), 숫자 변수에 담을 수 없습니다.

**고친 코드**: `return`을 쓰거나, 중괄호를 없애 식을 바로 반환합니다.

```ts
const calculateTax = (amount: number) => Math.round(amount * 0.1)
const tax: number = calculateTax(10000)
console.log(tax) // 출력: 1000
```

### 실수 3. 일부 경로에서 return을 빠뜨리기

```ts
function getGradeDiscount(grade: string): number {
  if (grade === 'VIP') {
    return 0.1
  } else if (grade === 'GOLD') {
    return 0.05
  }
}
// ❌ Function lacks ending return statement and return type does not include 'undefined'. (TS2366)
```

**왜 틀렸나**: `grade`가 `'VIP'`도 `'GOLD'`도 아니면 아무것도 돌려주지 않고 함수가 끝납니다. 반환 타입을 `number`로 약속했는데 `undefined`가 나올 수 있으므로 TypeScript가 막습니다.

**고친 코드**: 어느 조건에도 맞지 않을 때 돌려줄 값을 마지막에 적습니다.

```ts
function getGradeDiscount(grade: string): number {
  if (grade === 'VIP') {
    return 0.1
  } else if (grade === 'GOLD') {
    return 0.05
  }
  return 0
}

console.log(getGradeDiscount('VIP'))    // 출력: 0.1
console.log(getGradeDiscount('NORMAL')) // 출력: 0
```

### 실수 4. 인자 순서를 바꿔 넘기기

```ts
function calculateSubtotal(unitPrice: number, quantity: number) {
  return unitPrice * quantity
}

// 수량 3, 단가 4500을 넘기려 했지만 순서가 바뀜
console.log(calculateSubtotal(3, 4500)) // 출력: 13500
```

**왜 틀렸나**: 이번에는 곱셈이라 결과가 우연히 같지만, `unitPrice - discount`처럼 순서가 중요한 계산이었다면 조용히 틀린 값이 나옵니다. 두 매개변수의 타입이 모두 `number`라서 TypeScript도 순서 실수는 잡지 못합니다.

**고친 코드**: 매개변수가 많거나 같은 타입이 여러 개면, 이름을 붙여 넘기는 **객체 매개변수**를 쓰면 안전합니다(객체는 [객체](./08-objects) 레슨에서 배웁니다).

```ts
function calculateSubtotal({ unitPrice, quantity }: { unitPrice: number; quantity: number }) {
  return unitPrice * quantity
}

console.log(calculateSubtotal({ quantity: 3, unitPrice: 4500 })) // 출력: 13500
```

### 실수 5. 매개변수 타입을 빠뜨리기

```ts
const formatWon = (amount) => amount + '원'
// ❌ Parameter 'amount' implicitly has an 'any' type. (TS7006)
```

**왜 틀렸나**: 화살표 함수를 변수에 바로 담을 때는 TypeScript가 `amount`에 무엇이 들어올지 알 수 없습니다. 콜백으로 넘길 때와 달리 문맥이 없기 때문입니다.

**고친 코드**:

```ts
const formatWon = (amount: number) => amount + '원'
console.log(formatWon(3000)) // 출력: 3000원
```

## 직접 해 보기

### 문제 1. 인사 함수 ⭐

손님 이름을 받아 `'(이름)님, 환영합니다!'`를 **돌려주는** 함수 `welcome`을 함수 선언문으로 만들고, `'김민지'`로 호출한 결과를 출력하세요.

::: details 정답 보기
```ts
function welcome(customerName: string) {
  return customerName + '님, 환영합니다!'
}

console.log(welcome('김민지')) // 출력: 김민지님, 환영합니다!
```

화면에 찍는 일은 바깥에서 하고, 함수는 문자열을 `return`만 합니다.
:::

### 문제 2. 할인 계산 ⭐

가격과 할인율을 받아 할인된 가격을 돌려주는 화살표 함수 `discountPrice`를 만드세요. 할인율을 넘기지 않으면 할인하지 않습니다(기본값 `0`). `discountPrice(18000, 0.15)`와 `discountPrice(18000)`의 결과를 출력하세요.

::: details 정답 보기
```ts
const discountPrice = (price: number, rate = 0) => price - price * rate

console.log(discountPrice(18000, 0.15)) // 출력: 15300
console.log(discountPrice(18000))       // 출력: 18000
```
:::

### 문제 3. 배송비 포함 결제 금액 ⭐⭐

다음 규칙으로 결제 금액을 계산하는 함수 `calculatePayment(orderAmount: number): number`를 만드세요.

- 주문 금액이 `30000`원 이상이면 배송비 `0`원
- 그보다 적으면 배송비 `3000`원
- 결제 금액 = 주문 금액 + 배송비

`calculatePayment(29000)`, `calculatePayment(30000)`의 결과를 출력하세요. 배송비 계산은 별도 함수 `getShippingFee`로 분리하세요.

::: details 정답 보기
```ts
function getShippingFee(orderAmount: number): number {
  if (orderAmount >= 30000) {
    return 0
  }
  return 3000
}

function calculatePayment(orderAmount: number): number {
  return orderAmount + getShippingFee(orderAmount)
}

console.log(calculatePayment(29000)) // 출력: 32000
console.log(calculatePayment(30000)) // 출력: 30000
```

작은 함수를 조합해 큰 함수를 만들면 각각을 따로 확인할 수 있어 버그를 찾기 쉽습니다.
:::

### 문제 4. 장바구니 합계 ⭐⭐

나머지 매개변수로 상품 가격을 몇 개든 받아, 합계와 부가세(10%, 반올림)를 더한 금액을 돌려주는 함수 `cartTotalWithVat`를 만드세요. `cartTotalWithVat(4500, 5000, 2500)`의 결과를 출력하세요.

::: details 정답 보기
```ts
function cartTotalWithVat(...prices: number[]): number {
  let subtotal = 0
  for (const price of prices) {
    subtotal = subtotal + price
  }
  return subtotal + Math.round(subtotal * 0.1)
}

console.log(cartTotalWithVat(4500, 5000, 2500)) // 출력: 13200
```

12000원에 부가세 1200원이 더해집니다.
:::

### 문제 5. 콜백으로 영수증 출력 방식 바꾸기 ⭐⭐⭐

`printReceipt(total: number, formatter: (amount: number) => string)` 함수를 만드세요. 이 함수는 `formatter`로 금액을 문자열로 바꾼 뒤 `'결제 금액: '`을 앞에 붙여 출력합니다. 그리고 다음 두 가지 방식으로 호출하세요.

1. `'15000원'`처럼 숫자 뒤에 `원`을 붙이는 방식
2. `'KRW 15000'`처럼 앞에 `KRW `를 붙이는 방식

::: details 정답 보기
```ts
function printReceipt(total: number, formatter: (amount: number) => string) {
  console.log('결제 금액: ' + formatter(total))
}

printReceipt(15000, (amount) => amount + '원')
printReceipt(15000, (amount) => 'KRW ' + amount)
```

출력:

```text
결제 금액: 15000원
결제 금액: KRW 15000
```

`printReceipt`는 "어떻게 표시할지"를 모릅니다. 그 결정을 호출하는 쪽이 콜백으로 넘겨줍니다. 같은 함수가 상황에 따라 다르게 동작하게 만드는 것이 콜백의 힘입니다.
:::

### 문제 6. 순수 함수로 바꾸기 ⭐⭐⭐

아래 함수는 바깥 변수 `cartTotal`을 바꾸는 순수하지 않은 함수입니다. 현재 합계와 추가 금액을 받아 **새 합계를 돌려주는** 순수 함수 `addToCart`로 바꾸고, 같은 결과(`8500`)가 나오게 하세요.

```text
let cartTotal = 0
function addToCart(price: number) {
  cartTotal = cartTotal + price
}
addToCart(3000)
addToCart(5500)
console.log(cartTotal)
```

::: details 정답 보기
```ts
function addToCart(currentTotal: number, price: number): number {
  return currentTotal + price
}

let cartTotal = 0
cartTotal = addToCart(cartTotal, 3000)
cartTotal = addToCart(cartTotal, 5500)
console.log(cartTotal) // 출력: 8500
```

`addToCart`는 이제 입력만 보고 결과를 돌려주므로, `addToCart(0, 3000)`은 언제 불러도 `3000`입니다. 값을 바꾸는 일(재할당)은 함수 바깥 한곳에서만 일어납니다.
:::

## 확인 퀴즈

**Q1.** `function order(menu: string) {}`와 `order('라떼')`에서 매개변수와 인자는 각각 무엇인가요?

::: details 정답 보기
매개변수는 함수를 만들 때 적은 `menu`, 인자는 호출할 때 넘긴 `'라떼'`입니다.
:::

**Q2.** `return`이 없는 함수를 호출하고 결과를 변수에 담으면 무엇이 들어가나요?

::: details 정답 보기
`undefined`가 들어갑니다. TypeScript는 이런 함수의 반환 타입을 `void`로 추론합니다.
:::

**Q3.** 다음 두 화살표 함수의 반환값은 각각 무엇인가요?

```ts
const a = (n: number) => n * 2
const b = (n: number) => { n * 2 }
console.log(a(5), b(5))
```

::: details 정답 보기
`a(5)`는 `10`, `b(5)`는 `undefined`입니다. 중괄호를 쓰면 `return`을 직접 써야 하는데 `b`에는 `return`이 없습니다.
:::

**Q4.** 함수 선언문과 `const`에 담은 화살표 함수 중, 선언하는 줄보다 **위에서** 호출할 수 있는 것은 무엇인가요?

::: details 정답 보기
함수 선언문입니다. 함수 선언문은 호이스팅되어 미리 준비되지만, `const`에 담은 함수는 그 줄이 실행된 뒤에만 쓸 수 있습니다.
:::

**Q5.** 순수 함수의 두 가지 조건은 무엇인가요?

::: details 정답 보기
같은 입력에는 항상 같은 결과를 돌려준다. 함수 바깥의 상태를 바꾸지 않는다(부수 효과가 없다).
:::

## 정리

- 함수는 코드 덩어리에 **이름을 붙여** 한 번 정의하고 여러 번 호출하는 도구입니다. 중복을 없애고 의미를 드러냅니다.
- **매개변수**는 함수를 만들 때의 빈칸, **인자**는 호출할 때 넣는 실제 값입니다. TypeScript에서는 매개변수에 타입을 적습니다.
- `return`은 값을 돌려주고 함수를 즉시 끝냅니다. `return`이 없으면 결과는 `undefined`(타입은 `void`)입니다.
- 함수 모양은 선언문, 표현식, 화살표 함수 세 가지입니다. 화살표 함수에 중괄호를 쓰면 `return`을 직접 써야 합니다.
- 기본값 매개변수(`rate = 0`)와 나머지 매개변수(`...prices`)로 인자 개수를 유연하게 받을 수 있습니다.
- 계산은 **순수 함수**로 만들고, 함수를 인자로 넘기는 **콜백**으로 "무엇을 할지"를 바깥에서 정할 수 있습니다.

## 다음 단계

[배열과 배열 메서드 (map · filter · reduce)](./07-arrays) — 상품 목록, 주문 목록처럼 여러 값을 한 번에 다루는 배열을 배우고, 이번에 배운 콜백을 `map`·`filter`·`reduce`에 넘겨 목록을 가공합니다.
