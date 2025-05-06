"use client"

import { useState, useEffect, useRef } from "react"
import * as faceapi from "face-api.js"

export default function FaceDetection() {
  const videoRef = useRef()
  const canvasRef = useRef()
  const [isModelLoaded, setIsModelLoaded] = useState(false)
  const [detectedMood, setDetectedMood] = useState("")
  const [error, setError] = useState("")
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [stream, setStream] = useState(null)
  const detectionIntervalRef = useRef(null)

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models"
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ])
        setIsModelLoaded(true)
      } catch (error) {
        setError("Failed to load models")
        console.error("Error loading models:", error)
      }
    }

    loadModels()

    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      // Using portrait orientation for better face capture
      const constraints = {
        video: {
          facingMode: "user",
          aspectRatio: { ideal: 9 / 16 },
        },
      }
      const newStream = await navigator.mediaDevices.getUserMedia(constraints)
      if (videoRef.current) {
        videoRef.current.srcObject = newStream
        setStream(newStream)
        setIsCameraActive(true)
      }
    } catch (err) {
      setError("Camera access denied")
      console.error("Error accessing webcam:", err)
    }
  }

  const stopCamera = () => {
    if (stream) {
      const tracks = stream.getTracks()
      tracks.forEach((track) => track.stop())
      setStream(null)
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current)
      detectionIntervalRef.current = null
    }

    setIsCameraActive(false)

    // Clear canvas
    if (canvasRef.current) {
      const context = canvasRef.current.getContext("2d")
      if (context) {
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
    }
  }

  const handleVideoPlay = () => {
    if (isModelLoaded && isCameraActive) {
      const canvas = canvasRef.current
      const video = videoRef.current

      const displaySize = { width: video.videoWidth, height: video.videoHeight }
      faceapi.matchDimensions(canvas, displaySize)

      detectionIntervalRef.current = setInterval(async () => {
        if (video.readyState === 4) {
          const detections = await faceapi
            .detectAllFaces(video, new faceapi.SsdMobilenetv1Options())
            .withFaceExpressions()

          if (detections && detections.length > 0) {
            const expressions = detections[0].expressions
            const maxExpression = Object.keys(expressions).reduce((a, b) => (expressions[a] > expressions[b] ? a : b))

            setDetectedMood(maxExpression)

            // Draw canvas with detections - with smaller detection boxes
            const resizedDetections = faceapi.resizeResults(detections, displaySize)

            // Clear previous drawings
            canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height)

            // Custom drawing with smaller boxes
            const ctx = canvas.getContext("2d")
            resizedDetections.forEach((detection) => {
              // Draw a smaller box with thinner lines
              const { x, y, width, height } = detection.detection.box
              const boxPadding = Math.min(width, height) * 0.1 // Reduced from 0.2 to 0.1 (10% padding)

              ctx.strokeStyle = "#0ea5e9" // Bright blue color
              ctx.lineWidth = 2 // Reduced from 4 to 2 (thinner line)
              ctx.beginPath()
              ctx.rect(x - boxPadding, y - boxPadding, width + boxPadding * 2, height + boxPadding * 2)
              ctx.stroke()

              // Draw expression text if needed
              if (detection.expressions) {
                const expression = Object.entries(detection.expressions).reduce(
                  (acc, [key, value]) => (value > acc[1] ? [key, value] : acc),
                  ["", 0],
                )[0]

                ctx.font = "24px Arial"
                ctx.fillStyle = "#0ea5e9"
                ctx.fillText(expression, x + width / 2 - 40, y + height + 30)
              }
            })
          }
        }
      }, 200)

      return () => clearInterval(detectionIntervalRef.current)
    }
  }

  // Map face-api expressions to our animation states
  const mapMoodToAnimationState = (mood) => {
    const moodMap = {
      happy: "happy",
      sad: "sad",
      angry: "angry",
      neutral: "neutral",
      surprised: "surprised",
      fearful: "sad",
      disgusted: "angry",
    }
    return moodMap[mood] || "neutral"
  }

  return (
    <section className="py-6 md:py-12 bg-gradient-to-b from-black via-gray-900 to-teal-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-600">
            Face Mood AI
          </h2>
          <p className="mt-3 text-gray-300 max-w-2xl mx-auto">
            Real-time emotion detection using advanced AI face recognition
          </p>
        </div>

        <div className="mx-auto">
          {error ? (
            <div className="bg-red-900/30 border border-red-800 p-6 rounded-xl text-center mb-8 backdrop-blur-sm max-w-xl mx-auto">
              <p className="text-red-400 text-lg">{error}</p>
              <button
                onClick={() => {
                  setError("")
                  loadModels()
                }}
                className="mt-4 px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16">
              {/* TV UI for larger screens, phone UI for mobile */}
              <div className="w-full lg:w-2/3">
                <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-teal-950 rounded-xl overflow-hidden shadow-2xl border-4 border-gray-700 transition-all duration-500 hover:shadow-teal-900/30">
                  {/* TV top section with buttons and indicators */}
                  <div className="hidden lg:flex bg-gray-900 px-4 py-2 justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="text-teal-400 font-medium">Face Detection Channel</div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
                      <span className="text-xs text-gray-400">LIVE</span>
                    </div>
                  </div>

                  {/* Content area */}
                  <div className="relative w-full">
                    {/* Phone design for mobile */}
                    <div className="lg:hidden relative w-72 md:w-96 mx-auto aspect-[9/16] rounded-3xl bg-gradient-to-b from-gray-800 to-gray-900 p-3 shadow-2xl border-4 border-gray-700">
                      {/* Phone notch */}
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-28 h-7 bg-black rounded-b-xl z-10"></div>

                      {/* Phone screen */}
                      <div className="relative w-full h-full bg-black rounded-2xl overflow-hidden">
                        {/* Left side stickers */}
                        <div className="absolute left-0 top-0 bottom-0 w-1/6 z-10 flex flex-col justify-between py-4">
                          <CodeSticker type="brackets" color="teal" />
                          <CodeSticker type="function" color="cyan" />
                          <CodeSticker type="curly" color="emerald" />
                        </div>

                        {/* Right side stickers */}
                        <div className="absolute right-0 top-0 bottom-0 w-1/6 z-10 flex flex-col justify-between py-4">
                          <CodeSticker type="tag" color="emerald" />
                          <CodeSticker type="semicolon" color="teal" />
                          <CodeSticker type="equals" color="cyan" />
                        </div>

                        <video
                          ref={videoRef}
                          onPlay={handleVideoPlay}
                          autoPlay
                          muted
                          playsInline
                          className="w-full h-full object-contain"
                        />
                        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />

                        {/* Home button/indicator */}
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-1.5 bg-gray-600 rounded-full"></div>
                      </div>
                    </div>

                    {/* TV design for larger screens */}
                    <div className="hidden lg:block relative w-full aspect-video">
                      {/* TV frame with rounded corners and bezel */}
                      <div className="absolute inset-0 bg-gray-800 rounded-md p-4">
                        {/* TV screen with inner shadow */}
                        <div className="relative w-full h-full bg-black rounded-sm overflow-hidden shadow-inner">
                          {/* Left side stickers */}
                          <div className="absolute left-0 top-0 bottom-0 w-1/6 z-10 flex flex-col justify-between py-8 px-4">
                            <CodeSticker type="brackets" color="teal" />
                            <CodeSticker type="function" color="cyan" />
                            <CodeSticker type="curly" color="emerald" />
                            <CodeSticker type="tag" color="teal" />
                          </div>

                          {/* Right side stickers */}
                          <div className="absolute right-0 top-0 bottom-0 w-1/6 z-10 flex flex-col justify-between py-8 px-4">
                            <CodeSticker type="tag" color="emerald" />
                            <CodeSticker type="semicolon" color="teal" />
                            <CodeSticker type="equals" color="cyan" />
                            <CodeSticker type="brackets" color="emerald" />
                          </div>

                          {/* Video container */}
                          <div className="absolute left-1/6 right-1/6 top-0 bottom-0 bg-black">
                            <video
                              ref={videoRef}
                              onPlay={handleVideoPlay}
                              autoPlay
                              muted
                              playsInline
                              className="w-full h-full object-contain"
                            />
                            <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
                          </div>

                          {/* TV scan lines overlay */}
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 pointer-events-none opacity-30 mix-blend-overlay"></div>
                          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,rgba(255,255,255,0.04)_1px,rgba(255,255,255,0.04)_2px)] pointer-events-none opacity-10"></div>

                          {/* TV reflection */}
                          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
                        </div>
                      </div>
                    </div>

                    {/* Loading overlay */}
                    {!isModelLoaded && !error && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                        <div className="text-center">
                          <svg
                            className="animate-spin mx-auto h-12 w-12 text-teal-500"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <p className="mt-3 text-teal-400 text-lg">Loading SSD MobileNet models...</p>
                        </div>
                      </div>
                    )}

                    {/* Mood readout overlay */}
                    {isModelLoaded && detectedMood && isCameraActive && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-5/6 p-3 bg-black/60 backdrop-blur-md rounded-xl border border-teal-900/50">
                        <p className="text-center text-teal-400 text-lg font-medium">
                          Currently detecting:{" "}
                          <span className="font-bold">
                            {detectedMood.charAt(0).toUpperCase() + detectedMood.slice(1)}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* TV controls */}
                  <div className="bg-gradient-to-r from-gray-900 to-teal-950/50 p-4 flex justify-center gap-4">
                    <button
                      onClick={startCamera}
                      disabled={isCameraActive}
                      className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        isCameraActive
                          ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white"
                      }`}
                    >
                      Start Camera
                    </button>
                    <button
                      onClick={stopCamera}
                      disabled={!isCameraActive}
                      className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        !isCameraActive
                          ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white"
                      }`}
                    >
                      Stop Camera
                    </button>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-1/3 mt-8 lg:mt-0 flex flex-col items-center">
                <ImprovedEmotionLogo mood={mapMoodToAnimationState(detectedMood)} />

                {detectedMood && isCameraActive && (
                  <div className="mt-6 p-6 w-full max-w-md bg-gradient-to-br from-teal-900/30 to-emerald-900/20 backdrop-blur-sm border border-teal-800/50 rounded-xl text-center shadow-lg">
                    <h3 className="text-2xl font-bold text-white mb-2">Detected Emotion</h3>
                    <p className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-300">
                      {detectedMood.charAt(0).toUpperCase() + detectedMood.slice(1)}
                    </p>
                    <p className="mt-4 text-gray-300 text-sm">{getEmotionDescription(detectedMood)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Features section */}
          <div className="mt-16 md:mt-24">
            <h3 className="text-2xl font-bold text-center text-teal-400 mb-8">Powered By Advanced AI</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-gray-800/50 to-teal-950/30 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-teal-800 transition-colors">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-900/60 to-cyan-900/60 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-teal-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-medium text-white mb-2">SSD MobileNet</h4>
                <p className="text-gray-300">
                  High-performance neural network optimized for accurate face detection even in challenging lighting
                  conditions.
                </p>
              </div>

              <div className="bg-gradient-to-br from-gray-800/50 to-teal-950/30 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-teal-800 transition-colors">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-900/60 to-cyan-900/60 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-teal-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-medium text-white mb-2">Expression Recognition</h4>
                <p className="text-gray-300">
                  Advanced algorithms that can identify and classify seven distinct facial expressions with high
                  accuracy.
                </p>
              </div>

              <div className="bg-gradient-to-br from-gray-800/50 to-teal-950/30 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-teal-800 transition-colors">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-900/60 to-cyan-900/60 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-teal-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="text-xl font-medium text-white mb-2">Real-Time Processing</h4>
                <p className="text-gray-300">
                  Instantaneous mood detection and visualization with smooth performance on modern devices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Code Sticker Component
function CodeSticker({ type, color }) {
  const colorClasses = {
    teal: "text-teal-400 border-teal-500/50",
    cyan: "text-cyan-400 border-cyan-500/50",
    emerald: "text-emerald-400 border-emerald-500/50",
  }

  const colorClass = colorClasses[color] || colorClasses.teal

  const getSticker = () => {
    switch (type) {
      case "brackets":
        return "[ ]"
      case "curly":
        return "{ }"
      case "function":
        return "( ) =>"
      case "tag":
        return "</ >"
      case "semicolon":
        return ";"
      case "equals":
        return "==="
      default:
        return "{ }"
    }
  }

  return (
    <div
      className={`flex items-center justify-center p-2 bg-black/40 backdrop-blur-sm rounded-lg border ${colorClass} transform rotate-3 hover:rotate-0 transition-all duration-300 shadow-lg`}
    >
      <span className="font-mono font-bold">{getSticker()}</span>
    </div>
  )
}

function ImprovedEmotionLogo({ mood = "neutral" }) {
  // Set opacity values based on the current mood
  const mouthOpacities = {
    happy: mood === "happy" ? "1" : "0",
    sad: mood === "sad" ? "1" : "0",
    angry: mood === "angry" ? "1" : "0",
    neutral: mood === "neutral" || !mood ? "1" : "0",
    surprised: mood === "surprised" ? "1" : "0",
  }

  const eyebrowsOpacity = mood === "angry" ? "1" : "0"
  const tearDropsOpacity = mood === "sad" ? "1" : "0" // Only visible for sad mood
  const surprisedEyesOpacity = mood === "surprised" ? "1" : "0"
  const normalEyesOpacity = mood === "surprised" ? "0" : "1"

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-64 h-64 md:w-80 md:h-80">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
          {/* Face with gradient - reduced glow */}
          <defs>
            <radialGradient id="faceGradient" cx="50%" cy="40%" r="60%" fx="50%" fy="40%">
              <stop offset="0%" stopColor="#1a2e38" />
              <stop offset="70%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#000" />
            </radialGradient>
          </defs>

          {/* 3D effect with multiple layers - reduced glow */}
          <circle cx="50" cy="50" r="48" fill="rgba(13, 148, 136, 0.1)" />
          <circle cx="50" cy="50" r="47" fill="rgba(13, 148, 136, 0.05)" />
          <circle cx="50" cy="50" r="46" fill="url(#faceGradient)" />
          <circle cx="50" cy="50" r="45" fill="none" stroke="#0d9488" strokeWidth="2" />

          {/* Normal Eyes with animation */}
          <circle cx="30" cy="40" r="5" fill="#0ea5e9" opacity={normalEyesOpacity}>
            <animate attributeName="r" values="5;5.5;5" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="70" cy="40" r="5" fill="#0ea5e9" opacity={normalEyesOpacity}>
            <animate attributeName="r" values="5;5.5;5" dur="3s" repeatCount="indefinite" begin="0.5s" />
          </circle>

          {/* Surprised Eyes - larger with animation */}
          <circle cx="30" cy="40" r="8" fill="#0ea5e9" opacity={surprisedEyesOpacity}>
            <animate attributeName="r" values="8;8.5;8" dur="1s" repeatCount="indefinite" />
          </circle>
          <circle cx="70" cy="40" r="8" fill="#0ea5e9" opacity={surprisedEyesOpacity}>
            <animate attributeName="r" values="8;8.5;8" dur="1s" repeatCount="indefinite" />
          </circle>

          {/* Happy Mouth - smoother animation */}
          <path
            d="M30 65 Q50 80 70 65"
            stroke="#0ea5e9"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            opacity={mouthOpacities.happy}
          >
            <animate
              attributeName="d"
              values="M30 65 Q50 80 70 65; M30 67 Q50 85 70 67; M30 65 Q50 80 70 65"
              dur="3s"
              repeatCount="indefinite"
              begin={mood === "happy" ? "0s" : "indefinite"}
            />
          </path>

          {/* Sad Mouth - smoother animation */}
          <path
            d="M30 75 Q50 60 70 75"
            stroke="#0ea5e9"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            opacity={mouthOpacities.sad}
          >
            <animate
              attributeName="d"
              values="M30 75 Q50 60 70 75; M30 77 Q50 58 70 77; M30 75 Q50 60 70 75"
              dur="4s"
              repeatCount="indefinite"
              begin={mood === "sad" ? "0s" : "indefinite"}
            />
          </path>

          {/* Angry Mouth - pulsing animation */}
          <path
            d="M30 75 L70 75"
            stroke="#0ea5e9"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
            opacity={mouthOpacities.angry}
          >
            <animate
              attributeName="stroke-width"
              values="5;6;5"
              dur="1.5s"
              repeatCount="indefinite"
              begin={mood === "angry" ? "0s" : "indefinite"}
            />
            <animate
              attributeName="d"
              values="M30 75 L70 75; M32 75 L68 75; M30 75 L70 75"
              dur="2s"
              repeatCount="indefinite"
              begin={mood === "angry" ? "0s" : "indefinite"}
            />
          </path>

          {/* Neutral Mouth - subtle breathing animation */}
          <path
            d="M30 70 L70 70"
            stroke="#0ea5e9"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            opacity={mouthOpacities.neutral}
          >
            <animate
              attributeName="stroke-width"
              values="4;4.5;4"
              dur="4s"
              repeatCount="indefinite"
              begin={mood === "neutral" ? "0s" : "indefinite"}
            />
          </path>

          {/* Surprised Mouth - O shape with pulsing animation */}
          <circle cx="50" cy="70" r="8" stroke="#0ea5e9" strokeWidth="4" fill="none" opacity={mouthOpacities.surprised}>
            <animate
              attributeName="r"
              values="8;9;8"
              dur="1.5s"
              repeatCount="indefinite"
              begin={mood === "surprised" ? "0s" : "indefinite"}
            />
          </circle>

          {/* Eyebrows - for angry expression with enhanced animation */}
          <path d="M20 30 L35 35" stroke="#0ea5e9" strokeWidth="4" strokeLinecap="round" opacity={eyebrowsOpacity}>
            <animate
              attributeName="d"
              values="M20 30 L35 35; M20 28 L35 34; M20 30 L35 35"
              dur="1.5s"
              repeatCount="indefinite"
              begin={mood === "angry" ? "0s" : "indefinite"}
            />
          </path>

          <path d="M80 30 L65 35" stroke="#0ea5e9" strokeWidth="4" strokeLinecap="round" opacity={eyebrowsOpacity}>
            <animate
              attributeName="d"
              values="M80 30 L65 35; M80 28 L65 34; M80 30 L65 35"
              dur="1.5s"
              repeatCount="indefinite"
              begin={mood === "angry" ? "0.2s" : "indefinite"}
            />
          </path>

        
            

         
          
        </svg>
      </div>

      <div className="mt-6 text-center">
        <span className="text-4xl md:text-5xl font-bold text-white">
          Mood<span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-cyan-400">Ingo</span>
        </span>
        <div className="text-sm md:text-base bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-300 mt-1">
          Emotional Intelligence AI
        </div>
      </div>
    </div>
  )
}

// Helper function to get emotion descriptions
function getEmotionDescription(mood) {
  const descriptions = {
    happy:
      "Displaying signs of joy, pleasure, or contentment. Expression often includes raised cheeks and upturned mouth corners.",
    sad: "Showing signs of unhappiness or despondency. Often characterized by downturned mouth and lowered eyebrows.",
    angry:
      "Exhibiting signs of annoyance, hostility or displeasure. Typically includes furrowed brows and tightened lips.",
    neutral: "Showing a balanced expression with no strong emotional signals. A calm, resting state.",
    surprised: "Indicating astonishment or wonder. Features often include widened eyes and open mouth.",
    fearful: "Displaying signs of anxiety or fright. Characterized by widened eyes and raised eyebrows.",
    disgusted: "Showing aversion or revulsion. Often includes wrinkled nose and raised upper lip.",
  }

  return descriptions[mood] || "Analyzing facial expressions in real-time..."
}
