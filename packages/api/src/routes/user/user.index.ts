import { createRouter } from '@repo/api/lib/create-app'
import * as handlers from './user.handler'
import * as routes from './user.route'

const router = createRouter()
  .openapi(routes.getUser, handlers.getUser)
  .openapi(routes.getUserSession, handlers.getUserSession)

export default router