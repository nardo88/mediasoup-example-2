import { FC } from 'react'
import cls from './ContentSection.module.scss'
import { classNames } from '@shared/helpers/classNames'
import { UserIcon } from '@shared/ui/icons/UserIcon'
import { Text } from '@shared/ui/Text/Text'
import { ShareLink } from '../ShareLink/ShareLink'
import { CurrentAreaType } from '../../types'
import { Video } from '../Video/Video'

interface ContentSectionProps {
  className?: string
  cameraEnabled?: boolean
  isOnline: boolean
  current: CurrentAreaType
  start: () => void
  stream: null | MediaStream
}

export const ContentSection: FC<ContentSectionProps> = (props) => {
  const {
    className,
    cameraEnabled = false,
    current,
    isOnline,
    start,
    stream,
  } = props

  return (
    <div
      className={classNames(
        cls.ContentSection,
        { [cls.cameraEnabled]: !cameraEnabled },
        [className]
      )}>
      <div className={cls.video}>
        {!cameraEnabled && (
          <div className={cls.noCamera}>
            <UserIcon size={130} />
            <Text className={cls.userName}>Зайцев Виктор (Вы)</Text>
          </div>
        )}
      </div>
      <div className={cls.additional}>
        {current === 'link' && <ShareLink isOnline={isOnline} start={start} />}
        {current === 'video' && <Video stream={stream} />}
      </div>
    </div>
  )
}
