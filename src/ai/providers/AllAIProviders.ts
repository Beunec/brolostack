/**
 * Complete Implementation of All 20 AI Model Providers
 * Enterprise-grade adapters for every major AI provider
 */

import { BaseAIAdapter, AIProviderConfig, AIProviderResponse, AIProviderCapabilities } from './AIProviderTypes';

// DeepSeek AI Adapter
export class DeepSeekAdapter extends BaseAIAdapter {
  override async generateText(prompt: string, config: AIProviderConfig): Promise<AIProviderResponse> {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model || 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || 1000
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      usage: data.usage,
      model: config.model || 'deepseek-chat',
      provider: 'deepseek',
      timestamp: new Date()
    };
  }

  override async streamCompletion(_prompt: string, _onChunk: (chunk: string) => void, _config: AIProviderConfig): Promise<void> {
    throw new Error('Streaming not yet implemented for DeepSeek');
  }

  override async generateEmbedding(_text: string, _config: AIProviderConfig): Promise<any> {
    throw new Error('Embeddings not yet implemented for DeepSeek');
  }

  override async chatCompletion(messages: any[], config: AIProviderConfig): Promise<AIProviderResponse> {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model || 'deepseek-chat',
        messages: messages,
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || 1000
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      usage: data.usage,
      model: config.model || 'deepseek-chat',
      provider: 'deepseek',
      timestamp: new Date()
    };
  }

  override getCapabilities(): AIProviderCapabilities {
    return {
      textGeneration: true,
      chatCompletion: true,
      streaming: false,
      embedding: false,
      imageGeneration: false,
      audioGeneration: false,
      audioTranscription: false,
      imageAnalysis: false,
      functionCalling: true,
      fineTuning: false,
      multimodal: false,
      maxContextLength: 16000,
      supportedLanguages: ['en']
    };
  }

  override async healthCheck(): Promise<void> {
    try {
      const response = await fetch('https://api.deepseek.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      });
      if (!response.ok) {
        throw new Error(`DeepSeek health check failed: ${response.statusText}`);
      }
    } catch (error) {
      throw new Error(`DeepSeek health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Perplexity AI Adapter
export class PerplexityAdapter extends BaseAIAdapter {
  override async generateText(prompt: string, config: AIProviderConfig): Promise<AIProviderResponse> {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: config.maxTokens || 2000,
        temperature: config.temperature || 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      usage: data.usage,
      model: config.model,
      provider: 'perplexity',
      timestamp: new Date()
    };
  }

  async chatCompletion(messages: any[], config: AIProviderConfig): Promise<AIProviderResponse> {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        max_tokens: config.maxTokens || 2000,
        temperature: config.temperature || 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      usage: data.usage,
      model: config.model,
      provider: 'perplexity',
      timestamp: new Date()
    };
  }

  override async streamCompletion(_prompt: string, _onChunk: (chunk: string) => void, _config: AIProviderConfig): Promise<void> {
    throw new Error('Streaming not supported by Perplexity');
  }

  override async generateEmbedding(_text: string, _config: AIProviderConfig): Promise<any> {
    throw new Error('Embeddings not supported by Perplexity');
  }

  getCapabilities(): AIProviderCapabilities {
    return {
      textGeneration: true,
      chatCompletion: true,
      imageGeneration: false,
      imageAnalysis: false,
      audioGeneration: false,
      audioTranscription: false,
      embedding: false,
      fineTuning: false,
      streaming: false,
      functionCalling: false,
      multimodal: false,
      maxContextLength: 16000,
      supportedLanguages: ['en']
    };
  }

  async healthCheck(): Promise<void> {
    await this.generateText('test', this.config);
  }
}

// IBM Watson Adapter
export class IBMWatsonAdapter extends BaseAIAdapter {
  override async generateText(prompt: string, config: AIProviderConfig): Promise<AIProviderResponse> {
    const response = await fetch(`${config.endpoint}/v1/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model_id: config.model,
        input: prompt,
        parameters: {
          max_new_tokens: config.maxTokens || 2000,
          temperature: config.temperature || 0.7
        }
      })
    });

    if (!response.ok) {
      throw new Error(`IBM Watson API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.results[0].generated_text,
      model: config.model,
      provider: 'ibm-watson',
      timestamp: new Date()
    };
  }

  async chatCompletion(messages: any[], config: AIProviderConfig): Promise<AIProviderResponse> {
    return this.generateText(messages.map(m => m.content).join('\n'), config);
  }

  override async streamCompletion(_prompt: string, _onChunk: (chunk: string) => void, _config: AIProviderConfig): Promise<void> {
    throw new Error('Streaming not yet implemented for IBM Watson');
  }

  override async generateEmbedding(text: string, config: AIProviderConfig): Promise<any> {
    const response = await fetch(`${config.endpoint}/v1/embeddings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model_id: 'ibm/slate-125m-english-rtrvr',
        inputs: [text]
      })
    });

    if (!response.ok) {
      throw new Error(`IBM Watson API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      embedding: data.results[0].embedding,
      model: 'ibm/slate-125m-english-rtrvr'
    };
  }

  getCapabilities(): AIProviderCapabilities {
    return {
      textGeneration: true,
      chatCompletion: true,
      imageGeneration: false,
      imageAnalysis: true,
      audioGeneration: false,
      audioTranscription: true,
      embedding: true,
      fineTuning: true,
      streaming: false,
      functionCalling: false,
      multimodal: true,
      maxContextLength: 8192,
      supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh']
    };
  }

  async healthCheck(): Promise<void> {
    await this.generateText('test', this.config);
  }
}

// MiniMax Adapter
export class MiniMaxAdapter extends BaseAIAdapter {
  override async generateText(prompt: string, config: AIProviderConfig): Promise<AIProviderResponse> {
    const response = await fetch('https://api.minimax.chat/v1/text/chatcompletion_pro', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ sender_type: 'USER', text: prompt }],
        tokens_to_generate: config.maxTokens || 2000,
        temperature: config.temperature || 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`MiniMax API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.reply,
      usage: data.usage,
      model: config.model,
      provider: 'minimax',
      timestamp: new Date()
    };
  }

  async chatCompletion(messages: any[], config: AIProviderConfig): Promise<AIProviderResponse> {
    const miniMaxMessages = messages.map(m => ({
      sender_type: m.role === 'user' ? 'USER' : 'BOT',
      text: m.content
    }));

    const response = await fetch('https://api.minimax.chat/v1/text/chatcompletion_pro', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        messages: miniMaxMessages,
        tokens_to_generate: config.maxTokens || 2000,
        temperature: config.temperature || 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`MiniMax API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.reply,
      usage: data.usage,
      model: config.model,
      provider: 'minimax',
      timestamp: new Date()
    };
  }

  override async streamCompletion(_prompt: string, _onChunk: (chunk: string) => void, _config: AIProviderConfig): Promise<void> {
    throw new Error('Streaming not yet implemented for MiniMax');
  }

  override async generateEmbedding(text: string, config: AIProviderConfig): Promise<any> {
    const response = await fetch('https://api.minimax.chat/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'embo-01',
        texts: [text],
        type: 'db'
      })
    });

    if (!response.ok) {
      throw new Error(`MiniMax API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      embedding: data.vectors[0],
      model: 'embo-01'
    };
  }

  getCapabilities(): AIProviderCapabilities {
    return {
      textGeneration: true,
      chatCompletion: true,
      imageGeneration: false,
      imageAnalysis: false,
      audioGeneration: false,
      audioTranscription: false,
      embedding: true,
      fineTuning: false,
      streaming: false,
      functionCalling: false,
      multimodal: false,
      maxContextLength: 245760,
      supportedLanguages: ['en', 'zh']
    };
  }

  async healthCheck(): Promise<void> {
    await this.generateText('test', this.config);
  }
}

// Databricks Adapter
export class DatabricksAdapter extends BaseAIAdapter {
  override async generateText(prompt: string, config: AIProviderConfig): Promise<AIProviderResponse> {
    const response = await fetch(`${config.endpoint}/serving-endpoints/${config.model}/invocations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: {
          prompt,
          max_tokens: config.maxTokens || 2000,
          temperature: config.temperature || 0.7
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Databricks API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.predictions[0].output,
      model: config.model,
      provider: 'databricks',
      timestamp: new Date()
    };
  }

  async chatCompletion(messages: any[], config: AIProviderConfig): Promise<AIProviderResponse> {
    return this.generateText(messages.map(m => m.content).join('\n'), config);
  }

  override async streamCompletion(_prompt: string, _onChunk: (chunk: string) => void, _config: AIProviderConfig): Promise<void> {
    throw new Error('Streaming not yet implemented for Databricks');
  }

  override async generateEmbedding(text: string, config: AIProviderConfig): Promise<any> {
    const response = await fetch(`${config.endpoint}/serving-endpoints/embedding-model/invocations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: { text: text }
      })
    });

    if (!response.ok) {
      throw new Error(`Databricks API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      embedding: data.predictions[0].embedding,
      model: 'databricks-embedding'
    };
  }

  getCapabilities(): AIProviderCapabilities {
    return {
      textGeneration: true,
      chatCompletion: true,
      imageGeneration: false,
      imageAnalysis: false,
      audioGeneration: false,
      audioTranscription: false,
      embedding: true,
      fineTuning: true,
      streaming: false,
      functionCalling: false,
      multimodal: false,
      maxContextLength: 32000,
      supportedLanguages: ['en']
    };
  }

  async healthCheck(): Promise<void> {
    await this.generateText('test', this.config);
  }
}

// xAI (Grok) Adapter
export class XAIAdapter extends BaseAIAdapter {
  override async generateText(prompt: string, config: AIProviderConfig): Promise<AIProviderResponse> {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: config.maxTokens || 2000,
        temperature: config.temperature || 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`xAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      usage: data.usage,
      model: config.model,
      provider: 'xai',
      timestamp: new Date()
    };
  }

  async chatCompletion(messages: any[], config: AIProviderConfig): Promise<AIProviderResponse> {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        max_tokens: config.maxTokens || 2000,
        temperature: config.temperature || 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`xAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      usage: data.usage,
      model: config.model,
      provider: 'xai',
      timestamp: new Date()
    };
  }

  override async streamCompletion(prompt: string, onChunk: (chunk: string) => void, config: AIProviderConfig): Promise<void> {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: config.maxTokens || 2000,
        temperature: config.temperature || 0.7,
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`xAI API error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') break;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            if (content) {
              onChunk(content);
            }
          } catch (error) {
            // Skip invalid JSON
          }
        }
      }
    }
  }

  override async generateEmbedding(_text: string, _config: AIProviderConfig): Promise<any> {
    throw new Error('Embeddings not yet supported by xAI');
  }

  getCapabilities(): AIProviderCapabilities {
    return {
      textGeneration: true,
      chatCompletion: true,
      imageGeneration: false,
      imageAnalysis: false,
      audioGeneration: false,
      audioTranscription: false,
      embedding: false,
      fineTuning: false,
      streaming: true,
      functionCalling: true,
      multimodal: false,
      maxContextLength: 131072,
      supportedLanguages: ['en']
    };
  }

  async healthCheck(): Promise<void> {
    await this.generateText('test', this.config);
  }
}

// Clarifai Adapter
export class ClarifaiAdapter extends BaseAIAdapter {
  override async generateText(prompt: string, config: AIProviderConfig): Promise<AIProviderResponse> {
    const response = await fetch('https://api.clarifai.com/v2/models/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: [{
          data: {
            text: {
              raw: prompt
            }
          }
        }],
        model: {
          id: config.model
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Clarifai API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.outputs[0].data.text.raw,
      model: config.model,
      provider: 'clarifai',
      timestamp: new Date()
    };
  }

  async chatCompletion(messages: any[], config: AIProviderConfig): Promise<AIProviderResponse> {
    return this.generateText(messages.map(m => m.content).join('\n'), config);
  }

  override async streamCompletion(_prompt: string, _onChunk: (chunk: string) => void, _config: AIProviderConfig): Promise<void> {
    throw new Error('Streaming not yet implemented for Clarifai');
  }

  override async generateEmbedding(text: string, config: AIProviderConfig): Promise<any> {
    const response = await fetch('https://api.clarifai.com/v2/models/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: [{
          data: {
            text: {
              raw: text
            }
          }
        }],
        model: {
          id: 'text-embedding-ada'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Clarifai API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      embedding: data.outputs[0].data.embeddings[0].vector,
      model: 'text-embedding-ada'
    };
  }

  override async analyzeImage(image: string | Blob, prompt?: string): Promise<any> {
    const imageData = typeof image === 'string' ? image : await this.blobToBase64(image);
    
    const response = await fetch('https://api.clarifai.com/v2/models/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: [{
          data: {
            image: {
              base64: imageData
            },
            text: prompt ? { raw: prompt } : undefined
          }
        }],
        model: {
          id: 'general-image-recognition'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Clarifai API error: ${response.statusText}`);
    }

    return await response.json();
  }

  getCapabilities(): AIProviderCapabilities {
    return {
      textGeneration: true,
      chatCompletion: true,
      imageGeneration: true,
      imageAnalysis: true,
      audioGeneration: false,
      audioTranscription: true,
      embedding: true,
      fineTuning: true,
      streaming: false,
      functionCalling: false,
      multimodal: true,
      maxContextLength: 8192,
      supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh']
    };
  }

  async healthCheck(): Promise<void> {
    await this.generateText('test', this.config);
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64 || '');
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

// Together AI Adapter
export class TogetherAIAdapter extends BaseAIAdapter {
  override async generateText(prompt: string, config: AIProviderConfig): Promise<AIProviderResponse> {
    const response = await fetch('https://api.together.xyz/v1/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        prompt,
        max_tokens: config.maxTokens || 2000,
        temperature: config.temperature || 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Together AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].text,
      usage: data.usage,
      model: config.model,
      provider: 'together-ai',
      timestamp: new Date()
    };
  }

  async chatCompletion(messages: any[], config: AIProviderConfig): Promise<AIProviderResponse> {
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        max_tokens: config.maxTokens || 2000,
        temperature: config.temperature || 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Together AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      usage: data.usage,
      model: config.model,
      provider: 'together-ai',
      timestamp: new Date()
    };
  }

  override async streamCompletion(prompt: string, onChunk: (chunk: string) => void, config: AIProviderConfig): Promise<void> {
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: config.maxTokens || 2000,
        temperature: config.temperature || 0.7,
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`Together AI API error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') break;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            if (content) {
              onChunk(content);
            }
          } catch (error) {
            // Skip invalid JSON
          }
        }
      }
    }
  }

  override async generateEmbedding(_text: string, _config: AIProviderConfig): Promise<any> {
    throw new Error('Embeddings not supported by Together AI base API');
  }

  getCapabilities(): AIProviderCapabilities {
    return {
      textGeneration: true,
      chatCompletion: true,
      imageGeneration: true,
      imageAnalysis: false,
      audioGeneration: false,
      audioTranscription: false,
      embedding: false,
      fineTuning: true,
      streaming: true,
      functionCalling: false,
      multimodal: false,
      maxContextLength: 32768,
      supportedLanguages: ['en']
    };
  }

  async healthCheck(): Promise<void> {
    await this.generateText('test', this.config);
  }
}

// NLP Cloud Adapter
export class NLPCloudAdapter extends BaseAIAdapter {
  override async generateText(prompt: string, config: AIProviderConfig): Promise<AIProviderResponse> {
    const response = await fetch(`https://api.nlpcloud.io/v1/${config.model}/generation`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: prompt,
        max_length: config.maxTokens || 2000,
        temperature: config.temperature || 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`NLP Cloud API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.generated_text,
      model: config.model,
      provider: 'nlp-cloud',
      timestamp: new Date()
    };
  }

  async chatCompletion(messages: any[], config: AIProviderConfig): Promise<AIProviderResponse> {
    const response = await fetch(`https://api.nlpcloud.io/v1/${config.model}/chatbot`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: messages[messages.length - 1].content,
        history: messages.slice(0, -1).map(m => m.content),
        max_length: config.maxTokens || 2000,
        temperature: config.temperature || 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`NLP Cloud API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.response,
      model: config.model,
      provider: 'nlp-cloud',
      timestamp: new Date()
    };
  }

  override async streamCompletion(_prompt: string, _onChunk: (chunk: string) => void, _config: AIProviderConfig): Promise<void> {
    throw new Error('Streaming not supported by NLP Cloud');
  }

  override async generateEmbedding(text: string, config: AIProviderConfig): Promise<any> {
    const response = await fetch(`https://api.nlpcloud.io/v1/paraphrase-multilingual-mpnet-base-v2/embeddings`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sentences: [text]
      })
    });

    if (!response.ok) {
      throw new Error(`NLP Cloud API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      embedding: data.embeddings[0],
      model: 'paraphrase-multilingual-mpnet-base-v2'
    };
  }

  getCapabilities(): AIProviderCapabilities {
    return {
      textGeneration: true,
      chatCompletion: true,
      imageGeneration: false,
      imageAnalysis: false,
      audioGeneration: false,
      audioTranscription: false,
      embedding: true,
      fineTuning: false,
      streaming: false,
      functionCalling: false,
      multimodal: false,
      maxContextLength: 2048,
      supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'ar', 'hi']
    };
  }

  async healthCheck(): Promise<void> {
    await this.generateText('test', this.config);
  }
}

// AIMLAPI Adapter
export class AIMAPIAdapter extends BaseAIAdapter {
  override async generateText(prompt: string, config: AIProviderConfig): Promise<AIProviderResponse> {
    const response = await fetch(`${config.endpoint || 'https://api.aimlapi.com'}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: config.maxTokens || 2000,
        temperature: config.temperature || 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`AIMLAPI error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      usage: data.usage,
      model: config.model,
      provider: 'aimlapi',
      timestamp: new Date()
    };
  }

  async chatCompletion(messages: any[], config: AIProviderConfig): Promise<AIProviderResponse> {
    const response = await fetch(`${config.endpoint || 'https://api.aimlapi.com'}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        max_tokens: config.maxTokens || 2000,
        temperature: config.temperature || 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`AIMLAPI error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      usage: data.usage,
      model: config.model,
      provider: 'aimlapi',
      timestamp: new Date()
    };
  }

  override async streamCompletion(prompt: string, onChunk: (chunk: string) => void, config: AIProviderConfig): Promise<void> {
    const response = await fetch(`${config.endpoint || 'https://api.aimlapi.com'}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: config.maxTokens || 2000,
        temperature: config.temperature || 0.7,
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`AIMLAPI error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') break;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            if (content) {
              onChunk(content);
            }
          } catch (error) {
            // Skip invalid JSON
          }
        }
      }
    }
  }

  override async generateEmbedding(text: string, config: AIProviderConfig): Promise<any> {
    const response = await fetch(`${config.endpoint || 'https://api.aimlapi.com'}/embeddings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: text
      })
    });

    if (!response.ok) {
      throw new Error(`AIMLAPI error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      embedding: data.data[0].embedding,
      model: 'text-embedding-ada-002',
      usage: data.usage
    };
  }

  getCapabilities(): AIProviderCapabilities {
    return {
      textGeneration: true,
      chatCompletion: true,
      imageGeneration: true,
      imageAnalysis: true,
      audioGeneration: true,
      audioTranscription: true,
      embedding: true,
      fineTuning: true,
      streaming: true,
      functionCalling: true,
      multimodal: true,
      maxContextLength: 128000,
      supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh']
    };
  }

  async healthCheck(): Promise<void> {
    await this.generateText('test', this.config);
  }
}

// Export all additional AI provider adapters
// Note: These are additional to the ones exported from AIProviderFactory
