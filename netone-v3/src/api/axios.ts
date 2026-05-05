import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

export const sanitize = (s: string) => s.replace(/[<>"'`]/g, c => ({'<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;'}[c]??c))

api.interceptors.request.use(cfg => {
  const token = sessionStorage.getItem('nc_token') ?? localStorage.getItem('nc_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})
api.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) {
    sessionStorage.clear(); localStorage.removeItem('nc_token'); localStorage.removeItem('nc_user')
    const isStaff = ['/sales','/engineer','/admin'].some(p => window.location.pathname.startsWith(p))
    window.location.href = isStaff ? '/staff/login' : '/login'
  }
  return Promise.reject(err)
})

export default api
