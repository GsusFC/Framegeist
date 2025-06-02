import os
import tempfile
import uuid
import logging
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from utils.ascii_streaming import stream_ascii_from_video
from utils.config import get_config
from routers.upload import get_safe_extension

router = APIRouter()
logger = logging.getLogger(__name__)


class StreamingUploadResponse(BaseModel):
    success: bool
    message: str
    stream_id: Optional[str] = None
    error: Optional[str] = None


@router.post("/stream-upload", response_model=StreamingUploadResponse)
async def upload_video_for_streaming(video: UploadFile = File(...)):
    """Upload video and return stream ID for ASCII streaming"""
    
    logger.info(f"Streaming upload started: {video.filename}, size: {video.size}, type: {video.content_type}")
    config = get_config()
    
    # Validate file type
    if not video.content_type or not video.content_type.startswith("video/"):
        raise HTTPException(
            status_code=400, 
            detail="File must be a video (MP4, MOV, AVI, WebM)"
        )
    
    # Get safe file extension
    extension = get_safe_extension(video.filename, video.content_type)
    
    # Check file size using dynamic config
    if video.size and video.size > config.video_max_size:
        limit_mb = config.get_video_limit_mb()
        raise HTTPException(
            status_code=400,
            detail=f"File size must be less than {limit_mb:.0f}MB"
        )
    
    # Initialize temp file path for cleanup
    video_path: Optional[Path] = None
    
    try:
        # Generate unique stream ID
        stream_id = f"stream_{uuid.uuid4().hex[:12]}"
        
        with tempfile.NamedTemporaryFile(
            delete=False, 
            suffix=extension,
            prefix=f"{stream_id}_"
        ) as temp_file:
            # Save uploaded video
            content = await video.read()
            temp_file.write(content)
            temp_file.flush()
            
            video_path = Path(temp_file.name)
            
            logger.info(f"Video saved for streaming: {video_path}, stream_id: {stream_id}")
            
            return StreamingUploadResponse(
                success=True,
                message="Video uploaded successfully. Use stream_id to start streaming.",
                stream_id=stream_id
            )
    
    except FileNotFoundError as e:
        logger.error(f"Video file not found: {e}")
        return StreamingUploadResponse(
            success=False,
            error="Video file not found or could not be processed"
        )
    except PermissionError as e:
        logger.error(f"Permission error: {e}")
        return StreamingUploadResponse(
            success=False,
            error="Permission denied while processing video file"
        )
    except Exception as e:
        logger.error(f"Unexpected error during upload: {e}")
        return StreamingUploadResponse(
            success=False,
            error=f"Unexpected error: {str(e)}"
        )


@router.get("/stream-ascii/{stream_id}")
async def stream_ascii_frames(stream_id: str):
    """Stream ASCII frames for a given stream ID"""
    
    logger.info(f"Starting ASCII stream for ID: {stream_id}")
    config = get_config()
    
    # Find the temporary video file
    temp_dir = Path(tempfile.gettempdir())
    video_files = list(temp_dir.glob(f"{stream_id}_*"))
    
    if not video_files:
        logger.error(f"No video file found for stream ID: {stream_id}")
        raise HTTPException(
            status_code=404,
            detail=f"Stream ID {stream_id} not found. Upload video first."
        )
    
    video_path = video_files[0]
    
    if not video_path.exists():
        logger.error(f"Video file does not exist: {video_path}")
        raise HTTPException(
            status_code=404,
            detail="Video file no longer exists"
        )
    
    try:
        def generate_ascii_stream():
            """Generator function for ASCII frames"""
            frame_count = 0
            
            try:
                # Stream ASCII frames
                for ascii_frame in stream_ascii_from_video(
                    video_path,
                    width=config.ascii_width,
                    fps=config.default_fps,
                    ascii_chars=config.ascii_chars
                ):
                    frame_count += 1
                    
                    # Send frame with frame separator
                    yield f"FRAME:{frame_count}\n{ascii_frame}\nEND_FRAME\n\n"
                
                # Send completion message
                yield f"COMPLETE:{frame_count}\nStream completed successfully\nEND_STREAM\n\n"
                
                logger.info(f"Completed streaming {frame_count} frames for {stream_id}")
                
            except Exception as e:
                logger.error(f"Error during streaming: {e}")
                yield f"ERROR:0\n{str(e)}\nEND_ERROR\n\n"
            
            finally:
                # Clean up video file after streaming
                try:
                    if video_path.exists():
                        os.unlink(video_path)
                        logger.info(f"Cleaned up video file: {video_path}")
                except Exception as cleanup_error:
                    logger.warning(f"Failed to cleanup {video_path}: {cleanup_error}")
        
        return StreamingResponse(
            generate_ascii_stream(),
            media_type="text/plain",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"  # Disable nginx buffering
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to start streaming for {stream_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to start streaming: {str(e)}"
        )


@router.get("/stream-status/{stream_id}")
async def get_stream_status(stream_id: str):
    """Check if a stream ID exists and is ready"""
    
    temp_dir = Path(tempfile.gettempdir())
    video_files = list(temp_dir.glob(f"{stream_id}_*"))
    
    if not video_files:
        return {
            "stream_id": stream_id,
            "status": "not_found",
            "ready": False
        }
    
    video_path = video_files[0]
    
    return {
        "stream_id": stream_id,
        "status": "ready",
        "ready": True,
        "file_size": video_path.stat().st_size,
        "filename": video_path.name
    }