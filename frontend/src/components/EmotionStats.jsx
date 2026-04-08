import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Activity, Zap, Brain, Heart } from 'lucide-react'

export default function EmotionStats({ stats, burnoutIndex, energyPattern }) {
  const getBurnoutColor = (index) => {
    if (index < 30) return 'text-green-400'
    if (index < 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getBurnoutMessage = (index) => {
    if (index < 30) return 'Low Risk'
    if (index < 60) return 'Moderate'
    return 'High Risk'
  }

  return (
    <div className="space-y-6">
      {/* Burnout Risk Gauge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-effect rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-bold">Burnout Risk Index</h3>
        </div>
        
        <div className="relative">
          <div className="text-5xl font-bold mb-2">
            <span className={getBurnoutColor(burnoutIndex)}>
              {burnoutIndex.toFixed(0)}
            </span>
            <span className="text-2xl text-gray-400">/100</span>
          </div>
          <p className={`text-lg font-medium ${getBurnoutColor(burnoutIndex)}`}>
            {getBurnoutMessage(burnoutIndex)}
          </p>
          
          {/* Progress Bar */}
          <div className="mt-4 bg-gray-700 rounded-full h-4 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${burnoutIndex}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full ${
                burnoutIndex < 30 ? 'bg-green-500' :
                burnoutIndex < 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
            />
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Entries */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-effect rounded-xl p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Entries</p>
              <p className="text-3xl font-bold mt-1">{stats?.total_entries || 0}</p>
            </div>
            <Activity className="w-10 h-10 text-blue-400" />
          </div>
        </motion.div>

        {/* Emotion Diversity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-effect rounded-xl p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Unique Emotions</p>
              <p className="text-3xl font-bold mt-1">{stats?.unique_emotions || 0}</p>
            </div>
            <Zap className="w-10 h-10 text-yellow-400" />
          </div>
        </motion.div>
      </div>

      {/* Energy Pattern */}
      {energyPattern && energyPattern.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="glass-effect rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-yellow-400" />
            <h3 className="text-xl font-bold">Energy Pattern</h3>
          </div>
          <p className="text-gray-400 text-sm mb-4">Your emotional energy by time of day</p>
          
          <div className="space-y-3">
            {energyPattern.map((pattern, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-20 capitalize text-sm">{pattern.time_period}</div>
                <div className="flex-1 bg-gray-700 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pattern.energy_level * 100}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                  />
                </div>
                <div className="w-12 text-sm text-gray-400">
                  {(pattern.energy_level * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="glass-effect rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Heart className="w-6 h-6 text-pink-400" />
          <h3 className="text-xl font-bold">Quick Insights</h3>
        </div>
        
        <div className="space-y-3">
          {stats?.most_common && stats.most_common.length > 0 && (
            <div className="flex items-start gap-2">
              <TrendingUp className="w-5 h-5 text-green-400 mt-0.5" />
              <p className="text-gray-300">
                Your most frequent emotion: <span className="font-semibold text-white capitalize">{stats.most_common[0][0]}</span>
              </p>
            </div>
          )}
          
          <div className="flex items-start gap-2">
            <Activity className="w-5 h-5 text-blue-400 mt-0.5" />
            <p className="text-gray-300">
              You've been tracking for <span className="font-semibold text-white">{stats?.data_span_days || 0} days</span>
            </p>
          </div>
          
          {burnoutIndex > 60 && (
            <div className="flex items-start gap-2">
              <TrendingDown className="w-5 h-5 text-red-400 mt-0.5" />
              <p className="text-gray-300">
                Consider taking breaks and practicing self-care
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}


