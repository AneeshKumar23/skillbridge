import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password });
    // Handle login logic here
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
                <h2 className="text-3xl font-bold mb-4">Welcome Back to SkillBridge</h2>
                <p className="text-blue-100">
                  Continue your learning journey with access to thousands of courses and expert instructors.
                </p>
              </div>
              <div className="mt-8">
                <p className="text-blue-100 text-sm">
                  Don't have an account?{' '}
                  <Link 
                    to="/signup" 
                    className="text-white font-medium hover:underline transition-colors"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </div>

            {/* Right side - Form */}
            <div className="p-8 md:p-10">
              <CardHeader className="p-0 mb-8">
                <CardTitle className="text-3xl font-bold text-gray-900">Sign In</CardTitle>
                <CardDescription className="text-gray-500">
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-0">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="py-3 px-4 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="py-3 px-4 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Link 
                      to="/forgot-password" 
                      className="text-sm text-blue-500 hover:text-blue-600 font-medium transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                  >
                    Sign In
                  </Button>
                </form>

                <div className="mt-6 text-center md:hidden">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link 
                      to="/signup" 
                      className="text-blue-500 hover:text-blue-600 font-medium transition-colors"
                    >
                      Sign up
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

export default Login;