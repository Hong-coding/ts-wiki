---
title: "대규모 코드베이스: 타입 체크 성능 · 프로젝트 참조"
---

# 대규모 코드베이스: 타입 체크 성능 · 프로젝트 참조

<LessonMeta level="마스터" :minutes="45" prev="안티패턴을 찾아 고치고 코드 리뷰 체크리스트를 만들었습니다" />

## 이번에 배울 것

- `skipLibCheck`, `incremental`이 타입 검사 시간을 줄이는 원리를 설명할 수 있다.
- 프로젝트 참조(`composite`, `references`, `tsc -b`)로 큰 저장소를 여러 프로젝트로 나눌 수 있다.
- 모노레포(monorepo)의 기본 구조와 TypeScript 설정 방식을 이해한다.
- `--extendedDiagnostics`와 `--generateTrace`로 **느린 원인**을 숫자로 찾을 수 있다.
- 타입 검사를 느리게 만드는 타입 작성 습관을 알고 피할 수 있다.

## 먼저 알아 둘 것

- [tsconfig.json 완전 정복](../part6-tooling/01-tsconfig)
- [모듈 시스템: ESM · CommonJS · moduleResolution](../part6-tooling/03-module-systems)
- [빌드 도구: tsc · Vite · tsup · tsx](../part6-tooling/06-build-tools)
- [선언 파일(.d.ts)](../part5-advanced/08-declaration-files)

## 비유로 이해하기

대형 마트의 재고 조사를 생각해 봅시다. 매장이 작을 때는 직원 한 명이 매일 전 품목을 세도 됩니다. 매장이 수십 개 층으로 커지면 그렇게 할 수 없습니다. 그래서 큰 마트는 이렇게 합니다.

- **납품받은 박스는 다시 뜯어 세지 않는다** — 제조사가 이미 검수했으니까요. → `skipLibCheck`
- **어제 센 결과를 기록해 두고, 바뀐 칸만 다시 센다** → `incremental`
- **층별로 담당자를 두고, 각 층은 "층 요약표"만 다른 층에 넘긴다** → 프로젝트 참조와 `.d.ts`
- **유난히 오래 걸리는 칸을 측정해서** 진열 방식을 바꾼다 → `--extendedDiagnostics`, `--generateTrace`

이번 레슨은 이 네 가지를 TypeScript 프로젝트에 적용하는 방법입니다.

## 개념 설명

### 1단계: 왜 느려지는가

`tsc`가 하는 일은 크게 다섯 단계입니다.

```text
① 파일 찾기·읽기 (I/O) → ② 구문 분석 (Parse) → ③ 이름 연결 (Bind) → ④ 타입 검사 (Check) → ⑤ 출력 (Emit)
```

프로젝트가 커지면 보통 **④ 타입 검사**가 가장 오래 걸립니다. 원인은 대개 셋 중 하나입니다.

1. **검사하는 파일이 너무 많다** — 필요 없는 파일(빌드 결과물, 테스트 데이터)까지 `include`에 들어가 있거나, 모든 라이브러리 `.d.ts`를 매번 검사합니다.
2. **매번 처음부터 검사한다** — 한 줄 고쳐도 전체를 다시 검사합니다.
3. **특정 타입이 비싸다** — 거대한 유니온, 깊은 재귀 타입, 복잡한 조건부 타입이 수만 번 계산됩니다.

1·2는 **설정**으로, 3은 **타입 작성 습관**으로 해결합니다.

### 2단계: skipLibCheck — 라이브러리 선언 파일 검사 건너뛰기

```json
{
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```

- **하는 일**: 모든 `.d.ts`(선언 파일) **내부의** 타입 오류 검사를 건너뜁니다. `node_modules/@types/...`의 수만 줄이 대상입니다.
- **건너뛰지 않는 것**: 여러분의 코드가 라이브러리 타입을 **사용하는 부분**은 그대로 검사합니다. 라이브러리 함수를 잘못된 인수로 부르면 여전히 에러가 납니다.
- **대가**: 서로 충돌하는 두 `@types` 버전처럼 선언 파일 자체의 문제를 놓칠 수 있습니다. 그래서 라이브러리를 **배포하는 쪽**에서는 CI에서 한 번은 끄고 검사하기도 합니다.

`tsc --init`으로 만든 설정과 Vite 등 대부분의 프로젝트 템플릿에 이미 켜져 있습니다. 업무 애플리케이션이라면 켜 두는 것이 일반적입니다.

### 3단계: incremental — 바뀐 부분만 다시 검사

```json
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": "./.cache/tsbuildinfo"
  }
}
```

- **하는 일**: 검사 결과(파일별 정보, 의존 관계, 에러 목록)를 `.tsbuildinfo` 파일에 저장해 두고, 다음 실행 때 **바뀐 파일과 그 영향을 받는 파일만** 다시 검사합니다.
- `tsBuildInfoFile`을 생략하면 출력 폴더 근처에 만들어집니다. **`.gitignore`에 추가**합니다(PC마다 다른 캐시이므로).
- `--noEmit`과 함께 써도 동작합니다(TypeScript 4.0부터). 그래서 Vite 프로젝트처럼 "타입 검사만 tsc로" 하는 구성에도 쓸 수 있습니다.
- 뒤에서 볼 `composite: true`를 켜면 `incremental`도 자동으로 켜집니다.

::: tip 에디터는 이미 바뀐 부분만 계산합니다
VS Code의 TypeScript 언어 서버(tsserver)는 결과를 메모리에 들고 있으며 바뀐 부분만 다시 계산합니다. `incremental`은 **명령줄 `tsc`와 CI**를 빠르게 하는 옵션입니다.
:::

### 4단계: 검사 대상 파일 줄이기

설정 실수로 검사 대상이 불필요하게 늘어난 경우가 생각보다 많습니다. 먼저 **무엇을 검사하고 있는지** 확인합니다.

```bash
# 검사에 포함된 모든 파일 목록
npx tsc --listFilesOnly

# 각 파일이 "왜" 포함되었는지 (include 때문인지, 어떤 import 때문인지)
npx tsc --explainFiles > files.txt

# extends까지 합쳐진 최종 설정 확인
npx tsc --showConfig
```

자주 발견되는 문제와 해결은 다음과 같습니다.

| 발견한 것 | 해결 |
|---|---|
| `dist/`, `build/`의 `.js`·`.d.ts`가 포함됨 | `include`를 `["src"]`로 좁히거나 `exclude`에 추가 |
| 쓰지 않는 `@types/*` 전역 타입이 잔뜩 로드됨 | `"types": ["node"]`처럼 필요한 것만 명시 |
| `allowJs`로 거대한 JS 번들 파일까지 검사 | 해당 폴더를 `exclude` |
| 테스트용 큰 `.json`을 `resolveJsonModule`로 import | 런타임에 읽도록 바꾸거나 별도 프로젝트로 분리 |

::: info `types`의 뜻
`compilerOptions.types`를 지정하지 않으면 `node_modules/@types` 아래의 **모든** 패키지가 전역으로 로드됩니다. 지정하면 그 목록만 로드됩니다(직접 `import`하는 패키지의 타입은 목록과 관계없이 정상적으로 찾습니다).
:::

### 5단계: 프로젝트 참조 — 큰 프로젝트를 나누기

파일이 수천 개인 프로젝트 하나를 **여러 개의 작은 프로젝트**로 나누고, 서로의 관계를 tsconfig에 적는 기능이 **프로젝트 참조**(project references, TypeScript 3.0부터)입니다.

나누면 좋은 점은 다음과 같습니다.

- **바뀐 프로젝트만 다시 빌드**합니다. `shared`를 고치지 않았으면 `shared`는 건너뜁니다.
- 다른 프로젝트를 쓸 때 소스 전체가 아니라 **`.d.ts`(요약표)** 를 읽으므로 가볍습니다.
- `pos`가 `admin` 코드를 몰래 import하는 것처럼 **허락하지 않은 의존**을 막을 수 있습니다(참조하지 않은 프로젝트의 소스를 가져오면 에러).

다음은 매장 시스템을 공통 모듈 `shared`와 POS 앱 `pos`로 나눈 예입니다.

```text
store-system/
├─ tsconfig.base.json        ← 공통 옵션
├─ tsconfig.json             ← 전체 빌드 진입점 (참조만 나열)
├─ package.json              ← "type": "module"
└─ packages/
   ├─ shared/
   │  ├─ tsconfig.json       ← composite: true
   │  └─ src/price.ts
   └─ pos/
      ├─ tsconfig.json       ← references: shared
      └─ src/main.ts
```

**공통 옵션** (`tsconfig.base.json`)

```json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "nodenext",
    "strict": true,
    "skipLibCheck": true,
    "declaration": true,
    "sourceMap": true
  }
}
```

**참조되는 쪽** (`packages/shared/tsconfig.json`)

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"]
}
```

`composite: true`는 "이 프로젝트는 다른 프로젝트에게 참조될 수 있다"는 표시입니다. 켜면 다음이 적용됩니다.

- `declaration`이 자동으로 켜집니다(다른 프로젝트가 읽을 `.d.ts`를 만들어야 하므로).
- `incremental`이 자동으로 켜집니다.
- 모든 소스 파일이 `include`/`files`에 들어 있어야 하고, `rootDir` 아래에 있어야 합니다.

**참조하는 쪽** (`packages/pos/tsconfig.json`)

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"],
  "references": [{ "path": "../shared" }]
}
```

**전체 진입점** (루트 `tsconfig.json`)

```json
{
  "files": [],
  "references": [{ "path": "packages/shared" }, { "path": "packages/pos" }]
}
```

`"files": []`는 "루트 자체에는 검사할 파일이 없고, 참조만 모아 둔다"는 뜻입니다. 이런 tsconfig를 **솔루션(solution) 설정**이라고도 부릅니다.

**소스 코드**

```ts
// packages/shared/src/price.ts
export interface Product {
  id: string
  name: string
  price: number
}

export function formatPrice(value: number): string {
  return `${value.toLocaleString('ko-KR')}원`
}
```

```ts
// packages/pos/src/main.ts
import { formatPrice, type Product } from '../../shared/dist/price.js'

const coffee: Product = { id: 'P001', name: '아메리카노', price: 4500 }
console.log(coffee.name, formatPrice(coffee.price))
```

### 6단계: tsc -b — 빌드 모드

프로젝트 참조는 일반 `tsc`가 아니라 **빌드 모드** `tsc -b`(`--build`)로 빌드합니다.

```bash
npx tsc -b --verbose
node packages/pos/dist/main.js
```

```text
Projects in this build:
    * packages/shared/tsconfig.json
    * packages/pos/tsconfig.json
    * tsconfig.json

Project 'packages/shared/tsconfig.json' is out of date because output file 'packages/shared/tsconfig.tsbuildinfo' does not exist
Building project '.../packages/shared/tsconfig.json'...
Project 'packages/pos/tsconfig.json' is out of date because output file 'packages/pos/tsconfig.tsbuildinfo' does not exist
Building project '.../packages/pos/tsconfig.json'...

아메리카노 4,500원
```

해설:

- `tsc -b`는 참조 관계를 따라 **의존하는 순서대로**(`shared` → `pos`) 빌드합니다.
- `--verbose`는 "왜 빌드하는지/건너뛰는지"를 알려 줍니다. 처음에는 `.tsbuildinfo`가 없어서 둘 다 빌드합니다. (실제 출력에는 줄마다 시각이 앞에 붙습니다.)

아무것도 고치지 않고 한 번 더 실행하면 다음처럼 **모두 건너뜁니다**.

```text
Project 'packages/shared/tsconfig.json' is up to date because newest input 'packages/shared/src/price.ts' is older than output 'packages/shared/tsconfig.tsbuildinfo'
Project 'packages/pos/tsconfig.json' is up to date because newest input 'packages/pos/src/main.ts' is older than output 'packages/pos/tsconfig.tsbuildinfo'
```

자주 쓰는 빌드 모드 옵션입니다.

| 명령 | 뜻 |
|---|---|
| `tsc -b` | 바뀐 프로젝트만 순서대로 빌드 |
| `tsc -b --verbose` | 빌드/건너뜀 이유 출력 |
| `tsc -b --clean` | 빌드 결과물 삭제 |
| `tsc -b --force` | 캐시 무시하고 전부 다시 빌드 |
| `tsc -b --watch` | 파일이 바뀔 때마다 자동 빌드 |

참조(`references`)를 빼먹은 채 다른 프로젝트의 **소스**를 import하면 이런 에러가 납니다(경로는 줄였습니다).

```text
error TS6059: File '.../packages/shared/src/price.ts' is not under 'rootDir' '.../packages/pos/src'. 'rootDir' is expected to contain all source files.
error TS6307: File '.../packages/shared/src/price.ts' is not listed within the file list of project '.../packages/pos/tsconfig.json'. Projects must list all files or use an 'include' pattern.
```

이 에러는 "**의존 관계를 tsconfig에 선언하라**"는 뜻입니다. `references`에 추가하면 TypeScript가 그 소스 파일 대신 `shared`가 만든 `.d.ts`로 연결해 검사합니다.

### 7단계: 모노레포 개요

**모노레포**(monorepo)는 여러 패키지(앱·라이브러리)를 **하나의 저장소**에서 관리하는 방식입니다. 예를 들어 POS 앱, 관리자(BO) 웹, 공통 타입·유틸 패키지를 한 저장소에 둡니다.

```text
store-monorepo/
├─ package.json            ← "workspaces": ["packages/*", "apps/*"]
├─ tsconfig.base.json
├─ packages/
│  ├─ types/               ← 공통 API 타입 (@store/types)
│  └─ utils/               ← 공통 함수 (@store/utils)
└─ apps/
   ├─ pos/                 ← React POS
   └─ admin/               ← React 관리자
```

모노레포는 보통 세 층의 도구로 구성합니다.

| 층 | 하는 일 | 대표 도구 |
|---|---|---|
| 패키지 연결 | `@store/types`를 `node_modules`에 링크해 이름으로 import | npm·yarn·pnpm의 **workspaces** |
| 타입 연결 | 패키지 간 타입 검사 순서·범위 | TypeScript **프로젝트 참조** |
| 작업 실행 | 바뀐 패키지만 빌드·테스트, 결과 캐시 | Turborepo, Nx 등 |

실제 모노레포에서는 위 예제처럼 상대 경로(`../../shared/dist/...`) 대신 **패키지 이름**(`import { formatPrice } from '@store/utils'`)으로 import합니다. workspaces가 `node_modules/@store/utils`를 실제 폴더로 연결하고, 각 패키지 `package.json`의 `exports`(또는 `types`) 필드가 `.d.ts` 위치를 알려 줍니다.

::: warning 모노레포가 언제나 정답은 아닙니다
모노레포는 공통 코드 공유와 여러 패키지를 한 번에 바꾸기가 쉬운 대신, 빌드 설정·CI·권한 관리가 복잡해집니다. 공유하는 코드가 적다면 저장소를 나누고 공통 패키지를 사내 레지스트리로 배포하는 편이 단순할 수 있습니다. 팀 상황에 맞춰 고릅니다.
:::

### 8단계: 느린 원인 측정하기 — --extendedDiagnostics

"느린 것 같다"가 아니라 **숫자**로 확인하는 것이 먼저입니다.

```bash
npx tsc --noEmit --extendedDiagnostics
```

작은 프로젝트(`shared`)에서 실행한 결과 일부입니다(PC에 따라 시간은 다릅니다).

```text
Files:                         64
Lines of Library:           39560
Lines of TypeScript:           10
Identifiers:                43653
Symbols:                    28794
Types:                         84
Instantiations:                 0
Memory used:               58199K
I/O Read time:              0.14s
Parse time:                 0.30s
Bind time:                  0.11s
Total time:                 0.67s
```

읽는 법은 다음과 같습니다.

| 항목 | 뜻 | 의심할 때 |
|---|---|---|
| Files | 검사에 포함된 파일 수 | 생각보다 많으면 `--explainFiles`로 이유 확인 |
| Lines of Library | 표준 라이브러리 `.d.ts` 줄 수 | `lib` 설정 확인 |
| Types | 만들어진 타입 개수 | 코드에 비해 크면 비싼 타입 의심 |
| Instantiations | 제네릭 등을 구체화한 횟수 | 수백만 단위면 복잡한 제네릭·조건부 타입 의심 |
| Check time | 타입 검사 시간 | 가장 큰 비중이면 타입 문제 |
| I/O · Parse time | 파일 읽기·분석 시간 | 크면 파일 수 문제 |

예를 들어 4자리 상품 코드를 템플릿 리터럴 타입으로 정의하면, 코드는 세 줄인데 타입이 1만 개 넘게 생깁니다.

```ts
type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
type ProductCode = `${Digit}${Digit}${Digit}${Digit}` // 10 × 10 × 10 × 10 = 10,000가지
const code: ProductCode = '1234'
```

같은 파일을 `const code: string = '1234'`로 바꾼 것과 비교한 결과입니다(`--skipLibCheck`).

```text
                  string 버전   ProductCode 버전
Types:                     86             11217
Memory used:           56255K            70048K
```

5자리(10만 가지)로 늘리면 아예 `Expression produces a union type that is too complex to represent.`(TS2590) 에러가 납니다. 이런 형식 검사는 거대한 타입보다 **런타임 검증**(정규식 `/^\d{4}$/` 등)이나 브랜드 타입이 알맞습니다([안티패턴 14](./02-anti-patterns)).

### 9단계: 느린 지점 찾기 — --generateTrace

`--extendedDiagnostics`가 "어디가 아픈지"라면 `--generateTrace`는 **"어느 파일의 어느 타입이"** 를 알려 주는 정밀 검사입니다(TypeScript 4.1부터).

```bash
npx tsc --noEmit --generateTrace trace-out
```

`trace-out` 폴더에 두 파일이 생깁니다.

- `trace.json` — 시간 순서로 기록한 검사 이벤트입니다. 크롬 주소창에 `about://tracing`을 열거나 [Perfetto](https://ui.perfetto.dev/) 웹 화면에 불러와 막대그래프로 봅니다. 긴 막대가 오래 걸린 파일·식입니다.
- `types.json` — 만들어진 타입 목록입니다.

파일이 크면 눈으로 보기 어려우므로 TypeScript 팀이 만든 분석 도구를 씁니다.

```bash
npx @typescript/analyze-trace trace-out
```

이 도구는 오래 걸린 지점(hot spot)을 파일·줄 단위로 요약해 줍니다. 프로젝트 참조를 쓰는 경우 `tsc -b --generateTrace trace-out`으로 프로젝트별 추적 파일을 만들 수 있습니다.

::: tip 측정 → 가설 → 수정 → 재측정
성능 작업은 항상 측정부터 합니다. 수정한 뒤 `--extendedDiagnostics`의 `Check time`·`Instantiations`를 **전후 비교**해서 실제로 나아졌는지 확인합니다. 느낌만으로 바꾼 코드는 더 복잡해지기만 하는 경우가 많습니다.
:::

### 10단계: 복잡한 타입의 성능 팁

TypeScript 공식 저장소 위키의 Performance 문서에 정리된 권장 사항을 중심으로 정리했습니다.

**① 인터섹션(`&`)보다 `interface extends`**

```ts
interface Product {
  id: string
  name: string
  price: number
}
interface Timestamps {
  createdAt: string
  updatedAt: string
}

// 느릴 수 있음: 쓰는 곳마다 속성을 합쳐 계산
type ProductRow1 = Product & Timestamps & { stock: number }

// 권장: 한 번 만들어 캐시되는 이름 있는 타입
interface ProductRow2 extends Product, Timestamps {
  stock: number
}
const row: ProductRow2 = { id: 'P001', name: '아메리카노', price: 4500, stock: 30, createdAt: '', updatedAt: '' }
console.log(row.stock)
// 출력: 30
```

`interface`는 관계를 한 번 계산해 캐시하고, 속성 충돌도 선언 시점에 알려 줍니다. 인터섹션은 쓰는 곳마다 다시 합쳐질 수 있습니다.

**② 공개 함수에 반환 타입 표기**

반환 타입을 추론에 맡기면, 이 함수를 쓰는 곳마다(그리고 `.d.ts`를 만들 때) 추론을 다시 해야 할 수 있습니다. 특히 복잡한 객체를 돌려주는 함수는 반환 타입에 **이름 있는 타입**을 적습니다.

**③ 거대한 유니온 피하기**

유니온 멤버가 수천~수만 개가 되면 할당 검사 때마다 멤버를 비교합니다. 앞 단계의 템플릿 리터럴 조합처럼 **곱으로 늘어나는** 유니온을 조심합니다.

**④ 깊은 재귀 · 조건부 타입 줄이기**

`DeepPartial`, 경로 문자열을 만드는 `Paths` 같은 재귀 타입을 거대한 객체 타입에 적용하면 비용이 급격히 커집니다. 필요한 깊이까지만 계산하거나, 중간 결과에 **이름 있는 타입 별칭**을 붙여 재사용합니다([재귀 타입](../part5-advanced/05-recursive-types)).

**⑤ 이름 있는 타입 쓰기**

같은 익명 객체 타입을 여러 곳에 반복해 쓰기보다 `type`/`interface`로 이름을 붙이면, 에러 메시지도 짧아지고 `.d.ts`도 작아집니다.

### 11단계: isolatedDeclarations (TypeScript 5.5부터)

프로젝트 참조에서 `pos`를 검사하려면 먼저 `shared`의 `.d.ts`가 있어야 합니다. 그런데 `.d.ts`를 만들려면 `shared` 전체를 **타입 검사**해야 해서, 결국 순서대로 기다려야 합니다.

`isolatedDeclarations`(TypeScript **5.5**부터)는 "**파일 하나만 보고도** `.d.ts`를 만들 수 있게 코드를 쓰라"고 강제하는 옵션입니다. 그러면 타입 검사 없이 빠른 도구가 `.d.ts`를 **병렬로** 만들 수 있어, 큰 모노레포의 빌드를 빠르게 할 수 있습니다.

```json
{
  "compilerOptions": {
    "declaration": true,
    "isolatedDeclarations": true
  }
}
```

이 옵션을 켜면 export하는 함수에 반환 타입을 쓰지 않았을 때 에러가 납니다.

```ts
export function calcTotal(price: number, quantity: number) {
  // ❌ Function must have an explicit return type annotation with --isolatedDeclarations. (TS9007)
  return price * quantity
}
export const TAX_RATE = 0.1 // 리터럴 값은 파일만 보고도 타입을 알 수 있어 괜찮음
```

고친 코드입니다.

```ts
export function calcTotal(price: number, quantity: number): number {
  return price * quantity
}
export const TAX_RATE = 0.1
```

해설:

- **export하는 것**의 타입만 명시하면 됩니다. 함수 안의 지역 변수는 여전히 추론에 맡깁니다.
- 기존 대형 프로젝트에 한 번에 켜면 에러가 많이 납니다. VS Code의 빠른 수정(`Ctrl + .`)이 반환 타입을 자동으로 넣어 줍니다.
- 당장 병렬 `.d.ts` 생성 도구를 쓰지 않더라도, 공개 API의 타입이 명시적이라 **읽기 쉬워지는** 장점이 있습니다.

## 자주 하는 실수

### 실수 1: 느리다고 strict를 끄기

```json
{
  "compilerOptions": {
    "strict": false
  }
}
```

**왜 틀렸나**: `strict` 옵션들은 검사 **규칙**이지 검사 **양**을 크게 바꾸지 않습니다. 끄면 속도는 거의 그대로인데 `null` 관련 버그를 잡는 능력만 잃습니다.

**고친 설정**: 측정(`--extendedDiagnostics`)부터 하고, 파일 수·라이브러리 검사·캐시를 먼저 손봅니다.

```json
{
  "compilerOptions": {
    "strict": true,
    "skipLibCheck": true,
    "incremental": true
  },
  "include": ["src"]
}
```

### 실수 2: 프로젝트 참조를 쓰면서 `tsc -p`로 빌드하기

```bash
npx tsc -p packages/pos
```

**왜 틀렸나**: `-p`(일반 모드)는 참조된 프로젝트(`shared`)를 **대신 빌드해 주지 않습니다**. `shared`의 `.d.ts`가 없거나 오래되었으면 엉뚱한 에러가 나거나 옛 타입으로 검사합니다.

**고친 명령**:

```bash
npx tsc -b packages/pos   # shared부터 필요한 만큼 빌드
```

### 실수 3: `.tsbuildinfo`를 Git에 올리기

**왜 틀렸나**: 캐시 파일은 PC마다 다르고, 머지할 때 충돌이 나며, 다른 사람의 캐시 때문에 검사를 잘못 건너뛸 수도 있습니다.

**고친 방법**: `.gitignore`에 추가합니다. CI에서 캐시하고 싶다면 CI의 캐시 기능으로 저장합니다.

```text
# .gitignore
*.tsbuildinfo
dist/
```

### 실수 4: composite 프로젝트에서 include 밖의 파일을 import하기

**왜 틀렸나**: `composite: true`인 프로젝트는 **모든 소스가 include/files에 명시**되어야 합니다. 범위 밖 파일을 import하면 TS6307이 납니다.

**고친 방법**: `"include": ["src"]`처럼 폴더 단위로 지정하고 소스를 `rootDir` 아래에 둡니다. 다른 프로젝트의 파일이라면 `references`로 연결합니다.

## 직접 해 보기

### 문제 1 ⭐ 옵션 고르기

다음 상황에 맞는 옵션을 고르세요: `skipLibCheck`, `incremental`, `types`, `composite`.

1. `node_modules/@types`에 쓰지도 않는 전역 타입이 30개 로드된다.
2. CI에서 한 줄만 고쳐도 전체 타입 검사가 4분 걸린다.
3. `@types/react` 두 버전이 충돌해서 내 코드와 관계없는 에러가 난다.
4. 다른 프로젝트가 이 프로젝트를 참조할 수 있게 하고 싶다.

::: details 정답 보기
1. `types` — `"types": ["node"]`처럼 필요한 것만 지정합니다.
2. `incremental` — 이전 결과를 `.tsbuildinfo`에 저장해 재사용합니다(CI라면 캐시 보존 필요).
3. `skipLibCheck` — `.d.ts` 내부 검사를 건너뜁니다. 근본적으로는 중복 버전을 정리하는 것이 좋습니다.
4. `composite`
:::

### 문제 2 ⭐⭐ 프로젝트 참조 설정

`packages/admin` 프로젝트가 `packages/shared`를 쓰도록 `admin/tsconfig.json`을 작성하고, 루트 `tsconfig.json`에 추가해 보세요.

::: details 정답 보기

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"],
  "references": [{ "path": "../shared" }]
}
```

루트:

```json
{
  "files": [],
  "references": [
    { "path": "packages/shared" },
    { "path": "packages/pos" },
    { "path": "packages/admin" }
  ]
}
```

`npx tsc -b --verbose`로 `shared`가 먼저 빌드되는지 확인합니다.
:::

### 문제 3 ⭐⭐ 진단 결과 해석

`--extendedDiagnostics` 결과가 다음과 같습니다. 무엇부터 의심해야 할까요?

```text
Files:                       4120
Lines of TypeScript:        81000
Instantiations:            320000
Check time:                  6.2s
I/O Read time:               9.8s
Parse time:                  7.5s
```

::: details 정답 보기
타입 검사(`Check time` 6.2초)보다 **파일 읽기와 구문 분석**(I/O 9.8초 + Parse 7.5초)이 더 깁니다. 파일 수(4120개)가 원인일 가능성이 큽니다. `--explainFiles`로 `dist/`·테스트 데이터·불필요한 `@types`가 포함되지 않았는지 확인하고 `include`/`exclude`/`types`를 정리합니다.
:::

### 문제 4 ⭐⭐⭐ isolatedDeclarations 대비

`isolatedDeclarations`를 켰을 때 에러가 날 곳을 찾아 고쳐 보세요.

```ts
export const getDiscount = (grade: 'VIP' | 'BASIC') => (grade === 'VIP' ? 0.1 : 0)
export const defaultGrade = 'BASIC'
function helper(n: number) {
  return n * 2
}
export function calcPrice(price: number, grade: 'VIP' | 'BASIC') {
  return helper(price) * (1 - getDiscount(grade))
}
```

::: details 정답 보기
export하는 함수 `getDiscount`, `calcPrice`에 반환 타입이 없어 에러가 납니다. `defaultGrade`는 리터럴이라 괜찮고, export하지 않는 `helper`는 검사 대상이 아닙니다.

```ts
export const getDiscount = (grade: 'VIP' | 'BASIC'): number => (grade === 'VIP' ? 0.1 : 0)
export const defaultGrade = 'BASIC'
function helper(n: number) {
  return n * 2
}
export function calcPrice(price: number, grade: 'VIP' | 'BASIC'): number {
  return helper(price) * (1 - getDiscount(grade))
}
```
:::

## 확인 퀴즈

1. `skipLibCheck: true`를 켜면 내 코드에서 라이브러리 함수를 잘못 호출한 것도 놓치나요?
2. `composite: true`를 켜면 자동으로 켜지는 옵션 두 가지는 무엇인가요?
3. 프로젝트 참조를 쓰는 저장소를 빌드할 때 써야 하는 명령은 무엇인가요?
4. `--generateTrace`가 만드는 두 파일의 이름은 무엇인가요?
5. `isolatedDeclarations`는 어떤 버전부터 쓸 수 있고, 무엇을 강제하나요?

::: details 정답 보기
1. 아닙니다. `.d.ts` **내부**의 검사만 건너뛰며, 내 코드가 라이브러리를 사용하는 부분은 그대로 검사합니다.
2. `declaration`과 `incremental`입니다.
3. `tsc -b`(`--build`)입니다.
4. `trace.json`과 `types.json`입니다.
5. TypeScript 5.5부터입니다. export하는 선언의 타입을 파일 하나만 보고 알 수 있도록 명시하게 강제합니다(예: 반환 타입 표기).
:::

## 정리

- 느린 원인은 **파일 수 · 재검사 · 비싼 타입** 중 하나입니다. `--extendedDiagnostics`로 먼저 측정합니다.
- `skipLibCheck`는 `.d.ts` 내부 검사를, `incremental`은 반복 검사를 줄입니다. `--explainFiles`·`types`·`include`로 검사 대상을 정리합니다.
- 프로젝트 참조(`composite` + `references` + `tsc -b`)는 큰 저장소를 나눠 **바뀐 부분만 빌드**하고 의존 방향을 강제합니다.
- 모노레포는 workspaces(패키지 연결) + 프로젝트 참조(타입) + 작업 실행 도구로 구성합니다.
- `--generateTrace`와 `@typescript/analyze-trace`로 느린 파일·타입을 찾고, `interface extends`·반환 타입 표기·거대 유니온 회피로 고칩니다.
- `isolatedDeclarations`(5.5+)는 export 타입을 명시하게 해 `.d.ts`를 병렬로 만들 수 있게 합니다.

## 다음 단계

[단계별 자가 진단 테스트](./04-self-assessment) — Part 0부터 Part 8까지 파트별 문제로 내 실력을 점검하고, 점수에 따라 복습할 레슨을 찾습니다.
