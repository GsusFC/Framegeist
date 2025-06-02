import type { MediaUploadResponse, MediaType, ConfigResponse, AppConfig, StreamingUploadResponse, StreamStatus } from '@/types'

const API_BASE_URL = 'http://localhost:8000'

export const uploadMedia = (file: File, onProgressCallback?: (percentage: number) => void): Promise<MediaUploadResponse> => {
  const isImage = file.type.startsWith('image/')
  const endpoint = isImage ? '/upload-image' : '/upload'
  const fieldName = isImage ? 'image' : 'video'
  
  const formData = new FormData()
  formData.append(fieldName, file)

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `${API_BASE_URL}${endpoint}`;

    xhr.open('POST', url, true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgressCallback) {
        const percentage = Math.round((event.loaded / event.total) * 100);
        onProgressCallback(percentage);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const jsonResponse = JSON.parse(xhr.responseText) as MediaUploadResponse;
          // Simulate a final progress update if not already 100%
          if (onProgressCallback) onProgressCallback(100);
          resolve(jsonResponse);
        } catch (e) {
          // Simulate a final progress update even on parse error, then reject
          if (onProgressCallback) onProgressCallback(100); 
          reject(new Error('Failed to parse server response.'));
        }
      } else {
        // Simulate a final progress update on server error, then reject
        if (onProgressCallback) onProgressCallback(100);
        reject(new Error(`Upload failed with status: ${xhr.status}`));
      }
    };

    xhr.onerror = () => {
      // Simulate a final progress update on network error, then reject
      if (onProgressCallback) onProgressCallback(100); // Or perhaps 0 or leave as is depending on UX preference
      reject(new Error('Upload failed due to a network error.'));
    };

    xhr.send(formData);
  });
}

export const getMediaType = (file: File): MediaType => {
  return file.type.startsWith('image/') ? 'image' : 'video'
}

// Configuration API
export const getConfig = async (): Promise<ConfigResponse> => {
  const response = await fetch(`${API_BASE_URL}/config`)
  if (!response.ok) {
    throw new Error('Failed to fetch configuration')
  }
  return response.json()
}

export const updateConfig = async (config: Partial<AppConfig>): Promise<ConfigResponse> => {
  const response = await fetch(`${API_BASE_URL}/config`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  })
  if (!response.ok) {
    throw new Error('Failed to update configuration')
  }
  return response.json()
}

export const resetConfig = async (): Promise<ConfigResponse> => {
  const response = await fetch(`${API_BASE_URL}/config/reset`, {
    method: 'POST',
  })
  if (!response.ok) {
    throw new Error('Failed to reset configuration')
  }
  return response.json()
}

export const uploadVideoForStreaming = async (file: File): Promise<StreamingUploadResponse> => {
  const formData = new FormData()
  formData.append('video', file)

  const response = await fetch(`${API_BASE_URL}/stream-upload`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Failed to upload video for streaming')
  }

  return response.json()
}

export const getStreamStatus = async (streamId: string): Promise<StreamStatus> => {
  const response = await fetch(`${API_BASE_URL}/stream-status/${streamId}`)

  if (!response.ok) {
    throw new Error('Failed to get stream status')
  }

  return response.json()
}

export const streamAsciiFrames = async (
  streamId: string,
  onFrame: (frameIndex: number, frameData: string) => void,
  onComplete: (totalFrames: number) => void,
  onError: (error: string) => void
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/stream-ascii/${streamId}`)

  if (!response.ok) {
    throw new Error('Failed to start ASCII stream')
  }

  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('No response body reader available')
  }

  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      buffer += decoder.decode(value, { stream: true })

      // Process complete messages in buffer
      let lines = buffer.split('\n')
      buffer = lines.pop() || '' // Keep last incomplete line in buffer

      for (const line of lines) {
        if (line.startsWith('FRAME:')) {
          const frameIndex = parseInt(line.substring(6))
          // Next lines until END_FRAME contain the ASCII data
          const frameStart = lines.indexOf(line)
          const frameEndIndex = lines.indexOf('END_FRAME', frameStart)
          
          if (frameEndIndex > frameStart) {
            const frameLines = lines.slice(frameStart + 1, frameEndIndex)
            const frameData = frameLines.join('\n')
            onFrame(frameIndex, frameData)
          }
        } else if (line.startsWith('COMPLETE:')) {
          const totalFrames = parseInt(line.substring(9))
          onComplete(totalFrames)
          return
        } else if (line.startsWith('ERROR:')) {
          const errorMsg = lines[lines.indexOf(line) + 1] || 'Unknown error'
          onError(errorMsg)
          return
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}