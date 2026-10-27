// 서버를 켤 때 넣어 두는 상품 데이터입니다.
import type { Product } from './types'

export const SEED_PRODUCTS: Product[] = [
  { id: 'P001', name: '아메리카노', category: 'coffee', price: 4500, soldOut: false },
  { id: 'P002', name: '카페라테', category: 'coffee', price: 5000, soldOut: false },
  { id: 'P003', name: '바닐라라테', category: 'coffee', price: 5500, soldOut: false },
  { id: 'P004', name: '얼그레이', category: 'tea', price: 4800, soldOut: false },
  { id: 'P005', name: '캐모마일', category: 'tea', price: 4800, soldOut: false },
  { id: 'P006', name: '치즈케이크', category: 'dessert', price: 6500, soldOut: false },
  { id: 'P007', name: '크루아상', category: 'dessert', price: 3800, soldOut: true },
]
