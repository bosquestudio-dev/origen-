import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/stores/auth.store'
import AppButton from '@/components/origen/AppButton'
import AppModal from '@/components/origen/AppModal'

export default function LoginPage() {
  const { login, isSessionValid, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [loginType, setLoginType] = useState<'email' | 'dni' | null>(null)
  const [identifier, setIdentifier] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorModal, setErrorModal] = useState(false)

  useEffect(() => {
    if (isSessionValid) {
      navigate(isAdmin ? '/admin' : '/calendar', { replace: true })
    }
  }, [isSessionValid, isAdmin, navigate])

  if (isSessionValid) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginType || !identifier.trim()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    const success = login(identifier.trim(), loginType)
    setLoading(false)
    if (success) {
      // Re-read from store after login to check role
      const raw = localStorage.getItem('origen_user')
      if (raw) {
        const parsed = JSON.parse(raw)
        navigate(parsed.user.role === 'admin' ? '/admin' : '/calendar')
      }
    } else {
      setErrorModal(true)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Animated gradient orbs */}
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />
      <div className="login-orb login-orb-3" />

      <div className="relative z-10 w-full max-w-sm px-6">
        <div className="glass-card rounded-2xl px-8 py-10 space-y-8 text-center">
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">¿Tienes correo de empresa?</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { setLoginType('email'); setIdentifier('') }}
              className={`p-4 rounded-card border text-sm transition-all duration-200 ${
                loginType === 'email'
                  ? 'border-accent bg-accent/10 text-foreground'
                  : 'border-border bg-surface text-muted-foreground hover:border-accent/40'
              }`}
            >
              Sí, tengo email
            </button>
            <button
              onClick={() => { setLoginType('dni'); setIdentifier('') }}
              className={`p-4 rounded-card border text-sm transition-all duration-200 ${
                loginType === 'dni'
                  ? 'border-accent bg-accent/10 text-foreground'
                  : 'border-border bg-surface text-muted-foreground hover:border-accent/40'
              }`}
            >
              No, uso DNI
            </button>
          </div>
        </div>

        {loginType && (
          <form onSubmit={handleSubmit} className="space-y-4 animate-[fade-in_0.3s_ease]">
            <input
              type={loginType === 'email' ? 'email' : 'text'}
              placeholder={loginType === 'email' ? 'tu.nombre@empresa.com' : 'Introduce tu DNI'}
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              className="w-full bg-surface border border-border rounded-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent transition-colors"
            />
            <AppButton type="submit" loading={loading} disabled={!identifier.trim()} className="w-full">
              Acceder
            </AppButton>
          </form>
        )}
        </div>
      </div>

      <AppModal isOpen={errorModal} onClose={() => setErrorModal(false)}>
        <div className="space-y-4 text-center">
          <h3 className="text-lg font-medium text-foreground">No hemos encontrado tu acceso</h3>
          <p className="text-sm text-muted-foreground">Notifica a tu equipo de RRHH que no puedes acceder</p>
          <div className="bg-surface-3 rounded-card px-4 py-2 text-sm text-foreground">{identifier}</div>
          <AppButton onClick={() => setErrorModal(false)} className="w-full">Enviar notificación</AppButton>
        </div>
      </AppModal>
    </div>
  )
}
