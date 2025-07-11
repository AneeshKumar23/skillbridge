
import { ArrowRight, Play, Smartphone, Globe, Brain, Award, Users, Download, BookOpen, CheckCircle, Star, MessageCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import TabletVideo from "@/components/TabletVideo";
import Footer from "@/components/Footer";

const Index = () => {
  const languages = [
    { name: "Hindi", flag: "🇮🇳", code: "hi" },
    { name: "Tamil", flag: "🌴", code: "ta" },
    { name: "Telugu", flag: "🌾", code: "te" },
    { name: "Bengali", flag: "🐅", code: "bn" }
  ];

  const features = [
    {
      icon: Smartphone,
      title: "Offline-First Learning",
      description: "Download once, learn anytime - no internet required"
    },
    {
      icon: Globe,
      title: "IndicBERT-Powered Multilingual",
      description: "Native language learning with AI precision"
    },
    {
      icon: Brain,
      title: "Personalized AI (LLaMA 3.1)",
      description: "Adaptive content based on your skills and device"
    },
    {
      icon: Award,
      title: "Blockchain Certificates",
      description: "Verified credentials stored on Polygon"
    },
    {
      icon: Users,
      title: "Motivational Gamification",
      description: "XP, badges, and leaderboards to keep you engaged"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Choose Your Language",
      description: "Tamil, Hindi, Bengali, or Telugu"
    },
    {
      number: "02",
      title: "Adaptive AI Content",
      description: "Based on your skills, bandwidth & device"
    },
    {
      number: "03",
      title: "Offline Learning",
      description: "Download once, learn anytime"
    },
    {
      number: "04",
      title: "Earn Verified Certificates",
      description: "Stored on Polygon blockchain"
    },
    {
      number: "05",
      title: "AI Job Matching",
      description: "With local employers & mentors"
    }
  ];

  const highlights = [
    {
      icon: CheckCircle,
      title: "Verified Credentials",
      description: "Blockchain-backed certificates"
    },
    {
      icon: Star,
      title: "XP, Badges & Leaderboards",
      description: "Gamified learning experience"
    },
    {
      icon: MessageCircle,
      title: "Mentorship Connections",
      description: "Connect with industry experts"
    },
    {
      icon: Globe,
      title: "Multilingual Native Learning",
      description: "Learn in your mother tongue"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#f0f9ff] to-[#ffffff] text-black">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Empower Every Ambition,{" "}
              <span className="text-blue-400">Everywhere</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed">
              AI-powered learning for India's underserved youth and women.
            </p>
            <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
              From remote villages to small towns, SkillBridge unlocks digital potential — 
              personalized, offline-first, and built for Bharat.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-black text-white hover:bg-gray-800 px-8 py-3 text-lg">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                className="text-blue-400 border-blue-400 hover:bg-blue-50 hover:text-black px-8 py-3 text-lg"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch How It Works
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Multilingual Section */}
      <section className="bg-white text-black border-t border-gray-200 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Learn in Your Mother Tongue with{" "}
              <span className="text-blue-400">IndicBERT</span>
            </h2>
            <p className="text-xl text-gray-700 mb-12">
              Learning is more impactful in your native language. SkillBridge supports:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {languages.map((lang) => (
                <div key={lang.code} className="text-center p-6 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="text-4xl mb-3">{lang.flag}</div>
                  <h3 className="text-lg font-semibold text-black">{lang.name}</h3>
                </div>
              ))}
            </div>
            <p className="text-gray-600 mt-8 italic">
              Powered by IndicBERT for seamless multilingual experiences.
            </p>
          </div>
        </div>
      </section>

      {/* About Section with Tablet Video */}
      <section className="bg-white text-black py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Transforming Dreams Into <span className="text-blue-400">Careers</span>
              </h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-12">
                SkillBridge is an adaptive platform tailored for rural India. Whether you're on a 
                basic smartphone or learning offline, SkillBridge meets you where you are.
              </p>

              {/* Tablet Video Component */}
              <div className="mb-16">
                <TabletVideo />
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="bg-white shadow-sm border-l-2 border-blue-100 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <feature.icon className="h-8 w-8 text-blue-400 mb-4" />
                    <h3 className="text-xl font-semibold text-black mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 text-black py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Your <span className="text-blue-400">Personalized</span> Path
            </h2>
          </div>
          <div className="max-w-4xl mx-auto space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="bg-white p-6 shadow-sm rounded-md border-l-4 border-blue-100 flex items-start gap-6">
                <div className="text-3xl font-bold text-blue-400 min-w-[60px]">{step.number}</div>
                <div>
                  <h3 className="text-xl font-semibold text-black mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why SkillBridge */}
      <section className="bg-white text-black border-t border-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-8">
                Built for Rural Realities.<br />
                Designed for <span className="text-blue-400">Global Futures</span>
              </h2>
              <blockquote className="text-2xl italic text-gray-700 max-w-3xl mx-auto mb-4">
                "Naan oru thadava sonna, nooru thadava sonna maadhiri."
              </blockquote>
              <p className="text-lg text-gray-600">
                We don't just promise change. We deliver it.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {highlights.map((highlight, index) => (
                <div key={index} className="text-center p-6">
                  <highlight.icon className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-black mb-2">{highlight.title}</h3>
                  <p className="text-gray-600 text-sm">{highlight.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f9fafb] py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-black mb-12">
              Stories of <span className="text-blue-400">Transformation</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-white text-black shadow-md rounded-xl border-l-4 border-blue-100">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-lg mb-4 italic">
                    "From our village to a global tech job — SkillBridge made it happen. 
                    Learning in Tamil made all the difference."
                  </blockquote>
                  <cite className="text-gray-600 not-italic">
                    — Meena, 19, Tamil Nadu
                  </cite>
                </CardContent>
              </Card>
              <Card className="bg-white text-black shadow-md rounded-xl border-l-4 border-blue-100">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-lg mb-4 italic">
                    "The offline learning saved my data costs. Now I'm certified and employed 
                    as a digital marketing assistant."
                  </blockquote>
                  <cite className="text-gray-600 not-italic">
                    — Ravi, 24, West Bengal
                  </cite>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white text-black py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Begin Your <span className="text-blue-400">Journey</span>?
            </h2>
            <p className="text-xl text-gray-700 mb-12 max-w-2xl mx-auto">
              Start learning in your native language and get certified for jobs that matter.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-black text-white hover:bg-gray-800 px-8 py-3 text-lg">
                <Download className="mr-2 h-5 w-5" />
                Download App
              </Button>
              <Button 
                variant="outline" 
                className="text-blue-400 border-blue-400 hover:bg-blue-50 hover:text-black px-8 py-3 text-lg"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                View Courses
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
