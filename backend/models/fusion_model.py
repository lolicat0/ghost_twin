"""
Multimodal Fusion Model
Combines text, voice, and face emotions into unified emotional state
Includes temporal analysis (LSTM) and predictive capabilities
"""
import random
import math
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from collections import Counter


class MultimodalFusionModel:
    """
    Fuses multiple emotion modalities into single emotional state
    Performs temporal analysis and predictive modeling
    """
    
    def __init__(self):
        self.emotions = ["joy", "sadness", "anger", "fear", "surprise", "neutral", "love"]
        
        # Modality weights (can be adaptive)
        self.weights = {
            "text": 0.4,
            "voice": 0.3,
            "face": 0.3
        }
        
        self.loaded = False
        self._load_temporal_model()
    
    def _load_temporal_model(self):
        """
        Load LSTM/GRU model for temporal emotion analysis
        In production: Use PyTorch LSTM
        """
        try:
            # Placeholder for LSTM model
            # import torch
            # import torch.nn as nn
            # self.lstm = nn.LSTM(input_size=7, hidden_size=64, num_layers=2)
            # self.lstm.load_state_dict(torch.load('temporal_model.pth'))
            
            print("[OK] Temporal fusion model initialized (mock mode)")
            self.loaded = True
        except Exception as e:
            print(f"[WARNING] Temporal model loading failed: {e}")
            self.loaded = False
    
    def fuse(self, emotion_embeddings: Dict[str, Dict]) -> Dict:
        """
        Fuse multiple emotion modalities using weighted average
        
        Args:
            emotion_embeddings: Dict with keys 'text', 'voice', 'face'
                                Each value is a dict with emotion scores
        
        Returns:
            Fused emotion result
        """
        # Normalize emotion labels across modalities
        normalized_scores = {emotion: 0.0 for emotion in self.emotions}
        
        total_weight = 0.0
        
        for modality, emotion_data in emotion_embeddings.items():
            if modality not in self.weights:
                continue
            
            weight = self.weights[modality]
            total_weight += weight
            
            # Extract scores from emotion_data
            if 'all_scores' in emotion_data:
                scores = emotion_data['all_scores']
            elif isinstance(emotion_data, dict) and 'emotion' in emotion_data:
                # Single emotion provided
                scores = {emotion_data['emotion']: emotion_data.get('confidence', 1.0)}
            else:
                continue
            
            # Add weighted scores
            for emotion, score in scores.items():
                if emotion in normalized_scores:
                    normalized_scores[emotion] += weight * score
        
        # Normalize by total weight
        if total_weight > 0:
            normalized_scores = {k: v/total_weight for k, v in normalized_scores.items()}
        
        # Apply softmax for probability distribution
        normalized_scores = self._softmax(normalized_scores)
        
        # Get dominant emotion
        fused_emotion = max(normalized_scores, key=normalized_scores.get)
        confidence = normalized_scores[fused_emotion]
        
        return {
            "fused_emotion": fused_emotion,
            "confidence": float(confidence),
            "emotion_vector": [float(normalized_scores[e]) for e in self.emotions]
        }
    
    def _softmax(self, scores: Dict[str, float]) -> Dict[str, float]:
        """Apply softmax normalization"""
        values = list(scores.values())
        max_val = max(values)
        exp_values = [math.exp(v - max_val) for v in values]  # Numerical stability
        sum_exp = sum(exp_values)
        softmax_values = [v / sum_exp for v in exp_values]
        
        return {k: float(v) for k, v in zip(scores.keys(), softmax_values)}
    
    def predict_next_emotion(self, history: List[Dict], hours_ahead: int) -> Dict:
        """
        Predict future emotional state using temporal patterns
        Uses LSTM on historical emotion sequence
        
        Args:
            history: List of emotion records with timestamps
            hours_ahead: Number of hours to predict ahead
        
        Returns:
            Predicted emotion and confidence
        """
        # Extract emotion sequence
        emotion_sequence = self._prepare_sequence(history)
        
        if len(emotion_sequence) < 3:
            # Not enough data for prediction
            return {
                "predicted_emotion": "neutral",
                "confidence": 0.5
            }
        
        # Mock LSTM prediction (replace with actual model)
        # In production: Use trained LSTM model
        predicted_vector = self._mock_lstm_prediction(emotion_sequence, hours_ahead)
        
        max_idx = predicted_vector.index(max(predicted_vector))
        predicted_emotion = self.emotions[max_idx]
        confidence = float(max(predicted_vector))
        
        return {
            "predicted_emotion": predicted_emotion,
            "confidence": confidence
        }
    
    def _prepare_sequence(self, history: List[Dict]) -> List[List[float]]:
        """Convert emotion history to numerical sequence for LSTM"""
        sequences = []
        
        for record in history:
            # Get emotion vector or create one-hot encoding
            if 'emotion_vector' in record:
                vector = record['emotion_vector']
            else:
                emotion = record.get('emotion', 'neutral')
                vector = [1.0 if e == emotion else 0.0 for e in self.emotions]
            
            sequences.append(vector)
        
        return sequences
    
    def _mock_lstm_prediction(self, sequence: List[List[float]], hours_ahead: int) -> List[float]:
        """Mock LSTM prediction - replace with actual model"""
        # Simple heuristic: weighted average of recent states with trend
        if len(sequence) > 3:
            recent = sequence[-3:]
            weights = [0.2, 0.3, 0.5]  # More weight on recent
            prediction = [sum(r[i] * w for r, w in zip(recent, weights)) for i in range(len(self.emotions))]
        else:
            prediction = [sum(s[i] for s in sequence) / len(sequence) for i in range(len(self.emotions))]
        
        # Add some noise and trend
        noise = [random.gauss(0, 0.05) for _ in prediction]
        prediction = [p + n for p, n in zip(prediction, noise)]
        
        # Normalize
        prediction = [max(0, min(1, p)) for p in prediction]
        total = sum(prediction)
        prediction = [p / total for p in prediction]
        
        return prediction
    
    def calculate_burnout_index(self, history: List[Dict]) -> float:
        """
        Calculate burnout risk index (0-100)
        Based on sustained negative emotions and energy patterns
        """
        if not history:
            return 0.0
        
        negative_emotions = ['sadness', 'anger', 'fear']
        negative_count = 0
        total_count = len(history)
        
        for record in history:
            emotion = record.get('emotion', 'neutral')
            if emotion in negative_emotions:
                negative_count += 1
        
        # Calculate negative emotion ratio
        negative_ratio = negative_count / total_count if total_count > 0 else 0
        
        # Check for consecutive negative emotions (pattern detection)
        consecutive_negative = self._count_consecutive_negative(history)
        
        # Burnout index formula
        burnout_index = (negative_ratio * 60) + (min(consecutive_negative, 10) * 4)
        burnout_index = min(burnout_index, 100)
        
        return float(burnout_index)
    
    def _count_consecutive_negative(self, history: List[Dict]) -> int:
        """Count longest streak of negative emotions"""
        negative_emotions = ['sadness', 'anger', 'fear']
        max_streak = 0
        current_streak = 0
        
        for record in history:
            if record.get('emotion') in negative_emotions:
                current_streak += 1
                max_streak = max(max_streak, current_streak)
            else:
                current_streak = 0
        
        return max_streak
    
    def extract_energy_pattern(self, history: List[Dict]) -> List[Dict]:
        """
        Extract circadian emotional rhythm (energy pattern by time of day)
        """
        time_buckets = {
            "morning": [],    # 6-12
            "afternoon": [],  # 12-18
            "evening": [],    # 18-22
            "night": []       # 22-6
        }
        
        for record in history:
            timestamp = record.get('timestamp')
            if not timestamp:
                continue
            
            # Parse timestamp
            try:
                dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                hour = dt.hour
                
                if 6 <= hour < 12:
                    bucket = "morning"
                elif 12 <= hour < 18:
                    bucket = "afternoon"
                elif 18 <= hour < 22:
                    bucket = "evening"
                else:
                    bucket = "night"
                
                time_buckets[bucket].append(record)
            except:
                continue
        
        # Calculate average energy/positivity for each time bucket
        energy_pattern = []
        for time_period, records in time_buckets.items():
            if records:
                positive_count = sum(1 for r in records if r.get('emotion') in ['joy', 'love', 'surprise'])
                energy_level = positive_count / len(records)
            else:
                energy_level = 0.5
            
            energy_pattern.append({
                "time_period": time_period,
                "energy_level": float(energy_level),
                "sample_count": len(records)
            })
        
        return energy_pattern
    
    def detect_risk_factors(self, history: List[Dict]) -> List[str]:
        """Detect emotional risk factors from history"""
        risk_factors = []
        
        if not history:
            return risk_factors
        
        # Check for sustained negative emotions
        burnout_index = self.calculate_burnout_index(history)
        if burnout_index > 60:
            risk_factors.append("High burnout risk detected")
        
        # Check for emotional volatility
        emotions = [r.get('emotion') for r in history]
        unique_emotions = len(set(emotions))
        if unique_emotions > 5 and len(history) < 10:
            risk_factors.append("High emotional volatility")
        
        # Check for lack of positive emotions
        positive_count = sum(1 for e in emotions if e in ['joy', 'love'])
        if positive_count < len(history) * 0.2:
            risk_factors.append("Low positive emotion frequency")
        
        # Check recent trend
        if len(history) >= 5:
            recent_emotions = emotions[-5:]
            if all(e in ['sadness', 'anger', 'fear'] for e in recent_emotions):
                risk_factors.append("Sustained negative emotional state")
        
        return risk_factors
    
    def generate_recommendations(self, predicted_emotion: str, risk_factors: List[str]) -> List[str]:
        """Generate actionable recommendations"""
        recommendations = []
        
        if "burnout" in str(risk_factors).lower():
            recommendations.append("Consider taking regular breaks and practicing self-care")
            recommendations.append("Talk to someone you trust about your feelings")
        
        if "volatility" in str(risk_factors).lower():
            recommendations.append("Try meditation or mindfulness exercises")
            recommendations.append("Maintain a consistent daily routine")
        
        if predicted_emotion in ['sadness', 'fear', 'anger']:
            recommendations.append("Engage in physical activity or go for a walk")
            recommendations.append("Practice deep breathing exercises")
        
        if not recommendations:
            recommendations.append("Keep tracking your emotions to build your Mood DNA")
            recommendations.append("You're doing well! Continue your emotional awareness practice")
        
        return recommendations
    
    def generate_detailed_recommendations(self, history: List[Dict]) -> Dict:
        """Generate comprehensive recommendations with insights"""
        emotions = [r.get('emotion') for r in history]
        emotion_counts = Counter(emotions)
        
        # Insights
        most_common = emotion_counts.most_common(1)[0] if emotion_counts else ("neutral", 0)
        
        insights = [
            f"Your most frequent emotion this week was {most_common[0]}",
            f"You logged {len(history)} emotional data points"
        ]
        
        # Activities
        activities = [
            "Morning journaling",
            "Evening gratitude practice",
            "Mindful breathing exercises",
            "Connect with friends or family",
            "Engage in a creative hobby"
        ]
        
        # Tips
        tips = [
            "Track emotions at consistent times each day",
            "Notice patterns in your energy levels",
            "Celebrate small wins and positive moments",
            "Be kind to yourself during difficult emotions"
        ]
        
        return {
            "insights": insights,
            "activities": activities,
            "tips": tips
        }

