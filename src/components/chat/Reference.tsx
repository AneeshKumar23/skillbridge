import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, ExternalLink, FileText, Video, Link, Play, X } from 'lucide-react';

interface Reference {
  id: string;
  title: string;
  type: 'link' | 'video' | 'document' | 'iframe';
  url: string;
  description: string;
  thumbnail?: string;
}

const references: Reference[] = [
  {
    id: '1',
    title: 'MDN Web Docs - JavaScript',
    type: 'link',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
    description: 'Comprehensive JavaScript documentation',
  },
  {
    id: '2',
    title: 'React Official Tutorial',
    type: 'link',
    url: 'https://react.dev/learn',
    description: 'Learn React from the official documentation',
  },
  {
    id: '3',
    title: 'JavaScript Crash Course',
    type: 'video',
    url: 'https://www.youtube.com/embed/hdI2bqOjy3c',
    description: 'Complete JavaScript tutorial for beginners',
    thumbnail: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
  },
  {
    id: '4',
    title: 'React Hooks Guide',
    type: 'document',
    url: 'https://react.dev/reference/react/hooks',
    description: 'Complete guide to React Hooks',
  },
  {
    id: '5',
    title: 'CSS Grid Tutorial',
    type: 'video',
    url: 'https://www.youtube.com/embed/jV8B24rSN5o',
    description: 'Learn CSS Grid layout system',
    thumbnail: 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
  },
  {
    id: '6',
    title: 'TypeScript Playground',
    type: 'iframe',
    url: 'https://www.typescriptlang.org/play',
    description: 'Interactive TypeScript editor',
  },
];

interface ReferenceProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export const Reference: React.FC<ReferenceProps> = ({ isExpanded, onToggle }) => {
  const [activeEmbed, setActiveEmbed] = useState<string | null>(null);

  const getIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4 text-red-500" />;
      case 'document':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'iframe':
        return <ExternalLink className="w-4 h-4 text-purple-500" />;
      default:
        return <Link className="w-4 h-4 text-green-500" />;
    }
  };

  const handleReferenceClick = (reference: Reference) => {
    if (reference.type === 'video' || reference.type === 'iframe') {
      setActiveEmbed(activeEmbed === reference.id ? null : reference.id);
    } else {
      window.open(reference.url, '_blank');
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <BookOpen className="w-6 h-6 text-blue-500" />
          <h3 className="font-semibold text-gray-900">References</h3>
        </div>
        <button
          onClick={onToggle}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {references.map((reference) => (
            <div key={reference.id} className="space-y-3">
              <div
                className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer transition-all duration-200 hover:shadow-sm"
                onClick={() => handleReferenceClick(reference)}
              >
                <div className="flex-shrink-0 mt-1">
                  {getIcon(reference.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <h4 className="text-sm font-medium text-gray-900 leading-tight">
                      {reference.title}
                    </h4>
                    {(reference.type === 'video' || reference.type === 'iframe') && (
                      <div className="ml-2 flex-shrink-0">
                        {reference.type === 'video' && (
                          <Play className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {reference.description}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs text-blue-600 capitalize font-medium">
                      {reference.type}
                    </span>
                    {reference.type === 'link' && (
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Video Thumbnail */}
              {reference.type === 'video' && reference.thumbnail && (
                <div className="ml-6">
                  <div
                    className="relative rounded-lg overflow-hidden cursor-pointer group"
                    onClick={() => handleReferenceClick(reference)}
                  >
                    <img
                      src={reference.thumbnail}
                      alt={reference.title}
                      className="w-full h-32 object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center group-hover:bg-opacity-40 transition-all duration-200">
                      <div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                        <Play className="w-6 h-6 text-gray-800 ml-1" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Embedded Content */}
              {(reference.type === 'video' || reference.type === 'iframe') && activeEmbed === reference.id && (
                <div className="ml-6">
                  <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveEmbed(null);
                      }}
                      className="absolute top-2 right-2 z-10 p-1 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <iframe
                      src={reference.url}
                      className="w-full h-64"
                      title={reference.title}
                      frameBorder="0"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Quick Actions */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <FileText className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">Quick Actions</span>
          </div>
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              Add New Reference
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              Export References
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              Import from Bookmarks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};