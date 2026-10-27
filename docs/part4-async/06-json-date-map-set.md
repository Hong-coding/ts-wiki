---
title: JSON · Date · Map · Set 타입 안전하게 쓰기
---

# JSON · Date · Map · Set 타입 안전하게 쓰기

<LessonMeta level="중급" :minutes="45" prev="타입 소거와 런타임 검증, zod로 스키마를 만들고 검증하는 법" />

## 이번에 배울 것

- `JSON.parse`의 결과를 `any`가 아니라 `unknown`으로 받아 안전하게 쓸 수 있다.
- `JSON.stringify`가 `Date`·`undefined`·`Map`·`Set`을 어떻게 바꾸거나 버리는지 설명할 수 있다.
- UTC와 한국 시간(KST)의 차이를 이해하고, 날짜를 원하는 시간대로 포맷할 수 있다.
- `Map<K, V>`와 `Set<T>`에 타입을 붙여 쓰고, `get`이 `undefined`를 돌려줄 수 있음을 처리할 수 있다.
- 객체(`Record`)와 `Map` 중 상황에 맞는 것을 고를 수 있다.

## 먼저 알아 둘 것

- 런타임 검증과 zod: [런타임 검증](./05-runtime-validation)
- `unknown`과 좁히기: [특수 타입](../part2-types/02-special-types), [타입 좁히기](../part2-types/08-narrowing)
- `Record<K, V>`: [내장 유틸리티 타입](../part3-intermediate/07-utility-types)
- 인덱스 시그니처: [객체 타입](../part2-types/04-object-types)
- 제네릭 타입 읽기: [제네릭 기초](../part3-intermediate/04-generics-basics)

## 비유로 이해하기

매장에서 본사로 **팩스**를 보낸다고 생각해 보겠습니다.

- 팩스는 **글자와 숫자만** 보낼 수 있습니다. 실물 영수증 묶음(`Map`), 도장 찍힌 날짜 스탬프(`Date`)를 넣으면, 받는 쪽에는 **그 모양을 베낀 글자**만 도착합니다. 받은 사람이 다시 "이건 날짜구나" 하고 해석해야 합니다. 이것이 **JSON 직렬화**(serialization, 값을 글자로 바꾸기)입니다.
- 매장은 서울에 있고 본사 서버는 **세계 표준시(UTC)** 로 시계를 맞춰 둡니다. 서울은 UTC보다 9시간 빠릅니다. 밤 12시 30분에 결제한 영수증이 서버 기록에는 "전날 15시 30분"으로 남습니다. 날짜만 잘라 쓰면 **어제 매출**로 잡힙니다.
- **`Map`** 은 서랍장입니다. 서랍 이름표(키)로 내용물(값)을 넣고 꺼내는데, 없는 이름표를 찾으면 "그런 서랍 없음(`undefined`)"이라고 알려 줍니다.
- **`Set`** 은 방명록 도장입니다. 같은 손님이 두 번 와도 한 번만 기록됩니다.

## 개념 설명

### 1단계: JSON.parse는 any를 돌려준다

JSON(JavaScript Object Notation)은 데이터를 글자로 주고받는 형식입니다. 문자열을 값으로 바꾸는 것이 `JSON.parse`, 값을 문자열로 바꾸는 것이 `JSON.stringify`입니다.

TypeScript에서 `JSON.parse`의 반환 타입은 **`any`** 입니다. 어떤 문자열이 들어올지 모르기 때문입니다.

```ts
const data = JSON.parse('{"name":"아메리카노","price":"4500"}') // data: any
const price: number = data.price // ✅ 통과 — 실제로는 문자열 "4500"
console.log(price + 500)
// 출력: 4500500
```

`any`라서 `number` 변수에 문자열이 그대로 들어갔고, 덧셈이 문자열 이어 붙이기가 되었습니다. 파트 소개에서 본 바로 그 사고입니다.

#### 해결: unknown으로 받고 검증하기

```ts
import { z } from 'zod'

const ProductSchema = z.object({ name: z.string(), price: z.number() })

const raw: unknown = JSON.parse('{"name":"아메리카노","price":"4500"}') // 일단 unknown으로
const result = ProductSchema.safeParse(raw)
if (result.success) {
  console.log(result.data.price + 500)
} else {
  console.log('형식 오류:', result.error.issues[0]?.message)
}
// 출력: 형식 오류: Invalid input: expected number, received string
```

규칙은 지난 레슨과 같습니다. **`JSON.parse`의 결과는 경계에서 들어온 값**이므로 `unknown`으로 받고 검증합니다. `localStorage`, 파일, 메시지 큐에서 읽은 문자열도 모두 해당합니다.

#### JSON.parse는 실패할 수도 있다

문자열이 JSON 형식이 아니면 `JSON.parse`는 **`SyntaxError`를 던집니다.**

```ts
JSON.parse('{point:1200}') // 속성 이름에 따옴표가 없음
// SyntaxError: Expected property name or '}' in JSON at position 1 (line 1 column 2)
```

`localStorage`에 저장된 값이 깨졌거나 서버가 HTML 오류 페이지를 보낸 경우 흔히 생깁니다. 바깥에서 온 문자열을 파싱할 때는 `try/catch`로 감쌉니다(문제 1). (메시지 문구는 Node.js 기준이며 환경마다 다릅니다.)

### 2단계: JSON.stringify의 함정

`JSON.stringify`는 JSON에 없는 값을 **조용히 바꾸거나 버립니다.** 오류도 경고도 없습니다.

```ts
const order = {
  orderNo: 'O-20261023-001',
  orderedAt: new Date('2026-10-23T05:30:00Z'),
  memo: undefined,
  items: ['아메리카노', undefined, '라테'],
  options: new Map([['샷', 2]]),
  tags: new Set(['포장', '할인']),
  discountRate: NaN,
  print: () => '영수증',
}
console.log(JSON.stringify(order))
```

```text
{"orderNo":"O-20261023-001","orderedAt":"2026-10-23T05:30:00.000Z","items":["아메리카노",null,"라테"],"options":{},"tags":{},"discountRate":null}
```

| 원래 값 | `JSON.stringify` 결과 | 주의할 점 |
|---|---|---|
| `Date` | ISO 문자열 `"2026-10-23T05:30:00.000Z"` | 다시 `parse`하면 **문자열**로 돌아옴(Date 아님) |
| 속성 값 `undefined` | **속성째 사라짐** (`memo`) | "값 없음"을 보내려면 `null`을 씀 |
| 배열 안의 `undefined` | `null` | 배열 길이는 유지됨 |
| `Map`, `Set` | **`{}`** (빈 객체) | 내용이 전부 사라짐! |
| `NaN`, `Infinity` | `null` | |
| 함수 | 속성째 사라짐 (`print`) | |
| `BigInt` (`10n`) | **`TypeError`를 던짐** | `Do not know how to serialize a BigInt` |

특히 `Map`·`Set`이 `{}`가 되는 것은 아주 흔한 사고입니다. 장바구니를 `Map`으로 관리하다가 `localStorage`에 저장했는데, 다시 열어 보니 장바구니가 비어 있는 식입니다.

#### Date는 돌아올 때 문자열이다

```ts
const json = JSON.stringify({ orderedAt: new Date('2026-10-23T05:30:00Z') })
const back = JSON.parse(json)
console.log(typeof back.orderedAt, back.orderedAt)
// 출력: string 2026-10-23T05:30:00.000Z
```

`back`이 `any`라서 `back.orderedAt.getHours()`라고 써도 컴파일은 통과하지만 실행하면 `getHours is not a function` 오류가 납니다. 문자열을 `Date`로 되돌리려면 `new Date(문자열)`을 쓰거나, zod에서 `z.coerce.date()`처럼 변환하는 스키마를 씁니다.

`JSON.parse`의 두 번째 인자 **reviver**(되살리는 함수)로 파싱하면서 바꿀 수도 있습니다.

```ts
const text = '{"orderNo":"O-1","orderedAt":"2026-10-23T05:30:00.000Z"}'
const withDate = JSON.parse(text, (key, value) =>
  key === 'orderedAt' && typeof value === 'string' ? new Date(value) : value,
)
console.log(withDate.orderedAt instanceof Date) // 출력: true
```

다만 결과가 여전히 `any`라서 타입 안전성은 없습니다. 실무에서는 "`unknown`으로 받아 스키마로 검증하면서 변환"하는 쪽을 권합니다.

#### Map과 Set을 JSON으로 저장하는 법

`Map`은 `Object.fromEntries`로 객체로 바꾸거나 `[...map]`으로 `[키, 값]` 배열로 바꾸고, `Set`은 `[...set]`으로 배열로 바꿉니다. 되돌릴 때는 반대로 합니다.

```ts
const options = new Map<string, number>([['샷 추가', 2], ['시럽', 1]])
const tags = new Set(['포장', '할인'])

const json = JSON.stringify({
  options: Object.fromEntries(options), // Map → 객체
  tags: [...tags],                       // Set → 배열
})
console.log(json)
// 출력: {"options":{"샷 추가":2,"시럽":1},"tags":["포장","할인"]}

const parsed = JSON.parse(json) as { options: Record<string, number>; tags: string[] } // 예제라서 단언
const options2 = new Map(Object.entries(parsed.options)) // 객체 → Map
const tags2 = new Set(parsed.tags)                       // 배열 → Set
console.log(options2.get('샷 추가'), tags2.has('포장'))
// 출력: 2 true
```

`Object.fromEntries`는 키가 문자열일 때만 쓸 수 있습니다. 키가 숫자나 객체인 `Map`은 `[...map]`(배열의 배열)로 저장합니다(문제 5).

::: tip JSON.stringify로 보기 좋게 출력하기
세 번째 인자로 들여쓰기 칸 수를 주면 사람이 읽기 좋게 줄을 바꿔 줍니다. 로그나 설정 파일을 만들 때 씁니다.

```ts
console.log(JSON.stringify({ name: '김하나', point: 1200 }, null, 2))
```
```text
{
  "name": "김하나",
  "point": 1200
}
```
:::

### 3단계: Date와 타임존

#### Date는 "한 순간"을 담는다

`Date` 객체는 내부적으로 **1970-01-01 00:00:00 UTC부터 지난 밀리초**라는 숫자 하나만 들고 있습니다. "서울 시간 몇 시"라는 정보는 없습니다. 같은 순간을 서울에서 보면 오전 9시, 런던에서 보면 0시일 뿐입니다.

- **UTC(협정 세계시)**: 전 세계 기준 시계. 서버·DB·API는 보통 UTC로 저장합니다.
- **KST(한국 표준시)**: UTC보다 9시간 빠름. `+09:00`으로 표기합니다.
- **ISO 8601 형식**: `2026-10-23T05:30:00.000Z`처럼 쓰는 국제 표준 날짜 문자열. 끝의 `Z`는 UTC라는 뜻입니다.

```ts
const paidAt = new Date('2026-10-23T15:30:00Z') // UTC 15:30 = 한국 시간 24일 00:30
console.log(paidAt.getTime())     // 출력: 1792769400000  (밀리초 숫자)
console.log(paidAt.toISOString()) // 출력: 2026-10-23T15:30:00.000Z  (항상 UTC)
```

#### 문자열로 Date를 만들 때의 함정

같아 보이는 문자열인데 해석하는 시간대가 다릅니다. 실행 환경의 시간대가 서울(Asia/Seoul)일 때의 결과입니다.

```ts
const a = new Date('2026-10-23')                // 날짜만 → UTC 자정으로 해석
const b = new Date('2026-10-23T00:00:00')       // 시간까지, 오프셋 없음 → 실행 환경(로컬) 시간으로 해석
const c = new Date('2026-10-23T00:00:00+09:00') // 한국 시간을 명시

console.log(a.toISOString()) // 2026-10-23T00:00:00.000Z  ← 한국 시간으로는 23일 오전 9시
console.log(b.toISOString()) // 2026-10-22T15:00:00.000Z  ← 한국 시간 23일 0시
console.log(c.toISOString()) // 2026-10-22T15:00:00.000Z  ← 한국 시간 23일 0시
```

`b`는 실행 환경에 따라 달라집니다. 같은 코드를 시간대가 UTC인 서버(클라우드 서버는 대부분 UTC)에서 돌리면 `b`는 `2026-10-23T00:00:00.000Z`가 됩니다. **PC에서는 맞는데 서버에 올리면 9시간 틀어지는** 버그의 대표 원인입니다.

::: warning 날짜 문자열은 오프셋까지 적으세요
API로 주고받는 날짜는 `2026-10-23T05:30:00Z`나 `2026-10-23T14:30:00+09:00`처럼 **시간대가 들어간 ISO 형식**으로 약속하세요. 시간대 없는 `2026-10-23 14:30:00`은 받는 쪽이 어느 시간대로 해석할지 알 수 없습니다.
:::

#### 그 밖의 Date 함정

```ts
// 1) 월은 0부터 셉니다: 9가 10월
const d = new Date(2026, 9, 23, 14, 30) // 2026년 10월 23일 14:30 (로컬 시간)
console.log(d.getMonth()) // 출력: 9

// 2) 없는 날짜는 다음 달로 넘어갑니다: 2월 30일 → 3월 2일
console.log(new Date(2026, 1, 30).toDateString()) // 출력: Mon Mar 02 2026

// 3) 잘못된 문자열은 오류가 아니라 "Invalid Date"
const bad = new Date('2026/13/45')
console.log(bad.getTime(), Number.isNaN(bad.getTime())) // 출력: NaN true
```

`Invalid Date`도 타입은 `Date`이므로 TypeScript가 막아 주지 못합니다. 바깥에서 들어온 날짜 문자열은 `Number.isNaN(date.getTime())`으로 확인하거나 zod 스키마로 검증합니다.

#### 한국 시간으로 포맷하기: Intl.DateTimeFormat

화면에 보여 줄 때는 실행 환경 시간대에 기대지 말고 **시간대를 명시**합니다. 브라우저와 Node.js에 내장된 `Intl.DateTimeFormat`을 씁니다.

```ts
const paidAt = new Date('2026-10-23T15:30:00Z')

const kstFormat = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul', // 시간대를 명시
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hour12: false,
})
console.log(kstFormat.format(paidAt))
// 출력: 2026. 10. 24. 00:30
```

이 결과는 서버가 UTC든 서울이든 **항상 같습니다.** `toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })`도 같은 기능이지만, 오전/오후 표기 같은 세부 문구는 실행 환경(브라우저, Node.js 빌드)에 따라 조금씩 다를 수 있습니다.

#### 매출 날짜 키 만들기: toISOString().slice(0, 10)의 함정

"날짜별 매출"을 집계할 때 `toISOString().slice(0, 10)`로 날짜를 자르는 코드가 많습니다. 그런데 `toISOString()`은 **항상 UTC**입니다.

```ts
const paidAt = new Date('2026-10-23T15:30:00Z') // 한국 시간 24일 00:30에 결제
console.log(paidAt.toISOString().slice(0, 10))  // 출력: 2026-10-23  ← 어제 매출로 잡힘!
```

한국 시간 **0시~9시** 사이 결제가 모두 전날로 잡힙니다. 24시간 매장이나 새벽 배송이라면 매출 보고서가 틀어집니다. 한국 시간 기준 날짜 키는 이렇게 만듭니다.

```ts
// en-CA 형식은 YYYY-MM-DD 모양으로 출력되어 날짜 키로 쓰기 편합니다.
const seoulDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
})

function toSeoulDateKey(date: Date): string {
  return seoulDate.format(date)
}

console.log(toSeoulDateKey(new Date('2026-10-23T15:30:00Z'))) // 출력: 2026-10-24
```

::: info 날짜 라이브러리와 Temporal
날짜 계산(한 달 더하기, 영업일 계산)이 많다면 date-fns·Day.js 같은 라이브러리를 쓰는 경우가 많습니다. 또 `Date`의 문제를 고친 새 표준 **Temporal API**가 만들어지고 있으며, 일부 최신 브라우저부터 지원이 시작되었습니다. 지원 범위가 환경마다 다르므로 쓰기 전에 대상 브라우저·Node.js 버전을 확인하세요.
:::

### 4단계: `Map<K, V>` — 키로 값을 찾는 서랍장

`Map`은 **키(key)와 값(value)의 쌍**을 저장합니다. 타입은 `Map<키 타입, 값 타입>`으로 적습니다.

```ts
const stock = new Map<string, number>() // 상품 코드 → 재고 수량
stock.set('P001', 12)
stock.set('P002', 0)
stock.set('P003', 5)

console.log(stock.size, stock.has('P002')) // 출력: 3 true

const qty = stock.get('P001')                   // qty: number | undefined
const next = (stock.get('P999') ?? 0) + 1        // 없으면 0으로
console.log(qty, stock.get('P999'), next)        // 출력: 12 undefined 1

stock.delete('P003')
for (const [code, count] of stock) {
  console.log(`${code}: ${count}개`)
}
// 출력: P001: 12개
//       P002: 0개
```

| 메서드·속성 | 뜻 | 반환 타입 |
|---|---|---|
| `set(키, 값)` | 넣기(같은 키면 덮어쓰기) | `Map<K, V>` (이어 쓰기 가능) |
| `get(키)` | 꺼내기 | `V \| undefined` |
| `has(키)` | 있는지 확인 | `boolean` |
| `delete(키)` | 지우기 | `boolean` |
| `size` | 개수 | `number` |
| `keys()`·`values()`·`entries()` | 반복용 목록 | 반복자(iterator) — `[...map.keys()]`로 배열화 |

#### get은 항상 undefined일 수 있다

`get`의 반환 타입이 `V | undefined`인 것이 `Map`의 큰 장점입니다. 없는 키를 찾았을 때를 처리하도록 TypeScript가 강제합니다.

```ts
const qty: number = stock.get('P001')
// ❌ Type 'number | undefined' is not assignable to type 'number'.
//      Type 'undefined' is not assignable to type 'number'. (TS2322)
```

`??`(없으면 기본값), `if (qty !== undefined)`(좁히기), 또는 `has`로 확인한 뒤 처리합니다. 참고로 `has`로 확인해도 TypeScript는 바로 다음 `get`의 결과를 좁혀 주지 않습니다. `get` 결과를 변수에 받아 `undefined`인지 확인하는 방식이 가장 확실합니다.

#### 객체를 키로 쓸 수 있다

객체(`{}`)의 키는 문자열(과 심볼)뿐이지만, `Map`은 **어떤 값이든** 키로 쓸 수 있습니다. 단, 객체 키는 **같은 객체(참조)** 일 때만 찾습니다.

```ts
interface Member { id: string; name: string }
const kim: Member = { id: 'M001', name: '김하나' }

const cartByMember = new Map<Member, string[]>()
cartByMember.set(kim, ['아메리카노'])

console.log(cartByMember.get(kim))                               // 출력: [ '아메리카노' ]
console.log(cartByMember.get({ id: 'M001', name: '김하나' }))     // 출력: undefined — 내용이 같아도 다른 객체
```

실무에서는 보통 객체 대신 `kim.id` 같은 **문자열 ID를 키로** 씁니다.

::: warning new Map()에는 타입을 적으세요
`const m = new Map()`처럼 타입 인자도 초기값도 없으면 `Map<any, any>`가 됩니다. `any`가 퍼지는 통로가 되므로 `new Map<string, number>()`처럼 적거나, 초기값(`new Map([['P001', 12]])`)으로 추론되게 하세요. `Set`도 같습니다.
:::

### 5단계: `Set<T>` — 중복 없는 모음

`Set`은 **같은 값을 한 번만** 담습니다. 타입은 `Set<요소 타입>`입니다.

```ts
const visited = new Set<string>() // 오늘 방문한 회원 ID
for (const id of ['M001', 'M002', 'M001', 'M003', 'M002']) {
  visited.add(id)
}
console.log(visited.size, [...visited])
// 출력: 3 [ 'M001', 'M002', 'M003' ]

// 배열 중복 제거 — 가장 흔한 사용법
const codes = ['P001', 'P002', 'P001']
const unique = [...new Set(codes)]
console.log(unique) // 출력: [ 'P001', 'P002' ]
```

`has`는 배열의 `includes`보다 훨씬 빠릅니다. 배열은 처음부터 하나씩 비교하지만, `Set`은 크기와 상관없이 거의 한 번에 찾습니다. 수천 개 이상의 ID 목록에서 "포함되어 있는가"를 반복해서 물을 때는 `Set`으로 바꿔 두세요.

두 집합의 교집합·합집합은 배열 메서드와 함께 씁니다(문제 6).

```ts
const a = new Set(['커피', '디저트', '음료'])
const b = new Set(['디저트', '굿즈'])
console.log([...a].filter((x) => b.has(x))) // 교집합 — 출력: [ '디저트' ]
```

::: info 새 Set 메서드
`a.intersection(b)`, `a.union(b)`, `a.difference(b)` 같은 집합 메서드가 ES2025 표준에 추가되었습니다. Node.js 22 이상과 최신 브라우저에서 동작하며, TypeScript에서는 5.5부터 `lib`에 `esnext`(또는 `esnext.collection`)를 넣어야 타입이 잡힙니다. 지원 환경을 확인하기 전까지는 위처럼 `filter` + `has`로 쓰면 어디서나 동작합니다.
:::

### 6단계: Record와 Map, 무엇을 쓸까

`Record<string, number>` 같은 일반 객체도 "키 → 값" 저장에 씁니다. 둘은 비슷해 보이지만 차이가 있습니다.

```ts
const stockRecord: Record<string, number> = { P001: 12 }
const x: number = stockRecord['P999'] // ✅ 통과 — 실제 값은 undefined!
console.log(x) // 출력: undefined

const stockMap = new Map<string, number>([['P001', 12]])
const y: number = stockMap.get('P999') // ❌ TS2322 — undefined 가능성을 알려 줌
```

`Record<string, number>`는 "어떤 문자열 키든 `number`가 있다"고 선언한 것이라, 없는 키를 읽어도 TypeScript가 `number`로 믿습니다. (`noUncheckedIndexedAccess` 옵션을 켜면 `number | undefined`로 바뀝니다. [strict 옵션 레슨](../part6-tooling/02-strict-options)에서 다룹니다.)

| 기준 | `Record<K, V>` (객체) | `Map<K, V>` |
|---|---|---|
| 키 종류 | 문자열·숫자·심볼(숫자는 문자열로 바뀜) | 아무 값(객체 포함) |
| 키가 정해져 있음(`'card' \| 'cash'`) | 잘 맞음 — 빠진 키를 컴파일러가 잡아 줌 | 덜 맞음 |
| 키가 실행 중에 늘고 줄어듦 | 가능하지만 `delete`가 어색함 | 잘 맞음(`set`·`delete`) |
| 없는 키 읽기 | 기본 설정에서는 `V`로 믿음 | `V \| undefined` |
| 순서 | 대체로 넣은 순서지만 숫자 모양 키는 정렬됨 | 항상 넣은 순서 |
| 개수 | `Object.keys(obj).length` | `map.size` |
| JSON 변환 | 그대로 됨 | 변환 필요(`Object.fromEntries` 등) |
| 프로토타입 키 충돌 | `'constructor'` 같은 키에 주의 | 없음 |

::: tip 고르는 요령
- **키 목록이 코드에 정해져 있다**(결제 수단별 설정, 요일별 영업시간) → `Record<'card' | 'cash', ...>`
- **키가 데이터에서 온다**(상품 코드별 재고, 회원별 장바구니), 자주 넣고 뺀다, 객체를 키로 쓴다 → `Map`
- **API로 주고받거나 저장한다** → 객체(`Record`)나 배열. `Map`은 내부 계산용으로 쓰고 보낼 때 변환합니다.
:::

## 자주 하는 실수

### 실수 1: JSON.parse 결과를 바로 쓴다

```ts
const saved = localStorage.getItem('cart') // string | null
const cart = JSON.parse(saved!)            // any — 깨진 값이면 SyntaxError, 모양이 달라도 모름
cart.items.forEach(/* ... */)
```

**왜 틀렸나:** `!`로 `null` 가능성을 지웠고, 파싱 실패와 모양 불일치를 둘 다 무시했습니다. 사용자가 브라우저 저장소를 한 번만 잘못 건드려도 화면이 멈춥니다.

```ts
// 고친 코드: null 확인 → try/catch → unknown → 스키마 검증 (문제 5 참고)
```

### 실수 2: Map·Set을 그대로 JSON.stringify한다

```ts
const cart = new Map([['P001', 2]])
localStorage.setItem('cart', JSON.stringify(cart)) // "{}" 가 저장됨
```

**왜 틀렸나:** `Map`과 `Set`은 `{}`로 바뀝니다. 오류가 나지 않아서 저장할 때는 모르고, 다시 불러올 때 장바구니가 비어 있습니다.

```ts
// 고친 코드
localStorage.setItem('cart', JSON.stringify([...cart])) // [["P001",2]]
```

### 실수 3: toISOString()으로 한국 날짜를 만든다

```ts
const todayKey = new Date().toISOString().slice(0, 10) // UTC 날짜!
```

**왜 틀렸나:** 한국 시간 0시~9시에는 어제 날짜가 나옵니다. 마감 정산, 일별 매출, "오늘 주문" 필터가 모두 틀어집니다.

```ts
// 고친 코드
const todayKey = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date())
```

### 실수 4: Map을 객체처럼 대괄호로 쓴다

```ts
const stock = new Map<string, number>([['P001', 12]])
stock['P001'] = 3
// ❌ Element implicitly has an 'any' type because type 'Map<string, number>' has no index signature. Did you mean to call 'stock.set'? (TS7052)
```

**왜 틀렸나:** 대괄호는 `Map` 객체 자체에 속성을 붙일 뿐, `Map`의 내용에는 들어가지 않습니다(`get('P001')`은 여전히 12). TypeScript가 `set`을 쓰라고 알려 줍니다.

```ts
// 고친 코드
stock.set('P001', 3)
```

### 실수 5: undefined로 "값 없음"을 보낸다

```ts
const update = { name: '카페라테', memo: undefined } // 메모를 지우고 싶음
JSON.stringify(update) // {"name":"카페라테"} — memo가 아예 안 보내짐
```

**왜 틀렸나:** `undefined` 속성은 JSON에서 사라집니다. 서버는 "메모를 지워라"가 아니라 "메모는 건드리지 마라"로 받아들입니다.

```ts
// 고친 코드: 지우려면 null을 보냅니다(서버와 약속 필요).
const update = { name: '카페라테', memo: null } // {"name":"카페라테","memo":null}
```

## 직접 해 보기

### 문제 1 ⭐ 안전한 JSON 파싱

예외를 던지지 않고 결과 객체를 돌려주는 `safeJsonParse(text: string)`를 만드세요. 성공하면 `{ ok: true, value }`(`value`는 `unknown`), 실패하면 `{ ok: false, error: 메시지 }`입니다.

::: details 정답 보기
```ts
type JsonResult = { ok: true; value: unknown } | { ok: false; error: string }

function safeJsonParse(text: string): JsonResult {
  try {
    return { ok: true, value: JSON.parse(text) }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) }
  }
}

console.log(safeJsonParse('{"point":1200}'))
// 출력: { ok: true, value: { point: 1200 } }
console.log(safeJsonParse('{point:1200}'))
// 출력: { ok: false, error: "Expected property name or '}' in JSON at position 1 (line 1 column 2)" }
```
반환 타입을 판별 유니온으로 만들어 `if (result.ok)`로 좁혀 쓰게 했습니다. `JSON.parse`의 `any`를 `value: unknown`에 담는 순간 `any`가 더 퍼지지 않습니다.
:::

### 문제 2 ⭐ stringify 결과 예상하기

아래 코드의 출력을 예상해 보세요.

```ts
console.log(JSON.stringify({
  code: 'P001',
  soldOut: undefined,
  price: 4500,
  sizes: ['S', undefined],
  openedAt: new Date('2026-10-23T00:00:00Z'),
}))
```

::: details 정답 보기
```text
{"code":"P001","price":4500,"sizes":["S",null],"openedAt":"2026-10-23T00:00:00.000Z"}
```
`soldOut`은 사라지고, 배열 안의 `undefined`는 `null`, `Date`는 ISO 문자열이 됩니다.
:::

### 문제 3 ⭐⭐ 상품별 판매 수량 집계

주문 줄 목록에서 상품 코드별 판매 수량을 `Map<string, number>`로 집계하고, 많이 팔린 순으로 출력하세요.

```ts
interface OrderLine { code: string; qty: number }
const lines: OrderLine[] = [
  { code: 'P001', qty: 2 }, { code: 'P002', qty: 1 }, { code: 'P001', qty: 3 },
  { code: 'P003', qty: 4 }, { code: 'P002', qty: 2 },
]
```

::: details 정답 보기
```ts
const totals = new Map<string, number>()
for (const { code, qty } of lines) {
  totals.set(code, (totals.get(code) ?? 0) + qty) // 없으면 0에서 시작
}

const ranking = [...totals].sort((a, b) => b[1] - a[1]) // [코드, 수량] 배열을 수량 내림차순으로
for (const [code, qty] of ranking) {
  console.log(`${code}: ${qty}개`)
}
```
```text
P001: 5개
P003: 4개
P002: 3개
```
`(map.get(key) ?? 0) + 값`은 `Map`으로 개수를 셀 때 가장 많이 쓰는 형태입니다.
:::

### 문제 4 ⭐⭐ 한국 시간 기준 일별 매출

결제 시각이 UTC 문자열로 저장된 매출 목록을 **한국 시간 날짜** 기준으로 합산하세요. 그리고 `paidAt.slice(0, 10)`으로 잘못 집계했을 때와 비교해 보세요.

```ts
interface Sale { paidAt: string; amount: number }
const sales: Sale[] = [
  { paidAt: '2026-10-23T02:00:00Z', amount: 4500 }, // 한국 23일 11:00
  { paidAt: '2026-10-23T14:59:00Z', amount: 5000 }, // 한국 23일 23:59
  { paidAt: '2026-10-23T15:10:00Z', amount: 3000 }, // 한국 24일 00:10
  { paidAt: '2026-10-24T01:00:00Z', amount: 6000 }, // 한국 24일 10:00
]
```

::: details 정답 보기
```ts
const seoulDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
})
function toSeoulDateKey(date: Date): string {
  return seoulDate.format(date)
}

const daily = new Map<string, number>()
for (const sale of sales) {
  const key = toSeoulDateKey(new Date(sale.paidAt))
  daily.set(key, (daily.get(key) ?? 0) + sale.amount)
}
console.log(daily)
// 출력: Map(2) { '2026-10-23' => 9500, '2026-10-24' => 9000 }

// 잘못된 방법: UTC 날짜로 자름
const wrong = new Map<string, number>()
for (const sale of sales) {
  const key = sale.paidAt.slice(0, 10)
  wrong.set(key, (wrong.get(key) ?? 0) + sale.amount)
}
console.log(wrong)
// 출력: Map(2) { '2026-10-23' => 12500, '2026-10-24' => 6000 }
```
한국 시간 24일 0시 10분의 3,000원이 잘못된 방법에서는 23일 매출로 들어갔습니다. `Intl.DateTimeFormat` 객체는 만들 때 비용이 들어서, 반복문 밖에서 한 번 만들어 재사용했습니다.
:::

### 문제 5 ⭐⭐⭐ 장바구니 저장과 복원

`Map<string, number>`(상품 코드 → 수량) 장바구니를 문자열로 저장하는 `saveCart`와, 문자열에서 복원하는 `loadCart(text: string | null)`를 만드세요. 복원할 때 값이 없거나, JSON이 깨졌거나, 모양이 틀리면(수량이 양의 정수가 아님) 빈 장바구니를 돌려줍니다. zod를 써도 됩니다.

::: details 정답 보기
```ts
import { z } from 'zod'

// [상품 코드, 수량] 쌍의 배열
const CartEntriesSchema = z.array(z.tuple([z.string(), z.number().int().positive()]))

function saveCart(cart: Map<string, number>): string {
  return JSON.stringify([...cart]) // Map → [키, 값] 배열
}

function loadCart(text: string | null): Map<string, number> {
  if (text === null) return new Map() // 저장된 값 없음
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return new Map() // 깨진 JSON
  }
  const result = CartEntriesSchema.safeParse(raw)
  return result.success ? new Map(result.data) : new Map() // 모양 검증 후 Map으로
}

const saved = saveCart(new Map([['P001', 2], ['P003', 1]]))
console.log(saved)                            // 출력: [["P001",2],["P003",1]]
console.log(loadCart(saved))                  // 출력: Map(2) { 'P001' => 2, 'P003' => 1 }
console.log(loadCart('[["P001","두 개"]]'))  // 출력: Map(0) {}
console.log(loadCart('망가진 값'))            // 출력: Map(0) {}
console.log(loadCart(null).size)              // 출력: 0
```
브라우저에서는 `saveCart` 결과를 `localStorage.setItem('cart', ...)`로, `loadCart(localStorage.getItem('cart'))`로 연결하면 됩니다. `getItem`의 반환 타입이 `string | null`이라서 매개변수 타입을 그렇게 정했습니다.
:::

### 문제 6 ⭐⭐⭐ 교차 판매 분석

커피를 산 회원과 디저트를 산 회원이 `Set`으로 주어졌습니다. (1) 둘 다 산 회원, (2) 한 번이라도 산 회원 전체, (3) 커피만 산 회원을 구하세요.

```ts
const coffeeBuyers = new Set(['M001', 'M002', 'M004'])
const dessertBuyers = new Set(['M002', 'M003', 'M004'])
```

::: details 정답 보기
```ts
const both = [...coffeeBuyers].filter((id) => dessertBuyers.has(id))       // 교집합
const either = new Set([...coffeeBuyers, ...dessertBuyers])                 // 합집합
const coffeeOnly = [...coffeeBuyers].filter((id) => !dessertBuyers.has(id)) // 차집합

console.log(both, [...either], coffeeOnly)
// 출력: [ 'M002', 'M004' ] [ 'M001', 'M002', 'M004', 'M003' ] [ 'M001' ]
```
"커피만 산 회원"은 디저트 쿠폰을 보낼 대상이 됩니다. ES2025 집합 메서드를 쓸 수 있는 환경이라면 `coffeeBuyers.intersection(dessertBuyers)`처럼 쓸 수도 있습니다.
:::

## 확인 퀴즈

1. `JSON.parse`의 반환 타입은 무엇이고, 어떻게 받아야 안전합니까?
2. `JSON.stringify(new Map([['P001', 2]]))`의 결과는 무엇입니까?
3. `new Date('2026-10-23')`은 어느 시간대의 자정으로 해석됩니까?
4. 한국 시간 기준 날짜 키를 만들 때 `toISOString().slice(0, 10)`을 쓰면 안 되는 이유는 무엇입니까?
5. `Map<string, number>`의 `get`의 반환 타입은 무엇이고, 그것이 `Record<string, number>`의 대괄호 접근보다 나은 점은 무엇입니까?

::: details 정답 보기
1. `any`입니다. `unknown`으로 받고 스키마나 타입 가드로 검증한 뒤 씁니다. 파싱 실패(`SyntaxError`)에 대비해 `try/catch`도 씁니다.
2. `"{}"`입니다. 내용이 모두 사라지므로 `[...map]`이나 `Object.fromEntries(map)`으로 바꿔서 직렬화합니다.
3. UTC 자정입니다(한국 시간으로는 같은 날 오전 9시). 반면 `'2026-10-23T00:00:00'`처럼 시간까지 있고 오프셋이 없으면 실행 환경의 시간대로 해석됩니다.
4. `toISOString()`은 항상 UTC라서, 한국 시간 0시~9시 사이의 시각은 전날 날짜가 나오기 때문입니다.
5. `number | undefined`입니다. 없는 키를 읽을 가능성을 TypeScript가 알려 주므로 처리를 빠뜨리지 않습니다. `Record`는 기본 설정에서 없는 키도 `number`로 믿습니다.
:::

## 정리

- `JSON.parse`는 `any`를 돌려주고 실패하면 `SyntaxError`를 던집니다. `try/catch`로 감싸고 `unknown`으로 받아 검증합니다.
- `JSON.stringify`는 `Date`를 문자열로, `undefined` 속성을 삭제, `Map`·`Set`을 `{}`로 바꿉니다. `Map`은 `[...map]`이나 `Object.fromEntries`, `Set`은 `[...set]`으로 바꿔 저장합니다.
- `Date`는 시간대 없는 "한 순간"입니다. API 날짜는 오프셋이 있는 ISO 형식으로 주고받고, 화면 표시와 날짜 키는 `Intl.DateTimeFormat`에 `timeZone: 'Asia/Seoul'`을 명시해 만듭니다.
- `Map<K, V>`는 키가 데이터에서 오고 자주 바뀔 때, `Set<T>`는 중복 제거와 빠른 포함 검사에 씁니다. 둘 다 타입 인자나 초기값으로 타입을 정해 `any`를 막습니다.
- `Map.get`은 `V | undefined`를 돌려주므로 `??`나 좁히기로 처리합니다. 키가 고정된 설정값은 `Record`, 동적인 모음은 `Map`이 잘 맞습니다.

## 다음 단계

Part 4를 마쳤습니다. 이제 비동기 코드로 API를 호출하고, 들어온 데이터를 검증하고, JSON·날짜·컬렉션을 안전하게 다룰 수 있습니다.

다음 파트 [고급 타입](../part5-advanced/)에서는 [조건부 타입과 분배 법칙](../part5-advanced/01-conditional-types)부터 시작해, `Awaited`나 `z.infer` 같은 타입이 내부에서 어떻게 계산되는지 직접 만들어 보며 이해합니다.
