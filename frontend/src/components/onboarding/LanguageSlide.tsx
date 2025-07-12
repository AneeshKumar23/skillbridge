import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface LanguageSlideProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
}

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧', color: 'from-blue-400 to-blue-600', bg: 'bg-blue-500' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳', color: 'from-orange-400 to-orange-600', bg: 'bg-orange-500' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳', color: 'from-yellow-400 to-yellow-600', bg: 'bg-yellow-500' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳', color: 'from-green-400 to-green-600', bg: 'bg-green-500' },
];

const LanguageSlide = ({ formData, updateFormData, onNext }: LanguageSlideProps) => {
  const [selectedLanguage, setSelectedLanguage] = useState(formData.language || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
    updateFormData({ language });
  };

  const handleNext = async () => {
    if (selectedLanguage) {
      setIsLoading(true);
      // Simulate loading for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsLoading(false);
      onNext();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-4xl mx-auto space-y-8">
        {/* Header with progress bar */}
        <div className="flex flex-col items-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center">
            <img 
              src="assets/logo.png" 
              alt="Company Logo" 
              className="h-10 w-auto"
            />
          </div>
          
          <div className="w-full max-w-md">
            <div className="relative h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500" 
                style={{ width: '33%' }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 text-center mt-2">Step 1 of 3</div>
          </div>
          
          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Select Your Language</h1>
            <p className="text-gray-500 text-lg max-w-lg mx-auto">
              Choose your preferred language for a personalized experience
            </p>
          </div>
        </div>

        {/* Language Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {languages.map((lang) => (
            <Card 
              key={lang.code} 
              className={`relative overflow-hidden cursor-pointer transition-all duration-300 h-40 sm:h-48 group border-0 shadow-sm hover:shadow-md ${
                selectedLanguage === lang.code 
                  ? 'ring-2 ring-offset-2 ring-blue-500 shadow-lg scale-[1.02]' 
                  : 'hover:ring-1 hover:ring-gray-200'
              }`}
              onClick={() => handleLanguageSelect(lang.code)}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${lang.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
              <CardContent className="relative h-full flex flex-col items-center justify-center p-4 sm:p-6 space-y-3">
                <div className="text-5xl mb-2">{lang.flag}</div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-800">{lang.name}</h3>
                {selectedLanguage === lang.code && (
                  <div className={`absolute bottom-0 left-0 right-0 h-1.5 ${lang.bg} animate-pulse`} />
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Continue Button */}
        <div className="flex justify-center pt-4">
          <Button 
            onClick={handleNext}
            disabled={!selectedLanguage || isLoading}
            className="px-8 py-6 text-lg font-medium rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md transition-all transform hover:scale-105 active:scale-100"
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            ) : (
              <>
                Continue
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LanguageSlide;