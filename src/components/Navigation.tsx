
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="/placeholder.svg" 
              alt="SkillBridge Logo" 
              className="h-8 w-8 mr-2"
            />
            <span className="text-xl font-bold text-black">SkillBridge</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-gray-700 hover:text-blue-400 transition-colors">Home</a>
            <a href="#features" className="text-gray-700 hover:text-blue-400 transition-colors">Features</a>
            <a href="#courses" className="text-gray-700 hover:text-blue-400 transition-colors">Courses</a>
            <a href="#about" className="text-gray-700 hover:text-blue-400 transition-colors">About</a>
            <a href="#contact" className="text-gray-700 hover:text-blue-400 transition-colors">Contact</a>
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" className="text-gray-700 border-gray-300 hover:bg-gray-50">
              Login
            </Button>
            <Button className="bg-blue-400 text-white hover:bg-blue-500">
              Sign Up
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <a href="#home" className="text-gray-700 hover:text-blue-400 transition-colors">Home</a>
              <a href="#features" className="text-gray-700 hover:text-blue-400 transition-colors">Features</a>
              <a href="#courses" className="text-gray-700 hover:text-blue-400 transition-colors">Courses</a>
              <a href="#about" className="text-gray-700 hover:text-blue-400 transition-colors">About</a>
              <a href="#contact" className="text-gray-700 hover:text-blue-400 transition-colors">Contact</a>
              <div className="flex flex-col space-y-2 pt-4">
                <Button variant="outline" className="w-full text-gray-700 border-gray-300 hover:bg-gray-50">
                  Login
                </Button>
                <Button className="w-full bg-blue-400 text-white hover:bg-blue-500">
                  Sign Up
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
