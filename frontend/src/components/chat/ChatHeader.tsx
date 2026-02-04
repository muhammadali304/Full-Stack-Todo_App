import { Bot } from 'lucide-react';

interface ChatHeaderProps {
  botName?: string;
  status?: 'online' | 'offline' | 'away';
  statusText?: string;
}

export default function ChatHeader({
  botName = 'Todo Assistant',
  status = 'online',
  statusText = 'Online • Ready to help'
}: ChatHeaderProps) {
  const statusColor = status === 'online' ? 'bg-green-500' : status === 'away' ? 'bg-yellow-500' : 'bg-gray-500';

  return (
    <div className="p-4 border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="bg-gray-700 p-2 rounded-full">
            <Bot className="h-6 w-6 text-purple-400" />
          </div>
          <div className={`absolute bottom-0 right-0 w-2 h-2 ${statusColor} rounded-full border-2 border-gray-800`}></div>
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">{botName}</h1>
          <p className="text-xs text-gray-400">{statusText}</p>
        </div>
      </div>
    </div>
  );
}