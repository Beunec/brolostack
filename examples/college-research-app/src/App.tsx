import React, { useState } from 'react';
// @ts-ignore
import { BrolostackProvider, useBrolostackStore, useBrolostackState } from '../../src/react/BrolostackProvider';
import './App.css';

interface ResearchProject {
  id: string;
  title: string;
  description: string;
  subject: string;
  status: 'planning' | 'in-progress' | 'completed' | 'published';
  priority: 'low' | 'medium' | 'high';
  startDate: string;
  dueDate?: string;
  tags: string[];
  progress: number;
  createdAt: string;
  updatedAt: string;
}

interface ResearchNote {
  id: string;
  title: string;
  content: string;
  projectId: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface Citation {
  id: string;
  title: string;
  authors: string;
  publication: string;
  year: number;
  url?: string;
  type: string;
  projectId: string;
  createdAt: string;
}

const ResearchForm: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    status: 'planning' as const,
    priority: 'medium' as const,
    dueDate: '',
    tags: ''
  });

  const researchStore = useBrolostackStore('research-projects');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      researchStore.addProject({
        ...formData,
        tags: formData.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag)
      });
      setFormData({
        title: '',
        description: '',
        subject: '',
        status: 'planning',
        priority: 'medium',
        dueDate: '',
        tags: ''
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="title">Research Title</label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="subject">Subject</label>
        <select
          id="subject"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
        >
          <option value="">Select Subject</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Mathematics">Mathematics</option>
          <option value="Physics">Physics</option>
          <option value="Chemistry">Chemistry</option>
          <option value="Biology">Biology</option>
          <option value="Psychology">Psychology</option>
          <option value="Economics">Economics</option>
          <option value="Literature">Literature</option>
          <option value="History">History</option>
          <option value="Other">Other</option>
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="priority">Priority</label>
        <select
          id="priority"
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="dueDate">Due Date</label>
        <input
          type="date"
          id="dueDate"
          value={formData.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="tags">Tags (comma-separated)</label>
        <input
          type="text"
          id="tags"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="AI, Machine Learning, Research"
        />
      </div>
      
      <button type="submit" className="btn">Add Research Project</button>
    </form>
  );
};

const ResearchList: React.FC = () => {
  const researchStore = useBrolostackStore('research-projects');
  const projects = useBrolostackState('research-projects', (state: any) => state.projects);
  const filters = useBrolostackState('research-projects', (state: any) => state.filters);

  const filteredProjects = projects.filter((project: ResearchProject) => {
    if (filters.status !== 'all' && project.status !== filters.status) return false;
    if (filters.priority !== 'all' && project.priority !== filters.priority) return false;
    if (filters.subject !== 'all' && project.subject !== filters.subject) return false;
    return true;
  });

  const updateProjectStatus = (id: string, status: string) => {
    researchStore.updateProject(id, { status });
  };

  const deleteProject = (id: string) => {
    if (window.confirm('Are you sure you want to delete this research project?')) {
      researchStore.deleteProject(id);
    }
  };

  if (filteredProjects.length === 0) {
    return (
      <div className="empty-state">
        <h3>No Research Projects</h3>
        <p>Start by adding your first research project!</p>
      </div>
    );
  }

  return (
    <div className="research-list">
      {filteredProjects.map((project: ResearchProject) => (
        <div key={project.id} className={`research-item priority-${project.priority}`}>
          <div className="research-title">{project.title}</div>
          <div className="research-meta">
            <span className={`status-badge status-${project.status}`}>
              {project.status.replace('-', ' ')}
            </span>
            <span> • {project.subject} • {project.priority} priority</span>
            {project.dueDate && (
              <span> • Due: {new Date(project.dueDate).toLocaleDateString()}</span>
            )}
          </div>
          <div className="research-description">{project.description}</div>
          {project.tags.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              {project.tags.map((tag: string) => (
                <span key={tag} style={{ 
                  background: '#e9ecef', 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '4px', 
                  fontSize: '0.75rem',
                  marginRight: '0.5rem'
                }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="research-actions">
            <select
              value={project.status}
              onChange={(e) => updateProjectStatus(project.id, e.target.value)}
              className="btn btn-sm"
            >
              <option value="planning">Planning</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="published">Published</option>
            </select>
            <button
              onClick={() => deleteProject(project.id)}
              className="btn btn-sm btn-danger"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const StatsPanel: React.FC = () => {
  const projects = useBrolostackState('research-projects', (state: any) => state.projects);
  const notes = useBrolostackState('research-notes', (state: any) => state.notes);
  const citations = useBrolostackState('citations', (state: any) => state.citations);

  const stats = {
    totalProjects: projects.length,
    completedProjects: projects.filter((p: ResearchProject) => p.status === 'completed').length,
    totalNotes: notes.length,
    totalCitations: citations.length
  };

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-number">{stats.totalProjects}</div>
        <div className="stat-label">Research Projects</div>
      </div>
      <div className="stat-card">
        <div className="stat-number">{stats.completedProjects}</div>
        <div className="stat-label">Completed</div>
      </div>
      <div className="stat-card">
        <div className="stat-number">{stats.totalNotes}</div>
        <div className="stat-label">Research Notes</div>
      </div>
      <div className="stat-card">
        <div className="stat-number">{stats.totalCitations}</div>
        <div className="stat-label">Citations</div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrolostackProvider appName="college-research-app" config={{}}>
      <div className="app">
        <header className="header">
          <h1>🎓 College Research Manager</h1>
          <p>Organize your academic research projects with Brolostack</p>
        </header>

        <StatsPanel />

        <div className="main-content">
          <div className="section">
            <div className="section-header">
              <h2>Add New Research Project</h2>
            </div>
            <div className="section-content">
              <ResearchForm />
            </div>
          </div>

          <div className="section">
            <div className="section-header">
              <h2>Research Projects</h2>
            </div>
            <div className="section-content">
              <ResearchList />
            </div>
          </div>
        </div>
      </div>
    </BrolostackProvider>
  );
};

export default App;
