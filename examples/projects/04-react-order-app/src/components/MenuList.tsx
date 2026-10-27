// 메뉴(상품) 목록. 서버에서 불러와 로딩/에러/성공 상태별로 다르게 그립니다.
import { fetchProducts } from '../api'
import { useCartStore } from '../cart-store'
import { CATEGORY_LABEL, formatWon } from '../format'
import type { Product } from '../types'
import { useAsync } from '../use-async'

export function MenuList() {
  const { state, reload } = useAsync(fetchProducts)

  switch (state.status) {
    case 'idle':
    case 'loading':
      return <p className="info">메뉴를 불러오는 중입니다...</p>
    case 'error':
      return (
        <div className="error-box">
          <p>{state.message}</p>
          <button type="button" onClick={reload}>
            다시 시도
          </button>
        </div>
      )
    case 'success':
      return (
        <ul className="menu-list">
          {state.data.map((product) => (
            <MenuItem key={product.id} product={product} />
          ))}
        </ul>
      )
  }
}

function MenuItem({ product }: { product: Product }) {
  // 스토어 전체가 아니라 필요한 함수만 골라 구독합니다(불필요한 다시 그리기 방지).
  const add = useCartStore((state) => state.add)

  return (
    <li className="menu-item">
      <span className="category">{CATEGORY_LABEL[product.category]}</span>
      <strong>{product.name}</strong>
      <span>{formatWon(product.price)}</span>
      <button type="button" disabled={product.soldOut} onClick={() => add(product)}>
        {product.soldOut ? '품절' : '담기'}
      </button>
    </li>
  )
}
