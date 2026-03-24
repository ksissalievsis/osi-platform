import { useState } from 'react'
import { useStore } from '../store'
import { usersApi } from '../api'
import { t } from '../i18n'

export default function Profile() {
  const { user, lang, setAuth, token, setLang } = useStore()
  const [form, setForm] = useState({ name: user?.name || '', entrance: user?.entrance || '', apartment: user?.apartment || '' })
  const [saved, setSaved] = useState(false)

  const save = async () => {
    await usersApi.updateMe(form)
    const updated = await usersApi.getMe()
    setAuth(token!, updated.data)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">{t(lang, 'profile')}</h2>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl font-bold">
            {user?.phone?.slice(-2)}
          </div>
          <div>
            <p className="font-medium text-gray-800">{user?.phone}</p>
            <p className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
              {t(lang, user?.role || 'resident')}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t(lang, 'name')}</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t(lang, 'entrance')}</label>
            <input type="number" value={form.entrance} onChange={e => setForm(f => ({ ...f, entrance: e.target.value }))}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t(lang, 'apartment')}</label>
            <input value={form.apartment} onChange={e => setForm(f => ({ ...f, apartment: e.target.value }))}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Язык / Тіл</label>
          <div className="flex gap-2">
            {(['ru', 'kz'] as const).map(l => (
              <button key={l} onClick={() => setLang(l)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium border transition
                  ${lang === l ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                {l === 'ru' ? '🇷🇺 Русский' : '🇰🇿 Қазақша'}
              </button>
            ))}
          </div>
        </div>

        <button onClick={save}
          className={`w-full py-3 rounded-xl font-medium transition ${saved ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
          {saved ? '✓ Сохранено' : t(lang, 'save')}
        </button>
      </div>
    </div>
  )
}
