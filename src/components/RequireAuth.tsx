import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../lib/auth'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth()
  const { pathname } = useLocation()
  if (status === 'loading') return null
  if (status === 'out') return <Navigate to={`/login?next=${encodeURIComponent(pathname)}`} replace />
  return children
}
