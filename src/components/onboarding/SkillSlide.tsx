
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Send } from 'lucide-react';

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

  const handleAIAnalysis = () => {
    if (!userInput.trim()) return;

    // Simple AI simulation - in real app, this would call an AI API
    const input = userInput.toLowerCase();
    let suggestions: string[] = [];

    Object.entries(skillSuggestions).forEach(([category, skills]) => {
      if (input.includes(category) || skills.some(skill => input.includes(skill.toLowerCase()))) {
        suggestions = [...suggestions, ...skills];
      }
    });

    // Fallback suggestions
    if (suggestions.length === 0) {
      suggestions = skillSuggestions.programming;
    }

    setSuggestedSkills([...new Set(suggestions)].slice(0, 6));
    setShowSuggestions(true);
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
      updateFormData({ skills: selectedSkills });
      onNext();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <img 
            src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=64&h=64&fit=crop&crop=center" 
            alt="SkillBridge Logo" 
            className="h-16 w-16 mx-auto mb-4 rounded-lg"
          />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">What skills interest you?</h1>
          <p className="text-gray-600">Tell our AI about your interests and we'll suggest relevant skills</p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Bot className="h-5 w-5 text-blue-400" />
              <span className="font-medium text-gray-700">AI Assistant</span>
            </div>
            <div className="flex space-x-2">
              <Input
                placeholder="Tell me about your interests... (e.g., I love creating websites and mobile apps)"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAIAnalysis()}
                className="flex-1"
              />
              <Button onClick={handleAIAnalysis} size="icon" className="bg-blue-400 hover:bg-blue-500">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {showSuggestions && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Suggested Skills</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {suggestedSkills.map((skill) => (
                  <Button
                    key={skill}
                    variant={selectedSkills.includes(skill) ? "default" : "outline"}
                    className={`h-auto p-4 text-left justify-start ${
                      selectedSkills.includes(skill) 
                        ? 'bg-blue-400 hover:bg-blue-500' 
                        : 'hover:bg-blue-50'
                    }`}
                    onClick={() => toggleSkill(skill)}
                  >
                    {skill}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedSkills.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Selected Skills</h3>
              <div className="flex flex-wrap gap-2">
                {selectedSkills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="bg-blue-100 text-blue-800">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">Step 3 of 3</div>
          <Button 
            onClick={handleNext}
            disabled={selectedSkills.length === 0}
            className="bg-blue-400 hover:bg-blue-500"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SkillSlide;
