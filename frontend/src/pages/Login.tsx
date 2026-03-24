import { useState } from 'react'
import { useStore } from '../store'
import { authApi } from '../api'
import { t } from '../i18n'

export default function Login() {
  const { lang, setAuth, setLang } = useStore()
  const [phone, setPhone] = useState('+7')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const sendOtp = async () => {
    setLoading(true); setError('')
    try {
      await authApi.sendOtp(phone)
      setStep('code')
    } catch { setError('Ошибка отправки кода') }
    setLoading(false)
  }

  const verifyOtp = async () => {
    setLoading(true); setError('')
    try {
      const { data } = await authApi.verifyOtp(phone, code)
      setAuth(data.token, data.user)
    } catch { setError('Неверный код') }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ОСИ Платформа</h1>
            <p className="text-gray-500 text-sm mt-1">{t(lang, 'login')}</p>
          </div>
          <button onClick={() => setLang(lang === 'ru' ? 'kz' : 'ru')}
            className="text-sm font-medium text-blue-600 border border-blue-200 px-3 py-1 rounded-lg hover:bg-blue-50">
            {t(lang, 'lang')}
          </button>
        </div>

        {step === 'phone' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t(lang, 'phone')}</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+7 700 000 00 00" />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button onClick={sendOtp} disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition">
              {loading ? t(lang, 'loading') : t(lang, 'sendCode')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">Код отправлен на {phone}</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t(lang, 'enterCode')}</label>
              <input type="text" value={code} onChange={e => setCode(e.target.value)}
                maxLength={6} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-2xl text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="000000" />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button onClick={verifyOtp} disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition">
              {loading ? t(lang, 'loading') : t(lang, 'verify')}
            </button>
            <button onClick={() => setStep('phone')} className="w-full text-gray-500 text-sm hover:text-gray-700">
              ← Изменить номер
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
