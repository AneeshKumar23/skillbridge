import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  BookOpen,
  ExternalLink,
  FileText,
  Video,
  Link,
  Play,
  X,
} from 'lucide-react';
import { getArticleResources, getYouTubeResources, getResources, getStoredUserId } from '../../../api/db';

interface Reference {
  id: string;
  title: string;
  type: 'link' | 'video' | 'document' | 'iframe';
  url: string;
  description: string;
  thumbnail?: string;
}

interface ReferenceProps {
  isExpanded: boolean;
  onToggle: () => void;
  prompt: string;
  userId?: string;
}

export const Reference: React.FC<ReferenceProps> = ({ isExpanded, onToggle, prompt, userId }) => {
  const [references, setReferences] = useState<Reference[]>([]);
  const [activeEmbed, setActiveEmbed] = useState<string | null>(null);

  useEffect(() => {
    const fetchResources = async () => {
      if (!prompt) return;

      const uid = userId || getStoredUserId() || '';
      const newRefs: Reference[] = [];

      try {
        const cached = await getResources(uid);
        const filtered = cached.filter(r => r.topic === prompt);
        
        if (filtered.length > 0) {
          const refs: Reference[] = [];
          filtered.forEach((res, i) => {
            if (res.type === 'article') {
              const data = res.data as any;
              if (data.articles) {
                data.articles.forEach((art: any, j: number) => {
                  refs.push({
                    id: `cached-art-${i}-${j}`,
                    title: art.title,
                    type: 'document',
                    url: art.link,
                    description: `Read more about ${prompt}`
                  });
                });
              }
            } else if (res.type === 'youtube') {
              const data = res.data as any;
              if (data.materials) {
                data.materials.forEach((vid: any, j: number) => {
                  refs.push({
                    id: `cached-vid-${i}-${j}`,
                    title: vid.title,
                    type: 'video',
                    url: vid.link,
                    description: vid.title
                  });
                });
              }
            }
          });
          if (refs.length > 0) {
            setReferences(refs);
            return; // Use cached
          }
        }
      } catch (e) {
        console.error('Failed to load cached resources', e);
      }

      try {
        const artData = await getArticleResources(uid, prompt);
        if (artData.articles && Array.isArray(artData.articles)) {
          artData.articles.forEach((article: any, index: number) => {
            newRefs.push({
              id: `article-${index}`,
              title: article.title,
              type: 'document',
              url: article.link,
              description: `Read more about ${prompt} on ${new URL(article.link).hostname}`,
            });
          });
        }
      } catch (e) { console.error('Article fetch error', e); }

      try {
        const ytData = await getYouTubeResources(uid, prompt);
        if (ytData.materials && Array.isArray(ytData.materials)) {
          ytData.materials.forEach((video: any, index: number) => {
            newRefs.push({
              id: `video-${index}`,
              title: video.title,
              type: 'video',
              url: video.link,
              description: ytData.description || video.title,
            });
          });
        }
      } catch (e) { console.error('YouTube fetch error', e); }

      setReferences(newRefs);
    };

    fetchResources();
  }, [prompt, userId]);

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
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <BookOpen className="w-6 h-6 text-blue-500" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">References</h3>
        </div>
        <button
          onClick={onToggle}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {references.map((reference) => (
            <div key={reference.id} className="space-y-3">
              <div
                className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 cursor-pointer transition-all duration-200 hover:shadow-sm bg-white dark:bg-gray-800"
                onClick={() => handleReferenceClick(reference)}
              >
                <div className="flex-shrink-0 mt-1">{getIcon(reference.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-tight">
                      {reference.title}
                    </h4>
                    {(reference.type === 'video' || reference.type === 'iframe') && (
                      <div className="ml-2 flex-shrink-0">
                        <Play className="w-4 h-4 text-red-500" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    {reference.description}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs text-blue-600 capitalize font-medium">
                      {reference.type}
                    </span>
                    {reference.type === 'link' && <ExternalLink className="w-3 h-3 text-gray-400" />}
                  </div>
                </div>
              </div>

              {(reference.type === 'video' || reference.type === 'iframe') &&
                activeEmbed === reference.id && (
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
                        src={
                          reference.url.includes('youtube.com/watch?v=')
                            ? reference.url.replace('youtube.com/watch?v=', 'youtube.com/embed/')
                            : reference.url.includes('youtu.be/')
                            ? reference.url.replace('youtu.be/', 'youtube.com/embed/')
                            : reference.url
                        }
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
      </div>
    </div>
  );
};
