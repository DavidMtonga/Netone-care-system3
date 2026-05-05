// ── ICON ──
interface IP { name:string; size?:number; color?:string; className?:string }
export function Icon({ name, size=18, color='currentColor', className='' }: IP) {
  const p = { width:size, height:size, fill:'none' as const, stroke:color, strokeWidth:2, viewBox:'0 0 24 24', className }
  const icons: Record<string,JSX.Element> = {
    dashboard:<svg {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
    ticket:<svg {...p}><path d="M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 012 2v3a2 2 0 000 4v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 000-4V7a2 2 0 012-2z"/></svg>,
    asset:<svg {...p}><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>,
    user:<svg {...p}><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
    users:<svg {...p}><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3 2.7-5 6-5h.5"/><circle cx="17" cy="9" r="3"/><path d="M21 20c0-3-2.7-5-6-5h-.5"/></svg>,
    report:<svg {...p}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>,
    bell:<svg {...p}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>,
    search:<svg {...p}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>,
    plus:<svg {...p}><path d="M12 5v14M5 12h14"/></svg>,
    send:<svg {...p}><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/></svg>,
    check:<svg {...p}><path d="M20 6L9 17l-5-5"/></svg>,
    x:<svg {...p}><path d="M18 6L6 18M6 6l12 12"/></svg>,
    logout:<svg {...p}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
    download:<svg {...p}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>,
    settings:<svg {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
    book:<svg {...p}><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
    filter:<svg {...p}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
    refresh:<svg {...p}><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>,
    inbox:<svg {...p}><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></svg>,
    mail:<svg {...p}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    phone:<svg {...p}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.7 12.9a19.79 19.79 0 01-3.07-8.67A2 2 0 012.61 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 9.91a16 16 0 006.09 6.09l.95-.95a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
    warning:<svg {...p}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    megaphone:<svg {...p}><path d="M21 15a2 2 0 000-4H5l-3 2 3 2h16zM7 15v5a1 1 0 001 1h2a1 1 0 001-1v-5"/></svg>,
    wrench:<svg {...p}><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>,
    shield:<svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    lock:<svg {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
    eye:<svg {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    menu:<svg {...p}><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
    'arrow-left':<svg {...p}><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
    sun:<svg {...p}><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
    moon:<svg {...p}><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>,
    monitor:<svg {...p}><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>,
    wifi:<svg {...p}><path d="M5 12.55a11 11 0 0114.08 0"/><path d="M1.42 9a16 16 0 0121.16 0"/><path d="M8.53 16.11a6 6 0 016.95 0"/><circle cx="12" cy="20" r="1"/></svg>,
    zap:<svg {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    bot:<svg {...p}><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4M8 15h.01M16 15h.01"/></svg>,
    star:<svg {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    laptop:<svg {...p}><path d="M20 16V7a2 2 0 00-2-2H6a2 2 0 00-2 2v9m16 0H4m16 0l1.28 2.55a1 1 0 01-.9 1.45H3.62a1 1 0 01-.9-1.45L4 16"/></svg>,
    trash:<svg {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
    clock:<svg {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    'video':<svg {...p}><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
    'map-pin':<svg {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  }
  return icons[name] ?? <svg {...p}><circle cx="12" cy="12" r="10"/></svg>
}

// ── BADGES ──
export function StatusBadge({ status }: { status: string }) {
  const m: Record<string,[string,string]> = {
    pending:  ['badge-pending','PENDING'],
    inprogress:['badge-inprogress','IN PROGRESS'],
    remote:   ['badge-remote','REMOTE WORK'],
    physical: ['badge-physical','PHYSICAL DROP-OFF'],
    awaiting: ['badge-awaiting','AWAITING DEVICE'],
    ready:    ['badge-ready','READY FOR PICKUP'],
    closed:   ['badge-closed','CLOSED'],
  }
  const [cls,label] = m[status] ?? ['badge-closed', status.toUpperCase()]
  return <span className={`badge ${cls}`}>{label}</span>
}
export function WarrantyBadge({ status }: { status: string }) {
  const cls = status==='active'?'badge-warranty':status==='expired'?'badge-expired':'badge-unknown'
  return <span className={`badge ${cls}`}>{status}</span>
}
export function RoleBadge({ role }: { role: string }) {
  return <span className={`badge role-${role}`}>{role.toUpperCase()}</span>
}

// ── SPINNER ──
export function Spinner({ size=24 }: { size?:number }) {
  return <div className="spinner" style={{ width:size, height:size }} />
}

// ── EMPTY STATE ──
export function EmptyState({ icon='🔍', title='Nothing here', description }: { icon?:string; title?:string; description?:string }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <div style={{ fontSize:15, fontWeight:600, color:'var(--text-secondary)', marginBottom:5 }}>{title}</div>
      {description && <div style={{ fontSize:13, color:'var(--text-muted)' }}>{description}</div>}
    </div>
  )
}
