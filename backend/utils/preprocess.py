"""
Preprocessing Utilities
Functions for data preprocessing and feature extraction
"""
import math
import random
from typing import Dict, List, Union
import re
from datetime import datetime


def clean_text(text: str) -> str:
    """
    Clean and normalize text input
    
    Args:
        text: Raw text string
        
    Returns:
        Cleaned text
    """
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove special characters (keep punctuation for emotion)
    text = re.sub(r'[^\w\s.,!?\'"-]', '', text)
    
    # Strip and lowercase
    text = text.strip()
    
    return text


def normalize_emotion_scores(scores: Dict[str, float]) -> Dict[str, float]:
    """
    Normalize emotion probability scores to sum to 1.0
    
    Args:
        scores: Dictionary of emotion scores
        
    Returns:
        Normalized scores
    """
    total = sum(scores.values())
    
    if total == 0:
        # Uniform distribution if all zeros
        n = len(scores)
        return {k: 1.0/n for k in scores.keys()}
    
    return {k: v/total for k, v in scores.items()}


def extract_temporal_features(timestamps: List[str]) -> Dict:
    """
    Extract temporal patterns from timestamp sequence
    
    Returns:
        - Time of day distribution
        - Day of week pattern
        - Average interval between entries
    """
    if not timestamps:
        return {}
    
    datetimes = []
    for ts in timestamps:
        try:
            dt = datetime.fromisoformat(ts.replace('Z', '+00:00'))
            datetimes.append(dt)
        except:
            continue
    
    if not datetimes:
        return {}
    
    # Time of day distribution
    hours = [dt.hour for dt in datetimes]
    time_dist = {
        "morning": sum(1 for h in hours if 6 <= h < 12),
        "afternoon": sum(1 for h in hours if 12 <= h < 18),
        "evening": sum(1 for h in hours if 18 <= h < 22),
        "night": sum(1 for h in hours if h >= 22 or h < 6)
    }
    
    # Day of week pattern
    weekdays = [dt.weekday() for dt in datetimes]  # 0=Monday, 6=Sunday
    weekday_count = sum(1 for w in weekdays if w < 5)
    weekend_count = sum(1 for w in weekdays if w >= 5)
    
    # Average interval
    if len(datetimes) > 1:
        sorted_dts = sorted(datetimes)
        intervals = [(sorted_dts[i+1] - sorted_dts[i]).total_seconds() / 3600 
                     for i in range(len(sorted_dts)-1)]
        avg_interval_hours = sum(intervals) / len(intervals) if intervals else 0
    else:
        avg_interval_hours = 0
    
    return {
        "time_distribution": time_dist,
        "weekday_entries": weekday_count,
        "weekend_entries": weekend_count,
        "avg_interval_hours": float(avg_interval_hours)
    }


def create_emotion_vector(emotion: str, all_emotions: List[str]) -> List[float]:
    """
    Create one-hot or probability vector for emotion
    
    Args:
        emotion: Emotion label
        all_emotions: List of all possible emotions
        
    Returns:
        Emotion vector
    """
    vector = [1.0 if e == emotion else 0.0 for e in all_emotions]
    return vector


def aggregate_multimodal_scores(text_scores: Dict, voice_scores: Dict, face_scores: Dict,
                                 weights: Dict = None) -> Dict[str, float]:
    """
    Aggregate scores from multiple modalities
    
    Args:
        text_scores: Text emotion scores
        voice_scores: Voice emotion scores
        face_scores: Face emotion scores
        weights: Optional custom weights for each modality
        
    Returns:
        Aggregated emotion scores
    """
    if weights is None:
        weights = {"text": 0.4, "voice": 0.3, "face": 0.3}
    
    # Get all unique emotions
    all_emotions = set()
    if text_scores:
        all_emotions.update(text_scores.keys())
    if voice_scores:
        all_emotions.update(voice_scores.keys())
    if face_scores:
        all_emotions.update(face_scores.keys())
    
    aggregated = {emotion: 0.0 for emotion in all_emotions}
    total_weight = 0.0
    
    if text_scores:
        for emotion, score in text_scores.items():
            aggregated[emotion] += weights["text"] * score
        total_weight += weights["text"]
    
    if voice_scores:
        for emotion, score in voice_scores.items():
            if emotion in aggregated:
                aggregated[emotion] += weights["voice"] * score
        total_weight += weights["voice"]
    
    if face_scores:
        for emotion, score in face_scores.items():
            if emotion in aggregated:
                aggregated[emotion] += weights["face"] * score
        total_weight += weights["face"]
    
    # Normalize by actual weight
    if total_weight > 0:
        aggregated = {k: v/total_weight for k, v in aggregated.items()}
    
    return aggregated


def calculate_emotion_diversity(emotion_history: List[str]) -> float:
    """
    Calculate diversity/entropy of emotions over time
    Higher values indicate more varied emotional states
    
    Returns:
        Diversity score (0-1)
    """
    if not emotion_history:
        return 0.0
    
    from collections import Counter
    emotion_counts = Counter(emotion_history)
    total = len(emotion_history)
    
    # Calculate entropy
    entropy = 0.0
    for count in emotion_counts.values():
        p = count / total
        if p > 0:
            entropy -= p * math.log2(p)
    
    # Normalize by max entropy
    max_entropy = math.log2(len(emotion_counts)) if len(emotion_counts) > 1 else 1
    normalized_entropy = entropy / max_entropy if max_entropy > 0 else 0
    
    return float(normalized_entropy)


def detect_emotion_transitions(emotion_sequence: List[str]) -> Dict:
    """
    Detect common emotion transitions (e.g., joy -> neutral, sadness -> anger)
    
    Returns:
        Transition matrix and most common transitions
    """
    if len(emotion_sequence) < 2:
        return {"transitions": {}, "most_common": []}
    
    transitions = {}
    for i in range(len(emotion_sequence) - 1):
        current = emotion_sequence[i]
        next_emotion = emotion_sequence[i + 1]
        
        key = f"{current} → {next_emotion}"
        transitions[key] = transitions.get(key, 0) + 1
    
    # Sort by frequency
    sorted_transitions = sorted(transitions.items(), key=lambda x: x[1], reverse=True)
    
    return {
        "transitions": transitions,
        "most_common": sorted_transitions[:5]
    }


def interpolate_missing_data(data_points: List[Dict], max_gap_hours: float = 24) -> List[Dict]:
    """
    Interpolate missing data points in time series
    Useful for continuous Mood DNA visualization
    
    Args:
        data_points: List of data points with timestamps
        max_gap_hours: Maximum gap to interpolate
        
    Returns:
        Interpolated data points
    """
    if len(data_points) < 2:
        return data_points
    
    # Sort by timestamp
    sorted_data = sorted(data_points, key=lambda x: x.get('timestamp', ''))
    
    # For now, return as-is (actual interpolation would be more complex)
    # In production: Use linear/spline interpolation
    
    return sorted_data

