'use client';

import { useState } from 'react';
import { CheckCircle, Circle, Trash2, Plus } from 'lucide-react';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: (text: string) => void;
}

export default function TodoList({ todos, onToggle, onDelete, onAdd }: TodoListProps) {
  const [newTodo, setNewTodo] = useState('');

  const handleAdd = () => {
    if (newTodo.trim()) {
      onAdd(newTodo.trim());
      setNewTodo('');
    }
  };

  const pendingCount = todos.filter(todo => !todo.completed).length;

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <div className="w-2/5 flex flex-col border-r border-gray-700 bg-gray-800/50 backdrop-blur-sm">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">My Tasks</h2>
          <span className="bg-purple-600 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
            {pendingCount} pending
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {todos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="bg-gray-700 p-3 rounded-full mb-3">
              <CheckCircle className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-1">No tasks yet</h3>
            <p className="text-gray-400 text-sm">Add your first task to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className={`flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-gray-600 transition-all duration-200 hover:bg-white/20 ${
                  todo.completed ? 'opacity-70' : ''
                }`}
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <button
                    onClick={() => onToggle(todo.id)}
                    className="flex-shrink-0"
                  >
                    {todo.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  <span
                    className={`truncate ${todo.completed ? 'line-through text-gray-400' : 'text-white'}`}
                  >
                    {todo.text}
                  </span>
                </div>
                <button
                  onClick={() => onDelete(todo.id)}
                  className="flex-shrink-0 p-1 text-gray-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Todo Input */}
      <div className="p-3 border-t border-gray-700">
        <div className="flex items-center space-x-1">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a new task..."
            className="flex-1 bg-gray-700 text-white placeholder-gray-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleAdd}
            disabled={!newTodo.trim()}
            className={`p-2 rounded-lg transition-colors ${
              newTodo.trim()
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}