import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, useToast, useTheme } from '../../context/AppContext'
import { Icon } from '../../components/ui/UI'

const REDIRECTS: Record<string, string> = { sales: '/sales', engineer: '/engineer', admin: '/admin', superadmin: '/admin' }

export function StaffLoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { addToast } = useToast()
  const { theme, toggle } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handle = async () => {
    if (!email.trim() || !password) { addToast('Please enter your credentials', 'error'); return }
    setLoading(true)
    try {
      await login(email.trim().toLowerCase(), password, true)
      const u = JSON.parse(sessionStorage.getItem('nc_user') ?? '{}')
      if (!['sales', 'engineer', 'admin', 'superadmin'].includes(u?.role)) {
        addToast('Access denied. Staff accounts only.', 'error')
        sessionStorage.clear(); setLoading(false); return
      }
      addToast(`Welcome, ${u.first_name}!`, 'success')
      navigate(REDIRECTS[u.role] ?? '/admin')
    } catch (err: any) {
      addToast(err.response?.data?.message ?? 'Login failed', 'error')
    } finally { setLoading(false) }
  }

  return (
    <div className="staff-login-page">
      <div style={{ position: 'absolute', top: 16, right: 20 }}>
        <button className="theme-btn" onClick={toggle}>{theme === 'dark' ? '☀️' : '🌙'}</button>
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 40%, rgba(232,0,28,0.04) 0%, transparent 60%)', pointerEvents: 'none' }} />
      <div className="staff-login-card animate-fadeUp">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div className="logo-mark">
            <div className="logo-icon">N</div>
            <div>
              <div className="display-font" style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)' }}>NetOne Care</div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Staff Portal</div>
            </div>
          </div>
          <Icon name="lock" size={18} color="var(--text-muted)" />
        </div>
        <div className="staff-badge"><Icon name="shield" size={11} color="var(--red)" /> Restricted — Authorised Staff Only</div>
        <h3 className="display-font" style={{ fontSize: 26, fontWeight: 900, marginBottom: 5, color: 'var(--text-primary)' }}>STAFF SIGN IN</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 22 }}>Enter your NetOne staff credentials</p>
        <div className="form-group">
          <label className="form-label">Staff Email</label>
          <input className="form-input" type="email" placeholder="name@netone.co.zw" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handle()} autoComplete="username" autoCapitalize="none" />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <div style={{ position: 'relative' }}>
            <input className="form-input" type={showPw ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} style={{ paddingRight: 44 }} onKeyDown={e => e.key === 'Enter' && handle()} autoComplete="current-password" />
            <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, display: 'flex' }}><Icon name="eye" size={15} /></button>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
          <span style={{ fontSize: 12, color: 'var(--red)', cursor: 'pointer', fontWeight: 600 }} onClick={() => navigate('/forgot-password')}>Forgot password?</span>
        </div>
        <button className="btn btn-primary btn-full" style={{ padding: 13, fontSize: 15 }} onClick={handle} disabled={loading}>
          {loading ? <><div className="spinner" style={{ width: 17, height: 17 }} /> Signing in...</> : <><Icon name="lock" size={15} /> Secure Sign In</>}
        </button>
        <div style={{ marginTop: 20, padding: 12, background: 'rgba(232,0,28,0.06)', border: '1px solid rgba(232,0,28,0.15)', borderRadius: 'var(--radius)', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          🔒 Restricted area. Unauthorised access is prohibited and logged.
        </div>
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 16 }}>
          Customer? <span style={{ color: 'var(--red)', cursor: 'pointer', fontWeight: 600 }} onClick={() => navigate('/login')}>Customer Portal →</span>
        </p>
      </div>
    </div>
  )
}
