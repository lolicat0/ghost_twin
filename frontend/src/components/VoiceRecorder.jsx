import { useState, useRef, useEffect } from 'react'
import { Mic, Square, Loader } from 'lucide-react'
import axios from 'axios'

export default function VoiceRecorder({ userId, onRecordingComplete }) {
  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const streamRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      })
      
      streamRef.current = stream
      audioChunksRef.current = []

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        await analyzeRecording(audioBlob)
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }

      mediaRecorder.start()
      setIsRecording(true)
      setDuration(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1)
      }, 1000)

    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Microphone access denied. Please allow microphone permissions and try again.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const analyzeRecording = async (audioBlob) => {
    setIsAnalyzing(true)
    
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      formData.append('user_id', userId)

      const response = await axios.post(
        'http://localhost:8000/api/v1/analyze_voice',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      if (onRecordingComplete) {
        onRecordingComplete(response.data)
      }
    } catch (error) {
      console.error('Error analyzing voice:', error)
      alert('Failed to analyze voice. Please try again.')
    } finally {
      setIsAnalyzing(false)
      setDuration(0)
    }
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="text-center py-8">
      <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center shadow-xl transition-all ${
        isRecording 
          ? 'bg-red-500 animate-pulse' 
          : 'bg-gradient-to-br from-purple-500 to-pink-500'
      }`}>
        {isAnalyzing ? (
          <Loader className="w-12 h-12 text-white animate-spin" />
        ) : (
          <Mic className={`w-12 h-12 text-white ${isRecording ? 'animate-bounce' : ''}`} />
        )}
      </div>

      {isAnalyzing ? (
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">Analyzing your voice...</p>
      ) : isRecording ? (
        <>
          <p className="text-gray-600 dark:text-gray-300 mb-2 text-lg">Recording...</p>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-6">
            {formatDuration(duration)}
          </p>
        </>
      ) : (
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
          Record your voice to analyze emotional tone
        </p>
      )}

      <div className="flex gap-4 justify-center">
        {!isRecording && !isAnalyzing && (
          <button
            onClick={startRecording}
            className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg px-8 py-3 font-semibold hover:opacity-90 transition-opacity text-white shadow-lg flex items-center gap-2"
          >
            <Mic className="w-5 h-5" />
            Start Recording
          </button>
        )}

        {isRecording && (
          <button
            onClick={stopRecording}
            className="bg-red-500 rounded-lg px-8 py-3 font-semibold hover:opacity-90 transition-opacity text-white shadow-lg flex items-center gap-2"
          >
            <Square className="w-5 h-5" />
            Stop Recording
          </button>
        )}
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
        {isRecording ? 'Click stop when finished' : 'Click start to begin recording'}
      </p>
    </div>
  )
}


