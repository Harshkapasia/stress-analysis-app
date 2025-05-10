# Mood Analysis Project Documentation

## Project Overview
This is a comprehensive mood analysis application that combines facial expression detection and voice mood analysis. The project consists of two main parts:
1. A Next.js frontend application (moodingo)
2. A Django backend application (voice_mood_app)

## Technical Stack

### Frontend (Moodingo)
* **Framework**: Next.js 15.3.1
* **UI Library**: React 18.2.0
* **Styling**: TailwindCSS
* **Key Libraries**:
  - face-api.js (v0.22.2) for facial expression detection
  - framer-motion for animations
  - axios for API calls
  - lucide-react for icons

### Backend (Voice Mood App)
* **Framework**: Django 5.0.1
* **API**: Django REST Framework 3.14.0
* **Key Libraries**:
  - librosa (0.10.1) for audio processing
  - numpy for numerical computations
  - python-dotenv for environment variables
  - django-cors-headers for handling CORS

## Features

### 1. Facial Expression Detection
- Real-time face detection using face-api.js
- Detection of multiple facial expressions:
  * Happy
  * Sad
  * Angry
  * Neutral
  * Surprised
  * Fearful
  * Disgusted
- Uses pre-trained models stored in `/public/models/`

### 2. Voice Mood Analysis
- Voice recording capability
- Audio processing using librosa
- Storage of voice recordings in `/media/voice_recordings/`
- Analysis of voice patterns for mood detection

### 3. User Interface
- Modern, responsive design using TailwindCSS
- Interactive chat interface
- Real-time mood indicators
- Navigation bar with logo
- Hero section for main content
- Footer with additional information

## Project Structure

### Frontend Structure (Moodingo)
```
moodingo/
├── components/           # Reusable React components
│   ├── chat-interface.js
│   ├── FaceDetection.js
│   ├── VoiceDetection.js
│   ├── mood-indicator.js
│   └── [other UI components]
├── pages/               # Next.js pages
│   ├── api/            # API routes
│   ├── _app.js
│   └── index.js
├── public/             # Static files
│   └── models/         # Face detection models
└── styles/            # Global styles
```

### Backend Structure (Voice Mood App)
```
voice_mood_app/
├── voice_analysis/     # Main application
│   ├── models.py       # Database models
│   ├── views.py        # API views
│   ├── urls.py         # URL routing
│   └── serializers.py  # Data serializers
├── media/             # Media storage
│   └── voice_recordings/
└── manage.py         # Django management script
```

## How It Works

1. **Face Detection Process**:
   - Loads pre-trained models from public/models
   - Uses webcam feed to detect faces in real-time
   - Analyzes facial expressions using face-api.js
   - Updates UI with detected emotions

2. **Voice Analysis Process**:
   - Records user's voice through browser
   - Sends recording to Django backend
   - Processes audio using librosa for feature extraction
   - Returns mood analysis results
   - Stores recordings for future reference

3. **Integration**:
   - Combined analysis of both facial and voice data
   - Real-time updates through chat interface
   - Synchronized mood indicators

## Setup Instructions

### Frontend Setup
```bash
cd moodingo
npm install
npm run dev
```

### Backend Setup
```bash
cd voice_mood_app
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## Development Notes
- Uses environment variables for configuration
- CORS enabled for frontend-backend communication
- Supports hot reloading for development
- Includes ESLint configuration for code quality
- TailwindCSS for responsive design

## Performance Considerations
- Face detection models are loaded asynchronously
- Voice recordings are processed in chunks
- Optimized React components with proper state management
- Efficient file storage system for voice recordings

## Security Features
- Protected API endpoints
- Secure file handling
- CORS protection
- Environment variable usage for sensitive data

---

*Note: This project combines modern web technologies with AI capabilities to create an interactive mood analysis system.*
