# Part 6. 프로젝트 설정과 도구

지금까지는 파일 한두 개를 `tsc`로 컴파일하거나 Playground에서 실행하며 **TypeScript 언어 자체**를 배웠습니다. 하지만 회사 프로젝트를 열어 보면 `.ts` 파일 말고도 `tsconfig.json`, `eslint.config.js`, `vitest.config.ts`, `vite.config.ts` 같은 설정 파일이 가득합니다. 그리고 실무에서 막히는 일의 상당수는 타입 문법이 아니라 이런 **설정과 도구** 때문에 생깁니다.

- "`tsc`는 통과하는데 `node`로 실행하면 모듈을 못 찾는다"
- "내 PC에서는 에러가 없는데 동료 PC에서는 에러가 난다"
- "Vite 빌드가 성공했는데 화면에서 타입 버그가 터졌다"

Part 6에서는 빈 폴더에서 시작해 **타입 검사·린트·테스트·빌드가 모두 갖춰진 TypeScript 프로젝트**를 직접 만들고, 이미 있는 JavaScript 프로젝트를 TypeScript로 옮기는 법까지 배웁니다.

## 이 파트가 필요한 이유

TypeScript는 "타입을 검사하는 도구"이지만, 혼자서 프로젝트를 굴러가게 하지는 않습니다. 실무 프로젝트는 여러 도구가 역할을 나눠 맡습니다.

| 도구 | 맡는 일 | 배우는 레슨 |
|---|---|---|
| `tsconfig.json` | 어떤 파일을 어떤 규칙으로 검사·변환할지 | 01, 02, 03 |
| ESLint + typescript-eslint | 타입은 맞지만 버그일 가능성이 높은 코드 찾기 | 04 |
| Prettier | 코드 모양(서식) 통일 | 04 |
| Vitest | 계산 결과가 맞는지 자동으로 확인 | 05 |
| tsc · tsx · Vite · tsup | 실행·배포 가능한 JavaScript 만들기 | 06 |

이 도구들 사이에는 **"누가 타입 검사를 하고, 누가 하지 않는가"** 라는 중요한 경계가 있습니다. 예를 들어 Vite·tsx·Vitest는 빠르게 실행하려고 타입을 지우기만 하고 검사하지 않습니다. 이 경계를 모르면 "빌드는 성공했는데 타입 에러가 운영에 나가는" 사고가 납니다. 이 파트는 각 레슨에서 이 점을 **실제로 실행해 확인**합니다.

## 학습 흐름

```text
01 tsconfig.json ──▶ 02 strict 옵션 ──▶ 03 모듈 시스템
   (설정 파일 구조)     (엄격 검사의 의미)    (import가 실제로 동작하는 원리)
                                               │
        ┌──────────────────────────────────────┘
        ▼
04 ESLint·Prettier ──▶ 05 Vitest ──▶ 06 빌드 도구 ──▶ 07 마이그레이션
   (린트·서식)           (테스트)       (실행·배포)       (JS → TS 실전)
```

| 순서 | 레슨 | 한 줄 요약 |
|---|---|---|
| 1 | tsconfig.json 완전 정복 | 옵션을 다섯 갈래로 나눠 고르고, Node·라이브러리·프론트 추천 설정 얻기 |
| 2 | strict 옵션 하나씩 이해하기 | "꺼져 있으면 통과하는 위험한 코드"를 직접 보고 켜는 이유 이해하기 |
| 3 | 모듈 시스템 | CommonJS와 ESM, `.js` 확장자, `nodenext`와 `bundler` 고르기 |
| 4 | ESLint와 Prettier | flat config, type-checked 규칙, 저장 시 자동 정리 |
| 5 | Vitest로 테스트 작성하기 | 단위 테스트, 비동기, 목, 타입 테스트, 커버리지 |
| 6 | 빌드 도구 | tsc·tsx·Node 타입 스트리핑·Vite·tsup 비교 |
| 7 | 마이그레이션 | 작은 JS 프로젝트를 파일 하나씩 TS로 옮기는 실습 |

01~03은 서로 기대고 있으니 순서대로 읽으세요. 04~06은 필요한 것부터 읽어도 되지만, 07 마이그레이션은 앞의 내용을 모두 씁니다.

## 이 파트를 마치면 할 수 있는 것

- 빈 폴더에서 `package.json`·`tsconfig.json`·`eslint.config.js`·`vitest.config.ts`를 갖춘 프로젝트를 혼자 만든다.
- 프로젝트 종류(Node 서버, 프론트엔드 앱, npm 라이브러리)에 맞는 `tsconfig` 옵션과 빌드 도구를 고른다.
- `strict` 옵션이 막아 주는 버그를 설명하고, 기존 프로젝트에 단계적으로 켠다.
- `TS2835`, `ERR_MODULE_NOT_FOUND`, `TS7016` 같은 설정·모듈 에러의 원인을 스스로 찾는다.
- CI에서 돌릴 `typecheck`·`lint`·`test` 스크립트를 구성한다.
- 운영 중인 JavaScript 프로젝트를 멈추지 않고 TypeScript로 옮기는 계획을 세운다.

## 실습 환경

이 파트는 명령어를 **Windows PowerShell** 기준으로 적고, macOS·Linux에서 다른 부분은 따로 적었습니다. 모든 예제는 작성 시점(2026-10)에 실제 프로젝트를 만들어 실행해 확인했습니다.

| 항목 | 버전 |
|---|---|
| Node.js | 24.13.1 |
| TypeScript | 5.9.3 (`npm install -D typescript@5`로 고정 설치) |
| ESLint / typescript-eslint | 10.13.0 / 8.72.1 |
| Prettier | 3.9.10 |
| Vitest | 5.0.5 |
| Vite / tsx / tsup | 8.3.5 / 4.23.15 / 9.0.0 |

::: info TypeScript 버전을 꼭 고정하세요
작성 시점에 `npm install -D typescript`처럼 버전 없이 설치하면 **7.0.2**(Go로 다시 만든 컴파일러)가 설치됩니다. 문법과 에러 메시지는 5.x와 거의 같지만, 6.0에서 지원 중단된 옵션(`baseUrl` 등)이 7.0에서는 제거되었고, typescript-eslint 8.72.x는 6.1 미만의 TypeScript만 지원합니다. 이 위키는 5.x 기준이므로 `typescript@5`로 설치합니다. 6.0부터 바뀐 기본값은 [01 레슨](./01-tsconfig#ts6-changes)에 정리했습니다.
:::

## 막힐 때 팁

::: tip 1. 먼저 "누가 실행하는가"를 물어보세요
모듈·경로 에러의 대부분은 "타입 검사기는 이렇게 이해했는데, 실제로 실행하는 Node·Vite는 다르게 이해하는" 데서 생깁니다. `tsc`가 통과했는데 실행이 실패하면, 실행하는 도구의 규칙(확장자, 별칭, `type` 필드)을 확인하세요.
:::

::: tip 2. 합쳐진 최종 설정을 눈으로 확인하세요
`extends`와 기본값이 섞이면 실제로 어떤 옵션이 켜져 있는지 헷갈립니다. `npx tsc --showConfig`는 최종 설정을, `npx tsc --listFilesOnly`는 검사 대상 파일 목록을 보여 줍니다.
:::

::: tip 3. 에러 메시지의 제안을 끝까지 읽으세요
`Did you mean './price.js'?`, `Try npm i --save-dev @types/lodash` 처럼 설정 관련 에러는 해결책을 직접 알려 주는 경우가 많습니다. [에러 메시지 읽는 법](../part0-start/06-how-to-read-errors)을 다시 떠올려 보세요.
:::

::: tip 4. 작은 실험 폴더를 따로 만드세요
회사 프로젝트에서 옵션을 이리저리 바꾸지 말고, 빈 폴더에 파일 두세 개로 같은 상황을 재현해 보세요. 이 파트의 예제도 모두 그렇게 확인했습니다. 원인이 훨씬 빨리 보입니다.
:::

::: warning 인터넷 예제의 날짜를 확인하세요
도구 생태계는 빠르게 바뀝니다. ESLint의 옛 `.eslintrc` 설정, `moduleResolution: "node"`, `baseUrl` 같은 예전 방식이 검색 결과에 아직 많이 나옵니다. 글의 작성 시점과 도구 버전을 확인하고, 공식 문서를 우선하세요.
:::

## 이 파트를 시작하기 전에

아래 내용이 익숙하지 않다면 먼저 복습하고 오세요.

- [첫 프로그램: tsc로 컴파일하고 실행하기](../part0-start/05-first-program)
- [모듈: import/export와 타입 전용 import](../part3-intermediate/09-modules)
- [async/await와 비동기 오류 처리](../part4-async/03-async-await)
- [선언 파일(.d.ts) · 선언 병합 · 모듈 보강](../part5-advanced/08-declaration-files)

<PartLessons dir="part6-tooling" />
