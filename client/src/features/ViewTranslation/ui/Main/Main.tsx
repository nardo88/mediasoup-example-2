import { FC } from 'react'
import cls from './Main.module.scss'

interface MainProps {
  className?: string
}

export const Main: FC<MainProps> = () => {
  return <div className={cls.Main}>ViewTranslation</div>
}
