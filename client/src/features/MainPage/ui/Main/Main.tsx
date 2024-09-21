import { FC, FormEvent, useState } from 'react'
import cls from './Main.module.scss'
import Button from '@shared/ui/Button/Button'
import { Text, TextVariants } from '@shared/ui/Text/Text'
import { Input } from '@shared/ui/Input/Input'
import { useNavigate } from 'react-router-dom'
import { createId } from '@shared/helpers/createId'

export const Main: FC = () => {
  const [value, setValue] = useState('')
  const [isValid, setIsValid] = useState(true)
  const navigate = useNavigate()

  const submitHandler = (e: FormEvent) => {
    e.preventDefault()
    setIsValid(true)
    if (!value.trim()) {
      return setIsValid(false)
    }
    navigate(`/consume/${value}`)
  }

  const createTranslation = () => navigate(`/produce/${createId()}`)

  return (
    <div className={cls.Main}>
      <form className={cls.form} onSubmit={submitHandler}>
        <Text variant={TextVariants.BASE_22}>Присоединиться к трансляции</Text>
        <Input
          value={value}
          onChange={setValue}
          label="ID трансляции"
          errorText={
            !isValid && !value.trim()
              ? 'Укажите идентификатор трансляции'
              : null
          }
        />
        <Button type="submit">Присоединиться</Button>
      </form>
      <Text className={cls.or}>
        <span>или</span>
      </Text>
      <Button onClick={createTranslation}>Создать трасляцию</Button>
    </div>
  )
}
