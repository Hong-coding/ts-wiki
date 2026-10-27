---
title: "React + TS: 훅 · Context · 커스텀 훅"
---

# React + TS: 훅 · Context · 커스텀 훅

<LessonMeta level="실전" :minutes="75" prev="React 컴포넌트에 props·state·이벤트 타입 붙이기" />

## 이번에 배울 것

- `useEffect`의 정리 함수(cleanup)가 왜 필요한지 설명하고, async 작업을 effect 안에서 올바르게 실행할 수 있다.
- `useRef`를 DOM 요소용과 값 보관용으로 구분해 타입을 붙일 수 있다.
- `useReducer`의 액션을 판별 유니온으로 설계하고 완전성 검사를 적용할 수 있다.
- Context를 `null` 안전하게 만들고 커스텀 훅으로 감쌀 수 있다.
- 커스텀 훅의 튜플 반환(`as const`), 제네릭 컴포넌트, `ComponentProps`로 HTML 속성 확장을 쓸 수 있다.

## 먼저 알아 둘 것

- [React + TS: 컴포넌트 · props · state · 이벤트](./02-react-basics)
- [판별 유니온과 완전성 검사](../part3-intermediate/03-discriminated-union)
- [제네릭 기초](../part3-intermediate/04-generics-basics)
- [배열 타입과 튜플](../part2-types/03-arrays-tuples)
- [async/await와 비동기 오류 처리](../part4-async/03-async-await)

::: info 이 레슨의 버전 (작성 시점 2026-10 기준)
React 19.3, @types/react 19.3에서 예제를 `tsc --noEmit`(TypeScript 5.6.3, strict)으로 검사했습니다. React 18과 타입이 달라진 부분(`useRef`의 인자, Context를 Provider로 쓰는 문법)은 본문에 따로 표시했습니다.
:::

## 비유로 이해하기

지난 레슨의 레고 블록(컴포넌트)에 **부품**을 달아 봅시다.

- `useEffect`는 **타이머 달린 스위치**입니다. 블록이 화면에 놓이면 켜지고(구독 시작, 타이머 시작), 블록이 치워지면 **반드시 꺼야** 합니다(정리). 끄지 않으면 아무도 없는 방에 전등이 계속 켜져 있는 셈입니다.
- `useRef`는 **블록 뒤에 붙인 작은 메모지**입니다. 적어 둔 값을 바꿔도 블록을 다시 그리지 않습니다.
- `useReducer`는 **주문 접수 규칙표**입니다. "추가", "삭제", "수량 변경" 같은 정해진 주문서(액션)만 받고, 규칙표에 따라 장바구니를 바꿉니다.
- **Context**는 매장의 **사내 방송**입니다. 부모가 자식에게, 자식이 손자에게 일일이 전달하지 않아도, 방송 범위 안에 있는 누구든 들을 수 있습니다.

TypeScript는 스위치를 끄는 방법이 맞는지, 메모지에 무엇을 적는지, 주문서 종류에 빠진 것이 없는지, 방송 범위 밖에서 방송을 들으려 하지 않는지를 검사해 줍니다.

## 개념 설명

### 1단계: useEffect와 정리 함수

React 컴포넌트 함수는 **화면 모양을 계산하는 일만** 해야 합니다. 타이머 시작, 서버 요청, 이벤트 구독처럼 **바깥 세상과 주고받는 일**(부수 효과, side effect)은 `useEffect` 안에서 합니다. effect는 화면이 그려진 **뒤에** 실행됩니다.

```tsx
import { useEffect, useState } from 'react'

export function Clock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timerId = setInterval(() => setNow(new Date()), 1000)
    // 정리 함수: 컴포넌트가 화면에서 사라질 때(또는 effect를 다시 실행하기 직전) 불립니다.
    return () => {
      clearInterval(timerId)
    }
  }, [])

  return <p>{now.toLocaleTimeString('ko-KR')}</p>
}
```

해설:

- `useEffect(실행할 함수, 의존성 배열)` 형태입니다. **의존성 배열**(dependency array)은 "이 값들이 바뀌면 effect를 다시 실행하라"는 목록입니다. 빈 배열 `[]`이면 처음 한 번만 실행합니다.
- effect 함수가 **함수를 반환하면** 그것이 정리 함수입니다. 정리하지 않으면 시계 화면을 닫아도 타이머가 계속 돌고, 화면을 열 때마다 타이머가 하나씩 늘어납니다.
- `useState(() => new Date())`처럼 함수를 넘기면 처음 렌더링에서만 그 함수를 실행합니다(지연 초기화).

타입 관점에서 effect 함수가 돌려줄 수 있는 것은 **아무것도 없음 또는 정리 함수** 두 가지뿐입니다. 그래서 effect 함수 자체에 `async`를 붙이면 오류가 납니다. async 함수는 언제나 Promise를 돌려주기 때문입니다.

```tsx
useEffect(async () => {
  await fetch(`/api/products/${id}`)
}, [id])
// ❌ Argument of type '() => Promise<void>' is not assignable to parameter of type 'EffectCallback'.
//      Type 'Promise<void>' is not assignable to type 'void | Destructor'. (TS2345)
```

async 작업은 **effect 안에 async 함수를 만들고 바로 부르는** 방식으로 씁니다. 그리고 요청 도중 `productId`가 바뀌거나 화면이 닫히면 이전 요청을 **취소**하는 정리 함수를 둡니다.

```tsx
interface Product {
  id: number
  name: string
  price: number
}

export function ProductDetail({ productId }: { productId: number }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        const res = await fetch(`/api/products/${productId}`, { signal: controller.signal })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data: Product = await res.json()
        setProduct(data)
      } catch (err) {
        // 정리 함수가 요청을 취소한 경우는 오류가 아님
        if (err instanceof DOMException && err.name === 'AbortError') return
        setError(err instanceof Error ? err.message : '알 수 없는 오류')
      }
    }

    load()
    return () => controller.abort()
  }, [productId])

  if (error) return <p>{error}</p>
  if (!product) return <p>불러오는 중…</p>
  return <h2>{product.name}</h2>
}
```

- `AbortController`는 진행 중인 `fetch`를 취소하는 브라우저 내장 도구입니다([fetch](../part4-async/04-fetch-api)).
- 취소하지 않으면 1번 상품 응답이 2번 상품 응답보다 늦게 도착할 때 **화면에 1번 상품이 덮어써지는** 경쟁 상태(race condition) 버그가 생깁니다.
- `catch`의 `err`는 `unknown`이므로 `instanceof`로 좁혀서 씁니다.
- `const data: Product = await res.json()`은 사실상 "믿겠다"는 표기입니다. `res.json()`은 `any`를 돌려주어 검사 없이 통과합니다. 서버 응답을 검증하는 방법은 [06 API 클라이언트](./06-api-client)에서 다룹니다.

::: tip 개발 모드에서 effect가 두 번 실행되나요?
템플릿의 `main.tsx`는 앱을 `<StrictMode>`로 감쌉니다. StrictMode는 **개발 모드에서만** effect를 "실행 → 정리 → 다시 실행" 순서로 한 번 더 돌려, 정리 함수를 빠뜨린 버그를 일부러 드러냅니다. 정리 함수를 올바르게 썼다면 결과는 같습니다.
:::

### 2단계: useRef — DOM 요소와 값 보관

`useRef`는 `current`라는 속성 하나를 가진 상자를 돌려주는 훅입니다. 쓰임새가 두 가지이고, 타입을 붙이는 방법도 다릅니다.

**① DOM 요소를 가리킬 때**

```tsx
import { useRef } from 'react'

export function SearchInput() {
  const inputRef = useRef<HTMLInputElement>(null)

  function focus() {
    inputRef.current?.focus() // 아직 화면에 없을 수 있으므로 ?. 사용
  }

  return (
    <div>
      <input ref={inputRef} />
      <button onClick={focus}>검색창으로</button>
    </div>
  )
}
```

- **DOM**(Document Object Model)은 브라우저가 화면의 태그들을 객체로 표현한 것입니다. 입력창에 포커스를 주거나 크기를 재려면 그 DOM 요소가 필요합니다.
- 제네릭에 **요소 타입**(`HTMLInputElement`, `HTMLDivElement` 등)을 넣고, 처음 값은 `null`로 줍니다. 렌더링 전에는 요소가 없기 때문입니다.
- `inputRef.current`의 타입은 `HTMLInputElement | null`입니다. 그냥 `.focus()`를 부르면 오류가 납니다.

```tsx
inputRef.current.focus()
// ❌ 'inputRef.current' is possibly 'null'. (TS18047)
```

**② 렌더링과 상관없는 값을 기억할 때**

```tsx
const timerRef = useRef<number | null>(null)

function startDebounce() {
  if (timerRef.current !== null) clearTimeout(timerRef.current)
  timerRef.current = window.setTimeout(() => console.log('검색 실행'), 300)
}
```

- 타이머 번호처럼 **바뀌어도 화면을 다시 그릴 필요가 없는 값**은 state 대신 ref에 둡니다. `ref.current`를 바꿔도 리렌더링이 일어나지 않습니다.
- 반대로 화면에 보여야 하는 값을 ref에 두면, 값이 바뀌어도 화면이 그대로라서 버그가 됩니다.
- `window.setTimeout`은 브라우저에서 `number`를 돌려줍니다. 그냥 `setTimeout`을 쓰면 프로젝트 설정에 따라 Node.js 타입(`NodeJS.Timeout`)이 잡힐 수 있어서 `window.`를 붙였습니다.

| 쓰임 | 선언 | `current`의 타입 |
|---|---|---|
| DOM 요소 | `useRef<HTMLInputElement>(null)` | `HTMLInputElement \| null` |
| 값 보관 | `useRef<number \| null>(null)` | `number \| null` |
| 처음 값이 있는 값 보관 | `useRef(0)` | `number` |

::: warning React 19의 useRef 변경
React 19 타입에서는 `useRef`에 **처음 값을 반드시** 넘겨야 합니다. `useRef<HTMLInputElement>()`처럼 비워 두면 `Expected 1 arguments, but got 0. (TS2554)` 오류가 납니다. 또 React 18 타입에서는 `useRef<T>(null)`의 `current`가 읽기 전용이었지만, React 19에서는 수정 가능한 `RefObject`로 통일되었습니다. 예전 자료의 `MutableRefObject` 설명은 React 18 기준입니다.
:::

### 3단계: useReducer와 판별 유니온 액션

장바구니처럼 **바꾸는 방법이 여러 가지인 상태**는 `useState`보다 `useReducer`가 깔끔합니다. 상태를 바꾸는 규칙을 컴포넌트 밖의 **리듀서**(reducer) 함수 하나에 모읍니다.

먼저 상태와 **액션**(action, "무엇을 해 달라"는 요청 객체)의 타입을 정합니다. 액션은 `type` 속성으로 구별하는 [판별 유니온](../part3-intermediate/03-discriminated-union)으로 만듭니다.

```ts
type CartItem = { productId: number; name: string; price: number; quantity: number }
type CartState = { items: CartItem[] }

type CartAction =
  | { type: 'add'; product: Product }
  | { type: 'remove'; productId: number }
  | { type: 'changeQuantity'; productId: number; quantity: number }
  | { type: 'clear' }
```

액션마다 필요한 데이터가 다르다는 점이 중요합니다. `remove`에는 `productId`만, `clear`에는 아무것도 필요 없습니다. 판별 유니온으로 만들면 `productId`를 빠뜨린 `remove` 액션은 만들 수조차 없습니다.

```ts
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'add': {
      // 여기서 action은 { type: 'add'; product: Product }로 좁혀짐
      const exists = state.items.find((i) => i.productId === action.product.id)
      if (exists) {
        return {
          items: state.items.map((i) =>
            i.productId === action.product.id ? { ...i, quantity: i.quantity + 1 } : i,
          ),
        }
      }
      const { id, name, price } = action.product
      return { items: [...state.items, { productId: id, name, price, quantity: 1 }] }
    }
    case 'remove':
      return { items: state.items.filter((i) => i.productId !== action.productId) }
    case 'changeQuantity':
      return {
        items: state.items.map((i) =>
          i.productId === action.productId ? { ...i, quantity: action.quantity } : i,
        ),
      }
    case 'clear':
      return { items: [] }
    default: {
      // 완전성 검사: 모든 case를 처리했다면 action은 never
      const unreachable: never = action
      return unreachable
    }
  }
}
```

리듀서는 React 없이도 실행할 수 있는 **순수 함수**(같은 입력에 늘 같은 출력, 바깥을 건드리지 않는 함수)라서 동작을 바로 확인할 수 있습니다.

```ts
const americano: Product = { id: 1, name: '아메리카노', price: 4500 }
const latte: Product = { id: 2, name: '카페라테', price: 5000 }

let state: CartState = { items: [] }
state = cartReducer(state, { type: 'add', product: americano })
state = cartReducer(state, { type: 'add', product: americano })
state = cartReducer(state, { type: 'add', product: latte })
state = cartReducer(state, { type: 'changeQuantity', productId: 2, quantity: 3 })
console.log(state.items.map((i) => `${i.name} x${i.quantity}`))
// 출력: [ '아메리카노 x2', '카페라테 x3' ]

state = cartReducer(state, { type: 'remove', productId: 1 })
console.log(state.items.length)
// 출력: 1
```

나중에 누가 액션 종류를 추가하고 `case`를 빠뜨리면 `default`의 `never` 줄에서 오류가 납니다. 예를 들어 `'remove'` case를 지우면 다음 오류가 납니다.

```text
Type '{ type: "remove"; productId: number; }' is not assignable to type 'never'. (TS2322)
```

컴포넌트에서는 이렇게 씁니다.

```tsx
const [state, dispatch] = useReducer(cartReducer, { items: [] })

dispatch({ type: 'add', product: americano }) // ✅
dispatch({ type: 'remove' }) // ❌ productId가 없으므로 컴파일 오류
```

`dispatch`(보내다)는 액션을 리듀서에 보내는 함수입니다. 리듀서가 새 상태를 돌려주면 React가 다시 렌더링합니다.

### 4단계: Context를 null 안전하게

장바구니 정보는 상단 헤더(개수 표시), 상품 목록(담기 버튼), 결제 화면(합계)이 모두 필요합니다. props로 몇 단계씩 전달하는 대신 **Context**로 "범위 안 어디서든 꺼내 쓰게" 합니다.

Context를 만들 때 처음 값이 필요한데, Provider(값을 공급하는 컴포넌트) 바깥에서는 줄 값이 없습니다. 그래서 타입을 **`값 | null`** 로 만들고 처음 값을 `null`로 둡니다.

```tsx
import { createContext, useContext, useReducer, type ReactNode } from 'react'

type CartContextValue = {
  items: CartItem[]
  totalPrice: number
  addItem: (product: Product) => void
  removeItem: (productId: number) => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] })

  const value: CartContextValue = {
    items: state.items,
    totalPrice: state.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    addItem: (product) => dispatch({ type: 'add', product }),
    removeItem: (productId) => dispatch({ type: 'remove', productId }),
  }

  return <CartContext value={value}>{children}</CartContext>
}
```

이대로 `useContext(CartContext)`를 쓰면 쓰는 곳마다 `null` 검사를 해야 합니다.

```tsx
const ctx = useContext(CartContext)
ctx.totalPrice
// ❌ 'ctx' is possibly 'null'. (TS18047)
```

그래서 **커스텀 훅으로 감싸** `null` 검사를 한 곳에 모읍니다.

```tsx
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (ctx === null) {
    throw new Error('useCart는 CartProvider 안에서만 쓸 수 있습니다.')
  }
  return ctx // 여기서는 CartContextValue
}

export function CartSummary() {
  const { items, totalPrice } = useCart() // null 검사 없이 바로 사용
  return <p>{items.length}종 / {totalPrice.toLocaleString('ko-KR')}원</p>
}
```

- 쓰는 쪽은 `null`을 신경 쓰지 않아도 됩니다.
- Provider로 감싸는 것을 잊으면 **바로 알아보기 쉬운 오류**가 납니다. `createContext({} as CartContextValue)`처럼 빈 객체를 단언하는 방법은 이 실수를 숨기고, 실행 중에 `addItem is not a function` 같은 엉뚱한 오류를 냅니다.
- 앱의 위쪽에서 `<CartProvider>`로 감쌉니다. 예: `<CartProvider><App /></CartProvider>`

::: info React 19의 Context 문법
React 19부터는 `<CartContext value={...}>`처럼 Context 자체를 Provider로 쓸 수 있습니다. React 18 이하에서는 `<CartContext.Provider value={...}>`로 씁니다. 19에서도 `.Provider`는 동작합니다.
:::

### 5단계: 커스텀 훅과 튜플 반환(as const)

**커스텀 훅**은 `use`로 시작하는 이름의 함수로, 안에서 다른 훅을 써서 상태 로직을 재사용합니다. 위의 `useCart`도 커스텀 훅입니다.

`useState`처럼 **두 값을 배열로** 돌려주는 훅을 만들어 봅시다.

```tsx
function useToggle(initial = false) {
  const [on, setOn] = useState(initial)
  const toggle = () => setOn((prev) => !prev)
  return [on, toggle]
}

export function FilterPanel() {
  const [isOpen, toggleOpen] = useToggle()
  return <button onClick={toggleOpen}>{isOpen ? '닫기' : '열기'}</button>
  // ❌ Type 'boolean | (() => void)' is not assignable to type 'MouseEventHandler<HTMLButtonElement> | undefined'.
  //      Type 'boolean' is not assignable to type 'MouseEventHandler<HTMLButtonElement>'. (TS2322)
}
```

`[on, toggle]`은 **배열**로 추론되어 타입이 `(boolean | (() => void))[]`입니다. "어느 칸에 무엇이 있는지" 정보가 사라져서, `toggleOpen`이 함수인지 boolean인지 알 수 없습니다.

`as const`를 붙이면 **읽기 전용 튜플** `readonly [boolean, () => void]`로 추론되어 칸마다 타입이 유지됩니다.

```tsx
export function useToggle(initial = false) {
  const [on, setOn] = useState(initial)
  const toggle = () => setOn((prev) => !prev)
  return [on, toggle] as const
}

const [isOpen, toggleOpen] = useToggle() // isOpen: boolean, toggleOpen: () => void ✅
```

반환 타입을 직접 적어도 됩니다: `function useToggle(initial = false): [boolean, () => void]`. 돌려줄 값이 세 개 이상이면 튜플보다 **객체**(`return { on, toggle, reset }`)가 읽기 좋습니다. 튜플은 받는 쪽이 이름을 마음대로 붙일 수 있고, 객체는 순서를 외우지 않아도 된다는 장점이 있습니다.

### 6단계: 제네릭 컴포넌트 — 무엇이든 담는 목록

상품 목록, 회원 목록, 매장 목록… 모양은 같고 항목 타입만 다른 목록을 매번 새로 만들 필요는 없습니다. 컴포넌트에도 [제네릭](../part3-intermediate/04-generics-basics)을 쓸 수 있습니다.

```tsx
type ListProps<T> = {
  items: T[]
  getKey: (item: T) => string | number
  renderItem: (item: T) => ReactNode
  emptyText?: string
}

export function List<T>({ items, getKey, renderItem, emptyText = '항목이 없습니다.' }: ListProps<T>) {
  if (items.length === 0) return <p>{emptyText}</p>
  return (
    <ul>
      {items.map((item) => (
        <li key={getKey(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  )
}
```

사용할 때 `T`를 적지 않아도 `items`를 보고 추론됩니다.

```tsx
const products: Product[] = [{ id: 1, name: '아메리카노', price: 4500 }]

<List items={products} getKey={(p) => p.id} renderItem={(p) => `${p.name} ${p.price}원`} />
// p의 타입: Product (items에서 T = Product로 추론)

<List items={products} getKey={(p) => p.id} renderItem={(p) => p.nmae} />
// ❌ Property 'nmae' does not exist on type 'Product'. (TS2339)
```

`renderItem`처럼 **"어떻게 그릴지"를 함수로 받는** 방식을 render prop이라고 합니다. 목록의 뼈대(빈 목록 처리, key)는 한 번만 만들고, 항목 모양은 쓰는 쪽이 정합니다.

[지난 레슨](./02-react-basics)에서 본 것처럼 `const List: FC<...>`로는 이렇게 만들 수 없습니다. 제네릭 컴포넌트는 `function` 선언으로 씁니다.

### 7단계: ComponentProps로 HTML 속성 확장하기

공통 버튼 컴포넌트를 만든다고 해 봅시다. `variant`(종류) 하나만 추가하고, 나머지 `onClick`, `disabled`, `type` 같은 **`<button>`의 모든 속성은 그대로** 받고 싶습니다. 수십 개를 일일이 적을 수는 없으니 `ComponentProps`를 씁니다.

```tsx
import type { ComponentProps } from 'react'

type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'danger'
}

export function Button({ variant = 'primary', className, ...rest }: ButtonProps) {
  return <button className={`btn btn-${variant} ${className ?? ''}`} {...rest} />
}

<Button variant="danger" onClick={() => console.log('삭제')} disabled>
  삭제
</Button> // ✅ onClick, disabled, children 모두 button 속성에서 옴

<Button variant="warning">경고</Button>
// ❌ Type '"warning"' is not assignable to type '"primary" | "danger" | undefined'. (TS2322)
```

해설:

- `ComponentProps<'button'>`은 "`<button>` 태그가 받을 수 있는 모든 props"의 타입입니다. `'input'`, `'a'`, `'div'` 등 어떤 태그 이름이든 넣을 수 있습니다.
- `&`([인터섹션](../part3-intermediate/01-intersection))로 내 props를 덧붙입니다.
- `...rest`(나머지 구조 분해)로 남은 속성을 모아 `{...rest}`로 실제 `<button>`에 그대로 전달합니다.
- 기존 속성의 타입을 바꾸거나 막고 싶으면 `Omit<ComponentProps<'input'>, 'id'>`처럼 빼고 다시 정의합니다.
- `ComponentProps<typeof ProductCard>`처럼 **다른 컴포넌트의 props 타입**을 꺼낼 수도 있습니다. 그 컴포넌트가 props 타입을 export하지 않았을 때 유용합니다.

## 자주 하는 실수

### 실수 1: useEffect에 async를 바로 붙이기

```tsx
useEffect(async () => {
  const res = await fetch(`/api/products/${productId}`)
  setProduct(await res.json())
}, [productId])
// ❌ Argument of type '() => Promise<void>' is not assignable to parameter of type 'EffectCallback'. (TS2345)
```

왜 틀렸나: effect 함수는 정리 함수나 아무것도 돌려주지 않아야 하는데, async 함수는 Promise를 돌려줍니다. React는 Promise를 정리 함수로 쓸 수 없습니다.

고친 코드:

```tsx
useEffect(() => {
  async function load() {
    const res = await fetch(`/api/products/${productId}`)
    const data: Product = await res.json()
    setProduct(data)
  }
  load()
}, [productId])
```

실무에서는 1단계처럼 `AbortController`로 취소까지 처리합니다.

### 실수 2: 정리 함수 빠뜨리기

```tsx
useEffect(() => {
  window.addEventListener('resize', handleResize)
}, [])
```

왜 틀렸나: 타입 오류는 없지만, 컴포넌트가 사라져도 이벤트 구독이 남습니다. 화면을 열고 닫을 때마다 구독이 쌓여 메모리 누수와 중복 실행이 생깁니다.

고친 코드: 시작한 것은 정리 함수에서 반드시 되돌립니다.

```tsx
useEffect(() => {
  window.addEventListener('resize', handleResize)
  return () => window.removeEventListener('resize', handleResize)
}, [])
```

### 실수 3: 커스텀 훅에서 배열을 그냥 반환하기

```tsx
function useToggle(initial = false) {
  const [on, setOn] = useState(initial)
  return [on, () => setOn((p) => !p)] // 타입: (boolean | (() => void))[]
}
```

왜 틀렸나: 배열로 추론되어 칸별 타입이 사라집니다. 받는 쪽의 두 변수가 모두 `boolean | (() => void)`가 됩니다.

고친 코드: `as const`를 붙이거나 반환 타입을 튜플로 적습니다.

```tsx
function useToggle(initial = false) {
  const [on, setOn] = useState(initial)
  return [on, () => setOn((p) => !p)] as const // readonly [boolean, () => void]
}
```

### 실수 4: Context 처음 값을 단언으로 속이기

```tsx
const CartContext = createContext({} as CartContextValue)

function CartSummary() {
  const { totalPrice } = useContext(CartContext)
  return <p>{totalPrice.toLocaleString('ko-KR')}원</p>
}
```

왜 틀렸나: 타입 오류는 사라지지만, Provider로 감싸는 것을 잊으면 `totalPrice`가 `undefined`라서 실행 중 `Cannot read properties of undefined` 오류가 납니다. 단언이 진짜 문제를 숨겼습니다.

고친 코드: `null`을 허용하고 커스텀 훅에서 검사합니다(4단계의 `useCart`).

```tsx
const CartContext = createContext<CartContextValue | null>(null)

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (ctx === null) throw new Error('useCart는 CartProvider 안에서만 쓸 수 있습니다.')
  return ctx
}
```

### 실수 5: DOM ref를 null 검사 없이 쓰기

```tsx
const inputRef = useRef<HTMLInputElement>(null)
inputRef.current.focus()
// ❌ 'inputRef.current' is possibly 'null'. (TS18047)
```

왜 틀렸나: 첫 렌더링 중이거나, 조건부로 그려지는 요소가 지금 화면에 없으면 `current`는 `null`입니다.

고친 코드: 옵셔널 체이닝(`?.`)이나 `if`로 확인합니다. `!` 단언은 피합니다.

```tsx
inputRef.current?.focus()
```

## 직접 해 보기

### 문제 1 ⭐ 화면이 열리면 자동 포커스

로그인 폼 `LoginForm`이 화면에 나타나자마자 아이디 입력창에 커서가 가도록 만드세요. `useRef`와 `useEffect`를 씁니다.

::: details 정답 보기
```tsx
export function LoginForm() {
  const idRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    idRef.current?.focus()
  }, []) // 처음 한 번만

  return <input ref={idRef} placeholder="아이디" />
}
```

effect는 화면이 그려진 뒤 실행되므로, 이 시점에는 `idRef.current`에 입력창이 들어 있습니다. 그래도 타입은 `HTMLInputElement | null`이므로 `?.`를 씁니다.
:::

### 문제 2 ⭐ async effect 오류 고치기

다음 코드의 오류를 고치세요.

```tsx
export function ProductDetail({ productId }: { productId: number }) {
  const [product, setProduct] = useState<Product | null>(null)
  useEffect(async () => {
    const res = await fetch(`/api/products/${productId}`)
    const data: Product = await res.json()
    setProduct(data)
  }, [productId])
  return <p>{product?.name}</p>
}
```

::: details 정답 보기
```tsx
export function ProductDetail({ productId }: { productId: number }) {
  const [product, setProduct] = useState<Product | null>(null)
  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/products/${productId}`)
      const data: Product = await res.json()
      setProduct(data)
    }
    load()
  }, [productId])
  return <p>{product?.name}</p>
}
```

effect 함수는 Promise를 돌려주면 안 되므로 안쪽에 async 함수를 만들어 부릅니다. 더 나아가 1단계처럼 `AbortController`로 이전 요청을 취소하면 경쟁 상태까지 막을 수 있습니다.
:::

### 문제 3 ⭐⭐ 리듀서에 액션 추가하기

`CartState`에 `couponAmount: number`(쿠폰 할인 금액)를 추가하고, 액션 `{ type: 'applyCoupon'; amount: number }`를 추가하세요. 먼저 액션 타입만 추가했을 때 어디서 오류가 나는지 확인한 뒤 case를 작성하세요. `clear`는 쿠폰도 0으로 되돌립니다.

::: details 정답 보기
액션 유니온에 `applyCoupon`만 추가하면 `default`의 `const unreachable: never = action` 줄에서 오류가 납니다.

```text
Type '{ type: "applyCoupon"; amount: number; }' is not assignable to type 'never'. (TS2322)
```

```ts
type CartState = { items: CartItem[]; couponAmount: number }

type CartAction =
  | { type: 'add'; product: Product }
  | { type: 'remove'; productId: number }
  | { type: 'changeQuantity'; productId: number; quantity: number }
  | { type: 'applyCoupon'; amount: number }
  | { type: 'clear' }

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    // add, remove, changeQuantity는 { ...state, items: ... } 형태로 바꿔 couponAmount를 유지
    case 'applyCoupon':
      return { ...state, couponAmount: Math.max(0, action.amount) }
    case 'clear':
      return { items: [], couponAmount: 0 }
    // ...
  }
}
```

기존 case들이 `{ items: ... }`만 돌려주면 `couponAmount`가 빠져 반환 타입 `CartState`와 맞지 않는다는 오류가 납니다. 반환 타입을 적어 두었기 때문에 고칠 곳을 모두 찾을 수 있습니다.
:::

### 문제 4 ⭐⭐ 제네릭 커스텀 훅 useDebouncedValue

값이 바뀐 뒤 `delay`밀리초 동안 더 바뀌지 않을 때만 갱신되는 `useDebouncedValue`를 만드세요. 시그니처는 `function useDebouncedValue<T>(value: T, delay: number): T`입니다. 검색창에 글자를 빠르게 칠 때 서버 요청을 줄이는 데 씁니다. 정리 함수를 꼭 쓰세요.

::: details 정답 보기
```tsx
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timerId = setTimeout(() => setDebounced(value), delay)
    // 값이 다시 바뀌면 이전 타이머를 취소 → 마지막 값만 반영됨
    return () => clearTimeout(timerId)
  }, [value, delay])

  return debounced
}

export function Search() {
  const [keyword, setKeyword] = useState('')
  const debouncedKeyword = useDebouncedValue(keyword, 300) // 타입: string

  useEffect(() => {
    if (debouncedKeyword === '') return
    console.log('검색 요청:', debouncedKeyword)
  }, [debouncedKeyword])

  return <input value={keyword} onChange={(e) => setKeyword(e.target.value)} />
}
```

"라테"를 빠르게 입력하면 글자마다 요청하지 않고, 입력을 멈춘 뒤 한 번만 `검색 요청: 라테`가 출력됩니다. 정리 함수가 이전 타이머를 지우는 것이 핵심입니다.
:::

### 문제 5 ⭐⭐ 라벨 달린 입력창

`<input>`의 모든 속성을 받으면서 `label`(필수)과 `error`(선택)를 추가로 받는 `TextField`를 만드세요. `id`는 컴포넌트 안에서 `useId()`로 만들어 `<label htmlFor>`와 연결하므로, 바깥에서 `id`를 넘기지 못하게 하세요.

::: details 정답 보기
```tsx
import { useId, type ComponentProps } from 'react'

type TextFieldProps = Omit<ComponentProps<'input'>, 'id'> & {
  label: string
  error?: string
}

export function TextField({ label, error, ...inputProps }: TextFieldProps) {
  const id = useId() // 화면 안에서 겹치지 않는 id를 만들어 주는 훅
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} aria-invalid={error !== undefined} {...inputProps} />
      {error && <p role="alert">{error}</p>}
    </div>
  )
}

<TextField label="휴대폰" type="tel" placeholder="010-0000-0000" maxLength={13} /> // ✅
<TextField label="휴대폰" id="phone" />
// ❌ Property 'id' does not exist on type 'IntrinsicAttributes & Omit<...> & { ...; }'. (TS2322)
```

`Omit`으로 `id`를 빼서 바깥에서 넘기지 못하게 막았습니다.
:::

### 문제 6 ⭐⭐⭐ 제네릭 Select

옵션 배열을 받아 `<select>`를 그리는 제네릭 컴포넌트 `Select`를 만드세요. props는 `options`(T의 배열), `value`(`T | null`), `getLabel`, `getKey`, `onChange`(선택된 T를 받는 함수)입니다. 매장 목록(`{ code: string; name: string }`)으로 사용해 보세요. `onChange`에는 문자열이 아니라 **선택된 객체 그대로**가 전달되어야 합니다.

::: details 정답 보기
```tsx
type SelectProps<T> = {
  options: T[]
  value: T | null
  getLabel: (option: T) => string
  getKey: (option: T) => string | number
  onChange: (option: T) => void
}

export function Select<T>({ options, value, getLabel, getKey, onChange }: SelectProps<T>) {
  const selectedKey = value === null ? '' : String(getKey(value))
  return (
    <select
      value={selectedKey}
      onChange={(e) => {
        // <select>의 값은 문자열이므로, key로 원래 객체를 다시 찾습니다.
        const found = options.find((o) => String(getKey(o)) === e.target.value)
        if (found !== undefined) onChange(found)
      }}
    >
      <option value="" disabled>선택하세요</option>
      {options.map((o) => (
        <option key={getKey(o)} value={String(getKey(o))}>
          {getLabel(o)}
        </option>
      ))}
    </select>
  )
}

type Store = { code: string; name: string }
const stores: Store[] = [
  { code: 'S001', name: '강남점' },
  { code: 'S002', name: '판교점' },
]

export function StorePicker() {
  const [store, setStore] = useState<Store | null>(null)
  return (
    <Select options={stores} value={store} getKey={(s) => s.code} getLabel={(s) => s.name} onChange={setStore} />
  )
}
```

`options`에서 `T = Store`가 추론되므로 `getKey`, `getLabel`의 `s`도 `Store`입니다. `find`의 결과는 `Store | undefined`라서 확인한 뒤 넘깁니다.
:::

## 확인 퀴즈

1. `useEffect`의 함수에 `async`를 바로 붙이면 왜 타입 오류가 나나요?
2. DOM용 ref와 값 보관용 ref는 각각 언제 쓰나요? 값 보관용 ref를 바꾸면 리렌더링이 일어나나요?
3. 리듀서의 `default`에 `const unreachable: never = action`을 두는 이유는 무엇인가요?
4. Context 타입을 `값 | null`로 만들고 커스텀 훅으로 감싸면 무엇이 좋은가요?
5. 커스텀 훅이 두 값을 배열로 돌려줄 때 `as const`가 없으면 어떤 문제가 생기나요?

::: details 정답 보기
1. effect 함수는 정리 함수나 아무것도 돌려주지 않아야 하는데, async 함수는 항상 Promise를 돌려주기 때문입니다.
2. DOM용은 입력창 포커스·크기 측정처럼 실제 요소가 필요할 때, 값 보관용은 타이머 번호처럼 화면과 상관없는 값을 기억할 때 씁니다. `ref.current`를 바꿔도 리렌더링은 일어나지 않습니다.
3. 액션 종류를 추가하고 case를 빠뜨리면 그 액션이 `never`에 들어가지 못해 컴파일 오류가 나기 때문입니다(완전성 검사).
4. `null` 검사를 한 곳에 모아 쓰는 쪽이 편해지고, Provider 밖에서 쓰면 즉시 알아보기 쉬운 오류가 납니다.
5. 배열로 추론되어 칸별 타입이 사라지고, 두 값 모두 두 타입의 유니온이 됩니다.
:::

## 정리

- 부수 효과는 `useEffect`에서 하고, 시작한 것(타이머·구독·요청)은 **정리 함수**로 되돌립니다. async 작업은 effect 안에 async 함수를 만들어 부릅니다.
- DOM ref는 `useRef<HTMLInputElement>(null)`, 값 보관 ref는 `useRef<number | null>(null)`처럼 씁니다. React 19 타입은 처음 값이 필수입니다.
- `useReducer`의 액션은 판별 유니온으로 만들고, `never`로 완전성 검사를 합니다.
- Context는 `createContext<값 | null>(null)`로 만들고, `null`을 검사하는 커스텀 훅(`useCart`)으로 감쌉니다.
- 튜플을 돌려주는 훅은 `as const`, 여러 타입에 쓰는 컴포넌트는 `function List<T>`, HTML 속성 확장은 `ComponentProps<'button'>`을 씁니다.

## 다음 단계

[Vue 3 + TS: script setup · defineProps · Pinia](./04-vue) — 같은 개념(컴포넌트·props·상태·스토어)이 Vue에서는 어떻게 타입과 만나는지 봅니다.
