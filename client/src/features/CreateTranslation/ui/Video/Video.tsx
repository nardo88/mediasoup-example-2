import { FC } from 'react'
import cls from './Video.module.scss'
import { classNames } from '@shared/helpers/classNames'

interface VideoProps {
  className?: string
  stream: null | MediaStream
}

export const Video: FC<VideoProps> = (props) => {
  const { stream, className } = props

  return (
    <div className={classNames(cls.Video, {}, [className])}>
      <video
        autoPlay
        muted
        ref={(ref) => {
          if (ref) ref.srcObject = stream
        }}
      />
    </div>
  )
}
