import { createRouter } from '@acme/api/lib/create-app';
import * as HttpStatusCodes from '@acme/api/lib/http-status-codes';
import jsonContent from '@acme/api/lib/openapi/helpers/json-content';
import { createMessageObjectSchema } from '@acme/api/lib/openapi/schemas';
import { createRoute } from '@hono/zod-openapi';

const router = createRouter().openapi(
  createRoute({
    tags: ['Index'],
    method: 'get',
    path: '/',
    responses: {
      [HttpStatusCodes.OK]: jsonContent(createMessageObjectSchema('Hono APi'), 'Hono API Index'),
    },
  }),
  c => {
    return c.json(
      {
        message: 'Hono API',
      },
      HttpStatusCodes.OK,
    );
  },
);

export default router;
