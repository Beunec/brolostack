# Brolostack Backend Integration Guide

## Overview

Brolostack operates primarily in the browser with a local-first architecture. For enterprise applications requiring backend services for secure operations, API integrations, and advanced features, this guide provides comprehensive integration patterns with popular backend frameworks.

## Integration Philosophy

- **Local-First**: Brolostack works fully offline without any backend
- **Optional Backend**: Backend integration is completely optional
- **Zero Breaking Changes**: Adding backend integration doesn't affect existing functionality
- **Framework Agnostic**: Works with any backend framework or architecture

## 🐍 Python Backend Integration

### FastAPI + Brolostack

**Recommended for**: High-performance APIs, async operations, automatic documentation, AI integrations

```python
# requirements.txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
redis==5.0.1
python-jose[cryptography]==3.3.0
python-multipart==0.0.6
bcrypt==4.1.2

# main.py
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import create_engine, Column, Integer, String, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import redis
import json
from datetime import datetime, timedelta
import jwt

app = FastAPI(title="Brolostack Backend API", version="1.0.2")

# CORS middleware for Brolostack frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
DATABASE_URL = "postgresql://user:password@localhost/brolostack_db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Redis setup for real-time features
redis_client = redis.Redis(host='localhost', port=6379, db=0)

# Models
class BrolostackSync(Base):
    __tablename__ = "brolostack_sync"
    
    id = Column(Integer, primary_key=True, index=True)
    store_name = Column(String, index=True)
    data = Column(JSON)
    timestamp = Column(DateTime, default=datetime.utcnow)
    checksum = Column(String)

class BrolostackUser(Base):
    __tablename__ = "brolostack_users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    roles = Column(JSON, default=["user"])
    is_active = Column(Boolean, default=True)

Base.metadata.create_all(bind=engine)

# Security
security = HTTPBearer()
SECRET_KEY = "your-secret-key"  # Use environment variable
ALGORITHM = "HS256"

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Authentication endpoints
@app.post("/api/auth/login")
async def login(credentials: dict, db: Session = Depends(get_db)):
    # Authenticate user and return JWT token
    user = db.query(BrolostackUser).filter(
        BrolostackUser.username == credentials["username"]
    ).first()
    
    if not user or not verify_password(credentials["password"], user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": user.username})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "roles": user.roles
        }
    }

# Database sync endpoints for Brolostack adapters
@app.post("/api/database/sync")
async def sync_data(
    sync_data: dict, 
    db: Session = Depends(get_db),
    current_user: str = Depends(verify_token)
):
    # Handle PostgreSQL adapter sync requests
    if sync_data["provider"] == "postgresql":
        sync_record = BrolostackSync(
            store_name=sync_data.get("storeName", "default"),
            data=sync_data["data"],
            checksum=generate_checksum(sync_data["data"])
        )
        db.add(sync_record)
        db.commit()
        
        # Notify real-time subscribers
        redis_client.publish(
            f"brolostack_sync:{sync_data.get('storeName', 'default')}", 
            json.dumps(sync_data["data"])
        )
        
        return {"status": "success", "id": sync_record.id}
    
    raise HTTPException(status_code=400, detail="Unsupported provider")

# WebSocket endpoint for real-time features
@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await websocket.accept()
    
    # Subscribe to Redis channels for real-time updates
    pubsub = redis_client.pubsub()
    pubsub.subscribe("brolostack_sync:*")
    
    try:
        while True:
            # Handle incoming WebSocket messages
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Process message and broadcast to subscribers
            if message["type"] == "subscribe":
                # Subscribe to specific channels
                pass
            elif message["type"] == "broadcast":
                # Broadcast to all connected clients
                redis_client.publish("brolostack_broadcast", json.dumps(message))
                
    except WebSocketDisconnect:
        pubsub.close()

# AI Integration endpoints
@app.post("/api/ai/chat")
async def ai_chat(
    chat_data: dict,
    current_user: str = Depends(verify_token)
):
    # Integration with AI frameworks like LangChain, CrewAI, AutoGen
    from langchain.llms import OpenAI  # Example
    
    llm = OpenAI(temperature=0.7)
    response = llm(chat_data["prompt"])
    
    return {"response": response, "timestamp": datetime.utcnow()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### Flask + Brolostack

**Recommended for**: Simple APIs, rapid prototyping, microservices

```python
# requirements.txt
flask==3.0.0
flask-cors==4.0.0
flask-sqlalchemy==3.1.1
flask-jwt-extended==4.6.0
redis==5.0.1
psycopg2-binary==2.9.9

# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import redis
import json
from datetime import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://user:password@localhost/brolostack_db'
app.config['JWT_SECRET_KEY'] = 'your-secret-key'  # Use environment variable

db = SQLAlchemy(app)
jwt = JWTManager(app)
CORS(app)
redis_client = redis.Redis(host='localhost', port=6379, db=0)

# Models
class BrolostackSync(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    store_name = db.Column(db.String(100), index=True)
    data = db.Column(db.JSON)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

@app.route('/api/auth/login', methods=['POST'])
def login():
    username = request.json.get('username')
    password = request.json.get('password')
    
    # Authenticate user (implement your logic)
    if authenticate_user(username, password):
        access_token = create_access_token(identity=username)
        return jsonify({
            'access_token': access_token,
            'user': {'username': username}
        })
    
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/database/sync', methods=['POST'])
@jwt_required()
def sync_data():
    current_user = get_jwt_identity()
    data = request.json
    
    sync_record = BrolostackSync(
        store_name=data.get('storeName', 'default'),
        data=data['data']
    )
    
    db.session.add(sync_record)
    db.session.commit()
    
    # Publish to Redis for real-time updates
    redis_client.publish(
        f"brolostack_sync:{data.get('storeName', 'default')}", 
        json.dumps(data['data'])
    )
    
    return jsonify({'status': 'success', 'id': sync_record.id})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=8000)
```

### AI Framework Integration

Brolostack includes built-in AI framework integration utilities for backend services.

#### LangChain Integration

```python
# ai_service.py
from langchain.llms import OpenAI
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
from langchain.schema import BaseMemory
import json

class BrolostackMemory(BaseMemory):
    """Custom memory adapter for Brolostack AI integration"""
    
    def __init__(self, redis_client, user_id: str):
        self.redis_client = redis_client
        self.user_id = user_id
        self.memory_key = f"brolostack_ai_memory:{user_id}"
    
    def save_context(self, inputs: dict, outputs: dict) -> None:
        # Save conversation to Brolostack storage
        memory_data = {
            "inputs": inputs,
            "outputs": outputs,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        self.redis_client.lpush(self.memory_key, json.dumps(memory_data))
        self.redis_client.ltrim(self.memory_key, 0, 99)  # Keep last 100 interactions
    
    def load_memory_variables(self, inputs: dict) -> dict:
        # Load conversation history from Brolostack
        history = self.redis_client.lrange(self.memory_key, 0, -1)
        conversation_history = ""
        
        for item in reversed(history):
            data = json.loads(item)
            conversation_history += f"Human: {data['inputs']}\nAI: {data['outputs']}\n\n"
        
        return {"history": conversation_history}

# AI service endpoints
@app.route('/api/ai/langchain', methods=['POST'])
@jwt_required()
def langchain_chat():
    current_user = get_jwt_identity()
    data = request.json
    
    # Initialize LangChain with Brolostack memory
    memory = BrolostackMemory(redis_client, current_user)
    llm = OpenAI(temperature=0.7)
    conversation = ConversationChain(llm=llm, memory=memory)
    
    response = conversation.predict(input=data['message'])
    
    return jsonify({
        'response': response,
        'timestamp': datetime.utcnow().isoformat()
    })
```

#### CrewAI Integration

```python
# crew_service.py
from crewai import Agent, Task, Crew
from crewai.tools import tool

@tool
def brolostack_data_tool(query: str) -> str:
    """Tool to query Brolostack data stores"""
    # Connect to Brolostack data and return relevant information
    sync_data = BrolostackSync.query.filter(
        BrolostackSync.store_name.contains(query)
    ).first()
    
    if sync_data:
        return json.dumps(sync_data.data)
    return "No data found"

@app.route('/api/ai/crew', methods=['POST'])
@jwt_required()
def crew_ai_task():
    current_user = get_jwt_identity()
    data = request.json
    
    # Define agents
    researcher = Agent(
        role='Data Researcher',
        goal='Research and analyze Brolostack data',
        backstory='Expert in data analysis and research',
        tools=[brolostack_data_tool]
    )
    
    analyst = Agent(
        role='Data Analyst',
        goal='Provide insights from data',
        backstory='Experienced data analyst'
    )
    
    # Define tasks
    research_task = Task(
        description=f"Research data related to: {data['query']}",
        agent=researcher
    )
    
    analysis_task = Task(
        description="Analyze the research findings and provide insights",
        agent=analyst
    )
    
    # Create crew and execute
    crew = Crew(
        agents=[researcher, analyst],
        tasks=[research_task, analysis_task]
    )
    
    result = crew.kickoff()
    
    return jsonify({
        'result': str(result),
        'timestamp': datetime.utcnow().isoformat()
    })
```

## 🟢 Node.js Backend Integration

### Express.js + Brolostack

**Recommended for**: JavaScript/TypeScript consistency, real-time features, microservices

```javascript
// package.json
{
  "name": "brolostack-backend",
  "version": "1.0.2",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "pg": "^8.11.3",
    "redis": "^4.6.10",
    "socket.io": "^4.7.4",
    "winston": "^3.11.0",
    "express-rate-limit": "^7.1.5"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.9.0",
    "typescript": "^5.2.2",
    "ts-node": "^10.9.1"
  }
}

// server.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { createClient } from 'redis';
import { Server } from 'socket.io';
import { createServer } from 'http';
import winston from 'winston';
import rateLimit from 'express-rate-limit';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Configure for production
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Database connection
const pool = new Pool({
  user: 'your_user',
  host: 'localhost',
  database: 'brolostack_db',
  password: 'your_password',
  port: 5432,
});

// Redis connection
const redisClient = createClient();
redisClient.connect();

// JWT middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Authentication routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const userResult = await pool.query(
      'SELECT * FROM brolostack_users WHERE username = $1',
      [username]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = userResult.rows[0];
    const validPassword = await bcrypt.compare(password, user.hashed_password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );
    
    res.json({
      access_token: token,
      token_type: 'bearer',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles
      }
    });
    
    logger.info(`User ${username} logged in successfully`);
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Database sync endpoints
app.post('/api/database/sync', authenticateToken, async (req, res) => {
  try {
    const { provider, data, storeName = 'default' } = req.body;
    
    if (provider === 'postgresql') {
      const result = await pool.query(
        'INSERT INTO brolostack_sync (store_name, data, timestamp) VALUES ($1, $2, NOW()) RETURNING id',
        [storeName, JSON.stringify(data)]
      );
      
      // Publish to Redis for real-time updates
      await redisClient.publish(
        `brolostack_sync:${storeName}`,
        JSON.stringify(data)
      );
      
      // Emit to WebSocket clients
      io.emit('data-sync', {
        storeName,
        data,
        timestamp: new Date().toISOString()
      });
      
      res.json({ status: 'success', id: result.rows[0].id });
      logger.info(`Data synced for store: ${storeName}`);
    } else {
      res.status(400).json({ error: 'Unsupported provider' });
    }
  } catch (error) {
    logger.error('Sync error:', error);
    res.status(500).json({ error: 'Sync failed' });
  }
});

// WebSocket handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  socket.on('join-channel', (channelName) => {
    socket.join(channelName);
    logger.info(`Client ${socket.id} joined channel: ${channelName}`);
  });
  
  socket.on('leave-channel', (channelName) => {
    socket.leave(channelName);
    logger.info(`Client ${socket.id} left channel: ${channelName}`);
  });
  
  socket.on('broadcast-message', (data) => {
    io.emit('message-received', {
      ...data,
      timestamp: new Date().toISOString(),
      sender: socket.id
    });
  });
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.2'
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  logger.info(`Brolostack backend server running on port ${PORT}`);
});
```

### NestJS + Brolostack (Enterprise)

**Recommended for**: Large-scale applications, microservices, enterprise features

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  
  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Brolostack API')
    .setDescription('Backend API for Brolostack applications')
    .setVersion('1.0.2')
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  await app.listen(8000);
}
bootstrap();

// auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { username } });
    
    if (user && await bcrypt.compare(password, user.hashedPassword)) {
      const { hashedPassword, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles
      }
    };
  }
}

// brolostack/brolostack.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrolostackSync } from './brolostack-sync.entity';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class BrolostackService {
  constructor(
    @InjectRepository(BrolostackSync)
    private syncRepository: Repository<BrolostackSync>,
    private redisService: RedisService,
  ) {}

  async syncData(storeName: string, data: any, userId: number) {
    const sync = this.syncRepository.create({
      storeName,
      data,
      userId,
      timestamp: new Date()
    });
    
    const savedSync = await this.syncRepository.save(sync);
    
    // Publish to Redis for real-time updates
    await this.redisService.publish(
      `brolostack_sync:${storeName}`,
      JSON.stringify(data)
    );
    
    return savedSync;
  }

  async restoreData(storeName: string, userId: number) {
    return this.syncRepository.findOne({
      where: { storeName, userId },
      order: { timestamp: 'DESC' }
    });
  }
}
```

## 🚀 Deployment Configurations

### Docker Compose Setup

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Frontend (Brolostack)
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:8000
      - REACT_APP_WS_URL=ws://localhost:8000
    depends_on:
      - backend

  # Backend API
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/brolostack
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=your-jwt-secret
    depends_on:
      - postgres
      - redis

  # PostgreSQL Database
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=brolostack
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  # Redis for caching and real-time features
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Kubernetes Configuration

```yaml
# k8s/deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: brolostack-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: brolostack-backend
  template:
    metadata:
      labels:
        app: brolostack-backend
    spec:
      containers:
      - name: backend
        image: brolostack/backend:1.0.2
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: brolostack-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: brolostack-secrets
              key: redis-url
---
apiVersion: v1
kind: Service
metadata:
  name: brolostack-backend-service
spec:
  selector:
    app: brolostack-backend
  ports:
  - port: 8000
    targetPort: 8000
  type: LoadBalancer
```

## 🔗 Frontend Integration

### Brolostack Configuration for Backend Integration

```typescript
// brolostack-config.ts
import { 
  Brolostack, 
  CloudBrolostack,
  BrolostackWSClientside,
  AuthManager 
} from 'brolostack';

// Initialize Brolostack with backend integration
const app = new Brolostack({
  appName: 'enterprise-app',
  version: '1.0.2',
  debug: process.env.NODE_ENV === 'development'
});

// Configure cloud integration (optional)
const cloudApp = new CloudBrolostack({
  appName: 'enterprise-app',
  version: '1.0.2',
  cloud: {
    enabled: true,
    adapters: [
      {
        name: 'mongodb',
        provider: 'mongodb',
        config: { connectionString: 'mongodb://localhost:27017/brolostack' },
        enabled: true
      }
    ],
    syncStrategy: 'local-first',
    autoSync: true
  }
});

// Configure WebSocket for real-time features
const wsClient = new BrolostackWSClientside({
  url: 'ws://localhost:8000',
  autoConnect: true,
  messageQueue: {
    enabled: true,
    persistOffline: true
  }
});

// Configure authentication
const authManager = new AuthManager({
  provider: 'custom',
  endpoints: {
    login: 'http://localhost:8000/api/auth/login',
    logout: 'http://localhost:8000/api/auth/logout',
    refresh: 'http://localhost:8000/api/auth/refresh'
  },
  tokenStorage: 'localStorage',
  autoRefresh: true
});

export { app, cloudApp, wsClient, authManager };
```

This comprehensive backend integration guide provides enterprise-ready reference architectures for both Python and Node.js ecosystems, ensuring seamless integration with Brolostack's frontend capabilities.
