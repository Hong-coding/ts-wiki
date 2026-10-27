---
title: 에러 메시지 읽는 법과 도움 받는 법
---

# 에러 메시지 읽는 법과 도움 받는 법

<LessonMeta level="입문" :minutes="30" prev="npx tsc로 컴파일하고 node·tsx로 실행했으며, 일부러 타입 에러를 내 봤습니다." />

## 이번에 배울 것

- tsc 에러 메시지를 `파일:줄:칸`, 에러 코드, 메시지, 들여쓴 상세 줄로 나누어 읽을 수 있다.
- 자주 나오는 영어 표현(`is not assignable to`, `does not exist on type`, `possibly 'undefined'` 등)을 우리말로 해석할 수 있다.
- **컴파일 에러**와 **런타임 에러**(`TypeError` 등)의 차이를 설명할 수 있다.
- 검색이나 AI에게 질문할 때 재현 코드·에러 전문·환경 정보를 갖추고, 회사 정보를 지워서 질문할 수 있다.
- 공식 문서에서 필요한 내용을 찾아볼 수 있다.

## 먼저 알아 둘 것

- [첫 프로그램](./05-first-program): `npx tsc`, `npx tsc --noEmit`, `npx tsx`로 검사·실행하는 방법
- 영어를 잘하지 못해도 괜찮습니다. 에러 메시지에 나오는 영어는 **패턴이 정해져 있어서** 표현 열 개 정도만 익히면 대부분 읽을 수 있습니다.

## 비유로 이해하기

### 택배 반송 쪽지

택배가 반송되면 상자에 쪽지가 붙어 옵니다.

```text
[반송] 서울시 강남구 ○○로 12, 3층
사유 코드: A-07
주소 불명 - 해당 건물에 3층이 없습니다.
  (참고: 건물은 2층까지 있음)
```

- **어디서** 문제가 났는지(주소)
- **어떤 종류**의 문제인지(사유 코드)
- **무엇이** 문제인지(설명)
- **왜** 그런지 덧붙인 참고(들여쓴 줄)

TypeScript 에러 메시지도 정확히 이 구조입니다. 반송 쪽지를 보고 "택배가 안 왔다"고만 말하는 사람은 없습니다. 쪽지를 읽으면 주소를 고치면 된다는 것을 압니다. 에러 메시지도 **읽기만 하면 고칠 곳이 보이는 쪽지**입니다. 에러는 나를 혼내는 것이 아니라, 실행하기 전에 문제를 찾아 준 **고마운 안내문**입니다.

## 개념 설명

### 에러 메시지 해부하기

[지난 레슨](./05-first-program)에서 본 에러를 다시 가져오겠습니다.

```text
hello.ts:2:7 - error TS2322: Type 'string' is not assignable to type 'number'.

2 const visitCount: number = '세 번'
        ~~~~~~~~~~


Found 1 error in hello.ts:2
```

조각조각 나눠 보면 다음과 같습니다.

```text
hello.ts : 2 : 7  -  error  TS2322 :  Type 'string' is not assignable to type 'number'.
└──┬───┘  ┬   ┬      └─┬─┘  └─┬──┘    └──────────────────────┬────────────────────────┘
  파일    줄  칸      심각도  에러 코드                    메시지(무엇이 문제인가)
```

| 조각 | 뜻 | 어떻게 쓰나 |
|---|---|---|
| `hello.ts` | 문제가 난 **파일** | 그 파일을 엽니다. |
| `2` | **줄** 번호(1부터 셈) | VS Code 오른쪽 아래 상태 표시줄의 `줄 2, 열 7`(`Ln 2, Col 7`)로 확인합니다. |
| `7` | **칸**(열) 번호(1부터 셈) | 그 줄 앞에서부터 7번째 글자입니다. `const `(공백 포함 6글자) 다음, 변수 이름 시작점입니다. |
| `error` | 심각도 | tsc는 대부분 `error`입니다. |
| `TS2322` | **에러 코드** | 에러 종류마다 붙은 고유 번호입니다. 검색할 때 가장 유용합니다. |
| 메시지 | 무엇이 문제인가 | 아래 "해석표"로 읽습니다. |
| `2 const ...` | 문제가 된 **줄 원문** | 앞의 `2`는 줄 번호입니다. |
| `~~~~~~~~~~` | 물결표(밑줄) | 정확히 **어느 부분**이 문제인지 가리킵니다. |
| `Found 1 error` | 에러 개수 요약 | 에러가 여러 파일에 있으면 파일별 개수 표도 나옵니다. |

::: tip VS Code에서 바로 이동하기
VS Code 터미널에서 `hello.ts:2:7` 부분에 마우스를 올리고 `Ctrl`을 누른 채 클릭하면, 그 파일의 2번째 줄 7번째 칸으로 바로 이동합니다.
:::

#### 다른 모양의 같은 에러

같은 에러가 도구에 따라 조금 다른 모양으로 보일 수 있습니다. 내용은 같으니 놀라지 마세요.

| 보이는 곳 | 모양 |
|---|---|
| 터미널의 `npx tsc` | `hello.ts:2:7 - error TS2322: Type 'string' is ...` |
| 색이 없는 환경(자동 빌드 서버 로그 등) | `hello.ts(2,7): error TS2322: Type 'string' is ...` |
| VS Code 말풍선 | `Type 'string' is ... ts(2322)` |
| TS Playground 말풍선 | `Type 'string' is ... (2322)` |

모두 **위치 + 코드 2322 + 같은 메시지**입니다.

### 실제 에러 예제 네 가지

아래는 모두 `strict`를 켠 상태에서 `npx tsc`가 실제로 출력한 메시지입니다. 예제에 나오는 `type Product = { ... }`는 "상품은 이름(`name`, 문자열)과 가격(`price`, 숫자)을 가진다"는 **타입 정의**입니다. 문법은 Part 2에서 배우니, 지금은 "상품의 모양을 정해 둔 것"으로 읽으면 됩니다.

#### 예제 1. 이름을 잘못 썼다 — TS2339

```ts
type Product = {
  name: string
  price: number
}

const americano: Product = { name: '아메리카노', price: 4500 }
console.log(americano.nmae)
// ❌ Property 'nmae' does not exist on type 'Product'. (TS2339)
```

```text
e1.ts:7:23 - error TS2339: Property 'nmae' does not exist on type 'Product'.

7 console.log(americano.nmae)
                        ~~~~
```

**읽는 법**: "속성(property) `nmae`는 `Product` 타입에 존재하지 않는다." 물결표가 `nmae`를 가리킵니다. `Product`에는 `name`과 `price`만 있으므로 오타입니다. `name`으로 고칩니다.

#### 예제 2. 들여쓴 상세 줄이 있는 에러 — TS2322

```ts
type Product = {
  name: string
  price: number
}

const raw = { name: '라떼', price: '5000' }
const latte: Product = raw
// ❌ Type '{ name: string; price: string; }' is not assignable to type 'Product'. (TS2322)
```

```text
e2.ts:7:7 - error TS2322: Type '{ name: string; price: string; }' is not assignable to type 'Product'.
  Types of property 'price' are incompatible.
    Type 'string' is not assignable to type 'number'.

7 const latte: Product = raw
        ~~~~~
```

메시지가 세 줄이고, 아래로 갈수록 **두 칸씩 더 들여쓰여** 있습니다. 이 들여쓰기는 "**왜냐하면**"이라는 뜻입니다.

```text
{ name: string; price: string; } 타입은 Product에 넣을 수 없다.
  왜냐하면 → price 속성의 타입이 서로 맞지 않는데,
    왜냐하면 → string은 number에 넣을 수 없기 때문이다.
```

**핵심 원인은 가장 깊이 들여쓴 마지막 줄**에 있는 경우가 많습니다. 긴 에러를 만나면 **맨 위 줄로 "무엇이"를, 맨 아래 줄로 "왜"를** 읽으세요. 여기서는 `price: '5000'`을 `price: 5000`으로 고치면 됩니다.

#### 예제 3. 다른 위치를 참고하라는 에러 — TS2554

```ts
function calcTotal(price: number, quantity: number): number {
  return price * quantity
}

console.log(calcTotal(4500))
// ❌ Expected 2 arguments, but got 1. (TS2554)
```

```text
e1.ts:5:13 - error TS2554: Expected 2 arguments, but got 1.

5 console.log(calcTotal(4500))
              ~~~~~~~~~

  e1.ts:1:35
    1 function calcTotal(price: number, quantity: number): number {
                                        ~~~~~~~~~~~~~~~~
    An argument for 'quantity' was not provided.
```

**읽는 법**: "인수(argument, 함수를 부를 때 넘기는 값)를 2개 기대했는데 1개를 받았다." 그 아래 들여쓴 덩어리는 **관련된 다른 위치**(`e1.ts:1:35`)를 보여 주며 "`quantity`에 해당하는 인수가 전달되지 않았다"고 덧붙입니다. 즉 "문제는 5번째 줄이고, 근거는 1번째 줄의 함수 정의"라는 뜻입니다. `calcTotal(4500, 2)`처럼 수량을 넘깁니다. 함수는 [함수 기초](../part1-basics/06-functions)에서 배웁니다.

#### 예제 4. 값이 없을 수도 있다 — TS18048

```ts
type Product = {
  name: string
  price: number
}

const products: Product[] = [{ name: '아메리카노', price: 4500 }]
const found = products.find((p) => p.name === '라떼')
console.log(found.price)
// ❌ 'found' is possibly 'undefined'. (TS18048)
```

```text
e1.ts:8:13 - error TS18048: 'found' is possibly 'undefined'.

8 console.log(found.price)
              ~~~~~
```

**읽는 법**: "`found`는 `undefined`(값이 없음)일 **수도** 있다." `products.find(...)`는 목록에서 조건에 맞는 상품을 찾는데, **못 찾으면 `undefined`를 돌려줍니다.** 실제로 목록에 `'라떼'`가 없으므로 이 코드를 그대로 실행하면 프로그램이 멈춥니다(아래 "런타임 에러"에서 확인합니다). 찾았는지 먼저 확인하도록 고칩니다.

```ts
if (found) {
  console.log(found.price)
} else {
  console.log('상품을 찾지 못했습니다.')
}
// 출력: 상품을 찾지 못했습니다.
```

`if`는 [조건문](../part1-basics/04-conditionals)에서 배웁니다.

### 에러가 여러 개일 때: 맨 위부터

에러가 한꺼번에 여러 개 나오면 겁이 납니다. 하지만 에러 하나가 다른 에러를 줄줄이 끌고 오는 경우가 많습니다. 예를 들어 괄호 하나를 빼먹으면,

```ts
const price = 1000
console.log(price
// ❌ ')' expected. (TS1005)
```

```text
e4.ts:3:1 - error TS1005: ')' expected.
```

"`)`가 와야 하는데 없다"는 **문법 에러**(syntax error, 코드의 모양 자체가 틀린 에러)가 나옵니다. 위치가 3번째 줄 1번째 칸(파일 끝)으로 나오는 것은, 컴파일러가 끝까지 `)`를 기다리다가 못 찾았기 때문입니다. 문법 에러가 있으면 다른 검사가 제대로 되지 않으므로 **문법 에러를 가장 먼저** 고칩니다.

순서를 정리하면,

1. **맨 위 에러부터** 하나씩 고치고, 고칠 때마다 다시 검사합니다.
2. `')' expected`, `';' expected`처럼 **문법 에러**(대개 `TS1xxx` 번호)가 있으면 그것부터 고칩니다.
3. 에러 수가 갑자기 많이 늘었다면, **방금 고친 곳**을 의심합니다.

### 자주 나오는 영어 표현 해석표

에러 메시지의 영어는 몇 가지 패턴의 반복입니다. 아래 표의 `X`, `Y`, `N` 자리에는 실제 이름·타입·숫자가 들어갑니다.

| 영어 표현 | 우리말 뜻 | 대표 코드 | 흔한 원인 |
|---|---|---|---|
| Type `X` is not assignable to type `Y` | `X` 타입 값은 `Y` 타입 자리에 넣을 수 없다 | TS2322 | 숫자 자리에 문자열, 따옴표 실수 |
| Argument of type `X` is not assignable to parameter of type `Y` | 함수에 넘긴 값(`X`)이 매개변수 타입(`Y`)과 맞지 않다 | TS2345 | 함수 호출 시 값 종류 실수 |
| Property `X` does not exist on type `Y` | `Y` 타입에는 `X`라는 속성이 없다 | TS2339 | 오타, 없는 속성 사용 |
| Property `X` is missing in type `A` but required in type `B` | `B`에 꼭 있어야 하는 `X`가 빠졌다 | TS2741 | 객체에 필수 항목 누락 |
| `X` is possibly 'undefined' | `X`가 `undefined`일 수도 있다 | TS18048 | 못 찾을 수 있는 값을 확인 없이 사용 |
| `X` is possibly 'null' | `X`가 `null`일 수도 있다 | TS18047 | 비어 있을 수 있는 값을 확인 없이 사용 |
| Expected `N` arguments, but got `M` | 인수를 `N`개 기대했는데 `M`개를 받았다 | TS2554 | 함수에 값을 덜 넘기거나 더 넘김 |
| Cannot find name `X` | `X`라는 이름을 찾을 수 없다 | TS2304 | 오타, 선언하지 않은 변수 |
| Cannot find name `X`. Did you mean `Y`? | `X`가 없는데, 혹시 `Y`를 말한 건가? | TS2552 | 대소문자·오타 |
| Cannot assign to `X` because it is a constant | `X`는 상수(`const`)라서 다시 넣을 수 없다 | TS2588 | `const` 변수 재할당 |
| Cannot redeclare block-scoped variable `X` | 같은 범위에 `X`를 또 선언했다 | TS2451 | `let`을 두 번 씀 |
| Parameter `X` implicitly has an 'any' type | 매개변수 `X`의 타입이 정해지지 않았다 | TS7006 | 함수 매개변수에 타입 표기 누락 |
| Variable `X` is used before being assigned | 값을 넣기 전에 `X`를 썼다 | TS2454 | 선언만 하고 값 없이 사용 |
| This comparison appears to be unintentional because the types `X` and `Y` have no overlap | 두 타입이 겹치지 않아 비교가 항상 거짓이다 | TS2367 | 있을 수 없는 값과 비교 |
| `X` expected | `X`(기호)가 와야 하는데 없다 | TS1005 | 괄호·쉼표·따옴표 누락 |

자주 나오는 단어도 몇 개 알아 두면 편합니다.

| 단어 | 뜻 |
|---|---|
| assignable | 넣을 수 있는, 할당 가능한 |
| property | 속성 (객체 안의 항목) |
| argument / parameter | 인수(부를 때 넘기는 값) / 매개변수(함수가 받는 변수) |
| implicitly | 암묵적으로, 저절로 (내가 적지 않았는데) |
| possibly | ~일 수도 있는 |
| expected | 기대했다, 와야 한다 |
| declared | 선언된 |
| incompatible | 서로 맞지 않는 |
| overlap | 겹침 |

에러 코드별로 원인과 해결법을 더 자세히 정리한 [자주 만나는 컴파일 에러 사전](../part9-master/01-error-dictionary)도 있습니다. 공부하다가 낯선 코드를 만나면 그 페이지에서 번호로 찾아보세요.

### 컴파일 에러와 런타임 에러

에러에는 **언제 발견되느냐**에 따라 두 종류가 있습니다.

| | 컴파일 에러 | 런타임 에러 |
|---|---|---|
| 누가 찾나 | TypeScript 컴파일러(tsc, VS Code) | 실행 중인 JavaScript 엔진(Node.js, 브라우저) |
| 언제 | **실행하기 전**, 코드를 쓰는 동안 | **실행하는 도중** |
| 모양 | `error TS2322: ...` | `TypeError: ...`, `ReferenceError: ...` |
| 결과 | 프로그램은 아직 실행 전이라 피해 없음 | 프로그램이 그 자리에서 멈춤 |

예제 4의 코드를 타입 검사 없이(`npx tsx`나 Playground의 Run으로) 실행하면 이렇게 됩니다.

```text
C:\Users\minji\ts-study\hello-ts\find.js:3
console.log(found.price)
                  ^

TypeError: Cannot read properties of undefined (reading 'price')
    at Object.<anonymous> (C:\Users\minji\ts-study\hello-ts\find.js:3:19)
    at Module._compile (node:internal/modules/cjs/loader:1804:14)
    ... (이하 생략)

Node.js v24.13.1
```

런타임 에러 메시지도 구조가 있습니다.

1. **맨 위**: 에러가 난 파일과 줄(`find.js:3`), 그 줄 원문, `^`로 가리킨 위치
2. **에러 종류와 메시지**: `TypeError: Cannot read properties of undefined (reading 'price')` — "`undefined`의 속성 `price`를 읽을 수 없다". 값이 없는데 속성을 꺼내려 했다는 뜻입니다.
3. **스택 트레이스**(stack trace, `at ...`로 시작하는 줄들): 에러에 이르기까지 거쳐 온 길입니다. **맨 위 `at` 줄이 내 코드**이고, `node:internal`로 시작하는 줄은 Node.js 내부라서 대부분 무시해도 됩니다.

자주 보는 런타임 에러 종류는 다음과 같습니다.

| 종류 | 뜻 | 예 |
|---|---|---|
| `TypeError` | 값의 종류에 맞지 않는 동작을 했다 | `undefined`의 속성 읽기, 함수가 아닌 것을 호출 |
| `ReferenceError` | 없는 이름을 썼다 | `x is not defined` |
| `SyntaxError` | 코드 모양이 틀렸다 | 괄호 짝이 안 맞음 |
| `RangeError` | 허용 범위를 벗어난 값 | 너무 깊은 재귀, 잘못된 길이 |

TypeScript는 이런 런타임 에러의 상당수를 **컴파일 에러로 미리** 바꿔서 알려 줍니다. 예제 4에서 `TS18048`이 미리 경고해 준 덕분에, 실행해서 멈추기 전에 고칠 수 있었습니다. 그래서 **컴파일 에러는 런타임 에러를 예방하는 기회**입니다. 반대로 외부에서 들어오는 데이터처럼 TypeScript가 미리 알 수 없는 것은 여전히 런타임 에러가 날 수 있습니다. 이 문제는 [런타임 검증](../part4-async/05-runtime-validation)에서 다룹니다.

### 도움 받는 법 1: 검색하기

혼자 해결이 안 되면 검색합니다. 검색어는 이렇게 만듭니다.

1. **에러 코드 + 메시지의 고정된 부분**을 씁니다. 내 변수 이름(`visitCount`)이나 내 타입 이름(`Product`)은 빼야 남의 글과 겹칩니다.

```text
좋은 검색어:   TS2322 is not assignable to type
좋은 검색어:   typescript "is possibly 'undefined'"
나쁜 검색어:   visitCount 에러 안돼요
```

2. 기술 문서는 **영어 검색 결과가 훨씬 많습니다.** 에러 메시지 원문 그대로 검색하세요.
3. 결과를 볼 때는 **날짜와 버전**을 확인합니다. 몇 년 전 글은 지금과 설정이나 동작이 다를 수 있습니다.
4. 검색 결과에서 `// @ts-ignore`(다음 줄의 에러를 무시하라)나 `as any`(타입 검사를 끄라)로 "해결"하라는 답을 자주 봅니다. 이것은 에러를 **고친 것이 아니라 숨긴 것**입니다. 처음 배울 때는 쓰지 않습니다.

### 도움 받는 법 2: AI나 동료에게 질문하기

AI 도우미나 선배에게 질문할 때, 질문의 품질이 답의 품질을 결정합니다. 좋은 질문에는 네 가지가 들어 있습니다.

| 요소 | 왜 필요한가 |
|---|---|
| **재현 가능한 최소 코드** | 받은 사람이 그대로 실행해서 같은 에러를 볼 수 있어야 정확한 답이 나옵니다. 문제와 상관없는 코드는 지웁니다. |
| **에러 전문** | 요약하지 말고 한 글자도 바꾸지 않은 원문을 붙입니다. 에러 코드, 위치, 들여쓴 상세 줄까지 전부입니다. |
| **환경 정보** | TypeScript 버전(`npx tsc -v`), Node.js 버전(`node -v`), 운영체제, 어떤 명령으로 실행했는지 |
| **기대한 것과 실제 결과** | "무엇을 하려 했고, 무엇이 대신 일어났는지", 그리고 이미 해 본 것 |

질문 예시:

````text
TypeScript에서 TS18048 에러가 나는데 원인을 모르겠습니다.

[하려던 것]
상품 목록에서 이름으로 상품을 찾아 가격을 출력하려고 합니다.

[최소 재현 코드]
```ts
type Product = { name: string; price: number }
const products: Product[] = [{ name: '상품A', price: 1000 }]
const found = products.find((p) => p.name === '상품B')
console.log(found.price)
```

[에러 전문]
test.ts:4:13 - error TS18048: 'found' is possibly 'undefined'.

[환경]
TypeScript 7.0.2, Node.js v24.13.1, Windows 11, `npx tsc --noEmit`으로 검사

[해 본 것]
found 뒤에 느낌표(!)를 붙이면 에러가 사라지는데, 이게 맞는 방법인지 궁금합니다.
````

::: danger 질문하기 전에 회사 정보를 지우세요
회사 코드를 그대로 붙여 넣지 마세요. 특히 AI 서비스나 공개 커뮤니티에 올리는 내용은 외부로 나가는 것과 같습니다.

- **지울 것**: 회사·고객사 이름, 실제 서비스 이름, 서버 주소(IP·도메인), 비밀번호·API 키·토큰, 고객 이름·전화번호 같은 개인정보, 실제 매출·주문 데이터, 내부 시스템 구조를 짐작할 수 있는 이름
- **바꿀 것**: 이름은 `Product`, `상품A`처럼 일반적인 것으로, 값은 `1000` 같은 가짜 값으로
- **확인할 것**: 회사마다 외부 AI 사용 규칙이 있습니다. 사내에서 허용된 도구인지 먼저 확인하세요.

최소 재현 코드를 새로 쓰다 보면 **질문하기 전에 스스로 원인을 찾는 경우**도 많습니다. 문제와 상관없는 부분을 지우는 과정이 곧 원인을 좁혀 가는 과정이기 때문입니다.
:::

::: warning AI의 답도 검증하세요
AI는 그럴듯하지만 틀린 답을 내기도 합니다. 특히 `as any`, `// @ts-ignore`, `!`(non-null 단언)로 에러를 덮는 답이 자주 나옵니다. 받은 코드는 **직접 `npx tsc --noEmit`으로 검사하고 실행해 본 뒤** 씁니다. "왜 이렇게 고치면 되는지"도 함께 물어보세요. `!`가 무엇이고 언제 써도 되는지는 [타입 단언](../part2-types/10-assertion)에서 배웁니다.
:::

### 도움 받는 법 3: 공식 문서 보기

검색 결과가 서로 다른 말을 할 때 최종 기준은 **공식 문서**입니다. TypeScript 공식 사이트(`https://www.typescriptlang.org`) 상단 메뉴의 **Docs**에서 찾아갈 수 있습니다.

| 문서 | 무엇이 있나 | 언제 보나 |
|---|---|---|
| **Handbook** (`/docs/handbook/`) | TypeScript 문법을 처음부터 설명하는 공식 안내서 | 개념이 헷갈릴 때 |
| **TSConfig Reference** (`/tsconfig`) | `tsconfig.json` 옵션 전체를 하나씩 설명 | `strict`, `noEmitOnError` 같은 옵션이 궁금할 때 |
| **Release Notes** (Docs → What's New) | 버전별 새 기능 | "이 기능은 몇 버전부터?"가 궁금할 때 |

JavaScript 자체의 문법이나 런타임 에러(`TypeError` 등)는 **MDN Web Docs**(`https://developer.mozilla.org/ko/`)가 기준입니다. 한국어 번역 페이지도 많고, 상단 검색창에 `TypeError`나 `Array.find`처럼 입력하면 됩니다.

공식 문서 읽는 요령:

1. 처음부터 끝까지 읽으려 하지 말고, **페이지 안 검색**(`Ctrl + F`)으로 필요한 단어를 찾습니다.
2. **예제 코드부터** 봅니다. 설명보다 코드가 이해하기 쉬운 경우가 많습니다.
3. 예제를 Playground에 붙여 넣어 직접 바꿔 봅니다. 공식 문서 예제는 회사 코드가 아니므로 마음껏 실험해도 됩니다.
4. 영어가 어렵다면 브라우저의 번역 기능을 써도 됩니다. 다만 코드와 에러 메시지는 번역하지 말고 원문으로 봅니다.

### 에러를 만났을 때 순서 정리

```text
1. 숨 고르기 — 에러는 실행 전에 문제를 찾아 준 안내문이다
2. 맨 위 에러부터 — 문법 에러(TS1xxx)가 있으면 그것부터
3. 위치 확인 — 파일:줄:칸으로 가서 물결표가 가리키는 곳을 본다
4. 메시지 해석 — 첫 줄로 "무엇이", 들여쓴 마지막 줄로 "왜"
5. 방금 바꾼 곳 의심 — 대부분의 문제는 마지막으로 고친 곳에 있다
6. 검색 — 에러 코드 + 메시지 고정 부분, 날짜·버전 확인
7. 질문 — 최소 재현 코드 + 에러 전문 + 환경 정보, 회사 정보는 지우고
```

## 자주 하는 실수

### 실수 1. 에러 메시지를 읽지 않고 코드부터 고치기

```ts
const price: number = '4500'
// ❌ Type 'string' is not assignable to type 'number'. (TS2322)
```

빨간 밑줄을 보자마자 `: number`를 지우거나 `: string`으로 바꿉니다.

**왜 틀렸나**: 메시지는 "문자열을 숫자 자리에 넣었다"고 말합니다. 진짜 문제는 **값에 따옴표를 붙인 것**인데, 타입 표기를 바꾸면 가격이 문자열이 되어 나중에 `price + 500`이 `'4500500'`이 되는 버그로 이어집니다.

**고친 코드**: 메시지를 끝까지 읽고, 무엇이 맞는지 판단한 뒤 고칩니다. 가격은 숫자가 맞으므로 값을 고칩니다.

```ts
const price: number = 4500
console.log(price + 500)
// 출력: 5000
```

### 실수 2. 에러를 숨기는 것으로 "해결"하기

```ts
const products = [{ name: '아메리카노', price: 4500 }]
const found = products.find((p) => p.name === '라떼')
// @ts-ignore
console.log(found.price)
```

**왜 틀렸나**: `// @ts-ignore`는 다음 줄의 컴파일 에러를 **숨길 뿐**입니다. 문제는 그대로 남아 있어서 실행하면 `TypeError: Cannot read properties of undefined (reading 'price')`로 프로그램이 멈춥니다. 컴파일 에러가 경고해 준 런타임 에러를 일부러 놓친 셈입니다.

**고친 코드**: 값이 없을 때를 처리합니다.

```ts
const products = [{ name: '아메리카노', price: 4500 }]
const found = products.find((p) => p.name === '라떼')
if (found) {
  console.log(found.price)
} else {
  console.log('상품을 찾지 못했습니다.')
}
// 출력: 상품을 찾지 못했습니다.
```

### 실수 3. 에러를 요약해서 질문하기

```text
TS에서 타입 에러 나요. 어떻게 해요?
```

**왜 틀렸나**: 어떤 코드에서, 어떤 에러가, 어떤 환경에서 났는지 아무 정보가 없습니다. 답하는 사람은 추측만 할 수 있고, 몇 번씩 되물어야 합니다.

**고친 방법**: 최소 재현 코드, 에러 전문(복사·붙여넣기), TypeScript·Node.js 버전, 기대한 결과와 실제 결과를 함께 적습니다. 위 "질문 예시" 형식을 쓰세요.

### 실수 4. 회사 코드를 그대로 붙여 넣어 질문하기

**왜 틀렸나**: 회사 코드에는 고객사 이름, 서버 주소, 인증 정보, 개인정보가 섞여 있기 쉽습니다. 외부 AI나 커뮤니티에 올리는 순간 회사 밖으로 나간 것이며, 되돌릴 수 없습니다. 게다가 긴 코드는 답하는 사람이 핵심을 찾기도 어렵습니다.

**고친 방법**: 문제를 재현하는 **짧은 코드를 새로** 쓰고, 이름과 값을 일반적인 것으로 바꿉니다. 사내 규칙상 허용된 도구인지도 확인합니다.

## 직접 해 보기

### 문제 1. 에러 메시지 해부 ⭐

다음 에러 메시지에서 ① 파일 이름 ② 줄 ③ 칸 ④ 에러 코드 ⑤ 메시지의 우리말 뜻을 적으세요.

```text
order.ts:12:5 - error TS2304: Cannot find name 'totl'.
```

::: details 정답 보기
① `order.ts` ② 12번째 줄 ③ 5번째 칸 ④ `TS2304` ⑤ "`totl`이라는 이름을 찾을 수 없다". 아마 `total`의 오타일 것입니다.
:::

### 문제 2. 해석표 써 보기 ⭐

다음 메시지를 우리말로 해석하세요.

1. `Property 'price' is missing in type '{ name: string; }' but required in type 'Product'.`
2. `Argument of type 'string' is not assignable to parameter of type 'number'.`
3. `'memo' is possibly 'null'.`

::: details 정답 보기
1. "`{ name: string; }` 타입에는 `price` 속성이 없는데, `Product` 타입에서는 꼭 필요하다." → 객체에 `price`를 빠뜨렸습니다. (TS2741)
2. "함수에 넘긴 `string` 값은 `number` 타입 매개변수에 넣을 수 없다." → 숫자를 넘겨야 할 곳에 문자열을 넘겼습니다. (TS2345)
3. "`memo`는 `null`일 수도 있다." → 값이 비어 있는지 먼저 확인해야 합니다. (TS18047)
:::

### 문제 3. 들여쓴 줄 읽기 ⭐⭐

다음 에러의 "핵심 원인"은 무엇이고, 코드를 어떻게 고치면 될까요?

```text
menu.ts:9:7 - error TS2322: Type '{ name: string; price: number; stock: string; }' is not assignable to type 'MenuItem'.
  Types of property 'stock' are incompatible.
    Type 'string' is not assignable to type 'number'.
```

::: details 정답 보기
가장 깊이 들여쓴 마지막 줄이 핵심입니다. `stock` 속성에 `string`(문자열)을 넣었는데 `MenuItem`에서는 `number`(숫자)여야 합니다. `stock: '10'`처럼 따옴표가 붙어 있을 가능성이 높으므로 `stock: 10`으로 고칩니다.
:::

### 문제 4. 컴파일 에러인가 런타임 에러인가 ⭐⭐

다음 메시지를 컴파일 에러와 런타임 에러로 나누세요.

1. `TypeError: Cannot read properties of undefined (reading 'length')`
2. `error TS2554: Expected 1 arguments, but got 0.`
3. `ReferenceError: totalPrice is not defined`
4. `error TS2339: Property 'lenght' does not exist on type 'string'.`

::: details 정답 보기
- 컴파일 에러: 2, 4 (`error TS....` 형식, 실행 전 tsc가 발견)
- 런타임 에러: 1, 3 (`TypeError`, `ReferenceError` 형식, 실행 중 JavaScript 엔진이 발견)

4번은 `length`의 오타입니다. TypeScript를 쓰면 이런 오타를 실행 전에 잡아 주므로, 3번 같은 런타임 에러를 미리 막을 수 있습니다.
:::

### 문제 5. 검색어 만들기 ⭐⭐

다음 에러를 검색하려고 합니다. 좋은 검색어를 만들어 보세요.

```text
src/pos/settle.ts:41:18 - error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
```

::: details 정답 보기
예: `TS2345 Argument of type 'string | undefined' is not assignable to parameter of type 'string'`

파일 경로(`src/pos/settle.ts`)와 줄 번호는 내 프로젝트에만 있는 정보이므로 빼고, 에러 코드와 메시지의 고정된 부분을 씁니다. 경로에 회사 업무 이름이 드러나는 경우가 많으니 질문 글에서도 빼는 것이 좋습니다.
:::

### 문제 6. 질문 다듬기 ⭐⭐⭐

다음 질문을 "좋은 질문" 형식으로 고쳐 쓰세요. 회사 정보로 보이는 것은 지우거나 바꿉니다.

```text
(주)한빛유통 정산 서버(10.20.30.40) 코드인데요, settleAmount 함수 부르면
에러 나요. 코드 전체 500줄 붙여요. 빨리 답 주세요.
```

::: details 정답 보기
````text
함수 호출에서 TS2554 에러가 나는데 원인을 모르겠습니다.

[하려던 것]
금액과 수수료율을 넘겨 정산 금액을 계산하려고 합니다.

[최소 재현 코드]
```ts
function settleAmount(amount: number, feeRate: number): number {
  return amount - amount * feeRate
}
console.log(settleAmount(10000))
```

[에러 전문]
test.ts:4:13 - error TS2554: Expected 2 arguments, but got 1.

[환경]
TypeScript 7.0.2, Node.js v24.13.1, Windows 11

[해 본 것]
함수 정의를 다시 봤는데 어디가 문제인지 모르겠습니다.
````

회사 이름과 서버 주소를 지웠고, 500줄 대신 문제를 재현하는 4줄만 새로 썼습니다. 이 형태로 정리하고 나면 "인수를 하나만 넘겼다"는 원인이 질문하기 전에 보이기도 합니다. 고친 호출은 `settleAmount(10000, 0.03)`입니다.
:::

## 확인 퀴즈

**Q1.** `hello.ts:2:7 - error TS2322: ...`에서 `2`, `7`, `TS2322`는 각각 무엇인가요?

::: details 정답 보기
`2`는 줄 번호, `7`은 칸(열) 번호, `TS2322`는 에러 종류를 나타내는 에러 코드입니다.
:::

**Q2.** 에러 메시지에 두 칸씩 들여쓴 줄이 여러 개 있을 때, 핵심 원인은 보통 어디에 있나요?

::: details 정답 보기
가장 깊이 들여쓴 **마지막 줄**입니다. 들여쓴 줄은 위 줄에 대한 "왜냐하면"이라는 설명입니다.
:::

**Q3.** 컴파일 에러와 런타임 에러의 가장 큰 차이는 무엇인가요?

::: details 정답 보기
발견되는 **시점**입니다. 컴파일 에러는 실행하기 전에 TypeScript 컴파일러가 찾고, 런타임 에러는 실행 도중 JavaScript 엔진이 찾으며 그 자리에서 프로그램이 멈춥니다.
:::

**Q4.** 질문할 때 넣어야 할 네 가지와, 반드시 빼야 할 것은 무엇인가요?

::: details 정답 보기
넣을 것: 재현 가능한 최소 코드, 에러 전문, 환경 정보(TypeScript·Node.js 버전, 운영체제, 실행 명령), 기대한 결과와 실제 결과(해 본 것 포함).
뺄 것: 회사·고객사 이름, 서버 주소, 비밀번호·키·토큰, 개인정보, 실제 업무 데이터.
:::

**Q5.** `// @ts-ignore`로 에러를 없애면 왜 안 되나요?

::: details 정답 보기
에러를 고친 것이 아니라 숨긴 것이기 때문입니다. 원인이 그대로 남아 있어 실행 중에 런타임 에러가 날 수 있습니다.
:::

## 정리

- tsc 에러는 **`파일:줄:칸` - error `TS코드`: 메시지** 구조이고, 그 아래 문제 줄과 물결표가 정확한 위치를 가리킵니다.
- 들여쓴 상세 줄은 "왜냐하면"입니다. **첫 줄로 무엇이, 마지막 줄로 왜**를 읽습니다.
- 에러가 여러 개면 **맨 위부터**, 문법 에러(`TS1xxx`)가 있으면 그것부터 고칩니다.
- `is not assignable to`, `does not exist on type`, `is possibly 'undefined'`, `Expected N arguments` 같은 표현 열댓 개만 익히면 대부분 읽을 수 있습니다.
- 컴파일 에러는 실행 전에, 런타임 에러(`TypeError` 등)는 실행 중에 발견됩니다. 컴파일 에러는 런타임 에러를 막을 기회입니다.
- 검색은 **에러 코드 + 메시지 고정 부분**으로, 질문은 **최소 재현 코드 + 에러 전문 + 환경 정보**로 하고, 회사 정보는 반드시 지웁니다.
- 최종 기준은 공식 문서(TypeScript Handbook, TSConfig Reference, MDN)입니다.

## 다음 단계

Part 0을 마쳤습니다. 이제 본격적으로 프로그래밍을 배웁니다. [Part 1. 프로그래밍 기초](../part1-basics/)의 첫 레슨 [값과 변수: let · const](../part1-basics/01-values-and-variables)에서 프로그램이 데이터를 담는 "상자", 변수를 만들어 봅니다.
