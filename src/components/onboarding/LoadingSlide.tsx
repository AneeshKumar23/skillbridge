
import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface LoadingSlideProp {
  onComplete: () => void;
}

const loadingSlides = [
  {
    icon: "🎯",
    title: "Finding Your Perfect Learning Path",
    description: "SkillBridge uses AI to create personalized learning experiences tailored just for you."
  },
  {
    icon: "🚀",
    title: "Connecting You with Expert Mentors",
    description: "Get guidance from industry professionals who've walked the path you're about to take."
  },
  {
    icon: "🏆",
    title: "Building Your Achievement System",
    description: "Earn badges, certificates, and build a portfolio that showcases your growing skills."
  },
  {
    icon: "🌟",
    title: "Creating Your Success Story",
    description: "Join thousands of learners who've transformed their careers with SkillBridge."
  },
  {
    icon: "🎉",
    title: "Almost Ready!",
    description: "Your personalized learning environment is being prepared..."
  }
];

const LoadingSlide = ({ onComplete }: LoadingSlideProp) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide(prev => {
        if (prev >= loadingSlides.length - 1) {
          clearInterval(slideInterval);
          setTimeout(onComplete, 1000);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => {
      clearInterval(slideInterval);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg text-center">
        <div className="mb-8">
          <img 
            src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=80&h=80&fit=crop&crop=center" 
            alt="SkillBridge Logo" 
            className="h-20 w-20 mx-auto mb-4 rounded-xl animate-pulse"
          />
        </div>

        <Card className="mb-8 transform transition-all duration-500 hover:scale-105">
          <CardContent className="p-8">
            <div className="text-6xl mb-4 animate-bounce">
              {loadingSlides[currentSlide]?.icon}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {loadingSlides[currentSlide]?.title}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {loadingSlides[currentSlide]?.description}
            </p>
          </CardContent>
        </Card>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div 
            className="bg-gradient-to-r from-blue-400 to-purple-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <p className="text-gray-500 text-sm">
          {progress}% Complete
        </p>

        {/* Floating particles animation */}
        <div className="fixed inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-400 rounded-full animate-ping"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 2) * 40}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: '2s'
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingSlide;
