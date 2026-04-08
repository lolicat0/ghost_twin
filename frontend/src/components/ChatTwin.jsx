import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User } from 'lucide-react'
import { useWebSocket } from '../hooks/useWebSocket'

export default function ChatTwin({ userId }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'twin',
      text: "Hello! I'm your Emotional Twin — a reflection of your emotional patterns. I understand you better than you think. Ask me anything about your emotional state!",
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const timeoutRef = useRef(null)

  // WebSocket hook for real-time chat
  const { isConnected, lastMessage, sendMessage } = useWebSocket(userId)

  // Auto-scroll to bottom when messages update
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (!lastMessage) return

    const { type, data } = lastMessage

    if (type === 'chat_response') {
      setIsTyping(false)
      // Clear timeout since we got a response
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      const responseText = data?.text || data?.message || "I'm here with you, but I didn't quite catch that."
      setMessages(prev => [
        ...prev,
        {
          id: prev.length + 1,
          sender: 'twin',
          text: responseText,
          timestamp: data?.timestamp ? new Date(data.timestamp) : new Date()
        }
      ])
    }
  }, [lastMessage])

  // Handle send action
  const handleSend = useCallback(() => {
    const text = inputValue.trim()
    if (!text) return

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    // Add user message immediately
    setMessages(prev => [
      ...prev,
      {
        id: prev.length + 1,
        sender: 'user',
        text,
        timestamp: new Date()
      }
    ])

    setInputValue('')
    setIsTyping(true)

    // Always try to send via WebSocket - let it queue if not connected
    try {
      sendMessage({
        type: 'chat_message',
        message: text
      })
      
      // Set a timeout to show offline message if no response
      timeoutRef.current = setTimeout(() => {
        setIsTyping(prev => {
          if (prev) {
            // Only show offline message if still typing (no response received)
            setMessages(prevMsgs => [
              ...prevMsgs,
              {
                id: prevMsgs.length + 1,
                sender: 'twin',
                text: "I'm processing your message but it's taking longer than expected. Please make sure the backend is running and try again.",
                timestamp: new Date()
              }
            ])
            return false
          }
          return prev
        })
        timeoutRef.current = null
      }, 5000) // 5 second timeout
    } catch (error) {
      console.error('Error sending chat message:', error)
      setIsTyping(false)
      setMessages(prev => [
        ...prev,
        {
          id: prev.length + 1,
          sender: 'twin',
          text: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date()
        }
      ])
    }
  }, [inputValue, isConnected, sendMessage])

  // Send message on Enter (without Shift)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="glass-effect rounded-2xl flex flex-col h-[600px] shadow-lg border border-gray-700"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Your Emotional Twin</h3>
              <p className="text-sm text-gray-400">AI trained on your emotional patterns</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-800 border border-gray-700">
            {isConnected ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-400 font-medium">Live</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-gray-500 rounded-full" />
                <span className="text-xs text-gray-500 font-medium">Connecting...</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Messages Section */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-blue-500'
                    : 'bg-gradient-to-br from-purple-500 to-pink-500'
                }`}
              >
                {msg.sender === 'user' ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-white" />
                )}
              </div>

              <div
                className={`max-w-[70%] ${
                  msg.sender === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                <div
                  className={`rounded-2xl px-4 py-3 break-words ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-100'
                  }`}
                >
                  {msg.text}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Animation */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-gray-800 rounded-2xl px-4 py-3 flex items-center gap-1">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Section */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your emotional twin anything..."
            className="flex-1 bg-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl px-6 py-3 font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
