import React, { useState } from 'react';
// @ts-ignore
import { BrolostackProvider, useBrolostackStore, useBrolostackState } from '../../src/react/BrolostackProvider';
import './App.css';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatState {
  messages: ChatMessage[];
  addMessage: (role: 'user' | 'assistant', content: string) => void;
  clearMessages: () => void;
  isProcessing: boolean;
  setProcessing: (processing: boolean) => void;
}

function ChatApp() {
  const chatStore = useBrolostackStore('chat');
  const messages = useBrolostackState('chat', (state: any) => state.messages);
  const isProcessing = useBrolostackState('chat', (state: any) => state.isProcessing);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isProcessing) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    // Add user message
    chatStore.addMessage('user', userMessage);
    chatStore.setProcessing(true);

    try {
      // Simulate AI response (in a real app, this would call the AI agent)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const aiResponse = `I understand you said: "${userMessage}". This is a simulated AI response. In a real implementation, this would be processed by an AI agent with access to your local data and context.`;
      
      chatStore.addMessage('assistant', aiResponse);
    } catch (error) {
      chatStore.addMessage('assistant', 'Sorry, I encountered an error processing your message.');
    } finally {
      chatStore.setProcessing(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🤖 Brolostack AI Chat</h1>
        <p>AI-powered chat with local memory and context</p>
      </header>

      <main className="app-main">
        <div className="chat-container">
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="empty-state">
                <h3>Welcome to Brolostack AI Chat!</h3>
                <p>Start a conversation with the AI. Your chat history is stored locally in your browser.</p>
                <div className="features">
                  <div className="feature">
                    <span className="feature-icon">🧠</span>
                    <span>AI Memory</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">🔒</span>
                    <span>Local Storage</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">⚡</span>
                    <span>Real-time</span>
                  </div>
                </div>
              </div>
            ) : (
              messages.map((message: any) => (
                <div key={message.id} className={`message ${message.role}`}>
                  <div className="message-header">
                    <span className="message-role">
                      {message.role === 'user' ? '👤 You' : '🤖 AI'}
                    </span>
                    <span className="message-time">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="message-content">
                    {message.content}
                  </div>
                </div>
              ))
            )}
            {isProcessing && (
              <div className="message assistant">
                <div className="message-header">
                  <span className="message-role">🤖 AI</span>
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="chat-input-form">
            <div className="input-container">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="chat-input"
                disabled={isProcessing}
              />
              <button
                type="submit"
                className="send-button"
                disabled={!inputMessage.trim() || isProcessing}
              >
                {isProcessing ? '⏳' : '📤'}
              </button>
            </div>
          </form>
        </div>

        <div className="chat-actions">
          <button
            onClick={() => chatStore.clearMessages()}
            className="clear-button"
            disabled={messages.length === 0}
          >
            Clear Chat History
          </button>
        </div>
      </main>

      <footer className="app-footer">
        <p>Powered by Brolostack AI Framework</p>
        <p>Your conversations are stored locally and never leave your device</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrolostackProvider appName="ai-chat-app" config={{}}>
      <ChatApp />
    </BrolostackProvider>
  );
}

export default App;
