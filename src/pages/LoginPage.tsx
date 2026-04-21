import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/stores/auth.store'
import AppButton from '@/components/origen/AppButton'
import LoadingScreen from '@/components/auth/LoadingScreen'

const STOPS = [
  { offset: '0%',   color: '#E8693A', opacity: 1    },
  { offset: '20%',  color: '#C4527A', opacity: 0.95 },
  { offset: '45%',  color: '#9B59B6', opacity: 0.9  },
  { offset: '65%',  color: '#7B5CE7', opacity: 0.8  },
  { offset: '80%',  color: '#4B2FC9', opacity: 0.5  },
  { offset: '100%', color: '#000000', opacity: 0    },
]

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DNI_RE   = /^[0-9]{7,8}[A-Za-z]$/

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" style={{ animation: 'spin 0.8s linear infinite', display: 'block' }}>
      <circle cx="8" cy="8" r="6" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
      <path d="M8 2 A6 6 0 0 1 14 8" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default function LoginPage() {
  const { login, isSessionValid, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [loginType, setLoginType] = useState<'email' | 'dni' | null>(null)
  const [identifier, setIdentifier] = useState('')
  const [loading, setLoading] = useState(false)
  const [showLoader, setShowLoader] = useState(false)
  const [errorModal, setErrorModal] = useState(false)
  const [modalIdentifier, setModalIdentifier] = useState('')
  const [consented, setConsented] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)

  // Check session on mount — redirect or show expired toast
  useEffect(() => {
    try {
      const raw = localStorage.getItem('origen_user')
      if (raw) {
        const parsed = JSON.parse(raw)
        const elapsed = Date.now() - (parsed.loginTimestamp ?? 0)
        if (elapsed < NINETY_DAYS_MS) {
          navigate(parsed.user?.role === 'admin' ? '/admin' : '/calendar', { replace: true })
        } else {
          localStorage.removeItem('origen_user')
          localStorage.removeItem('origen_completions')
          toast.info('Tu sesión ha expirado. Vuelve a acceder.', { duration: 4000 })
        }
      }
    } catch {
      localStorage.removeItem('origen_user')
    }
  }, [navigate])

  useEffect(() => {
    if (isSessionValid) {
      navigate(isAdmin ? '/admin' : '/calendar', { replace: true })
    }
  }, [isSessionValid, isAdmin, navigate])

  useEffect(() => {
    if (errorModal) {
      requestAnimationFrame(() => setModalVisible(true))
    } else {
      setModalVisible(false)
    }
  }, [errorModal])

  if (isSessionValid) return null

  const handleSubmit = async () => {
    if (!loginType || !consented) return

    // Validate empty
    if (!identifier.trim()) {
      toast.error('El campo no puede estar vacío', { duration: 2500 })
      return
    }

    // Validate format
    if (loginType === 'email' && !EMAIL_RE.test(identifier.trim())) {
      toast.error('Introduce un email válido', {
        description: 'Ejemplo: tu.nombre@empresa.com',
        duration: 3000,
      })
      return
    }
    if (loginType === 'dni' && !DNI_RE.test(identifier.trim())) {
      toast.error('Introduce un DNI válido', {
        description: 'Formato: 12345678A',
        duration: 3000,
      })
      return
    }

    // Activate spinner — let React paint it first
    setLoading(true)
    await new Promise(r => setTimeout(r, 50))
    await new Promise(r => setTimeout(r, 800))

    const success = login(identifier.trim(), loginType)

    if (success) {
      const raw = localStorage.getItem('origen_user')
      if (raw) {
        const parsed = JSON.parse(raw)
        const firstName = parsed.user?.name?.split(' ')[0] || 'bienvenido/a'
        toast.success(`Bienvenido/a, ${firstName}`)
        setShowLoader(true)
        setTimeout(() => {
          navigate(parsed.user.role === 'admin' ? '/admin' : '/calendar')
        }, 1600)
      }
    } else {
      setLoading(false)
      setModalIdentifier(identifier)
      setErrorModal(true)
    }
  }

  const handleSendNotification = () => {
    setErrorModal(false)
    toast.success('Notificación enviada correctamente')
  }

  return (
    <>
    <LoadingScreen isVisible={showLoader} />
    <div style={{ position: 'fixed', inset: 0, background: '#000000' }}>
      {/* SVG aurora background */}
      <div
        style={{ position: 'fixed', inset: 0, background: '#000000', overflow: 'hidden', zIndex: 0 }}
        aria-hidden
      >
        <svg
          style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100%', overflow: 'visible' }}
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMax slice"
        >
          <defs>
            <filter id="blur-filter"><feGaussianBlur stdDeviation="35" /></filter>
            <radialGradient id="aurora-g" gradientUnits="userSpaceOnUse" cx="720" cy="900" r="1100">
              {STOPS.map(s => (
                <stop key={s.offset} offset={s.offset} stopColor={s.color} stopOpacity={s.opacity} />
              ))}
            </radialGradient>
          </defs>
          <ellipse cx="720" cy="950" rx="1440" ry="480" fill="url(#aurora-g)" filter="url(#blur-filter)">
            <animate attributeName="rx" values="1440;1480;1440" dur="8s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1; 0.4 0 0.6 1" />
            <animate attributeName="ry" values="480;460;480" dur="8s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1; 0.4 0 0.6 1" />
          </ellipse>
        </svg>
      </div>

      {/* Card centrador */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100vh' }}>
        <div
          className="glass-card"
          style={{
            background: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 20,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
            padding: 32,
            width: '90%',
            maxWidth: 420,
            display: 'flex',
            flexDirection: 'column' as const,
            gap: 24,
          }}
        >
          {/* Type selector */}
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
            <p style={{
              fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.12em',
              textAlign: 'center' as const, margin: 0, color: 'rgba(255,255,255,0.5)',
            }}>
              ¿Tienes correo de empresa?
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {(['email', 'dni'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => { setLoginType(type); setIdentifier('') }}
                  style={{
                    padding: '14px 10px', borderRadius: 10, fontSize: 13, cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: `1px solid ${loginType === type ? 'hsl(245 52% 67%)' : 'rgba(255,255,255,0.12)'}`,
                    background: loginType === type ? 'hsl(245 52% 67% / 0.15)' : 'rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.9)',
                  }}
                >
                  {type === 'email' ? 'Sí, tengo email' : 'No, uso DNI'}
                </button>
              ))}
            </div>
          </div>

          {loginType && (
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
              <input
                type={loginType === 'email' ? 'email' : 'text'}
                placeholder={loginType === 'email' ? 'tu.nombre@empresa.com' : 'Introduce tu DNI'}
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                autoComplete={loginType === 'email' ? 'email' : 'off'}
                autoCorrect="off"
                autoCapitalize={loginType === 'dni' ? 'characters' : 'off'}
                spellCheck={false}
                style={{
                  width: '100%', boxSizing: 'border-box' as const, borderRadius: 10,
                  padding: '12px 16px', fontSize: 14, outline: 'none', transition: 'all 0.2s ease',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.9)',
                }}
              />

              {/* Consent checkbox */}
              <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={consented}
                  onChange={e => setConsented(e.target.checked)}
                  disabled={loading}
                  style={{ width: 16, height: 16, flexShrink: 0, marginTop: 2, cursor: 'pointer', accentColor: '#7F77DD' }}
                />
                <span style={{ fontSize: 12, lineHeight: 1.5, color: 'rgba(255,255,255,0.7)' }}>
                  Acepto el tratamiento de mis datos personales conforme a la{' '}
                  <a href="#" onClick={e => e.preventDefault()} style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'underline' }}>
                    política de privacidad
                  </a>
                  {' '}de la empresa.
                </span>
              </label>

              <div style={{ opacity: consented && !loading ? 1 : 0.4, transition: 'opacity 0.2s ease', pointerEvents: consented && !loading ? 'auto' : 'none' }}>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!consented || loading}
                  style={{
                    width: '100%', padding: '12px', borderRadius: 10, border: 'none',
                    background: 'hsl(245 52% 67%)', color: '#fff', fontSize: 14, fontWeight: 500,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    opacity: loading ? 0.8 : 1, transition: 'opacity 0.2s ease',
                  }}
                >
                  {loading ? (
                    <>
                      <Spinner />
                      Verificando...
                    </>
                  ) : 'Acceder'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error modal */}
      {errorModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => setErrorModal(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: 20,
              boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
              padding: 32, maxWidth: 400, width: '90%',
              display: 'flex', flexDirection: 'column' as const, gap: 20,
              transform: modalVisible ? 'scale(1)' : 'scale(0.95)',
              opacity: modalVisible ? 1 : 0,
              transition: 'transform 200ms ease-out, opacity 200ms ease-out',
            }}
          >
            <div style={{ textAlign: 'center' as const }}>
              <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 500, color: '#F5F5F5' }}>
                No hemos podido encontrar tu acceso
              </h3>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: 'rgba(255,255,255,0.6)' }}>
                Notifica a tu equipo de Recursos Humanos que no puedes acceder.
              </p>
            </div>

            {/* Editable identifier field */}
            <input
              value={modalIdentifier}
              onChange={e => setModalIdentifier(e.target.value)}
              style={{
                width: '100%', boxSizing: 'border-box' as const,
                borderRadius: 8, padding: '10px 14px', fontSize: 14,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#F5F5F5', outline: 'none', transition: 'all 0.2s ease',
              }}
              onFocus={e => {
                e.currentTarget.style.border = '1px solid rgba(127,119,221,0.6)'
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
              }}
              onBlur={e => {
                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.15)'
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
              }}
            />

            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
              <AppButton onClick={handleSendNotification} className="w-full">
                Enviar notificación
              </AppButton>
              <button
                onClick={() => setErrorModal(false)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.5)', fontSize: 13, padding: '8px',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
              >
                Volver a intentarlo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}
