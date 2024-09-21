import { FC, useState } from 'react'
import cls from './Main.module.scss'
import { ControlSection } from '../ControlSection/ControlSection'
import { ContentSection } from '../ContentSection/ContentSection'
import { CurrentAreaType } from '@features/CreateTranslation/types'

interface MainProps {
  className?: string
}

export const Main: FC<MainProps> = () => {
  const [current, _setCurrent] = useState<CurrentAreaType>('link')
  return (
    <div className={cls.Main}>
      <ContentSection current={current} />
      <ControlSection />
    </div>
  )
}
