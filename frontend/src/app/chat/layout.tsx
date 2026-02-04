import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Todo Assistant Chat',
  description: 'Chat with the Todo Assistant to manage your tasks',
};

const ChatLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      {children}
    </div>
  );
};

export default ChatLayout;