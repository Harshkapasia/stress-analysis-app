// pages/index.js
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import * as faceapi from 'face-api.js';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import FaceDetection from '@/components/FaceDetection';
import VoiceDetection from '@/components/VoiceDetection';

export default function Home() {
  const [activeFeature, setActiveFeature] = useState(null);

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Head>
        <title>MoodIngo - Emotion Detection</title>
        <meta name="description" content="Detect emotions through face and voice analysis" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <main className="flex-grow">
        <Hero setActiveFeature={setActiveFeature} />

        {activeFeature === 'face' && <FaceDetection />}
        {activeFeature === 'voice' && <VoiceDetection />}
      </main>

      <Footer />
    </div>
  );
}