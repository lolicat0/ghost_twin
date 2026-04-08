import { useState, useEffect } from 'react'
import { RefreshCw, Shield } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Captcha({ onVerify, disabled }) {
  const [num1, setNum1] = useState(0)
  const [num2, setNum2] = useState(0)
  const [answer, setAnswer] = useState('')
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    generateQuestion()
  }, [])

  const generateQuestion = () => {
    const n1 = Math.floor(Math.random() * 10) + 1
    const n2 = Math.floor(Math.random() * 10) + 1
    setNum1(n1)
    setNum2(n2)
    setAnswer('')
    setError('')
    setIsVerified(false)
    if (onVerify) {
      onVerify(false)
    }
  }

  const handleAnswerChange = (e) => {
    const value = e.target.value
    setAnswer(value)
    setError('')

    const correctAnswer = num1 + num2
    if (value && parseInt(value) === correctAnswer) {
      setIsVerified(true)
      if (onVerify) {
        onVerify(true)
      }
    } else if (value) {
      setIsVerified(false)
      if (onVerify) {
        onVerify(false)
      }
    }
  }

  const handleVerify = () => {
    const correctAnswer = num1 + num2
    if (parseInt(answer) === correctAnswer) {
      setIsVerified(true)
      setError('')
      if (onVerify) {
        onVerify(true)
      }
    } else {
      setError('Incorrect answer. Please try again.')
      setIsVerified(false)
      if (onVerify) {
        onVerify(false)
      }
      generateQuestion()
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Security Verification</span>
      </div>
      
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 flex-1">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm">
              {num1}
            </div>
            <span className="text-xl font-bold text-gray-700 dark:text-gray-300">+</span>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm">
              {num2}
            </div>
            <span className="text-xl font-bold text-gray-700 dark:text-gray-300">=</span>
            <input
              type="number"
              value={answer}
              onChange={handleAnswerChange}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleVerify()
                }
              }}
              disabled={disabled || isVerified}
              placeholder="?"
              className={`w-20 text-2xl font-bold text-center border-2 rounded-lg px-3 py-2 ${
                isVerified
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : error
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  : 'border-purple-300 dark:border-purple-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
              } focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 disabled:opacity-50`}
            />
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generateQuestion}
            disabled={disabled || isVerified}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            title="Generate new question"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${disabled || isVerified ? '' : 'hover:rotate-180 transition-transform'}`} />
          </motion.button>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-600 dark:text-red-400 mt-2"
          >
            {error}
          </motion.p>
        )}

        {isVerified && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 mt-2 text-green-600 dark:text-green-400"
          >
            <Shield className="w-4 h-4" />
            <span className="text-sm font-semibold">Verified</span>
          </motion.div>
        )}
      </div>
    </div>
  )
}





