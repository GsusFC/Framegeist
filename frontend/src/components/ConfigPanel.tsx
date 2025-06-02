import { useState, useEffect } from 'react'
import { getConfig, updateConfig } from '@/api/client'
import type { AppConfig } from '@/types'

interface ConfigPanelProps {
  isOpen: boolean
  onClose: () => void
  onConfigUpdate: (config: AppConfig) => void
}

export const ConfigPanel = ({ isOpen, onClose, onConfigUpdate }: ConfigPanelProps) => {
  const [config, setConfig] = useState<AppConfig | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Load configuration
  const loadConfig = async () => {
    setIsLoading(true)
    try {
      const response = await getConfig()
      if (response.success) {
        setConfig(response.config)
      } else {
        setMessage({ type: 'error', text: response.message })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load configuration' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadConfig()
    }
  }, [isOpen])

  const handleSave = async () => {
    if (!config) return

    setIsSaving(true)
    try {
      const response = await updateConfig(config)
      if (response.success) {
        setMessage({ type: 'success', text: 'Configuration updated successfully!' })
        onConfigUpdate(response.config)
        setTimeout(() => {
          setMessage(null)
        }, 3000)
      } else {
        setMessage({ type: 'error', text: response.message })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update configuration' })
    } finally {
      setIsSaving(false)
    }
  }

  const updateField = (field: keyof AppConfig, value: number | string) => {
    if (!config) return
    setConfig({ ...config, [field]: value })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-card text-card-foreground border border-border rounded-none p-6 w-full max-w-md mx-4 max-h-screen overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold" style={{ color: 'hsl(var(--foreground))' }}>Configuración</h2>
          <button 
            onClick={onClose}
            className="px-3 py-1 text-sm border border-border rounded-none font-mono transition-all ease-in-out duration-200 bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            Cerrar
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-4">
            <div 
              className="animate-spin w-6 h-6 rounded-full mx-auto mb-2" 
              style={{
                border: '2px solid hsl(var(--border))',
                borderTop: '2px solid hsl(var(--primary))'
              }}
            />
            <p style={{ color: 'hsl(var(--muted-foreground))' }}>Cargando configuración...</p>
          </div>
        ) : config ? (
          <div className="space-y-4">
            {/* File Size Limits */}
            <div className="space-y-3">
              <h3 className="font-semibold" style={{ color: 'hsl(var(--foreground))' }}>Límites de Archivo</h3>
              
              <div>
                <label htmlFor="image_max_size" className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  Límite de Imágenes (MB)
                </label>
                <input
                  id="image_max_size"
                  type="number"
                  min="1"
                  max="100"
                  value={Math.round(config.image_max_size / (1024 * 1024))}
                  onChange={(e) => updateField('image_max_size', parseInt(e.target.value) * 1024 * 1024)}
                  className="bg-background text-foreground border border-input rounded-none font-mono focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 w-full px-3 py-2"
                />
              </div>

              <div>
                <label htmlFor="video_max_size" className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>Max Video Size (MB)</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={Math.round(config.video_max_size / (1024 * 1024))}
                  onChange={(e) => updateField('video_max_size', parseInt(e.target.value) * 1024 * 1024)}
                  className="bg-background text-foreground border border-input rounded-none font-mono focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 w-full px-3 py-2"
                />
              </div>
            </div>

            {/* ASCII Settings */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium border-b pb-2" style={{ color: 'hsl(var(--foreground))', borderColor: 'hsl(var(--border))' }}>ASCII Settings</h3>
              
              <div>
                <label htmlFor="ascii_width" className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>ASCII Width (chars)</label>
                <input
                  id="ascii_width"
                  type="number"
                  min="10"
                  max="500"
                  value={config.ascii_width}
                  onChange={(e) => updateField('ascii_width', parseInt(e.target.value))}
                  className="bg-background text-foreground border border-input rounded-none font-mono focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 w-full px-3 py-2"
                />
              </div>

              <div>
                <label htmlFor="default_fps" className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>Default FPS</label>
                <input
                  id="default_fps"
                  type="number"
                  min="1"
                  max="60"
                  value={config.default_fps}
                  onChange={(e) => updateField('default_fps', parseInt(e.target.value))}
                  className="bg-background text-foreground border border-input rounded-none font-mono focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 w-full px-3 py-2"
                />
              </div>

              <div>
                <label htmlFor="ascii_chars" className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>ASCII Characters</label>
                <input
                  type="text"
                  value={config.ascii_chars}
                  onChange={(e) => updateField('ascii_chars', e.target.value)}
                  id="ascii_chars"
                  className="bg-background text-foreground border border-input rounded-none font-mono focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 w-full px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="background_color" className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>Background Color</label>
                  <input
                    type="color"
                    value={config.background_color}
                    onChange={(e) => updateField('background_color', e.target.value)}
                    id="background_color"
                    className="w-full h-10 border border-input rounded-none cursor-pointer"
                  />
                </div>
                
                <div>
                  <label htmlFor="text_color" className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>Text Color</label>
                  <input
                    type="color"
                    value={config.text_color}
                    onChange={(e) => updateField('text_color', e.target.value)}
                    id="text_color"
                    className="w-full h-10 border border-input rounded-none cursor-pointer"
                  />
                </div>
              </div>
              
              <div className="p-3 border rounded-none font-mono text-sm whitespace-pre-line" style={{ backgroundColor: config.background_color, color: config.text_color, borderColor: 'hsl(var(--border))' }}>
                Preview:
{`@@@@@@@@@@@@@@@@@@
@@@@++======++@@@@
@@++........++@@@@
@@..        ..@@@@
@@..        ..@@@@
@@++........++@@@@
@@@@++======++@@@@
@@@@@@@@@@@@@@@@@@`}
              </div>
            </div>

            {message && (
              <div className={`bg-card text-card-foreground border border-border rounded-none p-3 ${
                message.type === 'success' ? 'border-green-500' : 'border-destructive'
              }`}>
                <p style={{ color: message.type === 'success' ? 'hsl(var(--primary))' : 'hsl(var(--destructive))' }}>
                  {message.text}
                </p>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button 
                onClick={handleSave}
                disabled={isSaving || isLoading}
                className="flex-1 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed border border-border rounded-none font-mono transition-all ease-in-out duration-200 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed border border-border rounded-none font-mono transition-all ease-in-out duration-200 bg-secondary text-secondary-foreground hover:bg-secondary/80"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4" style={{ color: 'hsl(var(--destructive))' }}>
            Error al cargar la configuración
          </div>
        )}
      </div>
    </div>
  )
}