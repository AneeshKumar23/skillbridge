import React, { useState, useEffect, useRef } from 'react';
import { getChatHistory, sendMessage } from '../../../api/db';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { BookOpen, Send, Mic, Paperclip, Languages, Copy, Check } from 'lucide-react';
import { AudioRecorder, transcribeAudio, TranscriptionLanguage } from '../../../api/stt';
import { useTheme } from 'next-themes';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  isSystem?: boolean;
  timestamp: Date;
}

interface ChatContainerProps {
  userId: string;
  currentSkill?: string;
  onPromptChange?: (prompt: string) => void;
}

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'ta', label: 'Tamil' },
  { value: 'te', label: 'Telugu' },
  { value: 'hi', label: 'Hindi' },
];

export const ChatContainer: React.FC<ChatContainerProps> = ({ userId, currentSkill, onPromptChange }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<TranscriptionLanguage>('en');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await getChatHistory(userId);
        const loadedMessages: Message[] = (history || []).map((msg: { id: number | string; role: string; content: string; created_at: string }) => ({
          id: String(msg.id),
          content: msg.content,
          isUser: msg.role === 'user',
          timestamp: new Date(msg.created_at),
        }));

        setMessages([
          {
            id: 'welcome',
            content: "Hello! I'm your AI learning assistant. What would you like to explore today?",
            isUser: false,
            timestamp: new Date(),
          },
          ...loadedMessages,
        ]);

        const lastUserMsg = [...loadedMessages].reverse().find(m => m.isUser);
        if (lastUserMsg && onPromptChange) onPromptChange(lastUserMsg.content);
      } catch (err) {
        console.error('Failed to load chat history:', err);
      }
    };
    loadHistory();
  }, [userId]);

  useEffect(() => {
    if (!currentSkill) return;
    setMessages([{
      id: `skill-ctx-${Date.now()}`,
      content: currentSkill,
      isSystem: true,
      isUser: false,
      timestamp: new Date(),
    }]);

    const askAI = async () => {
      if (onPromptChange) onPromptChange(currentSkill);
      try {
        const aiResult = await sendMessage(userId, `I want to learn "${currentSkill}". Give me a brief overview of what it is, why it's valuable, and the best way to start learning it.`);
        setMessages(prev => [...prev, {
          id: `skill-ai-${Date.now()}`,
          content: aiResult.response || 'Sorry, I could not generate a response.',
          isUser: false,
          timestamp: new Date(),
        }]);
      } catch (err) {
        console.error('Skill context AI error:', err);
      }
    };
    askAI();
  }, [currentSkill]);

  const handleSend = async () => {
    if (!inputMessage.trim()) return;
    const message = inputMessage.trim();
    setInputMessage('');

    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const aiResult = await sendMessage(userId, message);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        content: aiResult.response || 'Sorry, I could not understand that.',
        isUser: false,
        timestamp: new Date(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
        content: 'Something went wrong. Please try again later.',
        isUser: false,
        timestamp: new Date(),
      }]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      audioRecorderRef.current?.stopRecording();
      setIsRecording(false);
      setIsTranscribing(true);
    } else {
      try {
        audioRecorderRef.current = new AudioRecorder(async (audioBlob) => {
          const result = await transcribeAudio(audioBlob, 'sk_f4eb4f9b5bd11d11f96e09cb006772873690e5ef88c767c0', currentLanguage);
          if (result?.text) setInputMessage(result.text.trim());
          setIsTranscribing(false);
        });
        await audioRecorderRef.current.startRecording();
        setIsRecording(true);
      } catch {
        setIsRecording(false);
        setIsTranscribing(false);
      }
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-6">
        <div className="max-w-3xl mx-auto px-4 space-y-6">
          {messages.map((message) => {

            // ── System banner ──────────────────────────────────────────────
            if (message.isSystem) {
              return (
                <div key={message.id} className="flex justify-center">
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium border border-blue-200 dark:border-blue-700/50">
                    <BookOpen className="w-3.5 h-3.5" />
                    Now learning: <span className="font-semibold">{message.content}</span>
                  </div>
                </div>
              );
            }

            // ── User message ───────────────────────────────────────────────
            if (message.isUser) {
              return (
                <div key={message.id} className="flex justify-end">
                  <div className="max-w-[70%] px-4 py-3 rounded-2xl rounded-br-md bg-blue-600 text-white text-sm leading-relaxed">
                    {message.content}
                  </div>
                </div>
              );
            }

            // ── AI message ─────────────────────────────────────────────────
            return (
              <div key={message.id} className="flex justify-start">
                <div className="w-full">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">S</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 text-gray-800 dark:text-gray-100 text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown
                        children={message.content}
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ node, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '');
                            const codeText = String(children).replace(/\n$/, '');
                            return match ? (
                              <div className="relative my-3 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                  <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{match[1]}</span>
                                  <button
                                    onClick={() => copyToClipboard(message.id + match[1], codeText)}
                                    className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                                  >
                                    {copiedId === message.id + match[1] ? (
                                      <><Check className="w-3.5 h-3.5 text-green-500" /><span className="text-green-500">Copied</span></>
                                    ) : (
                                      <><Copy className="w-3.5 h-3.5" /><span>Copy</span></>
                                    )}
                                  </button>
                                </div>
                                <SyntaxHighlighter
                                  style={isDark ? oneDark : oneLight}
                                  language={match[1]}
                                  PreTag="div"
                                  customStyle={{ margin: 0, borderRadius: 0 }}
                                  {...props}
                                >
                                  {codeText}
                                </SyntaxHighlighter>
                              </div>
                            ) : (
                              <code className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
                            );
                          },
                          h1: ({ children }) => <h1 className="text-lg font-bold mt-4 mb-2 text-gray-900 dark:text-gray-100">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-base font-semibold mt-3 mb-1.5 text-gray-900 dark:text-gray-100">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-sm font-semibold mt-3 mb-1 text-gray-800 dark:text-gray-200">{children}</h3>,
                          ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 my-2">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 my-2">{children}</ol>,
                          li: ({ children }) => <li className="text-gray-700 dark:text-gray-300">{children}</li>,
                          p: ({ children }) => <p className="mb-3 text-gray-700 dark:text-gray-200">{children}</p>,
                          strong: ({ children }) => <strong className="text-gray-900 dark:text-white font-semibold">{children}</strong>,
                          a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">{children}</a>,
                        }}
                      />
                      <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Floating input bar */}
      <div className="py-4 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-end gap-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 shadow-sm focus-within:border-gray-400 dark:focus-within:border-gray-500 transition-colors">

            {/* Left icons */}
            <div className="flex items-center gap-1 self-end pb-0.5">
              <button className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors" title="Attach file">
                <Paperclip className="w-4 h-4" />
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
                  title="Select language"
                >
                  <Languages className="w-4 h-4" />
                </button>
                {showLanguageDropdown && (
                  <div className="absolute bottom-full left-0 mb-2 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-10 overflow-hidden">
                    {languageOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => { setCurrentLanguage(opt.value as TranscriptionLanguage); setShowLanguageDropdown(false); }}
                        className={`w-full text-left px-3 py-2 text-sm transition-colors ${currentLanguage === opt.value
                          ? 'bg-blue-50 dark:bg-blue-600 text-blue-700 dark:text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Textarea */}
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isRecording ? 'Listening…' : isTranscribing ? 'Transcribing…' : 'Message SkillBridge…'}
              className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none outline-none text-sm leading-relaxed max-h-40 min-h-[1.5rem]"
              rows={1}
              style={{ scrollbarWidth: 'none' }}
              disabled={isRecording || isTranscribing}
            />

            {/* Right icons */}
            <div className="flex items-center gap-1 self-end pb-0.5">
              <button
                onClick={toggleRecording}
                disabled={isTranscribing}
                className={`p-1.5 rounded-lg transition-colors ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
              >
                <Mic className="w-4 h-4" />
              </button>
              <button
                onClick={handleSend}
                disabled={!inputMessage.trim() || isRecording || isTranscribing}
                className={`p-1.5 rounded-lg transition-all ${inputMessage.trim() && !isRecording && !isTranscribing
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-200'
                  : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                  }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-2">
            Selected Language: {languageOptions.find(l => l.value === currentLanguage)?.label ?? currentLanguage}
          </p>
        </div>
      </div>
    </div>
  );
};
