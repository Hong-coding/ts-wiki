---
title: async/await와 비동기 오류 처리
---

# async/await와 비동기 오류 처리

<LessonMeta level="중급" :minutes="50" prev="Promise의 상태, then/catch/finally 체이닝, Promise.all 등 조합 함수" />

## 이번에 배울 것

- `then` 체인을 `async`/`await`로 바꿔 위에서 아래로 읽히는 비동기 코드를 쓸 수 있다.
- `async` 함수의 반환 타입이 항상 `Promise<T>`인 이유를 설명할 수 있다.
- 순차 실행과 병렬 실행의 시간 차이를 측정하고, 서로 의존하지 않는 작업을 `Promise.all`로 동시에 실행할 수 있다.
- `try/catch/finally`로 비동기 오류를 처리하고, 처리되지 않은 거부가 생기는 상황을 피할 수 있다.
- 반복문 안 `await`, `forEach` + `async` 같은 흔한 함정을 알아보고 고칠 수 있다.

## 먼저 알아 둘 것

- Promise의 상태와 체이닝: [Promise 완전 이해](./02-promise)
- 이벤트 루프와 마이크로태스크 큐: [동기 vs 비동기, 콜백과 이벤트 루프](./01-event-loop-callback)
- `try/catch/finally`: [오류 처리](../part1-basics/11-errors)
- `ReturnType` 같은 유틸리티 타입: [내장 유틸리티 타입](../part3-intermediate/07-utility-types)
- ES 모듈(import/export): [모듈](../part3-intermediate/09-modules)

## 비유로 이해하기

지난 레슨까지 손님은 진동벨(Promise)을 받고, "벨이 울리면 이것을 하고, 그다음 벨이 울리면 저것을 하고..."라는 **할 일 목록**(`then` 체인)을 적어 두었습니다. 동작은 확실하지만, 목록이 길어지면 읽기 불편합니다.

`async`/`await`는 이렇게 바뀝니다. 손님이 **"벨이 울릴 때까지 여기서 기다릴게요"** 라고 말하고(`await`), 벨이 울리면 바로 다음 줄로 넘어갑니다. 코드는 마치 동기 코드처럼 위에서 아래로 읽힙니다.

그런데 중요한 점이 있습니다. 기다리는 것은 **그 손님(그 `async` 함수)뿐**입니다. 직원(실행 스레드)은 그 손님 앞에 멈춰 서 있지 않고, 다른 손님을 계속 응대합니다. 벨이 울리면 직원이 돌아와서 그 손님의 다음 일을 이어서 처리합니다.

| 식당 | 코드 |
|---|---|
| "벨이 울릴 때까지 기다리는" 손님 | `async` 함수 |
| "여기서 기다릴게요" | `await` |
| 손님이 기다리는 동안 다른 손님을 받는 직원 | 이벤트 루프 — 다른 코드는 계속 실행됨 |
| 손님이 기다리다 "음식이 안 나온대요" 소식을 받음 | `await`한 Promise가 거부되어 `throw`처럼 동작 |
| 그 소식에 대응하는 방법 | `try/catch` |

## 개념 설명

### 1단계: then 체인을 async/await로 바꾸기

지난 레슨의 주문 처리 체인을 그대로 가져옵니다(함수 정의는 지난 레슨 5단계와 같습니다).

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
```

**then 체인 버전(지난 레슨)**

```ts
getMember('M001')
  .then((member) => getCart(member.id))
  .then((cart) => pay(cart.total))
  .then((payment) => printReceipt(payment.approvalNo))
  .then((message) => console.log(message))
  .catch((error: unknown) => console.log('주문 처리 실패:', error))
  .finally(() => console.log('진동벨 회수'))
```

**async/await 버전**

```ts
async function checkout(memberId: string): Promise<void> {
  try {
    const member = await getMember(memberId)
    const cart = await getCart(member.id)
    const payment = await pay(cart.total)
    const message = await printReceipt(payment.approvalNo)
    console.log(message)
    console.log(`${member.name}님 결제 완료, 승인번호 ${payment.approvalNo}`)
  } catch (error) {
    console.log('주문 처리 실패:', error instanceof Error ? error.message : error)
  } finally {
    console.log('진동벨 회수')
  }
}

checkout('M001')
```

```text
영수증 출력 완료(A-20261023-001)
김하나님 결제 완료, 승인번호 A-20261023-001
진동벨 회수
```

바뀐 점을 하나씩 짚어 보겠습니다.

- 함수 앞에 **`async`** 를 붙이면 그 함수 안에서 **`await`** 를 쓸 수 있습니다.
- `await 프로미스`는 "이 Promise가 처리될 때까지 이 함수를 잠시 멈추고, 이행되면 그 **값**을 꺼내 준다"는 뜻입니다. 그래서 `member`의 타입은 `Promise<Member>`가 아니라 `Member`입니다.
- `then`의 연결 고리가 사라지고 보통의 변수 선언으로 바뀌었습니다. 그래서 **앞 단계의 값(`member`)과 뒤 단계의 값(`payment`)을 함께** 쓸 수 있습니다. 지난 레슨 "실수 3"에서 중첩 없이는 어려웠던 일입니다.
- 오류 처리는 동기 코드에서 배운 `try/catch/finally` 그대로입니다. `.catch()`는 `catch` 블록이, `.finally()`는 `finally` 블록이 되었습니다.

::: info async/await는 Promise의 "다른 표기법"입니다
`async`/`await`는 Promise를 대체하는 새 기능이 아닙니다. 내부에서는 똑같이 Promise와 마이크로태스크로 동작합니다. 편하게 쓰는 문법이라는 뜻으로 **문법 설탕(syntactic sugar)** 이라고 부릅니다. 그래서 Promise를 이해해야 `async`/`await`도 제대로 쓸 수 있습니다. ES2017부터 표준입니다.
:::

### 2단계: async 함수는 항상 Promise를 돌려준다

`async` 함수 안에서 `return 1200`이라고 써도, 함수를 부른 쪽이 받는 것은 `1200`이 아니라 **`1200`으로 이행된 Promise**입니다.

```ts
async function getPoint(): Promise<number> {
  return 1200
}

const result = getPoint()
console.log(result)
result.then((point) => console.log('포인트:', point))
```

```text
Promise { 1200 }
포인트: 1200
```

규칙은 이렇습니다.

| async 함수 안에서 | 함수를 부른 쪽이 받는 것 |
|---|---|
| `return 값` | 그 값으로 **이행된** Promise |
| `throw 오류` | 그 오류로 **거부된** Promise |
| 아무것도 `return`하지 않음 | `undefined`로 이행된 `Promise<void>` |

그래서 `async` 함수의 반환 타입은 **반드시** `Promise<...>` 모양이어야 합니다.

```ts
async function getPoint(): number {
  return 1200
}
// ❌ The return type of an async function or method must be the global Promise<T> type. Did you mean to write 'Promise<number>'? (TS1064)
```

반환 타입을 생략하면 TypeScript가 추론합니다. `async function noReturn() {}`는 `Promise<void>`, `return '성공'`이 있으면 `Promise<string>`이 됩니다. 다만 공개 함수(다른 파일에서 쓰는 함수)는 반환 타입을 직접 적는 편이 실수를 빨리 잡습니다.

### 3단계: await가 하는 일과 타입

`await`는 Promise에서 값을 꺼냅니다. Promise가 아닌 값에 `await`를 붙이면 그 값을 그대로 돌려줍니다(쓸모는 없습니다).

```ts
async function fetchPoint(): Promise<number> {
  return 1200
}

async function main(): Promise<void> {
  const p = fetchPoint()        // p: Promise<number> — 아직 상자
  const n = await fetchPoint()  // n: number — 상자에서 꺼낸 값
  console.log(p, n)

  const total: number = fetchPoint() + 100
  // ❌ Operator '+' cannot be applied to types 'Promise<number>' and '100'. (TS2365)
}
```

`await`를 빠뜨리면 "상자"와 숫자를 더하려는 셈이라 TypeScript가 막아 줍니다. 변수에 마우스를 올렸을 때 `Promise<...>`가 보이면 `await`를 빠뜨리지 않았는지 의심해 보세요.

::: tip await는 어디서 쓸 수 있나
- `async` 함수 안
- ES 모듈 파일의 맨 바깥(최상위). 5단계에서 다룹니다.

일반 함수 안에서 `await`를 쓰면 `'await' expressions are only allowed within async functions and at the top levels of modules. (TS1308)` 오류가 납니다.
:::

#### await와 실행 순서

`await`를 만나면 함수는 **거기서 멈추고 즉시 호출한 쪽으로 돌아갑니다.** `await` 다음 줄은 마이크로태스크로 나중에 이어서 실행됩니다.

```ts
async function brew(): Promise<void> {
  console.log('2. brew 시작(여기까지는 동기)')
  await null
  console.log('4. await 다음 줄(마이크로태스크)')
}

console.log('1. 주문')
setTimeout(() => console.log('6. 타이머'), 0)
brew()
Promise.resolve().then(() => console.log('5. then'))
console.log('3. 다음 손님')
```

```text
1. 주문
2. brew 시작(여기까지는 동기)
3. 다음 손님
4. await 다음 줄(마이크로태스크)
5. then
6. 타이머
```

- `async` 함수는 첫 `await`를 만나기 전까지는 **동기로** 실행됩니다(2). Promise의 executor와 비슷합니다.
- `await` 뒤의 코드는 마이크로태스크 큐에 줄을 섭니다. `then`(5)보다 먼저 줄을 섰기 때문에 먼저 실행됩니다.
- 지난 레슨들의 규칙 그대로입니다: **동기 → 마이크로태스크 전부 → 태스크 하나.**

### 4단계: 순차 실행 vs 병렬 실행

`await`를 연달아 쓰면 앞 작업이 **끝나야** 다음 작업이 **시작**됩니다. 작업끼리 서로 결과가 필요 없는데도 이렇게 쓰면 시간이 낭비됩니다.

```ts
function delay<T>(ms: number, value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}
const loadMenu = () => delay(300, ['아메리카노', '라테', '모카'])
const loadStock = () => delay(200, 42)
const loadStore = () => delay(100, { storeName: '강남점' })

// 순차: 300 + 200 + 100 = 약 600ms
async function sequential(): Promise<void> {
  const start = Date.now()
  const menus = await loadMenu()
  const stock = await loadStock()
  const store = await loadStore()
  console.log(`[순차] ${Date.now() - start}ms`, store.storeName, menus.length, stock)
}

// 병렬: 가장 오래 걸리는 300ms
async function parallel(): Promise<void> {
  const start = Date.now()
  const [menus, stock, store] = await Promise.all([loadMenu(), loadStock(), loadStore()])
  console.log(`[병렬] ${Date.now() - start}ms`, store.storeName, menus.length, stock)
}

async function main(): Promise<void> {
  await sequential()
  await parallel()
}
main()
```

```text
[순차] 614ms 강남점 3 42
[병렬] 307ms 강남점 3 42
```

(밀리초 숫자는 실행할 때마다 조금씩 다릅니다.) 같은 결과를 **절반 시간**에 얻었습니다. 화면 하나를 열 때 API를 5개씩 부르는 일은 흔하므로, 이 차이는 사용자가 바로 느낍니다.

```text
순차   메뉴 ███████████████
       재고                ██████████
       매장                          █████        → 약 600ms

병렬   메뉴 ███████████████
       재고 ██████████
       매장 █████                                  → 약 300ms
```

::: tip 순차와 병렬을 고르는 기준
**뒤 작업이 앞 작업의 결과를 쓰는가?**
- 쓴다 → 순차(`await` 연달아). 예: 회원 조회 → 그 회원의 장바구니 조회
- 안 쓴다 → 병렬(`Promise.all`). 예: 메뉴 목록, 재고, 매장 정보
:::

Promise는 **만드는 순간 작업이 시작**된다는 점도 기억해 두세요. 아래처럼 먼저 Promise를 만들어 두고 나중에 `await`해도 병렬로 실행됩니다.

```ts
const menuPromise = delay(300, ['아메리카노']) // 지금 시작
const stockPromise = delay(200, 42)           // 지금 시작
const menus = await menuPromise               // 300ms 기다림
const stock = await stockPromise              // 이미 끝나 있음
// 전체 약 300ms
```

다만 이 방식은 `menuPromise`를 기다리는 동안 `stockPromise`가 실패하면 처리되지 않은 거부 경고가 날 수 있어서, 보통은 `Promise.all`을 씁니다.

### 5단계: try/catch로 비동기 오류 잡기

`await`한 Promise가 거부되면, 그 자리에서 **`throw`된 것처럼** 동작합니다. 그래서 동기 코드와 똑같이 `try/catch`로 잡습니다.

```ts
async function checkoutZero(): Promise<void> {
  try {
    const payment = await pay(0) // 거부됨 → 여기서 catch로 점프
    console.log('승인:', payment.approvalNo) // 실행되지 않음
  } catch (error) {
    // error의 타입은 unknown — 무엇이 던져졌는지 알 수 없으므로 좁혀서 씁니다.
    if (error instanceof Error) {
      console.log('결제 실패:', error.message)
    }
  } finally {
    console.log('로딩 표시 끔')
  }
}
// 출력: 결제 실패: 결제 금액이 0원 이하입니다
//       로딩 표시 끔
```

`catch (error)`의 `error`는 `strict` 모드에서 `unknown`입니다(`useUnknownInCatchVariables` 옵션, TypeScript 4.4부터 `strict`에 포함). Part 1에서 배운 대로 `instanceof Error`로 좁혀 씁니다.

#### return과 return await의 차이

`try` 블록 안에서 Promise를 `await` 없이 바로 `return`하면, 그 Promise의 실패는 **이 함수의 catch에 잡히지 않습니다.**

```ts
async function payWithoutAwait(amount: number): Promise<string> {
  try {
    return pay(amount).then((p) => p.approvalNo) // await 없음
  } catch {
    return '여기로 오지 않습니다'
  }
}

async function payWithAwait(amount: number): Promise<string> {
  try {
    return await pay(amount).then((p) => p.approvalNo) // await 있음
  } catch {
    return '결제 실패 → 현금 결제로 전환'
  }
}

async function main(): Promise<void> {
  console.log(await payWithAwait(0))
  try {
    console.log(await payWithoutAwait(0))
  } catch (error) {
    console.log('바깥에서 잡힘:', error instanceof Error ? error.message : error)
  }
}
main()
```

```text
결제 실패 → 현금 결제로 전환
바깥에서 잡힘: 결제 금액이 0원 이하입니다
```

`await` 없이 `return`하면 Promise를 그대로 넘기고 `try` 블록을 **이미 빠져나간** 뒤에 실패가 일어납니다. **`try` 안에서는 `return await`** 로 쓰세요. (`catch { ... }`처럼 괄호 없이 쓰는 형태는 ES2019부터 가능하며, 오류 값을 쓰지 않을 때 씁니다.)

### 6단계: 처리되지 않은 거부(unhandled rejection)

`async` 함수를 부르기만 하고 `await`도 `.catch()`도 하지 않으면, 그 안에서 난 오류를 아무도 받지 않습니다.

```ts
async function savePoint(): Promise<void> {
  throw new Error('포인트 서버 오류')
}

function onPayButton(): void {
  savePoint() // 결과를 아무도 기다리지 않음
  console.log('결제 완료 화면 표시')
}
onPayButton()
```

```text
결제 완료 화면 표시
(오류 위치 표시)
Error: 포인트 서버 오류
    at savePoint (...)
Node.js v24.13.1
```

Node.js 15부터 처리되지 않은 거부는 **프로그램을 종료**시킵니다. 서버 프로그램이라면 다른 손님의 요청까지 모두 끊깁니다. 브라우저는 종료되지 않지만 콘솔에 `Uncaught (in promise)` 오류가 남고, 사용자는 실패를 모른 채 지나갑니다.

고치는 방법은 두 가지입니다.

```ts
// 방법 1: 기다릴 수 있는 곳이면 await + try/catch
async function onPayButton1(): Promise<void> {
  try {
    await savePoint()
  } catch (error) {
    console.log('포인트 적립 실패:', error instanceof Error ? error.message : error)
  }
  console.log('결제 완료 화면 표시')
}

// 방법 2: 기다리지 않아도 되는 일이면(일부러 백그라운드로 돌림) .catch를 붙임
function onPayButton2(): void {
  savePoint().catch((error: unknown) => {
    console.log('포인트 적립 실패(결제는 유지):', error instanceof Error ? error.message : error)
  })
  console.log('결제 완료 화면 표시')
}
```

```text
결제 완료 화면 표시
포인트 적립 실패(결제는 유지): 포인트 서버 오류
```

::: warning 바깥 try/catch는 await가 없으면 소용없습니다
```ts
try {
  savePoint() // await 없음 → Promise만 받고 try 블록을 빠져나감
} catch {
  console.log('잡았다') // 실행되지 않음 → 처리되지 않은 거부로 종료
}
```
4-1 레슨 "실수 2"의 `setTimeout` + `try/catch`와 같은 이유입니다. 오류가 나는 시점에 `try` 블록이 이미 끝나 있습니다.
:::

::: tip 린터의 도움 받기
"Promise를 만들고 아무것도 하지 않은 코드"는 사람 눈으로 찾기 어렵습니다. typescript-eslint의 `no-floating-promises` 규칙을 켜면 이런 코드를 자동으로 찾아 줍니다. [ESLint 레슨](../part6-tooling/04-eslint-prettier)에서 설정합니다.
:::

### 7단계: top-level await (ES 모듈 전용)

`await`는 원래 `async` 함수 안에서만 쓸 수 있습니다. 그래서 프로그램 시작 부분에서 `await`를 쓰려면 `async function main() {...}`을 만들어 부르곤 했습니다. **ES 모듈** 파일에서는 맨 바깥(최상위, top level)에서 바로 `await`를 쓸 수 있습니다. ES2022 기능입니다.

```ts
// main.mts (또는 package.json에 "type": "module"이 있는 프로젝트의 .ts)
function loadConfig(): Promise<{ storeName: string }> {
  return new Promise((resolve) => setTimeout(() => resolve({ storeName: '강남점' }), 100))
}

const config = await loadConfig()
console.log(`${config.storeName} POS 시작`)
// 출력: 강남점 POS 시작
```

조건이 두 가지입니다.

1. 파일이 **모듈**이어야 합니다. `import`나 `export`가 하나도 없는 파일은 TypeScript가 모듈로 보지 않습니다.

```text
❌ 'await' expressions are only allowed at the top level of a file when that file is a module,
   but this file has no imports or exports. Consider adding an empty 'export {}' to make this file a module. (TS1375)
```

2. tsconfig의 `module` 옵션이 `es2022`, `esnext`, `node16`, `nodenext`, `preserve` 중 하나이고 `target`이 `es2017` 이상이어야 합니다. CommonJS(`module: "commonjs"`)로 컴파일하면 쓸 수 없습니다.

```text
❌ Top-level 'await' expressions are only allowed when the 'module' option is set to 'es2022', 'esnext', 'system',
   'node16', 'nodenext', or 'preserve', and the 'target' option is set to 'es2017' or higher. (TS1378)
```

ESM과 CommonJS의 차이는 [모듈 시스템 레슨](../part6-tooling/03-module-systems)에서 자세히 다룹니다. 지금은 "top-level await는 ES 모듈에서만"이라고 기억하면 됩니다. 이 레슨의 다른 예제는 어느 쪽에서도 돌아가도록 `main()` 함수 안에 `await`를 넣었습니다.

### 8단계: 반복문 안의 await

여러 매장에 매출을 전송한다고 해 보겠습니다. `for...of` 안에서 `await`를 쓰면 **한 번에 하나씩** 순서대로 처리됩니다.

```ts
function sendSale(store: string): Promise<string> {
  return new Promise((resolve) => setTimeout(() => {
    console.log(`  ${store} 전송 끝`)
    resolve(`${store} OK`)
  }, 200))
}
const stores = ['강남점', '홍대점', '부산점']

// 하나씩: 200 × 3 = 약 600ms
async function sendOneByOne(): Promise<void> {
  const results: string[] = []
  for (const store of stores) {
    results.push(await sendSale(store))
  }
  console.log('[for...of + await]', results)
}

// 한꺼번에: 약 200ms
async function sendAll(): Promise<void> {
  const results = await Promise.all(stores.map((store) => sendSale(store)))
  console.log('[Promise.all + map]', results)
}
```

```text
  강남점 전송 끝
  홍대점 전송 끝
  부산점 전송 끝
[for...of + await] [ '강남점 OK', '홍대점 OK', '부산점 OK' ]     ← 약 600ms
  강남점 전송 끝
  홍대점 전송 끝
  부산점 전송 끝
[Promise.all + map] [ '강남점 OK', '홍대점 OK', '부산점 OK' ]    ← 약 200ms
```

`stores.map((store) => sendSale(store))`는 Promise 3개를 **한꺼번에 만들어(= 동시에 시작해)** 배열로 돌려주고, `Promise.all`이 그 배열을 기다립니다. 실무에서 가장 많이 쓰는 패턴입니다.

그렇다고 반복문 안 `await`가 항상 틀린 것은 아닙니다.

| 상황 | 쓸 방법 |
|---|---|
| 순서가 중요하다(1번 전표가 저장돼야 2번 전표를 저장) | `for...of` + `await` |
| 앞 결과에 따라 멈춰야 한다(재고가 바닥나면 중단) | `for...of` + `await` |
| 서버가 동시 요청을 제한한다 | 몇 개씩 묶어서 `Promise.all` (문제 6) |
| 서로 독립적이고 빨리 끝나야 한다 | `Promise.all` + `map` |

### 9단계: forEach + async 함정

반복문 안 `await`를 피하려다 가장 흔히 빠지는 함정입니다.

```ts
async function closeDay(): Promise<void> {
  const results: string[] = []
  stores.forEach(async (store) => {
    const r = await sendSale(store)
    results.push(r)
  })
  console.log('마감 완료, 전송 결과:', results)
}
closeDay()
// 출력: 마감 완료, 전송 결과: []
```

결과가 비어 있습니다. 이유는 이렇습니다.

1. `forEach`는 콜백이 돌려주는 값을 **무시합니다.** `async` 콜백이 돌려주는 Promise도 그냥 버립니다.
2. 그래서 `forEach`는 각 콜백이 첫 `await`에서 멈추자마자 다음으로 넘어가고, 곧바로 끝납니다.
3. `console.log`가 실행되는 시점에는 전송이 하나도 끝나지 않았습니다.
4. 게다가 콜백 안에서 오류가 나면 아무도 받지 않아 처리되지 않은 거부가 됩니다.

TypeScript도 이 코드를 막지 못합니다. `forEach`의 콜백 타입이 "반환값을 무시하는 함수(`void`)"라서 Promise를 돌려줘도 문법상 문제가 없기 때문입니다.

```ts
// 고친 코드: 순서대로 필요하면 for...of, 동시에 하려면 Promise.all + map
async function closeDay(): Promise<void> {
  const results = await Promise.all(stores.map((store) => sendSale(store)))
  console.log('마감 완료, 전송 결과:', results)
}
// 출력: 마감 완료, 전송 결과: [ '강남점 OK', '홍대점 OK', '부산점 OK' ]
```

::: warning filter·reduce·some에도 async 콜백을 넘기지 마세요
`['P001', 'P002'].filter(async (code) => code === 'P001')`의 결과는 `['P001', 'P002']`입니다. `async` 콜백은 항상 Promise(객체 = 참으로 취급되는 값)를 돌려주므로 모든 요소가 통과합니다. 비동기 조건으로 거르려면 먼저 `Promise.all`로 결과를 모은 뒤 동기 `filter`를 씁니다.
:::

### 10단계: `Awaited<T>` — await한 결과의 타입

`Awaited<T>`는 "`T`를 `await`했을 때 나오는 타입"을 계산하는 내장 유틸리티 타입입니다. TypeScript 4.5부터 있습니다.

```ts
type A = Awaited<Promise<string>>          // string
type B = Awaited<Promise<Promise<number>>> // number — 겹친 Promise도 끝까지 풉니다
type C = Awaited<boolean>                  // boolean — Promise가 아니면 그대로
```

가장 많이 쓰는 곳은 **async 함수의 결과 타입을 따로 선언하지 않고 뽑아낼 때**입니다.

```ts
async function getMemberInfo() {
  return { id: 'M001', name: '김하나', point: 1200 }
}

// ReturnType만 쓰면 Promise<{...}>, Awaited로 한 겹 벗깁니다.
type MemberInfo = Awaited<ReturnType<typeof getMemberInfo>>
// { id: string; name: string; point: number }

const bad: MemberInfo = { id: 'M002', name: '이두리' }
// ❌ Property 'point' is missing in type '{ id: string; name: string; }' but required in type '{ id: string; name: string; point: number; }'. (TS2741)
```

`Promise.all`의 결과 타입도 내부적으로 `Awaited`를 써서 계산됩니다. 그래서 4단계의 `[menus, stock, store]`가 정확한 튜플로 추론된 것입니다.

## 자주 하는 실수

### 실수 1: await를 빠뜨린다

```ts
async function showPoint(): Promise<void> {
  const point = getPoint() // await 빠짐 → point: Promise<number>
  console.log(`적립금 ${point}원`)
}
// 출력: 적립금 [object Promise]원
```

**왜 틀렸나:** `getPoint()`는 Promise(상자)를 돌려줍니다. 템플릿 문자열에 넣으면 상자 자체가 문자열로 바뀌어 `[object Promise]`가 찍힙니다. 문자열로 바꾸는 곳에서는 TypeScript가 오류를 내지 않아서 더 위험합니다.

```ts
// 고친 코드
async function showPoint(): Promise<void> {
  const point = await getPoint()
  console.log(`적립금 ${point}원`)
}
// 출력: 적립금 1200원
```

### 실수 2: 서로 관계없는 작업을 순차로 기다린다

```ts
async function openStore(): Promise<void> {
  const menus = await loadMenu()   // 300ms
  const stock = await loadStock()  // 200ms — 메뉴 결과가 필요 없는데 기다림
  const store = await loadStore()  // 100ms
  // 합계 약 600ms
}
```

**왜 틀렸나:** 세 작업은 서로의 결과를 쓰지 않습니다. 순서대로 기다릴 이유가 없습니다.

```ts
// 고친 코드: 약 300ms
async function openStore(): Promise<void> {
  const [menus, stock, store] = await Promise.all([loadMenu(), loadStock(), loadStore()])
}
```

### 실수 3: forEach에 async 콜백을 넘긴다

9단계에서 본 대로입니다. `forEach`는 Promise를 기다리지 않습니다.

```ts
// ❌ 끝나기를 기다리지 않음
stores.forEach(async (store) => { await sendSale(store) })

// ✅ 하나씩 순서대로
for (const store of stores) {
  await sendSale(store)
}

// ✅ 한꺼번에
await Promise.all(stores.map((store) => sendSale(store)))
```

### 실수 4: async 함수를 부르고 결과를 버린다

```ts
function onSubmit(): void {
  saveOrder() // 실패해도 아무도 모름 → 처리되지 않은 거부
  showToast('저장되었습니다') // 실패해도 성공 메시지가 뜸!
}
```

**왜 틀렸나:** 저장이 끝나기도 전에, 그리고 실패했는데도 "저장되었습니다"가 뜹니다.

```ts
// 고친 코드
async function onSubmit(): Promise<void> {
  try {
    await saveOrder()
    showToast('저장되었습니다')
  } catch (error) {
    showToast('저장에 실패했습니다')
  }
}
```

### 실수 5: try 안에서 return await를 빼먹는다

5단계에서 본 대로, `try` 블록 안에서 `return promise`라고만 쓰면 그 실패는 이 함수의 `catch`를 건너뜁니다. `try` 안에서는 `return await promise`로 씁니다.

## 직접 해 보기

### 문제 1 ⭐ then 체인을 async/await로

아래 코드를 `async function checkout(): Promise<void>`로 바꾸고, 실패하면 `실패: 메시지`를 출력하세요.

```ts
function getCart(): Promise<{ total: number }> {
  return Promise.resolve({ total: 9500 })
}
function pay(amount: number): Promise<string> {
  return new Promise((resolve, reject) =>
    setTimeout(() => (amount > 0 ? resolve(`${amount}원 승인`) : reject(new Error('금액 오류'))), 100),
  )
}

getCart()
  .then((cart) => pay(cart.total))
  .then((result) => console.log('결제 결과:', result))
  .catch((error: unknown) => console.log('실패:', error instanceof Error ? error.message : error))
```

::: details 정답 보기
```ts
async function checkout(): Promise<void> {
  try {
    const cart = await getCart()
    const result = await pay(cart.total)
    console.log('결제 결과:', result)
  } catch (error) {
    console.log('실패:', error instanceof Error ? error.message : error)
  }
}

checkout()
// 출력: 결제 결과: 9500원 승인
```
:::

### 문제 2 ⭐ 반환 타입 맞히기

각 함수의 반환 타입을 적어 보세요.

```ts
async function a() { return 4500 }
async function b() { }
async function c(ok: boolean) {
  if (!ok) throw new Error('실패')
  return '성공'
}
```

::: details 정답 보기
- `a`: `Promise<number>`
- `b`: `Promise<void>`
- `c`: `Promise<string>` — `throw`는 반환 타입에 영향을 주지 않습니다. 실패 이유의 타입은 `Promise<T>`에 적히지 않는다는 지난 레슨 내용과 같습니다.
:::

### 문제 3 ⭐⭐ 주문 화면 로딩 빠르게 만들기

아래 함수는 약 900ms가 걸립니다. 쿠폰 조회에는 회원 ID가 필요하지만 상품 조회는 회원과 관계없습니다. 결과는 같게 유지하면서 시간을 줄여 보세요.

```ts
function delay<T>(ms: number, value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}
const getMember = (id: string) => delay(300, { id, name: '김하나', grade: 'VIP' })
const getProducts = () => delay(400, [{ name: '아메리카노', price: 4500 }])
const getCoupons = (memberId: string) => delay(200, [`${memberId}-10%할인`])

async function loadOrderPage(memberId: string): Promise<void> {
  const member = await getMember(memberId)
  const products = await getProducts()
  const coupons = await getCoupons(member.id)
  console.log(member.name, products.length, coupons)
}
```

::: details 정답 보기
```ts
async function loadOrderPage(memberId: string): Promise<void> {
  // 회원과 상품은 서로 관계없으므로 동시에
  const [member, products] = await Promise.all([getMember(memberId), getProducts()])
  // 쿠폰은 회원 ID가 필요하므로 회원 조회 뒤에
  const coupons = await getCoupons(member.id)
  console.log(member.name, products.length, coupons)
}
// 출력: 김하나 1 [ 'M001-10%할인' ]
```
`max(300, 400) + 200` = 약 600ms로 줄어듭니다(직접 재 보면 900ms → 600ms). 더 줄이려면 `getMember(...).then((m) => getCoupons(m.id))`를 `getProducts()`와 함께 `Promise.all`에 넣어 `max(300 + 200, 400)` = 500ms로 만들 수도 있습니다.
:::

### 문제 4 ⭐⭐ forEach 버그 고치기

9단계의 `closeDay` 함수가 전송 결과를 모두 모은 뒤 출력하도록 고치세요. 세 매장은 동시에 전송해도 됩니다.

::: details 정답 보기
```ts
async function closeDay(): Promise<void> {
  const results = await Promise.all(stores.map((store) => sendSale(store)))
  console.log('마감 완료, 전송 결과:', results)
}
closeDay()
// 출력: 마감 완료, 전송 결과: [ '강남점 OK', '홍대점 OK', '부산점 OK' ]
```
:::

### 문제 5 ⭐⭐⭐ 재시도 함수 만들기

카드사 서버가 가끔 응답하지 않습니다. 실패하면 `intervalMs`만큼 쉬었다가 최대 `times`번까지 다시 시도하는 제네릭 함수 `retry<T>(task: () => Promise<T>, times: number, intervalMs = 100): Promise<T>`를 만드세요. 모두 실패하면 마지막 오류로 거부합니다. 시도마다 `N번째 시도 실패`를 출력합니다.

```ts
let calls = 0
function unstableApprove(): Promise<string> {
  calls += 1
  // 처음 두 번은 실패, 세 번째에 성공
  return calls < 3 ? Promise.reject(new Error('카드사 응답 없음')) : Promise.resolve('승인번호 12345678')
}
```

::: details 정답 보기
```ts
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function retry<T>(task: () => Promise<T>, times: number, intervalMs = 100): Promise<T> {
  let lastError: unknown
  for (let attempt = 1; attempt <= times; attempt++) {
    try {
      return await task() // await가 있어야 실패가 이 catch로 옵니다(5단계).
    } catch (error) {
      lastError = error
      console.log(`${attempt}번째 시도 실패`)
      if (attempt < times) await wait(intervalMs)
    }
  }
  throw lastError
}

async function main(): Promise<void> {
  try {
    const result = await retry(unstableApprove, 5)
    console.log('결과:', result)
  } catch (error) {
    console.log('최종 실패:', error instanceof Error ? error.message : error)
  }
}
main()
```
```text
1번째 시도 실패
2번째 시도 실패
결과: 승인번호 12345678
```
- `task`를 Promise가 아니라 **Promise를 만드는 함수**로 받는 점이 핵심입니다. Promise는 만드는 순간 시작되고 결과가 한 번 정해지면 바뀌지 않으므로, 다시 시도하려면 매번 새로 만들어야 합니다.
- 순서가 중요한 일(앞 시도가 끝나야 다음 시도)이라 반복문 안 `await`가 맞는 경우입니다.
:::

### 문제 6 ⭐⭐⭐ 두 개씩 묶어서 전송하기

서버가 동시에 두 요청까지만 받는다고 합니다. 매장 목록을 `size`개씩 묶어, 한 묶음 안에서는 동시에, 묶음끼리는 순서대로 전송하는 `sendInChunks(stores: string[], size: number): Promise<string[]>`를 만드세요. 5개 매장을 2개씩 보내면 약 600ms가 걸려야 합니다(전송 하나는 200ms).

::: details 정답 보기
```ts
async function sendInChunks(stores: string[], size: number): Promise<string[]> {
  const results: string[] = []
  for (let i = 0; i < stores.length; i += size) {
    const chunk = stores.slice(i, i + size)            // 이번 묶음
    const chunkResults = await Promise.all(chunk.map((s) => sendSale(s))) // 묶음 안은 동시에
    results.push(...chunkResults)
    console.log(`${i / size + 1}번째 묶음 완료:`, chunk.join(', '))
  }
  return results
}

async function main(): Promise<void> {
  const results = await sendInChunks(['강남점', '홍대점', '부산점', '대구점', '광주점'], 2)
  console.log(results.length, '건')
}
main()
```
```text
1번째 묶음 완료: 강남점, 홍대점
2번째 묶음 완료: 부산점, 대구점
3번째 묶음 완료: 광주점
5 건
```
묶음 3개 × 200ms = 약 600ms입니다. "순차"와 "병렬"을 섞어 쓰는 실무 패턴입니다.
:::

## 확인 퀴즈

1. `async function f() { return 10 }`을 부르면 무엇을 돌려받습니까?
2. `await`한 Promise가 거부되면 어떤 일이 일어납니까?
3. 서로 관계없는 API 세 개를 `await`로 연달아 부르는 것과 `Promise.all`로 부르는 것의 차이는 무엇입니까?
4. `array.forEach(async (x) => { await ... })` 다음 줄의 코드는 모든 작업이 끝난 뒤에 실행됩니까?
5. top-level await를 쓰려면 파일이 어떤 조건을 만족해야 합니까?

::: details 정답 보기
1. `10`으로 이행된 `Promise<number>`입니다.
2. 그 자리에서 오류가 `throw`된 것처럼 동작합니다. 감싸는 `try/catch`가 있으면 `catch`로 가고, 없으면 그 `async` 함수가 돌려준 Promise가 거부됩니다.
3. 연달아 `await`하면 걸리는 시간이 합해지고(순차), `Promise.all`은 동시에 시작해 가장 오래 걸리는 것만큼만 걸립니다(병렬).
4. 아닙니다. `forEach`는 콜백이 돌려준 Promise를 기다리지 않으므로 다음 줄이 먼저 실행됩니다.
5. ES 모듈이어야 하고(`import`/`export`가 있는 파일), `module` 옵션이 `es2022`·`esnext`·`nodenext` 등이고 `target`이 `es2017` 이상이어야 합니다.
:::

## 정리

- `async` 함수 안에서 `await 프로미스`를 쓰면 Promise의 값을 꺼내 동기 코드처럼 위에서 아래로 쓸 수 있습니다. 내부 동작은 여전히 Promise와 마이크로태스크입니다.
- `async` 함수는 항상 `Promise<T>`를 돌려줍니다. `return`은 이행, `throw`는 거부가 됩니다.
- 거부된 Promise를 `await`하면 `throw`처럼 동작하므로 `try/catch/finally`로 처리합니다. `try` 안에서는 `return await`를 씁니다.
- 결과를 기다리지도 `.catch()`하지도 않은 Promise는 처리되지 않은 거부를 만듭니다. Node.js에서는 프로그램이 종료됩니다.
- 서로 관계없는 작업은 `Promise.all`로 병렬 실행합니다. 반복문에서는 `for...of` + `await`(순서대로) 또는 `Promise.all` + `map`(동시에)을 쓰고, `forEach` + `async`는 쓰지 않습니다.
- top-level await는 ES 모듈에서만 쓸 수 있습니다. `Awaited<T>`로 await한 결과 타입을 뽑습니다.

## 다음 단계

[fetch로 API 호출하고 응답에 타입 붙이기](./04-fetch-api) — 지금까지 `setTimeout`으로 흉내 낸 "서버"를 진짜 서버로 바꿉니다. `fetch`로 REST API를 호출하고, 응답에 타입을 붙이는 공통 함수와 타임아웃 처리를 만듭니다.
