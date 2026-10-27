---
title: ESLint(typescript-eslint)와 Prettier
---

# ESLint(typescript-eslint)와 Prettier

<LessonMeta level="실전" :minutes="40" prev="CommonJS와 ESM, package.json type, module·moduleResolution 고르기" />

## 이번에 배울 것

- 타입 검사기(`tsc`)·린터(ESLint)·포매터(Prettier)가 각각 무엇을 맡는지 구분할 수 있다.
- typescript-eslint의 **flat config**(`eslint.config.js`)를 직접 작성할 수 있다.
- `recommended`·`strict`·`type-checked` 설정 묶음의 차이를 알고 골라 쓸 수 있다.
- `eslint-config-prettier`로 ESLint와 Prettier가 다투지 않게 역할을 나눌 수 있다.
- VS Code에서 저장할 때 자동으로 정리되도록 `settings.json`을 설정할 수 있다.

## 먼저 알아 둘 것

- [개발 환경 설치](../part0-start/03-setup) — VS Code에 ESLint·Prettier 확장 설치
- [tsconfig.json 완전 정복](./01-tsconfig)
- [모듈 시스템](./03-module-systems) — 이 레슨의 설정 파일은 ESM(`"type": "module"`) 기준입니다.

이 레슨은 작성 시점(2026-10)에 아래 버전으로 실제 프로젝트를 만들어 린트·포맷 결과를 확인했습니다.

| 패키지 | 버전 | 공식 문서 |
|---|---|---|
| `eslint` | 10.13.0 | [eslint.org](https://eslint.org/docs/latest/) |
| `@eslint/js` | 10.0.1 | (ESLint 기본 규칙 묶음) |
| `typescript-eslint` | 8.72.1 | [typescript-eslint.io](https://typescript-eslint.io/getting-started) |
| `prettier` | 3.9.10 | [prettier.io](https://prettier.io/docs/) |
| `eslint-config-prettier` | 10.1.8 | [GitHub](https://github.com/prettier/eslint-config-prettier) |
| `typescript` | 5.9.3 | |

::: warning typescript-eslint가 지원하는 TypeScript 버전
작성 시점 typescript-eslint 8.72.x는 `typescript` **4.8.4 이상 6.1 미만**만 지원합니다(`peerDependencies`). 버전을 지정하지 않고 `npm install -D typescript`를 하면 최신 7.0.2가 설치될 수 있는데, 이때 typescript-eslint가 제대로 동작하지 않습니다. 이 레슨처럼 `typescript@5`(작성 시점 5.9.3)로 고정해 설치하세요. 참고로 `npm install -D typescript eslint typescript-eslint`처럼 한 번에 설치하면 npm이 지원 범위 안의 6.0.3을 골라 주기도 합니다(작성 시점 실제 확인).
:::

## 비유로 이해하기

매장에서 신상품을 진열하기 전에 세 사람이 차례로 확인한다고 해 봅시다.

- **검수 담당**(`tsc`)은 "상자 안의 물건이 송장과 맞는가"를 봅니다. 사과 상자에 배가 들어 있으면 반품입니다. → 타입 오류
- **점장**(ESLint)은 "규칙상 문제가 될 만한 진열"을 봅니다. 유통기한 확인을 안 한 상품, 계산대에 올려놓고 잊어버린 상품 같은 것입니다. 규칙 위반은 아니어도 **사고로 이어지기 쉬운 습관**을 잡습니다. → 버그 가능성이 높은 코드
- **진열 담당**(Prettier)은 "가격표 위치, 줄 간격"을 통일합니다. 내용은 건드리지 않고 **모양만** 맞춥니다. → 코드 서식

세 사람이 각자 자기 일만 하면 빠르고 다툼이 없습니다. 점장이 가격표 위치까지 간섭하기 시작하면 진열 담당과 계속 부딪힙니다. 그래서 ESLint에서 서식 관련 규칙은 끄고 Prettier에게 맡깁니다.

## 개념 설명

### 1단계: 세 도구의 역할 분담

| 도구 | 잡는 것 | 예 | 자동 수정 |
|---|---|---|---|
| `tsc` | 타입이 맞지 않는 코드 | `number`에 문자열 넣기 | 안 함 |
| ESLint + typescript-eslint | 타입은 맞지만 **버그일 가능성이 높은** 코드, 팀 규칙 위반 | `await` 빠뜨린 Promise, `==` 사용, 직접 쓴 `any`, 안 쓰는 변수 | 일부 규칙(`--fix`) |
| Prettier | 서식(들여쓰기, 따옴표, 세미콜론, 줄바꿈) | 4칸/2칸 들여쓰기 섞임 | 전부 |

**린터**(linter)는 "보풀(lint)을 떼어 내는 도구"라는 뜻으로, 실행하지 않고 코드를 읽어 의심스러운 부분을 알려 줍니다. **포매터**(formatter)는 코드 모양을 정해진 규칙대로 다시 써 줍니다.

### 2단계: 설치

```powershell
mkdir order-lint
cd order-lint
npm init -y
npm pkg set type=module
npm install -D typescript@5 @types/node@22 eslint @eslint/js typescript-eslint prettier eslint-config-prettier
```

macOS·Linux에서도 명령은 같습니다. `tsconfig.json`은 [01 레슨](./01-tsconfig)의 Node 앱 추천 설정을 그대로 씁니다.

### 3단계: 첫 flat config — recommended

ESLint 9부터 설정 파일은 **flat config**(평평한 설정)라고 부르는 `eslint.config.js` 하나입니다. 예전의 `.eslintrc.json`과 달리, **설정 객체의 배열**을 내보내고 위에서 아래로 차례로 덮어씁니다. ESLint 10에서는 옛 `.eslintrc` 형식을 더 이상 읽지 않습니다.

```js
// eslint.config.js
// @ts-check
import eslint from '@eslint/js'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'

export default defineConfig(
  { ignores: ['dist/**'] }, // 검사하지 않을 폴더
  eslint.configs.recommended, // JS 기본 추천 규칙
  tseslint.configs.recommended, // TypeScript 추천 규칙
)
```

- `// @ts-check`는 이 JS 파일도 TypeScript로 검사하라는 표시입니다([07 레슨](./07-migration)에서 자세히). 설정 오타를 편집기에서 바로 잡아 줍니다.
- `defineConfig`는 배열을 만들어 주는 도우미 함수입니다. 자동 완성이 되고, 중첩 배열도 알아서 펼쳐 줍니다.
- `"type": "module"` 프로젝트라 `.js`에서 `import`를 쓸 수 있습니다. CommonJS 프로젝트라면 파일 이름을 `eslint.config.mjs`로 합니다.

검사할 코드를 하나 만듭니다.

```ts
// src/order.ts
export interface Order {
  id: string
  total: number
}

export function parseOrder(json: string): any {
  return JSON.parse(json)
}

export async function fetchOrder(id: string): Promise<Order> {
  return { id, total: 9500 }
}

export function summary(order: Order) {
  const unused = 1
  fetchOrder(order.id)
  if (order.total == 0) return '무료'
  return `${order.id}: ${order.total}`
}
```

이 코드는 `tsc --noEmit`을 **에러 없이 통과**합니다. ESLint를 돌려 봅시다.

```powershell
npx eslint .
```

```text
src\order.ts
   6:43  error  Unexpected any. Specify a different type     @typescript-eslint/no-explicit-any
  15:9   error  'unused' is assigned a value but never used  @typescript-eslint/no-unused-vars

✖ 2 problems (2 errors, 0 warnings)
```

`recommended`는 **타입 정보 없이** 코드 모양만 보고 판단하는 규칙들이라 빠르지만, 잡는 범위가 제한적입니다. 16번째 줄에서 `await` 없이 부른 `fetchOrder`나 `==` 비교는 그냥 지나갔습니다.

### 4단계: 설정 묶음 고르기 — recommended · strict · type-checked

typescript-eslint는 여러 **설정 묶음**(shared config)을 제공합니다.

| 묶음 | 내용 | 타입 정보 필요 |
|---|---|---|
| `recommended` | 대부분의 프로젝트에 맞는 기본 규칙 | 아니요 |
| `strict` | `recommended` + 더 엄격한 규칙(의견이 갈릴 수 있음) | 아니요 |
| `stylistic` | 일관된 문법 스타일(`interface` vs `type` 등). 서식이 아님 | 아니요 |
| `recommendedTypeChecked` | `recommended` + 타입 정보를 쓰는 규칙 | **예** |
| `strictTypeChecked` | `strict` + 타입 정보를 쓰는 규칙 | **예** |
| `stylisticTypeChecked` | `stylistic` + 타입 정보를 쓰는 규칙 | **예** |

**타입 정보를 쓰는 규칙**(type-aware rule)은 ESLint가 TypeScript 컴파일러에게 "이 값의 타입이 뭐야?"라고 물어 가며 검사합니다. 그래서 "이 값이 Promise인데 `await`를 안 했다", "이 값은 `any`인데 속성에 접근했다" 같은 것을 잡습니다. 대신 프로젝트가 크면 린트가 느려집니다.

**추천**: 새 프로젝트라면 `strictTypeChecked` + `stylisticTypeChecked`로 시작하고, 너무 시끄러운 규칙만 끕니다. 오래된 프로젝트라면 `recommendedTypeChecked`부터 시작합니다.

### 5단계: 추천 설정 전체

```js
// eslint.config.js
// @ts-check
import eslint from '@eslint/js'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'
import prettierConfig from 'eslint-config-prettier'

export default defineConfig(
  // 1) 검사하지 않을 폴더
  { ignores: ['dist/**', 'coverage/**'] },

  // 2) JS 기본 추천 규칙
  eslint.configs.recommended,

  // 3) TypeScript 규칙 (타입 정보를 쓰는 엄격한 묶음)
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true, // tsconfig.json을 자동으로 찾아 타입 정보를 씀
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // 4) 팀 규칙 추가·조정
  {
    rules: {
      eqeqeq: ['error', 'always'],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },

  // 5) 설정 파일 같은 JS 파일에는 타입 기반 규칙을 끔
  {
    files: ['**/*.js', '**/*.mjs'],
    extends: [tseslint.configs.disableTypeChecked],
  },

  // 6) 서식 관련 규칙 끄기 (Prettier와 충돌 방지) — 항상 마지막
  prettierConfig,
)
```

- `projectService: true`(typescript-eslint 8부터 권장)는 각 파일에 맞는 `tsconfig.json`을 알아서 찾아 줍니다.
- 뒤에 오는 설정이 앞을 덮어쓰므로, **팀 규칙은 묶음 뒤에, `prettierConfig`는 맨 뒤에** 둡니다.
- `eqeqeq`는 ESLint 기본 규칙입니다. `==`는 `0 == ''`가 `true`가 되는 등 자동 형 변환이 일어나므로 `===`만 쓰게 합니다.

같은 `src/order.ts`를 다시 검사하면:

```text
src\order.ts
   6:43  error  Unexpected any. Specify a different type                       @typescript-eslint/no-explicit-any
  10:8   error  Async function 'fetchOrder' has no 'await' expression          @typescript-eslint/require-await
  15:9   error  'unused' is assigned a value but never used                    @typescript-eslint/no-unused-vars
  16:3   error  Promises must be awaited, end with a call to .catch, end with a call to .then with a rejection handler or be explicitly marked as ignored with the `void` operator  @typescript-eslint/no-floating-promises
  17:19  error  Expected '===' and instead saw '=='                            eqeqeq
  18:26  error  Invalid type "number" of template literal expression           @typescript-eslint/restrict-template-expressions

✖ 6 problems (6 errors, 0 warnings)
```

2개였던 문제가 6개로 늘었습니다. 하나씩 보면:

- `no-floating-promises` — **가장 중요한 규칙**입니다. `await` 없이 부른 비동기 함수가 실패하면 아무도 그 에러를 받지 못합니다(처리되지 않은 거부). 주문 저장이 실패했는데 화면에는 성공으로 보이는 버그의 흔한 원인입니다.
- `require-await` — `async`인데 `await`가 없으면 `async`가 필요 없거나, `await`를 빠뜨렸을 가능성이 큽니다.
- `restrict-template-expressions` — 템플릿 리터럴에 문자열이 아닌 값을 넣으면 경고합니다. `strict` 묶음은 숫자까지 막습니다. 객체를 넣어 `[object Object]`가 찍히는 사고를 막으려는 규칙인데, 숫자는 괜찮다고 보는 팀이 많아서 보통 이렇게 완화합니다.

```js
'@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
```

### 6단계: any가 번지는 것을 막는 no-unsafe-* 규칙

타입 정보를 쓰는 묶음에는 `any`가 코드 곳곳으로 번지는 것을 막는 규칙들이 있습니다.

```ts
// src/cart.ts
import { Order } from './order.js'

export function parseTotal(json: string): number {
  const data = JSON.parse(json) // JSON.parse는 any를 돌려줌
  return data.total
}
```

```text
src\cart.ts
  1:1   error  All imports in the declaration are only used as types. Use `import type`  @typescript-eslint/consistent-type-imports
  4:9   error  Unsafe assignment of an `any` value                                       @typescript-eslint/no-unsafe-assignment
  5:3   error  Unsafe return of a value of type `any`                                    @typescript-eslint/no-unsafe-return
  5:15  error  Unsafe member access .total on an `any` value                             @typescript-eslint/no-unsafe-member-access
```

`noImplicitAny`(02 레슨)는 매개변수처럼 **몰래 생기는** `any`만 잡지만, `JSON.parse` 같은 라이브러리가 돌려주는 `any`는 막지 못합니다. 이 규칙들이 그 빈틈을 메웁니다. 고칠 때는 `unknown`으로 받고 검증합니다([런타임 검증](../part4-async/05-runtime-validation)).

`--fix`를 붙이면 자동으로 고칠 수 있는 것만 고쳐 줍니다.

```powershell
npx eslint --fix src/cart.ts
```

첫 줄이 `import type { Order } from './order.js'`로 바뀌고, 나머지 3개는 사람이 고쳐야 하므로 남습니다.

### 7단계: 자주 쓰는 추천 규칙 정리

| 규칙 | 막는 것 | 포함된 묶음 |
|---|---|---|
| `@typescript-eslint/no-floating-promises` | `await`/`.catch` 없이 버려진 Promise | `recommendedTypeChecked` 이상 |
| `@typescript-eslint/no-misused-promises` | `if (fetchOrder())`처럼 Promise를 조건에 씀 | `recommendedTypeChecked` 이상 |
| `@typescript-eslint/no-explicit-any` | 직접 쓴 `any` | `recommended` 이상 |
| `@typescript-eslint/no-unsafe-*` | `any` 값을 대입·호출·반환 | `recommendedTypeChecked` 이상 |
| `@typescript-eslint/no-unused-vars` | 안 쓰는 변수 | `recommended` 이상 |
| `@typescript-eslint/no-non-null-assertion` | `!` 단언 남용 | `strict` 이상 |
| `@typescript-eslint/consistent-type-imports` | 타입만 쓰는데 일반 `import` | 직접 추가 |
| `@typescript-eslint/switch-exhaustiveness-check` | 유니온의 `case`를 빠뜨린 `switch` | 직접 추가 |
| `eqeqeq` | `==`, `!=` | 직접 추가 |

규칙 하나를 특정 줄에서만 끄려면 주석을 씁니다. **이유를 꼭 함께 적습니다.**

```ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- 외부 SDK 타입이 any라서 임시 허용 (이슈 #45)
const sdk: any = window.posSdk
```

### 8단계: Prettier 설정과 역할 분담

Prettier는 설정이 거의 필요 없도록 만든 도구입니다. 팀에서 정할 것만 적습니다.

```json
// .prettierrc.json
{
  "semi": false,
  "singleQuote": true,
  "printWidth": 100,
  "trailingComma": "all"
}
```

```text
# .prettierignore
dist
coverage
```

- `semi: false` — 문장 끝 세미콜론 없음(이 위키의 예제 스타일).
- `singleQuote: true` — 문자열은 작은따옴표.
- `printWidth` — 한 줄 최대 길이. 넘으면 줄을 나눕니다.

서식이 엉망인 파일로 확인해 봅시다.

```ts
// 정리 전: 4칸 들여쓰기와 세미콜론이 섞여 있음
export function total(orders: Order[]) {
    const sum = orders.reduce((acc, o) => acc + o.total, 0);
  return sum
}
```

```powershell
npx prettier --check src   # 고칠 곳이 있는지 검사만 (CI용)
npx prettier --write src   # 실제로 고침
```

```text
Checking formatting...
[warn] src/cart.ts
[warn] Code style issues found in the above file. Run Prettier with --write to fix.
```

```ts
// 정리 후
export function total(orders: Order[]) {
  const sum = orders.reduce((acc, o) => acc + o.total, 0)
  return sum
}
```

**왜 `eslint-config-prettier`가 필요할까요?** ESLint 생태계에도 들여쓰기·따옴표 같은 서식 규칙이 있습니다(옛 ESLint 기본 규칙, 각종 플러그인). 이런 규칙이 켜져 있으면 Prettier가 고친 코드를 ESLint가 다시 에러로 표시하고, `--fix`가 서로 반대로 고치는 다툼이 생깁니다. `eslint-config-prettier`는 **서식 관련 규칙을 모두 끄는 설정**이라 맨 마지막에 넣습니다. 역할이 깔끔하게 나뉩니다.

```text
ESLint   → 버그 가능성, 코드 품질
Prettier → 모양
```

`eslint-plugin-prettier`로 Prettier를 ESLint 규칙처럼 돌리는 방법도 있지만, 느리고 에러 표시가 시끄러워서 요즘은 **둘을 따로 실행**하는 것을 권장합니다.

### 9단계: package.json 스크립트

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

```powershell
npm run typecheck
npm run lint
npm run format:check
```

세 명령이 모두 통과해야 코드를 올리도록(CI, 커밋 전 검사) 하면 팀 전체의 코드가 같은 기준을 지킵니다. **ESLint는 타입 검사를 대신하지 않습니다.** `typecheck`도 꼭 함께 돌립니다.

### 10단계: VS Code에서 저장할 때 자동 정리

VS Code 확장 두 개가 필요합니다([개발 환경 설치](../part0-start/03-setup)에서 설치).

- ESLint (`dbaeumer.vscode-eslint`)
- Prettier - Code formatter (`esbenp.prettier-vscode`)

프로젝트 폴더에 `.vscode/settings.json`을 만들면 이 프로젝트를 여는 모든 팀원에게 같은 설정이 적용됩니다.

```json
// .vscode/settings.json
{
  // 저장할 때 Prettier로 서식 정리
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",

  // 저장할 때 ESLint의 자동 수정 가능한 문제 고치기
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

- `"explicit"`은 "직접 저장(Ctrl+S, macOS는 Cmd+S)할 때만 실행"이라는 뜻입니다. 자동 저장 때마다 고치면 입력 중에 코드가 바뀌어 불편하기 때문입니다.
- 저장하면 순서대로 ESLint 자동 수정 → Prettier 서식 정리가 적용됩니다.
- 설정이 안 먹으면 VS Code 오른쪽 아래 상태 표시줄의 **ESLint** 글자를 눌러 출력 창의 에러를 확인합니다. 대부분 `eslint.config.js` 문법 오류나 패키지 미설치입니다.

## 자주 하는 실수

### 실수 1: .eslintrc.json으로 설정하기

```json
// .eslintrc.json
{ "extends": ["plugin:@typescript-eslint/recommended"] }
```

왜 틀렸나: 옛 설정 형식입니다. ESLint 9부터 기본값이 flat config로 바뀌었고, 10에서는 옛 형식을 읽지 않습니다. 인터넷의 오래된 글을 따라 하면 흔히 생깁니다.

고친 코드: `eslint.config.js`에 배열로 씁니다.

```js
import eslint from '@eslint/js'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'

export default defineConfig(eslint.configs.recommended, tseslint.configs.recommended)
```

### 실수 2: type-checked 묶음을 쓰면서 parserOptions를 빠뜨리기

```js
export default defineConfig(tseslint.configs.recommendedTypeChecked)
```

왜 틀렸나: 타입 정보를 쓰는 규칙은 어떤 `tsconfig.json`을 쓸지 알아야 합니다. 빠뜨리면 린트 자체가 멈춥니다.

```text
Error: Error while loading rule '@typescript-eslint/await-thenable': You have used a rule which requires type information, but don't have parserOptions set to generate type information for this file.
```

고친 코드:

```js
export default defineConfig(tseslint.configs.recommendedTypeChecked, {
  languageOptions: {
    parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
  },
})
```

### 실수 3: tsconfig에 없는 파일을 타입 기반으로 검사하기

```text
eslint.config.js
  0:0  error  Parsing error: ...\eslint.config.js was not found by the project service. Consider either including it in the tsconfig.json or including it in allowDefaultProject
```

왜 틀렸나: `tsconfig.json`의 `include`가 `["src"]`라서 루트의 `eslint.config.js`는 TypeScript 프로젝트에 속하지 않습니다. 실제로 5단계 설정에서 5번 블록을 지우고 실행했을 때 이 에러가 났습니다.

고친 코드: JS 설정 파일에는 타입 기반 규칙을 끕니다(5단계의 5번 블록).

```js
{
  files: ['**/*.js', '**/*.mjs'],
  extends: [tseslint.configs.disableTypeChecked],
},
```

### 실수 4: prettierConfig를 중간에 넣기

```js
export default defineConfig(
  eslint.configs.recommended,
  prettierConfig,
  tseslint.configs.strictTypeChecked,
  someStylePlugin, // 들여쓰기 규칙이 있는 플러그인
)
```

왜 틀렸나: flat config는 뒤의 설정이 앞을 덮어씁니다. `prettierConfig`가 끈 서식 규칙을 뒤의 플러그인이 다시 켜서 Prettier와 다툽니다.

고친 코드: `prettierConfig`는 **항상 맨 마지막**에 둡니다.

## 직접 해 보기

### 문제 1 ⭐ 누구의 일일까

다음 문제를 잡는 도구는 `tsc`, ESLint, Prettier 중 무엇일까요?

1. `const price: number = '4500'`
2. 어떤 파일은 2칸, 어떤 파일은 4칸 들여쓰기
3. `saveOrder(order)`를 `await` 없이 호출
4. `if (status == 'PAID')`

::: details 정답 보기
1. `tsc` (TS2322)
2. Prettier
3. ESLint (`@typescript-eslint/no-floating-promises`, 타입 기반 묶음)
4. ESLint (`eqeqeq` 규칙을 켰을 때)
:::

### 문제 2 ⭐ 스크립트 만들기

`package.json`에 "타입 검사 → 린트 → 서식 검사"를 한 번에 실행하는 `check` 스크립트를 추가하세요. 하나라도 실패하면 멈춰야 합니다.

::: details 정답 보기
```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "format:check": "prettier --check .",
    "check": "npm run typecheck && npm run lint && npm run format:check"
  }
}
```

`&&`는 앞 명령이 성공했을 때만 다음 명령을 실행합니다. `npm run`의 스크립트는 운영체제와 상관없이 같은 방식으로 실행되므로 Windows에서도 그대로 동작합니다.
:::

### 문제 3 ⭐⭐ floating promise 고치기

`no-floating-promises` 에러가 났습니다. 세 가지 방법으로 고쳐 보세요(① 기다리기 ② 에러 처리 ③ 의도적으로 무시).

```ts
async function saveOrder(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  console.log('저장 완료', id)
}

export function onClickSave() {
  saveOrder('ord-001')
}
```

::: details 정답 보기
```ts
// ① 호출하는 쪽도 async로 만들고 await
export async function onClickSave() {
  await saveOrder('ord-001')
}

// ② 실패를 받아 처리
export function onClickSave2() {
  saveOrder('ord-001').catch((err: unknown) => {
    console.error('저장 실패', err)
  })
}

// ③ 결과를 정말 기다릴 필요가 없을 때 — void로 의도를 표시
export function onClickSave3() {
  void saveOrder('ord-001')
}
```

③은 실패해도 아무도 모르게 되므로 로그 전송처럼 "실패해도 괜찮은" 작업에만 씁니다.
:::

### 문제 4 ⭐⭐ 규칙 조정하기

팀에서 다음을 정했습니다. 5단계 설정의 4번 블록을 고치세요.

- 템플릿 리터럴에 숫자는 허용
- `_`로 시작하는 매개변수와 변수는 안 써도 허용
- `!` 단언은 에러가 아니라 경고(warn)

::: details 정답 보기
```js
{
  rules: {
    eqeqeq: ['error', 'always'],
    '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/consistent-type-imports': 'error',
  },
},
```

`warn`은 표시만 하고 `eslint` 명령의 종료 코드를 실패로 만들지 않습니다. CI에서 경고도 막으려면 `eslint . --max-warnings 0`으로 실행합니다.
:::

### 문제 5 ⭐⭐⭐ any 번짐 막기

아래 코드에서 `no-unsafe-*` 에러 3개를 모두 없애세요. `any`·`as any`·주석으로 끄는 것은 금지입니다.

```ts
export function parseTotal(json: string): number {
  const data = JSON.parse(json)
  return data.total
}
```

::: details 정답 보기
```ts
export function parseTotal(json: string): number {
  const data: unknown = JSON.parse(json)
  if (
    typeof data === 'object' &&
    data !== null &&
    'total' in data &&
    typeof data.total === 'number'
  ) {
    return data.total
  }
  throw new Error('total이 없는 주문 데이터입니다')
}
```

`unknown`으로 받으면 `no-unsafe-assignment`가 사라지고, 좁히기로 `total`이 숫자임을 확인하면 나머지 두 규칙도 통과합니다. 실무에서는 zod 같은 검증 라이브러리를 씁니다([런타임 검증](../part4-async/05-runtime-validation)).
:::

## 확인 퀴즈

1. ESLint 10에서 쓰는 설정 파일 이름은?
2. `recommended`와 `recommendedTypeChecked`의 가장 큰 차이는?
3. `eslint-config-prettier`는 설정 배열의 어디에 둬야 할까요? 왜일까요?
4. `npx prettier --check`와 `--write`의 차이는?
5. ESLint를 쓰면 `tsc --noEmit`은 안 돌려도 될까요?

::: details 정답 보기
1. `eslint.config.js`(CommonJS 프로젝트면 `eslint.config.mjs`). 옛 `.eslintrc.*`는 읽지 않습니다.
2. `TypeChecked`는 TypeScript의 타입 정보를 써서 검사하므로 floating promise, `any` 번짐 등을 잡을 수 있습니다. 대신 `parserOptions` 설정이 필요하고 느립니다.
3. 맨 마지막입니다. 뒤의 설정이 앞을 덮어쓰므로, 마지막에 둬야 다른 설정이 켠 서식 규칙까지 모두 끕니다.
4. `--check`는 고칠 곳이 있는지만 알려 주고(CI용), `--write`는 실제로 파일을 고칩니다.
5. 아니요. ESLint는 타입 오류를 보고하지 않습니다. 타입 검사는 `tsc`의 일입니다.
:::

## 정리

- `tsc`는 타입, ESLint는 버그 가능성과 팀 규칙, Prettier는 서식을 맡습니다.
- ESLint 설정은 flat config(`eslint.config.js`)로, 설정 객체 배열이 위에서 아래로 덮어씁니다.
- 새 프로젝트는 `strictTypeChecked` + `stylisticTypeChecked` + `projectService: true`로 시작하고, 시끄러운 규칙만 완화합니다.
- `no-floating-promises`와 `no-unsafe-*`는 타입 검사가 놓치는 버그를 잡는 핵심 규칙입니다.
- `eslint-config-prettier`를 맨 마지막에 넣어 서식은 Prettier에게만 맡깁니다.
- `.vscode/settings.json`의 `formatOnSave`와 `source.fixAll.eslint`로 저장 시 자동 정리합니다.
- typescript-eslint가 지원하는 TypeScript 버전 범위를 확인하고 `typescript` 버전을 고정합니다.

## 다음 단계

[Vitest로 테스트 작성하기](./05-testing-vitest) — 타입 검사와 린트로도 못 잡는 "계산 결과가 맞는가"를 자동으로 확인하는 테스트를 작성합니다.
