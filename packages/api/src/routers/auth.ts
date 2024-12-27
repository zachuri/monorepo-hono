import { Hono } from 'hono'
import type { AppContext } from '../utils/context'

export const authRouter = new Hono<AppContext>()
  // Better Auth route configuration
  .on(['POST', 'GET'], '/**', (c) => {
    const auth = c.get('auth')
    return auth.handler(c.req.raw)
  })
