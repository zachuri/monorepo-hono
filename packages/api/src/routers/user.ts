import { Hono } from 'hono'

import type { AppContext } from '@repo/api/utils/context'

export const userRouter = new Hono<AppContext>()
  .get('/', (c) => {
    const user = c.get('user')
    return c.json(user)
  })
  .get('/session', async (c) => {
    const session = c.get('session')
    const user = c.get('user')

    if (!user || !session) return c.body(null, 401)

    return c.json({
      session,
      user,
    })
  })
