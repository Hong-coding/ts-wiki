---
title: 제네릭 기초
---

# 제네릭 기초

<LessonMeta level="중급" :minutes="60" prev="판별 유니온으로 경우를 나누고 assertNever로 빠뜨린 경우를 잡는 법" />

## 이번에 배울 것

- 제네릭이 왜 필요한지 `any`와 비교해 설명할 수 있다.
- 타입 매개변수를 가진 **제네릭 함수**를 선언하고 호출할 수 있다.
- 제네릭 **인터페이스·타입 별칭·클래스**를 만들 수 있다.
- TypeScript가 타입 인자를 **추론**하는 방식을 이해하고, 필요할 때 **명시적으로** 넘길 수 있다.
- 제네릭이 꼭 필요한 경우와 과한 경우를 구별할 수 있다.

## 먼저 알아 둘 것

- [함수 타입: 선택·기본·나머지 매개변수와 오버로드](../part2-types/05-function-types)
- [배열 타입과 튜플](../part2-types/03-arrays-tuples): `string[]`와 `Array<string>` 표기
- [특수 타입: any · unknown · never · void](../part2-types/02-special-types): `any`와 `unknown`의 차이
- [판별 유니온](./03-discriminated-union): 앞 레슨의 `{ ok: true; data: string[] }` 예제

## 비유로 이해하기

매장에서 쓰는 **주문서 양식**을 떠올려 보세요.

```text
[    ] 상자 ___개를 입고합니다.
```

빈칸에 "원두"를 쓰면 원두 입고서가 되고, "종이컵"을 쓰면 종이컵 입고서가 됩니다. 양식은 하나지만 빈칸에 무엇을 채우느냐에 따라 여러 문서가 됩니다. 중요한 점은 **한번 "원두"라고 쓰면, 그 문서에서는 끝까지 원두**라는 것입니다. "원두 상자 3개를 입고하고, 종이컵을 출고합니다"처럼 중간에 바뀌지 않습니다.

함수의 **매개변수**는 "값의 빈칸"이었습니다. `function add(a, b)`의 `a`, `b`는 호출할 때 채워지는 빈칸입니다.

**제네릭**(generic)은 **"타입의 빈칸"** 입니다. 함수나 타입을 만들 때 타입 자리를 빈칸(`T`)으로 남겨 두고, 쓰는 쪽에서 채웁니다. 이 빈칸을 **타입 매개변수**(type parameter), 채워 넣는 실제 타입을 **타입 인자**(type argument)라고 부릅니다.

| 구분 | 값의 빈칸 | 타입의 빈칸 |
|---|---|---|
| 선언할 때 | 매개변수 `a` | 타입 매개변수 `T` |
| 사용할 때 | 인수 `3` | 타입 인자 `number` |
| 문법 | `(a: number)` | 꺾쇠 `<T>` |

## 개념 설명

### 왜 제네릭이 필요할까: 첫 번째 원소 꺼내기

배열의 첫 번째 원소를 꺼내는 함수를 만들어 봅시다. 상품 이름 배열용으로 먼저 만듭니다.

```ts
function firstString(items: string[]): string | undefined {
  return items[0]
}

const name = firstString(['아메리카노', '카페라테'])
console.log(name)
// 출력: 아메리카노
```

이제 가격 배열(`number[]`)에도 쓰고 싶습니다. 같은 함수를 `firstNumber`로 하나 더 만들어야 할까요? 회원 배열, 주문 배열마다 하나씩 만들면 끝이 없습니다.

#### 시도 1: any로 받기

```ts
function first(items: any[]): any {
  return items[0]
}

const price = first([4500, 5000]) // price의 타입: any
console.log(price.toUpperCase())
// 실행하면: TypeError: price.toUpperCase is not a function
```

함수 하나로 해결되었지만, 반환 타입이 `any`가 되어 **타입 정보를 잃었습니다.** `price`는 숫자인데 `toUpperCase()`(문자열 메서드)를 호출해도 컴파일러가 막지 않고, 실행 중에 오류가 납니다.

#### 시도 2: unknown으로 받기

```ts
function first(items: unknown[]): unknown {
  return items[0]
}

const price = first([4500, 5000]) // price의 타입: unknown
console.log(price.toFixed(0))
// ❌ 'price' is of type 'unknown'. (TS18046)
```

이번에는 안전하지만, `price`가 숫자인 걸 알면서도 쓸 때마다 `typeof` 검사를 해야 합니다. 들어간 타입(`number`)과 나온 타입의 **연결**이 끊어졌기 때문입니다.

#### 해결: 제네릭

```ts
// T는 "호출할 때 정해지는 타입"을 담는 빈칸입니다.
function first<T>(items: T[]): T | undefined {
  return items[0]
}

const price = first([4500, 5000]) // price의 타입: number | undefined
const product = first(['아메리카노', '카페라테']) // product의 타입: string | undefined

console.log(price?.toFixed(0), product?.toUpperCase())
// 출력: 4500 아메리카노
```

해설:

- 함수 이름 뒤의 `<T>`가 **타입 매개변수 선언**입니다. "이 함수 안에서 `T`라는 타입 빈칸을 쓰겠다"는 뜻입니다.
- `items: T[]`는 "`T`의 배열을 받는다", 반환 타입 `T | undefined`는 "그 `T`(또는 빈 배열이면 `undefined`)를 돌려준다"는 뜻입니다.
- `first([4500, 5000])`을 호출하면 TypeScript가 `T`를 `number`로 채웁니다. 그래서 결과도 `number | undefined`입니다.
- **들어간 타입과 나오는 타입이 연결**되어 있습니다. 이것이 제네릭의 핵심입니다.

::: tip 왜 T | undefined일까요?
빈 배열 `[]`의 첫 번째 원소는 `undefined`입니다. 반환 타입에 `undefined`를 넣어 두면 쓰는 쪽에서 `?.` 등으로 빈 배열을 처리하도록 강제할 수 있습니다.
:::

### 타입 매개변수의 이름

`T`는 **Type**의 머리글자로, 관례상 가장 많이 씁니다. 여러 개가 필요하면 `T`, `U`, `V`처럼 알파벳을 이어 쓰거나 의미가 드러나는 이름을 씁니다.

| 이름 | 흔한 의미 |
|---|---|
| `T` | 일반적인 타입 (Type) |
| `K` | 객체의 키 (Key) |
| `V` | 값 (Value) |
| `E` | 원소 (Element) 또는 에러 (Error) |
| `TItem`, `TResult` | 의미를 드러낸 긴 이름 (복잡한 제네릭에서 권장) |

타입 매개변수도 이름일 뿐이므로 `Item`, `Product`처럼 지어도 동작은 같습니다. 다만 실제 타입 이름과 헷갈리지 않도록 짧은 대문자나 `T` 접두사를 붙이는 관례를 따르는 편이 좋습니다.

### 제네릭 함수 더 보기

#### 화살표 함수

화살표 함수에서는 매개변수 괄호 앞에 `<T>`를 씁니다.

```ts
const last = <T>(items: T[]): T | undefined => {
  return items[items.length - 1]
}

console.log(last(['S', 'M', 'L']))
// 출력: L
```

::: warning .tsx 파일에서 화살표 함수 제네릭
React 컴포넌트 파일(`.tsx`)에서는 `<T>`가 JSX 태그로 오해받을 수 있어 `<T,>`처럼 쉼표를 붙여 쓰기도 합니다. [React + TS](../part7-practice/02-react-basics) 레슨에서 다시 봅니다.
:::

#### 매개변수 여러 곳에서 같은 T 쓰기

같은 `T`를 여러 매개변수에 쓰면 "이 둘은 같은 타입이어야 한다"는 약속이 됩니다.

```ts
// 기본값을 받아, 배열이 비었으면 기본값을 돌려줍니다.
function firstOr<T>(items: T[], fallback: T): T {
  return items.length > 0 ? items[0] : fallback
}

console.log(firstOr([], '메뉴 없음'))
console.log(firstOr([4500, 5000], 0))
// 출력: 메뉴 없음
// 출력: 4500

firstOr([4500, 5000], '없음')
// ❌ Argument of type 'string' is not assignable to parameter of type 'number'. (TS2345)
```

첫 번째 인수 `[4500, 5000]`에서 `T`가 `number`로 정해졌으므로, 두 번째 인수도 `number`여야 합니다. 비유에서 "한번 원두라고 쓰면 끝까지 원두"였던 것과 같습니다.

#### 타입 매개변수 여러 개

서로 다른 타입 두 개를 다루려면 타입 매개변수도 두 개 선언합니다.

```ts
// 두 값을 짝지어 튜플로 만듭니다.
function pair<A, B>(a: A, b: B): [A, B] {
  return [a, b]
}

const p = pair('아메리카노', 4500) // p의 타입: [string, number]
console.log(p[0], p[1] + 500)
// 출력: 아메리카노 5000
```

#### 배열 메서드는 이미 제네릭입니다

사실 여러분은 이미 제네릭을 쓰고 있었습니다. 배열의 `map`, `filter`, `find` 같은 메서드가 모두 제네릭입니다.

```ts
const prices = [4500, 5000, 3200]

// map의 콜백이 string을 반환하므로 결과는 string[]으로 추론됩니다.
const labels = prices.map((price) => `${price}원`)
// 마우스를 올려 보면: const labels: string[]

const cheap = prices.find((price) => price < 4000)
// 마우스를 올려 보면: const cheap: number | undefined

console.log(labels, cheap)
// 출력: [ '4500원', '5000원', '3200원' ] 3200
```

`map`의 선언을 VS Code에서 열어 보면(F12) 대략 `map<U>(callbackfn: (value: T, ...) => U): U[]` 모양입니다. 콜백이 돌려주는 타입이 `U`로 채워지고, 결과는 `U[]`입니다.

### 타입 인자 추론과 명시적 타입 인자

#### 추론: 대부분은 TypeScript가 채워 줍니다

지금까지의 예제에서는 `T`를 직접 적지 않았습니다. TypeScript가 **인수의 타입을 보고 `T`를 추론**했기 때문입니다. 이것을 **타입 인자 추론**(type argument inference)이라고 합니다. 대부분은 추론에 맡기면 됩니다.

#### 명시: 꺾쇠로 직접 넘기기

필요하면 함수 이름 뒤에 꺾쇠로 타입 인자를 직접 넘길 수 있습니다.

```ts
function first<T>(items: T[]): T | undefined {
  return items[0]
}

const a = first<number>([4500, 5000]) // T = number로 지정
const b = first<string | number>(['아메리카노', 4500]) // T = string | number로 지정

console.log(a, b)
// 출력: 4500 아메리카노

first<number>(['아메리카노'])
// ❌ Type 'string' is not assignable to type 'number'. (TS2322)
```

#### 언제 명시해야 할까?

명시적 타입 인자가 꼭 필요한 대표적인 경우는 **인수에서 `T`를 추론할 수 없을 때**입니다.

```ts
// 빈 목록을 만드는 함수: 인수가 없어서 T를 추론할 재료가 없습니다.
function createList<T>(): T[] {
  return []
}

const unknownList = createList() // unknownList의 타입: unknown[]
const products = createList<string>() // products의 타입: string[]

products.push('아메리카노')
console.log(products)
// 출력: [ '아메리카노' ]
```

추론할 재료가 없으면 `T`는 `unknown`이 됩니다. 이럴 때 꺾쇠로 타입을 알려 줍니다. 다음처럼 **빈 배열이나 `null`로 시작하는 상태**에서도 자주 씁니다.

```ts
// Map의 키·값 타입을 명시합니다. (Map은 제네릭 클래스입니다)
const stockByProduct = new Map<string, number>()
stockByProduct.set('아메리카노', 30)
stockByProduct.set('카페라테', 12)

// Set도 마찬가지입니다.
const soldOutIds = new Set<number>()
soldOutIds.add(101)

console.log(stockByProduct.get('카페라테'), soldOutIds.has(101))
// 출력: 12 true
```

`new Map()`만 쓰면 `Map<any, any>`가 되어 타입 검사가 사라집니다. 빈 상태로 시작하는 컬렉션에는 타입 인자를 적어 주세요. React의 `useState<Product | null>(null)`도 같은 이유입니다.

### 제네릭 인터페이스와 타입 별칭

함수뿐 아니라 **타입도 타입 매개변수를 가질 수 있습니다.** 이름 뒤에 `<T>`를 붙입니다.

앞 레슨의 API 응답 판별 유니온을 떠올려 보세요. 상품 목록 응답, 회원 정보 응답, 주문 응답마다 따로 만들 필요 없이, 데이터 자리만 빈칸으로 둡니다.

```ts
// 제네릭 타입 별칭: data의 타입을 빈칸 T로 둡니다.
type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; errorMessage: string }

interface Product {
  id: number
  name: string
  price: number
}

interface Member {
  memberNo: string
  name: string
}

// 사용할 때 T를 채웁니다. 타입에서는 추론이 없으므로 직접 적어야 합니다.
const productRes: ApiResponse<Product[]> = {
  ok: true,
  data: [{ id: 1, name: '아메리카노', price: 4500 }],
}

const memberRes: ApiResponse<Member> = {
  ok: false,
  errorMessage: '회원을 찾을 수 없습니다.',
}

if (productRes.ok) {
  console.log(productRes.data[0].name) // data는 Product[]
}
if (!memberRes.ok) {
  console.log(memberRes.errorMessage)
}
// 출력: 아메리카노
// 출력: 회원을 찾을 수 없습니다.
```

인터페이스도 같은 방식입니다.

```ts
// 페이지 단위로 나눈 목록 응답
interface Page<T> {
  items: T[]
  page: number
  totalCount: number
}

interface Order {
  orderNo: string
  amount: number
}

const orderPage: Page<Order> = {
  items: [
    { orderNo: 'A-1001', amount: 12000 },
    { orderNo: 'A-1002', amount: 8700 },
  ],
  page: 1,
  totalCount: 42,
}

const total = orderPage.items.reduce((sum, o) => sum + o.amount, 0)
console.log(`${orderPage.page}페이지 합계: ${total}원`)
// 출력: 1페이지 합계: 20700원
```

::: info 제네릭 타입은 반드시 타입 인자를 채워야 합니다
`Page`만 쓰고 `<Order>`를 빼면 `Generic type 'Page<T>' requires 1 type argument(s).` (TS2314) 오류가 납니다. 함수와 달리 타입 표기에서는 추론해 줄 재료가 없기 때문입니다. 기본값을 정해 두는 방법은 [다음 레슨](./05-generic-constraints)에서 배웁니다.
:::

제네릭 타입 안에 제네릭 타입을 넣을 수도 있습니다.

```ts
type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; errorMessage: string }

interface Page<T> {
  items: T[]
  page: number
  totalCount: number
}

// "주문 목록 한 페이지"를 담은 API 응답
type OrderPageResponse = ApiResponse<Page<{ orderNo: string; amount: number }>>

const res: OrderPageResponse = {
  ok: true,
  data: { items: [{ orderNo: 'A-1', amount: 5000 }], page: 1, totalCount: 1 },
}

if (res.ok) {
  console.log(res.data.items[0].orderNo)
}
// 출력: A-1
```

### 제네릭 함수와 제네릭 타입 함께 쓰기

제네릭 타입을 만들어 주는 함수도 제네릭으로 만들 수 있습니다.

```ts
type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; errorMessage: string }

// 성공 응답을 만드는 함수: data의 타입이 그대로 T가 됩니다.
function success<T>(data: T): ApiResponse<T> {
  return { ok: true, data }
}

function failure<T>(errorMessage: string): ApiResponse<T> {
  return { ok: false, errorMessage }
}

const r1 = success({ id: 1, name: '아메리카노' })
// 마우스를 올려 보면: const r1: ApiResponse<{ id: number; name: string; }>

const r2 = failure<number[]>('재고 조회 실패')
// 마우스를 올려 보면: const r2: ApiResponse<number[]>

if (r1.ok) console.log(r1.data.name)
if (!r2.ok) console.log(r2.errorMessage)
// 출력: 아메리카노
// 출력: 재고 조회 실패
```

`failure`는 인수(`errorMessage: string`)에 `T`가 없어서 추론할 수 없으므로 `failure<number[]>(...)`처럼 명시했습니다.

### 제네릭 클래스

클래스 이름 뒤에도 `<T>`를 붙일 수 있습니다. 클래스는 [3-8 레슨](./08-classes)에서 자세히 배우므로 여기서는 모양만 봅니다.

```ts
// 최근 본 항목을 최대 max개까지 보관하는 상자
class RecentList<T> {
  private items: T[] = []

  constructor(private max: number) {}

  add(item: T): void {
    this.items = [item, ...this.items].slice(0, this.max)
  }

  getAll(): T[] {
    return [...this.items]
  }
}

// 상품 이름을 담는 최근 본 목록
const recentProducts = new RecentList<string>(3)
recentProducts.add('아메리카노')
recentProducts.add('카페라테')
recentProducts.add('스콘')
recentProducts.add('머핀')
console.log(recentProducts.getAll())
// 출력: [ '머핀', '스콘', '카페라테' ]

recentProducts.add(4500)
// ❌ Argument of type 'number' is not assignable to parameter of type 'string'. (TS2345)
```

`new RecentList<string>(3)`으로 만든 순간 이 객체의 `T`는 `string`으로 고정됩니다. 그래서 `add(4500)`은 막힙니다. 이번에도 생성자 인수(`max: number`)에 `T`가 없으므로 `<string>`을 직접 적었습니다.

### 제네릭은 실행 중에 사라진다

제네릭 타입 매개변수도 다른 타입 표기처럼 **컴파일하면 사라집니다.** 앞의 `first` 함수를 JavaScript로 컴파일하면 이렇게 됩니다.

```js
function first(items) {
  return items[0]
}
```

그래서 함수 안에서 "`T`가 무슨 타입인지" 실행 중에 확인할 수는 없습니다. `typeof T`나 `if (T === String)` 같은 코드는 쓸 수 없습니다. 제네릭은 오직 **컴파일러가 타입 연결을 추적하기 위한 장치**입니다.

### 언제 제네릭이 필요하고, 언제 과할까?

제네릭은 강력하지만, 아무 데나 붙이면 코드만 읽기 어려워집니다. 판단 기준은 하나입니다.

::: tip 제네릭이 필요한지 판단하는 질문
"이 타입 매개변수가 **두 군데 이상**을 연결하고 있는가?"
(매개변수와 반환값, 매개변수와 매개변수, 속성과 속성 등)
:::

`first<T>(items: T[]): T`에서 `T`는 입력(`items`)과 출력(반환값)을 연결합니다. 제네릭이 꼭 필요합니다.

반대로 아래는 과한 예입니다.

```ts
// 과함: T가 매개변수 한 곳에만 쓰이고 아무것도 연결하지 않습니다.
function printLength<T>(items: T[]): void {
  console.log(items.length)
}

// 충분함: 같은 일을 하고, 읽기 더 쉽습니다.
function printLength2(items: unknown[]): void {
  console.log(items.length)
}

printLength(['아메리카노', '카페라테'])
printLength2(['아메리카노', '카페라테'])
// 출력: 2
// 출력: 2
```

`printLength`의 `T`는 어디와도 연결되지 않으므로 `unknown[]`으로 충분합니다. 제네릭 문법이 하나 늘어날 때마다 읽는 사람은 "이 `T`는 어디와 연결되지?"를 찾아야 합니다.

| 상황 | 제네릭 필요? |
|---|---|
| 입력 타입을 그대로 반환한다 (`first`, `identity`) | 필요 |
| 두 매개변수가 같은 타입이어야 한다 (`firstOr`) | 필요 |
| 컨테이너 타입의 내용물 타입을 바꿔 쓴다 (`ApiResponse<T>`, `Page<T>`) | 필요 |
| 매개변수 한 곳에만 쓰고 반환과 무관하다 | 불필요 → `unknown`이나 구체 타입 |
| 실제로는 한 가지 타입에만 쓴다 | 불필요 → 구체 타입 |

과한 제네릭의 더 많은 예(반환 타입에만 쓰는 제네릭 등)는 [다음 레슨](./05-generic-constraints)의 "자주 하는 실수"에서 이어서 다룹니다.

## 자주 하는 실수

### 실수 1: 제네릭 대신 any를 쓰기

```ts
function wrap(value: any): { value: any } {
  return { value }
}

const w = wrap(4500)
console.log(w.value.toUpperCase())
// 실행하면: TypeError: w.value.toUpperCase is not a function
```

**왜 틀렸나:** `any`는 어떤 타입이든 받지만 **타입 정보를 버립니다.** 숫자를 넣었다는 사실이 반환값에 전달되지 않아 컴파일러가 실수를 막지 못합니다.

```ts
// ✅ 입력 타입을 출력까지 연결합니다.
function wrap<T>(value: T): { value: T } {
  return { value }
}

const w = wrap(4500)
console.log(w.value.toFixed(1))
// 출력: 4500.0

w.value.toUpperCase()
// ❌ Property 'toUpperCase' does not exist on type 'number'. (TS2339)
```

### 실수 2: 함수 안에서 T를 특정 타입처럼 쓰기

```ts
function double<T>(value: T): T {
  return value * 2
  // ❌ The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type. (TS2362)
  // ❌ Type 'number' is not assignable to type 'T'. (TS2322)
}
```

**왜 틀렸나:** `T`는 "호출하는 쪽이 정하는 아무 타입"입니다. 첫 번째 오류는 "`T`에 곱셈을 할 수 없다", 두 번째 오류는 "곱셈 결과(`number`)가 `T`라는 보장이 없다"는 뜻입니다. 문자열이나 객체가 올 수도 있으므로, 함수 안에서는 `T`가 숫자라고 가정할 수 없습니다. 함수 안에서 `T`로 할 수 있는 일은 "모든 타입에 공통으로 할 수 있는 일"(그대로 반환, 배열에 담기 등)뿐입니다.

```ts
// ✅ 숫자에만 쓰는 함수라면 제네릭이 필요 없습니다.
function double(value: number): number {
  return value * 2
}

console.log(double(4500))
// 출력: 9000
```

"`T`이되 특정 조건을 만족하는 타입만"으로 제한하는 방법(`T extends ...`)은 [다음 레슨](./05-generic-constraints)에서 배웁니다.

### 실수 3: 추론할 재료가 없는데 타입 인자를 빠뜨리기

```ts
function createList<T>(): T[] {
  return []
}

const cart = createList() // T를 추론하지 못해 unknown[]이 됩니다.
cart.push('아메리카노')
console.log(cart[0].length)
// ❌ Object is of type 'unknown'. (TS2571)
```

**왜 틀렸나:** 인수에 `T`가 등장하지 않으면 TypeScript는 `T`를 `unknown`으로 정합니다. 무엇이든 넣을 수 있지만 꺼내 쓸 때 아무것도 할 수 없는 배열이 됩니다.

```ts
function createList<T>(): T[] {
  return []
}

// ✅ 타입 인자를 명시합니다.
const cart = createList<string>()
cart.push('아메리카노')
console.log(cart[0].length)
// 출력: 5
```

### 실수 4: 여러 타입을 섞어 넘겨 놓고 추론 결과에 놀라기

```ts
function firstOr<T>(items: T[], fallback: T): T {
  return items.length > 0 ? items[0] : fallback
}

// 문자열 배열에 숫자 기본값을 넘겼습니다.
const menu = firstOr(['아메리카노'], 0)
// ❌ Argument of type 'number' is not assignable to parameter of type 'string'. (TS2345)
```

**왜 틀렸나:** TypeScript는 두 인수의 후보 타입(`string`, `number`)을 `string | number`로 알아서 합쳐 주지 않습니다. 후보 중 하나(여기서는 첫 번째 인수에서 나온 `string`)를 `T`로 고르고, 나머지 인수를 그 타입으로 검사합니다. 그래서 두 번째 인수 `0`에 오류가 표시됩니다. 정말 두 타입을 섞고 싶다면 그 의도를 타입 인자로 밝힙니다.

```ts
function firstOr<T>(items: T[], fallback: T): T {
  return items.length > 0 ? items[0] : fallback
}

// ✅ 의도를 명시합니다: 문자열 또는 숫자
const menu = firstOr<string | number>(['아메리카노'], 0)
console.log(menu)
// 출력: 아메리카노
```

대부분은 이렇게 섞기보다 **같은 타입의 기본값**(`firstOr(['아메리카노'], '없음')`)을 넘기는 편이 올바른 설계입니다.

## 직접 해 보기

### 문제 1 ⭐ 기초

값을 받아 그대로 돌려주는 제네릭 함수 `identity`를 만들고, 숫자·문자열·객체로 호출해 각 반환 타입을 마우스로 확인해 보세요.

::: details 정답 보기
```ts
function identity<T>(value: T): T {
  return value
}

const a = identity(4500) // const a: number
const b = identity('라테') // const b: string
const c = identity({ id: 1, name: '스콘' }) // const c: { id: number; name: string; }

console.log(a, b, c.name)
// 출력: 4500 라테 스콘
```
`const a = identity(4500)`에 마우스를 올리면 `number`가 보입니다. 입력 타입이 출력까지 그대로 이어집니다.
:::

### 문제 2 ⭐ 기초

배열과 값을 받아, 값이 배열 맨 뒤에 추가된 **새 배열**을 반환하는 제네릭 함수 `append`를 만드세요. 원래 배열은 바꾸지 않습니다. 숫자 배열에 문자열을 넣으려 하면 컴파일 오류가 나야 합니다.

::: details 정답 보기
```ts
function append<T>(items: T[], item: T): T[] {
  return [...items, item]
}

const prices = [4500, 5000]
const next = append(prices, 3200)
console.log(prices, next)
// 출력: [ 4500, 5000 ] [ 4500, 5000, 3200 ]

append(prices, '무료')
// ❌ Argument of type 'string' is not assignable to parameter of type 'number'. (TS2345)
```
:::

### 문제 3 ⭐⭐ 응용

키-값 쌍 하나를 나타내는 제네릭 인터페이스 `Entry`를 만드세요. 키 타입 `K`와 값 타입 `V` 두 개의 타입 매개변수를 가집니다. 그리고 `Entry` 배열을 받아 `Map`으로 바꿔 주는 함수 `toMap`을 작성하세요.

::: details 정답 보기
```ts
interface Entry<K, V> {
  key: K
  value: V
}

function toMap<K, V>(entries: Entry<K, V>[]): Map<K, V> {
  const map = new Map<K, V>()
  for (const e of entries) {
    map.set(e.key, e.value)
  }
  return map
}

const stock = toMap([
  { key: '아메리카노', value: 30 },
  { key: '카페라테', value: 12 },
])
// 마우스를 올려 보면: const stock: Map<string, number>

console.log(stock.get('카페라테'))
// 출력: 12
```
:::

### 문제 4 ⭐⭐ 응용

아래 두 함수 중 제네릭이 **불필요한** 것을 고르고, 제네릭 없이 다시 써 보세요.

```ts
function logAll<T>(items: T[]): void {
  items.forEach((item) => console.log(item))
}

function lastOf<T>(items: T[]): T | undefined {
  return items[items.length - 1]
}
```

::: details 정답 보기
`logAll`의 `T`는 매개변수 한 곳에만 쓰이고 반환과 연결되지 않으므로 불필요합니다. `lastOf`는 입력과 반환을 연결하므로 제네릭이 필요합니다.

```ts
function logAll(items: unknown[]): void {
  items.forEach((item) => console.log(item))
}

logAll(['아메리카노', 4500])
// 출력: 아메리카노
// 출력: 4500
```
:::

### 문제 5 ⭐⭐⭐ 도전

장바구니를 나타내는 제네릭 클래스 `Cart<T>`를 만드세요. 다음 메서드를 가집니다.

- `add(item: T): void` — 항목 추가
- `remove(index: number): T | undefined` — 해당 위치의 항목을 빼서 반환
- `size(): number` — 항목 개수

상품 객체 `{ name: string; price: number }`를 담는 장바구니를 만들어 동작을 확인하세요.

::: details 정답 보기
```ts
class Cart<T> {
  private items: T[] = []

  add(item: T): void {
    this.items.push(item)
  }

  remove(index: number): T | undefined {
    const [removed] = this.items.splice(index, 1)
    return removed
  }

  size(): number {
    return this.items.length
  }
}

interface CartProduct {
  name: string
  price: number
}

const cart = new Cart<CartProduct>()
cart.add({ name: '아메리카노', price: 4500 })
cart.add({ name: '스콘', price: 3200 })

const removed = cart.remove(0)
console.log(removed?.name, cart.size())
// 출력: 아메리카노 1
```
`new Cart<CartProduct>()`처럼 생성자 인수에 `T`가 없으면 타입 인자를 직접 적어야 합니다. 빼먹으면 `T`가 `unknown`이 되어 `removed?.name`에서 오류가 납니다.
:::

## 확인 퀴즈

1. 제네릭 함수의 `<T>`에서 `T`를 무엇이라고 부르나요? 호출할 때 채워지는 실제 타입은 무엇이라고 부르나요?
2. `any[]`를 받아 `any`를 반환하는 함수와 `T[]`를 받아 `T`를 반환하는 함수의 차이는 무엇인가요?
3. 타입 인자를 직접 적어야 하는 대표적인 경우는 언제인가요?
4. 제네릭 함수 안에서 `T` 타입 값에 `* 2`를 할 수 없는 이유는 무엇인가요?
5. 제네릭이 필요한지 판단하는 질문은 무엇인가요?

::: details 정답 보기
1. `T`는 타입 매개변수(type parameter), 실제로 채워지는 타입은 타입 인자(type argument)입니다.
2. `any` 버전은 입력 타입 정보를 버려 반환값을 검사하지 못합니다. 제네릭 버전은 입력 타입과 반환 타입이 연결되어 반환값도 정확한 타입이 됩니다.
3. 인수에서 `T`를 추론할 수 없을 때입니다. 예: 인수가 없는 함수, 빈 `Map`·`Set`·배열로 시작할 때, 제네릭 타입을 타입 표기에 쓸 때.
4. `T`에는 호출하는 쪽이 문자열·객체 등 아무 타입이나 넣을 수 있으므로, 함수 안에서는 숫자라고 가정할 수 없기 때문입니다.
5. "이 타입 매개변수가 두 군데 이상을 연결하고 있는가?"입니다.
:::

## 정리

- 제네릭은 **타입의 빈칸**입니다. 선언할 때 `<T>`로 빈칸을 만들고, 쓸 때 타입 인자로 채웁니다.
- `any`는 타입 정보를 버리고, 제네릭은 **입력과 출력의 타입을 연결**합니다.
- 함수·화살표 함수·인터페이스·타입 별칭·클래스 모두 타입 매개변수를 가질 수 있습니다.
- 함수 호출에서는 대부분 **타입 인자가 추론**됩니다. 추론할 재료가 없으면 `createList<string>()`, `new Map<string, number>()`처럼 명시합니다.
- 제네릭 타입 매개변수는 컴파일하면 사라지므로 실행 중에 `T`를 검사할 수 없습니다.
- 타입 매개변수가 두 곳 이상을 연결하지 않으면 제네릭은 과합니다.

## 다음 단계

[제네릭 제약(extends)과 기본 타입 매개변수](./05-generic-constraints): "아무 타입이나"가 아니라 "`id`가 있는 타입만", "이 객체의 키만"처럼 빈칸에 들어갈 타입에 조건을 거는 방법을 배웁니다.
