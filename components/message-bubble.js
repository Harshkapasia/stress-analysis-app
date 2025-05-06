import { Volume2, Loader2 } from "lucide-react"

export default function MessageBubble({ message }) {
  // Function to get appropriate color for mood
  const getMoodColor = (mood) => {
    if (!mood) return "bg-gray-800"

    mood = mood.toLowerCase()
    if (mood.includes("happy") || mood.includes("joy") || mood.includes("excited")) {
      return "bg-yellow-500"
    } else if (mood.includes("sad") || mood.includes("depressed") || mood.includes("down")) {
      return "bg-blue-600"
    } else if (mood.includes("angry") || mood.includes("frustrat") || mood.includes("annoyed")) {
      return "bg-red-500"
    } else if (mood.includes("anxious") || mood.includes("worried") || mood.includes("stress")) {
      return "bg-purple-500"
    } else if (mood.includes("calm") || mood.includes("relax")) {
      return "bg-green-500"
    } else if (mood.includes("neutral")) {
      return "bg-gray-500"
    }

    return "bg-green-500"
  }

  if (message.role === "system") {
    return (
      <div className="bg-gray-900/70 text-gray-300 p-3 rounded-lg max-w-xs md:max-w-md lg:max-w-lg border border-gray-800/50 backdrop-blur-sm">
        {message.status === "recording" ? (
          <div className="flex items-center">
            <div className="mr-2 h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
            {message.content}
          </div>
        ) : message.status === "processing" ? (
          <div className="flex items-center">
            <Loader2 className="mr-2 h-4 w-4 text-green-500 animate-spin" />
            {message.content}
          </div>
        ) : (
          <div className={`flex items-center ${message.status === "error" ? "text-red-400" : ""}`}>
            {message.content}
          </div>
        )}
      </div>
    )
  }

  if (message.role === "user") {
    return (
      <div className="bg-green-900/50 p-3 rounded-lg max-w-xs md:max-w-md lg:max-w-lg border border-green-800/30 backdrop-blur-sm">
        {message.content}
      </div>
    )
  }

  return (
    <div className="flex items-start">
      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mr-2 mt-1 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
        <Volume2 className="h-4 w-4 text-black" />
      </div>
      <div className="bg-gray-900/70 p-3 rounded-lg max-w-xs md:max-w-md lg:max-w-lg border border-gray-800/50 backdrop-blur-sm">
        {message.mood && (
          <div className="mb-2 text-xs text-gray-400 flex items-center">
            <div className={`h-2 w-2 rounded-full ${getMoodColor(message.mood)} mr-1`}></div>
            <span>{message.mood}</span>
          </div>
        )}
        {message.content}
      </div>
    </div>
  )
}
