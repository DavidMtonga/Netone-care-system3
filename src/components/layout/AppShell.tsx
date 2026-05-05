import { useState, useEffect, useRef, type ReactNode } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth, useTheme } from '../../context/AppContext'
import { Icon } from '../ui/UI'
import { notifApi } from '../../api/endpoints'

const NAV: Record<string,{label:string;items:{icon:string;label:string;path:string}[]}[]> = {
  client:[{label:'Menu',items:[
    {icon:'dashboard',label:'My Dashboard',path:'/dashboard'},
    {icon:'ticket',label:'My Tickets',path:'/my-tickets'},
    {icon:'book',label:'Self-Help',path:'/self-help'},
    {icon:'settings',label:'Profile',path:'/profile'},
  ]}],
  sales:[{label:'Work Queue',items:[
    {icon:'dashboard',label:'Dashboard',path:'/sales'},
    {icon:'inbox',label:'Pending Queue',path:'/sales/inbox'},
    {icon:'ticket',label:'All Tickets',path:'/sales/tickets'},
    {icon:'settings',label:'Profile',path:'/profile'},
  ]}],
  engineer:[{label:'My Work',items:[
    {icon:'dashboard',label:'Dashboard',path:'/engineer'},
    {icon:'wrench',label:'My Tickets',path:'/engineer/tickets'},
    {icon:'settings',label:'Profile',path:'/profile'},
  ]}],
  admin:[
    {label:'Overview',items:[
      {icon:'dashboard',label:'Dashboard',path:'/admin'},
      {icon:'ticket',label:'All Tickets',path:'/admin/tickets'},
      {icon:'asset',label:'Asset Registry',path:'/admin/assets'},
    ]},
    {label:'Management',items:[
      {icon:'users',label:'User Management',path:'/admin/users'},
      {icon:'plus',label:'Create Ticket',path:'/admin/create-ticket'},
      {icon:'megaphone',label:'Announcements',path:'/admin/announcements'},
      {icon:'report',label:'Reports',path:'/admin/reports'},
      {icon:'settings',label:'Profile',path:'/profile'},
    ]},
  ],
}
NAV.superadmin = NAV.admin

const RC: Record<string,string> = { client:'#3b82f6', sales:'#8b5cf6', engineer:'#10b981', admin:'var(--red)', superadmin:'var(--red)' }
const RL: Record<string,string> = { client:'Customer', sales:'Sales Team', engineer:'Engineer', admin:'Administrator', superadmin:'Super Admin' }

function NotifPanel({ onClose }: { onClose: () => void }) {
  const [notifs, setNotifs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    notifApi.getAll().then(r => setNotifs(r.data.data ?? [])).catch(() => {}).finally(() => setLoading(false))
  }, [])
  const markAll = async () => { await notifApi.markAll().catch(() => {}); setNotifs(n => n.map(x => ({...x, is_read:true}))) }
  const markOne = async (id: number) => { await notifApi.markOne(id).catch(() => {}); setNotifs(n => n.map(x => x.id===id?{...x,is_read:true}:x)) }
  const unread = notifs.filter(n => !n.is_read).length

  return (
    <div className="notif-panel" style={{ maxHeight:400, overflow:'hidden', display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'12px 14px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:14, fontWeight:700 }}>Notifications</span>
          {unread > 0 && <span style={{ background:'var(--red)', color:'white', fontSize:10, fontWeight:700, padding:'1px 7px', borderRadius:10 }}>{unread}</span>}
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          {unread > 0 && <span style={{ fontSize:11, color:'var(--red)', cursor:'pointer', fontWeight:600 }} onClick={markAll}>Mark all read</span>}
          <span style={{ cursor:'pointer', color:'var(--text-muted)', fontSize:16 }} onClick={onClose}>✕</span>
        </div>
      </div>
      <div style={{ overflow:'auto', flex:1 }}>
        {loading && <div style={{ padding:24, textAlign:'center', color:'var(--text-muted)' }}>Loading...</div>}
        {!loading && notifs.length === 0 && <div style={{ padding:24, textAlign:'center', color:'var(--text-muted)' }}>No notifications yet</div>}
        {notifs.map(n => (
          <div key={n.id} className={`notif-item ${!n.is_read?'unread':''}`} onClick={() => markOne(n.id)}>
            <div>{!n.is_read && <div className="notif-dot-unread" />}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', marginBottom:2 }}>{n.title}</div>
              <div style={{ fontSize:12, color:'var(--text-secondary)', lineHeight:1.5 }}>{n.message}</div>
              <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:3 }}>{new Date(n.created_at).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AppShell() {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showNotif, setShowNotif] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setSidebarOpen(false) }, [location.pathname])

  // Poll notifications every 30 seconds
  useEffect(() => {
    const load = () => notifApi.unread().then(r => setUnreadCount(r.data.data?.count ?? 0)).catch(() => {})
    load()
    const t = setInterval(load, 30000)
    return () => clearInterval(t)
  }, [])

  // Close notif panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!user) return null
  const sections = NAV[user.role] ?? []
  const color = RC[user.role] ?? 'var(--red)'
  const pageName = location.pathname.split('/').filter(Boolean).slice(-1)[0]?.replace(/-/g,' ').toUpperCase() || 'DASHBOARD'
  const isStaffRole = ['sales','engineer','admin','superadmin'].includes(user.role)

  return (
    <div className="app-shell">
      {/* Overlay */}
      <div className={`sidebar-overlay ${sidebarOpen?'visible':''}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen?'open':''}`}>
        <div className="sidebar-logo">
          <div className="logo-mark" style={{ cursor:'pointer' }} onClick={() => { navigate('/'); setSidebarOpen(false) }}>
            <div className="logo-icon">N</div>
            <div><div className="logo-text">NetOne Care</div><div className="logo-sub">Support Portal</div></div>
          </div>
          <button onClick={() => setSidebarOpen(false)} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', padding:4 }}>
            <Icon name="x" size={16} />
          </button>
        </div>

        {sections.map(s => (
          <div key={s.label} className="sidebar-section">
            <div className="sidebar-label">{s.label}</div>
            {s.items.map(item => (
              <div key={item.path}
                className={`nav-item ${location.pathname===item.path||location.pathname.startsWith(item.path+'/')?'active':''}`}
                onClick={() => navigate(item.path)}>
                <span style={{ flexShrink:0 }}><Icon name={item.icon} size={15} /></span>
                {item.label}
                {item.path==='/sales/inbox' && unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
              </div>
            ))}
          </div>
        ))}

        <div className="sidebar-bottom">
          <div className="user-pill">
            <div className="user-avatar" style={{ background:color+'33', color }}>{user.first_name?.charAt(0)}</div>
            <div className="user-info">
              <div className="user-name">{user.first_name} {user.last_name}</div>
              <div className="user-role">{RL[user.role]}</div>
            </div>
            <div style={{ cursor:'pointer', color:'var(--text-muted)', padding:4 }}
              onClick={() => { logout(); navigate(isStaffRole?'/staff/login':'/login') }}
              title="Logout">
              <Icon name="logout" size={15} />
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="main-area">
        <div className="topbar">
          <button className="hamburger-btn" onClick={() => setSidebarOpen(v => !v)}>
            <Icon name="menu" size={18} />
          </button>
          <div className="topbar-title display-font">{pageName}</div>
          <div className="topbar-actions">
            <button className="theme-btn" onClick={toggle} title="Toggle theme">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <div ref={notifRef} style={{ position:'relative' }}>
              <div className="icon-btn" onClick={() => setShowNotif(v => !v)} title="Notifications">
                <Icon name="bell" size={17} />
                {unreadCount > 0 && <span className="notif-dot" />}
              </div>
              {showNotif && <NotifPanel onClose={() => setShowNotif(false)} />}
            </div>
            <div style={{ fontSize:12, fontWeight:700, color, background:color+'18', padding:'4px 10px', borderRadius:'var(--radius)', cursor:'default', display:'flex', alignItems:'center', gap:5 }}>
              {user.first_name}
            </div>
            <button className="icon-btn" onClick={() => { logout(); navigate(isStaffRole?'/staff/login':'/login') }} title="Logout">
              <Icon name="logout" size={16} />
            </button>
          </div>
        </div>
        <div className="content-area"><Outlet /></div>
      </div>
    </div>
  )
}
