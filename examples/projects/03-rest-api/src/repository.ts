// 저장소(repository): 데이터를 어디에 두는지 숨기는 층입니다.
// 서비스는 인터페이스만 알기 때문에, 나중에 DB 구현으로 바꿔도 서비스 코드는 그대로입니다.
import type { Order, Product } from './types'

export interface ProductRepository {
  findAll(): Promise<Product[]>
  findById(id: string): Promise<Product | undefined>
}

export interface OrderRepository {
  findAll(): Promise<Order[]>
  findById(id: string): Promise<Order | undefined>
  /** 같은 id가 있으면 덮어씁니다. */
  save(order: Order): Promise<void>
}

/** 메모리(Map)에 상품을 두는 구현. 서버를 끄면 사라집니다. */
export class InMemoryProductRepository implements ProductRepository {
  private readonly products = new Map<string, Product>()

  constructor(products: Product[]) {
    for (const product of products) {
      this.products.set(product.id, product)
    }
  }

  async findAll(): Promise<Product[]> {
    return [...this.products.values()]
  }

  async findById(id: string): Promise<Product | undefined> {
    return this.products.get(id)
  }
}

export class InMemoryOrderRepository implements OrderRepository {
  private readonly orders = new Map<string, Order>()

  async findAll(): Promise<Order[]> {
    // 최근 주문이 위로 오도록 만든 시각의 역순으로 돌려줍니다.
    return [...this.orders.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id))
  }

  async findById(id: string): Promise<Order | undefined> {
    return this.orders.get(id)
  }

  async save(order: Order): Promise<void> {
    this.orders.set(order.id, order)
  }
}
