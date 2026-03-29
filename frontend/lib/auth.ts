import type { User } from '@/types'

export const auth = {
  setToken:    (t: string) => localStorage.setItem('pm_token', t),
  getToken:    (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('pm_token')
  },
  setUser:     (u: User) => localStorage.setItem('pm_user', JSON.stringify(u)),
  getUser:     (): User | null => {
    if (typeof window === 'undefined') return null
    try { return JSON.parse(localStorage.getItem('pm_user') || 'null') }
    catch { return null }
  },
  isLoggedIn:  (): boolean => {
    if (typeof window === 'undefined') return false
    return !!localStorage.getItem('pm_token')
  },
  logout: () => {
    localStorage.removeItem('pm_token')
    localStorage.removeItem('pm_user')
    window.location.href = '/'
  },
}
