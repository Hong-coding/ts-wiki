---
title: "프로젝트 1: 콘솔 가계부 (Node CLI)"
---

# 프로젝트 1: 콘솔 가계부 (Node CLI)

<LessonMeta level="실전" :minutes="180" prev="Part 7에서 좋은 타입 설계 원칙과 실전 프레임워크 사용법" />

첫 프로젝트는 터미널(검은 화면)에서 돌아가는 **가계부 프로그램**입니다. 화면 꾸미기가 전혀 없어서 오로지 "데이터를 타입으로 설계하고, 입력을 검증하고, 파일에 저장하는" 일에만 집중할 수 있습니다. 이 프로젝트에서 익힌 구조(타입 → 순수 로직 → 입출력)는 뒤의 세 프로젝트에서도 그대로 반복됩니다.

## 완성하면 이렇게 됩니다

`npm start`로 실행하고 `>` 뒤에 명령을 입력합니다. 입력한 내용은 `budget.json` 파일에 저장되어, 프로그램을 껐다 켜도 남아 있습니다.

```text
$ npm start

가계부를 불러왔습니다: budget.json (기록 0건)
명령 목록
  add <수입|지출> <금액> <카테고리> [YYYY-MM-DD] [메모]   기록 추가
  list                                                    전체 목록
  month <YYYY-MM>                                         월별 합계
  category [YYYY-MM]                                      카테고리별 지출
  delete <번호>                                           기록 삭제
  help                                                    도움말
  quit                                                    종료
> add 수입 3,000,000 급여 2026-10-25 10월 월급
추가했습니다: #1  2026-10-25  수입  급여  +3,000,000원 (10월 월급)
> add 지출 12000 식비 2026-10-25 점심
추가했습니다: #2  2026-10-25  지출  식비  -12,000원 (점심)
> add 지출 45000 교통 2026-10-26
추가했습니다: #3  2026-10-26  지출  교통  -45,000원
> add 지출 8000 식비 2026-10-26 커피 두 잔
추가했습니다: #4  2026-10-26  지출  식비  -8,000원 (커피 두 잔)
> add 지출 -5 식비
⚠ 금액은 1 이상 10억 이하의 정수여야 합니다: -5
> add 지출 1000 식비 2026-02-30
⚠ 없는 날짜입니다: 2026-02-30
> month 2026-10
[2026-10]
  수입 3,000,000원
  지출 65,000원
  잔액 2,935,000원
> category 2026-10
[2026-10 카테고리별 지출]
  교통  45,000원
  식비  20,000원
> delete 4
#4 기록을 지웠습니다.
> quit
가계부를 종료합니다.
```

## 요구사항

꼭 만들어야 하는 기능입니다. 설계를 시작하기 전에 한 번 소리 내어 읽어 보세요.

1. **기록 추가**: `add 수입 50000 용돈` 또는 `add 지출 12000 식비 2026-10-25 점심`처럼 종류·금액·카테고리를 받고, 날짜와 메모는 생략할 수 있습니다. 날짜를 생략하면 오늘 날짜를 씁니다.
2. **목록 보기**: `list`로 모든 기록을 날짜순으로 보여 줍니다.
3. **월별 합계**: `month 2026-10`으로 그 달의 수입·지출·잔액을 보여 줍니다.
4. **카테고리별 합계**: `category`(전체 기간) 또는 `category 2026-10`(그 달)로 카테고리별 지출 합계를 큰 금액부터 보여 줍니다.
5. **삭제**: `delete 3`으로 3번 기록을 지웁니다. 없는 번호면 알려 줍니다.
6. **저장/불러오기**: 기록이 바뀔 때마다 JSON 파일에 저장하고, 시작할 때 불러옵니다. 파일이 없으면 빈 가계부로 시작합니다.
7. **입력 검증**: 금액은 1 이상 10억 이하의 정수(쉼표 허용), 날짜는 실제로 있는 날짜(`2026-02-30` 거부), 월은 `01`~`12`만 받습니다. 잘못된 입력에도 프로그램이 죽지 않고 이유를 알려 줍니다.
8. **의존성 최소**: `typescript`, `tsx`, `@types/node` 세 개만 씁니다.

## 필요한 지식

막히면 아래 레슨으로 돌아가 해당 부분만 다시 보고 오세요.

- 배열 메서드 `map`·`filter`·`reduce`: [배열과 배열 메서드](../part1-basics/07-arrays)
- 객체 스프레드로 "새 객체 만들기": [객체](../part1-basics/08-objects)
- 리터럴 유니온(`'income' | 'expense'`): [유니온 타입과 리터럴 타입](../part2-types/06-union-literal)
- 판별 유니온과 `never` 완전성 검사: [판별 유니온과 완전성 검사](../part3-intermediate/03-discriminated-union)
- `Omit`, `Record`, `Partial`: [내장 유틸리티 타입 총정리](../part3-intermediate/07-utility-types)
- `import type`: [모듈](../part3-intermediate/09-modules)
- `async/await`와 오류 처리: [async/await와 비동기 오류 처리](../part4-async/03-async-await)
- `unknown` 값을 검사해 좁히기: [런타임 검증](../part4-async/05-runtime-validation), [사용자 정의 타입 가드](../part5-advanced/06-type-guards-satisfies)
- `Map`과 JSON: [JSON · Date · Map · Set](../part4-async/06-json-date-map-set)
- `tsx`로 바로 실행하기: [빌드 도구](../part6-tooling/06-build-tools)

## 설계하기

::: tip 먼저 스스로 해 보세요
아래를 읽기 전에 종이나 빈 파일에 "가계부 한 줄은 어떤 정보를 가져야 할까?", "사용자가 입력할 수 있는 명령은 몇 종류이고 각각 무엇이 필요할까?"를 타입으로 적어 보세요. 10분이면 충분합니다. 그다음 아래 설계와 비교합니다.
:::

### 데이터 타입

가계부 한 줄(거래 기록, entry)에는 번호, 종류(수입/지출), 금액, 카테고리, 날짜, 메모가 필요합니다. 종류는 두 가지뿐이므로 `string`이 아니라 **리터럴 유니온** `'income' | 'expense'`로 정합니다. 그래야 `'incom'` 같은 오타를 컴파일러가 잡아 줍니다.

```ts
export type EntryKind = 'income' | 'expense'

export interface Entry {
  id: number
  kind: EntryKind
  amount: number // 원 단위 정수
  category: string
  date: string // 'YYYY-MM-DD'
  memo: string // 없으면 빈 문자열
}

export interface Ledger {
  nextId: number // 다음 기록에 줄 번호
  entries: Entry[]
}
```

`memo`를 `memo?: string`(선택 속성)이 아니라 "없으면 빈 문자열"로 정한 이유는, JSON 파일로 저장했다 불러올 때 모양이 항상 같아서 검사가 단순해지기 때문입니다. `nextId`를 따로 두는 이유는 "마지막 id + 1"로 계산하면 마지막 기록을 지웠을 때 같은 번호가 다시 나오기 때문입니다.

### 명령 타입: 판별 유니온

명령마다 필요한 정보가 다릅니다. `add`는 여섯 가지, `month`는 월 하나, `list`는 아무것도 필요 없습니다. 이럴 때 쓰는 것이 **판별 유니온**(discriminated union, 공통 속성 하나로 어느 모양인지 구분하는 유니온)입니다. 여기서 공통 속성은 `type`입니다.

```ts
export type Command =
  | { type: 'add'; kind: EntryKind; amount: number; category: string; date: string; memo: string }
  | { type: 'list' }
  | { type: 'month'; month: string }
  | { type: 'category'; month: string | null }
  | { type: 'delete'; id: number }
  | { type: 'help' }
  | { type: 'quit' }
```

입력 한 줄을 해석하면 "성공(명령)" 또는 "실패(이유)" 둘 중 하나가 나옵니다. 이것도 판별 유니온으로 표현합니다. 이번에는 `ok`가 판별 속성입니다.

```ts
export type ParseResult =
  | { ok: true; command: Command }
  | { ok: false; message: string }
```

예외(`throw`)를 쓰지 않고 결과 타입으로 실패를 돌려주면, 호출하는 쪽이 `if (!parsed.ok)`로 실패를 **반드시** 처리하게 됩니다. `parsed.command`는 `ok`가 `true`로 좁혀진 뒤에만 꺼낼 수 있기 때문입니다.

### 파일(모듈) 나누기

```text
src/
  types.ts     모든 타입
  budget.ts    계산 로직(순수 함수): 추가·삭제·정렬·합계·금액 포맷
  parse.ts     입력 한 줄 → ParseResult (검증 담당)
  commands.ts  Command 실행 → 새 가계부 + 보여 줄 메시지
  storage.ts   JSON 파일 읽기/쓰기 (unknown 검사)
  main.ts      readline 입력 반복 (프로그램 시작점)
```

흐름은 한 방향입니다.

```text
키보드 한 줄 ─▶ parse.ts ─▶ Command ─▶ commands.ts(budget.ts 사용) ─▶ 새 Ledger + 메시지
                                                                       │
                                               화면 출력 ◀──────────────┤
                                               storage.ts로 저장 ◀──────┘
```

**순수 함수**(pure function, 같은 입력에 항상 같은 결과를 내고 바깥 세상을 건드리지 않는 함수)인 `budget.ts`·`parse.ts`·`commands.ts`는 화면도 파일도 모릅니다. 그래서 키보드 없이도 바로 실행해 확인할 수 있습니다. 입출력은 `main.ts`와 `storage.ts`에만 모았습니다.

## 단계별 구현

### Step 1. 프로젝트 만들기

**목표**: TypeScript 파일을 컴파일 없이 바로 실행할 수 있는 빈 프로젝트를 만듭니다.

```bash
mkdir cli-budget
cd cli-budget
npm init -y
npm install -D typescript@~5.9.3 tsx @types/node
mkdir src
```

- `typescript`: 타입 검사기(`tsc`)
- `tsx`: `.ts` 파일을 바로 실행해 주는 도구. 타입 검사는 하지 않으므로 검사는 `tsc --noEmit`으로 따로 합니다.
- `@types/node`: `node:fs/promises`, `process` 같은 Node.js 기능의 타입 정보

작성 시점(2026-10) 기준 설치된 버전은 Node.js 24.13.1, typescript 5.9.3, tsx 4.23.15, @types/node 24.19.2입니다. `npm install -D typescript`처럼 버전 없이 설치하면 그때의 최신 메이저 버전(작성 시점 7.x)이 설치되므로, 이 위키의 기준인 5.x로 고정했습니다. 다른 도구는 버전이 조금 달라도 이 프로젝트는 그대로 동작합니다.

`package.json`을 아래처럼 고칩니다. `"type": "module"`은 이 프로젝트가 ESM(`import`/`export` 문법)을 쓴다는 표시입니다.

```json
{
  "name": "cli-budget",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "tsx src/main.ts",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "@types/node": "^24.19.2",
    "tsx": "^4.23.15",
    "typescript": "~5.9.3"
  }
}
```

`tsconfig.json`을 만듭니다.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022"],
    "types": ["node"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noEmit": true,
    "skipLibCheck": true,
    "verbatimModuleSyntax": true
  },
  "include": ["src"]
}
```

- `noUncheckedIndexedAccess`: 배열에서 `args[0]`처럼 꺼낸 값을 `string | undefined`로 봅니다. 사용자가 단어를 빼먹고 입력하는 일이 많은 CLI에서 특히 유용합니다.
- `noEmit`: JS 파일을 만들지 않고 검사만 합니다(실행은 `tsx`가 합니다).
- `verbatimModuleSyntax`: 타입만 가져올 때 `import type`을 쓰도록 강제합니다.

`.gitignore`도 만들어 둡니다.

```text
node_modules
dist
budget.json
```

**실행 확인**: `src/main.ts`에 `console.log('가계부 준비 완료')` 한 줄을 쓰고 `npm start`를 실행합니다.

```text
가계부 준비 완료
```

**체크포인트**
- [ ] `npm start`로 `.ts` 파일이 실행된다.
- [ ] `npm run typecheck`가 아무 메시지 없이 끝난다.

### Step 2. 타입 정의하기

**목표**: 설계한 타입을 `src/types.ts`에 옮겨 적습니다. 코드를 쓰기 전에 타입부터 정하면, 이후 단계에서 "무엇을 만들어야 하는지"를 타입이 알려 줍니다.

```ts
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
```

`MonthlySummary`와 `CategoryTotal`은 계산 결과의 모양입니다. 결과를 바로 문자열로 만들지 않고 객체로 돌려주면, 나중에 웹 화면에서 같은 계산을 재사용할 수 있습니다.

**체크포인트**
- [ ] `npm run typecheck`가 통과한다.
- [ ] `Command`의 각 모양에 `type`이 서로 다른 리터럴로 들어 있다.

### Step 3. 계산 로직(budget.ts)

**목표**: 기록 추가·삭제·정렬과 합계 계산을 순수 함수로 만듭니다.

```ts
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
```

눈여겨볼 곳:

- `addEntry`의 매개변수 `input: Omit<Entry, 'id'>`: "Entry에서 id만 뺀 모양"입니다. id는 가계부가 정하므로 호출하는 쪽이 넣지 못하게 막습니다.
- `addEntry`와 `removeEntry`는 원래 `ledger`를 고치지 않고 **새 객체**를 돌려줍니다. 이렇게 하면 "언제 데이터가 바뀌었나"를 추적하기 쉽고, 프로젝트 4의 zustand에서도 같은 방식을 씁니다.
- `removeEntry`는 없는 id면 `null`을 돌려줍니다. 반환 타입 `Ledger | null` 덕분에 호출하는 쪽은 `null` 검사를 빼먹을 수 없습니다.
- `sumBy`의 `kind: Entry['kind']`: 인덱스 접근 타입으로 `EntryKind`를 꺼냈습니다. `EntryKind`라고 써도 같습니다.
- `categoryTotals`는 `Map`으로 카테고리별 합계를 모은 뒤 `[...totals]`로 배열로 바꿔 정렬합니다.

**실행 확인**: 키보드 입력 없이 로직만 확인해 봅니다. `src/try-budget.ts`를 임시로 만들고 실행합니다.

```ts
// src/try-budget.ts (확인 후 지워도 됩니다)
import { addEntry, categoryTotals, createLedger, formatWon, monthlySummary } from './budget'

let ledger = createLedger()
ledger = addEntry(ledger, { kind: 'income', amount: 3000000, category: '급여', date: '2026-10-25', memo: '' })
ledger = addEntry(ledger, { kind: 'expense', amount: 12000, category: '식비', date: '2026-10-25', memo: '점심' })
ledger = addEntry(ledger, { kind: 'expense', amount: 45000, category: '교통', date: '2026-10-26', memo: '' })

console.log(monthlySummary(ledger, '2026-10'))
console.log(categoryTotals(ledger, null))
console.log(formatWon(2943000))
```

```bash
npx tsx src/try-budget.ts
```

```text
{ month: '2026-10', income: 3000000, expense: 57000, balance: 2943000 }
[ { category: '교통', total: 45000 }, { category: '식비', total: 12000 } ]
2,943,000원
```

**체크포인트**
- [ ] 위와 같은 결과가 나온다.
- [ ] `addEntry`에 `id`를 넣으면 에러가 나는지 직접 확인했다.

### Step 4. 입력 해석과 검증(parse.ts)

**목표**: 사용자가 입력한 문자열 한 줄을 `ParseResult`로 바꿉니다. **잘못된 입력은 모두 여기서 걸러 내므로**, 이후 단계의 코드는 "값이 올바르다"고 믿고 써도 됩니다.

```ts
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
```

눈여겨볼 곳:

- `const [name, ...args] = line.trim().split(/\s+/)`: 공백 여러 개를 기준으로 단어를 나눕니다. `noUncheckedIndexedAccess` 덕분에 `args[0]`은 `string | undefined`라서 "단어가 없을 때"를 처리하지 않으면 컴파일 에러가 납니다.
- `KIND_WORDS: Partial<Record<string, EntryKind>>`: 아무 문자열로 찾아도 결과가 `EntryKind | undefined`가 되도록 `Partial`을 붙였습니다. 그냥 `Record<string, EntryKind>`라면 `KIND_WORDS['저축']`도 `EntryKind`로 믿어 버립니다.
- `isValidDate`는 정규식으로 모양을 본 뒤, 실제 `Date`로 만들어 다시 문자열로 바꿨을 때 같은지 비교합니다. `2026-02-30`은 `Date`가 3월 2일로 바꿔 버리므로 비교에서 걸립니다.
- `parseCommand`의 두 번째 매개변수 `todayText`는 기본값이 `today()`입니다. 확인할 때 날짜를 고정해 넣을 수 있어서 결과가 매일 바뀌지 않습니다.

**실행 확인**

```ts
// src/try-parse.ts (확인 후 지워도 됩니다)
import { parseCommand } from './parse'

console.log(parseCommand('add 지출 12,000 식비 2026-10-25 점심 김밥'))
console.log(parseCommand('add 지출 0 식비'))
console.log(parseCommand('month 2026-13'))
console.log(parseCommand('add 수입 50000 용돈', '2026-10-26'))
```

```text
{
  ok: true,
  command: {
    type: 'add',
    kind: 'expense',
    amount: 12000,
    category: '식비',
    date: '2026-10-25',
    memo: '점심 김밥'
  }
}
{ ok: false, message: '금액은 1 이상 10억 이하의 정수여야 합니다: 0' }
{ ok: false, message: '사용법: month 2026-10' }
{
  ok: true,
  command: {
    type: 'add',
    kind: 'income',
    amount: 50000,
    category: '용돈',
    date: '2026-10-26',
    memo: ''
  }
}
```

**체크포인트**
- [ ] 메모에 띄어쓰기가 있어도 한 메모로 합쳐진다.
- [ ] 금액 `0`, `-5`, `abc`와 월 `2026-13`이 모두 거부된다.

### Step 5. 명령 실행(commands.ts)

**목표**: `Command`를 받아 새 가계부와 화면에 보여 줄 메시지를 돌려줍니다. `switch` 문으로 `command.type`을 나누면 각 `case` 안에서 `command`가 그 모양으로 **좁혀집니다**.

핵심은 마지막 `default` 부분입니다.

```ts
    default: {
      // 새 명령을 Command에 추가하고 여기서 처리하지 않으면 컴파일 에러가 납니다.
      const unreachable: never = command
      return unreachable
    }
```

모든 `case`를 처리했다면 `default`에 도착한 `command`의 타입은 "남은 것이 없음", 즉 `never`입니다. 그런데 `case 'help'`를 빠뜨리면 `command`는 `{ type: 'help' }`로 남아 있으므로 `never`에 넣을 수 없어 에러가 납니다.

```text
src/commands.ts(80,13): error TS2322: Type '{ type: "help"; }' is not assignable to type 'never'.
```

나중에 `edit` 같은 명령을 `Command`에 추가하면, 컴파일러가 "여기 처리 안 했어요"라고 알려 주는 안전장치입니다. 파일 전체는 [완성 코드](#완성-코드)에 있습니다.

`add` 처리에서 쓴 `const { type, ...input } = command`도 눈여겨보세요. 나머지 속성(`kind`·`amount`·`category`·`date`·`memo`)만 모은 `input`은 정확히 `Omit<Entry, 'id'>` 모양이라 `addEntry`에 그대로 넘길 수 있습니다. 이것이 **구조적 타이핑**(이름이 아니라 모양이 같으면 같은 타입으로 보는 규칙)입니다.

**체크포인트**
- [ ] `case` 하나를 일부러 지웠을 때 TS2322 에러가 나는 것을 확인했다.
- [ ] `delete`로 없는 번호를 주면 `changed: false`가 된다.

### Step 6. 파일 저장/불러오기(storage.ts)

**목표**: `node:fs/promises`로 JSON 파일을 읽고 씁니다. **파일에서 읽은 값은 믿지 않습니다.** 사람이 메모장으로 고쳤을 수도, 다른 프로그램이 망가뜨렸을 수도 있기 때문입니다.

```ts
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
```

눈여겨볼 곳:

- `JSON.parse`의 반환 타입은 `any`입니다. 그대로 쓰면 타입 검사가 꺼진 것과 같으므로 `const data: unknown = JSON.parse(text)`로 받아 **반드시 검사한 뒤** 씁니다.
- `isEntry`·`isLedger`는 `value is Entry` 형태의 **사용자 정의 타입 가드**입니다. `true`를 돌려주면 그 뒤로 컴파일러가 값을 `Entry`로 봅니다.
- `catch (error)`의 `error`는 `unknown`입니다(strict 모드의 `useUnknownInCatchVariables`). `error instanceof Error && 'code' in error`로 좁혀야 `error.code`를 읽을 수 있습니다.
- 파일이 없어서 나는 에러(`ENOENT`, "Error NO ENTry", 그런 항목이 없음)는 첫 실행이라 정상이므로 빈 가계부를 돌려주고, 나머지 에러는 다시 던집니다.

**체크포인트**
- [ ] 파일이 없을 때 빈 가계부가 만들어진다.
- [ ] `budget.json`의 `amount`를 `"만원"`으로 고치면 "형식이 올바르지 않습니다" 에러가 난다.

### Step 7. 입력 반복(main.ts)

**목표**: `node:readline/promises`로 한 줄씩 입력을 받아 Step 4~6을 연결합니다.

```ts
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
```

눈여겨볼 곳:

- `for await (const line of rl)`: readline 인터페이스는 "한 줄씩 비동기로 꺼낼 수 있는 대상"(async iterable)이라 `for await...of`로 반복할 수 있습니다. 입력이 끝나면 반복도 끝납니다.
- `parsed.ok`를 검사한 뒤에야 `parsed.command`를 쓸 수 있습니다. `if (!parsed.ok)` 블록 안에서는 `parsed.message`만 있습니다.
- `result.changed`가 `true`일 때만 저장해서 `list`처럼 읽기만 하는 명령은 파일을 건드리지 않습니다.
- `main().catch(...)`: 파일 형식 오류처럼 처리하지 못한 에러를 받아 사람이 읽을 수 있는 메시지로 보여 주고 종료 코드를 1로 정합니다.

**실행 확인**: `npm start`로 실행해 [완성하면 이렇게 됩니다](#완성하면-이렇게-됩니다)의 입력을 그대로 따라 해 봅니다. 키보드 대신 파이프로 한 번에 넣어 확인할 수도 있습니다(이때는 화면에 `>`가 처음 한 번만 보입니다).

```bash
printf 'add 지출 12000 식비 2026-10-25 점심\nlist\nquit\n' | npx tsx src/main.ts test.json
```

**체크포인트**
- [ ] 잘못된 명령을 넣어도 프로그램이 꺼지지 않는다.
- [ ] 껐다 켰을 때 기록이 남아 있다.
- [ ] `npm run typecheck`가 0 에러로 끝난다.

## 자주 막히는 곳

**1. `args[0]`을 바로 `string` 변수에 넣었더니 에러가 납니다.**

```ts
const [name] = line.trim().split(/\s+/)
const month: string = name
// ❌ Type 'string | undefined' is not assignable to type 'string'. (TS2322)
```

`noUncheckedIndexedAccess`를 켰기 때문입니다. 배열에 그 칸이 없을 수도 있으니 `undefined` 검사(`if (month === undefined)`)나 기본값(`args[0] ?? null`)을 먼저 처리합니다.

**2. `catch`에서 `error.code`를 읽을 수 없습니다.**

```ts
try {
  text = await readFile(path, 'utf-8')
} catch (error) {
  if (error.code === 'ENOENT') return createLedger()
  // ❌ 'error' is of type 'unknown'. (TS18046)
}
```

`throw`에는 어떤 값이든 던질 수 있어서 `error`는 `unknown`입니다. `error instanceof Error && 'code' in error`로 좁힌 뒤 읽습니다.

**3. `JSON.parse` 결과에 오타를 내도 에러가 안 납니다.**

`JSON.parse`는 `any`를 돌려주므로 `data.entriess`처럼 써도 컴파일러가 아무 말도 하지 않고, 실행 중에 터집니다. 반드시 `unknown`으로 받고 타입 가드로 검사합니다.

**4. 파이프 입력에서 `ERR_USE_AFTER_CLOSE` 에러가 납니다.**

입력이 끝나 readline이 닫힌 뒤 `rl.prompt()`를 부르면 생기는 에러입니다. 완성 코드처럼 `close` 이벤트에서 `closed = true`를 기록하고, 닫혔으면 `prompt()`를 부르지 않습니다.

**5. `import`에서 `Cannot find module`이 나거나 `import type` 에러가 납니다.**

`verbatimModuleSyntax`를 켜면 타입만 가져올 때 `import type { Entry } from './types'`처럼 써야 합니다. 값(함수)과 타입을 같이 가져올 때는 `import { addEntry, type Entry } from './budget'`처럼 섞어 쓸 수도 있습니다.

**6. 한글이 깨져 보입니다(Windows).**

Windows 예전 콘솔은 코드 페이지가 UTF-8이 아닐 수 있습니다. Windows Terminal이나 VS Code 터미널을 쓰거나, 명령 프롬프트에서 `chcp 65001`을 먼저 실행합니다.

## 도전 과제

1. ⭐ `budget` 명령을 추가해 카테고리별 월 예산을 정하고, `category` 결과에 "예산 대비 사용률(%)"을 함께 보여 주세요. `Command`에 새 모양을 추가하면 `commands.ts`의 `never` 검사가 어디를 고쳐야 하는지 알려 줍니다.
2. ⭐ `edit 3 amount 15000`처럼 기록을 고치는 명령을 만드세요. 고칠 수 있는 필드 이름을 `keyof Entry`에서 `'id'`를 뺀 리터럴 유니온으로 제한해 보세요.
3. ⭐⭐ `search 커피`로 메모나 카테고리에 단어가 들어간 기록만 보여 주세요.
4. ⭐⭐ `export 2026-10`으로 그 달 기록을 CSV 파일(`2026-10.csv`)로 저장하세요. 메모에 쉼표가 있을 때 어떻게 할지도 정해 보세요.
5. ⭐⭐⭐ `storage.ts`의 직접 만든 타입 가드를 zod 스키마로 바꾸고, `z.infer`로 `Entry` 타입을 스키마에서 뽑아 보세요. 타입과 검사 코드가 따로 놀 위험이 사라집니다.

## 완성 코드

전체 코드는 위키 저장소의 `examples/projects/01-cli-budget/` 폴더에 있습니다. 실행 방법은 다음과 같습니다.

```bash
cd examples/projects/01-cli-budget
npm install
npm run typecheck   # 타입 검사 (0 에러)
npm start           # budget.json 사용
npm start -- my.json   # 다른 파일 사용
```

::: details src/types.ts
```ts
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
```
:::

::: details src/budget.ts
```ts
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
```
:::

::: details src/parse.ts
```ts
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
```
:::

::: details src/commands.ts
```ts
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
```
:::

::: details src/storage.ts
```ts
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
```
:::

::: details src/main.ts
```ts
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
```
:::

## 회고 질문

다 만들었다면 아래 질문에 스스로 답해 보세요. 글로 적어 두면 다음 프로젝트에서 큰 도움이 됩니다.

1. `Command`를 판별 유니온 대신 `{ type: string; amount?: number; month?: string; ... }` 하나로 만들었다면 `commands.ts`가 어떻게 달라졌을까요?
2. 검증을 `parse.ts` 한곳에 모은 것의 장점은 무엇인가요? 검증이 여러 파일에 흩어져 있다면 어떤 문제가 생길까요?
3. `budget.ts`가 화면 출력과 파일을 모르게 만든 덕분에 어떤 확인을 쉽게 할 수 있었나요?
4. `JSON.parse` 결과를 `as Ledger`로 단언하는 것과 타입 가드로 검사하는 것은 실행 중에 어떤 차이가 있나요?
5. 이 프로그램을 웹 화면으로 바꾼다면 어느 파일을 그대로 쓰고, 어느 파일을 새로 만들어야 할까요? (프로젝트 2에서 직접 확인합니다.)
