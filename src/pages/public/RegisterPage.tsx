import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, useToast } from '../../context/AppContext'
import { authApi } from '../../api/endpoints'
import { Icon } from '../../components/ui/UI'

// ── Same tech canvas as LoginPage ─────────────────────────────────────────
function TechGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let animId: number
    let t = 0
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    resize()
    window.addEventListener('resize', resize)

    const nodes = Array.from({ length: 30 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.6 + 0.5, pulse: Math.random() * Math.PI * 2,
    }))
    const scanLines = Array.from({ length: 3 }, (_, i) => ({
      y: (i / 3) * canvas.height * Math.random(),
      speed: 0.35 + Math.random() * 0.25,
      opacity: 0.05 + Math.random() * 0.035,
    }))

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      bg.addColorStop(0, '#1a0008'); bg.addColorStop(0.5, '#130005'); bg.addColorStop(1, '#0e0003')
      ctx.fillStyle = bg; ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.strokeStyle = 'rgba(192,0,26,0.065)'; ctx.lineWidth = 0.5
      for (let x = 0; x < canvas.width; x += 38) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); ctx.stroke() }
      for (let y = 0; y < canvas.height; y += 38) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width,y); ctx.stroke() }
      ctx.strokeStyle = 'rgba(192,0,26,0.035)'; ctx.lineWidth = 0.8
      for (let i = -canvas.height; i < canvas.width + canvas.height; i += 76) {
        ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i+canvas.height,canvas.height); ctx.stroke()
      }
      t += 0.007
      scanLines.forEach(sl => {
        sl.y += sl.speed; if (sl.y > canvas.height) sl.y = -2
        const g = ctx.createLinearGradient(0, sl.y-14, 0, sl.y+14)
        g.addColorStop(0,'transparent'); g.addColorStop(0.5,`rgba(192,0,26,${sl.opacity})`); g.addColorStop(1,'transparent')
        ctx.fillStyle = g; ctx.fillRect(0, sl.y-14, canvas.width, 28)
      })
      nodes.forEach(n => {
        n.x+=n.vx; n.y+=n.vy; n.pulse+=0.035
        if (n.x<0||n.x>canvas.width) n.vx*=-1
        if (n.y<0||n.y>canvas.height) n.vy*=-1
      })
      nodes.forEach((a,i) => {
        nodes.slice(i+1).forEach(b => {
          const dx=a.x-b.x, dy=a.y-b.y, dist=Math.sqrt(dx*dx+dy*dy)
          if (dist<105) {
            ctx.strokeStyle=`rgba(192,0,26,${(1-dist/105)*0.16})`; ctx.lineWidth=0.7
            ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke()
          }
        })
      })
      nodes.forEach(n => {
        const p=Math.sin(n.pulse)*0.5+0.5, a=0.28+p*0.55
        const grd=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,n.r*5)
        grd.addColorStop(0,`rgba(192,0,26,${a*0.5})`); grd.addColorStop(1,'transparent')
        ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(n.x,n.y,n.r*5,0,Math.PI*2); ctx.fill()
        ctx.fillStyle=`rgba(220,40,50,${a})`; ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2); ctx.fill()
      })
      const br=28; ctx.strokeStyle='rgba(192,0,26,0.32)'; ctx.lineWidth=1.5
      ctx.beginPath(); ctx.moveTo(20,20+br); ctx.lineTo(20,20); ctx.lineTo(20+br,20); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(canvas.width-20-br,20); ctx.lineTo(canvas.width-20,20); ctx.lineTo(canvas.width-20,20+br); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(20,canvas.height-20-br); ctx.lineTo(20,canvas.height-20); ctx.lineTo(20+br,canvas.height-20); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(canvas.width-20-br,canvas.height-20); ctx.lineTo(canvas.width-20,canvas.height-20); ctx.lineTo(canvas.width-20,canvas.height-20-br); ctx.stroke()
      const cx=canvas.width/2, cy=canvas.height/2, rr=55+Math.sin(t*2)*7
      ctx.strokeStyle=`rgba(192,0,26,${0.07+Math.sin(t*2)*0.03})`; ctx.lineWidth=1
      ctx.beginPath(); ctx.arc(cx,cy,rr,0,Math.PI*2); ctx.stroke()
      ctx.strokeStyle=`rgba(192,0,26,${0.035+Math.sin(t*2+1)*0.02})`
      ctx.beginPath(); ctx.arc(cx,cy,rr*1.65,0,Math.PI*2); ctx.stroke()
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} />
}

// ── OTP Step ──────────────────────────────────────────────────────────────
function OtpStep({
  pending, otp, setOtp, loading, onVerify, onResend, onBack,
}: {
  pending: string; otp: string[]; setOtp: (v: string[]) => void
  loading: boolean; onVerify: () => void; onResend: () => void; onBack: () => void
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t) }, [])

  const handleOtp = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return
    const n = [...otp]; n[i] = val.slice(-1); setOtp(n)
    if (val && i < 5) refs.current[i + 1]?.focus()
  }
  const handleKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus()
  }
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const d = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (d.length === 6) { setOtp(d.split('')); refs.current[5]?.focus() }
  }

  const fade = (delay: number) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(14px)',
    transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`,
  })

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)' }}>
      {/* LEFT panel */}
      <div style={{ flex: '0 0 460px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d0003' }} className="auth-left-hide">
        <TechGrid />
        <div style={{ position:'absolute', inset:0, zIndex:1, background:'linear-gradient(135deg, rgba(192,0,26,0.1) 0%, transparent 55%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:0, right:0, width:60, height:'100%', zIndex:2, background:'linear-gradient(to right, transparent, var(--bg))', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:0, left:0, right:0, height:2, zIndex:3, background:'linear-gradient(90deg, #C0001A 0%, rgba(192,0,26,0.2) 100%)' }} />
        <div style={{ position:'relative', zIndex:4, padding:'40px 44px', width:'100%', opacity: mounted?1:0, transition:'opacity 0.7s ease' }}>
          <div onClick={() => navigate('/')} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:50, cursor:'pointer' }}>
            <div style={{ width:42, height:42, background:'#C0001A', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:19, color:'white', flexShrink:0, boxShadow:'0 0 18px rgba(192,0,26,0.5)' }}>N</div>
            <div>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:20, fontWeight:800, color:'white', lineHeight:1 }}>NetOne Care</div>
              <div style={{ fontSize:9, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.12em', marginTop:2 }}>Support Portal</div>
            </div>
          </div>
          <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:'clamp(32px,4vw,46px)', fontWeight:900, lineHeight:0.92, marginBottom:16, color:'white' }}>
            ALMOST<br /><span style={{ color:'#C0001A' }}>THERE.</span><br />
            <span style={{ color:'rgba(255,255,255,0.28)', fontSize:'0.7em' }}>CHECK YOUR EMAIL.</span>
          </h2>
          <p style={{ fontSize:12.5, color:'rgba(255,255,255,0.45)', lineHeight:1.75, marginBottom:28, maxWidth:295 }}>
            We sent a 6-digit code to your email address. Enter it to activate your account.
          </p>
          <div style={{ background:'rgba(192,0,26,0.09)', border:'1px solid rgba(192,0,26,0.2)', borderRadius:10, padding:'12px 14px', fontSize:12, color:'rgba(255,255,255,0.5)', lineHeight:1.6 }}>
            ℹ️ Check both inbox and spam. Code expires in 10 minutes.
          </div>
        </div>
      </div>

      {/* RIGHT — OTP form */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'40px 60px', overflowY:'auto', maxWidth:520, margin:'0 auto', width:'100%' }}>
        <div style={fade(0.1)}>
          <div style={{ width:56, height:56, borderRadius:14, background:'rgba(192,0,26,0.1)', border:'1px solid rgba(192,0,26,0.22)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, marginBottom:20 }}>📧</div>
          <h3 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:28, fontWeight:900, marginBottom:5, color:'var(--text-primary)', letterSpacing:'0.03em' }}>VERIFY YOUR EMAIL</h3>
          <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:4 }}>
            Code sent to <strong style={{ color:'var(--red)' }}>{pending}</strong>
          </p>
        </div>

        <div style={{ marginTop:28, marginBottom:6, ...fade(0.2) }}>
          <div style={{ fontSize:10, color:'var(--text-muted)', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:14 }}>Enter 6-digit code</div>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-start' }} onPaste={handlePaste}>
            {otp.map((v, i) => (
              <input
                key={i}
                ref={el => { refs.current[i] = el }}
                className={`otp-box ${v ? 'filled' : ''}`}
                maxLength={1} value={v} inputMode="numeric"
                onChange={e => handleOtp(i, e.target.value)}
                onKeyDown={e => handleKey(i, e)}
                style={{ width:52, height:62, fontSize:26 }}
              />
            ))}
          </div>
        </div>

        <div style={{ background:'rgba(59,130,246,0.07)', border:'1px solid rgba(59,130,246,0.18)', borderRadius:'var(--radius)', padding:'9px 12px', fontSize:12, color:'#3b82f6', display:'flex', gap:7, lineHeight:1.5, marginBottom:24, ...fade(0.28) }}>
          <span style={{ flexShrink:0 }}>ℹ️</span>
          <span>Check inbox and spam. Expires in 10 min. If no email, check backend terminal for the code.</span>
        </div>

        <div style={fade(0.35)}>
          <button className="btn btn-primary btn-full" style={{ padding:13, fontSize:15, letterSpacing:'0.02em', marginBottom:10 }} onClick={onVerify} disabled={loading}>
            {loading ? <><div className="spinner" style={{ width:17, height:17 }} /> Verifying...</> : <><Icon name="check" size={15} /> Verify &amp; Create Account</>}
          </button>
        </div>

        <div style={{ display:'flex', gap:10, ...fade(0.42) }}>
          <button className="btn btn-secondary" style={{ flex:1, fontSize:13 }} onClick={onResend} disabled={loading}>
            Resend Code
          </button>
          <button className="btn btn-ghost" style={{ flex:1, fontSize:13 }} onClick={onBack}>
            ← Go Back
          </button>
        </div>

        <p style={{ textAlign:'center', fontSize:12, color:'var(--text-muted)', marginTop:24, ...fade(0.48) }}>
          Already have an account?{' '}
          <span style={{ color:'var(--red)', cursor:'pointer', fontWeight:700 }} onClick={() => navigate('/login')}>Sign In →</span>
        </p>
      </div>

      <style>{`
        @media (max-width: 768px) { .auth-left-hide { display: none !important; } }
        @media (max-width: 900px) { .auth-left-hide { flex: 0 0 340px !important; } }
      `}</style>
    </div>
  )
}

// ── Register Page ─────────────────────────────────────────────────────────
export function RegisterPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuth()
  const { addToast } = useToast()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', phone:'', password:'', confirm:'' })
  const [otp, setOtp] = useState(['','','','','',''])
  const [pending, setPending] = useState('')

  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t) }, [])

  const fade = (delay: number) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(14px)',
    transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
  })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const sendCode = async () => {
    if (!form.firstName.trim())                            { addToast('First name is required', 'error'); return }
    if (!form.email.trim() || !form.email.includes('@'))   { addToast('Valid email is required', 'error'); return }
    if (form.password.length < 8)                          { addToast('Password must be at least 8 characters', 'error'); return }
    if (form.password !== form.confirm)                    { addToast('Passwords do not match', 'error'); return }
    setLoading(true)
    try {
      await authApi.register({
        firstName: form.firstName.trim(), lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || undefined, password: form.password,
      })
      setPending(form.email.trim().toLowerCase())
      addToast('Verification code sent! Check your email.', 'success')
      setStep(2)
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
      addToast(`Welcome to NetOne Care, ${user.first_name}!`, 'success')
      navigate('/dashboard')
    } catch (err: any) {
      addToast(err.response?.data?.message ?? 'Invalid code', 'error')
      setOtp(['','','','','',''])
    } finally { setLoading(false) }
  }

  const resend = async () => {
    setLoading(true)
    try {
      await authApi.register({ firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: pending, phone: form.phone || undefined, password: form.password })
      addToast('Code resent!', 'info')
      setOtp(['','','','','',''])
    } catch { addToast('Failed to resend', 'error') }
    finally { setLoading(false) }
  }

  if (step === 2) return (
    <OtpStep
      pending={pending} otp={otp} setOtp={setOtp}
      loading={loading} onVerify={verify} onResend={resend}
      onBack={() => { setStep(1); setOtp(['','','','','','']) }}
    />
  )

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'var(--bg)' }}>

      {/* ── LEFT — Tech canvas panel ── */}
      <div style={{ flex:'0 0 460px', position:'relative', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', background:'#0d0003' }} className="auth-left-hide">
        <TechGrid />
        <div style={{ position:'absolute', inset:0, zIndex:1, background:'linear-gradient(135deg, rgba(192,0,26,0.1) 0%, transparent 55%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:0, right:0, width:60, height:'100%', zIndex:2, background:'linear-gradient(to right, transparent, var(--bg))', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:0, left:0, right:0, height:2, zIndex:3, background:'linear-gradient(90deg, #C0001A 0%, rgba(192,0,26,0.2) 100%)' }} />

        <div style={{
          position:'relative', zIndex:4, padding:'40px 44px', width:'100%',
          opacity: mounted?1:0, transform: mounted?'translateY(0)':'translateY(20px)',
          transition:'opacity 0.7s ease, transform 0.7s ease',
        }}>
          <div onClick={() => navigate('/')} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:44, cursor:'pointer' }}>
            <div style={{ width:42, height:42, background:'#C0001A', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:19, color:'white', flexShrink:0, boxShadow:'0 0 18px rgba(192,0,26,0.5)' }}>N</div>
            <div>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:20, fontWeight:800, color:'white', lineHeight:1 }}>NetOne Care</div>
              <div style={{ fontSize:9, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.12em', marginTop:2 }}>Support Portal</div>
            </div>
          </div>

          <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:'clamp(32px,4vw,48px)', fontWeight:900, lineHeight:0.92, marginBottom:14, color:'white' }}>
            JOIN<br /><span style={{ color:'#C0001A' }}>NETONE</span><br />
            <span style={{ color:'rgba(255,255,255,0.28)', fontSize:'0.72em' }}>CARE.</span>
          </h2>

          <p style={{ fontSize:12.5, color:'rgba(255,255,255,0.48)', lineHeight:1.75, marginBottom:30, maxWidth:295 }}>
            Register free and get expert device support — from registration to resolution.
          </p>

          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {[
              ['✓', 'Free — no credit card needed'],
              ['✓', 'AI + human expert support'],
              ['✓', 'Real-time repair tracking'],
              ['✓', 'Email updates at every step'],
            ].map(([ic, tx], i) => (
              <div key={tx} style={{
                display:'flex', alignItems:'center', gap:10,
                opacity: mounted?1:0, transform: mounted?'translateX(0)':'translateX(-16px)',
                transition:`opacity 0.6s ease ${0.35+i*0.1}s, transform 0.6s ease ${0.35+i*0.1}s`,
              }}>
                <div style={{ width:22, height:22, borderRadius:6, flexShrink:0, background:'rgba(192,0,26,0.18)', border:'1px solid rgba(192,0,26,0.28)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'#C0001A', fontWeight:700 }}>{ic}</div>
                <span style={{ fontSize:12, color:'rgba(255,255,255,0.58)' }}>{tx}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop:36, display:'inline-flex', alignItems:'center', gap:7, padding:'5px 13px', borderRadius:20, background:'rgba(192,0,26,0.09)', border:'1px solid rgba(192,0,26,0.18)' }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'#10b981', animation:'pulse 2s infinite' }} />
            <span style={{ fontSize:10, color:'rgba(255,255,255,0.42)', fontWeight:600, letterSpacing:'0.07em', textTransform:'uppercase' }}>Systems Operational</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT — Registration form ── */}
      <div style={{
        flex:1, display:'flex', flexDirection:'column', justifyContent:'center',
        padding:'40px 60px', overflowY:'auto', maxWidth:540, margin:'0 auto', width:'100%',
      }}>
        {/* Header */}
        <div style={{ marginBottom:24, ...fade(0.15) }}>
          <h3 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:28, fontWeight:900, marginBottom:5, color:'var(--text-primary)', letterSpacing:'0.03em' }}>CREATE ACCOUNT</h3>
          <p style={{ fontSize:13, color:'var(--text-muted)' }}>Register for NetOne Care device support</p>
        </div>

        {/* Name row */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, ...fade(0.25) }}>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">First Name *</label>
            <input className="form-input" placeholder="First name" value={form.firstName} onChange={set('firstName')} autoComplete="given-name" />
          </div>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">Last Name</label>
            <input className="form-input" placeholder="Last name" value={form.lastName} onChange={set('lastName')} autoComplete="family-name" />
          </div>
        </div>

        {/* Email */}
        <div className="form-group" style={{ marginTop:12, ...fade(0.32) }}>
          <label className="form-label">Email Address *</label>
          <input className="form-input" type="email" placeholder="your@email.com" value={form.email} onChange={set('email')} autoComplete="email" autoCapitalize="none" spellCheck={false} />
        </div>

        {/* Phone */}
        <div className="form-group" style={fade(0.38)}>
          <label className="form-label">Phone Number <span style={{ color:'var(--text-muted)', fontWeight:400, textTransform:'none', fontSize:9 }}>(optional)</span></label>
          <div style={{ display:'flex', gap:8 }}>
            <select className="form-input form-select" style={{ width:88, flexShrink:0 }}>
              <option>+260</option><option>+263</option><option>+44</option><option>+1</option>
            </select>
            <input className="form-input" style={{ flex:1 }} placeholder="77 123 4567" value={form.phone} onChange={set('phone')} autoComplete="tel" inputMode="tel" />
          </div>
        </div>

        {/* Password row */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, ...fade(0.44) }}>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">Password *</label>
            <div style={{ position:'relative' }}>
              <input className="form-input" type={showPw?'text':'password'} placeholder="Min. 8 characters" value={form.password} onChange={set('password')} style={{ paddingRight:40 }} autoComplete="new-password" />
              <button type="button" onClick={() => setShowPw(v=>!v)} style={{ position:'absolute', right:11, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', padding:4, display:'flex', transition:'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color='var(--red)')}
                onMouseLeave={e => (e.currentTarget.style.color='var(--text-muted)')}>
                <Icon name="eye" size={15} />
              </button>
            </div>
          </div>
          <div className="form-group" style={{ marginBottom:0 }}>
            <label className="form-label">Confirm *</label>
            <div style={{ position:'relative' }}>
              <input className="form-input" type={showConfirm?'text':'password'} placeholder="Repeat password" value={form.confirm} onChange={set('confirm')} style={{ paddingRight:40 }} onKeyDown={e => e.key==='Enter' && sendCode()} autoComplete="new-password" />
              <button type="button" onClick={() => setShowConfirm(v=>!v)} style={{ position:'absolute', right:11, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', padding:4, display:'flex', transition:'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color='var(--red)')}
                onMouseLeave={e => (e.currentTarget.style.color='var(--text-muted)')}>
                <Icon name="eye" size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Password strength hint */}
        {form.password.length > 0 && (
          <div style={{ marginTop:6, display:'flex', gap:4, alignItems:'center', ...fade(0) }}>
            {[1,2,3,4].map(lvl => {
              const strength = form.password.length >= 12 ? 4 : form.password.length >= 10 ? 3 : form.password.length >= 8 ? 2 : 1
              const color = strength >= 3 ? '#10b981' : strength === 2 ? '#f59e0b' : '#C0001A'
              return <div key={lvl} style={{ flex:1, height:3, borderRadius:2, background: lvl <= strength ? color : 'var(--border)', transition:'background 0.3s' }} />
            })}
            <span style={{ fontSize:10, color:'var(--text-muted)', marginLeft:6, whiteSpace:'nowrap' }}>
              {form.password.length >= 12 ? 'Strong' : form.password.length >= 8 ? 'Good' : 'Weak'}
            </span>
          </div>
        )}

        {/* Submit */}
        <div style={{ marginTop:20, ...fade(0.5) }}>
          <button className="btn btn-primary btn-full" style={{ padding:13, fontSize:15, letterSpacing:'0.02em' }} onClick={sendCode} disabled={loading}>
            {loading ? <><div className="spinner" style={{ width:17, height:17 }} /> Sending code...</> : <><Icon name="mail" size={15} /> Send Verification Code</>}
          </button>
        </div>

        <div className="hr-label" style={{ margin:'18px 0', ...fade(0.55) }}><span>Already registered?</span></div>

        <div style={fade(0.6)}>
          <button className="btn btn-secondary btn-full" onClick={() => navigate('/login')}>Sign In to Existing Account</button>
        </div>

        <p style={{ textAlign:'center', fontSize:12, color:'var(--text-muted)', marginTop:18, ...fade(0.65) }}>
          NetOne staff?{' '}
          <span style={{ color:'var(--red)', cursor:'pointer', fontWeight:700, transition:'opacity 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.opacity='0.7')}
            onMouseLeave={e => (e.currentTarget.style.opacity='1')}
            onClick={() => navigate('/staff/login')}>Staff Portal →</span>
        </p>
      </div>

      <style>{`
        @media (max-width: 768px) { .auth-left-hide { display: none !important; } }
        @media (max-width: 900px) { .auth-left-hide { flex: 0 0 340px !important; } }
      `}</style>
    </div>
  )
}