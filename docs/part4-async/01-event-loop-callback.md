---
title: 동기 vs 비동기, 콜백과 이벤트 루프
---

# 동기 vs 비동기, 콜백과 이벤트 루프

<LessonMeta level="중급" :minutes="50" prev="모듈(import/export)로 코드를 파일 단위로 나누는 법" />

## 이번에 배울 것

- 동기(synchronous)와 비동기(asynchronous)의 차이를 식당 주문 비유로 설명할 수 있다.
- 콜 스택·태스크 큐·마이크로태스크 큐가 각각 무엇을 하는지 말할 수 있다.
- `setTimeout`, `Promise.then`, `console.log`가 섞인 코드의 출력 순서를 표로 추적해 맞힐 수 있다.
- 콜백 함수에 타입을 붙이고, 콜백 지옥이 왜 생기는지 설명할 수 있다.
- "자바스크립트는 한 번에 한 가지 일만 한다"는 말의 뜻과, 그런데도 기다리는 일을 여러 개 처리할 수 있는 이유를 설명할 수 있다.

## 먼저 알아 둘 것

- 함수를 선언하고 다른 함수에 넘기는 법: [함수 기초](../part1-basics/06-functions)
- 함수 타입 표기: [함수 타입](../part2-types/05-function-types)
- 클로저(함수가 바깥 변수를 기억하는 성질): [스코프와 클로저](../part1-basics/10-scope-closure)
- 오류 처리 기본: [오류 처리](../part1-basics/11-errors)
- 제네릭 타입 매개변수 `T`: [제네릭 기초](../part3-intermediate/04-generics-basics)

이번 파트(Part 4)부터는 "시간"이 코드에 들어옵니다. 지금까지 쓴 코드는 위에서 아래로 한 줄씩 실행되고 끝났습니다. 이제는 "1초 뒤에", "서버가 응답하면", "사용자가 버튼을 누르면"처럼 **나중에** 일어나는 일을 다룹니다.

## 비유로 이해하기

### 동기 식당: 음식이 나올 때까지 계산대가 멈춘다

직원이 한 명뿐인 식당을 떠올려 보겠습니다. 이 직원은 손님 A의 주문을 받으면 **주방에 들어가 음식을 직접 만들고, 음식을 건넨 다음에야** 손님 B의 주문을 받습니다. 음식 하나에 10분이 걸리면 B는 10분 동안 줄에 서서 아무것도 못 합니다.

이것이 **동기(synchronous)** 방식입니다. "앞의 일이 끝나야 다음 일을 시작한다"는 뜻입니다.

### 비동기 식당: 진동벨을 주고 다음 손님을 받는다

이번에는 직원이 주문을 받으면 주방에 주문서를 넘기고, 손님에게 **진동벨**을 줍니다. 그리고 곧바로 다음 손님의 주문을 받습니다. 음식이 완성되면 주방이 벨을 울리고, 직원은 지금 하던 응대를 마친 뒤 음식을 건넵니다.

이것이 **비동기(asynchronous)** 방식입니다. "오래 걸리는 일은 맡겨 두고, 끝나면 알려 달라고 한 뒤 다음 일을 한다"는 뜻입니다.

| 식당 | JavaScript |
|---|---|
| 직원 한 명 | 자바스크립트 실행 스레드(thread, 일을 처리하는 일꾼) 하나 |
| 지금 응대 중인 손님 | 콜 스택(call stack)에서 실행 중인 함수 |
| 주방 | 브라우저·Node.js가 제공하는 기능(타이머, 네트워크, 파일 읽기) |
| 진동벨 | 콜백(callback) 함수 — "끝나면 이걸 실행해 줘" |
| 벨이 울린 손님들의 줄 | 태스크 큐(task queue) |
| "잠깐만요, 이것만 먼저" 하고 끼어드는 급한 요청들의 줄 | 마이크로태스크 큐(microtask queue) |
| 손님 응대가 끝날 때마다 줄을 확인하는 직원의 습관 | 이벤트 루프(event loop) |

핵심은 **직원은 여전히 한 명**이라는 점입니다. 동시에 두 손님을 응대하지는 못합니다. 대신 "기다리는 일"을 주방에 맡기기 때문에 전체적으로 많은 손님을 처리합니다.

## 개념 설명

### 1단계: 동기 코드는 위에서 아래로 실행된다

```ts
console.log('1. 매장 문을 엽니다')
console.log('2. 포스 기기를 켭니다')
console.log('3. 첫 손님을 맞습니다')
```

```text
1. 매장 문을 엽니다
2. 포스 기기를 켭니다
3. 첫 손님을 맞습니다
```

지금까지 본 모든 코드가 이 방식이었습니다. 한 줄이 끝나야 다음 줄로 넘어갑니다. 예측하기 쉽다는 큰 장점이 있습니다.

### 2단계: 동기 방식의 문제 — 기다리는 동안 모든 것이 멈춘다

아래 코드는 일부러 0.5초 동안 아무것도 안 하고 시간만 보내는 함수입니다. 실제로는 이런 코드를 쓰면 안 되지만, "동기적으로 오래 걸리는 일"을 흉내 내기 위해 만들었습니다.

```ts
// 동기 방식으로 시간을 잡아먹는 함수: 이 동안 다른 일은 전혀 못 합니다.
function blockFor(ms: number): void {
  const end = Date.now() + ms
  while (Date.now() < end) {
    // 아무것도 하지 않고 시간만 보냅니다.
  }
}

const start = Date.now()
setTimeout(() => {
  console.log(`타이머 실행: ${Date.now() - start}ms 지남`)
}, 100)

blockFor(500)
console.log('무거운 작업 끝')
```

```text
무거운 작업 끝
타이머 실행: 509ms 지남
```

100ms(0.1초) 뒤에 실행해 달라고 했는데 실제로는 약 500ms 뒤에 실행되었습니다(숫자는 PC마다 조금씩 다릅니다). 직원(실행 스레드)이 `blockFor` 안에서 계속 일하고 있었기 때문에, 벨(타이머)이 울려도 응대할 수 없었던 것입니다.

브라우저에서 이런 일이 생기면 화면이 굳고 버튼이 눌리지 않습니다. 그래서 **오래 기다려야 하는 일(네트워크 요청, 타이머, 파일 읽기)은 비동기로** 처리합니다.

::: tip 용어 정리
- **동기(synchronous)**: 앞의 작업이 끝날 때까지 기다렸다가 다음 작업을 합니다.
- **비동기(asynchronous)**: 작업을 시작만 해 두고, 결과는 나중에 받습니다. 그 사이에 다른 작업을 합니다.
- **블로킹(blocking)**: 실행 스레드가 한 작업에 붙잡혀 다른 일을 못 하는 상태입니다.
:::

### 3단계: setTimeout — 가장 간단한 비동기 함수

`setTimeout(함수, 밀리초)`는 "지정한 시간이 지난 뒤 이 함수를 실행해 달라"고 예약합니다. 1000밀리초(ms)가 1초입니다.

```ts
console.log('주문 접수')

setTimeout(() => {
  console.log('음식 나왔습니다')
}, 1000)

console.log('다음 손님 받습니다')
```

```text
주문 접수
다음 손님 받습니다
음식 나왔습니다      ← 약 1초 뒤
```

코드 순서는 "주문 접수 → 음식 → 다음 손님"인데, 출력 순서는 "주문 접수 → 다음 손님 → 음식"입니다. `setTimeout`은 함수를 **지금 실행하지 않고 예약만** 한 뒤 바로 다음 줄로 넘어가기 때문입니다.

`setTimeout`이 돌려주는 값으로 예약을 취소할 수도 있습니다.

```ts
const timerId = setTimeout(() => {
  console.log('이 줄은 실행되지 않습니다')
}, 1000)

clearTimeout(timerId) // 예약 취소
```

`setInterval(함수, 밀리초)`은 같은 간격으로 계속 반복 실행하고, `clearInterval`로 멈춥니다.

```ts
let count = 0
const intervalId = setInterval(() => {
  count += 1
  console.log(`${count}번째 재고 확인`)
  if (count === 3) {
    clearInterval(intervalId) // 3번 확인하면 멈춤
  }
}, 500)
```

```text
1번째 재고 확인
2번째 재고 확인
3번째 재고 확인
```

::: info setTimeout의 반환 타입
브라우저에서는 `setTimeout`이 `number`를 돌려주고, Node.js에서는 `Timeout` 객체를 돌려줍니다. 두 환경에서 모두 동작하는 코드를 쓸 때는 `ReturnType<typeof setTimeout>`으로 타입을 적으면 안전합니다. (`ReturnType`은 [내장 유틸리티 타입](../part3-intermediate/07-utility-types)에서 배웠습니다.)

```ts
let timer: ReturnType<typeof setTimeout> | undefined
timer = setTimeout(() => {}, 100)
clearTimeout(timer)
```
:::

### 4단계: 콜백 함수와 그 타입

**콜백(callback)** 은 "다른 함수에 넘겨서, 그 함수가 나중에 불러 주도록 하는 함수"입니다. 진동벨과 같습니다. 위의 `setTimeout(() => {...}, 1000)`에서 화살표 함수가 콜백입니다.

직접 콜백을 받는 함수를 만들어 보겠습니다.

```ts
// done: 커피가 완성되면 불러 줄 콜백. 완성된 커피 이름(string)을 받고 아무것도 돌려주지 않습니다.
function orderCoffee(menu: string, done: (cup: string) => void): void {
  console.log(`${menu} 주문 접수`)
  setTimeout(() => {
    done(`${menu} 한 잔`)
  }, 1000)
}

orderCoffee('아메리카노', (cup) => {
  console.log(`${cup} 나왔습니다`)
})
console.log('진동벨을 받고 자리로 갑니다')
```

```text
아메리카노 주문 접수
진동벨을 받고 자리로 갑니다
아메리카노 한 잔 나왔습니다
```

해설:

- `done: (cup: string) => void`는 "string 하나를 받고 반환값이 없는 함수"라는 타입입니다.
- 호출하는 쪽의 `(cup) => {...}`에는 타입을 안 적었지만, TypeScript가 `done`의 타입을 보고 `cup`이 `string`이라고 **문맥적으로 추론(contextual typing)** 합니다.
- "아메리카노 주문 접수"는 `orderCoffee` 안의 동기 코드라 바로 찍히고, 완성 알림만 1초 뒤에 찍힙니다.

#### Node.js 관례: 오류 우선 콜백(error-first callback)

콜백 방식에서는 실패도 콜백으로 알려야 합니다. Node.js는 오래전부터 **첫 번째 인자는 오류, 두 번째 인자는 결과**라는 관례를 써 왔습니다.

```ts
type Callback<T> = (error: Error | null, result?: T) => void

interface Product {
  code: string
  name: string
  price: number
}

const products: Product[] = [
  { code: 'P001', name: '아메리카노', price: 4500 },
  { code: 'P002', name: '카페라테', price: 5000 },
]

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

findProduct('P002', (error, product) => {
  if (error) {
    console.log('실패:', error.message)
    return
  }
  console.log('찾음:', product?.name)
})

findProduct('P999', (error, product) => {
  if (error) {
    console.log('실패:', error.message)
    return
  }
  console.log('찾음:', product?.name)
})
```

```text
찾음: 카페라테
실패: 상품 P999를 찾을 수 없습니다
```

`result?: T`가 선택 속성이라 `product?.name`처럼 매번 조심스럽게 꺼내야 하는 점이 불편합니다. 이 불편함은 다음 레슨에서 Promise로 해결합니다.

### 5단계: 이벤트 루프의 세 부품

이제 "나중에 실행"이 내부에서 어떻게 일어나는지 봅니다. 세 가지 부품만 알면 됩니다.

#### 콜 스택(call stack)

**지금 실행 중인 함수들이 쌓이는 곳**입니다. 함수를 부르면 위에 쌓이고(push), 함수가 끝나면 빠집니다(pop). 접시를 쌓고 맨 위부터 꺼내는 것과 같습니다.

```ts
function makeReceipt(): string {
  return '영수증'
}
function pay(): void {
  const r = makeReceipt()
  console.log(r)
}
pay()
```

| 순서 | 일어나는 일 | 콜 스택(아래 → 위) |
|---|---|---|
| 1 | `pay()` 호출 | pay |
| 2 | `pay` 안에서 `makeReceipt()` 호출 | pay, makeReceipt |
| 3 | `makeReceipt`가 값을 돌려주고 끝남 | pay |
| 4 | `console.log(r)` 호출 | pay, console.log |
| 5 | `console.log`가 끝남 | pay |
| 6 | `pay`가 끝남 | (비어 있음) |

자바스크립트는 콜 스택이 **하나뿐**입니다. 이것이 "한 번에 한 가지 일만 한다(싱글 스레드, single thread)"의 의미입니다.

#### 태스크 큐(task queue)

`setTimeout`의 시간이 다 되거나, 클릭 이벤트가 일어나거나, 네트워크 응답이 오면 그 콜백이 **줄을 서는 곳**입니다. "매크로태스크 큐(macrotask queue)"라고도 부릅니다. 큐(queue)는 먼저 들어온 것이 먼저 나가는(FIFO, First In First Out) 줄입니다.

#### 마이크로태스크 큐(microtask queue)

Promise의 `then`/`catch`/`finally` 콜백, `await` 다음 부분, `queueMicrotask()`로 넣은 함수가 줄을 서는 곳입니다. 태스크 큐보다 **우선순위가 높습니다.**

#### 이벤트 루프의 규칙

이벤트 루프(event loop)는 아래 규칙을 끝없이 반복합니다.

1. 콜 스택에 있는 일을 끝까지 실행합니다.
2. 콜 스택이 비면, **마이크로태스크 큐를 완전히 비울 때까지** 하나씩 꺼내 실행합니다. (실행 중에 새 마이크로태스크가 생기면 그것까지 다 실행합니다.)
3. 그다음 태스크 큐에서 **딱 하나**를 꺼내 실행합니다.
4. 다시 2번으로 돌아갑니다. (브라우저는 이 사이사이에 화면을 다시 그립니다.)

```text
┌──────────────┐
│   콜 스택     │ ◀── 여기 있는 일을 끝까지 실행
└──────┬───────┘
       │ 비었다!
       ▼
┌──────────────────────┐
│  마이크로태스크 큐      │ ◀── 전부 비울 때까지 실행 (then, await, queueMicrotask)
└──────┬───────────────┘
       │ 비었다!
       ▼
┌──────────────────────┐
│     태스크 큐          │ ◀── 하나만 꺼내 실행 (setTimeout, 이벤트, I/O)
└──────┬───────────────┘
       └────────▶ 다시 마이크로태스크 큐 확인
```

::: warning setTimeout(fn, 0)은 "즉시"가 아닙니다
시간을 0으로 줘도 콜백은 태스크 큐에 들어갈 뿐입니다. 지금 실행 중인 코드와 마이크로태스크가 모두 끝나야 실행됩니다. 또 브라우저는 여러 번 중첩된 타이머의 최소 지연을 약 4ms로 강제합니다.
:::

### 6단계: 실행 순서를 표로 추적하기 (기본)

```ts
console.log('1. 주문 접수')

setTimeout(() => {
  console.log('4. 타이머 콜백 (태스크 큐)')
}, 0)

Promise.resolve().then(() => {
  console.log('3. then 콜백 (마이크로태스크 큐)')
})

console.log('2. 다음 손님 응대')
```

```text
1. 주문 접수
2. 다음 손님 응대
3. then 콜백 (마이크로태스크 큐)
4. 타이머 콜백 (태스크 큐)
```

`Promise.resolve()`는 "이미 성공한 Promise"를 만듭니다(다음 레슨에서 자세히 봅니다). 지금은 "`then`의 콜백은 마이크로태스크 큐로 간다"만 기억하면 됩니다.

| 단계 | 실행하는 코드 | 콜 스택 | 마이크로태스크 큐 | 태스크 큐 | 출력 |
|---|---|---|---|---|---|
| 1 | `console.log('1...')` | 전역 코드 | | | 1 |
| 2 | `setTimeout(..., 0)` | 전역 코드 | | 타이머 콜백 | |
| 3 | `Promise.resolve().then(...)` | 전역 코드 | then 콜백 | 타이머 콜백 | |
| 4 | `console.log('2...')` | 전역 코드 | then 콜백 | 타이머 콜백 | 2 |
| 5 | 전역 코드 끝 → 마이크로태스크 실행 | then 콜백 | | 타이머 콜백 | 3 |
| 6 | 마이크로태스크 비었음 → 태스크 하나 실행 | 타이머 콜백 | | | 4 |

### 7단계: 실행 순서를 표로 추적하기 (심화)

조금 더 복잡한 예입니다. 먼저 스스로 순서를 적어 본 뒤 정답과 비교해 보세요.

```ts
console.log('A')

setTimeout(() => {
  console.log('B')
  Promise.resolve().then(() => console.log('C'))
}, 0)

setTimeout(() => {
  console.log('D')
}, 0)

Promise.resolve()
  .then(() => {
    console.log('E')
    setTimeout(() => console.log('F'), 0)
  })
  .then(() => console.log('G'))

queueMicrotask(() => console.log('H'))

console.log('I')
```

```text
A
I
E
H
G
B
C
D
F
```

| 단계 | 하는 일 | 마이크로태스크 큐 | 태스크 큐 | 출력 |
|---|---|---|---|---|
| 1 | `console.log('A')` | | | A |
| 2 | 첫 번째 `setTimeout` 등록 | | 타이머B | |
| 3 | 두 번째 `setTimeout` 등록 | | 타이머B, 타이머D | |
| 4 | 첫 `then` 등록 (Promise가 이미 성공 상태라 바로 큐로) | E | 타이머B, 타이머D | |
| 5 | `queueMicrotask` 등록 | E, H | 타이머B, 타이머D | |
| 6 | `console.log('I')` → 전역 코드 끝 | E, H | 타이머B, 타이머D | I |
| 7 | 마이크로태스크 E 실행 → 타이머F 등록, 다음 `then`(G)이 큐에 들어감 | H, G | 타이머B, 타이머D, 타이머F | E |
| 8 | 마이크로태스크 H 실행 | G | 타이머B, 타이머D, 타이머F | H |
| 9 | 마이크로태스크 G 실행 → 마이크로태스크 큐 비었음 | | 타이머B, 타이머D, 타이머F | G |
| 10 | 태스크 하나: 타이머B 실행 → C가 마이크로태스크 큐로 | C | 타이머D, 타이머F | B |
| 11 | 태스크 하나가 끝났으니 마이크로태스크부터: C | | 타이머D, 타이머F | C |
| 12 | 태스크 하나: 타이머D | | 타이머F | D |
| 13 | 태스크 하나: 타이머F | | | F |

눈여겨볼 점:

- **G가 H보다 늦습니다.** 두 번째 `then`(G)은 첫 번째 `then`(E)이 끝나야 큐에 들어가기 때문입니다.
- **C가 D보다 빠릅니다.** 태스크 하나(B)가 끝날 때마다 마이크로태스크 큐를 먼저 비우기 때문입니다.
- **F가 가장 늦습니다.** F의 타이머는 E가 실행될 때(7단계) 등록되어, 이미 줄 서 있던 B·D 뒤에 섰습니다.

::: tip 외우는 요령
"**동기 → 마이크로(전부) → 태스크(하나) → 마이크로(전부) → 태스크(하나) ...**"
:::

### 8단계: 브라우저와 Node.js의 차이 (참고)

| 항목 | 브라우저 | Node.js |
|---|---|---|
| 비동기 기능 제공자 | Web API(타이머, fetch, DOM 이벤트) | libuv(타이머, 파일, 네트워크) |
| 태스크 큐 | 종류별 여러 큐(이벤트, 타이머 등) | 단계(phase)별 큐: timers → poll → check 등 |
| 추가 기능 | `requestAnimationFrame`(화면 그리기 직전 실행) | `setImmediate`, `process.nextTick`(마이크로태스크보다도 먼저 실행) |

이번 레슨의 규칙(동기 → 마이크로태스크 → 태스크)은 두 환경에서 똑같이 성립합니다. 세부 단계는 [Node.js 공식 문서: Event Loop](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick)와 [MDN: 이벤트 루프](https://developer.mozilla.org/ko/docs/Web/JavaScript/Event_loop)에서 더 볼 수 있습니다.

### 9단계: 콜백 지옥(callback hell)

실무에서는 비동기 작업이 **순서대로** 이어지는 경우가 많습니다. 예를 들어 주문 처리는 "회원 조회 → 장바구니 조회 → 결제 → 영수증 발행" 순서입니다. 각 단계가 앞 단계의 결과를 써야 하므로, 콜백 안에 콜백을 넣게 됩니다.

```ts
type Done<T> = (error: Error | null, result?: T) => void

function getMember(id: string, done: Done<{ id: string; name: string }>): void {
  setTimeout(() => done(null, { id, name: '김하나' }), 100)
}
function getCart(memberId: string, done: Done<{ total: number }>): void {
  setTimeout(() => done(null, { total: 9500 }), 100)
}
function pay(amount: number, done: Done<{ approvalNo: string }>): void {
  setTimeout(() => done(null, { approvalNo: 'A-20261023-001' }), 100)
}
function printReceipt(approvalNo: string, done: Done<string>): void {
  setTimeout(() => done(null, `영수증 출력 완료(${approvalNo})`), 100)
}

getMember('M001', (err1, member) => {
  if (err1 || !member) {
    console.log('회원 조회 실패')
    return
  }
  getCart(member.id, (err2, cart) => {
    if (err2 || !cart) {
      console.log('장바구니 조회 실패')
      return
    }
    pay(cart.total, (err3, payment) => {
      if (err3 || !payment) {
        console.log('결제 실패')
        return
      }
      printReceipt(payment.approvalNo, (err4, message) => {
        if (err4) {
          console.log('영수증 실패')
          return
        }
        console.log(message)
      })
    })
  })
})
```

```text
영수증 출력 완료(A-20261023-001)
```

동작은 하지만 문제가 많습니다.

1. **오른쪽으로 계속 밀립니다.** 단계가 늘수록 들여쓰기가 피라미드처럼 깊어집니다("파멸의 피라미드, pyramid of doom"이라고도 부릅니다).
2. **오류 처리가 반복됩니다.** 단계마다 `if (err...)`를 써야 하고, 하나라도 빠뜨리면 오류가 조용히 사라집니다.
3. **try/catch로 잡을 수 없습니다.** 콜백은 나중에 새 콜 스택에서 실행되므로, 바깥의 `try/catch`는 이미 끝난 뒤입니다(아래 "자주 하는 실수" 참고).
4. **흐름 제어가 어렵습니다.** "두 작업을 동시에 시작하고 둘 다 끝나면 다음 단계" 같은 요구를 콜백만으로 짜면 상태 변수를 직접 관리해야 합니다(문제 6 참고).

같은 흐름을 3강에서 배울 문법으로 쓰면 이렇게 바뀝니다. 지금은 모양만 보세요(아직 정의하지 않은 함수가 있어 그대로 실행되지는 않습니다).

```text
async function checkout(memberId: string): Promise<void> {
  try {
    const member = await getMemberAsync(memberId)
    const cart = await getCartAsync(member.id)
    const payment = await payAsync(cart.total)
    console.log(await printReceiptAsync(payment.approvalNo))
  } catch (error) {
    console.log('주문 처리 실패', error)
  }
}
```

위에서 아래로 읽히고, 오류 처리는 한 곳에 모였습니다. 이것이 Promise와 async/await를 배우는 이유입니다.

### 10단계: 동기 콜백과 비동기 콜백을 구분하기

모든 콜백이 비동기인 것은 아닙니다. 배열의 `map`, `filter`, `forEach`에 넘기는 콜백은 **즉시(동기적으로)** 실행됩니다.

```ts
const prices = [4500, 5000, 3000]

console.log('시작')
prices.forEach((price) => {
  console.log(price) // 동기 콜백: 지금 바로 실행
})
console.log('끝')
```

```text
시작
4500
5000
3000
끝
```

| 콜백을 받는 함수 | 실행 시점 |
|---|---|
| 배열의 `map`·`filter`·`forEach`·`reduce`·`sort` | 동기 (그 자리에서 즉시) |
| `setTimeout`·`setInterval` | 비동기 (태스크 큐) |
| `addEventListener` | 비동기 (이벤트가 생길 때마다 태스크 큐) |
| Promise의 `then`·`catch`·`finally` | 비동기 (마이크로태스크 큐) |
| `new Promise(...)`에 넘기는 함수 | **동기** (다음 레슨에서 다룸) |

## 자주 하는 실수

### 실수 1: 비동기 결과를 바로 쓰려고 한다

```ts
let total = 0

setTimeout(() => {
  total = 9500 // 서버에서 받아 왔다고 가정
}, 100)

console.log(`결제 금액: ${total}원`)
// 출력: 결제 금액: 0원
```

**왜 틀렸나:** `console.log`는 동기 코드라 타이머 콜백보다 **먼저** 실행됩니다. 그 시점의 `total`은 아직 0입니다.

```ts
// 고친 코드: 결과를 쓰는 코드를 콜백 안으로 옮깁니다.
setTimeout(() => {
  const total = 9500
  console.log(`결제 금액: ${total}원`)
}, 100)
// 출력: 결제 금액: 9500원
```

### 실수 2: 바깥 try/catch로 콜백 안의 오류를 잡으려 한다

```ts
try {
  setTimeout(() => {
    throw new Error('결제 서버 응답 없음')
  }, 100)
} catch (error) {
  console.log('잡았다!') // 실행되지 않습니다
}
// 결과: "Uncaught Error: 결제 서버 응답 없음"이 나고 Node.js에서는 프로그램이 종료됨
```

**왜 틀렸나:** `try` 블록은 `setTimeout`으로 **예약만** 하고 즉시 끝납니다. 100ms 뒤 콜백이 실행될 때는 `try/catch`가 콜 스택에 없습니다.

```ts
// 고친 코드: 오류가 날 수 있는 곳(콜백 안)에서 직접 처리합니다.
setTimeout(() => {
  try {
    throw new Error('결제 서버 응답 없음')
  } catch (error) {
    if (error instanceof Error) {
      console.log('잡았다!', error.message)
    }
  }
}, 100)
// 출력: 잡았다! 결제 서버 응답 없음
```

### 실수 3: 반복문에서 var와 setTimeout을 함께 쓴다

```ts
for (var i = 1; i <= 3; i++) {
  setTimeout(() => console.log(`${i}번 테이블`), 100)
}
// 출력: 4번 테이블, 4번 테이블, 4번 테이블
```

**왜 틀렸나:** `var`는 반복문 전체에서 변수 하나를 공유합니다. 콜백이 실행될 때는 반복문이 이미 끝나 `i`가 4입니다.

```ts
// 고친 코드: let은 반복마다 새 변수를 만들어 콜백이 각자의 값을 기억합니다(클로저).
for (let i = 1; i <= 3; i++) {
  setTimeout(() => console.log(`${i}번 테이블`), 100)
}
// 출력: 1번 테이블, 2번 테이블, 3번 테이블
```

### 실수 4: 콜백을 "호출해서" 넘긴다

```ts
function notify(): void {
  console.log('주문 완료 알림')
}

setTimeout(notify(), 1000)
// ❌ Argument of type 'void' is not assignable to parameter of type 'TimerHandler'. (TS2345)
```

**왜 틀렸나:** `notify()`는 함수를 **지금 실행**하고 그 반환값(`void`)을 넘깁니다. 넘겨야 하는 것은 함수 자체입니다. TypeScript가 이 실수를 잡아 줍니다. (Node.js 타입(`@types/node`)을 설치한 프로젝트에서는 메시지 문구가 조금 다를 수 있습니다.)

```ts
function notify(): void {
  console.log('주문 완료 알림')
}

// 고친 코드
setTimeout(notify, 1000)
// 또는 인자가 필요하면 화살표 함수로 감쌉니다.
setTimeout(() => notify(), 1000)
```

### 실수 5: 무거운 동기 작업으로 화면을 멈춘다

```ts
// 10만 건 주문을 한 번에 집계 — 그 동안 버튼 클릭·화면 갱신이 모두 멈춥니다.
function sumAll(orders: number[]): number {
  let sum = 0
  for (const amount of orders) {
    sum += amount
  }
  return sum
}
```

**왜 문제인가:** 계산 자체는 비동기로 바꿀 수 없습니다. 실행 스레드가 하나라 계산 중에는 이벤트 루프가 돌지 않습니다. `async`를 붙여도 계산은 여전히 같은 스레드에서 돕니다.

**대처:** 데이터를 나눠 `setTimeout`으로 쪼개 처리하거나, 브라우저의 Web Worker·Node.js의 `worker_threads`처럼 **별도 스레드**를 씁니다. 업무 화면이라면 서버가 집계하도록 하는 것이 가장 좋습니다.

## 직접 해 보기

### 문제 1 ⭐ 출력 순서 맞히기

```ts
console.log('가')
setTimeout(() => console.log('나'), 0)
console.log('다')
```

::: details 정답 보기
```text
가
다
나
```
`setTimeout` 콜백은 태스크 큐로 가서, 동기 코드(가, 다)가 모두 끝난 뒤 실행됩니다.
:::

### 문제 2 ⭐ 콜백 타입 붙이기

아래 함수 `calcDiscount`의 매개변수 `done`에 알맞은 타입을 붙이세요. `done`은 할인된 가격(숫자)을 받고 아무것도 돌려주지 않습니다.

```text
function calcDiscount(price: number, rate: number, done) {
  setTimeout(() => done(price * (1 - rate)), 100)
}
```

::: details 정답 보기
```ts
function calcDiscount(price: number, rate: number, done: (discounted: number) => void): void {
  setTimeout(() => done(price * (1 - rate)), 100)
}

calcDiscount(10000, 0.1, (discounted) => {
  console.log(`할인가: ${discounted}원`) // 출력: 할인가: 9000원
})
```
타입을 안 붙이면 `strict` 모드에서 `Parameter 'done' implicitly has an 'any' type. (TS7006)` 오류가 납니다.
:::

### 문제 3 ⭐⭐ 마이크로태스크와 태스크

```ts
setTimeout(() => console.log('1'), 0)
Promise.resolve().then(() => console.log('2'))
console.log('3')
Promise.resolve().then(() => console.log('4'))
setTimeout(() => console.log('5'), 0)
```

::: details 정답 보기
```text
3
2
4
1
5
```
동기(3) → 마이크로태스크 큐 전부(2, 4) → 태스크 큐 순서대로(1, 5)입니다.
:::

### 문제 4 ⭐⭐ 순서대로 실행되는 카운트다운

`setTimeout`만 써서 1초 간격으로 `3`, `2`, `1`, `개점!`을 출력하는 함수 `countdown(n: number): void`를 만드세요. (`setInterval`을 쓰지 말고, 콜백 안에서 다시 자기 자신을 부르는 방식으로 풀어 보세요.)

::: details 정답 보기
```ts
function countdown(n: number): void {
  if (n === 0) {
    console.log('개점!')
    return
  }
  console.log(n)
  setTimeout(() => countdown(n - 1), 1000)
}

countdown(3)
```
```text
3
2
1
개점!
```
함수가 자기 자신을 부르는 것을 재귀(recursion)라고 합니다. 여기서는 매번 태스크 큐를 거쳐 새 콜 스택에서 시작하므로, 아무리 많이 반복해도 콜 스택이 넘치지 않습니다.
:::

### 문제 5 ⭐⭐⭐ 심화 출력 순서

```ts
console.log('S')
setTimeout(() => {
  console.log('T1')
  queueMicrotask(() => console.log('M3'))
}, 0)
queueMicrotask(() => {
  console.log('M1')
  queueMicrotask(() => console.log('M2'))
})
setTimeout(() => console.log('T2'), 0)
console.log('E')
```

::: details 정답 보기
```text
S
E
M1
M2
T1
M3
T2
```
- 동기: S, E
- 마이크로태스크 큐를 **완전히** 비웁니다. M1 실행 중 새로 들어온 M2까지 실행합니다.
- 태스크 T1 실행 → M3가 마이크로태스크 큐로 → 다음 태스크(T2)보다 먼저 M3 실행
- 마지막으로 T2
:::

### 문제 6 ⭐⭐⭐ 두 작업이 모두 끝나면 알리기

`loadMenu`와 `loadStock` 두 함수가 각각 콜백으로 결과를 줍니다. 두 작업을 **동시에** 시작하고, **둘 다** 끝났을 때 한 번만 `준비 완료: 메뉴 N개, 재고 M개`를 출력하세요.

```ts
function loadMenu(done: (menus: string[]) => void): void {
  setTimeout(() => done(['아메리카노', '라테', '모카']), 300)
}
function loadStock(done: (stock: number) => void): void {
  setTimeout(() => done(42), 100)
}
```

::: details 정답 보기
```ts
function loadMenu(done: (menus: string[]) => void): void {
  setTimeout(() => done(['아메리카노', '라테', '모카']), 300)
}
function loadStock(done: (stock: number) => void): void {
  setTimeout(() => done(42), 100)
}

let menus: string[] | undefined
let stock: number | undefined

function tryFinish(): void {
  // 두 결과가 모두 도착했을 때만 진행합니다.
  if (menus !== undefined && stock !== undefined) {
    console.log(`준비 완료: 메뉴 ${menus.length}개, 재고 ${stock}개`)
  }
}

loadMenu((result) => {
  menus = result
  tryFinish()
})
loadStock((result) => {
  stock = result
  tryFinish()
})
// 출력: 준비 완료: 메뉴 3개, 재고 42개
```
콜백만으로는 이렇게 상태 변수를 직접 관리해야 합니다. 다음 레슨의 `Promise.all`을 쓰면 훨씬 짧게 해결됩니다.
:::

## 확인 퀴즈

1. 자바스크립트의 콜 스택은 몇 개입니까?
2. `Promise.then`의 콜백과 `setTimeout`의 콜백 중 어느 것이 먼저 실행됩니까?
3. 이벤트 루프는 태스크 큐에서 한 번에 몇 개를 꺼내 실행합니까? 마이크로태스크 큐는요?
4. `setTimeout(fn, 0)`의 `fn`은 즉시 실행됩니까?
5. 배열의 `forEach`에 넘긴 콜백은 동기입니까, 비동기입니까?

::: details 정답 보기
1. 하나입니다. 그래서 한 번에 한 가지 코드만 실행합니다(싱글 스레드).
2. `Promise.then`의 콜백(마이크로태스크)이 먼저입니다.
3. 태스크 큐는 한 번에 하나, 마이크로태스크 큐는 빌 때까지 전부 실행합니다.
4. 아닙니다. 태스크 큐에 들어가서 지금 실행 중인 코드와 마이크로태스크가 모두 끝난 뒤 실행됩니다.
5. 동기입니다. 그 자리에서 바로 배열 요소마다 실행됩니다.
:::

## 정리

- 동기는 "끝날 때까지 기다림", 비동기는 "맡겨 두고 끝나면 알림 받기"입니다.
- 자바스크립트는 콜 스택이 하나뿐이지만, 기다리는 일은 브라우저·Node.js에 맡기므로 여러 일을 처리할 수 있습니다.
- 실행 순서 규칙: **동기 코드 → 마이크로태스크 전부 → 태스크 하나 → 마이크로태스크 전부 → ...**
- `then`·`await`·`queueMicrotask`는 마이크로태스크, `setTimeout`·이벤트·I/O는 태스크입니다.
- 콜백에는 `(값: 타입) => void` 형태로 타입을 붙입니다.
- 콜백을 중첩하면 콜백 지옥이 되고, 오류 처리와 흐름 제어가 어려워집니다. 해결책이 Promise와 async/await입니다.

## 다음 단계

[Promise 완전 이해](./02-promise) — 진동벨을 "값"으로 만든 것이 Promise입니다. 상태 3가지, 체이닝, `Promise.all` 같은 조합 함수로 콜백 지옥을 풀어 봅니다.
