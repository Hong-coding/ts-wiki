---
title: TS Playground로 설치 없이 바로 해 보기
---

# TS Playground로 설치 없이 바로 해 보기

<LessonMeta level="입문" :minutes="20" prev="Node.js · VS Code · Git을 설치하고 터미널 기본 명령을 익혔습니다." />

## 이번에 배울 것

- TS Playground에 접속해 TypeScript 코드를 입력하고 **Run** 버튼으로 실행할 수 있다.
- 화면의 왼쪽(편집기)과 오른쪽(`.JS`, `.D.TS`, `Errors`, `Logs` 탭)이 각각 무엇을 보여 주는지 설명할 수 있다.
- **TS Config** 메뉴에서 `strict`와 `Target`을 바꾸고, 결과가 어떻게 달라지는지 관찰할 수 있다.
- TypeScript 버전을 바꿔 보고, 예제(Examples) 메뉴로 공식 예제를 열 수 있다.
- **Share** 링크에 코드가 통째로 담긴다는 것을 알고, 회사 코드를 붙여 넣지 않는 이유를 말할 수 있다.

## 먼저 알아 둘 것

- 인터넷에 연결된 웹 브라우저(Chrome, Edge, Safari, Firefox 등)만 있으면 됩니다. 설치는 필요 없습니다.
- [프로그래밍과 JavaScript, 그리고 TypeScript](./01-what-is-programming): TypeScript는 JavaScript로 **컴파일**(변환)된 다음 실행된다는 것
- [왜 TypeScript인가](./02-why-typescript): TypeScript가 실행 전에 타입 오류를 찾아 준다는 것

::: warning 화면 설명 기준
이 레슨의 화면 설명은 **작성 시점(2026-10) 기준**입니다. 이때 Playground의 기본 TypeScript 버전은 `v6.0.3`이었습니다. 사이트는 자주 바뀌므로 버튼 위치나 이름이 조금 다를 수 있습니다. 메뉴 이름(Run, Share, TS Config, Examples)을 기준으로 찾으면 대부분 쉽게 찾을 수 있습니다.
:::

## 비유로 이해하기

### 매장에 놓인 시식 코너

마트의 시식 코너를 떠올려 봅시다. 프라이팬과 버너가 이미 준비되어 있어서, 손님은 집에 주방이 없어도 바로 맛을 볼 수 있습니다. 다 먹고 나면 그냥 떠나면 됩니다. 뒷정리도 필요 없습니다.

TS Playground(플레이그라운드, "놀이터")가 바로 이 시식 코너입니다.

| 시식 코너 | TS Playground |
|---|---|
| 이미 준비된 버너와 프라이팬 | 이미 준비된 TypeScript 컴파일러 |
| 재료를 올려 조리 | 코드를 입력 |
| 바로 맛보기 | **Run** 버튼으로 바로 실행 |
| 주방 없이도 가능 | Node.js 설치 없이도 가능 |
| 본격적인 요리(잔치 음식)는 어렵다 | 파일 여러 개짜리 프로그램은 어렵다 |

마지막 줄이 중요합니다. 시식 코너에서 잔치 음식을 다 만들 수는 없듯이, Playground는 **짧은 코드를 빠르게 실험**하는 곳입니다. 파일 여러 개로 된 실제 프로그램은 [다음 레슨](./05-first-program)처럼 내 PC에서 만듭니다.

## 개념 설명

### Playground란 무엇인가

**TS Playground**는 TypeScript를 만든 마이크로소프트 팀이 운영하는 **웹사이트**입니다. 주소는 다음과 같습니다.

```text
https://www.typescriptlang.org/play
```

이 사이트에서는 다음 일을 모두 웹 브라우저 안에서 합니다.

1. 내가 쓴 TypeScript 코드의 **타입을 검사**합니다.
2. 코드를 **JavaScript로 컴파일**합니다.
3. 만들어진 JavaScript를 **실행**하고 결과를 보여 줍니다.

내 PC에 아무것도 설치하지 않아도 되므로, Part 1·Part 2 예제 대부분을 Playground에서 따라 할 수 있습니다. 회사 PC에 설치 권한이 없을 때, 스마트폰·태블릿으로 잠깐 확인하고 싶을 때도 유용합니다.

### 화면 구성 한눈에 보기

주소창에 위 주소를 입력하고 들어가면 잠깐 `Downloading TypeScript...`라는 문구와 함께 파란 점 아홉 개가 깜빡입니다. TypeScript 컴파일러를 웹 브라우저로 내려받는 중입니다. 몇 초 기다리면 다음과 같은 화면이 나옵니다.

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ [TS] TypeScript   Download  Docs  Handbook  Community  Playground  Tools │ ← ① 사이트 메뉴(파란 띠)
├──────────────────────────────────────────────────────────────────────────┤
│ Playground   TS Config ▾   Examples ▾   Help ▾                  Settings │ ← ② Playground 메뉴
├────────────────────────────────────────────┬─────────────────────────────┤
│ v6.0.3 ▾   Run   Export ▾   Share        ⇥ │ .JS .D.TS Errors Logs Plugins│ ← ③ 도구 줄 / ⑤ 결과 탭
├────────────────────────────────────────────┼─────────────────────────────┤
│  1  // Welcome to the TypeScript ...       │                             │
│  2  // which gives you a chance ...        │                             │
│ ...                                        │      (선택한 탭의 내용)     │
│ 10  const anExampleVariable = "Hello World"│                             │
│ 11  console.log(anExampleVariable)         │                             │
│                                            │                             │
│        ④ 왼쪽: TypeScript 편집기           │      ⑤ 오른쪽: 결과 영역    │
└────────────────────────────────────────────┴─────────────────────────────┘
```

| 번호 | 영역 | 하는 일 |
|---|---|---|
| ① | 사이트 메뉴 | TypeScript 공식 사이트 전체 메뉴입니다. **Docs**(공식 문서), **Handbook**(공식 안내서)은 나중에 자주 씁니다. |
| ② | Playground 메뉴 | **TS Config**(컴파일 설정), **Examples**(공식 예제), **Help**(도움말), **Settings**(편집기 설정) |
| ③ | 도구 줄 | 버전 선택(`v6.0.3 ▾`), **Run**(실행), **Export**(내보내기), **Share**(공유 링크 만들기) |
| ④ | 왼쪽 편집기 | TypeScript 코드를 입력하는 곳입니다. 줄 번호가 왼쪽에 붙어 있습니다. |
| ⑤ | 오른쪽 결과 영역 | 탭을 눌러 컴파일 결과, 에러, 실행 로그를 봅니다. |

처음 들어가면 편집기에 영어 주석(`//`로 시작하는 줄, 실행되지 않는 설명 글)이 몇 줄 들어 있습니다. "이곳은 TypeScript를 배우고 실험하는 곳"이라는 환영 인사입니다. 지워도 괜찮습니다.

::: tip 화면이 좁으면
창 너비가 좁으면(예: 스마트폰) 오른쪽 결과 영역이 편집기 아래로 내려가거나 숨겨질 수 있습니다. PC에서는 브라우저 창을 넓게 키워서 쓰세요. 도구 줄 오른쪽 끝의 작은 화살표 아이콘(`⇥`)을 누르면 결과 영역을 접었다 펼 수 있습니다.
:::

### 오른쪽 결과 탭

오른쪽 위에는 탭이 다섯 개 있습니다. 그중 이 위키에서 쓰는 것은 앞의 네 개입니다.

| 탭 | 보여 주는 것 | 언제 보나 |
|---|---|---|
| `.JS` | 내 TypeScript 코드가 **컴파일된 JavaScript** | "TS가 JS로 어떻게 바뀌나" 궁금할 때 |
| `.D.TS` | **선언 파일**(declaration file). 코드에서 타입 정보만 뽑아낸 요약본 | Part 5에서 선언 파일을 배울 때 |
| `Errors` | 타입 **에러 목록**. 에러가 있으면 탭 이름 옆에 빨간 숫자 배지가 붙음 | 빨간 밑줄이 보일 때 |
| `Logs` | `console.log`로 찍은 **실행 결과** | Run 버튼을 누른 뒤 |
| `Plugins` | 추가 기능(플러그인) 관리 | 지금은 쓰지 않음 |

처음 몇 주 동안은 `Logs`와 `Errors`를 가장 많이 보게 됩니다.

### 첫 실행: 코드를 입력하고 Run 누르기

직접 해 봅시다.

1. 편집기를 한 번 클릭하고 `Ctrl + A`(macOS는 `Command + A`)로 전체 선택한 뒤 `Delete` 키로 지웁니다.
2. 아래 코드를 입력합니다. 복사해서 붙여 넣어도 됩니다.

```ts
const price = 4500
const quantity = 2

console.log(price * quantity)
console.log('합계: ' + price * quantity + '원')
```

3. 도구 줄의 **Run** 버튼을 누릅니다.
4. 화면 가운데에 `Executed transpiled TypeScript`(변환한 TypeScript를 실행했습니다)라는 검은 알림이 잠깐 떴다가 사라지고, 오른쪽이 자동으로 **Logs** 탭으로 바뀝니다.

Logs 탭에는 이렇게 보입니다.

```text
[LOG]: 9000
[LOG]: "합계: 9000원"
```

- `[LOG]:`는 "`console.log`가 찍은 줄"이라는 표시입니다. 내 코드가 출력한 것은 그 뒤쪽입니다.
- 문자열(글자)은 **큰따옴표로 감싸서** 보여 줍니다. 숫자인지 글자인지 구분하기 쉽게 하려는 표시이며, 실제 값에 따옴표가 들어 있는 것은 아닙니다. 다음 레슨에서 Node.js로 실행하면 따옴표 없이 `합계: 9000원`으로 나옵니다.

::: warning Logs는 쌓입니다
Run을 여러 번 누르면 이전 실행 결과가 지워지지 않고 아래로 계속 쌓입니다. 헷갈리면 Logs 탭 아래쪽 `Filter` 입력칸 왼쪽의 지우기 아이콘(동그라미에 사선)을 눌러 기록을 비운 뒤 다시 실행하세요.
:::

### .JS 탭: TypeScript가 JavaScript로 바뀐 모습

오른쪽에서 `.JS` 탭을 눌러 보세요. 이번에는 타입 표기가 들어간 코드로 바꿔서 비교해 봅시다.

```ts
const productName: string = '아메리카노'
const unitPrice: number = 4500

console.log(productName, unitPrice)
```

`.JS` 탭에는 이렇게 나옵니다.

```js
"use strict";
const productName = '아메리카노';
const unitPrice = 4500;
console.log(productName, unitPrice);
```

관찰할 점은 세 가지입니다.

1. `: string`, `: number` 같은 **타입 표기가 깨끗이 사라졌습니다.** 타입은 "검사용"이고, 실행에는 쓰이지 않기 때문입니다. [1번 레슨](./01-what-is-programming)에서 "TypeScript는 컴파일하면 JavaScript가 된다"고 한 것을 눈으로 확인한 셈입니다.
2. 줄 끝에 `;`(세미콜론, 문장의 끝을 표시하는 기호)가 붙었습니다. JavaScript에서는 세미콜론을 생략해도 대부분 동작하므로 이 위키의 예제는 생략합니다. 컴파일러는 안전하게 붙여 둡니다.
3. 맨 위에 `"use strict";`가 생겼습니다. JavaScript의 **엄격 모드**(strict mode, 실수하기 쉬운 옛 문법을 막는 실행 방식)를 켜는 문장입니다. 지금은 "컴파일러가 안전장치를 하나 걸어 줬다" 정도로 이해하면 됩니다.

### Errors 탭과 빨간 밑줄

이번에는 일부러 실수를 해 봅시다.

```ts
let price: number = '1500'
console.log(price)
// ❌ Type 'string' is not assignable to type 'number'. (TS2322)
```

입력하자마자 세 가지 변화가 생깁니다.

- 편집기에서 `price` 아래에 **빨간 물결 밑줄**이 생기고, 편집기 오른쪽 스크롤 막대에도 빨간 표시가 생깁니다.
- 오른쪽 `Errors` 탭 이름 옆에 빨간 동그라미 배지 `1`이 붙습니다. 에러가 1개라는 뜻입니다.
- `Errors` 탭을 누르면 `Errors in code`라는 제목 아래에 다음 메시지가 보입니다.

```text
Type 'string' is not assignable to type 'number'.
```

"`string`(문자열) 타입은 `number`(숫자) 타입에 넣을 수 없다"는 뜻입니다. 빨간 밑줄 위에 마우스를 올리면 같은 메시지가 말풍선으로 뜨고, 끝에 `(2322)`처럼 **에러 코드 번호**가 붙어 있습니다. 이 번호로 검색하는 법은 [에러 메시지 읽는 법](./06-how-to-read-errors)에서 배웁니다.

::: danger 에러가 있어도 Run은 됩니다
이 상태에서 Run을 누르면 Logs에 `[LOG]: "1500"`이 찍힙니다. Playground는 **에러가 있어도 JavaScript를 만들어 실행**하기 때문입니다. TypeScript의 타입 검사는 "경고"를 해 줄 뿐, 실행을 강제로 막지는 않습니다(내 PC에서도 기본 설정은 같습니다. 다음 레슨에서 직접 확인합니다). **빨간 밑줄이 있으면 실행 결과를 믿지 말고 에러부터 고치세요.**
:::

### TS Config: 컴파일 설정 바꾸기

**TS Config**는 "TypeScript 컴파일러를 어떻게 동작시킬지" 정하는 설정판입니다. 나중에 내 PC에서는 이 설정을 `tsconfig.json`이라는 파일에 적는데, Playground에서는 체크박스와 선택 상자로 바꿉니다.

Playground 메뉴 줄의 **TS Config ▾**를 누르면 편집기 자리에 큰 설정 화면이 열립니다. 맨 위에 선택 상자 네 개가 나란히 있습니다.

| 항목 | 기본값(작성 시점) | 뜻 |
|---|---|---|
| `Lang` | TypeScript | 편집기 언어. JavaScript로 바꿀 수도 있음 |
| `Target` | ES2017 | 어느 버전의 JavaScript 문법으로 바꿔 줄지 |
| `JSX` | React | React 화면 코드 처리 방식 (Part 7에서 다룸) |
| `Module` | ESNext | 모듈(파일 나누기) 방식 (Part 6에서 다룸) |

그 아래에는 `Output Formatting`, `Emit`, `Type Checking`, `Modules` 같은 제목별로 체크박스가 길게 늘어서 있습니다. 다 볼 필요는 없습니다. 지금은 두 가지만 만져 봅니다. 설정 화면을 닫을 때는 오른쪽 위의 **Close** 버튼을 누릅니다.

#### strict 끄고 켜 보기

먼저 편집기에 다음 코드를 입력합니다.

```ts
function greet(name) {
  return '안녕하세요, ' + name + '님'
}
console.log(greet('김민지'))
// ❌ Parameter 'name' implicitly has an 'any' type. (TS7006)
```

`name` 아래에 빨간 밑줄이 생기고, Errors 탭에 이렇게 나옵니다.

```text
Parameter 'name' implicitly has an 'any' type.
```

"매개변수(parameter, 함수가 받는 입력값) `name`의 타입이 정해지지 않아 `any`(아무 타입이나 허용)로 취급된다"는 뜻입니다. 타입을 모르면 검사도 못 하므로, TypeScript가 "타입을 적어 달라"고 요구하는 것입니다. 함수는 [함수 기초](../part1-basics/06-functions)에서 배우니, 지금은 모양만 봐 두세요.

이제 **TS Config**를 열고, `Type Checking` 제목 아래에서 `strict` 체크박스를 찾아 **체크를 해제**한 뒤 Close를 누릅니다. 빨간 밑줄이 사라집니다.

`strict`(엄격 모드)는 TypeScript의 **깐깐한 검사 여러 개를 한꺼번에 켜는 스위치**입니다. 끄면 위와 같은 코드를 그냥 통과시킵니다. 편해 보이지만 그만큼 버그를 놓칩니다.

::: tip 이 위키는 strict를 켠 상태가 기준입니다
실습이 끝나면 `strict`를 **다시 체크**해 두세요. 이 위키의 모든 예제는 `strict`가 켜진 상태를 기준으로 쓰였고, 실무에서도 새 프로젝트는 strict를 켜는 것이 표준입니다. 각 옵션이 무엇을 검사하는지는 [strict 옵션 하나씩 이해하기](../part6-tooling/02-strict-options)에서 자세히 다룹니다.
:::

#### Target 바꿔 보기

JavaScript는 해마다 새 문법이 추가됩니다. 그런데 오래된 웹 브라우저는 새 문법을 모릅니다. 그래서 TypeScript는 "어느 해의 JavaScript까지 이해하는 환경에서 돌릴지"를 **Target**(목표)으로 받아, 그보다 새로운 문법은 옛 문법으로 풀어서 바꿔 줍니다.

아래 코드를 입력하고 `.JS` 탭을 보세요. (`??`는 "왼쪽 값이 없으면 오른쪽 값을 쓴다"는 연산자로, [연산자](../part1-basics/03-operators) 레슨에서 배웁니다.)

```ts
let savedPoint: number | null = null
const point = savedPoint ?? 0
console.log(point)
```

Target이 기본값 `ES2017`일 때 `.JS` 탭:

```js
"use strict";
let savedPoint = null;
const point = savedPoint !== null && savedPoint !== void 0 ? savedPoint : 0;
console.log(point);
```

`??` 연산자는 2020년에 JavaScript에 추가된 문법이라, 2017년 기준 환경에서도 돌아가도록 긴 식으로 풀어 썼습니다.

이제 TS Config에서 `Target`을 `ES2022`로 바꾸고 Close를 누른 뒤 다시 `.JS` 탭을 봅니다.

```js
"use strict";
let savedPoint = null;
const point = savedPoint ?? 0;
console.log(point);
```

이번에는 `??`가 그대로 남았습니다. 2022년 기준 환경은 `??`를 이해하기 때문입니다. 어느 쪽이든 Run을 누르면 Logs에는 `[LOG]: 0`이 찍힙니다. **결과는 같고, 만들어지는 JavaScript의 모양만 다릅니다.**

::: info 지금은 "그런 게 있다"만
`Target`을 어떻게 정해야 하는지는 프로젝트가 돌아갈 환경(어떤 브라우저, 어떤 Node.js 버전)에 따라 다르며, [tsconfig.json 완전 정복](../part6-tooling/01-tsconfig)에서 다룹니다. 이 위키의 예제는 `ES2022` 이상을 기준으로 합니다.
:::

### TypeScript 버전 바꾸기

도구 줄 맨 왼쪽의 `v6.0.3 ▾`를 누르면 버전 목록이 아래로 펼쳐집니다. 작성 시점에는 맨 위에 `Nightly`(매일 밤 만들어지는 개발 중인 버전), 그 아래로 `6.0.3`, `5.9.3`, `5.8.3`, `5.7.3` … 순서로 옛 버전까지 이어집니다.

언제 쓰나요?

- 블로그 글이나 책의 예제가 "TypeScript 5.4 기준"이라고 적혀 있을 때, 같은 버전으로 맞춰서 확인할 수 있습니다.
- 새 기능이 **몇 버전부터** 되는지 확인할 수 있습니다. 이 위키에서 "TS 5.x부터"라고 적힌 기능을 그보다 옛 버전으로 바꾸면 에러가 나는 것을 볼 수 있습니다.

버전을 바꾸면 주소창의 주소 뒤에 `?ts=5.9.3`처럼 버전이 붙습니다.

::: info 이 위키의 기준 버전
이 위키의 예제는 TypeScript 5.x(strict)를 기준으로 쓰고 TypeScript 5.6으로 검증했습니다. Playground 기본 버전(작성 시점 6.0.3)에서도 Part 1~2 예제는 같은 결과가 나옵니다. 혹시 결과가 다르면 버전을 `5.9.3`처럼 5.x로 바꿔서 비교해 보세요.
:::

### Examples: 공식 예제 둘러보기

Playground 메뉴의 **Examples ▾**를 누르면 공식 예제 목록이 편집기 자리에 열립니다. 위쪽에 `JavaScript`와 `TypeScript` 두 탭이 있습니다.

- **JavaScript 탭**: `Hello World`, `Objects and Arrays`, `Functions`, `Code Flow` 같은 JavaScript 기초 예제
- **TypeScript 탭**: `Primitives`, `Type Primitives`, `Meta-Types`, `Language` 같은 제목 아래 `Any`, `Literals`, `Union and Intersection Types`, `Type Guards` 등의 예제

예제를 하나 누르면 편집기에 설명 주석이 달린 코드가 열립니다. 설명은 영어지만 코드는 짧으므로, 각 파트를 공부한 뒤 같은 주제의 예제를 열어 복습용으로 쓰면 좋습니다. 예제 목록을 닫으려면 오른쪽 위 **Close**를 누릅니다.

::: warning 예제를 열면 편집기 내용이 바뀝니다
예제를 열면 편집기에 있던 내 코드가 예제 코드로 바뀝니다. 내 코드를 남겨 두고 싶다면 먼저 다른 곳(메모장, VS Code)에 복사해 두세요.
:::

### Share: 공유 링크 만들기 (그리고 주의할 점)

도구 줄의 **Share**를 누르면 지금 편집기에 있는 코드의 **링크(URL)가 클립보드에 복사**됩니다. 그 링크를 메신저에 붙여 넣으면 받은 사람이 같은 코드를 그대로 열어 볼 수 있습니다. 질문할 때 무척 편리합니다.

그런데 Share를 누른 뒤 주소창을 보면 주소가 이런 식으로 아주 길어져 있습니다.

```text
https://www.typescriptlang.org/play/?#code/PTAEHUFMBsGMHsC2lQBd5oBYoCoE8AHSAZVgCcBLA1UAB...
```

`#code/` 뒤의 알 수 없는 글자들이 바로 **내 코드를 압축해서 글자로 바꿔 넣은 것**입니다. 즉 Playground의 공유 링크는 서버에 코드를 따로 저장하는 방식이 아니라, **링크 자체에 코드가 통째로 들어 있습니다.** 링크를 가진 사람은 누구나 코드 전체를 복원할 수 있습니다.

::: danger 회사 코드는 붙여 넣지 마세요
Playground와 공유 링크에는 다음을 절대 넣지 마세요.

- 회사·고객사의 실제 소스 코드
- 서버 주소(IP), 비밀번호, API 키, 토큰
- 고객 이름·전화번호 같은 개인정보, 실제 매출 데이터

공유 링크는 메신저, 브라우저 방문 기록 등 여러 곳에 남습니다. 한 번 퍼진 링크는 회수할 수 없습니다. 질문하려고 코드를 공유할 때는 **문제가 재현되는 최소한의 코드만 새로 써서**, 이름과 값을 `product`, `1000` 같은 가짜 값으로 바꾼 뒤 공유하세요. 이 방법은 [에러 메시지 읽는 법](./06-how-to-read-errors)에서 자세히 다룹니다. 회사마다 외부 사이트에 코드를 올리는 규칙이 있으니, 애매하면 먼저 팀에 확인하세요.
:::

### Playground로 할 수 없는 것

시식 코너 비유처럼 Playground에는 한계가 있습니다.

| Playground에서 하기 좋은 것 | Playground로는 어려운 것 |
|---|---|
| 짧은 예제 실행, 문법 실험 | 파일 여러 개로 된 프로그램 |
| 에러 메시지 확인 | 내 PC의 파일 읽기·쓰기 |
| TS가 JS로 바뀐 모습 관찰 | npm 패키지를 자유롭게 설치해 쓰기 |
| 옵션·버전 바꿔 비교 | 작업 내용 저장·관리 (Git 같은 기록 없음) |

또 하나, Playground의 코드는 **웹 브라우저 안에서** 실행됩니다. 그래서 Node.js에만 있는 기능(예: 파일을 다루는 `fs` 모듈)은 쓸 수 없습니다. 본격적인 프로그램은 다음 레슨부터 내 PC에서 만듭니다.

::: tip 코드를 잃어버리지 않으려면
Playground는 마지막에 쓴 코드를 브라우저에 기억해 두지만, 브라우저 기록을 지우거나 다른 PC에서 열면 사라집니다. 오래 보관할 코드는 내 PC의 파일로 옮겨 두세요.
:::

## 자주 하는 실수

### 실수 1. Run을 누르지 않고 결과를 기다리기

```ts
console.log('안녕하세요')
```

코드를 입력했는데 Logs 탭이 비어 있습니다.

**왜 틀렸나**: Playground는 입력하는 즉시 **타입 검사와 컴파일**(`.JS`, `Errors` 탭)은 해 주지만, **실행은 Run을 눌러야** 합니다. `console.log` 결과는 실행해야 나옵니다.

**고친 방법**: 도구 줄의 **Run**을 누릅니다. Logs 탭에 `[LOG]: "안녕하세요"`가 나옵니다.

### 실수 2. 빨간 밑줄을 무시하고 실행 결과만 보기

```ts
let stock: number = '12'
console.log(stock + 1)
// ❌ Type 'string' is not assignable to type 'number'. (TS2322)
```

Run을 누르면 Logs에 `[LOG]: "121"`이 나옵니다. "실행은 되네?" 하고 넘어가기 쉽습니다.

**왜 틀렸나**: Playground는 에러가 있어도 실행합니다. 하지만 결과 `"121"`은 숫자 12에 1을 더한 13이 아니라, 글자 `'12'` 뒤에 `1`을 이어 붙인 엉뚱한 값입니다. TypeScript가 빨간 밑줄로 바로 이 버그를 알려 준 것입니다.

**고친 코드**:

```ts
let stock: number = 12
console.log(stock + 1)
// 출력: 13
```

### 실수 3. strict를 끈 채로 공부하기

TS Config에서 `strict`를 꺼 두면 빨간 밑줄이 줄어들어 편해 보입니다.

**왜 틀렸나**: 에러가 줄어든 것이 아니라 **검사를 덜 하는 것**입니다. 이 위키의 예제와 연습 문제는 strict를 켠 상태를 기준으로 하므로, 꺼 두면 "문서에는 에러가 난다는데 나는 안 난다"는 혼란이 생깁니다.

**고친 방법**: TS Config → `Type Checking` → `strict`에 **체크**합니다. 설정이 꼬였다면 주소창에 `https://www.typescriptlang.org/play`를 다시 입력해 처음 상태로 엽니다. (바꾼 설정이 주소에 붙어 있는 경우가 있으니, 긴 주소가 아니라 짧은 기본 주소로 들어갑니다.)

### 실수 4. 회사 코드를 붙여 넣고 Share 링크를 보내기

**왜 틀렸나**: 공유 링크에는 코드가 통째로 들어 있습니다. 링크를 받은 사람, 링크가 남은 메신저·기록을 볼 수 있는 사람 모두가 코드를 볼 수 있습니다.

**고친 방법**: 문제를 재현하는 **짧은 연습용 코드**를 새로 쓰고, 이름·값을 가짜로 바꾼 뒤 공유합니다.

## 직접 해 보기

### 문제 1. 첫 실행 ⭐

Playground 편집기를 비우고, 내 이름과 좋아하는 메뉴를 출력하는 코드를 써서 Run으로 실행하세요. Logs 탭에 두 줄이 나오면 성공입니다.

::: details 정답 보기
```ts
console.log('김민지')
console.log('카페라떼')
```

Logs 탭:

```text
[LOG]: "김민지"
[LOG]: "카페라떼"
```

문자열은 Logs 탭에서 큰따옴표로 감싸 보여 줍니다.
:::

### 문제 2. 타입이 사라지는 것 확인하기 ⭐

아래 코드를 입력하고 `.JS` 탭을 열어, 컴파일된 JavaScript에서 무엇이 사라졌는지 적어 보세요.

```ts
const memberName: string = '이서준'
const point: number = 1200
const isVip: boolean = false
console.log(memberName, point, isVip)
```

::: details 정답 보기
`.JS` 탭:

```js
"use strict";
const memberName = '이서준';
const point = 1200;
const isVip = false;
console.log(memberName, point, isVip);
```

`: string`, `: number`, `: boolean` 같은 **타입 표기가 모두 사라졌습니다.** 타입은 컴파일할 때 검사에만 쓰이고, 실행되는 JavaScript에는 남지 않습니다.
:::

### 문제 3. 에러 배지 읽기 ⭐⭐

아래 코드를 입력했을 때 `Errors` 탭의 배지 숫자는 몇이고, 각각 어떤 메시지가 나오는지 확인하세요.

```ts
const price: number = '3000'
const productName: string = 3000
console.log(price, productName)
```

::: details 정답 보기
배지 숫자는 `2`입니다. Errors 탭에는 두 메시지가 나옵니다.

```text
Type 'string' is not assignable to type 'number'.
Type 'number' is not assignable to type 'string'.
```

첫 줄은 "숫자 자리에 문자열을 넣었다", 둘째 줄은 "문자열 자리에 숫자를 넣었다"는 뜻입니다. 고친 코드는 `const price: number = 3000`, `const productName: string = '아메리카노'`처럼 타입에 맞는 값을 넣는 것입니다.
:::

### 문제 4. strict 스위치 실험 ⭐⭐

다음 코드를 입력하고 ① strict가 켜진 상태와 ② 끈 상태에서 Errors 탭이 어떻게 다른지 비교하세요. 실험이 끝나면 strict를 다시 켭니다.

```ts
function addTax(price) {
  return price * 1.1
}
console.log(addTax(10000))
```

::: details 정답 보기
① strict 켬: `Parameter 'price' implicitly has an 'any' type.` 에러 1개

② strict 끔: 에러 없음

strict를 켜면 "타입을 알 수 없는 매개변수"를 허용하지 않습니다. 에러를 없애는 올바른 방법은 strict를 끄는 것이 아니라, 타입을 적어 주는 것입니다.

```ts
function addTax(price: number) {
  return price * 1.1
}
console.log(addTax(10000))
```

Run 결과는 `[LOG]: 11000`입니다.
:::

### 문제 5. Target 비교하기 ⭐⭐⭐

다음 코드를 입력하고 TS Config의 `Target`을 `ES2017`과 `ES2022`로 바꿔 가며 `.JS` 탭을 비교하세요. 첫 줄은 "쿠폰 코드를 담는 빈 목록(배열)"이고, `?.`는 "앞의 값이 없으면 멈추고 `undefined`를 돌려준다"는 연산자입니다. 배열은 [배열](../part1-basics/07-arrays), `?.`는 [연산자](../part1-basics/03-operators) 레슨에서 배웁니다.

```ts
const couponCodes: string[] = []
console.log(couponCodes[0]?.length)
```

::: details 정답 보기
`ES2017`에서는 `?.`가 옛 문법으로 풀려서 이런 모양이 됩니다.

```js
"use strict";
var _a;
const couponCodes = [];
console.log((_a = couponCodes[0]) === null || _a === void 0 ? void 0 : _a.length);
```

값을 잠시 담아 둘 임시 변수 `_a`까지 컴파일러가 만들어 넣었습니다. `ES2022`에서는 `couponCodes[0]?.length`가 그대로 남습니다. `?.`도 `??`와 같은 2020년 문법이기 때문입니다. 실행 결과는 둘 다 `[LOG]: undefined`로 같습니다.
:::

## 확인 퀴즈

**Q1.** Playground에서 `console.log`의 결과는 어느 탭에서 볼 수 있고, 결과를 보려면 무엇을 눌러야 하나요?

::: details 정답 보기
**Logs** 탭에서 봅니다. 결과를 보려면 **Run** 버튼을 눌러 실행해야 합니다.
:::

**Q2.** `.JS` 탭에서 TypeScript 코드와 비교했을 때 사라지는 것은 무엇이고, 왜 사라지나요?

::: details 정답 보기
`: number` 같은 **타입 표기**가 사라집니다. 타입은 실행 전에 검사하는 데만 쓰이고, 실행되는 JavaScript에는 필요 없기 때문입니다.
:::

**Q3.** 빨간 밑줄이 있는 상태에서 Run을 누르면 어떻게 되나요?

::: details 정답 보기
에러가 있어도 JavaScript가 만들어져 **실행됩니다.** 다만 결과가 의도와 다를 수 있으므로 에러부터 고쳐야 합니다.
:::

**Q4.** Share로 만든 링크에 회사 코드를 넣으면 안 되는 이유는 무엇인가요?

::: details 정답 보기
공유 링크의 주소(`#code/` 뒷부분) 안에 **코드가 압축되어 통째로 들어 있기** 때문입니다. 링크를 가진 사람은 누구나 코드를 복원할 수 있고, 링크는 메신저·방문 기록 등에 남아 회수할 수 없습니다.
:::

## 정리

- TS Playground(`https://www.typescriptlang.org/play`)는 설치 없이 웹 브라우저에서 TypeScript를 검사·컴파일·실행하는 사이트입니다.
- 왼쪽은 TypeScript 편집기, 오른쪽은 `.JS`(컴파일 결과), `.D.TS`(타입 요약), `Errors`(에러 목록), `Logs`(실행 결과) 탭입니다.
- 실행은 **Run**, 결과는 **Logs** 탭. 에러가 있어도 실행은 되므로 빨간 밑줄을 먼저 고칩니다.
- **TS Config**에서 `strict`와 `Target`을 바꿀 수 있습니다. 이 위키는 strict를 켠 상태가 기준입니다.
- 버전 선택으로 TypeScript 버전을 바꾸고, Examples에서 공식 예제를 열 수 있습니다.
- Share 링크에는 코드가 통째로 들어 있으므로 회사 코드·비밀 정보는 절대 넣지 않습니다.

## 다음 단계

[첫 프로그램: tsc로 컴파일하고 실행하기](./05-first-program) — 이번에는 내 PC에 프로젝트 폴더를 만들고, Playground가 대신 해 주던 "컴파일 → 실행"을 터미널 명령으로 직접 해 봅니다.
