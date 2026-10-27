---
title: '오류 처리: throw · try/catch/finally'
---

# 오류 처리: throw · try/catch/finally

<LessonMeta level="입문" :minutes="40" prev="스코프와 클로저로 변수가 보이는 범위와 함수가 변수를 기억하는 원리를 배웠습니다." />

## 이번에 배울 것

- 처리하지 않은 오류가 나면 **프로그램이 그 자리에서 멈춘다**는 것을 설명할 수 있다.
- `Error` 객체의 `name`·`message`·`stack`을 읽고, `throw`로 오류를 직접 던질 수 있다.
- `try`/`catch`/`finally`의 **실행 순서**를 추적할 수 있다.
- `catch`의 오류 변수가 `unknown`인 이유를 알고, `instanceof Error`로 좁혀서 쓸 수 있다.
- 사용자 정의 오류 클래스를 만들고, 수량·금액 같은 입력을 검증해 오류를 알릴 수 있다.

## 먼저 알아 둘 것

- [함수 기초](./06-functions) — `return`, 호출 흐름(콜 스택)
- [객체](./08-objects) — 속성 읽기, `instanceof`를 이해하기 위한 객체 개념
- [문자열 다루기](./09-strings) — `Number`, `Number.isNaN`으로 입력 변환

## 비유로 이해하기

카페 주방에서 바리스타가 주문서를 받았는데 "라떼 **-3**잔"이라고 적혀 있습니다. 바리스타는 어떻게 해야 할까요?

1. **무시하고 그냥 만든다** → 라떼를 -3잔 만들 수는 없으니 이상한 일이 벌어집니다. (오류를 삼킴)
2. **주방 전체를 멈춘다** → 다른 손님 주문까지 모두 멈춥니다. (처리하지 않은 오류)
3. **"주문서가 잘못됐어요!" 하고 계산대로 돌려보낸다** → 계산대 직원이 손님에게 다시 확인합니다. (오류를 던지고, 받아서 처리)

3번이 올바른 방법입니다. 프로그래밍에서는

- 문제를 발견한 곳에서 "잘못됐다!"고 외치는 것이 **`throw`**(던지기),
- 그 외침을 받아서 대처하는 곳이 **`try`/`catch`**(시도하고 잡기),
- 성공하든 실패하든 마지막에 꼭 하는 일(주문서 정리)이 **`finally`** 입니다.

## 개념 설명

### 오류가 나면 프로그램이 멈춥니다

실행 중에 처리하지 못한 오류가 생기면, JavaScript는 **그 줄에서 실행을 멈추고** 아래 코드를 하나도 실행하지 않습니다.

```ts
console.log('1. 결제 시작')

const payment: { amount: number } | undefined = undefined as { amount: number } | undefined
console.log(payment!.amount) // 여기서 오류 발생

console.log('2. 영수증 출력') // 실행되지 않음
```

실행 결과(경로 등 일부 생략):

```text
1. 결제 시작
.../payment.js:3
console.log(payment.amount);
                    ^

TypeError: Cannot read properties of undefined (reading 'amount')
    at file:///.../payment.js:3:21
    ...
```

`2. 영수증 출력`은 찍히지 않았습니다. 실제 POS 프로그램이었다면 결제 화면이 그대로 멈춰 버렸을 것입니다. (예제의 `!`와 `as`는 TypeScript 검사를 일부러 끄는 문법으로, 오류를 보여 주려고 쓴 것입니다. [타입 단언](../part2-types/10-assertion)에서 배우며, 평소에는 쓰지 않습니다.)

TypeScript는 이런 오류의 상당수를 **실행 전에** 막아 줍니다. 하지만 사용자가 입력한 값, 서버에서 받은 데이터, 파일 내용처럼 **실행해 봐야 알 수 있는 문제**는 TypeScript가 미리 알 수 없습니다. 그래서 오류 처리가 필요합니다.

### Error 객체

JavaScript는 오류를 **`Error` 객체**로 표현합니다. 위에서 본 `TypeError`도 `Error`의 한 종류입니다.

```ts
const error = new Error('수량은 1 이상이어야 합니다.')

console.log(error.name)    // 출력: Error
console.log(error.message) // 출력: 수량은 1 이상이어야 합니다.
console.log(typeof error.stack) // 출력: string
```

| 속성 | 뜻 |
|---|---|
| `name` | 오류의 종류. `'Error'`, `'TypeError'`, `'RangeError'` 등 |
| `message` | 무엇이 잘못됐는지 사람이 읽을 설명 |
| `stack` | 오류가 만들어진 위치와 **콜 스택**(어떤 함수가 어떤 함수를 불렀는지) 기록. 디버깅할 때 가장 중요한 단서 |

`new Error(...)`의 **`new`** 는 "이 설계도(클래스)로 새 객체를 만들라"는 키워드입니다. 클래스는 [클래스](../part3-intermediate/08-classes)에서 자세히 배웁니다.

자주 만나는 내장 오류 종류는 다음과 같습니다.

| 종류 | 언제 |
|---|---|
| `TypeError` | 값의 종류가 맞지 않을 때 (`undefined`의 속성 읽기, 함수가 아닌 것을 호출) |
| `ReferenceError` | 없는 변수를 쓸 때, TDZ에서 접근할 때 |
| `RangeError` | 값이 허용 범위를 벗어날 때 (`(1).toFixed(200)`) |
| `SyntaxError` | 문법이 틀렸을 때 (`JSON.parse('{잘못된')`) |

::: tip stack 읽는 법
`stack`은 위에서부터 "오류가 난 곳 → 그 함수를 부른 곳 → 그걸 부른 곳" 순서입니다. **맨 위에서 내 코드 파일 이름이 처음 나오는 줄**부터 보면 원인을 빨리 찾을 수 있습니다. [에러 메시지 읽는 법](../part0-start/06-how-to-read-errors)도 함께 보세요.
:::

### throw: 오류를 직접 던지기

함수가 처리할 수 없는 입력을 받았을 때, 이상한 값을 돌려주는 대신 **`throw`로 오류를 던질** 수 있습니다.

```ts
function calculateSubtotal(price: number, quantity: number): number {
  if (quantity < 1) {
    throw new Error(`수량은 1 이상이어야 합니다. (입력값: ${quantity})`)
  }
  return price * quantity
}

console.log(calculateSubtotal(4500, 2)) // 출력: 9000
console.log(calculateSubtotal(4500, -3))
console.log('이 줄은 실행되지 않습니다')
```

실행 결과(일부 생략):

```text
9000
.../subtotal.js:3
        throw new Error(`수량은 1 이상이어야 합니다. (입력값: ${quantity})`);
        ^

Error: 수량은 1 이상이어야 합니다. (입력값: -3)
    at calculateSubtotal (file:///.../subtotal.js:3:15)
    ...
```

- `throw`를 만나면 `return`처럼 **함수가 즉시 끝납니다.** 다만 값을 돌려주는 게 아니라, 호출한 쪽으로 오류가 **거슬러 올라갑니다.**
- 아무도 이 오류를 잡지 않으면 맨 바깥까지 올라가서 프로그램이 멈춥니다.
- `message`에는 **무엇이 잘못됐고, 실제로 무슨 값이 들어왔는지**를 적어 두면 나중에 원인을 찾기 쉽습니다.

왜 `-3`을 받았을 때 그냥 `0`을 돌려주지 않을까요? `0`을 돌려주면 장바구니에 0원짜리 항목이 생기고, 아무도 문제를 모른 채 결제가 진행됩니다. **잘못된 상태로 계속 진행하는 것보다, 일찍 크게 실패하는 편이 낫습니다.** 이를 **빠른 실패**(fail fast) 원칙이라고 합니다.

::: warning 문자열을 던지지 마세요
`throw '수량 오류'`처럼 문자열도 던질 수는 있습니다. 하지만 문자열에는 `stack`이 없어서 어디서 났는지 추적할 수 없습니다. **항상 `new Error(...)`(또는 그 하위 클래스)를 던지세요.**
:::

### try / catch: 오류를 잡아서 처리하기

오류가 날 수 있는 코드를 `try` 블록으로 감싸면, 오류가 났을 때 프로그램이 멈추는 대신 `catch` 블록으로 넘어갑니다.

```ts
function calculateSubtotal(price: number, quantity: number): number {
  if (quantity < 1) {
    throw new Error(`수량은 1 이상이어야 합니다. (입력값: ${quantity})`)
  }
  return price * quantity
}

try {
  console.log('A. 계산 시작')
  const subtotal = calculateSubtotal(4500, -3)
  console.log('B. 소계:', subtotal) // 실행되지 않음
} catch (error) {
  console.log('C. 오류 처리:', error instanceof Error ? error.message : error)
}

console.log('D. 프로그램은 계속 실행됩니다')
```

```text
A. 계산 시작
C. 오류 처리: 수량은 1 이상이어야 합니다. (입력값: -3)
D. 프로그램은 계속 실행됩니다
```

- `try` 안에서 오류가 나면 **그 아래 줄(B)은 건너뛰고** 바로 `catch`로 갑니다.
- `catch (error)`의 `error`에는 던져진 값(여기서는 `Error` 객체)이 들어옵니다.
- `catch`가 끝나면 `try`/`catch` 다음 줄(D)부터 정상적으로 계속 실행됩니다.
- `try` 안에서 오류가 나지 않으면 `catch`는 실행되지 않습니다.
- `error instanceof Error ? ... : ...` 부분은 바로 아래 "catch의 오류 변수는 unknown"에서 설명합니다.

### finally: 성공하든 실패하든 마지막에

`finally` 블록은 `try`가 성공해도, `catch`로 넘어가도 **반드시 마지막에 실행**됩니다. 열어 둔 것을 닫거나, "처리 중" 표시를 끄는 정리 작업에 씁니다.

```ts
function processPayment(amount: number) {
  console.log('1. 결제 단말기 연결')
  try {
    console.log('2. 결제 요청:', amount)
    if (amount <= 0) {
      throw new Error('결제 금액이 올바르지 않습니다.')
    }
    console.log('3. 결제 승인')
  } catch (error) {
    console.log('4. 결제 실패 안내')
  } finally {
    console.log('5. 결제 단말기 연결 해제')
  }
  console.log('6. 다음 손님 대기')
}

processPayment(15000)
console.log('---')
processPayment(0)
```

```text
1. 결제 단말기 연결
2. 결제 요청: 15000
3. 결제 승인
5. 결제 단말기 연결 해제
6. 다음 손님 대기
---
1. 결제 단말기 연결
2. 결제 요청: 0
4. 결제 실패 안내
5. 결제 단말기 연결 해제
6. 다음 손님 대기
```

#### 실행 순서 정리

| 상황 | 실행 순서 |
|---|---|
| `try`에서 오류 없음 | `try` 전체 → `finally` → 다음 코드 |
| `try`에서 오류 발생 | `try`(오류 난 줄까지) → `catch` → `finally` → 다음 코드 |
| `catch` 없이 `try`/`finally`만 있고 오류 발생 | `try`(오류 난 줄까지) → `finally` → 오류가 바깥으로 계속 올라감 |
| `try`에서 `return` | `return`할 값을 정해 둠 → `finally` 실행 → 그 값을 반환 |

마지막 줄이 특히 중요합니다. `try` 안에서 `return`해도 `finally`는 실행됩니다.

```ts
function loadMenu() {
  try {
    console.log('메뉴 불러오는 중...')
    return '메뉴 12개'
  } finally {
    console.log('로딩 표시 끄기')
  }
}

console.log(loadMenu())
```

```text
메뉴 불러오는 중...
로딩 표시 끄기
메뉴 12개
```

`return`을 만났지만 함수를 빠져나가기 전에 `finally`가 먼저 실행되고, 그다음 값이 반환되어 출력됩니다. 그래서 "로딩 표시 끄기"처럼 **어떤 경우에도 빠지면 안 되는 정리 작업**은 `finally`에 둡니다.

### catch의 오류 변수는 unknown입니다

`catch (error)`의 `error`에 마우스를 올려 보면 타입이 `unknown`으로 보입니다. **`unknown`** 은 "무엇이 들어 있는지 모르는 값"이라는 타입으로, 확인하기 전에는 속성을 읽을 수 없습니다.

```ts
try {
  JSON.parse('{잘못된 JSON')
} catch (error) {
  console.log(error.message)
  // ❌ 'error' is of type 'unknown'. (TS18046)
}
```

왜 `Error`가 아니라 `unknown`일까요? JavaScript에서는 **무엇이든 던질 수 있기** 때문입니다. `throw '문자열'`, `throw 404`, `throw { code: 'E01' }` 모두 가능합니다. 우리가 부른 함수 깊숙한 곳, 혹은 다른 사람이 만든 라이브러리가 무엇을 던질지 TypeScript는 알 수 없습니다. 그래서 "확인하고 써라"라는 뜻으로 `unknown`을 붙입니다.

::: info 버전 정보
`catch` 변수를 `unknown`으로 다루는 동작은 **TypeScript 4.4**에서 추가된 `useUnknownInCatchVariables` 옵션 덕분이며, `strict: true`면 자동으로 켜집니다. 그 이전 버전이나 `strict`를 끈 프로젝트에서는 `any`(아무 검사도 하지 않는 타입)로 취급되어 `error.message`를 바로 쓸 수 있지만, `error`가 문자열이면 실행 중에 `undefined`가 나오는 위험이 있습니다. `unknown`과 `any`의 차이는 [특수 타입](../part2-types/02-special-types)에서 자세히 다룹니다.
:::

#### instanceof Error로 좁히기

`값 instanceof Error`는 "이 값이 `Error`로 만들어진 객체인가?"를 검사합니다. `if`로 검사하면 그 블록 안에서 TypeScript가 `error`를 `Error` 타입으로 **좁혀서** 속성을 쓸 수 있게 해 줍니다.

```ts
try {
  JSON.parse('{잘못된 JSON')
} catch (error) {
  if (error instanceof Error) {
    console.log(error.name)    // 이 블록 안에서는 Error 타입
  } else {
    console.log('알 수 없는 오류:', error)
  }
}
// 출력: SyntaxError
```

`SyntaxError`는 `Error`의 하위 종류이므로 `instanceof Error`가 `true`입니다. 오류 메시지를 꺼내는 일이 잦다면 작은 함수로 만들어 두면 편합니다.

```ts
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}

try {
  throw new Error('재고가 부족합니다.')
} catch (error) {
  console.log(getErrorMessage(error)) // 출력: 재고가 부족합니다.
}

try {
  throw '문자열로 던진 오류'
} catch (error) {
  console.log(getErrorMessage(error)) // 출력: 문자열로 던진 오류
}
```

`instanceof`와 같은 검사로 타입을 좁히는 원리는 [타입 좁히기](../part2-types/08-narrowing)에서 본격적으로 배웁니다.

### 사용자 정의 오류 클래스 맛보기

오류의 **종류에 따라 다르게 처리**하고 싶을 때가 있습니다. 예를 들어 "입력값이 잘못됨"은 손님에게 다시 입력하라고 안내하고, "서버 연결 실패"는 잠시 후 다시 시도하라고 안내해야 합니다. 이럴 때 `Error`를 확장한 나만의 오류 종류를 만듭니다.

```ts
class ValidationError extends Error {
  field: string

  constructor(field: string, message: string) {
    super(message)                // 부모(Error)에게 message 전달
    this.name = 'ValidationError' // 오류 종류 이름
    this.field = field            // 어떤 입력 항목이 잘못됐는지
  }
}

try {
  throw new ValidationError('quantity', '수량은 1 이상이어야 합니다.')
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(`[입력 확인] ${error.field}: ${error.message}`)
  } else if (error instanceof Error) {
    console.log(`[시스템 오류] ${error.message}`)
  }
}
// 출력: [입력 확인] quantity: 수량은 1 이상이어야 합니다.
```

- `class ValidationError extends Error`는 "`Error`의 성질을 물려받은 새 오류 종류"를 만든다는 뜻입니다.
- `constructor`는 `new ValidationError(...)`를 할 때 실행되는 함수, `super(message)`는 부모인 `Error`를 준비시키는 호출입니다.
- `instanceof ValidationError`로 종류를 구분해서 처리할 수 있습니다.

클래스 문법은 [클래스](../part3-intermediate/08-classes)에서 제대로 배우니, 지금은 "오류에도 종류를 만들 수 있고, `instanceof`로 구분한다"는 것만 기억하세요.

::: info 원인 오류 함께 담기 (ES2022)
오류를 잡아서 더 알기 쉬운 오류로 바꿔 던질 때, `new Error('주문 저장 실패', { cause: error })`처럼 원래 오류를 `cause`에 담을 수 있습니다(ES2022부터). 원인을 잃지 않으면서 상황 설명을 더할 수 있습니다.
:::

### 오류를 삼키지 마세요

`catch`에서 아무것도 하지 않는 것을 오류를 **삼킨다**(swallow)고 합니다. 가장 나쁜 습관입니다.

```ts
function saveOrder(orderNo: string) {
  throw new Error(`주문 ${orderNo} 저장 실패: 데이터베이스 연결 끊김`)
}

try {
  saveOrder('A-1001')
} catch (error) {
  // 아무것도 하지 않음
}
console.log('주문이 완료되었습니다!') // 출력: 주문이 완료되었습니다!
```

주문은 저장되지 않았는데 손님에게는 "완료"라고 안내합니다. 오류 메시지도 남지 않아 나중에 원인을 찾을 수도 없습니다. 오류를 잡았다면 최소한 다음 중 하나는 해야 합니다.

1. **사용자에게 알린다**: "주문 저장에 실패했습니다. 다시 시도해 주세요."
2. **기록을 남긴다**: 로그에 오류 내용과 `stack`을 남긴다. (단, 비밀번호·카드번호 같은 민감 정보는 빼고)
3. **대신할 방법이 있으면 쓴다**: 예를 들어 서버 저장에 실패하면 임시로 단말기에 저장한다.
4. **처리할 수 없으면 다시 던진다**: `throw error`로 바깥에 맡긴다.

```ts
function saveOrder(orderNo: string) {
  throw new Error(`주문 ${orderNo} 저장 실패: 데이터베이스 연결 끊김`)
}

function completeOrder(orderNo: string): boolean {
  try {
    saveOrder(orderNo)
    return true
  } catch (error) {
    console.error('[주문 저장 오류]', error instanceof Error ? error.message : error)
    return false
  }
}

if (completeOrder('A-1001')) {
  console.log('주문이 완료되었습니다!')
} else {
  console.log('주문 저장에 실패했습니다. 직원에게 문의해 주세요.')
}
```

```text
[주문 저장 오류] 주문 A-1001 저장 실패: 데이터베이스 연결 끊김
주문 저장에 실패했습니다. 직원에게 문의해 주세요.
```

`console.error`는 `console.log`와 비슷하지만 **오류 출력 통로**(stderr)로 내보냅니다. 로그 수집 도구가 오류만 따로 모을 수 있게 해 줍니다.

::: tip try는 좁게, catch는 처리할 수 있는 곳에서
함수 전체를 `try`로 감싸지 말고, **오류가 날 수 있는 부분만** 감싸세요. 그리고 오류를 **의미 있게 처리할 수 있는 곳**(사용자에게 안내할 수 있는 화면 쪽 등)에서 잡으세요. 처리할 방법이 없는 곳에서 잡아 봐야 삼키게 될 뿐입니다.
:::

### 실습: 수량·금액 입력 검증

POS 화면에서 수량과 받은 금액을 문자열로 입력받는다고 해 봅시다. 검증 함수는 잘못된 입력에 `ValidationError`를 던지고, 화면 쪽에서 잡아 안내합니다.

```ts
class ValidationError extends Error {
  field: string
  constructor(field: string, message: string) {
    super(message)
    this.name = 'ValidationError'
    this.field = field
  }
}

// 수량: 1~99 사이의 정수
function parseQuantity(input: string): number {
  const trimmed = input.trim()
  if (trimmed === '') {
    throw new ValidationError('quantity', '수량을 입력해 주세요.')
  }
  const quantity = Number(trimmed)
  if (!Number.isInteger(quantity)) {
    throw new ValidationError('quantity', `수량은 정수여야 합니다. (입력값: ${input})`)
  }
  if (quantity < 1 || quantity > 99) {
    throw new ValidationError('quantity', `수량은 1~99 사이여야 합니다. (입력값: ${quantity})`)
  }
  return quantity
}

// 받은 금액: 쉼표 허용, 0 이상의 정수(원 단위)
function parseAmount(input: string): number {
  const amount = Number(input.trim().replaceAll(',', ''))
  if (input.trim() === '' || Number.isNaN(amount)) {
    throw new ValidationError('amount', `금액 형식이 올바르지 않습니다. (입력값: ${input})`)
  }
  if (!Number.isInteger(amount) || amount < 0) {
    throw new ValidationError('amount', '금액은 0 이상의 원 단위 정수여야 합니다.')
  }
  return amount
}

// 화면 쪽: 입력을 받아 거스름돈 계산
function checkout(unitPrice: number, quantityInput: string, paidInput: string) {
  try {
    const quantity = parseQuantity(quantityInput)
    const paid = parseAmount(paidInput)
    const total = unitPrice * quantity
    if (paid < total) {
      throw new ValidationError('amount', `받은 금액이 부족합니다. (부족: ${total - paid}원)`)
    }
    console.log(`결제 완료: 합계 ${total}원, 거스름돈 ${paid - total}원`)
  } catch (error) {
    if (error instanceof ValidationError) {
      console.log(`[다시 입력] ${error.message}`)
    } else {
      throw error // 예상하지 못한 오류는 삼키지 않고 바깥으로
    }
  }
}

checkout(4500, '2', '10,000')
checkout(4500, '', '10000')
checkout(4500, '1.5', '10000')
checkout(4500, '120', '10000')
checkout(4500, '3', '만원')
checkout(4500, '3', '10000')
```

```text
결제 완료: 합계 9000원, 거스름돈 1000원
[다시 입력] 수량을 입력해 주세요.
[다시 입력] 수량은 정수여야 합니다. (입력값: 1.5)
[다시 입력] 수량은 1~99 사이여야 합니다. (입력값: 120)
[다시 입력] 금액 형식이 올바르지 않습니다. (입력값: 만원)
[다시 입력] 받은 금액이 부족합니다. (부족: 3500원)
```

이 구조의 장점은 다음과 같습니다.

- **검증 함수**(`parseQuantity`, `parseAmount`)는 문제를 발견하면 던지기만 합니다. 화면에 어떻게 보여 줄지는 모릅니다.
- **화면 쪽**(`checkout`)은 `ValidationError`면 "다시 입력" 안내를 하고, 그 밖의 예상치 못한 오류는 **다시 던져** 삼키지 않습니다.
- `Number.isInteger(값)`은 정수인지 검사하는 내장 함수로, `NaN`이나 소수에는 `false`를 돌려줍니다.

::: info 오류를 던질까, 값으로 돌려줄까
[문자열](./09-strings) 레슨의 `toAmount`는 실패하면 `undefined`를 돌려줬습니다. 두 방법 모두 쓰입니다. 실패가 **흔하고 예상되는 일**이면 값(`undefined`, 결과 객체)으로, **흐름을 멈춰야 하는 예외적인 일**이면 오류로 알리는 경우가 많습니다. 어떤 방식이든 팀 안에서 일관되게 쓰는 것이 중요합니다. 비동기 코드의 오류 처리는 [async/await와 비동기 오류 처리](../part4-async/03-async-await)에서 이어서 배웁니다.
:::

## 자주 하는 실수

### 실수 1. catch에서 error.message를 바로 쓰기

```ts
try {
  JSON.parse('')
} catch (error) {
  console.log('오류:', error.message)
  // ❌ 'error' is of type 'unknown'. (TS18046)
}
```

**왜 틀렸나**: `catch` 변수는 `unknown`이라 무엇이 들어 있는지 확인하기 전에는 속성을 읽을 수 없습니다.

**고친 코드**:

```ts
try {
  JSON.parse('')
} catch (error) {
  if (error instanceof Error) {
    console.log('오류:', error.name) // 출력: 오류: SyntaxError
  }
}
```

### 실수 2. 오류를 삼키기

```ts
function parsePrice(input: string): number {
  try {
    const price = Number(input)
    if (Number.isNaN(price)) {
      throw new Error(`가격 형식 오류: ${input}`)
    }
    return price
  } catch (error) {
    return 0 // 문제를 숨기고 0원으로 처리
  }
}

console.log(parsePrice('사천오백')) // 출력: 0
```

**왜 틀렸나**: 잘못된 가격이 조용히 0원이 되어 상품이 무료로 팔릴 수 있습니다. 아무 기록도 남지 않습니다.

**고친 코드**: 이 함수에서 처리할 방법이 없으므로 잡지 않고 호출한 쪽에 맡깁니다.

```ts
function parsePrice(input: string): number {
  const price = Number(input)
  if (Number.isNaN(price)) {
    throw new Error(`가격 형식 오류: ${input}`)
  }
  return price
}

try {
  parsePrice('사천오백')
} catch (error) {
  console.log(error instanceof Error ? error.message : error) // 출력: 가격 형식 오류: 사천오백
}
```

### 실수 3. 문자열을 throw하기

```ts
function checkStock(stock: number) {
  if (stock <= 0) {
    throw '재고 없음'
  }
}

try {
  checkStock(0)
} catch (error) {
  console.log(error instanceof Error) // 출력: false
}
```

**왜 틀렸나**: 문자열에는 `name`, `stack`이 없어 어디서 났는지 추적할 수 없고, `instanceof Error` 검사도 통과하지 못해 받는 쪽이 처리하기 어렵습니다.

**고친 코드**:

```ts
function checkStock(stock: number) {
  if (stock <= 0) {
    throw new Error('재고 없음')
  }
}

try {
  checkStock(0)
} catch (error) {
  console.log(error instanceof Error) // 출력: true
}
```

### 실수 4. finally에 꼭 해야 할 정리 작업을 두지 않기

```ts
let isProcessing = false

function pay(amount: number) {
  isProcessing = true
  if (amount <= 0) {
    throw new Error('결제 금액 오류')
  }
  isProcessing = false
}

try {
  pay(0)
} catch (error) {
  console.log('결제 실패') // 출력: 결제 실패
}
console.log('처리 중?', isProcessing) // 출력: 처리 중? true
```

**왜 틀렸나**: 오류가 나서 `isProcessing = false`에 도달하지 못했습니다. 화면이 "처리 중" 상태로 멈춰 다음 결제를 받을 수 없습니다.

**고친 코드**: 성공·실패와 상관없이 해야 하는 일은 `finally`에 둡니다.

```ts
let isProcessing = false

function pay(amount: number) {
  isProcessing = true
  try {
    if (amount <= 0) {
      throw new Error('결제 금액 오류')
    }
  } finally {
    isProcessing = false
  }
}

try {
  pay(0)
} catch (error) {
  console.log('결제 실패') // 출력: 결제 실패
}
console.log('처리 중?', isProcessing) // 출력: 처리 중? false
```

## 직접 해 보기

### 문제 1. 실행 순서 맞히기 ⭐

아래 코드의 출력 순서를 예상하세요.

```ts
try {
  console.log('A')
  throw new Error('문제 발생')
  console.log('B')
} catch (error) {
  console.log('C')
} finally {
  console.log('D')
}
console.log('E')
```

::: details 정답 보기
```text
A
C
D
E
```

`throw` 아래의 `B`는 건너뛰고 `catch`(C) → `finally`(D) → 다음 코드(E) 순서입니다. (VS Code는 `B` 줄을 "도달할 수 없는 코드"로 흐리게 표시합니다.)
:::

### 문제 2. 할인율 검증 ⭐

할인율(0 이상 1 이하)을 받아 할인 가격을 돌려주는 `applyDiscount(price: number, rate: number)`를 만드세요. 범위를 벗어나면 `할인율은 0~1 사이여야 합니다. (입력값: 1.5)` 같은 메시지로 오류를 던지세요. `applyDiscount(10000, 1.5)`를 `try`/`catch`로 호출해 메시지를 출력하세요.

::: details 정답 보기
```ts
function applyDiscount(price: number, rate: number): number {
  if (rate < 0 || rate > 1) {
    throw new Error(`할인율은 0~1 사이여야 합니다. (입력값: ${rate})`)
  }
  return price - price * rate
}

console.log(applyDiscount(10000, 0.1)) // 출력: 9000

try {
  applyDiscount(10000, 1.5)
} catch (error) {
  if (error instanceof Error) {
    console.log(error.message) // 출력: 할인율은 0~1 사이여야 합니다. (입력값: 1.5)
  }
}
```
:::

### 문제 3. 안전한 JSON 읽기 ⭐⭐

문자열을 `JSON.parse`로 읽되, 실패하면 `null`을 돌려주고 `console.error`로 원인을 남기는 함수 `safeParse(text: string): unknown`을 만드세요. `'{"menu":"라떼"}'`와 `'{menu:라떼}'`로 시험해 보세요.

::: details 정답 보기
```ts
function safeParse(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch (error) {
    console.error('[JSON 오류]', error instanceof Error ? error.message : error)
    return null
  }
}

console.log(safeParse('{"menu":"라떼"}')) // 출력: { menu: '라떼' }
console.log(safeParse('{menu:라떼}'))     // 출력: null  (그 전에 [JSON 오류] ... 메시지가 찍힘)
```

`JSON.parse`의 결과는 어떤 모양일지 모르므로 반환 타입을 `unknown`으로 둡니다. 받은 쪽에서 검사한 뒤 써야 합니다. 실패를 기록하고 `null`로 알리므로 "삼킨" 것이 아닙니다. JSON은 [JSON · Date · Map · Set](../part4-async/06-json-date-map-set)에서, 데이터 모양을 검사하는 방법은 [런타임 검증](../part4-async/05-runtime-validation)에서 배웁니다.
:::

### 문제 4. 장바구니 담기 검증 ⭐⭐

`addToCart(cart, item)` 함수를 만드세요. `item`은 `{ name: string; price: number; quantity: number }`입니다. 다음 경우 오류를 던지고, 정상이면 **새 장바구니 배열**을 돌려줍니다.

- 가격이 0 이하
- 수량이 1 미만이거나 정수가 아님
- 장바구니 총 수량이 담은 뒤 20개를 넘음

::: details 정답 보기
```ts
type CartItem = { name: string; price: number; quantity: number }

function addToCart(cart: CartItem[], item: CartItem): CartItem[] {
  if (item.price <= 0) {
    throw new Error(`${item.name}: 가격이 올바르지 않습니다. (${item.price})`)
  }
  if (!Number.isInteger(item.quantity) || item.quantity < 1) {
    throw new Error(`${item.name}: 수량이 올바르지 않습니다. (${item.quantity})`)
  }
  const currentCount = cart.reduce((sum, c) => sum + c.quantity, 0)
  if (currentCount + item.quantity > 20) {
    throw new Error(`장바구니에는 최대 20개까지 담을 수 있습니다. (현재 ${currentCount}개)`)
  }
  return [...cart, item]
}

let cart: CartItem[] = []
const requests: CartItem[] = [
  { name: '생수', price: 900, quantity: 12 },
  { name: '컵라면', price: 1300, quantity: 0 },
  { name: '우유', price: 1700, quantity: 10 },
  { name: '김밥', price: 3500, quantity: 2 },
]

for (const request of requests) {
  try {
    cart = addToCart(cart, request)
    console.log(`담기 성공: ${request.name}`)
  } catch (error) {
    console.log(`담기 실패: ${error instanceof Error ? error.message : error}`)
  }
}
```

출력:

```text
담기 성공: 생수
담기 실패: 컵라면: 수량이 올바르지 않습니다. (0)
담기 실패: 장바구니에는 최대 20개까지 담을 수 있습니다. (현재 12개)
담기 성공: 김밥
```

`type CartItem = ...`은 객체 모양에 이름을 붙이는 **타입 별칭**입니다([타입 별칭과 인터페이스](../part2-types/07-type-alias-interface)). 반복문 안에서 `try`/`catch`를 쓰면 한 항목이 실패해도 나머지는 계속 처리됩니다.
:::

### 문제 5. 오류 종류별 처리 ⭐⭐⭐

이 레슨의 `ValidationError`와 함께, 재고 부족을 나타내는 `OutOfStockError`(속성 `productName: string`)를 만드세요. 그리고 `order(productName: string, stock: number, quantity: number)` 함수가 수량이 1 미만이면 `ValidationError`, 재고보다 많으면 `OutOfStockError`를 던지게 하세요. 호출하는 쪽에서 종류별로 다른 안내를 출력하세요.

::: details 정답 보기
```ts
class ValidationError extends Error {
  field: string
  constructor(field: string, message: string) {
    super(message)
    this.name = 'ValidationError'
    this.field = field
  }
}

class OutOfStockError extends Error {
  productName: string
  constructor(productName: string, message: string) {
    super(message)
    this.name = 'OutOfStockError'
    this.productName = productName
  }
}

function order(productName: string, stock: number, quantity: number): string {
  if (quantity < 1) {
    throw new ValidationError('quantity', '수량은 1 이상이어야 합니다.')
  }
  if (quantity > stock) {
    throw new OutOfStockError(productName, `재고가 ${stock}개뿐입니다.`)
  }
  return `${productName} ${quantity}개 주문 완료`
}

function tryOrder(productName: string, stock: number, quantity: number) {
  try {
    console.log(order(productName, stock, quantity))
  } catch (error) {
    if (error instanceof ValidationError) {
      console.log(`[입력 오류] ${error.message}`)
    } else if (error instanceof OutOfStockError) {
      console.log(`[품절 임박] ${error.productName}: ${error.message}`)
    } else {
      throw error
    }
  }
}

tryOrder('치즈케이크', 5, 2)
tryOrder('치즈케이크', 5, 0)
tryOrder('치즈케이크', 5, 8)
```

출력:

```text
치즈케이크 2개 주문 완료
[입력 오류] 수량은 1 이상이어야 합니다.
[품절 임박] 치즈케이크: 재고가 5개뿐입니다.
```

처리할 수 없는 그 밖의 오류는 `throw error`로 다시 던져, 삼키지 않습니다.
:::

## 확인 퀴즈

**Q1.** 처리하지 않은 오류가 나면 그 아래 코드는 어떻게 되나요?

::: details 정답 보기
실행되지 않습니다. 오류가 호출한 쪽으로 계속 거슬러 올라가고, 아무도 잡지 않으면 프로그램이 멈춥니다.
:::

**Q2.** `try` 안에서 `return`을 해도 `finally`가 실행되나요?

::: details 정답 보기
실행됩니다. 반환할 값을 정해 둔 뒤 `finally`를 실행하고, 그다음에 값을 반환합니다.
:::

**Q3.** `strict` 모드에서 `catch (error)`의 `error` 타입은 무엇이고, 그 이유는 무엇인가요?

::: details 정답 보기
`unknown`입니다(TypeScript 4.4의 `useUnknownInCatchVariables`, `strict`에 포함). JavaScript에서는 문자열·숫자 등 무엇이든 던질 수 있어서, 던져진 값이 `Error`라는 보장이 없기 때문입니다.
:::

**Q4.** `Error` 객체의 세 가지 주요 속성과 각각의 역할을 말해 보세요.

::: details 정답 보기
`name`(오류 종류), `message`(무엇이 잘못됐는지 설명), `stack`(오류가 만들어진 위치와 호출 경로)입니다.
:::

**Q5.** 오류를 "삼킨다"는 것은 무엇이고, 왜 나쁜가요?

::: details 정답 보기
`catch`에서 아무 처리도 하지 않고 넘어가는 것입니다. 실패했는데 성공한 것처럼 진행되고, 기록도 남지 않아 원인을 찾을 수 없기 때문입니다.
:::

## 정리

- 처리하지 않은 오류는 그 자리에서 실행을 멈추고, 호출한 쪽으로 거슬러 올라가 프로그램 전체를 멈춥니다.
- 오류는 `name`·`message`·`stack`을 가진 `Error` 객체로 표현합니다. 문자열이 아니라 **항상 `new Error(...)`를 던집니다**.
- `throw`는 문제를 발견한 곳에서 일찍 알리는 것(빠른 실패), `try`/`catch`는 처리할 수 있는 곳에서 받는 것입니다.
- 실행 순서: 오류가 없으면 `try` → `finally`, 오류가 나면 `try`(중단) → `catch` → `finally`. `finally`는 `return`이 있어도 실행됩니다.
- `catch` 변수는 `unknown`(TS 4.4+, `strict`)이므로 `instanceof Error`로 좁혀서 씁니다.
- `Error`를 확장한 사용자 정의 오류로 종류를 나누고, 처리할 수 없는 오류는 다시 던집니다. **오류를 삼키지 마세요.**

## 다음 단계

Part 1을 마쳤습니다. 값과 변수, 조건과 반복, 함수, 배열, 객체, 문자열, 스코프, 오류 처리까지 프로그램을 만드는 기본 재료를 모두 다뤘습니다.

[타입 시스템 기초: 타입 표기와 타입 추론](../part2-types/01-annotation-inference) — 지금까지 가볍게 써 온 `: number`, `string[]` 같은 타입 표기를 본격적으로 배웁니다. TypeScript가 왜 그런 에러를 냈는지 이제 이유를 알게 됩니다.
