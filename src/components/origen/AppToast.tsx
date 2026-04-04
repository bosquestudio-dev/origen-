import { useAppStore } from '@/stores/app.store'

export default function AppToast() {
  const { toast } = useAppStore()
  if (!toast.visible) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] toast-enter">
      <div className="bg-surface-3 border border-border text-foreground text-sm px-5 py-3 rounded-card shadow-lg">
        {toast.message}
      </div>
    </div>
  )
}
