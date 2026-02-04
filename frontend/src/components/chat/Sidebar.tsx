'use client';

import { Conversation } from '@/lib/types';
import { Plus, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SidebarProps {
  conversations: Conversation[];
  selectedConversation: string;
  onNewConversation: () => void;
  onSelectConversation: (id: string) => void;
}

export default function Sidebar({
  conversations,
  selectedConversation,
  onNewConversation,
  onSelectConversation,
}: SidebarProps) {
  return (
    <div className="w-80 bg-gray-800 text-white flex flex-col h-full border-r border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <button
          onClick={onNewConversation}
          className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="p-2">
          <h3 className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Conversations</h3>
        </div>

        <div className="space-y-1">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              className={`w-full text-left p-3 rounded-lg cursor-pointer transition-colors ${
                selectedConversation === conversation.id
                  ? 'bg-purple-900/50 text-purple-200'
                  : 'hover:bg-gray-700/50 text-gray-300'
              }`}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 flex-shrink-0 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate text-sm">{conversation.title}</div>
                  <div className="text-xs text-gray-400 truncate mt-1">
                    {conversation.updatedAt ? formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true }) : 'Just now'}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}