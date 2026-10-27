---
title: "Vue 3 + TS: script setup · defineProps · Pinia"
---

# Vue 3 + TS: script setup · defineProps · Pinia

<LessonMeta level="실전" :minutes="75" prev="React 훅·Context·커스텀 훅·제네릭 컴포넌트에 타입 붙이기" />

## 이번에 배울 것

- Vue의 최소 개념(단일 파일 컴포넌트, 템플릿, 반응형 상태)을 설명할 수 있다.
- `<script setup lang="ts">`에서 `defineProps`·`defineEmits`를 **타입 기반**으로 선언하고 `withDefaults`로 기본값을 줄 수 있다.
- `ref`·`reactive`·`computed`에 타입을 붙이고, `useTemplateRef`로 DOM 요소를 가져올 수 있다.
- Pinia 스토어를 setup 방식으로 만들고 `storeToRefs`로 타입과 반응성을 함께 지킬 수 있다.
- `vue-tsc`로 템플릿까지 타입 검사를 할 수 있다.

## 먼저 알아 둘 것

- [React + TS: 컴포넌트 · props · state · 이벤트](./02-react-basics) — 컴포넌트·props·상태 개념이 같습니다. React를 건너뛰었어도 이 레슨만으로 이해할 수 있게 썼습니다.
- [제네릭 기초](../part3-intermediate/04-generics-basics), [튜플](../part2-types/03-arrays-tuples)
- [빌드 도구: tsc · Vite · tsup · tsx](../part6-tooling/06-build-tools)

::: info 이 레슨의 버전 (작성 시점 2026-10 기준)
Vue 3.5.44, Pinia 4.1.0, vue-tsc 3.3.13, TypeScript 5.6.3(strict)으로 예제를 `vue-tsc --noEmit`으로 검사했습니다. create-vite 9.3의 `vue-ts` 템플릿은 TypeScript 6.0 계열을 설치합니다. Vue 3.4·3.5에서 새로 생긴 기능은 본문에 버전을 표시했습니다.
:::

## 비유로 이해하기

Vue 컴포넌트 파일(`.vue`)은 **세 칸짜리 도시락**입니다.

- **스크립트 칸**: 재료와 조리법(데이터, 함수)
- **템플릿 칸**: 담음새(화면 모양)
- **스타일 칸**: 장식(CSS)

한 통에 같이 들어 있어서 "상품 카드" 하나에 필요한 것이 한 파일에 모입니다.

Vue의 상태는 **센서 달린 화이트보드**와 같습니다. 화이트보드의 숫자를 고쳐 쓰면, 그 숫자를 보고 있던 화면이 **알아서** 다시 그려집니다. React처럼 "set 함수로 바꿔 달라고 요청"하지 않고 **값을 직접 바꾸면** 됩니다. 이것을 **반응성**(reactivity)이라고 합니다.

TypeScript는 화이트보드 칸마다 "숫자만", "상품 목록만" 같은 **라벨**을 붙이고, 템플릿 칸에서 존재하지 않는 재료를 꺼내 쓰는 실수까지 잡아 줍니다.

## 개념 설명

### 1단계: Vue 최소 개념 — 단일 파일 컴포넌트

`.vue` 파일 하나가 컴포넌트 하나입니다. 이것을 **단일 파일 컴포넌트**(SFC, Single-File Component)라고 합니다.

```vue
<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0) // 반응형 상태

function increase() {
  count.value++ // 값을 직접 바꾸면 화면이 다시 그려짐
}
</script>

<template>
  <button @click="increase">담은 수량: {{ count }}</button>
</template>

<style scoped>
button { font-weight: bold; }
</style>
```

- `<script setup lang="ts">`: 컴포넌트의 로직입니다. `lang="ts"`가 **TypeScript로 쓰겠다**는 표시이고, `setup`은 "여기 선언한 변수·함수를 템플릿에서 바로 쓴다"는 뜻입니다.
- `<template>`: 화면 모양입니다. HTML에 Vue 문법이 더해집니다.
  - 이중 중괄호 보간: 값을 글자로 표시합니다. 템플릿 안에서는 `count.value`가 아니라 `count`라고 씁니다(자동으로 풀어 줌).
  - `@click`: 이벤트 연결(`v-on:click`의 줄임)
  - `:disabled="..."`: 속성에 값 연결(`v-bind:disabled`의 줄임)
  - `v-if`, `v-for`: 조건부·반복 렌더링
  - `v-model`: 입력창과 상태를 양방향으로 연결
- `<style scoped>`: 이 컴포넌트에만 적용되는 CSS입니다.

**렌더링**은 Vue가 템플릿을 실제 화면으로 만드는 일입니다. 반응형 상태가 바뀌면 그 상태를 쓰는 부분만 다시 그립니다.

프로젝트는 React와 같은 도구로 만듭니다.

```bash
npm create vite@latest my-shop-vue -- --template vue-ts
cd my-shop-vue
npm install
npm install pinia
npm run dev
```

::: warning 템플릿 타입 검사는 vue-tsc로
`tsc`는 `.vue` 파일을 읽지 못합니다. Vue 프로젝트는 **`vue-tsc`** 로 타입 검사를 합니다. 템플릿 안의 표현식까지 검사합니다. 템플릿의 `build` 스크립트는 `vue-tsc -b && vite build`이고, 검사만 하려면 `npx vue-tsc --noEmit`을 실행합니다. 개발 서버(`npm run dev`)는 타입 검사를 하지 않습니다. VS Code에서는 공식 확장 **Vue (Official)** 를 설치해야 `.vue` 파일의 타입 오류가 빨간 줄로 보입니다.
:::

### 2단계: defineProps — 타입 기반 선언

props는 **부모가 자식에게 넘기는 값**입니다. `<script setup>`에서는 `defineProps`로 선언합니다. 제네릭 자리에 **객체 타입을 그대로** 넣는 방식을 **타입 기반 선언**이라고 합니다.

먼저 공용 타입을 둡니다.

```ts
// src/types.ts
export interface Product {
  id: number
  name: string
  price: number
  soldOut: boolean
}
```

```vue
<!-- src/components/ProductCard.vue -->
<script setup lang="ts">
import type { Product } from '../types'

const props = withDefaults(
  defineProps<{
    product: Product
    badge?: string
    showPrice?: boolean
  }>(),
  {
    badge: '신상품',
    showPrice: true,
  },
)

const emit = defineEmits<{
  add: [productId: number, quantity: number]
  favorite: [productId: number]
}>()

function handleAdd() {
  emit('add', props.product.id, 1)
}
</script>

<template>
  <div class="product-card">
    <span>{{ badge }}</span>
    <h3>{{ product.name }}</h3>
    <p v-if="showPrice">{{ product.price.toLocaleString('ko-KR') }}원</p>
    <button :disabled="product.soldOut" @click="handleAdd">담기</button>
    <button @click="emit('favorite', product.id)">찜</button>
  </div>
</template>
```

해설:

- `defineProps`와 `defineEmits`는 **import하지 않고** 씁니다. Vue 컴파일러가 처리하는 특별한 함수(컴파일러 매크로)이기 때문입니다.
- `badge?: string`처럼 `?`를 붙이면 선택 props입니다.
- `withDefaults(defineProps<...>(), { 기본값들 })`로 선택 props의 기본값을 줍니다. 기본값이 있으므로 `props.badge`의 타입은 `string`(`undefined` 없음)이 됩니다.
- 스크립트 안에서는 `props.product`처럼 `props.`을 붙이고, 템플릿에서는 `product`만 씁니다.

::: info 예전 방식: 런타임 선언
`defineProps({ product: { type: Object as PropType<Product>, required: true } })`처럼 쓰는 **런타임 선언** 방식도 있습니다. 옵션 API 시절부터 쓰던 방식이라 기존 코드에서 자주 봅니다. 새 TypeScript 코드에서는 짧고 정확한 타입 기반 선언을 권합니다. 한 컴포넌트에서 두 방식을 섞을 수는 없습니다.
:::

### 3단계: Vue 3.5의 반응형 props 구조 분해

Vue **3.5부터**는 `defineProps`의 결과를 구조 분해하면서 **JavaScript 기본값 문법**으로 기본값을 줄 수 있습니다. `withDefaults`가 필요 없어집니다.

```vue
<script setup lang="ts">
import { computed } from 'vue'
import type { Product } from '../types'

// Vue 3.5+: 구조 분해해도 반응성이 유지됨
const { product, badge = '신상품', showPrice = true } = defineProps<{
  product: Product
  badge?: string
  showPrice?: boolean
}>()

const priceText = computed(() => `${product.price.toLocaleString('ko-KR')}원`)
</script>

<template>
  <div>
    <span>{{ badge }}</span>
    <h3>{{ product.name }}</h3>
    <p v-if="showPrice">{{ priceText }}</p>
  </div>
</template>
```

- 일반 JavaScript에서 객체를 구조 분해하면 그 순간의 값이 복사되어 이후 변화가 반영되지 않습니다. Vue 3.5 컴파일러는 `defineProps` 구조 분해를 특별히 바꿔서 **부모가 값을 바꾸면 따라 바뀌게** 해 줍니다.
- 단, 구조 분해한 변수를 `watch`나 다른 함수에 넘길 때는 `() => product`처럼 **함수로 감싸서** 넘겨야 반응성이 유지됩니다.
- Vue 3.4 이하라면 구조 분해하지 말고 `withDefaults` + `props.이름`을 쓰세요.

### 4단계: defineEmits — 자식이 부모에게 알리기

자식이 부모에게 "버튼이 눌렸어요"라고 알릴 때는 **이벤트를 내보냅니다**(emit). 2단계의 `defineEmits`를 다시 봅시다.

```ts
const emit = defineEmits<{
  add: [productId: number, quantity: number]
  favorite: [productId: number]
}>()
```

- 키는 이벤트 이름, 값은 **이름 붙은 튜플**로 "함께 보낼 값들"입니다. 이 문법은 Vue 3.3부터 지원합니다.
- `emit('add', 1)`처럼 값을 빠뜨리거나, `emit('ad', ...)`처럼 이름을 틀리면 오류가 납니다.

```ts
emit('add', 1)
// ❌ Expected 3 arguments, but got 2. (TS2554)

emit('ad', 1, 2)
// ❌ Argument of type '"ad"' is not assignable to parameter of type '"add"'. (TS2345)
```

부모에서는 `@이벤트이름`으로 받습니다. 받는 함수의 매개변수 타입도 검사됩니다.

```vue
<script setup lang="ts">
import ProductCard from './ProductCard.vue'
import type { Product } from '../types'

const americano: Product = { id: 1, name: '아메리카노', price: 4500, soldOut: false }

function handleAdd(productId: number, quantity: number) {
  console.log('담기', productId, quantity)
}
</script>

<template>
  <ProductCard :product="americano" @add="handleAdd" @favorite="(id) => console.log(id)" />
</template>
```

`(id) => ...`의 `id`는 `number`로 추론됩니다. 만약 `handleAdd`의 매개변수를 `id: string`으로 쓰면 다음 오류가 납니다.

```text
Type '(id: string) => void' is not assignable to type '(productId: number, quantity: number) => any'.
  Types of parameters 'id' and 'productId' are incompatible.
    Type 'number' is not assignable to type 'string'. (TS2322)
```

필수 props를 빠뜨려도 템플릿에서 오류가 납니다(메시지는 길어서 핵심 줄만 옮깁니다).

```text
<ProductCard /> 에서:
Property 'product' is missing in type '{}' but required in type '{ readonly product: Product; ... }'. (TS2345)
```

::: tip v-model용 props: defineModel (Vue 3.4+)
부모와 값을 **양방향으로** 주고받는 컴포넌트(수량 선택기, 입력창)는 `defineModel`이 편합니다. `const quantity = defineModel<number>({ required: true })`로 선언하면 `quantity.value`를 바꾸는 것만으로 부모의 `v-model` 값이 바뀝니다. props + `update:modelValue` emit을 한 번에 만들어 주는 매크로입니다.
:::

### 5단계: ref · reactive · computed의 타입

Vue의 반응형 상태를 만드는 도구는 세 가지입니다.

```vue
<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { Product } from '../types'

// ref: 값 하나를 반응형 상자에 담음. 스크립트에서는 .value로 접근
const keyword = ref('') // Ref<string>
const selected = ref<Product | null>(null) // 제네릭으로 타입 지정
const products = ref<Product[]>([
  { id: 1, name: '아메리카노', price: 4500, soldOut: false },
  { id: 2, name: '카페라테', price: 5000, soldOut: true },
])

// reactive: 객체 전체를 반응형으로. .value 없이 속성에 바로 접근
const form = reactive({
  name: '',
  price: 0,
})

// computed: 다른 반응형 값에서 계산되는 값. 원래 값이 바뀌면 자동으로 다시 계산
const filtered = computed(() => products.value.filter((p) => p.name.includes(keyword.value.trim())))
const total = computed<number>(() => products.value.reduce((sum, p) => sum + p.price, 0))

function handleSubmit() {
  products.value.push({ id: Date.now(), name: form.name, price: form.price, soldOut: false })
  form.name = ''
  form.price = 0
}
</script>

<template>
  <input v-model="keyword" placeholder="메뉴 검색" />
  <p>합계 {{ total }}원</p>
  <ul>
    <li v-for="p in filtered" :key="p.id">{{ p.name }}</li>
  </ul>
  <form @submit.prevent="handleSubmit">
    <input v-model="form.name" />
    <input v-model.number="form.price" type="number" />
    <button type="submit">등록</button>
  </form>
</template>
```

해설:

- **`ref`** 는 대부분 추론에 맡깁니다(`ref('')` → `Ref<string>`). 다만 React의 `useState`와 같은 이유로 **`null`로 시작하거나 빈 배열로 시작하는 경우**는 제네릭을 적습니다.

```ts
const selected = ref(null)
selected.value = americano
// ❌ Type 'Product' is not assignable to type 'null'. (TS2322)

const count = ref(0)
count.value = '열'
// ❌ Type 'string' is not assignable to type 'number'. (TS2322)
```

- **`reactive`** 는 객체에만 씁니다. 처음 값에서 타입이 추론되며, 필요하면 `reactive<OrderForm>({...})`처럼 인터페이스를 줄 수 있습니다. 변수 자체를 새 객체로 바꾸면(`form = {...}`) 반응성이 끊기므로 속성만 바꿉니다. 그래서 Vue 공식 문서도 **`ref`를 기본으로** 쓰라고 권합니다.
- **`computed`** 는 반환값에서 타입이 추론됩니다. `computed<number>(...)`처럼 적으면 계산 함수가 다른 타입을 돌려줄 때 오류가 납니다.
- `v-model.number`는 입력값을 숫자로 바꿔 줍니다. 단, 숫자로 바꿀 수 없는 글자를 입력하면 문자열이 그대로 들어올 수 있으므로 제출할 때 한 번 더 검사하는 것이 안전합니다.
- `v-for`에는 React의 `key`처럼 `:key`를 줍니다.

### 6단계: 템플릿 ref — useTemplateRef (Vue 3.5+)

DOM 요소를 직접 다뤄야 할 때(입력창 포커스 등)는 **템플릿 ref**를 씁니다. Vue **3.5부터**는 `useTemplateRef`를 씁니다.

```vue
<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue'

const searchInput = useTemplateRef<HTMLInputElement>('search')

onMounted(() => {
  // 화면에 붙은 뒤에 실행. 그래도 타입은 HTMLInputElement | null
  searchInput.value?.focus()
})
</script>

<template>
  <input ref="search" placeholder="메뉴 검색" />
</template>
```

- 템플릿의 `ref="search"`와 `useTemplateRef('search')`의 **문자열이 같아야** 연결됩니다.
- `onMounted`는 "컴포넌트가 화면에 붙은 직후" 실행되는 함수를 등록합니다(React의 `useEffect(..., [])`와 비슷).
- `.value`의 타입은 `HTMLInputElement | null`이므로 `?.`로 접근합니다.
- Vue 3.4 이하에서는 `const search = ref<HTMLInputElement | null>(null)`을 만들고 템플릿에 `ref="search"`라고 변수 이름을 맞춰 씁니다.

### 7단계: Pinia 스토어의 타입

여러 컴포넌트가 함께 쓰는 상태(장바구니, 로그인 회원)는 **스토어**(store, 앱 전체가 공유하는 상태 보관소)에 둡니다. Vue의 공식 상태 관리 라이브러리는 **Pinia**입니다. 앱 시작 파일에서 한 번 연결합니다.

```ts
// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

createApp(App).use(createPinia()).mount('#app')
```

스토어는 `defineStore`로 만듭니다. 컴포넌트의 `<script setup>`과 같은 방식으로 쓰는 **setup 스토어**를 권합니다. `ref`가 state, `computed`가 getter(계산 값), 함수가 action(상태를 바꾸는 동작)이 되고, **타입은 모두 자동으로 추론**됩니다.

```ts
// src/stores/cart.ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Product } from '../types'

export interface CartItem {
  productId: number
  name: string
  price: number
  quantity: number
}

export const useCartStore = defineStore('cart', () => {
  // state
  const items = ref<CartItem[]>([])

  // getters
  const totalQuantity = computed(() => items.value.reduce((sum, i) => sum + i.quantity, 0))
  const totalPrice = computed(() => items.value.reduce((sum, i) => sum + i.price * i.quantity, 0))

  // actions
  function addItem(product: Product, quantity = 1) {
    const existing = items.value.find((i) => i.productId === product.id)
    if (existing) {
      existing.quantity += quantity
      return
    }
    items.value.push({ productId: product.id, name: product.name, price: product.price, quantity })
  }

  function removeItem(productId: number) {
    items.value = items.value.filter((i) => i.productId !== productId)
  }

  function clear() {
    items.value = []
  }

  // 반환한 것만 바깥에서 쓸 수 있습니다.
  return { items, totalQuantity, totalPrice, addItem, removeItem, clear }
})
```

- `defineStore`의 첫 인자 `'cart'`는 스토어의 고유 이름입니다.
- state는 **반드시 반환**해야 Pinia가 상태로 인식합니다(개발자 도구, SSR 등).
- `cart.addItem('아메리카노')`처럼 잘못 부르면 `Argument of type 'string' is not assignable to parameter of type 'Product'. (TS2345)` 오류가 납니다.

컴포넌트에서 씁니다.

```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCartStore } from '../stores/cart'

const cart = useCartStore()
// state·getter는 storeToRefs로 꺼내야 반응성이 유지됩니다.
const { items, totalPrice } = storeToRefs(cart)
// action(함수)은 그냥 꺼내도 됩니다.
const { removeItem } = cart
</script>

<template>
  <ul>
    <li v-for="item in items" :key="item.productId">
      {{ item.name }} x{{ item.quantity }}
      <button @click="removeItem(item.productId)">삭제</button>
    </li>
  </ul>
  <p>합계 {{ totalPrice.toLocaleString('ko-KR') }}원</p>
</template>
```

왜 `storeToRefs`가 필요할까요? 스토어를 그냥 구조 분해하면 **그 순간의 값이 복사**됩니다. 타입 검사로는 잡히지 않는 실수라서 꼭 기억해야 합니다. 실제로 실행해 보면 차이가 드러납니다.

```ts
const cart = useCartStore()
cart.addItem({ id: 1, name: '아메리카노', price: 4500, soldOut: false }, 2)
cart.addItem({ id: 2, name: '카페라테', price: 5000, soldOut: false })
cart.addItem({ id: 1, name: '아메리카노', price: 4500, soldOut: false })
console.log(cart.totalQuantity, cart.totalPrice)
// 출력: 4 18500

const { totalPrice } = cart // ❌ 구조 분해: 값 복사
cart.removeItem(2)
console.log(totalPrice, cart.totalPrice)
// 출력: 18500 13500   ← 구조 분해한 값은 그대로 멈춰 있음
```

::: info 옵션 스토어
`defineStore('cart', { state: () => ({...}), getters: {...}, actions: {...} })`처럼 객체로 쓰는 **옵션 스토어**도 있습니다. 이때 state의 타입은 처음 값에서 추론되므로 `items: [] as CartItem[]`, `couponCode: null as string | null`처럼 단언으로 타입을 알려 주는 경우가 많습니다. setup 스토어는 `ref<CartItem[]>([])`처럼 제네릭을 쓸 수 있어 단언이 필요 없습니다.
:::

### 8단계: React와 비교해 보기

| 개념 | React + TS | Vue + TS |
|---|---|---|
| props 타입 | 함수 매개변수에 `Props` 타입 | `defineProps` 제네릭 |
| 선택 props 기본값 | 구조 분해 기본값 | `withDefaults` 또는 3.5+ 구조 분해 기본값 |
| 자식 → 부모 알림 | 함수 props(`onAdd`) | `defineEmits` 이벤트 |
| 상태 | `useState`(set 함수로 교체) | `ref`·`reactive`(직접 변경) |
| 계산 값 | 렌더링 중 계산 또는 `useMemo` | `computed` |
| DOM 참조 | `useRef` | `useTemplateRef` |
| 공유 상태 | Context, zustand | Pinia |
| 타입 검사 도구 | `tsc` | `vue-tsc` |

두 프레임워크 모두 핵심은 같습니다. **바깥에서 들어오는 것(props), 바깥으로 내보내는 것(이벤트), 내부 상태**에 타입을 붙이면 나머지는 대부분 추론됩니다.

## 자주 하는 실수

### 실수 1: ref(null)로 시작하기

```ts
const selected = ref(null)
selected.value = americano
// ❌ Type 'Product' is not assignable to type 'null'. (TS2322)
```

왜 틀렸나: 처음 값 `null`만 보고 `Ref<null>`로 추론되었습니다.

고친 코드:

```ts
const selected = ref<Product | null>(null)
selected.value = americano // ✅
```

### 실수 2: 스토어를 그냥 구조 분해하기

```ts
const cart = useCartStore()
const { items, totalPrice } = cart // 반응성 끊김
```

왜 틀렸나: 타입은 맞지만 구조 분해 순간의 값이 복사되어, 장바구니가 바뀌어도 화면의 합계가 멈춰 있습니다.

고친 코드: state·getter는 `storeToRefs`, action은 그대로 꺼냅니다.

```ts
const cart = useCartStore()
const { items, totalPrice } = storeToRefs(cart)
const { addItem, removeItem } = cart
```

### 실수 3: 스크립트에서 .value를 빠뜨리기

```ts
const keyword = ref('')
const trimmed = computed(() => keyword.trim())
// ❌ Property 'trim' does not exist on type 'Ref<string, string>'. (TS2339)
```

왜 틀렸나: 템플릿에서는 `.value`가 자동으로 풀리지만, **스크립트에서는** `ref` 상자를 직접 다루므로 `.value`가 필요합니다. TypeScript가 이 실수를 바로 잡아 줍니다.

고친 코드:

```ts
const trimmed = computed(() => keyword.value.trim())
```

### 실수 4: tsc로 Vue 프로젝트를 검사하기

```bash
npx tsc --noEmit
# .vue 파일 안의 오류를 하나도 찾지 못함
```

왜 틀렸나: `tsc`는 `.vue` 파일을 이해하지 못합니다. 템플릿의 오타(`product.nmae`)도, props 누락도 놓칩니다.

고친 코드:

```bash
npx vue-tsc --noEmit
```

```text
src/components/MenuPage.vue: error TS2339: Property 'nmae' does not exist on type 'Product'.
```

### 실수 5: Vue 3.4 이하에서 props를 구조 분해하기

```ts
// Vue 3.4 이하
const { product } = defineProps<{ product: Product }>()
const priceText = computed(() => `${product.price}원`) // 부모가 product를 바꿔도 그대로
```

왜 틀렸나: 반응형 props 구조 분해는 **Vue 3.5부터**입니다. 그 이전 버전에서는 구조 분해 순간의 값으로 고정됩니다.

고친 코드: 프로젝트의 Vue 버전을 확인(`npm ls vue`)하고, 3.4 이하라면 `props.`으로 접근합니다.

```ts
const props = defineProps<{ product: Product }>()
const priceText = computed(() => `${props.product.price}원`)
```

## 직접 해 보기

### 문제 1 ⭐ 회원 배지 props

`MemberBadge.vue`를 만드세요. props는 `name`(필수), `grade`(`'VIP' | 'GOLD' | '일반'`, 선택, 기본 `'일반'`), `point`(선택, 기본 0)입니다. `withDefaults`를 쓰세요.

::: details 정답 보기
```vue
<script setup lang="ts">
type Grade = 'VIP' | 'GOLD' | '일반'

const props = withDefaults(defineProps<{ name: string; grade?: Grade; point?: number }>(), {
  grade: '일반',
  point: 0,
})
</script>

<template>
  <span>{{ props.name }} ({{ props.grade }}) {{ props.point.toLocaleString('ko-KR') }}P</span>
</template>
```

`point`에 기본값이 있으므로 `props.point`의 타입은 `number`이고 `toLocaleString`을 바로 부를 수 있습니다. Vue 3.5 이상이라면 `const { name, grade = '일반', point = 0 } = defineProps<...>()`로도 됩니다.
:::

### 문제 2 ⭐ ref 타입 고치기

다음 코드의 오류를 모두 고치세요.

```ts
const memberName = ref(null)
memberName.value = '김민지'

const cartIds = ref([])
cartIds.value.push(101)
```

::: details 정답 보기
```ts
const memberName = ref<string | null>(null)
memberName.value = '김민지'

const cartIds = ref<number[]>([])
cartIds.value.push(101)
```

`ref(null)`은 `Ref<null>`, `ref([])`는 `Ref<never[]>`로 추론되어 값을 넣을 수 없습니다. React의 `useState`와 같은 규칙입니다.
:::

### 문제 3 ⭐⭐ 수량 조절 컴포넌트와 이벤트

`QuantityStepper.vue`를 만드세요. props는 `value`, `min`(기본 1), `max`(기본 99)이고, 버튼을 누르면 `change` 이벤트로 새 수량을 보냅니다. 범위를 벗어나면 보내지 않습니다. 부모에서 `@change`로 받아 사용하세요.

::: details 정답 보기
```vue
<script setup lang="ts">
const props = withDefaults(defineProps<{ value: number; min?: number; max?: number }>(), {
  min: 1,
  max: 99,
})

const emit = defineEmits<{
  change: [next: number]
}>()

function step(diff: number) {
  const next = props.value + diff
  if (next < props.min || next > props.max) return
  emit('change', next)
}
</script>

<template>
  <div>
    <button type="button" :disabled="value <= min" @click="step(-1)">-</button>
    <span>{{ value }}</span>
    <button type="button" :disabled="value >= max" @click="step(1)">+</button>
  </div>
</template>
```

부모:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import QuantityStepper from './QuantityStepper.vue'

const qty = ref(1)
</script>

<template>
  <QuantityStepper :value="qty" @change="(n) => (qty = n)" />
</template>
```

`n`은 `number`로 추론됩니다. 같은 기능을 Vue 3.4+의 `defineModel<number>({ required: true })`로 만들면 부모에서 `v-model="qty"` 한 줄로 연결할 수 있습니다.
:::

### 문제 4 ⭐⭐ 회원 스토어

setup 방식의 `useMemberStore`를 만드세요.

- state: `member`(`Member | null`, 처음 `null`)
- getter: `isLoggedIn`(boolean), `displayName`(로그인했으면 "이름님", 아니면 "손님")
- action: `login(next: Member)`, `logout()`

컴포넌트에서 `storeToRefs`로 꺼내 쓰세요.

::: details 정답 보기
```ts
// src/stores/member.ts
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export interface Member {
  id: number
  name: string
  grade: 'VIP' | 'GOLD' | '일반'
}

export const useMemberStore = defineStore('member', () => {
  const member = ref<Member | null>(null)
  const isLoggedIn = computed(() => member.value !== null)
  const displayName = computed(() => (member.value ? `${member.value.name}님` : '손님'))

  function login(next: Member) {
    member.value = next
  }
  function logout() {
    member.value = null
  }

  return { member, isLoggedIn, displayName, login, logout }
})
```

```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useMemberStore } from '../stores/member'

const memberStore = useMemberStore()
const { displayName, isLoggedIn } = storeToRefs(memberStore)
const { login, logout } = memberStore
</script>

<template>
  <p>{{ displayName }}</p>
  <button v-if="isLoggedIn" @click="logout">로그아웃</button>
  <button v-else @click="login({ id: 1, name: '김민지', grade: 'VIP' })">로그인</button>
</template>
```

실제 서비스에서는 로그인 정보를 서버에서 받아오므로 `login`은 API를 호출하는 async action이 됩니다([06 API 클라이언트](./06-api-client)).
:::

### 문제 5 ⭐⭐⭐ 검색 화면 완성하기

다음 조건을 만족하는 `MenuSearch.vue`를 만드세요.

- 화면이 열리면 검색창에 포커스(`useTemplateRef`)
- `keyword`(ref)로 상품 목록을 거른 `filtered`(computed)
- 걸러진 상품의 가격 합계 `filteredTotal`(computed, 타입을 `number`로 명시)
- 결과가 없으면 "검색 결과가 없습니다." 표시
- 상품을 누르면 `useCartStore().addItem` 호출

::: details 정답 보기
```vue
<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef } from 'vue'
import { useCartStore } from '../stores/cart'
import type { Product } from '../types'

const products = ref<Product[]>([
  { id: 1, name: '아메리카노', price: 4500, soldOut: false },
  { id: 2, name: '카페라테', price: 5000, soldOut: false },
  { id: 3, name: '바닐라라테', price: 5500, soldOut: true },
])

const keyword = ref('')
const searchInput = useTemplateRef<HTMLInputElement>('search')
const cart = useCartStore()

const filtered = computed(() => products.value.filter((p) => p.name.includes(keyword.value.trim())))
const filteredTotal = computed<number>(() => filtered.value.reduce((sum, p) => sum + p.price, 0))

onMounted(() => {
  searchInput.value?.focus()
})
</script>

<template>
  <input ref="search" v-model="keyword" placeholder="메뉴 검색" />
  <ul v-if="filtered.length > 0">
    <li v-for="p in filtered" :key="p.id">
      <button :disabled="p.soldOut" @click="cart.addItem(p)">{{ p.name }}</button>
    </li>
  </ul>
  <p v-else>검색 결과가 없습니다.</p>
  <p>검색 결과 합계 {{ filteredTotal.toLocaleString('ko-KR') }}원</p>
</template>
```

`cart.addItem(p)`처럼 스토어 객체에서 바로 action을 부르는 것은 괜찮습니다. 반응성 문제는 **state·getter를 구조 분해할 때만** 생깁니다.
:::

## 확인 퀴즈

1. `<script setup lang="ts">`에서 `lang="ts"`와 `setup`은 각각 무슨 뜻인가요?
2. `withDefaults`를 쓰면 선택 props의 타입이 어떻게 달라지나요?
3. `defineEmits`의 `add: [productId: number, quantity: number]`는 무엇을 뜻하나요?
4. 스토어의 state·getter를 꺼낼 때 `storeToRefs`를 쓰는 이유는 무엇인가요?
5. Vue 프로젝트의 타입 검사를 `tsc` 대신 `vue-tsc`로 하는 이유는 무엇인가요?

::: details 정답 보기
1. `lang="ts"`는 스크립트를 TypeScript로 쓴다는 뜻이고, `setup`은 선언한 변수·함수를 템플릿에서 바로 쓰게 해 주는 문법이라는 뜻입니다.
2. 기본값이 있는 속성은 `undefined`가 빠진 타입이 됩니다(예: `string | undefined` → `string`).
3. `add` 이벤트를 낼 때 `productId`(number)와 `quantity`(number) 두 값을 함께 보낸다는 뜻입니다(이름 붙은 튜플).
4. 그냥 구조 분해하면 그 순간의 값이 복사되어 반응성이 끊기기 때문입니다.
5. `tsc`는 `.vue` 파일을 읽지 못하고, `vue-tsc`는 템플릿 안의 표현식까지 검사하기 때문입니다.
:::

## 정리

- `.vue` 파일은 스크립트·템플릿·스타일을 한 곳에 둔 컴포넌트이고, `<script setup lang="ts">`로 TypeScript를 씁니다.
- props는 `defineProps<{...}>()` 타입 기반 선언, 기본값은 `withDefaults`(또는 Vue 3.5+의 구조 분해 기본값)로 줍니다. 이벤트는 `defineEmits`에 이름 붙은 튜플로 선언합니다.
- `ref`·`reactive`·`computed`는 대개 추론에 맡기고, `null`·빈 배열로 시작하는 `ref`는 제네릭을 적습니다. 스크립트에서는 `.value`를 씁니다.
- DOM 요소는 Vue 3.5+의 `useTemplateRef<HTMLInputElement>('이름')`으로 가져옵니다.
- Pinia setup 스토어는 타입이 자동 추론되고, state·getter는 `storeToRefs`로 꺼냅니다.
- 타입 검사는 `vue-tsc --noEmit`으로 합니다.

## 다음 단계

[상태 관리 zustand를 타입 안전하게](./05-zustand) — React에서 많이 쓰는 가벼운 스토어 zustand로 장바구니 스토어를 만들며, 셀렉터·미들웨어의 타입을 배웁니다.
