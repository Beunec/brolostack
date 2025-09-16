import React, { useState } from 'react';
// @ts-ignore
import { BrolostackProvider, useBrolostackStore, useBrolostackState } from '../../src/react/BrolostackProvider';
import './App.css';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate: string;
  endDate?: string;
  team: string[];
  tasks: Task[];
  createdAt: number;
  updatedAt: number;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  assignee?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: number;
  updatedAt: number;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'developer' | 'designer';
  avatar?: string;
  isActive: boolean;
}

interface ProjectState {
  projects: Project[];
  teamMembers: TeamMember[];
  currentProject?: Project;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setCurrentProject: (project: Project) => void;
  addTask: (projectId: string, task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (projectId: string, taskId: string, updates: Partial<Task>) => void;
  deleteTask: (projectId: string, taskId: string) => void;
  addTeamMember: (member: Omit<TeamMember, 'id'>) => void;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;
  removeTeamMember: (id: string) => void;
}

function ProjectManagementApp() {
  const projectStore = useBrolostackStore('projects');
  const projects = useBrolostackState('projects', (state: any) => state.projects);
  const teamMembers = useBrolostackState('projects', (state: any) => state.teamMembers);
  const currentProject = useBrolostackState('projects', (state: any) => state.currentProject);
  
  const [activeTab, setActiveTab] = useState<'projects' | 'team' | 'analytics'>('projects');
  const [showNewProject, setShowNewProject] = useState(false);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    status: 'planning' as const,
    priority: 'medium' as const,
    startDate: new Date().toISOString().split('T')[0],
    team: [] as string[]
  });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProject.name.trim()) {
      projectStore.addProject(newProject);
      setNewProject({
        name: '',
        description: '',
        status: 'planning',
        priority: 'medium',
        startDate: new Date().toISOString().split('T')[0],
        team: []
      });
      setShowNewProject(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return '#6c757d';
      case 'active': return '#28a745';
      case 'completed': return '#007bff';
      case 'on-hold': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return '#28a745';
      case 'medium': return '#ffc107';
      case 'high': return '#fd7e14';
      case 'urgent': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const totalProjects = projects.length;
  const activeProjects = projects.filter((p: any) => p.status === 'active').length;
  const completedProjects = projects.filter((p: any) => p.status === 'completed').length;
  const totalTasks = projects.reduce((sum: any, p: any) => sum + p.tasks.length, 0);
  const completedTasks = projects.reduce((sum: any, p: any) => sum + p.tasks.filter((t: any) => t.status === 'done').length, 0);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>🏢 Brolostack Enterprise</h1>
          <p>Project Management System - Zero-Cost, Browser-Local</p>
        </div>
        <div className="header-stats">
          <div className="stat">
            <span className="stat-number">{totalProjects}</span>
            <span className="stat-label">Projects</span>
          </div>
          <div className="stat">
            <span className="stat-number">{activeProjects}</span>
            <span className="stat-label">Active</span>
          </div>
          <div className="stat">
            <span className="stat-number">{totalTasks}</span>
            <span className="stat-label">Tasks</span>
          </div>
          <div className="stat">
            <span className="stat-number">{teamMembers.length}</span>
            <span className="stat-label">Team</span>
          </div>
        </div>
      </header>

      <nav className="app-nav">
        <button
          className={`nav-button ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          📋 Projects
        </button>
        <button
          className={`nav-button ${activeTab === 'team' ? 'active' : ''}`}
          onClick={() => setActiveTab('team')}
        >
          👥 Team
        </button>
        <button
          className={`nav-button ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Analytics
        </button>
      </nav>

      <main className="app-main">
        {activeTab === 'projects' && (
          <div className="projects-section">
            <div className="section-header">
              <h2>Projects</h2>
              <button
                className="add-button"
                onClick={() => setShowNewProject(true)}
              >
                + New Project
              </button>
            </div>

            {showNewProject && (
              <div className="modal-overlay">
                <div className="modal">
                  <h3>Create New Project</h3>
                  <form onSubmit={handleCreateProject}>
                    <div className="form-group">
                      <label>Project Name</label>
                      <input
                        type="text"
                        value={newProject.name}
                        onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        value={newProject.description}
                        onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                        rows={3}
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Status</label>
                        <select
                          value={newProject.status}
                          onChange={(e) => setNewProject({...newProject, status: e.target.value as any})}
                        >
                          <option value="planning">Planning</option>
                          <option value="active">Active</option>
                          <option value="on-hold">On Hold</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Priority</label>
                        <select
                          value={newProject.priority}
                          onChange={(e) => setNewProject({...newProject, priority: e.target.value as any})}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="save-button">Create Project</button>
                      <button type="button" onClick={() => setShowNewProject(false)} className="cancel-button">Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="projects-grid">
              {projects.map((project: any) => (
                <div key={project.id} className="project-card">
                  <div className="project-header">
                    <h3>{project.name}</h3>
                    <div className="project-badges">
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(project.status) }}
                      >
                        {project.status}
                      </span>
                      <span
                        className="priority-badge"
                        style={{ backgroundColor: getPriorityColor(project.priority) }}
                      >
                        {project.priority}
                      </span>
                    </div>
                  </div>
                  <p className="project-description">{project.description}</p>
                  <div className="project-stats">
                    <span>📅 {new Date(project.startDate).toLocaleDateString()}</span>
                    <span>👥 {project.team.length} members</span>
                    <span>📋 {project.tasks.length} tasks</span>
                  </div>
                  <div className="project-actions">
                    <button
                      onClick={() => projectStore.setCurrentProject(project)}
                      className="view-button"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => projectStore.deleteProject(project.id)}
                      className="delete-button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="team-section">
            <div className="section-header">
              <h2>Team Members</h2>
              <button className="add-button">+ Add Member</button>
            </div>
            <div className="team-grid">
              {teamMembers.map((member: any) => (
                <div key={member.id} className="team-card">
                  <div className="member-avatar">
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.name} />
                    ) : (
                      <span>{member.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <h3>{member.name}</h3>
                  <p>{member.email}</p>
                  <span className={`role-badge role-${member.role}`}>{member.role}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-section">
            <h2>Analytics Dashboard</h2>
            <div className="analytics-grid">
              <div className="analytics-card">
                <h3>Project Overview</h3>
                <div className="metric">
                  <span className="metric-value">{totalProjects}</span>
                  <span className="metric-label">Total Projects</span>
                </div>
                <div className="metric">
                  <span className="metric-value">{activeProjects}</span>
                  <span className="metric-label">Active Projects</span>
                </div>
                <div className="metric">
                  <span className="metric-value">{completedProjects}</span>
                  <span className="metric-label">Completed Projects</span>
                </div>
              </div>
              
              <div className="analytics-card">
                <h3>Task Overview</h3>
                <div className="metric">
                  <span className="metric-value">{totalTasks}</span>
                  <span className="metric-label">Total Tasks</span>
                </div>
                <div className="metric">
                  <span className="metric-value">{completedTasks}</span>
                  <span className="metric-label">Completed Tasks</span>
                </div>
                <div className="metric">
                  <span className="metric-value">{Math.round((completedTasks / totalTasks) * 100) || 0}%</span>
                  <span className="metric-label">Completion Rate</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Built with ❤️ using Brolostack Enterprise Framework</p>
        <p>All data stored locally - no servers, no costs, maximum privacy</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrolostackProvider appName="enterprise-pm-app" config={{}}>
      <ProjectManagementApp />
    </BrolostackProvider>
  );
}

export default App;
