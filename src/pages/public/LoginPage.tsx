import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, useToast } from '../../context/AppContext'
import { Icon } from '../../components/ui/UI'

const REDIRECTS: Record<string, string> = {
  client: '/dashboard', sales: '/sales', engineer: '/engineer',
  admin: '/admin', superadmin: '/admin'
}

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
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.6 + 0.5,
      pulse: Math.random() * Math.PI * 2,
    }))
    const scanLines = Array.from({ length: 3 }, (_, i) => ({
      y: (i / 3) * canvas.height * Math.random(),
      speed: 0.35 + Math.random() * 0.25,
      opacity: 0.05 + Math.random() * 0.035,
    }))

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      // base
      const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      bg.addColorStop(0, '#1a0008'); bg.addColorStop(0.5, '#130005'); bg.addColorStop(1, '#0e0003')
      ctx.fillStyle = bg; ctx.fillRect(0, 0, canvas.width, canvas.height)
      // grid
      ctx.strokeStyle = 'rgba(192,0,26,0.065)'; ctx.lineWidth = 0.5
      for (let x = 0; x < canvas.width; x += 38) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); ctx.stroke() }
      for (let y = 0; y < canvas.height; y += 38) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width,y); ctx.stroke() }
      // diagonals
      ctx.strokeStyle = 'rgba(192,0,26,0.035)'; ctx.lineWidth = 0.8
      for (let i = -canvas.height; i < canvas.width + canvas.height; i += 76) {
        ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i+canvas.height,canvas.height); ctx.stroke()
      }
      // scan lines
      t += 0.007
      scanLines.forEach(sl => {
        sl.y += sl.speed; if (sl.y > canvas.height) sl.y = -2
        const g = ctx.createLinearGradient(0, sl.y-14, 0, sl.y+14)
        g.addColorStop(0,'transparent'); g.addColorStop(0.5,`rgba(192,0,26,${sl.opacity})`); g.addColorStop(1,'transparent')
        ctx.fillStyle = g; ctx.fillRect(0, sl.y-14, canvas.width, 28)
      })
      // nodes
      nodes.forEach(n => {
        n.x+=n.vx; n.y+=n.vy; n.pulse+=0.035
        if (n.x<0||n.x>canvas.width) n.vx*=-1
        if (n.y<0||n.y>canvas.height) n.vy*=-1
      })
      // connections
      nodes.forEach((a,i) => {
        nodes.slice(i+1).forEach(b => {
          const dx=a.x-b.x, dy=a.y-b.y, dist=Math.sqrt(dx*dx+dy*dy)
          if (dist<105) {
            ctx.strokeStyle=`rgba(192,0,26,${(1-dist/105)*0.16})`; ctx.lineWidth=0.7
            ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke()
          }
        })
      })
      // draw nodes
      nodes.forEach(n => {
        const p=Math.sin(n.pulse)*0.5+0.5, a=0.28+p*0.55
        const grd=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,n.r*5)
        grd.addColorStop(0,`rgba(192,0,26,${a*0.5})`); grd.addColorStop(1,'transparent')
        ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(n.x,n.y,n.r*5,0,Math.PI*2); ctx.fill()
        ctx.fillStyle=`rgba(220,40,50,${a})`; ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2); ctx.fill()
      })
      // brackets
      const br=28, bw=1.5
      ctx.strokeStyle='rgba(192,0,26,0.32)'; ctx.lineWidth=bw
      ctx.beginPath(); ctx.moveTo(20,20+br); ctx.lineTo(20,20); ctx.lineTo(20+br,20); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(canvas.width-20-br,20); ctx.lineTo(canvas.width-20,20); ctx.lineTo(canvas.width-20,20+br); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(20,canvas.height-20-br); ctx.lineTo(20,canvas.height-20); ctx.lineTo(20+br,canvas.height-20); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(canvas.width-20-br,canvas.height-20); ctx.lineTo(canvas.width-20,canvas.height-20); ctx.lineTo(canvas.width-20,canvas.height-20-br); ctx.stroke()
      // rings
      const cx=canvas.width/2, cy=canvas.height/2
      const rr=55+Math.sin(t*2)*7
      ctx.strokeStyle=`rgba(192,0,26,${0.07+Math.sin(t*2)*0.03})`; ctx.lineWidth=1
      ctx.beginPath(); ctx.arc(cx,cy,rr,0,Math.PI*2); ctx.stroke()
      ctx.strokeStyle=`rgba(192,0,26,${0.035+Math.sin(t*2+1)*0.02})`
      ctx.beginPath(); ctx.arc(cx,cy,rr*1.65,0,Math.PI*2); ctx.stroke()
      animId=requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize',resize) }
  }, [])
  return <canvas ref={canvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} />
}

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { addToast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t) }, [])

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

  const fade = (delay: number) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(14px)',
    transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
  })

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'var(--bg)' }}>

      {/* LEFT — Tech animated panel */}
      <div style={{ flex:'0 0 460px', position:'relative', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', background:'#0d0003' }}
        className="auth-left-hide">
        <TechGrid />
        {/* Top-left diagonal red gradient layer */}
        <div style={{ position:'absolute', inset:0, zIndex:1, background:'linear-gradient(135deg, rgba(192,0,26,0.1) 0%, transparent 55%)', pointerEvents:'none' }} />
        {/* Right fade — blends into right panel */}
        <div style={{ position:'absolute', top:0, right:0, width:60, height:'100%', zIndex:2, background:'linear-gradient(to right, transparent, var(--bg))', pointerEvents:'none' }} />
        {/* Top accent line */}
        <div style={{ position:'absolute', top:0, left:0, right:0, height:2, zIndex:3, background:'linear-gradient(90deg, #C0001A 0%, rgba(192,0,26,0.2) 100%)' }} />

        {/* Content */}
        <div style={{
          position:'relative', zIndex:4, padding:'40px 44px', width:'100%',
          opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}>
          <div onClick={() => navigate('/')} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:50, cursor:'pointer' }}>
            <div style={{ width:42, height:42, background:'#C0001A', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:19, color:'white', flexShrink:0, boxShadow:'0 0 18px rgba(192,0,26,0.5)' }}>N</div>
            <div>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:20, fontWeight:800, color:'white', lineHeight:1 }}>NetOne Care</div>
              <div style={{ fontSize:9, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.12em', marginTop:2 }}>Support Portal</div>
            </div>
          </div>

          <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:'clamp(32px,4vw,48px)', fontWeight:900, lineHeight:0.92, marginBottom:16, color:'white' }}>
            DEVICE<br />
            <span style={{ color:'#C0001A' }}>SUPPORT</span><br />
            <span style={{ color:'rgba(255,255,255,0.32)', fontSize:'0.72em' }}>SIMPLIFIED.</span>
          </h2>

          <p style={{ fontSize:12.5, color:'rgba(255,255,255,0.48)', lineHeight:1.75, marginBottom:34, maxWidth:295 }}>
            Report faults and get expert help for all your NetOne products — from registration to resolution.
          </p>

          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {[['🔒','Secure encrypted accounts'],['📧','Email updates at every step'],['🤖','AI-powered troubleshooting']].map(([ic,tx],i) => (
              <div key={tx} style={{
                display:'flex', alignItems:'center', gap:12,
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateX(0)' : 'translateX(-16px)',
                transition: `opacity 0.6s ease ${0.35+i*0.12}s, transform 0.6s ease ${0.35+i*0.12}s`,
              }}>
                <div style={{ width:30, height:30, borderRadius:7, flexShrink:0, background:'rgba(192,0,26,0.14)', border:'1px solid rgba(192,0,26,0.22)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13 }}>{ic}</div>
                <span style={{ fontSize:12, color:'rgba(255,255,255,0.58)', fontWeight:400 }}>{tx}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop:42, display:'inline-flex', alignItems:'center', gap:7, padding:'5px 13px', borderRadius:20, background:'rgba(192,0,26,0.09)', border:'1px solid rgba(192,0,26,0.18)' }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'#C0001A', animation:'pulse 2s infinite' }} />
            <span style={{ fontSize:10, color:'rgba(255,255,255,0.42)', fontWeight:600, letterSpacing:'0.07em', textTransform:'uppercase' }}>Systems Operational</span>
          </div>
        </div>
      </div>

      {/* RIGHT — Form */}
      <div style={{
        flex:1, display:'flex', flexDirection:'column', justifyContent:'center',
        padding:'40px 60px', overflowY:'auto', maxWidth:520, margin:'0 auto', width:'100%',
        ...fade(0.15),
      }}>
        <div style={{ marginBottom:30 }}>
          <h3 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:28, fontWeight:900, marginBottom:5, color:'var(--text-primary)', letterSpacing:'0.03em' }}>CUSTOMER SIGN IN</h3>
          <p style={{ fontSize:13, color:'var(--text-muted)' }}>Sign in to your NetOne Care account</p>
        </div>

        <div className="form-group" style={fade(0.3)}>
          <label className="form-label">Email Address</label>
          <input className="form-input" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key==='Enter' && handle()} autoComplete="email" autoCapitalize="none" spellCheck={false} />
        </div>

        <div className="form-group" style={fade(0.38)}>
          <label className="form-label">Password</label>
          <div style={{ position:'relative' }}>
            <input className="form-input" type={showPw?'text':'password'} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} style={{ paddingRight:44 }} onKeyDown={e => e.key==='Enter' && handle()} autoComplete="current-password" />
            <button type="button" onClick={() => setShowPw(v=>!v)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', padding:4, display:'flex', transition:'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color='var(--red)')}
              onMouseLeave={e => (e.currentTarget.style.color='var(--text-muted)')}>
              <Icon name="eye" size={16} />
            </button>
          </div>
        </div>

        <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:22, ...fade(0.44) }}>
          <span style={{ fontSize:12.5, color:'var(--red)', cursor:'pointer', fontWeight:600, transition:'opacity 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.opacity='0.7')}
            onMouseLeave={e => (e.currentTarget.style.opacity='1')}
            onClick={() => navigate('/forgot-password')}>Forgot password?</span>
        </div>

        <div style={fade(0.5)}>
          <button className="btn btn-primary btn-full" style={{ padding:13, fontSize:15, letterSpacing:'0.02em' }} onClick={handle} disabled={loading}>
            {loading ? <><div className="spinner" style={{ width:17, height:17 }} /> Signing in...</> : 'Sign In'}
          </button>
        </div>

        <div className="hr-label" style={{ margin:'22px 0', ...fade(0.55) }}><span>New to NetOne Care?</span></div>

        <div style={fade(0.6)}>
          <button className="btn btn-secondary btn-full" onClick={() => navigate('/register')}>Create Free Account</button>
        </div>

        <p style={{ textAlign:'center', fontSize:12, color:'var(--text-muted)', marginTop:22, ...fade(0.65) }}>
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
