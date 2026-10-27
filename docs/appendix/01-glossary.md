---
title: 용어집 (한/영)
---

# 용어집 (한/영)

레슨과 에러 메시지, 공식 문서에 자주 나오는 용어를 모았습니다. 한글 용어는 가나다순으로, 영문 약어와 TS 키워드는 맨 끝에 따로 모았습니다. 각 항목의 "관련 레슨"을 누르면 그 용어를 자세히 설명한 레슨으로 이동합니다.

::: tip 찾는 법
- 아래 초성을 누르면 해당 묶음으로 바로 이동합니다.
- 영어 단어로 찾고 싶다면 브라우저 찾기(Windows는 Ctrl+F, macOS는 Cmd+F)로 영어를 입력하세요. 모든 항목에 영문 이름을 함께 적었습니다.
- 정의는 처음 배우는 분이 읽을 수 있도록 한 줄로 줄였습니다. 정확한 규칙과 예외는 관련 레슨에서 확인하세요.
:::

**바로가기:** 
[ㄱ](#g) · [ㄴ](#n) · [ㄷ](#d) · [ㄹ](#r) · [ㅁ](#m) · [ㅂ](#b) · [ㅅ](#s) · [ㅇ](#o) · [ㅈ](#j) · [ㅊ](#ch) · [ㅋ](#k) · [ㅌ](#t) · [ㅍ](#p) · [ㅎ](#h) · [영문](#en)

## ㄱ {#g}

| 용어 | 뜻 | 관련 레슨 |
|---|---|---|
| **가져오기** (import) | 다른 파일(모듈)이 내보낸 값이나 타입을 현재 파일로 불러오는 것. | [모듈](../part3-intermediate/09-modules) |
| **객체** (object) | 이름(키)과 값을 짝지어 한데 묶은 값. 예: 상품 하나의 이름·가격·재고. | [객체](../part1-basics/08-objects), [객체 타입](../part2-types/04-object-types) |
| **객체 리터럴** (object literal) | 중괄호로 그 자리에서 바로 적어 만든 객체 값. | [객체](../part1-basics/08-objects) |
| **공변성** (covariance) | "고양이가 동물이면 고양이 배열도 동물 배열"처럼 부분 관계가 같은 방향으로 유지되는 성질. | [변성](../part5-advanced/07-variance) |
| **구조 분해 할당** (destructuring assignment) | 객체·배열에서 원하는 값만 꺼내 변수에 한 번에 담는 문법. | [객체](../part1-basics/08-objects) |
| **구조적 타이핑** (structural typing) | 타입 이름이 아니라 "어떤 속성을 가졌는가(모양)"로 호환 여부를 판단하는 방식. TS의 기본 규칙. | [구조적 타이핑](../part3-intermediate/02-structural-typing) |
| **기본 매개변수** (default parameter) | 인수를 넘기지 않았을 때 대신 쓸 값을 미리 정해 둔 매개변수. | [함수 기초](../part1-basics/06-functions), [함수 타입](../part2-types/05-function-types) |
| **기본 타입 매개변수** (default type parameter) | 제네릭에서 타입 인수를 생략했을 때 대신 쓸 타입. | [제네릭 제약](../part3-intermediate/05-generic-constraints) |

## ㄴ {#n}

| 용어 | 뜻 | 관련 레슨 |
|---|---|---|
| **나머지 매개변수** (rest parameter) | 개수가 정해지지 않은 인수를 배열 하나로 모아 받는 매개변수. | [함수 타입](../part2-types/05-function-types) |
| **내보내기** (export) | 파일 안의 값이나 타입을 다른 파일에서 가져다 쓸 수 있게 공개하는 것. | [모듈](../part3-intermediate/09-modules) |
| **널 병합 연산자** (nullish coalescing) | `??`. 왼쪽 값이 `null`이나 `undefined`일 때만 오른쪽 값을 쓰는 연산자. | [연산자와 표현식](../part1-basics/03-operators) |
| **넓히기** (widening) | `let`으로 선언한 리터럴 값의 타입을 `string`·`number`처럼 더 넓은 타입으로 추론하는 것. | [타입 표기와 추론](../part2-types/01-annotation-inference), [유니온과 리터럴](../part2-types/06-union-literal) |
| **논-널 단언** (non-null assertion) | 값 뒤에 `!`를 붙여 "이 값은 `null`·`undefined`가 아니다"라고 컴파일러에게 장담하는 것. | [타입 단언](../part2-types/10-assertion) |

## ㄷ {#d}

| 용어 | 뜻 | 관련 레슨 |
|---|---|---|
| **단언 함수** (assertion function) | 조건이 틀리면 예외를 던지고, 통과하면 그 뒤로 타입을 좁혀 주는 함수(`asserts` 반환 타입). | [타입 가드 · satisfies](../part5-advanced/06-type-guards-satisfies) |
| **데코레이터** (decorator) | `@이름` 모양으로 클래스·메서드에 붙여 동작을 덧씌우는 문법. 표준 데코레이터는 TS 5.0부터. | [클래스](../part3-intermediate/08-classes) |
| **동기** (synchronous) | 한 작업이 끝나야 다음 작업을 시작하는, 줄 서서 차례대로 처리하는 방식. | [콜백과 이벤트 루프](../part4-async/01-event-loop-callback) |

## ㄹ {#r}

| 용어 | 뜻 | 관련 레슨 |
|---|---|---|
| **런타임** (runtime) | 프로그램이 실제로 실행되고 있는 시점(또는 실행 환경). 타입은 이때 존재하지 않음. | [프로그래밍과 JS·TS](../part0-start/01-what-is-programming), [런타임 검증](../part4-async/05-runtime-validation) |
| **런타임 검증** (runtime validation) | 외부에서 들어온 데이터가 정말 기대한 모양인지 실행 중에 코드로 확인하는 것. 예: zod. | [런타임 검증](../part4-async/05-runtime-validation) |
| **리터럴 타입** (literal type) | `'카드'`, `100`, `true`처럼 값 하나만 허용하는 타입. | [유니온과 리터럴](../part2-types/06-union-literal) |
| **린터** (linter) | 버그가 될 만한 코드나 규칙 위반을 찾아 알려 주는 도구. 예: ESLint. | [ESLint · Prettier](../part6-tooling/04-eslint-prettier) |

## ㅁ {#m}

| 용어 | 뜻 | 관련 레슨 |
|---|---|---|
| **매개변수** (parameter) | 함수가 받는 입력값을 담는 변수. 함수를 선언할 때 괄호 안에 적음. | [함수 기초](../part1-basics/06-functions) |
| **매개변수 속성** (parameter property) | 생성자 매개변수 앞에 `private` 등을 붙여 선언과 할당을 한 번에 하는 TS 전용 문법. | [클래스](../part3-intermediate/08-classes) |
| **매핑된 타입** (mapped type) | 기존 타입의 키를 하나씩 돌며 새 타입을 만드는 문법. `{ [K in keyof T]: ... }` | [매핑된 타입](../part5-advanced/03-mapped-types) |
| **메서드** (method) | 객체나 클래스에 속한 함수. | [객체](../part1-basics/08-objects), [클래스](../part3-intermediate/08-classes) |
| **모듈** (module) | `import`/`export`가 있는 파일 하나. 자기만의 스코프를 가짐. | [모듈](../part3-intermediate/09-modules), [모듈 시스템](../part6-tooling/03-module-systems) |
| **모듈 보강** (module augmentation) | 이미 있는 라이브러리 모듈의 타입에 내가 필요한 선언을 덧붙이는 것. | [선언 파일](../part5-advanced/08-declaration-files) |
| **문자열** (string) | 글자들의 나열. 따옴표나 백틱으로 감싸 적음. | [원시 타입](../part1-basics/02-primitive-types), [문자열과 템플릿 리터럴](../part1-basics/09-strings) |

## ㅂ {#b}

| 용어 | 뜻 | 관련 레슨 |
|---|---|---|
| **반공변성** (contravariance) | 함수 매개변수처럼 부분 관계가 반대 방향으로 뒤집히는 성질. | [변성](../part5-advanced/07-variance) |
| **반복문** (loop) | 같은 코드를 조건이 맞는 동안 여러 번 실행하는 문법. `for`, `while` 등. | [반복문](../part1-basics/05-loops) |
| **반환값** (return value) | 함수가 일을 마치고 `return`으로 돌려주는 결과값. | [함수 기초](../part1-basics/06-functions) |
| **배열** (array) | 여러 값을 순서대로 담는 목록. 예: 장바구니 상품 목록. | [배열과 배열 메서드](../part1-basics/07-arrays), [배열 타입과 튜플](../part2-types/03-arrays-tuples) |
| **변성** (variance) | 타입 A가 B의 부분일 때, A를 감싼 타입과 B를 감싼 타입 사이의 관계가 어떻게 되는지에 대한 규칙. | [변성](../part5-advanced/07-variance) |
| **변수** (variable) | 값을 담아 두고 이름으로 다시 꺼내 쓰는 상자. `let`, `const`로 만듦. | [값과 변수](../part1-basics/01-values-and-variables) |
| **분배 조건부 타입** (distributive conditional type) | 유니온 타입이 들어오면 각 멤버마다 따로 조건을 적용한 뒤 다시 합치는 조건부 타입의 성질. | [조건부 타입](../part5-advanced/01-conditional-types) |
| **비동기** (asynchronous) | 오래 걸리는 작업을 기다리지 않고 다른 일을 먼저 하다가, 끝나면 결과를 받는 방식. | [콜백과 이벤트 루프](../part4-async/01-event-loop-callback), [async/await](../part4-async/03-async-await) |
| **빌드** (build) | 소스 코드를 배포·실행할 수 있는 결과물로 바꾸는 전체 과정(컴파일, 묶기, 압축 등). | [빌드 도구](../part6-tooling/06-build-tools) |

## ㅅ {#s}

| 용어 | 뜻 | 관련 레슨 |
|---|---|---|
| **사용자 정의 타입 가드** (user-defined type guard) | 반환 타입이 `x is T`인 함수. `true`를 돌려주면 호출한 쪽에서 타입이 좁혀짐. | [타입 가드 · satisfies](../part5-advanced/06-type-guards-satisfies) |
| **선언 병합** (declaration merging) | 같은 이름의 `interface` 등을 여러 번 선언하면 하나로 합쳐지는 TS 규칙. | [type과 interface](../part2-types/07-type-alias-interface), [선언 파일](../part5-advanced/08-declaration-files) |
| **선언 파일** (declaration file) | 실행 코드 없이 타입 정보만 담은 `.d.ts` 파일. | [선언 파일](../part5-advanced/08-declaration-files) |
| **선택 속성** (optional property) | 이름 뒤에 `?`를 붙여 "있어도 되고 없어도 되는" 속성으로 만든 것. | [객체 타입](../part2-types/04-object-types) |
| **선택적 체이닝** (optional chaining) | `?.`. 앞의 값이 `null`·`undefined`면 멈추고 `undefined`를 돌려주는 접근 연산자. | [객체](../part1-basics/08-objects), [타입 좁히기](../part2-types/08-narrowing) |
| **소스 코드** (source code) | 사람이 읽고 쓰는 프로그램 글. `.ts`, `.js` 파일의 내용. | [프로그래밍과 JS·TS](../part0-start/01-what-is-programming) |
| **속성** (property) | 객체 안에서 이름(키)과 값으로 이루어진 한 칸. | [객체](../part1-basics/08-objects) |
| **스코프** (scope) | 변수 이름이 보이고 쓸 수 있는 코드 범위. | [스코프와 클로저](../part1-basics/10-scope-closure) |
| **스프레드** (spread) | `...`. 배열·객체의 내용을 펼쳐 다른 배열·객체에 복사해 넣는 문법. | [객체](../part1-basics/08-objects) |

## ㅇ {#o}

| 용어 | 뜻 | 관련 레슨 |
|---|---|---|
| **연산자** (operator) | `+`, `===`, `&&`처럼 값을 계산하거나 비교하는 기호. | [연산자와 표현식](../part1-basics/03-operators) |
| **열거형** (enum) | 이름 붙은 상수 묶음을 만드는 TS 전용 문법. 컴파일 후에도 객체로 남음. | [열거형](../part2-types/09-enum) |
| **오버로드** (overload) | 같은 함수에 인수 모양별로 여러 개의 호출 시그니처를 선언하는 것. | [함수 타입](../part2-types/05-function-types) |
| **완전성 검사** (exhaustiveness checking) | 유니온의 모든 경우를 빠짐없이 처리했는지 `never`를 이용해 컴파일러가 확인하게 하는 기법. | [판별 유니온](../part3-intermediate/03-discriminated-union) |
| **원시 타입** (primitive type) | 더 쪼갤 수 없는 기본 값의 타입. `number`, `string`, `boolean`, `null`, `undefined`, `bigint`, `symbol`. | [원시 타입](../part1-basics/02-primitive-types) |
| **유니온 타입** (union type) | `A \| B`. "A이거나 B"인 값을 허용하는 타입. | [유니온과 리터럴](../part2-types/06-union-literal) |
| **유틸리티 타입** (utility type) | `Partial`, `Pick`, `Omit`처럼 TS가 기본 제공하는 타입 변환 도구. | [유틸리티 타입](../part3-intermediate/07-utility-types) |
| **이벤트 루프** (event loop) | 자바스크립트가 대기 중인 작업(콜백)을 하나씩 꺼내 실행하는 반복 장치. | [콜백과 이벤트 루프](../part4-async/01-event-loop-callback) |
| **인덱스 시그니처** (index signature) | `[key: string]: number`처럼 "어떤 키든 이 타입의 값"이라고 정하는 객체 타입 문법. | [객체 타입](../part2-types/04-object-types) |
| **인덱스 접근 타입** (indexed access type) | `Product['price']`처럼 타입에서 특정 속성의 타입만 꺼내는 문법. | [keyof · typeof](../part3-intermediate/06-keyof-typeof-indexed) |
| **인수** (argument) | 함수를 호출할 때 실제로 넘기는 값. 매개변수에 담김. | [함수 기초](../part1-basics/06-functions) |
| **인스턴스** (instance) | 클래스라는 틀로 `new`를 써서 찍어 낸 실제 객체. | [클래스](../part3-intermediate/08-classes) |
| **인터섹션 타입** (intersection type) | `A & B`. A와 B의 속성을 모두 가진 타입. | [인터섹션](../part3-intermediate/01-intersection) |
| **인터페이스** (interface) | 객체의 모양(속성과 메서드)을 이름 붙여 정의하는 문법. | [type과 interface](../part2-types/07-type-alias-interface) |
| **읽기 전용** (readonly) | 처음 정한 뒤로 다시 바꿀 수 없게 막은 속성·배열. | [객체 타입](../part2-types/04-object-types), [배열 타입과 튜플](../part2-types/03-arrays-tuples) |

## ㅈ {#j}

| 용어 | 뜻 | 관련 레슨 |
|---|---|---|
| **재귀 타입** (recursive type) | 자기 자신을 안에서 다시 참조하는 타입. 예: 하위 카테고리를 가진 카테고리. | [재귀 타입](../part5-advanced/05-recursive-types) |
| **접근 제어자** (access modifier) | `public`, `private`, `protected`. 클래스 멤버를 어디서 쓸 수 있는지 정함. | [클래스](../part3-intermediate/08-classes) |
| **제네릭** (generic) | 타입을 매개변수처럼 받아, 여러 타입에서 재사용할 수 있게 만든 함수·타입. | [제네릭 기초](../part3-intermediate/04-generics-basics) |
| **제네릭 제약** (generic constraint) | `T extends 조건`으로 타입 매개변수에 들어올 수 있는 타입을 제한하는 것. | [제네릭 제약](../part3-intermediate/05-generic-constraints) |
| **조건문** (conditional statement) | 조건에 따라 다른 코드를 실행하는 문법. `if`, `switch` 등. | [조건문](../part1-basics/04-conditionals) |
| **조건부 타입** (conditional type) | `T extends U ? X : Y`. 타입 수준의 if 문. | [조건부 타입](../part5-advanced/01-conditional-types) |
| **좁히기** (narrowing) | `typeof`, `in`, 비교 등으로 넓은 타입을 더 구체적인 타입으로 줄여 나가는 것. | [타입 좁히기](../part2-types/08-narrowing) |

## ㅊ {#ch}

| 용어 | 뜻 | 관련 레슨 |
|---|---|---|
| **추상 클래스** (abstract class) | 직접 `new` 할 수 없고, 상속받는 클래스가 구현할 틀만 정한 클래스. | [클래스](../part3-intermediate/08-classes) |

## ㅋ {#k}

| 용어 | 뜻 | 관련 레슨 |
|---|---|---|
| **컴파일** (compile) | 소스 코드를 다른 형태(TS에서는 JS)로 바꾸는 일. TS는 이때 타입 검사도 함. | [프로그래밍과 JS·TS](../part0-start/01-what-is-programming), [첫 프로그램](../part0-start/05-first-program) |
| **컴파일러** (compiler) | 컴파일을 하는 프로그램. TS 컴파일러의 이름은 `tsc`. | [첫 프로그램](../part0-start/05-first-program) |
| **콜백** (callback) | 다른 함수에 인수로 넘겨 "나중에 불러 달라"고 맡기는 함수. | [콜백과 이벤트 루프](../part4-async/01-event-loop-callback), [배열과 배열 메서드](../part1-basics/07-arrays) |
| **클래스** (class) | 같은 모양의 객체를 여러 개 찍어 내기 위한 틀. | [클래스](../part3-intermediate/08-classes) |
| **클로저** (closure) | 함수가 자신이 만들어질 때의 바깥 변수를 기억해 계속 쓰는 현상. | [스코프와 클로저](../part1-basics/10-scope-closure) |
| **키 재매핑** (key remapping) | 매핑된 타입에서 `as`로 키 이름을 바꾸거나 걸러 내는 것. | [매핑된 타입](../part5-advanced/03-mapped-types) |

## ㅌ {#t}

| 용어 | 뜻 | 관련 레슨 |
|---|---|---|
| **타입** (type) | 값이 어떤 종류이고 무엇을 할 수 있는지에 대한 약속. "가능한 값들의 집합"으로 보면 쉬움. | [타입 표기와 추론](../part2-types/01-annotation-inference) |
| **타입 가드** (type guard) | `typeof x === 'string'`처럼 검사 뒤에 타입을 좁혀 주는 조건식. | [타입 좁히기](../part2-types/08-narrowing), [타입 가드 · satisfies](../part5-advanced/06-type-guards-satisfies) |
| **타입 단언** (type assertion) | `값 as 타입`. 컴파일러보다 내가 더 잘 안다고 타입을 덮어쓰는 것. 검사는 하지 않음. | [타입 단언](../part2-types/10-assertion) |
| **타입 매개변수** (type parameter) | 제네릭에서 `T`처럼 나중에 정해질 타입 자리를 나타내는 이름. | [제네릭 기초](../part3-intermediate/04-generics-basics) |
| **타입 별칭** (type alias) | `type 이름 = ...`으로 타입에 이름을 붙이는 것. | [type과 interface](../part2-types/07-type-alias-interface) |
| **타입 소거** (type erasure) | 컴파일하면 타입 정보가 모두 지워지고 JS만 남는 TS의 성질. | [런타임 검증](../part4-async/05-runtime-validation) |
| **타입 추론** (type inference) | 타입을 적지 않아도 TS가 값을 보고 타입을 알아내는 것. | [타입 표기와 추론](../part2-types/01-annotation-inference) |
| **타입 표기** (type annotation) | `: number`처럼 변수·매개변수·반환값에 직접 타입을 적는 것. | [타입 표기와 추론](../part2-types/01-annotation-inference) |
| **템플릿 리터럴** (template literal) | 백틱으로 감싸고 그 안에 값을 끼워 넣을 수 있는 문자열. | [문자열과 템플릿 리터럴](../part1-basics/09-strings) |
| **템플릿 리터럴 타입** (template literal type) | 백틱 문법으로 문자열 리터럴 타입을 조합해 만드는 타입. | [템플릿 리터럴 타입](../part5-advanced/04-template-literal-types) |
| **튜플** (tuple) | 길이와 칸별 타입이 정해진 배열. 예: `[string, number]` | [배열 타입과 튜플](../part2-types/03-arrays-tuples) |
| **트랜스파일** (transpile) | 비슷한 수준의 다른 언어(또는 버전)로 코드를 바꾸는 것. TS→JS 변환을 흔히 이렇게 부름. | [빌드 도구](../part6-tooling/06-build-tools) |

## ㅍ {#p}

| 용어 | 뜻 | 관련 레슨 |
|---|---|---|
| **판별 유니온** (discriminated union) | 공통 속성(예: `type`)의 리터럴 값으로 멤버를 구분할 수 있게 만든 유니온. | [판별 유니온](../part3-intermediate/03-discriminated-union) |
| **표현식** (expression) | 계산하면 값 하나가 나오는 코드 조각. 예: `price * 2` | [연산자와 표현식](../part1-basics/03-operators) |
| **프로미스** (Promise) | "나중에 완료될 작업의 결과"를 나타내는 객체. | [Promise](../part4-async/02-promise) |

## ㅎ {#h}

| 용어 | 뜻 | 관련 레슨 |
|---|---|---|
| **할당 가능성** (assignability) | 어떤 타입의 값을 다른 타입 자리에 넣어도 되는지에 대한 규칙. | [구조적 타이핑](../part3-intermediate/02-structural-typing) |
| **함수** (function) | 입력을 받아 정해진 일을 하고 결과를 돌려주는, 이름 붙은 코드 묶음. | [함수 기초](../part1-basics/06-functions), [함수 타입](../part2-types/05-function-types) |
| **화살표 함수** (arrow function) | `(x) => x * 2`처럼 `=>`로 짧게 쓰는 함수. | [함수 기초](../part1-basics/06-functions) |

## 영문 약어·키워드 {#en}

| 용어 | 풀이 | 뜻 | 관련 레슨 |
|---|---|---|---|
| **any** | 아무 타입 | 타입 검사를 완전히 꺼 버리는 타입. 가능하면 쓰지 않음. | [특수 타입](../part2-types/02-special-types) |
| **API** | Application Programming Interface | 프로그램끼리 주고받는 약속된 창구. 웹에서는 주로 서버의 HTTP 주소를 말함. | [fetch API](../part4-async/04-fetch-api), [API 클라이언트](../part7-practice/06-api-client) |
| **as const** | const 단언 | 값을 가장 좁은 리터럴 타입과 `readonly`로 고정하는 단언. | [타입 단언](../part2-types/10-assertion), [유니온과 리터럴](../part2-types/06-union-literal) |
| **CJS** | CommonJS | Node.js의 옛 모듈 방식. `require`와 `module.exports`를 씀. | [모듈 시스템](../part6-tooling/03-module-systems) |
| **`.d.ts`** | 선언 파일 | 타입 정보만 담은 파일. 위의 "선언 파일" 참고. | [선언 파일](../part5-advanced/08-declaration-files) |
| **DOM** | Document Object Model | 브라우저가 웹 페이지를 객체 나무 구조로 표현한 것. JS로 화면을 바꿀 때 씀. | [프로그래밍과 JS·TS](../part0-start/01-what-is-programming) |
| **ESM** | ECMAScript Modules | 표준 모듈 방식. `import`/`export`를 씀. | [모듈 시스템](../part6-tooling/03-module-systems), [모듈](../part3-intermediate/09-modules) |
| **IDE** | Integrated Development Environment | 편집·실행·디버깅을 한곳에서 하는 개발 도구. VS Code는 편집기지만 비슷하게 쓰임. | [개발 환경 설치](../part0-start/03-setup), [VS Code 팁](./04-vscode-tips) |
| **infer** | 타입 추출 | 조건부 타입 안에서 타입의 일부를 꺼내 이름 붙이는 키워드. | [infer](../part5-advanced/02-infer) |
| **JSON** | JavaScript Object Notation | 데이터를 주고받을 때 쓰는 텍스트 형식. `JSON.parse` 결과는 `any`이므로 주의. | [JSON · Map · Set](../part4-async/06-json-date-map-set) |
| **keyof** | 키 유니온 | 객체 타입의 키 이름들을 유니온 타입으로 꺼내는 연산자. | [keyof · typeof](../part3-intermediate/06-keyof-typeof-indexed) |
| **never** | 없는 타입 | 절대 일어날 수 없는 값의 타입. 완전성 검사에 씀. | [특수 타입](../part2-types/02-special-types), [판별 유니온](../part3-intermediate/03-discriminated-union) |
| **npm** | Node Package Manager | Node.js 패키지(라이브러리)를 설치·관리하는 도구. | [개발 환경 설치](../part0-start/03-setup) |
| **satisfies** | 만족 검사 | 값이 타입을 만족하는지 검사하되, 추론된 좁은 타입은 그대로 두는 연산자. TS 4.9부터. | [타입 가드 · satisfies](../part5-advanced/06-type-guards-satisfies) |
| **tsc** | TypeScript Compiler | TS 공식 컴파일러 명령어. 타입 검사와 JS 출력을 함. | [첫 프로그램](../part0-start/05-first-program) |
| **tsconfig.json** | TS 설정 파일 | 컴파일 대상·엄격도·모듈 방식 등 TS 프로젝트 설정을 담는 파일. | [tsconfig.json](../part6-tooling/01-tsconfig) |
| **TSX** | TypeScript + JSX | React의 JSX 문법을 쓸 수 있는 TS 파일(`.tsx`). | [React + TS](../part7-practice/02-react-basics) |
| **typeof** | 타입 질의 | 값 위치에서는 실행 중 타입 문자열을, 타입 위치에서는 변수의 TS 타입을 꺼내는 연산자. | [타입 좁히기](../part2-types/08-narrowing), [keyof · typeof](../part3-intermediate/06-keyof-typeof-indexed) |
| **`@types`** | 타입 선언 패키지 | 타입이 없는 JS 라이브러리용 `.d.ts`를 모아 둔 npm 패키지 묶음(DefinitelyTyped). | [선언 파일](../part5-advanced/08-declaration-files) |
| **unknown** | 알 수 없는 타입 | 무엇이든 담을 수 있지만, 좁히기 전에는 아무것도 할 수 없는 안전한 타입. | [특수 타입](../part2-types/02-special-types) |
| **void** | 반환값 없음 | 함수가 의미 있는 값을 돌려주지 않는다는 뜻의 반환 타입. | [특수 타입](../part2-types/02-special-types) |

::: info 용어가 없나요?
여기 없는 용어는 위키 상단 검색창에서 찾아보세요. 에러 메시지에 나오는 표현은 [자주 만나는 컴파일 에러 사전](../part9-master/01-error-dictionary)에 따로 정리되어 있습니다.
:::
