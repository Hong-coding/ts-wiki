// HTTP 층: 경로(route)를 정의하고, 요청 → 검증 → 서비스 호출 → 응답을 연결합니다.
import express, { type ErrorRequestHandler, type Express } from 'express'
import { AppError } from './errors'
import type { OrderService } from './order-service'
import { cancelOrderSchema, createOrderSchema, parseBody } from './schemas'

export function createApp(service: OrderService): Express {
  const app = express()
  // 요청 본문의 JSON을 req.body로 읽어 줍니다.
  app.use(express.json())

  // 상품 목록
  app.get('/api/products', async (_req, res) => {
    res.json(await service.listProducts())
  })

  // 주문 생성
  app.post('/api/orders', async (req, res) => {
    // req.body는 any입니다. 검사를 통과한 input부터 타입을 믿을 수 있습니다.
    const input = parseBody(createOrderSchema, req.body)
    const order = await service.createOrder(input)
    res.status(201).json(order)
  })

  // 주문 목록
  app.get('/api/orders', async (_req, res) => {
    res.json(await service.listOrders())
  })

  // 주문 한 건 조회
  app.get('/api/orders/:id', async (req, res) => {
    res.json(await service.getOrder(req.params.id))
  })

  // 주문 취소
  app.post('/api/orders/:id/cancel', async (req, res) => {
    const input = parseBody(cancelOrderSchema, req.body)
    res.json(await service.cancelOrder(req.params.id, input))
  })

  // 제공 완료
  app.post('/api/orders/:id/complete', async (req, res) => {
    res.json(await service.completeOrder(req.params.id))
  })

  // 위의 어떤 경로에도 맞지 않는 요청
  app.use((req, res) => {
    const error = new AppError('NOT_FOUND', `없는 경로입니다: ${req.method} ${req.path}`)
    res.status(error.status).json(error.toBody())
  })

  app.use(errorHandler)
  return app
}

/**
 * 공통 에러 처리. Express 5는 async 핸들러에서 던진 에러도 여기로 보내 줍니다.
 * 매개변수가 4개여야 Express가 에러 처리 미들웨어로 인식합니다.
 */
const errorHandler: ErrorRequestHandler = (err: unknown, _req, res, _next) => {
  let error: AppError
  if (err instanceof AppError) {
    error = err
  } else if (err instanceof SyntaxError && 'status' in err && err.status === 400) {
    // express.json()이 JSON 문법 오류를 만났을 때
    error = new AppError('VALIDATION_ERROR', '요청 본문이 올바른 JSON이 아닙니다.')
  } else {
    // 예상하지 못한 에러: 자세한 내용은 서버 로그에만 남기고, 클라이언트에는 숨깁니다.
    console.error(err)
    error = new AppError('INTERNAL_ERROR', '서버 오류가 발생했습니다.')
  }
  res.status(error.status).json(error.toBody())
}
