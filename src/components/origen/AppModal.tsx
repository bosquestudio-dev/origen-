import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/stores/app.store'

interface AppModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  challenge?: boolean
}

export default function AppModal({ isOpen, onClose, children, challenge = false }: AppModalProps) {
  const { closeChallenge } = useAppStore()

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleOverlayClick = () => {
    if (challenge) closeChallenge()
    else onClose()
  }

  const handleXClose = () => {
    if (challenge) closeChallenge()
    else onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            overflow: 'hidden',
            padding: '16px',
          }}
          onClick={handleOverlayClick}
        >
          {challenge ? (
            /* ── CHALLENGE MODAL — stacked cards ── */
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '460px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Third card — furthest back */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(127,119,221,0.04)',
                  borderRadius: '24px',
                  border: '1px solid rgba(127,119,221,0.07)',
                  transform: 'rotate(5deg) translateY(18px)',
                  zIndex: 50,
                  pointerEvents: 'none',
                }}
              />

              {/* Second card */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(127,119,221,0.08)',
                  borderRadius: '22px',
                  border: '1px solid rgba(127,119,221,0.12)',
                  transform: 'rotate(2.5deg) translateY(10px)',
                  zIndex: 51,
                  pointerEvents: 'none',
                }}
              />

              {/* Main card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 24 }}
                transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="modal-scroll"
                style={{
                  position: 'relative',
                  zIndex: 52,
                  width: '100%',
                  background: '#0F0F1A',
                  borderRadius: '20px',
                  border: '1px solid rgba(127,119,221,0.2)',
                  boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
                  maxHeight: '88dvh',
                  overflowY: 'auto',
                }}
              >
                {/* X close button */}
                <button
                  onClick={handleXClose}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    zIndex: 60,
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
                    e.currentTarget.style.color = 'rgba(255,255,255,0.8)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                    e.currentTarget.style.color = 'rgba(255,255,255,0.4)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10">
                    <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>

                {children}
              </motion.div>
            </div>
          ) : (
            /* ── GENERIC MODAL (logout, etc.) ── */
            <motion.div
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{
                background: '#1A1A1A',
                borderRadius: 20,
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '32px',
                width: '90%',
                maxWidth: 400,
                boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
              }}
            >
              {children}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
