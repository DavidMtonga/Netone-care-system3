import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { authApi } from '../api/endpoints'

// ── THEME ──
type Theme = 'dark' | 'light'
interface ThemeCtx { theme: Theme; toggle: () => void }
const ThemeCtx = createContext<ThemeCtx>({ theme: 'dark', toggle: () => {} })

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('nc_theme') as Theme) ?? 'dark')
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('nc_theme', theme)
  }, [theme])
  const toggle = useCallback(() => setTheme(t => t === 'dark' ? 'light' : 'dark'), [])
  return <ThemeCtx.Provider value={{ theme, toggle }}>{children}</ThemeCtx.Provider>
}
export const useTheme = () => useContext(ThemeCtx)

// ── AUTH ──
export interface User { id: number; first_name: string; last_name: string; email: string; phone?: string; role: string; status: string }
interface AuthCtx { user: User | null; token: string | null; isAuthenticated: boolean; isStaff: boolean; login: (email: string, pw: string, staff?: boolean) => Promise<void>; logout: () => void; setAuth: (user: User, token: string, staff?: boolean) => void }
const AuthCtx = createContext<AuthCtx | null>(null)
const STAFF_ROLES = ['sales','engineer','admin','superadmin']

const stored = () => {
  try {
    const su = sessionStorage.getItem('nc_user'), st = sessionStorage.getItem('nc_token')
    if (su && st) return { user: JSON.parse(su) as User, token: st }
    const lu = localStorage.getItem('nc_user'), lt = localStorage.getItem('nc_token')
    if (lu && lt) return { user: JSON.parse(lu) as User, token: lt }
  } catch {}
  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const init = stored()
  const [user, setUser] = useState<User | null>(init?.user ?? null)
  const [token, setToken] = useState<string | null>(init?.token ?? null)

  const setAuth = useCallback((u: User, t: string, staff = false) => {
    setUser(u); setToken(t)
    if (staff || STAFF_ROLES.includes(u.role)) {
      sessionStorage.setItem('nc_user', JSON.stringify(u)); sessionStorage.setItem('nc_token', t)
    } else {
      localStorage.setItem('nc_user', JSON.stringify(u)); localStorage.setItem('nc_token', t)
    }
  }, [])

  const login = useCallback(async (email: string, pw: string, staff = false) => {
    const res = await authApi.login(email, pw)
    setAuth(res.data.data.user, res.data.data.token, staff)
  }, [setAuth])

  const logout = useCallback(() => {
    setUser(null); setToken(null)
    sessionStorage.removeItem('nc_user'); sessionStorage.removeItem('nc_token')
    localStorage.removeItem('nc_user'); localStorage.removeItem('nc_token')
  }, [])

  return <AuthCtx.Provider value={{ user, token, isAuthenticated: !!user && !!token, isStaff: user ? STAFF_ROLES.includes(user.role) : false, login, logout, setAuth }}>{children}</AuthCtx.Provider>
}
export const useAuth = () => { const c = useContext(AuthCtx); if (!c) throw new Error('useAuth outside AuthProvider'); return c }

// ── TOAST ──
type TType = 'success'|'error'|'info'|'warning'
interface Toast { id: number; message: string; type: TType }
interface ToastCtx { addToast: (msg: string, type?: TType) => void }
const ToastCtx = createContext<ToastCtx | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const addToast = useCallback((message: string, type: TType = 'info') => {
    const id = Date.now()
    setToasts(p => [...p.slice(-3), { id, message, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 5000)
  }, [])
  const icons: Record<TType,string> = { success:'✓', error:'✕', warning:'⚠', info:'ℹ' }
  return (
    <ToastCtx.Provider value={{ addToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`} onClick={() => setToasts(p => p.filter(x => x.id !== t.id))}>
            <span>{icons[t.type]}</span>{t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}
export const useToast = () => { const c = useContext(ToastCtx); if (!c) throw new Error('useToast outside ToastProvider'); return c }
