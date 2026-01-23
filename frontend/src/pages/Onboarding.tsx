
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { updateOnboarding, generateCurriculum } from '../../api/db';
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

  const { user } = useUser();
  const navigate = useNavigate();

  const handleComplete = async () => {
    if (!user) {
      console.error("User not found during onboarding save");
      navigate('/login');
      return;
    }

    try {
      await updateOnboarding(user.id, {
        language: formData.language,
        skills: formData.skills,
        street_address: '', // Add defaults or form fields if needed later
        city: formData.location.split(',')[0] || '',
        state: '',
        zip_code: '',
        country: formData.location.split(',')[1] || '',
      });
      console.log('Onboarding data saved successfully');

      // Generate curriculum
      await generateCurriculum(user.id);
      console.log('Curriculum generated successfully');

      navigate('/chat');
    } catch (error) {
      console.error('Failed to save onboarding data:', error);
      // Optional: show error to user
      navigate('/chat'); // Proceed anyway or show error?
    }
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
        // Trigger save when showing complete screen or user clicks button
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
                onClick={handleComplete} // Updated to call handleComplete
                className="bg-blue-400 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-500 transition-colors"
                disabled={!user}
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
