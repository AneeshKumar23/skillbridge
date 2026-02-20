import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { ChatContainer } from '../components/chat/ChatContainer';
import { RightSidebar } from '../components/RightSidebar';
import { Certificates } from './Certificates';
import { useUser } from '../context/UserContext';

type PageType = 'chat' | 'certificates' | 'settings';

export const Chat: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageType>('chat');
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const { user, isLoading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  // Use user's first skill as fallback prompt for sidebar
  useEffect(() => {
    if (user && user.skills && user.skills.length > 0 && !currentPrompt) {
      setCurrentPrompt(user.skills[0]);
    }
  }, [user, currentPrompt]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleNavigation = (page: PageType) => {
    setCurrentPage(page);
    closeSidebar();
  };

  const handleBackToChat = () => {
    setCurrentPage('chat');
  };

  if (isLoading || !user) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  if (currentPage === 'certificates') {
    return <Certificates onBack={handleBackToChat} />;
  }

  if (currentPage === 'settings') {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>
          <p className="text-gray-600 mb-6">Settings page coming soon...</p>
          <button
            onClick={handleBackToChat}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header with toggle prop */}
      <Header onMenuToggle={toggleSidebar} user={user} />

      {/* Main Content */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          onNavigate={handleNavigation}
          user={user}
        />

        {/* Chat Container */}
        <div className="flex-1 p-2 sm:p-4 pr-12 sm:pr-16 lg:ml-0">
          <div className="h-full">
            <ChatContainer userId={user.id} onPromptChange={setCurrentPrompt} />
          </div>
        </div>

        {/* Right Sidebar */}
        <RightSidebar currentPrompt={currentPrompt} />
      </div>
    </div>
  );
};