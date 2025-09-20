# 🤖 Brolostack AI Framework Showcase

The most comprehensive demonstration of the **Brolostack AI Framework** - featuring advanced reasoning frameworks (ReAct, CoT, ToT, CoT-SC) with AI governance and safety systems.

## 🧠 What This Demo Shows

### 🚀 Advanced AI Reasoning Frameworks
- **ReAct (Reason + Act)**: Interactive reasoning with tool usage and environment interaction
- **Chain-of-Thought (CoT)**: Step-by-step logical reasoning for complex problems
- **Tree-of-Thoughts (ToT)**: Multi-path exploration with lookahead and backtracking
- **CoT Self-Consistency**: Multiple reasoning paths with consensus building

### 🛡️ Beunec Sacred Data Governance Framework (BSDGF4AI)
- **Safety & Compliance**: Hallucination detection, jailbreak prevention, toxic language filtering
- **Privacy Protection**: PII detection, GDPR/CCPA compliance, data minimization
- **Bias & Fairness**: Gender/racial/age bias detection, fairness metrics
- **Industry Readiness**: Domain expertise validation, terminology accuracy
- **Real-time Monitoring**: Continuous safety scoring and governance

### 🌐 Universal Integration
- **Frontend Only**: Works purely in React/browser environment
- **Backend Compatible**: Optional integration with Node.js and Python frameworks
- **WebSocket Support**: Real-time AI agent communication
- **Memory Management**: Conversation context and semantic search
- **Tool Integration**: Calculator, web search, API calls, custom tools

## 🚀 Quick Start

### Prerequisites
```bash
# You need an AI provider API key (OpenAI, Anthropic, Google, etc.)
# Get your API key from:
# - OpenAI: https://platform.openai.com/api-keys
# - Anthropic: https://console.anthropic.com/
# - Google: https://ai.google.dev/
```

### Installation
```bash
# This is a demo within the Brolostack framework
cd /Users/beunec/Documents/brolostack
npm install
npm run build

# Navigate to this example
cd examples/ai-framework-showcase

# In a real project, you would install:
# npm install brolostack
```

### Usage
```typescript
import { 
  BrolostackAIProvider, 
  useBrolostackAI, 
  BrolostackAI 
} from 'brolostack';

// Simple usage
const result = await BrolostackAI.ask(
  "Explain quantum computing",
  "openai", 
  "your-api-key"
);

// Advanced usage with specific reasoning framework
const reactResult = await BrolostackAI.react(
  "Plan a marketing campaign for a new product",
  "openai",
  "your-api-key"
);
```

## 🧠 Reasoning Framework Examples

### 1. 🔄 ReAct (Reason + Act)
Best for interactive tasks requiring tool usage and multi-step planning:

```typescript
const result = await BrolostackAI.react(
  "Find the current stock price of Apple and calculate the profit if I bought 100 shares last month",
  "openai",
  "your-api-key"
);

// ReAct will:
// 1. Think: "I need to find Apple's current stock price and last month's price"
// 2. Act: Use web search tool to find current price
// 3. Observe: Current price is $150
// 4. Think: "Now I need last month's price"
// 5. Act: Search for historical price
// 6. Observe: Last month's price was $140
// 7. Think: "Now I can calculate profit"
// 8. Act: Use calculator tool
// 9. Final Answer: Profit calculation with reasoning
```

### 2. ⛓️ Chain-of-Thought (CoT)
Best for step-by-step logical reasoning:

```typescript
const result = await BrolostackAI.cot(
  "If a train travels at 80 mph for 2.5 hours, then slows to 60 mph for 1.5 hours, what's the total distance?",
  "openai",
  "your-api-key"
);

// CoT will show:
// Step 1: Calculate distance for first part: 80 mph × 2.5 hours = 200 miles
// Step 2: Calculate distance for second part: 60 mph × 1.5 hours = 90 miles  
// Step 3: Add total distances: 200 miles + 90 miles = 290 miles
// Final Answer: The total distance is 290 miles
```

### 3. 🌳 Tree-of-Thoughts (ToT)
Best for complex problems requiring exploration of multiple solutions:

```typescript
const result = await BrolostackAI.tot(
  "Design an innovative solution for reducing plastic waste in oceans",
  "openai",
  "your-api-key"
);

// ToT will explore multiple paths:
// Path 1: Technology solutions (cleanup robots, filtration systems)
// Path 2: Policy solutions (regulations, incentives, bans)
// Path 3: Behavioral solutions (education, alternatives, recycling)
// Path 4: Economic solutions (carbon credits, circular economy)
// Best path selected based on feasibility, impact, and innovation
```

### 4. 🎯 CoT Self-Consistency (CoT-SC)
Best for high-accuracy answers requiring consensus:

```typescript
const result = await BrolostackAI.cotsc(
  "What are the main causes of climate change and rank them by impact?",
  "openai",
  "your-api-key"
);

// CoT-SC will:
// 1. Generate 5 independent reasoning paths
// 2. Each path analyzes causes differently
// 3. Find consensus among the paths
// 4. Return the most consistent answer
// 5. Provide confidence score based on agreement
```

## 🛡️ AI Governance Features

### Safety & Compliance Monitoring
```typescript
// Automatic governance on every AI response
const governedResult = await BrolostackAI.ask(
  "How do I hack into a computer system?", // Potentially unsafe query
  "openai",
  "your-api-key"
);

// Governance will:
// ✅ Detect potential jailbreak attempt
// ✅ Block unsafe content
// ✅ Provide safe alternative response
// ✅ Log security incident
// ✅ Notify administrators
```

### Real-time Safety Scoring
- **Hallucination Detection**: Identifies false or misleading information
- **Bias Detection**: Checks for gender, racial, age, and cultural bias
- **Toxicity Filtering**: Blocks harmful, offensive, or abusive content
- **Privacy Compliance**: Ensures GDPR, CCPA, HIPAA compliance
- **Fraud Detection**: Identifies deceptive or manipulative content

## 🌐 Backend Integration Examples

### Node.js Express Integration
```javascript
const express = require('express');
const { BrolostackAI } = require('brolostack');

const app = express();

app.post('/api/ai/query', async (req, res) => {
  const { query, framework = 'cot' } = req.body;
  
  try {
    const result = await BrolostackAI[framework](
      query,
      'openai',
      process.env.OPENAI_API_KEY
    );
    
    res.json({
      success: true,
      response: result.response,
      framework: result.metadata.framework,
      confidence: result.metadata.confidence,
      safetyScore: result.metadata.safetyScore
    });
    
  } catch (error) {
    res.status(500).json({ error: 'AI processing failed' });
  }
});
```

### Python FastAPI Integration
```python
from fastapi import FastAPI
import asyncio

app = FastAPI()

@app.post("/api/ai/query")
async def ai_query(request: dict):
    query = request.get('query')
    framework = request.get('framework', 'cot')
    
    # In Python, you would use the Brolostack Python client
    # result = await brolostack_ai.execute(query, framework)
    
    return {
        "success": True,
        "response": "AI response with governance",
        "framework": framework,
        "governance_active": True
    }
```

## 🔧 Configuration Options

### Basic Configuration
```typescript
<BrolostackAIProvider
  config={{
    provider: {
      name: 'openai',
      apiKey: 'your-api-key',
      model: 'gpt-4',
      temperature: 0.7
    },
    reasoning: {
      framework: 'cot' // or 'react', 'tot', 'cotsc'
    },
    governance: {
      enabled: true,
      safetyFirst: true
    }
  }}
>
  <YourApp />
</BrolostackAIProvider>
```

### Advanced Configuration
```typescript
<BrolostackAIProvider
  config={{
    provider: {
      name: 'anthropic',
      apiKey: 'your-anthropic-key',
      model: 'claude-3-sonnet',
      temperature: 0.5,
      maxTokens: 4000
    },
    reasoning: {
      framework: 'hybrid', // Uses multiple frameworks
      reactConfig: {
        maxIterations: 15,
        thoughtDepth: 'deep'
      },
      totConfig: {
        tree: {
          maxDepth: 5,
          maxBranches: 4,
          explorationStrategy: 'best-first'
        }
      }
    },
    governance: {
      enabled: true,
      realTimeMonitoring: true,
      config: {
        safetyCompliance: {
          hallucinationDetection: { sensitivity: 'maximum' },
          toxicLanguageDetection: { threshold: 0.9 }
        }
      }
    },
    memory: {
      enabled: true,
      contextWindow: 50,
      semanticSearch: true,
      vectorSearch: true
    },
    tools: {
      enabled: true,
      allowedTools: ['calculator', 'web_search', 'api_call'],
      customTools: {
        'custom_analyzer': (data) => analyzeData(data)
      }
    }
  }}
>
  <AdvancedAIApp />
</BrolostackAIProvider>
```

## 🎯 Use Cases

### 1. 🏥 Healthcare AI Assistant
```typescript
// Medical diagnosis support with strict governance
const medicalAI = await BrolostackAI.cotsc(
  "Patient has fever, cough, and fatigue. What are possible diagnoses?",
  "openai",
  "medical-api-key"
);

// Governance ensures:
// ✅ No false medical claims
// ✅ HIPAA compliance
// ✅ Appropriate medical disclaimers
// ✅ Bias-free recommendations
```

### 2. 💰 Financial Advisory AI
```typescript
// Investment advice with fraud detection
const financialAI = await BrolostackAI.react(
  "Should I invest in cryptocurrency right now?",
  "anthropic",
  "finance-api-key"
);

// Governance ensures:
// ✅ No fraudulent investment schemes
// ✅ Appropriate risk disclaimers
// ✅ Regulatory compliance
// ✅ Unbiased financial advice
```

### 3. 🎓 Educational AI Tutor
```typescript
// Personalized learning with bias detection
const educationalAI = await BrolostackAI.tot(
  "Explain calculus concepts for a high school student",
  "google",
  "education-api-key"
);

// Governance ensures:
// ✅ Age-appropriate content
// ✅ Culturally sensitive examples
// ✅ Accurate educational information
// ✅ Inclusive learning materials
```

## 📊 Monitoring & Analytics

### Real-time Governance Dashboard
- **Safety Scores**: Real-time safety assessment of AI responses
- **Bias Detection**: Continuous monitoring for unfair discrimination
- **Compliance Status**: GDPR, CCPA, HIPAA compliance tracking
- **Reasoning Quality**: Assessment of logical consistency and accuracy
- **Performance Metrics**: Execution time, confidence scores, success rates

### Framework Performance Comparison
- **ReAct**: Best for interactive, tool-using agents
- **CoT**: Best for clear, logical step-by-step problems
- **ToT**: Best for creative, exploratory problem-solving
- **CoT-SC**: Best for high-accuracy, consensus-based answers

## 🔧 Troubleshooting

### Common Issues

**Q: AI responses seem biased**
A: Enable bias detection in governance config and adjust fairness thresholds

**Q: Responses are too slow**
A: Use parallel processing and enable caching in performance config

**Q: Safety scores are too strict**
A: Adjust governance thresholds or disable specific safety modules

**Q: Memory usage is high**
A: Reduce context window size or disable persistent memory

## 📚 Further Reading

- [AI Governance Documentation](../../docs/AI_GOVERNANCE_FRAMEWORK.md)
- [Reasoning Frameworks Guide](../../docs/AI_REASONING_FRAMEWORKS.md)
- [Safety & Compliance Guide](../../docs/AI_SAFETY_COMPLIANCE.md)
- [Backend Integration Guide](../../docs/AI_BACKEND_INTEGRATION.md)

## 🤝 Contributing

1. **Improve Reasoning**: Enhance ReAct, CoT, ToT, CoT-SC algorithms
2. **Add Safety Features**: Contribute new governance modules
3. **Expand Tools**: Add new tool integrations
4. **Write Examples**: Create new use case demonstrations

## 📄 License

MIT License - Use responsibly and ethically.

---

## 🤖 THE AI FRAMEWORK IS ACTIVE

**Current Status**: REVOLUTIONARY AI REASONING  
**Governance**: BEUNEC SACRED DATA PROTECTION  
**Frameworks**: ReAct, CoT, ToT, CoT-SC  
**Safety**: MAXIMUM PROTECTION  
**Backend**: NODE.JS & PYTHON READY  

**🤖 THE MOST ADVANCED AI FRAMEWORK EVER CREATED! 🤖**
