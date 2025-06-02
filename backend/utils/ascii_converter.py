import os
import subprocess
import tempfile
import uuid
import json
from pathlib import Path
from typing import List
from PIL import Image
from utils.config import get_config


class AsciiConverter:
    
    def __init__(self, width: int = 80, fps: int = 10, ascii_chars: str = None):
        self.width = width
        self.fps = fps
        # Use provided chars or get from config
        if ascii_chars is not None:
            self.ascii_chars = ascii_chars
        else:
            config = get_config()
            self.ascii_chars = config.ascii_chars
    
    def extract_frames(self, video_path: Path, output_dir: Path) -> List[Path]:
        """Extract frames from video using ffmpeg"""
        frame_pattern = output_dir / "frame_%04d.png"
        
        cmd = [
            "ffmpeg",
            "-i", str(video_path),
            "-vf", f"fps={self.fps},scale={self.width}:-1",
            "-y",  # Overwrite output files
            str(frame_pattern)
        ]
        
        try:
            subprocess.run(cmd, check=True, capture_output=True, text=True)
        except subprocess.CalledProcessError as e:
            raise RuntimeError(f"FFmpeg failed: {e.stderr}")
        
        # Get all extracted frames
        frames = sorted(output_dir.glob("frame_*.png"))
        if not frames:
            raise RuntimeError("No frames were extracted from video")
        
        return frames
    
    def image_to_ascii(self, image_path: Path) -> str:
        """Convert single image to ASCII art"""
        try:
            with Image.open(image_path) as img:
                # Convert to grayscale
                img = img.convert("L")
                
                # Calculate height to maintain aspect ratio
                aspect_ratio = img.height / img.width
                height = int(self.width * aspect_ratio * 0.55)  # 0.55 for char aspect ratio
                
                # Resize image
                img = img.resize((self.width, height))
                
                # Convert pixels to ASCII
                ascii_lines = []
                for y in range(height):
                    line = ""
                    for x in range(self.width):
                        pixel = img.getpixel((x, y))
                        # Map pixel value (0-255) to ASCII character
                        char_index = int(pixel * (len(self.ascii_chars) - 1) / 255)
                        line += self.ascii_chars[char_index]
                    ascii_lines.append(line)
                
                return "\n".join(ascii_lines)
        
        except Exception as e:
            raise RuntimeError(f"Failed to convert image to ASCII: {e}")
    
    def video_to_ascii_frames(self, video_path: Path) -> List[str]:
        """Convert entire video to ASCII animation frames"""
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            
            # Extract frames
            frame_paths = self.extract_frames(video_path, temp_path)
            
            # Convert each frame to ASCII
            ascii_frames = []
            for frame_path in frame_paths:
                ascii_frame = self.image_to_ascii(frame_path)
                ascii_frames.append(ascii_frame)
            
            return ascii_frames
    
    def generate_html_snippet(self, frames: List[str], fps: int = None, background_color: str = None, text_color: str = None) -> str:
        """Generate embeddable HTML/JS/CSS snippet"""
        if fps is None:
            fps = self.fps
        
        # Get colors from config if not provided
        if background_color is None or text_color is None:
            config = get_config()
            background_color = background_color or config.background_color
            text_color = text_color or config.text_color
        
        container_id = f"ascii-animation-{uuid.uuid4().hex[:8]}"
        
        # Safely encode frames as JSON
        frames_json = json.dumps(frames)
        
        return f'''<div id="{container_id}"></div>
<script>
  (function() {{
    const containerId = "{container_id}";
    const frames = {frames_json};
    let frameIndex = 0;
    
    function animate() {{
      const container = document.getElementById(containerId);
      if (container) {{
        container.textContent = frames[frameIndex % frames.length];
        frameIndex++;
      }}
    }}
    
    setInterval(animate, {1000 // fps});
  }})();
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