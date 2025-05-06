'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { Mic, MicOff, Phone, PhoneOff, Volume2, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

// Lazy load the chat interface component
const ChatInterface = dynamic(() => import('@/components/chat-interface'), {
  loading: () => <ChatLoading />,
  ssr: false,
});

// Loading component with animation
function ChatLoading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center animate-pulse">
        <Loader2 className="h-8 w-8 text-green-500 animate-spin" />
      </div>
      <p className="mt-4 text-green-500 animate-pulse">Loading interface...</p>
    </div>
  );
}

export default function VoiceAnalyzer() {
  const [isCallActive, setIsCallActive] = useState(false);
  
  const startCall = () => {
    setIsCallActive(true);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="bg-black p-4 flex items-center justify-between border-b border-green-900/30">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
            <Volume2 className="h-6 w-6 text-black" />
          </div>
          <h1 className="ml-3 text-xl font-bold text-green-400">Moodingo Voice Analyzer</h1>
        </div>
        
        <div className="flex items-center">
          {isCallActive ? (
            <button 
              onClick={() => setIsCallActive(false)}
              className="flex items-center px-4 py-2 bg-red-900/80 hover:bg-red-800 rounded-full transition-all duration-300 border border-red-700/50"
            >
              <PhoneOff className="h-4 w-4 mr-1" />
              <span>End Session</span>
            </button>
          ) : (
            <button 
              onClick={startCall}
              className="flex items-center px-4 py-2 bg-green-900/80 hover:bg-green-800 rounded-full transition-all duration-300 border border-green-700/50"
            >
              <Phone className="h-4 w-4 mr-1" />
              <span>Start Session</span>
            </button>
          )}
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 flex flex-col max-w-4xl w-full mx-auto">
        {!isCallActive ? (
          <WelcomeScreen onStart={startCall} />
        ) : (
          <Suspense fallback={<ChatLoading />}>
            <ChatInterface />
          </Suspense>
        )}
      </main>
    </div>
  );
}

function WelcomeScreen({ onStart }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="h-24 w-24 mb-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-pulse">
        <Volume2 className="h-12 w-12 text-black" />
      </div>
      <h2 className="text-2xl font-bold mb-3 text-green-400">Welcome to Moodingo Voice Analyzer</h2>
      <p className="text-gray-400 max-w-md mb-8">
        A safe space where you can speak freely. Our AI analyzes your voice and responds with empathy.
      </p>
      <button 
        onClick={onStart}
        className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 rounded-full hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all duration-300 text-lg font-medium border border-green-500/30"
      >
        Start Your Session
      </button>
    </div>
  );
}
