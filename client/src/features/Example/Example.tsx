import { FC, useEffect, useRef, useState } from 'react'
import cls from './Example.module.scss'
import { io } from 'socket.io-client'
import { RoomClient } from './RoomClient'

export const Example: FC = () => {
  const [isEnumerateDevices, setIsEnumerateDevices] = useState(false)
  const [user, setUser] = useState('user_' + Math.round(Math.random() * 1000))
  const [roomId, setRoomId] = useState('123')

  // refs
  const rc = useRef<null | any>(null)
  const localMediaEl = useRef<HTMLDivElement>(null)
  const remoteAudioEl = useRef<HTMLDivElement>(null)
  const remoteVideoEl = useRef<HTMLDivElement>(null)
  const videoSelect = useRef<HTMLSelectElement>(null)
  const audioSelect = useRef<HTMLSelectElement>(null)

  const socket = useRef(io('https://192.168.31.171:5000'))

  // @ts-ignore
  socket.current.request = function request(type: any, data = {}) {
    console.log('type: ', type, data)
    return new Promise((resolve, reject) => {
      socket.current.emit(type, data, (data: any) => {
        if (data.error) {
          reject(data.error)
        } else {
          resolve(data)
        }
      })
    })
  }

  function joinRoom(name: any, room_id: any) {
    if (rc.current && rc.current.isOpen()) {
      console.log('Already connected to a room')
    } else {
      initEnumerateDevices()
      rc.current = new RoomClient({
        localMediaEl: localMediaEl,
        name,
        remoteAudioEl,
        remoteVideoEl,
        room_id,
        socket: socket.current,
        successCallback: () => console.log('room created'),
      })
    }
  }

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
          el = audioSelect.current
        } else if ('videoinput' === device.kind) {
          el = videoSelect.current
        }
        if (!el) return

        let option = document.createElement('option')
        option.value = device.deviceId
        option.innerText = device.label
        console.log(el)
        el.appendChild(option)
        setIsEnumerateDevices(true)
      })
    )
  }

  useEffect(() => {}, [])

  return (
    <div className={cls.Example}>
      <div className="container">
        <div id="login">
          <br />
          <i className="fas fa-server"> Room: </i>
          <input value={roomId} onChange={(e) => setRoomId(e.target.value)} />
          {/* <!--<button id="createRoom" onClick="createRoom(roomid.value)" label="createRoom">Create Room</button>--> */}
          <i className="fas fa-user"> User: </i>
          <input value={user} onChange={(e) => setUser(e.target.value)} />
          <button id="joinButton" onClick={() => joinRoom(user, roomId)}>
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
              rc.current?.produce(
                RoomClient.mediaType.audio,
                audioSelect.current?.value
              )
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
              rc.current?.produce(
                RoomClient.mediaType.video,
                videoSelect.current?.value
              )
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
              ref={audioSelect}
              className="form-select"
              style={{ width: 'auto' }}></select>
            <br />
            <i className="fas fa-video"></i> Video:
            <select
              id="videoSelect"
              ref={videoSelect}
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
          <div ref={localMediaEl} className="containers">
            {/* <!--<video id="localVideo" autoPlay inline className="vid"></video>--> */}
            {/* <!--<video id="localScreen" autoplay inline className="vid"></video>--> */}
          </div>
          <br />
          <h4>
            <i className="fab fa-youtube"></i> Remote media
          </h4>
          <div ref={remoteVideoEl} className="containers"></div>
          <div ref={remoteAudioEl}></div>
        </div>
      </div>
    </div>
  )
}
