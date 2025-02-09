import { createRoute } from '@hono/zod-openapi'
import { getSessionSchema, getUserSchema } from '@repo/api/db/schemas'
import { notFoundSchema } from '@repo/api/lib/constants'
import jsonContent from '@repo/api/lib/openapi/helpers/json-content'
import * as HttpStatusCodes from '~/lib/http-status-codes'

const tags = ['User']

export const getUser = createRoute({
  path: '/user',
  method: 'get',
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(getUserSchema, 'The requested user'),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, 'User not found'),
  },
})

export const getUserSession = createRoute({
  path: '/user/session',
  method: 'get',
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(getSessionSchema, 'The requested session'),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, 'Session not found'),
  },
})

export type GetUserRoute = typeof getUser
export type GetUserSessionRoute = typeof getUserSession
