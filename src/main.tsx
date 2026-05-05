import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './styles/index.css'

// Apply saved theme immediately to prevent flash
const saved = localStorage.getItem('nc_theme') ?? 'dark'
document.documentElement.setAttribute('data-theme', saved)

const qc = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 60000 } } })
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={qc}><App /></QueryClientProvider>
  </StrictMode>
)
