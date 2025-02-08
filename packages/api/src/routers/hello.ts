import { Hono } from 'hono'

import type { AppContext } from '@repo/api/utils/context'

export const helloRouter = new Hono<AppContext>().get('/', (c) => {
  return c.json({ message: 'hello' })
})
