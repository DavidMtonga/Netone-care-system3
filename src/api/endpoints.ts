import api from './axios'

export const authApi = {
  register: (d:any) => api.post('/auth/register', d),
  verifyOtp: (email:string, otp:string) => api.post('/auth/verify-otp', {email,otp}),
  login: (email:string, pw:string) => api.post('/auth/login', {email, password:pw}),
  forgotPassword: (email:string) => api.post('/auth/forgot-password', {email}),
  resetPassword: (token:string, pw:string) => api.post('/auth/reset-password', {token, password:pw}),
  me: () => api.get('/auth/me'),
}

export const ticketsApi = {
  getAll: (params?:any) => api.get('/tickets', {params}),
  getOne: (id:number) => api.get(`/tickets/${id}`),
  create: (d:any) => api.post('/tickets', d),
  verify: (id:number, d:any) => api.patch(`/tickets/${id}/verify`, d),
  close: (id:number, resolution:string, workType?:string) => api.patch(`/tickets/${id}/close`, {resolution, workType}),
  rate: (id:number, rating:number, comment?:string) => api.patch(`/tickets/${id}/rate`, {rating,comment}),
  updateStatus: (id:number, status:string) => api.patch(`/tickets/${id}/status`, {status}),
  setWorkType: (id:number, workType:string) => api.patch(`/tickets/${id}/status`, {workType}),
  addReply: (id:number, message:string, isInternal=false) => api.post(`/replies/${id}/replies`, {message, isInternal}),
}

export const usersApi = {
  getAll: () => api.get('/users'),
  getEngineers: () => api.get('/users/engineers'),
  updateMe: (d:any) => api.patch('/users/me', d),
  createStaff: (d:any) => api.post('/users', d),
  toggle: (id:number) => api.patch(`/users/${id}/toggle`),
}

export const assetsApi = {
  getAll: (params?:any) => api.get('/assets', {params}),
  getBySerial: (serial:string) => api.get(`/assets/${serial}`),
  create: (d:any) => api.post('/assets', d),
  getMine: () => api.get('/assets/my'),
}

export const notifApi = {
  getAll: () => api.get('/notifications'),
  unread: () => api.get('/notifications/unread'),
  markAll: () => api.patch('/notifications/read-all'),
  markOne: (id:number) => api.patch(`/notifications/${id}/read`),
}

export const announcementsApi = {
  getAll: (all=false) => api.get('/announcements', {params:{all}}),
  create: (d:any) => api.post('/announcements', d),
  update: (id:number, d:any) => api.patch(`/announcements/${id}`, d),
  archive: (id:number) => api.patch(`/announcements/${id}/archive`),
}

export const kbApi = {
  getAll: (params?:any) => api.get('/knowledge-base', {params}),
  getOne: (id:number) => api.get(`/knowledge-base/${id}`),
  create: (d:any) => api.post('/knowledge-base', d),
  update: (id:number, d:any) => api.patch(`/knowledge-base/${id}`, d),
  remove: (id:number) => api.delete(`/knowledge-base/${id}`),
}

export const reportsApi = {
  dashboard: () => api.get('/reports/dashboard'),
  topFaults: () => api.get('/reports/top-faults'),
  monthly: () => api.get('/reports/monthly'),
  engineers: () => api.get('/reports/engineers'),
  export: () => api.get('/reports/export', {responseType:'blob'}),
}
