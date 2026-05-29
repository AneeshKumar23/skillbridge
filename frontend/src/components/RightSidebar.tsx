import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Reference } from './chat/Reference';
import { LearningPath } from './chat/LearningPath';

interface RightSidebarProps {
  currentPrompt?: string;
  userId?: string;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ currentPrompt, userId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'references' | 'learning'>('learning');

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      {/* Collapsed State Button */}
      {!isExpanded && (
        <button
          onClick={toggleExpanded}
          className="fixed right-0 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-900 border border-r-0 border-gray-200 dark:border-gray-700 rounded-l-lg py-4 px-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-md z-30 flex flex-col items-center gap-4"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
          <div className="writing-vertical-rl transform rotate-180 whitespace-nowrap">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 tracking-wider">Learning References</span>
          </div>
        </button>
      )}

      {/* Expanded State Sidebar */}
      <div className={`fixed right-0 top-12 sm:top-16 h-[calc(100vh-3rem)] sm:h-[calc(100vh-4rem)] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-lg transition-transform duration-300 ease-in-out z-30 w-80 sm:w-96 ${isExpanded ? 'translate-x-0' : 'translate-x-full'
        }`}>
        {/* Toggle Button (when expanded) */}
        {isExpanded && (
          <button
            onClick={toggleExpanded}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-full bg-white dark:bg-gray-900 border border-r-0 border-gray-200 dark:border-gray-700 rounded-l-lg p-1.5 sm:p-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-md"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          </button>
        )}

        <div className="flex flex-col h-full">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('references')}
              className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors ${activeTab === 'references'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              References
            </button>
            <button
              onClick={() => setActiveTab('learning')}
              className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors ${activeTab === 'learning'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <span className="hidden sm:inline">Learning Path</span>
              <span className="sm:hidden">Learning</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 relative overflow-hidden h-full">
            <div className={`absolute inset-0 ${activeTab === 'references' ? 'block' : 'hidden'}`}>
              <Reference
                isExpanded={isExpanded}
                onToggle={toggleExpanded}
                prompt={currentPrompt || ''}
                userId={userId}
              />
            </div>
            <div className={`absolute inset-0 ${activeTab === 'learning' ? 'block' : 'hidden'}`}>
              <LearningPath prompt={currentPrompt} userId={userId} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};