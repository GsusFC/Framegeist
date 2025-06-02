export interface MediaUploadResponse {
  success: boolean
  frames: string[]
  ascii_art?: string
  snippet?: string
  error?: string
  file_type: string
}


export interface UploadProgress {
  isUploading: boolean
  progress: number
  message: string
  mediaType: MediaType | null // Added to track the type of media being uploaded
}

export type MediaType = 'image' | 'video'

export interface AppConfig {
  image_max_size: number
  video_max_size: number
  ascii_width: number
  default_fps: number
  ascii_chars: string
  background_color: string
  text_color: string
}

export interface ConfigResponse {
  success: boolean
  config: AppConfig
  message: string
}

export interface StreamingUploadResponse {
  success: boolean
  message: string
  stream_id?: string
  error?: string
}

export interface StreamStatus {
  stream_id: string
  status: 'ready' | 'not_found'
  ready: boolean
  file_size?: number
  filename?: string
}