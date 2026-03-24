import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { t } from '../i18n'

const icons: Record<string, string> = {
  dashboard: '🏠', requests: '📋', newRequest: '➕', notifications: '🔔',
  profile: '👤', users: '👥', categories: '🗂️', logout: '🚪'
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, lang, setLang, logout, notifications } = useStore()
  const location = useLocation()
  const navigate = useNavigate()

  const unread = notifications.filter(n => !n.is_read).length

  const navItems = [
    { path: '/', label: t(lang, 'dashboard'), icon: icons.dashboard },
    ...(user?.role === 'resident' ? [
      { path: '/requests/new', label: t(lang, 'newRequest'), icon: icons.newRequest },
      { path: '/requests', label: t(lang, 'myRequests'), icon: icons.requests },
    ] : []),
    ...(user?.role === 'executor' ? [
      { path: '/requests', label: t(lang, 'assignedToMe'), icon: icons.requests },
    ] : []),
    ...(user?.role === 'admin' ? [
      { path: '/requests', label: t(lang, 'allRequests'), icon: icons.requests },
      { path: '/users', label: t(lang, 'users'), icon: icons.users },
      { path: '/categories', label: t(lang, 'categories'), icon: icons.categories },
    ] : []),
    { path: '/notifications', label: t(lang, 'notifications'), icon: icons.notifications },
    { path: '/profile', label: t(lang, 'profile'), icon: icons.profile },
  ]

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <Link to="/" className="text-lg font-bold text-blue-600">ОСИ</Link>
        <div className="flex items-center gap-3">
          <button onClick={() => setLang(lang === 'ru' ? 'kz' : 'ru')}
            className="text-xs font-medium text-gray-500 border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-50">
            {t(lang, 'lang')}
          </button>
          <Link to="/notifications" className="relative text-gray-500 hover:text-blue-600">
            🔔
            {unread > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{unread}</span>}
          </Link>
          <span className="text-sm text-gray-600 hidden sm:block">{user?.phone}</span>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full hidden sm:block">{t(lang, user?.role || 'resident')}</span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 pb-24">
        {children}
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 z-10">
        {navItems.slice(0, 5).map(item => (
          <Link key={item.path} to={item.path}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-xs transition
              ${location.pathname === item.path ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
            <span className="text-xl">{item.icon}</span>
            <span className="hidden sm:block">{item.label}</span>
          </Link>
        ))}
        <button onClick={handleLogout} className="flex flex-col items-center gap-0.5 px-2 py-1 text-xs text-gray-400 hover:text-red-500">
          <span className="text-xl">{icons.logout}</span>
          <span className="hidden sm:block">{t(lang, 'logout')}</span>
        </button>
      </nav>
    </div>
  )
}
