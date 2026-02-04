'use client'
import { useState, useRef, useEffect } from "react";
import { Send, Trash2, CheckCircle2, Circle, Bot, User, Sparkles } from "lucide-react";
import { Header } from '@/components/layout/Header';
import { useTasks } from '@/hooks/useTasks';
import { Task } from '@/lib/types';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

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
  if (/^(complete|done|finish|mark)\s+(?:all|every)/i.test(lower) || /mark all todos as done/i.test(lower)) return { action: "completeAll" };
  // Check for "Complete X" pattern (most common scenario)
  const simpleDoneMatch = lower.match(/(?:complete|done|finish|mark)\s+(\d+)/i);
  if (simpleDoneMatch) return { action: "complete", index: parseInt(simpleDoneMatch[1]) - 1 };
  // Check for more complex patterns like "complete the todo number 1"
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

function generateResponse(intent: any, tasks: Task[], originalInput: string = "") {
  switch (intent.action) {
    case "add": {
      const capitalized = intent.text.charAt(0).toUpperCase() + intent.text.slice(1);
      const phrases = ["Added to your list!", "Got it, added!", "Done! It's on your list.", "Sure thing, added!", "Added! You're on track 🎯"];
      return phrases[Math.floor(Math.random() * phrases.length)] + ` ➡️ **${capitalized}**`;
    }
    case "addFallback": {
      const capitalized = intent.text.charAt(0).toUpperCase() + intent.text.slice(1);
      return `I'll add that as a task for you! ✅ ➡️ **${capitalized}**`;
    }
    case "delete": {
      if (intent.index < 0 || intent.index >= tasks.length) return "❌ That task number doesn't exist. Check your list!";
      const removed = tasks[intent.index].title;
      return `Deleted! ✨ Removed **${removed}** from your list.`;
    }
    case "deleteByText": {
      const idx = tasks.findIndex(t => t.title.toLowerCase().includes(intent.text.toLowerCase()));
      if (idx === -1) return "🤔 I couldn't find a matching task. Try listing your tasks first!";
      const removed = tasks[idx].title;
      return `Deleted! ✨ Removed **${removed}** from your list.`;
    }
    case "deleteAll": {
      if (tasks.length === 0) return "Your list is already empty! 😄";
      return `🗑️ Cleared all ${tasks.length} task(s). Fresh start!`;
    }
    case "complete": {
      if (intent.index < 0 || intent.index >= tasks.length) return "❌ That task number doesn't exist!";
      if (tasks[intent.index].completed) return "✅ That one is already done!";
      return `🎉 Marked as done: **${tasks[intent.index].title}**`;
    }
    case "completeByText": {
      const idx = tasks.findIndex(t => t.title.toLowerCase().includes(intent.text.toLowerCase()) && !t.completed);
      if (idx === -1) return "🤔 Couldn't find a pending task matching that. Check your list!";
      return `🎉 Marked as done: **${tasks[idx].title}**`;
    }
    case "completeAll": {
      if (tasks.length === 0) return "No tasks to complete! Add some first 😄";
      return `🎊 All ${tasks.length} task(s) marked as done! Amazing!`;
    }
    case "undo": {
      if (intent.index < 0 || intent.index >= tasks.length) return "❌ That task number doesn't exist!";
      return `↩️ Reopened: **${tasks[intent.index].title}**`;
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
        if (/^(hi|hello|hey|good morning|good afternoon|good evening|greetings|sup)$/i.test(originalInput)) {
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

function MessageBubble({ msg }: { msg: Message }) {
  const isBot = msg.role === "bot";
  const lines = msg.text.split("\n");

  const renderText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((p, i) =>
      p.startsWith("**") && p.endsWith("**")
        ? <strong key={i} style={{ color: isBot ? "var(--color-primary)" : "#fff" }}>{p.slice(2, -2)}</strong>
        : <span key={i}>{p}</span>
    );
  };

  return (
    <div style={{ display: "flex", justifyContent: isBot ? "flex-start" : "flex-end", marginBottom: "var(--spacing-sm)", gap: "var(--spacing-xs)", alignItems: "flex-end" }}>
      {isBot && (
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Bot size={16} color="#fff" />
        </div>
      )}
      <div style={{
        maxWidth: "75%",
        background: isBot ? "var(--color-background-secondary)" : "var(--color-primary)",
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
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <User size={16} color="#fff" />
        </div>
      )}
    </div>
  );
}

function TodoChatApp() {
  const { tasks, loading, error, fetchTasks, createTask, updateTask, deleteTask, toggleTask } = useTasks();
  const [messages, setMessages] = useState<Message[]>([{ role: "bot", text: greetings[0] }]);
  const [input, setInput] = useState<string>("");
  const [showTodos, setShowTodos] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const chatEnd = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  // Load existing tasks when component mounts
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Track if this is the initial render
  const initialRender = useRef(true);

  // Use ref to store previous message count to detect new additions
  const prevMessageCountRef = useRef(0);

  useEffect(() => {
    // Initialize the previous message count on first render
    if (prevMessageCountRef.current === 0) {
      prevMessageCountRef.current = messages.length;
    } else {
      // Only scroll when a new message has been added (not on initial load)
      if (messages.length > prevMessageCountRef.current) {
        // Scroll the messages container to the bottom to show the latest message
        setTimeout(() => {
          if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
          }
        }, 0);
      }

      // Update the previous message count
      prevMessageCountRef.current = messages.length;
    }

    // Check if we're on mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const userMsg = { role: "user", text: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    setTimeout(async () => {
      const intent = parseUserIntent(trimmed);

      // Handle task creation/deletion/updating based on intent
      if (intent.action === "add" || intent.action === "addFallback") {
        if (intent.text) {
          try {
            const capitalized = intent.text.charAt(0).toUpperCase() + intent.text.slice(1);
            await createTask({ title: capitalized, description: "", completed: false });
            // Refresh tasks after creation
            await fetchTasks();
          } catch (error) {
            console.error("Error creating task:", error);
            setMessages(prev => [...prev, { role: "bot", text: "❌ Failed to add task. Please try again." }]);
            return;
          }
        }
      } else if (intent.action === "delete" || intent.action === "deleteAll") {
        try {
          if (intent.action === "delete" && intent.index !== undefined) {
            if (intent.index < 0 || intent.index >= tasks.length) {
              setMessages(prev => [...prev, { role: "bot", text: "❌ That task number doesn't exist. Check your list!" }]);
              return;
            }
            const taskToDelete = tasks[intent.index];
            await deleteTask(taskToDelete.id);
          } else if (intent.action === "deleteAll") {
            await Promise.all(tasks.map(task => deleteTask(task.id)));
          }
          // Refresh tasks after deletion
          await fetchTasks();
        } catch (error) {
          console.error("Error deleting task:", error);
          setMessages(prev => [...prev, { role: "bot", text: "❌ Failed to delete task. Please try again." }]);
          return;
        }
      } else if (intent.action === "complete" || intent.action === "completeAll") {
        try {
          if (intent.action === "complete" && intent.index !== undefined) {
            // Check if index is valid (0-based index)
            if (intent.index < 0 || intent.index >= tasks.length) {
              setMessages(prev => [...prev, { role: "bot", text: "❌ That task number doesn't exist!" }]);
              return;
            }
            const taskToComplete = tasks[intent.index];
            if (taskToComplete) {
              console.log(`Completing task: ID=${taskToComplete.id}, Title="${taskToComplete.title}", Index=${intent.index}`);
              // Update the specific task to completed - this should make a backend API call
              const updatedTask = await updateTask(taskToComplete.id, { completed: true });
              console.log(`Task completed successfully: ID=${updatedTask.id}, Completed=${updatedTask.completed}`);
            } else {
              setMessages(prev => [...prev, { role: "bot", text: "❌ That task number doesn't exist!" }]);
              return;
            }
          } else if (intent.action === "completeAll") {
            if (tasks.length === 0) {
              // Just generate response for empty list
              const response = generateResponse(intent, tasks, trimmed);
              setMessages(prev => [...prev, { role: "bot", text: response }]);
              return;
            }
            console.log(`Completing all ${tasks.length} tasks`);
            // Complete all tasks
            const results = await Promise.all(tasks.map(async (task) => {
              console.log(`Completing task: ID=${task.id}, Title="${task.title}"`);
              return updateTask(task.id, { completed: true });
            }));
            console.log(`Successfully completed ${results.length} tasks`);
          }
          // Refresh tasks after update to reflect changes
          console.log('Refreshing tasks after completion...');
          await fetchTasks();
          console.log('Tasks refreshed successfully');
        } catch (error) {
          console.error("Error updating task:", error);
          setMessages(prev => [...prev, { role: "bot", text: "❌ Failed to update task. Please try again." }]);
          return;
        }
      } else if (intent.action === "undo") {
        try {
          if (intent.index !== undefined) {
            if (intent.index < 0 || intent.index >= tasks.length) {
              setMessages(prev => [...prev, { role: "bot", text: "❌ That task number doesn't exist!" }]);
              return;
            }
            const taskToUndo = tasks[intent.index];
            await updateTask(taskToUndo.id, { completed: false });
            // Refresh tasks after update
            await fetchTasks();
          }
        } catch (error) {
          console.error("Error updating task:", error);
          setMessages(prev => [...prev, { role: "bot", text: "❌ Failed to update task. Please try again." }]);
          return;
        }
      } else if (intent.action === "completeByText" || intent.action === "deleteByText") {
        try {
          if (intent.text) {
            if (intent.action === "completeByText") {
              const taskToComplete = tasks.find(t => t.title.toLowerCase().includes(intent.text.toLowerCase()) && !t.completed);
              if (taskToComplete) {
                await updateTask(taskToComplete.id, { completed: true });
              } else {
                setMessages(prev => [...prev, { role: "bot", text: "🤔 Couldn't find a pending task matching that. Check your list!" }]);
                return;
              }
            } else if (intent.action === "deleteByText") {
              const taskToDelete = tasks.find(t => t.title.toLowerCase().includes(intent.text.toLowerCase()));
              if (taskToDelete) {
                await deleteTask(taskToDelete.id);
              } else {
                setMessages(prev => [...prev, { role: "bot", text: "🤔 I couldn't find a matching task. Try listing your tasks first!" }]);
                return;
              }
            }
            // Refresh tasks after update
            await fetchTasks();
          }
        } catch (error) {
          console.error("Error processing task:", error);
          setMessages(prev => [...prev, { role: "bot", text: "❌ Failed to process task. Please try again." }]);
          return;
        }
      }

      // Wait briefly to ensure all API operations complete before generating response
      await new Promise(resolve => setTimeout(resolve, 100));

      // Generate and display response based on the intent (operation completed successfully)
      // Using the current tasks state which should be updated after API calls
      const response = generateResponse(intent, tasks, trimmed);
      setMessages(prev => [...prev, { role: "bot", text: response }]);
    }, 400);
  };

  const pending = tasks.filter(t => !t.completed).length;
  const done = tasks.filter(t => t.completed).length;

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "var(--color-background)"}}>
      <Header />
      <div style={{ display: "flex", height: "calc(100vh - 64px)", background: "var(--color-background)", color: "var(--color-text)", fontFamily: "var(--font-family)", overflow: "hidden", position: "relative" }}>
        {/* LEFT: Chat Panel */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: "1px solid var(--color-border)", minWidth: 0, width: "100%" }}>
          {/* Custom Header Section with padding */}
          <div style={{ padding: "var(--spacing-lg) var(--spacing-md) var(--spacing-md) var(--spacing-md)", background: "var(--color-background)", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)" }}>
              <div style={{ width: 38, height: 38, borderRadius: "var(--radius-md)", background: "linear-gradient(135deg,var(--color-primary),var(--color-primary-hover))", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Sparkles size={20} color="#fff" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "var(--font-size-base)", color: "var(--color-text)" }}>Todo Assistant</div>
                <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-primary)" }}>● Online — Ready to help</div>
              </div>
            </div>
            <button
              onClick={() => setShowTodos(!showTodos)}
              style={{
                background: "var(--color-primary)",
                border: "none",
                borderRadius: "var(--radius-md)",
                padding: "var(--spacing-xs) var(--spacing-md)",
                color: "#fff",
                fontSize: "var(--font-size-sm)",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "var(--spacing-xs)"
              }}
            >
              📋 Tasks ({tasks.length})
            </button>
          </div>

        {/* Messages */}
        <div ref={messagesContainerRef} style={{ flex: 1, overflowY: "auto", padding: "var(--spacing-md) var(--spacing-lg)", display: "flex", flexDirection: "column" }}>
          {messages.map((m, i) => <MessageBubble key={i} msg={m} />)}
          <div ref={chatEnd} />
        </div>

        {/* Input */}
        <div style={{ padding: "var(--spacing-sm) var(--spacing-md)", borderTop: "1px solid var(--color-border)", background: "var(--color-background-secondary)" }}>
          <div style={{ display: "flex", gap: "var(--spacing-xs)", alignItems: "center", background: "var(--color-background)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", padding: "var(--spacing-xs) var(--spacing-xs) var(--spacing-xs) var(--spacing-md)", transition: "border-color var(--transition-fast)" }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder="Type a task or command..."
              style={{ flex: 1, background: "var(--color-background)", border: "none", outline: "none", color: "var(--color-text)", fontSize: "var(--font-size-base)", minWidth: 0 }}
            />
            <button
              onClick={handleSend}
              style={{
                width: 40,
                height: 40,
                borderRadius: "var(--radius-md)",
                background: input.trim() ? "var(--color-primary)" : "var(--color-background)",
                border: "1px solid var(--color-border)",
                cursor: input.trim() ? "pointer" : "default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all var(--transition-fast)"
              }}
            >
              <Send size={18} color={input.trim() ? "#fff" : "var(--color-text-secondary)"} />
            </button>
          </div>
          <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", marginTop: "var(--spacing-xs)", textAlign: "center" }}>
            Try: &quot;Add buy milk&quot; • &quot;Complete 1&quot; • &quot;Delete 2&quot; • &quot;help&quot;
          </div>
        </div>
      </div>

      {/* RIGHT: Task List Panel - Sidebar on desktop, overlay on mobile */}
      <div style={{
        width: showTodos || !isMobile ? 340 : 0,
        display: "flex",
        flexDirection: "column",
        background: "var(--color-background)",
        minWidth: showTodos || !isMobile ? 340 : 0,
        position: isMobile ? "fixed" : "relative",
        right: 0,
        top: 0,
        height: "100vh",
        zIndex: 1000,
        transition: "transform var(--transition-slow)",
        transform: isMobile ? (showTodos ? "translateX(0)" : "translateX(100%)") : "none",
        boxShadow: isMobile && showTodos ? "-4px 0 20px rgba(0,0,0,0.1)" : "none"
      }}>
        {/* Close button for mobile */}
        {isMobile && showTodos && (
          <button
            onClick={() => setShowTodos(false)}
            style={{
              position: "absolute",
              top: "var(--spacing-md)",
              right: "var(--spacing-md)",
              background: "var(--color-error)",
              border: "none",
              borderRadius: "var(--radius-md)",
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 1001,
              boxShadow: "var(--shadow-md)"
            }}
          >
            <span style={{ color: "white", fontSize: 20, fontWeight: 700 }}>×</span>
          </button>
        )}
        {/* Stats Header */}
        <div style={{ padding: "var(--spacing-lg) var(--spacing-md) var(--spacing-sm)", background: "var(--color-background-secondary)" }}>
          <div style={{ fontSize: "var(--font-size-xl)", fontWeight: 700, color: "var(--color-text)", marginBottom: "var(--spacing-sm)" }}>📝 My Tasks</div>
          <div style={{ display: "flex", gap: "var(--spacing-xs)" }}>
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
            <div style={{ marginTop: "var(--spacing-sm)", height: 6, background: "var(--color-background)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(done / tasks.length) * 100}%`, background: "var(--color-success)", borderRadius: 3, transition: "width var(--transition-slow)" }} />
            </div>
          )}
        </div>

        {/* Task Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "var(--spacing-sm) var(--spacing-md) var(--spacing-md)" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "var(--spacing-2xl) var(--spacing-md)", color: "var(--color-text-secondary)" }}>
              <div style={{ fontSize: 40, marginBottom: "var(--spacing-md)" }}>⏳</div>
              <div style={{ fontSize: "var(--font-size-base)" }}>Loading tasks...</div>
            </div>
          ) : tasks.length === 0 ? (
            <div style={{ textAlign: "center", padding: "var(--spacing-2xl) var(--spacing-md)", color: "var(--color-text-secondary)" }}>
              <div style={{ fontSize: 40, marginBottom: "var(--spacing-md)" }}>📋</div>
              <div style={{ fontSize: "var(--font-size-base)" }}>No tasks yet.<br />Chat to add some!</div>
            </div>
          ) : (
            tasks.map((task, i) => (
              <div key={task.id}
                onClick={() => {
                  toggleTask(task.id);
                }}
                style={{
                  display: "flex", alignItems: "center", gap: "var(--spacing-sm)", padding: "var(--spacing-sm)", marginBottom: "var(--spacing-xs)",
                  background: task.completed ? "var(--color-background-secondary)" : "var(--color-background)",
                  border: task.completed ? "1px solid var(--color-success-light)" : "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)", transition: "all var(--transition-fast)", cursor: "pointer",
                }}
              >
                <div style={{ flexShrink: 0 }}>
                  {task.completed
                    ? <CheckCircle2 size={20} color="var(--color-success)" />
                    : <Circle size={20} color="var(--color-primary)" />
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text)", textDecoration: task.completed ? "line-through" : "none", transition: "all var(--transition-fast)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{task.title}</div>
                  <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>#{i + 1}</div>
                </div>
                <button onClick={e => {
                  e.stopPropagation();
                  deleteTask(task.id);
                  setMessages(prev => [...prev, { role: "bot", text: `🗑️ Deleted **${task.title}**` }]);
                }}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: "var(--spacing-xs)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.5, transition: "opacity var(--transition-fast)" }}
                >
                  <Trash2 size={16} color="var(--color-error)" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
    </div>
  );
}

export default function ChatPage() {
  return <TodoChatApp />;
}