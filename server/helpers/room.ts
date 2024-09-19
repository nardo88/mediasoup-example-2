import { Producer, Router, RtpCodecCapability, Worker } from 'mediasoup/node/lib/types'
import { config } from './config'
import { Server } from 'socket.io'

export class Room {
  id: string
  router: Router | null = null
  peers: Map<any, any>
  io: Server

  constructor(room_id: string, worker: Worker, io: Server) {
    this.id = room_id
    const mediaCodecs = config.mediasoup.router.mediaCodecs as RtpCodecCapability[]

    worker
      .createRouter({
        mediaCodecs,
      })
      /*
        .then(
        function (router: Router) {
          this.router = router
        }.bind(this)
      )

      */
      .then((router: Router) => {
        this.router = router
      })

    this.peers = new Map()
    this.io = io
  }

  addPeer(peer: any) {
    this.peers.set(peer.id, peer)
  }

  getProducerListForPeer() {
    let producerList: any = []
    this.peers.forEach((peer) => {
      peer.producers.forEach((producer: Producer) => {
        producerList.push({
          producer_id: producer.id,
        })
      })
    })
    return producerList
  }

  getRtpCapabilities() {
    return this.router?.rtpCapabilities || null
  }

  async createWebRtcTransport(socket_id: string) {
    const { maxIncomingBitrate, initialAvailableOutgoingBitrate } = config.mediasoup.webRtcTransport

    const transport = await this.router?.createWebRtcTransport({
      listenIps: config.mediasoup.webRtcTransport.listenIps,
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
      initialAvailableOutgoingBitrate,
    })
    if (maxIncomingBitrate) {
      try {
        await transport?.setMaxIncomingBitrate(maxIncomingBitrate)
      } catch (error) {}
    }

    transport?.on(
      'dtlsstatechange',
      function (dtlsState: any) {
        if (dtlsState === 'closed') {
          console.log('Transport close', {
            // @ts-ignore
            name: this.peers.get(socket_id).name,
          })
          transport.close()
        }
      }.bind(this)
    )

    // transport?.on('close', () => {
    transport?.on('@close', () => {
      console.log('Transport close', { name: this.peers.get(socket_id).name })
    })

    console.log('Adding transport', { transportId: transport?.id })
    this.peers.get(socket_id).addTransport(transport)
    return {
      params: {
        id: transport?.id,
        iceParameters: transport?.iceParameters,
        iceCandidates: transport?.iceCandidates,
        dtlsParameters: transport?.dtlsParameters,
      },
    }
  }

  async connectPeerTransport(socket_id: any, transport_id: any, dtlsParameters: any) {
    if (!this.peers.has(socket_id)) return

    await this.peers.get(socket_id).connectTransport(transport_id, dtlsParameters)
  }

  async produce(socket_id: any, producerTransportId: any, rtpParameters: any, kind: any) {
    // handle undefined errors
    return new Promise(
      async function (resolve: any, reject: any) {
        // @ts-ignore
        let producer = await this.peers.get(socket_id).createProducer(producerTransportId, rtpParameters, kind)
        resolve(producer.id)
        // @ts-ignore
        this.broadCast(socket_id, 'newProducers', [
          {
            producer_id: producer.id,
            producer_socket_id: socket_id,
          },
        ])
      }.bind(this)
    )
  }

  async consume(socket_id: any, consumer_transport_id: any, producer_id: any, rtpCapabilities: any) {
    // handle nulls
    if (
      !this.router?.canConsume({
        producerId: producer_id,
        rtpCapabilities,
      })
    ) {
      console.error('can not consume')
      return
    }

    let { consumer, params } = await this.peers
      .get(socket_id)
      .createConsumer(consumer_transport_id, producer_id, rtpCapabilities)

    consumer.on(
      'producerclose',
      function () {
        console.log('Consumer closed due to producerclose event', {
          // @ts-ignore
          name: `${this.peers.get(socket_id).name}`,
          consumer_id: `${consumer.id}`,
        })
        // @ts-ignore

        this.peers.get(socket_id).removeConsumer(consumer.id)
        // tell client consumer is dead
        // @ts-ignore
        this.io.to(socket_id).emit('consumerClosed', {
          consumer_id: consumer.id,
        })
      }.bind(this)
    )

    return params
  }

  async removePeer(socket_id: any) {
    this.peers.get(socket_id).close()
    this.peers.delete(socket_id)
  }

  closeProducer(socket_id: any, producer_id: any) {
    this.peers.get(socket_id).closeProducer(producer_id)
  }

  broadCast(socket_id: any, name: any, data: any) {
    for (let otherID of Array.from(this.peers.keys()).filter((id) => id !== socket_id)) {
      this.send(otherID, name, data)
    }
  }

  send(socket_id: any, name: any, data: any) {
    this.io.to(socket_id).emit(name, data)
  }

  getPeers() {
    return this.peers
  }

  toJson() {
    return {
      id: this.id,
      peers: JSON.stringify([...this.peers]),
    }
  }
}
