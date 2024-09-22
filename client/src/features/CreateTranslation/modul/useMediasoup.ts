import { useRef, useState } from 'react'
import { io } from 'socket.io-client'

interface IOutput {
  cameraEnabled: boolean
  micEnabled: boolean
  start: () => void
  changeCameraStatus: () => void
  changeMicStatus: () => void
}

export const useMediasoup = (roomId: string): IOutput => {
  console.log('roomId: ', roomId)
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [micEnabled, setMicEnabled] = useState(false)

  // 1. Подключились к сокету
  const socket = useRef(io('https://192.168.31.93:5000'))

  const constraints = {
    audio: true,
    video: true,
  }

  const initSockets = () => {}

  const createRoom = () => {
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

  const joinRoom = () => {
    socket.current
      .emit('join', { name: 'Max', room_id: roomId })
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

  const start = () => {
    /*
    1. Получаем поток
    2. createRoom
    3. join
    4. getRouterRtpCapabilities
    5. loadDevice
    6. initTransports
    7. getProducers
    8. _isOpen = true

    */
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
    start,
    changeCameraStatus,
    changeMicStatus,
  }
}
