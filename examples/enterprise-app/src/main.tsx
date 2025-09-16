import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// @ts-ignore
import { Brolostack } from '../../src/core/Brolostack';

// Initialize Brolostack for enterprise app
const app = new Brolostack({
  appName: 'enterprise-pm-app',
  version: '1.0.0',
  debug: true,
  maxStorageSize: 500 // 500MB for enterprise data
});

// Initialize the app
app.initialize().then(() => {
  // Create the project management store
  const projectStore = app.createStore('projects', {
    projects: [],
    teamMembers: [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@company.com',
        role: 'admin',
        isActive: true
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@company.com',
        role: 'manager',
        isActive: true
      },
      {
        id: '3',
        name: 'Bob Johnson',
        email: 'bob@company.com',
        role: 'developer',
        isActive: true
      }
    ],
    currentProject: undefined,
    
    addProject: (projectData: any) => {
      const newProject = {
        ...projectData,
        id: Date.now().toString(),
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      const currentState = projectStore.getState();
      projectStore.setState({
        ...currentState,
        projects: [...currentState.projects, newProject]
      });
    },
    
    updateProject: (id: any, updates: any) => {
      const currentState = projectStore.getState();
      projectStore.setState({
        ...currentState,
        projects: currentState.projects.map((project: any) =>
          project.id === id 
            ? { ...project, ...updates, updatedAt: Date.now() }
            : project
        )
      });
    },
    
    deleteProject: (id: any) => {
      const currentState = projectStore.getState();
      projectStore.setState({
        ...currentState,
        projects: currentState.projects.filter((project: any) => project.id !== id),
        currentProject: currentState.currentProject?.id === id ? undefined : currentState.currentProject
      });
    },
    
    setCurrentProject: (project: any) => {
      const currentState = projectStore.getState();
      projectStore.setState({
        ...currentState,
        currentProject: project
      });
    },
    
    addTask: (projectId: any, taskData: any) => {
      const newTask = {
        ...taskData,
        id: Date.now().toString(),
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      const currentState = projectStore.getState();
      projectStore.setState({
        ...currentState,
        projects: currentState.projects.map((project: any) =>
          project.id === projectId
            ? { ...project, tasks: [...project.tasks, newTask], updatedAt: Date.now() }
            : project
        )
      });
    },
    
    updateTask: (projectId: any, taskId: any, updates: any) => {
      const currentState = projectStore.getState();
      projectStore.setState({
        ...currentState,
        projects: currentState.projects.map((project: any) =>
          project.id === projectId
            ? {
                ...project,
                tasks: project.tasks.map((task: any) =>
                  task.id === taskId
                    ? { ...task, ...updates, updatedAt: Date.now() }
                    : task
                ),
                updatedAt: Date.now()
              }
            : project
        )
      });
    },
    
    deleteTask: (projectId: any, taskId: any) => {
      const currentState = projectStore.getState();
      projectStore.setState({
        ...currentState,
        projects: currentState.projects.map((project: any) =>
          project.id === projectId
            ? {
                ...project,
                tasks: project.tasks.filter((task: any) => task.id !== taskId),
                updatedAt: Date.now()
              }
            : project
        )
      });
    },
    
    addTeamMember: (memberData: any) => {
      const newMember = {
        ...memberData,
        id: Date.now().toString()
      };
      
      const currentState = projectStore.getState();
      projectStore.setState({
        ...currentState,
        teamMembers: [...currentState.teamMembers, newMember]
      });
    },
    
    updateTeamMember: (id: any, updates: any) => {
      const currentState = projectStore.getState();
      projectStore.setState({
        ...currentState,
        teamMembers: currentState.teamMembers.map((member: any) =>
          member.id === id ? { ...member, ...updates } : member
        )
      });
    },
    
    removeTeamMember: (id: any) => {
      const currentState = projectStore.getState();
      projectStore.setState({
        ...currentState,
        teamMembers: currentState.teamMembers.filter((member: any) => member.id !== id)
      });
    }
  });

  // Persist the store
  projectStore.persist({
    name: 'enterprise-projects-storage',
    partialize: (state: any) => ({
      projects: state.projects,
      teamMembers: state.teamMembers
    })
  });

  // Create an AI agent for project assistance
  const aiAgent = app.ai.createAgent({
    id: 'project-assistant',
    name: 'Project Assistant',
    type: 'llm',
    config: {
      provider: 'openai',
      model: 'gpt-4o-mini',
      systemPrompt: 'You are a helpful project management assistant. Help users with project planning, task management, and team coordination.'
    },
    memory: {
      enabled: true,
      maxSize: 2000,
      strategy: 'lru'
    }
  });

  // Render the React app
  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  );
  
  root.render(<App />);
}).catch((error: any) => {
  console.error('Failed to initialize Brolostack Enterprise:', error);
});
