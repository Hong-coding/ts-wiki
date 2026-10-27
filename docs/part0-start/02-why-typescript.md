---
title: '왜 TypeScript인가: 타입이 막아 주는 실수들'
---

# 왜 TypeScript인가: 타입이 막아 주는 실수들

<LessonMeta level="입문" :minutes="30" prev="TypeScript는 JavaScript에 타입을 더한 언어이고, 실행 전에 JavaScript로 변환된다" />

## 이번에 배울 것

- JavaScript에서 실제로 자주 일어나는 버그 네 가지를 예로 들 수 있다.
- 같은 버그를 TypeScript가 **실행 전에** 어떻게 알려 주는지 설명할 수 있다.
- 자동완성과 이름 바꾸기(리팩터링)가 왜 타입 덕분에 정확해지는지 설명할 수 있다.
- TypeScript의 단점(설정·학습 비용 등)을 솔직하게 말하고, 그럼에도 쓰는 이유를 판단할 수 있다.

## 먼저 알아 둘 것

- [프로그래밍과 JavaScript, 그리고 TypeScript](./01-what-is-programming): 컴파일 타임과 런타임의 차이
- 이번 레슨의 코드는 **읽기만 해도 됩니다.** 직접 실행하는 방법은 4번·5번 레슨에서 배웁니다. 문법을 몰라도 "어디가 틀렸고, 언제 알게 되는가"에만 집중하세요.

## 비유로 이해하기

### 택배 송장과 우편번호 검사

택배를 보낼 때 송장에 주소를 적는다고 해 봅시다.

- **검사 없는 택배사**: 송장에 "서울시 강남구 테헤란료 123"이라고 오타를 내도 일단 받아 줍니다. 택배는 트럭에 실려 출발하고, 며칠 뒤 배송 기사님이 현장에 가서야 "이런 주소가 없는데요?" 하고 돌아옵니다. 그사이 고객은 기다리고, 다시 보내는 비용이 듭니다.
- **검사하는 택배사**: 송장을 접수하는 순간 시스템이 "'테헤란료'라는 도로명은 없습니다. '테헤란로'를 말씀하신 건가요?"라고 알려 줍니다. 트럭이 출발하기 전에 고칠 수 있습니다.

JavaScript는 첫 번째 택배사와 비슷합니다. 코드를 일단 실행하고, 문제는 **실행 중(런타임)**에 발견합니다. TypeScript는 두 번째 택배사입니다. **실행 전(컴파일 타임)**에 검사합니다.

버그를 늦게 발견할수록 비용이 커집니다. 내 PC에서 발견하면 1분이면 고치지만, 매장의 POS 단말기에서 결제 도중에 발견되면 손님이 기다리고, 매출이 틀어지고, 긴급 배포를 해야 합니다.

## 개념 설명

이제 실제 코드로 비교해 봅시다. 각 예제는 **JavaScript 버전 → 실행 결과 → TypeScript 버전 → TypeScript가 보여 주는 에러** 순서로 봅니다.

::: info 에러 메시지는 영어로 나옵니다
TypeScript의 에러 메시지는 기본적으로 영어입니다. 이번 레슨에서는 각 메시지 아래에 우리말 해석을 붙였습니다. 영어 에러를 읽는 요령은 6번 레슨 [에러 메시지 읽는 법과 도움 받는 법](./06-how-to-read-errors)에서 자세히 배웁니다.
:::

### 버그 1: 속성 이름 오타

주문 정보에 `total`(합계)이라는 항목이 있는데, 코드를 쓰다가 `totl`이라고 오타를 냈습니다. 객체(object, 여러 값을 이름표와 함께 묶어 둔 것)의 각 항목을 **속성(property)**이라고 부릅니다.

**JavaScript 버전**

```js
const order = { id: 'A-1001', total: 15000 }
console.log(order.totl)
```

```text
undefined
```

에러가 나지 않습니다. 대신 `undefined`(값이 없음)라는 엉뚱한 값이 조용히 출력됩니다. 이 값이 영수증에 찍히거나 다른 계산에 섞여 들어가면, 한참 뒤에 "왜 영수증 합계가 비어 있지?" 하는 문의를 받고서야 문제를 알게 됩니다. **에러가 나지 않는 버그가 가장 무섭습니다.**

**TypeScript 버전**

```ts
const order = { id: 'A-1001', total: 15000 }
console.log(order.totl)
// ❌ Property 'totl' does not exist on type '{ id: string; total: number; }'. Did you mean 'total'? (TS2551)
```

해석: "`{ id: string; total: number; }` 타입에는 `totl`이라는 속성이 없습니다. `total`을 말씀하신 건가요?"

TypeScript는 `order`에 `id`와 `total`만 있다는 것을 알고 있기 때문에, 없는 이름을 쓰면 **실행하기 전에** 알려 줍니다. 심지어 비슷한 이름까지 추천해 줍니다. 택배사의 "테헤란로를 말씀하신 건가요?"와 똑같습니다.

여기서 눈여겨볼 점이 있습니다. 위 TypeScript 코드에는 타입 표기(`: number` 같은 것)를 **하나도 적지 않았습니다.** TypeScript가 `{ id: 'A-1001', total: 15000 }`이라는 값을 보고 타입을 스스로 알아냈기 때문입니다. 이것을 **타입 추론(type inference)**이라고 하며, Part 2의 [타입 표기와 타입 추론](../part2-types/01-annotation-inference)에서 배웁니다.

### 버그 2: 없을 수도 있는 값을 그냥 쓰기

상품 목록에서 상품 코드로 상품을 찾는 코드입니다. 그런데 찾는 코드(`P999`)가 목록에 없습니다.

**JavaScript 버전**

```js
const products = [
  { code: 'P001', name: '아메리카노', price: 4500 },
  { code: 'P002', name: '카페라테', price: 5000 },
]
const found = products.find((p) => p.code === 'P999')
console.log(found.name)
```

```text
TypeError: Cannot read properties of undefined (reading 'name')
```

`find`는 "조건에 맞는 것을 찾아 주는" 기능인데, 못 찾으면 `undefined`를 돌려줍니다. `undefined`에서 `name`을 꺼내려고 하니 **런타임 에러**가 나면서 프로그램이 멈춥니다. 해석하면 "undefined의 속성을 읽을 수 없습니다('name'을 읽으려 함)"입니다. 이 에러는 JavaScript 개발자가 가장 많이 보는 에러 중 하나입니다.

더 곤란한 점은, 테스트할 때 늘 있는 상품 코드만 넣어 봤다면 **이 버그는 개발 중에 한 번도 드러나지 않는다**는 것입니다. 실제 매장에서 단종된 상품의 바코드를 찍는 순간에야 터집니다.

**TypeScript 버전**

```ts
interface Product {
  code: string
  name: string
  price: number
}

const products: Product[] = [
  { code: 'P001', name: '아메리카노', price: 4500 },
  { code: 'P002', name: '카페라테', price: 5000 },
]
const found = products.find((p) => p.code === 'P999')
console.log(found.name)
// ❌ 'found' is possibly 'undefined'. (TS18048)
```

해석: "`found`는 `undefined`일 수도 있습니다."

`interface Product { ... }`는 "상품은 `code`, `name`, `price`를 가진다"는 **설계도**를 적은 것입니다(Part 2에서 배웁니다). TypeScript는 `find`가 "못 찾으면 `undefined`를 돌려준다"는 사실을 알고 있어서, 확인 없이 바로 쓰려고 하면 막습니다. 고치는 방법은 "있는지 먼저 확인하기"입니다.

```ts
interface Product {
  code: string
  name: string
  price: number
}

const products: Product[] = [
  { code: 'P001', name: '아메리카노', price: 4500 },
  { code: 'P002', name: '카페라테', price: 5000 },
]
const found = products.find((p) => p.code === 'P999')
if (found) {
  console.log(found.name)
} else {
  console.log('등록되지 않은 상품입니다.')
}
// 출력: 등록되지 않은 상품입니다.
```

`if (found)`는 "`found`에 값이 있으면"이라는 뜻입니다(Part 1의 조건문에서 배웁니다). TypeScript는 이 `if` 안쪽에서는 `found`가 `undefined`가 아니라는 것을 이해하고 에러를 없애 줍니다.

### 버그 3: 숫자와 문자열 더하기

가격 두 개를 더하는 함수(function, 입력을 받아 일을 처리하고 결과를 돌려주는 코드 묶음)를 만들었습니다. 그런데 어딘가에서 가격을 **글자**로 넘겼습니다. 화면의 입력 칸이나 엑셀 파일에서 읽은 값은 숫자처럼 보여도 글자인 경우가 아주 많습니다.

**JavaScript 버전**

```js
function addPrice(a, b) {
  return a + b
}
console.log(addPrice(4500, '500'))
```

```text
4500500
```

5000원이 나와야 하는데 **4500500**이 나왔습니다. JavaScript에서 `+`는 양쪽 중 하나라도 글자이면 "이어 붙이기"로 동작하기 때문입니다. 4500과 '500'을 이어 붙여 '4500500'이 된 것입니다. 역시 에러는 나지 않습니다. 합계 금액이 450만 원으로 찍힌 영수증을 상상해 보세요.

**TypeScript 버전**

```ts
function addPrice(a: number, b: number): number {
  return a + b
}
console.log(addPrice(4500, '500'))
// ❌ Argument of type 'string' is not assignable to parameter of type 'number'. (TS2345)
```

해석: "`string` 타입의 인수는 `number` 타입의 매개변수에 넣을 수 없습니다."

- **매개변수(parameter)**: 함수가 받기로 한 입력 칸. 여기서는 `a`, `b`입니다.
- **인수(argument)**: 함수를 쓸 때 실제로 넣는 값. 여기서는 `4500`과 `'500'`입니다.

`a: number, b: number`라고 적어 두었기 때문에, 글자를 넣으려 하면 TypeScript가 막습니다. 고치는 방법은 글자를 숫자로 바꿔서 넣는 것입니다.

```ts
function addPrice(a: number, b: number): number {
  return a + b
}
const inputText = '500' // 화면 입력 칸에서 읽은 값이라고 가정합니다
console.log(addPrice(4500, Number(inputText)))
// 출력: 5000
```

### 버그 4: 없는 기능 호출하기

회원 정보에서 이름을 꺼내는 기능(메서드, method)이 있다고 착각하고 호출했습니다.

**JavaScript 버전**

```js
const member = { name: '홍길동' }
member.getName()
```

```text
TypeError: member.getName is not a function
```

해석: "`member.getName`은 함수가 아닙니다." `member`에는 `getName`이 없으니 그 값은 `undefined`이고, `undefined`를 함수처럼 `()`로 호출하려 해서 런타임 에러가 났습니다.

**TypeScript 버전**

```ts
const member = { name: '홍길동' }
member.getName()
// ❌ Property 'getName' does not exist on type '{ name: string; }'. (TS2339)
```

해석: "`{ name: string; }` 타입에는 `getName`이라는 속성이 없습니다."

### 네 가지 버그 한눈에 비교

| 버그 | JavaScript | TypeScript |
|---|---|---|
| 속성 이름 오타 | 조용히 `undefined` (에러 없음) | 실행 전 에러 + 올바른 이름 추천 |
| 없을 수 있는 값 사용 | 실행 중 `TypeError`로 멈춤 | 실행 전 "undefined일 수 있음" 경고 |
| 숫자 + 문자열 | 조용히 이어 붙임 (`4500500`) | 실행 전 "string은 number 자리에 못 넣음" |
| 없는 함수 호출 | 실행 중 `TypeError`로 멈춤 | 실행 전 "그런 속성 없음" |

공통점이 보이시나요? JavaScript는 문제를 **실행 중에 발견하거나, 아예 발견하지 못합니다.** TypeScript는 **코드를 쓰는 순간** 알려 줍니다. 1번 레슨에서 말한 "런타임에 터질 에러를 컴파일 타임으로 끌어온다"가 바로 이것입니다.

### 덤 1: 자동완성 — 외우지 않아도 된다

TypeScript는 각 값의 타입을 알고 있기 때문에, 편집기(코드를 쓰는 프로그램, 3번 레슨에서 설치할 VS Code 등)가 **무엇을 쓸 수 있는지** 정확히 알려 줄 수 있습니다.

```ts
interface Product {
  code: string
  name: string
  price: number
}

const latte: Product = { code: 'P002', name: '카페라테', price: 5000 }
console.log(latte.price)
// 출력: 5000
```

VS Code에서 위 코드를 쓰면서 `latte.`까지 입력하면(점을 찍는 순간), 커서 바로 아래에 작은 목록 상자가 튀어나와 `code`, `name`, `price` 세 가지가 보입니다. 키보드 화살표로 고르고 `Enter`나 `Tab`을 누르면 입력됩니다. 각 항목 옆에는 `(property) Product.price: number`처럼 그 항목의 타입도 함께 표시됩니다.

이 기능 덕분에 다음과 같은 일이 줄어듭니다.

- 속성 이름을 외우거나, 다른 파일을 열어 확인하는 일
- 오타 (목록에서 고르니까 틀릴 일이 없습니다)
- "이 값이 숫자였나, 글자였나?" 헷갈리는 일 (마우스를 올리면 타입이 보입니다)

JavaScript에서도 자동완성이 어느 정도는 되지만, 편집기가 값의 모양을 **짐작**할 수밖에 없어서 정확도가 떨어집니다. 특히 다른 파일에서 넘어온 값이나 함수의 매개변수는 짐작이 거의 불가능합니다.

### 덤 2: 리팩터링 — 이름을 안전하게 바꾸기

**리팩터링(refactoring)**은 프로그램이 하는 일은 그대로 두고, 코드의 구조나 이름을 더 좋게 다듬는 작업입니다.

예를 들어 `price`라는 속성 이름을 `unitPrice`(단가)로 바꾸고 싶다고 합시다. 이 이름이 파일 50개에 200번 쓰였다면 어떨까요?

- **JavaScript**: "모두 찾아 바꾸기"를 하면 상품의 `price`뿐 아니라 배송비의 `price`, 쿠폰의 `price`까지 몽땅 바뀝니다. 하나하나 눈으로 확인해야 하고, 하나라도 놓치면 런타임 에러입니다.
- **TypeScript**: VS Code에서 `Product`의 `price`에 커서를 두고 `F2` 키를 누르면 이름 입력 칸이 뜹니다. `unitPrice`를 입력하고 `Enter`를 누르면, **`Product`의 `price`만** 정확히 골라 200군데를 한 번에 바꿔 줍니다. 혹시 놓친 곳이 있으면 버그 1처럼 컴파일 에러로 알려 줍니다.

규모가 큰 회사 프로젝트일수록 이 차이가 커집니다. 많은 회사가 TypeScript를 쓰는 가장 현실적인 이유가 바로 이것입니다. "고치기 무섭지 않은 코드"가 됩니다.

### 덤 3: 타입은 살아 있는 설명서

```ts
function calcPoint(totalAmount: number, isVip: boolean): number {
  // VIP 회원은 5%, 일반 회원은 1%를 적립합니다
  return isVip ? totalAmount * 0.05 : totalAmount * 0.01
}
console.log(calcPoint(20000, true))
// 출력: 1000
```

함수 안을 읽지 않아도 첫 줄만 보면 "결제 금액(숫자)과 VIP 여부(참/거짓)를 넣으면 숫자를 돌려준다"는 것을 알 수 있습니다. `boolean`은 참(`true`) 또는 거짓(`false`) 두 가지 값만 가지는 타입입니다. 문서는 코드와 따로 놀다가 낡기 쉽지만, 타입은 틀리면 컴파일 에러가 나기 때문에 **항상 최신 상태**로 유지됩니다.

### 솔직한 단점

TypeScript가 공짜는 아닙니다. 단점도 알고 시작하는 것이 좋습니다.

| 단점 | 구체적으로 | 이 위키에서 어떻게 다루나 |
|---|---|---|
| 설정이 필요합니다 | 컴파일러 설치, `tsconfig.json` 설정 파일 등 JavaScript에는 없는 준비 단계가 있습니다. | 5번 레슨에서 최소 설정으로 시작하고, Part 6에서 자세히 배웁니다. |
| 배울 것이 늘어납니다 | JavaScript 문법에 더해 타입 문법을 배워야 합니다. 고급 타입은 꽤 어렵습니다. | Part 1~5에 걸쳐 작은 단계로 나누어 배웁니다. |
| 코드가 조금 길어집니다 | 타입 표기를 적는 만큼 글자 수가 늘어납니다. | 타입 추론 덕분에 생각보다 적게 적어도 됩니다. |
| 에러가 처음엔 많이 보입니다 | JavaScript라면 그냥 실행됐을 코드에도 빨간 줄이 생깁니다. 처음엔 답답하게 느껴집니다. | 6번 레슨과 Part 9의 에러 사전에서 읽는 법을 배웁니다. |
| 런타임 안전은 보장하지 않습니다 | 타입은 실행 중에 사라지므로, 외부에서 들어온 데이터는 여전히 직접 검사해야 합니다. | Part 4의 런타임 검증에서 다룹니다. |
| 빌드 단계가 하나 늘어납니다 | 실행 전에 JavaScript로 변환하는 시간이 듭니다. | 요즘 도구(tsx, Vite 등)는 이 시간을 거의 느끼지 못하게 해 줍니다. |

::: tip 그래서 언제 쓰면 좋을까요?
- 혼자 10분 만에 쓰고 버릴 짧은 스크립트라면 JavaScript로도 충분할 수 있습니다.
- 여러 사람이 함께 만들거나, 몇 달 이상 고쳐 가며 쓸 프로그램이라면 TypeScript의 이점이 단점보다 훨씬 큽니다.
- 처음 배우는 분에게는 오히려 TypeScript가 좋은 선생님입니다. 실수할 때마다 그 자리에서 "여기가 틀렸어요"라고 알려 주기 때문입니다.
:::

## 자주 하는 실수

### 실수 1: 빨간 줄을 없애려고 `any`를 붙이기

```ts
// 잘못된 코드: 에러가 귀찮아서 any 를 붙였습니다
function addPrice(a: any, b: any) {
  return a + b
}
console.log(addPrice(4500, '500'))
// 출력: 4500500 (에러는 사라졌지만 버그는 그대로입니다)
```

**왜 틀렸나:** `any`는 "이 값은 아무거나 될 수 있으니 검사하지 마"라는 뜻입니다. 빨간 줄은 사라지지만 TypeScript의 보호도 함께 사라져서, JavaScript와 똑같은 버그가 납니다. 에러는 **고쳐야 할 대상**이지 숨길 대상이 아닙니다.

```ts
// 고친 코드: 타입을 정확히 적고, 넣는 쪽에서 값을 바꿉니다
function addPrice(a: number, b: number): number {
  return a + b
}
console.log(addPrice(4500, Number('500')))
// 출력: 5000
```

`any`가 무엇이고 언제 써도 되는지는 Part 2의 [특수 타입](../part2-types/02-special-types)에서 배웁니다.

### 실수 2: 에러를 무시하고 실행하기

```text
잘못된 습관:
tsc 가 에러를 보여 줬지만 JavaScript 파일은 만들어졌으니 그냥 실행한다.
```

**왜 틀렸나:** `tsc`는 기본 설정에서 에러가 있어도 JavaScript 파일을 만들어 줍니다(5번 레슨에서 확인합니다). 그 파일을 실행하면 TypeScript가 경고한 바로 그 버그가 그대로 일어납니다.

```text
올바른 습관:
에러가 0개가 될 때까지 고친 뒤에 실행한다.
```

### 실수 3: "TypeScript면 런타임 에러가 절대 안 난다"고 믿기

```ts
// 화면에서 입력받은 값이라고 가정합니다
const quantityText: string = '세 개'
const quantity: number = Number(quantityText)
console.log(quantity * 4500)
// 출력: NaN
```

**왜 틀렸나:** 타입으로는 `quantity`가 `number`이므로 에러가 없습니다. 하지만 `Number('세 개')`의 결과는 `NaN`(Not a Number, "숫자가 아님"을 뜻하는 특별한 숫자 값)입니다. 타입 검사는 **값의 종류**만 보고, **값이 올바른지**는 보지 않습니다.

```ts
// 고친 코드: 실행 중에 직접 확인합니다
const quantityText: string = '세 개'
const quantity: number = Number(quantityText)
if (Number.isNaN(quantity)) {
  console.log('수량은 숫자로 입력해 주세요.')
} else {
  console.log(quantity * 4500)
}
// 출력: 수량은 숫자로 입력해 주세요.
```

## 직접 해 보기

### 문제 1 ⭐ 언제 발견되나

다음 JavaScript 코드의 문제는 **언제** 드러날까요? (실행 전 / 실행 중 에러 / 에러 없이 잘못된 결과)

```js
const menu = { name: '녹차라테', price: 5500 }
console.log(menu.prise)
```

::: details 정답 보기
**에러 없이 잘못된 결과**입니다. `prise`는 없는 속성이라 `undefined`가 조용히 출력됩니다. TypeScript였다면 실행 전에 `Property 'prise' does not exist ... Did you mean 'price'?` 에러가 납니다.
:::

### 문제 2 ⭐ 결과 예상하기

다음 JavaScript 코드는 무엇을 출력할까요?

```js
const deliveryFee = '3000'
const foodPrice = 12000
console.log(foodPrice + deliveryFee)
```

::: details 정답 보기
`120003000`이 출력됩니다. 한쪽이 글자(`'3000'`)이므로 `+`가 더하기가 아니라 이어 붙이기로 동작합니다. 원래 의도한 15000을 얻으려면 `foodPrice + Number(deliveryFee)`처럼 숫자로 바꿔야 합니다.
:::

### 문제 3 ⭐⭐ 에러 메시지 해석하기

다음 에러 메시지를 우리말로 해석해 보세요.

```text
Argument of type 'number' is not assignable to parameter of type 'string'.
```

::: details 정답 보기
"`number` 타입의 인수는 `string` 타입의 매개변수에 넣을 수 없습니다." 즉, 함수는 글자를 받기로 했는데 숫자를 넣었다는 뜻입니다.
:::

### 문제 4 ⭐⭐ TypeScript가 잡아 줄 버그 고르기

다음 중 TypeScript가 **실행 전에** 잡아 줄 수 있는 것을 모두 고르세요.

1. 속성 이름 오타
2. 할인율을 10%로 해야 하는데 20%로 잘못 적은 것
3. 숫자만 받는 함수에 글자를 넣은 것
4. 서버가 예상과 다른 모양의 데이터를 보내 준 것
5. 없는 함수를 호출한 것

::: details 정답 보기
**1, 3, 5**입니다.
- 2는 숫자 자리에 숫자를 넣었으므로 타입은 맞습니다. 업무 로직의 실수는 타입이 알 수 없습니다(테스트로 잡습니다).
- 4는 실행 중에 들어오는 데이터라서 컴파일 타임에는 알 수 없습니다(런타임 검증으로 잡습니다).
:::

### 문제 5 ⭐⭐ 고쳐 보기

다음 TypeScript 코드는 에러가 납니다. `if`를 써서 에러가 나지 않도록 고쳐 보세요. 못 찾으면 `'회원 없음'`을 출력하게 합니다.

```ts
const members = [
  { id: 1, name: '김민지' },
  { id: 2, name: '이서준' },
]
const target = members.find((m) => m.id === 3)
console.log(target.name)
// ❌ 'target' is possibly 'undefined'. (TS18048)
```

::: details 정답 보기
```ts
const members = [
  { id: 1, name: '김민지' },
  { id: 2, name: '이서준' },
]
const target = members.find((m) => m.id === 3)
if (target) {
  console.log(target.name)
} else {
  console.log('회원 없음')
}
// 출력: 회원 없음
```
:::

### 문제 6 ⭐⭐⭐ 팀장님 설득하기

여러분 팀이 JavaScript로 만든 매장 관리 프로그램을 TypeScript로 바꿀지 고민 중입니다. 찬성 이유 두 가지와, 걱정되는 점 두 가지를 적어 보세요.

::: details 정답 보기
예시 답안입니다.
- 찬성: (1) 속성 오타, undefined 사용 같은 버그를 배포 전에 잡을 수 있습니다. (2) 이름 바꾸기·구조 변경을 안전하게 할 수 있어 유지보수 비용이 줄어듭니다.
- 걱정: (1) 팀원 모두가 타입 문법을 배워야 하고, 처음에는 개발 속도가 느려질 수 있습니다. (2) 기존 코드를 옮기는 데 시간이 들고, 빌드 설정을 새로 갖춰야 합니다.

실제로는 한 번에 다 바꾸지 않고 파일 단위로 조금씩 옮기는 방법을 많이 씁니다. Part 6의 [마이그레이션](../part6-tooling/07-migration) 레슨에서 다룹니다.
:::

## 확인 퀴즈

1. JavaScript에서 없는 속성을 읽으면 어떤 값이 나오나요?
2. `4500 + '500'`의 JavaScript 실행 결과는 무엇인가요?
3. TypeScript가 같은 버그를 JavaScript보다 "더 일찍" 알려 준다는 것은 언제를 말하나요?
4. VS Code에서 TypeScript 코드의 이름을 안전하게 한꺼번에 바꾸는 키는 무엇인가요?
5. 타입 검사를 통과한 코드라도 런타임 에러가 날 수 있나요? 예를 하나 드세요.

::: details 정답 보기
1. `undefined`
2. `'4500500'` (이어 붙인 문자열)
3. 실행하기 전, 즉 **컴파일 타임**(편집기에서는 코드를 쓰는 순간)입니다.
4. `F2` (이름 바꾸기, Rename Symbol)
5. 날 수 있습니다. 예: 사용자가 숫자 칸에 "세 개"를 입력해 `NaN`이 되는 경우, 서버가 예상과 다른 데이터를 보내는 경우.
:::

## 정리

- JavaScript는 버그를 **실행 중에** 발견하거나, 에러 없이 **틀린 결과**를 내기도 합니다.
- TypeScript는 속성 오타, `undefined` 사용, 숫자·문자열 혼동, 없는 함수 호출을 **실행 전에** 알려 줍니다.
- 타입 덕분에 **자동완성**이 정확해지고, `F2` 같은 **리팩터링**을 안전하게 할 수 있습니다.
- 타입은 코드와 함께 유지되는 **살아 있는 설명서**입니다.
- 단점도 있습니다: 설정, 학습 비용, 처음의 많은 에러. 그리고 런타임 안전은 따로 챙겨야 합니다.
- 빨간 줄을 `any`로 숨기지 말고, 원인을 찾아 고치는 습관을 들이세요.

## 다음 단계

[개발 환경 설치 (Node.js · VS Code · Git)](./03-setup) — 여러분의 PC에 TypeScript 개발에 필요한 도구를 하나씩 설치하고, 터미널 사용법을 익힙니다.
