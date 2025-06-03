import io
import subprocess
import logging
import threading
from pathlib import Path
from typing import Generator, Optional
from PIL import Image
from utils.config import get_config

logger = logging.getLogger(__name__)


class PPMFrame:
    """Helper class to parse PPM frames from ffmpeg stream"""
    
    def __init__(self, data: bytes):
        self.data = data
        self.width = 0
        self.height = 0
        self.max_val = 0
        self.pixel_data = b''
        self._parse()
    
    def _parse(self):
        """Parse PPM header and extract dimensions"""
        lines = self.data.split(b'\n')
        if not lines[0].startswith(b'P6'):
            raise ValueError("Not a valid PPM P6 format")
        
        # Find dimensions line (skip comments)
        dim_line = None
        for line in lines[1:]:
            if not line.startswith(b'#'):
                dim_line = line
                break
        
        if dim_line:
            dims = dim_line.decode().split()
            self.width = int(dims[0])
            self.height = int(dims[1])
        
        # Find max value
        for line in lines[2:]:
            if not line.startswith(b'#'):
                self.max_val = int(line.decode().strip())
                break
    
    def to_image(self) -> Image.Image:
        """Convert PPM data to PIL Image"""
        try:
            return Image.open(io.BytesIO(self.data))
        except Exception as e:
            logger.error(f"Failed to convert PPM to Image: {e}")
            raise


class AsciiStreamer:
    """Stream ASCII conversion from video using ffmpeg pipe"""
    
    def __init__(self, width: int = 80, fps: int = 10, ascii_chars: str = None):
        self.width = width
        self.fps = fps
        if ascii_chars is not None:
            self.ascii_chars = ascii_chars
        else:
            config = get_config()
            self.ascii_chars = config.ascii_chars
    
    def stream_ascii_from_ffmpeg(self, video_path: Path) -> Generator[str, None, None]:
        """
        Stream ASCII frames from video using ffmpeg pipe
        
        Yields:
            str: ASCII representation of each frame
        """
        # FFmpeg command to output PPM frames to stdout
        cmd = [
            "ffmpeg",
            "-i", str(video_path),
            "-vf", f"fps={self.fps},scale={self.width}:-1",
            "-f", "image2pipe",
            "-c:v", "ppm",
            "-"
        ]
        
        logger.info(f"Starting ffmpeg streaming for {video_path}")
        
        try:
            # Start ffmpeg process
            process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                bufsize=0
            )

            # Drain stderr in a background thread to avoid deadlocks
            def _log_stderr(pipe):
                for line in iter(pipe.readline, b""):
                    logger.error(f"ffmpeg: {line.decode().rstrip()}")

            stderr_thread = threading.Thread(target=_log_stderr, args=(process.stderr,))
            stderr_thread.daemon = True
            stderr_thread.start()
            
            frame_count = 0
            buffer = b''
            
            while True:
                # Read chunk from ffmpeg
                chunk = process.stdout.read(8192)
                if not chunk:
                    break
                
                buffer += chunk
                
                # Try to extract complete PPM frames
                while True:
                    frame_data, buffer = self._extract_ppm_frame(buffer)
                    if frame_data is None:
                        break
                    
                    try:
                        # Convert frame to ASCII
                        ascii_frame = self._frame_to_ascii(frame_data)
                        frame_count += 1
                        
                        logger.debug(f"Processed frame {frame_count}")
                        yield ascii_frame
                        
                    except Exception as e:
                        logger.warning(f"Failed to process frame {frame_count}: {e}")
                        continue
            
            # Wait for process to complete
            process.wait()
            stderr_thread.join()
            
            if process.returncode != 0:
                logger.error(f"FFmpeg exited with code {process.returncode}")
                raise RuntimeError(f"FFmpeg failed with return code {process.returncode}")
            
            logger.info(f"Successfully streamed {frame_count} frames from {video_path}")
            
        except Exception as e:
            logger.error(f"Streaming failed: {e}")
            # Make sure to terminate ffmpeg process
            if 'process' in locals():
                process.terminate()
            raise
    
    def _extract_ppm_frame(self, buffer: bytes) -> tuple[Optional[bytes], bytes]:
        """
        Extract one complete PPM frame from buffer
        
        Returns:
            tuple: (frame_data, remaining_buffer) or (None, buffer) if incomplete
        """
        if len(buffer) < 10:  # Minimum PPM header size
            return None, buffer
        
        # Look for PPM header
        if not buffer.startswith(b'P6\n'):
            # Try to find next PPM header
            ppm_start = buffer.find(b'P6\n')
            if ppm_start == -1:
                return None, buffer
            buffer = buffer[ppm_start:]
        
        try:
            # Parse header to get frame size
            lines = buffer.split(b'\n', 3)
            if len(lines) < 4:
                return None, buffer
            
            # Skip comments, find dimensions
            dim_line = lines[1]
            if dim_line.startswith(b'#'):
                # Handle comment lines
                for i in range(2, len(lines)):
                    if not lines[i].startswith(b'#'):
                        dim_line = lines[i]
                        break
            
            dims = dim_line.decode().split()
            if len(dims) < 2:
                return None, buffer
                
            width = int(dims[0])
            height = int(dims[1])
            
            # Find maxval (usually 255)
            maxval_line = lines[2] if not lines[2].startswith(b'#') else lines[3]
            maxval = int(maxval_line.decode().strip())
            
            # Calculate total frame size
            header_end = buffer.find(b'\n', buffer.find(maxval_line)) + 1
            pixel_data_size = width * height * 3  # RGB
            total_frame_size = header_end + pixel_data_size
            
            if len(buffer) >= total_frame_size:
                frame_data = buffer[:total_frame_size]
                remaining_buffer = buffer[total_frame_size:]
                return frame_data, remaining_buffer
            else:
                return None, buffer
                
        except (ValueError, IndexError) as e:
            logger.debug(f"PPM parsing error: {e}")
            return None, buffer[1:]  # Skip one byte and try again
    
    def _frame_to_ascii(self, frame_data: bytes) -> str:
        """Convert PPM frame data to ASCII art"""
        try:
            # Convert PPM to PIL Image
            image = Image.open(io.BytesIO(frame_data))
            
            # Convert to grayscale
            image = image.convert("L")
            
            # Calculate height maintaining aspect ratio
            aspect_ratio = image.height / image.width
            height = int(self.width * aspect_ratio * 0.55)  # 0.55 for monospace adjustment
            
            # Resize image
            image = image.resize((self.width, height))
            
            # Convert to ASCII
            ascii_lines = []
            for y in range(height):
                line = ""
                for x in range(self.width):
                    pixel = image.getpixel((x, y))
                    # Map pixel value (0-255) to ASCII character
                    char_index = int(pixel * (len(self.ascii_chars) - 1) / 255)
                    line += self.ascii_chars[char_index]
                ascii_lines.append(line)
            
            return "\n".join(ascii_lines)
            
        except Exception as e:
            logger.error(f"Frame to ASCII conversion failed: {e}")
            raise


def stream_ascii_from_video(video_path: Path, width: int = 80, fps: int = 10, ascii_chars: str = None) -> Generator[str, None, None]:
    """
    Convenience function to stream ASCII from video
    
    Args:
        video_path: Path to video file
        width: ASCII art width in characters
        fps: Frames per second to extract
        ascii_chars: ASCII character palette
        
    Yields:
        str: ASCII frame data
    """
    streamer = AsciiStreamer(width, fps, ascii_chars)
    yield from streamer.stream_ascii_from_ffmpeg(video_path)
