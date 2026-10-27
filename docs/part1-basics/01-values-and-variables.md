---
title: '값과 변수: let · const'
---

# 값과 변수: let · const

<LessonMeta level="입문" :minutes="40" prev="Node.js·VS Code를 설치하고 npx tsx로 첫 프로그램을 실행했습니다." />

## 이번에 배울 것

- 프로그램에서 **값**(value)이 무엇인지 설명할 수 있다.
- **변수**(variable)를 "이름표가 붙은 상자"로 이해하고 `let`·`const`로 만들 수 있다.
- `let`과 `const`의 차이를 알고, 언제 무엇을 쓸지 고를 수 있다.
- 옛날 방식인 `var`를 왜 쓰지 않는지 말할 수 있다.
- camelCase 규칙에 맞게 읽기 좋은 변수 이름을 지을 수 있다.

## 먼저 알아 둘 것

- 파일을 만들고 `npx tsx 파일이름.ts`로 실행하는 방법 ([첫 프로그램](../part0-start/05-first-program))
- 또는 설치 없이 [TS Playground](../part0-start/04-playground)에서 실행하는 방법
- `console.log(...)`가 괄호 안의 내용을 화면(터미널)에 찍어 준다는 것

## 비유로 이해하기

편의점 창고를 떠올려 봅시다. 창고에는 상자가 잔뜩 있고, 상자마다 **이름표**가 붙어 있습니다.

- "삼각김밥 재고"라는 이름표가 붙은 상자에는 숫자 `12`가 들어 있습니다.
- "점장 이름"이라는 상자에는 글자 `'김민지'`가 들어 있습니다.

직원은 상자를 열어 보지 않고도 이름표만 보고 "삼각김밥 재고 상자 가져와" 하고 부를 수 있습니다. 김밥이 팔리면 상자 안의 숫자를 `11`로 바꿔 넣습니다.

프로그래밍에서

- 상자 안에 든 것 = **값**(value)
- 이름표가 붙은 상자 = **변수**(variable)
- 상자에 처음 물건을 넣는 일 = **초기화**(initialization)
- 상자 안의 물건을 다른 것으로 바꾸는 일 = **재할당**(reassignment)

입니다. 그리고 어떤 상자는 **뚜껑을 테이프로 봉해 버려서** 한 번 넣은 물건을 바꿀 수 없습니다. 이것이 `const`입니다. 뚜껑을 열고 닫을 수 있는 상자는 `let`입니다.

## 개념 설명

### 값이란 무엇인가

**값**은 프로그램이 다루는 데이터 한 덩어리입니다. 몇 가지 예를 보겠습니다.

```ts
console.log(1500)          // 숫자 값
console.log('아메리카노')   // 글자(문자열) 값
console.log(true)          // 참/거짓 값
```

실행 결과:

```text
1500
아메리카노
true
```

- `1500`은 **숫자**(number)입니다.
- `'아메리카노'`처럼 따옴표로 감싼 글자는 **문자열**(string)입니다.
- `true`는 "참"을 뜻하는 **불리언**(boolean) 값입니다. 반대는 `false`입니다.

값의 종류를 **타입**(type, 자료형)이라고 부릅니다. 타입은 다음 레슨 [원시 타입](./02-primitive-types)에서 자세히 다룹니다. 지금은 "값마다 종류가 있다" 정도만 기억하면 됩니다.

### 왜 변수가 필요한가

아메리카노 2잔과 라떼 1잔의 합계를 계산한다고 해 봅시다.

```ts
console.log(4500 * 2 + 5000 * 1)
// 출력: 14000
```

결과는 맞지만, 이 코드만 보고 `4500`이 무엇인지, `5000`이 무엇인지 알 수 없습니다. 가격이 바뀌면 숫자가 등장하는 곳을 전부 찾아 고쳐야 합니다. 이렇게 의미를 알 수 없게 코드에 박혀 있는 숫자를 **매직 넘버**(magic number)라고 부르며, 실무에서 피해야 할 습관입니다.

변수를 쓰면 이렇게 바뀝니다.

```ts
const americanoPrice = 4500
const lattePrice = 5000
const americanoCount = 2
const latteCount = 1

const total = americanoPrice * americanoCount + lattePrice * latteCount
console.log(total)
// 출력: 14000
```

길어졌지만 **읽는 사람이 의미를 알 수 있고**, 가격이 바뀌면 한 줄만 고치면 됩니다. 변수의 가장 큰 쓸모는 이 두 가지입니다.

1. 값에 **이름을 붙여** 의미를 드러낸다.
2. 값을 **한 곳에 보관**하고 여러 곳에서 꺼내 쓴다.

### 변수 만들기: 선언과 할당

변수를 만드는 것을 **선언**(declaration)이라고 합니다. 선언한 변수에 값을 넣는 것을 **할당**(assignment)이라고 합니다.

```ts
let stock = 12
```

이 한 줄을 조각내 보면 다음과 같습니다.

| 조각 | 뜻 |
|---|---|
| `let` | "변수를 하나 만들겠다"는 **키워드**(keyword, 언어가 미리 정해 둔 특별한 단어) |
| `stock` | 변수 이름(이름표) |
| `=` | **할당 연산자**. "오른쪽 값을 왼쪽 상자에 넣어라"라는 뜻 |
| `12` | 넣을 값 |

::: warning `=`는 "같다"가 아닙니다
수학에서 `=`는 "양쪽이 같다"는 뜻이지만, 프로그래밍에서 `=` 하나는 **"오른쪽 값을 왼쪽에 넣어라"**는 명령입니다. 그래서 `stock = stock - 1`처럼 수학적으로는 말이 안 되는 식이 프로그래밍에서는 자연스럽습니다. "같은지 비교"하는 연산자는 `===`이며 [연산자](./03-operators) 레슨에서 배웁니다.
:::

### 재할당: 상자 안의 값 바꾸기

`let`으로 만든 변수는 나중에 값을 바꿀 수 있습니다. 이때는 `let`을 다시 쓰지 않습니다.

```ts
let stock = 12
console.log(stock) // 출력: 12

stock = 11         // 삼각김밥 1개 판매
console.log(stock) // 출력: 11

stock = stock - 3  // 3개 더 판매
console.log(stock) // 출력: 8
```

`stock = stock - 3`은 컴퓨터가 **오른쪽부터** 계산합니다.

1. 오른쪽 `stock - 3`을 계산합니다. 지금 `stock`은 `11`이므로 `11 - 3`, 즉 `8`이 됩니다.
2. 계산된 `8`을 왼쪽 `stock` 상자에 넣습니다.

### 메모리와 변수: 상자는 실제로 어디에 있나

컴퓨터에는 **메모리**(memory, RAM)라는 임시 저장 공간이 있습니다. 프로그램이 실행되는 동안 쓰는 값은 모두 메모리 어딘가에 놓입니다. 메모리는 번호(주소)가 붙은 아주 긴 칸막이 선반이라고 생각하면 됩니다.

```text
메모리 (아주 단순화한 그림)
┌───────────┬───────────┬───────────┬───────────┐
│ 주소 1001 │ 주소 1002 │ 주소 1003 │ 주소 1004 │
│    12     │ '김민지'  │   true    │   ...     │
└───────────┴───────────┴───────────┴───────────┘
      ▲           ▲
    stock     managerName   ← 변수 이름은 "그 칸을 가리키는 이름표"
```

사람은 "1001번 칸"을 기억하기 어렵기 때문에, 프로그래밍 언어가 `stock` 같은 **이름**으로 그 칸을 부를 수 있게 해 줍니다. 실제 주소는 JavaScript 엔진이 알아서 관리하므로 우리가 직접 다룰 일은 없습니다. 프로그램이 끝나면 메모리의 값은 모두 사라집니다. 값을 오래 보관하려면 파일이나 데이터베이스에 저장해야 하며, 이는 뒤 파트에서 다룹니다.

::: info 조금 더 정확히
실제로 JavaScript 엔진이 메모리를 쓰는 방식은 이 그림보다 훨씬 복잡합니다. 특히 객체·배열은 "값 자체"가 아니라 "값이 있는 위치"를 변수에 담는데, 이 차이는 [객체](./08-objects) 레슨의 얕은 복사 부분에서 중요하게 다룹니다.
:::

### const: 다시 넣을 수 없는 상자

`const`(constant, 상수)로 만든 변수는 **재할당할 수 없습니다.**

```ts
const storeName = '강남역점'
storeName = '역삼역점'
// ❌ Cannot assign to 'storeName' because it is a constant. (TS2588)
```

TypeScript는 이 코드를 실행하기도 전에 "상수에는 다시 넣을 수 없다"고 알려 줍니다. 실행해 보기 전에 실수를 잡아 주는 것, 이것이 TypeScript를 쓰는 이유입니다.

`const`는 선언할 때 **반드시 값을 넣어야** 합니다. 나중에 넣을 방법이 없기 때문입니다.

```ts
const taxRate
// ❌ 'const' declarations must be initialized. (TS1155)
// ❌ Variable 'taxRate' implicitly has an 'any' type. (TS7005)
```

에러가 두 개 나옵니다. 첫 번째가 핵심이고, 두 번째는 "값이 없으니 타입도 알 수 없다"는 뜻입니다. 이렇게 에러 하나가 다른 에러를 끌고 오는 일이 많으므로, **맨 위의 에러부터** 고치는 습관을 들이세요.

### let: 값이 바뀌는 변수

`let`은 선언만 먼저 하고 값은 나중에 넣을 수도 있습니다.

```ts
let memberGrade: string
memberGrade = 'VIP'
console.log(memberGrade) // 출력: VIP
```

여기서 `: string`은 "이 상자에는 문자열만 넣겠다"는 **타입 표기**(type annotation)입니다. 처음부터 값을 넣지 않으면 TypeScript가 어떤 종류의 값이 들어올지 알 수 없으므로 이렇게 적어 줍니다. 타입 표기는 [타입 표기와 타입 추론](../part2-types/01-annotation-inference)에서 자세히 다룹니다.

값을 넣기 전에 꺼내 쓰려고 하면 TypeScript가 막아 줍니다.

```ts
let memberGrade: string
console.log(memberGrade)
// ❌ Variable 'memberGrade' is used before being assigned. (TS2454)
```

### TypeScript가 타입을 알아서 정해 준다: 타입 추론 맛보기

`let stock = 12`처럼 처음에 숫자를 넣으면, TypeScript는 "이 상자는 숫자 상자구나" 하고 스스로 판단합니다. 이것을 **타입 추론**(type inference)이라고 합니다. 그래서 나중에 숫자가 아닌 값을 넣으려고 하면 막습니다.

```ts
let stock = 12
stock = '열두 개'
// ❌ Type 'string' is not assignable to type 'number'. (TS2322)
```

JavaScript에서는 이런 코드가 아무 경고 없이 실행됩니다. 그러다 나중에 `stock - 1`을 계산하면 엉뚱한 결과(`NaN`, "숫자가 아님"이라는 특별한 값)가 나옵니다. TypeScript는 이런 실수를 미리 막아 줍니다.

VS Code에서 변수 이름 위에 마우스를 올리면 TypeScript가 추론한 타입을 볼 수 있습니다. 예를 들어 `stock` 위에 올리면 `let stock: number`라고 보입니다. 꼭 한 번 해 보세요.

::: tip 추론에 맡기는 것이 기본
값을 바로 넣는 경우에는 `let stock: number = 12`처럼 타입을 직접 적지 않아도 됩니다. TypeScript가 알아서 추론하므로 오히려 적지 않는 편이 코드가 깔끔합니다. 타입을 적어야 할 때와 아닐 때는 Part 2에서 정리합니다.
:::

### const로 만든 변수의 타입은 조금 다르다

같은 값을 `const`로 만들면 VS Code에 다른 타입이 보입니다.

```ts
let paymentMethod = '카드'      // 마우스를 올리면: let paymentMethod: string
const defaultMethod = '카드'    // 마우스를 올리면: const defaultMethod: "카드"
```

`const`는 값이 절대 바뀌지 않으므로 TypeScript가 "이 변수는 정확히 `'카드'`라는 값"이라고 더 좁게 기억합니다. 이것을 **리터럴 타입**이라고 부르며 [유니온 타입과 리터럴 타입](../part2-types/06-union-literal)에서 배웁니다. 지금은 "const는 값이 고정이라 더 정확히 기억된다"만 알아 두면 됩니다.

### let과 const, 무엇을 쓸까

실무 규칙은 다음 한 줄입니다.

> **기본은 `const`. 값을 바꿔야 할 때만 `let`.**

이유는 다음과 같습니다.

- 코드를 읽는 사람이 `const`를 보면 "이 값은 끝까지 그대로구나" 하고 안심하고 읽을 수 있습니다.
- 실수로 값을 덮어쓰는 버그를 TypeScript가 막아 줍니다.
- 실제로 프로그램을 짜 보면 값이 바뀌는 변수는 생각보다 적습니다.

| | `const` | `let` |
|---|---|---|
| 재할당 | 불가 | 가능 |
| 선언 시 값 | 반드시 넣어야 함 | 나중에 넣어도 됨 |
| 언제 쓰나 | 거의 대부분 | 합계 누적, 반복 횟수 세기처럼 값이 바뀌어야 할 때 |

```ts
const unitPrice = 3000   // 단가: 바뀌지 않음 → const
const quantity = 4       // 수량: 바뀌지 않음 → const
let total = 0            // 합계: 계속 더해 나감 → let

total = total + unitPrice * quantity
total = total + 1500     // 배송비 추가
console.log(total)
// 출력: 13500
```

### var를 쓰지 않는 이유

인터넷의 오래된 예제에는 `var`로 변수를 만드는 코드가 많습니다.

```ts
var count = 1
console.log(count) // 출력: 1
```

`var`는 2015년 이전 JavaScript의 유일한 변수 선언 방법이었습니다. `let`과 `const`는 `var`의 문제를 고치려고 **ES2015**(ES6, 2015년에 나온 JavaScript 표준)에서 새로 생겼습니다. `var`의 대표적인 문제는 다음과 같습니다.

**문제 1. 같은 이름으로 또 선언해도 아무 말이 없습니다.**

```ts
var discount = 1000
var discount = 2000 // 오류 없이 앞의 값을 덮어씀
console.log(discount) // 출력: 2000
```

긴 파일에서 이미 쓰던 이름을 모르고 다시 선언하면, 앞의 값이 조용히 사라집니다. `let`·`const`는 같은 범위에서 같은 이름을 두 번 선언하면 바로 오류를 냅니다.

```ts
let discount = 1000
let discount = 2000
// ❌ Cannot redeclare block-scoped variable 'discount'. (TS2451)
```

**문제 2. 중괄호 `{ }` 블록을 무시하고 밖으로 새어 나갑니다.**

중괄호 `{ }`로 감싼 영역을 **블록**(block)이라고 합니다. 나중에 배울 `if`, `for`, 함수 모두 블록을 씁니다.

```ts
{
  var leaked = '블록 안에서 만든 값'
}
console.log(leaked) // 출력: 블록 안에서 만든 값  ← 블록 밖에서도 보임
```

같은 코드를 `let`으로 바꾸면 블록 밖에서 쓸 때 `Cannot find name 'leaked'. (TS2304)` 오류가 납니다. 이것이 정상입니다. 블록 안에서 잠깐 쓰려고 만든 변수가 밖으로 새면, 다른 코드와 이름이 부딪혀 버그가 생깁니다.

**문제 3. 선언하기 전에 써도 오류 대신 `undefined`(값이 없음을 뜻하는 특별한 값)가 나옵니다.** 이것은 호이스팅이라는 현상 때문이며, [스코프와 클로저](./10-scope-closure)에서 자세히 다룹니다.

결론: **`var`는 쓰지 않습니다.** 오래된 코드에서 `var`를 만나면 "옛날 방식이구나" 하고 읽을 수만 있으면 됩니다.

### 이름 짓기 규칙

변수 이름은 아무렇게나 지을 수 없습니다. 반드시 지켜야 하는 **문법 규칙**과, 지키면 좋은 **관례**가 있습니다.

#### 문법 규칙 (어기면 오류)

- 글자, 숫자, `_`(밑줄), `$`만 쓸 수 있습니다. 공백과 `-`(하이픈)은 쓸 수 없습니다.
- **숫자로 시작할 수 없습니다.** `1stPrice`는 안 되고 `firstPrice`는 됩니다.
- 언어가 이미 쓰는 **예약어**(`let`, `const`, `if`, `for`, `function`, `return`, `class` 등)는 이름으로 쓸 수 없습니다.
- **대소문자를 구분합니다.** `price`와 `Price`는 서로 다른 변수입니다.

```text
let 1stPrice = 1000    ← 숫자로 시작해서 안 됨
let unit-price = 1000  ← 하이픈은 빼기 기호로 해석되어 안 됨
let const = 1000       ← 예약어라서 안 됨
```

::: info 한글 변수 이름
`let 가격 = 1000`처럼 한글 이름도 문법상 허용됩니다. 하지만 협업·검색·도구 호환을 위해 실무에서는 **영어 이름**을 씁니다. 이 위키도 변수 이름은 영어로 씁니다.
:::

#### 관례: camelCase

여러 단어로 된 이름은 **camelCase**(카멜 케이스)로 씁니다. 첫 단어는 소문자로 시작하고, 이어지는 단어의 첫 글자만 대문자로 씁니다. 대문자가 낙타 혹처럼 솟아 있다고 해서 붙은 이름입니다.

| 표기법 | 예 | 쓰는 곳 |
|---|---|---|
| camelCase | `orderCount`, `totalPrice` | 변수·함수 이름 (기본) |
| PascalCase | `OrderItem`, `Product` | 타입·클래스 이름 (Part 2 이후) |
| UPPER_SNAKE_CASE | `MAX_QUANTITY`, `TAX_RATE` | 프로그램 전체에서 고정인 설정값 |
| snake_case | `order_count` | JS/TS에서는 잘 쓰지 않음 (DB 컬럼 이름 등에서 봄) |

#### 좋은 이름을 짓는 요령

- **무엇이 들었는지** 알 수 있게 짓습니다. `a`, `temp`, `data`보다 `orderCount`, `couponCode`가 낫습니다.
- 참/거짓 값은 `is`, `has`, `can`으로 시작하면 읽기 좋습니다. 예: `isMember`, `hasCoupon`, `canRefund`
- 개수는 `count`, 여러 개를 담는 것은 복수형으로 씁니다. 예: `itemCount`, `products`
- 너무 줄이지 않습니다. `qty`보다 `quantity`, `amt`보다 `amount`가 읽기 쉽습니다.

```ts
// 나쁜 예: 무엇인지 알 수 없음
const a = 3
const b = 2500
const c = a * b

// 좋은 예: 이름만 보고 의미를 알 수 있음
const quantity = 3
const unitPrice = 2500
const subtotal = quantity * unitPrice
console.log(c, subtotal) // 출력: 7500 7500
```

두 계산 결과는 같지만, 한 달 뒤에 다시 읽을 때 어느 쪽이 이해하기 쉬울지는 분명합니다.

### 여러 변수 함께 쓰기: 작은 영수증 만들기

지금까지 배운 것만으로도 간단한 계산 프로그램을 만들 수 있습니다. `receipt.ts` 파일을 만들고 실행해 보세요.

```ts
const storeName = '한빛 카페 강남점'
const menuName = '카페라떼'
const unitPrice = 5000
const quantity = 3
const couponDiscount = 1000

let total = unitPrice * quantity
total = total - couponDiscount

console.log('매장:', storeName)
console.log('메뉴:', menuName, 'x', quantity)
console.log('합계:', total, '원')
```

```bash
npx tsx receipt.ts
```

실행 결과:

```text
매장: 한빛 카페 강남점
메뉴: 카페라떼 x 3
합계: 14000 원
```

`console.log`에 쉼표 `,`로 여러 값을 넘기면 **공백 한 칸**으로 이어서 출력합니다. 글자와 변수를 더 깔끔하게 섞는 방법(템플릿 리터럴)은 [문자열](./09-strings) 레슨에서 배웁니다.

### 한 줄에 여러 개 선언하기 (참고)

쉼표로 한 줄에 여러 변수를 선언할 수도 있습니다.

```ts
let width = 10, height = 20
console.log(width * height) // 출력: 200
```

가능은 하지만 읽기가 어려워지므로, 이 위키에서는 **한 줄에 하나씩** 선언합니다.

## 자주 하는 실수

### 실수 1. const 변수에 다시 값을 넣기

```ts
const cartTotal = 0
cartTotal = cartTotal + 3000
// ❌ Cannot assign to 'cartTotal' because it is a constant. (TS2588)
```

**왜 틀렸나**: 합계처럼 계속 바뀌어야 하는 값을 `const`로 만들었습니다.

**고친 코드**: 값이 바뀌어야 하므로 `let`을 씁니다.

```ts
let cartTotal = 0
cartTotal = cartTotal + 3000
console.log(cartTotal) // 출력: 3000
```

### 실수 2. 재할당할 때 let을 또 쓰기

```ts
let point = 100
let point = point + 50
// ❌ Cannot redeclare block-scoped variable 'point'. (TS2451)
```

**왜 틀렸나**: `let`은 "새 상자를 만든다"는 뜻입니다. 이미 있는 상자에 값을 바꿔 넣을 때는 `let` 없이 이름만 씁니다.

**고친 코드**:

```ts
let point = 100
point = point + 50
console.log(point) // 출력: 150
```

### 실수 3. 처음에 넣은 값과 다른 종류의 값을 넣기

```ts
let orderNo = 1001
orderNo = 'A-1001'
// ❌ Type 'string' is not assignable to type 'number'. (TS2322)
```

**왜 틀렸나**: 처음에 숫자를 넣었으므로 TypeScript는 `orderNo`를 숫자 상자로 추론했습니다. 같은 상자에 문자열을 넣을 수 없습니다.

**고친 코드**: 주문 번호가 글자를 포함한다면 처음부터 문자열로 만듭니다.

```ts
let orderNo = 'A-1001'
orderNo = 'A-1002'
console.log(orderNo) // 출력: A-1002
```

### 실수 4. 대소문자를 다르게 쓰기

```ts
const totalPrice = 9000
console.log(totalprice)
// ❌ Cannot find name 'totalprice'. Did you mean 'totalPrice'? (TS2552)
```

**왜 틀렸나**: `totalPrice`와 `totalprice`는 다른 이름입니다. TypeScript가 "혹시 `totalPrice`를 말한 건가요?"라고 제안까지 해 줍니다.

**고친 코드**:

```ts
const totalPrice = 9000
console.log(totalPrice) // 출력: 9000
```

### 실수 5. `name` 같은 이름이 이미 있다고 나올 때

```ts
const name = '김민지'
// ❌ Cannot redeclare block-scoped variable 'name'. (TS2451)
```

**왜 틀렸나**: 파일에 `import`나 `export`가 하나도 없으면, TypeScript는 그 파일을 "전역 스크립트"로 봅니다. 그런데 웹 브라우저 환경 정보(DOM)에는 이미 `name`, `status` 같은 전역 변수가 정의되어 있어서 이름이 부딪힙니다. 프로젝트 설정에 따라 오류가 나지 않을 수도 있지만, 처음 만나면 당황스러운 오류입니다.

**고친 코드**: 더 구체적인 이름을 쓰는 것이 가장 좋습니다. 또는 파일 맨 끝에 `export {}`를 한 줄 추가해 이 파일을 독립된 **모듈**(module)로 만들면 해결됩니다. 모듈은 [모듈](../part3-intermediate/09-modules) 레슨에서 배웁니다.

```ts
const customerName = '김민지'
console.log(customerName) // 출력: 김민지
```

## 직접 해 보기

### 문제 1. 매장 정보 출력하기 ⭐

`const`로 매장 이름(`storeName`), 개점 연도(`openYear`), 직원 수(`staffCount`) 변수를 만들고 각각 `console.log`로 출력하세요. 값은 자유롭게 정합니다.

::: details 정답 보기
```ts
const storeName = '한빛 마트 역삼점'
const openYear = 2021
const staffCount = 7

console.log(storeName)
console.log(openYear)
console.log(staffCount)
```

출력:

```text
한빛 마트 역삼점
2021
7
```

세 값 모두 바뀌지 않으므로 `const`를 씁니다.
:::

### 문제 2. 재고 차감하기 ⭐

초기 재고가 `50`개인 상품이 오전에 `12`개, 오후에 `9`개 팔렸습니다. `let`을 써서 재고 변수를 두 번 갱신하고 최종 재고를 출력하세요.

::: details 정답 보기
```ts
let stock = 50
stock = stock - 12 // 오전 판매
stock = stock - 9  // 오후 판매
console.log('남은 재고:', stock)
// 출력: 남은 재고: 29
```
:::

### 문제 3. 이름 고치기 ⭐

아래 변수 이름들을 camelCase 규칙과 "의미가 드러나는 이름" 요령에 맞게 고치세요.

```text
order_count   →  ?
Price         →  ?
x (회원 여부)  →  ?
dlvFee        →  ?
```

::: details 정답 보기
```text
order_count   →  orderCount
Price         →  price        (변수는 소문자로 시작)
x (회원 여부)  →  isMember     (참/거짓 값은 is로 시작)
dlvFee        →  deliveryFee  (줄이지 않고 풀어 씀)
```
:::

### 문제 4. 장바구니 합계 ⭐⭐

장바구니에 다음 상품이 담겼습니다.

- 생수 900원 × 6개
- 컵라면 1300원 × 4개
- 바나나우유 1700원 × 2개

단가와 수량을 모두 `const` 변수로 만들고, 합계를 `const total`에 계산해 `합계: (금액) 원` 형식으로 출력하세요.

::: details 정답 보기
```ts
const waterPrice = 900
const waterCount = 6
const ramenPrice = 1300
const ramenCount = 4
const milkPrice = 1700
const milkCount = 2

const total = waterPrice * waterCount + ramenPrice * ramenCount + milkPrice * milkCount
console.log('합계:', total, '원')
// 출력: 합계: 14000 원
```

5400 + 5200 + 3400 = 14000원입니다. 합계를 한 번에 계산하므로 `const`로 충분합니다.
:::

### 문제 5. 포인트 적립과 사용 ⭐⭐

회원의 포인트가 `3000`점에서 시작합니다. 아래 순서대로 포인트를 바꾸고, 단계마다 현재 포인트를 출력하세요.

1. 구매 금액 `25000`원의 1%를 적립 (`25000 * 0.01`)
2. `2000`점 사용
3. 이벤트로 `500`점 추가 적립

::: details 정답 보기
```ts
const purchaseAmount = 25000
let point = 3000
console.log('시작:', point)

point = point + purchaseAmount * 0.01
console.log('적립 후:', point)

point = point - 2000
console.log('사용 후:', point)

point = point + 500
console.log('이벤트 후:', point)
```

출력:

```text
시작: 3000
적립 후: 3250
사용 후: 1250
이벤트 후: 1750
```

구매 금액은 바뀌지 않으므로 `const`, 포인트는 계속 바뀌므로 `let`입니다.
:::

### 문제 6. 오류 고치기 ⭐⭐⭐

아래 코드에는 문제가 4군데 있습니다. TypeScript 에러 메시지를 보며 모두 고치세요.

```text
const shopName = '강남점'
let visitCount
const 2ndFloor = true
visitCount = 10
shopName = '역삼점'
let visitCount = visitCount + 1
console.log(shopName, visitCount)
```

::: details 정답 보기
1. `let visitCount`는 타입도 값도 없습니다. TypeScript가 타입을 제대로 알 수 없으므로 `let visitCount = 0`처럼 값을 넣거나 `let visitCount: number`로 타입을 적는 것이 좋습니다.
2. `2ndFloor`는 숫자로 시작하므로 이름으로 쓸 수 없습니다. `isSecondFloor`로 고칩니다.
3. `shopName`은 `const`라 재할당할 수 없습니다. 매장 이름이 바뀌어야 한다면 `let`으로 선언합니다.
4. `let visitCount = ...`는 같은 이름을 다시 선언합니다. `let`을 지웁니다.

```ts
let shopName = '강남점'
let visitCount = 0
const isSecondFloor = true
visitCount = 10
shopName = '역삼점'
visitCount = visitCount + 1
console.log(shopName, visitCount, isSecondFloor)
// 출력: 역삼점 11 true
```
:::

## 확인 퀴즈

**Q1.** `let`과 `const`의 가장 큰 차이는 무엇인가요?

::: details 정답 보기
`const`는 재할당할 수 없고, `let`은 재할당할 수 있습니다. 또 `const`는 선언할 때 반드시 값을 넣어야 합니다.
:::

**Q2.** 실무에서 기본으로 쓰는 선언 키워드는 무엇이고, 그 이유는 무엇인가요?

::: details 정답 보기
`const`입니다. 값이 바뀌지 않는다는 것이 보장되어 코드를 읽기 쉽고, 실수로 값을 덮어쓰는 버그를 막을 수 있습니다. 값이 바뀌어야 할 때만 `let`을 씁니다.
:::

**Q3.** 다음 중 변수 이름으로 쓸 수 **없는** 것을 모두 고르세요: `totalPrice`, `3days`, `_count`, `order-no`, `$price`, `return`

::: details 정답 보기
`3days`(숫자로 시작), `order-no`(하이픈 사용), `return`(예약어)입니다.
:::

**Q4.** `let stock = 5` 다음 줄에서 `stock = '없음'`을 쓰면 왜 오류가 나나요?

::: details 정답 보기
처음에 숫자 `5`를 넣었으므로 TypeScript가 `stock`의 타입을 `number`로 추론했습니다. 숫자 상자에 문자열을 넣을 수 없으므로 `Type 'string' is not assignable to type 'number'.` 오류가 납니다.
:::

**Q5.** `var`를 쓰지 않는 이유를 두 가지 말해 보세요.

::: details 정답 보기
같은 이름으로 다시 선언해도 오류 없이 덮어쓰고, 중괄호 블록 밖으로 변수가 새어 나갑니다. (선언 전에 써도 오류 대신 `undefined`가 나오는 문제도 있습니다.)
:::

## 정리

- **값**은 프로그램이 다루는 데이터이고, **변수**는 값을 담는 이름표 붙은 상자입니다.
- `=`는 "같다"가 아니라 "오른쪽 값을 왼쪽 변수에 넣어라"라는 뜻입니다.
- `const`는 재할당 불가, `let`은 재할당 가능. **기본은 `const`, 바뀌어야 할 때만 `let`**.
- `var`는 블록을 무시하고 중복 선언을 허용하는 등 문제가 많아 쓰지 않습니다.
- TypeScript는 처음 넣은 값을 보고 변수의 타입을 **추론**하고, 다른 종류의 값이 들어오면 막아 줍니다.
- 변수 이름은 camelCase로, 무엇이 들었는지 드러나게 짓습니다.

## 다음 단계

[원시 타입: number · string · boolean · null · undefined](./02-primitive-types) — 상자에 담기는 값에는 어떤 종류가 있는지, 그리고 `0.1 + 0.2`가 왜 `0.3`이 아닌지 알아봅니다.
