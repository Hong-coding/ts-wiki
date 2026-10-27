// 가계부에서 쓰는 모든 타입을 한곳에 모읍니다.

/** 기록 종류: 수입 또는 지출 */
export type EntryKind = 'income' | 'expense'

/** 가계부 한 줄(거래 기록) */
export interface Entry {
  id: number
  kind: EntryKind
  /** 금액(원). 항상 1 이상의 정수로 저장합니다. */
  amount: number
  category: string
  /** 'YYYY-MM-DD' 형식의 날짜 */
  date: string
  memo: string
}

/** 파일에 저장되는 가계부 전체 */
export interface Ledger {
  /** 다음에 추가할 기록의 id */
  nextId: number
  entries: Entry[]
}

/** 사용자가 입력할 수 있는 명령 (판별 유니온: type 속성으로 구분) */
export type Command =
  | { type: 'add'; kind: EntryKind; amount: number; category: string; date: string; memo: string }
  | { type: 'list' }
  | { type: 'month'; month: string }
  | { type: 'category'; month: string | null }
  | { type: 'delete'; id: number }
  | { type: 'help' }
  | { type: 'quit' }

/** 입력 한 줄을 해석한 결과: 성공이면 명령, 실패면 이유 */
export type ParseResult =
  | { ok: true; command: Command }
  | { ok: false; message: string }

/** 월별 합계 */
export interface MonthlySummary {
  month: string
  income: number
  expense: number
  balance: number
}

/** 카테고리별 지출 합계 한 줄 */
export interface CategoryTotal {
  category: string
  total: number
}
