import { useEffect } from 'react'
import { useStore } from '../store'
import { notificationsApi } from '../api'
import { t } from '../i18n'

export default function Notifications() {
  const { lang, notifications, setNotifications } = useStore()

  useEffect(() => {
    notificationsApi.getAll().then(r => setNotifications(r.data))
  }, [])

  const markRead = async (id: string) => {
    await notificationsApi.markRead(id)
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  const markAll = async () => {
    await notificationsApi.markAllRead()
    setNotifications(notifications.map(n => ({ ...n, is_read: true })))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">{t(lang, 'notifications')}</h2>
        {notifications.some(n => !n.is_read) && (
          <button onClick={markAll} className="text-sm text-blue-600 hover:underline">Прочитать все</button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.map(n => (
          <div key={n.id} onClick={() => !n.is_read && markRead(n.id)}
            className={`bg-white border rounded-xl p-4 cursor-pointer transition
              ${n.is_read ? 'border-gray-200 opacity-60' : 'border-blue-200 shadow-sm'}`}>
            <div className="flex items-start gap-3">
              {!n.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />}
              <div>
                <p className="text-sm font-medium text-gray-800">{lang === 'ru' ? n.title_ru : n.title_kz}</p>
                <p className="text-xs text-gray-500 mt-0.5">{lang === 'ru' ? n.body_ru : n.body_kz}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString('ru')}</p>
              </div>
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="text-center py-10 text-gray-400">{t(lang, 'noData')}</div>
        )}
      </div>
    </div>
  )
}
