import { useState, useEffect } from 'react'
import { getConfig, updateConfig, resetConfig } from '@/api/client'
import type { AppConfig } from '@/types'

interface ConfigSidebarProps {
  onConfigUpdate: (config: AppConfig) => void
}

export const ConfigSidebar = ({ onConfigUpdate }: ConfigSidebarProps) => {
  const [config, setConfig] = useState<AppConfig | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Load configuration on mount
  useEffect(() => {
    loadConfig()
  }, [])

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

  const updateField = (field: keyof AppConfig, value: any) => {
    if (!config) return
    setConfig({ ...config, [field]: value })
  }

  const handleSave = async () => {
    if (!config) return

    setIsSaving(true)
    try {
      const response = await updateConfig(config)
      if (response.success) {
        setMessage({ type: 'success', text: 'Config saved!' })
        onConfigUpdate(response.config)
        setTimeout(() => setMessage(null), 2000)
      } else {
        setMessage({ type: 'error', text: response.message })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save configuration' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async () => {
    if (!confirm('Reset all settings to defaults?')) return

    setIsSaving(true)
    try {
      const response = await resetConfig()
      if (response.success) {
        setConfig(response.config)
        setMessage({ type: 'success', text: 'Config reset!' })
        onConfigUpdate(response.config)
        setTimeout(() => setMessage(null), 2000)
      } else {
        setMessage({ type: 'error', text: response.message })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to reset configuration' })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-4 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground">Loading config...</div>
        </div>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="p-4 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-destructive">Failed to load config</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold mb-1">Framegeist</h1>
        <div className="text-sm text-muted-foreground">
          ASCII Video & Image Converter
        </div>
      </div>

      {/* Configuration Sections */}
      <div className="flex-1 space-y-6 overflow-y-auto">
        {/* File Limits */}
        <section>
          <h3 className="text-sm font-semibold mb-3 text-foreground">File Limits</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1 text-muted-foreground">
                Image Max Size (MB)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={Math.round(config.image_max_size / (1024 * 1024))}
                onChange={(e) => updateField('image_max_size', parseInt(e.target.value) * 1024 * 1024)}
                className="framegeist-input w-full px-2 py-1 text-sm"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium mb-1 text-muted-foreground">
                Video Max Size (MB)
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={Math.round(config.video_max_size / (1024 * 1024))}
                onChange={(e) => updateField('video_max_size', parseInt(e.target.value) * 1024 * 1024)}
                className="framegeist-input w-full px-2 py-1 text-sm"
              />
            </div>
          </div>
        </section>

        {/* ASCII Settings */}
        <section>
          <h3 className="text-sm font-semibold mb-3 text-foreground">ASCII Settings</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1 text-muted-foreground">
                Width (characters)
              </label>
              <input
                type="number"
                min="20"
                max="200"
                value={config.ascii_width}
                onChange={(e) => updateField('ascii_width', parseInt(e.target.value))}
                className="framegeist-input w-full px-2 py-1 text-sm"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium mb-1 text-muted-foreground">
                Video FPS
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={config.default_fps}
                onChange={(e) => updateField('default_fps', parseInt(e.target.value))}
                className="framegeist-input w-full px-2 py-1 text-sm"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium mb-1 text-muted-foreground">
                Character Set
              </label>
              <input
                type="text"
                value={config.ascii_chars}
                onChange={(e) => updateField('ascii_chars', e.target.value)}
                className="framegeist-input w-full px-2 py-1 text-sm font-mono"
                placeholder="@%#*+=-:. "
              />
              <div className="text-xs text-muted-foreground mt-1">
                Dark → Light
              </div>
            </div>
          </div>
        </section>

        {/* Colors */}
        <section>
          <h3 className="text-sm font-semibold mb-3 text-foreground">Colors</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1 text-muted-foreground">
                Background
              </label>
              <input
                type="color"
                value={config.background_color}
                onChange={(e) => updateField('background_color', e.target.value)}
                className="w-full h-8 border border-input rounded-none cursor-pointer"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium mb-1 text-muted-foreground">
                Text Color
              </label>
              <input
                type="color"
                value={config.text_color}
                onChange={(e) => updateField('text_color', e.target.value)}
                className="w-full h-8 border border-input rounded-none cursor-pointer"
              />
            </div>

            {/* Color Preview */}
            <div 
              className="p-2 border rounded-none font-mono text-xs"
              style={{ backgroundColor: config.background_color, color: config.text_color }}
            >
              Sample:
              <br />
              {config.ascii_chars.slice(0, 10)}
              <br />
              ████▓▓▓▓░░░░
            </div>
          </div>
        </section>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 pt-4 border-t border-border space-y-2">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="framegeist-button w-full py-2 text-sm disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
        
        <button
          onClick={handleReset}
          disabled={isSaving}
          className="framegeist-button-secondary w-full py-2 text-sm disabled:opacity-50"
        >
          Reset to Defaults
        </button>

        {message && (
          <div className={`text-xs p-2 rounded-none border ${
            message.type === 'success' 
              ? 'border-green-500 text-green-400' 
              : 'border-destructive text-destructive'
          }`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  )
}