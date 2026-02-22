import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { ChatContainer } from '../components/chat/ChatContainer';
import { RightSidebar } from '../components/RightSidebar';
import { Certificates } from './Certificates';
import { Communities } from './Communities';
import { useUser } from '../context/UserContext';

type PageType = 'chat' | 'certificates' | 'settings' | 'communities';

export const Chat: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageType>('chat');
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [selectedSkill, setSelectedSkill] = useState<string | undefined>(undefined);
  const { user, isLoading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (user && user.skills && user.skills.length > 0 && !currentPrompt) {
      setCurrentPrompt(user.skills[0]);
    }
  }, [user, currentPrompt]);

  // On mobile the header button opens/closes the slide-over.
  // On desktop it collapses/expands the sidebar.
  const handleMenuToggle = () => {
    if (window.innerWidth >= 1024) {
      setIsSidebarCollapsed(prev => !prev);
    } else {
      setIsMobileSidebarOpen(prev => !prev);
    }
  };

  const closeMobileSidebar = () => setIsMobileSidebarOpen(false);
  const toggleCollapse = () => setIsSidebarCollapsed(prev => !prev);

  const handleNavigation = (page: PageType) => {
    setCurrentPage(page);
    closeMobileSidebar();
  };

  const handleBackToChat = () => setCurrentPage('chat');

  if (isLoading || !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading…</p>
        </div>
      </div>
    );
  }

  if (currentPage === 'certificates') {
    return <Certificates onBack={handleBackToChat} />;
  }

  if (currentPage === 'communities') {
    return <Communities onBack={handleBackToChat} />;
  }

  if (currentPage === 'settings') {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Settings page coming soon…</p>
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
    <div className="h-screen bg-gray-50 dark:bg-gray-950 flex flex-col overflow-hidden">
      {/* Header */}
      <Header
        onMenuToggle={handleMenuToggle}
        isSidebarCollapsed={isSidebarCollapsed}
        user={user}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          isOpen={isMobileSidebarOpen}
          isCollapsed={isSidebarCollapsed}
          onClose={closeMobileSidebar}
          onToggleCollapse={toggleCollapse}
          onNavigate={handleNavigation}
          onSkillSelect={(skill) => {
            setSelectedSkill(skill);   // resets chat
            setCurrentPrompt(skill);   // updates References & LearningPath
          }}
          userId={user.id}
          user={user}
        />

        {/* Chat Container */}
        <div className="flex-1 p-2 sm:p-4 pr-12 sm:pr-16 overflow-hidden">
          <div className="h-full">
            <ChatContainer userId={user.id} currentSkill={selectedSkill} onPromptChange={setCurrentPrompt} />
          </div>
        </div>

        {/* Right Sidebar */}
        <RightSidebar currentPrompt={currentPrompt} userId={user.id} />
      </div>
    </div>
  );
};