
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getQuestions, Question, getRoadmapBySkill, updateRoadmap } from '../../api/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, XCircle, Trophy, ArrowRight, Home, Award } from 'lucide-react';
import Navigation from '@/components/Navigation';

const QuizHeader = () => (
  <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
    <div className="container mx-auto px-4">
      <div className="flex justify-center items-center h-16">
        <Link to="/" className="flex items-center">
          <img
            src="/assets/logo.png"
            alt="SkillBridge Logo"
            className="h-30 w-40 rounded"
          />
        </Link>
      </div>
    </div>
  </nav>
);

const Quiz = () => {
  const { user, isLoading: userLoading } = useUser();
  const [searchParams] = useSearchParams();
  const urlTopic = searchParams.get('topic');
  const parentTopic = searchParams.get('parent'); // To identify which roadmap to update
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleFullscreenChange = () => {
      // If we're not in full-screen, and the quiz is in progress, redirect
      if (!document.fullscreenElement && isStarted && !isComplete && questions.length > 0) {
        alert("You exited full-screen! For security reasons, the test has been cancelled.");
        navigate('/chat');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isStarted, isComplete, questions.length, navigate]);

  useEffect(() => {
    if (!userLoading && user) {
      fetchQuizQuestions();
    } else if (!userLoading && !user) {
        fetchQuizQuestions("English");
    }
  }, [user, userLoading]);

  const handleStart = async () => {
    try {
      const element = document.documentElement;
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      }
      setIsStarted(true);
    } catch (error) {
      console.error('Failed to enter full-screen:', error);
      // Still start even if full-screen fails, but full-screen is the requirement
      setIsStarted(true);
    }
  };

  const fetchQuizQuestions = async (fallbackLang?: string) => {
    try {
      setIsLoading(true);
      const language = user?.language || fallbackLang || 'English';
      const topic = urlTopic || user?.skills?.[0] || 'General Knowledge';
      const response = await getQuestions(user?.id || 'guest', topic, 10, language);
      setQuestions(response.questions);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
  };

  const handleCheckAnswer = () => {
    if (!selectedOption) return;
    
    const isCorrect = selectedOption === questions[currentIndex].answer;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    setIsAnswered(true);
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      await recordTestCompletion();
      setIsComplete(true);
    }
  };

  const recordTestCompletion = async () => {
      const uid = user?.id || 'guest';
      if (uid === 'guest' || !parentTopic || !urlTopic) return;

      try {
          const { roadmap } = await getRoadmapBySkill(uid, parentTopic);
          const roadmapData = roadmap as any;
          
          if (roadmapData.milestones) {
              roadmapData.milestones = roadmapData.milestones.map((m: any) => {
                  if (m.main_goal === urlTopic) {
                      return { ...m, testCompleted: true };
                  }
                  if (m.sub_goals) {
                      m.sub_goals = m.sub_goals.map((sub: any) => {
                          const title = typeof sub === 'object' ? sub.title : sub;
                          if (title === urlTopic) {
                              return typeof sub === 'object' ? { ...sub, testCompleted: true } : { title: sub, testCompleted: true };
                          }
                          return sub;
                      });
                  }
                  return m;
              });
              await updateRoadmap(uid, parentTopic, roadmapData);
          }
      } catch (e) {
          console.error('Failed to record test completion', e);
      }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
          <p className="text-lg font-medium text-gray-600">Preparing your personalized test...</p>
        </div>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col shadow-inner">
        <QuizHeader />
        <div className="flex-1 flex items-center justify-center py-12 px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl w-full"
          >
            <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-sm bg-white/90">
              <div className="bg-blue-600 p-8 text-center text-white">
                <Award className="h-16 w-16 mx-auto mb-4 text-blue-100" />
                <CardTitle className="text-3xl font-bold">
                  {urlTopic ? `Assessment for ${urlTopic}` : "Ready for your assessment?"}
                </CardTitle>
              </div>
              <CardContent className="p-10 space-y-8">
                <div className="space-y-4 text-gray-600">
                  <p className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                    <span>10 Questions based on your chosen skills.</span>
                  </p>
                  <p className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                    <span>The test will be in your chosen language.</span>
                  </p>
                  <p className="flex items-center gap-3 font-semibold text-blue-600">
                    <span className="shrink-0 text-lg">⚠️</span>
                    <span>Exit full-screen will automatically cancel the test.</span>
                  </p>
                </div>
                <Button 
                  onClick={handleStart}
                  className="w-full py-8 text-xl font-bold rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
                >
                  Start Test Now
                </Button>
                <p className="text-center text-sm text-gray-400">Clicking start will enter full-screen mode.</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
        <QuizHeader />
        <div className="max-w-2xl mx-auto mt-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl overflow-hidden"
          >
            <div className="bg-blue-600 py-12 text-center text-white">
              <Trophy className="h-20 w-20 mx-auto mb-4 text-yellow-400" />
              <h2 className="text-3xl font-bold mb-2">Test Completed!</h2>
              {urlTopic && <p className="text-blue-200 mb-2 font-medium">Topic: {urlTopic}</p>}
              <p className="text-blue-100 italic">"Vetri nichayam, ithu veda sethiyam!"</p>
            </div>
            <CardContent className="p-8 text-center space-y-6">
              <div className="space-y-2">
                <p className="text-gray-500 uppercase tracking-widest text-sm font-semibold">Your Score</p>
                <div className="text-6xl font-black text-gray-900">
                  {score}<span className="text-blue-500">/</span>{questions.length}
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-gray-600">
                  {score >= 8 ? "Excellent! You've mastered this topic." : 
                   score >= 5 ? "Good job! Keep learning to improve further." : 
                   "Keep practicing! Every expert was once a beginner."}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button 
                  onClick={() => navigate('/chat')}
                  variant="outline"
                  className="px-8 py-6 rounded-xl border-2"
                >
                  <Home className="mr-2 h-5 w-5" />
                  Back to Chat
                </Button>
                <Button 
                  onClick={() => window.location.reload()}
                  className="px-8 py-6 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
                >
                  Retake Test
                </Button>
              </div>
            </CardContent>
          </motion.div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <QuizHeader />
      
      <div className="flex-1 max-w-3xl w-full mx-auto px-4 flex flex-col justify-center py-6">
        {/* Progress header */}
        <div className="mb-0 space-y-3">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Question {currentIndex + 1} of {questions.length}</p>
              <h2 className="text-xl font-bold text-gray-900">Knowledge Assessment</h2>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-gray-900">{Math.round(progress)}%</span>
            </div>
          </div>
          <Progress value={progress} className="h-3 bg-blue-100" />
        </div>

        <div className="mt-6 flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-0 shadow-lg shadow-gray-200/50 rounded-2xl overflow-hidden">
                <div className="p-6 sm:p-8">
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 leading-tight mb-6">
                    {currentQuestion.question}
                  </h3>

                  <div className="space-y-3">
                    {currentQuestion.options.map((option, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleOptionSelect(option)}
                        className={`
                          group relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center
                          ${selectedOption === option 
                             ? (isAnswered 
                                ? (option === currentQuestion.answer ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50')
                                : 'border-blue-500 bg-blue-50')
                             : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                          }
                          ${isAnswered && option === currentQuestion.answer && selectedOption !== option ? 'border-green-500 bg-green-50/50' : ''}
                        `}
                      >
                        <div className={`
                          w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-base sm:text-lg font-bold mr-4 transition-colors
                          ${selectedOption === option 
                             ? (isAnswered 
                                ? (option === currentQuestion.answer ? 'bg-green-500 text-white' : 'bg-red-500 text-white')
                                : 'bg-blue-500 text-white')
                             : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                          }
                          ${isAnswered && option === currentQuestion.answer && selectedOption !== option ? 'bg-green-500 text-white' : ''}
                        `}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span className={`text-lg font-medium ${selectedOption === option ? 'text-gray-900' : 'text-gray-700'}`}>
                          {option}
                        </span>
                        
                        {isAnswered && option === currentQuestion.answer && (
                          <CheckCircle2 className="ml-auto h-6 w-6 text-green-500" />
                        )}
                        {isAnswered && selectedOption === option && option !== currentQuestion.answer && (
                          <XCircle className="ml-auto h-6 w-6 text-red-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 sm:p-6 border-t border-gray-100 flex justify-end items-center">
                  {!isAnswered ? (
                    <Button 
                      disabled={!selectedOption}
                      onClick={handleCheckAnswer}
                      className="px-6 py-4 sm:px-8 sm:py-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-base sm:text-lg font-semibold shadow-md shadow-blue-200 w-full sm:w-auto"
                    >
                      Check Answer
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleNext}
                      className="px-6 py-4 sm:px-8 sm:py-6 rounded-xl bg-gray-900 hover:bg-black text-base sm:text-lg font-semibold flex items-center justify-center w-full sm:w-auto"
                    >
                      {currentIndex === questions.length - 1 ? "Finish Test" : "Next Question"}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  )
                  }
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
