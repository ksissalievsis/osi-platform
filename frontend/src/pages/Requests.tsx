import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store'
import { requestsApi } from '../api'
import { t } from '../i18n'

const statusColors: Record<string, string> = {
  new: 'bg-yellow-100 text-yellow-800', accepted: 'bg-blue-100 text-blue-800',
  assigned: 'bg-purple-100 text-purple-800', in_progress: 'bg-orange-100 text-orange-800',
  done: 'bg-green-100 text-green-800', closed: 'bg-gray-100 text-gray-800',
}
const statuses = ['', 'new', 'accepted', 'assigned', 'in_progress', 'done', 'closed']

export default function Requests() {
  const { lang, user } = useStore()
  const [requests, setRequests] = useState<any[]>([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    requestsApi.getAll(filter ? { status: filter } : {})
      .then(r => setRequests(r.data))
      .finally(() => setLoading(false))
  }, [filter])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">{t(lang, 'requests')}</h2>
        {user?.role === 'resident' && (
          <Link to="/requests/new" className="bg-blue-600 text-white text-sm px-4 py-2 rounded-xl hover:bg-blue-700">
            + {t(lang, 'newRequest')}
          </Link>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`whitespace-nowrap text-xs px-3 py-1.5 rounded-full border transition
              ${filter === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
            {s ? t(lang, `statuses.${s}`) : 'Все'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">{t(lang, 'loading')}</div>
      ) : (
        <div className="space-y-2">
          {requests.map(req => (
            <Link key={req.id} to={`/requests/${req.id}`}
              className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">
                    {lang === 'ru' ? req.category_ru : req.category_kz}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{req.description}</p>
                  {user?.role !== 'resident' && req.author_name && (
                    <p className="text-xs text-gray-400 mt-1">👤 {req.author_name || req.author_phone}</p>
                  )}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${statusColors[req.status]}`}>
                  {t(lang, `statuses.${req.status}`)}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-2">{new Date(req.created_at).toLocaleString('ru')}</p>
            </Link>
          ))}
          {requests.length === 0 && (
            <div className="text-center py-10 text-gray-400">{t(lang, 'noData')}</div>
          )}
        </div>
      )}
    </div>
  )
}
