"""
WebSocket Router for Real-time Updates
Handles real-time communication between frontend and backend
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List
import json
from datetime import datetime
from database.mongo_connection import get_user_emotion_history
from models.fusion_model import MultimodalFusionModel
from utils.visualization import generate_mood_dna_data

router = APIRouter()
fusion_model = MultimodalFusionModel()

# Store active WebSocket connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        print(f"Client connected: {user_id} (Total: {len(self.active_connections[user_id])})")
    
    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        print(f"Client disconnected: {user_id}")
    
    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            disconnected = []
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    print(f"Error sending message: {e}")
                    disconnected.append(connection)
            
            # Remove disconnected connections
            for conn in disconnected:
                self.disconnect(conn, user_id)
    
    async def broadcast_to_user(self, user_id: str, message: dict):
        await self.send_personal_message(message, user_id)

manager = ConnectionManager()


@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """
    WebSocket endpoint for real-time updates
    
    Messages:
    - {'type': 'emotion_logged', 'data': {...}} - When new emotion is logged
    - {'type': 'mood_update', 'data': {...}} - Mood DNA update
    - {'type': 'chat_message', 'data': {...}} - Chat message from twin
    - {'type': 'ping'} - Keepalive ping
    """
    print(f"📡 WebSocket connection attempt from user: {user_id}")
    await manager.connect(websocket, user_id)
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
            except json.JSONDecodeError as e:
                print(f"Error parsing WebSocket message: {e}")
                await websocket.send_json({
                    'type': 'error',
                    'message': 'Invalid message format'
                })
                continue
            
            message_type = message.get('type')
            print(f"📨 Received message type: {message_type} from {user_id}")
            
            if message_type == 'ping':
                # Keepalive response
                await websocket.send_json({'type': 'pong', 'timestamp': datetime.utcnow().isoformat()})
            
            elif message_type == 'request_mood_update':
                # Client requesting latest mood data
                await send_mood_update(user_id)
            
            elif message_type == 'chat_message':
                # Chat message from user to twin
                user_message = message.get('message', '')
                if not user_message:
                    await websocket.send_json({
                        'type': 'chat_response',
                        'data': {
                            'text': "I received your message but it seems empty. Could you try again?",
                            'timestamp': datetime.utcnow().isoformat()
                        }
                    })
                else:
                    print(f"💬 Chat message from {user_id}: {user_message[:50]}...")
                    response = await generate_chat_response(user_id, user_message)
                    await manager.send_personal_message({
                        'type': 'chat_response',
                        'data': response
                    }, user_id)
            
            elif message_type == 'subscribe':
                # Client wants to subscribe to updates
                await websocket.send_json({
                    'type': 'subscribed',
                    'channels': message.get('channels', [])
                })
            
            else:
                print(f"⚠️ Unknown message type: {message_type}")
                await websocket.send_json({
                    'type': 'error',
                    'message': f'Unknown message type: {message_type}'
                })
            
    except WebSocketDisconnect:
        print(f"🔌 WebSocket disconnected: {user_id}")
        manager.disconnect(websocket, user_id)
    except Exception as e:
        print(f"❌ WebSocket error for {user_id}: {e}")
        import traceback
        traceback.print_exc()
        manager.disconnect(websocket, user_id)


async def send_mood_update(user_id: str):
    """Send updated mood DNA data to client"""
    try:
        history = await get_user_emotion_history(user_id, days=7)
        
        if history:
            mood_dna_data = generate_mood_dna_data(history)
            burnout_index = fusion_model.calculate_burnout_index(history)
            energy_pattern = fusion_model.extract_energy_pattern(history)
            
            await manager.broadcast_to_user(user_id, {
                'type': 'mood_update',
                'data': {
                    'mood_timeline': mood_dna_data['timeline'],
                    'dominant_emotions': mood_dna_data['dominant_emotions'],
                    'burnout_index': burnout_index,
                    'energy_pattern': energy_pattern
                }
            })
    except Exception as e:
        print(f"Error sending mood update: {e}")


async def notify_emotion_logged(user_id: str, emotion_data: dict):
    """Notify client that new emotion was logged"""
    await manager.broadcast_to_user(user_id, {
        'type': 'emotion_logged',
        'data': emotion_data
    })
    
    # Also send updated mood data
    await send_mood_update(user_id)


async def generate_chat_response(user_id: str, user_message: str):
    """Generate AI chat response based on user's emotional patterns"""
    try:
        history = await get_user_emotion_history(user_id, days=7)
        
        # Generate contextual response based on emotional data
        lower_message = user_message.lower()
        
        response_text = ""
        
        # Get most recent emotion context
        most_recent_emotion = history[-1].get('emotion') if history else None
        most_recent_text = history[-1].get('text_content', '') if history else ''
        
        if 'how' in lower_message and 'feel' in lower_message:
            if history:
                recent_emotions = [e.get('emotion') for e in history[-5:]]
                dominant = max(set(recent_emotions), key=recent_emotions.count) if recent_emotions else 'neutral'
                
                # Give more specific response based on recent emotion
                if dominant == 'sadness':
                    response_text = f"I've noticed you've been feeling sadness lately. You've logged {len(recent_emotions)} emotions recently, and sadness was the most common. Remember, it's okay to feel this way, and there are people who care."
                elif dominant == 'anger':
                    response_text = f"Your recent patterns show frustration. You've experienced anger in {recent_emotions.count('anger')} out of {len(recent_emotions)} recent entries. Consider what's triggering these feelings."
                elif dominant == 'fear':
                    response_text = f"You've been experiencing anxiety lately. I notice fear has appeared in your recent emotions. Try deep breathing or talking to someone you trust."
                elif dominant == 'joy':
                    response_text = f"Great news! Your recent emotional pattern shows joy! You've been feeling positive emotions recently. Keep nurturing what brings you happiness."
                else:
                    response_text = f"Based on your recent emotional patterns, you've been experiencing {dominant} moments."
            else:
                response_text = "I'm still learning about your emotional patterns. Share more about how you're feeling!"
        
        elif 'burnout' in lower_message or 'tired' in lower_message:
            if history:
                burnout_index = fusion_model.calculate_burnout_index(history)
                if burnout_index > 60:
                    response_text = f"Your burnout risk is high ({burnout_index:.0f}/100). I've noticed sustained negative emotions in your data. It's crucial to prioritize self-care and consider speaking with a mental health professional."
                elif burnout_index > 30:
                    response_text = f"Your burnout risk is moderate ({burnout_index:.0f}/100). I notice patterns suggesting elevated stress. Consider mindful breaks and self-compassion."
                else:
                    response_text = f"Your burnout risk is relatively low ({burnout_index:.0f}/100). Keep taking care of yourself!"
            else:
                response_text = "I understand you're feeling tired. Make sure to rest and recharge."
        
        elif 'happy' in lower_message or 'joy' in lower_message:
            if most_recent_emotion == 'joy':
                response_text = "Your joy moments are beautiful to witness! I can see from your recent logs that you've been experiencing positive emotions. Keep nurturing what brings you happiness."
            else:
                response_text = "Even though you haven't logged joy recently, remembering what brings you happiness can help. What activities or people make you feel most joyful?"
        
        elif 'sad' in lower_message or 'down' in lower_message or 'not in a good mood' in lower_message:
            if most_recent_emotion in ['sadness', 'anger', 'fear']:
                response_text = f"I can see from your recent entries that you've been feeling {most_recent_emotion}. You've logged emotions that show you're going through a challenging time. Remember, it's okay to feel this way, and there are people who care about you."
            else:
                response_text = "I'm sorry you're feeling down. Your emotional data shows resilience - you've worked through difficult feelings before. What's been weighing on you?"
        
        elif 'future' in lower_message or 'predict' in lower_message:
            if history and len(history) >= 5:
                try:
                    prediction = fusion_model.predict_next_emotion(history, 24)
                    response_text = f"Based on your emotional patterns, I predict you'll likely feel {prediction['predicted_emotion']} in the next 24 hours ({prediction['confidence']*100:.0f}% confidence)."
                except:
                    response_text = "I need more data to make accurate predictions. Keep logging your emotions!"
            else:
                response_text = "I need more emotional data to predict your future state. Keep logging your feelings!"
        
        elif 'help' in lower_message or 'advice' in lower_message:
            if history:
                recent_emotions = [e.get('emotion') for e in history[-3:]]
                if 'sadness' in recent_emotions or 'anger' in recent_emotions:
                    response_text = "I recommend: 1) Take time for yourself, 2) Talk to someone you trust, 3) Try journaling or meditation, 4) Consider professional support if needed. You're not alone."
                else:
                    response_text = "I recommend: 1) Regular emotional check-ins, 2) Physical activity during low-energy periods, 3) Connecting with supportive people, and 4) Mindfulness practices."
            else:
                response_text = "I recommend: 1) Regular emotional check-ins, 2) Physical activity, 3) Connecting with others, and 4) Mindfulness practices."
        
        else:
            # Analyze the current message itself
            if history:
                total_entries = len(history)
                unique_emotions = len(set([e.get('emotion') for e in history]))
                
                # Use most recent emotion context
                if most_recent_emotion:
                    response_text = f"Looking at your emotional data, your most recent entry showed {most_recent_emotion}. You've logged {total_entries} emotions total with {unique_emotions} different emotional states. Tell me more about what's on your mind."
                else:
                    response_text = f"You've logged {total_entries} emotions with {unique_emotions} unique states. What specific aspect of your emotional life would you like to explore?"
            else:
                response_text = "I'm here to understand your emotions better. Share more about how you're feeling, and I'll provide insights based on your patterns."
        
        return {
            'text': response_text,
            'timestamp': datetime.utcnow().isoformat(),
            'sender': 'twin'
        }
    
    except Exception as e:
        print(f"Error generating chat response: {e}")
        import traceback
        traceback.print_exc()
        return {
            'text': "I'm experiencing some difficulty. Could you try rephrasing your question?",
            'timestamp': datetime.utcnow().isoformat(),
            'sender': 'twin'
        }




