'use client';

import { useState, KeyboardEvent } from 'react';
import { SendHorizontal, Loader } from 'lucide-react';

interface InputAreaProps {
  onSendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
}

export default function InputArea({ onSendMessage, isLoading }: InputAreaProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = async () => {
    if (inputValue.trim() && !isLoading) {
      await onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyDown = async (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      await handleSubmit();
    }
  };

  return (
    <div className="p-4 border-t border-gray-700 bg-gray-800/50 backdrop-blur-sm">
      <div className="flex items-end space-x-2">
        <div className="flex-1">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message or command (e.g., 'add task: buy groceries')..."
            disabled={isLoading}
            rows={1}
            className="w-full bg-gray-700 text-white placeholder-gray-400 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none max-h-24"
          />
          <p className="text-xs text-gray-400 mt-1">
            Try commands like: "add task", "complete task #1", "delete task #2"
          </p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isLoading || !inputValue.trim()}
          className={`p-2 rounded-full transition-all ${
            inputValue.trim() && !isLoading
              ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          <SendHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}