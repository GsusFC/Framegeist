import { ReactNode } from 'react'

interface LayoutProps {
  sidebar: ReactNode
  children: ReactNode
}

export const Layout = ({ sidebar, children }: LayoutProps) => {
  return (
    <div className="h-screen w-screen flex overflow-hidden bg-background text-foreground">
      {/* Sidebar - 20% width */}
      <div className="w-1/5 min-w-64 max-w-80 border-r border-border bg-card overflow-y-auto">
        {sidebar}
      </div>
      
      {/* Main content area - 80% width */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}