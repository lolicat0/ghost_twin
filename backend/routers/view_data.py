"""
Data Viewer Router
Allows viewing stored emotion data for debugging and transparency
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Dict, List
from database.mongo_connection import get_database, get_user_emotion_history, get_mood_dna
from utils.visualization import generate_mood_dna_data
from models.fusion_model import MultimodalFusionModel

router = APIRouter()
fusion_model = MultimodalFusionModel()


@router.get("/view_raw_data/{user_id}")
async def view_raw_data(
    user_id: str,
    days: int = Query(default=30, ge=1, le=365)
):
    """
    View all raw emotion data stored for a user
    
    Returns raw database records for transparency
    """
    try:
        db = await get_database()
        
        # Get all emotions for user
        emotions = await get_user_emotion_history(user_id, days)
        
        # Get computed Mood DNA
        mood_dna = await get_mood_dna(user_id)
        
        return {
            "user_id": user_id,
            "total_records": len(emotions),
            "date_range_days": days,
            "raw_emotions": emotions,
            "computed_mood_dna": mood_dna,
            "database_stats": {
                "total_emotions_in_db": len(db['emotions']),
                "total_users": len(db['users']),
                "total_mood_dna_records": len(db['mood_dna'])
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve data: {str(e)}")


@router.get("/view_data_flow/{user_id}")
async def view_data_flow(user_id: str):
    """
    Shows step-by-step how data flows from storage to Mood DNA to chatbot
    """
    try:
        # Step 1: Get raw emotion data
        emotions = await get_user_emotion_history(user_id, days=7)
        
        if not emotions:
            return {
                "step": "raw_data",
                "message": "No emotion data found. Log some emotions first!",
                "data": []
            }
        
        # Step 2: Show how Mood DNA is generated
        mood_dna_data = generate_mood_dna_data(emotions)
        
        # Step 3: Calculate derived metrics
        burnout_index = fusion_model.calculate_burnout_index(emotions)
        energy_pattern = fusion_model.extract_energy_pattern(emotions)
        
        # Step 4: Show what chatbot can access
        recent_emotions = [e.get('emotion') for e in emotions[-5:]]
        dominant_emotion = max(set(recent_emotions), key=recent_emotions.count) if recent_emotions else 'neutral'
        
        return {
            "data_flow": {
                "step_1_raw_storage": {
                    "description": "Raw emotion records stored in database",
                    "sample_records": emotions[:3],  # Show first 3
                    "total_count": len(emotions),
                    "fields": {
                        "user_id": "Links emotion to user",
                        "timestamp": "When emotion was logged",
                        "emotion": "Detected emotion (joy, sadness, etc.)",
                        "confidence": "AI confidence score (0-1)",
                        "modality": "Source: text, voice, or face",
                        "all_scores": "All emotion probabilities"
                    }
                },
                "step_2_mood_dna_generation": {
                    "description": "Raw data converted to Mood DNA visualization",
                    "process": [
                        "1. Sort emotions by timestamp",
                        "2. Extract timeline data points",
                        "3. Calculate dominant emotion distribution",
                        "4. Assign colors to each emotion",
                        "5. Create timeline visualization data"
                    ],
                    "result": {
                        "timeline_points": len(mood_dna_data['timeline']),
                        "dominant_emotions": mood_dna_data['dominant_emotions'],
                        "emotion_colors": {
                            "joy": "#FFD700",
                            "sadness": "#4169E1",
                            "anger": "#DC143C",
                            "neutral": "#A9A9A9"
                        }
                    }
                },
                "step_3_burnout_calculation": {
                    "description": "Burnout risk calculated from emotional patterns",
                    "formula": "negative_emotion_ratio * 60 + consecutive_negative_streak * 4",
                    "current_index": burnout_index,
                    "risk_level": "high" if burnout_index > 60 else "moderate" if burnout_index > 30 else "low"
                },
                "step_4_energy_pattern": {
                    "description": "Circadian emotional rhythm extracted",
                    "method": "Group emotions by time of day (morning/afternoon/evening/night)",
                    "result": energy_pattern
                },
                "step_5_chatbot_access": {
                    "description": "Chatbot uses this data to provide insights",
                    "data_accessed": {
                        "recent_emotions": recent_emotions,
                        "dominant_emotion": dominant_emotion,
                        "total_entries": len(emotions),
                        "unique_emotions": len(set([e.get('emotion') for e in emotions])),
                        "burnout_index": burnout_index
                    },
                    "chatbot_use_cases": [
                        "Answer 'How am I feeling?' → Uses recent_emotions and dominant_emotion",
                        "Answer 'Am I burned out?' → Uses burnout_index",
                        "Answer 'Predict my mood' → Uses full emotion history for LSTM prediction",
                        "Provide advice → Uses energy_pattern and burnout_index"
                    ]
                }
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate data flow: {str(e)}")


