# 📁 Ghostnet Project Structure

Complete file tree and component descriptions.

```
ghostnet/
│
├── README.md                    # Main documentation
├── QUICKSTART.md               # Quick start guide
├── LICENSE                     # MIT License
├── PROJECT_STRUCTURE.md        # This file
│
├── backend/                    # Python FastAPI Backend
│   ├── main.py                # FastAPI app entry point
│   ├── requirements.txt       # Python dependencies
│   ├── env.example           # Environment variables template
│   ├── .gitignore            # Git ignore rules
│   │
│   ├── routers/              # API Route Handlers
│   │   ├── __init__.py
│   │   ├── analyze_text.py   # Text emotion analysis endpoint
│   │   ├── analyze_voice.py  # Voice emotion analysis endpoint
│   │   ├── analyze_face.py   # Facial emotion analysis endpoint
│   │   └── predict_mood.py   # Mood prediction & fusion endpoints
│   │
│   ├── models/               # AI Model Implementations
│   │   ├── __init__.py
│   │   ├── text_model.py     # Text emotion recognition (DistilBERT)
│   │   ├── voice_model.py    # Speech emotion recognition (SpeechBrain)
│   │   ├── face_model.py     # Facial expression recognition (DeepFace)
│   │   └── fusion_model.py   # Multimodal fusion + LSTM temporal model
│   │
│   ├── utils/                # Utility Functions
│   │   ├── __init__.py
│   │   ├── preprocess.py     # Data preprocessing utilities
│   │   └── visualization.py  # Data formatting for visualizations
│   │
│   └── database/             # Database Operations
│       ├── __init__.py
│       └── mongo_connection.py  # MongoDB async operations
│
└── frontend/                 # React + Vite Frontend
    ├── package.json          # Node.js dependencies
    ├── vite.config.js        # Vite configuration
    ├── tailwind.config.js    # Tailwind CSS configuration
    ├── postcss.config.js     # PostCSS configuration
    ├── index.html            # HTML entry point
    ├── env.example          # Environment variables template
    ├── .gitignore           # Git ignore rules
    │
    └── src/                  # Source Code
        ├── main.jsx          # React entry point
        ├── App.jsx           # Main app component with routing
        ├── App.css           # App-specific styles
        ├── index.css         # Global styles (Tailwind)
        │
        ├── components/       # Reusable React Components
        │   ├── MoodDNA.jsx          # Mood DNA timeline visualization
        │   ├── EmotionStats.jsx     # Stats cards & burnout gauge
        │   ├── ChatTwin.jsx         # AI Emotional Twin chatbot
        │   └── DailyInputForm.jsx   # Multi-modal emotion input form
        │
        ├── pages/            # Page Components
        │   ├── Dashboard.jsx # Main dashboard with all features
        │   └── Login.jsx     # Login/signup page
        │
        └── utils/            # Frontend Utilities
            └── api.js        # API client functions
```

---

## 🔑 Key Files Explained

### Backend Core

**main.py**
- FastAPI application initialization
- CORS middleware configuration
- Router registration
- Health check endpoints

**routers/analyze_text.py**
- POST `/analyze_text` - Text emotion analysis
- POST `/analyze_journal` - Journal-specific analysis
- Uses transformer-based sentiment analysis

**routers/analyze_voice.py**
- POST `/analyze_voice` - Audio file emotion recognition
- POST `/analyze_voice_realtime` - Streaming audio analysis
- Extracts audio features (pitch, energy, MFCCs)

**routers/analyze_face.py**
- POST `/analyze_face` - Image-based facial emotion recognition
- POST `/analyze_face_video` - Video frame analysis
- Detects micro-expressions and facial landmarks

**routers/predict_mood.py**
- POST `/fuse_emotions` - Multimodal emotion fusion
- GET `/get_mood_dna/{user_id}` - Retrieve emotional timeline
- GET `/predict_future_state` - LSTM-based prediction
- POST `/recommendations` - Personalized suggestions

**models/fusion_model.py**
- Weighted multimodal fusion algorithm
- LSTM temporal sequence modeling
- Burnout risk calculation
- Energy pattern extraction
- Recommendation engine

**database/mongo_connection.py**
- Async MongoDB operations
- CRUD for emotion records
- Mood DNA storage and retrieval
- User management

### Frontend Core

**App.jsx**
- React Router setup
- Authentication state management
- Route protection

**pages/Dashboard.jsx**
- Main dashboard with tabbed interface
- Data fetching and state management
- Integration of all components

**components/MoodDNA.jsx**
- Recharts line chart for timeline
- Emotion distribution bars
- Color-coded emotion pills
- Animated transitions

**components/EmotionStats.jsx**
- Burnout risk gauge visualization
- Statistics cards (total entries, diversity)
- Energy pattern by time of day
- Quick insights

**components/ChatTwin.jsx**
- Real-time chat interface
- Mock AI responses based on patterns
- Message history with timestamps
- Typing indicators

**components/DailyInputForm.jsx**
- Tabbed interface (Text/Voice/Camera)
- Text analysis with live results
- Placeholders for voice/camera features
- Success/error notifications

---

## 🎨 Design System

### Colors
```javascript
// Emotion Colors
joy: '#FFD700'      // Gold
sadness: '#4169E1'  // Royal Blue
anger: '#DC143C'    // Crimson
fear: '#9370DB'     // Medium Purple
surprise: '#FF69B4' // Hot Pink
neutral: '#A9A9A9'  // Dark Gray
love: '#FF1493'     // Deep Pink

// Brand Colors
ghost-purple: '#9370DB'
ghost-blue: '#4169E1'
ghost-pink: '#FF1493'
ghost-gold: '#FFD700'
```

### Components
- Glass-morphism effect for cards
- Gradient backgrounds
- Smooth animations with Framer Motion
- Responsive grid layouts

---

## 🔄 Data Flow

```
User Input (Text/Voice/Face)
         ↓
Frontend Component (DailyInputForm)
         ↓
API Call (axios)
         ↓
Backend Router (analyze_*)
         ↓
AI Model (text/voice/face_model)
         ↓
Database Save (mongo_connection)
         ↓
Response to Frontend
         ↓
Update Dashboard (MoodDNA, Stats)
```

---

## 📊 State Management

### Backend
- In-memory mock database (development)
- MongoDB with motor (production)
- No session state (stateless API)

### Frontend
- React useState for local state
- Props drilling for component communication
- Axios for API calls
- No global state manager (can add Redux/Zustand)

---

## 🚀 Build & Deploy

### Development
```bash
# Backend
cd backend && python main.py

# Frontend
cd frontend && npm run dev
```

### Production Build
```bash
# Backend (Docker)
docker build -t ghostnet-backend ./backend

# Frontend
cd frontend && npm run build
```

### Deployment Targets
- **Backend**: Google Cloud Run, AWS Lambda, Railway
- **Frontend**: Vercel, Netlify, Cloudflare Pages
- **Database**: MongoDB Atlas

---

## 📦 Dependencies Summary

### Backend (Python)
- fastapi, uvicorn - Web framework
- transformers, torch - AI models
- motor, pymongo - Database
- numpy, scipy - Math operations

### Frontend (Node.js)
- react, react-dom - UI framework
- react-router-dom - Routing
- axios - HTTP client
- recharts - Data visualization
- framer-motion - Animations
- tailwindcss - Styling
- lucide-react - Icons

---

## 🔐 Security Considerations

1. **API Authentication**: JWT tokens (placeholder)
2. **Data Encryption**: MongoDB encryption at rest
3. **CORS**: Restricted to specific origins
4. **Input Validation**: Pydantic models in FastAPI
5. **Rate Limiting**: Can add with slowapi
6. **Environment Variables**: Sensitive config in .env

---

## 🧪 Testing Strategy

### Backend Tests
- Unit tests for models
- Integration tests for routers
- Mock database for testing

### Frontend Tests
- Component tests with React Testing Library
- E2E tests with Playwright/Cypress
- Visual regression tests

---

## 📈 Performance

### Backend Optimizations
- Async database operations
- Model caching in memory
- Batch processing for predictions

### Frontend Optimizations
- Code splitting with Vite
- Lazy loading of components
- Memoization of expensive computations
- Recharts for efficient rendering

---

## 🎯 Future Enhancements

1. **Real-time Features**: WebSocket for live updates
2. **Advanced ML**: Fine-tuned models on user data
3. **Mobile App**: React Native version
4. **Wearable Integration**: Heart rate, sleep data
5. **Social Features**: Anonymous emotion sharing
6. **Analytics Dashboard**: Admin panel for insights

---

This structure provides a clean separation of concerns, scalability, and maintainability. Each component has a single responsibility and can be developed/tested independently.









