import React, { useState, useRef } from 'react';
import { Send, Paperclip, Mic } from 'lucide-react';
import { AudioRecorder, transcribeAudio } from '../../../api/stt';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  elevenLabsApiKey: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, elevenLabsApiKey }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);

  const handleSend = () => {
    if (inputMessage.trim()) {
      onSendMessage(inputMessage);
      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      audioRecorderRef.current?.stopRecording();
      setIsRecording(false);
      setIsTranscribing(true);
    } else {
      // Start recording
      try {
        audioRecorderRef.current = new AudioRecorder(async (audioBlob) => {
          const result = await transcribeAudio(audioBlob, elevenLabsApiKey);
          if (result?.text) {
            const transcribedText = result.text.trim();
            setInputMessage(transcribedText);
            // Auto-send the transcribed message
            onSendMessage(transcribedText);
            setInputMessage('');
          }
          setIsTranscribing(false);
        });
        await audioRecorderRef.current.startRecording();
        setIsRecording(true);
      } catch (error) {
        console.error('Recording error:', error);
        setIsRecording(false);
        setIsTranscribing(false);
      }
    }
  };

  return (
    <div className="p-4 bg-white border-t border-gray-100 rounded-b-2xl shadow-sm">
      <div className="flex items-center gap-3">
        {/* Left action buttons */}
        <div className="flex items-center gap-2">
          <button 
            type="button"
            className="p-2 text-gray-400 hover:text-blue-500 rounded-full hover:bg-blue-50 transition-colors"
            aria-label="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <button 
            type="button"
            onClick={toggleRecording}
            disabled={isTranscribing}
            className={`p-2 rounded-full transition-colors ${
              isRecording 
                ? 'text-red-500 bg-red-50 animate-pulse' 
                : isTranscribing
                  ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                  : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'
            }`}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
          >
            <Mic className="w-5 h-5" />
          </button>
        </div>

        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              isRecording ? "Listening... Speak now" : 
              isTranscribing ? "Transcribing..." : 
              "Type your message..."
            }
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 resize-none transition-all duration-200 shadow-sm"
            rows={1}
            style={{ 
              minHeight: '3rem',
              maxHeight: '7.5rem',
              scrollbarWidth: 'none'
            }}
            disabled={isRecording || isTranscribing}
          />
        </div>

        {/* Send button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!inputMessage.trim() || isRecording || isTranscribing}
          className={`p-2 rounded-xl transition-all duration-200 ${
            inputMessage.trim() && !isRecording && !isTranscribing
              ? 'bg-blue-500 hover:bg-blue-600 shadow-md hover:scale-105'
              : 'bg-gray-200 cursor-not-allowed'
          }`}
          aria-label="Send message"
        >
          <Send className={`w-5 h-5 ${
            inputMessage.trim() && !isRecording && !isTranscribing ? 'text-white' : 'text-gray-400'
          }`} />
        </button>
      </div>

      {/* Status indicators */}
      {isRecording && (
        <div className="mt-2 text-center text-sm text-red-500 animate-pulse">
          Recording in progress... Click microphone to stop
        </div>
      )}
      {isTranscribing && (
        <div className="mt-2 text-center text-sm text-blue-500">
          Transcribing your speech...
        </div>
      )}
    </div>
  );
};