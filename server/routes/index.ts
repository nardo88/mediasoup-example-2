import { Server } from 'socket.io'
import { createDefaultRouter } from './default'

export const createRoutes = (io: Server) => {
  const defaultRout = createDefaultRouter(io)
  return {
    defaultRout,
  }
}
