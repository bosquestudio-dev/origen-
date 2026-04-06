import type { CompanyTheme } from '@/types/company.types'

interface CompanyThemePreviewProps {
  theme: CompanyTheme
}

export default function CompanyThemePreview({ theme }: CompanyThemePreviewProps) {
  return (
    <div className="bg-surface-3 border border-border rounded-modal p-5 space-y-4">
      <p className="text-xs text-muted-foreground uppercase tracking-widest">Vista previa</p>

      <div className="bg-background rounded-card p-4 border border-border space-y-3">
        {/* Simulated header */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Hola, Ana</span>
          <span className="text-xs font-medium text-foreground">{theme.companyName || 'ORIGEN'}</span>
          <div className="w-6 h-6 rounded-full border-2" style={{ borderColor: theme.primaryColor }} />
        </div>

        {/* Simulated cards */}
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 rounded-sm border border-border flex items-center justify-center">
              <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: i === 2 ? theme.primaryColor : theme.secondaryColor, opacity: 0.6 }} />
            </div>
          ))}
        </div>

        {/* Simulated button */}
        <div className="h-8 rounded-card flex items-center justify-center text-xs text-white" style={{ backgroundColor: theme.primaryColor }}>
          Botón de ejemplo
        </div>
      </div>
    </div>
  )
}
