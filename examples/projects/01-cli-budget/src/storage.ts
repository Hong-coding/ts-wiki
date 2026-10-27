// 가계부를 JSON 파일로 저장하고 불러옵니다.
import { readFile, writeFile } from 'node:fs/promises'
import { createLedger } from './budget'
import type { Entry, Ledger } from './types'

/** 파일에서 읽은 값(unknown)이 Entry 모양인지 검사하는 타입 가드 */
function isEntry(value: unknown): value is Entry {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.id === 'number' &&
    (v.kind === 'income' || v.kind === 'expense') &&
    typeof v.amount === 'number' &&
    typeof v.category === 'string' &&
    typeof v.date === 'string' &&
    typeof v.memo === 'string'
  )
}

function isLedger(value: unknown): value is Ledger {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return typeof v.nextId === 'number' && Array.isArray(v.entries) && v.entries.every(isEntry)
}

/** 파일이 없으면 빈 가계부를, 내용이 깨졌으면 에러를 던집니다. */
export async function loadLedger(path: string): Promise<Ledger> {
  let text: string
  try {
    text = await readFile(path, 'utf-8')
  } catch (error) {
    // 처음 실행이라 파일이 없는 경우(ENOENT)는 정상입니다.
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return createLedger()
    }
    throw error
  }

  const data: unknown = JSON.parse(text)
  if (!isLedger(data)) {
    throw new Error(`${path} 파일의 형식이 올바르지 않습니다.`)
  }
  return data
}

export async function saveLedger(path: string, ledger: Ledger): Promise<void> {
  // 사람이 열어 봐도 읽기 쉽도록 2칸 들여쓰기로 저장합니다.
  await writeFile(path, JSON.stringify(ledger, null, 2) + '\n', 'utf-8')
}
