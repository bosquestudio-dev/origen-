import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/stores/auth.store'
import { useState } from 'react'
import AppModal from '@/components/origen/AppModal'
import AppButton from '@/components/origen/AppButton'
import { BarChart3, Calendar, Settings, LogOut, Menu, X } from 'lucide-react'

const links = [
  { to: '/admin', label: 'Dashboard', icon: BarChart3, end: true },
  { to: '/admin/challenges', label: 'Retos', icon: Calendar },
  { to: '/admin/company', label: 'Empresa', icon: Settings },
]

export default function AdminSidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showLogout, setShowLogout] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    setShowLogout(false)
    logout()
    navigate('/')
  }

  const nav = (
    <>
      <div className="p-6 border-b border-border">
        <h1 className="text-sm font-medium tracking-[0.15em] text-foreground">ORIGEN</h1>
        <span className="text-[10px] uppercase tracking-widest text-accent mt-1 inline-block">Admin</span>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-card text-sm transition-colors ${
                isActive ? 'bg-accent/15 text-accent' : 'text-muted-foreground hover:text-foreground hover:bg-surface-3'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground mb-3 truncate">{user?.name}</p>
        <button
          onClick={() => setShowLogout(true)}
          className="flex items-center gap-2 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
        >
          <LogOut size={14} />
          Cerrar sesión
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-surface-2 border border-border rounded-card"
      >
        <Menu size={18} className="text-foreground" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-background/80" onClick={() => setMobileOpen(false)} />
          <div className="relative w-60 bg-surface border-r border-border flex flex-col h-full">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-muted-foreground">
              <X size={18} />
            </button>
            {nav}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 bg-surface border-r border-border flex-col h-screen sticky top-0">
        {nav}
      </aside>

      <AppModal isOpen={showLogout} onClose={() => setShowLogout(false)}>
        <div className="space-y-4 text-center">
          <h3 className="text-lg font-medium text-foreground">¿Seguro que quieres salir?</h3>
          <p className="text-sm text-muted-foreground">Podrás volver a acceder cuando quieras</p>
          <div className="flex gap-3 justify-center pt-2">
            <AppButton variant="ghost" onClick={() => setShowLogout(false)}>Cancelar</AppButton>
            <AppButton onClick={handleLogout}>Salir</AppButton>
          </div>
        </div>
      </AppModal>
    </>
  )
}
