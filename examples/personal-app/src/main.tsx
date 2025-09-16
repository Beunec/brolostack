import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// @ts-ignore
import { Brolostack as SimpleBrolostack } from '../../src/core/Brolostack';

// Initialize Brolostack and create the todo store
const app = new SimpleBrolostack({
  appName: 'personal-todo-app',
  version: '1.0.0',
  debug: true
});

// Initialize the app
app.initialize().then(() => {
  // Create the todo store
  const todoStore = app.createStore('todos', {
    todos: [],
    addTodo: (text: string) => {
      const newTodo = {
        id: Date.now().toString(),
        text,
        completed: false,
        createdAt: Date.now()
      };
      
      const currentState = todoStore.getState();
      todoStore.setState({
        ...currentState,
        todos: [...currentState.todos, newTodo]
      });
    },
    toggleTodo: (id: string) => {
      const currentState = todoStore.getState();
      todoStore.setState({
        ...currentState,
        todos: currentState.todos.map((todo: any) =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        )
      });
    },
    deleteTodo: (id: string) => {
      const currentState = todoStore.getState();
      todoStore.setState({
        ...currentState,
        todos: currentState.todos.filter((todo: any) => todo.id !== id)
      });
    },
    clearCompleted: () => {
      const currentState = todoStore.getState();
      todoStore.setState({
        ...currentState,
        todos: currentState.todos.filter((todo: any) => !todo.completed)
      });
    }
  });

  // Persist the store
  todoStore.persist({
    name: 'todos-storage',
    partialize: (state: any) => ({
      todos: state.todos
    })
  });

  // Render the React app
  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  );
  
  root.render(<App />);
}).catch((error: any) => {
  console.error('Failed to initialize Brolostack:', error);
});
