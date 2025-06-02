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
      }
    } catch (error) {
      console.error('Failed to load config:', error)
    }
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