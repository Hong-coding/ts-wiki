---
title: JavaScript ↔ TypeScript 대조표
---

# JavaScript ↔ TypeScript 대조표

TypeScript(TS)는 JavaScript(JS)에 **타입 문법을 덧붙인 언어**입니다. 그래서 TS 코드를 컴파일하면 대부분의 타입 문법은 지워지고 JS만 남습니다. 이 문서는 두 가지를 정리합니다.

1. **같은 일을 하는 코드의 JS 버전과 TS 버전**을 나란히 놓고, TS에서 무엇이 덧붙는지 보여 줍니다.
2. **TS에만 있는 문법**을 목록으로 정리하고, 컴파일하면 **사라지는 것**과 **JS 코드로 남는 것**을 실제 `tsc` 출력으로 확인합니다.

::: info 이 문서의 코드
- TS 코드는 TypeScript 5.6, `--strict`에서 컴파일해 확인했습니다.
- "컴파일 결과" 블록은 `tsc --target es2022`로 실제 출력한 JS를 그대로 옮긴 것입니다. 너무 긴 부분만 주석으로 생략 표시를 했습니다.
:::

**바로가기:** [JS/TS 코드 대조](#pairs) · [TS에만 있는 문법](#ts-only) · [컴파일 결과 확인](#emit) · [옮길 때 체크리스트](#checklist)

## JS/TS 코드 대조 {#pairs}

### 1. 변수 선언

```js
let price = 4500
price = '사천오백 원' // JS: 아무 문제 없이 실행됨 (나중에 계산할 때 버그)
```

```ts
let price: number = 4500 // 타입 표기 (생략해도 4500을 보고 number로 추론)
price = 5000 // ✅
// price = '사천오백 원'
// ❌ Type 'string' is not assignable to type 'number'. (TS2322)
```

**차이:** 변수 이름 뒤에 `: 타입`을 붙일 수 있습니다. 초기값이 있으면 생략해도 TS가 추론합니다. → [타입 표기와 추론](../part2-types/01-annotation-inference)

### 2. 함수 매개변수와 반환값

```js
function getTotal(price, qty) {
  return price * qty
}
getTotal('4500', 2) // JS: 9000 (문자열이 몰래 숫자로 바뀜)
```

```ts
function getTotal(price: number, qty: number): number {
  return price * qty
}
getTotal(4500, 2) // ✅
// getTotal('4500', 2)
// ❌ Argument of type 'string' is not assignable to parameter of type 'number'. (TS2345)
```

**차이:** 매개변수에는 타입을 적어야 합니다(적지 않으면 strict에서 오류). 반환 타입은 생략하면 추론합니다. → [함수 타입](../part2-types/05-function-types)

### 3. 객체의 모양

```js
const product = { name: '아메리카노', price: 4500 }
console.log(product.prise) // JS: undefined (오타인데 조용히 지나감)
```

```ts
type Product = { name: string; price: number }
const product: Product = { name: '아메리카노', price: 4500 }
// console.log(product.prise)
// ❌ Property 'prise' does not exist on type 'Product'. Did you mean 'price'? (TS2551)
```

**차이:** `type`이나 `interface`로 객체 모양에 이름을 붙이고, 그 모양을 지키는지 검사합니다. → [객체 타입](../part2-types/04-object-types)

### 4. 있을 수도 없을 수도 있는 속성

```js
function memberLabel(member) {
  // phone이 없을 수도 있다는 사실은 주석이나 기억에만 의존
  return member.name + ' ' + (member.phone || '번호 없음')
}
```

```ts
type Member = { name: string; phone?: string }
function memberLabel(member: Member) {
  // phone은 string | undefined 이므로 처리하지 않으면 TS가 알려 줌
  return member.name + ' ' + (member.phone ?? '번호 없음')
}
```

**차이:** `?`로 선택 속성을 표시하면 `undefined` 처리를 잊지 않도록 TS가 강제합니다. → [객체 타입](../part2-types/04-object-types)

### 5. 배열

```js
const cart = ['라테', '모카']
cart.push(3) // JS: 문자열 목록에 숫자가 섞여 들어감
```

```ts
const cart: string[] = ['라테', '모카']
cart.push('바닐라라테') // ✅
// cart.push(3)
// ❌ Argument of type 'number' is not assignable to parameter of type 'string'. (TS2345)
```

**차이:** 배열에 담길 요소의 타입을 `string[]`처럼 정합니다. → [배열 타입과 튜플](../part2-types/03-arrays-tuples)

### 6. 정해진 값 중 하나

```js
// 'paid', 'cancelled' 중 하나여야 하지만 JS는 오타를 막지 못함
function setStatus(order, status) {
  order.status = status
}
setStatus({}, 'payed') // JS: 오타가 그대로 저장됨
```

```ts
type Status = 'paid' | 'cancelled'
function setStatus(order: { status?: Status }, status: Status) {
  order.status = status
}
setStatus({}, 'paid') // ✅
// setStatus({}, 'payed')
// ❌ Argument of type '"payed"' is not assignable to parameter of type 'Status'. (TS2345)
```

**차이:** 리터럴 타입의 유니온으로 허용 값을 정확히 나열합니다. 편집기 자동 완성도 됩니다. → [유니온과 리터럴](../part2-types/06-union-literal)

### 7. null 처리

```js
const input = document.querySelector('#qty')
console.log(input.value) // 요소가 없으면 실행 중 TypeError
```

```ts
const input = document.querySelector<HTMLInputElement>('#qty')
// console.log(input.value)
// ❌ 'input' is possibly 'null'. (TS18047)
if (input) {
  console.log(input.value) // ✅ 여기서는 HTMLInputElement
}
```

**차이:** strict 모드에서는 `null`일 수 있는 값을 그냥 쓰면 오류입니다. 검사(좁히기)를 하면 통과합니다. → [타입 좁히기](../part2-types/08-narrowing)

### 8. 여러 모양 중 하나 처리하기

```js
function payLabel(payment) {
  if (payment.kind === 'card') return '카드 ' + payment.cardNo
  return '현금 ' + payment.received
}
```

```ts
type Payment =
  | { kind: 'card'; cardNo: string }
  | { kind: 'cash'; received: number }

function payLabel(payment: Payment) {
  if (payment.kind === 'card') return '카드 ' + payment.cardNo // 여기선 카드 모양
  return '현금 ' + payment.received // 여기선 현금 모양
}
```

**차이:** 판별 유니온으로 "어떤 모양들이 가능한지"를 타입에 적어 두면, 분기마다 쓸 수 있는 속성을 TS가 정확히 압니다. → [판별 유니온](../part3-intermediate/03-discriminated-union)

### 9. 재사용 함수 (제네릭)

```js
function firstItem(list) {
  return list[0]
}
const first = firstItem(['라테', '모카']) // 무엇이 나오는지 JS는 모름
```

```ts
function firstItem<T>(list: T[]): T | undefined {
  return list[0]
}
const first = firstItem(['라테', '모카']) // string | undefined
```

**차이:** 타입 매개변수 `T`로 "들어온 타입 그대로 나간다"는 관계를 표현합니다. → [제네릭 기초](../part3-intermediate/04-generics-basics)

### 10. 클래스

```js
class Order {
  #total = 0 // JS 표준 private 필드
  constructor(id) {
    this.id = id
  }
  add(price) {
    this.#total += price
  }
}
```

```ts
class Order {
  #total = 0
  // 매개변수 속성: 필드 선언 + this.id = id 를 한 번에
  constructor(public readonly id: string) {}
  add(price: number): void {
    this.#total += price
  }
}
```

**차이:** TS는 필드 타입 선언, `public`·`private`·`protected`·`readonly`, 매개변수 속성, `abstract`, `implements`를 더합니다. → [클래스](../part3-intermediate/08-classes)

### 11. 이름 붙은 상수 묶음

```js
const PayMethod = Object.freeze({ Card: 'CARD', Cash: 'CASH' })
```

```ts
// 방법 1: enum (TS 전용, 컴파일 후 객체로 남음)
enum PayMethod {
  Card = 'CARD',
  Cash = 'CASH',
}

// 방법 2: as const 객체 (JS 문법 그대로, 타입만 추가)
const PayMethod2 = { Card: 'CARD', Cash: 'CASH' } as const
type PayMethod2 = (typeof PayMethod2)[keyof typeof PayMethod2] // 'CARD' | 'CASH'
```

**차이:** `enum`은 TS에만 있는 문법이라 실행 코드를 만들어 냅니다. JS와 똑같은 코드를 유지하고 싶다면 `as const` 객체를 씁니다. → [열거형과 그 대안](../part2-types/09-enum)

### 12. 모듈 가져오기

```js
// 파일: cart.js
import { TAX_RATE } from './product.js'
export function withTax(price) {
  return price * (1 + TAX_RATE)
}
```

```ts
// 파일: product.ts
export type Product = { name: string; price: number }
export const TAX_RATE = 0.1
```

```ts
// 파일: cart.ts
import { TAX_RATE } from './product'
import type { Product } from './product' // 타입만 가져옴: 컴파일 후 사라짐
export function withTax(p: Product): number {
  return p.price * (1 + TAX_RATE)
}
```

**차이:** 타입도 `export`/`import`할 수 있고, `import type`은 컴파일 결과에서 완전히 지워집니다. → [모듈](../part3-intermediate/09-modules)

### 13. 비동기 API 호출

```js
async function getProducts() {
  const res = await fetch('/api/products')
  return res.json() // 무엇이 돌아오는지 코드만 봐서는 알 수 없음
}
```

```ts
type Product = { id: number; name: string; price: number }

async function getProducts(): Promise<Product[]> {
  const res = await fetch('/api/products')
  return (await res.json()) as Product[] // 응답 모양을 선언 (실제 검증은 별도)
}
```

**차이:** `async` 함수의 반환 타입은 `Promise<결과 타입>`입니다. `res.json()`은 `any`를 돌려주므로 타입을 직접 붙이고, 정말 그 모양인지는 런타임 검증으로 확인합니다. → [fetch API](../part4-async/04-fetch-api) · [런타임 검증](../part4-async/05-runtime-validation)

### 14. JS 파일 그대로 타입 검사 받기 (JSDoc)

```js
// @ts-check

/**
 * @param {number} price
 * @param {number} qty
 * @returns {number}
 */
function getTotal(price, qty) {
  return price * qty
}
```

**차이:** `.js` 파일 맨 위에 `// @ts-check`를 적고 JSDoc 주석으로 타입을 적으면, 파일을 `.ts`로 바꾸지 않고도 VS Code에서 TS 검사를 받을 수 있습니다. JS 프로젝트를 조금씩 옮길 때 유용합니다. → [마이그레이션](../part6-tooling/07-migration)

## TS에만 있는 문법 {#ts-only}

TS 문법은 크게 두 종류입니다. **타입 검사에만 쓰이고 컴파일하면 흔적 없이 사라지는 것**이 대부분이고, **실행 코드를 만들어 내서 JS에 남는 것**이 몇 가지 있습니다.

### 컴파일하면 사라지는 것

| 문법 | 예 | 관련 레슨 |
|---|---|---|
| 타입 표기 | `let price: number` | [타입 표기와 추론](../part2-types/01-annotation-inference) |
| 타입 별칭 | `type Product = { ... }` | [type과 interface](../part2-types/07-type-alias-interface) |
| 인터페이스 | `interface Member { id: number }` | [type과 interface](../part2-types/07-type-alias-interface) |
| 제네릭 타입 매개변수 | `function first<T>(list: T[])` | [제네릭 기초](../part3-intermediate/04-generics-basics) |
| 타입 단언 | `raw as Product`, `<Product>raw` | [타입 단언](../part2-types/10-assertion) |
| non-null 단언 | `el!` | [타입 단언](../part2-types/10-assertion) |
| `satisfies` (TS 4.9+) | `{ ... } satisfies Record<string, number>` | [satisfies](../part5-advanced/06-type-guards-satisfies) |
| 확정 할당 단언 | `let count!: number` | [strict 옵션](../part6-tooling/02-strict-options) |
| `import type` / `export type` | `import type { Product } from './product'` | [모듈](../part3-intermediate/09-modules) |
| `declare` 선언 | `declare const VERSION: string` | [선언 파일](../part5-advanced/08-declaration-files) |
| 접근 제어자 (필드 선언에 붙은 것) | `private total: number` | [클래스](../part3-intermediate/08-classes) |
| `readonly`, `abstract` 메서드 | `abstract area(): number` | [클래스](../part3-intermediate/08-classes) |
| `implements` | `class A implements Payable` | [클래스](../part3-intermediate/08-classes) |
| 함수 오버로드 시그니처 | 몸체 없는 `function find(id: number): string` | [함수 타입](../part2-types/05-function-types) |
| `const enum` (값은 인라인됨) | `const enum Size { S = 'S' }` | [열거형](../part2-types/09-enum) |
| `.d.ts` 파일 전체 | 타입 선언만 있는 파일 | [선언 파일](../part5-advanced/08-declaration-files) |

### 컴파일 후에도 JS 코드로 남는 것

| 문법 | 무엇으로 바뀌나 | 관련 레슨 |
|---|---|---|
| `enum` | 즉시 실행 함수로 만든 **객체** (숫자 enum은 역방향 매핑까지) | [열거형](../part2-types/09-enum) |
| 매개변수 속성 | 클래스 필드 선언 + 생성자 안의 `this.x = x` 대입 | [클래스](../part3-intermediate/08-classes) |
| 데코레이터 | 데코레이터를 적용하는 헬퍼 함수 호출 코드 | [클래스](../part3-intermediate/08-classes) |
| `namespace` (값을 담은 것) | 즉시 실행 함수로 만든 객체 | [선언 파일](../part5-advanced/08-declaration-files) |
| `abstract class` | 일반 `class` (추상 메서드 선언만 사라짐) | [클래스](../part3-intermediate/08-classes) |

::: tip 왜 이 구분이 중요할까요?
- **실행 중에는 타입이 없습니다.** `interface`나 `type`으로 "검사"하는 코드는 실행 중에 아무 일도 하지 않습니다. 외부 데이터는 [런타임 검증](../part4-async/05-runtime-validation)이 필요한 이유입니다.
- **남는 문법은 빌드 도구에 따라 지원이 다를 수 있습니다.** Node.js의 타입 제거 기능(`--experimental-strip-types`, Node 22.6+)처럼 "타입만 지우는" 도구는 `enum`, 매개변수 속성, `namespace`처럼 코드를 만들어야 하는 문법을 처리하지 못합니다. TS 5.8부터는 이런 문법을 금지하는 `erasableSyntaxOnly` 옵션도 생겼습니다.
:::

## 컴파일 결과 확인 {#emit}

아래는 `tsc --strict --target es2022`로 컴파일한 실제 결과입니다. 왼쪽(위) TS를 넣으면 오른쪽(아래) JS가 나옵니다.

### 타입만 있는 코드: 전부 사라짐

```ts
// 파일: types.ts
export type Product = { name: string; price: number }
export const TAX_RATE = 0.1
```

```ts
// 파일: erase.ts
import type { Product } from './types'
import { TAX_RATE } from './types'
interface Member {
  id: number
}
declare const VERSION: string

abstract class Shape {
  abstract area(): number
}

function total(items: Product[]): number {
  return items.reduce((s, p) => s + p.price * (1 + TAX_RATE), 0)
}
const raw: unknown = { name: '라테', price: 5000 }
const latte = raw as Product
const el = document.getElementById('app')!
const prices = { 라테: 5000 } satisfies Record<string, number>
let count!: number
function len<T extends { length: number }>(v: T): number {
  return v.length
}
export { total, latte, prices, len, Shape, el }
```

컴파일 결과(`erase.js`):

```js
import { TAX_RATE } from './types';
class Shape {
}
function total(items) {
    return items.reduce((s, p) => s + p.price * (1 + TAX_RATE), 0);
}
const raw = { name: '라테', price: 5000 };
const latte = raw;
const el = document.getElementById('app');
const prices = { 라테: 5000 };
let count;
function len(v) {
    return v.length;
}
export { total, latte, prices, len, Shape, el };
```

확인할 점:

- `import type` 줄, `interface`, `declare const`가 통째로 사라졌습니다.
- `: number`, `<T extends ...>`, `as Product`, `!`, `satisfies ...`, `count!`의 `!`가 모두 지워졌습니다.
- `abstract class Shape`는 빈 `class Shape`로 남고, 추상 메서드 `area`는 사라졌습니다.

### enum: 객체로 남음

```ts
enum OrderStatus {
  Ready,
  Paid,
  Cancelled,
}
enum PayMethod {
  Card = 'CARD',
  Cash = 'CASH',
}
const enum Size {
  S = 'S',
  M = 'M',
}
const s = OrderStatus.Paid
const p = PayMethod.Card
const z = Size.M
console.log(s, OrderStatus[1], p, z)
// 출력: 1 Paid CARD M
```

컴파일 결과:

```js
"use strict";
var OrderStatus;
(function (OrderStatus) {
    OrderStatus[OrderStatus["Ready"] = 0] = "Ready";
    OrderStatus[OrderStatus["Paid"] = 1] = "Paid";
    OrderStatus[OrderStatus["Cancelled"] = 2] = "Cancelled";
})(OrderStatus || (OrderStatus = {}));
var PayMethod;
(function (PayMethod) {
    PayMethod["Card"] = "CARD";
    PayMethod["Cash"] = "CASH";
})(PayMethod || (PayMethod = {}));
const s = OrderStatus.Paid;
const p = PayMethod.Card;
const z = "M" /* Size.M */;
console.log(s, OrderStatus[1], p, z);
```

확인할 점:

- 숫자 enum은 `OrderStatus[1]`로 이름(`'Paid'`)을 거꾸로 찾을 수 있는 **역방향 매핑**까지 만들어집니다.
- 문자열 enum은 역방향 매핑 없이 이름 → 값만 만들어집니다.
- `const enum`은 객체가 만들어지지 않고, 쓰인 자리에 값(`"M"`)이 직접 박힙니다.

### 매개변수 속성: 필드 선언과 대입으로 바뀜

```ts
class Order {
  constructor(
    public readonly id: string,
    private total: number,
  ) {}

  addItem(price: number): void {
    this.total += price
  }
}
const order = new Order('ORD-001', 0)
order.addItem(4500)
console.log(order.id)
// 출력: ORD-001
```

컴파일 결과:

```js
"use strict";
class Order {
    id;
    total;
    constructor(id, total) {
        this.id = id;
        this.total = total;
    }
    addItem(price) {
        this.total += price;
    }
}
const order = new Order('ORD-001', 0);
order.addItem(4500);
console.log(order.id);
```

확인할 점: `public readonly`, `private`는 사라졌지만, 그 대신 **필드 선언(`id;`, `total;`)과 생성자 안의 대입 코드**가 새로 생겼습니다. 또 `private total`은 JS에서 보통 필드가 되므로 실행 중에는 바깥에서 `order.total`로 읽을 수 있습니다. 실행 중에도 숨기려면 JS 표준 `#total`을 씁니다.

### namespace: 객체로 남음

```ts
namespace Tax {
  export const RATE = 0.1
  export function apply(price: number) {
    return price * (1 + RATE)
  }
}
console.log(Tax.apply(1000))
// 출력: 1100
```

컴파일 결과:

```js
"use strict";
var Tax;
(function (Tax) {
    Tax.RATE = 0.1;
    function apply(price) {
        return price * (1 + Tax.RATE);
    }
    Tax.apply = apply;
})(Tax || (Tax = {}));
console.log(Tax.apply(1000));
```

`namespace`는 ES 모듈이 생기기 전의 코드 묶음 방식입니다. 새 코드에서는 파일 단위 모듈(`import`/`export`)을 씁니다.

### 데코레이터: 헬퍼 코드가 추가됨

TS 5.0부터 지원하는 **표준 데코레이터**(옵션 없이 동작)의 예입니다.

```ts
function logged(target: (...args: any[]) => any, context: ClassMethodDecoratorContext) {
  return function (this: unknown, ...args: any[]) {
    console.log(`${String(context.name)} 호출`)
    return target.apply(this, args)
  }
}

class Cart {
  @logged
  checkout() {
    return '결제 완료'
  }
}
console.log(new Cart().checkout())
// 출력:
// checkout 호출
// 결제 완료
```

컴파일 결과(헬퍼 함수 본문은 생략):

```js
"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    /* ... 생략 ... */
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    /* ... 약 30줄 생략 ... */
};
function logged(target, context) {
    return function (...args) {
        console.log(`${String(context.name)} 호출`);
        return target.apply(this, args);
    };
}
let Cart = (() => {
    let _instanceExtraInitializers = [];
    let _checkout_decorators;
    return class Cart {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _checkout_decorators = [logged];
            __esDecorate(this, null, _checkout_decorators, { kind: "method", name: "checkout", static: false, private: false, access: { has: obj => "checkout" in obj, get: obj => obj.checkout }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        checkout() {
            return '결제 완료';
        }
        constructor() {
            __runInitializers(this, _instanceExtraInitializers);
        }
    };
})();
console.log(new Cart().checkout());
```

확인할 점: `@logged` 한 줄이 데코레이터를 적용하는 실행 코드로 바뀌었습니다. 작성 시점(2026년) 기준으로 데코레이터 문법을 직접 실행하지 못하는 JS 실행 환경이 많기 때문에 TS가 대신 코드를 만들어 줍니다.

::: warning 옛 방식 데코레이터와 섞지 마세요
Angular, NestJS, TypeORM 같은 라이브러리는 `tsconfig.json`의 `"experimentalDecorators": true`로 켜는 **옛 방식(실험적) 데코레이터**를 씁니다. 표준 데코레이터와 함수 모양·출력 코드가 다르므로, 쓰는 라이브러리의 문서가 요구하는 방식을 따르세요.
:::

## JS를 TS로 옮길 때 체크리스트 {#checklist}

| 단계 | 할 일 | 관련 레슨 |
|---|---|---|
| 1 | `tsconfig.json`에 `"allowJs": true`를 켜고 JS·TS를 섞어 쓸 수 있게 함 | [tsconfig.json](../part6-tooling/01-tsconfig) |
| 2 | 의존성이 적은 파일(유틸 함수 등)부터 `.js` → `.ts`로 이름 바꾸기 | [마이그레이션](../part6-tooling/07-migration) |
| 3 | 매개변수에 타입 붙이기, 객체 모양을 `type`/`interface`로 정의 | [객체 타입](../part2-types/04-object-types) |
| 4 | 라이브러리 타입이 없으면 `@types/패키지` 설치 | [선언 파일](../part5-advanced/08-declaration-files) |
| 5 | `any`를 줄이고, 외부 데이터는 `unknown` + 검증으로 | [특수 타입](../part2-types/02-special-types) |
| 6 | 마지막으로 `strict: true`를 켜고 남은 오류 정리 | [strict 옵션](../part6-tooling/02-strict-options) |
