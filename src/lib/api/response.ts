import { NextResponse } from "next/server"

export interface APIResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
  code?: string
}

/**
 * إرسال استجابة نجاح
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<APIResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  )
}

/**
 * إرسال استجابة خطأ
 */
export function errorResponse(
  error: string,
  status: number = 400,
  code?: string,
  message?: string
): NextResponse<APIResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      code,
      message,
    },
    { status }
  )
}

/**
 * معالجة أخطاء شاملة
 */
export function handleError(error: unknown, defaultMessage: string = "Internal Server Error"): NextResponse<APIResponse> {
  if (error instanceof Error) {
    return errorResponse(error.message, 500)
  }

  if (typeof error === "string") {
    return errorResponse(error, 500)
  }

  return errorResponse(defaultMessage, 500)
}

/**
 * استجابة 404
 */
export function notFoundResponse(message: string = "Resource not found"): NextResponse<APIResponse> {
  return errorResponse(message, 404, "NOT_FOUND")
}

/**
 * استجابة 401 Unauthorized
 */
export function unauthorizedResponse(message: string = "Unauthorized"): NextResponse<APIResponse> {
  return errorResponse(message, 401, "UNAUTHORIZED")
}

/**
 * استجابة 403 Forbidden
 */
export function forbiddenResponse(message: string = "Forbidden"): NextResponse<APIResponse> {
  return errorResponse(message, 403, "FORBIDDEN")
}

/**
 * استجابة 429 Too Many Requests
 */
export function rateLimitResponse(retryAfter: number = 900): NextResponse<APIResponse> {
  const response = errorResponse(
    "Too many requests",
    429,
    "RATE_LIMIT_EXCEEDED",
    "Please try again later"
  )
  response.headers.set("Retry-After", retryAfter.toString())
  return response
}

/**
 * استجابة 400 Bad Request
 */
export function badRequestResponse(message: string = "Bad request"): NextResponse<APIResponse> {
  return errorResponse(message, 400, "BAD_REQUEST")
}

/**
 * استجابة 422 Unprocessable Entity
 */
export function validationErrorResponse(
  message: string = "Validation failed",
  errors?: Record<string, string>
): NextResponse<APIResponse> {
  const response = NextResponse.json(
    {
      success: false,
      error: message,
      code: "VALIDATION_ERROR",
      data: errors,
    },
    { status: 422 }
  )
  return response
}
