
import { useState } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const Chat = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! Welcome to SkillBridge! I\'m here to help you on your learning journey. What would you like to learn today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: 'That\'s great! I can help you with that. Let me suggest some resources and create a personalized learning path for you.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);

    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <img 
            src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=64&h=64&fit=crop&crop=center" 
            alt="SkillBridge Logo" 
            className="h-16 w-16 mx-auto mb-4 rounded-lg"
          />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">SkillBridge AI Chat</h1>
          <p className="text-gray-600">Your personalized learning companion</p>
        </div>

        {/* Chat Container */}
        <Card className="h-[600px] flex flex-col">
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start space-x-3 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.sender === 'user' ? 'bg-blue-400' : 'bg-purple-400'}`}>
                      {msg.sender === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className={`p-3 rounded-lg ${msg.sender === 'user' ? 'bg-blue-400 text-white' : 'bg-gray-100 text-gray-800'}`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="border-t bg-white p-4">
              <div className="flex space-x-3">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message here..."
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="bg-blue-400 hover:bg-blue-500"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="p-4 h-auto text-left">
            <div>
              <h3 className="font-semibold">Get Learning Path</h3>
              <p className="text-sm text-gray-600">Create a personalized learning journey</p>
            </div>
          </Button>
          <Button variant="outline" className="p-4 h-auto text-left">
            <div>
              <h3 className="font-semibold">Find Resources</h3>
              <p className="text-sm text-gray-600">Discover courses and materials</p>
            </div>
          </Button>
          <Button variant="outline" className="p-4 h-auto text-left">
            <div>
              <h3 className="font-semibold">Practice Skills</h3>
              <p className="text-sm text-gray-600">Test your knowledge</p>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
