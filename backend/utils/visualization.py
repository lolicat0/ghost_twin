"""
Visualization Utilities
Generate data structures for frontend visualizations (Mood DNA, charts, etc.)
"""
from typing import Dict, List
from datetime import datetime, timedelta
from collections import Counter


def generate_mood_dna_data(emotion_history: List[Dict]) -> Dict:
    """
    Generate Mood DNA visualization data
    
    Creates timeline data structure for the emotional fingerprint graph
    
    Args:
        emotion_history: List of emotion records with timestamps
        
    Returns:
        Dictionary with timeline and dominant emotions
    """
    if not emotion_history:
        return {
            "timeline": [],
            "dominant_emotions": {}
        }
    
    # Sort by timestamp
    sorted_history = sorted(
        emotion_history,
        key=lambda x: x.get('timestamp', '')
    )
    
    # Create timeline with emotion data points
    timeline = []
    for record in sorted_history:
        timeline.append({
            "timestamp": record.get('timestamp'),
            "emotion": record.get('emotion', 'neutral'),
            "confidence": record.get('confidence', 0.5),
            "modality": record.get('modality', 'unknown'),
            "color": get_emotion_color(record.get('emotion', 'neutral'))
        })
    
    # Calculate dominant emotions
    emotions = [r.get('emotion', 'neutral') for r in sorted_history]
    emotion_counts = Counter(emotions)
    total = len(emotions)
    
    dominant_emotions = {
        emotion: count / total
        for emotion, count in emotion_counts.items()
    }
    
    return {
        "timeline": timeline,
        "dominant_emotions": dominant_emotions
    }


def get_emotion_color(emotion: str) -> str:
    """
    Map emotions to color codes for visualization
    
    Returns:
        Hex color code
    """
    color_map = {
        "joy": "#FFD700",      # Gold
        "happy": "#FFD700",
        "sadness": "#4169E1",  # Royal Blue
        "sad": "#4169E1",
        "anger": "#DC143C",    # Crimson
        "angry": "#DC143C",
        "fear": "#9370DB",     # Medium Purple
        "surprise": "#FF69B4", # Hot Pink
        "neutral": "#A9A9A9",  # Dark Gray
        "love": "#FF1493",     # Deep Pink
        "disgust": "#556B2F"   # Dark Olive Green
    }
    
    return color_map.get(emotion.lower(), "#808080")


def generate_emotion_distribution_chart(emotion_history: List[Dict]) -> Dict:
    """
    Generate data for pie/donut chart showing emotion distribution
    
    Returns:
        Chart data with labels, values, and colors
    """
    emotions = [r.get('emotion', 'neutral') for r in emotion_history]
    emotion_counts = Counter(emotions)
    
    chart_data = {
        "labels": list(emotion_counts.keys()),
        "values": list(emotion_counts.values()),
        "colors": [get_emotion_color(e) for e in emotion_counts.keys()]
    }
    
    return chart_data


def generate_timeline_chart(emotion_history: List[Dict], interval: str = "day") -> Dict:
    """
    Generate time-series data for line chart
    
    Args:
        emotion_history: Emotion records
        interval: Aggregation interval ("hour", "day", "week")
        
    Returns:
        Timeline chart data
    """
    if not emotion_history:
        return {"timestamps": [], "emotions": [], "confidence": []}
    
    # Sort by timestamp
    sorted_history = sorted(
        emotion_history,
        key=lambda x: x.get('timestamp', '')
    )
    
    timestamps = []
    emotions = []
    confidences = []
    
    for record in sorted_history:
        timestamps.append(record.get('timestamp'))
        emotions.append(record.get('emotion', 'neutral'))
        confidences.append(record.get('confidence', 0.5))
    
    return {
        "timestamps": timestamps,
        "emotions": emotions,
        "confidence": confidences
    }


def generate_heatmap_data(emotion_history: List[Dict]) -> Dict:
    """
    Generate heatmap data showing emotion intensity by time of day and day of week
    
    Returns:
        2D array for heatmap visualization
    """
    # Initialize 7x24 grid (days x hours)
    heatmap = [[0.0 for _ in range(24)] for _ in range(7)]
    counts = [[0 for _ in range(24)] for _ in range(7)]
    
    for record in emotion_history:
        timestamp = record.get('timestamp')
        emotion = record.get('emotion', 'neutral')
        
        try:
            dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            day_of_week = dt.weekday()  # 0=Monday
            hour = dt.hour
            
            # Assign intensity based on emotion (positive=1, negative=-1, neutral=0)
            intensity = get_emotion_intensity(emotion)
            
            heatmap[day_of_week][hour] += intensity
            counts[day_of_week][hour] += 1
        except:
            continue
    
    # Average the intensities
    for i in range(7):
        for j in range(24):
            if counts[i][j] > 0:
                heatmap[i][j] = heatmap[i][j] / counts[i][j]
    
    return {
        "data": heatmap,
        "days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        "hours": list(range(24))
    }


def get_emotion_intensity(emotion: str) -> float:
    """
    Get emotional intensity/valence
    Positive emotions = +1, Negative = -1, Neutral = 0
    """
    positive = ["joy", "happy", "love", "surprise"]
    negative = ["sadness", "sad", "anger", "angry", "fear", "disgust"]
    
    emotion_lower = emotion.lower()
    
    if emotion_lower in positive:
        return 1.0
    elif emotion_lower in negative:
        return -1.0
    else:
        return 0.0


def generate_burnout_gauge_data(burnout_index: float) -> Dict:
    """
    Generate data for burnout risk gauge visualization
    
    Args:
        burnout_index: 0-100 burnout score
        
    Returns:
        Gauge configuration with zones
    """
    # Define risk zones
    if burnout_index < 30:
        zone = "low"
        color = "#10B981"  # Green
        message = "Low burnout risk - You're doing great!"
    elif burnout_index < 60:
        zone = "moderate"
        color = "#F59E0B"  # Orange
        message = "Moderate stress detected - Take care of yourself"
    else:
        zone = "high"
        color = "#EF4444"  # Red
        message = "High burnout risk - Please prioritize self-care"
    
    return {
        "value": burnout_index,
        "zone": zone,
        "color": color,
        "message": message,
        "zones": [
            {"min": 0, "max": 30, "color": "#10B981", "label": "Low"},
            {"min": 30, "max": 60, "color": "#F59E0B", "label": "Moderate"},
            {"min": 60, "max": 100, "color": "#EF4444", "label": "High"}
        ]
    }


def generate_weekly_report(emotion_history: List[Dict]) -> Dict:
    """
    Generate "Spotify Wrapped" style weekly emotional summary
    
    Returns:
        Comprehensive weekly stats
    """
    if not emotion_history:
        return {}
    
    emotions = [r.get('emotion') for r in emotion_history]
    emotion_counts = Counter(emotions)
    
    # Most common emotion
    most_common_emotion = emotion_counts.most_common(1)[0] if emotion_counts else ("neutral", 0)
    
    # Emotion diversity
    unique_emotions = len(set(emotions))
    
    # Time analysis
    timestamps = [r.get('timestamp') for r in emotion_history if r.get('timestamp')]
    datetimes = []
    for ts in timestamps:
        try:
            dt = datetime.fromisoformat(ts.replace('Z', '+00:00'))
            datetimes.append(dt)
        except:
            continue
    
    # Most active time
    if datetimes:
        hours = [dt.hour for dt in datetimes]
        most_active_hour = Counter(hours).most_common(1)[0][0] if hours else 12
        
        if 6 <= most_active_hour < 12:
            most_active_time = "Morning"
        elif 12 <= most_active_hour < 18:
            most_active_time = "Afternoon"
        elif 18 <= most_active_hour < 22:
            most_active_time = "Evening"
        else:
            most_active_time = "Night"
    else:
        most_active_time = "Unknown"
    
    # Positive vs negative ratio
    positive_emotions = ["joy", "happy", "love", "surprise"]
    negative_emotions = ["sadness", "sad", "anger", "angry", "fear"]
    
    positive_count = sum(1 for e in emotions if e in positive_emotions)
    negative_count = sum(1 for e in emotions if e in negative_emotions)
    
    return {
        "total_entries": len(emotion_history),
        "most_common_emotion": most_common_emotion[0],
        "emotion_diversity": unique_emotions,
        "most_active_time": most_active_time,
        "positive_moments": positive_count,
        "challenging_moments": negative_count,
        "positivity_ratio": positive_count / len(emotions) if emotions else 0,
        "distribution": dict(emotion_counts)
    }


def generate_emotion_flow_diagram(emotion_history: List[Dict]) -> Dict:
    """
    Generate Sankey diagram data showing emotion transitions
    
    Returns:
        Source-target flow data for visualization
    """
    if len(emotion_history) < 2:
        return {"nodes": [], "links": []}
    
    # Extract emotion sequence
    emotions = [r.get('emotion', 'neutral') for r in emotion_history]
    
    # Build transition pairs
    transitions = {}
    for i in range(len(emotions) - 1):
        source = emotions[i]
        target = emotions[i + 1]
        key = (source, target)
        transitions[key] = transitions.get(key, 0) + 1
    
    # Get unique emotions
    unique_emotions = list(set(emotions))
    
    # Create nodes
    nodes = [{"id": emotion, "color": get_emotion_color(emotion)} 
             for emotion in unique_emotions]
    
    # Create links
    links = [
        {
            "source": source,
            "target": target,
            "value": count
        }
        for (source, target), count in transitions.items()
    ]
    
    return {
        "nodes": nodes,
        "links": links
    }

