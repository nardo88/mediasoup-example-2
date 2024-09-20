import { FC, useRef, useState } from 'react'
import cls from './Example.module.scss'
import { io } from 'socket.io-client'
import mediasoupClient from 'mediasoup-client'

export const Example: FC = () => {
  const nameInput = {} as any
  const roomidInput = {} as any
  const audioSelect = {} as any
  const videoSelect = {} as any

  // ==================================================
  const rc = useRef<null | any>(null)
  const [isEnumerateDevices, setIsEnumerateDevices] = useState(false)

  // if (location.href.substr(0, 5) !== 'https')
  //   location.href = 'https' + location.href.substr(4, location.href.length - 4)

  const socket = io('http://localhost:5000')

  // let producer = null

  // nameInput.value = 'user_' + Math.round(Math.random() * 1000)

  // // @ts-ignore
  // socket.request = function request(type: any, data = {}) {
  //   return new Promise((resolve, reject) => {
  //     socket.emit(type, data, (data: any) => {
  //       if (data.error) {
  //         reject(data.error)
  //       } else {
  //         resolve(data)
  //       }
  //     })
  //   })
  // }

  function joinRoom(name: any, room_id: any) {
    if (rc.current && rc.current.isOpen()) {
      console.log('Already connected to a room')
    } else {
      initEnumerateDevices()
      rc.current = new RoomClient({
        localMediaEl,
        mediasoupClient,
        name,
        remoteAudioEl,
        remoteVideoEl,
        room_id,
        socket,
        successCallback,
      })

      addListeners()
    }
  }

  // // function roomOpen() {
  // //   login.className = 'hidden'
  // //   reveal(startAudioButton)
  // //   hide(stopAudioButton)
  // //   reveal(startVideoButton)
  // //   hide(stopVideoButton)
  // //   reveal(startScreenButton)
  // //   hide(stopScreenButton)
  // //   reveal(exitButton)
  // //   reveal(copyButton)
  // //   reveal(devicesButton)
  // //   control.className = ''
  // //   reveal(videoMedia)
  // // }

  // function hide(elem: any) {
  //   elem.className = 'hidden'
  // }

  // function reveal(elem: any) {
  //   elem.className = ''
  // }

  function addListeners() {
    rc.current?.on(RoomClient.EVENTS.startScreen, () => {
      hide(startScreenButton)
      reveal(stopScreenButton)
    })

    rc.current?.on(RoomClient.EVENTS.stopScreen, () => {
      hide(stopScreenButton)
      reveal(startScreenButton)
    })

    rc.on(RoomClient.EVENTS.stopAudio, () => {
      hide(stopAudioButton)
      reveal(startAudioButton)
    })
    rc.on(RoomClient.EVENTS.startAudio, () => {
      hide(startAudioButton)
      reveal(stopAudioButton)
    })

    rc.on(RoomClient.EVENTS.startVideo, () => {
      hide(startVideoButton)
      reveal(stopVideoButton)
    })
    rc.on(RoomClient.EVENTS.stopVideo, () => {
      hide(stopVideoButton)
      reveal(startVideoButton)
    })
    rc.on(RoomClient.EVENTS.exitRoom, () => {
      hide(control)
      hide(devicesList)
      hide(videoMedia)
      hide(copyButton)
      hide(devicesButton)
      reveal(login)
    })
  }

  // let isEnumerateDevices = false

  function initEnumerateDevices() {
    // Many browsers, without the consent of getUserMedia, cannot enumerate the devices.
    if (isEnumerateDevices) return

    const constraints = {
      audio: true,
      video: true,
    }

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        enumerateDevices()
        stream.getTracks().forEach(function (track) {
          track.stop()
        })
      })
      .catch((err) => {
        console.error('Access denied for audio/video: ', err)
      })
  }

  function enumerateDevices() {
    // Load mediaDevice options
    navigator.mediaDevices.enumerateDevices().then((devices) =>
      devices.forEach((device) => {
        let el = null
        if ('audioinput' === device.kind) {
          el = audioSelect
        } else if ('videoinput' === device.kind) {
          el = videoSelect
        }
        if (!el) return

        let option = document.createElement('option')
        option.value = device.deviceId
        option.innerText = device.label
        el.appendChild(option)
        setIsEnumerateDevices(true)
      })
    )
  }

  return (
    <div className={cls.Example}>
      <div className="container">
        <div id="login">
          <br />
          <i className="fas fa-server"> Room: </i>
          <input id="roomidInput" value="123" type="text" />
          {/* <!--<button id="createRoom" onClick="createRoom(roomid.value)" label="createRoom">Create Room</button>--> */}
          <i className="fas fa-user"> User: </i>
          <input id="nameInput" value="user" type="text" />
          <button
            id="joinButton"
            onClick={() => joinRoom(nameInput.value, roomidInput.value)}>
            <i className="fas fa-sign-in-alt"></i> Join
          </button>
        </div>
      </div>

      <div className="container">
        <div id="control" className="hidden">
          <br />
          <button
            id="exitButton"
            className="hidden"
            onClick={() => rc.current?.exit()}>
            <i className="fas fa-arrow-left"></i> Exit
          </button>
          <button
            id="copyButton"
            className="hidden"
            onClick={() => rc.current?.copyURL()}>
            <i className="far fa-copy"></i> copy URL
          </button>
          <button
            id="devicesButton"
            className="hidden"
            onClick={() => rc.current?.showDevices()}>
            <i className="fas fa-cogs"></i> Devices
          </button>
          <button
            id="startAudioButton"
            className="hidden"
            onClick={() =>
              rc.current?.produce(RoomClient.mediaType.audio, audioSelect.value)
            }>
            <i className="fas fa-volume-up"></i> Open audio
          </button>
          <button
            id="stopAudioButton"
            className="hidden"
            onClick={() =>
              rc.current?.closeProducer(RoomClient.mediaType.audio)
            }>
            <i className="fas fa-volume-up"></i> Close audio
          </button>
          <button
            id="startVideoButton"
            className="hidden"
            onClick={() =>
              rc.current?.produce(RoomClient.mediaType.video, videoSelect.value)
            }>
            <i className="fas fa-camera"></i> Open video
          </button>
          <button
            id="stopVideoButton"
            className="hidden"
            onClick={() =>
              rc.current?.closeProducer(RoomClient.mediaType.video)
            }>
            <i className="fas fa-camera"></i> Close video
          </button>
          <button
            id="startScreenButton"
            className="hidden"
            onClick={() => rc.current?.produce(RoomClient.mediaType.screen)}>
            <i className="fas fa-desktop"></i> Open screen
          </button>
          <button
            id="stopScreenButton"
            className="hidden"
            onClick={() =>
              rc.current?.closeProducer(RoomClient.mediaType.screen)
            }>
            <i className="fas fa-desktop"></i> Close screen
          </button>
          <br />
          <br />
          <div id="devicesList" className="hidden">
            <i className="fas fa-microphone"></i> Audio:
            <select
              id="audioSelect"
              className="form-select"
              style={{ width: 'auto' }}></select>
            <br />
            <i className="fas fa-video"></i> Video:
            <select
              id="videoSelect"
              className="form-select"
              style={{ width: 'auto' }}></select>
          </div>
          <br />
        </div>
      </div>

      <div className="container">
        <div id="videoMedia" className="hidden">
          <h4>
            <i className="fab fa-youtube"></i> Local media
          </h4>
          <div id="localMedia" className="containers">
            {/* <!--<video id="localVideo" autoPlay inline className="vid"></video>--> */}
            {/* <!--<video id="localScreen" autoplay inline className="vid"></video>--> */}
          </div>
          <br />
          <h4>
            <i className="fab fa-youtube"></i> Remote media
          </h4>
          <div id="remoteVideos" className="containers"></div>
          <div id="remoteAudios"></div>
        </div>
      </div>
    </div>
  )
}
