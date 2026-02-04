'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Trash2, CheckCircle2, Circle, Bot, User, Sparkles } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { useTasks } from '@/hooks/useTasks';
import { Task } from '@/lib/types';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

const greetings = [
  "Hey! I'm your Todo Assistant 🤖 Tell me what you need to do, and I'll add it to your list!",
];

function parseUserIntent(msg: string) {
  const lower = msg.toLowerCase().trim();

  // Delete patterns
  if (/^(delete|remove|clear)\s+(all|every)/i.test(lower)) return { action: "deleteAll" };
  const delMatch = lower.match(/(?:delete|remove|clear|discard)\s+(?:the\s+)?(?:todo\s+)?(?:number\s*)?#?(\d+)/i);
  if (delMatch) return { action: "delete", index: parseInt(delMatch[1]) - 1 };
  const delTextMatch = lower.match(/(?:delete|remove|clear|discard)\s+(?:the\s+)?(?:todo\s+)?["']?(.+?)["']?\s*$/i);
  if (delTextMatch) return { action: "deleteByText", text: delTextMatch[1].trim() };

  // Complete patterns
  if (/^(complete|done|finish|mark)\s+(?:all|every)/i.test(lower)) return { action: "completeAll" };
  const doneMatch = lower.match(/(?:complete|done|finish|mark|check)\s+(?:as\s+done\s+)?(?:the\s+)?(?:todo\s+)?(?:number\s*)?#?(\d+)/i);
  if (doneMatch) return { action: "complete", index: parseInt(doneMatch[1]) - 1 };
  const doneTextMatch = lower.match(/(?:complete|done|finish|mark|check)\s+(?:as\s+done\s+)?(?:the\s+)?(?:todo\s+)?["']?(.+?)["']?\s*$/i);
  if (doneTextMatch) return { action: "completeByText", text: doneTextMatch[1].trim() };

  // Undo / reopen
  const undoMatch = lower.match(/(?:undo|reopen|uncomplete|reopen)\s+(?:the\s+)?(?:todo\s+)?(?:number\s*)?#?(\d+)/i);
  if (undoMatch) return { action: "undo", index: parseInt(undoMatch[1]) - 1 };

  // Show / list
  if (/^(show|list|display|what|see)\s*(all|my|the)?\s*(todo|task|list)?s?/i.test(lower) || lower === "list" || lower === "todos" || lower === "show") {
    return { action: "list" };
  }

  // Count
  if (/how many/i.test(lower)) return { action: "count" };

  // Help
  if (/^(help|what can|commands)/i.test(lower)) return { action: "help" };

  // Clear / reset
  if (/^(clear|reset)\s+all/i.test(lower)) return { action: "deleteAll" };

  // Add intent detection (broad)
  const addKeywords = /^(add|create|new|make|i need to|i have to|i should|i want to|remind me to|note:|todo:)/i;
  if (addKeywords.test(lower)) {
    const text = lower
      .replace(/^(add|create|new|make)\s*(a\s+)?(new\s+)?(todo|task|item|note)?\s*:?\s*/i, "")
      .replace(/^(i need to|i have to|i should|i want to|remind me to)\s*/i, "")
      .replace(/^(note|todo)\s*:\s*/i, "")
      .trim();
    return text ? { action: "add", text } : { action: "unknown" };
  }

  // Fallback: if it's a reasonable sentence, treat as add
  if (lower.length > 3 && !lower.startsWith("?") && lower.split(" ").length >= 2) {
    return { action: "addFallback", text: msg.trim() };
  }

  return { action: "unknown" };
}

function generateResponse(intent: any, tasks: Task[], originalInput: string = ""): string {
  switch (intent.action) {
    case "add":
    case "addFallback": {
      const capitalized = intent.text.charAt(0).toUpperCase() + intent.text.slice(1);
      const phrases = ["Added to your list!", "Got it, added!", "Done! It's on your list.", "Sure thing, added!", "Added! You're on track 🎯"];
      return phrases[Math.floor(Math.random() * phrases.length)] + ` ➡️ **${capitalized}**`;
    }
    case "delete": {
      if (intent.index < 0 || intent.index >= tasks.length) return "❌ That task number doesn't exist. Check your list!";
      const removed = tasks[intent.index].title;  // Use 'title' instead of 'text'
      return `Deleted! ✨ Removed **${removed}** from your list.`;
    }
    case "deleteByText": {
      const idx = tasks.findIndex(t => t.title.toLowerCase().includes(intent.text.toLowerCase()));  // Use 'title' instead of 'text'
      if (idx === -1) return "🤔 I couldn't find a matching task. Try listing your tasks first!";
      const removed = tasks[idx].title;  // Use 'title' instead of 'text'
      return `Deleted! ✨ Removed **${removed}** from your list.`;
    }
    case "deleteAll": {
      if (tasks.length === 0) return "Your list is already empty! 😄";
      return `🗑️ Cleared all ${tasks.length} task(s). Fresh start!`;
    }
    case "complete": {
      if (intent.index < 0 || intent.index >= tasks.length) return "❌ That task number doesn't exist!";
      if (tasks[intent.index].completed) return "✅ That one is already done!";
      return `🎉 Marked as done: **${tasks[intent.index].title}**`;  // Use 'title' instead of 'text'
    }
    case "completeByText": {
      const idx = tasks.findIndex(t => t.title.toLowerCase().includes(intent.text.toLowerCase()) && !t.completed);  // Use 'title' instead of 'text'
      if (idx === -1) return "🤔 Couldn't find a pending task matching that. Check your list!";
      return `🎉 Marked as done: **${tasks[idx].title}**`;  // Use 'title' instead of 'text'
    }
    case "completeAll": {
      if (tasks.length === 0) return "No tasks to complete! Add some first 😄";
      return `🎊 All ${tasks.length} task(s) marked as done! Amazing!`;
    }
    case "undo": {
      if (intent.index < 0 || intent.index >= tasks.length) return "❌ That task number doesn't exist!";
      return `↩️ Reopened: **${tasks[intent.index].title}**`;  // Use 'title' instead of 'text'
    }
    case "list": {
      if (tasks.length === 0) return "📝 Your task list is empty! Tell me what to add.";
      return "📋 Here's your current list — check it out on the right!";
    }
    case "count": {
      const done = tasks.filter(t => t.completed).length;
      return `📊 You have **${tasks.length}** task(s) total — **${done}** done, **${tasks.length - done}** pending.`;
    }
    case "help": {
      return `Here's what I can do:\n• **Add** — "Add buy groceries" or just type a task\n• **Complete** — "Complete 1" or "Done buy groceries"\n• **Delete** — "Delete 2" or "Remove buy groceries"\n• **List** — "Show my tasks"\n• **Count** — "How many tasks do I have?"`;
    }
    default:
      // Check if it's a greeting by looking at the original input
      if (originalInput) {
        if (/^(hi|hello|hey|good morning|good afternoon|good evening|greetings|sup)$/i.test(originalInput.toLowerCase())) {
          const greetings = [
            "👋 Hello! I'm your Task Assistant. How can I help you today?",
            "👋 Hi there! What would you like to do with your tasks?",
            "👋 Hey! Need help managing your tasks?",
            "👋 Hello! Feel free to ask me to add, complete, or manage your tasks."
          ];
          return greetings[Math.floor(Math.random() * greetings.length)];
        }
      }
      return "🤔 I'm not sure what you mean. Try saying something like **\"Add a task\"**, **\"Complete 1\"**, or type **help** for commands!";
  }
}

function MessageBubble({ msg }: { msg: { role: string; text: string } }) {
  const isBot = msg.role === "bot";
  const lines = msg.text.split("\n");

  const renderText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((p, i) =>
      p.startsWith("**") && p.endsWith("**")
        ? <strong key={i} style={{ color: isBot ? "var(--color-primary)" : "var(--color-text)" }}>{p.slice(2, -2)}</strong>
        : <span key={i}>{p}</span>
    );
  };

  return (
    <div style={{ display: "flex", justifyContent: isBot ? "flex-start" : "flex-end", marginBottom: "var(--spacing-sm)", gap: "var(--spacing-xs)", alignItems: "flex-end" }}>
      {isBot && (
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,var(--color-primary),var(--color-primary-hover))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Bot size={16} color="#fff" />
        </div>
      )}
      <div style={{
        maxWidth: "75%",
        background: isBot ? "var(--color-background-secondary)" : "linear-gradient(135deg,var(--color-primary),var(--color-primary-hover))",
        border: isBot ? "1px solid var(--color-border)" : "none",
        borderRadius: isBot ? "var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm)" : "var(--radius-lg) var(--radius-lg) var(--radius-sm) var(--radius-lg)",
        padding: "var(--spacing-sm) var(--spacing-md)",
        color: isBot ? "var(--color-text)" : "#fff",
        fontSize: "var(--font-size-sm)",
        lineHeight: 1.5,
      }}>
        {lines.map((line, i) => (
          <div key={i} style={{ marginBottom: i < lines.length - 1 ? "var(--spacing-xs)" : 0 }}>
            {line.startsWith("• ") ? (
              <span style={{ paddingLeft: "var(--spacing-xs)" }}>• {renderText(line.slice(2))}</span>
            ) : renderText(line)}
          </div>
        ))}
      </div>
      {!isBot && (
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,var(--color-primary-hover),var(--color-primary-dark))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <User size={16} color="#fff" />
        </div>
      )}
    </div>
  );
}

function TodoChatApp() {
  const { tasks, loading, error: taskError, fetchTasks, createTask, updateTask, deleteTask } = useTasks();
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([{ role: "bot", text: greetings[0] }]);
  const [input, setInput] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [appError, setAppError] = useState<string | null>(null);
  const [isTodoPanelOpen, setIsTodoPanelOpen] = useState(false);
  const chatEnd = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load tasks when component mounts
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    // Check authentication status on component mount using backend's JWT token
    const checkAuth = async () => {
      try {
        // Get JWT token from localStorage (using same key as auth system)
        const token = localStorage.getItem('auth_token');

        if (token) {
          // Verify token is still valid by calling backend's /api/auth/me endpoint
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/api/auth/me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const userData = await response.json();
            if (userData && userData.id) {
              // Store user ID for later use
              localStorage.setItem('user_id', userData.id);
              setUserId(userData.id);
              setIsAuthenticated(true);
            } else {
              setIsAuthenticated(false);
            }
          } else {
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Error checking authentication:', err);
        setIsAuthenticated(false);
      } finally {
        setIsLoadingAuth(false);
      }
    };

    checkAuth();
  }, []);

  // Add mobile styles
  useEffect(() => {
    const styleId = 'mobile-chat-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @media (max-width: 768px) {
          .mobile-todo-toggle {
            display: block !important;
          }

          .todo-panel-overlay {
            display: none !important;
          }

          .todo-panel-open {
            display: flex !important;
          }

          .mobile-overlay-header {
            display: flex !important;
          }

          .overlay-backdrop {
            display: block !important;
          }
        }

        @media (min-width: 769px) {
          .todo-panel-overlay {
            position: static !important;
            height: auto !important;
            width: auto !important;
            max-width: 340px !important;
            transform: none !important;
            box-shadow: none !important;
            overflow-y: auto !important;
            display: flex !important;
            border-left: 1px solid var(--color-border);
            top: auto !important;
            right: auto !important;
            z-index: auto !important;
          }

          .mobile-overlay-header {
            display: none !important;
          }

          .overlay-backdrop {
            display: none !important;
          }

          .mobile-todo-toggle {
            display: none !important;
          }
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);


  const saveTodo = async (todo: Todo) => {
    try {
      const token = localStorage.getItem('auth_token');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/api/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: todo.text,
          description: '',
          completed: todo.completed,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save todo');
      }

      const result = await response.json();
      // Map task to todo format
      return {
        id: result.id,
        text: result.title,
        completed: result.completed,
        createdAt: result.created_at
      };
    } catch (err) {
      console.error('Error saving todo:', err);
      throw err;
    }
  };

  const updateTodo = async (todoId: string, updates: Partial<Todo>) => {
    try {
      const token = localStorage.getItem('auth_token');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/api/tasks/${todoId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: updates.text,
          completed: updates.completed,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update todo');
      }

      const result = await response.json();
      // Map task to todo format
      return {
        id: result.id,
        text: result.title,
        completed: result.completed,
        createdAt: result.created_at
      };
    } catch (err) {
      console.error('Error updating todo:', err);
      throw err;
    }
  };

  const deleteTodo = async (todoId: string) => {
    try {
      const token = localStorage.getItem('auth_token');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/api/tasks/${todoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete todo');
      }
    } catch (err) {
      console.error('Error deleting todo:', err);
      throw err;
    }
  };

  useEffect(() => {
    chatEnd.current?.scrollIntoView?.({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus?.();
  }, []);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg = { role: "user", text: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    setTimeout(async () => {
      const intent = parseUserIntent(trimmed);

      // Handle specific task operations based on intent using useTasks hook
      switch (intent.action) {
        case 'add':
        case 'addFallback':
          if (!intent.text) {
            setMessages(prev => [...prev, { role: "bot", text: "❌ Please provide a task to add." }]);
            return;
          }
          const capitalized = intent.text.charAt(0).toUpperCase() + intent.text.slice(1);

          try {
            // Create task via backend API using the useTasks hook
            await createTask({
              title: capitalized,
              description: "",
              completed: false
            });

            // Refresh tasks after creation to get the updated list
            await fetchTasks();

            const phrases = ["Added to your list!", "Got it, added!", "Done! It's on your list.", "Sure thing, added!", "Added! You're on track 🎯"];
            const response = phrases[Math.floor(Math.random() * phrases.length)] + ` ➡️ **${capitalized}**`;
            setMessages(prev => [...prev, { role: "bot", text: response }]);
          } catch (err) {
            console.error("Error creating task:", err);
            setMessages(prev => [...prev, { role: "bot", text: "❌ Failed to save your task. Please try again." }]);
          }
          break;

        case 'delete':
          if (intent.index === undefined || intent.index < 0 || intent.index >= tasks.length) {
            setMessages(prev => [...prev, { role: "bot", text: "❌ That task number doesn't exist. Check your list!" }]);
            return;
          }
          const taskToDelete = tasks[intent.index];
          try {
            // Delete task via backend API
            await deleteTask(taskToDelete.id);

            // Refresh tasks after deletion to get the updated list
            await fetchTasks();

            setMessages(prev => [...prev, { role: "bot", text: `Deleted! ✨ Removed **${taskToDelete.title}** from your list.` }]);
          } catch (err) {
            console.error("Error deleting task:", err);
            setMessages(prev => [...prev, { role: "bot", text: "❌ Failed to delete task. Please try again." }]);
          }
          break;

        case 'deleteByText':
          if (!intent.text) {
            setMessages(prev => [...prev, { role: "bot", text: "❌ Please provide a task to delete." }]);
            return;
          }
          const idx = tasks.findIndex(t => t.title.toLowerCase().includes(intent.text.toLowerCase())); // Use 'title' instead of 'text'
          if (idx === -1) {
            setMessages(prev => [...prev, { role: "bot", text: "🤔 I couldn't find a matching task. Try listing your tasks first!" }]);
            return;
          }
          const taskToDeleteByText = tasks[idx];
          try {
            // Delete task via backend API
            await deleteTask(taskToDeleteByText.id);

            // Refresh tasks after deletion to get the updated list
            await fetchTasks();

            setMessages(prev => [...prev, { role: "bot", text: `Deleted! ✨ Removed **${taskToDeleteByText.title}** from your list.` }]); // Use 'title' instead of 'text'
          } catch (err) {
            console.error("Error deleting task by text:", err);
            setMessages(prev => [...prev, { role: "bot", text: "❌ Failed to delete task. Please try again." }]);
          }
          break;

        case 'deleteAll':
          if (tasks.length === 0) {
            setMessages(prev => [...prev, { role: "bot", text: "Your list is already empty! 😄" }]);
            return;
          }
          try {
            // Delete all tasks via backend API
            await Promise.all(tasks.map(task => deleteTask(task.id)));

            // Refresh tasks after bulk deletion
            await fetchTasks();

            setMessages(prev => [...prev, { role: "bot", text: `🗑️ Cleared all ${tasks.length} task(s). Fresh start!` }]);
          } catch (err) {
            console.error("Error deleting all tasks:", err);
            setMessages(prev => [...prev, { role: "bot", text: "❌ Failed to delete some tasks. Please try again." }]);
          }
          break;

        case 'complete':
          if (intent.index === undefined || intent.index < 0 || intent.index >= tasks.length) {
            setMessages(prev => [...prev, { role: "bot", text: "❌ That task number doesn't exist!" }]);
            return;
          }
          if (tasks[intent.index].completed) {
            setMessages(prev => [...prev, { role: "bot", text: "✅ That one is already done!" }]);
            return;
          }
          const taskToComplete = tasks[intent.index];
          try {
            // Update task via backend API to mark as completed
            await updateTask(taskToComplete.id, { completed: true });

            // Refresh tasks after update to ensure UI is synced with backend
            await fetchTasks();

            // Generate response with the completed task
            setMessages(prev => [...prev, { role: "bot", text: `🎉 Marked as done: **${taskToComplete.title}**` }]); // Use 'title' instead of 'text'
          } catch (err) {
            console.error("Error updating task:", err);
            setMessages(prev => [...prev, { role: "bot", text: "❌ Failed to update task. Please try again." }]);
          }
          break;

        case 'completeByText':
          if (!intent.text) {
            setMessages(prev => [...prev, { role: "bot", text: "❌ Please provide a task to complete." }]);
            return;
          }
          const completeIdx = tasks.findIndex(t => t.title.toLowerCase().includes(intent.text.toLowerCase()) && !t.completed); // Use 'title' instead of 'text'
          if (completeIdx === -1) {
            setMessages(prev => [...prev, { role: "bot", text: "🤔 Couldn't find a pending task matching that. Check your list!" }]);
            return;
          }
          const taskToCompleteByText = tasks[completeIdx];
          try {
            // Update task via backend API to mark as completed
            await updateTask(taskToCompleteByText.id, { completed: true });

            // Refresh tasks after update to ensure UI is synced with backend
            await fetchTasks();

            setMessages(prev => [...prev, { role: "bot", text: `🎉 Marked as done: **${taskToCompleteByText.title}**` }]); // Use 'title' instead of 'text'
          } catch (err) {
            console.error("Error completing task by text:", err);
            setMessages(prev => [...prev, { role: "bot", text: "❌ Failed to update task. Please try again." }]);
          }
          break;

        case 'completeAll':
          if (tasks.length === 0) {
            setMessages(prev => [...prev, { role: "bot", text: "No tasks to complete! Add some first 😄" }]);
            return;
          }
          try {
            // Update all tasks to completed via backend API
            await Promise.all(
              tasks.map(task => updateTask(task.id, { completed: true }))
            );

            // Refresh tasks after bulk update
            await fetchTasks();

            setMessages(prev => [...prev, { role: "bot", text: `🎊 All ${tasks.length} task(s) marked as done! Amazing!` }]);
          } catch (err) {
            console.error("Error completing all tasks:", err);
            setMessages(prev => [...prev, { role: "bot", text: "❌ Failed to update some tasks. Please try again." }]);
          }
          break;

        case 'undo':
          if (intent.index === undefined || intent.index < 0 || intent.index >= tasks.length) {
            setMessages(prev => [...prev, { role: "bot", text: "❌ That task number doesn't exist!" }]);
            return;
          }
          const taskToUndo = tasks[intent.index];
          try {
            // Update task via backend API to mark as incomplete
            await updateTask(taskToUndo.id, { completed: false });

            // Refresh tasks after update to ensure UI is synced with backend
            await fetchTasks();

            setMessages(prev => [...prev, { role: "bot", text: `↩️ Reopened: **${taskToUndo.title}**` }]); // Use 'title' instead of 'text'
          } catch (err) {
            console.error("Error undoing task:", err);
            setMessages(prev => [...prev, { role: "bot", text: "❌ Failed to update task. Please try again." }]);
          }
          break;

        default:
          const response = generateResponse(intent, tasks, trimmed);
          setMessages(prev => [...prev, { role: "bot", text: response }]);
      }
    }, 400);
  };

  const pending = tasks.filter(t => !t.completed).length;
  const done = tasks.filter(t => t.completed).length;

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center flex-1 p-4">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
            <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-6">Please log in to access the todo chat assistant.</p>
            <a
              href="/login"
              className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "var(--color-background)" }}>
      <Header />
      <div style={{ display: "flex", height: "calc(100vh - 64px)", background: "var(--color-background)", color: "var(--color-text)", fontFamily: "var(--font-family)", overflow: "hidden" }}>
        {/* LEFT: Chat Panel */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: "1px solid var(--color-border)", minWidth: 0 }}>
          {/* Header with toggle button on mobile */}
          <div style={{ padding: "var(--spacing-md) var(--spacing-lg)", background: "var(--color-background-secondary)", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: "var(--spacing-sm)", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)" }}>
              <div style={{ width: 38, height: 38, borderRadius: "var(--radius-md)", background: "linear-gradient(135deg,var(--color-primary),var(--color-primary-hover))", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Sparkles size={20} color="#fff" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "var(--font-size-base)", color: "var(--color-text)" }}>Todo Assistant</div>
                <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-primary)" }}>● Online — Ready to help</div>
              </div>
            </div>

            {/* Toggle button for mobile */}
            <button
              onClick={() => setIsTodoPanelOpen(true)}
              className="mobile-todo-toggle bg-indigo-600 text-white px-3 py-1 rounded-md text-sm font-medium"
              style={{
                display: "none",
              }}
            >
              Tasks ({tasks.length})
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "var(--spacing-md)", display: "flex", flexDirection: "column" }}>
            {messages.map((m, i) => <MessageBubble key={i} msg={m} />)}
            <div ref={chatEnd} />
          </div>

          {/* Input */}
          <div style={{ padding: "var(--spacing-sm) var(--spacing-md)", borderTop: "1px solid var(--color-border)", background: "var(--color-background-secondary)" }}>
            <div style={{ display: "flex", gap: "var(--spacing-xs)", alignItems: "center", background: "var(--color-background)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", padding: "var(--spacing-xs) var(--spacing-sm)", transition: "border-color 0.2s" }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
                placeholder="Type a task or command..."
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--color-text)", fontSize: "var(--font-size-sm)", minWidth: 0 }}
              />
              <button
                onClick={handleSend}
                style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: input.trim() ? "linear-gradient(135deg,var(--color-primary),var(--color-primary-hover))" : "var(--color-background)", border: "1px solid var(--color-border)", cursor: input.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
              >
                <Send size={18} color={input.trim() ? "#fff" : "var(--color-text-secondary)"} />
              </button>
            </div>
            <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)", marginTop: "var(--spacing-xs)", textAlign: "center" }}>
              Try: &quot;Add buy milk&quot; • &quot;Complete 1&quot; • &quot;Delete 2&quot; • &quot;help&quot;
            </div>
          </div>
        </div>

        {/* RIGHT: Todo List Panel - Fixed for mobile, static for desktop */}
        <div
          className={`todo-panel-overlay fixed top-0 right-0 h-full max-w-xs bg-gray-50 z-50 transform transition-transform duration-300 overflow-y-auto ${
            isTodoPanelOpen ? 'todo-panel-open translate-x-0' : 'translate-x-full'
          } border-l md:static md:translate-x-0 md:h-auto md:max-w-none md:border-l md:overflow-y-auto`}
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            height: "100vh",
            width: "100%",
            maxWidth: 340,
            background: "var(--color-background-secondary)",
            zIndex: 1000,
            transform: isTodoPanelOpen ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.3s ease-in-out",
            boxShadow: isTodoPanelOpen ? "var(--shadow-lg)" : "none",
            overflowY: "auto",
            display: "none",
          }}
        >
          {/* Overlay Header with Close Button - Mobile only */}
          <div className="mobile-overlay-header" style={{
            padding: "var(--spacing-md) var(--spacing-lg)",
            background: "var(--color-background-secondary)",
            borderBottom: "1px solid var(--color-border)",
            display: "none",
          }}>
            <div style={{ fontWeight: 700, fontSize: "var(--font-size-xl)", color: "var(--color-text)" }}>📝 My Todos</div>
            <button
              onClick={() => setIsTodoPanelOpen(false)}
              style={{
                background: "none",
                border: "none",
                fontSize: "var(--font-size-xl)",
                color: "var(--color-text)",
                cursor: "pointer",
                padding: "var(--spacing-xs)",
                borderRadius: "var(--radius-sm)",
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ×
            </button>
          </div>

          {/* Stats Header */}
          <div style={{ padding: "var(--spacing-lg) var(--spacing-lg) var(--spacing-md)" }}>
            <div style={{ fontSize: "var(--font-size-xl)", fontWeight: 700, color: "var(--color-text)", marginBottom: "var(--spacing-md)" }}>📝 My Todos</div>
            <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
              <div style={{ flex: 1, background: "var(--color-background)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "var(--spacing-sm)", textAlign: "center" }}>
                <div style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, color: "var(--color-primary)" }}>{tasks.length}</div>
                <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>Total</div>
              </div>
              <div style={{ flex: 1, background: "var(--color-background)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "var(--spacing-sm)", textAlign: "center" }}>
                <div style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, color: "var(--color-primary)" }}>{pending}</div>
                <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>Pending</div>
              </div>
              <div style={{ flex: 1, background: "var(--color-background)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "var(--spacing-sm)", textAlign: "center" }}>
                <div style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, color: "var(--color-success)" }}>{done}</div>
                <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>Done</div>
              </div>
            </div>
            {/* Progress bar */}
            {tasks.length > 0 && (
              <div style={{ marginTop: "var(--spacing-md)", height: 4, background: "var(--color-background)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(done / tasks.length) * 100}%`, background: "linear-gradient(90deg,var(--color-primary),var(--color-success))", borderRadius: 2, transition: "width 0.4s ease" }} />
              </div>
            )}
          </div>

          {/* Task Items */}
          <div style={{ flex: 1, overflowY: "auto", padding: "0 var(--spacing-md) var(--spacing-md)" }}>
            {tasks.length === 0 ? (
              <div style={{ textAlign: "center", padding: "var(--spacing-xl) var(--spacing-md)", color: "var(--color-text-secondary)" }}>
                <div style={{ fontSize: 40, marginBottom: "var(--spacing-sm)" }}>📋</div>
                <div style={{ fontSize: "var(--font-size-sm)" }}>No tasks yet.<br />Chat to add some!</div>
              </div>
            ) : (
              tasks.map((task, i) => (
                <div key={task.id} style={{
                  display: "flex", alignItems: "center", gap: "var(--spacing-sm)", padding: "var(--spacing-sm)", marginBottom: "var(--spacing-xs)",
                  background: task.completed ? "var(--color-success-light)" : "var(--color-background)",
                  border: `1px solid ${task.completed ? 'var(--color-success)' : 'var(--color-border)'}`,
                  borderRadius: "var(--radius-md)", transition: "all 0.25s", cursor: "pointer",
                }}
                  onClick={async () => {
                    try {
                      // Use the updateTask function from the hook to toggle completion
                      const updatedTask = await updateTask(task.id, { completed: !task.completed });
                      // The tasks list will automatically update via the hook's state management
                    } catch (err) {
                      console.error('Failed to toggle task:', err);
                    }
                  }}
                >
                  <div style={{ flexShrink: 0 }}>
                    {task.completed
                      ? <CheckCircle2 size={20} color="var(--color-success)" />
                      : <Circle size={20} color="var(--color-primary)" />
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "var(--font-size-sm)", color: task.completed ? "var(--color-text-secondary)" : "var(--color-text)", textDecoration: task.completed ? "line-through" : "none", transition: "all 0.2s", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{task.title}</div>
                    <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>#{i + 1}</div>
                  </div>
                  <button onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      // Use the deleteTask function from the hook
                      await deleteTask(task.id);
                      // Refresh tasks after deletion
                      await fetchTasks();
                      setMessages(prev => [...prev, { role: "bot", text: `🗑️ Deleted **${task.title}**` }]);
                    } catch (err) {
                      console.error('Failed to delete task:', err);
                    }
                  }}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: "var(--spacing-xs)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.5, transition: "opacity 0.2s" }}
                    onMouseEnter={e => { if (e.currentTarget) e.currentTarget.style.opacity = "1"; }}
                    onMouseLeave={e => { if (e.currentTarget) e.currentTarget.style.opacity = "0.5"; }}
                  >
                    <Trash2 size={14} color="var(--color-error)" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Mobile overlay backdrop */}
      {isTodoPanelOpen && (
        <div
          className="overlay-backdrop fixed inset-0 bg-black bg-opacity-50 z-40"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
            display: "none",
          }}
          onClick={() => setIsTodoPanelOpen(false)}
        />
      )}
    </div>
  );
}

export default function ChatPage() {
  return <TodoChatApp />;
}