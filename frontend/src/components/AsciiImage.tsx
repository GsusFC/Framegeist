import { useState } from 'react'

interface AsciiImageProps {
  asciiArt: string
  backgroundColor?: string
  textColor?: string
}

export const AsciiImage = ({ asciiArt, backgroundColor = '#000000', textColor = '#00ff00' }: AsciiImageProps) => {
  const [isZoomed, setIsZoomed] = useState(false)

  const toggleZoom = () => {
    setIsZoomed(!isZoomed)
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <div 
        className={`font-mono border border-border rounded-none p-4 overflow-auto cursor-pointer transition-all duration-300 ${
          isZoomed ? 'fixed inset-4 z-50 max-w-none' : ''
        }`}
        style={{ backgroundColor, color: textColor }}
        onClick={toggleZoom}
        title={isZoomed ? 'Click para cerrar' : 'Click para ampliar'}
      >
        <pre className={`leading-none whitespace-pre ${
          isZoomed ? 'text-base' : 'text-xs'
        }`} style={{ fontFamily: 'var(--font-mono)' }}>
          {asciiArt}
        </pre>
      </div>
      
      <div className="text-center text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
        {isZoomed ? (
          <p>Expanded view - Click to close</p>
        ) : (
          <p>ASCII Art generated - Click to expand</p>
        )}
      </div>
    </div>
  )
}