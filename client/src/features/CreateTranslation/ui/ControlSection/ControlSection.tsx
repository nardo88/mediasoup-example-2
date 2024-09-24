import { Dispatch, FC, SetStateAction } from 'react'
import cls from './ControlSection.module.scss'
import { ControlBtn } from '../ControlBtn/ControlBtn'
import { VideoCam } from '@shared/ui/icons/VideoCam'
import { Mic } from '@shared/ui/icons/Mic'
import { Desctop } from '@shared/ui/icons/Desctop'
import { Record } from '@shared/ui/icons/Record'
import { Chat } from '@shared/ui/icons/Chat'
import { Group } from '@shared/ui/icons/Group'
import { OpenDoor } from '@shared/ui/icons/OpenDoor'
import { classNames } from '@shared/helpers/classNames'
import { CurrentAreaType } from '@features/CreateTranslation/types'

interface ControlSectionProps {
  className?: string
  cameraEnabled: boolean
  micEnabled: boolean
  changeCameraStatus: () => void
  changeMicStatus: () => void
  startVideo: () => Promise<void>
  setCurrent: Dispatch<SetStateAction<CurrentAreaType>>
}

export const ControlSection: FC<ControlSectionProps> = (props) => {
  const {
    cameraEnabled,
    micEnabled,
    changeMicStatus,
    changeCameraStatus,
    startVideo,
    setCurrent,
  } = props

  return (
    <div className={cls.ControlSection}>
      <ControlBtn
        onClick={() =>
          startVideo().then(() => {
            changeCameraStatus()
            setCurrent('video')
          })
        }
        className={classNames('', { [cls.deviceEabled]: cameraEnabled })}
        Icon={VideoCam}
        label="Видео"
      />
      <ControlBtn
        onClick={changeMicStatus}
        className={classNames('', { [cls.deviceEabled]: micEnabled })}
        Icon={Mic}
        label="Звук"
      />
      <ControlBtn onClick={() => null} Icon={Desctop} label="Поделиться" />
      <ControlBtn onClick={() => null} Icon={Record} label="Запись" />
      <ControlBtn onClick={() => null} Icon={Chat} label="Чат" />
      <ControlBtn onClick={() => null} Icon={Group} label="Участники" />
      <ControlBtn
        isCapOff
        onClick={() => null}
        Icon={OpenDoor}
        label="Завершить"
      />
    </div>
  )
}
