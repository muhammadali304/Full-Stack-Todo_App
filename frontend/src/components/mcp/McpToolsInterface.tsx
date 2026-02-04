/**
 * MCP Tools Interface Component
 *
 * This component provides a user interface for interacting with MCP task tools.
 * It allows users to manage their tasks through the MCP protocol.
 */

import React, { useState } from 'react';

interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

interface McpToolsInterfaceProps {
  onAddTask: (title: string, description?: string) => Promise<void>;
  onListTasks: (completed?: boolean) => Promise<Task[]>;
  onCompleteTask: (taskId: string) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
}

export const McpToolsInterface: React.FC<McpToolsInterfaceProps> = ({
  onAddTask,
  onListTasks,
  onCompleteTask,
  onDeleteTask,
  onUpdateTask
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskId, setTaskId] = useState('');
  const [taskUpdates, setTaskUpdates] = useState<Partial<Task>>({});
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!title.trim()) {
        throw new Error('Title is required');
      }

      await onAddTask(title, description);
      setTitle('');
      setDescription('');

      // Refresh the task list after adding
      const updatedTasks = await onListTasks();
      setTasks(updatedTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add task');
    } finally {
      setLoading(false);
    }
  };

  const handleListTasks = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const tasks = await onListTasks();
      setTasks(tasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to list tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!taskId) {
        throw new Error('Task ID is required');
      }

      await onCompleteTask(taskId);
      setTaskId('');

      // Refresh the task list after completing
      const updatedTasks = await onListTasks();
      setTasks(updatedTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete task');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!taskId) {
        throw new Error('Task ID is required');
      }

      await onDeleteTask(taskId);
      setTaskId('');

      // Refresh the task list after deletion
      const updatedTasks = await onListTasks();
      setTasks(updatedTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!taskId) {
        throw new Error('Task ID is required');
      }

      await onUpdateTask(taskId, taskUpdates);
      setTaskId('');
      setTaskUpdates({});

      // Refresh the task list after update
      const updatedTasks = await onListTasks();
      setTasks(updatedTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mcp-tools-interface" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>MCP Task Tools Interface</h2>

      {error && (
        <div style={{ color: 'red', marginBottom: '15px' }}>
          Error: {error}
        </div>
      )}

      {loading && (
        <div style={{ marginBottom: '15px' }}>
          Loading...
        </div>
      )}

      {/* Add Task Form */}
      <section style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h3>Add New Task</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              required
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description"
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              rows={3}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007acc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            Add Task via MCP
          </button>
        </form>
      </section>

      {/* List Tasks Form */}
      <section style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h3>List Tasks</h3>
        <form onSubmit={handleListTasks}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            List All Tasks via MCP
          </button>
        </form>

        {tasks.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h4>Tasks ({tasks.length})</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {tasks.map((task) => (
                <li key={task.id} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
                  <strong>{task.title}</strong>
                  {task.description && <p>{task.description}</p>}
                  <div>
                    Status: {task.completed ? 'Completed' : 'Pending'}
                    <br />
                    Created: {new Date(task.created_at).toLocaleString()}
                    <br />
                    ID: {task.id.substring(0, 8)}...
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Complete Task Form */}
      <section style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h3>Complete Task</h3>
        <form onSubmit={handleCompleteTask}>
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="complete-task-id">Task ID</label>
            <input
              id="complete-task-id"
              type="text"
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              placeholder="Task ID to complete"
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ffc107',
              color: 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            Complete Task via MCP
          </button>
        </form>
      </section>

      {/* Delete Task Form */}
      <section style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h3>Delete Task</h3>
        <form onSubmit={handleDeleteTask}>
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="delete-task-id">Task ID</label>
            <input
              id="delete-task-id"
              type="text"
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              placeholder="Task ID to delete"
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            Delete Task via MCP
          </button>
        </form>
      </section>

      {/* Update Task Form */}
      <section style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h3>Update Task</h3>
        <form onSubmit={handleUpdateTask}>
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="update-task-id">Task ID</label>
            <input
              id="update-task-id"
              type="text"
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              placeholder="Task ID to update"
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              required
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="update-title">New Title</label>
            <input
              id="update-title"
              type="text"
              value={taskUpdates.title || ''}
              onChange={(e) => setTaskUpdates({...taskUpdates, title: e.target.value})}
              placeholder="New title (leave empty to not change)"
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="update-description">New Description</label>
            <textarea
              id="update-description"
              value={taskUpdates.description || ''}
              onChange={(e) => setTaskUpdates({...taskUpdates, description: e.target.value})}
              placeholder="New description (leave empty to not change)"
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              rows={2}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>
              <input
                type="checkbox"
                checked={taskUpdates.completed === true}
                onChange={(e) => setTaskUpdates({...taskUpdates, completed: e.target.checked})}
                style={{ marginRight: '5px' }}
              />
              Mark as completed
            </label>
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            Update Task via MCP
          </button>
        </form>
      </section>
    </div>
  );
};