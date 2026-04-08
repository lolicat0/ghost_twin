# Real-Time Implementation Guide

## Overview
The Ghostnet application now has full real-time functionality using WebSockets. This allows for:
- Instant updates when emotions are logged
- Real-time mood DNA data refresh
- Live chat with the Emotional Twin
- Automatic dashboard updates

## What Was Added

### Backend Changes

1. **WebSocket Router** (`backend/routers/websocket.py`)
   - WebSocket endpoint at `/ws/{user_id}`
   - Real-time connection management
   - Event broadcasting to connected clients
   - Chat message handling

2. **Updated Text Analysis Router** (`backend/routers/analyze_text.py`)
   - Now sends WebSocket notifications when emotions are logged
   - Triggers automatic mood updates

3. **Updated Main App** (`backend/main.py`)
   - Added WebSocket router integration

### Frontend Changes

1. **WebSocket Hook** (`frontend/src/hooks/useWebSocket.js`)
   - Custom React hook for WebSocket connections
   - Automatic reconnection logic
   - Keepalive ping mechanism
   - Message queuing for offline scenarios

2. **Updated Dashboard** (`frontend/src/pages/Dashboard.jsx`)
   - Real-time WebSocket connection indicator
   - Automatic refresh when emotions are logged
   - Live mood updates without page refresh

3. **Updated ChatTwin** (`frontend/src/components/ChatTwin.jsx`)
   - Real-time chat via WebSocket
   - Instant AI responses based on emotional patterns
   - Fallback for offline scenarios

## How It Works

### Real-Time Emotion Logging
1. User submits text/emotion via DailyInputForm
2. Backend analyzes and saves emotion
3. WebSocket notification sent to all connected clients for that user
4. Dashboard automatically refreshes to show new data

### Real-Time Chat
1. User sends message in ChatTwin
2. Message sent via WebSocket to backend
3. Backend generates contextual response based on user's emotional patterns
4. Response sent back via WebSocket
5. Chat updates instantly

### Connection Management
- Automatic reconnection on disconnect (up to 5 attempts)
- Keepalive ping every 30 seconds
- Connection status indicator in dashboard header
- Message queuing when offline

## Testing the Real-Time Features

### 1. Test Emotion Logging
```bash
# Start backend
cd backend
python main.py

# Start frontend (in another terminal)
cd frontend
npm run dev
```

Steps:
1. Open the app at `http://localhost:5173`
2. Log in (demo mode)
3. Navigate to "Log Emotion" tab
4. Enter some text and analyze
5. **Observe**: Dashboard automatically updates without refresh
6. Check browser console for WebSocket messages

### 2. Test Real-Time Chat
1. Navigate to "Emotional Twin" tab
2. Check connection status (should show "Live" with green icon)
3. Send a message like "How am I feeling?"
4. **Observe**: Instant response based on your emotional data
5. Try asking about burnout, future predictions, etc.

### 3. Test Connection Management
1. Open browser DevTools → Network tab
2. Filter by WS (WebSocket)
3. Observe WebSocket connection establishment
4. Check keepalive pings every 30 seconds
5. Try disconnecting network briefly - should auto-reconnect

## WebSocket Message Types

### Client → Server
- `ping` - Keepalive ping
- `request_mood_update` - Request latest mood data
- `chat_message` - Send chat message to twin
- `subscribe` - Subscribe to update channels

### Server → Client
- `pong` - Keepalive response
- `emotion_logged` - New emotion was logged
- `mood_update` - Updated mood DNA data
- `chat_response` - Chat response from twin
- `subscribed` - Subscription confirmation

## Troubleshooting

### WebSocket Not Connecting
- Check backend is running on port 8000
- Verify CORS settings allow WebSocket connections
- Check browser console for connection errors
- Ensure firewall isn't blocking WebSocket connections

### Messages Not Appearing
- Check WebSocket connection status in dashboard header
- Verify userId matches between frontend and backend
- Check browser console for WebSocket messages
- Verify backend WebSocket router is properly included

### Auto-Refresh Not Working
- Check WebSocket connection is established
- Verify `emotion_logged` events are being sent
- Check browser console for WebSocket errors
- Ensure Dashboard component is using the hook correctly

## Architecture

```
Frontend (React)
    │
    ├─► useWebSocket Hook
    │       │
    │       └─► WebSocket Connection
    │               │
    │               └─► Backend (FastAPI)
    │                       │
    │                       ├─► WebSocket Router
    │                       │       │
    │                       │       ├─► Connection Manager
    │                       │       ├─► Message Handler
    │                       │       └─► Chat Response Generator
    │                       │
    │                       └─► Text Analysis Router
    │                               │
    │                               └─► notify_emotion_logged()
```

## Benefits

1. **Instant Updates**: No need to manually refresh the page
2. **Better UX**: Users see changes immediately
3. **Efficient**: Only updates what changed, not entire page
4. **Real-Time Chat**: Natural conversation flow
5. **Scalable**: Can handle multiple users simultaneously

## Future Enhancements

- Voice/Video real-time emotion detection
- Multi-user collaborative sessions
- Real-time emotion sharing with other users
- Push notifications for emotional patterns
- Real-time dashboard sharing





