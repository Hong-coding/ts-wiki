---
title: 재귀 타입
---

# 재귀 타입

<LessonMeta level="고급" :minutes="50" prev="템플릿 리터럴 타입으로 문자열 타입을 조립하고 경로 매개변수를 뽑았습니다" />

## 이번에 배울 것

- 자기 자신을 품는 타입(재귀 타입)으로 카테고리 트리와 JSON 값을 표현할 수 있다.
- 값 레벨의 재귀 함수와 타입 레벨의 재귀 타입을 나란히 놓고 같은 구조로 읽을 수 있다.
- `DeepPartial`·`DeepReadonly`를 만들고, 함수·배열을 다룰 때의 함정을 피할 수 있다.
- 튜플을 재귀로 처리해 뒤집기·평탄화·이어 붙이기 타입을 만들 수 있다.
- 재귀 깊이 한계(TS2589)가 생기는 이유를 알고, 꼬리 재귀(TypeScript 4.5+)로 피할 수 있다.

## 먼저 알아 둘 것

- [함수 기초](../part1-basics/06-functions)와 [스코프와 클로저](../part1-basics/10-scope-closure)
- [JSON · Date · Map · Set 타입 안전하게 쓰기](../part4-async/06-json-date-map-set)
- [infer로 타입 꺼내기](./02-infer) — 튜플에서 `[infer F, ...infer Rest]`
- [매핑된 타입과 키 재매핑(as)](./03-mapped-types)
- [템플릿 리터럴 타입](./04-template-literal-types) — 10단계의 `PathParams`가 첫 재귀 타입이었습니다.

## 비유로 이해하기

컴퓨터의 **폴더**를 떠올려 봅시다. 폴더 안에는 파일이 있고, 또 **폴더**가 있을 수 있습니다. 그 폴더 안에도 다시 폴더가 있을 수 있습니다. 몇 단계까지 들어갈지는 정해져 있지 않습니다.

그래서 폴더를 설명할 때는 이렇게 말합니다.

> "폴더란, 이름이 있고, **파일 여러 개와 폴더 여러 개**를 담는 것이다."

정의 안에 "폴더"라는 말이 다시 나옵니다. 이상해 보이지만, 이 한 문장이면 깊이가 3단계든 30단계든 모두 설명됩니다. 이렇게 **자기 자신을 이용해 자신을 정의하는 것**을 **재귀**(recursion)라고 합니다.

매장의 상품 카테고리도 똑같습니다.

```text
음료
├─ 커피
│  ├─ 에스프레소
│  └─ 콜드브루
└─ 차
디저트
└─ 케이크
```

"카테고리란, 이름이 있고, **하위 카테고리 여러 개**를 담는 것이다." 이번 레슨에서는 이런 구조를 타입으로 그리고, 그 타입을 다루는 "타입 함수"도 재귀로 만들어 봅니다.

## 개념 설명

### 1단계: 값 레벨 재귀 함수 복습

카테고리 트리에서 카테고리 개수를 세는 함수를 먼저 봅니다.

```ts
type Category = { name: string; children: Category[] }

const menu: Category = {
  name: '전체',
  children: [
    {
      name: '음료',
      children: [
        { name: '커피', children: [{ name: '에스프레소', children: [] }, { name: '콜드브루', children: [] }] },
        { name: '차', children: [] },
      ],
    },
    { name: '디저트', children: [{ name: '케이크', children: [] }] },
  ],
}

// 나 자신(1) + 자식들 각각의 개수를 모두 더합니다.
function countCategories(category: Category): number {
  let count = 1
  for (const child of category.children) {
    count += countCategories(child) // 자기 자신을 다시 부릅니다
  }
  return count
}

console.log(countCategories(menu)) // 출력: 8
```

재귀 함수에는 늘 두 부분이 있습니다.

1. **기본 경우**(base case): 더 들어가지 않고 바로 답을 내는 경우. 여기서는 `children`이 빈 배열이면 반복문이 돌지 않아 `1`을 돌려줍니다.
2. **재귀 경우**: 문제를 조금 작게 만들어 자기 자신을 다시 부르는 경우. 여기서는 자식 카테고리마다 `countCategories(child)`를 부릅니다.

기본 경우가 없으면 함수가 끝없이 자기 자신을 불러 프로그램이 멈춥니다. 재귀 타입도 똑같습니다.

### 2단계: 자기 자신을 품는 타입

위 코드 첫 줄의 `Category` 타입을 다시 보세요.

```ts
type Category = {
  name: string
  children: Category[] // 속성 안에서 Category 자신을 씁니다
}

const coffee: Category = {
  name: '커피',
  children: [{ name: '에스프레소', children: [] }],
}
console.log(coffee.children[0].name) // 출력: 에스프레소
```

`Category`를 정의하는 중괄호 안에서 `Category`를 다시 썼습니다. 이것이 **재귀 타입**입니다. 컴파일러는 "children의 각 원소도 name과 children을 가진 객체"라고 이해하고, 몇 단계든 따라 내려가며 검사합니다.

기본 경우는 어디 있을까요? `children: []`(빈 배열)입니다. 빈 배열은 `Category[]`에 들어가므로, 거기서 구조가 끝날 수 있습니다.

`interface`로도 똑같이 쓸 수 있습니다.

```ts
interface Category {
  name: string
  parent?: Category // 위쪽 방향 재귀도 됩니다
  children: Category[]
}

const drinks: Category = { name: '음료', children: [] }
const tea: Category = { name: '차', parent: drinks, children: [] }
console.log(tea.parent?.name) // 출력: 음료
```

### 3단계: JSON 값 타입

실무에서 가장 유명한 재귀 타입은 **JSON 값**입니다. JSON은 이렇게 정의됩니다.

> JSON 값이란, 문자열·숫자·불리언·null 중 하나이거나, **JSON 값들의 배열**이거나, 값이 **JSON 값**인 객체다.

이 문장을 그대로 타입으로 옮깁니다.

```ts
type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[] // JSON 값들의 배열
  | { [key: string]: JsonValue } // 값이 JSON 값인 객체

const order: JsonValue = {
  orderId: 1001,
  items: [{ code: 'P001', qty: 2 }],
  paid: true,
  memo: null,
}
console.log(JSON.stringify(order)) // 출력: {"orderId":1001,"items":[{"code":"P001","qty":2}],"paid":true,"memo":null}
```

JSON에 넣을 수 없는 값은 막아 줍니다.

```ts
type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

const withDate: JsonValue = { orderId: 1001, createdAt: new Date() }
// ❌ Type '{ orderId: number; createdAt: Date; }' is not assignable to type 'JsonValue'. (TS2322)

const withUndefined: JsonValue = { orderId: 1001, memo: undefined }
// ❌ Type '{ orderId: number; memo: undefined; }' is not assignable to type 'JsonValue'. (TS2322)
```

`Date` 객체는 `JSON.stringify`를 거치면 문자열로 바뀌고, `undefined` 속성은 아예 사라집니다. "저장했다 다시 읽으면 모양이 달라지는 값"을 미리 막아 주는 셈입니다. 로컬 저장소(localStorage)나 서버로 보낼 데이터의 타입으로 쓰기 좋습니다.

::: info 타입 별칭의 재귀는 언제부터?
`type JsonValue = ... | JsonValue[]`처럼 유니온 안에서 자기 자신을 배열로 쓰는 형태는 TypeScript 3.7부터 가능해졌습니다. 그 전에는 `interface`를 함께 써야 했습니다. 오래된 라이브러리 코드에서 우회한 흔적을 보면 이 때문입니다.
:::

### 4단계: 타입 레벨 재귀 함수 — DeepReadonly

지금까지는 **데이터 모양**이 재귀였습니다. 이제 **타입을 변환하는 타입**(타입 레벨 함수)을 재귀로 만들어 봅시다.

[매핑된 타입](./03-mapped-types)에서 만든 `MyReadonly`는 **겉 한 층**만 읽기 전용으로 만들었습니다.

```ts
type Settings = { storeName: string; receipt: { header: string; showLogo: boolean } }

const settings: Readonly<Settings> = { storeName: '강남점', receipt: { header: '감사합니다', showLogo: true } }

settings.receipt.header = '또 오세요' // 에러가 나지 않습니다! 안쪽은 여전히 고칠 수 있습니다
console.log(settings.receipt.header) // 출력: 또 오세요
```

안쪽까지 모두 막으려면 "속성 값이 객체면 그 안에도 같은 일을 하라"고 해야 합니다. 값 레벨로 쓰면 `Object.freeze`를 깊이 적용하는 재귀 함수입니다.

```ts
// 값 레벨: 객체를 깊은 곳까지 얼립니다.
function deepFreeze<T extends object>(obj: T): T {
  for (const value of Object.values(obj)) {
    if (typeof value === 'object' && value !== null) deepFreeze(value) // 객체면 안으로 들어가 반복
  }
  return Object.freeze(obj)
}

const frozen = deepFreeze({ storeName: '강남점', receipt: { header: '감사합니다' } })
console.log(Object.isFrozen(frozen.receipt)) // 출력: true
```

타입 레벨로 옮기면 이렇습니다.

```ts
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? DeepReadonly<T[K]> // 객체면 안으로 들어가 반복 (재귀 경우)
    : T[K] // 원시 값이면 그대로 (기본 경우)
}

type Settings = { storeName: string; receipt: { header: string; showLogo: boolean } }

type FrozenSettings = DeepReadonly<Settings>
// 결과: { readonly storeName: string; readonly receipt: { readonly header: string; readonly showLogo: boolean } }

declare const settings: FrozenSettings
settings.receipt.header = '또 오세요'
// ❌ Cannot assign to 'header' because it is a read-only property. (TS2540)
```

| 값 레벨 `deepFreeze` | 타입 레벨 `DeepReadonly` |
|---|---|
| `for (const value of Object.values(obj))` | `[K in keyof T]` |
| `typeof value === 'object'` | `T[K] extends object` |
| `deepFreeze(value)` 다시 부르기 | `DeepReadonly<T[K]>` 다시 쓰기 |
| `Object.freeze(obj)` | `readonly` |

`declare const settings: FrozenSettings`는 "이런 타입의 변수가 있다고 치자"며 값 없이 타입만 선언하는 문법입니다(8번 레슨에서 자세히 배웁니다). 에러 확인용으로 썼습니다.

### 5단계: 함수와 배열은 따로 챙기기

위의 `DeepReadonly`에는 함정이 하나 있습니다. **함수도 `object`에 들어간다**는 점입니다.

```ts
type DeepReadonlyNaive<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonlyNaive<T[K]> : T[K]
}

type Store = { name: string; save: () => void }

declare const store: DeepReadonlyNaive<Store>
store.save()
// ❌ This expression is not callable. (TS2349)
```

`save`의 타입 `() => void`가 `object`에 들어가므로 매핑된 타입으로 변환되었고, 그 결과 "호출할 수 있다"는 정보가 사라져 빈 객체 `{}`가 되었습니다. 그래서 함수는 **먼저 걸러 내서 그대로 둡니다**.

```ts
type DeepReadonly<T> = T extends (...args: any[]) => any
  ? T // 함수는 그대로
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> } // 객체·배열은 안으로
    : T // 원시 값은 그대로

type Store = { name: string; tags: string[]; save: () => void; receipt: { header: string } }

type FrozenStore = DeepReadonly<Store>
// 결과: { readonly name: string; readonly tags: readonly string[]; readonly save: () => void; readonly receipt: { readonly header: string } }
```

이번 버전은 조건부 타입을 **바깥**에 두고 `T` 자체를 검사합니다. 그 덕분에 두 가지가 좋아졌습니다.

- 함수가 첫 갈래에서 걸러져 호출 정보가 남습니다.
- `{ readonly [K in keyof T]: ... }`가 `T`에 대한 동형 매핑이므로, 배열 `string[]`은 `readonly string[]`이 됩니다(3번 레슨 7단계). 배열의 `push`도 막힙니다.

```ts
type DeepReadonly<T> = T extends (...args: any[]) => any
  ? T
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T

declare const cart: DeepReadonly<{ items: { code: string; qty: number }[] }>

cart.items[0].qty = 3
// ❌ Cannot assign to 'qty' because it is a read-only property. (TS2540)
cart.items.push({ code: 'P009', qty: 1 })
// ❌ Property 'push' does not exist on type 'readonly { readonly code: string; readonly qty: number; }[]'. (TS2339)
```

### 6단계: DeepPartial

같은 뼈대로 "깊은 곳까지 모두 선택 속성"인 `DeepPartial`을 만듭니다. 설정 화면에서 "바뀐 부분만" 서버로 보내는 패치(patch) 객체에 자주 씁니다.

```ts
type DeepPartial<T> = T extends (...args: any[]) => any
  ? T
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T

type StoreSettings = {
  storeName: string
  receipt: { header: string; footer: string; showLogo: boolean }
  hours: { open: number; close: number }
}

// 영수증 머리말만 바꾸는 요청
const patch: DeepPartial<StoreSettings> = { receipt: { header: '오늘도 감사합니다' } }
console.log(JSON.stringify(patch)) // 출력: {"receipt":{"header":"오늘도 감사합니다"}}
```

내장 `Partial<StoreSettings>`였다면 `receipt`를 보낼 때 `header`·`footer`·`showLogo`를 모두 적어야 했습니다.

::: tip 깊은 재귀 타입은 라이브러리에 맡기는 것도 방법
`DeepPartial`·`DeepReadonly`는 `Date`·`Map`·`Set` 같은 내장 객체까지 고려하면 금방 복잡해집니다. 실무에서는 type-fest(작성 시점 기준 4.x) 같은 검증된 타입 유틸리티 라이브러리의 `PartialDeep`·`ReadonlyDeep`을 쓰기도 합니다. 원리를 이해해 두면 그런 라이브러리의 타입도 읽을 수 있습니다.
:::

### 7단계: 튜플 재귀 — 뒤집기

튜플(길이와 자리별 타입이 정해진 배열)도 재귀로 다룰 수 있습니다. 2번 레슨에서 배운 `[infer F, ...infer Rest]`로 "첫 요소"와 "나머지"를 나누고, 나머지에 다시 같은 일을 합니다.

```ts
// 값 레벨: 첫 요소를 떼어 내고, 나머지를 뒤집은 뒤 끝에 붙입니다.
function reverse<T>(items: T[]): T[] {
  if (items.length === 0) return [] // 기본 경우
  const [first, ...rest] = items
  return [...reverse(rest), first] // 재귀 경우
}
console.log(reverse(['주문', '결제', '배송'])) // 출력: [ '배송', '결제', '주문' ]

// 타입 레벨: 똑같은 생각을 조건부 타입으로
type Reverse<T extends unknown[]> = T extends [infer F, ...infer Rest]
  ? [...Reverse<Rest>, F] // 재귀 경우
  : [] // 기본 경우

type R = Reverse<['주문', '결제', '배송']> // 결과: ["배송", "결제", "주문"]
```

```text
Reverse<['주문', '결제', '배송']>
= [...Reverse<['결제', '배송']>, '주문']
= [...[...Reverse<['배송']>, '결제'], '주문']
= [...[...[...Reverse<[]>, '배송'], '결제'], '주문']
= [...[...[...[], '배송'], '결제'], '주문']
= ['배송', '결제', '주문']
```

두 코드가 줄 단위로 대응합니다. `items.length === 0`(기본 경우)은 "`[infer F, ...infer Rest]` 모양이 아님", 즉 빈 튜플일 때 거짓 갈래로 표현되었습니다.

### 8단계: 튜플 재귀 — 평탄화와 이어 붙이기

조금 더 해 봅시다. 중첩된 튜플을 펼치는 `Flatten`과, 문자열 튜플을 구분자로 잇는 `Join`입니다.

```ts
// 요소가 튜플이면 그것도 펼치고, 아니면 그대로 둡니다.
type Flatten<T extends unknown[]> = T extends [infer F, ...infer Rest]
  ? F extends unknown[]
    ? [...Flatten<F>, ...Flatten<Rest>]
    : [F, ...Flatten<Rest>]
  : []

type F1 = Flatten<[1, [2, [3, 4]], 5]> // 결과: [1, 2, 3, 4, 5]

// 문자열 튜플을 Sep으로 이어 붙입니다.
type Join<T extends string[], Sep extends string> = T extends [infer Only extends string]
  ? Only // 하나 남았으면 그대로
  : T extends [infer F extends string, ...infer Rest extends string[]]
    ? `${F}${Sep}${Join<Rest, Sep>}`
    : '' // 빈 튜플

type J1 = Join<['stores', 'S01', 'orders'], '/'> // 결과: "stores/S01/orders"
type J2 = Join<[], '/'> // 결과: ""
```

`Join`은 2번 레슨의 `infer X extends 제약`(4.7+)을 활용했습니다. `Rest`가 `string[]`임을 알려 주지 않으면 `Join<Rest, Sep>`에 넘길 수 없기 때문입니다.

### 9단계: 객체 경로 문자열 만들기

재귀 타입 + 매핑된 타입 + 템플릿 리터럴 타입을 모두 합친 실무 예입니다. 설정 객체의 모든 "점으로 이은 경로"를 유니온으로 만듭니다. 폼 라이브러리(react-hook-form 등)의 `register('store.address.city')` 같은 API가 이런 타입을 씁니다.

```ts
type Paths<T> = {
  [K in keyof T & string]: T[K] extends object
    ? K | `${K}.${Paths<T[K]>}` // 객체면: 자기 이름 + 안쪽 경로들
    : K // 원시 값이면: 자기 이름만
}[keyof T & string]

type Config = {
  store: { name: string; address: { city: string; zip: string } }
  open: boolean
}

type ConfigPath = Paths<Config>
// 결과: "store" | "open" | "store.name" | "store.address" | "store.address.city" | "store.address.zip"
```

- `keyof T & string`은 문자열 키만 남깁니다(템플릿 리터럴에 넣기 위해).
- 끝의 `[keyof T & string]`은 3번 레슨 문제 4의 관용구입니다. 객체의 값들만 모아 유니온으로 만듭니다.

### 10단계: 재귀 깊이 한계 — TS2589

값 레벨에서 재귀가 너무 깊으면 "Maximum call stack size exceeded" 에러가 납니다. 타입 레벨에도 비슷한 안전장치가 있습니다. 문자열을 N번 반복하는 타입으로 실험해 봅시다.

```ts
// Acc 튜플의 길이로 반복 횟수를 셉니다.
type Repeat<S extends string, N extends number, Acc extends unknown[] = []> = Acc['length'] extends N
  ? ''
  : `${S}${Repeat<S, N, [...Acc, 0]>}`

type R10 = Repeat<'ab', 3> // 결과: "ababab"
type R60 = Repeat<'a', 60>
// ❌ Type instantiation is excessively deep and possibly infinite. (TS2589)
```

- `Acc['length']`: 튜플의 `length`는 숫자 리터럴 타입이라(예: `[0, 0]`의 길이는 `2`), 타입 레벨에서 "지금까지 몇 번 했는지" 세는 계수기로 쓸 수 있습니다.
- 60번 반복에서 에러가 났습니다. 컴파일러가 "이 재귀는 끝나지 않을지도 모른다"고 보고 중간에 멈춘 것입니다. 이런 형태의 재귀는 대략 50단계 근처에서 멈춥니다.

### 11단계: 꼬리 재귀로 한계 늘리기 (TypeScript 4.5+)

위 `Repeat`의 재귀 호출은 `` `${S}${Repeat<...>}` ``처럼 **결과를 다른 것으로 감싸고** 있습니다. 컴파일러는 안쪽 계산이 끝난 뒤 바깥을 마저 계산해야 하므로, 단계마다 기억할 것이 쌓입니다.

결과를 **누적 변수**(accumulator)에 미리 담아 두고, 재귀 호출을 갈래의 **맨 바깥**에 그대로 두면 컴파일러가 단계를 쌓지 않고 반복문처럼 처리할 수 있습니다. 이것을 **꼬리 재귀**(tail recursion)라고 하며, TypeScript 4.5부터 조건부 타입에서 최적화됩니다.

```ts
// 값 레벨 비유: 결과를 out에 쌓아 가며 넘깁니다.
function repeat(s: string, n: number, out = ''): string {
  return n === 0 ? out : repeat(s, n - 1, out + s) // 재귀 호출이 맨 마지막 일
}
console.log(repeat('ab', 3)) // 출력: ababab

// 타입 레벨: Out에 결과를 쌓습니다. 재귀 호출이 갈래의 맨 바깥에 있습니다.
type RepeatTail<S extends string, N extends number, Acc extends unknown[] = [], Out extends string = ''> =
  Acc['length'] extends N ? Out : RepeatTail<S, N, [...Acc, 0], `${Out}${S}`>

type T3 = RepeatTail<'ab', 3> // 결과: "ababab"
type T500 = RepeatTail<'-', 500> // 에러 없음 (하이픈 500개)
```

꼬리 재귀 형태는 약 1000단계까지 계산합니다. 그보다 깊으면 마찬가지로 TS2589가 납니다.

| 형태 | 모양 | 깊이 한계(대략) |
|---|---|---|
| 일반 재귀 | `` `${S}${Repeat<...>}` ``, `[...Reverse<Rest>, F]` | 약 50 |
| 꼬리 재귀(4.5+) | 갈래 결과가 `Repeat<...>` 그 자체 | 약 1000 |

::: warning 한계에 부딪히면 먼저 설계를 의심하세요
TS2589를 만났다면 대부분은 "타입으로 하기엔 너무 큰 일"을 하고 있다는 신호입니다. 꼬리 재귀로 고칠 수 있는지 보고, 그래도 안 되면 타입을 단순하게 만들고 나머지는 실행 중 검사로 넘기세요. 깊은 재귀 타입은 에디터 자동 완성과 컴파일 속도도 느리게 만듭니다.
:::

## 자주 하는 실수

### 실수 1: 구조 없이 자기 자신을 바로 가리킴

```ts
type Menu = Menu | string
// ❌ Type alias 'Menu' circularly references itself. (TS2456)
```

**왜 틀렸나**: `Menu`가 무엇인지 알려면 `Menu`를 먼저 알아야 하는, 출구 없는 순환입니다. 재귀 타입은 **객체 속성·배열 요소처럼 한 겹 안쪽**에서 자기 자신을 써야 컴파일러가 "필요할 때 펼치면 된다"고 판단할 수 있습니다.

**고친 코드**: 자기 자신을 배열이나 객체 속성 안에 둡니다.

```ts
type Menu = string | Menu[]

const menus: Menu = ['아메리카노', ['카페라떼', '바닐라라떼'], '녹차']
console.log(JSON.stringify(menus)) // 출력: ["아메리카노",["카페라떼","바닐라라떼"],"녹차"]
```

### 실수 2: DeepReadonly에서 함수를 망가뜨림

```ts
type DeepReadonly<T> = { readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K] }

declare const printer: DeepReadonly<{ print: (text: string) => void }>
printer.print('영수증')
// ❌ This expression is not callable. (TS2349)
```

**왜 틀렸나**: 함수 타입도 `object`에 들어가서 매핑된 타입으로 바뀌었고, 호출 정보가 사라졌습니다.

**고친 코드**: 함수를 먼저 걸러 냅니다(5단계).

```ts
type DeepReadonly<T> = T extends (...args: any[]) => any
  ? T
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T

declare const printer: DeepReadonly<{ print: (text: string) => void }>
printer.print('영수증') // ✅
```

### 실수 3: JSON 타입에 Date를 그대로 넣음

```ts
type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

const saved: JsonValue = { orderId: 1001, paidAt: new Date(2026, 9, 26) }
// ❌ Type '{ orderId: number; paidAt: Date; }' is not assignable to type 'JsonValue'. (TS2322)
```

**왜 틀렸나**: `Date`는 JSON 값이 아닙니다. `JSON.stringify` 후 다시 `JSON.parse`하면 `Date`가 아니라 문자열이 돌아오므로, 읽는 쪽에서 `paidAt.getFullYear()`를 부르면 실행 중 에러가 납니다. 타입이 그 위험을 미리 알려 준 것입니다.

**고친 코드**: 저장할 때 문자열로 바꾸고, 읽을 때 다시 `Date`로 만듭니다.

```ts
type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

const saved: JsonValue = { orderId: 1001, paidAt: new Date(Date.UTC(2026, 9, 26)).toISOString() }
console.log(JSON.stringify(saved)) // 출력: {"orderId":1001,"paidAt":"2026-10-26T00:00:00.000Z"}
```

### 실수 4: 일반 재귀로 큰 수를 다룸

```ts
type BuildTuple<N extends number, Acc extends unknown[] = []> = Acc['length'] extends N
  ? Acc
  : [...BuildTuple<N, [...Acc, unknown]>]

type Seats = BuildTuple<100>['length']
// ❌ Type instantiation is excessively deep and possibly infinite. (TS2589)
```

**왜 틀렸나**: 재귀 호출을 `[...]`로 한 번 더 감싸서 꼬리 재귀가 아니게 되었고, 일반 재귀의 깊이 한계(약 50)에 걸렸습니다.

**고친 코드**: 재귀 호출을 갈래의 맨 바깥에 그대로 둡니다.

```ts
type BuildTuple<N extends number, Acc extends unknown[] = []> = Acc['length'] extends N
  ? Acc
  : BuildTuple<N, [...Acc, unknown]>

type Seats = BuildTuple<100>['length'] // 결과: 100
```

## 직접 해 보기

### 문제 1 ⭐ 댓글과 답글

리뷰 댓글은 작성자(`author`), 내용(`text`), 답글 목록(`replies`)을 가지며, 답글도 댓글과 같은 모양입니다. `ReviewComment` 타입을 만들고, 답글이 하나 달린 댓글 값을 만들어 보세요.

::: details 정답 보기

```ts
type ReviewComment = { author: string; text: string; replies: ReviewComment[] }

const comment: ReviewComment = {
  author: '단골손님',
  text: '라떼가 맛있어요',
  replies: [{ author: '점장', text: '감사합니다!', replies: [] }],
}
console.log(comment.replies[0].author) // 출력: 점장
```
:::

### 문제 2 ⭐ 트리 깊이 구하기

1단계의 `Category` 타입을 받아 트리의 깊이(카테고리만 있으면 1, 자식이 있으면 1 + 가장 깊은 자식의 깊이)를 구하는 값 레벨 함수 `depth`를 작성하세요.

::: details 정답 보기

```ts
type Category = { name: string; children: Category[] }

function depth(category: Category): number {
  if (category.children.length === 0) return 1 // 기본 경우
  return 1 + Math.max(...category.children.map(depth)) // 재귀 경우
}

const drinks: Category = {
  name: '음료',
  children: [{ name: '커피', children: [{ name: '에스프레소', children: [] }] }, { name: '차', children: [] }],
}
console.log(depth(drinks)) // 출력: 3
```
:::

### 문제 3 ⭐⭐ DeepRequired

`DeepPartial`의 반대로, 깊은 곳까지 선택 속성을 모두 필수로 바꾸는 `DeepRequired<T>`를 만드세요.

::: details 정답 보기

```ts
type DeepRequired<T> = T extends (...args: any[]) => any
  ? T
  : T extends object
    ? { [K in keyof T]-?: DeepRequired<T[K]> }
    : T

type Draft = { name?: string; receipt?: { header?: string } }
type Complete = DeepRequired<Draft> // 결과: { name: string; receipt: { header: string } }
```

`?` 대신 `-?`를 썼습니다(3번 레슨 6단계).
:::

### 문제 4 ⭐⭐ 튜플을 유니온으로, 깊게

중첩 튜플 안의 모든 요소를 유니온으로 모으는 `DeepElements<T>`를 만드세요. 예: `DeepElements<['a', ['b', ['c']]]>`는 `'a' | 'b' | 'c'`.

::: details 정답 보기

```ts
type DeepElements<T> = T extends unknown[] ? DeepElements<T[number]> : T

type R = DeepElements<['a', ['b', ['c']]]> // 결과: "a" | "b" | "c"
```

`T[number]`는 튜플의 모든 요소를 유니온으로 꺼냅니다. 그 유니온이 다시 `DeepElements`에 들어가면 **분배**되어 멤버마다 따로 처리됩니다. 배열인 멤버는 한 번 더 들어가고, 아닌 멤버는 그대로 남습니다.
:::

### 문제 5 ⭐⭐ 경로로 값 타입 찾기

9단계의 경로 문자열을 받아 그 위치의 값 타입을 돌려주는 `PathValue<T, P>`를 만드세요. 예: `PathValue<Config, 'store.address.city'>`는 `string`.

::: details 정답 보기

```ts
type PathValue<T, P extends string> = P extends `${infer Head}.${infer Rest}`
  ? Head extends keyof T
    ? PathValue<T[Head], Rest>
    : never
  : P extends keyof T
    ? T[P]
    : never

type Config = {
  store: { name: string; address: { city: string; zip: string } }
  open: boolean
}

type City = PathValue<Config, 'store.address.city'> // 결과: string
type Open = PathValue<Config, 'open'> // 결과: boolean
type Wrong = PathValue<Config, 'store.phone'> // 결과: never
```

점(`.`) 앞의 첫 조각으로 한 층 내려가고, 남은 경로로 다시 같은 일을 합니다. 경로가 한 조각만 남으면 그 속성의 타입이 답입니다.
:::

### 문제 6 ⭐⭐⭐ 길이로 덧셈하기

튜플의 길이를 이용해 두 숫자 리터럴 타입을 더하는 `Add<A, B>`를 만드세요. 예: `Add<3, 4>`는 `7`. 힌트: 실수 4의 `BuildTuple`을 쓰세요.

::: details 정답 보기

```ts
type BuildTuple<N extends number, Acc extends unknown[] = []> = Acc['length'] extends N
  ? Acc
  : BuildTuple<N, [...Acc, unknown]>

type Add<A extends number, B extends number> = [...BuildTuple<A>, ...BuildTuple<B>]['length']

type R1 = Add<3, 4> // 결과: 7
type R2 = Add<120, 380> // 결과: 500
```

길이 A인 튜플과 길이 B인 튜플을 이어 붙이면 길이가 A + B입니다. 꼬리 재귀 덕분에 수백 단위도 계산됩니다. 재미있는 기법이지만 실무 타입에 넣을 일은 거의 없습니다. 타입 레벨의 "재귀 + 계수기" 감각을 익히는 연습으로 생각하세요.
:::

## 확인 퀴즈

1. 재귀 함수와 재귀 타입에 공통으로 필요한 두 부분은 무엇인가요?
2. `type A = A | string`이 에러 나는 이유는 무엇인가요?
3. 단순한 `DeepReadonly`가 함수 속성을 망가뜨리는 이유는 무엇인가요?
4. TS2589 에러는 무엇을 뜻하나요?
5. 꼬리 재귀 형태란 무엇이고, 왜 한계가 늘어나나요?

::: details 정답 보기

1. 더 들어가지 않고 답을 내는 **기본 경우**와, 문제를 작게 만들어 자기 자신을 부르는 **재귀 경우**입니다.
2. 객체 속성이나 배열 요소처럼 한 겹 안쪽이 아니라 바로 자기 자신을 가리켜, 정의가 끝없이 순환하기 때문입니다(TS2456).
3. 함수 타입도 `object`에 들어가서 매핑된 타입으로 바뀌고, 그 과정에서 호출 시그니처가 사라지기 때문입니다.
4. 타입을 펼치는 단계가 너무 깊어져 컴파일러가 "무한히 계속될 수도 있다"고 보고 계산을 멈췄다는 뜻입니다.
5. 재귀 호출이 갈래 결과의 맨 바깥에 그대로 있는 형태입니다. 컴파일러가 단계마다 기억할 것을 쌓지 않고 반복문처럼 처리할 수 있어 약 1000단계까지 계산합니다(TypeScript 4.5+).
:::

## 정리

- 재귀 타입은 자기 자신을 한 겹 안쪽(속성·배열 요소)에 품는 타입입니다. 카테고리 트리, 댓글, JSON 값이 대표 예입니다.
- 타입을 변환하는 재귀 타입은 값 레벨 재귀 함수와 똑같이 **기본 경우**와 **재귀 경우**로 나뉩니다.
- `DeepReadonly`·`DeepPartial`은 함수를 먼저 걸러 내고, `T` 자체에 동형 매핑을 해야 배열까지 올바르게 처리됩니다.
- 튜플은 `[infer F, ...infer Rest]`로 나눠 재귀 처리합니다(뒤집기·평탄화·이어 붙이기).
- 재귀가 너무 깊으면 TS2589가 납니다. 일반 재귀는 약 50단계, 꼬리 재귀(4.5+)는 약 1000단계까지 계산합니다.
- 한계에 부딪히면 꼬리 재귀로 바꾸거나, 타입을 단순화하고 실행 중 검사로 넘기세요.

## 다음 단계

[사용자 정의 타입 가드 · assertion 함수 · satisfies](./06-type-guards-satisfies)에서는 타입 레벨에서 잠시 내려와, **실행 중의 검사**와 **컴파일러의 타입 판단**을 잇는 방법을 배웁니다. 이번 레슨의 실수 3처럼 "타입만으로는 부족한 부분"을 채우는 도구들입니다.
