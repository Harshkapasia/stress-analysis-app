import { useState } from 'react';

function AnimatedEmotionLogo() {
    return (
        <div className="flex flex-col items-center">
            {/* Responsive sizing - smaller on mobile, larger on desktop */}
            <div className="relative w-64 h-64 md:w-128 md:h-128">
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

                    {/* Happy Mouth - initially visible */}
                    <path
                        d="M30 65 Q50 80 70 65"
                        stroke="#0D9488"
                        strokeWidth="5"
                        strokeLinecap="round"
                        fill="none"
                        opacity="1"
                    >
                        <animate
                            attributeName="opacity"
                            values="1;0;0;0;1"
                            dur="8s"
                            repeatCount="indefinite"
                        />
                        <animate
                            attributeName="d"
                            values="M30 65 Q50 80 70 65;M30 65 Q50 80 70 65"
                            dur="8s"
                            repeatCount="indefinite"
                        />
                    </path>

                    {/* Sad Mouth */}
                    <path
                        d="M30 75 Q50 60 70 75"
                        stroke="#0D9488"
                        strokeWidth="5"
                        strokeLinecap="round"
                        fill="none"
                        opacity="0"
                    >
                        <animate
                            attributeName="opacity"
                            values="0;1;0;0;0"
                            dur="8s"
                            repeatCount="indefinite"
                        />
                    </path>

                    {/* Angry Mouth */}
                    <path
                        d="M30 75 L70 75"
                        stroke="#0D9488"
                        strokeWidth="5"
                        strokeLinecap="round"
                        fill="none"
                        opacity="0"
                    >
                        <animate
                            attributeName="opacity"
                            values="0;0;1;0;0"
                            dur="8s"
                            repeatCount="indefinite"
                        />
                    </path>

                    {/* Neutral Mouth */}
                    <path
                        d="M30 70 L70 70"
                        stroke="#0D9488"
                        strokeWidth="5"
                        strokeLinecap="round"
                        fill="none"
                        opacity="0"
                    >
                        <animate
                            attributeName="opacity"
                            values="0;0;0;1;0"
                            dur="8s"
                            repeatCount="indefinite"
                        />
                    </path>

                    {/* Eyebrows - animate for angry expression */}
                    <path
                        d="M20 30 L35 35"
                        stroke="#0D9488"
                        strokeWidth="4"
                        strokeLinecap="round"
                        opacity="0"
                    >
                        <animate
                            attributeName="opacity"
                            values="0;0;1;0;0"
                            dur="8s"
                            repeatCount="indefinite"
                        />
                    </path>

                    <path
                        d="M80 30 L65 35"
                        stroke="#0D9488"
                        strokeWidth="4"
                        strokeLinecap="round"
                        opacity="0"
                    >
                        <animate
                            attributeName="opacity"
                            values="0;0;1;0;0"
                            dur="8s"
                            repeatCount="indefinite"
                        />
                    </path>

                    {/* Tear drops for sad face */}
                    <path
                        d="M25 45 Q23 50 25 55"
                        stroke="#0D9488"
                        strokeWidth="2"
                        fill="#0D9488"
                        opacity="0"
                    >
                        <animate
                            attributeName="opacity"
                            values="0;1;0;0;0"
                            dur="8s"
                            repeatCount="indefinite"
                        />
                    </path>

                    <path
                        d="M75 45 Q77 50 75 55"
                        stroke="#0D9488"
                        strokeWidth="2"
                        fill="#0D9488"
                        opacity="0"
                    >
                        <animate
                            attributeName="opacity"
                            values="0;1;0;0;0"
                            dur="8s"
                            repeatCount="indefinite"
                        />
                    </path>
                </svg>
            </div>

            {/* Responsive text sizing */}
            <div className="mt-4 md:mt-6 text-center">
                <span className="text-3xl md:text-5xl font-bold text-white">Mood<span className="text-teal-500">Ingo</span></span>
                <div className="text-xs md:text-sm text-teal-600">Emotional Intelligence AI</div>
            </div>
        </div>
    );
}

export default function Hero({ setActiveFeature }) {
    const [hoveredButton, setHoveredButton] = useState(null);

    return (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-black via-green-950 to-black relative overflow-hidden">
            {/* Subtle background elements */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-teal-500 blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-green-600 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left Column - Animated Logo */}
                    <div className="flex justify-center ">
                        <AnimatedEmotionLogo />
                    </div>

                    {/* Right Column - Text and CTAs */}
                    <div className="text-center lg:text-left">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-teal-500 to-emerald-400">
                                Discover Your Emotional Intelligence
                            </span>
                        </h1>

                        <h2 className="text-xl md:text-2xl text-white/80 font-light mb-6">
                            AI-powered technology that understands your emotions better than you do
                        </h2>

                        <p className="text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0">
                            MoodIngo uses advanced machine learning to analyze facial expressions
                            and voice patterns, helping you gain valuable insights into your emotional
                            state and build stronger connections with others.
                        </p>

                        <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                            <button
                                onClick={() => setActiveFeature('face')}
                                onMouseEnter={() => setHoveredButton('face')}
                                onMouseLeave={() => setHoveredButton(null)}
                                className="group relative overflow-hidden bg-gradient-to-r from-green-600 to-teal-600 text-white font-medium py-3 px-8 rounded-lg transition duration-300 transform hover:translate-y-1 hover:shadow-lg"
                            >
                                <span className="relative z-10">Try Face Detection</span>
                                <span className={`absolute inset-0 bg-gradient-to-r from-green-500 to-teal-500 transition-opacity duration-300 ${hoveredButton === 'face' ? 'opacity-100' : 'opacity-0'}`}></span>
                            </button>

                            <button
                                onClick={() => setActiveFeature('voice')}
                                onMouseEnter={() => setHoveredButton('voice')}
                                onMouseLeave={() => setHoveredButton(null)}
                                className="group relative overflow-hidden bg-transparent text-teal-400 font-medium py-3 px-8 border border-teal-500 rounded-lg transition duration-300 hover:text-white"
                            >
                                <span className="relative z-10">Try Voice Analysis</span>
                                <span className={`absolute inset-0 bg-gradient-to-r from-teal-600/80 to-green-600/80 transition-all duration-300 ${hoveredButton === 'voice' ? 'opacity-100' : 'opacity-0'}`}></span>
                            </button>
                        </div>

                        <div className="mt-10 grid grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className="text-teal-500 font-bold text-3xl">99%</div>
                                <div className="text-xs text-gray-400">Emotion Accuracy</div>
                            </div>
                            <div className="text-center">
                                <div className="text-teal-500 font-bold text-3xl">24/7</div>
                                <div className="text-xs text-gray-400">Mood Tracking</div>
                            </div>
                            <div className="text-center">
                                <div className="text-teal-500 font-bold text-3xl">10M+</div>
                                <div className="text-xs text-gray-400">Users Worldwide</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}