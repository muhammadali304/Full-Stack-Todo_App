import { Bot } from 'lucide-react';

interface TypingIndicatorProps {
  botName?: string;
}

export default function TypingIndicator({ botName = 'Todo Assistant' }: TypingIndicatorProps) {
  return (
    <div className="flex justify-start">
      <div className="bg-white/10 backdrop-blur-sm border border-gray-600 rounded-xl rounded-bl-none px-3 py-2 max-w-xs md:max-w-md">
        <div className="flex items-center gap-2">
          <div className="bg-gray-700 p-1 rounded-full">
            <Bot className="h-4 w-4 text-purple-400" />
          </div>
          <div className="flex space-x-1">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}