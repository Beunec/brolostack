"""
Brolostack WebSocket FastAPI Server Example
Demonstrates multi-agent WebSocket integration with FastAPI
"""

import os
import socketio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import asyncio
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
import logging

# Configure logging based on environment
environment = os.getenv('ENVIRONMENT', 'development')
logging.basicConfig(
    level=logging.DEBUG if environment == 'development' else logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("brolostack-ws")

# Initialize FastAPI app
app = FastAPI(
    title="Brolostack WebSocket Server",
    description="Multi-agent WebSocket server with ARGS protocol",
    version="1.0.0",
    debug=environment == "development"
)

# Environment-aware CORS configuration
cors_origins = ["http://localhost:3000", "http://localhost:3001"]
if environment == "development":
    cors_origins = ["*"]
elif environment == "production":
    cors_origins = os.getenv('ALLOWED_ORIGINS', '').split(',') if os.getenv('ALLOWED_ORIGINS') else cors_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Initialize Socket.IO with environment-aware settings
sio = socketio.AsyncServer(
    cors_allowed_origins=cors_origins,
    async_mode='asgi',
    ping_timeout=30,
    ping_interval=25,
    logger=environment == "development",
    engineio_logger=environment == "development",
    compression=environment == "production"
)

# Socket.IO ASGI app
socket_app = socketio.ASGIApp(sio, app)

# Session and agent management
active_sessions: Dict[str, Dict] = {}
registered_agents: Dict[str, Dict] = {}
task_queue: Dict[str, List[Dict]] = {}
collaboration_requests: Dict[str, Dict] = {}

# Performance metrics
server_stats = {
    'start_time': datetime.now().timestamp() * 1000,
    'connections': 0,
    'messages_processed': 0,
    'tasks_completed': 0,
    'errors': 0
}

@sio.event
async def connect(sid, environ, auth):
    """Handle client connection with environment-aware authentication"""
    logger.info(f"Client connected: {sid}")
    server_stats['connections'] += 1
    
    # Environment-aware authentication
    if environment in ["production", "staging"]:
        api_key = auth.get('apiKey') if auth else None
        if not api_key and environment == "production":
            logger.warning(f"Unauthorized connection attempt: {sid}")
            await sio.emit('auth-error', {'message': 'API key required in production'}, room=sid)
            await sio.disconnect(sid)
            return False
    
    # Send welcome message with server info
    await sio.emit('args-welcome', {
        'protocol': 'ARGS',
        'version': '1.0.0',
        'environment': environment,
        'server': 'python-fastapi',
        'capabilities': [
            'multi-agent-coordination',
            'real-time-streaming', 
            'task-distribution',
            'collaboration-management',
            'args-protocol'
        ],
        'timestamp': datetime.now().timestamp() * 1000
    }, room=sid)
    
    return True

@sio.event
async def disconnect(sid):
    """Handle client disconnection"""
    logger.info(f"Client disconnected: {sid}")
    server_stats['connections'] = max(0, server_stats['connections'] - 1)
    
    # Cleanup agent registrations
    agents_to_remove = [agent_id for agent_id, agent in registered_agents.items() 
                       if agent.get('socket_id') == sid]
    
    for agent_id in agents_to_remove:
        del registered_agents[agent_id]
        logger.info(f"Agent {agent_id} unregistered due to disconnection")
        
        # Notify other clients in sessions
        for session_id, session in active_sessions.items():
            if agent_id in session.get('agents', {}):
                del session['agents'][agent_id]
                await sio.emit('agent-unregistered', {
                    'sessionId': session_id,
                    'agentId': agent_id,
                    'reason': 'disconnection',
                    'timestamp': datetime.now().timestamp() * 1000
                }, room=session_id)

@sio.event
async def join_session(sid, data):
    """Handle session join"""
    session_id = data.get('sessionId')
    if not session_id:
        await sio.emit('error', {'message': 'Session ID required'}, room=sid)
        return
    
    await sio.enter_room(sid, session_id)
    
    # Initialize session if it doesn't exist
    if session_id not in active_sessions:
        active_sessions[session_id] = {
            'sessionId': session_id,
            'createdAt': datetime.now().timestamp() * 1000,
            'lastActivity': datetime.now().timestamp() * 1000,
            'status': 'active',
            'agents': {},
            'tasks': {},
            'activeStreams': {},
            'collaborationRequests': {},
            'metrics': {
                'totalTasks': 0,
                'completedTasks': 0,
                'errorCount': 0,
                'avgExecutionTime': 0
            }
        }
    
    # Update last activity
    active_sessions[session_id]['lastActivity'] = datetime.now().timestamp() * 1000
    
    # Send current session state
    await sio.emit('session-state', {
        **active_sessions[session_id],
        'agents': list(active_sessions[session_id]['agents'].values()),
        'tasks': list(active_sessions[session_id]['tasks'].values())
    }, room=sid)
    
    logger.info(f"Client {sid} joined session {session_id}")

@sio.event
async def register_agent(sid, agent_info):
    """Handle agent registration with ARGS protocol"""
    agent_id = agent_info.get('id')
    if not agent_id:
        await sio.emit('error', {'message': 'Agent ID required'}, room=sid)
        return
    
    # Add socket ID and registration timestamp
    agent_info['socket_id'] = sid
    agent_info['registered_at'] = datetime.now().timestamp() * 1000
    agent_info['environment'] = environment
    
    registered_agents[agent_id] = agent_info
    
    # Add agent to all sessions the client is part of
    for room in sio.manager.get_rooms(sid):
        if room != sid and room in active_sessions:  # Skip client's own room
            active_sessions[room]['agents'][agent_id] = agent_info
            active_sessions[room]['lastActivity'] = datetime.now().timestamp() * 1000
            
            await sio.emit('agent-registered', {
                'sessionId': room,
                'agent': agent_info,
                'timestamp': datetime.now().timestamp() * 1000
            }, room=room)
    
    logger.info(f"Agent {agent_id} registered from client {sid}")

@sio.event
async def start_task(sid, task_definition):
    """Handle task start with ARGS protocol"""
    task_id = task_definition.get('id')
    session_id = task_definition.get('sessionId', 'default')
    
    if not task_id:
        await sio.emit('error', {'message': 'Task ID required'}, room=sid)
        return
    
    server_stats['messages_processed'] += 1
    
    # Add task to session
    if session_id in active_sessions:
        active_sessions[session_id]['tasks'][task_id] = {
            **task_definition,
            'startTime': datetime.now().timestamp() * 1000,
            'status': 'started',
            'environment': environment
        }
        active_sessions[session_id]['metrics']['totalTasks'] += 1
        active_sessions[session_id]['lastActivity'] = datetime.now().timestamp() * 1000
    
    # Find suitable agents using ARGS protocol logic
    suitable_agents = find_suitable_agents(task_definition, session_id)
    
    if not suitable_agents:
        await sio.emit('task-error', {
            'taskId': task_id,
            'error': 'No suitable agents found for task',
            'requirements': task_definition.get('requirements', {}),
            'availableAgents': len(active_sessions.get(session_id, {}).get('agents', {})),
            'timestamp': datetime.now().timestamp() * 1000
        }, room=session_id)
        server_stats['errors'] += 1
        return
    
    # Assign task to agents based on collaboration mode
    collaboration_mode = task_definition.get('collaborationMode', 'sequential')
    
    if collaboration_mode == 'parallel':
        # Assign to all suitable agents
        for agent in suitable_agents:
            await sio.emit('task-assigned', {
                'taskId': task_id,
                'agentId': agent['id'],
                'mode': 'parallel',
                'taskDefinition': task_definition,
                'timestamp': datetime.now().timestamp() * 1000
            }, room=session_id)
    else:
        # Assign to first available agent (sequential)
        agent = suitable_agents[0]
        await sio.emit('task-assigned', {
            'taskId': task_id,
            'agentId': agent['id'],
            'mode': 'sequential',
            'taskDefinition': task_definition,
            'timestamp': datetime.now().timestamp() * 1000
        }, room=session_id)
    
    logger.info(f"Task {task_id} started with {len(suitable_agents)} agents in {collaboration_mode} mode")

@sio.event
async def agent_progress(sid, progress_data):
    """Handle agent progress updates"""
    session_id = progress_data.get('sessionId', 'default')
    task_id = progress_data.get('taskId')
    
    server_stats['messages_processed'] += 1
    
    # Update session state
    if session_id in active_sessions and task_id:
        if task_id in active_sessions[session_id]['tasks']:
            active_sessions[session_id]['tasks'][task_id].update({
                'lastProgress': progress_data,
                'lastUpdate': datetime.now().timestamp() * 1000
            })
        
        active_sessions[session_id]['lastActivity'] = datetime.now().timestamp() * 1000
        
        # Update metrics if task completed
        if progress_data.get('status') == 'completed':
            active_sessions[session_id]['metrics']['completedTasks'] += 1
            server_stats['tasks_completed'] += 1
    
    # Broadcast progress to session with enhanced data
    await sio.emit('task-progress', {
        'sessionId': session_id,
        'progress': {
            **progress_data,
            'environment': environment,
            'serverTimestamp': datetime.now().timestamp() * 1000
        },
        'timestamp': datetime.now().timestamp() * 1000
    }, room=session_id)

@sio.event
async def collaboration_request(sid, request_data):
    """Handle collaboration requests between agents"""
    session_id = request_data.get('sessionId', 'default')
    request_id = request_data.get('requestId')
    target_agent = request_data.get('targetAgent')
    
    server_stats['messages_processed'] += 1
    
    # Store collaboration request
    if session_id in active_sessions:
        active_sessions[session_id]['collaborationRequests'][request_id] = {
            **request_data,
            'timestamp': datetime.now().timestamp() * 1000,
            'status': 'pending'
        }
    
    if target_agent:
        # Send to specific agent
        target_socket = None
        for agent_id, agent in registered_agents.items():
            if agent_id == target_agent:
                target_socket = agent.get('socket_id')
                break
        
        if target_socket:
            await sio.emit('collaboration-request', {
                **request_data,
                'timestamp': datetime.now().timestamp() * 1000
            }, room=target_socket)
        else:
            await sio.emit('collaboration-error', {
                'requestId': request_id,
                'error': f'Target agent {target_agent} not found',
                'timestamp': datetime.now().timestamp() * 1000
            }, room=sid)
    else:
        # Broadcast to all agents in session
        await sio.emit('collaboration-request', {
            **request_data,
            'timestamp': datetime.now().timestamp() * 1000
        }, room=session_id)
    
    logger.info(f"Collaboration request {request_id} processed")

def find_suitable_agents(task_definition: Dict, session_id: str) -> List[Dict]:
    """Find agents suitable for a given task using ARGS protocol logic"""
    if session_id not in active_sessions:
        return []
    
    session_agents = active_sessions[session_id].get('agents', {})
    requirements = task_definition.get('requirements', {})
    required_capabilities = requirements.get('capabilities', [])
    required_agent_types = requirements.get('agentTypes', [])
    
    suitable_agents = []
    for agent_id, agent in session_agents.items():
        # Check agent type
        if required_agent_types and agent.get('type') not in required_agent_types:
            continue
        
        # Check capabilities
        agent_capabilities = agent.get('capabilities', [])
        if not all(cap in agent_capabilities for cap in required_capabilities):
            continue
        
        # Check availability
        if agent.get('status') == 'idle':
            current_tasks = agent.get('metadata', {}).get('currentTasks', 0)
            max_tasks = agent.get('metadata', {}).get('maxConcurrentTasks', 1)
            if current_tasks < max_tasks:
                suitable_agents.append(agent)
    
    return suitable_agents

# REST API endpoints for WebSocket management
@app.get("/api/ws/stats")
async def get_websocket_stats():
    """Get comprehensive WebSocket server statistics"""
    uptime = datetime.now().timestamp() * 1000 - server_stats['start_time']
    
    return {
        'environment': environment,
        'server': 'python-fastapi',
        'uptime': uptime,
        'active_sessions': len(active_sessions),
        'registered_agents': len(registered_agents),
        'connected_clients': server_stats['connections'],
        'messages_processed': server_stats['messages_processed'],
        'tasks_completed': server_stats['tasks_completed'],
        'error_count': server_stats['errors'],
        'task_queue_size': sum(len(tasks) for tasks in task_queue.values()),
        'collaboration_requests': sum(len(session.get('collaborationRequests', {})) for session in active_sessions.values()),
        'timestamp': datetime.now().timestamp() * 1000
    }

@app.get("/api/ws/sessions")
async def get_active_sessions():
    """Get all active sessions with detailed information"""
    session_details = []
    for session_id, session in active_sessions.items():
        session_details.append({
            'sessionId': session_id,
            'status': session.get('status'),
            'agentCount': len(session.get('agents', {})),
            'taskCount': len(session.get('tasks', {})),
            'activeStreams': len(session.get('activeStreams', {})),
            'collaborationRequests': len(session.get('collaborationRequests', {})),
            'createdAt': session.get('createdAt'),
            'lastActivity': session.get('lastActivity'),
            'metrics': session.get('metrics', {})
        })
    
    return {
        'count': len(active_sessions),
        'sessions': list(active_sessions.keys()),
        'details': session_details,
        'environment': environment
    }

@app.get("/api/ws/agents")
async def get_registered_agents():
    """Get all registered agents"""
    agent_details = []
    for agent_id, agent in registered_agents.items():
        # Remove sensitive socket information
        safe_agent = {k: v for k, v in agent.items() if k != 'socket_id'}
        safe_agent['online'] = True  # If in registered_agents, it's online
        agent_details.append(safe_agent)
    
    return {
        'count': len(registered_agents),
        'agents': agent_details,
        'capabilities': list(set(
            cap for agent in registered_agents.values() 
            for cap in agent.get('capabilities', [])
        )),
        'agent_types': list(set(
            agent.get('type') for agent in registered_agents.values()
        ))
    }

@app.post("/api/ws/broadcast")
async def broadcast_message(message_data: dict):
    """Broadcast message to all connected clients or specific session"""
    session_id = message_data.get('sessionId')
    event = message_data.get('event', 'broadcast')
    data = message_data.get('data', {})
    
    enhanced_data = {
        **data,
        'server': 'python-fastapi',
        'environment': environment,
        'timestamp': datetime.now().timestamp() * 1000
    }
    
    if session_id:
        await sio.emit(event, enhanced_data, room=session_id)
        target_count = 1
    else:
        await sio.emit(event, enhanced_data)
        target_count = len(active_sessions)
    
    server_stats['messages_processed'] += 1
    
    return {
        'status': 'sent',
        'event': event,
        'targetSessions': target_count,
        'timestamp': datetime.now().timestamp() * 1000
    }

@app.post("/api/demo/simulate-agent")
async def simulate_agent_activity(request_data: dict):
    """Simulate agent activity for demonstration"""
    session_id = request_data.get('sessionId', 'demo-session')
    agent_type = request_data.get('agentType', 'data-processor')
    task_type = request_data.get('taskType', 'data-analysis')
    
    # Create demo agent
    demo_agent = {
        'id': f'demo-agent-{int(datetime.now().timestamp())}',
        'type': agent_type,
        'capabilities': ['data-analysis', 'machine-learning', 'visualization'],
        'status': 'idle',
        'metadata': {
            'name': f'Demo {agent_type.title()} Agent',
            'version': '1.0.0',
            'description': f'Simulated {agent_type} for demonstration',
            'maxConcurrentTasks': 3,
            'currentTasks': 0
        },
        'socket_id': 'demo',
        'registered_at': datetime.now().timestamp() * 1000,
        'environment': environment
    }
    
    # Register demo agent
    registered_agents[demo_agent['id']] = demo_agent
    
    if session_id not in active_sessions:
        active_sessions[session_id] = {
            'sessionId': session_id,
            'createdAt': datetime.now().timestamp() * 1000,
            'lastActivity': datetime.now().timestamp() * 1000,
            'status': 'active',
            'agents': {},
            'tasks': {},
            'activeStreams': {},
            'collaborationRequests': {},
            'metrics': {'totalTasks': 0, 'completedTasks': 0, 'errorCount': 0, 'avgExecutionTime': 0}
        }
    
    active_sessions[session_id]['agents'][demo_agent['id']] = demo_agent
    
    # Broadcast agent registration
    await sio.emit('agent-registered', {
        'sessionId': session_id,
        'agent': demo_agent,
        'timestamp': datetime.now().timestamp() * 1000
    }, room=session_id)
    
    # Simulate task execution
    asyncio.create_task(simulate_task_execution(session_id, demo_agent['id'], task_type))
    
    return {
        'status': 'simulation-started',
        'sessionId': session_id,
        'agentId': demo_agent['id'],
        'agentType': agent_type,
        'taskType': task_type,
        'timestamp': datetime.now().timestamp() * 1000
    }

async def simulate_task_execution(session_id: str, agent_id: str, task_type: str):
    """Simulate realistic task execution with progress updates"""
    task_id = f'demo-task-{int(datetime.now().timestamp())}'
    
    # Task simulation steps
    steps = [
        {'step': 'initialization', 'duration': 2},
        {'step': 'data-loading', 'duration': 3},
        {'step': 'preprocessing', 'duration': 4},
        {'step': 'analysis', 'duration': 5},
        {'step': 'results-generation', 'duration': 2},
        {'step': 'cleanup', 'duration': 1}
    ]
    
    total_duration = sum(step['duration'] for step in steps)
    elapsed_time = 0
    
    for i, step in enumerate(steps):
        # Send progress update
        progress = int((elapsed_time / total_duration) * 100)
        
        await sio.emit('task-progress', {
            'sessionId': session_id,
            'progress': {
                'agentId': agent_id,
                'taskId': task_id,
                'step': step['step'],
                'status': 'processing',
                'progress': progress,
                'message': f"Executing {step['step'].replace('-', ' ')}...",
                'timestamp': datetime.now().timestamp() * 1000,
                'estimatedTimeRemaining': (total_duration - elapsed_time) * 1000,
                'metadata': {
                    'executionTime': elapsed_time * 1000,
                    'memoryUsage': 50 + (i * 10),  # Simulated memory usage
                    'cpuUsage': 30 + (i * 15),     # Simulated CPU usage
                    'errorCount': 0
                }
            },
            'timestamp': datetime.now().timestamp() * 1000
        }, room=session_id)
        
        # Wait for step duration
        await asyncio.sleep(step['duration'])
        elapsed_time += step['duration']
    
    # Send completion
    await sio.emit('task-completed', {
        'taskId': task_id,
        'agentId': agent_id,
        'result': {
            'status': 'success',
            'output': f'{task_type} completed successfully',
            'executionTime': elapsed_time * 1000,
            'results': {
                'processed_items': 1000,
                'accuracy': 0.95,
                'confidence': 0.87
            }
        },
        'timestamp': datetime.now().timestamp() * 1000
    }, room=session_id)
    
    # Update session metrics
    if session_id in active_sessions:
        active_sessions[session_id]['metrics']['completedTasks'] += 1
        metrics = active_sessions[session_id]['metrics']
        completed = metrics['completedTasks']
        current_avg = metrics['avgExecutionTime']
        metrics['avgExecutionTime'] = (current_avg * (completed - 1) + elapsed_time * 1000) / completed
    
    server_stats['tasks_completed'] += 1
    logger.info(f"Demo task {task_id} completed in {elapsed_time}s")

# Health check endpoint
@app.get("/health")
async def health_check():
    """Comprehensive health check"""
    uptime = datetime.now().timestamp() * 1000 - server_stats['start_time']
    
    return {
        'status': 'healthy',
        'environment': environment,
        'framework': 'fastapi',
        'websocket': 'active',
        'args_protocol': 'enabled',
        'uptime': uptime,
        'performance': {
            'active_sessions': len(active_sessions),
            'registered_agents': len(registered_agents),
            'messages_per_second': server_stats['messages_processed'] / max(uptime / 1000, 1),
            'error_rate': server_stats['errors'] / max(server_stats['messages_processed'], 1) * 100
        },
        'timestamp': datetime.now().timestamp() * 1000
    }

# Environment-specific startup message
@app.on_event("startup")
async def startup_event():
    logger.info(f"""
🚀 Brolostack WebSocket FastAPI Server Started!

Environment: {environment}
ARGS Protocol: Enabled
Multi-Agent Support: Active
Real-time Streaming: Ready

Features:
- Environment-aware configurations
- Multi-agent task coordination  
- Real-time progress streaming
- Agent collaboration requests
- Performance monitoring
- Automatic session cleanup

Ready for connections! 🎉
""")

if __name__ == "__main__":
    # Environment-aware server configuration
    config = {
        "host": "0.0.0.0",
        "port": int(os.getenv('PORT', 8000)),
        "reload": environment == "development",
        "log_level": "debug" if environment == "development" else "info",
        "access_log": environment == "development",
        "workers": 1 if environment == "development" else 4
    }
    
    logger.info(f"Starting Brolostack WebSocket server in {environment} mode")
    uvicorn.run(socket_app, **config)
