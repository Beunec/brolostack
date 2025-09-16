import React, { useState } from 'react';
import { SimpleBrolostackProvider, useSimpleBrolostackStore, useSimpleBrolostackState } from './SimpleBrolostackProvider';
import './App.css';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

interface TodoState {
  todos: Todo[];
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  clearCompleted: () => void;
}

function TodoApp() {
  const todoStore = useSimpleBrolostackStore('todos');
  const todos = useSimpleBrolostackState<TodoState>('todos', state => state.todos);
  const [newTodo, setNewTodo] = useState('');

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      todoStore.addTodo(newTodo.trim());
      setNewTodo('');
    }
  };

  const completedCount = todos.filter((todo: any) => todo.completed).length;
  const totalCount = todos.length;

  return (
    <div className="app">
      <header className="app-header">
        <h1>🚀 Brolostack Todo App</h1>
        <p>Zero-cost, browser-local storage powered by Brolostack</p>
      </header>

      <main className="app-main">
        <form onSubmit={handleAddTodo} className="todo-form">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new todo..."
            className="todo-input"
          />
          <button type="submit" className="add-button">
            Add Todo
          </button>
        </form>

        <div className="todo-stats">
          <span>{totalCount} total</span>
          <span>{completedCount} completed</span>
          <span>{totalCount - completedCount} remaining</span>
        </div>

        <div className="todo-list">
          {todos.length === 0 ? (
            <p className="empty-state">No todos yet. Add one above!</p>
          ) : (
            todos.map((todo: any) => (
              <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => todoStore.toggleTodo(todo.id)}
                  className="todo-checkbox"
                />
                <span className="todo-text">{todo.text}</span>
                <button
                  onClick={() => todoStore.deleteTodo(todo.id)}
                  className="delete-button"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>

        {completedCount > 0 && (
          <button
            onClick={() => todoStore.clearCompleted()}
            className="clear-button"
          >
            Clear Completed ({completedCount})
          </button>
        )}
      </main>

      <footer className="app-footer">
        <p>Built with ❤️ using Brolostack Framework</p>
        <p>Data stored locally in your browser - no servers required!</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <SimpleBrolostackProvider appName="personal-todo-app">
      <TodoApp />
    </SimpleBrolostackProvider>
  );
}

export default App;
