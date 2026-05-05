import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/AppContext'
import { announcementsApi } from '../../api/endpoints'
import { Icon } from '../../components/ui/UI'

// ── Image imports (light-mode slider) ─────────────────────────────────────
import imgDuoneo       from '../../assets/images/duoneo.jpg'
import imgFooter       from '../../assets/images/footer.png'
import imgMainproducts from '../../assets/images/mainproducts.png'
import imgNeo14        from '../../assets/images/neo14.png'
import imgNeo14a       from '../../assets/images/neo14a.jpeg'
import imgNeo14s       from '../../assets/images/neo14s.jpg'
import imgNeo15        from '../../assets/images/neo15.jpeg'
import imgNeo15p       from '../../assets/images/neo15p.jpeg'
import imgNeotab       from '../../assets/images/neotab.jpg'
import imgNeotab1      from '../../assets/images/neotab1.jpg'
import imgSideneo14    from '../../assets/images/sideneo14.jpg'

const SLIDER_IMAGES = [
  imgDuoneo, imgMainproducts, imgNeo14, imgNeo14a, imgNeo14s,
  imgNeo15, imgNeo15p, imgNeotab, imgNeotab1, imgSideneo14, imgFooter,
]

// ── Light-mode crossfade image slider (smooth transition) ─────────────────
function HeroImageSlider() {
  const [current, setCurrent] = useState(0)
  const [next, setNext] = useState<number | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (current + 1) % SLIDER_IMAGES.length
      setNext(nextIndex)
      setIsTransitioning(true)
      
      setTimeout(() => {
        setCurrent(nextIndex)
        setNext(null)
        setIsTransitioning(false)
      }, 1000)
    }, 5000)
    return () => clearInterval(interval)
  }, [current])

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <img
        key={`current-${current}`}
        src={SLIDER_IMAGES[current]}
        alt=""
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center',
          opacity: isTransitioning ? 0 : 1,
          transition: 'opacity 1s ease-in-out',
          zIndex: 1,
        }}
      />
      {next !== null && (
        <img
          key={`next-${next}`}
          src={SLIDER_IMAGES[next]}
          alt=""
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center',
            opacity: isTransitioning ? 1 : 0,
            transition: 'opacity 1s ease-in-out',
            zIndex: 2,
          }}
        />
      )}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 3,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0.38) 100%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0, zIndex: 4,
        background: 'linear-gradient(135deg, rgba(192,0,26,0.06) 0%, transparent 60%)',
      }} />
    </div>
  )
}

// ── Hero animated tech grid (dark mode) ───────────────────────────────────
function HeroTechGrid({ isDark }: { isDark: boolean }) {
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

    const nodes = Array.from({ length: 36 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.28, vy: (Math.random() - 0.5) * 0.28,
      r: Math.random() * 1.5 + 0.5, pulse: Math.random() * Math.PI * 2,
    }))
    const scanLines = Array.from({ length: 4 }, (_, i) => ({
      y: (i / 4) * canvas.height, speed: 0.32 + Math.random() * 0.22, opacity: 0.045 + Math.random() * 0.03,
    }))

    function draw() {
      const W = canvas.width, H = canvas.height
      ctx.clearRect(0, 0, W, H)
      const bg = ctx.createLinearGradient(0, 0, W, H)
      bg.addColorStop(0, '#1a0008'); bg.addColorStop(0.5, '#130005'); bg.addColorStop(1, '#0e0003')
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)
      ctx.strokeStyle = `rgba(192,0,26,0.065)`; ctx.lineWidth = 0.5
      for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
      for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
      ctx.strokeStyle = `rgba(192,0,26,0.032)`; ctx.lineWidth = 0.8
      for (let i = -H; i < W + H; i += 80) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + H, H); ctx.stroke() }
      t += 0.007
      scanLines.forEach(sl => {
        sl.y += sl.speed; if (sl.y > H) sl.y = -2
        const g = ctx.createLinearGradient(0, sl.y - 14, 0, sl.y + 14)
        g.addColorStop(0, 'transparent'); g.addColorStop(0.5, `rgba(192,0,26,${sl.opacity})`); g.addColorStop(1, 'transparent')
        ctx.fillStyle = g; ctx.fillRect(0, sl.y - 14, W, 28)
      })
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy; n.pulse += 0.03
        if (n.x < 0 || n.x > W) n.vx *= -1; if (n.y < 0 || n.y > H) n.vy *= -1
      })
      nodes.forEach((a, i) => {
        nodes.slice(i + 1).forEach(b => {
          const dx = a.x - b.x, dy = a.y - b.y, dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 110) {
            ctx.strokeStyle = `rgba(192,0,26,${(1 - dist / 110) * 0.15})`; ctx.lineWidth = 0.7
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
          }
        })
      })
      nodes.forEach(n => {
        const p = Math.sin(n.pulse) * 0.5 + 0.5, a = 0.28 + p * 0.55
        const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 5.5)
        grd.addColorStop(0, `rgba(192,0,26,${a * 0.5})`); grd.addColorStop(1, 'transparent')
        ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 5.5, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = `rgba(210,35,50,${a})`; ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill()
      })
      const br = 26; ctx.strokeStyle = `rgba(192,0,26,0.3)`; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(18, 18 + br); ctx.lineTo(18, 18); ctx.lineTo(18 + br, 18); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(W - 18 - br, 18); ctx.lineTo(W - 18, 18); ctx.lineTo(W - 18, 18 + br); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(18, H - 18 - br); ctx.lineTo(18, H - 18); ctx.lineTo(18 + br, H - 18); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(W - 18 - br, H - 18); ctx.lineTo(W - 18, H - 18); ctx.lineTo(W - 18, H - 18 - br); ctx.stroke()
      const cx = W * 0.75, cy = H * 0.44, rr = 50 + Math.sin(t * 2) * 7
      ctx.strokeStyle = `rgba(192,0,26,${0.07 + Math.sin(t * 2) * 0.02})`; ctx.lineWidth = 1
      ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2); ctx.stroke()
      ctx.strokeStyle = `rgba(192,0,26,0.035)`
      ctx.beginPath(); ctx.arc(cx, cy, rr * 1.72, 0, Math.PI * 2); ctx.stroke()
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [isDark])

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
}

// ── Landing Page ───────────────────────────────────────────────────────────
export function LandingPage() {
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()
  const [announcements, setAnnouncements] = useState<any[]>([])
  const isDark = theme === 'dark'

  useEffect(() => {
    announcementsApi.getAll().then(r => setAnnouncements(r.data.data ?? [])).catch(() => {})
  }, [])

  const heroBg        = isDark ? '#0d0003' : '#f5f5f5'
  const heroBgEdge    = isDark ? '#0a0a0a' : '#f0f0f0'
  const cardBg        = isDark ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.88)'
  const cardBorder    = isDark ? 'rgba(255,255,255,0.09)'  : 'rgba(192,0,26,0.13)'
  const cardShadow    = isDark ? 'none' : '0 4px 24px rgba(0,0,0,0.08)'
  const textPrimary   = isDark ? '#ffffff' : 'var(--text-primary)'
  const textSecondary = isDark ? 'rgba(255,255,255,0.68)' : 'var(--text-secondary)'
  const textMuted     = isDark ? 'rgba(255,255,255,0.38)' : 'var(--text-muted)'
  const btnSecBorder  = isDark ? 'rgba(255,255,255,0.18)' : 'var(--border)'
  const btnSecColor   = isDark ? 'rgba(255,255,255,0.82)' : 'var(--text-primary)'
  const statusTxt     = isDark ? 'rgba(255,255,255,0.38)' : '#10b981'
  const statusBg      = isDark ? 'rgba(192,0,26,0.09)'    : 'rgba(16,185,129,0.07)'
  const statusBrd     = isDark ? 'rgba(192,0,26,0.18)'    : 'rgba(16,185,129,0.22)'

  const STEPS = [
    { n: '01', icon: 'user',   title: 'Register & Report',  desc: 'Create your account and describe your device issue. AI self-help available before you submit.' },
    { n: '02', icon: 'shield', title: 'Warranty Verified',  desc: 'Sales validates your serial and warranty status within 2–4 hours.' },
    { n: '03', icon: 'wrench', title: 'Engineer Assigned',  desc: 'A NetOne engineer resolves it remotely or requests physical drop-off.' },
    { n: '04', icon: 'check',  title: 'Issue Resolved',     desc: 'Email confirmation when fixed. Rate your experience.' },
  ]

  const FEATURES = [
    { icon: 'shield',  title: 'Warranty Tracking',   desc: 'Every serial verified — always know your repair coverage status.' },
    { icon: 'bot',     title: 'Gemini AI Self-Help', desc: 'AI-powered troubleshooting before you even submit a ticket.' },
    { icon: 'mail',    title: 'Email Notifications', desc: 'Automatic emails at every milestone — warranty, assignment, resolution.' },
    { icon: 'video',   title: 'Remote Support',       desc: 'Engineers can fix your device remotely without a physical drop-off.' },
    { icon: 'map-pin', title: 'Physical Repairs',     desc: 'Drop-off your device. Get notified when it is ready for pickup.' },
    { icon: 'report',  title: 'Full Analytics',       desc: 'Admin reports with Excel export — complete operational visibility.' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── NAV ── */}
      <nav style={{
        display: 'flex', alignItems: 'center', padding: '14px 24px',
        borderBottom: '1px solid var(--border)', background: 'var(--nav-bg)',
        backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100, gap: 12,
      }}>
        <div className="logo-mark" style={{ cursor: 'pointer', flex: 1 }} onClick={() => navigate('/')}>
          <div className="logo-icon" style={{ width: 36, height: 36 }}>N</div>
          <div>
            <div className="display-font" style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>NetOne Care</div>
            <div style={{ fontSize: 8, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Product Support Portal</div>
          </div>
        </div>
        <button className="theme-btn" onClick={toggle} title="Toggle theme">{isDark ? '☀️' : '🌙'}</button>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/login')}>Sign In</button>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>Get Support</button>
      </nav>

      {/* ── HERO ── */}
      <div style={{ position: 'relative', overflow: 'hidden', background: heroBg }}>

        {/* dark = tech canvas  |  light = crossfade image slider */}
        {isDark ? <HeroTechGrid isDark={isDark} /> : <HeroImageSlider />}

        {/* Top accent line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2, zIndex: 10,
          background: 'linear-gradient(90deg, #C0001A 0%, rgba(192,0,26,0.15) 100%)',
        }} />

        {/* Diagonal wash — dark only */}
        {isDark && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
            background: 'linear-gradient(135deg, rgba(192,0,26,0.09) 0%, transparent 55%)',
          }} />
        )}

        {/* Bottom fade */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 90, zIndex: 8,
          pointerEvents: 'none',
          background: `linear-gradient(to bottom, transparent, ${heroBgEdge})`,
        }} />

        {/* Hero content */}
        <div style={{ position: 'relative', zIndex: 9, maxWidth: 1160, margin: '0 auto', padding: '56px 24px 52px' }}>
          <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>

            {/* LEFT */}
            <div className="animate-fadeUp">
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: isDark ? 'rgba(192,0,26,0.15)' : 'rgba(192,0,26,0.08)',
                border: `1px solid ${isDark ? 'rgba(192,0,26,0.28)' : 'rgba(192,0,26,0.2)'}`,
                borderRadius: 20, padding: '5px 14px', fontSize: 11,
                color: isDark ? 'rgba(255,255,255,0.75)' : 'var(--red)',
                fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20,
              }}>
                <span style={{ width: 6, height: 6, background: 'var(--red)', borderRadius: '50%', animation: 'pulse 1.5s infinite', display: 'inline-block' }} />
                Official NetOne Support Portal
              </div>

              <h1 className="display-font" style={{ fontSize: 'clamp(44px,7vw,72px)', fontWeight: 900, lineHeight: 0.88, marginBottom: 18, color: textPrimary }}>
                YOUR DEVICE.<br /><span style={{ color: 'var(--red)' }}>FULLY</span><br />SUPPORTED.
              </h1>

              <p style={{ fontSize: 15, color: textSecondary, lineHeight: 1.72, marginBottom: 28, maxWidth: 420 }}>
                Expert support for all NetOne devices — Neo Laptops, Phones, Tablets, and Desktops.
              </p>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 34 }}>
                <button className="btn btn-primary" style={{ padding: '12px 24px', fontSize: 14 }} onClick={() => navigate('/register')}>
                  <Icon name="plus" size={15} /> Report a Problem
                </button>
                <button
                  className="btn"
                  style={{ padding: '12px 24px', fontSize: 14, background: 'transparent', color: btnSecColor, border: `1.5px solid ${btnSecBorder}`, borderRadius: 'var(--radius)', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', transition: 'all 0.2s' }}
                  onClick={() => navigate('/login')}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = btnSecBorder; e.currentTarget.style.color = btnSecColor }}
                >Track My Ticket</button>
              </div>

              <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', marginBottom: 20 }}>
                {[['2,400+', 'Tickets Resolved'], ['98%', 'Satisfaction'], ['<24h', 'Response Time']].map(([n, l]) => (
                  <div key={l}>
                    <div className="display-font" style={{ fontSize: 30, fontWeight: 900, color: 'var(--red)' }}>{n}</div>
                    <div style={{ fontSize: 11, color: textMuted, marginTop: 1 }}>{l}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 13px', borderRadius: 20, background: statusBg, border: `1px solid ${statusBrd}` }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: 10, color: statusTxt, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Systems Operational</span>
              </div>
            </div>

            {/* RIGHT — floating cards */}
            <div className="hero-cards animate-fadeUp delay-3" style={{ position: 'relative', height: 280 }}>
              <div className="animate-glow" style={{ position: 'absolute', top: 0, left: 16, right: 0, zIndex: 3, background: cardBg, border: `1px solid ${cardBorder}`, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderRadius: 'var(--radius-lg)', padding: 20, boxShadow: cardShadow }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                  <span className="badge badge-inprogress">IN PROGRESS</span>
                  <span style={{ fontSize: 11, color: 'var(--red)', fontFamily: 'monospace', fontWeight: 700 }}>NC-2026-0005</span>
                </div>
                <div style={{ fontWeight: 700, marginBottom: 3, color: textPrimary, fontSize: 13.5 }}>Neo Pro 15 — Overheating</div>
                <div style={{ fontSize: 12, color: textSecondary, marginBottom: 10 }}>Engineer working remotely on your device</div>
                <div style={{ height: 4, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: '65%', height: '100%', background: 'var(--red)', borderRadius: 2 }} />
                </div>
              </div>

              <div style={{ position: 'absolute', top: 108, left: 0, right: 28, zIndex: 2, opacity: 0.78, background: cardBg, border: `1px solid ${cardBorder}`, backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderRadius: 'var(--radius-lg)', padding: 16, boxShadow: cardShadow }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 7 }}>
                  <span style={{ width: 7, height: 7, background: '#10b981', borderRadius: '50%', flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: textSecondary }}>Warranty confirmed active</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ width: 7, height: 7, background: '#3b82f6', borderRadius: '50%', animation: 'pulse 1.5s infinite', flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: textSecondary }}>Remote session in progress</span>
                </div>
              </div>

              <div style={{ position: 'absolute', top: 196, left: 32, right: 0, zIndex: 1, opacity: 0.42, background: cardBg, border: `1px solid ${cardBorder}`, backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderRadius: 'var(--radius-lg)', padding: 14, boxShadow: cardShadow }}>
                <div style={{ fontSize: 10, color: textMuted, marginBottom: 3, letterSpacing: '0.07em', textTransform: 'uppercase' }}>AI SELF-HELP</div>
                <div style={{ fontSize: 12, color: '#3b82f6' }}>🤖 Diagnosing your issue...</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ANNOUNCEMENTS ── */}
      {announcements.length > 0 && (
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '24px 24px 12px' }}>
          {announcements.slice(0, 2).map((a: any) => (
            <div key={a.id} style={{ background: 'rgba(232,0,28,0.05)', border: '1px solid rgba(232,0,28,0.15)', borderRadius: 'var(--radius)', padding: '10px 14px', display: 'flex', gap: 10, marginBottom: 7, alignItems: 'flex-start' }}>
              <span style={{ background: 'var(--red)', color: 'white', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase', flexShrink: 0 }}>{a.tag}</span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>{a.title}</strong> — {a.body}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── HOW IT WORKS ── */}
      <div style={{ background: 'var(--bg-1)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '56px 24px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 className="display-font" style={{ fontSize: 'clamp(28px,5vw,44px)', fontWeight: 900, color: 'var(--text-primary)' }}>HOW IT WORKS</h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6 }}>From fault report to resolution in 4 simple steps</p>
          </div>
          <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
            {STEPS.map(s => (
              <div key={s.n} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-lg)', padding: 22, position: 'relative', transition: 'all 0.2s', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--card-border)'; e.currentTarget.style.transform = 'translateY(0)' }}>
                <div style={{ position: 'absolute', top: 14, right: 16, fontFamily: "'Barlow Condensed',sans-serif", fontSize: 44, fontWeight: 900, color: 'rgba(232,0,28,0.07)', lineHeight: 1 }}>{s.n}</div>
                <div style={{ width: 40, height: 40, background: 'rgba(232,0,28,0.1)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <Icon name={s.icon} size={20} color="var(--red)" />
                </div>
                <div className="display-font" style={{ fontSize: 17, fontWeight: 800, marginBottom: 7, color: 'var(--text-primary)' }}>{s.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURES ── */}
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '56px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 className="display-font" style={{ fontSize: 'clamp(28px,5vw,44px)', fontWeight: 900, color: 'var(--text-primary)' }}>EVERYTHING YOU NEED</h2>
        </div>
        <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-lg)', padding: 20, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--card-border)'; e.currentTarget.style.transform = 'translateY(0)' }}>
              <div style={{ width: 40, height: 40, background: 'rgba(232,0,28,0.1)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <Icon name={f.icon} size={20} color="var(--red)" />
              </div>
              <div className="display-font" style={{ fontSize: 17, fontWeight: 800, marginBottom: 7, color: 'var(--text-primary)' }}>{f.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA BANNER ── */}
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px 48px' }}>
        <div className="cta-row" style={{ background: 'var(--red)', borderRadius: 'var(--radius-xl)', padding: '40px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <h3 className="display-font" style={{ fontSize: 'clamp(24px,4vw,36px)', fontWeight: 900, color: 'white', marginBottom: 6 }}>GET STARTED TODAY</h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)' }}>Register free and get expert device support in minutes.</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn" style={{ background: 'white', color: 'var(--red)', fontWeight: 700, padding: '12px 24px' }} onClick={() => navigate('/register')}>Create Account</button>
            <button className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '12px 24px' }} onClick={() => navigate('/login')}>Sign In</button>
          </div>
        </div>
      </div>

      {/* ── FOOTER WITH BACKGROUND IMAGE ── */}
      <div style={{
        borderTop: '1px solid var(--border)',
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--bg-1)',
      }}>
        {/* footer.png background image layer */}
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          backgroundImage: `url(${imgFooter})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: isDark ? 0 : 0.12,
          transition: 'opacity 0.4s ease',
        }} />
        
        {/* Gradient overlay for text readability */}
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          background: isDark
            ? 'var(--bg-1)'
            : 'linear-gradient(to bottom, rgba(240,240,240,0.92) 0%, rgba(240,240,240,0.97) 100%)',
        }} />
        
        {/* Footer content */}
        <div style={{ position: 'relative', zIndex: 2, padding: '40px 24px 24px' }}>
          <div style={{ maxWidth: 1160, margin: '0 auto' }}>
            <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 32, marginBottom: 28 }}>
              <div>
                <div className="logo-mark" style={{ marginBottom: 14 }}>
                  <div className="logo-icon">N</div>
                  <div className="display-font" style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)' }}>NetOne Care</div>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 240 }}>Official product support for all NetOne devices.</p>
                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {[['mail', 'support@netone.co.zw'], ['phone', '+263 4 700 0000']].map(([ic, tx]) => (
                    <div key={tx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icon name={ic} size={13} color="var(--text-muted)" />
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{tx}</span>
                    </div>
                  ))}
                </div>
              </div>
              {[
                ['Support', ['Report Problem', 'Track Ticket', 'Self-Help']],
                ['Company', ['About NetOne', 'Products', 'Careers']],
                ['Legal',   ['Privacy Policy', 'Terms']],
              ].map(([col, links]) => (
                <div key={col as string}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>{col as string}</div>
                  {(links as string[]).map(l => (
                    <div key={l} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, cursor: 'pointer', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                    >{l}</div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>© {new Date().getFullYear()} NetOne Zimbabwe. All rights reserved.</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 6, height: 6, background: '#10b981', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}