import { motion, AnimatePresence } from 'framer-motion'

interface TransitionOverlayProps {
  isActive: boolean
}

export default function TransitionOverlay({ isActive }: TransitionOverlayProps) {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          key="transition-overlay"
          initial={{
            clipPath: 'ellipse(240px 160px at 50% 50%)',
            opacity: 1,
          }}
          animate={{
            clipPath: 'ellipse(200% 200% at 50% 50%)',
            opacity: [1, 1, 1, 0],
          }}
          transition={{
            duration: 1.2,
            ease: [0.4, 0, 0.6, 1],
            opacity: {
              times: [0, 0.5, 0.8, 1],
              duration: 1.2,
            },
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: '#0F0F1A',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        />
      )}
    </AnimatePresence>
  )
}
