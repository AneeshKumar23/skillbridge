
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface LanguageSlideProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
}

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];

const LanguageSlide = ({ formData, updateFormData, onNext }: LanguageSlideProps) => {
  const [selectedLanguage, setSelectedLanguage] = useState(formData.language || '');

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
    updateFormData({ language });
  };

  const handleNext = () => {
    if (selectedLanguage) {
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Choose Your Language</h1>
          <p className="text-gray-600">Select your preferred language for learning</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {languages.map((lang) => (
            <Card 
              key={lang.code} 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedLanguage === lang.code 
                  ? 'ring-2 ring-blue-400 bg-blue-50' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handleLanguageSelect(lang.code)}
            >
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">{lang.flag}</div>
                <div className="font-medium text-gray-800">{lang.name}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">Step 1 of 3</div>
          <Button 
            onClick={handleNext}
            disabled={!selectedLanguage}
            className="bg-blue-400 hover:bg-blue-500"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LanguageSlide;
