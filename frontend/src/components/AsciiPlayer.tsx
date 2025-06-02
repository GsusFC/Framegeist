import { useState, useEffect, useRef } from 'react'

interface AsciiPlayerProps {
  frames: string[]
  fps?: number
  backgroundColor?: string
  textColor?: string
}

export const AsciiPlayer = ({ frames, fps = 10, backgroundColor = '#000000', textColor = '#00ff00' }: AsciiPlayerProps) => {
  const [currentFrame, setCurrentFrame] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    if (isPlaying && frames.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentFrame((prev) => (prev + 1) % frames.length)
      }, 1000 / fps)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, frames.length, fps])

  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
  }

  if (frames.length === 0) {
    return null
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <div 
        className="font-mono border border-border rounded-none p-4 overflow-auto"
        style={{ backgroundColor, color: textColor }}
      >
        <pre className="text-xs leading-none whitespace-pre" style={{ fontFamily: 'var(--font-mono)' }}>
          {frames[currentFrame]}
        </pre>
      </div>
      
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={togglePlayback}
          className="px-4 py-2 border border-border rounded-none font-mono transition-all ease-in-out duration-200 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isPlaying ? 'PAUSE' : 'PLAY'}
        </button>
        
        <span className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
          Frame {currentFrame + 1} of {frames.length}
        </span>
      </div>
    </div>
  )
}