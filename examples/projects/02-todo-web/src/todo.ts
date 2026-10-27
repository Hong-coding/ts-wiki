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
