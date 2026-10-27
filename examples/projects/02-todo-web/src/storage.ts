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
