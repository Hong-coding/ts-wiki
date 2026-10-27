---
title: 매핑된 타입과 키 재매핑(as)
---

# 매핑된 타입과 키 재매핑(as)

<LessonMeta level="고급" :minutes="60" prev="infer로 함수·Promise·배열·문자열에서 타입의 일부를 꺼냈습니다" />

## 이번에 배울 것

- 매핑된 타입 `{ [K in keyof T]: ... }`을 값 레벨의 `for...in` 반복문과 나란히 설명할 수 있다.
- `?`·`readonly` 수정자를 붙이고(`+`) 떼어(`-`) `Partial`·`Required`·`Readonly`·`Mutable`을 직접 만들 수 있다.
- `Pick`·`Record`·`Omit`을 직접 구현할 수 있다.
- 키 재매핑 `as`(TypeScript 4.1+)로 속성 이름을 바꾸고, `never`로 속성을 걸러 낼 수 있다.
- 동형 매핑(homomorphic mapped type)이 원본의 수정자를 지켜 주는 원리를 설명할 수 있다.

## 먼저 알아 둘 것

- [반복문: for · while · for...of](../part1-basics/05-loops)
- [객체 타입: 선택 속성 · readonly · 인덱스 시그니처](../part2-types/04-object-types) — `?`와 `readonly`
- [keyof · typeof · 인덱스 접근 타입](../part3-intermediate/06-keyof-typeof-indexed) — `keyof T`, `T[K]`
- [조건부 타입과 분배 법칙](./01-conditional-types) — 이번 레슨에서 함께 씁니다.

## 비유로 이해하기

매장에서 쓰는 **상품 등록 양식**이 있다고 해 봅시다. 항목은 상품 코드, 상품명, 가격, 메모입니다.

어느 날 점장이 이렇게 부탁합니다.

> "이 양식을 바탕으로 **수정 요청 양식**을 만들어 주세요. 항목은 똑같은데, 전부 **안 적어도 되는 칸**으로요."

여러분은 원본 양식의 항목을 **위에서부터 하나씩 훑으면서**, 같은 이름의 칸을 새 양식에 옮겨 적고 칸마다 "(선택)" 도장을 찍습니다. 항목이 4개든 40개든 하는 일은 같습니다.

이것이 **매핑된 타입**(mapped type)입니다.

```text
{ [K in keyof Product]?: Product[K] }

keyof Product   → 원본 양식의 항목 목록
K in ...        → 항목을 하나씩 훑는다 (반복)
?               → 칸마다 "(선택)" 도장
Product[K]      → 칸에 적을 내용의 종류는 원본과 같게
```

점장이 다음에는 "항목 이름 앞에 '새'를 붙여 주세요"(키 재매핑), "메모 칸은 빼 주세요"(걸러 내기)라고 부탁할 수도 있습니다. 이번 레슨에서 이 부탁들을 모두 타입으로 해 봅니다.

## 개념 설명

### 1단계: 값 레벨의 for...in으로 객체 바꾸기

먼저 값 레벨에서 "객체의 모든 속성을 문자열로 바꾸는" 함수를 만들어 봅니다. 입력 폼은 값을 문자열로 다루므로 실무에서 흔한 일입니다.

```ts
const product = { code: 'P001', price: 4500, stock: 12 }

// 모든 속성을 하나씩 훑으며 문자열로 바꾼 새 객체를 만듭니다.
function toFormValues(obj: Record<string, unknown>) {
  const result: Record<string, string> = {}
  for (const key in obj) {
    result[key] = String(obj[key])
  }
  return result
}

console.log(toFormValues(product)) // 출력: { code: 'P001', price: '4500', stock: '12' }
```

반복문이 하는 일을 정리하면 이렇습니다.

1. 원본의 **키 목록**을 하나씩 꺼낸다(`for (const key in obj)`).
2. 같은 키로 새 객체에 **값을 바꿔** 넣는다(`result[key] = String(obj[key])`).

### 2단계: 같은 일을 매핑된 타입으로

```ts
type Product = { code: string; price: number; stock: number }

// 모든 속성의 타입을 string으로 바꿉니다.
type FormValues<T> = { [K in keyof T]: string }

type ProductForm = FormValues<Product> // 결과: { code: string; price: string; stock: string }
```

| 값 레벨 | 타입 레벨 |
|---|---|
| `for (const key in obj)` | `[K in keyof T]` |
| `key` (반복 변수) | `K` (반복 타입 변수) |
| `result[key] = String(obj[key])` | `: string` |
| 새 객체를 돌려줌 | 새 객체 타입이 결과 |

`keyof T`는 `T`의 키들을 모은 유니온입니다(`'code' | 'price' | 'stock'`). `[K in 유니온]`은 그 유니온의 멤버를 하나씩 `K`에 넣으며 속성을 만듭니다. 전개해 보면 이렇습니다.

```text
FormValues<Product>
= { [K in 'code' | 'price' | 'stock']: string }
  K = 'code'  → code: string
  K = 'price' → price: string
  K = 'stock' → stock: string
= { code: string; price: string; stock: string }
```

### 3단계: 원래 값 타입 그대로 쓰기 — T[K]

속성마다 원래 타입을 쓰려면 [인덱스 접근 타입](../part3-intermediate/06-keyof-typeof-indexed) `T[K]`를 씁니다. 값 레벨의 `obj[key]`와 같은 모양입니다.

```ts
type Product = { code: string; price: number; stock: number }

// 원본과 똑같이 복사합니다.
type Copy<T> = { [K in keyof T]: T[K] }
// 각 속성을 { value, error } 묶음으로 감쌉니다. 입력 폼의 상태 관리에 자주 쓰는 모양입니다.
type FieldState<T> = { [K in keyof T]: { value: T[K]; error: string | null } }

type C = Copy<Product> // 결과: { code: string; price: number; stock: number }
type F = FieldState<Product>
// 결과: { code: { value: string; error: string | null }; price: { value: number; error: string | null }; stock: { value: number; error: string | null } }
```

`FieldState`처럼 원본 타입의 "모양"은 유지한 채 각 칸의 내용만 바꾸는 것이 매핑된 타입의 가장 흔한 쓰임입니다. 원본 `Product`에 속성이 추가되면 `FieldState<Product>`에도 저절로 추가됩니다.

### 4단계: 키 목록을 직접 주기 — Record 구현

`in` 뒤에는 `keyof T`가 아니라 **아무 유니온**이나 올 수 있습니다. 이것이 내장 `Record<K, V>`의 정체입니다.

```ts
// K의 멤버마다 V 타입 속성을 만듭니다.
type MyRecord<K extends keyof any, V> = { [P in K]: V }

type PayMethod = 'card' | 'cash' | 'point'
type DailySales = MyRecord<PayMethod, number> // 결과: { card: number; cash: number; point: number }

const today: DailySales = { card: 320000, cash: 45000, point: 8000 }
console.log(today.card + today.cash + today.point) // 출력: 373000
```

`keyof any`는 "객체 키가 될 수 있는 모든 타입", 즉 `string | number | symbol`입니다. 키로 쓸 수 없는 타입(예: `boolean`)이 들어오지 않도록 제약을 걸어 두었습니다.

### 5단계: 수정자 붙이기 — Partial과 Readonly

매핑된 타입은 속성마다 `?`(선택)와 `readonly`(읽기 전용) **수정자**(modifier, 속성에 붙는 성질 표시)를 붙일 수 있습니다.

```ts
type Product = { code: string; price: number; stock: number }

// 모든 속성을 선택 속성으로
type MyPartial<T> = { [K in keyof T]?: T[K] }
// 모든 속성을 읽기 전용으로
type MyReadonly<T> = { readonly [K in keyof T]: T[K] }

type ProductPatch = MyPartial<Product> // 결과: { code?: string; price?: number; stock?: number }
type FrozenProduct = MyReadonly<Product> // 결과: { readonly code: string; readonly price: number; readonly stock: number }

// 수정 요청은 바꿀 속성만 보내면 됩니다.
const patch: ProductPatch = { price: 4800 }
console.log(patch) // 출력: { price: 4800 }
```

비유의 "(선택) 도장"이 바로 `?`입니다. [내장 유틸리티 타입](../part3-intermediate/07-utility-types)의 `Partial`·`Readonly`가 이렇게 만들어져 있습니다.

### 6단계: 수정자 떼기 — `-?`와 `-readonly`

수정자 앞에 `-`를 붙이면 **떼어 냅니다**. `+`를 붙이면 붙이는 것인데, 아무것도 안 쓰면 `+`로 칩니다.

```ts
type Member = { readonly memberId: string; nickname?: string; phone?: string }

// 선택 속성을 모두 필수로 (내장 Required와 같습니다)
type MyRequired<T> = { [K in keyof T]-?: T[K] }
// readonly를 모두 떼어 냅니다 (내장 타입에는 없어서 직접 만들어 씁니다)
type Mutable<T> = { -readonly [K in keyof T]: T[K] }

type FullMember = MyRequired<Member> // 결과: { readonly memberId: string; nickname: string; phone: string }
type EditableMember = Mutable<Member> // 결과: { memberId: string; nickname?: string; phone?: string }
```

| 쓰는 모양 | 뜻 | 내장 타입 |
|---|---|---|
| `?` 또는 `+?` | 선택 속성으로 만든다 | `Partial` |
| `-?` | 선택 속성을 필수로 만든다 | `Required` |
| `readonly` 또는 `+readonly` | 읽기 전용으로 만든다 | `Readonly` |
| `-readonly` | 읽기 전용을 푼다 | (없음) |

`FullMember`의 `memberId`에 `readonly`가 그대로 남은 점을 보세요. `-?`는 `?`만 건드리고, 원래 붙어 있던 `readonly`는 원본을 따라갑니다. 다음 단계에서 그 이유를 봅니다.

### 7단계: 동형 매핑 — 원본의 수정자를 지켜 준다

`{ [K in keyof T]: ... }`처럼 **`in` 바로 뒤에 `keyof T`가 오는** 매핑된 타입을 **동형 매핑**(homomorphic mapped type, "모양이 같은" 매핑)이라고 부릅니다. 동형 매핑은 원본 속성의 `?`와 `readonly`를 그대로 물려받습니다.

```ts
type Product = { readonly id: number; name: string; memo?: string }

type Copy<T> = { [K in keyof T]: T[K] }
type A = Copy<Product> // 결과: { readonly id: number; name: string; memo?: string }

// 키 목록을 따로 계산해 두면 동형이 아니게 됩니다.
type Keys = keyof Product
type B = { [K in Keys]: Product[K] } // 결과: { id: number; name: string; memo: string | undefined }
```

`B`에서는 `readonly`와 `?`가 사라졌습니다. `Keys`가 먼저 `'id' | 'name' | 'memo'`라는 평범한 유니온으로 계산되어 버려서, 컴파일러가 "이 키들이 `Product`에서 왔다"는 사실을 잊었기 때문입니다. 비유로 말하면, 원본 양식을 보며 옮겨 적은 것이 아니라 **항목 이름만 적힌 쪽지**를 보고 새 양식을 만든 셈입니다. 쪽지에는 "(선택)" 표시가 없습니다.

동형 매핑에는 반가운 성질이 하나 더 있습니다. **배열과 튜플을 넣으면 배열과 튜플이 나옵니다.**

```ts
type Copy<T> = { [K in keyof T]: T[K] }
type Stringify<T> = { [K in keyof T]: string }

type T1 = Copy<[string, number]> // 결과: [string, number]
type T2 = Stringify<[number, boolean]> // 결과: [string, string]
type T3 = Stringify<number[]> // 결과: string[]
```

`length`나 `push` 같은 배열 메서드까지 문자열로 바뀌지 않고, 요소 자리만 바뀝니다. 값 레벨에서 배열에 `map`을 돌리면 배열이 나오는 것과 같습니다.

### 8단계: Pick 직접 만들기

`Pick<T, K>`는 `T`에서 `K`에 해당하는 속성만 고릅니다. "`in` 뒤에 아무 유니온이나 올 수 있다"는 4단계를 응용합니다.

```ts
// K는 T의 키 중 일부여야 합니다.
type MyPick<T, K extends keyof T> = { [P in K]: T[P] }

type Order = { readonly orderId: number; memberId: string; total: number; memo?: string }

type OrderSummary = MyPick<Order, 'orderId' | 'total'> // 결과: { readonly orderId: number; total: number }
type WithMemo = MyPick<Order, 'orderId' | 'memo'> // 결과: { readonly orderId: number; memo?: string }
```

`[P in K]`는 `keyof T` 그대로가 아닌데도 `readonly`와 `?`가 남았습니다. `K`가 `keyof T`로 **제약된 타입 매개변수**이면 컴파일러가 "이 키들은 `T`에서 왔다"는 것을 기억하기 때문입니다. 그래서 `Pick`도 동형 매핑처럼 수정자를 지켜 줍니다.

`K extends keyof T` 제약은 두 가지 역할을 합니다.

- 없는 키를 넣으면 에러가 납니다. 오타를 막아 줍니다.
- `T[P]`에서 `P`가 `T`의 키라는 것이 보장되어 인덱스 접근이 가능해집니다.

```ts
type MyPick<T, K extends keyof T> = { [P in K]: T[P] }
type Order = { orderId: number; total: number }

type Bad = MyPick<Order, 'orderNo'>
// ❌ Type '"orderNo"' does not satisfy the constraint 'keyof Order'. (TS2344)
```

### 9단계: 키 재매핑 as (TypeScript 4.1+)

지금까지는 키 이름이 원본과 같았습니다. TypeScript 4.1부터는 `as` 뒤에 **새 키 이름**을 계산해 넣을 수 있습니다. 값 레벨로 치면 `result['get' + key] = ...`처럼 새 이름으로 넣는 것입니다.

```ts
type Product = { code: string; price: number }

// 속성마다 'get' + 대문자로 시작하는 이름의 메서드를 만듭니다.
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]
}

type ProductGetters = Getters<Product> // 결과: { getCode: () => string; getPrice: () => number }
```

천천히 읽어 봅시다.

```text
K = 'code'
  as `get${Capitalize<'code'>}` → 'getCode'
  값 타입: () => Product['code'] → () => string

K = 'price'
  as `get${Capitalize<'price'>}` → 'getPrice'
  값 타입: () => Product['price'] → () => number
```

- `` `get${...}` ``는 **템플릿 리터럴 타입**입니다. 문자열 리터럴 타입을 이어 붙입니다(4번 레슨 [템플릿 리터럴 타입](./04-template-literal-types)에서 자세히 봅니다).
- `Capitalize<S>`는 첫 글자를 대문자로 바꾸는 내장 타입입니다.
- `string & K`는 "K 중에서 문자열인 것만"이라는 뜻입니다. `keyof T`에는 숫자·심벌 키도 섞일 수 있는데 `Capitalize`는 문자열만 받으므로, 인터섹션으로 걸러 줍니다. 빠뜨리면 에러가 납니다(자주 하는 실수 2).

만든 타입이 실제 객체에 잘 맞는지 확인해 봅시다.

```ts
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]
}

const latte = { code: 'P002', price: 5000 }
const getters: Getters<typeof latte> = {
  getCode: () => latte.code,
  getPrice: () => latte.price,
}
console.log(getters.getPrice()) // 출력: 5000
```

### 10단계: as never로 속성 걸러 내기

`as` 뒤에서 키를 `never`로 바꾸면 그 속성은 **만들어지지 않습니다**. [조건부 타입](./01-conditional-types)에서 "유니온 안의 never는 사라진다"고 배운 것과 같은 원리입니다. 값 레벨로 치면 반복문 안의 `if (...) continue`입니다.

```ts
type Order = { orderId: number; memberId: string; total: number; paid: boolean }

// 값이 V에 들어가는 속성만 남깁니다.
type PickByValue<T, V> = {
  [K in keyof T as T[K] extends V ? K : never]: T[K]
}

type NumberFields = PickByValue<Order, number> // 결과: { orderId: number; total: number }
type StringFields = PickByValue<Order, string> // 결과: { memberId: string }
```

```text
PickByValue<Order, number>
  K = 'orderId'  : number  extends number ? 'orderId' : never → 'orderId' (남김)
  K = 'memberId' : string  extends number ? ...       : never → never     (버림)
  K = 'total'    : number  extends number ? 'total'   : never → 'total'   (남김)
  K = 'paid'     : boolean extends number ? ...       : never → never     (버림)
```

값 레벨 코드와 나란히 보면 이렇습니다.

```ts
const order = { orderId: 1001, memberId: 'M01', total: 9500, paid: true }

const numberFields: Record<string, number> = {}
for (const [key, value] of Object.entries(order)) {
  if (typeof value !== 'number') continue // never로 바꾸는 것과 같은 역할
  numberFields[key] = value
}
console.log(numberFields) // 출력: { orderId: 1001, total: 9500 }
```

같은 방법으로 메서드(함수 값 속성)만 빼고 데이터만 남기는 타입도 만들 수 있습니다.

```ts
type Cart = {
  items: string[]
  total: number
  add(code: string): void
  clear(): void
}

// 값이 함수인 속성을 버립니다.
type DataOnly<T> = {
  [K in keyof T as T[K] extends (...args: any[]) => any ? never : K]: T[K]
}

type CartData = DataOnly<Cart> // 결과: { items: string[]; total: number }
```

서버로 보낼 데이터나 저장소에 넣을 상태를 만들 때 이런 타입이 유용합니다.

### 11단계: Omit 직접 만들기

`Omit<T, K>`는 `Pick`의 반대로, `K`에 해당하는 속성을 뺍니다. 키 재매핑으로 한 줄에 만들 수 있습니다.

```ts
// K에 들어가는 키는 never로 바꿔 버립니다.
type MyOmit<T, K extends keyof any> = {
  [P in keyof T as P extends K ? never : P]: T[P]
}

type Member = { memberId: string; password: string; nickname: string; point: number }

type PublicMember = MyOmit<Member, 'password'> // 결과: { memberId: string; nickname: string; point: number }
```

::: info 내장 Omit의 실제 모습
내장 `Omit`은 `Pick<T, Exclude<keyof T, K>>`로 정의되어 있습니다. "T의 키에서 K를 뺀(Exclude) 키들만 고른다(Pick)"는 뜻이니 결과는 같습니다. 키 재매핑(`as`)이 4.1에 생기기 전부터 있던 정의라 이런 모양입니다. 두 방식 모두 `K`를 `keyof T`가 아니라 `keyof any`로 제약해서, `T`에 없는 키를 넣어도 에러가 나지 않는다는 점은 알아 두세요.
:::

### 12단계: 실무 예 — 변경 이벤트 핸들러 타입

마지막으로 배운 것을 모두 묶어 봅시다. 설정 객체의 속성마다 "값이 바뀌었을 때 부를 함수"를 받는 타입입니다.

```ts
type StoreSettings = { storeName: string; openHour: number; useKiosk: boolean }

type ChangeHandlers<T> = {
  [K in keyof T as `on${Capitalize<string & K>}Change`]?: (next: T[K], prev: T[K]) => void
}

type SettingsHandlers = ChangeHandlers<StoreSettings>
// 결과: { onStoreNameChange?: (next: string, prev: string) => void; onOpenHourChange?: (next: number, prev: number) => void; onUseKioskChange?: (next: boolean, prev: boolean) => void }

const handlers: SettingsHandlers = {
  onOpenHourChange: (next, prev) => console.log(`영업 시작 ${prev}시 → ${next}시`),
}
handlers.onOpenHourChange?.(10, 9) // 출력: 영업 시작 9시 → 10시
```

- `as`로 이름을 `on...Change`로 바꾸고,
- `?`로 모두 선택 속성으로 만들고,
- 값 타입에는 `T[K]`를 써서 속성마다 알맞은 매개변수 타입을 붙였습니다.

`next`와 `prev`에 타입 표기를 하지 않았는데도 `number`로 추론된 점을 확인해 보세요. `StoreSettings`에 속성을 추가하면 핸들러 이름과 타입이 저절로 생깁니다.

## 자주 하는 실수

### 실수 1: interface에 매핑된 타입을 쓰거나 다른 속성을 섞음

```ts
type PayMethod = 'card' | 'cash'

interface Sales {
  [K in PayMethod]: number
  // ❌ A mapped type may not declare properties or methods. (TS7061)
}
```

**왜 틀렸나**: 매핑된 타입은 `type` 별칭으로만 만들 수 있고, 그 중괄호 안에는 매핑 한 줄만 들어갈 수 있습니다. `interface`에 쓰거나 `{ [K in ...]: number; total: number }`처럼 다른 속성을 섞으면 같은 에러가 납니다.

**고친 코드**: `type`으로 만들고, 다른 속성은 인터섹션(`&`)으로 합칩니다.

```ts
type PayMethod = 'card' | 'cash'

type Sales = { [K in PayMethod]: number } & { total: number }

const sales: Sales = { card: 30000, cash: 12000, total: 42000 }
console.log(sales.total) // 출력: 42000
```

### 실수 2: 키 재매핑에서 string & K를 빠뜨림

```ts
type Getters<T> = {
  [K in keyof T as `get${Capitalize<K>}`]: () => T[K]
  // ❌ Type 'K' does not satisfy the constraint 'string'. (TS2344)
}
```

**왜 틀렸나**: `keyof T`는 `string | number | symbol` 중 무엇이든 될 수 있습니다. 그런데 `Capitalize`는 문자열만 받습니다. 컴파일러는 "K가 숫자 키일 수도 있잖아요" 하고 막습니다.

**고친 코드**: `string & K`로 문자열 키만 남깁니다. 숫자·심벌 키는 `never`가 되어 속성이 만들어지지 않습니다.

```ts
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]
}

type G = Getters<{ name: string }> // 결과: { getName: () => string }
```

### 실수 3: 키 목록을 따로 빼서 수정자를 잃음

```ts
type Member = { readonly memberId: string; nickname?: string }

type MemberKeys = keyof Member
type MemberCopy = { [K in MemberKeys]: Member[K] } // 결과: { memberId: string; nickname: string | undefined }
```

**왜 틀렸나**: `MemberKeys`가 평범한 유니온으로 먼저 계산되어 동형 매핑이 아니게 되었습니다. `readonly`가 사라져 실수로 `memberId`를 고쳐도 막아 주지 못하고, `nickname`은 이제 반드시 적어야 하는 속성(값이 `undefined`라도)이 되었습니다.

**고친 코드**: `in` 바로 뒤에 `keyof`를 씁니다.

```ts
type Member = { readonly memberId: string; nickname?: string }

type MemberCopy = { [K in keyof Member]: Member[K] } // 결과: { readonly memberId: string; nickname?: string }
```

### 실수 4: Pick을 만들며 K에 제약을 빠뜨림

```ts
type MyPick<T, K> = { [P in K]: T[P] }
// ❌ Type 'K' is not assignable to type 'string | number | symbol'. (TS2322)
// ❌ Type 'P' cannot be used to index type 'T'. (TS2536)
```

**왜 틀렸나**: 제약이 없으면 `K`에 무엇이든 올 수 있습니다. 객체 키가 될 수 없는 타입이 올 수도 있고(첫 번째 에러), `T`에 없는 키가 올 수도 있습니다(두 번째 에러).

**고친 코드**:

```ts
type MyPick<T, K extends keyof T> = { [P in K]: T[P] }

type R = MyPick<{ id: number; name: string }, 'id'> // 결과: { id: number }
```

## 직접 해 보기

### 문제 1 ⭐ Nullable

모든 속성의 타입에 `| null`을 더하는 `Nullable<T>`를 만드세요. 서버가 빈 값을 `null`로 보내는 경우에 씁니다.

::: details 정답 보기

```ts
type Nullable<T> = { [K in keyof T]: T[K] | null }

type Member = { nickname: string; point: number }
type R = Nullable<Member> // 결과: { nickname: string | null; point: number | null }
```
:::

### 문제 2 ⭐ 플래그 객체

`'card' | 'cash' | 'point'`를 받아 `{ card: boolean; cash: boolean; point: boolean }`을 만드는 `Flags<K>`를 만드세요. 결제 수단 사용 여부 설정 화면에 쓸 타입입니다.

::: details 정답 보기

```ts
type Flags<K extends string> = { [P in K]: boolean }

type PayFlags = Flags<'card' | 'cash' | 'point'> // 결과: { card: boolean; cash: boolean; point: boolean }
```

`Record<K, boolean>`과 같은 일입니다.
:::

### 문제 3 ⭐⭐ Setters

`{ name: string; price: number }`를 넣으면 `{ setName: (value: string) => void; setPrice: (value: number) => void }`가 나오는 `Setters<T>`를 만드세요.

::: details 정답 보기

```ts
type Setters<T> = {
  [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => void
}

type R = Setters<{ name: string; price: number }>
// 결과: { setName: (value: string) => void; setPrice: (value: number) => void }
```
:::

### 문제 4 ⭐⭐ 문자열 속성의 키만

객체 타입 `T`에서 값이 `string`인 속성의 **키 이름들**만 유니온으로 얻는 `StringKeys<T>`를 만드세요. 예: `{ code: string; price: number; name: string }` → `'code' | 'name'`.

힌트: 매핑된 타입으로 "키 → 키 또는 never" 객체를 만든 뒤, `[keyof T]`로 값들을 꺼내 보세요.

::: details 정답 보기

```ts
type StringKeys<T> = { [K in keyof T]: T[K] extends string ? K : never }[keyof T]

type Product = { code: string; price: number; name: string }
type R = StringKeys<Product> // 결과: "code" | "name"
```

```text
{ [K in keyof T]: T[K] extends string ? K : never }
= { code: 'code'; price: never; name: 'name' }

그 객체에 [keyof T] = ['code' | 'price' | 'name']로 접근하면
= 'code' | never | 'name'
= 'code' | 'name'
```

키 재매핑이 생기기 전부터 쓰이던 유명한 관용구입니다. 라이브러리 타입에서 자주 보게 됩니다.
:::

### 문제 5 ⭐⭐ 일부만 선택 속성으로

`T`에서 `K`에 해당하는 속성만 선택 속성으로 바꾸고 나머지는 그대로 두는 `PartialBy<T, K>`를 만드세요. 결과는 인터섹션이어도 됩니다.

::: details 정답 보기

```ts
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

type Product = { code: string; name: string; memo: string }
type NewProduct = PartialBy<Product, 'memo'>

const p: NewProduct = { code: 'P003', name: '카페모카' } // memo는 생략 가능
console.log(p.name) // 출력: 카페모카
```

"선택으로 바꿀 부분"과 "그대로 둘 부분"을 나눠 만든 다음 `&`로 합쳤습니다. 마우스를 올리면 인터섹션 모양 그대로 보이는데, 하나의 객체 모양으로 펼쳐 보고 싶으면 `Copy<T>`(`{ [K in keyof T]: T[K] }`)로 한 번 감싸면 됩니다.
:::

### 문제 6 ⭐⭐⭐ 쓸 수 있는 속성만 골라내기

객체 타입에서 **readonly가 아닌** 속성만 남기는 `WritableOnly<T>`를 만드세요. 예: `{ readonly id: number; name: string }` → `{ name: string }`.

힌트: 속성 하나짜리 객체 `{ [Q in K]: T[K] }`와 그것의 `-readonly` 버전이 서로 "완전히 같은지"를 2번 레슨의 `Equal`로 비교해 보세요.

::: details 정답 보기

```ts
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false

type WritableOnly<T> = {
  [K in keyof T as Equal<{ [Q in K]: T[K] }, { -readonly [Q in K]: T[K] }> extends true ? K : never]: T[K]
}

type Order = { readonly orderId: number; memo: string; readonly createdAt: string }
type R = WritableOnly<Order> // 결과: { memo: string }
```

`readonly`는 할당 가능성(`extends`)에 영향을 주지 않아서 `extends`로는 구분할 수 없습니다. 그래서 "완전히 같은지"를 보는 `Equal`을 썼습니다. 속성이 readonly면 원본과 `-readonly` 버전이 달라지므로 `never`로 버려집니다.
:::

## 확인 퀴즈

1. `{ [K in keyof T]: T[K] }`를 값 레벨 코드로 비유하면 무엇인가요?
2. `-?`와 `-readonly`는 각각 무슨 일을 하나요?
3. 동형 매핑이란 무엇이고, 어떤 이점이 있나요?
4. 키 재매핑 `as` 뒤에서 `never`를 돌려주면 어떻게 되나요?
5. `` `get${Capitalize<K>}` ``가 에러 나는 이유와 고치는 법은?

::: details 정답 보기

1. `for (const key in obj) { result[key] = obj[key] }`처럼 키를 하나씩 훑으며 새 객체를 만드는 반복문입니다.
2. `-?`는 선택 속성을 필수로, `-readonly`는 읽기 전용을 풉니다.
3. `in` 바로 뒤에 `keyof T`(또는 `keyof T`로 제약된 타입 매개변수)가 오는 매핑입니다. 원본의 `?`·`readonly`를 지켜 주고, 배열·튜플을 넣으면 배열·튜플이 나옵니다.
4. 그 속성이 만들어지지 않습니다. 속성을 걸러 낼 때 씁니다.
5. `K`가 숫자·심벌 키일 수도 있는데 `Capitalize`는 문자열만 받기 때문입니다. `Capitalize<string & K>`로 고칩니다.
:::

## 정리

- 매핑된 타입 `{ [K in 유니온]: 타입 }`은 타입 레벨의 `for` 반복문입니다. 유니온 멤버마다 속성을 하나씩 만듭니다.
- `keyof T`와 `T[K]`를 함께 쓰면 원본 모양을 유지한 채 속성 타입만 바꿀 수 있습니다.
- `?`·`readonly`를 붙이고 `-?`·`-readonly`로 뗄 수 있습니다. `Partial`·`Required`·`Readonly`가 이렇게 만들어집니다.
- `in` 바로 뒤에 `keyof T`가 오는 동형 매핑은 원본의 수정자를 지키고, 배열·튜플은 배열·튜플로 돌려줍니다.
- 키 재매핑 `as`(4.1+)로 속성 이름을 바꾸고, `as never`로 속성을 걸러 냅니다. `Omit`·`PickByValue`가 이렇게 만들어집니다.
- `Capitalize` 같은 문자열 도구에 키를 넘길 때는 `string & K`로 문자열 키만 남깁니다.

## 다음 단계

[템플릿 리터럴 타입](./04-template-literal-types)에서는 이번 레슨에서 살짝 맛본 `` `get${...}` `` 같은 문자열 타입 조립을 본격적으로 배웁니다. 이벤트 이름을 만들고, `/stores/:storeId/orders/:orderId` 같은 경로에서 매개변수 이름을 뽑아 냅니다.
