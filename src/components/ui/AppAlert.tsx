import { X, Info, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'

interface AlertProps {
  variant: 'info' | 'success' | 'warning' | 'error'
  title?: string
  message: string
  onClose?: () => void
}

const ALERT_CONFIG = {
  info:    { Icon: Info,          className: 'alert-info' },
  success: { Icon: CheckCircle2,  className: 'alert-success' },
  warning: { Icon: AlertTriangle, className: 'alert-warning' },
  error:   { Icon: XCircle,       className: 'alert-error' },
}

export default function AppAlert({ variant, title, message, onClose }: AlertProps) {
  const { Icon, className } = ALERT_CONFIG[variant]
  return (
    <div className={`alert-base ${className}`}>
      <Icon size={16} className="alert-icon" />
      <div className="alert-content">
        {title && <div className="alert-title">{title}</div>}
        <div className="alert-message">{message}</div>
      </div>
      {onClose && (
        <button onClick={onClose} className="alert-close">
          <X size={14} />
        </button>
      )}
    </div>
  )
}
