// 서버 시작점: 실제 의존성(메모리 저장소, 실제 시계)을 조립해 서버를 띄웁니다.
import { createApp } from './app'
import { createOrderService, sequentialId } from './order-service'
import { InMemoryOrderRepository, InMemoryProductRepository } from './repository'
import { SEED_PRODUCTS } from './seed'

const port = Number(process.env.PORT ?? 3000)

const service = createOrderService({
  products: new InMemoryProductRepository(SEED_PRODUCTS),
  orders: new InMemoryOrderRepository(),
  newOrderId: sequentialId('O'),
  now: () => new Date().toISOString(),
})

createApp(service).listen(port, () => {
  console.log(`주문 API 서버가 시작되었습니다: http://localhost:${port}`)
})
