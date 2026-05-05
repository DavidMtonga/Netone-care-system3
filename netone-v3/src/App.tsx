import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { ThemeProvider, AuthProvider, ToastProvider } from './context/AppContext'
import { PrivateRoute, StaffPrivateRoute, RoleRoute } from './components/guards/Guards'
import { AppShell } from './components/layout/AppShell'

import { LandingPage }        from './pages/public/LandingPage'
import { LoginPage }          from './pages/public/LoginPage'
import { StaffLoginPage }     from './pages/public/StaffLoginPage'
import { RegisterPage }       from './pages/public/RegisterPage'
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage'

import { ClientDashboard, MyTicketsPage, TicketDetailPage, ProfilePage } from './pages/client/ClientPages'

import {
  SalesDashboard, SalesInboxPage, AllTicketsPage,
  EngineerDashboard, EngineerTicketsPage,
  AdminDashboard, UserManagementPage, AssetRegistryPage,
  CreateTicketPage, AnnouncementsPage, ReportsPage,
} from './pages/staff/StaffPages'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/"                element={<LandingPage />} />
              <Route path="/login"           element={<LoginPage />} />
              <Route path="/staff/login"     element={<StaffLoginPage />} />
              <Route path="/register"        element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Client - public login, localStorage */}
              <Route element={<PrivateRoute />}>
                <Route element={<RoleRoute roles={['client']} />}>
                  <Route element={<AppShell />}>
                    <Route path="/dashboard"       element={<ClientDashboard />} />
                    <Route path="/my-tickets"      element={<MyTicketsPage />} />
                    <Route path="/my-tickets/:id"  element={<TicketDetailPage />} />
                    <Route path="/self-help"       element={<ClientDashboard />} />
                    <Route path="/profile"         element={<ProfilePage />} />
                  </Route>
                </Route>
              </Route>

              {/* Sales - staff login, sessionStorage */}
              <Route element={<StaffPrivateRoute />}>
                <Route element={<RoleRoute roles={['sales']} />}>
                  <Route element={<AppShell />}>
                    <Route path="/sales"           element={<SalesDashboard />} />
                    <Route path="/sales/inbox"     element={<SalesDashboard />} />
                    <Route path="/sales/inbox/:id" element={<SalesInboxPage />} />
                    <Route path="/sales/tickets"   element={<AllTicketsPage />} />
                    <Route path="/profile"         element={<ProfilePage />} />
                  </Route>
                </Route>
              </Route>

              {/* Engineer - staff login, sessionStorage */}
              <Route element={<StaffPrivateRoute />}>
                <Route element={<RoleRoute roles={['engineer']} />}>
                  <Route element={<AppShell />}>
                    <Route path="/engineer"         element={<EngineerDashboard />} />
                    <Route path="/engineer/tickets" element={<EngineerTicketsPage />} />
                    <Route path="/profile"          element={<ProfilePage />} />
                  </Route>
                </Route>
              </Route>

              {/* Admin - staff login, sessionStorage */}
              <Route element={<StaffPrivateRoute />}>
                <Route element={<RoleRoute roles={['admin','superadmin']} />}>
                  <Route element={<AppShell />}>
                    <Route path="/admin"                   element={<AdminDashboard />} />
                    <Route path="/admin/tickets"           element={<AllTicketsPage />} />
                    <Route path="/admin/users"             element={<UserManagementPage />} />
                    <Route path="/admin/assets"            element={<AssetRegistryPage />} />
                    <Route path="/admin/create-ticket"     element={<CreateTicketPage />} />
                    <Route path="/admin/announcements"     element={<AnnouncementsPage />} />
                    <Route path="/admin/reports"           element={<ReportsPage />} />
                    <Route path="/profile"                 element={<ProfilePage />} />
                  </Route>
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
