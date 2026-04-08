# API Documentation for Voice & Camera Features

## Overview
This document describes the APIs used for voice recording and camera capture in the Ghostnet application.

---

## Voice Recording API

### Browser APIs Used:
1. **`navigator.mediaDevices.getUserMedia()`**
   - **Purpose**: Request access to the device microphone
   - **Parameters**: 
     ```javascript
     {
       audio: {
         echoCancellation: true,
         noiseSuppression: true,
         sampleRate: 44100
       }
     }
     ```
   - **Returns**: Promise that resolves to a MediaStream object
   - **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge)

2. **`MediaRecorder API`**
   - **Purpose**: Record audio from the MediaStream
   - **Constructor**: `new MediaRecorder(stream, options)`
   - **Options**:
     ```javascript
     {
       mimeType: 'audio/webm;codecs=opus'
     }
     ```
   - **Methods**:
     - `start()` - Begin recording
     - `stop()` - Stop recording
     - `ondataavailable` - Event handler for audio chunks
   - **Browser Support**: All modern browsers

### Backend API Endpoint:
```
POST /api/v1/analyze_voice
```

**Request Format:**
- Content-Type: `multipart/form-data`
- Body:
  - `audio`: Audio file (Blob/File) - accepts .webm, .wav, .mp3, .ogg
  - `user_id`: String - User identifier

**Response Format:**
```json
{
  "emotion": "joy",
  "confidence": 0.85,
  "all_scores": {
    "joy": 0.85,
    "sadness": 0.05,
    "anger": 0.03,
    "neutral": 0.07
  },
  "audio_features": {
    "pitch": 220.5,
    "energy": 0.75,
    "tempo": 120
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "user_id": "demo_user_001"
}
```

### Usage Flow:
1. User clicks "Start Recording"
2. Browser requests microphone permission via `getUserMedia()`
3. `MediaRecorder` captures audio stream
4. User clicks "Stop Recording"
5. Audio chunks are combined into a Blob
6. Blob is sent to backend as FormData
7. Backend analyzes emotion and returns result

---

## Camera Capture API

### Browser APIs Used:
1. **`navigator.mediaDevices.getUserMedia()`**
   - **Purpose**: Request access to the device camera
   - **Parameters**:
     ```javascript
     {
       video: {
         width: { ideal: 1280 },
         height: { ideal: 720 },
         facingMode: 'user' // Front-facing camera
       }
     }
     ```
   - **Returns**: Promise that resolves to a MediaStream object
   - **Browser Support**: Modern browsers (requires HTTPS in production)

2. **`HTMLVideoElement`**
   - **Purpose**: Display camera feed
   - **Attributes**:
     - `autoPlay` - Start playing immediately
     - `playsInline` - Prevent fullscreen on mobile
     - `muted` - Mute audio to avoid feedback

3. **`HTMLCanvasElement`**
   - **Purpose**: Capture frame from video stream
   - **Methods**:
     - `drawImage(video, x, y, width, height)` - Draw video frame to canvas
     - `toBlob(callback, type, quality)` - Convert canvas to image blob

### Backend API Endpoint:
```
POST /api/v1/analyze_face
```

**Request Format:**
- Content-Type: `multipart/form-data`
- Body:
  - `image`: Image file (Blob/File) - accepts .jpg, .png, .webp
  - `user_id`: String - User identifier

**Response Format:**
```json
{
  "emotion": "neutral",
  "confidence": 0.92,
  "all_scores": {
    "joy": 0.15,
    "sadness": 0.05,
    "anger": 0.02,
    "neutral": 0.92,
    "surprise": 0.03
  },
  "face_detected": true,
  "micro_expressions": ["eyebrow_raise", "lip_tighten"],
  "facial_landmarks": {
    "left_eye": [x, y],
    "right_eye": [x, y],
    "nose": [x, y],
    "mouth": [x, y]
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "user_id": "demo_user_001"
}
```

### Usage Flow:
1. User clicks "Open Camera"
2. Browser requests camera permission via `getUserMedia()`
3. Video stream is displayed in `<video>` element
4. User positions face and clicks "Capture & Analyze"
5. Canvas captures current video frame
6. Canvas is converted to JPEG Blob
7. Blob is sent to backend as FormData
8. Backend analyzes facial expression and returns result
9. Camera stream is stopped

---

## Browser Compatibility

### Voice Recording:
| Browser | getUserMedia | MediaRecorder | WebM Support |
|---------|--------------|---------------|--------------|
| Chrome 47+ | ✅ | ✅ | ✅ |
| Firefox 25+ | ✅ | ✅ | ✅ |
| Safari 11+ | ✅ | ✅ | ⚠️ (may use WAV) |
| Edge 79+ | ✅ | ✅ | ✅ |

### Camera Capture:
| Browser | getUserMedia | Canvas API | JPEG Export |
|---------|--------------|------------|-------------|
| Chrome 47+ | ✅ | ✅ | ✅ |
| Firefox 25+ | ✅ | ✅ | ✅ |
| Safari 11+ | ✅ | ✅ | ✅ |
| Edge 79+ | ✅ | ✅ | ✅ |

---

## Security & Privacy Considerations

1. **HTTPS Required**: Both APIs require HTTPS in production (except localhost)
2. **User Permission**: Explicit user consent required before accessing microphone/camera
3. **Data Handling**: 
   - Audio/video streams stay in browser until user explicitly captures
   - Only captured frames/blobs are sent to backend
   - No continuous streaming or storage without user action
4. **Permissions**: 
   - Users can revoke permissions in browser settings
   - App should gracefully handle permission denial

---

## Error Handling

### Common Errors:
1. **Permission Denied**: User denied microphone/camera access
   - Solution: Show friendly message explaining why permission is needed
2. **No Device Found**: No microphone/camera available
   - Solution: Detect and show appropriate message
3. **Browser Not Supported**: Old browser without API support
   - Solution: Show browser upgrade message

### Implementation Example:
```javascript
try {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
} catch (error) {
  if (error.name === 'NotAllowedError') {
    // Permission denied
  } else if (error.name === 'NotFoundError') {
    // No device found
  } else if (error.name === 'NotSupportedError') {
    // Browser not supported
  }
}
```

---

## Backend Processing

The backend endpoints (`/analyze_voice` and `/analyze_face`) use:
- **Voice**: Mock emotion recognition (can be replaced with SpeechBrain, DeepSpeech, etc.)
- **Face**: Mock emotion recognition (can be replaced with DeepFace, MediaPipe, etc.)

Both endpoints:
1. Accept file uploads via multipart/form-data
2. Process the audio/image
3. Return emotion analysis results
4. Save results to database (mock in-memory storage)

---

## Future Enhancements

### Voice:
- Real-time streaming analysis
- Voice activity detection (VAD)
- Speaker identification
- Multi-language support

### Camera:
- Real-time video analysis
- Multiple face detection
- Emotion timeline tracking
- AR overlays for emotion visualization


