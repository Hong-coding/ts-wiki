// 요청 본문 검증 스키마입니다. 타입은 스키마에서 뽑아 써서 둘이 어긋나지 않게 합니다.
import { z } from 'zod'
import { AppError } from './errors'

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1, '상품 id가 필요합니다.'),
        quantity: z.number().int('수량은 정수여야 합니다.').min(1, '수량은 1 이상이어야 합니다.').max(99, '수량은 99 이하여야 합니다.'),
      }),
    )
    .min(1, '주문 항목이 1개 이상 있어야 합니다.')
    .max(20, '주문 항목은 20개까지입니다.'),
})

export const cancelOrderSchema = z.object({
  reason: z.string().trim().min(1, '취소 사유를 입력해 주세요.').max(100, '취소 사유는 100자 이하입니다.'),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>

/** 스키마로 검사하고, 실패하면 VALIDATION_ERROR를 던집니다. 성공하면 타입이 붙은 값을 돌려줍니다. */
export function parseBody<T>(schema: z.ZodType<T>, body: unknown): T {
  const result = schema.safeParse(body)
  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }))
    throw new AppError('VALIDATION_ERROR', '요청 값이 올바르지 않습니다.', details)
  }
  return result.data
}
