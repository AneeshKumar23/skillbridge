import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { ChatContainer } from '../components/chat/ChatContainer';
import { RightSidebar } from '../components/RightSidebar';
import { Certificates } from './Certificates';

type PageType = 'chat' | 'certificates' | 'settings';

export const Chat: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageType>('chat');

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
      <Header onMenuToggle={toggleSidebar} />
      
      {/* Main Content */}
      <div className="flex-1 flex relative">
        {/* Left Sidebar */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={closeSidebar} 
          onNavigate={handleNavigation} 
        />
        
        {/* Chat Container */}
        <div className="flex-1 p-2 sm:p-4 pr-12 sm:pr-16 lg:ml-0">
          <div className="h-full">
            <ChatContainer />
          </div>
        </div>
        
        {/* Right Sidebar */}
        <RightSidebar />
      </div>
    </div>
  );
};