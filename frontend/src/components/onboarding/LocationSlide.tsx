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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header with logo and progress indicator */}
        <div className="flex flex-col items-center">
          <div className="mb-4 flex items-center justify-center">
            <img 
              src="assets/logo.png" 
              alt="Company Logo" 
              className="h-10 w-auto"
            />
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div 
              className="bg-blue-500 h-2 rounded-full" 
              style={{ width: '66%' }}
            ></div>
          </div>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Where are you located?</h1>
            <p className="text-gray-500">We'll use this to personalize your experience</p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-0 shadow-lg rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
            <CardTitle className="text-white">Address Information</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              <Label htmlFor="address" className="text-gray-700 font-medium">Street Address</Label>
              <Input
                id="address"
                type="text"
                placeholder="123 Main St"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="focus-visible:ring-blue-500 border-gray-300"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="city" className="text-gray-700 font-medium">City</Label>
                <Input
                  id="city"
                  type="text"
                  placeholder="New York"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="focus-visible:ring-blue-500 border-gray-300"
                  required
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="state" className="text-gray-700 font-medium">State</Label>
                <Input
                  id="state"
                  type="text"
                  placeholder="NY"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="focus-visible:ring-blue-500 border-gray-300"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="pincode" className="text-gray-700 font-medium">Postal Code</Label>
                <Input
                  id="pincode"
                  type="text"
                  placeholder="10001"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="focus-visible:ring-blue-500 border-gray-300"
                  required
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="country" className="text-gray-700 font-medium">Country</Label>
                <Input
                  id="country"
                  type="text"
                  placeholder="United States"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="focus-visible:ring-blue-500 border-gray-300"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-end">
          <Button 
            onClick={handleNext}
            disabled={!allFieldsFilled}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg font-medium shadow-md transition-all transform hover:scale-105"
          >
            Continue
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LocationSlide;