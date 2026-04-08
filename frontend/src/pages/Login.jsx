import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Mail, Lock, ArrowRight, Shield, Zap, BarChart3, AlertCircle, CheckCircle, Chrome } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import Captcha from '../components/Captcha'
import { validateBrowserForLogin, getBrowserIcon } from '../utils/browserDetector'

export default function Login({ setIsAuthenticated, setUserId }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const [browserValidation, setBrowserValidation] = useState(null)
  const [showBrowserWarning, setShowBrowserWarning] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Validate browser on mount (non-blocking, informational only)
    try {
      const validation = validateBrowserForLogin()
      setBrowserValidation(validation)
      // Only show if there are actual errors, not just warnings
      if (validation.errors.length > 0) {
        setShowBrowserWarning(true)
      }
    } catch (error) {
      // Silently handle browser detection errors - don't block login
      console.log('Browser detection skipped:', error)
    }
  }, [])

  const validateEmail = (email) => {
    // Comprehensive email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    if (!email) {
      setEmailError('Email is required')
      return false
    }

    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address')
      return false
    }

    // Check for common email domains
    const validDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'protonmail.com', 'aol.com']
    const domain = email.split('@')[1]?.toLowerCase()
    
    if (domain && !validDomains.includes(domain)) {
      // Allow other domains but show warning
      if (domain.includes('test') || domain.includes('fake') || domain.includes('example')) {
        setEmailError('Please use a valid email domain')
        return false
      }
    }

    setEmailError('')
    return true
  }

  const validatePassword = (password) => {
    if (!password) {
      setPasswordError('Password is required')
      return false
    }

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return false
    }

    setPasswordError('')
    return true
  }

  const handleEmailChange = (e) => {
    const value = e.target.value
    setEmail(value)
    if (value) {
      validateEmail(value)
    } else {
      setEmailError('')
    }
  }

  const handlePasswordChange = (e) => {
    const value = e.target.value
    setPassword(value)
    if (value) {
      validatePassword(value)
    } else {
      setPasswordError('')
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    
    // Validate all fields
    const isEmailValid = validateEmail(email)
    const isPasswordValid = validatePassword(password)
    
    if (!isEmailValid || !isPasswordValid) {
      return
    }

    if (!captchaVerified) {
      alert('Please complete the security verification (CAPTCHA)')
      return
    }

    // Browser validation is informational only - don't block login

    setIsLoading(true)

    // Mock login (in production, would call auth API)
    setTimeout(() => {
      setIsAuthenticated(true)
      setUserId('demo_user_001')
      navigate('/dashboard')
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 transition-colors duration-300">
      {/* Theme Toggle - Top Right */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center lg:text-left"
        >
          <div className="flex items-center gap-4 justify-center lg:justify-start mb-8">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 flex items-center justify-center shadow-2xl dark:shadow-purple-500/50"
            >
              <Brain className="w-12 h-12 text-white" />
            </motion.div>
            <div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent dark:from-purple-400 dark:via-pink-400 dark:to-purple-400">
                Ghostnet
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">Your Emotional Mirror</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
            The AI That Understands Your Emotions
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              Better Than You Do
            </span>
          </h2>

          <p className="text-gray-600 dark:text-gray-300 text-lg mb-10 leading-relaxed">
            Ghostnet reads your micro-expressions, voice tone, and writing style to map emotional changes over time.
            Build your unique Mood DNA and talk to your emotional twin.
          </p>

          <div className="space-y-6 text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-start gap-4 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">Multimodal Analysis</h3>
                <p className="text-gray-600 dark:text-gray-300">Text, voice, and facial emotion recognition</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-start gap-4 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">Mood DNA Graph</h3>
                <p className="text-gray-600 dark:text-gray-300">Visualize your unique emotional fingerprint</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-start gap-4 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">AI Emotional Twin</h3>
                <p className="text-gray-600 dark:text-gray-300">Chat with an AI trained on your emotions</p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full"
        >
          {/* Browser Compatibility Info - Non-blocking */}
          <AnimatePresence>
            {showBrowserWarning && browserValidation && browserValidation.errors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3"
              >
                <div className="flex items-start gap-2">
                  <Chrome className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Using {browserValidation.browserInfo.name} {browserValidation.browserInfo.version}. 
                      {browserValidation.errors.length > 0 && ' Some features may be limited.'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowBrowserWarning(false)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-lg leading-none"
                    title="Dismiss"
                  >
                    ×
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 lg:p-10 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="mb-8">
              <h3 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Welcome Back</h3>
              <p className="text-gray-600 dark:text-gray-400">Sign in to continue your emotional journey</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                    emailError ? 'text-red-500' : email && !emailError ? 'text-green-500' : 'text-gray-400 dark:text-gray-500'
                  }`} />
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={() => validateEmail(email)}
                    placeholder="your@email.com"
                    className={`w-full bg-gray-50 dark:bg-gray-900 border-2 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 ${
                      emailError
                        ? 'border-red-500 focus:ring-red-500'
                        : email && !emailError
                        ? 'border-green-500 focus:ring-green-500'
                        : 'border-gray-200 dark:border-gray-700 focus:ring-purple-500 dark:focus:ring-purple-400'
                    } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all`}
                    required
                  />
                  {email && !emailError && (
                    <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                  )}
                </div>
                {emailError && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {emailError}
                  </motion.p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Password</label>
                <div className="relative">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                    passwordError ? 'text-red-500' : password && !passwordError ? 'text-green-500' : 'text-gray-400 dark:text-gray-500'
                  }`} />
                  <input
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    onBlur={() => validatePassword(password)}
                    placeholder="••••••••"
                    className={`w-full bg-gray-50 dark:bg-gray-900 border-2 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 ${
                      passwordError
                        ? 'border-red-500 focus:ring-red-500'
                        : password && !passwordError
                        ? 'border-green-500 focus:ring-green-500'
                        : 'border-gray-200 dark:border-gray-700 focus:ring-purple-500 dark:focus:ring-purple-400'
                    } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all`}
                    required
                  />
                  {password && !passwordError && (
                    <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                  )}
                </div>
                {passwordError && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {passwordError}
                  </motion.p>
                )}
              </div>

              {/* CAPTCHA */}
              <Captcha onVerify={setCaptchaVerified} disabled={isLoading} />

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500" />
                  <span className="text-gray-600 dark:text-gray-400">Remember me</span>
                </label>
                <a href="#" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold transition-colors">
                  Forgot password?
                </a>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading || !captchaVerified || emailError || passwordError}
                whileHover={{ scale: captchaVerified && !emailError && !passwordError ? 1.02 : 1 }}
                whileTap={{ scale: captchaVerified && !emailError && !passwordError ? 0.98 : 1 }}
                className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 rounded-xl py-4 font-bold text-white hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <a href="#" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold transition-colors">
                  Sign up for free
                </a>
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center leading-relaxed">
                By signing in, you agree to our{' '}
                <a href="#" className="text-purple-600 dark:text-purple-400 hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-purple-600 dark:text-purple-400 hover:underline">Privacy Policy</a>.
                <br />
                Your emotional data is encrypted and private.
              </p>
            </div>
          </div>

          {/* Demo Mode Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center"
          >
            <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-sm text-purple-700 dark:text-purple-300">
                <span className="font-bold">Demo Mode:</span> Enter any email/password to explore
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
