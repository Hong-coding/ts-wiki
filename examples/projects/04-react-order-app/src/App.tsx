// 화면 전체 배치: 메뉴 | 장바구니, 그 아래 주문 내역
import { useState } from 'react'
import { Cart } from './components/Cart'
import { MenuList } from './components/MenuList'
import { OrderHistory } from './components/OrderHistory'

export function App() {
  // 주문할 때마다 숫자를 올려 OrderHistory를 새로 만들게(key 변경) 해서 목록을 다시 불러옵니다.
  const [historyKey, setHistoryKey] = useState(0)

  return (
    <main className="app">
      <h1>카페 주문</h1>
      <div className="columns">
        <section>
          <h2>메뉴</h2>
          <MenuList />
        </section>
        <Cart onOrdered={() => setHistoryKey((key) => key + 1)} />
      </div>
      <OrderHistory key={historyKey} />
    </main>
  )
}
