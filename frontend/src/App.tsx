import { useState, useEffect } from 'react'
import { Layout } from '@/components/Layout'
import { ConfigSidebar } from '@/components/ConfigSidebar'
import { MainContent } from '@/components/MainContent'
import { getConfig } from '@/api/client'
import type { AppConfig } from '@/types'

export const App = () => {
  const [config, setConfig] = useState<AppConfig | null>(null)

  // Load initial configuration
  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const response = await getConfig()
      if (response.success) {
        setConfig(response.config)
      } else {
        console.error('Failed to load config:', response.message)
        // Use default config if backend not available
        setDefaultConfig()
      }
    } catch (error) {
      console.error('Failed to load config:', error)
      // Use default config if backend not available  
      setDefaultConfig()
    }
  }

  const setDefaultConfig = () => {
    setConfig({
      image_max_size: 5 * 1024 * 1024, // 5MB
      video_max_size: 10 * 1024 * 1024, // 10MB
      ascii_width: 80,
      default_fps: 10,
      ascii_chars: "@%#*+=-:. ",
      background_color: "#000000",
      text_color: "#00ff00"
    })
  }

  const handleConfigUpdate = (newConfig: AppConfig) => {
    setConfig(newConfig)
  }

  return (
    <Layout
      sidebar={
        <ConfigSidebar onConfigUpdate={handleConfigUpdate} />
      }
    >
      <MainContent config={config} />
    </Layout>
  )
}