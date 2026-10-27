---
title: 스코프와 클로저
---

# 스코프와 클로저

<LessonMeta level="입문" :minutes="50" prev="문자열을 자르고 바꾸고, 템플릿 리터럴로 영수증을 출력했습니다." />

## 이번에 배울 것

- **스코프**(변수가 보이는 범위)를 전역·함수·블록 세 가지로 구분할 수 있다.
- **스코프 체인**에 따라 변수를 찾는 순서와 **섀도잉**을 설명할 수 있다.
- **호이스팅**과 **TDZ**(일시적 사각지대)가 무엇이고, `var`가 왜 반복문 + `setTimeout`에서 문제를 일으키는지 설명할 수 있다.
- **클로저**로 카운터와 주문번호 생성기를 만들 수 있다.
- 클로저가 실무에서 쓰이는 곳(상태 숨기기, 함수 공장, 이벤트 처리 등)을 예로 들 수 있다.

## 먼저 알아 둘 것

- [값과 변수](./01-values-and-variables) — `let`, `const`, `var`를 쓰지 않는 이유
- [함수 기초](./06-functions) — 함수 선언과 호출, 함수를 값으로 다루기, 콜백

## 비유로 이해하기

대형 쇼핑몰을 떠올려 봅시다.

```text
┌─────────────────────── 쇼핑몰 (전역) ───────────────────────┐
│  안내 방송: "영업시간은 22시까지"                            │
│                                                             │
│   ┌──────── 카페 매장 (함수) ────────┐   ┌─── 편의점 ───┐   │
│   │  매장 공지: "라떼 1+1"           │   │  매장 공지   │   │
│   │                                  │   │  "삼각김밥   │   │
│   │   ┌── 주방 (블록) ──┐           │   │   할인"      │   │
│   │   │ 주방 메모:       │           │   └──────────────┘   │
│   │   │ "우유 2팩 남음" │           │                      │
│   │   └─────────────────┘           │                      │
│   └──────────────────────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

- **쇼핑몰 안내 방송**은 쇼핑몰 어디서나 들립니다. → **전역 스코프**
- **카페 매장 공지**는 카페 안에서만 보입니다. 편의점 직원은 모릅니다. → **함수 스코프**
- **주방 메모**는 주방 안에서만 보입니다. 카페 홀에서도 안 보입니다. → **블록 스코프**
- 주방에 있는 직원은 주방 메모, 매장 공지, 안내 방송을 **모두** 볼 수 있습니다. 안쪽에서는 바깥이 보이지만, 바깥에서는 안쪽이 보이지 않습니다. → **스코프 체인**

그리고 카페가 문을 닫아도(함수 실행이 끝나도) 카페가 발급한 **스탬프 카드**에는 카페의 도장 개수 기록이 계속 남아 있습니다. 이것이 **클로저**입니다.

## 개념 설명

### 스코프란

**스코프**(scope, 범위)는 "**변수를 어디서 쓸 수 있는가**"를 정하는 규칙입니다. 변수는 선언된 위치에 따라 보이는 범위가 정해집니다.

```ts
const storeName = '한빛 카페' // 전역 스코프

function printNotice() {
  const notice = '라떼 1+1' // 함수 스코프
  console.log(storeName, notice)
}

printNotice()      // 출력: 한빛 카페 라떼 1+1
console.log(notice)
// ❌ Cannot find name 'notice'. (TS2304)
```

`notice`는 `printNotice` 함수 안에서 만들었으므로 함수 밖에서는 존재하지 않습니다. 반대로 함수 안에서는 바깥의 `storeName`을 쓸 수 있습니다.

### 세 가지 스코프

#### 전역 스코프

어떤 함수나 블록에도 속하지 않은 맨 바깥에서 선언한 변수입니다. 프로그램 어디서나 보입니다.

::: warning 전역 변수는 최소한으로
전역 변수는 어디서나 읽고 바꿀 수 있어 편해 보이지만, 그만큼 **어디서 바뀌었는지 추적하기 어렵습니다.** 파일이 많아지면 이름이 부딪히기도 합니다. 꼭 필요한 설정값 정도만 전역에 두세요. 참고로 TypeScript에서 파일에 `import`/`export`가 하나라도 있으면 그 파일은 **모듈**이 되어, 맨 바깥 변수도 그 파일 안에서만 보입니다([모듈](../part3-intermediate/09-modules)).
:::

#### 함수 스코프

함수 안에서 선언한 변수와 매개변수는 그 함수 안에서만 보입니다. 함수가 호출될 때마다 **새로** 만들어지고, 함수가 끝나면 (보통은) 사라집니다.

```ts
function calculateTotal(price: number, quantity: number) {
  const subtotal = price * quantity // 호출할 때마다 새로 만들어짐
  return subtotal
}

console.log(calculateTotal(4500, 2)) // 출력: 9000
console.log(calculateTotal(5000, 1)) // 출력: 5000
```

두 번의 호출에서 `subtotal`은 서로 다른 변수입니다. 그래서 다른 함수에서 같은 이름 `subtotal`을 써도 부딪히지 않습니다. 함수가 변수를 가두는 울타리 역할을 하는 것입니다.

#### 블록 스코프

중괄호 `{ }`로 감싼 영역을 **블록**이라고 합니다. `if`, `for`, `while`의 중괄호도 블록입니다. `let`과 `const`는 **블록 스코프**를 가집니다. 즉, 선언한 블록 안에서만 보입니다.

```ts
const orderAmount = 35000

if (orderAmount >= 30000) {
  const freeShippingMessage = '무료 배송 대상입니다.'
  console.log(freeShippingMessage) // 출력: 무료 배송 대상입니다.
}

console.log(freeShippingMessage)
// ❌ Cannot find name 'freeShippingMessage'. (TS2304)
```

`for`문의 `let i`도 반복문 블록 안에서만 살아 있습니다.

```ts
for (let i = 0; i < 2; i++) {
  console.log(i)
}
console.log(i)
// ❌ Cannot find name 'i'. (TS2304)
```

| 스코프 | 만들어지는 곳 | 보이는 범위 |
|---|---|---|
| 전역 | 맨 바깥 | 어디서나 |
| 함수 | 함수 본문, 매개변수 | 그 함수 안 |
| 블록 | `{ }` 안의 `let`·`const` | 그 블록 안 |

::: tip 변수는 필요한 곳에 가장 가깝게
변수는 **쓰는 곳에 가장 가까운, 가장 좁은 스코프**에 선언하세요. 범위가 좁을수록 그 변수를 바꿀 수 있는 코드가 적어서 버그를 찾기 쉽습니다.
:::

### 스코프 체인: 안에서 밖으로 찾아 나간다

변수를 쓰면 JavaScript는 **현재 스코프부터 찾아보고, 없으면 한 단계 바깥으로** 나가며 찾습니다. 전역까지 가도 없으면 오류입니다. 이 연결 고리를 **스코프 체인**(scope chain)이라고 합니다.

```ts
const mallNotice = '영업시간은 22시까지'          // 전역

function cafe() {
  const storeNotice = '라떼 1+1'                 // cafe 함수 스코프

  function kitchen() {
    const memo = '우유 2팩 남음'                  // kitchen 함수 스코프
    console.log(memo)        // 1단계: kitchen에서 찾음
    console.log(storeNotice) // 2단계: kitchen에 없음 → cafe에서 찾음
    console.log(mallNotice)  // 3단계: cafe에도 없음 → 전역에서 찾음
  }

  kitchen()
}

cafe()
```

```text
우유 2팩 남음
라떼 1+1
영업시간은 22시까지
```

```text
kitchen 스코프  ──(없으면)──▶  cafe 스코프  ──(없으면)──▶  전역 스코프  ──(없으면)──▶  오류
```

중요한 점은 이 체인이 **코드를 작성한 위치**로 정해진다는 것입니다. 함수를 어디서 호출했는지가 아니라 **어디에 적었는지**가 기준입니다. 이것을 **렉시컬 스코프**(lexical scope, 코드에 적힌 위치 기준 스코프)라고 합니다. 뒤에 나올 클로저를 이해하는 열쇠입니다.

### 섀도잉: 안쪽 이름이 바깥 이름을 가린다

안쪽 스코프에서 바깥과 **같은 이름**으로 변수를 선언하면, 안쪽에서는 안쪽 변수만 보입니다. 바깥 변수가 그림자에 가려진 것 같다고 해서 **섀도잉**(shadowing)이라고 합니다.

```ts
const discountRate = 0.05 // 전역: 기본 할인율

function vipPrice(price: number) {
  const discountRate = 0.2 // 함수 안: 바깥 discountRate를 가림
  return price - price * discountRate
}

console.log(vipPrice(10000)) // 출력: 8000   ← 안쪽 0.2 사용
console.log(discountRate)    // 출력: 0.05   ← 바깥은 그대로
```

섀도잉은 문법상 허용되지만, **같은 이름이 두 가지 뜻**을 갖게 되어 읽는 사람을 헷갈리게 합니다. 실수로 바깥 변수를 바꾸려다 안쪽에 새 변수를 만드는 버그도 생깁니다. 가능하면 `vipDiscountRate`처럼 다른 이름을 쓰세요. ESLint 같은 도구로 섀도잉을 경고하게 설정할 수도 있습니다([ESLint와 Prettier](../part6-tooling/04-eslint-prettier)).

### 호이스팅과 TDZ

**호이스팅**(hoisting, 끌어올림)은 JavaScript가 코드를 실행하기 전에 **선언을 먼저 훑어서 준비해 두는** 동작입니다. 마치 선언이 스코프 맨 위로 끌어올려진 것처럼 보여서 붙은 이름입니다. 선언 종류마다 결과가 다릅니다.

#### 함수 선언문: 선언 전에 호출 가능

[함수 기초](./06-functions)에서 봤듯이 함수 선언문은 통째로 준비되므로 위에서 불러도 됩니다.

```ts
console.log(formatWon(4500)) // 출력: 4500원

function formatWon(amount: number) {
  return amount + '원'
}
```

#### let · const: TDZ 때문에 선언 전 사용 불가

`let`과 `const`도 사실 호이스팅은 되지만, **선언문에 도달하기 전까지는 접근할 수 없는 구간**에 놓입니다. 이 구간을 **TDZ**(Temporal Dead Zone, 일시적 사각지대)라고 합니다.

```ts
function openStore() {
  // ── 여기부터 ────────────── stock의 TDZ (접근하면 오류)
  console.log(stock)
  // ── 여기까지 ──────────────
  let stock = 10
  console.log(stock)
}
// ❌ Block-scoped variable 'stock' used before its declaration. (TS2448)
// ❌ Variable 'stock' is used before being assigned. (TS2454)
```

TypeScript가 실행 전에 막아 줍니다. 무시하고 실행하면 `ReferenceError: Cannot access 'stock' before initialization` 실행 오류가 납니다. "선언 전에 쓰면 오류"라는 당연해 보이는 규칙을 지키게 해 주는 것이 TDZ입니다.

#### var: 선언 전에 쓰면 조용히 undefined

`var`는 호이스팅되면서 `undefined`로 미리 초기화됩니다. 그래서 선언 전에 써도 오류 없이 `undefined`가 나옵니다.

```ts
function openStore() {
  console.log(stock) // 출력: undefined  (실행 오류가 아님!)
  var stock = 10
  console.log(stock) // 출력: 10
}
openStore()
// ❌ Variable 'stock' is used before being assigned. (TS2454)
```

이렇게 단순한 경우는 TypeScript가 경고해 주지만, JavaScript 자체는 오류 없이 실행됩니다. 오류가 나야 할 곳에서 조용히 `undefined`로 진행되니, 코드가 복잡해져 TypeScript도 흐름을 다 따라가지 못하는 경우에는 버그를 찾기 훨씬 어렵습니다. [값과 변수](./01-values-and-variables)에서 `var`를 쓰지 않는다고 한 세 번째 이유가 바로 이것입니다.

| 선언 | 호이스팅 | 선언 전 접근 | 스코프 |
|---|---|---|---|
| `function` 선언문 | 함수 전체가 준비됨 | 호출 가능 | 함수(블록) |
| `let` / `const` | 됨, 하지만 TDZ | 오류 | **블록** |
| `var` | 됨, `undefined`로 초기화 | `undefined` | **함수** (블록 무시) |

### var의 함수 스코프 함정: 반복문 + setTimeout

`var`의 가장 유명한 함정을 보겠습니다. 먼저 `setTimeout`을 알아야 합니다.

`setTimeout(콜백, 밀리초)`는 "**지정한 시간이 지난 뒤에** 콜백을 실행해 달라"고 예약하는 내장 함수입니다. 1000밀리초가 1초입니다. 예약만 하고 바로 다음 줄로 넘어간다는 점이 중요합니다.

```ts
console.log('주문 접수')
setTimeout(() => console.log('3초 뒤: 음료가 준비되었습니다'), 3000)
console.log('다음 손님')
```

```text
주문 접수
다음 손님
3초 뒤: 음료가 준비되었습니다
```

이제 반복문 안에서 `setTimeout`으로 대기번호 호출을 예약해 봅시다.

```ts
for (var i = 1; i <= 3; i++) {
  setTimeout(() => console.log(`${i}번 손님 호출`), 100)
}
```

```text
4번 손님 호출
4번 손님 호출
4번 손님 호출
```

1, 2, 3번을 기대했는데 4번만 세 번 나옵니다. 왜 그럴까요?

1. `var i`는 블록을 무시하고 **함수(또는 전역) 스코프에 단 하나**만 만들어집니다.
2. 반복문은 순식간에 끝나고, 콜백 세 개는 "100밀리초 뒤에 `i`를 출력"하도록 예약만 됩니다.
3. 반복이 끝날 때 `i`는 `4`가 되어 있습니다(`i <= 3`이 거짓이 될 때까지 증가했으므로).
4. 100밀리초 뒤 콜백 세 개가 실행될 때, 모두 **같은 하나의 `i`**를 보므로 `4`를 출력합니다.

`let`으로 바꾸면 해결됩니다.

```ts
for (let i = 1; i <= 3; i++) {
  setTimeout(() => console.log(`${i}번 손님 호출`), 100)
}
```

```text
1번 손님 호출
2번 손님 호출
3번 손님 호출
```

`let`은 블록 스코프이고, `for`문은 `let`으로 선언한 변수를 **반복할 때마다 새로** 만들어 줍니다. 그래서 각 콜백이 자기 차례의 `i`(1, 2, 3)를 따로 기억합니다.

```text
var:  [ i ] ◀── 콜백1, 콜백2, 콜백3 모두 같은 상자를 봄 → 마지막 값 4
let:  [ i=1 ] ◀── 콜백1
      [ i=2 ] ◀── 콜백2
      [ i=3 ] ◀── 콜백3      반복마다 다른 상자
```

"콜백이 바깥 변수를 기억한다"는 이 현상이 바로 다음에 배울 **클로저**입니다. `setTimeout`처럼 나중에 실행되는 코드는 [동기 vs 비동기](../part4-async/01-event-loop-callback)에서 본격적으로 다룹니다.

### 클로저

#### 함수는 태어난 곳의 변수를 기억합니다

```ts
function createCounter() {
  let count = 0 // createCounter의 지역 변수

  return function () {
    count = count + 1
    return count
  }
}

const counter = createCounter()
console.log(counter()) // 출력: 1
console.log(counter()) // 출력: 2
console.log(counter()) // 출력: 3
```

이상한 점이 보이나요? `createCounter`는 첫 줄 `const counter = createCounter()`에서 **이미 실행이 끝났습니다.** 함수가 끝나면 지역 변수 `count`도 사라져야 할 것 같은데, `counter()`를 부를 때마다 `count`가 1, 2, 3으로 늘어납니다.

이유는 이렇습니다.

1. `createCounter` 안에서 만들어진 안쪽 함수는 **렉시컬 스코프** 규칙에 따라 바깥의 `count`를 볼 수 있습니다.
2. 이 안쪽 함수가 `return`되어 바깥(`counter`)으로 나갔습니다.
3. 안쪽 함수가 `count`를 계속 쓰고 있으므로, JavaScript는 `count`를 **지우지 않고 남겨 둡니다.**

이처럼 **함수가 자신이 만들어진 곳의 변수를 기억하고 계속 접근하는 것**을 **클로저**(closure)라고 합니다. 함수와 그 함수가 기억하는 바깥 변수들의 묶음이라고 생각하면 됩니다.

```text
counter ──▶ [ 안쪽 함수 ] ─── 기억 ───▶ { count: 3 }
                                       (createCounter는 끝났지만 이 상자는 살아 있음)
```

#### 호출할 때마다 독립된 상태

`createCounter`를 다시 부르면 **새로운 `count`** 를 가진 새 클로저가 만들어집니다.

```ts
function createCounter() {
  let count = 0
  return () => {
    count = count + 1
    return count
  }
}

const tableA = createCounter()
const tableB = createCounter()

tableA()
tableA()
console.log(tableA()) // 출력: 3
console.log(tableB()) // 출력: 1   ← tableA와 별개의 count
```

함수 스코프는 호출할 때마다 새로 만들어진다고 했습니다. 그래서 `tableA`와 `tableB`는 각자의 `count`를 기억합니다.

#### 바깥에서 직접 건드릴 수 없는 상태

클로저의 `count`는 반환된 함수를 통해서만 바꿀 수 있습니다. 바깥에서 `count = 100`처럼 몰래 바꿀 방법이 없습니다.

```ts
function createCounter() {
  let count = 0
  return () => ++count
}

const counter = createCounter()
console.log(counter.count)
// ❌ Property 'count' does not exist on type '() => number'. (TS2339)
```

이것이 클로저의 가장 큰 쓸모입니다. **정해진 방법으로만 바꿀 수 있는 숨겨진 상태**를 만들 수 있습니다. 전역 변수로 카운터를 만들었다면 어디서든 값을 망가뜨릴 수 있었을 것입니다.

### 실습: 주문번호 생성기

매장마다 그날의 주문번호를 `강남-0001`, `강남-0002`처럼 순서대로 발급하는 생성기를 클로저로 만들어 봅시다.

```ts
function createOrderNoGenerator(storePrefix: string) {
  let seq = 0 // 이 매장의 마지막 발급 번호 (바깥에서 직접 수정 불가)

  return {
    next() {
      seq = seq + 1
      return `${storePrefix}-${String(seq).padStart(4, '0')}`
    },
    current() {
      return seq
    },
    reset() {
      seq = 0 // 영업 마감 후 초기화
    },
  }
}

const gangnam = createOrderNoGenerator('강남')
const yeoksam = createOrderNoGenerator('역삼')

console.log(gangnam.next())    // 출력: 강남-0001
console.log(gangnam.next())    // 출력: 강남-0002
console.log(yeoksam.next())    // 출력: 역삼-0001
console.log(gangnam.current()) // 출력: 2

gangnam.reset()
console.log(gangnam.next())    // 출력: 강남-0001
```

- `next`, `current`, `reset` 세 메서드가 **같은 `seq`를 함께 기억**합니다. 같은 호출에서 만들어졌기 때문입니다.
- `storePrefix` 매개변수도 클로저가 기억합니다. 매개변수도 함수 스코프의 변수이기 때문입니다.
- 강남점과 역삼점은 `createOrderNoGenerator`를 따로 호출했으므로 번호가 섞이지 않습니다.
- 번호를 건너뛰거나 되돌리는 코드를 바깥에서 쓸 수 없으니, 번호가 꼬일 걱정이 줄어듭니다.

::: info 실제 서비스에서는
여러 POS가 동시에 주문을 받는 실제 매장에서는 주문번호를 서버나 데이터베이스가 발급합니다. 프로그램을 껐다 켜면 클로저의 값은 사라지기 때문입니다. 여기서는 클로저의 원리를 익히기 위한 예입니다.
:::

### 클로저가 실무에서 쓰이는 곳

클로저는 특별한 기법이라기보다, 함수 안에서 함수를 만들면 **자연스럽게 생기는 현상**입니다. 이미 여러분도 써 왔습니다.

#### 1. 설정을 기억하는 함수 만들기 (함수 공장)

```ts
function createDiscounter(rate: number) {
  return (price: number) => Math.round(price * (1 - rate))
}

const vipDiscount = createDiscounter(0.2)
const memberDiscount = createDiscounter(0.05)

console.log(vipDiscount(10000))    // 출력: 8000
console.log(memberDiscount(10000)) // 출력: 9500
```

할인율을 한 번 정해 두고 계속 재사용하는 함수를 찍어 냅니다. 등급별 가격 계산, 매장별 세율 적용 등에 씁니다.

#### 2. 콜백이 바깥 값을 쓰는 모든 곳

```ts
function filterByCategory(products: { name: string; category: string }[], category: string) {
  return products.filter((p) => p.category === category) // 콜백이 바깥의 category를 기억
}

const products = [
  { name: '아메리카노', category: '커피' },
  { name: '치즈케이크', category: '디저트' },
]
console.log(filterByCategory(products, '디저트')) // 출력: [ { name: '치즈케이크', category: '디저트' } ]
```

`filter`에 넘긴 화살표 함수가 매개변수 `category`를 쓰는 것도 클로저입니다. [배열](./07-arrays)의 `map`·`filter`·`reduce`에서 바깥 변수를 썼던 모든 곳이 클로저였습니다.

#### 3. 한 번만 실행되게 하기

```ts
function once(action: () => void) {
  let done = false
  return () => {
    if (done) {
      return
    }
    done = true
    action()
  }
}

const submitPayment = once(() => console.log('결제 요청 전송'))
submitPayment() // 출력: 결제 요청 전송
submitPayment() // (아무것도 출력되지 않음)
```

결제 버튼을 손님이 두 번 눌러도 한 번만 요청을 보내게 하는 데 쓰는 패턴입니다. `done`이 클로저에 숨어 있어 바깥에서 실수로 되돌릴 수 없습니다.

#### 4. 이벤트 처리와 화면 프레임워크

웹 화면에서 "버튼을 누르면 실행할 함수"를 등록할 때, 그 함수는 등록할 때의 변수를 클로저로 기억합니다. React의 훅(`useState` 등)도 클로저 위에서 동작합니다. [React 훅](../part7-practice/03-react-hooks) 레슨에서 "오래된 값을 기억하는 클로저" 문제를 다시 만나게 됩니다.

## 자주 하는 실수

### 실수 1. 블록 안에서 만든 변수를 밖에서 쓰기

```ts
const amount = 50000
if (amount >= 30000) {
  const shippingFee = 0
}
console.log(shippingFee)
// ❌ Cannot find name 'shippingFee'. (TS2304)
```

**왜 틀렸나**: `const`는 블록 스코프라서 `if` 블록이 끝나면 사라집니다.

**고친 코드**: 블록 밖에서 써야 하는 변수는 블록 밖에서 선언합니다. 삼항 연산자로 `const` 한 번에 정하는 것이 가장 깔끔합니다.

```ts
const amount = 50000
const shippingFee = amount >= 30000 ? 0 : 3000
console.log(shippingFee) // 출력: 0
```

### 실수 2. 반복문 + 비동기 콜백에 var 쓰기

```ts
for (var table = 1; table <= 2; table++) {
  setTimeout(() => console.log(`${table}번 테이블 주문 출력`), 100)
}
// 출력: 3번 테이블 주문 출력 (두 번)
```

**왜 틀렸나**: `var`는 반복마다 새로 만들어지지 않고 하나만 존재하므로, 나중에 실행되는 콜백들이 모두 마지막 값을 봅니다.

**고친 코드**: `let`을 씁니다.

```ts
for (let table = 1; table <= 2; table++) {
  setTimeout(() => console.log(`${table}번 테이블 주문 출력`), 100)
}
```

```text
1번 테이블 주문 출력
2번 테이블 주문 출력
```

### 실수 3. 섀도잉으로 바깥 변수를 바꾼 줄 알기

```ts
let totalSales = 0

function addSale(amount: number) {
  let totalSales = 0 // 실수로 let을 붙여 새 변수를 만듦
  totalSales = totalSales + amount
}

addSale(4500)
addSale(5000)
console.log(totalSales) // 출력: 0
```

**왜 틀렸나**: 함수 안의 `let totalSales`가 바깥 `totalSales`를 가렸습니다. 함수는 자기 안의 새 변수만 바꾸고 끝났습니다.

**고친 코드**: 더 좋은 방법은 바깥 변수를 바꾸지 않는 **순수 함수**로 만드는 것입니다([함수 기초](./06-functions)).

```ts
function addSale(currentTotal: number, amount: number) {
  return currentTotal + amount
}

let totalSales = 0
totalSales = addSale(totalSales, 4500)
totalSales = addSale(totalSales, 5000)
console.log(totalSales) // 출력: 9500
```

### 실수 4. 생성기를 매번 새로 만들기

```ts
function createCounter() {
  let count = 0
  return () => ++count
}

console.log(createCounter()()) // 출력: 1
console.log(createCounter()()) // 출력: 1
console.log(createCounter()()) // 출력: 1
```

**왜 틀렸나**: `createCounter()`를 부를 때마다 새로운 `count = 0`을 가진 새 클로저가 만들어집니다. 매번 처음부터 셉니다.

**고친 코드**: 생성기는 한 번 만들어 변수에 담고, 그 함수를 반복해서 부릅니다.

```ts
function createCounter() {
  let count = 0
  return () => ++count
}

const counter = createCounter()
console.log(counter()) // 출력: 1
console.log(counter()) // 출력: 2
console.log(counter()) // 출력: 3
```

## 직접 해 보기

### 문제 1. 스코프 맞히기 ⭐

아래 코드에서 오류가 나는 줄을 찾고, 나머지 줄의 출력을 예상하세요.

```text
const brand = '한빛'
function showMenu() {
  const menu = '라떼'
  if (true) {
    const size = 'L'
    console.log(brand, menu, size)   // (가)
  }
  console.log(brand, menu)           // (나)
  console.log(size)                  // (다)
}
showMenu()
console.log(menu)                    // (라)
```

::: details 정답 보기
- (가) `한빛 라떼 L`
- (나) `한빛 라떼`
- (다) 오류: `size`는 `if` 블록 안에서만 보입니다.
- (라) 오류: `menu`는 `showMenu` 함수 안에서만 보입니다.

안쪽에서는 바깥 변수가 보이지만(스코프 체인), 바깥에서는 안쪽 변수가 보이지 않습니다.
:::

### 문제 2. 스탬프 카드 ⭐⭐

`createStampCard()`를 호출하면 `stamp()` 메서드와 `count()` 메서드가 있는 객체를 돌려주게 만드세요. `stamp()`는 도장을 하나 찍고, 10개가 되면 `'무료 음료 쿠폰 발급!'`을 출력한 뒤 0개로 되돌립니다. `count()`는 현재 도장 수를 돌려줍니다.

::: details 정답 보기
```ts
function createStampCard() {
  let stamps = 0
  return {
    stamp() {
      stamps = stamps + 1
      if (stamps === 10) {
        console.log('무료 음료 쿠폰 발급!')
        stamps = 0
      }
    },
    count() {
      return stamps
    },
  }
}

const card = createStampCard()
for (let i = 0; i < 12; i++) {
  card.stamp()
}
console.log(card.count())
```

출력:

```text
무료 음료 쿠폰 발급!
2
```

12번 찍으면 10번째에 쿠폰이 발급되고 0으로 돌아간 뒤 2개가 더 찍힙니다. `stamps`는 클로저에 숨어 있어 `card.stamps = 100` 같은 조작이 불가능합니다.
:::

### 문제 3. 등급별 할인 함수 공장 ⭐⭐

등급 이름과 할인율을 받아, 가격을 넣으면 `'[VIP] 10,000원 → 8,000원'` 같은 문구를 돌려주는 함수를 만들어 주는 `createGradePricer(grade: string, rate: number)`를 작성하세요.

::: details 정답 보기
```ts
function createGradePricer(grade: string, rate: number) {
  return (price: number) => {
    const salePrice = Math.round(price * (1 - rate))
    return `[${grade}] ${price.toLocaleString('ko-KR')}원 → ${salePrice.toLocaleString('ko-KR')}원`
  }
}

const vipPricer = createGradePricer('VIP', 0.2)
const goldPricer = createGradePricer('GOLD', 0.1)

console.log(vipPricer(10000))  // 출력: [VIP] 10,000원 → 8,000원
console.log(goldPricer(25000)) // 출력: [GOLD] 25,000원 → 22,500원
```
:::

### 문제 4. 대기번호 발급기 ⭐⭐

`createWaitingQueue()`를 만드세요. 반환하는 객체에는 다음 메서드가 있습니다.

- `issue()`: 새 대기번호(1부터 증가)를 발급하고 그 번호를 돌려줌
- `call()`: 가장 먼저 발급된, 아직 호출되지 않은 번호를 꺼내 돌려줌. 대기자가 없으면 `undefined`
- `waitingCount()`: 남은 대기자 수

::: details 정답 보기
```ts
function createWaitingQueue() {
  let lastNo = 0
  const waiting: number[] = []

  return {
    issue() {
      lastNo = lastNo + 1
      waiting.push(lastNo)
      return lastNo
    },
    call() {
      return waiting.shift()
    },
    waitingCount() {
      return waiting.length
    },
  }
}

const queue = createWaitingQueue()
queue.issue()
queue.issue()
queue.issue()
console.log(queue.call())         // 출력: 1
console.log(queue.waitingCount()) // 출력: 2
console.log(queue.call())         // 출력: 2
console.log(queue.call())         // 출력: 3
console.log(queue.call())         // 출력: undefined
```

`lastNo`와 `waiting` 배열 둘 다 클로저에 숨겨져 있습니다. 바깥에서는 세 메서드로만 대기열을 다룰 수 있습니다.
:::

### 문제 5. var를 let으로 ⭐⭐⭐

아래 코드는 `0 1 2`를 출력하길 기대했지만 `3 3 3`을 출력합니다. (1) 왜 그런지 설명하고, (2) `let`으로 고치세요. (3) `let`을 쓸 수 없다고 가정하고, **함수 매개변수가 호출마다 새로 만들어진다**는 점을 이용해 고쳐 보세요.

```text
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100)
}
```

::: details 정답 보기
(1) `var i`는 하나뿐이고, 콜백들은 반복이 모두 끝난 뒤(`i`가 `3`일 때) 실행되어 같은 `i`를 읽습니다.

(2)

```ts
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100)
}
```

(3)

```ts
function scheduleLog(n: number) {
  setTimeout(() => console.log(n), 100) // n은 호출마다 새로 생긴 매개변수
}

for (var i = 0; i < 3; i++) {
  scheduleLog(i)
}
```

두 방법 모두 출력은 같습니다.

```text
0
1
2
```

`let`이 생기기 전(ES2015 이전)에는 (3)처럼 함수로 감싸 "반복마다 새 스코프"를 만드는 방법을 썼습니다. 지금은 `let`을 쓰면 됩니다.
:::

## 확인 퀴즈

**Q1.** 스코프 체인에서 변수를 찾는 방향은 어느 쪽인가요?

::: details 정답 보기
현재(안쪽) 스코프에서 시작해 바깥쪽으로 한 단계씩 나가며 찾고, 전역까지 없으면 오류입니다. 바깥에서 안쪽 변수는 찾지 않습니다.
:::

**Q2.** `let`과 `var`의 스코프 차이는 무엇인가요?

::: details 정답 보기
`let`(과 `const`)은 블록 스코프라 `{ }` 안에서만 보이고, `var`는 블록을 무시하고 함수 스코프(함수 밖이면 전역)를 가집니다.
:::

**Q3.** TDZ란 무엇이고, 어떤 선언에 해당하나요?

::: details 정답 보기
`let`·`const` 변수가 스코프 시작부터 선언문에 도달하기 전까지 접근할 수 없는 구간입니다. 이 구간에서 접근하면 오류가 납니다. `var`는 TDZ가 없고 `undefined`가 나옵니다.
:::

**Q4.** 클로저를 한 문장으로 설명해 보세요.

::: details 정답 보기
함수가 자신이 만들어진 곳(렉시컬 스코프)의 변수를 기억하고, 그 바깥 함수의 실행이 끝난 뒤에도 계속 접근할 수 있는 것입니다.
:::

**Q5.** `const a = createCounter(); const b = createCounter();`일 때 `a()`를 세 번 부른 뒤 `b()`의 결과는 무엇인가요? (카운터는 1부터 셈)

::: details 정답 보기
`1`입니다. `createCounter`를 호출할 때마다 새로운 `count`가 만들어지므로 `a`와 `b`는 서로 다른 상태를 가집니다.
:::

## 정리

- **스코프**는 변수가 보이는 범위입니다. 전역 → 함수 → 블록 순으로 좁아지고, `let`·`const`는 블록 스코프입니다.
- 변수는 **안쪽에서 바깥쪽으로** 찾아 나갑니다(스코프 체인). 기준은 코드를 **적은 위치**(렉시컬 스코프)입니다.
- 안쪽에서 같은 이름을 선언하면 바깥 변수를 가립니다(**섀도잉**). 헷갈리니 피합니다.
- 함수 선언문은 선언 전에 호출 가능, `let`·`const`는 **TDZ** 때문에 선언 전 접근 불가, `var`는 조용히 `undefined`입니다.
- `var`는 반복마다 새로 만들어지지 않아 반복문 + `setTimeout`에서 모두 마지막 값을 봅니다. `let`을 쓰면 해결됩니다.
- **클로저**는 함수가 태어난 곳의 변수를 기억하는 것입니다. 바깥에서 건드릴 수 없는 상태(카운터, 주문번호 생성기)와 설정을 기억하는 함수(함수 공장)를 만들 때 씁니다.

## 다음 단계

[오류 처리: throw · try/catch/finally](./11-errors) — 잘못된 수량·금액이 들어왔을 때 프로그램이 어떻게 멈추는지 보고, 오류를 직접 던지고 받아서 안전하게 처리하는 방법을 배웁니다.
