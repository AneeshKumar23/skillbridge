import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface LanguageSlideProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
}

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧', color: 'bg-gradient-to-br from-blue-400 to-blue-600' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳', color: 'bg-gradient-to-br from-orange-400 to-orange-600' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳', color: 'bg-gradient-to-br from-yellow-400 to-yellow-600' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳', color: 'bg-gradient-to-br from-green-400 to-green-600' },
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Choose Your Language</h1>
          <p className="text-lg text-gray-600 max-w-lg mx-auto">
            Select your preferred language to personalize your learning experience
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {languages.map((lang) => (
            <Card 
              key={lang.code} 
              className={`relative overflow-hidden cursor-pointer transition-all duration-300 h-48 group ${
                selectedLanguage === lang.code 
                  ? 'ring-4 ring-blue-500 shadow-xl scale-105' 
                  : 'hover:shadow-lg hover:scale-[1.03]'
              }`}
              onClick={() => handleLanguageSelect(lang.code)}
            >
              <div className={`absolute inset-0 ${lang.color} opacity-20 group-hover:opacity-30 transition-opacity`} />
              <CardContent className="relative h-full flex flex-col items-center justify-center p-6">
                <div className="text-5xl mb-4">{lang.flag}</div>
                <h3 className="text-2xl font-bold text-gray-800">{lang.name}</h3>
                <div className={`absolute bottom-0 left-0 right-0 h-1 ${selectedLanguage === lang.code ? 'bg-blue-500' : 'bg-transparent'} transition-colors`} />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500 font-medium">Step 1 of 3</div>
          <Button 
            onClick={handleNext}
            disabled={!selectedLanguage}
            className="px-8 py-3 text-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md transition-all"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LanguageSlide;