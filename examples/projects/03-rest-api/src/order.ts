// 주문 상태 전이 규칙입니다. 저장소·HTTP를 모르는 순수 함수만 둡니다.
//   received(접수) ──▶ completed(제공 완료)
//        └──────────▶ cancelled(취소)
import { AppError } from './errors'
import type { Order, OrderLine, OrderStatus } from './types'

export const STATUS_LABEL: Record<OrderStatus, string> = {
  received: '접수',
  completed: '제공 완료',
  cancelled: '취소',
}

/** 주문 줄 목록으로 새 주문(접수 상태)을 만듭니다. */
export function newOrder(id: string, lines: OrderLine[], now: string): Order {
  const totalAmount = lines.reduce((sum, line) => sum + line.lineAmount, 0)
  return { id, status: 'received', lines, totalAmount, createdAt: now }
}

/** 접수 상태의 주문만 제공 완료로 바꿀 수 있습니다. */
export function completeOrder(order: Order, now: string): Order {
  if (order.status !== 'received') {
    throw new AppError('INVALID_STATE', `${STATUS_LABEL[order.status]} 상태의 주문은 완료할 수 없습니다.`)
  }
  // 여기서 order는 received 상태로 좁혀져 있습니다.
  return { ...order, status: 'completed', completedAt: now }
}

/** 접수 상태의 주문만 취소할 수 있습니다. */
export function cancelOrder(order: Order, reason: string, now: string): Order {
  if (order.status !== 'received') {
    throw new AppError('INVALID_STATE', `${STATUS_LABEL[order.status]} 상태의 주문은 취소할 수 없습니다.`)
  }
  return { ...order, status: 'cancelled', cancelledAt: now, cancelReason: reason }
}
