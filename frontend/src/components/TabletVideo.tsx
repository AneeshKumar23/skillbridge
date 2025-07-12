
import { Play } from 'lucide-react';
import { useState } from 'react';

const TabletVideo = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="relative mx-auto max-w-md">
      {/* Tablet Frame */}
      <div className="relative bg-gray-800 rounded-3xl p-6 shadow-2xl">
        {/* Screen */}
        <div className="bg-black rounded-2xl overflow-hidden aspect-[4/3] relative">
          {/* Video Placeholder */}
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            {!isPlaying ? (
              <button
                onClick={() => setIsPlaying(true)}
                className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-6 hover:bg-opacity-30 transition-all duration-300 transform hover:scale-105"
              >
                <Play className="h-12 w-12 text-white ml-1" fill="white" />
              </button>
            ) : (
              <div className="w-full h-full bg-black flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="animate-pulse">
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full mx-auto mb-4"></div>
                    <p>Video Playing...</p>
                    <p className="text-sm opacity-70 mt-2">SkillBridge Demo</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Video Overlay Info */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-3">
              <h3 className="text-white font-semibold text-sm">Learn Anywhere, Anytime</h3>
              <p className="text-white text-xs opacity-80">Experience SkillBridge on any device</p>
            </div>
          </div>
        </div>
        
        {/* Home Button */}
        <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mt-4"></div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute -top-4 -right-4 bg-green-400 rounded-full p-3 shadow-lg animate-bounce">
        <div className="w-3 h-3 bg-white rounded-full"></div>
      </div>
      <div className="absolute -bottom-4 -left-4 bg-yellow-400 rounded-full p-2 shadow-lg animate-pulse">
        <div className="w-2 h-2 bg-white rounded-full"></div>
      </div>
    </div>
  );
};

export default TabletVideo;
