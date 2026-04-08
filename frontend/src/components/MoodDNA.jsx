import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'
import { format } from 'date-fns'

const emotionColors = {
  joy: '#FFD700',
  sadness: '#4169E1',
  anger: '#DC143C',
  fear: '#9370DB',
  surprise: '#FF69B4',
  neutral: '#A9A9A9',
  love: '#FF1493'
}

export default function MoodDNA({ moodData }) {
  if (!moodData || !moodData.timeline || moodData.timeline.length === 0) {
    return (
      <div className="glass-effect rounded-2xl p-8 text-center">
        <p className="text-gray-400">No mood data yet. Start logging your emotions!</p>
      </div>
    )
  }

  // Prepare chart data
  const chartData = moodData.timeline.map(item => {
    try {
      const date = new Date(item.timestamp)
      return {
        time: format(date, 'MMM dd HH:mm'),
        emotion: item.emotion,
        confidence: (item.confidence * 100).toFixed(0),
        color: emotionColors[item.emotion] || '#A9A9A9'
      }
    } catch {
      return null
    }
  }).filter(Boolean)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-effect rounded-2xl p-6"
    >
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Your Mood DNA
        </h2>
        <p className="text-gray-400">Your unique emotional fingerprint over time</p>
      </div>

      {/* Emotion Timeline */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="time" 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
          />
          <YAxis 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
            label={{ value: 'Confidence %', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #374151',
              borderRadius: '8px'
            }}
            labelStyle={{ color: '#F3F4F6' }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="confidence" 
            stroke="#8B5CF6" 
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Emotion Trail */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Recent Emotional Journey</h3>
        <div className="flex flex-wrap gap-2">
          {moodData.timeline.slice(-10).map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="px-4 py-2 rounded-full text-sm font-medium"
              style={{ 
                backgroundColor: `${emotionColors[item.emotion]}30`,
                color: emotionColors[item.emotion],
                border: `2px solid ${emotionColors[item.emotion]}`
              }}
            >
              {item.emotion}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Dominant Emotions */}
      {moodData.dominant_emotions && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Emotion Distribution</h3>
          <div className="space-y-2">
            {Object.entries(moodData.dominant_emotions)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([emotion, percentage]) => (
                <div key={emotion} className="flex items-center gap-3">
                  <div className="w-24 capitalize text-sm">{emotion}</div>
                  <div className="flex-1 bg-gray-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: emotionColors[emotion] }}
                    />
                  </div>
                  <div className="w-12 text-sm text-gray-400">
                    {(percentage * 100).toFixed(0)}%
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}


