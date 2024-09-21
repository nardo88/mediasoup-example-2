import { FC, useEffect, useState } from 'react'
import cls from './ShareLink.module.scss'
import { classNames } from '@shared/helpers/classNames'
import { Text, TextVariants } from '@shared/ui/Text/Text'
import { Lock } from '@shared/ui/icons/Lock'

interface ShareLinkProps {
  className?: string
}

export const ShareLink: FC<ShareLinkProps> = (props) => {
  const { className } = props
  const [url, setUrl] = useState('')

  useEffect(() => {
    setUrl(`${location.origin}${location.pathname}`)
  }, [])
  return (
    <div className={classNames(cls.ShareLink, {}, [className])}>
      <Text variant={TextVariants.LIGHT}>
        Поделитесь ссылкой, чтобы начать встречу
      </Text>
      <div className={cls.linkWrapper}>
        <Lock />
        <Text>{url}</Text>
      </div>
    </div>
  )
}
