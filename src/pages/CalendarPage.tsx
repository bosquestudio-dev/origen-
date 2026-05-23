import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/stores/auth.store'
import { useAppStore } from '@/stores/app.store'
import { useCalendarStore } from '@/stores/calendar.store'
import { useProgress } from '@/hooks/useProgress'
import { useCalendar } from '@/hooks/useCalendar'
import { CHALLENGES_DATA } from '@/data/challenges.data'
import ProgressRing from '@/components/origen/ProgressRing'
import AppToast from '@/components/origen/AppToast'
import AppModal from '@/components/origen/AppModal'
import AppButton from '@/components/origen/AppButton'
import CalendarGrid from '@/components/calendar/CalendarGrid'
import NotificationBanner from '@/components/calendar/NotificationBanner'
import ChallengeModalContent from '@/components/challenge/ChallengeModalContent'
import { MOCK_NOTIFICATIONS } from '@/data/notifications.data'
import { useEffect, useState, useRef } from 'react'
import { LogOut, X, Menu } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import LoadingScreen from '@/components/auth/LoadingScreen'
import { toast } from 'sonner'

const WA_NUMBER_KEY = 'origen_wa_number'

const WA_ICON = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.386A9.945 9.945 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" fill="#25D366"/>
    <path d="M17.005 14.57c-.275-.138-1.628-.803-1.881-.895-.252-.09-.436-.138-.62.138-.183.275-.71.895-.87 1.08-.16.183-.322.206-.597.069-.275-.138-1.16-.427-2.21-1.362-.817-.727-1.369-1.625-1.53-1.9-.16-.275-.017-.424.12-.561.124-.123.275-.322.413-.482.138-.16.183-.275.275-.46.091-.183.046-.344-.023-.482-.069-.138-.62-1.493-.85-2.044-.223-.537-.45-.464-.62-.472-.16-.007-.344-.009-.528-.009-.183 0-.482.069-.734.344-.252.275-.964.942-.964 2.297 0 1.354.987 2.663 1.125 2.847.138.183 1.942 2.965 4.706 4.157.657.284 1.17.453 1.57.58.66.21 1.26.18 1.733.11.529-.08 1.628-.666 1.858-1.31.23-.643.23-1.194.16-1.31-.068-.114-.252-.183-.527-.321z" fill="white"/>
  </svg>
)

const WA_ICON_LG = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="20" fill="#25D366"/>
    <path d="M20 6C12.268 6 6 12.268 6 20c0 2.835.787 5.49 2.157 7.752L6 34l6.46-1.847A13.935 13.935 0 0020 34c7.732 0 14-6.268 14-14S27.732 6 20 6z" fill="white" fillOpacity="0.15"/>
    <path d="M27.007 22.855c-.413-.207-2.442-1.204-2.822-1.342-.378-.137-.654-.207-.93.207-.275.413-1.065 1.342-1.305 1.62-.24.275-.482.31-.895.103-.413-.207-1.74-.64-3.315-2.043-1.225-1.09-2.054-2.437-2.295-2.85-.24-.413-.026-.636.18-.841.186-.185.413-.483.62-.723.206-.24.275-.413.413-.69.137-.275.068-.516-.035-.723-.103-.207-.93-2.24-1.275-3.067-.334-.806-.675-.696-.93-.708-.24-.01-.516-.013-.792-.013-.275 0-.723.103-1.1.516-.38.413-1.447 1.413-1.447 3.445 0 2.03 1.48 3.994 1.687 4.27.206.275 2.913 4.448 7.059 6.235.985.426 1.754.68 2.354.87.99.314 1.89.27 2.6.164.794-.12 2.443-.999 2.787-1.964.344-.965.344-1.79.24-1.965-.102-.172-.378-.275-.79-.482z" fill="#25D366"/>
  </svg>
)

/* ─── Typewriter component ──────────────────────────────────── */
function TypewriterText({ prefix, name, enabled = false }: { prefix: string; name: string; enabled?: boolean }) {
  const fullText = prefix + name
  const [displayed, setDisplayed] = useState('')
  const [showCursor, setShowCursor] = useState(false)
  const indexRef = useRef(0)

  useEffect(() => {
    if (!enabled) return
    setDisplayed('')
    indexRef.current = 0
    setShowCursor(true)

    const interval = setInterval(() => {
      indexRef.current += 1
      setDisplayed(fullText.slice(0, indexRef.current))
      if (indexRef.current >= fullText.length) {
        clearInterval(interval)
        let blinks = 0
        const blink = setInterval(() => {
          setShowCursor(v => !v)
          blinks++
          if (blinks >= 6) {
            clearInterval(blink)
            setShowCursor(false)
          }
        }, 400)
      }
    }, 90)

    return () => clearInterval(interval)
  }, [enabled, fullText])

  const prefixDisplayed = displayed.slice(0, Math.min(displayed.length, prefix.length))
  const nameDisplayed = displayed.length > prefix.length ? displayed.slice(prefix.length) : ''

  return (
    <span>
      <span style={{ fontWeight: 300 }}>{prefixDisplayed}</span>
      <span style={{ fontWeight: 700 }}>{nameDisplayed}</span>
      {showCursor && (
        <span style={{
          display: 'inline-block',
          width: '2px',
          height: '1em',
          background: '#F4F5F0',
          marginLeft: '2px',
          verticalAlign: 'text-bottom',
          borderRadius: '1px',
        }} />
      )}
    </span>
  )
}

function HelpModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const inputStyle = (field: string, height?: number): React.CSSProperties => ({
    background: 'transparent',
    border: focusedField === field ? '1px solid #F4F5F0' : '1px solid #727988',
    borderRadius: 8,
    padding: '10px 12px',
    color: '#F4F5F0',
    fontSize: 12,
    fontFamily: "'DM Sans', sans-serif",
    width: '100%',
    height: height ?? 40,
    outline: 'none',
    boxSizing: 'border-box' as const,
    resize: 'none' as const,
  })

  const labelStyle: React.CSSProperties = {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 12,
    fontWeight: 400,
    color: '#F7F7F8',
    marginBottom: 4,
    display: 'block',
    lineHeight: '16px',
  }

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error('Falta el nombre', { description: 'Por favor escribe tu nombre.' })
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Correo inválido', { description: 'Introduce un correo electrónico válido.' })
      return
    }
    if (!message.trim()) {
      toast.error('Falta el mensaje', { description: 'Por favor describe tu consulta.' })
      return
    }
    toast.success('Mensaje enviado', {
      description: 'Te responderemos en menos de 24 horas.',
      duration: 4000,
    })
    setName('')
    setEmail('')
    setMessage('')
    onClose()
  }

  return (
    <motion.div
      key="help-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        style={{
          background: '#17191C',
          borderRadius: 12,
          padding: 20,
          width: 'min(388px, 90vw)',
          height: 'auto',
          minHeight: 456,
          boxSizing: 'border-box',
          border: '1px solid #41454E',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 14, right: 14,
            background: 'transparent', border: 'none',
            cursor: 'pointer', color: 'rgba(255,255,255,0.4)',
            padding: 4, lineHeight: 1,
          }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 24, fontWeight: 700, color: '#F4F5F0', lineHeight: '28px', letterSpacing: '-0.2px', marginBottom: 16 }}>
            Ayuda y soporte
          </div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 400, color: '#F4F5F0', lineHeight: '20px', letterSpacing: 0, marginBottom: 32 }}>
            Cuéntanos tu problema y te responderemos lo antes posible.
          </div>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
          <div>
            <label style={labelStyle}>Nombre</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              placeholder="Introduce tu nombre"
              className="help-modal-input"
              style={inputStyle('name', 40)}
            />
          </div>
          <div>
            <label style={labelStyle}>Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              placeholder="Introduce tu correo electrónico"
              className="help-modal-input"
              style={inputStyle('email', 40)}
            />
          </div>
          <div>
            <label style={labelStyle}>Mensaje</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              onFocus={() => setFocusedField('message')}
              onBlur={() => setFocusedField(null)}
              placeholder="Describe detalladamente tu problema o consulta"
              className="help-modal-input"
              style={{ ...inputStyle('message', 76) }}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          style={{
            width: '100%',
            height: 40,
            marginTop: 20,
            padding: '10px 16px',
            background: 'transparent',
            color: '#F4F5F0',
            border: '1.5px solid #F4F5F0',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 400,
            fontFamily: "'DM Sans', sans-serif",
            lineHeight: '16px',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxSizing: 'border-box',
          }}
        >
          Enviar mensaje
        </button>
      </motion.div>
    </motion.div>
  )
}

export default function CalendarPage() {
  const { user, isSessionValid, logout } = useAuth()
  const { activeModal, closeChallenge } = useAppStore()
  const { completedDays } = useCalendarStore()
  const { progressPercentage, companionPercentage, completedCount, totalAvailable } = useProgress()
  const navigate = useNavigate()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [pageReady, setPageReady] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  const [wowDone, setWowDone] = useState(false)

  // WhatsApp state
  const [showPopup, setShowPopup] = useState(false)
  const [waNumber, setWaNumber] = useState(localStorage.getItem(WA_NUMBER_KEY) || '')
  const [inputFocused, setInputFocused] = useState(false)
  const [iconHovered, setIconHovered] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setPageReady(true), 100)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!isSessionValid) {
      logout()
      navigate('/', { replace: true })
    }
  }, [isSessionValid, logout, navigate])

  useEffect(() => {
    const hasNumber = localStorage.getItem(WA_NUMBER_KEY)
    if (!hasNumber) {
      const t = setTimeout(() => setShowPopup(true), 800)
      return () => clearTimeout(t)
    }
  }, [])

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  if (!isSessionValid || !user) return null

  const activeChallenge = activeModal ? CHALLENGES_DATA.find(c => c.day === activeModal) : null
  const firstName = user.name.split(' ')[0]

  const handleLogout = () => {
    setShowLogoutModal(false)
    logout()
    navigate('/')
  }

  const handleDismiss = () => {
    setShowPopup(false)
  }

  const handleActivate = () => {
    if (!waNumber.trim()) return
    localStorage.setItem(WA_NUMBER_KEY, waNumber.trim())
    setShowPopup(false)
    toast.success('¡Listo! Te avisaremos por WhatsApp')
  }

  const hasLinkedNumber = !!localStorage.getItem(WA_NUMBER_KEY)
  const tooltipText = hasLinkedNumber ? 'Notificaciones activas' : 'Activar notificaciones WhatsApp'

  return (
    <>
    <LoadingScreen isVisible={!pageReady} />
    <motion.div
      style={{ minHeight: '100vh', background: '#000000' }}
      initial={{ opacity: 0, scale: 1.6 }}
      animate={{ opacity: pageReady ? 1 : 0, scale: pageReady ? 1 : 1.6 }}
      transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
      onAnimationComplete={() => { if (pageReady) setWowDone(true) }}
    >
      {/* Header */}
      <style>{`
        .cal-header-outer {
          position: sticky; top: 0; z-index: 40;
          background: #000000;
          border-bottom: 2px solid rgba(255,255,255,0.15);
          backdrop-filter: blur(8px);
        }
        .cal-header {
          max-width: 1370px;
          margin: 0 auto;
          padding: 24px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .cal-header-left { display: flex; flex-direction: column; gap: 2px; }
        .cal-header-right { display: flex; align-items: center; gap: 16px; }
        .cal-header-logout {
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.5);
          display: flex; align-items: center; padding: 4px;
        }
        /* Metric cards — transparent bg, visible border, fixed height */
        .cal-metric-card {
          width: 220px; min-width: 220px;
          height: 76px; min-height: 76px; max-height: 76px;
          overflow: hidden;
          background: #17191C;
          border: 1px solid #41454E;
          border-radius: 12px;
          padding: 12px;
          display: flex; align-items: center; box-sizing: border-box;
        }
        /* Mobile logout — hidden in desktop (shown via row1) */
          .cal-logout-desktop { display: flex; }
          .cal-hamburger-btn { display: none; }
          .cal-mobile-menu { display: none; }
        .cal-metric-card-hoy { width: 226px; min-width: 226px; }
        .cal-main { padding: 40px 32px; }

        /* Mobile metric cards */
        .cal-metric-progreso-mobile { display: none; }
        .cal-metric-hoy-mobile      { display: none; }
        .cal-metric-progreso-desktop { display: flex; }
        .cal-metric-hoy-desktop      { display: flex; }

        @media (max-width: 767px) {
          .cal-header { flex-direction: column; align-items: flex-start; gap: 12px; padding: 16px; }
          .cal-header-right { flex-direction: row; gap: 12px; width: calc(100% + 32px); margin-left: -16px; padding: 0 16px; flex-wrap: nowrap; box-sizing: border-box; }
          .cal-metric-card { display: none !important; }
          .cal-logout-desktop { display: none; }
          .cal-hamburger-btn { display: flex !important; position: absolute; top: 16px; right: 16px; }
          .cal-mobile-menu { display: flex !important; }
          .cal-main { padding: 24px 20px !important; }
          .cal-metric-progreso-mobile { display: flex !important; }
          .cal-metric-hoy-mobile      { display: flex !important; }
          .cal-metric-progreso-desktop { display: none !important; }
          .cal-metric-hoy-desktop      { display: none !important; }
        }
      `}</style>
      <div className="cal-header-outer">
        {/* Hamburger button — mobile: absolute top-right */}
        <button
          className="cal-hamburger-btn"
          onClick={() => setShowMobileMenu(true)}
          title="Menú"
          style={{
            width: 40, height: 40, background: 'none', border: 'none',
            cursor: 'pointer', color: 'rgba(255,255,255,0.5)',
            alignItems: 'center', justifyContent: 'center',
            padding: 0, zIndex: 41,
          }}
        >
          <Menu size={22} />
        </button>
        <div className="cal-header">
          <div className="cal-header-left">
            {/* Row 1: greeting */}
            <div>
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 28, lineHeight: '32px',
                  letterSpacing: '-0.3px', color: '#F4F5F0',
                }}
              >
                <TypewriterText prefix="Hola, " name={firstName} enabled={wowDone} />
              </div>
            </div>
            {/* Subtitle */}
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500, fontSize: 16, lineHeight: '22px',
                letterSpacing: '-0.18px', color: '#BCC0C7',
              }}
            >
              Este año, abre algo más
            </div>
          </div>

          {/* Right: TU PROGRESO card + HOY card + logout (desktop) */}
          <div className="cal-header-right">
            {/* Card TU PROGRESO — desktop */}
            <div className="cal-metric-card cal-metric-progreso-desktop" style={{ flexDirection: 'row', justifyContent: 'flex-start', gap: 12 }}>
              <ProgressRing percentage={progressPercentage} size={52} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1, justifyContent: 'center' }}>
                <div style={{ fontSize: 10, fontWeight: 300, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#989EA9', fontFamily: "'DM Sans', sans-serif" }}>
                  Tu progreso
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 24, fontWeight: 700, color: '#305454', lineHeight: 1 }}>{completedCount}</span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 400, color: '#585E6A', lineHeight: 1 }}>/{totalAvailable}</span>
                </div>
                <div>
                  <span style={{ fontSize: 12, color: '#ECEDEF', fontFamily: "'DM Sans', sans-serif" }}>retos completados</span>
                </div>
              </div>
            </div>

            {/* Card HOY — desktop */}
            <div className="cal-metric-card cal-metric-card-hoy cal-metric-hoy-desktop" style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 2 }}>
              <div style={{ fontSize: 10, fontWeight: 300, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#989EA9', fontFamily: "'DM Sans', sans-serif" }}>
                Hoy
              </div>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, width: '100%' }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 32, fontWeight: 700, color: '#305454', lineHeight: 1, flexShrink: 0 }}>
                  {companionPercentage}%
                </div>
                <div style={{ fontSize: 12, color: '#ECEDEF', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.2 }}>
                  de tus compañeros ya lo han completado
                </div>
              </div>
            </div>

            {/* Card TU PROGRESO — mobile */}
            <div className="cal-metric-progreso-mobile" style={{
              flex: 1, minWidth: 0, height: 86, flexShrink: 0,
              background: '#17191C', border: '1px solid #41454E',
              borderRadius: 8, padding: 12, boxSizing: 'border-box',
              flexDirection: 'column', justifyContent: 'space-between', gap: 4,
            }}>
              {/* Label arriba */}
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 8, fontWeight: 300, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#989EA9', lineHeight: 1 }}>
                Tu progreso
              </div>
              {/* Anillo + número en fila */}
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                <ProgressRing percentage={progressPercentage} size={44} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, justifyContent: 'center', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                     <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 28, fontWeight: 700, color: '#305454', lineHeight: 1 }}>{completedCount}</span>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 400, color: '#585E6A', lineHeight: 1 }}>/{totalAvailable}</span>
                  </div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 400, color: '#ECEDEF', lineHeight: '12px' }}>
                    retos completados
                  </div>
                </div>
              </div>
            </div>

            {/* Card HOY — mobile */}
            <div className="cal-metric-hoy-mobile" style={{
              flex: 1, minWidth: 0, height: 85, flexShrink: 0,
              background: '#17191C', border: '1px solid #41454E',
              borderRadius: 8, padding: 12, boxSizing: 'border-box',
              flexDirection: 'column', justifyContent: 'space-between',
            }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 8, fontWeight: 300, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#989EA9', lineHeight: 1 }}>
                Hoy
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 28, fontWeight: 700, color: '#305454', lineHeight: 1 }}>
                {companionPercentage}%
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 400, color: '#ECEDEF', lineHeight: '12px' }}>
                de tus compañeros ya lo han completado
              </div>
            </div>

            {/* Help / Soporte — desktop only */}
            <button
              className="cal-header-logout cal-logout-desktop"
              onClick={() => setShowHelpModal(true)}
              title="Ayuda y soporte"
            >
              <img src="/help-square.svg" width={16} height={16} alt="Ayuda" />
            </button>

            {/* Logout — desktop only */}
            <button
              className="cal-header-logout cal-logout-desktop"
              onClick={() => setShowLogoutModal(true)}
              title="Salir"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <main style={{ maxWidth: 1370, margin: '0 auto' }} className="cal-main">
        {/* Notification Banner */}
        <NotificationBanner notifications={MOCK_NOTIFICATIONS} />

        <CalendarGrid />
      </main>

      {/* Challenge Modal */}
      <AppModal isOpen={!!activeChallenge} onClose={closeChallenge} challenge>
        {activeChallenge && (
          <ChallengeModalContent
            challenge={activeChallenge}
            completed={completedDays.includes(activeChallenge.day)}
          />
        )}
      </AppModal>

      {/* Logout Confirmation Modal */}
      <AppModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)}>
        <div className="space-y-4 text-center">
          <h3 className="text-lg font-medium text-foreground">¿Seguro que quieres salir?</h3>
          <p className="text-sm text-muted-foreground">Podrás volver a acceder cuando quieras con tu correo o DNI</p>
          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={() => setShowLogoutModal(false)}
              style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: 'transparent', fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}
            >
              Cancelar
            </button>
            <button
              onClick={handleLogout}
              className="text-muted-foreground"
              style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: '#F4F5F0', fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              Salir
            </button>
          </div>
        </div>
      </AppModal>

      {/* Help & Support Modal */}
      <AnimatePresence>
        {showHelpModal && <HelpModal onClose={() => setShowHelpModal(false)} />}
      </AnimatePresence>

      {/* WhatsApp Popup — desktop modal / mobile bottom sheet */}
      <AnimatePresence>
        {showPopup && (
          <div
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(4px)',
              zIndex: 100,
              display: 'flex',
              alignItems: isMobile ? 'flex-end' : 'center',
              justifyContent: 'center',
            }}
            onClick={(e) => { if (e.target === e.currentTarget) handleDismiss() }}
          >
            <motion.div
              key="wa-card"
              initial={isMobile ? { y: '100%' } : { opacity: 0, y: 20 }}
              animate={isMobile ? { y: 0 } : { opacity: 1, y: 0 }}
              exit={isMobile ? { y: '100%' } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: isMobile ? '#17191C' : '#1C1C1E',
                borderRadius: isMobile ? '20px 20px 0 0' : 12,
                padding: isMobile ? '24px 24px 40px' : '28px 20px',
                width: isMobile ? '100%' : 420,
                maxWidth: isMobile ? '100%' : '92vw',
                height: isMobile ? 'auto' : 436,
                boxSizing: 'border-box',
                border: '1px solid #41454E',
                boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* X close */}
              <button
                onClick={handleDismiss}
                style={{
                  position: 'absolute', top: 16, right: 16,
                  width: 20, height: 20, background: 'none', border: 'none',
                  cursor: 'pointer', color: 'rgba(255,255,255,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: 0, transition: 'color 0.15s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.9)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12">
                  <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>

              {/* WA icon — top left */}
              <img src="/icon_wp.svg" alt="WhatsApp" style={{ width: 48, height: 48, marginBottom: 20, display: 'block' }} />

              {/* Title */}
              <h2 style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 24, fontWeight: 700,
                color: '#F4F5F0',
                margin: '0 0 12px',
                lineHeight: 1.2,
              }}>
                Recibe tus retos en Whatsapp
              </h2>

              {/* Subtitle */}
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 16, color: '#F4F5F0',
                lineHeight: 1.5,
                margin: '0 0 20px',
                opacity: 0.7,
              }}>
                Introduce tu número y te avisaremos cada día cuando tu reto esté disponible
              </p>

              {/* Label */}
              <label style={{
                display: 'block',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 16, color: '#F7F7F8',
                marginBottom: 8,
              }}>
                Teléfono
              </label>

              {/* Input */}
              <input
                ref={inputRef}
                type="tel"
                value={waNumber}
                onChange={e => setWaNumber(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder="Introduce tu número de teléfono"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'transparent',
                  border: `1px solid ${inputFocused ? '#22C35D' : 'rgba(255,255,255,0.2)'}`,
                  borderRadius: 8,
                  padding: '12px 20px',
                  fontSize: 16,
                  fontFamily: "'DM Sans', sans-serif",
                  color: '#F7F7F8',
                  outline: 'none',
                  transition: 'border-color 0.15s ease',
                  marginBottom: 12,
                }}
              />

              {/* Buttons column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 'auto' }}>
                <button
                  onClick={handleActivate}
                  style={{
                    width: '100%',
                    background: '#22C35D', color: '#FFFFFF',
                    border: 'none', borderRadius: 8,
                    padding: '12px 20px',
                    fontSize: 14, fontWeight: 500,
                    fontFamily: "'DM Sans', sans-serif",
                    cursor: 'pointer',
                  }}
                >
                  Activar notificaciones
                </button>

                <button
                  onClick={handleDismiss}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: '1.5px solid #F4F5F0',
                    borderRadius: 8,
                    padding: '12px 20px',
                    fontSize: 14, fontWeight: 400,
                    fontFamily: "'DM Sans', sans-serif",
                    color: '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  Ahora no
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* WhatsApp floating icon — desktop only */}
      <AnimatePresence>
        {!showPopup && !isMobile && (
          <motion.div
            key="wa-fab"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 90 }}
          >
            <div style={{ position: 'relative' }}>
              {/* Tooltip */}
              <div style={{
                position: 'absolute',
                right: 60, top: '50%', transform: 'translateY(-50%)',
                background: '#17181B', color: '#FFFFFF',
                borderRadius: 6, padding: '6px 10px',
                fontSize: 12, whiteSpace: 'nowrap',
                pointerEvents: 'none',
                opacity: iconHovered ? 1 : 0,
                transition: 'opacity 0.15s ease',
              }}>
                {tooltipText}
              </div>

              <motion.button
                onClick={() => setShowPopup(true)}
                onHoverStart={() => setIconHovered(true)}
                onHoverEnd={() => setIconHovered(false)}
                whileHover={{ scale: 1.08, boxShadow: '0 6px 20px rgba(0,0,0,0.25)' }}
                style={{
                  width: 52, height: 52,
                  borderRadius: '50%',
                  background: 'transparent',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                }}
              >
                <img src="/icon_wp.svg" alt="WhatsApp" style={{ width: 40, height: 40 }} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {showMobileMenu && isMobile && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0,
              zIndex: 200, display: 'flex', flexDirection: 'column',
              background: '#0D0F11',
              paddingBottom: 44,
            }}
          >
            {/* Header del menú */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
              padding: '16px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}>
              <button
                onClick={() => setShowMobileMenu(false)}
                style={{
                  width: 40, height: 40, background: 'none', border: 'none',
                  cursor: 'pointer', color: 'rgba(255,255,255,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Items principales */}
            <div style={{ padding: '8px 0' }}>
              {/* Ayuda */}
              <button
                onClick={() => { setShowMobileMenu(false); setShowHelpModal(true) }}
                style={{
                  width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '16px 24px', color: '#DBDDE1',
                }}
              >
                <img src="/help-square.svg" width={20} height={20} alt="Ayuda" />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 400, lineHeight: '16px', letterSpacing: 0 }}>Ayuda</span>
              </button>

              {/* Cerrar sesión */}
              <button
                onClick={() => { setShowMobileMenu(false); setShowLogoutModal(true) }}
                style={{
                  width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '16px 24px', color: '#DBDDE1',
                }}
              >
                <LogOut size={20} color="#DBDDE1" />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 400, lineHeight: '16px', letterSpacing: 0 }}>Cerrar sesión</span>
              </button>
            </div>

            {/* Separador */}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '0 24px' }} />

            {/* WhatsApp */}
            <div style={{ padding: '8px 0' }}>
              <button
                onClick={() => { setShowMobileMenu(false); setShowPopup(true) }}
                style={{
                  width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '16px 24px', color: '#DBDDE1',
                }}
              >
                <img src="/icon_wp.svg" width={20} height={20} alt="WhatsApp" />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 400, lineHeight: '16px', letterSpacing: 0 }}>Recibe tus retos en Whatsapp</span>
              </button>
            </div>

            {/* Separador */}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '0 24px' }} />

            {/* Links legales */}
            <div style={{ padding: '8px 0' }}>
              <a
                href="/politicas-de-privacidad"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 24px', color: '#DBDDE1', textDecoration: 'none',
                  fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 400,
                  lineHeight: '16px', letterSpacing: 0,
                }}
              >
                <span>Políticas de Privacidad</span>
                <img src="/arrow-right.svg" width={16} height={16} alt="" />
              </a>
              <a
                href="/terminos-legales"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 24px', color: '#DBDDE1', textDecoration: 'none',
                  fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 400,
                  lineHeight: '16px', letterSpacing: 0,
                }}
              >
                <span>Términos legales</span>
                <img src="/arrow-right.svg" width={16} height={16} alt="" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AppToast />
    </motion.div>
    </>
  )
}
