// 장바구니와 주문하기 버튼입니다.
import { useState } from 'react'
import { createOrder, errorMessage } from '../api'
import { cartCount, cartTotal, MAX_QUANTITY, useCartStore } from '../cart-store'
import { formatWon } from '../format'
import type { Order } from '../types'

/** 주문 버튼을 누른 뒤의 상태 */
type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'done'; order: Order }
  | { status: 'error'; message: string }

export function Cart({ onOrdered }: { onOrdered: (order: Order) => void }) {
  const items = useCartStore((state) => state.items)
  const changeQuantity = useCartStore((state) => state.changeQuantity)
  const remove = useCartStore((state) => state.remove)
  const clear = useCartStore((state) => state.clear)
  const [submit, setSubmit] = useState<SubmitState>({ status: 'idle' })

  async function handleOrder() {
    setSubmit({ status: 'submitting' })
    try {
      const order = await createOrder({
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      })
      clear()
      setSubmit({ status: 'done', order })
      onOrdered(order)
    } catch (error) {
      setSubmit({ status: 'error', message: errorMessage(error) })
    }
  }

  return (
    <section className="cart">
      <h2>장바구니 ({cartCount(items)}개)</h2>

      {items.length === 0 ? (
        <p className="info">메뉴에서 담기를 눌러 주세요.</p>
      ) : (
        <ul className="cart-list">
          {items.map((item) => (
            <li key={item.productId}>
              <span className="name">{item.name}</span>
              <button type="button" aria-label={`${item.name} 하나 빼기`} onClick={() => changeQuantity(item.productId, item.quantity - 1)}>
                −
              </button>
              <span className="quantity">{item.quantity}</span>
              <button
                type="button"
                aria-label={`${item.name} 하나 더`}
                disabled={item.quantity >= MAX_QUANTITY}
                onClick={() => changeQuantity(item.productId, item.quantity + 1)}
              >
                +
              </button>
              <span className="amount">{formatWon(item.price * item.quantity)}</span>
              <button type="button" onClick={() => remove(item.productId)}>
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="total">합계 {formatWon(cartTotal(items))}</p>
      <button
        type="button"
        className="primary"
        disabled={items.length === 0 || submit.status === 'submitting'}
        onClick={handleOrder}
      >
        {submit.status === 'submitting' ? '주문 중...' : '주문하기'}
      </button>

      {submit.status === 'done' && (
        <p className="success">
          주문 {submit.order.id} 접수 완료 ({formatWon(submit.order.totalAmount)})
        </p>
      )}
      {submit.status === 'error' && <p className="error">{submit.message}</p>}
    </section>
  )
}
