"""
Voice Emotion Model
Speech Emotion Recognition using audio features and ML models
"""
import random
from typing import Dict
import io


class VoiceEmotionModel:
    """
    Voice-based emotion recognition from audio input
    Uses mel-spectrograms and audio features for emotion classification
    """
    
    def __init__(self):
        self.emotions = ["neutral", "happy", "sad", "angry", "fear", "disgust", "surprise"]
        self.loaded = False
        self._load_model()
    
    def _load_model(self):
        """
        Load pre-trained voice emotion model
        In production: Use speechbrain/emotion-recognition or similar
        """
        try:
            # Placeholder for actual model loading
            # import torchaudio
            # from speechbrain.pretrained import EncoderClassifier
            # self.classifier = EncoderClassifier.from_hparams(
            #     source="speechbrain/emotion-recognition-wav2vec2-IEMOCAP"
            # )
            
            print("✓ Voice emotion model initialized (mock mode)")
            self.loaded = True
        except Exception as e:
            print(f"⚠ Voice model loading failed: {e}")
            self.loaded = False
    
    def predict_emotion(self, audio_bytes: bytes) -> Dict:
        """
        Predict emotion from audio input
        
        Args:
            audio_bytes: Raw audio file bytes
            
        Returns:
            Dictionary with emotion, confidence, all_scores, and audio_features
        """
        # Extract audio features
        features = self._extract_audio_features(audio_bytes)
        
        # Mock emotion prediction (replace with actual model inference)
        emotion_scores = self._mock_voice_prediction(features)
        
        # Get dominant emotion
        dominant_emotion = max(emotion_scores, key=emotion_scores.get)
        confidence = emotion_scores[dominant_emotion]
        
        return {
            "emotion": dominant_emotion,
            "confidence": float(confidence),
            "all_scores": {k: float(v) for k, v in emotion_scores.items()},
            "audio_features": features
        }
    
    def predict_emotion_fast(self, audio_bytes: bytes) -> Dict:
        """
        Fast emotion prediction for real-time streaming
        Uses simplified feature extraction
        """
        features = self._extract_audio_features_fast(audio_bytes)
        emotion_scores = self._mock_voice_prediction(features)
        
        dominant_emotion = max(emotion_scores, key=emotion_scores.get)
        
        return {
            "emotion": dominant_emotion,
            "confidence": float(emotion_scores[dominant_emotion])
        }
    
    def _extract_audio_features(self, audio_bytes: bytes) -> Dict:
        """
        Extract comprehensive audio features for emotion recognition
        
        Features include:
            - Pitch (fundamental frequency)
            - Energy/Intensity
            - Tempo/Speaking rate
            - Spectral features
            - MFCCs (Mel-frequency cepstral coefficients)
        """
        # In production, use librosa or torchaudio
        # import librosa
        # y, sr = librosa.load(io.BytesIO(audio_bytes))
        # mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        # pitch = librosa.yin(y, fmin=50, fmax=400)
        # energy = librosa.feature.rms(y=y)
        
        # Mock features for demo
        features = {
            "duration_seconds": random.uniform(1, 10),
            "pitch_mean": random.uniform(100, 250),
            "pitch_std": random.uniform(10, 50),
            "energy_mean": random.uniform(0.3, 0.9),
            "energy_std": random.uniform(0.05, 0.2),
            "speaking_rate": random.uniform(2, 5),
            "mfcc_mean": [random.uniform(-50, 50) for _ in range(13)],
            "spectral_centroid": random.uniform(1000, 3000)
        }
        
        return features
    
    def _extract_audio_features_fast(self, audio_bytes: bytes) -> Dict:
        """Fast feature extraction for real-time processing"""
        return {
            "energy_mean": random.uniform(0.3, 0.9),
            "pitch_mean": random.uniform(100, 250)
        }
    
    def _mock_voice_prediction(self, features: Dict) -> Dict[str, float]:
        """
        Mock voice emotion prediction
        Replace with actual model inference in production
        """
        scores = {emotion: 0.1 for emotion in self.emotions}
        
        # Simple heuristics based on features
        energy = features.get("energy_mean", 0.5)
        pitch = features.get("pitch_mean", 150)
        
        # High energy + high pitch = happy/excited
        if energy > 0.7 and pitch > 200:
            scores['happy'] += 0.5
        
        # Low energy + low pitch = sad
        elif energy < 0.4 and pitch < 150:
            scores['sad'] += 0.5
        
        # High energy + moderate-high pitch = angry
        elif energy > 0.7 and 150 <= pitch <= 220:
            scores['angry'] += 0.4
        
        # Moderate energy + variable pitch = fear
        elif energy > 0.5 and features.get("pitch_std", 0) > 30:
            scores['fear'] += 0.3
        
        else:
            scores['neutral'] += 0.3
        
        # Normalize
        total = sum(scores.values())
        normalized_scores = {k: v/total for k, v in scores.items()}
        
        return normalized_scores

