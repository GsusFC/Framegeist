import { useState } from 'react'

interface SnippetGeneratorProps {
  frames: string[]
  asciiArt?: string
  snippet?: string
}

export const SnippetGenerator = ({ frames, asciiArt, snippet }: SnippetGeneratorProps) => {
  const [isCopied, setIsCopied] = useState(false)

  const generateSnippet = (fps = 10) => {
    // For images, generate static snippet
    if (asciiArt) {
      const containerId = `ascii-art-${Date.now()}`
      return `<div id="${containerId}"></div>
<script>
  document.getElementById("${containerId}").textContent = \`${asciiArt.replace(/`/g, '\\`')}\`;
</script>
<style>
  #${containerId} {
    font-family: monospace;
    white-space: pre;
    line-height: 1;
    background: #000;
    color: #0f0;
    padding: 1rem;
    border-radius: 0.5rem;
    overflow: auto;
    font-size: 12px;
  }
</style>`
    }
    
    // For videos, generate animated snippet
    const framesArray = frames.map(frame => JSON.stringify(frame)).join(',\n    ')
    const containerId = `ascii-animation-${Date.now()}`
    
    return `<div id="${containerId}"></div>
<script>
  const frames = [
    ${framesArray}
  ];
  let i = 0;
  setInterval(() => {
    document.getElementById("${containerId}").innerText = frames[i++ % frames.length];
  }, ${1000 / fps});
</script>
<style>
  #${containerId} {
    font-family: monospace;
    white-space: pre;
    line-height: 1;
    background: #000;
    color: #0f0;
    padding: 1rem;
    border-radius: 0.5rem;
    overflow: auto;
    font-size: 12px;
  }
</style>`
  }

  const copyToClipboard = async () => {
    const textToCopy = snippet || generateSnippet()
    
    try {
      await navigator.clipboard.writeText(textToCopy)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const downloadSnippet = () => {
    const content = snippet || generateSnippet()
    const blob = new Blob([content], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = 'ascii-animation.html'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const currentSnippet = snippet || generateSnippet()

  // If no content, don't render anything for snippet
  if (!frames.length && !asciiArt && !snippet) return null

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <h2 className="text-2xl font-semibold text-center" style={{ color: 'hsl(var(--foreground))' }}>Embeddable Snippet</h2>
      <div className="bg-card text-card-foreground border border-border rounded-none p-4">
        <pre className="bg-muted text-muted-foreground p-4 rounded-md overflow-auto text-sm"
             style={{ backgroundColor: 'hsl(var(--muted)/0.5)', color: 'hsl(var(--muted-foreground))' }}
        >
          {currentSnippet}
        </pre>
      </div>
      
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={copyToClipboard}
          className={`px-4 py-2 border border-border rounded-none font-mono transition-all ease-in-out duration-200 ${isCopied ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
        >
          {isCopied ? 'COPIED!' : 'COPY'}
        </button>
        
        <button
          onClick={downloadSnippet}
          className="px-4 py-2 border border-border rounded-none font-mono transition-all ease-in-out duration-200 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          DOWNLOAD HTML
        </button>
      </div>
    </div>
  )
}