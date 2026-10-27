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
