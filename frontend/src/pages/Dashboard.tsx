import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store'
import { requestsApi, categoriesApi } from '../api'
import { t } from '../i18n'

const statusColors: Record<string, string> = {
  new: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-blue-100 text-blue-800',
  assigned: 'bg-purple-100 text-purple-800',
  in_progress: 'bg-orange-100 text-orange-800',
  done: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
}

export default function Dashboard() {
  const { user, lang } = useStore()
  const [requests, setRequests] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      requestsApi.getAll().then(r => setRequests(r.data)).catch(() => {}),
      categoriesApi.getAll().then(r => setCategories(r.data)).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  const stats = {
    new: requests.filter(r => r.status === 'new').length,
    in_progress: requests.filter(r => r.status === 'in_progress').length,
    done: requests.filter(r => r.status === 'done').length,
  }

  if (loading) return <div className="flex items-center justify-center h-40 text-gray-400">{t(lang, 'loading')}</div>

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 text-white">
        <p className="text-blue-100 text-sm">{t(lang, user?.role || 'resident')}</p>
        <h2 className="text-xl font-bold mt-1">{user?.name || user?.phone}</h2>
        {user?.role === 'resident' && (
          <Link to="/requests/new"
            className="mt-4 inline-block bg-white text-blue-600 font-medium px-4 py-2 rounded-xl text-sm hover:bg-blue-50 transition">
            + {t(lang, 'newRequest')}
          </Link>
        )}
      </div>

      {/* Stats (admin/executor) */}
      {user?.role !== 'resident' && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: t(lang, 'statuses.new'), value: stats.new, color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
            { label: t(lang, 'statuses.in_progress'), value: stats.in_progress, color: 'bg-orange-50 border-orange-200 text-orange-700' },
            { label: t(lang, 'statuses.done'), value: stats.done, color: 'bg-green-50 border-green-200 text-green-700' },
          ].map(s => (
            <div key={s.label} className={`${s.color} border rounded-xl p-3 text-center`}>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Categories (resident) */}
      {user?.role === 'resident' && (
        <div>
          <h3 className="font-semibold text-gray-700 mb-3">{t(lang, 'categories')}</h3>
          <div className="grid grid-cols-3 gap-3">
            {categories.map(cat => (
              <Link key={cat.id} to={`/requests/new?category=${cat.id}`}
                className="bg-white border border-gray-200 rounded-xl p-3 text-center hover:border-blue-300 hover:shadow-sm transition">
                <div className="text-2xl mb-1">
                  {{ elevator: '🛗', intercom: '📱', plumbing: '🔧', repair: '🔨', cleaning: '🧹', outdoor: '🌿' }[cat.icon] || '📋'}
                </div>
                <div className="text-xs text-gray-600">{lang === 'ru' ? cat.name_ru : cat.name_kz}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent requests */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-700">{t(lang, 'requests')}</h3>
          <Link to="/requests" className="text-sm text-blue-600 hover:underline">Все →</Link>
        </div>
        <div className="space-y-2">
          {requests.slice(0, 5).map(req => (
            <Link key={req.id} to={`/requests/${req.id}`}
              className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {lang === 'ru' ? req.category_ru : req.category_kz}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{req.description}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${statusColors[req.status]}`}>
                  {t(lang, `statuses.${req.status}`)}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-2">{new Date(req.created_at).toLocaleDateString('ru')}</p>
            </Link>
          ))}
          {requests.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">{t(lang, 'noData')}</div>
          )}
        </div>
      </div>
    </div>
  )
}
