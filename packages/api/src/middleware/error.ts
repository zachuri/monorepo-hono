import { ApiError } from '@repo/api/utils/ApiError'
import { generateZodErrorMessage } from '@repo/api/utils/zod'
import type { ErrorHandler } from 'hono'
import type { ContentfulStatusCode, StatusCode } from 'hono/utils/http-status'
import httpStatus from 'http-status'
import type { Toucan } from 'toucan-js'
import { ZodError } from 'zod'
import { INTERNAL_SERVER_ERROR, OK } from '../lib/http-status-codes'

const genericJSONErrMsg = 'Unexpected end of JSON input'

export const errorConverter = (err: unknown, sentry: Toucan): ApiError => {
  let error = err

  if (error instanceof ZodError) {
    const errorMessage = generateZodErrorMessage(error)
    error = new ApiError(httpStatus.BAD_REQUEST, errorMessage)
  } else if (error instanceof SyntaxError && error.message.includes(genericJSONErrMsg)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid JSON payload')
  } else if (!(error instanceof ApiError)) {
    const castedErr = (typeof error === 'object' ? error : {}) as Record<string, unknown>
    const statusCode: number =
      typeof castedErr.statusCode === 'number'
        ? castedErr.statusCode
        : httpStatus.INTERNAL_SERVER_ERROR

    const message = (castedErr.description ||
      castedErr.message ||
      httpStatus[`${statusCode}` as keyof typeof httpStatus]) as string

    if (statusCode >= 500) {
      // Log any unhandled application error
      sentry.captureException(error)
    }

    error = new ApiError(statusCode, message, false)
  }
  return error as ApiError
}

const onError: ErrorHandler = (err, c) => {
  const currentStatus = 'status' in err ? err.status : c.newResponse(null).status
  const statusCode = currentStatus !== OK ? (currentStatus as StatusCode) : INTERNAL_SERVER_ERROR
  // eslint-disable-next-line node/prefer-global/process
  const env = c.env?.NODE_ENV || process.env?.NODE_ENV
  return c.json(
    {
      message: err.message,

      stack: env === 'production' ? undefined : (err.stack as string | undefined),
    },
    statusCode as ContentfulStatusCode,
  )
}

export default onError