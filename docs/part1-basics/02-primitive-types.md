---
title: '원시 타입: number · string · boolean · null · undefined'
---

# 원시 타입: number · string · boolean · null · undefined

<LessonMeta level="입문" :minutes="40" prev="let·const로 변수를 만들고 값을 넣고 바꾸는 법을 배웠습니다." />

## 이번에 배울 것

- **원시 타입**(primitive type) 다섯 가지(`number`, `string`, `boolean`, `null`, `undefined`)를 구분할 수 있다.
- `0.1 + 0.2`가 `0.3`이 아닌 이유를 설명하고, 금액 계산에서 피하는 방법을 쓸 수 있다.
- `NaN`이 무엇이고 어떻게 검사하는지 알 수 있다.
- 문자열을 만드는 따옴표 세 종류의 차이를 알 수 있다.
- `null`과 `undefined`의 차이를 설명하고, `typeof`로 값의 종류를 확인할 수 있다.

## 먼저 알아 둘 것

- [값과 변수: let · const](./01-values-and-variables) — 변수 선언, 타입 추론 맛보기

## 비유로 이해하기

택배 창고에 물건이 들어오면 먼저 **분류**부터 합니다. 냉장 식품은 냉장고로, 서류는 서류함으로, 깨지기 쉬운 물건은 완충재가 있는 선반으로 보냅니다. 물건의 종류에 따라 **다루는 방법이 다르기** 때문입니다.

프로그램의 값도 마찬가지입니다.

- 숫자는 더하고 곱할 수 있습니다.
- 글자는 이어 붙이거나 일부를 잘라낼 수 있습니다.
- 참/거짓은 "할지 말지" 결정에 씁니다.

값의 종류를 **타입**(type)이라고 합니다. 그중 더 이상 쪼갤 수 없는 가장 기본 재료를 **원시 타입**(primitive type)이라고 부릅니다. 레고로 치면 가장 작은 기본 블록입니다. 나중에 배울 배열과 객체는 이 기본 블록을 조립해 만든 큰 구조물입니다.

| 타입 | 무엇을 담나 | 예 |
|---|---|---|
| `number` | 숫자 (정수·소수 모두) | `1500`, `-3`, `0.5` |
| `string` | 글자, 문장 | `'아메리카노'`, `"A-1001"` |
| `boolean` | 참 또는 거짓 | `true`, `false` |
| `undefined` | "아직 값이 정해지지 않음" | `undefined` |
| `null` | "값이 없음을 일부러 표시함" | `null` |

::: info 원시 타입은 사실 7개
JavaScript에는 `bigint`(아주 큰 정수)와 `symbol`(고유한 식별자)도 원시 타입으로 있습니다. 실무에서 자주 쓰지 않으므로 이 레슨에서는 이름만 소개합니다.
:::

## 개념 설명

### number: 숫자

JavaScript에는 숫자 타입이 `number` **하나뿐**입니다. 정수(`10`)와 소수(`3.14`)를 따로 구분하지 않습니다.

```ts
const price = 4500       // 정수
const taxRate = 0.1      // 소수
const temperature = -3   // 음수
const bigAmount = 1_000_000 // 밑줄은 읽기 편하라고 넣는 구분자 (값은 1000000)

console.log(price, taxRate, temperature, bigAmount)
// 출력: 4500 0.1 -3 1000000
```

`1_000_000`처럼 숫자 사이에 밑줄 `_`을 넣으면 사람이 읽기 쉬워집니다. 값에는 영향이 없습니다. (ES2021부터 지원하는 문법이며, TypeScript는 오래된 환경용으로 변환할 때도 처리해 줍니다.)

#### 소수 계산의 함정: 0.1 + 0.2

다음 코드의 결과를 예상해 보세요.

```ts
console.log(0.1 + 0.2)
console.log(0.1 + 0.2 === 0.3)
```

실행 결과:

```text
0.30000000000000004
false
```

`0.3`이 아니라 `0.30000000000000004`가 나옵니다. 버그가 아니라 컴퓨터가 숫자를 저장하는 방식 때문입니다.

컴퓨터는 숫자를 0과 1(**2진수**)로 저장합니다. 우리가 10진수로 `1 ÷ 3 = 0.3333...`을 끝없이 적어야 하듯, 2진수로는 `0.1`을 정확히 적을 수 없어 끝없이 이어지는 값을 중간에서 잘라 **근삿값**으로 저장합니다. 이런 숫자 저장 방식을 **부동소수점**(floating point)이라고 하며, JavaScript뿐 아니라 Java, Python, C 등 대부분의 언어가 같은 결과를 냅니다.

```ts
console.log(1.1 * 3)    // 출력: 3.3000000000000003
console.log(0.7 + 0.1)  // 출력: 0.7999999999999999
```

#### 금액은 정수로 계산합니다

쇼핑몰이나 POS에서 금액이 1원이라도 틀리면 큰 문제가 됩니다. 실무에서는 다음 방법을 씁니다.

1. **원 단위 정수로만 계산합니다.** 한국 원화는 소수점이 없으므로 대부분 정수 계산으로 충분합니다.
2. **비율을 곱한 뒤에는 반드시 반올림·버림을 합니다.** `Math.round`(반올림), `Math.floor`(버림), `Math.ceil`(올림)을 씁니다.

```ts
const price = 12900
const discountRate = 0.15 // 15% 할인

const rawDiscount = price * discountRate
console.log(rawDiscount)               // 출력: 1935

const point = 33333 * 0.015            // 적립률 1.5%
console.log(point)                     // 출력: 499.995
console.log(Math.floor(point))         // 출력: 499  (포인트는 보통 버림)
console.log(Math.round(point))         // 출력: 500  (반올림)
```

화면에 소수점 자리를 맞춰 보여 줄 때는 `toFixed(자릿수)`를 씁니다. 결과는 **문자열**이라는 점에 주의합니다.

```ts
const result = 0.1 + 0.2
console.log(result.toFixed(2))  // 출력: 0.30
```

::: warning 반올림 규칙은 업무마다 다릅니다
부가세, 할인, 포인트를 반올림할지 버림할지는 회사·업무 규칙으로 정해져 있습니다. 코드로 짜기 전에 반드시 규칙을 확인하세요. 소수점 이하까지 정확해야 하는 금융 계산은 전용 라이브러리를 쓰기도 합니다.
:::

#### 안전한 정수의 한계

`number`로 정확히 표현할 수 있는 정수에는 한계가 있습니다.

```ts
console.log(Number.MAX_SAFE_INTEGER)  // 출력: 9007199254740991
```

약 9천조입니다. 일반적인 금액·수량에는 충분하지만, 이보다 큰 정수(예: 아주 긴 주문 번호)는 정확도가 깨집니다. 그래서 긴 번호(주문 번호, 카드 승인 번호, 전화번호)는 숫자가 아니라 **문자열**로 다루는 것이 원칙입니다. 계산할 일이 없는 "번호"는 문자열이라고 기억하세요.

#### NaN: 숫자가 아닌 숫자

숫자로 계산할 수 없는 연산을 하면 `NaN`(Not a Number, "숫자가 아님")이라는 특별한 값이 나옵니다.

```ts
console.log(Number('천원'))  // 출력: NaN   (글자를 숫자로 바꿀 수 없음)
console.log(0 / 0)           // 출력: NaN
console.log(Math.sqrt(-1))   // 출력: NaN   (음수의 제곱근)
```

`Number(...)`는 괄호 안의 값을 숫자로 바꿔 주는 기능입니다. `'천원'`은 숫자로 바꿀 수 없으므로 `NaN`이 됩니다.

`NaN`에는 이상한 성질이 있습니다.

```ts
console.log(typeof NaN)            // 출력: number   ← 타입은 number!
console.log(NaN === NaN)           // 출력: false    ← 자기 자신과도 다름!
console.log(Number.isNaN(NaN))     // 출력: true     ← 검사는 이렇게
console.log(Number.isNaN(Number('천원'))) // 출력: true
```

- `NaN`은 이름과 달리 `number` 타입입니다. 그래서 TypeScript도 막지 못합니다.
- `NaN`은 어떤 값과 비교해도 같지 않습니다. 자기 자신과도요. 그래서 `=== NaN`으로는 검사할 수 없고 **`Number.isNaN(값)`**을 씁니다.
- `NaN`이 계산에 한 번 섞이면 그 뒤의 결과도 전부 `NaN`이 됩니다. 장바구니 합계가 갑자기 `NaN`으로 보인다면, 어딘가에서 숫자가 아닌 값이 섞여 들어온 것입니다.

```ts
const quantityInput = '세 개'         // 사용자가 잘못 입력한 값
const quantity = Number(quantityInput)
const total = 3000 * quantity + 2500
console.log(total)                    // 출력: NaN
```

#### Infinity

0이 아닌 수를 0으로 나누면 `Infinity`(무한대)가 나옵니다. 다른 언어처럼 프로그램이 멈추지 않으니 주의합니다.

```ts
console.log(10 / 0)   // 출력: Infinity
console.log(-10 / 0)  // 출력: -Infinity
```

### string: 문자열

**문자열**(string)은 글자들을 줄줄이 이어 놓은 값입니다. 따옴표로 감싸서 만들며, 따옴표는 세 종류가 있습니다.

```ts
const menu1 = '아메리카노'     // 작은따옴표
const menu2 = "카페라떼"       // 큰따옴표
const menu3 = `바닐라라떼`     // 백틱(backtick, 키보드 숫자 1 왼쪽의 ` 키)

console.log(menu1, menu2, menu3)
// 출력: 아메리카노 카페라떼 바닐라라떼
```

#### 작은따옴표와 큰따옴표

두 가지는 **완전히 같습니다.** 팀에서 하나로 정해 통일하며, 이 위키는 작은따옴표 `'`를 씁니다. 다만 문자열 안에 따옴표 자체가 들어갈 때는 다른 종류로 감싸면 편합니다.

```ts
const notice1 = "오늘의 메뉴는 '김치찌개'입니다"
const notice2 = '그는 "감사합니다"라고 말했다'
console.log(notice1)
console.log(notice2)
```

```text
오늘의 메뉴는 '김치찌개'입니다
그는 "감사합니다"라고 말했다
```

#### 이스케이프 문자: 역슬래시 \

같은 종류의 따옴표를 안에 넣거나, 줄바꿈처럼 키보드로 바로 쓸 수 없는 글자를 넣을 때는 역슬래시 `\`를 앞에 붙입니다. 이것을 **이스케이프**(escape)라고 합니다.

| 쓰는 법 | 뜻 |
|---|---|
| `\'` | 작은따옴표 |
| `\"` | 큰따옴표 |
| `\n` | 줄바꿈 (new line) |
| `\t` | 탭 |
| `\\` | 역슬래시 자체 |

```ts
const message = '오늘은 \'신메뉴\' 출시일!\n방문해 주세요.'
console.log(message)
```

```text
오늘은 '신메뉴' 출시일!
방문해 주세요.
```

::: info 한국어 키보드에서 역슬래시
한국어 키보드에서는 역슬래시 `\`가 원화 기호 `₩`로 보이는 경우가 많습니다. 같은 키이므로 그대로 누르면 됩니다.
:::

#### 백틱: 템플릿 리터럴

백틱으로 만든 문자열을 **템플릿 리터럴**(template literal)이라고 합니다. 두 가지 특별한 기능이 있습니다.

1. `${ }` 안에 변수나 계산식을 넣으면 그 값이 문자열에 끼워집니다.
2. 엔터로 줄을 바꾸면 그대로 줄바꿈이 됩니다.

```ts
const menu = '카페라떼'
const price = 5000
const quantity = 2

console.log(`${menu} ${quantity}잔, 합계 ${price * quantity}원`)
// 출력: 카페라떼 2잔, 합계 10000원

const receipt = `[영수증]
메뉴: ${menu}
수량: ${quantity}`
console.log(receipt)
```

```text
[영수증]
메뉴: 카페라떼
수량: 2
```

변수와 글자를 섞어 쓸 때는 템플릿 리터럴이 가장 읽기 좋습니다. 자세한 활용은 [문자열 다루기](./09-strings)에서 배웁니다.

#### 문자열 길이와 글자 꺼내기

```ts
const productCode = 'P-2024'
console.log(productCode.length)  // 출력: 6   (글자 수)
console.log(productCode[0])      // 출력: P   (첫 번째 글자)
console.log(productCode[2])      // 출력: 2
```

- `.length`는 글자 수입니다. 공백과 기호도 한 글자로 셉니다.
- `[번호]`로 글자 하나를 꺼냅니다. 번호는 **0부터** 셉니다. 이 번호를 **인덱스**(index)라고 하며, [배열](./07-arrays)에서도 똑같이 씁니다.

#### 문자열과 숫자는 다릅니다

`'100'`(문자열)과 `100`(숫자)은 다른 값입니다. 화면 입력란에서 받은 값은 보통 문자열이므로, 계산하려면 숫자로 바꿔야 합니다.

```ts
const input = '3'                 // 입력란에서 받은 값은 문자열
console.log(input + 1)            // 출력: 31   ← 숫자 덧셈이 아니라 이어 붙이기!
console.log(Number(input) + 1)    // 출력: 4    ← 숫자로 바꾼 뒤 더하기
```

`+`는 한쪽이 문자열이면 **이어 붙이기**를 합니다. 이 함정은 [연산자](./03-operators)에서 다시 봅니다.

### boolean: 참과 거짓

**불리언**(boolean)은 `true`(참)와 `false`(거짓) 두 값만 가집니다. 수학자 조지 불(George Boole)의 이름에서 왔습니다. "예/아니오"로 답할 수 있는 정보를 담습니다.

```ts
const isMember = true
const hasCoupon = false
const isSoldOut = 0 > 5   // 비교 결과는 boolean

console.log(isMember, hasCoupon, isSoldOut)
// 출력: true false false
```

불리언은 [조건문](./04-conditionals)에서 "이 코드를 실행할지 말지"를 정할 때 핵심 역할을 합니다.

::: warning 'true'와 true는 다릅니다
`'true'`는 글자 네 개짜리 **문자열**이고, `true`는 **불리언**입니다. 따옴표가 있으면 문자열입니다.
:::

### undefined: 아직 값이 없음

`undefined`는 "값이 아직 정해지지 않았다"는 뜻입니다. 주로 **JavaScript가 자동으로** 넣는 값입니다.

```ts
let couponCode: string | undefined
console.log(couponCode)  // 출력: undefined   (선언만 하고 값을 안 넣음)
```

`string | undefined`는 "문자열이거나 undefined"라는 뜻의 타입입니다. 세로 막대 `|`는 "또는"이라는 의미이며 [유니온 타입](../part2-types/06-union-literal)에서 배웁니다. 지금은 "값이 없을 수도 있는 변수는 이렇게 적는다" 정도로 봐 두세요.

`undefined`를 만나는 대표적인 경우는 다음과 같습니다.

- 변수를 선언만 하고 값을 넣지 않았을 때
- 객체에 없는 속성을 꺼낼 때 ([객체](./08-objects)에서 배움)
- 함수가 아무것도 돌려주지 않을 때 ([함수](./06-functions)에서 배움)

### null: 일부러 비워 둠

`null`은 "값이 **없다는 것을 일부러** 표시한다"는 뜻입니다. JavaScript가 자동으로 넣는 일은 거의 없고, **개발자가 직접** 넣습니다.

```ts
let selectedTable: number | null = null   // 아직 테이블을 고르지 않음
console.log(selectedTable)  // 출력: null

selectedTable = 7                          // 7번 테이블 선택
console.log(selectedTable)  // 출력: 7

selectedTable = null                       // 선택 취소
console.log(selectedTable)  // 출력: null
```

### null과 undefined의 차이

둘 다 "값이 없음"을 나타내지만 의도가 다릅니다.

| | `undefined` | `null` |
|---|---|---|
| 뜻 | 아직 정해지지 않음 | 비어 있음을 일부러 표시 |
| 누가 넣나 | 주로 JavaScript가 자동으로 | 주로 개발자가 직접 |
| 비유 | 아직 아무것도 적지 않은 빈칸 | "해당 없음"이라고 적어 둔 칸 |
| `typeof` 결과 | `'undefined'` | `'object'` (역사적 실수) |

회원 가입 양식으로 생각하면 이해하기 쉽습니다.

- 사용자가 아직 "추천인" 칸을 보지도 않았다 → `undefined`
- 사용자가 "추천인 없음"을 직접 골랐다 → `null`

::: tip 실무에서는
팀마다 규칙이 조금씩 다릅니다. 많이 쓰는 방식은 "직접 비울 때는 `null`, 나머지는 자연스럽게 생기는 `undefined`를 그대로 둔다"입니다. 중요한 것은 **두 값 모두 "값이 없을 수 있다"는 신호**라는 점이며, 이런 값을 안전하게 다루는 방법(`??`, `?.`)은 [연산자](./03-operators)에서 배웁니다.
:::

### TypeScript는 null·undefined를 엄격하게 다룹니다

TypeScript의 `strict` 모드(이 위키의 기본 설정)에서는 `number` 타입 변수에 `null`이나 `undefined`를 넣을 수 없습니다.

```ts
let tableNo: number = 3
tableNo = null
// ❌ Type 'null' is not assignable to type 'number'. (TS2322)
```

"값이 없을 수도 있다"면 앞에서 본 것처럼 `number | null`이라고 **미리 밝혀야** 합니다. 귀찮아 보이지만, 이 규칙 덕분에 "값이 없는데 계산하려다 프로그램이 멈추는" 아주 흔한 버그를 TypeScript가 실행 전에 막아 줍니다. 이 설정의 이름은 `strictNullChecks`이며 [strict 옵션](../part6-tooling/02-strict-options)에서 다룹니다.

### typeof: 값의 종류 확인하기

`typeof 값`은 그 값의 종류를 **문자열로** 알려 줍니다. 프로그램이 실행되는 중에 값의 종류를 확인할 때 씁니다.

```ts
console.log(typeof 4500)         // 출력: number
console.log(typeof '아메리카노')  // 출력: string
console.log(typeof true)         // 출력: boolean
console.log(typeof undefined)    // 출력: undefined
console.log(typeof null)         // 출력: object   ← 주의!
console.log(typeof NaN)          // 출력: number   ← 주의!
```

`typeof null`이 `'object'`인 것은 JavaScript 초창기의 실수가 굳어진 것입니다. 이미 너무 많은 프로그램이 이 동작에 기대고 있어서 고칠 수 없게 되었습니다. 그래서 `null`인지 확인할 때는 `typeof`가 아니라 `값 === null`로 비교합니다.

`typeof`는 TypeScript에서 특히 중요합니다. 나중에 [타입 좁히기](../part2-types/08-narrowing)에서 "이 값이 문자열이면 이렇게, 숫자면 저렇게" 처리하는 핵심 도구가 됩니다.

### 타입 변환: 다른 타입으로 바꾸기

값을 다른 타입으로 바꾸는 것을 **타입 변환**(type conversion)이라고 합니다.

```ts
// 숫자로
console.log(Number('1500'))     // 출력: 1500
console.log(Number(''))         // 출력: 0      ← 빈 문자열은 0이 됨 (주의)
console.log(Number('15,000'))   // 출력: NaN    ← 쉼표가 있으면 실패
console.log(parseInt('15개'))   // 출력: 15     ← 앞쪽 숫자만 읽음

// 문자열로
console.log(String(1500))       // 출력: 1500 (문자열)
console.log((1500).toString())  // 출력: 1500 (문자열)

// 불리언으로
console.log(Boolean(1))         // 출력: true
console.log(Boolean(0))         // 출력: false
console.log(Boolean('안녕'))     // 출력: true
console.log(Boolean(''))        // 출력: false
```

- `Number(값)`은 전체가 숫자 모양일 때만 성공합니다. 빈 문자열 `''`이 `0`이 되는 점은 입력 검사에서 자주 실수하는 부분입니다.
- `parseInt(값)`은 앞에서부터 읽을 수 있는 정수만 읽습니다. 편리하지만 `'1a2'`도 `1`로 읽어 버리므로, 엄격한 검사가 필요할 때는 `Number`를 씁니다.
- `Boolean(값)`이 `false`가 되는 값을 **falsy**, `true`가 되는 값을 **truthy**라고 부릅니다. [조건문](./04-conditionals)에서 자세히 다룹니다.

### 원시 값은 바뀌지 않는다

원시 값 자체는 수정할 수 없습니다. 이것을 **불변**(immutable)이라고 합니다. 문자열의 글자 하나를 바꾸려고 해도 바뀌지 않습니다.

```ts
const code = 'abc'
console.log(code.toUpperCase())  // 출력: ABC  ← 새 문자열을 만들어 돌려줌
console.log(code)                // 출력: abc  ← 원래 값은 그대로
```

`toUpperCase()`는 대문자로 바꾼 **새 문자열**을 돌려줄 뿐, `code`에 들어 있는 원래 문자열은 그대로입니다. "원본은 그대로, 새 값을 만든다"는 생각은 배열·객체를 다룰 때도 아주 중요합니다.

## 자주 하는 실수

### 실수 1. 소수 계산 결과를 그대로 비교하기

```ts
const total = 0.1 + 0.2
console.log(total === 0.3) // 출력: false
```

**왜 틀렸나**: 부동소수점 오차 때문에 `total`은 `0.30000000000000004`입니다.

**고친 코드**: 금액은 원 단위 정수로 계산하고, 소수가 꼭 필요하면 반올림한 뒤 비교합니다.

```ts
const total = 0.1 + 0.2
console.log(Math.round(total * 100) / 100 === 0.3) // 출력: true
```

### 실수 2. NaN을 ===로 검사하기

```ts
const quantity = Number('두 개')
console.log(quantity === NaN)
// ❌ This condition will always return 'false'. (TS2845)
```

**왜 틀렸나**: `NaN`은 자기 자신과도 같지 않으므로 이 비교는 항상 `false`입니다. TypeScript가 이를 알고 미리 경고합니다. (이 경고는 TypeScript 5.2부터 나옵니다.)

**고친 코드**:

```ts
const quantity = Number('두 개')
console.log(Number.isNaN(quantity)) // 출력: true
```

### 실수 3. 입력값(문자열)을 그대로 더하기

```ts
const priceInput = '3000'
const shippingFee = 2500
console.log(priceInput + shippingFee) // 출력: 30002500
```

**왜 틀렸나**: `priceInput`은 문자열이므로 `+`가 이어 붙이기로 동작했습니다. TypeScript도 문자열 + 숫자는 허용하므로 오류가 나지 않습니다.

**고친 코드**: 계산 전에 숫자로 바꿉니다.

```ts
const priceInput = '3000'
const shippingFee = 2500
console.log(Number(priceInput) + shippingFee) // 출력: 5500
```

### 실수 4. null을 typeof로 검사하기

```ts
const memo = null
console.log(typeof memo === 'null')
// ❌ This comparison appears to be unintentional because the types '"string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function"' and '"null"' have no overlap. (TS2367)
```

**왜 틀렸나**: `typeof`가 돌려주는 문자열 목록에 `'null'`은 없습니다. `typeof null`은 `'object'`입니다. TypeScript는 `typeof`가 돌려줄 수 있는 값을 모두 알고 있어서, "이 비교는 절대 참이 될 수 없다"고 알려 줍니다.

**고친 코드**:

```ts
const memo = null
console.log(memo === null) // 출력: true
```

### 실수 5. 번호를 숫자로 저장하기

```ts
const phoneNumber = 01012345678
// ❌ Octal literals are not allowed. Use the syntax '0o1012345678'. (TS1121)
```

**왜 틀렸나**: `0`으로 시작하는 숫자는 옛날 문법에서 8진수로 해석되어 오류가 납니다. 설령 오류가 없더라도 맨 앞의 `0`이 사라집니다. 전화번호·우편번호·주문 번호처럼 **계산하지 않는 번호**는 숫자가 아닙니다.

**고친 코드**:

```ts
const phoneNumber = '010-1234-5678'
console.log(phoneNumber) // 출력: 010-1234-5678
```

## 직접 해 보기

### 문제 1. 타입 맞히기 ⭐

다음 값들의 `typeof` 결과를 먼저 예상해 적고, 코드로 확인하세요.

```text
1) 0       2) '0'      3) false     4) 'false'
5) null    6) undefined  7) NaN     8) `${10}`
```

::: details 정답 보기
```ts
console.log(typeof 0)          // number
console.log(typeof '0')        // string
console.log(typeof false)      // boolean
console.log(typeof 'false')    // string
console.log(typeof null)       // object  (역사적 실수)
console.log(typeof undefined)  // undefined
console.log(typeof NaN)        // number
console.log(typeof `${10}`)    // string  (템플릿 리터럴은 항상 문자열)
```
:::

### 문제 2. 부가세 계산 ⭐

상품 금액 `27500`원의 부가세 10%를 계산하고, 1원 미만은 **버림**하세요. 그리고 `부가세: 2750원` 형식으로 출력하세요. 같은 방식으로 `13999`원의 부가세도 출력해 보세요.

::: details 정답 보기
```ts
const price1 = 27500
const price2 = 13999
const vatRate = 0.1

console.log(`부가세: ${Math.floor(price1 * vatRate)}원`)
console.log(`부가세: ${Math.floor(price2 * vatRate)}원`)
```

출력:

```text
부가세: 2750원
부가세: 1399원
```

`13999 * 0.1`은 `1399.9`에 가까운 값이 나오며, 버림하면 `1399`입니다.
:::

### 문제 3. 입력값 계산기 ⭐⭐

수량 입력란에서 문자열 `'4'`를, 단가 입력란에서 문자열 `'3500'`을 받았습니다. 두 값을 숫자로 바꿔 합계를 계산하고 출력하세요. 그다음 수량 입력을 `'네 개'`로 바꿔 실행해 보고, 결과가 왜 그렇게 나오는지 설명하세요.

::: details 정답 보기
```ts
const quantityInput = '4'
const priceInput = '3500'

const total = Number(quantityInput) * Number(priceInput)
console.log(total) // 출력: 14000
```

수량을 `'네 개'`로 바꾸면 `Number('네 개')`가 `NaN`이 되고, `NaN`이 섞인 계산 결과도 `NaN`이 됩니다. 실무에서는 계산 전에 `Number.isNaN`으로 검사해 "숫자를 입력해 주세요" 같은 안내를 보여 줍니다.
:::

### 문제 4. 할인 금액 ⭐⭐

`19900`원짜리 상품을 `7%` 할인합니다. 할인 금액을 **반올림**해 정수로 만들고, 결제 금액(원가 − 할인 금액)을 출력하세요.

::: details 정답 보기
```ts
const price = 19900
const discountRate = 0.07

const discount = Math.round(price * discountRate)
const payAmount = price - discount

console.log(`할인 금액: ${discount}원`)
console.log(`결제 금액: ${payAmount}원`)
```

출력:

```text
할인 금액: 1393원
결제 금액: 18507원
```

`19900 * 0.07`은 `1393`에 아주 가까운 값이고, 반올림하면 `1393`입니다. 비율을 곱한 뒤에는 바로 정수로 정리해 두면 이후 계산에서 오차가 쌓이지 않습니다.
:::

### 문제 5. null과 undefined 써 보기 ⭐⭐

배달 주문 프로그램을 만든다고 합시다. 다음 두 변수를 알맞은 타입과 초깃값으로 선언하세요.

- `deliveryMemo`: 고객이 "요청 사항 없음"을 직접 선택할 수 있는 메모 (문자열 또는 비어 있음)
- `riderName`: 아직 배달 기사가 배정되지 않은 상태 (나중에 문자열이 들어옴)

그다음 기사 `'박준호'`가 배정되었다고 값을 바꾸고 둘 다 출력하세요.

::: details 정답 보기
```ts
let deliveryMemo: string | null = null      // 고객이 "없음"을 직접 고름
let riderName: string | undefined           // 아직 정해지지 않음

riderName = '박준호'
console.log(deliveryMemo, riderName)
// 출력: null 박준호
```

`deliveryMemo`는 "없음"을 일부러 표시하므로 `null`, `riderName`은 아직 정해지지 않았으므로 `undefined`가 의도에 맞습니다. 다른 방식도 틀린 것은 아니며, 팀 규칙에 맞추면 됩니다.
:::

## 확인 퀴즈

**Q1.** JavaScript에서 정수와 소수는 서로 다른 타입인가요?

::: details 정답 보기
아닙니다. 둘 다 `number` 하나의 타입입니다.
:::

**Q2.** `0.1 + 0.2`가 정확히 `0.3`이 아닌 이유는 무엇이고, 금액 계산에서는 어떻게 피하나요?

::: details 정답 보기
컴퓨터가 소수를 2진수 근삿값(부동소수점)으로 저장하기 때문입니다. 금액은 원 단위 정수로 계산하고, 비율을 곱한 뒤에는 `Math.round`·`Math.floor` 등으로 정수로 정리합니다.
:::

**Q3.** 어떤 값이 `NaN`인지 검사하는 올바른 방법은 무엇인가요?

::: details 정답 보기
`Number.isNaN(값)`입니다. `NaN`은 자기 자신과도 같지 않아서 `=== NaN`으로는 검사할 수 없습니다.
:::

**Q4.** `typeof null`의 결과는 무엇이며, `null`인지 확인하려면 어떻게 하나요?

::: details 정답 보기
`'object'`입니다(초창기의 실수가 굳어진 것). `null`인지는 `값 === null`로 확인합니다.
:::

**Q5.** 전화번호나 주문 번호를 숫자가 아니라 문자열로 저장하는 이유는 무엇인가요?

::: details 정답 보기
계산할 일이 없고, 맨 앞의 `0`이 사라지거나 너무 긴 번호는 정확도가 깨질 수 있기 때문입니다.
:::

## 정리

- 원시 타입은 가장 기본이 되는 값의 종류이며, 자주 쓰는 것은 `number`, `string`, `boolean`, `null`, `undefined`입니다.
- `number`는 정수와 소수를 모두 담고, 소수 계산에는 부동소수점 오차가 있습니다. **금액은 정수로, 비율을 곱하면 바로 반올림·버림**합니다.
- `NaN`은 "숫자가 아님"을 뜻하는 number 값이며 `Number.isNaN`으로 검사합니다.
- 문자열은 `'`, `"`, 백틱 세 가지로 만들고, 백틱(템플릿 리터럴)은 `${ }`로 값을 끼워 넣을 수 있습니다.
- `undefined`는 "아직 정해지지 않음", `null`은 "일부러 비워 둠"입니다. TypeScript strict 모드에서는 값이 없을 수 있다면 `| null`처럼 미리 밝혀야 합니다.
- `typeof`로 값의 종류를 확인하되, `typeof null`은 `'object'`라는 함정을 기억하세요.

## 다음 단계

[연산자와 표현식](./03-operators) — 값을 계산하고 비교하는 도구를 배웁니다. 특히 `==`와 `===`의 차이, 값이 없을 때 쓰는 `??`와 `?.`가 핵심입니다.
