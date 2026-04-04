import { useEffect } from 'react'

interface AppModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export default function AppModal({ isOpen, onClose, children }: AppModalProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-surface-2 border border-border rounded-modal p-6 animate-[scale-in_0.2s_ease] max-h-[85vh] overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
