"""
Text Emotion Model
Uses transformer-based models for sentiment and emotion analysis
"""
import random
from typing import Dict, List
import re


class TextEmotionModel:
    """
    Text-based emotion recognition using transformer models
    Uses DistilBERT for sentiment analysis and custom emotion classification
    """
    
    def __init__(self):
        self.emotions = ["joy", "sadness", "anger", "fear", "surprise", "neutral", "love"]
        self.loaded = False
        self._load_model()
    
    def _load_model(self):
        """
        Load pre-trained transformer model
        In production: Use transformers library with distilbert-base-uncased-finetuned-sst-2-english
        """
        try:
            # Placeholder for actual model loading
            # from transformers import pipeline
            # self.sentiment_analyzer = pipeline("sentiment-analysis")
            # self.emotion_classifier = pipeline("text-classification", model="j-hartmann/emotion-english-distilroberta-base")
            
            print("[OK] Text emotion model initialized (mock mode)")
            self.loaded = True
        except Exception as e:
            print(f"[WARNING] Text model loading failed: {e}")
            self.loaded = False
    
    def predict_emotion(self, text: str) -> Dict:
        """
        Predict emotion from text input
        
        Args:
            text: Input text string
            
        Returns:
            Dictionary with emotion, confidence, all_scores, and sentiment
        """
        # Clean text
        text = self._preprocess_text(text)
        
        # Mock emotion detection (replace with actual model inference)
        emotion_scores = self._mock_emotion_prediction(text)
        
        # Get dominant emotion
        dominant_emotion = max(emotion_scores, key=emotion_scores.get)
        confidence = emotion_scores[dominant_emotion]
        
        # Sentiment analysis
        sentiment = self._analyze_sentiment(emotion_scores)
        
        return {
            "emotion": dominant_emotion,
            "confidence": float(confidence),
            "all_scores": {k: float(v) for k, v in emotion_scores.items()},
            "sentiment": sentiment
        }
    
    def _preprocess_text(self, text: str) -> str:
        """Clean and normalize text"""
        text = text.strip()
        text = re.sub(r'\s+', ' ', text)
        return text
    
    def _mock_emotion_prediction(self, text: str) -> Dict[str, float]:
        """
        Improved emotion prediction with better context understanding
        Replace with actual transformer model inference in production
        """
        text_lower = text.lower()
        scores = {emotion: 0.0 for emotion in self.emotions}
        
        # First, check for crisis/suicidal language (highest priority)
        crisis_words = ['dying', 'die', 'suicide', 'kill myself', 'end it all', 'want to die', 
                       'give up', 'nothing matters', 'hopeless', 'worthless', 'meaningless']
        if any(word in text_lower for word in crisis_words):
            scores['sadness'] += 0.8
            scores['fear'] += 0.15
            # Normalize and return immediately for crisis detection
            total = sum(scores.values())
            return {k: v/total if total > 0 else 0.0 for k, v in scores.items()}
        
        # Check for negation patterns ("not good", "not happy", etc.)
        negation_patterns = [
            r'\bnot\s+(good|great|well|happy|fine|ok|okay|okay)\b',
            r'\bno\s+(hope|future|point|reason)\b',
            r'\bcan\'?t\s+(do|handle|cope|deal)\b',
            r'\bcan\'?t\s+continue\b',
            r'\bcan\'?t\s+take\s+it\b'
        ]
        has_negation = any(re.search(pattern, text_lower) for pattern in negation_patterns)
        
        # Positive emotions
        positive_words = {
            'joy': ['happy', 'great', 'wonderful', 'amazing', 'excellent', 'fantastic', 'fabulous', 
                   'delighted', 'joyful', 'pleased', 'thrilled', 'ecstatic', 'blissful', 'cheerful'],
            'love': ['love', 'adore', 'cherish', 'care', 'affection', 'fond', 'treasure', 'devoted'],
            'surprise': ['wow', 'surprised', 'shocked', 'unexpected', 'whoa', 'astonished']
        }
        
        # Negative emotions  
        negative_words = {
            'sadness': ['sad', 'depressed', 'down', 'unhappy', 'disappointed', 'miserable', 'melancholy',
                       'gloomy', 'heartbroken', 'upset', 'lonely', 'empty', 'numb', 'dead inside',
                       'feeling dead', 'feel dead', 'feel like dying', 'feel like nothing',
                       'not in a good mood', 'mood is bad', 'terrible mood'],
            'anger': ['angry', 'furious', 'mad', 'irritated', 'frustrated', 'annoyed', 'rage', 
                     'livid', 'enraged', 'outraged', 'resentful'],
            'fear': ['scared', 'afraid', 'worried', 'anxious', 'nervous', 'fearful', 'terrified',
                   'panic', 'dread', 'overwhelmed', 'stressed']
        }
        
        # Check all emotion categories
        for emotion, words in positive_words.items():
            if has_negation:
                # If there's negation near positive words, they're actually negative
                continue
            for word in words:
                if word in text_lower:
                    scores[emotion] += 0.5
        
        for emotion, words in negative_words.items():
            for word in words:
                if word in text_lower:
                    scores[emotion] += 0.5
        
        # Boost sadness for common patterns
        sadness_patterns = [
            r'\bfeel\s+like\s+(dying|nothing|shit|garbage|trash)\b',
            r'\bjust\s+(want|feel)\s+to\s+(die|cry|disappear)\b',
            r'\bhate\s+myself\b',
            r'\blife\s+(sucks|is shit|means nothing)\b',
            r'\bmood\s+is\s+(bad|terrible|awful|horrible)\b',
            r'\bnot\s+in\s+a\s+good\s+mood\b'
        ]
        if any(re.search(pattern, text_lower) for pattern in sadness_patterns):
            scores['sadness'] += 0.6
        
        # Boost fear for overwhelming situations
        fear_patterns = [
            r'\btoo\s+much\b',
            r'\bcan\'?t\s+(handle|cope|deal|breathe)\b',
            r'\boverwhelmed\b',
            r'\bpanic\b'
        ]
        if any(re.search(pattern, text_lower) for pattern in fear_patterns):
            scores['fear'] += 0.4
        
        # Boost anger for frustration
        anger_patterns = [
            r'\bfucking\b',
            r'\bshit\b',
            r'\bpissed\b',
            r'\bsick\s+of\b'
        ]
        if any(re.search(pattern, text_lower) for pattern in anger_patterns):
            scores['anger'] += 0.4
        
        # If no strong emotion detected, mark as neutral
        max_score = max(scores.values()) if scores.values() else 0
        if max_score < 0.3:
            scores['neutral'] = 0.7
        
        # Ensure crisis phrases get sadness even if no keywords match
        if 'like dying' in text_lower or 'feel like dying' in text_lower:
            scores['sadness'] = max(scores['sadness'], 0.8)
        
        # Normalize scores
        total = sum(scores.values())
        if total == 0:
            return {emotion: 1.0/len(self.emotions) for emotion in self.emotions}
        
        normalized_scores = {k: v/total for k, v in scores.items()}
        
        return normalized_scores
    
    def _analyze_sentiment(self, emotion_scores: Dict[str, float]) -> str:
        """Determine overall sentiment from emotion distribution"""
        positive_emotions = ['joy', 'love', 'surprise']
        negative_emotions = ['sadness', 'anger', 'fear']
        
        positive_score = sum(emotion_scores.get(e, 0) for e in positive_emotions)
        negative_score = sum(emotion_scores.get(e, 0) for e in negative_emotions)
        
        # Use more lenient threshold to detect negative sentiment better
        if positive_score > negative_score + 0.05:
            return "positive"
        elif negative_score > positive_score + 0.05:
            return "negative"
        else:
            return "neutral"
    
    def extract_keywords(self, text: str, top_k: int = 5) -> List[str]:
        """Extract key emotional words from text"""
        # Simple keyword extraction (replace with TF-IDF or KeyBERT in production)
        emotional_words = [
            'happy', 'sad', 'angry', 'love', 'fear', 'joy', 'anxiety',
            'excited', 'depressed', 'calm', 'stressed', 'relaxed'
        ]
        
        words = text.lower().split()
        keywords = [word for word in words if word in emotional_words]
        
        return keywords[:top_k]
    
    def generate_insight(self, emotion: str, scores: Dict[str, float]) -> str:
        """Generate human-readable insight from emotion analysis"""
        insights = {
            "joy": "You're expressing positive emotions. Keep embracing this energy!",
            "sadness": "You seem to be going through a tough time. Remember, it's okay to feel this way. Consider reaching out to someone you trust.",
            "anger": "There's frustration in your words. Consider taking a moment to breathe and process.",
            "fear": "You're experiencing anxiety. Try grounding techniques or talking to someone.",
            "love": "Beautiful expressions of affection. Connection is powerful.",
            "neutral": "Your emotional state seems balanced right now.",
            "surprise": "Something unexpected caught your attention!"
        }
        
        # Check for crisis indicators
        if emotion == 'sadness' and scores.get('sadness', 0) > 0.7:
            return "You're expressing deep distress. Please know that there are people who care. Consider reaching out to a mental health professional or crisis helpline."
        
        return insights.get(emotion, "Your emotional state is being processed.")

