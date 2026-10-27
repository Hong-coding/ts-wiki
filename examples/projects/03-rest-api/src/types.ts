// 주문 API의 도메인 타입을 한곳에 모읍니다.

export type ProductCategory = 'coffee' | 'tea' | 'dessert'

/** 매장에서 파는 상품 */
export interface Product {
  id: string
  name: string
  category: ProductCategory
  /** 판매가(원) */
  price: number
  soldOut: boolean
}

/** 주문 한 줄. 주문 시점의 상품명·가격을 복사해 둡니다(나중에 가격이 바뀌어도 주문 금액은 그대로). */
export interface OrderLine {
  productId: string
  productName: string
  unitPrice: number
  quantity: number
  lineAmount: number
}

/** 모든 주문 상태에 공통인 속성 */
interface OrderBase {
  id: string
  lines: OrderLine[]
  totalAmount: number
  createdAt: string
}

/**
 * 주문 (판별 유니온: status로 구분)
 * 상태마다 필요한 속성이 다릅니다. 예를 들어 cancelReason은 취소된 주문에만 있습니다.
 */
export type Order =
  | (OrderBase & { status: 'received' })
  | (OrderBase & { status: 'completed'; completedAt: string })
  | (OrderBase & { status: 'cancelled'; cancelledAt: string; cancelReason: string })

export type OrderStatus = Order['status']
