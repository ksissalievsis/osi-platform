import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Requests from './pages/Requests'
import NewRequest from './pages/NewRequest'
import RequestDetail from './pages/RequestDetail'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'

function Protected({ children }: { children: React.ReactNode }) {
  const { token } = useStore()
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  const { token } = useStore()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/" element={<Protected><Layout><Dashboard /></Layout></Protected>} />
        <Route path="/requests" element={<Protected><Layout><Requests /></Layout></Protected>} />
        <Route path="/requests/new" element={<Protected><Layout><NewRequest /></Layout></Protected>} />
        <Route path="/requests/:id" element={<Protected><Layout><RequestDetail /></Layout></Protected>} />
        <Route path="/notifications" element={<Protected><Layout><Notifications /></Layout></Protected>} />
        <Route path="/profile" element={<Protected><Layout><Profile /></Layout></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
