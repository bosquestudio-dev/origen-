import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Megaphone, X } from 'lucide-react'
import type { Notification } from '@/data/notifications.data'

interface NotificationBannerProps {
  notifications: Notification[]
}

const NotificationBanner = ({ notifications }: NotificationBannerProps) => {
  const [dismissed, setDismissed] = useState<string[]>([])
  const visible = notifications.filter(n => !dismissed.includes(n.id))

  return (
    <AnimatePresence initial={false}>
      {visible.map(notification => (
        <motion.div
          key={notification.id}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{
            height: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
            opacity: { duration: 0.3 },
          }}
          className="overflow-hidden notification-banner-wrap"
        >
          <div className="notification-banner-item">

            {/* Icono */}
            <div className="notification-banner-icon">
              <Megaphone size={18} />
            </div>

            {/* Contenido */}
            <p className="flex-1 min-w-0 notification-banner-message" style={{ margin: 0 }}>
              <span className="notification-banner-title">{notification.title}&nbsp;&nbsp;</span>
              <span dangerouslySetInnerHTML={{ __html: notification.message }} />
            </p>

            {/* Botón cerrar */}
            <button
              onClick={() => setDismissed(prev => [...prev, notification.id])}
              className="notification-banner-close"
              aria-label="Cerrar notificación"
            >
              <X size={15} />
            </button>

          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  )
}

export default NotificationBanner
