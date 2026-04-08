"""
MongoDB Connection and Database Operations
Handles all database interactions for emotion data storage
"""
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import os


# Mock database storage (in-memory)
# In production: Use actual MongoDB with motor (async) or pymongo
MOCK_DATABASE = {
    "users": {},
    "emotions": [],
    "mood_dna": {}
}


async def get_database():
    """
    Get database connection
    In production: Connect to MongoDB Atlas or local instance
    """
    # from motor.motor_asyncio import AsyncIOMotorClient
    # MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    # client = AsyncIOMotorClient(MONGO_URI)
    # db = client.ghostnet
    # return db
    
    return MOCK_DATABASE


async def save_emotion_data(emotion_data: Dict) -> bool:
    """
    Save emotion analysis result to database
    
    Args:
        emotion_data: Dictionary containing emotion analysis results
        
    Returns:
        Success status
    """
    try:
        db = await get_database()
        
        # Add unique ID and created timestamp
        emotion_data['_id'] = f"emo_{len(db['emotions'])}_{datetime.utcnow().timestamp()}"
        emotion_data['created_at'] = datetime.utcnow().isoformat()
        
        # In production: Use async insert
        # result = await db.emotions.insert_one(emotion_data)
        
        # Mock storage
        db['emotions'].append(emotion_data)
        
        return True
    
    except Exception as e:
        print(f"Error saving emotion data: {e}")
        return False


async def get_user_emotion_history(user_id: str, days: int = 7) -> List[Dict]:
    """
    Retrieve emotion history for a user
    
    Args:
        user_id: User identifier
        days: Number of days to retrieve
        
    Returns:
        List of emotion records
    """
    try:
        db = await get_database()
        
        # Calculate cutoff date
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        # In production: Use MongoDB query
        # emotions = await db.emotions.find({
        #     "user_id": user_id,
        #     "timestamp": {"$gte": cutoff_date.isoformat()}
        # }).sort("timestamp", 1).to_list(length=1000)
        
        # Mock retrieval
        emotions = [
            e for e in db['emotions']
            if e.get('user_id') == user_id
        ]
        
        # Filter by date
        filtered_emotions = []
        for e in emotions:
            try:
                timestamp = e.get('timestamp', '')
                dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                if dt >= cutoff_date:
                    filtered_emotions.append(e)
            except:
                continue
        
        # Sort by timestamp
        filtered_emotions.sort(key=lambda x: x.get('timestamp', ''))
        
        return filtered_emotions
    
    except Exception as e:
        print(f"Error retrieving emotion history: {e}")
        return []


async def save_mood_dna(user_id: str, mood_dna_data: Dict, burnout_index: float) -> bool:
    """
    Save computed Mood DNA for a user
    
    Args:
        user_id: User identifier
        mood_dna_data: Computed Mood DNA visualization data
        burnout_index: Calculated burnout risk score
        
    Returns:
        Success status
    """
    try:
        db = await get_database()
        
        mood_dna_record = {
            "user_id": user_id,
            "date": datetime.utcnow().isoformat(),
            "mood_dna": mood_dna_data,
            "burnout_index": burnout_index,
            "generated_at": datetime.utcnow().isoformat()
        }
        
        # In production: Upsert to MongoDB
        # await db.mood_dna.update_one(
        #     {"user_id": user_id, "date": mood_dna_record["date"]},
        #     {"$set": mood_dna_record},
        #     upsert=True
        # )
        
        # Mock storage
        db['mood_dna'][user_id] = mood_dna_record
        
        return True
    
    except Exception as e:
        print(f"Error saving Mood DNA: {e}")
        return False


async def get_mood_dna(user_id: str) -> Optional[Dict]:
    """
    Retrieve latest Mood DNA for a user
    
    Args:
        user_id: User identifier
        
    Returns:
        Mood DNA record or None
    """
    try:
        db = await get_database()
        
        # In production: Query MongoDB
        # mood_dna = await db.mood_dna.find_one(
        #     {"user_id": user_id},
        #     sort=[("generated_at", -1)]
        # )
        
        # Mock retrieval
        return db['mood_dna'].get(user_id)
    
    except Exception as e:
        print(f"Error retrieving Mood DNA: {e}")
        return None


async def create_user(user_data: Dict) -> bool:
    """
    Create a new user account
    
    Args:
        user_data: User information (name, email, preferences)
        
    Returns:
        Success status
    """
    try:
        db = await get_database()
        
        user_data['created_at'] = datetime.utcnow().isoformat()
        user_data['_id'] = user_data.get('user_id', f"user_{datetime.utcnow().timestamp()}")
        
        # In production: Insert to MongoDB
        # await db.users.insert_one(user_data)
        
        # Mock storage
        db['users'][user_data['_id']] = user_data
        
        return True
    
    except Exception as e:
        print(f"Error creating user: {e}")
        return False


async def get_user(user_id: str) -> Optional[Dict]:
    """
    Retrieve user information
    
    Args:
        user_id: User identifier
        
    Returns:
        User data or None
    """
    try:
        db = await get_database()
        
        # In production: Query MongoDB
        # user = await db.users.find_one({"user_id": user_id})
        
        # Mock retrieval
        return db['users'].get(user_id)
    
    except Exception as e:
        print(f"Error retrieving user: {e}")
        return None


async def delete_user_emotions(user_id: str) -> bool:
    """
    Delete all emotion data for a user (privacy feature)
    
    Args:
        user_id: User identifier
        
    Returns:
        Success status
    """
    try:
        db = await get_database()
        
        # In production: Delete from MongoDB
        # await db.emotions.delete_many({"user_id": user_id})
        # await db.mood_dna.delete_many({"user_id": user_id})
        
        # Mock deletion
        db['emotions'] = [e for e in db['emotions'] if e.get('user_id') != user_id]
        if user_id in db['mood_dna']:
            del db['mood_dna'][user_id]
        
        return True
    
    except Exception as e:
        print(f"Error deleting user emotions: {e}")
        return False


async def get_emotion_statistics(user_id: str) -> Dict:
    """
    Get statistical summary of user's emotional data
    
    Returns:
        Statistics dictionary
    """
    try:
        emotions = await get_user_emotion_history(user_id, days=30)
        
        if not emotions:
            return {}
        
        from collections import Counter
        emotion_labels = [e.get('emotion') for e in emotions]
        emotion_counts = Counter(emotion_labels)
        
        return {
            "total_entries": len(emotions),
            "unique_emotions": len(set(emotion_labels)),
            "most_common": emotion_counts.most_common(3),
            "data_span_days": 30
        }
    
    except Exception as e:
        print(f"Error calculating statistics: {e}")
        return {}


