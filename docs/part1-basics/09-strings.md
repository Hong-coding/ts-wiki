---
title: 문자열 다루기와 템플릿 리터럴
---

# 문자열 다루기와 템플릿 리터럴

<LessonMeta level="입문" :minutes="40" prev="객체로 관련 데이터를 묶고 구조 분해·스프레드·얕은 복사를 배웠습니다." />

## 이번에 배울 것

- 문자열이 **불변**이라는 것을 알고, 문자열 메서드가 **새 문자열을 돌려준다**는 점을 설명할 수 있다.
- `length`와 인덱스로 글자를 꺼내고, `trim`·`split`·`join`·`replace`·`replaceAll`·`padStart`·`slice`·`includes`·`startsWith`·`toUpperCase`를 쓸 수 있다.
- **템플릿 리터럴**로 여러 줄 문자열과 계산식이 들어간 문자열을 만들 수 있다.
- `Number`·`String`·`parseInt`로 숫자와 문자열을 바꾸고, `parseInt`의 함정을 피할 수 있다.
- `toLocaleString('ko-KR')`로 금액에 쉼표를 찍어 영수증을 출력할 수 있다.

## 먼저 알아 둘 것

- [원시 타입](./02-primitive-types) — 문자열 만드는 따옴표 세 종류, 템플릿 리터럴 맛보기, 타입 변환
- [배열과 배열 메서드](./07-arrays) — `map`, `join`과 짝을 이루는 배열
- [객체](./08-objects) — 객체 배열

## 비유로 이해하기

문자열은 **도장으로 찍은 글자**와 같습니다. 종이에 `아메리카노`라고 찍었다면, 그 글자의 한 획만 지우고 고칠 수는 없습니다. 바꾸고 싶으면 **새 종이에 다시 찍어야** 합니다.

- `'아메리카노'.replace('아메리카노', '라떼')`는 원래 종이를 고치는 게 아니라, `라떼`라고 찍힌 **새 종이**를 건네줍니다.
- 원래 종이는 그대로 남아 있습니다. 새 종이를 쓰려면 변수에 받아 둬야 합니다.

그래서 문자열 메서드를 쓸 때는 항상 "**결과를 받아서** 쓴다"를 기억하면 됩니다.

## 개념 설명

### 문자열은 불변입니다

```ts
const menuName = 'americano'
menuName.toUpperCase()
console.log(menuName) // 출력: americano  ← 그대로

const upper = menuName.toUpperCase()
console.log(upper)    // 출력: AMERICANO
```

`toUpperCase()`는 대문자로 바꾼 **새 문자열**을 돌려줄 뿐 `menuName`을 바꾸지 않습니다. 결과를 변수에 받아야 합니다. 글자 하나를 인덱스로 바꾸려 해도 TypeScript가 막습니다.

```ts
const code = 'p-001'
code[0] = 'P'
// ❌ Index signature in type 'String' only permits reading. (TS2542)
```

[배열](./07-arrays)에서는 `sort`, `push`처럼 원본을 바꾸는 메서드와 새 값을 돌려주는 메서드가 섞여 있었습니다. 문자열은 다릅니다. **문자열의 모든 메서드는 원본을 바꾸지 않고 새 값을 돌려줍니다.**

### length와 인덱스

```ts
const productCode = 'CAFE-0012'

console.log(productCode.length)                    // 출력: 9
console.log(productCode[0])                        // 출력: C
console.log(productCode[productCode.length - 1])   // 출력: 2
console.log(productCode.at(-1))                    // 출력: 2
```

배열과 똑같이 인덱스는 **0부터** 시작하고, 마지막 글자는 `length - 1` 또는 `at(-1)`입니다. 한글도 한 글자를 1로 셉니다(`'라떼'.length`는 `2`). 다만 이모지 같은 일부 특수 문자는 2로 세어지는 경우가 있어, 글자 수 제한 검사에 이모지가 들어올 수 있다면 주의가 필요합니다.

### 자주 쓰는 문자열 메서드

| 메서드 | 하는 일 | 예 | 결과 |
|---|---|---|---|
| `trim()` | 앞뒤 공백 제거 | `'  라떼 '.trim()` | `'라떼'` |
| `toUpperCase()` / `toLowerCase()` | 대문자 / 소문자로 | `'vip'.toUpperCase()` | `'VIP'` |
| `includes(글자)` | 들어 있나? | `'카페라떼'.includes('라떼')` | `true` |
| `startsWith(글자)` / `endsWith(글자)` | 그 글자로 시작 / 끝나나? | `'A-1001'.startsWith('A-')` | `true` |
| `indexOf(글자)` | 처음 나오는 위치 | `'A-1001'.indexOf('-')` | `1` |
| `slice(시작, 끝)` | 일부 잘라 복사 | `'20261026'.slice(0, 4)` | `'2026'` |
| `split(구분자)` | 잘라서 **배열**로 | `'a,b'.split(',')` | `['a', 'b']` |
| `replace(찾을것, 바꿀것)` | **처음 하나만** 바꾸기 | `'1-2-3'.replace('-', '/')` | `'1/2-3'` |
| `replaceAll(찾을것, 바꿀것)` | **전부** 바꾸기 (ES2021) | `'1-2-3'.replaceAll('-', '/')` | `'1/2/3'` |
| `padStart(길이, 채울글자)` | 앞을 채워 길이 맞추기 | `'7'.padStart(3, '0')` | `'007'` |
| `padEnd(길이, 채울글자)` | 뒤를 채워 길이 맞추기 | `'라떼'.padEnd(4, '.')` | `'라떼..'` |
| `repeat(횟수)` | 반복 | `'-'.repeat(5)` | `'-----'` |

하나씩 실무 상황으로 써 보겠습니다.

#### trim: 입력값 정리

사용자가 입력한 값에는 앞뒤에 공백이 섞여 들어오는 일이 아주 많습니다. 검색어, 쿠폰 번호, 회원 아이디는 비교하기 전에 `trim()`으로 정리하는 습관을 들이세요.

```ts
const inputCoupon: string = '  WELCOME10 ' // 사용자가 입력한 값이라고 가정
console.log(inputCoupon === 'WELCOME10')        // 출력: false
console.log(inputCoupon.trim() === 'WELCOME10') // 출력: true
```

#### toUpperCase · includes · startsWith: 비교와 검사

대소문자를 가리지 않고 비교하려면 양쪽을 같은 형태로 바꾼 뒤 비교합니다.

```ts
const inputGrade = 'vip'
console.log(inputGrade.toUpperCase() === 'VIP') // 출력: true

const orderNo = 'TO-20261026-0007'
console.log(orderNo.startsWith('TO-'))  // 출력: true   (포장 주문인가?)
console.log(orderNo.includes('1026'))   // 출력: true
console.log(orderNo.endsWith('0007'))   // 출력: true
```

#### slice: 일부 잘라내기

배열의 `slice`와 같습니다. `slice(시작, 끝)`은 시작부터 끝 **직전**까지이고, 음수는 뒤에서부터 셉니다.

```ts
const businessDate = '20261026'
const year = businessDate.slice(0, 4)
const month = businessDate.slice(4, 6)
const day = businessDate.slice(6)     // 끝을 생략하면 마지막까지
console.log(year, month, day)         // 출력: 2026 10 26

const cardNo = '1234567812345678'
console.log(cardNo.slice(-4))         // 출력: 5678
```

::: info substring과 substr
오래된 코드에서 `substring(시작, 끝)`, `substr(시작, 길이)`도 보입니다. `substring`은 `slice`와 거의 같지만 음수를 지원하지 않고, `substr`은 **사용 중단**(deprecated)된 메서드입니다. 새 코드에서는 `slice`를 쓰세요.
:::

#### split과 join: 문자열 ↔ 배열

`split`은 구분자로 잘라 **배열**을 만들고, 배열의 `join`은 반대로 배열을 하나의 문자열로 이어 붙입니다. 둘을 함께 쓰면 문자열을 배열 메서드로 가공할 수 있습니다.

```ts
const csvLine = '아메리카노,4500,2'
const parts = csvLine.split(',')
console.log(parts) // 출력: [ '아메리카노', '4500', '2' ]

const tags = ['신메뉴', '시즌한정', '디카페인']
console.log(tags.join(' / ')) // 출력: 신메뉴 / 시즌한정 / 디카페인

// 쉼표로 구분된 입력을 정리: 자르고 → 공백 제거 → 빈 값 제외
const rawInput = ' 라떼 , 모카,, 녹차 '
const menus = rawInput
  .split(',')
  .map((s) => s.trim())
  .filter((s) => s.length > 0)
console.log(menus) // 출력: [ '라떼', '모카', '녹차' ]
```

`split`으로 나온 조각은 숫자처럼 보여도 **모두 문자열**입니다(`'4500'`). 계산하려면 숫자로 바꿔야 합니다. 이 레슨 뒤쪽의 "숫자 ↔ 문자열 변환"에서 다룹니다.

#### replace와 replaceAll

`replace`는 **처음 만난 하나만** 바꿉니다. 전부 바꾸려면 `replaceAll`을 씁니다.

```ts
const phone = '010-1234-5678'
console.log(phone.replace('-', ''))    // 출력: 0101234-5678  ← 첫 번째 하이픈만
console.log(phone.replaceAll('-', '')) // 출력: 01012345678
```

`replaceAll`은 **ES2021**부터 있는 메서드라서 `tsconfig.json`의 `lib`(또는 `target`)이 `ES2021` 이상이어야 TypeScript가 압니다. 최근 프로젝트 설정이라면 대부분 해당합니다. 정규 표현식(글자 패턴을 표현하는 문법)을 쓰는 `replace(/-/g, '')`로도 같은 결과를 얻을 수 있는데, 정규 표현식은 이 레슨의 범위를 넘으므로 "오래된 코드에서 이렇게도 쓴다" 정도만 알아 두세요.

#### padStart와 padEnd: 길이 맞추기

번호를 자릿수에 맞춰 0으로 채우거나, 영수증에서 줄을 맞출 때 씁니다.

```ts
const orderSeq = 7
console.log(String(orderSeq).padStart(4, '0')) // 출력: 0007

const price = '4,500'
console.log('[' + price.padStart(8) + ']')     // 출력: [   4,500]
console.log('[' + '라떼'.padEnd(6, '.') + ']')  // 출력: [라떼....]
```

- `padStart(목표길이, 채울글자)`: 앞을 채웁니다. 채울 글자를 생략하면 공백입니다.
- 이미 목표 길이보다 길면 아무것도 하지 않습니다.
- `padStart`는 **문자열의 메서드**이므로 숫자는 먼저 `String(숫자)`로 바꿔야 합니다.

### 템플릿 리터럴

[원시 타입](./02-primitive-types)에서 맛본 **템플릿 리터럴**(template literal)은 백틱(`` ` ``)으로 감싸는 문자열입니다. 문자열을 `+`로 이어 붙이는 것보다 훨씬 읽기 좋습니다.

```ts
const menu = '카페라떼'
const quantity = 2
const price = 5000

// + 로 이어 붙이기
console.log(menu + ' ' + quantity + '잔, 합계 ' + price * quantity + '원')

// 템플릿 리터럴
console.log(`${menu} ${quantity}잔, 합계 ${price * quantity}원`)
```

```text
카페라떼 2잔, 합계 10000원
카페라떼 2잔, 합계 10000원
```

#### 표현식 넣기

백틱 문자열 안에서 달러 기호와 중괄호로 감싼 자리에는 **값이 나오는 코드라면 무엇이든**(표현식) 넣을 수 있습니다. 변수, 계산식, 함수 호출, 삼항 연산자 모두 됩니다.

```ts
const memberName = '김민지'
const point = 3250
const isVip = true

console.log(`${memberName}님 (${isVip ? 'VIP' : '일반'})`)
console.log(`적립 포인트: ${point.toLocaleString('ko-KR')}점`)
console.log(`다음 등급까지 ${Math.max(0, 5000 - point)}점 남았습니다.`)
```

```text
김민지님 (VIP)
적립 포인트: 3,250점
다음 등급까지 1750점 남았습니다.
```

다만 너무 긴 계산을 넣으면 읽기 어려워집니다. 계산은 변수에 먼저 담고, 템플릿에는 변수 이름만 넣는 편이 좋습니다.

#### 여러 줄 문자열

템플릿 리터럴은 엔터로 줄을 바꾸면 그대로 줄바꿈이 들어갑니다.

```ts
const storeName = '한빛 카페 강남점'
const orderNo = 'A-1001'

const message = `[주문 접수]
매장: ${storeName}
주문번호: ${orderNo}`

console.log(message)
```

```text
[주문 접수]
매장: 한빛 카페 강남점
주문번호: A-1001
```

::: warning 들여쓰기도 그대로 들어갑니다
템플릿 리터럴 안의 공백은 전부 문자열의 일부입니다. 코드 모양을 맞추려고 둘째 줄부터 들여 쓰면 그 공백까지 출력됩니다. 여러 줄을 만들 때는 줄 배열을 `join('\n')`으로 잇는 방법도 많이 씁니다(`\n`은 줄바꿈 문자).
:::

### 숫자 ↔ 문자열 변환

입력창, 파일, 주소창(URL)에서 들어오는 값은 거의 항상 **문자열**입니다. 계산하기 전에 숫자로 바꾸고, 출력할 때는 다시 문자열로 바꿉니다.

#### 문자열 → 숫자: Number

```ts
console.log(Number('4500'))    // 출력: 4500
console.log(Number('4500원'))  // 출력: NaN
console.log(Number('4,500'))   // 출력: NaN
console.log(Number(''))        // 출력: 0
console.log(Number('  12  '))  // 출력: 12
```

`Number`는 **전체가 숫자 모양일 때만** 성공하고(앞뒤 공백은 허용), 아니면 `NaN`(Not a Number)을 돌려줍니다. 빈 문자열이 `0`이 되는 것이 함정입니다. 입력이 비어 있는지는 따로 검사해야 합니다.

#### parseInt와 parseFloat의 함정

`parseInt`는 **앞에서부터 읽을 수 있는 데까지만** 정수로 읽습니다. 편리해 보이지만 잘못된 입력을 조용히 받아들입니다.

```ts
console.log(parseInt('15개'))    // 출력: 15
console.log(parseInt('1,500'))   // 출력: 1      ← 쉼표에서 멈춤!
console.log(parseInt('12.9'))    // 출력: 12     ← 소수점 아래 버림
console.log(parseInt('abc'))     // 출력: NaN
console.log(parseFloat('12.9'))  // 출력: 12.9
```

`parseInt('1,500')`이 `1`이 되는 것은 금액을 다루는 프로그램에서 치명적입니다. 1,500원짜리 상품이 1원으로 결제될 수 있습니다. 그래서 다음 원칙을 권합니다.

> **사용자 입력을 숫자로 바꿀 때는 `Number`를 쓰고, `Number.isNaN`으로 실패를 확인한다.**

```ts
function toAmount(input: string): number | undefined {
  const trimmed = input.trim().replaceAll(',', '')
  if (trimmed === '') {
    return undefined // 빈 입력
  }
  const amount = Number(trimmed)
  if (Number.isNaN(amount)) {
    return undefined // 숫자가 아님
  }
  return amount
}

console.log(toAmount('1,500'))  // 출력: 1500
console.log(toAmount('15개'))   // 출력: undefined
console.log(toAmount('   '))    // 출력: undefined
```

반환 타입 `number | undefined`는 "숫자이거나, 변환에 실패하면 `undefined`"라는 뜻입니다. 실패를 `undefined` 대신 **오류**로 알리는 방법은 [오류 처리](./11-errors)에서 배웁니다.

::: tip parseInt를 쓸 때는 진법을 적으세요
`parseInt`를 꼭 써야 한다면 `parseInt('08', 10)`처럼 두 번째 인자로 **10진법**을 명시하는 것이 안전한 관례입니다.
:::

#### 숫자 → 문자열: String과 toFixed

```ts
const price = 4500
console.log(String(price))        // 출력: 4500
console.log(price.toString())     // 출력: 4500
console.log(`${price}`)           // 출력: 4500

const rate = 0.1234
console.log(rate.toFixed(2))      // 출력: 0.12   (소수 둘째 자리까지, 반올림)
console.log((rate * 100).toFixed(1) + '%') // 출력: 12.3%
```

`toFixed(자릿수)`는 소수점 아래 자릿수를 맞춘 **문자열**을 돌려줍니다. 결과가 문자열이라 다시 계산에 쓰면 안 됩니다.

### 금액 포맷: toLocaleString

금액은 세 자리마다 쉼표를 찍어야 읽기 쉽습니다. 직접 만들 필요 없이 `toLocaleString`을 씁니다.

```ts
const total = 1234500

console.log(total.toLocaleString('ko-KR'))        // 출력: 1,234,500
console.log(`${total.toLocaleString('ko-KR')}원`) // 출력: 1,234,500원
console.log(
  total.toLocaleString('ko-KR', { style: 'currency', currency: 'KRW' }),
) // 출력: ₩1,234,500
```

- `'ko-KR'`은 **로케일**(locale, 언어와 지역 설정)입니다. 한국어·대한민국 형식으로 숫자를 표시하라는 뜻입니다.
- 로케일을 생략하면 프로그램이 실행되는 컴퓨터의 설정을 따르므로, 서버마다 결과가 달라질 수 있습니다. **항상 명시**하세요.
- 같은 형식으로 여러 번 포맷할 때는 `new Intl.NumberFormat('ko-KR')`을 한 번 만들어 두고 `.format(숫자)`로 쓰면 더 빠릅니다.

```ts
const won = new Intl.NumberFormat('ko-KR')
console.log(won.format(4500))   // 출력: 4,500
console.log(won.format(120000)) // 출력: 120,000
```

### 실습: 영수증 출력하기

지금까지 배운 것을 모아 영수증을 만들어 보겠습니다.

```ts
const storeName = '한빛 카페 강남점'
const orderNo = 7
const items = [
  { name: '아메리카노', price: 4500, quantity: 2 },
  { name: '카페라떼', price: 5000, quantity: 1 },
  { name: '치즈케이크', price: 6500, quantity: 1 },
]

const won = (amount: number) => amount.toLocaleString('ko-KR')
const line = '-'.repeat(32)

const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
const vat = Math.round(total / 11) // 부가세 포함 금액에서 부가세 = 합계 ÷ 11

const itemLines = items.map((item) => {
  const name = item.name.padEnd(8)
  const qty = `x${item.quantity}`.padStart(4)
  const amount = won(item.price * item.quantity).padStart(10)
  return `${name}${qty}${amount}`
})

const receipt = [
  storeName,
  `주문번호: ${String(orderNo).padStart(4, '0')}`,
  line,
  ...itemLines,
  line,
  `합계${won(total).padStart(20)}원`,
  `(부가세 ${won(vat)}원 포함)`,
].join('\n')

console.log(receipt)
```

실행 결과:

```text
한빛 카페 강남점
주문번호: 0007
--------------------------------
아메리카노     x2     9,000
카페라떼      x1     5,000
치즈케이크     x1     6,500
--------------------------------
합계              20,500원
(부가세 1,864원 포함)
```

코드를 한 줄씩 살펴보면 이번 레슨과 앞 레슨의 내용이 모두 들어 있습니다.

- `won`: 금액 포맷을 함수 하나로 묶어 중복을 없앴습니다([함수 기초](./06-functions)).
- `reduce`로 합계, `map`으로 줄 만들기([배열](./07-arrays)).
- `padEnd`·`padStart`로 칸 맞추기, `repeat`으로 구분선 만들기.
- 줄 배열을 `join('\n')`으로 이어 여러 줄 문자열 완성. `...itemLines`는 배열 스프레드로 상품 줄들을 중간에 펼쳐 넣은 것입니다.

::: info 한글은 화면에서 두 칸을 차지합니다
`padEnd(8)`은 **글자 수**로 길이를 맞춥니다. 그런데 터미널이나 영수증 프린터에서 한글은 영문·숫자보다 **두 배 넓게** 표시되는 경우가 많아, 위 결과처럼 상품명 길이에 따라 줄이 조금씩 어긋날 수 있습니다. 실제 영수증 프린터 출력은 "한글 2칸, 영문·숫자 1칸"으로 폭을 계산하는 별도 함수를 만들어 씁니다. 연습 문제 6에서 도전해 봅니다.
:::

## 자주 하는 실수

### 실수 1. 메서드 결과를 받지 않기

```ts
let couponCode = '  welcome10 '
couponCode.trim()
couponCode.toUpperCase()
console.log(`[${couponCode}]`) // 출력: [  welcome10 ]
```

**왜 틀렸나**: 문자열은 불변이라 메서드는 새 문자열을 돌려줄 뿐입니다. 돌려받은 값을 버렸으므로 아무것도 바뀌지 않았습니다.

**고친 코드**:

```ts
const couponCode = '  welcome10 '.trim().toUpperCase()
console.log(`[${couponCode}]`) // 출력: [WELCOME10]
```

### 실수 2. replace로 전부 바뀐다고 생각하기

```ts
const businessNo = '123-45-67890'
console.log(businessNo.replace('-', '')) // 출력: 12345-67890
```

**왜 틀렸나**: `replace`에 문자열을 넘기면 **처음 하나만** 바꿉니다.

**고친 코드**:

```ts
const businessNo = '123-45-67890'
console.log(businessNo.replaceAll('-', '')) // 출력: 1234567890
```

### 실수 3. 쉼표 있는 금액을 parseInt로 읽기

```ts
const input = '12,000'
const amount = parseInt(input)
console.log(amount * 2) // 출력: 24
```

**왜 틀렸나**: `parseInt`는 쉼표에서 읽기를 멈춰 `12`만 돌려줍니다. 오류도 나지 않아서 발견하기 어렵습니다.

**고친 코드**: 쉼표를 지우고 `Number`로 바꾼 뒤 실패 여부를 확인합니다.

```ts
const input = '12,000'
const amount = Number(input.replaceAll(',', ''))
if (Number.isNaN(amount)) {
  console.log('금액 형식이 잘못되었습니다.')
} else {
  console.log(amount * 2) // 출력: 24000
}
```

### 실수 4. 문자열 숫자를 그대로 더하기

```ts
const parts = '아메리카노,4500,2'.split(',')
const subtotal = parts[1] * parts[2]
// ❌ The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type. (TS2362)
// ❌ The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type. (TS2363)
```

**왜 틀렸나**: `split` 결과는 모두 문자열입니다. TypeScript는 문자열끼리 곱하는 것을 막습니다. (`+`라면 막지 않고 `'45002'`처럼 이어 붙여 버리니 더 위험합니다.)

**고친 코드**:

```ts
const parts = '아메리카노,4500,2'.split(',')
const subtotal = Number(parts[1]) * Number(parts[2])
console.log(subtotal) // 출력: 9000
```

### 실수 5. 큰따옴표·작은따옴표 안에서 변수 넣기를 시도하기

```ts
const memberName = '김민지'
console.log('${memberName}님 환영합니다') // 출력: ${memberName}님 환영합니다
```

**왜 틀렸나**: 변수를 끼워 넣는 문법은 **백틱** 문자열에서만 동작합니다. 작은따옴표 안에서는 글자 그대로 출력됩니다.

**고친 코드**:

```ts
const memberName = '김민지'
console.log(`${memberName}님 환영합니다`) // 출력: 김민지님 환영합니다
```

## 직접 해 보기

### 문제 1. 회원 아이디 정리 ⭐

사용자가 입력한 아이디 `'  Kim.MinJi  '`를 앞뒤 공백을 지우고 모두 소문자로 바꿔 출력하세요.

::: details 정답 보기
```ts
const rawId = '  Kim.MinJi  '
const memberId = rawId.trim().toLowerCase()
console.log(memberId) // 출력: kim.minji
```

메서드가 새 문자열을 돌려주므로 이어서 호출(체이닝)할 수 있습니다.
:::

### 문제 2. 카드번호 마스킹 ⭐

카드번호 `'1234567812345678'`을 마지막 4자리만 남기고 앞을 `*`로 채워 `'************5678'`로 출력하세요.

::: details 정답 보기
```ts
const cardNo = '1234567812345678'
const masked = cardNo.slice(-4).padStart(cardNo.length, '*')
console.log(masked) // 출력: ************5678
```

마지막 4자리를 잘라 낸 뒤, 원래 길이가 될 때까지 앞을 `*`로 채웁니다. 카드번호·전화번호 같은 개인정보는 화면과 로그에 그대로 노출하지 않는 것이 원칙입니다.
:::

### 문제 3. 주문번호 만들기 ⭐⭐

영업일 `'2026-10-26'`과 순번 `37`로 `'ORD-20261026-0037'` 형식의 주문번호를 만드는 함수 `makeOrderNo(date: string, seq: number)`를 작성하세요.

::: details 정답 보기
```ts
function makeOrderNo(date: string, seq: number): string {
  const ymd = date.replaceAll('-', '')
  const seqText = String(seq).padStart(4, '0')
  return `ORD-${ymd}-${seqText}`
}

console.log(makeOrderNo('2026-10-26', 37)) // 출력: ORD-20261026-0037
```
:::

### 문제 4. 할인 안내 문구 ⭐⭐

상품명, 정가, 할인율을 받아 다음 형식의 문구를 돌려주는 함수를 만드세요. 금액은 쉼표를 찍고, 할인 금액은 원 단위로 내림(`Math.floor`)합니다.

```text
치즈케이크 6,500원 → 5,525원 (15% 할인)
```

::: details 정답 보기
```ts
function saleMessage(name: string, price: number, rate: number): string {
  const salePrice = Math.floor(price * (1 - rate))
  const won = (n: number) => n.toLocaleString('ko-KR')
  return `${name} ${won(price)}원 → ${won(salePrice)}원 (${rate * 100}% 할인)`
}

console.log(saleMessage('치즈케이크', 6500, 0.15))
// 출력: 치즈케이크 6,500원 → 5,525원 (15% 할인)
```
:::

### 문제 5. 장바구니 문자열 해석 ⭐⭐

POS에서 넘어온 문자열 `'생수:900:6|컵라면:1300:4|우유:1700:2'`를 해석해 합계 금액을 `'합계 14,000원'` 형식으로 출력하세요. 상품은 `|`로, 항목은 `:`로 구분됩니다.

::: details 정답 보기
```ts
const raw = '생수:900:6|컵라면:1300:4|우유:1700:2'

const total = raw
  .split('|')
  .map((entry) => entry.split(':'))
  .reduce((sum, [, price, quantity]) => sum + Number(price) * Number(quantity), 0)

console.log(`합계 ${total.toLocaleString('ko-KR')}원`) // 출력: 합계 14,000원
```

`[, price, quantity]`는 배열 구조 분해로 첫 요소(상품명)를 건너뛰고 가격과 수량만 꺼냅니다. `split` 결과는 문자열이므로 `Number`로 바꿔 계산합니다.
:::

### 문제 6. 한글 폭을 고려한 칸 맞추기 ⭐⭐⭐

한글은 2칸, 그 외 글자는 1칸으로 계산해 목표 폭까지 뒤를 공백으로 채우는 함수 `padEndWide(text: string, width: number)`를 만드세요. 한글 여부는 `/[가-힣]/.test(글자)`로 검사할 수 있습니다(정규 표현식 맛보기). `padEndWide('라떼', 10)`의 결과를 `[ ]`로 감싸 출력하세요.

::: details 정답 보기
```ts
function padEndWide(text: string, width: number): string {
  let currentWidth = 0
  for (const char of text) {
    currentWidth += /[가-힣]/.test(char) ? 2 : 1
  }
  const spaces = Math.max(0, width - currentWidth)
  return text + ' '.repeat(spaces)
}

console.log(`[${padEndWide('라떼', 10)}]`)    // 출력: [라떼      ]
console.log(`[${padEndWide('Latte', 10)}]`)   // 출력: [Latte     ]
```

`'라떼'`는 4칸이므로 공백 6개, `'Latte'`는 5칸이므로 공백 5개가 붙어, 터미널에서 같은 폭으로 보입니다. `for...of`로 문자열을 돌면 글자 하나씩 꺼낼 수 있습니다.
:::

## 확인 퀴즈

**Q1.** `const s = 'abc'; s.toUpperCase(); console.log(s)`의 출력은 무엇이고, 그 이유는?

::: details 정답 보기
`abc`입니다. 문자열은 불변이라 `toUpperCase()`는 새 문자열을 돌려줄 뿐 `s`를 바꾸지 않습니다. 결과를 변수에 받지 않았으므로 버려졌습니다.
:::

**Q2.** `'a-b-c'.replace('-', '+')`와 `'a-b-c'.replaceAll('-', '+')`의 결과는?

::: details 정답 보기
`'a+b-c'`와 `'a+b+c'`입니다. `replace`는 처음 하나만, `replaceAll`은 전부 바꿉니다.
:::

**Q3.** `parseInt('3,000')`과 `Number('3,000')`의 결과는 각각 무엇인가요? 어느 쪽이 더 안전한가요?

::: details 정답 보기
`3`과 `NaN`입니다. `Number`가 더 안전합니다. 실패를 `NaN`으로 분명히 알려 주므로 검사할 수 있지만, `parseInt`는 틀린 값을 조용히 돌려줍니다.
:::

**Q4.** `(1500000).toLocaleString('ko-KR')`의 결과는?

::: details 정답 보기
`'1,500,000'`입니다.
:::

**Q5.** 템플릿 리터럴로 여러 줄 문자열을 만들 때 코드 들여쓰기를 주의해야 하는 이유는?

::: details 정답 보기
템플릿 리터럴 안의 공백과 들여쓰기가 모두 문자열의 일부로 들어가 그대로 출력되기 때문입니다.
:::

## 정리

- 문자열은 **불변**입니다. 모든 문자열 메서드는 새 문자열을 돌려주므로 결과를 받아서 씁니다.
- 인덱스는 0부터, 마지막 글자는 `at(-1)`. 입력값은 `trim()`으로 정리한 뒤 비교합니다.
- `split`으로 배열로 바꾸고, 배열 메서드로 가공한 뒤 `join`으로 다시 잇는 흐름을 자주 씁니다.
- `replace`는 처음 하나만, `replaceAll`(ES2021)은 전부 바꿉니다. `padStart`로 자릿수를 맞춥니다.
- 템플릿 리터럴(백틱)로 표현식과 여러 줄을 넣습니다.
- 입력을 숫자로 바꿀 때는 `Number` + `Number.isNaN` 검사. `parseInt`는 `'1,500'`을 `1`로 읽는 함정이 있습니다.
- 금액은 `toLocaleString('ko-KR')`으로 쉼표를 찍고, 로케일은 항상 명시합니다.

## 다음 단계

[스코프와 클로저](./10-scope-closure) — 변수가 어디에서 보이고 어디에서 안 보이는지(스코프), 그리고 함수가 자기가 태어난 곳의 변수를 기억하는 원리(클로저)를 배웁니다. 주문번호 생성기를 클로저로 만들어 봅니다.
