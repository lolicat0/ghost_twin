/**
 * WebSocket Utility Functions
 * Centralized WebSocket connection management
 */

let wsConnection = null
let subscribers = new Map()
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 5
const RECONNECT_INTERVAL = 3000

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws'

export function connectWebSocket(userId) {
  if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
    return wsConnection
  }

  try {
    const ws = new WebSocket(`${WS_URL}/${userId}`)
    
    ws.onopen = () => {
      console.log('WebSocket connected')
      reconnectAttempts = 0
      
      // Subscribe to updates
      ws.send(JSON.stringify({
        type: 'subscribe',
        channels: ['emotion_logged', 'mood_update', 'chat_response']
      }))
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        // Notify all subscribers
        subscribers.forEach((callback) => {
          callback(data)
        })
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected')
      wsConnection = null
      
      // Attempt to reconnect
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        setTimeout(() => {
          reconnectAttempts++
          connectWebSocket(userId)
        }, RECONNECT_INTERVAL)
      }
    }

    wsConnection = ws
    return ws
  } catch (error) {
    console.error('WebSocket connection error:', error)
    return null
  }
}

export function subscribe(callback) {
  const id = Math.random().toString(36).substr(2, 9)
  subscribers.set(id, callback)
  return () => subscribers.delete(id)
}

export function sendWebSocketMessage(message) {
  if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
    wsConnection.send(JSON.stringify(message))
    return true
  }
  return false
}

export function disconnectWebSocket() {
  if (wsConnection) {
    wsConnection.close()
    wsConnection = null
  }
  subscribers.clear()
}





