from typing import Dict, Any
from pydantic import BaseModel
import json
import os
from pathlib import Path


class AppConfig(BaseModel):
    # File size limits (in bytes)
    image_max_size: int = 5 * 1024 * 1024  # 5MB
    video_max_size: int = 10 * 1024 * 1024  # 10MB
    
    # ASCII conversion settings
    ascii_width: int = 80
    default_fps: int = 10
    
    # ASCII character mapping
    ascii_chars: str = "@%#*+=-:. "
    
    # ASCII styling
    background_color: str = "#000000"  # Black background
    text_color: str = "#00ff00"        # Green text (classic terminal look)
    
    def get_image_limit_mb(self) -> float:
        """Get image size limit in MB"""
        return self.image_max_size / (1024 * 1024)
    
    def get_video_limit_mb(self) -> float:
        """Get video size limit in MB"""
        return self.video_max_size / (1024 * 1024)
    
    def set_image_limit_mb(self, mb: float):
        """Set image size limit in MB"""
        self.image_max_size = int(mb * 1024 * 1024)
    
    def set_video_limit_mb(self, mb: float):
        """Set video size limit in MB"""
        self.video_max_size = int(mb * 1024 * 1024)


# Configuration file path
CONFIG_FILE = Path("config.json")

# Global configuration instance
app_config = None


def load_config() -> AppConfig:
    """Load configuration from file or create default"""
    global app_config
    
    if CONFIG_FILE.exists():
        try:
            with open(CONFIG_FILE, 'r') as f:
                config_data = json.load(f)
            app_config = AppConfig(**config_data)
        except (json.JSONDecodeError, TypeError, ValueError) as e:
            print(f"Error loading config: {e}. Using defaults.")
            app_config = AppConfig()
    else:
        app_config = AppConfig()
    
    return app_config


def save_config() -> None:
    """Save current configuration to file"""
    if app_config is not None:
        with open(CONFIG_FILE, 'w') as f:
            json.dump(app_config.model_dump(), f, indent=2)


def get_config() -> AppConfig:
    """Get current application configuration"""
    global app_config
    if app_config is None:
        load_config()
    return app_config


def update_config(new_config: Dict[str, Any]) -> AppConfig:
    """Update application configuration"""
    global app_config
    
    if app_config is None:
        load_config()
    
    # Use Pydantic's model_copy for safe updates
    try:
        app_config = app_config.model_copy(update=new_config)
    except ValueError as e:
        # Handle validation errors gracefully
        raise ValueError(f"Invalid configuration update: {e}")
    
    # Save to file
    save_config()
    
    return app_config


def reset_config() -> AppConfig:
    """Reset configuration to defaults"""
    global app_config
    app_config = AppConfig()
    
    # Save defaults to file
    save_config()
    
    return app_config