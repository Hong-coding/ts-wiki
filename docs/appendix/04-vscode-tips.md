---
title: VS Code 단축키와 TS 개발 팁
---

# VS Code 단축키와 TS 개발 팁

VS Code(Visual Studio Code)는 TypeScript를 만든 마이크로소프트의 편집기라서, 별도 확장 없이도 TS 기능이 거의 다 들어 있습니다. 이 문서는 자주 쓰는 **단축키**, 꼭 알아야 할 **TS 기능**, **추천 확장**, **추천 설정**을 정리합니다.

::: info 기준
- 단축키는 VS Code 기본 키 설정 기준입니다. 한국어 키보드에서도 같습니다.
- 메뉴 이름은 한국어 언어 팩을 설치한 화면 기준이며, 괄호 안에 영어 이름을 함께 적었습니다.
- 단축키가 기억나지 않으면 **명령 팔레트**(Windows `Ctrl+Shift+P`, macOS `Cmd+Shift+P`)를 열고 기능 이름을 입력하면 됩니다. 명령 오른쪽에 단축키도 함께 표시됩니다.
:::

**바로가기:** [단축키 표](#shortcuts) · [TS 기능](#ts-features) · [인레이 힌트](#inlay) · [추천 확장](#extensions) · [추천 settings.json](#settings) · [빨간 줄이 이상할 때](#trouble)

## 단축키 표 {#shortcuts}

### 기본 · 화면

| 기능 | Windows | macOS |
|---|---|---|
| 명령 팔레트 (모든 명령 검색) | `Ctrl+Shift+P` 또는 `F1` | `Cmd+Shift+P` 또는 `F1` |
| 파일 이름으로 빠르게 열기 | `Ctrl+P` | `Cmd+P` |
| 설정 열기 | `Ctrl+,` | `Cmd+,` |
| 저장 | `Ctrl+S` | `Cmd+S` |
| 터미널 열기/닫기 | ``Ctrl+` `` | ``Ctrl+` `` |
| 사이드바 열기/닫기 | `Ctrl+B` | `Cmd+B` |
| 탐색기 | `Ctrl+Shift+E` | `Cmd+Shift+E` |
| 문제(Problems) 패널 | `Ctrl+Shift+M` | `Cmd+Shift+M` |
| 편집기 화면 분할 | `Ctrl+\` | `Cmd+\` |
| 단축키 목록 보기 | `Ctrl+K` 다음 `Ctrl+S` | `Cmd+K` 다음 `Cmd+S` |

### 편집

| 기능 | Windows | macOS |
|---|---|---|
| 줄 주석 켜기/끄기 | `Ctrl+/` | `Cmd+/` |
| 줄 위/아래로 옮기기 | `Alt+↑` / `Alt+↓` | `Option+↑` / `Option+↓` |
| 줄 복제 | `Shift+Alt+↓` | `Shift+Option+↓` |
| 줄 삭제 | `Ctrl+Shift+K` | `Cmd+Shift+K` |
| 같은 단어 다음 것까지 선택(다중 커서) | `Ctrl+D` | `Cmd+D` |
| 원하는 곳에 커서 추가 | `Alt+클릭` | `Option+클릭` |
| 문서 서식 맞추기 | `Shift+Alt+F` | `Shift+Option+F` |
| 자동 완성 목록 열기 | `Ctrl+Space` | `Ctrl+Space` |
| 매개변수 힌트 보기 | `Ctrl+Shift+Space` | `Cmd+Shift+Space` |
| 마우스 올린 것처럼 타입 정보 보기 | `Ctrl+K` 다음 `Ctrl+I` | `Cmd+K` 다음 `Cmd+I` |

### 찾기 · 이동

| 기능 | Windows | macOS |
|---|---|---|
| 파일 안에서 찾기 / 바꾸기 | `Ctrl+F` / `Ctrl+H` | `Cmd+F` / `Cmd+Option+F` |
| 프로젝트 전체에서 찾기 | `Ctrl+Shift+F` | `Cmd+Shift+F` |
| 지정한 줄로 이동 | `Ctrl+G` | `Ctrl+G` |
| 현재 파일의 함수·변수 목록으로 이동 | `Ctrl+Shift+O` | `Cmd+Shift+O` |
| 프로젝트 전체 기호로 이동 | `Ctrl+T` | `Cmd+T` |
| 이전 위치로 돌아가기 / 앞으로 | `Alt+←` / `Alt+→` | `Ctrl+-` / `Ctrl+Shift+-` |
| 다음 오류로 이동 | `F8` | `F8` |

### TypeScript 작업에 자주 쓰는 것

| 기능 | Windows | macOS |
|---|---|---|
| 정의로 이동 (Go to Definition) | `F12` 또는 `Ctrl+클릭` | `F12` 또는 `Cmd+클릭` |
| 정의 미리 보기 (Peek Definition) | `Alt+F12` | `Option+F12` |
| 구현으로 이동 (Go to Implementations) | `Ctrl+F12` | `Cmd+F12` |
| 참조 찾기 (Peek References) | `Shift+F12` | `Shift+F12` |
| 모든 참조 찾기 (Find All References) | `Shift+Alt+F12` | `Shift+Option+F12` |
| 이름 바꾸기 (Rename Symbol) | `F2` | `F2` |
| 빠른 수정 (Quick Fix) | `Ctrl+.` | `Cmd+.` |
| 리팩터링 메뉴 (Refactor) | `Ctrl+Shift+R` | `Ctrl+Shift+R` |
| 가져오기 정리 (Organize Imports) | `Shift+Alt+O` | `Shift+Option+O` |

## TS 기능 {#ts-features}

### 마우스 올려 타입 보기

변수·함수 이름 위에 마우스를 올리면 TS가 추론한 타입이 말풍선으로 나옵니다. **"이 변수의 타입이 뭐지?"가 궁금하면 가장 먼저 할 일**입니다. 타입 추론을 배울 때 특히 많이 씁니다. → [타입 표기와 추론](../part2-types/01-annotation-inference)

### 정의로 이동 (F12)

함수·타입 이름에 커서를 두고 `F12`(또는 `Ctrl`/`Cmd`를 누른 채 클릭)를 누르면 그것이 **정의된 곳**으로 이동합니다.

- 내 코드의 함수라면 그 함수 선언으로 갑니다.
- 라이브러리 함수라면 그 라이브러리의 `.d.ts` 선언 파일이 열립니다. "이 함수는 무엇을 받고 무엇을 돌려주지?"를 확인하는 가장 정확한 방법입니다. → [선언 파일](../part5-advanced/08-declaration-files)
- 돌아올 때는 `Alt+←`(macOS `Ctrl+-`)를 누릅니다.
- 창을 옮기지 않고 그 자리에서 잠깐 보고 싶다면 `Alt+F12`(정의 미리 보기)를 씁니다.

### 참조 찾기 (Shift+F12)

함수나 타입이 **어디어디서 쓰이는지** 목록으로 보여 줍니다. 타입을 고치기 전에 "이걸 바꾸면 어디가 영향을 받지?"를 확인할 때 씁니다.

### 이름 바꾸기 (F2)

변수·함수·타입·속성 이름에 커서를 두고 `F2`를 누른 뒤 새 이름을 입력하면, **그것을 쓰는 모든 파일의 모든 곳**이 한 번에 바뀝니다. 찾아 바꾸기(`Ctrl+H`)와 달리 이름이 같은 다른 변수는 건드리지 않으므로 안전합니다.

::: tip 파일 이름을 바꿀 때도
탐색기에서 `.ts` 파일 이름을 바꾸거나 다른 폴더로 옮기면, VS Code가 "import 경로를 업데이트할까요?"라고 묻습니다. 아래 [추천 settings.json](#settings)의 `typescript.updateImportsOnFileMove.enabled`를 `always`로 두면 묻지 않고 자동으로 고칩니다.
:::

### 빠른 수정 (Ctrl+.)

빨간 줄이나 노란 줄 위에 커서를 두면 전구 아이콘이 나타납니다. `Ctrl+.`(macOS `Cmd+.`)를 누르면 TS가 제안하는 고치는 방법이 나옵니다. 자주 쓰는 것:

| 상황 | 빠른 수정 제안 |
|---|---|
| 다른 파일의 함수·타입을 쓰는데 `import`가 없음 | "Add import from ..." (가져오기 자동 추가) |
| 오타 (예: `prise`) | "Change spelling to 'price'" |
| `interface`를 `implements`했는데 메서드가 없음 | "Implement interface" (빈 메서드 자동 생성) |
| `switch`에서 빠진 경우 | "Add missing cases" |
| 선언하지 않은 속성 사용 | "Declare property ..." |
| 함수 일부를 따로 빼고 싶음 (선택한 상태에서) | "Extract to function" 등 리팩터링 |

### 가져오기 정리 (Shift+Alt+O)

쓰지 않는 `import`를 지우고, 남은 것을 정렬합니다. 저장할 때마다 자동으로 하려면 [추천 settings.json](#settings)의 `editor.codeActionsOnSave`를 참고하세요.

### TS 서버 재시작 {#ts-restart}

VS Code 안에서 타입 검사를 하는 프로그램을 **TS 서버**(TypeScript language server)라고 부릅니다. 가끔 이 서버가 최신 상태를 따라오지 못해, 이미 고친 오류가 계속 빨간 줄로 남는 경우가 있습니다.

1. `.ts` 파일을 하나 연 상태에서 명령 팔레트(`Ctrl+Shift+P`)를 엽니다.
2. `TypeScript: Restart TS Server`(TypeScript: TS 서버 다시 시작)를 입력해 실행합니다.

특히 `tsconfig.json`을 고친 뒤, `npm install`로 패키지를 새로 설치한 뒤, `.d.ts` 파일을 추가한 뒤에 효과가 좋습니다.

### 워크스페이스 TS 버전 선택 {#ts-version}

VS Code에는 **TypeScript가 하나 내장**되어 있고, 프로젝트의 `node_modules`에도 TypeScript가 설치되어 있을 수 있습니다. 두 버전이 다르면 "터미널의 `tsc`는 통과하는데 편집기에는 빨간 줄이 있다"(또는 반대) 같은 일이 생깁니다.

1. `.ts` 파일을 연 상태에서 명령 팔레트를 엽니다.
2. `TypeScript: Select TypeScript Version`(TypeScript 버전 선택)을 실행합니다.
3. **Use Workspace Version**(작업 영역 버전 사용)을 고릅니다.

이렇게 하면 편집기와 `npx tsc`가 같은 버전을 씁니다. 팀 전체가 같은 설정을 쓰도록 하려면 프로젝트의 `.vscode/settings.json`에 아래 두 줄을 넣습니다.

```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

현재 쓰는 버전은 `.ts` 파일을 열었을 때 오른쪽 아래 상태 표시줄의 `{ }` 옆에 표시됩니다(예: `5.6.3`).

## 인레이 힌트 {#inlay}

인레이 힌트(inlay hints)는 코드에 적지 않은 정보를 **편집기가 흐린 글씨로 끼워 보여 주는 기능**입니다. 예를 들어 `getTotal(4500, 2)`가 `getTotal(price: 4500, qty: 2)`처럼 보입니다. 파일 내용은 바뀌지 않습니다.

| 설정 이름 | 보여 주는 것 | 값 |
|---|---|---|
| `typescript.inlayHints.parameterNames.enabled` | 함수 호출 시 매개변수 이름 | `none` · `literals`(리터럴 인수만) · `all` |
| `typescript.inlayHints.variableTypes.enabled` | 추론된 변수 타입 | `true` / `false` |
| `typescript.inlayHints.functionLikeReturnTypes.enabled` | 추론된 함수 반환 타입 | `true` / `false` |
| `typescript.inlayHints.parameterTypes.enabled` | 콜백 매개변수의 추론된 타입 | `true` / `false` |
| `typescript.inlayHints.propertyDeclarationTypes.enabled` | 클래스 속성의 추론된 타입 | `true` / `false` |
| `typescript.inlayHints.enumMemberValues.enabled` | enum 멤버의 값 | `true` / `false` |
| `editor.inlayHints.enabled` | 인레이 힌트 전체 켜기/끄기 | `on` · `off` · `onUnlessPressed` · `offUnlessPressed` |

::: tip 처음 배울 때 추천
타입 추론을 익히는 동안에는 변수 타입·반환 타입 힌트를 켜 두면 "TS가 이걸 무슨 타입으로 봤는지"를 계속 볼 수 있습니다. 화면이 복잡하게 느껴지면 `editor.inlayHints.enabled`를 `offUnlessPressed`로 바꾸세요. 평소에는 숨기고, `Ctrl+Alt`(macOS `Ctrl+Option`)를 누르고 있는 동안만 보여 줍니다.
:::

## 추천 확장 {#extensions}

확장 보기(Windows `Ctrl+Shift+X`, macOS `Cmd+Shift+X`)에서 이름이나 ID로 검색해 설치합니다. 비슷한 이름의 가짜 확장이 있을 수 있으니 **게시자(publisher)를 꼭 확인**하세요.

| 확장 | ID | 하는 일 | 관련 레슨 |
|---|---|---|---|
| Korean Language Pack | `MS-CEINTL.vscode-language-pack-ko` | 메뉴를 한국어로 | [개발 환경 설치](../part0-start/03-setup) |
| ESLint | `dbaeumer.vscode-eslint` | ESLint 경고를 편집기에 바로 표시 | [ESLint · Prettier](../part6-tooling/04-eslint-prettier) |
| Prettier | `esbenp.prettier-vscode` | 저장할 때 코드 모양 자동 정리 | [ESLint · Prettier](../part6-tooling/04-eslint-prettier) |
| Pretty TypeScript Errors | `yoavbls.pretty-ts-errors` | 길고 복잡한 TS 오류 메시지를 읽기 쉽게 정리 | [에러 메시지 읽는 법](../part0-start/06-how-to-read-errors) |
| Error Lens | `usernamehw.errorlens` | 오류 메시지를 해당 줄 끝에 바로 표시 | [컴파일 에러 사전](../part9-master/01-error-dictionary) |
| Vitest | `vitest.explorer` | 테스트를 편집기 안에서 실행·디버깅 | [Vitest](../part6-tooling/05-testing-vitest) |
| Vue (Official) | `Vue.volar` | `.vue` 파일의 TS 지원 | [Vue 3 + TS](../part7-practice/04-vue) |
| EditorConfig | `EditorConfig.EditorConfig` | 들여쓰기·줄바꿈 규칙을 팀과 맞춤 | [ESLint · Prettier](../part6-tooling/04-eslint-prettier) |
| GitLens | `eamodio.gitlens` | 각 줄을 누가 언제 바꿨는지 표시 | — |

::: warning 따로 설치하지 않아도 되는 것
TypeScript 언어 지원 자체는 VS Code에 **내장**되어 있습니다. 마켓플레이스에서 "TypeScript"라는 이름의 확장을 따로 설치할 필요가 없습니다. 오래된 "TSLint" 확장은 지원이 끝났으므로 ESLint를 씁니다.
:::

## 추천 settings.json {#settings}

설정 화면 오른쪽 위의 "설정 열기(JSON)" 아이콘을 누르거나, 명령 팔레트에서 `Preferences: Open User Settings (JSON)`을 실행하면 `settings.json`이 열립니다. 프로젝트에만 적용하려면 프로젝트 폴더의 `.vscode/settings.json`에 넣습니다.

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.organizeImports": "explicit",
    "source.fixAll.eslint": "explicit"
  },
  "editor.tabSize": 2,
  "files.eol": "\n",
  "files.insertFinalNewline": true,
  "files.trimTrailingWhitespace": true,

  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "typescript.preferences.importModuleSpecifier": "shortest",
  "typescript.preferences.quoteStyle": "single",
  "typescript.suggest.autoImports": true,

  "typescript.inlayHints.parameterNames.enabled": "literals",
  "typescript.inlayHints.variableTypes.enabled": true,
  "typescript.inlayHints.functionLikeReturnTypes.enabled": true,
  "editor.inlayHints.enabled": "onUnlessPressed",

  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

| 설정 | 하는 일 |
|---|---|
| `editor.formatOnSave` · `editor.defaultFormatter` | 저장할 때 Prettier로 코드 모양 정리 (Prettier 확장 필요) |
| `editor.codeActionsOnSave` | 저장할 때 가져오기 정리 + ESLint 자동 수정. `"explicit"`은 직접 저장(`Ctrl+S`)할 때만 실행한다는 뜻 |
| `files.eol` | 줄바꿈 문자를 LF(`\n`)로 통일 (Windows·macOS 팀이 섞여 있을 때 유용) |
| `files.insertFinalNewline` · `files.trimTrailingWhitespace` | 파일 끝 빈 줄 추가, 줄 끝 공백 제거 |
| `typescript.tsdk` · `typescript.enablePromptUseWorkspaceTsdk` | 프로젝트의 TS 버전 사용 (위 [워크스페이스 TS 버전 선택](#ts-version) 참고) |
| `typescript.updateImportsOnFileMove.enabled` | 파일을 옮기거나 이름을 바꾸면 import 경로 자동 수정 |
| `typescript.preferences.importModuleSpecifier` | 자동 import 경로 형식 (`shortest` · `relative` · `non-relative`) |
| `typescript.preferences.quoteStyle` | 자동 생성 코드의 따옴표 모양 |
| `typescript.inlayHints.*` · `editor.inlayHints.enabled` | 위 [인레이 힌트](#inlay) 참고 |
| `[typescript]` · `[typescriptreact]` | `.ts` · `.tsx` 파일에만 적용할 설정 |

::: tip 팀 프로젝트라면
`editor.formatOnSave`, `files.eol`처럼 모두가 같아야 하는 설정은 프로젝트의 `.vscode/settings.json`에 넣고 Git에 함께 올립니다. 글꼴·테마처럼 개인 취향인 설정은 사용자 설정에만 둡니다.
:::

## 빨간 줄이 이상할 때 {#trouble}

| 증상 | 확인할 것 |
|---|---|
| 고쳤는데도 빨간 줄이 남아 있음 | 파일을 저장했는지 확인 → `TypeScript: Restart TS Server` 실행 |
| 터미널 `npx tsc`와 편집기의 오류가 다름 | 워크스페이스 TS 버전을 선택했는지, 편집기가 보는 `tsconfig.json`이 같은지 확인 |
| `Cannot find module '...'` 이 편집기에서만 남 | `npm install` 후 TS 서버 재시작. 라이브러리 타입이 없다면 `@types/패키지` 설치 |
| 어떤 `tsconfig.json`이 적용되는지 모르겠음 | 명령 팔레트에서 `TypeScript: Go to Project Configuration` 실행 → 실제로 적용 중인 설정 파일이 열림 |
| 자동 완성·정의로 이동이 전혀 안 됨 | 오른쪽 아래 언어 모드가 `TypeScript`인지 확인, 출력(Output) 패널에서 `TypeScript` 로그 확인 |
| 편집기가 너무 느려짐 | `node_modules`, `dist`가 `tsconfig.json`의 `include`에 들어가 있지 않은지 확인 → [대규모 코드베이스](../part9-master/03-large-codebase) |

관련 레슨: [개발 환경 설치](../part0-start/03-setup) · [에러 메시지 읽는 법](../part0-start/06-how-to-read-errors) · [tsconfig.json 완전 정복](../part6-tooling/01-tsconfig)
