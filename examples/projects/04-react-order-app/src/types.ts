// 서버(프로젝트 3) 응답과 같은 모양의 타입입니다.
// 실무에서는 서버와 패키지로 공유하거나 OpenAPI 등에서 생성하지만, 여기서는 직접 옮겨 적습니다.

export type ProductCategory = 'coffee' | 'tea' | 'dessert'

export interface Product {
  id: string
  name: string
  category: ProductCategory
  price: number
  soldOut: boolean
}

export interface OrderLine {
  productId: string
  productName: string
  unitPrice: number
  quantity: number
  lineAmount: number
}

interface OrderBase {
  id: string
  lines: OrderLine[]
  totalAmount: number
  createdAt: string
}

export type Order =
  | (OrderBase & { status: 'received' })
  | (OrderBase & { status: 'completed'; completedAt: string })
  | (OrderBase & { status: 'cancelled'; cancelledAt: string; cancelReason: string })

export type OrderStatus = Order['status']

/** 주문 생성 요청 본문 */
export interface CreateOrderRequest {
  items: { productId: string; quantity: number }[]
}

/** 서버의 공통 에러 응답 */
export interface ErrorBody {
  error: {
    code: string
    message: string
    details?: { path: string; message: string }[]
  }
}

/** 비동기 작업의 상태 (판별 유니온: status로 구분) */
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string }
