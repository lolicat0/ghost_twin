import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  User, Mail, Calendar, Settings, Shield, 
  BarChart3, Heart, Brain, ArrowLeft, Edit2,
  Save, X, Bell, Lock, Globe, Moon, Sun
} from 'lucide-react'
import ThemeToggle from '../components/ThemeToggle'
import { useTheme } from '../contexts/ThemeContext'

export default function Profile({ userId, onLogout }) {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const [isEditing, setIsEditing] = useState(false)
  const [userData, setUserData] = useState({
    name: 'Emotional Explorer',
    email: 'user@example.com',
    joinDate: '2024-01-15',
    bio: 'Exploring my emotional patterns and understanding myself better through AI insights.',
    notifications: true,
    privacy: 'public',
    theme: theme
  })

  const [stats, setStats] = useState({
    totalEntries: 0,
    streakDays: 0,
    avgMood: 'Neutral',
    insights: 0
  })

  useEffect(() => {
    // Load user stats
    const savedStats = localStorage.getItem(`userStats_${userId}`)
    if (savedStats) {
      setStats(JSON.parse(savedStats))
    }
    
    // Load user data
    const savedData = localStorage.getItem(`userData_${userId}`)
    if (savedData) {
      setUserData(prev => ({ ...prev, ...JSON.parse(savedData) }))
    }
  }, [userId])

  const handleSave = () => {
    localStorage.setItem(`userData_${userId}`, JSON.stringify(userData))
    setIsEditing(false)
  }

  const handleCancel = () => {
    const savedData = localStorage.getItem(`userData_${userId}`)
    if (savedData) {
      setUserData(JSON.parse(savedData))
    }
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="glass-effect border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                  Profile Settings
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Manage your account and preferences</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <button
                onClick={() => {
                  if (onLogout) onLogout()
                  navigate('/login')
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-effect rounded-2xl p-6 text-center"
            >
              <div className="relative inline-block mb-4">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                  {userData.name.charAt(0).toUpperCase()}
                </div>
                {isEditing && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute bottom-0 right-0 p-2 bg-purple-600 rounded-full text-white shadow-lg hover:bg-purple-700 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={userData.name}
                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                    className="bg-transparent border-b-2 border-purple-500 text-center focus:outline-none"
                  />
                ) : (
                  userData.name
                )}
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {isEditing ? (
                  <input
                    type="email"
                    value={userData.email}
                    onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                    className="bg-transparent border-b-2 border-purple-500 text-center focus:outline-none w-full"
                  />
                ) : (
                  userData.email
                )}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-3">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalEntries}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Entries</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-3">
                  <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">{stats.streakDays}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Streak</div>
                </div>
              </div>

              {isEditing ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-lg py-2 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white rounded-lg py-2 flex items-center justify-center gap-2 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg py-2 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
            </motion.div>
          </div>

          {/* Right Column - Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-effect rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">About</h3>
              </div>
              
              {isEditing ? (
                <textarea
                  value={userData.bio}
                  onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white resize-none h-32"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-gray-600 dark:text-gray-400">{userData.bio}</p>
              )}

              <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>Joined {new Date(userData.joinDate).toLocaleDateString()}</span>
              </div>
            </motion.div>

            {/* Preferences */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-effect rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Preferences</h3>
              </div>

              <div className="space-y-4">
                {/* Notifications */}
                <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">Notifications</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Get updates about your emotional patterns</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={userData.notifications}
                      onChange={(e) => setUserData({ ...userData, notifications: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {/* Privacy */}
                <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">Privacy</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Control who can see your data</div>
                    </div>
                  </div>
                  <select
                    value={userData.privacy}
                    onChange={(e) => setUserData({ ...userData, privacy: e.target.value })}
                    className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="friends">Friends Only</option>
                  </select>
                </div>

                {/* Theme */}
                <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    {theme === 'dark' ? (
                      <Moon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    ) : (
                      <Sun className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    )}
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">Theme</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Current: {theme === 'dark' ? 'Dark' : 'Light'}</div>
                    </div>
                  </div>
                  <ThemeToggle />
                </div>
              </div>
            </motion.div>

            {/* Account Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-effect rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your Stats</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                  <div className="text-3xl font-bold">{stats.totalEntries}</div>
                  <div className="text-sm opacity-90">Total Entries</div>
                </div>
                <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-4 text-white">
                  <div className="text-3xl font-bold">{stats.streakDays}</div>
                  <div className="text-sm opacity-90">Day Streak</div>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                  <div className="text-3xl font-bold">{stats.avgMood}</div>
                  <div className="text-sm opacity-90">Avg Mood</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-4 text-white">
                  <div className="text-3xl font-bold">{stats.insights}</div>
                  <div className="text-sm opacity-90">Insights</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}





