import { FC } from 'react'
import cls from './ControlSection.module.scss'
import { ControlBtn } from '../ControlBtn/ControlBtn'
import { VideoCam } from '@shared/ui/icons/VideoCam'

interface ControlSectionProps {
  className?: string
}

export const ControlSection: FC<ControlSectionProps> = (props) => {
  const {} = props

  return (
    <div className={cls.ControlSection}>
      <ControlBtn onClick={() => null} Icon={VideoCam} label="Видео" />
    </div>
  )
}
