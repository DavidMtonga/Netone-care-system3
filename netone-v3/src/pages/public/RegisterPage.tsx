import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, useToast } from '../../context/AppContext'
import { authApi } from '../../api/endpoints'
import { Icon } from '../../components/ui/UI'

export function RegisterPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuth()
  const { addToast } = useToast()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirm: '' })
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [pending, setPending] = useState('')
  const refs = useRef<(HTMLInputElement | null)[]>([])

  const handleOtp = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return
    const n = [...otp]; n[i] = val.slice(-1); setOtp(n)
    if (val && i < 5) refs.current[i + 1]?.focus()
  }
  const handleKey = (i: number, e: React.KeyboardEvent) => { if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus() }
  const handlePaste = (e: React.ClipboardEvent) => { e.preventDefault(); const d = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6); if (d.length === 6) { setOtp(d.split('')); refs.current[5]?.focus() } }

  const sendCode = async () => {
    if (!form.firstName.trim()) { addToast('First name required', 'error'); return }
    if (!form.email.trim() || !form.email.includes('@')) { addToast('Valid email required', 'error'); return }
    if (form.password.length < 8) { addToast('Password min 8 characters', 'error'); return }
    if (form.password !== form.confirm) { addToast('Passwords do not match', 'error'); return }
    setLoading(true)
    try {
      await authApi.register({ firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim().toLowerCase(), phone: form.phone.trim() || undefined, password: form.password })
      setPending(form.email.trim().toLowerCase())
      addToast('Verification code sent! Check your email.', 'success'); setStep(2)
    } catch (err: any) { addToast(err.response?.data?.message ?? 'Registration failed', 'error') }
    finally { setLoading(false) }
  }

  const verify = async () => {
    const code = otp.join('')
    if (code.length < 6) { addToast('Enter the complete 6-digit code', 'error'); return }
    setLoading(true)
    try {
      const res = await authApi.verifyOtp(pending, code)
      const { user, token } = res.data.data
      setAuth(user, token, false)
      addToast('Account created! Welcome to NetOne Care.', 'success'); navigate('/dashboard')
    } catch (err: any) { addToast(err.response?.data?.message ?? 'Invalid code', 'error'); setOtp(['', '', '', '', '', '']); refs.current[0]?.focus() }
    finally { setLoading(false) }
  }

  const resend = async () => {
    setLoading(true)
    try { await authApi.register({ firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: pending, phone: form.phone || undefined, password: form.password }); addToast('Code resent!', 'info'); setOtp(['', '', '', '', '', '']) }
    catch { addToast('Failed to resend', 'error') } finally { setLoading(false) }
  }

  if (step === 2) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420, background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-xl)', padding: 36 }}>
        <div className="logo-mark" style={{ marginBottom: 24, cursor: 'pointer' }} onClick={() => navigate('/')}><div className="logo-icon">N</div><div className="display-font" style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)' }}>NetOne Care</div></div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>📧</div>
          <h3 className="display-font" style={{ fontSize: 24, fontWeight: 900, marginBottom: 5, color: 'var(--text-primary)' }}>VERIFY YOUR EMAIL</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Code sent to <strong style={{ color: 'var(--red)' }}>{pending}</strong></p>
          <div className="info-box" style={{ textAlign: 'left', margin: '12px 0' }}><span>ℹ️</span><span style={{ fontSize: 12 }}>Check inbox and spam. Expires in 10 min. If no email arrives, check backend terminal for code.</span></div>
          <div className="otp-inputs" onPaste={handlePaste}>
            {otp.map((v, i) => <input key={i} ref={el => { refs.current[i] = el }} className={`otp-box ${v ? 'filled' : ''}`} maxLength={1} value={v} inputMode="numeric" onChange={e => handleOtp(i, e.target.value)} onKeyDown={e => handleKey(i, e)} />)}
          </div>
          <button className="btn btn-primary btn-full" style={{ padding: 12, fontSize: 15, marginBottom: 10 }} onClick={verify} disabled={loading}>{loading ? 'Verifying...' : <><Icon name="check" size={15} /> Verify &amp; Create Account</>}</button>
          <button className="btn btn-ghost btn-full" style={{ fontSize: 12 }} onClick={resend} disabled={loading}>Resend Code</button>
          <button className="btn btn-ghost btn-full" style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }} onClick={() => { setStep(1); setOtp(['', '', '', '', '', '']) }}>← Go Back</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="auth-shell">
      <div className="auth-left">
        <div className="auth-left-pattern" />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 340, width: '100%' }}>
          <div className="logo-mark" style={{ marginBottom: 32, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <div style={{ width: 44, height: 44, background: 'white', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 20, color: 'var(--red)', flexShrink: 0 }}>N</div>
            <div className="display-font" style={{ fontSize: 22, fontWeight: 900, color: 'white' }}>NetOne Care</div>
          </div>
          <h2 className="display-font" style={{ fontSize: 'clamp(34px,5vw,52px)', fontWeight: 900, lineHeight: 0.9, marginBottom: 14, color: 'white' }}>JOIN<br />NETONE<br /><span style={{ color: 'rgba(255,255,255,0.5)' }}>CARE.</span></h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, marginBottom: 16 }}>Register free and get expert device support.</p>
          {[['✓', 'Free — no credit card needed'], ['✓', 'AI + human expert support'], ['✓', 'Real-time repair tracking']].map(([ic, tx]) => (
            <div key={tx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 8 }}><span>{ic}</span>{tx}</div>
          ))}
        </div>
      </div>
      <div className="auth-right">
        <div style={{ marginBottom: 22 }}>
          <h3 className="display-font" style={{ fontSize: 26, fontWeight: 900, marginBottom: 5, color: 'var(--text-primary)' }}>CREATE ACCOUNT</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Register for NetOne Care support</p>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">First Name *</label><input className="form-input" placeholder="First name" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} autoComplete="given-name" /></div>
          <div className="form-group"><label className="form-label">Last Name</label><input className="form-input" placeholder="Last name" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} autoComplete="family-name" /></div>
        </div>
        <div className="form-group"><label className="form-label">Email Address *</label><input className="form-input" type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} autoComplete="email" autoCapitalize="none" /></div>
        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <select className="form-input form-select" style={{ width: 84, flexShrink: 0 }}><option>+263</option><option>+27</option><option>+44</option><option>+1</option></select>
            <input className="form-input" style={{ flex: 1 }} placeholder="77 123 4567" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} autoComplete="tel" inputMode="tel" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Password *</label><input className="form-input" type="password" placeholder="Min. 8 characters" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} autoComplete="new-password" /></div>
          <div className="form-group"><label className="form-label">Confirm *</label><input className="form-input" type="password" placeholder="Repeat password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} onKeyDown={e => e.key === 'Enter' && sendCode()} autoComplete="new-password" /></div>
        </div>
        <button className="btn btn-primary btn-full" style={{ padding: 12, fontSize: 15, marginBottom: 12 }} onClick={sendCode} disabled={loading}>{loading ? 'Sending...' : <><Icon name="mail" size={15} /> Send Verification Code</>}</button>
        <div className="hr-label"><span>Already registered?</span></div>
        <button className="btn btn-secondary btn-full" onClick={() => navigate('/login')}>Sign In</button>
      </div>
    </div>
  )
}
