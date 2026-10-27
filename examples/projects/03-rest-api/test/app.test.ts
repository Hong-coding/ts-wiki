// HTTP 요청을 실제로 보내 API 전체를 확인하는 테스트입니다.
// supertest는 서버를 포트에 띄우지 않고도 app에 요청을 보낼 수 있게 해 줍니다.
import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app'
import type { ErrorBody } from '../src/errors'
import { createOrderService, sequentialId } from '../src/order-service'
import { InMemoryOrderRepository, InMemoryProductRepository } from '../src/repository'
import { SEED_PRODUCTS } from '../src/seed'
import type { Express } from 'express'
import type { Order } from '../src/types'

const NOW = '2026-10-26T09:00:00.000Z'

let app: Express

// 테스트마다 새 저장소로 app을 만들어, 앞 테스트의 주문이 섞이지 않게 합니다.
beforeEach(() => {
  const service = createOrderService({
    products: new InMemoryProductRepository(SEED_PRODUCTS),
    orders: new InMemoryOrderRepository(),
    newOrderId: sequentialId('O'),
    now: () => NOW,
  })
  app = createApp(service)
})

/** 아메리카노 2잔 + 치즈케이크 1개 주문을 만들고 응답 본문을 돌려줍니다. */
async function placeOrder(): Promise<Order> {
  const res = await request(app)
    .post('/api/orders')
    .send({ items: [{ productId: 'P001', quantity: 2 }, { productId: 'P006', quantity: 1 }] })
  expect(res.status).toBe(201)
  return res.body as Order
}

describe('GET /api/products', () => {
  it('상품 목록을 돌려준다', async () => {
    const res = await request(app).get('/api/products')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(7)
    expect(res.body[0]).toEqual({ id: 'P001', name: '아메리카노', category: 'coffee', price: 4500, soldOut: false })
  })
})

describe('POST /api/orders', () => {
  it('주문을 만들고 금액을 계산한다', async () => {
    const order = await placeOrder()
    expect(order).toEqual({
      id: 'O-0001',
      status: 'received',
      lines: [
        { productId: 'P001', productName: '아메리카노', unitPrice: 4500, quantity: 2, lineAmount: 9000 },
        { productId: 'P006', productName: '치즈케이크', unitPrice: 6500, quantity: 1, lineAmount: 6500 },
      ],
      totalAmount: 15500,
      createdAt: NOW,
    })
  })

  it('수량이 0이면 400과 검증 상세를 돌려준다', async () => {
    const res = await request(app).post('/api/orders').send({ items: [{ productId: 'P001', quantity: 0 }] })
    expect(res.status).toBe(400)
    const body = res.body as ErrorBody
    expect(body.error.code).toBe('VALIDATION_ERROR')
    expect(body.error.details).toEqual([{ path: 'items.0.quantity', message: '수량은 1 이상이어야 합니다.' }])
  })

  it('주문 항목이 비어 있으면 400', async () => {
    const res = await request(app).post('/api/orders').send({ items: [] })
    expect(res.status).toBe(400)
    expect((res.body as ErrorBody).error.details).toEqual([{ path: 'items', message: '주문 항목이 1개 이상 있어야 합니다.' }])
  })

  it('없는 상품이면 400', async () => {
    const res = await request(app).post('/api/orders').send({ items: [{ productId: 'P999', quantity: 1 }] })
    expect(res.status).toBe(400)
    expect((res.body as ErrorBody).error.details).toEqual([{ path: 'items.0.productId', message: '없는 상품입니다: P999' }])
  })

  it('품절 상품이면 409 SOLD_OUT', async () => {
    const res = await request(app).post('/api/orders').send({ items: [{ productId: 'P007', quantity: 1 }] })
    expect(res.status).toBe(409)
    expect((res.body as ErrorBody).error).toEqual({ code: 'SOLD_OUT', message: '품절된 상품입니다: 크루아상' })
  })

  it('JSON 문법이 틀리면 400', async () => {
    const res = await request(app).post('/api/orders').set('Content-Type', 'application/json').send('{"items": [')
    expect(res.status).toBe(400)
    expect((res.body as ErrorBody).error.code).toBe('VALIDATION_ERROR')
  })
})

describe('주문 조회', () => {
  it('목록과 한 건 조회', async () => {
    const order = await placeOrder()
    const list = await request(app).get('/api/orders')
    expect(list.body).toEqual([order])

    const one = await request(app).get(`/api/orders/${order.id}`)
    expect(one.status).toBe(200)
    expect(one.body).toEqual(order)
  })

  it('없는 주문이면 404', async () => {
    const res = await request(app).get('/api/orders/O-9999')
    expect(res.status).toBe(404)
    expect((res.body as ErrorBody).error).toEqual({ code: 'NOT_FOUND', message: '주문을 찾을 수 없습니다: O-9999' })
  })
})

describe('주문 상태 전이', () => {
  it('접수된 주문을 취소한다', async () => {
    const order = await placeOrder()
    const res = await request(app).post(`/api/orders/${order.id}/cancel`).send({ reason: '  고객 요청  ' })
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ status: 'cancelled', cancelReason: '고객 요청', cancelledAt: NOW })
  })

  it('취소 사유가 없으면 400', async () => {
    const order = await placeOrder()
    const res = await request(app).post(`/api/orders/${order.id}/cancel`).send({})
    expect(res.status).toBe(400)
  })

  it('제공 완료된 주문은 취소할 수 없다 (409)', async () => {
    const order = await placeOrder()
    await request(app).post(`/api/orders/${order.id}/complete`).expect(200)
    const res = await request(app).post(`/api/orders/${order.id}/cancel`).send({ reason: '단순 변심' })
    expect(res.status).toBe(409)
    expect((res.body as ErrorBody).error).toEqual({
      code: 'INVALID_STATE',
      message: '제공 완료 상태의 주문은 취소할 수 없습니다.',
    })
  })
})

it('없는 경로는 404', async () => {
  const res = await request(app).get('/api/unknown')
  expect(res.status).toBe(404)
  expect((res.body as ErrorBody).error.code).toBe('NOT_FOUND')
})
