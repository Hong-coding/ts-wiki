// 장바구니 상태(zustand 스토어)입니다. 여러 컴포넌트가 같은 장바구니를 봅니다.
import { create } from 'zustand'
import type { Product } from './types'

export interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
}

export const MAX_QUANTITY = 99

interface CartState {
  items: CartItem[]
  /** 상품을 1개 담습니다. 이미 있으면 수량을 1 늘립니다. */
  add: (product: Product) => void
  /** 수량을 바꿉니다. 0 이하가 되면 장바구니에서 뺍니다. */
  changeQuantity: (productId: string, quantity: number) => void
  remove: (productId: string) => void
  clear: () => void
}

export const useCartStore = create<CartState>()((set) => ({
  items: [],

  add: (product) =>
    set((state) => {
      const found = state.items.find((item) => item.productId === product.id)
      if (found === undefined) {
        const item: CartItem = { productId: product.id, name: product.name, price: product.price, quantity: 1 }
        return { items: [...state.items, item] }
      }
      return {
        items: state.items.map((item) =>
          item.productId === product.id ? { ...item, quantity: Math.min(item.quantity + 1, MAX_QUANTITY) } : item,
        ),
      }
    }),

  changeQuantity: (productId, quantity) =>
    set((state) => ({
      items:
        quantity <= 0
          ? state.items.filter((item) => item.productId !== productId)
          : state.items.map((item) =>
              item.productId === productId ? { ...item, quantity: Math.min(quantity, MAX_QUANTITY) } : item,
            ),
    })),

  remove: (productId) => set((state) => ({ items: state.items.filter((item) => item.productId !== productId) })),

  clear: () => set({ items: [] }),
}))

/** 장바구니 합계 금액. 상태에 저장하지 않고 items에서 계산합니다. */
export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

/** 장바구니에 담긴 상품 개수(수량 합) */
export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}
