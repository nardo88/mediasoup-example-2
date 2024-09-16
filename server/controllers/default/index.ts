import { Request, Response } from 'express'
import { Server } from 'socket.io'

export class DefaultController {
  io: Server

  constructor(io: Server) {
    this.io = io
  }

  default = async (_req: Request, res: Response) => {
    try {
      return res.json('Works')
    } catch (e: any) {
      return res.status(500).json({ message: e.message || e })
    }
  }
}
