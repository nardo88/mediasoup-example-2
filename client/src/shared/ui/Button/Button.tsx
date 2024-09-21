import React, { CSSProperties, MouseEvent, ReactNode } from 'react'

import cls from './Button.module.scss'
import { classNames } from '@shared/helpers/classNames'

export enum ButtonVariants {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  TERTIARY = 'tertiary',
  ICON = 'icon',
}

type Props = {
  onClick?: (e: MouseEvent) => void
  className?: string
  variant?: ButtonVariants
  type?: 'button' | 'submit'
  disabled?: boolean
  title?: string
  children?: ReactNode
  style?: CSSProperties
}

const Button: React.FC<Props> = ({
  children,
  className,
  onClick,
  disabled = false,
  type = 'button',
  variant = ButtonVariants.PRIMARY,
  title,
  style,
}) => {
  return (
    <button
      title={title}
      className={classNames(cls.Button, { [cls[variant]]: true }, [className])}
      disabled={disabled}
      type={type}
      onClick={onClick}
      style={style}>
      {children}
    </button>
  )
}

export default Button
