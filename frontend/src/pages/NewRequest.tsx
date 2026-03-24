import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useStore } from '../store'
import { requestsApi, categoriesApi } from '../api'
import { t } from '../i18n'

export default function NewRequest() {
  const { lang, user } = useStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [categories, setCategories] = useState<any[]>([])
  const [form, setForm] = useState({ category_id: searchParams.get('category') || '', description: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    categoriesApi.getAll().then(r => setCategories(r.data))
  }, [])

  const submit = async () => {
    if (!form.category_id || !form.description.trim()) { setError('Заполните все поля'); return }
    setLoading(true); setError('')
    try {
      await requestsApi.create({ ...form, building_id: user?.building_id })
      navigate('/requests')
    } catch { setError('Ошибка создания заявки') }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">{t(lang, 'newRequest')}</h2>
        <p className="text-gray-500 text-sm mt-1">Опишите проблему</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t(lang, 'category')}</label>
          <div className="grid grid-cols-3 gap-2">
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setForm(f => ({ ...f, category_id: cat.id }))}
                className={`p-3 rounded-xl border text-center transition
                  ${form.category_id === cat.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="text-xl">{{ elevator: '🛗', intercom: '📱', plumbing: '🔧', repair: '🔨', cleaning: '🧹', outdoor: '🌿' }[cat.icon] || '📋'}</div>
                <div className="text-xs mt-1 text-gray-600">{lang === 'ru' ? cat.name_ru : cat.name_kz}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t(lang, 'description')}</label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={4} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Опишите проблему подробно..." />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button onClick={submit} disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition">
          {loading ? t(lang, 'loading') : t(lang, 'submit')}
        </button>
      </div>
    </div>
  )
}
