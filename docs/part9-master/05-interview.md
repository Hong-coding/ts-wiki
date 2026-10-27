---
title: 면접·실무 질문 50선
---

# 면접·실무 질문 50선

<LessonMeta level="마스터" :minutes="60" prev="자가 진단 테스트로 파트별 약점을 찾았습니다" />

## 이번에 배울 것

- TypeScript 면접과 코드 리뷰에서 자주 나오는 질문 50개에 **30초~1분 분량**으로 답할 수 있다.
- 답변을 "정의 → 이유 → 예시 → 주의점" 순서로 구조화할 수 있다.
- 모르는 질문을 받았을 때 아는 개념과 연결해 답하는 방법을 익힌다.

## 먼저 알아 둘 것

- Part 0~8 전체. 답이 막히는 질문은 답변 아래의 관련 레슨으로 돌아가세요.
- [단계별 자가 진단 테스트](./04-self-assessment)를 먼저 풀어 보면 약한 주제를 알 수 있습니다.

## 비유로 이해하기

요리를 잘하는 사람과 요리를 **가르칠 수 있는** 사람은 다릅니다. 가르치려면 "왜 소금을 이때 넣는지"를 말로 설명할 수 있어야 합니다.

면접관이나 동료가 묻는 것도 "코드를 쓸 수 있나"보다 **"왜 그렇게 썼는지 설명할 수 있나"** 입니다. 이 레슨은 머릿속에 있는 지식을 말로 꺼내는 연습장입니다.

## 개념 설명

### 답변하는 틀: 정의 → 이유 → 예시 → 주의점

좋은 답변은 대체로 네 단계입니다.

1. **정의** — 한 문장으로 무엇인지 말합니다.
2. **이유** — 왜 있는지, 어떤 문제를 푸는지 말합니다.
3. **예시** — 실무 예를 하나 듭니다(매장·주문·회원 같은 구체적인 예가 좋습니다).
4. **주의점** — 한계나 잘못 쓰는 경우를 덧붙입니다. 이 부분에서 실력 차이가 드러납니다.

예를 들어 "`any`와 `unknown`의 차이는?"이라는 질문에는 이렇게 답할 수 있습니다.

```text
정의:   둘 다 모든 값을 받을 수 있는 타입입니다.
이유:   any는 타입 검사를 끄고, unknown은 "확인하고 쓰라"고 강제합니다.
예시:   API 응답을 unknown으로 받으면 typeof나 zod로 확인해야 속성에 접근할 수 있습니다.
주의점: any는 전염되어 검사받지 않는 범위가 넓어지므로, 외부 데이터에는 unknown을 씁니다.
```

### 이 레슨을 쓰는 법

- 질문을 읽고 **소리 내어 1분 동안 답해 본 뒤** 접기 블록을 엽니다.
- 모범 답변은 **요지**입니다. 외우지 말고, 자기 말로 바꿔 말할 수 있으면 충분합니다.
- 답변에 자신이 없으면 관련 레슨 링크로 돌아갑니다.

---

### 기초 (1~10)

**Q1. TypeScript는 무엇이고, JavaScript와 어떤 관계인가요?**

::: details 모범 답변 요지
JavaScript에 **정적 타입 문법**을 더한 언어이며, 컴파일하면 타입이 지워진 JavaScript가 됩니다. 실행은 JavaScript 엔진이 하므로 실행 성능은 같고, 이점은 **개발 시점**(오류 조기 발견, 자동 완성, 리팩터링 안전성)에 있습니다. 유효한 JS는 대부분 유효한 TS입니다. → [왜 TypeScript인가](../part0-start/02-why-typescript)
:::

**Q2. TypeScript의 타입은 실행 중에도 검사되나요?**

::: details 모범 답변 요지
아닙니다. 타입은 컴파일할 때만 존재하고 출력 JS에서 지워집니다(type erasure). 그래서 API 응답·사용자 입력처럼 **외부에서 들어오는 값은 런타임 검증**(zod, 직접 만든 타입 가드)이 따로 필요합니다. → [런타임 검증](../part4-async/05-runtime-validation)
:::

**Q3. `let`, `const`, `var`의 차이는?**

::: details 모범 답변 요지
`const`는 재대입 불가, `let`은 재대입 가능하며 둘 다 **블록 스코프**입니다. `var`는 함수 스코프이고 호이스팅으로 선언 전에 `undefined`로 접근되는 등 예측하기 어려워 쓰지 않습니다. TS에서는 `const`일 때 원시값이 리터럴 타입으로 추론된다는 차이도 있습니다. → [값과 변수](../part1-basics/01-values-and-variables)
:::

**Q4. `==`와 `===`의 차이는?**

::: details 모범 답변 요지
`==`는 비교 전에 타입을 변환하고(`'1' == 1`이 `true`), `===`는 타입까지 같아야 `true`입니다. 예측 가능성을 위해 `===`를 씁니다. 예외적으로 `x == null`은 `null`과 `undefined`를 함께 확인하는 관용구로 쓰기도 합니다. → [연산자와 표현식](../part1-basics/03-operators)
:::

**Q5. `null`과 `undefined`의 차이는?**

::: details 모범 답변 요지
`undefined`는 "값이 아직 정해지지 않음"(초기화 안 된 변수, 없는 속성), `null`은 "값이 없음을 **의도적으로** 표시"입니다. `strictNullChecks`가 켜져 있으면 둘 다 명시적으로 타입에 넣어야 하고, 쓰기 전에 좁혀야 합니다. 팀에서 하나로 통일하는 편이 혼란이 적습니다. → [원시 타입](../part1-basics/02-primitive-types)
:::

**Q6. `||`와 `??`의 차이는?**

::: details 모범 답변 요지
`||`는 왼쪽이 falsy(`0`, `''`, `false`, `null`, `undefined`, `NaN`)이면 오른쪽을, `??`는 `null`·`undefined`일 때만 오른쪽을 씁니다. 수량 `0`이나 빈 메모 `''`처럼 정상 값이 falsy인 경우 `??`가 맞습니다. → [연산자와 표현식](../part1-basics/03-operators)
:::

**Q7. 클로저란 무엇이고, 어디에 쓰나요?**

::: details 모범 답변 요지
함수가 **자신이 만들어진 곳의 변수**를 기억해 나중에도 쓰는 것입니다. 상태를 숨기는 카운터·캐시, 이벤트 핸들러, React 훅 등에서 쓰입니다. 주의점은 오래된 값을 붙잡는 **stale closure**(예: `useEffect` 안의 오래된 state)입니다. → [스코프와 클로저](../part1-basics/10-scope-closure)
:::

**Q8. `map`, `filter`, `reduce`를 설명해 주세요.**

::: details 모범 답변 요지
셋 다 원본 배열을 바꾸지 않습니다. `map`은 각 요소를 변환한 새 배열, `filter`는 조건을 만족하는 요소만 모은 새 배열, `reduce`는 요소를 하나의 값(합계 등)으로 접습니다. `reduce`는 초기값을 주어야 빈 배열에서도 안전하고 타입 추론도 정확해집니다. → [배열과 배열 메서드](../part1-basics/07-arrays)
:::

**Q9. 얕은 복사와 깊은 복사의 차이는?**

::: details 모범 답변 요지
스프레드(`{ ...obj }`)는 **한 단계만** 복사하므로 중첩 객체는 원본과 공유됩니다(얕은 복사). 중첩까지 복사하려면 `structuredClone`(Node.js 17+, 최신 브라우저) 등을 씁니다. React·zustand에서 상태를 바꿀 때 중첩 객체를 직접 수정하면 변경이 감지되지 않는 버그가 납니다. → [객체](../part1-basics/08-objects)
:::

**Q10. `try/catch`에서 `catch (e)`의 `e` 타입이 `unknown`인 이유는?**

::: details 모범 답변 요지
JavaScript는 `Error`가 아닌 값(문자열, 숫자)도 던질 수 있어서, 무엇이 잡힐지 보장할 수 없기 때문입니다. strict 모드의 `useUnknownInCatchVariables`(TS 4.4부터)가 이를 강제합니다. `e instanceof Error`로 좁힌 뒤 `message`를 씁니다. → [오류 처리](../part1-basics/11-errors)
:::

---

### 타입 시스템 (11~20)

**Q11. 타입 추론이란? 언제 타입을 직접 적나요?**

::: details 모범 답변 요지
값과 문맥을 보고 컴파일러가 타입을 알아내는 것입니다. 기준은 "**함수 매개변수는 표기, 값과 함께 만드는 지역 변수는 추론**"입니다. 반환 타입은 공개 API·분기가 많은 함수에 적으면 오류 위치가 정확해지고 의도가 문서화됩니다. → [타입 표기와 타입 추론](../part2-types/01-annotation-inference)
:::

**Q12. `any`와 `unknown`의 차이는?**

::: details 모범 답변 요지
둘 다 모든 값을 받지만, `any`는 검사를 끄고 다른 타입에 자유롭게 할당되며 전염됩니다. `unknown`은 좁히기 전에는 속성 접근·호출·할당이 막혀 안전합니다. 외부 데이터는 `unknown`으로 받는 것이 원칙입니다. → [특수 타입](../part2-types/02-special-types)
:::

**Q13. `never` 타입은 언제 나오고, 어디에 쓰나요?**

::: details 모범 답변 요지
"값이 절대 존재할 수 없음"을 뜻합니다. 항상 던지는 함수의 반환 타입, 모든 경우를 좁힌 뒤 남은 타입이 `never`가 됩니다. 실무에서는 `switch`의 `default`에서 `const x: never = value`로 **완전성 검사**를 해, 유니온에 새 멤버가 추가되면 컴파일 에러가 나게 합니다. → [판별 유니온과 완전성 검사](../part3-intermediate/03-discriminated-union)
:::

**Q14. `interface`와 `type`의 차이와 선택 기준은?**

::: details 모범 답변 요지
객체 모양은 둘 다 표현할 수 있습니다. `interface`는 선언 병합과 `extends`가 되고, 관계가 캐시되어 큰 프로젝트에서 검사 성능에 유리합니다. `type`은 유니온·튜플·조건부·매핑된 타입 등 모든 타입에 이름을 붙일 수 있습니다. 흔한 기준은 "객체 모양은 `interface`, 그 외는 `type`" 또는 팀 컨벤션 통일입니다. → [타입 별칭과 인터페이스](../part2-types/07-type-alias-interface)
:::

**Q15. 구조적 타이핑이란?**

::: details 모범 답변 요지
타입의 **이름이 아니라 모양(구조)** 으로 호환성을 판단하는 방식입니다. 필요한 속성을 모두 가진 객체면 다른 이름의 타입이어도 할당됩니다. 단, 객체 리터럴을 바로 넘길 때는 초과 속성 검사로 오타를 잡아 줍니다. 이름으로 구분해야 하는 ID 같은 값은 브랜드 타입으로 보완합니다. → [구조적 타이핑](../part3-intermediate/02-structural-typing)
:::

**Q16. 타입 좁히기(narrowing) 방법을 아는 대로 말해 보세요.**

::: details 모범 답변 요지
`typeof`(원시 타입), `instanceof`(클래스), `in`(속성 존재), 동등 비교(`=== 'PAID'`, `!== null`), 판별 속성 비교, truthy 검사, 사용자 정의 타입 가드(`value is T`), assertion 함수(`asserts value is T`)가 있습니다. 컴파일러는 제어 흐름을 따라가며 각 분기 안의 타입을 좁힙니다. → [타입 좁히기](../part2-types/08-narrowing)
:::

**Q17. 판별 유니온(discriminated union)이란?**

::: details 모범 답변 요지
공통 리터럴 속성(예: `status: 'success' | 'error'`)으로 구분되는 유니온입니다. 그 속성을 비교하면 나머지 속성이 자동으로 좁혀지고, 상태별로 필요한 데이터만 갖게 해 "불가능한 상태"를 막습니다. 로딩 상태, 결제 수단, 이벤트 종류 표현에 씁니다. → [판별 유니온](../part3-intermediate/03-discriminated-union)
:::

**Q18. `as`(타입 단언)와 `!`는 언제 써도 되나요?**

::: details 모범 답변 요지
컴파일러보다 **내가 확실히 더 아는** 좁은 상황에서만 씁니다(예: `as const`, 바로 앞에서 존재를 보장한 DOM 요소). 둘 다 실행 중 검사를 하지 않으므로 틀리면 런타임 에러가 납니다. 외부 데이터에 `as`를 쓰는 것은 안티패턴이며, 검증 함수나 좁히기로 대체합니다. → [타입 단언](../part2-types/10-assertion), [안티패턴](./02-anti-patterns)
:::

**Q19. enum을 쓰지 말라는 의견이 있는 이유는?**

::: details 모범 답변 요지
enum은 타입이 아니라 **실행 코드(객체)를 만드는** TS 고유 문법이라, 타입만 지우는 도구(`isolatedModules`, Node.js의 타입 제거 실행 등)와 잘 맞지 않습니다. 숫자 enum은 `number` 타입 값을 그대로 받아들이는 등 안전성도 약합니다. 리터럴 유니온이나 `as const` 객체로 대부분 대체할 수 있습니다. 다만 팀 컨벤션이 있다면 일관성이 더 중요합니다. → [열거형과 그 대안](../part2-types/09-enum)
:::

**Q20. 리터럴 타입과 타입 넓히기(widening)를 설명해 주세요.**

::: details 모범 답변 요지
`'PAID'`처럼 값 하나만 가진 타입이 리터럴 타입입니다. `let`이나 객체 속성은 나중에 바뀔 수 있어 `string`으로 넓혀 추론됩니다. 넓히기를 막으려면 `as const`나 명시적 타입 표기를 씁니다. 리터럴 유니온 매개변수에 객체 속성을 넘길 때 에러가 나는 흔한 원인입니다. → [유니온 타입과 리터럴 타입](../part2-types/06-union-literal)
:::

---

### 제네릭 · 고급 타입 (21~30)

**Q21. 제네릭은 왜 쓰나요?**

::: details 모범 답변 요지
**입력과 출력의 타입 관계**를 유지하면서 여러 타입에 재사용하기 위해서입니다. `any`로 받으면 반환 타입 정보가 사라지지만, 배열의 첫 요소를 돌려주는 제네릭 함수는 넘긴 배열의 요소 타입을 그대로 돌려줍니다. 타입 매개변수가 한 번만 쓰이면 제네릭이 필요 없습니다. → [제네릭 기초](../part3-intermediate/04-generics-basics)
:::

**Q22. 제네릭 제약(`extends`)은 어떻게 쓰나요?**

::: details 모범 답변 요지
`T extends { id: string }`처럼 타입 매개변수가 만족해야 할 조건을 겁니다. 그러면 함수 안에서 `item.id`를 안전하게 쓸 수 있고, 조건을 만족하지 않는 인수는 컴파일 에러가 납니다. `K extends keyof T`로 객체의 키만 받게 하는 패턴이 대표적입니다. → [제네릭 제약](../part3-intermediate/05-generic-constraints)
:::

**Q23. 자주 쓰는 유틸리티 타입을 설명해 주세요.**

::: details 모범 답변 요지
`Partial`(모두 선택), `Required`(모두 필수), `Readonly`, `Pick`(일부만), `Omit`(일부 제외), `Record`(키→값 사전), `ReturnType`·`Parameters`(함수에서 꺼내기), `Awaited`(Promise 풀기), `NonNullable`. 원본 타입에서 **파생**해 중복 정의를 막는 데 씁니다. → [유틸리티 타입](../part3-intermediate/07-utility-types)
:::

**Q24. 조건부 타입과 분배 법칙을 설명해 주세요.**

::: details 모범 답변 요지
`T extends U ? X : Y`는 타입 수준의 삼항 연산자입니다. `T`가 감싸지 않은 타입 매개변수이고 유니온이 들어오면 **멤버마다 따로 계산해 합칩니다**(분배). `Exclude`·`Extract`가 이 원리입니다. 분배를 막으려면 `[T] extends [U]`처럼 감쌉니다. → [조건부 타입](../part5-advanced/01-conditional-types)
:::

**Q25. `infer`는 무엇인가요?**

::: details 모범 답변 요지
조건부 타입의 `extends` 절 안에서 **일부 타입을 변수처럼 붙잡아 꺼내는** 키워드입니다. 예를 들어 Promise 안의 타입을 꺼내는 타입을 만들 수 있습니다. `ReturnType`, `Parameters`, `Awaited`가 이 방식으로 만들어져 있습니다. → [infer](../part5-advanced/02-infer)
:::

**Q26. 매핑된 타입(mapped type)이란?**

::: details 모범 답변 요지
`{ [K in keyof T]: ... }`로 기존 타입의 키를 돌면서 새 타입을 만드는 문법입니다. `readonly`·`?` 수정자를 더하거나 빼고(`-?`), `as`로 키 이름을 바꿀 수 있습니다(TS 4.1부터). `Partial`, `Readonly`가 매핑된 타입입니다. → [매핑된 타입](../part5-advanced/03-mapped-types)
:::

**Q27. `satisfies` 연산자는 언제 쓰나요?**

::: details 모범 답변 요지
값이 어떤 타입을 만족하는지 **검사만 하고**, 값의 구체적인 추론 타입은 유지하고 싶을 때 씁니다(TS 4.9부터). 예: 라우트 설정 객체를 `Record` 타입으로 검사하면서 키 이름은 리터럴로 남겨 자동 완성을 유지합니다. 타입 표기(`: T`)는 타입을 `T`로 넓혀 버립니다. → [satisfies](../part5-advanced/06-type-guards-satisfies)
:::

**Q28. 사용자 정의 타입 가드와 assertion 함수의 차이는?**

::: details 모범 답변 요지
타입 가드는 `value is T`를 반환 타입으로 가진 boolean 함수로, `if` 안에서 타입을 좁힙니다. assertion 함수는 `asserts value is T`로, 조건을 만족하지 않으면 던지고 **호출 이후의 모든 코드**에서 타입이 좁혀집니다. 둘 다 함수 본문이 틀리면 컴파일러가 속으므로 구현을 신중히 테스트합니다. → [타입 가드](../part5-advanced/06-type-guards-satisfies)
:::

**Q29. 공변성과 반공변성을 설명해 주세요.**

::: details 모범 답변 요지
`Dog`가 `Animal`의 하위 타입일 때, 배열·반환 타입처럼 **같은 방향**으로 하위 관계가 유지되면 공변, 함수 매개변수처럼 **반대 방향**이 되면 반공변입니다. `(a: Animal) => void`는 `(d: Dog) => void` 자리에 들어갈 수 있지만 반대는 안 됩니다. `strictFunctionTypes`가 함수 타입 매개변수에 이를 적용합니다(메서드 문법으로 선언한 것은 예외적으로 느슨하게 검사). → [변성](../part5-advanced/07-variance)
:::

**Q30. 선언 병합과 모듈 보강은 언제 쓰나요?**

::: details 모범 답변 요지
같은 이름의 `interface`는 자동으로 합쳐집니다(선언 병합). 이를 이용해 라이브러리 타입에 필드를 추가하는 것이 모듈 보강입니다. 예: `declare module 'express'` 안에서 `Request` 인터페이스에 `user` 속성을 추가해, 인증 미들웨어가 넣는 `req.user`에 타입을 붙입니다. → [선언 파일](../part5-advanced/08-declaration-files)
:::

---

### 도구 · 설정 (31~40)

**Q31. `strict: true`는 무엇을 켜나요? 꼭 켜야 하나요?**

::: details 모범 답변 요지
`strictNullChecks`, `noImplicitAny`, `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, `noImplicitThis`, `useUnknownInCatchVariables`, `alwaysStrict` 등을 한 번에 켭니다(TS 버전이 올라가며 추가될 수 있음). 새 프로젝트는 반드시 켭니다. 레거시는 옵션을 하나씩 켜며 점진적으로 이전합니다. → [strict 옵션](../part6-tooling/02-strict-options)
:::

**Q32. `module`과 `moduleResolution` 설정은 어떻게 고르나요?**

::: details 모범 답변 요지
코드가 **어디서 실행되는지**에 맞춥니다. Vite·webpack 같은 번들러를 거치면 `module: "esnext"` + `moduleResolution: "bundler"`(TS 5.0부터), Node.js에서 직접 실행하면 `module: "nodenext"`(이 경우 상대 import에 `.js` 확장자 필요)를 씁니다. → [모듈 시스템](../part6-tooling/03-module-systems)
:::

**Q33. ESM과 CommonJS의 차이는?**

::: details 모범 답변 요지
ESM은 `import`/`export`, 정적 분석 가능(트리 셰이킹), 비동기 로딩, 최상위 `await` 지원이 특징입니다. CommonJS는 `require`/`module.exports`, 동기 로딩입니다. Node.js에서는 `package.json`의 `"type"`이나 확장자(`.mjs`/`.cjs`)로 구분합니다. 섞어 쓸 때 default import 호환 문제(`esModuleInterop`)가 생깁니다. → [모듈 시스템](../part6-tooling/03-module-systems)
:::

**Q34. Vite나 esbuild로 빌드하면 타입 검사가 되나요?**

::: details 모범 답변 요지
되지 않습니다. 속도를 위해 파일 단위로 타입을 **지우기만** 합니다. 그래서 CI나 빌드 스크립트에서 `tsc --noEmit`을 따로 실행합니다. 파일 단위 변환과 맞지 않는 문법을 막으려면 `isolatedModules: true`(또는 TS 5.0부터의 `verbatimModuleSyntax`)를 켭니다. → [빌드 도구](../part6-tooling/06-build-tools)
:::

**Q35. `.d.ts` 파일은 무엇이고, 언제 직접 만드나요?**

::: details 모범 답변 요지
구현 없이 **타입 정보만** 담은 선언 파일입니다. 라이브러리 배포 시 `declaration: true`로 자동 생성되고, 타입이 없는 JS 라이브러리나 `.svg`·`.css` 모듈, 전역 변수에 타입을 붙일 때 직접 만듭니다. 먼저 `@types/패키지`가 있는지 확인합니다. → [선언 파일](../part5-advanced/08-declaration-files)
:::

**Q36. typescript-eslint를 쓰는 이유는? 컴파일러와 무엇이 다른가요?**

::: details 모범 답변 요지
컴파일러는 **타입이 맞는지**를, 린터는 **위험하거나 팀이 금지한 패턴**을 봅니다. 예: `no-explicit-any`, 기다리지 않는 Promise를 찾는 `no-floating-promises`, 불필요한 조건을 찾는 `no-unnecessary-condition`. 뒤의 두 규칙은 타입 정보를 사용하는 규칙이라 프로젝트 tsconfig 연결이 필요합니다. → [ESLint와 Prettier](../part6-tooling/04-eslint-prettier)
:::

**Q37. TS 코드 테스트는 어떻게 하나요? 타입도 테스트하나요?**

::: details 모범 답변 요지
런타임 동작은 Vitest·Jest로 테스트합니다. 라이브러리처럼 타입 자체가 제품인 경우 Vitest의 `expectTypeOf`나 `@ts-expect-error`를 이용한 **타입 테스트**도 작성합니다. 업무 코드에서는 런타임 테스트 + CI의 `tsc --noEmit`이 기본입니다. → [Vitest](../part6-tooling/05-testing-vitest)
:::

**Q38. JS 프로젝트를 TS로 이전한 경험(또는 계획)을 말해 보세요.**

::: details 모범 답변 요지
`allowJs`·`checkJs`로 시작해, **의존성이 적은 하위 모듈(유틸·타입)부터** `.ts`로 바꿉니다. 처음엔 `strict`를 끄고 `noImplicitAny` → `strictNullChecks` 순으로 켜며, 남은 `any`는 개수를 추적해 줄여 나갑니다. 기능 개발을 멈추지 않는 점진적 이전이 핵심입니다. → [마이그레이션](../part6-tooling/07-migration)
:::

**Q39. 큰 프로젝트에서 타입 검사가 느릴 때 어떻게 하나요?**

::: details 모범 답변 요지
먼저 `--extendedDiagnostics`로 측정합니다. 파일 수가 문제면 `include`/`types`를 정리하고 `skipLibCheck`, 반복 검사가 문제면 `incremental`, 저장소가 크면 프로젝트 참조(`tsc -b`)로 나눕니다. 특정 타입이 문제면 `--generateTrace`로 찾아 `interface extends`·반환 타입 명시·거대 유니온 제거로 고칩니다. → [대규모 코드베이스](./03-large-codebase)
:::

**Q40. `@ts-ignore`와 `@ts-expect-error`의 차이는?**

::: details 모범 답변 요지
둘 다 다음 줄의 에러를 숨기지만, `@ts-expect-error`는 숨길 에러가 **없으면 오히려 에러**를 냅니다. 그래서 원인이 고쳐진 뒤 쓸모없어진 주석이 남지 않습니다. 써야 한다면 `@ts-expect-error`와 이유 주석을 남기고, 가능하면 원인을 고칩니다. → [안티패턴](./02-anti-patterns)
:::

---

### React · 실무 (41~50)

**Q41. React 컴포넌트 props 타입은 어떻게 정의하나요?**

::: details 모범 답변 요지
`interface ButtonProps { label: string; onClick?: () => void }`처럼 정의하고 매개변수 구조 분해에 붙입니다. 자식은 `children: React.ReactNode`, 네이티브 `button` 속성을 물려받을 때는 `React.ComponentProps` 유틸리티를 확장합니다. `React.FC`는 필수가 아니며, 함수 선언 + props 타입이 흔한 방식입니다. → [React + TS 기초](../part7-practice/02-react-basics)
:::

**Q42. `useState`에 타입 인수를 언제 적나요?**

::: details 모범 답변 요지
초기값으로 타입을 충분히 알 수 없을 때입니다. 빈 배열은 `never[]`, `null`은 `null`로 추론되므로 `useState<Member[]>([])`, `useState<Member | null>(null)`처럼 적습니다. 초기값이 `0`, `''`처럼 명확하면 추론에 맡깁니다. → [React 훅](../part7-practice/03-react-hooks)
:::

**Q43. 이벤트 핸들러 타입은 어떻게 붙이나요?**

::: details 모범 답변 요지
JSX 안에 인라인으로 쓰면 문맥으로 추론됩니다. 따로 함수로 뺄 때는 `React.ChangeEvent<HTMLInputElement>`처럼 이벤트 종류와 요소 타입을 적습니다. 모르겠으면 JSX 속성에 마우스를 올려 기대 타입을 확인합니다. → [React + TS 기초](../part7-practice/02-react-basics)
:::

**Q44. Context를 타입 안전하게 만드는 방법은?**

::: details 모범 답변 요지
`createContext<CartContextValue | null>(null)`로 만들고, `useContext` 결과가 `null`이면 "Provider 밖에서 사용" 에러를 던지는 **커스텀 훅**(`useCart`)으로 감쌉니다. 그러면 쓰는 쪽은 `null` 확인 없이 안전하게 씁니다. 빈 객체를 `as`로 단언해 기본값을 주는 방식은 피합니다. → [React 훅 · Context](../part7-practice/03-react-hooks)
:::

**Q45. API 응답 타입은 어떻게 관리하나요?**

::: details 모범 답변 요지
공통 응답 래퍼를 제네릭(`ApiResponse<T>`)으로 정의하고, 엔드포인트별 DTO 타입을 둡니다. 경계(API 클라이언트)에서 zod 등으로 **검증**하고, `Date` 변환 같은 DTO → 도메인 변환도 그곳에서 합니다. 가능하면 OpenAPI 명세에서 타입을 생성해 서버와의 불일치를 줄입니다. → [API 클라이언트 타입 설계](../part7-practice/06-api-client)
:::

**Q46. 프론트와 백엔드가 타입을 공유하는 방법은?**

::: details 모범 답변 요지
① 모노레포에 공통 타입 패키지를 두고 양쪽에서 import, ② OpenAPI 명세에서 타입 생성, ③ zod 스키마를 공유해 검증과 타입을 함께 사용, ④ tRPC처럼 함수 호출 형태로 타입을 연결하는 방법이 있습니다. 백엔드가 Java처럼 다른 언어라면 ②가 현실적입니다. → [대규모 코드베이스](./03-large-codebase)
:::

**Q47. 상태 관리 라이브러리(zustand 등)를 TS와 쓸 때 주의점은?**

::: details 모범 답변 요지
상태와 액션을 하나의 인터페이스로 정의하고 `create<State>()(...)`로 만듭니다. 컴포넌트에서는 **필요한 조각만 선택**(selector)해 불필요한 리렌더를 막고, 서버 데이터는 별도 도구(TanStack Query 등)로 분리하는 것이 좋습니다. 중첩 상태는 불변 업데이트를 지킵니다. → [zustand](../part7-practice/05-zustand)
:::

**Q48. 좋은 타입 설계의 원칙을 말해 보세요.**

::: details 모범 답변 요지
① 불가능한 상태를 표현할 수 없게(판별 유니온), ② 원본에서 파생(`Pick`/`Omit`), ③ 경계에서 검증하고 내부는 신뢰, ④ 입력은 넓게·출력은 좁게, ⑤ 의미가 다른 원시값은 구분(브랜드 타입), ⑥ 단순함 우선입니다. → [좋은 타입 설계](../part7-practice/07-type-design)
:::

**Q49. 타입이 맞는데도 보안 문제가 생길 수 있는 경우는?**

::: details 모범 답변 요지
타입은 값의 **종류**만 보고 **내용**은 보지 않으며 실행 중엔 사라집니다. `keyword: string`이어도 SQL에 이어 붙이면 인젝션, `innerHTML`·`dangerouslySetInnerHTML`에 넣으면 XSS가 됩니다. 입력 검증, 파라미터 바인딩, 출력 이스케이프, 서버 측 인가 확인, 민감 정보 마스킹 로깅이 별도로 필요합니다. → [안티패턴과 코드 리뷰 체크리스트](./02-anti-patterns)
:::

**Q50. 처음 보는 타입 에러를 만났을 때 어떻게 해결하나요?**

::: details 모범 답변 요지
① 에러 코드와 **가장 깊게 들여쓴 마지막 줄**을 먼저 읽고, ② 에러 위치보다 **값이 만들어진 곳**을 확인하며, ③ 마우스 호버로 실제 추론 타입을 보고, ④ 코드를 작게 줄여 Playground에서 재현합니다. 그래도 모르면 에러 코드로 검색하고 공식 문서·이슈를 확인합니다. `as any`로 덮지 않는 것이 원칙입니다. → [에러 사전](./01-error-dictionary)
:::

## 자주 하는 실수

### 실수 1: 정의만 말하고 끝내기

```text
Q. 제네릭이 뭔가요?
A. 타입을 매개변수로 받는 겁니다.
```

**왜 부족한가**: 정의는 맞지만 "왜 필요한지"가 없어 이해했는지 알 수 없습니다.

**고친 답변**

```text
A. 타입을 매개변수로 받아서, 입력과 출력의 타입 관계를 유지한 채 재사용하는 기능입니다.
   any로 받으면 반환값의 타입 정보가 사라지지만, 제네릭 first 함수는
   상품 배열을 넘기면 상품 타입을 돌려줍니다. 다만 T가 한 번만 쓰이면 제네릭이 필요 없습니다.
```

### 실수 2: 모르는 것을 아는 척하기

모르는 질문에 그럴듯하게 지어내면, 이어지는 꼬리 질문에서 금방 드러납니다. "정확히는 모르지만, 제가 아는 ○○와 비슷하다면 이럴 것 같습니다. 확인해 보겠습니다"처럼 **아는 것과 추측을 구분**해 말하는 편이 신뢰를 줍니다.

### 실수 3: "항상", "절대"로 답하기

"enum은 절대 쓰면 안 됩니다"처럼 단정하면 예외 상황을 묻는 꼬리 질문에 막힙니다. "보통은 ○○를 선호하지만, △△한 경우에는 □□도 괜찮습니다"처럼 **조건을 붙여** 답합니다.

## 직접 해 보기

### 문제 1 ⭐ 1분 답변 녹음

Q12, Q17, Q21 세 질문에 각각 1분씩 휴대전화로 녹음하며 답해 보세요. 다시 들으며 "정의 → 이유 → 예시 → 주의점"이 모두 들어갔는지 확인합니다.

::: details 정답 보기
확인 기준:

- 정의가 첫 문장에 나왔는가
- "왜 필요한가"를 말했는가
- 매장·주문·회원 같은 구체적인 예를 들었는가
- 한계나 주의점을 하나 이상 말했는가
- 1분을 크게 넘기지 않았는가
:::

### 문제 2 ⭐⭐ 꼬리 질문 예상하기

Q18(`as`와 `!`)에 대한 답변 뒤에 면접관이 물을 만한 꼬리 질문 3개를 만들고 답해 보세요.

::: details 정답 보기
예시:

1. "`as unknown as T`는 왜 되나요?" → `unknown`은 모든 타입과 겹치므로 단언이 허용됩니다. 하지만 검사를 완전히 우회하는 것이라 위험합니다.
2. "`as const`도 단언인데 괜찮나요?" → 값을 바꾸지 않고 **더 좁은(정확한) 타입**으로 고정할 뿐이라 안전합니다.
3. "DOM 요소에 `!`를 써도 되나요?" → HTML에 반드시 있는 요소라면 실무에서 쓰기도 하지만, 없을 때 명확한 에러를 던지는 헬퍼 함수가 더 안전합니다.
:::

### 문제 3 ⭐⭐ 코드로 답하기

"판별 유니온이 boolean 플래그보다 나은 이유를 코드로 보여 주세요"라는 요청에 짧은 코드로 답해 보세요.

::: details 정답 보기

```ts
type FetchState =
  | { status: 'loading' }
  | { status: 'success'; data: string[] }
  | { status: 'error'; message: string }
const ok: FetchState = { status: 'success', data: ['O001'] }
console.log(ok.status === 'success' ? ok.data.length : 0)
// 출력: 1
```

`isLoading`/`isError`/`data?`였다면 "로딩 중인데 에러" 같은 조합이 가능하지만, 판별 유니온에서는 표현 자체가 불가능하고 `success`일 때만 `data`가 있다는 것이 타입으로 보장됩니다.
:::

### 문제 4 ⭐⭐⭐ 나만의 질문 5개

이 레슨에 없는 질문 5개를 직접 만들어 답을 정리해 보세요. 실무에서 실제로 막혔던 경험을 질문으로 바꾸면 가장 좋습니다.

::: details 정답 보기
예시 질문:

- "`Record` 타입과 `Map`은 언제 각각 쓰나요?"
- "`readonly` 배열을 받는 함수에 일반 배열을 넘길 수 있나요? 반대는요?"
- "`Promise.all`과 `Promise.allSettled`의 차이와 반환 타입은?"
- "`keyof`를 유니온 타입에 쓰면 어떤 결과가 나오나요?"
- "`exactOptionalPropertyTypes`를 켜면 무엇이 달라지나요?"
:::

## 확인 퀴즈

1. 답변의 네 단계 틀은 무엇인가요?
2. 모르는 질문을 받았을 때 바람직한 태도는?
3. "타입이 맞으면 안전하다"는 말이 틀린 이유를 한 문장으로 말해 보세요.

::: details 정답 보기
1. 정의 → 이유 → 예시 → 주의점.
2. 아는 것과 추측을 구분해서 말하고, 아는 개념과 연결해 추론 과정을 보여 주며, 확인하겠다고 말합니다.
3. 타입은 값의 종류만 컴파일 시점에 검사하고, 실행 중 실제 내용(외부 입력, SQL 문자열 등)은 검사하지 않기 때문입니다.
:::

## 정리

- 면접 답변은 **정의 → 이유 → 예시 → 주의점** 순서로 1분 안팎에 말합니다.
- 기초·타입 시스템·제네릭/고급·도구·React/실무의 다섯 영역을 고르게 준비합니다.
- 모범 답변은 외우지 말고 자기 말로 바꿔 말할 수 있을 때까지 연습합니다.
- 모르는 것은 솔직하게, 단정 대신 **조건을 붙여** 답합니다.

## 다음 단계

[다음 단계와 추천 학습 자료](./06-next-steps) — 이 위키를 마친 뒤에도 계속 성장하기 위한 공식 문서·연습 자료와 학습 습관을 소개합니다.
