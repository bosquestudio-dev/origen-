import { motion, AnimatePresence } from 'framer-motion'

interface LoadingScreenProps {
  isVisible: boolean
}

export default function LoadingScreen({ isVisible }: LoadingScreenProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: '#000000',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 32,
          }}
        >
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
            style={{
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: '0.2em',
              color: 'rgba(255,255,255,0.85)',
              textTransform: 'uppercase',
            }}
          >
            ORIGEN
          </motion.span>

          <div
            style={{
              width: 160,
              height: 2,
              borderRadius: 2,
              background: 'rgba(255,255,255,0.1)',
              overflow: 'hidden',
            }}
          >
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.3, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
              style={{
                height: '100%',
                borderRadius: 2,
                background: 'linear-gradient(to right, #7F77DD, #C4527A)',
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
