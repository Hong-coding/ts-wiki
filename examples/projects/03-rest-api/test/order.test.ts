// 상태 전이 규칙(순수 함수) 단위 테스트입니다. HTTP 없이 함수만 부릅니다.
import { describe, expect, it } from 'vitest'
import { AppError } from '../src/errors'
import { cancelOrder, completeOrder, newOrder } from '../src/order'

const line = { productId: 'P002', productName: '카페라테', unitPrice: 5000, quantity: 3, lineAmount: 15000 }

describe('order 상태 전이', () => {
  it('새 주문은 접수 상태이고 합계를 계산한다', () => {
    const order = newOrder('O-0001', [line, { ...line, quantity: 1, lineAmount: 5000 }], 'T1')
    expect(order.status).toBe('received')
    expect(order.totalAmount).toBe(20000)
  })

  it('접수 → 완료', () => {
    const done = completeOrder(newOrder('O-0001', [line], 'T1'), 'T2')
    expect(done).toMatchObject({ status: 'completed', completedAt: 'T2' })
  })

  it('취소된 주문은 완료할 수 없다', () => {
    const cancelled = cancelOrder(newOrder('O-0001', [line], 'T1'), '재고 없음', 'T2')
    expect(() => completeOrder(cancelled, 'T3')).toThrow(AppError)
    expect(() => completeOrder(cancelled, 'T3')).toThrow('취소 상태의 주문은 완료할 수 없습니다.')
  })
})
