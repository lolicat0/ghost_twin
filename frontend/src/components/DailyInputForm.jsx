import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Mic, Camera, Loader, CheckCircle, Sparkles, X } from 'lucide-react'
import axios from 'axios'
import VoiceRecorder from './VoiceRecorder'
import CameraCapture from './CameraCapture'

export default function DailyInputForm({ userId, onEmotionAnalyzed }) {
  const [activeTab, setActiveTab] = useState('text')
  const [textInput, setTextInput] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const analyzeText = async () => {
    if (!textInput.trim()) {
      setError('Please enter some text')
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setResult(null)

    try {
      const response = await axios.post('http://localhost:8000/api/v1/analyze_text', {
        text: textInput,
        user_id: userId,
        metadata: { source: 'daily_journal' }
      })

      setResult(response.data)
      setTextInput('')
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setResult(null)
      }, 5000)
      
      if (onEmotionAnalyzed) {
        onEmotionAnalyzed(response.data)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleVoiceAnalyzed = (result) => {
    setResult(result)
    setTimeout(() => {
      setResult(null)
    }, 5000)
    
    if (onEmotionAnalyzed) {
      onEmotionAnalyzed(result)
    }
  }

  const handleCameraAnalyzed = (result) => {
    setResult(result)
    setTimeout(() => {
      setResult(null)
    }, 5000)
    
    if (onEmotionAnalyzed) {
      onEmotionAnalyzed(result)
    }
  }

  const clearResult = () => {
    setResult(null)
    setError(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-effect rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-6 h-6 text-purple-500 dark:text-purple-400" />
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">How are you feeling?</h3>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => {
            setActiveTab('text')
            clearResult()
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'text'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-white border border-gray-200 dark:border-gray-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          Text
        </button>
        <button
          onClick={() => {
            setActiveTab('voice')
            clearResult()
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'voice'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-white border border-gray-200 dark:border-gray-700'
          }`}
        >
          <Mic className="w-4 h-4" />
          Voice
        </button>
        <button
          onClick={() => {
            setActiveTab('camera')
            clearResult()
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'camera'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-white border border-gray-200 dark:border-gray-700'
          }`}
        >
          <Camera className="w-4 h-4" />
          Camera
        </button>
      </div>

      {/* Text Input Tab */}
      {activeTab === 'text' && (
        <div>
          <textarea
            value={textInput}
            onChange={(e) => {
              setTextInput(e.target.value)
              if (error) setError(null)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                analyzeText()
              }
            }}
            placeholder="Write about your day, feelings, or thoughts... The more you share, the better I understand you."
            className="w-full h-40 bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none transition-all"
            disabled={isAnalyzing}
          />
          
          <div className="mt-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {textInput.length} characters
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Press Ctrl+Enter to analyze
              </p>
            </div>
            <motion.button
              onClick={analyzeText}
              disabled={isAnalyzing || !textInput.trim()}
              whileHover={{ scale: !isAnalyzing && textInput.trim() ? 1.02 : 1 }}
              whileTap={{ scale: !isAnalyzing && textInput.trim() ? 0.98 : 1 }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg px-6 py-2.5 font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-white shadow-lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Analyze Emotion
                </>
              )}
            </motion.button>
          </div>
        </div>
      )}

      {/* Voice Input Tab */}
      {activeTab === 'voice' && (
        <VoiceRecorder userId={userId} onRecordingComplete={handleVoiceAnalyzed} />
      )}

      {/* Camera Input Tab */}
      {activeTab === 'camera' && (
        <CameraCapture userId={userId} onCaptureComplete={handleCameraAnalyzed} />
      )}

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 bg-red-50 dark:bg-red-900/30 border-2 border-red-500 dark:border-red-700 rounded-xl p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <X className="w-3 h-3 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-red-800 dark:text-red-300 mb-1">Error</h4>
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 bg-green-50 dark:bg-green-900/30 border-2 border-green-500 dark:border-green-700 rounded-xl p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-green-800 dark:text-green-300 mb-2 text-lg">
                    Emotion Analyzed Successfully!
                  </h4>
                  <div className="space-y-1">
                    <p className="text-gray-700 dark:text-gray-300">
                      Detected emotion: <span className="font-bold capitalize text-purple-600 dark:text-purple-400 text-lg">{result.emotion}</span>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Confidence: <span className="font-semibold">{(result.confidence * 100).toFixed(0)}%</span> | 
                      Sentiment: <span className="font-semibold capitalize">{result.sentiment}</span>
                    </p>
                    {result.all_scores && (
                      <div className="mt-2 pt-2 border-t border-green-200 dark:border-green-800">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">All emotion scores:</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(result.all_scores)
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 5)
                            .map(([emotion, score]) => (
                              <span 
                                key={emotion}
                                className="text-xs px-2 py-1 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700"
                              >
                                {emotion}: {(score * 100).toFixed(0)}%
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setResult(null)}
                className="text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
