import { FC } from 'react'
import cls from './ContentSection.module.scss'
import { classNames } from '@shared/helpers/classNames'
import { UserIcon } from '@shared/ui/icons/UserIcon'
import { Text } from '@shared/ui/Text/Text'
import { ShareLink } from '../ShareLink/ShareLink'
import { CurrentAreaType } from '../../types'

interface ContentSectionProps {
  className?: string
  cameraEnabled?: boolean
  current: CurrentAreaType
}

export const ContentSection: FC<ContentSectionProps> = (props) => {
  const { className, cameraEnabled = false, current } = props

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
        {current === 'link' && <ShareLink />}
      </div>
    </div>
  )
}
