import React from 'react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { ChatContainer } from '../components/chat/ChatContainer';
import { RightSidebar } from '../components/RightSidebar';

export const Chat: React.FC = () => {
  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <div className="flex-1 flex relative">
        {/* Left Sidebar */}
        <Sidebar />
        
        {/* Chat Container */}
        <div className="flex-1 p-4 pr-16">
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