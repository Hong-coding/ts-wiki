---
title: 열거형(enum)과 그 대안
---

# 열거형(enum)과 그 대안

<LessonMeta level="초급" :minutes="40" prev="typeof · in · instanceof 등으로 타입 좁히기" />

## 이번에 배울 것

- 숫자 `enum`과 문자열 `enum`을 만들고 쓸 수 있다.
- 숫자 enum의 **역매핑**이 무엇이며 왜 생기는지 설명할 수 있다.
- `const enum`의 동작과 주의점을 설명할 수 있다.
- enum의 대안인 **리터럴 유니온**, **`as const` 객체 + `typeof`/`keyof`** 를 쓰고, 상황에 맞게 고를 수 있다.
- `erasableSyntaxOnly`(TypeScript 5.8)와 Node.js 타입 스트리핑에서 enum이 문제 되는 이유를 설명할 수 있다.

## 먼저 알아 둘 것

- [유니온 타입과 리터럴 타입](./06-union-literal) — 주문 상태 `'READY' | 'PAID' | 'CANCELED'`
- [배열 타입과 튜플](./03-arrays-tuples) — `as const`
- [타입 별칭과 인터페이스](./07-type-alias-interface) — 타입과 값은 이름 공간이 다르다
- [타입 좁히기](./08-narrowing) — `switch`로 좁히기

## 비유로 이해하기

매장 POS 화면의 **결제 수단 버튼**을 생각해 보세요. 버튼에는 "카드", "현금", "간편결제"라고 쓰여 있지만, 시스템 안에서는 `CARD`, `CASH`, `PAY` 같은 **코드값**으로 저장됩니다.

이 "버튼 이름 ↔ 코드값" 대응표를 어디에 둘까요?

- **enum**: TypeScript가 직접 만들어 주는 **공식 코드표**입니다. 편리하지만, 컴파일하면 JavaScript 코드가 **새로 생겨나는** 특별한 문법입니다.
- **리터럴 유니온**: "코드값은 이 셋 중 하나"라는 **규칙만** 적어 둔 것입니다. 실행할 때는 흔적도 남지 않습니다.
- **`as const` 객체**: 평범한 JavaScript 객체로 코드표를 만들고, TypeScript에게 "이 표를 그대로 타입으로도 써 줘"라고 부탁하는 방식입니다.

셋 다 같은 목적을 이루지만 장단점이 다릅니다. 이번 레슨에서 비교해 봅니다.

## 개념 설명

### 1단계: 숫자 enum

**열거형**(enum, enumeration)은 **이름 붙은 상수들의 묶음**입니다. 값을 정하지 않으면 0부터 1씩 늘어나는 숫자가 붙습니다.

```ts
enum OrderStatus {
  Ready, // 0
  Paid, // 1
  Canceled, // 2
}

const status: OrderStatus = OrderStatus.Paid
console.log(status)
// 출력: 1

function getLabel(s: OrderStatus): string {
  switch (s) {
    case OrderStatus.Ready:
      return '결제 대기'
    case OrderStatus.Paid:
      return '결제 완료'
    case OrderStatus.Canceled:
      return '취소됨'
  }
}

console.log(getLabel(OrderStatus.Canceled))
// 출력: 취소됨
```

- `OrderStatus`는 **타입**(`status: OrderStatus`)으로도, **값**(`OrderStatus.Paid`)으로도 쓰입니다.
- 첫 값을 정하면 그다음부터 1씩 늘어납니다. `enum Grade { Bronze = 1, Silver, Gold }`이면 `Silver`는 `2`, `Gold`는 `3`입니다.

숫자 enum은 출력하면 `1` 같은 숫자만 보여서 로그나 DB에서 의미를 알기 어렵습니다. 중간에 항목을 끼워 넣으면 뒤의 숫자가 모두 밀려, **이미 저장된 데이터의 의미가 바뀌는** 사고도 납니다.

### 2단계: 역매핑 — enum은 실제 객체를 만든다

enum은 타입만이 아니라 **실행 중에 존재하는 객체**를 만듭니다. 위 `OrderStatus`를 컴파일하면 대략 이런 JavaScript가 생깁니다.

```js
var OrderStatus;
(function (OrderStatus) {
  OrderStatus[OrderStatus["Ready"] = 0] = "Ready";
  OrderStatus[OrderStatus["Paid"] = 1] = "Paid";
  OrderStatus[OrderStatus["Canceled"] = 2] = "Canceled";
})(OrderStatus || (OrderStatus = {}));
```

복잡해 보이지만 결과는 **이름 → 숫자**와 **숫자 → 이름**을 둘 다 담은 객체입니다. 숫자로 이름을 찾는 것을 **역매핑**(reverse mapping)이라고 합니다.

```ts
enum OrderStatus {
  Ready,
  Paid,
  Canceled,
}

console.log(OrderStatus.Paid) // 이름 → 숫자
// 출력: 1
console.log(OrderStatus[1]) // 숫자 → 이름 (역매핑)
// 출력: Paid
console.log(Object.keys(OrderStatus))
// 출력: [ '0', '1', '2', 'Ready', 'Paid', 'Canceled' ]
```

`Object.keys`의 결과에 숫자 키까지 섞여 나오는 것을 보세요. enum 항목으로 드롭다운 목록을 만들려고 `Object.keys`를 썼다가 항목이 두 배로 나오는 실수가 흔합니다.

### 3단계: 숫자 enum의 느슨한 검사

숫자 enum 자리에는 **아무 숫자 변수나** 들어갈 수 있습니다. 범위 밖 숫자를 리터럴로 직접 쓰면 TypeScript 5.0부터는 잡아 주지만, `number` 타입 변수는 막지 못합니다.

```ts
enum OrderStatus {
  Ready,
  Paid,
  Canceled,
}

const s1: OrderStatus = 99
// ❌ Type '99' is not assignable to type 'OrderStatus'. (TS2322)

const fromServer: number = 99
const s2: OrderStatus = fromServer // 오류 없음! 존재하지 않는 상태
console.log(s2)
// 출력: 99
```

집합으로 보면 `OrderStatus`는 `{ 0, 1, 2 }`여야 하는데, 실제로는 `number` 집합 전체가 들어올 수 있는 구멍이 있는 셈입니다.

### 4단계: 문자열 enum

값을 문자열로 정하면 **문자열 enum**이 됩니다. 실무에서 enum을 쓴다면 대부분 이쪽입니다.

```ts
enum PayMethod {
  Card = 'CARD',
  Cash = 'CASH',
  Pay = 'PAY',
}

function getFeeRate(method: PayMethod): number {
  if (method === PayMethod.Card) return 0.015
  if (method === PayMethod.Pay) return 0.01
  return 0
}

console.log(PayMethod.Card, getFeeRate(PayMethod.Card))
// 출력: CARD 0.015
console.log(Object.keys(PayMethod))
// 출력: [ 'Card', 'Cash', 'Pay' ]
```

- 출력하면 `'CARD'`처럼 의미 있는 값이 보여 로그·DB에서 읽기 좋습니다.
- 문자열 enum은 **역매핑을 만들지 않습니다.** 그래서 `Object.keys`에 이름만 나옵니다.
- 모든 항목에 값을 직접 적어야 합니다(자동으로 늘어나지 않음).

문자열 enum에는 독특한 성질이 하나 있습니다. **같은 문자열이라도 리터럴로는 넣을 수 없습니다.**

```ts
enum PayMethod {
  Card = 'CARD',
  Cash = 'CASH',
}

function pay(method: PayMethod) {
  console.log(method)
}

pay(PayMethod.Card) // ✅
pay('CARD')
// ❌ Argument of type '"CARD"' is not assignable to parameter of type 'PayMethod'. (TS2345)
```

TypeScript는 대부분 "모양이 같으면 인정"하지만([구조적 타이핑](../part3-intermediate/02-structural-typing)), 문자열 enum은 예외적으로 **이름으로 구분**합니다. 그래서 서버 응답 JSON의 `"CARD"` 문자열을 그대로 넘길 수 없고 변환 코드가 필요해집니다. 장점(실수 방지)이자 단점(번거로움)입니다.

### 5단계: const enum과 주의점

`const enum`은 객체를 만들지 않고, 쓰는 곳에 **값을 직접 박아 넣는**(inline) enum입니다.

```ts
const enum Size {
  Small = 'S',
  Medium = 'M',
  Large = 'L',
}

const cup = Size.Large
console.log(cup)
// 출력: L
```

`tsc`로 컴파일하면 `Size` 객체는 사라지고 이렇게 됩니다.

```js
const cup = "L" /* Size.Large */;
console.log(cup);
```

코드가 작아진다는 장점이 있지만 **주의점**이 많습니다.

- `const enum`이 **다른 파일에** 있으면, 컴파일러가 그 파일의 값을 읽어 와야 박아 넣을 수 있습니다. Babel, esbuild, Vite처럼 **파일을 하나씩 따로 변환하는 도구**(`isolatedModules` 환경)는 다른 파일을 읽지 않으므로 이 일을 제대로 할 수 없습니다.
- 그래서 `isolatedModules`를 켜면 `const enum` 사용에 제약이 생기고, 라이브러리가 `const enum`을 공개하면 쓰는 쪽에서 문제가 되기 쉽습니다.
- TypeScript 공식 문서도 `const enum`의 함정(Const enum pitfalls)을 따로 설명하며 공개 API에는 쓰지 말라고 권합니다.

::: warning 처음에는 const enum을 쓰지 마세요
코드 크기를 아주 조금 줄이는 대가로 빌드 도구와의 호환성 문제를 떠안게 됩니다. 요즘 프로젝트(Vite, esbuild 기반)에서는 쓰지 않는 편이 안전합니다. 빌드 도구 이야기는 [빌드 도구: tsc · Vite · tsup · tsx](../part6-tooling/06-build-tools)에서 다룹니다.
:::

### 6단계: 대안 1 — 리터럴 유니온

[06 레슨](./06-union-literal)에서 배운 문자열 리터럴 유니온은 enum이 하는 일 대부분을 해냅니다.

```ts
type PayMethod = 'CARD' | 'CASH' | 'PAY'

function getFeeRate(method: PayMethod): number {
  if (method === 'CARD') return 0.015
  if (method === 'PAY') return 0.01
  return 0
}

console.log(getFeeRate('CARD')) // 문자열을 그대로 넘길 수 있음
// 출력: 0.015
```

- **실행 코드가 전혀 생기지 않습니다.** 타입은 컴파일하면 사라집니다.
- 서버 응답의 `"CARD"` 문자열과 그대로 호환됩니다.
- 오타 검사와 자동 완성도 됩니다.

단점은 **값 목록을 실행 중에 쓸 수 없다**는 것입니다. 드롭다운에 "모든 결제 수단"을 나열하려면 배열이 따로 필요한데, 타입과 배열을 두 번 적으면 한쪽만 고치는 실수가 생깁니다.

### 7단계: 대안 2 — as const 객체 + typeof / keyof

**값 목록도 필요하고 타입도 필요할 때** 가장 많이 쓰는 패턴입니다. 평범한 객체에 `as const`를 붙이고, 그 객체에서 타입을 뽑아냅니다.

```ts
const PayMethod = {
  Card: 'CARD',
  Cash: 'CASH',
  Pay: 'PAY',
} as const

// 값들의 유니온: "CARD" | "CASH" | "PAY"
type PayMethod = (typeof PayMethod)[keyof typeof PayMethod]

function getFeeRate(method: PayMethod): number {
  if (method === PayMethod.Card) return 0.015 // enum처럼 쓸 수 있음
  if (method === 'PAY') return 0.01 // 문자열로도 쓸 수 있음
  return 0
}

console.log(getFeeRate(PayMethod.Card), getFeeRate('CASH'))
// 출력: 0.015 0
console.log(Object.values(PayMethod)) // 실행 중 목록도 바로 사용
// 출력: [ 'CARD', 'CASH', 'PAY' ]
```

`type PayMethod = ...` 줄을 차근차근 풀어 보겠습니다. 처음 보면 어렵지만, 지금은 "이 한 줄이 값들의 유니온을 뽑아 준다"는 패턴으로 외워 두어도 됩니다.

```text
typeof PayMethod
  → 값 PayMethod의 타입
  → { readonly Card: "CARD"; readonly Cash: "CASH"; readonly Pay: "PAY" }

keyof typeof PayMethod
  → 그 타입의 키들의 유니온
  → "Card" | "Cash" | "Pay"

(typeof PayMethod)[keyof typeof PayMethod]
  → 그 키들로 꺼낸 값 타입들의 유니온
  → "CARD" | "CASH" | "PAY"
```

- 타입 위치에 쓴 `typeof`는 "이 **값**의 타입을 가져와라"라는 TypeScript 문법입니다(실행 중의 `typeof` 연산자와는 다른 것입니다).
- `keyof`는 객체 타입의 **키 이름들을 유니온**으로 만듭니다.
- `as const`가 없으면 값이 `string`으로 넓혀져 결과도 `string`이 됩니다([03 레슨](./03-arrays-tuples)).
- 값 `PayMethod`와 타입 `PayMethod`는 이름 공간이 달라 같은 이름을 쓸 수 있습니다([07 레슨](./07-type-alias-interface)).

이 문법들의 원리는 [Part 3 keyof · typeof · 인덱스 접근 타입](../part3-intermediate/06-keyof-typeof-indexed)에서 제대로 배웁니다.

배열로도 같은 패턴을 쓸 수 있습니다. 표시 순서가 중요한 목록에 편리합니다.

```ts
const CUP_SIZES = ['S', 'M', 'L'] as const
type CupSize = (typeof CUP_SIZES)[number] // "S" | "M" | "L"

const size: CupSize = 'M'
console.log(CUP_SIZES.includes(size), CUP_SIZES.length)
// 출력: true 3
```

`[number]`는 "숫자 인덱스로 꺼낸 요소의 타입"이라는 뜻이라 모든 요소 타입의 유니온이 됩니다.

### 8단계: erasableSyntaxOnly와 Node.js 타입 스트리핑

최근 enum을 피하는 이유가 하나 더 생겼습니다. **"타입만 지우면 실행되는 TypeScript"** 라는 흐름입니다.

- Node.js는 22.6부터 실험 기능(`--experimental-strip-types`)으로, 23.6부터는 기본으로 `.ts` 파일을 직접 실행할 수 있게 되었습니다. 이것을 **타입 스트리핑**(type stripping)이라고 합니다. 원리는 단순합니다. 타입 표기 부분을 **공백으로 지우기만** 하고 나머지는 JavaScript로 그대로 실행합니다. (작성 시점 기준입니다. 22 계열도 이후 버전에서 기본 활성화되었으니, 쓰는 버전의 공식 문서를 확인하세요.)
- 그런데 `enum`은 **지우기만 해서는 안 되는 문법**입니다. 2단계에서 본 것처럼 실제 JavaScript 객체 코드를 **새로 만들어야** 하기 때문입니다. 그래서 Node.js의 기본 타입 스트리핑은 enum이 있는 파일을 실행하지 못하고 오류를 냅니다(별도 옵션 `--experimental-transform-types`를 켜야 변환합니다).
- 같은 이유로 문제가 되는 문법: `enum`, 값을 가진 `namespace`, 클래스 생성자의 **매개변수 속성**(`constructor(private name: string)`) 등입니다.

TypeScript **5.8**에는 이런 문법을 미리 막는 **`erasableSyntaxOnly`** 옵션이 추가되었습니다. `tsconfig.json`에서 켜면 enum을 쓰는 순간 에디터에서 바로 알려 줍니다.

```json
{
  "compilerOptions": {
    "erasableSyntaxOnly": true
  }
}
```

```text
enum PayMethod { Card = 'CARD' }
// TypeScript 5.8 이상, erasableSyntaxOnly를 켰을 때:
// This syntax is not allowed when 'erasableSyntaxOnly' is enabled. (TS1294)
```

이 위키의 기준 버전(5.6)에는 이 옵션이 없습니다. 5.8 이상을 쓰는 프로젝트에서, 특히 Node.js로 `.ts`를 바로 실행하거나 앞으로 그렇게 할 계획이 있다면 켜 두는 것을 고려하세요.

### 9단계: 한눈에 비교하고 고르기

| 비교 항목 | 숫자 enum | 문자열 enum | 리터럴 유니온 | `as const` 객체 |
|---|---|---|---|---|
| 실행 코드 생성 | 생김(역매핑 포함) | 생김 | **없음** | 일반 객체 하나 |
| 값 목록을 실행 중에 사용 | 가능(숫자 키 섞임) | 가능 | 불가 | **가능** |
| 문자열 `'CARD'` 직접 전달 | - | **불가** | 가능 | 가능 |
| 로그·DB에서 읽기 | 숫자라 어려움 | 좋음 | 좋음 | 좋음 |
| 아무 숫자가 섞이는 구멍 | **있음** | 없음 | 없음 | 없음 |
| 타입 스트리핑·`erasableSyntaxOnly` | **불가** | **불가** | 가능 | 가능 |
| 문법 난이도 | 쉬움 | 쉬움 | 쉬움 | `typeof`/`keyof`가 조금 어려움 |

**실무 권장**

1. **값 목록이 필요 없으면 → 리터럴 유니온.** 가장 단순하고 가볍습니다. 대부분의 상태값은 이것으로 충분합니다.
2. **실행 중 목록(드롭다운, 검증)이나 `이름.값` 형태의 참조가 필요하면 → `as const` 객체(또는 배열).**
3. **enum은 이미 enum을 쓰는 코드베이스에서 일관성을 지킬 때** 씁니다. 그때도 숫자 enum보다는 **문자열 enum**을 쓰고, `const enum`은 피합니다.

::: info enum이 "나쁜" 것은 아닙니다
enum은 C#, Java 개발자에게 익숙하고 읽기 좋으며, 지금도 많은 프로젝트가 잘 쓰고 있습니다. 다만 TypeScript가 "JavaScript + 지울 수 있는 타입"이라는 방향으로 가면서, 실행 코드를 만드는 enum은 점점 예외적인 문법이 되고 있다는 점을 알아 두세요.
:::

## 자주 하는 실수

### 실수 1: 숫자 enum 중간에 항목 끼워 넣기

```ts
// 처음 버전
enum Grade {
  Bronze, // 0
  Silver, // 1
  Gold, // 2
}

// 나중에 Silver와 Gold 사이에 등급을 추가한 버전
enum Grade2 {
  Bronze, // 0
  Silver, // 1
  SilverPlus, // 2  ← 새로 추가
  Gold, // 3  ← 원래 2였는데 바뀜!
}

console.log(Grade.Gold, Grade2.Gold)
// 출력: 2 3
```

왜 틀렸나: DB에 `2`로 저장된 골드 회원이, 코드가 바뀐 뒤에는 `SilverPlus`로 읽힙니다. 컴파일 오류는 전혀 나지 않습니다.

고친 코드: 저장되는 값은 **문자열**로 명시합니다.

```ts
type Grade = 'BRONZE' | 'SILVER' | 'SILVER_PLUS' | 'GOLD'

const g: Grade = 'GOLD' // 항목을 추가해도 기존 값의 의미가 바뀌지 않음
console.log(g)
// 출력: GOLD
```

### 실수 2: 숫자 enum을 Object.keys로 나열하기

```ts
enum Grade {
  Bronze,
  Silver,
  Gold,
}

console.log(Object.keys(Grade))
// 출력: [ '0', '1', '2', 'Bronze', 'Silver', 'Gold' ]
```

왜 틀렸나: 역매핑 때문에 숫자 키가 섞여 나옵니다. 드롭다운 항목이 6개가 됩니다.

고친 코드: 목록이 필요하면 `as const` 배열을 씁니다.

```ts
const GRADES = ['BRONZE', 'SILVER', 'GOLD'] as const
type Grade = (typeof GRADES)[number]

const options = GRADES.map((g) => ({ value: g, label: g.toLowerCase() }))
console.log(options.length)
// 출력: 3
```

### 실수 3: 서버 응답 문자열을 문자열 enum에 바로 넣기

```ts
enum PayMethod {
  Card = 'CARD',
  Cash = 'CASH',
}

type OrderResponse = { orderNo: string; payMethod: string }

const res: OrderResponse = { orderNo: 'A-1001', payMethod: 'CARD' }
const method: PayMethod = res.payMethod
// ❌ Type 'string' is not assignable to type 'PayMethod'. (TS2322)
```

왜 틀렸나: `string`은 `PayMethod`보다 큰 집합입니다. 게다가 문자열 enum은 `'CARD'` 리터럴조차 직접 받지 않습니다.

고친 코드: `as const` 객체로 바꾸고, 값이 목록에 있는지 **확인한 뒤** 씁니다.

```ts
const PayMethod = { Card: 'CARD', Cash: 'CASH' } as const
type PayMethod = (typeof PayMethod)[keyof typeof PayMethod]

function toPayMethod(value: string): PayMethod | undefined {
  if (value === PayMethod.Card || value === PayMethod.Cash) return value
  return undefined
}

console.log(toPayMethod('CARD'), toPayMethod('BITCOIN'))
// 출력: CARD undefined
```

`value === ...` 비교로 좁혔기 때문에 `return value`가 `PayMethod` 타입으로 통과합니다([08 레슨](./08-narrowing)). 응답 전체를 검증하는 체계적인 방법은 [런타임 검증 (zod)](../part4-async/05-runtime-validation)에서 배웁니다.

### 실수 4: as const를 빼먹기

```ts
const PayMethod = { Card: 'CARD', Cash: 'CASH' }
type PayMethod = (typeof PayMethod)[keyof typeof PayMethod] // string이 되어 버림

const m: PayMethod = 'BITCOIN' // 오류 없음!
```

왜 틀렸나: `as const`가 없으면 객체 속성 값이 `string`으로 넓혀지고, 뽑아낸 타입도 `string`이 됩니다.

고친 코드:

```ts
const PayMethod = { Card: 'CARD', Cash: 'CASH' } as const
type PayMethod = (typeof PayMethod)[keyof typeof PayMethod]

const m: PayMethod = 'BITCOIN'
// ❌ Type '"BITCOIN"' is not assignable to type 'PayMethod'. (TS2322)
```

## 직접 해 보기

### 문제 1 ⭐ 문자열 enum 만들기

회원 등급 `Bronze = 'BRONZE'`, `Silver = 'SILVER'`, `Gold = 'GOLD'`를 가진 문자열 enum `MemberGrade`를 만들고, `MemberGrade.Gold`를 출력해 보세요.

::: details 정답 보기
```ts
enum MemberGrade {
  Bronze = 'BRONZE',
  Silver = 'SILVER',
  Gold = 'GOLD',
}

console.log(MemberGrade.Gold)
// 출력: GOLD
```
:::

### 문제 2 ⭐ 역매핑 예측하기

다음 코드의 출력을 예측하세요.

```ts
// 문제: 출력을 예측하세요
enum Table {
  A = 1,
  B,
  C,
}

console.log(Table.C, Table[2])
```

::: details 정답 보기
```ts
enum Table {
  A = 1,
  B,
  C,
}

console.log(Table.C, Table[2])
// 출력: 3 B
```

`A`가 1이므로 `B`는 2, `C`는 3입니다. `Table[2]`는 역매핑으로 이름 `'B'`를 돌려줍니다.
:::

### 문제 3 ⭐⭐ enum을 리터럴 유니온으로 바꾸기

다음 enum을 쓰는 코드를 **리터럴 유니온**으로 바꾸세요. 실행 코드가 생기지 않아야 합니다.

```ts
// 문제: 리터럴 유니온으로 바꾸세요
enum SortOrder {
  Asc = 'asc',
  Desc = 'desc',
}

function sortPrices(prices: number[], order: SortOrder): number[] {
  return [...prices].sort((a, b) => (order === SortOrder.Asc ? a - b : b - a))
}

console.log(sortPrices([5000, 4500], SortOrder.Asc))
```

::: details 정답 보기
```ts
type SortOrder = 'asc' | 'desc'

function sortPrices(prices: number[], order: SortOrder): number[] {
  return [...prices].sort((a, b) => (order === 'asc' ? a - b : b - a))
}

console.log(sortPrices([5000, 4500], 'asc'))
// 출력: [ 4500, 5000 ]
```
:::

### 문제 4 ⭐⭐ as const 객체로 바꾸기

매장 유형 `Direct: 'DIRECT'`(직영), `Franchise: 'FRANCHISE'`(가맹)를 `as const` 객체 `StoreType`으로 만들고, 같은 이름의 유니온 타입을 뽑아내세요. 그리고 모든 값을 출력하세요.

::: details 정답 보기
```ts
const StoreType = {
  Direct: 'DIRECT',
  Franchise: 'FRANCHISE',
} as const

type StoreType = (typeof StoreType)[keyof typeof StoreType]

const t: StoreType = StoreType.Franchise
console.log(t, Object.values(StoreType))
// 출력: FRANCHISE [ 'DIRECT', 'FRANCHISE' ]
```
:::

### 문제 5 ⭐⭐⭐ 라벨까지 함께 관리하기

결제 수단 코드와 화면 표시 이름을 한곳에서 관리하고 싶습니다. 아래 객체에서 **키(코드)들의 유니온** `PayMethod`를 뽑아내고, 코드를 받아 표시 이름을 돌려주는 `getPayLabel` 함수를 작성하세요.

```ts
// 문제: PayMethod 타입과 getPayLabel 함수를 작성하세요
const PAY_LABELS = {
  CARD: '신용카드',
  CASH: '현금',
  PAY: '간편결제',
} as const
```

::: details 정답 보기
```ts
const PAY_LABELS = {
  CARD: '신용카드',
  CASH: '현금',
  PAY: '간편결제',
} as const

type PayMethod = keyof typeof PAY_LABELS // "CARD" | "CASH" | "PAY"

function getPayLabel(method: PayMethod): string {
  return PAY_LABELS[method]
}

console.log(getPayLabel('PAY'), Object.keys(PAY_LABELS).length)
// 출력: 간편결제 3
```

이번에는 값이 아니라 **키**가 코드값이므로 `keyof typeof`만으로 충분합니다. 새 결제 수단은 객체에 한 줄만 추가하면 타입과 라벨이 함께 늘어납니다.
:::

## 확인 퀴즈

1. 숫자 enum에서 역매핑이란 무엇인가요? 문자열 enum에도 있나요?
2. 숫자 enum 타입 변수에 `number` 타입 변수를 넣으면 오류가 나나요?
3. 문자열 enum `PayMethod`를 받는 함수에 `'CARD'`를 직접 넘길 수 있나요?
4. `const enum`을 Vite·esbuild 같은 도구에서 조심해야 하는 이유는 무엇인가요?
5. Node.js 타입 스트리핑에서 enum이 문제가 되는 이유는 무엇인가요?

::: details 정답 보기
1. 숫자 값으로 이름을 찾는 것(`OrderStatus[1]`이 `'Paid'`)입니다. 문자열 enum에는 없습니다.
2. 나지 않습니다. 숫자 enum의 구멍입니다(범위 밖 숫자 리터럴 `99`는 TS 5.0부터 오류).
3. 넘길 수 없습니다. 문자열 enum은 같은 문자열 리터럴도 받지 않습니다.
4. 파일을 하나씩 따로 변환하는 도구는 다른 파일의 `const enum` 값을 읽어 와 박아 넣을 수 없기 때문입니다.
5. 타입 스트리핑은 타입을 지우기만 하는데, enum은 실행용 객체 코드를 새로 만들어야 하는 문법이기 때문입니다.
:::

## 정리

- `enum`은 이름 붙은 상수 묶음이며, 타입과 함께 **실행용 객체 코드**를 만듭니다.
- 숫자 enum은 **역매핑**이 생기고, 아무 `number`나 들어오는 구멍과 순서 변경 사고 위험이 있습니다. 쓴다면 **문자열 enum**을 씁니다.
- `const enum`은 값을 박아 넣지만 `isolatedModules` 기반 빌드 도구와 충돌하기 쉬워 피합니다.
- 대안: 목록이 필요 없으면 **리터럴 유니온**, 목록도 필요하면 **`as const` 객체 + `(typeof X)[keyof typeof X]`**.
- TypeScript 5.8의 `erasableSyntaxOnly`와 Node.js 타입 스트리핑은 "지울 수 있는 문법만"을 요구하며, enum은 여기에 맞지 않습니다.

## 다음 단계

[타입 단언(as)과 non-null 단언(!)](./10-assertion) — 컴파일러에게 "이 값의 타입은 내가 책임진다"고 선언하는 `as`와 `!`를 배우고, 언제 써도 되고 언제 좁히기로 대신해야 하는지 정리합니다.
