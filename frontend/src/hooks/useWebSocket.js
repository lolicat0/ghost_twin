import { useEffect, useRef, useState, useCallback } from 'react'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws'

export function useWebSocket(userId, options = {}) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState(null)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const wsRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  const messageQueueRef = useRef([])

  const maxReconnectAttempts = options.maxReconnectAttempts || 5
  const reconnectInterval = options.reconnectInterval || 3000

  const connect = useCallback(() => {
    if (!userId) {
      console.warn('WebSocket: No userId provided')
      return
    }

    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close()
    }

    try {
      const wsUrl = `${WS_URL}/${userId}`
      console.log(`Connecting to WebSocket: ${wsUrl}`)
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('✅ WebSocket connected successfully')
        setIsConnected(true)
        setReconnectAttempts(0)
        
        // Send queued messages
        messageQueueRef.current.forEach(msg => {
          try {
            ws.send(JSON.stringify(msg))
          } catch (err) {
            console.error('Error sending queued message:', err)
          }
        })
        messageQueueRef.current = []

        // Subscribe to updates
        try {
          ws.send(JSON.stringify({
            type: 'subscribe',
            channels: ['emotion_logged', 'mood_update', 'chat_response']
          }))
        } catch (err) {
          console.error('Error sending subscription:', err)
        }
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('📨 WebSocket message received:', data.type)
          
          // Handle pong for keepalive
          if (data.type === 'pong') {
            return
          }
          
          setLastMessage(data)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error)
        setIsConnected(false)
      }

      ws.onclose = (event) => {
        console.log('🔌 WebSocket disconnected', event.code, event.reason)
        setIsConnected(false)
        
        // Don't reconnect if it was a clean close or we've exceeded attempts
        if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
          const delay = reconnectInterval * (reconnectAttempts + 1)
          console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})...`)
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1)
            connect()
          }, delay)
        } else if (reconnectAttempts >= maxReconnectAttempts) {
          console.error('❌ Max reconnection attempts reached. Please refresh the page.')
        }
      }
    } catch (error) {
      console.error('❌ WebSocket connection error:', error)
      setIsConnected(false)
    }
  }, [userId, reconnectAttempts, maxReconnectAttempts, reconnectInterval])

  const sendMessage = useCallback((message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(message))
        console.log('📤 WebSocket message sent:', message.type)
      } catch (error) {
        console.error('Error sending WebSocket message:', error)
        // Queue message for retry
        messageQueueRef.current.push(message)
      }
    } else {
      // Queue message if not connected
      console.warn('WebSocket not connected, queuing message:', message.type)
      messageQueueRef.current.push(message)
      if (!isConnected && reconnectAttempts < maxReconnectAttempts) {
        connect()
      }
    }
  }, [isConnected, reconnectAttempts, maxReconnectAttempts, connect])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setIsConnected(false)
  }, [])

  // Keepalive ping
  useEffect(() => {
    if (!isConnected) return

    const pingInterval = setInterval(() => {
      sendMessage({ type: 'ping' })
    }, 30000) // Ping every 30 seconds

    return () => clearInterval(pingInterval)
  }, [isConnected, sendMessage])

  // Connect on mount and when userId changes
  useEffect(() => {
    if (userId) {
      connect()
    }

    return () => {
      disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  return {
    isConnected,
    lastMessage,
    sendMessage,
    disconnect,
    connect
  }
}

