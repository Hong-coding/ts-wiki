# Part 2. 타입 시스템 기초

Part 1에서는 변수·조건문·반복문·함수·배열·객체로 프로그램을 만드는 법을 배웠습니다. Part 2부터는 TypeScript의 본업인 **타입 시스템**(type system, 값에 종류를 붙이고 그 종류가 맞게 쓰였는지 검사하는 규칙 전체)을 본격적으로 배웁니다.

이 파트를 마치면 **코드에 알맞은 타입을 붙이고, 컴파일러가 알려 주는 타입 오류를 스스로 해결할 수 있게** 됩니다.

## 타입이란 무엇인가: "값들의 집합"

Part 2 전체에서 하나의 관점을 계속 씁니다. **타입은 값들의 집합(모임)** 이라는 관점입니다.

- `number` 타입은 `0`, `1`, `-3.5`, `1000` 같은 **모든 숫자 값을 모아 놓은 집합**입니다.
- `string` 타입은 `''`, `'아메리카노'`, `'서울 강남점'` 같은 **모든 문자열 값의 집합**입니다.
- `boolean` 타입은 `true`와 `false` **두 값만 들어 있는 집합**입니다.
- `'READY'` 같은 **리터럴 타입**(literal type, 값 하나를 그대로 타입으로 쓴 것)은 값이 딱 하나만 들어 있는 집합입니다.

이렇게 생각하면 TypeScript의 많은 규칙이 하나로 이어집니다.

| 타입 문법 | 집합으로 보면 | 배우는 곳 |
|---|---|---|
| `string`, `number` | 그 종류의 값 전부 | [01 타입 표기와 추론](./01-annotation-inference) |
| `'READY'`, `1000` | 값 하나짜리 집합 | [06 유니온과 리터럴](./06-union-literal) |
| `A \| B` (유니온) | 합집합: A나 B에 속하는 값 | [06 유니온과 리터럴](./06-union-literal) |
| `never` | 공집합: 값이 하나도 없음 | [02 특수 타입](./02-special-types) |
| `unknown` | 전체집합: 모든 값 | [02 특수 타입](./02-special-types) |
| 타입 좁히기 | 큰 집합을 조건문으로 잘라 작은 집합으로 | [08 타입 좁히기](./08-narrowing) |

"이 값을 저 변수에 넣어도 되나?"라는 질문은 "이 값이 저 집합에 들어 있나?"라는 질문과 같습니다. `let price: number = '천 원'`이 오류인 이유는 `'천 원'`이라는 값이 `number` 집합 안에 없기 때문입니다.

## 컴파일 타임 vs 런타임

TypeScript를 배울 때 가장 먼저 잡아야 할 구분이 하나 더 있습니다.

- **컴파일 타임**(compile time): `tsc`가 코드를 검사하고 JavaScript로 바꾸는 시점입니다. **타입은 이때만 존재합니다.**
- **런타임**(runtime): 바뀐 JavaScript가 브라우저나 Node.js에서 실제로 실행되는 시점입니다. 이때는 **타입이 모두 지워져** 있습니다.

```ts
// 컴파일 전 (TypeScript)
function getPrice(quantity: number, unitPrice: number): number {
  return quantity * unitPrice
}
console.log(getPrice(2, 4500))
// 출력: 9000
```

`tsc`로 바꾸면 `: number` 같은 타입 표기가 사라진 JavaScript만 남습니다.

```js
// 컴파일 후 (JavaScript)
function getPrice(quantity, unitPrice) {
  return quantity * unitPrice
}
console.log(getPrice(2, 4500))
```

그래서 타입은 **"실행 전에 실수를 찾아 주는 검사 도구"** 입니다. 실행 중에 서버에서 엉뚱한 값이 들어오는 것까지 타입이 막아 주지는 못합니다. 이 차이는 Part 2 곳곳(특히 [10 타입 단언](./10-assertion))에서 다시 나오고, [Part 4 런타임 검증](../part4-async/05-runtime-validation)에서 해결 방법을 배웁니다.

## 학습 흐름

Part 2의 10개 레슨은 다음 순서로 쌓아 올립니다.

1. **타입을 붙이는 법** — 표기와 추론 ([01](./01-annotation-inference)), 특수 타입 ([02](./02-special-types))
2. **모양 있는 값의 타입** — 배열·튜플 ([03](./03-arrays-tuples)), 객체 ([04](./04-object-types)), 함수 ([05](./05-function-types))
3. **여러 가능성을 하나로** — 유니온·리터럴 ([06](./06-union-literal)), 타입에 이름 붙이기 type·interface ([07](./07-type-alias-interface))
4. **가능성을 줄여 나가기** — 타입 좁히기 ([08](./08-narrowing))
5. **실무에서 자주 만나는 도구** — enum과 대안 ([09](./09-enum)), 타입 단언 ([10](./10-assertion))

::: tip 공부하는 방법
예제는 [TS Playground](../part0-start/04-playground)나 VS Code에 직접 붙여 넣고, **변수 위에 마우스를 올려 TypeScript가 생각하는 타입을 확인**하는 습관을 들이세요. 에러가 나는 예제는 일부러 에러를 낸 것이니, 주석에 적힌 에러 메시지와 화면의 메시지를 비교해 보면 에러 읽는 힘이 빠르게 늡니다.
:::

## 레슨 목록

<PartLessons dir="part2-types" />
