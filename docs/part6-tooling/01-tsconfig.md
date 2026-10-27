---
title: tsconfig.json 완전 정복
---

# tsconfig.json 완전 정복

<LessonMeta level="실전" :minutes="60" prev="Part 5에서 조건부·매핑·템플릿 리터럴 타입으로 라이브러리 수준의 타입을 만드는 법" />

## 이번에 배울 것

- `tsconfig.json`의 전체 구조(`compilerOptions`, `include`, `exclude`, `files`, `extends`)를 설명할 수 있다.
- 주요 컴파일러 옵션을 대상·모듈·엄격성·출력·경로 다섯 갈래로 나누어 고를 수 있다.
- `rootDir`·`outDir`로 소스 폴더와 결과 폴더를 나누고, `extends`로 공통 설정을 물려받을 수 있다.
- `paths` 별칭이 **타입 검사에만** 쓰이고, 실제 실행에는 번들러·런타임 설정이 따로 필요하다는 것을 설명할 수 있다.
- Node 앱·라이브러리·프론트엔드 앱에 알맞은 추천 설정을 골라 쓸 수 있다.

## 먼저 알아 둘 것

- [첫 프로그램: tsc로 컴파일하고 실행하기](../part0-start/05-first-program) — `tsc` 명령으로 `.ts`를 `.js`로 바꾸는 흐름
- [모듈: import/export와 타입 전용 import](../part3-intermediate/09-modules) — `import`·`export`, `import type`
- 명령어는 **Windows PowerShell** 기준으로 적고, macOS·Linux에서 다른 부분만 따로 적습니다.

::: info 작성 시점(2026-10)의 TypeScript 버전 사정
이 파트의 실습은 아래 버전으로 실제 프로젝트를 만들어 확인했습니다.

- Node.js 24.13.1, `typescript` **5.9.3**, `@types/node` 22.20.5, `vite` 8.3.5, `tsx` 4.23.15

작성 시점 npm의 `typescript` 최신 버전은 **7.0.2**(Go 언어로 다시 만든 컴파일러)이고, `create-vite` 9.3.1 템플릿과 typescript-eslint 8.72.0은 **6.0.x**를 씁니다. 이 위키는 TypeScript 5.x를 기준으로 쓰므로 실습에서는 `npm install -D typescript@5`로 5.x를 고정해 설치합니다(작성 시점에 5.9.3이 설치됨). 이 레슨의 추천 설정은 5.9.3과 6.0.3 **둘 다**에서 같은 결과가 나오는 것을 확인했습니다. 6.0에서 바뀐 기본값은 아래 [TypeScript 6.0에서 바뀐 것](#ts6-changes)에 따로 정리했습니다.
:::

## 비유로 이해하기

새 매장을 열 때 본사에서 **매장 운영 지침서** 한 권을 받는다고 생각해 봅시다.

- 지침서 첫 장에는 "본사 공통 지침을 따른다"라고 적혀 있습니다. → `extends`
- "이 매장은 1층 매대 상품만 관리한다, 창고 물건은 빼고" → `include` / `exclude`
- "계산은 반드시 영수증을 발행한다, 할인은 점장 승인을 받는다" 같은 세부 규칙 → `compilerOptions`
- "들어온 물건은 진열대(`src`)에, 포장된 택배는 출고장(`dist`)에" → `rootDir` / `outDir`

직원(컴파일러 `tsc`)은 지침서 없이도 일을 하지만, 매장마다 기준이 달라 결과가 들쭉날쭉합니다. 지침서를 한 번 잘 써 두면 누가 언제 일해도 같은 결과가 나옵니다. `tsconfig.json`이 바로 그 지침서입니다.

## 개념 설명

### 1단계: tsconfig.json이 하는 일

지금까지는 `tsc hello.ts`처럼 파일 이름을 직접 넘겼습니다. 프로젝트가 커지면 파일이 수십·수백 개가 되고, 옵션도 매번 똑같이 붙여야 합니다. 그래서 **프로젝트 폴더 맨 위에 `tsconfig.json`을 두고, 파일 목록과 옵션을 거기에 적습니다.**

```powershell
# 프로젝트 폴더에서 tsconfig.json 하나를 만들어 줍니다
npx tsc --init

# 이후로는 파일 이름 없이 실행하면 tsconfig.json을 읽습니다
npx tsc
```

- `npx`는 "이 프로젝트의 `node_modules`에 설치된 명령을 실행하라"는 뜻입니다.
- `tsc`에 파일 이름을 **넘기지 않으면** 현재 폴더에서 `tsconfig.json`을 찾고, 그 안의 설정대로 컴파일합니다.
- 반대로 `tsc hello.ts`처럼 파일 이름을 넘기면 **`tsconfig.json`을 무시합니다.** 처음에 가장 많이 헷갈리는 부분입니다.
- `tsc --init`(5.9 기준)이 만들어 주는 파일에는 `strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax` 등 요즘 권장 값이 이미 켜져 있고, 나머지는 주석으로 설명이 달려 있습니다.

::: warning tsc 파일이름.ts 는 tsconfig.json을 읽지 않습니다
`npx tsc src/index.ts`라고 하면 `tsconfig.json`의 `strict`, `outDir` 등이 하나도 적용되지 않습니다. 설정 파일을 쓰려면 `npx tsc` 또는 `npx tsc -p tsconfig.json`(`-p`는 project, 설정 파일을 지정)으로 실행합니다.
:::

### 2단계: 전체 구조 한눈에 보기

`tsconfig.json`의 맨 바깥에는 다섯 가지 칸이 있습니다.

```json
{
  // 1) 다른 설정 파일을 물려받기
  "extends": "./tsconfig.base.json",

  // 2) 컴파일러가 어떻게 동작할지 (가장 큰 부분)
  "compilerOptions": {
    "strict": true,
    "outDir": "dist"
  },

  // 3) 검사·컴파일할 파일 고르기
  "include": ["src"],
  "exclude": ["src/**/*.test.ts"],

  // 4) 여러 프로젝트를 이어 붙이기 (Part 9에서 다룸)
  "references": []
}
```

| 칸 | 하는 일 | 생략하면 |
|---|---|---|
| `extends` | 다른 설정 파일의 내용을 먼저 깔고, 그 위에 덮어쓰기 | 물려받는 것 없음 |
| `compilerOptions` | 대상 버전, 모듈 방식, 엄격성, 출력 위치 등 | 모든 옵션이 기본값 |
| `include` | 포함할 파일·폴더 패턴 | 폴더 안 모든 `.ts`·`.tsx`·`.d.ts` |
| `exclude` | `include`에서 뺄 패턴 | `node_modules`, `outDir` 등 |
| `files` | 파일 이름을 하나하나 지정 | 사용 안 함 |
| `references` | 프로젝트 참조(큰 저장소를 쪼개기) | 사용 안 함 |

`tsconfig.json`은 일반 JSON과 달리 **주석(`//`)과 마지막 쉼표를 허용**합니다. 그래서 위처럼 설명을 달아 둘 수 있습니다.

### 3단계: 주요 옵션 — 카테고리별 표

`compilerOptions`에는 100개가 넘는 옵션이 있지만, 실무에서 직접 고르는 것은 20개 남짓입니다. 다섯 갈래로 나누면 기억하기 쉽습니다. "도입" 칸은 그 옵션(또는 값)이 처음 생긴 TypeScript 버전입니다.

#### ① 대상(Target) — 어떤 JavaScript로 바꿀까

| 옵션 | 뜻 | 추천 값 | 도입 |
|---|---|---|---|
| `target` | 결과 JS의 문법 수준. 이보다 새 문법은 옛 문법으로 바꿔 씀 | Node 22+: `es2023` / 브라우저: `es2022` | 1.0 (`es2023`은 5.0, `es2024`는 5.7) |
| `lib` | 코드에서 쓸 수 있는 **내장 기능의 타입 목록**(`Array.prototype.at`, `document` 등) | 브라우저: `["es2022", "dom", "dom.iterable"]` | 2.0 |
| `jsx` | `.tsx`의 JSX를 어떻게 바꿀지 | React 17+: `react-jsx` | 1.6 (`react-jsx`는 4.1) |

- `target`은 **문법**(화살표 함수, 클래스 필드 등)을, `lib`은 **내장 함수·객체의 타입**을 정합니다. `lib`을 생략하면 `target`에 맞는 값이 자동으로 들어갑니다.
- 브라우저 코드는 `lib`에 `dom`을 넣어야 `document`, `window`를 쓸 수 있습니다.

`lib`이 모자라면 어떤 일이 생기는지 직접 봅시다. 옵션을 하나도 주지 않고(TypeScript 5.x 기준) 컴파일하면 `target`이 아주 옛날 값(`es5`)이라서 `Map`조차 모릅니다.

```ts
// stock.ts — 상품코드별 재고
const stock = new Map<string, number>()
// ❌ (target 기본값일 때) Cannot find name 'Map'. Do you need to change your target library? Try changing the 'lib' compiler option to 'es2015' or later. (TS2583)
stock.set('P001', 30)
export {}
```

`--target es2022`를 주면 에러가 사라집니다. 에러 메시지가 "lib 옵션을 바꿔 보라"고 직접 알려 주는 점도 눈여겨보세요.

#### ② 모듈(Module) — import/export를 어떻게 다룰까

| 옵션 | 뜻 | 추천 값 | 도입 |
|---|---|---|---|
| `module` | 결과 JS의 모듈 형식 | Node: `nodenext` / 번들러: `esnext` 또는 `preserve` | 1.0 (`nodenext` 4.7, `preserve` 5.4) |
| `moduleResolution` | `import '...'`의 문자열로 실제 파일을 찾는 규칙 | Node: `nodenext` / 번들러: `bundler` | 1.6 (`bundler` 5.0) |
| `esModuleInterop` | CommonJS 패키지를 `import x from`으로 가져올 수 있게 함 | `true` | 2.7 |
| `verbatimModuleSyntax` | `import type`을 강제해 "타입만 가져오는 import"를 분명히 함 | `true` | 5.0 |
| `isolatedModules` | 파일 하나씩만 보고 변환하는 도구(esbuild 등)와 호환되게 검사 | `true` | 1.5 |
| `resolveJsonModule` | `.json` 파일을 `import` 할 수 있게 함 | 필요할 때 `true` | 2.9 |
| `types` | 전역에 자동으로 넣을 `@types` 패키지 목록 | Node: `["node"]` / Vite: `["vite/client"]` | 2.0 |

모듈 옵션은 내용이 많아서 [03 모듈 시스템](./03-module-systems) 레슨 전체를 씁니다. 여기서는 "Node에서 바로 실행하면 `nodenext`, Vite 같은 번들러가 처리하면 `bundler`"만 기억하세요.

#### ③ 엄격성(Strictness) — 얼마나 꼼꼼히 검사할까

| 옵션 | 뜻 | 추천 값 | 도입 |
|---|---|---|---|
| `strict` | 아래 엄격 옵션 묶음을 한 번에 켬 | **항상 `true`** | 2.3 |
| `noUncheckedIndexedAccess` | `arr[i]`, `obj[key]`의 결과에 `undefined`를 더함 | `true` | 4.1 |
| `exactOptionalPropertyTypes` | 선택 속성에 `undefined`를 직접 넣는 것을 막음 | 새 프로젝트면 `true` | 4.4 |
| `noImplicitOverride` | 부모 메서드를 덮어쓸 때 `override` 키워드 강제 | `true` | 4.3 |
| `noFallthroughCasesInSwitch` | `switch`에서 `break` 빠뜨림 막기 | `true` | 1.8 |
| `noUnusedLocals` / `noUnusedParameters` | 안 쓰는 변수·매개변수를 에러로 | 팀 취향(린터로 대신하기도 함) | 2.0 |

각 옵션이 무엇을 막아 주는지는 [02 strict 옵션](./02-strict-options)에서 "꺼졌을 때 / 켰을 때"를 하나씩 비교합니다.

#### ④ 출력(Emit) — 결과 파일을 어디에 어떻게 만들까

| 옵션 | 뜻 | 추천 값 | 도입 |
|---|---|---|---|
| `outDir` | 결과 `.js`를 모을 폴더 | `dist` | 1.5 |
| `rootDir` | 소스의 최상위 폴더. `outDir` 안의 폴더 구조 기준 | `src` | 1.5 |
| `noEmit` | 타입 검사만 하고 파일은 만들지 않음 | 번들러를 쓰면 `true` | 1.5 |
| `sourceMap` | `.js.map` 생성(디버거에서 `.ts` 줄 번호로 보기) | `true` | 1.0 |
| `declaration` | `.d.ts` 타입 선언 파일 생성 | 라이브러리면 `true` | 1.0 |
| `declarationMap` | `.d.ts.map` 생성(정의로 이동 시 `.ts`로 감) | 라이브러리면 `true` | 2.9 |
| `skipLibCheck` | `node_modules` 속 `.d.ts` 검사를 건너뜀(속도 향상) | `true` | 2.0 |

#### ⑤ 경로(Paths) — import 문자열을 짧게

| 옵션 | 뜻 | 추천 값 | 도입 |
|---|---|---|---|
| `paths` | `@/utils/format` 같은 별칭을 실제 경로로 연결(**타입 검사용**) | `{ "@/*": ["./src/*"] }` | 2.0 (`baseUrl` 없이 쓰기는 4.1) |
| `baseUrl` | 경로 기준 폴더 | **쓰지 않음**(6.0에서 지원 중단 예고) | 2.0 |
| `allowImportingTsExtensions` | `import './a.ts'`처럼 `.ts` 확장자로 import 허용(`noEmit`과 함께) | 번들러 앱이면 `true` | 5.0 |

### 4단계: include · exclude · files

어떤 파일이 검사 대상이 되는지 정하는 세 칸입니다.

```json
{
  "include": ["src"],
  "exclude": ["src/**/*.test.ts"]
}
```

- `include`의 `"src"`는 `src` 폴더 아래 **모든** `.ts`·`.tsx`·`.d.ts` 파일을 뜻합니다.
- `**`는 "아무 깊이의 하위 폴더", `*`는 "아무 파일 이름"입니다. 이런 패턴을 **글롭**(glob, 와일드카드로 파일을 고르는 패턴)이라고 합니다.
- `exclude`는 `include`로 고른 것 가운데서 **뺍니다.** 위 설정은 테스트 파일을 빌드 결과에서 빼는 흔한 방법입니다.
- `files`는 `["src/index.ts"]`처럼 파일 이름을 정확히 적습니다. 파일이 몇 개뿐인 작은 도구에 씁니다.

::: warning exclude는 "import로 끌려오는 파일"까지 막지는 못합니다
`exclude`에 `src/utils/format.ts`를 넣어도, `src/index.ts`가 그 파일을 `import`하고 있으면 결국 검사·컴파일 대상이 됩니다. `exclude`는 "처음 출발점 목록에서 뺀다"는 뜻일 뿐입니다.
:::

아래 5단계의 `cart-app` 프로젝트에서 실제로 확인해 볼 수 있습니다. `--listFilesOnly`는 "어떤 파일이 대상이 되는지 목록만 보여 줘"라는 옵션입니다.

```json
// tsconfig.check.json — format.ts를 exclude로 빼 봄
{
  "extends": "./tsconfig.json",
  "compilerOptions": { "noEmit": true },
  "exclude": ["src/utils/format.ts"]
}
```

```powershell
npx tsc -p tsconfig.check.json --listFilesOnly
```

```text
.../src/models/product.ts
.../src/utils/price.ts
.../src/utils/format.ts     ← 뺐는데도 들어 있음 (index.ts가 import 하므로)
.../src/index.ts
```

(실제 출력에는 `node_modules` 속 타입 파일 경로도 함께 나옵니다. 위에는 `src` 부분만 옮겼습니다.)

### 5단계: rootDir와 outDir — 진열대와 출고장

예제 프로젝트를 하나 만들어 끝까지 따라가 봅시다. 매장 장바구니 금액을 계산하는 작은 Node 프로그램입니다.

```powershell
mkdir cart-app
cd cart-app
npm init -y
npm pkg set type=module
npm install -D typescript@5 @types/node@22
```

- `npm pkg set type=module`은 `package.json`에 `"type": "module"`을 넣습니다. 이 프로젝트의 `.js`를 ES 모듈로 실행하라는 뜻입니다([03 레슨](./03-module-systems)에서 자세히).
- macOS·Linux에서도 명령은 같습니다.

폴더 구조는 이렇게 만듭니다.

```text
cart-app/
├─ package.json
├─ tsconfig.json
└─ src/
   ├─ index.ts
   ├─ models/product.ts
   └─ utils/
      ├─ format.ts
      └─ price.ts
```

```ts
// src/models/product.ts
export interface Product {
  id: string
  name: string
  price: number
}
```

```ts
// src/utils/price.ts
import type { Product } from '../models/product.js'

export function totalPrice(items: Product[]): number {
  return items.reduce((sum, p) => sum + p.price, 0)
}
```

```ts
// src/utils/format.ts
export function won(amount: number): string {
  return amount.toLocaleString('ko-KR') + '원'
}
```

```ts
// src/index.ts
import { totalPrice } from './utils/price.js'
import { won } from './utils/format.js'

const cart = [
  { id: 'P001', name: '아메리카노', price: 4500 },
  { id: 'P002', name: '카페라테', price: 5000 },
]
console.log(won(totalPrice(cart)))
```

`.ts` 파일인데 import 경로 끝이 `.js`인 것이 이상해 보일 수 있습니다. 컴파일 뒤에 실제로 존재하는 파일이 `.js`이기 때문입니다. 이유는 [03 레슨](./03-module-systems)에서 에러를 직접 재현하며 설명합니다.

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es2023",
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "types": ["node"],
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

```powershell
npx tsc
node dist/index.js
```

```text
9,500원
```

결과 폴더는 이렇게 생깁니다. `src` 안의 구조가 그대로 `dist`로 옮겨졌습니다.

```text
dist/
├─ index.js
├─ models/product.js
└─ utils/
   ├─ format.js
   └─ price.js
```

**`rootDir`를 빼면 어떻게 될까요?** TypeScript는 "모든 입력 파일의 공통 상위 폴더"를 `rootDir`로 짐작합니다. 그래서 나중에 `scripts/seed.ts` 같은 파일이 `include`에 추가되면 공통 상위 폴더가 프로젝트 루트로 바뀌어, 결과가 `dist/src/index.js`, `dist/scripts/seed.js`처럼 **한 단계 깊어집니다.** 그러면 `node dist/index.js`로 실행하던 스크립트가 갑자기 깨집니다.

`rootDir`를 `src`로 못 박아 두면, 그 바깥 파일이 섞여 들어왔을 때 조용히 구조가 바뀌는 대신 에러로 알려 줍니다.

```text
error TS6059: File '.../scripts/seed.ts' is not under 'rootDir' '.../src'. 'rootDir' is expected to contain all source files.
```

### 6단계: extends — 공통 설정 물려받기

여러 프로젝트(또는 앱 설정과 테스트 설정)가 같은 옵션을 공유할 때 `extends`를 씁니다.

```json
// tsconfig.base.json — 회사 공통 규칙
{
  "compilerOptions": {
    "target": "es2022",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

```json
// tsconfig.json — 이 프로젝트만의 설정
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "module": "nodenext",
    "rootDir": "src",
    "outDir": "dist",
    "types": ["node"]
  },
  "include": ["src"]
}
```

규칙은 세 가지입니다.

1. 부모 설정을 먼저 깔고, 자식에 적은 옵션이 **같은 이름이면 덮어씁니다.**
2. `include`·`exclude`·`files`도 자식에 적으면 **통째로 교체**됩니다(합쳐지지 않음).
3. `rootDir`·`outDir`·`include` 같은 **경로는 그 경로를 적은 파일 기준**으로 해석됩니다. 부모 파일이 다른 폴더에 있으면 부모 기준입니다.

최종적으로 어떤 값이 적용되는지 헷갈리면 `--showConfig`로 합쳐진 결과를 볼 수 있습니다.

```powershell
npx tsc --showConfig
```

```text
{
    "compilerOptions": {
        "target": "es2022",
        "strict": true,
        ...
        "module": "nodenext",
        "rootDir": "./src",
        "outDir": "./dist",
        ...
        "noImplicitAny": true,
        "strictNullChecks": true,
        ...
```

`strict: true` 하나가 `noImplicitAny`, `strictNullChecks` 등 여러 옵션으로 펼쳐져 보이는 것도 확인할 수 있습니다.

npm에 올라와 있는 공용 설정을 물려받을 수도 있습니다. 예를 들어 `@tsconfig/node22`(작성 시점 22.0.6)는 Node 22용 추천 값(`strict`, `module: nodenext`, `target: es2022` 등)을 담고 있습니다.

```powershell
npm install -D @tsconfig/node22
```

```json
{
  "extends": "@tsconfig/node22/tsconfig.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "noUncheckedIndexedAccess": true
  },
  "include": ["src"]
}
```

`extends`에 배열을 넣어 여러 파일을 차례로 물려받는 것은 **TypeScript 5.0부터** 됩니다(`"extends": ["./a.json", "./b.json"]`).

### 7단계: paths 별칭 — 그리고 꼭 알아야 할 함정

폴더가 깊어지면 import 경로가 `'../../../utils/format.js'`처럼 길어집니다. `paths`로 짧은 별칭을 만들 수 있습니다.

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

```ts
// 이제 어느 폴더에서든 이렇게 쓸 수 있습니다
import { won } from '@/utils/format.js'
```

- `"@/*"`의 `*` 자리에 들어간 글자가 `"./src/*"`의 `*` 자리로 옮겨집니다. `@/utils/format.js` → `./src/utils/format.js`.
- `paths`의 상대 경로는 이 `tsconfig.json`이 있는 폴더 기준입니다. 예전에는 `baseUrl`을 함께 적어야 했지만 TypeScript 4.1부터 필요 없고, 6.0부터는 `baseUrl` 자체가 지원 중단 예고 상태이니 쓰지 마세요.

**함정: `paths`는 타입 검사기에게만 "이 별칭은 저 파일이야"라고 알려 줄 뿐, 결과 JS의 import 문자열을 바꾸지 않습니다.** 직접 확인해 봅시다. 위 `cart-app`의 `tsconfig.json`에 `paths`를 넣고, `src/index.ts`에서 `'./utils/format.js'`를 `'@/utils/format.js'`로 바꾼 뒤 다시 빌드합니다.

```powershell
npx tsc          # 에러 없음
node dist/index.js
```

```text
Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@/utils' imported from ...\dist\index.js
```

`tsc`는 통과했는데 실행이 실패합니다. `dist/index.js`를 열어 보면 import 문이 여전히 `'@/utils/format.js'`이고, Node는 `@/utils`를 npm 패키지 이름으로 착각합니다.

그래서 `paths`를 쓰려면 **실제로 코드를 실행·묶는 도구에도 같은 별칭을 알려 줘야** 합니다.

| 실행 방식 | 별칭 설정 방법 |
|---|---|
| Vite(프론트엔드) | `vite.config.ts`의 `resolve.alias` (Vite 8은 `resolve.tsconfigPaths: true`도 가능) |
| tsx로 실행 | `tsconfig.json`의 `paths`를 자동으로 읽음(같은 코드를 `npx tsx src/index.ts`로 실행하면 `9,500원` 출력) |
| `tsc` 결과를 `node`로 실행 | 자동 변환 없음 → 상대 경로를 쓰거나 `package.json`의 `imports`(`#`으로 시작하는 별칭)를 사용 |
| Vitest | Vite 설정을 그대로 씀 |

Vite에서는 이렇게 맞춥니다.

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      // tsconfig의 "@/*": ["./src/*"]와 같은 뜻
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
```

::: details 실제로 확인한 내용 (Vite 8.3.5)
별칭 설정 없이 `npx vite build`를 했을 때는 빌드가 성공했지만, `npx vite`(개발 서버)로 띄우면 `Failed to resolve import "@/utils/format" from "src/main.ts"` 에러가 났습니다. `resolve.alias` 또는 `resolve.tsconfigPaths: true`를 넣은 뒤에는 개발 서버도 정상이었습니다. 버전마다 기본 동작이 다를 수 있으니 **별칭은 항상 번들러 설정에 명시**하세요.
:::

### 8단계: 상황별 추천 설정

아래 세 설정은 작성 시점에 TypeScript 5.9.3과 6.0.3에서 실제 프로젝트로 빌드·실행해 확인했습니다. 그대로 복사해 시작점으로 쓰세요.

#### Node 앱(서버, CLI) — `tsc`로 빌드해 `node`로 실행

```json
{
  "compilerOptions": {
    "target": "es2023",
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "types": ["node"],
    "rootDir": "src",
    "outDir": "dist",
    "sourceMap": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"]
}
```

- `package.json`에 `"type": "module"`을 함께 둡니다.
- `@types/node`는 실행할 Node 버전에 맞춥니다(Node 22면 `@types/node@22`).

#### 라이브러리(npm에 배포할 패키지)

```json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "rootDir": "src",
    "outDir": "dist",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"],
  "exclude": ["src/**/*.test.ts"]
}
```

- 라이브러리는 **쓰는 쪽 환경을 모르므로** `target`을 앱보다 한 단계 보수적으로 잡습니다.
- `declaration`이 있어야 쓰는 사람이 타입을 받습니다. 결과 폴더에 `index.d.ts`, `index.d.ts.map`이 함께 생깁니다.
- `module: nodenext`로 검사하면 Node·번들러 양쪽에서 안전한 import만 통과합니다. 여러 형식(ESM+CJS)으로 내보내는 일은 [06 빌드 도구](./06-build-tools)의 tsup에 맡깁니다.

#### 프론트엔드 앱(Vite + React/Vue)

```json
{
  "compilerOptions": {
    "target": "es2022",
    "lib": ["es2022", "dom", "dom.iterable"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "types": ["vite/client"],
    "noEmit": true,
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "skipLibCheck": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

- JS 파일은 Vite가 만들기 때문에 `tsc`는 **검사만**(`noEmit`) 합니다.
- `types: ["vite/client"]`가 있어야 `import.meta.env`, `import logo from './logo.svg'` 같은 Vite 전용 기능에 타입이 붙습니다.
- Vue 프로젝트면 `jsx` 줄을 지우고, 검사 명령으로 `tsc` 대신 `vue-tsc`를 씁니다(Part 7에서 다룸).
- `paths`를 넣었다면 7단계처럼 `vite.config.ts`에도 별칭을 넣습니다.
- `create-vite`가 만들어 주는 템플릿은 `tsconfig.app.json`(앱 코드)과 `tsconfig.node.json`(`vite.config.ts`용)으로 나뉘어 있고, `tsconfig.json`은 둘을 `references`로 묶기만 합니다. 내용은 위와 거의 같습니다.

### TypeScript 6.0에서 바뀐 것 {#ts6-changes}

작성 시점에 6.0.3과 7.0.2를 설치해 아래 내용을 직접 확인했습니다. **추천 설정처럼 값을 전부 명시해 두면 버전이 바뀌어도 결과가 같습니다.** 기본값에 기대지 않는 것이 가장 좋은 대비입니다.

| 항목 | 5.x | 6.0 | 7.0 |
|---|---|---|---|
| `strict`를 안 적었을 때 | 꺼짐 | **켜짐** | 켜짐 |
| `types`를 안 적었을 때 | `node_modules/@types` 전부 자동 포함 | **아무것도 포함 안 함**(`process`를 쓰면 TS2591) | 6.0과 같음 |
| `baseUrl`, `target: es5`, `moduleResolution: node`(node10)·`classic`, `esModuleInterop: false`, `outFile`, `downlevelIteration` | 사용 가능 | 지원 중단 에러(TS5101·TS5107). `"ignoreDeprecations": "6.0"`으로 임시로 끌 수 있음 | **제거됨**(TS5102·TS5108) |

```text
# TypeScript 6.0.3에서 baseUrl을 썼을 때
error TS5101: Option 'baseUrl' is deprecated and will stop functioning in TypeScript 7.0. Specify compilerOption '"ignoreDeprecations": "6.0"' to silence this error.
```

공식 안내: [TypeScript 6.0 마이그레이션 정보](https://aka.ms/ts6), 옵션 전체 목록: [TSConfig Reference](https://www.typescriptlang.org/tsconfig/)

## 자주 하는 실수

### 실수 1: 파일 이름을 넘겨서 tsconfig.json이 무시됨

```powershell
npx tsc src/index.ts
```

왜 틀렸나: 파일 이름을 넘기면 `tsconfig.json`을 읽지 않습니다. `outDir`이 무시되어 `src/index.js`가 소스 옆에 생기고, `strict` 등도 적용되지 않습니다(5.x 기준).

고친 코드:

```powershell
npx tsc
# 설정 파일이 여러 개면
npx tsc -p tsconfig.build.json
```

### 실수 2: paths만 설정하고 실행 도구에는 알려 주지 않음

```json
{ "compilerOptions": { "paths": { "@/*": ["./src/*"] } } }
```

```text
npx tsc              → 에러 없음
node dist/index.js   → Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@/utils'
```

왜 틀렸나: `paths`는 타입 검사용 지도일 뿐, 결과 JS의 import 문자열은 그대로입니다.

고친 코드: 번들러를 쓰면 번들러 설정(`resolve.alias`)에도 같은 별칭을 넣습니다. `tsc` 결과를 `node`로 바로 실행하는 서버라면 상대 경로를 쓰는 편이 가장 단순합니다.

```ts
import { won } from './utils/format.js'
```

### 실수 3: rootDir를 정하지 않아 dist 구조가 바뀜

```json
{
  "compilerOptions": { "outDir": "dist" },
  "include": ["src", "scripts"]
}
```

왜 틀렸나: `src`와 `scripts`의 공통 상위 폴더가 프로젝트 루트이므로 결과가 `dist/src/index.js`, `dist/scripts/seed.js`가 됩니다. `package.json`의 `"start": "node dist/index.js"`가 깨집니다.

고친 코드: 빌드 대상은 `src`만 두고 `rootDir`를 명시합니다. `scripts`는 `tsx`로 바로 실행하거나 별도 설정 파일로 검사합니다.

```json
{
  "compilerOptions": { "rootDir": "src", "outDir": "dist" },
  "include": ["src"]
}
```

### 실수 4: extends로 물려받은 include가 합쳐질 거라고 기대함

```json
// tsconfig.base.json
{ "include": ["src"] }
```

```json
// tsconfig.test.json
{ "extends": "./tsconfig.base.json", "include": ["tests"] }
```

왜 틀렸나: 자식이 `include`를 적으면 부모 것은 **교체**됩니다. 결과 대상은 `tests`뿐이라 `src` 파일은 (테스트가 import 하는 것 말고는) 검사되지 않습니다.

고친 코드:

```json
{ "extends": "./tsconfig.base.json", "include": ["src", "tests"] }
```

### 실수 5: 기본값에 기대어 옵션을 비워 둠

```json
{ "compilerOptions": { "outDir": "dist" } }
```

왜 틀렸나: 같은 파일이 TypeScript 5.x에서는 `strict`가 꺼진 채로, 6.0에서는 켜진 채로 검사됩니다. `@types/node`도 5.x에서는 자동 포함, 6.0에서는 빠집니다. 팀원마다 설치된 버전이 다르면 결과가 달라집니다.

고친 코드: `strict`, `target`, `module`, `types`는 항상 적습니다.

```json
{
  "compilerOptions": {
    "target": "es2023",
    "module": "nodenext",
    "types": ["node"],
    "strict": true,
    "outDir": "dist"
  }
}
```

## 직접 해 보기

### 문제 1 ⭐ 구조 맞히기

다음 설정에서 `npx tsc` 후 `src/order/receipt.ts`의 결과 파일 경로는 어디일까요? `src/order/receipt.test.ts`는 결과에 포함될까요?

```json
{
  "compilerOptions": { "rootDir": "src", "outDir": "build", "module": "nodenext", "strict": true },
  "include": ["src"],
  "exclude": ["src/**/*.test.ts"]
}
```

::: details 정답 보기
- `build/order/receipt.js` — `rootDir`(`src`) 아래 구조가 `outDir`(`build`)로 그대로 옮겨집니다.
- `receipt.test.ts`는 `exclude`로 빠지므로 결과에 없습니다. 단, 다른 `src` 파일이 테스트 파일을 `import` 했다면 끌려 들어옵니다(보통 그럴 일은 없습니다).
:::

### 문제 2 ⭐ 에러 메시지 읽기

옵션 없이 `npx tsc --noEmit stock.ts`를 했더니 다음 에러가 났습니다(TypeScript 5.9). 무엇을 고쳐야 할까요?

```text
stock.ts(1,19): error TS2583: Cannot find name 'Map'. Do you need to change your target library? Try changing the 'lib' compiler option to 'es2015' or later.
```

::: details 정답 보기
기본 `target`이 옛 버전(`es5`)이라서 `Map`의 타입이 `lib`에 없습니다. `tsconfig.json`에 `"target": "es2022"`(또는 그 이상)를 적으면 `lib`도 자동으로 맞춰져 해결됩니다. 그리고 파일 이름을 넘기지 말고 `npx tsc --noEmit`로 실행해야 `tsconfig.json`이 적용됩니다.
:::

### 문제 3 ⭐⭐ 공통 설정 나누기

회사에 Node 서버 프로젝트가 두 개 있습니다. 둘 다 `strict`, `skipLibCheck`, `noUncheckedIndexedAccess`, `target: es2023`, `module: nodenext`를 씁니다. 서버 A는 `outDir`이 `dist`, 서버 B는 `build`입니다. `tsconfig.base.json`과 각 서버의 `tsconfig.json`을 작성하세요(두 서버는 `packages/a`, `packages/b` 폴더에 있고 base는 저장소 맨 위에 있습니다).

::: details 정답 보기
```json
// tsconfig.base.json (저장소 맨 위)
{
  "compilerOptions": {
    "target": "es2023",
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "types": ["node"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "skipLibCheck": true
  }
}
```

```json
// packages/a/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "rootDir": "src", "outDir": "dist" },
  "include": ["src"]
}
```

```json
// packages/b/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "rootDir": "src", "outDir": "build" },
  "include": ["src"]
}
```

`rootDir`·`outDir`·`include`는 **적은 파일 기준**으로 해석되므로 각 서버 파일에 적습니다. base에 `"outDir": "dist"`를 적으면 저장소 맨 위의 `dist`를 가리키게 되어 두 서버 결과가 한 폴더에 섞입니다.
:::

### 문제 4 ⭐⭐ 별칭 연결하기

Vite 프론트엔드 프로젝트에서 `~/components/Button`을 `src/components/Button`으로 연결하고 싶습니다. `tsconfig.json`과 `vite.config.ts`에 들어갈 부분을 쓰세요.

::: details 정답 보기
```json
{
  "compilerOptions": {
    "paths": {
      "~/*": ["./src/*"]
    }
  }
}
```

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
```

Vite 8을 쓴다면 `resolve: { tsconfigPaths: true }` 한 줄로 `tsconfig.json`의 `paths`를 그대로 읽게 할 수도 있습니다.
:::

### 문제 5 ⭐⭐⭐ 설정 진단

동료의 설정입니다. TypeScript 6.0으로 올렸더니 빌드가 멈췄고, 5.9로 되돌리면 빌드는 되지만 `strict` 관련 에러가 전혀 나지 않는다고 합니다. 문제점을 모두 찾아 고치세요(Node 서버, `tsc` 결과를 `node`로 실행).

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "moduleResolution": "node",
    "target": "es2020",
    "outDir": "dist",
    "paths": { "@/*": ["src/*"] }
  }
}
```

::: details 정답 보기
1. `baseUrl` — 6.0에서 지원 중단 에러(TS5101). 지우고 `paths`를 `./src/*`처럼 `tsconfig.json` 기준 상대 경로로 씁니다.
2. `moduleResolution: "node"`(node10) — 6.0에서 지원 중단(TS5107). Node 실행이면 `module`·`moduleResolution`을 `nodenext`로 바꿉니다.
3. `strict`를 적지 않음 — 5.x에서는 꺼져 있어서 엄격 검사가 전혀 없었습니다. `"strict": true`를 명시합니다.
4. `types`를 적지 않음 — 6.0부터 `@types/node`가 자동 포함되지 않습니다. `"types": ["node"]`를 명시합니다.
5. `rootDir`가 없음 — 결과 폴더 구조가 입력 파일에 따라 바뀔 수 있습니다. `"rootDir": "src"`, `"include": ["src"]`를 적습니다.
6. `paths` — `tsc` 결과를 `node`로 실행하면 별칭이 풀리지 않습니다. 상대 경로로 바꾸고 `paths`를 지우는 것이 가장 단순합니다.

```json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "types": ["node"],
    "strict": true,
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"]
}
```
:::

## 확인 퀴즈

1. `npx tsc src/index.ts`로 실행하면 `tsconfig.json`의 `outDir`이 적용될까요?
2. `exclude`에 넣은 파일이 그래도 컴파일되는 경우는 언제일까요?
3. `paths` 별칭을 설정했는데 `tsc`는 통과하고 `node dist/index.js`가 실패했습니다. 왜일까요?
4. `extends`로 물려받은 설정 파일 속 `outDir: "dist"`는 어느 폴더 기준일까요?
5. `target`과 `lib`의 차이를 한 문장으로 말해 보세요.

::: details 정답 보기
1. 아니요. 파일 이름을 넘기면 `tsconfig.json`을 읽지 않습니다.
2. `include`된 다른 파일이 그 파일을 `import` 할 때입니다.
3. `paths`는 타입 검사에만 쓰이고 결과 JS의 import 문자열을 바꾸지 않기 때문입니다. 실행 도구에도 별칭을 알려 주거나 상대 경로를 씁니다.
4. 그 값을 적은 **부모 설정 파일이 있는 폴더** 기준입니다.
5. `target`은 결과 JS의 **문법 수준**을, `lib`은 코드에서 쓸 수 있는 **내장 API의 타입 목록**을 정합니다.
:::

## 정리

- `tsconfig.json`은 `extends`·`compilerOptions`·`include`/`exclude`/`files`·`references`로 이루어지며, `npx tsc`(파일 이름 없이)로 실행할 때 읽힙니다.
- 옵션은 대상(`target`, `lib`)·모듈(`module`, `moduleResolution`)·엄격성(`strict` 등)·출력(`outDir`, `rootDir`, `noEmit`, `declaration`)·경로(`paths`)로 나눠 고릅니다.
- `rootDir`를 명시하면 `dist` 구조가 흔들리지 않고, 바깥 파일이 섞이면 TS6059로 알려 줍니다.
- `extends`는 부모를 깔고 덮어쓰며, `include` 등 목록은 교체되고 경로는 적은 파일 기준입니다.
- `paths`는 타입 검사 전용입니다. 번들러(`resolve.alias`)나 실행 도구에도 같은 별칭을 설정해야 합니다.
- 기본값은 버전마다 다릅니다(6.0부터 `strict` 기본 켜짐, `types` 기본 비어 있음). 중요한 옵션은 항상 명시합니다.

## 다음 단계

[strict 옵션 하나씩 이해하기](./02-strict-options) — `strict: true` 한 줄이 켜는 옵션 9개를 "꺼졌을 때 통과하는 위험한 코드"와 "켰을 때 나는 에러"로 하나씩 비교합니다.
