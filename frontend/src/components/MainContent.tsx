import { useState } from 'react'
import { MediaUpload } from './MediaUpload'
import { AsciiPlayer } from './AsciiPlayer'
import { AsciiImage } from './AsciiImage'
import { SnippetGenerator } from './SnippetGenerator'
import type { MediaType, AppConfig } from '@/types'

interface MainContentProps {
  config: AppConfig | null
}

export const MainContent = ({ config }: MainContentProps) => {
  const [frames, setFrames] = useState<string[]>([])
  const [asciiArt, setAsciiArt] = useState<string>('')
  const [snippet, setSnippet] = useState<string>('')
  const [mediaType, setMediaType] = useState<MediaType | null>(null)
  const [error, setError] = useState<string>('')

  const hasContent = frames.length > 0 || asciiArt

  const handleUploadComplete = (result: {
    type: MediaType
    frames?: string[]
    asciiArt?: string
    snippet?: string
  }) => {
    setFrames(result.frames || [])
    setAsciiArt(result.asciiArt || '')
    setSnippet(result.snippet || '')
    setMediaType(result.type)
    setError('')
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
  }

  const resetContent = () => {
    setFrames([])
    setAsciiArt('')
    setSnippet('')
    setMediaType(null)
    setError('')
  }

  return (
    <div className="h-full flex flex-col">
      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {error && (
          <div className="mb-6 p-4 border border-destructive bg-destructive/10 text-destructive rounded-none">
            <strong>Error:</strong> {error}
          </div>
        )}

        {!hasContent ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-full max-w-2xl">
              <MediaUpload
                onUploadComplete={handleUploadComplete}
                onError={handleError}
                config={config}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Reset Button */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">
                  {mediaType === 'video' ? 'ASCII Animation' : 'ASCII Art'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {mediaType === 'video' 
                    ? `${frames.length} frames converted` 
                    : 'Image converted to ASCII'
                  }
                </p>
              </div>
              
              <button
                onClick={resetContent}
                className="framegeist-button-secondary px-4 py-2"
              >
                Upload New Media
              </button>
            </div>

            {/* Preview */}
            <div className="w-full">
              {mediaType === 'video' && frames.length > 0 && (
                <AsciiPlayer 
                  frames={frames} 
                  backgroundColor={config?.background_color}
                  textColor={config?.text_color}
                />
              )}
              
              {mediaType === 'image' && asciiArt && (
                <AsciiImage 
                  asciiArt={asciiArt}
                  backgroundColor={config?.background_color}
                  textColor={config?.text_color}
                />
              )}
            </div>
            
            {/* Snippet Generator */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Embeddable Snippet</h3>
              <SnippetGenerator 
                frames={frames} 
                asciiArt={asciiArt}
                snippet={snippet} 
              />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}