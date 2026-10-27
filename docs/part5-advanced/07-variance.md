---
title: 변성(공변·반공변)과 함수 타입 호환성
---

# 변성(공변·반공변)과 함수 타입 호환성

<LessonMeta level="고급" :minutes="50" prev="타입 가드·assertion 함수·satisfies로 값과 타입을 이었습니다" />

## 이번에 배울 것

- 변성(variance)이 "제네릭 타입끼리의 할당 가능 방향"을 정하는 규칙이라는 것을 설명할 수 있다.
- 공변·반공변·이변·불변을 "상자에서 꺼내기 / 상자에 넣기" 비유로 구분할 수 있다.
- 함수 매개변수가 반공변인 이유와 `strictFunctionTypes`의 역할을 설명할 수 있다.
- 배열 공변의 구멍과 메서드 선언의 이변성 함정을 알아보고 피할 수 있다.
- `in`·`out` 변성 표기(TypeScript 4.7+)를 읽고 쓸 수 있다.

## 먼저 알아 둘 것

- [구조적 타이핑과 할당 가능성](../part3-intermediate/02-structural-typing) — "A가 B 자리에 들어가는가"
- [함수 타입](../part2-types/05-function-types)
- [제네릭 기초](../part3-intermediate/04-generics-basics)
- [infer로 타입 꺼내기](./02-infer) — 4단계 팁의 "왜 `unknown[]`이 아니라 `any[]`인가"

## 비유로 이해하기

카페의 음료 진열장을 생각해 봅시다. 이 레슨에서 쓸 타입은 두 개입니다.

```text
음료(Drink)  ⊃  커피(Coffee)
모든 커피는 음료이지만, 모든 음료가 커피는 아닙니다.
```

이제 **상자**가 등장합니다.

1. **꺼내기만 하는 상자** — "커피가 나오는 자판기"가 있습니다. 손님이 "음료 나오는 기계 있나요?" 하고 물으면 이 자판기를 안내해도 됩니다. 커피도 음료니까요. → 상자 관계가 **내용물 관계와 같은 방향**: **공변**(covariant)
2. **넣기만 하는 상자** — "음료 아무거나 받는 수거함"이 있습니다. 누군가 "커피 컵 버릴 곳 있나요?" 하면 이 수거함을 안내해도 됩니다. 커피도 받으니까요. 반대로 "커피만 받는 수거함"을 "음료 수거함"이라고 안내하면 녹차 컵을 들고 온 손님이 곤란해집니다. → 상자 관계가 **내용물 관계와 반대 방향**: **반공변**(contravariant)
3. **넣고 빼기 둘 다 하는 상자** — "커피 보관함"을 "음료 보관함"이라고 하면 누가 녹차를 넣을 수 있고, "음료 보관함"을 "커피 보관함"이라고 하면 꺼낸 것이 녹차일 수 있습니다. 어느 쪽으로도 바꿔 쓰면 안 됩니다. → **불변**(invariant)
4. **아무 방향이나 허용하는 상자** — 원래는 위험하지만 편의상 양쪽을 다 허용하는 경우입니다. → **이변**(bivariant)

**변성**(variance)이란 이렇게 "내용물 타입의 관계가 상자 타입의 관계로 어떻게 이어지는가"를 부르는 이름입니다.

## 개념 설명

### 1단계: 준비 — 내용물 사이의 관계

```ts
interface Drink {
  name: string
  price: number
}
interface Coffee extends Drink {
  shots: number
}

const latte: Coffee = { name: '카페라떼', price: 5000, shots: 2 }
const drink: Drink = latte // ✅ 커피는 음료 자리에 들어갑니다

const greenTea: Drink = { name: '녹차', price: 4000 }
const coffee: Coffee = greenTea
// ❌ Property 'shots' is missing in type 'Drink' but required in type 'Coffee'. (TS2741)
```

이것이 [구조적 타이핑](../part3-intermediate/02-structural-typing)에서 배운 기본 관계입니다. 앞으로 `Coffee`를 "좁은 타입", `Drink`를 "넓은 타입"이라고 부르겠습니다. 좁은 것이 넓은 자리에 들어갑니다.

### 2단계: 공변 — 꺼내는 자리는 같은 방향

함수의 **반환값**은 "함수라는 상자에서 꺼내는 것"입니다.

```ts
interface Drink {
  name: string
  price: number
}
interface Coffee extends Drink {
  shots: number
}

const brewCoffee = (): Coffee => ({ name: '아메리카노', price: 4500, shots: 2 })

// "음료를 만들어 주는 함수" 자리에 "커피를 만들어 주는 함수"를 넣습니다.
const makeDrink: () => Drink = brewCoffee // ✅
console.log(makeDrink().name) // 출력: 아메리카노

const pourTea = (): Drink => ({ name: '녹차', price: 4000 })
const makeCoffee: () => Coffee = pourTea
// ❌ Type '() => Drink' is not assignable to type '() => Coffee'. (TS2322)
```

`makeDrink()`를 부르는 쪽은 "음료가 나오겠지" 하고 기대합니다. 커피가 나와도 음료이니 문제없습니다. 반대로 `makeCoffee()`를 부르는 쪽은 `shots`를 쓰려고 할 텐데 녹차가 나오면 곤란합니다.

```text
Coffee ⊂ Drink    이면
() => Coffee  ⊂  () => Drink      ← 같은 방향: 공변
```

읽기 전용 배열도 "꺼내기만 하는 상자"라서 공변입니다.

```ts
interface Drink {
  name: string
  price: number
}
interface Coffee extends Drink {
  shots: number
}

const coffees: readonly Coffee[] = [{ name: '에스프레소', price: 4000, shots: 1 }]
const drinks: readonly Drink[] = coffees // ✅ 꺼내기만 하므로 안전
console.log(drinks[0].name) // 출력: 에스프레소
```

### 3단계: 반공변 — 넣는 자리는 반대 방향

함수의 **매개변수**는 "함수라는 상자에 넣는 것"입니다. 여기서는 방향이 뒤집힙니다.

```ts
interface Drink {
  name: string
  price: number
}
interface Coffee extends Drink {
  shots: number
}

// 아무 음료나 받아 처리하는 함수
const printLabel = (drink: Drink) => console.log(`[${drink.name}] ${drink.price}원`)

// "커피를 받는 함수" 자리에 "음료를 받는 함수"를 넣습니다.
const printCoffee: (coffee: Coffee) => void = printLabel // ✅
printCoffee({ name: '콜드브루', price: 5500, shots: 2 }) // 출력: [콜드브루] 5500원
```

`printCoffee`를 부르는 쪽은 언제나 커피를 넘깁니다. `printLabel`은 음료라면 무엇이든 처리할 수 있으니 커피도 처리합니다. 안전합니다.

반대 방향은 막힙니다.

```ts
interface Drink {
  name: string
  price: number
}
interface Coffee extends Drink {
  shots: number
}

// 커피만 처리할 줄 아는 함수
const printShots = (coffee: Coffee) => console.log(`샷 ${coffee.shots.toFixed(0)}개`)

const printAnyDrink: (drink: Drink) => void = printShots
// ❌ Type '(coffee: Coffee) => void' is not assignable to type '(drink: Drink) => void'. (TS2322)
```

만약 이것이 허용되면 `printAnyDrink({ name: '녹차', price: 4000 })`처럼 녹차를 넘길 수 있고, `printShots` 안에서 `coffee.shots.toFixed`가 `undefined`를 만나 프로그램이 멈춥니다. 컴파일러가 그것을 미리 막았습니다.

```text
Coffee ⊂ Drink    이면
(drink: Drink) => void  ⊂  (coffee: Coffee) => void     ← 반대 방향: 반공변
```

| 자리 | 상자 비유 | 변성 | 규칙 |
|---|---|---|---|
| 반환 타입 | 꺼내기 | 공변 | 더 좁은 것을 돌려주는 함수는 넓은 자리에 들어감 |
| 매개변수 타입 | 넣기 | 반공변 | 더 넓은 것을 받는 함수는 좁은 자리에 들어감 |

이것이 2번 레슨에서 `(...args: unknown[]) => infer R`에 `(code: string) => number`가 들어가지 않았던 이유입니다. "아무 값(`unknown`)이나 넣을 수 있는 함수" 자리에 "문자열만 받는 함수"를 넣으려 했으니 반공변 규칙에 걸린 것입니다. `any[]`는 이 검사를 꺼 버리므로 통과했습니다.

### 4단계: strictFunctionTypes — 반공변 검사의 스위치

TypeScript는 처음에 매개변수를 **이변**(양쪽 방향 모두 허용)으로 검사했습니다. 위험하지만 기존 JavaScript 코드와 잘 맞았기 때문입니다. TypeScript 2.6에서 `strictFunctionTypes` 옵션이 생기면서 매개변수를 반공변으로 엄격하게 검사할 수 있게 되었고, 이 옵션은 `strict: true`에 포함되어 있습니다.

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

`strict: true`라면 따로 켤 필요가 없습니다. 반대로 `"strictFunctionTypes": false`로 끄면 3단계의 `printAnyDrink = printShots`가 에러 없이 통과해 버립니다. 이 위키는 항상 `strict` 기준이며, 옵션별 자세한 내용은 6부 [strict 옵션 하나씩 이해하기](../part6-tooling/02-strict-options)에서 다룹니다.

### 5단계: 메서드 선언의 이변성 함정

`strictFunctionTypes`를 켜도 **예외**가 하나 있습니다. 객체 타입에서 함수를 **메서드 문법**(`print(drink: Drink): void`)으로 선언하면 매개변수가 여전히 **이변**으로 검사됩니다.

```ts
interface Drink {
  name: string
  price: number
}
interface Coffee extends Drink {
  shots: number
}

const printShots = (coffee: Coffee) => console.log(coffee.shots.toFixed(0))

// 메서드 문법
interface PrinterMethod {
  print(drink: Drink): void
}
// 속성 문법(함수 타입을 값으로 가진 속성)
interface PrinterProperty {
  print: (drink: Drink) => void
}

const p1: PrinterMethod = { print: printShots } // 에러 없음! (이변)
const p2: PrinterProperty = { print: printShots }
// ❌ Type '(coffee: Coffee) => void' is not assignable to type '(drink: Drink) => void'. (TS2322)
```

`p1`은 컴파일되지만 실행하면 위험합니다.

```ts
interface Drink {
  name: string
  price: number
}
interface Coffee extends Drink {
  shots: number
}
interface PrinterMethod {
  print(drink: Drink): void
}

const p1: PrinterMethod = { print: (coffee: Coffee) => console.log(coffee.shots.toFixed(0)) }

try {
  p1.print({ name: '녹차', price: 4000 })
} catch (error) {
  console.log((error as Error).name) // 출력: TypeError
}
```

왜 이런 예외를 남겨 두었을까요? 다음 단계의 **배열** 때문입니다. `Array<T>`의 `push(...items: T[])` 같은 메서드가 모두 메서드 문법으로 선언되어 있어서, 이것까지 엄격하게 검사하면 `Coffee[]`를 `Drink[]` 자리에 넘기는 흔한 코드가 전부 에러가 나기 때문입니다.

::: tip 내가 만드는 타입은 속성 문법으로
콜백이나 핸들러를 담는 타입을 직접 만들 때는 `print: (drink: Drink) => void`처럼 **속성 문법**으로 쓰면 반공변 검사를 받을 수 있습니다. typescript-eslint에는 이를 강제하는 `method-signature-style` 규칙도 있습니다.
:::

### 6단계: 배열 공변의 구멍

일반 배열(`T[]`)은 넣기(`push`)와 빼기(`[0]`)를 모두 하는 상자입니다. 비유대로라면 **불변**이어야 안전합니다. 그런데 TypeScript는 편의를 위해 배열을 **공변**으로 취급합니다. 그래서 구멍이 생깁니다.

```ts
interface Drink {
  name: string
  price: number
}
interface Coffee extends Drink {
  shots: number
}

const coffees: Coffee[] = [{ name: '에스프레소', price: 4000, shots: 1 }]
const drinks: Drink[] = coffees // ✅ 에러 없음 (배열은 공변으로 취급)

drinks.push({ name: '녹차', price: 4000 }) // ✅ 에러 없음. 그런데 같은 배열입니다!

try {
  console.log(coffees[1].shots.toFixed(0))
} catch (error) {
  console.log((error as Error).name) // 출력: TypeError
}
```

`drinks`와 `coffees`는 **같은 배열**을 가리킵니다. 음료 자리로 바라본 쪽에서 녹차를 넣자, 커피 자리로 바라본 쪽에서는 커피인 줄 알고 꺼냈다가 `shots`가 없어 멈췄습니다.

이 구멍을 피하는 가장 쉬운 방법은 **받기만 하는 곳에서는 `readonly` 배열을 쓰는 것**입니다.

```ts
interface Drink {
  name: string
  price: number
}
interface Coffee extends Drink {
  shots: number
}

// 읽기만 하는 함수는 readonly 배열을 받습니다.
function totalPrice(drinks: readonly Drink[]): number {
  return drinks.reduce((sum, d) => sum + d.price, 0)
}

const coffees: Coffee[] = [
  { name: '에스프레소', price: 4000, shots: 1 },
  { name: '라떼', price: 5000, shots: 2 },
]
console.log(totalPrice(coffees)) // 출력: 9000
```

`readonly Drink[]`에는 `push`가 없으므로 함수 안에서 엉뚱한 음료를 넣을 수 없습니다. 꺼내기만 하는 상자이니 공변이 안전해졌습니다.

### 7단계: 불변 — 넣고 빼기 둘 다

직접 만든 제네릭 타입이 값을 **꺼내기도 하고 넣기도 하면**, 속성 문법으로 쓴 경우 컴파일러는 어느 방향으로도 바꿔 쓰지 못하게 합니다.

```ts
interface Drink {
  name: string
  price: number
}
interface Coffee extends Drink {
  shots: number
}

// 진열 칸: 꺼내기(get)와 넣기(set)를 모두 합니다.
interface Slot<T> {
  get: () => T
  set: (item: T) => void
}

declare const coffeeSlot: Slot<Coffee>
declare const drinkSlot: Slot<Drink>

const a: Slot<Drink> = coffeeSlot
// ❌ Type 'Slot<Coffee>' is not assignable to type 'Slot<Drink>'. (TS2322)
const b: Slot<Coffee> = drinkSlot
// ❌ Type 'Slot<Drink>' is not assignable to type 'Slot<Coffee>'. (TS2322)
```

- `a`가 막힌 이유: `set` 자리(넣기, 반공변) 때문입니다. 커피 칸에 녹차를 넣을 수 있게 되니까요.
- `b`가 막힌 이유: `get` 자리(꺼내기, 공변) 때문입니다. 꺼낸 것이 녹차일 수 있으니까요.

이렇게 양쪽 다 막히는 것이 **불변**입니다.

### 8단계: in · out 변성 표기 (TypeScript 4.7+)

컴파일러는 보통 제네릭 타입의 구조를 살펴 변성을 **스스로 계산**합니다. TypeScript 4.7부터는 타입 매개변수 앞에 `out`·`in`을 붙여 변성을 **직접 밝힐** 수 있습니다.

| 표기 | 뜻 | 상자 비유 |
|---|---|---|
| `out T` | T를 꺼내기만 함 → 공변 | 자판기 |
| `in T` | T를 넣기만 함 → 반공변 | 수거함 |
| `in out T` | 둘 다 → 불변 | 보관함 |

```ts
interface Drink {
  name: string
  price: number
}
interface Coffee extends Drink {
  shots: number
}

// 꺼내기만 하는 자판기
interface Vending<out T> {
  take: () => T
}
// 넣기만 하는 수거함
interface Collector<in T> {
  put: (item: T) => void
}

declare const coffeeVending: Vending<Coffee>
declare const drinkCollector: Collector<Drink>

const v: Vending<Drink> = coffeeVending // ✅ 공변
const c: Collector<Coffee> = drinkCollector // ✅ 반공변
```

표기가 실제 구조와 맞지 않으면 컴파일러가 알려 줍니다.

```ts
// put은 T를 넣는 자리인데 out(꺼내기만)이라고 잘못 표기했습니다.
interface WrongCollector<out T> {
  put: (item: T) => void
}
// ❌ Type 'WrongCollector<sub-T>' is not assignable to type 'WrongCollector<super-T>' as implied by variance annotation. (TS2636)
```

에러 메시지의 `sub-T`·`super-T`는 "T의 좁은 버전"과 "T의 넓은 버전"을 뜻하는 가상의 이름입니다.

::: info 언제 변성 표기를 쓰나요?
대부분의 코드에서는 쓸 일이 없습니다. 컴파일러의 계산이 정확하기 때문입니다. 아주 큰 제네릭 타입에서 변성 계산이 느릴 때 성능을 위해, 또는 라이브러리 작성자가 의도를 문서로 남기기 위해 씁니다. 라이브러리 타입에서 `<out T>`를 만나면 "꺼내기만 하는 상자구나" 하고 읽을 수 있으면 충분합니다.
:::

### 9단계: 실무 의미 — 콜백 재사용

변성 규칙을 실무 문장으로 바꾸면 이렇습니다.

> **콜백을 받는 함수는, 그 콜백에 넘겨줄 값보다 넓은 타입을 받는 콜백도 받는다.**

```ts
interface Drink {
  name: string
  price: number
}
interface Coffee extends Drink {
  shots: number
}

function onCoffeeReady(callback: (coffee: Coffee) => void) {
  callback({ name: '플랫화이트', price: 5500, shots: 2 })
}

// 음료 공용 알림 함수를 커피 완료 콜백으로 재사용할 수 있습니다.
const notifyDrink = (drink: Drink) => console.log(`${drink.name} 나왔습니다`)
onCoffeeReady(notifyDrink) // 출력: 플랫화이트 나왔습니다
```

음료 공용 함수를 커피 전용 자리에 재사용할 수 있는 것, 이것이 반공변이 주는 실용적인 이점입니다.

## 자주 하는 실수

### 실수 1: 좁은 매개변수 콜백을 넓은 자리에 넘김

```ts
interface Drink {
  name: string
  price: number
}
interface Coffee extends Drink {
  shots: number
}

function serveAll(drinks: Drink[], handler: (drink: Drink) => void) {
  drinks.forEach(handler)
}

const logShots = (coffee: Coffee) => console.log(coffee.shots)

serveAll([], logShots)
// ❌ Argument of type '(coffee: Coffee) => void' is not assignable to parameter of type '(drink: Drink) => void'. (TS2345)
```

**왜 틀렸나**: `serveAll`은 녹차 같은 아무 음료나 `handler`에 넘길 수 있습니다. 커피만 다룰 줄 아는 `logShots`는 그 자리에 들어갈 수 없습니다(매개변수 반공변).

**고친 코드**: 콜백이 넓은 타입을 받도록 고치고, 안에서 좁히기로 처리합니다.

```ts
interface Drink {
  name: string
  price: number
}

function serveAll(drinks: Drink[], handler: (drink: Drink) => void) {
  drinks.forEach(handler)
}

const logShots = (drink: Drink) => console.log('shots' in drink ? `샷 ${drink.shots}` : '커피 아님')

serveAll([{ name: '녹차', price: 4000 }], logShots) // 출력: 커피 아님
```

### 실수 2: 콜백 타입을 메서드 문법으로 선언함

```ts
interface Drink {
  name: string
  price: number
}
interface Coffee extends Drink {
  shots: number
}

interface OrderHooks {
  onServe(drink: Drink): void
}

const hooks: OrderHooks = {
  onServe: (coffee: Coffee) => console.log(coffee.shots), // 에러 없음
}
```

**왜 틀렸나**: 메서드 문법은 매개변수를 이변으로 검사합니다. 위험한 콜백이 조용히 통과해 실행 중에 문제를 일으킬 수 있습니다.

**고친 코드**: 속성 문법으로 선언해 반공변 검사를 받습니다.

```ts
interface Drink {
  name: string
  price: number
}
interface Coffee extends Drink {
  shots: number
}

interface OrderHooks {
  onServe: (drink: Drink) => void
}

const hooks: OrderHooks = {
  onServe: (coffee: Coffee) => console.log(coffee.shots),
  // ❌ Type '(coffee: Coffee) => void' is not assignable to type '(drink: Drink) => void'. (TS2322)
}
```

### 실수 3: 받은 배열에 값을 넣음

```ts
interface Drink {
  name: string
  price: number
}
interface Coffee extends Drink {
  shots: number
}

function addSample(drinks: Drink[]) {
  drinks.push({ name: '시음용 녹차', price: 0 })
}

const coffees: Coffee[] = []
addSample(coffees) // 에러 없음 — coffees 안에 녹차가 들어갔습니다
console.log(coffees.length) // 출력: 1
```

**왜 틀렸나**: 배열은 공변으로 취급되어 `Coffee[]`가 `Drink[]` 자리에 들어갑니다. 함수 안에서 `push`하면 커피 배열에 커피가 아닌 것이 섞입니다.

**고친 코드**: 받은 배열을 바꾸지 말고 새 배열을 돌려줍니다. 읽기만 한다는 뜻으로 `readonly`를 붙이면 `push`가 아예 막힙니다.

```ts
interface Drink {
  name: string
  price: number
}
interface Coffee extends Drink {
  shots: number
}

function withSample(drinks: readonly Drink[]): Drink[] {
  return [...drinks, { name: '시음용 녹차', price: 0 }]
}

const coffees: Coffee[] = []
const menu = withSample(coffees)
console.log(coffees.length, menu.length) // 출력: 0 1
```

### 실수 4: 변성 표기를 구조와 반대로 붙임

```ts
interface Display<in T> {
  current: () => T
}
// ❌ Type 'Display<super-T>' is not assignable to type 'Display<sub-T>' as implied by variance annotation. (TS2636)
```

**왜 틀렸나**: `current`는 T를 **꺼내는** 자리인데 `in`(넣기만)이라고 표기했습니다.

**고친 코드**: 꺼내기만 하면 `out`입니다. 확신이 없으면 표기를 빼고 컴파일러의 계산에 맡깁니다.

```ts
interface Display<out T> {
  current: () => T
}

declare const d: Display<'라떼'>
const wide: Display<string> = d // ✅
```

## 직접 해 보기

### 문제 1 ⭐ 어느 쪽이 들어갈까?

`type Getter<T> = () => T`일 때, `Getter<'card'>`와 `Getter<string>` 중 어느 것이 어느 자리에 들어가나요? 코드로 확인하세요.

::: details 정답 보기

```ts
type Getter<T> = () => T

declare const getCard: Getter<'card'>
const g: Getter<string> = getCard // ✅ 반환 타입은 공변
```

`'card'`는 `string`보다 좁고, 반환 자리는 같은 방향이므로 `Getter<'card'>`가 `Getter<string>` 자리에 들어갑니다. 반대는 에러입니다.
:::

### 문제 2 ⭐ 매개변수 방향

`type Handler<T> = (value: T) => void`일 때 `Handler<string>`을 `Handler<'card'>` 자리에 넣을 수 있나요?

::: details 정답 보기

```ts
type Handler<T> = (value: T) => void

const logAny: Handler<string> = (value) => console.log(value)
const onCard: Handler<'card'> = logAny // ✅ 매개변수는 반공변
onCard('card') // 출력: card
```

아무 문자열이나 처리하는 함수는 `'card'`만 오는 자리에서도 잘 동작합니다.
:::

### 문제 3 ⭐⭐ 이 타입의 변성은?

다음 `Queue<T>`의 `T`는 공변·반공변·불변 중 무엇일까요? 이유와 함께 답하고, `in`/`out`으로 표기해 보세요.

```ts
interface Queue<T> {
  enqueue: (item: T) => void
  dequeue: () => T | undefined
}
```

::: details 정답 보기

넣기(`enqueue`)와 꺼내기(`dequeue`)를 모두 하므로 **불변**입니다.

```ts
interface Queue<in out T> {
  enqueue: (item: T) => void
  dequeue: () => T | undefined
}

declare const latteQueue: Queue<'라떼'>
const q: Queue<string> = latteQueue
// ❌ Type 'Queue<"라떼">' is not assignable to type 'Queue<string>'. (TS2322)
```
:::

### 문제 4 ⭐⭐ 메서드 문법 찾기

다음 인터페이스에서 위험한 콜백을 통과시키는 줄을 찾아 고치세요.

```ts
interface PaymentEvents {
  onSuccess(result: { orderId: number }): void
  onFail: (reason: string) => void
}
```

::: details 정답 보기

`onSuccess`가 메서드 문법이라 매개변수가 이변으로 검사됩니다. 속성 문법으로 바꿉니다.

```ts
interface PaymentEvents {
  onSuccess: (result: { orderId: number }) => void
  onFail: (reason: string) => void
}

const events: PaymentEvents = {
  onSuccess: (result) => console.log(`${result.orderId} 결제 성공`),
  onFail: (reason) => console.log(reason),
}
events.onSuccess({ orderId: 1001 }) // 출력: 1001 결제 성공
```
:::

### 문제 5 ⭐⭐⭐ 비교 함수 재사용

`compareByPrice(a: { price: number }, b: { price: number }): number` 함수 하나로 여러 종류의 배열을 정렬할 수 있는 이유를 변성으로 설명하고, 코드로 확인하세요.

::: details 정답 보기

```ts
interface Coffee {
  name: string
  price: number
  shots: number
}

const compareByPrice = (a: { price: number }, b: { price: number }) => a.price - b.price

const coffees: Coffee[] = [
  { name: '라떼', price: 5000, shots: 2 },
  { name: '에스프레소', price: 4000, shots: 1 },
]
coffees.sort(compareByPrice) // sort는 (a: Coffee, b: Coffee) => number 를 기대합니다
console.log(coffees.map((c) => c.name)) // 출력: [ '에스프레소', '라떼' ]
```

`sort`가 기대하는 것은 `(a: Coffee, b: Coffee) => number`입니다. 매개변수는 반공변이므로, 더 넓은 `{ price: number }`를 받는 함수가 그 자리에 들어갑니다. 가격만 있으면 무엇이든 비교할 수 있는 함수이니, 커피든 상품이든 다 처리할 수 있습니다.
:::

## 확인 퀴즈

1. 공변과 반공변을 "상자" 비유로 각각 한 문장씩 설명해 보세요.
2. 함수의 반환 타입과 매개변수 타입은 각각 어떤 변성을 가지나요?
3. `strictFunctionTypes`를 켜도 이변으로 검사되는 경우는?
4. 일반 배열 `T[]`가 공변으로 취급되어 생기는 문제는 무엇이고, 어떻게 피하나요?
5. `interface Box<out T>`의 `out`은 무슨 뜻이며 몇 버전부터 쓸 수 있나요?

::: details 정답 보기

1. 공변: 꺼내기만 하는 상자는 "커피 상자"를 "음료 상자" 자리에 써도 된다. 반공변: 넣기만 하는 상자는 "음료 수거함"을 "커피 수거함" 자리에 써도 된다.
2. 반환 타입은 공변, 매개변수 타입은 반공변입니다(`strictFunctionTypes` 기준).
3. 객체 타입의 함수를 메서드 문법(`print(x: T): void`)으로 선언한 경우입니다.
4. `Coffee[]`를 `Drink[]`로 바라본 쪽에서 커피가 아닌 음료를 `push`할 수 있어, 원래 배열에 엉뚱한 값이 섞입니다. 받기만 하는 곳에서는 `readonly` 배열을 쓰고, 받은 배열을 바꾸지 않습니다.
5. "T를 꺼내기만 한다(공변)"는 표기이며 TypeScript 4.7부터 쓸 수 있습니다.
:::

## 정리

- 변성은 "내용물 타입의 관계가 제네릭 타입(상자)의 관계로 어떻게 이어지는가"입니다.
- 꺼내는 자리(반환 타입, 읽기 전용 배열)는 **공변**, 넣는 자리(매개변수)는 **반공변**, 둘 다 하면 **불변**입니다.
- 매개변수 반공변 검사는 `strictFunctionTypes`(strict에 포함)가 담당합니다. 단, **메서드 문법**은 여전히 이변이므로 콜백 타입은 속성 문법으로 씁니다.
- 일반 배열은 편의상 공변으로 취급되어 구멍이 있습니다. 받기만 하는 곳에는 `readonly` 배열을 쓰세요.
- `in`·`out`(4.7+)으로 변성을 직접 표기할 수 있고, 구조와 맞지 않으면 TS2636 에러가 납니다.

## 다음 단계

[선언 파일(.d.ts) · 선언 병합 · 모듈 보강](./08-declaration-files)에서는 남이 만든 JavaScript 코드에 타입을 입히는 방법을 배웁니다. `declare`, `@types` 패키지, 인터페이스 병합, `Window`에 속성 추가하기까지 실무에서 꼭 만나는 내용입니다.
