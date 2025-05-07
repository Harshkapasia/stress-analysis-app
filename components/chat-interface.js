'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import MessageBubble from '@/components/message-bubble';
import MoodIndicator from '@/components/mood-indicator';

export default function ChatInterface() {
  const [sessionId, setSessionId] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [detectedMood, setDetectedMood] = useState('');
  const [energyLevel, setEnergyLevel] = useState('');
  const [therapeuticResponse, setTherapeuticResponse] = useState('');
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const synthRef = useRef(null);
  const messagesEndRef = useRef(null);
  
  // Initialize session and speech synthesis
  useEffect(() => {
    // Generate a session ID
    const newSessionId = `session-${Date.now()}`;
    setSessionId(newSessionId);
    
    // Set up speech synthesis
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
    
    // Initialize with welcome message
    setMessages([
      {
        role: 'assistant',
        content: 'Hello, I\'m your AI therapist. How are you feeling today? You can speak to me by pressing the microphone button.'
      }
    ]);
    
    return () => {
      // Clean up
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (synthRef.current && synthRef.current.speaking) {
        synthRef.current.cancel();
      }
    };
  }, []);
  
  // Scroll to bottom of messages whenever they update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const startRecording = async () => {
    try {
      setError('');
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create audio context for visualization (optional)
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      // Set up media recorder
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
      
      // Add visual feedback
      setMessages(prev => [
        ...prev,
        {
          role: 'system',
          content: 'Listening...',
          status: 'recording'
        }
      ]);
      
    } catch (err) {
      setError('Unable to access microphone. Please make sure your microphone is connected and you have granted permission.');
      console.error('Error accessing microphone:', err);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      // Update the last message
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && lastMessage.status === 'recording') {
          lastMessage.content = 'Processing your message...';
          lastMessage.status = 'processing';
        }
        return newMessages;
      });
    }
  };
  
  const processAudio = async () => {
    try {
      setIsProcessing(true);
      
      // Create audio blob from recorded chunks
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // Create form data for API request
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('session_id', sessionId);
      
      // Send to backend
      const response = await fetch('http://127.0.0.1:8000/api/process-audio/', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Update states with response data
      setTranscribedText(result.transcribed_text);
      setDetectedMood(result.detected_mood);
      setEnergyLevel(result.energy_level);
      setTherapeuticResponse(result.therapeutic_response);
      
      // Update messages
      setMessages(prev => {
        const newMessages = [...prev].filter(msg => msg.status !== 'recording' && msg.status !== 'processing');
        return [
          ...newMessages,
          { role: 'user', content: result.transcribed_text },
          { role: 'assistant', content: result.therapeutic_response, mood: result.detected_mood }
        ];
      });
      
      // Play response using text-to-speech
      speakResponse(result.therapeutic_response);
      
    } catch (err) {
      setError(`Error processing audio: ${err.message}`);
      console.error('Error processing audio:', err);
      
      // Remove the processing message and add error
      setMessages(prev => {
        const newMessages = [...prev].filter(msg => msg.status !== 'recording' && msg.status !== 'processing');
        return [
          ...newMessages,
          { role: 'system', content: `Error: ${err.message}`, status: 'error' }
        ];
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const speakResponse = (text) => {
    if (synthRef.current) {
      // Cancel any ongoing speech
      if (synthRef.current.speaking) {
        synthRef.current.cancel();
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice properties
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Get available voices and select a good one if available
      const voices = synthRef.current.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Female') || 
        voice.name.includes('Samantha') || 
        voice.name.includes('Google') || 
        voice.lang === 'en-US'
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      // Events
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (e) => {
        console.error('Speech synthesis error:', e);
        setIsSpeaking(false);
      };
      
      // Speak
      synthRef.current.speak(utterance);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-900/30 border border-red-800/50 p-4 rounded-lg text-center m-4"
          >
            <p className="text-red-400">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Chat messages */}
      <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-green-900 scrollbar-track-black">
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <MessageBubble message={message} />
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Audio controls */}
      <div className="p-4 border-t border-green-900/30">
        <div className="bg-black rounded-lg p-4 flex items-center">
          <div className="flex-1 flex justify-center">
            {isRecording ? (
              <motion.button
                onClick={stopRecording}
                disabled={isProcessing}
                whileTap={{ scale: 0.95 }}
                className="h-16 w-16 rounded-full bg-red-600 flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.5)] hover:shadow-[0_0_20px_rgba(220,38,38,0.7)] transition-all duration-300 focus:outline-none"
              >
                <MicOff className="h-8 w-8 text-white" />
              </motion.button>
            ) : (
              <motion.button
                onClick={startRecording}
                disabled={isProcessing || isSpeaking}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`h-16 w-16 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none ${
                  isProcessing || isSpeaking ? 
                  'bg-gray-800 cursor-not-allowed' : 
                  'bg-green-600 hover:bg-green-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                }`}
              >
                <Mic className="h-8 w-8 text-white" />
              </motion.button>
            )}
          </div>
          
          {/* Status indicator */}
          <div className="text-sm text-gray-400 w-40 text-right">
            {isProcessing ? (
              <span className="flex items-center justify-end">
                <Loader2 className="mr-2 h-4 w-4 text-yellow-500 animate-spin" />
                Processing...
              </span>
            ) : isSpeaking ? (
              <span className="flex items-center justify-end">
                <div className="mr-2 flex space-x-1">
                  <div className="w-1 h-3 bg-green-500 animate-pulse" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1 h-4 bg-green-500 animate-pulse" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1 h-2 bg-green-500 animate-pulse" style={{ animationDelay: '300ms' }}></div>
                </div>
                Speaking...
              </span>
            ) : isRecording ? (
              <span className="flex items-center justify-end">
                <div className="mr-2 h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
                Recording...
              </span>
            ) : (
              <span>Tap to speak</span>
            )}
          </div>
        </div>
      </div>
      
      {/* Mood display */}
      {detectedMood && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 border-t border-green-900/30 bg-black"
        >
          <div className="max-w-xs mx-auto">
            <MoodIndicator mood={detectedMood} />
          </div>
        </motion.div>
      )}
    </div>
  );
}
