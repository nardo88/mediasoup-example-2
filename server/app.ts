import 'module-alias/register'
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import https from 'https'
import { Server, Socket } from 'socket.io'
import { createRoutes } from './routes'
import { config } from '@helpers/config'
import * as mediasoup from 'mediasoup'
import { Worker, WorkerLogLevel, WorkerLogTag } from 'mediasoup/node/lib/types'
import { Room } from '@helpers/room'
import { Peer } from '@helpers/peer'
import fs from 'fs'

interface CustomSoket extends Socket {
  room_id: string
}

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

const options = {
  key: fs.readFileSync('./sert/key.pem', 'utf-8'),
  cert: fs.readFileSync('./sert/cert.pem', 'utf-8'),
}

const httpsServer = https.createServer(options, app)

app.use(
  cors({
    origin: [process.env.CLIENT_PORT || '4000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  })
)

app.use(express.json())

// all mediasoup workers
let workers: Worker[] = []
let nextMediasoupWorkerIdx = 0

/**
 * roomList
 * {
 *  room_id: Room {
 *      id:
 *      router:
 *      peers: {
 *          id:,
 *          name:,
 *          master: [boolean],
 *          transports: [Map],
 *          producers: [Map],
 *          consumers: [Map],
 *          rtpCapabilities:
 *      }
 *  }
 * }
 */
let roomList = new Map()

;(async () => {
  await createWorkers()
})()

async function createWorkers() {
  let { numWorkers } = config.mediasoup

  for (let i = 0; i < numWorkers; i++) {
    let worker = await mediasoup.createWorker({
      logLevel: config.mediasoup.worker.logLevel as WorkerLogLevel,
      logTags: config.mediasoup.worker.logTags as WorkerLogTag[],
      rtcMinPort: config.mediasoup.worker.rtcMinPort,
      rtcMaxPort: config.mediasoup.worker.rtcMaxPort,
    })

    worker.on('died', () => {
      console.error('mediasoup worker died, exiting in 2 seconds... [pid:%d]', worker.pid)
      setTimeout(() => process.exit(1), 2000)
    })
    workers.push(worker)

    // log worker resource usage
    /*setInterval(async () => {
            const usage = await worker.getResourceUsage();

            console.info('mediasoup Worker resource usage [pid:%d]: %o', worker.pid, usage);
        }, 120000);*/
  }
}

const io = new Server(httpsServer, {
  cors: {
    origin: '*',
  },
  serveClient: false,
})

io.on('connection', async (socket: any) => {
  socket.on('createRoom', async ({ room_id }: any, callback: any) => {
    if (roomList.has(room_id)) {
      callback('already exists')
    } else {
      console.log('Created room', { room_id: room_id })
      let worker = await getMediasoupWorker()
      roomList.set(room_id, new Room(room_id, worker, io))
      callback(room_id)
    }
  })

  socket.on('join', ({ room_id, name }: any, cb: any) => {
    console.log('User joined', {
      room_id: room_id,
      name: name,
    })

    if (!roomList.has(room_id)) {
      return cb({
        error: 'Room does not exist',
      })
    }

    roomList.get(room_id).addPeer(new Peer(socket.id, name))
    socket.room_id = room_id

    cb(roomList.get(room_id).toJson())
  })

  socket.on('getProducers', () => {
    if (!roomList.has(socket.room_id)) return
    console.log('Get producers', {
      name: `${roomList.get(socket.room_id).getPeers().get(socket.id).name}`,
    })

    // send all the current producer to newly joined member
    let producerList = roomList.get(socket.room_id).getProducerListForPeer()

    socket.emit('newProducers', producerList)
  })

  socket.on('getRouterRtpCapabilities', (_: any, callback: any) => {
    console.log('Get RouterRtpCapabilities', {
      name: `${roomList.get(socket.room_id).getPeers().get(socket.id).name}`,
    })

    try {
      callback(roomList.get(socket.room_id).getRtpCapabilities())
    } catch (e: any) {
      callback({
        error: e.message,
      })
    }
  })

  socket.on('createWebRtcTransport', async (_: any, callback: any) => {
    console.log('Create webrtc transport', {
      name: `${roomList.get(socket.room_id).getPeers().get(socket.id).name}`,
    })

    try {
      const { params } = await roomList.get(socket.room_id).createWebRtcTransport(socket.id)

      callback(params)
    } catch (err: any) {
      console.error(err)
      callback({
        error: err.message,
      })
    }
  })

  socket.on('connectTransport', async ({ transport_id, dtlsParameters }: any, callback: any) => {
    console.log('Connect transport', {
      name: `${roomList.get(socket.room_id).getPeers().get(socket.id).name}`,
    })

    if (!roomList.has(socket.room_id)) return
    await roomList.get(socket.room_id).connectPeerTransport(socket.id, transport_id, dtlsParameters)

    callback('success')
  })

  socket.on('produce', async ({ kind, rtpParameters, producerTransportId }: any, callback: any) => {
    if (!roomList.has(socket.room_id)) {
      return callback({ error: 'not is a room' })
    }

    let producer_id = await roomList.get(socket.room_id).produce(socket.id, producerTransportId, rtpParameters, kind)

    console.log('Produce', {
      type: `${kind}`,
      name: `${roomList.get(socket.room_id).getPeers().get(socket.id).name}`,
      id: `${producer_id}`,
    })

    callback({
      producer_id,
    })
  })

  socket.on('consume', async ({ consumerTransportId, producerId, rtpCapabilities }: any, callback: any) => {
    //TODO null handling
    let params = await roomList.get(socket.room_id).consume(socket.id, consumerTransportId, producerId, rtpCapabilities)

    console.log('Consuming', {
      name: `${roomList.get(socket.room_id) && roomList.get(socket.room_id).getPeers().get(socket.id).name}`,
      producer_id: `${producerId}`,
      consumer_id: `${params.id}`,
    })

    callback(params)
  })

  // socket.on('resume', async (data: any, callback: any) => {
  //   await consumer.resume()
  //   callback()
  // })

  socket.on('getMyRoomInfo', (_: any, cb: any) => {
    cb(roomList.get(socket.room_id).toJson())
  })

  socket.on('disconnect', () => {
    console.log('Disconnect', {
      name: `${roomList.get(socket.room_id) && roomList.get(socket.room_id).getPeers().get(socket.id).name}`,
    })

    if (!socket.room_id) return
    roomList.get(socket.room_id).removePeer(socket.id)
  })

  socket.on('producerClosed', ({ producer_id }: any) => {
    console.log('Producer close', {
      name: `${roomList.get(socket.room_id) && roomList.get(socket.room_id).getPeers().get(socket.id).name}`,
    })

    roomList.get(socket.room_id).closeProducer(socket.id, producer_id)
  })

  socket.on('exitRoom', async (_: any, callback: any) => {
    console.log('Exit room', {
      name: `${roomList.get(socket.room_id) && roomList.get(socket.room_id).getPeers().get(socket.id).name}`,
    })

    if (!roomList.has(socket.room_id)) {
      callback({
        error: 'not currently in a room',
      })
      return
    }
    // close transports
    await roomList.get(socket.room_id).removePeer(socket.id)
    if (roomList.get(socket.room_id).getPeers().size === 0) {
      roomList.delete(socket.room_id)
    }

    socket.room_id = null

    callback('successfully exited room')
  })
})

const routes = createRoutes(io)
app.use('/api/v1/', routes.defaultRout)

async function start() {
  try {
    httpsServer.listen(PORT, () => {
      console.log(`Server started in ${PORT} port`)
    })
  } catch (error) {
    console.log('Server Error', (error as Error).message)
    process.exit(1)
  }
}

start()

/**
 * Get next mediasoup Worker.
 */
function getMediasoupWorker() {
  const worker = workers[nextMediasoupWorkerIdx]

  if (++nextMediasoupWorkerIdx === workers.length) nextMediasoupWorkerIdx = 0

  return worker
}
