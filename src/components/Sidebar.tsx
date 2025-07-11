import React, { useState } from 'react';
import { Plus, Award, Settings, MessageSquare, User, Search, MoreHorizontal } from 'lucide-react';

interface Chat {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  isActive: boolean;
}

const mockChats: Chat[] = [
  {
    id: '1',
    title: 'JavaScript Fundamentals',
    lastMessage: 'Let me explain arrow functions...',
    timestamp: new Date(),
    isActive: true,
  },
  {
    id: '2',
    title: 'React Hooks Deep Dive',
    lastMessage: 'useState and useEffect are...',
    timestamp: new Date(Date.now() - 3600000),
    isActive: false,
  },
  {
    id: '3',
    title: 'CSS Grid vs Flexbox',
    lastMessage: 'Both are powerful layout...',
    timestamp: new Date(Date.now() - 7200000),
    isActive: false,
  },
  {
    id: '4',
    title: 'TypeScript Basics',
    lastMessage: 'Type annotations help...',
    timestamp: new Date(Date.now() - 86400000),
    isActive: false,
  },
];

export const Sidebar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [chats] = useState<Chat[]>(mockChats);

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Profile Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">John Doe</h3>
            <p className="text-sm text-gray-500 truncate">john.doe@gmail.com</p>
          </div>
          <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* New Skill Button */}
      <div className="p-4">
        <button className="w-full flex items-center justify-center space-x-2 bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors">
          <Plus className="w-5 h-5" />
          <span className="font-medium">New Skill</span>
        </button>
      </div>

      {/* Certification Section */}
      <div className="px-4 pb-4">
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Award className="w-5 h-5 text-yellow-600" />
            <h4 className="font-medium text-yellow-900">Certifications</h4>
          </div>
          <p className="text-sm text-yellow-700 mb-3">
            Track your learning progress and earn certificates
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-yellow-700">JavaScript</span>
              <span className="text-xs text-yellow-600 font-medium">85%</span>
            </div>
            <div className="w-full bg-yellow-200 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Section */}
      <div className="px-4 pb-4">
        <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </button>
      </div>

      {/* Skills Section */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="px-4 pb-2">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Skills</h4>
            <span className="text-sm text-gray-500">{filteredChats.length}</span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="space-y-2">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  chat.isActive
                    ? 'bg-blue-50 border-l-4 border-blue-500'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <MessageSquare className={`w-4 h-4 ${
                      chat.isActive ? 'text-blue-500' : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className={`text-sm font-medium truncate ${
                        chat.isActive ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {chat.title}
                      </h5>
                      <span className="text-xs text-gray-500 ml-2">
                        {formatTime(chat.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {chat.lastMessage}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};