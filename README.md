# 🎬 Framegeist

**ASCII Video & Image Converter**

A powerful web application that converts videos and images into ASCII art animations. Built with a modern tech stack for performance and scalability.

![Framegeist Demo](https://via.placeholder.com/800x400/000000/00ff00?text=ASCII+Art+Demo)

## ✨ Features

### 🎥 **Video to ASCII Animation**
- Convert MP4, MOV, AVI, WebM videos to ASCII animations
- Real-time streaming for large files
- Configurable FPS (1-60) and width (20-200 characters)
- Interactive player with play/pause controls

### 🖼️ **Image to ASCII Art**
- Support for JPG, PNG, GIF, WebP images
- Instant conversion with live preview
- Zoom functionality for detailed viewing
- Customizable character sets

### ⚙️ **Advanced Configuration**
- **File Size Limits**: Configurable per media type (1MB-500MB)
- **ASCII Settings**: Width, FPS, character mapping
- **Color Themes**: Custom background and text colors
- **Persistent Settings**: Configuration saved between sessions

### 📋 **Embeddable Snippets**
- Self-contained HTML/CSS/JS code
- Copy-paste integration for any website
- Maintains custom styling and colors
- Unique IDs prevent conflicts

### 🚀 **Performance & Scalability**
- **Streaming Processing**: Memory-efficient for large videos
- **Real-time Progress**: See frames convert as they process
- **FFmpeg Integration**: Professional-grade video processing
- **Responsive Design**: Works on desktop and mobile

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **FFmpeg** - Video processing pipeline
- **Pillow** - Image manipulation
- **Pydantic** - Data validation and settings

### Frontend
- **React 18** - UI framework with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Vite** - Fast build tool and dev server

## 📦 Installation

### Prerequisites
- **Python 3.9+**
- **Node.js 18+**
- **FFmpeg** (for video processing)

### Install FFmpeg
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
```

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🚀 Usage

1. **Start Services**:
   - Backend: `http://localhost:8000`
   - Frontend: `http://localhost:3000`

2. **Configure Settings**:
   - Adjust file size limits in the sidebar
   - Customize ASCII width and FPS
   - Set your preferred colors

3. **Convert Media**:
   - Drag & drop videos or images
   - Watch real-time conversion
   - Copy embeddable snippets

## 📁 Project Structure

```
Framegeist/
├── backend/                 # FastAPI backend
│   ├── main.py             # Application entry
│   ├── routers/            # API endpoints
│   │   ├── upload.py       # Media upload & conversion
│   │   ├── streaming.py    # Real-time streaming
│   │   └── config.py       # Configuration management
│   ├── utils/              # Core utilities
│   │   ├── ascii_converter.py      # ASCII conversion logic
│   │   ├── ascii_streaming.py     # Streaming processing
│   │   └── config.py       # Settings persistence
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── Layout.tsx          # Main layout
│   │   │   ├── ConfigSidebar.tsx   # Configuration panel
│   │   │   ├── MainContent.tsx     # Content area
│   │   │   ├── MediaUpload.tsx     # File upload
│   │   │   ├── AsciiPlayer.tsx     # Video player
│   │   │   ├── AsciiImage.tsx      # Image viewer
│   │   │   └── SnippetGenerator.tsx # Code generation
│   │   ├── api/            # API client
│   │   ├── types/          # TypeScript definitions
│   │   └── App.tsx         # Root component
│   └── package.json        # Node dependencies
└── README.md              # This file
```

## 🔧 Configuration

### Environment Variables

**Backend** (optional):
```bash
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### Default Settings
- **Image limit**: 5MB
- **Video limit**: 10MB  
- **ASCII width**: 80 characters
- **Default FPS**: 10
- **Character set**: `@%#*+=-:. `
- **Colors**: Black background (#000000), Green text (#00ff00)

## 🎨 Customization

### ASCII Character Sets
- **Default**: `@%#*+=-:. ` (dark to light)
- **Dense**: `██▓▓▒▒░░  `
- **Minimal**: `#*.`
- **Custom**: Define your own mapping

### Color Themes
- **Classic Terminal**: Black/Green
- **High Contrast**: White/Black  
- **Custom**: Any hex colors via color picker

## 🔗 API Endpoints

### Upload & Conversion
- `POST /upload` - Convert video to ASCII animation
- `POST /upload-image` - Convert image to ASCII art

### Streaming (for large files)
- `POST /stream-upload` - Upload for streaming conversion
- `GET /stream-ascii/{id}` - Real-time ASCII stream
- `GET /stream-status/{id}` - Check stream status

### Configuration
- `GET /config` - Get current settings
- `POST /config` - Update settings
- `POST /config/reset` - Reset to defaults

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **FFmpeg** - Powerful multimedia framework
- **Pillow** - Python Imaging Library
- **FastAPI** - Modern web framework
- **React** - UI library ecosystem

---

**Built with ❤️ by [GsusFC](https://github.com/GsusFC)**

Convert videos to ASCII animations and generate embeddable HTML/JS/CSS snippets.

## Stack
- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** Python FastAPI + FFmpeg + Pillow

## Structure
```
framegeist/
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── api/           # API client
│   │   ├── utils/         # Utility functions
│   │   └── types/         # TypeScript definitions
├── backend/               # FastAPI backend
│   ├── routers/          # API routes
│   ├── utils/            # Backend utilities
│   └── main.py           # FastAPI app
```

## Development

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

## Features
- Video upload with drag & drop
- ASCII conversion with customizable settings
- Embeddable HTML/JS/CSS snippet generation
- Mobile-responsive design