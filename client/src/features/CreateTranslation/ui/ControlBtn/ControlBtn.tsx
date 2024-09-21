import { FC } from 'react'
import { classNames } from '@shared/helpers/classNames'
import { Text } from '@shared/ui/Text/Text'
import cls from './ControlBtn.module.scss'

interface ControlBtnProps {
  className?: string
  label: string
  onClick: () => void
  Icon: FC
  isCapOff?: boolean
}

export const ControlBtn: FC<ControlBtnProps> = (props) => {
  const { className, label, onClick, Icon, isCapOff = false } = props

  return (
    <div className={classNames(cls.ControlBtn, {}, [className])}>
      <button
        className={classNames(cls.btn, { [cls.isCapOff]: isCapOff })}
        onClick={onClick}>
        <Icon />
      </button>
      <Text className={cls.label}>{label}</Text>
    </div>
  )
}
