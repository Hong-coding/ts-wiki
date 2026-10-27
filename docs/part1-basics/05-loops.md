---
title: '반복문: for · while · for...of'
---

# 반복문: for · while · for...of

<LessonMeta level="입문" :minutes="45" prev="if · switch · 삼항 연산자로 조건에 따라 흐름을 나누고, 조기 반환으로 중첩을 줄였습니다." />

## 이번에 배울 것

- `for`, `while`, `do...while`로 같은 코드를 정해진 횟수나 조건만큼 반복할 수 있다.
- `for...of`로 배열의 값을 하나씩 꺼내고, `for...in`이 객체의 키를 돌며 배열에는 쓰지 않는 이유를 설명할 수 있다.
- `break`와 `continue`로 반복을 멈추거나 건너뛸 수 있다.
- 무한 루프가 생기는 원인을 알고, 터미널에서 `Ctrl + C`로 멈출 수 있다.
- 중첩 반복(구구단)을 쓰고, 반복이 실행되는 과정을 표로 추적할 수 있다.

## 먼저 알아 둘 것

- [연산자와 표현식](./03-operators): 비교 연산자, `++`, `+=`
- [조건문](./04-conditionals): `if`와 블록 `{ }`, 조건이 참·거짓으로 계산된다는 것
- 이 레슨에서는 **배열**(array, 여러 값을 순서대로 담은 목록)을 조금 미리 씁니다. `[4500, 5000, 3000]`처럼 대괄호 안에 값을 쉼표로 나열한 것이 배열입니다. 자세한 내용은 [배열](./07-arrays) 레슨에서 배웁니다.

## 비유로 이해하기

### 계산대에서 바코드 찍기

손님이 장바구니를 계산대에 올려놓았습니다. 직원은 이렇게 일합니다.

1. 장바구니에서 상품을 **하나** 꺼낸다.
2. 바코드를 찍어 금액을 합계에 **더한다**.
3. 장바구니에 상품이 **남아 있으면** 1번으로 돌아간다.
4. 비었으면 합계를 알려 준다.

직원은 상품이 3개든 30개든 **같은 동작을 반복**합니다. 상품마다 따로 지시받을 필요가 없습니다. "남아 있는 동안 꺼내서 더하라"는 규칙 하나면 충분합니다.

이것이 **반복문**(loop, 루프)입니다. 반복문의 핵심 재료는 세 가지입니다.

| 재료 | 계산대에서 | 코드에서 |
|---|---|---|
| 시작 상태 | 합계 0원, 장바구니 가득 | 변수 초기화 |
| 계속할 조건 | 장바구니에 상품이 남아 있는가? | 조건식 |
| 한 번 돌 때마다 하는 일 | 하나 꺼내서 더하기 | 블록 `{ }` 안의 코드 |

조건이 **영원히 참**이면 직원은 퇴근하지 못합니다. 이것이 뒤에서 볼 **무한 루프**입니다.

## 개념 설명

### 왜 반복문이 필요한가

"주문 확인" 문구를 5번 출력한다고 해 봅시다.

```ts
console.log('주문 확인 1')
console.log('주문 확인 2')
console.log('주문 확인 3')
console.log('주문 확인 4')
console.log('주문 확인 5')
```

5번은 견딜 만하지만 500번이라면? 반복 횟수가 실행할 때마다 달라진다면? 반복문을 쓰면 몇 번이든 코드 몇 줄로 끝납니다.

### for: 횟수가 정해진 반복

```ts
for (let i = 1; i <= 5; i++) {
  console.log('주문 확인 ' + i)
}
```

실행 결과:

```text
주문 확인 1
주문 확인 2
주문 확인 3
주문 확인 4
주문 확인 5
```

`for` 괄호 안은 **세미콜론 `;`으로 나뉜 세 부분**입니다.

```text
for (초기화; 조건; 증감) {
  반복할 코드
}
```

| 부분 | 위 예제 | 뜻 |
|---|---|---|
| 초기화 | `let i = 1` | 반복을 시작하기 전에 **딱 한 번** 실행. 횟수를 셀 변수 `i`를 만듭니다. |
| 조건 | `i <= 5` | 매번 반복하기 **전에** 검사. 참이면 블록 실행, 거짓이면 반복 끝. |
| 증감 | `i++` | 블록을 한 번 실행한 **뒤에** 실행. `i`를 1 늘립니다. |

`i`는 index(순번)의 첫 글자로, 반복 횟수를 세는 변수에 관례적으로 쓰는 이름입니다. 값이 계속 바뀌므로 `const`가 아니라 `let`입니다.

#### 실행 과정을 표로 추적하기

반복문이 헷갈릴 때는 **표를 그려 한 줄씩 따라가는 것**이 가장 확실한 방법입니다. 위 코드의 실행 순서는 다음과 같습니다.

| 단계 | `i` 값 | 조건 `i <= 5` | 하는 일 |
|---|---|---|---|
| 초기화 | 1 | - | `i`를 1로 만듦 |
| 1회차 | 1 | `true` | `주문 확인 1` 출력 → `i++` |
| 2회차 | 2 | `true` | `주문 확인 2` 출력 → `i++` |
| 3회차 | 3 | `true` | `주문 확인 3` 출력 → `i++` |
| 4회차 | 4 | `true` | `주문 확인 4` 출력 → `i++` |
| 5회차 | 5 | `true` | `주문 확인 5` 출력 → `i++` |
| 끝 | 6 | `false` | 반복을 빠져나감 |

마지막 줄을 보세요. 반복이 끝났을 때 `i`는 `5`가 아니라 **`6`**입니다. 조건이 거짓이 되어야 빠져나오기 때문입니다. 이 "끝나는 순간"을 정확히 아는 것이 반복문 버그를 피하는 열쇠입니다.

#### 합계 누적하기

반복문의 가장 흔한 쓰임은 **값을 차곡차곡 쌓는 것**(누적)입니다. 1부터 10까지 더해 봅시다.

```ts
let sum = 0
for (let i = 1; i <= 10; i++) {
  sum += i
}
console.log(sum) // 출력: 55
```

반복문 **바깥**에 `let sum = 0`을 먼저 만들어 두고, 안에서 `sum += i`로 더해 나갑니다. `sum`을 반복문 **안**에서 만들면 매번 0으로 새로 시작해 버리므로 누적이 되지 않습니다.

#### 거꾸로, 건너뛰며 세기

증감 부분을 바꾸면 다양하게 셀 수 있습니다.

```ts
// 카운트다운
for (let i = 3; i >= 1; i--) {
  console.log(i)
}
console.log('주문 마감!')
```

```text
3
2
1
주문 마감!
```

```ts
// 0부터 100까지 25씩 (할인율 단계 표시)
for (let rate = 0; rate <= 100; rate += 25) {
  console.log(rate + '%')
}
```

```text
0%
25%
50%
75%
100%
```

### 배열과 for: 장바구니 합계

이제 비유의 계산대를 코드로 만들어 봅시다. 장바구니에 담긴 상품 가격을 배열에 넣습니다.

```ts
const cartPrices = [4500, 5000, 3200, 6800]

console.log(cartPrices.length) // 출력: 4
console.log(cartPrices[0])     // 출력: 4500
console.log(cartPrices[3])     // 출력: 6800
```

- `cartPrices.length`: 배열에 든 값의 **개수**
- `cartPrices[0]`: **0번째** 값. 배열의 순번(인덱스, index)은 **0부터** 셉니다. 그래서 마지막 값은 `[length - 1]`, 여기서는 `[3]`입니다.

인덱스가 0부터 `length - 1`까지이므로, `for`의 `i`를 0부터 시작하고 조건을 `i < length`로 쓰면 모든 값을 한 번씩 꺼낼 수 있습니다.

```ts
const cartPrices = [4500, 5000, 3200, 6800]
let total = 0

for (let i = 0; i < cartPrices.length; i++) {
  total += cartPrices[i]
}
console.log('합계:', total) // 출력: 합계: 19500
```

| 회차 | `i` | `cartPrices[i]` | `total` (더한 뒤) |
|---|---|---|---|
| 1 | 0 | 4500 | 4500 |
| 2 | 1 | 5000 | 9500 |
| 3 | 2 | 3200 | 12700 |
| 4 | 3 | 6800 | 19500 |
| 끝 | 4 | - | `4 < 4`는 거짓 → 종료 |

::: warning `<=`가 아니라 `<`
배열을 돌 때 조건을 `i <= cartPrices.length`로 쓰면 `i`가 `4`일 때도 실행되어 `cartPrices[4]`, 즉 **없는 칸**을 읽습니다. 결과는 `undefined`이고, `total += undefined`는 `NaN`이 됩니다. 이렇게 한 번 더(또는 덜) 도는 실수를 **off-by-one 에러**(하나 차이 에러)라고 하며, 프로그래머가 가장 자주 하는 실수 중 하나입니다.
:::

### for...of: 값을 하나씩 바로 꺼내기

배열을 처음부터 끝까지 돌 때는 인덱스를 직접 다룰 필요가 없습니다. **`for...of`**는 배열의 **값**을 하나씩 꺼내 줍니다.

```ts
const cartPrices = [4500, 5000, 3200, 6800]
let total = 0

for (const price of cartPrices) {
  total += price
}
console.log('합계:', total) // 출력: 합계: 19500
```

- `for (const price of cartPrices)`: "`cartPrices`의 값을 하나씩 `price`에 담아 반복하라"
- `i`도, `length`도, `[i]`도 없으니 off-by-one 에러가 생길 수 없습니다.
- 매 회차마다 `price`가 **새로 만들어지므로** `const`를 쓸 수 있습니다.

> **배열의 값을 모두 도는 일이라면 기본은 `for...of`입니다.** 인덱스(몇 번째인지)가 꼭 필요할 때만 일반 `for`를 씁니다.

문자열도 `for...of`로 한 글자씩 돌 수 있습니다.

```ts
for (const char of '라떼') {
  console.log(char)
}
```

```text
라
떼
```

TypeScript는 꺼낸 값의 타입도 알아서 추론합니다. VS Code에서 `price`에 마우스를 올리면 `const price: number`로 보입니다. 그래서 숫자에 없는 기능을 쓰면 바로 알려 줍니다.

```ts
const cartPrices = [4500, 5000]
for (const price of cartPrices) {
  console.log(price.toUpperCase())
}
// ❌ Property 'toUpperCase' does not exist on type 'number'. (TS2339)
```

### while: 조건이 참인 동안 반복

**횟수를 미리 알 수 없고 "조건이 맞는 동안"** 반복할 때는 `while`이 자연스럽습니다.

```text
while (조건) {
  반복할 코드
}
```

포인트로 결제하는 예를 봅시다. 포인트가 남아 있는 동안 1000점씩 차감합니다.

```ts
let point = 3500
let usedCount = 0

while (point >= 1000) {
  point -= 1000
  usedCount++
}
console.log('사용 횟수:', usedCount) // 출력: 사용 횟수: 3
console.log('남은 포인트:', point)   // 출력: 남은 포인트: 500
```

| 회차 | 검사 전 `point` | 조건 `point >= 1000` | 블록 실행 후 `point` | `usedCount` |
|---|---|---|---|---|
| 1 | 3500 | `true` | 2500 | 1 |
| 2 | 2500 | `true` | 1500 | 2 |
| 3 | 1500 | `true` | 500 | 3 |
| 4 | 500 | `false` | (실행 안 함) | 3 |

`for`와 `while`은 서로 바꿔 쓸 수 있습니다. 일반적인 선택 기준은 이렇습니다.

| 상황 | 추천 |
|---|---|
| 배열의 값을 모두 돈다 | `for...of` |
| 정해진 횟수만큼 돈다, 인덱스가 필요하다 | `for` |
| 몇 번 돌지 모르고 "조건이 맞는 동안" 돈다 | `while` |

### do...while: 일단 한 번은 실행

`while`은 조건을 **먼저** 검사하므로, 처음부터 조건이 거짓이면 한 번도 실행하지 않습니다. **`do...while`**은 블록을 **먼저 한 번 실행한 뒤** 조건을 검사합니다.

```ts
let attempt = 0
let isApproved = false

do {
  attempt++
  console.log(attempt + '번째 결제 승인 요청')
  isApproved = attempt >= 2 // 연습용: 2번째 시도에서 승인된다고 가정
} while (!isApproved && attempt < 3)

console.log('결과:', isApproved ? '승인' : '실패')
```

```text
1번째 결제 승인 요청
2번째 결제 승인 요청
결과: 승인
```

"결제 요청을 **최소 한 번은** 보내고, 실패하면 최대 3번까지 재시도"처럼 **첫 실행이 반드시 필요한** 경우에 씁니다. 실무에서 자주 쓰지는 않으므로 "이런 모양도 있다" 정도로 알아 두면 됩니다. `while (...)` 뒤에 블록이 없다는 점에 주의하세요.

### break: 반복 멈추기

원하는 것을 찾았으면 나머지를 더 볼 필요가 없습니다. **`break`**는 반복문을 **즉시 빠져나갑니다.** (`switch`의 `break`와 같은 단어이고, 하는 일도 "빠져나가기"로 같습니다.)

재고 목록에서 재고가 0인 첫 상품의 위치를 찾아봅시다.

```ts
const stockCounts = [12, 5, 0, 8, 0]
let soldOutIndex = -1 // 못 찾으면 -1로 남김

for (let i = 0; i < stockCounts.length; i++) {
  console.log(i + '번 상품 확인')
  if (stockCounts[i] === 0) {
    soldOutIndex = i
    break
  }
}
console.log('첫 품절 상품 위치:', soldOutIndex)
```

```text
0번 상품 확인
1번 상품 확인
2번 상품 확인
첫 품절 상품 위치: 2
```

2번 상품에서 찾자마자 `break`로 빠져나와서 3번, 4번은 확인하지 않았습니다. "못 찾았을 때"를 대비해 `-1`처럼 **있을 수 없는 값**으로 시작해 두는 것도 자주 쓰는 방법입니다.

### continue: 이번 회차만 건너뛰기

**`continue`**는 반복을 멈추지 않고, **이번 회차의 나머지 코드만 건너뛰고** 다음 회차로 넘어갑니다.

품절 상품은 빼고 판매 가능한 상품만 출력해 봅시다. 상품 이름과 재고를 배열 두 개로 나눠 두었습니다.

```ts
const productNames = ['아메리카노', '카페라떼', '바닐라라떼', '콜드브루']
const stockCounts = [12, 0, 7, 0]

for (let i = 0; i < productNames.length; i++) {
  if (stockCounts[i] === 0) {
    continue // 품절이면 아래 출력은 건너뛰고 다음 상품으로
  }
  console.log(productNames[i] + ' (재고 ' + stockCounts[i] + ')')
}
```

```text
아메리카노 (재고 12)
바닐라라떼 (재고 7)
```

`continue`는 조건문의 **조기 반환**과 비슷한 효과를 냅니다. "안 되는 경우를 먼저 걸러내고, 정상 처리는 아래에" 쓰는 모양이 됩니다.

| | `break` | `continue` |
|---|---|---|
| 하는 일 | 반복문 전체를 **끝냄** | **이번 회차만** 건너뜀 |
| 비유 | 찾던 상품을 찾았으니 계산을 끝낸다 | 이 상품은 바코드가 없으니 옆으로 빼고 다음 상품을 찍는다 |

### 무한 루프와 탈출

조건이 **영원히 거짓이 되지 않으면** 반복이 끝나지 않습니다. 이것을 **무한 루프**(infinite loop)라고 합니다.

```text
let count = 0
while (count < 5) {
  console.log('주문 처리 중...')
  // count++ 를 빠뜨렸다!
}
```

`count`가 계속 `0`이라 `count < 5`가 영원히 참입니다. 이 코드를 실행하면 터미널에 `주문 처리 중...`이 끝없이 쏟아집니다.

#### 멈추는 법: Ctrl + C

당황하지 마세요. 터미널(VS Code 터미널 포함)을 클릭한 뒤 **`Ctrl + C`**를 누르면 실행 중인 프로그램이 강제로 멈춥니다(macOS도 `Ctrl + C`입니다). 한 번에 안 멈추면 몇 번 더 누릅니다. 프롬프트(`PS C:\...>`)가 다시 보이면 멈춘 것입니다.

::: tip Playground에서 무한 루프가 생기면
TS Playground에서 무한 루프 코드를 Run하면 브라우저 탭이 멈출 수 있습니다. 탭을 닫았다가 다시 여세요. Playground는 마지막 코드를 기억하므로, 다시 열면 **Run을 누르기 전에** 코드부터 고칩니다.
:::

#### 무한 루프를 피하는 점검표

반복문을 쓴 뒤 다음 세 가지를 확인하세요.

1. 조건에 쓰인 변수가 **블록 안에서 바뀌는가?** (`count++`, `point -= 1000` 등)
2. 바뀌는 **방향이 맞는가?** 조건이 `i < 10`인데 `i--`를 하면 영원히 작아지기만 합니다.
3. 반드시 **끝나는 지점**이 있는가? 표로 몇 회차만 따라가 보면 금방 보입니다.

::: info 일부러 쓰는 무한 루프
`while (true) { ... }`처럼 일부러 무한 루프를 만들고, 안에서 조건이 맞을 때 `break`로 빠져나오는 코드도 있습니다. 서버처럼 "계속 요청을 기다리는" 프로그램에서 쓰는 모양입니다. 처음 배울 때는 끝나는 조건을 괄호 안에 명확히 쓰는 편이 안전합니다.
:::

### 중첩 반복: 구구단

반복문 안에 반복문을 넣을 수 있습니다. 대표 예가 구구단입니다.

```ts
for (let dan = 2; dan <= 3; dan++) {
  console.log('[' + dan + '단]')
  for (let n = 1; n <= 3; n++) {
    console.log(dan + ' x ' + n + ' = ' + dan * n)
  }
}
```

```text
[2단]
2 x 1 = 2
2 x 2 = 4
2 x 3 = 6
[3단]
3 x 1 = 3
3 x 2 = 6
3 x 3 = 9
```

지면 관계상 2~3단, 1~3까지만 출력했습니다. 숫자 `3`을 `9`로 바꾸면 전체 구구단이 됩니다.

중첩 반복은 **바깥 반복이 한 번 돌 때 안쪽 반복이 처음부터 끝까지 전부** 돕니다. 시계의 시침과 분침을 떠올리면 됩니다. 시침이 한 칸 움직일 때 분침은 한 바퀴를 돕니다.

| 바깥 `dan` | 안쪽 `n` | 출력 |
|---|---|---|
| 2 | (시작 전) | `[2단]` |
| 2 | 1 | `2 x 1 = 2` |
| 2 | 2 | `2 x 2 = 4` |
| 2 | 3 | `2 x 3 = 6` |
| 3 | (시작 전) | `[3단]` |
| 3 | 1 | `3 x 1 = 3` |
| 3 | 2 | `3 x 2 = 6` |
| 3 | 3 | `3 x 3 = 9` |

안쪽 코드가 실행되는 총 횟수는 **바깥 횟수 × 안쪽 횟수**입니다. 위에서는 2 × 3 = 6번입니다. 전체 구구단(2~9단, 1~9)이면 8 × 9 = 72번입니다. 데이터가 많을 때 중첩 반복은 실행 횟수가 금방 커지므로, 실무에서는 꼭 필요한지 한 번 더 생각하게 됩니다.

::: warning 안쪽 변수 이름은 다르게
바깥과 안쪽 반복 변수에 같은 이름(`i`와 `i`)을 쓰면 헷갈립니다. `dan`과 `n`, 또는 `i`와 `j`처럼 다르게 짓습니다.
:::

### for...in: 객체의 키를 도는 반복

**`for...in`**은 객체의 **키**(key, 속성 이름)를 하나씩 꺼냅니다. 상품별 재고를 객체에 담아 봅시다.

```ts
// { [productName: string]: number } 는 "키는 상품 이름(문자열), 값은 숫자"라는 뜻 (Part 2에서 배움)
const stockByProduct: { [productName: string]: number } = {
  americano: 12,
  latte: 0,
  coldBrew: 7,
}

for (const name in stockByProduct) {
  console.log(name, stockByProduct[name])
}
```

```text
americano 12
latte 0
coldBrew 7
```

`name`에는 `'americano'`, `'latte'`, `'coldBrew'`가 차례로 들어오고, `stockByProduct[name]`으로 그 키의 값을 꺼냅니다. 객체는 [객체](./08-objects) 레슨에서 자세히 배우며, 거기서 `Object.entries` 같은 더 편한 방법도 다룹니다.

#### for...in을 배열에 쓰지 않는 이유

`for...in`을 배열에 쓰면 동작은 합니다. 하지만 꺼내지는 것이 **값이 아니라 인덱스**이고, 그 인덱스가 **문자열**입니다.

```ts
const cartPrices = [4500, 5000]

for (const i in cartPrices) {
  console.log(i + 1)
}
```

```text
01
11
```

`i`가 숫자 `0`이 아니라 문자열 `'0'`이라서, `i + 1`이 더하기가 아니라 이어 붙이기 `'01'`이 되었습니다. VS Code에서 `i`에 마우스를 올리면 `const i: string`으로 보입니다. 이 밖에도 `for...in`은 배열에 따로 붙인 속성까지 돌 수 있어서, 배열을 돌기에는 알맞지 않습니다.

> **배열은 `for...of`(값이 필요할 때) 또는 `for`(인덱스가 필요할 때). `for...in`은 객체의 키를 돌 때만.**

`of`와 `in`이 헷갈리면 이렇게 외우세요. "배열의 **값 of**(~의 값), 객체 **안 in**(~안의 키)".

## 자주 하는 실수

### 실수 1. 배열 조건에 <= 쓰기 (off-by-one)

```ts
const cartPrices = [4500, 5000, 3200]
let total = 0
for (let i = 0; i <= cartPrices.length; i++) {
  total += cartPrices[i]
}
console.log(total) // 출력: NaN
```

**왜 틀렸나**: `i`가 `3`일 때도 실행되어 없는 칸 `cartPrices[3]`(`undefined`)을 더했습니다. 숫자 + `undefined`는 `NaN`이고, 한 번 `NaN`이 되면 이후 계산도 모두 `NaN`입니다. TypeScript는 기본 `strict` 설정에서 이 실수를 잡아 주지 못합니다.

**고친 코드**: 조건을 `<`로 쓰거나, 아예 `for...of`를 씁니다.

```ts
const cartPrices = [4500, 5000, 3200]
let total = 0
for (const price of cartPrices) {
  total += price
}
console.log(total) // 출력: 12700
```

### 실수 2. 누적 변수를 반복문 안에서 만들기

```ts
const cartPrices = [4500, 5000, 3200]
for (const price of cartPrices) {
  let total = 0
  total += price
  console.log(total)
}
```

```text
4500
5000
3200
```

**왜 틀렸나**: `let total = 0`이 블록 **안**에 있어서 매 회차마다 새로 0부터 시작합니다. 합계가 쌓이지 않습니다. 또 블록 안에서 만든 변수는 블록 밖에서 쓸 수 없으므로 반복이 끝난 뒤 합계를 꺼낼 수도 없습니다.

**고친 코드**: 누적 변수는 반복문 **바깥**에서 만들고, 결과는 반복이 끝난 뒤 출력합니다.

```ts
const cartPrices = [4500, 5000, 3200]
let total = 0
for (const price of cartPrices) {
  total += price
}
console.log(total) // 출력: 12700
```

### 실수 3. while에서 조건 변수를 바꾸지 않기

```text
let stock = 3
while (stock > 0) {
  console.log('판매 가능 재고: ' + stock)
}
```

**왜 틀렸나**: `stock`이 블록 안에서 바뀌지 않아 조건이 영원히 참입니다. 무한 루프가 됩니다. (실행했다면 `Ctrl + C`로 멈춥니다.)

**고친 코드**:

```ts
let stock = 3
while (stock > 0) {
  console.log('판매 가능 재고: ' + stock)
  stock--
}
console.log('품절')
```

```text
판매 가능 재고: 3
판매 가능 재고: 2
판매 가능 재고: 1
품절
```

### 실수 4. 배열에 for...in 쓰기

```ts
const quantities = [2, 1, 3]
let totalQuantity = 0
for (const q in quantities) {
  totalQuantity += Number(q)
}
console.log(totalQuantity) // 출력: 3
```

**왜 틀렸나**: 수량의 합 `6`을 기대했지만, `for...in`은 **값이 아니라 인덱스**(`'0'`, `'1'`, `'2'`)를 꺼냅니다. 그래서 `0 + 1 + 2 = 3`이 되었습니다. `Number()`로 감싸 에러는 피했지만 결과가 틀렸습니다.

**고친 코드**:

```ts
const quantities = [2, 1, 3]
let totalQuantity = 0
for (const q of quantities) {
  totalQuantity += q
}
console.log(totalQuantity) // 출력: 6
```

### 실수 5. for...of 변수를 바꾸려고 하기

```ts
const cartPrices = [4500, 5000]
for (const price of cartPrices) {
  price = price * 0.9
}
// ❌ Cannot assign to 'price' because it is a constant. (TS2588)
```

**왜 틀렸나**: `price`는 꺼낸 값을 담은 `const` 변수입니다. 게다가 `let`으로 바꿔 값을 바꿔도 **배열 안의 값은 바뀌지 않습니다.** `price`는 배열 값을 꺼내 담아 둔 별도의 상자일 뿐입니다.

**고친 코드**: 계산 결과를 새 변수에 담아 씁니다. (할인된 가격으로 **새 배열**을 만드는 `map`은 [배열](./07-arrays) 레슨에서 배웁니다.)

```ts
const cartPrices = [4500, 5000]
for (const price of cartPrices) {
  const discounted = price * 0.9
  console.log(discounted)
}
```

```text
4050
4500
```

## 직접 해 보기

### 문제 1. 번호표 출력 ⭐

`for`를 써서 `대기번호 101`부터 `대기번호 105`까지 출력하세요.

::: details 정답 보기
```ts
for (let no = 101; no <= 105; no++) {
  console.log('대기번호 ' + no)
}
```

```text
대기번호 101
대기번호 102
대기번호 103
대기번호 104
대기번호 105
```
:::

### 문제 2. 장바구니 합계와 개수 ⭐

`const cartPrices = [12000, 3500, 8900, 1500]`의 합계와, `5000`원 이상인 상품 개수를 `for...of` 하나로 함께 구하세요.

::: details 정답 보기
```ts
const cartPrices = [12000, 3500, 8900, 1500]
let total = 0
let expensiveCount = 0

for (const price of cartPrices) {
  total += price
  if (price >= 5000) {
    expensiveCount++
  }
}
console.log(total)          // 출력: 25900
console.log(expensiveCount) // 출력: 2
```

반복문 안에 조건문을 넣어 "조건에 맞는 것만 세기"를 했습니다.
:::

### 문제 3. 실행 과정 추적 ⭐⭐

다음 코드의 실행 과정을 표(회차, `n`, `result`)로 그리고, 최종 출력을 예측하세요. 그다음 실행해서 확인합니다.

```ts
let n = 1
let result = 0
while (n < 20) {
  result += n
  n *= 3
}
console.log(n, result)
```

::: details 정답 보기
| 회차 | 검사 전 `n` | 조건 `n < 20` | `result` (더한 뒤) | `n` (곱한 뒤) |
|---|---|---|---|---|
| 1 | 1 | `true` | 1 | 3 |
| 2 | 3 | `true` | 4 | 9 |
| 3 | 9 | `true` | 13 | 27 |
| 4 | 27 | `false` | - | - |

```text
27 13
```

`n`이 3배씩 커지므로 3번만 돌고 끝납니다. 끝났을 때 `n`은 조건을 처음으로 어긴 값 `27`입니다.
:::

### 문제 4. 재고 찾기 ⭐⭐

상품 이름과 재고가 아래와 같을 때, `'바닐라라떼'`의 재고를 찾아 출력하세요. 찾으면 바로 반복을 멈추고, 끝까지 못 찾으면 `상품 없음`을 출력합니다.

```ts
const productNames = ['아메리카노', '카페라떼', '바닐라라떼', '콜드브루']
const stockCounts = [12, 0, 7, 3]
const target = '바닐라라떼'
```

::: details 정답 보기
```ts
const productNames = ['아메리카노', '카페라떼', '바닐라라떼', '콜드브루']
const stockCounts = [12, 0, 7, 3]
const target = '바닐라라떼'
let foundIndex = -1

for (let i = 0; i < productNames.length; i++) {
  if (productNames[i] === target) {
    foundIndex = i
    break
  }
}

if (foundIndex === -1) {
  console.log('상품 없음')
} else {
  console.log(target + ' 재고: ' + stockCounts[foundIndex])
}
// 출력: 바닐라라떼 재고: 7
```

두 배열에서 **같은 위치**의 값을 함께 써야 하므로 인덱스가 필요합니다. 그래서 `for...of`가 아니라 일반 `for`를 썼습니다. 이렇게 배열 두 개를 나란히 쓰는 방식은 실수하기 쉬워서, 실무에서는 상품 하나를 객체로 묶어 배열에 담습니다([객체](./08-objects) 레슨).
:::

### 문제 5. 품절 건너뛰고 합계 ⭐⭐

`const stockCounts = [5, 0, 3, 0, 2]`에서 재고가 0인 칸은 `continue`로 건너뛰면서, 재고가 있는 상품 수와 재고 총합을 구하세요.

::: details 정답 보기
```ts
const stockCounts = [5, 0, 3, 0, 2]
let availableCount = 0
let totalStock = 0

for (const stock of stockCounts) {
  if (stock === 0) {
    continue
  }
  availableCount++
  totalStock += stock
}
console.log(availableCount, totalStock) // 출력: 3 10
```
:::

### 문제 6. 구구단 표 만들기 ⭐⭐⭐

2단부터 9단까지, 각 단을 **한 줄에** 이어서 출력하세요. 예: `2단: 2 4 6 8 10 12 14 16 18`. 안쪽 반복에서 문자열을 `+=`로 이어 붙인 뒤, 바깥 반복에서 한 번 출력합니다.

::: details 정답 보기
```ts
for (let dan = 2; dan <= 9; dan++) {
  let line = dan + '단:'
  for (let n = 1; n <= 9; n++) {
    line += ' ' + dan * n
  }
  console.log(line)
}
```

```text
2단: 2 4 6 8 10 12 14 16 18
3단: 3 6 9 12 15 18 21 24 27
4단: 4 8 12 16 20 24 28 32 36
5단: 5 10 15 20 25 30 35 40 45
6단: 6 12 18 24 30 36 42 48 54
7단: 7 14 21 28 35 42 49 56 63
8단: 8 16 24 32 40 48 56 64 72
9단: 9 18 27 36 45 54 63 72 81
```

`let line`을 **바깥 반복 안, 안쪽 반복 밖**에 둔 것이 핵심입니다. 단이 바뀔 때마다 새 줄로 시작하고, 안쪽 반복이 그 줄에 숫자를 쌓습니다.
:::

## 확인 퀴즈

**Q1.** `for (let i = 0; i < 3; i++)`에서 블록은 몇 번 실행되고, 반복이 끝났을 때 `i`는 얼마인가요?

::: details 정답 보기
3번(`i`가 0, 1, 2일 때) 실행되고, 끝났을 때 `i`는 `3`입니다. 조건 `3 < 3`이 거짓이 되어 빠져나옵니다.
:::

**Q2.** `while`과 `do...while`의 차이는 무엇인가요?

::: details 정답 보기
`while`은 조건을 먼저 검사해서 처음부터 거짓이면 한 번도 실행하지 않고, `do...while`은 블록을 먼저 한 번 실행한 뒤 조건을 검사합니다.
:::

**Q3.** `break`와 `continue`의 차이는?

::: details 정답 보기
`break`는 반복문 전체를 즉시 끝내고, `continue`는 이번 회차의 나머지만 건너뛰고 다음 회차로 넘어갑니다.
:::

**Q4.** 배열에 `for...in`을 쓰지 않는 이유는 무엇인가요?

::: details 정답 보기
`for...in`은 값이 아니라 **인덱스를 문자열로**(`'0'`, `'1'`…) 꺼내기 때문입니다. `i + 1`이 `'01'`이 되는 등 실수하기 쉽습니다. 배열의 값은 `for...of`로 꺼냅니다.
:::

**Q5.** 프로그램이 무한 루프에 빠졌을 때 터미널에서 멈추는 방법과, 무한 루프의 흔한 원인은?

::: details 정답 보기
`Ctrl + C`로 멈춥니다. 흔한 원인은 조건에 쓰인 변수를 블록 안에서 바꾸지 않았거나(`count++` 누락), 잘못된 방향으로 바꾼 것(`i--`)입니다.
:::

## 정리

- 반복문은 **시작 상태, 계속할 조건, 매번 하는 일** 세 가지로 이루어집니다.
- `for (초기화; 조건; 증감)`은 횟수가 정해진 반복에, `while (조건)`은 "조건이 맞는 동안"에, `do...while`은 최소 한 번 실행이 필요할 때 씁니다.
- 배열의 값을 모두 돌 때는 **`for...of`**가 기본입니다. 인덱스가 필요하면 `for (let i = 0; i < arr.length; i++)` — `<=`가 아니라 `<`.
- `for...in`은 **객체의 키**를 돌 때만 씁니다. 배열에 쓰면 문자열 인덱스가 나옵니다.
- `break`는 반복 끝내기, `continue`는 이번 회차 건너뛰기입니다.
- 무한 루프는 `Ctrl + C`로 멈추고, 조건 변수가 올바른 방향으로 바뀌는지 확인합니다.
- 헷갈리면 **표를 그려 회차별로 변수 값을 추적**합니다.

## 다음 단계

[함수 기초: 선언 · 화살표 함수 · 매개변수 · 반환값](./06-functions) — 지금까지 만든 합계 계산, 할인 계산 같은 코드를 이름 붙은 묶음(함수)으로 만들어, 필요할 때마다 다시 부르는 법을 배웁니다.
