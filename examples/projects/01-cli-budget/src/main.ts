// 프로그램 시작점: 파일을 불러오고, 한 줄씩 입력을 받아 명령을 실행합니다.
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { execute, HELP_TEXT } from './commands'
import { parseCommand } from './parse'
import { loadLedger, saveLedger } from './storage'

// 실행할 때 파일 경로를 주면 그 파일을, 아니면 budget.json을 씁니다.
const filePath = process.argv[2] ?? 'budget.json'

async function main(): Promise<void> {
  let ledger = await loadLedger(filePath)
  console.log(`가계부를 불러왔습니다: ${filePath} (기록 ${ledger.entries.length}건)`)
  console.log(HELP_TEXT)

  const rl = createInterface({ input, output })
  // 입력이 먼저 끝나면(Ctrl+D, 파이프 입력) readline이 닫힙니다.
  // 닫힌 뒤에 prompt()를 부르면 에러가 나므로 상태를 기억해 둡니다.
  let closed = false
  rl.on('close', () => {
    closed = true
  })
  const showPrompt = (): void => {
    if (!closed) rl.prompt()
  }
  rl.setPrompt('> ')
  showPrompt()

  // 한 줄 입력될 때마다 반복합니다. 입력이 끝나면(Ctrl+D 등) 반복도 끝납니다.
  for await (const line of rl) {
    const parsed = parseCommand(line)
    if (!parsed.ok) {
      console.log(`⚠ ${parsed.message}`)
      showPrompt()
      continue
    }
    if (parsed.command.type === 'quit') {
      break
    }

    const result = execute(ledger, parsed.command)
    ledger = result.ledger
    console.log(result.message)
    if (result.changed) {
      await saveLedger(filePath, ledger)
    }
    showPrompt()
  }

  rl.close()
  console.log('가계부를 종료합니다.')
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`오류: ${message}`)
  process.exitCode = 1
})
