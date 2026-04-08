# Data Storage & Flow Explanation

## 📊 Overview

This document explains how emotion data flows through the Ghostnet system: from storage to Mood DNA visualization to chatbot insights.

---

## 🔄 Complete Data Flow

```
1. User Input (Text/Voice/Camera)
        ↓
2. Emotion Analysis (AI Model)
        ↓
3. Database Storage (In-Memory Mock/ MongoDB)
        ↓
4. Mood DNA Generation (Visualization)
        ↓
5. Chatbot Access (Real-time Insights)
```

---

## 1️⃣ Data Storage

### Where Data is Stored

**Current Implementation: In-Memory Mock Database**
- Location: `backend/database/mongo_connection.py`
- Structure: Python dictionary (`MOCK_DATABASE`)
- Persistence: **Data is lost when backend restarts** (in mock mode)

**Production: MongoDB**
- Location: MongoDB Atlas or local MongoDB instance
- Collections:
  - `emotions` - Raw emotion records
  - `mood_dna` - Computed Mood DNA visualizations
  - `users` - User account information

### How Data is Stored

#### Step 1: User Logs Emotion
```javascript
// Frontend sends to backend
POST /api/v1/analyze_text
{
  "text": "I'm feeling great today!",
  "user_id": "demo_user_001"
}
```

#### Step 2: Backend Analyzes & Saves
```python
# backend/routers/analyze_text.py
emotion_data = {
    "user_id": "demo_user_001",
    "timestamp": "2024-01-15T10:30:00Z",
    "modality": "text",
    "emotion": "joy",
    "confidence": 0.85,
    "all_scores": {
        "joy": 0.85,
        "sadness": 0.05,
        "anger": 0.03,
        "neutral": 0.07
    }
}
await save_emotion_data(emotion_data)
```

#### Step 3: Database Structure
```python
MOCK_DATABASE = {
    "emotions": [
        {
            "_id": "emo_0_1705315800.123",
            "user_id": "demo_user_001",
            "timestamp": "2024-01-15T10:30:00Z",
            "emotion": "joy",
            "confidence": 0.85,
            "modality": "text",
            "all_scores": {...},
            "created_at": "2024-01-15T10:30:00Z"
        },
        // ... more records
    ],
    "mood_dna": {
        "demo_user_001": {
            "user_id": "demo_user_001",
            "mood_dna": {...},
            "burnout_index": 25.5,
            "generated_at": "2024-01-15T10:35:00Z"
        }
    }
}
```

---

## 2️⃣ Mood DNA Generation

### Process: Raw Data → Mood DNA

#### Step 1: Retrieve Emotion History
```python
# Get last 7 days of emotions
history = await get_user_emotion_history(user_id, days=7)
# Returns: List of emotion records sorted by timestamp
```

#### Step 2: Generate Timeline
```python
# backend/utils/visualization.py
def generate_mood_dna_data(emotion_history):
    # Sort by timestamp
    sorted_history = sorted(history, key=lambda x: x['timestamp'])
    
    # Create timeline points
    timeline = []
    for record in sorted_history:
        timeline.append({
            "timestamp": record['timestamp'],
            "emotion": record['emotion'],  # e.g., "joy"
            "confidence": record['confidence'],  # e.g., 0.85
            "modality": record['modality'],  # "text", "voice", or "face"
            "color": get_emotion_color(record['emotion'])  # e.g., "#FFD700"
        })
    
    # Calculate dominant emotions (percentages)
    emotion_counts = Counter([r['emotion'] for r in sorted_history])
    total = len(sorted_history)
    
    dominant_emotions = {
        emotion: count / total
        for emotion, count in emotion_counts.items()
    }
    
    return {
        "timeline": timeline,
        "dominant_emotions": dominant_emotions
    }
```

#### Step 3: Calculate Burnout Index
```python
# backend/models/fusion_model.py
def calculate_burnout_index(history):
    negative_emotions = ['sadness', 'anger', 'fear']
    negative_count = sum(1 for r in history if r['emotion'] in negative_emotions)
    negative_ratio = negative_count / len(history)
    
    # Check consecutive negative emotions
    consecutive_negative = count_consecutive_negative(history)
    
    # Formula: (ratio * 60) + (streak * 4)
    burnout_index = (negative_ratio * 60) + (min(consecutive_negative, 10) * 4)
    return min(burnout_index, 100)  # Cap at 100
```

#### Step 4: Extract Energy Pattern
```python
def extract_energy_pattern(history):
    # Group emotions by time of day
    time_buckets = {
        "morning": [],    # 6-12
        "afternoon": [],  # 12-18
        "evening": [],    # 18-22
        "night": []       # 22-6
    }
    
    for record in history:
        hour = parse_timestamp(record['timestamp']).hour
        bucket = get_time_bucket(hour)
        time_buckets[bucket].append(record)
    
    # Calculate positivity ratio for each bucket
    energy_pattern = []
    for time_period, records in time_buckets.items():
        positive_count = sum(1 for r in records 
                            if r['emotion'] in ['joy', 'love', 'surprise'])
        energy_level = positive_count / len(records) if records else 0.5
        
        energy_pattern.append({
            "time_period": time_period,
            "energy_level": energy_level,
            "sample_count": len(records)
        })
    
    return energy_pattern
```

#### Step 5: Combine into Mood DNA
```python
# backend/routers/predict_mood.py
mood_dna_data = generate_mood_dna_data(history)
burnout_index = fusion_model.calculate_burnout_index(history)
energy_pattern = fusion_model.extract_energy_pattern(history)

# Save computed Mood DNA
await save_mood_dna(user_id, mood_dna_data, burnout_index)

# Return to frontend
return {
    "mood_timeline": mood_dna_data["timeline"],
    "dominant_emotions": mood_dna_data["dominant_emotions"],
    "burnout_index": burnout_index,
    "energy_pattern": energy_pattern
}
```

---

## 3️⃣ Chatbot Data Access

### How Chatbot Uses Stored Data

#### Step 1: Chatbot Receives Message
```javascript
// Frontend sends via WebSocket
{
  "type": "chat_message",
  "message": "How am I feeling?"
}
```

#### Step 2: Backend Retrieves Data
```python
# backend/routers/websocket.py
async def generate_chat_response(user_id, user_message):
    # Get emotion history
    history = await get_user_emotion_history(user_id, days=7)
    
    # Extract patterns
    recent_emotions = [e['emotion'] for e in history[-5:]]
    dominant = max(set(recent_emotions), key=recent_emotions.count)
    burnout_index = fusion_model.calculate_burnout_index(history)
```

#### Step 3: Generate Contextual Response
```python
if 'how' in message.lower() and 'feel' in message.lower():
    if history:
        response = f"Based on your recent patterns, you've been experiencing {dominant} moments."
    else:
        response = "I'm still learning about your patterns. Share more!"

elif 'burnout' in message.lower():
    if burnout_index > 50:
        response = "I've noticed elevated stress levels. Consider breaks."
    else:
        response = "Your burnout risk is relatively low."
```

---

## 📍 Where to View Data

### Option 1: Dashboard UI
1. Login to the app
2. Click **"View Data"** tab
3. See:
   - Raw emotion records
   - Data flow visualization
   - Database statistics

### Option 2: API Endpoints

**View Raw Data:**
```bash
GET http://localhost:8000/api/v1/view_raw_data/{user_id}?days=30
```

**View Data Flow:**
```bash
GET http://localhost:8000/api/v1/view_data_flow/{user_id}
```

**View Mood DNA:**
```bash
GET http://localhost:8000/api/v1/get_mood_dna/{user_id}?days=7
```

### Option 3: Backend Console
```python
# In backend/database/mongo_connection.py
# You can print MOCK_DATABASE to see all stored data
print(MOCK_DATABASE)
```

---

## 🔍 Example Data Flow

### Scenario: User logs "I'm happy today!"

1. **Storage**
   ```json
   {
     "user_id": "demo_user_001",
     "emotion": "joy",
     "confidence": 0.92,
     "timestamp": "2024-01-15T10:30:00Z"
   }
   ```

2. **Mood DNA Update**
   ```json
   {
     "timeline": [
       {"timestamp": "2024-01-15T10:30:00Z", "emotion": "joy", "color": "#FFD700"}
     ],
     "dominant_emotions": {"joy": 1.0}
   }
   ```

3. **Chatbot Access**
   ```python
   # When user asks "How am I feeling?"
   recent_emotions = ["joy"]
   dominant = "joy"
   response = "Based on your recent patterns, you've been experiencing joy moments!"
   ```

---

## 🎯 Key Points

1. **Data Persistence**: Currently in-memory (lost on restart). Switch to MongoDB for production.
2. **Real-time Updates**: WebSocket notifies frontend when new emotions are logged.
3. **Mood DNA**: Generated on-demand from raw emotion history.
4. **Chatbot**: Accesses same data source to provide personalized insights.
5. **Privacy**: Each user's data is isolated by `user_id`.

---

## 🔐 Production Considerations

### MongoDB Schema (Recommended)
```javascript
// emotions collection
{
  _id: ObjectId,
  user_id: String,
  timestamp: ISODate,
  emotion: String,
  confidence: Number,
  modality: String,
  all_scores: Object,
  created_at: ISODate
}

// Indexes
db.emotions.createIndex({ user_id: 1, timestamp: -1 })
db.emotions.createIndex({ user_id: 1, created_at: -1 })
```

### Data Retention
- Keep raw emotions for 1 year
- Archive old Mood DNA records monthly
- Allow users to delete their data

### Performance
- Cache Mood DNA for 5 minutes
- Batch process energy patterns
- Use aggregation pipelines for statistics


