import { Bot, User } from 'lucide-react';
import { ChatMessage } from '@/lib/types';

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs md:max-w-md rounded-xl px-3 py-2 ${
          isUser
            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-none'
            : 'bg-white/10 backdrop-blur-sm text-white border border-gray-600 rounded-bl-none'
        }`}
      >
        <div className="flex items-start gap-2">
          {message.role === 'assistant' && (
            <div className="bg-gray-700 p-1 rounded-full flex-shrink-0 mt-0.5">
              <Bot className="h-4 w-4 text-purple-400" />
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm">{message.content}</p>
            {message.createdAt && (
              <p
                className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-purple-200' : 'text-gray-400'
                }`}
              >
                {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
          {message.role === 'user' && (
            <div className="bg-gray-700 p-1 rounded-full flex-shrink-0 mt-0.5">
              <User className="h-4 w-4 text-purple-400" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}