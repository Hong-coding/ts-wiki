---
title: 타입 레벨 프로그래밍 훈련 (type-challenges 풀이)
---

# 타입 레벨 프로그래밍 훈련 (type-challenges 풀이)

<LessonMeta level="고급" :minutes="90" prev="선언 파일·선언 병합·모듈 보강으로 남의 코드에 타입을 입혔습니다" />

## 이번에 배울 것

- type-challenges가 무엇인지 알고, 테스트(`Equal`·`Expect`·`@ts-expect-error`)를 통과시키는 방식으로 타입 문제를 풀 수 있다.
- 문제를 "입력 타입 → 출력 타입" 함수로 바꿔 생각하고, 값 레벨 코드를 먼저 떠올린 뒤 타입으로 옮길 수 있다.
- Part 5에서 배운 조건부 타입·`infer`·매핑된 타입·템플릿 리터럴·재귀를 조합해 쉬움~보통 난이도 문제 13개를 풀 수 있다.
- 오답이 왜 테스트를 통과하지 못하는지 분배·`never`·`readonly`·`Equal`의 관점에서 설명할 수 있다.

## 먼저 알아 둘 것

Part 5의 앞 레슨을 모두 배웠다고 가정합니다. 막히면 해당 레슨으로 돌아가세요.

- [조건부 타입과 분배 법칙](./01-conditional-types)
- [infer로 타입 꺼내기](./02-infer) — 8단계 `Expect`·`Equal`
- [매핑된 타입과 키 재매핑(as)](./03-mapped-types)
- [템플릿 리터럴 타입](./04-template-literal-types)
- [재귀 타입](./05-recursive-types)

## 비유로 이해하기

악기를 배울 때 이론책만 읽어서는 연주가 늘지 않습니다. **연습곡**(에튀드)을 하나씩 쳐 봐야 손에 익습니다. 연습곡은 짧고, 한 가지 기술에 집중하며, 맞게 쳤는지 스스로 알 수 있습니다.

**type-challenges**는 타입 레벨 프로그래밍의 연습곡 모음입니다.

- 문제마다 "이런 타입을 만들어라"라는 짧은 요구가 있습니다.
- 정답 여부는 **테스트 코드**가 판정합니다. 빨간 줄(컴파일 에러)이 모두 사라지면 통과입니다.
- 쉬운 곡부터 어려운 곡까지 난이도가 나뉘어 있습니다.

이번 레슨에서는 연습곡을 함께 쳐 보면서, **어떤 생각의 순서로 푸는지**를 익힙니다. 정답 코드보다 그 생각의 순서가 더 중요합니다.

## 개념 설명

### 1단계: type-challenges 소개와 풀이 환경

type-challenges(https://github.com/type-challenges/type-challenges)는 TypeScript 타입 문제를 모아 둔 공개 저장소입니다. 문제는 난이도에 따라 warm-up(몸풀기), easy(쉬움), medium(보통), hard(어려움), extreme(극한)으로 나뉘고, 문제마다 설명과 테스트 코드가 들어 있습니다.

푸는 방법은 두 가지입니다.

1. **TS Playground에서 풀기**: 저장소의 문제 페이지에 있는 "Take the Challenge" 링크를 누르면, 문제와 테스트가 미리 들어 있는 [TS Playground](../part0-start/04-playground)가 열립니다. 설치가 필요 없어 가장 간편합니다.
2. **내 PC에서 풀기**: 빈 폴더에 `.ts` 파일을 만들고, 이 레슨처럼 테스트 헬퍼를 직접 적은 뒤 `tsc --noEmit --strict`로 검사합니다. 저장소가 쓰는 헬퍼는 `@type-challenges/utils` 패키지로도 받을 수 있습니다.

::: info 이 레슨의 문제 서술에 대해
이 레슨의 문제는 type-challenges의 주제를 빌려 오되, **문제 설명과 예시는 모두 새로 썼습니다**(매장·주문 예시). 원문 문제와 다른 사람들의 풀이는 저장소에서 직접 확인하세요. 저장소의 문제 번호와 난이도는 작성 시점 기준입니다.
:::

### 2단계: 테스트 도구 세 가지

이 레슨의 모든 코드 블록은 2번 레슨에서 만든 두 헬퍼가 **맨 위에 있다고 가정**합니다. 직접 실행해 볼 때는 아래 두 줄을 파일 맨 위에 붙여 넣으세요.

```ts
// 두 타입이 완전히 같으면 true, 아니면 false
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false
// true만 받습니다. false가 들어오면 컴파일 에러가 납니다.
type Expect<T extends true> = T
```

테스트는 세 가지 모양으로 씁니다.

```ts
type Cases = [
  // ① 결과가 기대와 "완전히" 같아야 통과
  Expect<Equal<Uppercase<'card'>, 'CARD'>>,
  // ② 결과가 기대와 달라야 통과 (Equal이 false여야 함)
  Expect<Equal<Equal<string, 'card'>, false>>,
]

// ③ 다음 줄에 반드시 에러가 나야 통과. 에러가 안 나면 오히려 에러(TS2578)가 납니다.
// @ts-expect-error
const price: number = '4500원'
```

- `type Cases = [ ... ]`는 테스트 여러 개를 튜플 하나에 모아 두는 관용구입니다. 하나라도 `Expect`를 통과하지 못하면 그 줄에 빨간 줄이 생깁니다.
- `// @ts-expect-error` 주석은 "다음 줄은 틀린 코드여야 한다"는 테스트입니다. "잘못된 입력을 거절하는가"를 확인할 때 씁니다.

::: tip 왜 Equal은 이렇게 생겼을까요?
`A extends B`는 "들어가는가"만 묻기 때문에, `readonly`가 붙었는지, `any`인지 같은 차이를 구별하지 못합니다. `Equal`은 두 타입을 각각 아직 계산되지 않은 조건부 타입 안에 넣고, 컴파일러가 "두 조건부 타입이 같은 것인가"를 판단할 때 쓰는 **엄격한 동일성 비교**를 빌려 씁니다. 컴파일러 내부 동작에 기대는 관용구라 원리를 깊게 이해할 필요는 없습니다. "정확히 같은지 볼 때 쓰는 도구"로 기억하면 충분합니다.
:::

### 3단계: 푸는 순서 — 네 가지 질문

모든 문제를 같은 순서로 생각합니다.

1. **입력과 출력은?** 타입 매개변수는 무엇이고, 어떤 모양의 타입을 돌려줘야 하나?
2. **값 레벨로 쓰면?** 같은 일을 하는 JavaScript 함수를 먼저 떠올린다.
3. **어떤 도구로 옮기나?**
   - 갈림길(`if`) → 조건부 타입
   - 일부 꺼내기(구조 분해) → `infer`
   - 객체 속성 반복(`for...in`) → 매핑된 타입
   - 문자열 다루기 → 템플릿 리터럴 타입
   - 반복(`while`·재귀) → 재귀 타입
4. **테스트로 확인.** 빨간 줄이 남으면, 그 테스트의 입력으로 손 전개를 해 본다.

이제 연습곡을 쳐 봅시다. 쉬운 것부터 차례로 갑니다.

### 문제 1. Pick 직접 만들기 (쉬움)

**문제**: 객체 타입 `T`와 그 키들의 유니온 `K`를 받아, `K`에 해당하는 속성만 남긴 객체 타입을 만드세요. 내장 `Pick`을 쓰면 안 됩니다. `T`에 없는 키를 넣으면 에러가 나야 합니다.

```ts
type MyPick<T, K extends keyof T> = { [P in K]: T[P] }

type Product = { code: string; name: string; price: number; memo?: string }

type Cases = [
  Expect<Equal<MyPick<Product, 'code'>, { code: string }>>,
  Expect<Equal<MyPick<Product, 'code' | 'price'>, { code: string; price: number }>>,
]

// @ts-expect-error 없는 키는 거절해야 합니다
type Wrong = MyPick<Product, 'stock'>
```

**사고 과정**

1. 입력: 객체 `T`, 키 유니온 `K`. 출력: 객체.
2. 값 레벨: `for (const key of keys) result[key] = obj[key]`
3. 객체를 만드는 반복 → 매핑된 타입. 반복할 대상은 `T`의 모든 키가 아니라 `K`이므로 `[P in K]`.
4. "없는 키는 거절" → `K extends keyof T` 제약. 이 제약이 있어야 `T[P]`도 쓸 수 있습니다.

3번 레슨 8단계와 같은 답입니다. 첫 곡은 아는 곡으로 시작했습니다.

### 문제 2. Readonly 직접 만들기 (쉬움)

**문제**: 객체 타입의 모든 속성을 읽기 전용으로 만드세요. 결과 객체의 속성에 값을 대입하면 에러가 나야 합니다.

```ts
type MyReadonly<T> = { readonly [K in keyof T]: T[K] }

type Cart = { items: string[]; total: number }

type Cases = [Expect<Equal<MyReadonly<Cart>, { readonly items: string[]; readonly total: number }>>]

declare const cart: MyReadonly<Cart>
// @ts-expect-error 읽기 전용 속성에는 대입할 수 없어야 합니다
cart.total = 0
```

**사고 과정**: 속성마다 `readonly` 도장을 찍는 반복이므로 매핑된 타입에 수정자를 붙입니다. 여기서 `Equal`의 역할이 드러납니다. `readonly`를 빠뜨린 `{ [K in keyof T]: T[K] }`도 `extends`로 비교하면 통과하지만, `Equal`로는 실패합니다. 테스트를 `Equal`로 쓰는 이유입니다.

### 문제 3. 튜플을 객체로 (쉬움)

**문제**: 문자열·숫자로 된 읽기 전용 튜플을 받아, 각 요소를 **키이자 값**으로 하는 객체 타입을 만드세요.

```ts
type TupleToObject<T extends readonly PropertyKey[]> = { [K in T[number]]: K }

const payMethods = ['card', 'cash', 'point'] as const

type Cases = [
  Expect<Equal<TupleToObject<typeof payMethods>, { card: 'card'; cash: 'cash'; point: 'point' }>>,
  Expect<Equal<TupleToObject<readonly [1, 2]>, { 1: 1; 2: 2 }>>,
]

// @ts-expect-error 객체처럼 키가 될 수 없는 요소는 거절해야 합니다
type Wrong = TupleToObject<[[1, 2], {}]>
```

**사고 과정**

1. 입력: `readonly ['card', 'cash', 'point']`. 출력: `{ card: 'card'; ... }`.
2. 값 레벨: `Object.fromEntries(arr.map((v) => [v, v]))`
3. 튜플의 모든 요소를 유니온으로 → `T[number]`(5번 레슨 문제 4). 그 유니온으로 매핑 → `[K in T[number]]: K`.
4. 키가 될 수 있는 것만 받기 → `PropertyKey`(`string | number | symbol`의 내장 별칭) 배열로 제약. `as const` 튜플은 `readonly`라서 제약에도 `readonly`를 붙여야 합니다(실수 2).

### 문제 4. 첫 번째 요소 (쉬움)

**문제**: 배열 타입의 첫 요소 타입을 돌려주세요. 빈 배열이면 `never`입니다.

```ts
type First<T extends readonly unknown[]> = T extends readonly [infer F, ...unknown[]] ? F : never

type Cases = [
  Expect<Equal<First<['주문', '결제']>, '주문'>>,
  Expect<Equal<First<[undefined, 1]>, undefined>>,
  Expect<Equal<First<[]>, never>>,
]
```

**사고 과정**

- 처음 떠오르는 답은 `T[0]`입니다. 그런데 `First<[]>`가 `undefined`가 되어 마지막 테스트에서 실패합니다(빈 튜플의 0번 자리는 `undefined`로 계산됩니다).
- 값 레벨로는 `const [first] = arr`, 즉 구조 분해 → `infer`. "첫 요소가 있는 모양"에 맞을 때만 꺼내고, 아니면 `never`.
- `T extends [] ? never : T[0]`처럼 빈 튜플을 먼저 거르는 풀이도 정답입니다.

### 문제 5. 튜플의 길이 (쉬움)

**문제**: 튜플 타입의 길이를 숫자 리터럴 타입으로 돌려주세요. 튜플이 아닌 것은 거절합니다.

```ts
type Length<T extends readonly unknown[]> = T['length']

const steps = ['주문', '결제', '조리', '픽업'] as const

type Cases = [Expect<Equal<Length<typeof steps>, 4>>, Expect<Equal<Length<[]>, 0>>]

// @ts-expect-error 숫자는 튜플이 아닙니다
type Wrong = Length<5>
```

**사고 과정**: 값 레벨의 `arr.length`를 그대로 인덱스 접근 타입으로 옮깁니다. 튜플의 `length` 속성은 `number`가 아니라 `4` 같은 리터럴 타입이라 가능합니다(5번 레슨에서 계수기로 썼던 성질). 일반 배열 `string[]`이라면 길이가 정해져 있지 않아 `number`가 나옵니다.

### 문제 6. Exclude 직접 만들기 (쉬움)

**문제**: 유니온 `T`에서 `U`에 들어가는 멤버를 뺀 유니온을 만드세요.

```ts
type MyExclude<T, U> = T extends U ? never : T

type Cases = [
  Expect<Equal<MyExclude<'card' | 'cash' | 'point', 'point'>, 'card' | 'cash'>>,
  Expect<Equal<MyExclude<string | number | (() => void), Function>, string | number>>,
]
```

**사고 과정**: 유니온 멤버마다 따로 판단해야 하므로 1번 레슨의 **분배**를 이용합니다. `T`가 홀로 `extends` 왼쪽에 있으니 멤버마다 계산되고, 버릴 멤버는 `never`가 되어 사라집니다. 값 레벨로는 `filter`입니다.

### 문제 7. If (쉬움)

**문제**: `If<C, T, F>`는 `C`가 `true`이면 `T`, `false`이면 `F`입니다. `C`에는 `boolean` 타입만 받습니다.

```ts
type If<C extends boolean, T, F> = C extends true ? T : F

type Cases = [Expect<Equal<If<true, '회원가', '정가'>, '회원가'>>, Expect<Equal<If<false, '회원가', '정가'>, '정가'>>]

// @ts-expect-error boolean이 아닌 조건은 거절합니다
type Wrong = If<null, 'a', 'b'>
```

**사고 과정**: 값 레벨의 `c ? t : f`를 그대로 옮긴 것입니다. 생각해 볼 점 하나: `If<boolean, 'a', 'b'>`는 무엇일까요? `boolean`은 `true | false`라서 분배되어 `'a' | 'b'`가 됩니다.

### 문제 8. 튜플 이어 붙이기 (쉬움)

**문제**: 두 튜플을 이어 붙인 튜플을 만드세요. 값 레벨의 `[...a, ...b]`입니다. 읽기 전용 튜플도 받아야 합니다.

```ts
type Concat<T extends readonly unknown[], U extends readonly unknown[]> = [...T, ...U]

const drinks = ['라떼', '모카'] as const

type Cases = [
  Expect<Equal<Concat<[], []>, []>>,
  Expect<Equal<Concat<['아메리카노'], typeof drinks>, ['아메리카노', '라떼', '모카']>>,
  Expect<Equal<Concat<[1], [2, 3]>, [1, 2, 3]>>,
]
```

**사고 과정**: 타입 레벨에도 **가변 인자 튜플**(variadic tuple, TypeScript 4.0+) 문법 `[...T, ...U]`이 있어 값 레벨과 모양이 똑같습니다. 결과가 `readonly`가 되지 않는 점도 값 레벨의 스프레드와 같습니다.

### 문제 9. Includes (쉬움 — 하지만 함정이 많음)

**문제**: 튜플 `T`에 `U`와 **정확히 같은** 타입의 요소가 있으면 `true`, 없으면 `false`입니다. 값 레벨의 `arr.includes(x)`입니다.

```ts
type Includes<T extends readonly unknown[], U> = T extends [infer F, ...infer Rest]
  ? Equal<F, U> extends true
    ? true
    : Includes<Rest, U>
  : false

type Cases = [
  Expect<Equal<Includes<['card', 'cash'], 'cash'>, true>>,
  Expect<Equal<Includes<['card', 'cash'], 'point'>, false>>,
  Expect<Equal<Includes<[boolean], false>, false>>,
  Expect<Equal<Includes<[{ readonly id: 1 }], { id: 1 }>, false>>,
  Expect<Equal<Includes<[1 | 2], 1>, false>>,
]
```

**사고 과정**

1. 값 레벨로 쓰면 이렇습니다.

```ts
function includes(items: unknown[], target: unknown): boolean {
  if (items.length === 0) return false
  const [first, ...rest] = items
  return first === target ? true : includes(rest, target)
}
console.log(includes(['card', 'cash'], 'cash')) // 출력: true
```

2. 이것을 줄마다 옮깁니다. 구조 분해 → `[infer F, ...infer Rest]`, 재귀 호출 → `Includes<Rest, U>`, 빈 배열 → 거짓 갈래의 `false`.
3. 가장 중요한 것은 `===`를 무엇으로 옮기느냐입니다. `F extends U`로 옮기면 `Includes<[boolean], false>`가 `true`가 됩니다(`boolean`이 분배되거나 `false`가 `boolean`에 들어가는 등 "들어가는가" 비교는 "같은가"가 아닙니다). 그래서 **`Equal`을 비교 연산자로** 씁니다(실수 1).

`T[number] extends U` 같은 한 줄짜리 시도가 모두 실패하는 이유도 같습니다. "들어가는가"와 "같은가"를 구별하는 감각이 이 문제의 핵심입니다.

### 문제 10. Awaited 직접 만들기 (쉬움)

**문제**: `Promise`처럼 `then`을 가진 값(PromiseLike)에 싸인 타입을 꺼내세요. 여러 겹이면 끝까지 꺼냅니다. PromiseLike가 아닌 타입은 거절합니다.

```ts
type MyAwaited<T extends PromiseLike<any>> = T extends PromiseLike<infer V>
  ? V extends PromiseLike<any>
    ? MyAwaited<V>
    : V
  : never

// then 메서드만 가진 객체(thenable). Promise는 아니지만 await할 수 있습니다.
type Thenable = { then: (onfulfilled: (value: number) => any) => any }

type Cases = [
  Expect<Equal<MyAwaited<Promise<string>>, string>>,
  Expect<Equal<MyAwaited<Promise<Promise<{ orderId: number }>>>, { orderId: number }>>,
  Expect<Equal<MyAwaited<Thenable>, number>>,
]

// @ts-expect-error Promise가 아닌 것은 거절합니다
type Wrong = MyAwaited<number>
```

**사고 과정**: 2번 레슨 6단계의 `MyAwaited`에서 두 가지를 바꿨습니다. `Promise` 대신 `PromiseLike`(then 메서드만 있으면 되는 내장 인터페이스)로 모양을 넓혔고, 입력 제약을 걸었습니다. 꺼낸 `V`가 또 PromiseLike이면 재귀로 한 겹 더 벗깁니다(5번 레슨).

### 문제 11. Omit 직접 만들기 (보통)

**문제**: 객체 타입 `T`에서 `K`에 해당하는 속성을 뺀 객체 타입을 만드세요. 내장 `Omit`·`Pick`·`Exclude`는 쓰지 않습니다. 원래 속성의 `readonly`는 유지되어야 합니다.

```ts
type MyOmit<T, K extends keyof T> = { [P in keyof T as P extends K ? never : P]: T[P] }

type Member = { readonly memberId: string; password: string; nickname: string }

type Cases = [
  Expect<Equal<MyOmit<Member, 'password'>, { readonly memberId: string; nickname: string }>>,
  Expect<Equal<MyOmit<Member, 'password' | 'nickname'>, { readonly memberId: string }>>,
]

// @ts-expect-error 없는 키는 거절합니다
type Wrong = MyOmit<Member, 'phone'>
```

**사고 과정**: "반복하면서 일부를 건너뛴다" → 매핑된 타입 + 키 재매핑 `as never`(3번 레슨 10·11단계). `[P in keyof T as ...]`는 동형 매핑이라 `readonly`가 유지됩니다. 반면 `{ [P in Exclude<keyof T, K>]: T[P] }`처럼 키 목록을 먼저 계산해 버리면 첫 테스트의 `readonly`가 사라져 `Equal`에서 실패합니다(3번 레슨 실수 3과 같은 이유).

### 문제 12. Trim (보통)

**문제**: 문자열 리터럴 타입의 앞뒤 공백(스페이스·줄바꿈·탭)을 모두 없애세요. 값 레벨의 `s.trim()`입니다.

```ts
type Space = ' ' | '\n' | '\t'

type Trim<S extends string> = S extends `${Space}${infer Rest}` | `${infer Rest}${Space}` ? Trim<Rest> : S

type Cases = [
  Expect<Equal<Trim<'라떼'>, '라떼'>>,
  Expect<Equal<Trim<'  라떼 '>, '라떼'>>,
  Expect<Equal<Trim<'\n\t 카페 모카 \n'>, '카페 모카'>>,
  Expect<Equal<Trim<''>, ''>>,
]
```

**사고 과정**

1. 값 레벨: "앞이 공백이면 한 글자 떼고 다시, 뒤가 공백이면 한 글자 떼고 다시, 둘 다 아니면 끝."

```ts
function trim(s: string): string {
  if (s.startsWith(' ')) return trim(s.slice(1))
  if (s.endsWith(' ')) return trim(s.slice(0, -1))
  return s
}
console.log(`[${trim('  라떼 ')}]`) // 출력: [라떼]
```

2. "앞이 공백" → `` `${Space}${infer Rest}` ``, "뒤가 공백" → `` `${infer Rest}${Space}` ``(4번 레슨). 두 모양을 유니온으로 묶어 한 번에 검사하고, 맞으면 남은 부분으로 재귀합니다.
3. 가운데 공백(`'카페 모카'`의 띄어쓰기)은 앞뒤가 아니라서 남습니다.

### 문제 13. Replace (보통)

**문제**: 문자열 `S`에서 처음 나오는 `From`을 `To`로 바꾸세요. `From`이 빈 문자열이면 그대로 돌려줍니다. 값 레벨의 `s.replace(from, to)`입니다.

```ts
type Replace<S extends string, From extends string, To extends string> = From extends ''
  ? S
  : S extends `${infer Left}${From}${infer Right}`
    ? `${Left}${To}${Right}`
    : S

type Cases = [
  Expect<Equal<Replace<'ICE 아메리카노', 'ICE', 'HOT'>, 'HOT 아메리카노'>>,
  Expect<Equal<Replace<'라떼 라떼', '라떼', '모카'>, '모카 라떼'>>,
  Expect<Equal<Replace<'라떼', '', '모카'>, '라떼'>>,
  Expect<Equal<Replace<'라떼', '녹차', '모카'>, '라떼'>>,
]
```

**사고 과정**: "From 앞부분 + From + 뒷부분" 모양으로 맞춰 앞뒤를 꺼낸 뒤, 가운데만 `To`로 바꿔 다시 조립합니다. 앞쪽 `infer Left`는 **처음 만나는** `From`에서 멈추므로 첫 번째만 바뀝니다(두 번째 테스트). 빈 문자열을 먼저 거르지 않으면 `` `${Left}${''}${Right}` `` 모양이 아무 문자열에나 맞아 맨 앞에 `To`가 붙어 버립니다. 모두 바꾸는 `ReplaceAll`은 오른쪽 부분으로 재귀하면 됩니다(직접 해 보기 문제 6).

## 자주 하는 실수

### 실수 1: Includes에서 extends로 비교함

```ts
type IncludesWrong<T extends readonly unknown[], U> = T extends [infer F, ...infer Rest]
  ? F extends U
    ? true
    : IncludesWrong<Rest, U>
  : false

type R1 = IncludesWrong<[boolean], false> // 결과: boolean
type R2 = IncludesWrong<['card'], string> // 결과: true
```

**왜 틀렸나**: `F extends U`는 "같은가"가 아니라 "들어가는가"를 묻습니다. `'card'`는 `string`에 들어가므로 `true`가 되고, 홀로 있는 `F`가 유니온(`boolean` = `true | false`)이면 분배까지 일어나 `boolean`이 나옵니다.

**고친 코드**: 비교에 `Equal`을 씁니다(문제 9).

```ts
type Includes<T extends readonly unknown[], U> = T extends [infer F, ...infer Rest]
  ? Equal<F, U> extends true
    ? true
    : Includes<Rest, U>
  : false

type R1 = Includes<[boolean], false> // 결과: false
type R2 = Includes<['card'], string> // 결과: false
```

### 실수 2: 제약에 readonly를 빠뜨려 as const 튜플을 거절함

```ts
type Length<T extends unknown[]> = T['length']

const steps = ['주문', '결제'] as const
type R = Length<typeof steps>
// ❌ Type 'readonly ["주문", "결제"]' does not satisfy the constraint 'unknown[]'. (TS2344)
```

**왜 틀렸나**: `as const` 튜플은 `readonly`입니다. 읽기 전용 배열은 일반 배열 자리에 들어가지 못합니다(`push`가 없으니까요).

**고친 코드**: 제약을 `readonly unknown[]`로 넓힙니다. 일반 배열은 읽기 전용 배열 자리에 들어가므로 두 경우 모두 받습니다.

```ts
type Length<T extends readonly unknown[]> = T['length']

const steps = ['주문', '결제'] as const
type R = Length<typeof steps> // 결과: 2
```

### 실수 3: 분배가 필요한 곳에서 [T]로 감쌈

```ts
type ExcludeWrong<T, U> = [T] extends [U] ? never : T

type R = ExcludeWrong<'card' | 'cash' | 'point', 'point'> // 결과: "card" | "cash" | "point"
```

**왜 틀렸나**: `[T]`로 감싸 분배를 막았기 때문에 유니온 전체를 한 덩어리로 "`'point'`에 들어가는가?"를 물었고, 답이 거짓이라 원본이 그대로 나왔습니다. 1번 레슨의 "분배를 막을 때와 쓸 때"를 반대로 적용한 실수입니다.

**고친 코드**: 멤버마다 판단하려면 `T`를 홀로 둡니다.

```ts
type MyExclude<T, U> = T extends U ? never : T

type R = MyExclude<'card' | 'cash' | 'point', 'point'> // 결과: "card" | "cash"
```

### 실수 4: Trim을 재귀 없이 한 번만 적용함

```ts
type TrimOnce<S extends string> = S extends ` ${infer Rest} ` ? Rest : S

type R1 = TrimOnce<'  라떼  '> // 결과: " 라떼 "
type R2 = TrimOnce<' 라떼'> // 결과: " 라떼"
```

**왜 틀렸나**: 앞뒤 공백을 한 글자씩 **한 번만** 뗐고, 앞뒤가 동시에 공백일 때만 동작합니다. 공백이 몇 개일지 모르는 문제는 "없어질 때까지 반복", 즉 재귀가 필요합니다.

**고친 코드**: 앞과 뒤를 따로 검사하고, 맞으면 남은 부분으로 다시 부릅니다(문제 12).

```ts
type Trim<S extends string> = S extends ` ${infer Rest}` | `${infer Rest} ` ? Trim<Rest> : S

type R1 = Trim<'  라떼  '> // 결과: "라떼"
type R2 = Trim<' 라떼'> // 결과: "라떼"
```

## 직접 해 보기

각 문제의 테스트를 먼저 파일에 붙여 넣고, 빨간 줄이 사라질 때까지 풀어 보세요.

### 문제 1 ⭐ Push

튜플 `T` 끝에 `U`를 더한 튜플을 만드세요. 값 레벨의 `[...arr, item]`입니다.

```ts
// 테스트
// Expect<Equal<Push<[], '주문'>, ['주문']>>
// Expect<Equal<Push<['주문'], '결제'>, ['주문', '결제']>>
```

::: details 정답 보기

```ts
type Push<T extends readonly unknown[], U> = [...T, U]

type Cases = [Expect<Equal<Push<[], '주문'>, ['주문']>>, Expect<Equal<Push<['주문'], '결제'>, ['주문', '결제']>>]
```

문제 8의 `Concat`과 같은 가변 인자 튜플 문법입니다. 앞에 붙이는 `Unshift`는 `[U, ...T]`입니다.
:::

### 문제 2 ⭐ Parameters 직접 만들기

함수 타입의 매개변수 목록을 튜플로 돌려주는 `MyParameters<F>`를 만드세요.

::: details 정답 보기

```ts
type MyParameters<F extends (...args: any[]) => any> = F extends (...args: infer P) => any ? P : never

declare function addToCart(code: string, qty: number): void

type Cases = [
  Expect<Equal<MyParameters<typeof addToCart>, [code: string, qty: number]>>,
  Expect<Equal<MyParameters<() => void>, []>>,
]
```

2번 레슨 5단계 그대로입니다. 매개변수 이름표(`code:`)는 `Equal` 비교에 영향을 주지 않아 `[string, number]`로 써도 통과합니다.
:::

### 문제 3 ⭐⭐ ReturnType 직접 만들기 (보통)

함수 타입의 반환 타입을 돌려주는 `MyReturnType<F>`를 만드세요. 함수 아닌 것을 넣으면 `never`입니다.

::: details 정답 보기

```ts
type MyReturnType<F> = F extends (...args: any[]) => infer R ? R : never

const pickTable = (seats: number) => (seats > 4 ? ('홀' as const) : ('창가' as const))

type Cases = [
  Expect<Equal<MyReturnType<typeof pickTable>, '홀' | '창가'>>,
  Expect<Equal<MyReturnType<() => Promise<number>>, Promise<number>>>,
  Expect<Equal<MyReturnType<string>, never>>,
]
```

매개변수 자리를 `unknown[]`로 막으면 `pickTable`이 모양에 맞지 않아 `never`가 나온다는 점(2번 레슨 실수 3, 7번 레슨 반공변)을 테스트로 직접 확인해 보세요.
:::

### 문제 4 ⭐⭐ Capitalize 직접 만들기 (보통)

내장 `Capitalize`를 쓰지 않고, 문자열의 첫 글자만 대문자로 바꾸는 `MyCapitalize<S>`를 만드세요. 내장 `Uppercase`는 써도 됩니다.

::: details 정답 보기

```ts
type MyCapitalize<S extends string> = S extends `${infer First}${infer Rest}` ? `${Uppercase<First>}${Rest}` : S

type Cases = [
  Expect<Equal<MyCapitalize<'orderCreated'>, 'OrderCreated'>>,
  Expect<Equal<MyCapitalize<'a'>, 'A'>>,
  Expect<Equal<MyCapitalize<''>, ''>>,
]
```

`infer` 두 개가 붙어 있으면 앞의 것이 한 글자만 가져간다는 규칙(2번 레슨 11단계)을 이용했습니다.
:::

### 문제 5 ⭐⭐⭐ DeepReadonly (보통)

객체의 모든 속성을 깊은 곳까지 읽기 전용으로 만드세요. 배열은 읽기 전용 배열이 되고, 함수는 그대로 두어야 합니다.

::: details 정답 보기

```ts
type DeepReadonly<T> = T extends (...args: any[]) => any
  ? T
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T

type Store = { name: string; tags: string[]; receipt: { header: string }; save: () => void }

type Cases = [
  Expect<
    Equal<
      DeepReadonly<Store>,
      {
        readonly name: string
        readonly tags: readonly string[]
        readonly receipt: { readonly header: string }
        readonly save: () => void
      }
    >
  >,
]
```

5번 레슨 5단계의 답입니다. 함수를 먼저 거르지 않으면 `save`가 `{}`로 바뀌어 `Equal`에서 실패합니다.
:::

### 문제 6 ⭐⭐⭐ ReplaceAll (보통)

문제 13의 `Replace`를 고쳐, 처음 하나가 아니라 **모든** `From`을 `To`로 바꾸는 `ReplaceAll`을 만드세요. 바꾼 결과 안에서 새로 생긴 `From`은 다시 바꾸지 않아야 합니다.

::: details 정답 보기

```ts
type ReplaceAll<S extends string, From extends string, To extends string> = From extends ''
  ? S
  : S extends `${infer Left}${From}${infer Right}`
    ? `${Left}${To}${ReplaceAll<Right, From, To>}`
    : S

type Cases = [
  Expect<Equal<ReplaceAll<'라떼 라떼 라떼', '라떼', '모카'>, '모카 모카 모카'>>,
  Expect<Equal<ReplaceAll<'aab', 'ab', 'b'>, 'ab'>>,
]
```

재귀를 결과 전체(`` `${Left}${To}${Right}` ``)가 아니라 **오른쪽 남은 부분**에만 적용한 것이 핵심입니다. 결과 전체에 다시 적용하면 두 번째 테스트에서 `'aab'` → `'ab'` → `'b'`처럼 새로 생긴 `'ab'`까지 바뀌어 버립니다.
:::

## 확인 퀴즈

1. type-challenges에서 "통과"는 무엇으로 판정하나요?
2. 테스트에 `extends` 대신 `Equal`을 쓰는 이유는 무엇인가요?
3. `// @ts-expect-error` 다음 줄에 에러가 나지 않으면 어떻게 되나요?
4. `First<T>`를 `T[0]`으로 풀면 어떤 테스트에서 실패하나요?
5. `Includes`에서 `F extends U`로 비교하면 왜 틀리나요?

::: details 정답 보기

1. 테스트 코드에 컴파일 에러(빨간 줄)가 하나도 남지 않으면 통과입니다.
2. `extends`는 "들어가는가"만 물어서 `readonly` 차이나 리터럴과 넓은 타입의 차이를 놓칩니다. `Equal`은 두 타입이 정확히 같은지 봅니다.
3. "쓰이지 않은 `@ts-expect-error` 지시문"이라는 에러(TS2578)가 납니다. 거절해야 할 입력을 받아 주고 있다는 뜻입니다.
4. 빈 튜플 테스트(`First<[]>`가 `never`여야 함)에서 실패합니다. `T[0]`은 `undefined`를 돌려줍니다.
5. "같은가"가 아니라 "들어가는가"를 물어 `Includes<['card'], string>`이 `true`가 되고, 유니온 요소는 분배까지 일어나기 때문입니다.
:::

## 정리

- type-challenges는 타입 레벨 프로그래밍의 연습곡 모음입니다. 테스트의 빨간 줄을 모두 없애면 통과입니다.
- 테스트는 `Expect<Equal<결과, 기대>>`와 `// @ts-expect-error`로 씁니다. "같은가"는 `extends`가 아니라 `Equal`로 판단합니다.
- 푸는 순서: 입력·출력 정하기 → 값 레벨 코드 떠올리기 → 도구(조건부·`infer`·매핑·템플릿 리터럴·재귀)로 옮기기 → 테스트로 손 전개.
- 반복해서 나온 함정: 분배를 쓸 곳과 막을 곳, 빈 튜플과 `never`, `readonly` 제약, 동형 매핑의 수정자 유지, "같은가"와 "들어가는가"의 차이.
- 이 레슨의 13문제와 연습 6문제를 풀었다면 easy 단계 대부분과 medium 일부를 풀 힘이 생긴 것입니다. 저장소에서 다음 문제를 하루 한두 개씩 이어 가세요.

## 다음 단계

Part 5를 마쳤습니다. [Part 6의 tsconfig.json 완전 정복](../part6-tooling/01-tsconfig)에서는 지금까지 당연하게 써 온 `strict`, `target`, `lib`, `module` 같은 컴파일러 설정을 하나씩 열어 보며, 실제 프로젝트를 처음부터 구성하는 법을 배웁니다.
