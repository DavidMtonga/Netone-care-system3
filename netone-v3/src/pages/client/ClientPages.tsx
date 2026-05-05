import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ticketsApi, assetsApi, kbApi, announcementsApi, usersApi } from '../../api/endpoints'
import { askGemini } from '../../api/gemini'
import { NETONE_DEVICES, DEVICE_PROBLEMS, getDeviceCategory } from '../../constants/devices'
import { useAuth, useToast } from '../../context/AppContext'
import { Icon, StatusBadge, WarrantyBadge, Spinner, EmptyState } from '../../components/ui/UI'

// ── CLIENT DASHBOARD ──────────────────────────────────────────────────────
export function ClientDashboard() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [selectedDevice, setSelectedDevice] = useState('')
  const [form, setForm] = useState({ serialNumber: '', category: '', description: '' })
  const [submitting, setSubmitting] = useState(false)
  const [helpMode, setHelpMode] = useState<'guide' | 'chat'>('guide')
  const [guides, setGuides] = useState<any[]>([])
  const [assets, setAssets] = useState<any[]>([])
  const [announcement, setAnnouncement] = useState<any>(null)
  const [chatHistory, setChatHistory] = useState<{ role: string; text: string }[]>([
    { role: 'ai', text: "**Hello!** I'm your NetOne Care AI assistant. Tell me about your device issue and I'll help troubleshoot before you submit a ticket." }
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    kbApi.getAll().then(r => setGuides(r.data.data ?? [])).catch(() => {})
    assetsApi.getMine().then(r => setAssets(r.data.data ?? [])).catch(() => {})
    announcementsApi.getAll().then(r => { const l = r.data.data ?? []; if (l.length) setAnnouncement(l[0]) }).catch(() => {})
  }, [])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatHistory])

  const deviceCategory = selectedDevice ? getDeviceCategory(selectedDevice) : ''
  const problems = deviceCategory ? DEVICE_PROBLEMS[deviceCategory] ?? [] : []

  const submitTicket = async () => {
    if (!selectedDevice) { addToast('Please select your device', 'error'); return }
    if (!form.serialNumber.trim()) { addToast('Serial number is required', 'error'); return }
    if (!form.category) { addToast('Please select the problem category', 'error'); return }
    if (!form.description.trim()) { addToast('Please describe the problem', 'error'); return }
    setSubmitting(true)
    try {
      const dev = NETONE_DEVICES.find(d => d.model === selectedDevice)
      await ticketsApi.create({ deviceType: dev?.type ?? 'Laptop', deviceModel: selectedDevice, serialNumber: form.serialNumber.trim().toUpperCase(), category: form.category, description: form.description, source: 'web' })
      addToast('Ticket submitted! You will receive an email confirmation shortly.', 'success')
      setTimeout(() => navigate('/my-tickets'), 1200)
    } catch (err: any) {
      addToast(err.response?.data?.message ?? 'Failed to submit ticket', 'error')
    } finally { setSubmitting(false) }
  }

  const sendChat = async () => {
    const msg = chatInput.trim()
    if (!msg || chatLoading) return
    setChatInput('')
    const newHistory = [...chatHistory, { role: 'user', text: msg }]
    setChatHistory(newHistory)
    setChatLoading(true)
    try {
      const reply = await askGemini(msg, newHistory.filter((_, i) => i > 0))
      setChatHistory(h => [...h, { role: 'ai', text: reply }])
    } catch { setChatHistory(h => [...h, { role: 'ai', text: 'Sorry, an error occurred. Please try again.' }]) }
    finally { setChatLoading(false) }
  }

  const renderText = (text: string) => text.split('\n').map((line, j, arr) => (
    <span key={j}>{line.split(/\*\*(.*?)\*\*/g).map((p, k) => k % 2 === 1 ? <strong key={k} style={{ color: '#3b82f6' }}>{p}</strong> : p)}{j < arr.length - 1 && <br />}</span>
  ))

  return (
    <div className="page">
      {announcement && (
        <div className="announcement-strip">
          <span className="announcement-tag">{announcement.tag}</span>
          <span style={{ fontSize: 12 }}>{announcement.title} — {announcement.body}</span>
        </div>
      )}
      <div className="ticket-split">
        {/* REPORT FORM */}
        <div className="card animate-fadeUp">
          <div className="card-header"><div className="card-title display-font">REPORT A PROBLEM</div></div>

          {/* DEVICE SELECTOR - full list dropdown */}
          <div className="form-group">
            <label className="form-label">Select Your Device *</label>
            <select className="form-input form-select" value={selectedDevice} onChange={e => { setSelectedDevice(e.target.value); setForm(f => ({ ...f, category: '' })) }}>
              <option value="">— Choose your NetOne device —</option>
              <optgroup label="Neo Laptops">
                {NETONE_DEVICES.filter(d => d.type === 'Laptop').map(d => <option key={d.model} value={d.model}>{d.model}</option>)}
              </optgroup>
              <optgroup label="Neo Phones">
                {NETONE_DEVICES.filter(d => d.type === 'Phone').map(d => <option key={d.model} value={d.model}>{d.model}</option>)}
              </optgroup>
              <optgroup label="Neo Desktop">
                {NETONE_DEVICES.filter(d => d.type === 'Desktop').map(d => <option key={d.model} value={d.model}>{d.model}</option>)}
              </optgroup>
              <optgroup label="Neo Tablet">
                {NETONE_DEVICES.filter(d => d.type === 'Tablet').map(d => <option key={d.model} value={d.model}>{d.model}</option>)}
              </optgroup>
            </select>
          </div>

          {selectedDevice && (
            <div style={{ padding: '10px 14px', background: 'rgba(232,0,28,0.06)', border: '1px solid rgba(232,0,28,0.15)', borderRadius: 'var(--radius)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon name="laptop" size={16} color="var(--red)" />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--red)' }}>{selectedDevice}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>{NETONE_DEVICES.find(d => d.model === selectedDevice)?.type}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Serial Number *</label>
            <input className="form-input" placeholder="Found on device underside or box (e.g. NL15-2023-88241)" value={form.serialNumber} onChange={e => setForm(f => ({ ...f, serialNumber: e.target.value }))} />
          </div>

          <div className="form-group">
            <label className="form-label">Problem Category *</label>
            <select className="form-input form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} disabled={!selectedDevice}>
              <option value="">{selectedDevice ? 'Select problem type...' : 'Select device first'}</option>
              {problems.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Describe the Problem *</label>
            <textarea className="form-input" placeholder="When did it start? How often does it happen? Any error messages?" style={{ minHeight: 90 }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>

          <div className="info-box" style={{ marginBottom: 14 }}>
            <span>ℹ️</span>
            <span>Our sales team will verify your warranty (2–4 hours) and assign an engineer. You'll receive email updates at every step.</span>
          </div>
          <button className="btn btn-primary btn-full" style={{ padding: 13, fontSize: 15 }} onClick={submitTicket} disabled={submitting}>
            {submitting ? 'Submitting...' : <><Icon name="send" size={15} /> Submit Problem Report</>}
          </button>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card">
            <div className="tabs">
              <div className={`tab ${helpMode === 'guide' ? 'active' : ''}`} onClick={() => setHelpMode('guide')}>📖 Guides</div>
              <div className={`tab ${helpMode === 'chat' ? 'active' : ''}`} onClick={() => setHelpMode('chat')}>🤖 AI Help</div>
            </div>
            {helpMode === 'guide' ? (
              <div>
                {guides.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-muted)', padding: '8px 0' }}>No guides available yet.</p>}
                {guides.map((g: any) => (
                  <div key={g.id} style={{ padding: 12, border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: 8, transition: 'border-color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--red)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 5 }}>{g.title}</div>
                    <div style={{ display: 'flex', gap: 5, marginBottom: 7, flexWrap: 'wrap' }}>
                      <span className="badge badge-inprogress">{g.device_type}</span>
                      <span className="badge badge-pending">{g.category}</span>
                    </div>
                    {(Array.isArray(g.steps) ? g.steps : JSON.parse(g.steps ?? '[]')).slice(0, 3).map((s: string, i: number) => (
                      <div key={i} style={{ display: 'flex', gap: 7, marginBottom: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
                        <span style={{ width: 17, height: 17, background: 'rgba(232,0,28,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 9, fontWeight: 700, color: 'var(--red)' }}>{i + 1}</span>
                        {s}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <div className="info-box" style={{ marginBottom: 10 }}><span>🤖</span><span style={{ fontSize: 12 }}>Powered by Gemini AI — describe your issue for step-by-step help.</span></div>
                <div className="chat-area">
                  <div className="chat-messages">
                    {chatHistory.map((m, i) => <div key={i} className={`chat-bubble ${m.role}`}>{renderText(m.text)}</div>)}
                    {chatLoading && <div className="chat-bubble ai" style={{ display: 'flex', gap: 6, alignItems: 'center' }}><div className="spinner" style={{ width: 14, height: 14 }} /><span style={{ fontSize: 12 }}>Thinking...</span></div>}
                    <div ref={messagesEndRef} />
                  </div>
                  <div className="chat-input-row">
                    <input className="form-input" style={{ flex: 1, padding: '8px 11px', fontSize: 13 }} placeholder="Describe your issue..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChat()} />
                    <button className="btn btn-primary btn-icon" onClick={sendChat} disabled={chatLoading}><Icon name="send" size={14} /></button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="card">
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>MY REGISTERED DEVICES</div>
            {assets.length === 0 && <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>No devices registered. Enter your serial number above to check warranty.</p>}
            {assets.map((a: any) => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, background: 'var(--bg-3)', borderRadius: 'var(--radius)', marginBottom: 7 }}>
                <span style={{ fontSize: 20 }}>{a.device_type === 'Laptop' || a.device_type === 'Desktop' ? '💻' : a.device_type === 'Phone' ? '📱' : '📱'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.device_model}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{a.serial_number}</div>
                </div>
                <WarrantyBadge status={a.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── MY TICKETS ──────────────────────────────────────────────────────────────
export function MyTicketsPage() {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    setLoading(true)
    ticketsApi.getAll(filter !== 'all' ? { status: filter } : {})
      .then(r => setTickets(r.data.data?.tickets ?? []))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false))
  }, [filter])

  return (
    <div className="page">
      <div className="section-header">
        <div>
          <h2 className="display-font" style={{ fontSize: 26, fontWeight: 900 }}>MY TICKETS</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>Track all your support requests</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/dashboard')}><Icon name="plus" size={14} /> New Report</button>
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {[['all', 'All'], ['pending', 'Pending'], ['inprogress', 'In Progress'], ['remote', 'Remote'], ['physical', 'Physical'], ['awaiting', 'Awaiting'], ['ready', 'Ready'], ['closed', 'Closed']].map(([v, l]) => (
          <button key={v} className={`btn btn-sm ${filter === v ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(v)}>{l}</button>
        ))}
      </div>
      {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spinner size={36} /></div>
        : tickets.length === 0 ? <EmptyState icon="🎫" title="No tickets" description="No support tickets match this filter." />
        : (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Ticket ID</th><th>Device</th><th>Problem</th><th>Status</th><th>Warranty</th><th>Updated</th><th></th></tr></thead>
              <tbody>
                {tickets.map((t: any) => (
                  <tr key={t.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/my-tickets/${t.id}`)}>
                    <td className="td-mono">{t.ticket_id}</td>
                    <td className="td-primary" style={{ whiteSpace: 'nowrap' }}>{t.device_model}</td>
                    <td style={{ maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.category}</td>
                    <td><StatusBadge status={t.status} /></td>
                    <td><WarrantyBadge status={t.warranty_status} /></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 11, whiteSpace: 'nowrap' }}>{new Date(t.updated_at).toLocaleDateString()}</td>
                    <td><button className="btn btn-ghost btn-sm">View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </div>
  )
}

// ── TICKET DETAIL ──────────────────────────────────────────────────────────
export function TicketDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [ticket, setTicket] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [hover, setHover] = useState(0)

  const load = () => ticketsApi.getOne(Number(id)).then(r => setTicket(r.data.data)).catch(() => navigate('/my-tickets')).finally(() => setLoading(false))
  useEffect(() => { load() }, [id])

  const sendReply = async () => {
    if (!reply.trim()) return
    setSending(true)
    try { await ticketsApi.addReply(Number(id), reply, false); addToast('Reply sent!', 'success'); setReply(''); load() }
    catch { addToast('Failed to send', 'error') } finally { setSending(false) }
  }

  const submitRating = async (r: number) => {
    try { await ticketsApi.rate(Number(id), r); addToast('Thank you for your feedback!', 'success'); load() }
    catch (err: any) { addToast(err.response?.data?.message ?? 'Rating failed', 'error') }
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size={40} /></div>
  if (!ticket) return null

  const isRemote = ticket.status === 'remote' || ticket.work_type === 'remote'
  const isPhysical = ticket.status === 'physical' || ticket.work_type === 'physical'

  const timeline = [
    { dot: 'tl-red', icon: '📋', title: 'Ticket Submitted', meta: new Date(ticket.created_at).toLocaleString() },
    ...(ticket.verified_at ? [{ dot: 'tl-blue', icon: '✓', title: 'Warranty Verified', meta: new Date(ticket.verified_at).toLocaleString(), body: `Warranty: ${ticket.warranty_status}${ticket.charge_note ? ' — ' + ticket.charge_note : ''}` }] : []),
    ...(ticket.engineer_id ? [{ dot: 'tl-blue', icon: '👤', title: 'Engineer Assigned', meta: ticket.engineer_name }] : []),
    ...(isRemote ? [{ dot: 'tl-blue', icon: '💻', title: 'Remote Session In Progress', meta: 'Engineer is working remotely on your device' }] : []),
    ...(isPhysical ? [{ dot: 'tl-red', icon: '📦', title: 'Physical Drop-Off Requested', meta: 'Please bring your device to the NetOne service centre' }] : []),
    ...(ticket.status === 'awaiting' ? [{ dot: 'tl-gray', icon: '⏳', title: 'Awaiting Device Drop-Off', meta: 'We are waiting to receive your device' }] : []),
    ...(ticket.status === 'ready' ? [{ dot: 'tl-green', icon: '✅', title: 'Device Ready for Pickup', meta: 'Your device has been repaired — come collect it' }] : []),
    ...(ticket.status === 'closed' ? [{ dot: 'tl-green', icon: '🎉', title: 'Ticket Closed', meta: ticket.closed_at ? new Date(ticket.closed_at).toLocaleString() : '' }] : []),
  ]

  return (
    <div className="page">
      <button className="btn btn-ghost btn-sm" style={{ marginBottom: 14 }} onClick={() => navigate('/my-tickets')}><Icon name="arrow-left" size={14} /> Back</button>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5, flexWrap: 'wrap' }}>
            <span className="td-mono" style={{ fontSize: 15 }}>{ticket.ticket_id}</span>
            <StatusBadge status={ticket.status} />
            <WarrantyBadge status={ticket.warranty_status} />
          </div>
          <h2 className="display-font" style={{ fontSize: 'clamp(18px,4vw,26px)', fontWeight: 900 }}>{ticket.category?.toUpperCase()} — {ticket.device_model?.toUpperCase()}</h2>
        </div>
      </div>

      <div className="ticket-split">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card">
            <div className="card-title display-font" style={{ marginBottom: 10 }}>PROBLEM DESCRIPTION</div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{ticket.description}</p>
            <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(110px,1fr))', gap: 10 }}>
              {[['DEVICE', ticket.device_model], ['SERIAL', ticket.serial_number], ['DATE', new Date(ticket.created_at).toLocaleDateString()]].map(([l, v]) => (
                <div key={l}><div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{l}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, fontFamily: l === 'SERIAL' ? 'monospace' : 'inherit', color: l === 'SERIAL' ? 'var(--red)' : 'inherit', wordBreak: 'break-all' }}>{v}</div></div>
              ))}
            </div>
            {ticket.charge_note && <div className="warn-box" style={{ marginTop: 12 }}><span>⚠️</span><span>{ticket.charge_note}</span></div>}
          </div>

          {/* Work type info */}
          {(isRemote || isPhysical) && (
            <div className="card" style={{ border: `1px solid ${isRemote ? 'rgba(59,130,246,0.3)' : 'rgba(232,0,28,0.3)'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 32 }}>{isRemote ? '💻' : '🏪'}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{isRemote ? 'Remote Assistance' : 'Physical Drop-Off Required'}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>
                    {isRemote ? 'Your engineer is resolving this issue remotely. No need to visit the service centre.' : 'Please bring your device to the nearest NetOne service centre. Mon–Fri, 8am–5pm.'}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-title display-font" style={{ marginBottom: 14 }}>SUPPORT THREAD</div>
            {(!ticket.replies || ticket.replies.length === 0) && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>No messages yet.</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
              {(ticket.replies ?? []).map((m: any) => (
                <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.author_role === 'client' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>{m.author_name} · {new Date(m.created_at).toLocaleString()}</div>
                  <div style={{ maxWidth: '78%', padding: '9px 12px', borderRadius: 10, fontSize: 13, lineHeight: 1.6, wordBreak: 'break-word', background: m.author_role === 'client' ? 'var(--red)' : 'var(--bg-3)', color: m.author_role === 'client' ? 'white' : 'var(--text-secondary)', border: m.author_role === 'client' ? 'none' : '1px solid var(--border)' }}>{m.message}</div>
                </div>
              ))}
            </div>
            {ticket.status !== 'closed' && (
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="form-input" style={{ flex: 1 }} placeholder="Send a message to your engineer..." value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendReply()} />
                <button className="btn btn-primary" onClick={sendReply} disabled={sending}><Icon name="send" size={14} /></button>
              </div>
            )}
          </div>

          {ticket.status === 'closed' && !ticket.rating && (
            <div className="card" style={{ border: '1px solid rgba(232,0,28,0.25)' }}>
              <div className="card-title display-font" style={{ marginBottom: 10 }}>RATE YOUR EXPERIENCE</div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                {[1, 2, 3, 4, 5].map(s => (
                  <span key={s} style={{ fontSize: 28, cursor: 'pointer', color: s <= hover ? 'var(--red)' : 'var(--border)', transition: 'color 0.1s' }} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)} onClick={() => submitRating(s)}>★</span>
                ))}
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>How was your NetOne Care experience?</p>
            </div>
          )}
          {ticket.rating && (
            <div className="card"><div style={{ fontSize: 13 }}>Your rating: {[1, 2, 3, 4, 5].map(s => <span key={s} style={{ color: s <= ticket.rating ? 'var(--red)' : 'var(--border)', fontSize: 20 }}>★</span>)}</div></div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card">
            <div className="card-title display-font" style={{ fontSize: 14, marginBottom: 14 }}>TICKET TIMELINE</div>
            <div className="timeline">
              {timeline.map((t, i) => (
                <div key={i} className="timeline-item">
                  <div className={`timeline-dot ${t.dot}`}>{t.icon}</div>
                  <div className="timeline-content">
                    <div className="timeline-title">{t.title}</div>
                    <div className="timeline-meta">{t.meta}</div>
                    {(t as any).body && <div className="timeline-body">{(t as any).body}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {ticket.engineer_name && ticket.engineer_name !== '—' && (
            <div className="card">
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>ASSIGNED ENGINEER</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#10b981', flexShrink: 0 }}>{ticket.engineer_name.charAt(0)}</div>
                <div><div style={{ fontSize: 13, fontWeight: 600 }}>{ticket.engineer_name}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>NetOne Care Engineer</div></div>
              </div>
            </div>
          )}
          {ticket.resolution && (
            <div className="card" style={{ border: '1px solid rgba(16,185,129,0.25)' }}>
              <div style={{ fontSize: 11, color: '#10b981', fontWeight: 700, textTransform: 'uppercase', marginBottom: 7 }}>RESOLUTION</div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{ticket.resolution}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── PROFILE PAGE ──────────────────────────────────────────────────────────
export function ProfilePage() {
  const { user, setAuth, token } = useAuth()
  const { addToast } = useToast()
  const [form, setForm] = useState({ firstName: user?.first_name ?? '', lastName: user?.last_name ?? '', phone: user?.phone ?? '' })
  const [saving, setSaving] = useState(false)
  const save = async () => {
    setSaving(true)
    try { const res = await usersApi.updateMe({ firstName: form.firstName, lastName: form.lastName, phone: form.phone }); setAuth(res.data.data, token!); addToast('Profile updated!', 'success') }
    catch { addToast('Failed to update', 'error') } finally { setSaving(false) }
  }
  return (
    <div className="page">
      <div style={{ maxWidth: 580 }}>
        <h2 className="display-font" style={{ fontSize: 26, fontWeight: 900, marginBottom: 20 }}>PROFILE SETTINGS</h2>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22, flexWrap: 'wrap' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(232,0,28,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: 'var(--red)', flexShrink: 0 }}>{user?.first_name?.charAt(0)}</div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700 }}>{user?.first_name} {user?.last_name}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 3 }}>{user?.email} <span className={`badge role-${user?.role}`}>{user?.role}</span></div>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">First Name</label><input className="form-input" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Last Name</label><input className="form-input" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} /></div>
          </div>
          <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
          <div className="form-group"><label className="form-label">Email (cannot change)</label><input className="form-input" value={user?.email ?? ''} disabled /></div>
          <button className="btn btn-primary" onClick={save} disabled={saving}><Icon name="check" size={14} /> {saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </div>
    </div>
  )
}
