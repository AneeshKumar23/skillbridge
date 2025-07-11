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
  const [address, setAddress] = useState(formData.address || '');
  const [city, setCity] = useState(formData.city || '');
  const [state, setState] = useState(formData.state || '');
  const [pincode, setPincode] = useState(formData.pincode || '');
  const [country, setCountry] = useState(formData.country || '');

  const handleNext = () => {
    if (address && city && state && pincode && country) {
      updateFormData({ 
        address, 
        city, 
        state, 
        pincode, 
        country 
      });
      onNext();
    }
  };

  const allFieldsFilled = address && city && state && pincode && country;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=64&h=64&fit=crop&crop=center" 
            alt="SkillBridge Logo" 
            className="h-16 w-16 mx-auto mb-4 rounded-lg"
          />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Tell us about your location</h1>
          <p className="text-gray-600">Help us personalize your experience</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Address Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                type="text"
                placeholder="Enter your street address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                type="text"
                placeholder="Enter your city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                type="text"
                placeholder="Enter your state or province"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pincode">Postal/Zip Code</Label>
              <Input
                id="pincode"
                type="text"
                placeholder="Enter your postal code"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                type="text"
                placeholder="Enter your country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center mt-8">
          <div className="text-sm text-gray-500">Step 2 of 3</div>
          <Button 
            onClick={handleNext}
            disabled={!allFieldsFilled}
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