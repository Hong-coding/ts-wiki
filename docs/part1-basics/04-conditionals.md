---
title: '조건문: if · switch · 삼항 연산자'
---

# 조건문: if · switch · 삼항 연산자

<LessonMeta level="입문" :minutes="45" prev="산술·비교·논리 연산자와 ===, ??, ?.로 값을 계산하고 비교했습니다." />

## 이번에 배울 것

- `if` / `else if` / `else`로 조건에 따라 다른 코드를 실행할 수 있다.
- 조건문의 흐름을 순서도로 그리고, 위에서부터 차례로 검사된다는 것을 설명할 수 있다.
- truthy·falsy 값을 구분하고, 조건에 숫자·문자열을 쓸 때의 함정을 피할 수 있다.
- `switch`를 쓰고, `break`를 빠뜨렸을 때 생기는 문제를 설명할 수 있다.
- 삼항 연산자와 조기 반환(early return)으로 조건문을 짧고 읽기 쉽게 만들 수 있다.

## 먼저 알아 둘 것

- [연산자와 표현식](./03-operators): 비교 연산자(`===`, `>=` 등)와 논리 연산자(`&&`, `||`, `!`)의 결과가 `true`/`false`라는 것
- [원시 타입](./02-primitive-types): boolean, `null`, `undefined`

## 비유로 이해하기

### 갈림길의 안내 표지판

카페 계산대 직원의 머릿속을 들여다봅시다.

> "회원 카드를 내셨나? → 내셨으면 등급을 본다. VIP면 10% 할인, 골드면 5% 할인, 그 외에는 할인 없음. → 카드가 없으면 그냥 정가."

직원은 **질문**을 하고, **답에 따라 다른 길**로 갑니다. 길은 여러 갈래지만 **한 번에 하나의 길만** 걷습니다.

프로그램도 똑같습니다. 지금까지의 코드는 위에서 아래로 한 줄씩 **모두** 실행됐습니다. **조건문**(conditional statement)을 쓰면 "이 조건이 참일 때만 이 코드를 실행하라"고 길을 나눌 수 있습니다. 이렇게 코드가 실행되는 순서를 **흐름**(control flow, 제어 흐름)이라고 부르고, 조건문은 흐름을 바꾸는 첫 번째 도구입니다.

## 개념 설명

### if: 조건이 참일 때만 실행

```ts
const orderAmount = 32000

if (orderAmount >= 30000) {
  console.log('무료 배송입니다.')
}
console.log('주문이 접수되었습니다.')
```

실행 결과:

```text
무료 배송입니다.
주문이 접수되었습니다.
```

모양을 뜯어 보면 이렇습니다.

```text
if (조건) {
  조건이 true일 때 실행할 코드
}
```

- `if` 뒤의 **괄호 `( )` 안에 조건**을 씁니다. 조건은 `true`나 `false`로 계산되는 표현식입니다.
- 조건이 `true`면 **중괄호 `{ }` 블록** 안의 코드를 실행합니다.
- 조건이 `false`면 블록을 건너뜁니다.
- 블록이 끝난 뒤의 코드(`주문이 접수되었습니다.`)는 조건과 상관없이 실행됩니다.

`orderAmount`를 `25000`으로 바꿔서 다시 실행해 보세요. `주문이 접수되었습니다.`만 출력됩니다.

::: tip 블록 안은 들여쓰기
블록 안의 코드는 **두 칸**(팀에 따라 네 칸) 들여씁니다. 들여쓰기는 실행에 영향을 주지 않지만, "이 코드는 저 조건에 속해 있다"는 것을 눈으로 보여 줍니다. VS Code에서 `Shift + Alt + F`를 누르면 들여쓰기를 자동으로 정리해 줍니다.
:::

### else: 그렇지 않으면

조건이 거짓일 때 실행할 코드는 `else` 블록에 씁니다.

```ts
const stock = 0

if (stock > 0) {
  console.log('주문 가능')
} else {
  console.log('품절')
}
// 출력: 품절
```

`if`와 `else` 중 **정확히 하나만** 실행됩니다. 둘 다 실행되거나, 둘 다 건너뛰는 일은 없습니다.

### else if: 여러 갈래로 나누기

갈래가 셋 이상이면 `else if`를 이어 붙입니다. 회원 등급별 할인율을 정해 봅시다.

```ts
let grade: string = 'GOLD'
let discountRate = 0

if (grade === 'VIP') {
  discountRate = 0.1
} else if (grade === 'GOLD') {
  discountRate = 0.05
} else if (grade === 'SILVER') {
  discountRate = 0.03
} else {
  discountRate = 0
}

const price = 20000
console.log('할인율:', discountRate)
console.log('결제 금액:', price - price * discountRate)
```

실행 결과:

```text
할인율: 0.05
결제 금액: 19000
```

`let grade: string`처럼 타입을 적은 이유는, 실습할 때 `'GOLD'`를 다른 등급으로 바꿔 보기 쉽게 하기 위해서입니다. `const grade = 'GOLD'`로 쓰면 TypeScript가 "이 값은 영원히 `'GOLD'`"라고 기억해서 `grade === 'VIP'` 같은 비교를 "절대 참이 될 수 없는 비교"라며 에러로 알려 줍니다(TS2367, [연산자](./03-operators) 레슨에서 본 에러입니다).

#### 순서도로 그려 보기

위 코드의 흐름을 그림으로 그리면 이렇습니다. 마름모(`◇`)는 질문, 네모(`[ ]`)는 실행할 일입니다.

```text
            시작
             │
     ◇ grade === 'VIP' ? ──예──▶ [할인율 0.1] ──────┐
             │아니오                                │
     ◇ grade === 'GOLD' ? ─예──▶ [할인율 0.05] ─────┤
             │아니오                                │
     ◇ grade === 'SILVER' ? 예─▶ [할인율 0.03] ─────┤
             │아니오                                │
        [할인율 0]  ───────────────────────────────┤
                                                    ▼
                                         [결제 금액 계산]
```

말로 풀면 다음과 같습니다.

1. **위에서부터 차례로** 조건을 검사합니다.
2. 처음으로 **참인 조건을 만나면** 그 블록을 실행하고, **나머지 조건은 보지도 않고** 전체 `if` 문을 빠져나갑니다.
3. 끝까지 참인 조건이 없으면 `else` 블록을 실행합니다. `else`가 없으면 아무것도 하지 않습니다.

`grade`가 `'GOLD'`일 때는 ① `'VIP'` 검사(거짓) → ② `'GOLD'` 검사(참) → 할인율 0.05 → 빠져나감. `'SILVER'` 검사는 아예 하지 않습니다.

#### 순서가 중요한 경우

"위에서부터, 처음 참인 곳 하나만"이라는 규칙 때문에 **조건의 순서**가 결과를 바꿀 수 있습니다. 구매 금액으로 등급을 정하는 코드를 봅시다.

```ts
let yearlyAmount = 1500000
let memberGrade = ''

// ❌ 잘못된 순서: 작은 기준을 먼저 검사
if (yearlyAmount >= 300000) {
  memberGrade = 'SILVER'
} else if (yearlyAmount >= 1000000) {
  memberGrade = 'VIP'
} else {
  memberGrade = 'NORMAL'
}
console.log(memberGrade) // 출력: SILVER
```

150만 원을 쓴 고객인데 `SILVER`가 나왔습니다. 첫 조건 `>= 300000`이 이미 참이라서 두 번째 조건은 검사조차 하지 않았기 때문입니다. **범위를 검사할 때는 좁은(엄격한) 조건부터** 씁니다.

```ts
let yearlyAmount = 1500000
let memberGrade = ''

if (yearlyAmount >= 1000000) {
  memberGrade = 'VIP'
} else if (yearlyAmount >= 300000) {
  memberGrade = 'SILVER'
} else {
  memberGrade = 'NORMAL'
}
console.log(memberGrade) // 출력: VIP
```

### 조건을 조합하기: 영업시간 판별

조건에는 `&&`, `||`로 묶은 표현식도 쓸 수 있습니다. 매장이 9시부터 22시 전까지 영업한다고 해 봅시다.

```ts
let hour = 21 // 현재 시각(0~23)

if (hour >= 9 && hour < 22) {
  console.log('영업 중입니다.')
} else {
  console.log('영업이 종료되었습니다.')
}
// 출력: 영업 중입니다.
```

`hour >= 9 && hour < 22`는 "9 이상 **그리고** 22 미만"입니다. 수학처럼 `9 <= hour < 22`라고 한 번에 쓸 수는 **없습니다**(TypeScript가 에러로 막아 줍니다). 반드시 두 비교를 `&&`로 이어야 합니다.

점심시간(12시~13시)에는 주문을 받지 않는 규칙이 추가되면 이렇게 됩니다.

```ts
let hour = 12

const isOpenHour = hour >= 9 && hour < 22
const isLunchBreak = hour === 12

if (isOpenHour && !isLunchBreak) {
  console.log('주문 가능')
} else if (isLunchBreak) {
  console.log('점심시간입니다. 13시부터 주문 가능합니다.')
} else {
  console.log('영업시간이 아닙니다.')
}
// 출력: 점심시간입니다. 13시부터 주문 가능합니다.
```

조건이 길어지면 이렇게 **의미 있는 이름의 불리언 변수**로 먼저 뽑아 두세요. `if` 문이 문장처럼 읽힙니다.

### truthy와 falsy: 불리언이 아닌 값을 조건에 쓰면

`if`의 괄호에는 불리언이 아닌 값도 넣을 수 있습니다. 이때 JavaScript는 값을 **참 또는 거짓으로 취급**합니다. 거짓으로 취급되는 값을 **falsy**, 참으로 취급되는 값을 **truthy**라고 부릅니다.

falsy 값은 딱 이것뿐입니다. **외워 두세요.**

| falsy 값 | 설명 |
|---|---|
| `false` | 거짓 |
| `0` | 숫자 0 (`-0`도 포함) |
| `''` | 빈 문자열 (공백 한 칸 `' '`은 truthy!) |
| `null` | 일부러 비워 둔 값 |
| `undefined` | 아직 값이 없음 |
| `NaN` | 숫자가 아님 |

이 밖의 **모든 값은 truthy**입니다. 헷갈리기 쉬운 truthy 값은 다음과 같습니다.

| truthy 값 | 왜 헷갈리나 |
|---|---|
| `'0'` | 글자 "0"은 빈 문자열이 아니므로 truthy |
| `'false'` | 글자 "false"도 truthy |
| `' '` | 공백도 글자 한 개 |
| `-1` | 0이 아닌 숫자는 모두 truthy |
| `[]`, `{}` | 빈 배열, 빈 객체도 truthy |

```ts
let nickname: string = ''

if (nickname) {
  console.log('안녕하세요, ' + nickname + '님')
} else {
  console.log('닉네임을 입력해 주세요.')
}
// 출력: 닉네임을 입력해 주세요.
```

`if (nickname)`은 "닉네임이 빈 문자열이 아니면"이라는 뜻으로 자주 쓰입니다.

::: warning 숫자를 truthy로 검사할 때 주의
`if (stock)`은 재고가 `0`이면 거짓이 됩니다. "재고 정보가 있는가?"를 확인하려던 것이라면 **0개라는 정상 정보**를 놓칩니다. 숫자는 `if (stock > 0)`이나 `if (stock !== null)`처럼 **무엇을 검사하는지 명확하게** 씁니다. [연산자](./03-operators) 레슨에서 `||`와 `??`의 차이로 본 것과 같은 함정입니다.
:::

### TypeScript와 if: 검사하면 타입이 좁아진다

`if`로 값이 있는지 확인하면, TypeScript는 **그 블록 안에서는 값이 있다**고 알아챕니다.

```ts
const member: { name: string; couponCode?: string } = { name: '김민지', couponCode: 'WELCOME10' }

if (member.couponCode) {
  // 이 안에서 member.couponCode는 string으로 취급됨
  console.log('쿠폰 글자 수:', member.couponCode.length)
} else {
  console.log('쿠폰이 없습니다.')
}
// 출력: 쿠폰 글자 수: 9
```

[연산자](./03-operators) 레슨에서 `member.couponCode.length`는 `possibly 'undefined'` 에러(TS18048)가 났습니다. `if`로 먼저 확인했더니 에러가 사라졌습니다. 이렇게 조건문으로 타입을 좁혀 가는 것을 **타입 좁히기**(narrowing)라고 하며, [Part 2](../part2-types/08-narrowing)에서 본격적으로 배웁니다.

### switch: 하나의 값을 여러 경우와 비교

`grade === 'VIP'`, `grade === 'GOLD'`처럼 **같은 변수를 여러 값과 `===`로 비교**하는 경우에는 `switch`를 쓸 수 있습니다.

```ts
let paymentMethod: string = 'CARD'

switch (paymentMethod) {
  case 'CASH':
    console.log('현금 결제: 거스름돈을 준비하세요.')
    break
  case 'CARD':
    console.log('카드 결제: 단말기에 카드를 꽂아 주세요.')
    break
  case 'POINT':
    console.log('포인트 결제: 회원 번호를 확인하세요.')
    break
  default:
    console.log('알 수 없는 결제 수단입니다.')
}
// 출력: 카드 결제: 단말기에 카드를 꽂아 주세요.
```

| 부분 | 뜻 |
|---|---|
| `switch (값)` | 이 값을 아래 `case`들과 비교합니다. |
| `case 'CARD':` | 값이 `'CARD'`와 **`===`로 같으면** 여기서부터 실행합니다. |
| `break` | `switch` 전체를 **빠져나갑니다.** |
| `default:` | 어느 `case`와도 같지 않을 때 실행합니다. `if`의 `else`에 해당합니다. |

#### break를 빠뜨리면: 다음 case로 흘러내린다

`switch`의 가장 유명한 함정입니다. `case`는 "여기서부터 실행 시작"이라는 **입구 표시**일 뿐, 출구가 아닙니다. `break`가 없으면 아래 `case`의 코드까지 **계속 실행**됩니다. 이것을 **폴스루**(fall-through, 흘러내림)라고 합니다.

```ts
let paymentMethod: string = 'CASH'

switch (paymentMethod) {
  case 'CASH':
    console.log('현금 결제: 거스름돈을 준비하세요.')
  case 'CARD':
    console.log('카드 결제: 단말기에 카드를 꽂아 주세요.')
    break
  default:
    console.log('알 수 없는 결제 수단입니다.')
}
```

실행 결과:

```text
현금 결제: 거스름돈을 준비하세요.
카드 결제: 단말기에 카드를 꽂아 주세요.
```

현금 결제인데 카드 안내까지 나왔습니다. `'CASH'` 블록에 `break`가 없어서 `'CARD'` 블록으로 흘러내린 뒤, 거기 있는 `break`에서야 멈췄습니다. **`strict`를 켜도 TypeScript는 이것을 에러로 잡지 않습니다.** `tsconfig.json`에서 `noFallthroughCasesInSwitch` 옵션을 켜면 잡아 주므로, 실무 프로젝트에서는 켜 두는 경우가 많습니다([tsconfig.json 완전 정복](../part6-tooling/01-tsconfig)).

#### 일부러 흘러내리기: 여러 case를 묶기

폴스루를 일부러 쓰는 경우도 있습니다. **코드 없이 `case`만 연달아** 쓰면 "이 중 하나라도 같으면"이 됩니다.

```ts
let day: string = 'SAT'

switch (day) {
  case 'SAT':
  case 'SUN':
    console.log('주말 영업시간: 10:00 ~ 20:00')
    break
  default:
    console.log('평일 영업시간: 09:00 ~ 22:00')
}
// 출력: 주말 영업시간: 10:00 ~ 20:00
```

이렇게 **비어 있는 `case`의 흘러내림**은 `noFallthroughCasesInSwitch`를 켜도 허용됩니다.

#### if와 switch, 무엇을 쓸까

| 상황 | 추천 |
|---|---|
| 하나의 값이 정해진 몇 가지 값 중 무엇인지 | `switch` 또는 `if` (둘 다 괜찮음) |
| 범위 비교(`>=`, `<`)가 필요할 때 | `if` (`switch`는 `===` 비교만 함) |
| 여러 변수를 섞은 복잡한 조건 | `if` |

`switch`는 `===`로만 비교하므로 `case yearlyAmount >= 1000000:` 같은 범위 검사에는 맞지 않습니다.

### 삼항 연산자: 값을 고르는 짧은 if

"조건에 따라 두 값 중 하나를 고르는" 일이라면 **삼항 연산자**(ternary operator, 피연산자가 셋인 연산자)를 쓸 수 있습니다.

```text
조건 ? 참일 때의 값 : 거짓일 때의 값
```

```ts
let stock = 3
const stockLabel = stock > 0 ? '판매 중' : '품절'
console.log(stockLabel) // 출력: 판매 중
```

같은 일을 `if`로 쓰면 이렇습니다.

```ts
let stock = 3
let stockLabel = ''
if (stock > 0) {
  stockLabel = '판매 중'
} else {
  stockLabel = '품절'
}
console.log(stockLabel) // 출력: 판매 중
```

삼항 연산자는 **표현식**이라 결과를 바로 변수에 담을 수 있습니다. 그래서 `let` 대신 `const`를 쓸 수 있다는 장점도 있습니다.

문장 안에서 값을 골라 끼워 넣을 때도 편리합니다. 이때는 괄호로 감싸 계산 순서를 분명히 합니다.

```ts
let isMember = false
console.log('적립 포인트: ' + (isMember ? 500 : 0)) // 출력: 적립 포인트: 0
```

::: warning 삼항 연산자는 짧을 때만
삼항 연산자를 겹쳐 쓰면 금방 읽기 어려워집니다.

```ts
let grade: string = 'GOLD'
const rate = grade === 'VIP' ? 0.1 : grade === 'GOLD' ? 0.05 : grade === 'SILVER' ? 0.03 : 0
console.log(rate) // 출력: 0.05
```

동작은 하지만 한눈에 들어오지 않습니다. **두 갈래면 삼항, 세 갈래 이상이면 `if`나 `switch`**를 권합니다.
:::

### 조기 반환(early return): 안 되는 경우부터 먼저 걸러내기

이번 절은 [함수](./06-functions)를 살짝 미리 씁니다. 지금은 두 가지만 알면 됩니다.

- `function 이름(입력) { ... }`은 코드 묶음에 이름을 붙인 **함수**입니다. `이름(값)`으로 부르면 블록 안의 코드가 실행됩니다.
- 함수 안에서 `return 값`을 만나면 그 값을 돌려주고 **함수가 그 자리에서 즉시 끝납니다.** 아래 줄은 실행되지 않습니다.

주문 가능 여부를 확인하는 함수를 `if`를 중첩해서 쓰면 이렇게 됩니다.

```ts
function checkOrder(isOpen: boolean, stock: number, quantity: number): string {
  if (isOpen) {
    if (stock > 0) {
      if (quantity <= stock) {
        return '주문 완료'
      } else {
        return '재고가 부족합니다.'
      }
    } else {
      return '품절입니다.'
    }
  } else {
    return '영업시간이 아닙니다.'
  }
}

console.log(checkOrder(true, 5, 2)) // 출력: 주문 완료
console.log(checkOrder(true, 5, 9)) // 출력: 재고가 부족합니다.
```

동작은 맞지만, 들여쓰기가 오른쪽으로 계속 밀려 나가는 **화살표 모양**이 됩니다. 어느 `else`가 어느 `if`의 짝인지 찾기도 어렵습니다.

**조기 반환**은 "**안 되는 경우를 먼저 검사해서 바로 `return`**"하는 방법입니다.

```ts
function checkOrder(isOpen: boolean, stock: number, quantity: number): string {
  if (!isOpen) {
    return '영업시간이 아닙니다.'
  }
  if (stock <= 0) {
    return '품절입니다.'
  }
  if (quantity > stock) {
    return '재고가 부족합니다.'
  }
  return '주문 완료'
}

console.log(checkOrder(true, 5, 2))  // 출력: 주문 완료
console.log(checkOrder(true, 5, 9))  // 출력: 재고가 부족합니다.
console.log(checkOrder(false, 5, 2)) // 출력: 영업시간이 아닙니다.
```

- 들여쓰기가 한 단계로 평평해졌습니다.
- 위에서부터 "이건 안 되고, 이것도 안 되고…" 하고 걸러낸 뒤, **맨 아래에 정상 경로**가 남습니다.
- `return`이 함수를 끝내므로 `else`가 필요 없습니다.

이렇게 앞에서 걸러내는 `if`를 **가드 절**(guard clause, 문지기 조건)이라고도 부릅니다. 실무 코드에서 아주 많이 쓰는 형태입니다.

### 중첩 줄이기 정리

`if` 안에 `if`가 세 단계 이상 들어가면 다음 방법을 떠올리세요.

1. **조기 반환**: 함수 안이라면 안 되는 경우를 먼저 `return`
2. **조건 합치기**: `if (a) { if (b) { ... } }`는 `if (a && b) { ... }`로
3. **불리언 변수로 이름 붙이기**: `const canOrder = isOpen && stock > 0`
4. **`else if`로 펼치기**: `else { if (...) }` 대신 `else if (...)`

```ts
let isMember = true
let orderAmount = 50000

// 중첩
if (isMember) {
  if (orderAmount >= 30000) {
    console.log('사은품 증정')
  }
}

// 조건 합치기
if (isMember && orderAmount >= 30000) {
  console.log('사은품 증정')
}
```

두 코드의 출력은 모두 `사은품 증정` 한 줄씩입니다.

## 자주 하는 실수

### 실수 1. 조건에 = 를 하나만 쓰기

```ts
let grade: string = 'GOLD'
if (grade = 'VIP') {
  console.log('VIP 할인 적용')
}
```

**왜 틀렸나**: `=`는 비교가 아니라 **할당**입니다. `grade = 'VIP'`는 `grade`에 `'VIP'`를 넣어 버리고, 그 결과값 `'VIP'`(truthy)로 조건을 판단합니다. 그래서 등급과 상관없이 항상 할인이 적용되고, `grade`도 바뀌어 버립니다. TypeScript는 이 코드를 에러로 막지 않으므로 특히 조심해야 합니다.

**고친 코드**: 비교는 `===`입니다.

```ts
let grade: string = 'GOLD'
if (grade === 'VIP') {
  console.log('VIP 할인 적용')
} else {
  console.log('할인 없음')
}
// 출력: 할인 없음
```

### 실수 2. switch에서 break 빠뜨리기

```ts
let size: string = 'S'
let extraPrice = 0

switch (size) {
  case 'S':
    extraPrice = 0
  case 'M':
    extraPrice = 500
  case 'L':
    extraPrice = 1000
}
console.log(extraPrice) // 출력: 1000
```

**왜 틀렸나**: `'S'`에서 시작해 `break`가 없으니 `'M'`, `'L'` 블록까지 흘러내려 마지막 값 `1000`이 남았습니다. 작은 사이즈 손님에게 1000원을 더 받는 버그입니다.

**고친 코드**:

```ts
let size: string = 'S'
let extraPrice = 0

switch (size) {
  case 'S':
    extraPrice = 0
    break
  case 'M':
    extraPrice = 500
    break
  case 'L':
    extraPrice = 1000
    break
}
console.log(extraPrice) // 출력: 0
```

### 실수 3. 범위 조건을 넓은 것부터 쓰기

```ts
let score = 95
let level = ''
if (score >= 60) {
  level = '보통'
} else if (score >= 90) {
  level = '우수'
}
console.log(level) // 출력: 보통
```

**왜 틀렸나**: `if`는 처음 참인 조건 하나만 실행합니다. 95점은 `>= 60`에서 이미 걸려서 `>= 90`까지 가지 못합니다.

**고친 코드**: 좁은 조건(높은 기준)부터 검사합니다.

```ts
let score = 95
let level = ''
if (score >= 90) {
  level = '우수'
} else if (score >= 60) {
  level = '보통'
} else {
  level = '노력 필요'
}
console.log(level) // 출력: 우수
```

### 실수 4. 0을 "값 없음"으로 착각하는 truthy 검사

```ts
let discountAmount = 0

if (discountAmount) {
  console.log('할인 금액: ' + discountAmount)
} else {
  console.log('할인 정보가 없습니다.')
}
// 출력: 할인 정보가 없습니다.
```

**왜 틀렸나**: 할인 금액이 **0원**이라는 정상 정보인데, `0`이 falsy라서 "정보가 없다"고 출력했습니다.

**고친 코드**: 무엇을 검사하는지 명확히 씁니다.

```ts
let discountAmount = 0

if (discountAmount > 0) {
  console.log('할인 금액: ' + discountAmount)
} else {
  console.log('할인이 적용되지 않았습니다.')
}
// 출력: 할인이 적용되지 않았습니다.
```

### 실수 5. const 리터럴과 비교해서 생기는 TS2367

```ts
const grade = 'GOLD'
if (grade === 'VIP') {
  console.log('VIP')
}
// ❌ This comparison appears to be unintentional because the types '"GOLD"' and '"VIP"' have no overlap. (TS2367)
```

**왜 틀렸나**: `const`로 만든 `grade`는 TypeScript가 "영원히 `'GOLD'`"로 기억합니다. 그래서 `'VIP'`와 같을 수가 없는 비교라고 알려 줍니다. 실제 프로그램에서는 등급이 외부에서 들어오므로 이런 일이 드물지만, 연습 코드에서 자주 만납니다.

**고친 코드**: 값이 바뀔 수 있는 변수라는 것을 타입으로 알려 줍니다.

```ts
let grade: string = 'GOLD'
if (grade === 'VIP') {
  console.log('VIP')
} else {
  console.log('일반 혜택')
}
// 출력: 일반 혜택
```

## 직접 해 보기

### 문제 1. 짝수·홀수 판별 ⭐

`let orderNo = 1037`이 짝수면 `짝수 주문번호`, 홀수면 `홀수 주문번호`를 출력하세요. `%` 연산자를 씁니다.

::: details 정답 보기
```ts
let orderNo = 1037
if (orderNo % 2 === 0) {
  console.log('짝수 주문번호')
} else {
  console.log('홀수 주문번호')
}
// 출력: 홀수 주문번호
```
:::

### 문제 2. 배송비 계산 ⭐

주문 금액이 `50000`원 이상이면 배송비 `0`원, `30000`원 이상이면 `1500`원, 그 밖에는 `3000`원입니다. `let orderAmount = 35000`일 때 배송비를 출력하세요.

::: details 정답 보기
```ts
let orderAmount = 35000
let shippingFee = 0

if (orderAmount >= 50000) {
  shippingFee = 0
} else if (orderAmount >= 30000) {
  shippingFee = 1500
} else {
  shippingFee = 3000
}
console.log(shippingFee) // 출력: 1500
```

높은 기준(50000)부터 검사해야 합니다.
:::

### 문제 3. 영업 상태 안내 ⭐⭐

`let hour`와 `let isHoliday: boolean`으로 다음 규칙의 안내 문구를 출력하세요.

- 휴일이면 `휴무일입니다.`
- 휴일이 아니고 10시 이상 20시 미만이면 `영업 중`
- 그 밖에는 `영업 준비 중`

`hour = 15`, `isHoliday = false`일 때와 `isHoliday = true`일 때를 확인하세요.

::: details 정답 보기
```ts
let hour = 15
let isHoliday = false

if (isHoliday) {
  console.log('휴무일입니다.')
} else if (hour >= 10 && hour < 20) {
  console.log('영업 중')
} else {
  console.log('영업 준비 중')
}
// 출력: 영업 중
```

`isHoliday = true`로 바꾸면 시각과 상관없이 `휴무일입니다.`가 출력됩니다. 휴일 검사를 맨 앞에 두었기 때문입니다.
:::

### 문제 4. switch로 요일 안내 ⭐⭐

`let day: string = 'WED'`를 받아 `'MON'`~`'FRI'`면 `평일`, `'SAT'`·`'SUN'`이면 `주말`, 그 밖에는 `잘못된 요일`을 출력하세요. 비어 있는 `case`를 묶는 방법을 씁니다.

::: details 정답 보기
```ts
let day: string = 'WED'

switch (day) {
  case 'MON':
  case 'TUE':
  case 'WED':
  case 'THU':
  case 'FRI':
    console.log('평일')
    break
  case 'SAT':
  case 'SUN':
    console.log('주말')
    break
  default:
    console.log('잘못된 요일')
}
// 출력: 평일
```
:::

### 문제 5. 삼항 연산자로 바꾸기 ⭐⭐

다음 코드를 삼항 연산자를 써서 `const` 한 줄로 바꾸세요.

```ts
let age = 17
let ticketPrice = 0
if (age < 19) {
  ticketPrice = 8000
} else {
  ticketPrice = 12000
}
console.log(ticketPrice) // 출력: 8000
```

::: details 정답 보기
```ts
let age = 17
const ticketPrice = age < 19 ? 8000 : 12000
console.log(ticketPrice) // 출력: 8000
```

값을 고르는 두 갈래 선택이므로 삼항 연산자가 잘 맞습니다. 값이 다시 바뀌지 않으니 `const`로 쓸 수 있습니다.
:::

### 문제 6. 조기 반환으로 고치기 ⭐⭐⭐

다음 함수를 조기 반환 방식으로 다시 쓰세요. 동작(반환값)은 같아야 합니다.

```ts
function getRefundMessage(isPaid: boolean, daysAfterOrder: number, isOpened: boolean): string {
  if (isPaid) {
    if (daysAfterOrder <= 7) {
      if (!isOpened) {
        return '환불 가능'
      } else {
        return '개봉한 상품은 환불할 수 없습니다.'
      }
    } else {
      return '환불 기간(7일)이 지났습니다.'
    }
  } else {
    return '결제되지 않은 주문입니다.'
  }
}

console.log(getRefundMessage(true, 3, false)) // 출력: 환불 가능
console.log(getRefundMessage(true, 10, false)) // 출력: 환불 기간(7일)이 지났습니다.
```

::: details 정답 보기
```ts
function getRefundMessage(isPaid: boolean, daysAfterOrder: number, isOpened: boolean): string {
  if (!isPaid) {
    return '결제되지 않은 주문입니다.'
  }
  if (daysAfterOrder > 7) {
    return '환불 기간(7일)이 지났습니다.'
  }
  if (isOpened) {
    return '개봉한 상품은 환불할 수 없습니다.'
  }
  return '환불 가능'
}

console.log(getRefundMessage(true, 3, false)) // 출력: 환불 가능
console.log(getRefundMessage(true, 10, false)) // 출력: 환불 기간(7일)이 지났습니다.
console.log(getRefundMessage(true, 3, true)) // 출력: 개봉한 상품은 환불할 수 없습니다.
```

각 조건을 **뒤집어서**(`isPaid` → `!isPaid`, `<= 7` → `> 7`) 안 되는 경우를 먼저 걸러냈습니다. 정상 경로 `'환불 가능'`이 맨 아래에 남습니다.
:::

## 확인 퀴즈

**Q1.** `if` / `else if` / `else`에서 조건이 여러 개 참이면 어떤 블록이 실행되나요?

::: details 정답 보기
**위에서부터 처음으로 참인** 조건의 블록 하나만 실행됩니다. 나머지 조건은 검사하지 않습니다.
:::

**Q2.** 다음 중 falsy 값을 모두 고르세요: `0`, `'0'`, `''`, `' '`, `null`, `[]`, `NaN`, `'false'`

::: details 정답 보기
`0`, `''`, `null`, `NaN`입니다. `'0'`, `' '`, `'false'`는 비어 있지 않은 문자열이라 truthy, `[]`(빈 배열)도 truthy입니다.
:::

**Q3.** `switch`에서 `break`를 빠뜨리면 어떻게 되나요?

::: details 정답 보기
일치한 `case`부터 시작해, `break`를 만나거나 `switch`가 끝날 때까지 **아래 `case`들의 코드도 계속 실행**됩니다(폴스루).
:::

**Q4.** `switch`보다 `if`가 더 알맞은 경우는 언제인가요?

::: details 정답 보기
`>=`, `<` 같은 **범위 비교**가 필요하거나, 여러 변수를 섞은 복잡한 조건일 때입니다. `switch`는 하나의 값을 `===`로만 비교합니다.
:::

**Q5.** 조기 반환(early return)의 장점은 무엇인가요?

::: details 정답 보기
안 되는 경우를 먼저 `return`으로 걸러내서 **중첩(들여쓰기)이 줄고**, 정상 경로가 맨 아래에 남아 코드를 위에서 아래로 읽기 쉬워집니다.
:::

## 정리

- `if (조건) { }`은 조건이 참일 때만 블록을 실행하고, `else`는 그 반대, `else if`는 갈래를 늘립니다.
- 조건은 **위에서부터 차례로** 검사하고 **처음 참인 하나만** 실행합니다. 범위 조건은 좁은 것부터 씁니다.
- falsy 값은 `false`, `0`, `''`, `null`, `undefined`, `NaN` 여섯 가지. 숫자를 조건에 쓸 때는 `> 0`처럼 명확하게 씁니다.
- `switch`는 하나의 값을 `===`로 여러 경우와 비교합니다. **`break`를 빠뜨리면 아래로 흘러내립니다.**
- 두 값 중 하나를 고를 때는 삼항 연산자 `조건 ? A : B`. 겹쳐 쓰지 않습니다.
- 중첩이 깊어지면 **조기 반환**, 조건 합치기, 불리언 변수로 평평하게 만듭니다.

## 다음 단계

[반복문: for · while · for...of](./05-loops) — 같은 일을 여러 번 하는 법을 배웁니다. 장바구니에 담긴 상품의 합계를 구하고, 재고 목록에서 원하는 상품을 찾아봅니다.
