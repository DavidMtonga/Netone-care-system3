import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/AppContext'
import { announcementsApi } from '../../api/endpoints'
import { Icon } from '../../components/ui/UI'

export function LandingPage() {
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()
  const [announcements, setAnnouncements] = useState<any[]>([])
  useEffect(() => { announcementsApi.getAll().then(r => setAnnouncements(r.data.data ?? [])).catch(() => {}) }, [])

  const STEPS = [
    { n:'01', icon:'user', title:'Register & Report', desc:'Create your account and describe your device issue. AI self-help available before you submit.' },
    { n:'02', icon:'shield', title:'Warranty Verified', desc:'Sales validates your serial and warranty status within 2–4 hours.' },
    { n:'03', icon:'wrench', title:'Engineer Assigned', desc:'A NetOne engineer resolves it remotely or requests physical drop-off.' },
    { n:'04', icon:'check', title:'Issue Resolved', desc:'Email confirmation when fixed. Rate your experience.' },
  ]
  const FEATURES = [
    { icon:'shield', title:'Warranty Tracking', desc:'Every serial verified — always know your repair coverage status.' },
    { icon:'bot', title:'Gemini AI Self-Help', desc:'AI-powered troubleshooting before you even submit a ticket.' },
    { icon:'mail', title:'Email Notifications', desc:'Automatic emails at every milestone — warranty, assignment, resolution.' },
    { icon:'video', title:'Remote Support', desc:'Engineers can fix your device remotely without a physical drop-off.' },
    { icon:'map-pin', title:'Physical Repairs', desc:'Drop-off your device. Get notified when it is ready for pickup.' },
    { icon:'report', title:'Full Analytics', desc:'Admin reports with Excel export — complete operational visibility.' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', padding: '14px 24px', borderBottom: '1px solid var(--border)', background: 'var(--nav-bg)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100, gap: 12 }}>
        <div className="logo-mark" style={{ cursor: 'pointer', flex: 1 }} onClick={() => navigate('/')}>
          <div className="logo-icon" style={{ width: 36, height: 36 }}>N</div>
          <div>
            <div className="display-font" style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>NetOne Care</div>
            <div style={{ fontSize: 8, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Product Support Portal</div>
          </div>
        </div>
        <button className="theme-btn" onClick={toggle} title="Toggle theme">{theme === 'dark' ? '☀️' : '🌙'}</button>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/login')}>Sign In</button>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/register')}>Get Support</button>
      </nav>

      {/* HERO */}
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '56px 24px 40px' }}>
        <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
          <div className="animate-fadeUp">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(232,0,28,0.1)', border: '1px solid rgba(232,0,28,0.25)', borderRadius: 20, padding: '5px 14px', fontSize: 11, color: 'var(--red)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>
              <span style={{ width: 6, height: 6, background: 'var(--red)', borderRadius: '50%', animation: 'pulse 1.5s infinite', display: 'inline-block' }} />
              Official NetOne Support Portal
            </div>
            <h1 className="display-font" style={{ fontSize: 'clamp(44px,7vw,70px)', fontWeight: 900, lineHeight: 0.9, marginBottom: 18, color: 'var(--text-primary)' }}>
              YOUR DEVICE.<br /><span style={{ color: 'var(--red)' }}>FULLY</span><br />SUPPORTED.
            </h1>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 28, maxWidth: 420 }}>
              Expert support for all NetOne devices — Neo Laptops, Phones, Tablets, and Desktops.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" style={{ padding: '12px 24px', fontSize: 14 }} onClick={() => navigate('/register')}><Icon name="plus" size={15} /> Report a Problem</button>
              <button className="btn btn-secondary" style={{ padding: '12px 24px', fontSize: 14 }} onClick={() => navigate('/login')}>Track My Ticket</button>
            </div>
            <div style={{ display: 'flex', gap: 28, marginTop: 36, flexWrap: 'wrap' }}>
              {[['2,400+', 'Tickets Resolved'], ['98%', 'Satisfaction'], ['<24h', 'Response Time']].map(([n, l]) => (
                <div key={l}><div className="display-font" style={{ fontSize: 30, fontWeight: 900, color: 'var(--red)' }}>{n}</div><div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{l}</div></div>
              ))}
            </div>
          </div>
          <div className="hero-cards animate-fadeUp delay-3" style={{ position: 'relative', height: 280 }}>
            <div className="animate-glow" style={{ position: 'absolute', top: 0, left: 16, right: 0, zIndex: 3, background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                <span className="badge badge-inprogress">IN PROGRESS</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>NC-2026-0005</span>
              </div>
              <div style={{ fontWeight: 700, marginBottom: 3 }}>Neo Pro 15 — Overheating</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>Engineer working remotely on your device</div>
              <div style={{ height: 4, background: 'var(--bg-3)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: '65%', height: '100%', background: 'var(--red)', borderRadius: 2 }} />
              </div>
            </div>
            <div style={{ position: 'absolute', top: 108, left: 0, right: 28, zIndex: 2, opacity: 0.75, background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-lg)', padding: 16 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 7 }}><span style={{ width: 7, height: 7, background: '#10b981', borderRadius: '50%' }} /><span style={{ fontSize: 12 }}>Warranty confirmed active</span></div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><span style={{ width: 7, height: 7, background: '#3b82f6', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} /><span style={{ fontSize: 12 }}>Remote session in progress</span></div>
            </div>
            <div style={{ position: 'absolute', top: 196, left: 32, right: 0, zIndex: 1, opacity: 0.4, background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-lg)', padding: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>AI SELF-HELP</div>
              <div style={{ fontSize: 12, color: '#3b82f6' }}>🤖 Diagnosing your issue...</div>
            </div>
          </div>
        </div>
      </div>

      {/* ANNOUNCEMENTS */}
      {announcements.length > 0 && (
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px 28px' }}>
          {announcements.slice(0, 2).map((a: any) => (
            <div key={a.id} style={{ background: 'rgba(232,0,28,0.05)', border: '1px solid rgba(232,0,28,0.15)', borderRadius: 'var(--radius)', padding: '10px 14px', display: 'flex', gap: 10, marginBottom: 7, alignItems: 'flex-start' }}>
              <span style={{ background: 'var(--red)', color: 'white', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase', flexShrink: 0 }}>{a.tag}</span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}><strong style={{ color: 'var(--text-primary)' }}>{a.title}</strong> — {a.body}</span>
            </div>
          ))}
        </div>
      )}

      {/* HOW IT WORKS */}
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

      {/* FEATURES */}
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

      {/* CTA */}
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

      {/* FOOTER */}
      <div style={{ background: 'var(--bg-1)', borderTop: '1px solid var(--border)', padding: '40px 24px 24px' }}>
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
                  <div key={tx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Icon name={ic} size={13} color="var(--text-muted)" /><span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{tx}</span></div>
                ))}
              </div>
            </div>
            {[['Support', ['Report Problem', 'Track Ticket', 'Self-Help']], ['Company', ['About NetOne', 'Products', 'Careers']], ['Legal', ['Privacy Policy', 'Terms']]].map(([col, links]) => (
              <div key={col as string}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>{col as string}</div>
                {(links as string[]).map(l => <div key={l} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, cursor: 'pointer' }}>{l}</div>)}
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
  )
}
