import os
import tempfile
import uuid
import json
import mimetypes
import logging
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel
from PIL import Image

from utils.ascii_converter import AsciiConverter
from utils.config import get_config


router = APIRouter()
logger = logging.getLogger(__name__)


def get_safe_extension(filename: Optional[str], content_type: str) -> str:
    """Get safe file extension from content type or filename"""
    # First try to get extension from content type
    extension = mimetypes.guess_extension(content_type)
    if extension:
        return extension
    
    # Fallback to filename extension if valid
    if filename and '.' in filename:
        ext = '.' + filename.split('.')[-1].lower()
        # Only allow known safe extensions
        allowed_extensions = {
            '.mp4', '.mov', '.avi', '.webm',  # Video
            '.jpg', '.jpeg', '.png', '.gif', '.webp'  # Images
        }
        if ext in allowed_extensions:
            return ext
    
    # Default fallback based on content type
    if content_type.startswith('video/'):
        return '.mp4'
    elif content_type.startswith('image/'):
        return '.png'
    else:
        return '.tmp'


class UploadResponse(BaseModel):
    success: bool
    frames: List[str] = []
    ascii_art: Optional[str] = None
    snippet: str = ""
    error: str = ""
    file_type: str = ""


@router.post("/upload", response_model=UploadResponse)
async def upload_video(video: UploadFile = File(...)):
    """Upload and convert video to ASCII animation"""
    
    logger.info(f"Video upload started: {video.filename}, size: {video.size}, type: {video.content_type}")
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
        with tempfile.NamedTemporaryFile(
            delete=False, 
            suffix=extension
        ) as temp_file:
            # Save uploaded video
            content = await video.read()
            temp_file.write(content)
            temp_file.flush()
            
            video_path = Path(temp_file.name)
            
            # Convert video to ASCII using dynamic config
            converter = AsciiConverter(
                width=config.ascii_width, 
                fps=config.default_fps,
                ascii_chars=config.ascii_chars
            )
            ascii_frames = converter.video_to_ascii_frames(video_path)
            
            # Generate embeddable snippet with configured colors
            snippet = converter.generate_html_snippet(
                ascii_frames,
                background_color=config.background_color,
                text_color=config.text_color
            )
            
            return UploadResponse(
                success=True,
                frames=ascii_frames,
                snippet=snippet,
                file_type="video"
            )
    
    except FileNotFoundError as e:
        return UploadResponse(
            success=False,
            error="Video file not found or could not be processed",
            file_type="video"
        )
    except RuntimeError as e:
        # AsciiConverter raises RuntimeError for ffmpeg issues
        return UploadResponse(
            success=False,
            error=f"Video processing failed: {str(e)}",
            file_type="video"
        )
    except PermissionError as e:
        return UploadResponse(
            success=False,
            error="Permission denied while processing video file",
            file_type="video"
        )
    except Exception as e:
        return UploadResponse(
            success=False,
            error=f"Unexpected error: {str(e)}",
            file_type="video"
        )
    
    finally:
        # Clean up temporary file
        if video_path is not None:
            try:
                if video_path.exists():
                    os.unlink(video_path)
            except Exception:
                pass  # Best effort cleanup


@router.post("/upload-image", response_model=UploadResponse)
async def upload_image(image: UploadFile = File(...)):
    """Upload and convert image to ASCII art"""
    
    config = get_config()
    
    # Validate file type
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400, 
            detail="File must be an image (JPG, PNG, GIF, WebP)"
        )
    
    # Get safe file extension
    extension = get_safe_extension(image.filename, image.content_type)
    
    # Check file size using dynamic config
    if image.size and image.size > config.image_max_size:
        limit_mb = config.get_image_limit_mb()
        raise HTTPException(
            status_code=400,
            detail=f"Image size must be less than {limit_mb:.0f}MB"
        )
    
    # Initialize temp file path for cleanup
    image_path: Optional[Path] = None
    
    try:
        with tempfile.NamedTemporaryFile(
            delete=False, 
            suffix=extension
        ) as temp_file:
            # Save uploaded image
            content = await image.read()
            temp_file.write(content)
            temp_file.flush()
            
            image_path = Path(temp_file.name)
            
            # Convert image to ASCII using dynamic config
            converter = AsciiConverter(
                width=config.ascii_width, 
                fps=config.default_fps,
                ascii_chars=config.ascii_chars
            )
            ascii_art = converter.image_to_ascii(image_path)
            
            # Generate embeddable snippet for static image with configured colors
            snippet = generate_image_snippet(
                ascii_art,
                background_color=config.background_color,
                text_color=config.text_color
            )
            
            return UploadResponse(
                success=True,
                ascii_art=ascii_art,
                snippet=snippet,
                file_type="image"
            )
    
    except FileNotFoundError as e:
        return UploadResponse(
            success=False,
            error="Image file not found or could not be processed",
            file_type="image"
        )
    except Image.UnidentifiedImageError as e:
        return UploadResponse(
            success=False,
            error="Invalid or corrupted image file",
            file_type="image"
        )
    except PermissionError as e:
        return UploadResponse(
            success=False,
            error="Permission denied while processing image file",
            file_type="image"
        )
    except Exception as e:
        return UploadResponse(
            success=False,
            error=f"Unexpected error: {str(e)}",
            file_type="image"
        )
    
    finally:
        # Clean up temporary file
        if image_path is not None:
            try:
                if image_path.exists():
                    os.unlink(image_path)
            except Exception:
                pass  # Best effort cleanup


def generate_image_snippet(ascii_art: str, background_color: str = None, text_color: str = None) -> str:
    """Generate embeddable HTML snippet for static ASCII art"""
    container_id = f"ascii-image-{uuid.uuid4().hex[:8]}"
    
    # Get colors from config if not provided
    if background_color is None or text_color is None:
        config = get_config()
        background_color = background_color or config.background_color
        text_color = text_color or config.text_color
    
    # Safely encode ASCII art as JSON
    ascii_json = json.dumps(ascii_art)
    
    return f'''<div id="{container_id}"></div>
<script>
  document.getElementById("{container_id}").textContent = {ascii_json};
</script>
<style>
  #{container_id} {{
    font-family: 'Courier New', 'Monaco', 'Consolas', monospace;
    white-space: pre;
    line-height: 1;
    background: {background_color};
    color: {text_color};
    padding: 1rem;
    border-radius: 0.5rem;
    overflow: auto;
    font-size: 12px;
  }}
</style>'''