---
title: 상태 관리 zustand를 타입 안전하게
---

# 상태 관리 zustand를 타입 안전하게

<LessonMeta level="실전" :minutes="50" prev="Vue 3의 defineProps·defineEmits·Pinia 스토어 타입" />

## 이번에 배울 것

- 상태 관리 라이브러리가 왜 필요한지, zustand가 어떤 방식인지 설명할 수 있다.
- `create<State>()(...)` 커리(curried) 패턴을 쓰는 이유를 설명할 수 있다.
- 상태 타입과 액션 타입을 나눠 장바구니 스토어를 만들 수 있다.
- 셀렉터로 필요한 값만 구독하고, 여러 값을 꺼낼 때 `useShallow`를 쓸 수 있다.
- `persist` 미들웨어와 슬라이스 패턴에 타입을 붙일 수 있다.

## 먼저 알아 둘 것

- [React + TS: 컴포넌트 · props · state · 이벤트](./02-react-basics)
- [React + TS: 훅 · Context · 커스텀 훅](./03-react-hooks) — Context와 비교합니다.
- [인터섹션(&)과 타입 합성](../part3-intermediate/01-intersection)
- [제네릭 기초](../part3-intermediate/04-generics-basics)

::: info 이 레슨의 버전 (작성 시점 2026-10 기준)
zustand 5.0.16, React 19.3에서 예제를 `tsc --noEmit`(TypeScript 5.6.3, strict)으로 검사했고, 출력이 있는 예제는 Node.js에서 실제로 실행했습니다. zustand 4와 5는 import 경로·`useShallow` 동작 등 일부가 다르므로, 기존 프로젝트라면 `npm ls zustand`로 버전을 먼저 확인하세요.
:::

## 비유로 이해하기

매장 카운터 옆에 **공용 장부** 하나가 놓여 있다고 해 봅시다.

- 상품 진열대 직원은 장부에 "아메리카노 1잔 추가"라고 적습니다.
- 계산대 직원은 장부의 **합계 칸만** 봅니다.
- 상단 안내판은 장부의 **총 수량 칸만** 봅니다.

장부는 누구 소속도 아니고, 필요한 사람이 와서 **필요한 칸만** 보고 갑니다. 합계가 바뀌면 합계를 보는 사람만 다시 확인하면 되고, 총 수량만 보는 안내판은 신경 쓸 필요가 없습니다.

**zustand**는 이 공용 장부입니다. **스토어**(store)가 장부, **셀렉터**(selector)가 "어느 칸을 볼지" 고르는 방법입니다. TypeScript는 장부의 칸 목록(상태 타입)과 할 수 있는 동작 목록(액션 타입)을 정해, 없는 칸을 읽거나 엉뚱한 값을 적는 실수를 막아 줍니다.

## 개념 설명

### 1단계: 왜 상태 관리 라이브러리인가

[지난 React 레슨](./03-react-hooks)에서 장바구니를 Context + `useReducer`로 만들었습니다. 잘 동작하지만 두 가지 불편이 있습니다.

- **Provider로 감싸야** 합니다. 감싸는 것을 잊으면 오류가 납니다.
- Context 값이 바뀌면 그 Context를 쓰는 **모든 컴포넌트가 다시 렌더링**됩니다. 총 수량만 보는 컴포넌트도 합계가 바뀔 때마다 다시 그려집니다.

zustand는 이 둘을 해결한 가벼운 라이브러리입니다.

- Provider 없이, 스토어를 만든 파일을 import해서 바로 씁니다.
- 컴포넌트는 셀렉터로 **고른 값이 바뀔 때만** 다시 렌더링됩니다.

```bash
npm install zustand
```

zustand는 TypeScript로 작성되어 타입이 패키지 안에 들어 있습니다. 별도의 `@types` 패키지는 설치하지 않습니다.

### 2단계: 가장 작은 스토어와 커리 패턴

```ts
import { create } from 'zustand'

type CounterStore = {
  count: number
  increase: () => void
  reset: () => void
}

export const useCounterStore = create<CounterStore>()((set) => ({
  count: 0,
  increase: () => set((state) => ({ count: state.count + 1 })),
  reset: () => set({ count: 0 }),
}))
```

해설:

- `create`는 스토어를 만들고, 컴포넌트에서 쓸 **훅**(`useCounterStore`)을 돌려줍니다.
- 넘기는 함수는 `set`을 받아 **처음 상태와 액션을 담은 객체**를 돌려줍니다. 상태(`count`)와 그 상태를 바꾸는 함수(`increase`)가 한 객체에 같이 삽니다.
- `set({ count: 0 })`처럼 객체를 넘기면 그 속성만 **바꿔 끼웁니다**(나머지는 유지하는 얕은 병합). `set((state) => ...)`처럼 함수를 넘기면 현재 상태를 보고 계산합니다.

눈에 띄는 것은 `create<CounterStore>()(...)`의 **괄호 두 쌍**입니다. 함수를 한 번 부르고, 돌려받은 함수를 다시 부르는 형태를 **커리**(curried) 형태라고 합니다. 왜 이렇게 쓸까요?

TypeScript에는 "제네릭 매개변수 중 **일부만 직접 적고 나머지는 추론**"하는 기능이 없습니다. 하나라도 적으면 나머지는 기본값으로 고정됩니다. 그런데 `create`는 상태 타입(`CounterStore`) 말고도 **미들웨어 정보**를 담는 타입 매개변수를 하나 더 가지고 있고, 그것은 추론되어야 합니다.

- 첫 번째 호출 `create<CounterStore>()`: 상태 타입만 **직접 적습니다.**
- 두 번째 호출 `(...)`: 넘긴 함수에서 미들웨어 정보를 **추론합니다.**

호출을 둘로 나눠 "적는 부분"과 "추론하는 부분"을 분리한 것입니다. 미들웨어를 쓰지 않으면 괄호 한 쌍으로도 동작하지만, `persist` 같은 미들웨어를 붙이는 순간 오류가 납니다(6단계). zustand 공식 문서도 TypeScript에서는 커리 형태를 쓰라고 안내하므로 처음부터 습관을 들이세요.

반대로 타입을 아예 적지 않으면 `set((s) => ...)`의 `s`를 추론할 수 없습니다.

```ts
const useBadStore = create((set) => ({
  count: 0,
  increase: () => set((s) => ({ count: s.count + 1 })),
  // ❌ Parameter 's' implicitly has an 'any' type. (TS7006)
}))
```

상태 타입을 적어 두면 빠뜨린 액션이나 잘못된 값도 잡힙니다.

```ts
create<CounterStore>()((set) => ({
  count: 0,
  increase: () => set((s) => ({ count: s.count + 1 })),
}))
// ❌ Property 'reset' is missing in type '{ count: number; increase: () => void; }' but required in type 'CounterStore'. (TS2741)

// 액션 안에서:
set({ cnt: 1 })
// ❌ Object literal may only specify known properties, and 'cnt' does not exist in type 'CounterStore | Partial<CounterStore> | ...'. (TS2353)
set({ count: '0' })
// ❌ Type 'string' is not assignable to type 'number'. (TS2322)
```

### 3단계: 상태와 액션 타입을 나눈 장바구니 스토어

실무 스토어는 상태 타입과 액션 타입을 **나눠서** 정의하고 `&`([인터섹션](../part3-intermediate/01-intersection))로 합칩니다. 나눠 두면 "처음 상태" 객체에 정확한 타입을 붙일 수 있고, 초기화(`clear`)도 깔끔해집니다.

```ts
// src/stores/cartStore.ts
import { create } from 'zustand'

export interface Product {
  id: number
  name: string
  price: number
}

export interface CartItem {
  productId: number
  name: string
  price: number
  quantity: number
}

// 상태: 데이터만
type CartState = {
  items: CartItem[]
  couponAmount: number
}

// 액션: 상태를 바꾸는 함수만
type CartActions = {
  addItem: (product: Product, quantity?: number) => void
  changeQuantity: (productId: number, quantity: number) => void
  removeItem: (productId: number) => void
  applyCoupon: (amount: number) => void
  clear: () => void
}

export type CartStore = CartState & CartActions

const initialState: CartState = { items: [], couponAmount: 0 }

export const useCartStore = create<CartStore>()((set, get) => ({
  ...initialState,

  addItem: (product, quantity = 1) =>
    set((state) => {
      const exists = state.items.some((i) => i.productId === product.id)
      if (exists) {
        return {
          items: state.items.map((i) =>
            i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i,
          ),
        }
      }
      return {
        items: [...state.items, { productId: product.id, name: product.name, price: product.price, quantity }],
      }
    }),

  changeQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId) // get()으로 현재 상태와 다른 액션에 접근
      return
    }
    set((state) => ({
      items: state.items.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
    }))
  },

  removeItem: (productId) =>
    set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),

  applyCoupon: (amount) => set({ couponAmount: Math.max(0, amount) }),

  clear: () => set(initialState),
}))
```

해설:

- 액션의 매개변수(`product`, `quantity` 등)에 타입을 쓰지 않았는데도 `CartStore`를 보고 **문맥적으로 추론**됩니다.
- 두 번째 인자 `get`은 현재 상태 전체를 돌려줍니다. 액션 안에서 다른 액션을 부르거나, 계산에 현재 값이 필요할 때 씁니다.
- 상태는 React state처럼 **새 배열·새 객체**로 바꿉니다. `state.items.push(...)`처럼 고치면 zustand가 바뀐 것을 알아채지 못해 화면이 갱신되지 않을 수 있습니다.
- `clear`는 `initialState`를 그대로 넣어 처음 상태로 돌립니다. 상태 타입을 따로 둔 덕분입니다.

스토어는 React 밖에서도 `getState()`로 쓸 수 있어서 동작을 바로 확인할 수 있습니다.

```ts
const { addItem, changeQuantity, applyCoupon } = useCartStore.getState()
addItem({ id: 1, name: '아메리카노', price: 4500 }, 2)
addItem({ id: 2, name: '카페라테', price: 5000 })
addItem({ id: 1, name: '아메리카노', price: 4500 })
applyCoupon(2000)

const s = useCartStore.getState()
console.log(selectTotalQuantity(s), selectPayAmount(s)) // 셀렉터는 4단계에서 정의
// 출력: 4 16500

changeQuantity(2, 0)
console.log(useCartStore.getState().items.map((i) => `${i.name} x${i.quantity}`))
// 출력: [ '아메리카노 x3' ]

useCartStore.getState().clear()
console.log(useCartStore.getState().items.length, useCartStore.getState().couponAmount)
// 출력: 0 0
```

`getState()`로 꺼낸 **액션**은 언제나 같은 함수라서 미리 꺼내 둬도 됩니다. 하지만 **상태 값**은 꺼낸 순간의 값이므로, 바뀐 뒤에는 `getState()`를 다시 불러야 합니다.

### 4단계: 셀렉터 — 필요한 칸만 구독하기

컴포넌트에서는 훅에 **셀렉터 함수**를 넘겨 필요한 값만 꺼냅니다.

```tsx
// 셀렉터는 스토어 파일에 함께 둡니다.
export const selectTotalQuantity = (state: CartStore) =>
  state.items.reduce((sum, i) => sum + i.quantity, 0)

export const selectPayAmount = (state: CartStore) => {
  const subtotal = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  return Math.max(0, subtotal - state.couponAmount)
}
```

```tsx
export function CartBadge() {
  const totalQuantity = useCartStore(selectTotalQuantity) // 타입: number
  return <span>{totalQuantity}</span>
}

export function AddButton() {
  const addItem = useCartStore((s) => s.addItem) // 액션도 셀렉터로 꺼냄
  return <button onClick={() => addItem({ id: 1, name: '아메리카노', price: 4500 })}>담기</button>
}
```

- 셀렉터의 반환 타입이 그대로 훅의 반환 타입이 됩니다. `useCartStore(selectTotalQuantity)`는 `number`입니다.
- `CartBadge`는 총 수량이 **바뀔 때만** 다시 렌더링됩니다. 쿠폰 금액이 바뀌어도 그대로입니다. zustand는 셀렉터 결과를 이전 결과와 `Object.is`(사실상 `===`)로 비교하기 때문입니다.
- `useCartStore()`처럼 셀렉터 없이 부르면 스토어 **전체**를 구독하게 되어, 어떤 값이 바뀌어도 다시 렌더링됩니다. 셀렉터를 쓰는 것이 기본입니다.

### 5단계: 여러 값을 꺼낼 때 — useShallow

값 두 개를 한 번에 꺼내고 싶어서 객체를 돌려주는 셀렉터를 쓰면 문제가 생깁니다.

```tsx
// ⚠️ 매번 새 객체를 만드는 셀렉터
const { payAmount, clear } = useCartStore((state) => ({
  payAmount: selectPayAmount(state),
  clear: state.clear,
}))
```

타입 오류는 없습니다. 하지만 셀렉터가 실행될 때마다 **새 객체**를 만들기 때문에 `===` 비교가 늘 "다르다"가 됩니다. zustand 5에서는 이것이 무한 렌더링으로 이어져 `Maximum update depth exceeded` 오류가 날 수 있습니다(zustand 4에서는 불필요하게 매번 다시 렌더링되는 성능 문제였습니다).

`useShallow`로 셀렉터를 감싸면 **객체·배열의 각 칸을 한 단계만**(얕게, shallow) 비교해서, 칸의 값이 같으면 같은 것으로 봅니다.

```tsx
import { useShallow } from 'zustand/react/shallow'

export function CartFooter() {
  const { payAmount, clear } = useCartStore(
    useShallow((state) => ({ payAmount: selectPayAmount(state), clear: state.clear })),
  )
  return (
    <footer>
      <strong>{payAmount.toLocaleString('ko-KR')}원</strong>
      <button onClick={clear}>비우기</button>
    </footer>
  )
}

// 배열로 꺼낼 때는 as const로 튜플 타입을 지킵니다.
const [items, removeItem] = useCartStore(useShallow((s) => [s.items, s.removeItem] as const))
```

- `useShallow`는 셀렉터의 타입을 그대로 유지합니다. `payAmount`는 `number`, `clear`는 `() => void`입니다.
- 배열을 돌려줄 때 `as const`가 없으면 두 칸의 타입이 유니온 배열로 넓혀집니다([커스텀 훅의 튜플 반환](./03-react-hooks)과 같은 이유).
- 값 하나만 필요하면 `useShallow` 없이 셀렉터를 여러 번 쓰는 것이 가장 단순합니다.

### 6단계: persist 미들웨어 — 새로고침해도 남는 상태

**미들웨어**(middleware)는 스토어를 감싸 기능을 덧붙이는 함수입니다. `persist`는 상태를 브라우저 저장소(`localStorage`)에 저장해 새로고침 후에도 복원합니다. 최근 본 상품 목록을 예로 듭니다.

```ts
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type RecentState = {
  recentIds: number[]
  addRecent: (id: number) => void
}

export const useRecentStore = create<RecentState>()(
  persist(
    (set) => ({
      recentIds: [],
      addRecent: (id) =>
        set((state) => ({ recentIds: [id, ...state.recentIds.filter((x) => x !== id)].slice(0, 5) })),
    }),
    {
      name: 'recent-products', // localStorage의 키 이름
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ recentIds: state.recentIds }), // 저장할 칸만 고름
    },
  ),
)
```

해설:

- `persist(스토어 함수, 옵션)`으로 감싸고, 그 결과를 커리 형태의 두 번째 괄호에 넣습니다.
- `partialize`는 **저장할 부분만** 골라 돌려주는 함수입니다. 함수(액션)는 저장할 수 없고, 화면 상태 같은 일시적인 값은 저장할 필요가 없습니다.
- `localStorage`는 같은 페이지에서 실행되는 스크립트라면 누구나 읽을 수 있고, 사용자가 값을 고칠 수도 있습니다. **토큰·개인정보 같은 민감한 값은 저장하지 않는 것**이 원칙이고, 복원된 값도 "믿을 수 없는 외부 입력"으로 취급해야 합니다. 저장 구조를 바꿀 때는 옵션의 `version`과 `migrate`로 옛 데이터를 변환합니다.

커리 형태가 아닌 `create<RecentState>(persist(...))`로 쓰면 미들웨어 정보가 추론되지 못해 오류가 납니다.

```text
Argument of type 'StateCreator<RecentState, [], [["zustand/persist", RecentState]]>' is not assignable to parameter of type 'StateCreator<RecentState, [], []>'.
  ...
        Type '[["zustand/persist", RecentState]]' is not assignable to type '[]'.
          Source has 1 element(s) but target allows only 0. (TS2345)
```

메시지 안의 `["zustand/persist", RecentState]`가 바로 2단계에서 말한 "추론되어야 하는 미들웨어 정보"입니다. 상태 타입만 적은 괄호 한 쌍에서는 이 정보 자리가 기본값 `[]`(없음)로 고정되어 버립니다.

### 7단계: 슬라이스 패턴 — 큰 스토어 나누기

스토어가 커지면 한 파일이 길어집니다. 기능별로 **슬라이스**(slice, 조각)를 만들고 하나의 스토어로 합칠 수 있습니다. 슬라이스의 타입에는 `StateCreator`를 씁니다.

```ts
import { create, type StateCreator } from 'zustand'

type CartSlice = {
  items: { productId: number; quantity: number }[]
  addItem: (productId: number) => void
}

type MemberSlice = {
  memberName: string | null
  login: (name: string) => void
  logout: () => void
}

type ShopStore = CartSlice & MemberSlice

// StateCreator<전체 스토어 타입, [], [], 이 슬라이스 타입>
const createCartSlice: StateCreator<ShopStore, [], [], CartSlice> = (set) => ({
  items: [],
  addItem: (productId) => set((state) => ({ items: [...state.items, { productId, quantity: 1 }] })),
})

const createMemberSlice: StateCreator<ShopStore, [], [], MemberSlice> = (set, get) => ({
  memberName: null,
  login: (name) => set({ memberName: name }),
  logout: () => {
    set({ memberName: null })
    // 다른 슬라이스의 상태도 get()으로 볼 수 있음(전체 타입이 ShopStore이므로)
    if (get().items.length > 0) set({ items: [] })
  },
})

export const useShopStore = create<ShopStore>()((...a) => ({
  ...createCartSlice(...a),
  ...createMemberSlice(...a),
}))

useShopStore.getState().login('김민지')
useShopStore.getState().addItem(101)
console.log(useShopStore.getState().memberName, useShopStore.getState().items.length)
// 출력: 김민지 1
useShopStore.getState().logout()
console.log(useShopStore.getState().memberName, useShopStore.getState().items.length)
// 출력: null 0
```

해설:

- `StateCreator`의 첫 번째 타입 매개변수는 **합쳐진 전체 스토어 타입**입니다. 그래서 `set`·`get`이 다른 슬라이스의 칸까지 알아봅니다.
- 네 번째 타입 매개변수는 **이 슬라이스가 돌려주는 부분**입니다.
- 가운데 `[]` 두 개는 미들웨어 정보 자리입니다. 합친 스토어에 `persist`를 씌운다면 이 자리도 맞춰 줘야 하므로, 처음에는 미들웨어 없이 연습하고 필요할 때 공식 문서의 "슬라이스 + 미들웨어" 예제를 참고하세요.
- `(...a) => ...`는 `set, get, store` 세 인자를 받아 그대로 각 슬라이스에 넘기는 짧은 표현입니다.

## 자주 하는 실수

### 실수 1: 커리 괄호를 빠뜨리고 미들웨어를 붙이기

```ts
export const useRecentStore = create<RecentState>(
  persist((set) => ({ /* ... */ }), { name: 'recent-products' }),
)
// ❌ ... Source has 1 element(s) but target allows only 0. (TS2345)
```

왜 틀렸나: 상태 타입을 적는 순간 미들웨어 정보 타입 매개변수가 기본값(`[]`)으로 고정되어, `persist`가 만든 정보와 맞지 않습니다.

고친 코드: 괄호를 두 쌍으로 씁니다.

```ts
export const useRecentStore = create<RecentState>()(
  persist((set) => ({ /* ... */ }), { name: 'recent-products' }),
)
```

### 실수 2: 객체를 돌려주는 셀렉터를 그대로 쓰기

```tsx
const { items, couponAmount } = useCartStore((s) => ({ items: s.items, couponAmount: s.couponAmount }))
```

왜 틀렸나: 타입은 맞지만 셀렉터가 매번 새 객체를 만들어 "값이 바뀌었다"고 판단됩니다. zustand 5에서는 무한 렌더링 오류로 이어질 수 있습니다.

고친 코드: `useShallow`로 감싸거나, 값마다 셀렉터를 따로 씁니다.

```tsx
const { items, couponAmount } = useCartStore(
  useShallow((s) => ({ items: s.items, couponAmount: s.couponAmount })),
)
// 또는
const items = useCartStore((s) => s.items)
const couponAmount = useCartStore((s) => s.couponAmount)
```

### 실수 3: 상태를 직접 고치기

```ts
addItem: (product) =>
  set((state) => {
    state.items.push({ productId: product.id, name: product.name, price: product.price, quantity: 1 })
    return { items: state.items }
  }),
```

왜 틀렸나: 타입 오류는 없지만 같은 배열을 그대로 돌려주므로, 셀렉터 비교(`===`)에서 "바뀌지 않음"으로 판단되어 화면이 갱신되지 않을 수 있습니다.

고친 코드: 새 배열을 만듭니다.

```ts
addItem: (product) =>
  set((state) => ({
    items: [...state.items, { productId: product.id, name: product.name, price: product.price, quantity: 1 }],
  })),
```

### 실수 4: 셀렉터 없이 스토어 전체를 구독하기

```tsx
function CartBadge() {
  const store = useCartStore() // 전체 구독
  return <span>{store.items.length}</span>
}
```

왜 틀렸나: 쿠폰 금액처럼 이 컴포넌트와 상관없는 값이 바뀌어도 다시 렌더링됩니다. 컴포넌트가 많아지면 느려집니다.

고친 코드:

```tsx
function CartBadge() {
  const count = useCartStore((s) => s.items.length)
  return <span>{count}</span>
}
```

### 실수 5: persist로 민감한 값을 저장하기

```ts
persist(
  (set) => ({ accessToken: null as string | null, /* ... */ }),
  { name: 'auth' }, // partialize 없음 → 토큰까지 localStorage에 저장
)
```

왜 틀렸나: `localStorage`의 값은 같은 페이지에서 실행되는 모든 스크립트가 읽을 수 있어서, XSS(악성 스크립트 삽입) 공격이 있으면 토큰이 그대로 유출됩니다.

고친 코드: `partialize`로 저장할 칸을 명시하고, 민감한 값은 빼거나 팀의 보안 방침(예: 서버가 설정하는 HttpOnly 쿠키)에 따라 관리합니다.

```ts
persist(
  (set) => ({ /* ... */ }),
  { name: 'auth', partialize: (state) => ({ memberName: state.memberName }) },
)
```

## 직접 해 보기

### 문제 1 ⭐ 카운터 스토어

`count`, `increase()`, `decrease()`(0 아래로 내려가지 않음), `reset()`을 가진 `useCounterStore`를 커리 형태로 만드세요.

::: details 정답 보기
```ts
type CounterStore = {
  count: number
  increase: () => void
  decrease: () => void
  reset: () => void
}

export const useCounterStore = create<CounterStore>()((set) => ({
  count: 0,
  increase: () => set((s) => ({ count: s.count + 1 })),
  decrease: () => set((s) => ({ count: Math.max(0, s.count - 1) })),
  reset: () => set({ count: 0 }),
}))
```
:::

### 문제 2 ⭐ 상품별 수량 셀렉터

장바구니 스토어에서 **특정 상품의 수량**만 구독하는 컴포넌트 `ItemQuantity`를 만드세요. props는 `productId`이고, 장바구니에 없으면 0을 보여 줍니다.

::: details 정답 보기
```tsx
export function ItemQuantity({ productId }: { productId: number }) {
  const quantity = useCartStore(
    (s) => s.items.find((i) => i.productId === productId)?.quantity ?? 0,
  ) // 타입: number
  return <span>{quantity}개</span>
}
```

셀렉터가 숫자(원시 값)를 돌려주므로 `useShallow`가 필요 없습니다. 이 상품의 수량이 바뀔 때만 다시 렌더링됩니다.
:::

### 문제 3 ⭐⭐ 셀렉터 추가와 useShallow

`selectSubtotal`(할인 전 합계)과 `selectIsEmpty`(비었는지) 셀렉터를 만들고, 두 값을 `useShallow`로 한 번에 꺼내 "장바구니가 비었습니다" 또는 합계를 보여 주는 `CartSummary`를 만드세요.

::: details 정답 보기
```tsx
export const selectSubtotal = (state: CartStore) =>
  state.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
export const selectIsEmpty = (state: CartStore) => state.items.length === 0

export function CartSummary() {
  const { subtotal, isEmpty } = useCartStore(
    useShallow((s) => ({ subtotal: selectSubtotal(s), isEmpty: selectIsEmpty(s) })),
  )
  if (isEmpty) return <p>장바구니가 비었습니다</p>
  return <p>합계 {subtotal.toLocaleString('ko-KR')}원</p>
}
```

`useShallow`가 `subtotal`과 `isEmpty` 각각을 이전 값과 비교하므로, 둘 다 그대로면 다시 렌더링하지 않습니다.
:::

### 문제 4 ⭐⭐ POS 설정 스토어 저장하기

다음 상태를 가진 설정 스토어를 만들고, `persist`로 `storeCode`와 `theme`만 저장하세요. `isSettingsOpen`(설정 창 열림 여부)은 저장하지 않습니다.

- 상태: `storeCode`(`string | null`), `theme`(`'light' | 'dark'`), `isSettingsOpen`(`boolean`)
- 액션: `setStoreCode(code)`, `toggleTheme()`, `setSettingsOpen(open)`

::: details 정답 보기
```ts
type SettingsState = {
  storeCode: string | null
  theme: 'light' | 'dark'
  isSettingsOpen: boolean
}
type SettingsActions = {
  setStoreCode: (code: string) => void
  toggleTheme: () => void
  setSettingsOpen: (open: boolean) => void
}

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      storeCode: null,
      theme: 'light',
      isSettingsOpen: false,
      setStoreCode: (code) => set({ storeCode: code }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
      setSettingsOpen: (open) => set({ isSettingsOpen: open }),
    }),
    {
      name: 'pos-settings',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ storeCode: s.storeCode, theme: s.theme }),
    },
  ),
)
```

`theme: 'light'`은 상태 타입이 `'light' | 'dark'`라서 `string`으로 넓혀지지 않습니다. 상태 타입을 먼저 적어 두는 이점입니다.
:::

### 문제 5 ⭐⭐⭐ 쿠폰 슬라이스

7단계의 슬라이스 패턴으로 `CartSlice`(items에 `price` 포함, `addItem(productId, price)`)와 `CouponSlice`를 합친 스토어를 만드세요. `CouponSlice`는 다음을 가집니다.

- `couponAmount: number`
- `applyCoupon(amount)`: 0 미만은 0, 장바구니 합계보다 크면 합계로 맞춤
- `payAmount()`: 합계 − 쿠폰 금액

4500원, 5000원 상품을 담고 20000원 쿠폰을 적용했을 때 `couponAmount`와 `payAmount()`를 출력하세요.

::: details 정답 보기
```ts
type CartSlice = {
  items: { productId: number; price: number; quantity: number }[]
  addItem: (productId: number, price: number) => void
}
type CouponSlice = {
  couponAmount: number
  applyCoupon: (amount: number) => void
  payAmount: () => number
}
type ShopStore = CartSlice & CouponSlice

const createCartSlice: StateCreator<ShopStore, [], [], CartSlice> = (set) => ({
  items: [],
  addItem: (productId, price) =>
    set((s) => ({ items: [...s.items, { productId, price, quantity: 1 }] })),
})

const createCouponSlice: StateCreator<ShopStore, [], [], CouponSlice> = (set, get) => ({
  couponAmount: 0,
  applyCoupon: (amount) => {
    // 다른 슬라이스(CartSlice)의 items를 get()으로 읽음
    const subtotal = get().items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    set({ couponAmount: Math.min(Math.max(0, amount), subtotal) })
  },
  payAmount: () => {
    const { items, couponAmount } = get()
    return items.reduce((sum, i) => sum + i.price * i.quantity, 0) - couponAmount
  },
})

export const useShopStore = create<ShopStore>()((...a) => ({
  ...createCartSlice(...a),
  ...createCouponSlice(...a),
}))

const shop = useShopStore.getState()
shop.addItem(1, 4500)
shop.addItem(2, 5000)
useShopStore.getState().applyCoupon(20000)
console.log(useShopStore.getState().couponAmount, useShopStore.getState().payAmount())
// 출력: 9500 0
```

쿠폰 금액이 합계(9500원)로 맞춰져 결제 금액이 0원이 됩니다. `StateCreator`의 첫 타입 매개변수를 전체 스토어 타입으로 둔 덕분에 `get().items`를 쓸 수 있습니다.
:::

## 확인 퀴즈

1. zustand를 쓰면 Context + `useReducer`와 비교해 무엇이 좋아지나요?
2. `create<State>()(...)`처럼 괄호를 두 쌍 쓰는 이유는 무엇인가요?
3. 셀렉터가 객체를 돌려줄 때 `useShallow`가 필요한 이유는 무엇인가요?
4. `persist`의 `partialize`는 무엇을 하나요? 어떤 값을 빼야 하나요?
5. 슬라이스 타입 `StateCreator<ShopStore, [], [], CartSlice>`에서 첫 번째와 네 번째 타입 매개변수는 각각 무엇인가요?

::: details 정답 보기
1. Provider 없이 쓸 수 있고, 셀렉터로 고른 값이 바뀔 때만 컴포넌트가 다시 렌더링됩니다.
2. TypeScript는 제네릭 매개변수 일부만 적고 나머지를 추론할 수 없으므로, 첫 호출에서 상태 타입을 적고 두 번째 호출에서 미들웨어 정보를 추론하게 나눈 것입니다.
3. 매번 새 객체가 만들어져 `===` 비교에서 항상 "바뀜"으로 판단되기 때문입니다. `useShallow`는 칸별로 얕게 비교합니다.
4. 저장할 칸만 골라 돌려줍니다. 액션(함수), 일시적인 화면 상태, 토큰·개인정보 같은 민감한 값은 뺍니다.
5. 첫 번째는 합쳐진 전체 스토어 타입, 네 번째는 이 슬라이스가 돌려주는 부분의 타입입니다.
:::

## 정리

- zustand 스토어는 `create<State>()((set, get) => ({ ...상태, ...액션 }))`처럼 **커리 형태**로 만듭니다. 상태 타입은 적고, 미들웨어 정보는 추론에 맡기기 위해서입니다.
- 상태 타입과 액션 타입을 나누고 `&`로 합치면 처음 상태·초기화가 깔끔해집니다. 상태는 항상 새 배열·객체로 바꿉니다.
- 컴포넌트에서는 셀렉터로 필요한 값만 구독하고, 객체·배열을 돌려주는 셀렉터는 `useShallow`로 감쌉니다.
- `persist`는 `partialize`로 저장할 칸을 고르고, 민감한 값은 저장하지 않습니다.
- 큰 스토어는 `StateCreator`로 타입을 붙인 슬라이스로 나눠 합칩니다.

## 다음 단계

[API 클라이언트 타입 설계 (axios · 공통 응답 · 에러)](./06-api-client) — 스토어에 채울 데이터를 서버에서 가져오는 API 클라이언트를 타입 안전하게 설계합니다.
