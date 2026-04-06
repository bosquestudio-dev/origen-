import { useState } from 'react'
import { useAdminStore } from '@/stores/admin.store'
import AppButton from '@/components/origen/AppButton'
import CompanyThemePreview from '@/components/admin/CompanyThemePreview'
import AppToast from '@/components/origen/AppToast'
import { useAppStore } from '@/stores/app.store'

export default function AdminCompanyPage() {
  const { theme, updateTheme } = useAdminStore()
  const { showToast } = useAppStore()
  const [primary, setPrimary] = useState(theme.primaryColor)
  const [secondary, setSecondary] = useState(theme.secondaryColor)
  const [name, setName] = useState(theme.companyName)
  const [logoUrl, setLogoUrl] = useState(theme.logoUrl || '')

  const previewTheme = { primaryColor: primary, secondaryColor: secondary, companyName: name, logoUrl: logoUrl || undefined }

  const handleSave = () => {
    updateTheme(previewTheme)
    showToast('Cambios guardados correctamente')
  }

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-medium text-foreground">Personalización de empresa</h2>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-surface-2 border border-border rounded-card p-5 space-y-4">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Identidad visual</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground">Color primario</label>
                <div className="flex gap-2 mt-1">
                  <input type="color" value={primary} onChange={e => setPrimary(e.target.value)} className="w-10 h-10 rounded border-none cursor-pointer bg-transparent" />
                  <input value={primary} onChange={e => setPrimary(e.target.value)} className="flex-1 bg-surface-3 border border-border rounded-card px-3 py-2 text-xs text-foreground font-mono focus:outline-none focus:border-accent" />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Color secundario</label>
                <div className="flex gap-2 mt-1">
                  <input type="color" value={secondary} onChange={e => setSecondary(e.target.value)} className="w-10 h-10 rounded border-none cursor-pointer bg-transparent" />
                  <input value={secondary} onChange={e => setSecondary(e.target.value)} className="flex-1 bg-surface-3 border border-border rounded-card px-3 py-2 text-xs text-foreground font-mono focus:outline-none focus:border-accent" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground">URL del logo (opcional)</label>
              <input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://..." className="w-full mt-1 bg-surface-3 border border-border rounded-card px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent" />
            </div>
          </div>

          <div className="bg-surface-2 border border-border rounded-card p-5 space-y-4">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Información</p>
            <div>
              <label className="text-xs text-muted-foreground">Nombre de la empresa</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full mt-1 bg-surface-3 border border-border rounded-card px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent" />
            </div>
          </div>

          <AppButton onClick={handleSave} className="w-full">Guardar cambios</AppButton>
        </div>

        <CompanyThemePreview theme={previewTheme} />
      </div>

      <AppToast />
    </div>
  )
}
