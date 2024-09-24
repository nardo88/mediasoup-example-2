import { Device } from 'mediasoup-client'
import { RtpCapabilities } from 'mediasoup-client/lib/RtpParameters'
import { Transport } from 'mediasoup-client/lib/types'
import { useRef, useState } from 'react'
import { io } from 'socket.io-client'

interface IOutput {
  cameraEnabled: boolean
  micEnabled: boolean
  isOnline: boolean
  stream: MediaStream | null
  start: () => void
  changeCameraStatus: () => void
  changeMicStatus: () => void
  startVideo: () => Promise<void>
}

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

export const useMediasoup = (roomId: string): IOutput => {
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [micEnabled, setMicEnabled] = useState(false)
  const [isOnline, setIsOnline] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)

  const producerLabel = new Map()
  const producers = new Map()
  const eventListeners = new Map()

  const device = useRef<Device | null>(null)
  const producerTransport = useRef<Transport | undefined>()

  // 1. Подключились к сокету
  const socket = useRef(io('https://192.168.31.93:5000'))

  const constraints = {
    audio: true,
    video: true,
  }

  function event(evt: any) {
    if (eventListeners.has(evt)) {
      eventListeners.get(evt).forEach((callback: any) => callback())
    }
  }

  function closeProducer(type: any) {
    if (!producerLabel.has(type)) {
      console.log('There is no producer for this type ' + type)
      return
    }

    let producer_id = producerLabel.get(type)
    console.log('Close producer', producer_id)

    socket.current.emit('producerClosed', {
      producer_id,
    })

    producers.get(producer_id).close()
    producers.delete(producer_id)
    producerLabel.delete(type)

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
        event(_EVENTS.stopAudio)
        break
      case mediaType.video:
        event(_EVENTS.stopVideo)
        break
      case mediaType.screen:
        event(_EVENTS.stopScreen)
        break
      default:
        return
    }
  }

  const startVideo = async () => {
    const type = 'videoType'
    const deviceId =
      '64b0c6e436639be12e6c1643647fc3f2fe864d19c6bbde6a83f6e5c9dcfa0688'
    let mediaConstraints = {}
    let audio = false
    let screen = false
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

    if (!device.current?.canProduce('video') && !audio) {
      console.error('Cannot produce video')
      return
    }
    if (producerLabel.has(type)) {
      console.log('Producer already exists for this type ' + type)
      return
    }
    console.log('Mediacontraints:', mediaConstraints)
    try {
      const s = screen
        ? await navigator.mediaDevices.getDisplayMedia()
        : await navigator.mediaDevices.getUserMedia(mediaConstraints)
      console.log(navigator.mediaDevices.getSupportedConstraints())

      const track = audio ? s.getAudioTracks()[0] : s.getVideoTracks()[0]

      setStream(s)
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
      const producer = await producerTransport.current?.produce(params)
      if (!producer) return
      console.log('Producer', producer)

      producers.set(producer.id, producer)

      producer.on('trackended', () => {
        closeProducer(type)
      })

      producer.on('transportclose', () => {
        console.log('Producer transport close')
        if (!audio) {
          stream?.getTracks().forEach(function (track: any) {
            track.stop()
          })
        }
        setIsOnline(false)
        producers.delete(producer.id)
      })

      producer.on('@close', () => {
        console.log('Closing producer')
        if (!audio) {
          stream?.getTracks().forEach(function (track: any) {
            track.stop()
          })
          setIsOnline(false)
        }
        producers.delete(producer.id)
      })

      producerLabel.set(type, producer.id)

      switch (type) {
        case mediaType.audio:
          event(_EVENTS.startAudio)
          break
        case mediaType.video:
          event(_EVENTS.startVideo)
          break
        case mediaType.screen:
          event(_EVENTS.startScreen)
          break
        default:
          return
      }
    } catch (err) {
      console.log('Produce error:', err)
    }
  }

  const initTransports = () => {
    if (!device.current || !socket.current) return
    socket.current.emit(
      'createWebRtcTransport',
      {
        forceTcp: false,
        rtpCapabilities: device.current.rtpCapabilities,
      },
      (data: any) => {
        if (data.error) {
          console.error(data.error)
          return
        }

        producerTransport.current = device.current?.createSendTransport(data)

        producerTransport.current?.on(
          'connect',
          async ({ dtlsParameters }: any, callback: any, errback: any) => {
            socket.current.emit(
              'connectTransport',
              {
                dtlsParameters,
                transport_id: data.id,
              },
              {},
              (d: any) => {
                if (d.error) {
                  errback(d)
                } else {
                  callback(d)
                }
              }
            )
          }
        )

        producerTransport.current?.on(
          'produce',
          async ({ kind, rtpParameters }: any, callback: any, errback: any) => {
            socket.current.emit(
              'produce',
              {
                producerTransportId: producerTransport.current!.id,
                kind,
                rtpParameters,
              },
              (d: any) => {
                if (d.error) {
                  errback(d)
                } else {
                  callback(d)
                }
              }
            )
          }
        )

        producerTransport.current?.on(
          'connectionstatechange',
          (state: string) => {
            switch (state) {
              case 'connecting':
                break

              case 'connected':
                //localVideo.srcObject = stream
                break

              case 'failed':
                producerTransport.current!.close()
                break

              default:
                break
            }
          }
        )

        socket.current.emit('getProducers')

        setIsOnline(true)
      }
    )
  }

  const loadDevice = async (routerRtpCapabilities: RtpCapabilities) => {
    try {
      device.current = new Device()
      await device.current.load({
        routerRtpCapabilities,
      })
      return device
    } catch (error: any) {
      if (error.name === 'UnsupportedError') {
        console.error('Browser not supported')
        alert('Browser not supported')
      }
      console.error(error)
    }
  }

  const getRouterRtpCapabilities = () => {
    socket.current.emit(
      'getRouterRtpCapabilities',
      {},
      async (data: RtpCapabilities) => {
        await loadDevice(data)
        await initTransports()
      }
    )
  }

  const getMedia = async () => {}

  const join = () => {
    socket.current.emit(
      'join',
      { room_id: roomId, name: 'Максим' },
      (e: any) => {
        getRouterRtpCapabilities()
      }
    )
  }

  const createRoom = () => {
    socket.current.emit('createRoom', { room_id: roomId }, () => {
      join()
    })
  }

  const start = async () => {
    if (!socket.current) return
    // 1. Получаем поток
    await getMedia()
    // 2. createRoom
    createRoom()
    // 3. join

    // 4. getRouterRtpCapabilities
    // 5. loadDevice
    // 6. initTransports
    // 7. getProducers
    // 8. _isOpen = true

    // 2. Получаем медиапоток
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        stream.getTracks().forEach((track) => (track.enabled = false))
      })
      .catch((err) => {
        console.error('Access denied for audio/video: ', err)
      })
  }

  const changeCameraStatus = () => {
    setCameraEnabled((p) => !p)
  }
  const changeMicStatus = () => {
    setMicEnabled((p) => !p)
  }

  return {
    cameraEnabled,
    micEnabled,
    isOnline,
    start,
    changeCameraStatus,
    changeMicStatus,
    startVideo,
    stream,
  }
}
