// API 호출 모음입니다. fetch의 번거로운 부분(JSON 변환, 에러 응답 처리)을 request 하나에 모읍니다.
import type { CreateOrderRequest, ErrorBody, Order, Product } from './types'

/** API 호출 실패. 화면은 message만 보여 주면 됩니다. */
export class ApiError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

const NETWORK_MESSAGE = '서버에 연결할 수 없습니다. API 서버가 켜져 있는지 확인해 주세요.'

function isErrorBody(value: unknown): value is ErrorBody {
  if (typeof value !== 'object' || value === null || !('error' in value)) return false
  const error = value.error
  return typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string'
}

/**
 * 공통 요청 함수. 성공하면 T로 본 응답 본문을, 실패하면 ApiError를 던집니다.
 * T는 "서버가 이 모양으로 준다"는 약속일 뿐 실행 중에 검사하지는 않습니다.
 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    // 이 앱의 요청 본문은 모두 JSON이므로 Content-Type을 기본으로 붙입니다.
    response = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...init })
  } catch {
    // 네트워크가 끊긴 경우 fetch 자체가 실패합니다.
    throw new ApiError(0, 'NETWORK_ERROR', NETWORK_MESSAGE)
  }

  // 본문이 JSON이 아닐 수도 있으므로(프록시 오류 페이지 등) 실패해도 멈추지 않게 합니다.
  const body: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    if (isErrorBody(body)) {
      throw new ApiError(response.status, body.error.code, body.error.message)
    }
    // API 서버가 꺼져 있으면 Vite 프록시가 502 같은 게이트웨이 오류로 답합니다.
    if (response.status >= 502 && response.status <= 504) {
      throw new ApiError(response.status, 'NETWORK_ERROR', NETWORK_MESSAGE)
    }
    throw new ApiError(response.status, 'UNKNOWN', `요청에 실패했습니다. (HTTP ${response.status})`)
  }
  // 프록시 설정이 빠지면 Vite가 /api 요청에도 index.html(200)을 돌려줍니다. JSON이 아니면 여기서 막습니다.
  if (body === null) {
    throw new ApiError(response.status, 'INVALID_RESPONSE', '서버 응답이 JSON이 아닙니다. API 주소와 프록시 설정을 확인해 주세요.')
  }
  return body as T
}

export function fetchProducts(): Promise<Product[]> {
  return request<Product[]>('/api/products')
}

export function createOrder(body: CreateOrderRequest): Promise<Order> {
  return request<Order>('/api/orders', { method: 'POST', body: JSON.stringify(body) })
}

export function fetchOrders(): Promise<Order[]> {
  return request<Order[]>('/api/orders')
}

export function cancelOrder(id: string, reason: string): Promise<Order> {
  return request<Order>(`/api/orders/${encodeURIComponent(id)}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  })
}

/** catch로 받은 unknown 에러를 화면에 보여 줄 문장으로 바꿉니다. */
export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return '알 수 없는 오류가 발생했습니다.'
}
