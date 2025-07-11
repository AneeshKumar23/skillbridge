
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LocationSlideProps {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
}

const LocationSlide = ({ formData, updateFormData, onNext }: LocationSlideProps) => {
  const [location, setLocation] = useState(formData.location || '');
  const [name, setName] = useState(formData.name || '');

  const handleNext = () => {
    if (location && name) {
      updateFormData({ location, name });
      onNext();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=64&h=64&fit=crop&crop=center" 
            alt="SkillBridge Logo" 
            className="h-16 w-16 mx-auto mb-4 rounded-lg"
          />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Tell us about yourself</h1>
          <p className="text-gray-600">Help us personalize your experience</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                type="text"
                placeholder="City, Country"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center mt-8">
          <div className="text-sm text-gray-500">Step 2 of 3</div>
          <Button 
            onClick={handleNext}
            disabled={!location || !name}
            className="bg-blue-400 hover:bg-blue-500"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LocationSlide;
