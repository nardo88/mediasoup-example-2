import 'module-alias/register'
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { createServer } from 'http'
import { Server, Socket } from 'socket.io'
import { createRoutes } from './routes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(
  cors({
    origin: [process.env.CLIENT_PORT || '4000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  })
)

app.use(express.json())

const server = createServer(app)

const io = new Server(server, {
  cors: {
    origin: '*',
  },
  serveClient: false,
})

io.on('connection', async (socket: Socket) => {
  console.log(socket.id)
})

const routes = createRoutes(io)
app.use('/api/v1/', routes.defaultRout)

async function start() {
  try {
    server.listen(PORT, () => {
      console.log(`Server started in ${PORT} port`)
    })
  } catch (error) {
    console.log('Server Error', (error as Error).message)
    process.exit(1)
  }
}

start()
