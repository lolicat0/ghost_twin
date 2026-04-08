import { useState, useRef, useEffect } from 'react'
import { Camera, Loader, X } from 'lucide-react'
import axios from 'axios'

export default function CameraCapture({ userId, onCaptureComplete }) {
  const [isStreaming, setIsStreaming] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      })

      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsStreaming(true)
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      setError('Camera access denied. Please allow camera permissions and try again.')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    
    setIsStreaming(false)
  }

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return

    try {
      setIsAnalyzing(true)
      
      // Capture frame from video
      const canvas = canvasRef.current
      const video = videoRef.current
      
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setIsAnalyzing(false)
          return
        }

        try {
          const formData = new FormData()
          formData.append('image', blob, 'capture.jpg')
          formData.append('user_id', userId)

          const response = await axios.post(
            'http://localhost:8000/api/v1/analyze_face',
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            }
          )

          if (onCaptureComplete) {
            onCaptureComplete(response.data)
          }
          
          // Stop camera after capture
          stopCamera()
        } catch (error) {
          console.error('Error analyzing face:', error)
          setError(error.response?.data?.detail || 'Failed to analyze face. Please try again.')
        } finally {
          setIsAnalyzing(false)
        }
      }, 'image/jpeg', 0.95)
      
    } catch (error) {
      console.error('Error capturing image:', error)
      setError('Failed to capture image. Please try again.')
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="text-center py-8">
      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/30 border-2 border-red-500 dark:border-red-700 rounded-xl p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {!isStreaming && !isAnalyzing && (
        <>
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-xl">
            <Camera className="w-12 h-12 text-white" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
            Capture your face to analyze micro-expressions
          </p>
          <button
            onClick={startCamera}
            className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg px-8 py-3 font-semibold hover:opacity-90 transition-opacity text-white shadow-lg flex items-center gap-2 mx-auto"
          >
            <Camera className="w-5 h-5" />
            Open Camera
          </button>
        </>
      )}

      {isStreaming && (
        <div className="space-y-4">
          <div className="relative mx-auto max-w-2xl">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded-xl border-2 border-purple-500 shadow-lg"
            />
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <Loader className="w-12 h-12 text-white animate-spin mx-auto mb-2" />
                  <p className="text-white">Analyzing emotion...</p>
                </div>
              </div>
            )}
          </div>
          
          <canvas ref={canvasRef} className="hidden" />
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={captureAndAnalyze}
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg px-8 py-3 font-semibold hover:opacity-90 transition-opacity text-white shadow-lg flex items-center gap-2 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Camera className="w-5 h-5" />
                  Capture & Analyze
                </>
              )}
            </button>
            <button
              onClick={stopCamera}
              disabled={isAnalyzing}
              className="bg-gray-600 rounded-lg px-8 py-3 font-semibold hover:opacity-90 transition-opacity text-white shadow-lg disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Position your face in the frame and click capture
          </p>
        </div>
      )}
    </div>
  )
}


