"""
Ghostnet Backend API
Main FastAPI application entry point for emotional analysis system
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import analyze_text, analyze_voice, analyze_face, predict_mood, websocket, view_data
import uvicorn

# Initialize FastAPI app
app = FastAPI(
    title="Ghostnet API",
    description="AI-powered emotional mirror that understands your emotions better than you do",
    version="1.0.0"
)

# CORS configuration for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(analyze_text.router, prefix="/api/v1", tags=["Text Analysis"])
app.include_router(analyze_voice.router, prefix="/api/v1", tags=["Voice Analysis"])
app.include_router(analyze_face.router, prefix="/api/v1", tags=["Face Analysis"])
app.include_router(predict_mood.router, prefix="/api/v1", tags=["Mood Prediction"])
app.include_router(view_data.router, prefix="/api/v1", tags=["Data Viewer"])
app.include_router(websocket.router, tags=["WebSocket"])


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "message": "Ghostnet API is running",
        "version": "1.0.0"
    }


@app.get("/api/v1/health")
async def health_check():
    """Detailed health check"""
    return {
        "api": "healthy",
        "models": {
            "text": "loaded",
            "voice": "loaded",
            "face": "loaded"
        }
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )


