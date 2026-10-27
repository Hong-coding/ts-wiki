---
title: Promise 완전 이해
---

# Promise 완전 이해

<LessonMeta level="중급" :minutes="60" prev="동기·비동기의 차이, 콜백, 이벤트 루프와 실행 순서" />

## 이번에 배울 것

- Promise가 무엇인지 진동벨 비유로 설명하고, 세 가지 상태(대기·이행·거부)를 구분할 수 있다.
- `new Promise`와 `resolve`·`reject`로 콜백 기반 함수를 Promise 기반 함수로 바꿀 수 있다.
- `then`·`catch`·`finally`를 체이닝(chaining, 사슬처럼 이어 붙이기)하고, 단계 사이에 값이 어떻게 전달되는지 설명할 수 있다.
- `Promise<T>` 타입을 읽고 쓰며, 잘못된 값을 넣었을 때 나는 타입 오류를 해결할 수 있다.
- `Promise.all`·`allSettled`·`race`·`any`의 차이를 표로 비교하고, 실무 상황에 맞는 것을 고를 수 있다.

## 먼저 알아 둘 것

- 콜백·이벤트 루프·마이크로태스크 큐: [동기 vs 비동기, 콜백과 이벤트 루프](./01-event-loop-callback)
- 제네릭 타입 매개변수 `T`: [제네릭 기초](../part3-intermediate/04-generics-basics)
- 오류 던지기와 잡기: [오류 처리](../part1-basics/11-errors)
- `unknown`과 `instanceof`로 좁히기: [특수 타입](../part2-types/02-special-types), [타입 좁히기](../part2-types/08-narrowing)

## 비유로 이해하기

지난 레슨의 비동기 식당을 다시 떠올려 보겠습니다. 손님이 주문하면 직원은 **진동벨**을 건네고 다음 손님을 받았습니다.

지난 레슨에서는 이 진동벨을 "콜백 함수"로 표현했습니다. 손님이 주문할 때 "음식이 나오면 이 함수를 불러 주세요"라고 **함수를 맡기는** 방식이었습니다. 그런데 이 방식에는 묘한 점이 있습니다. 진동벨이 손님 손에 있지 않고, 주방에 맡겨져 있습니다. 손님은 벨을 들고 다니거나, 친구에게 넘기거나, 벨 두 개를 한꺼번에 기다릴 수 없습니다.

**Promise(프로미스, 약속)** 는 진동벨을 **손님이 손에 쥐는 물건(값)** 으로 바꾼 것입니다.

| 진동벨 | Promise |
|---|---|
| 주문하면 바로 받는 벨 | 비동기 함수를 부르면 **바로** 돌려받는 Promise 객체 |
| 아직 울리지 않은 벨 | **대기(pending)** 상태 |
| "음식 나왔습니다" 하고 울린 벨 | **이행(fulfilled)** 상태 — 결과 값이 들어 있음 |
| "재료가 떨어졌습니다" 하고 울린 벨 | **거부(rejected)** 상태 — 실패 이유가 들어 있음 |
| 벨이 울리면 할 일을 정해 두기 | `then`(성공 시), `catch`(실패 시), `finally`(어느 쪽이든) |
| 벨 여러 개를 한꺼번에 기다리기 | `Promise.all` 등 조합 함수 |

벨은 **한 번 울리면 끝**입니다. "음식 나왔습니다"라고 울린 벨이 나중에 "재료가 떨어졌습니다"로 바뀌지 않습니다. 이 성질 덕분에 Promise는 믿고 쓸 수 있는 값이 됩니다.

## 개념 설명

### 1단계: Promise의 세 가지 상태

Promise는 언제나 셋 중 한 상태에 있습니다.

```text
                 resolve(값)
            ┌──────────────────▶  이행(fulfilled): 값을 가짐
 대기(pending)
            └──────────────────▶  거부(rejected): 이유(보통 Error)를 가짐
                 reject(이유)
```

- **대기(pending)**: 아직 결과가 없습니다. 처음 만들어졌을 때의 상태입니다.
- **이행(fulfilled)**: 작업이 성공해 결과 값이 정해졌습니다.
- **거부(rejected)**: 작업이 실패해 실패 이유가 정해졌습니다.

이행과 거부를 합쳐 **처리됨(settled, 결정됨)** 이라고 부릅니다. 한 번 처리된 Promise의 상태와 값은 **절대 바뀌지 않습니다.**

::: tip 용어 정리
- **resolve(해결하다)**: Promise를 이행 상태로 만드는 함수 이름입니다.
- **reject(거부하다)**: Promise를 거부 상태로 만드는 함수 이름입니다.
- 일상 대화에서는 "Promise가 resolve됐다 = 성공했다", "reject됐다 = 실패했다"라고 많이 말합니다.
:::

### 2단계: new Promise로 직접 만들기

지난 레슨의 `orderCoffee`는 콜백을 받았습니다. 이번에는 콜백 대신 Promise를 **돌려주도록** 바꿉니다.

```ts
function orderCoffee(menu: string): Promise<string> {
  return new Promise((resolve) => {
    console.log(`${menu} 주문 접수`)
    setTimeout(() => {
      resolve(`${menu} 한 잔`) // 1초 뒤 성공: 결과 값을 넣고 벨을 울립니다.
    }, 1000)
  })
}

const bell = orderCoffee('아메리카노') // 벨을 바로 받습니다.
console.log('진동벨을 받고 자리로 갑니다')
console.log(bell)

bell.then((cup) => {
  console.log(`${cup} 나왔습니다`)
  console.log(bell)
})
```

```text
아메리카노 주문 접수
진동벨을 받고 자리로 갑니다
Promise { <pending> }
아메리카노 한 잔 나왔습니다
Promise { '아메리카노 한 잔' }
```

해설:

- `new Promise(함수)`에 넘기는 함수를 **실행 함수(executor, 실행자)** 라고 합니다. 이 함수는 `resolve`와 `reject` 두 함수를 매개변수로 받습니다.
- `orderCoffee`는 커피가 나올 때까지 기다리지 않고 **대기 상태의 Promise를 즉시** 돌려줍니다. 그래서 `console.log(bell)`은 `Promise { <pending> }`을 찍습니다(Node.js의 표시 방식입니다).
- 1초 뒤 `resolve('아메리카노 한 잔')`이 불리면 Promise가 이행 상태가 되고, `then`에 등록한 콜백이 그 값을 받아 실행됩니다.
- 반환 타입 `Promise<string>`은 "나중에 `string` 하나를 주겠다고 약속하는 값"이라는 뜻입니다.

::: info 콜백 방식과 무엇이 다른가요?
콜백 방식: `orderCoffee('아메리카노', (cup) => {...})` — 할 일을 **함수에 맡깁니다.**
Promise 방식: `orderCoffee('아메리카노').then((cup) => {...})` — 결과를 담은 **값을 돌려받습니다.**

값이므로 변수에 담고, 함수에 넘기고, 배열에 모아 한꺼번에 기다릴 수 있습니다. 이것이 Promise의 핵심 장점입니다.
:::

### 3단계: reject로 실패 알리기

지난 레슨의 오류 우선 콜백(`(error, result) => ...`) 예제를 Promise로 바꿔 보겠습니다.

```ts
interface Product {
  code: string
  name: string
  price: number
}

const products: Product[] = [
  { code: 'P001', name: '아메리카노', price: 4500 },
  { code: 'P002', name: '카페라테', price: 5000 },
]

function findProduct(code: string): Promise<Product> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const found = products.find((p) => p.code === code)
      if (!found) {
        reject(new Error(`상품 ${code}를 찾을 수 없습니다`)) // 실패
        return
      }
      resolve(found) // 성공
    }, 300)
  })
}

findProduct('P002')
  .then((product) => console.log('찾음:', product.name))
  .catch((error: unknown) => {
    if (error instanceof Error) console.log('실패:', error.message)
  })

findProduct('P999')
  .then((product) => console.log('찾음:', product.name))
  .catch((error: unknown) => {
    if (error instanceof Error) console.log('실패:', error.message)
  })
```

```text
찾음: 카페라테
실패: 상품 P999를 찾을 수 없습니다
```

콜백 버전과 비교해 보세요.

- 성공 처리(`then`)와 실패 처리(`catch`)가 **나뉘어** 읽기 쉽습니다.
- `then` 안의 `product`는 `Product | undefined`가 아니라 그냥 `Product`입니다. 성공했을 때만 `then`이 불리기 때문에 `product?.name`처럼 조심할 필요가 없습니다.
- `catch`의 `error`는 `unknown`으로 받고 `instanceof Error`로 좁힙니다. `reject`에는 무엇이든 넣을 수 있어서 TypeScript가 실패 이유의 타입을 알 수 없기 때문입니다. (`catch` 콜백의 매개변수 타입을 생략하면 `any`가 됩니다. `unknown`으로 적는 습관을 들이면 안전합니다.)

::: tip reject에는 Error 객체를 넣으세요
`reject('실패')`처럼 문자열을 넣어도 동작하지만, `Error` 객체에는 **오류가 어디서 났는지 보여 주는 스택 추적(stack trace)** 이 담깁니다. 디버깅이 훨씬 쉬워지므로 `reject(new Error('...'))`를 기본으로 씁니다.
:::

### 4단계: 상태는 한 번만 바뀐다, executor는 동기로 실행된다

두 가지 중요한 성질을 실험으로 확인합니다.

```ts
const p = new Promise<string>((resolve, reject) => {
  resolve('첫 번째 결과')
  resolve('두 번째 결과')     // 무시됨
  reject(new Error('실패'))   // 무시됨
})
p.then((v) => console.log(v))
// 출력: 첫 번째 결과
```

처음 불린 `resolve`만 효과가 있고, 그 뒤의 `resolve`·`reject`는 조용히 무시됩니다. 벨은 한 번만 울립니다.

```ts
console.log('1. 시작')
const q = new Promise<void>((resolve) => {
  console.log('2. executor 실행')
  resolve()
  console.log('3. resolve 뒤의 코드도 실행됨')
})
q.then(() => console.log('5. then 콜백'))
console.log('4. 끝')
```

```text
1. 시작
2. executor 실행
3. resolve 뒤의 코드도 실행됨
4. 끝
5. then 콜백
```

- **executor는 `new Promise`를 부르는 그 자리에서 동기로 실행됩니다.** 그래서 2가 4보다 먼저 찍힙니다. (지난 레슨 10단계 표의 마지막 줄이 이것입니다.)
- `resolve()`는 함수를 끝내는 `return`이 아닙니다. 뒤의 코드(3)도 실행됩니다. 실패 후 더 진행하지 않으려면 3단계 예제처럼 `reject(...)` 다음에 `return`을 적습니다.
- 이미 이행된 Promise라도 `then` 콜백은 **마이크로태스크 큐**를 거쳐 실행되므로, 동기 코드(4)가 모두 끝난 뒤에 실행됩니다.

### 5단계: then 체이닝과 값 전달

`then`은 **새 Promise를 돌려줍니다.** 그래서 `.then(...).then(...)`처럼 계속 이어 붙일 수 있습니다. 이때 규칙은 하나입니다.

> **앞 `then` 콜백이 `return`한 값이 다음 `then` 콜백의 매개변수로 들어갑니다.**

```ts
const step1 = Promise.resolve(10)
step1
  .then((n) => {
    console.log('받은 값:', n)
    return n * 2
  })
  .then((n) => {
    console.log('받은 값:', n)
    return `합계 ${n}원`
  })
  .then((text) => {
    console.log('받은 값:', text)
  })
  .then((nothing) => {
    console.log('받은 값:', nothing)
  })
```

```text
받은 값: 10
받은 값: 20
받은 값: 합계 20원
받은 값: undefined
```

- `Promise.resolve(10)`은 "이미 10으로 이행된 Promise"를 바로 만드는 지름길입니다. 실패한 Promise는 `Promise.reject(new Error(...))`로 만듭니다.
- 세 번째 `then`은 아무것도 `return`하지 않았으므로, 네 번째 `then`은 `undefined`를 받습니다. TypeScript는 `nothing`의 타입을 `void`로 추론합니다.

#### then에서 Promise를 돌려주면 "풀어서" 전달된다

`then` 콜백이 **Promise를 돌려주면**, 다음 `then`은 그 Promise가 끝날 때까지 기다렸다가 **안에 든 값**을 받습니다. 이 성질 덕분에 지난 레슨의 콜백 지옥을 평평하게 펼 수 있습니다.

```ts
interface Member { id: string; name: string }
interface Cart { total: number }
interface Payment { approvalNo: string }

function getMember(id: string): Promise<Member> {
  return new Promise((resolve) => setTimeout(() => resolve({ id, name: '김하나' }), 100))
}
function getCart(memberId: string): Promise<Cart> {
  return new Promise((resolve) => setTimeout(() => resolve({ total: 9500 }), 100))
}
function pay(amount: number): Promise<Payment> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (amount <= 0) {
        reject(new Error('결제 금액이 0원 이하입니다'))
        return
      }
      resolve({ approvalNo: 'A-20261023-001' })
    }, 100)
  })
}
function printReceipt(approvalNo: string): Promise<string> {
  return new Promise((resolve) => setTimeout(() => resolve(`영수증 출력 완료(${approvalNo})`), 100))
}

getMember('M001')
  .then((member) => getCart(member.id))            // Promise<Cart>를 돌려줌 → 다음 then은 Cart를 받음
  .then((cart) => pay(cart.total))                 // Promise<Payment> → Payment
  .then((payment) => printReceipt(payment.approvalNo))
  .then((message) => console.log(message))
  .catch((error: unknown) => {
    console.log('주문 처리 실패:', error instanceof Error ? error.message : error)
  })
  .finally(() => {
    console.log('진동벨 회수')
  })
```

```text
영수증 출력 완료(A-20261023-001)
진동벨 회수
```

지난 레슨의 피라미드와 비교해 보세요.

- 들여쓰기가 깊어지지 않고 **위에서 아래로** 읽힙니다.
- 오류 처리는 맨 아래 `catch` **한 곳**에 모였습니다. 어느 단계에서 실패하든 그 뒤의 `then`은 건너뛰고 `catch`로 바로 갑니다.
- 각 단계의 매개변수 타입(`member`, `cart`, `payment`, `message`)을 TypeScript가 모두 추론합니다. 마우스를 올려 확인해 보세요.

### 6단계: catch — 실패를 잡고 다시 이어 가기

체인 중간에서 `reject`되거나 `throw`로 오류가 나면, 그 뒤의 `then`은 건너뛰고 가장 가까운 `catch`가 실행됩니다. 그리고 **`catch`도 새 Promise를 돌려주므로**, `catch`에서 값을 `return`하면 체인은 다시 성공 상태로 이어집니다.

```ts
function pay(amount: number): Promise<string> {
  return amount > 0 ? Promise.resolve('승인') : Promise.reject(new Error('금액 오류'))
}

pay(0)
  .then((r) => {
    console.log('1단계', r) // 건너뜀
    return '2단계 값'
  })
  .catch((error: unknown) => {
    console.log('잡음:', error instanceof Error ? error.message : error)
    return '기본값' // 실패를 복구하고 값을 넘깁니다.
  })
  .then((v) => {
    console.log('계속 진행:', v)
  })
```

```text
잡음: 금액 오류
계속 진행: 기본값
```

이것은 동기 코드의 `try/catch`와 같은 원리입니다. `catch`가 오류를 처리하고 나면, 그 뒤의 코드는 정상적으로 계속됩니다.

::: warning catch에서 다시 실패시키고 싶다면
`catch` 안에서 로그만 찍고 아무것도 돌려주지 않으면, 다음 `then`은 `undefined`를 받고 "성공"으로 진행합니다. 실패를 위로 계속 전달하고 싶다면 `catch` 안에서 다시 `throw error`를 하세요.
:::

### 7단계: finally — 성공이든 실패든 마지막에

`finally`는 결과와 상관없이 **항상** 실행됩니다. 로딩 표시 끄기, 진동벨 회수처럼 "어느 경우든 마무리해야 하는 일"에 씁니다.

```ts
let loading = true
function loadMenu(): Promise<string[]> {
  return new Promise((resolve) => setTimeout(() => resolve(['아메리카노', '라테']), 100))
}

loadMenu()
  .then((menus) => console.log('메뉴', menus.length, '개'))
  .catch(() => console.log('메뉴 불러오기 실패'))
  .finally(() => {
    loading = false
    console.log('로딩 표시 끔:', loading)
  })
```

```text
메뉴 2 개
로딩 표시 끔: false
```

`finally`의 콜백은 **매개변수를 받지 않습니다.** 성공 값도 실패 이유도 모릅니다. 또 `finally`에서 `return`한 값은 무시되고, 앞의 결과가 그대로 다음으로 전달됩니다.

```ts
const x = Promise.resolve(1).finally(() => 99)
x.then((v) => console.log('finally 뒤의 값:', v))
// 출력: finally 뒤의 값: 1
```

| 메서드 | 언제 실행되나 | 콜백이 받는 것 | 콜백의 return 값 |
|---|---|---|---|
| `then(onFulfilled)` | 이행됐을 때 | 결과 값 | 다음 단계로 전달 |
| `catch(onRejected)` | 거부됐을 때 | 실패 이유 | 다음 단계로 전달(실패 복구) |
| `finally(onFinally)` | 처리됐을 때(둘 다) | 없음 | 무시(앞의 결과를 그대로 전달) |

### 8단계: `Promise<T>` 타입 읽고 쓰기

`Promise<T>`는 "이행되면 `T` 타입 값을 주는 Promise"입니다. `T` 자리에 결과 값의 타입을 적습니다.

| 타입 | 뜻 |
|---|---|
| `Promise<string>` | 성공하면 문자열 |
| `Promise<Product[]>` | 성공하면 상품 배열 |
| `Promise<void>` | 성공했다는 사실만 알림(값 없음) |
| `Promise<never>` | 절대 성공하지 않음(항상 실패하는 Promise) |

::: info 실패 이유의 타입은 적지 않습니다
`Promise<T>`에는 성공 값의 타입만 있고, 실패 이유의 타입을 적는 자리는 없습니다. 어떤 코드에서든 예상하지 못한 오류가 `throw`될 수 있기 때문입니다. 그래서 `catch`에서는 항상 `unknown`으로 받고 좁혀서 씁니다.
:::

TypeScript는 `Promise<T>`와 맞지 않는 값을 막아 줍니다.

```ts
const p1 = new Promise<number>((resolve) => {
  resolve('4500')
  // ❌ Argument of type 'string' is not assignable to parameter of type 'number | PromiseLike<number>'. (TS2345)
})

const p2: Promise<number> = Promise.resolve('4500')
// ❌ Type 'Promise<string>' is not assignable to type 'Promise<number>'.
//      Type 'string' is not assignable to type 'number'. (TS2322)

function getPrice(): Promise<number> {
  return Promise.resolve(4500)
}
const price: number = getPrice()
// ❌ Type 'Promise<number>' is not assignable to type 'number'. (TS2322)

getPrice().then((v) => v.toUpperCase())
// ❌ Property 'toUpperCase' does not exist on type 'number'. (TS2339)
```

- `PromiseLike<number>`는 "`then` 메서드를 가진 Promise 비슷한 객체"입니다. `resolve`에는 값뿐 아니라 다른 Promise도 넣을 수 있다는 뜻입니다.
- 세 번째 오류가 특히 중요합니다. **Promise는 값이 아니라 "값이 들어 있을 상자"입니다.** 상자에서 값을 꺼내려면 `then`(또는 다음 레슨의 `await`)을 거쳐야 합니다.

#### new Promise에는 타입 인자를 적으세요

```ts
const p = new Promise((resolve) => resolve(4500))
p.then((v) => v + 1)
// ❌ 'v' is of type 'unknown'. (TS18046)
```

`new Promise(...)`만 쓰면 TypeScript는 `resolve`에 무엇이 들어갈지 추론하지 못해 `Promise<unknown>`으로 정합니다. 다음 둘 중 하나로 타입을 알려 주세요.

```ts
// 방법 1: 타입 인자를 직접 적기
const p = new Promise<number>((resolve) => resolve(4500))

// 방법 2: 함수 반환 타입을 적기(가장 흔한 방법) — 반환 타입에서 거꾸로 추론됩니다.
function getPrice(): Promise<number> {
  return new Promise((resolve) => resolve(4500))
}
```

값 없이 성공만 알릴 때는 `Promise<void>`로 적어야 `resolve()`를 인자 없이 부를 수 있습니다.

```ts
const q = new Promise<string>((resolve) => resolve())
// ❌ Expected 1 arguments, but got 0. Did you forget to include 'void' in your type argument to 'Promise'? (TS2794)

const ok = new Promise<void>((resolve) => resolve()) // ✅
```

### 9단계: 여러 Promise를 한꺼번에 다루기

Promise가 "값"이라서 생기는 가장 큰 이점이 여기 있습니다. 여러 Promise를 배열에 모아 조합 함수(combinator)에 넘기면, 콜백으로는 복잡했던 흐름을 한 줄로 쓸 수 있습니다.

예제에서 쓸 도우미 함수 두 개를 먼저 만듭니다.

```ts
// ms 밀리초 뒤에 value로 성공하는 Promise를 만드는 도우미
function delay<T>(ms: number, value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}
// ms 밀리초 뒤에 실패하는 Promise를 만드는 도우미
function failAfter(ms: number, message: string): Promise<never> {
  return new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms))
}
```

`_`는 "쓰지 않는 매개변수"라는 관례적 이름입니다. `resolve`를 쓰지 않지만 `reject`가 두 번째 자리라서 첫 자리를 채운 것입니다.

#### Promise.all — 모두 성공해야 성공

```ts
const start = Date.now()
const elapsed = () => `${Math.round((Date.now() - start) / 100) * 100}ms`

Promise.all([
  delay(300, ['아메리카노', '라테', '모카']), // 메뉴 불러오기
  delay(100, 42),                             // 재고 불러오기
  delay(200, { storeName: '강남점' }),        // 매장 정보 불러오기
]).then(([menus, stock, store]) => {
  console.log(`[all] ${elapsed()} 준비 완료: ${store.storeName}, 메뉴 ${menus.length}개, 재고 ${stock}개`)
})
```

```text
[all] 300ms 준비 완료: 강남점, 메뉴 3개, 재고 42개
```

- 세 작업이 **동시에** 시작되므로 전체 시간은 300 + 100 + 200 = 600ms가 아니라 **가장 오래 걸린 300ms**입니다.
- 결과 배열의 순서는 **끝난 순서가 아니라 넣은 순서**입니다. 그래서 구조 분해로 `[menus, stock, store]`를 받을 수 있습니다.
- TypeScript는 결과 타입을 튜플 `[string[], number, { storeName: string }]`로 정확히 추론합니다.

하나라도 실패하면 **즉시** 전체가 실패합니다(빠른 실패, fail-fast).

```ts
Promise.all([delay(300, '메뉴'), failAfter(100, '재고 서버 오류'), delay(200, '매장')])
  .then((results) => console.log('[all] 성공', results))
  .catch((error: unknown) => {
    console.log(`[all] ${elapsed()} 실패:`, error instanceof Error ? error.message : error)
  })
```

```text
[all] 100ms 실패: 재고 서버 오류
```

100ms에 실패가 나자마자 `catch`로 갑니다. 나머지 작업의 결과는 버려집니다. (작업 자체가 취소되는 것은 아닙니다. 타이머나 네트워크 요청은 끝까지 진행되고, 결과만 쓰이지 않습니다.)

#### Promise.allSettled — 모두 끝날 때까지 기다리고, 각각의 결과를 받기

여러 매장에 매출을 전송할 때 한 매장이 실패했다고 다른 매장의 결과까지 버리면 곤란합니다. `allSettled`는 **실패가 있어도 모두 끝날 때까지** 기다리고, 각각의 성공·실패를 알려 줍니다. (ES2020, TypeScript `lib`에 `es2020` 이상 필요)

```ts
const stores = ['강남점', '홍대점', '부산점']
// 매장별 매출 전송: 홍대점만 실패한다고 가정
const uploads = stores.map((store) =>
  store === '홍대점' ? failAfter(100, `${store} 전송 실패`) : delay(100, `${store} 전송 완료`),
)

Promise.allSettled(uploads).then((results) => {
  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      console.log(`${stores[i]}: 성공 - ${result.value}`)
    } else {
      console.log(`${stores[i]}: 실패 - ${result.reason instanceof Error ? result.reason.message : result.reason}`)
    }
  })
  const failed = results.filter((r) => r.status === 'rejected').length
  console.log(`총 ${results.length}건 중 ${failed}건 실패`)
})
```

```text
강남점: 성공 - 강남점 전송 완료
홍대점: 실패 - 홍대점 전송 실패
부산점: 성공 - 부산점 전송 완료
총 3건 중 1건 실패
```

결과의 각 항목은 `{ status: 'fulfilled', value }` 또는 `{ status: 'rejected', reason }` 모양입니다. [판별 유니온](../part3-intermediate/03-discriminated-union) 그대로라서 `result.status`로 좁히면 `value`나 `reason`에 안전하게 접근할 수 있습니다. 또 `allSettled` 자체는 **절대 거부되지 않습니다.**

#### Promise.race — 가장 먼저 끝난 하나를 따르기

```ts
Promise.race([delay(3000, '카드 승인'), failAfter(1000, '시간 초과(1초)')])
  .then((result) => console.log('[race] 성공:', result))
  .catch((error: unknown) => console.log('[race] 실패:', error instanceof Error ? error.message : error))
// 출력(1초 뒤): [race] 실패: 시간 초과(1초)
```

`race`(경주)는 성공이든 실패든 **가장 먼저 처리된** Promise의 결과를 그대로 따릅니다. "카드 승인이 1초 안에 안 오면 실패로 처리"처럼 **타임아웃**을 만들 때 씁니다(문제 5에서 직접 만듭니다).

#### Promise.any — 가장 먼저 성공한 하나를 따르기

```ts
// 실패는 건너뛰고, 처음으로 성공한 결과를 받습니다.
Promise.any([failAfter(100, '1번 서버 고장'), delay(300, '2번 서버 응답'), delay(500, '3번 서버 응답')])
  .then((result) => console.log('[any] 성공:', result))
// 출력: [any] 성공: 2번 서버 응답

// 전부 실패하면 AggregateError(여러 오류를 묶은 오류)로 실패합니다.
Promise.any([failAfter(100, '1번 고장'), failAfter(200, '2번 고장')])
  .catch((error: unknown) => {
    if (error instanceof AggregateError) {
      console.log('[any] 모두 실패:', error.errors.map((e: Error) => e.message).join(', '))
    }
  })
// 출력: [any] 모두 실패: 1번 고장, 2번 고장
```

`any`는 ES2021 기능이라 TypeScript `lib`에 `es2021` 이상이 필요합니다. 여러 서버 중 아무 곳에서나 응답을 받으면 되는 경우에 씁니다.

#### 네 가지 비교

| 함수 | 성공 조건 | 실패 조건 | 결과 | 실무 상황 |
|---|---|---|---|---|
| `Promise.all` | 모두 성공 | 하나라도 실패하면 즉시 | 값 배열(넣은 순서) | 화면에 필요한 데이터 여러 개를 동시에 불러오기(메뉴·재고·매장 정보) |
| `Promise.allSettled` | 항상(모두 끝나면) | 없음 | `{ status, value \| reason }` 배열 | 여러 매장에 일괄 전송하고 성공·실패 건수 보고 |
| `Promise.race` | 가장 먼저 끝난 것이 성공 | 가장 먼저 끝난 것이 실패 | 그 하나의 값 | 타임아웃 걸기 |
| `Promise.any` | 하나라도 성공 | 모두 실패 | 처음 성공한 값 | 여러 서버(미러) 중 빠른 곳 응답 받기 |

::: tip 고르는 요령
- "다 있어야 다음으로 간다" → `all`
- "하나 실패해도 나머지는 살린다" → `allSettled`
- "제한 시간 안에 끝나야 한다" → `race`
- "아무거나 하나만 성공하면 된다" → `any`
:::

### 10단계: 실행 순서 예제

지난 레슨의 이벤트 루프 규칙을 Promise에 적용해 봅니다. 먼저 스스로 출력 순서를 적어 본 뒤 정답을 보세요.

```ts
console.log('A. 영업 시작')

setTimeout(() => console.log('H. 타이머'), 0)

const order = new Promise<string>((resolve) => {
  console.log('B. 주문서 작성(executor는 동기)')
  resolve('아메리카노')
  console.log('C. resolve 뒤 코드')
})

order
  .then((menu) => {
    console.log(`E. ${menu} 제조`)
    return `${menu} 완성`
  })
  .then((result) => console.log(`G. ${result}`))

Promise.resolve('포인트').then((v) => console.log(`F. ${v} 적립`))

console.log('D. 다음 손님')
```

```text
A. 영업 시작
B. 주문서 작성(executor는 동기)
C. resolve 뒤 코드
D. 다음 손님
E. 아메리카노 제조
F. 포인트 적립
G. 아메리카노 완성
H. 타이머
```

| 단계 | 하는 일 | 마이크로태스크 큐 | 태스크 큐 | 출력 |
|---|---|---|---|---|
| 1 | `console.log('A...')` | | | A |
| 2 | `setTimeout` 등록 | | 타이머H | |
| 3 | `new Promise` — executor 즉시 실행, `resolve` | | 타이머H | B, C |
| 4 | 첫 `then` 등록(이미 이행 상태라 바로 큐로) | E | 타이머H | |
| 5 | 두 번째 `then`은 E가 끝나야 큐에 들어감 | E | 타이머H | |
| 6 | `Promise.resolve('포인트').then` 등록 | E, F | 타이머H | |
| 7 | `console.log('D...')` → 동기 코드 끝 | E, F | 타이머H | D |
| 8 | E 실행 → 돌려준 값으로 G가 큐에 들어감 | F, G | 타이머H | E |
| 9 | F 실행 | G | 타이머H | F |
| 10 | G 실행 → 마이크로태스크 큐 비었음 | | 타이머H | G |
| 11 | 태스크 하나: 타이머H | | | H |

핵심: executor(B, C)는 동기, `then`은 마이크로태스크, `setTimeout`은 태스크입니다. 그리고 체인의 다음 `then`(G)은 앞 `then`(E)이 끝나야 줄을 섭니다.

::: info then에서 Promise를 돌려주면 한 박자 더 늦어집니다
`then` 콜백이 값 대신 **Promise를 돌려주면**, 그 Promise를 풀어내는 데 마이크로태스크가 추가로 몇 번 더 필요합니다. 그래서 다른 체인과 섞이면 순서가 생각보다 뒤로 밀릴 수 있습니다. 실무 코드는 이런 미세한 순서에 기대지 않도록 짜는 것이 원칙이므로, "Promise끼리의 정확한 순서에 의존하는 코드는 만들지 않는다"고 기억해 두면 충분합니다.
:::

## 자주 하는 실수

### 실수 1: then 안에서 return을 빠뜨린다

```ts
function getCart(): Promise<{ total: number }> {
  return Promise.resolve({ total: 9500 })
}
function pay(amount: number): Promise<string> {
  return new Promise((resolve) => setTimeout(() => resolve(`${amount}원 승인`), 100))
}

getCart()
  .then((cart) => {
    pay(cart.total) // return이 없음!
  })
  .then((result) => {
    console.log('결제 결과:', result)
  })
// 출력: 결제 결과: undefined
```

**왜 틀렸나:** 중괄호 `{ }`가 있는 화살표 함수는 `return`을 적어야 값을 돌려줍니다. `return`이 없으니 다음 `then`은 결제를 기다리지 않고 `undefined`를 받습니다. 게다가 `pay`가 실패해도 아래 `catch`로 전달되지 않아 오류가 사라집니다. 마우스를 올려 보면 `result`의 타입이 `void`로 나와 실수를 눈치챌 수 있습니다.

```ts
// 고친 코드: return을 적거나, 중괄호 없는 화살표 함수로 씁니다.
getCart()
  .then((cart) => pay(cart.total))
  .then((result) => {
    console.log('결제 결과:', result)
  })
// 출력: 결제 결과: 9500원 승인
```

### 실수 2: catch를 붙이지 않는다

```ts
function pay(amount: number): Promise<string> {
  return amount > 0 ? Promise.resolve('승인') : Promise.reject(new Error('결제 금액 오류'))
}
pay(0).then((r) => console.log(r))
console.log('다음 줄')
```

```text
다음 줄
(오류 위치 표시)
Error: 결제 금액 오류
    at pay (...)
Node.js v24.13.1
```

**왜 틀렸나:** 거부된 Promise를 아무도 처리하지 않으면 **처리되지 않은 거부(unhandled rejection)** 가 됩니다. Node.js 15부터는 이때 프로그램이 **종료**됩니다. 브라우저에서는 콘솔에 `Uncaught (in promise)` 오류가 찍힙니다.

```ts
// 고친 코드: 체인의 끝에는 항상 catch를 붙입니다.
pay(0)
  .then((r) => console.log(r))
  .catch((error: unknown) => console.log('결제 실패:', error instanceof Error ? error.message : error))
// 출력: 결제 실패: 결제 금액 오류
```

### 실수 3: then 안에 then을 중첩한다

```ts
// 콜백 지옥이 Promise로 옮겨 왔을 뿐입니다.
getMember('M001').then((member) => {
  getCart(member.id).then((cart) => {
    pay(cart.total).then((payment) => {
      console.log(payment.approvalNo)
    })
  })
})
```

**왜 틀렸나:** 안쪽 Promise를 `return`하지 않아 바깥 체인과 끊어졌습니다. 맨 바깥에 `catch`를 붙여도 안쪽 실패를 잡지 못합니다.

```ts
// 고친 코드: 돌려주고, 평평하게 잇습니다.
getMember('M001')
  .then((member) => getCart(member.id))
  .then((cart) => pay(cart.total))
  .then((payment) => console.log(payment.approvalNo))
  .catch((error: unknown) => console.log('실패', error))
```

앞 단계의 값(`member`)과 뒤 단계의 값(`payment`)을 **함께** 써야 해서 중첩이 필요해 보일 때가 있습니다. 이 문제는 다음 레슨의 `async`/`await`가 가장 깔끔하게 해결합니다.

### 실수 4: 이미 Promise인 것을 new Promise로 다시 감싼다

```ts
// 불필요하게 감쌈 — 실패를 전달하는 것을 잊기도 쉽습니다.
function getProductName(code: string): Promise<string> {
  return new Promise((resolve) => {
    findProduct(code).then((p) => resolve(p.name))
    // findProduct가 실패하면? reject를 부르지 않아 이 Promise는 영원히 대기 상태!
  })
}
```

**왜 틀렸나:** `findProduct`가 이미 Promise를 돌려주는데 또 감싸면서 실패 경로를 빠뜨렸습니다. 영원히 울리지 않는 진동벨이 됩니다. 이런 코드를 "Promise 생성자 안티패턴(anti-pattern, 흔하지만 피해야 할 방식)"이라고 부릅니다.

```ts
// 고친 코드: then이 돌려주는 Promise를 그대로 돌려줍니다. 실패도 자동으로 전달됩니다.
function getProductName(code: string): Promise<string> {
  return findProduct(code).then((p) => p.name)
}
```

`new Promise`는 `setTimeout`처럼 **콜백 방식의 기능을 Promise로 바꿀 때만** 씁니다.

### 실수 5: then의 두 번째 인자로 오류를 잡으려 한다

`then`은 두 번째 인자로 실패 처리 함수를 받을 수 있습니다. 하지만 이 함수는 **같은 `then`의 첫 번째 콜백에서 난 오류는 잡지 못합니다.**

```ts
function pay(): Promise<string> { return Promise.resolve('승인') }

pay().then(
  (r) => { throw new Error(`영수증 출력 실패(${r})`) },
  (error) => console.log('여기서는 못 잡습니다', error), // 실행되지 않음
).catch((error: unknown) => console.log('catch가 잡음:', error instanceof Error ? error.message : error))
// 출력: catch가 잡음: 영수증 출력 실패(승인)
```

**고친 방법:** 실패 처리는 두 번째 인자 대신 체인 끝의 `.catch()`로 통일합니다. 그래야 앞의 모든 단계에서 난 오류를 한 곳에서 잡습니다.

## 직접 해 보기

### 문제 1 ⭐ 기다리기 함수 만들기

`ms` 밀리초 뒤에 이행되는 `wait(ms: number): Promise<void>` 함수를 만들고, "결제 요청"을 찍은 1초 뒤 "1초 뒤: 승인 완료"를 찍어 보세요.

::: details 정답 보기
```ts
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

console.log('결제 요청')
wait(1000).then(() => console.log('1초 뒤: 승인 완료'))
```
```text
결제 요청
1초 뒤: 승인 완료
```
`setTimeout(resolve, ms)`처럼 `resolve` 함수 자체를 콜백으로 넘겨도 됩니다. 이 `wait`는 실무에서 재시도 간격을 둘 때 자주 씁니다.
:::

### 문제 2 ⭐ 값이 어떻게 흘러가나

아래 코드의 출력을 예상해 보세요.

```ts
Promise.resolve(3)
  .then((qty) => qty * 1500)
  .then((amount) => {
    if (amount > 4000) {
      throw new Error(`한도 초과: ${amount}원`)
    }
    return amount
  })
  .then((amount) => console.log('결제:', amount))
  .catch((error: unknown) => {
    console.log('오류:', error instanceof Error ? error.message : error)
    return 0
  })
  .then((v) => console.log('최종 값:', v))
```

::: details 정답 보기
```text
오류: 한도 초과: 4500원
최종 값: 0
```
3 × 1500 = 4500이 4000을 넘어 `throw`됩니다. `'결제:'`를 찍는 `then`은 건너뛰고 `catch`로 갑니다. `catch`가 `0`을 돌려주었으므로 체인은 다시 성공 상태가 되어 마지막 `then`이 `0`을 받습니다.
:::

### 문제 3 ⭐⭐ 콜백 함수를 Promise로 바꾸기

지난 레슨의 `orderCoffee(menu, done)`처럼 콜백을 받던 아래 함수를, Promise를 돌려주는 `findProductAsync(code: string): Promise<Product>`로 바꾸세요. 상품이 없으면 `Error`로 거부합니다.

```ts
type Callback<T> = (error: Error | null, result?: T) => void

function findProduct(code: string, callback: Callback<Product>): void {
  setTimeout(() => {
    const found = products.find((p) => p.code === code)
    if (!found) {
      callback(new Error(`상품 ${code}를 찾을 수 없습니다`))
      return
    }
    callback(null, found)
  }, 300)
}
```

::: details 정답 보기
방법 1: 처음부터 Promise로 다시 쓰기 — 3단계의 `findProduct`와 같습니다.

방법 2: 기존 콜백 함수를 **감싸기**(코드를 고칠 수 없는 라이브러리일 때)

```ts
function findProductAsync(code: string): Promise<Product> {
  return new Promise((resolve, reject) => {
    findProduct(code, (error, result) => {
      if (error || !result) {
        reject(error ?? new Error('결과가 없습니다'))
        return
      }
      resolve(result)
    })
  })
}

findProductAsync('P001')
  .then((p) => console.log(p.name))
  .catch((e: unknown) => console.log(e instanceof Error ? e.message : e))
// 출력: 아메리카노
```
콜백 방식을 Promise로 바꾸는 것을 "프로미스화(promisify)"라고 합니다. Node.js에는 이 일을 대신하는 `util.promisify`도 있습니다.
:::

### 문제 4 ⭐⭐ 지난 레슨 문제 6을 Promise.all로

지난 레슨에서는 상태 변수 두 개로 "두 작업이 모두 끝나면 알리기"를 만들었습니다. 이번에는 두 함수가 Promise를 돌려준다고 할 때 `Promise.all`로 다시 풀어 보세요.

```ts
function loadMenu(): Promise<string[]> {
  return new Promise((resolve) => setTimeout(() => resolve(['아메리카노', '라테', '모카']), 300))
}
function loadStock(): Promise<number> {
  return new Promise((resolve) => setTimeout(() => resolve(42), 100))
}
```

::: details 정답 보기
```ts
Promise.all([loadMenu(), loadStock()]).then(([menus, stock]) => {
  console.log(`준비 완료: 메뉴 ${menus.length}개, 재고 ${stock}개`)
})
// 출력: 준비 완료: 메뉴 3개, 재고 42개
```
상태 변수와 `tryFinish` 함수가 모두 사라졌습니다. `menus`는 `string[]`, `stock`은 `number`로 정확히 추론됩니다.
:::

### 문제 5 ⭐⭐⭐ 타임아웃 함수 만들기

어떤 Promise든 받아서 `ms` 안에 끝나지 않으면 `Error`로 거부하는 제네릭 함수 `withTimeout<T>(promise: Promise<T>, ms: number): Promise<T>`를 만드세요. 아래 `approveCard`로 시험합니다.

```ts
function approveCard(ms: number): Promise<string> {
  return new Promise((resolve) => setTimeout(() => resolve('승인번호 12345678'), ms))
}
// withTimeout(approveCard(200), 1000)  → 성공: 승인번호 12345678
// withTimeout(approveCard(2000), 1000) → 실패: 1000ms 안에 응답이 없습니다
```

::: details 정답 보기
```ts
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`${ms}ms 안에 응답이 없습니다`)), ms)
  })
  return Promise.race([promise, timeout])
}

withTimeout(approveCard(200), 1000)
  .then((r) => console.log('성공:', r))
  .catch((e: unknown) => console.log('실패:', e instanceof Error ? e.message : e))

withTimeout(approveCard(2000), 1000)
  .then((r) => console.log('성공:', r))
  .catch((e: unknown) => console.log('실패:', e instanceof Error ? e.message : e))
```
```text
성공: 승인번호 12345678
실패: 1000ms 안에 응답이 없습니다
```
- 타임아웃용 Promise는 절대 성공하지 않으므로 `Promise<never>`입니다. `never`는 어떤 타입과 합쳐도 사라지므로 `race`의 결과는 `Promise<T>`가 됩니다.
- 더 다듬는다면: 원래 작업이 먼저 끝났을 때 `clearTimeout`으로 타이머를 지워야 프로그램이 불필요하게 1초를 더 기다리지 않습니다. 또 `race`는 늦은 작업을 **취소하지는 않습니다.** 네트워크 요청을 진짜로 취소하는 법은 [fetch 레슨](./04-fetch-api)의 `AbortController`에서 배웁니다.
:::

### 문제 6 ⭐⭐⭐ 실행 순서

```ts
console.log('1')
setTimeout(() => console.log('2'), 0)
new Promise<void>((resolve) => {
  console.log('3')
  resolve()
}).then(() => {
  console.log('4')
  setTimeout(() => console.log('5'), 0)
}).then(() => console.log('6'))
Promise.reject(new Error('x')).catch(() => console.log('7'))
console.log('8')
```

::: details 정답 보기
```text
1
3
8
4
7
6
2
5
```
- 동기: 1, 3(executor), 8
- 마이크로태스크 큐: 처음에 4와 7이 들어 있습니다. 4를 실행하면 타이머5가 태스크 큐로, 6이 마이크로태스크 큐로 갑니다. 이어서 7, 6.
- 태스크 큐: 먼저 등록된 2, 그다음 5.
:::

## 확인 퀴즈

1. Promise의 세 가지 상태는 무엇입니까? 한 번 이행된 Promise가 거부 상태로 바뀔 수 있습니까?
2. `new Promise`에 넘긴 executor 함수는 동기로 실행됩니까, 비동기로 실행됩니까?
3. `then` 콜백이 `return`한 값은 어디로 갑니까? Promise를 `return`하면요?
4. `Promise.all`에 넣은 세 작업이 각각 100ms, 200ms, 300ms 걸리면 전체는 약 몇 ms 걸립니까? 200ms짜리가 실패하면요?
5. 하나가 실패해도 나머지 결과를 모두 받고 싶을 때 쓰는 조합 함수는 무엇입니까?

::: details 정답 보기
1. 대기(pending)·이행(fulfilled)·거부(rejected)입니다. 한 번 처리된 Promise는 다시 바뀌지 않습니다.
2. 동기입니다. `new Promise`를 부르는 그 자리에서 즉시 실행됩니다.
3. 다음 `then` 콜백의 매개변수로 갑니다. Promise를 돌려주면 그것이 끝날 때까지 기다렸다가 안의 값을 넘깁니다.
4. 동시에 실행되므로 약 300ms입니다. 200ms짜리가 실패하면 약 200ms에 즉시 실패합니다.
5. `Promise.allSettled`입니다.
:::

## 정리

- Promise는 "나중에 올 값"을 담는 상자, 손님이 손에 쥐는 진동벨입니다. 비동기 함수는 Promise를 **즉시** 돌려줍니다.
- 상태는 대기 → 이행 또는 거부로 **한 번만** 바뀝니다. `new Promise((resolve, reject) => ...)`의 executor는 동기로 실행됩니다.
- `then`은 새 Promise를 돌려주므로 체이닝할 수 있고, `return`한 값(또는 Promise가 풀린 값)이 다음 단계로 전달됩니다.
- 오류는 체인 끝의 `catch` 한 곳에서 잡고, 마무리는 `finally`로 합니다. `catch`가 없으면 처리되지 않은 거부가 됩니다.
- `Promise<T>`의 `T`는 성공 값의 타입입니다. 실패 이유는 `unknown`으로 받아 좁힙니다.
- 여러 Promise는 `all`(모두 성공), `allSettled`(모두 결과), `race`(가장 빨리 끝난 것), `any`(가장 빨리 성공한 것)로 조합합니다.

## 다음 단계

[async/await와 비동기 오류 처리](./03-async-await) — `then` 체인을 동기 코드처럼 위에서 아래로 읽히게 바꾸는 문법입니다. 순차 실행과 병렬 실행의 시간 차이, `try/catch`로 비동기 오류를 잡는 법을 배웁니다.
