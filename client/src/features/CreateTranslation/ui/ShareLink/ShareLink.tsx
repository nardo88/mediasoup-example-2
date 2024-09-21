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
  const [isCoppied, setIsCoppied] = useState(false)

  const clickHandler = () => {
    navigator.clipboard.writeText(url).then(() => {
      setIsCoppied(true)
    })
  }

  useEffect(() => {
    setUrl(`${location.origin}${location.pathname}`)
  }, [])

  useEffect(() => {
    let need = true

    if (isCoppied) {
      setTimeout(() => {
        if (need) {
          setIsCoppied(false)
        }
      }, 3000)
    }

    return () => {
      need = false
    }
  }, [isCoppied])

  return (
    <div className={classNames(cls.ShareLink, {}, [className])}>
      <Text variant={TextVariants.LIGHT}>
        Поделитесь ссылкой, чтобы начать встречу
      </Text>
      <div className={cls.linkWrapper}>
        <Lock />
        <Text>{url}</Text>
        <span>|</span>
        <div className={cls.copy} onClick={clickHandler}>
          <Text
            className={classNames(cls.copyText, {
              [cls.isCoppied]: isCoppied,
            })}>
            Копировать
          </Text>
        </div>
      </div>
    </div>
  )
}
