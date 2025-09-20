/**
 * 🔥 Brolostack Devil - Node.js/Express Server Example
 * Demonstrates backend source code protection
 */

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// Import Brolostack Devil protection
const { DevilSourceCode, getBrolostackDevilSourceCode } = require('brolostack');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// 🔥 Initialize Devil protection
const devil = getBrolostackDevilSourceCode({
  protectionLevel: 'devil',
  frameworks: {
    nodejs: true,
    express: true
  },
  mutation: {
    enabled: true,
    interval: 5000,
    intensity: 'extreme'
  }
});

// 🔥 Apply Devil middleware for automatic source protection
app.use(DevilSourceCode.expressMiddleware());
app.use(cors());
app.use(express.json());

// 🔥 Simulate sensitive business logic (will be obfuscated)
function calculateUserCreditScore(userData) {
  // This algorithm will be completely obfuscated in production
  let score = 300; // Base score
  
  if (userData.income > 50000) score += 100;
  if (userData.age > 25) score += 50;
  if (userData.employment === 'stable') score += 75;
  if (userData.debtRatio < 0.3) score += 125;
  if (userData.paymentHistory === 'excellent') score += 150;
  
  return Math.min(score, 850);
}

function generateAPIKey(userId) {
  // Secret API key generation (will be obfuscated)
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  const hash = require('crypto').createHash('sha256')
    .update(userId + timestamp + random + 'secret_salt_2024')
    .digest('hex');
  
  return `bro_${hash.substring(0, 32)}`;
}

// 🔥 Protected API endpoints
app.get('/api/status', (req, res) => {
  // This response will be automatically obfuscated
  res.json({
    status: 'active',
    message: 'Brolostack Devil is protecting this server',
    protection_level: 'devil',
    timestamp: new Date().toISOString(),
    server_info: {
      algorithm: 'quantum-resistant',
      encryption: 'AES-256-GCM',
      obfuscation: 'extreme'
    }
  });
});

app.post('/api/user/credit-score', async (req, res) => {
  try {
    const { userId, userData, userSecret } = req.body;
    
    // Calculate credit score (obfuscated logic)
    const creditScore = calculateUserCreditScore(userData);
    
    // Encrypt sensitive response using Devil
    const sensitiveData = {
      userId,
      creditScore,
      recommendation: creditScore > 700 ? 'approved' : 'review_required',
      factors: {
        income_factor: userData.income > 50000 ? 'positive' : 'neutral',
        age_factor: userData.age > 25 ? 'positive' : 'neutral',
        debt_factor: userData.debtRatio < 0.3 ? 'positive' : 'negative'
      },
      generated_at: new Date().toISOString()
    };
    
    // Protect the response data
    const encryptionResult = await devil.encryptClientData(
      sensitiveData,
      userSecret,
      {
        userId,
        sessionId: `credit_${Date.now()}`,
        dataType: 'document'
      }
    );
    
    // Return encrypted response
    res.json({
      success: true,
      encrypted_data: encryptionResult.encryptedData,
      token: encryptionResult.token.id,
      security_fingerprint: encryptionResult.securityFingerprint,
      devil_protected: true
    });
    
  } catch (error) {
    console.error('🔥 Credit score calculation failed:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      devil_protected: true 
    });
  }
});

app.post('/api/ai/chat', async (req, res) => {
  try {
    const { conversation, userSecret, aiProvider } = req.body;
    
    // Protect AI conversation using Devil
    const protectedConversation = await devil.encryptAIConversation(
      conversation,
      userSecret,
      aiProvider || 'openai'
    );
    
    // Simulate AI provider call with jargon payload
    console.log('🔥 Sending to AI Provider (jargon):', protectedConversation.providerPayload);
    
    // Simulate AI response (in production, this would call real AI)
    const aiResponse = {
      role: 'assistant',
      content: 'quantumProcessor algorithmExecutor dataMatrix successful'
    };
    
    // Return protected response
    res.json({
      success: true,
      ai_response: aiResponse,
      real_conversation_encrypted: protectedConversation.encryptedConversation.encryptedData,
      devil_token: protectedConversation.devilToken.id,
      provider_saw_jargon: true
    });
    
  } catch (error) {
    console.error('🔥 AI chat protection failed:', error);
    res.status(500).json({ 
      error: 'AI service error',
      devil_protected: true 
    });
  }
});

app.post('/api/cloud/store', async (req, res) => {
  try {
    const { data, userSecret, userId, cloudProvider } = req.body;
    
    // Protect data for cloud storage
    const cloudProtection = await devil.protectCloudStorage(
      data,
      userSecret,
      cloudProvider || 'aws',
      userId
    );
    
    // Simulate cloud storage (in production, this would upload to real cloud)
    console.log('🔥 Storing in cloud (encrypted jargon):', cloudProtection.encryptedPayload);
    
    // Return retrieval token to user
    res.json({
      success: true,
      storage_id: `cloud_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      retrieval_token: cloudProtection.retrievalToken,
      cloud_provider: cloudProvider || 'aws',
      devil_protected: true,
      message: 'Data encrypted and stored. Cloud provider cannot access real content.'
    });
    
  } catch (error) {
    console.error('🔥 Cloud storage protection failed:', error);
    res.status(500).json({ 
      error: 'Cloud storage error',
      devil_protected: true 
    });
  }
});

app.get('/api/generate-api-key/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    // Generate API key (obfuscated logic)
    const apiKey = generateAPIKey(userId);
    
    res.json({
      success: true,
      api_key: apiKey,
      expires_in: '30 days',
      devil_protected: true,
      warning: 'This API key generation logic is completely obfuscated'
    });
    
  } catch (error) {
    console.error('🔥 API key generation failed:', error);
    res.status(500).json({ 
      error: 'Key generation error',
      devil_protected: true 
    });
  }
});

// 🔥 WebSocket protection for real-time features
io.on('connection', (socket) => {
  console.log('🔥 Client connected with Devil protection');
  
  socket.on('protect-message', async (data) => {
    try {
      const { message, userSecret, userId } = data;
      
      // Protect real-time message
      const encryptionResult = await devil.encryptClientData(
        { message, timestamp: Date.now() },
        userSecret,
        {
          userId,
          sessionId: `ws_${socket.id}`,
          dataType: 'message'
        }
      );
      
      // Broadcast encrypted message (other clients see jargon)
      socket.broadcast.emit('encrypted-message', {
        encrypted_data: encryptionResult.encryptedData,
        sender_id: userId,
        token: encryptionResult.token.id,
        devil_protected: true
      });
      
      // Confirm to sender
      socket.emit('message-protected', {
        success: true,
        message: 'Message encrypted and broadcasted'
      });
      
    } catch (error) {
      console.error('🔥 Message protection failed:', error);
      socket.emit('protection-error', { 
        error: 'Message protection failed' 
      });
    }
  });
  
  socket.on('force-mutation', async () => {
    try {
      await devil.forceMutation();
      io.emit('security-mutated', {
        message: 'Security patterns have been mutated',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('🔥 Mutation failed:', error);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('🔥 Client disconnected');
  });
});

// 🔥 Devil status endpoint
app.get('/api/devil/status', (req, res) => {
  const status = devil.getProtectionStatus();
  res.json({
    ...status,
    message: '🔥 Brolostack Devil is active and protecting this server',
    uptime: process.uptime(),
    memory_usage: process.memoryUsage(),
    node_version: process.version
  });
});

// 🔥 Force security mutation endpoint
app.post('/api/devil/mutate', async (req, res) => {
  try {
    await devil.forceMutation();
    res.json({
      success: true,
      message: '🔥 Security patterns mutated successfully',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('🔥 Mutation failed:', error);
    res.status(500).json({ 
      error: 'Mutation failed',
      devil_protected: true 
    });
  }
});

// 🔥 Serve protected static files
app.use(express.static('dist'));

// 🔥 Error handling middleware
app.use((err, req, res, next) => {
  console.error('🔥 Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    devil_protected: true,
    message: 'Error details are obfuscated for security'
  });
});

// 🔥 Start server with Devil protection
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
🔥 ====================================== 🔥
🔥  BROLOSTACK DEVIL SERVER ACTIVE      🔥
🔥 ====================================== 🔥

Server: http://localhost:${PORT}
Protection Level: DEVIL
Source Code: COMPLETELY OBFUSCATED
API Responses: ENCRYPTED JARGON
Real-time: WEBSOCKET PROTECTED
Mutation: EVERY 5 SECONDS

⚠️  WARNING: ALL CODE IS PROTECTED ⚠️
Developers and cloud providers cannot
access real data or business logic.

🔥 THE DEVIL IS WATCHING... 🔥
  `);
  
  // Start mutation cycle monitoring
  setInterval(() => {
    const status = devil.getProtectionStatus();
    console.log(`🔥 Devil Status: ${status.protectionLevel} | Protected Elements: ${status.protectedElements} | Mutations: ${status.obfuscationMappings}`);
  }, 10000); // Log status every 10 seconds
});

// 🔥 Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔥 Shutting down Devil-protected server...');
  devil.destroy();
  server.close(() => {
    console.log('🔥 Server shutdown complete');
    process.exit(0);
  });
});
