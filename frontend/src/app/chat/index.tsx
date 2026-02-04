'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare } from 'lucide-react';
import { ChatMessage } from '@/lib/types';
import TodoList from '@/components/chat/TodoList';
import ChatHeader from '@/components/chat/ChatHeader';
import ChatInput from '@/components/chat/ChatInput';
import MessageBubble from '@/components/chat/MessageBubble';
import TypingIndicator from '@/components/chat/TypingIndicator';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

export default function CompleteChatPage() {
  // State for todos
  const [todos, setTodos] = useState<Todo[]>([
    { id: '1', text: 'Complete project proposal', completed: false, createdAt: new Date() },
    { id: '2', text: 'Schedule team meeting', completed: true, createdAt: new Date() },
    { id: '3', text: 'Review documentation', completed: false, createdAt: new Date() },
  ]);

  // State for chat
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'assistant', content: 'Hello! I\'m your Todo Assistant. How can I help you today?', createdAt: new Date(Date.now() - 30000).toISOString(), status: 'completed' },
    { id: '2', role: 'user', content: 'Can you add a new task?', createdAt: new Date(Date.now() - 15000).toISOString(), status: 'completed' },
    { id: '3', role: 'assistant', content: 'Sure! What task would you like to add?', createdAt: new Date(Date.now() - 10000).toISOString(), status: 'completed' },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle sending a message
  const handleSendMessage = async (content: string) => {
    if (content.trim() === '') return;

    // Add user message
    const newUserMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: content,
      createdAt: new Date().toISOString(),
      status: 'completed',
    };

    setMessages(prev => [...prev, newUserMessage]);

    // Simulate bot typing
    setIsLoading(true);

    setTimeout(() => {
      // Add bot response
      const botResponses = [
        'I\'ve processed your request.',
        'Okay, I\'ll take care of that for you.',
        'Got it! What else can I help with?',
        'That\'s been noted and updated.',
        'Your request has been completed successfully.'
      ];

      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];

      const newBotMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: randomResponse,
        createdAt: new Date().toISOString(),
        status: 'completed',
      };

      setMessages(prev => [...prev, newBotMessage]);
      setIsLoading(false);
    }, 1000);
  };

  // Handle adding a new todo
  const handleAddTodo = (text: string) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      text: text,
      completed: false,
      createdAt: new Date(),
    };

    setTodos(prev => [...prev, newTodo]);
  };

  // Toggle todo completion
  const handleToggleTodo = (id: string) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // Delete a todo
  const handleDeleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "var(--color-background)" }}>
      <Header />
      <div className="flex" style={{ height: "calc(100vh - 64px)" }}>
        {/* Left Sidebar - Todo List */}
        <TodoList
          todos={todos}
          onToggle={handleToggleTodo}
          onDelete={handleDeleteTodo}
          onAdd={handleAddTodo}
        />

        {/* Right Chat Area */}
        <div className="w-3/5 flex flex-col">
          {/* Chat Header */}
          <ChatHeader />

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className="p-3 rounded-full mb-3" style={{ background: "var(--color-background-secondary)" }}>
                  <MessageSquare className="h-10 w-10" style={{ color: "var(--color-primary)" }} />
                </div>
                <h3 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>Welcome to Todo Assistant</h3>
                <p className="text-sm max-w-md" style={{ color: "var(--color-text-secondary)" }}>
                  I can help you manage your tasks. Try asking me to add, complete, or list your tasks.
                </p>
                <div className="mt-4 grid grid-cols-1 gap-2 w-full max-w-md">
                  <div className="rounded-lg p-2" style={{ background: "var(--color-background-secondary)", border: "1px solid var(--color-border)" }}>
                    <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Add task: Buy groceries</p>
                  </div>
                  <div className="rounded-lg p-2" style={{ background: "var(--color-background-secondary)", border: "1px solid var(--color-border)" }}>
                    <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Complete task #1</p>
                  </div>
                  <div className="rounded-lg p-2" style={{ background: "var(--color-background-secondary)", border: "1px solid var(--color-border)" }}>
                    <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Show my tasks</p>
                  </div>
                  <div className="rounded-lg p-2" style={{ background: "var(--color-background-secondary)", border: "1px solid var(--color-border)" }}>
                    <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Delete task #2</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}

                {isLoading && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}