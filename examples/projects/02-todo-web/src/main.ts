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
