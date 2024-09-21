import { FC } from 'react'
import cls from './ControlSection.module.scss'

interface ControlSectionProps {
  className?: string
}

export const ControlSection: FC<ControlSectionProps> = (props) => {
  const {} = props

  return <div className={cls.ControlSection}></div>
}
