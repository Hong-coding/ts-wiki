// DOM 요소를 타입 안전하게 찾는 도우미입니다.

/**
 * 선택자로 요소를 찾고, 기대한 종류(HTMLInputElement 등)인지 확인합니다.
 * 없거나 종류가 다르면 바로 에러를 던져 "어디가 틀렸는지" 알려 줍니다.
 */
export function getElement<T extends HTMLElement>(selector: string, type: new () => T): T {
  const element = document.querySelector(selector)
  if (!(element instanceof type)) {
    throw new Error(`요소를 찾을 수 없거나 종류가 다릅니다: ${selector}`)
  }
  return element
}
