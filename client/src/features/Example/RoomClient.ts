const mediaType = {
  audio: 'audioType',
  video: 'videoType',
  screen: 'screenType',
}
const _EVENTS = {
  exitRoom: 'exitRoom',
  openRoom: 'openRoom',
  startVideo: 'startVideo',
  stopVideo: 'stopVideo',
  startAudio: 'startAudio',
  stopAudio: 'stopAudio',
  startScreen: 'startScreen',
  stopScreen: 'stopScreen',
}

interface IOptions {
  localMediaEl: any
  remoteVideoEl: any
  remoteAudioEl: any
  mediasoupClient: any
  socket: any
  room_id: any
  name: any
  successCallback: any
}

class RoomClient {
  name: any
  localMediaEl: any
  remoteVideoEl: any
  remoteAudioEl: any
  mediasoupClient: any
  producerTransport: any
  consumerTransport: any
  device: any
  isVideoOnFullScreen: any
  isDevicesVisible: any
  consumers: any
  producers: any
  socket: any
  room_id: any
  producerLabel: any
  _isOpen: boolean
  eventListeners: any

  constructor(opt: IOptions) {
    const {
      localMediaEl,
      mediasoupClient,
      name,
      remoteAudioEl,
      remoteVideoEl,
      room_id,
      socket,
      successCallback,
    } = opt
    this.name = name
    this.localMediaEl = localMediaEl
    this.remoteVideoEl = remoteVideoEl
    this.remoteAudioEl = remoteAudioEl
    this.mediasoupClient = mediasoupClient

    this.socket = socket
    this.producerTransport = null
    this.consumerTransport = null
    this.device = null
    this.room_id = room_id

    this.isVideoOnFullScreen = false
    this.isDevicesVisible = false

    this.consumers = new Map()
    this.producers = new Map()

    console.log('Mediasoup client', mediasoupClient)

    /**
     * map that contains a mediatype as key and producer_id as value
     */
    this.producerLabel = new Map()

    this._isOpen = false
    this.eventListeners = new Map()

    Object.keys(_EVENTS).forEach(
      function (evt: any) {
        //@ts-ignore
        this.eventListeners.set(evt, [])
      }.bind(this)
    )

    this.createRoom(room_id).then(
      async function () {
        //@ts-ignore
        await this.join(name, room_id)
        //@ts-ignore
        this.initSockets()
        //@ts-ignore
        this._isOpen = true
        successCallback()
      }.bind(this)
    )
  }

  ////////// INIT /////////

  async createRoom(room_id: string) {
    await this.socket
      .request('createRoom', {
        room_id,
      })
      .catch((err: any) => {
        console.log('Create room error:', err)
      })
  }

  async join(name: any, room_id: any) {
    this.socket
      .request('join', {
        name,
        room_id,
      })
      .then(
        async function (e: any) {
          console.log('Joined to room', e)
          //@ts-ignore
          const data = await this.socket.request('getRouterRtpCapabilities')
          //@ts-ignore
          let device = await this.loadDevice(data)
          //@ts-ignore
          this.device = device
          //@ts-ignore
          await this.initTransports(device)
          //@ts-ignore
          this.socket.emit('getProducers')
        }.bind(this)
      )
      .catch((err: any) => {
        console.log('Join error:', err)
      })
  }

  async loadDevice(routerRtpCapabilities: any) {
    let device
    try {
      device = new this.mediasoupClient.Device()
    } catch (error: any) {
      if (error.name === 'UnsupportedError') {
        console.error('Browser not supported')
        alert('Browser not supported')
      }
      console.error(error)
    }
    await device.load({
      routerRtpCapabilities,
    })
    return device
  }

  async initTransports(device: any) {
    // init producerTransport
    {
      const data = await this.socket.request('createWebRtcTransport', {
        forceTcp: false,
        rtpCapabilities: device.rtpCapabilities,
      })

      if (data.error) {
        console.error(data.error)
        return
      }

      this.producerTransport = device.createSendTransport(data)

      this.producerTransport.on(
        'connect',
        async function ({ dtlsParameters }: any, callback: any, errback: any) {
          //@ts-ignore
          this.socket
            .request('connectTransport', {
              dtlsParameters,
              transport_id: data.id,
            })
            .then(callback)
            .catch(errback)
        }.bind(this)
      )

      this.producerTransport.on(
        'produce',
        async function (
          { kind, rtpParameters }: any,
          callback: any,
          errback: any
        ) {
          try {
            //@ts-ignore
            const { producer_id } = await this.socket.request('produce', {
              //@ts-ignore
              producerTransportId: this.producerTransport.id,
              kind,
              rtpParameters,
            })
            callback({
              id: producer_id,
            })
          } catch (err) {
            errback(err)
          }
        }.bind(this)
      )

      this.producerTransport.on(
        'connectionstatechange',
        function (state: any) {
          switch (state) {
            case 'connecting':
              break

            case 'connected':
              //localVideo.srcObject = stream
              break

            case 'failed':
              //@ts-ignore
              this.producerTransport.close()
              break

            default:
              break
          }
        }.bind(this)
      )
    }

    // init consumerTransport
    {
      const data = await this.socket.request('createWebRtcTransport', {
        forceTcp: false,
      })

      if (data.error) {
        console.error(data.error)
        return
      }

      // only one needed
      this.consumerTransport = device.createRecvTransport(data)
      this.consumerTransport.on(
        'connect',
        function ({ dtlsParameters }: any, callback: any, errback: any) {
          //@ts-ignore
          this.socket
            .request('connectTransport', {
              //@ts-ignore
              transport_id: this.consumerTransport.id,
              dtlsParameters,
            })
            .then(callback)
            .catch(errback)
        }.bind(this)
      )

      this.consumerTransport.on(
        'connectionstatechange',
        async function (state: any) {
          switch (state) {
            case 'connecting':
              break

            case 'connected':
              //remoteVideo.srcObject = await stream;
              //await socket.request('resume');
              break

            case 'failed':
              //@ts-ignore
              this.consumerTransport.close()
              break

            default:
              break
          }
        }.bind(this)
      )
    }
  }

  initSockets() {
    this.socket.on(
      'consumerClosed',
      function ({ consumer_id }: any) {
        console.log('Closing consumer:', consumer_id)
        //@ts-ignore
        this.removeConsumer(consumer_id)
      }.bind(this)
    )

    /**
     * data: [ {
     *  producer_id:
     *  producer_socket_id:
     * }]
     */
    this.socket.on(
      'newProducers',
      async function (data: any) {
        console.log('New producers', data)
        for (let { producer_id } of data) {
          //@ts-ignore
          await this.consume(producer_id)
        }
      }.bind(this)
    )

    this.socket.on(
      'disconnect',
      function () {
        //@ts-ignore
        this.exit(true)
      }.bind(this)
    )
  }

  //////// MAIN FUNCTIONS /////////////

  async produce(type: any, deviceId = null) {
    let mediaConstraints = {}
    let audio = false
    let screen = false
    switch (type) {
      case mediaType.audio:
        mediaConstraints = {
          audio: {
            deviceId: deviceId,
          },
          video: false,
        }
        audio = true
        break
      case mediaType.video:
        mediaConstraints = {
          audio: false,
          video: {
            width: {
              min: 640,
              ideal: 1920,
            },
            height: {
              min: 400,
              ideal: 1080,
            },
            deviceId: deviceId,
            /*aspectRatio: {
                              ideal: 1.7777777778
                          }*/
          },
        }
        break
      case mediaType.screen:
        mediaConstraints = false
        screen = true
        break
      default:
        return
    }
    if (!this.device.canProduce('video') && !audio) {
      console.error('Cannot produce video')
      return
    }
    if (this.producerLabel.has(type)) {
      console.log('Producer already exists for this type ' + type)
      return
    }
    console.log('Mediacontraints:', mediaConstraints)
    let stream
    try {
      stream = screen
        ? await navigator.mediaDevices.getDisplayMedia()
        : await navigator.mediaDevices.getUserMedia(mediaConstraints)
      console.log(navigator.mediaDevices.getSupportedConstraints())

      const track = audio
        ? stream.getAudioTracks()[0]
        : stream.getVideoTracks()[0]
      const params: any = {
        track,
      }
      if (!audio && !screen) {
        params.encodings = [
          {
            rid: 'r0',
            maxBitrate: 100000,
            //scaleResolutionDownBy: 10.0,
            scalabilityMode: 'S1T3',
          },
          {
            rid: 'r1',
            maxBitrate: 300000,
            scalabilityMode: 'S1T3',
          },
          {
            rid: 'r2',
            maxBitrate: 900000,
            scalabilityMode: 'S1T3',
          },
        ]
        params.codecOptions = {
          videoGoogleStartBitrate: 1000,
        }
      }
      const producer = await this.producerTransport.produce(params)

      console.log('Producer', producer)

      this.producers.set(producer.id, producer)

      let elem: any
      if (!audio) {
        elem = document.createElement('video')
        elem.srcObject = stream
        elem.id = producer.id
        elem.playsinline = false
        elem.autoplay = true
        elem.className = 'vid'
        this.localMediaEl.appendChild(elem)
        this.handleFS(elem.id)
      }

      producer.on('trackended', () => {
        this.closeProducer(type)
      })

      producer.on('transportclose', () => {
        console.log('Producer transport close')
        if (!audio) {
          elem.srcObject.getTracks().forEach(function (track: any) {
            track.stop()
          })
          elem.parentNode.removeChild(elem)
        }
        this.producers.delete(producer.id)
      })

      producer.on('close', () => {
        console.log('Closing producer')
        if (!audio) {
          elem.srcObject.getTracks().forEach(function (track: any) {
            track.stop()
          })
          elem.parentNode.removeChild(elem)
        }
        this.producers.delete(producer.id)
      })

      this.producerLabel.set(type, producer.id)

      switch (type) {
        case mediaType.audio:
          this.event(_EVENTS.startAudio)
          break
        case mediaType.video:
          this.event(_EVENTS.startVideo)
          break
        case mediaType.screen:
          this.event(_EVENTS.startScreen)
          break
        default:
          return
      }
    } catch (err) {
      console.log('Produce error:', err)
    }
  }

  async consume(producer_id: string) {
    //let info = await this.roomInfo()

    this.getConsumeStream(producer_id).then(
      function ({ consumer, stream, kind }: any) {
        //@ts-ignore
        this.consumers.set(consumer.id, consumer)

        let elem: any
        if (kind === 'video') {
          elem = document.createElement('video')
          elem.srcObject = stream
          elem.id = consumer.id
          elem.playsinline = false
          elem.autoplay = true
          elem.className = 'vid'
          //@ts-ignore
          this.remoteVideoEl.appendChild(elem)
          //@ts-ignore
          this.handleFS(elem.id)
        } else {
          elem = document.createElement('audio')
          elem.srcObject = stream
          elem.id = consumer.id
          elem.playsinline = false
          elem.autoplay = true
          //@ts-ignore
          this.remoteAudioEl.appendChild(elem)
        }

        consumer.on(
          'trackended',
          function () {
            //@ts-ignore
            this.removeConsumer(consumer.id)
            //@ts-ignore
          }.bind(this)
        )

        consumer.on(
          'transportclose',
          function () {
            //@ts-ignore
            this.removeConsumer(consumer.id)
            //@ts-ignore
          }.bind(this)
        )
      }.bind(this)
    )
  }

  async getConsumeStream(producerId: string) {
    const { rtpCapabilities } = this.device
    const data = await this.socket.request('consume', {
      rtpCapabilities,
      consumerTransportId: this.consumerTransport.id, // might be
      producerId,
    })
    const { id, kind, rtpParameters } = data

    let codecOptions = {}
    const consumer = await this.consumerTransport.consume({
      id,
      producerId,
      kind,
      rtpParameters,
      codecOptions,
    })

    const stream = new MediaStream()
    stream.addTrack(consumer.track)

    return {
      consumer,
      stream,
      kind,
    }
  }

  closeProducer(type: any) {
    if (!this.producerLabel.has(type)) {
      console.log('There is no producer for this type ' + type)
      return
    }

    let producer_id = this.producerLabel.get(type)
    console.log('Close producer', producer_id)

    this.socket.emit('producerClosed', {
      producer_id,
    })

    this.producers.get(producer_id).close()
    this.producers.delete(producer_id)
    this.producerLabel.delete(type)

    if (type !== mediaType.audio) {
      let elem = document.getElementById(producer_id) as HTMLVideoElement
      //@ts-ignore
      elem.srcObject?.getTracks().forEach(function (track: any) {
        track.stop()
      })
      //@ts-ignore
      elem.parentNode.removeChild(elem)
    }

    switch (type) {
      case mediaType.audio:
        this.event(_EVENTS.stopAudio)
        break
      case mediaType.video:
        this.event(_EVENTS.stopVideo)
        break
      case mediaType.screen:
        this.event(_EVENTS.stopScreen)
        break
      default:
        return
    }
  }

  pauseProducer(type: any) {
    if (!this.producerLabel.has(type)) {
      console.log('There is no producer for this type ' + type)
      return
    }

    let producer_id = this.producerLabel.get(type)
    this.producers.get(producer_id).pause()
  }

  resumeProducer(type: any) {
    if (!this.producerLabel.has(type)) {
      console.log('There is no producer for this type ' + type)
      return
    }

    let producer_id = this.producerLabel.get(type)
    this.producers.get(producer_id).resume()
  }

  removeConsumer(consumer_id: string) {
    let elem = document.getElementById(consumer_id)
    //@ts-ignore
    elem.srcObject.getTracks().forEach(function (track) {
      track.stop()
    })
    //@ts-ignore
    elem.parentNode.removeChild(elem)

    this.consumers.delete(consumer_id)
  }

  exit(offline = false) {
    let clean = function () {
      //@ts-ignore
      this._isOpen = false
      //@ts-ignore
      this.consumerTransport.close()
      //@ts-ignore
      this.producerTransport.close()
      //@ts-ignore
      this.socket.off('disconnect')
      //@ts-ignore
      this.socket.off('newProducers')
      //@ts-ignore
      this.socket.off('consumerClosed')
    }.bind(this)

    if (!offline) {
      this.socket
        .request('exitRoom')
        .then((e: any) => console.log(e))
        .catch((e: any) => console.warn(e))
        .finally(
          function () {
            clean()
          }.bind(this)
        )
    } else {
      clean()
    }

    this.event(_EVENTS.exitRoom)
  }

  ///////  HELPERS //////////

  async roomInfo() {
    let info = await this.socket.request('getMyRoomInfo')
    return info
  }

  static get mediaType() {
    return mediaType
  }

  event(evt: any) {
    if (this.eventListeners.has(evt)) {
      this.eventListeners.get(evt).forEach((callback: any) => callback())
    }
  }

  on(evt: any, callback: any) {
    this.eventListeners.get(evt).push(callback)
  }

  //////// GETTERS ////////

  isOpen() {
    return this._isOpen
  }

  static get EVENTS() {
    return _EVENTS
  }

  //////// UTILITY ////////

  copyURL() {
    let tmpInput = document.createElement('input')
    document.body.appendChild(tmpInput)
    tmpInput.value = window.location.href
    tmpInput.select()
    document.execCommand('copy')
    document.body.removeChild(tmpInput)
    console.log('URL copied to clipboard 👍')
  }

  showDevices() {
    if (!this.isDevicesVisible) {
      //   reveal(devicesList)
      this.isDevicesVisible = true
    } else {
      //   hide(devicesList)
      this.isDevicesVisible = false
    }
  }

  handleFS(id: string) {
    let videoPlayer = document.getElementById(id) as any
    //@ts-ignore
    videoPlayer.addEventListener('fullscreenchange', (e) => {
      if (videoPlayer.controls) return
      let fullscreenElement = document.fullscreenElement
      if (!fullscreenElement) {
        videoPlayer.style.pointerEvents = 'auto'
        this.isVideoOnFullScreen = false
      }
    })
    videoPlayer.addEventListener('webkitfullscreenchange', (_e: any) => {
      if (videoPlayer.controls) return
      //@ts-ignore
      let webkitIsFullScreen = document.webkitIsFullScreen as any
      if (!webkitIsFullScreen) {
        videoPlayer.style.pointerEvents = 'auto'
        this.isVideoOnFullScreen = false
      }
    })
    videoPlayer.addEventListener('click', (_e: any) => {
      if (videoPlayer.controls) return
      if (!this.isVideoOnFullScreen) {
        if (videoPlayer.requestFullscreen) {
          videoPlayer.requestFullscreen()
        } else if (videoPlayer.webkitRequestFullscreen) {
          videoPlayer.webkitRequestFullscreen()
        } else if (videoPlayer.msRequestFullscreen) {
          videoPlayer.msRequestFullscreen()
        }
        this.isVideoOnFullScreen = true
        videoPlayer.style.pointerEvents = 'none'
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
          //@ts-ignore
        } else if (document.webkitCancelFullScreen) {
          //@ts-ignore
          document.webkitCancelFullScreen()
          //@ts-ignore
        } else if (document.msExitFullscreen) {
          //@ts-ignore
          document.msExitFullscreen()
        }
        this.isVideoOnFullScreen = false
        videoPlayer.style.pointerEvents = 'auto'
      }
    })
  }
}
