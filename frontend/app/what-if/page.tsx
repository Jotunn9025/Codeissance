"use client";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  Bot, 
  User, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Trash2,
  MessageSquare,
  Brain,
  BarChart3
} from "lucide-react";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  analysis?: {
    scenario: {
      type: string;
      parameters: any;
      description: string;
    };
    prediction: {
      sentiment: number;
      confidence: number;
      magnitude: number;
      direction: string;
      explanation: string;
    };
  };
}

export default function WhatIfPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('session_loading');
  const [canScrollUp, setCanScrollUp] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      setCanScrollUp(scrollTop > 100);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Generate session ID only on client side to avoid hydration mismatch
    setSessionId(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    
    // Add welcome message
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm your What-If Analysis AI assistant. I can help you simulate various market scenarios and predict their sentiment impact. Try asking me things like:\n\n• \"What if Tesla stock crashes by 30%?\"\n• \"What if Apple launches a new iPhone?\"\n• \"What if the Fed raises interest rates by 2%?\"\n• \"What if there's a new regulation on AI companies?\"\n\nWhat scenario would you like to explore?",
      timestamp: new Date()
    }]);
  }, []);

  const getSentimentIcon = (sentiment: number) => {
    if (sentiment > 0.1) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (sentiment < -0.1) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-yellow-500" />;
  };

  const getSentimentEmoji = (sentiment: number) => {
    if (sentiment > 0.1) return "📈";
    if (sentiment < -0.1) return "📉";
    return "➖";
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.1) return "text-green-600 bg-green-50 border-green-200";
    if (sentiment < -0.1) return "text-red-600 bg-red-50 border-red-200";
    return "text-yellow-600 bg-yellow-50 border-yellow-200";
  };

  const formatSentiment = (sentiment: number) => {
    return (sentiment * 100).toFixed(1) + "%";
  };

  const renderMarkdown = (text: string) => {
    // Simple markdown renderer for basic formatting
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>') // Italic
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">$1</code>') // Inline code
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>') // H3 headers
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>') // H2 headers
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>') // H1 headers
      .replace(/^- (.*$)/gm, '<li class="ml-4">• $1</li>') // Bullet points
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-4">$1</li>') // Numbered lists
      .replace(/\n\n/g, '</p><p class="mt-2">') // Paragraph breaks
      .replace(/\n/g, '<br>') // Line breaks
      .replace(/^(.*)$/gm, '<p class="mb-2">$1</p>'); // Wrap in paragraphs
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || sessionId === 'session_loading') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/v1/whatif/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput: input.trim(),
          sessionId: sessionId
        }),
      });

      const data = await response.json();

      if (data.success) {
        let assistantMessage: Message;
        
        if (data.processing_type === 'scenario') {
          // Handle scenario analysis response
          assistantMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `I've analyzed your scenario: **${data.scenario.description}**

**Sentiment Prediction:**
${getSentimentEmoji(data.prediction.sentiment)} **${formatSentiment(data.prediction.sentiment)}** (${data.prediction.direction})
Confidence: ${(data.prediction.confidence * 100).toFixed(0)}%

**Explanation:** ${data.prediction.explanation}

**Scenario Details:**
- Type: ${data.scenario.type.replace('_', ' ').toUpperCase()}
- Parameters: ${JSON.stringify(data.scenario.parameters, null, 2)}

Would you like to explore another scenario or ask for more details about this analysis?`,
            timestamp: new Date(),
            analysis: data
          };
        } else if (data.processing_type === 'conversational') {
          // Handle conversational response
          let content = data.message;
          
          // Add suggestions if available
          if (data.suggestions && data.suggestions.length > 0) {
            content += `\n\n**Suggestions:**\n`;
            data.suggestions.forEach((suggestion: string, index: number) => {
              content += `${index + 1}. ${suggestion}\n`;
            });
          }
          
          assistantMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: content,
            timestamp: new Date()
          };
        } else {
          // Fallback for unknown response type
          assistantMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.message || 'I received an unexpected response. Please try again.',
            timestamp: new Date()
          };
        }

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `I encountered an error analyzing your scenario: ${data.error}

Please try rephrasing your question or ask about a different scenario.`,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I'm having trouble connecting to the analysis service. Please check your connection and try again.`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = async () => {
    if (sessionId === 'session_loading') return;
    
    try {
      await fetch('/api/v1/whatif/conversation/clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });
    } catch (error) {
      console.error('Failed to clear conversation:', error);
    }
    
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm your What-If Analysis AI assistant. I can help you simulate various market scenarios and predict their sentiment impact. Try asking me things like:\n\n• \"What if Tesla stock crashes by 30%?\"\n• \"What if Apple launches a new iPhone?\"\n• \"What if the Fed raises interest rates by 2%?\"\n• \"What if there's a new regulation on AI companies?\"\n\nWhat scenario would you like to explore?",
      timestamp: new Date()
    }]);
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header Box */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Brain className="h-8 w-8" />
                What-If Analysis Chat
              </h1>
              <p className="text-muted-foreground">AI-powered market scenario simulation and sentiment prediction</p>
        </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearConversation}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear Chat
                </Button>
          </div>
              </CardContent>
            </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Chat Box */}
        <div className="lg:col-span-3">
          <Card className="h-[80vh] min-h-[600px] flex flex-col">
            <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Chat with AI Analyst
                </CardTitle>
              </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
              <div 
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto scroll-smooth relative" 
                onScroll={handleScroll}
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#d1d5db #f3f4f6'
                }}
              >
                <div className="p-4 pb-8 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      
                      <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                        <div
                          className={`rounded-lg px-4 py-3 ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <div 
                            className="text-sm"
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
                          />
                          
                          {message.analysis && (
                            <div className="mt-3 pt-3 border-t border-border/50">
                              <div className="flex items-center gap-2 mb-2">
                                <BarChart3 className="h-4 w-4" />
                                <span className="text-xs font-medium">Analysis Results</span>
                              </div>
                              
                              <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-md border text-xs font-medium ${getSentimentColor(message.analysis.prediction.sentiment)}`}>
                                {getSentimentIcon(message.analysis.prediction.sentiment)}
                                {formatSentiment(message.analysis.prediction.sentiment)}
                                <span className="opacity-75">
                                  ({message.analysis.prediction.confidence * 100}% confidence)
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-xs text-muted-foreground mt-1 px-1">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
          </div>

                      {message.role === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-primary" />
                          </div>
                      <div className="bg-muted rounded-lg px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          Analyzing scenario...
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Scroll to bottom button */}
                {canScrollUp && (
                  <div className="absolute bottom-20 right-4">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={scrollToBottom}
                      className="rounded-full shadow-lg"
                    >
                      <TrendingDown className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Input Box */}
              <Card className="border-0 border-t rounded-none">
                <CardContent className="p-4">
                  <div className="flex gap-2">
                    <Input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask about any market scenario... (e.g., 'What if Tesla stock crashes by 30%?')"
                      disabled={isLoading || sessionId === 'session_loading'}
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmit(e);
                        }
                      }}
                    />
                    <Button 
                      onClick={handleSubmit}
                      disabled={isLoading || !input.trim() || sessionId === 'session_loading'}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Boxes */}
        <div className="lg:col-span-1 space-y-6">
          {/* Session Stats Box */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Session Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Messages</span>
                  <Badge variant="secondary">{messages.length - 1}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Analyses Done</span>
                  <Badge variant="secondary">{messages.filter(m => m.analysis).length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Session ID</span>
                  <Badge variant="outline" className="text-xs">{sessionId.slice(-6)}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Examples Box */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Examples</CardTitle>
                    </CardHeader>
                    <CardContent>
              <div className="space-y-2">
                {[
                  "What if Tesla stock crashes by 30%?",
                  "What if Apple launches a new iPhone?",
                  "What if the Fed raises rates by 2%?",
                  "What if there's new AI regulation?",
                  "What if Amazon beats earnings by 15%?",
                  "What if there's a major data breach?"
                ].map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setInput(example)}
                    disabled={isLoading || sessionId === 'session_loading'}
                    className="w-full text-left justify-start h-auto py-2 text-xs"
                  >
                    {example}
                      </Button>
                ))}
              </div>
                    </CardContent>
                  </Card>

          {/* Tips Box */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>• Be specific with percentages and numbers</p>
                <p>• Mention company names clearly</p>
                <p>• Include timeframes if relevant</p>
                <p>• Ask about regulatory changes</p>
                <p>• Consider market events</p>
            </div>
            </CardContent>
          </Card>

          {/* Analysis History Box */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {messages.filter(m => m.analysis).slice(-3).map((message, index) => (
                  <div key={message.id} className="p-2 border rounded text-xs">
                    <div className="flex items-center gap-1 mb-1">
                      {getSentimentIcon(message.analysis!.prediction.sentiment)}
                      <span className="font-medium">
                        {formatSentiment(message.analysis!.prediction.sentiment)}
                      </span>
                    </div>
                    <div className="text-muted-foreground truncate">
                      {message.analysis!.scenario.description}
                    </div>
                  </div>
                ))}
                {messages.filter(m => m.analysis).length === 0 && (
                  <p className="text-muted-foreground text-xs">No analyses yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
    </main>
  );
}