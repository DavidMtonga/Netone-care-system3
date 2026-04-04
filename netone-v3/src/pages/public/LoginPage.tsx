import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, useToast, useTheme } from '../../context/AppContext'
import { Icon } from '../../components/ui/UI'

const REDIRECTS: Record<string, string> = { client: '/dashboard', sales: '/sales', engineer: '/engineer', admin: '/admin', superadmin: '/admin' }

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { addToast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handle = async () => {
    if (!email.trim() || !password) { addToast('Please enter your email and password', 'error'); return }
    setLoading(true)
    try {
      await login(email.trim().toLowerCase(), password, false)
      const u = JSON.parse(localStorage.getItem('nc_user') ?? '{}')
      addToast(`Welcome back, ${u?.first_name ?? ''}!`, 'success')
      navigate(REDIRECTS[u?.role ?? 'client'])
    } catch (err: any) {
      addToast(err.response?.data?.message ?? 'Login failed. Check your credentials.', 'error')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-shell">
      <div className="auth-left">
        <div className="auth-left-pattern" />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 340, width: '100%' }}>
          <div className="logo-mark" style={{ marginBottom: 36, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <div style={{ width: 48, height: 48, background: 'white', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 22, color: 'var(--red)', flexShrink: 0 }}>N</div>
            <div>
              <div className="display-font" style={{ fontSize: 24, fontWeight: 900, color: 'white' }}>NetOne Care</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Support Portal</div>
            </div>
          </div>
          <h2 className="display-font" style={{ fontSize: 'clamp(36px,5vw,54px)', fontWeight: 900, lineHeight: 0.9, marginBottom: 16, color: 'white' }}>
            DEVICE<br />SUPPORT<br /><span style={{ color: 'rgba(255,255,255,0.5)' }}>SIMPLIFIED.</span>
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, marginBottom: 24 }}>Report faults and get expert help for all your NetOne products.</p>
          {[['🔒', 'Secure & encrypted account'], ['📧', 'Email notifications at every step'], ['🤖', 'AI-powered troubleshooting']].map(([ic, tx]) => (
            <div key={tx} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 8 }}><span>{ic}</span>{tx}</div>
          ))}
        </div>
      </div>
      <div className="auth-right">
        <div style={{ marginBottom: 28 }}>
          <h3 className="display-font" style={{ fontSize: 28, fontWeight: 900, marginBottom: 5, color: 'var(--text-primary)' }}>CUSTOMER SIGN IN</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sign in to your NetOne Care account</p>
        </div>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input className="form-input" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handle()} autoComplete="email" autoCapitalize="none" spellCheck={false} />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <div style={{ position: 'relative' }}>
            <input className="form-input" type={showPw ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} style={{ paddingRight: 44 }} onKeyDown={e => e.key === 'Enter' && handle()} autoComplete="current-password" />
            <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, display: 'flex' }}><Icon name="eye" size={16} /></button>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
          <span style={{ fontSize: 13, color: 'var(--red)', cursor: 'pointer', fontWeight: 600 }} onClick={() => navigate('/forgot-password')}>Forgot password?</span>
        </div>
        <button className="btn btn-primary btn-full" style={{ padding: 13, fontSize: 15 }} onClick={handle} disabled={loading}>
          {loading ? <><div className="spinner" style={{ width: 17, height: 17 }} /> Signing in...</> : 'Sign In'}
        </button>
        <div className="hr-label" style={{ margin: '20px 0' }}><span>New to NetOne Care?</span></div>
        <button className="btn btn-secondary btn-full" onClick={() => navigate('/register')}>Create Free Account</button>
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 20 }}>
          NetOne staff? <span style={{ color: 'var(--red)', cursor: 'pointer', fontWeight: 700 }} onClick={() => navigate('/staff/login')}>Staff Portal →</span>
        </p>
      </div>
    </div>
  )
}
