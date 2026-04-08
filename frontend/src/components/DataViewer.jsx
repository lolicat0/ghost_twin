import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Database, Eye, ChevronRight, Copy, CheckCircle } from 'lucide-react'
import axios from 'axios'

export default function DataViewer({ userId }) {
  const [rawData, setRawData] = useState(null)
  const [dataFlow, setDataFlow] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('flow')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (userId) {
      loadDataFlow()
    }
  }, [userId])

  const loadRawData = async () => {
    setLoading(true)
    try {
      const response = await axios.get(
        `http://localhost:8000/api/v1/view_raw_data/${userId}?days=30`
      )
      setRawData(response.data)
    } catch (error) {
      console.error('Error loading raw data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadDataFlow = async () => {
    setLoading(true)
    try {
      const response = await axios.get(
        `http://localhost:8000/api/v1/view_data_flow/${userId}`
      )
      setDataFlow(response.data)
    } catch (error) {
      console.error('Error loading data flow:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(JSON.stringify(text, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading && !dataFlow) {
    return (
      <div className="glass-effect rounded-2xl p-8 text-center">
        <p className="text-gray-400">Loading data...</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <Database className="w-6 h-6 text-purple-500" />
        <h2 className="text-2xl font-bold">Data Storage & Flow</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => {
            setActiveTab('flow')
            if (!dataFlow) loadDataFlow()
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'flow'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          Data Flow
        </button>
        <button
          onClick={() => {
            setActiveTab('raw')
            if (!rawData) loadRawData()
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'raw'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          Raw Data
        </button>
      </div>

      {/* Data Flow View */}
      {activeTab === 'flow' && dataFlow && (
        <div className="space-y-6">
          {Object.entries(dataFlow.data_flow || {}).map(([step, data], idx) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gray-800 rounded-xl p-5 border border-gray-700"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                    {idx + 1}
                  </div>
                  <h3 className="text-lg font-bold text-white">{data.description}</h3>
                </div>
                <button
                  onClick={() => copyToClipboard(data)}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>

              {data.process && (
                <ul className="list-disc list-inside space-y-1 mb-4 text-gray-300">
                  {data.process.map((item, i) => (
                    <li key={i} className="text-sm">{item}</li>
                  ))}
                </ul>
              )}

              {data.result && (
                <div className="bg-gray-900 rounded-lg p-4 mt-4">
                  <pre className="text-xs text-gray-300 overflow-x-auto">
                    {JSON.stringify(data.result, null, 2)}
                  </pre>
                </div>
              )}

              {data.data_accessed && (
                <div className="bg-gray-900 rounded-lg p-4 mt-4">
                  <p className="text-sm text-gray-400 mb-2">Data accessed by chatbot:</p>
                  <pre className="text-xs text-gray-300 overflow-x-auto">
                    {JSON.stringify(data.data_accessed, null, 2)}
                  </pre>
                </div>
              )}

              {data.chatbot_use_cases && (
                <div className="mt-4">
                  <p className="text-sm text-gray-400 mb-2">How chatbot uses this:</p>
                  <ul className="space-y-1">
                    {data.chatbot_use_cases.map((useCase, i) => (
                      <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>{useCase}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Raw Data View */}
      {activeTab === 'raw' && rawData && (
        <div className="space-y-4">
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <h3 className="text-lg font-bold mb-3">Database Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Total Records</p>
                <p className="text-2xl font-bold text-purple-400">{rawData.total_records}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Date Range</p>
                <p className="text-2xl font-bold text-purple-400">{rawData.date_range_days} days</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <h3 className="text-lg font-bold mb-3">Raw Emotion Records</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {rawData.raw_emotions && rawData.raw_emotions.length > 0 ? (
                rawData.raw_emotions.map((emotion, idx) => (
                  <div key={idx} className="bg-gray-900 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-semibold text-purple-400 capitalize">
                          {emotion.emotion}
                        </span>
                        <span className="text-gray-400 text-sm ml-2">
                          {(emotion.confidence * 100).toFixed(0)}% confidence
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(emotion.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      Source: {emotion.modality || 'unknown'} | 
                      User: {emotion.user_id}
                    </div>
                    {emotion.all_scores && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer">
                          View all emotion scores
                        </summary>
                        <pre className="text-xs text-gray-400 mt-2 overflow-x-auto">
                          {JSON.stringify(emotion.all_scores, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No emotion data stored yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {!dataFlow && activeTab === 'flow' && (
        <div className="text-center py-8 text-gray-400">
          No data found. Log some emotions first!
        </div>
      )}
    </motion.div>
  )
}


