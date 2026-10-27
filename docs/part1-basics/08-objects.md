---
title: '객체: 속성 · 메서드 · 구조 분해 · 스프레드'
---

# 객체: 속성 · 메서드 · 구조 분해 · 스프레드

<LessonMeta level="입문" :minutes="60" prev="배열에 값을 모으고 map·filter·reduce로 가공했습니다." />

## 이번에 배울 것

- **객체 리터럴**로 관련된 정보를 하나로 묶고, `.`과 `[]`로 **속성**을 읽고 바꿀 수 있다.
- 객체 안에 함수(**메서드**)를 넣고, `this`가 무엇을 가리키는지 기초 수준에서 설명할 수 있다.
- **구조 분해**와 **스프레드**로 객체를 짧고 안전하게 다룰 수 있다.
- 객체가 **참조**로 전달된다는 것을 이해하고, 얕은 복사와 깊은 복사(`structuredClone`)를 구분할 수 있다.
- `Object.keys`·`values`·`entries`와 배열 메서드로 **객체 배열**을 다룰 수 있다.

## 먼저 알아 둘 것

- [함수 기초](./06-functions) — 화살표 함수, 매개변수
- [배열과 배열 메서드](./07-arrays) — `map`, `filter`, `reduce`, 스프레드 맛보기

## 비유로 이해하기

상품 하나를 등록하려면 정보가 여러 개 필요합니다. 이름, 가격, 재고, 판매 여부... 이걸 변수로 따로따로 만들면 이렇게 됩니다.

```text
productName = '아메리카노'
productPrice = 4500
productStock = 120
productIsOnSale = true
```

상품이 열 개면 변수가 40개입니다. 어떤 가격이 어떤 상품 것인지도 헷갈립니다.

**객체**(object)는 **상품 정보 카드 한 장**입니다.

```text
┌─────────────── 상품 카드 ───────────────┐
│ name     : 아메리카노                    │
│ price    : 4500                          │
│ stock    : 120                           │
│ isOnSale : true                          │
└──────────────────────────────────────────┘
```

카드 왼쪽의 항목 이름(`name`, `price`)을 **키**(key), 오른쪽 내용을 **값**(value)이라고 하고, 키와 값 한 쌍을 **속성**(property)이라고 부릅니다. 배열이 "번호로 찾는 선반"이라면 객체는 "**이름으로 찾는 카드**"입니다.

## 개념 설명

### 객체 리터럴 만들기

중괄호 `{ }` 안에 `키: 값`을 쉼표로 나열합니다. 이렇게 코드에 직접 적어 만드는 객체를 **객체 리터럴**(object literal)이라고 합니다.

```ts
const product = {
  name: '아메리카노',
  price: 4500,
  stock: 120,
  isOnSale: true,
}

console.log(product)
```

실행 결과:

```text
{ name: '아메리카노', price: 4500, stock: 120, isOnSale: true }
```

VS Code에서 `product` 위에 마우스를 올리면 TypeScript가 추론한 **객체의 모양**이 보입니다.

```text
const product: {
    name: string;
    price: number;
    stock: number;
    isOnSale: boolean;
}
```

"이 객체에는 이런 이름의 속성이 있고, 각각 이런 타입이다"라는 정보입니다. 이 모양에 이름을 붙여 재사용하는 방법(`type`, `interface`)은 [객체 타입](../part2-types/04-object-types)과 [타입 별칭과 인터페이스](../part2-types/07-type-alias-interface)에서 배웁니다.

### 속성 읽기: 점(.)과 대괄호([])

```ts
const product = { name: '아메리카노', price: 4500 }

console.log(product.name)     // 출력: 아메리카노
console.log(product['price']) // 출력: 4500
```

- **점 표기법** `product.name`: 가장 많이 씁니다. 키 이름을 코드에 직접 적을 때.
- **대괄호 표기법** `product['price']`: 키를 **문자열**로 넘깁니다. 키가 변수에 들어 있거나, 키에 공백·하이픈 같은 특수 문자가 있을 때 씁니다.

```ts
const salesByChannel = {
  'pos-01': 320000,
  'kiosk-01': 185000,
}
console.log(salesByChannel['pos-01']) // 출력: 320000
// salesByChannel.pos-01 은 "pos 빼기 01"로 읽혀서 안 됩니다
```

없는 속성을 읽으려 하면 TypeScript가 막아 줍니다. 오타를 바로 잡을 수 있는 큰 장점입니다.

```ts
const product = { name: '아메리카노', price: 4500 }
console.log(product.prise)
// ❌ Property 'prise' does not exist on type '{ name: string; price: number; }'. Did you mean 'price'? (TS2551)
```

### 속성 바꾸기·추가하기·삭제하기

**바꾸기**는 변수처럼 `=`로 새 값을 넣습니다. `const` 객체여도 속성은 바꿀 수 있습니다. `const`는 "변수에 다른 객체를 다시 넣는 것"만 막기 때문입니다(아래 "참조"에서 이유를 봅니다).

```ts
const product = { name: '아메리카노', price: 4500 }
product.price = 4800
console.log(product) // 출력: { name: '아메리카노', price: 4800 }
```

**추가하기**는 JavaScript에서는 그냥 새 키에 값을 넣으면 되지만, TypeScript는 **처음 만든 모양에 없는 속성**은 막습니다.

```ts
const product = { name: '아메리카노', price: 4500 }
product.stock = 100
// ❌ Property 'stock' does not exist on type '{ name: string; price: number; }'. (TS2339)
```

처음에는 불편해 보이지만, "상품 객체에는 이 속성들만 있다"는 약속을 지켜 주기 때문에 오타로 엉뚱한 속성이 생기는 일을 막아 줍니다. 나중에 생길 수 있는 속성은 처음부터 모양에 포함시키는 것이 TypeScript 방식입니다.

```ts
const product = { name: '아메리카노', price: 4500, stock: 0 }
product.stock = 100
console.log(product.stock) // 출력: 100
```

"있을 수도 있고 없을 수도 있는" 속성은 **선택 속성**(`stock?: number`)으로 표현하는데, [객체 타입](../part2-types/04-object-types)에서 배웁니다.

**삭제하기**는 `delete` 연산자를 씁니다. 하지만 TypeScript에서는 반드시 있어야 하는 속성을 지우지 못하게 막습니다.

```ts
const product = { name: '아메리카노', price: 4500 }
delete product.price
// ❌ The operand of a 'delete' operator must be optional. (TS2790)
```

실무에서는 `delete`로 원본을 고치기보다, 필요 없는 속성을 뺀 **새 객체**를 만드는 방법을 더 많이 씁니다. 이 레슨 뒤쪽의 "나머지 속성" 부분에서 봅니다.

### 메서드: 객체 안의 함수

객체의 속성 값으로 함수를 넣을 수 있습니다. 이런 함수를 **메서드**(method)라고 부릅니다. 배열의 `push`, `map`도 배열 객체에 붙은 메서드였습니다.

```ts
const cart = {
  storeName: '한빛 카페 강남점',
  total: 0,
  add(price: number) {
    this.total = this.total + price
  },
  printTotal() {
    console.log(this.storeName, '합계:', this.total)
  },
}

cart.add(4500)
cart.add(5000)
cart.printTotal() // 출력: 한빛 카페 강남점 합계: 9500
```

- `add(price: number) { ... }`는 `add: function (price: number) { ... }`를 줄인 **메서드 단축 문법**입니다.
- 메서드 안의 **`this`** 는 "이 메서드를 부른 객체"를 가리킵니다. `cart.add(4500)`으로 불렀으므로 `this`는 `cart`입니다. 그래서 `this.total`은 `cart.total`입니다.

#### this는 "점 앞의 객체"로 정해집니다

`this`는 함수를 **만든 곳**이 아니라 **부른 방식**으로 정해집니다. 그래서 메서드를 객체에서 떼어 내 부르면 `this`를 잃어버립니다.

```ts
const cart = {
  total: 9500,
  printTotal() {
    console.log('합계:', this.total)
  },
}

cart.printTotal() // 출력: 합계: 9500

const print = cart.printTotal
print()
// 실행하면: TypeError: Cannot read properties of undefined (reading 'total')
```

`print()`에는 점 앞의 객체가 없으므로 `this`가 `undefined`가 되어 실행 오류가 납니다. TypeScript는 이 실수를 잡지 못하니 "메서드는 `객체.메서드()` 모양으로 부른다"를 기억하세요.

#### 화살표 함수는 메서드로 쓰지 않습니다

화살표 함수는 자기만의 `this`가 없고, **바깥의 `this`** 를 그대로 씁니다. 그래서 객체의 메서드로 쓰면 객체를 가리키지 못합니다.

```ts
const cart = {
  total: 9500,
  printTotal: () => {
    console.log(this.total)
  },
}
// ❌ The containing arrow function captures the global value of 'this'. (TS7041)
// ❌ Element implicitly has an 'any' type because type 'typeof globalThis' has no index signature. (TS7017)
```

화살표 함수 안의 `this`가 `cart`가 아니라 파일 전체의 `this`(전역)를 가리킨다는 경고입니다. 파일에 `import`나 `export`가 있는 **모듈** 파일이면 전역 `this`가 `undefined`이므로 대신 `Object is possibly 'undefined'. (TS2532)`가 나옵니다. 어느 쪽이든 "이 `this`는 `cart`가 아니다"라는 뜻입니다.

메서드는 단축 문법(`printTotal() { }`)으로 쓰고, 화살표 함수는 메서드 **안에서** 콜백으로 쓰는 것이 기본입니다. `this`는 [클래스](../part3-intermediate/08-classes)에서 더 깊이 다룹니다.

### 단축 속성 이름

키 이름과 값으로 쓸 변수 이름이 같으면 한 번만 쓸 수 있습니다. 이것을 **단축 속성**(shorthand property)이라고 합니다.

```ts
const name = '카페라떼'
const price = 5000

const longForm = { name: name, price: price }
const shortForm = { name, price }

console.log(shortForm) // 출력: { name: '카페라떼', price: 5000 }
```

함수에서 객체를 만들어 돌려줄 때 아주 자주 씁니다.

```ts
function createOrderItem(productName: string, quantity: number) {
  const createdAt = '2026-10-26'
  return { productName, quantity, createdAt }
}

console.log(createOrderItem('녹차', 2))
// 출력: { productName: '녹차', quantity: 2, createdAt: '2026-10-26' }
```

### 구조 분해 할당

객체에서 속성 여러 개를 꺼내 변수로 만들 때, 하나씩 쓰면 길어집니다.

```ts
const member = { memberId: 'M001', memberName: '김민지', grade: 'VIP', point: 3200 }

const memberName1 = member.memberName
const grade1 = member.grade
```

**구조 분해 할당**(destructuring assignment)을 쓰면 한 줄로 끝납니다. "객체의 구조를 분해해서 변수에 나눠 담는다"는 뜻입니다.

```ts
const member = { memberId: 'M001', memberName: '김민지', grade: 'VIP', point: 3200 }

const { memberName, grade } = member
console.log(memberName, grade) // 출력: 김민지 VIP
```

왼쪽의 `{ memberName, grade }`는 객체를 만드는 게 아니라 "`member`에서 `memberName`, `grade` 속성을 꺼내 **같은 이름의 변수**를 만들라"는 뜻입니다.

#### 기본값

속성 값이 `undefined`이면 쓸 기본값을 정할 수 있습니다.

```ts
const options: { pageSize?: number; sortBy?: string } = { sortBy: 'price' }

const { pageSize = 20, sortBy = 'name' } = options
console.log(pageSize, sortBy) // 출력: 20 price
```

`pageSize?: number`의 `?`는 "있을 수도 없을 수도 있는 속성"이라는 표시입니다(앞에서 말한 선택 속성). `pageSize`가 없으므로 기본값 `20`, `sortBy`는 있으므로 `'price'`가 들어갑니다.

#### 이름 바꾸기

꺼내면서 변수 이름을 바꾸려면 `원래이름: 새이름`으로 씁니다.

```ts
const product = { name: '아메리카노', price: 4500 }
const { name: productName, price: unitPrice } = product
console.log(productName, unitPrice) // 출력: 아메리카노 4500
```

::: warning 콜론의 뜻이 다릅니다
구조 분해의 `{ name: productName }`에서 콜론은 **타입이 아니라 새 이름**입니다. 타입 표기와 헷갈리기 쉬우니 주의하세요. 구조 분해에 타입을 붙이려면 `const { name }: { name: string } = product`처럼 전체 뒤에 붙입니다.
:::

#### 중첩 구조 분해

객체 안의 객체에서도 꺼낼 수 있습니다.

```ts
const order = {
  orderNo: 'A-1001',
  customer: { name: '박서준', phone: '010-****-1234' },
}

const {
  orderNo,
  customer: { name },
} = order
console.log(orderNo, name) // 출력: A-1001 박서준
```

`customer: { name }`은 "`customer` 안으로 들어가서 `name`을 꺼내라"는 뜻입니다. 이때 `customer`라는 변수는 만들어지지 않습니다. 중첩이 깊어지면 읽기 어려우니 두 단계 정도까지만 쓰는 것이 좋습니다.

#### 매개변수에서 구조 분해

함수 매개변수 자리에서 바로 구조 분해하면, 인자를 이름으로 넘길 수 있어 순서 실수가 사라집니다.

```ts
function printLine({ name, price, quantity }: { name: string; price: number; quantity: number }) {
  console.log(name, 'x' + quantity, price * quantity)
}

printLine({ name: '마카롱', quantity: 3, price: 2500 })
// 출력: 마카롱 x3 7500
```

배열도 구조 분해할 수 있습니다. 배열은 이름이 아니라 **순서**로 꺼냅니다.

```ts
const [first, second] = ['A-101', 'A-102', 'A-103']
console.log(first, second) // 출력: A-101 A-102
```

### 스프레드: 펼쳐서 새 객체 만들기

배열에서 본 `...`은 객체에도 쓸 수 있습니다. **스프레드**(spread, 펼치기)는 객체의 속성을 모두 꺼내 새 객체 안에 펼쳐 넣습니다.

```ts
const product = { name: '아메리카노', price: 4500, stock: 120 }

const copy = { ...product }
const discounted = { ...product, price: 4000 }

console.log(copy)       // 출력: { name: '아메리카노', price: 4500, stock: 120 }
console.log(discounted) // 출력: { name: '아메리카노', price: 4000, stock: 120 }
console.log(product)    // 출력: { name: '아메리카노', price: 4500, stock: 120 }
```

- `{ ...product }`는 속성을 모두 복사한 **새 객체**입니다.
- `{ ...product, price: 4000 }`처럼 뒤에 같은 키를 쓰면 **뒤의 값이 이깁니다**. 원본은 그대로 두고 일부만 바꾼 새 객체를 만드는, 실무에서 가장 많이 쓰는 패턴입니다.
- 두 객체를 합칠 수도 있습니다: `{ ...defaults, ...userSettings }`

순서가 중요합니다.

```ts
const product = { name: '아메리카노', price: 4500 }
console.log({ price: 4000, ...product }) // 출력: { price: 4500, name: '아메리카노' }
// ❌ 'price' is specified more than once, so this usage will be overwritten. (TS2783)
```

`price: 4000`을 먼저 쓰고 `...product`를 뒤에 펼쳤기 때문에, 원래 값 `4500`이 덮어써 버렸습니다. 이렇게 앞에 쓴 값이 반드시 덮어써지는 경우는 TypeScript가 "이 값은 쓰이지 않는다"고 에러로 알려 줍니다. 무시하고 실행하면 위와 같은 결과가 나옵니다.

#### 나머지 속성: 일부를 빼고 새 객체 만들기

구조 분해에서 `...`을 쓰면 "꺼내고 남은 나머지"를 새 객체로 받습니다.

```ts
const member = { memberId: 'M001', memberName: '김민지', password: 'hashed-value', grade: 'VIP' }

const { password, ...safeMember } = member
console.log(safeMember) // 출력: { memberId: 'M001', memberName: '김민지', grade: 'VIP' }
```

비밀번호처럼 화면이나 로그에 보내면 안 되는 속성을 뺀 객체를 만들 때 유용합니다. `delete`와 달리 원본 `member`는 그대로입니다.

### 참조: 객체는 "위치"를 담습니다

이 레슨에서 가장 중요한 부분입니다. 숫자·문자열 같은 원시 값과 객체는 변수에 담기는 방식이 다릅니다.

```ts
let a = 100
let b = a
b = 200
console.log(a, b) // 출력: 100 200

const productA = { name: '아메리카노', price: 4500 }
const productB = productA
productB.price = 9999
console.log(productA.price, productB.price) // 출력: 9999 9999
```

숫자는 복사되어 `a`는 그대로인데, 객체는 `productB`만 바꿨는데 `productA`도 바뀌었습니다.

```text
원시 값: 값 자체가 상자에 들어감
  a ─ [ 100 ]       b ─ [ 200 ]       ← 서로 다른 상자

객체: 상자에는 "객체가 있는 위치"만 들어감
  productA ─ [ 위치 #7 ] ─┐
                          ├──▶  { name: '아메리카노', price: 9999 }  (메모리 #7)
  productB ─ [ 위치 #7 ] ─┘
```

`const productB = productA`는 객체를 복사한 것이 아니라 **같은 객체를 가리키는 위치(참조)를 복사**한 것입니다. 둘은 이름만 다를 뿐 같은 객체를 가리킵니다. 이것을 **참조**(reference)라고 합니다. 배열도 객체의 한 종류이므로 똑같이 동작합니다.

이제 `const`인데 속성을 바꿀 수 있는 이유도 설명됩니다. `const`는 상자 안의 "위치"를 바꾸지 못하게 할 뿐, 그 위치에 있는 객체의 내용까지 얼리지는 않습니다.

함수에 객체를 넘길 때도 참조가 넘어갑니다. 그래서 함수 안에서 속성을 바꾸면 바깥 객체도 바뀝니다.

```ts
function applyMemberPrice(product: { name: string; price: number }) {
  product.price = product.price - 500 // 원본을 바꿔 버림
  return product
}

const latte = { name: '카페라떼', price: 5000 }
const memberLatte = applyMemberPrice(latte)
console.log(latte.price, memberLatte.price) // 출력: 4500 4500
```

회원가를 계산했을 뿐인데 원래 가격까지 바뀌었습니다. [배열](./07-arrays)에서 본 것과 같은 **부수 효과**입니다. 스프레드로 새 객체를 만들어 돌려주면 해결됩니다.

```ts
function applyMemberPrice(product: { name: string; price: number }) {
  return { ...product, price: product.price - 500 }
}

const latte = { name: '카페라떼', price: 5000 }
const memberLatte = applyMemberPrice(latte)
console.log(latte.price, memberLatte.price) // 출력: 5000 4500
```

### 얕은 복사와 깊은 복사

스프레드 복사에는 한계가 있습니다. **겉 한 겹만** 새로 만들고, 안쪽 객체는 여전히 참조를 공유합니다. 이것을 **얕은 복사**(shallow copy)라고 합니다.

```ts
const order = {
  orderNo: 'A-1001',
  customer: { name: '박서준', grade: 'GOLD' },
}

const copied = { ...order }
copied.orderNo = 'A-1002'
copied.customer.grade = 'VIP'

console.log(order.orderNo)        // 출력: A-1001  ← 겉 속성은 독립
console.log(order.customer.grade) // 출력: VIP     ← 안쪽 객체는 공유!
```

```text
order  ──▶ { orderNo: 'A-1001', customer: ─┐ }
                                           ├──▶ { name: '박서준', grade: 'VIP' }
copied ──▶ { orderNo: 'A-1002', customer: ─┘ }
```

안쪽까지 모두 새로 만드는 것을 **깊은 복사**(deep copy)라고 합니다. 내장 함수 `structuredClone`을 쓰면 됩니다.

```ts
const order = {
  orderNo: 'A-1001',
  customer: { name: '박서준', grade: 'GOLD' },
}

const deepCopied = structuredClone(order)
deepCopied.customer.grade = 'VIP'

console.log(order.customer.grade)      // 출력: GOLD
console.log(deepCopied.customer.grade) // 출력: VIP
```

::: info structuredClone 지원 환경
`structuredClone`은 Node.js 17 이상과 최신 브라우저에서 쓸 수 있습니다. TypeScript는 `lib`에 `dom`이 포함되어 있거나 Node.js 타입(`@types/node`)이 설치되어 있어야 이 함수를 압니다. 함수(메서드)가 들어 있는 객체는 복사할 수 없고 오류가 납니다. 예전 코드에서 보이는 `JSON.parse(JSON.stringify(obj))` 방식은 `Date`나 `undefined`를 망가뜨리므로 권하지 않습니다([JSON · Date · Map · Set](../part4-async/06-json-date-map-set) 참고).
:::

| 방법 | 복사 깊이 | 언제 쓰나 |
|---|---|---|
| `const b = a` | 복사 아님 (같은 객체) | 같은 객체를 다른 이름으로 부를 때 |
| `{ ...a }` | 얕은 복사 (겉 한 겹) | 속성 몇 개만 바꾼 새 객체가 필요할 때 (대부분) |
| `structuredClone(a)` | 깊은 복사 (전부) | 중첩 객체까지 독립적으로 고쳐야 할 때 |

실무에서는 중첩된 부분도 스프레드로 필요한 곳만 새로 만드는 방식을 많이 씁니다.

```ts
const order = {
  orderNo: 'A-1001',
  customer: { name: '박서준', grade: 'GOLD' },
}

const upgraded = { ...order, customer: { ...order.customer, grade: 'VIP' } }
console.log(order.customer.grade, upgraded.customer.grade) // 출력: GOLD VIP
```

### Object.keys · values · entries

객체의 키나 값을 **배열로** 꺼내면, 배열에서 배운 메서드를 모두 쓸 수 있습니다.

```ts
const dailySales = { mon: 320000, tue: 285000, wed: 410000 }

console.log(Object.keys(dailySales))    // 출력: [ 'mon', 'tue', 'wed' ]
console.log(Object.values(dailySales))  // 출력: [ 320000, 285000, 410000 ]
console.log(Object.entries(dailySales)) // 출력: [ [ 'mon', 320000 ], [ 'tue', 285000 ], [ 'wed', 410000 ] ]

const weekTotal = Object.values(dailySales).reduce((sum, amount) => sum + amount, 0)
console.log(weekTotal) // 출력: 1015000
```

- `Object.keys(객체)`: 키 배열
- `Object.values(객체)`: 값 배열
- `Object.entries(객체)`: `[키, 값]` 쌍의 배열

`entries`는 `for...of`와 배열 구조 분해를 함께 쓰면 읽기 좋습니다.

```ts
const dailySales = { mon: 320000, tue: 285000, wed: 410000 }

for (const [day, amount] of Object.entries(dailySales)) {
  console.log(day, amount)
}
```

```text
mon 320000
tue 285000
wed 410000
```

::: info Object.keys의 타입은 string[]
`Object.keys(dailySales)`의 타입은 `('mon' | 'tue' | 'wed')[]`가 아니라 그냥 `string[]`입니다. 객체에 타입에 적히지 않은 속성이 더 있을 수도 있다고 TypeScript가 조심스럽게 판단하기 때문입니다. 그래서 `dailySales[key]`처럼 다시 꺼내려 하면 에러가 날 수 있는데, 이 문제와 해결법은 [keyof · typeof](../part3-intermediate/06-keyof-typeof-indexed)에서 다룹니다. 값이 필요하면 처음부터 `Object.values`나 `Object.entries`를 쓰는 편이 간단합니다.
:::

### 객체 배열 다루기

실무 데이터는 대부분 "객체의 배열"입니다. 주문 목록, 회원 목록, 상품 목록 모두 그렇습니다. 지금까지 배운 것을 모두 합쳐 보겠습니다.

```ts
const products = [
  { code: 'P001', name: '아메리카노', category: '커피', price: 4500 },
  { code: 'P002', name: '카페라떼', category: '커피', price: 5000 },
  { code: 'P003', name: '자몽에이드', category: '음료', price: 6000 },
  { code: 'P004', name: '치즈케이크', category: '디저트', price: 6500 },
]

// 1) 조건으로 찾기
const latte = products.find((p) => p.code === 'P002')
console.log(latte?.name) // 출력: 카페라떼

// 2) 커피만 이름 목록으로
const coffeeNames = products.filter((p) => p.category === '커피').map((p) => p.name)
console.log(coffeeNames) // 출력: [ '아메리카노', '카페라떼' ]

// 3) 전 상품 10% 인상한 새 목록 (원본 유지)
const raised = products.map((p) => ({ ...p, price: Math.round(p.price * 1.1) }))
console.log(raised[0].price, products[0].price) // 출력: 4950 4500

// 4) 가격 내림차순 정렬 (복사 후 정렬)
const byPrice = [...products].sort((a, b) => b.price - a.price)
console.log(byPrice.map((p) => p.name)) // 출력: [ '치즈케이크', '자몽에이드', '카페라떼', '아메리카노' ]

// 5) 카테고리별 개수 세기
const countByCategory = products.reduce(
  (acc, p) => ({ ...acc, [p.category]: (acc[p.category] ?? 0) + 1 }),
  {} as Record<string, number>,
)
console.log(countByCategory) // 출력: { '커피': 2, '음료': 1, '디저트': 1 }
```

새로 나온 문법을 짚어 보겠습니다.

- `latte?.name`: `latte`가 `undefined`일 수 있으므로(못 찾았을 때), **옵셔널 체이닝** `?.`으로 "있으면 `name`을 읽고 없으면 `undefined`"라고 씁니다. [연산자](./03-operators)에서 배운 문법입니다.
- `map((p) => ({ ...p, price: ... }))`: 화살표 함수에서 객체를 바로 돌려줄 때는 소괄호로 감싼다고 [함수 기초](./06-functions)에서 배웠습니다. 스프레드로 각 상품의 **새 객체**를 만들어 원본을 지킵니다.
- `[p.category]: ...`: 키 자리에 대괄호를 쓰면 **변수 값을 키로** 씁니다. 이것을 **계산된 속성 이름**(computed property name)이라고 합니다.
- `acc[p.category] ?? 0`: 아직 그 카테고리가 없으면 `undefined`이므로 `??`로 `0`을 대신 씁니다.
- `{} as Record<string, number>`: 빈 객체 `{}`만으로는 TypeScript가 "어떤 키와 값이 들어올지" 알 수 없어서, "문자열 키에 숫자 값이 들어가는 객체"라고 알려 준 것입니다. `as`는 [타입 단언](../part2-types/10-assertion), `Record`는 [유틸리티 타입](../part3-intermediate/07-utility-types)에서 배웁니다. 지금은 "빈 객체로 시작하는 `reduce`에는 이런 표시가 필요하다" 정도로 넘어가도 됩니다.

## 자주 하는 실수

### 실수 1. 복사했다고 생각하고 원본을 바꾸기

```ts
const original = { name: '아메리카노', price: 4500 }
const edited = original
edited.price = 5000
console.log(original.price) // 출력: 5000
```

**왜 틀렸나**: `=`는 객체를 복사하지 않고 참조만 복사합니다. `edited`와 `original`은 같은 객체입니다.

**고친 코드**: 스프레드로 새 객체를 만듭니다.

```ts
const original = { name: '아메리카노', price: 4500 }
const edited = { ...original, price: 5000 }
console.log(original.price, edited.price) // 출력: 4500 5000
```

### 실수 2. 중첩 객체를 스프레드 한 번으로 복사했다고 믿기

```ts
const settings = { storeName: '강남점', receipt: { showLogo: true } }
const copied = { ...settings }
copied.receipt.showLogo = false
console.log(settings.receipt.showLogo) // 출력: false
```

**왜 틀렸나**: 스프레드는 얕은 복사라서 `receipt` 객체는 공유됩니다.

**고친 코드**: 바꿀 안쪽 객체도 스프레드하거나 `structuredClone`을 씁니다.

```ts
const settings = { storeName: '강남점', receipt: { showLogo: true } }
const copied = { ...settings, receipt: { ...settings.receipt, showLogo: false } }
console.log(settings.receipt.showLogo, copied.receipt.showLogo) // 출력: true false
```

### 실수 3. 화살표 함수를 메서드로 쓰기

```ts
const counter = {
  count: 0,
  increase: () => {
    this.count++
  },
}
// ❌ The containing arrow function captures the global value of 'this'. (TS7041)
// ❌ Element implicitly has an 'any' type because type 'typeof globalThis' has no index signature. (TS7017)
```

**왜 틀렸나**: 화살표 함수에는 자기 `this`가 없어서 `counter`를 가리키지 못합니다(모듈 파일에서는 에러 메시지가 `Object is possibly 'undefined'. (TS2532)`로 나옵니다).

**고친 코드**: 메서드 단축 문법을 씁니다.

```ts
const counter = {
  count: 0,
  increase() {
    this.count++
  },
}
counter.increase()
counter.increase()
console.log(counter.count) // 출력: 2
```

### 실수 4. 화살표 함수에서 객체를 괄호 없이 돌려주기

```ts
const products = [{ name: '생수', price: 900 }]
const withVat = products.map((p) => { name: p.name, price: p.price * 1.1 })
// ❌ ';' expected. (TS1005)
// ❌ Cannot find name 'price'. (TS2304)
```

**왜 틀렸나**: 중괄호를 객체가 아니라 함수 본문으로 읽기 때문에, 안의 `name: p.name, price: ...`를 이상한 코드로 해석해 엉뚱한 에러가 납니다. 에러 메시지만 봐서는 원인을 짐작하기 어려운 대표적인 경우입니다.

**고친 코드**: 객체를 소괄호로 감쌉니다.

```ts
const products = [{ name: '생수', price: 900 }]
const withVat = products.map((p) => ({ name: p.name, price: Math.round(p.price * 1.1) }))
console.log(withVat) // 출력: [ { name: '생수', price: 990 } ]
```

### 실수 5. 구조 분해 이름 바꾸기를 타입 표기로 착각하기

```ts
const product = { name: '아메리카노', price: 4500 }
const { price: number } = product
console.log(price)
// ❌ Cannot find name 'price'. (TS2304)
```

**왜 틀렸나**: `{ price: number }`는 "`price`를 꺼내 `number`라는 이름의 변수에 담아라"라는 뜻입니다. 타입 표기가 아닙니다. 그래서 `price`라는 변수는 생기지 않았습니다.

**고친 코드**:

```ts
const product = { name: '아메리카노', price: 4500 }
const { price } = product
console.log(price) // 출력: 4500
```

## 직접 해 보기

### 문제 1. 회원 카드 만들기 ⭐

회원 번호 `'M100'`, 이름 `'이하늘'`, 등급 `'GOLD'`, 포인트 `1500`인 회원 객체 `member`를 만들고, 점 표기법으로 이름과 포인트를 출력하세요. 그다음 포인트에 `500`을 더하고 다시 출력하세요.

::: details 정답 보기
```ts
const member = { memberId: 'M100', memberName: '이하늘', grade: 'GOLD', point: 1500 }
console.log(member.memberName, member.point) // 출력: 이하늘 1500

member.point = member.point + 500
console.log(member.point) // 출력: 2000
```
:::

### 문제 2. 구조 분해로 영수증 머리글 ⭐

아래 객체에서 구조 분해로 `storeName`, `posNo`를 꺼내고, `cashier`는 `staffName`이라는 이름으로 꺼내 출력하세요. `phone`이 없으면 `'미등록'`이 나오게 기본값을 주세요.

```ts
const receiptHeader: { storeName: string; posNo: number; cashier: string; phone?: string } = {
  storeName: '한빛 마트 역삼점',
  posNo: 2,
  cashier: '최유진',
}
```

::: details 정답 보기
```ts
const receiptHeader: { storeName: string; posNo: number; cashier: string; phone?: string } = {
  storeName: '한빛 마트 역삼점',
  posNo: 2,
  cashier: '최유진',
}

const { storeName, posNo, cashier: staffName, phone = '미등록' } = receiptHeader
console.log(storeName, posNo, staffName, phone)
// 출력: 한빛 마트 역삼점 2 최유진 미등록
```
:::

### 문제 3. 원본을 지키는 할인 적용 ⭐⭐

상품 객체와 할인율을 받아 **할인된 가격의 새 상품 객체**를 돌려주는 함수 `applyDiscount`를 만드세요. 원본 객체는 바뀌면 안 됩니다. 가격은 `Math.round`로 반올림합니다.

::: details 정답 보기
```ts
function applyDiscount(product: { name: string; price: number }, rate: number) {
  return { ...product, price: Math.round(product.price * (1 - rate)) }
}

const cake = { name: '치즈케이크', price: 6500 }
const saleCake = applyDiscount(cake, 0.15)

console.log(saleCake) // 출력: { name: '치즈케이크', price: 5525 }
console.log(cake)     // 출력: { name: '치즈케이크', price: 6500 }
```
:::

### 문제 4. 장바구니 합계 ⭐⭐

장바구니 객체 배열에서 총 수량과 총 금액을 구해 `{ totalQuantity, totalAmount }` 모양의 객체로 출력하세요(단축 속성 사용).

```ts
const cart = [
  { name: '생수', price: 900, quantity: 6 },
  { name: '컵라면', price: 1300, quantity: 4 },
  { name: '바나나우유', price: 1700, quantity: 2 },
]
```

::: details 정답 보기
```ts
const cart = [
  { name: '생수', price: 900, quantity: 6 },
  { name: '컵라면', price: 1300, quantity: 4 },
  { name: '바나나우유', price: 1700, quantity: 2 },
]

const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0)
const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

console.log({ totalQuantity, totalAmount })
// 출력: { totalQuantity: 12, totalAmount: 14000 }
```
:::

### 문제 5. 민감 정보 빼고 로그 남기기 ⭐⭐

아래 회원 객체에서 `password`와 `phone`을 뺀 새 객체를 만들어 출력하세요. 원본은 바꾸지 마세요.

```ts
const member = {
  memberId: 'M200',
  memberName: '정다은',
  password: 'hashed-value',
  phone: '010-****-5678',
  grade: 'NORMAL',
}
```

::: details 정답 보기
```ts
const member = {
  memberId: 'M200',
  memberName: '정다은',
  password: 'hashed-value',
  phone: '010-****-5678',
  grade: 'NORMAL',
}

const { password, phone, ...loggable } = member
console.log(loggable)
// 출력: { memberId: 'M200', memberName: '정다은', grade: 'NORMAL' }
```

비밀번호·전화번호 같은 민감 정보는 로그에 남기지 않는 것이 실무 원칙입니다. 나머지 속성 문법으로 빼고 남은 것만 기록합니다.
:::

### 문제 6. 매출 요약 ⭐⭐⭐

아래 요일별 매출 객체에서 `Object.entries`를 써서 (1) 주간 합계, (2) 매출이 가장 높은 요일과 금액을 구해 출력하세요.

```ts
const dailySales = { mon: 320000, tue: 285000, wed: 410000, thu: 298000, fri: 452000 }
```

::: details 정답 보기
```ts
const dailySales = { mon: 320000, tue: 285000, wed: 410000, thu: 298000, fri: 452000 }
const entries = Object.entries(dailySales)

const weekTotal = entries.reduce((sum, [, amount]) => sum + amount, 0)

let bestDay = ''
let bestAmount = 0
for (const [day, amount] of entries) {
  if (amount > bestAmount) {
    bestDay = day
    bestAmount = amount
  }
}

console.log(weekTotal)          // 출력: 1765000
console.log(bestDay, bestAmount) // 출력: fri 452000
```

`[, amount]`는 배열 구조 분해에서 첫 번째 요소(요일)를 건너뛰고 두 번째만 꺼내는 문법입니다.
:::

## 확인 퀴즈

**Q1.** 키에 하이픈이 있는 속성 `'pos-01'`을 읽으려면 어떻게 써야 하나요?

::: details 정답 보기
대괄호 표기법 `obj['pos-01']`을 씁니다. 점 표기법으로 쓰면 `obj.pos - 01`처럼 빼기로 해석됩니다.
:::

**Q2.** `const a = { x: 1 }; const b = a; b.x = 2;` 다음 `a.x`는 얼마인가요? 그 이유는?

::: details 정답 보기
`2`입니다. `b = a`는 객체를 복사하지 않고 같은 객체를 가리키는 참조를 복사하므로, `a`와 `b`는 같은 객체입니다.
:::

**Q3.** `{ ...product, price: 0 }`과 `{ price: 0, ...product }`의 차이는 무엇인가요?

::: details 정답 보기
뒤에 쓴 값이 이깁니다. 앞의 것은 `price`가 `0`이 되고, 뒤의 것은 `product`의 원래 `price`가 `0`을 덮어씁니다.
:::

**Q4.** 얕은 복사와 깊은 복사의 차이를 한 문장으로 설명하고, 깊은 복사를 하는 내장 함수 이름을 쓰세요.

::: details 정답 보기
얕은 복사는 겉 한 겹만 새로 만들고 안쪽 객체는 공유하며, 깊은 복사는 안쪽 객체까지 모두 새로 만듭니다. 내장 함수는 `structuredClone`입니다.
:::

**Q5.** 객체의 메서드를 화살표 함수로 만들면 왜 문제가 되나요?

::: details 정답 보기
화살표 함수에는 자기만의 `this`가 없어 바깥의 `this`를 쓰기 때문에, 메서드 안의 `this`가 그 객체를 가리키지 않습니다.
:::

## 정리

- 객체는 `키: 값` 속성의 묶음입니다. `.`으로 읽는 것이 기본이고, 키가 변수이거나 특수 문자가 있으면 `[]`를 씁니다.
- TypeScript는 처음 만든 객체의 **모양**을 기억해서, 없는 속성 읽기·추가·필수 속성 삭제를 막아 줍니다.
- 메서드 안의 `this`는 "점 앞의 객체"입니다. 메서드는 단축 문법으로 쓰고 화살표 함수로 쓰지 않습니다.
- **구조 분해**로 속성을 변수로 꺼내고(기본값, 이름 바꾸기, 중첩), **스프레드**로 일부만 바꾼 새 객체를 만듭니다.
- 객체는 **참조**로 전달됩니다. `=`는 복사가 아니고, `{ ...obj }`는 얕은 복사, `structuredClone`은 깊은 복사입니다.
- `Object.keys`·`values`·`entries`로 객체를 배열로 바꾸면 배열 메서드를 모두 쓸 수 있습니다.

## 다음 단계

[문자열 다루기와 템플릿 리터럴](./09-strings) — 상품명 다듬기, 주문 번호 자르기, 금액에 쉼표 찍기 같은 문자열 작업을 배우고, 지금까지 배운 것을 모아 영수증을 출력합니다.
