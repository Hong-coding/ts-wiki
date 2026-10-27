// 주문 업무 처리(서비스)입니다. HTTP(요청·응답)는 모르고, 저장소와 상태 전이 규칙만 씁니다.
import { AppError } from './errors'
import { cancelOrder, completeOrder, newOrder } from './order'
import type { OrderRepository, ProductRepository } from './repository'
import type { CancelOrderInput, CreateOrderInput } from './schemas'
import type { Order, OrderLine, Product } from './types'

/** 서비스가 바깥에서 받아 쓰는 것들. 테스트에서는 시계와 id를 고정값으로 바꿔 끼웁니다. */
export interface ServiceDeps {
  products: ProductRepository
  orders: OrderRepository
  newOrderId: () => string
  now: () => string
}

/** 'O-0001', 'O-0002'처럼 차례로 id를 만드는 함수를 돌려줍니다. */
export function sequentialId(prefix: string): () => string {
  let next = 1
  return () => `${prefix}-${String(next++).padStart(4, '0')}`
}

export function createOrderService(deps: ServiceDeps) {
  async function findOrder(id: string): Promise<Order> {
    const order = await deps.orders.findById(id)
    if (order === undefined) {
      throw new AppError('NOT_FOUND', `주문을 찾을 수 없습니다: ${id}`)
    }
    return order
  }

  return {
    listProducts(): Promise<Product[]> {
      return deps.products.findAll()
    },

    async createOrder(input: CreateOrderInput): Promise<Order> {
      const lines: OrderLine[] = []
      for (const [index, item] of input.items.entries()) {
        const product = await deps.products.findById(item.productId)
        if (product === undefined) {
          throw new AppError('VALIDATION_ERROR', '요청 값이 올바르지 않습니다.', [
            { path: `items.${index}.productId`, message: `없는 상품입니다: ${item.productId}` },
          ])
        }
        if (product.soldOut) {
          throw new AppError('SOLD_OUT', `품절된 상품입니다: ${product.name}`)
        }
        lines.push({
          productId: product.id,
          productName: product.name,
          unitPrice: product.price,
          quantity: item.quantity,
          lineAmount: product.price * item.quantity,
        })
      }
      const order = newOrder(deps.newOrderId(), lines, deps.now())
      await deps.orders.save(order)
      return order
    },

    listOrders(): Promise<Order[]> {
      return deps.orders.findAll()
    },

    getOrder(id: string): Promise<Order> {
      return findOrder(id)
    },

    async cancelOrder(id: string, input: CancelOrderInput): Promise<Order> {
      const cancelled = cancelOrder(await findOrder(id), input.reason, deps.now())
      await deps.orders.save(cancelled)
      return cancelled
    },

    async completeOrder(id: string): Promise<Order> {
      const completed = completeOrder(await findOrder(id), deps.now())
      await deps.orders.save(completed)
      return completed
    },
  }
}

/** 반환 타입을 직접 쓰지 않고 함수에서 뽑아냅니다. */
export type OrderService = ReturnType<typeof createOrderService>
