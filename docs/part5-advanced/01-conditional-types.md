---
title: 조건부 타입과 분배 법칙
---

# 조건부 타입과 분배 법칙

<LessonMeta level="고급" :minutes="60" prev="제네릭·유틸리티 타입·비동기 타입까지 마쳤습니다" />

## 이번에 배울 것

- 조건부 타입 `T extends U ? X : Y`를 읽고, 값 레벨의 삼항 연산자와 나란히 설명할 수 있다.
- 유니온 타입이 조건부 타입을 만나 **분배**되는 과정을 한 단계씩 손으로 전개할 수 있다.
- `[T]`로 감싸 분배를 막아야 하는 때를 구분할 수 있다.
- `never`와 `any`가 조건부 타입에서 특이하게 동작하는 이유를 설명할 수 있다.
- `Exclude`·`Extract`·`NonNullable`을 직접 구현할 수 있다.

## 먼저 알아 둘 것

- [조건문: if · switch · 삼항 연산자](../part1-basics/04-conditionals) — 삼항 연산자 `조건 ? 참일 때 : 거짓일 때`
- [유니온 타입과 리터럴 타입](../part2-types/06-union-literal) — `'a' | 'b'` 같은 타입
- [제네릭 기초](../part3-intermediate/04-generics-basics)와 [제네릭 제약](../part3-intermediate/05-generic-constraints) — `T extends string`의 뜻
- [특수 타입: any · unknown · never · void](../part2-types/02-special-types) — `never`가 "값이 하나도 없는 타입"이라는 것

## 비유로 이해하기

택배 분류 센터를 떠올려 봅시다. 컨베이어 벨트 위로 상자가 하나 지나가면, 분류기가 묻습니다.

> "이 상자가 **냉장 상자 규격에 들어가는가?** 들어가면 냉장 창고로, 아니면 일반 창고로."

이것이 **조건부 타입**입니다. 상자는 타입 `T`, 규격은 `U`, 두 창고는 `X`와 `Y`입니다.

```text
T extends U ? X : Y
상자가 규격에 들어가면 X 창고, 아니면 Y 창고
```

이제 상자 하나가 아니라 **상자 묶음**(유니온)이 들어온다고 해 봅시다. 똑똑한 분류기는 묶음을 풀어 **상자마다 따로** 검사하고, 각각을 알맞은 창고로 보낸 뒤 결과를 다시 모읍니다. 이것이 **분배 법칙**(distributive, 유니온의 각 멤버에 하나씩 나눠 적용되는 성질)입니다.

그런데 가끔은 "묶음을 풀지 말고 묶음 전체가 규격에 맞는지" 보고 싶을 때가 있습니다. 그럴 때는 묶음을 **큰 상자 하나에 넣어 버리면**(`[T]`) 분류기가 풀지 못합니다. 이것이 분배를 막는 방법입니다.

마지막으로, **빈 묶음**(`never`)이 들어오면 어떻게 될까요? 풀어 보니 상자가 하나도 없으니 검사할 것도, 보낼 것도 없습니다. 결과도 빈 묶음입니다. `never`의 특이한 동작이 바로 이것입니다.

## 개념 설명

### 1단계: 값 레벨의 삼항 연산자 복습

먼저 익숙한 값 레벨 코드부터 봅니다.

```ts
function isString(value: unknown) {
  return typeof value === 'string' ? '문자열' : '문자열 아님'
}

console.log(isString('주문번호')) // 출력: 문자열
console.log(isString(1200)) // 출력: 문자열 아님
```

`조건 ? 참일 때 값 : 거짓일 때 값`입니다. 이 구조를 그대로 타입 세계로 옮긴 것이 조건부 타입입니다.

### 2단계: 첫 조건부 타입

```ts
// 타입 매개변수 T를 받아, string에 할당 가능하면 true, 아니면 false 타입을 돌려줍니다.
type IsString<T> = T extends string ? true : false

type A = IsString<'주문번호'> // 결과: true
type B = IsString<1200> // 결과: false
type C = IsString<string> // 결과: true
```

두 코드를 나란히 놓아 보면 이렇습니다.

| 값 레벨 | 타입 레벨 |
|---|---|
| `function isString(value)` | `type IsString<T>` |
| `typeof value === 'string'` | `T extends string` |
| `? '문자열'` | `? true` |
| `: '문자열 아님'` | `: false` |
| `isString('주문번호')` 호출 | `IsString<'주문번호'>` 사용 |

- 함수의 매개변수(parameter, 함수가 받는 입력값을 담는 변수) `value` 자리에 타입 매개변수 `T`가 있습니다.
- 함수를 **호출**하듯 제네릭 타입에 꺾쇠로 타입을 **넘기면**, 컴파일러가 조건을 계산해 결과 타입을 돌려줍니다.
- 값 레벨 코드는 프로그램이 **실행될 때** 계산되지만, 타입 레벨 코드는 컴파일러가 **검사할 때** 계산됩니다. 실행 결과(JavaScript)에는 흔적도 남지 않습니다.

::: tip 결과를 확인하는 법
VS Code나 TS Playground에서 `A`, `B`, `C` 위에 마우스를 올리면 `type A = true`처럼 계산된 결과가 보입니다. 이 레슨의 `// 결과:` 주석은 모두 그렇게 확인한 값입니다.
:::

### 3단계: extends는 "같은가?"가 아니라 "들어가는가?"

조건부 타입의 `extends`는 [제네릭 제약](../part3-intermediate/05-generic-constraints)에서 본 `extends`와 같은 뜻입니다. "**왼쪽 타입의 값을 오른쪽 타입 자리에 넣을 수 있는가**(할당 가능한가)"를 묻습니다.

```ts
type T1 = '주문번호' extends string ? '들어감' : '안 들어감' // 결과: '들어감'
type T2 = string extends '주문번호' ? '들어감' : '안 들어감' // 결과: '안 들어감'

// 객체는 구조로 비교합니다. 속성이 더 많은 쪽이 더 좁은(구체적인) 타입입니다.
type Product = { id: number; name: string; price: number }
type HasId = { id: number }

type T3 = Product extends HasId ? '들어감' : '안 들어감' // 결과: '들어감'
type T4 = HasId extends Product ? '들어감' : '안 들어감' // 결과: '안 들어감'
```

- `'주문번호'`라는 리터럴 타입은 `string`의 일부이므로 들어갑니다.
- 반대로 아무 문자열이나 될 수 있는 `string`은 `'주문번호'` 하나짜리 자리에 들어가지 못합니다.
- `Product`는 `id`를 가지고 있으므로 `HasId` 자리에 들어갑니다. [구조적 타이핑](../part3-intermediate/02-structural-typing)에서 배운 그대로입니다.

::: info 작은 것이 큰 것에 들어갑니다
"`A extends B`가 참"이라는 말은 "A가 B보다 좁거나 같다", 즉 "A의 모든 값이 B의 값이기도 하다"라는 뜻입니다. 집합으로 그리면 A가 B 안에 쏙 들어가는 모양입니다.
:::

### 4단계: else if처럼 이어 쓰기

값 레벨에서 삼항 연산자를 이어 붙이면 `if … else if … else`처럼 쓸 수 있습니다. 조건부 타입도 똑같습니다.

```ts
// 값 레벨
function typeName(value: unknown) {
  return typeof value === 'string'
    ? 'string'
    : typeof value === 'number'
      ? 'number'
      : typeof value === 'boolean'
        ? 'boolean'
        : 'object'
}
console.log(typeName(3000)) // 출력: number

// 타입 레벨
type TypeName<T> = T extends string
  ? 'string'
  : T extends number
    ? 'number'
    : T extends boolean
      ? 'boolean'
      : 'object'

type N1 = TypeName<3000> // 결과: 'number'
type N2 = TypeName<'라떼'> // 결과: 'string'
type N3 = TypeName<{ id: 1 }> // 결과: 'object'
```

위에서부터 차례로 검사해, 처음으로 참이 되는 갈래의 결과를 돌려줍니다.

### 5단계: 참 갈래에서는 T가 좁혀진다

조건이 참인 갈래 안에서는 컴파일러가 `T`를 "`U`에 들어가는 타입"으로 알고 있습니다. 그래서 `string` 전용 타입 도구를 바로 쓸 수 있습니다.

```ts
// Uppercase<S>는 문자열 리터럴 타입을 대문자로 바꾸는 내장 타입입니다(4번 레슨에서 자세히 배웁니다).
type ShoutIfString<T> = T extends string ? Uppercase<T> : T

type S1 = ShoutIfString<'sale'> // 결과: 'SALE'
type S2 = ShoutIfString<500> // 결과: 500
```

값 레벨에서 `if (typeof value === 'string') { value.toUpperCase() }`처럼 조건 안에서 문자열 메서드를 쓰는 것과 같은 원리입니다. [타입 좁히기](../part2-types/08-narrowing)가 타입 레벨에서도 일어나는 셈입니다.

### 6단계: 실무 예 — 응답 타입 고르기

조건부 타입은 "입력 타입에 따라 출력 타입이 달라지는" 상황에서 빛납니다.

```ts
type Product = { id: number; name: string }
type Member = { id: number; nickname: string }

// 요청한 리소스 이름에 따라 응답 데이터 타입이 달라집니다.
type ResourceData<R> = R extends 'products' ? Product[] : R extends 'members' ? Member[] : never

type ProductsResponse = ResourceData<'products'> // 결과: Product[]
type MembersResponse = ResourceData<'members'> // 결과: Member[]
type Unknown = ResourceData<'stores'> // 결과: never
```

없는 리소스 이름에는 `never`(값이 하나도 없는 타입)를 돌려주어, 그런 응답을 쓰려 하면 곧바로 에러가 나게 만들었습니다.

### 7단계: 분배 법칙 — 유니온이 들어오면 하나씩 나뉜다

이제 이 레슨의 가장 중요한 부분입니다. 조건부 타입에 **유니온 타입**을 넣으면 어떻게 될까요?

```ts
type ToArray<T> = T extends unknown ? T[] : never

type R = ToArray<string | number> // 결과: string[] | number[]
```

`(string | number)[]`가 아니라 `string[] | number[]`가 나왔습니다. 무슨 일이 일어났는지 한 단계씩 전개해 봅시다.

```text
① ToArray<string | number>

② T 자리에 유니온이 들어왔으므로, 멤버마다 따로 계산합니다(분배).
   = ToArray<string> | ToArray<number>

③ 각각을 조건부 타입으로 풉니다.
   = (string extends unknown ? string[] : never)
   | (number extends unknown ? number[] : never)

④ 각 조건을 계산합니다. 모든 타입은 unknown에 들어가므로 둘 다 참입니다.
   = string[] | number[]
```

값 레벨로 비유하면, 유니온을 배열처럼 보고 `map`을 돌린 다음 다시 유니온으로 합치는 것과 같습니다.

```ts
// 값 레벨 비유: 유니온의 멤버 목록을 배열이라고 생각해 봅니다.
const members = ['string', 'number']
const result = members.map((t) => `${t}[]`)
console.log(result.join(' | ')) // 출력: string[] | number[]
```

::: info 분배가 일어나는 조건
분배는 **아무것도 씌우지 않은 타입 매개변수**(naked type parameter)가 `extends` 왼쪽에 **홀로** 있을 때만 일어납니다.

- `T extends ...` → 분배됨
- `[T] extends ...`, `T[] extends ...`, `Promise<T> extends ...` → 분배 안 됨
- 제네릭이 아닌 `(string | number) extends ...` → 분배 안 됨
:::

### 8단계: 분배를 한 번 더 따라가 보기

주문 상태 유니온으로 조금 더 길게 전개해 봅시다.

```ts
type OrderStatus = 'pending' | 'paid' | 'shipped' | 'cancelled'

// 취소 상태면 never, 나머지는 그대로 둡니다.
type ActiveStatus<T> = T extends 'cancelled' ? never : T

type R = ActiveStatus<OrderStatus> // 결과: 'pending' | 'paid' | 'shipped'
```

```text
ActiveStatus<'pending' | 'paid' | 'shipped' | 'cancelled'>

= ('pending'   extends 'cancelled' ? never : 'pending')
| ('paid'      extends 'cancelled' ? never : 'paid')
| ('shipped'   extends 'cancelled' ? never : 'shipped')
| ('cancelled' extends 'cancelled' ? never : 'cancelled')

= 'pending' | 'paid' | 'shipped' | never

= 'pending' | 'paid' | 'shipped'      ← 유니온 안의 never는 사라집니다
```

마지막 줄이 중요합니다. **유니온 안에 `never`가 섞이면 사라집니다.** `never`는 값이 하나도 없는 타입이라, "A 또는 (아무것도 아님)"은 그냥 "A"이기 때문입니다. 값 레벨로 치면 배열에서 빈 칸을 걸러 내는 `filter`와 비슷합니다. 이 성질 덕분에 조건부 타입으로 유니온을 **걸러 낼** 수 있습니다.

### 9단계: [T]로 분배 막기

분배가 늘 반가운 것은 아닙니다. "유니온 전체를 한 덩어리로" 검사하고 싶을 때가 있습니다.

```ts
// 분배되는 버전
type IsStringD<T> = T extends string ? true : false
// 분배를 막은 버전: T를 길이 1짜리 튜플로 감쌉니다.
type IsStringN<T> = [T] extends [string] ? true : false

type D = IsStringD<'a' | 1> // 결과: boolean
type N = IsStringN<'a' | 1> // 결과: false
```

`D`가 `boolean`인 이유를 전개해 봅시다.

```text
IsStringD<'a' | 1>
= ('a' extends string ? true : false) | (1 extends string ? true : false)
= true | false
= boolean          ← boolean은 원래 true | false의 다른 이름입니다
```

`N`은 감싼 덕분에 나뉘지 않습니다.

```text
IsStringN<'a' | 1>
= ['a' | 1] extends [string] ? true : false
= false            ← 'a' | 1 전체가 string에 들어가지 않으므로
```

같은 방법으로 앞의 `ToArray`도 두 가지로 만들 수 있습니다.

```ts
type ToArrayD<T> = T extends unknown ? T[] : never
type ToArrayN<T> = [T] extends [unknown] ? T[] : never

type D = ToArrayD<string | number> // 결과: string[] | number[]
type N = ToArrayN<string | number> // 결과: (string | number)[]
```

| 원하는 것 | 쓰는 모양 |
|---|---|
| 유니온 멤버마다 따로 처리(걸러 내기, 변환) | `T extends U ? X : Y` |
| 유니온 전체를 한 덩어리로 판단 | `[T] extends [U] ? X : Y` |

::: tip 대괄호는 "튜플로 감싸기"입니다
`[T]`는 특별한 문법이 아니라 원소가 하나인 튜플 타입입니다. `T`가 더 이상 "홀로 있는 타입 매개변수"가 아니게 되므로 분배 조건에서 빠집니다. `[T] extends [U]`는 튜플끼리 비교하므로 결국 `T extends U`와 같은 뜻이 됩니다(분배만 빠집니다).
:::

### 10단계: never의 특수 동작

`never`를 조건부 타입에 넣어 보면 놀라운 결과가 나옵니다.

```ts
type IsString<T> = T extends string ? true : false

type R1 = IsString<never> // 결과: never
```

`true`도 `false`도 아니고 `never`입니다. 비유에서 본 "빈 묶음" 때문입니다.

```text
never는 "멤버가 0개인 유니온"입니다.
분배 = 멤버마다 계산해서 합치기
멤버가 0개 → 계산할 것이 없음 → 합친 결과도 멤버 0개 → never
```

값 레벨로 치면 빈 배열에 `map`을 돌리면 빈 배열이 나오는 것과 같습니다.

```ts
console.log([].map((x) => x)) // 출력: []
```

그래서 "이 타입이 `never`인가?"를 검사하는 타입은 **반드시 분배를 막아야** 합니다.

```ts
// 잘못된 버전: never가 들어오면 분배되어 결과가 never가 됩니다.
type IsNeverWrong<T> = T extends never ? true : false
// 올바른 버전
type IsNever<T> = [T] extends [never] ? true : false

type W = IsNeverWrong<never> // 결과: never
type OK1 = IsNever<never> // 결과: true
type OK2 = IsNever<string> // 결과: false
```

::: warning never 분배는 제네릭일 때만
`never extends string ? true : false`처럼 제네릭 없이 직접 쓰면 분배가 일어나지 않아 `true`가 나옵니다. "빈 묶음 규칙"은 타입 매개변수로 `never`가 **넘어왔을 때만** 적용됩니다.
:::

```ts
type Direct = never extends string ? true : false // 결과: true
```

### 11단계: any를 넣으면 두 갈래가 다 나온다

`any`(타입 검사를 끄는 타입)는 또 다르게 동작합니다.

```ts
type IsString<T> = T extends string ? true : false

type R = IsString<any> // 결과: boolean
```

`any`는 "무엇이든 될 수 있다"는 뜻이라 컴파일러가 참인지 거짓인지 고르지 못하고, **두 갈래의 결과를 유니온으로** 돌려줍니다(`true | false` = `boolean`). `unknown`은 이렇게 되지 않습니다. `unknown extends string`은 그냥 거짓입니다.

```ts
type IsString<T> = T extends string ? true : false

type U = IsString<unknown> // 결과: false
```

### 12단계: Exclude 직접 구현하기

[내장 유틸리티 타입](../part3-intermediate/07-utility-types)에서 쓴 `Exclude<T, U>`는 "T 유니온에서 U에 들어가는 멤버를 빼는" 타입이었습니다. 이제 그 속을 직접 만들 수 있습니다.

```ts
// T의 각 멤버가 U에 들어가면 never(버림), 아니면 그 멤버를 남깁니다.
type MyExclude<T, U> = T extends U ? never : T

type PayMethod = 'card' | 'cash' | 'point' | 'coupon'
type R = MyExclude<PayMethod, 'point' | 'coupon'> // 결과: 'card' | 'cash'
```

```text
MyExclude<'card' | 'cash' | 'point' | 'coupon', 'point' | 'coupon'>

= ('card'   extends 'point' | 'coupon' ? never : 'card')
| ('cash'   extends 'point' | 'coupon' ? never : 'cash')
| ('point'  extends 'point' | 'coupon' ? never : 'point')
| ('coupon' extends 'point' | 'coupon' ? never : 'coupon')

= 'card' | 'cash' | never | never
= 'card' | 'cash'
```

`U` 쪽은 분배되지 않는다는 점에 주의하세요. 분배는 `extends` **왼쪽**에 홀로 있는 타입 매개변수에만 일어납니다. `'point' extends 'point' | 'coupon'`은 "point가 그 유니온 안에 들어가는가"를 묻는 한 번의 검사입니다.

값 레벨로 쓰면 `filter`입니다.

```ts
const payMethods = ['card', 'cash', 'point', 'coupon']
const excluded = ['point', 'coupon']
console.log(payMethods.filter((m) => !excluded.includes(m))) // 출력: [ 'card', 'cash' ]
```

### 13단계: Extract 직접 구현하기

`Extract<T, U>`는 반대로 "U에 들어가는 멤버만 남기는" 타입입니다. 갈래 두 개의 자리만 바꾸면 됩니다.

```ts
type MyExtract<T, U> = T extends U ? T : never

type Event =
  | { type: 'order'; orderId: number }
  | { type: 'refund'; orderId: number; amount: number }
  | { type: 'login'; memberId: string }

// 주문 번호를 가진 이벤트만 골라냅니다.
type OrderEvent = MyExtract<Event, { orderId: number }>
// 결과: { type: 'order'; orderId: number } | { type: 'refund'; orderId: number; amount: number }
```

객체 유니온에서도 잘 동작합니다. `{ type: 'login'; memberId: string }`은 `orderId`가 없으므로 `{ orderId: number }`에 들어가지 못해 버려졌습니다. [판별 유니온](../part3-intermediate/03-discriminated-union)에서 특정 갈래만 뽑을 때 자주 씁니다.

### 14단계: NonNullable 직접 구현하기

`NonNullable<T>`는 `null`과 `undefined`를 빼는 타입입니다. 지금까지 배운 것으로 바로 만들 수 있습니다.

```ts
type MyNonNullable<T> = T extends null | undefined ? never : T

type MaybeCoupon = string | null | undefined
type Coupon = MyNonNullable<MaybeCoupon> // 결과: string
```

::: info 내장 NonNullable의 실제 모습
TypeScript 4.8부터 내장 `NonNullable<T>`는 `T & {}`로 정의되어 있습니다. `{}`는 "null과 undefined를 뺀 모든 값"이라는 뜻이라, 교차(`&`)하면 `null`·`undefined`가 떨어져 나갑니다. 결과는 위의 조건부 타입 버전과 거의 같지만, 제네릭 코드 안에서 더 잘 좁혀진다는 장점이 있어 바뀌었습니다. 이 레슨에서는 원리를 익히기 위해 조건부 타입 버전을 씁니다.
:::

### 15단계: 함수 반환 타입에 조건부 타입 쓰기

조건부 타입은 함수의 반환 타입에도 쓸 수 있습니다. 넘긴 인수의 타입에 따라 반환 타입이 바뀝니다.

```ts
type Parsed<T> = T extends 'number' ? number : T extends 'boolean' ? boolean : string

declare function parseQuery<T extends 'number' | 'boolean' | 'string'>(key: string, as: T): Parsed<T>

const page = parseQuery('page', 'number') // 결과: number
const isNew = parseQuery('isNew', 'boolean') // 결과: boolean
```

`declare function`은 "이런 함수가 있다고 치자"며 몸체 없이 타입만 선언하는 문법입니다(8번 레슨에서 자세히 배웁니다). 그런데 함수 몸체를 직접 쓰면 문제가 생깁니다.

```ts
function isMemberLabel<T extends boolean>(isMember: T): T extends true ? '회원' : '비회원' {
  return isMember ? '회원' : '비회원'
  // ❌ Type '"회원" | "비회원"' is not assignable to type 'T extends true ? "회원" : "비회원"'. (TS2322)
}
```

함수 몸체 안에서 `T`는 아직 정해지지 않은 타입이라, 컴파일러가 조건부 타입을 계산하지 못하고 **미뤄 둡니다**(deferred). 그래서 `'회원' | '비회원'`이 그 미뤄 둔 타입에 들어가는지 판단하지 못해 에러가 납니다(TypeScript 5.6 기준). 실무에서는 보통 [오버로드](../part2-types/05-function-types)로 해결합니다.

```ts
// 오버로드: 호출하는 쪽에 보이는 시그니처
function memberLabel(isMember: true): '회원'
function memberLabel(isMember: false): '비회원'
function memberLabel(isMember: boolean): '회원' | '비회원'
// 구현 시그니처: 바깥에서는 보이지 않습니다.
function memberLabel(isMember: boolean): '회원' | '비회원' {
  return isMember ? '회원' : '비회원'
}

const label = memberLabel(true) // 결과: '회원'
```

## 자주 하는 실수

### 실수 1: 유니온을 넣고 하나의 결과를 기대함

```ts
type IsString<T> = T extends string ? true : false

// "전부 문자열이 아니니 false겠지?" 하고 기대했지만…
type R = IsString<'카드' | 0> // 결과: boolean
```

**왜 틀렸나**: `T`가 홀로 `extends` 왼쪽에 있어 분배가 일어났습니다. `'카드'`는 `true`, `0`은 `false`가 되어 합친 결과가 `boolean`입니다.

**고친 코드**: 유니온 전체를 판단하려면 `[T]`로 감쌉니다.

```ts
type IsAllString<T> = [T] extends [string] ? true : false

type R = IsAllString<'카드' | 0> // 결과: false
type OK = IsAllString<'카드' | '현금'> // 결과: true
```

### 실수 2: never 검사를 T extends never로 씀

```ts
type IsNever<T> = T extends never ? true : false

type R = IsNever<never> // 결과: never
```

**왜 틀렸나**: `never`는 멤버가 0개인 유니온이라 분배되면서 결과가 `never`가 됩니다. `true`를 기대한 코드가 조용히 `never`를 돌려주므로, 이 타입을 쓰는 다른 곳까지 이상하게 동작합니다.

**고친 코드**:

```ts
type IsNever<T> = [T] extends [never] ? true : false

type R = IsNever<never> // 결과: true
```

### 실수 3: extends 방향을 거꾸로 씀

```ts
// "string이면 true"를 의도했지만 방향이 반대입니다.
type IsStringWrong<T> = string extends T ? true : false

type R1 = IsStringWrong<'라떼'> // 결과: false
type R2 = IsStringWrong<unknown> // 결과: true
```

**왜 틀렸나**: `string extends T`는 "string이 T에 들어가는가", 즉 "T가 string보다 넓은가"를 묻습니다. `'라떼'`는 string보다 좁으니 거짓, `unknown`은 넓으니 참이 되어 의도와 정반대입니다.

**고친 코드**: 검사하려는 대상(`T`)을 왼쪽에 둡니다.

```ts
type IsString<T> = T extends string ? true : false

type R1 = IsString<'라떼'> // 결과: true
type R2 = IsString<unknown> // 결과: false
```

### 실수 4: 함수 구현에서 조건부 반환 타입에 그대로 return

```ts
function wrap<T extends string | number>(value: T): T extends string ? string[] : number[] {
  return [value]
  // ❌ Type '(string | number)[]' is not assignable to type 'T extends string ? string[] : number[]'. (TS2322)
}
```

**왜 틀렸나**: 함수 안에서 `T`가 정해지지 않았으므로 조건부 타입이 미뤄져, 컴파일러가 반환값을 검사하지 못합니다(TypeScript 5.6 기준). `[value]`는 `T`의 제약을 따라 `(string | number)[]`로 추론되는데, 이것이 미뤄 둔 조건부 타입에 들어가는지 알 수 없습니다.

**고친 코드**: 오버로드로 바깥 시그니처를 나눕니다. 꼭 조건부 타입 시그니처를 유지해야 한다면 오버로드 한 줄에 조건부 타입을 쓰고, 구현 시그니처는 넓게 둡니다.

```ts
function wrap<T extends string | number>(value: T): T extends string ? string[] : number[]
function wrap(value: string | number): (string | number)[] {
  return [value]
}

const a = wrap('라떼') // 결과: string[]
const b = wrap(4500) // 결과: number[]
```

## 직접 해 보기

### 문제 1 ⭐ IsNumber

`T`가 `number`에 들어가면 `true`, 아니면 `false`가 되는 `IsNumber<T>`를 만드세요.

```ts
// 여기에 IsNumber를 작성하세요.
// type R1 = IsNumber<4500>    // true 가 되어야 합니다
// type R2 = IsNumber<'4500'>  // false 가 되어야 합니다
```

::: details 정답 보기

```ts
type IsNumber<T> = T extends number ? true : false

type R1 = IsNumber<4500> // 결과: true
type R2 = IsNumber<'4500'> // 결과: false
```

값 레벨의 `typeof value === 'number' ? true : false`를 그대로 옮긴 모양입니다.
:::

### 문제 2 ⭐ 배열이면 요소 타입, 아니면 그대로

`T`가 배열이면 `'배열'`, 아니면 `'배열 아님'`이 되는 `ArrayCheck<T>`를 만드세요. 배열 타입은 `unknown[]`에 들어가는지로 확인할 수 있습니다.

::: details 정답 보기

```ts
type ArrayCheck<T> = T extends unknown[] ? '배열' : '배열 아님'

type R1 = ArrayCheck<string[]> // 결과: '배열'
type R2 = ArrayCheck<[number, number]> // 결과: '배열'
type R3 = ArrayCheck<string> // 결과: '배열 아님'
```

튜플 `[number, number]`도 배열의 한 종류라 `unknown[]`에 들어갑니다. `readonly string[]`은 `unknown[]`에 들어가지 않으니, 읽기 전용 배열까지 받으려면 `readonly unknown[]`로 검사합니다.
:::

### 문제 3 ⭐⭐ 회원 등급별 배송비

회원 등급 `'vip' | 'gold' | 'basic'`에 따라 배송비 타입이 `0`, `1500`, `3000`이 되는 `ShippingFee<G>`를 만드세요. 그리고 `ShippingFee<'vip' | 'basic'>`의 결과가 무엇일지 먼저 예상한 뒤 확인하세요.

::: details 정답 보기

```ts
type Grade = 'vip' | 'gold' | 'basic'
type ShippingFee<G extends Grade> = G extends 'vip' ? 0 : G extends 'gold' ? 1500 : 3000

type V = ShippingFee<'vip'> // 결과: 0
type B = ShippingFee<'basic'> // 결과: 3000
type Mixed = ShippingFee<'vip' | 'basic'> // 결과: 0 | 3000
```

`G`가 홀로 있으므로 분배되어 `0 | 3000`이 됩니다.

```text
ShippingFee<'vip' | 'basic'>
= ShippingFee<'vip'> | ShippingFee<'basic'>
= 0 | 3000
```
:::

### 문제 4 ⭐⭐ Exclude로 null 빼고 배열로

`T`에서 `null`과 `undefined`를 뺀 뒤, 남은 멤버를 **각각** 배열로 바꾸는 `CleanArray<T>`를 만드세요. 예: `CleanArray<string | number | null>`은 `string[] | number[]`.

::: details 정답 보기

```ts
type CleanArray<T> = T extends null | undefined ? never : T[]

type R = CleanArray<string | number | null> // 결과: string[] | number[]
```

한 번의 조건부 타입으로 "걸러 내기(never)"와 "변환(T[])"을 함께 했습니다.

```text
= (string extends null | undefined ? never : string[])
| (number extends null | undefined ? never : number[])
| (null   extends null | undefined ? never : null[])
= string[] | number[] | never
= string[] | number[]
```
:::

### 문제 5 ⭐⭐ 한 덩어리로 배열 만들기

`string | number`를 넣었을 때 `(string | number)[]`가 나오는 `ToArrayAll<T>`를 만드세요.

::: details 정답 보기

```ts
type ToArrayAll<T> = [T] extends [unknown] ? T[] : never

type R = ToArrayAll<string | number> // 결과: (string | number)[]
```

조건이 항상 참이라 사실 `type ToArrayAll<T> = T[]`로 써도 같은 결과입니다. `T[]`는 조건부 타입이 아니므로 분배가 일어나지 않습니다. 분배는 **조건부 타입에서만** 일어나는 현상이라는 점을 기억하세요.
:::

### 문제 6 ⭐⭐⭐ IsUnion

`T`가 두 개 이상의 멤버를 가진 유니온이면 `true`, 아니면 `false`가 되는 `IsUnion<T>`를 만드세요. `never`는 `false`로 처리합니다.

힌트: 분배되기 **전의** `T` 전체를 두 번째 타입 매개변수에 기본값으로 저장해 두고, 분배된 멤버 하나와 비교해 보세요.

::: details 정답 보기

```ts
type IsUnion<T, All = T> = [T] extends [never]
  ? false
  : T extends unknown
    ? [All] extends [T]
      ? false
      : true
    : never

type R1 = IsUnion<'card' | 'cash'> // 결과: true
type R2 = IsUnion<'card'> // 결과: false
type R3 = IsUnion<never> // 결과: false
```

전개해 봅시다.

```text
IsUnion<'card' | 'cash'>  (All = 'card' | 'cash')

1) [T] extends [never]? → 아니오
2) T extends unknown 으로 분배
   - 멤버 'card': [All] = ['card' | 'cash'] extends ['card'] ? → 아니오 → true
   - 멤버 'cash': ['card' | 'cash'] extends ['cash'] ? → 아니오 → true
3) true | true = true
```

멤버가 하나뿐이면 `All`과 멤버가 같아 `false`가 됩니다. 분배 법칙과 분배 막기를 한 타입 안에서 함께 쓴 예입니다.
:::

## 확인 퀴즈

1. `type R = IsString<'a' | 1>`(분배되는 `IsString`)의 결과는 무엇이고, 왜 그렇게 되나요?
2. 분배가 일어나는 조건을 한 문장으로 말해 보세요.
3. `IsNever<T>`를 `T extends never ? true : false`로 만들면 `IsNever<never>`가 무엇이 되나요?
4. `IsString<any>`와 `IsString<unknown>`의 결과는 각각 무엇인가요?
5. `Exclude<T, U>`를 조건부 타입 한 줄로 써 보세요.

::: details 정답 보기

1. `boolean`입니다. `'a'`에 대해 `true`, `1`에 대해 `false`가 계산되어 `true | false`, 즉 `boolean`이 됩니다.
2. 조건부 타입의 `extends` 왼쪽에 아무것도 씌우지 않은 타입 매개변수가 홀로 있고, 그 자리에 유니온이 들어왔을 때 일어납니다.
3. `never`입니다. `never`는 멤버가 0개인 유니온이라 분배 결과도 `never`가 됩니다. `[T] extends [never]`로 고쳐야 합니다.
4. `any`는 두 갈래를 모두 돌려주어 `boolean`, `unknown`은 `string`에 들어가지 않으므로 `false`입니다.
5. `type MyExclude<T, U> = T extends U ? never : T`
:::

## 정리

- 조건부 타입 `T extends U ? X : Y`는 타입 레벨의 삼항 연산자입니다. `extends`는 "들어가는가(할당 가능한가)"를 묻습니다.
- 조건이 참인 갈래에서는 `T`가 `U`로 좁혀져, `U` 전용 타입 도구를 쓸 수 있습니다.
- 홀로 있는 타입 매개변수에 유니온이 들어오면 멤버마다 따로 계산해 합칩니다(분배 법칙). 값 레벨의 `map`과 비슷합니다.
- 유니온 안의 `never`는 사라지므로, `never`를 돌려주는 갈래로 멤버를 걸러 낼 수 있습니다(`Exclude`·`Extract`·`NonNullable`).
- `[T] extends [U]`로 감싸면 분배가 멈춥니다. `never` 검사는 반드시 이렇게 합니다.
- `any`는 두 갈래를 모두, 제네릭으로 넘어온 `never`는 `never`를 돌려줍니다.
- 함수 몸체 안에서는 조건부 반환 타입이 미뤄지므로, 오버로드로 해결하는 경우가 많습니다.

## 다음 단계

[infer로 타입 꺼내기](./02-infer)에서는 조건부 타입 안에서 `infer`로 타입의 **일부분을 뽑아내는** 법을 배웁니다. 함수의 반환 타입, Promise 안의 타입, 배열의 요소 타입을 직접 꺼내는 `ReturnType`·`Awaited`를 만들어 봅니다.
