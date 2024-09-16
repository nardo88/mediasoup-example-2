import { DefaultController } from '@controllers/default'
import { Router } from 'express'
import { Server } from 'socket.io'

export const createDefaultRouter = (io: Server) => {
  const router = Router()
  const controller = new DefaultController(io)

  router.get('/', controller.default)
  return router
}
