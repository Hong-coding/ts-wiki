// Command 하나를 실행하고, 바뀐 가계부와 화면에 보여 줄 메시지를 돌려줍니다.
import {
  addEntry,
  categoryTotals,
  formatWon,
  monthlySummary,
  removeEntry,
  sortedEntries,
} from './budget'
import type { Command, Entry, Ledger } from './types'

export interface ExecResult {
  ledger: Ledger
  message: string
  /** 파일에 저장해야 하는 변경이 있었는지 */
  changed: boolean
}

export const HELP_TEXT = [
  '명령 목록',
  '  add <수입|지출> <금액> <카테고리> [YYYY-MM-DD] [메모]   기록 추가',
  '  list                                                    전체 목록',
  '  month <YYYY-MM>                                         월별 합계',
  '  category [YYYY-MM]                                      카테고리별 지출',
  '  delete <번호>                                           기록 삭제',
  '  help                                                    도움말',
  '  quit                                                    종료',
].join('\n')

function formatEntry(entry: Entry): string {
  const kindLabel = entry.kind === 'income' ? '수입' : '지출'
  const sign = entry.kind === 'income' ? '+' : '-'
  const memo = entry.memo === '' ? '' : ` (${entry.memo})`
  return `#${entry.id}  ${entry.date}  ${kindLabel}  ${entry.category}  ${sign}${formatWon(entry.amount)}${memo}`
}

export function execute(ledger: Ledger, command: Command): ExecResult {
  switch (command.type) {
    case 'add': {
      const { type, ...input } = command
      const next = addEntry(ledger, input)
      const added = next.entries[next.entries.length - 1]
      const message = added === undefined ? '추가했습니다.' : `추가했습니다: ${formatEntry(added)}`
      return { ledger: next, message, changed: true }
    }
    case 'list': {
      const entries = sortedEntries(ledger)
      const message = entries.length === 0 ? '기록이 없습니다.' : entries.map(formatEntry).join('\n')
      return { ledger, message, changed: false }
    }
    case 'month': {
      const s = monthlySummary(ledger, command.month)
      const message = [
        `[${s.month}]`,
        `  수입 ${formatWon(s.income)}`,
        `  지출 ${formatWon(s.expense)}`,
        `  잔액 ${formatWon(s.balance)}`,
      ].join('\n')
      return { ledger, message, changed: false }
    }
    case 'category': {
      const totals = categoryTotals(ledger, command.month)
      const title = command.month === null ? '[전체 기간 카테고리별 지출]' : `[${command.month} 카테고리별 지출]`
      const lines = totals.map((t) => `  ${t.category}  ${formatWon(t.total)}`)
      const message = totals.length === 0 ? `${title}\n  지출 기록이 없습니다.` : [title, ...lines].join('\n')
      return { ledger, message, changed: false }
    }
    case 'delete': {
      const next = removeEntry(ledger, command.id)
      if (next === null) {
        return { ledger, message: `#${command.id} 기록이 없습니다.`, changed: false }
      }
      return { ledger: next, message: `#${command.id} 기록을 지웠습니다.`, changed: true }
    }
    case 'help':
      return { ledger, message: HELP_TEXT, changed: false }
    case 'quit':
      // quit는 main.ts에서 먼저 처리하므로 여기까지 오지 않지만, 빠짐없이 다룹니다.
      return { ledger, message: '종료합니다.', changed: false }
    default: {
      // 새 명령을 Command에 추가하고 여기서 처리하지 않으면 컴파일 에러가 납니다.
      const unreachable: never = command
      return unreachable
    }
  }
}
