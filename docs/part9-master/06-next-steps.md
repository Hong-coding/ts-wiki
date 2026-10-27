---
title: 다음 단계와 추천 학습 자료
---

# 다음 단계와 추천 학습 자료

<LessonMeta level="마스터" :minutes="20" prev="면접·실무 질문 50개로 아는 것을 말로 설명하는 연습을 했습니다" />

## 이번에 배울 것

- 궁금한 것이 생겼을 때 **어떤 자료를 먼저 볼지** 용도별로 고를 수 있다.
- 새 TypeScript 버전이 나왔을 때 변경 사항을 스스로 찾아 읽을 수 있다.
- 이 위키를 마친 뒤에도 실력을 계속 키우는 학습 습관을 세울 수 있다.

## 먼저 알아 둘 것

- 없음. 다만 [단계별 자가 진단 테스트](./04-self-assessment)의 결과가 있으면 어떤 자료부터 볼지 정하기 쉽습니다.

## 비유로 이해하기

운전면허를 딴 날이 운전 실력이 가장 낮은 날입니다. 면허는 "혼자 도로에 나가도 된다"는 허락일 뿐, 실력은 그 뒤에 쌓입니다. 좋은 운전자는 지도(공식 문서)를 보는 법, 새로 생긴 도로(새 버전) 소식을 챙기는 법, 어려운 길(연습 문제)을 일부러 달려 보는 습관을 갖고 있습니다.

이 위키를 끝낸 지금이 TypeScript 면허를 딴 날입니다. 이 레슨은 앞으로 쓸 **지도와 습관**을 소개합니다.

## 개념 설명

### 자료를 고르는 원칙

인터넷에는 TypeScript 자료가 아주 많지만, 오래되었거나 틀린 내용도 섞여 있습니다. 다음 순서로 신뢰합니다.

1. **공식 자료** — TypeScript 팀이 만든 핸드북·tsconfig 레퍼런스·릴리스 노트·블로그.
2. **공식 저장소의 이슈·위키** — 동작이 이상할 때 "버그인지, 의도된 동작인지" 확인하는 곳.
3. **널리 검증된 커뮤니티 자료** — 많은 사람이 오랫동안 쓰고 고쳐 온 자료.
4. **개인 블로그·영상** — 도움이 되지만 **작성 날짜와 TS 버전**을 꼭 확인합니다.

::: warning 날짜를 확인하세요
TypeScript는 1년에 여러 차례 새 버전이 나옵니다. 3~4년 전 글의 "이건 안 됩니다"가 지금은 되는 경우가 많습니다(예: `satisfies`는 4.9, `moduleResolution: "bundler"`는 5.0, `isolatedDeclarations`는 5.5부터). 글을 읽을 때는 작성 시점과 버전을 먼저 봅니다.
:::

### 1. 공식 문서 — 개념을 정확히 확인할 때

| 자료 | 주소 | 이럴 때 |
|---|---|---|
| TypeScript 핸드북 | [https://www.typescriptlang.org/docs/handbook/intro.html](https://www.typescriptlang.org/docs/handbook/intro.html) | 개념을 처음부터 정확한 용어로 다시 읽고 싶을 때 |
| tsconfig 레퍼런스 | [https://www.typescriptlang.org/tsconfig](https://www.typescriptlang.org/tsconfig) | 옵션 하나의 뜻·기본값·도입 버전을 확인할 때 |
| TS Playground | [https://www.typescriptlang.org/play](https://www.typescriptlang.org/play) | 코드를 작게 줄여 재현하고, 버전을 바꿔 결과를 비교할 때 |
| 선언 파일 가이드 | [https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html) | `.d.ts`를 직접 작성·배포할 때 |

공식 핸드북은 영어지만, 이 위키에서 배운 용어(narrowing, union, generic, mapped type 등)를 알고 있으면 충분히 읽을 수 있습니다. 브라우저 번역 기능을 함께 써도 좋습니다. 단, 번역이 용어를 이상하게 바꾸는 경우가 있으니 코드와 원문 용어를 같이 봅니다.

### 2. 릴리스 노트와 공식 블로그 — 새 버전 소식을 챙길 때

| 자료 | 주소 | 이럴 때 |
|---|---|---|
| 릴리스 노트 (예: 5.6) | [https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-6.html](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-6.html) | 버전별로 추가·변경된 기능을 예제와 함께 볼 때. 왼쪽 메뉴에서 다른 버전으로 이동할 수 있습니다. |
| TypeScript 공식 블로그 | [https://devblogs.microsoft.com/typescript/](https://devblogs.microsoft.com/typescript/) | 베타·RC·정식 출시 소식과 기능 설명 |
| GitHub 저장소 | [https://github.com/microsoft/TypeScript](https://github.com/microsoft/TypeScript) | 이슈 검색, 로드맵(Iteration Plan), 버그 보고 |
| 성능 위키 | [https://github.com/microsoft/TypeScript/wiki/Performance](https://github.com/microsoft/TypeScript/wiki/Performance) | 타입 검사 성능 문제를 진단·개선할 때 |

**새 버전이 나왔을 때 읽는 법**

1. 블로그의 출시 글에서 **목차만** 먼저 훑습니다.
2. "Breaking Changes"(호환성이 깨지는 변경) 절을 **반드시** 읽습니다. 업그레이드할 때 에러가 날 수 있는 부분입니다.
3. 관심 있는 기능 하나를 골라 Playground에서 버전을 바꿔 가며 직접 실행해 봅니다.
4. 팀 프로젝트라면 `package.json`의 TypeScript 버전을 올린 브랜치에서 `tsc --noEmit`을 돌려 영향을 확인합니다.

### 3. 타입 레벨 훈련 — 고급 타입 실력을 키울 때

| 자료 | 주소 | 이럴 때 |
|---|---|---|
| type-challenges | [https://github.com/type-challenges/type-challenges](https://github.com/type-challenges/type-challenges) | 쉬움 → 보통 → 어려움 단계의 타입 퍼즐. Playground 링크로 바로 풀 수 있습니다. |

[타입 레벨 프로그래밍 훈련](../part5-advanced/09-type-challenges)에서 몇 문제를 풀어 보았다면, 이제 **하루 한 문제**를 목표로 쉬움 단계를 모두 풀어 봅니다. 막히면 다른 사람의 풀이(Issues 탭)를 보되, 본 뒤에는 **보지 않고 다시 풀기**를 합니다.

::: tip 업무 코드와 균형 맞추기
type-challenges의 어려운 문제는 라이브러리 작성자 수준입니다. 실력 향상에는 좋지만, 업무 코드에 그대로 쓰면 [안티패턴 17(지나치게 영리한 타입)](./02-anti-patterns)이 될 수 있습니다. "읽을 수 있는 능력"을 키우는 훈련으로 생각하세요.
:::

### 4. 타입 정의 생태계 — 라이브러리 타입을 다룰 때

| 자료 | 주소 | 이럴 때 |
|---|---|---|
| DefinitelyTyped | [https://github.com/DefinitelyTyped/DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) | `@types/패키지`의 원본 저장소. 타입이 틀렸을 때 확인하고 수정 기여(PR)를 할 수 있습니다. |
| typescript-eslint | [https://typescript-eslint.io/](https://typescript-eslint.io/) | 린트 규칙의 의도와 설정 방법 |
| zod 공식 문서 | [https://zod.dev/](https://zod.dev/) | 런타임 검증 스키마 작성법 |

라이브러리 타입이 이상하다고 느껴지면 먼저 그 패키지가 **자체 타입을 내장**하는지(`package.json`의 `types` 필드), 아니면 `@types`를 쓰는지 확인합니다. 그다음 해당 저장소의 이슈를 검색하면 같은 문제를 겪은 사람을 찾는 경우가 많습니다.

### 5. 프레임워크별 자료 — 실무 프레임워크와 함께 쓸 때

| 자료 | 주소 | 이럴 때 |
|---|---|---|
| React TypeScript Cheatsheet | [https://react-typescript-cheatsheet.netlify.app/](https://react-typescript-cheatsheet.netlify.app/) | props·훅·이벤트·Context의 타입 패턴을 빠르게 찾을 때 |
| Vue 공식 문서 - TypeScript | [https://vuejs.org/guide/typescript/overview.html](https://vuejs.org/guide/typescript/overview.html) | Vue 3 + TS 설정과 `defineProps` 등 패턴 |

### 6. 더 깊이 공부하기 — 체계적인 심화 학습

| 자료 | 주소 | 특징 |
|---|---|---|
| Total TypeScript | [https://www.totaltypescript.com/](https://www.totaltypescript.com/) | Matt Pocock의 TS 학습 사이트. 무료 튜토리얼·글과 유료 과정이 있습니다. |
| TypeScript Deep Dive | [https://basarat.gitbook.io/typescript/](https://basarat.gitbook.io/typescript/) | 무료 온라인 책. 일부 내용은 오래되었으니 버전을 확인하며 읽습니다. |

::: info 책을 고를 때
TypeScript 책은 국내외에 많이 나와 있습니다. 고를 때는 **출간 연도**(가능하면 TS 5.x를 다루는 것)와 **예제 코드 저장소가 유지되는지**를 확인하세요. 이 위키에서는 특정 책의 판·가격 정보가 바뀔 수 있어 목록을 싣지 않았습니다.
:::

### 7. 질문하고 답하는 곳

| 자료 | 주소 | 이럴 때 |
|---|---|---|
| Stack Overflow (typescript 태그) | [https://stackoverflow.com/questions/tagged/typescript](https://stackoverflow.com/questions/tagged/typescript) | 에러 메시지·에러 코드로 검색하면 같은 질문이 있는 경우가 많습니다. |
| TypeScript GitHub Issues | [https://github.com/microsoft/TypeScript/issues](https://github.com/microsoft/TypeScript/issues) | "이게 버그인가?" 싶을 때 먼저 검색. 새 이슈는 Playground 재현 링크와 함께 올립니다. |

좋은 질문은 [에러 메시지 읽는 법과 도움 받는 법](../part0-start/06-how-to-read-errors)에서 배운 대로 **에러 원문 + 최소 재현 코드 + TS 버전 + tsconfig 핵심 옵션**을 담습니다. 회사 코드를 질문할 때는 고객사 이름·내부 주소·데이터 같은 **식별 정보를 지우고** 같은 문제를 재현하는 작은 예제로 바꿔 올립니다.

### 계속 성장하는 방법

**① 매일: 에디터에서 타입을 "읽는" 습관**

변수·함수에 마우스를 올려 추론된 타입을 확인하는 습관을 유지합니다. "내가 예상한 타입"과 "실제 타입"이 다를 때가 가장 많이 배우는 순간입니다.

**② 매주: 작은 리팩터링 하나**

내 코드나 팀 코드에서 [안티패턴](./02-anti-patterns) 하나를 찾아 고칩니다. `any` 하나 줄이기, boolean 플래그를 판별 유니온으로 바꾸기처럼 작은 것이면 충분합니다.

**③ 매달: 남의 코드 읽기**

zod, zustand, TanStack Query처럼 타입을 잘 쓰는 오픈 소스 라이브러리의 `.d.ts`나 타입 정의 파일을 열어 읽어 봅니다. 처음에는 한 함수의 타입만 이해해도 좋습니다. 읽다가 모르는 문법이 나오면 [Part 5](../part5-advanced/01-conditional-types)로 돌아갑니다.

**④ 새 버전이 나올 때: 릴리스 노트 읽기**

앞에서 설명한 순서(목차 → Breaking Changes → 기능 하나 실습)로 읽습니다. 한 번에 다 이해하려 하지 않아도 됩니다.

**⑤ 분기마다: 가르쳐 보기**

배운 것을 팀 공유 문서나 사내 스터디에서 설명해 봅니다. 설명하다 막히는 곳이 아직 덜 이해한 곳입니다. [면접·실무 질문 50선](./05-interview)의 "정의 → 이유 → 예시 → 주의점" 틀을 그대로 쓰면 됩니다.

**⑥ 기회가 되면: 기여하기**

DefinitelyTyped의 타입 오류 수정, 쓰는 라이브러리의 문서 오타 수정처럼 작은 기여부터 시작합니다. 리뷰를 받는 과정에서 많은 것을 배웁니다.

## 자주 하는 실수

### 실수 1: 오래된 글을 그대로 따라 하기

```json
{
  "compilerOptions": {
    "moduleResolution": "node"
  }
}
```

**왜 틀렸나**: 예전 글에서 흔히 보이는 설정입니다. `"node"`(현재 이름은 `node10`)는 오래된 Node.js 해석 방식이라 최신 패키지의 `exports` 필드를 이해하지 못합니다.

**고친 설정**: 실행 환경에 맞춰 고릅니다. 번들러를 쓰면 `"bundler"`, Node.js ESM이면 `"nodenext"`입니다([모듈 시스템](../part6-tooling/03-module-systems)).

```json
{
  "compilerOptions": {
    "module": "esnext",
    "moduleResolution": "bundler"
  }
}
```

### 실수 2: 자료만 모으고 손으로 해 보지 않기

북마크 100개보다 Playground에서 직접 실행한 예제 10개가 실력이 됩니다. 자료를 읽을 때마다 **예제 하나를 직접 바꿔 실행**해 보는 것을 규칙으로 삼습니다.

### 실수 3: 고급 타입만 쫓기

type-challenges의 어려운 문제를 푸는 것보다, 업무 코드에서 `null` 처리를 빠뜨리지 않고 외부 데이터를 검증하는 것이 더 많은 사고를 막습니다. **기본기(좁히기·판별 유니온·런타임 검증)가 먼저**입니다.

## 직접 해 보기

### 문제 1 ⭐ 릴리스 노트에서 기능 찾기

TypeScript 5.6 릴리스 노트를 열어 기능 목록을 훑고, 관심 있는 기능 하나를 골라 Playground에서 버전을 5.6 이상으로 놓고 예제를 실행해 보세요.

::: details 정답 보기
예시: 5.6에는 "항상 참이거나 항상 거짓인 조건 검사"(Disallowed Nullish and Truthy Checks) 기능이 있습니다. 다음 코드는 5.6부터 에러가 납니다.

```ts
function check(input: string): void {
  if (/^\d+$/) {
    // ❌ This kind of expression is always truthy. (TS2872)
    console.log(input)
  }
}
```

정규식 리터럴 자체는 언제나 참이므로 `if` 조건으로 쓰는 것은 실수입니다. `/^\d+$/.test(input)`이 의도한 코드입니다.
:::

### 문제 2 ⭐ 자료 고르기

다음 상황에서 가장 먼저 볼 자료는 무엇인가요?

1. `exactOptionalPropertyTypes` 옵션의 정확한 뜻이 궁금하다.
2. `@types/express`의 타입이 실제 동작과 다른 것 같다.
3. React에서 `forwardRef`에 타입을 붙이는 법을 빨리 찾고 싶다.
4. 다음 TS 버전에서 무엇이 바뀌는지 미리 알고 싶다.

::: details 정답 보기
1. tsconfig 레퍼런스
2. DefinitelyTyped 저장소(이슈 검색)
3. React TypeScript Cheatsheet
4. TypeScript 공식 블로그의 베타·RC 글, GitHub의 Iteration Plan 이슈
:::

### 문제 3 ⭐⭐ 3개월 학습 계획

이 위키를 마친 뒤 3개월 동안의 학습 계획을 주 단위로 세워 보세요. "매일·매주·매달" 습관을 하나 이상 포함합니다.

::: details 정답 보기
예시:

- **1개월차**: 매일 type-challenges 쉬움 1문제, 매주 팀 코드에서 `any` 하나 제거, 자가 진단에서 약했던 파트 복습
- **2개월차**: 매일 쉬움/보통 1문제, 매주 사내 코드 리뷰에서 체크리스트 적용, zod의 타입 정의 읽기
- **3개월차**: 최신 릴리스 노트 정독, 사내 스터디에서 판별 유니온 발표, DefinitelyTyped 이슈 하나 살펴보기
:::

### 문제 4 ⭐⭐⭐ 좋은 질문 만들기

최근에 막혔던 타입 에러 하나를 골라, Stack Overflow나 팀 메신저에 올릴 질문을 작성해 보세요. 에러 원문, 최소 재현 코드, TS 버전, 관련 tsconfig 옵션, 시도해 본 것을 포함합니다.

::: details 정답 보기
예시:

```text
[질문] find 결과에 접근할 때 TS2532 에러

- TypeScript 5.6.3, strict: true
- 에러: Object is possibly 'undefined'. (TS2532)
- 재현 코드 (Playground 링크 첨부):
    const products = [{ id: 'P001', name: '아메리카노' }]
    console.log(products.find((p) => p.id === 'P999').name)
- 시도한 것: !를 붙이면 에러는 사라지지만 실제로 없는 ID면 실행 중 에러가 납니다.
- 궁금한 점: 없을 때 기본값을 주는 깔끔한 방법이 있을까요?
```

회사 코드라면 상품명·고객사명 같은 정보는 예시 값으로 바꿉니다.
:::

## 확인 퀴즈

1. 자료를 신뢰하는 순서 네 단계는 무엇인가요?
2. 새 버전 릴리스 노트에서 반드시 읽어야 하는 절은 무엇인가요?
3. `@types/패키지`의 원본 저장소 이름은 무엇인가요?
4. 오래된 글을 읽을 때 먼저 확인해야 할 두 가지는 무엇인가요?

::: details 정답 보기
1. 공식 자료 → 공식 저장소 이슈·위키 → 검증된 커뮤니티 자료 → 개인 블로그·영상.
2. Breaking Changes(호환성이 깨지는 변경).
3. DefinitelyTyped.
4. 작성 날짜와 다루는 TypeScript 버전.
:::

## 정리

- 개념은 **공식 핸드북**, 옵션은 **tsconfig 레퍼런스**, 재현은 **Playground**에서 확인합니다.
- 새 버전은 **릴리스 노트와 공식 블로그**로 챙기고, Breaking Changes를 반드시 읽습니다.
- 고급 타입 훈련은 **type-challenges**, 라이브러리 타입 문제는 **DefinitelyTyped**와 각 저장소 이슈를 봅니다.
- 자료는 작성 날짜와 버전을 확인하고, 읽을 때마다 **직접 실행**해 봅니다.
- 매일 타입 읽기, 매주 리팩터링, 매달 남의 코드 읽기, 분기마다 가르쳐 보기로 계속 성장합니다.

## 다음 단계

축하합니다. TypeScript 마스터 위키의 모든 과정을 마쳤습니다.

- 실력을 다시 점검하고 싶다면 [단계별 자가 진단 테스트](./04-self-assessment)를 2주 뒤에 다시 풀어 보세요.
- 공부하다 막히는 용어나 문법은 [용어집](../appendix/01-glossary)과 [TypeScript 문법 치트시트](../appendix/02-cheatsheet)에서 바로 찾을 수 있습니다.
- 실무에서 에러를 만나면 [자주 만나는 컴파일 에러 사전](./01-error-dictionary)을 펼쳐 보세요.
