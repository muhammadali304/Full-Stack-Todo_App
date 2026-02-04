'use client';

import { ChatMessage } from '@/lib/types';
import { User, Bot, AlertCircle } from 'lucide-react';
import MessageBubble from './MessageBubble';

interface ChatAreaProps {
  messages: ChatMessage[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  error?: string | null;
}

export default function ChatArea({ messages, isLoading, messagesEndRef, error }: ChatAreaProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="space-y-6">
        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-center">
            {error}
          </div>
        )}

        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <div className="bg-gray-800/50 p-4 rounded-full mb-4 backdrop-blur-sm">
              <MessageCircle className="h-12 w-12 text-purple-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Welcome to Todo Assistant</h3>
            <p className="text-gray-400 max-w-md">
              I can help you manage your tasks. Try asking me to add, complete, or list your tasks.
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-gray-700">
                <p className="text-sm text-gray-300">"Add task: Buy groceries"</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-gray-700">
                <p className="text-sm text-gray-300">"Complete task #1"</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-gray-700">
                <p className="text-sm text-gray-300">"Show my tasks"</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-gray-700">
                <p className="text-sm text-gray-300">"Delete task #2"</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-none'
                      : 'bg-white/10 backdrop-blur-sm text-white border border-gray-600 rounded-bl-none'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {message.role === 'assistant' && (
                      <div className="bg-gray-700 p-2 rounded-full flex-shrink-0">
                        <Bot className="h-5 w-5 text-purple-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      {message.createdAt && (
                        <p
                          className={`text-xs mt-2 ${
                            message.role === 'user' ? 'text-purple-200' : 'text-gray-400'
                          }`}
                        >
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      )}
                    </div>
                    {message.role === 'user' && (
                      <div className="bg-gray-700 p-2 rounded-full flex-shrink-0">
                        <User className="h-5 w-5 text-purple-400" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/10 backdrop-blur-sm border border-gray-600 rounded-2xl rounded-bl-none px-4 py-3 max-w-3xl">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-700 p-2 rounded-full">
                      <Bot className="h-5 w-5 text-purple-400" />
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}