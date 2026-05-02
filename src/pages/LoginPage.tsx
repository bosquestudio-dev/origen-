import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, CreditCard, ArrowLeft, ArrowRight } from 'lucide-react'
import { useAuth } from '@/stores/auth.store'
import LoadingScreen from '@/components/auth/LoadingScreen'

/* ─── Preserved logic ──────────────────────────────────────── */
const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DNI_RE   = /^[0-9]{7,8}[A-Za-z]$/

/* ─── Figma design tokens ───────────────────────────────────── */
const DM = "'DM Sans', sans-serif"
const GK = "'Space Grotesk', sans-serif"

// Colors (extracted from Figma nodes 538-19053, 544-21594)
const C = {
  pageBg:    '#F4F5F0',  // page background (desktop right half + mobile card)
  title:     '#000000',  // DM Sans 700 32px / 24px mobile
  body:      '#000000',  // DM Sans 400 18px / 15px mobile
  labelTxt:  '#2A2D32',  // label above input
  ckboxTxt:  '#585E6A',  // checkbox label
  helper:    '#727988',  // helper text
  errRed:    '#D31212',  // error text color
  optSelBg:  '#EAE0FF',  // selected option background
  optSelBdr: '#2E0099',  // selected option border
  optSelTxt: '#20006B',  // selected option text
  optBdr:    '#DBDDE1',  // unselected option border
  optTxt:    '#2A2D32',  // unselected option text
  inputBdr:  '#DBDDE1',  // default input border
  inputFoc:  '#2E0099',  // focused input border
  inputTxt:  '#17191C',  // input text
  backBdr:   '#989EA9',  // back button border (1.5px)
  backIcon:  '#727988',  // back button arrow color
  btnDark:   '#17191C',  // primary button dark (text + border desktop / bg mobile)
  link:      '#2E0099',  // interactive link color
}

type Step = 'selector' | 'input' | 'soporte'

/* ─── Spinner ───────────────────────────────────────────────── */
function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16"
      style={{ animation: 'spin 0.8s linear infinite', display: 'block', flexShrink: 0 }}>
      <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
      <path d="M8 2 A6 6 0 0 1 14 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

/* ─── Input element ─────────────────────────────────────────── */
function InputEl({
  value, onChange, type = 'text', autoComplete, autoCapitalize, placeholder,
  hasError, iconType, paddingLeft = 12,
}: {
  value: string
  onChange: (v: string) => void
  type?: string
  autoComplete?: string
  autoCapitalize?: string
  placeholder?: string
  hasError?: boolean
  iconType?: 'email' | 'dni'
  paddingLeft?: number
}) {
  const [focused, setFocused] = useState(false)
  const borderColor = hasError ? C.errRed : focused ? C.inputFoc : C.inputBdr

  return (
    <div style={{ position: 'relative' }}>
      {iconType && (
        <div style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          display: 'flex', pointerEvents: 'none',
        }}>
          {iconType === 'email'
            ? <Mail size={15} color={hasError ? C.errRed : C.labelTxt} />
            : <CreditCard size={15} color={hasError ? C.errRed : C.labelTxt} />
          }
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete={autoComplete}
        autoCapitalize={autoCapitalize}
        autoCorrect="off"
        spellCheck={false}
        placeholder={placeholder}
        className="login-input"
        style={{
          width: '100%', height: 40, boxSizing: 'border-box',
          padding: `10px 12px 10px ${paddingLeft}px`,
          borderRadius: 8,
          border: `1px solid ${borderColor}`,
          background: '#FFFFFF',
          fontFamily: DM, fontSize: 14, fontWeight: 400, lineHeight: '16px',
          color: hasError ? C.errRed : C.inputTxt,
          transition: 'border-color 0.15s ease',
          outline: 'none',
        }}
      />
    </div>
  )
}

/* ─── Page ──────────────────────────────────────────────────── */
export default function LoginPage() {
  const { login, isSessionValid, isAdmin } = useAuth()
  const navigate = useNavigate()

  const [step, setStep]           = useState<Step>('selector')
  const [goingBack, setGoingBack] = useState(false)

  // Preserved state
  const [loginType, setLoginType]   = useState<'email' | 'dni' | null>(null)
  const [identifier, setIdentifier] = useState('')
  const [loading, setLoading]       = useState(false)
  const [showLoader, setShowLoader] = useState(false)
  const [hasError, setHasError]     = useState(false)
  const [consented, setConsented]   = useState(false)

  // Support form state
  const [supportName, setSupportName]       = useState('')
  const [supportSurname, setSupportSurname] = useState('')
  const [supportContact, setSupportContact] = useState('')

  /* ─── Session checks (preserved) ─── */
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
    } catch { localStorage.removeItem('origen_user') }
  }, [navigate])

  useEffect(() => {
    if (isSessionValid) navigate(isAdmin ? '/admin' : '/calendar', { replace: true })
  }, [isSessionValid, isAdmin, navigate])

  if (isSessionValid) return null

  /* ─── Handlers (preserved logic) ─── */
  const handleSubmit = async () => {
    if (!loginType || !consented) return
    if (!identifier.trim()) {
      toast.error('El campo no puede estar vacío', { duration: 2500 })
      return
    }
    if (loginType === 'email' && !EMAIL_RE.test(identifier.trim())) {
      toast.error('Introduce un email válido', { description: 'Ejemplo: tu.nombre@empresa.com', duration: 3000 })
      return
    }
    if (loginType === 'dni' && !DNI_RE.test(identifier.trim())) {
      toast.error('Introduce un DNI válido', { description: 'Formato: 12345678A', duration: 3000 })
      return
    }
    setLoading(true)
    setHasError(false)
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
        setTimeout(() => navigate(parsed.user.role === 'admin' ? '/admin' : '/calendar'), 1600)
      }
    } else {
      setLoading(false)
      setHasError(true)
    }
  }

  const handleSendNotification = () => {
    setGoingBack(true)
    setStep('selector')
    setHasError(false)
    toast.success('Notificación enviada correctamente')
  }

  /* ─── Navigation ─── */
  const forward = (to: Step) => { setGoingBack(false); setStep(to) }
  const back    = (to: Step) => { setGoingBack(true);  setStep(to) }

  /* ─── Transition variants (direction-aware) ─── */
  const d = goingBack ? -1 : 1
  const stepVariants = {
    initial:  { opacity: 0, x: 16 * d },
    animate:  { opacity: 1, x: 0, transition: { duration: 0.25, ease: 'easeOut' as const } },
    exit:     { opacity: 0, x: -16 * d, transition: { duration: 0.2, ease: 'easeIn' as const } },
  }

  const canContinuar = loginType !== null
  const canEntrar    = consented && !loading

  /* ─── Shared styles ─── */
  const heading: React.CSSProperties = {
    margin: '0 0 8px', fontFamily: DM,
    fontWeight: 700, color: C.title,
    fontSize: 'clamp(20px, 3.5vw, 32px)',
    lineHeight: 'clamp(24px, 4vw, 38px)',
    whiteSpace: 'nowrap',
  }

  const subtext: React.CSSProperties = {
    margin: '0 0 32px', fontFamily: DM,
    fontSize: 'clamp(15px, 1.5vw, 18px)',
    fontWeight: 400, lineHeight: '24px', color: C.body,
  }

  // Primary button: outline on desktop, filled on mobile (via CSS class)
  const ctaBtn = (active: boolean): React.CSSProperties => ({
    width: '100%', height: 40,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 16px', boxSizing: 'border-box',
    borderRadius: 8, fontFamily: DM,
    fontSize: 14, fontWeight: 400, lineHeight: '16px',
    cursor: active ? 'pointer' : 'not-allowed',
    opacity: active ? 1 : 0.45,
    transition: 'opacity 0.2s ease',
  })

  return (
    <>
      <LoadingScreen isVisible={showLoader} />

      <style>{`
        .login-input::placeholder { color: #C5C7D0; }

        /* ── CTA button base ── */
        .btn-cta {
          border: 1.5px solid ${C.btnDark};
          background: transparent;
          color: ${C.btnDark};
          transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
        }
        /* Active hover → black */
        .btn-cta:not(:disabled):hover {
          background: #000000 !important;
          color: #FFFFFF !important;
          border-color: #000000 !important;
        }
        /* Loading state: always filled */
        .btn-cta.loading {
          background: ${C.btnDark} !important;
          color: #FFFFFF !important;
          border: none !important;
        }

        /* ── Layout ── */

        /* MOBILE (<1024px): aurora full-screen bg, card floats over it */
        .login-root { position: fixed; inset: 0; }
        .login-aurora {
          position: absolute; inset: 0;
          background: #17181B; overflow: hidden;
        }
        .login-form-wrap {
          position: absolute; inset: 0; z-index: 10;
          display: flex; align-items: center; justify-content: center;
          padding: 20px; box-sizing: border-box;
        }
        .login-form-card {
          background: #F4F5F0;
          border-radius: 20px;
          padding: 28px 24px;
          width: 100%; max-width: 480px;
          box-sizing: border-box;
          height: calc(100dvh - 40px);
          max-height: calc(100dvh - 40px);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .step-motion-wrap {
          display: flex; flex-direction: column; flex: 1; min-height: 0;
        }
        .step-inner {
          display: flex; flex-direction: column; flex: 1; min-height: 0;
        }
        .step-content {
          flex: 1; overflow-y: auto; min-height: 0;
        }
        .step-footer {
          flex-shrink: 0; padding-top: 0;
        }
        /* Mobile: filled button */
        .btn-cta {
          background: ${C.btnDark} !important;
          color: #FFFFFF !important;
          border: none !important;
        }

        /* DESKTOP (>=1024px): split 50/50 */
        @media (min-width: 1024px) {
          .login-root { display: flex; }
          .login-aurora {
            position: relative;
            flex: 0 0 50%; height: 100%;
          }
          .login-form-wrap {
            position: relative; flex: 1;
            inset: unset; z-index: auto;
            background: ${C.pageBg};
            padding: clamp(24px, 4vh, 64px) clamp(24px, 5vw, 72px);
            overflow-y: auto;
          }
          .login-form-card {
            background: transparent;
            border-radius: 0; padding: 0;
            max-width: 378px; max-height: none;
            height: auto; display: block; overflow: visible;
          }
          .step-motion-wrap, .step-inner { display: block; flex: none; min-height: none; }
          .step-content { flex: none; overflow-y: visible; min-height: none; }
          .step-footer { padding-top: 0; }
          /* Desktop: outline button */
          .btn-cta {
            border: 1.5px solid ${C.btnDark} !important;
            background: transparent !important;
            color: ${C.btnDark} !important;
          }
          .btn-cta.loading {
            background: ${C.btnDark} !important;
            color: #FFFFFF !important;
            border: none !important;
          }
        }

        /* Very small screens: allow title to wrap */
        @media (max-width: 380px) {
          .login-heading { white-space: normal !important; font-size: 20px !important; }
        }
      `}</style>

      {/* ── Root ── */}
      <div className="login-root">

        {/* ── Aurora ── (full-screen mobile / left-half desktop) */}
        <div className="login-aurora">
          <div style={{
            position: 'absolute', bottom: '-25%', left: '50%',
            transform: 'translateX(-50%)',
            width: '160%', height: '100%',
            borderRadius: '50%', background: '#FA7025',
            filter: 'blur(100px)', opacity: 0.45,
          }} />
          <div style={{
            position: 'absolute', bottom: '-35%', left: '10%',
            width: '110%', height: '90%',
            borderRadius: '50%', background: '#3D00CC',
            filter: 'blur(140px)', opacity: 0.45,
          }} />
        </div>

        {/* ── Form wrap ── (centered overlay mobile / right-half desktop) */}
        <div className="login-form-wrap">
          {/* Card (rounded + bg mobile / transparent desktop) */}
          <div className="login-form-card">

            {/* Layout-animated outer container (smooth height transitions) */}
            <motion.div
              layout
              className="step-motion-wrap"
              transition={{ layout: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
            >
              <AnimatePresence mode="wait">

                {/* ══ PASO 1: SELECTOR ══ */}
                {step === 'selector' && (
                  <motion.div
                    key="selector"
                    className="step-inner"
                    variants={stepVariants}
                    initial="initial" animate="animate" exit="exit"
                  >
                    <div className="step-content">
                      {/* Title + Subtitle */}
                      <h1 className="login-heading" style={heading}>Accede a tu calendario</h1>
                      <p style={subtext}>¿Utilizas en tu día a día el correo de la empresa?</p>

                      {/* Options — gap: 8px (Figma: Frame 3 gap=8) */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {(['email', 'dni'] as const).map(type => {
                          const sel = loginType === type
                          return (
                            <button
                              key={type}
                              onClick={() => setLoginType(type)}
                              style={{
                                /* Figma: input-container 378x64, pad 24/24/16/16, r=8 */
                                width: '100%', height: 64,
                                padding: '0 16px', boxSizing: 'border-box',
                                display: 'flex', alignItems: 'center',
                                borderRadius: 8,
                                fontFamily: DM, fontSize: 14, fontWeight: 400, lineHeight: '16px',
                                textAlign: 'left', cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                border: sel ? `1px solid ${C.optSelBdr}` : `1px solid ${C.optBdr}`,
                                background: sel ? C.optSelBg : 'transparent',
                                color: sel ? C.optSelTxt : C.optTxt,
                              }}
                            >
                              {type === 'email'
                                ? 'Sí, trabajo con el correo de la empresa'
                                : 'No, no uso el correo en mi día a día'
                              }
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Continuar button — pinned to bottom */}
                    <div className="step-footer" style={{ paddingTop: 24 }}>
                      <button
                        className="btn-cta"
                        onClick={canContinuar ? () => forward('input') : undefined}
                        disabled={!canContinuar}
                        style={ctaBtn(canContinuar)}
                      >
                        <span>Continuar</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ══ PASO 2: INPUT ══ */}
                {step === 'input' && loginType && (
                  <motion.div
                    key="input"
                    className="step-inner"
                    variants={stepVariants}
                    initial="initial" animate="animate" exit="exit"
                  >
                    <div className="step-content">
                      {/* Back button — Figma: Button 40x40, border #989EA9 1.5px, r=8 */}
                      <button
                        onClick={() => back('selector')}
                        style={{
                          width: 40, height: 40, borderRadius: 8, boxSizing: 'border-box',
                          border: `1.5px solid ${C.backBdr}`,
                          background: 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer',
                          marginBottom: 16,
                        }}
                      >
                        <ArrowLeft size={16} color={C.backIcon} />
                      </button>

                      {/* Title + Subtitle */}
                      <h1 className="login-heading" style={heading}>Accede a tu calendario</h1>
                      <p style={subtext}>¿Utilizas en tu día a día el correo de la empresa?</p>

                      {/* Input + Checkbox — Figma: Frame 37, gap=20 */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                        {/* Input field — Figma: Frame 34, gap=4 (label → input → helper) */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {/* Label — DM Sans 400 12px, #2A2D32 */}
                          <span style={{
                            fontFamily: DM, fontSize: 12, fontWeight: 400,
                            lineHeight: '16px', color: C.labelTxt,
                          }}>
                            {loginType === 'email' ? 'Correo' : 'DNI'}
                          </span>

                          {/* Input — Figma: input-container 378x40, r=8, pad 10/10/12/12 */}
                          <InputEl
                            value={identifier}
                            onChange={v => { setIdentifier(v); if (hasError) setHasError(false) }}
                            type={loginType === 'email' ? 'email' : 'text'}
                            autoComplete={loginType === 'email' ? 'email' : 'off'}
                            autoCapitalize={loginType === 'dni' ? 'characters' : 'off'}
                            placeholder={loginType === 'email'
                              ? 'Introduce tu correo de empresa'
                              : 'Introduce tu DNI sin guiones'
                            }
                            hasError={hasError}
                            iconType={loginType}
                            paddingLeft={36}
                          />

                          {/* Error helper — Figma: Space Grotesk 500 10px lh=12px, #D31212 */}
                          <AnimatePresence>
                            {hasError && (
                              <motion.p
                                key="err"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.25 }}
                                style={{
                                  margin: 0, overflow: 'hidden',
                                  fontFamily: GK, fontSize: 10, fontWeight: 500,
                                  lineHeight: '12px', color: C.errRed,
                                }}
                              >
                                El {loginType === 'email' ? 'correo' : 'DNI'} introducido no corresponde a ningún usuario.{' '}
                                Si el problema persiste{' '}
                                <span
                                  onClick={() => forward('soporte')}
                                  style={{
                                    color: C.link, textDecoration: 'underline',
                                    cursor: 'pointer', fontWeight: 500,
                                  }}
                                >
                                  haz click aquí
                                </span>
                                .
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Checkbox — Figma: Checkbox 378x20, r=4, border #DBDDE1 1.5px unchecked / bg #000 checked */}
                        <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', cursor: 'pointer' }}>
                          <div
                            onClick={() => setConsented(c => !c)}
                            style={{
                              width: 16, height: 16, flexShrink: 0, marginTop: 2,
                              borderRadius: 4, boxSizing: 'border-box', cursor: 'pointer',
                              background: consented ? '#000000' : 'transparent',
                              border: consented ? 'none' : `1.5px solid ${C.optBdr}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {consented && (
                              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                <path d="M1 4L3.5 6.5L9 1" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                          {/* DM Sans 400 12px, #585E6A */}
                          <span style={{
                            fontFamily: DM, fontSize: 12, fontWeight: 400,
                            lineHeight: '16px', color: C.ckboxTxt,
                          }}>
                            Acepto los{' '}
                            <a href="#" onClick={e => e.preventDefault()}
                              style={{ color: C.link, textDecoration: 'underline' }}>
                              términos legales
                            </a>
                            {' '}y la{' '}
                            <a href="#" onClick={e => e.preventDefault()}
                              style={{ color: C.link, textDecoration: 'underline' }}>
                              política de privacidad
                            </a>
                            .
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Entrar button — pinned to bottom */}
                    <div className="step-footer" style={{ paddingTop: 24 }}>
                      <button
                        className={`btn-cta${loading ? ' loading' : ''}`}
                        onClick={canEntrar ? handleSubmit : undefined}
                        disabled={!canEntrar}
                        style={ctaBtn(canEntrar)}
                      >
                        <span>{loading ? 'Entrando...' : 'Entrar'}</span>
                        {loading ? <Spinner /> : <ArrowRight size={16} />}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ══ PASO 3: SOPORTE ══ */}
                {step === 'soporte' && (
                  <motion.div
                    key="soporte"
                    className="step-inner"
                    variants={stepVariants}
                    initial="initial" animate="animate" exit="exit"
                  >
                    <div className="step-content">
                      {/* Title — Figma: DM Sans 700 32px, #000 */}
                      <h1 className="login-heading" style={heading}>
                        No hemos podido verificar tu {loginType === 'dni' ? 'DNI' : 'correo'}
                      </h1>
                      {/* Subtitle — Figma: DM Sans 400 18px, #000 */}
                      <p style={subtext}>
                        Rellena el formulario y revisaremos tu caso para que puedas acceder
                      </p>

                      {/* Fields — Figma: Frame 32, gap=12 */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {([
                          { label: 'Nombre',   placeholder: 'Introduce tu nombre',        value: supportName,    set: setSupportName },
                          { label: 'Apellidos',placeholder: 'Introduce tus apellidos',     value: supportSurname, set: setSupportSurname },
                          {
                            label: loginType === 'dni' ? 'DNI' : 'Correo',
                            placeholder: loginType === 'dni'
                              ? 'Introduce tu DNI sin guiones'
                              : 'Introduce tu correo de empresa',
                            value: supportContact, set: setSupportContact,
                          },
                        ] as const).map(({ label, placeholder, value, set }) => (
                          <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <span style={{
                              fontFamily: DM, fontSize: 12, fontWeight: 400,
                              lineHeight: '16px', color: C.labelTxt,
                            }}>
                              {label}
                            </span>
                            <InputEl value={value} onChange={set} placeholder={placeholder} />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Buttons row — pinned to bottom */}
                    <div className="step-footer" style={{ paddingTop: 24, display: 'flex', gap: 20 }}>
                      {/* Volver — Figma: r=4, border #17191C 1px */}
                      <button
                        onClick={() => back('input')}
                        style={{
                          flex: 1, height: 40,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          padding: '0 16px', boxSizing: 'border-box',
                          borderRadius: 4, border: `1px solid ${C.btnDark}`,
                          background: 'transparent',
                          fontFamily: DM, fontSize: 14, fontWeight: 400, lineHeight: '16px',
                          color: C.btnDark, cursor: 'pointer',
                        }}
                      >
                        <ArrowLeft size={16} />
                        Volver
                      </button>
                      {/* Enviar — Figma: r=8, border #17191C 1.5px */}
                      <button
                        onClick={handleSendNotification}
                        style={{
                          flex: 1, height: 40,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          padding: '0 16px', boxSizing: 'border-box',
                          borderRadius: 8, border: `1.5px solid ${C.btnDark}`,
                          background: 'transparent',
                          fontFamily: DM, fontSize: 14, fontWeight: 400, lineHeight: '16px',
                          color: C.btnDark, cursor: 'pointer',
                        }}
                      >
                        Enviar
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </motion.div>
          </div>{/* login-form-card */}
        </div>{/* login-form-wrap */}
      </div>{/* login-root */}
    </>
  )
}
