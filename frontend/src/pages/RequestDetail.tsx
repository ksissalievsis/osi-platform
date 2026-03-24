import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useStore } from '../store'
import { requestsApi, usersApi } from '../api'
import { t } from '../i18n'

const statusColors: Record<string, string> = {
  new: 'bg-yellow-100 text-yellow-800', accepted: 'bg-blue-100 text-blue-800',
  assigned: 'bg-purple-100 text-purple-800', in_progress: 'bg-orange-100 text-orange-800',
  done: 'bg-green-100 text-green-800', closed: 'bg-gray-100 text-gray-800',
}
const nextStatuses: Record<string, string[]> = {
  new: ['accepted'], accepted: ['assigned', 'in_progress'], assigned: ['in_progress'],
  in_progress: ['done'], done: ['closed'], closed: []
}

export default function RequestDetail() {
  const { id } = useParams<{ id: string }>()
  const { lang, user } = useStore()
  const [request, setRequest] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [executors, setExecutors] = useState<any[]>([])
  const [selectedExecutor, setSelectedExecutor] = useState('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    if (!id) return
    const [req, hist] = await Promise.all([
      requestsApi.getOne(id).then(r => r.data),
      requestsApi.getHistory(id).then(r => r.data),
    ])
    setRequest(req); setHistory(hist)
    if (user?.role === 'admin') {
      usersApi.getAll().then(r => setExecutors(r.data.filter((u: any) => u.role === 'executor')))
    }
  }

  useEffect(() => { load().finally(() => setLoading(false)) }, [id])

  const changeStatus = async (status: string) => {
    if (!id) return
    await requestsApi.updateStatus(id, status, comment)
    setComment(''); load()
  }

  const assign = async () => {
    if (!id || !selectedExecutor) return
    await requestsApi.assign(id, selectedExecutor)
    load()
  }

  if (loading) return <div className="text-center py-10 text-gray-400">{t(lang, 'loading')}</div>
  if (!request) return <div className="text-center py-10 text-gray-400">{t(lang, 'noData')}</div>

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h2 className="text-lg font-bold text-gray-900">
            {lang === 'ru' ? request.category_ru : request.category_kz}
          </h2>
          <span className={`text-xs px-3 py-1 rounded-full ${statusColors[request.status]}`}>
            {t(lang, `statuses.${request.status}`)}
          </span>
        </div>
        <p className="text-gray-600 text-sm">{request.description}</p>
        <div className="mt-3 space-y-1 text-xs text-gray-400">
          <p>👤 {request.author_name || request.author_phone}</p>
          {request.executor_name && <p>🔧 {request.executor_name}</p>}
          <p>📅 {new Date(request.created_at).toLocaleString('ru')}</p>
        </div>
      </div>

      {/* Assign executor (admin) */}
      {user?.role === 'admin' && request.status !== 'done' && request.status !== 'closed' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
          <h3 className="font-semibold text-gray-700">{t(lang, 'assignExecutor')}</h3>
          <select value={selectedExecutor} onChange={e => setSelectedExecutor(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Выберите исполнителя</option>
            {executors.map(e => <option key={e.id} value={e.id}>{e.name || e.phone}</option>)}
          </select>
          <button onClick={assign} disabled={!selectedExecutor}
            className="w-full bg-blue-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {t(lang, 'assignExecutor')}
          </button>
        </div>
      )}

      {/* Change status */}
      {(user?.role === 'executor' || user?.role === 'admin') && nextStatuses[request.status]?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
          <h3 className="font-semibold text-gray-700">{t(lang, 'changeStatus')}</h3>
          <textarea value={comment} onChange={e => setComment(e.target.value)}
            placeholder="Комментарий (опционально)" rows={2}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          <div className="flex gap-2 flex-wrap">
            {nextStatuses[request.status].map(s => (
              <button key={s} onClick={() => changeStatus(s)}
                className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-xl text-sm font-medium hover:bg-blue-700">
                → {t(lang, `statuses.${s}`)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-700 mb-3">{t(lang, 'history')}</h3>
        <div className="space-y-2">
          {history.map((h, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-gray-700">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs mr-1 ${statusColors[h.old_status]}`}>{t(lang, `statuses.${h.old_status}`)}</span>
                  → <span className={`inline-block px-2 py-0.5 rounded-full text-xs ml-1 ${statusColors[h.new_status]}`}>{t(lang, `statuses.${h.new_status}`)}</span>
                </p>
                {h.comment && <p className="text-gray-500 text-xs mt-0.5">{h.comment}</p>}
                <p className="text-gray-400 text-xs">{new Date(h.created_at).toLocaleString('ru')}</p>
              </div>
            </div>
          ))}
          {history.length === 0 && <p className="text-gray-400 text-sm">{t(lang, 'noData')}</p>}
        </div>
      </div>
    </div>
  )
}
