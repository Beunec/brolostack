/**
 * Brolostack WebSocket Showcase - React Client
 * Demonstrates revolutionary WebSocket capabilities
 */

import React, { useState, useEffect } from 'react';
import { 
  BrolostackProvider, 
  useBrolostackWebSocket,
  Environment,
  EnvironmentUtils
} from 'brolostack';

// Multi-Agent Dashboard Component
function MultiAgentDashboard() {
  const { ws, connected, stats, joinRoom, send, on } = useBrolostackWebSocket({
    url: process.env.REACT_APP_WS_URL || 'http://localhost:3001',
    autoConnect: true,
    messageQueue: {
      enabled: true,
      maxSize: 100,
      persistOffline: true
    }
  });

  const [agents, setAgents] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [collaborationRequests, setCollaborationRequests] = useState<any[]>([]);
  const [sessionId] = useState(`session_${Date.now()}`);

  useEffect(() => {
    if (!ws || !connected) return;

    // Join the multi-agent session
    joinRoom(sessionId, 'Multi-Agent Collaboration Room');

    // Setup event listeners
    on('agent-registered', (data: any) => {
      setAgents(prev => [...prev, data.agent]);
      EnvironmentUtils.log.info('Agent registered', data);
    });

    on('task-assigned', (data: any) => {
      setTasks(prev => [...prev, data]);
      EnvironmentUtils.log.info('Task assigned', data);
    });

    on('task-progress', (data: any) => {
      setTasks(prev => prev.map(task => 
        task.taskId === data.progress.taskId 
          ? { ...task, progress: data.progress }
          : task
      ));
    });

    on('collaboration-request', (data: any) => {
      setCollaborationRequests(prev => [...prev, data]);
    });

  }, [ws, connected, sessionId]);

  const handleRegisterAgent = () => {
    const agentInfo = {
      id: `agent_${Date.now()}`,
      type: 'data-processor',
      capabilities: ['data-analysis', 'machine-learning', 'visualization'],
      status: 'idle',
      metadata: {
        name: 'Data Processing Agent',
        version: '1.0.0',
        description: 'Specialized in data analysis and ML tasks',
        maxConcurrentTasks: 3,
        currentTasks: 0
      }
    };

    send('register-agent', agentInfo);
  };

  const handleStartTask = () => {
    const taskDefinition = {
      id: `task_${Date.now()}`,
      type: 'data-analysis',
      priority: 'high',
      requirements: {
        agentTypes: ['data-processor'],
        capabilities: ['data-analysis'],
        maxExecutionTime: 300000
      },
      payload: {
        dataset: 'user-behavior-data',
        analysisType: 'clustering',
        parameters: {
          algorithm: 'k-means',
          clusters: 5
        }
      },
      collaborationMode: 'parallel'
    };

    send('start-task', taskDefinition);
  };

  const handleCollaborationRequest = () => {
    const request = {
      requestId: `collab_${Date.now()}`,
      requestingAgent: agents[0]?.id || 'unknown',
      taskId: tasks[0]?.taskId || 'unknown',
      collaborationType: 'assistance',
      requiredCapabilities: ['machine-learning'],
      urgency: 'medium',
      context: {
        message: 'Need help with ML model optimization',
        currentProgress: 75
      }
    };

    send('collaboration-request', request);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🤖 Multi-Agent WebSocket Dashboard
          </h1>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {connected ? '🟢 Connected' : '🔴 Disconnected'}
            </span>
            <span className="text-gray-600">
              Environment: {Environment.current()}
            </span>
            <span className="text-gray-600">
              Session: {sessionId}
            </span>
          </div>
        </header>

        {/* Connection Stats */}
        {stats && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">📊 Connection Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.messagesSent}</div>
                <div className="text-sm text-gray-600">Messages Sent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.messagesReceived}</div>
                <div className="text-sm text-gray-600">Messages Received</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.averageLatency.toFixed(0)}ms</div>
                <div className="text-sm text-gray-600">Average Latency</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.rooms.length}</div>
                <div className="text-sm text-gray-600">Active Rooms</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Agent Management */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">🤖 Agent Management</h2>
            <button
              onClick={handleRegisterAgent}
              disabled={!connected}
              className="w-full mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
            >
              Register New Agent
            </button>
            
            <div className="space-y-2">
              {agents.map((agent, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded border">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{agent.metadata?.name || agent.id}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      agent.status === 'idle' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {agent.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Type: {agent.type} | Capabilities: {agent.capabilities?.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Task Management */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">📋 Task Management</h2>
            <button
              onClick={handleStartTask}
              disabled={!connected || agents.length === 0}
              className="w-full mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 transition-colors"
            >
              Start Data Analysis Task
            </button>
            
            <div className="space-y-2">
              {tasks.map((task, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded border">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Task {task.taskId?.slice(-8)}</span>
                    <span className="text-sm text-gray-600">{task.mode}</span>
                  </div>
                  {task.progress && (
                    <div className="mt-2">
                      <div className="flex justify-between text-sm">
                        <span>{task.progress.step}</span>
                        <span>{task.progress.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${task.progress.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Collaboration Requests */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">🤝 Collaboration Requests</h2>
          <button
            onClick={handleCollaborationRequest}
            disabled={!connected || agents.length < 2}
            className="mb-4 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-300 transition-colors"
          >
            Request Agent Collaboration
          </button>
          
          <div className="space-y-2">
            {collaborationRequests.map((request, index) => (
              <div key={index} className="p-3 bg-purple-50 rounded border border-purple-200">
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    {request.fromAgent} → {request.toAgent || 'All Agents'}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    request.urgency === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {request.urgency}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Type: {request.type} | Context: {request.context?.message}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Environment Information */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">🌍 Environment Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Current Environment</h3>
              <div className="text-sm text-gray-600">
                <div>Environment: {Environment.current()}</div>
                <div>Debug Mode: {Environment.isDev() ? 'Enabled' : 'Disabled'}</div>
                <div>Performance Monitoring: {EnvironmentUtils.shouldEnable.performanceMonitoring() ? 'Enabled' : 'Disabled'}</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">WebSocket Configuration</h3>
              <div className="text-sm text-gray-600">
                <div>Auto-reconnect: Enabled</div>
                <div>Message Queue: {Environment.isProd() ? 'Enabled' : 'Basic'}</div>
                <div>Compression: {Environment.isProd() ? 'Enabled' : 'Disabled'}</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Security Features</h3>
              <div className="text-sm text-gray-600">
                <div>Authentication: {Environment.isProd() ? 'Required' : 'Optional'}</div>
                <div>Encryption: {EnvironmentUtils.shouldEnable.encryption() ? 'Enabled' : 'Disabled'}</div>
                <div>CORS: {Environment.isDev() ? 'Permissive' : 'Restricted'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Client-Side Communication Demo
function ClientSideDashboard() {
  const { ws, connected, joinRoom, sendToRoom, broadcast } = useBrolostackWebSocket();
  const [rooms, setRooms] = useState<string[]>(['general', 'development', 'agents']);
  const [currentRoom, setCurrentRoom] = useState('general');
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (!ws || !connected) return;

    // Join default room
    joinRoom(currentRoom, `${currentRoom} Room`);

    // Listen for messages
    ws.on('message', (data: any) => {
      setMessages(prev => [...prev, data]);
    });

    ws.on('user-joined', (data: any) => {
      setMessages(prev => [...prev, {
        type: 'system',
        content: `${data.userId} joined the room`,
        timestamp: Date.now()
      }]);
    });

  }, [ws, connected, currentRoom]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: `msg_${Date.now()}`,
      type: 'text',
      content: newMessage,
      sender: {
        id: 'user-1',
        name: 'Demo User',
        type: 'user'
      },
      room: currentRoom,
      timestamp: Date.now()
    };

    sendToRoom(currentRoom, 'message', message);
    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleBroadcast = () => {
    const announcement = {
      type: 'system',
      content: 'System announcement: WebSocket showcase is running!',
      sender: {
        id: 'system',
        name: 'System',
        type: 'system'
      },
      timestamp: Date.now()
    };

    broadcast('message', announcement);
    setMessages(prev => [...prev, announcement]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            💬 Client-Side WebSocket Demo
          </h1>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {connected ? '🟢 Connected' : '🔴 Disconnected'}
            </span>
            <span className="text-gray-600">Room: {currentRoom}</span>
          </div>
        </header>

        {/* Room Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🏠 Rooms</h2>
          <div className="flex space-x-2">
            {rooms.map(room => (
              <button
                key={room}
                onClick={() => {
                  setCurrentRoom(room);
                  joinRoom(room, `${room} Room`);
                }}
                className={`px-4 py-2 rounded transition-colors ${
                  currentRoom === room
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {room}
              </button>
            ))}
          </div>
        </div>

        {/* Message Area */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">💬 Messages</h2>
          
          <div className="h-64 overflow-y-auto border rounded p-4 mb-4 bg-gray-50">
            {messages.map((message, index) => (
              <div key={index} className="mb-2">
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    message.sender?.type === 'system' 
                      ? 'bg-gray-200 text-gray-700'
                      : message.sender?.type === 'agent'
                      ? 'bg-blue-200 text-blue-700'
                      : 'bg-green-200 text-green-700'
                  }`}>
                    {message.sender?.name || 'Unknown'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="mt-1 text-sm">{message.content}</div>
              </div>
            ))}
          </div>

          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!connected}
            />
            <button
              onClick={handleSendMessage}
              disabled={!connected || !newMessage.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
            >
              Send
            </button>
            <button
              onClick={handleBroadcast}
              disabled={!connected}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-300 transition-colors"
            >
              Broadcast
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main App Component
function App() {
  const [activeDemo, setActiveDemo] = useState<'multiagent' | 'clientside'>('multiagent');

  return (
    <BrolostackProvider
      appName="websocket-showcase"
      config={{
        version: '1.0.0',
        enterprise: {
          realtime: {
            enabled: true,
            url: process.env.REACT_APP_WS_URL || 'http://localhost:3001',
            reconnectInterval: 3000,
            maxReconnectAttempts: Environment.isProd() ? 10 : 5,
            compression: Environment.isProd()
          }
        }
      }}
    >
      <div className="min-h-screen bg-gray-100">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                🚀 Brolostack WebSocket Showcase
              </h1>
              <div className="flex space-x-4">
                <button
                  onClick={() => setActiveDemo('multiagent')}
                  className={`px-4 py-2 rounded transition-colors ${
                    activeDemo === 'multiagent'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  🤖 Multi-Agent
                </button>
                <button
                  onClick={() => setActiveDemo('clientside')}
                  className={`px-4 py-2 rounded transition-colors ${
                    activeDemo === 'clientside'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  💬 Client-Side
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Demo Content */}
        {activeDemo === 'multiagent' ? <MultiAgentDashboard /> : <ClientSideDashboard />}
      </div>
    </BrolostackProvider>
  );
}

export default App;
