// 학습 커리큘럼 단일 정의 파일
// 사이드바·목차 페이지가 모두 이 파일을 기준으로 만들어지므로, 문서를 추가·이동할 때는 여기만 고칩니다.

export interface Lesson {
  /** 파일 이름(확장자 제외). 예: '01-what-is-typescript' */
  slug: string
  title: string
  /** 예상 학습 시간(분) */
  minutes: number
}

export interface Part {
  /** 폴더 이름. 예: 'part0-start' */
  dir: string
  no: number
  title: string
  /** 이 파트를 마치면 할 수 있게 되는 것 */
  goal: string
  level: '입문' | '초급' | '중급' | '고급' | '실전' | '마스터'
  lessons: Lesson[]
}

export const curriculum: Part[] = [
  {
    dir: 'part0-start',
    no: 0,
    title: '시작하기',
    goal: 'TypeScript가 무엇이고 왜 쓰는지 이해하고, 내 PC에서 첫 TS 프로그램을 실행한다.',
    level: '입문',
    lessons: [
      { slug: '01-what-is-programming', title: '프로그래밍과 JavaScript, 그리고 TypeScript', minutes: 30 },
      { slug: '02-why-typescript', title: '왜 TypeScript인가: 타입이 막아 주는 실수들', minutes: 30 },
      { slug: '03-setup', title: '개발 환경 설치 (Node.js · VS Code · Git)', minutes: 60 },
      { slug: '04-playground', title: 'TS Playground로 설치 없이 바로 해 보기', minutes: 20 },
      { slug: '05-first-program', title: '첫 프로그램: tsc로 컴파일하고 실행하기', minutes: 45 },
      { slug: '06-how-to-read-errors', title: '에러 메시지 읽는 법과 도움 받는 법', minutes: 30 },
    ],
  },
  {
    dir: 'part1-basics',
    no: 1,
    title: '프로그래밍 기초 (TypeScript로 배우는 JavaScript)',
    goal: '변수·조건·반복·함수·배열·객체로 간단한 프로그램을 스스로 작성한다.',
    level: '입문',
    lessons: [
      { slug: '01-values-and-variables', title: '값과 변수: let · const', minutes: 40 },
      { slug: '02-primitive-types', title: '원시 타입: number · string · boolean · null · undefined', minutes: 40 },
      { slug: '03-operators', title: '연산자와 표현식', minutes: 40 },
      { slug: '04-conditionals', title: '조건문: if · switch · 삼항 연산자', minutes: 45 },
      { slug: '05-loops', title: '반복문: for · while · for...of', minutes: 45 },
      { slug: '06-functions', title: '함수 기초: 선언 · 화살표 함수 · 매개변수 · 반환값', minutes: 60 },
      { slug: '07-arrays', title: '배열과 배열 메서드 (map · filter · reduce)', minutes: 60 },
      { slug: '08-objects', title: '객체: 속성 · 메서드 · 구조 분해 · 스프레드', minutes: 60 },
      { slug: '09-strings', title: '문자열 다루기와 템플릿 리터럴', minutes: 40 },
      { slug: '10-scope-closure', title: '스코프와 클로저', minutes: 50 },
      { slug: '11-errors', title: '오류 처리: throw · try/catch/finally', minutes: 40 },
    ],
  },
  {
    dir: 'part2-types',
    no: 2,
    title: '타입 시스템 기초',
    goal: '코드에 알맞은 타입을 붙이고, 컴파일러가 알려 주는 타입 오류를 스스로 해결한다.',
    level: '초급',
    lessons: [
      { slug: '01-annotation-inference', title: '타입 표기와 타입 추론', minutes: 40 },
      { slug: '02-special-types', title: '특수 타입: any · unknown · never · void', minutes: 45 },
      { slug: '03-arrays-tuples', title: '배열 타입과 튜플', minutes: 40 },
      { slug: '04-object-types', title: '객체 타입: 선택 속성 · readonly · 인덱스 시그니처', minutes: 50 },
      { slug: '05-function-types', title: '함수 타입: 선택·기본·나머지 매개변수와 오버로드', minutes: 60 },
      { slug: '06-union-literal', title: '유니온 타입과 리터럴 타입', minutes: 50 },
      { slug: '07-type-alias-interface', title: '타입 별칭(type)과 인터페이스(interface)', minutes: 50 },
      { slug: '08-narrowing', title: '타입 좁히기(Narrowing)', minutes: 60 },
      { slug: '09-enum', title: '열거형(enum)과 그 대안', minutes: 40 },
      { slug: '10-assertion', title: '타입 단언(as)과 non-null 단언(!)', minutes: 30 },
    ],
  },
  {
    dir: 'part3-intermediate',
    no: 3,
    title: '타입 시스템 중급',
    goal: '제네릭과 유틸리티 타입으로 재사용 가능한 타입을 설계하고, 클래스·모듈을 타입 안전하게 쓴다.',
    level: '중급',
    lessons: [
      { slug: '01-intersection', title: '인터섹션(&)과 타입 합성', minutes: 40 },
      { slug: '02-structural-typing', title: '구조적 타이핑과 할당 가능성', minutes: 50 },
      { slug: '03-discriminated-union', title: '판별 유니온과 완전성 검사(exhaustiveness)', minutes: 60 },
      { slug: '04-generics-basics', title: '제네릭 기초', minutes: 60 },
      { slug: '05-generic-constraints', title: '제네릭 제약(extends)과 기본 타입 매개변수', minutes: 50 },
      { slug: '06-keyof-typeof-indexed', title: 'keyof · typeof · 인덱스 접근 타입', minutes: 50 },
      { slug: '07-utility-types', title: '내장 유틸리티 타입 총정리', minutes: 60 },
      { slug: '08-classes', title: '클래스: 접근 제어자 · 추상 클래스 · implements', minutes: 60 },
      { slug: '09-modules', title: '모듈: import/export와 타입 전용 import', minutes: 45 },
    ],
  },
  {
    dir: 'part4-async',
    no: 4,
    title: '비동기 프로그래밍과 데이터 다루기',
    goal: 'Promise·async/await로 API를 호출하고, 외부 데이터를 타입 안전하게 검증한다.',
    level: '중급',
    lessons: [
      { slug: '01-event-loop-callback', title: '동기 vs 비동기, 콜백과 이벤트 루프', minutes: 50 },
      { slug: '02-promise', title: 'Promise 완전 이해', minutes: 60 },
      { slug: '03-async-await', title: 'async/await와 비동기 오류 처리', minutes: 50 },
      { slug: '04-fetch-api', title: 'fetch로 API 호출하고 응답에 타입 붙이기', minutes: 60 },
      { slug: '05-runtime-validation', title: '런타임 검증: 타입은 실행 중에 사라진다 (zod)', minutes: 50 },
      { slug: '06-json-date-map-set', title: 'JSON · Date · Map · Set 타입 안전하게 쓰기', minutes: 45 },
    ],
  },
  {
    dir: 'part5-advanced',
    no: 5,
    title: '고급 타입',
    goal: '조건부·매핑·템플릿 리터럴 타입으로 라이브러리 수준의 타입을 읽고 직접 만든다.',
    level: '고급',
    lessons: [
      { slug: '01-conditional-types', title: '조건부 타입과 분배 법칙', minutes: 60 },
      { slug: '02-infer', title: 'infer로 타입 꺼내기', minutes: 50 },
      { slug: '03-mapped-types', title: '매핑된 타입과 키 재매핑(as)', minutes: 60 },
      { slug: '04-template-literal-types', title: '템플릿 리터럴 타입', minutes: 50 },
      { slug: '05-recursive-types', title: '재귀 타입', minutes: 50 },
      { slug: '06-type-guards-satisfies', title: '사용자 정의 타입 가드 · assertion 함수 · satisfies', minutes: 50 },
      { slug: '07-variance', title: '변성(공변·반공변)과 함수 타입 호환성', minutes: 50 },
      { slug: '08-declaration-files', title: '선언 파일(.d.ts) · 선언 병합 · 모듈 보강', minutes: 60 },
      { slug: '09-type-challenges', title: '타입 레벨 프로그래밍 훈련 (type-challenges 풀이)', minutes: 90 },
    ],
  },
  {
    dir: 'part6-tooling',
    no: 6,
    title: '프로젝트 설정과 도구',
    goal: 'tsconfig·린터·테스트·빌드를 갖춘 TS 프로젝트를 처음부터 구성하고, JS 프로젝트를 TS로 옮긴다.',
    level: '실전',
    lessons: [
      { slug: '01-tsconfig', title: 'tsconfig.json 완전 정복', minutes: 60 },
      { slug: '02-strict-options', title: 'strict 옵션 하나씩 이해하기', minutes: 50 },
      { slug: '03-module-systems', title: '모듈 시스템: ESM · CommonJS · moduleResolution', minutes: 50 },
      { slug: '04-eslint-prettier', title: 'ESLint(typescript-eslint)와 Prettier', minutes: 40 },
      { slug: '05-testing-vitest', title: 'Vitest로 테스트 작성하기', minutes: 60 },
      { slug: '06-build-tools', title: '빌드 도구: tsc · Vite · tsup · tsx', minutes: 45 },
      { slug: '07-migration', title: 'JavaScript 프로젝트를 TypeScript로 마이그레이션', minutes: 60 },
    ],
  },
  {
    dir: 'part7-practice',
    no: 7,
    title: '실전 프레임워크와 타입 설계',
    goal: 'Node.js·React·Vue 실무 코드에서 타입을 올바르게 쓰고, 좋은 타입 설계 원칙을 적용한다.',
    level: '실전',
    lessons: [
      { slug: '01-node-express', title: 'Node.js + Express REST API를 TS로', minutes: 90 },
      { slug: '02-react-basics', title: 'React + TS: 컴포넌트 · props · state · 이벤트', minutes: 90 },
      { slug: '03-react-hooks', title: 'React + TS: 훅 · Context · 커스텀 훅', minutes: 75 },
      { slug: '04-vue', title: 'Vue 3 + TS: script setup · defineProps · Pinia', minutes: 75 },
      { slug: '05-zustand', title: '상태 관리 zustand를 타입 안전하게', minutes: 50 },
      { slug: '06-api-client', title: 'API 클라이언트 타입 설계 (axios · 공통 응답 · 에러)', minutes: 60 },
      { slug: '07-type-design', title: '좋은 타입 설계 원칙과 패턴', minutes: 60 },
    ],
  },
  {
    dir: 'part8-projects',
    no: 8,
    title: '실습 프로젝트',
    goal: '배운 내용을 묶어 혼자 힘으로 동작하는 프로그램 4개를 완성한다.',
    level: '실전',
    lessons: [
      { slug: '01-cli-budget', title: '프로젝트 1: 콘솔 가계부 (Node CLI)', minutes: 180 },
      { slug: '02-todo-web', title: '프로젝트 2: Todo 웹앱 (Vite + 순수 TS + DOM)', minutes: 240 },
      { slug: '03-rest-api', title: '프로젝트 3: 주문 REST API 서버 (Express + zod + Vitest)', minutes: 300 },
      { slug: '04-react-order-app', title: '프로젝트 4: React 주문 앱 (React + zustand + API 연동)', minutes: 360 },
    ],
  },
  {
    dir: 'part9-master',
    no: 9,
    title: '마스터 과정',
    goal: '낯선 타입 오류를 스스로 해결하고, 남의 코드를 리뷰하며, 실력을 객관적으로 점검한다.',
    level: '마스터',
    lessons: [
      { slug: '01-error-dictionary', title: '자주 만나는 컴파일 에러 사전 (TS2322 등)', minutes: 60 },
      { slug: '02-anti-patterns', title: '안티패턴과 코드 리뷰 체크리스트', minutes: 50 },
      { slug: '03-large-codebase', title: '대규모 코드베이스: 타입 체크 성능 · 프로젝트 참조', minutes: 45 },
      { slug: '04-self-assessment', title: '단계별 자가 진단 테스트', minutes: 90 },
      { slug: '05-interview', title: '면접·실무 질문 50선', minutes: 60 },
      { slug: '06-next-steps', title: '다음 단계와 추천 학습 자료', minutes: 20 },
    ],
  },
  {
    dir: 'appendix',
    no: 10,
    title: '부록',
    goal: '공부하다 막힐 때 바로 찾아보는 참고 자료',
    level: '입문',
    lessons: [
      { slug: '01-glossary', title: '용어집 (한/영)', minutes: 0 },
      { slug: '02-cheatsheet', title: 'TypeScript 문법 치트시트', minutes: 0 },
      { slug: '03-js-vs-ts', title: 'JavaScript ↔ TypeScript 대조표', minutes: 0 },
      { slug: '04-vscode-tips', title: 'VS Code 단축키와 TS 개발 팁', minutes: 0 },
    ],
  },
]
