import { Hono } from 'hono'

import type { AppContext } from '~/types/app-context'

export const helloRouter = new Hono<AppContext>().get('/', (c) => {
  return c.json({ message: 'hello' })
})
