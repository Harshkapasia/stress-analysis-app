import { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';

export default function FaceDetection() {
    const videoRef = useRef();
    const canvasRef = useRef();
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [detectedMood, setDetectedMood] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const loadModels = async () => {
            try {
                const MODEL_URL = '/models';
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
                ]);
                setIsModelLoaded(true);
                startVideo();
            } catch (error) {
                setError('Failed to load models');
                console.error('Error loading models:', error);
            }
        };

        loadModels();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, []);

    const startVideo = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            setError('Camera access denied');
            console.error('Error accessing webcam:', err);
        }
    };

    const handleVideoPlay = () => {
        if (isModelLoaded) {
            const canvas = canvasRef.current;
            const video = videoRef.current;

            const displaySize = { width: video.videoWidth, height: video.videoHeight };
            faceapi.matchDimensions(canvas, displaySize);

            const interval = setInterval(async () => {
                if (video.readyState === 4) {
                    const detections = await faceapi
                        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                        .withFaceExpressions();

                    if (detections && detections.length > 0) {
                        const expressions = detections[0].expressions;
                        const maxExpression = Object.keys(expressions).reduce((a, b) =>
                            expressions[a] > expressions[b] ? a : b);

                        setDetectedMood(maxExpression);

                        // Draw canvas with detections
                        const resizedDetections = faceapi.resizeResults(detections, displaySize);
                        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
                        faceapi.draw.drawDetections(canvas, resizedDetections);
                        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
                    }
                }
            }, 200);

            return () => clearInterval(interval);
        }
    };

    // Map face-api expressions to our animation states
    const mapMoodToAnimationState = (mood) => {
        const moodMap = {
            'happy': 'happy',
            'sad': 'sad',
            'angry': 'angry',
            'neutral': 'neutral',
            'surprised': 'happy',
            'fearful': 'sad',
            'disgusted': 'angry'
        };
        return moodMap[mood] || 'neutral';
    };

    return (
        <section className="py-12 bg-gradient-to-b from-black to-gray-900 min-h-screen">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-600">Face Mood AI</h2>
                </div>

                <div className="mx-auto">
                    {error ? (
                        <div className="bg-red-900/30 border border-red-800 p-4 rounded-lg text-center mb-6 backdrop-blur-sm">
                            <p className="text-red-400">{error}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col lg:flex-row items-center gap-8">
                            <div className="relative w-full lg:w-2/3 aspect-video bg-black/50 rounded-xl overflow-hidden shadow-2xl border border-teal-900/50">
                                <video
                                    ref={videoRef}
                                    onPlay={handleVideoPlay}
                                    autoPlay
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover"
                                />
                                <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />

                                {!isModelLoaded && !error && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                                        <div className="text-center">
                                            <svg className="animate-spin mx-auto h-10 w-10 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <p className="mt-2 text-teal-400 text-sm">Loading models...</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="w-full lg:w-1/3">
                                <AnimatedEmotionLogo mood={mapMoodToAnimationState(detectedMood)} />

                                {detectedMood && (
                                    <div className="mt-4 p-4 bg-teal-900/20 backdrop-blur-sm border border-teal-800/50 rounded-lg text-center">
                                        <p className="text-2xl font-bold text-teal-400">
                                            {detectedMood.charAt(0).toUpperCase() + detectedMood.slice(1)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

function AnimatedEmotionLogo({ mood = 'neutral' }) {
    // Set opacity values based on the current mood
    const mouthOpacities = {
        happy: mood === 'happy' ? '1' : '0',
        sad: mood === 'sad' ? '1' : '0',
        angry: mood === 'angry' ? '1' : '0',
        neutral: mood === 'neutral' ? '1' : '0'
    };

    const eyebrowsOpacity = mood === 'angry' ? '1' : '0';
    const tearDropsOpacity = mood === 'sad' ? '1' : '0';

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-64 h-64">
                <svg
                    viewBox="0 0 100 100"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full"
                >
                    {/* Base Face */}
                    <circle cx="50" cy="50" r="45" fill="black" stroke="#0D9488" strokeWidth="5" />

                    {/* Eyes - always present */}
                    <circle cx="30" cy="40" r="5" fill="#0D9488" />
                    <circle cx="70" cy="40" r="5" fill="#0D9488" />

                    {/* Happy Mouth */}
                    <path
                        d="M30 65 Q50 80 70 65"
                        stroke="#0D9488"
                        strokeWidth="5"
                        strokeLinecap="round"
                        fill="none"
                        opacity={mouthOpacities.happy}
                    />

                    {/* Sad Mouth */}
                    <path
                        d="M30 75 Q50 60 70 75"
                        stroke="#0D9488"
                        strokeWidth="5"
                        strokeLinecap="round"
                        fill="none"
                        opacity={mouthOpacities.sad}
                    />

                    {/* Angry Mouth */}
                    <path
                        d="M30 75 L70 75"
                        stroke="#0D9488"
                        strokeWidth="5"
                        strokeLinecap="round"
                        fill="none"
                        opacity={mouthOpacities.angry}
                    />

                    {/* Neutral Mouth */}
                    <path
                        d="M30 70 L70 70"
                        stroke="#0D9488"
                        strokeWidth="5"
                        strokeLinecap="round"
                        fill="none"
                        opacity={mouthOpacities.neutral}
                    />

                    {/* Eyebrows - for angry expression */}
                    <path
                        d="M20 30 L35 35"
                        stroke="#0D9488"
                        strokeWidth="4"
                        strokeLinecap="round"
                        opacity={eyebrowsOpacity}
                    />

                    <path
                        d="M80 30 L65 35"
                        stroke="#0D9488"
                        strokeWidth="4"
                        strokeLinecap="round"
                        opacity={eyebrowsOpacity}
                    />

                    {/* Tear drops for sad face */}
                    <path
                        d="M25 45 Q23 50 25 55"
                        stroke="#0D9488"
                        strokeWidth="2"
                        fill="#0D9488"
                        opacity={tearDropsOpacity}
                    />

                    <path
                        d="M75 45 Q77 50 75 55"
                        stroke="#0D9488"
                        strokeWidth="2"
                        fill="#0D9488"
                        opacity={tearDropsOpacity}
                    />
                </svg>
            </div>

            <div className="mt-4 text-center">
                <span className="text-3xl font-bold text-white">Mood<span className="text-teal-500">Ingo</span></span>
                <div className="text-xs text-teal-600">Emotional Intelligence AI</div>
            </div>
        </div>
    );
}