import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, Sparkles, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SkillSlideProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
}

const skillSuggestions = {
  'programming': ['JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'Java'],
  'design': ['UI/UX Design', 'Figma', 'Adobe Photoshop', 'Illustrator', 'Sketch', 'Prototyping'],
  'marketing': ['Digital Marketing', 'SEO', 'Social Media', 'Content Marketing', 'Email Marketing', 'Analytics'],
  'business': ['Project Management', 'Leadership', 'Finance', 'Strategy', 'Communication', 'Data Analysis'],
  'creative': ['Writing', 'Photography', 'Video Editing', 'Graphic Design', 'Music Production', 'Animation']
};

const SkillSlide = ({ formData, updateFormData, onNext }: SkillSlideProps) => {
  const [userInput, setUserInput] = useState('');
  const [suggestedSkills, setSuggestedSkills] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(formData.skills || []);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [inputFocus, setInputFocus] = useState(false);

  useEffect(() => {
    if (selectedSkills.length > 0) {
      updateFormData({ skills: selectedSkills });
    }
  }, [selectedSkills]);

  const handleAIAnalysis = async () => {
    if (!userInput.trim()) return;
    
    setIsAnalyzing(true);
    setShowSuggestions(false);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const input = userInput.toLowerCase();
    let suggestions: string[] = [];

    Object.entries(skillSuggestions).forEach(([category, skills]) => {
      if (input.includes(category) || skills.some(skill => input.includes(skill.toLowerCase()))) {
        suggestions = [...suggestions, ...skills];
      }
    });

    if (suggestions.length === 0) {
      suggestions = [...skillSuggestions.programming, ...skillSuggestions.design].slice(0, 6);
    }

    setSuggestedSkills([...new Set(suggestions)].slice(0, 6));
    setShowSuggestions(true);
    setIsAnalyzing(false);
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleNext = () => {
    if (selectedSkills.length > 0) {
      onNext();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header with progress */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center">
            <img 
              src="assets/logo.png" 
              alt="Company Logo" 
              className="h-10 w-auto"
            />
          </div>
          
          <div className="w-full max-w-md">
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500" 
                style={{ width: '100%' }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 text-center mt-2">Step 3 of 3</div>
          </div>
          
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Build Your Skills Profile</h1>
            <p className="text-gray-500 text-lg">Tell us about your interests and we'll suggest relevant skills</p>
          </div>
        </div>

        {/* AI Assistant Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 border-b">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-blue-100">
                  <Bot className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-800">AI Skill Assistant</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className={`flex space-x-2 transition-all ${inputFocus ? 'ring-2 ring-blue-400 rounded-lg' : ''}`}>
                <Input
                  placeholder="E.g., 'I enjoy designing mobile apps and learning about marketing'"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAIAnalysis()}
                  onFocus={() => setInputFocus(true)}
                  onBlur={() => setInputFocus(false)}
                  className="flex-1 border-0 shadow-sm focus-visible:ring-0"
                />
                <Button 
                  onClick={handleAIAnalysis} 
                  size="icon" 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md"
                  disabled={isAnalyzing || !userInput.trim()}
                >
                  {isAnalyzing ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Suggested Skills */}
        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 border-b">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-purple-100">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-gray-800">Suggested Skills</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {suggestedSkills.map((skill) => (
                      <motion.div
                        key={skill}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant={selectedSkills.includes(skill) ? "default" : "outline"}
                          className={`h-auto py-3 px-4 text-left justify-start rounded-lg transition-all ${
                            selectedSkills.includes(skill)
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                              : 'hover:bg-blue-50 border-gray-200'
                          }`}
                          onClick={() => toggleSkill(skill)}
                        >
                          {skill}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected Skills */}
        {selectedSkills.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 p-4 border-b">
                <CardTitle className="text-lg font-semibold text-gray-800">Your Selected Skills</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.map((skill) => (
                    <motion.div
                      key={skill}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Badge 
                        variant="secondary" 
                        className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-1.5 text-sm rounded-lg flex items-center"
                        onClick={() => toggleSkill(skill)}
                      >
                        {skill}
                        <span className="ml-2 text-blue-600">×</span>
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="pt-4"
        >
          <Button 
            onClick={handleNext}
            disabled={selectedSkills.length === 0}
            className="w-full sm:w-auto px-8 py-6 text-lg font-medium rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md transition-all transform hover:scale-105 active:scale-100"
          >
            Complete Profile
            <ChevronRight className="h-5 w-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default SkillSlide;