import { FC, useState } from 'react'
import cls from './Main.module.scss'
import { ControlSection } from '../ControlSection/ControlSection'
import { ContentSection } from '../ContentSection/ContentSection'
import { CurrentAreaType } from '@features/CreateTranslation/types'
import { useMediasoup } from '../../modul/useMediasoup'
import { useParams } from 'react-router-dom'

interface MainProps {
  className?: string
}

export const Main: FC<MainProps> = () => {
  const params = useParams()
  const {
    cameraEnabled,
    micEnabled,
    isOnline,
    start,
    changeCameraStatus,
    changeMicStatus,
    startVideo,
    stream,
  } = useMediasoup(params.roomId as string)
  const [current, setCurrent] = useState<CurrentAreaType>('link')
  return (
    <div className={cls.Main}>
      <ContentSection
        current={current}
        isOnline={isOnline}
        start={start}
        stream={stream}
      />
      <ControlSection
        cameraEnabled={cameraEnabled}
        micEnabled={micEnabled}
        changeCameraStatus={changeCameraStatus}
        changeMicStatus={changeMicStatus}
        startVideo={startVideo}
        setCurrent={setCurrent}
      />
    </div>
  )
}
