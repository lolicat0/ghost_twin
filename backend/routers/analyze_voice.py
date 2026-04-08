"""
Voice Analysis Router
Handles speech emotion recognition from audio input
"""
from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime
import io
from models.voice_model import VoiceEmotionModel
from database.mongo_connection import save_emotion_data

router = APIRouter()
voice_model = VoiceEmotionModel()


class VoiceAnalysisResponse(BaseModel):
    emotion: str
    confidence: float
    all_scores: Dict[str, float]
    audio_features: Dict
    timestamp: str
    user_id: str


@router.post("/analyze_voice", response_model=VoiceAnalysisResponse)
async def analyze_voice(
    audio: UploadFile = File(...),
    user_id: str = Form(...)
):
    """
    Analyzes voice/audio input for emotional content
    
    Accepts: WAV, MP3, OGG audio files
    
    Returns:
        - Dominant emotion
        - Confidence score
        - All emotion probabilities
        - Audio features (pitch, energy, tempo)
    """
    try:
        # Validate audio file
        if not audio.content_type.startswith('audio/'):
            raise HTTPException(status_code=400, detail="File must be an audio file")
        
        # Read audio data
        audio_bytes = await audio.read()
        
        # Run voice emotion recognition
        result = voice_model.predict_emotion(audio_bytes)
        
        # Save to database
        emotion_data = {
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat(),
            "modality": "voice",
            "emotion": result["emotion"],
            "confidence": result["confidence"],
            "all_scores": result["all_scores"],
            "audio_features": result["audio_features"]
        }
        await save_emotion_data(emotion_data)
        
        return VoiceAnalysisResponse(
            emotion=result["emotion"],
            confidence=result["confidence"],
            all_scores=result["all_scores"],
            audio_features=result["audio_features"],
            timestamp=emotion_data["timestamp"],
            user_id=user_id
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voice analysis failed: {str(e)}")


@router.post("/analyze_voice_realtime")
async def analyze_voice_realtime(
    audio_chunk: UploadFile = File(...),
    user_id: str = Form(...)
):
    """
    Real-time voice emotion analysis for streaming audio
    Optimized for low latency
    """
    try:
        audio_bytes = await audio_chunk.read()
        result = voice_model.predict_emotion_fast(audio_bytes)
        
        return {
            "emotion": result["emotion"],
            "confidence": result["confidence"],
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Real-time analysis failed: {str(e)}")


