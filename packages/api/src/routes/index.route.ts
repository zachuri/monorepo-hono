import { createRoute } from '@hono/zod-openapi'
import { createRouter } from '~/lib/create-app'
import * as HttpStatusCodes from '~/lib/http-status-codes'
import jsonContent from '~/lib/openapi/helpers/json-content'
import { createMessageObjectSchema } from '~/lib/openapi/schemas'

const router = createRouter().openapi(
  createRoute({
    tags: ['Index'],
    method: 'get',
    path: '/',
    responses: {
      [HttpStatusCodes.OK]: jsonContent(createMessageObjectSchema('Tasks API'), 'Tasks API Index'),
    },
  }),
  (c) => {
    return c.json(
      {
        message: 'Tasks API',
      },
      HttpStatusCodes.OK,
    )
  },
)

export default router 
