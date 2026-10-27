---
title: "React + TS: 컴포넌트 · props · state · 이벤트"
---

# React + TS: 컴포넌트 · props · state · 이벤트

<LessonMeta level="실전" :minutes="90" prev="Express REST API에 Request·Response 타입을 붙이고 경계에서 검증하기" />

## 이번에 배울 것

- React의 최소 개념(컴포넌트, JSX, props, state, 렌더링)을 설명할 수 있다.
- `npm create vite@latest`로 React + TypeScript 프로젝트를 만들고 구조를 읽을 수 있다.
- props에 타입을 붙이고 `children: ReactNode`, 선택 props, 기본값을 쓸 수 있다.
- `useState`의 제네릭으로 `null`이 섞인 상태, 빈 배열 상태, 유니온 상태를 정확히 표현할 수 있다.
- `ChangeEvent`·`SubmitEvent`·`MouseEvent` 같은 이벤트 타입을 붙이고, 목록 렌더링(`key`)과 폼을 타입 안전하게 만들 수 있다.

## 먼저 알아 둘 것

- [객체 타입: 선택 속성 · readonly · 인덱스 시그니처](../part2-types/04-object-types)
- [유니온 타입과 리터럴 타입](../part2-types/06-union-literal)
- [제네릭 기초](../part3-intermediate/04-generics-basics), [내장 유틸리티 타입](../part3-intermediate/07-utility-types)
- [빌드 도구: tsc · Vite · tsup · tsx](../part6-tooling/06-build-tools)
- HTML 태그(`div`, `input`, `button`, `form`)를 한 번쯤 본 적이 있으면 충분합니다. React를 몰라도 괜찮습니다.

::: info 이 레슨의 버전 (작성 시점 2026-10 기준)
create-vite 9.3, Vite 8.3, React 19.3, @types/react 19.3에서 예제를 `tsc --noEmit`(TypeScript 5.6.3, strict)으로 검사했습니다. 템플릿이 설치하는 TypeScript는 6.0 계열입니다. 버전이 다르면 일부 타입 이름(특히 폼 이벤트)이 다를 수 있으니 본문의 버전 안내를 함께 보세요.
:::

## 비유로 이해하기

React 화면은 **레고 조립**과 비슷합니다.

- **컴포넌트**(component)는 레고 블록입니다. "상품 카드", "검색창", "장바구니 버튼"처럼 화면 조각 하나를 만드는 함수입니다.
- **props**는 블록을 끼울 때 **바깥에서 정해 주는 설정**입니다. 같은 "상품 카드" 블록에 이름·가격을 다르게 넣으면 아메리카노 카드도, 카페라테 카드도 됩니다.
- **state**(상태)는 블록이 **스스로 기억하는 값**입니다. 검색창은 "지금 입력된 글자"를, 수량 버튼은 "지금 수량"을 기억합니다.
- state가 바뀌면 React는 그 블록을 **다시 그립니다**(렌더링).

TypeScript는 블록마다 **"끼울 수 있는 설정 목록표"** 를 붙여 줍니다. 상품 카드에 가격을 빼먹거나, 가격 자리에 글자를 넣으면 조립하기 전에 알려 줍니다.

## 개념 설명

### 1단계: React 최소 개념 — 컴포넌트, JSX, 렌더링

React 컴포넌트는 **화면 모양을 돌려주는 함수**입니다.

```tsx
function Greeting() {
  return <h1>어서 오세요, 강남점입니다</h1>
}
```

`return` 뒤의 `<h1>...</h1>`은 HTML처럼 보이지만 **JSX**라는 문법입니다. JavaScript 안에 화면 모양을 쓰게 해 주는 확장 문법이고, 빌드할 때 일반 함수 호출로 바뀝니다. JSX 규칙 몇 가지만 알아 두면 됩니다.

- 컴포넌트 이름은 **대문자로 시작**합니다(`Greeting`). 소문자는 HTML 태그(`div`)로 취급됩니다.
- 중괄호 `{ }` 안에 JavaScript 값을 넣습니다. 예: `<p>{price}원</p>`
- HTML의 `class`는 `className`으로 씁니다.
- 반드시 **바깥 태그 하나**로 감쌉니다. 감쌀 태그가 없으면 빈 태그 `<>...</>`(Fragment)를 씁니다.

컴포넌트는 다른 컴포넌트 안에서 태그처럼 씁니다.

```tsx
function App() {
  return (
    <main>
      <Greeting />
      <Greeting />
    </main>
  )
}
```

**렌더링**(rendering)은 React가 컴포넌트 함수를 실행해 화면을 만드는 일입니다. 처음 한 번, 그리고 **state나 props가 바뀔 때마다 다시** 실행합니다. "값이 바뀌면 함수가 다시 실행되어 새 화면을 돌려준다"는 사실이 React의 전부라고 해도 될 만큼 중요합니다.

### 2단계: 프로젝트 만들기

```bash
npm create vite@latest my-shop -- --template react-ts
cd my-shop
npm install
npm run dev
```

- `npm create vite@latest`는 Vite의 프로젝트 생성 도구(create-vite)를 실행합니다. `--template react-ts`는 "React + TypeScript 템플릿"이라는 뜻입니다. 중간의 `--`는 뒤의 옵션을 npm이 아니라 create-vite에 넘기라는 표시입니다.
- `npm run dev`를 실행하면 `http://localhost:5173` 같은 주소가 나오고, 브라우저로 열면 예제 화면이 보입니다.

만들어진 주요 파일은 다음과 같습니다.

```text
my-shop/
├─ index.html            ← 브라우저가 처음 여는 HTML. <div id="root">가 있음
├─ package.json
├─ tsconfig.json         ← 아래 두 설정 파일을 묶는 상위 설정
├─ tsconfig.app.json     ← src/(브라우저 코드)용 설정
├─ tsconfig.node.json    ← vite.config.ts(Node에서 실행)용 설정
├─ vite.config.ts
└─ src/
   ├─ main.tsx           ← 시작점: App을 #root에 그림
   └─ App.tsx            ← 첫 컴포넌트
```

`src/main.tsx`는 다음과 같습니다.

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

`document.getElementById('root')`의 타입은 `HTMLElement | null`입니다. `index.html`에 `root`가 반드시 있다는 것을 개발자가 알고 있으므로 `!`([non-null 단언](../part2-types/10-assertion))를 붙였습니다. 템플릿이 쓰는 몇 안 되는 정당한 단언입니다.

::: warning 개발 서버는 타입 검사를 하지 않습니다
`npm run dev`(Vite 개발 서버)는 속도를 위해 **타입을 지우기만 하고 검사하지 않습니다.** 타입 오류가 있어도 화면은 뜹니다. 타입 오류는 VS Code의 빨간 줄로 보거나, `npm run build`(내부에서 `tsc -b`를 먼저 실행)로 확인하세요.
:::

::: info 템플릿의 tsconfig와 strict
작성 시점의 템플릿은 TypeScript 6.0을 설치하고, `tsconfig.app.json`에 `strict` 줄이 없습니다. **TypeScript 6.0부터 `strict`가 기본으로 켜지기** 때문입니다(직접 확인). TypeScript 5.x를 쓰는 기존 프로젝트라면 `"strict": true`가 있는지 꼭 확인하세요. `jsx: "react-jsx"` 설정이 `.tsx`의 JSX를 처리합니다.
:::

### 3단계: .tsx 파일

JSX가 들어간 TypeScript 파일은 확장자가 **`.tsx`** 입니다. `.ts` 파일에 JSX를 쓰면 문법 오류가 납니다. `.tsx`에서는 꺾쇠가 JSX 태그와 헷갈리기 때문에 두 가지가 다릅니다.

- 옛날식 타입 단언 `<Product>value`는 쓸 수 없고 `value as Product`만 씁니다.
- 화살표 함수에 제네릭을 붙일 때 `<T,>(item: T) => ...`처럼 쉼표를 넣어야 합니다(또는 `function` 선언을 씁니다).

### 4단계: props에 타입 붙이기

props(properties의 줄임말)는 **부모 컴포넌트가 자식에게 넘기는 값**입니다. 함수의 매개변수와 같습니다. 그래서 타입도 매개변수처럼 붙입니다.

```tsx
type ProductCardProps = {
  name: string
  price: number
  soldOut?: boolean // 선택 props: 안 넘겨도 됨
  badge?: string
  onAdd: (name: string) => void // 함수 props: 버튼을 누르면 부모에게 알림
}

export function ProductCard({ name, price, soldOut = false, badge = '신상품', onAdd }: ProductCardProps) {
  return (
    <div className="product-card">
      <span>{badge}</span>
      <h3>{name}</h3>
      <p>{price.toLocaleString('ko-KR')}원</p>
      <button disabled={soldOut} onClick={() => onAdd(name)}>
        {soldOut ? '품절' : '담기'}
      </button>
    </div>
  )
}
```

해설:

- 컴포넌트는 props를 **객체 하나**로 받습니다. 그래서 `{ name, price, ... }: ProductCardProps`처럼 [구조 분해](../part1-basics/08-objects)하고 객체 타입을 붙입니다.
- `soldOut?: boolean`은 [선택 속성](../part2-types/04-object-types)입니다. 넘기지 않으면 `undefined`입니다.
- `soldOut = false`처럼 구조 분해에 **기본값**을 주면, 함수 안에서 `soldOut`의 타입은 `boolean`이 됩니다(`undefined`가 빠짐).
- `onAdd`처럼 **함수를 props로** 넘기는 것이 자식이 부모에게 "버튼이 눌렸어요" 하고 알리는 방법입니다. 이름은 관례상 `on`으로 시작합니다.

사용하는 쪽입니다.

```tsx
<ProductCard name="아메리카노" price={4500} onAdd={(n) => console.log(n)} />
<ProductCard name="카페라테" price={5000} soldOut onAdd={(n) => console.log(n)} />
```

- 문자열은 `name="..."`, 그 밖의 값은 `price={4500}`처럼 중괄호로 넘깁니다.
- `soldOut`만 쓰면 `soldOut={true}`와 같습니다.
- `onAdd={(n) => ...}`의 `n`은 `ProductCardProps`를 보고 `string`으로 추론됩니다.

props를 잘못 넘기면 바로 오류가 납니다.

```tsx
<ProductCard name="아메리카노" onAdd={() => {}} />
// ❌ Property 'price' is missing in type '{ name: string; onAdd: () => void; }' but required in type 'ProductCardProps'. (TS2741)

<ProductCard name="아메리카노" price="4500" onAdd={() => {}} />
// ❌ Type 'string' is not assignable to type 'number'. (TS2322)
```

::: tip type과 interface 중 무엇으로?
props 타입은 `type`과 `interface` 둘 다 됩니다([type과 interface](../part2-types/07-type-alias-interface)). 팀 규칙을 따르면 되고, 이 위키에서는 `type 컴포넌트이름Props`로 통일합니다.
:::

### 5단계: children — 태그 사이에 넣는 내용

컴포넌트 태그 **사이에** 넣은 내용은 `children`이라는 특별한 prop으로 들어옵니다. 타입은 **`ReactNode`** 를 씁니다. `ReactNode`는 "화면에 그릴 수 있는 모든 것"(JSX, 문자열, 숫자, `null`, 배열 등)의 유니온입니다.

```tsx
import type { ReactNode } from 'react'

type PanelProps = {
  title: string
  children: ReactNode
}

export function Panel({ title, children }: PanelProps) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  )
}

export function App() {
  return (
    <Panel title="오늘의 메뉴">
      <ProductCard name="아메리카노" price={4500} onAdd={(n) => console.log(n)} />
      <ProductCard name="카페라테" price={5000} soldOut onAdd={(n) => console.log(n)} />
    </Panel>
  )
}
```

props 타입에 `children`을 적지 않았는데 태그 사이에 내용을 넣으면 오류가 납니다.

```tsx
type PanelProps = { title: string } // children이 없음

<Panel title="메뉴"><p>내용</p></Panel>
// ❌ Type '{ children: Element; title: string; }' is not assignable to type 'IntrinsicAttributes & PanelProps'.
//      Property 'children' does not exist on type 'IntrinsicAttributes & PanelProps'. (TS2322)
```

`import type`은 [타입 전용 import](../part3-intermediate/09-modules)입니다. 템플릿은 `verbatimModuleSyntax`가 켜져 있어서 타입만 가져올 때 `type`을 붙여야 합니다.

### 6단계: useState — 기억하는 값

**훅**(hook)은 컴포넌트에 기능을 "걸어 주는" `use`로 시작하는 함수입니다. 가장 기본이 `useState`입니다.

```tsx
import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0) // count: number
  return <button onClick={() => setCount((prev) => prev + 1)}>{count}</button>
}
```

- `useState(0)`은 `[현재 값, 값을 바꾸는 함수]` 두 칸짜리 배열([튜플](../part2-types/03-arrays-tuples))을 돌려줍니다.
- 처음 값 `0`을 보고 `count`는 `number`로 추론됩니다. 대부분은 이렇게 **추론에 맡깁니다.**
- `setCount`로 값을 바꾸면 React가 컴포넌트를 다시 렌더링합니다. `count = 1`처럼 직접 바꾸면 화면이 바뀌지 않습니다.
- `setCount((prev) => prev + 1)`처럼 **함수를 넘기면** 직전 값을 받아 새 값을 계산합니다. 이전 값에 기대는 변경은 이 방식이 안전합니다.

추론만으로 부족한 경우가 세 가지 있습니다. 이때 **제네릭으로 타입을 직접** 적습니다.

**① 처음엔 비어 있다가 나중에 값이 들어오는 상태**

```tsx
interface Product {
  id: number
  name: string
  price: number
}

const [product, setProduct] = useState<Product | null>(null)
```

`useState(null)`이라고만 쓰면 타입이 `null`로 고정되어 다른 값을 넣을 수 없습니다.

```tsx
const [product, setProduct] = useState(null)
setProduct({ id: 1, name: '아메리카노', price: 4500 })
// ❌ Object literal may only specify known properties, and 'id' does not exist in type '(prevState: null) => null'. (TS2353)
```

메시지가 이상해 보이지만, "`null`만 받는 상태에 객체를 넣으려 했다"는 뜻입니다. `null`이 섞인 상태는 쓰기 전에 [좁혀야](../part2-types/08-narrowing) 합니다.

```tsx
if (product === null) {
  return <p>상품을 선택하세요</p>
}
return <p>{product.name}</p> // 여기서 product는 Product
```

**② 빈 배열로 시작하는 상태**

```tsx
const [items, setItems] = useState([])
setItems(['아메리카노'])
// ❌ Type 'string' is not assignable to type 'never'. (TS2322)

const [names, setNames] = useState<string[]>([]) // ✅ 무엇을 담을지 알려 줌
```

빈 배열 `[]`만 보고는 무엇을 담을지 알 수 없어 `never[]`("아무것도 못 담는 배열")가 됩니다.

**③ 정해진 값 중 하나만 갖는 상태(유니온 상태)**

```tsx
type Status = 'idle' | 'loading' | 'done' | 'error'
const [status, setStatus] = useState<Status>('idle')
```

`useState('idle')`이면 `string`으로 넓혀져 `setStatus('lodaing')` 같은 오타를 못 잡습니다. 유니온을 적으면 네 값 외에는 넣을 수 없습니다. 상태 여러 개를 하나의 판별 유니온으로 묶는 방법은 [07 타입 설계](./07-type-design)에서 다룹니다.

### 7단계: 이벤트 타입

React에서 클릭·입력 같은 **이벤트**(event, 사용자의 행동)는 `onClick`, `onChange`처럼 props로 처리 함수를 넘겨 다룹니다. 처리 함수는 **이벤트 객체** 하나를 받습니다.

**인라인으로 쓰면 타입이 추론됩니다.**

```tsx
<input value={name} onChange={(e) => setName(e.target.value)} />
// e: ChangeEvent<HTMLInputElement>로 추론됨
```

**함수를 따로 만들면 직접 적어야 합니다.** 적지 않으면 `Parameter 'e' implicitly has an 'any' type. (TS7006)` 오류가 납니다.

```tsx
import { useState, type ChangeEvent, type KeyboardEvent, type MouseEvent } from 'react'

export function SearchBox() {
  const [keyword, setKeyword] = useState('')

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setKeyword(e.target.value) // value: string
  }
  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') console.log('검색:', keyword)
  }
  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    console.log(e.currentTarget.textContent)
  }

  return (
    <div>
      <input value={keyword} onChange={handleChange} onKeyDown={handleKeyDown} />
      <button onClick={handleClick}>검색</button>
    </div>
  )
}
```

자주 쓰는 이벤트 타입을 정리하면 다음과 같습니다. 꺾쇠 안에는 **이벤트가 붙은 HTML 요소 타입**을 넣습니다.

| 상황 | props | 이벤트 타입 |
|---|---|---|
| 글자 입력, 체크박스, 선택 상자 | `onChange` | `ChangeEvent<HTMLInputElement>` (`HTMLSelectElement`, `HTMLTextAreaElement`) |
| 폼 제출 | `onSubmit` | `SubmitEvent<HTMLFormElement>` (예전 코드: `FormEvent<HTMLFormElement>`) |
| 클릭 | `onClick` | `MouseEvent<HTMLButtonElement>` |
| 키 입력 | `onKeyDown` | `KeyboardEvent<HTMLInputElement>` |
| 포커스 | `onFocus`, `onBlur` | `FocusEvent<HTMLInputElement>` |

::: tip 타입 이름이 기억나지 않을 때
인라인으로 `onChange={(e) => {}}`를 써 놓고 `e`에 마우스를 올리면 정확한 타입이 보입니다. 그 이름을 복사해서 쓰면 됩니다.
:::

::: warning FormEvent와 SubmitEvent
오랫동안 폼 제출에는 `FormEvent`를 썼고, 지금도 많은 코드와 자료에서 볼 수 있습니다. 작성 시점의 @types/react 19.3에서는 `FormEvent`에 **deprecated(사용 중단 예정)** 표시가 붙었고 `onSubmit`의 타입이 `SubmitEvent`로 바뀌었습니다. `FormEvent`도 아직 오류 없이 동작하지만, 새 코드에서는 `SubmitEvent`를 쓰세요. 이 이름은 브라우저의 전역 `SubmitEvent`와 같으므로 반드시 `react`에서 import합니다.
:::

`e.target`과 `e.currentTarget`의 차이도 알아 두세요. `currentTarget`은 **처리 함수를 붙인 요소**라서 타입이 정확합니다. `target`은 실제로 클릭된 가장 안쪽 요소일 수 있어서(버튼 안의 아이콘 등) 일반적으로 타입이 넓습니다. `ChangeEvent`는 폼 요소 전용이라 `target`도 그 요소 타입으로 맞춰 줍니다.

### 8단계: 목록 렌더링과 key

배열을 화면에 그릴 때는 `map`으로 JSX 배열을 만듭니다.

```tsx
interface Product {
  id: number
  name: string
  price: number
  category: 'coffee' | 'tea' | 'dessert'
}

type ProductListProps = {
  products: Product[]
  onSelect: (product: Product) => void
}

export function ProductList({ products, onSelect }: ProductListProps) {
  if (products.length === 0) {
    return <p>등록된 상품이 없습니다.</p>
  }
  return (
    <ul>
      {products.map((product) => (
        <li key={product.id} onClick={() => onSelect(product)}>
          {product.name} - {product.price.toLocaleString('ko-KR')}원
        </li>
      ))}
    </ul>
  )
}
```

`key`는 React가 목록의 각 항목을 **구별하는 이름표**입니다. 목록이 바뀌었을 때 "어느 항목이 추가·삭제·이동되었는지"를 key로 알아내서 필요한 부분만 다시 그립니다.

- key는 형제끼리 **겹치지 않고**, 렌더링할 때마다 **바뀌지 않는** 값이어야 합니다. DB의 id가 가장 좋습니다.
- `key`를 빠뜨려도 **타입 오류는 나지 않습니다.** 대신 브라우저 콘솔에 `Each child in a list should have a unique "key" prop.` 경고가 나옵니다.
- 배열 순서 번호(index)를 key로 쓰면, 항목이 중간에 추가·삭제될 때 입력값이 엉뚱한 줄로 옮겨 가는 버그가 생길 수 있습니다. 순서가 절대 바뀌지 않는 목록에만 씁니다.

### 9단계: 폼 처리 — 상품 등록 폼

입력창의 값을 state에 두고 `value`와 `onChange`로 연결하는 방식을 **제어 컴포넌트**(controlled component)라고 합니다. "입력창에 보이는 값 = state 값"이 항상 같게 유지됩니다.

```tsx
import { useState, type ChangeEvent, type SubmitEvent } from 'react'

type NewProduct = Omit<Product, 'id'>

type ProductFormProps = {
  onCreate: (product: NewProduct) => void
}

export function ProductForm({ onCreate }: ProductFormProps) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('') // 입력 중인 글자 그대로 보관
  const [category, setCategory] = useState<Product['category']>('coffee')
  const [error, setError] = useState<string | null>(null)

  function handleCategoryChange(e: ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value // 타입: string
    if (value === 'coffee' || value === 'tea' || value === 'dessert') {
      setCategory(value) // 비교로 좁혀졌으므로 단언 없이 넣을 수 있음
    }
  }

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault() // 브라우저 기본 동작(페이지 새로고침)을 막음
    const priceNumber = Number(price)
    if (name.trim() === '') {
      setError('상품명을 입력하세요.')
      return
    }
    if (price === '' || Number.isNaN(priceNumber) || priceNumber < 0) {
      setError('가격은 0 이상의 숫자로 입력하세요.')
      return
    }
    onCreate({ name: name.trim(), price: priceNumber, category })
    setName('')
    setPrice('')
    setError(null)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="상품명" />
      <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="가격" inputMode="numeric" />
      <select value={category} onChange={handleCategoryChange}>
        <option value="coffee">커피</option>
        <option value="tea">차</option>
        <option value="dessert">디저트</option>
      </select>
      <button type="submit">등록</button>
      {error && <p role="alert">{error}</p>}
    </form>
  )
}
```

해설:

- `Product['category']`는 [인덱스 접근 타입](../part3-intermediate/06-keyof-typeof-indexed)입니다. `Product`의 `category` 타입(`'coffee' | 'tea' | 'dessert'`)을 그대로 가져와, 두 곳에 같은 유니온을 다시 쓰지 않아도 됩니다.
- `e.target.value`는 **언제나 `string`** 입니다. `<select>`의 option 값도, `type="number"` 입력창의 값도 문자열입니다. 그래서 가격은 입력 중인 글자 그대로 `string` state에 두고, **제출할 때** 숫자로 바꾸어 검사합니다.
- `{error && <p>...</p>}`는 "error가 있을 때만 그린다"는 JSX 관용구입니다.

이제 부모에서 조립합니다.

```tsx
export function MenuPage() {
  const [products, setProducts] = useState<Product[]>([
    { id: 1, name: '아메리카노', price: 4500, category: 'coffee' },
    { id: 2, name: '얼그레이', price: 5000, category: 'tea' },
  ])
  const [selected, setSelected] = useState<Product | null>(null)

  function handleCreate(newProduct: NewProduct) {
    // 배열 state는 직접 push하지 않고 새 배열을 만들어 넣습니다.
    setProducts((prev) => [...prev, { id: Date.now(), ...newProduct }])
  }

  return (
    <main>
      <ProductForm onCreate={handleCreate} />
      <ProductList products={products} onSelect={setSelected} />
      {selected && <p>선택: {selected.name}</p>}
    </main>
  )
}
```

화면에서 "바닐라라테", "5500"을 입력하고 등록하면 목록 맨 아래에 `바닐라라테 - 5,500원`이 추가되고 입력창이 비워집니다. 목록의 항목을 누르면 `선택: 바닐라라테`가 나타납니다.

- `onSelect={setSelected}`처럼 set 함수를 그대로 넘겨도 됩니다. `setSelected`는 `Product`를 받을 수 있으므로 `(product: Product) => void` 자리에 들어갑니다.
- state 배열을 `prev.push(...)`로 고치면 React는 "같은 배열"이라고 보고 다시 그리지 않을 수 있습니다. 항상 **새 배열·새 객체**를 만들어 넣습니다.

### 10단계: React.FC를 권장하지 않는 이유

예전 자료에서는 컴포넌트를 이렇게 쓰는 것을 자주 봅니다.

```tsx
import type { FC } from 'react'

type BadgeProps = { label: string }

// FC(FunctionComponent) 타입을 변수에 붙이는 방식
export const BadgeFC: FC<BadgeProps> = ({ label }) => <span>{label}</span>

// 이 위키의 방식: 일반 함수 선언 + props 타입
export function Badge({ label }: BadgeProps) {
  return <span>{label}</span>
}
```

둘 다 동작하지만 이 위키(그리고 React·TypeScript 커뮤니티의 많은 가이드)는 아래 방식을 권합니다. 이유는 다음과 같습니다.

- **제네릭 컴포넌트를 만들 수 없습니다.** `const List: FC<...>`처럼 변수에 타입을 붙이면 타입 매개변수 `T`를 둘 자리가 없습니다. 함수 선언은 `function SelectList<T>(props: SelectListProps<T>)`처럼 바로 됩니다([다음 레슨](./03-react-hooks)에서 사용).
- **역사적으로 함정이 있었습니다.** React 18 이전의 `FC`는 `children`을 몰래 허용해서, children을 받지 않는 컴포넌트에도 내용을 넣을 수 있었습니다. 지금은 고쳐졌지만 옛 코드와 자료가 섞여 혼란스럽습니다.
- **얻는 것이 거의 없습니다.** 일반 함수도 반환 타입이 JSX로 추론되고, props 타입은 매개변수에 붙이면 충분합니다.

`FC`를 쓰는 기존 코드를 억지로 바꿀 필요는 없습니다. 새로 쓸 때 한 가지 방식으로 통일하면 됩니다.

## 자주 하는 실수

### 실수 1: useState(null)로 시작하기

```tsx
const [member, setMember] = useState(null)
setMember({ id: 1, name: '김민지' })
// ❌ Object literal may only specify known properties, and 'id' does not exist in type '(prevState: null) => null'. (TS2353)
```

왜 틀렸나: 처음 값 `null`만 보고 타입이 `null`로 고정되었습니다.

고친 코드: 앞으로 들어올 타입과 `null`의 유니온을 제네릭으로 적습니다.

```tsx
interface Member {
  id: number
  name: string
}
const [member, setMember] = useState<Member | null>(null)
setMember({ id: 1, name: '김민지' }) // ✅
```

### 실수 2: 입력값(문자열)을 숫자 state에 넣기

```tsx
const [price, setPrice] = useState(0)

<input onChange={(e) => setPrice(e.target.value)} />
// ❌ Argument of type 'string' is not assignable to parameter of type 'SetStateAction<number>'. (TS2345)
```

왜 틀렸나: `e.target.value`는 `type="number"`여도 항상 `string`입니다.

고친 코드: 입력 중에는 문자열로 두고 제출할 때 바꾸거나(9단계 방식), 숫자로 바꿀 때 검사합니다.

```tsx
const [priceText, setPriceText] = useState('')
<input value={priceText} onChange={(e) => setPriceText(e.target.value)} />
// 제출할 때: const price = Number(priceText) 후 Number.isNaN 검사
```

### 실수 3: children 타입을 빠뜨리기

```tsx
type ModalProps = { title: string }

function Modal({ title }: ModalProps) {
  return <div><h2>{title}</h2></div>
}

<Modal title="주문 확인"><p>결제하시겠습니까?</p></Modal>
// ❌ Property 'children' does not exist on type 'IntrinsicAttributes & ModalProps'. (TS2322)
```

왜 틀렸나: 태그 사이 내용은 `children` prop으로 전달되는데, props 타입에 없습니다.

고친 코드:

```tsx
type ModalProps = { title: string; children: ReactNode }

function Modal({ title, children }: ModalProps) {
  return <div><h2>{title}</h2>{children}</div>
}
```

### 실수 4: 이벤트 처리 함수 매개변수에 타입을 안 쓰기

```tsx
function handleChange(e) {
  // ❌ Parameter 'e' implicitly has an 'any' type. (TS7006)
  setKeyword(e.target.value)
}
```

왜 틀렸나: 따로 떨어진 함수는 어디에 붙을지 모르므로 추론할 단서가 없습니다.

고친 코드:

```tsx
function handleChange(e: ChangeEvent<HTMLInputElement>) {
  setKeyword(e.target.value)
}
```

### 실수 5: 배열 순서 번호를 key로 쓰기

```tsx
{cartItems.map((item, index) => (
  <li key={index}>
    {item.name} <input defaultValue={item.memo} />
  </li>
))}
```

왜 틀렸나: 타입 오류는 없지만, 맨 앞 항목을 삭제하면 모든 index가 하나씩 당겨집니다. React는 "key 0번이 그대로 있다"고 판단해 입력창 상태를 재사용하므로, **지운 항목의 메모가 다음 항목에 남아 보이는** 버그가 생깁니다.

고친 코드: 항목 고유의 값을 key로 씁니다.

```tsx
{cartItems.map((item) => (
  <li key={item.id}>
    {item.name} <input defaultValue={item.memo} />
  </li>
))}
```

## 직접 해 보기

### 문제 1 ⭐ props 타입 만들기

회원 카드 `MemberCard`를 만드세요. props는 `name`(문자열, 필수), `grade`(`'VIP' | 'GOLD' | '일반'`, 필수), `point`(숫자, 선택, 기본값 0)입니다. `grade="SILVER"`를 넘기면 오류가 나는지 확인하세요.

::: details 정답 보기
```tsx
type MemberCardProps = {
  name: string
  grade: 'VIP' | 'GOLD' | '일반'
  point?: number
}

export function MemberCard({ name, grade, point = 0 }: MemberCardProps) {
  return (
    <div>
      <strong>{name}</strong> ({grade}) 포인트 {point.toLocaleString('ko-KR')}P
    </div>
  )
}

<MemberCard name="김민지" grade="VIP" /> // ✅ 화면: 김민지 (VIP) 포인트 0P
<MemberCard name="김민지" grade="SILVER" />
// ❌ Type '"SILVER"' is not assignable to type '"VIP" | "GOLD" | "일반"'. (TS2322)
```
:::

### 문제 2 ⭐ 빈 배열 state 고치기

다음 코드의 오류를 고치세요.

```tsx
export function CartNames() {
  const [names, setNames] = useState([])
  return <button onClick={() => setNames([...names, '아메리카노'])}>{names.length}개</button>
}
```

::: details 정답 보기
`useState([])`는 `never[]`로 추론되어 `'아메리카노'`를 넣을 수 없습니다(`Type 'string' is not assignable to type 'never'`). 제네릭으로 담을 타입을 알려 줍니다.

```tsx
export function CartNames() {
  const [names, setNames] = useState<string[]>([])
  return <button onClick={() => setNames([...names, '아메리카노'])}>{names.length}개</button>
}
```
:::

### 문제 3 ⭐⭐ 수량 조절 컴포넌트

`QuantityStepper`를 만드세요. props는 `value`(현재 수량), `min`(선택, 기본 1), `max`(선택, 기본 99), `onChange(next: number)`입니다. `-` 버튼은 `min` 이하일 때, `+` 버튼은 `max` 이상일 때 비활성화합니다. 수량 state는 부모가 가집니다.

::: details 정답 보기
```tsx
type QuantityStepperProps = {
  value: number
  min?: number
  max?: number
  onChange: (next: number) => void
}

export function QuantityStepper({ value, min = 1, max = 99, onChange }: QuantityStepperProps) {
  return (
    <div>
      <button type="button" disabled={value <= min} onClick={() => onChange(value - 1)}>-</button>
      <span>{value}</span>
      <button type="button" disabled={value >= max} onClick={() => onChange(value + 1)}>+</button>
    </div>
  )
}

export function UseStepper() {
  const [qty, setQty] = useState(1)
  return <QuantityStepper value={qty} onChange={setQty} />
}
```

수량을 자식이 아니라 부모가 갖는 이유는, 장바구니 합계처럼 **다른 컴포넌트도 그 값이 필요하기** 때문입니다. 자식은 "바꿔 달라"고 `onChange`로 알리기만 합니다.
:::

### 문제 4 ⭐⭐ 메뉴 검색

입력창에 글자를 입력하면 메뉴 목록이 이름으로 걸러지는 `MenuSearch`를 만드세요. 이벤트 처리 함수는 따로 선언해 타입을 붙이고, 목록에는 알맞은 key를 주고, 결과가 없으면 "검색 결과가 없습니다."를 보여 줍니다.

::: details 정답 보기
```tsx
interface Product {
  id: number
  name: string
  price: number
}

const menu: Product[] = [
  { id: 1, name: '아메리카노', price: 4500 },
  { id: 2, name: '카페라테', price: 5000 },
  { id: 3, name: '바닐라라테', price: 5500 },
]

export function MenuSearch() {
  const [keyword, setKeyword] = useState('')

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setKeyword(e.target.value)
  }

  // 걸러진 목록은 state가 아니라 렌더링할 때마다 계산합니다.
  const filtered = menu.filter((p) => p.name.includes(keyword.trim()))

  return (
    <div>
      <input value={keyword} onChange={handleChange} placeholder="메뉴 검색" />
      <ul>
        {filtered.map((p) => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>
      {filtered.length === 0 && <p>검색 결과가 없습니다.</p>}
    </div>
  )
}
```

"라테"를 입력하면 카페라테·바닐라라테만 남습니다. `filtered`를 state로 따로 두지 않는 것이 핵심입니다. `keyword`와 `menu`에서 계산할 수 있는 값을 state로 또 두면, 둘이 어긋나는 버그가 생기기 쉽습니다.
:::

### 문제 5 ⭐⭐⭐ 회원 가입 폼

이름·휴대폰 번호·약관 동의(체크박스)를 받는 가입 폼을 만드세요.

- 폼 값은 `JoinForm` 객체 하나의 state로 관리합니다.
- 두 텍스트 입력은 `name` 속성을 이용해 **처리 함수 하나**로 처리합니다.
- 체크박스는 `e.target.checked`를 씁니다.
- 제출 시 이름 비어 있음, 번호 형식(`010-0000-0000`), 동의 여부를 검사해 오류 메시지를 보여 줍니다.

::: details 정답 보기
```tsx
type JoinForm = { name: string; phone: string; agree: boolean }

export function JoinPage({ onJoin }: { onJoin: (form: JoinForm) => void }) {
  const [form, setForm] = useState<JoinForm>({ name: '', phone: '', agree: false })
  const [error, setError] = useState<string | null>(null)

  function handleTextChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target // name: string
    // name을 'name' | 'phone'으로 좁혀야 JoinForm의 키로 쓸 수 있습니다.
    if (name === 'name' || name === 'phone') {
      setForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  function handleAgreeChange(e: ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, agree: e.target.checked }))
  }

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    if (form.name.trim() === '') {
      setError('이름을 입력하세요.')
      return
    }
    if (!/^010-\d{4}-\d{4}$/.test(form.phone)) {
      setError('휴대폰 번호는 010-0000-0000 형식으로 입력하세요.')
      return
    }
    if (!form.agree) {
      setError('약관에 동의해야 가입할 수 있습니다.')
      return
    }
    setError(null)
    onJoin(form)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" value={form.name} onChange={handleTextChange} />
      <input name="phone" value={form.phone} onChange={handleTextChange} />
      <label>
        <input type="checkbox" checked={form.agree} onChange={handleAgreeChange} /> 약관 동의
      </label>
      <button type="submit">가입</button>
      {error && <p role="alert">{error}</p>}
    </form>
  )
}
```

`[name]: value`는 계산된 속성 이름입니다. `name`을 좁히지 않고 쓰면 `JoinForm`에 없는 키가 들어갈 수 있어 의도와 다른 객체가 됩니다.
:::

## 확인 퀴즈

1. React가 컴포넌트를 다시 렌더링하는 대표적인 두 가지 계기는 무엇인가요?
2. `useState(null)`과 `useState<Product | null>(null)`은 어떻게 다른가요?
3. 태그 사이에 넣은 내용을 받으려면 props 타입에 무엇을 적어야 하나요?
4. `onChange={(e) => ...}`로 쓸 때와 `function handleChange(e) {...}`로 쓸 때 타입 표기가 다른 이유는 무엇인가요?
5. `key`를 빠뜨리면 타입 오류가 나나요?

::: details 정답 보기
1. state가 바뀔 때, 부모가 넘기는 props가 바뀔 때(부모가 다시 렌더링될 때)입니다.
2. 앞은 타입이 `null`로 고정되어 다른 값을 넣을 수 없고, 뒤는 `Product` 또는 `null`을 담을 수 있습니다.
3. `children: ReactNode`입니다.
4. 인라인 함수는 `onChange` 자리의 타입을 보고 문맥적으로 추론되지만, 따로 선언한 함수는 단서가 없어 직접 적어야 합니다.
5. 나지 않습니다. 실행 중 콘솔 경고가 나오고, 목록이 바뀔 때 버그가 생길 수 있습니다.
:::

## 정리

- 컴포넌트는 화면을 돌려주는 함수이고, state·props가 바뀌면 다시 실행(렌더링)됩니다. JSX가 있는 파일은 `.tsx`입니다.
- props 타입은 `type 이름Props`로 만들어 구조 분해 매개변수에 붙입니다. 선택 props는 `?`, 기본값은 구조 분해에서 줍니다. 태그 사이 내용은 `children: ReactNode`입니다.
- `useState`는 대개 추론에 맡기되, `null`로 시작·빈 배열·유니온 상태는 제네릭으로 적습니다.
- 인라인 이벤트 처리 함수는 추론되고, 따로 만든 함수는 `ChangeEvent`·`SubmitEvent`·`MouseEvent` 등에 요소 타입을 넣어 적습니다. `e.target.value`는 항상 문자열입니다.
- 목록에는 고유하고 변하지 않는 `key`를 주고, state 배열·객체는 새로 만들어 바꿉니다.
- `React.FC` 대신 일반 함수 선언 + props 타입을 씁니다. 제네릭 컴포넌트를 만들 수 있기 때문입니다.

## 다음 단계

[React + TS: 훅 · Context · 커스텀 훅](./03-react-hooks) — `useEffect`, `useRef`, `useReducer`, Context에 타입을 붙이고, 직접 훅과 제네릭 컴포넌트를 만들어 봅니다.
