import React, { useState, useRef, useEffect } from 'react';
import Groq from 'groq-sdk';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface DisasterInfo {
  probability: number;
  risk_level: string;
  recommendations: string[];
  analysis: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface DisasterChatbotProps {
  disaster: DisasterInfo;
  disasterType: string;
  isOpen: boolean;
  onClose: () => void;
}

const DisasterChatbot: React.FC<DisasterChatbotProps> = ({
  disaster,
  disasterType,
  isOpen,
  onClose
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [groqClient, setGroqClient] = useState<Groq | null>(null);

  useEffect(() => {
    // Initialize Groq client
    // Note: In a real app, you'd want to handle the API key more securely
    const apiKey = "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";
    if (apiKey && apiKey !== 'your-groq-api-key-here') {
      setGroqClient(new Groq({ apiKey, dangerouslyAllowBrowser: true }));
    }

    // Add welcome message when chatbot opens
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `## Welcome to ${disasterType.charAt(0).toUpperCase() + disasterType.slice(1)} Assistant! 👋

I'm here to help you with questions about **${disasterType}** disasters. You can ask me about:

- **Safety measures** and preparation tips
- **Risk factors** and current threat levels  
- **Emergency procedures** and evacuation plans
- **Specific recommendations** for your area

*How can I assist you today?*`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, disasterType, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getDisasterIcon = (disasterType: string) => {
    switch (disasterType.toLowerCase()) {
      case 'floods':
        return '🌊';
      case 'cyclone':
        return '🌪️';
      case 'earthquakes':
        return '🌍';
      case 'droughts':
        return '🌵';
      case 'landslides':
        return '⛰️';
      default:
        return '⚠️';
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      let response;
      
      if (groqClient) {
        // Use Groq API
        const systemPrompt = `You are a helpful disaster preparedness assistant. The user is asking about ${disasterType} disasters. 
        
        Current disaster information:
        - Risk Level: ${disaster.risk_level}
        - Probability: ${(disaster.probability * 100).toFixed(1)}%
        - Analysis: ${disaster.analysis}
        - Recommendations: ${disaster.recommendations.join(', ')}
        
        Provide helpful, accurate, and practical advice about ${disasterType} disasters. Keep responses concise but informative. Focus on safety, preparation, and practical steps people can take.
        
        Please format your responses using markdown for better readability:
        - Use **bold** for important points
        - Use *italics* for emphasis
        - Use bullet points (-) for lists
        - Use numbered lists (1.) for step-by-step instructions
        - Use \`code\` for specific terms or commands
        - Use headers (## Header) for organizing information
        
        Make your responses visually appealing and easy to read.`;

        const completion = await groqClient.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: inputMessage }
          ],
          model: 'llama3-8b-8192',
          temperature: 0.7,
          max_tokens: 500,
        });

        response = completion.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response. Please try again.';
      } else {
        // Fallback response when Groq API is not available
        response = getBasicResponse(inputMessage, disasterType);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again or contact support if the problem persists.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getBasicResponse = (message: string, disasterType: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('preparation') || lowerMessage.includes('prepare')) {
      return `## ${disasterType.charAt(0).toUpperCase() + disasterType.slice(1)} Preparation

**Current Risk Level**: ${disaster.risk_level} (${(disaster.probability * 100).toFixed(1)}% probability)

**Key Recommendations:**
- ${disaster.recommendations.slice(0, 3).join('\n- ')}

*Stay prepared and stay safe!*`;
    }
    
    if (lowerMessage.includes('safety') || lowerMessage.includes('safe')) {
      return `## Safety Information for ${disasterType.charAt(0).toUpperCase() + disasterType.slice(1)}

**Analysis**: ${disaster.analysis}

**Important Safety Notes:**
- Follow local emergency protocols
- Stay informed about weather conditions
- Have an emergency kit ready
- Know your evacuation routes

*Your safety is the top priority.*`;
    }
    
    if (lowerMessage.includes('risk') || lowerMessage.includes('danger')) {
      return `## Risk Assessment for ${disasterType.charAt(0).toUpperCase() + disasterType.slice(1)}

**Current Risk Level**: **${disaster.risk_level}**
**Probability**: ${(disaster.probability * 100).toFixed(1)}%

**Analysis**: ${disaster.analysis}

*This assessment is based on current conditions and historical data.*`;
    }
    
    return `## ${disasterType.charAt(0).toUpperCase() + disasterType.slice(1)} Information

**Current Risk Level**: ${disaster.risk_level}

**Key Recommendations:**
- ${disaster.recommendations.slice(0, 2).join('\n- ')}

*For more specific information, please rephrase your question or ask about preparation, safety, or risk assessment.*`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[10000] flex items-center justify-center p-4">
      <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getDisasterIcon(disasterType)}</span>
            <h2 className="text-lg font-semibold">
              {disasterType.charAt(0).toUpperCase() + disasterType.slice(1)} Assistant
            </h2>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-circle btn-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 chatbot-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-content'
                    : 'bg-base-200 text-base-content'
                }`}
              >
                <div className="text-sm">
                  {message.role === 'assistant' ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        // Custom components for better styling
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc list-inside mb-2 last:mb-0 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside mb-2 last:mb-0 space-y-1">{children}</ol>,
                        li: ({ children }) => <li className="ml-2">{children}</li>,
                        strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>,
                        code: ({ children }) => (
                          <code className="bg-base-300 px-1 py-0.5 rounded text-xs font-mono">
                            {children}
                          </code>
                        ),
                        pre: ({ children }) => (
                          <div className="relative group">
                            <pre className="bg-base-300 p-2 rounded text-xs font-mono overflow-x-auto mb-2 last:mb-0">
                              {children}
                            </pre>
                            <button
                              onClick={() => {
                                const codeText = typeof children === 'string' ? children : 
                                  (children as React.ReactElement)?.props?.children || 
                                  String(children);
                                navigator.clipboard.writeText(String(codeText));
                              }}
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity btn btn-xs btn-ghost"
                              title="Copy code"
                            >
                              📋
                            </button>
                          </div>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-base-300 pl-3 italic mb-2 last:mb-0">
                            {children}
                          </blockquote>
                        ),
                        h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
                        a: ({ href, children }) => (
                          <a href={href} className="text-primary underline hover:no-underline" target="_blank" rel="noopener noreferrer">
                            {children}
                          </a>
                        ),
                        table: ({ children }) => (
                          <table className="table table-xs border-collapse border border-base-300 mb-2 last:mb-0">
                            {children}
                          </table>
                        ),
                        th: ({ children }) => (
                          <th className="border border-base-300 px-2 py-1 bg-base-300 font-semibold text-left">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="border border-base-300 px-2 py-1">
                            {children}
                          </td>
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    <p>{message.content}</p>
                  )}
                </div>
                <div className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-base-200 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="loading loading-dots loading-sm"></span>
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Ask me about ${disasterType} safety, preparation, or risks...`}
              className="textarea textarea-bordered flex-1 resize-none"
              rows={2}
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="btn btn-primary"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          
          {!groqClient && (
            <div className="mt-2 text-xs text-warning flex items-center gap-2">
              <span>⚠️</span>
              <span>AI assistant is running in demo mode. Add your Groq API key to enable full functionality.</span>
              <a 
                href="https://console.groq.com/keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary underline hover:no-underline"
              >
                Get API Key
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisasterChatbot;
