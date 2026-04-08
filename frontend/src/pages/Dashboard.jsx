import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Brain, LogOut, Sparkles, TrendingUp, Wifi, WifiOff, User } from 'lucide-react'
import MoodDNA from '../components/MoodDNA'
import EmotionStats from '../components/EmotionStats'
import ChatTwin from '../components/ChatTwin'
import DailyInputForm from '../components/DailyInputForm'
import DataViewer from '../components/DataViewer'
import { useWebSocket } from '../hooks/useWebSocket'
import ThemeToggle from '../components/ThemeToggle'

export default function Dashboard({ userId, onLogout }) {
  const navigate = useNavigate()
  const [moodData, setMoodData] = useState(null)
  const [stats, setStats] = useState(null)
  const [burnoutIndex, setBurnoutIndex] = useState(0)
  const [energyPattern, setEnergyPattern] = useState([])
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState('overview')

  // WebSocket connection for real-time updates
  const { isConnected, lastMessage, sendMessage } = useWebSocket(userId)

  const loadDashboardData = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch mood DNA
      const moodResponse = await axios.get(`http://localhost:8000/api/v1/get_mood_dna/${userId}?days=7`)
      setMoodData(moodResponse.data)
      setBurnoutIndex(moodResponse.data.burnout_index)
      setEnergyPattern(moodResponse.data.energy_pattern)

      // Fetch prediction
      try {
        const predictionResponse = await axios.get(
          `http://localhost:8000/api/v1/predict_future_state?user_id=${userId}&hours_ahead=24`
        )
        setPrediction(predictionResponse.data)
      } catch (err) {
        console.log('Prediction not available (need more data)')
      }

      // Mock stats (in production, would fetch from API)
      setStats({
        total_entries: moodResponse.data.mood_timeline?.length || 0,
        unique_emotions: Object.keys(moodResponse.data.dominant_emotions || {}).length,
        most_common: Object.entries(moodResponse.data.dominant_emotions || {})
          .sort(([, a], [, b]) => b - a)
          .map(([emotion, count]) => [emotion, count]),
        data_span_days: 7
      })

    } catch (error) {
      console.error('Error loading dashboard data:', error)
      // Use mock data if API fails
      setMoodData({
        timeline: [],
        dominant_emotions: {}
      })
      setBurnoutIndex(25)
      setEnergyPattern([
        { time_period: 'morning', energy_level: 0.8, sample_count: 5 },
        { time_period: 'afternoon', energy_level: 0.6, sample_count: 8 },
        { time_period: 'evening', energy_level: 0.5, sample_count: 6 },
        { time_period: 'night', energy_level: 0.3, sample_count: 3 }
      ])
      setStats({
        total_entries: 0,
        unique_emotions: 0,
        most_common: [],
        data_span_days: 7
      })
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  // Handle WebSocket messages for real-time updates
  useEffect(() => {
    if (!lastMessage) return

    const { type, data } = lastMessage

    if (type === 'emotion_logged') {
      // New emotion logged - refresh dashboard data
      console.log('New emotion logged:', data)
      setTimeout(() => {
        loadDashboardData()
      }, 500)
    } else if (type === 'mood_update') {
      // Real-time mood update
      console.log('Mood update received:', data)
      if (data.mood_timeline) {
        setMoodData(prev => ({
          ...prev,
          timeline: data.mood_timeline,
          dominant_emotions: data.dominant_emotions
        }))
      }
      if (data.burnout_index !== undefined) {
        setBurnoutIndex(data.burnout_index)
      }
      if (data.energy_pattern) {
        setEnergyPattern(data.energy_pattern)
      }
      
      // Update stats
      setStats(prev => ({
        ...prev,
        total_entries: data.mood_timeline?.length || 0,
        unique_emotions: Object.keys(data.dominant_emotions || {}).length,
        most_common: Object.entries(data.dominant_emotions || {})
          .sort(([, a], [, b]) => b - a)
          .map(([emotion, count]) => [emotion, count])
      }))
    }
  }, [lastMessage, loadDashboardData])

  const handleEmotionAnalyzed = (result) => {
    // Refresh dashboard data after new emotion is logged
    setTimeout(() => {
      loadDashboardData()
    }, 500)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your emotional data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass-effect border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Ghostnet
                </h1>
                <p className="text-xs text-gray-400">Your Emotional Mirror</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                {isConnected ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-500 dark:text-green-400" />
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">Live</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-gray-500" />
                    <span className="text-xs text-gray-500 font-medium">Offline</span>
                  </>
                )}
              </div>
              <ThemeToggle />
              <button
                onClick={() => navigate('/profile')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Profile"
              >
                <User className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Welcome back!</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">User ID: {userId}</p>
              </div>
              <button 
                onClick={() => {
                  if (onLogout) {
                    onLogout()
                  }
                  navigate('/login')
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveView('overview')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeView === 'overview'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-white border border-gray-200 dark:border-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveView('input')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeView === 'input'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-white border border-gray-200 dark:border-gray-700'
            }`}
          >
            Log Emotion
          </button>
          <button
            onClick={() => setActiveView('twin')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeView === 'twin'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-white border border-gray-200 dark:border-gray-700'
            }`}
          >
            Emotional Twin
          </button>
          <button
            onClick={() => setActiveView('data')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeView === 'data'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-white border border-gray-200 dark:border-gray-700'
            }`}
          >
            View Data
          </button>
        </div>

        {/* Overview View */}
        {activeView === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Mood DNA */}
            <div className="lg:col-span-2 space-y-6">
              {/* Prediction Banner */}
              {prediction && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-effect rounded-xl p-5 border-l-4 border-purple-500"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-purple-400" />
                    <div>
                      <h3 className="font-semibold">Future Prediction</h3>
                      <p className="text-sm text-gray-400">
                        Next 24 hours: You'll likely feel{' '}
                        <span className="capitalize font-medium text-purple-400">
                          {prediction.predicted_emotion}
                        </span>{' '}
                        ({(prediction.confidence * 100).toFixed(0)}% confidence)
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              <MoodDNA moodData={moodData} />

              {/* Quick Actions */}
              <div className="glass-effect rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setActiveView('input')}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-4 hover:opacity-90 transition-opacity text-left"
                  >
                    <TrendingUp className="w-6 h-6 mb-2" />
                    <p className="font-semibold">Log Today's Mood</p>
                    <p className="text-xs text-gray-300">Share your feelings</p>
                  </button>
                  <button
                    onClick={() => setActiveView('twin')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 hover:opacity-90 transition-opacity text-left"
                  >
                    <Brain className="w-6 h-6 mb-2" />
                    <p className="font-semibold">Talk to Twin</p>
                    <p className="text-xs text-gray-300">Get insights</p>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Stats */}
            <div>
              <EmotionStats 
                stats={stats}
                burnoutIndex={burnoutIndex}
                energyPattern={energyPattern}
              />
            </div>
          </div>
        )}

        {/* Input View */}
        {activeView === 'input' && (
          <div className="max-w-4xl mx-auto">
            <DailyInputForm userId={userId} onEmotionAnalyzed={handleEmotionAnalyzed} />
          </div>
        )}

        {/* Twin Chat View */}
        {activeView === 'twin' && (
          <div className="max-w-4xl mx-auto">
            <ChatTwin userId={userId} />
          </div>
        )}

        {/* Data Viewer */}
        {activeView === 'data' && (
          <div className="max-w-6xl mx-auto">
            <DataViewer userId={userId} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 py-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-500 text-sm">
          <p>Ghostnet - Understanding your emotions better than you do</p>
          <p className="mt-2">Your data is private and encrypted. Delete anytime.</p>
        </div>
      </footer>
    </div>
  )
}


