import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// @ts-ignore
import { Brolostack } from '../../src/core/Brolostack';

// Initialize Brolostack for college research app
const app = new Brolostack({
  appName: 'college-research-app',
  version: '1.0.0',
  storage: {
    version: 1,
    size: 50 * 1024 * 1024, // 50MB
    storeName: 'college-research'
  }
});

// Create research projects store
const researchStore = app.createStore('research-projects', {
  projects: [],
  currentProject: null,
  filters: {
    status: 'all',
    priority: 'all',
    subject: 'all'
  }
});

// Create research notes store
const notesStore = app.createStore('research-notes', {
  notes: [],
  currentNote: null,
  searchQuery: ''
});

// Create citations store
const citationsStore = app.createStore('citations', {
  citations: [],
  currentCitation: null,
  citationStyle: 'APA'
});

// Add research project methods
researchStore.addMethod('addProject', (projectData: any) => {
  const project = {
    id: Date.now().toString(),
    title: projectData.title,
    description: projectData.description,
    subject: projectData.subject,
    status: projectData.status || 'planning',
    priority: projectData.priority || 'medium',
    startDate: new Date().toISOString(),
    dueDate: projectData.dueDate,
    tags: projectData.tags || [],
    progress: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  researchStore.setState((state: any) => ({
    ...state,
    projects: [...state.projects, project]
  }));
  
  return project;
});

researchStore.addMethod('updateProject', (id: any, updates: any) => {
  researchStore.setState((state: any) => ({
    ...state,
    projects: state.projects.map((project: any) => 
      project.id === id 
        ? { ...project, ...updates, updatedAt: new Date().toISOString() }
        : project
    )
  }));
});

researchStore.addMethod('deleteProject', (id: any) => {
  researchStore.setState((state: any) => ({
    ...state,
    projects: state.projects.filter((project: any) => project.id !== id)
  }));
});

researchStore.addMethod('setCurrentProject', (project: any) => {
  researchStore.setState((state: any) => ({
    ...state,
    currentProject: project
  }));
});

// Add research notes methods
notesStore.addMethod('addNote', (noteData: any) => {
  const note = {
    id: Date.now().toString(),
    title: noteData.title,
    content: noteData.content,
    projectId: noteData.projectId,
    tags: noteData.tags || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  notesStore.setState((state: any) => ({
    ...state,
    notes: [...state.notes, note]
  }));
  
  return note;
});

notesStore.addMethod('updateNote', (id: any, updates: any) => {
  notesStore.setState((state: any) => ({
    ...state,
    notes: state.notes.map((note: any) => 
      note.id === id 
        ? { ...note, ...updates, updatedAt: new Date().toISOString() }
        : note
    )
  }));
});

notesStore.addMethod('deleteNote', (id: any) => {
  notesStore.setState((state: any) => ({
    ...state,
    notes: state.notes.filter((note: any) => note.id !== id)
  }));
});

// Add citations methods
citationsStore.addMethod('addCitation', (citationData: any) => {
  const citation = {
    id: Date.now().toString(),
    title: citationData.title,
    authors: citationData.authors,
    publication: citationData.publication,
    year: citationData.year,
    url: citationData.url,
    type: citationData.type || 'article',
    projectId: citationData.projectId,
    createdAt: new Date().toISOString()
  };
  
  citationsStore.setState((state: any) => ({
    ...state,
    citations: [...state.citations, citation]
  }));
  
  return citation;
});

citationsStore.addMethod('deleteCitation', (id: any) => {
  citationsStore.setState((state: any) => ({
    ...state,
    citations: state.citations.filter((citation: any) => citation.id !== id)
  }));
});

// Persist stores
researchStore.persist();
notesStore.persist();
citationsStore.persist();

// Make stores available globally for the app
(window as any).researchStore = researchStore;
(window as any).notesStore = notesStore;
(window as any).citationsStore = citationsStore;

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(<App />);
