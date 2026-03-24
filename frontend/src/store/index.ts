import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Lang } from '../i18n'

interface User {
  id: string; phone: string; name?: string; role: 'resident' | 'executor' | 'admin';
  building_id?: string; entrance?: number; apartment?: string; lang?: string;
}

interface Store {
  token: string | null
  user: User | null
  lang: Lang
  notifications: any[]
  setAuth: (token: string, user: User) => void
  logout: () => void
  setLang: (lang: Lang) => void
  setNotifications: (n: any[]) => void
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      token: null, user: null, lang: 'ru', notifications: [],
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      setLang: (lang) => set({ lang }),
      setNotifications: (notifications) => set({ notifications }),
    }),
    { name: 'osi-store' }
  )
)
