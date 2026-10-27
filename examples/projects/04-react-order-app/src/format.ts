// 화면 표시용 포맷 함수입니다.
import type { OrderStatus, ProductCategory } from './types'

// Intl.NumberFormat은 만들 때 비용이 있어서 한 번만 만들어 재사용합니다.
const wonFormatter = new Intl.NumberFormat('ko-KR')

/** 15500 → '15,500원' */
export function formatWon(amount: number): string {
  return `${wonFormatter.format(amount)}원`
}

const dateTimeFormatter = new Intl.DateTimeFormat('ko-KR', {
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

/** ISO 문자열 → '10. 26. 13:46' (내 컴퓨터 시간대 기준) */
export function formatDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso))
}

export const CATEGORY_LABEL: Record<ProductCategory, string> = {
  coffee: '커피',
  tea: '차',
  dessert: '디저트',
}

export const STATUS_LABEL: Record<OrderStatus, string> = {
  received: '접수',
  completed: '제공 완료',
  cancelled: '취소',
}
