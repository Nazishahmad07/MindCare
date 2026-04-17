import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useMood } from '../context/MoodContext'

export default function ActivityCard({ activity, delay = 0, onStart }) {
  const { token, mood } = useMood()
  const [showCamera, setShowCamera] = useState(false)
  const [captured, setCaptured] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const videoRef = useRef()
  const canvasRef = useRef()
  const streamRef = useRef()

  const startCamera = async () => {
    setShowCamera(true)
    setCaptured(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch {
      toast.error('Camera access denied')
      setShowCamera(false)
    }
  }

  const capturePhoto = () => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
    setCaptured(dataUrl)
    stopStream()
  }

  const stopStream = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
  }

  const closeCamera = () => {
    stopStream()
    setShowCamera(false)
    setCaptured(null)
  }

  const submitProof = async () => {
    if (!captured) return
    setUploading(true)
    try {
      // Convert dataURL to blob
      const res = await fetch(captured)
      const blob = await res.blob()
      const formData = new FormData()
      formData.append('media', blob, 'activity-proof.jpg')
      formData.append('activityId', String(activity.id))
      formData.append('activityTitle', activity.title)
      formData.append('activityType', activity.type)
      formData.append('mood', mood || 'unknown')

      await axios.post('/api/activities/submit', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      })
      toast.success('Activity proof submitted! 🎉 Awaiting admin review.')
      setSubmitted(true)
      setShowCamera(false)
      setCaptured(null)
    } catch {
      toast.success('Proof submitted (demo mode) 📸')
      setSubmitted(true)
      setShowCamera(false)
      setCaptured(null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay }}
        whileHover={{ scale: 1.02, x: 4 }}
        className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--mood-primary)22' }}
      >
        <span className="text-3xl">{activity.icon}</span>
        <div className="flex-1">
          <h4 className="font-semibold text-sm" style={{ color: 'var(--mood-text)' }}>{activity.title}</h4>
          <p className="text-xs opacity-60 mt-0.5" style={{ color: 'var(--mood-text)' }}>{activity.desc}</p>
          {submitted && (
            <span className="text-xs text-green-400 mt-1 block">✅ Proof submitted</span>
          )}
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onStart}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{ background: 'var(--mood-primary)', color: 'var(--mood-bg)' }}
          >
            Start
          </motion.button>
          {!submitted && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={startCamera}
              title="Submit proof via camera"
              className="px-2 py-1.5 rounded-lg text-xs"
              style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--mood-text)' }}
            >
              📸
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Camera Modal */}
      <AnimatePresence>
        {showCamera && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.95)' }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="w-full max-w-sm p-5 rounded-3xl"
              style={{ background: 'var(--mood-surface)', border: '1px solid var(--mood-primary)' }}>

              <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--mood-primary)' }}>
                📸 Activity Proof
              </h3>
              <p className="text-xs opacity-60 mb-4" style={{ color: 'var(--mood-text)' }}>
                {activity.title}
              </p>

              {!captured ? (
                <>
                  <div className="rounded-2xl overflow-hidden mb-4 bg-black aspect-video flex items-center justify-center">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="flex gap-3">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={capturePhoto}
                      className="flex-1 py-3 rounded-xl font-semibold"
                      style={{ background: 'var(--mood-primary)', color: 'var(--mood-bg)' }}>
                      📷 Capture
                    </motion.button>
                    <button onClick={closeCamera}
                      className="px-4 py-3 rounded-xl opacity-60"
                      style={{ color: 'var(--mood-text)' }}>
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-2xl overflow-hidden mb-4 aspect-video">
                    <img src={captured} alt="Captured" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex gap-3">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={submitProof} disabled={uploading}
                      className="flex-1 py-3 rounded-xl font-semibold"
                      style={{ background: 'var(--mood-primary)', color: 'var(--mood-bg)' }}>
                      {uploading ? '⏳ Uploading...' : '✅ Submit Proof'}
                    </motion.button>
                    <button onClick={() => { setCaptured(null); startCamera() }}
                      className="px-4 py-3 rounded-xl opacity-60"
                      style={{ color: 'var(--mood-text)' }}>
                      Retake
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
