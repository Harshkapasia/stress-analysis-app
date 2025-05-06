export default function MoodIndicator({ mood }) {
    // Function to get appropriate color for mood
    const getMoodColor = (mood) => {
      if (!mood) return "from-gray-700 to-gray-800"
  
      mood = mood.toLowerCase()
      if (mood.includes("happy") || mood.includes("joy") || mood.includes("excited")) {
        return "from-yellow-500 to-yellow-600"
      } else if (mood.includes("sad") || mood.includes("depressed") || mood.includes("down")) {
        return "from-blue-600 to-blue-700"
      } else if (mood.includes("angry") || mood.includes("frustrat") || mood.includes("annoyed")) {
        return "from-red-500 to-red-600"
      } else if (mood.includes("anxious") || mood.includes("worried") || mood.includes("stress")) {
        return "from-purple-500 to-purple-600"
      } else if (mood.includes("calm") || mood.includes("relax")) {
        return "from-green-500 to-green-600"
      } else if (mood.includes("neutral")) {
        return "from-gray-500 to-gray-600"
      }
  
      return "from-green-500 to-green-600"
    }
  
    // Function to get emoji for mood
    const getMoodEmoji = (mood) => {
      if (!mood) return "😐"
  
      mood = mood.toLowerCase()
      if (mood.includes("happy") || mood.includes("joy") || mood.includes("excited")) {
        return "😊"
      } else if (mood.includes("sad") || mood.includes("depressed") || mood.includes("down")) {
        return "😔"
      } else if (mood.includes("angry") || mood.includes("frustrat") || mood.includes("annoyed")) {
        return "😠"
      } else if (mood.includes("anxious") || mood.includes("worried") || mood.includes("stress")) {
        return "😰"
      } else if (mood.includes("calm") || mood.includes("relax")) {
        return "😌"
      } else if (mood.includes("neutral")) {
        return "😐"
      }
  
      return "😐"
    }
  
    return (
      <div className="bg-black/50 rounded-lg p-3 border border-green-900/30">
        <div className="text-xs text-gray-400 mb-1 text-center">Current Mood</div>
        <div
          className={`bg-gradient-to-r ${getMoodColor(mood)} rounded-lg p-3 flex items-center justify-center shadow-lg`}
        >
          <span className="text-2xl mr-2">{getMoodEmoji(mood)}</span>
          <span className="text-lg font-medium">{mood}</span>
        </div>
      </div>
    )
  }
  