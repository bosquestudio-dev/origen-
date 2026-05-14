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
import ChallengeModalContent from '@/components/challenge/ChallengeModalContent'
import { useEffect, useState, useRef } from 'react'
import { LogOut, X } from 'lucide-react'
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

export default function CalendarPage() {
  const { user, isSessionValid, logout } = useAuth()
  const { activeModal, closeChallenge } = useAppStore()
  const { completedDays } = useCalendarStore()
  const { progressPercentage, companionPercentage, completedCount, totalAvailable } = useProgress()
  const navigate = useNavigate()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [pageReady, setPageReady] = useState(false)

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
      style={{ minHeight: '100vh', background: '#2A2D32' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: pageReady ? 1 : 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Header */}
      <style>{`
        .cal-header-outer {
          position: sticky; top: 0; z-index: 40;
          background: #2A2D32;
          border-bottom: 1px solid rgba(255,255,255,0.08);
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
          height: 63px; min-height: 63px; max-height: 63px;
          overflow: hidden;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 12px;
          padding: 0 16px;
          display: flex; align-items: center; box-sizing: border-box;
        }
        /* Mobile logout — hidden in desktop (shown via row1) */
        .cal-logout-mobile { display: none; }
        .cal-logout-desktop { display: flex; }

        @media (max-width: 767px) {
          .cal-header { flex-direction: column; align-items: stretch; gap: 12px; padding: 16px; }
          .cal-header-right { flex-direction: column; gap: 8px; width: 100%; flex-wrap: nowrap; }
          .cal-metric-card { width: 100% !important; min-width: unset !important; max-width: unset !important; height: auto !important; min-height: unset !important; max-height: unset !important; padding: 12px 16px !important; }
          .cal-logout-mobile { display: flex; }
          .cal-logout-desktop { display: none; }
          .cal-main { padding-left: 16px !important; padding-right: 16px !important; }
        }
      `}</style>
      <div className="cal-header-outer">
        <div className="cal-header">
          <div className="cal-header-left">
            {/* Row 1: greeting + logout (mobile only) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 28, lineHeight: '32px',
                  letterSpacing: '-0.3px', color: '#F4F5F0',
                }}
              >
                <span style={{ fontWeight: 300 }}>Hola, </span>
                <span style={{ fontWeight: 700 }}>{firstName}</span>
              </div>
              <button
                className="cal-header-logout cal-logout-mobile"
                onClick={() => setShowLogoutModal(true)}
                title="Salir"
              >
                <LogOut size={18} />
              </button>
            </div>
            {/* Subtitle */}
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500, fontSize: 16, lineHeight: '22px',
                letterSpacing: '-0.18px', color: '#BCC0C7',
              }}
            >
              Un reto cada día laboral — los findes desconectamos
            </div>
          </div>

          {/* Right: TU PROGRESO card + HOY card + logout (desktop) */}
          <div className="cal-header-right">
            {/* Card TU PROGRESO — ring left, text right, centered vertically */}
            <div className="cal-metric-card" style={{ flexDirection: 'row', justifyContent: 'flex-start', gap: 12 }}>
              <ProgressRing percentage={progressPercentage} size={32} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, lineHeight: 1.2, justifyContent: 'center' }}>
                <div style={{ fontSize: 9, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontFamily: "'DM Sans', sans-serif" }}>
                  Tu progreso
                </div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2 }}>
                  {completedCount} / {totalAvailable}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.2 }}>
                  retos completados
                </div>
              </div>
            </div>

            {/* Card HOY — vertically centered, label + row[% + text] */}
            <div className="cal-metric-card" style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 2 }}>
              <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontFamily: "'DM Sans', sans-serif" }}>
                Hoy
              </div>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, width: '100%' }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 22, fontWeight: 700, color: '#22C55E', lineHeight: 1.2, flexShrink: 0, alignSelf: 'center' }}>
                  {companionPercentage}%
                </div>
                <div style={{ fontSize: 10, color: '#ECEDEF', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.2, alignSelf: 'center', display: 'flex', alignItems: 'center' }}>
                  de tus compañeros ya lo han completado
                </div>
              </div>
            </div>

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
      <main style={{ maxWidth: 1370, margin: '0 auto', padding: '40px 32px' }} className="cal-main">
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
            <AppButton variant="ghost" onClick={() => setShowLogoutModal(false)}>Cancelar</AppButton>
            <AppButton onClick={handleLogout}>Salir</AppButton>
          </div>
        </div>
      </AppModal>

      {/* WhatsApp Popup */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            key="wa-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(4px)',
              zIndex: 100,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onClick={(e) => { if (e.target === e.currentTarget) handleDismiss() }}
          >
            <motion.div
              key="wa-card"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              style={{
                background: '#FFFFFF',
                borderRadius: 16,
                padding: '28px 24px',
                width: 'min(380px, 90vw)',
                boxShadow: '0 24px 60px rgba(0,0,0,0.15)',
                position: 'relative',
              }}
            >
              {/* Close button */}
              <button
                onClick={handleDismiss}
                style={{
                  position: 'absolute', top: 12, right: 12,
                  background: 'transparent', border: 'none',
                  cursor: 'pointer', color: '#9B9B95',
                  width: 24, height: 24,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={16} />
              </button>

              {/* WA icon */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <WA_ICON_LG />
              </div>

              {/* Title */}
              <h2 style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 18, fontWeight: 700,
                color: '#17181B', textAlign: 'center',
                margin: '12px 0 8px',
              }}>
                Recibe tus retos en WhatsApp
              </h2>

              {/* Subtitle */}
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14, color: '#40454D',
                textAlign: 'center', marginBottom: 20,
                lineHeight: 1.5, margin: '0 0 20px',
              }}>
                Introduce tu número y te avisaremos cada día cuando tu reto esté disponible.
              </p>

              {/* Input */}
              <input
                ref={inputRef}
                type="tel"
                value={waNumber}
                onChange={e => setWaNumber(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder="+34 600 000 000"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: '#F7F6F2',
                  border: `1px solid ${inputFocused ? '#25D366' : '#EBECEE'}`,
                  borderRadius: 8,
                  padding: '12px 14px',
                  fontSize: 14,
                  fontFamily: "'DM Sans', sans-serif",
                  color: '#17181B',
                  outline: 'none',
                  transition: 'border-color 0.15s ease',
                }}
              />

              {/* Activate button */}
              <button
                onClick={handleActivate}
                style={{
                  width: '100%', marginTop: 12,
                  background: '#25D366', color: '#FFFFFF',
                  border: 'none', borderRadius: 8,
                  padding: '13px 16px',
                  fontSize: 14, fontWeight: 500,
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: 'pointer',
                }}
              >
                {hasLinkedNumber ? 'Actualizar número' : 'Activar notificaciones'}
              </button>

              {/* Dismiss link */}
              <span
                onClick={handleDismiss}
                style={{
                  display: 'block', marginTop: 10,
                  fontSize: 13, color: '#9B9B95',
                  textDecoration: 'underline',
                  cursor: 'pointer', textAlign: 'center',
                }}
              >
                Ahora no
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WhatsApp floating icon */}
      <AnimatePresence>
        {!showPopup && (
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
                  background: hasLinkedNumber ? '#25D366' : '#E5E5E0',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                }}
              >
                <WA_ICON />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AppToast />
    </motion.div>
    </>
  )
}
