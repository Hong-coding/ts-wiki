// 사용자가 입력한 한 줄을 Command로 바꿉니다. 잘못된 입력은 여기서 모두 걸러 냅니다.
import type { EntryKind, ParseResult } from './types'

const KIND_WORDS: Partial<Record<string, EntryKind>> = {
  income: 'income',
  수입: 'income',
  expense: 'expense',
  지출: 'expense',
}

/** 'YYYY-MM-DD'이면서 실제로 있는 날짜인지 검사합니다. (2026-02-30 같은 날짜는 거부) */
export function isValidDate(text: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return false
  const date = new Date(`${text}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === text
}

/** 'YYYY-MM' 형식인지 검사합니다. */
export function isValidMonth(text: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(text)
}

/** 오늘 날짜를 'YYYY-MM-DD'로 (내 컴퓨터 시간대 기준) */
export function today(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

/** 금액 문자열을 검사해 숫자로 바꿉니다. 쉼표(3,000)는 허용합니다. */
function parseAmount(text: string): number | null {
  const cleaned = text.replaceAll(',', '')
  if (!/^\d+$/.test(cleaned)) return null
  const amount = Number(cleaned)
  if (amount <= 0 || amount > 1_000_000_000) return null
  return amount
}

export function parseCommand(line: string, todayText: string = today()): ParseResult {
  // 앞뒤 공백을 지우고, 공백 여러 개를 기준으로 나눕니다.
  const [name, ...args] = line.trim().split(/\s+/)

  switch (name) {
    case '':
      return { ok: false, message: '명령을 입력해 주세요. 도움말은 help 입니다.' }
    case 'help':
      return { ok: true, command: { type: 'help' } }
    case 'quit':
    case 'exit':
      return { ok: true, command: { type: 'quit' } }
    case 'list':
      return { ok: true, command: { type: 'list' } }
    case 'month': {
      const month = args[0]
      if (month === undefined || !isValidMonth(month)) {
        return { ok: false, message: '사용법: month 2026-10' }
      }
      return { ok: true, command: { type: 'month', month } }
    }
    case 'category': {
      const month = args[0] ?? null
      if (month !== null && !isValidMonth(month)) {
        return { ok: false, message: '사용법: category [2026-10]' }
      }
      return { ok: true, command: { type: 'category', month } }
    }
    case 'delete': {
      const id = Number(args[0])
      if (!Number.isInteger(id) || id <= 0) {
        return { ok: false, message: '사용법: delete 3 (지울 기록의 번호)' }
      }
      return { ok: true, command: { type: 'delete', id } }
    }
    case 'add':
      return parseAdd(args, todayText)
    default:
      return { ok: false, message: `알 수 없는 명령입니다: ${name}. 도움말은 help 입니다.` }
  }
}

/** add <수입|지출> <금액> <카테고리> [날짜] [메모...] */
function parseAdd(args: string[], todayText: string): ParseResult {
  const usage = '사용법: add <수입|지출> <금액> <카테고리> [YYYY-MM-DD] [메모]'
  const [kindText, amountText, category, ...rest] = args
  if (kindText === undefined || amountText === undefined || category === undefined) {
    return { ok: false, message: usage }
  }

  const kind = KIND_WORDS[kindText]
  if (kind === undefined) {
    return { ok: false, message: `종류는 수입 또는 지출이어야 합니다: ${kindText}` }
  }

  const amount = parseAmount(amountText)
  if (amount === null) {
    return { ok: false, message: `금액은 1 이상 10억 이하의 정수여야 합니다: ${amountText}` }
  }

  // 남은 첫 단어가 날짜 모양이면 날짜로, 아니면 메모의 일부로 봅니다.
  let date = todayText
  const first = rest[0]
  if (first !== undefined && /^\d{4}-\d{2}-\d{2}$/.test(first)) {
    if (!isValidDate(first)) {
      return { ok: false, message: `없는 날짜입니다: ${first}` }
    }
    date = first
    rest.shift()
  }

  return {
    ok: true,
    command: { type: 'add', kind, amount, category, date, memo: rest.join(' ') },
  }
}
