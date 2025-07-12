import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { signup } from '../../api/db';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
  
    if (!/^[\d\s+-]{10,}$/.test(formData.phone)) {
      alert('Please enter a valid phone number');
      return;
    }
  
    if (!formData.agreeToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }
  
    try {
      const response = await signup(formData);
      console.log('Signup successful:', response);
  
      
      if (response.id) {
        localStorage.setItem('user_id', response.id);
      } else {
        console.warn("No user ID returned in response.");
      }
  
      
      navigate('/onboarding');
    } catch (error: any) {
      console.error('Signup error:', error);
      alert(error.message || 'Signup failed');
    }
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl mx-auto">
        <Card className="w-full shadow-xl rounded-2xl overflow-hidden border-0">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left side - Branding */}
            <div className="hidden md:flex bg-gradient-to-br from-blue-500 to-blue-600 p-10 text-white flex-col justify-between">
              <div>
                <img 
                  src="/assets/logo2.png" 
                  alt="SkillBridge Logo" 
                  className="h-40 w-40 mb-6"
                />
                <h2 className="text-3xl font-bold mb-4">Join SkillBridge Today</h2>
                <p className="text-blue-100">
                  Start your learning journey with access to thousands of courses and expert instructors.
                </p>
              </div>
              <div className="mt-8">
                <p className="text-blue-100 text-sm">
                  Already have an account?{' '}
                  <Link 
                    to="/login" 
                    className="text-white font-medium hover:underline transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>

            {/* Right side - Form */}
            <div className="p-8 md:p-10">
              <CardHeader className="p-0 mb-8">
                <CardTitle className="text-3xl font-bold text-gray-900">Create Account</CardTitle>
                <CardDescription className="text-gray-500">
                  Fill in your details to get started
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-0">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-gray-700">First Name</Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="py-3 px-4 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-gray-700">Last Name</Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="py-3 px-4 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="py-3 px-4 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-700">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (123) 456-7890"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="py-3 px-4 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-700">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="py-3 px-4 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-gray-700">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className="py-3 px-4 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 pt-2">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, agreeToTerms: checked === true }))
                      }
                      className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="terms" className="text-sm text-gray-600">
                      I agree to the{' '}
                      <Link to="/terms" className="text-blue-500 hover:text-blue-600 font-medium transition-colors">
                        Terms and Conditions
                      </Link>
                    </Label>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                  >
                    Create Account
                  </Button>
                </form>

                <div className="mt-6 text-center md:hidden">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link 
                      to="/login" 
                      className="text-blue-500 hover:text-blue-600 font-medium transition-colors"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </CardContent>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Signup;