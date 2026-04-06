import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/stores/auth.store'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default function AdminLayout() {
  const { isSessionValid, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isSessionValid) {
      logout()
      navigate('/', { replace: true })
    } else if (!isAdmin) {
      navigate('/calendar', { replace: true })
    }
  }, [isSessionValid, isAdmin, logout, navigate])

  if (!isSessionValid || !isAdmin) return null

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
