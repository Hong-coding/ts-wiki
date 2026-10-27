// 주문 내역. 접수 상태의 주문은 취소할 수 있습니다.
import { useState } from 'react'
import { cancelOrder, errorMessage, fetchOrders } from '../api'
import { formatDateTime, formatWon, STATUS_LABEL } from '../format'
import type { Order } from '../types'
import { useAsync } from '../use-async'

export function OrderHistory() {
  const { state, reload } = useAsync(fetchOrders)
  const [cancelError, setCancelError] = useState('')

  async function handleCancel(order: Order) {
    // prompt는 취소 버튼을 누르면 null을 돌려줍니다.
    const reason = window.prompt(`${order.id} 주문을 취소합니다. 사유를 입력해 주세요.`, '고객 요청')
    if (reason === null) return
    try {
      await cancelOrder(order.id, reason)
      setCancelError('')
      reload()
    } catch (error) {
      setCancelError(errorMessage(error))
    }
  }

  let content
  switch (state.status) {
    case 'idle':
    case 'loading':
      content = <p className="info">주문 내역을 불러오는 중입니다...</p>
      break
    case 'error':
      content = <p className="error">{state.message}</p>
      break
    case 'success':
      content =
        state.data.length === 0 ? (
          <p className="info">아직 주문이 없습니다.</p>
        ) : (
          <ul className="order-list">
            {state.data.map((order) => (
              <OrderRow key={order.id} order={order} onCancel={handleCancel} />
            ))}
          </ul>
        )
      break
  }

  return (
    <section className="orders">
      <h2>
        주문 내역{' '}
        <button type="button" onClick={reload}>
          새로 고침
        </button>
      </h2>
      {cancelError !== '' && <p className="error">{cancelError}</p>}
      {content}
    </section>
  )
}

function OrderRow({ order, onCancel }: { order: Order; onCancel: (order: Order) => void }) {
  const summary = order.lines.map((line) => `${line.productName} ${line.quantity}개`).join(', ')
  return (
    <li className={`order status-${order.status}`}>
      <div>
        <strong>{order.id}</strong> <span className="badge">{STATUS_LABEL[order.status]}</span>{' '}
        <span className="time">{formatDateTime(order.createdAt)}</span>
      </div>
      <div>
        {summary} · {formatWon(order.totalAmount)}
      </div>
      {/* 판별 유니온 덕분에 cancelReason은 취소된 주문에서만 꺼낼 수 있습니다. */}
      {order.status === 'cancelled' && <div className="reason">취소 사유: {order.cancelReason}</div>}
      {order.status === 'received' && (
        <button type="button" onClick={() => onCancel(order)}>
          주문 취소
        </button>
      )}
    </li>
  )
}
