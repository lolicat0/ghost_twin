import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Profile from './pages/Profile'
import './App.css'

function App() {
  // Check localStorage for auth state on mount
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const savedAuth = localStorage.getItem('isAuthenticated')
    return savedAuth === 'true'
  })
  const [userId, setUserId] = useState(() => {
    return localStorage.getItem('userId') || 'demo_user_001'
  })

  // Update localStorage when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('userId', userId)
    } else {
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('userId')
    }
  }, [isAuthenticated, userId])

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUserId('demo_user_001')
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 transition-colors duration-300">
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login setIsAuthenticated={setIsAuthenticated} setUserId={setUserId} />
              )
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? (
                <Dashboard userId={userId} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/profile" 
            element={
              isAuthenticated ? (
                <Profile userId={userId} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
