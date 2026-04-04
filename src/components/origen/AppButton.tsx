interface AppButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost'
  loading?: boolean
  disabled?: boolean
  onClick?: () => void
  children: React.ReactNode
  className?: string
  type?: 'button' | 'submit'
}

export default function AppButton({
  variant = 'primary',
  loading = false,
  disabled = false,
  onClick,
  children,
  className = '',
  type = 'button',
}: AppButtonProps) {
  const base = 'px-6 py-3 rounded-card font-medium text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2'
  const variants = {
    primary: 'bg-accent text-accent-foreground hover:bg-accent-hover',
    secondary: 'bg-surface-2 text-foreground border border-border hover:bg-surface-3',
    ghost: 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-surface-2',
  }

  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
