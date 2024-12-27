import { Hono } from 'hono';

import type { AppContext } from '@repo/api/utils/context';

export const helloRouter = new Hono<AppContext>()
  .get('/', (c) => c.json('hello from hono'))
  .post('/', (c) => c.json('create an author', 201))
  .get('/:id', (c) => c.json(`get ${c.req.param('id')}`));
