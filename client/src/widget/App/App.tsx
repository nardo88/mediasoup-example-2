import { FC } from 'react'
import './App.scss'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ViewTranslation } from '@features/ViewTranslation'
import { CreateTranslation } from '@features/CreateTranslation'
import { MainPage } from '@features/MainPage'
import { Example } from '@features/Example/Example'

export const App: FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/example" element={<Example />} />
      <Route path="/consume/:roomId" element={<ViewTranslation />} />
      <Route path="/produce/:roomId" element={<CreateTranslation />} />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  )
}
