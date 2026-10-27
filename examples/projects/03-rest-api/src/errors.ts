// 공통 에러 형식입니다. 어떤 에러든 클라이언트는 같은 모양의 JSON을 받습니다.

export type ErrorCode = 'VALIDATION_ERROR' | 'NOT_FOUND' | 'INVALID_STATE' | 'SOLD_OUT' | 'INTERNAL_ERROR'

/** 에러 코드별 HTTP 상태 코드. Record라서 코드를 추가하고 여기를 빠뜨리면 컴파일 에러가 납니다. */
const HTTP_STATUS: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 400,
  NOT_FOUND: 404,
  INVALID_STATE: 409,
  SOLD_OUT: 409,
  INTERNAL_ERROR: 500,
}

/** 요청 검증에서 걸린 항목 하나 */
export interface ValidationIssue {
  /** 문제가 있는 위치. 예: 'items.0.quantity' */
  path: string
  message: string
}

/** 에러 응답 본문 */
export interface ErrorBody {
  error: {
    code: ErrorCode
    message: string
    details?: ValidationIssue[]
  }
}

/** 업무 규칙 위반을 나타내는 에러. 에러 처리 미들웨어가 ErrorBody로 바꿔 응답합니다. */
export class AppError extends Error {
  readonly code: ErrorCode
  readonly details: ValidationIssue[] | undefined

  constructor(code: ErrorCode, message: string, details?: ValidationIssue[]) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.details = details
  }

  get status(): number {
    return HTTP_STATUS[this.code]
  }

  toBody(): ErrorBody {
    const body: ErrorBody = { error: { code: this.code, message: this.message } }
    if (this.details !== undefined) {
      body.error.details = this.details
    }
    return body
  }
}
