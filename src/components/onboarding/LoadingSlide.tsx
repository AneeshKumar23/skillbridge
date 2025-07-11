import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Sparkles, Rocket, Target, Trophy, Star, CheckCircle } from 'lucide-react';

interface LoadingSlideProp {
  onComplete: () => void;
}

const loadingSlides = [
  {
    icon: <Target className="w-12 h-12" />,
    title: "Finding Your Perfect Learning Path",
    description: "SkillBridge uses AI to create personalized learning experiences tailored just for you."
  },
  {
    icon: <Rocket className="w-12 h-12" />,
    title: "Connecting You with Expert Mentors",
    description: "Get guidance from industry professionals who've walked the path you're about to take."
  },
  {
    icon: <Trophy className="w-12 h-12" />,
    title: "Building Your Achievement System",
    description: "Earn badges, certificates, and build a portfolio that showcases your growing skills."
  },
  {
    icon: <Star className="w-12 h-12" />,
    title: "Creating Your Success Story",
    description: "Join thousands of learners who've transformed their careers with SkillBridge."
  },
  {
    icon: <CheckCircle className="w-12 h-12" />,
    title: "Almost Ready!",
    description: "Your personalized learning environment is being prepared..."
  }
];

const LoadingSlide = ({ onComplete }: LoadingSlideProp) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const progress = useMotionValue(0);
  const count = useTransform(progress, [0, 100], [0, 100]);
  const constraintsRef = useRef(null);

  useEffect(() => {
    const progressAnimation = animate(progress, 100, {
      duration: 5,
      ease: "easeInOut",
      onComplete: () => onComplete()
    });

    const slideInterval = setInterval(() => {
      setCurrentSlide(prev => {
        if (prev >= loadingSlides.length - 1) {
          clearInterval(slideInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    return () => {
      progressAnimation.stop();
      clearInterval(slideInterval);
    };
  }, [onComplete, progress]);

  // Floating particles configuration
  const particles = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 0.5 + 0.5,
    delay: Math.random() * 2,
    duration: Math.random() * 3 + 2
  }));

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center p-4 overflow-hidden"
      ref={constraintsRef}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-white/10"
            style={{
              width: `${particle.size}rem`,
              height: `${particle.size}rem`,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [0, -50, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.2, 0.8, 0.2]
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-2xl text-center relative z-10">
        {/* Logo with animation */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-white/20 blur-xl rounded-full animate-pulse"></div>
            <img 
              src="assets/logo2.png" 
              alt="SkillBridge Logo" 
              className="h-24 w-24 mx-auto relative z-10"
            />
          </div>
        </motion.div>

        {/* Animated card */}
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-xl overflow-hidden">
            <CardContent className="p-12 relative">
              {/* Floating sparkles */}
              <Sparkles className="absolute top-4 right-4 text-yellow-400/30 w-8 h-8" />
              
              {/* Icon with gradient background */}
              <motion.div
                className="mx-auto mb-8 w-24 h-24 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(124,58,237,0.1) 100%)'
                }}
                animate={{
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <motion.div
                  key={`icon-${currentSlide}`}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-white"
                >
                  {loadingSlides[currentSlide]?.icon}
                </motion.div>
              </motion.div>

              <motion.h2 
                className="text-3xl font-bold text-white mb-4"
                key={`title-${currentSlide}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {loadingSlides[currentSlide]?.title}
              </motion.h2>

              <motion.p 
                className="text-white/70 text-lg leading-relaxed mb-6"
                key={`desc-${currentSlide}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                {loadingSlides[currentSlide]?.description}
              </motion.p>

              {/* Progress bar with gradient */}
              <div className="w-full bg-white/10 rounded-full h-3 mb-4 overflow-hidden">
                <motion.div 
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #6366F1 0%, #A855F7 50%, #EC4899 100%)',
                    width: `${progress.get()}%`
                  }}
                />
              </div>

              <div className="flex justify-between items-center">
                <motion.span className="text-white/60 text-sm">
                  Initializing your experience...
                </motion.span>
                <motion.span className="text-white font-mono font-bold">
                  {Math.round(count.get())}%
                </motion.span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Subtle footer */}
        <motion.div 
          className="mt-8 text-white/40 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Powered by SkillBridge AI • {currentSlide + 1}/{loadingSlides.length}
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingSlide;