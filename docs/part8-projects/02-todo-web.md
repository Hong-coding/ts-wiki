---
title: "프로젝트 2: Todo 웹앱 (Vite + 순수 TS + DOM)"
---

# 프로젝트 2: Todo 웹앱 (Vite + 순수 TS + DOM)

<LessonMeta level="실전" :minutes="240" prev="프로젝트 1에서 판별 유니온 명령과 JSON 저장으로 콘솔 가계부를 완성" />

두 번째 프로젝트는 브라우저에서 돌아가는 **할 일(Todo) 목록**입니다. React 같은 프레임워크 없이 TypeScript와 브라우저 기본 기능(DOM)만으로 만듭니다. 프레임워크가 대신 해 주던 일 — 요소 찾기, 이벤트 연결, 화면 다시 그리기 — 을 직접 해 보면, 프로젝트 4에서 React가 "왜 그렇게 생겼는지"가 보입니다.

**DOM**(Document Object Model)은 브라우저가 HTML을 읽어 만든 "요소 객체들의 나무"입니다. 자바스크립트는 이 객체를 찾아 글자를 바꾸거나 이벤트를 연결해서 화면을 움직입니다.

## 완성하면 이렇게 됩니다

`npm run dev`로 개발 서버를 띄우고 브라우저에서 `http://localhost:5173`을 엽니다.

```text
┌──────────────────────────────────────────────┐
│ 할 일 목록                                     │
│ ┌──────────────────────────────────┐ ┌────┐  │
│ │ 할 일을 입력하세요                  │ │추가│  │
│ └──────────────────────────────────┘ └────┘  │
│ [전체] [진행] [완료]          ← 선택된 필터는 파란색 │
│ ☑ ~~우유 사기~~                       [삭제]  │
│ ☐ 매장 재고 확인                        [삭제]  │
│ ☐ <b>주문서</b> 출력                    [삭제]  │
│ 남은 할 일 2개              [완료 항목 지우기] │
└──────────────────────────────────────────────┘
```

- 빈 칸으로 "추가"를 누르면 입력창 아래에 빨간 글씨로 `할 일을 입력해 주세요.`가 나옵니다.
- 체크박스를 누르면 줄이 그어지고, "완료" 필터를 누르면 완료한 일만 보입니다.
- `<b>주문서</b> 출력`처럼 HTML 태그를 입력해도 굵은 글씨가 되지 않고 **글자 그대로** 보입니다(보안상 중요합니다).
- 새로 고침해도 목록이 그대로 남아 있습니다(localStorage).

## 요구사항

1. **추가**: 입력창에 쓰고 Enter 또는 "추가" 버튼으로 할 일을 추가합니다. 앞뒤 공백은 지우고, 빈 값이나 100자를 넘는 값은 거부하고 이유를 보여 줍니다.
2. **완료 표시**: 체크박스로 완료/미완료를 바꿉니다. 완료한 일은 줄이 그어집니다.
3. **삭제**: 각 줄의 "삭제" 버튼으로 지웁니다. "완료 항목 지우기"로 완료한 일을 한꺼번에 지웁니다(완료한 일이 없으면 버튼 비활성).
4. **필터**: 전체 / 진행 / 완료 중 하나를 골라 보여 주고, 선택된 버튼을 표시합니다.
5. **남은 개수**: "남은 할 일 N개"를 보여 줍니다.
6. **저장**: 상태가 바뀔 때마다 localStorage에 저장하고, 시작할 때 불러옵니다. 저장된 값이 깨져 있어도 앱이 멈추지 않습니다.
7. **구조**: 상태 → 렌더 **단방향**으로 만듭니다. 이벤트는 상태를 바꾸는 요청만 보내고, 화면을 고치는 코드는 `render` 함수 하나에만 둡니다.
8. **이벤트 위임**: 할 일마다 리스너를 붙이지 않고 목록 요소 하나에서 클릭을 처리합니다.

## 필요한 지식

- 판별 유니온과 `never` 검사: [판별 유니온과 완전성 검사](../part3-intermediate/03-discriminated-union)
- `null` 좁히기와 `instanceof`: [타입 좁히기](../part2-types/08-narrowing)
- `!`와 `as`를 왜 피하는지: [타입 단언과 non-null 단언](../part2-types/10-assertion)
- 제네릭 함수와 `extends` 제약: [제네릭 기초](../part3-intermediate/04-generics-basics), [제네릭 제약](../part3-intermediate/05-generic-constraints)
- 사용자 정의 타입 가드(`value is Filter`): [사용자 정의 타입 가드](../part5-advanced/06-type-guards-satisfies)
- `tsconfig`의 `lib`, `moduleResolution`: [tsconfig.json 완전 정복](../part6-tooling/01-tsconfig)
- Vite: [빌드 도구](../part6-tooling/06-build-tools)
- 프로젝트 1의 "순수 로직 / 입출력 분리" 구조: [프로젝트 1](./01-cli-budget)

## 설계하기

::: tip 먼저 스스로 해 보세요
"할 일 하나"와 "화면 전체 상태"를 타입으로 적어 보세요. 그리고 사용자가 할 수 있는 행동(추가, 완료 표시 등)을 나열해 프로젝트 1의 `Command`처럼 판별 유니온으로 만들어 보세요.
:::

### 상태 타입

```ts
export interface Todo {
  id: string
  title: string
  done: boolean
  createdAt: string
}

export type Filter = 'all' | 'active' | 'done'

export interface State {
  todos: Todo[]
  filter: Filter
}
```

화면에 보이는 모든 것은 이 `State`에서 계산할 수 있어야 합니다. "남은 할 일 개수"는 `todos`에서 세면 되므로 **상태에 따로 저장하지 않습니다.** 저장하면 `todos`와 개수가 서로 어긋나는 버그가 생길 수 있기 때문입니다.

`id`가 숫자가 아니라 `string`인 이유는 브라우저 내장 함수 `crypto.randomUUID()`로 겹치지 않는 문자열을 만들기 때문입니다. 프로젝트 1처럼 `nextId`를 관리하지 않아도 됩니다.

### 행동 타입: Action

```ts
export type Action =
  | { type: 'add'; id: string; title: string; createdAt: string }
  | { type: 'toggle'; id: string }
  | { type: 'remove'; id: string }
  | { type: 'setFilter'; filter: Filter }
  | { type: 'clearDone' }
```

`add`에 `id`와 `createdAt`이 들어 있는 점을 눈여겨보세요. `crypto.randomUUID()`와 `new Date()`는 부를 때마다 결과가 달라서, 상태 계산 함수 안에서 부르면 그 함수는 더 이상 순수 함수가 아닙니다. 그래서 **바깥(이벤트 처리 코드)에서 만들어 Action에 담아 보냅니다.**

### 단방향 흐름

```text
 사용자 클릭/입력
        │
        ▼
 이벤트 리스너 ──▶ dispatch(Action) ──▶ update(state, action) ──▶ 새 State
                                                                 │
                         saveState(localStorage) ◀───────────────┤
                         render() : State ──▶ 화면 ◀──────────────┘
```

이벤트 리스너는 화면을 직접 고치지 않고 `dispatch`로 "이렇게 바꿔 주세요"라는 요청만 보냅니다. 화면을 고치는 곳은 `render` 하나뿐입니다. 이 규칙 덕분에 "화면이 왜 이렇게 보이지?"라는 질문의 답은 항상 "지금 `state`가 이래서"가 됩니다. 이것이 React·Vue 같은 프레임워크의 핵심 생각입니다.

### 파일 나누기

```text
index.html     화면 뼈대 (폼, 필터 버튼, 빈 목록)
src/
  types.ts     모든 타입
  todo.ts      순수 로직: update, visibleTodos, validateTitle, isFilter
  storage.ts   localStorage 읽기/쓰기 (unknown 검사)
  dom.ts       getElement: 요소를 타입 안전하게 찾기
  main.ts      상태 보관, dispatch, render, 이벤트 연결
  style.css    모양
```

## 단계별 구현

### Step 1. Vite 프로젝트 만들기

**목표**: TypeScript를 바로 브라우저에서 확인할 수 있는 개발 환경을 만듭니다.

```bash
npm create vite@latest todo-web -- --template vanilla-ts
cd todo-web
npm install
npm install -D typescript@~5.9.3
```

`vanilla-ts`는 "프레임워크 없는 TypeScript" 템플릿입니다. 템플릿이 만든 `src` 폴더의 예시 파일(`counter.ts`, `typescript.svg` 등)은 지우고 이 레슨의 파일로 채웁니다.

작성 시점(2026-10) 기준으로 템플릿은 TypeScript 6.x를 설치하므로, 두 번째 `npm install` 줄로 이 위키의 기준인 5.x(5.9.3)로 고정합니다. vite는 8.3.5입니다. 템플릿 버전에 따라 `tsconfig.json`이 `tsconfig.app.json` 등으로 나뉘어 있을 수 있는데, 동작은 같습니다. 이 레슨의 완성 코드는 하나로 합친 아래 파일을 씁니다.

```json
{
  "name": "todo-web",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "typescript": "~5.9.3",
    "vite": "^8.3.5"
  }
}
```

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["vite/client"],
    "skipLibCheck": true,

    /* 번들러(Vite) 모드 */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* 엄격 검사 */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

- `lib`에 `DOM`, `DOM.Iterable`이 있어야 `document`, `HTMLInputElement` 같은 브라우저 타입과 `for...of`로 `NodeList`를 도는 기능을 쓸 수 있습니다.
- `types: ["vite/client"]`는 `import './style.css'` 같은 Vite 전용 import를 이해하게 해 줍니다.
- `build` 스크립트가 `tsc && vite build`인 이유: **Vite는 타입 검사를 하지 않고** 타입만 지운 뒤 번들링합니다. 그래서 빌드 전에 `tsc`로 검사를 먼저 돌립니다.

```text
node_modules
dist
*.local
```

**체크포인트**
- [ ] `npm run dev` 후 브라우저에 템플릿 화면이 뜬다.
- [ ] 파일을 저장하면 브라우저가 자동으로 바뀐다(HMR, 새로 고침 없이 바뀐 모듈만 교체하는 기능).

### Step 2. HTML 뼈대

**목표**: 화면에 늘 있는 요소를 HTML로 만들고, 코드에서 찾을 수 있도록 `id`를 붙입니다. 목록(`ul`)은 비워 두고 코드가 채웁니다.

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>할 일 목록</title>
  </head>
  <body>
    <main class="app">
      <h1>할 일 목록</h1>

      <form id="todo-form" class="todo-form">
        <input id="todo-input" type="text" placeholder="할 일을 입력하세요" maxlength="100" autocomplete="off" />
        <button type="submit">추가</button>
      </form>
      <p id="error" class="error" hidden></p>

      <nav id="filters" class="filters">
        <button type="button" data-filter="all">전체</button>
        <button type="button" data-filter="active">진행</button>
        <button type="button" data-filter="done">완료</button>
      </nav>

      <ul id="todo-list" class="todo-list"></ul>

      <footer class="footer">
        <span id="count"></span>
        <button id="clear-done" type="button">완료 항목 지우기</button>
      </footer>
    </main>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

`data-filter="all"` 같은 `data-*` 속성은 요소에 내 마음대로 정보를 붙여 두는 방법입니다. 코드에서는 `button.dataset.filter`로 읽습니다.

**체크포인트**
- [ ] 브라우저에 입력창, 필터 버튼 세 개, "완료 항목 지우기" 버튼이 보인다.

### Step 3. 타입과 순수 로직

**목표**: `types.ts`와 `todo.ts`를 만듭니다. 이 두 파일은 DOM을 전혀 쓰지 않습니다.

```ts
// Todo 앱에서 쓰는 모든 타입을 한곳에 모읍니다.

/** 할 일 하나 */
export interface Todo {
  id: string
  title: string
  done: boolean
  /** 만든 시각(ISO 문자열) */
  createdAt: string
}

/** 목록 필터: 전체 / 진행 중 / 완료 */
export type Filter = 'all' | 'active' | 'done'

/** 화면 전체의 상태. 화면은 이 값만 보고 그립니다. */
export interface State {
  todos: Todo[]
  filter: Filter
}

/** 상태를 바꾸는 요청 (판별 유니온: type 속성으로 구분) */
export type Action =
  | { type: 'add'; id: string; title: string; createdAt: string }
  | { type: 'toggle'; id: string }
  | { type: 'remove'; id: string }
  | { type: 'setFilter'; filter: Filter }
  | { type: 'clearDone' }

/** 입력한 제목의 검사 결과 */
export type TitleResult = { ok: true; title: string } | { ok: false; message: string }
```

```ts
// 상태 계산 로직입니다. DOM과 localStorage를 모르는 순수 함수만 둡니다.
import type { Action, Filter, State, TitleResult, Todo } from './types'

export const MAX_TITLE_LENGTH = 100

export const FILTERS: readonly Filter[] = ['all', 'active', 'done']

/** 문자열이 Filter 값 중 하나인지 검사하는 타입 가드 (data-filter 속성을 읽을 때 사용) */
export function isFilter(value: string | undefined): value is Filter {
  return FILTERS.some((filter) => filter === value)
}

/** 입력한 제목을 검사하고 앞뒤 공백을 지웁니다. */
export function validateTitle(raw: string): TitleResult {
  const title = raw.trim()
  if (title === '') {
    return { ok: false, message: '할 일을 입력해 주세요.' }
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return { ok: false, message: `${MAX_TITLE_LENGTH}자 이하로 입력해 주세요.` }
  }
  return { ok: true, title }
}

/** 현재 상태와 요청을 받아 "새" 상태를 돌려줍니다. 원래 상태는 바꾸지 않습니다. */
export function update(state: State, action: Action): State {
  switch (action.type) {
    case 'add': {
      const todo: Todo = { id: action.id, title: action.title, done: false, createdAt: action.createdAt }
      return { ...state, todos: [...state.todos, todo] }
    }
    case 'toggle':
      return {
        ...state,
        todos: state.todos.map((todo) => (todo.id === action.id ? { ...todo, done: !todo.done } : todo)),
      }
    case 'remove':
      return { ...state, todos: state.todos.filter((todo) => todo.id !== action.id) }
    case 'setFilter':
      return { ...state, filter: action.filter }
    case 'clearDone':
      return { ...state, todos: state.todos.filter((todo) => !todo.done) }
    default: {
      // Action에 새 요청을 추가하고 여기서 처리하지 않으면 컴파일 에러가 납니다.
      const unreachable: never = action
      return unreachable
    }
  }
}

/** 필터에 맞는 할 일만 돌려줍니다. */
export function visibleTodos(state: State): Todo[] {
  switch (state.filter) {
    case 'all':
      return state.todos
    case 'active':
      return state.todos.filter((todo) => !todo.done)
    case 'done':
      return state.todos.filter((todo) => todo.done)
  }
}

/** 남은(완료하지 않은) 할 일 개수 */
export function activeCount(state: State): number {
  return state.todos.filter((todo) => !todo.done).length
}
```

눈여겨볼 곳:

- `update`의 `switch`와 `never` 검사는 프로젝트 1의 `execute`와 같은 구조입니다. 각 `case` 안에서 `action`이 그 모양으로 좁혀지므로 `case 'setFilter'`에서만 `action.filter`를 쓸 수 있습니다.
- `visibleTodos`에는 `default`가 없습니다. `state.filter`의 세 경우를 모두 `return`하므로 TypeScript가 "함수 끝에 도달할 수 없다"는 것을 알고, 반환 타입 `Todo[]`를 만족한다고 판단합니다. 경우 하나를 빼면 `Function lacks ending return statement and return type does not include 'undefined'. (TS2366)` 에러가 납니다.
- `isFilter`는 `string | undefined`를 받아 `Filter`인지 검사하는 타입 가드입니다. `dataset.filter`는 `string | undefined`라서 그대로는 `Filter`에 넣을 수 없습니다.
- `FILTERS: readonly Filter[]`의 `readonly`는 실수로 `FILTERS.push(...)`하는 것을 막습니다.

**실행 확인**: 아직 화면과 연결하지 않았지만 `npx tsc --noEmit`이 0 에러면 됩니다. 원한다면 프로젝트 1처럼 `npx tsx`로 `update`를 불러 확인할 수도 있습니다(`todo.ts`는 DOM을 쓰지 않으므로 Node에서도 실행됩니다).

**체크포인트**
- [ ] `npx tsc --noEmit`이 통과한다.
- [ ] `update`에서 `case 'clearDone'`을 지우면 TS2322 에러가 난다.

### Step 4. DOM 요소를 타입 안전하게 찾기

**목표**: `document.querySelector`의 `null` 문제를 한곳에서 해결합니다.

`document.querySelector('#todo-input')`의 반환 타입은 `Element | null`입니다. 요소가 없을 수도 있고, 있더라도 `input`인지 `div`인지 TypeScript는 모르기 때문입니다.

```ts
const value = document.querySelector('#todo-input').value
// ❌ Object is possibly 'null'. (TS2531)
// ❌ Property 'value' does not exist on type 'Element'. (TS2339)
```

`!`와 `as HTMLInputElement`로 에러를 지울 수도 있지만, 그건 "내가 책임질게"라는 약속일 뿐 실제로 검사하지는 않습니다. HTML에서 `id`를 바꾸면 실행 중에 `Cannot read properties of null` 에러가 엉뚱한 곳에서 터집니다. 그래서 **실제로 검사하는** 도우미를 만듭니다.

```ts
// DOM 요소를 타입 안전하게 찾는 도우미입니다.

/**
 * 선택자로 요소를 찾고, 기대한 종류(HTMLInputElement 등)인지 확인합니다.
 * 없거나 종류가 다르면 바로 에러를 던져 "어디가 틀렸는지" 알려 줍니다.
 */
export function getElement<T extends HTMLElement>(selector: string, type: new () => T): T {
  const element = document.querySelector(selector)
  if (!(element instanceof type)) {
    throw new Error(`요소를 찾을 수 없거나 종류가 다릅니다: ${selector}`)
  }
  return element
}
```

- 두 번째 매개변수 `type: new () => T`는 "`new`로 `T`를 만들 수 있는 것", 즉 `HTMLInputElement` 같은 **클래스 자체**를 받습니다.
- `element instanceof type`이 `true`이면 `element`는 `T`로 좁혀집니다. `null`도 `instanceof`에서 `false`이므로 함께 걸러집니다.
- 호출은 `getElement('#todo-input', HTMLInputElement)`처럼 합니다. 반환 타입이 `HTMLInputElement`로 정해지므로 `.value`를 바로 쓸 수 있습니다.

**체크포인트**
- [ ] HTML의 `id`를 일부러 틀리게 바꾸면 콘솔에 `요소를 찾을 수 없거나 종류가 다릅니다: #todo-input`이 바로 보인다.

### Step 5. localStorage 저장/불러오기

**목표**: 상태를 문자열(JSON)로 저장하고, 읽을 때는 검사합니다.

```ts
// 상태를 브라우저의 localStorage에 저장하고 불러옵니다.
import { isFilter } from './todo'
import type { State, Todo } from './types'

// 저장 형식을 바꾸게 되면 v2처럼 키를 바꿔 옛 데이터와 섞이지 않게 합니다.
const STORAGE_KEY = 'todo-web:v1'

function isTodo(value: unknown): value is Todo {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.id === 'string' &&
    typeof v.title === 'string' &&
    typeof v.done === 'boolean' &&
    typeof v.createdAt === 'string'
  )
}

function isState(value: unknown): value is State {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return Array.isArray(v.todos) && v.todos.every(isTodo) && typeof v.filter === 'string' && isFilter(v.filter)
}

/** 저장된 상태를 불러옵니다. 없거나 깨졌으면 빈 상태로 시작합니다. */
export function loadState(): State {
  const empty: State = { todos: [], filter: 'all' }
  // getItem은 키가 없으면 null을 돌려줍니다.
  const text = localStorage.getItem(STORAGE_KEY)
  if (text === null) return empty
  try {
    const data: unknown = JSON.parse(text)
    return isState(data) ? data : empty
  } catch {
    // JSON 문법이 깨진 경우: 앱이 멈추지 않도록 빈 상태로 시작합니다.
    return empty
  }
}

export function saveState(state: State): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}
```

- `localStorage.getItem`의 반환 타입은 `string | null`입니다. 키가 없으면 `null`이므로 먼저 처리합니다.
- 프로젝트 1과 같이 `JSON.parse` 결과를 `unknown`으로 받아 타입 가드로 검사합니다. 사용자가 개발자 도구에서 값을 고쳤거나, 예전 버전 앱이 다른 모양으로 저장했을 수 있습니다.
- 브라우저에서는 저장된 값이 깨졌다고 에러를 보여 주기보다 빈 목록으로 시작하는 편이 사용자에게 낫다고 판단했습니다. 이런 결정은 요구사항에 따라 달라집니다.

**체크포인트**
- [ ] 개발자 도구(F12) → Application → Local Storage에서 `todo-web:v1` 값을 `abc`로 바꾸고 새로 고침해도 앱이 뜬다.

### Step 6. 상태·dispatch·render 연결

**목표**: `main.ts`에서 모든 것을 연결합니다.

```ts
// 프로그램 시작점: 상태를 갖고, 이벤트를 Action으로 바꾸고, 상태가 바뀌면 다시 그립니다.
import './style.css'
import { getElement } from './dom'
import { loadState, saveState } from './storage'
import { activeCount, isFilter, update, validateTitle, visibleTodos } from './todo'
import type { Action, State, Todo } from './types'

// 화면 요소: 없으면 여기서 바로 에러가 나므로, 아래 코드에서는 null 걱정이 없습니다.
const form = getElement('#todo-form', HTMLFormElement)
const input = getElement('#todo-input', HTMLInputElement)
const errorText = getElement('#error', HTMLParagraphElement)
const filters = getElement('#filters', HTMLElement)
const list = getElement('#todo-list', HTMLUListElement)
const count = getElement('#count', HTMLSpanElement)
const clearDoneButton = getElement('#clear-done', HTMLButtonElement)

let state: State = loadState()

/** 상태를 바꾸는 유일한 통로: 새 상태 계산 → 저장 → 다시 그리기 */
function dispatch(action: Action): void {
  state = update(state, action)
  saveState(state)
  render()
}

/** 할 일 하나를 li 요소로 만듭니다. 제목은 textContent로 넣어 HTML로 해석되지 않게 합니다. */
function renderItem(todo: Todo): HTMLLIElement {
  const item = document.createElement('li')
  item.className = todo.done ? 'todo done' : 'todo'
  item.dataset.id = todo.id

  const checkbox = document.createElement('input')
  checkbox.type = 'checkbox'
  checkbox.checked = todo.done
  checkbox.dataset.action = 'toggle'
  checkbox.setAttribute('aria-label', `${todo.title} 완료 표시`)

  const title = document.createElement('span')
  title.className = 'title'
  title.textContent = todo.title

  const removeButton = document.createElement('button')
  removeButton.type = 'button'
  removeButton.textContent = '삭제'
  removeButton.dataset.action = 'remove'

  item.append(checkbox, title, removeButton)
  return item
}

/** 상태 → 화면. 화면을 고치는 코드는 이 함수 하나뿐입니다. */
function render(): void {
  const todos = visibleTodos(state)
  if (todos.length === 0) {
    const empty = document.createElement('li')
    empty.className = 'empty'
    empty.textContent = '표시할 할 일이 없습니다.'
    list.replaceChildren(empty)
  } else {
    list.replaceChildren(...todos.map(renderItem))
  }

  for (const button of filters.querySelectorAll<HTMLButtonElement>('button[data-filter]')) {
    button.classList.toggle('selected', button.dataset.filter === state.filter)
  }

  count.textContent = `남은 할 일 ${activeCount(state)}개`
  clearDoneButton.disabled = state.todos.every((todo) => !todo.done)
}

function showError(message: string): void {
  errorText.textContent = message
  errorText.hidden = message === ''
}

form.addEventListener('submit', (event) => {
  // 폼 제출의 기본 동작(페이지 새로 고침)을 막습니다.
  event.preventDefault()
  const result = validateTitle(input.value)
  if (!result.ok) {
    showError(result.message)
    return
  }
  showError('')
  dispatch({ type: 'add', id: crypto.randomUUID(), title: result.title, createdAt: new Date().toISOString() })
  input.value = ''
  input.focus()
})

// 이벤트 위임: li마다 리스너를 달지 않고 목록(ul) 하나에서 처리합니다.
list.addEventListener('click', (event) => {
  const target = event.target
  if (!(target instanceof HTMLElement)) return
  const item = target.closest<HTMLLIElement>('li[data-id]')
  const id = item?.dataset.id
  if (id === undefined) return

  if (target.dataset.action === 'toggle') {
    dispatch({ type: 'toggle', id })
  } else if (target.dataset.action === 'remove') {
    dispatch({ type: 'remove', id })
  }
})

filters.addEventListener('click', (event) => {
  const target = event.target
  if (!(target instanceof HTMLButtonElement)) return
  const filter = target.dataset.filter
  if (isFilter(filter)) {
    dispatch({ type: 'setFilter', filter })
  }
})

clearDoneButton.addEventListener('click', () => {
  dispatch({ type: 'clearDone' })
})

render()
```

```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: #f5f6f8;
  color: #222;
}

.app {
  max-width: 480px;
  margin: 40px auto;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 8%);
}

.todo-form {
  display: flex;
  gap: 8px;
}

.todo-form input {
  flex: 1;
  padding: 8px;
  font-size: 16px;
}

button {
  padding: 6px 12px;
  cursor: pointer;
}

.error {
  color: #c62828;
}

.filters {
  display: flex;
  gap: 4px;
  margin: 16px 0 8px;
}

.filters .selected {
  background: #1565c0;
  color: #fff;
}

.todo-list {
  list-style: none;
  padding: 0;
}

.todo {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.todo .title {
  flex: 1;
  word-break: break-all;
}

.todo.done .title {
  color: #999;
  text-decoration: line-through;
}

.empty {
  padding: 16px 0;
  color: #999;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

눈여겨볼 곳:

- **render 한 곳에서만 화면을 고칩니다.** `list.replaceChildren(...)`으로 목록을 통째로 다시 만듭니다. 할 일이 수천 개라면 느리겠지만, 이 규모에서는 "항상 상태와 화면이 같다"는 단순함이 더 중요합니다. 이 비용을 줄여 주는 것이 React의 가상 DOM입니다.
- **textContent로 글자를 넣습니다.** `item.innerHTML = todo.title`이라고 쓰면 사용자가 입력한 `<img src=x onerror=...>` 같은 문자열이 HTML로 실행됩니다. 이것이 **XSS**(Cross-Site Scripting, 남이 넣은 스크립트가 내 페이지에서 실행되는 공격)입니다. `textContent`는 글자 그대로 넣으므로 안전합니다.
- **이벤트 위임**: 클릭 이벤트는 눌린 요소에서 시작해 부모 쪽으로 올라갑니다(버블링). 그래서 `ul` 하나에 리스너를 달고 `event.target`이 무엇인지 보고 처리합니다. 목록을 다시 그려도 리스너를 다시 달 필요가 없습니다.
- `event.target`의 타입은 `EventTarget | null`입니다. `instanceof HTMLElement`로 좁혀야 `dataset`과 `closest`를 쓸 수 있습니다.
- `target.closest<HTMLLIElement>('li[data-id]')`: 눌린 요소에서 가장 가까운 `li` 조상을 찾습니다. 제네릭 인자로 반환 타입을 알려 주었습니다(없으면 `null`).
- `item?.dataset.id`: 옵셔널 체이닝으로 `item`이 `null`이면 `undefined`가 됩니다. 그다음 `id === undefined` 검사로 `id`가 `string`으로 좁혀집니다.
- `form`의 `submit` 이벤트를 쓰면 버튼 클릭과 Enter 키를 한 번에 처리할 수 있습니다. `event.preventDefault()`를 빠뜨리면 페이지가 새로 고쳐집니다.

**실행 확인**: `npm run dev`로 띄우고 [완성하면 이렇게 됩니다](#완성하면-이렇게-됩니다)의 동작을 하나씩 해 봅니다. 마지막으로 빌드도 확인합니다.

```bash
npx tsc --noEmit
npm run build
```

```text
✓ 8 modules transformed.
dist/index.html                 1.17 kB │ gzip: 0.59 kB
dist/assets/index-DnAUx5Yl.css  0.76 kB │ gzip: 0.43 kB
dist/assets/index-DkoCsGtu.js   4.06 kB │ gzip: 1.79 kB
✓ built in 492ms
```

파일 이름 뒤의 해시(`DnAUx5Yl` 등)와 크기·시간은 환경마다 다를 수 있습니다.

**체크포인트**
- [ ] 추가·완료·삭제·필터·완료 항목 지우기가 모두 동작한다.
- [ ] `<b>굵게</b>`를 입력하면 태그가 글자 그대로 보인다.
- [ ] 새로 고침해도 목록과 선택한 필터가 남아 있다.
- [ ] `npm run build`가 성공한다.

## 자주 막히는 곳

**1. `querySelector` 결과에서 `.value`를 못 읽습니다.**

반환 타입이 `Element | null`이기 때문입니다(TS2531, TS2339). Step 4의 `getElement`처럼 `instanceof`로 검사하거나, 최소한 `document.querySelector<HTMLInputElement>('#todo-input')`로 종류를 알려 준 뒤 `null` 검사를 합니다. 제네릭 인자는 검사 없이 "믿는" 것이라는 점은 기억해 두세요.

**2. `event.target.dataset`에서 에러가 납니다.**

```ts
list.addEventListener('click', (event) => {
  const id = event.target.dataset.id
  // ❌ 'event.target' is possibly 'null'. (TS18047)
  // ❌ Property 'dataset' does not exist on type 'EventTarget'. (TS2339)
})
```

`event.target`은 요소가 아닐 수도 있는(예: `window`) `EventTarget | null`입니다. `if (!(target instanceof HTMLElement)) return`으로 좁힙니다.

**3. `dataset` 값을 리터럴 유니온에 넣을 수 없습니다.**

```ts
const filter: Filter = button.dataset.filter
// ❌ Type 'string | undefined' is not assignable to type 'Filter'. (TS2322)
```

`data-*` 속성은 아무 문자열이나 들어갈 수 있으므로 `isFilter` 같은 타입 가드로 검사합니다. `as Filter`로 단언하면 HTML 오타(`data-filter="don"`)를 놓칩니다.

**4. 추가 버튼을 누르면 화면이 깜빡이고 목록이 사라집니다.**

폼 제출의 기본 동작이 페이지 새로 고침이기 때문입니다. `submit` 리스너 첫 줄에 `event.preventDefault()`를 씁니다.

**5. 상태는 바뀌었는데 화면이 안 바뀝니다.**

`state.todos.push(...)`처럼 상태를 직접 고치고 `render()`를 부르지 않았을 가능성이 큽니다. 모든 변경을 `dispatch`로만 하면 저장과 렌더가 빠지지 않습니다.

**6. `crypto.randomUUID is not a function` 에러가 납니다.**

`crypto.randomUUID()`는 보안 연결(HTTPS 또는 `localhost`)에서만 쓸 수 있습니다. 같은 와이파이의 휴대폰에서 `http://192.168.x.x:5173`으로 접속하면 이 에러가 납니다. 연습 중이라면 `localhost`로 확인하거나, `Date.now()`와 `Math.random()`을 조합한 id로 바꿔 보세요.

## 도전 과제

1. ⭐ 할 일 제목을 더블클릭하면 수정할 수 있게 하세요. `Action`에 `{ type: 'rename'; id: string; title: string }`을 추가하고 `validateTitle`을 재사용합니다.
2. ⭐ "모두 완료" 버튼을 만드세요. 모두 완료 상태라면 "모두 해제"로 바뀌게 합니다.
3. ⭐⭐ 필터를 URL 해시(`#/active`)와 맞춰서, 주소를 공유하면 같은 필터로 열리게 하세요. `hashchange` 이벤트에서 `isFilter`로 검사합니다.
4. ⭐⭐ 할 일에 마감일(`dueDate: string | null`)을 추가하고, 지난 일은 빨간색으로 보여 주세요. 저장 형식이 바뀌므로 `STORAGE_KEY`를 `v2`로 올리고, `v1` 데이터를 `v2`로 옮기는 함수를 만들어 보세요.
5. ⭐⭐⭐ `todo.ts`에 Vitest 테스트를 붙이세요([Vitest로 테스트 작성하기](../part6-tooling/05-testing-vitest)). DOM이 없는 순수 함수라서 별도 설정 없이 테스트할 수 있습니다.

## 완성 코드

전체 코드는 위키 저장소의 `examples/projects/02-todo-web/` 폴더에 있습니다.

```bash
cd examples/projects/02-todo-web
npm install
npm run dev       # 개발 서버 (http://localhost:5173), 끝낼 때는 Ctrl+C
npm run build     # 타입 검사 + 배포용 빌드(dist 폴더)
npm run preview   # 빌드 결과 미리 보기
```

::: details index.html
```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>할 일 목록</title>
  </head>
  <body>
    <main class="app">
      <h1>할 일 목록</h1>

      <form id="todo-form" class="todo-form">
        <input id="todo-input" type="text" placeholder="할 일을 입력하세요" maxlength="100" autocomplete="off" />
        <button type="submit">추가</button>
      </form>
      <p id="error" class="error" hidden></p>

      <nav id="filters" class="filters">
        <button type="button" data-filter="all">전체</button>
        <button type="button" data-filter="active">진행</button>
        <button type="button" data-filter="done">완료</button>
      </nav>

      <ul id="todo-list" class="todo-list"></ul>

      <footer class="footer">
        <span id="count"></span>
        <button id="clear-done" type="button">완료 항목 지우기</button>
      </footer>
    </main>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```
:::

::: details src/types.ts
```ts
// Todo 앱에서 쓰는 모든 타입을 한곳에 모읍니다.

/** 할 일 하나 */
export interface Todo {
  id: string
  title: string
  done: boolean
  /** 만든 시각(ISO 문자열) */
  createdAt: string
}

/** 목록 필터: 전체 / 진행 중 / 완료 */
export type Filter = 'all' | 'active' | 'done'

/** 화면 전체의 상태. 화면은 이 값만 보고 그립니다. */
export interface State {
  todos: Todo[]
  filter: Filter
}

/** 상태를 바꾸는 요청 (판별 유니온: type 속성으로 구분) */
export type Action =
  | { type: 'add'; id: string; title: string; createdAt: string }
  | { type: 'toggle'; id: string }
  | { type: 'remove'; id: string }
  | { type: 'setFilter'; filter: Filter }
  | { type: 'clearDone' }

/** 입력한 제목의 검사 결과 */
export type TitleResult = { ok: true; title: string } | { ok: false; message: string }
```
:::

::: details src/todo.ts
```ts
// 상태 계산 로직입니다. DOM과 localStorage를 모르는 순수 함수만 둡니다.
import type { Action, Filter, State, TitleResult, Todo } from './types'

export const MAX_TITLE_LENGTH = 100

export const FILTERS: readonly Filter[] = ['all', 'active', 'done']

/** 문자열이 Filter 값 중 하나인지 검사하는 타입 가드 (data-filter 속성을 읽을 때 사용) */
export function isFilter(value: string | undefined): value is Filter {
  return FILTERS.some((filter) => filter === value)
}

/** 입력한 제목을 검사하고 앞뒤 공백을 지웁니다. */
export function validateTitle(raw: string): TitleResult {
  const title = raw.trim()
  if (title === '') {
    return { ok: false, message: '할 일을 입력해 주세요.' }
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return { ok: false, message: `${MAX_TITLE_LENGTH}자 이하로 입력해 주세요.` }
  }
  return { ok: true, title }
}

/** 현재 상태와 요청을 받아 "새" 상태를 돌려줍니다. 원래 상태는 바꾸지 않습니다. */
export function update(state: State, action: Action): State {
  switch (action.type) {
    case 'add': {
      const todo: Todo = { id: action.id, title: action.title, done: false, createdAt: action.createdAt }
      return { ...state, todos: [...state.todos, todo] }
    }
    case 'toggle':
      return {
        ...state,
        todos: state.todos.map((todo) => (todo.id === action.id ? { ...todo, done: !todo.done } : todo)),
      }
    case 'remove':
      return { ...state, todos: state.todos.filter((todo) => todo.id !== action.id) }
    case 'setFilter':
      return { ...state, filter: action.filter }
    case 'clearDone':
      return { ...state, todos: state.todos.filter((todo) => !todo.done) }
    default: {
      // Action에 새 요청을 추가하고 여기서 처리하지 않으면 컴파일 에러가 납니다.
      const unreachable: never = action
      return unreachable
    }
  }
}

/** 필터에 맞는 할 일만 돌려줍니다. */
export function visibleTodos(state: State): Todo[] {
  switch (state.filter) {
    case 'all':
      return state.todos
    case 'active':
      return state.todos.filter((todo) => !todo.done)
    case 'done':
      return state.todos.filter((todo) => todo.done)
  }
}

/** 남은(완료하지 않은) 할 일 개수 */
export function activeCount(state: State): number {
  return state.todos.filter((todo) => !todo.done).length
}
```
:::

::: details src/storage.ts
```ts
// 상태를 브라우저의 localStorage에 저장하고 불러옵니다.
import { isFilter } from './todo'
import type { State, Todo } from './types'

// 저장 형식을 바꾸게 되면 v2처럼 키를 바꿔 옛 데이터와 섞이지 않게 합니다.
const STORAGE_KEY = 'todo-web:v1'

function isTodo(value: unknown): value is Todo {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.id === 'string' &&
    typeof v.title === 'string' &&
    typeof v.done === 'boolean' &&
    typeof v.createdAt === 'string'
  )
}

function isState(value: unknown): value is State {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return Array.isArray(v.todos) && v.todos.every(isTodo) && typeof v.filter === 'string' && isFilter(v.filter)
}

/** 저장된 상태를 불러옵니다. 없거나 깨졌으면 빈 상태로 시작합니다. */
export function loadState(): State {
  const empty: State = { todos: [], filter: 'all' }
  // getItem은 키가 없으면 null을 돌려줍니다.
  const text = localStorage.getItem(STORAGE_KEY)
  if (text === null) return empty
  try {
    const data: unknown = JSON.parse(text)
    return isState(data) ? data : empty
  } catch {
    // JSON 문법이 깨진 경우: 앱이 멈추지 않도록 빈 상태로 시작합니다.
    return empty
  }
}

export function saveState(state: State): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}
```
:::

::: details src/dom.ts
```ts
// DOM 요소를 타입 안전하게 찾는 도우미입니다.

/**
 * 선택자로 요소를 찾고, 기대한 종류(HTMLInputElement 등)인지 확인합니다.
 * 없거나 종류가 다르면 바로 에러를 던져 "어디가 틀렸는지" 알려 줍니다.
 */
export function getElement<T extends HTMLElement>(selector: string, type: new () => T): T {
  const element = document.querySelector(selector)
  if (!(element instanceof type)) {
    throw new Error(`요소를 찾을 수 없거나 종류가 다릅니다: ${selector}`)
  }
  return element
}
```
:::

::: details src/main.ts
```ts
// 프로그램 시작점: 상태를 갖고, 이벤트를 Action으로 바꾸고, 상태가 바뀌면 다시 그립니다.
import './style.css'
import { getElement } from './dom'
import { loadState, saveState } from './storage'
import { activeCount, isFilter, update, validateTitle, visibleTodos } from './todo'
import type { Action, State, Todo } from './types'

// 화면 요소: 없으면 여기서 바로 에러가 나므로, 아래 코드에서는 null 걱정이 없습니다.
const form = getElement('#todo-form', HTMLFormElement)
const input = getElement('#todo-input', HTMLInputElement)
const errorText = getElement('#error', HTMLParagraphElement)
const filters = getElement('#filters', HTMLElement)
const list = getElement('#todo-list', HTMLUListElement)
const count = getElement('#count', HTMLSpanElement)
const clearDoneButton = getElement('#clear-done', HTMLButtonElement)

let state: State = loadState()

/** 상태를 바꾸는 유일한 통로: 새 상태 계산 → 저장 → 다시 그리기 */
function dispatch(action: Action): void {
  state = update(state, action)
  saveState(state)
  render()
}

/** 할 일 하나를 li 요소로 만듭니다. 제목은 textContent로 넣어 HTML로 해석되지 않게 합니다. */
function renderItem(todo: Todo): HTMLLIElement {
  const item = document.createElement('li')
  item.className = todo.done ? 'todo done' : 'todo'
  item.dataset.id = todo.id

  const checkbox = document.createElement('input')
  checkbox.type = 'checkbox'
  checkbox.checked = todo.done
  checkbox.dataset.action = 'toggle'
  checkbox.setAttribute('aria-label', `${todo.title} 완료 표시`)

  const title = document.createElement('span')
  title.className = 'title'
  title.textContent = todo.title

  const removeButton = document.createElement('button')
  removeButton.type = 'button'
  removeButton.textContent = '삭제'
  removeButton.dataset.action = 'remove'

  item.append(checkbox, title, removeButton)
  return item
}

/** 상태 → 화면. 화면을 고치는 코드는 이 함수 하나뿐입니다. */
function render(): void {
  const todos = visibleTodos(state)
  if (todos.length === 0) {
    const empty = document.createElement('li')
    empty.className = 'empty'
    empty.textContent = '표시할 할 일이 없습니다.'
    list.replaceChildren(empty)
  } else {
    list.replaceChildren(...todos.map(renderItem))
  }

  for (const button of filters.querySelectorAll<HTMLButtonElement>('button[data-filter]')) {
    button.classList.toggle('selected', button.dataset.filter === state.filter)
  }

  count.textContent = `남은 할 일 ${activeCount(state)}개`
  clearDoneButton.disabled = state.todos.every((todo) => !todo.done)
}

function showError(message: string): void {
  errorText.textContent = message
  errorText.hidden = message === ''
}

form.addEventListener('submit', (event) => {
  // 폼 제출의 기본 동작(페이지 새로 고침)을 막습니다.
  event.preventDefault()
  const result = validateTitle(input.value)
  if (!result.ok) {
    showError(result.message)
    return
  }
  showError('')
  dispatch({ type: 'add', id: crypto.randomUUID(), title: result.title, createdAt: new Date().toISOString() })
  input.value = ''
  input.focus()
})

// 이벤트 위임: li마다 리스너를 달지 않고 목록(ul) 하나에서 처리합니다.
list.addEventListener('click', (event) => {
  const target = event.target
  if (!(target instanceof HTMLElement)) return
  const item = target.closest<HTMLLIElement>('li[data-id]')
  const id = item?.dataset.id
  if (id === undefined) return

  if (target.dataset.action === 'toggle') {
    dispatch({ type: 'toggle', id })
  } else if (target.dataset.action === 'remove') {
    dispatch({ type: 'remove', id })
  }
})

filters.addEventListener('click', (event) => {
  const target = event.target
  if (!(target instanceof HTMLButtonElement)) return
  const filter = target.dataset.filter
  if (isFilter(filter)) {
    dispatch({ type: 'setFilter', filter })
  }
})

clearDoneButton.addEventListener('click', () => {
  dispatch({ type: 'clearDone' })
})

render()
```
:::

## 회고 질문

1. 이벤트 리스너가 화면을 직접 고치지 않고 `dispatch`만 부르게 한 덕분에 무엇이 쉬워졌나요? 직접 고쳤다면 어떤 버그가 생길 수 있었을까요?
2. `getElement`가 요소를 못 찾으면 에러를 던지게 한 것과, `null`을 돌려주게 하는 것은 각각 어떤 장단점이 있나요?
3. "남은 할 일 개수"를 `State`에 저장하지 않고 계산한 이유를 자기 말로 설명해 보세요.
4. 프로젝트 1의 `execute`와 이번의 `update`는 무엇이 같고 무엇이 다른가요?
5. 목록을 매번 통째로 다시 그리는 방식의 한계는 무엇일까요? 프로젝트 4에서 React가 이 문제를 어떻게 해결하는지 살펴보세요.
