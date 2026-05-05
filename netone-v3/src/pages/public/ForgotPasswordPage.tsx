import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../../api/endpoints'
import { useToast } from '../../context/AppContext'
import { Icon } from '../../components/ui/UI'

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const handle = async () => {
    if (!email.trim()) { addToast('Enter your email address', 'error'); return }
    setLoading(true)
    try { await authApi.forgotPassword(email.trim()) } catch {}
    finally { setSent(true); setLoading(false) }
  }
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400, background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-xl)', padding: 36 }}>
        <div className="logo-mark" style={{ marginBottom: 26, cursor: 'pointer' }} onClick={() => navigate('/')}><div className="logo-icon">N</div><div className="display-font" style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)' }}>NetOne Care</div></div>
        {!sent ? (
          <>
            <h3 className="display-font" style={{ fontSize: 24, fontWeight: 900, marginBottom: 5, color: 'var(--text-primary)' }}>RESET PASSWORD</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Enter your email and we'll send a reset link.</p>
            <div className="form-group"><label className="form-label">Email Address</label><input className="form-input" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handle()} autoComplete="email" /></div>
            <button className="btn btn-primary btn-full" style={{ padding: 12 }} onClick={handle} disabled={loading}>{loading ? 'Sending...' : <><Icon name="mail" size={15} /> Send Reset Link</>}</button>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>📧</div>
            <h3 className="display-font" style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>CHECK YOUR EMAIL</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>If an account exists for <strong style={{ color: 'var(--red)' }}>{email}</strong>, a reset link was sent. Check spam too.</p>
          </div>
        )}
        <button className="btn btn-ghost btn-full" style={{ marginTop: 16 }} onClick={() => navigate('/login')}><Icon name="arrow-left" size={14} /> Back to Sign In</button>
      </div>
    </div>
  )
}
