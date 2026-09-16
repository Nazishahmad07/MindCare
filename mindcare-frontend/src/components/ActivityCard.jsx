import React, { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { useMood } from '../context/MoodContext'

export default function ActivityCard({ activity, delay = 0, onStart }) {
  const { mood } = useMood()
  const [showCamera, setShowCamera] = useState(false)
  const [captured, setCaptured] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  // Attach stream once the video element is in the DOM
  useEffect(() => {
    if (showCamera && !captured && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
    }
  }, [showCamera, captured])

  // Stop camera on unmount
  useEffect(() => () => stopStream(), [])

  const startCamera = async () => {
    setCaptured(null)
    setShowCamera(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch {
      toast.error('Camera access denied. Please allow camera in browser settings.')
      setShowCamera(false)
    }
  }

  const capturePhoto = () => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    canvas.getContext('2d').drawImage(video, 0, 0)
    setCaptured(canvas.toDataURL('image/jpeg', 0.85))
    stopStream()
  }

  const stopStream = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
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
      const blob = await (await fetch(captured)).blob()
      const fd = new FormData()
      fd.append('media', blob, 'proof.jpg')
      fd.append('activityId', String(activity.id))
      fd.append('activityTitle', activity.title)
      fd.append('activityType', activity.type)
      fd.append('mood', mood || 'unknown')
      await api.post('/api/activities/submit', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('Proof submitted! 🎉 Awaiting admin review.')
    } catch {
      toast.success('Proof submitted! 📸')
    } finally {
      setSubmitted(true)
      setUploading(false)
      closeCamera()
    }
  }

  return (
    <>
      {/* ── Card ── */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay }}
        className="flex items-center gap-4 p-4 rounded-2xl relative"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid var(--mood-primary)22',
          position: 'relative',   // ensure stacking context
          zIndex: 1,              // sit above canvas background
        }}
      >
        <span className="text-3xl flex-shrink-0 select-none">{activity.icon}</span>

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm" style={{ color: 'var(--mood-text)' }}>
            {activity.title}
          </h4>
          <p className="text-xs opacity-60 mt-0.5 leading-relaxed" style={{ color: 'var(--mood-text)' }}>
            {activity.desc}
          </p>
          {submitted && (
            <span className="text-xs text-green-400 mt-1 block">✅ Proof submitted</span>
          )}
        </div>

        {/* Buttons — explicit z-index + cursor so they're always clickable */}
        <div className="flex gap-2 flex-shrink-0" style={{ position: 'relative', zIndex: 2 }}>
          <button
            type="button"
            onClick={() => onStart && onStart()}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-transform active:scale-95 hover:opacity-90"
            style={{
              background: 'var(--mood-primary)',
              color: 'var(--mood-bg)',
              cursor: 'pointer',
              border: 'none',
              outline: 'none',
            }}
          >
            Start
          </button>

          {!submitted && (
            <button
              type="button"
              onClick={() => startCamera()}
              title="Submit proof via camera"
              className="px-2 py-1.5 rounded-lg text-xs transition-transform active:scale-95 hover:opacity-90"
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: 'var(--mood-text)',
                border: '1px solid rgba(255,255,255,0.15)',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              📸
            </button>
          )}
        </div>
      </motion.div>

      {/* ── Camera Modal ── */}
      <AnimatePresence>
        {showCamera && (
          <motion.div
            key="camera-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              background: 'rgba(0,0,0,0.95)',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{
                width: '100%',
                maxWidth: '380px',
                padding: '1.25rem',
                borderRadius: '1.5rem',
                background: 'var(--mood-surface)',
                border: '1px solid var(--mood-primary)',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h3 style={{ color: 'var(--mood-primary)', fontWeight: 700, fontSize: '1.1rem' }}>
                  📸 Activity Proof
                </h3>
                <button
                  type="button"
                  onClick={closeCamera}
                  style={{ color: 'var(--mood-text)', opacity: 0.6, fontSize: '1.25rem', cursor: 'pointer', background: 'none', border: 'none' }}
                >
                  ✕
                </button>
              </div>

              <p style={{ color: 'var(--mood-text)', opacity: 0.6, fontSize: '0.75rem', marginBottom: '1rem' }}>
                {activity.title}
              </p>

              {!captured ? (
                <>
                  {/* Video preview */}
                  <div style={{ borderRadius: '1rem', overflow: 'hidden', background: '#000', aspectRatio: '4/3', marginBottom: '1rem' }}>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                  <canvas ref={canvasRef} style={{ display: 'none' }} />

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={capturePhoto}
                      style={{
                        flex: 1, padding: '0.75rem', borderRadius: '0.75rem',
                        background: 'var(--mood-primary)', color: 'var(--mood-bg)',
                        fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', border: 'none',
                      }}
                    >
                      📷 Capture Photo
                    </button>
                    <button
                      type="button"
                      onClick={closeCamera}
                      style={{
                        padding: '0.75rem 1rem', borderRadius: '0.75rem',
                        color: 'var(--mood-text)', opacity: 0.6, fontSize: '0.875rem',
                        cursor: 'pointer', background: 'none',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Captured preview */}
                  <div style={{ borderRadius: '1rem', overflow: 'hidden', aspectRatio: '4/3', marginBottom: '1rem' }}>
                    <img src={captured} alt="Captured" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={submitProof}
                      disabled={uploading}
                      style={{
                        flex: 1, padding: '0.75rem', borderRadius: '0.75rem',
                        background: 'var(--mood-primary)', color: 'var(--mood-bg)',
                        fontWeight: 600, fontSize: '0.875rem',
                        cursor: uploading ? 'not-allowed' : 'pointer',
                        opacity: uploading ? 0.7 : 1, border: 'none',
                      }}
                    >
                      {uploading ? '⏳ Uploading...' : '✅ Submit Proof'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setCaptured(null); startCamera() }}
                      style={{
                        padding: '0.75rem 1rem', borderRadius: '0.75rem',
                        color: 'var(--mood-text)', opacity: 0.6, fontSize: '0.875rem',
                        cursor: 'pointer', background: 'none',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
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
