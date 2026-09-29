import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { RequireAuth } from './components/RequireAuth'
import { AuthPage } from './pages/AuthPage'
import { Home } from './pages/Home'
import { Invite } from './pages/Invite'
import { Story } from './pages/Story'
import { MemoriesWall } from './pages/MemoriesWall'
import { FuturePage } from './pages/FuturePage'
import { LettersPage } from './pages/LettersPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/app" replace />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route
        path="/invite/:token"
        element={
          <RequireAuth>
            <Invite />
          </RequireAuth>
        }
      />
      <Route
        path="/app"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Home />} />
        <Route path="story" element={<Story />} />
        <Route path="memories" element={<MemoriesWall />} />
        <Route path="future" element={<FuturePage />} />
        <Route path="letters" element={<LettersPage />} />
      </Route>
    </Routes>
  )
}
