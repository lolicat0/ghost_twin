# 🔮 Ghostnet — The AI That Understands Your Emotions Better Than You Do

![Ghostnet Banner](https://img.shields.io/badge/Ghostnet-Emotional%20AI-purple?style=for-the-badge&logo=brain)
![Python](https://img.shields.io/badge/Python-3.9+-blue?style=flat-square&logo=python)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=flat-square&logo=fastapi)

An AI-powered emotional mirror that reads your micro-expressions, voice tone, and writing style to map emotional changes over time. Build your unique **Mood DNA Graph** and talk to your **Emotional Twin**.

---

## 🌟 Features

### 🧩 Multimodal Emotion Recognition
- **Text Analysis**: Sentiment and emotion detection from journal entries
- **Voice Analysis**: Speech emotion recognition from audio input
- **Facial Analysis**: Micro-expression detection from images/video

### 🧬 Mood DNA Visualization
- Unique emotional fingerprint graph that evolves daily
- Color-coded timeline of dominant emotions
- Interactive charts showing emotion distribution over time

### 🤖 AI Emotional Twin
- Chatbot trained on your emotional patterns
- Predicts future emotional states using LSTM
- Provides personalized insights and recommendations

### 📊 Predictive Analytics
- Burnout risk detection
- Energy pattern analysis (circadian emotional rhythm)
- Emotional trend forecasting

---

## 🏗️ Architecture

```
Ghostnet/
├── backend/              # Python FastAPI backend
│   ├── main.py          # API entry point
│   ├── routers/         # API endpoints
│   │   ├── analyze_text.py
│   │   ├── analyze_voice.py
│   │   ├── analyze_face.py
│   │   └── predict_mood.py
│   ├── models/          # AI models
│   │   ├── text_model.py
│   │   ├── voice_model.py
│   │   ├── face_model.py
│   │   └── fusion_model.py
│   ├── utils/           # Utilities
│   │   ├── preprocess.py
│   │   └── visualization.py
│   ├── database/        # Database operations
│   │   └── mongo_connection.py
│   └── requirements.txt
│
└── frontend/            # React frontend
    ├── src/
    │   ├── components/  # React components
    │   │   ├── MoodDNA.jsx
    │   │   ├── EmotionStats.jsx
    │   │   ├── ChatTwin.jsx
    │   │   └── DailyInputForm.jsx
    │   ├── pages/       # Page components
    │   │   ├── Dashboard.jsx
    │   │   └── Login.jsx
    │   └── App.jsx
    └── package.json
```

---

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- MongoDB (optional - uses in-memory mock by default)

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment variables
cp .env.example .env

# Run the server
python main.py
```

The backend API will be available at `http://localhost:8000`

📚 **API Documentation**: Visit `http://localhost:8000/docs` for interactive Swagger UI

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

---

## 🎯 Usage

### 1. Login (Demo Mode)
- Visit `http://localhost:5173`
- Enter any email/password to access demo mode

### 2. Log Your Emotions
- **Text**: Write journal entries or daily reflections
- **Voice**: Record audio (coming soon)
- **Camera**: Capture facial expressions (coming soon)

### 3. View Your Mood DNA
- Interactive timeline of your emotional journey
- Emotion distribution charts
- Burnout risk index

### 4. Chat with Your Emotional Twin
- Ask about your emotional patterns
- Get personalized insights
- Receive predictive recommendations

---

## 🧠 AI Models

### Current Implementation (Mock Mode)
The system currently uses intelligent mock models for rapid prototyping and demonstration. These provide realistic emotion analysis without requiring heavy ML dependencies.

### Production Models (Recommended)

To enable actual AI inference, uncomment the following dependencies in `requirements.txt`:

```python
# Text Analysis
transformers==4.35.0
torch==2.1.0

# Voice Analysis
librosa==0.10.1
speechbrain==0.5.16

# Face Analysis
opencv-python==4.8.1
deepface==0.0.79
mediapipe==0.10.7
```

Then update the model loading code in:
- `models/text_model.py` - Use `distilbert-base-uncased-finetuned-sst-2-english`
- `models/voice_model.py` - Use `speechbrain/emotion-recognition-wav2vec2-IEMOCAP`
- `models/face_model.py` - Use `deepface` or `fer` library

---

## 📡 API Endpoints

### Emotion Analysis

#### POST `/api/v1/analyze_text`
Analyze text for emotional content
```json
{
  "text": "I'm feeling great today!",
  "user_id": "user_123",
  "metadata": {}
}
```

#### POST `/api/v1/analyze_voice`
Analyze audio for emotional tone
- **Form Data**: `audio` (file), `user_id` (string)

#### POST `/api/v1/analyze_face`
Analyze facial expressions
- **Form Data**: `image` (file), `user_id` (string)

### Mood DNA & Predictions

#### GET `/api/v1/get_mood_dna/{user_id}?days=7`
Retrieve emotional timeline and Mood DNA

#### GET `/api/v1/predict_future_state?user_id={id}&hours_ahead=24`
Predict future emotional state using LSTM

#### POST `/api/v1/recommendations`
Get personalized recommendations
```json
{
  "user_id": "user_123"
}
```

---

## 🎨 Frontend Components

### MoodDNA.jsx
- Line chart showing emotion timeline
- Emotion distribution bars
- Color-coded emotional journey

### EmotionStats.jsx
- Burnout risk gauge
- Total entries and unique emotions
- Energy pattern by time of day

### ChatTwin.jsx
- Real-time chat interface
- AI responses based on emotional patterns
- Conversational insights

### DailyInputForm.jsx
- Multi-tab input (Text/Voice/Camera)
- Real-time emotion analysis
- Success/error feedback

---

## 🔒 Privacy & Ethics

### Data Privacy
- All emotional data stored with encryption
- Users can delete their data anytime
- No data sharing with third parties

### Optional: On-Device Processing
For maximum privacy, enable on-device inference:
1. Use browser-based models (TensorFlow.js)
2. Local storage instead of cloud database
3. No data leaves the user's device

---

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI
- **AI/ML**: PyTorch, Transformers, SpeechBrain
- **Database**: MongoDB (motor for async)
- **Authentication**: JWT tokens

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **HTTP**: Axios

---

## 📊 Data Models

### Emotion Record
```javascript
{
  "user_id": "string",
  "timestamp": "ISO 8601",
  "modality": "text|voice|face",
  "emotion": "joy|sadness|anger|fear|surprise|neutral|love",
  "confidence": 0.85,
  "all_scores": { "joy": 0.85, "sadness": 0.05, ... },
  "metadata": {}
}
```

### Mood DNA
```javascript
{
  "user_id": "string",
  "date_range": { "start": "date", "end": "date" },
  "mood_timeline": [...],
  "dominant_emotions": { "joy": 0.4, "neutral": 0.3, ... },
  "burnout_index": 25.5,
  "energy_pattern": [...]
}
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm run test
```

---

## 🚢 Deployment

### Backend (Google Cloud Run / AWS Lambda)

```bash
# Build Docker image
docker build -t ghostnet-backend ./backend

# Deploy to Cloud Run
gcloud run deploy ghostnet-api \
  --image ghostnet-backend \
  --platform managed \
  --region us-central1
```

### Frontend (Vercel / Netlify)

```bash
# Build for production
cd frontend
npm run build

# Deploy to Vercel
vercel deploy
```

### Database (MongoDB Atlas)
1. Create a cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Update `MONGODB_URI` in backend `.env`
3. Configure network access and database user

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📋 Roadmap

- [ ] Real-time video emotion tracking
- [ ] Browser-based voice recording
- [ ] Webcam facial analysis
- [ ] Weekly "Mood Wrapped" PDF reports
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Social features (anonymous emotion sharing)
- [ ] Integration with wearables (heart rate, sleep)

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Hugging Face** for transformer models
- **SpeechBrain** for audio emotion recognition
- **DeepFace** for facial analysis
- **Recharts** for beautiful visualizations

---

## 📞 Support

For questions or issues:
- 📧 Email: support@ghostnet.ai (demo)
- 💬 Discord: [Join our community](#)
- 📚 Docs: [Full documentation](#)

---

## ⚠️ Disclaimer

Ghostnet is an experimental emotional AI tool designed for self-reflection and awareness. It should not replace professional mental health support. If you're experiencing severe emotional distress, please consult a licensed mental health professional.

---

<div align="center">

**Built with ❤️ by the Ghostnet Team**

[Website](#) • [Documentation](#) • [Discord](#) • [Twitter](#)

</div>









