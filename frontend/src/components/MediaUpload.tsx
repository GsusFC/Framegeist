import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import type { UploadProgress, MediaType, AppConfig } from '@/types' // Assuming these types are correctly defined
import { uploadMedia, getMediaType } from '@/api/client' // Assuming these functions are correctly defined

interface MediaUploadProps {
  onUploadComplete: (result: {
    type: MediaType
    frames?: string[]
    asciiArt?: string
    snippet?: string
  }) => void
  onError: (error: string) => void
  config: AppConfig | null
}

export const MediaUpload = ({ onUploadComplete, onError, config }: MediaUploadProps) => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    isUploading: false,
    progress: 0,
    message: '',
    mediaType: null, // To store the type of media being uploaded
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const currentMediaType = getMediaType(file); // Use a local var for current upload
      
      const maxSize = currentMediaType === 'image' 
        ? (config?.image_max_size || 5 * 1024 * 1024) // 5MB default
        : (config?.video_max_size || 10 * 1024 * 1024); // 10MB default
      
      const sizeLimit = Math.round(maxSize / (1024 * 1024));

      if (file.size > maxSize) {
        onError(`File size must be less than ${sizeLimit}MB for ${currentMediaType}s.`);
        return;
      }

      // Define the progress handler for this specific upload
      const handleUploadProgress = (percentage: number) => {
        setUploadProgress({
          isUploading: true,
          progress: percentage,
          message: percentage < 100 ? `Uploading ${currentMediaType} ${percentage}%...` : `Processing ${currentMediaType}...`,
          mediaType: currentMediaType,
        });
      };

      // Set initial state for upload
      setUploadProgress({
        isUploading: true,
        progress: 0,
        message: 'Preparing to upload...',
        mediaType: currentMediaType,
      });

      try {
        const result = await uploadMedia(file, handleUploadProgress);
        
        // Ensure progress is 100% and message is "Processing..." after uploadMedia resolves
        setUploadProgress(prev => ({
            ...prev, // Keep other potential fields if any, though not strictly necessary here
            isUploading: true, // Still processing on the backend potentially
            progress: 100,
            message: `Processing ${currentMediaType}...`,
            mediaType: currentMediaType,
        }));

        if (result.success) {
          onUploadComplete({
            type: currentMediaType,
            frames: result.frames,
            asciiArt: result.ascii_art,
            snippet: result.snippet,
          });
        } else {
          onError(result.error || `Upload failed for ${currentMediaType}.`);
        }
      } catch (error) {
        console.error("Upload error:", error); 
        onError(error instanceof Error ? error.message : `Upload failed due to an unknown error.`);
      } finally {
        // Reset state after completion or error, unless you want to show final status differently
        // For now, we reset fully. If result.success is false, onError is called, 
        // and the UI will reflect the error message from App.tsx.
        // If successful, onUploadComplete is called, and App.tsx updates.
        // So, resetting here is generally fine to allow another upload.
        setUploadProgress({
          isUploading: false,
          progress: 0,
          message: '',
          mediaType: null,
        });
      }
    },
    [onUploadComplete, onError, config] // Dependencies for useCallback
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.webm'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    },
    maxFiles: 1,
    disabled: uploadProgress.isUploading, // Disable dropzone while uploading
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        role="button"
        tabIndex={0}
        aria-label={uploadProgress.isUploading ? "Uploading media, please wait." : `Upload media: Drag and drop video or image, or click to select. Video limit ${config ? Math.round(config.video_max_size / (1024 * 1024)) : 10}MB, Image limit ${config ? Math.round(config.image_max_size / (1024 * 1024)) : 5}MB.`}
        className={`bg-card text-card-foreground border-2 border-dashed border-border rounded-none p-8 text-center cursor-pointer transition-colors hover:border-primary ${
          isDragActive ? 'border-primary bg-primary/10' : ''
        } ${uploadProgress.isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} /> 
        
        {uploadProgress.isUploading ? (
          <div className="space-y-2">
            <div 
              className="animate-spin w-8 h-8 rounded-full mx-auto border-2 border-border border-t-primary" 
            />
            {/* Progress Bar */}
            <div className="w-full bg-muted rounded-full h-2.5 my-2">
              <div 
                className="bg-primary h-2.5 rounded-full transition-all duration-150 ease-linear" 
                style={{ width: `${uploadProgress.progress}%` }}
                aria-valuenow={uploadProgress.progress}
                aria-valuemin={0}
                aria-valuemax={100}
                role="progressbar"
                aria-label={`Upload progress: ${uploadProgress.progress}%`}
              ></div>
            </div>
            <p className="text-muted-foreground text-sm" aria-live="polite">{uploadProgress.message}</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-2xl font-bold text-foreground">
              [ UPLOAD ]
            </div>
            <p className="text-lg font-medium text-foreground">
              {isDragActive ? 'Drop media here' : 'Drag & drop video/image or click'}
            </p>
            <p className="text-sm text-muted-foreground">
              Videos: MP4, MOV, AVI, WebM (max {config ? Math.round(config.video_max_size / (1024 * 1024)) : 10}MB)<br/>
              Images: JPG, PNG, GIF, WebP (max {config ? Math.round(config.image_max_size / (1024 * 1024)) : 5}MB)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
