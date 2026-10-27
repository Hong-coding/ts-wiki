---
title: 연산자와 표현식
---

# 연산자와 표현식

<LessonMeta level="입문" :minutes="40" prev="number · string · boolean · null · undefined, 다섯 가지 원시 타입을 익혔습니다." />

## 이번에 배울 것

- 산술 연산자(`+`, `-`, `*`, `/`, `%`, `**`)로 계산하고, 나눗셈이 소수를 돌려준다는 것을 설명할 수 있다.
- 문자열과 숫자를 `+`로 섞을 때 생기는 함정을 피할 수 있다.
- 비교할 때 `==` 대신 반드시 `===`를 써야 하는 이유를 말할 수 있다.
- `&&`, `||`, `!`와 단락 평가를 이해하고, `??`와 `||`의 차이(0과 빈 문자열 처리)를 구분할 수 있다.
- 옵셔널 체이닝 `?.`, 증감 연산자 `++`/`--`, 복합 할당 `+=`를 쓰고, 괄호로 계산 순서를 정할 수 있다.

## 먼저 알아 둘 것

- [값과 변수](./01-values-and-variables): `let`·`const`로 변수를 만들고 값을 바꾸는 법
- [원시 타입](./02-primitive-types): number·string·boolean·`null`·`undefined`의 차이, `0.1 + 0.2` 문제
- 예제는 `.ts` 파일로 저장해 `npx tsx 파일이름.ts`로 실행하거나 [TS Playground](../part0-start/04-playground)에서 실행합니다.

## 비유로 이해하기

### 계산대의 버튼들

편의점 계산대(POS)를 떠올려 봅시다. 바코드를 찍으면 상품 값이 들어오고, 직원은 버튼을 눌러 값을 처리합니다.

- `x` 버튼: 수량만큼 곱하기
- `할인` 버튼: 금액에서 빼기
- `회원 확인` 버튼: "회원인가? 그리고 쿠폰이 있는가?" 판단하기

여기서 **값**(상품 가격, 수량)이 재료이고, **버튼**이 연산자입니다. **연산자**(operator)는 값을 받아 새 값을 만들어 내는 기호입니다. 연산자가 다루는 값을 **피연산자**(operand)라고 합니다. `4500 * 2`에서 `*`가 연산자, `4500`과 `2`가 피연산자입니다.

그리고 값과 연산자를 조합해 **하나의 값으로 계산되는 코드 조각**을 **표현식**(expression)이라고 부릅니다. `4500 * 2`는 표현식이고, 계산하면 `9000`이라는 값이 됩니다. `price`처럼 변수 하나만 써도 표현식이고, `'아메리카노'`처럼 값 하나만 있어도 표현식입니다. "계산하면 값이 나오는 것"은 모두 표현식입니다.

## 개념 설명

### 산술 연산자: 사칙연산과 그 밖의 계산

| 연산자 | 뜻 | 예 | 결과 |
|---|---|---|---|
| `+` | 더하기 | `4500 + 500` | `5000` |
| `-` | 빼기 | `10000 - 3500` | `6500` |
| `*` | 곱하기 | `4500 * 3` | `13500` |
| `/` | 나누기 | `7 / 2` | `3.5` |
| `%` | 나머지 | `7 % 2` | `1` |
| `**` | 거듭제곱 | `2 ** 10` | `1024` |

```ts
const price = 4500
const quantity = 3

console.log(price * quantity)  // 출력: 13500
console.log(7 / 2)             // 출력: 3.5
console.log(7 % 3)             // 출력: 1
console.log(2 ** 10)           // 출력: 1024
```

#### 나눗셈은 소수까지 나옵니다

다른 언어(Java, C 등)를 배운 적이 있다면 `7 / 2`가 `3`일 거라고 생각할 수 있습니다. JavaScript에는 정수와 소수의 구분 없이 `number` 하나뿐이므로 `7 / 2`는 `3.5`입니다. **몫(정수 부분)만** 필요하면 `Math.floor`(소수점 아래를 버리는 내장 함수)를 씁니다.

```ts
const totalCups = 7
const cupsPerTray = 2

console.log(totalCups / cupsPerTray)             // 출력: 3.5
console.log(Math.floor(totalCups / cupsPerTray)) // 출력: 3
console.log(totalCups % cupsPerTray)             // 출력: 1
```

"컵 7개를 2개씩 담으면 쟁반 3개에 1개가 남는다"를 코드로 쓴 것입니다.

#### 나머지 연산자 %는 생각보다 자주 씁니다

`%`는 "나누고 남은 값"입니다. 실무에서 쓰는 곳이 많습니다.

```ts
const orderNo = 1037

console.log(orderNo % 2)   // 출력: 1  → 홀수 (짝수면 0)
console.log(orderNo % 10)  // 출력: 7  → 마지막 자리 숫자
console.log(125 % 60)      // 출력: 5  → 125분은 2시간 '5분'
```

- 짝수·홀수 판별: `n % 2`가 `0`이면 짝수
- 마지막 자리: `n % 10`
- 시간 계산: 분을 60으로 나눈 나머지

::: info 음수의 나머지
`-7 % 3`은 `-1`입니다. 결과의 부호가 **앞쪽 수(나누어지는 수)를 따릅니다.** 수학 시간에 배운 나머지(항상 0 이상)와 다르므로, 음수가 들어올 수 있는 계산에서는 주의하세요.
:::

#### 소수 계산 주의 (복습)

[원시 타입](./02-primitive-types)에서 본 것처럼 `0.1 + 0.2`는 `0.30000000000000004`입니다. 금액은 원 단위 **정수**로 계산하는 것이 안전합니다.

### 문자열 + : 이어 붙이기와 그 함정

`+`는 두 가지 일을 합니다.

- 양쪽이 숫자면 **더하기**
- 한쪽이라도 문자열이면 **이어 붙이기**(연결, concatenation)

```ts
console.log(4500 + 500)        // 출력: 5000
console.log('아메리' + '카노')   // 출력: 아메리카노
console.log('합계: ' + 5000)    // 출력: 합계: 5000
console.log('4500' + 500)      // 출력: 4500500
```

마지막 줄이 함정입니다. `'4500'`은 따옴표 때문에 **문자열**이므로, `500`도 문자열로 바뀌어 이어 붙여집니다. 그래서 `5000`이 아니라 `4500500`이 됩니다. 사용자가 입력한 값이나 화면에서 읽어 온 값은 숫자처럼 보여도 **문자열인 경우가 많아서** 이 버그가 실무에서 자주 납니다.

TypeScript는 `문자열 + 숫자`를 **에러로 막지 않습니다.** JavaScript에서 흔히 쓰는 정상 문법이기 때문입니다. 그 대신 변수의 타입을 보고 실수를 알아챌 수 있습니다. VS Code에서 변수에 마우스를 올려 `string`인지 `number`인지 확인하는 습관을 들이세요. 문자열을 숫자로 바꾸려면 `Number()`를 씁니다.

```ts
const inputPrice = '4500'          // 입력창에서 읽은 값이라고 가정 (문자열)
console.log(inputPrice + 500)        // 출력: 4500500
console.log(Number(inputPrice) + 500) // 출력: 5000
```

#### 왼쪽부터 계산된다

`+`는 **왼쪽부터** 차례로 계산합니다. 그래서 순서에 따라 결과가 달라집니다.

```ts
console.log(1 + 2 + '원')   // 출력: 3원
console.log('원' + 1 + 2)   // 출력: 원12
```

1. `1 + 2 + '원'`: 먼저 `1 + 2` = `3`(숫자 더하기), 다음 `3 + '원'` = `'3원'`
2. `'원' + 1 + 2`: 먼저 `'원' + 1` = `'원1'`(이어 붙이기), 다음 `'원1' + 2` = `'원12'`

글자와 숫자를 섞어 출력할 때는 이런 헷갈림이 없는 **템플릿 리터럴**(백틱 `` ` ``으로 감싸고 값을 문장 사이에 끼워 넣는 문자열)이 더 안전합니다. [문자열](./09-strings) 레슨에서 배웁니다.

#### 다른 산술 연산자는 TypeScript가 막아 줍니다

`-`, `*`, `/`는 JavaScript에서 문자열을 몰래 숫자로 바꿔 계산합니다. TypeScript는 이것을 허용하지 않습니다.

```ts
const quantityText = '3'
console.log(quantityText * 2)
// ❌ The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type. (TS2362)
```

"산술 연산의 왼쪽은 숫자 타입이어야 한다"는 뜻입니다. JavaScript였다면 `6`이 나와서 문제를 모르고 지나갔을 것입니다. `Number(quantityText) * 2`로 명확하게 바꿔 씁니다.

### 비교 연산자: 결과는 true 또는 false

비교 연산자는 두 값을 비교해 **불리언**(`true`/`false`)을 돌려줍니다.

| 연산자 | 뜻 | 예 | 결과 |
|---|---|---|---|
| `>` | 크다 | `5000 > 3000` | `true` |
| `<` | 작다 | `5000 < 3000` | `false` |
| `>=` | 크거나 같다 | `30000 >= 30000` | `true` |
| `<=` | 작거나 같다 | `0 <= -1` | `false` |
| `===` | 같다 | `'VIP' === 'VIP'` | `true` |
| `!==` | 다르다 | `3 !== 3` | `false` |

```ts
const orderAmount = 32000
const freeShippingMin = 30000

const isFreeShipping = orderAmount >= freeShippingMin
console.log(isFreeShipping) // 출력: true
```

비교 결과를 변수에 담아 두면 이름만으로 의미가 드러납니다. 이런 불리언 값은 다음 레슨의 [조건문](./04-conditionals)에서 핵심 재료가 됩니다.

### == 와 === : 반드시 ===를 씁니다

JavaScript에는 "같다"를 뜻하는 연산자가 두 개 있습니다.

- `===`(**일치 연산자**, strict equality): 값과 **타입이 모두 같아야** `true`
- `==`(**동등 연산자**, loose equality): 타입이 다르면 **자기 마음대로 바꾼 뒤** 비교

`==`의 "자기 마음대로 바꾸기"는 규칙이 복잡하고 예상하기 어렵습니다. JavaScript에서 실제로 이런 결과가 나옵니다.

| 비교 | `==` 결과 | `===` 결과 |
|---|---|---|
| `0` 와 `''`(빈 문자열) | `true` | `false` |
| `0` 와 `'0'` | `true` | `false` |
| `''` 와 `'0'` | `false` | `false` |
| `1` 와 `true` | `true` | `false` |
| `null` 와 `undefined` | `true` | `false` |

첫째 줄과 둘째 줄을 보면 `0 == ''`이고 `0 == '0'`인데, 셋째 줄에서 `'' == '0'`은 아닙니다. 상식적인 "같다"의 규칙이 깨집니다. 그래서 실무 규칙은 단순합니다.

> **비교는 항상 `===`와 `!==`를 씁니다. `==`와 `!=`는 쓰지 않습니다.**

TypeScript는 타입이 전혀 다른 두 값을 비교하면 `==`든 `===`든 에러로 알려 줍니다.

```ts
const stock = 0
const inputText = ''
console.log(stock == inputText)
// ❌ This comparison appears to be unintentional because the types 'number' and 'string' have no overlap. (TS2367)
```

"`number`와 `string`은 겹치는 부분이 없어서 이 비교는 의도한 것 같지 않다"는 뜻입니다. 숫자와 문자열을 비교해야 한다면 한쪽을 먼저 같은 타입으로 바꿉니다.

::: info 예외 하나: `== null`
값이 `null`이거나 `undefined`인지 한 번에 확인하려고 `value == null`이라고 쓰는 코드를 가끔 봅니다. `null == undefined`가 `true`인 점을 이용한 관용구입니다. 팀 규칙에 따라 허용하기도 하지만, 이 위키에서는 헷갈리지 않도록 `===`만 씁니다. 값이 없을 때를 다루는 더 좋은 방법은 아래의 `??`와 `?.`입니다.
:::

### 논리 연산자: &&, ||, !

여러 조건을 묶을 때 씁니다.

| 연산자 | 이름 | 뜻 |
|---|---|---|
| `&&` | AND(그리고) | 양쪽이 **모두** 참이어야 참 |
| `\|\|` | OR(또는) | **하나라도** 참이면 참 |
| `!` | NOT(아님) | 참↔거짓을 뒤집음 |

```ts
const isOpen = true
const hasStock = false

console.log(isOpen && hasStock) // 출력: false
console.log(isOpen || hasStock) // 출력: true
console.log(!isOpen)            // 출력: false
```

실무 문장으로 바꾸면 이렇습니다.

```ts
const isMember = true
const orderAmount = 25000
const hasCoupon = false

// 회원이면서 2만 원 이상 주문하면 포인트 적립
const canEarnPoint = isMember && orderAmount >= 20000
// 회원이거나 쿠폰이 있으면 할인
const canDiscount = isMember || hasCoupon
// 품절이 아니면 주문 가능
const isSoldOut = false
const canOrder = !isSoldOut

console.log(canEarnPoint, canDiscount, canOrder) // 출력: true true true
```

`isMember && orderAmount >= 20000`에서 `>=`가 `&&`보다 먼저 계산됩니다. 계산 순서는 아래 "우선순위"에서 정리합니다.

### 단락 평가: 답이 정해지면 나머지는 보지 않는다

`&&`와 `||`는 **왼쪽부터** 보다가, 결과가 정해지면 오른쪽을 **아예 계산하지 않습니다.** 이것을 **단락 평가**(short-circuit evaluation)라고 합니다. 전기 회로의 "합선(short circuit)"처럼 중간에 지름길로 빠져나간다는 뜻입니다.

- `A && B`: `A`가 거짓이면 `B`를 볼 필요가 없습니다. 어차피 거짓이니까요.
- `A || B`: `A`가 참이면 `B`를 볼 필요가 없습니다. 어차피 참이니까요.

```ts
const isLoggedIn = false
isLoggedIn && console.log('장바구니를 불러옵니다')
// 아무것도 출력되지 않음: 왼쪽이 false라서 오른쪽을 실행하지 않음
```

그리고 중요한 사실이 하나 더 있습니다. `&&`와 `||`는 `true`/`false`가 아니라 **결정을 내린 쪽의 값 자체**를 돌려줍니다.

```ts
let favoriteMenu = '아메리카노'
let emptyMenu = ''
let orderAmount = 10000

console.log(favoriteMenu || '기본 메뉴')   // 출력: 아메리카노
console.log(emptyMenu || '기본 메뉴')      // 출력: 기본 메뉴
console.log(orderAmount > 5000 && 1000)  // 출력: 1000
```

- `emptyMenu || '기본 메뉴'`: 빈 문자열 `''`는 조건에서 **거짓처럼 취급**됩니다. 그래서 오른쪽 값 `'기본 메뉴'`를 돌려줍니다.
- `orderAmount > 5000 && 1000`: 왼쪽이 `true`라서 결과는 오른쪽 값 `1000`입니다.
- 조건에서 거짓처럼 취급되는 값을 **falsy**(폴시)라고 부릅니다. `false`, `0`, `''`, `null`, `undefined`, `NaN`이 falsy입니다. 나머지는 모두 **truthy**(트루시, 참처럼 취급)입니다. [조건문](./04-conditionals) 레슨에서 표로 다시 정리합니다.

### ?? 와 || : 기본값 정하기

값이 없을 때 **기본값**을 쓰고 싶은 경우가 많습니다. 예를 들어 "닉네임이 없으면 '손님'으로 부른다". 두 가지 방법이 있습니다.

- `A || B`: `A`가 **falsy**면 `B`
- `A ?? B`: `A`가 **`null` 또는 `undefined`일 때만** `B`

`??`는 **널 병합 연산자**(nullish coalescing operator)라고 부릅니다. "nullish"는 "`null`이나 `undefined`, 즉 값이 아예 없는 상태"라는 뜻입니다.

둘의 차이는 `0`과 `''`(빈 문자열)에서 드러납니다.

```ts
let savedPoint: number | null = 0

console.log(savedPoint || 100) // 출력: 100
console.log(savedPoint ?? 100) // 출력: 0
```

`number | null`은 "숫자 또는 `null`"이라는 타입 표기입니다(Part 2의 [유니온 타입](../part2-types/06-union-literal)에서 배웁니다). 포인트가 **실제로 0점**인 회원에게 `||`를 쓰면 0을 "값 없음"으로 착각해 100점으로 바꿔 버립니다. 버그입니다. `??`는 `0`을 정상 값으로 존중합니다.

| 왼쪽 값 | `왼쪽 \|\| '기본'` | `왼쪽 ?? '기본'` |
|---|---|---|
| `null` | `'기본'` | `'기본'` |
| `undefined` | `'기본'` | `'기본'` |
| `0` | `'기본'` | `0` |
| `''` | `'기본'` | `''` |
| `false` | `'기본'` | `false` |
| `'김민지'` | `'김민지'` | `'김민지'` |

> **"값이 없을 때만" 기본값을 쓰려면 `??`를 씁니다.** `0`, `''`, `false`도 기본값으로 바꾸고 싶을 때만 `||`를 씁니다.

`??`는 ES2020(2020년 JavaScript 표준)부터 생긴 문법입니다. [TS Playground](../part0-start/04-playground)에서 Target에 따라 `??`가 옛 문법으로 바뀌던 것을 기억해 보세요.

### 옵셔널 체이닝 ?. : 없으면 멈추기

객체(object)는 여러 값을 묶어 둔 것입니다. `member.name`처럼 `.`으로 안의 값(속성)을 꺼냅니다. 객체는 [객체](./08-objects) 레슨에서 자세히 배우고, 여기서는 "점으로 안의 값을 꺼낸다"만 알면 됩니다.

그런데 꺼내려는 값이 **없을 수도** 있다면 어떨까요?

```ts
// couponCode?: string 은 "couponCode는 있을 수도, 없을 수도 있다"는 뜻
const member: { name: string; couponCode?: string } = { name: '김민지' }

console.log(member.couponCode.length)
// ❌ 'member.couponCode' is possibly 'undefined'. (TS18048)
```

이 회원은 쿠폰 코드가 없어서 `member.couponCode`는 `undefined`입니다. `undefined`에서 `.length`(글자 수)를 꺼내려 하면 실행 중에 `TypeError: Cannot read properties of undefined (reading 'length')`로 프로그램이 멈춥니다. TypeScript가 이것을 미리 막아 준 것입니다.

**옵셔널 체이닝**(optional chaining) `?.`은 "앞의 값이 `null`이나 `undefined`면 **거기서 멈추고 `undefined`를 돌려준다**"는 연산자입니다.

```ts
const member: { name: string; couponCode?: string } = { name: '김민지' }

console.log(member.couponCode?.length) // 출력: undefined
```

`?.`와 `??`는 함께 쓰면 잘 어울립니다. "없으면 멈추고, 그때는 기본값"이라는 뜻이 됩니다.

```ts
const member: { name: string; couponCode?: string } = { name: '김민지' }

const couponLength = member.couponCode?.length ?? 0
console.log(couponLength) // 출력: 0
```

`?.`도 ES2020부터 생긴 문법입니다.

::: warning ?.를 남발하지 마세요
`?.`는 "없을 수도 있는 것이 **정상**"인 값에만 씁니다. 반드시 있어야 하는 값에 `?.`를 붙이면, 값이 없는 버그가 생겨도 조용히 `undefined`로 넘어가 버려서 원인을 찾기 더 어려워집니다.
:::

### 증감 연산자: ++ 와 --

`++`는 변수에 1을 더하고, `--`는 1을 뺍니다. 반복문에서 횟수를 셀 때 자주 씁니다.

```ts
let visitCount = 0
visitCount++
visitCount++
console.log(visitCount) // 출력: 2

let stock = 10
stock--
console.log(stock) // 출력: 9
```

`visitCount++`는 `visitCount = visitCount + 1`을 줄여 쓴 것입니다. 그래서 `const`로 만든 변수에는 쓸 수 없습니다.

#### 앞에 붙이느냐 뒤에 붙이느냐

`++`를 변수 **뒤**에 쓰면(`count++`, 후위) "**지금 값을 먼저 돌려주고**, 그다음 1 증가", **앞**에 쓰면(`++count`, 전위) "**먼저 1 증가**하고, 바뀐 값을 돌려줌"입니다.

```ts
let count = 5
const a = count++ // a에는 증가 전 값 5가 들어가고, count는 6이 됨
console.log(a, count) // 출력: 5 6

const b = ++count // count가 먼저 7이 되고, b에도 7이 들어감
console.log(b, count) // 출력: 7 7
```

이 차이 때문에 생기는 버그가 많아서, 실무에서는 `++`를 **한 줄에 단독으로만** 쓰는 것을 권합니다(`count++`처럼). 다른 계산식 안에 섞어 쓰지 마세요. 더 명확하게 `count += 1`로 쓰는 팀도 많습니다.

### 복합 할당 연산자: += -= *= /=

"변수에 무언가를 계산해서 다시 넣기"를 줄여 쓰는 연산자입니다.

| 줄인 표기 | 같은 뜻 |
|---|---|
| `total += 3000` | `total = total + 3000` |
| `total -= 500` | `total = total - 500` |
| `total *= 2` | `total = total * 2` |
| `total /= 4` | `total = total / 4` |
| `total %= 3` | `total = total % 3` |
| `point ??= 0` | `point`가 `null`·`undefined`일 때만 `point = 0` (ES2021부터) |

```ts
let total = 10000 // 상품 금액
total += 3000     // 배송비 추가
total -= 500      // 쿠폰 할인
total *= 2        // 같은 주문 2건
console.log(total) // 출력: 25000
```

문자열에도 `+=`를 쓸 수 있습니다. 이때는 이어 붙이기입니다.

```ts
let receipt = '아메리카노'
receipt += ', 카페라떼'
console.log(receipt) // 출력: 아메리카노, 카페라떼
```

### 연산자 우선순위와 괄호

수학처럼 연산자에도 **먼저 계산하는 순서**가 있습니다. 이것을 **우선순위**(precedence)라고 합니다.

```ts
console.log(2 + 3 * 4)   // 출력: 14   (곱하기 먼저)
console.log((2 + 3) * 4) // 출력: 20   (괄호 먼저)
```

자주 쓰는 연산자를 우선순위가 높은 것부터 정리하면 다음과 같습니다.

| 순서 | 연산자 | 예 |
|---|---|---|
| 1 (가장 먼저) | `( )` 괄호 | `(a + b)` |
| 2 | `!`, `++`, `--` (단항) | `!isOpen` |
| 3 | `**` | `2 ** 3` |
| 4 | `*`, `/`, `%` | `price * qty` |
| 5 | `+`, `-` | `a + b` |
| 6 | `<`, `>`, `<=`, `>=` | `amount >= 30000` |
| 7 | `===`, `!==` | `grade === 'VIP'` |
| 8 | `&&` | `a && b` |
| 9 | `\|\|`, `??` | `a \|\| b` |
| 10 (가장 나중) | `=`, `+=` 등 할당 | `total = ...` |

이 표를 외울 필요는 없습니다. 다음 규칙 하나면 충분합니다.

> **조금이라도 헷갈리면 괄호를 친다.**

괄호는 계산 결과를 바꾸지 않아도 **읽는 사람에게 의도를 보여 줍니다.**

```ts
const price = 12000
const quantity = 3
const discountRate = 0.1

// 괄호 없이도 맞지만 읽기 어려움
const total1 = price * quantity - price * quantity * discountRate
// 괄호로 의도를 드러냄: (상품 합계) × (1 - 할인율)
const total2 = (price * quantity) * (1 - discountRate)

console.log(total1, total2) // 출력: 32400 32400
```

::: info ??와 ||는 섞어 쓸 수 없습니다
`a || b ?? c`처럼 `??`를 `||`·`&&`와 괄호 없이 섞으면 문법 에러가 납니다. 어느 쪽을 먼저 계산할지 헷갈리기 때문에 JavaScript가 일부러 막아 둔 것입니다. `(a || b) ?? c`처럼 괄호로 순서를 밝혀야 합니다.
:::

## 자주 하는 실수

### 실수 1. 입력값(문자열)을 그대로 더하기

```ts
const inputQuantity = '2' // 입력창에서 읽은 값
const total = 4500 * 2 + inputQuantity
console.log(total) // 출력: 90002
```

**왜 틀렸나**: `inputQuantity`가 문자열이라 `9000 + '2'`가 이어 붙이기 `'90002'`가 되었습니다. 게다가 `total`의 타입도 `string`이 되어 버립니다. VS Code에서 `total`에 마우스를 올려 보면 `const total: string`으로 보입니다.

**고친 코드**:

```ts
const inputQuantity = '2'
const total = 4500 * Number(inputQuantity)
console.log(total) // 출력: 9000
```

### 실수 2. == 로 비교하기

```ts
const grade = 'VIP'
console.log(grade == 'VIP') // 출력: true
```

**왜 틀렸나**: 지금은 결과가 맞지만, `==`는 타입이 다를 때 몰래 변환해서 `0 == ''`이 `true`가 되는 등 예상 밖의 결과를 냅니다. 우연히 맞는 코드는 언젠가 틀립니다. 습관을 들이는 것이 중요합니다.

**고친 코드**:

```ts
const grade = 'VIP'
console.log(grade === 'VIP') // 출력: true
```

### 실수 3. 0점을 "값 없음"으로 착각하는 ||

```ts
let stock: number | null = 0
const displayStock = stock || '정보 없음'
console.log(displayStock) // 출력: 정보 없음
```

**왜 틀렸나**: 재고가 **0개**라는 정상 정보인데 `||`가 `0`을 falsy로 보고 `'정보 없음'`으로 바꿨습니다. 손님은 품절인지 정보가 없는지 구분할 수 없습니다.

**고친 코드**: `null`·`undefined`일 때만 기본값을 쓰는 `??`를 씁니다.

```ts
let stock: number | null = 0
const displayStock = stock ?? '정보 없음'
console.log(displayStock) // 출력: 0
```

### 실수 4. 우선순위를 착각한 할인 계산

"할인 후 금액에 10% 부가세를 붙인다"를 이렇게 썼습니다.

```ts
const price = 10000
const discountRate = 0.2
const withTax = price - price * discountRate * 1.1
console.log(withTax) // 출력: 7800
```

**왜 틀렸나**: `*`가 `-`보다 먼저 계산되므로 `price * discountRate * 1.1`(할인액에 부가세)을 먼저 구한 뒤 뺐습니다. 의도는 "(할인 후 금액) × 1.1"이었습니다.

**고친 코드**: 의도한 순서를 괄호로 밝힙니다.

```ts
const price = 10000
const discountRate = 0.2
const withTax = (price - price * discountRate) * 1.1
console.log(withTax) // 출력: 8800
```

### 실수 5. const 변수에 ++ 쓰기

```ts
const orderCount = 0
orderCount++
// ❌ Cannot assign to 'orderCount' because it is a constant. (TS2588)
```

**왜 틀렸나**: `orderCount++`는 `orderCount = orderCount + 1`이므로 재할당입니다. `const`는 재할당할 수 없습니다.

**고친 코드**:

```ts
let orderCount = 0
orderCount++
console.log(orderCount) // 출력: 1
```

## 직접 해 보기

### 문제 1. 거스름돈 계산 ⭐

손님이 `50000`원을 내고 `4500`원짜리 커피 `3`잔과 `6000`원짜리 케이크 `2`개를 샀습니다. 거스름돈을 계산해 출력하세요.

::: details 정답 보기
```ts
const paid = 50000
const coffeeTotal = 4500 * 3
const cakeTotal = 6000 * 2
const change = paid - (coffeeTotal + cakeTotal)
console.log(change) // 출력: 24500
```

`13500 + 12000 = 25500`원을 50000원에서 빼면 24500원입니다. 괄호로 "합계를 먼저 구한다"는 의도를 드러냈습니다.
:::

### 문제 2. 상자 포장 ⭐

음료 `100`병을 한 상자에 `12`병씩 담습니다. 꽉 찬 상자 수와 남는 병 수를 출력하세요.

::: details 정답 보기
```ts
const bottles = 100
const perBox = 12

console.log(Math.floor(bottles / perBox)) // 출력: 8
console.log(bottles % perBox)             // 출력: 4
```

`100 / 12`는 `8.333...`이므로 `Math.floor`로 몫 8을 구하고, 나머지는 `%`로 구합니다.
:::

### 문제 3. 결과 예측하기 ⭐⭐

각 줄의 출력을 먼저 예측한 뒤 실행해서 확인하세요.

```ts
console.log(10 + 5 + '개')
console.log('재고: ' + 10 + 5)
console.log('재고: ' + (10 + 5))
console.log(3 + 4 * 2 ** 2)
```

::: details 정답 보기
```text
15개
재고: 105
재고: 15
19
```

- 둘째 줄은 왼쪽부터 `'재고: 10'` → `'재고: 105'`로 이어 붙입니다.
- 셋째 줄은 괄호가 먼저 계산되어 `15`가 붙습니다.
- 넷째 줄은 `**` → `*` → `+` 순서: `2 ** 2 = 4`, `4 * 4 = 16`, `3 + 16 = 19`입니다.
:::

### 문제 4. 무료 배송 조건 ⭐⭐

"회원이면서 주문 금액이 3만 원 이상이거나, 무료 배송 쿠폰이 있으면 무료 배송"입니다. 아래 변수로 `isFreeShipping`을 계산하세요. 괄호로 의도를 분명히 합니다.

```ts
const isMember = true
const orderAmount = 28000
const hasFreeShippingCoupon = true
```

::: details 정답 보기
```ts
const isMember = true
const orderAmount = 28000
const hasFreeShippingCoupon = true

const isFreeShipping = (isMember && orderAmount >= 30000) || hasFreeShippingCoupon
console.log(isFreeShipping) // 출력: true
```

회원 조건은 금액 미달로 `false`지만, 쿠폰이 있으므로 `||`에 의해 `true`입니다. 괄호가 없어도 `&&`가 `||`보다 먼저 계산되어 결과는 같지만, 괄호를 치면 읽는 사람이 바로 이해합니다.
:::

### 문제 5. ?? 로 기본값 정하기 ⭐⭐

다음 코드에서 `requestQuantity`가 `0`이면 `0`을, `null`이면 `1`을 쓰도록 `orderQuantity`를 계산하세요. `||`를 쓰면 무엇이 잘못되는지도 설명하세요.

```ts
let requestQuantity: number | null = 0
```

::: details 정답 보기
```ts
let requestQuantity: number | null = 0
const orderQuantity = requestQuantity ?? 1
console.log(orderQuantity) // 출력: 0
```

`requestQuantity || 1`로 쓰면 `0`을 falsy로 보고 `1`로 바꿔 버립니다. "수량 0"이라는 정상 값이 사라지므로 `??`를 써야 합니다.
:::

### 문제 6. 옵셔널 체이닝 ⭐⭐⭐

회원 정보에 주소가 있을 수도, 없을 수도 있습니다. 주소의 글자 수를 출력하되, 주소가 없으면 `0`을 출력하세요. 에러가 나지 않아야 합니다.

```ts
const member: { name: string; address?: string } = { name: '이서준' }
```

::: details 정답 보기
```ts
const member: { name: string; address?: string } = { name: '이서준' }
const addressLength = member.address?.length ?? 0
console.log(addressLength) // 출력: 0
```

`member.address?.length`는 주소가 없으므로 `undefined`가 되고, `?? 0`이 그것을 `0`으로 바꿉니다. `member.address.length`라고 쓰면 `'member.address' is possibly 'undefined'.` 에러(TS18048)가 납니다.
:::

## 확인 퀴즈

**Q1.** `7 / 2`와 `7 % 2`의 결과는 각각 무엇인가요?

::: details 정답 보기
`3.5`와 `1`입니다. JavaScript의 나눗셈은 소수까지 계산하고, `%`는 나머지를 구합니다.
:::

**Q2.** `'1000' + 500`의 결과는 무엇이고, 왜 그런가요?

::: details 정답 보기
`'1000500'`(문자열)입니다. `+`는 한쪽이 문자열이면 더하기 대신 이어 붙이기를 하기 때문입니다.
:::

**Q3.** `==` 대신 `===`를 써야 하는 이유는 무엇인가요?

::: details 정답 보기
`==`는 타입이 다르면 값을 몰래 바꾼 뒤 비교해서 `0 == ''`이 `true`가 되는 등 예상하기 어려운 결과를 냅니다. `===`는 값과 타입이 모두 같을 때만 `true`라 결과가 명확합니다.
:::

**Q4.** `0 || 10`과 `0 ?? 10`의 결과는 각각 무엇인가요?

::: details 정답 보기
`10`과 `0`입니다. `||`는 falsy인 `0`을 건너뛰고, `??`는 `null`·`undefined`일 때만 오른쪽을 쓰므로 `0`을 그대로 둡니다.
:::

**Q5.** `let n = 3; const m = n++;` 실행 후 `m`과 `n`의 값은?

::: details 정답 보기
`m`은 `3`, `n`은 `4`입니다. 뒤에 붙인 `++`는 현재 값을 먼저 돌려준 뒤 증가합니다.
:::

## 정리

- 연산자는 값을 받아 새 값을 만드는 기호이고, 계산하면 값이 되는 코드 조각이 표현식입니다.
- `/`는 소수까지 계산하고, `%`는 나머지, `**`는 거듭제곱입니다. 몫만 필요하면 `Math.floor`.
- `+`는 한쪽이 문자열이면 이어 붙입니다. 입력값은 `Number()`로 바꿔서 계산합니다.
- 비교는 **항상 `===`/`!==`**. `==`는 몰래 타입을 바꿔서 위험합니다.
- `&&`·`||`는 단락 평가를 하고, 결정을 내린 쪽의 값을 돌려줍니다.
- 기본값은 **`??`**(null·undefined일 때만)를 우선 쓰고, `0`·`''`도 바꾸려 할 때만 `||`를 씁니다. `?.`는 없을 수도 있는 값에서 안전하게 멈춥니다.
- `++`는 단독으로 쓰고, 계산 순서가 헷갈리면 **괄호**를 칩니다.

## 다음 단계

[조건문: if · switch · 삼항 연산자](./04-conditionals) — 이번에 만든 `true`/`false` 값으로 "회원 등급에 따라 할인율을 다르게", "영업시간인지 판별"처럼 상황에 따라 다르게 동작하는 프로그램을 만듭니다.
