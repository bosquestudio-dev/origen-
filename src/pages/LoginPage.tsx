import { useState } from 'react'
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

  if (isSessionValid) {
    navigate(isAdmin ? '/admin' : '/calendar', { replace: true })
    return null
  }

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
    <div className="min-h-screen flex items-center justify-center dot-grid-bg relative">
      <div className="absolute inset-0 bg-background/60" />
      <div className="relative z-10 w-full max-w-md px-6 space-y-10 text-center">
        <div>
          <h1 className="text-6xl font-light tracking-[0.2em] text-foreground mb-4">ORIGEN</h1>
          <p className="text-sm text-muted-foreground">Accede con tu correo corporativo o DNI</p>
        </div>

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
