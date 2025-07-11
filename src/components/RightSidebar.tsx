import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Reference } from './chat/Reference';
import { LearningPath } from './chat/LearningPath';

export const RightSidebar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'references' | 'learning'>('references');

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`fixed right-0 top-16 h-[calc(100vh-4rem)] bg-white border-l border-gray-200 shadow-lg transition-all duration-300 ease-in-out z-50 ${
      isExpanded ? 'w-96' : 'w-12'
    }`}>
      {/* Toggle Button */}
      <button
        onClick={toggleExpanded}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-full bg-white border border-r-0 border-gray-200 rounded-l-lg p-2 hover:bg-gray-50 transition-colors shadow-md"
      >
        {isExpanded ? (
          <ChevronRight className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {/* Collapsed State */}
      {!isExpanded && (
        <div className="flex flex-col items-center justify-center h-full space-y-8">
          <div className="transform -rotate-90 whitespace-nowrap">
            <span className="text-sm font-medium text-gray-700">References</span>
          </div>
          <div className="transform -rotate-90 whitespace-nowrap">
            <span className="text-sm font-medium text-gray-700">Learning</span>
          </div>
        </div>
      )}

      {/* Expanded State */}
      {isExpanded && (
        <div className="flex flex-col h-full">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('references')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'references'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              References
            </button>
            <button
              onClick={() => setActiveTab('learning')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'learning'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Learning Path
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'references' ? (
              <Reference isExpanded={isExpanded} onToggle={toggleExpanded} />
            ) : (
              <LearningPath />
            )}
          </div>
        </div>
      )}
    </div>
  );
};