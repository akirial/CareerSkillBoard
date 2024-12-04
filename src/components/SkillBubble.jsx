import { useState } from "react";




const SkillBubble = ({ skill, rank, frequency, maxFrequency, urlResult }) => {
  // Adjust color gradient based on rank
  const getBubbleColor = (rank) => {
    if (rank === 1) return "bg-gradient-to-br from-blue-400 to-blue-600"; // Top rank: Blue
    if (rank === 2) return "bg-gradient-to-br from-green-400 to-green-600"; // Second rank: Green
    if (rank === 3) return "bg-gradient-to-br from-yellow-400 to-yellow-600"; // Third rank: Yellow
    if (rank <= 5) return "bg-gradient-to-br from-orange-400 to-orange-600"; // Ranks 4 and 5: Orange
    return "bg-gradient-to-br from-red-400 to-red-600"; // Lower ranks: Red
  };

  // State to manage hover and flip behaviors
  const [isHovered, setIsHovered] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  // Parse URL from urlResult
  const extractUrl = (input) => {
    if (!input) return null; // Check if input is undefined or null
    try {
      const url = new URL(input);
      return url.href;
    } catch {
      const match = input.match(/https?:\/\/[^\s]+/);
      if (match) {
        // Remove parentheses around the URL if they exist
        return match[0].replace(/[()]/g, '');
      }
      return null;
    }
  };

  const parsedUrl = extractUrl(urlResult); // Extracted URL

  // Function to remove the '-#times' part from the skill string
  const cleanSkillString = (skill) => {
    return skill.replace(/ - \d+\s*times$/, '');
  };

  const cleanedSkill = cleanSkillString(skill); // Cleaned skill string

  return (
    <div
      className={`relative ${getBubbleColor(rank)} text-white m-2 rounded-xl px-4 py-4 cursor-pointer transform transition-all duration-300 shadow-lg ${
        isHovered ? "scale-110" : "scale-100"
      } ${isFlipped ? "rotate-y-180 bg-white" : ""}`}
      style={{
        perspective: "1000px",
        width: "400px",
        height: "200px",
        maxWidth: "100%",
        overflow: "hidden",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsFlipped(false); // Reset flip state when mouse leaves
      }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={`w-full h-full rounded-xl backface-hidden transition-transform duration-500 ${
          isFlipped ? "rotate-y-180" : ""
        }`}
      >
        {/* Front Side */}
        {!isFlipped && (
          <div className="flex flex-col items-center justify-center w-full h-full text-center">
            <div className="font-extrabold text-5xl">{rank}</div>
            <div className="font-bold text-sm sm:text-lg">{cleanedSkill}</div>
            <div className="text-xs mt-2">Frequency: {frequency}</div>
            {isHovered && (
              <div className="absolute bottom-2 left-2 right-2 bg-white text-black p-2 rounded-lg shadow-md">
                {cleanedSkill}
              </div>
            )}
          </div>
        )}

        {/* Back Side */}
        {isFlipped && (
          <div className="w-full h-full bg-white text-black flex flex-col items-center justify-center rounded-xl shadow-lg">
            <div className="mb-2">Resources for the skill:</div>
            {parsedUrl ? (
              <a
                href={parsedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {parsedUrl}
              </a>
            ) : (
              <div className="text-gray-500">No valid resources available</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

SkillBubble.defaultProps = {
  urlResult: '', // Default to an empty string to avoid undefined
};

export default SkillBubble;
