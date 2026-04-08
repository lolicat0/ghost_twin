"""
Mood Prediction Router
Handles multimodal fusion, temporal analysis, and predictive features
"""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from models.fusion_model import MultimodalFusionModel
from database.mongo_connection import get_user_emotion_history, save_mood_dna
from utils.visualization import generate_mood_dna_data

router = APIRouter()
fusion_model = MultimodalFusionModel()


class FusionRequest(BaseModel):
    user_id: str
    text_emotion: Optional[Dict] = None
    voice_emotion: Optional[Dict] = None
    face_emotion: Optional[Dict] = None


class FusionResponse(BaseModel):
    fused_emotion: str
    confidence: float
    emotion_vector: List[float]
    modalities_used: List[str]
    timestamp: str


class MoodDNAResponse(BaseModel):
    user_id: str
    date_range: Dict[str, str]
    mood_timeline: List[Dict]
    dominant_emotions: Dict[str, float]
    burnout_index: float
    energy_pattern: List[Dict]


class PredictionResponse(BaseModel):
    predicted_emotion: str
    confidence: float
    prediction_window: str
    risk_factors: List[str]
    recommendations: List[str]


@router.post("/fuse_emotions", response_model=FusionResponse)
async def fuse_emotions(request: FusionRequest):
    """
    Combines multiple emotion inputs into unified emotional state
    Uses weighted fusion of text, voice, and face modalities
    """
    try:
        modalities = []
        emotion_embeddings = {}
        
        if request.text_emotion:
            emotion_embeddings['text'] = request.text_emotion
            modalities.append('text')
        
        if request.voice_emotion:
            emotion_embeddings['voice'] = request.voice_emotion
            modalities.append('voice')
        
        if request.face_emotion:
            emotion_embeddings['face'] = request.face_emotion
            modalities.append('face')
        
        if not modalities:
            raise HTTPException(status_code=400, detail="At least one emotion input required")
        
        # Perform multimodal fusion
        result = fusion_model.fuse(emotion_embeddings)
        
        return FusionResponse(
            fused_emotion=result["fused_emotion"],
            confidence=result["confidence"],
            emotion_vector=result["emotion_vector"],
            modalities_used=modalities,
            timestamp=datetime.utcnow().isoformat()
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Emotion fusion failed: {str(e)}")


@router.get("/get_mood_dna/{user_id}", response_model=MoodDNAResponse)
async def get_mood_dna(
    user_id: str,
    days: int = Query(default=7, ge=1, le=365)
):
    """
    Retrieves user's Mood DNA - emotional fingerprint over time
    
    Returns:
        - Timeline of emotional states
        - Dominant emotions distribution
        - Burnout index
        - Energy patterns (circadian emotional rhythm)
    """
    try:
        # Get emotion history from database
        history = await get_user_emotion_history(user_id, days)
        
        # Return empty data structure if no history instead of 404
        if not history:
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=days)
            return MoodDNAResponse(
                user_id=user_id,
                date_range={
                    "start": start_date.isoformat(),
                    "end": end_date.isoformat()
                },
                mood_timeline=[],
                dominant_emotions={},
                burnout_index=0.0,
                energy_pattern=[]
            )
        
        # Generate Mood DNA visualization data
        mood_dna_data = generate_mood_dna_data(history)
        
        # Calculate burnout index
        burnout_index = fusion_model.calculate_burnout_index(history)
        
        # Extract energy patterns
        energy_pattern = fusion_model.extract_energy_pattern(history)
        
        # Save computed Mood DNA
        await save_mood_dna(user_id, mood_dna_data, burnout_index)
        
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        return MoodDNAResponse(
            user_id=user_id,
            date_range={
                "start": start_date.isoformat(),
                "end": end_date.isoformat()
            },
            mood_timeline=mood_dna_data["timeline"],
            dominant_emotions=mood_dna_data["dominant_emotions"],
            burnout_index=burnout_index,
            energy_pattern=energy_pattern
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Mood DNA generation failed: {str(e)}")


@router.get("/predict_future_state", response_model=PredictionResponse)
async def predict_future_state(
    user_id: str = Query(...),
    hours_ahead: int = Query(default=24, ge=1, le=168)
):
    """
    Predicts future emotional state using LSTM temporal model
    
    Uses historical emotion patterns to forecast next emotional state
    Includes burnout risk detection
    """
    try:
        # Get emotion history
        history = await get_user_emotion_history(user_id, days=14)
        
        if not history or len(history) < 5:
            raise HTTPException(
                status_code=400,
                detail="Insufficient data for prediction (minimum 5 data points required)"
            )
        
        # Run LSTM prediction
        prediction = fusion_model.predict_next_emotion(history, hours_ahead)
        
        # Detect risk factors
        risk_factors = fusion_model.detect_risk_factors(history)
        
        # Generate recommendations
        recommendations = fusion_model.generate_recommendations(
            prediction["predicted_emotion"],
            risk_factors
        )
        
        return PredictionResponse(
            predicted_emotion=prediction["predicted_emotion"],
            confidence=prediction["confidence"],
            prediction_window=f"{hours_ahead} hours",
            risk_factors=risk_factors,
            recommendations=recommendations
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.post("/recommendations")
async def get_recommendations(user_id: str):
    """
    Generates personalized recommendations based on emotional patterns
    
    Includes:
        - Energy balance tips
        - Stress management suggestions
        - Activity recommendations
        - Sleep/diet insights
    """
    try:
        history = await get_user_emotion_history(user_id, days=7)
        
        if not history:
            return {"recommendations": ["Start logging your emotions to get personalized insights!"]}
        
        recommendations = fusion_model.generate_detailed_recommendations(history)
        
        return {
            "user_id": user_id,
            "generated_at": datetime.utcnow().isoformat(),
            "recommendations": recommendations["tips"],
            "insights": recommendations["insights"],
            "suggested_activities": recommendations["activities"]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation generation failed: {str(e)}")


