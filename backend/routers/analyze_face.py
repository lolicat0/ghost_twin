"""
Face Analysis Router
Handles facial micro-expression detection and emotion recognition
"""
from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime
from models.face_model import FaceEmotionModel
from database.mongo_connection import save_emotion_data

router = APIRouter()
face_model = FaceEmotionModel()


class FaceAnalysisResponse(BaseModel):
    emotion: str
    confidence: float
    all_scores: Dict[str, float]
    face_detected: bool
    micro_expressions: Optional[List[str]]
    facial_landmarks: Optional[Dict]
    timestamp: str
    user_id: str


@router.post("/analyze_face", response_model=FaceAnalysisResponse)
async def analyze_face(
    image: UploadFile = File(...),
    user_id: str = Form(...)
):
    """
    Analyzes facial expressions for emotional content
    
    Accepts: JPG, PNG, WebP images
    
    Returns:
        - Dominant emotion
        - Confidence score
        - All emotion probabilities
        - Micro-expressions detected
        - Facial landmarks (optional)
    """
    try:
        # Validate image file
        if not image.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read image data
        image_bytes = await image.read()
        
        # Run face emotion recognition
        result = face_model.predict_emotion(image_bytes)
        
        if not result["face_detected"]:
            raise HTTPException(status_code=400, detail="No face detected in image")
        
        # Save to database
        emotion_data = {
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat(),
            "modality": "face",
            "emotion": result["emotion"],
            "confidence": result["confidence"],
            "all_scores": result["all_scores"],
            "micro_expressions": result.get("micro_expressions", [])
        }
        await save_emotion_data(emotion_data)
        
        return FaceAnalysisResponse(
            emotion=result["emotion"],
            confidence=result["confidence"],
            all_scores=result["all_scores"],
            face_detected=result["face_detected"],
            micro_expressions=result.get("micro_expressions"),
            facial_landmarks=result.get("facial_landmarks"),
            timestamp=emotion_data["timestamp"],
            user_id=user_id
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Face analysis failed: {str(e)}")


@router.post("/analyze_face_video")
async def analyze_face_video(
    video_frame: UploadFile = File(...),
    user_id: str = Form(...),
    frame_number: int = Form(...)
):
    """
    Analyzes video frames for continuous emotion tracking
    Used for real-time webcam feed analysis
    """
    try:
        image_bytes = await video_frame.read()
        result = face_model.predict_emotion(image_bytes)
        
        return {
            "emotion": result["emotion"],
            "confidence": result["confidence"],
            "face_detected": result["face_detected"],
            "frame_number": frame_number,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Video frame analysis failed: {str(e)}")


