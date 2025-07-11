
import { useState } from 'react';
import LanguageSlide from '@/components/onboarding/LanguageSlide';
import LocationSlide from '@/components/onboarding/LocationSlide';
import SkillSlide from '@/components/onboarding/SkillSlide';
import LoadingSlide from '@/components/onboarding/LoadingSlide';

type OnboardingStep = 'language' | 'location' | 'skill' | 'loading' | 'complete';

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('language');
  const [formData, setFormData] = useState({
    language: '',
    location: '',
    name: '',
    skills: [] as string[]
  });

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    switch (currentStep) {
      case 'language':
        setCurrentStep('location');
        break;
      case 'location':
        setCurrentStep('skill');
        break;
      case 'skill':
        setCurrentStep('loading');
        break;
      case 'loading':
        setCurrentStep('complete');
        break;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'language':
        return <LanguageSlide formData={formData} updateFormData={updateFormData} onNext={nextStep} />;
      case 'location':
        return <LocationSlide formData={formData} updateFormData={updateFormData} onNext={nextStep} />;
      case 'skill':
        return <SkillSlide formData={formData} updateFormData={updateFormData} onNext={nextStep} />;
      case 'loading':
        return <LoadingSlide onComplete={nextStep} />;
      case 'complete':
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to SkillBridge! 🎉</h1>
              <p className="text-gray-600 mb-8">Your learning journey begins now</p>
              <button 
                onClick={() => window.location.href = '/dashboard'}
                className="bg-blue-400 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-500 transition-colors"
              >
                Start Learning
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return renderStep();
};

export default Onboarding;
