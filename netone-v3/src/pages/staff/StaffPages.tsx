import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ticketsApi, usersApi, assetsApi, announcementsApi, reportsApi } from '../../api/endpoints'
import { Icon, StatusBadge, WarrantyBadge, RoleBadge, Spinner, EmptyState } from '../../components/ui/UI'
import { useToast } from '../../context/AppContext'
import { NETONE_DEVICES, DEVICE_PROBLEMS, getDeviceCategory } from '../../constants/devices'

// ── SALES DASHBOARD ───────────────────────────────────────────────────────
export function SalesDashboard() {
  const navigate = useNavigate()
  const [pending, setPending] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { ticketsApi.getAll({ status: 'pending' }).then(r => setPending(r.data.data?.tickets ?? [])).catch(() => {}).finally(() => setLoading(false)) }, [])
  return (
    <div className="page">
      <div className="kpi-grid">
        {[{ l: 'Pending Verification', n: pending.length, c: 'kpi-red' }, { l: 'Status', n: pending.length > 0 ? '⚠' : '✓', c: pending.length > 0 ? 'kpi-red' : 'kpi-success' }].map(k => (
          <div key={k.l} className={`kpi-card ${k.c}`}><div className="kpi-number display-font">{k.n}</div><div className="kpi-label">{k.l}</div></div>
        ))}
      </div>
      <div className="card">
        <div className="card-header">
          <div className="card-title display-font">🔴 PENDING VERIFICATION QUEUE</div>
          <button className="btn btn-secondary btn-sm" onClick={() => window.location.reload()}><Icon name="refresh" size={13} /> Refresh</button>
        </div>
        {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><Spinner /></div>
          : pending.length === 0 ? <EmptyState icon="✅" title="All clear" description="No tickets awaiting verification." />
          : (<div className="table-wrap"><table className="data-table">
            <thead><tr><th>Ticket ID</th><th>Client</th><th>Device</th><th>Serial</th><th>Problem</th><th>Submitted</th><th>Action</th></tr></thead>
            <tbody>{pending.map((t: any) => (
              <tr key={t.id}>
                <td className="td-mono">{t.ticket_id}</td><td className="td-primary">{t.client_name}</td>
                <td style={{ fontSize: 12 }}>{t.device_model}</td><td className="td-mono">{t.serial_number}</td>
                <td style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.category}</td>
                <td style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(t.created_at).toLocaleDateString()}</td>
                <td><button className="btn btn-primary btn-sm" onClick={() => navigate(`/sales/inbox/${t.id}`)}>Verify →</button></td>
              </tr>))}</tbody>
          </table></div>)}
      </div>
    </div>
  )
}

// ── SALES INBOX ───────────────────────────────────────────────────────────
export function SalesInboxPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [ticket, setTicket] = useState<any>(null)
  const [engineers, setEngineers] = useState<any[]>([])
  const [asset, setAsset] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [warrantyStatus, setWarrantyStatus] = useState('')
  const [engineerId, setEngineerId] = useState('')
  const [chargeNote, setChargeNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!id) { navigate('/sales'); return }
    Promise.all([ticketsApi.getOne(Number(id)), usersApi.getEngineers()]).then(([tr, er]) => {
      const t = tr.data.data; setTicket(t)
      const engs = er.data.data ?? []; setEngineers(engs)
      if (engs.length) setEngineerId(String(engs[0].id))
      if (t.serial_number) assetsApi.getBySerial(t.serial_number).then(ar => setAsset(ar.data.data)).catch(() => {})
    }).catch(() => navigate('/sales')).finally(() => setLoading(false))
  }, [id])

  const handleAssign = async () => {
    if (!warrantyStatus) { addToast('Select warranty status', 'error'); return }
    if (!engineerId) { addToast('Select an engineer', 'error'); return }
    setSubmitting(true)
    try {
      await ticketsApi.verify(Number(id), { warrantyStatus, engineerId: Number(engineerId), chargeNote: chargeNote || undefined })
      addToast('Ticket verified and engineer assigned!', 'success')
      navigate('/sales')
    } catch (err: any) { addToast(err.response?.data?.message ?? 'Failed', 'error') }
    finally { setSubmitting(false) }
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size={40} /></div>
  if (!ticket) return null

  return (
    <div className="page">
      <button className="btn btn-ghost btn-sm" style={{ marginBottom: 14 }} onClick={() => navigate('/sales')}><Icon name="arrow-left" size={14} /> Back</button>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 5, flexWrap: 'wrap' }}>
              <span className="td-mono" style={{ fontSize: 14 }}>{ticket.ticket_id}</span><StatusBadge status={ticket.status} />
            </div>
            <h2 className="display-font" style={{ fontSize: 'clamp(18px,4vw,24px)' }}>{ticket.category?.toUpperCase()} — {ticket.device_model?.toUpperCase()}</h2>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 12, padding: 12, background: 'var(--bg-3)', borderRadius: 'var(--radius)' }}>
          {[['Client', ticket.client_name], ['Phone', ticket.client_phone ?? '—'], ['Email', ticket.client_email ?? '—'], ['Date', new Date(ticket.created_at).toLocaleDateString()]].map(([l, v]) => (
            <div key={l}><div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{l}</div><div style={{ fontSize: 12, fontWeight: 600, wordBreak: 'break-all' }}>{v}</div></div>
          ))}
        </div>
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-title display-font" style={{ marginBottom: 14 }}>WARRANTY VERIFICATION</div>
          <div style={{ padding: 12, background: 'var(--bg-3)', borderRadius: 'var(--radius)', marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 5, textTransform: 'uppercase' }}>Serial Number</div>
            <div style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 700, color: 'var(--red)', wordBreak: 'break-all' }}>{ticket.serial_number}</div>
            {asset ? <div style={{ marginTop: 8 }}><WarrantyBadge status={asset.status} /><span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>Expires: {asset.warranty_expiry?.split('T')[0]}</span></div>
              : <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>Not in asset registry — verify manually</div>}
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <button className={`btn btn-sm ${warrantyStatus === 'active' ? 'btn-success' : 'btn-secondary'}`} style={{ flex: 1 }} onClick={() => setWarrantyStatus('active')}><Icon name="check" size={13} /> Under Warranty</button>
            <button className={`btn btn-sm ${warrantyStatus === 'expired' ? 'btn-danger' : 'btn-secondary'}`} style={{ flex: 1 }} onClick={() => setWarrantyStatus('expired')}><Icon name="x" size={13} /> Out of Warranty</button>
          </div>
          {warrantyStatus === 'expired' && (
            <div className="form-group"><label className="form-label">Charge Note to Customer</label><textarea className="form-input" placeholder="e.g. Repair cost: $45–$60..." style={{ minHeight: 70 }} value={chargeNote} onChange={e => setChargeNote(e.target.value)} /></div>
          )}
          {warrantyStatus && (
            <>
              <div className="form-group">
                <label className="form-label">Assign Engineer</label>
                <select className="form-input form-select" value={engineerId} onChange={e => setEngineerId(e.target.value)}>
                  {engineers.map((e: any) => <option key={e.id} value={e.id}>{e.first_name} {e.last_name} ({e.active_tickets ?? 0} active)</option>)}
                </select>
              </div>
              <button className="btn btn-primary btn-full" onClick={handleAssign} disabled={submitting}>{submitting ? 'Assigning...' : 'Confirm & Assign →'}</button>
            </>
          )}
        </div>
        <div className="card">
          <div className="card-title display-font" style={{ marginBottom: 12 }}>PROBLEM DETAILS</div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{ticket.description}</p>
          <div className="info-box" style={{ marginTop: 14 }}><span>📞</span><span style={{ fontSize: 12 }}>Call client before assigning if device is out of warranty.</span></div>
        </div>
      </div>
    </div>
  )
}

// ── ALL TICKETS (Sales + Admin) ───────────────────────────────────────────
export function AllTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  useEffect(() => {
    setLoading(true)
    ticketsApi.getAll(filter !== 'all' ? { status: filter } : {}).then(r => setTickets(r.data.data?.tickets ?? [])).catch(() => setTickets([])).finally(() => setLoading(false))
  }, [filter])
  const exportExcel = async () => { try { const r = await reportsApi.export(); const url = URL.createObjectURL(new Blob([r.data])); const a = document.createElement('a'); a.href = url; a.download = 'NetOne-Report.xlsx'; a.click() } catch {} }
  return (
    <div className="page">
      <div className="section-header">
        <h2 className="display-font" style={{ fontSize: 26 }}>ALL TICKETS</h2>
        <button className="btn btn-secondary btn-sm" onClick={exportExcel}><Icon name="download" size={13} /> Export</button>
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {[['all', 'All'], ['pending', 'Pending'], ['inprogress', 'In Progress'], ['remote', 'Remote'], ['physical', 'Physical'], ['awaiting', 'Awaiting'], ['ready', 'Ready'], ['closed', 'Closed']].map(([v, l]) => (
          <button key={v} className={`btn btn-sm ${filter === v ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(v)}>{l}</button>
        ))}
      </div>
      {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spinner size={36} /></div>
        : tickets.length === 0 ? <EmptyState icon="🎫" title="No tickets" />
        : (<div className="table-wrap"><table className="data-table">
          <thead><tr><th>Ticket ID</th><th>Client</th><th>Device</th><th>Category</th><th>Warranty</th><th>Status</th><th>Engineer</th><th>Date</th></tr></thead>
          <tbody>{tickets.map((t: any) => (
            <tr key={t.id}>
              <td className="td-mono">{t.ticket_id}</td><td className="td-primary">{t.client_name}</td>
              <td style={{ fontSize: 12 }}>{t.device_model}</td><td style={{ maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.category}</td>
              <td><WarrantyBadge status={t.warranty_status} /></td><td><StatusBadge status={t.status} /></td>
              <td style={{ fontSize: 12 }}>{t.engineer_name ?? '—'}</td><td style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(t.created_at).toLocaleDateString()}</td>
            </tr>))}</tbody>
        </table></div>)}
    </div>
  )
}

// ── ENGINEER DASHBOARD ────────────────────────────────────────────────────
export function EngineerDashboard() {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { ticketsApi.getAll().then(r => setTickets(r.data.data?.tickets ?? [])).catch(() => {}).finally(() => setLoading(false)) }, [])
  const active = tickets.filter(t => t.status !== 'closed')
  return (
    <div className="page">
      <div className="kpi-grid">
        {[{ l: 'Active', n: active.length, c: 'kpi-info' }, { l: 'Remote Work', n: tickets.filter(t => t.status === 'remote').length, c: 'kpi-dark' }, { l: 'Physical', n: tickets.filter(t => t.status === 'physical' || t.status === 'awaiting').length, c: 'kpi-red' }, { l: 'Resolved', n: tickets.filter(t => t.status === 'closed').length, c: 'kpi-success' }].map(k => (
          <div key={k.l} className={`kpi-card ${k.c}`}><div className="kpi-number display-font">{k.n}</div><div className="kpi-label">{k.l}</div></div>
        ))}
      </div>
      <div className="card">
        <div className="card-header"><div className="card-title display-font">MY ASSIGNED TICKETS</div></div>
        {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><Spinner /></div>
          : active.length === 0 ? <EmptyState icon="🔧" title="No active tickets" />
          : (<div className="table-wrap"><table className="data-table">
            <thead><tr><th>Ticket ID</th><th>Client</th><th>Device</th><th>Problem</th><th>Warranty</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>{active.map((t: any) => (
              <tr key={t.id}>
                <td className="td-mono">{t.ticket_id}</td><td className="td-primary">{t.client_name}</td>
                <td style={{ fontSize: 12 }}>{t.device_model}</td><td style={{ maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.category}</td>
                <td><WarrantyBadge status={t.warranty_status} /></td><td><StatusBadge status={t.status} /></td>
                <td><button className="btn btn-info btn-sm" onClick={() => navigate('/engineer/tickets')}>Work →</button></td>
              </tr>))}</tbody>
          </table></div>)}
      </div>
    </div>
  )
}

// ── ENGINEER TICKETS (with work type + call/email + close flow) ───────────
export function EngineerTicketsPage() {
  const { addToast } = useToast()
  const [tickets, setTickets] = useState<any[]>([])
  const [active, setActive] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState('')
  const [reply, setReply] = useState('')
  const [resolution, setResolution] = useState('')
  const [workType, setWorkType] = useState<'' | 'remote' | 'physical'>('')
  const [sending, setSending] = useState(false)

  const load = () => {
    ticketsApi.getAll().then(r => {
      const ts = r.data.data?.tickets?.filter((t: any) => t.status !== 'closed') ?? []
      setTickets(ts)
      if (ts.length && !active) loadOne(ts[0].id)
    }).catch(() => {}).finally(() => setLoading(false))
  }
  const loadOne = (id: number) => ticketsApi.getOne(id).then(r => { setActive(r.data.data); setWorkType(r.data.data.work_type ?? '') }).catch(() => {})
  useEffect(() => { load() }, [])

  const sendMsg = async (internal: boolean) => {
    const msg = internal ? note : reply
    if (!msg.trim() || !active) return
    setSending(true)
    try {
      await ticketsApi.addReply(active.id, msg, internal)
      addToast(internal ? 'Note saved' : 'Reply sent to client', 'success')
      if (internal) setNote(''); else setReply('')
      loadOne(active.id)
    } catch { addToast('Failed', 'error') } finally { setSending(false) }
  }

  const setWorkTypeAndStatus = async (type: 'remote' | 'physical') => {
    if (!active) return
    setSending(true)
    try {
      await ticketsApi.setWorkType(active.id, type)
      setWorkType(type)
      addToast(`Ticket set to ${type} work. Client has been notified.`, 'success')
      // Add an internal system message
      await ticketsApi.addReply(active.id, `Engineer has set this ticket to ${type === 'remote' ? 'REMOTE ASSISTANCE' : 'PHYSICAL DROP-OFF'} workflow.`, true)
      loadOne(active.id)
    } catch { addToast('Failed to update work type', 'error') } finally { setSending(false) }
  }

  const closeTicket = async () => {
    if (!resolution.trim()) { addToast('Enter a resolution summary', 'error'); return }
    if (!workType) { addToast('Please select remote or physical work type first', 'error'); return }
    setSending(true)
    try {
      await ticketsApi.close(active.id, resolution, workType)
      addToast('Ticket closed! Client has been notified by email.', 'success')
      setResolution(''); setWorkType('')
      load()
    } catch (err: any) { addToast(err.response?.data?.message ?? 'Failed', 'error') } finally { setSending(false) }
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size={40} /></div>
  if (tickets.length === 0) return <div className="page"><EmptyState icon="🔧" title="No active tickets" description="You have no open tickets assigned." /></div>

  return (
    <div className="page">
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 14 }} className="ticket-split">
        {/* Queue */}
        <div className="card" style={{ overflow: 'auto', padding: 0 }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'Barlow Condensed',sans-serif" }}>QUEUE ({tickets.length})</div>
          {tickets.map((t: any) => (
            <div key={t.id} onClick={() => loadOne(t.id)}
              style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', cursor: 'pointer', background: active?.id === t.id ? 'rgba(232,0,28,0.05)' : 'transparent', borderLeft: active?.id === t.id ? '3px solid var(--red)' : '3px solid transparent', transition: 'all 0.15s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--red)', fontWeight: 700 }}>{t.ticket_id}</span>
                <StatusBadge status={t.status} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.client_name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.category}</div>
            </div>
          ))}
        </div>

        {/* Work Area */}
        {active && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto' }}>
            {/* Ticket Header */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 5, flexWrap: 'wrap' }}>
                    <span className="td-mono">{active.ticket_id}</span>
                    <StatusBadge status={active.status} />
                    <WarrantyBadge status={active.warranty_status} />
                  </div>
                  <h3 className="display-font" style={{ fontSize: 'clamp(16px,3vw,20px)' }}>{active.category?.toUpperCase()} — {active.client_name}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 5, lineHeight: 1.5 }}>{active.description}</p>
                </div>
                {/* CALL & EMAIL BUTTONS */}
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  {active.client_phone && active.client_phone !== '—' && (
                    <a href={`tel:${active.client_phone}`} className="btn btn-success btn-sm" title={`Call ${active.client_name}: ${active.client_phone}`}>
                      <Icon name="phone" size={13} /> Call Client
                    </a>
                  )}
                  {active.client_email && (
                    <a href={`mailto:${active.client_email}?subject=Re: Your NetOne Care Ticket ${active.ticket_id}&body=Hi ${active.client_name},%0D%0A%0D%0ARegarding your support ticket ${active.ticket_id}...`} className="btn btn-info btn-sm" target="_blank" rel="noreferrer" title={`Email ${active.client_email}`}>
                      <Icon name="mail" size={13} /> Email Client
                    </a>
                  )}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(100px,1fr))', gap: 8, padding: 10, background: 'var(--bg-3)', borderRadius: 'var(--radius)' }}>
                {[['Phone', active.client_phone ?? '—'], ['Email', active.client_email ?? '—'], ['Serial', active.serial_number]].map(([l, v]) => (
                  <div key={l}><div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>{l}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, wordBreak: 'break-all', fontFamily: l === 'Serial' ? 'monospace' : 'inherit', color: l === 'Serial' ? 'var(--red)' : 'inherit' }}>{v}</div></div>
                ))}
              </div>
              {/* Replies */}
              {(active.replies ?? []).filter((r: any) => !r.is_internal).map((m: any) => (
                <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.author_role === 'client' ? 'flex-end' : 'flex-start', marginTop: 8 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>{m.author_name} · {new Date(m.created_at).toLocaleString()}</div>
                  <div style={{ maxWidth: '75%', padding: '8px 11px', borderRadius: 9, fontSize: 12, background: m.author_role === 'client' ? 'var(--red)' : 'var(--bg-3)', color: m.author_role === 'client' ? 'white' : 'var(--text-secondary)', border: m.author_role === 'client' ? 'none' : '1px solid var(--border)', wordBreak: 'break-word' }}>{m.message}</div>
                </div>
              ))}
            </div>

            {/* WORK TYPE SELECTION */}
            <div className="card">
              <div className="card-title display-font" style={{ marginBottom: 14 }}>SELECT WORK TYPE</div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div className={`work-type-btn ${workType === 'remote' ? 'selected-remote' : ''}`} onClick={() => setWorkTypeAndStatus('remote')}>
                  <span className="work-type-icon">💻</span>
                  <span className="work-type-label">Remote Assistance</span>
                  <span className="work-type-desc">Fix the issue remotely — no device drop-off needed</span>
                </div>
                <div className={`work-type-btn ${workType === 'physical' ? 'selected-physical' : ''}`} onClick={() => setWorkTypeAndStatus('physical')}>
                  <span className="work-type-icon">🏪</span>
                  <span className="work-type-label">Physical Drop-Off</span>
                  <span className="work-type-desc">Client brings device to service centre for repair</span>
                </div>
              </div>
              {workType && (
                <div className={`info-box ${workType === 'physical' ? 'warn-box' : ''}`} style={{ marginTop: 12 }}>
                  <span>{workType === 'remote' ? 'ℹ️' : '📦'}</span>
                  <span style={{ fontSize: 12 }}>
                    {workType === 'remote' ? 'Client has been notified that you are working remotely on their device.' : 'Client has been notified to drop off their device at the service centre. Ticket will move to "Awaiting" when they confirm.'}
                  </span>
                </div>
              )}
            </div>

            {/* MESSAGING */}
            <div className="grid-2">
              <div className="card">
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>🔒 INTERNAL NOTE</div>
                <textarea className="form-input" placeholder="Internal — not visible to client..." style={{ minHeight: 70 }} value={note} onChange={e => setNote(e.target.value)} />
                <button className="btn btn-secondary btn-sm" style={{ marginTop: 7 }} onClick={() => sendMsg(true)} disabled={sending}>Save Note</button>
              </div>
              <div className="card">
                <div style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', marginBottom: 8 }}>💬 REPLY TO CLIENT</div>
                <textarea className="form-input" placeholder="Visible to client..." style={{ minHeight: 70 }} value={reply} onChange={e => setReply(e.target.value)} />
                <button className="btn btn-info btn-sm" style={{ marginTop: 7 }} onClick={() => sendMsg(false)} disabled={sending}><Icon name="send" size={12} /> Send</button>
              </div>
            </div>

            {/* CLOSE TICKET */}
            <div className="card" style={{ border: '1px solid rgba(16,185,129,0.25)' }}>
              <div className="card-title display-font" style={{ color: '#10b981', marginBottom: 12 }}>
                {workType === 'remote' ? '✓ CLOSE TICKET — REMOTE RESOLUTION' : workType === 'physical' ? '✓ CLOSE TICKET — DEVICE READY FOR PICKUP' : '✓ CLOSE TICKET'}
              </div>
              {workType && (
                <div className="info-box" style={{ marginBottom: 12 }}>
                  <span>📧</span>
                  <span style={{ fontSize: 12 }}>
                    {workType === 'remote'
                      ? 'Closing will send the client a "Resolved Remotely" email — confirming their device is working and the issue was fixed remotely.'
                      : 'Closing will send the client a "Device Ready for Pickup" email — confirming their device has been repaired and is ready to collect from the service centre.'}
                  </span>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Resolution Summary *</label>
                <textarea className="form-input" placeholder={workType === 'remote' ? 'Describe what was done remotely to fix the issue...' : 'Describe the repair performed on the physical device...'} style={{ minHeight: 80 }} value={resolution} onChange={e => setResolution(e.target.value)} />
              </div>
              <button className="btn btn-success" onClick={closeTicket} disabled={sending || !workType}>
                <Icon name="check" size={14} /> {workType === 'remote' ? 'Close & Send Remote Resolution Email' : workType === 'physical' ? 'Close & Send Pickup Ready Email' : 'Select work type first'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── ADMIN DASHBOARD ────────────────────────────────────────────────────────
export function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<any>(null)
  const [faults, setFaults] = useState<any[]>([])
  useEffect(() => {
    reportsApi.dashboard().then(r => setStats(r.data.data)).catch(() => {})
    reportsApi.topFaults().then(r => setFaults(r.data.data ?? [])).catch(() => {})
  }, [])
  const maxF = Math.max(...faults.map((f: any) => +f.count), 1)
  const COLORS = ['var(--red)', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b']
  return (
    <div className="page">
      <div className="kpi-grid">
        {stats ? [
          { n: stats.openTickets, l: 'Open Tickets', c: 'kpi-red' },
          { n: stats.pendingVerification, l: 'Pending Verification', c: 'kpi-warn' },
          { n: stats.inProgress, l: 'In Progress', c: 'kpi-info' },
          { n: stats.resolvedThisMonth, l: 'Resolved / Month', c: 'kpi-success' },
          { n: (stats.avgHours ?? 0) + 'h', l: 'Avg Resolution', c: 'kpi-dark' },
        ].map(k => <div key={k.l} className={`kpi-card ${k.c} animate-fadeUp`}><div className="kpi-number display-font">{k.n}</div><div className="kpi-label">{k.l}</div></div>)
          : <div className="kpi-card kpi-red" style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'center', padding: 28 }}><Spinner /></div>}
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-header"><div className="card-title display-font">TOP FAULTS THIS MONTH</div></div>
          {faults.length === 0 ? <EmptyState icon="📊" title="No data yet" /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {faults.map((d: any, i: number) => (
                <div key={d.category} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 90, fontSize: 11, color: 'var(--text-secondary)', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.category}</div>
                  <div style={{ flex: 1, height: 20, background: 'var(--bg-3)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${(+d.count / maxF) * 100}%`, height: '100%', background: COLORS[i % COLORS.length], borderRadius: 3, minWidth: 16, transition: 'width 0.8s' }} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: COLORS[i % COLORS.length], width: 18, textAlign: 'right' }}>{d.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card">
          <div className="card-title display-font" style={{ marginBottom: 14 }}>QUICK ACTIONS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[{ l: 'All Tickets', p: '/admin/tickets', i: 'ticket' }, { l: 'User Management', p: '/admin/users', i: 'users' }, { l: 'Asset Registry', p: '/admin/assets', i: 'asset' }, { l: 'Create Ticket', p: '/admin/create-ticket', i: 'plus' }, { l: 'Reports & Export', p: '/admin/reports', i: 'report' }].map(a => (
              <button key={a.p} className="btn btn-secondary" style={{ justifyContent: 'flex-start', gap: 10 }} onClick={() => navigate(a.p)}>
                <Icon name={a.i} size={15} /> {a.l}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── USER MANAGEMENT ───────────────────────────────────────────────────────
export function UserManagementPage() {
  const { addToast } = useToast()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', role: 'engineer' })
  const [saving, setSaving] = useState(false)
  const load = () => usersApi.getAll().then(r => setUsers(r.data.data ?? [])).catch(() => {}).finally(() => setLoading(false))
  useEffect(() => { load() }, [])
  const create = async () => {
    if (!form.firstName || !form.email || !form.password) { addToast('Fill required fields', 'error'); return }
    setSaving(true)
    try { await usersApi.createStaff(form); addToast('Staff account created!', 'success'); setShowForm(false); setForm({ firstName: '', lastName: '', email: '', phone: '', password: '', role: 'engineer' }); load() }
    catch (err: any) { addToast(err.response?.data?.message ?? 'Failed', 'error') } finally { setSaving(false) }
  }
  const toggle = async (id: number, name: string) => { try { await usersApi.toggle(id); addToast(`${name} status toggled`, 'info'); load() } catch { addToast('Failed', 'error') } }
  const counts = { Clients: users.filter(u => u.role === 'client').length, Engineers: users.filter(u => u.role === 'engineer').length, Sales: users.filter(u => u.role === 'sales').length, Admins: users.filter(u => ['admin', 'superadmin'].includes(u.role)).length }
  return (
    <div className="page">
      <div className="section-header">
        <h2 className="display-font" style={{ fontSize: 26 }}>USER MANAGEMENT</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(v => !v)}><Icon name="plus" size={14} /> Create Staff Account</button>
      </div>
      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        {Object.entries(counts).map(([l, n]) => <div key={l} className="kpi-card kpi-info"><div className="kpi-number display-font">{n}</div><div className="kpi-label">{l}</div></div>)}
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-title display-font" style={{ marginBottom: 14 }}>NEW STAFF ACCOUNT</div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">First Name *</label><input className="form-input" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Last Name</label><input className="form-input" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Email *</label><input className="form-input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Password *</label><input className="form-input" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Role</label>
              <select className="form-input form-select" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="engineer">Engineer</option><option value="sales">Sales</option><option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}><button className="btn btn-primary" onClick={create} disabled={saving}>{saving ? 'Creating...' : 'Create Account'}</button><button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button></div>
        </div>
      )}
      {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spinner size={36} /></div>
        : (<div className="table-wrap"><table className="data-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Action</th></tr></thead>
          <tbody>{users.map((u: any) => (
            <tr key={u.id}>
              <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(232,0,28,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--red)', flexShrink: 0 }}>{u.first_name?.charAt(0)}</div><span className="td-primary">{u.first_name} {u.last_name}</span></div></td>
              <td style={{ fontSize: 11, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</td>
              <td><RoleBadge role={u.role} /></td>
              <td><span className={`badge ${u.status === 'active' ? 'badge-warranty' : 'badge-expired'}`}>{u.status}</span></td>
              <td style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(u.created_at).toLocaleDateString()}</td>
              <td><button className={`btn btn-sm ${u.status === 'active' ? 'btn-danger' : 'btn-success'}`} onClick={() => toggle(u.id, u.first_name)} style={{ whiteSpace: 'nowrap' }}>{u.status === 'active' ? 'Deactivate' : 'Activate'}</button></td>
            </tr>))}</tbody>
        </table></div>)}
    </div>
  )
}

// ── ASSET REGISTRY ─────────────────────────────────────────────────────────
export function AssetRegistryPage() {
  const { addToast } = useToast()
  const [assets, setAssets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ serialNumber: '', deviceType: 'Laptop', deviceModel: '', purchaseDate: '', warrantyExpiry: '' })
  const [saving, setSaving] = useState(false)
  const load = () => assetsApi.getAll().then(r => setAssets(r.data.data ?? [])).catch(() => {}).finally(() => setLoading(false))
  useEffect(() => { load() }, [])
  const create = async () => {
    if (!form.serialNumber || !form.deviceModel || !form.warrantyExpiry) { addToast('Fill required fields', 'error'); return }
    setSaving(true)
    try { await assetsApi.create(form); addToast('Asset registered!', 'success'); setShowForm(false); load() }
    catch (err: any) { addToast(err.response?.data?.message ?? 'Failed', 'error') } finally { setSaving(false) }
  }
  return (
    <div className="page">
      <div className="section-header">
        <h2 className="display-font" style={{ fontSize: 26 }}>ASSET REGISTRY</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(v => !v)}><Icon name="plus" size={14} /> Register Asset</button>
      </div>
      {showForm && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-title display-font" style={{ marginBottom: 14 }}>REGISTER NEW ASSET</div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Serial Number *</label><input className="form-input" placeholder="NL15-2024-00001" value={form.serialNumber} onChange={e => setForm(f => ({ ...f, serialNumber: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Device</label>
              <select className="form-input form-select" value={form.deviceModel} onChange={e => { const dev = NETONE_DEVICES.find(d => d.model === e.target.value); setForm(f => ({ ...f, deviceModel: e.target.value, deviceType: dev?.type ?? 'Laptop' })) }}>
                <option value="">Select device...</option>
                {NETONE_DEVICES.map(d => <option key={d.model} value={d.model}>{d.model}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Purchase Date</label><input className="form-input" type="date" value={form.purchaseDate} onChange={e => setForm(f => ({ ...f, purchaseDate: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Warranty Expiry *</label><input className="form-input" type="date" value={form.warrantyExpiry} onChange={e => setForm(f => ({ ...f, warrantyExpiry: e.target.value }))} /></div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}><button className="btn btn-primary" onClick={create} disabled={saving}>{saving ? 'Saving...' : 'Register'}</button><button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button></div>
        </div>
      )}
      {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spinner size={36} /></div>
        : assets.length === 0 ? <EmptyState icon="💻" title="No assets registered" />
        : (<div className="table-wrap"><table className="data-table">
          <thead><tr><th>Serial</th><th>Type</th><th>Model</th><th>Client</th><th>Warranty Expiry</th><th>Status</th></tr></thead>
          <tbody>{assets.map((a: any) => (
            <tr key={a.id}>
              <td className="td-mono">{a.serial_number}</td><td>{a.device_type === 'Phone' ? '📱' : '💻'}</td>
              <td className="td-primary">{a.device_model}</td><td style={{ fontSize: 12 }}>{a.client_name || '—'}</td>
              <td style={{ fontSize: 12, fontWeight: 600, color: a.status === 'expired' ? 'var(--red)' : 'inherit' }}>{a.warranty_expiry?.split('T')[0] || '—'}</td>
              <td><WarrantyBadge status={a.status} /></td>
            </tr>))}</tbody>
        </table></div>)}
    </div>
  )
}

// ── CREATE TICKET (Admin) ─────────────────────────────────────────────────
export function CreateTicketPage() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [source, setSource] = useState('walk-in')
  const [selectedDevice, setSelectedDevice] = useState('')
  const [form, setForm] = useState({ clientEmail: '', clientFirstName: '', clientLastName: '', clientPhone: '', serialNumber: '', category: '', description: '' })
  const [submitting, setSubmitting] = useState(false)
  const deviceCategory = selectedDevice ? getDeviceCategory(selectedDevice) : ''
  const problems = deviceCategory ? DEVICE_PROBLEMS[deviceCategory] ?? [] : []
  const handle = async () => {
    if (!form.clientEmail || !form.serialNumber || !form.category || !form.description || !selectedDevice) { addToast('Fill all required fields', 'error'); return }
    setSubmitting(true)
    try {
      const dev = NETONE_DEVICES.find(d => d.model === selectedDevice)
      await ticketsApi.create({ ...form, deviceType: dev?.type ?? 'Laptop', deviceModel: selectedDevice, source })
      addToast('Ticket created!', 'success'); setTimeout(() => navigate('/admin/tickets'), 900)
    } catch (err: any) { addToast(err.response?.data?.message ?? 'Failed', 'error') } finally { setSubmitting(false) }
  }
  return (
    <div className="page">
      <div style={{ maxWidth: 720 }}>
        <h2 className="display-font" style={{ fontSize: 26, marginBottom: 5 }}>CREATE TICKET ON BEHALF</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 18 }}>For walk-in clients or phone-in reports.</p>
        <div className="card">
          <div className="form-group">
            <label className="form-label">Ticket Source</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['walk-in', 'phone', 'web'].map(s => (
                <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px', border: `1.5px solid ${source === s ? 'var(--red)' : 'var(--border)'}`, borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: 13, color: source === s ? 'var(--red)' : 'var(--text-secondary)', transition: 'all 0.2s' }}>
                  <input type="radio" name="source" style={{ accentColor: 'var(--red)' }} checked={source === s} onChange={() => setSource(s)} /> {s.charAt(0).toUpperCase() + s.slice(1)}
                </label>
              ))}
            </div>
          </div>
          <div className="divider" />
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Client Information</div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">First Name</label><input className="form-input" value={form.clientFirstName} onChange={e => setForm(f => ({ ...f, clientFirstName: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Last Name</label><input className="form-input" value={form.clientLastName} onChange={e => setForm(f => ({ ...f, clientLastName: e.target.value }))} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Email *</label><input className="form-input" type="email" value={form.clientEmail} onChange={e => setForm(f => ({ ...f, clientEmail: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.clientPhone} onChange={e => setForm(f => ({ ...f, clientPhone: e.target.value }))} /></div>
          </div>
          <div className="divider" />
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Device & Problem</div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Select Device *</label>
              <select className="form-input form-select" value={selectedDevice} onChange={e => { setSelectedDevice(e.target.value); setForm(f => ({ ...f, category: '' })) }}>
                <option value="">— Choose device —</option>
                {NETONE_DEVICES.map(d => <option key={d.model} value={d.model}>{d.model}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Serial Number *</label><input className="form-input" value={form.serialNumber} onChange={e => setForm(f => ({ ...f, serialNumber: e.target.value }))} /></div>
          </div>
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select className="form-input form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} disabled={!selectedDevice}>
              <option value="">{selectedDevice ? 'Select category...' : 'Select device first'}</option>
              {problems.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Description *</label><textarea className="form-input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" style={{ flex: 1, padding: 12 }} onClick={handle} disabled={submitting}><Icon name="plus" size={14} /> {submitting ? 'Creating...' : 'Create Ticket'}</button>
            <button className="btn btn-secondary" onClick={() => navigate('/admin/tickets')}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── ANNOUNCEMENTS ──────────────────────────────────────────────────────────
export function AnnouncementsPage() {
  const { addToast } = useToast()
  const [list, setList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ tag: 'Product Update', title: '', body: '', publishDate: '' })
  const [saving, setSaving] = useState(false)
  const load = () => announcementsApi.getAll(true).then(r => setList(r.data.data ?? [])).catch(() => {}).finally(() => setLoading(false))
  useEffect(() => { load() }, [])
  const publish = async () => {
    if (!form.title || !form.body) { addToast('Fill title and body', 'error'); return }
    setSaving(true)
    try { await announcementsApi.create(form); addToast('Published!', 'success'); setForm({ tag: 'Product Update', title: '', body: '', publishDate: '' }); load() }
    catch { addToast('Failed', 'error') } finally { setSaving(false) }
  }
  const archive = async (id: number) => { try { await announcementsApi.archive(id); addToast('Archived', 'info'); load() } catch { addToast('Failed', 'error') } }
  return (
    <div className="page">
      <div className="section-header"><h2 className="display-font" style={{ fontSize: 26 }}>ANNOUNCEMENTS</h2></div>
      <div className="grid-2">
        <div>
          {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><Spinner /></div>
            : list.filter(a => !a.is_archived).length === 0 ? <EmptyState icon="📢" title="No announcements" />
            : list.filter(a => !a.is_archived).map((a: any) => (
              <div key={a.id} className="card" style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <span className="announcement-tag">{a.tag}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.publish_date}</span>
                </div>
                <div className="display-font" style={{ fontSize: 17, fontWeight: 800, marginBottom: 6 }}>{a.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 10 }}>{a.body}</div>
                <button className="btn btn-danger btn-sm" onClick={() => archive(a.id)}>Archive</button>
              </div>
            ))}
        </div>
        <div className="card" style={{ height: 'fit-content' }}>
          <div className="card-title display-font" style={{ marginBottom: 14 }}>NEW ANNOUNCEMENT</div>
          <div className="form-group"><label className="form-label">Tag</label>
            <select className="form-input form-select" value={form.tag} onChange={e => setForm(f => ({ ...f, tag: e.target.value }))}>
              <option>Product Update</option><option>Service Advisory</option><option>Maintenance Notice</option><option>Promotion</option>
            </select>
          </div>
          <div className="form-group"><label className="form-label">Title *</label><input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
          <div className="form-group"><label className="form-label">Body *</label><textarea className="form-input" style={{ minHeight: 90 }} value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} /></div>
          <div className="form-group"><label className="form-label">Publish Date</label><input className="form-input" type="date" value={form.publishDate} onChange={e => setForm(f => ({ ...f, publishDate: e.target.value }))} /></div>
          <button className="btn btn-primary btn-full" onClick={publish} disabled={saving}><Icon name="megaphone" size={14} /> {saving ? 'Publishing...' : 'Publish'}</button>
        </div>
      </div>
    </div>
  )
}

// ── REPORTS ────────────────────────────────────────────────────────────────
export function ReportsPage() {
  const { addToast } = useToast()
  const [stats, setStats] = useState<any>(null)
  const [faults, setFaults] = useState<any[]>([])
  const [monthly, setMonthly] = useState<any[]>([])
  const [engineers, setEngineers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    Promise.all([reportsApi.dashboard(), reportsApi.topFaults(), reportsApi.monthly(), reportsApi.engineers()])
      .then(([s, f, m, e]) => { setStats(s.data.data); setFaults(f.data.data ?? []); setMonthly(m.data.data ?? []); setEngineers(e.data.data ?? []) })
      .catch(() => {}).finally(() => setLoading(false))
  }, [])
  const exportExcel = async () => {
    try { const r = await reportsApi.export(); const url = URL.createObjectURL(new Blob([r.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })); const a = document.createElement('a'); a.href = url; a.download = `NetOne-Report-${new Date().toISOString().split('T')[0]}.xlsx`; a.click(); addToast('Report downloaded!', 'success') }
    catch { addToast('Export failed', 'error') }
  }
  const maxF = Math.max(...faults.map((f: any) => +f.count), 1)
  const maxB = Math.max(...monthly.map((m: any) => +m.total), 1)
  const COLORS = ['var(--red)', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b']
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size={40} /></div>
  return (
    <div className="page">
      <div className="section-header">
        <h2 className="display-font" style={{ fontSize: 26 }}>REPORTS & ANALYTICS</h2>
        <button className="btn btn-primary btn-sm" onClick={exportExcel}><Icon name="download" size={14} /> Download Excel</button>
      </div>
      {stats && (<div className="kpi-grid" style={{ marginBottom: 16 }}>
        {[[stats.openTickets, 'Total Open', 'kpi-red'], [stats.resolvedThisMonth, 'Resolved/Month', 'kpi-success'], [stats.pendingVerification, 'Pending', 'kpi-warn'], [stats.avgRating ?? 'N/A', 'Avg Rating', 'kpi-info'], [(stats.avgHours ?? 0) + 'h', 'Avg Hours', 'kpi-dark']].map(([n, l, c]) => (
          <div key={l as string} className={`kpi-card ${c as string}`}><div className="kpi-number display-font" style={{ fontSize: String(n).length > 4 ? 24 : 38 }}>{n as any}</div><div className="kpi-label">{l as string}</div></div>
        ))}
      </div>)}
      <div className="grid-2">
        <div className="card">
          <div className="card-title display-font" style={{ marginBottom: 14 }}>MONTHLY TICKET VOLUME</div>
          {monthly.length === 0 ? <EmptyState icon="📈" title="No data yet" /> : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120, padding: '0 4px' }}>
              {monthly.map((b: any) => (
                <div key={b.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, minWidth: 0 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--red)' }}>{b.total}</span>
                  <div style={{ width: '100%', background: 'var(--red)', borderRadius: '3px 3px 0 0', height: `${(+b.total / maxB) * 100}px`, minHeight: 4, opacity: 0.85 }} />
                  <span style={{ fontSize: 9, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', textAlign: 'center' }}>{b.month}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card">
          <div className="card-title display-font" style={{ marginBottom: 14 }}>TOP FAULT CATEGORIES</div>
          {faults.length === 0 ? <EmptyState icon="🔧" title="No faults logged" /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {faults.map((d: any, i: number) => (
                <div key={d.category} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 80, fontSize: 11, color: 'var(--text-secondary)', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.category}</div>
                  <div style={{ flex: 1, height: 18, background: 'var(--bg-3)', borderRadius: 3, overflow: 'hidden' }}><div style={{ width: `${(+d.count / maxF) * 100}%`, height: '100%', background: COLORS[i % COLORS.length], borderRadius: 3, minWidth: 14, transition: 'width 0.8s' }} /></div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: COLORS[i % COLORS.length], width: 18, textAlign: 'right' }}>{d.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {engineers.length > 0 && (
        <div className="card" style={{ marginTop: 14 }}>
          <div className="card-title display-font" style={{ marginBottom: 14 }}>ENGINEER PERFORMANCE</div>
          <div className="table-wrap"><table className="data-table">
            <thead><tr><th>Engineer</th><th>Assigned</th><th>Resolved</th><th>Avg Hours</th><th>Avg Rating</th></tr></thead>
            <tbody>{engineers.map((e: any) => (
              <tr key={e.engineer}><td className="td-primary">{e.engineer}</td><td>{e.assigned}</td><td style={{ color: '#10b981', fontWeight: 700 }}>{e.resolved}</td><td>{e.avg_hours ?? '—'}</td><td style={{ color: 'var(--red)', fontWeight: 700 }}>{e.avg_rating ? `${e.avg_rating} ★` : '—'}</td></tr>
            ))}</tbody>
          </table></div>
        </div>
      )}
    </div>
  )
}
