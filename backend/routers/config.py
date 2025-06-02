from typing import Dict, Any, Optional
import re
from fastapi import APIRouter
from pydantic import BaseModel

from utils.config import get_config, update_config, reset_config, AppConfig


router = APIRouter()


class ConfigUpdateRequest(BaseModel):
    image_max_size: Optional[int] = None
    video_max_size: Optional[int] = None
    ascii_width: Optional[int] = None
    default_fps: Optional[int] = None
    ascii_chars: Optional[str] = None
    background_color: Optional[str] = None
    text_color: Optional[str] = None


class ConfigResponse(BaseModel):
    success: bool
    config: AppConfig
    message: str = ""


@router.get("/config", response_model=ConfigResponse)
async def get_current_config():
    """Get current application configuration"""
    config = get_config()
    return ConfigResponse(
        success=True,
        config=config,
        message="Configuration retrieved successfully"
    )


@router.post("/config", response_model=ConfigResponse)
async def update_app_config(request: ConfigUpdateRequest):
    """Update application configuration"""
    try:
        # Convert request to dict, excluding None values
        update_data = {k: v for k, v in request.model_dump().items() if v is not None}
        
        # Validate limits
        if "image_max_size" in update_data:
            if update_data["image_max_size"] < 1024 * 1024:  # Min 1MB
                return ConfigResponse(
                    success=False,
                    config=get_config(),
                    message="Image size limit must be at least 1MB"
                )
            if update_data["image_max_size"] > 100 * 1024 * 1024:  # Max 100MB
                return ConfigResponse(
                    success=False,
                    config=get_config(),
                    message="Image size limit cannot exceed 100MB"
                )
        
        if "video_max_size" in update_data:
            if update_data["video_max_size"] < 1024 * 1024:  # Min 1MB
                return ConfigResponse(
                    success=False,
                    config=get_config(),
                    message="Video size limit must be at least 1MB"
                )
            if update_data["video_max_size"] > 500 * 1024 * 1024:  # Max 500MB
                return ConfigResponse(
                    success=False,
                    config=get_config(),
                    message="Video size limit cannot exceed 500MB"
                )
        
        if "ascii_width" in update_data:
            if not 20 <= update_data["ascii_width"] <= 200:
                return ConfigResponse(
                    success=False,
                    config=get_config(),
                    message="ASCII width must be between 20 and 200 characters"
                )
        
        if "default_fps" in update_data:
            if not 1 <= update_data["default_fps"] <= 60:
                return ConfigResponse(
                    success=False,
                    config=get_config(),
                    message="FPS must be between 1 and 60"
                )
        
        # Validate colors
        color_pattern = re.compile(r'^#[0-9A-Fa-f]{6}$')
        
        if "background_color" in update_data:
            if not color_pattern.match(update_data["background_color"]):
                return ConfigResponse(
                    success=False,
                    config=get_config(),
                    message="Background color must be a valid hex color (e.g., #000000)"
                )
        
        if "text_color" in update_data:
            if not color_pattern.match(update_data["text_color"]):
                return ConfigResponse(
                    success=False,
                    config=get_config(),
                    message="Text color must be a valid hex color (e.g., #00ff00)"
                )
        
        # Update configuration
        updated_config = update_config(update_data)
        
        return ConfigResponse(
            success=True,
            config=updated_config,
            message="Configuration updated successfully"
        )
    
    except Exception as e:
        return ConfigResponse(
            success=False,
            config=get_config(),
            message=f"Failed to update configuration: {str(e)}"
        )


@router.post("/config/reset", response_model=ConfigResponse)
async def reset_app_config():
    """Reset configuration to defaults"""
    try:
        config = reset_config()
        return ConfigResponse(
            success=True,
            config=config,
            message="Configuration reset to defaults"
        )
    except Exception as e:
        return ConfigResponse(
            success=False,
            config=get_config(),
            message=f"Failed to reset configuration: {str(e)}"
        )