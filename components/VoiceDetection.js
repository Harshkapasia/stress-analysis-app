import { useState, useRef } from 'react';
import axios from 'axios';

export default function VoiceDetection() {
    const [isRecording, setIsRecording] = useState(false);
    const [detectedMood, setDetectedMood] = useState('');
    const [transcribedText, setTranscribedText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    // AssemblyAI API configuration
    const assemblyBaseUrl = "https://api.assemblyai.com";
    const assemblyHeaders = {
        authorization: "c8bd066663fb4673bff02eff99d5bde4",
    };

    // Akash Chat API configuration
    const akashClient = axios.create({
        baseURL: 'https://chatapi.akash.network/api/v1',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer sk-nMngtXzP9DCOd7SnQ1J2Kg'
        }
    });

    const startRecording = async () => {
        try {
            // Reset states
            setDetectedMood('');
            setTranscribedText('');
            setError('');

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = processAudio;

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

    const processAudio = async () => {
        try {
            setIsProcessing(true);

            // Create audio blob from recorded chunks
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

            // Upload audio to AssemblyAI
            const formData = new FormData();
            formData.append('file', audioBlob);

            // Upload the audio file
            const uploadResponse = await axios.post(`${assemblyBaseUrl}/v2/upload`, audioBlob, {
                headers: {
                    ...assemblyHeaders,
                    'Content-Type': 'application/octet-stream'
                },
            });

            const audioUrl = uploadResponse.data.upload_url;
            console.log("Audio uploaded successfully:", audioUrl);

            // Request transcription
            const transcriptionResponse = await axios.post(
                `${assemblyBaseUrl}/v2/transcript`,
                {
                    audio_url: audioUrl,
                    speech_model: "universal",
                },
                { headers: assemblyHeaders }
            );

            const transcriptId = transcriptionResponse.data.id;
            console.log("Transcription requested, ID:", transcriptId);

            // Poll for transcription results
            const pollingEndpoint = `${assemblyBaseUrl}/v2/transcript/${transcriptId}`;

            let transcribedText = '';
            while (true) {
                const pollingResponse = await axios.get(pollingEndpoint, {
                    headers: assemblyHeaders,
                });

                const transcriptionResult = pollingResponse.data;

                if (transcriptionResult.status === "completed") {
                    console.log("Transcription completed!");
                    transcribedText = transcriptionResult.text;
                    setTranscribedText(transcribedText);
                    break;
                } else if (transcriptionResult.status === "error") {
                    throw new Error(`Transcription failed: ${transcriptionResult.error}`);
                } else {
                    console.log("Transcription in progress, waiting...");
                    await new Promise((resolve) => setTimeout(resolve, 3000));
                }
            }

            // Now analyze the mood using Akash Chat API
            await analyzeMood(transcribedText);

        } catch (err) {
            setError('Error processing audio: ' + err.message);
            console.error('Error processing audio:', err);
        } finally {
            setIsProcessing(false);
        }
    };

    const analyzeMood = async (text) => {
        try {
            if (!text || text.trim() === '') {
                setDetectedMood('No speech detected');
                return;
            }

            const response = await akashClient.post(
                '/chat/completions',
                {
                    model: "Meta-Llama-3-1-8B-Instruct-FP8",
                    messages: [
                        {
                            role: "system",
                            content: "You are an emotion analysis assistant. Analyze the text and determine the emotional state of the speaker. Respond with a single word describing their mood (happy, sad, angry, neutral, etc.)."
                        },
                        {
                            role: "user",
                            content: text
                        }
                    ]
                }
            );

            // Extract the response content
            const content = response.data.choices[0].message.content;
            setDetectedMood(content);

        } catch (err) {
            console.error('Error analyzing mood:', err);
            setError('Error analyzing mood: ' + err.message);
        }
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
                                    disabled={isProcessing}
                                    className={`w-32 h-32 rounded-full focus:outline-none transition-all duration-300 ${isProcessing
                                            ? 'bg-yellow-600 cursor-not-allowed'
                                            : isRecording
                                                ? 'bg-red-600 animate-pulse'
                                                : 'bg-green-600 hover:bg-green-500'
                                        }`}
                                >
                                    <span className="sr-only">
                                        {isProcessing
                                            ? 'Processing'
                                            : isRecording
                                                ? 'Stop Recording'
                                                : 'Start Recording'
                                        }
                                    </span>
                                    {isProcessing ? (
                                        <svg className="w-16 h-16 mx-auto text-white animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : isRecording ? (
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
                                    {isProcessing
                                        ? 'Processing audio...'
                                        : isRecording
                                            ? 'Recording... Click to stop'
                                            : 'Tap to start recording your voice'
                                    }
                                </p>
                            </div>

                            {transcribedText && (
                                <div className="mt-4 p-4 bg-gray-900 bg-opacity-30 border border-gray-800 rounded-lg mb-4">
                                    <h3 className="text-xl font-semibold text-white mb-2">Transcribed Text</h3>
                                    <p className="text-gray-300">{transcribedText}</p>
                                </div>
                            )}

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