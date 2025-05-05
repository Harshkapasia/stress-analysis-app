import { useState, useRef } from 'react';

export default function VoiceDetection() {
    const [isRecording, setIsRecording] = useState(false);
    const [detectedMood, setDetectedMood] = useState('');
    const [error, setError] = useState('');
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = analyzeMood;

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            setError('Unable to access microphone. Please make sure your microphone is connected and you have granted permission.');
            console.error('Error accessing microphone:', err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);

            // Stop the audio tracks
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const analyzeMood = () => {
        // In a real app, we would send the audio data to a backend for analysis
        // For demonstration purposes, we'll simulate a mood detection response
        const moods = ['Happy', 'Calm', 'Excited', 'Anxious', 'Neutral'];
        const randomMood = moods[Math.floor(Math.random() * moods.length)];

        // Simulate a brief delay for "processing"
        setTimeout(() => {
            setDetectedMood(randomMood);
        }, 1500);
    };

    return (
        <section className="py-12 bg-black">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-green-400 mb-2">Voice Mood Detection</h2>
                    <p className="text-gray-300">Our AI analyzes your voice patterns to detect your emotional state.</p>
                </div>

                <div className="mx-auto max-w-md">
                    {error ? (
                        <div className="bg-red-900 bg-opacity-30 border border-red-800 p-4 rounded-lg text-center mb-6">
                            <p className="text-red-400">{error}</p>
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className="mb-8">
                                <button
                                    onClick={isRecording ? stopRecording : startRecording}
                                    className={`w-32 h-32 rounded-full focus:outline-none transition-all duration-300 ${isRecording
                                        ? 'bg-red-600 animate-pulse'
                                        : 'bg-green-600 hover:bg-green-500'
                                        }`}
                                >
                                    <span className="sr-only">{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
                                    {isRecording ? (
                                        <svg className="w-16 h-16 mx-auto text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <rect x="6" y="6" width="12" height="12" strokeWidth="2" />
                                        </svg>
                                    ) : (
                                        <svg className="w-16 h-16 mx-auto text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                        </svg>
                                    )}
                                </button>
                                <p className="mt-4 text-lg text-gray-300">
                                    {isRecording ? 'Recording... Click to stop' : 'Tap to start recording your voice'}
                                </p>
                            </div>

                            {detectedMood && (
                                <div className="mt-4 p-4 bg-green-900 bg-opacity-30 border border-green-800 rounded-lg">
                                    <h3 className="text-xl font-semibold text-white mb-2">Detected Mood</h3>
                                    <p className="text-2xl font-bold text-green-400">{detectedMood}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}