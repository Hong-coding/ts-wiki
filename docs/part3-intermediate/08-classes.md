---
title: '클래스: 접근 제어자 · 추상 클래스 · implements'
---

# 클래스: 접근 제어자 · 추상 클래스 · implements

<LessonMeta level="중급" :minutes="60" prev="Partial · Pick · Omit · ReturnType 등 내장 유틸리티 타입으로 타입 파생하기" />

## 이번에 배울 것

- 클래스로 필드·생성자·메서드를 가진 객체를 만들고, `this`가 무엇을 가리키는지 설명할 수 있다.
- `public` · `private` · `protected` · `readonly`로 접근을 제어하고, `#private`과 `private`의 차이를 설명할 수 있다.
- 매개변수 속성, getter/setter, `static`을 쓸 수 있다.
- `extends`·`super`로 상속하고, `override`와 `noImplicitOverride`로 재정의 실수를 막을 수 있다.
- 추상 클래스와 `implements`의 차이를 알고, 클래스와 "인터페이스 + 함수" 중 알맞은 쪽을 고를 수 있다.

## 먼저 알아 둘 것

- [객체: 속성 · 메서드 · 구조 분해 · 스프레드](../part1-basics/08-objects)
- [스코프와 클로저](../part1-basics/10-scope-closure)
- [타입 별칭(type)과 인터페이스(interface)](../part2-types/07-type-alias-interface)
- [구조적 타이핑과 할당 가능성](./02-structural-typing): 클래스도 모양으로 판단한다는 것

## 비유로 이해하기

붕어빵 가게를 떠올려 보세요.

- **붕어빵 틀**은 하나입니다. 틀에는 "몸통 모양, 지느러미 모양, 속을 넣는 자리"가 정해져 있습니다.
- 틀로 구운 **붕어빵**은 여러 개입니다. 모양은 같지만 하나는 팥, 하나는 슈크림이 들어 있습니다.

**클래스**(class)는 붕어빵 틀, 클래스로 만든 **객체**는 붕어빵입니다. 클래스로 만든 객체를 **인스턴스**(instance, 실체)라고 부릅니다.

POS 단말을 예로 들면, `PosTerminal` 클래스는 "단말 번호가 있고, 개점·결제·마감을 할 수 있다"는 틀입니다. 강남점 1번 단말, 판교점 2번 단말은 이 틀로 만든 인스턴스입니다. 각 단말은 자기만의 단말 번호와 매출 합계를 가지지만, 결제하는 방법은 모두 같습니다.

여기에 TypeScript는 **"누가 무엇을 만질 수 있는가"** 라는 규칙을 더합니다. 단말의 매출 합계는 단말 스스로만 바꿀 수 있어야지, 아무 코드나 `sales = 0`으로 바꿔 버리면 안 됩니다. 이것이 **접근 제어자**입니다.

## 개념 설명

### 클래스 기초: 필드, 생성자, 메서드

```ts
class PosTerminal {
  // 필드(field): 인스턴스마다 가지는 데이터. 타입을 적습니다.
  terminalNo: string
  sales: number = 0 // 초깃값을 바로 줄 수도 있습니다.

  // 생성자(constructor): new로 인스턴스를 만들 때 한 번 실행됩니다.
  constructor(terminalNo: string) {
    this.terminalNo = terminalNo
  }

  // 메서드(method): 인스턴스가 할 수 있는 동작
  pay(amount: number): void {
    this.sales += amount
    console.log(`[${this.terminalNo}] ${amount}원 결제, 누적 ${this.sales}원`)
  }
}

// new 클래스이름(생성자 인수)로 인스턴스를 만듭니다.
const pos1 = new PosTerminal('POS-01')
const pos2 = new PosTerminal('POS-02')

pos1.pay(4500)
pos1.pay(3200)
pos2.pay(5000)
// 출력: [POS-01] 4500원 결제, 누적 4500원
// 출력: [POS-01] 3200원 결제, 누적 7700원
// 출력: [POS-02] 5000원 결제, 누적 5000원
```

해설:

- **필드**는 클래스 본문에 `이름: 타입`으로 선언합니다. TypeScript에서는 필드를 **미리 선언해야** `this.terminalNo = ...`처럼 쓸 수 있습니다.
- **`this`** 는 "지금 이 메서드를 호출한 인스턴스 자신"입니다. `pos1.pay()`에서는 `pos1`, `pos2.pay()`에서는 `pos2`입니다. 그래서 두 단말의 `sales`가 따로 쌓입니다.
- 클래스 이름은 **타입으로도** 쓸 수 있습니다. `const pos1: PosTerminal = new PosTerminal('POS-01')`처럼요.

#### strict 모드의 필드 초기화 검사

`strict` 모드에서는 필드가 생성자가 끝날 때까지 **반드시 값을 가져야** 합니다.

```ts
class Store {
  code: string
  name: string
  // ❌ Property 'name' has no initializer and is not definitely assigned in the constructor. (TS2564)

  constructor(code: string) {
    this.code = code
  }
}
```

`name`에 값을 넣지 않았으므로 인스턴스를 만들자마자 `name`이 `undefined`입니다. 초깃값을 주거나, 생성자에서 넣거나, 정말 없을 수 있다면 `name?: string`으로 선언합니다.

#### this를 잃어버리는 경우

메서드를 변수에 꺼내 담거나 콜백으로 넘기면 `this`가 사라질 수 있습니다. JavaScript의 `this`는 "어떻게 호출했느냐"로 정해지기 때문입니다.

```ts
class Counter {
  count = 0

  // 일반 메서드
  increase(): void {
    this.count++
  }

  // 화살표 함수 필드: 만들어질 때의 this를 기억합니다.
  increaseSafe = (): void => {
    this.count++
  }
}

const c = new Counter()

const safe = c.increaseSafe
safe() // ✅ this가 c로 고정되어 있음
console.log(c.count)
// 출력: 1

const unsafe = c.increase
try {
  unsafe() // this가 undefined가 되어 실행 중 오류
} catch (e) {
  console.log('this를 잃어버렸습니다')
}
// 출력: this를 잃어버렸습니다
```

버튼 클릭 이벤트처럼 메서드를 **콜백으로 넘길 일이 많다면** 화살표 함수 필드로 선언하거나, 넘길 때 `() => c.increase()`처럼 감싸 주세요.

### 접근 제어자: public · private · protected

TypeScript는 필드와 메서드 앞에 **접근 제어자**(access modifier)를 붙여 "어디서 접근할 수 있는지"를 정합니다.

| 제어자 | 클래스 안 | 자식 클래스 안 | 클래스 밖 |
|---|---|---|---|
| `public` (기본값) | ✅ | ✅ | ✅ |
| `protected` | ✅ | ✅ | ❌ |
| `private` | ✅ | ❌ | ❌ |

```ts
class PosTerminal {
  public terminalNo: string // public은 생략해도 같습니다.
  private sales = 0 // 이 클래스 안에서만
  protected openedAt: Date | null = null // 이 클래스와 자식 클래스 안에서만

  constructor(terminalNo: string) {
    this.terminalNo = terminalNo
  }

  open(): void {
    this.openedAt = new Date()
  }

  pay(amount: number): void {
    if (amount <= 0) throw new Error('결제 금액은 0보다 커야 합니다.')
    this.sales += amount // ✅ 클래스 안에서는 private에 접근 가능
  }

  getSales(): number {
    return this.sales
  }
}

const pos = new PosTerminal('POS-01')
pos.pay(4500)
console.log(pos.terminalNo, pos.getSales())

pos.sales = 0
// ❌ Property 'sales' is private and only accessible within class 'PosTerminal'. (TS2341)
pos.openedAt = null
// ❌ Property 'openedAt' is protected and only accessible within class 'PosTerminal' and its subclasses. (TS2445)
```

해설:

- `sales`를 `private`으로 막았으므로, 매출은 오직 `pay` 메서드를 통해서만 바뀝니다. `pay`에는 "0원 이하 결제 금지" 같은 규칙이 있으므로 **규칙을 거치지 않는 수정**을 막을 수 있습니다. 이렇게 데이터를 숨기고 정해진 메서드로만 다루게 하는 것을 **캡슐화**(encapsulation)라고 합니다.
- 읽기는 `getSales()`처럼 공개 메서드로 열어 둡니다.

### readonly: 처음 한 번만 정하기

`readonly` 필드는 **선언할 때나 생성자 안에서만** 값을 넣을 수 있고, 그 뒤로는 바꿀 수 없습니다.

```ts
class Receipt {
  readonly receiptNo: string
  readonly issuedAt = new Date()

  constructor(receiptNo: string) {
    this.receiptNo = receiptNo // ✅ 생성자에서는 가능
  }

  reissue(): void {
    this.receiptNo = 'R-9999'
    // ❌ Cannot assign to 'receiptNo' because it is a read-only property. (TS2540)
  }
}
```

영수증 번호, 주문 번호처럼 **한번 정해지면 절대 바뀌면 안 되는 값**에 씁니다. `private readonly`처럼 접근 제어자와 함께 쓸 수도 있습니다.

### 매개변수 속성: 선언과 대입을 한 번에

생성자 매개변수 앞에 접근 제어자나 `readonly`를 붙이면, **필드 선언과 `this.x = x` 대입을 한 번에** 해 줍니다. 이것을 **매개변수 속성**(parameter property)이라고 합니다.

```ts
// 길게 쓴 버전
class MemberLong {
  readonly memberNo: string
  private point: number

  constructor(memberNo: string, point: number) {
    this.memberNo = memberNo
    this.point = point
  }
}

// 매개변수 속성 버전: 위와 완전히 같습니다.
class Member {
  constructor(
    readonly memberNo: string,
    private point: number,
  ) {}

  addPoint(amount: number): number {
    this.point += amount
    return this.point
  }
}

const m = new Member('M0007', 1000)
console.log(m.memberNo, m.addPoint(500))
// 출력: M0007 1500
```

코드가 짧아져 실무에서 자주 씁니다. 다만 [모듈](./09-modules) 레슨에서 다룰 `erasableSyntaxOnly` 같은 설정(TypeScript 5.8+)이나 Node.js의 타입 제거 실행 방식에서는 매개변수 속성을 쓸 수 없으므로, 팀 설정을 확인하세요.

### #private과 private의 차이

JavaScript에도 비공개 필드 문법이 있습니다. 이름 앞에 `#`을 붙입니다(ES2022 표준).

```ts
class Wallet {
  private balanceTs = 1000 // TypeScript의 private
  #balanceJs = 1000 // JavaScript의 # 비공개 필드

  getBalances(): string {
    return `${this.balanceTs} / ${this.#balanceJs}`
  }
}

const w = new Wallet()
console.log(w.getBalances())
// 출력: 1000 / 1000

// TypeScript private: 컴파일 검사만 막을 뿐, 실행 중에는 그냥 보이는 속성입니다.
console.log((w as any).balanceTs)
// 출력: 1000

// # 비공개 필드: 실행 중에도 진짜로 숨겨져 있습니다.
console.log((w as any)['#balanceJs'])
// 출력: undefined
```

| 구분 | `private` (TypeScript) | `#필드` (JavaScript) |
|---|---|---|
| 막는 시점 | 컴파일할 때만 | 실행 중에도 |
| `as any`, `obj['name']`으로 접근 | 가능 (검사를 피할 수 있음) | 불가능 |
| `JSON.stringify`, `Object.keys` | 보임 | 보이지 않음 |
| 필요한 환경 | 어디서나 | ES2022 이상 또는 변환 |

**어느 것을 쓸까?** 라이브러리처럼 외부 코드가 절대 건드리면 안 되는 값이면 `#`이 더 확실합니다. 팀 내부 코드라면 `private`도 충분하며, 기존 코드 스타일을 따르는 것이 가장 좋습니다. 한 클래스 안에서 두 방식을 섞지는 마세요.

### getter와 setter

`get`과 `set`을 붙인 메서드는 **속성처럼 읽고 쓰지만 실제로는 함수가 실행**됩니다. 값을 읽을 때 계산하거나, 쓸 때 검사하고 싶을 때 씁니다.

```ts
class CartItem {
  #qty = 1

  constructor(
    readonly name: string,
    readonly unitPrice: number,
  ) {}

  // 읽을 때 계산되는 속성
  get total(): number {
    return this.unitPrice * this.#qty
  }

  get qty(): number {
    return this.#qty
  }

  // 쓸 때 검사하는 속성
  set qty(value: number) {
    if (!Number.isInteger(value) || value < 1) {
      throw new Error(`수량은 1 이상의 정수여야 합니다: ${value}`)
    }
    this.#qty = value
  }
}

const item = new CartItem('아메리카노', 4500)
item.qty = 3 // setter 실행
console.log(item.qty, item.total) // getter 실행
// 출력: 3 13500

try {
  item.qty = 0
} catch (e) {
  console.log((e as Error).message)
}
// 출력: 수량은 1 이상의 정수여야 합니다: 0

item.total = 0
// ❌ Cannot assign to 'total' because it is a read-only property. (TS2540)
```

`set` 없이 `get`만 있으면 TypeScript는 그 속성을 **읽기 전용**으로 취급합니다.

### static: 인스턴스가 아니라 클래스에 붙은 것

`static`을 붙인 필드·메서드는 인스턴스마다 따로 있지 않고 **클래스 자체에 하나만** 있습니다. `클래스이름.이름`으로 접근합니다.

```ts
class OrderNo {
  static #seq = 0 // 모든 주문이 함께 쓰는 일련번호
  static readonly PREFIX = 'A'

  // 인스턴스 없이 호출하는 메서드
  static next(): string {
    OrderNo.#seq++
    return `${OrderNo.PREFIX}-${String(OrderNo.#seq).padStart(4, '0')}`
  }
}

console.log(OrderNo.next())
console.log(OrderNo.next())
// 출력: A-0001
// 출력: A-0002
```

일련번호 발급기, 설정 상수, 인스턴스를 만드는 **팩토리 메서드**(`Money.of(1000)` 같은) 등에 씁니다. `static` 메서드 안의 `this`는 인스턴스가 아니라 클래스 자체라는 점에 주의하세요.

### 상속: extends와 super

**상속**(inheritance)은 기존 클래스(부모)의 필드와 메서드를 물려받아 새 클래스(자식)를 만드는 것입니다. `extends`를 씁니다.

```ts
class Device {
  constructor(
    readonly deviceId: string,
    protected connected = false,
  ) {}

  connect(): void {
    this.connected = true
    console.log(`${this.deviceId} 연결됨`)
  }
}

// 영수증 프린터는 Device를 물려받습니다.
class ReceiptPrinter extends Device {
  constructor(
    deviceId: string,
    readonly paperWidth: number,
  ) {
    super(deviceId) // 부모 생성자를 먼저 호출해야 합니다.
  }

  print(text: string): void {
    if (!this.connected) {
      // protected라서 자식 클래스에서 접근 가능
      console.log('먼저 연결하세요.')
      return
    }
    console.log(`(${this.paperWidth}mm) ${text}`)
  }
}

const printer = new ReceiptPrinter('PRN-01', 80)
printer.print('테스트')
printer.connect() // 부모에게서 물려받은 메서드
printer.print('영수증 출력')
// 출력: 먼저 연결하세요.
// 출력: PRN-01 연결됨
// 출력: (80mm) 영수증 출력
```

해설:

- 자식 클래스의 생성자에서는 **`this`를 쓰기 전에 반드시 `super(...)`** 로 부모 생성자를 호출해야 합니다. 부모 부분이 먼저 만들어져야 하기 때문입니다.
- 자식은 부모의 `public`, `protected` 멤버를 쓸 수 있고, `private` 멤버는 쓸 수 없습니다.
- `ReceiptPrinter`의 인스턴스는 `Device` 타입 자리에도 넣을 수 있습니다(속성이 더 많은 쪽 → 적은 쪽).

### override와 noImplicitOverride

자식 클래스는 부모의 메서드를 **같은 이름으로 다시 정의**(재정의, override)할 수 있습니다. 이때 `override` 키워드를 붙이면 "부모에 이 메서드가 있어야 한다"는 것을 컴파일러가 확인해 줍니다(TypeScript 4.3+).

```ts
class Device {
  constructor(readonly deviceId: string) {}

  describe(): string {
    return `장치 ${this.deviceId}`
  }
}

class CardReader extends Device {
  // 부모의 describe를 재정의합니다.
  override describe(): string {
    return `${super.describe()} (카드 리더)` // super.메서드()로 부모 버전 호출
  }

  // 부모에 없는 메서드에 override를 붙이면 오류입니다.
  override reset(): void {
    // ❌ This member cannot have an 'override' modifier because it is not declared in the base class 'Device'. (TS4113)
  }
}
```

`override`가 왜 필요할까요? 부모 클래스의 메서드 이름이 `describe`에서 `getDescription`으로 바뀌었다고 해 봅시다. `override`가 없으면 자식의 `describe`는 조용히 **새 메서드**가 되어 버리고, 재정의는 깨집니다. `override`를 붙여 두면 이런 변경을 바로 오류로 알려 줍니다.

tsconfig에서 **`noImplicitOverride`** 를 켜면, 재정의하는 메서드에 `override`를 **빠뜨린 경우**도 오류로 잡습니다.

```ts
// tsconfig.json에서 noImplicitOverride: true일 때
class Device {
  describe(): string {
    return '장치'
  }
}

class Scanner extends Device {
  describe(): string {
    // ❌ This member must have an 'override' modifier because it overrides a member in the base class 'Device'. (TS4114)
    return '바코드 스캐너'
  }
}
```

`noImplicitOverride`는 `strict`에 포함되지 않으므로 따로 켜야 합니다. 상속을 쓰는 프로젝트라면 켜 두기를 권합니다. tsconfig 설정은 [tsconfig.json 완전 정복](../part6-tooling/01-tsconfig)에서 다룹니다.

### 추상 클래스: 직접 만들 수 없는 틀

**추상 클래스**(abstract class)는 `new`로 직접 인스턴스를 만들 수 없고, **상속받아서만** 쓰는 클래스입니다. "공통 동작은 여기 구현해 두되, 일부는 자식이 반드시 채워라"라는 뜻입니다.

```ts
abstract class PaymentProcessor {
  constructor(protected readonly storeCode: string) {}

  // 추상 메서드: 몸통 없이 선언만. 자식이 반드시 구현해야 합니다.
  protected abstract approve(amount: number): string

  // 공통 동작: 모든 결제 수단이 같은 순서로 처리합니다.
  process(amount: number): void {
    if (amount <= 0) throw new Error('금액 오류')
    const approvalNo = this.approve(amount)
    console.log(`[${this.storeCode}] ${amount}원 승인 ${approvalNo}`)
  }
}

class CardProcessor extends PaymentProcessor {
  protected override approve(amount: number): string {
    return `CARD-${amount}`
  }
}

class PointProcessor extends PaymentProcessor {
  protected override approve(amount: number): string {
    return `PT-${amount}`
  }
}

const processors: PaymentProcessor[] = [new CardProcessor('S001'), new PointProcessor('S001')]
processors.forEach((p) => p.process(5000))
// 출력: [S001] 5000원 승인 CARD-5000
// 출력: [S001] 5000원 승인 PT-5000

new PaymentProcessor('S001')
// ❌ Cannot create an instance of an abstract class. (TS2511)
```

추상 메서드를 구현하지 않은 자식 클래스도 오류가 납니다.

```ts
abstract class PaymentProcessor {
  protected abstract approve(amount: number): string
}

class CashProcessor extends PaymentProcessor {}
// ❌ Non-abstract class 'CashProcessor' does not implement inherited abstract member approve from class 'PaymentProcessor'. (TS2515)
```

### implements: 인터페이스의 약속 지키기

`implements`는 "이 클래스는 이 인터페이스의 모양을 갖추겠다"는 **약속**입니다. 상속과 달리 아무것도 물려받지 않고, **검사만** 합니다.

```ts
interface Printable {
  print(text: string): void
}

interface Connectable {
  connect(): void
  readonly connected: boolean
}

// 여러 인터페이스를 쉼표로 구현할 수 있습니다.
class LabelPrinter implements Printable, Connectable {
  connected = false

  connect(): void {
    this.connected = true
  }

  print(text: string): void {
    console.log(`라벨: ${text}`)
  }
}

const lp = new LabelPrinter()
lp.connect()
lp.print('아메리카노 4,500원')
// 출력: 라벨: 아메리카노 4,500원

class BrokenPrinter implements Printable {}
// ❌ Class 'BrokenPrinter' incorrectly implements interface 'Printable'. (TS2420)
```

| 구분 | `extends` (클래스 상속) | `implements` (인터페이스 구현) |
|---|---|---|
| 물려받는 것 | 필드·메서드 구현 | 없음 (모양 검사만) |
| 개수 | 하나만 | 여러 개 가능 |
| 실행 중 영향 | 있음 (부모 코드가 실행됨) | 없음 (컴파일 후 사라짐) |

::: tip implements는 필수가 아닙니다
[구조적 타이핑](./02-structural-typing) 덕분에 `implements`를 쓰지 않아도 모양이 맞으면 `Printable` 자리에 넣을 수 있습니다. 그래도 `implements`를 쓰면 **클래스를 선언하는 자리에서** 빠진 메서드를 바로 알려 주므로, "이 클래스는 이 역할을 한다"는 의도를 드러낼 때 씁니다.
:::

### 클래스 vs 인터페이스 + 함수: 무엇을 고를까?

JavaScript·TypeScript에서는 클래스 없이 **데이터는 인터페이스(또는 type)로, 동작은 함수로** 나누어 쓰는 방식도 흔합니다.

```ts
// 방식 1: 클래스
class CartA {
  private items: { name: string; price: number }[] = []
  add(name: string, price: number): void {
    this.items.push({ name, price })
  }
  total(): number {
    return this.items.reduce((sum, i) => sum + i.price, 0)
  }
}

// 방식 2: 인터페이스 + 함수 (데이터와 동작 분리)
interface CartB {
  items: { name: string; price: number }[]
}
function addItem(cart: CartB, name: string, price: number): CartB {
  return { items: [...cart.items, { name, price }] } // 새 객체를 반환(불변)
}
function cartTotal(cart: CartB): number {
  return cart.items.reduce((sum, i) => sum + i.price, 0)
}

const a = new CartA()
a.add('아메리카노', 4500)

let b: CartB = { items: [] }
b = addItem(b, '아메리카노', 4500)

console.log(a.total(), cartTotal(b))
// 출력: 4500 4500
```

| 이런 경우 | 추천 |
|---|---|
| 내부 상태를 숨기고 규칙을 지키며 바꿔야 한다 (단말 연결, 매출 누적) | 클래스 |
| 같은 틀의 여러 구현을 바꿔 끼운다 (결제 수단별 처리기) | 클래스 + 추상 클래스/인터페이스 |
| 프레임워크가 클래스를 요구한다 (NestJS, Angular 등) | 클래스 |
| 서버에서 받은 JSON처럼 **데이터를 주고받는** 것이 주목적이다 | 인터페이스 + 함수 |
| React·Vue 상태처럼 **불변 데이터**로 다루는 편이 좋다 | 인터페이스 + 함수 |
| 동작 없이 묶음 값만 필요하다 | 인터페이스(또는 type) |

특히 서버에서 받은 JSON은 **클래스 인스턴스가 아닙니다.** `JSON.parse` 결과에는 클래스의 메서드가 없으므로, API 데이터는 인터페이스로 타입을 붙이는 편이 자연스럽습니다.

## 자주 하는 실수

### 실수 1: 자식 생성자에서 super 전에 this 쓰기

```ts
class Device {
  constructor(readonly deviceId: string) {}
}

class Scanner extends Device {
  model: string

  constructor(deviceId: string, model: string) {
    this.model = model
    // ❌ 'super' must be called before accessing 'this' in the constructor of a derived class. (TS17009)
    super(deviceId)
  }
}
```

**왜 틀렸나:** 자식 인스턴스는 부모 부분이 먼저 만들어진 뒤에야 쓸 수 있습니다. `super(...)`보다 먼저 `this`에 접근하면 실행 중에도 오류가 납니다.

```ts
class Device {
  constructor(readonly deviceId: string) {}
}

class Scanner extends Device {
  model: string

  constructor(deviceId: string, model: string) {
    super(deviceId) // ✅ 먼저 부모 생성자
    this.model = model
  }
}

const s = new Scanner('SCN-01', 'ZB-100')
console.log(s.deviceId, s.model)
// 출력: SCN-01 ZB-100
```

### 실수 2: private이면 실행 중에도 안전하다고 생각하기

```ts
class Account {
  constructor(private password: string) {}
}

const acc = new Account('secret1234')
// 로그로 객체를 그대로 남겼습니다.
console.log(JSON.stringify(acc))
// 출력: {"password":"secret1234"}
```

**왜 틀렸나:** TypeScript의 `private`은 컴파일 검사일 뿐, 실행 중에는 평범한 속성입니다. `JSON.stringify`나 로그에 그대로 나옵니다. 민감한 정보가 로그에 남으면 보안 사고로 이어집니다.

```ts
class Account {
  // ✅ # 비공개 필드는 JSON.stringify에도 나오지 않습니다.
  #password: string

  constructor(readonly userId: string, password: string) {
    this.#password = password
  }

  matches(input: string): boolean {
    return this.#password === input
  }
}

const acc = new Account('kim', 'secret1234')
console.log(JSON.stringify(acc), acc.matches('secret1234'))
// 출력: {"userId":"kim"} true
```

실무에서는 비밀번호 원문을 객체에 오래 들고 있지 않는 것이 더 근본적인 해결책입니다.

### 실수 3: 메서드를 콜백으로 넘겨 this를 잃기

```ts
class Cart {
  items: string[] = []

  add(name: string): void {
    this.items.push(name)
  }
}

const cart = new Cart()
const names = ['아메리카노', '스콘']

try {
  names.forEach(cart.add) // 메서드만 떼어서 넘겼습니다.
} catch (e) {
  console.log('오류:', (e as Error).message)
}
// 출력: 오류: Cannot read properties of undefined (reading 'items')
```

**왜 틀렸나:** `cart.add`를 떼어서 넘기면 `forEach`가 호출할 때 `this`가 `cart`가 아니게 됩니다. 컴파일러는 이 실수를 기본적으로 잡지 못합니다.

```ts
class Cart {
  items: string[] = []

  // ✅ 방법 1: 화살표 함수 필드로 this를 고정
  add = (name: string): void => {
    this.items.push(name)
  }
}

const cart = new Cart()
const names = ['아메리카노', '스콘']

names.forEach(cart.add)
// ✅ 방법 2: 넘길 때 감싸기 — names.forEach((n) => cart.add(n))
console.log(cart.items)
// 출력: [ '아메리카노', '스콘' ]
```

### 실수 4: API 응답을 클래스 타입으로 받기

```ts
class Product {
  constructor(
    readonly name: string,
    readonly price: number,
  ) {}

  label(): string {
    return `${this.name} ${this.price}원`
  }
}

// 서버 응답을 클래스 타입으로 단언했습니다.
const data = JSON.parse('{"name":"아메리카노","price":4500}') as Product

try {
  console.log(data.label())
} catch (e) {
  console.log('오류:', (e as Error).message)
}
// 출력: 오류: data.label is not a function
```

**왜 틀렸나:** `JSON.parse` 결과는 평범한 객체라서 클래스의 메서드가 없습니다. `as Product`는 타입만 바꿀 뿐 인스턴스를 만들어 주지 않습니다.

```ts
class Product {
  constructor(
    readonly name: string,
    readonly price: number,
  ) {}

  label(): string {
    return `${this.name} ${this.price}원`
  }
}

// ✅ 데이터 모양은 인터페이스로 받고, 필요하면 new로 인스턴스를 만듭니다.
interface ProductDto {
  name: string
  price: number
}

const dto = JSON.parse('{"name":"아메리카노","price":4500}') as ProductDto
const product = new Product(dto.name, dto.price)
console.log(product.label())
// 출력: 아메리카노 4500원
```

`as ProductDto`도 실제 검사는 하지 않으므로, 외부 데이터는 [런타임 검증](../part4-async/05-runtime-validation)으로 확인하는 것이 안전합니다.

## 직접 해 보기

### 문제 1 ⭐ 기초

다음 조건을 만족하는 `Coupon` 클래스를 만드세요.

- 생성할 때 쿠폰 코드(`code`)와 할인 금액(`discount`)을 받습니다. 둘 다 바꿀 수 없습니다(매개변수 속성 사용).
- `used`(사용 여부)는 클래스 밖에서 직접 바꿀 수 없습니다.
- `use()`를 호출하면 사용 처리하고, 이미 사용했으면 오류를 던집니다.

::: details 정답 보기
```ts
class Coupon {
  private used = false

  constructor(
    readonly code: string,
    readonly discount: number,
  ) {}

  use(): number {
    if (this.used) throw new Error(`이미 사용한 쿠폰: ${this.code}`)
    this.used = true
    return this.discount
  }

  isUsed(): boolean {
    return this.used
  }
}

const c = new Coupon('WELCOME', 3000)
console.log(c.use(), c.isUsed())
// 출력: 3000 true

try {
  c.use()
} catch (e) {
  console.log((e as Error).message)
}
// 출력: 이미 사용한 쿠폰: WELCOME
```
:::

### 문제 2 ⭐ 기초

`Temperature` 클래스에 섭씨 온도를 저장하고, `fahrenheit` getter로 화씨 온도(`섭씨 × 9 / 5 + 32`)를 읽을 수 있게 하세요. `fahrenheit`에 값을 대입하면 컴파일 오류가 나야 합니다.

::: details 정답 보기
```ts
class Temperature {
  constructor(public celsius: number) {}

  get fahrenheit(): number {
    return (this.celsius * 9) / 5 + 32
  }
}

const t = new Temperature(4) // 냉장 쇼케이스 온도
console.log(t.fahrenheit)
// 출력: 39.2

t.fahrenheit = 50
// ❌ Cannot assign to 'fahrenheit' because it is a read-only property. (TS2540)
```
:::

### 문제 3 ⭐⭐ 응용

추상 클래스 `Discount`를 만드세요. 추상 메서드 `calc(price: number): number`(할인 금액)를 두고, 공통 메서드 `apply(price)`는 `price - calc(price)`를 0 이상으로 반환합니다. 정액 할인 `FixedDiscount`와 정률 할인 `RateDiscount`를 구현하세요.

::: details 정답 보기
```ts
abstract class Discount {
  abstract calc(price: number): number

  apply(price: number): number {
    return Math.max(0, price - this.calc(price))
  }
}

class FixedDiscount extends Discount {
  constructor(private amount: number) {
    super()
  }
  override calc(): number {
    return this.amount
  }
}

class RateDiscount extends Discount {
  constructor(private rate: number) {
    super()
  }
  override calc(price: number): number {
    return Math.round((price * this.rate) / 100)
  }
}

const discounts: Discount[] = [new FixedDiscount(1500), new RateDiscount(10)]
console.log(discounts.map((d) => d.apply(10000)))
// 출력: [ 8500, 9000 ]
```
`FixedDiscount`의 `calc()`는 매개변수를 받지 않지만 재정의할 수 있습니다. 매개변수가 더 적은 함수는 더 많은 함수 자리에 들어갈 수 있기 때문입니다([변성](../part5-advanced/07-variance)에서 자세히 배웁니다).
:::

### 문제 4 ⭐⭐ 응용

`Notifier` 인터페이스(`send(to: string, message: string): void`)를 만들고, 이를 `implements`하는 `SmsNotifier`와 `EmailNotifier` 클래스를 만드세요. 그리고 `Notifier` 배열을 돌며 모두에게 "주문 완료" 메시지를 보내 보세요.

::: details 정답 보기
```ts
interface Notifier {
  send(to: string, message: string): void
}

class SmsNotifier implements Notifier {
  send(to: string, message: string): void {
    console.log(`SMS → ${to}: ${message}`)
  }
}

class EmailNotifier implements Notifier {
  send(to: string, message: string): void {
    console.log(`메일 → ${to}: ${message}`)
  }
}

const notifiers: Notifier[] = [new SmsNotifier(), new EmailNotifier()]
notifiers.forEach((n) => n.send('김하늘', '주문 완료'))
// 출력: SMS → 김하늘: 주문 완료
// 출력: 메일 → 김하늘: 주문 완료
```
:::

### 문제 5 ⭐⭐⭐ 도전

아래 코드는 `noImplicitOverride`를 켠 프로젝트에서 오류가 납니다. 오류 두 개를 찾아 고치고, 각 오류가 어떤 실수를 막아 주는지 설명하세요.

```text
// tsconfig.json에서 noImplicitOverride: true
class Order {
  total(): number {
    return 0
  }
  printSummary(): string {
    return `합계 ${this.total()}원`
  }
}

class DeliveryOrder extends Order {
  total(): number {
    return 3000
  }
  override printSumary(): string {
    return `[배달] ${super.printSummary()}`
  }
}
```

::: details 정답 보기
- `total()`: 부모 메서드를 재정의하는데 `override`가 없습니다(TS4114). "부모에 같은 이름이 있는 줄 모르고 덮어쓰는" 실수를 막아 줍니다.
- `printSumary()`: 오타라서 부모에 없는 메서드인데 `override`를 붙였습니다(TS4113). 재정의하려던 메서드 이름을 잘못 쓴 실수를 막아 줍니다.

```ts
// tsconfig.json에서 noImplicitOverride: true
class Order {
  total(): number {
    return 0
  }
  printSummary(): string {
    return `합계 ${this.total()}원`
  }
}

class DeliveryOrder extends Order {
  override total(): number {
    return 3000
  }
  override printSummary(): string {
    return `[배달] ${super.printSummary()}`
  }
}

console.log(new DeliveryOrder().printSummary())
// 출력: [배달] 합계 3000원
```
부모의 `printSummary`가 `this.total()`을 호출하는데, `this`가 `DeliveryOrder` 인스턴스이므로 재정의된 `total()`(3000)이 쓰입니다.
:::

## 확인 퀴즈

1. 클래스와 인스턴스의 관계를 붕어빵에 빗대어 설명해 보세요.
2. `public`, `protected`, `private` 각각 어디서 접근할 수 있나요?
3. TypeScript의 `private`과 JavaScript의 `#필드`의 가장 큰 차이는 무엇인가요?
4. `override` 키워드와 `noImplicitOverride` 옵션은 각각 어떤 실수를 막나요?
5. 추상 클래스와 `implements`(인터페이스)의 차이는 무엇인가요?
6. 서버에서 받은 JSON 데이터에 클래스보다 인터페이스로 타입을 붙이는 편이 자연스러운 이유는 무엇인가요?

::: details 정답 보기
1. 클래스는 붕어빵 틀, 인스턴스는 그 틀로 구운 붕어빵입니다. 모양(필드·메서드)은 같지만 속(필드 값)은 각자 다릅니다.
2. `public`은 어디서나, `protected`는 그 클래스와 자식 클래스 안에서, `private`은 그 클래스 안에서만 접근할 수 있습니다.
3. `private`은 컴파일 검사일 뿐 실행 중에는 보이는 속성이고, `#필드`는 실행 중에도 진짜로 숨겨집니다.
4. `override`는 부모에 없는 메서드를 재정의한다고 착각하는 실수(오타, 부모 메서드 이름 변경)를, `noImplicitOverride`는 부모 메서드를 모르고 덮어쓰는 실수(`override` 누락)를 막습니다.
5. 추상 클래스는 구현(공통 메서드)을 물려줄 수 있고 하나만 상속할 수 있습니다. 인터페이스는 모양 검사만 하고 여러 개를 구현할 수 있으며 실행 중에는 사라집니다.
6. `JSON.parse` 결과는 평범한 객체라서 클래스의 메서드가 없기 때문입니다. `as`로 클래스 타입을 붙여도 인스턴스가 되지 않습니다.
:::

## 정리

- 클래스는 필드·생성자·메서드를 묶은 틀이고, `new`로 인스턴스를 만듭니다. `this`는 메서드를 호출한 인스턴스입니다.
- `public`·`protected`·`private`·`readonly`로 접근을 제어해 규칙을 거치지 않는 수정을 막습니다(캡슐화).
- 매개변수 속성은 필드 선언과 대입을 한 번에 합니다. `#필드`는 실행 중에도 숨겨지는 JS 표준 비공개 필드입니다.
- getter/setter는 속성처럼 쓰는 함수, `static`은 클래스 자체에 하나만 있는 멤버입니다.
- 상속은 `extends`와 `super`, 재정의는 `override`로 표시하고 `noImplicitOverride`로 누락을 잡습니다.
- 추상 클래스는 공통 구현 + 강제할 메서드를, `implements`는 모양 약속만을 표현합니다.
- 상태와 규칙을 숨겨야 하면 클래스, 데이터를 주고받는 것이 주목적이면 인터페이스 + 함수를 고릅니다.

## 다음 단계

[모듈: import/export와 타입 전용 import](./09-modules): 지금까지 한 파일에 모아 쓰던 타입·함수·클래스를 여러 파일로 나누고, `import`/`export`와 `import type`으로 안전하게 연결하는 방법을 배웁니다.
