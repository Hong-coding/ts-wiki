---
title: 타입 표기와 타입 추론
---

# 타입 표기와 타입 추론

<LessonMeta level="초급" :minutes="40" prev="Part 1에서 변수·함수·배열·객체로 프로그램 만드는 법" />

## 이번에 배울 것

- 타입을 "값들의 집합"으로 생각하고, 값이 그 집합에 들어가는지로 오류를 설명할 수 있다.
- 변수·함수 매개변수·반환값에 **타입 표기**(type annotation)를 붙일 수 있다.
- TypeScript가 타입을 스스로 알아내는 **타입 추론**(type inference)을 VS Code에서 마우스를 올려 확인할 수 있다.
- `const`와 `let`의 추론 결과가 왜 다른지(리터럴 타입과 넓히기) 설명할 수 있다.
- "언제 표기하고 언제 추론에 맡길지" 기준에 따라 코드를 쓸 수 있다.

## 먼저 알아 둘 것

- [값과 변수: let · const](../part1-basics/01-values-and-variables)
- [원시 타입: number · string · boolean · null · undefined](../part1-basics/02-primitive-types)
- [함수 기초](../part1-basics/06-functions)

## 비유로 이해하기

카페 창고에 상자가 여러 개 있다고 해 봅시다. 상자마다 **라벨**이 붙어 있습니다.

- "원두만" 라벨이 붙은 상자에는 원두만 넣습니다.
- "우유만" 라벨이 붙은 상자에 원두를 넣으려 하면 직원이 "잠깐, 이 상자는 우유 상자예요!" 하고 막습니다.

여기서 **라벨 = 타입**, **상자 = 변수**, **직원 = TypeScript 컴파일러**입니다. "원두만"이라는 라벨은 사실 "이 상자에 들어갈 수 있는 물건의 모임"을 정해 둔 것입니다. 타입도 똑같이 **"이 변수에 들어갈 수 있는 값들의 모임(집합)"** 입니다.

그런데 라벨을 꼭 사람이 손으로 붙여야 할까요? 상자에 처음 넣은 물건이 원두라면 직원이 "아, 원두 상자구나" 하고 **알아서 라벨을 붙여 줄 수도** 있습니다. 이것이 **타입 추론**입니다. 사람이 직접 라벨을 붙이는 것은 **타입 표기**입니다.

이번 레슨의 핵심 질문은 이것입니다. **"라벨은 언제 직접 붙이고, 언제 직원에게 맡길까?"**

## 개념 설명

### 1단계: 타입은 값들의 집합

`number` 타입은 "숫자 값 전부"라는 집합입니다. `string`은 "문자열 값 전부", `boolean`은 `true`와 `false` 두 값만 든 집합입니다.

```text
number  = { 0, 1, 2, -1, 3.14, 1000, 4500, ... }   (끝없이 많음)
string  = { '', '아메리카노', '서울 강남점', ... }   (끝없이 많음)
boolean = { true, false }                           (딱 두 개)
```

변수에 타입을 정한다는 것은 "이 변수에는 이 집합 안의 값만 넣겠다"고 약속하는 것입니다. 그래서 오류 메시지 `Type 'string' is not assignable to type 'number'`는 집합의 말로 바꾸면 **"그 값은 number 집합 안에 없습니다"** 라는 뜻입니다.

```ts
let price: number = 4500
price = 5000 // ✅ 5000은 number 집합 안에 있음

price = '오천 원'
// ❌ Type 'string' is not assignable to type 'number'. (TS2322)
```

해설:

- 첫 줄의 `: number`가 **타입 표기**입니다. 변수 이름 뒤에 콜론(`:`)과 타입 이름을 씁니다.
- `5000`은 숫자이므로 문제없이 들어갑니다.
- `'오천 원'`은 문자열이므로 `number` 집합 밖의 값입니다. 그래서 컴파일러가 막습니다.
- `assignable`은 "할당할 수 있는(넣을 수 있는)"이라는 뜻입니다. 이 단어는 앞으로 수백 번 보게 됩니다.

### 2단계: 타입 표기 문법

타입 표기는 세 곳에 주로 붙입니다. **변수, 함수 매개변수, 함수 반환값**입니다.

```ts
// 1) 변수: 이름 뒤에 ": 타입"
let productName: string = '아메리카노'
let stock: number = 30
let isSoldOut: boolean = false

// 2) 함수 매개변수: 매개변수 이름 뒤에 ": 타입"
// 3) 반환값: 괄호 ")" 뒤에 ": 타입"
function getTotalPrice(unitPrice: number, quantity: number): number {
  return unitPrice * quantity
}

console.log(productName, stock, isSoldOut)
// 출력: 아메리카노 30 false
console.log(getTotalPrice(4500, 2))
// 출력: 9000
```

해설:

- `unitPrice: number` — 매개변수(parameter, 함수가 받는 입력값을 담는 변수) `unitPrice`에는 숫자만 받겠다는 뜻입니다.
- `): number` — 이 함수가 돌려주는 값(반환값)이 숫자라는 뜻입니다.
- 화살표 함수도 같은 자리에 붙입니다.

```ts
const getDiscountedPrice = (price: number, rate: number): number => {
  return price - price * rate
}

console.log(getDiscountedPrice(10000, 0.1))
// 출력: 9000
```

표기한 타입과 맞지 않게 함수를 부르면 바로 오류가 납니다.

```ts
function getTotalPrice(unitPrice: number, quantity: number): number {
  return unitPrice * quantity
}

getTotalPrice('4500', 2)
// ❌ Argument of type 'string' is not assignable to parameter of type 'number'. (TS2345)
```

`Argument`는 인수(argument, 함수를 부를 때 실제로 넘기는 값)입니다. "인수 `'4500'`은 문자열이라서 숫자 매개변수에 넣을 수 없다"는 뜻입니다. JavaScript였다면 `'4500' * 2`가 `9000`이 되어 우연히 동작했을 수도 있지만, 이런 우연에 기대는 코드가 나중에 큰 버그가 됩니다.

### 3단계: 타입 추론 — 표기하지 않아도 타입이 생긴다

이제 표기를 지워 봅시다.

```ts
let productName = '아메리카노' // 타입: string
let stock = 30 // 타입: number
let isSoldOut = false // 타입: boolean

stock = '서른'
// ❌ Type 'string' is not assignable to type 'number'. (TS2322)
```

`: number`를 쓰지 않았는데도 `stock`에 문자열을 넣는 순간 오류가 납니다. TypeScript가 **처음 넣은 값 `30`을 보고 "`stock`은 number 변수구나" 하고 추론**했기 때문입니다.

이처럼 TypeScript는 생각보다 많은 곳에서 타입을 알아서 찾아냅니다.

```ts
function getTotalPrice(unitPrice: number, quantity: number) {
  return unitPrice * quantity // number * number → number
}

const total = getTotalPrice(4500, 3) // 타입: number
const label = `합계: ${total}원` // 타입: string
const hasStock = total > 0 // 타입: boolean

console.log(label)
// 출력: 합계: 13500원
```

해설:

- 함수에 반환 타입을 쓰지 않았지만 `number * number`의 결과는 `number`이므로 반환 타입이 `number`로 추론됩니다.
- `total`은 함수의 반환 타입을 그대로 물려받아 `number`입니다.
- 템플릿 리터럴(`` `...` ``)의 결과는 언제나 문자열이므로 `label`은 `string`입니다.
- 비교 연산(`>`)의 결과는 `boolean`입니다.

### 4단계: VS Code에서 마우스를 올려 타입 보기

추론된 타입은 눈에 보이지 않으므로 **확인하는 방법**을 꼭 익혀야 합니다. VS Code에서 변수 이름 위에 마우스를 올리면(hover, 호버) 작은 창이 뜨고, 그 안에 TypeScript가 생각하는 타입이 나옵니다.

위 예제에서 `total`, `getTotalPrice` 위에 마우스를 올리면 다음과 같이 보입니다.

```text
const total: number

function getTotalPrice(unitPrice: number, quantity: number): number
```

::: tip 마우스 대신 키보드로
- 커서를 변수 위에 두고 `Ctrl + K` 다음 `Ctrl + I`(macOS는 `Cmd + K`, `Cmd + I`)를 누르면 같은 창이 뜹니다.
- [TS Playground](../part0-start/04-playground)에서도 똑같이 마우스를 올리면 타입이 보입니다.
- 타입이 헷갈릴 때는 **추측하지 말고 마우스를 올려 보는 것**이 가장 정확합니다. 이 위키의 예제 주석 `// 타입: ...`은 모두 이렇게 확인한 결과입니다.
:::

### 5단계: const와 let은 추론 결과가 다르다

같은 값을 넣어도 `const`와 `let`은 다르게 추론됩니다. 직접 마우스를 올려 보면 깜짝 놀랄 수 있습니다.

```ts
let status1 = 'READY' // 타입: string
const status2 = 'READY' // 타입: "READY"

let price1 = 4500 // 타입: number
const price2 = 4500 // 타입: 4500

let soldOut1 = false // 타입: boolean
const soldOut2 = false // 타입: false
```

`const status2`의 타입은 `string`이 아니라 **`"READY"`** 입니다. 이것을 **리터럴 타입**(literal type)이라고 합니다. 리터럴(literal)은 코드에 직접 써 넣은 값 그 자체를 말합니다.

집합으로 생각하면 이해가 됩니다.

```text
string   = { '', 'READY', 'PAID', '아메리카노', ... }   값이 끝없이 많은 집합
"READY"  = { 'READY' }                                   값이 딱 하나인 집합
```

왜 이렇게 다를까요?

- `const`는 **다시 값을 넣을 수 없는** 변수입니다. `status2`에는 앞으로도 영원히 `'READY'`만 들어 있습니다. 그러니 가장 정확한 타입은 "값 하나짜리 집합" `"READY"`입니다.
- `let`은 **나중에 다른 값을 넣을 수 있는** 변수입니다. `status1 = 'PAID'`처럼 바꿀 가능성이 높습니다. 그래서 TypeScript는 `'READY'` 하나짜리 집합을 **더 큰 집합 `string`으로 넓혀서** 추론합니다.

이렇게 리터럴 타입을 더 넓은 타입으로 바꾸는 것을 **타입 넓히기**(widening)라고 합니다.

```ts
let status1 = 'READY'
status1 = 'PAID' // ✅ string이므로 다른 문자열도 가능

const status2 = 'READY'
status2 = 'PAID'
// ❌ Cannot assign to 'status2' because it is a constant. (TS2588)
```

::: info 리터럴 타입이 왜 쓸모 있나요?
"주문 상태는 `'READY'`, `'PAID'`, `'CANCELED'` 셋 중 하나"처럼 **값의 범위를 좁게 정해 두고 싶을 때** 리터럴 타입을 씁니다. 오타 `'PIAD'` 같은 실수를 컴파일러가 잡아 줍니다. 이것은 [유니온 타입과 리터럴 타입](./06-union-literal)에서 자세히 배웁니다.
:::

### 6단계: 객체·배열 안의 값은 넓혀진다

`const`로 만들어도 **객체의 속성이나 배열의 요소**는 넓혀집니다. 객체 속성은 나중에 바꿀 수 있기 때문입니다.

```ts
const order = {
  orderNo: 'A-1001',
  status: 'READY',
  amount: 9000,
}
// order 위에 마우스를 올리면:
// const order: { orderNo: string; status: string; amount: number; }

order.status = 'PAID' // ✅ const여도 속성은 바꿀 수 있음

const sizes = ['S', 'M', 'L'] // 타입: string[]
sizes.push('XL') // ✅ 배열에 요소 추가도 가능
```

`const order`는 "변수 `order`가 다른 객체를 가리키도록 바꿀 수 없다"는 뜻일 뿐, 객체 안의 속성 값은 바꿀 수 있습니다([객체](../part1-basics/08-objects)에서 배운 내용). 그래서 `status`는 `"READY"`가 아니라 `string`입니다.

객체·배열 안의 값까지 리터럴 타입으로 고정하고 싶을 때는 `as const`를 씁니다. 이것은 [배열 타입과 튜플](./03-arrays-tuples)에서 배웁니다.

### 7단계: 문맥으로 추론하기 (문맥적 타이핑)

TypeScript는 값을 보고 추론할 뿐 아니라, **값이 놓인 자리(문맥)** 를 보고도 추론합니다. 이것을 **문맥적 타이핑**(contextual typing)이라고 합니다.

```ts
const prices = [4500, 5000, 6500] // 타입: number[]

// 콜백의 매개변수 p에 타입을 쓰지 않았지만 number로 추론됨
const withTax = prices.map((p) => p * 1.1)

const names = ['아메리카노', '카페라테']
// 여기서 name은 string으로 추론되므로 문자열 메서드를 바로 쓸 수 있음
const upper = names.map((name) => name.length) // 타입: number[]

console.log(upper)
// 출력: [ 5, 4 ]
```

`prices`가 `number[]`(숫자 배열)라는 것을 알고 있으므로, `map`에 넘긴 콜백(callback, 다른 함수에 넘겨서 나중에 불리게 하는 함수)의 매개변수 `p`도 `number`라고 알아냅니다. **콜백 매개변수에는 보통 타입을 쓰지 않습니다.** 자리를 보고 TypeScript가 정확히 알아내기 때문입니다.

### 8단계: 추론이 안 되는 곳 — 함수 매개변수

반대로 **일반 함수의 매개변수**는 추론할 단서가 없습니다. 함수를 만드는 시점에는 누가 어떤 값을 넣을지 알 수 없기 때문입니다.

```ts
function formatPrice(price) {
  // ❌ Parameter 'price' implicitly has an 'any' type. (TS7006)
  return price.toLocaleString() + '원'
}
```

`implicitly has an 'any' type`은 "타입을 알 수 없어서 몰래 `any`가 되었다"는 뜻입니다. `any`는 "아무 값이나 다 된다"는 타입인데, 쓰는 순간 타입 검사가 꺼집니다(자세한 내용은 [다음 레슨](./02-special-types)). `strict` 모드(이 위키의 기준)에서는 이것을 오류로 알려 줍니다.

고치는 방법은 간단히 타입을 표기하는 것입니다.

```ts
function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR') + '원'
}

console.log(formatPrice(1234500))
// 출력: 1,234,500원
```

::: warning strict 모드와 noImplicitAny
위 오류는 `tsconfig.json`의 `strict: true`에 포함된 `noImplicitAny` 옵션이 켜져 있을 때 납니다. `strict`를 끄면 오류 없이 `any`가 되어 버리므로, 처음부터 `strict: true`로 공부하세요. 옵션 하나하나는 [strict 옵션 하나씩 이해하기](../part6-tooling/02-strict-options)에서 다룹니다.
:::

### 9단계: 선언만 먼저 하는 변수는 표기한다

값을 나중에 넣는 변수는 처음 값이 없어서 추론할 단서가 부족합니다. 이때는 표기를 붙입니다.

```ts
const totalAmount = 32000
let grade: string // 값은 아래 조건문에서 넣음

if (totalAmount >= 30000) {
  grade = 'VIP'
} else {
  grade = '일반'
}

console.log(grade)
// 출력: VIP
```

빈 배열도 마찬가지입니다. 빈 배열 `[]`만 보고는 무엇을 담을 배열인지 알 수 없으므로 표기하는 것이 읽기도 좋고 안전합니다.

```ts
const cartItems: string[] = []
cartItems.push('아메리카노')
cartItems.push(4500)
// ❌ Argument of type 'number' is not assignable to parameter of type 'string'. (TS2345)
```

### 10단계: 반환 타입은 표기할까, 맡길까?

반환 타입은 추론에 맡겨도 정확하게 나옵니다. 그런데 **일부러 표기하면 좋은 경우**가 있습니다. 함수 안에서 실수했을 때 **실수한 바로 그 자리**에서 오류가 나기 때문입니다.

```ts
// 반환 타입을 표기하지 않은 경우
function getShippingFee(amount: number) {
  if (amount >= 30000) {
    return 0
  }
  return '3000' // 실수: 숫자 대신 문자열을 반환
}
// 함수 자체에는 오류가 없음. 반환 타입이 0 | "3000"으로 추론됨

const fee = getShippingFee(10000)
const payAmount = 10000 + fee
// ❌ Operator '+' cannot be applied to types 'number' and 'string | number'. (TS2365)
```

실수는 `return '3000'` 줄에서 했는데, 오류는 **함수를 쓰는 엉뚱한 곳**에서 납니다. 함수가 길고 여러 파일에서 쓰인다면 원인을 찾느라 한참 헤매게 됩니다.

```ts
// 반환 타입을 표기한 경우
function getShippingFee(amount: number): number {
  if (amount >= 30000) {
    return 0
  }
  return '3000'
  // ❌ Type 'string' is not assignable to type 'number'. (TS2322)
}
```

반환 타입을 표기하면 **"이 함수는 숫자를 돌려준다"는 약속**이 생기고, 약속을 어긴 줄에서 바로 오류가 납니다. 다른 사람이 함수 위에 마우스를 올렸을 때 읽기도 쉽습니다.

### 11단계: 언제 표기하고 언제 추론에 맡길까 — 기준표

지금까지 본 내용을 실무 기준으로 정리하면 다음과 같습니다.

| 위치 | 권장 | 이유 |
|---|---|---|
| 함수 매개변수 | **표기한다** | 추론할 단서가 없음. 안 쓰면 TS7006 오류 |
| 지역 변수(값과 함께 선언) | **추론에 맡긴다** | 값을 보면 타입이 분명함. 표기는 중복 |
| 선언만 먼저 하는 변수 | **표기한다** | 처음 값이 없어 추론이 부정확함 |
| 빈 배열·빈 객체로 시작하는 변수 | **표기한다** | 무엇을 담을지 알 수 없음 |
| 콜백 함수의 매개변수 | **추론에 맡긴다** | 문맥적 타이핑으로 정확히 나옴 |
| 함수 반환 타입 | 짧은 함수는 맡겨도 됨. **다른 파일에서 쓰는 함수(export)나 분기가 많은 함수는 표기** | 실수를 함수 안에서 잡고, 읽는 사람에게 약속을 보여 줌 |
| 추론 결과가 원하는 것보다 넓을 때 | **표기한다** | 예: 상태값을 특정 문자열들로 제한하고 싶을 때 |

불필요한 표기는 오히려 코드를 읽기 어렵게 만듭니다.

```ts
// 😕 중복 표기: 값만 봐도 타입이 분명함
const storeName: string = '서울 강남점'
const openYear: number = 2019

// 🙂 추론에 맡기기
const storeName2 = '서울 강남점'
const openYear2 = 2019
```

### 12단계: 타입은 실행할 때 사라진다

마지막으로 꼭 기억할 사실 하나입니다. 타입 표기는 `tsc`가 JavaScript로 바꿀 때 **모두 지워집니다.**

```ts
function getTotalPrice(unitPrice: number, quantity: number): number {
  return unitPrice * quantity
}
let memberName: string = '김민지'
```

위 코드를 `tsc`로 컴파일하면 다음 JavaScript가 나옵니다.

```js
function getTotalPrice(unitPrice, quantity) {
  return unitPrice * quantity
}
let memberName = '김민지'
```

그래서 타입 표기를 붙인다고 프로그램이 느려지지 않습니다. 대신 **실행 중에는 타입 검사가 일어나지 않는다**는 뜻이기도 합니다. 타입은 "코드를 쓰는 동안 실수를 잡아 주는 도구"입니다.

## 자주 하는 실수

### 실수 1: 타입 이름을 대문자로 쓰기

```ts
let productName: String = '아메리카노'
let stock: Number = 30
```

왜 틀렸나: 오류는 나지 않지만, `String`·`Number`(대문자)는 원시 값이 아니라 **래퍼 객체**(wrapper object, 원시 값을 감싸는 특수한 객체)의 타입입니다. 원시 타입과 섞어 쓰면 예상치 못한 오류가 납니다.

```ts
const a: String = '아메리카노'
const b: string = a
// ❌ Type 'String' is not assignable to type 'string'. (TS2322)
```

고친 코드: 원시 타입은 **항상 소문자**로 씁니다.

```ts
let productName: string = '아메리카노'
let stock: number = 30
```

### 실수 2: let으로 만든 변수가 리터럴 타입일 거라고 기대하기

```ts
function setOrderStatus(status: 'READY' | 'PAID' | 'CANCELED') {
  console.log('상태 변경:', status)
}

let nextStatus = 'PAID'
setOrderStatus(nextStatus)
// ❌ Argument of type 'string' is not assignable to parameter of type '"READY" | "PAID" | "CANCELED"'. (TS2345)
```

왜 틀렸나: `let`은 넓히기 때문에 `nextStatus`의 타입은 `"PAID"`가 아니라 `string`입니다. `string` 집합에는 `'PIAD'` 같은 아무 문자열이나 들어 있으므로, 세 값만 받는 매개변수에 넣을 수 없습니다. (`'READY' | 'PAID' | 'CANCELED'`는 "셋 중 하나"라는 뜻의 유니온 타입입니다. [06 레슨](./06-union-literal)에서 배웁니다.)

고친 코드: 바꿀 일이 없으면 `const`로, 바꿀 일이 있으면 타입을 표기합니다.

```ts
function setOrderStatus(status: 'READY' | 'PAID' | 'CANCELED') {
  console.log('상태 변경:', status)
}

const nextStatus = 'PAID' // 타입: "PAID"
setOrderStatus(nextStatus) // ✅

let laterStatus: 'READY' | 'PAID' | 'CANCELED' = 'READY'
laterStatus = 'PAID'
setOrderStatus(laterStatus) // ✅
// 출력: 상태 변경: PAID
// 출력: 상태 변경: PAID
```

### 실수 3: 함수 매개변수에 타입을 안 쓰기

```ts
function getPoint(amount) {
  // ❌ Parameter 'amount' implicitly has an 'any' type. (TS7006)
  return amount * 0.01
}
```

왜 틀렸나: 매개변수는 추론할 단서가 없어 `any`가 됩니다. `strict` 모드에서는 오류입니다.

고친 코드:

```ts
function getPoint(amount: number): number {
  return Math.floor(amount * 0.01)
}

console.log(getPoint(25800))
// 출력: 258
```

### 실수 4: 모든 곳에 타입을 쓰기

```ts
const prices: number[] = [4500, 5000]
const doubled: number[] = prices.map((p: number): number => p * 2)
```

왜 틀렸나: 오류는 아니지만, 값과 문맥만으로 정확히 추론되는 곳까지 표기하면 읽기 어렵고, 나중에 타입을 바꿀 때 고칠 곳만 늘어납니다.

고친 코드:

```ts
const prices = [4500, 5000]
const doubled = prices.map((p) => p * 2) // 타입: number[]
```

## 직접 해 보기

### 문제 1 ⭐ 타입 표기 붙이기

다음 변수와 함수에 알맞은 타입을 표기하세요. 함수는 매개변수와 반환 타입 모두 표기합니다.

```ts
// 문제: 알맞은 타입을 표기하세요
let memberName = '박서준'
let memberPoint = 1200
let isVip = false

function addPoint(point, amount) {
  return point + amount
}
```

::: details 정답 보기
```ts
let memberName: string = '박서준'
let memberPoint: number = 1200
let isVip: boolean = false

function addPoint(point: number, amount: number): number {
  return point + amount
}

console.log(addPoint(memberPoint, 300))
// 출력: 1500
```

실무에서는 변수 세 개는 추론에 맡기고, 함수 매개변수만 표기하는 쪽이 더 흔합니다. 이 문제는 표기 문법을 연습하려는 목적입니다.
:::

### 문제 2 ⭐ 추론된 타입 맞히기

각 변수의 타입을 먼저 종이에 적어 본 뒤, VS Code에서 마우스를 올려 확인하세요.

```ts
let a = '라테'
const b = '라테'
let c = 3500
const d = 3500
const e = c > 3000
const f = `${a} ${c}원`
const g = [1, 2, 3]
```

::: details 정답 보기
```ts
let a = '라테' // 타입: string
const b = '라테' // 타입: "라테"
let c = 3500 // 타입: number
const d = 3500 // 타입: 3500
const e = c > 3000 // 타입: boolean
const f = `${a} ${c}원` // 타입: string
const g = [1, 2, 3] // 타입: number[]
```

`const`는 값이 바뀌지 않으므로 리터럴 타입, `let`은 넓혀진 타입입니다. 비교 결과와 템플릿 리터럴은 값을 직접 써 넣은 것이 아니므로 `const`여도 `boolean`, `string`입니다.
:::

### 문제 3 ⭐⭐ 오류 원인 찾기

다음 코드에서 오류가 나는 줄과 이유를 집합의 말로 설명하고 고치세요.

```ts
// 문제: 오류가 나는 줄을 찾으세요
function getStoreLabel(storeCode: string, storeName: string): string {
  return `[${storeCode}] ${storeName}`
}

const code = 101
getStoreLabel(code, '서울 강남점')
```

::: details 정답 보기
`getStoreLabel(code, ...)` 줄에서 오류가 납니다.

```text
Argument of type 'number' is not assignable to parameter of type 'string'. (TS2345)
```

`code`의 타입은 `101`(숫자 리터럴 타입)이고, 이 값은 `string` 집합 안에 없습니다. 매장 코드를 문자열로 쓰기로 했다면 값을 문자열로 바꿉니다.

```ts
function getStoreLabel(storeCode: string, storeName: string): string {
  return `[${storeCode}] ${storeName}`
}

const code = '101'
console.log(getStoreLabel(code, '서울 강남점'))
// 출력: [101] 서울 강남점
```

숫자를 그대로 받아야 한다면 `String(code)`로 바꿔서 넘겨도 됩니다.
:::

### 문제 4 ⭐⭐ 표기할 곳만 표기하기

아래 코드는 타입 표기가 전혀 없어 오류가 납니다. **꼭 필요한 곳에만** 표기를 추가해 오류를 없애세요.

```ts
// 문제: 꼭 필요한 곳에만 타입을 표기하세요
function calcOrderAmount(unitPrice, quantity, couponAmount) {
  const subtotal = unitPrice * quantity
  const result = subtotal - couponAmount
  return result < 0 ? 0 : result
}

let message
const amount = calcOrderAmount(4500, 3, 2000)
if (amount > 10000) {
  message = '무료 배송'
} else {
  message = '배송비 3,000원'
}
```

::: details 정답 보기
```ts
function calcOrderAmount(unitPrice: number, quantity: number, couponAmount: number): number {
  const subtotal = unitPrice * quantity
  const result = subtotal - couponAmount
  return result < 0 ? 0 : result
}

let message: string
const amount = calcOrderAmount(4500, 3, 2000)
if (amount > 10000) {
  message = '무료 배송'
} else {
  message = '배송비 3,000원'
}
console.log(amount, message)
// 출력: 11500 무료 배송
```

- 매개변수 세 개는 반드시 표기합니다.
- `subtotal`, `result`, `amount`는 추론에 맡깁니다.
- `message`는 값을 나중에 넣으므로 표기합니다. (`let message`만 써도 strict 모드에서 오류는 나지 않지만, 읽는 사람을 위해 표기하는 편이 좋습니다.)
- 반환 타입 `: number`는 선택입니다. 붙이면 함수 안의 실수를 더 빨리 잡습니다.
:::

### 문제 5 ⭐⭐⭐ 반환 타입으로 버그 잡기

다음 함수는 회원 등급에 따라 할인율을 돌려줍니다. 그런데 결과가 이상합니다. 반환 타입을 표기해서 버그 위치를 컴파일러가 알려 주게 만든 뒤 고치세요.

```ts
// 문제: 반환 타입을 표기해 버그 위치를 찾으세요
function getDiscountRate(grade: string) {
  if (grade === 'VIP') {
    return 0.1
  }
  if (grade === 'GOLD') {
    return '0.05'
  }
  return 0
}

const price = 20000
const discount = price * getDiscountRate('GOLD')
```

::: details 정답 보기
반환 타입 `: number`를 붙이면 `return '0.05'` 줄에서 오류가 납니다.

```text
Type 'string' is not assignable to type 'number'. (TS2322)
```

고친 코드:

```ts
function getDiscountRate(grade: string): number {
  if (grade === 'VIP') {
    return 0.1
  }
  if (grade === 'GOLD') {
    return 0.05
  }
  return 0
}

const price = 20000
const discount = price * getDiscountRate('GOLD')
console.log(discount)
// 출력: 1000
```

참고로 원래 코드에서는 `price * getDiscountRate('GOLD')` 줄에서 "산술 연산의 오른쪽은 숫자여야 한다"는 오류(`The right-hand side of an arithmetic operation must be of type ...`, TS2363)가 납니다. 하지만 그 오류는 **함수를 쓰는 곳**에서 나므로 원인을 찾기 어렵습니다. 반환 타입을 표기하면 **원인이 있는 줄**에서 바로 알려 줍니다.
:::

## 확인 퀴즈

1. 타입을 "값들의 집합"으로 볼 때, `boolean` 타입에는 값이 몇 개 들어 있나요?
2. `const city = '부산'`의 타입과 `let city = '부산'`의 타입은 각각 무엇인가요?
3. 함수 매개변수에 타입을 표기하지 않으면 strict 모드에서 어떤 일이 생기나요?
4. `[4500, 5000].map((p) => p * 2)`에서 `p`의 타입을 따로 쓰지 않아도 되는 이유는 무엇인가요?
5. 타입 표기를 많이 붙이면 실행 속도가 느려지나요?

::: details 정답 보기
1. 2개(`true`, `false`)입니다.
2. `const`는 `"부산"`(리터럴 타입), `let`은 `string`입니다. `let`은 다른 값을 넣을 수 있으므로 넓혀집니다.
3. `Parameter 'x' implicitly has an 'any' type. (TS7006)` 오류가 납니다.
4. 배열이 `number[]`라는 것을 알고 있으므로 콜백 매개변수의 타입을 문맥으로 추론합니다(문맥적 타이핑).
5. 아닙니다. 타입은 컴파일할 때 모두 지워져 JavaScript에 남지 않습니다.
:::

## 정리

- **타입은 값들의 집합**입니다. "넣을 수 없다"는 오류는 "그 값이 집합 밖에 있다"는 뜻입니다.
- **타입 표기**는 `이름: 타입` 형태로 변수·매개변수·반환값에 붙입니다.
- **타입 추론**은 값과 문맥을 보고 TypeScript가 타입을 알아내는 것입니다. 마우스를 올려(hover) 확인합니다.
- `const`는 리터럴 타입(`"READY"`), `let`은 넓혀진 타입(`string`)으로 추론됩니다. 객체 속성과 배열 요소는 `const`여도 넓혀집니다.
- **함수 매개변수는 표기, 값과 함께 만드는 지역 변수는 추론**이 기본 기준입니다. 반환 타입은 공개 함수·분기 많은 함수에 표기하면 좋습니다.
- 타입은 컴파일할 때 지워지며, 실행 중에는 검사하지 않습니다.

## 다음 단계

[특수 타입: any · unknown · never · void](./02-special-types) — "모든 값"을 뜻하는 두 타입 `any`와 `unknown`이 어떻게 다른지, "값이 없음"을 뜻하는 `void`와 `never`가 언제 나오는지 배웁니다.
