"""
Text Analysis Router
Handles text-based emotion recognition using transformer models
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime
from models.text_model import TextEmotionModel
from database.mongo_connection import save_emotion_data
from routers.websocket import notify_emotion_logged

router = APIRouter()
text_model = TextEmotionModel()


class TextAnalysisRequest(BaseModel):
    text: str
    user_id: str
    metadata: Optional[Dict] = {}


class TextAnalysisResponse(BaseModel):
    emotion: str
    confidence: float
    all_scores: Dict[str, float]
    sentiment: str
    timestamp: str
    user_id: str


@router.post("/analyze_text", response_model=TextAnalysisResponse)
async def analyze_text(request: TextAnalysisRequest):
    """
    Analyzes text input for emotional content
    
    Returns:
        - Dominant emotion
        - Confidence score
        - All emotion probabilities
        - Sentiment (positive/negative/neutral)
    """
    try:
        if not request.text or len(request.text.strip()) < 3:
            raise HTTPException(status_code=400, detail="Text too short for analysis")
        
        # Run emotion detection
        result = text_model.predict_emotion(request.text)
        
        # Save to database
        emotion_data = {
            "user_id": request.user_id,
            "timestamp": datetime.utcnow().isoformat(),
            "modality": "text",
            "text_content": request.text,
            "emotion": result["emotion"],
            "confidence": result["confidence"],
            "all_scores": result["all_scores"],
            "sentiment": result["sentiment"],
            "metadata": request.metadata
        }
        await save_emotion_data(emotion_data)
        
        # Notify via WebSocket for real-time updates
        try:
            await notify_emotion_logged(request.user_id, {
                "emotion": result["emotion"],
                "confidence": result["confidence"],
                "timestamp": emotion_data["timestamp"]
            })
        except Exception as ws_error:
            print(f"WebSocket notification failed: {ws_error}")
        
        return TextAnalysisResponse(
            emotion=result["emotion"],
            confidence=result["confidence"],
            all_scores=result["all_scores"],
            sentiment=result["sentiment"],
            timestamp=emotion_data["timestamp"],
            user_id=request.user_id
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text analysis failed: {str(e)}")


@router.post("/analyze_journal")
async def analyze_journal(request: TextAnalysisRequest):
    """
    Specialized endpoint for daily journal entries
    Provides deeper insight extraction
    """
    try:
        result = text_model.predict_emotion(request.text)
        keywords = text_model.extract_keywords(request.text)
        
        return {
            "emotion": result["emotion"],
            "confidence": result["confidence"],
            "keywords": keywords,
            "word_count": len(request.text.split()),
            "sentiment": result["sentiment"],
            "insight": text_model.generate_insight(result["emotion"], result["all_scores"])
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Journal analysis failed: {str(e)}")


