---
title: 자주 만나는 컴파일 에러 사전 (TS2322 등)
---

# 자주 만나는 컴파일 에러 사전 (TS2322 등)

<LessonMeta level="마스터" :minutes="60" prev="Part 8에서 실습 프로젝트 4개를 완성하며 배운 것을 묶어 보았습니다" />

## 빠른 찾기 표

에러 메시지 끝(또는 앞)에 붙은 `TS` + 숫자를 찾아 아래 표에서 누르면 해당 항목으로 이동합니다. 모든 재현 코드는 TypeScript 5.6.3, `--strict`로 실제 실행해 메시지를 확인했습니다.

| 코드 | 한 줄 뜻 | 자주 나는 곳 |
|---|---|---|
| [TS1005](#ts1005) | 문법 기호가 빠졌다 (`,` `;` `)` 등) | 오타, 괄호 짝 |
| [TS1192](#ts1192) | 그 모듈에는 default export가 없다 | `import x from` |
| [TS1259](#ts1259) | `esModuleInterop` 없이는 default import 불가 | CommonJS 라이브러리 |
| [TS1308](#ts1308) | `await`는 async 함수 안에서만 | 비동기 코드 |
| [TS2304](#ts2304) | 그런 이름을 찾을 수 없다 | 오타, import 누락 |
| [TS2305](#ts2305) | 모듈에 그런 이름으로 내보낸 것이 없다 | named import 오타 |
| [TS2307](#ts2307) | 모듈(파일·패키지)을 찾을 수 없다 | 경로 오타, 미설치 |
| [TS2322](#ts2322) | 이 타입을 저 타입 자리에 넣을 수 없다 | 대입, 반환 |
| [TS2339](#ts2339) | 그 타입에 그런 속성이 없다 | 속성 접근 |
| [TS2344](#ts2344) | 제네릭 제약을 만족하지 않는다 | 제네릭 타입 인수 |
| [TS2345](#ts2345) | 인수 타입이 매개변수 타입과 안 맞는다 | 함수 호출 |
| [TS2349](#ts2349) | 호출할 수 없는 값을 호출했다 | `()` 잘못 붙임 |
| [TS2352](#ts2352) | 겹치는 부분이 없는 타입으로 단언했다 | `as` |
| [TS2353](#ts2353) | 객체 리터럴에 정의되지 않은 속성이 있다 | 초과 속성 검사 |
| [TS2355](#ts2355) | 반환 타입이 있는데 아무것도 반환하지 않는다 | 함수 반환 |
| [TS2362](#ts2365) | 산술 연산의 왼쪽이 숫자가 아니다 | `*` `-` `/` |
| [TS2365](#ts2365) | 이 두 타입에는 그 연산자를 쓸 수 없다 | `+` `<` 등 |
| [TS2366](#ts2366) | 끝까지 가면 반환문이 없다 | `switch` 누락 |
| [TS2367](#ts2367) | 절대 같을 수 없는 비교다 | 리터럴 오타 |
| [TS2416](#ts2416) | 자식 클래스 메서드가 부모와 안 맞는다 | 상속 |
| [TS2420](#ts2420) | 클래스가 인터페이스를 제대로 구현하지 않았다 | `implements` |
| [TS2448](#ts2448) | 선언하기 전에 변수를 썼다 | `let`·`const` 순서 |
| [TS2454](#ts2454) | 값을 넣기 전에 변수를 썼다 | 조건부 대입 |
| [TS2531](#ts2531) | 값이 `null`일 수 있다 (이름 없는 식) | DOM, 함수 결과 |
| [TS2532](#ts2532) | 값이 `undefined`일 수 있다 (이름 없는 식) | `find`, 배열 |
| [TS2551](#ts2339) | 그런 속성은 없다. 혹시 이것? | 속성 이름 오타 |
| [TS2552](#ts2304) | 그런 이름은 없다. 혹시 이것? | 이름 오타 |
| [TS2554](#ts2554) | 인수 개수가 틀렸다 | 함수 호출 |
| [TS2556](#ts2556) | 스프레드 인수가 튜플이 아니다 | `f(...args)` |
| [TS2564](#ts2564) | 클래스 속성에 초기값이 없다 | 클래스 |
| [TS2588](#ts2588) | 상수에 다시 대입할 수 없다 | `const` |
| [TS2589](#ts2589) | 타입 계산이 너무 깊다 | 재귀 타입 |
| [TS2613](#ts1192) | default export가 없다. 혹시 이름 있는 import? | `import x from` |
| [TS2683](#ts2683) | `this`의 타입을 알 수 없다 | 일반 함수 안 `this` |
| [TS2722](#ts2722) | `undefined`일 수 있는 함수를 호출했다 | 선택 콜백 |
| [TS2739](#ts2741) | 필수 속성 여러 개가 빠졌다 | 객체 리터럴 |
| [TS2741](#ts2741) | 필수 속성 하나가 빠졌다 | 객체 리터럴 |
| [TS2769](#ts2769) | 오버로드 중 맞는 것이 없다 | 오버로드 함수, 라이브러리 |
| [TS2835](#ts2835) | 상대 경로 import에 확장자가 필요하다 | Node ESM |
| [TS6133](#ts6133) | 선언했지만 쓰지 않는다 | `noUnusedLocals` |
| [TS7006](#ts7006) | 매개변수 타입이 암묵적으로 `any`다 | 타입 표기 누락 |
| [TS7016](#ts7016) | 그 패키지의 타입 선언 파일이 없다 | JS 전용 패키지 |
| [TS7053](#ts7053) | `string`으로 객체를 인덱싱할 수 없다 | `obj[key]` |
| [TS18046](#ts18046) | 값이 `unknown`이라 쓸 수 없다 | `catch (error)` |
| [TS18047](#ts18047) | 이 변수는 `null`일 수 있다 | `string \| null` |
| [TS18048](#ts18048) | 이 변수는 `undefined`일 수 있다 | 선택 속성 |

## 이번에 배울 것

- 에러 메시지를 **코드 · 요약 문장 · 상세 설명(들여쓰기된 줄)** 으로 나누어 읽을 수 있다.
- 자주 만나는 에러 40여 개의 원인을 코드 번호만 보고 짐작할 수 있다.
- 에러를 `any`·`as`로 덮지 않고 **원인을 고치는** 해결책을 고를 수 있다.
- 모듈·설정 때문에 나는 에러(TS2307, TS7016, TS1259, TS2835)를 tsconfig와 연결해 해결할 수 있다.

## 먼저 알아 둘 것

- [에러 메시지 읽는 법과 도움 받는 법](../part0-start/06-how-to-read-errors)
- [타입 좁히기(Narrowing)](../part2-types/08-narrowing)
- [strict 옵션 하나씩 이해하기](../part6-tooling/02-strict-options)
- [모듈 시스템: ESM · CommonJS · moduleResolution](../part6-tooling/03-module-systems)

## 비유로 이해하기

자동차 계기판에 경고등이 켜졌다고 해 봅시다. 초보 운전자는 "뭔가 고장 났다"만 압니다. 정비사는 **경고등 모양**만 보고 "엔진오일 부족", "타이어 공기압"처럼 원인을 바로 좁힙니다. 모양마다 뜻이 정해져 있기 때문입니다.

TypeScript 에러 코드도 경고등과 같습니다. `TS2322`는 "타입이 맞지 않는 값을 넣었다", `TS18048`은 "`undefined` 확인을 빼먹었다"처럼 번호마다 뜻이 정해져 있습니다. 번호와 뜻을 연결해 두면, 메시지를 끝까지 읽기도 전에 어디를 봐야 할지 압니다.

그리고 좋은 정비사는 **경고등 전구를 빼 버리지 않습니다**. `as any`나 `// @ts-ignore`로 에러를 지우는 것은 경고등 전구를 빼는 것과 같습니다. 이 사전의 "해결"은 모두 원인을 고치는 방법입니다.

## 개념 설명

### 에러 메시지 해부하기

`tsc`가 출력하는 에러 한 개는 다음 네 부분으로 되어 있습니다.

```text
src/order.ts(12,5): error TS2322: Type 'string' is not assignable to type 'number'.
│              │           │       └─ ④ 요약 문장
│              │           └─ ③ 에러 코드
│              └─ ② (줄, 칸)
└─ ① 파일 경로
```

메시지가 여러 줄이면 **들여쓰기가 깊어질수록 더 구체적인 이유**입니다. 맨 윗줄은 "무엇이 실패했는가", 맨 아랫줄은 "결정적으로 어디가 안 맞는가"입니다. 긴 에러는 **맨 아랫줄부터 거꾸로** 읽는 것이 빠릅니다.

```text
error TS2416: Property 'pay' in type 'CardPayment' is not assignable to the same property in base type 'Payment'.
  Type '(amount: string) => string' is not assignable to type '(amount: number) => string'.
    Types of parameters 'amount' and 'amount' are incompatible.
      Type 'number' is not assignable to type 'string'.     ← 결정적 이유
```

### 에러 코드 번호대의 대략적인 뜻

| 번호대 | 분류 | 예 |
|---|---|---|
| 1000번대 | 문법·구문 오류, 모듈 관련 일부 | TS1005, TS1308 |
| 2000번대 | 타입 검사 오류 (가장 많음) | TS2322, TS2339 |
| 5000번대 | 컴파일러 옵션·tsconfig 오류 | TS5023 (알 수 없는 옵션) |
| 6000번대 | 안내 메시지, 사용하지 않는 코드 | TS6133 |
| 7000번대 | `noImplicitAny` 계열 (암묵적 `any`) | TS7006, TS7053 |
| 18000번대 | 비교적 최근에 세분화된 메시지 | TS18046, TS18048 |

::: info 이 사전의 표기
- **메시지 원문**은 TypeScript 5.6.3에서 실제로 출력된 문장입니다. 따옴표 안의 이름(`'price'` 등)은 여러분의 코드에 따라 달라집니다.
- 재현 코드의 `// ❌` 주석은 바로 위 줄에서 나는 에러입니다.
- 따로 적지 않으면 `tsc --strict --target es2022 --lib es2022,dom`으로 검사했습니다.
:::

---

### 대입·호출 계열

#### TS2322 · 타입을 넣을 수 없음 {#ts2322}

**메시지 원문**

```text
Type 'string' is not assignable to type 'number'.
```

**한국어 뜻**: "`string` 타입 값을 `number` 타입 자리에 넣을(할당할) 수 없습니다."

**재현 코드**

```ts
let price: number = 4500
price = '오천 원'
// ❌ Type 'string' is not assignable to type 'number'. (TS2322)
```

**원인**: 변수·속성·반환값에 정해 둔 타입 집합 밖의 값을 넣었습니다. 가장 흔한 에러이며, 객체·함수·제네릭이 얽히면 아래에 들여쓰기된 상세 이유가 줄줄이 붙습니다.

**해결**: 값을 타입에 맞게 바꾸거나, 정말로 두 종류의 값을 허용해야 한다면 타입을 넓힙니다. 화면 입력처럼 문자열로 들어오는 값은 **변환한 뒤** 넣습니다.

```ts
let price: number = 4500
const input = '5000' // 화면 입력은 보통 문자열
price = Number(input) // 숫자로 변환한 뒤 대입
console.log(price)
// 출력: 5000
```

**관련 레슨**: [타입 표기와 타입 추론](../part2-types/01-annotation-inference), [구조적 타이핑과 할당 가능성](../part3-intermediate/02-structural-typing)

#### TS2345 · 인수 타입이 맞지 않음 {#ts2345}

**메시지 원문**

```text
Argument of type 'string' is not assignable to parameter of type 'number'.
```

**한국어 뜻**: "함수에 넘긴 인수(`string`)를 매개변수 타입(`number`)에 넣을 수 없습니다."

**재현 코드**

```ts
function addPoint(memberId: string, point: number): void {
  console.log(memberId, point)
}
addPoint('M001', '100')
// ❌ Argument of type 'string' is not assignable to parameter of type 'number'. (TS2345)
```

**원인**: TS2322와 뿌리가 같습니다. 대입 대신 **함수 호출**에서 났다는 점만 다릅니다.

**해결**: 호출하는 쪽에서 값을 맞춥니다. 함수 정의를 `point: any`로 바꾸는 것은 해결이 아닙니다.

```ts
function addPoint(memberId: string, point: number): void {
  console.log(memberId, point)
}
addPoint('M001', 100)
// 출력: M001 100
```

**관련 레슨**: [함수 타입](../part2-types/05-function-types), [타입 표기와 타입 추론](../part2-types/01-annotation-inference)

#### TS2554 · 인수 개수가 틀림 {#ts2554}

**메시지 원문**

```text
Expected 2 arguments, but got 1.
```

**한국어 뜻**: "인수 2개를 기대했는데 1개를 받았습니다."

**재현 코드**

```ts
function addToCart(productId: string, quantity: number): void {
  console.log(productId, quantity)
}
addToCart('P001')
// ❌ Expected 2 arguments, but got 1. (TS2554)
```

**원인**: JavaScript는 인수가 모자라면 `undefined`를 넣고 그냥 실행하지만, TypeScript는 개수를 검사합니다.

**해결**: 인수를 채우거나, 생략해도 되는 값이라면 **기본값 매개변수**나 선택 매개변수(`?`)로 바꿉니다.

```ts
function addToCart(productId: string, quantity: number = 1): void {
  console.log(productId, quantity)
}
addToCart('P001')
// 출력: P001 1
```

**관련 레슨**: [함수 타입: 선택·기본·나머지 매개변수와 오버로드](../part2-types/05-function-types)

#### TS2556 · 스프레드 인수가 튜플이 아님 {#ts2556}

**메시지 원문**

```text
A spread argument must either have a tuple type or be passed to a rest parameter.
```

**한국어 뜻**: "펼친(`...`) 인수는 튜플 타입이거나, 나머지 매개변수에 넘겨야 합니다."

**재현 코드**

```ts
function addToCart(productId: string, quantity: number): void {
  console.log(productId, quantity)
}
const args = ['P001', 2]
addToCart(...args)
// ❌ A spread argument must either have a tuple type or be passed to a rest parameter. (TS2556)
```

**원인**: `['P001', 2]`는 `(string | number)[]`로 추론됩니다. 길이도 순서도 모르는 배열이라, 첫 칸이 `string`이고 둘째 칸이 `number`라는 보장이 없습니다.

**해결**: `as const`나 튜플 타입 표기로 "길이 2, 순서 고정"이라고 알려 줍니다.

```ts
function addToCart(productId: string, quantity: number): void {
  console.log(productId, quantity)
}
const args: [string, number] = ['P001', 2]
addToCart(...args)
// 출력: P001 2
```

**관련 레슨**: [배열 타입과 튜플](../part2-types/03-arrays-tuples)

#### TS2769 · 맞는 오버로드가 없음 {#ts2769}

**메시지 원문**

```text
No overload matches this call.
  Overload 1 of 2, '(value: number): string', gave the following error.
    Argument of type 'string | number' is not assignable to parameter of type 'number'.
      Type 'string' is not assignable to type 'number'.
  Overload 2 of 2, '(value: string): string', gave the following error.
    Argument of type 'string | number' is not assignable to parameter of type 'string'.
      Type 'number' is not assignable to type 'string'.
```

**한국어 뜻**: "이 호출에 맞는 오버로드(같은 이름의 여러 함수 서명)가 하나도 없습니다." 그 아래에 **오버로드마다 왜 실패했는지** 따로 적혀 있습니다.

**재현 코드**

```ts
function formatPrice(value: number): string
function formatPrice(value: string): string
function formatPrice(value: number | string): string {
  return `${value}원`
}
const input: number | string = Math.random() > 0.5 ? 4500 : '4500'
formatPrice(input)
// ❌ No overload matches this call. (TS2769)
```

**원인**: 오버로드는 **하나씩 따로** 검사합니다. `number | string`은 1번(`number`만)에도, 2번(`string`만)에도 통째로 들어가지 않습니다. 구현 서명(`number | string`을 받는 마지막 함수)은 바깥에서 보이지 않습니다.

**해결**: 유니온을 받는 오버로드를 추가하거나, 처음부터 오버로드 대신 유니온 매개변수 하나로 씁니다. React·라이브러리에서 이 에러가 나면 **각 Overload 항목의 맨 아랫줄**을 비교해 가장 가까운 것을 찾습니다.

```ts
function formatPrice(value: number | string): string {
  return `${value}원`
}
const input: number | string = Math.random() > 0.5 ? 4500 : '4500'
console.log(formatPrice(input))
// 출력: 4500원
```

**관련 레슨**: [함수 타입: 선택·기본·나머지 매개변수와 오버로드](../part2-types/05-function-types)

#### TS2349 · 호출할 수 없는 값 {#ts2349}

**메시지 원문**

```text
This expression is not callable.
  Type 'Number' has no call signatures.
```

**한국어 뜻**: "이 식은 함수처럼 부를 수 없습니다. `Number` 타입에는 호출 서명(call signature, 함수로 부를 수 있다는 표시)이 없습니다."

**재현 코드**

```ts
const order = { id: 'O001', total: 9000 }
order.total()
// ❌ This expression is not callable. (TS2349)
```

**원인**: 속성(값)을 메서드(함수)로 착각해 `()`를 붙였습니다. 라이브러리를 잘못 import해 함수가 아닌 모듈 객체를 부를 때도 납니다.

**해결**: 괄호를 빼거나, 정말 함수가 필요하면 속성을 함수로 정의합니다.

```ts
const order = { id: 'O001', total: 9000 }
console.log(order.total)
// 출력: 9000
```

**관련 레슨**: [함수 기초](../part1-basics/06-functions), [객체](../part1-basics/08-objects)

---

### 객체·속성 계열

#### TS2339 · 속성이 없음 (TS2551 포함) {#ts2339}

**메시지 원문**

```text
Property 'stock' does not exist on type 'Product'.
Property 'prise' does not exist on type 'Product'. Did you mean 'price'?
```

**한국어 뜻**: "`Product` 타입에는 `stock` 속성이 없습니다." 이름이 비슷한 속성이 있으면 TS2551로 바뀌어 "혹시 `price`를 말한 건가요?"라고 제안합니다.

**재현 코드**

```ts
interface Product {
  id: string
  name: string
  price: number
}
const product: Product = { id: 'P001', name: '아메리카노', price: 4500 }
console.log(product.stock)
// ❌ Property 'stock' does not exist on type 'Product'. (TS2339)
console.log(product.prise)
// ❌ Property 'prise' does not exist on type 'Product'. Did you mean 'price'? (TS2551)
```

**원인**: ① 이름 오타, ② 타입 정의에 속성을 빠뜨림, ③ 유니온 타입에서 **일부 멤버에만** 있는 속성에 접근(좁히기 전) 중 하나입니다.

**해결**: 오타면 고치고, 정의가 빠졌다면 인터페이스에 추가합니다. 유니온이라면 `in`이나 판별 속성으로 먼저 좁힙니다.

```ts
interface Product {
  id: string
  name: string
  price: number
  stock: number // 정의에 추가
}
const product: Product = { id: 'P001', name: '아메리카노', price: 4500, stock: 30 }
console.log(product.stock, product.price)
// 출력: 30 4500
```

**관련 레슨**: [객체 타입](../part2-types/04-object-types), [타입 좁히기](../part2-types/08-narrowing)

#### TS2741 · TS2739 · 필수 속성이 빠짐 {#ts2741}

**메시지 원문**

```text
Property 'price' is missing in type '{ id: string; name: string; }' but required in type 'Product'.
Type '{ id: string; }' is missing the following properties from type 'Product': name, price
```

**한국어 뜻**: "`Product`에 필요한 `price` 속성이 빠졌습니다." 빠진 속성이 여러 개면 TS2739로 목록을 보여 줍니다.

**재현 코드**

```ts
interface Product {
  id: string
  name: string
  price: number
}
const coffee: Product = { id: 'P001', name: '아메리카노' }
// ❌ Property 'price' is missing in type '{ id: string; name: string; }' but required in type 'Product'. (TS2741)
const tea: Product = { id: 'P002' }
// ❌ Type '{ id: string; }' is missing the following properties from type 'Product': name, price (TS2739)
```

**원인**: 필수 속성을 채우지 않았습니다.

**해결**: 값을 채웁니다. 정말 없을 수 있는 값이면 정의에서 `price?: number`로 선택 속성을 만들 수 있지만, **쓰는 곳마다 `undefined` 확인이 생기므로** 신중히 결정합니다(→ [안티패턴: 선택 속성 남발](./02-anti-patterns)). 만드는 중인 객체라면 `Partial` 같은 별도 타입을 씁니다.

```ts
interface Product {
  id: string
  name: string
  price: number
}
const coffee: Product = { id: 'P001', name: '아메리카노', price: 4500 }
const draft: Partial<Product> = { id: 'P002' } // 작성 중인 상품
console.log(coffee.price, draft.id)
// 출력: 4500 P002
```

**관련 레슨**: [객체 타입](../part2-types/04-object-types), [내장 유틸리티 타입 총정리](../part3-intermediate/07-utility-types)

#### TS2353 · 알 수 없는 속성 (초과 속성 검사) {#ts2353}

**메시지 원문**

```text
Object literal may only specify known properties, and 'color' does not exist in type 'Product'.
```

**한국어 뜻**: "객체 리터럴에는 정의된 속성만 쓸 수 있는데, `color`는 `Product`에 없습니다."

**재현 코드**

```ts
interface Product {
  id: string
  name: string
  price: number
}
const product: Product = { id: 'P001', name: '아메리카노', price: 4500, color: 'black' }
// ❌ Object literal may only specify known properties, and 'color' does not exist in type 'Product'. (TS2353)
```

**원인**: **초과 속성 검사**(excess property check) 때문입니다. 구조적 타이핑에서는 속성이 많은 객체도 보통 할당되지만, `{ ... }`를 **그 자리에서 바로** 쓸 때만은 "오타일 가능성이 높다"고 보고 막아 줍니다.

**해결**: 오타라면 속성 이름을 고칩니다. 필요한 속성이라면 타입에 추가합니다. 변수를 거쳐 넘겨서 검사를 피하는 방법은 **진짜 오타를 숨기므로** 권하지 않습니다.

```ts
interface Product {
  id: string
  name: string
  price: number
  color?: string // 정말 필요한 속성이라면 정의에 추가
}
const product: Product = { id: 'P001', name: '텀블러', price: 15000, color: 'black' }
console.log(product.color)
// 출력: black
```

**관련 레슨**: [구조적 타이핑과 할당 가능성](../part3-intermediate/02-structural-typing)

#### TS7053 · 문자열로 인덱싱할 수 없음 {#ts7053}

**메시지 원문**

```text
Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ americano: number; latte: number; }'.
  No index signature with a parameter of type 'string' was found on type '{ americano: number; latte: number; }'.
```

**한국어 뜻**: "`string` 타입 식으로는 이 객체를 꺼낼 수 없어서 결과가 암묵적으로 `any`가 됩니다. 이 객체에는 `string` 인덱스 시그니처가 없습니다."

**재현 코드**

```ts
const stock = { americano: 30, latte: 12 }
function getStock(menu: string): number {
  return stock[menu]
  // ❌ Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ americano: number; latte: number; }'. (TS7053)
}
```

**원인**: `menu`는 아무 문자열이나 될 수 있는데, `stock`에는 `americano`와 `latte` 두 키만 있습니다. `'mocha'`가 들어오면 결과는 `undefined`인데 타입은 `number`라고 말할 수 없습니다.

**해결**: 키 타입을 좁히는 것이 가장 좋습니다(`keyof typeof stock`). 키가 실행 중에 늘어나는 사전이라면 `Record<string, number>`로 선언하고 결과를 `undefined`와 함께 다룹니다.

```ts
const stock = { americano: 30, latte: 12 }
type Menu = keyof typeof stock // 'americano' | 'latte'

function getStock(menu: Menu): number {
  return stock[menu]
}
console.log(getStock('latte'))
// 출력: 12
```

**관련 레슨**: [keyof · typeof · 인덱스 접근 타입](../part3-intermediate/06-keyof-typeof-indexed), [객체 타입](../part2-types/04-object-types)

---

### null · undefined 계열

이 계열은 `strictNullChecks`(strict에 포함)가 켜져 있을 때 나며, **실행 중 `Cannot read properties of undefined`를 미리 막아 주는** 가장 고마운 에러입니다. 번호가 여러 개로 나뉘는 기준은 다음과 같습니다.

| 코드 | 값 | 대상 |
|---|---|---|
| TS18048 | `undefined`일 수 있음 | 이름이 있는 식 (`order.discount`) |
| TS18047 | `null`일 수 있음 | 이름이 있는 식 (`memberName`) |
| TS2532 | `undefined`일 수 있음 | 이름이 없는 식 (`find(...)` 결과 등) |
| TS2531 | `null`일 수 있음 | 이름이 없는 식 |
| TS2722 | `undefined`일 수 있음 | 함수를 호출하려 할 때 |

#### TS18048 · undefined일 수 있음 {#ts18048}

**메시지 원문**

```text
'order.discount' is possibly 'undefined'.
```

**한국어 뜻**: "`order.discount`는 `undefined`일 수도 있습니다."

**재현 코드**

```ts
interface Order {
  id: string
  discount?: number
}
function finalPrice(order: Order, price: number): number {
  return price - order.discount
  // ❌ 'order.discount' is possibly 'undefined'. (TS18048)
}
```

**원인**: 선택 속성(`?`)의 타입은 `number | undefined`입니다. `undefined`로 빼기를 하면 `NaN`이 됩니다.

**해결**: 기본값(`??`)을 주거나, `if`로 좁힙니다.

```ts
interface Order {
  id: string
  discount?: number
}
function finalPrice(order: Order, price: number): number {
  return price - (order.discount ?? 0) // 할인이 없으면 0
}
console.log(finalPrice({ id: 'O001' }, 9000))
// 출력: 9000
```

**관련 레슨**: [타입 좁히기](../part2-types/08-narrowing), [연산자와 표현식](../part1-basics/03-operators)

#### TS18047 · null일 수 있음 {#ts18047}

**메시지 원문**

```text
'memberName' is possibly 'null'.
```

**한국어 뜻**: "`memberName`은 `null`일 수도 있습니다."

**재현 코드**

```ts
function findMemberName(id: string): string | null {
  return id === 'M001' ? '김민지' : null
}
const memberName = findMemberName('M002')
console.log(memberName.length)
// ❌ 'memberName' is possibly 'null'. (TS18047)
```

**원인**: 반환 타입에 `null`이 들어 있는데 확인 없이 속성에 접근했습니다.

**해결**: `if`로 좁히거나 옵셔널 체이닝(`?.`)을 씁니다. `memberName!.length`처럼 `!`로 덮는 것은 "절대 `null`이 아니다"를 **증명할 수 있을 때만** 씁니다.

```ts
function findMemberName(id: string): string | null {
  return id === 'M001' ? '김민지' : null
}
const memberName = findMemberName('M002')
if (memberName === null) {
  console.log('회원 없음')
} else {
  console.log(memberName.length)
}
// 출력: 회원 없음
```

**관련 레슨**: [타입 좁히기](../part2-types/08-narrowing), [타입 단언(as)과 non-null 단언(!)](../part2-types/10-assertion)

#### TS2532 · 객체가 undefined일 수 있음 {#ts2532}

**메시지 원문**

```text
Object is possibly 'undefined'.
```

**한국어 뜻**: "이 객체는 `undefined`일 수도 있습니다." 변수 이름 없이 식 결과에 바로 접근할 때 이 문구가 나옵니다.

**재현 코드**

```ts
interface Product {
  id: string
  name: string
}
const products: Product[] = [{ id: 'P001', name: '아메리카노' }]
console.log(products.find((p) => p.id === 'P999').name)
// ❌ Object is possibly 'undefined'. (TS2532)
```

**원인**: `find`는 못 찾으면 `undefined`를 돌려주므로 반환 타입이 `Product | undefined`입니다. `noUncheckedIndexedAccess`를 켰다면 `products[0].name`에서도 납니다.

**해결**: 결과를 변수에 담아 좁히거나, 없을 때 보여 줄 값을 정합니다.

```ts
interface Product {
  id: string
  name: string
}
const products: Product[] = [{ id: 'P001', name: '아메리카노' }]
const found = products.find((p) => p.id === 'P999')
console.log(found?.name ?? '상품 없음')
// 출력: 상품 없음
```

**관련 레슨**: [배열과 배열 메서드](../part1-basics/07-arrays), [strict 옵션 하나씩 이해하기](../part6-tooling/02-strict-options)

#### TS2531 · 객체가 null일 수 있음 {#ts2531}

**메시지 원문**

```text
Object is possibly 'null'.
```

**한국어 뜻**: "이 객체는 `null`일 수도 있습니다." TS2532의 `null` 버전입니다.

**재현 코드**

```ts
function findMemberName(id: string): string | null {
  return id === 'M001' ? '김민지' : null
}
console.log(findMemberName('M002').length)
// ❌ Object is possibly 'null'. (TS2531)
```

**원인**: `null`을 돌려줄 수 있는 식에 바로 접근했습니다. 실무에서는 `document.querySelector(...)`의 결과(`Element | null`)에서 가장 자주 만납니다.

**해결**: 결과를 변수에 담아 확인한 뒤 씁니다.

```ts
function findMemberName(id: string): string | null {
  return id === 'M001' ? '김민지' : null
}
const name1 = findMemberName('M001')
if (name1 !== null) {
  console.log(name1.length)
}
// 출력: 3
```

**관련 레슨**: [타입 좁히기](../part2-types/08-narrowing)

#### TS2722 · undefined일 수 있는 함수 호출 {#ts2722}

**메시지 원문**

```text
Cannot invoke an object which is possibly 'undefined'.
```

**한국어 뜻**: "`undefined`일 수도 있는 것을 함수로 호출할 수 없습니다."

**재현 코드**

```ts
interface ButtonProps {
  label: string
  onClick?: () => void
}
function clickButton(props: ButtonProps): void {
  props.onClick()
  // ❌ Cannot invoke an object which is possibly 'undefined'. (TS2722)
}
```

**원인**: 선택 콜백(`onClick?`)을 확인 없이 불렀습니다. React 컴포넌트의 선택 이벤트 props에서 자주 납니다.

**해결**: 옵셔널 호출 `?.()`를 씁니다. 없으면 아무것도 하지 않습니다.

```ts
interface ButtonProps {
  label: string
  onClick?: () => void
}
function clickButton(props: ButtonProps): void {
  props.onClick?.()
}
clickButton({ label: '결제' })
clickButton({ label: '취소', onClick: () => console.log('취소됨') })
// 출력: 취소됨
```

**관련 레슨**: [React + TS: 컴포넌트 · props · state · 이벤트](../part7-practice/02-react-basics)

#### TS18046 · 값이 unknown {#ts18046}

**메시지 원문**

```text
'error' is of type 'unknown'.
```

**한국어 뜻**: "`error`의 타입은 `unknown`(무엇인지 모름)입니다." 확인하기 전에는 속성을 쓸 수 없습니다.

**재현 코드**

```ts
async function loadOrder(): Promise<void> {
  try {
    await fetch('/api/orders/1')
  } catch (error) {
    console.log(error.message)
    // ❌ 'error' is of type 'unknown'. (TS18046)
  }
}
```

**원인**: JavaScript에서는 `throw 'oops'`처럼 아무 값이나 던질 수 있으므로, strict 모드(`useUnknownInCatchVariables`, TS 4.4부터)에서는 `catch`의 변수가 `unknown`입니다. `JSON.parse` 결과를 `unknown`으로 받았을 때도 같은 에러가 납니다.

**해결**: `instanceof`로 좁힌 뒤 씁니다.

```ts
async function loadOrder(): Promise<void> {
  try {
    await fetch('/api/orders/1')
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message)
    } else {
      console.log('알 수 없는 오류', error)
    }
  }
}
```

**관련 레슨**: [특수 타입: any · unknown · never · void](../part2-types/02-special-types), [async/await와 비동기 오류 처리](../part4-async/03-async-await)

---

### 암묵적 any 계열 (noImplicitAny)

#### TS7006 · 매개변수가 암묵적 any {#ts7006}

**메시지 원문**

```text
Parameter 'price' implicitly has an 'any' type.
```

**한국어 뜻**: "매개변수 `price`의 타입을 알 수 없어서 자동으로 `any`가 되었습니다."

**재현 코드**

```ts
function calcTotal(price, quantity: number): number {
  // ❌ Parameter 'price' implicitly has an 'any' type. (TS7006)
  return price * quantity
}
```

**원인**: 매개변수에 타입 표기가 없고, 문맥(콜백 등)으로 추론할 수도 없습니다. 함수 매개변수는 **표기가 기본**입니다.

**해결**: 타입을 적습니다.

```ts
function calcTotal(price: number, quantity: number): number {
  return price * quantity
}
console.log(calcTotal(4500, 2))
// 출력: 9000
```

**관련 레슨**: [타입 표기와 타입 추론](../part2-types/01-annotation-inference), [strict 옵션 하나씩 이해하기](../part6-tooling/02-strict-options)

#### TS2683 · this의 타입을 모름 {#ts2683}

**메시지 원문**

```text
'this' implicitly has type 'any' because it does not have a type annotation.
```

**한국어 뜻**: "`this`에 타입 표기가 없어서 암묵적으로 `any`가 됩니다."

**재현 코드**

```ts
function printName() {
  console.log(this.name)
  // ❌ 'this' implicitly has type 'any' because it does not have a type annotation. (TS2683)
}
```

**원인**: 일반 함수의 `this`는 **부르는 방식**에 따라 바뀌므로, 함수만 보고는 타입을 알 수 없습니다(`noImplicitThis`).

**해결**: 대부분은 `this` 대신 매개변수로 받는 것이 더 명확합니다. 꼭 `this`가 필요하면 첫 매개변수 자리에 `this: 타입`을 적습니다(실제 인수는 아님).

```ts
interface Member {
  name: string
}
function printName(member: Member): void {
  console.log(member.name)
}
printName({ name: '김민지' })
// 출력: 김민지
```

**관련 레슨**: [클래스](../part3-intermediate/08-classes), [스코프와 클로저](../part1-basics/10-scope-closure)

---

### 함수 반환 · 흐름 분석 계열

#### TS2355 · 반환값이 없음 {#ts2355}

**메시지 원문**

```text
A function whose declared type is neither 'undefined', 'void', nor 'any' must return a value.
```

**한국어 뜻**: "선언한 반환 타입이 `undefined`·`void`·`any`가 아닌 함수는 값을 반환해야 합니다."

**재현 코드**

```ts
function getDiscountRate(grade: string): number {
  // ❌ A function whose declared type is neither 'undefined', 'void', nor 'any' must return a value. (TS2355)
  if (grade === 'VIP') {
    console.log('VIP 할인')
  }
}
```

**원인**: `: number`라고 약속했는데 `return`이 하나도 없습니다.

**해결**: 모든 경로에서 값을 돌려줍니다.

```ts
function getDiscountRate(grade: string): number {
  if (grade === 'VIP') {
    return 0.1
  }
  return 0
}
console.log(getDiscountRate('VIP'))
// 출력: 0.1
```

**관련 레슨**: [함수 기초](../part1-basics/06-functions)

#### TS2366 · 끝에 반환문이 없음 {#ts2366}

**메시지 원문**

```text
Function lacks ending return statement and return type does not include 'undefined'.
```

**한국어 뜻**: "함수 끝에 반환문이 없는 경로가 있는데, 반환 타입에 `undefined`가 들어 있지 않습니다."

**재현 코드**

```ts
function getDiscountRate(grade: 'VIP' | 'GOLD' | 'SILVER'): number {
  // ❌ Function lacks ending return statement and return type does not include 'undefined'. (TS2366)
  switch (grade) {
    case 'VIP':
      return 0.1
    case 'GOLD':
      return 0.05
  }
}
```

**원인**: `'SILVER'`가 들어오면 어떤 `case`에도 걸리지 않고 끝에 도달해 `undefined`를 반환합니다. 이 에러는 **처리하지 않은 경우가 있다**는 귀중한 신호입니다.

**해결**: 빠진 경우를 처리합니다. 판별 유니온이라면 `never`로 완전성 검사를 추가해, 나중에 등급이 늘어날 때도 에러가 나게 만듭니다.

```ts
type Grade = 'VIP' | 'GOLD' | 'SILVER'

function getDiscountRate(grade: Grade): number {
  switch (grade) {
    case 'VIP':
      return 0.1
    case 'GOLD':
      return 0.05
    case 'SILVER':
      return 0.02
    default: {
      const unreachable: never = grade // 등급이 추가되면 여기서 에러
      return unreachable
    }
  }
}
console.log(getDiscountRate('SILVER'))
// 출력: 0.02
```

**관련 레슨**: [판별 유니온과 완전성 검사](../part3-intermediate/03-discriminated-union)

#### TS2367 · 절대 같을 수 없는 비교 {#ts2367}

**메시지 원문**

```text
This comparison appears to be unintentional because the types 'OrderStatus' and '"DONE"' have no overlap.
```

**한국어 뜻**: "`OrderStatus`와 `"DONE"`은 겹치는 값이 없으므로, 이 비교는 실수로 보입니다."

**재현 코드**

```ts
type OrderStatus = 'READY' | 'PAID' | 'CANCELED'
function isDone(status: OrderStatus): boolean {
  return status === 'DONE'
  // ❌ This comparison appears to be unintentional because the types 'OrderStatus' and '"DONE"' have no overlap. (TS2367)
}
```

**원인**: 비교 결과가 **언제나 `false`** 입니다. 상태 이름 오타, 서버와 프런트의 코드 값 불일치, 이미 좁혀진 변수를 다시 비교하는 경우에 납니다.

**해결**: 올바른 값으로 비교합니다. 정말 새로운 상태라면 타입에 추가합니다.

```ts
type OrderStatus = 'READY' | 'PAID' | 'CANCELED'
function isDone(status: OrderStatus): boolean {
  return status === 'PAID'
}
console.log(isDone('PAID'))
// 출력: true
```

**관련 레슨**: [유니온 타입과 리터럴 타입](../part2-types/06-union-literal)

#### TS2454 · 값을 넣기 전에 사용 {#ts2454}

**메시지 원문**

```text
Variable 'grade' is used before being assigned.
```

**한국어 뜻**: "변수 `grade`를 값을 넣기 전에 사용했습니다."

**재현 코드**

```ts
let grade: string
const point = 1200
if (point > 1000) {
  grade = 'GOLD'
}
console.log(grade)
// ❌ Variable 'grade' is used before being assigned. (TS2454)
```

**원인**: `point`가 1000 이하이면 `grade`에 아무것도 들어가지 않습니다. TypeScript는 **모든 경로**를 따라가 봅니다(제어 흐름 분석).

**해결**: 선언할 때 기본값을 주거나, `else`에서도 값을 넣습니다.

```ts
const point = 1200
const grade = point > 1000 ? 'GOLD' : 'BASIC'
console.log(grade)
// 출력: GOLD
```

**관련 레슨**: [조건문](../part1-basics/04-conditionals), [타입 좁히기](../part2-types/08-narrowing)

---

### 변수 · 이름 계열

#### TS2304 · TS2552 · 이름을 찾을 수 없음 {#ts2304}

**메시지 원문**

```text
Cannot find name 'calcTotal'.
Cannot find name 'calcTotl'. Did you mean 'calcTotal'?
```

**한국어 뜻**: "`calcTotal`이라는 이름을 찾을 수 없습니다." 비슷한 이름이 있으면 TS2552로 바뀌어 "혹시 `calcTotal`인가요?"라고 제안합니다.

**재현 코드**

```ts
// 다른 파일의 calcTotal을 import하지 않고 사용
const total = calcTotal(4500, 2)
// ❌ Cannot find name 'calcTotal'. (TS2304)
```

```ts
function calcTotal(price: number, quantity: number): number {
  return price * quantity
}
const total = calcTotl(4500, 2)
// ❌ Cannot find name 'calcTotl'. Did you mean 'calcTotal'? (TS2552)
```

**원인**: ① 오타, ② `import` 누락, ③ 다른 스코프(블록·함수 안)에 선언된 이름, ④ Node·브라우저 전역 타입(`process`, `document`)이 설정에 없음(`@types/node` 미설치, `lib`에 `dom` 없음).

**해결**: 오타를 고치거나 import를 추가합니다. `process`·`require` 같은 Node 전역이라면 `npm i -D @types/node`를 설치합니다.

```ts
function calcTotal(price: number, quantity: number): number {
  return price * quantity
}
const total = calcTotal(4500, 2)
console.log(total)
// 출력: 9000
```

**관련 레슨**: [스코프와 클로저](../part1-basics/10-scope-closure), [tsconfig.json 완전 정복](../part6-tooling/01-tsconfig)

#### TS2448 · 선언 전에 사용 {#ts2448}

**메시지 원문**

```text
Block-scoped variable 'taxRate' used before its declaration.
```

**한국어 뜻**: "블록 스코프 변수 `taxRate`를 선언하기 전에 사용했습니다." 보통 TS2454가 함께 나옵니다.

**재현 코드**

```ts
console.log(taxRate)
// ❌ Block-scoped variable 'taxRate' used before its declaration. (TS2448)
// ❌ Variable 'taxRate' is used before being assigned. (TS2454)
const taxRate = 0.1
```

**원인**: `let`·`const`는 선언 줄에 도달하기 전까지 쓸 수 없는 구간(TDZ, Temporal Dead Zone)이 있습니다. 실행하면 `ReferenceError`가 납니다.

**해결**: 선언을 사용보다 위로 옮깁니다.

```ts
const taxRate = 0.1
console.log(taxRate)
// 출력: 0.1
```

**관련 레슨**: [값과 변수: let · const](../part1-basics/01-values-and-variables)

#### TS2588 · 상수에 다시 대입 {#ts2588}

**메시지 원문**

```text
Cannot assign to 'storeName' because it is a constant.
```

**한국어 뜻**: "`storeName`은 상수라서 다시 대입할 수 없습니다."

**재현 코드**

```ts
const storeName = '강남점'
storeName = '홍대점'
// ❌ Cannot assign to 'storeName' because it is a constant. (TS2588)
```

**원인**: `const`로 선언한 변수에 새 값을 넣었습니다.

**해결**: 정말 바뀌어야 하는 값이면 `let`으로 선언합니다. 아니라면 새 이름의 상수를 만듭니다.

```ts
let storeName = '강남점'
storeName = '홍대점'
console.log(storeName)
// 출력: 홍대점
```

**관련 레슨**: [값과 변수: let · const](../part1-basics/01-values-and-variables)

#### TS6133 · 선언했지만 쓰지 않음 {#ts6133}

**메시지 원문**

```text
'tax' is declared but its value is never read.
```

**한국어 뜻**: "`tax`를 선언했지만 그 값을 한 번도 읽지 않았습니다." `noUnusedLocals`(지역 변수)·`noUnusedParameters`(매개변수)를 켰을 때 에러로 나옵니다. 끄면 에디터에서 흐리게만 표시됩니다.

**재현 코드** (`--noUnusedLocals`로 검사)

```ts
export function calcTotal(price: number, quantity: number): number {
  const tax = price * 0.1
  // ❌ 'tax' is declared but its value is never read. (TS6133)
  return price * quantity
}
```

**원인**: 계산만 해 두고 쓰지 않았습니다. 리팩터링하다 남은 코드이거나, **쓰려던 값을 빠뜨린 버그**일 수 있습니다.

**해결**: 정말 필요 없으면 지우고, 쓰려던 것이면 사용합니다. 콜백 매개변수처럼 자리만 필요하면 이름을 `_`로 시작하게 합니다(`noUnusedParameters`는 `_`로 시작하는 매개변수를 검사하지 않습니다).

```ts
export function calcTotal(price: number, quantity: number): number {
  const tax = price * 0.1
  return (price + tax) * quantity
}
```

**관련 레슨**: [tsconfig.json 완전 정복](../part6-tooling/01-tsconfig)

#### TS1005 · 기호가 빠짐 {#ts1005}

**메시지 원문**

```text
',' expected.
```

**한국어 뜻**: "여기에 `,`가 있어야 합니다." `';' expected`, `')' expected`처럼 빠진 기호가 바뀌어 나옵니다.

**재현 코드**

```ts
const product = { name: '아메리카노' price: 4500 }
// ❌ ',' expected. (TS1005)
```

**원인**: 문법 오류입니다. 객체 속성 사이 쉼표, 괄호 짝, 따옴표 짝이 맞지 않습니다. **표시된 위치보다 앞**에 진짜 원인이 있는 경우가 많습니다(예: 몇 줄 위에서 괄호를 닫지 않음).

**해결**: 표시된 위치와 그 앞 줄을 확인합니다. 저장할 때 Prettier가 실패하는 것도 좋은 단서입니다.

```ts
const product = { name: '아메리카노', price: 4500 }
console.log(product.price)
// 출력: 4500
```

**관련 레슨**: [에러 메시지 읽는 법과 도움 받는 법](../part0-start/06-how-to-read-errors)

#### TS2365 · TS2362 · 연산자를 쓸 수 없음 {#ts2365}

**메시지 원문**

```text
Operator '+' cannot be applied to types 'string | number' and 'number'.
The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
```

**한국어 뜻**: "`string | number`와 `number`에는 `+` 연산자를 쓸 수 없습니다." / "산술 연산의 왼쪽은 숫자 계열 타입이어야 합니다."

**재현 코드**

```ts
const amount: string | number = Math.random() > 0.5 ? 1000 : '1000'
const plusOne = amount + 1
// ❌ Operator '+' cannot be applied to types 'string | number' and 'number'. (TS2365)
const doubled = amount * 2
// ❌ The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type. (TS2362)
```

**원인**: `+`는 문자열이면 **이어 붙이기**, 숫자면 **더하기**라서 결과가 달라집니다(`'1000' + 1`은 `'10001'`). TypeScript는 어느 쪽인지 모르는 연산을 막습니다.

**해결**: 먼저 숫자로 바꾸거나 좁힙니다.

```ts
const amount: string | number = Math.random() > 0.5 ? 1000 : '1000'
const value = typeof amount === 'string' ? Number(amount) : amount
console.log(value + 1, value * 2)
// 출력: 1001 2000
```

**관련 레슨**: [연산자와 표현식](../part1-basics/03-operators), [타입 좁히기](../part2-types/08-narrowing)

---

### 단언 · 클래스 계열

#### TS2352 · 무리한 타입 단언 {#ts2352}

**메시지 원문**

```text
Conversion of type 'string' to type 'Product' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
```

**한국어 뜻**: "`string`을 `Product`로 바꾸는 것은 실수로 보입니다. 두 타입이 충분히 겹치지 않습니다. 의도한 것이라면 먼저 `unknown`으로 바꾸세요."

**재현 코드**

```ts
interface Product {
  id: string
  price: number
}
const raw = '4500'
const product = raw as Product
// ❌ Conversion of type 'string' to type 'Product' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first. (TS2352)
```

**원인**: `as`는 값을 **바꾸지 않고** 컴파일러에게 "이 타입이라고 믿어라"라고 말할 뿐입니다. 전혀 관계없는 타입끼리는 TypeScript도 받아 주지 않습니다.

**해결**: 메시지가 권하는 `as unknown as Product`는 **대부분 잘못된 해결**입니다. 실제 값을 원하는 모양으로 **만들거나**, 외부 데이터라면 **검증**합니다.

```ts
interface Product {
  id: string
  price: number
}
const raw = '4500'
const product: Product = { id: 'P001', price: Number(raw) } // 값을 실제로 만든다
console.log(product.price)
// 출력: 4500
```

**관련 레슨**: [타입 단언(as)과 non-null 단언(!)](../part2-types/10-assertion), [런타임 검증 (zod)](../part4-async/05-runtime-validation)

#### TS2564 · 클래스 속성 초기화 누락 {#ts2564}

**메시지 원문**

```text
Property 'ownerId' has no initializer and is not definitely assigned in the constructor.
```

**한국어 뜻**: "`ownerId` 속성에 초기값이 없고, 생성자에서 확실히 값을 넣지도 않습니다."

**재현 코드**

```ts
class Cart {
  ownerId: string
  // ❌ Property 'ownerId' has no initializer and is not definitely assigned in the constructor. (TS2564)
  items: string[] = []
}
```

**원인**: `strictPropertyInitialization` 때문입니다. 객체를 만든 직후 `ownerId`가 `undefined`인데 타입은 `string`이라고 거짓말하게 됩니다.

**해결**: 생성자에서 값을 받습니다. 프레임워크가 나중에 넣어 주는 경우(의존성 주입 등)에만 `ownerId!: string`(확정 할당 단언)을 씁니다.

```ts
class Cart {
  items: string[] = []
  constructor(public ownerId: string) {}
}
const cart = new Cart('M001')
console.log(cart.ownerId)
// 출력: M001
```

**관련 레슨**: [클래스: 접근 제어자 · 추상 클래스 · implements](../part3-intermediate/08-classes)

#### TS2416 · 부모 클래스와 맞지 않는 재정의 {#ts2416}

**메시지 원문**

```text
Property 'pay' in type 'CardPayment' is not assignable to the same property in base type 'Payment'.
  Type '(amount: string) => string' is not assignable to type '(amount: number) => string'.
    Types of parameters 'amount' and 'amount' are incompatible.
      Type 'number' is not assignable to type 'string'.
```

**한국어 뜻**: "`CardPayment`의 `pay`는 부모 `Payment`의 `pay` 자리에 들어갈 수 없습니다." 맨 아랫줄이 결정적 이유입니다. "매개변수 `amount`의 타입이 서로 맞지 않습니다."

**재현 코드**

```ts
class Payment {
  pay(amount: number): string {
    return `${amount}원 결제`
  }
}
class CardPayment extends Payment {
  pay(amount: string): string {
    // ❌ Property 'pay' in type 'CardPayment' is not assignable to the same property in base type 'Payment'. (TS2416)
    return `카드 ${amount}`
  }
}
```

**원인**: 자식은 부모 자리에 들어갈 수 있어야 합니다. `Payment`를 쓰는 코드는 `pay(9000)`처럼 숫자를 넘기는데, `CardPayment`는 문자열을 기대하므로 약속이 깨집니다.

**해결**: 부모와 같은(또는 더 넓은) 매개변수를 받습니다.

```ts
class Payment {
  pay(amount: number): string {
    return `${amount}원 결제`
  }
}
class CardPayment extends Payment {
  pay(amount: number): string {
    return `카드 ${amount}원 결제`
  }
}
const payment: Payment = new CardPayment()
console.log(payment.pay(9000))
// 출력: 카드 9000원 결제
```

**관련 레슨**: [클래스](../part3-intermediate/08-classes), [변성(공변·반공변)과 함수 타입 호환성](../part5-advanced/07-variance)

#### TS2420 · 인터페이스를 제대로 구현하지 않음 {#ts2420}

**메시지 원문**

```text
Class 'Receipt' incorrectly implements interface 'Printable'.
  Property 'print' is missing in type 'Receipt' but required in type 'Printable'.
```

**한국어 뜻**: "`Receipt` 클래스는 `Printable` 인터페이스를 잘못 구현했습니다. `print` 메서드가 빠졌습니다."

**재현 코드**

```ts
interface Printable {
  print(): string
}
class Receipt implements Printable {
  // ❌ Class 'Receipt' incorrectly implements interface 'Printable'. (TS2420)
  total = 9000
}
```

**원인**: `implements`는 "이 약속을 지키겠다"는 선언입니다. 약속한 멤버가 없거나 타입이 다릅니다.

**해결**: 빠진 멤버를 구현합니다. VS Code에서 클래스 이름에 커서를 두고 빠른 수정(`Ctrl + .`) → "Implement interface"를 고르면 뼈대를 만들어 줍니다.

```ts
interface Printable {
  print(): string
}
class Receipt implements Printable {
  total = 9000
  print(): string {
    return `합계 ${this.total}원`
  }
}
console.log(new Receipt().print())
// 출력: 합계 9000원
```

**관련 레슨**: [클래스](../part3-intermediate/08-classes)

---

### 제네릭 · 고급 타입 계열

#### TS2344 · 제네릭 제약 위반 {#ts2344}

**메시지 원문**

```text
Type '{ code: string; }' does not satisfy the constraint '{ id: string; }'.
  Property 'id' is missing in type '{ code: string; }' but required in type '{ id: string; }'.
```

**한국어 뜻**: "`{ code: string }`은 제약 `{ id: string }`을 만족하지 않습니다. `id` 속성이 없습니다."

**재현 코드**

```ts
type EntityId<T extends { id: string }> = T['id']
type CouponId = EntityId<{ code: string }>
// ❌ Type '{ code: string; }' does not satisfy the constraint '{ id: string; }'. (TS2344)
```

**원인**: 제네릭 매개변수에 `extends`로 건 조건을 타입 인수가 만족하지 못합니다.

**해결**: 조건을 만족하는 타입을 넘기거나, 제약이 너무 좁다면 제약을 다시 설계합니다.

```ts
type EntityId<T extends { id: string }> = T['id']
type CouponId = EntityId<{ id: string; code: string }>
const couponId: CouponId = 'C001'
console.log(couponId)
// 출력: C001
```

**관련 레슨**: [제네릭 제약(extends)과 기본 타입 매개변수](../part3-intermediate/05-generic-constraints)

#### TS2589 · 타입 인스턴스화가 너무 깊음 {#ts2589}

**메시지 원문**

```text
Type instantiation is excessively deep and possibly infinite.
```

**한국어 뜻**: "타입을 계산하는 깊이가 너무 깊어서 무한 반복일 수도 있습니다."

**재현 코드**

```ts
type Repeat<S extends string, N extends number, Acc extends string[] = []> =
  Acc['length'] extends N ? Acc : Repeat<S, N, [...Acc, S]>
type ThousandA = Repeat<'a', 1000>
// ❌ Type instantiation is excessively deep and possibly infinite. (TS2589)
```

**원인**: 재귀 타입이 컴파일러의 깊이 한도(꼬리 재귀가 아닌 경우 대략 50단계, 꼬리 재귀로 최적화되는 조건부 타입은 1000단계)를 넘었습니다. 라이브러리(폼·ORM 등)의 복잡한 타입에 깊게 중첩된 객체를 넣을 때도 납니다.

**해결**: 재귀 깊이를 줄이거나, 그만큼 정밀한 타입이 정말 필요한지 다시 생각합니다. 대부분은 더 단순한 타입(`string[]`)으로 충분합니다. 라이브러리에서 난다면 타입 인수를 명시해 추론 범위를 줄여 봅니다.

```ts
type Repeat<S extends string, N extends number, Acc extends string[] = []> =
  Acc['length'] extends N ? Acc : Repeat<S, N, [...Acc, S]>
type ThreeA = Repeat<'a', 3> // ['a', 'a', 'a']
const sample: ThreeA = ['a', 'a', 'a']
console.log(sample.length)
// 출력: 3
```

**관련 레슨**: [재귀 타입](../part5-advanced/05-recursive-types), [대규모 코드베이스: 타입 체크 성능](./03-large-codebase)

---

### 비동기 계열

#### TS1308 · async 밖의 await {#ts1308}

**메시지 원문**

```text
'await' expressions are only allowed within async functions and at the top levels of modules.
```

**한국어 뜻**: "`await`는 async 함수 안이나 모듈의 최상위에서만 쓸 수 있습니다."

**재현 코드**

```ts
function loadOrders() {
  const res = await fetch('/api/orders')
  // ❌ 'await' expressions are only allowed within async functions and at the top levels of modules. (TS1308)
  return res
}
```

**원인**: 함수 앞에 `async`를 빠뜨렸습니다. 콜백(`map`, `forEach`) 안에서 `await`를 쓰면서 **콜백 쪽**에 `async`를 빠뜨린 경우도 흔합니다.

**해결**: `async`를 붙입니다. 반환 타입은 `Promise`로 감싸집니다.

```ts
async function loadOrders(): Promise<Response> {
  const res = await fetch('/api/orders')
  return res
}
```

**관련 레슨**: [async/await와 비동기 오류 처리](../part4-async/03-async-await)

---

### 모듈 · 설정 계열

이 계열은 코드보다 **설정(tsconfig)과 파일 위치**가 원인인 경우가 많습니다. 재현할 때 쓴 옵션을 각 항목에 적었습니다.

#### TS2307 · 모듈을 찾을 수 없음 {#ts2307}

**메시지 원문**

```text
Cannot find module './utils/price' or its corresponding type declarations.
```

**한국어 뜻**: "`./utils/price` 모듈이나 그 타입 선언을 찾을 수 없습니다."

**재현 코드** (`--module esnext --moduleResolution bundler`)

```ts
import { formatPrice } from './utils/price'
// ❌ Cannot find module './utils/price' or its corresponding type declarations. (TS2307)
```

**원인**: ① 경로 오타(대소문자 포함: Windows에서는 되는데 Linux CI에서 실패), ② 패키지 미설치, ③ tsconfig `paths` 별칭(`@/utils`)을 썼는데 설정이 없음, ④ `.vue`·`.svg`처럼 TS가 모르는 확장자를 import(→ `declare module '*.svg'` 선언 필요).

**해결**: 파일 위치와 대소문자를 확인하고, 패키지라면 `npm install`, 별칭이라면 `compilerOptions.paths`와 번들러 설정을 함께 맞춥니다.

```ts
// 실제 파일 위치에 맞춘 경로
import { formatPrice } from './price'
console.log(formatPrice(4500))
```

**관련 레슨**: [모듈: import/export와 타입 전용 import](../part3-intermediate/09-modules), [모듈 시스템](../part6-tooling/03-module-systems)

#### TS2305 · 내보낸 이름이 없음 {#ts2305}

**메시지 원문**

```text
Module '"./price"' has no exported member 'formatWon'.
```

**한국어 뜻**: "`./price` 모듈에는 `formatWon`이라는 이름으로 내보낸(export) 것이 없습니다."

**재현 코드** (`price.ts`는 `formatPrice`만 export)

```ts
import { formatWon } from './price'
// ❌ Module '"./price"' has no exported member 'formatWon'. (TS2305)
```

**원인**: 이름 오타, `export`를 빠뜨림, 라이브러리 버전이 바뀌어 이름이 바뀜(메이저 업데이트 후 흔함).

**해결**: 모듈 파일에서 실제로 export한 이름을 확인합니다. VS Code에서 `{ }` 안에 커서를 두고 `Ctrl + Space`를 누르면 내보낸 이름 목록이 보입니다.

**관련 레슨**: [모듈: import/export와 타입 전용 import](../part3-intermediate/09-modules)

#### TS1192 · TS2613 · default export가 없음 {#ts1192}

**메시지 원문** (경로 부분은 프로젝트마다 다릅니다)

```text
Module '"(프로젝트 경로)/price"' has no default export.
Module '"(프로젝트 경로)/price"' has no default export. Did you mean to use 'import { formatPrice } from "(프로젝트 경로)/price"' instead?
```

**한국어 뜻**: "그 모듈에는 default export가 없습니다." 가져오는 이름이 named export와 같으면 TS2613으로 바뀌어 "`{ }`로 가져오려던 것 아닌가요?"라고 제안합니다.

**재현 코드** (`price.ts`에는 `export function formatPrice`만 있음, `--module esnext --moduleResolution bundler`)

```ts
import Fmt from './price'
// ❌ Module '"(프로젝트 경로)/price"' has no default export. (TS1192)
import formatPrice from './price'
// ❌ Module '"(프로젝트 경로)/price"' has no default export. Did you mean to use 'import { formatPrice } from "(프로젝트 경로)/price"' instead? (TS2613)
```

**원인**: `export default`로 내보낸 것과 `export function`으로 내보낸 것을 가져오는 문법이 다릅니다. 기본(default)은 `import 아무이름 from`, 이름 있는(named) 것은 `import { 정확한이름 } from`입니다.

**해결**: 모듈이 내보낸 방식에 맞춰 가져옵니다.

```ts
import { formatPrice } from './price'
console.log(formatPrice(4500))
```

**관련 레슨**: [모듈: import/export와 타입 전용 import](../part3-intermediate/09-modules)

#### TS1259 · esModuleInterop 없이 default import {#ts1259}

**메시지 원문**

```text
Module '"(프로젝트 경로)/node_modules/@types/legacy-logger/index"' can only be default-imported using the 'esModuleInterop' flag
```

**한국어 뜻**: "이 모듈은 `esModuleInterop` 옵션을 켜야만 default import할 수 있습니다."

**재현 코드** (`--module commonjs`, `esModuleInterop` 끔. 타입 선언이 `export = log` 형태인 CommonJS 패키지)

```ts
import log from 'legacy-logger'
// ❌ Module '...' can only be default-imported using the 'esModuleInterop' flag (TS1259)
log('주문 저장')
```

**원인**: 오래된 CommonJS 패키지는 `module.exports = 함수` 형태라 "default export"라는 개념이 없습니다. `esModuleInterop`은 이런 모듈을 default import처럼 쓸 수 있게 이어 주는 옵션입니다.

**해결**: tsconfig에 `"esModuleInterop": true`를 켭니다(`tsc --init`으로 만든 설정에는 기본으로 켜져 있습니다). 옵션을 켤 수 없는 환경이라면 `import log = require('legacy-logger')` 문법을 씁니다.

```json
{
  "compilerOptions": {
    "esModuleInterop": true
  }
}
```

**관련 레슨**: [모듈 시스템: ESM · CommonJS · moduleResolution](../part6-tooling/03-module-systems)

#### TS2835 · 상대 경로에 확장자 필요 {#ts2835}

**메시지 원문**

```text
Relative import paths need explicit file extensions in ECMAScript imports when '--moduleResolution' is 'node16' or 'nodenext'. Did you mean './price.js'?
```

**한국어 뜻**: "`moduleResolution`이 `node16`·`nodenext`일 때 ESM import의 상대 경로에는 확장자를 꼭 써야 합니다. `./price.js`를 말한 건가요?"

**재현 코드** (`package.json`에 `"type": "module"`, `--module nodenext`)

```ts
import { formatPrice } from './price'
// ❌ Relative import paths need explicit file extensions in ECMAScript imports when '--moduleResolution' is 'node16' or 'nodenext'. Did you mean './price.js'? (TS2835)
```

**원인**: Node.js의 ESM은 브라우저처럼 **확장자를 추측하지 않습니다**. TypeScript는 컴파일 결과가 Node에서 그대로 동작하도록 같은 규칙을 검사합니다.

**해결**: 소스가 `.ts`여도 **컴파일 결과의 확장자인 `.js`** 를 적습니다. 처음에는 어색하지만 이것이 정답입니다. Vite 같은 번들러를 쓰는 프로젝트라면 `"moduleResolution": "bundler"`가 더 맞는 설정일 수 있습니다.

```ts
import { formatPrice } from './price.js' // price.ts를 가리킴
console.log(formatPrice(4500))
```

**관련 레슨**: [모듈 시스템: ESM · CommonJS · moduleResolution](../part6-tooling/03-module-systems), [빌드 도구](../part6-tooling/06-build-tools)

#### TS7016 · 타입 선언 파일이 없음 {#ts7016}

**메시지 원문**

```text
Could not find a declaration file for module 'legacy-barcode'. '(프로젝트 경로)/node_modules/legacy-barcode/index.js' implicitly has an 'any' type.
  Try `npm i --save-dev @types/legacy-barcode` if it exists or add a new declaration (.d.ts) file containing `declare module 'legacy-barcode';`
```

**한국어 뜻**: "`legacy-barcode` 모듈의 선언 파일(.d.ts)을 찾을 수 없어서 암묵적으로 `any`가 됩니다. `@types/legacy-barcode`가 있다면 설치하고, 없다면 직접 선언 파일을 만드세요."

**재현 코드** (JavaScript로만 된 패키지를 설치한 상태)

```ts
import toBarcode from 'legacy-barcode'
// ❌ Could not find a declaration file for module 'legacy-barcode'. (TS7016)
console.log(toBarcode('P001'))
```

**원인**: 패키지가 JavaScript로만 작성되어 타입 정보가 없습니다.

**해결**: 순서대로 시도합니다.

1. `npm i -D @types/패키지이름` — DefinitelyTyped에 커뮤니티 타입이 있는지 확인합니다.
2. 없다면 프로젝트에 선언 파일을 만들어 **쓰는 부분만** 타입을 적습니다.

```ts
// src/types/legacy-barcode.d.ts
declare module 'legacy-barcode' {
  export default function toBarcode(code: string): string
}
```

`declare module 'legacy-barcode';` 한 줄로 끝내면 에러는 사라지지만 모든 것이 `any`가 되므로 임시방편으로만 씁니다.

**관련 레슨**: [선언 파일(.d.ts) · 선언 병합 · 모듈 보강](../part5-advanced/08-declaration-files)

## 자주 하는 실수

### 실수 1: 에러를 `as any`로 덮기

```ts
interface Order {
  id: string
  discount?: number
}
function finalPrice(order: Order, price: number): number {
  return price - (order as any).discount // 에러는 사라졌지만...
}
console.log(finalPrice({ id: 'O001' }, 9000))
// 출력: NaN
```

**왜 틀렸나**: 에러는 사라졌지만 버그는 그대로입니다. `undefined`를 빼서 `NaN`이 나옵니다. 컴파일러가 알려 준 진짜 문제(할인이 없을 수 있음)를 숨겼습니다.

**고친 코드**

```ts
interface Order {
  id: string
  discount?: number
}
function finalPrice(order: Order, price: number): number {
  return price - (order.discount ?? 0)
}
console.log(finalPrice({ id: 'O001' }, 9000))
// 출력: 9000
```

### 실수 2: 긴 에러의 첫 줄만 읽기

TS2769, TS2416처럼 여러 줄짜리 에러에서 첫 줄("No overload matches this call")만 보면 무엇을 고쳐야 할지 알 수 없습니다. **들여쓰기가 가장 깊은 줄**이 결정적 이유입니다. 앞의 TS2416 예에서는 `Type 'number' is not assignable to type 'string'`, 즉 "매개변수 타입이 다르다"가 핵심입니다.

### 실수 3: 에러가 난 줄만 고치기

```ts
function getPrice(): number | undefined {
  return Math.random() > 0.5 ? 4500 : undefined
}
const total: number = getPrice()!
console.log(total * 2)
```

**왜 틀렸나**: `Type 'number | undefined' is not assignable to type 'number'.` 에러를 `!`로 지웠습니다. 하지만 원인은 "가격이 없을 수 있다"는 설계이고, 실제로 절반 확률로 `NaN`이 출력됩니다. 에러는 **증상이 드러난 곳**에서 나지만, 고칠 곳은 **값이 만들어지는 곳이나 처리 방침**인 경우가 많습니다.

**고친 코드**

```ts
function getPrice(): number | undefined {
  return Math.random() > 0.5 ? 4500 : undefined
}
const price = getPrice()
if (price === undefined) {
  console.log('가격 정보 없음')
} else {
  console.log(price * 2)
}
```

### 실수 4: 에러가 너무 많을 때 아래부터 고치기

문법 에러(TS1005)가 하나 있으면 그 뒤로 수십 개의 엉뚱한 에러가 따라 나옵니다. **가장 위의 에러, 특히 1000번대 문법 에러부터** 고친 뒤 다시 검사합니다.

## 직접 해 보기

### 문제 1 ⭐ 에러 코드 맞히기

다음 코드에서 나는 에러 코드를 맞혀 보세요.

```ts
interface Member {
  id: string
  grade: 'VIP' | 'BASIC'
}
const member: Member = { id: 'M001', grade: 'GOLD' }
```

::: details 정답 보기
**TS2322** `Type '"GOLD"' is not assignable to type '"VIP" | "BASIC"'.`

`grade` 자리에는 `'VIP'`와 `'BASIC'` 두 값만 들어갈 수 있습니다. 새 등급이 필요하면 타입에 `'GOLD'`를 추가합니다.
:::

### 문제 2 ⭐ undefined 처리

다음 코드의 에러를 `!` 없이 고쳐 보세요. 회원이 없으면 `'비회원'`을 출력합니다.

```ts
const members = [{ id: 'M001', name: '김민지' }]
const target = members.find((m) => m.id === 'M002')
console.log(target.name)
// ❌ 'target' is possibly 'undefined'. (TS18048)
```

::: details 정답 보기

```ts
const members = [{ id: 'M001', name: '김민지' }]
const target = members.find((m) => m.id === 'M002')
console.log(target?.name ?? '비회원')
// 출력: 비회원
```

`?.`는 `target`이 `undefined`면 바로 `undefined`를 돌려주고, `??`는 왼쪽이 `null`·`undefined`일 때 오른쪽 값을 씁니다.
:::

### 문제 3 ⭐⭐ 인덱싱 에러

`priceTable[menu]`에서 TS7053이 납니다. `menu`가 표에 없는 메뉴일 수도 있다는 점을 살려서 고쳐 보세요(없으면 `0`).

```ts
const priceTable = { americano: 4500, latte: 5000 }
function getPrice(menu: string): number {
  return priceTable[menu]
}
```

::: details 정답 보기

```ts
const priceTable: Record<string, number | undefined> = { americano: 4500, latte: 5000 }
function getPrice(menu: string): number {
  return priceTable[menu] ?? 0
}
console.log(getPrice('latte'), getPrice('mocha'))
// 출력: 5000 0
```

메뉴 이름이 화면 입력처럼 **임의의 문자열**로 들어오면 `keyof typeof`로 좁힐 수 없습니다. 이때는 "없을 수 있다"를 타입(`number | undefined`)에 드러내고 기본값으로 처리합니다. 메뉴가 코드 안에서 정해진 값이라면 [TS7053 항목](#ts7053)처럼 `keyof typeof priceTable`이 더 좋습니다.
:::

### 문제 4 ⭐⭐ 완전성 검사

다음 함수에 결제 수단 `'POINT'`가 추가되었습니다. 어떤 에러가 나야 바람직하며, 그렇게 되도록 코드를 고쳐 보세요.

```ts
type PayMethod = 'CARD' | 'CASH' | 'POINT'
function feeRate(method: PayMethod): number {
  switch (method) {
    case 'CARD':
      return 0.02
    case 'CASH':
      return 0
  }
}
```

::: details 정답 보기
지금은 TS2366(`Function lacks ending return statement ...`)이 납니다. 이것도 좋은 신호지만, `default`에서 `never` 검사를 해 두면 "어떤 값이 빠졌는지"까지 알려 줍니다.

```ts
type PayMethod = 'CARD' | 'CASH' | 'POINT'
function feeRate(method: PayMethod): number {
  switch (method) {
    case 'CARD':
      return 0.02
    case 'CASH':
      return 0
    case 'POINT':
      return 0
    default: {
      const unreachable: never = method
      return unreachable
    }
  }
}
console.log(feeRate('POINT'))
// 출력: 0
```

`case 'POINT'`를 빼면 `Type 'string' is not assignable to type 'never'.`(TS2322)가 나며, 빠진 경우가 있다는 것을 알려 줍니다.
:::

### 문제 5 ⭐⭐⭐ 긴 에러 해독

다음 에러의 결정적 이유는 무엇이고, 어떻게 고쳐야 할까요?

```text
error TS2345: Argument of type '{ id: string; items: { productId: string; qty: string; }[]; }' is not assignable to parameter of type 'Order'.
  Types of property 'items' are incompatible.
    Type '{ productId: string; qty: string; }[]' is not assignable to type 'OrderItem[]'.
      Type '{ productId: string; qty: string; }' is not assignable to type 'OrderItem'.
        Types of property 'qty' are incompatible.
          Type 'string' is not assignable to type 'number'.
```

::: details 정답 보기
맨 아랫줄부터 거꾸로 읽으면 "`items` 배열 안의 `qty`가 `string`인데 `number`여야 한다"입니다. 보통 화면 입력값이나 API 응답의 수량이 문자열로 들어온 경우입니다. 주문 객체를 만들 때 `qty: Number(input)`처럼 변환하거나, 외부 데이터라면 zod 같은 런타임 검증에서 `z.coerce.number()`로 변환합니다.
:::

## 확인 퀴즈

1. TS18048과 TS2532는 둘 다 "`undefined`일 수 있다"는 뜻입니다. 어떤 기준으로 번호가 갈리나요?
2. 여러 줄짜리 에러에서 가장 먼저 읽어야 하는 줄은 어디인가요?
3. TS2352에서 메시지가 권하는 `as unknown as T`가 대부분 좋은 해결이 아닌 이유는 무엇인가요?
4. TS2835가 났을 때 `.ts` 소스에서 import 경로에 붙여야 하는 확장자는 무엇인가요?
5. TS7016을 `declare module '패키지';` 한 줄로 해결하면 어떤 대가를 치르나요?

::: details 정답 보기
1. 접근 대상이 **이름이 있는 식**(`order.discount`, 변수)이면 TS18048, **이름이 없는 식**(`find(...)` 결과 등)이면 TS2532입니다. 뜻과 해결법은 같습니다.
2. 들여쓰기가 가장 깊은 **맨 아랫줄**입니다. 결정적으로 어디가 맞지 않는지 알려 줍니다.
3. 값은 바뀌지 않고 컴파일러만 속이기 때문입니다. 실행 중에 속성이 없어 버그가 납니다. 값을 실제로 만들거나 런타임 검증을 해야 합니다.
4. 컴파일 결과의 확장자인 `.js`입니다.
5. 그 패키지에서 가져온 모든 것이 `any`가 되어 타입 검사를 전혀 받지 못합니다.
:::

## 정리

- 에러는 **파일 · 위치 · 코드 · 요약 문장 · 상세 이유**로 되어 있고, 긴 에러는 **맨 아랫줄부터** 읽습니다.
- 2000번대는 타입 검사, 7000번대는 암묵적 `any`, 18000번대는 세분화된 `null`·`undefined`·`unknown` 메시지가 많습니다.
- `null`·`undefined` 계열은 `?.`, `??`, `if` 좁히기로, 함수 반환 계열은 **빠진 경우를 처리**해서 고칩니다.
- 모듈 계열(TS2307, TS1259, TS2835, TS7016)은 코드보다 **tsconfig와 패키지 상태**를 먼저 봅니다.
- `as any`, `!`, `@ts-ignore`는 경고등 전구를 빼는 것과 같습니다. 원인을 고친 뒤에도 남는 정당한 경우에만 이유를 주석으로 남기고 씁니다.

## 다음 단계

[안티패턴과 코드 리뷰 체크리스트](./02-anti-patterns) — 에러는 나지 않지만 위험한 코드를 찾아내는 법을 배웁니다. `any`·`as`·`!` 남발부터 boolean 플래그 폭발까지, 리뷰에서 바로 쓸 수 있는 체크리스트를 만듭니다.
