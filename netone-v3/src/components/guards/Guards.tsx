import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AppContext'

export function PrivateRoute() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}
export function StaffPrivateRoute() {
  const { isAuthenticated, isStaff } = useAuth()
  if (!isAuthenticated) return <Navigate to="/staff/login" replace />
  if (!isStaff) return <Navigate to="/dashboard" replace />
  return <Outlet />
}
export function RoleRoute({ roles }: { roles: string[] }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  const r: Record<string,string> = { client:'/dashboard', sales:'/sales', engineer:'/engineer', admin:'/admin', superadmin:'/admin' }
  if (!roles.includes(user.role)) return <Navigate to={r[user.role]??'/'} replace />
  return <Outlet />
}
