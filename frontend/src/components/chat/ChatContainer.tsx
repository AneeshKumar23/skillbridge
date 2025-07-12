import React, { useState, useEffect } from 'react';
import { ChatInput } from '../chat/ChatInput';
import { getPrompts, addPrompt, sendPromptToAI } from '../../../api/db'; // Adjust path if needed
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export const ChatContainer: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const userId = 'da682570422947809ad317ddcba73f39'; // Replace with actual logged-in user ID

  useEffect(() => {
    const loadPrompts = async () => {
      try {
        const data = await getPrompts(userId);
        const loadedMessages: Message[] = (data.prompts || []).map((prompt: string, index: number) => ({
          id: `u-${index}`,
          content: prompt,
          isUser: true,
          timestamp: new Date(),
        }));

        setMessages([
          {
            id: 'welcome',
            content: "Hello! I'm here to help you learn new skills. What would you like to explore today?",
            isUser: false,
            timestamp: new Date(),
          },
          ...loadedMessages,
        ]);
      } catch (err) {
        console.error('Failed to load prompts:', err);
      }
    };

    loadPrompts();
  }, []);

  const handleSendMessage = async (message: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      await addPrompt(userId, message);

      const aiResult = await sendPromptToAI(userId, message);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResult.response || 'Sorry, I could not understand that.',
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('Error sending prompt or getting response:', err);

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          content: 'Something went wrong. Please try again later.',
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">AI</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Learning Assistant</h3>
            <p className="text-sm text-gray-500">Online now</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          <span className="text-sm text-gray-500">Active</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[90%] lg:max-w-2xl px-4 py-2 rounded-lg ${
                message.isUser
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-900 rounded-bl-none'
              }`}
            >
              <ReactMarkdown
                children={message.content}
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline ? (
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match?.[1] || 'javascript'}
                        PreTag="div"
                        customStyle={{ borderRadius: '0.5rem', padding: '1rem' }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className="bg-gray-300 px-1 py-0.5 rounded text-sm font-mono">{children}</code>
                    );
                  },
                  h1: ({ children }) => <h1 className="text-xl font-bold mt-4 mb-2">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-lg font-semibold mt-4 mb-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-md font-medium mt-3 mb-1">{children}</h3>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-2 pl-5">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-2 pl-5">{children}</ol>,
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                  p: ({ children }) => <p className="mb-2 text-sm">{children}</p>,
                }}
              />
              <p className={`text-xs mt-1 ${message.isUser ? 'text-blue-100' : 'text-gray-500'}`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        elevenLabsApiKey="sk_f4eb4f9b5bd11d11f96e09cb006772873690e5ef88c767c0"
      />
    </div>
  );
};
