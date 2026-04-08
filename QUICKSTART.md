# 🚀 Ghostnet Quick Start Guide

Get Ghostnet up and running in 5 minutes!

---

## Step 1: Clone or Navigate to Project

```bash
cd C:\Project\micropro
# You're already here!
```

---

## Step 2: Start the Backend

### Windows

```bash
# Open a terminal in the backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python main.py
```

### macOS/Linux

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python main.py
```

✅ **Backend running at**: `http://localhost:8000`
📚 **API Docs**: `http://localhost:8000/docs`

---

## Step 3: Start the Frontend

Open a **new terminal** (keep backend running):

```bash
cd frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

✅ **Frontend running at**: `http://localhost:5173`

---

## Step 4: Use the App

1. Open your browser to `http://localhost:5173`
2. **Login** with any email/password (demo mode)
3. **Log your emotions** using the text input
4. **View your Mood DNA** on the dashboard
5. **Chat with your Emotional Twin**

---

## 🎯 Quick Test

### Test Text Analysis

```bash
# In a new terminal, test the API directly
curl -X POST "http://localhost:8000/api/v1/analyze_text" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I am feeling wonderful today!",
    "user_id": "test_user"
  }'
```

Or visit `http://localhost:8000/docs` and try the interactive API.

---

## 📝 What to Try

1. **Write a journal entry** - "Today was amazing! I felt so happy and energized."
2. **Check your Mood DNA** - See the emotion timeline visualization
3. **View burnout index** - Check your emotional wellness score
4. **Chat with AI Twin** - Ask "How am I feeling?" or "Will I burn out?"

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Make sure Python 3.9+ is installed
python --version

# Make sure all dependencies installed
pip install -r requirements.txt
```

### Frontend won't start
```bash
# Make sure Node.js 18+ is installed
node --version

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Port already in use
```bash
# Backend (change port in main.py)
uvicorn.run(..., port=8001)  # Use different port

# Frontend (change port in vite.config.js)
server: { port: 5174 }
```

---

## 🎨 Demo Mode Features

The app works out-of-the-box with **mock AI models** that provide realistic emotion analysis without requiring heavy ML dependencies or GPU.

When you're ready for production:
1. Uncomment AI packages in `backend/requirements.txt`
2. Update model loading code in `backend/models/`
3. Set `USE_MOCK_MODELS=False` in backend environment

---

## 📚 Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Explore the [API documentation](http://localhost:8000/docs)
- Check out the architecture and data models
- Set up MongoDB for persistent storage
- Deploy to production (Vercel + Cloud Run)

---

## 🆘 Need Help?

- Check the main README.md
- Review API docs at `/docs` endpoint
- Look at example code in `frontend/src/utils/api.js`

---

**Enjoy building your Mood DNA! 🧬✨**









