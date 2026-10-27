// 가계부 계산 로직입니다. 화면 입출력이나 파일을 모르는 "순수 함수"만 둡니다.
import type { CategoryTotal, Entry, Ledger, MonthlySummary } from './types'

/** 빈 가계부를 만듭니다. */
export function createLedger(): Ledger {
  return { nextId: 1, entries: [] }
}

/** 기록을 추가한 "새" 가계부를 돌려줍니다. 원래 가계부는 바꾸지 않습니다. */
export function addEntry(ledger: Ledger, input: Omit<Entry, 'id'>): Ledger {
  const entry: Entry = { id: ledger.nextId, ...input }
  return { nextId: ledger.nextId + 1, entries: [...ledger.entries, entry] }
}

/** id에 해당하는 기록을 지운 새 가계부를 돌려줍니다. 없으면 null입니다. */
export function removeEntry(ledger: Ledger, id: number): Ledger | null {
  const exists = ledger.entries.some((entry) => entry.id === id)
  if (!exists) {
    return null
  }
  return { ...ledger, entries: ledger.entries.filter((entry) => entry.id !== id) }
}

/** 날짜순(같으면 id순)으로 정렬한 기록 목록 */
export function sortedEntries(ledger: Ledger): Entry[] {
  return [...ledger.entries].sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id)
}

/** 'YYYY-MM' 달의 수입·지출·잔액을 계산합니다. */
export function monthlySummary(ledger: Ledger, month: string): MonthlySummary {
  const inMonth = ledger.entries.filter((entry) => entry.date.startsWith(month))
  const income = sumBy(inMonth, 'income')
  const expense = sumBy(inMonth, 'expense')
  return { month, income, expense, balance: income - expense }
}

/** 카테고리별 지출 합계를 큰 금액부터 돌려줍니다. month가 null이면 전체 기간입니다. */
export function categoryTotals(ledger: Ledger, month: string | null): CategoryTotal[] {
  const totals = new Map<string, number>()
  for (const entry of ledger.entries) {
    if (entry.kind !== 'expense') continue
    if (month !== null && !entry.date.startsWith(month)) continue
    totals.set(entry.category, (totals.get(entry.category) ?? 0) + entry.amount)
  }
  return [...totals]
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)
}

/** 3000000 → '3,000,000원' */
export function formatWon(amount: number): string {
  return `${amount.toLocaleString('ko-KR')}원`
}

function sumBy(entries: Entry[], kind: Entry['kind']): number {
  return entries
    .filter((entry) => entry.kind === kind)
    .reduce((sum, entry) => sum + entry.amount, 0)
}
